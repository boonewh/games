import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { addWinterPhoto, listWinterPhotos, persistUploadedPhoto } from '@/lib/winter/store'

export async function GET() {
  const photos = await listWinterPhotos()
  return NextResponse.json({ photos })
}

export async function POST(request: Request) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const alt = String(formData.get('alt') ?? '').trim()
  const caption = String(formData.get('caption') ?? '').trim()
  const credit = String(formData.get('credit') ?? '').trim()

  if (!file || !(file instanceof File)) {
    return new NextResponse('Image file is required', { status: 400 })
  }

  if (!alt) {
    return new NextResponse('Alt text is required', { status: 400 })
  }

  const relativePath = await persistUploadedPhoto(file)
  const photo = await addWinterPhoto({
    relativePath,
    alt,
    caption: caption || undefined,
    credit: credit || undefined,
  })

  return NextResponse.json({ photo }, { status: 201 })
}
