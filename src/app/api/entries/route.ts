// app/api/entries/route.ts
import { NextResponse } from 'next/server'
import { listEntries, saveEntry } from '@/lib/entries'

export async function GET() {
  const items = await listEntries()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const body = await req.json()
  // naive validation
  if (!body?.content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 })
  }
  const saved = await saveEntry({
    id: body.id,
    title: body.title,
    image: body.image,
    excerpt: body.excerpt,
    content: body.content,
  })
  return NextResponse.json(saved, { status: 201 })
}
