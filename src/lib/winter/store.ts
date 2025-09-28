import { promises as fs } from 'fs'
import path from 'path'
import { readJsonFile, writeJsonFile, resolvePublicPath, ensureDir, toPublicUrl } from '../fs-utils'
import {
  WinterAdventureBook,
  WinterAdventureEntry,
  WinterBookCollection,
  WinterEntryCollection,
  WinterPhoto,
  WinterPhotoLibrary,
} from './types'

const BOOKS_PATH = 'content/winter/books.json'
const ENTRIES_PATH = 'content/winter/entries.json'
const PHOTOS_PATH = 'content/winter/photos.json'

async function readBooks(): Promise<WinterBookCollection> {
  return readJsonFile<WinterBookCollection>(BOOKS_PATH, { books: [] })
}

async function readEntries(): Promise<WinterEntryCollection> {
  return readJsonFile<WinterEntryCollection>(ENTRIES_PATH, { entries: [] })
}

async function readPhotos(): Promise<WinterPhotoLibrary> {
  return readJsonFile<WinterPhotoLibrary>(PHOTOS_PATH, { photos: [] })
}

export async function getWinterBooks(): Promise<WinterAdventureBook[]> {
  const { books } = await readBooks()
  return books
}

export async function getWinterBook(slug: string): Promise<WinterAdventureBook | undefined> {
  const { books } = await readBooks()
  return books.find((book) => book.slug === slug)
}

export async function getWinterEntries(): Promise<WinterAdventureEntry[]> {
  const { entries } = await readEntries()
  return entries.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export async function getWinterEntriesForBook(bookSlug: string) {
  const entries = await getWinterEntries()
  return entries.filter((entry) => entry.bookSlug === bookSlug)
}

export async function getWinterEntry(slug: string) {
  const { entries } = await readEntries()
  return entries.find((entry) => entry.slug === slug)
}

export async function saveWinterEntry(entry: WinterAdventureEntry) {
  const collection = await readEntries()
  const existingIndex = collection.entries.findIndex((item) => item.id === entry.id || item.slug === entry.slug)
  const now = new Date().toISOString()

  if (!entry.updatedAt) {
    entry.updatedAt = now
  }

  if (existingIndex >= 0) {
    collection.entries[existingIndex] = { ...entry, updatedAt: now }
  } else {
    collection.entries.push({ ...entry, updatedAt: now })
  }

  await writeJsonFile(ENTRIES_PATH, collection)
  return entry
}

export async function deleteWinterEntry(idOrSlug: string) {
  const collection = await readEntries()
  collection.entries = collection.entries.filter(
    (entry) => entry.id !== idOrSlug && entry.slug !== idOrSlug,
  )
  await writeJsonFile(ENTRIES_PATH, collection)
}

export async function listWinterPhotos(): Promise<WinterPhoto[]> {
  const { photos } = await readPhotos()
  return photos.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
}

export async function getWinterPhoto(id: string) {
  const { photos } = await readPhotos()
  return photos.find((photo) => photo.id === id)
}

export interface AddPhotoInput {
  id?: string
  relativePath: string
  alt: string
  caption?: string
  credit?: string
}

export async function addWinterPhoto(input: AddPhotoInput) {
  const library = await readPhotos()
  const existing = input.id ? library.photos.find((photo) => photo.id === input.id) : undefined
  const now = new Date().toISOString()
  const id = existing?.id ?? input.id ?? crypto.randomUUID()

  const photo: WinterPhoto = {
    id,
    relativePath: toPublicUrl(input.relativePath),
    alt: input.alt,
    caption: input.caption,
    credit: input.credit,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  if (existing) {
    const index = library.photos.findIndex((item) => item.id === existing.id)
    library.photos[index] = photo
  } else {
    library.photos.push(photo)
  }

  await writeJsonFile(PHOTOS_PATH, library)
  return photo
}

export async function updateWinterPhoto(id: string, payload: Partial<Omit<WinterPhoto, 'id' | 'createdAt'>>) {
  const library = await readPhotos()
  const index = library.photos.findIndex((photo) => photo.id === id)

  if (index < 0) {
    throw new Error(`Photo ${id} not found`)
  }

  const current = library.photos[index]
  const updated: WinterPhoto = {
    ...current,
    ...payload,
    relativePath: payload.relativePath ? toPublicUrl(payload.relativePath) : current.relativePath,
    updatedAt: new Date().toISOString(),
  }

  library.photos[index] = updated
  await writeJsonFile(PHOTOS_PATH, library)
  return updated
}

export async function deleteWinterPhoto(id: string) {
  const library = await readPhotos()
  const index = library.photos.findIndex((photo) => photo.id === id)
  if (index < 0) {
    return
  }

  const [photo] = library.photos.splice(index, 1)
  await writeJsonFile(PHOTOS_PATH, library)

  const relative = photo.relativePath.startsWith('/') ? photo.relativePath.slice(1) : photo.relativePath
  const absolutePath = resolvePublicPath(relative)

  try {
    await fs.unlink(absolutePath)
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') {
      throw error
    }
  }
}

export async function persistUploadedPhoto(file: File, fileName?: string) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const safeName = fileName ?? `${crypto.randomUUID()}-${file.name}`.replace(/\s+/g, '-')
  const uploadsDir = path.join('public', 'uploads', 'winter')
  await ensureDir(path.join(process.cwd(), uploadsDir))
  const absolute = path.join(process.cwd(), uploadsDir, safeName)
  await fs.writeFile(absolute, buffer)
  const relative = `/uploads/winter/${safeName}`
  return relative
}
