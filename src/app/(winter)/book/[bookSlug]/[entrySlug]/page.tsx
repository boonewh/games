import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WinterAdventureRenderer } from '@/components/winter/adventure/WinterAdventureRenderer'
import { getWinterBook, getWinterEntriesForBook, listWinterPhotos } from '@/lib/winter/store'

interface PageProps {
  params: {
    bookSlug: string
    entrySlug: string
  }
}

export const revalidate = 0

export default async function WinterEntryPage({ params }: PageProps) {
  const [book, entries, photos] = await Promise.all([
    getWinterBook(params.bookSlug),
    getWinterEntriesForBook(params.bookSlug),
    listWinterPhotos(),
  ])

  if (!book) {
    notFound()
  }

  const index = entries.findIndex((entry) => entry.slug === params.entrySlug)
  if (index === -1) {
    notFound()
  }

  const entry = entries[index]
  const previous = index > 0 ? entries[index - 1] : undefined
  const next = index < entries.length - 1 ? entries[index + 1] : undefined

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-16 text-slate-100">
      <Link href={`/book/${book.slug}`} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
        ← Back to {book.title}
      </Link>

      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-cyan-100">{entry.title}</h1>
        {entry.subtitle && <p className="text-lg text-slate-300">{entry.subtitle}</p>}
        <time className="block text-sm uppercase tracking-wide text-slate-500">
          {new Date(entry.publishedAt).toLocaleDateString()}
        </time>
      </header>

      <WinterAdventureRenderer entry={entry} photos={photos} />

      <nav className="flex flex-col gap-4 border-t border-slate-700 pt-6 text-sm text-cyan-200 sm:flex-row sm:justify-between">
        {previous ? (
          <Link href={`/book/${book.slug}/${previous.slug}`} className="hover:text-cyan-100">
            ← {previous.title}
          </Link>
        ) : (
          <span className="text-slate-500">Beginning of the chronicle</span>
        )}
        {next ? (
          <Link href={`/book/${book.slug}/${next.slug}`} className="ml-auto hover:text-cyan-100">
            {next.title} →
          </Link>
        ) : (
          <span className="ml-auto text-slate-500">More chapters coming soon</span>
        )}
      </nav>
    </div>
  )
}
