// app/api/entries/route.ts
import { NextResponse } from 'next/server'
import { listEntries, saveEntry } from '@/lib/entries'

export async function GET() {
  const items = await listEntries()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const body = await req.json()
  
  // Updated validation for required fields
  if (!body?.content) {
    return NextResponse.json({ error: 'Missing content' }, { status: 400 })
  }
  if (!body?.book) {
    return NextResponse.json({ error: 'Missing book selection' }, { status: 400 })
  }
  if (!body?.sessionDate) {
    return NextResponse.json({ error: 'Missing session date' }, { status: 400 })
  }
  
  const saved = await saveEntry({
    id: body.id,
    title: body.title,
    image: body.image,
    excerpt: body.excerpt,
    content: body.content,
    book: body.book,              // NEW: Book slug
    sessionDate: body.sessionDate // NEW: Session date
  })
  
  return NextResponse.json(saved, { status: 201 })
}