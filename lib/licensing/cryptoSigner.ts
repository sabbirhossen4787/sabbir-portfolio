/**
 * @fileoverview SaaS Motion Pro - cryptoSigner.ts
 * Asymmetric Ed25519 Cryptographic Token Signer and Verifier.
 * Generates signed entitlement tokens on the server and verifies them
 * offline on the client using only the public key.
 * @copyright 2026 SaaS Motion Pro. All rights reserved.
 */

import crypto from 'crypto';
import { SERVER_PRIVATE_KEY, SERVER_PUBLIC_KEY } from './keys';

export interface TokenPayload {
    iss?: string;
    iat?: number;
    exp?: number;
    sub?: string;
    licenseId: string;
    key: string;
    hwid: string;
    tier: string;
    features: string[];
    maxDevices: number;
    machineName?: string;
    customerEmail?: string;
    status: string;
    [key: string]: unknown;
}

export interface VerificationResult {
    valid: boolean;
    payload?: TokenPayload;
    error?: string;
}

export class CryptoSigner {
    private privateKey?: string;
    private publicKey?: string;

    constructor(options: { privateKey?: string; publicKey?: string } = {}) {
        this.privateKey = options.privateKey;
        this.publicKey = options.publicKey;
    }

    private getSigningKey(): string {
        if (this.privateKey !== undefined) {
            return this.privateKey;
        }
        return process.env.LICENSING_PRIVATE_KEY || SERVER_PRIVATE_KEY || '';
    }

    private getVerificationKey(): string {
        if (this.publicKey !== undefined) {
            return this.publicKey;
        }
        return process.env.LICENSING_PUBLIC_KEY || SERVER_PUBLIC_KEY || '';
    }

    /**
     * Issues an asymmetrically signed entitlement token.
     * Output format: Base64URL(header).Base64URL(payload).Base64URL(ed25519_signature)
     */
    signToken(payload: Partial<TokenPayload>): string {
        const privKey = this.getSigningKey();
        if (!privKey) {
            throw new Error("Cannot sign token: server private signing key is not configured.");
        }

        const header = {
            alg: 'EdDSA',
            typ: 'SMP-LIC',
            ver: '1.0'
        };

        const now = Math.floor(Date.now() / 1000);
        const enrichedPayload: TokenPayload = {
            iss: 'https://sabbirhossen.site',
            iat: now,
            exp: payload.exp || (now + (30 * 24 * 3600)), // Default 30 days validity
            licenseId: payload.licenseId || 'lic_unknown',
            key: payload.key || '',
            hwid: payload.hwid || '',
            tier: payload.tier || 'studio',
            features: payload.features || ['presets_300', 'voice_studio', 'transcribe_stt'],
            maxDevices: payload.maxDevices || 2,
            status: payload.status || 'active',
            ...payload
        };

        const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encPayload = Buffer.from(JSON.stringify(enrichedPayload)).toString('base64url');
        const dataToSign = Buffer.from(`${encHeader}.${encPayload}`, 'utf8');

        const signature = crypto.sign(null, dataToSign, privKey);
        const encSignature = signature.toString('base64url');

        return `${encHeader}.${encPayload}.${encSignature}`;
    }

    /**
     * Verifies an entitlement token using only the public key.
     */
    verifyToken(token: string, expectedHwid: string | null = null): VerificationResult {
        if (!token || typeof token !== 'string') {
            return { valid: false, error: 'Token is missing or invalid' };
        }

        const pubKey = this.getVerificationKey();
        if (!pubKey) {
            return { valid: false, error: 'Public key not configured for verification' };
        }

        const parts = token.trim().split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Malformed token structure' };
        }

        const [encHeader, encPayload, encSignature] = parts;

        try {
            const dataToVerify = Buffer.from(`${encHeader}.${encPayload}`, 'utf8');
            const signature = Buffer.from(encSignature, 'base64url');

            const isVerified = crypto.verify(null, dataToVerify, pubKey, signature);
            if (!isVerified) {
                return { valid: false, error: 'Cryptographic signature verification failed' };
            }

            const payloadJson = Buffer.from(encPayload, 'base64url').toString('utf8');
            const payload: TokenPayload = JSON.parse(payloadJson);

            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return { valid: false, error: 'Entitlement token has expired' };
            }

            if (expectedHwid && payload.hwid) {
                if (payload.hwid.toLowerCase() !== expectedHwid.toLowerCase()) {
                    return { valid: false, error: `Hardware mismatch: bound to ${payload.hwid}` };
                }
            }

            return { valid: true, payload };
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : 'Unknown verification error';
            return { valid: false, error: `Token parsing failed: ${errMsg}` };
        }
    }
}
