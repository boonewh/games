'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/wrath/Header";
import Footer from "@/components/wrath/Footer";
import WrathMiniatureGallery from "@/components/wrath/MiniatureGallery";
import { StoryEntry } from "@/types/story";

const WRATH_BOOKS: Record<string, string> = {
  'the-worldwound-incursion': 'The Worldwound Incursion',
  'sword-of-valor': 'Sword of Valor',
  'demon-s-heresy': "Demon's Heresy",
  'the-midnight-isles': 'The Midnight Isles',
  'herald-of-the-ivory-labyrinth': 'Herald of the Ivory Labyrinth',
  'city-of-locusts': 'City of Locusts',
};

function getStoryTitle(story: StoryEntry): string {
  const heading = story.story.find(b => b.type === 'heading');
  if (heading && 'content' in heading && typeof heading.content === 'string') return heading.content;
  return story.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getStoryExcerpt(story: StoryEntry, limit = 350): string {
  const para = story.story.find(b =>
    b.type === 'paragraph' && 'content' in b && typeof b.content === 'string' && b.content.trim().length > 50
  );
  if (para && 'content' in para && typeof para.content === 'string') {
    const text = para.content.trim();
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
  return 'The chronicle of the Fifth Crusade awaits its first entry...';
}

export default function WrathPage() {
  const [latestStory, setLatestStory] = useState<StoryEntry | null>(null);
  const [loadingStory, setLoadingStory] = useState(true);

  type SeamData = { left: string; duration: string; delay: string; width: string; background: string };
  type MoteData = { top: string; left: string; color: string; animation: string; delay: string };
  const [seams, setSeams] = useState<SeamData[] | null>(null);
  const [motes, setMotes] = useState<MoteData[] | null>(null);

  useEffect(() => {
    setSeams([...Array(10)].map((_, i) => ({
      left: `${(i * 10) + (Math.random() * 5)}%`,
      duration: `${8 + Math.random() * 7}s`,
      delay: `${i * -1.5}s`,
      width: i % 3 === 0 ? '1px' : '2px',
      background: i % 2 === 0
        ? 'linear-gradient(to bottom, transparent, #a855f7, transparent)'
        : 'linear-gradient(to bottom, transparent, #ef4444, transparent)',
    })));
    setMotes([...Array(15)].map((_, i) => {
      const moveRight = Math.random() > 0.5;
      return {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        color: i % 2 === 0 ? '#a855f7' : '#ef4444',
        animation: `voidMoteFloat${moveRight ? 'Right' : 'Left'} ${6 + Math.random() * 6}s infinite linear`,
        delay: `${Math.random() * 6}s`,
      };
    }));
  }, []);

  useEffect(() => {
    fetch('/api/stories?campaign=wrath&limit=1')
      .then(r => r.ok ? r.json() : [])
      .then(stories => { if (stories?.length) setLatestStory(stories[0]); })
      .catch(() => {})
      .finally(() => setLoadingStory(false));
  }, []);

  return (
    <>
      <Header />

      {/* HERO SECTION */}
      <header className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden border-b-2 border-wotr-gold">
        {/* Main Crusader/Wardstone Image */}
        <Image
          src="/images/wrath/wrath-hero.jpg"
          alt="The Fifth Crusade"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-dark/0 via-stone-dark/40 to-stone-dark"></div>

        <div className="relative z-10 text-center px-4">
          <h1 className="font-cinzel text-5xl md:text-8xl text-wotr-gold drop-shadow-[0_0_15px_rgba(0,0,0,1)] tracking-tighter">
            WRATH <span className="text-white">OF THE</span> RIGHTEOUS
          </h1>
          {/* The Glowing Wardstone Divider */}
          <div className="h-0.5 w-64 bg-wardstone-blue mx-auto my-6 shadow-[0_0_15px_#00d4ff]"></div>
          <p className="font-cinzel text-xl md:text-2xl tracking-[0.3em] uppercase text-parchment/80">
            The Fifth Crusade
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">

        {/* INTRO NARRATIVE */}
        <section className="max-w-3xl mx-auto text-center mb-24">
          <h2 className="font-cinzel text-3xl text-wotr-gold mb-6 uppercase tracking-widest">The Worldwound Incursion</h2>
          <p className="text-lg leading-relaxed italic opacity-90">
            For over a century, the demon-haunted wasteland of the Worldwound has bled into the world of mortals.
            As the magical Wardstones that hold back the tide begin to flicker and fail, a new generation of
            crusaders must take up the sword. But this war requires more than steel; it requires the power of Myths.
          </p>
        </section>

        {/* THE VANGUARD (CHARACTER PLACEHOLDERS) */}
        <section className="mb-32">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-10">
            <h2 className="font-cinzel text-2xl text-wotr-gold uppercase tracking-widest">The Vanguard</h2>
            <span className="text-xs uppercase tracking-widest text-zinc-500">Level 1 Gestalt • Mythic Tier 0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Caleth', classes: 'Paladin / Wizard',   src: '/images/wrath/Caleth.jpg' },
              { name: 'Nageru', classes: 'Monk / Paladin',     src: '/images/wrath/nageru.jpg' },
              { name: 'Thane',  classes: 'Inquisitor / Rogue', src: '/images/wrath/Thane.jpg' },
              { name: 'Korroc', classes: 'Paladin / Oracle',   src: '/images/wrath/Korroc.jpg' },
            ].map((character) => (
              <div key={character.name} className="group bg-stone-light/40 border border-zinc-800 hover:border-wardstone-blue transition-all duration-500 p-4">
                <div className="relative aspect-[3/4] bg-black mb-6 overflow-hidden border border-zinc-800">
                  <Image
                    src={character.src}
                    alt={character.name}
                    fill
                    className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-cinzel text-lg text-parchment uppercase tracking-widest">{character.name}</h3>
                  <p className="text-xs text-zinc-500 font-spectral italic mt-1">{character.classes}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* STRATEGIC MAP SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 mb-32">
        
        {/* Header with 'Intelligence' vibe */}
        <div className="flex flex-col md:flex-row items-baseline justify-between border-b border-zinc-800 pb-4 mb-8">
          <div>
            <h2 className="font-cinzel text-3xl text-wotr-gold uppercase tracking-widest">Theater of War</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] mt-2">Intelligence Report: Fifth Crusade Geographic Survey</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 text-wardstone-blue"><span className="w-2 h-2 rounded-full bg-wardstone-blue animate-pulse"></span> Safe Zone</span>
            <span className="flex items-center gap-2 text-red-600"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Abyssal Encroachment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* 1. THE MAP - With "Corruption" Hover Effect */}
          <div className="lg:col-span-4 relative group cursor-crosshair">
            {/* Decorative Border/Frame */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-wotr-gold/20 via-transparent to-wardstone-blue/20 rounded-sm blur-sm"></div>

            <div className="relative bg-black border border-zinc-800 overflow-hidden shadow-2xl aspect-[16/10]">
              {/* The Base Map (Image 1) */}
              <Image
                src="/images/wrath/mendev-map2.jpg"
                alt="Map of Mendev"
                fill
                className="object-cover"
              />

              {/* FLOATING HOTSPOTS (Example: Kenabres) */}
              <div className="absolute top-[47%] left-[51%] group/pin">
                <div className="w-4 h-4 bg-wardstone-blue rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-wardstone-blue rounded-full border-2 border-white relative z-10"></div>
                {/* Label that appears on hover */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 border border-wardstone-blue p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-wardstone-blue text-base">Kenabres</h4>
                  <p className="text-sm text-zinc-400 italic">The Shield of Mendev. Current location of the Wardstone.</p>
                </div>
              </div>

              {/* FLOATING HOTSPOT (Example: The Worldwound) */}
              <div className="absolute top-[49%] left-[21%] group/pin">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 border border-red-600 p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-red-600 text-base">Threshold</h4>
                  <p className="text-sm text-zinc-400 italic">The epicenter of the rift. Entry forbidden to all mortal souls.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SIDEBAR - "Intelligence Briefing" */}
          <div className="lg:col-span-1 flex flex-col justify-center space-y-8">
            <div>
              <h4 className="font-cinzel text-wotr-gold text-base tracking-widest mb-2 border-b border-wotr-gold/20 pb-1">Mendevian Borders</h4>
              <p className="text-base text-zinc-400 leading-relaxed">
                Stretching from the Lake of Mists and Veils to the Sarkoris Scar, Mendev stands as the final bulwark against the Abyss.
              </p>
            </div>

            <div>
              <h4 className="font-cinzel text-zinc-300 text-base tracking-widest mb-2 border-b border-zinc-800 pb-1">The Sellen River</h4>
              <p className="text-base text-zinc-500 leading-relaxed italic">
                A vital supply vein now choked by the filth of the Worldwound.
              </p>
            </div>

            <div className="p-4 bg-red-950/10 border border-red-900/30">
              <h4 className="font-cinzel text-red-500 text-sm tracking-[0.2em] mb-2 uppercase">Commander&apos;s Note</h4>
              <p className="text-base text-red-200/60 leading-tight">
                &quot;The geography changes as the rift exhales. Do not trust the old maps. The land itself is a lie.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORLDWOUND DIVIDER - Full Width Dramatic Break */}
      <section className="relative w-full border-t-2 border-b-2 border-wardstone-blue bg-black">
        <div className="relative w-full aspect-[21/9]">
          <Image
            src="/images/wrath/worldwound-rift.jpg"
            alt="The Worldwound - Divine Light vs Abyssal Rift"
            fill
            className="object-cover"
            priority
          />
          {/* Darkening overlay for text readability */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Optional centered text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="h-px w-96 bg-gradient-to-r from-transparent via-wardstone-blue to-transparent mb-4"></div>
              <p className="font-cinzel text-2xl md:text-4xl text-wardstone-blue drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] tracking-wider uppercase">
                The Worldwound
              </p>
              <div className="h-px w-96 bg-gradient-to-r from-transparent via-wardstone-blue to-transparent mt-4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSITION: Worldwound to Abyss - The Void Fracture */}
      <section className="relative w-full h-96 overflow-hidden">

        {/* 1. THE VOID GRADIENT (Purple -> Black -> Red) */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-black to-red-950"></div>

        {/* 2. ATMOSPHERIC SHADOWS (Deepens the "Black Middle" effect) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,1)_80%)]"></div>

        {/* 3. UNSTABLE ENERGY SEAMS (Thinner, Slower, Vanishing) */}
        <div className="absolute inset-0 flex justify-around items-center opacity-40">
          {seams?.map((s, i) => (
            <div
              key={i}
              className="energy-seam"
              style={{
                left: s.left,
                animationDuration: s.duration,
                animationDelay: s.delay,
                width: s.width,
                background: s.background,
              }}
            ></div>
          ))}
        </div>

        {/* 4. THE CENTER TEAR (Text Overlay with Heavy Glow) */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center px-4">
            <h3 className="font-cinzel text-xl md:text-3xl tracking-[0.8em] uppercase text-white abyssal-glow">
              Reality is <span className="text-red-600">Bleeding</span>
            </h3>
            {/* Secondary subtle light beam behind text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 bg-red-600/10 blur-[80px] rounded-full"></div>
          </div>
        </div>

        {/* 5. FLOATING VOID MOTES (Small floating particles) */}
        <div className="absolute inset-0 pointer-events-none">
          {motes?.map((m, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full opacity-30 blur-[0.5px]"
              style={{
                top: m.top,
                left: m.left,
                backgroundColor: m.color,
                animation: m.animation,
                animationDelay: m.delay,
              }}
            ></div>
          ))}
        </div>

        <style jsx>{`
          /* The "Abyssal Glow" - Multiple layers for a heavy, supernatural radiance */
          .abyssal-glow {
            text-shadow:
              0 0 10px rgba(255, 255, 255, 0.4),
              0 0 20px rgba(168, 85, 247, 0.6),
              0 0 40px rgba(239, 68, 68, 0.4),
              0 0 70px rgba(239, 68, 68, 0.2);
            animation: textPulse 6s infinite ease-in-out;
          }

          /* The Seams: Moves back and forth, scales up/down, and fades to 0 */
          .energy-seam {
            position: absolute;
            height: 100%;
            filter: blur(2px);
            opacity: 0;
            mix-blend-mode: screen;
            animation: seamGhost 12s infinite ease-in-out;
          }

          @keyframes seamGhost {
            0%, 100% {
              transform: translateX(0) scaleY(0.5);
              opacity: 0;
            }
            10%, 90% {
              opacity: 0;
            }
            30% {
              transform: translateX(-15px) scaleY(1.1);
              opacity: 0.5;
            }
            50% {
              transform: translateX(10px) scaleY(0.8);
              opacity: 0.2;
            }
            70% {
              transform: translateX(-5px) scaleY(1.3);
              opacity: 0.6;
            }
          }

          @keyframes textPulse {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); }
          }

          @keyframes voidMoteFloatRight {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 0;
            }
            20% { opacity: 0.3; }
            80% { opacity: 0.3; }
            100% {
              transform: translateY(-120px) translateX(30px) rotate(180deg);
              opacity: 0;
            }
          }

          @keyframes voidMoteFloatLeft {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 0;
            }
            20% { opacity: 0.3; }
            80% { opacity: 0.3; }
            100% {
              transform: translateY(-120px) translateX(-30px) rotate(-180deg);
              opacity: 0;
            }
          }
        `}</style>
      </section>

      {/* THREAT SECTION (VILLAIN CARD) - Full Width */}
      <section className="w-full bg-black border-t border-b border-abyssal-red">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-96 lg:h-auto overflow-hidden relative border border-abyssal-red">
              <Image
                src="/images/wrath/wrath3.jpg"
                alt="The Shadow of the Abyss"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="p-10 lg:p-16 flex flex-col justify-center border-l border-abyssal-red">
              <h2 className="font-cinzel text-3xl text-red-600 mb-6 tracking-tighter">The Shadow of the Abyss</h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                The storm of approaches. As the sky turns to ash, the heroes must confront the ultimate source of the corruption.
                {/*Deskari, Lord of the Locust Host, looks upon Kenabres with hunger.*/}
              </p>
              <div className="text-xs uppercase tracking-[.3em] text-abyssal-red font-bold">
                Warning: Mythic Threat Level
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FROM THE WAR CHRONICLE */}
      <section className="w-full bg-black border-t border-zinc-900 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-wotr-gold/40"></div>
              <h2 className="font-cinzel text-2xl text-wotr-gold tracking-[0.4em] uppercase">From the War Chronicle</h2>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-wotr-gold/40"></div>
            </div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-light font-spectral">
              {loadingStory ? 'Retrieving field report...' : 'The most recent dispatch from the front'}
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/60 p-8 lg:p-12">
            {loadingStory ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wotr-gold mr-3"></div>
                <span className="text-zinc-500 font-spectral">Summoning the chronicles...</span>
              </div>
            ) : latestStory ? (
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-cinzel text-xl text-parchment tracking-tight mb-2">{getStoryTitle(latestStory)}</h3>
                      <div className="flex items-center gap-4 text-xs uppercase tracking-widest">
                        <span className="text-zinc-500 font-spectral">
                          {new Date(latestStory.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="text-wotr-gold font-cinzel">
                          {WRATH_BOOKS[latestStory.book] ?? latestStory.book}
                        </span>
                      </div>
                    </div>
                    {new Date().getTime() - new Date(latestStory.date).getTime() < 30 * 24 * 60 * 60 * 1000 && (
                      <span className="flex-shrink-0 text-[10px] font-cinzel uppercase tracking-widest px-3 py-1 border border-wardstone-blue text-wardstone-blue">
                        New Dispatch
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-300 font-spectral leading-relaxed text-base mb-8 italic border-l-2 border-wotr-gold/30 pl-4">
                    {getStoryExcerpt(latestStory)}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={`/wrath/adventure-log/${latestStory.book}?entry=${latestStory.book}-${latestStory.date}-${latestStory.slug}`}>
                      <button className="group inline-flex items-center gap-2 px-6 py-2.5 bg-wotr-gold text-stone-dark font-cinzel text-sm uppercase tracking-widest hover:bg-wotr-gold/90 transition-colors duration-300">
                        Read Full Entry
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </Link>
                    <Link href="/wrath/adventure-log">
                      <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-zinc-700 hover:border-wotr-gold/50 text-zinc-400 hover:text-parchment font-cinzel text-sm uppercase tracking-widest transition-all duration-300">
                        Browse All Chronicles
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="flex-shrink-0 lg:w-72">
                  <div className="relative aspect-[4/5] border border-zinc-800 overflow-hidden group">
                    <Image
                      src={latestStory.coverUrl || "/images/wrath/wrath-hero.jpg"}
                      alt={`Scene from ${getStoryTitle(latestStory)}`}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-14 h-14 mx-auto mb-4 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="font-cinzel text-lg text-zinc-500 uppercase tracking-widest mb-2">The Chronicle Awaits Its First Entry</h3>
                <p className="text-zinc-600 font-spectral mb-6">The Fifth Crusade has begun — its stories will be written here.</p>
                <Link href="/wrath/adventure-log">
                  <button className="px-6 py-2.5 border border-wotr-gold/40 text-wotr-gold font-cinzel text-sm uppercase tracking-widest hover:bg-wotr-gold/10 transition-colors">
                    Open the Chronicle
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* IMAGE GALLERY SECTION - The Mythic Tapestry */}
      <section className="w-full bg-black pt-12 pb-32 px-6 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">

          {/* IMAGE GALLERY SECTION - The Mythic Tapestry */}
          <section className="w-full bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
              
              {/* Section Header */}
              <div className="mb-12 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-wotr-gold/40"></div>
                  <h2 className="font-cinzel text-2xl text-wotr-gold tracking-[0.4em] uppercase">
                    Visions of the Crusade
                  </h2>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-wotr-gold/40"></div>
                </div>
                <p className="text-zinc-500 text-xs uppercase tracking-widest font-light">
                  A visual record of the Worldwound and the souls caught in its wake
                </p>
              </div>

              <WrathMiniatureGallery />

              <div className="mt-6 flex justify-between items-center px-2">
                <span className="text-[10px] text-zinc-600 font-cinzel uppercase tracking-[0.2em]">Galleria V: The Worldwound</span>
                <div className="h-px flex-1 mx-8 bg-zinc-900"></div>
                <span className="text-[10px] text-zinc-600 font-cinzel uppercase tracking-[0.2em]">Artifacts of War</span>
              </div>

              {/* Final Page Sign-off before Footer */}
              <div className="mt-40 text-center">
                <div className="inline-block relative">
                  <h3 className="font-cinzel text-4xl md:text-6xl text-zinc-600 tracking-tighter transition-colors hover:text-zinc-400 cursor-default">
                      NOT ALL WHO FALL <span className="text-zinc-700">ARE LOST</span>
                  </h3>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent"></div>
                </div>
              </div>

            </div>
          </section>

          {/* Footer Link placeholder */}
          <div className="mt-32 text-center opacity-60 hover:opacity-100 transition-opacity">
              <p className="font-cinzel text-[10px] tracking-[1em] uppercase text-zinc-400">End of Record</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
