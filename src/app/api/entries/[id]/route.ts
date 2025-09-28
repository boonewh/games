import { NextResponse } from 'next/server'
import { readEntry, saveEntry } from '@/lib/entries'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const entry = await readEntry(params.id)
  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(entry)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  if (!body?.content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 })
  }

  const saved = await saveEntry({
    id: params.id,
    title: body.title,
    image: body.image,
    excerpt: body.excerpt,
    content: body.content,
  })

  return NextResponse.json(saved)
}
