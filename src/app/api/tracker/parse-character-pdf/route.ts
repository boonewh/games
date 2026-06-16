// PDF → structured character data via Claude Sonnet 4.5 with native PDF support.
//
// POST a PDF as multipart/form-data (field name "pdf"), get back
//   { extracted: ExtractedCharacter }
// or
//   { error: string, raw?: string }   (raw included when JSON parse fails so
//                                       we can debug the prompt)
//
// The system prompt is cached (ephemeral) — repeated parses for the same
// session reuse it, cutting cost. The PDF itself is sent as base64 in
// a document content block; Claude reads it natively without OCR.

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireSession } from '@/lib/tracker/http'
import type { ExtractedCharacter } from '@/lib/tracker/extracted'

const MAX_PDF_BYTES = 32 * 1024 * 1024 // 32 MB — Anthropic's PDF size cap

const EXTRACTION_PROMPT = `You are extracting Pathfinder 1e character data from a Hero Lab PDF for a "cool stuff dashboard" companion app. The app surfaces the things players forget mid-combat — limited-use class features, conditional feat bonuses, spell slots, resource pools, defenses.

Output ONLY valid JSON. No markdown code fences, no prose. Start with { and end with }.

Schema:
{
  "name": string,
  "class_summary": string,           // concise; see CLASS SUMMARY rule. e.g. "Stonelord Paladin 4 / Life Oracle 4"
  "level": number,                    // GESTALT campaign: the shared class level, NOT the sum (see LEVEL rule)
  "max_hp": number,
  "ac": number | null,
  "ac_touch": number | null,
  "ac_flat_footed": number | null,
  "spell_dcs": [{ "name": string, "dc": number }],
  "mythic_path": string | null,       // mythic path name(s); dual path joined " / " (see MYTHIC rule); null if not mythic
  "mythic_tier": number | null,       // mythic tier 1-10 (see MYTHIC rule); null if not mythic
  "fortification_percent": number,    // 0 if none; light=25, moderate=50, heavy=75
  "deity": string | null,             // patron deity if listed
  "alignment": string | null,         // standard abbreviation: LG, NG, CG, LN, N, CN, LE, NE, CE
  "save_fort": number | null,         // total Fortitude save bonus
  "save_ref": number | null,          // total Reflex save bonus
  "save_will": number | null,         // total Will save bonus
  "cmb": number | null,               // total Combat Maneuver Bonus
  "cmd": number | null,               // total Combat Maneuver Defense
  "languages": string | null,         // comma-separated list, e.g. "Common, Dwarven, Giant"
  "drs": [{ "amount": number, "bypass": string }],
  "resistances": [{ "energy_type": "fire"|"cold"|"electricity"|"acid"|"sonic", "amount": number }],
  "vulnerabilities": [{ "energy_type": "fire"|"cold"|"electricity"|"acid"|"sonic" }],
  "abilities": [{
    "name": string,
    "category": "class_feature"|"feat"|"spell"|"sla"|"item"|"reminder",
    "action_type": "free"|"swift"|"move"|"standard"|"full"|"immediate"|"reaction"|"passive"|null,
    "description": string,           // 1-3 sentence summary of what the player needs to remember
    "uses_max": number | null,
    "recharge": "per_day"|"per_encounter"|"per_round"|"manual"|null
  }],
  "spells": [{
    "name": string,
    "level": number,                  // 0-9
    "casting_class": string,          // lowercase, e.g. "paladin", "oracle", "wizard"
    "school": string | null,          // lowercase, e.g. "evocation"
    "description": string | null,     // 1-2 sentence effect summary
    "prepared_count": number | null   // number prepared today for prepared casters; null for spontaneous
  }],
  "pools": [{
    "name": string,                   // e.g. "Ki Pool", "Arcane Pool", "Mythic Power"
    "points_max": number,
    "recharge": "per_day"|"per_encounter"|"manual"
  }]
}

Extraction rules:

ABILITIES — include things the player would forget. Prioritize:
- Class features with daily uses: Lay on Hands, Channel Energy, Smite, Rage rounds, Bardic Performance rounds, Stonestrike, Defensive Stance, Energy Body, Mercy effects, Judgments, etc.
- Feats with conditional bonuses or activation cost: Power Attack, Combat Reflexes, Step Up, Selective Channeling, Vital Strike, Cleave, Snap Shot, etc. — set category "feat", action_type usually "passive" unless explicitly an action.
- Racial conditional bonuses: dwarf Hatred (+1 vs orcs/goblinoids), Stability, Stonecunning, Defensive Training vs giants, halfling Luck, elf Keen Senses, etc. — category "reminder", action_type "passive".
- Spell-like abilities: category "sla".
- Magic items with daily uses, on-use abilities (wands, rods, potions with charges).
- Oracle revelations, paladin auras, mercies, etc. as their own ability rows.

SKIP: generic skill ranks, base attack bonus, raw saves, Common/dwarven/etc languages, mundane equipment without daily uses.

action_type: only when the rules explicitly state an action cost. Otherwise null.

uses_max: only when the ability has X/day, X/encounter, X/round limits. Otherwise null. Note: for abilities measured in rounds-per-day (Bardic Performance, Defensive Stance), set uses_max to the total rounds.

recharge: "per_day" / "per_encounter" / "per_round" / null when no recharge listed.

description: 1-3 sentences max. Action cost, key effect, dice/numbers, save DC, range. Skim-read at the table.

SPELLS — every known and prepared spell.
- Prepared casters (Wizard, Cleric, Paladin, Ranger, Druid, Witch, Alchemist): set prepared_count to the number prepared. Same spell prepared twice = prepared_count: 2 (one row).
- Spontaneous casters (Sorcerer, Oracle, Bard, Magus, Skald, Inquisitor, Summoner spontaneous spellcasters): set prepared_count to null. These are "known" spells.
- casting_class: lowercase short form.
- school: lowercase like "evocation"; null if not in the PDF.
- description: 1-2 sentences. Effect, save DC if applicable, range.

SPELL DCS — extract every distinct spell save DC the character has.
- Most casters have one DC per casting stat/class. Name it by school or class if situational.
- This campaign uses a HOUSE RULE: every spell at every level uses the caster's highest DC per school/type. So report the maximum DC for each distinct context.
- If the character has a single DC for all spells, output one entry: [{ "name": "Spell DC", "dc": N }].
- If the character has multiple situational DCs (e.g. different by school, by class, or via feats like Spell Focus), output one entry per distinct DC, naming it descriptively: e.g. "Conjuration DC", "Enchantment DC", "Oracle DC".
- Compute each DC as: 10 + (highest spell level they can cast with that class/school) + (relevant casting ability modifier).
- Hero Lab usually prints per-level save DCs in the spellcasting section — use the largest value for each context.
- Non-casters: output [].

POOLS — resource pools that multiple abilities draw from (DIFFERENT from per-day ability uses):
- Ki Pool (monk), Arcane Pool (magus), Grit (gunslinger), Panache (swashbuckler), Phrenic Pool (psychic), Mythic Power (mythic), Bardic Performance rounds (treat as pool OR ability — prefer pool if spent in increments).
- Don't duplicate things already covered in abilities.
- recharge typically "per_day".

DRs / RESISTANCES / VULNERABILITIES / FORTIFICATION:
- "DR 5/magic" → { amount: 5, bypass: "magic" }
- "DR 10/cold iron and good" → { amount: 10, bypass: "cold iron and good" }
- "DR 2/—" → { amount: 2, bypass: "—" }
- Energy resistances: individual entries by type, lowercase type.
- Vulnerabilities: rare (curses, racial templates).
- Fortification: light=25, moderate=50, heavy=75. 0 if none.

CLASS SUMMARY — keep it short and readable, the way a player would say it aloud.
- Each CLASS appears at most ONCE. If a class has multiple archetypes (e.g. a
  paladin that is both "Virtuous Bravo" and "Oath of the Mendevian Crusade"), do
  NOT list the class twice. Pick the single most defining archetype as a one-word
  qualifier, or drop the qualifier if none stands out. Prefer build archetypes
  (Stonelord, Virtuous Bravo, Admixture Evoker) over oaths/orders.
- Join the two gestalt classes with " / ". One qualifier word per class.
- Good: "Virtuous Bravo Paladin 6 / Admixture Evoker 6". Bad (redundant):
  "Oath of the Mendevian Crusade Paladin 6 / Virtuous Bravo Paladin 6 / Evoker 6".
- Do NOT put the mythic path here — it has its own field.

LEVEL (IMPORTANT) — This is a GESTALT campaign: characters advance two classes
in parallel, gaining a level in BOTH at once. So the character level is the
shared single-class level, NOT the sum. A gestalt "Paladin 4 / Oracle 4" is
level 4, not 8. Set "level" to the maximum individual class level (which, for
gestalt, equals each class's level) — never add the class levels together. A
"Gestalt" entry on the sheet confirms gestalt. Only a genuinely single-classed
character uses that one class's level directly. class_summary should still list
both classes (e.g. "Stonelord Paladin 4 / Life Oracle 4").

MYTHIC PATH / TIER (Wrath of the Righteous) — characters also advance on a
mythic path. Capture two fields. The six standard paths are: Archmage, Champion,
Guardian, Hierophant, Marshal, Trickster.

mythic_path:
- If the class/header line names it (e.g. ".../Hierophant 1"), use that name.
- DUAL PATH: if the character has the "Dual Path" feat, it names a SECOND path in
  brackets, e.g. "Dual Path [Mythic, Guardian]". Include BOTH paths, primary
  first, joined with " / " — e.g. "Hierophant / Guardian".
- If NO path is named anywhere on the sheet (some exports omit it), INFER it from
  the mythic abilities the character has. Signature tells:
    Archmage    → Arcane Surge, Wild Arcana, Versatile Evocation, Component Freedom, Enduring Armor
    Champion    → Fleet Charge, Mythic Weapon Skill, Champion's Strike, Sudden Attack
    Guardian    → Absorb Blow, Sudden Block, Guardian's Call, Fortification
    Hierophant  → Inspired Spell, Divine Surge, Faith's Reach, Energy Body
    Marshal     → Marshal's Order, Inspiring Word, Steal Glory
    Trickster   → Surprise Strike, Fickle Attack, Mythic Saving Throw
  Use the single best-matching path. null ONLY if there is no mythic content at all.

mythic_tier:
- Read the number after the path in the class line if present ("Hierophant 1" → 1).
- If absent, infer from "Mythic Power (N/day)" using tier = (N - 3) / 2
  (so 5/day = tier 1, 7/day = tier 2, 9/day = tier 3).
- null if the character is not mythic.

DM REFERENCE FIELDS — pull these straight off the sheet for the GM dashboard:
- deity: the listed deity, or null if none.
- alignment: the standard abbreviation only (LG, NG, CG, LN, N, CN, LE, NE, CE).
  Convert spelled-out alignments (e.g. "Lawful Good" → "LG"). null if absent.
- save_fort / save_ref / save_will: the TOTAL save numbers (the final modifiers).
- cmb / cmd: the total Combat Maneuver Bonus and Combat Maneuver Defense.
- languages: a comma-separated list of languages known (e.g. "Common, Dwarven").
Use null for any of these not present in the PDF.

Final reminder: Output ONLY the JSON. Begin with { end with }.`

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in environment')
  return new Anthropic({ apiKey })
}

export async function POST(req: NextRequest) {
  const auth = await requireSession()
  if ('error' in auth) return auth.error

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('pdf')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Missing "pdf" file field' }, { status: 400 })
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { error: `PDF too large (${Math.round(file.size / 1024 / 1024)} MB > 32 MB cap)` },
      { status: 400 }
    )
  }
  if (file.type && !file.type.includes('pdf')) {
    return NextResponse.json({ error: `Expected a PDF (got ${file.type})` }, { status: 400 })
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ error: 'Could not read uploaded file' }, { status: 400 })
  }
  const base64 = buffer.toString('base64')

  let client: Anthropic
  try {
    client = getClient()
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Anthropic client unavailable' },
      { status: 500 }
    )
  }

  let response
  try {
    response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: [
        {
          type: 'text',
          text: EXTRACTION_PROMPT,
          // Cache the long extraction prompt so repeat parses in the same hour
          // re-use it (per-token cost drops by ~90% on cache hits).
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64
              }
            },
            {
              type: 'text',
              text: 'Extract the character data from this Hero Lab PDF per the schema in the system prompt. Return only the JSON.'
            }
          ]
        }
      ]
    })
  } catch (e) {
    return NextResponse.json(
      { error: `Anthropic API error: ${e instanceof Error ? e.message : String(e)}` },
      { status: 502 }
    )
  }

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'No text response from Claude' }, { status: 502 })
  }

  // Strip any markdown code fence Claude might have wrapped the JSON in, defensively.
  const cleaned = textBlock.text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  let extracted: ExtractedCharacter
  try {
    extracted = JSON.parse(cleaned) as ExtractedCharacter
  } catch {
    return NextResponse.json(
      {
        error: 'Claude returned text that was not valid JSON',
        raw: textBlock.text
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    extracted,
    usage: response.usage // surface token usage so we can verify caching is working
  })
}
