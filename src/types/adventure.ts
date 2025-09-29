// types/adventure.ts
import { JSONContent } from '@tiptap/react'

export type AdventureEntry = {
  id: string 
  title: string
  image?: string
  createdAt: string // ISO
  updatedAt?: string // ISO
  excerpt: string
  content: JSONContent // Tiptap JSONContent
  book: string;        
  sessionDate: string; 
}
