'use client';

import React, { useState, useMemo } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

const PARTY = [
  { name: 'Character One',   role: 'Cleric of Pharasma',   tagline: 'Keeper of the final ledger.' },
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

// ── Theme: C1 · Lapis & Sand ──────────────────────────────────────────────────

const T = {
  bg:               '#f3e3c4',
  bgAlt:            '#e8d6a4',
  paper:            '#fff8e4',
  ink:              '#2a2418',
  primary:          '#1f3b6e',
  secondary:        '#c08438',
  sky1:             '#a8c0d4',
  sky2:             '#e0c890',
  sky3:             '#d4a460',
  sky4:             '#b07840',
  duneFill:         '#7a4a18',
  sand:             '#d8b27a',
  titleColor:       '#fff8e4',
  titleShadow:      '0 4px 0 #1f3b6e, 0 8px 22px rgba(20,30,60,0.4)',
  bgImage:          'radial-gradient(ellipse at 50% 0%, rgba(255,230,180,0.7) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(31,59,110,0.16) 0%, transparent 60%)',
  momentBg:         'linear-gradient(180deg, #1a1208 0%, #0e0a05 60%, #050402 100%)',
  momentTitle:      '#ffd890',
  momentTitleShadow:'0 0 30px rgba(232,160,80,0.45), 0 5px 0 #2a1808',
  momentInk:        '#e0c890',
};

// Section backgrounds — "bands-lapis" rhythm: alternating bgAlt / transparent
const BG: Record<string, string> = {
  hero:    'transparent',
  flavor:  T.bgAlt,
  party:   'transparent',
  map:     T.bgAlt,
  log:     'transparent',
  gallery: T.bgAlt,
  footer:  'transparent',
};

// ── Typography ────────────────────────────────────────────────────────────────

const F = {
  display: {
    fontFamily: "'Cinzel', 'Cormorant Garamond', serif",
    letterSpacing: '0.08em',
    fontWeight: 600,
  } as React.CSSProperties,
  body: {
    fontFamily: "'Spectral', 'IM Fell English', Georgia, serif",
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
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Spectral:ital,wght@0,400;1,400&family=IBM+Plex+Mono&display=swap');

  @keyframes mm-mote {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.8; }
    100% { transform: translateY(-600px) translateX(var(--drift)); opacity: 0; }
  }
  @keyframes mm-ember {
    0%   { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-700px) translateX(var(--drift)) scale(0.3); opacity: 0; }
  }
  @keyframes mm-sand {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    10%  { opacity: 0.7; }
    100% { transform: translateY(100vh) translateX(var(--drift)); opacity: 0; }
  }
  @keyframes mm-shimmer {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50%       { transform: translateY(-4px); opacity: 0.7; }
  }
  @keyframes mm-flicker {
    0%, 100% { opacity: 0.7; transform: scale(1) translateX(-50%); }
    50%       { opacity: 1;   transform: scale(1.05) translateX(-47.6%); }
  }
`;

// ── Shared components ─────────────────────────────────────────────────────────

function Placeholder({
  label, bg = T.sky2, stripe = T.sky3, ink = T.ink, aspect, style = {},
}: {
  label: string; bg?: string; stripe?: string; ink?: string;
  aspect?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      position: 'relative', aspectRatio: aspect,
      background: `repeating-linear-gradient(135deg, ${bg} 0 14px, ${stripe} 14px 15px)`,
      color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      textAlign: 'center', padding: 16, overflow: 'hidden', ...style,
    }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
    </div>
  );
}

function HeatShimmer({ intensity = 1 }: { intensity?: number }) {
  if (!intensity) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
      background: 'repeating-linear-gradient(180deg, rgba(255,200,140,0) 0, rgba(255,200,140,0.04) 2px, rgba(255,200,140,0) 4px)',
      animation: 'mm-shimmer 6s ease-in-out infinite',
      opacity: 0.5 * intensity,
      mixBlendMode: 'screen',
    }} />
  );
}

function SandDrift({ intensity = 1, accent = T.sand }: { intensity?: number; accent?: string }) {
  const grains = useMemo(() =>
    Array.from({ length: Math.floor(40 * intensity) }).map(() => ({
      left:     Math.random() * 100,
      delay:    -Math.random() * 14,
      duration: 8 + Math.random() * 12,
      size:     1 + Math.random() * 2,
      drift:    60 + Math.random() * 120,
      startY:   -10 - Math.random() * 30,
    })),
  [intensity]);
  if (!intensity) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 90, zIndex: 2 }}>
        <path d="M0,120 L0,80 C 80,60 160,90 260,72 C 360,54 440,84 540,68 C 660,50 760,86 860,70 C 960,56 1060,84 1200,66 L1200,120 Z"
          fill={accent} opacity="0.85" />
        <path d="M0,120 L0,96 C 100,86 200,104 320,90 C 460,74 560,100 700,88 C 820,78 940,98 1080,86 C 1140,82 1180,88 1200,86 L1200,120 Z"
          fill={accent} opacity="0.55" />
      </svg>
      {grains.map((g, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${g.left}%`, top: `${g.startY}%`,
          width: g.size, height: g.size, borderRadius: '50%',
          background: accent, opacity: 0.7,
          animation: `mm-sand ${g.duration}s linear ${g.delay}s infinite`,
          '--drift': `${g.drift}px`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

function Embers({ count = 24, intensity = 1 }: { count?: number; intensity?: number }) {
  const sparks = useMemo(() =>
    Array.from({ length: Math.floor(count * intensity) }).map(() => ({
      left:     Math.random() * 100,
      delay:    -Math.random() * 12,
      duration: 7 + Math.random() * 9,
      size:     1.2 + Math.random() * 2.4,
      hue:      18 + Math.random() * 24,
      drift:    (Math.random() - 0.5) * 50,
    })),
  [count, intensity]);
  if (!intensity) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {sparks.map((s, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${s.left}%`, bottom: -12,
          width: s.size, height: s.size, borderRadius: '50%',
          background: `hsl(${s.hue}, 90%, 60%)`,
          boxShadow: `0 0 6px hsl(${s.hue}, 95%, 55%), 0 0 14px hsl(${s.hue + 6}, 90%, 50%)`,
          animation: `mm-ember ${s.duration}s ease-out ${s.delay}s infinite`,
          '--drift': `${s.drift}px`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

function GlyphBand({ color = T.secondary, height = 22, opacity = 0.7 }: {
  color?: string; height?: number; opacity?: number;
}) {
  const glyphs = ['▲', '◇', '○', '□', '△', '◆', '●', '—', '║', '╳'];
  return (
    <div style={{
      display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center',
      color, opacity, fontSize: height * 0.7, letterSpacing: '0.4em',
      userSelect: 'none', fontFamily: 'ui-monospace, monospace', padding: '16px 0',
    }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i}>{glyphs[i % glyphs.length]}</span>
      ))}
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <div style={{ position: 'relative', borderBottom: `1px solid ${T.primary}40`, overflow: 'hidden' }}>
      <div style={{
        height: 520, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(180deg, ${T.sky1} 0%, ${T.sky2} 55%, ${T.sky3} 80%, ${T.sky4} 100%)`,
      }}>
        {/* Sun disc */}
        <div style={{
          position: 'absolute', top: 80, right: 120, width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, #fff4d8 0%, #ffd890 50%, transparent 75%)', opacity: 0.85,
        }} />
        {/* Dune silhouettes */}
        <svg viewBox="0 0 1200 280" preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 280 }}>
          <polygon points="120,280 280,140 440,280" fill={T.secondary} opacity="0.6" />
          <polygon points="320,280 460,170 600,280" fill={T.secondary} opacity="0.7" />
          <polygon points="700,280 880,120 1060,280" fill={T.duneFill}  opacity="0.85" />
          <polygon points="900,280 1010,180 1120,280" fill={T.duneFill} opacity="0.95" />
        </svg>
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 100 }}>
          <path d="M0,100 L0,60 C 200,40 400,80 600,55 C 800,30 1000,70 1200,40 L1200,100 Z"
            fill={T.duneFill} />
        </svg>
        <HeatShimmer intensity={0.6} />
        <SandDrift intensity={0.5} accent={T.sand} />
        {/* Title block */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 64,
        }}>
          <div style={{ ...F.mono, color: T.primary, marginBottom: 6 }}>
            Pathfinder · Book I · Osirion
          </div>
          <h1 style={{
            ...F.display, fontSize: 108, lineHeight: 0.95, margin: 0,
            color: T.titleColor, textShadow: T.titleShadow,
          }}>
            MUMMY&apos;S<br />MASK
          </h1>
          <div style={{
            ...F.display, fontSize: 18, color: T.primary, marginTop: 14,
            background: 'rgba(255,248,228,0.78)', padding: '6px 16px',
            alignSelf: 'flex-start', border: `1px solid ${T.primary}`,
          }}>
            FOUR ARE NAMED · ONE TOMB OPENS
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Flavor ────────────────────────────────────────────────────────────────────

function Flavor() {
  return (
    <section style={{
      padding: '56px 64px 48px', position: 'relative', zIndex: 3,
      borderBottom: `1px solid ${T.primary}25`, background: BG.flavor,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 40, alignItems: 'start' }}>
        <div>
          <div style={{ ...F.mono, color: T.primary, marginBottom: 10 }}>Dispatch I</div>
          <h2 style={{ ...F.display, fontSize: 56, margin: 0, color: T.primary, lineHeight: 1.0 }}>
            FOUR<br />THOUSAND<br />YEARS
          </h2>
          <div style={{ ...F.display, fontSize: 20, color: T.ink, marginTop: 14 }}>
            of waiting · ends today
          </div>
        </div>
        <div style={{ borderLeft: `3px solid ${T.secondary}`, paddingLeft: 28, ...F.body }}>
          <p style={{ fontSize: 19, lineHeight: 1.75, color: T.ink, margin: '0 0 16px' }}>
            The Ruby Prince has unsealed the Necropolis of Wati. By his decree, the priests of Pharasma
            have drawn names from the urn — and the right to enter one tomb has been granted. Whatever
            you find inside is yours: gold, glass, glyph, or grave.
          </p>
          <p style={{ fontSize: 17, fontStyle: 'italic', color: T.primary, margin: 0 }}>
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
    <section style={{
      padding: '56px 64px 48px', position: 'relative', zIndex: 3,
      borderBottom: `1px solid ${T.primary}25`, background: BG.party,
    }}>
      <div style={{ ...F.mono, color: T.primary, marginBottom: 10 }}>The Lottery&apos;s Names</div>
      <h2 style={{ ...F.display, fontSize: 50, margin: '0 0 28px', color: T.primary, lineHeight: 1.0 }}>
        THE FOUR
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        {PARTY.map((p, i) => (
          <div
            key={p.name}
            onClick={() => setFlipped(flipped === i ? null : i)}
            style={{
              cursor: 'pointer',
              transform: flipped === i ? 'translateY(-8px) rotate(-0.5deg)' : 'rotate(-0.5deg)',
              transition: 'transform .35s',
            }}
          >
            <div style={{
              background: T.paper, border: `2px solid ${T.primary}`, padding: 14,
              boxShadow: flipped === i ? `0 16px 30px ${T.primary}40` : `6px 6px 0 ${T.primary}80`,
              transition: 'box-shadow .35s',
            }}>
              <Placeholder
                label={`portrait · ${p.name}`}
                bg={T.sky2} stripe={T.sky3} ink={T.ink} aspect="3 / 4"
              />
              <div style={{ ...F.mono, color: T.secondary, marginTop: 10, fontSize: 10 }}>
                Drawn the {['First', 'Second', 'Third', 'Fourth'][i]}
              </div>
              <div style={{ ...F.display, fontSize: 22, color: T.primary, lineHeight: 1.1, marginTop: 6 }}>
                {p.name.toUpperCase()}
              </div>
              <div style={{ ...F.display, fontSize: 16, color: T.ink, marginTop: 4, letterSpacing: '0.06em', fontWeight: 500 }}>
                {p.role}
              </div>
              {flipped === i && (
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.primary}`,
                  fontSize: 14, fontStyle: 'italic', color: T.ink, ...F.body,
                }}>
                  &ldquo;{p.tagline}&rdquo;
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Map (tomb variant for Lapis theme) ────────────────────────────────────────

const CHAMBERS = [
  { id: 'entry',    x: 12, y: 50, w: 12, h: 14, label: 'Antechamber' },
  { id: 'guardian', x: 30, y: 30, w: 16, h: 18, label: 'Guardian Hall' },
  { id: 'servants', x: 30, y: 56, w: 16, h: 16, label: "Servants' Pit" },
  { id: 'ritual',   x: 54, y: 22, w: 18, h: 18, label: 'Ritual Chamber' },
  { id: 'burial',   x: 60, y: 54, w: 22, h: 22, label: 'Burial Chamber' },
];

const TOMB_NOTES = [
  { id: 'entry',    label: 'Antechamber',    note: 'Cleared. Two pressure plates disarmed.' },
  { id: 'guardian', label: 'Guardian Hall',  note: 'Carved jackal-soldiers wait in alcoves.' },
  { id: 'ritual',   label: 'Ritual Chamber', note: 'Glyphs still wet — a thousand years no rain.' },
  { id: 'burial',   label: 'Burial Chamber', note: 'Sarcophagus sealed with seven gold cords.' },
];

const HOTSPOT_POSITIONS = [
  { x: 18, y: 57 }, { x: 38, y: 38 }, { x: 63, y: 30 }, { x: 71, y: 64 },
];

function TombMap({ active, setActive }: {
  active: string | null; setActive: (id: string | null) => void;
}) {
  return (
    <div style={{
      position: 'relative', aspectRatio: '16 / 11',
      background: T.sky3, border: `2px solid ${T.primary}`, overflow: 'hidden',
    }}>
      {/* Stone hatching */}
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 5} x2="100" y2={i * 5} stroke={T.primary} strokeWidth="0.15" />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 5} y1="0" x2={i * 5} y2="60" stroke={T.primary} strokeWidth="0.15" />
        ))}
      </svg>
      {/* Corridors + chambers */}
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <line x1="24" y1="57" x2="30" y2="50" stroke={T.primary} strokeWidth="1.5" />
        <line x1="46" y1="40" x2="54" y2="32" stroke={T.primary} strokeWidth="1.5" />
        <line x1="46" y1="64" x2="60" y2="60" stroke={T.primary} strokeWidth="1.5" />
        <line x1="62" y1="40" x2="68" y2="54" stroke={T.primary} strokeWidth="1.5" />
        {CHAMBERS.map((c) => (
          <rect key={c.id} x={c.x} y={c.y} width={c.w} height={c.h}
            fill={T.paper} stroke={T.primary} strokeWidth="0.6" />
        ))}
        {/* Sarcophagus */}
        <rect x="68" y="62" width="6" height="10" fill={T.secondary} stroke={T.primary} strokeWidth="0.4" />
      </svg>
      {/* Chamber labels */}
      {CHAMBERS.map((c) => (
        <div key={c.id} style={{
          position: 'absolute', left: `${c.x + c.w / 2}%`, top: `${c.y + c.h / 2}%`,
          transform: 'translate(-50%,-50%)', ...F.mono, color: T.ink,
          fontSize: 8, textAlign: 'center', pointerEvents: 'none',
        }}>
          {c.label}
        </div>
      ))}
      {/* Hotspot markers */}
      {HOTSPOTS.slice(0, 4).map((h, i) => (
        <button key={h.id}
          onMouseEnter={() => setActive(h.id)}
          onMouseLeave={() => setActive(null)}
          style={{
            position: 'absolute',
            left: `${HOTSPOT_POSITIONS[i].x}%`, top: `${HOTSPOT_POSITIONS[i].y}%`,
            transform: 'translate(-50%,-50%)',
            background: 'transparent', border: 0, cursor: 'pointer', padding: 0,
          }}>
          <span style={{
            display: 'block', width: 12, height: 12, borderRadius: '50%',
            background: T.primary, border: `2px solid ${T.paper}`,
            boxShadow: active === h.id ? `0 0 0 6px ${T.primary}40` : '0 2px 6px rgba(0,0,0,0.3)',
            transition: 'box-shadow .25s',
          }} />
        </button>
      ))}
    </div>
  );
}

function Map() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section style={{
      padding: '56px 64px 48px', position: 'relative', zIndex: 3,
      borderBottom: `1px solid ${T.primary}25`, background: BG.map,
    }}>
      <div style={{ ...F.mono, color: T.primary, marginBottom: 10 }}>
        Tomb Cartograph · Surveyed at the threshold
      </div>
      <h2 style={{ ...F.display, fontSize: 50, margin: '0 0 28px', color: T.primary, lineHeight: 1.0 }}>
        THE SEALED HALLS
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 28 }}>
        <TombMap active={active} setActive={setActive} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TOMB_NOTES.map((h) => (
            <div key={h.id}
              onMouseEnter={() => setActive(h.id)}
              onMouseLeave={() => setActive(null)}
              style={{
                padding: '14px 18px',
                background: active === h.id ? T.paper : 'transparent',
                border: `1.5px solid ${T.primary}`,
                transform: active === h.id ? 'translateX(4px)' : 'none',
                transition: 'all .2s',
              }}>
              <div style={{ ...F.display, fontSize: 22, color: T.primary, letterSpacing: '0.06em' }}>
                {h.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, color: T.ink, fontStyle: 'italic', marginTop: 2, ...F.body }}>
                {h.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Cinematic Moment: The First Torch ─────────────────────────────────────────

function Moment() {
  return (
    <section style={{
      position: 'relative', padding: '72px 64px 100px', overflow: 'hidden', minHeight: 600,
      background: T.momentBg, borderBottom: `1px solid ${T.primary}25`,
    }}>
      {/* Torch glow */}
      <div style={{
        position: 'absolute', left: '50%', bottom: -40,
        width: 600, height: 600, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(255,180,80,0.45) 0%, rgba(255,140,40,0.18) 30%, transparent 60%)',
        animation: 'mm-flicker 4s ease-in-out infinite',
      }} />
      <Embers count={20} intensity={0.7} />
      <div style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ ...F.mono, color: T.momentTitle, marginBottom: 12, opacity: 0.85 }}>
          Session I — First Light
        </div>
        <h2 style={{
          ...F.display, fontSize: 76, margin: '0 0 20px', lineHeight: 0.95,
          color: T.momentTitle, textShadow: T.momentTitleShadow,
        }}>
          THE FIRST TORCH
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, alignItems: 'start' }}>
          <Placeholder
            label="opening scene · the torch catches"
            bg="rgba(0,0,0,0.4)" stripe="rgba(0,0,0,0.55)" ink={T.momentTitle}
            aspect="16 / 10" style={{ border: `3px solid ${T.momentTitle}` }}
          />
          <div style={{ fontSize: 18, lineHeight: 1.7, color: T.momentInk, ...F.body }}>
            <p style={{ margin: '0 0 14px' }}>
              Three thousand years no flame had touched these walls. The torch caught — slow, then sudden — and the
              chamber gave up its colors one by one. Lapis. Gold leaf. Carnelian. A face on the far wall, painted
              with such care that for a moment we forgot it was painted at all.
            </p>
            <p style={{ margin: 0, color: T.momentTitle, fontStyle: 'italic' }}>
              The face was watching us. The face had always been watching us. The torch had only let us see it back.
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
    <section style={{
      padding: '56px 64px 48px', position: 'relative', zIndex: 3,
      borderBottom: `1px solid ${T.primary}25`, background: BG.log,
    }}>
      <div style={{ ...F.mono, color: T.primary, marginBottom: 10 }}>
        Adventure Log · Latest Dispatch
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 28,
        background: T.paper, border: `2px solid ${T.primary}`, padding: 28,
        boxShadow: `8px 8px 0 ${T.secondary}`,
      }}>
        <Placeholder label="entry plate" bg={T.sky2} stripe={T.sky3} ink={T.ink} aspect="4 / 5" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...F.mono, color: T.secondary }}>
            {LOG_TEASER.session} · {LOG_TEASER.date}
          </div>
          <h3 style={{ ...F.display, fontSize: 38, margin: '8px 0 12px', color: T.primary, lineHeight: 1.05 }}>
            {LOG_TEASER.title.toUpperCase()}
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: T.ink, fontStyle: 'italic', margin: 0, ...F.body }}>
            {LOG_TEASER.excerpt}
          </p>
          <div style={{ flex: 1 }} />
          <div style={{ marginTop: 24 }}>
            <a href="#" style={{
              ...F.display, fontSize: 18, color: T.paper, background: T.primary,
              padding: '8px 18px', textDecoration: 'none', letterSpacing: '0.1em',
              display: 'inline-block', boxShadow: `4px 4px 0 ${T.secondary}`,
            }}>
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
    <section style={{
      padding: '56px 64px 48px', position: 'relative', zIndex: 3,
      borderBottom: `1px solid ${T.primary}25`, background: BG.gallery,
    }}>
      <div style={{ ...F.mono, color: T.primary, marginBottom: 10 }}>Photo Plates · Field Records</div>
      <h2 style={{ ...F.display, fontSize: 50, margin: '0 0 24px', color: T.primary, lineHeight: 1.0 }}>
        FROM THE EXPEDITION
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
        gridAutoRows: 100, gap: 12,
      }}>
        {GALLERY_ITEMS.map((g, i) => (
          <div key={g.id} style={{
            gridColumn: GALLERY_SPANS[i].col, gridRow: GALLERY_SPANS[i].row,
            background: T.paper, padding: 6, border: `1px solid ${T.primary}`,
            transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 0.4}deg)`,
            boxShadow: `3px 3px 0 ${T.primary}80`,
          }}>
            <Placeholder
              label={g.label} bg={T.sky2} stripe={T.sky3} ink={T.ink}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <section style={{
      padding: '40px 64px 56px', position: 'relative', zIndex: 3,
      textAlign: 'center', background: BG.footer,
    }}>
      <div style={{ ...F.display, fontSize: 26, color: T.primary, letterSpacing: '0.2em' }}>
        PATHSIX · MUMMY&apos;S MASK
      </div>
      <GlyphBand color={T.secondary} height={22} opacity={0.7} />
      <div style={{ ...F.mono, color: T.ink, marginTop: 10 }}>
        A Pathfinder Adventure Path by Paizo Inc · Chronicled since MMXXIII
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MummyPreviewPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{
        ...F.body,
        color: T.ink,
        background: T.bg,
        backgroundImage: T.bgImage,
        minHeight: '100vh',
        position: 'relative',
      }}>
        <Hero />
        <Flavor />
        <Party />
        <Map />
        <Moment />
        <Log />
        <Gallery />
        <Footer />
      </div>
    </>
  );
}
