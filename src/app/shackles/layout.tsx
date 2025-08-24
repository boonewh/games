'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import Header from '@/components/shackles/Header';
import Footer from '@/components/shackles/Footer';
import IndexLayout from '@/app/shackles/components/IndexLayout';

interface SkullShacklesLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function SkullShacklesLayout({ children, className = '' }: SkullShacklesLayoutProps) {
  const pathname = usePathname();
  const isShacklesIndex = pathname === '/shackles';

  // Shackles landing page: over-hero header + footer
  if (isShacklesIndex) {
    return (
      <>
        <IndexLayout>{children}</IndexLayout>
        <Footer />
      </>
    );
  }

  // All other Shackles pages: normal header/footer
  return (
    <div className={`bg-[#30393e] text-[#c6c4ba] font-[Verdana,Geneva,sans-serif] text-base font-normal ${className}`}>
      <Header />
      <main>{children}</main>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
