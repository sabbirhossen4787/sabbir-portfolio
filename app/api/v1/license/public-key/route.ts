import { NextResponse } from 'next/server';
import { SERVER_PUBLIC_KEY } from '@/lib/licensing/keys';

export async function GET() {
    return NextResponse.json({
        algorithm: 'Ed25519',
        format: 'SPKI-PEM',
        publicKey: SERVER_PUBLIC_KEY
    }, {
        headers: {
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
