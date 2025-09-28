import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { deleteWinterPhoto, getWinterPhoto, updateWinterPhoto } from '@/lib/winter/store'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const payload = await request.json()
  const updates = {
    alt: typeof payload.alt === 'string' ? payload.alt : undefined,
    caption: typeof payload.caption === 'string' ? payload.caption : undefined,
    credit: typeof payload.credit === 'string' ? payload.credit : undefined,
  }

  try {
    const photo = await updateWinterPhoto(params.id, updates)
    return NextResponse.json({ photo })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update photo'
    return new NextResponse(message, { status: 404 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const photo = await getWinterPhoto(params.id)
  if (!photo) {
    return new NextResponse('Not found', { status: 404 })
  }

  await deleteWinterPhoto(params.id)
  return NextResponse.json({ success: true })
}
