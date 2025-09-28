import { notFound } from 'next/navigation'
import { WinterEntryForm } from '@/components/winter/editor/WinterEntryForm'
import { getWinterBooks, getWinterEntry } from '@/lib/winter/store'

interface PageProps {
  params: {
    slug: string
  }
}

export const revalidate = 0

export default async function EditWinterEntryPage({ params }: PageProps) {
  const [entry, books] = await Promise.all([
    getWinterEntry(params.slug),
    getWinterBooks(),
  ])

  if (!entry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-cyan-100">Edit entry</h1>
        <p className="text-sm text-slate-400">
          Update the chapter, adjust excerpts, or fine-tune photo placements.
        </p>
      </header>

      <WinterEntryForm books={books} initialEntry={entry} mode="edit" />
    </div>
  )
}
