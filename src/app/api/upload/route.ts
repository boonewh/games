import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { makeBlobPath, sanitizeBaseName, saveWebPToBlob } from '@/lib/storage';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs'; // Sharp needs Node runtime

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_PRECOMPRESS_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_WIDTH = 1600;
const QUALITY = 80;
const FOLDER = 'winter';

async function rateLimit(ip: string) {
  // Simple: allow 10 uploads/min/ip
  const key = `ratelimit:upload:${ip}`;
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, 60);
  if (count > 10) return false;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
    if (!(await rateLimit(ip))) {
      return NextResponse.json({ error: 'Too many uploads, slow down.' }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const base = (form.get('basename') as string | null) || '';
    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported type. Only jpeg, png, webp, gif allowed.' }, { status: 415 });
    }

    if (file.size > MAX_PRECOMPRESS_BYTES) {
      return NextResponse.json({ error: 'File too large.' }, { status: 413 });
    }

    const arrayBuf = await file.arrayBuffer();
    const input = Buffer.from(arrayBuf);

    // Sharp pipeline: autorotate, resize (no enlarge), convert to WebP
    const output = await sharp(input, { failOn: 'none' })
      .rotate() // EXIF auto-rotate
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    const safeBase = sanitizeBaseName(base || file.name.replace(/\.\w+$/, ''));
    const path = makeBlobPath(FOLDER, safeBase);
    const url = await saveWebPToBlob(path, output);

    return NextResponse.json({ url, path });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Upload failed', detail: message }, { status: 500 });
  }
}
