'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useClerk } from '@clerk/nextjs';

const Footer = () => {
  const { userId, isLoaded } = useAuth();
  const { signOut } = useClerk();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent my-8"></div>
      
      <footer className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-t border-slate-600/30">
        {/* Mystical overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-transparent to-purple-900/5 pointer-events-none"></div>
        
        {/* Main footer content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            
            {/* Back to Top Link */}
            <div className="flex-shrink-0">
              <button
                onClick={scrollToTop}
                className="group flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:text-blue-200 hover:bg-slate-700/30 transition-all duration-300 font-medium tracking-wide"
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

            {/* Central Baba Yaga's Hut Image */}
            <div className="flex-shrink-0 group">
              <div className="relative w-24 h-16 lg:w-32 lg:h-48">
                <Image
                  src="/images/winter/baba_yagas_hut_footer.png"
                  alt="Baba Yaga's hut"
                  fill
                  className="object-contain filter drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
                  priority
                />
                {/* Mystical glow effect */}
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </div>
            </div>

            {/* Rights and Attribution */}
            <div className="flex flex-col items-center lg:items-end space-y-2 text-center lg:text-right">
              <p className="text-slate-400 text-sm font-medium tracking-wide">
                All Rights Reserved
              </p>
              <Link 
                href="https://www.pathsixdesigns.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-blue-200 text-sm font-medium tracking-wide transition-colors duration-300 underline decoration-slate-500 hover:decoration-blue-200 underline-offset-4"
              >
                PathSix Web Design
              </Link>
            </div>
          </div>

          {/* Bottom section with additional info */}
          <div className="mt-8 pt-6 border-t border-slate-600/30">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              
              {/* Campaign info */}
              <div className="text-center sm:text-left">
                <p className="text-slate-400 text-xs tracking-wider">
                  Currently Playing: <span className="text-slate-300 font-medium">Reign of Winter</span>
                </p>
                <p className="text-slate-500 text-xs tracking-wider mt-1">
                  Pathfinder Adventure Path by Paizo Inc.
                </p>
              </div>

              {/* Quick navigation */}
              <div className="flex items-center space-x-6 text-xs">
                {isLoaded && (
                  userId ? (
                    <button 
                      onClick={handleSignOut}
                      className="text-slate-400 hover:text-blue-200 transition-colors duration-300 tracking-wide"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link 
                      href="/sign-in" 
                      className="text-slate-400 hover:text-blue-200 transition-colors duration-300 tracking-wide"
                    >
                      Sign In
                    </Link>
                  )
                )}
                <Link 
                  href="/vault" 
                  className="text-slate-400 hover:text-blue-200 transition-colors duration-300 tracking-wide"
                >
                  Character Vault
                </Link>
                <Link 
                  href="/adventure-log" 
                  className="text-slate-400 hover:text-blue-200 transition-colors duration-300 tracking-wide"
                >
                  Latest Adventure
                </Link>
                <Link 
                  href="/dice" 
                  className="text-slate-400 hover:text-blue-200 transition-colors duration-300 tracking-wide"
                >
                  Roll Dice
                </Link>
                <Link 
                  href="/rules" 
                  className="text-slate-400 hover:text-blue-200 transition-colors duration-300 tracking-wide"
                >
                  House Rules
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30"></div>
      </footer>
    </>
  );
};

export default Footer;