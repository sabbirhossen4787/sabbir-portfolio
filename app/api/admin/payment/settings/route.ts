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
            return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();
        const res = await db.execute("SELECT * FROM payment_settings WHERE id = 'default'");
        const s = res.rows[0] || {};

        return NextResponse.json({
            success: true,
            settings: {
                bkashNumber: String(s.bkash_number || '01794232652'),
                bkashAccountType: String(s.bkash_account_type || 'Personal'),
                bkashInstructions: String(s.bkash_instructions || 'Send Money to our bKash Personal number. Enter your name or order reference in the counter/reference.'),
                bkashEnabled: Number(s.bkash_enabled ?? 1) === 1,
                bankName: String(s.bank_name || 'Islami Bank Bangladesh Ltd'),
                bankAccountHolder: String(s.bank_account_name || 'Sabbir Hossen'),
                bankAccountNumber: String(s.bank_account_number || '2050123456789'),
                bankBranch: String(s.bank_branch || 'Dhanmondi Branch, Dhaka'),
                bankRoutingNumber: String(s.bank_routing_number || '125272642'),
                bankInstructions: String(s.bank_instructions || 'Transfer via online banking (BEFTN/NPSB/RTGS) or cash deposit. Upload deposit slip or app screenshot.'),
                bankEnabled: Number(s.bank_enabled ?? 1) === 1,
                usdToBdtRate: Number(s.usd_to_bdt_rate || 125.0),
                pluginDownloadUrl: String(s.plugin_download_url || ''),
                supportEmail: String(s.support_email || 'myselfsabbirhossen@gmail.com'),
                supportPhone: String(s.support_phone || '+8801794232652'),
                creatorPriceBdt: Number(s.creator_price_bdt || 1999),
                studioPriceBdt: Number(s.studio_price_bdt || 3499),
                lifetimePriceBdt: Number(s.lifetime_price_bdt || 5999),
                updatedAt: String(s.updated_at || '')
            }
        });
    } catch (err: unknown) {
        console.error("Admin payment settings GET error:", err);
        return NextResponse.json({ error: 'Failed to retrieve payment settings' }, { status: 500 });
    }
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
            bankAccountHolder = '',
            bankAccountNumber = '',
            bankBranch = '',
            bankRoutingNumber = '',
            bankInstructions = '',
            bankEnabled = true,
            usdToBdtRate = 125.0,
            pluginDownloadUrl = '',
            supportEmail = 'myselfsabbirhossen@gmail.com',
            supportPhone = '+8801794232652',
            creatorPriceBdt = 1999,
            studioPriceBdt = 3499,
            lifetimePriceBdt = 5999
        } = body;

        const effectiveAccountName = (bankAccountName || bankAccountHolder || 'Sabbir Hossen').trim();
        const now = new Date().toISOString();

        await db.execute({
            sql: `INSERT INTO payment_settings (
                id, bkash_number, bkash_account_type, bkash_instructions, bkash_enabled,
                bank_name, bank_account_name, bank_account_number, bank_branch, bank_routing_number, bank_instructions, bank_enabled, usd_to_bdt_rate,
                plugin_download_url, support_email, support_phone, creator_price_bdt, studio_price_bdt, lifetime_price_bdt, updated_at
            ) VALUES (
                'default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
                plugin_download_url = excluded.plugin_download_url,
                support_email = excluded.support_email,
                support_phone = excluded.support_phone,
                creator_price_bdt = excluded.creator_price_bdt,
                studio_price_bdt = excluded.studio_price_bdt,
                lifetime_price_bdt = excluded.lifetime_price_bdt,
                updated_at = excluded.updated_at`,
            args: [
                bkashNumber.trim(),
                bkashAccountType.trim(),
                bkashInstructions.trim(),
                bkashEnabled ? 1 : 0,
                bankName.trim(),
                effectiveAccountName,
                bankAccountNumber.trim(),
                bankBranch.trim(),
                bankRoutingNumber.trim(),
                bankInstructions.trim(),
                bankEnabled ? 1 : 0,
                Number(usdToBdtRate) || 125.0,
                (pluginDownloadUrl || '').trim(),
                (supportEmail || 'myselfsabbirhossen@gmail.com').trim(),
                (supportPhone || '+8801794232652').trim(),
                Number(creatorPriceBdt) || 1999,
                Number(studioPriceBdt) || 3499,
                Number(lifetimePriceBdt) || 5999,
                now
            ]
        });

        return NextResponse.json({
            success: true,
            message: 'Payment instructions, download link, and pricing settings updated successfully.'
        });
    } catch (err: unknown) {
        console.error("Admin payment settings error:", err);
        return NextResponse.json({ error: 'Failed to update payment settings' }, { status: 500 });
    }
}
