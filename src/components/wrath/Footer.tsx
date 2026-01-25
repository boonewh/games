'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

const Footer = () => {
  const { data: session, status } = useSession()
  // @ts-expect-error - Custom NextAuth user.id property
  const userId = session?.user?.id || null
  const isLoaded = status !== 'loading'

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  };

  return (
    <>
      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-wotr-gold/50 to-transparent my-8"></div>

      <footer className="relative bg-gradient-to-b from-stone-dark via-stone-light to-stone-dark border-t border-wotr-gold/30">
        {/* Mystical overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-wardstone-blue/5 via-transparent to-abyssal-red/5 pointer-events-none"></div>

        {/* Main footer content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">

            {/* Back to Top Link */}
            <div className="flex-shrink-0">
              <button
                onClick={scrollToTop}
                className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-parchment/80 hover:text-wardstone-blue hover:bg-stone-dark/30 transition-all duration-300 font-medium tracking-wide font-spectral"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>Back to Top</span>
              </button>
            </div>

            {/* Central Wardstone Image */}
            <div className="flex-shrink-0 group">
              <div className="relative w-24 h-32 lg:w-32 lg:h-44">
                <Image
                  src="/images/wrath/wardstone.png"
                  alt="Wardstone"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(0,212,255,0.6)] transition-all duration-500"
                />
              </div>
            </div>

            {/* Rights and Attribution */}
            <div className="flex flex-col items-center lg:items-end space-y-2 text-center lg:text-right">
              <p className="text-zinc-500 text-sm font-medium tracking-wide font-spectral">
                All Rights Reserved
              </p>
              <Link
                href="https://www.pathsixdesigns.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-parchment/80 hover:text-wardstone-blue text-sm font-medium tracking-wide transition-colors duration-300 underline decoration-zinc-600 hover:decoration-wardstone-blue underline-offset-4 font-spectral"
              >
                PathSix Web Design
              </Link>
            </div>
          </div>

          {/* Bottom section with additional info */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">

              {/* Campaign info */}
              <div className="text-center sm:text-left">
                <p className="text-zinc-500 text-xs tracking-wider font-spectral">
                  Currently Playing: <span className="text-wotr-gold font-medium font-cinzel">Wrath of the Righteous</span>
                </p>
                <p className="text-zinc-600 text-xs tracking-wider mt-1 font-spectral">
                  Pathfinder Adventure Path by Paizo Inc.
                </p>
              </div>

              {/* Quick navigation */}
              <div className="flex items-center space-x-6 text-xs">
                {isLoaded && (
                  userId ? (
                    <button
                      onClick={handleSignOut}
                      className="text-zinc-500 hover:text-wardstone-blue transition-colors duration-300 tracking-wide font-spectral"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="text-zinc-500 hover:text-wardstone-blue transition-colors duration-300 tracking-wide font-spectral"
                    >
                      Sign In
                    </Link>
                  )
                )}
                <Link
                  href="/vault"
                  className="text-zinc-500 hover:text-wardstone-blue transition-colors duration-300 tracking-wide font-spectral"
                >
                  Character Vault
                </Link>
                <Link
                  href="/adventure-log"
                  className="text-zinc-500 hover:text-wardstone-blue transition-colors duration-300 tracking-wide font-spectral"
                >
                  Latest Adventure
                </Link>
                <Link
                  href="/dice"
                  className="text-zinc-500 hover:text-wardstone-blue transition-colors duration-300 tracking-wide font-spectral"
                >
                  Roll Dice
                </Link>
                <Link
                  href="/rules"
                  className="text-zinc-500 hover:text-wardstone-blue transition-colors duration-300 tracking-wide font-spectral"
                >
                  House Rules
                </Link>
                <Link
                  href="/admin"
                  className="text-zinc-500 hover:text-wardstone-blue transition-colors duration-300 tracking-wide font-spectral"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric bottom gradient - Wardstone themed */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-wardstone-blue/30 via-wotr-gold/30 to-wardstone-blue/30"></div>
      </footer>
    </>
  );
};

export default Footer;
