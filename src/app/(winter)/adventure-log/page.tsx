// app/adventure-log/page.tsx
import { listEntries } from '@/lib/entries'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic' // reflect new files during dev

export default async function AdventureLogPage() {
  const entries = await listEntries()
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-200 mb-6">Adventure Log</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {entries.map((e) => (
          <Link
            key={e.id}
            href={`/adventure-log/${e.id}`}
            className="block rounded-2xl border border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 transition"
          >
            {e.image && (
              <div className="relative w-full h-44 rounded-t-2xl overflow-hidden">
                <Image src={e.image} alt={e.title} fill className="object-cover" />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-slate-100">{e.title}</h2>
              <p className="text-slate-400 mt-2">{e.excerpt || '—'}</p>
              <p className="text-xs text-slate-500 mt-3">{new Date(e.createdAt).toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
