# Handoff: Pathfinder Character Tracker — Redesign

## Overview
A single-character combat/reference screen for the Pathfinder (1e) tabletop RPG. The
goal of the tracker is to surface the things players constantly hunt for on a normal
character sheet — HP math, defenses, spell DCs, limited-use abilities — in one place,
and to **auto-apply** the fiddly rules (damage reduction, vulnerabilities, fortification,
temp HP) so the player doesn't have to do mental math mid-fight.

The example character throughout is **Korroc**, a Stonelord Paladin 7 / Oracle 7
(Mythic: Hierophant / Guardian 1).

## About the Design Files
The file in this bundle (`Character Tracker.dc.html`) is a **design reference created in
HTML** — a working prototype that shows the intended look and behavior. It is **not
production code to copy directly.** It is authored as a "Design Component" (a custom
streaming-template format), so the markup/logic split in that file is specific to the
prototyping tool and should NOT be reproduced literally.

Your task is to **recreate this design in the target codebase's existing environment**
(React, Vue, Svelte, SwiftUI, etc.) using that project's established patterns, component
library, and state management. If no codebase exists yet, choose an appropriate stack
(React + TypeScript is a safe default for this kind of interactive tool) and build it
there. Treat the HTML file as the spec for layout, tokens, copy, and the combat math —
re-derive it idiomatically.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, interactions, and the actual rules
math are all specified below and present in the prototype. Recreate the UI faithfully,
then swap in the target codebase's primitives where they exist.

> **Note on the bound "CABC" design system:** this project has a school-sports booster-club
> design system attached, but it is intentionally **not used** here — it's a blue/green
> light-theme website kit and is unrelated to a dark-fantasy RPG tool. Ignore it for this
> feature. The tracker has its own theming, documented under Design Tokens.

---

## Screens / Views

There is one screen, composed of two regions stacked vertically inside a centered
`max-width: 1500px` container (24–26px horizontal padding). Above it is a full-bleed
sticky utility bar.

### 1. Utility Bar (sticky, top)
- **Purpose:** global navigation + display controls.
- **Layout:** full-width flex row, `space-between`, ~11px vertical / 26px horizontal
  padding, `background: var(--panel)`, 1px bottom border. `position: sticky; top: 0; z-index: 30`.
- **Components:**
  - **`← Roster` link** (left): Oswald, uppercase, letter-spacing .1em, ~13px, color `--gold`.
  - **Theme switcher** (center): segmented control of 3 pills — `REFINED` / `GRIMOIRE` / `MODERN`.
    Wrapper has 1px border, 10px radius, `--bg` fill, 3px padding. Active pill: `--panel-3`
    fill, `--gold` text, `--border-strong` border. Inactive: transparent, `--muted` text.
    Switching swaps the theme token set (see Design Tokens).
  - **Font-scale controls** (right): `A−`, `↺`, `A+` buttons (34×30 / 30×30 px, 7px radius,
    transparent w/ `--border`). They scale a `--fs` multiplier from **0.85 → 1.4** in 0.1
    steps; reset returns to 1. Every font-size in the app is `calc(var(--fs) * Npx)`.

### 2. Combat Console (top region)
A flex-wrap row of three cards (gap = `--gap`, default 16px). All cards: `--panel-2`
fill, 1px `--border`, 14px radius, 18–20px padding.

- **Vitals card** (`flex: 1 1 300px`)
  - "HIT POINTS" eyebrow (Oswald, uppercase, .16em tracking, ~12px, `--muted`).
  - Big current HP number: `--font-display`, weight 600, `calc(var(--fs)*48px)`, color is
    HP-state-driven (see Interactions). Followed by `/ {maxHp}` at ~22px, `--faint`.
  - **HP bar:** 9px tall, 99px radius track (`rgba(0,0,0,.35)` + 1px border), fill width =
    `hp/maxHp*100%`, fill color = same HP-state color, `transition: width .25s, background .25s`.
  - Optional **temp-HP badge** (top-right of the card, shown only when temp HP > 0):
    `+{n} temp`, `--temp` colored, tinted pill.
  - Divider (1px `--border`).
  - **Identity block:** character name `--font-display` 600 ~23px `--gold` (+ pencil glyph);
    "Stonelord Paladin 7 / Oracle 7" ~14px `--muted`; "Mythic: Hierophant / Guardian 1"
    italic ~13px `--gold-dim`.
  - **Defense chips** (auto-applied): three pills — `DR 3/adamantine` (green-tinted, `--hp`),
    `Vulnerable: cold` (red-tinted, `--dmg`), `Fortification 25%` (blue-tinted, `--temp`).
    Oswald uppercase ~11px, 6px radius. Caption beneath: *"Auto-applied to incoming damage ↓"*
    italic ~11.5px `--faint`.

- **Apply-to-HP card** (`flex: 3 1 420px`) — the centerpiece
  - Eyebrow "APPLY TO HP" (`--gold`) + hint *"one amount · heal up, damage down"*.
  - **One amount input** (`type=number`, big — `--font-display` `calc(var(--fs)*30px)`,
    centered, `--panel` fill, `--border-strong`, 10px radius) flanked by **two buttons**:
    - **`▼ Damage`** — `--dmg` fill, white text. Subtracts (with full reduction pipeline).
    - **`▲ Heal`** — `--heal` fill, white text. Adds.
    - Both Oswald uppercase .08em ~15px, 10px radius, hover `filter: brightness(.9)`,
      active `transform: scale(.98)`.
  - **Options row** (always visible — these matter every hit):
    - **Type** `<select>`: physical, fire, cold, acid, electricity, sonic, force, negative,
      positive, untyped.
    - **Bypasses DR** checkbox (accent `--gold`).
    - **Critical hit** checkbox (accent `--dmg`).
  - **Temp HP row** (separated by 1px top border): "TEMP HP" label, number input
    (placeholder "set to…", ~96px), `Set` button, and live `current: {n}` readout.
  - **Result log** (appears after any apply, `fadeIn .22s`): `--panel-3` pill showing a
    colored headline (e.g. "Took 9 damage" / "Healed 14"), a sub (`HP 100 → 91`), and small
    **step chips** breaking down the math (e.g. `Vulnerable cold ×1.5 (+6)`, `DR 3/adamantine
    (−3)`, `Temp HP absorbed 5`, `Fortification 25% — crit negated`). Step chip color:
    green = reduction in your favor, red = increase against you, blue = temp, grey = neutral.

- **Quick-actions card** (`flex: 1 1 150px`): "QUICK" eyebrow + three stacked full-width
  buttons:
  - **Undo** — disabled/dimmed when history empty; reverts the last HP/temp change.
  - **Long Rest** — restores HP to max, clears temp HP, refills all resource pools and all
    per-day ability uses.
  - **Full Heal** — sets HP to max (green-tinted button).

### 3. Stats Strip (below console)
Flex-wrap row, gap `--gap`. Cards here use the quieter `--panel` fill, 1px `--border`,
12px radius, 14–16px padding. Each card has an Oswald uppercase .14em ~11.5px `--muted`
header, several with a `--gold-dim` "+ Add…" affordance on the right.

- **Defenses** (`flex: 1 1 280px`): three stat steppers side by side — **AC 25**, **Touch 11**,
  **Flat-Footed 24**. Each: tiny uppercase label, then `−` / value / `+`. Value is
  `--font-display` ~25px. Stepper buttons 26×26, 7px radius, transparent.
- **Resources** (`flex: 1 1 240px`, "+ Add pool"): rows of `{name} {cur}/{max}` with
  `−1` (red-outline) / `+1` (green-outline) / `↺` (neutral) chip buttons. Seed: **Mythic Power 5/5**.
  Name is `--gold`, underlined w/ `--gold-dim`.
- **Spell DCs** (`flex: 1 1 190px`, "+ Add"): rows of `{name}` + big `--gold` value + `−1`/`+1`.
  Seed: **Spell DC 14**.
- **Spell Penetration** (`flex: 1 1 190px`, "+ Add") — *NEW in this redesign, sits right
  after Spell DCs*: same pattern, value rendered signed (e.g. **+14**), `−1`/`+1`. Caption:
  *"CL check vs spell resistance"*. Seed: **Spell Pen +14**.
- **Conditions** (`flex: 2 1 320px`, "+ Add condition"): when empty shows italic
  *"No active conditions."* "+ Add condition" toggles a preset menu of red-outline chips
  (Shaken, Fatigued, Sickened, Prone, Flat-footed, Staggered, Nauseated, Frightened,
  Grappled, Blinded, Entangled, Exhausted). Clicking a preset adds it as an active chip
  (red-tinted) with an `×` to remove. Duplicates are ignored.

### 4. Abilities Region (below stats strip)
- **Region header:** editable title (default **"Cool Stuff"**, `--font-display` 600 ~26px
  `--gold`) + meta `"{n} shown · 4 parked"`. Right side: `+ New Section` (ghost button),
  `Spells (25)` (gold-outline), `+ New Ability` (solid `--gold` fill, dark text — the one
  primary CTA). 1px bottom border under the whole header.
- **Sections** (each): collapse caret (`▾`/`▸`), name (Oswald uppercase .18em ~14px `--ink`),
  count badge (pill, `--panel-3`), a flex-grow hairline rule, pencil glyph, and an `×`
  (only for removable/custom sections). Collapsing hides that section's cards.
- **Ability card grid:** CSS grid, `repeat(auto-fill, minmax(340px, 1fr))`, gap `--gap`.
- **Ability card** — two visual weights:
  - **Loud (active abilities):** `--panel-2` fill, **3px left border in the action color**.
  - **Quiet (passives / reminders):** `--panel` fill, **transparent left border**, muted
    description color. (Determined by `action === 'PASSIVE'`.)
  - Card body: hover lifts `translateY(-2px)` + shadow + `--border-strong`. Internals:
    - Title `--font-display` 600 ~16.5px `--ink`; category eyebrow (e.g. "CLASS") ~10.5px `--faint`.
    - Top-right: a hover-revealed pencil/× pair (opacity driven by a `--actv` var: .35 → 1 on
      card hover) and an **action-type tag pill** (Oswald uppercase ~10.5px, tinted bg/fg per
      action — see token table).
    - Description ~14px, line-height 1.5, color `--desc` (muted for quiet cards, light for loud).
    - **Uses footer** (only if the ability is limited-use): big current number
      (`--font-display` ~22px, turns `--dmg` when at/below 25% remaining) + `/ {max}` +
      italic per-label (e.g. "per day", "rounds/day"), then `−1` / `+1` / `↺` chip buttons.

#### Seed ability data (4 sections)
- **Mythics** (custom, removable):
  - *Hard to Kill* — PASSIVE — "Automatically stabilize when dying, and you only die once you reach negative Constitution × 2."
  - *Faith's Reach* — PASSIVE — "Extends the range of your divine spells and touch-range class features to close range."
  - *Inspired Spell* — SWIFT — "Hierophant: expend mythic power to spontaneously cast a divine spell not on your list."
  - *Sudden Block* — IMMEDIATE — "Guardian: block an incoming attack as an immediate action, reducing or negating its damage."
- **Limited Use** (default):
  - *Stonestrike* — SWIFT — 6/7 per day — "While on the ground or stone, gain +2 to attack and damage with unarmed strikes and natural weapons."
  - *Defensive Stance* — FREE — 16/18 rounds/day — "Enter a defensive stance for bonuses to AC and saves. Measured in rounds per day."
  - *Lay on Hands* — STANDARD — 6/7 per day — "Heal 3d6 hit points by touch. Usable on yourself or an ally within reach."
  - *Smite Evil* — SWIFT — 2/3 per day — "Add CHA to attack and your level to damage against an evil foe, and bypass its DR."
- **At Will** (default):
  - *Detect Evil* — MOVE — "Concentrate to detect evil as the spell; pinpoint a single aura within three rounds."
  - *Earth Glide* — PASSIVE — "Move through stone, dirt, or earth as easily as air, leaving no tunnel or trace behind you."
- **Reminders** (default):
  - *Aura of Courage* — PASSIVE — "Immune to fear. Allies within 10 ft gain a +4 morale bonus on saves against fear."
  - *Divine Grace* — PASSIVE — "Add your Charisma bonus as a bonus on all saving throws."
  - *Aura of Resolve* — PASSIVE — "Immune to charm. Allies within 10 ft gain a +4 morale bonus against charm effects."

> "Limited Use", "At Will", and "Reminders" are the **default** sections that always exist;
> users can add their own (e.g. "Mythics" above). Off-screen there are simply more ability cards.

---

## Interactions & Behavior

### Damage application pipeline (the core feature)
When **Damage** is pressed with amount `A` (ignore if not a positive integer), compute in
this exact order, logging each step that fires:
1. **Critical + Fortification:** if `Critical hit` is checked AND `fortification > 0`, roll
   `Math.random()*100`. If it lands under the fortification % (25), the crit is negated —
   set damage to `round(A/2)` and log "Fortification 25% — crit negated". Otherwise log
   "Critical confirmed" and keep `A`. *(Halving is a pragmatic stand-in for "remove the
   critical multiplier" since the tracker doesn't know the weapon's normal-hit damage —
   flag this for refinement if real weapon data becomes available.)*
2. **Vulnerability:** if the damage `type` is in the character's vulnerabilities (`['cold']`),
   `dmg = floor(dmg * 1.5)`; log "Vulnerable {type} ×1.5 (+Δ)".
3. **Damage Reduction:** if `DR.amount > 0` and the type is physical
   (physical/slashing/piercing/bludgeoning) — if **Bypasses DR** is checked, log "DR x/type
   bypassed" with no change; else `dmg = max(0, dmg - DR.amount)`; log "DR x/type (−Δ)".
4. **Temp HP:** absorb from temp HP first — `absorbed = min(tempHp, dmg)`, reduce both; log
   "Temp HP absorbed {n}".
5. Apply: `hp = hp - dmg` (HP may go to/below 0 — do not clamp at 0; that's meaningful in
   Pathfinder). Reset the amount field and uncheck Critical. Push prior `{hp, tempHp}` to undo
   history.

**Heal:** `hp = min(maxHp, hp + A)`; log "Healed {actualGain}"; push undo snapshot.
**Set Temp HP:** `tempHp = max(0, value)`; push undo snapshot.

### HP-state color (number + bar)
- `hp <= 0` → `--dmg` (red)
- `<= 25%` → `--dmg`
- `<= 50%` → `#d9952f` (amber)
- else → `--hp` (green)

### Other interactions
- **Steppers** (AC/Touch/FF, resources, DCs, pens, ability uses): `±1`; resources & ability
  uses clamp to `[0, max]`; `↺` resets that row to its max. DCs/pens are unbounded.
- **Undo:** pops the last `{hp, tempHp}` snapshot (max ~25 deep). Disabled when empty.
- **Long Rest:** hp→max, tempHp→0, all resource pools→max, all per-day ability uses→max.
- **Theme switch / font scale:** see Utility Bar. Instant, no animation beyond token swap.
- **Add Section / Add Ability / Rename:** in the prototype these use `window.prompt` as
  placeholders. In a real app, replace with proper inline-edit / modal flows. New abilities
  default to the "Limited Use" section, category "Custom", action PASSIVE.
- **Section collapse**, **card delete (×)**, **condition add/remove** all mutate local state.

### Animation
- Result log: `fadeIn` 0.22s ease (opacity + 3px translateY).
- Card hover: `transform .15s ease`, plus shadow & border-color transitions.
- HP bar: `width/background .25s ease`.
- Buttons: hover brightness, active `scale(.98)`. No bounce/spring.

### Responsive
Pure flex-wrap; the three console cards and the stats cards reflow to fewer columns as
width shrinks (quick-actions wraps under the console first). The ability grid is
`auto-fill minmax(340px, 1fr)`. Designed around a ~1500px max container.

---

## State Management
Single component's local state (lift to a store if multiple characters/roster exist):
- `hp`, `maxHp`, `tempHp`
- `ac`, `touch`, `ff`
- `dr: {amount, type}`, `vulns: string[]`, `fort: number` (defense rules — drive auto-apply)
- `resources: [{id, name, cur, max}]`
- `dcs: [{id, name, val}]`, `pens: [{id, name, val}]`
- `conditions: [{id, name}]`
- Damage form: `dmgAmount`, `dmgType`, `bypassDR`, `isCrit`, `tempInput`
- `sections: [{id, name, removable, collapsed, cards: [{id, title, category, action, desc, cur?, max?, per?}]}]`
- UI: `themeOverride`, `fontScale`, `showCondMenu`, `log`, `history: [{hp, tempHp}]`
- Theme/density can also come from props (`theme`, `density`) for embedding.

No data fetching in the prototype — all in-memory. A production version would persist per
character (and likely sync to a backend / the roster).

---

## Design Tokens

### Theme: Refined (default)
| Token | Value | Role |
|---|---|---|
| `--bg` | `#0e0c0a` | page background |
| `--panel` | `#17130d` | quiet cards / bars |
| `--panel-2` | `#1c160e` | primary cards |
| `--panel-3` | `#241c11` | insets, active pills, log |
| `--border` | `rgba(190,158,92,0.14)` | hairline |
| `--border-strong` | `rgba(190,158,92,0.30)` | emphasized border |
| `--ink` | `#e8e0d0` | primary text |
| `--muted` | `#9a907c` | secondary text |
| `--faint` | `#6b6253` | tertiary text |
| `--gold` | `#caa14e` | headings, brand accent |
| `--gold-dim` | `#8f7639` | underlines, dim accent |
| `--hp` | `#52bf80` | healthy HP / DR good |
| `--dmg` | `#cc4d42` | damage / danger |
| `--heal` | `#34a268` | heal action |
| `--temp` | `#69a6d6` | temp HP / fortification |

### Theme: Grimoire (warmer, deeper)
`--bg #0a0705` · `--panel #14100a` · `--panel-2 #1a140c` · `--panel-3 #241a0f` ·
`--border rgba(196,160,86,0.18)` · `--border-strong rgba(196,160,86,0.34)` ·
`--ink #ede2c9` · `--muted #a99c7c` · `--faint #71654c` · `--gold #d8b15a` ·
`--gold-dim #9c7f3e` · `--hp #5bbf7d` · `--dmg #cf5246` · `--heal #3aa86b` · `--temp #6ea8d8`.

### Theme: Modern (cooler, flatter, less ornament)
`--bg #0f1217` · `--panel #161a21` · `--panel-2 #1b212b` · `--panel-3 #222a36` ·
`--border rgba(255,255,255,0.09)` · `--border-strong rgba(255,255,255,0.20)` ·
`--ink #e6e9ef` · `--muted #9aa3b2` · `--faint #5b6472` · `--gold #e0a93a` ·
`--gold-dim #9c7a33` · `--hp #4ec07a` · `--dmg #e0584b` · `--heal #33a86a` · `--temp #5aa0e0`.
Modern also switches the display + body fonts to a sans (display → Oswald, body → system sans).

### Action-type tag colors `{ background, foreground, leftAccent }`
| Action | bg | fg | accent (left edge) |
|---|---|---|---|
| PASSIVE | `rgba(154,144,124,0.14)` | `#b9b0a0` | transparent (quiet) |
| SWIFT | `rgba(217,149,47,0.16)` | `#e7b15c` | `#d9952f` |
| IMMEDIATE | `rgba(204,77,66,0.18)` | `#e3776b` | `#cc4d42` |
| STANDARD | `rgba(63,158,106,0.16)` | `#5fc08a` | `#3f9e6a` |
| FREE | `rgba(63,143,176,0.16)` | `#6fb6d4` | `#3f8fb0` |
| MOVE | `rgba(138,111,192,0.18)` | `#a98fe0` | `#8a6fc0` |
| FULL | `rgba(207,140,73,0.16)` | `#dca964` | `#cf8c49` |

### Typography
- **Display:** `Cinzel` (Refined/Grimoire) — weights 500/600/700. Used for HP number, names,
  section/region titles, ability titles, stat values. Modern theme substitutes `Oswald`.
- **Label:** `Oswald` — 400/500/600/700. Uppercase eyebrows, nav, buttons, tags, chips,
  tracking .04–.18em.
- **Body:** `Spectral` (Refined/Grimoire) — 400/500 + italics. Descriptions and prose.
  Modern theme substitutes a system sans (`ui-sans-serif, system-ui, "Segoe UI", sans-serif`).
- All sizes scale via `calc(var(--fs) * Npx)` where `--fs` ∈ [0.85, 1.4].

### Spacing / radius
- Card gap: `--gap` (16px comfortable / 10px compact). Card padding: `--cardpad`
  (15px / 11px). Container max 1500px, 24–26px horizontal padding.
- Radii: chips/inputs 6–7px · stat cards 12px · console cards 14px · ability cards 11px ·
  pills (badges) 99px.

### Density (prop)
`comfortable` (default) vs `compact` — only changes `--gap` and `--cardpad`.

---

## Assets
None. The prototype uses no images or icon libraries — all glyphs are Unicode
(`←`, `▼`/`▲`, `▾`/`▸`, `↺`, `✎`, `×`, `+`, `−`, `☾`, `✚`). In a production build, replace
these with the codebase's icon set (e.g. Lucide: `undo-2`, `moon`, `plus`, `pencil`, `x`,
`chevron-down`, `rotate-ccw`, `triangle`). Fonts are Google Fonts (Cinzel, Spectral, Oswald).

## Files
- `Character Tracker.dc.html` — the full interactive design reference (layout, tokens, copy,
  and the complete damage/heal/rest logic). Open it in a browser to interact with it. Read
  its logic class for the exact reduction-pipeline implementation; read its template for the
  exact markup structure and inline styles.
