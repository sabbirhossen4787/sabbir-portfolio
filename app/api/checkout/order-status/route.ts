import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        await initDb();
        const db = getDb();

        const { searchParams } = new URL(req.url);
        const orderId = String(searchParams.get('orderId') || '').trim();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const res = await db.execute({
            sql: `SELECT 
                o.id as order_id, o.status, o.amount_cents, o.currency, o.payment_method,
                o.sender_number, o.transaction_id, o.amount_paid, o.screenshot_url,
                o.customer_note, o.admin_note, o.created_at, o.updated_at,
                o.email_status,
                u.email as customer_email, u.name as customer_name,
                p.name as plan_name, p.slug as plan_slug, p.max_devices,
                l.license_key, l.tier as license_tier, l.expires_at as license_expires_at
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

        return NextResponse.json({
            orderId: order.order_id,
            status: order.status,
            customerEmail: order.customer_email,
            customerName: order.customer_name,
            planName: order.plan_name,
            amountUsd: Number(order.amount_cents || 0) / 100,
            paymentMethod: order.payment_method,
            transactionId: order.transaction_id,
            senderNumber: order.sender_number,
            screenshotUrl: order.screenshot_url,
            adminNote: order.admin_note,
            emailStatus: order.email_status,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            // If completed, provide license key
            licenseKey: order.status === 'completed' ? order.license_key : undefined,
            maxDevices: order.max_devices,
            expiresAt: order.license_expires_at
        });
    } catch (err: unknown) {
        console.error("Order status lookup error:", err);
        return NextResponse.json({ error: 'Failed to lookup order status' }, { status: 500 });
    }
}
