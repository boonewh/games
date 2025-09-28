'use client'

import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useRouter, useSearchParams } from 'next/navigation'

type JSONNode = {
  type?: string
  content?: JSONNode[]
  text?: string
}

function getExcerptFromContent(json: unknown, limit = 220): string {
  if (!json || typeof json !== 'object') return ''
  const content = (json as { content?: JSONNode[] }).content
  if (!Array.isArray(content)) return ''
  for (const node of content) {
    if (node?.type === 'paragraph' && Array.isArray(node.content)) {
      const text = node.content
        .filter(child => child?.type === 'text' && typeof child.text === 'string')
        .map(child => child.text as string)
        .join('')
        .trim()
      if (text) {
        return text.slice(0, limit)
      }
    }
  }
  return ''
}

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const entryId = searchParams.get('id')
  const isEditing = Boolean(entryId)

  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write the tale of tonight…',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[300px] p-4 bg-slate-900/40 rounded-2xl border border-slate-700 focus:outline-none',
      },
    },
    immediatelyRender: false,   // 👈 goes here, not inside extensions
  })

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      try {
        const json = editor.getJSON()
        setExcerpt(getExcerptFromContent(json))
      } catch {
        setExcerpt('')
      }
    }

    handleUpdate()
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor])

  useEffect(() => {
    if (!isEditing || !entryId || !editor) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/entries/${entryId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Entry not found' : 'Failed to load entry')
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setTitle(data.title ?? '')
        setImage(data.image ?? '')
        setExcerpt(data.excerpt ?? '')
        editor.commands.setContent(data.content ?? '')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load entry')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [editor, entryId, isEditing])

  async function handleSave() {
    if (!editor) return
    setSaving(true)
    setError(null)
    const content = editor?.getJSON()
    const payload = {
      title,
      image: image.trim() ? image.trim() : undefined,
      excerpt,
      content,
    }

    const endpoint = isEditing && entryId ? `/api/entries/${entryId}` : '/api/entries'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error('Save failed')
      }
      const saved = await res.json()
      router.push(`/adventure-log/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-blue-200">
        {isEditing ? 'Edit Chronicle Entry' : 'Adventure Editor'}
      </h1>

      {isEditing && (
        <p className="text-sm text-slate-400">
          Updating existing entry <span className="font-mono text-slate-300">{entryId}</span>
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100"
      />

      <input
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="Image URL (optional)"
        className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-100"
      />

      {editor && <EditorContent editor={editor} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Excerpt preview: {excerpt ? `"${excerpt}…”` : '—'}
        </p>
        <div className="flex items-center gap-3">
          {loading && <span className="text-xs text-slate-500">Loading entry…</span>}
          <button
            onClick={handleSave}
            disabled={!editor || saving || loading}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
