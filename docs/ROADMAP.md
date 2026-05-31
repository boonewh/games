# Tracker Roadmap / Backlog

Working backlog for the Wrath of the Righteous "cool stuff" tracker. Captured
from real table use. Ordered roughly by size, not priority.

## Design principles (don't violate without discussion)

- **The player character screen stays lean.** It exists to put the stuff a
  player forgets mid-combat *in their face*. Anything that isn't that does not
  belong on the player screen.
- **DM-only data lives on the GM dashboard, never the player screen.** New
  fields the DM wants to see (saves, CMB/CMD, etc.) render on the GM dashboard
  only unless we explicitly decide otherwise.
- **No realtime yet.** HP/state changes are plain HTTP. The GM dashboard polls
  every 5s (`POLL_MS`); the player screen doesn't poll at all (updates only from
  its own action responses).

---

## Quick wins (small, no schema)

### ✅ Inline AC adjustment — DONE (7655822)
- Steppers on all three (AC, Touch, FF) on the HpPanel AC card. Optimistic +
  debounced PATCH. Replaced the static `AcStat` with `AcStepper`.

### ✅ HP restore — TWO separate buttons — DONE (54f87e3)
- **Long Rest** now heals by character `level` (capped at max; null level heals
  0) on top of its existing resets. Logged as `rest` with the healed amount.
- **Full Heal** new action/button: sets `current_hp = max_hp`, clears nonlethal,
  no per-day resets, leaves `temp_hp` alone. Logged as a `heal` so Undo reverses
  it.
- `temp_hp` is left alone on both (decided: lean).

---

## Features (need design before building)

### Leveling / "add things" merge-diff
- When re-applying a template/PDF or leveling a character, new data must NOT
  squash existing custom edits.
- Want: show the user a diff and let them choose, field by field / card by card,
  what to keep vs. take from the new version.
- Trigger today is *adding* things, not only leveling.
- **Needs its own design pass** — merge semantics, what's diffable (abilities,
  spells, pools, defenses), and the review UI.

### Spell / spell-slot tracking rework
- PDF parsing creates individual `spell` rows but dropped the old spell-level
  "slot" ability cards. Result:
  - Spontaneous casters: the per-spell "cast" button doesn't decrement anything
    useful (no slot counter behind it).
  - Prepared casters: cast/uncast on `cast_count` vs `prepared_count` exists in
    `spells/[id]` route — verify it actually behaves correctly in the UI.
- Want: usable spell tracking for both caster types; re-introduce slot counts
  for spontaneous casters in some form.
- **Needs design** — relationship between the `spell` table, slot counts, and
  the old ability-card slot trackers.

---

## Schema changes (DM visibility)

### ✅ DM stat fields — migration 007 — DONE, UNPUSHED (6594a00)
- Added `deity, alignment, save_fort, save_ref, save_will, cmb, cmd, languages`
  columns to `character` (migration 007, all nullable).
- Editable in the character editor ("GM details" section); displayed on the GM
  dashboard only (saves+maneuvers row, deity/alignment/languages line). Not on
  the player combat screen. Added to the character PATCH whitelist.
- ⚠️ **Run migration 007 in Supabase before deploying** — the editor sends these
  fields on save, so deploying first would break character editing. Held
  unpushed until the migration is applied.

### ▢ GM private note box — TODO (own table + migration 008)
- Free-text DM note per character, shown + edited on the GM dashboard only.
- **Must not leak to the player.** Use a **separate `gm_note` table** (fetched
  only by the dashboard endpoint, never the player `GET` which returns `*`) so
  the privacy is structural rather than a thing we remember to strip.
- Edit gated to the party GM (`canEditCharacter` already returns true for GM).
- **Editing hazard:** the dashboard polls every 5s — a free-text box there needs
  a focus guard (don't resync from a poll while the field is focused) or the
  DM's typing gets clobbered. Same pattern as the AcStepper's pending guard.

---

## Discussion only (not scheduled)

### Private notes / messaging (decided — Option A, scoped small)
- **Direction locked: Option A (polling), DM→player only, toast, ephemeral.**
- **Current reality:** no websockets. GM dashboard polls every 5s; player screen
  does not poll — so this adds the player screen's first background poll.
- Scope for v1:
  - DM→player only (no player↔player yet).
  - **Ephemeral**: show as a transient **toast** on the player screen; not a
    persistent inbox/log. (Server still needs a row long enough to deliver it
    once — see delivery note.)
  - Sender is the party GM; recipient is one character's owner.
- Data model: a `message` table — `id, party_id, sender_user_id,
  recipient_user_id, body, created_at, delivered_at`. "Ephemeral" = once polled
  and shown as a toast, mark delivered (or delete); don't build an inbox UI.
- Delivery: add a light poll on the player screen (~10s) → `GET /api/tracker/
  messages?since=…`; render new ones as toasts; ack so they don't re-toast.
- Supabase Realtime (true push + live player-side HP) stays a SEPARATE, larger
  initiative — it would require introducing a browser Supabase client + real RLS
  (we currently use service-role server-side only, no RLS policies).
