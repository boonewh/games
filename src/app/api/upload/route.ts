// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync, mkdirSync } from 'fs'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  // 'image/svg+xml': 'svg', // usually best to block SVG uploads for safety
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file = data.get('image') as unknown as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Sanitize original name (may be "blob"/"image" without ext)
    const original = (file.name || 'upload').replace(/[^a-zA-Z0-9.-]/g, '_')

    // Pull current extension (if any)
    let ext = extname(original).toLowerCase()
    if (ext === '.jpeg') ext = '.jpg' // normalize

    // If there is no ext, or it’s not in our allow-list, derive from MIME
    const allowed = new Set(['.jpg', '.png', '.webp', '.gif'])
    if (!ext || !allowed.has(ext)) {
      const mapped = MIME_TO_EXT[file.type]
      if (!mapped) {
        return NextResponse.json({ error: `Unsupported image type: ${file.type}` }, { status: 415 })
      }
      ext = `.${mapped}`
    }

    // Build a base name without the (possibly missing/wrong) ext
    const base = original.replace(/\.[^.]+$/, '') || 'image'
    const timestamp = Date.now()
    const filename = `${timestamp}-${base}${ext}`

    const uploadDir = join(process.cwd(), 'public', 'images', 'winter')
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const url = `/images/winter/${filename}`
    return NextResponse.json({ url, filename, size: file.size, type: file.type })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
