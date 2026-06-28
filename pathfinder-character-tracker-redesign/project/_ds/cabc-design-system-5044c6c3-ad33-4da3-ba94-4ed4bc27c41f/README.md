# CABC Design System

The visual + interaction system for **Compass Athletic Booster Club** (CABC) — the parent‑volunteer fundraising organization supporting athletics at **Compass Academy Charter School** in Odessa, TX. Mascot: the **Cougars**. Live site: [cabcodessa.org](https://cabcodessa.org) (currently published on Wix; this system exists so design work can happen in code and then be rebuilt inside the Wix editor).

> "The Compass Athletic Booster Club was established to support the athletic programs at Compass by helping to provide athletic equipment for all sports… It is our mission to support the development of strong moral character hand‑in‑hand with academic excellence."

## Sources used to build this system

| Source | Path / link | Notes |
|---|---|---|
| Brand color document | `uploads/CABC design system.docx` | Authoritative palette + role mapping. |
| Live homepage hero | `uploads/Screenshot 2026-04-26 180539.jpg` | Nav + "Who Are We?" layout. |
| Live homepage gallery + footer | `uploads/Screenshot 2026-04-26 180608.jpg` | "WE ARE PROUD OF YOU" slider + green footer. |
| Live site copy + nav structure | https://cabcodessa.org | Fetched 2026‑04‑26 for nav items, mission copy, logo URLs. |
| Sister mark | mycompassacademy.com | The "CA" mark on the footer is the school's, not the booster club's. |

## Products represented

The booster club has **one surface today: the marketing website** (`cabcodessa.org`). It is informational + transactional — visitors learn who CABC is, find game schedules, buy tickets, sign up to volunteer, become a member, donate (Venmo), and shop merch (off‑site, Fusion Brands). The UI kit at `ui_kits/website/` is the recreation of that surface.

There is no app, no docs site, no internal tool. If those get added later, each becomes its own folder under `ui_kits/`.

## Index — what's in this folder

```
README.md               ← this file
SKILL.md                ← how an AI assistant should use this kit
colors_and_type.css     ← all design tokens (CSS vars)
fonts/                  ← (none yet — using Google Fonts, see "Type" below)
assets/                 ← logos, marks, image placeholders
preview/                ← cards rendered in the Design System tab
ui_kits/
  website/              ← Hi‑fi recreation of cabcodessa.org components
    index.html
    *.jsx
```

---

## CONTENT FUNDAMENTALS

CABC's voice is **proud, plainspoken, and parent‑volunteer earnest**. It is not corporate, not slangy, not ironic. The energy is "small private school that loves its kids."

**Tone**
- **Celebratory and proud, never boastful.** "WE ARE PROUD OF YOU" is the literal headline of an entire homepage section. The audience are the athletes, parents, and grandparents.
- **Mission‑forward.** Copy frequently reaches for words like *mission*, *support*, *character*, *excellence*, *hand‑in‑hand*. Long sentences are fine when they are listing sports or recounting purpose.
- **Inclusive plural — "we" / "our".** The booster club speaks as a collective ("It is our mission…", "We support…"). Almost never first‑person singular.
- **"You" addresses the athlete or the prospective volunteer/donor.** "Share your pictures with us." "We are proud of *you*."
- **Verbs of contribution.** *Support, raise, provide, develop, share, volunteer, donate, become a member.*

**Casing**
- **Headlines are ALL CAPS, italic, condensed display.** Examples on the live site: `COMPASS ATHLETIC BOOSTER CLUB`, `WE ARE PROUD OF YOU`. The italic+caps treatment is a defining brand mark — don't lose it.
- **Section titles like "Who Are We?" use Title Case** in a different (script/serif) accent — secondary voice.
- **Nav and buttons are ALL CAPS, wide‑tracked, sans‑serif.** `HOME · SCHOLARSHIPS · BOARD MEETING · ABOUT US · EVENTS · SCHEDULES · TICKETS · VOLUNTEER · MORE`. Single‑word labels preferred.
- **Body copy is sentence case.** Long paragraphs, comma‑rich, slightly formal.

**Emoji & symbols**
- **No emoji.** None on the live site. Don't introduce them.
- Unicode characters are used sparingly — `→` arrow inside the SHOP CTA, `+` glyph on the "UPLOAD FILES" button. That's it.
- **Iconography is logo‑first** (cougar mark, CA monogram, Facebook white circle). No lucide/feather UI icons currently in use, though we ship a curated set in this system because the redesign will need them.

**Concrete copy examples (lifted from the site)**
- Hero name: `COMPASS ATHLETIC BOOSTER CLUB`
- Primary CTA in header: `SHOP →`
- Section headline: `WE ARE PROUD OF YOU`
- Section subhead: `Who Are We?`
- Nav: `HOME · SCHOLARSHIPS · BOARD MEETING · ABOUT US · EVENTS · SCHEDULES · TICKETS · VOLUNTEER · COUGARS DEN MENU · CONTACT · GET INVOLVED`
- Sub‑nav under GET INVOLVED: `BECOME A MEMBER · DONATE`
- Footer prompt: `FOLLOW US HERE:`
- User invitation: `Share your pictures with us and we will share them here!`
- Legal: `© 2026 The content on this website is owned by us and our licensors. Do not copy any content (including images) without our consent.`

**Sports we name (always list together, in this order on the live site):** football, volleyball, basketball, golf, tennis, track, cross country, cheer, baseball, softball.

---

## VISUAL FOUNDATIONS

**Palette** — from the official brand doc, with role mapping:

| Swatch | Hex | Role |
|---|---|---|
| Dark Blue | `#213F98` | Structure: header bar, primary brand surfaces, headlines |
| Light Blue | `#7184BA` | Secondary surfaces, soft brand washes |
| Dark Green | `#063C21` | Deep accent, hover states on green |
| Medium Green | `#0D7942` | **Action**: buttons, CTAs, footer |
| Light Green | `#83B69B` | Soft backgrounds, supportive surfaces |
| Grey | `#D5D5D5` | Borders, dividers, image scaffolds |

The *non‑negotiable* combination is **blue + green**, mirroring the cougar logo (blue ring + green/teal accents on the mascot). Avoid introducing a third hue family. White is the resting page color; a very pale blue (`#F5F7FB`) is the only acceptable off‑white for sections.

**Type**
- **Display** — condensed, italic, all‑caps, very heavy weight. Used for headlines, hero brand wordmark, and section banners. Live site appears to use a Bebas / Druk‑style italic; we ship **Barlow Condensed Italic** (Google Fonts) as the closest free substitute — **flag this with the user; if they own a license to Anton, Bebas Neue, or Druk Italic, swap in.**
- **Label** — Oswald, semi‑bold, all‑caps, wide letter‑spacing. Nav, buttons, eyebrows.
- **Body** — Inter (humanist sans). 16px base. Line‑height 1.55 for paragraphs, 1.7 for long mission copy.
- A **handwritten/script accent** is used once on the live site for "Who Are We?". Treat as a *one‑off accent*, not a system face — re‑introduce only if the user wants to keep that voice; a Google Fonts substitute would be **Caveat Brush** or **Kalam**.

**Spacing** — 4‑pt grid. Section padding on the live site is generous — 80–96px vertical between sections on desktop. Container max 1200px.

**Backgrounds**
- **Solid blue (`#213F98`)** for the hero band and most navigation surfaces.
- **White** for the body sections.
- **Solid green (`#0D7942`)** for the footer band.
- **One photographic background**: the gallery section uses a faded/blurred sports photo as a backdrop behind circular image masks — this is a defining visual moment.
- **No gradients.** No mesh. No noise textures. Flat color.
- **No repeating patterns**, but a **subtle compass watermark** (concentric circles + N/E/S/W needle, white at low opacity) is sketched in the brand doc as a decorative motif — we include it in the system as `compass-watermark.svg` and use it sparingly.

**Imagery**
- Real action photography from games, practices, and team huddles. **Warm, natural lighting** — outdoor field photos and gym interiors. **Not** stylized, not B&W, not graded.
- The live homepage uses **circular image crops** in the gallery — a strong CABC‑specific motif we should preserve.
- Imagery should always show the kids of Compass Academy in their teal/green or white uniforms.

**Animation**
- The current site has essentially none. For the redesign: **gentle fades** (`opacity` + `transform: translateY(8px)` on enter), **150–200ms** transitions, **ease‑out** for entrances and **ease‑in‑out** for state changes. **No bounce, no spring.** Sliders auto‑advance every ~5s with crossfade.

**Hover states**
- **Buttons:** darken — green CTA goes to `#0A6235`; blue surfaces go to `#1A3280`.
- **Nav links:** the underline/highlight currently appears as a green pill behind the active link (visible on `HOME` in the screenshot). On hover, lift a green underline.
- **Links in body copy:** color stays, underline appears.
- **Cards / image tiles:** tiny lift (`translateY(-2px)`) + soft shadow, never a glow.

**Press states**
- Reduce scale to 0.98 on click, return on release. Slight darken of fill.

**Borders**
- Hairline `1px solid var(--hairline)` for content cards.
- Heavier `2px solid var(--cabc-grey)` for divider rules and image frames.
- The hero unit uses **no border**; it relies on color block separation.

**Shadows**
- Three‑tier system (see `colors_and_type.css`): `--shadow-1` for resting cards, `--shadow-2` for hover/raised, `--shadow-3` for modal/peak. All shadows are blue‑tinted (rgba(14,21,48,…)) so they feel cohesive on white.
- **No inner shadows.** No neumorphism.

**Corner radii**
- `4px` for input fields and small chips.
- `8px` for cards and image tiles.
- `14px` for hero photographic blocks.
- **`999px` (pill)** for primary CTAs — the live "SHOP →" button is a strong example. Pills are reserved for the action moment.

**Cards**
- White surface, `8px` radius, `--shadow-1` resting, `1px` hairline border, `--shadow-2` on hover.
- For image cards (athlete spotlights), use `14px` radius, no border, `--shadow-2`.

**Transparency / blur**
- The "WE ARE PROUD OF YOU" section uses a **blurred photographic backdrop** at maybe ~60% opacity behind the circular gallery — a signature CABC effect. Reuse for full‑bleed photo sections.
- Otherwise avoid glassmorphism / frosted nav.

**Layout rules**
- Nav fixes to top, **96px tall**, full‑bleed blue.
- Logo locks center‑left of nav; primary CTA pill locks far right.
- Section bands are **always full‑bleed color**; content is centered in a 1200px container inside.
- Footer is full‑bleed green, always.

---

## ICONOGRAPHY

**The brand's primary icon is its logo.** The CABC cougar/compass medallion (`assets/cabc-logo.png`) and the Compass Academy "CA" monogram (`assets/compass-academy-mark.png`) do most of the iconographic heavy lifting on the live site. Outside of those, the only icon visible on the live homepage is a **white Facebook circle** (used in the "FOLLOW US HERE" footer).

**Approach for the redesign:**
- **Style**: line icons, ~1.75‑px stroke, square caps, rounded joins. Should sit comfortably next to the all‑caps Oswald nav labels at 18px without feeling toy‑like.
- **Stack**: we link **[Lucide](https://lucide.dev/)** from CDN as the working icon set. *Substitution flag — Lucide is not currently used by CABC; this is a recommendation for the redesign because no in‑house icon set exists.* Lucide's tone (clean, line, slightly athletic) reads well next to the brand's italic display caps.
- **Color**: icons inherit `currentColor`. On the blue header they sit at white; on white surfaces they sit at `--cabc-blue`; on green CTAs they sit at white.
- **No emoji**, anywhere. **No unicode glyph icons** beyond the existing `→` arrow in CTAs. **No PNG icons**.
- **Decorative compass motif** — the brand doc includes hand‑drawn SVG markup for a concentric‑ring compass with N/E/S/W needles. We re‑authored that as `assets/compass-watermark.svg` for use as a low‑opacity background ornament behind hero/section bands. Use at white @ 8–12% opacity over blue; never over imagery.

**Logo lockups available in `assets/`:**
- `cabc-logo.png` — the medallion (full color, blue ring + cougar).
- `compass-academy-mark.png` — sister school's "CA" monogram (footer co‑brand only — not a CABC mark).
- `compass-watermark.svg` — decorative ring/needle.
- `cougar-silhouette.svg` — placeholder cougar profile drawn from the medallion for use as a quiet accent or favicon. **Substitution flag** — this is a placeholder; replace with the school's official mark vector when available.

**Sport iconography** — the redesign needs icons for the 10 listed sports. We use Lucide's sport‑adjacent set (`circle-dot` for ball sports, `trophy`, `target`, `flag`, etc.) as a workable starting point. **Flag**: Lucide does not have a dedicated cougar/cheer/cross‑country icon — we substitute generic equivalents and leave this for the user to refine.

---

See `SKILL.md` for how to use this system in a new design conversation.
