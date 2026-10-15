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

export async function GET(req: NextRequest) {
    try {
        if (!checkAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized: Invalid or missing admin credentials.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();

        const [ordersRes, licensesRes, activationsRes, auditRes, plansRes, rawOrders] = await Promise.all([
            db.execute("SELECT COUNT(*) as total_orders, COALESCE(SUM(amount_cents), 0) as total_revenue_cents FROM orders WHERE status = 'completed' OR status = 'paid'"),
            db.execute("SELECT COUNT(*) as total_licenses, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_licenses FROM licenses"),
            db.execute("SELECT COUNT(*) as active_workstations FROM activations WHERE active = 1"),
            db.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 30"),
            db.execute("SELECT id, name, slug, price_cents, max_devices FROM plans WHERE active = 1"),
            db.execute(`
                SELECT o.id, o.amount_cents, o.currency, o.status, o.created_at, u.email as customer_email, u.name as customer_name, p.name as plan_name
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN plans p ON o.plan_id = p.id
                ORDER BY o.created_at DESC LIMIT 20
            `)
        ]);

        const rawLicenses = await db.execute(`
            SELECT l.id, l.license_key, l.status, l.tier, l.max_devices, l.expires_at, l.created_at, 
                   u.email as customer_email, u.name as customer_name, p.name as plan_name
            FROM licenses l
            LEFT JOIN users u ON l.user_id = u.id
            LEFT JOIN plans p ON l.plan_id = p.id
            ORDER BY l.created_at DESC LIMIT 50
        `);

        // Fetch activations for each license
        const licensesWithDevices = await Promise.all(rawLicenses.rows.map(async (lic) => {
            const actsRes = await db.execute({
                sql: "SELECT id, hwid, device_name, os, client_version, active, activated_at, last_seen_at FROM activations WHERE license_id = ? ORDER BY activated_at DESC",
                args: [lic.id]
            });

            const activeSeats = actsRes.rows.filter(a => Number(a.active) === 1).length;

            return {
                ...lic,
                active_seats: activeSeats,
                devices: actsRes.rows.map(a => ({
                    id: a.id,
                    hwid: a.hwid,
                    machineName: a.device_name || 'Workstation',
                    os: a.os,
                    appVersion: a.client_version,
                    active: Number(a.active) === 1,
                    activatedAt: a.activated_at,
                    lastSeenAt: a.last_seen_at
                }))
            };
        }));

        return NextResponse.json({
            stats: {
                totalOrders: Number(ordersRes.rows[0]?.total_orders || 0),
                totalRevenueUsd: Number(ordersRes.rows[0]?.total_revenue_cents || 0) / 100,
                totalLicenses: Number(licensesRes.rows[0]?.total_licenses || 0),
                activeLicenses: Number(licensesRes.rows[0]?.active_licenses || 0),
                activeWorkstations: Number(activationsRes.rows[0]?.active_workstations || 0)
            },
            licenses: licensesWithDevices,
            orders: rawOrders.rows.map(o => ({
                id: o.id,
                amountUsd: Number(o.amount_cents || 0) / 100,
                currency: String(o.currency || 'usd').toUpperCase(),
                status: o.status,
                customerEmail: o.customer_email,
                customerName: o.customer_name,
                planName: o.plan_name,
                createdAt: o.created_at
            })),
            plans: plansRes.rows,
            auditLogs: auditRes.rows
        });
    } catch (err: unknown) {
        console.error("Admin licensing overview error:", err);
        return NextResponse.json({ error: 'Failed to load admin overview' }, { status: 500 });
    }
}
