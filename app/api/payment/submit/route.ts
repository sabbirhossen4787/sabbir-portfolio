import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import fs from 'fs/promises';
import path from 'path';
import { EmailService } from '@/lib/licensing/emailService';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
    try {
        await initDb();
        const db = getDb();

        const formData = await req.formData();
        const orderId = String(formData.get('orderId') || '').trim();
        const customerName = String(formData.get('customerName') || '').trim();
        const customerEmail = String(formData.get('customerEmail') || '').trim().toLowerCase();
        const paymentMethod = String(formData.get('paymentMethod') || 'bkash').trim().toLowerCase();
        const senderNumber = String(formData.get('senderNumber') || '').trim();
        const transactionId = String(formData.get('transactionId') || '').trim().toUpperCase();
        const amountPaid = String(formData.get('amountPaid') || '').trim();
        const customerNote = String(formData.get('customerNote') || '').trim();
        const file = formData.get('screenshot') as File | null;

        let finalOrderId = orderId;
        if (!finalOrderId) {
            const planId = String(formData.get('planId') || '').trim();
            if (planId && customerEmail) {
                const planRes = await db.execute({
                    sql: "SELECT * FROM plans WHERE (id = ? OR slug = ?) AND active = 1",
                    args: [planId, planId]
                });
                const plan = planRes.rows[0];
                if (plan) {
                    let userId = '';
                    const userRes = await db.execute({
                        sql: "SELECT id FROM users WHERE email = ?",
                        args: [customerEmail]
                    });
                    const now = new Date().toISOString();
                    if (userRes.rows[0]) {
                        userId = String(userRes.rows[0].id);
                    } else {
                        userId = `usr_${Math.random().toString(36).substring(2, 9)}`;
                        await db.execute({
                            sql: "INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                            args: [userId, customerEmail, customerName || 'Valued Creator', 'customer', now, now]
                        });
                    }
                    finalOrderId = `ord_${Math.random().toString(36).substring(2, 9)}`;
                    await db.execute({
                        sql: "INSERT INTO orders (id, user_id, plan_id, status, amount_cents, currency, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)",
                        args: [finalOrderId, userId, plan.id, plan.price_cents, plan.currency, now, now]
                    });
                }
            }
        }

        // 1. Validate required fields
        if (!finalOrderId) {
            return NextResponse.json({ error: 'Order reference ID or plan selection is required' }, { status: 400 });
        }
        if (!customerEmail || !customerEmail.includes('@')) {
            return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
        }
        if (!senderNumber) {
            return NextResponse.json({ error: 'Sender phone / account number is required' }, { status: 400 });
        }
        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID (TrxID) or bank reference is required' }, { status: 400 });
        }

        // 2. Lookup order
        const orderRes = await db.execute({
            sql: "SELECT * FROM orders WHERE id = ?",
            args: [finalOrderId]
        });

        const order = orderRes.rows[0];
        if (!order) {
            return NextResponse.json({ error: 'Order not found. Please initiate checkout first.' }, { status: 404 });
        }

        if (order.status === 'completed') {
            return NextResponse.json({
                error: 'This order is already completed and fulfilled. Check your email or customer dashboard for your license.'
            }, { status: 400 });
        }

        // 3. Process and validate payment screenshot file if uploaded
        let screenshotUrl = String(order.screenshot_url || '');
        if (file && typeof file === 'object' && 'size' in file && file.size > 0) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: 'Screenshot file size exceeds 5 MB limit' }, { status: 400 });
            }

            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, and WebP images are supported.' }, { status: 400 });
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = path.join(process.cwd(), 'data', 'receipts');
            await fs.mkdir(uploadDir, { recursive: true });

            const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
            const cleanOrderId = finalOrderId.replace(/[^a-zA-Z0-9_-]/g, '');
            const filename = `receipt_${cleanOrderId}_${Date.now()}.${ext}`;
            const filepath = path.join(uploadDir, filename);

            await fs.writeFile(filepath, buffer);
            screenshotUrl = `/api/payment/receipt/${filename}?orderId=${encodeURIComponent(finalOrderId)}`;
        }

        const now = new Date().toISOString();

        // 4. Update order with payment submission details
        await db.execute({
            sql: `UPDATE orders SET
                status = 'payment_submitted',
                payment_method = ?,
                sender_number = ?,
                transaction_id = ?,
                amount_paid = ?,
                screenshot_url = ?,
                customer_note = ?,
                updated_at = ?
            WHERE id = ?`,
            args: [
                paymentMethod,
                senderNumber,
                transactionId,
                amountPaid || null,
                screenshotUrl || null,
                customerNote || null,
                now,
                finalOrderId
            ]
        });

        // 5. Update user name if provided
        if (order.user_id && customerName) {
            await db.execute({
                sql: "UPDATE users SET name = ?, updated_at = ? WHERE id = ?",
                args: [customerName, now, order.user_id]
            });
        }

        // 6. Record audit log
        const logId = `aud_${Math.random().toString(36).substring(2, 9)}`;
        await db.execute({
            sql: "INSERT INTO audit_logs (id, user_id, action, result, details, created_at) VALUES (?, ?, 'PAYMENT_SUBMITTED', 'PENDING', ?, ?)",
            args: [
                logId,
                String(order.user_id || ''),
                JSON.stringify({ orderId: finalOrderId, paymentMethod, transactionId, senderNumber, amountPaid }),
                now
            ]
        });

        // 7. Dispatch admin notification email (failsafe, non-blocking)
        try {
            await EmailService.sendAdminPaymentSubmittedNotification({
                orderId: finalOrderId,
                customerName: customerName || 'Valued Creator',
                customerEmail,
                paymentMethod,
                amountPaid,
                senderNumber,
                transactionId,
                customerNote,
                screenshotUrl
            });
        } catch (emailErr) {
            console.warn('[PaymentSubmit] Admin notification delivery notice:', emailErr);
        }

        return NextResponse.json({
            success: true,
            orderId: finalOrderId,
            status: 'payment_submitted',
            message: 'Your payment details have been submitted for verification. Admin will verify and activate your license shortly.',
            screenshotUrl: screenshotUrl || undefined
        });
    } catch (err: unknown) {
        console.error("Payment submission error:", err);
        const msg = err instanceof Error ? err.message : 'Failed to submit payment details';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
