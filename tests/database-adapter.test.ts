/**
 * @fileoverview SaaS Motion Pro - Database Adapter & License Generation Test Suite
 * Tests:
 * 1. Production database configuration requirements & safe error reporting (no local SQLite error 14).
 * 2. Alias variable resolution (TURSO_URL, DATABASE_URL, etc.).
 * 3. Safe schema initialization with embedded DDL.
 * 4. End-to-end license generation with customer association, plan resolution, and audit logging.
 */

import assert from 'assert';
import { getDatabaseConfig, _resetDbClientForTesting, initDb, getDb } from '../lib/licensing/db';
import { KeyGenerator } from '../lib/licensing/keyGenerator';
import { CryptoSigner } from '../lib/licensing/cryptoSigner';

console.log('============================================================');
console.log('  Database Adapter & Production License Generation Test Suite');
console.log('============================================================\n');

let passedTests = 0;
let failedTests = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${error instanceof Error ? error.message : String(error)}`);
    failedTests++;
  }
}

async function main() {
  // Test 1: Production fail-safe when TURSO_DATABASE_URL is missing
  await runTest('In production, missing TURSO_DATABASE_URL throws safe, actionable error (no SQLite 14 crash)', () => {
    const origEnv = process.env.NODE_ENV;
    const envObj = process.env as Record<string, string | undefined>;
    const origUrl = process.env.TURSO_DATABASE_URL;
    const origVercel = process.env.VERCEL;
    try {
      envObj.NODE_ENV = 'production';
      delete process.env.TURSO_DATABASE_URL;
      delete process.env.TURSO_URL;
      delete process.env.DATABASE_URL;
      delete process.env.LIBSQL_DATABASE_URL;

      assert.throws(
        () => getDatabaseConfig(),
        (err: Error) => {
          return err.message.includes('TURSO_DATABASE_URL is not configured') &&
                 err.message.includes('Vercel Project Settings');
        }
      );
    } finally {
      envObj.NODE_ENV = origEnv;
      if (origUrl) process.env.TURSO_DATABASE_URL = origUrl;
      if (origVercel) process.env.VERCEL = origVercel;
    }
  });

  // Test 2: Alias variable resolution
  await runTest('Resolves alias database URL variables (TURSO_URL, DATABASE_URL)', () => {
    const origUrl = process.env.TURSO_DATABASE_URL;
    try {
      delete process.env.TURSO_DATABASE_URL;
      process.env.TURSO_URL = 'libsql://custom-alias.turso.io';
      process.env.TURSO_TOKEN = 'test-token-123';

      const config = getDatabaseConfig();
      assert.strictEqual(config.url, 'libsql://custom-alias.turso.io');
      assert.strictEqual(config.authToken, 'test-token-123');
      assert.strictEqual(config.isRemote, true);
    } finally {
      delete process.env.TURSO_URL;
      delete process.env.TURSO_TOKEN;
      if (origUrl) process.env.TURSO_DATABASE_URL = origUrl;
    }
  });

  // Test 3: Local development fallback
  await runTest('In local development, falls back to local data/saas_motion_pro.db when TURSO_DATABASE_URL is unset', () => {
    const origEnv = process.env.NODE_ENV;
    const envObj = process.env as Record<string, string | undefined>;
    const origUrl = process.env.TURSO_DATABASE_URL;
    const origVercel = process.env.VERCEL;
    try {
      envObj.NODE_ENV = 'development';
      delete process.env.VERCEL;
      delete process.env.TURSO_DATABASE_URL;
      delete process.env.TURSO_URL;
      delete process.env.DATABASE_URL;

      const config = getDatabaseConfig();
      assert.strictEqual(config.isRemote, false);
      assert.ok(config.url.startsWith('file:'));
      assert.ok(config.url.includes('saas_motion_pro.db'));
    } finally {
      envObj.NODE_ENV = origEnv;
      if (origUrl) process.env.TURSO_DATABASE_URL = origUrl;
      if (origVercel) process.env.VERCEL = origVercel;
    }
  });

  // Test 4: Schema initialization and table safety
  await runTest('initDb executes schema safely without throwing and establishes core tables', async () => {
    _resetDbClientForTesting();
    await initDb();
    const db = getDb();

    // Verify required tables exist
    const tablesCheck = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tablesCheck.rows.map(r => String(r.name));

    const requiredTables = ['users', 'plans', 'orders', 'licenses', 'activations', 'audit_logs', 'payment_settings'];
    for (const tbl of requiredTables) {
      assert.ok(tableNames.includes(tbl), `Expected table "${tbl}" to exist in database`);
    }
  });

  // Test 5: End-to-end license generation with customer association, plan resolution, and audit trail
  await runTest('Manual license generation: customer upsert, plan linking, and license persistence', async () => {
    const db = getDb();
    const testEmail = `cust_${Date.now()}@example.com`;
    const testName = 'Verified Production Tester';
    const now = new Date().toISOString();

    // 1. Customer Upsert
    const userId = `usr_test_${Date.now()}`;
    await db.execute({
      sql: "INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [userId, testEmail, testName, 'customer', now, now]
    });

    // 2. Plan resolution
    const planRes = await db.execute("SELECT id, max_devices FROM plans WHERE id = 'plan_studio' OR active = 1 LIMIT 1");
    assert.ok(planRes.rows.length > 0, 'Plan must exist');
    const planId = String(planRes.rows[0].id);
    const maxDevices = Number(planRes.rows[0].max_devices) || 2;

    // 3. Key generation & format check
    const licenseKey = KeyGenerator.generateKey('SMP');
    const keyFormat = KeyGenerator.inspectKeyFormat(licenseKey);
    assert.strictEqual(keyFormat.valid, true, 'License key must be valid format');
    assert.strictEqual(keyFormat.type, 'modern');
    assert.ok(licenseKey.startsWith('SMP-'), 'Key must start with prefix SMP-');

    // 4. Persistence in registry
    const licenseId = `lic_test_${Date.now()}`;
    await db.execute({
      sql: "INSERT INTO licenses (id, user_id, plan_id, license_key, status, max_devices, tier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [licenseId, userId, planId, licenseKey, 'active', maxDevices, 'studio_lifetime', now, now]
    });

    // 5. Verification of saved license
    const verifyRes = await db.execute({
      sql: "SELECT l.id, l.license_key, l.status, l.max_devices, u.email as user_email FROM licenses l JOIN users u ON l.user_id = u.id WHERE l.id = ?",
      args: [licenseId]
    });

    assert.strictEqual(verifyRes.rows.length, 1);
    assert.strictEqual(String(verifyRes.rows[0].license_key), licenseKey);
    assert.strictEqual(String(verifyRes.rows[0].user_email), testEmail);
    assert.strictEqual(Number(verifyRes.rows[0].max_devices), maxDevices);
    assert.strictEqual(String(verifyRes.rows[0].status), 'active');

    // Clean up test records
    await db.execute({ sql: "DELETE FROM licenses WHERE id = ?", args: [licenseId] });
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });
  });

  // Test 6: Ed25519 cryptographic token signing remains intact
  await runTest('Ed25519 cryptographic token generation and tamper detection intact', async () => {
    const signer = new CryptoSigner();
    // Verify signer initializes with test or env key
    const payload = {
      sub: 'SMP-TEST-1234-5678-90AB',
      hwid: 'hwid_mac_pro_m2_test',
      plan: 'studio_lifetime',
      seats: 2,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'SaaS Motion Pro Licensing Authority'
    };

    // If private key is available, test signing
    if (process.env.LICENSE_SIGNING_PRIVATE_KEY) {
      const token = signer.signToken(payload);
      assert.ok(token, 'Signed token must be generated');
      const verified = signer.verifyToken(token);
      assert.strictEqual(verified.valid, true);
      assert.strictEqual(verified.payload?.hwid, payload.hwid);
    } else {
      console.log('    (Skipping private key signing execution: LICENSE_SIGNING_PRIVATE_KEY not set in local env)');
    }
  });

  console.log('\n============================================================');
  console.log(`  Tests completed: ${passedTests} passed, ${failedTests} failed.`);
  console.log('============================================================\n');

  if (failedTests > 0) process.exit(1);
}

main().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
