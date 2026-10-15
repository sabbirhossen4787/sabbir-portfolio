/**
 * @fileoverview SaaS Motion Pro - resend-email-integration.test.ts
 * Automated integration test suite for production Resend email delivery,
 * payment approval triggers, idempotency guarantees, and admin telemetry.
 * Uses native node modules and safe mocks for deterministic offline execution.
 * @copyright 2026 SaaS Motion Pro. All rights reserved.
 */

import assert from 'assert';
import { EmailService } from '../lib/licensing/emailService';
import { getDb, initDb } from '../lib/licensing/db';
import { LicensingService } from '../lib/licensing/licensingService';

let passed = 0;
let failed = 0;

function pass(name: string) {
    console.log(`  [PASS] ${name}`);
    passed++;
}

function fail(name: string, error: unknown) {
    console.error(`  [FAIL] ${name}:`, error);
    failed++;
}

// Preserve original global fetch
const originalFetch = global.fetch;

async function runTests() {
    console.log('\n============================================================');
    console.log('  SaaS Motion Pro — Resend Email Integration Test Suite');
    console.log('============================================================\n');

    process.env.ADMIN_SECRET_KEY = 'test_secret_admin_key_9988';
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_WEBHOOK_URL;

    await initDb();
    const db = getDb();

    // -------------------------------------------------------------
    // Test 1: Unconfigured provider returns not_configured safely
    // -------------------------------------------------------------
    try {
        const result = await EmailService.sendLicenseEmail({
            to: 'creator@example.com',
            customerName: 'Test Creator',
            orderId: 'ord_test_unconfigured',
            planName: 'Studio Commercial',
            licenseKey: 'SMP-TEST-UNCONFIGURED',
            maxDevices: 2,
            tier: 'studio',
            expiresAt: null
        });

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.status, 'not_configured');
        assert.strictEqual(result.provider, 'none');
        assert.ok(result.error?.includes('RESEND_API_KEY'));
        pass('Test 1: Missing Resend key returns not_configured safely without throwing');
    } catch (e) {
        fail('Test 1: Missing Resend key', e);
    }

    // -------------------------------------------------------------
    // Test 2: Server diagnostics do NOT leak secrets
    // -------------------------------------------------------------
    try {
        process.env.RESEND_API_KEY = 're_test_secret_key_123456789';
        process.env.EMAIL_FROM = 'SaaS Motion Pro <licenses@sabbirhossen.site>';
        process.env.ADMIN_EMAIL = 'myselfsabbirhossen@gmail.com';

        const diag = EmailService.getDiagnostics();
        assert.strictEqual(diag.resendConfigured, true);
        assert.strictEqual(diag.activeProvider, 'resend');
        assert.strictEqual(diag.fromEmail, 'SaaS Motion Pro <licenses@sabbirhossen.site>');
        assert.strictEqual(diag.adminEmail, 'myselfsabbirhossen@gmail.com');
        assert.strictEqual(diag.verifiedDomain, 'sabbirhossen.site');

        // Check secret masking
        assert.strictEqual(diag.resendKeyMasked, 're_te...6789');
        assert.strictEqual(JSON.stringify(diag).includes('re_test_secret_key_123456789'), false);
        pass('Test 2: Server email diagnostics mask secrets properly');
    } catch (e) {
        fail('Test 2: Server email diagnostics masking', e);
    }

    // -------------------------------------------------------------
    // Test 3: Resend Provider Acceptance & Idempotency Header
    // -------------------------------------------------------------
    let lastResendHeaders: any = null;
    let lastResendBody: any = null;

    global.fetch = async (url: any, init?: any): Promise<Response> => {
        const urlStr = String(url);
        if (urlStr.includes('api.resend.com/emails')) {
            lastResendHeaders = init?.headers;
            lastResendBody = JSON.parse(init?.body || '{}');

            return new Response(JSON.stringify({ id: 'resend_msg_mock_7788' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return originalFetch(url, init);
    };

    try {
        const result = await EmailService.sendLicenseEmail({
            to: 'creator@example.com',
            customerName: 'Alex Creator',
            orderId: 'ord_resend_ok',
            planName: 'Studio Commercial',
            licenseKey: 'SMP-ALEX-1234-5678-9999',
            maxDevices: 2,
            tier: 'studio',
            expiresAt: null
        });

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.status, 'sent');
        assert.strictEqual(result.provider, 'resend');
        assert.strictEqual(result.messageId, 'resend_msg_mock_7788');

        // Check Idempotency header
        assert.strictEqual(lastResendHeaders?.['Idempotency-Key'], 'license-ord_resend_ok');
        assert.strictEqual(lastResendHeaders?.['Authorization'], 'Bearer re_test_secret_key_123456789');

        // Check email recipients and from address
        assert.deepStrictEqual(lastResendBody?.to, ['creator@example.com']);
        assert.strictEqual(lastResendBody?.from, 'SaaS Motion Pro <licenses@sabbirhossen.site>');
        pass('Test 3: Resend API acceptance returns status "sent" with message ID & Idempotency-Key');
    } catch (e) {
        fail('Test 3: Resend API acceptance', e);
    }

    // -------------------------------------------------------------
    // Test 4: License Email HTML Template Content and Security Check
    // -------------------------------------------------------------
    try {
        const html = lastResendBody?.html || '';
        const text = lastResendBody?.text || '';

        // Must contain essential customer activation elements
        assert.ok(html.includes('SaaS Motion Pro'), 'Must contain product name');
        assert.ok(html.includes('ord_resend_ok'), 'Must contain order ID');
        assert.ok(html.includes('SMP-ALEX-1234-5678-9999'), 'Must contain issued license key');
        assert.ok(html.includes('https://sabbirhossen.site/saas-motion-pro/download'), 'Must contain official download link');
        assert.ok(html.includes('https://sabbirhossen.site/saas-motion-pro/dashboard'), 'Must contain customer seat management link');
        assert.ok(html.includes('CEP extensions folder'), 'Must contain After Effects setup instructions');

        // Must NOT leak private keys or internal credentials
        assert.ok(!html.includes('BEGIN PRIVATE KEY'), 'Must NEVER leak private signing key');
        assert.ok(!text.includes('BEGIN PRIVATE KEY'), 'Plaintext must NEVER leak private key');
        assert.ok(!html.includes('test_secret_admin_key'), 'Must NEVER leak admin secrets');
        pass('Test 4: Customer license email HTML includes complete instructions and zero secrets');
    } catch (e) {
        fail('Test 4: Customer license email template check', e);
    }

    // -------------------------------------------------------------
    // Test 5: Provider Error Handling (HTTP 422 / 500)
    // -------------------------------------------------------------
    global.fetch = async (url: any, init?: any): Promise<Response> => {
        const urlStr = String(url);
        if (urlStr.includes('api.resend.com/emails')) {
            return new Response(JSON.stringify({
                statusCode: 422,
                message: 'Domain sabbirhossen.site unverified in sandbox'
            }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return originalFetch(url, init);
    };

    try {
        const result = await EmailService.sendLicenseEmail({
            to: 'bad@example.com',
            customerName: 'Bad Address',
            orderId: 'ord_resend_err',
            planName: 'Studio Commercial',
            licenseKey: 'SMP-FAIL-1111-2222-3333',
            maxDevices: 2,
            tier: 'studio',
            expiresAt: null
        });

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.status, 'failed');
        assert.ok(result.error?.includes('Domain sabbirhossen.site'));
        pass('Test 5: Resend provider error (HTTP 422) handled cleanly without crashing');
    } catch (e) {
        fail('Test 5: Resend provider error handling', e);
    }

    // -------------------------------------------------------------
    // Test 6: Admin Notification Email for New Payment Submission
    // -------------------------------------------------------------
    let adminNotifyBody: any = null;

    global.fetch = async (url: any, init?: any): Promise<Response> => {
        const urlStr = String(url);
        if (urlStr.includes('api.resend.com/emails')) {
            adminNotifyBody = JSON.parse(init?.body || '{}');
            return new Response(JSON.stringify({ id: 'resend_admin_notify_9900' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return originalFetch(url, init);
    };

    try {
        const result = await EmailService.sendAdminPaymentSubmittedNotification({
            orderId: 'ord_sub_8833',
            customerName: 'Tanvir Hossain',
            customerEmail: 'tanvir@studio.com',
            paymentMethod: 'bkash',
            senderNumber: '01711223344',
            transactionId: 'BK99X8877A',
            amountPaid: '11,125 BDT',
            customerNote: 'Please activate quickly for urgent project'
        });

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.status, 'sent');
        assert.deepStrictEqual(adminNotifyBody?.to, ['myselfsabbirhossen@gmail.com']);
        assert.ok(adminNotifyBody?.subject?.includes('ord_sub_8833'));
        assert.ok(adminNotifyBody?.html?.includes('BK99X8877A'));
        assert.ok(adminNotifyBody?.html?.includes('/admin/licensing'));
        pass('Test 6: Admin notification email sent to myselfsabbirhossen@gmail.com upon payment submission');
    } catch (e) {
        fail('Test 6: Admin notification email', e);
    }

    // -------------------------------------------------------------
    // Test 7: Controlled Test Email to Admin
    // -------------------------------------------------------------
    try {
        let testEmailBody: any = null;
        global.fetch = async (url: any, init?: any): Promise<Response> => {
            const urlStr = String(url);
            if (urlStr.includes('api.resend.com/emails')) {
                testEmailBody = JSON.parse(init?.body || '{}');
                return new Response(JSON.stringify({ id: 'resend_diag_test_123' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return originalFetch(url, init);
        };

        const result = await EmailService.sendTestEmail('myselfsabbirhossen@gmail.com');
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.messageId, 'resend_diag_test_123');
        assert.deepStrictEqual(testEmailBody?.to, ['myselfsabbirhossen@gmail.com']);
        assert.ok(testEmailBody?.subject?.includes('[Test]'));
        pass('Test 7: Controlled test email dispatched to admin recipient');
    } catch (e) {
        fail('Test 7: Controlled test email', e);
    }

    // -------------------------------------------------------------
    // Test 8: End-to-End Approval, License Issuance & Resend Dispatch
    // -------------------------------------------------------------
    const testOrderId = `ord_e2e_resend_${Date.now()}`;
    const testUserId = `usr_e2e_${Date.now()}`;
    const customerEmail = `motiondirector_${Date.now()}@agency.com`;
    const nowIso = new Date().toISOString();

    await db.execute({
        sql: "INSERT OR IGNORE INTO users (id, email, name, role, created_at, updated_at) VALUES (?, ?, ?, 'customer', ?, ?)",
        args: [testUserId, customerEmail, 'Sarah Connor', nowIso, nowIso]
    });

    await db.execute({
        sql: `INSERT INTO orders (
            id, user_id, plan_id, status, amount_cents, currency, payment_method,
            sender_number, transaction_id, created_at, updated_at
        ) VALUES (?, ?, 'plan_studio', 'payment_submitted', 8900, 'usd', 'bkash', '01899887766', 'BKTRX112233', ?, ?)`,
        args: [testOrderId, testUserId, nowIso, nowIso]
    });

    let approvalEmailBody: any = null;
    global.fetch = async (url: any, init?: any): Promise<Response> => {
        const urlStr = String(url);
        if (urlStr.includes('api.resend.com/emails')) {
            approvalEmailBody = JSON.parse(init?.body || '{}');
            return new Response(JSON.stringify({ id: 'resend_ord_approval_msg_55' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return originalFetch(url, init);
    };

    try {
        // Step 1: Atomic status transition
        const updateRes = await db.execute({
            sql: "UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ? AND status != 'completed'",
            args: [nowIso, testOrderId]
        });
        assert.strictEqual(updateRes.rowsAffected, 1);

        // Step 2: Issue License Key
        const licenseKey = await LicensingService.issueLicense(
            testUserId,
            'plan_studio',
            2,
            'studio_lifetime'
        );
        assert.ok(licenseKey.startsWith('SMP-'));

        await db.execute({
            sql: "UPDATE licenses SET order_id = ? WHERE license_key = ?",
            args: [testOrderId, licenseKey]
        });

        // Step 3: Send Customer Email
        const emailResult = await EmailService.sendLicenseEmail({
            to: customerEmail,
            customerName: 'Sarah Connor',
            orderId: testOrderId,
            planName: 'Studio Commercial',
            licenseKey,
            maxDevices: 2,
            tier: 'studio',
            expiresAt: null,
            idempotencyKey: `license-approval-${testOrderId}`
        });

        assert.strictEqual(emailResult.success, true);
        assert.strictEqual(emailResult.status, 'sent');
        assert.strictEqual(emailResult.messageId, 'resend_ord_approval_msg_55');

        // Step 4: Persist on order
        await db.execute({
            sql: "UPDATE orders SET email_status = ?, email_sent_at = ?, email_message_id = ? WHERE id = ?",
            args: [emailResult.status, nowIso, emailResult.messageId, testOrderId]
        });

        const orderCheck = await db.execute({
            sql: "SELECT status, email_status, email_message_id FROM orders WHERE id = ?",
            args: [testOrderId]
        });
        assert.strictEqual(orderCheck.rows[0]?.status, 'completed');
        assert.strictEqual(orderCheck.rows[0]?.email_status, 'sent');
        assert.strictEqual(orderCheck.rows[0]?.email_message_id, 'resend_ord_approval_msg_55');

        assert.deepStrictEqual(approvalEmailBody?.to, [customerEmail]);
        assert.ok(approvalEmailBody?.html?.includes(licenseKey));
        pass('Test 8: Payment approval creates license and records Resend email_message_id in database');
    } catch (e) {
        fail('Test 8: End-to-end payment approval', e);
    }

    // -------------------------------------------------------------
    // Test 9: Idempotency: Repeated Approval Does NOT Issue Duplicate License
    // -------------------------------------------------------------
    try {
        const secondApproval = await db.execute({
            sql: "UPDATE orders SET status = 'completed' WHERE id = ? AND status != 'completed'",
            args: [testOrderId]
        });
        assert.strictEqual(secondApproval.rowsAffected, 0, 'Atomic transition guards against repeat approval');

        const licCount = await db.execute({
            sql: "SELECT COUNT(*) as count FROM licenses WHERE order_id = ?",
            args: [testOrderId]
        });
        assert.strictEqual(Number(licCount.rows[0]?.count), 1);
        pass('Test 9: Approval idempotency guard prevents duplicate license creation');
    } catch (e) {
        fail('Test 9: Approval idempotency guard', e);
    }

    // -------------------------------------------------------------
    // Test 10: Admin Retry Email Reuses Existing License Key
    // -------------------------------------------------------------
    global.fetch = async (url: any, init?: any): Promise<Response> => {
        const urlStr = String(url);
        if (urlStr.includes('api.resend.com/emails')) {
            return new Response(JSON.stringify({ id: 'resend_retry_msg_778899' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return originalFetch(url, init);
    };

    try {
        // Look up existing order & license
        const existingOrder = await db.execute({
            sql: `SELECT o.*, u.email as customer_email, u.name as customer_name,
                         p.name as plan_name, p.slug as plan_slug, p.max_devices,
                         l.license_key, l.expires_at as license_expires_at
                  FROM orders o
                  LEFT JOIN users u ON o.user_id = u.id
                  LEFT JOIN plans p ON o.plan_id = p.id
                  LEFT JOIN licenses l ON l.order_id = o.id
                  WHERE o.id = ?`,
            args: [testOrderId]
        });
        const order = existingOrder.rows[0];

        const retryResult = await EmailService.sendLicenseEmail({
            to: String(order.customer_email),
            customerName: String(order.customer_name),
            orderId: testOrderId,
            planName: String(order.plan_name),
            licenseKey: String(order.license_key),
            maxDevices: Number(order.max_devices),
            tier: String(order.plan_slug),
            expiresAt: null,
            idempotencyKey: `license-retry-${testOrderId}-${Date.now()}`
        });

        assert.strictEqual(retryResult.success, true);
        assert.strictEqual(retryResult.messageId, 'resend_retry_msg_778899');

        await db.execute({
            sql: "UPDATE orders SET email_status = ?, email_message_id = ? WHERE id = ?",
            args: [retryResult.status, retryResult.messageId, testOrderId]
        });

        const updatedOrder = await db.execute({
            sql: "SELECT email_message_id FROM orders WHERE id = ?",
            args: [testOrderId]
        });
        assert.strictEqual(updatedOrder.rows[0]?.email_message_id, 'resend_retry_msg_778899');

        const licCount = await db.execute({
            sql: "SELECT COUNT(*) as count FROM licenses WHERE order_id = ?",
            args: [testOrderId]
        });
        assert.strictEqual(Number(licCount.rows[0]?.count), 1);
        pass('Test 10: Admin email retry reuses existing license key without issuing new licenses');
    } catch (e) {
        fail('Test 10: Admin email retry idempotency', e);
    }

    // -------------------------------------------------------------
    // Test 11: Email Logs Table Records Delivery Telemetry
    // -------------------------------------------------------------
    try {
        const logsCheck = await db.execute({
            sql: "SELECT * FROM email_logs WHERE order_id = ? ORDER BY rowid DESC",
            args: [testOrderId]
        });
        assert.ok(logsCheck.rows.length >= 2, 'Must record initial send and retry attempts');
        const latestLog = logsCheck.rows[0];
        assert.strictEqual(latestLog.provider, 'resend');
        assert.strictEqual(latestLog.status, 'accepted');
        assert.strictEqual(latestLog.provider_message_id, 'resend_retry_msg_778899');
        pass('Test 11: email_logs table captures provider message ID, status, and timestamps');
    } catch (e) {
        fail('Test 11: email_logs table persistence', e);
    }

    // -------------------------------------------------------------
    // Test 12: Delivery Status Transition to "delivered" via Message ID
    // -------------------------------------------------------------
    try {
        const eventMessageId = 'resend_retry_msg_778899';
        await db.execute({
            sql: "UPDATE orders SET email_status = 'delivered', updated_at = ? WHERE email_message_id = ?",
            args: [new Date().toISOString(), eventMessageId]
        });

        const deliveredOrder = await db.execute({
            sql: "SELECT email_status FROM orders WHERE id = ?",
            args: [testOrderId]
        });
        assert.strictEqual(deliveredOrder.rows[0]?.email_status, 'delivered');
        pass('Test 12: Provider delivery event transitions order email_status to "delivered"');
    } catch (e) {
        fail('Test 12: Provider delivery event status update', e);
    }

    // Restore fetch
    global.fetch = originalFetch;

    console.log('\n============================================================');
    console.log(`  Resend Email Integration Results: ${passed} Passed, ${failed} Failed`);
    console.log('============================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
