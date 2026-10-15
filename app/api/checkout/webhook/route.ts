import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, initDb } from '@/lib/licensing/db';
import { LicensingService } from '@/lib/licensing/licensingService';

function getPaymentWebhookSecret(): string {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) {
        throw new Error("Server configuration error: PAYMENT_WEBHOOK_SECRET is not configured.");
    }
    return secret;
}

export async function POST(req: NextRequest) {
    try {
        const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return NextResponse.json({ error: 'Server configuration error: PAYMENT_WEBHOOK_SECRET is not configured.' }, { status: 500 });
        }

        await initDb();
        const db = getDb();
        const rawBody = await req.text();
        const signature = req.headers.get('stripe-signature') || req.headers.get('x-signature') || '';

        // 1. Signature Verification
        if (!signature) {
            return NextResponse.json({ error: 'Missing payment provider signature' }, { status: 401 });
        }

        const sigClean = signature.replace(/^v1=/, '').split(',')[0].trim();
        const expectedSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
        const sigBuf = Buffer.from(sigClean, 'utf8');
        const expBuf = Buffer.from(expectedSig, 'utf8');
        const isValidSignature = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

        if (!isValidSignature) {
            return NextResponse.json({ error: 'Cryptographic signature verification failed' }, { status: 403 });
        }

        // 2. Parse Event Payload
        const event = JSON.parse(rawBody);
        const eventId = event.id || `evt_${Date.now()}`;
        const eventType = event.type || event.event;

        if (eventType !== 'checkout.session.completed' && eventType !== 'payment_intent.succeeded') {
            return NextResponse.json({ received: true, note: 'Event ignored' });
        }

        const orderId = event.data?.object?.metadata?.orderId || event.data?.orderId;
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID metadata missing in event' }, { status: 400 });
        }

        // 3. Idempotent Payment & Order Check
        const orderRes = await db.execute({
            sql: "SELECT * FROM orders WHERE id = ?",
            args: [orderId]
        });

        const order = orderRes.rows[0];
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // If order already completed, return existing license idempotently
        if (order.status === 'completed' || order.status === 'paid') {
            const existingLic = await db.execute({
                sql: "SELECT license_key FROM licenses WHERE order_id = ? OR user_id = ?",
                args: [order.id, order.user_id]
            });
            return NextResponse.json({
                received: true,
                idempotent: true,
                licenseKey: existingLic.rows[0]?.license_key
            });
        }

        const now = new Date().toISOString();

        // 4. Mark Order Completed
        await db.execute({
            sql: "UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ?",
            args: [now, orderId]
        });

        // 5. Record Payment in payments table
        const paymentId = `pay_${Math.random().toString(36).substring(2, 9)}`;
        await db.execute({
            sql: "INSERT OR IGNORE INTO payments (id, order_id, provider, event_id, payload_json, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [paymentId, orderId, 'stripe', eventId, JSON.stringify(event), 'succeeded', now]
        });

        // 6. Issue Commercial License Key
        const planRes = await db.execute({
            sql: "SELECT * FROM plans WHERE id = ?",
            args: [order.plan_id]
        });
        const plan = planRes.rows[0];

        const licenseKey = await LicensingService.issueLicense(
            String(order.user_id),
            String(order.plan_id),
            Number(plan?.max_devices || 2),
            String(plan?.slug || 'studio')
        );

        await db.execute({
            sql: "UPDATE licenses SET order_id = ? WHERE license_key = ?",
            args: [orderId, licenseKey]
        });

        return NextResponse.json({
            received: true,
            status: 'completed',
            orderId,
            licenseKey
        });
    } catch (err: unknown) {
        console.error("Webhook processing error:", err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
