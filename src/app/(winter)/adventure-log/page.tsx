// app/(winter)/adventure-log/page.tsx
import { listEntries } from '@/lib/entries'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Calendar, Sparkles, PenLine } from 'lucide-react'

export const dynamic = 'force-dynamic' // reflect new files during dev

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export default async function AdventureLogPage() {
  const entries = await listEntries()
  const totalEntries = entries.length
  const latestEntry = entries[0]
  const earliestEntry = entries[entries.length - 1]

  const journeyRange = latestEntry && earliestEntry
    ? `${dateFormatter.format(new Date(earliestEntry.createdAt))} – ${dateFormatter.format(new Date(latestEntry.createdAt))}`
    : 'The long winter begins'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        <Image
          src="/images/winter/baba_yaga_hero.jpg"
          alt="Icy wasteland with Baba Yaga's hut"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-cyan-200/80 mb-6">Chronicles of the Long Winter</p>
            <h1 className="text-4xl md:text-6xl font-['Alkatra'] font-bold text-blue-100 drop-shadow-lg">
              Reign of Winter Adventure Log
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100/80 leading-relaxed">
              Follow our band of Pathfinders as they carve a trail through endless snow, haunted forests, and forgotten realms in
              search of Baba Yaga. Every entry is a tale of survival, sacrifice, and frostbitten heroics.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
              >
                <PenLine size={18} />
                Record a New Chronicle
              </Link>
              <Link
                href="#entries"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-200 hover:text-cyan-100"
              >
                <BookOpen size={18} />
                Browse the Archive
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
              <div className="flex items-center gap-3 text-cyan-200">
                <BookOpen size={24} />
                <span className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Entries</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-100 font-['Alkatra']">{totalEntries || '—'}</p>
              <p className="mt-2 text-sm text-slate-300/80">
                Stories chronicled from the snows of Irrisen and beyond.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
              <div className="flex items-center gap-3 text-cyan-200">
                <Calendar size={24} />
                <span className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Chronicle Span</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-100 font-['Alkatra']">
                {totalEntries > 0 ? journeyRange : '—'}
              </p>
              <p className="mt-2 text-sm text-slate-300/80">
                From our first frostbitten steps to the latest victory.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
              <div className="flex items-center gap-3 text-cyan-200">
                <Sparkles size={24} />
                <span className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">Latest Entry</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-blue-100 font-['Alkatra']">
                {latestEntry ? dateFormatter.format(new Date(latestEntry.updatedAt ?? latestEntry.createdAt)) : 'Soon'}
              </p>
              {latestEntry && (
                <p className="mt-2 text-sm text-slate-300/80">
                  &ldquo;{latestEntry.title}&rdquo;
                </p>
              )}
              {!latestEntry && (
                <p className="mt-2 text-sm text-slate-300/80">
                  Chronicles will appear here as they are penned.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Entries */}
      <section id="entries" className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-['Alkatra'] font-semibold text-blue-100">Chronicle Archive</h2>
            <p className="mt-2 text-slate-300/80 max-w-2xl">
              Each entry captures the cold breath of the north, the clash of steel, and the whispers of ancient magic guiding our
              heroes forward.
            </p>
          </div>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-full border border-blue-400/60 px-5 py-2.5 text-sm font-semibold text-blue-100 transition hover:border-blue-300 hover:text-blue-200"
          >
            <PenLine size={18} />
            Start a Fresh Entry
          </Link>
        </div>

        {totalEntries === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-12 text-center">
            <p className="text-lg text-slate-300/80">
              The chronicle is quiet—for now. Brave chronicler, will you pen the first tale?
            </p>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {entries.map((entry, index) => {
              const createdAt = new Date(entry.createdAt)
              const updatedAt = entry.updatedAt ? new Date(entry.updatedAt) : null
              return (
                <article
                  key={entry.id}
                  className="group relative overflow-hidden rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900/90 shadow-2xl shadow-slate-950/40 transition hover:border-cyan-400/40"
                >
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-400/20" />
                  {entry.image ? (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={entry.image}
                        alt={entry.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20" />
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-blue-500/40 via-cyan-400/30 to-blue-500/40" />
                  )}

                  <div className="relative p-6 lg:p-8">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                      <span>Entry {totalEntries - index}</span>
                      <span>{dateFormatter.format(createdAt)}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold text-blue-100">{entry.title}</h3>
                    <p className="mt-3 text-sm text-slate-300/80 leading-relaxed">
                      {entry.excerpt || 'A fresh tale waiting to be told.'}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="rounded-full border border-slate-700/70 px-3 py-1">
                        Logged {dateTimeFormatter.format(createdAt)}
                      </span>
                      {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
                        <span className="rounded-full border border-slate-700/70 px-3 py-1">
                          Updated {dateTimeFormatter.format(updatedAt)}
                        </span>
                      )}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href={`/adventure-log/${entry.id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-5 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/25 hover:text-cyan-100"
                      >
                        Read Full Chronicle
                      </Link>
                      <Link
                        href={`/editor?id=${entry.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-blue-200"
                      >
                        Edit Entry
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
