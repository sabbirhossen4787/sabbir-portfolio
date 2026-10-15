-- SaaS Motion Pro Database Schema for LibSQL / Turso / SQLite
-- All tables for users, plans, orders, licenses, activations, and audit trails

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    billing_interval TEXT NOT NULL DEFAULT 'lifetime', -- 'lifetime' | 'annual'
    max_devices INTEGER NOT NULL DEFAULT 2,
    features_json TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'payment_submitted' | 'completed' | 'rejected' | 'needs_screenshot'
    payment_provider TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'bkash' | 'bank' | 'stripe'
    payment_method TEXT DEFAULT 'bkash', -- 'bkash' | 'bank'
    sender_number TEXT,
    transaction_id TEXT,
    amount_paid TEXT,
    screenshot_url TEXT,
    customer_note TEXT,
    admin_note TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    email_status TEXT DEFAULT 'pending', -- 'pending' | 'sent' | 'delivered' | 'failed' | 'not_configured'
    email_sent_at TEXT,
    email_error TEXT,
    email_message_id TEXT,
    provider_session_id TEXT,
    provider_payment_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    recipient TEXT NOT NULL,
    template TEXT NOT NULL, -- 'license_delivery' | 'admin_notification' | 'test'
    provider TEXT NOT NULL, -- 'resend' | 'webhook'
    provider_message_id TEXT,
    status TEXT NOT NULL, -- 'accepted' | 'delivered' | 'failed' | 'bounced' | 'not_configured'
    error TEXT,
    idempotency_key TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    bkash_number TEXT NOT NULL DEFAULT '01794232652',
    bkash_account_type TEXT NOT NULL DEFAULT 'Personal',
    bkash_instructions TEXT NOT NULL DEFAULT 'Send Money to our bKash personal number and enter the Transaction ID (TrxID) below.',
    bkash_enabled INTEGER NOT NULL DEFAULT 1,
    bank_name TEXT NOT NULL DEFAULT 'Islami Bank Bangladesh Ltd',
    bank_account_name TEXT NOT NULL DEFAULT 'Sabbir Hossen',
    bank_account_number TEXT NOT NULL DEFAULT '20501234567890',
    bank_branch TEXT NOT NULL DEFAULT 'Dhanmondi Branch, Dhaka',
    bank_routing_number TEXT NOT NULL DEFAULT '125272345',
    bank_instructions TEXT NOT NULL DEFAULT 'Transfer the total amount via BEFTN/NPSB/Internet Banking and enter the bank transaction reference below.',
    bank_enabled INTEGER NOT NULL DEFAULT 1,
    usd_to_bdt_rate REAL NOT NULL DEFAULT 125.0,
    plugin_download_url TEXT DEFAULT '',
    support_email TEXT NOT NULL DEFAULT 'myselfsabbirhossen@gmail.com',
    support_phone TEXT NOT NULL DEFAULT '+8801794232652',
    creator_price_bdt INTEGER NOT NULL DEFAULT 1999,
    studio_price_bdt INTEGER NOT NULL DEFAULT 3499,
    lifetime_price_bdt INTEGER NOT NULL DEFAULT 5999,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    event_id TEXT UNIQUE,
    payload_json TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    user_id TEXT,
    plan_id TEXT,
    license_key TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'revoked' | 'expired'
    revoked_reason TEXT,
    max_devices INTEGER NOT NULL DEFAULT 2,
    tier TEXT NOT NULL DEFAULT 'studio_lifetime',
    expires_at TEXT, -- NULL for lifetime
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS activations (
    id TEXT PRIMARY KEY,
    license_id TEXT NOT NULL,
    hwid TEXT NOT NULL,
    device_name TEXT,
    os TEXT,
    client_version TEXT,
    activated_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    UNIQUE(license_id, hwid),
    FOREIGN KEY(license_id) REFERENCES licenses(id)
);

CREATE TABLE IF NOT EXISTS entitlements (
    id TEXT PRIMARY KEY,
    license_id TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    FOREIGN KEY(license_id) REFERENCES licenses(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    license_key TEXT,
    hwid TEXT,
    action TEXT NOT NULL, -- 'ACTIVATE' | 'VALIDATE' | 'DEACTIVATE' | 'REVOKE' | 'PURCHASE'
    result TEXT NOT NULL, -- 'SUCCESS' | 'DENIED' | 'ERROR'
    ip TEXT,
    user_agent TEXT,
    details TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS downloads (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    license_id TEXT,
    file_name TEXT NOT NULL,
    version TEXT NOT NULL,
    ip TEXT,
    downloaded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'in_progress' | 'resolved'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_permissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
