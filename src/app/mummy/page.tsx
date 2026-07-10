'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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

// ── Theme: "The Threshold" — night sky, burnt-ember sunset, sandstone gold, ─────
//    and a glowing teal portal as the single otherworldly accent.

const TH = {
  night:    '#0a0b0d',              // sky black, top of hero / page bg
  dusk:     '#1c140d',              // warm near-black, section bg
  duskAlt:  '#241a10',              // slightly lighter warm black, alt section bg
  card:     '#2a2015',              // carved-stone card surface
  cardLine: '#4a3a24',              // card hairline
  stone:    '#d9c39a',              // sandstone / heading color
  ink:      '#e7dcc3',              // body text, warm bone
  inkSoft:  '#a89878',              // muted body text
  ember:    '#e8791f',              // burnt orange sun
  amber:    '#f0a83c',              // warm gold torchlight
  gold:     '#c9a15b',              // rule lines, mono labels
  teal:     '#2be0c9',             // the glowing portal — sole otherworldly accent
  tealDeep: '#0f8f82',
  tealDim:  'rgba(43,224,201,0.16)',
};

// ── Typography ────────────────────────────────────────────────────────────────

const F = {
  display: {
    fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
    letterSpacing: '0.06em',
    fontWeight: 600,
  } as React.CSSProperties,
  body: {
    fontFamily: "'Spectral', Georgia, serif",
  } as React.CSSProperties,
  mono: {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    fontSize: 11,
  } as React.CSSProperties,
};

// ── CSS keyframes + Google Fonts ──────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&family=Spectral:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

  @keyframes mm-mote {
    0%   { transform: translate(0, 0); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translate(var(--drift, 0), -120vh); opacity: 0; }
  }
  @keyframes mm-ember {
    0%   { transform: translate(0, 0); opacity: 0; }
    8%   { opacity: 1; }
    100% { transform: translate(var(--drift, 0), -90vh); opacity: 0; }
  }

  /* Honor reduced-motion: park the ambient particles off-screen, no animation. */
  @media (prefers-reduced-motion: reduce) {
    .mm-particle { animation: none !important; opacity: 0 !important; }
  }
`;

// ── Ambient effects ───────────────────────────────────────────────────────────
// Drifting teal motes — the portal's light finding its way out into the world.

function PortalMotes({ count = 26, intensity = 1 }: { count?: number; intensity?: number }) {
  // Generate on the client only — Math.random() during render would produce
  // different values on server vs. client and break hydration.
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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {motes.map((m, i) => (
        <span
          key={i}
          className="mm-particle"
          style={{
            position: 'absolute', left: `${m.left}%`, bottom: -10,
            width: m.size, height: m.size, borderRadius: '50%',
            background: TH.teal,
            boxShadow: `0 0 8px ${TH.teal}, 0 0 16px ${TH.tealDeep}`,
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
  // Client-only generation — see note in PortalMotes.
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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="mm-particle"
          style={{
            position: 'absolute', left: `${s.left}%`, bottom: -12,
            width: s.size, height: s.size, borderRadius: '50%',
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

function Placeholder({
  label, bg = '#332615', stripe = '#241a0e', ink = TH.inkSoft, aspect, style = {},
}: {
  label: string; bg?: string; stripe?: string; ink?: string;
  aspect?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      position: 'relative', aspectRatio: aspect,
      background: `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe} 14px 15px)`,
      color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
      fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      textAlign: 'center', padding: 16, overflow: 'hidden', ...style,
    }}>
      <span style={{ opacity: 0.7, position: 'relative', zIndex: 2 }}>{label}</span>
    </div>
  );
}

function SectionEyebrow({ children, color = TH.gold }: { children: React.ReactNode; color?: string }) {
  return <div style={{ ...F.mono, color, marginBottom: 10 }}>{children}</div>;
}

// ── Hero — the actual photo, dark gradient, monumental title ───────────────────

function Hero({ intensity }: { intensity: number }) {
  return (
    <div style={{ position: 'relative', height: '92vh', minHeight: 620, overflow: 'hidden', background: TH.night }}>
      <Image
        src="/mummy-hero.jpg"
        alt="Four adventurers approach a temple gate glowing teal at dusk"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: '60% 50%' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,6,4,0.96) 0%, rgba(10,8,6,0.55) 40%, rgba(10,8,6,0.15) 65%, rgba(6,8,10,0.35) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 78% 58%, ${TH.tealDim} 0%, transparent 34%)` }} />
      <PortalMotes intensity={intensity} count={22} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 64px 72px', zIndex: 3 }}>
        <SectionEyebrow color={TH.amber}>Pathfinder · Book I · Osirion</SectionEyebrow>
        <h1 style={{ ...F.display, fontSize: 116, lineHeight: 0.93, margin: 0, color: TH.stone, textShadow: '0 6px 0 #000, 0 18px 40px rgba(0,0,0,0.6)' }}>
          MUMMY&apos;S<br />MASK
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22, flexWrap: 'wrap' }}>
          <div style={{ ...F.display, fontSize: 17, color: TH.night, background: TH.teal, padding: '8px 18px', letterSpacing: '0.14em', boxShadow: `0 0 24px ${TH.tealDeep}` }}>
            FOUR ARE NAMED · ONE TOMB OPENS
          </div>
          <div style={{ width: 40, height: 1, background: TH.gold, opacity: 0.6 }} />
          <div style={{ ...F.mono, color: TH.inkSoft }}>Wati · The Half-City</div>
        </div>
      </div>
    </div>
  );
}

// ── Flavor ────────────────────────────────────────────────────────────────────

function Flavor() {
  return (
    <section style={{ padding: '64px 64px 56px', background: TH.dusk, borderBottom: `1px solid ${TH.cardLine}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 44, alignItems: 'start' }}>
        <div>
          <SectionEyebrow>Dispatch I</SectionEyebrow>
          <h2 style={{ ...F.display, fontSize: 54, margin: 0, color: TH.stone, lineHeight: 1.02 }}>
            FOUR<br />THOUSAND<br />YEARS
          </h2>
          <div style={{ ...F.display, fontSize: 19, color: TH.teal, marginTop: 14 }}>
            of waiting · ends tonight
          </div>
        </div>
        <div style={{ borderLeft: `3px solid ${TH.teal}`, paddingLeft: 28, ...F.body }}>
          <p style={{ fontSize: 19, lineHeight: 1.8, color: TH.ink, margin: '0 0 16px' }}>
            The Ruby Prince has unsealed the Necropolis of Wati. By his decree, the priests of Pharasma
            have drawn names from the urn — and the right to enter one tomb has been granted. Beyond its
            doors, something waits that does not answer to torchlight alone.
          </p>
          <p style={{ fontSize: 17, fontStyle: 'italic', color: TH.amber, margin: 0 }}>
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
    <section style={{ padding: '64px 64px 56px', background: TH.duskAlt, borderBottom: `1px solid ${TH.cardLine}` }}>
      <SectionEyebrow>The Lottery&apos;s Names</SectionEyebrow>
      <h2 style={{ ...F.display, fontSize: 50, margin: '0 0 28px', color: TH.stone }}>THE FOUR</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        {PARTY.map((p, i) => (
          <div
            key={p.name}
            onClick={() => setFlipped(flipped === i ? null : i)}
            style={{
              cursor: 'pointer',
              background: TH.card,
              border: `1px solid ${TH.cardLine}`,
              padding: 14,
              transform: flipped === i ? 'translateY(-8px)' : 'none',
              boxShadow: flipped === i ? `0 18px 32px rgba(0,0,0,0.5), 0 0 0 1px ${TH.teal}60` : '0 8px 18px rgba(0,0,0,0.35)',
              transition: 'all .3s',
            }}
          >
            <Placeholder label={`portrait · ${p.name}`} bg="#332615" stripe="#241a0e" ink={TH.inkSoft} aspect="3 / 4" />
            <div style={{ ...F.mono, color: TH.teal, marginTop: 10, fontSize: 10 }}>
              Drawn the {['First', 'Second', 'Third', 'Fourth'][i]}
            </div>
            <div style={{ ...F.display, fontSize: 22, color: TH.stone, lineHeight: 1.1, marginTop: 6 }}>
              {p.name.toUpperCase()}
            </div>
            <div style={{ ...F.display, fontSize: 16, color: TH.ink, marginTop: 4, fontWeight: 500 }}>
              {p.role}
            </div>
            {flipped === i && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${TH.cardLine}`, fontSize: 14, fontStyle: 'italic', color: TH.ink, ...F.body }}>
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
    <section style={{ padding: '64px 64px 56px', background: TH.dusk, borderBottom: `1px solid ${TH.cardLine}` }}>
      <SectionEyebrow>Field Map · Osirion North</SectionEyebrow>
      <h2 style={{ ...F.display, fontSize: 50, margin: '0 0 28px', color: TH.stone }}>THE LIE OF THE LAND</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 28 }}>
        <div style={{ position: 'relative', aspectRatio: '16 / 11', background: `radial-gradient(ellipse at 30% 40%, ${TH.duskAlt} 0%, ${TH.night} 100%)`, border: `1px solid ${TH.cardLine}`, overflow: 'hidden' }}>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
            <path d="M10,30 Q40,20 70,30 T100,28" fill="none" stroke={TH.gold} strokeWidth="0.2" />
            <path d="M5,40 Q35,28 65,38 T100,38" fill="none" stroke={TH.gold} strokeWidth="0.2" />
            <path d="M0,48 Q30,38 60,46 T100,46" fill="none" stroke={TH.gold} strokeWidth="0.2" />
            <polygon points="14,32 18,26 22,32" fill={TH.ember} opacity="0.5" />
            <polygon points="56,38 62,30 68,38" fill={TH.ember} opacity="0.5" />
          </svg>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M30,55 Q50,42 78,22" fill="none" stroke={TH.teal} strokeWidth="0.6" strokeDasharray="2 1.5" opacity="0.8" />
          </svg>
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onMouseEnter={() => setActive(h.id)}
              onMouseLeave={() => setActive(null)}
              style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%,-50%)', background: 'transparent', border: 0, cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <span style={{ width: 15, height: 15, borderRadius: '50%', background: TH.teal, border: `3px solid ${TH.night}`, boxShadow: active === h.id ? `0 0 0 7px ${TH.tealDim}, 0 0 14px ${TH.teal}` : `0 0 8px ${TH.teal}`, transition: 'box-shadow .25s' }} />
              <span style={{ ...F.display, fontSize: 13, color: TH.night, background: TH.stone, padding: '2px 10px', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                {h.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {HOTSPOTS.map((h) => (
            <div
              key={h.id}
              onMouseEnter={() => setActive(h.id)}
              onMouseLeave={() => setActive(null)}
              style={{ padding: '14px 18px', background: active === h.id ? TH.card : 'transparent', border: `1px solid ${TH.cardLine}`, transform: active === h.id ? 'translateX(4px)' : 'none', transition: 'all .2s' }}
            >
              <div style={{ ...F.display, fontSize: 21, color: TH.stone }}>{h.label.toUpperCase()}</div>
              <div style={{ fontSize: 14, color: TH.inkSoft, fontStyle: 'italic', marginTop: 2, ...F.body }}>{h.note}</div>
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
    <section style={{ position: 'relative', padding: '80px 64px 110px', background: 'radial-gradient(ellipse at 78% 60%, #12312c 0%, #0a0f0e 45%, #05070a 100%)', borderBottom: `1px solid ${TH.cardLine}`, overflow: 'hidden', minHeight: 600 }}>
      <PortalMotes intensity={intensity * 1.4} count={34} />
      <Embers count={16} intensity={intensity * 0.5} />
      <div style={{ position: 'relative', zIndex: 3 }}>
        <SectionEyebrow color={TH.teal}>Session I — The Doors Give Way</SectionEyebrow>
        <h2 style={{ ...F.display, fontSize: 78, margin: '0 0 20px', color: TH.teal, lineHeight: 0.95, textShadow: `0 0 40px ${TH.tealDeep}, 0 5px 0 #020403` }}>
          THE THRESHOLD OPENS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, alignItems: 'start' }}>
          <Placeholder label="opening scene · the door swings inward" bg="rgba(0,0,0,0.45)" stripe="rgba(0,0,0,0.6)" ink={TH.teal} aspect="16 / 10" style={{ border: `2px solid ${TH.teal}` }} />
          <div style={{ fontSize: 18, lineHeight: 1.75, color: '#cdeae4', ...F.body }}>
            <p style={{ margin: '0 0 14px' }}>
              The great doors ground open on hinges no living hand had touched, and the dark beyond
              them was not dark at all — it breathed a cold green-blue light up out of the depths, over
              the carved feet of gods, into the last color of the sunset.
            </p>
            <p style={{ margin: 0, color: TH.teal, fontStyle: 'italic' }}>
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
    <section style={{ padding: '64px 64px 56px', background: TH.duskAlt, borderBottom: `1px solid ${TH.cardLine}` }}>
      <SectionEyebrow>Adventure Log · Latest Dispatch</SectionEyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 28, background: TH.card, border: `1px solid ${TH.cardLine}`, padding: 28, boxShadow: '10px 10px 0 rgba(0,0,0,0.35)' }}>
        <Placeholder label="entry plate" bg="#332615" stripe="#241a0e" ink={TH.inkSoft} aspect="4 / 5" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...F.mono, color: TH.teal }}>{LOG_TEASER.session} · {LOG_TEASER.date}</div>
          <h3 style={{ ...F.display, fontSize: 38, margin: '8px 0 12px', color: TH.stone, lineHeight: 1.05 }}>
            {LOG_TEASER.title.toUpperCase()}
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: TH.ink, fontStyle: 'italic', margin: 0, ...F.body }}>
            {LOG_TEASER.excerpt}
          </p>
          <div style={{ flex: 1 }} />
          <div style={{ marginTop: 24 }}>
            <a href="#" style={{ ...F.display, fontSize: 18, color: TH.night, background: TH.teal, padding: '8px 18px', textDecoration: 'none', letterSpacing: '0.1em', display: 'inline-block', boxShadow: `0 0 20px ${TH.tealDeep}` }}>
              READ THE FULL CHRONICLE →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────

const GALLERY_SPANS = [
  { col: 'span 3', row: 'span 3' },
  { col: 'span 2', row: 'span 2' },
  { col: 'span 1', row: 'span 2' },
  { col: 'span 3', row: 'span 2' },
  { col: 'span 3', row: 'span 2' },
];

function Gallery() {
  return (
    <section style={{ padding: '64px 64px 56px', background: TH.dusk, borderBottom: `1px solid ${TH.cardLine}` }}>
      <SectionEyebrow>Photo Plates · Field Records</SectionEyebrow>
      <h2 style={{ ...F.display, fontSize: 50, margin: '0 0 24px', color: TH.stone }}>FROM THE EXPEDITION</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridAutoRows: 100, gap: 12 }}>
        {GALLERY_ITEMS.map((g, i) => (
          <div key={g.id} style={{ gridColumn: GALLERY_SPANS[i].col, gridRow: GALLERY_SPANS[i].row, background: TH.card, padding: 6, border: `1px solid ${TH.cardLine}` }}>
            <Placeholder label={g.label} bg="#332615" stripe="#241a0e" ink={TH.inkSoft} style={{ width: '100%', height: '100%' }} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <section style={{ padding: '44px 64px 60px', textAlign: 'center', background: TH.night }}>
      <div style={{ ...F.display, fontSize: 26, color: TH.stone, letterSpacing: '0.2em' }}>
        PATHSIX · MUMMY&apos;S MASK
      </div>
      <div style={{ ...F.mono, color: TH.inkSoft, marginTop: 10 }}>
        A Pathfinder Adventure Path by Paizo Inc · Chronicled since MMXXIII
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MummyPage() {
  // Handoff recommends full-density ("Lively") ambient effects as a fixed
  // decision; reduced-motion users get them parked via the CSS above.
  const intensity = 1;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ ...F.body, color: TH.ink, background: TH.dusk, minHeight: '100vh' }}>
        <Hero intensity={intensity} />
        <Flavor />
        <Party />
        <Map />
        <Moment intensity={intensity} />
        <Log />
        <Gallery />
        <Footer />
      </div>
    </>
  );
}
