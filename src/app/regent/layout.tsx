import React from 'react';
import { Alkatra } from 'next/font/google';
import Header from '@/components/regent/Header';
import Footer from '@/components/regent/Footer';

const alkatra = Alkatra({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-alkatra'
});

export const metadata = {
  title: {
    default: 'Jade Regent - PathSix Games',
    template: '%s | Jade Regent - PathSix Games'
  },
  description: 'Follow our party\'s epic journey through the Jade Regent Adventure Path in Tian Xia.',
  keywords: ['Pathfinder', 'Jade Regent', 'RPG', 'Adventure Path', 'Tian Xia', 'PathSix'],
};

interface RegentLayoutProps {
  children: React.ReactNode;
}

export default function RegentLayout({ children }: RegentLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-orange-100 ${alkatra.variable}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}