/**
 * @fileoverview SaaS Motion Pro - keys.ts
 * Ed25519 Cryptographic Keys for Entitlement Signing and Verification.
 * PRIVATE key is STRICTLY SERVER-ONLY and must never be exposed or bundled in client plugins.
 * PUBLIC key is distributed with the client for offline/asymmetric verification.
 * @copyright 2026 SaaS Motion Pro. All rights reserved.
 */

export const SERVER_PUBLIC_KEY = process.env.LICENSING_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA2ypugDYS1z4pKvLLEuK3cdcvuCQEviCT8I9eZklihh0=
-----END PUBLIC KEY-----`;

// Private signing key must ONLY be read from environment variable; never hardcoded in source
export const SERVER_PRIVATE_KEY = process.env.LICENSING_PRIVATE_KEY || '';
