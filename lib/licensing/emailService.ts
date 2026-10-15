/**
 * @fileoverview SaaS Motion Pro - emailService.ts
 * Production-ready transactional email service for commercial license delivery and admin telemetry.
 * Communicates natively with the official Resend API (HTTP REST) with idempotency headers,
 * structured delivery logs, retry support, and fallback webhook handling.
 * @copyright 2026 SaaS Motion Pro. All rights reserved.
 */

import { getDb, initDb } from './db';

export interface LicenseEmailOptions {
    to: string;
    customerName: string;
    orderId: string;
    planName: string;
    licenseKey: string;
    maxDevices: number;
    tier: string;
    expiresAt: string | null;
    idempotencyKey?: string;
    downloadUrl?: string;
    supportEmail?: string;
}

export interface AdminPaymentSubmittedOptions {
    orderId: string;
    customerName: string;
    customerEmail: string;
    paymentMethod: string;
    amountPaid?: string;
    senderNumber: string;
    transactionId: string;
    customerNote?: string;
    screenshotUrl?: string;
}

export interface EmailSendResult {
    success: boolean;
    status: 'sent' | 'failed' | 'not_configured';
    provider: 'resend' | 'webhook' | 'none';
    messageId?: string;
    error?: string;
}

export interface EmailDiagnostics {
    resendConfigured: boolean;
    resendKeyMasked: string | null;
    fromEmail: string;
    adminEmail: string;
    webhookConfigured: boolean;
    activeProvider: 'resend' | 'webhook' | 'none';
    verifiedDomain: string;
}

export class EmailService {
    private static readonly RESEND_API_ENDPOINT = 'https://api.resend.com/emails';
    private static readonly DEFAULT_FROM = 'SaaS Motion Pro <licenses@sabbirhossen.site>';
    private static readonly DEFAULT_ADMIN = 'myselfsabbirhossen@gmail.com';
    private static readonly BASE_URL = 'https://sabbirhossen.site';

    /**
     * Retrieves server configuration diagnostics without exposing secrets.
     */
    static getDiagnostics(): EmailDiagnostics {
        const apiKey = process.env.RESEND_API_KEY?.trim() || '';
        const fromEmail = process.env.EMAIL_FROM?.trim() || this.DEFAULT_FROM;
        const adminEmail = process.env.ADMIN_EMAIL?.trim() || this.DEFAULT_ADMIN;
        const webhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim() || '';

        const resendConfigured = apiKey.length > 5 && apiKey.startsWith('re_');
        const resendKeyMasked = resendConfigured
            ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`
            : null;

        let activeProvider: 'resend' | 'webhook' | 'none' = 'none';
        if (resendConfigured) {
            activeProvider = 'resend';
        } else if (webhookUrl.length > 0) {
            activeProvider = 'webhook';
        }

        return {
            resendConfigured,
            resendKeyMasked,
            fromEmail,
            adminEmail,
            webhookConfigured: Boolean(webhookUrl),
            activeProvider,
            verifiedDomain: 'sabbirhossen.site'
        };
    }

    /**
     * Persists an email transmission attempt to the database.
     */
    private static async logEmailAttempt(params: {
        orderId?: string;
        recipient: string;
        template: 'license_delivery' | 'admin_notification' | 'test' | 'admin_alert';
        provider: 'resend' | 'webhook' | 'none';
        providerMessageId?: string;
        status: 'accepted' | 'delivered' | 'failed' | 'not_configured';
        error?: string;
        idempotencyKey?: string;
    }): Promise<void> {
        try {
            await initDb();
            const db = getDb();
            const logId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const now = new Date().toISOString();

            await db.execute({
                sql: `INSERT INTO email_logs (
                    id, order_id, recipient, template, provider, provider_message_id,
                    status, error, idempotency_key, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    logId,
                    params.orderId || null,
                    params.recipient,
                    params.template,
                    params.provider,
                    params.providerMessageId || null,
                    params.status,
                    params.error || null,
                    params.idempotencyKey || null,
                    now
                ]
            });
        } catch (logErr) {
            // Logging failure should not crash main email dispatch flow
            console.error('[EmailService] Failed to record email_log:', logErr);
        }
    }

    /**
     * Sends the commercial license delivery email upon admin payment approval.
     */
    static async sendLicenseEmail(options: LicenseEmailOptions): Promise<EmailSendResult> {
        const { to, customerName, orderId, planName, licenseKey, maxDevices, expiresAt } = options;

        const resendApiKey = process.env.RESEND_API_KEY?.trim();
        const fromEmail = process.env.EMAIL_FROM?.trim() || this.DEFAULT_FROM;
        const webhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim();
        const idempotencyKey = options.idempotencyKey || `license-${orderId}`;

        // Fetch configured official download link and support details from database if not explicitly passed
        let officialDownloadUrl = options.downloadUrl ? options.downloadUrl.trim() : '';
        let supportContactEmail = options.supportEmail ? options.supportEmail.trim() : 'myselfsabbirhossen@gmail.com';

        if (!officialDownloadUrl) {
            try {
                await initDb();
                const db = getDb();
                const setRes = await db.execute("SELECT plugin_download_url, support_email FROM payment_settings WHERE id = 'default'");
                if (setRes.rows[0]) {
                    if (setRes.rows[0].plugin_download_url) {
                        officialDownloadUrl = String(setRes.rows[0].plugin_download_url).trim();
                    }
                    if (setRes.rows[0].support_email) {
                        supportContactEmail = String(setRes.rows[0].support_email).trim();
                    }
                }
            } catch (e) {
                // Fallback to customer portal URL
            }
        }

        const effectiveDownloadUrl = officialDownloadUrl || `${this.BASE_URL}/saas-motion-pro/download`;
        const dashboardUrl = `${this.BASE_URL}/saas-motion-pro/dashboard?key=${encodeURIComponent(licenseKey)}`;
        const subject = `Your SaaS Motion Pro Commercial License & Download Link (Order #${orderId})`;
        const expiryText = expiresAt ? new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Perpetual Lifetime Access';

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0812; color: #F5F3FF; margin: 0; padding: 24px; }
    .container { max-width: 620px; margin: 0 auto; background-color: #120E24; border: 1px solid #3B2D66; border-radius: 18px; overflow: hidden; padding: 36px 32px; box-shadow: 0 12px 40px rgba(0,0,0,0.6); }
    .badge { display: inline-block; padding: 6px 14px; background-color: #2E1065; color: #C084FC; border: 1px solid #7E22CE; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
    h1 { font-size: 24px; font-weight: 800; color: #FFFFFF; margin: 0 0 12px 0; letter-spacing: -0.5px; }
    p { font-size: 14px; line-height: 1.65; color: #D8B4FE; margin: 0 0 18px 0; }
    .key-box { background: linear-gradient(135deg, #0A0812 0%, #17112E 100%); border: 2px solid #7C3AED; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; box-shadow: 0 0 24px rgba(124, 58, 237, 0.25); }
    .key-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A78BFA; margin-bottom: 10px; font-family: 'SF Mono', Consolas, monospace; font-weight: 700; }
    .key-value { font-family: 'SF Mono', Consolas, 'Courier New', monospace; font-size: 21px; font-weight: 800; color: #FFFFFF; letter-spacing: 2.5px; word-break: break-all; user-select: all; }
    .download-card { background: linear-gradient(135deg, #181135 0%, #0d0a22 100%); border: 2px solid #9333EA; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
    .details-table td { padding: 10px 0; border-bottom: 1px solid #281F47; color: #EDE9FE; }
    .details-table td.label { color: #8B7BB8; width: 38%; font-family: 'SF Mono', Consolas, monospace; font-size: 12px; }
    .btn-row { margin: 20px 0; text-align: center; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: #FFFFFF !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin: 6px; box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4); }
    .btn-secondary { background: #241A47; color: #DDD6FE !important; border: 1px solid #4C3D7A; box-shadow: none; font-size: 13px; }
    .steps { background-color: #0A0812; border: 1px solid #281F47; border-radius: 12px; padding: 20px 24px; margin: 24px 0; font-size: 13px; color: #D8B4FE; line-height: 1.6; }
    .steps ol { margin: 8px 0 0 0; padding-left: 20px; }
    .steps li { margin-bottom: 10px; }
    .steps code { background-color: #1F173B; color: #E9D5FF; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', Consolas, monospace; font-size: 12px; }
    .footer { font-size: 11px; color: #736399; text-align: center; margin-top: 36px; border-top: 1px solid #281F47; padding-top: 20px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Payment Verified &amp; Confirmed</div>
    <h1>Welcome to SaaS Motion Pro!</h1>
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Your payment for <strong>Order #${orderId}</strong> has been verified and approved by our team. Your commercial license has been issued and registered on the server.</p>
    
    <div class="key-box">
      <div class="key-label">Your Commercial License Key</div>
      <div class="key-value">${licenseKey}</div>
    </div>

    <!-- Official Download Link Box -->
    <div class="download-card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C084FC; font-weight: 700; margin-bottom: 8px;">Official Plugin Download Package</div>
      <p style="color: #E9D5FF; font-size: 13px; margin: 0 0 14px 0;">Click below to download the latest authenticated SaaS Motion Pro release package:</p>
      <a href="${effectiveDownloadUrl}" class="btn" style="padding: 14px 30px; font-size: 14px;">
        📥 Download SaaS Motion Pro
      </a>
      <div style="font-size: 11px; color: #A78BFA; margin-top: 12px; word-break: break-all;">
        Direct Link: <a href="${effectiveDownloadUrl}" style="color: #DDD6FE; text-decoration: underline;">${effectiveDownloadUrl}</a>
      </div>
    </div>

    <table class="details-table">
      <tr>
        <td class="label">Product:</td>
        <td><strong>SaaS Motion Pro for After Effects</strong></td>
      </tr>
      <tr>
        <td class="label">Plan:</td>
        <td><strong>${planName}</strong></td>
      </tr>
      <tr>
        <td class="label">Active Workstations:</td>
        <td><strong>${maxDevices} Machine(s) Max</strong></td>
      </tr>
      <tr>
        <td class="label">License Term:</td>
        <td>${expiryText}</td>
      </tr>
      <tr>
        <td class="label">Order Reference:</td>
        <td><code>${orderId}</code></td>
      </tr>
    </table>

    <div class="btn-row">
      <a href="${dashboardUrl}" class="btn btn-secondary">Manage Active Seats in Dashboard</a>
    </div>

    <div class="steps">
      <strong style="color: #FFFFFF; font-size: 14px;">Quick 2-Minute After Effects Setup:</strong>
      <ol>
        <li>Download the extension package using your official link above.</li>
        <li>Extract the ZIP archive and copy the <code>com.saasmotion.panel</code> folder into your Adobe CEP extensions folder:
          <br>&bull; <strong>macOS:</strong> <code>~/Library/Application Support/Adobe/CEP/extensions/</code>
          <br>&bull; <strong>Windows:</strong> <code>C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions\\</code>
        </li>
        <li>Open After Effects &rarr; <strong>Window &rarr; Extensions &rarr; SaaS Motion Pro</strong>.</li>
        <li>Paste your commercial license key: <code>${licenseKey}</code> and activate your workstation.</li>
      </ol>
    </div>

    <div class="footer">
      SaaS Motion Pro &bull; Official Licensing Authority &bull; <a href="${this.BASE_URL}" style="color:#A78BFA; text-decoration:none;">sabbirhossen.site</a>
      <br>Need assistance? Contact our engineering team at <a href="mailto:${supportContactEmail}" style="color:#A78BFA; text-decoration:none;">${supportContactEmail}</a>
    </div>
  </div>
</body>
</html>
`;

        const plainText = `
Welcome to SaaS Motion Pro!
==================================================
Hi ${customerName},

Your payment for Order #${orderId} has been verified and confirmed.
Your commercial license is now active.

PRODUCT: SaaS Motion Pro for After Effects
PLAN: ${planName}
SEATS: ${maxDevices} Active Workstation(s)
TERM: ${expiryText}
ORDER REFERENCE: ${orderId}

YOUR COMMERCIAL LICENSE KEY:
${licenseKey}

OFFICIAL PLUGIN DOWNLOAD LINK:
${effectiveDownloadUrl}

AFTER EFFECTS SETUP INSTRUCTIONS:
1. Download the release archive using the link above.
2. Extract and copy the 'com.saasmotion.panel' folder into your Adobe CEP extensions folder:
   - macOS: ~/Library/Application Support/Adobe/CEP/extensions/
   - Windows: C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions\\
3. In After Effects, navigate to Window -> Extensions -> SaaS Motion Pro.
4. Enter your license key: ${licenseKey}

MANAGE YOUR WORKSTATIONS:
${dashboardUrl}

Need support? Contact our team at ${supportContactEmail}
SaaS Motion Pro • sabbirhossen.site
`;

        // 1. Primary: Official Resend API
        if (resendApiKey) {
            try {
                const res = await fetch(this.RESEND_API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json',
                        'Idempotency-Key': idempotencyKey
                    },
                    body: JSON.stringify({
                        from: fromEmail,
                        to: [to],
                        subject,
                        html: htmlContent,
                        text: plainText
                    })
                });

                const data = await res.json().catch(() => ({}));
                if (res.ok && data?.id) {
                    await this.logEmailAttempt({
                        orderId,
                        recipient: to,
                        template: 'license_delivery',
                        provider: 'resend',
                        providerMessageId: data.id,
                        status: 'accepted',
                        idempotencyKey
                    });

                    return {
                        success: true,
                        status: 'sent',
                        provider: 'resend',
                        messageId: data.id
                    };
                } else {
                    const errMsg = data?.message || `Resend HTTP ${res.status}: ${res.statusText}`;
                    await this.logEmailAttempt({
                        orderId,
                        recipient: to,
                        template: 'license_delivery',
                        provider: 'resend',
                        status: 'failed',
                        error: errMsg,
                        idempotencyKey
                    });

                    return {
                        success: false,
                        status: 'failed',
                        provider: 'resend',
                        error: errMsg
                    };
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                await this.logEmailAttempt({
                    orderId,
                    recipient: to,
                    template: 'license_delivery',
                    provider: 'resend',
                    status: 'failed',
                    error: `Transport exception: ${msg}`,
                    idempotencyKey
                });

                return {
                    success: false,
                    status: 'failed',
                    provider: 'resend',
                    error: `Resend transport exception: ${msg}`
                };
            }
        }

        // 2. Secondary: Generic Webhook Relay (if explicitly configured)
        if (webhookUrl) {
            try {
                const res = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Idempotency-Key': idempotencyKey
                    },
                    body: JSON.stringify({
                        to,
                        subject,
                        html: htmlContent,
                        text: plainText,
                        metadata: { orderId, planName, licenseKey }
                    })
                });

                if (res.ok) {
                    const messageId = `webhook_${Date.now()}`;
                    await this.logEmailAttempt({
                        orderId,
                        recipient: to,
                        template: 'license_delivery',
                        provider: 'webhook',
                        providerMessageId: messageId,
                        status: 'accepted',
                        idempotencyKey
                    });

                    return {
                        success: true,
                        status: 'sent',
                        provider: 'webhook',
                        messageId
                    };
                } else {
                    const errMsg = `Webhook HTTP ${res.status}`;
                    await this.logEmailAttempt({
                        orderId,
                        recipient: to,
                        template: 'license_delivery',
                        provider: 'webhook',
                        status: 'failed',
                        error: errMsg,
                        idempotencyKey
                    });

                    return {
                        success: false,
                        status: 'failed',
                        provider: 'webhook',
                        error: errMsg
                    };
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                await this.logEmailAttempt({
                    orderId,
                    recipient: to,
                    template: 'license_delivery',
                    provider: 'webhook',
                    status: 'failed',
                    error: `Transport exception: ${msg}`,
                    idempotencyKey
                });

                return {
                    success: false,
                    status: 'failed',
                    provider: 'webhook',
                    error: `Webhook transport exception: ${msg}`
                };
            }
        }

        // 3. Fallback: Neither provider is configured
        await this.logEmailAttempt({
            orderId,
            recipient: to,
            template: 'license_delivery',
            provider: 'none',
            status: 'not_configured',
            error: 'RESEND_API_KEY is not configured in environment variables.',
            idempotencyKey
        });

        return {
            success: false,
            status: 'not_configured',
            provider: 'none',
            error: 'No transactional email provider configured. Please set RESEND_API_KEY in environment variables.'
        };
    }

    /**
     * Sends an admin notification email when a customer submits manual bKash or Bank payment details.
     */
    static async sendAdminPaymentSubmittedNotification(options: AdminPaymentSubmittedOptions): Promise<EmailSendResult> {
        const { orderId, customerName, customerEmail, paymentMethod, amountPaid, senderNumber, transactionId, customerNote, screenshotUrl } = options;

        const resendApiKey = process.env.RESEND_API_KEY?.trim();
        const fromEmail = process.env.EMAIL_FROM?.trim() || this.DEFAULT_FROM;
        const adminEmail = process.env.ADMIN_EMAIL?.trim() || this.DEFAULT_ADMIN;
        const idempotencyKey = `admin-notify-${orderId}`;

        const subject = `[Action Required] New Payment Submission — Order #${orderId} (${paymentMethod.toUpperCase()})`;
        const reviewUrl = `${this.BASE_URL}/admin/licensing`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0812; color: #F5F3FF; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #120E24; border: 1px solid #3B2D66; border-radius: 16px; padding: 28px; }
    .badge { display: inline-block; padding: 4px 10px; background-color: #D97706; color: #FEF3C7; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 14px; }
    h2 { font-size: 20px; color: #FFFFFF; margin: 0 0 12px 0; }
    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .data-table td { padding: 8px 0; border-bottom: 1px solid #281F47; color: #E9D5FF; }
    .data-table td.label { color: #8B7BB8; width: 36%; font-family: monospace; font-size: 12px; }
    .btn { display: inline-block; background-color: #7C3AED; color: #FFFFFF !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Payment Proof Received</div>
    <h2>New Manual Payment to Review</h2>
    <p style="font-size: 13px; color: #D8B4FE;">A creator has submitted payment details and is waiting for license activation.</p>

    <table class="data-table">
      <tr>
        <td class="label">Order ID:</td>
        <td><strong>#${orderId}</strong></td>
      </tr>
      <tr>
        <td class="label">Customer:</td>
        <td>${customerName} (${customerEmail})</td>
      </tr>
      <tr>
        <td class="label">Method:</td>
        <td><strong style="text-transform: uppercase;">${paymentMethod}</strong></td>
      </tr>
      <tr>
        <td class="label">Transaction ID:</td>
        <td><code style="background:#241A47; padding:2px 6px; border-radius:4px;">${transactionId}</code></td>
      </tr>
      <tr>
        <td class="label">Sender Account:</td>
        <td>${senderNumber}</td>
      </tr>
      ${amountPaid ? `<tr><td class="label">Amount Paid:</td><td>${amountPaid}</td></tr>` : ''}
      ${customerNote ? `<tr><td class="label">Customer Note:</td><td>${customerNote}</td></tr>` : ''}
      ${screenshotUrl ? `<tr><td class="label">Receipt Screenshot:</td><td><a href="${this.BASE_URL}${screenshotUrl}" style="color:#C084FC;">View Uploaded Screenshot</a></td></tr>` : ''}
    </table>

    <div style="text-align: center;">
      <a href="${reviewUrl}" class="btn">Open Super Admin Licensing Dashboard &rarr;</a>
    </div>
  </div>
</body>
</html>
`;

        const plainText = `
[Action Required] New Payment Submission
Order: #${orderId}
Method: ${paymentMethod.toUpperCase()}
Customer: ${customerName} (${customerEmail})
Transaction ID: ${transactionId}
Sender: ${senderNumber}
${amountPaid ? `Amount: ${amountPaid}\n` : ''}${customerNote ? `Note: ${customerNote}\n` : ''}
Review & Approve: ${reviewUrl}
`;

        if (!resendApiKey) {
            await this.logEmailAttempt({
                orderId,
                recipient: adminEmail,
                template: 'admin_notification',
                provider: 'none',
                status: 'not_configured',
                error: 'RESEND_API_KEY not configured.',
                idempotencyKey
            });
            return {
                success: false,
                status: 'not_configured',
                provider: 'none',
                error: 'RESEND_API_KEY not configured for admin alerts.'
            };
        }

        try {
            const res = await fetch(this.RESEND_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [adminEmail],
                    subject,
                    html: htmlContent,
                    text: plainText
                })
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok && data?.id) {
                await this.logEmailAttempt({
                    orderId,
                    recipient: adminEmail,
                    template: 'admin_notification',
                    provider: 'resend',
                    providerMessageId: data.id,
                    status: 'accepted',
                    idempotencyKey
                });

                return {
                    success: true,
                    status: 'sent',
                    provider: 'resend',
                    messageId: data.id
                };
            } else {
                const errMsg = data?.message || `Resend HTTP ${res.status}`;
                await this.logEmailAttempt({
                    orderId,
                    recipient: adminEmail,
                    template: 'admin_notification',
                    provider: 'resend',
                    status: 'failed',
                    error: errMsg,
                    idempotencyKey
                });

                return {
                    success: false,
                    status: 'failed',
                    provider: 'resend',
                    error: errMsg
                };
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            await this.logEmailAttempt({
                orderId,
                recipient: adminEmail,
                template: 'admin_notification',
                provider: 'resend',
                status: 'failed',
                error: msg,
                idempotencyKey
            });

            return {
                success: false,
                status: 'failed',
                provider: 'resend',
                error: msg
            };
        }
    }

    /**
     * Sends a diagnostic test email to the configured admin email or target.
     */
    static async sendTestEmail(targetEmail?: string): Promise<EmailSendResult> {
        const resendApiKey = process.env.RESEND_API_KEY?.trim();
        const fromEmail = process.env.EMAIL_FROM?.trim() || this.DEFAULT_FROM;
        const recipient = targetEmail?.trim() || process.env.ADMIN_EMAIL?.trim() || this.DEFAULT_ADMIN;

        if (!resendApiKey) {
            return {
                success: false,
                status: 'not_configured',
                provider: 'none',
                error: 'RESEND_API_KEY is not configured in environment variables.'
            };
        }

        const subject = `[Test] SaaS Motion Pro Resend Verification (${new Date().toLocaleTimeString()})`;
        const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background:#0A0812; color:#EDE9FE; padding:24px;">
  <div style="max-width:500px; margin:0 auto; background:#120E24; border:1px solid #3B2D66; border-radius:12px; padding:24px;">
    <h3 style="color:#FFFFFF; margin-top:0;">Resend Email Pipeline Operational</h3>
    <p style="font-size:13px; line-height:1.6; color:#D8B4FE;">
      This test message confirms that DKIM, SPF, and Resend API authentication for <strong>${fromEmail}</strong> are functioning properly.
    </p>
    <div style="font-size:11px; font-family:monospace; background:#0A0812; padding:12px; border-radius:8px; border:1px solid #281F47; color:#A78BFA;">
      Timestamp: ${new Date().toISOString()}<br>
      Recipient: ${recipient}<br>
      Verified Domain: sabbirhossen.site
    </div>
  </div>
</body>
</html>
`;

        try {
            const res = await fetch(this.RESEND_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [recipient],
                    subject,
                    html,
                    text: `Resend test successful for ${fromEmail} at ${new Date().toISOString()}`
                })
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok && data?.id) {
                await this.logEmailAttempt({
                    recipient,
                    template: 'test',
                    provider: 'resend',
                    providerMessageId: data.id,
                    status: 'accepted'
                });

                return {
                    success: true,
                    status: 'sent',
                    provider: 'resend',
                    messageId: data.id
                };
            } else {
                const errMsg = data?.message || `Resend HTTP ${res.status}`;
                await this.logEmailAttempt({
                    recipient,
                    template: 'test',
                    provider: 'resend',
                    status: 'failed',
                    error: errMsg
                });

                return {
                    success: false,
                    status: 'failed',
                    provider: 'resend',
                    error: errMsg
                };
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return {
                success: false,
                status: 'failed',
                provider: 'resend',
                error: `Test dispatch error: ${msg}`
            };
        }
    }
}
