import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import { KeyGenerator } from '@/lib/licensing/keyGenerator';
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

        const {
            customerEmail,
            customerName,
            planId = 'plan_studio',
            tier = 'studio_lifetime',
            maxDevices = 2,
            expiresAt = null,
            note = 'Manual admin issuance'
        } = body;

        const email = (customerEmail || '').trim().toLowerCase();
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
        }

        const now = new Date().toISOString();

        // 1. Check or create customer user
        let userId = '';
        const userRes = await db.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [email]
        });

        if (userRes.rows[0]) {
            userId = String(userRes.rows[0].id);
        } else {
            userId = `usr_${Math.random().toString(36).substring(2, 9)}`;
            await db.execute({
                sql: "INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                args: [userId, email, customerName || 'Valued Customer', 'customer', now, now]
            });
        }

        // 2. Generate cryptographically formatted license key
        const licenseKey = KeyGenerator.generateKey('SMP');
        const licenseId = `lic_${Math.random().toString(36).substring(2, 9)}`;
        const seatLimit = Math.max(1, Number(maxDevices) || 2);

        // 3. Insert license into registry
        await db.execute({
            sql: "INSERT INTO licenses (id, user_id, plan_id, license_key, status, max_devices, tier, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [licenseId, userId, planId, licenseKey, 'active', seatLimit, tier, expiresAt || null, now, now]
        });

        // 4. Log admin audit
        const logId = `aud_${Math.random().toString(36).substring(2, 9)}`;
        await db.execute({
            sql: "INSERT INTO audit_logs (id, user_id, license_key, action, result, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [
                logId,
                userId,
                licenseKey,
                'MANUAL_GENERATE',
                'SUCCESS',
                JSON.stringify({ planId, tier, maxDevices: seatLimit, expiresAt, note }),
                now
            ]
        });

        return NextResponse.json({
            success: true,
            licenseId,
            licenseKey,
            customerEmail: email,
            customerName: customerName || 'Valued Customer',
            maxDevices: seatLimit,
            tier,
            status: 'active',
            expiresAt,
            createdAt: now
        });
    } catch (err: unknown) {
        console.error("Manual license generation error:", err);
        return NextResponse.json({ error: 'Failed to generate license key' }, { status: 500 });
    }
}
