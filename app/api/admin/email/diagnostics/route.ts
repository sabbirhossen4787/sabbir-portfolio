import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import { verifySessionToken } from '@/lib/auth';
import { EmailService } from '@/lib/licensing/emailService';

function checkAdminAuth(req: NextRequest): boolean {
    const adminKey = req.headers.get('x-admin-key') || req.headers.get('authorization')?.replace('Bearer ', '');
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (expectedKey && adminKey && adminKey === expectedKey) return true;

    const sessionCookie = req.cookies.get('admin_session')?.value;
    if (sessionCookie) {
        const { valid } = verifySessionToken(sessionCookie);
        if (valid) return true;
    }
    return false;
}

/**
 * GET /api/admin/email/diagnostics
 * Returns the server-side email service status, configuration health, and recent delivery logs.
 * Protected by admin authorization. Does NOT expose secrets.
 */
export async function GET(req: NextRequest) {
    try {
        if (!checkAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
        }

        await initDb();
        const db = getDb();

        const diag = EmailService.getDiagnostics();

        // Query recent delivery logs
        const logsRes = await db.execute({
            sql: `SELECT id, order_id, recipient, template, provider, provider_message_id, status, error, created_at
                  FROM email_logs
                  ORDER BY created_at DESC
                  LIMIT 20`
        });

        // Query log statistics
        const statsRes = await db.execute({
            sql: `SELECT status, count(*) as count FROM email_logs GROUP BY status`
        });

        const statusCounts: Record<string, number> = {};
        for (const row of statsRes.rows) {
            statusCounts[String(row.status)] = Number(row.count);
        }

        return NextResponse.json({
            success: true,
            diagnostics: diag,
            statusCounts,
            recentLogs: logsRes.rows
        });
    } catch (err: unknown) {
        console.error('Email diagnostics error:', err);
        const msg = err instanceof Error ? err.message : 'Failed to query email diagnostics';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

/**
 * POST /api/admin/email/diagnostics
 * Sends a controlled test email to the configured ADMIN_EMAIL.
 * Protected by admin authorization.
 */
export async function POST(req: NextRequest) {
    try {
        if (!checkAdminAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const targetEmail = typeof body.targetEmail === 'string' && body.targetEmail.includes('@')
            ? body.targetEmail.trim()
            : undefined;

        const result = await EmailService.sendTestEmail(targetEmail);

        return NextResponse.json({
            success: result.success,
            status: result.status,
            provider: result.provider,
            messageId: result.messageId,
            error: result.error,
            message: result.success
                ? `Test email accepted by Resend (ID: ${result.messageId}). Check your inbox at ${targetEmail || process.env.ADMIN_EMAIL || 'myselfsabbirhossen@gmail.com'}.`
                : `Test email dispatch failed: ${result.error || 'Provider unconfigured'}`
        });
    } catch (err: unknown) {
        console.error('Test email execution error:', err);
        const msg = err instanceof Error ? err.message : 'Failed to send test email';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
