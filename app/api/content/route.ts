import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { ensureTursoSchema, turso, tursoEnabled } from '@/lib/turso';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'db.json');

async function readLocal() {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(dbPath, 'utf8');
    return raw && raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function cellValue(cell: any): any {
  if (cell && typeof cell === 'object' && 'value' in cell) return cell.value;
  return cell;
}

async function readTurso() {
  if (!turso) throw new Error('Turso is not configured. Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to the deployment environment.');
  await ensureTursoSchema();
  const result: any = await turso.execute({ sql: 'SELECT data FROM cms_content WHERE id = 1' });
  const raw = cellValue(result?.rows?.[0]?.[0]);
  if (raw !== undefined && raw !== null && String(raw).trim()) {
    return JSON.parse(String(raw));
  }

  const seed = await readLocal();
  await turso.execute({
    sql: `INSERT INTO cms_content (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO NOTHING`,
    args: [JSON.stringify(seed), new Date().toISOString()]
  });
  return seed;
}

export async function GET() {
  try {
    if (tursoEnabled) return NextResponse.json(await readTurso(), { headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json(await readLocal(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Content read error:', error);
    // In local development, keep the editor usable even if Turso is temporarily unreachable.
    // Production stays strict so a database outage is never hidden.
    if (process.env.NODE_ENV === 'development') {
      try {
        const local = await readLocal();
        return NextResponse.json(local, {
          headers: { 'Cache-Control': 'no-store', 'X-CMS-Storage': 'local-fallback' }
        });
      } catch {}
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read CMS data' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid CMS payload' }, { status: 400 });
    }

    const json = JSON.stringify(body);

    if (tursoEnabled) {
      try {
        await ensureTursoSchema();
        await turso!.execute({
          sql: `INSERT INTO cms_content (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at`,
          args: [json, new Date().toISOString()]
        });

        const check: any = await turso!.execute({ sql: 'SELECT data FROM cms_content WHERE id = 1' });
        const saved = cellValue(check?.rows?.[0]?.[0]);
        if (String(saved ?? '') !== json) throw new Error('Turso write verification failed');

        return NextResponse.json({ success: true, storage: 'turso', timestamp: Date.now() });
      } catch (error) {
        console.error('Turso save failed:', error);
        // Local development must remain usable when Turso is temporarily unreachable.
        // Production still returns the real error so a failed publish cannot be reported as saved.
        if (process.env.NODE_ENV !== 'development') throw error;
        await mkdir(dataDir, { recursive: true });
        await writeFile(dbPath, JSON.stringify(body, null, 2), 'utf8');
        return NextResponse.json({ success: true, storage: 'local-fallback', warning: error instanceof Error ? error.message : 'Turso unavailable', timestamp: Date.now() });
      }
    }

    await mkdir(dataDir, { recursive: true });
    await writeFile(dbPath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true, storage: 'local', timestamp: Date.now() });
  } catch (error) {
    console.error('Database save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save CMS data' },
      { status: 500 }
    );
  }
}
