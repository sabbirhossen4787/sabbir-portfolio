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
            return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();
        const body = await req.json();
        const { licenseKey, hwid, resetAll = false } = body;

        if (!licenseKey) {
            return NextResponse.json({ error: 'License key is required' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const licRes = await db.execute({
            sql: "SELECT id, user_id FROM licenses WHERE UPPER(license_key) = UPPER(?)",
            args: [licenseKey.trim()]
        });

        const license = licRes.rows[0];
        if (!license) {
            return NextResponse.json({ error: 'License not found' }, { status: 404 });
        }

        let updatedCount = 0;

        if (resetAll || !hwid) {
            // Deactivate all active workstations for this license
            const updateRes = await db.execute({
                sql: "UPDATE activations SET active = 0, last_seen_at = ? WHERE license_id = ? AND active = 1",
                args: [now, license.id]
            });
            updatedCount = updateRes.rowsAffected;
        } else {
            // Deactivate specific workstation
            const updateRes = await db.execute({
                sql: "UPDATE activations SET active = 0, last_seen_at = ? WHERE license_id = ? AND LOWER(hwid) = LOWER(?) AND active = 1",
                args: [now, license.id, hwid.trim().toLowerCase()]
            });
            updatedCount = updateRes.rowsAffected;
        }

        // Insert audit log
        const logId = `aud_${Math.random().toString(36).substring(2, 9)}`;
        await db.execute({
            sql: "INSERT INTO audit_logs (id, user_id, license_key, hwid, action, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                logId,
                String(license.user_id || ''),
                licenseKey.trim(),
                hwid || 'ALL_DEVICES',
                'ADMIN_RESET_SEATS',
                'SUCCESS',
                JSON.stringify({ resetAll: Boolean(resetAll), freedSeatsCount: updatedCount }),
                now
            ]
        });

        return NextResponse.json({
            success: true,
            message: `Successfully released ${updatedCount} workstation ${updatedCount === 1 ? 'seat' : 'seats'}.`,
            freedCount: updatedCount
        });
    } catch (err: unknown) {
        console.error("Reset activations error:", err);
        return NextResponse.json({ error: 'Failed to reset workstation seats' }, { status: 500 });
    }
}
