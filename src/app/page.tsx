'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SnowWithAccumulation from "@/components/ui/SnowWithAccumulation";

// Define the snowflake type
interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  fontSize: number;
}

const PathSixHomepage = () => {
  const [hoveredCharacter, setHoveredCharacter] = useState<number | null>(null);

  const characters = [
    {
      name: "Aelira Kaldren",
      class: "Human Witch/Kineticist",
      image: "/images/aelira.jpg",
      sheet: "/images/aelira.pdf",
      description: "Master of elemental forces and ancient magics"
    },
    {
      name: "Alaric Aethelred", 
      class: "Human Gunslinger/Inquisitor",
      image: "/images/alaric.jpg",
      sheet: "/images/alaric.pdf",
      description: "Divine justice delivered through powder and steel"
    },
    {
      name: "Joshua",
      class: "Human Druid/Monk",
      image: "/images/joshua.jpg", 
      sheet: "/images/joshua.pdf",
      description: "Guardian of nature's balance and inner harmony"
    },
    {
      name: "Ivan",
      class: "Human Inquisitor/Wizard",
      image: "/images/ivan.jpg",
      sheet: "/images/ivan.pdf", 
      description: "Scholar-warrior wielding faith and arcane knowledge"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SnowWithAccumulation density={90} maxSize={3} wind={0.15} />

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-start">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/baba_yaga_hero.jpg"
            alt="Baba Yaga's mystical realm"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0"></div>
        </div>

        <div className="relative z-20 px-4 sm:px-6 lg:px-8">
          <div className="ml-8 sm:ml-12 lg:ml-16 max-w-3xl text-left mb-8">
            <h1 className="font-alkatra text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-6">
              Welcome, Brave Souls
            </h1>
            <h2 className="font-alkatra text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-300 mb-4">
              Reign of Winter
            </h2>
            <h3 className="text-xl sm:text-2xl text-blue-200 mb-8 font-medium">
              Our Winter Expedition Has Begun!
            </h3>
          </div>

          <div className="ml-8 sm:ml-12 lg:ml-16 max-w-3xl mb-12">
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">
              Welcome to our chilling expedition into the icy realms of Golarion and beyond, where the cold conceals ancient mysteries! Follow our bold heroes as they unravel the secrets of a wintry curse threatening the lands. What truths lie buried beneath the snow? What perils await in the frozen reaches?
            </p>
            
            <div className="mb-8">
              <p className="text-slate-400 italic">
                Warning! Spoilers for the &ldquo;Reign of Winter&rdquo; Adventure Path ahead. Proceed at your own risk!
              </p>
            </div>
          </div>

          <div className="ml-8 sm:ml-12 lg:ml-16 flex flex-col sm:flex-row items-start gap-6">
            <Link href="/book/snows-of-summer">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
                <span className="flex items-center">
                  Begin the Adventure
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </Link>

            <Link href="/dice">
              <button className="group px-8 py-4 bg-slate-700/80 backdrop-blur-sm border border-slate-500/50 text-slate-200 rounded-lg hover:bg-slate-600/80 hover:border-blue-400/50 transition-all duration-300 font-medium text-lg">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Roll the Dice
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Current Chapter Status */}
      <section className="relative py-16 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-y border-slate-600/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                Where Our Tale Stands
              </h2>
              <div className="space-y-4 text-lg text-slate-300">
                <p>
                  <span className="text-blue-200 font-semibold">Current Chapter:</span> The Snows of Summer
                </p>
                <p>
                  <span className="text-blue-200 font-semibold">Location:</span> The frozen lands of Irrisen
                </p>
                <p>
                  <span className="text-blue-200 font-semibold">Campaign Status:</span> The immortal witch Baba Yaga has vanished, and unnatural winter spreads across the realm...
                </p>
                <div className="pt-4">
                  <Link href="/rules" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline decoration-cyan-400/50 hover:decoration-cyan-300">
                    View our House Rules →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative group">
                <Image
                  src="/images/irrisen.jpg"
                  alt="Map of Irrisen, our current realm of adventure"
                  fill
                  className="object-cover rounded-lg shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20 rounded-lg"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold text-lg drop-shadow-lg">
                    The Frozen Realm of Irrisen
                  </p>
                  <p className="text-blue-200 text-sm drop-shadow-lg">
                    Where our heroes face the spreading winter curse
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Party Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-6">
              The Legendary Party
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Four heroes united by destiny, bound by friendship forged over three decades of adventure
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {characters.map((character, index) => (
              <div
                key={character.name}
                className="group relative"
                onMouseEnter={() => setHoveredCharacter(index)}
                onMouseLeave={() => setHoveredCharacter(null)}
              >
                {/* Character Card */}
                <div className={`relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border transition-all duration-500 overflow-hidden
                  ${hoveredCharacter === index 
                    ? 'border-blue-400/60 shadow-2xl shadow-blue-500/20 scale-105 -translate-y-4' 
                    : 'border-slate-600/30 hover:border-slate-500/50'
                  }`}
                  style={{
                    animation: hoveredCharacter === index ? 'glow 2s ease-in-out infinite' : 'none'
                  }}
                >
                  
                  {/* Character Portrait */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={character.image}
                      alt={`${character.name} character portrait`}
                      fill
                      className={`object-cover transition-all duration-700 ${
                        hoveredCharacter === index ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    
                    {/* Magical overlay effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-blue-600/30 via-transparent to-purple-600/20 transition-opacity duration-500 ${
                      hoveredCharacter === index ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                    
                    {/* Floating magical particles on hover */}
                    {hoveredCharacter === index && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-70"
                            style={{
                              left: `${20 + (i * 10)}%`,
                              top: `${30 + (i * 5)}%`,
                              animation: `float ${1 + (i * 0.2)}s ease-in-out infinite`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Character Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-200 mb-2">
                      {character.name}
                    </h3>
                    <p className="text-slate-400 font-medium mb-3">
                      {character.class}
                    </p>
                    <p className={`text-sm text-slate-300 transition-all duration-500 ${
                      hoveredCharacter === index ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'
                    }`}>
                      {character.description}
                    </p>
                    
                    {/* Character Sheet Link */}
                    <div className={`mt-4 transition-all duration-500 ${
                      hoveredCharacter === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      <Link 
                        href={character.sheet}
                        target="_blank"
                        className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors duration-300 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Character Sheet
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Adventure Excerpt Section */}
      <section className="relative py-20 bg-gradient-to-r from-slate-800/30 to-slate-700/30 backdrop-blur-sm border-y border-slate-600/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              From Our Latest Chapter
            </h2>
            <p className="text-lg text-slate-400">
              A glimpse into our most recent adventure...
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-600/30 p-8 lg:p-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Adventure excerpt text */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-200 mb-3">
                  The Frozen Trail Beckons
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Posted on December 15th, 2024
                </p>
                
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-slate-300 leading-relaxed mb-6">
                    The icy wind howled through the ancient pines as our heroes pressed deeper into the cursed lands of Irrisen. What began as whispers of unnatural winter had become a bitter reality—snow fell where flowers should bloom, and the very air crackled with malevolent magic. Aelira&apos;s breath misted in the frigid air as she traced arcane symbols, seeking answers in the elemental forces that seemed to rebel against nature itself...
                  </p>
                  
                  <blockquote className="border-l-4 border-blue-400 pl-6 py-2 bg-slate-700/30 rounded-r-lg my-6">
                    <p className="text-blue-200 italic text-lg">
                      &ldquo;The very stones here remember winter&rsquo;s eternal embrace. We tread where mortals were never meant to walk.&rdquo;
                    </p>
                    <footer className="text-slate-400 text-sm mt-2">
                      — Aelira Kaldren, upon sensing the ancient magics
                    </footer>
                  </blockquote>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href="/book/snows-of-summer">
                    <button className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium">
                      <span className="flex items-center">
                        Read the Full Adventure
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  </Link>
                  
                  <Link href="/book/snows-of-summer">
                    <button className="px-6 py-3 bg-slate-700/60 backdrop-blur-sm border border-slate-500/50 text-slate-200 rounded-lg hover:bg-slate-600/60 hover:border-blue-400/50 transition-all duration-300 font-medium">
                      View All Entries
                    </button>
                  </Link>
                </div>
              </div>

              {/* Adventure image */}
              <div className="flex-shrink-0">
                <div className="relative w-full lg:w-80 aspect-[4/5] group">
                  <Image
                    src="/images/baba_yaga_hero.jpg"
                    alt="Scene from our latest adventure"
                    fill
                    className="object-cover rounded-lg shadow-xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-slate-900/20 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-8 lg:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-200 mb-6">
              Join Our Winter&apos;s Tale
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Step into our world of adventure, friendship, and epic storytelling. Three decades of memories await your discovery.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/book/snows-of-summer">
                <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
                  Start Reading
                </button>
              </Link>
              
              <Link href="/rules">
                <button className="px-8 py-4 bg-slate-700/60 backdrop-blur-sm border border-slate-500/50 text-slate-200 rounded-lg hover:bg-slate-600/60 hover:border-blue-400/50 transition-all duration-300 font-medium text-lg">
                  Learn Our Rules
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PathSixHomepage;