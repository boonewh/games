import { JSONContent } from '@tiptap/core'

export interface WinterAdventureBook {
  slug: string
  title: string
  description?: string
  coverImage?: string
}

export interface WinterAdventureEntry {
  id: string
  slug: string
  bookSlug: string
  title: string
  subtitle?: string
  publishedAt: string
  excerpt: string
  content: JSONContent
  updatedAt?: string
}

export interface WinterPhoto {
  id: string
  relativePath: string
  alt: string
  caption?: string
  credit?: string
  createdAt: string
  updatedAt: string
}

export interface WinterPhotoLibrary {
  photos: WinterPhoto[]
}

export interface WinterEntryCollection {
  entries: WinterAdventureEntry[]
}

export interface WinterBookCollection {
  books: WinterAdventureBook[]
}
