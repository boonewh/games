import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { deleteWinterEntry, getWinterEntry, saveWinterEntry } from '@/lib/winter/store'

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const entry = await getWinterEntry(params.slug)
  if (!entry) {
    return new NextResponse('Not found', { status: 404 })
  }

  return NextResponse.json({ entry })
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const payload = await request.json()
  const existing = await getWinterEntry(params.slug)
  if (!existing) {
    return new NextResponse('Not found', { status: 404 })
  }

  const updated = {
    ...existing,
    title: typeof payload.title === 'string' ? payload.title : existing.title,
    subtitle: typeof payload.subtitle === 'string' ? payload.subtitle : existing.subtitle,
    excerpt: typeof payload.excerpt === 'string' ? payload.excerpt : existing.excerpt,
    publishedAt: typeof payload.publishedAt === 'string' ? payload.publishedAt : existing.publishedAt,
    content: payload.content ?? existing.content,
    updatedAt: new Date().toISOString(),
  }

  await saveWinterEntry(updated)
  return NextResponse.json({ entry: updated })
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const existing = await getWinterEntry(params.slug)
  if (!existing) {
    return new NextResponse('Not found', { status: 404 })
  }

  await deleteWinterEntry(params.slug)
  return NextResponse.json({ success: true })
}
