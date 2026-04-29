import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PathSix Games | Wrath of the Righteous',
  description:
    'PathSix is a website for friends who have been playing RPGs together for three decades. Follow our current Pathfinder campaign, Wrath of the Righteous.',
}

export default function WrathLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-stone-dark text-parchment font-spectral antialiased">
      {children}
    </div>
  )
}
