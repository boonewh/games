// Minimal text-only nav for the tracker. Deliberately NOT the site header —
// the tracker is a lean combat screen and a full header would push the HP
// panel below the fold. One thin line of links, in normal flow.

import Link from 'next/link'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/wrath/tracker', label: 'Tracker' }
]

export function TrackerNav() {
  return (
    <nav className="px-4 pt-2 flex items-center gap-3 text-xs font-cinzel uppercase tracking-wider">
      {LINKS.map((l, i) => (
        <span key={l.href} className="flex items-center gap-3">
          {i > 0 && <span className="text-parchment/20">·</span>}
          <Link href={l.href} className="text-parchment/50 hover:text-wotr-gold transition-colors">
            {l.label}
          </Link>
        </span>
      ))}
    </nav>
  )
}
