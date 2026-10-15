import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import { verifySessionToken } from '@/lib/auth';
import { EmailService } from '@/lib/licensing/emailService';

function checkAdminAuth(req: NextRequest): boolean {
    const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (expectedKey && adminKey && adminKey === expectedKey) return true;

    const sessionCookie = req.cookies.get('admin_session')?.value;
    if (sessionCookie) {
        const { valid } = verifySessionToken(sessionCookie);
        if (valid) return true;
    }
    return false;
}

export async function POST(req: NextRequest) {
    try {
        if (!checkAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const res = await db.execute({
            sql: `SELECT o.*, u.email as customer_email, u.name as customer_name,
                         p.name as plan_name, p.slug as plan_slug, p.max_devices,
                         l.license_key, l.expires_at as license_expires_at
                  FROM orders o
                  LEFT JOIN users u ON o.user_id = u.id
                  LEFT JOIN plans p ON o.plan_id = p.id
                  LEFT JOIN licenses l ON l.order_id = o.id
                  WHERE o.id = ?`,
            args: [orderId]
        });

        const order = res.rows[0];
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status !== 'completed' || !order.license_key) {
            return NextResponse.json({ error: 'Order must be completed with an active license before sending email.' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const retryKey = `license-retry-${orderId}-${Date.now()}`;
        const emailResult = await EmailService.sendLicenseEmail({
            to: String(order.customer_email),
            customerName: String(order.customer_name || 'Valued Creator'),
            orderId: String(orderId),
            planName: String(order.plan_name || 'Studio Commercial'),
            licenseKey: String(order.license_key),
            maxDevices: Number(order.max_devices || 2),
            tier: String(order.plan_slug || 'studio'),
            expiresAt: order.license_expires_at ? String(order.license_expires_at) : null,
            idempotencyKey: retryKey
        });

        await db.execute({
            sql: "UPDATE orders SET email_status = ?, email_sent_at = ?, email_error = ?, email_message_id = ? WHERE id = ?",
            args: [emailResult.status, now, emailResult.error || null, emailResult.messageId || null, orderId]
        });

        await db.execute({
            sql: "INSERT INTO audit_logs (id, user_id, license_key, action, result, details, created_at) VALUES (?, ?, ?, 'ADMIN_RETRY_EMAIL', ?, ?, ?)",
            args: [
                `aud_${Math.random().toString(36).substring(2, 9)}`,
                String(order.user_id || ''),
                String(order.license_key),
                emailResult.success ? 'SUCCESS' : 'FAILED',
                JSON.stringify({ orderId, status: emailResult.status, error: emailResult.error, messageId: emailResult.messageId }),
                now
            ]
        });

        return NextResponse.json({
            success: emailResult.success,
            emailStatus: emailResult.status,
            messageId: emailResult.messageId,
            error: emailResult.error,
            message: emailResult.success
                ? `License email successfully dispatched to ${order.customer_email} (Resend ID: ${emailResult.messageId || 'accepted'}).`
                : `Email dispatch failed: ${emailResult.error || 'Provider unconfigured'}`
        });
    } catch (err: unknown) {
        console.error("Retry email error:", err);
        return NextResponse.json({ error: 'Failed to retry email delivery' }, { status: 500 });
    }
}
