import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await initDb();
        const db = getDb();

        const res = await db.execute("SELECT * FROM payment_settings WHERE id = 'default'");
        const s = res.rows[0] || {};

        return NextResponse.json({
            bkashNumber: String(s.bkash_number || '01794232652'),
            bkashAccountType: String(s.bkash_account_type || 'Personal'),
            bkashInstructions: String(s.bkash_instructions || 'Send Money to our bKash personal number and enter the Transaction ID (TrxID) below.'),
            bkashEnabled: Number(s.bkash_enabled ?? 1) === 1,
            bankName: String(s.bank_name || 'Islami Bank Bangladesh Ltd'),
            bankAccountName: String(s.bank_account_name || 'Sabbir Hossen'),
            bankAccountNumber: String(s.bank_account_number || '20501234567890'),
            bankBranch: String(s.bank_branch || 'Dhanmondi Branch, Dhaka'),
            bankRoutingNumber: String(s.bank_routing_number || '125272345'),
            bankInstructions: String(s.bank_instructions || 'Transfer the total amount via BEFTN/NPSB/Internet Banking and enter the bank transaction reference below.'),
            bankEnabled: Number(s.bank_enabled ?? 1) === 1,
            usdToBdtRate: Number(s.usd_to_bdt_rate || 125.0)
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (err: unknown) {
        console.error("Public payment settings error:", err);
        // Resilient fallback with exact required bKash number
        return NextResponse.json({
            bkashNumber: '01794232652',
            bkashAccountType: 'Personal',
            bkashInstructions: 'Send Money to our bKash personal number and enter the Transaction ID (TrxID) below.',
            bkashEnabled: true,
            bankName: 'Islami Bank Bangladesh Ltd',
            bankAccountName: 'Sabbir Hossen',
            bankAccountNumber: '20501234567890',
            bankBranch: 'Dhanmondi Branch, Dhaka',
            bankRoutingNumber: '125272345',
            bankInstructions: 'Transfer the total amount via BEFTN/NPSB/Internet Banking and enter the bank transaction reference below.',
            bankEnabled: true,
            usdToBdtRate: 125.0
        });
    }
}
