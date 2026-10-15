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
        const { key, hwid, machineName, os, appVersion } = body;

        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

        const result = await LicensingService.activate({
            key,
            hwid,
            machineName,
            os,
            appVersion,
            ip
        });

        const status = result.success ? 200 : (result.code === 'SEAT_LIMIT_REACHED' || result.code === 'LICENSE_REVOKED' ? 403 : 400);

        return NextResponse.json(result, {
            status,
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err: unknown) {
        console.error("Activation endpoint error:", err);
        return NextResponse.json({
            success: false,
            error: 'Internal server error processing activation request'
        }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
