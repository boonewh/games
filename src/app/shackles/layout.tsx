'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/shackles/Header';
import Footer from '@/components/shackles/Footer';
import IndexLayout from '@/app/shackles/components/IndexLayout';

export default function ShacklesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShacklesIndex = pathname === '/shackles';

  if (isShacklesIndex) {
    // If your IndexLayout already renders <Footer/>, remove the <Footer /> below.
    return (
      <>
        <IndexLayout>{children}</IndexLayout>
        <Footer />
      </>
    );
  }

  return (
    <div className="bg-[#30393e] text-[#c6c4ba] font-[Verdana,Geneva,sans-serif] text-base font-normal">
      <Header />
      <main>{children}</main>
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}
