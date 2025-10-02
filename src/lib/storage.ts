import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';
import crypto from 'node:crypto';

export const storyKey = (book: string, date: string, slug: string) =>
  `story:${book}:${date}:${slug}` as const;

export const listKey = (book: string) => `list:${book}`;
export const listAllKey = () => `list:all`;

export async function saveStory(entry: {
  date: string; book: string; slug: string; data: unknown; includeAll?: boolean;
}) {
  const key = storyKey(entry.book, entry.date, entry.slug);
  await kv.set(key, entry.data);
  // update per-book list
  await kv.lpush(listKey(entry.book), key);
  // optional global list
  if (entry.includeAll) await kv.lpush(listAllKey(), key);
  return key;
}

export async function getStory(key: string) {
  return kv.get(key);
}

export async function listStories(listKeyName: string, limit = 10) {
  const keys = await kv.lrange(listKeyName, 0, limit - 1);
  if (!keys?.length) return [];
  // pipeline GETs
  const vals = await Promise.all(keys.map((k) => kv.get(k as string)));
  return vals.map((v, i) => ({ key: keys[i], value: v }));
}

// ---------- Blob helpers ----------
export function sanitizeBaseName(input: string) {
  const cleaned = input.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned || crypto.randomUUID();
}

export function makeBlobPath(folder: string, basename: string) {
  const ts = Date.now();
  return `${folder}/${ts}-${basename}.webp`;
}

export async function saveWebPToBlob(path: string, data: Buffer) {
  const { url } = await put(path, data, {
    access: 'public',
    contentType: 'image/webp',
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365, // 1y
  });
  return url;
}
