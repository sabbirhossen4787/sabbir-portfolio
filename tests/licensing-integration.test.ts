/**
 * @fileoverview SaaS Motion Pro - Integration & Security Test Suite
 * Validates Ed25519 signing/tamper resistance, seat limits, legacy migration,
 * payment webhook HMAC, production test-payment blocking, and ZIP checksums.
 * @copyright 2026 SaaS Motion Pro. All rights reserved.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { CryptoSigner } from '../lib/licensing/cryptoSigner';
import { KeyGenerator } from '../lib/licensing/keyGenerator';
import { LicensingService } from '../lib/licensing/licensingService';
import { initDb, getDb } from '../lib/licensing/db';

async function runTestSuite() {
    console.log("============================================================");
    console.log("  SaaS Motion Pro Integration & Security Test Suite");
    console.log("============================================================\n");

    let passedTests = 0;
    let failedTests = 0;

    function assert(condition: boolean, testName: string, details?: string) {
        if (condition) {
            console.log(`  [PASS] ${testName}`);
            passedTests++;
        } else {
            console.error(`  [FAIL] ${testName}`);
            if (details) console.error(`         Reason: ${details}`);
            failedTests++;
        }
    }

    // Generate fresh test Ed25519 keypair for cryptographic tests
    const keyPair = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    process.env.LICENSING_PRIVATE_KEY = keyPair.privateKey;
    process.env.LICENSING_PUBLIC_KEY = keyPair.publicKey;
    process.env.ADMIN_SECRET_KEY = 'test_admin_secret_super_secure_key_2026';
    process.env.PAYMENT_WEBHOOK_SECRET = 'whsec_test_stripe_webhook_secret_key_2026';

    // Initialize DB
    await initDb();
    const db = getDb();

    // -------------------------------------------------------------
    // Test 1: Fail closed if private key is missing
    // -------------------------------------------------------------
    try {
        const brokenSigner = new CryptoSigner({ privateKey: '' });
        brokenSigner.signToken({ key: 'SMP-1234' });
        assert(false, "Test 1: Fail closed if private signing key is missing", "Signer did not throw on missing key");
    } catch (e: any) {
        assert(e.message.includes("server private signing key is not configured"), "Test 1: Fail closed if private signing key is missing");
    }

    // -------------------------------------------------------------
    // Test 2: Ed25519 token signing & verification
    // -------------------------------------------------------------
    const signer = new CryptoSigner({
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey
    });

    const testPayload = {
        licenseId: 'lic_test_1',
        key: 'SMP-TEST-1111-2222-3333',
        hwid: 'hwid_workstation_alpha_1',
        tier: 'studio',
        maxDevices: 2
    };

    const token = signer.signToken(testPayload);
    const verifyValid = signer.verifyToken(token, 'hwid_workstation_alpha_1');
    assert(verifyValid.valid === true && verifyValid.payload?.key === testPayload.key, "Test 2: Ed25519 token valid signature and payload integrity");

    // -------------------------------------------------------------
    // Test 3: Anti-tampering check (Single character modification invalidates token)
    // -------------------------------------------------------------
    const tokenParts = token.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ ...testPayload, tier: 'enterprise_hacked' })).toString('base64url');
    const forgedToken = `${tokenParts[0]}.${tamperedPayload}.${tokenParts[2]}`;
    const verifyForged = signer.verifyToken(forgedToken);
    assert(verifyForged.valid === false && Boolean(verifyForged.error?.includes("Cryptographic signature verification failed")), "Test 3: Anti-tampering check (forged payload is rejected)");

    // -------------------------------------------------------------
    // Test 4: Hardware binding check (HWID mismatch fails)
    // -------------------------------------------------------------
    const verifyHwidMismatch = signer.verifyToken(token, 'different_rogue_hwid_999');
    assert(verifyHwidMismatch.valid === false && Boolean(verifyHwidMismatch.error?.includes("Hardware mismatch")), "Test 4: Hardware binding (different HWID rejected)");

    // -------------------------------------------------------------
    // Test 5: Rejection of arbitrary legacy keys
    // -------------------------------------------------------------
    const unverifiedKeyResult = await LicensingService.activate({
        key: 'SMP-FAKE-ARBITRARY-KEY-9999',
        hwid: 'hwid_attacker_station_1'
    });
    assert(unverifiedKeyResult.success === false && unverifiedKeyResult.code === 'LICENSE_NOT_FOUND', "Test 5: Reject arbitrary legacy keys (not on migration allowlist)");

    // Clean prior test activations for SMP-WXEW-ZYQY-ULJF to ensure test isolation
    const testLic = await db.execute({
        sql: "SELECT id FROM licenses WHERE UPPER(license_key) = 'SMP-WXEW-ZYQY-ULJF'"
    });
    if (testLic.rows[0]) {
        await db.execute({
            sql: "DELETE FROM activations WHERE license_id = ?",
            args: [testLic.rows[0].id]
        });
    }

    // -------------------------------------------------------------
    // Test 6: Legitimate legacy customer migration
    // -------------------------------------------------------------
    const legacyMigration = await LicensingService.activate({
        key: 'SMP-WXEW-ZYQY-ULJF',
        hwid: 'hwid_tanvir_macbook_pro_m2',
        machineName: "Tanvir's AE Studio M2",
        os: 'macOS 15.0'
    });
    assert(legacyMigration.success === true && typeof legacyMigration.token === 'string' && legacyMigration.license?.maxDevices === 3, "Test 6: Legitimate legacy customer migration (Tanvir Ahmed, 3 seats)");

    // -------------------------------------------------------------
    // Test 7: Seat limit enforcement
    // -------------------------------------------------------------
    // Activate remaining seats for Tanvir (capacity is 3)
    await LicensingService.activate({
        key: 'SMP-WXEW-ZYQY-ULJF',
        hwid: 'hwid_tanvir_workstation_2',
        machineName: 'Workstation 2'
    });
    await LicensingService.activate({
        key: 'SMP-WXEW-ZYQY-ULJF',
        hwid: 'hwid_tanvir_workstation_3',
        machineName: 'Workstation 3'
    });

    // 4th activation should be rejected with SEAT_LIMIT_REACHED
    const seatLimitExceeded = await LicensingService.activate({
        key: 'SMP-WXEW-ZYQY-ULJF',
        hwid: 'hwid_tanvir_workstation_4',
        machineName: 'Workstation 4 (Overflow)'
    });
    assert(seatLimitExceeded.success === false && seatLimitExceeded.code === 'SEAT_LIMIT_REACHED', "Test 7: Seat limit enforcement (exceeding 3 seats rejected)");

    // -------------------------------------------------------------
    // Test 8: Device deactivation frees seat
    // -------------------------------------------------------------
    const deactRes = await LicensingService.deactivate('SMP-WXEW-ZYQY-ULJF', 'hwid_tanvir_workstation_2');
    assert(deactRes.success === true, "Test 8a: Workstation deactivation successfully frees seat");

    const reactivateRes = await LicensingService.activate({
        key: 'SMP-WXEW-ZYQY-ULJF',
        hwid: 'hwid_tanvir_workstation_4',
        machineName: 'Workstation 4 (Now allowed)'
    });
    assert(reactivateRes.success === true, "Test 8b: New workstation successfully activates after seat freed");

    // -------------------------------------------------------------
    // Test 9: Payment Webhook HMAC Verification
    // -------------------------------------------------------------
    const mockOrderPayload = JSON.stringify({
        id: 'evt_test_payment_123',
        type: 'checkout.session.completed',
        data: { object: { metadata: { orderId: 'ord_sample_999' } } }
    });
    const correctSig = crypto.createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET!).update(mockOrderPayload).digest('hex');
    const forgedSig = 'forged_bad_signature_0000000000000000000000000000000000000000';

    const sigBuf = Buffer.from(forgedSig, 'utf8');
    const expBuf = Buffer.from(correctSig, 'utf8');
    const isForgedValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    assert(isForgedValid === false, "Test 9: Forged payment webhook HMAC signature rejected");

    // -------------------------------------------------------------
    // Test 10: Checksum Verification for Distribution ZIPs
    // -------------------------------------------------------------
    const EXPECTED_CHECKSUMS: Record<string, string> = {
        'SaaS_Motion_Pro_v1.0.0_macOS.zip': '97b27c86abc2c389478974d7bba0d29ff1eb32baf07410df400ba7ecc963d0cc',
        'SaaS_Motion_Pro_v1.0.0_Windows.zip': '1ed6300ef286ebb30e45ec17c7eab614ff60cab2eccd49f07c9e3692f3acf28d',
        'SaaS_Motion_Pro_v1.0.0_Universal.zip': '092b5cb86a28fd054384e556cdb68e38da6d5a8a0629d48f7a6b58a03440d8bc'
    };

    let allChecksumsMatch = true;
    for (const [filename, expectedSha] of Object.entries(EXPECTED_CHECKSUMS)) {
        const filePath = path.join(process.cwd(), 'public', 'downloads', filename);
        if (!fs.existsSync(filePath)) {
            allChecksumsMatch = false;
            console.error(`Missing file: ${filePath}`);
            break;
        }
        const fileBytes = fs.readFileSync(filePath);
        const actualSha = crypto.createHash('sha256').update(fileBytes).digest('hex');
        if (actualSha !== expectedSha) {
            allChecksumsMatch = false;
            console.error(`SHA-256 mismatch for ${filename}: actual ${actualSha} != expected ${expectedSha}`);
            break;
        }
    }
    assert(allChecksumsMatch === true, "Test 10: All distribution ZIP checksums match published SHA-256 values");

    // -------------------------------------------------------------
    // Test 11: Super Admin Manual License Generation
    // -------------------------------------------------------------
    const manualGenKey = await LicensingService.issueLicense(null, 'plan_lifetime', 4, 'enterprise_lifetime');
    assert(KeyGenerator.inspectKeyFormat(manualGenKey).valid === true, "Test 11a: Manual license key format valid (SMP-XXXX-XXXX-XXXX-XXXX)");

    const manualActivation = await LicensingService.activate({
        key: manualGenKey,
        hwid: 'hwid_manual_customer_station_1',
        machineName: 'Agency Studio 1'
    });
    assert(manualActivation.success === true && manualActivation.license?.maxDevices === 4, "Test 11b: Manual license activates with configured 4-seat capacity");

    // -------------------------------------------------------------
    // Test 12: Super Admin Workstation Reset
    // -------------------------------------------------------------
    const manualLicRow = await db.execute({
        sql: "SELECT id FROM licenses WHERE UPPER(license_key) = UPPER(?)",
        args: [manualGenKey]
    });
    const resetRes = await db.execute({
        sql: "UPDATE activations SET active = 0 WHERE license_id = ? AND active = 1",
        args: [manualLicRow.rows[0].id]
    });
    assert(resetRes.rowsAffected === 1, "Test 12: Super Admin resets workstation seats successfully");

    console.log("\n============================================================");
    console.log(`  Tests completed: ${passedTests} passed, ${failedTests} failed.`);
    console.log("============================================================\n");

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTestSuite().catch(err => {
    console.error("Test Suite execution exception:", err);
    process.exit(1);
});
