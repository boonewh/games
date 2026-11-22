'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/wrath/Header";
import HeroBackground from "@/components/wrath/HeroBackground";
import Footer from "@/components/wrath/Footer";
import WrathMiniatureGallery from "@/components/wrath/MiniatureGallery";
import { StoryEntry } from "@/types/story";
import { blockText } from "@/lib/story-blocks";
import { storyDate } from "@/lib/story-date";

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
  if (heading && 'content' in heading) {
    const text = blockText((heading as { content?: unknown }).content);
    if (text) return text;
  }
  return story.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getStoryExcerpt(story: StoryEntry, limit = 350): string {
  for (const b of story.story) {
    if (b.type === 'paragraph' && 'content' in b) {
      const text = blockText((b as { content?: unknown }).content).trim();
      if (text.length > 50) {
        return text.length > limit ? text.substring(0, limit) + '...' : text;
      }
    }
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
      <header className="relative h-screen w-full flex items-center justify-center overflow-hidden border-b-2 border-wotr-gold">
        <HeroBackground />
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

        {/* THE VANGUARD (CHARACTERS) */}
        <section className="mb-32">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-10">
            <h2 className="font-cinzel text-2xl text-wotr-gold uppercase tracking-widest">The Vanguard</h2>
            {/* LEVEL + MYTHIC TIER — KEEP IN SYNC with the Campaign Arc Status milestone footer further down this page.
                As of Session 29 all four PCs share one tier again (Level 12, Mythic 5), so it lives here.
                Tiers are granted per character by personal quest: if they DIVERGE again, move the tier onto each
                card below as `tier` (with a "Mythic Tier" line under the classes) and show a RANGE in the footer. */}
            <span className="text-xs uppercase tracking-widest text-zinc-500">Level 12 Gestalt · Mythic 5</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Caleth', classes: 'Paladin / Wizard',   src: '/images/wrath/caleth1.jpg', sheet: 'caleth.pdf' },
              { name: 'Nageru', classes: 'Monk / Paladin',     src: '/images/wrath/nageru3.jpg', sheet: 'nageru.pdf' },
              { name: 'Thane',  classes: 'Inquisitor / Rogue', src: '/images/wrath/thane1.jpg',   sheet: 'thane.pdf' },
              { name: 'Korroc', classes: 'Paladin / Oracle',   src: '/images/wrath/korroc1.jpg',  sheet: 'korroc.pdf' },
            ].map((character) => (
              <div key={character.name} className="group bg-stone-light/40 border border-zinc-800 hover:border-wardstone-blue transition-all duration-500 p-4">
                <div className="relative aspect-[3/4] bg-black mb-6 overflow-hidden border border-zinc-800">
                  <Image
                    src={character.src}
                    alt={character.name}
                    fill
                    className="object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  {/* Character sheet link overlay */}
                  <Link
                    href={`/api/vault/proxy?file=${character.sheet}`}
                    target="_blank"
                    className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 border border-wotr-gold/60 text-wotr-gold font-cinzel text-xs uppercase tracking-widest hover:bg-wotr-gold/10 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Character Sheet
                    </span>
                  </Link>
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
            <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] mt-2">Intelligence Report: The Marchlands</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 text-wardstone-blue"><span className="w-2 h-2 rounded-full bg-wardstone-blue animate-pulse"></span> Crusader Held</span>
            <span className="flex items-center gap-2 text-red-600"><span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Demon Held</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* 1. THE MAP - With "Corruption" Hover Effect */}
          <div className="lg:col-span-4 relative group cursor-crosshair">
            {/* Decorative Border/Frame */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-wotr-gold/20 via-transparent to-wardstone-blue/20 rounded-sm blur-sm"></div>

            <div className="relative bg-black border border-zinc-800 overflow-hidden shadow-2xl aspect-[3/2]">
              {/* The Base Map (Image 1) */}
              <Image
                src="/images/wrath/worldwound-map3-1.jpg"
                alt="The Marchlands — map of the country around Citadel Drezen, showing the Temple of Irori, Vilareth Ford, Eagle Rock, Wintersun Hall, Delamere's Tomb, Keeper's Canyon, the Chapel of Shelyn and the Molten Scar"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1024px"
                priority
              />

              {/* FLOATING HOTSPOT (Citadel Drezen) */}
              <div className="absolute top-[18.7%] left-[60%] group/pin">
                <div className="w-4 h-4 bg-wardstone-blue rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-wardstone-blue rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 border border-wardstone-blue p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-wardstone-blue text-base">Citadel Drezen</h4>
                  <p className="text-sm text-zinc-400 italic">Held. The thing that wore the wizard&apos;s face for two months is in the strongest cell under the citadel, gray and featureless, and nobody is allowed to talk to it. The Queen came, and left again within the week — west, with the knights.</p>
                </div>
              </div>

              {/* FLOATING HOTSPOT (Temple of Irori) */}
              <div className="absolute top-[29%] left-[44.5%] group/pin">
                <div className="w-4 h-4 bg-wardstone-blue rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-wardstone-blue rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 border border-wardstone-blue p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-wardstone-blue text-base">Temple of Irori</h4>
                  <p className="text-sm text-zinc-400 italic">A lost house of Irori that put itself back together when the last cultist fell. Its ghostly keepers are gone, and a handful of pilgrims from the crusade camps tend it now. The knights rested here a night, then walked west for a week after a voice in a dream.</p>
                </div>
              </div>

              {/* FLOATING HOTSPOT (Delamere’s Tomb) */}
              <div className="absolute top-[49.5%] left-[60%] group/pin">
                <div className="w-4 h-4 bg-wardstone-blue rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-wardstone-blue rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 border border-wardstone-blue p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-wardstone-blue text-base">Delamere’s Tomb</h4>
                  <p className="text-sm text-zinc-400 italic">The heretic still lies in her crystal with her grave goods untouched. Then, on an ordinary evening in Drezen, four crusaders saw that crystal melt away at the same instant. Nobody knows what it meant. Nobody has gone back.</p>
                </div>
              </div>

              {/* FLOATING HOTSPOT (Eagle Rock) */}
              <div className="absolute top-[52%] left-[74%] group/pin">
                <div className="w-4 h-4 bg-wardstone-blue rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-wardstone-blue rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/90 border border-wardstone-blue p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-wardstone-blue text-base">Eagle Rock</h4>
                  <p className="text-sm text-zinc-400 italic">The only place along the escarpment a wagon can climb, which makes it the only western road. Reported to have demons living in it. Scouted, and nothing found — a thing that flies leaves nothing on the ground to read.</p>
                </div>
              </div>

              {/* FLOATING HOTSPOT (Vilareth Ford) */}
              <div className="absolute top-[57.7%] left-[84.5%] group/pin">
                <div className="w-4 h-4 bg-wardstone-blue rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-wardstone-blue rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/90 border border-wardstone-blue p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-wardstone-blue text-base">Vilareth Ford</h4>
                  <p className="text-sm text-zinc-400 italic">The supply road’s gate, and quiet for the first time in months. The clan that raided it now camps beside it and takes whatever work it is given, under a leader who answers to a dwarf.</p>
                </div>
              </div>

              {/* FLOATING HOTSPOT (Wintersun Hall) */}
              <div className="absolute top-[69%] left-[67.5%] group/pin">
                <div className="w-4 h-4 bg-wardstone-blue rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-wardstone-blue rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/90 border border-wardstone-blue p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-wardstone-blue text-base">Wintersun Hall</h4>
                  <p className="text-sm text-zinc-400 italic">Empty. A windowless stone hall whose chieftain is ash outside the door, and whose people have gone east to the Ford.</p>
                </div>
              </div>

              {/* FLOATING HOTSPOT (The Molten Scar — low in the frame, so the tooltip is anchored bottom-0 and opens UPWARD. Any pin below ~70% needs this or the frame's overflow-hidden clips it.) */}
              <div className="absolute top-[87%] left-[42%] group/pin">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-ping absolute inset-0"></div>
                <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white relative z-10"></div>
                <div className="absolute left-6 bottom-0 bg-black/90 border border-red-600 p-2 w-48 opacity-0 group-hover/pin:opacity-100 transition-opacity z-20 pointer-events-none">
                  <h4 className="font-cinzel text-red-600 text-base">The Molten Scar</h4>
                  <p className="text-sm text-zinc-400 italic">A river of lava, four days from Drezen on foot. The Templars were holding prisoners in a cavern above it, and there was an Abyssal rift burning at the far end of that cavern at midday which was simply gone by dark.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SIDEBAR - "Intelligence Briefing" */}
          <div className="lg:col-span-1 flex flex-col justify-center space-y-8">
            <div>
              <h4 className="font-cinzel text-wotr-gold text-base tracking-widest mb-2 border-b border-wotr-gold/20 pb-1">Citadel Drezen</h4>
              <p className="text-base text-zinc-400 leading-relaxed">
                The impostor is caught. It never left. A scrying found it walking the lower town in the face of one of the knights, leading the wizard and the demon out of the gate toward a bounty. It is a mercenary, it says, and very good at what it does. Then the Queen rode in with a few dozen paladins and two copper plates, and rode out again two hundred and forty miles west.
              </p>
            </div>

            <div className="p-4 bg-red-950/10 border border-red-900/30">
              <h4 className="font-cinzel text-red-500 text-sm tracking-[0.2em] mb-2 uppercase">Commander&apos;s Note</h4>
              <p className="text-base text-red-200/60 leading-tight">
                &quot;The monk carried it up the hill on his own shoulder, wearing his own face, and set it down on my floor. I have commanded soldiers a long time and I have never before had to ask which of two men in front of me was the real one. Then the Queen took all four of them west, the wizard and the demon besides, and left me a fortress and a thing in a cell that smiles when you ask it how it fooled us.&quot;
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
            <div className="w-full max-w-[26rem] text-center px-4">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-wardstone-blue to-transparent mb-4"></div>
              <p className="font-cinzel text-2xl md:text-4xl text-wardstone-blue drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] tracking-wider uppercase">
                The Worldwound
              </p>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-wardstone-blue to-transparent mt-4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSITION: Worldwound to Abyss - The Void Fracture */}
      <section className="relative w-full min-h-[720px] overflow-hidden">

        {/* 1. THE VOID GRADIENT (Purple -> Black -> Red) */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-black to-red-950"></div>


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

        {/* 4. KENABRES IS BURNING — Title + Image */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-6 py-10 px-4">
          <div className="text-center">
            <h3 className="font-cinzel text-xl md:text-3xl tracking-[0.8em] uppercase text-white abyssal-glow">
              Kenabres is <span className="text-red-600">Burning</span>
            </h3>
          </div>
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative aspect-video border border-red-900/50 overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.2)]">
              <Image
                src="/images/wrath/fight-over-kenabres.jpg"
                alt="The fall of Kenabres"
                fill
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>
            </div>
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

      {/* CAMPAIGN ARC STATUS — REPLACE-NOT-APPEND each session. See wrath-story-book/memory/webpage-session-section.md for the design pattern and update process. */}
      <section className="w-full bg-black border-t border-b border-zinc-900 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">

          {/* Session Header */}
          <div className="mb-14">
            <p className="text-xs uppercase tracking-[0.4em] text-abyssal-red font-cinzel mb-3">Session XXXI — The Midnight Fane</p>
            <h2 className="font-cinzel text-3xl md:text-4xl text-wotr-gold tracking-tight mb-5">The Face I Wear</h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-wotr-gold/40"></div>
              <div className="w-1.5 h-1.5 bg-wotr-gold rotate-45 flex-shrink-0"></div>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-wotr-gold/40"></div>
            </div>
            <p className="text-zinc-400 font-spectral italic leading-relaxed max-w-2xl mx-auto text-base">
              The impostor never left Drezen. A scrying found it walking the lower town in a borrowed
              face — one of the knights&apos; own — with the wizard and the demon beside it, on their way to a
              bounty. It is in a cell now, and it says it is a mercenary, and that it is good at what it
              does. Then the Queen came north with two plates of copper and an errand: close the rift
              that carries the enemy&apos;s crystals into this world, with the four of them as the power
              behind the ritual, and someone standing on the Abyss side of it when it shuts. Two hundred
              and forty miles west, past a hill that is not where it appears to be, they walked in through
              the front doors of{" "}
              <span className="text-zinc-300">the Midnight Fane</span>{" "}
              and were told they were expected.
            </p>
          </div>

          {/* Terendelev — Fallen Guardian */}
          <div className="border border-zinc-800 bg-zinc-950 p-6 mb-14 max-w-lg mx-auto">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 font-cinzel mb-2">Fallen Guardian</p>
            <h3 className="font-cinzel text-lg text-zinc-300 mb-0.5">Terendelev</h3>
            <p className="text-zinc-600 text-xs font-spectral italic mb-4">Silver Dragon · Protector of Kenabres</p>
            <div className="h-px w-full bg-zinc-800 mb-4"></div>
            <p className="text-zinc-500 text-sm font-spectral italic leading-relaxed">
              &ldquo;For most of a century she walked Kenabres as a plain woman in gray traveling
              clothes, and the city did not know what it had. She bought bread. She stood in crowds. The
              only people who ever learned the truth learned it in the half-second before she died for
              them. There are men in this company who have started to flinch at the thought of a face
              that is not what it looks like — and the first one of those any of them ever met was hers,
              and she was better than she looked, not worse.&rdquo;
            </p>
          </div>

          {/* Party Contribution Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              {
                name: "Caleth",
                classes: "Paladin / Wizard",
                role: "The One Who Read the Plates",
                contribution: "He spent an hour over a basin until his face went gray, and when the water showed him the impostor he folded the four of them across the town without asking. He asked the questions in the cell, and when the thing smiled about how it had beaten every test, he spat on the floor and walked out. Then the Queen laid two copper plates in front of him, written in half a dozen tongues that change from line to line, and he knew every one of them. The scholars of the south had managed three.",
              },
              {
                name: "Nageru",
                classes: "Monk / Paladin",
                role: "The One Who Fought Himself",
                contribution: "He looked into the water and saw his own face walking down a street. Then he was standing in front of it: one blow missed, two held back at the last instant, and he carried himself up through the gate on his shoulder while the town stopped to stare. His order to the guards was never to speak to it, whatever face it wore. Before the Queen he vouched for the demon in a single sentence and stopped there — and of bargaining with a demon lord he said only that a promise will hold if it serves her.",
              },
              {
                name: "Thane",
                classes: "Inquisitor / Rogue",
                role: "The One Who Asked How They Get Back",
                contribution: "His Abyssal broke the dead master’s cipher, with a scholar and a wizard on either side of him. He traded a pile of Sanctum loot for a hole you can fold up and keep in your belt, and was very pleased with himself until he was told what happens if you put it in the wrong bag. When the Queen’s advisor explained that someone must hold a plate on the far side of a rift that closes behind them, he asked the only question in the room: and how does that someone get back? Then he pushed open the Fane’s front doors as if he belonged there.",
              },
              {
                name: "Korroc",
                classes: "Paladin / Oracle",
                role: "The One Who Struck Exactly Hard Enough",
                contribution: "He took his axe back off the commander’s wall and swore he would not leave it hanging again. Then he stood over the thing that had walked past his paladin’s sight for two months and hit it three times — each blow measured, each stopping short of what that hammer can do — and afterward stood a long moment looking at nothing. He argued it into the cell that blocks all magic. And on the cold hillside outside the Fane, when the axe would not stop talking about the demon thirty feet away, he dropped it into Thane’s portable hole for some peace.",
              },
            ].map((c) => (
              <div key={c.name} className="border border-zinc-800 bg-zinc-950/60 p-6 text-center flex flex-col">
                <p className="text-xs uppercase tracking-[0.3em] text-wotr-gold font-cinzel mb-1">{c.role}</p>
                <h3 className="font-cinzel text-lg text-parchment mb-0.5">{c.name}</h3>
                <p className="text-xs text-zinc-600 font-spectral italic mb-4">{c.classes}</p>
                <p className="text-sm text-zinc-400 font-spectral leading-relaxed flex-1">{c.contribution}</p>
              </div>
            ))}
          </div>

          {/* Milestone: current status */}
          <div className="border border-wotr-gold/30 bg-wotr-gold/5 p-8 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.4em] text-wotr-gold/50 font-cinzel mb-3">Current Status</p>
            <h3 className="font-cinzel text-xl text-wotr-gold mb-1">Inside the Midnight Fane</h3>
            <p className="text-zinc-500 text-xs font-spectral italic mb-5">The impostor caged · The Queen&apos;s errand · An audience with no name</p>
            <p className="text-zinc-400 font-spectral text-sm leading-relaxed mb-6">
              The Queen waits in a fold of ground a mile out, her paladins wearing the enemy&apos;s marks.
              The four knights and the demon who led them here went in under the hill, past a statue that
              hails the Locust Lord and a giant with a pick, and an incubus bowed and offered them an
              audience with the mistress of the place. They followed him above a floor where crystals are
              packed for the road like eggs, into a room where elixirs are brewed — and there, in the armor
              of Iomedae, a woman turned to face them wearing the face of a paladin{" "}
              <span className="text-zinc-300">dead for decades</span>.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs font-cinzel uppercase tracking-widest pt-4 border-t border-wotr-gold/20">
              <span className="text-zinc-600">Book <span className="text-wotr-gold">4</span> of 6</span>
              <span className="text-zinc-800">|</span>
              {/* Single party tier (Session 29: all four Mythic 5) — matches the Vanguard header. Keep in sync; show a range if tiers diverge. */}
              <span className="text-zinc-600">Mythic Tier <span className="text-wotr-gold">5</span></span>
              <span className="text-zinc-800">|</span>
              <span className="text-zinc-600">Level <span className="text-wotr-gold">12</span></span>
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
                          {storyDate(latestStory.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
