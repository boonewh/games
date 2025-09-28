import { WinterEntryForm } from '@/components/winter/editor/WinterEntryForm'
import { getWinterBooks } from '@/lib/winter/store'

export const revalidate = 0

export default async function CreateWinterEntryPage() {
  const books = await getWinterBooks()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-cyan-100">Create a new entry</h1>
        <p className="text-sm text-slate-400">
          Draft a fresh chapter for the Reign of Winter adventure log.
        </p>
      </header>

      <WinterEntryForm books={books} mode="create" />
    </div>
  )
}
