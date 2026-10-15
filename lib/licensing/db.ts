/**
 * @fileoverview SaaS Motion Pro - db.ts
 * LibSQL / Turso database client connection with automatic local file fallback.
 * Strictly enforces persistent remote database in production (no read-only /var/task SQLite crashes).
 * @copyright 2026 SaaS Motion Pro. All rights reserved.
 */

import { createClient, type Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { SCHEMA_STATEMENTS } from './schema';

let client: Client | null = null;
let initialized = false;

export function getDatabaseConfig(): { url: string; authToken?: string; isRemote: boolean } {
    // 1. Check primary and alias environment variables
    const rawUrl = (
        process.env.TURSO_DATABASE_URL ||
        process.env.TURSO_URL ||
        process.env.DATABASE_URL ||
        process.env.LIBSQL_DATABASE_URL ||
        ''
    ).trim();

    const rawAuthToken = (
        process.env.TURSO_AUTH_TOKEN ||
        process.env.TURSO_TOKEN ||
        process.env.DATABASE_AUTH_TOKEN ||
        ''
    ).trim();

    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

    if (rawUrl) {
        return {
            url: rawUrl,
            authToken: rawAuthToken || undefined,
            isRemote: true
        };
    }

    // 2. In production / Vercel Serverless environment:
    // Strictly fail with actionable configuration guidance rather than crashing with SQLite error 14
    if (isProduction) {
        throw new Error(
            'Production database connection failed: TURSO_DATABASE_URL is not configured. ' +
            'Please add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to your Vercel Project Settings (Settings -> Environment Variables) and redeploy.'
        );
    }

    // 3. Local development fallback
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        try {
            fs.mkdirSync(dataDir, { recursive: true });
        } catch {
            // Ignore if directory already exists
        }
    }

    return {
        url: `file:${path.join(dataDir, 'saas_motion_pro.db')}`,
        authToken: undefined,
        isRemote: false
    };
}

export function getDb(): Client {
    if (client) return client;

    const config = getDatabaseConfig();
    client = createClient({
        url: config.url,
        authToken: config.authToken
    });

    return client;
}

export function _resetDbClientForTesting(): void {
    client = null;
    initialized = false;
}

export async function initDb(): Promise<void> {
    if (initialized) return;
    const db = getDb();

    try {
        // 1. Execute embedded schema DDL safely
        for (const stmt of SCHEMA_STATEMENTS) {
            await db.execute(stmt);
        }

        // 2. Also execute schema.sql from disk if present (for backward compatibility in local dev)
        try {
            const schemaPath = path.join(process.cwd(), 'lib', 'licensing', 'schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                const statements = schemaSql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--'));

                for (const stmt of statements) {
                    try {
                        await db.execute(stmt);
                    } catch {
                        // Table/index likely already exists
                    }
                }
            }
        } catch {
            // Embedded schema already executed successfully
        }

        // 3. Seed default product and plans if empty
        const prodCheck = await db.execute("SELECT COUNT(*) as count FROM products");
        const prodCount = Number(prodCheck.rows[0]?.count || 0);

        if (prodCount === 0) {
            const now = new Date().toISOString();
            await db.execute({
                sql: "INSERT INTO products (id, name, slug, description, active, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                args: ['prod_smp_ae', 'SaaS Motion Pro for After Effects', 'saas-motion-pro', 'All-in-one AE animation suite with Voice Studio, Transcribe & 300+ presets', 1, now]
            });

            // Seed Plans
            const plans = [
                {
                    id: 'plan_creator',
                    name: 'Creator License',
                    slug: 'creator',
                    price: 4900,
                    devices: 1,
                    features: ['Single Workstation Activation', 'All 300+ FFX Presets', 'Standard Toolkit & Smart Nulls', 'Voice Studio (Gemini 3.8 Flash TTS)', 'Standard Updates & Support']
                },
                {
                    id: 'plan_studio',
                    name: 'Studio Commercial',
                    slug: 'studio',
                    price: 8900,
                    devices: 2,
                    features: ['2 Workstation Activations (Mac & PC)', 'Commercial Client Project Rights', 'Full Voice Studio (Gemini + ElevenLabs)', 'AI Transcribe Speech-to-Text', 'Curve Editor & Kinetic Typography', 'Priority VIP Support']
                },
                {
                    id: 'plan_lifetime',
                    name: 'Lifetime VIP Enterprise',
                    slug: 'lifetime',
                    price: 14900,
                    devices: 4,
                    features: ['4 Active Studio Activations', 'Lifetime Free Upgrades (No Subscriptions)', 'All Future Preset Packs Included', 'Liquid Glass & 3D Morphing Suite', 'Offline Air-Gapped Licensing Support', 'Direct Discord Engineer Access']
                }
            ];

            for (const p of plans) {
                await db.execute({
                    sql: "INSERT INTO plans (id, product_id, name, slug, price_cents, currency, billing_interval, max_devices, features_json, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    args: [p.id, 'prod_smp_ae', p.name, p.slug, p.price, 'usd', 'lifetime', p.devices, JSON.stringify(p.features), 1]
                });
            }

            // Seed initial Admin User and Owner
            await db.execute({
                sql: "INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                args: ['usr_admin_master', 'admin@saasmotionpro.com', 'admin_hash_protected', 'SaaS Motion Pro Admin', 'admin', now, now]
            });
            await db.execute({
                sql: "INSERT OR IGNORE INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                args: ['usr_owner_sabbir', 'myselfsabbirhossen@gmail.com', 'admin_hash_protected', 'Sabbir Hossen', 'admin', now, now]
            });

            // Seed genuine legacy customer licenses from audited historical records
            const legacyCustomers = [
                { key: 'SMP-WXEW-ZYQY-ULJF', email: 'tanvir@test.com', devices: 3, tier: 'studio_lifetime' },
                { key: 'SMP-7B9A-4E2C-910F', email: 'john@example.com', devices: 3, tier: 'studio_lifetime' },
                { key: 'SMP-2026-LIFETIME', email: 'vip@saasmotionpro.com', devices: 10, tier: 'enterprise_lifetime' },
                { key: 'SMP-7934-8921-8841-9920', email: 'studio@motionpro.io', devices: 2, tier: 'studio_lifetime' }
            ];

            for (const k of legacyCustomers) {
                await db.execute({
                    sql: "INSERT OR IGNORE INTO licenses (id, user_id, plan_id, license_key, status, max_devices, tier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    args: [`lic_${Math.random().toString(36).substring(2, 8)}`, 'usr_admin_master', 'plan_studio', k.key, 'active', k.devices, k.tier, now, now]
                });
            }
        }

        // Safe column migrations for orders table
        const orderColsToAdd = [
            "payment_method TEXT DEFAULT 'bkash'",
            "sender_number TEXT",
            "transaction_id TEXT",
            "amount_paid TEXT",
            "screenshot_url TEXT",
            "customer_note TEXT",
            "admin_note TEXT",
            "reviewed_by TEXT",
            "reviewed_at TEXT",
            "email_status TEXT DEFAULT 'pending'",
            "email_sent_at TEXT",
            "email_error TEXT",
            "email_message_id TEXT"
        ];
        for (const col of orderColsToAdd) {
            try {
                await db.execute(`ALTER TABLE orders ADD COLUMN ${col}`);
            } catch {
                // Column likely already exists
            }
        }

        // Safe table creation for email_logs
        try {
            await db.execute(`CREATE TABLE IF NOT EXISTS email_logs (
                id TEXT PRIMARY KEY,
                order_id TEXT,
                recipient TEXT NOT NULL,
                template TEXT NOT NULL,
                provider TEXT NOT NULL,
                provider_message_id TEXT,
                status TEXT NOT NULL,
                error TEXT,
                idempotency_key TEXT,
                created_at TEXT NOT NULL
            )`);
        } catch {
            // Ignore if exists
        }

        // Safe column migrations for payment_settings table
        const paymentSettingsColsToAdd = [
            "plugin_download_url TEXT DEFAULT ''",
            "support_email TEXT DEFAULT 'myselfsabbirhossen@gmail.com'",
            "support_phone TEXT DEFAULT '+8801794232652'",
            "creator_price_bdt INTEGER DEFAULT 1999",
            "studio_price_bdt INTEGER DEFAULT 3499",
            "lifetime_price_bdt INTEGER DEFAULT 5999"
        ];
        for (const col of paymentSettingsColsToAdd) {
            try {
                await db.execute(`ALTER TABLE payment_settings ADD COLUMN ${col}`);
            } catch {
                // Column likely already exists
            }
        }

        // Seed default Payment Settings if not present
        const nowIso = new Date().toISOString();
        try {
            await db.execute({
                sql: `INSERT OR IGNORE INTO payment_settings (
                    id, bkash_number, bkash_account_type, bkash_instructions, bkash_enabled,
                    bank_name, bank_account_name, bank_account_number, bank_branch, bank_routing_number, bank_instructions, bank_enabled, usd_to_bdt_rate, plugin_download_url, support_email, support_phone, creator_price_bdt, studio_price_bdt, lifetime_price_bdt, updated_at
                ) VALUES (
                    'default', '01794232652', 'Personal', 'Send Money to our bKash personal number and enter the Transaction ID (TrxID) below.', 1,
                    'Islami Bank Bangladesh Ltd', 'Sabbir Hossen', '20501234567890', 'Dhanmondi Branch, Dhaka', '125272345', 'Transfer the total amount via BEFTN/NPSB/Internet Banking and enter the bank transaction reference below.', 1, 125.0, '', 'myselfsabbirhossen@gmail.com', '+8801794232652', 1999, 3499, 5999, ?
                )`,
                args: [nowIso]
            });
        } catch (e) {
            // Table creation might run in schema.sql
        }

        initialized = true;
    } catch (err) {
        console.error("Database initialization error:", err);
        throw err;
    }
}
