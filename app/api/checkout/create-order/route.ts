import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';

export async function POST(req: NextRequest) {
    try {
        await initDb();
        const db = getDb();
        const body = await req.json();
        const { planId, customerEmail, customerName } = body;

        if (!customerEmail || !customerEmail.includes('@')) {
            return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
        }

        // 1. Get plan info
        const planRes = await db.execute({
            sql: "SELECT * FROM plans WHERE (id = ? OR slug = ?) AND active = 1",
            args: [planId, planId]
        });

        const plan = planRes.rows[0];
        if (!plan) {
            return NextResponse.json({ error: 'Selected plan not found or inactive' }, { status: 404 });
        }

        const now = new Date().toISOString();
        const orderId = `ord_${Math.random().toString(36).substring(2, 9)}`;

        // 2. Check if user exists, else create user
        let userId = '';
        const userRes = await db.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [customerEmail.trim().toLowerCase()]
        });

        if (userRes.rows[0]) {
            userId = String(userRes.rows[0].id);
        } else {
            userId = `usr_${Math.random().toString(36).substring(2, 9)}`;
            await db.execute({
                sql: "INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                args: [userId, customerEmail.trim().toLowerCase(), customerName || 'Valued Creator', 'customer', now, now]
            });
        }

        // 3. Create Pending Order (strictly pending until payment provider verifies transaction)
        await db.execute({
            sql: "INSERT INTO orders (id, user_id, plan_id, status, amount_cents, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [orderId, userId, plan.id, 'pending', plan.price_cents, plan.currency, now, now]
        });

        return NextResponse.json({
            success: true,
            orderId,
            status: 'pending',
            amountCents: plan.price_cents,
            currency: plan.currency,
            planName: plan.name,
            customerEmail: customerEmail.trim().toLowerCase(),
            message: 'Order initiated in pending status. Awaiting payment confirmation webhook.'
        });
    } catch (err: unknown) {
        console.error("Order creation error:", err);
        return NextResponse.json({ error: 'Failed to process checkout order' }, { status: 500 });
    }
}
