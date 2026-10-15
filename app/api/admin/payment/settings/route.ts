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

        const {
            bkashNumber = '01794232652',
            bkashAccountType = 'Personal',
            bkashInstructions = '',
            bkashEnabled = true,
            bankName = '',
            bankAccountName = '',
            bankAccountNumber = '',
            bankBranch = '',
            bankRoutingNumber = '',
            bankInstructions = '',
            bankEnabled = true,
            usdToBdtRate = 125.0
        } = body;

        const now = new Date().toISOString();

        await db.execute({
            sql: `INSERT INTO payment_settings (
                id, bkash_number, bkash_account_type, bkash_instructions, bkash_enabled,
                bank_name, bank_account_name, bank_account_number, bank_branch, bank_routing_number, bank_instructions, bank_enabled, usd_to_bdt_rate, updated_at
            ) VALUES (
                'default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            ) ON CONFLICT(id) DO UPDATE SET
                bkash_number = excluded.bkash_number,
                bkash_account_type = excluded.bkash_account_type,
                bkash_instructions = excluded.bkash_instructions,
                bkash_enabled = excluded.bkash_enabled,
                bank_name = excluded.bank_name,
                bank_account_name = excluded.bank_account_name,
                bank_account_number = excluded.bank_account_number,
                bank_branch = excluded.bank_branch,
                bank_routing_number = excluded.bank_routing_number,
                bank_instructions = excluded.bank_instructions,
                bank_enabled = excluded.bank_enabled,
                usd_to_bdt_rate = excluded.usd_to_bdt_rate,
                updated_at = excluded.updated_at`,
            args: [
                bkashNumber.trim(),
                bkashAccountType.trim(),
                bkashInstructions.trim(),
                bkashEnabled ? 1 : 0,
                bankName.trim(),
                bankAccountName.trim(),
                bankAccountNumber.trim(),
                bankBranch.trim(),
                bankRoutingNumber.trim(),
                bankInstructions.trim(),
                bankEnabled ? 1 : 0,
                Number(usdToBdtRate) || 125.0,
                now
            ]
        });

        return NextResponse.json({
            success: true,
            message: 'Payment instructions and settings updated successfully.'
        });
    } catch (err: unknown) {
        console.error("Admin payment settings error:", err);
        return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 });
    }
}
