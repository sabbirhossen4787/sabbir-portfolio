import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'sabbir-portfolio-super-secure-token-secret-2026';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'contact@sabbirhossen.site').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

export function verifyCredentials(identifier: string, password: string): boolean {
  const normalizedId = identifier.trim().toLowerCase();
  const validUser = normalizedId === ADMIN_USERNAME || normalizedId === ADMIN_EMAIL;
  if (!validUser) return false;

  const inputBuffer = Buffer.from(password);
  const targetBuffer = Buffer.from(ADMIN_PASSWORD);
  if (inputBuffer.length !== targetBuffer.length) return false;

  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
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