'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/mummy/Header';
import Footer from '@/components/mummy/Footer';

// ── Data ──────────────────────────────────────────────────────────────────────
// Character names are explicit placeholders — swap for real party names.

const PARTY = [
  { name: 'Character One',   role: 'Cleric of Pharasma',    tagline: 'Keeper of the final ledger.' },
  { name: 'Character Two',   role: 'Magus of Nethys',       tagline: 'Steel and sigil in equal measure.' },
  { name: 'Character Three', role: 'Hunter of the Wastes',  tagline: 'Reads the dunes like a scroll.' },
  { name: 'Character Four',  role: 'Inquisitor of Anubis',  tagline: 'Where she walks, the dead answer.' },
];

const HOTSPOTS = [
  { id: 'wati',   x: 32, y: 58, label: 'Wati',            note: 'The Half-City. Half necropolis, half living.' },
  { id: 'tomb',   x: 64, y: 38, label: 'The Sealed Tomb', note: 'Sponsored to your party by the Voices of the Spire.' },
  { id: 'sothis', x: 78, y: 22, label: 'Sothis',          note: 'Capital of Osirion. The Ruby Prince watches.' },
  { id: 'sphinx', x: 18, y: 30, label: 'The Sphinx',       note: 'Carved before the gods learned their names.' },
];

const LOG_TEASER = {
  title:   'The Lottery of the Dead',
  session: 'Session I — The Half-City',
  date:    'Pharast 14, 4715 AR',
  excerpt: 'The High Priestess of Pharasma drew our names from the urn. The crowd in the Grand Mausoleum fell silent — not from awe, but from pity. Whatever lay sealed in the Tomb of Akhentepi had not been disturbed in three thousand years, and the priestess would not tell us why.',
};

const GALLERY_ITEMS = [
  { id: 1, label: 'Wati at dusk' },
  { id: 2, label: 'Mask fragment, glazed faience' },
  { id: 3, label: 'Field sketch — Tomb entrance' },
  { id: 4, label: 'The Half-City bazaar' },
  { id: 5, label: 'Hieroglyph rubbing' },
];

const GALLERY_SPANS = [
  { col: 'span 3', row: 'span 3' },
  { col: 'span 2', row: 'span 2' },
  { col: 'span 1', row: 'span 2' },
  { col: 'span 3', row: 'span 2' },
  { col: 'span 3', row: 'span 2' },
];

// ── Reusable class fragments ──────────────────────────────────────────────────
// Colors/fonts live as Tailwind theme tokens (see globals.css @theme).

const DISPLAY = 'font-cinzel font-semibold tracking-[0.06em]';       // Cinzel 600
const MONO = 'font-plex uppercase tracking-[0.18em] text-[11px]';    // IBM Plex Mono label
// Fluid section padding — gutter 64px→20px, verticals shrink on small screens.
const SECTION = 'px-[clamp(20px,6vw,64px)] pt-[clamp(44px,7vw,64px)] pb-[clamp(40px,6vw,56px)] border-b border-mm-cardline';

// ── Ambient effects ───────────────────────────────────────────────────────────
// Drifting teal motes — the portal's light finding its way out into the world.
// Generated on the client only; Math.random() during render would break hydration.

function PortalMotes({ count = 26, intensity = 1 }: { count?: number; intensity?: number }) {
  const [motes, setMotes] = useState<Array<{ left: number; delay: number; duration: number; size: number; drift: number }>>([]);
  useEffect(() => {
    setMotes(
      Array.from({ length: Math.floor(count * intensity) }).map(() => ({
        left:     Math.random() * 100,
        delay:    -Math.random() * 16,
        duration: 10 + Math.random() * 14,
        size:     1.5 + Math.random() * 3,
        drift:    (Math.random() - 0.5) * 40,
      }))
    );
  }, [count, intensity]);
  if (!intensity) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {motes.map((m, i) => (
        <span
          key={i}
          className="mm-particle absolute rounded-full bg-mm-teal shadow-[0_0_8px_#2be0c9,0_0_16px_#0f8f82]"
          style={{
            left: `${m.left}%`, bottom: -10, width: m.size, height: m.size,
            animation: `mm-mote ${m.duration}s linear ${m.delay}s infinite`,
            '--drift': `${m.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// Embers — rising warm sparks, used sparingly in the cinematic moment.
function Embers({ count = 24, intensity = 1 }: { count?: number; intensity?: number }) {
  const [sparks, setSparks] = useState<Array<{ left: number; delay: number; duration: number; size: number; hue: number; drift: number }>>([]);
  useEffect(() => {
    setSparks(
      Array.from({ length: Math.floor(count * intensity) }).map(() => ({
        left:     Math.random() * 100,
        delay:    -Math.random() * 12,
        duration: 7 + Math.random() * 9,
        size:     1.2 + Math.random() * 2.4,
        hue:      18 + Math.random() * 24,
        drift:    (Math.random() - 0.5) * 50,
      }))
    );
  }, [count, intensity]);
  if (!intensity) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {sparks.map((s, i) => (
        <span
          key={i}
          className="mm-particle absolute rounded-full"
          style={{
            left: `${s.left}%`, bottom: -12, width: s.size, height: s.size,
            background: `hsl(${s.hue}, 90%, 60%)`,
            boxShadow: `0 0 6px hsl(${s.hue}, 95%, 55%), 0 0 14px hsl(${s.hue + 6}, 90%, 50%)`,
            animation: `mm-ember ${s.duration}s ease-out ${s.delay}s infinite`,
            '--drift': `${s.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Shared bits ───────────────────────────────────────────────────────────────
// Striped placeholder standing in for art the user will supply later.
// The diagonal-stripe gradient is parameterized, so it stays an inline style.

function Placeholder({
  label, bg = '#332615', stripe = '#241a0e', ink = '#a89878', aspect, style = {},
}: {
  label: string; bg?: string; stripe?: string; ink?: string;
  aspect?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden text-center p-4 font-plex uppercase text-[11px] tracking-[0.12em]"
      style={{
        aspectRatio: aspect, color: ink,
        background: `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe} 14px 15px)`,
        ...style,
      }}
    >
      <span className="relative z-[2] opacity-70">{label}</span>
    </div>
  );
}

function SectionEyebrow({ children, className = 'text-mm-gold' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${MONO} mb-2.5 ${className}`}>{children}</div>;
}

// ── Hero — the actual photo, dark gradient, monumental title ───────────────────

function Hero({ intensity }: { intensity: number }) {
  return (
    <div className="relative h-[92vh] min-h-[620px] overflow-hidden bg-mm-night">
      <Image
        src="/mummy-hero.jpg"
        alt="Four adventurers approach a temple gate glowing teal at dusk"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: '60% 50%' }}
      />
      {/* Dark bottom-up gradient + teal portal glow (multi-stop → inline). */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(8,6,4,0.96) 0%, rgba(10,8,6,0.55) 40%, rgba(10,8,6,0.15) 65%, rgba(6,8,10,0.35) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 78% 58%, rgba(43,224,201,0.16) 0%, transparent 34%)' }} />
      <PortalMotes intensity={intensity} count={22} />
      <div className="absolute inset-0 z-[3] flex flex-col justify-end px-[clamp(20px,6vw,64px)] pb-[clamp(48px,8vw,72px)]">
        <SectionEyebrow className="text-mm-amber">Our Next Adventure: Coming Spring 2027</SectionEyebrow>
        <h1 className={`${DISPLAY} m-0 text-mm-stone text-[clamp(52px,14vw,116px)] leading-[0.93]`} style={{ textShadow: '0 6px 0 #000, 0 18px 40px rgba(0,0,0,0.6)' }}>
          MUMMY&apos;S<br />MASK
        </h1>
        <div className="mt-[22px] flex flex-wrap items-center gap-[14px]">
          <div className={`${DISPLAY} text-[17px] text-mm-night bg-mm-teal px-[18px] py-2 tracking-[0.14em] shadow-[0_0_24px_#0f8f82]`}>
            FOUR ARE NAMED · ONE TOMB OPENS
          </div>
          <div className="w-10 h-px bg-mm-gold opacity-60" />
          <div className={`${MONO} text-mm-ink-soft`}>Wati · The Half-City</div>
        </div>
      </div>
    </div>
  );
}

// ── Flavor ────────────────────────────────────────────────────────────────────

function Flavor() {
  return (
    <section className={`${SECTION} bg-mm-dusk`}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 md:gap-11 items-start">
        <div>
          <SectionEyebrow>Dispatch I</SectionEyebrow>
          <h2 className={`${DISPLAY} m-0 text-mm-stone text-[clamp(34px,7vw,54px)] leading-[1.02]`}>
            FOUR<br />THOUSAND<br />YEARS
          </h2>
          <div className={`${DISPLAY} text-[19px] text-mm-teal mt-[14px]`}>
            of waiting · ends tonight
          </div>
        </div>
        <div className="border-l-[3px] border-mm-teal pl-7">
          <p className="text-[19px] leading-[1.8] text-mm-ink mt-0 mb-4">
            The Ruby Prince has unsealed the Necropolis of Wati. By his decree, the priests of Pharasma
            have drawn names from the urn — and the right to enter one tomb has been granted. Beyond its
            doors, something waits that does not answer to torchlight alone.
          </p>
          <p className="text-[17px] italic text-mm-amber m-0">
            Travelers are advised: the dead of Osirion do not stay where they are put.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Party ─────────────────────────────────────────────────────────────────────

function Party() {
  const [flipped, setFlipped] = useState<number | null>(null);
  return (
    <section id="party" className={`${SECTION} bg-mm-dusk-alt scroll-mt-20`}>
      <SectionEyebrow>The Lottery&apos;s Names</SectionEyebrow>
      <h2 className={`${DISPLAY} text-mm-stone text-[clamp(32px,6.5vw,50px)] mt-0 mb-7`}>THE FOUR</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
        {PARTY.map((p, i) => (
          <div
            key={p.name}
            onClick={() => setFlipped(flipped === i ? null : i)}
            className={`cursor-pointer bg-mm-card border border-mm-cardline p-[14px] transition-all duration-300 ${flipped === i ? '-translate-y-2' : ''}`}
            style={{ boxShadow: flipped === i ? '0 18px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(43,224,201,0.38)' : '0 8px 18px rgba(0,0,0,0.35)' }}
          >
            <Placeholder label={`portrait · ${p.name}`} aspect="3 / 4" />
            <div className={`${MONO} text-mm-teal mt-2.5 text-[10px]`}>
              Drawn the {['First', 'Second', 'Third', 'Fourth'][i]}
            </div>
            <div className={`${DISPLAY} text-[22px] text-mm-stone leading-[1.1] mt-1.5`}>
              {p.name.toUpperCase()}
            </div>
            <div className="font-cinzel tracking-[0.06em] font-medium text-[16px] text-mm-ink mt-1">
              {p.role}
            </div>
            {flipped === i && (
              <div className="mt-2.5 pt-2.5 border-t border-dashed border-mm-cardline text-[14px] italic text-mm-ink">
                &ldquo;{p.tagline}&rdquo;
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Map — glowing teal cartograph, like light spilling from the doorway ────────

function Map() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section id="map" className={`${SECTION} bg-mm-dusk scroll-mt-20`}>
      <SectionEyebrow>Field Map · Osirion North</SectionEyebrow>
      <h2 className={`${DISPLAY} text-mm-stone text-[clamp(32px,6.5vw,50px)] mt-0 mb-7`}>THE LIE OF THE LAND</h2>
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-7">
        <div className="relative aspect-[16/11] border border-mm-cardline overflow-hidden" style={{ background: 'radial-gradient(ellipse at 30% 40%, #241a10 0%, #0a0b0d 100%)' }}>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-50">
            <path d="M10,30 Q40,20 70,30 T100,28" fill="none" stroke="#c9a15b" strokeWidth="0.2" />
            <path d="M5,40 Q35,28 65,38 T100,38" fill="none" stroke="#c9a15b" strokeWidth="0.2" />
            <path d="M0,48 Q30,38 60,46 T100,46" fill="none" stroke="#c9a15b" strokeWidth="0.2" />
            <polygon points="14,32 18,26 22,32" fill="#e8791f" opacity="0.5" />
            <polygon points="56,38 62,30 68,38" fill="#e8791f" opacity="0.5" />
          </svg>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M30,55 Q50,42 78,22" fill="none" stroke="#2be0c9" strokeWidth="0.6" strokeDasharray="2 1.5" opacity="0.8" />
          </svg>
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onMouseEnter={() => setActive(h.id)}
              onMouseLeave={() => setActive(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer p-0 flex flex-col items-center gap-1.5"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <span
                className="w-[15px] h-[15px] rounded-full bg-mm-teal border-[3px] border-mm-night transition-shadow duration-200"
                style={{ boxShadow: active === h.id ? '0 0 0 7px rgba(43,224,201,0.16), 0 0 14px #2be0c9' : '0 0 8px #2be0c9' }}
              />
              <span className={`${DISPLAY} text-[13px] text-mm-night bg-mm-stone px-2.5 py-0.5 tracking-[0.1em] whitespace-nowrap`}>
                {h.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {HOTSPOTS.map((h) => (
            <div
              key={h.id}
              onMouseEnter={() => setActive(h.id)}
              onMouseLeave={() => setActive(null)}
              className={`px-[18px] py-3.5 border border-mm-cardline transition-all duration-200 ${active === h.id ? 'bg-mm-card translate-x-1' : ''}`}
            >
              <div className={`${DISPLAY} text-[21px] text-mm-stone`}>{h.label.toUpperCase()}</div>
              <div className="text-[14px] text-mm-ink-soft italic mt-0.5">{h.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Cinematic moment — the doorway's teal light breaking loose ─────────────────

function Moment({ intensity }: { intensity: number }) {
  return (
    <section
      id="moment"
      className="relative overflow-hidden border-b border-mm-cardline min-h-[600px] scroll-mt-20 px-[clamp(20px,6vw,64px)] pt-[clamp(56px,9vw,80px)] pb-[clamp(72px,11vw,110px)]"
      style={{ background: 'radial-gradient(ellipse at 78% 60%, #12312c 0%, #0a0f0e 45%, #05070a 100%)' }}
    >
      <PortalMotes intensity={intensity * 1.4} count={34} />
      <Embers count={16} intensity={intensity * 0.5} />
      <div className="relative z-[3]">
        <SectionEyebrow className="text-mm-teal">Session I — The Doors Give Way</SectionEyebrow>
        <h2 className={`${DISPLAY} text-mm-teal text-[clamp(40px,10vw,78px)] leading-[0.95] mt-0 mb-5`} style={{ textShadow: '0 0 40px #0f8f82, 0 5px 0 #020403' }}>
          THE THRESHOLD OPENS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 md:gap-9 items-start">
          <Placeholder label="opening scene · the door swings inward" bg="rgba(0,0,0,0.45)" stripe="rgba(0,0,0,0.6)" ink="#2be0c9" aspect="16 / 10" style={{ border: '2px solid #2be0c9' }} />
          <div className="text-[18px] leading-[1.75]" style={{ color: '#cdeae4' }}>
            <p className="mt-0 mb-3.5">
              The great doors ground open on hinges no living hand had touched, and the dark beyond
              them was not dark at all — it breathed a cold green-blue light up out of the depths, over
              the carved feet of gods, into the last color of the sunset.
            </p>
            <p className="m-0 text-mm-teal italic">
              None of us stepped back. All of us wanted to know what waited behind that light.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Adventure Log ─────────────────────────────────────────────────────────────

function Log() {
  return (
    <section id="log" className={`${SECTION} bg-mm-dusk-alt scroll-mt-20`}>
      <SectionEyebrow>Adventure Log · Latest Dispatch</SectionEyebrow>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-7 bg-mm-card border border-mm-cardline p-7 shadow-[10px_10px_0_rgba(0,0,0,0.35)]">
        <Placeholder label="entry plate" aspect="4 / 5" />
        <div className="flex flex-col">
          <div className={`${MONO} text-mm-teal`}>{LOG_TEASER.session} · {LOG_TEASER.date}</div>
          <h3 className={`${DISPLAY} text-[clamp(28px,6vw,38px)] text-mm-stone leading-[1.05] mt-2 mb-3`}>
            {LOG_TEASER.title.toUpperCase()}
          </h3>
          <p className="text-[17px] leading-[1.7] text-mm-ink italic m-0">
            {LOG_TEASER.excerpt}
          </p>
          <div className="flex-1" />
          <div className="mt-6">
            <a href="#" className={`${DISPLAY} text-[18px] text-mm-night bg-mm-teal px-[18px] py-2 no-underline tracking-[0.1em] inline-block shadow-[0_0_20px_#0f8f82]`}>
              READ THE FULL CHRONICLE →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────

function Gallery() {
  return (
    <section id="gallery" className={`${SECTION} bg-mm-dusk scroll-mt-20`}>
      <SectionEyebrow>Photo Plates · Field Records</SectionEyebrow>
      <h2 className={`${DISPLAY} text-mm-stone text-[clamp(32px,6.5vw,50px)] mt-0 mb-6`}>FROM THE EXPEDITION</h2>
      <div className="grid grid-cols-6 gap-3" style={{ gridAutoRows: 'clamp(58px,13vw,100px)' }}>
        {GALLERY_ITEMS.map((g, i) => (
          <div
            key={g.id}
            className="bg-mm-card p-1.5 border border-mm-cardline"
            style={{ gridColumn: GALLERY_SPANS[i].col, gridRow: GALLERY_SPANS[i].row }}
          >
            <Placeholder label={g.label} style={{ width: '100%', height: '100%' }} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MummyPage() {
  // Full-density ("Lively") ambient effects, per the design handoff;
  // reduced-motion users get them parked via CSS in globals.css.
  const intensity = 1;
  return (
    <>
      <Header />
      <Hero intensity={intensity} />
      <Flavor />
      <Party />
      <Map />
      <Moment intensity={intensity} />
      <Log />
      <Gallery />
      <Footer />
    </>
  );
}
