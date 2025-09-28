import Link from 'next/link'
import { getWinterEntries } from '@/lib/winter/store'

export const revalidate = 0

export default async function WinterAdventureEditorIndex() {
  const entries = await getWinterEntries()

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-cyan-100">Winter adventure log</h1>
          <p className="text-sm text-slate-400">
            Draft, edit, and publish chapters for the Reign of Winter campaign.
          </p>
        </div>
        <Link
          href="/editor/winter/adventure/new"
          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Create entry
        </Link>
      </header>

      <section className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">No entries yet. Click “Create entry” to start your chronicle.</p>
        ) : (
          <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/60">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">
                    {new Date(entry.publishedAt).toLocaleDateString()} · {entry.bookSlug}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-100">{entry.title}</h2>
                  {entry.subtitle && <p className="text-sm text-slate-400">{entry.subtitle}</p>}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/book/${entry.bookSlug}/${entry.slug}`}
                    className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                  >
                    View
                  </Link>
                  <Link
                    href={`/editor/winter/adventure/${entry.slug}`}
                    className="rounded bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
