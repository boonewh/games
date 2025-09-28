import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getWinterEntries, saveWinterEntry } from '@/lib/winter/store'
import { WinterAdventureEntry } from '@/lib/winter/types'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const bookSlug = url.searchParams.get('book') ?? undefined
  const entries = await getWinterEntries()

  const filtered = bookSlug ? entries.filter((entry) => entry.bookSlug === bookSlug) : entries
  return NextResponse.json({ entries: filtered })
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const payload = await request.json()
  const entry: WinterAdventureEntry = {
    id: payload.id ?? crypto.randomUUID(),
    slug: payload.slug ? String(payload.slug) : slugify(String(payload.title ?? 'entry')),
    bookSlug: String(payload.bookSlug ?? ''),
    title: String(payload.title ?? 'Untitled entry'),
    subtitle: payload.subtitle ? String(payload.subtitle) : undefined,
    publishedAt: payload.publishedAt
      ? String(payload.publishedAt)
      : new Date().toISOString(),
    excerpt: String(payload.excerpt ?? ''),
    content: payload.content,
    updatedAt: new Date().toISOString(),
  }

  if (!entry.bookSlug) {
    return new NextResponse('bookSlug is required', { status: 400 })
  }

  if (!entry.excerpt) {
    return new NextResponse('excerpt is required', { status: 400 })
  }

  if (!entry.content) {
    return new NextResponse('content is required', { status: 400 })
  }

  const saved = await saveWinterEntry(entry)
  return NextResponse.json({ entry: saved }, { status: 201 })
}
