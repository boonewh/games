// app/(winter)/adventure-log/[id]/page.tsx
import React, { type JSX } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, PenLine, Sparkles } from 'lucide-react'

import { readEntry } from '@/lib/entries'

// Very light JSON→HTML renderer for StarterKit content
type TiptapNode = {
  type?: string
  content?: TiptapNode[]
  text?: string
  marks?: { type: string }[]
  attrs?: { level?: number; language?: string }
}

function Render({ node }: { node?: TiptapNode | TiptapNode[] | null }): React.ReactNode {
  if (!node) return null
  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}><Render node={n} /></React.Fragment>)

  switch (node.type) {
    case 'doc':
      return <Render node={node.content} />
    case 'paragraph':
      return <p className="mb-5 leading-relaxed text-slate-200"><Render node={node.content} /></p>
    case 'text': {
      let el: string | React.ReactNode = node.text || ''
      if (node.marks) {
        for (const m of node.marks) {
          if (m.type === 'bold') el = <strong>{el}</strong>
          if (m.type === 'italic') el = <em>{el}</em>
          if (m.type === 'strike') el = <s>{el}</s>
          if (m.type === 'code') el = <code className="rounded bg-slate-800/80 px-1 py-0.5 text-sm text-cyan-200">{el}</code>
        }
      }
      return el
    }
    case 'heading': {
      const level = node.attrs?.level || 2
      const Tag = `h${level}` as keyof JSX.IntrinsicElements
      const sizes = {
        1: 'text-4xl md:text-5xl',
        2: 'text-3xl md:text-4xl',
        3: 'text-2xl md:text-3xl',
        4: 'text-xl md:text-2xl',
      } as Record<number, string>
      return (
        <Tag className={`mt-10 mb-4 font-['Alkatra'] font-semibold text-blue-100 ${sizes[level as keyof typeof sizes] ?? 'text-2xl'}`}>
          <Render node={node.content} />
        </Tag>
      )
    }
    case 'bulletList':
      return <ul className="mb-5 list-disc space-y-2 pl-6 text-slate-200"><Render node={node.content} /></ul>
    case 'orderedList':
      return <ol className="mb-5 list-decimal space-y-2 pl-6 text-slate-200"><Render node={node.content} /></ol>
    case 'listItem':
      return <li><Render node={node.content} /></li>
    case 'blockquote':
      return (
        <blockquote className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-6 text-slate-100">
          <Sparkles size={18} className="mb-2 text-cyan-300" />
          <Render node={node.content} />
        </blockquote>
      )
    case 'horizontalRule':
      return <hr className="my-10 border-slate-800" />
    case 'codeBlock':
      return (
        <pre className="mb-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-cyan-200">
          <code>
            <Render node={node.content} />
          </code>
        </pre>
      )
    case 'hardBreak':
      return <br />
    default:
      return null
  }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' })

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const entry = await readEntry(id)
  if (!entry) return notFound()

  const createdAt = new Date(entry.createdAt)
  const updatedAt = entry.updatedAt ? new Date(entry.updatedAt) : null
  const heroImage = entry.image ?? '/images/winter/irrisen.jpg'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="relative overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0">
          <Image src={heroImage} alt={entry.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 py-24">
          <Link
            href="/adventure-log"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900/60 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-slate-900/80"
          >
            <ArrowLeft size={16} />
            Back to Chronicle Archive
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-cyan-200/80">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2">
                <Calendar size={16} />
                {dateFormatter.format(createdAt)}
              </span>
              {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-400/10 px-4 py-2">
                  <Sparkles size={16} />
                  Updated {dateFormatter.format(updatedAt)}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-['Alkatra'] font-bold text-blue-100 drop-shadow-xl">
              {entry.title}
            </h1>
            {entry.excerpt && (
              <p className="max-w-3xl text-lg text-blue-100/80">
                {entry.excerpt}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={`/editor?id=${entry.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
            >
              <PenLine size={18} />
              Edit this Entry
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 -mt-12 pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <article className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
            {entry.image && (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl border border-slate-800">
                <Image src={entry.image} alt={entry.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60" />
              </div>
            )}

            <div className="mb-8 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-slate-800 px-3 py-1">
                Logged {dateTimeFormatter.format(createdAt)}
              </span>
              {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
                <span className="rounded-full border border-slate-800 px-3 py-1">
                  Last revised {dateTimeFormatter.format(updatedAt)}
                </span>
              )}
            </div>

            <div className="prose prose-invert max-w-none text-slate-100">
              <Render node={entry.content} />
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}

