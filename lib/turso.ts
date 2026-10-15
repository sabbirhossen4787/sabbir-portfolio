import { createClient } from './turso-http';

const tursoUrl = (
  process.env.TURSO_DATABASE_URL ||
  process.env.TURSO_URL ||
  process.env.TURSO_DB_URL ||
  process.env.DATABASE_URL ||
  process.env.LIBSQL_DATABASE_URL ||
  process.env.LIBSQL_URL ||
  ''
).trim();

const tursoAuthToken = (
  process.env.TURSO_AUTH_TOKEN ||
  process.env.TURSO_TOKEN ||
  process.env.TURSO_DB_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  process.env.LIBSQL_AUTH_TOKEN ||
  ''
).trim();

export const tursoEnabled = Boolean(tursoUrl && tursoAuthToken);
export const turso = tursoEnabled ? createClient({ url: tursoUrl, authToken: tursoAuthToken }) : null;
export async function ensureTursoSchema() { if (!turso) return false; await turso.execute(`CREATE TABLE IF NOT EXISTS cms_content (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at TEXT NOT NULL)`); return true; }
