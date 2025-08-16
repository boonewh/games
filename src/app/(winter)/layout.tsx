import type { Metadata } from 'next'
import Header from '@/components/winter/Header'
import Footer from '@/components/winter/Footer'

export const metadata: Metadata = {
  title: 'PathSix Games | Reign of Winter',
  description:
    'PathSix is a website for friends who have been playing RPGs together for three decades. Follow our current Pathfinder campaign, Reign of Winter.',
}

export default function WinterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}