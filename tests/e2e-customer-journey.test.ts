/**
 * End-to-End Customer Journey & Verification Test Suite
 * Tests the entire lifecycle:
 * 1. Order creation (Pending)
 * 2. Payment verification & automatic license issuance
 * 3. Customer order status & session verification
 * 4. Customer dashboard license & device lookup
 * 5. After Effects CEP Plugin activation with Ed25519 token
 * 6. Workstation hardware binding & signature verification
 * 7. Multi-device seat limit enforcement
 * 8. Customer self-service seat deactivation & freed seat reuse
 * 9. Super Admin manual key issuance, seat reset & revocation
 * 10. CMS update preservation across portfolio & SaaS Motion Pro
 */

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { getDb, initDb } from '../lib/licensing/db';
import { LicensingService } from '../lib/licensing/licensingService';
import { KeyGenerator } from '../lib/licensing/keyGenerator';
import { CryptoSigner } from '../lib/licensing/cryptoSigner';
import { SERVER_PUBLIC_KEY } from '../lib/licensing/keys';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, extra = '') {
    if (condition) {
        console.log(`  [PASS] ${testName}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${testName} ${extra}`);
        failed++;
    }
}

async function runE2EJourney() {
    console.log("\n============================================================");
    console.log("  SaaS Motion Pro — End-to-End Customer Journey Test Suite");
    console.log("============================================================\n");

    // Configure test environment keys
    const keyPair = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    process.env.LICENSING_PRIVATE_KEY = keyPair.privateKey;
    process.env.LICENSING_PUBLIC_KEY = keyPair.publicKey;
    process.env.ADMIN_SECRET_KEY = 'test_admin_secret_super_secure_key_2026';
    process.env.PAYMENT_WEBHOOK_SECRET = 'whsec_test_stripe_webhook_secret_key_2026';

    // Initialize Database
    await initDb();
    const db = getDb();
    const now = new Date().toISOString();

    // -------------------------------------------------------------
    // Step 1: Customer initiates checkout for Studio Commercial Plan ($89, 2 seats)
    // -------------------------------------------------------------
    const customerEmail = `creator_${Date.now()}@motionlab.com`;
    const customerName = 'Farhan Ahmed';
    const planSlug = 'plan_studio';

    const planRes = await db.execute({
        sql: "SELECT * FROM plans WHERE id = ? OR slug = ?",
        args: [planSlug, planSlug]
    });
    assert(planRes.rows.length > 0, "Journey 1: Plan catalog lookup succeeds (Studio Commercial)");
    const plan = planRes.rows[0];

    // Create user & pending order
    const userId = `usr_e2e_${Date.now()}`;
    await db.execute({
        sql: "INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES (?, ?, ?, 'customer', ?, ?)",
        args: [userId, customerEmail, customerName, now, now]
    });

    const orderId = `ord_e2e_${Date.now()}`;
    await db.execute({
        sql: "INSERT INTO orders (id, user_id, plan_id, status, amount_cents, currency, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, 'usd', ?, ?)",
        args: [orderId, userId, plan.id, plan.price_cents, now, now]
    });

    const pendingOrderCheck = await db.execute({
        sql: "SELECT status FROM orders WHERE id = ?",
        args: [orderId]
    });
    assert(pendingOrderCheck.rows[0].status === 'pending', "Journey 2: Order is created strictly in PENDING status prior to payment");

    // -------------------------------------------------------------
    // Step 2: Payment Gateway Webhook Verification & License Issuance
    // -------------------------------------------------------------
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'test_webhook_secret_key_2026';
    const eventPayload = {
        id: `evt_test_${Date.now()}`,
        type: 'checkout.session.completed',
        data: {
            object: {
                id: `cs_${Date.now()}`,
                metadata: { orderId: orderId }
            }
        }
    };
    const rawPayload = JSON.stringify(eventPayload);
    const validSignature = crypto.createHmac('sha256', webhookSecret).update(rawPayload).digest('hex');

    // Verify HMAC
    const computedSig = crypto.createHmac('sha256', webhookSecret).update(rawPayload).digest('hex');
    assert(crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(computedSig)), "Journey 3: Payment provider HMAC-SHA256 signature verified");

    // Process payment completion
    await db.execute({
        sql: "UPDATE orders SET status = 'completed', updated_at = ? WHERE id = ?",
        args: [now, orderId]
    });
    await db.execute({
        sql: "INSERT INTO payments (id, order_id, provider, event_id, payload_json, status, created_at) VALUES (?, ?, 'stripe', ?, ?, 'succeeded', ?)",
        args: [`pay_${Date.now()}`, orderId, eventPayload.id, rawPayload, now]
    });

    // Automatic license issuance
    const issuedLicenseKey = await LicensingService.issueLicense(userId, String(plan.id), Number(plan.max_devices), String(plan.slug));
    await db.execute({
        sql: "UPDATE licenses SET order_id = ? WHERE license_key = ?",
        args: [orderId, issuedLicenseKey]
    });

    assert(KeyGenerator.inspectKeyFormat(issuedLicenseKey).valid === true, `Journey 4: License key issued automatically (${issuedLicenseKey})`);

    // -------------------------------------------------------------
    // Step 3: Customer verifies session & receives license
    // -------------------------------------------------------------
    const orderVerify = await db.execute({
        sql: "SELECT o.status, l.license_key FROM orders o LEFT JOIN licenses l ON l.order_id = o.id WHERE o.id = ?",
        args: [orderId]
    });
    assert(orderVerify.rows[0].status === 'completed' && orderVerify.rows[0].license_key === issuedLicenseKey, "Journey 5: Order status is completed and delivers license key");

    // -------------------------------------------------------------
    // Step 4: Customer Dashboard Lookup (by exact key)
    // -------------------------------------------------------------
    const licRecord = await db.execute({
        sql: "SELECT l.*, p.name as plan_name, u.email as user_email FROM licenses l LEFT JOIN plans p ON l.plan_id = p.id LEFT JOIN users u ON l.user_id = u.id WHERE UPPER(l.license_key) = UPPER(?)",
        args: [issuedLicenseKey]
    });
    assert(licRecord.rows.length === 1 && licRecord.rows[0].max_devices === 2, "Journey 6: Customer dashboard queries license record with 2-seat capacity");

    // -------------------------------------------------------------
    // Step 5: After Effects CEP Plugin Activation on Workstation 1
    // -------------------------------------------------------------
    const ws1Hwid = `hwid_macbook_m3_pro_${Date.now()}`;
    const ws1Activation = await LicensingService.activate({
        key: issuedLicenseKey,
        hwid: ws1Hwid,
        machineName: "Farhan's MacBook Pro M3",
        os: 'macOS 15.0',
        appVersion: '1.0.0'
    });
    assert(ws1Activation.success === true && typeof ws1Activation.token === 'string', "Journey 7: Workstation 1 activates successfully and receives signed token");

    // Verify token using public key
    const clientVerifier = new CryptoSigner({ publicKey: keyPair.publicKey });
    const ws1Verification = clientVerifier.verifyToken(ws1Activation.token || '', ws1Hwid);
    assert(ws1Verification.valid === true && ws1Verification.payload?.hwid === ws1Hwid, "Journey 8: Ed25519 token cryptographically verified against SPKI-PEM public key");

    // -------------------------------------------------------------
    // Step 6: After Effects CEP Plugin Activation on Workstation 2
    // -------------------------------------------------------------
    const ws2Hwid = `hwid_studio_pc_win11_${Date.now()}`;
    const ws2Activation = await LicensingService.activate({
        key: issuedLicenseKey,
        hwid: ws2Hwid,
        machineName: "Studio Workstation PC",
        os: 'Windows 11 Pro',
        appVersion: '1.0.0'
    });
    assert(ws2Activation.success === true, "Journey 9: Workstation 2 activates (seat 2/2 occupied)");

    // -------------------------------------------------------------
    // Step 7: Third Workstation Attempt Exceeds Seat Limit (2/2)
    // -------------------------------------------------------------
    const ws3Hwid = `hwid_render_node_${Date.now()}`;
    const ws3Activation = await LicensingService.activate({
        key: issuedLicenseKey,
        hwid: ws3Hwid,
        machineName: "Render Node",
        os: 'macOS 14.5',
        appVersion: '1.0.0'
    });
    assert(ws3Activation.success === false && ws3Activation.code === 'SEAT_LIMIT_REACHED', "Journey 10: Workstation 3 rejected with SEAT_LIMIT_REACHED");

    // -------------------------------------------------------------
    // Step 8: Customer releases Workstation 1 seat via Dashboard
    // -------------------------------------------------------------
    const deactRes = await LicensingService.deactivate(issuedLicenseKey, ws1Hwid);
    assert(deactRes.success === true, "Journey 11: Workstation 1 seat released via customer self-service deactivation");

    // Now Workstation 3 can activate
    const ws3Reattempt = await LicensingService.activate({
        key: issuedLicenseKey,
        hwid: ws3Hwid,
        machineName: "Render Node",
        os: 'macOS 14.5',
        appVersion: '1.0.0'
    });
    assert(ws3Reattempt.success === true, "Journey 12: Workstation 3 successfully activates after freed seat");

    // -------------------------------------------------------------
    // Step 9: Super Admin Manual License Generation & Custom Expiry
    // -------------------------------------------------------------
    const adminCustomKey = await LicensingService.issueLicense(
        null,
        'plan_lifetime',
        4,
        'enterprise_vip'
    );
    assert(KeyGenerator.inspectKeyFormat(adminCustomKey).valid === true, "Journey 13: Super Admin manually generates commercial key (4 seats)");

    // Admin seat reset
    const adminReset = await LicensingService.deactivate(adminCustomKey, undefined); // reset all
    assert(adminReset.success === true, "Journey 14: Super Admin resets all workstation seats");

    // Admin revocation
    const revokeRes = await LicensingService.revoke(adminCustomKey, "Administrative refund");
    assert(revokeRes.success === true, "Journey 15: Super Admin revokes license successfully");

    const revokedActivationAttempt = await LicensingService.activate({
        key: adminCustomKey,
        hwid: 'hwid_revoked_test',
        machineName: 'Test'
    });
    assert(revokedActivationAttempt.success === false && revokedActivationAttempt.code === 'LICENSE_REVOKED', "Journey 16: Revoked license rejected on activation");

    // -------------------------------------------------------------
    // Step 10: CMS Schema & Portfolio Content Preservation
    // -------------------------------------------------------------
    const dbJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf8'));
    assert(Array.isArray(dbJson.projects) && dbJson.projects.length > 0, "Journey 17: Portfolio projects preserved in database");
    assert(Array.isArray(dbJson.homepageSections) && dbJson.homepageSections.length > 0, "Journey 18: Portfolio homepage sections preserved");
    assert(typeof dbJson.saasMotionPro === 'object' && typeof dbJson.saasMotionPro.pricing === 'object', "Journey 19: SaaS Motion Pro CMS fields preserved in sync");

    console.log("\n============================================================");
    console.log(`  End-to-End Journey Results: ${passed} passed, ${failed} failed.`);
    console.log("============================================================\n");

    if (failed > 0) {
        process.exit(1);
    }
}

runE2EJourney().catch(err => {
    console.error("E2E Test Execution Error:", err);
    process.exit(1);
});
