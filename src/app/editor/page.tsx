'use client'

import { useState, useMemo } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export default function EditorPage() {
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')

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

  // Minimal types for TipTap JSON structure we care about
  type TiptapNode = {
    type?: string
    content?: TiptapNode[]
    text?: string
  }
  type TiptapJSON = {
    content?: TiptapNode[]
  }

  const excerpt = useMemo(() => {
    try {
      const json = editor?.getJSON() as TiptapJSON | undefined
      if (!json) return ''
      // grab first paragraph text as excerpt
      const firstP = (json.content || []).find((n) => n.type === 'paragraph')
      const text = (firstP?.content || [])
        .filter((n) => n.type === 'text')
        .map((n) => n.text || '')
        .join('')
      return text.slice(0, 220)
    } catch {
      return ''
    }
  }, [editor]) // re-eval when editor instance changes

  async function handleSave() {
    const content = editor?.getJSON()
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        image: image || undefined,
        excerpt,
        content,
      }),
    })
    if (!res.ok) {
      alert('Save failed')
      return
    }
    await res.json()
    window.location.href = `/adventure-log`
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-blue-200">Adventure Editor</h1>

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

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Excerpt preview: {excerpt ? `"${excerpt}…”` : '—'}
        </p>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Entry
        </button>
      </div>
    </div>
  )
}
