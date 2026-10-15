import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/licensing/db';
import { verifySessionToken } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest, filename: string, orderIdFromQuery?: string): Promise<boolean> {
    // 1. Check admin session cookie
    const sessionCookie = req.cookies.get('admin_session')?.value;
    if (sessionCookie) {
        const { valid } = verifySessionToken(sessionCookie);
        if (valid) return Promise.resolve(true);
    }

    // 2. Check admin header or query param
    const adminKey = req.headers.get('x-admin-key') ||
                     req.headers.get('authorization')?.replace('Bearer ', '') ||
                     req.nextUrl.searchParams.get('adminKey');
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (expectedKey && adminKey && adminKey === expectedKey) {
        return Promise.resolve(true);
    }

    // 3. Customer check: verify orderId owns this screenshot
    const orderId = orderIdFromQuery || req.nextUrl.searchParams.get('orderId');
    if (orderId) {
        return (async () => {
            try {
                await initDb();
                const db = getDb();
                const res = await db.execute({
                    sql: 'SELECT id, screenshot_url FROM orders WHERE id = ?',
                    args: [orderId]
                });
                const order = res.rows[0];
                if (order && String(order.screenshot_url || '').includes(filename)) {
                    return true;
                }
            } catch {
                return false;
            }
            return false;
        })();
    }

    return Promise.resolve(false);
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await context.params;
        const cleanFilename = path.basename(filename);

        if (!cleanFilename || cleanFilename !== filename) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        const authorized = await isAuthorized(req, cleanFilename);
        if (!authorized) {
            return NextResponse.json({
                error: 'Unauthorized: Access to payment receipt screenshots requires administrator or order authentication.'
            }, { status: 401 });
        }

        // Check private receipts directory
        const receiptsDir = path.join(process.cwd(), 'data', 'receipts');
        const filepath = path.join(receiptsDir, cleanFilename);

        try {
            await fs.access(filepath);
        } catch {
            // Check legacy upload path if migrated
            const legacyPath = path.join(process.cwd(), 'public', 'uploads', 'receipts', cleanFilename);
            try {
                await fs.access(legacyPath);
                const fileBuffer = await fs.readFile(legacyPath);
                const ext = path.extname(cleanFilename).toLowerCase();
                const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
                return new NextResponse(fileBuffer, {
                    headers: {
                        'Content-Type': contentType,
                        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                        'X-Content-Type-Options': 'nosniff'
                    }
                });
            } catch {
                return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
            }
        }

        const fileBuffer = await fs.readFile(filepath);
        const ext = path.extname(cleanFilename).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'X-Content-Type-Options': 'nosniff'
            }
        });
    } catch (err: unknown) {
        console.error('Receipt serve error:', err);
        return NextResponse.json({ error: 'Failed to retrieve receipt' }, { status: 500 });
    }
}
