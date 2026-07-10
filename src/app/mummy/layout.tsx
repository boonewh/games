import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "PathSix Games | Mummy's Mask",
  description:
    "PathSix is a website for friends who have been playing RPGs together for three decades. Follow our Pathfinder campaign, Mummy's Mask — the opening of the sealed tombs of Wati.",
}

export default function MummyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mm-dusk text-mm-ink font-spectral antialiased">
      {children}
    </div>
  )
}
