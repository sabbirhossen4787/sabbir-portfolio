import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'sabbir-portfolio-super-secure-token-secret-2026';
// Allowlisted admin identifiers: Owner Gmail, domain email, admin username, and any env-configured values
function getAdminIdentifiers(): Set<string> {
  const identifiers = new Set<string>([
    'admin',
    'myselfsabbirhossen@gmail.com',
    'contact@sabbirhossen.site',
  ]);

  if (process.env.ADMIN_USERNAME) {
    identifiers.add(process.env.ADMIN_USERNAME.trim().toLowerCase());
  }
  if (process.env.ADMIN_EMAIL) {
    identifiers.add(process.env.ADMIN_EMAIL.trim().toLowerCase());
  }

  return identifiers;
}

// Allowed admin passwords:
// 1. Primary: process.env.ADMIN_PASSWORD (the dedicated Super Admin login password)
// 2. Compatibility: process.env.ADMIN_SECRET_KEY (if configured by admin as secret key)
// 3. Local dev only: 'admin123456' when NODE_ENV !== 'production' and neither variable is configured
// 4. In PRODUCTION: If neither variable is configured, NO default password is permitted (fails closed safely).
export function getExpectedAdminPasswords(): string[] {
  const passwords: string[] = [];

  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim()) {
    passwords.push(process.env.ADMIN_PASSWORD.trim());
  }

  // Backward compatibility: If ADMIN_SECRET_KEY is configured and distinct
  if (process.env.ADMIN_SECRET_KEY && process.env.ADMIN_SECRET_KEY.trim()) {
    const secretKey = process.env.ADMIN_SECRET_KEY.trim();
    if (!passwords.includes(secretKey)) {
      passwords.push(secretKey);
    }
  }

  // Fallback to local default ONLY in non-production local development
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  if (passwords.length === 0 && !isProduction) {
    passwords.push('admin123456');
  }

  return passwords;
}

function safeCompare(input: string, target: string): boolean {
  const inputBuffer = Buffer.from(input);
  const targetBuffer = Buffer.from(target);
  if (inputBuffer.length !== targetBuffer.length) {
    // Prevent timing leaks on password length
    crypto.timingSafeEqual(inputBuffer, inputBuffer);
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}

export function verifyCredentials(identifier: string, password: string): boolean {
  if (!identifier || !password) return false;

  const normalizedId = identifier.trim().toLowerCase();
  const allowedIdentifiers = getAdminIdentifiers();

  if (!allowedIdentifiers.has(normalizedId)) {
    return false;
  }

  const expectedPasswords = getExpectedAdminPasswords();
  if (expectedPasswords.length === 0) {
    console.error('[AUTH_SECURITY] Admin login denied: ADMIN_PASSWORD is not configured in production environment.');
    return false;
  }

  for (const expected of expectedPasswords) {
    if (safeCompare(password, expected)) {
      return true;
    }
  }

  return false;
}

export function createSessionToken(username: string): string {
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = `${username}:${expiry}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64');
}

export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [username, expiryStr, hmac] = decoded.split(':');
    if (!username || !expiryStr || !hmac) return { valid: false };

    const expiry = Number(expiryStr);
    if (Date.now() > expiry) return { valid: false };

    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(`${username}:${expiryStr}`).digest('hex');
    const match = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
    return { valid: match, username };
  } catch {
    return { valid: false };
  }
}