'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SnowWithAccumulation from "@/components/ui/SnowWithAccumulation";
import MiniatureGallery from "@/components/winter/MiniatureGallery";
import { StoryEntry } from '@/types/story';


const PathSixHomepage = () => {
  const [hoveredCharacter, setHoveredCharacter] = useState<number | null>(null);
  const [latestStory, setLatestStory] = useState<StoryEntry | null>(null);
  const [loadingStory, setLoadingStory] = useState(true);

  // Helper functions for story processing
  const getStoryTitle = (story: StoryEntry): string => {
    // Try to find a heading block first
    const heading = story.story.find(block => block.type === 'heading');
    if (heading && 'content' in heading && typeof heading.content === 'string') {
      return heading.content;
    }
    
    // Fall back to formatted slug
    return story.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStoryExcerpt = (story: StoryEntry, limit = 350): string => {
    // Find the first substantial paragraph (skip very short ones)
    const paragraphs = story.story.filter(block => 
      block.type === 'paragraph' && 
      'content' in block && 
      typeof block.content === 'string' &&
      block.content.trim().length > 50
    );
    
    if (paragraphs.length > 0) {
      const firstParagraph = paragraphs[0];
      if ('content' in firstParagraph && typeof firstParagraph.content === 'string') {
        const content = firstParagraph.content.trim();
        return content.length > limit ? content.substring(0, limit) + '...' : content;
      }
    }
    
    return 'Step into our latest winter adventure...';
  };

  const getBookTitle = (bookSlug: string): string => {
    const bookMap: Record<string, string> = {
      'the-snows-of-summer': 'The Snows of Summer',
      'the-shackled-hut': 'The Shackled Hut', 
      'maiden-mother-crone': 'Maiden, Mother, Crone',
      'the-frozen-stars': 'The Frozen Stars',
      'rasputin-must-die': 'Rasputin Must Die!',
      'the-witch-queen-revenge': 'The Witch Queen\'s Revenge'
    };
    return bookMap[bookSlug] || bookSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Fetch the latest story
  useEffect(() => {
    const fetchLatestStory = async () => {
      try {
        const response = await fetch('/api/stories?limit=1');
        if (response.ok) {
          const stories = await response.json();
          if (stories && stories.length > 0) {
            setLatestStory(stories[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch latest story:', error);
      } finally {
        setLoadingStory(false);
      }
    };

    fetchLatestStory();
  }, []);

  const characters = [
    {
      name: "Aelira Kaldren",
      class: "Human Witch/Kineticist",
      image: "/images/winter/aelira.jpg",
      sheet: "/api/vault/proxy?file=aelira.pdf",
      description: "Master of elemental forces and ancient magics"
    },
    {
      name: "Alaric Aethelred", 
      class: "Human Gunslinger/Inquisitor",
      image: "/images/winter/alaric.jpg",
      sheet: "/api/vault/proxy?file=alaric.pdf",
      description: "Divine justice delivered through powder and steel"
    },
    {
      name: "Joshua the Red",
      class: "Human Druid/Monk",
      image: "/images/winter/joshua.jpg", 
      sheet: "/api/vault/proxy?file=joshua.pdf",
      description: "Guardian of nature's balance and inner harmony"
    },
    {
      name: "Ivan",
      class: "Half-Elf Inquisitor/Wizard",
      image: "/images/winter/ivan.jpg",
      sheet: "/api/vault/proxy?file=ivan.pdf",
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
        {/* Desktop hero image */}
        <div className="absolute inset-0 z-0 hidden sm:block">
          <Image
            src="/images/winter/baba_yaga_hero.jpg"
            alt="Baba Yaga's mystical realm"
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
        </div>

        {/* Mobile hero image */}
        <div className="absolute inset-0 z-0 sm:hidden">
          <Image
            src="/images/winter/baba_yaga_hero_mobile.jpg"
            alt="Baba Yaga's mystical realm"
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          {/* Mobile-only stronger overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40"></div>
        </div>

        <div className="relative z-20 px-4 sm:px-6 lg:px-15">
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

          <div className="ml-8 sm:ml-12 lg:ml-16 max-w-4xl mb-12">
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
            <Link href="/adventure-log">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
                <span className="flex items-center">
                  Begin the Adventure
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Current Chapter Status */}
      <section className="relative py-16 px-10 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-y border-slate-600/30">
        <div className="mx-4 sm:mx-8 lg:mx-20 px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                Where Our Tale Stands
              </h2>
              <div className="space-y-4 text-lg text-slate-300">
                <p>
                  <span className="text-blue-200 font-semibold">Current Chapter:</span> <i>Rasputin Must Die!</i> (Part 5 of 6)
                </p>
                <p>
                  <span className="text-blue-200 font-semibold">Location:</span> A desolate World War I–era Russian military base on Earth, twisted by occult energy and anchored to Baba Yaga’s magic
                </p>
                <p>
                  <span className="text-blue-200 font-semibold">Current Quest:</span> Breach the fortified compound, uncover Baba Yaga’s fate, and confront the mad monk Rasputin before he severs her immortality
                </p>
                <p>
                  <span className="text-blue-200 font-semibold">The Conflict:</span> The heroes face soldiers, spirits, and horrors pulled from myth and war—an army empowered by Rasputin’s ritual to claim Baba Yaga’s throne
                </p>
                <p className="italic pt-2">
                  The veil between worlds is thin here. Every step deeper into the base brings stranger powers and darker truths—if Rasputin completes his ritual, the Witch Queen’s reign ends, and a new tyrant rises in her place.
                </p>
              </div>
            </div>
            
          <div className="mx-auto relative group w-full lg:w-[900px] h-[700px] overflow-hidden rounded-lg">
            {/* This is the element that scales */}
            <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 will-change-transform">
              <Image
                src="/images/winter/Traxus.jpg"
                alt="Map of Traxus, our current realm of adventure."
                fill
                className="object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20 rounded-lg pointer-events-none"></div>
            </div>

            {/* Caption stays fixed on top */}
            <div className="absolute bottom-0 left-4 right-4 z-10">
              <p className="text-white font-semibold text-lg drop-shadow-lg">
                The Frozen Realm of Traxus
              </p>
              <p className="text-blue-200 text-sm drop-shadow-lg">
                Where our heroes face a winter of centuries.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <aside className="flex flex-wrap justify-center items-center gap-20 px-40 py-6 border-t border-slate-600/30 shadow-inner">
        <a
          href="https://www.aonprd.com/"
          className="flex-1 min-w-[250px] max-w-[400px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/winter/official-rules-link.jpg"
            alt="Link to Gestalt characters rules"
            width={400}
            height={250}
            className="w-full h-auto rounded-lg"
          />
        </a>

        <a
          href="https://www.d20pfsrd.com/extras/community-creations/fgf-houserules/vcg-gestalt-multiclassing/"
          className="flex-1 min-w-[250px] max-w-[400px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/winter/gestalt-link.jpg"
            alt="Gestalt Multiclassing rules"
            width={400}
            height={250}
            className="w-full h-auto rounded-lg"
          />
        </a>

        <a
          href="https://www.sortekanin.com/collection/items/"
          className="flex-1 min-w-[250px] max-w-[400px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/winter/SorteKanin_link.jpg"
            alt="SorteKanin Treasure Database"
            width={400}
            height={250}
            className="w-full h-auto rounded-lg"
          />
        </a>

        <a href="/regent" className="flex-1 min-w-[250px] max-w-[400px]">
          <Image
            src="/images/winter/jade-regent-link.jpg"
            alt="Our last adventure"
            width={400}
            height={250}
            className="w-full h-auto rounded-lg"
          />
        </a>

        <a
          href="/shackles"
          className="flex-1 min-w-[250px] max-w-[400px]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/winter/shackles-link.jpg"
            alt="Ship Combat rules"
            width={400}
            height={250}
            className="w-full h-auto rounded-lg"
          />
        </a>
      </aside>


      {/* The Party Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-6 leading-tight pb-1">
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
              {loadingStory ? 'Loading our most recent adventure...' : 'A glimpse into our most recent adventure...'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-600/30 p-8 lg:p-12 shadow-2xl">
            {loadingStory ? (
              // Loading state
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="text-slate-400">Conjuring our latest tale...</span>
                </div>
              </div>
            ) : latestStory ? (
              // Latest story display
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Adventure excerpt text */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-200 mb-2">
                        {getStoryTitle(latestStory)}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-400">
                          {new Date(latestStory.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-cyan-400 font-medium">
                          {getBookTitle(latestStory.book)}
                        </span>
                      </div>
                    </div>
                    
                    {/* "New" badge for recent stories (within 30 days) */}
                    {new Date().getTime() - new Date(latestStory.date).getTime() < 30 * 24 * 60 * 60 * 1000 && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg animate-pulse">
                          ✨ Fresh Tale
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-slate-300 leading-relaxed mb-6 text-lg">
                      {getStoryExcerpt(latestStory)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link href={`/adventure-log/${latestStory.book}?highlight=${latestStory.book}-${latestStory.date}-${latestStory.slug}`}>
                      <button className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/25 hover:scale-105">
                        <span className="flex items-center">
                          Read This Adventure
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </button>
                    </Link>
                    
                    <Link href="/adventure-log">
                      <button className="group px-6 py-3 bg-slate-700/60 backdrop-blur-sm border border-slate-500/50 text-slate-200 rounded-lg hover:bg-slate-600/60 hover:border-blue-400/50 transition-all duration-300 font-medium">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Browse All Adventures
                        </span>
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Adventure image */}
                <div className="flex-shrink-0">
                  <div className="relative w-full lg:w-80 aspect-[4/5] group">
                    <Image
                      src={latestStory.coverUrl || "/images/winter/baba_yaga_hero.jpg"}
                      alt={`Scene from ${getStoryTitle(latestStory)}`}
                      fill
                      className="object-cover rounded-lg shadow-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20 rounded-lg"></div>
                    
                    {/* Magical sparkle overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      <div className="absolute bottom-8 left-6 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/3 left-4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // No story found state
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">The Chronicles Await</h3>
                <p className="text-slate-400 mb-6">Our latest adventures are being penned... Check back soon for fresh tales from the frozen realms!</p>
                <Link href="/adventure-log">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium">
                    Explore Past Adventures
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action & Miniature Gallery Section */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Call to Action */}
            <div className="text-center lg:text-left">
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-blue-400/30 p-8 lg:p-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-blue-200 mb-6">
                  Join Our Winter&apos;s Tale
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Step into our world of adventure, friendship, and epic storytelling. Three decades of memories await your discovery.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  <Link href="/adventure-log">
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

            {/* Miniature Gallery */}
            <div>
              <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
                  Tabletop Chronicles
                </h3>
                <p className="text-slate-400">
                  Witness our adventures come to life through painted miniatures and epic battle scenes
                </p>
              </div>
              
              <MiniatureGallery />
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
};

export default PathSixHomepage;