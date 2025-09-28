'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JSONContent } from '@tiptap/core'
import { WinterEntryEditor, WinterEntryEditorHandle } from './WinterEntryEditor'
import { WinterPhotoLibrary } from './WinterPhotoLibrary'
import type { WinterAdventureBook, WinterAdventureEntry } from '@/lib/winter/types'

interface Props {
  books: WinterAdventureBook[]
  initialEntry?: WinterAdventureEntry
  mode: 'create' | 'edit'
}

const emptyContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
  ],
}

function toDatetimeLocal(isoString: string) {
  const date = new Date(isoString)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export function WinterEntryForm({ books, initialEntry, mode }: Props) {
  const router = useRouter()
  const editorRef = useRef<WinterEntryEditorHandle>(null)
  const [bookSlug, setBookSlug] = useState(initialEntry?.bookSlug ?? books[0]?.slug ?? '')
  const [title, setTitle] = useState(initialEntry?.title ?? '')
  const [subtitle, setSubtitle] = useState(initialEntry?.subtitle ?? '')
  const [excerpt, setExcerpt] = useState(initialEntry?.excerpt ?? '')
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocal(initialEntry?.publishedAt ?? new Date().toISOString()),
  )
  const [content, setContent] = useState<JSONContent>(initialEntry?.content ?? emptyContent)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const photoTokens = useMemo(() => {
    const text = JSON.stringify(content)
    const matches = Array.from(text.matchAll(/\{\{photo:([a-zA-Z0-9_-]+)\}\}/g))
    return Array.from(new Set(matches.map((match) => match[1])))
  }, [content])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!bookSlug) {
      setError('Select a book before saving your entry.')
      return
    }

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!excerpt.trim()) {
      setError('Add a short excerpt so the homepage and listings have a preview.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        bookSlug,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        excerpt: excerpt.trim(),
        content,
        publishedAt: new Date(publishedAt).toISOString(),
      }

      let response: Response

      if (mode === 'create') {
        response = await fetch('/api/winter/adventure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      } else if (initialEntry) {
        response = await fetch(`/api/winter/adventure/${initialEntry.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
      } else {
        throw new Error('Edit mode requires an initial entry')
      }

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to save entry')
      }

      const data = await response.json()
      const entry = data.entry as WinterAdventureEntry

      if (mode === 'create') {
        router.replace(`/editor/winter/adventure/${entry.slug}`)
        router.refresh()
      } else {
        setSuccess('Entry saved successfully.')
        router.refresh()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save entry'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col text-sm text-slate-300">
            Adventure volume
            <select
              value={bookSlug}
              onChange={(event) => setBookSlug(event.target.value)}
              className="mt-1 rounded border border-slate-700 bg-slate-900/80 p-2"
              required
            >
              <option value="" disabled>
                Select a book
              </option>
              {books.map((book) => (
                <option key={book.slug} value={book.slug}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm text-slate-300">
            Published at
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className="mt-1 rounded border border-slate-700 bg-slate-900/80 p-2"
              required
            />
          </label>
        </div>

        <label className="flex flex-col text-sm text-slate-300">
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 rounded border border-slate-700 bg-slate-900/80 p-2"
            required
          />
        </label>

        <label className="flex flex-col text-sm text-slate-300">
          Subtitle
          <input
            type="text"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            className="mt-1 rounded border border-slate-700 bg-slate-900/80 p-2"
            placeholder="Optional"
          />
        </label>

        <label className="flex flex-col text-sm text-slate-300">
          Excerpt
          <textarea
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className="mt-1 h-32 rounded border border-slate-700 bg-slate-900/80 p-2"
            required
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Story body</span>
            <span className="text-xs text-slate-500">
              Insert photo tokens where you want images to appear: <code>{'{{photo:your-photo-id}}'}</code>
            </span>
          </div>
          <WinterEntryEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            onRequestPhoto={() => {
              document.getElementById('winter-photo-library')?.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="text-sm font-semibold text-slate-200">Photo tokens in use</h3>
          {photoTokens.length === 0 ? (
            <p className="text-sm text-slate-500">No photos inserted yet.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-200">
              {photoTokens.map((token) => (
                <li key={token} className="rounded border border-slate-700 bg-slate-800/80 px-2 py-1">
                  {`{{photo:${token}}}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {saving ? 'Saving…' : mode === 'create' ? 'Create entry' : 'Save changes'}
          </button>
        </div>
      </form>

      <aside className="space-y-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-lg font-semibold text-cyan-200">Photo library</h2>
          <p className="text-sm text-slate-400">
            Upload new photos or update captions. Click “Insert into entry” to drop a token at the current cursor.
          </p>
          <div id="winter-photo-library" className="mt-4">
            <WinterPhotoLibrary
              onSelect={(photo) => {
                editorRef.current?.insertPhotoToken(photo.id)
                setSuccess(`Inserted photo token {{photo:${photo.id}}}`)
              }}
            />
          </div>
        </div>
      </aside>
    </div>
  )
}
