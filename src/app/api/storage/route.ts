import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
}

function getFilePath(key: string): string {
  // Sanitize key for filesystem use
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `${safeKey}.json`);
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  await ensureDataDir();
  const filePath = getFilePath(key);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    // File doesn't exist — return null
    return NextResponse.json(null);
  }
}

export async function PUT(req: NextRequest) {
  const { key, value } = await req.json();
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  await ensureDataDir();
  const filePath = getFilePath(key);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  const filePath = getFilePath(key);
  try {
    await fs.unlink(filePath);
  } catch {
    // File might not exist — that's fine
  }

  return NextResponse.json({ success: true });
}
