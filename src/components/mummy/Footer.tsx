'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Footer = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id || null;
  const isLoaded = status !== 'loading';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-mm-gold/50 to-transparent"></div>

      <footer className="relative bg-gradient-to-b from-mm-night via-mm-dusk-alt to-mm-night border-t border-mm-gold/30">
        {/* Portal overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-mm-teal/5 via-transparent to-mm-ember/5 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">

            {/* Back to Top */}
            <div className="flex-shrink-0">
              <button
                onClick={scrollToTop}
                className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-mm-ink/80 hover:text-mm-teal hover:bg-mm-night/30 transition-all duration-300 font-medium tracking-wide font-spectral"
              >
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>Back to Top</span>
              </button>
            </div>

            {/* Central emblem — glowing portal ankh */}
            <div className="flex-shrink-0 group">
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full border border-mm-teal/40 bg-mm-night/40 shadow-[0_0_20px_rgba(43,224,201,0.25)] group-hover:shadow-[0_0_32px_rgba(43,224,201,0.45)] transition-all duration-500">
                <span className="font-cinzel text-5xl text-mm-teal drop-shadow-[0_0_12px_rgba(43,224,201,0.6)] leading-none select-none" aria-hidden="true">☥</span>
              </div>
            </div>

            {/* Rights and Attribution */}
            <div className="flex flex-col items-center lg:items-end space-y-2 text-center lg:text-right">
              <p className="text-mm-ink-soft text-sm font-medium tracking-wide font-spectral">
                All Rights Reserved
              </p>
              <Link
                href="https://www.pathsixsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mm-ink/80 hover:text-mm-teal text-sm font-medium tracking-wide transition-colors duration-300 underline decoration-mm-cardline hover:decoration-mm-teal underline-offset-4 font-spectral"
              >
                PathSix Solutions
              </Link>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-8 pt-6 border-t border-mm-cardline">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">

              {/* Campaign info */}
              <div className="text-center sm:text-left">
                <p className="text-mm-ink-soft text-xs tracking-wider font-spectral">
                  Coming Spring 2027: <span className="text-mm-teal font-medium font-cinzel">Mummy&apos;s Mask</span>
                </p>
                <p className="text-mm-ink-soft/70 text-xs tracking-wider mt-1 font-spectral">
                  Pathfinder Adventure Path by Paizo Inc.
                </p>
              </div>

              {/* Quick navigation */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
                {isLoaded && (
                  userId ? (
                    <button
                      onClick={handleSignOut}
                      className="text-mm-ink-soft hover:text-mm-teal transition-colors duration-300 tracking-wide font-spectral"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="text-mm-ink-soft hover:text-mm-teal transition-colors duration-300 tracking-wide font-spectral"
                    >
                      Sign In
                    </Link>
                  )
                )}
                <Link href="/vault" className="text-mm-ink-soft hover:text-mm-teal transition-colors duration-300 tracking-wide font-spectral">
                  Character Vault
                </Link>
                <Link href="/mummy#log" className="text-mm-ink-soft hover:text-mm-teal transition-colors duration-300 tracking-wide font-spectral">
                  Latest Dispatch
                </Link>
                <Link href="/mummy#gallery" className="text-mm-ink-soft hover:text-mm-teal transition-colors duration-300 tracking-wide font-spectral">
                  Gallery
                </Link>
                <Link href="/admin" className="text-mm-ink-soft hover:text-mm-teal transition-colors duration-300 tracking-wide font-spectral">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-mm-teal/30 via-mm-gold/30 to-mm-teal/30"></div>
      </footer>
    </>
  );
};

export default Footer;
