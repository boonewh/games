// lib/entries.ts
import fs from 'fs/promises'
import path from 'path'
import { AdventureEntry } from '@/types/adventure'

const dir = path.join(process.cwd(), 'content', 'entries')

async function ensureDir() {
  await fs.mkdir(dir, { recursive: true })
}

export async function listEntries(): Promise<AdventureEntry[]> {
  await ensureDir()
  const files = await fs.readdir(dir)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  const entries: AdventureEntry[] = []
  for (const f of jsonFiles) {
    const raw = await fs.readFile(path.join(dir, f), 'utf8')
    entries.push(JSON.parse(raw))
  }
  // newest first
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function readEntry(id: string): Promise<AdventureEntry | null> {
  try {
    const raw = await fs.readFile(path.join(dir, `${id}.json`), 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function saveEntry(partial: Omit<AdventureEntry,'id'|'createdAt'> & {id?: string}): Promise<AdventureEntry> {
  await ensureDir()
  const now = new Date()
  const id = partial.id ?? now.toISOString().replace(/[:.]/g, '-')
  const entry: AdventureEntry = {
    id,
    title: partial.title?.trim() || 'Untitled Adventure',
    image: partial.image,
    createdAt: now.toISOString(),
    excerpt: partial.excerpt?.trim() || '',
    content: partial.content,
  }
  await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(entry, null, 2), 'utf8')
  return entry
}
