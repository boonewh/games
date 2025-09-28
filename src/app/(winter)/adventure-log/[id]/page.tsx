// app/adventure-log/[id]/page.tsx
import React from 'react'
import { readEntry } from '@/lib/entries'
import Image from 'next/image'
import { notFound } from 'next/navigation'

// Very light JSON→HTML renderer for StarterKit content
type TiptapNode = {
  type?: string
  content?: TiptapNode[]
  text?: string
  marks?: { type: string }[]
  attrs?: { level?: number }
}

function Render({ node }: { node?: TiptapNode | TiptapNode[] | null }): React.ReactNode {
  if (!node) return null
  if (Array.isArray(node)) return node.map((n, i) => <Render key={i} node={n} />)

  switch (node.type) {
    case 'doc':
      return <Render node={node.content} />
    case 'paragraph':
      return <p className="mb-4 text-slate-200"><Render node={node.content} /></p>
    case 'text': {
      let el: string | React.ReactNode = node.text || ''
      if (node.marks) {
        for (const m of node.marks) {
          if (m.type === 'bold') el = <strong>{el}</strong>
          if (m.type === 'italic') el = <em>{el}</em>
          if (m.type === 'strike') el = <s>{el}</s>
          if (m.type === 'code') el = <code>{el}</code>
        }
      }
      return el
    }
    case 'heading': {
      const level = node.attrs?.level || 2
      const tagName = `h${level}`
      return (
        React.createElement(
          tagName,
          { className: 'mt-6 mb-3 font-bold text-blue-200' },
          React.createElement(Render, { node: node.content })
        )
      )
    }
    case 'bulletList':
      return <ul className="list-disc pl-6 mb-4"><Render node={node.content} /></ul>
    case 'orderedList':
      return <ol className="list-decimal pl-6 mb-4"><Render node={node.content} /></ol>
    case 'listItem':
      return <li><Render node={node.content} /></li>
    case 'blockquote':
      return <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-300 mb-4"><Render node={node.content} /></blockquote>
    case 'horizontalRule':
      return <hr className="my-6 border-slate-700" />
    default:
      return null
  }
}

export default async function EntryPage({ params }: { params: { id: string } }) {
  const entry = await readEntry(params.id)
  if (!entry) return notFound()

  return (
    <article className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-200">{entry.title}</h1>
      <p className="text-sm text-slate-500 mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
      {entry.image && (
        <div className="relative w-full h-72 my-6 rounded-2xl overflow-hidden">
          <Image src={entry.image} alt={entry.title} fill className="object-cover" />
        </div>
      )}
      <div className="prose prose-invert max-w-none">
        <Render node={entry.content} />
      </div>
    </article>
  )
}
