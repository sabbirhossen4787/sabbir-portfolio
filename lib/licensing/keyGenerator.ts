/**
 * @fileoverview SaaS Motion Pro - keyGenerator.ts
 * Cryptographic License Key Generator and Format Validator.
 * Formats: Modern SMP-XXXX-XXXX-XXXX-XXXX & Legacy formats (audited migration only).
 * @copyright 2026 SaaS Motion Pro. All rights reserved.
 */

import crypto from 'crypto';

export class KeyGenerator {
    private static CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Base32 without 0, O, 1, I

    /**
     * Generates a modern secure commercial license key.
     * Format: SMP-XXXX-XXXX-XXXX-XXXX (23 characters)
     */
    static generateKey(prefix = 'SMP'): string {
        const segments: string[] = [];
        for (let s = 0; s < 4; s++) {
            let seg = '';
            const randomBytes = crypto.randomBytes(4);
            for (let i = 0; i < 4; i++) {
                seg += this.CHARSET[randomBytes[i] % this.CHARSET.length];
            }
            segments.push(seg);
        }
        return `${prefix}-${segments.join('-')}`;
    }

    /**
     * Validates whether a key matches recognized commercial patterns.
     */
    static inspectKeyFormat(key: string): { valid: boolean; type: 'modern' | 'legacy' | 'invalid'; normalized: string } {
        if (!key || typeof key !== 'string') {
            return { valid: false, type: 'invalid', normalized: '' };
        }

        const normalized = key.trim().toUpperCase();

        // Explicitly reject retired development bypass keys
        if (normalized === 'SMP-PRO-UNLOCKED' || normalized.startsWith('TMP-')) {
            return { valid: false, type: 'invalid', normalized };
        }

        // Modern 4-segment format: SMP-XXXX-XXXX-XXXX-XXXX
        const modernRegex = /^SMP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (modernRegex.test(normalized)) {
            return { valid: true, type: 'modern', normalized };
        }

        // Legacy format: (SMP|MOTION|PRO|VIP)-* with at least 14 characters and hyphens
        const legacyRegex = /^(SMP|MOTION|PRO|VIP)-[A-Z0-9]{3,}(-[A-Z0-9]{2,})+$/;
        if (legacyRegex.test(normalized) && normalized.length >= 14) {
            return { valid: true, type: 'legacy', normalized };
        }

        return { valid: false, type: 'invalid', normalized };
    }
}
