'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Footer from '@/components/shackles/Footer'; 

interface IndexLayoutProps {
  children: React.ReactNode;
}

export default function IndexLayout({ children }: IndexLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-[url('/images/shackles/heroAlt.jpg')] bg-no-repeat bg-center bg-cover lg:h-screen">
      {/* Overlay Header - Positioned over the hero */}
      <header className="absolute top-0 left-0 w-full z-50">
        <Image 
          src="/images/shackles/PathSixLogowhite.png" 
          alt="The Pathfinder 6" 
          width={400}
          height={100}
          className="w-full lg:w-[20%] drop-shadow-2xl pb-3"
          priority
        />
        
        <nav className="w-[95%] mx-auto">
          {/* Mobile Navigation Icon */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onMouseEnter={() => setIsMenuOpen(true)}
              className="block"
            >
              <Image 
                src="/images/shackles/navicon.png" 
                alt="Navigation Menu" 
                width={32}
                height={32}
                className="drop-shadow-lg"
              />
            </button>
          </div>

          {/* Navigation Menu */}
          <ul 
            className={`${
              isMenuOpen ? 'block' : 'hidden'
            } lg:flex lg:flex-row lg:justify-center lg:items-center list-none bg-black/30 lg:bg-transparent rounded-lg lg:rounded-none`}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <Image 
              src="/images/shackles/flagfill.png" 
              alt="pirate flag" 
              width={60}
              height={40}
              className="w-[15%] lg:w-[5%] lg:ml-[-2%] lg:z-[100] drop-shadow-lg"
            />
            
            <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
              <Link 
                href="/" 
                className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black drop-shadow-lg"
              >
                Home Page
              </Link>
            </li>
            
            <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
              <Link 
                href="/shackles" 
                className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black drop-shadow-lg"
              >
                Shackles Home Page
              </Link>
            </li>
            
            <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
              <Link 
                href="/shackles/book1" 
                className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black drop-shadow-lg"
              >
                Adventure Log
              </Link>
            </li>
            
            <li className="lg:w-full lg:ml-[-2.5%] lg:leading-[1.5em]">
              <Link 
                href="/shackles/rules" 
                className="text-[#c6c4ba] text-[1.3em] leading-[1.6em] no-underline lg:block lg:text-center lg:text-[1.1em] lg:leading-[1.8em] lg:font-bold hover:bg-[#9d9b9c] hover:text-black active:bg-[#9d9b9c] active:text-black drop-shadow-lg"
              >
                Rules Page
              </Link>
            </li>
            
            <Image 
              src="/images/shackles/flagfill.png" 
              alt="pirate flag" 
              width={60}
              height={40}
              className="w-[15%] lg:w-[5%] lg:ml-[-2%] lg:z-[100] drop-shadow-lg"
            />
          </ul>
        </nav>
      </header>

      {/* Hero Content */}
      <main className="relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}