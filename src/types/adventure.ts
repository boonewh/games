// types/adventure.ts
import { JSONContent } from '@tiptap/react'

export type AdventureEntry = {
  id: string // slug like 2025-09-27-123456
  title: string
  image?: string
  createdAt: string // ISO
  updatedAt?: string // ISO
  excerpt: string
  content: JSONContent // Tiptap JSONContent
}
