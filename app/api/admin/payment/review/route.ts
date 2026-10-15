import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import { verifySessionToken } from '@/lib/auth';
import { LicensingService } from '@/lib/licensing/licensingService';
import { EmailService } from '@/lib/licensing/emailService';

function checkAdminAuth(req: NextRequest): { authorized: boolean; adminIdentifier?: string } {
    const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (expectedKey && adminKey && adminKey === expectedKey) {
        return { authorized: true, adminIdentifier: 'Admin (API Key)' };
    }

    const sessionCookie = req.cookies.get('admin_session')?.value;
    if (sessionCookie) {
        const { valid, username } = verifySessionToken(sessionCookie);
        if (valid) return { authorized: true, adminIdentifier: username || 'Admin' };
    }

    return { authorized: false };
}

export async function POST(req: NextRequest) {
    try {
        const auth = checkAdminAuth(req);
        if (!auth.authorized) {
            return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();
        const body = await req.json();

        const {
            orderId,
            action, // 'approve' | 'reject' | 'request_screenshot'
            adminNote = '',
            reviewer = auth.adminIdentifier || 'Admin'
        } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // 1. Fetch Order and Plan Information
        const orderRes = await db.execute({
            sql: `SELECT o.*, u.email as customer_email, u.name as customer_name,
                         p.name as plan_name, p.slug as plan_slug, p.max_devices
                  FROM orders o
                  LEFT JOIN users u ON o.user_id = u.id
                  LEFT JOIN plans p ON o.plan_id = p.id
                  WHERE o.id = ?`,
            args: [orderId]
        });

        const order = orderRes.rows[0];
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 2. Handle Action: REJECT
        if (action === 'reject') {
            await db.execute({
                sql: "UPDATE orders SET status = 'rejected', admin_note = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?",
                args: [adminNote || 'Payment details could not be verified.', reviewer, now, orderId]
            });

            await db.execute({
                sql: "INSERT INTO audit_logs (id, user_id, action, result, details, created_at) VALUES (?, ?, 'PAYMENT_REJECTED', 'SUCCESS', ?, ?)",
                args: [
                    `aud_${Math.random().toString(36).substring(2, 9)}`,
                    String(order.user_id || ''),
                    JSON.stringify({ orderId, reviewer, adminNote }),
                    now
                ]
            });

            return NextResponse.json({
                success: true,
                status: 'rejected',
                message: `Order #${orderId} has been marked as rejected.`
            });
        }

        // 3. Handle Action: REQUEST_SCREENSHOT
        if (action === 'request_screenshot') {
            await db.execute({
                sql: "UPDATE orders SET status = 'needs_screenshot', admin_note = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?",
                args: [adminNote || 'Please provide a clear screenshot of the transaction confirmation.', reviewer, now, orderId]
            });

            return NextResponse.json({
                success: true,
                status: 'needs_screenshot',
                message: `Order #${orderId} marked as requiring a new screenshot.`
            });
        }

        // 4. Handle Action: APPROVE
        if (action === 'approve') {
            // Check if already completed (idempotency check)
            if (order.status === 'completed') {
                const existingLic = await db.execute({
                    sql: "SELECT license_key FROM licenses WHERE order_id = ?",
                    args: [orderId]
                });
                return NextResponse.json({
                    success: true,
                    status: 'completed',
                    idempotent: true,
                    licenseKey: existingLic.rows[0]?.license_key,
                    message: `Order #${orderId} is already approved and fulfilled.`
                });
            }

            // ATOMIC TRANSITION: only transition from pending / payment_submitted / needs_screenshot
            const updateRes = await db.execute({
                sql: `UPDATE orders SET
                    status = 'completed',
                    admin_note = ?,
                    reviewed_by = ?,
                    reviewed_at = ?,
                    updated_at = ?
                WHERE id = ? AND status != 'completed'`,
                args: [adminNote || 'Payment verified and approved by admin.', reviewer, now, orderId]
            });

            if (updateRes.rowsAffected === 0) {
                // Another concurrent request may have completed it
                const existingLic = await db.execute({
                    sql: "SELECT license_key FROM licenses WHERE order_id = ?",
                    args: [orderId]
                });
                return NextResponse.json({
                    success: true,
                    status: 'completed',
                    idempotent: true,
                    licenseKey: existingLic.rows[0]?.license_key,
                    message: `Order #${orderId} was fulfilled concurrently.`
                });
            }

            // Record in payments table
            const paymentId = `pay_manual_${Date.now()}`;
            await db.execute({
                sql: "INSERT OR IGNORE INTO payments (id, order_id, provider, event_id, payload_json, status, created_at) VALUES (?, ?, ?, ?, ?, 'succeeded', ?)",
                args: [
                    paymentId,
                    orderId,
                    String(order.payment_method || 'bkash'),
                    String(order.transaction_id || `trx_${Date.now()}`),
                    JSON.stringify({
                        reviewer,
                        adminNote,
                        senderNumber: order.sender_number,
                        transactionId: order.transaction_id,
                        amountPaid: order.amount_paid
                    }),
                    now
                ]
            });

            // 5. Generate Signed License Key via LicensingService
            const licenseKey = await LicensingService.issueLicense(
                String(order.user_id),
                String(order.plan_id),
                Number(order.max_devices || 2),
                String(order.plan_slug || 'studio_lifetime')
            );

            // Link license to order
            await db.execute({
                sql: "UPDATE licenses SET order_id = ? WHERE license_key = ?",
                args: [orderId, licenseKey]
            });

            // 6. Deliver License Email via EmailService
            let emailStatus = 'pending';
            let emailError: string | null = null;
            let emailMessageId: string | null = null;

            try {
                const emailResult = await EmailService.sendLicenseEmail({
                    to: String(order.customer_email),
                    customerName: String(order.customer_name || 'Valued Creator'),
                    orderId: String(orderId),
                    planName: String(order.plan_name || 'Studio Commercial'),
                    licenseKey,
                    maxDevices: Number(order.max_devices || 2),
                    tier: String(order.plan_slug || 'studio'),
                    expiresAt: null,
                    idempotencyKey: `license-approval-${orderId}`
                });

                emailStatus = emailResult.status;
                emailError = emailResult.error || null;
                emailMessageId = emailResult.messageId || null;
            } catch (err: unknown) {
                emailStatus = 'failed';
                emailError = err instanceof Error ? err.message : String(err);
            }

            // Update email delivery status on order
            await db.execute({
                sql: "UPDATE orders SET email_status = ?, email_sent_at = ?, email_error = ?, email_message_id = ? WHERE id = ?",
                args: [emailStatus, now, emailError, emailMessageId, orderId]
            });

            // Log admin audit
            await db.execute({
                sql: "INSERT INTO audit_logs (id, user_id, license_key, action, result, details, created_at) VALUES (?, ?, ?, 'ADMIN_PAYMENT_APPROVED', 'SUCCESS', ?, ?)",
                args: [
                    `aud_${Math.random().toString(36).substring(2, 9)}`,
                    String(order.user_id || ''),
                    licenseKey,
                    JSON.stringify({ orderId, reviewer, adminNote, emailStatus }),
                    now
                ]
            });

            return NextResponse.json({
                success: true,
                status: 'completed',
                orderId,
                licenseKey,
                emailStatus,
                emailMessageId,
                emailError,
                message: `Order #${orderId} approved successfully. License generated and email status: ${emailStatus}.`
            });
        }

        return NextResponse.json({ error: `Unknown review action: ${action}` }, { status: 400 });
    } catch (err: unknown) {
        console.error("Payment review execution error:", err);
        const msg = err instanceof Error ? err.message : 'Failed to process payment review';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
