import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';

export async function GET(req: NextRequest) {
    try {
        await initDb();
        const db = getDb();
        const { searchParams } = new URL(req.url);
        const keyParam = searchParams.get('key');
        const emailParam = searchParams.get('email');
        const queryParam = searchParams.get('query');

        const query = (keyParam || emailParam || queryParam || '').trim();
        if (!query) {
            return NextResponse.json({ error: 'License key or authorized customer email is required' }, { status: 400 });
        }

        const isEmail = query.includes('@');
        const customerAuth = req.headers.get('x-customer-auth') || req.headers.get('authorization');

        // Disallow wildcard or unauthenticated email lookups
        if (isEmail && !customerAuth) {
            return NextResponse.json({
                error: 'Customer authentication required to query licenses by email. Please lookup using your exact License Key or provide customer authentication.'
            }, { status: 401 });
        }

        // Query by exact key or verified email
        const licRes = await db.execute({
            sql: `
                SELECT l.*, p.name as plan_name, u.email as user_email
                FROM licenses l
                LEFT JOIN plans p ON l.plan_id = p.id
                LEFT JOIN users u ON l.user_id = u.id
                WHERE UPPER(l.license_key) = UPPER(?) ${isEmail ? 'OR LOWER(u.email) = LOWER(?)' : ''}
            `,
            args: isEmail ? [query, query.toLowerCase()] : [query]
        });

        if (licRes.rows.length === 0) {
            return NextResponse.json({ licenses: [] });
        }

        const licensesWithDevices = await Promise.all(licRes.rows.map(async (lic) => {
            const actRes = await db.execute({
                sql: "SELECT id, hwid, device_name, os, client_version, active, activated_at, last_seen_at FROM activations WHERE license_id = ? ORDER BY activated_at DESC",
                args: [lic.id]
            });

            return {
                id: lic.id,
                licenseKey: lic.license_key,
                planName: lic.plan_name || 'Studio Commercial',
                tier: lic.tier,
                status: lic.status,
                maxDevices: lic.max_devices,
                createdAt: lic.created_at,
                customerEmail: lic.user_email,
                activations: actRes.rows.map(a => ({
                    id: a.id,
                    hwid: a.hwid,
                    machineName: a.device_name || 'Workstation',
                    os: a.os,
                    appVersion: a.client_version,
                    status: Number(a.active) === 1 ? 'active' : 'deactivated',
                    activatedAt: a.activated_at,
                    lastSeenAt: a.last_seen_at
                }))
            };
        }));

        return NextResponse.json({ licenses: licensesWithDevices });
    } catch (err: unknown) {
        console.error("User licenses fetch error:", err);
        return NextResponse.json({ error: 'Failed to retrieve license data' }, { status: 500 });
    }
}
