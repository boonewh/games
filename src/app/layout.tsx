import type { Metadata } from 'next'
import { Inter, Alkatra } from 'next/font/google'
import './globals.css'
import ClerkClientProvider from '@/components/ClerkClientProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const alkatra = Alkatra({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-alkatra',
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
      <body className={`${inter.variable} ${alkatra.variable}`} style={{ backgroundColor: '#30393e' }}>
        <ClerkClientProvider>
          {children}
        </ClerkClientProvider>
      </body>
    </html>
  )
}