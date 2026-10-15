import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Validates Resend Webhook signature if RESEND_WEBHOOK_SECRET is set in environment.
 * Uses HMAC-SHA256 svix-style verification.
 */
function verifyResendWebhook(rawBody: string, req: NextRequest): boolean {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
        // If no secret configured, accept in development or fail closed in production if desired
        return true;
    }

    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
        return false;
    }

    // Check timestamp freshness (within 5 minutes)
    const timestampSec = parseInt(svixTimestamp, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (isNaN(timestampSec) || Math.abs(nowSec - timestampSec) > 300) {
        return false;
    }

    // Sign formatted payload: id.timestamp.body
    const signaturePayload = `${svixId}.${svixTimestamp}.${rawBody}`;
    const secretKey = webhookSecret.startsWith('whsec_') ? webhookSecret.substring(6) : webhookSecret;
    const secretBytes = Buffer.from(secretKey, 'base64');

    const hmac = crypto.createHmac('sha256', secretBytes);
    hmac.update(signaturePayload);
    const expectedSig = hmac.digest('base64');

    // svix-signature may contain multiple signatures separated by space e.g. "v1,signature1 v1,signature2"
    const passedSigs = svixSignature.split(' ').map(s => s.replace(/^v1,/, ''));
    return passedSigs.some(sig => {
        try {
            return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
        } catch {
            return false;
        }
    });
}

/**
 * POST /api/email/webhook
 * Receives Resend webhook delivery notifications (e.g. email.delivered, email.bounced, email.complained).
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();

        if (!verifyResendWebhook(rawBody, req)) {
            return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
        }

        let event: any = null;
        try {
            event = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const eventType = String(event.type || '');
        const emailId = String(event.data?.email_id || event.data?.id || '');

        if (!emailId) {
            return NextResponse.json({ received: true, ignored: 'Missing email_id' });
        }

        await initDb();
        const db = getDb();
        const now = new Date().toISOString();

        let updatedStatus: 'delivered' | 'failed' | 'bounced' | null = null;
        if (eventType === 'email.delivered') {
            updatedStatus = 'delivered';
        } else if (eventType === 'email.bounced') {
            updatedStatus = 'bounced';
        } else if (eventType === 'email.complained') {
            updatedStatus = 'failed';
        }

        if (updatedStatus) {
            // Update order record where email_message_id matches
            await db.execute({
                sql: `UPDATE orders SET email_status = ?, updated_at = ? WHERE email_message_id = ?`,
                args: [updatedStatus, now, emailId]
            });

            // Log event in email_logs
            const logId = `eml_evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await db.execute({
                sql: `INSERT INTO email_logs (
                    id, order_id, recipient, template, provider, provider_message_id,
                    status, error, created_at
                ) VALUES (?, NULL, ?, 'webhook_event', 'resend', ?, ?, ?, ?)`,
                args: [
                    logId,
                    String(event.data?.to?.[0] || 'unknown'),
                    emailId,
                    updatedStatus,
                    eventType,
                    now
                ]
            });
        }

        return NextResponse.json({ received: true, eventType, emailId, updatedStatus });
    } catch (err: unknown) {
        console.error('Webhook execution error:', err);
        return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
}
