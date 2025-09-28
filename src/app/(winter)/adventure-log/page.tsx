import Link from 'next/link'
import { getWinterBooks, getWinterEntries } from '@/lib/winter/store'

export const revalidate = 0

export default async function WinterAdventureLogPage() {
  const [books, entries] = await Promise.all([getWinterBooks(), getWinterEntries()])
  const entriesByBook = books.map((book) => ({
    book,
    entries: entries.filter((entry) => entry.bookSlug === book.slug),
  }))

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-16 text-slate-100">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Reign of Winter Adventure Log</h1>
        <p className="text-lg text-slate-300">
          Track every step of our heroes as they carve a path through the endless snows.
        </p>
      </header>

      {entriesByBook.map(({ book, entries }) => (
        <section key={book.slug} className="space-y-6 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-8">
          <header className="space-y-2">
            <h2 className="text-3xl font-semibold text-cyan-200">{book.title}</h2>
            {book.description && <p className="text-slate-300">{book.description}</p>}
          </header>

          {entries.length === 0 ? (
            <p className="text-slate-400">No entries yet. Check back soon!</p>
          ) : (
            <ul className="space-y-4">
              {entries.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-100">
                        <Link href={`/book/${book.slug}/${entry.slug}`} className="hover:text-cyan-200">
                          {entry.title}
                        </Link>
                      </h3>
                      {entry.subtitle && (
                        <p className="text-sm text-slate-400">{entry.subtitle}</p>
                      )}
                    </div>
                    <time className="text-xs uppercase tracking-wide text-slate-500">
                      {new Date(entry.publishedAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{entry.excerpt}</p>
                  <div className="mt-3 text-right">
                    <Link
                      href={`/book/${book.slug}/${entry.slug}`}
                      className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      Read entry →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
