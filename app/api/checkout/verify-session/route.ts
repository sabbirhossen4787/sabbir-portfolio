import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';

export async function POST(req: NextRequest) {
    try {
        await initDb();
        const db = getDb();
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const orderRes = await db.execute({
            sql: "SELECT o.*, p.name as plan_name, p.slug as plan_slug, p.max_devices FROM orders o LEFT JOIN plans p ON o.plan_id = p.id WHERE o.id = ?",
            args: [orderId]
        });

        const order = orderRes.rows[0];
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Orders can only be completed by verified payment provider webhooks
        if (order.status !== 'completed' && order.status !== 'paid') {
            return NextResponse.json({
                success: false,
                status: 'pending',
                message: 'Payment verification pending. Complete payment to receive your license key.'
            }, { status: 402 });
        }

        // Fetch the issued license key
        const licRes = await db.execute({
            sql: "SELECT license_key, tier, max_devices FROM licenses WHERE order_id = ? OR user_id = ? ORDER BY created_at DESC",
            args: [order.id, order.user_id]
        });

        const lic = licRes.rows[0];
        if (!lic) {
            return NextResponse.json({ error: 'License record not yet provisioned' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            status: 'completed',
            orderId: order.id,
            licenseKey: lic.license_key,
            planName: order.plan_name,
            maxDevices: lic.max_devices
        });
    } catch (err: unknown) {
        console.error("Session verification error:", err);
        return NextResponse.json({ error: 'Failed to verify checkout session' }, { status: 500 });
    }
}
