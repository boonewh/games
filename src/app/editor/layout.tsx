import Link from 'next/link'
import type { ReactNode } from 'react'

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-cyan-200">
            PathSix Winter Editor
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/editor/winter/adventure" className="hover:text-cyan-200">
              Adventure entries
            </Link>
            <Link href="/editor/winter/photos" className="hover:text-cyan-200">
              Photo library
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
