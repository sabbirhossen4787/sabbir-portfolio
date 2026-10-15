import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import { verifySessionToken } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
    const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (expectedKey && adminKey && adminKey === expectedKey) {
        return true;
    }

    const sessionCookie = req.cookies.get('admin_session')?.value;
    if (sessionCookie) {
        const { valid } = verifySessionToken(sessionCookie);
        if (valid) return true;
    }

    return false;
}

export async function POST(req: NextRequest) {
    try {
        if (!checkAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or missing admin credentials.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();
        const body = await req.json();
        const { licenseKey, reason } = body;

        if (!licenseKey) {
            return NextResponse.json({ error: 'License key is required' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const licRes = await db.execute({
            sql: "SELECT id FROM licenses WHERE UPPER(license_key) = UPPER(?)",
            args: [licenseKey.trim()]
        });

        const license = licRes.rows[0];
        if (!license) {
            return NextResponse.json({ error: 'License not found' }, { status: 404 });
        }

        // Revoke license and deactivate all active sessions
        await db.execute({
            sql: "UPDATE licenses SET status = 'revoked', updated_at = ? WHERE id = ?",
            args: [now, license.id]
        });

        await db.execute({
            sql: "UPDATE activations SET active = 0, last_seen_at = ? WHERE license_id = ? AND active = 1",
            args: [now, license.id]
        });

        // Insert audit log
        const logId = `aud_${Math.random().toString(36).substring(2, 9)}`;
        await db.execute({
            sql: "INSERT INTO audit_logs (id, license_key, action, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            args: [logId, licenseKey.trim(), 'REVOKE', 'SUCCESS', JSON.stringify({ reason: reason || 'Administrative revocation' }), now]
        });

        return NextResponse.json({ success: true, message: 'License revoked and all active seats terminated.' });
    } catch (err: unknown) {
        console.error("Admin revoke error:", err);
        return NextResponse.json({ error: 'Failed to revoke license' }, { status: 500 });
    }
}
