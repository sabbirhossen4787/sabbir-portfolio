/**
 * @fileoverview SaaS Motion Pro & Portfolio Admin Authentication Test Suite
 * Tests identifier resolution, ADMIN_PASSWORD / ADMIN_SECRET_KEY handling,
 * timing-safe comparisons, session token generation, and tamper resistance.
 */

import assert from 'assert';
import { verifyCredentials, createSessionToken, verifySessionToken } from '../lib/auth';

console.log('============================================================');
console.log('  Admin Authentication Verification Test Suite');
console.log('============================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${error instanceof Error ? error.message : String(error)}`);
    failedTests++;
  }
}

// 1. Default environment tests
runTest('Owner email "myselfsabbirhossen@gmail.com" matches with default local password', () => {
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SECRET_KEY;
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'admin123456'), true);
});

runTest('Case-insensitivity and whitespace trimming on owner email', () => {
  assert.strictEqual(verifyCredentials('  MYSELFSABBIRHOSSEN@GMAIL.COM  ', 'admin123456'), true);
});

runTest('Username "admin" matches with default local password', () => {
  assert.strictEqual(verifyCredentials('admin', 'admin123456'), true);
});

runTest('Domain email "contact@sabbirhossen.site" matches with default local password', () => {
  assert.strictEqual(verifyCredentials('contact@sabbirhossen.site', 'admin123456'), true);
});

runTest('Rejects unauthorized email with correct password', () => {
  assert.strictEqual(verifyCredentials('hacker@example.com', 'admin123456'), false);
});

runTest('Rejects owner email with incorrect password', () => {
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'wrongpassword'), false);
});

runTest('Rejects empty identifier or empty password', () => {
  assert.strictEqual(verifyCredentials('', 'admin123456'), false);
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', ''), false);
});

// 2. ADMIN_SECRET_KEY integration (Vercel production standard)
runTest('Owner email matches when password matches ADMIN_SECRET_KEY', () => {
  process.env.ADMIN_SECRET_KEY = 'vercel-super-secret-key-998877';
  delete process.env.ADMIN_PASSWORD;
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'vercel-super-secret-key-998877'), true);
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'admin123456'), false);
});

runTest('Username "admin" matches when password matches ADMIN_SECRET_KEY', () => {
  process.env.ADMIN_SECRET_KEY = 'vercel-super-secret-key-998877';
  delete process.env.ADMIN_PASSWORD;
  assert.strictEqual(verifyCredentials('admin', 'vercel-super-secret-key-998877'), true);
});

// 3. ADMIN_PASSWORD integration
runTest('Owner email matches when password matches ADMIN_PASSWORD', () => {
  process.env.ADMIN_PASSWORD = 'custom-admin-password-123';
  delete process.env.ADMIN_SECRET_KEY;
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'custom-admin-password-123'), true);
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'admin123456'), false);
});

// 4. Custom ADMIN_USERNAME and ADMIN_EMAIL
runTest('Custom configured ADMIN_USERNAME and ADMIN_EMAIL are honored', () => {
  process.env.ADMIN_USERNAME = 'sabbir_super';
  process.env.ADMIN_EMAIL = 'custom@portfolio.internal';
  process.env.ADMIN_PASSWORD = 'secure-password-456';
  assert.strictEqual(verifyCredentials('sabbir_super', 'secure-password-456'), true);
  assert.strictEqual(verifyCredentials('custom@portfolio.internal', 'secure-password-456'), true);
  // Owner email still remains allowlisted
  assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'secure-password-456'), true);
});

// 5. Production security & fail-safe tests (Requirement B.3 & B.8)
runTest('In production, missing password configuration rejects default password (fails closed safely)', () => {
  const origEnv = process.env.NODE_ENV;
  const envObj = process.env as Record<string, string | undefined>;
  try {
    envObj.NODE_ENV = 'production';
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SECRET_KEY;
    // Must NOT permit admin123456 in production
    assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'admin123456'), false);
    assert.strictEqual(verifyCredentials('admin', 'admin123456'), false);
  } finally {
    envObj.NODE_ENV = origEnv;
  }
});

runTest('In production, setting ADMIN_PASSWORD enables login with new password and rejects wrong password', () => {
  const origEnv = process.env.NODE_ENV;
  const envObj = process.env as Record<string, string | undefined>;
  try {
    envObj.NODE_ENV = 'production';
    process.env.ADMIN_PASSWORD = 'BrandNewProductionSecret2026!';
    delete process.env.ADMIN_SECRET_KEY;

    assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'BrandNewProductionSecret2026!'), true);
    assert.strictEqual(verifyCredentials('admin', 'BrandNewProductionSecret2026!'), true);
    assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'old_or_wrong_password'), false);
    assert.strictEqual(verifyCredentials('myselfsabbirhossen@gmail.com', 'admin123456'), false);
  } finally {
    envObj.NODE_ENV = origEnv;
  }
});

// 6. Session token generation and validation
runTest('Session token generation and verification', () => {
  const token = createSessionToken('myselfsabbirhossen@gmail.com');
  assert.ok(token);
  const result = verifySessionToken(token);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.username, 'myselfsabbirhossen@gmail.com');
});

runTest('Forged session token is rejected', () => {
  const forged = Buffer.from('myselfsabbirhossen@gmail.com:9999999999999:fakehmac').toString('base64');
  const result = verifySessionToken(forged);
  assert.strictEqual(result.valid, false);
});

// Cleanup env
delete process.env.ADMIN_USERNAME;
delete process.env.ADMIN_EMAIL;
delete process.env.ADMIN_PASSWORD;
delete process.env.ADMIN_SECRET_KEY;

console.log('\n============================================================');
console.log(`  Tests completed: ${passedTests} passed, ${failedTests} failed.`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
