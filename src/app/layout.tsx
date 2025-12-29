import type { Metadata } from 'next'
import { Inter, Alkatra, Cinzel, Spectral } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const alkatra = Alkatra({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-alkatra',
})
const cinzel = Cinzel({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-cinzel',
})
const spectral = Spectral({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-spectral',
})

export const metadata: Metadata = {
  title: 'PathSix Games',
  description: 'Adventures in tabletop RPG storytelling spanning 30 years of friendship',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${alkatra.variable} ${cinzel.variable} ${spectral.variable}`} style={{ backgroundColor: '#30393e' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}