import type { Metadata } from 'next'
import { Inter, Alkatra } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })
const alkatra = Alkatra({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-alkatra'
})

export const metadata: Metadata = {
  title: 'PathSix Games | Reign of Winter',
  description: 'PathSix is a website for friends who have been playing RPGs together for three decades. Follow our current Pathfinder campaign, Reign of Winter.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${alkatra.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}