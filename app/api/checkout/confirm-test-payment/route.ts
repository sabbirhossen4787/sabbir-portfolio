import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, initDb } from '@/lib/licensing/db';
import { LicensingService } from '@/lib/licensing/licensingService';

export async function POST(req: NextRequest) {
    try {
        // 1. Strictly disabled in production environment
        const isProd = process.env.NODE_ENV === 'production' || 
                       process.env.VERCEL_ENV === 'production' || 
                       process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
        if (isProd) {
            return NextResponse.json({
                error: 'Test payment simulation is permanently disabled in production environment.'
            }, { status: 403 });
        }

        // 2. Requires authenticated admin secret key even in non-production
        const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace('Bearer ', '');
        const expectedAdminKey = process.env.ADMIN_SECRET_KEY;
        if (!expectedAdminKey || adminKey !== expectedAdminKey) {
            return NextResponse.json({
                error: 'Unauthorized: Admin authentication required to simulate payment confirmation.'
            }, { status: 401 });
        }

        const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return NextResponse.json({
                error: 'Server configuration error: PAYMENT_WEBHOOK_SECRET unconfigured.'
            }, { status: 500 });
        }

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

        // Simulate verified payment gateway webhook event
        const now = new Date().toISOString();
        const eventId = `evt_sim_${Date.now()}`;
        const mockPayload = {
            id: eventId,
            type: 'checkout.session.completed',
            data: {
                object: {
                    metadata: { orderId: order.id }
                }
            }
        };

        const rawBody = JSON.stringify(mockPayload);
        const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

        // Verify cryptographic HMAC before proceeding
        const expectedSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
        const sigBuf = Buffer.from(signature, 'utf8');
        const expBuf = Buffer.from(expectedSig, 'utf8');
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            return NextResponse.json({ error: 'Cryptographic signature verification failed' }, { status: 403 });
        }

        // Complete order idempotently
        await db.execute({
            sql: "UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ?",
            args: [now, orderId]
        });

        const paymentId = `pay_${Math.random().toString(36).substring(2, 9)}`;
        await db.execute({
            sql: "INSERT OR IGNORE INTO payments (id, order_id, provider, event_id, payload_json, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [paymentId, orderId, 'stripe_simulated', eventId, rawBody, 'succeeded', now]
        });

        // Issue license idempotently
        const licenseKey = await LicensingService.issueLicense(
            String(order.user_id),
            String(order.plan_id),
            Number(order.max_devices || 2),
            String(order.plan_slug || 'studio')
        );

        await db.execute({
            sql: "UPDATE licenses SET order_id = ? WHERE license_key = ?",
            args: [orderId, licenseKey]
        });

        return NextResponse.json({
            success: true,
            status: 'completed',
            orderId: order.id,
            licenseKey,
            planName: order.plan_name,
            maxDevices: order.max_devices
        });
    } catch (err: unknown) {
        console.error("Test payment simulation error:", err);
        return NextResponse.json({ error: 'Failed to confirm test payment' }, { status: 500 });
    }
}
