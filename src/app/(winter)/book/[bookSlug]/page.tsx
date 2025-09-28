import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWinterBook, getWinterEntriesForBook } from '@/lib/winter/store'

interface PageProps {
  params: {
    bookSlug: string
  }
}

export const revalidate = 0

export default async function WinterBookPage({ params }: PageProps) {
  const book = await getWinterBook(params.bookSlug)
  if (!book) {
    notFound()
  }

  const entries = await getWinterEntriesForBook(book.slug)

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-16 text-slate-100">
      <header className="space-y-4 text-center">
        <h1 className="text-5xl font-bold text-cyan-200">{book.title}</h1>
        {book.description && <p className="text-lg text-slate-300">{book.description}</p>}
      </header>

      {entries.length === 0 ? (
        <p className="text-center text-slate-400">No chapters recorded yet. Return soon!</p>
      ) : (
        <ul className="space-y-6">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="space-y-3 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-slate-100">
                    <Link href={`/book/${book.slug}/${entry.slug}`} className="hover:text-cyan-200">
                      {entry.title}
                    </Link>
                  </h2>
                  {entry.subtitle && <p className="text-sm text-slate-400">{entry.subtitle}</p>}
                </div>
                <time className="text-xs uppercase tracking-wide text-slate-500">
                  {new Date(entry.publishedAt).toLocaleDateString()}
                </time>
              </div>
              <p className="text-slate-300">{entry.excerpt}</p>
              <div className="text-right">
                <Link
                  href={`/book/${book.slug}/${entry.slug}`}
                  className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Continue reading →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
