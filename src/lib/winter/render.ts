import { generateHTML } from '@tiptap/react'
import { winterEditorExtensions } from './extensions'
import { WinterAdventureEntry, WinterPhoto } from './types'

const photoTokenRegex = /\{\{photo:([a-zA-Z0-9_-]+)\}\}/g

function buildPhotoHtml(photo: WinterPhoto) {
  const attributes = {
    alt: photo.alt ?? '',
    src: photo.relativePath,
  }

  const imgTag = `<img src="${attributes.src}" alt="${attributes.alt.replace(/"/g, '&quot;')}" class="w-full rounded-lg shadow-lg" loading="lazy" />`
  const captionParts: string[] = []

  if (photo.caption) {
    captionParts.push(photo.caption)
  }

  if (photo.credit) {
    captionParts.push(`<span class="block text-xs text-slate-400">${photo.credit}</span>`)
  }

  const captionHtml = captionParts.length
    ? `<figcaption class="mt-2 text-sm text-slate-300">${captionParts.join(' ')}</figcaption>`
    : ''

  return `<figure class="my-8">${imgTag}${captionHtml}</figure>`
}

export function renderWinterEntry(entry: WinterAdventureEntry, photos: WinterPhoto[]) {
  const html = generateHTML(entry.content, winterEditorExtensions)

  const expanded = html.replace(photoTokenRegex, (_, photoId: string) => {
    const photo = photos.find((item) => item.id === photoId)
    if (!photo) {
      return ''
    }

    return buildPhotoHtml(photo)
  })

  return expanded
}

export function extractPhotoIds(entry: WinterAdventureEntry) {
  const ids = new Set<string>()
  const text = JSON.stringify(entry.content)
  let match: RegExpExecArray | null

  while ((match = photoTokenRegex.exec(text))) {
    ids.add(match[1])
  }

  return Array.from(ids)
}
