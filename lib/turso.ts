import { createClient } from './turso-http';
export const tursoEnabled = Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
export const turso = tursoEnabled ? createClient({ url: process.env.TURSO_DATABASE_URL as string, authToken: process.env.TURSO_AUTH_TOKEN as string }) : null;
export async function ensureTursoSchema() { if (!turso) return false; await turso.execute(`CREATE TABLE IF NOT EXISTS cms_content (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at TEXT NOT NULL)`); return true; }
