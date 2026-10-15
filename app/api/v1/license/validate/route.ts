import { NextRequest, NextResponse } from 'next/server';
import { LicensingService } from '@/lib/licensing/licensingService';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
        }
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, hwid, token } = body;
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

        const result = await LicensingService.validate(key, hwid, token, ip);

        return NextResponse.json(result, {
            status: result.valid ? 200 : 401,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (err: unknown) {
        console.error("Validation endpoint error:", err);
        return NextResponse.json({
            valid: false,
            error: 'Internal server error processing validation'
        }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
