import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import { verifySessionToken } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
    const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (expectedKey && adminKey && adminKey === expectedKey) {
        return true;
    }

    const sessionCookie = req.cookies.get('admin_session')?.value;
    if (sessionCookie) {
        const { valid } = verifySessionToken(sessionCookie);
        if (valid) return true;
    }

    return false;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        if (!checkAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') || 'all'; // 'pending' | 'submitted' | 'completed' | 'rejected' | 'all'

        let whereClause = "";
        const args: any[] = [];

        if (filter === 'submitted') {
            whereClause = "WHERE o.status = 'payment_submitted'";
        } else if (filter === 'pending') {
            whereClause = "WHERE o.status = 'pending' OR o.status = 'payment_submitted' OR o.status = 'needs_screenshot'";
        } else if (filter === 'completed') {
            whereClause = "WHERE o.status = 'completed'";
        } else if (filter === 'rejected') {
            whereClause = "WHERE o.status = 'rejected'";
        }

        const res = await db.execute({
            sql: `SELECT 
                o.id as order_id, o.status, o.amount_cents, o.currency, o.payment_method,
                o.sender_number, o.transaction_id, o.amount_paid, o.screenshot_url,
                o.customer_note, o.admin_note, o.reviewed_by, o.reviewed_at,
                o.email_status, o.email_sent_at, o.email_error, o.email_message_id,
                o.created_at, o.updated_at,
                u.email as customer_email, u.name as customer_name,
                p.name as plan_name, p.slug as plan_slug, p.max_devices,
                l.license_key
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN plans p ON o.plan_id = p.id
            LEFT JOIN licenses l ON l.order_id = o.id
            ${whereClause}
            ORDER BY o.created_at DESC`,
            args
        });

        const submissions = res.rows.map(r => ({
            id: r.order_id,
            status: r.status,
            amountUsd: Number(r.amount_cents || 0) / 100,
            currency: String(r.currency || 'usd').toUpperCase(),
            customerEmail: r.customer_email,
            customerName: r.customer_name,
            planName: r.plan_name,
            planSlug: r.plan_slug,
            maxDevices: r.max_devices,
            paymentMethod: r.payment_method || 'bkash',
            senderNumber: r.sender_number || '—',
            transactionId: r.transaction_id || '—',
            amountPaid: r.amount_paid || '—',
            screenshotUrl: r.screenshot_url,
            customerNote: r.customer_note,
            adminNote: r.admin_note,
            reviewedBy: r.reviewed_by,
            reviewedAt: r.reviewed_at,
            licenseKey: r.license_key,
            emailStatus: r.email_status || 'pending',
            emailSentAt: r.email_sent_at,
            emailError: r.email_error,
            emailMessageId: r.email_message_id,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));

        const countsRes = await db.execute(`
            SELECT 
                SUM(CASE WHEN status = 'payment_submitted' THEN 1 ELSE 0 END) as submitted_count,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
                COUNT(*) as total_count
            FROM orders
        `);

        return NextResponse.json({
            submissions,
            counts: {
                submitted: Number(countsRes.rows[0]?.submitted_count || 0),
                completed: Number(countsRes.rows[0]?.completed_count || 0),
                rejected: Number(countsRes.rows[0]?.rejected_count || 0),
                total: Number(countsRes.rows[0]?.total_count || 0)
            }
        });
    } catch (err: unknown) {
        console.error("Admin payment submissions error:", err);
        return NextResponse.json({ error: 'Failed to fetch payment submissions' }, { status: 500 });
    }
}
