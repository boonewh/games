// lib/entries.ts
import fs from 'fs/promises'
import path from 'path'
import { AdventureEntry } from '@/types/adventure'
import { JSONContent } from '@tiptap/react'

const dir = path.join(process.cwd(), 'content', 'entries')

async function ensureDir() {
  await fs.mkdir(dir, { recursive: true })
}

function deriveExcerpt(content: JSONContent | undefined, limit = 220): string {
  if (!content || !Array.isArray(content.content)) return ''
  for (const node of content.content) {
    if (node.type !== 'paragraph' || !Array.isArray(node.content)) continue
    const text = node.content
      .filter(child => child.type === 'text' && typeof child.text === 'string')
      .map(child => child.text as string)
      .join('')
      .trim()
    if (text) {
      return text.slice(0, limit)
    }
  }
  return ''
}

export async function listEntries(): Promise<AdventureEntry[]> {
  await ensureDir()
  const files = await fs.readdir(dir)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  const entries: AdventureEntry[] = []
  for (const f of jsonFiles) {
    const raw = await fs.readFile(path.join(dir, f), 'utf8')
    const parsed = JSON.parse(raw) as AdventureEntry
    const excerpt = parsed.excerpt?.trim() || deriveExcerpt(parsed.content)
    const normalized: AdventureEntry = {
      ...parsed,
      excerpt,
    }
    entries.push(normalized)
  }
  // newest first
  return entries.sort((a, b) => {
    const aDate = a.updatedAt ?? a.createdAt
    const bDate = b.updatedAt ?? b.createdAt
    return bDate.localeCompare(aDate)
  })
}

export async function readEntry(id: string): Promise<AdventureEntry | null> {
  try {
    const raw = await fs.readFile(path.join(dir, `${id}.json`), 'utf8')
    const parsed = JSON.parse(raw) as AdventureEntry
    return {
      ...parsed,
      excerpt: parsed.excerpt?.trim() || deriveExcerpt(parsed.content),
    }
  } catch {
    return null
  }
}

export async function saveEntry(partial: Omit<AdventureEntry,'id'|'createdAt'> & {id?: string}): Promise<AdventureEntry> {
  await ensureDir()
  const now = new Date()
  const isoNow = now.toISOString()
  const existing = partial.id ? await readEntry(partial.id) : null
  const id = partial.id ?? isoNow.replace(/[:.]/g, '-')
  const createdAt = existing?.createdAt ?? isoNow
  const excerpt = partial.excerpt?.trim() || deriveExcerpt(partial.content) || existing?.excerpt || ''
  const entry: AdventureEntry = {
    id,
    title: partial.title?.trim() || 'Untitled Adventure',
    image: partial.image?.trim() || undefined,
    createdAt,
    updatedAt: isoNow,
    excerpt,
    content: partial.content,
  }
  await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(entry, null, 2), 'utf8')
  return entry
}
