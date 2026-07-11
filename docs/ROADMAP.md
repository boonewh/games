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

### ✅ Leveling / "add things" merge-diff — "Update from PDF" — DONE (fcb87d0, 5e802d8, 4437dc8)
- Re-parse a Hero Lab PDF from the character editor → review a diff → apply,
  without squashing custom edits. No migration.
- **Phase 1** `lib/tracker/merge.ts` + 22 tests: pure diff/bucketing (unchanged/
  changed/new/removed), normalized-name matching (spells keyed by class, DR by
  bypass, resist/vuln by energy type), and preservation merges (take-new keeps
  uses_remaining/cast_count/points_remaining clamped + enabled/hidden/sort_order).
- **Phase 2** `POST /characters/[id]/merge`: re-fetches server-side, rebuilds the
  plan, applies decisions; convergent (re-run = no-op).
- **Phase 3** `MergeReviewModal` + "Update from PDF" button in the editor;
  per-item toggles defaulted to spec (new→add, changed→take, removed→keep).
- **Deferred:** manual re-link for parser renames (rename shows as new+removed;
  reconcile in the editor for now).
- ⚠️ Couldn't click-test (auth wall) — verified via tsc/eslint/build/tests.

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

### ✅ DM stat fields — migration 007 — DONE (6594a00)
- Added `deity, alignment, save_fort, save_ref, save_will, cmb, cmd, languages`
  columns to `character` (migration 007, all nullable).
- Editable in the character editor ("GM details" section); displayed on the GM
  dashboard only (saves+maneuvers row, deity/alignment/languages line). Not on
  the player combat screen. Added to the character PATCH whitelist.
- PDF parser now extracts them too (c60071d) — imported characters arrive with
  deity/alignment/saves/CMB/CMD/languages populated, not blank.
- Migration 007 has been applied in Supabase; pushed and live.

### ✅ GM private note box — migration 008 — DONE (e6c3c00)
- Separate `gm_note` table; the player character GET never joins it, so the note
  is structurally unable to leak to the player.
- GM-only PUT `/characters/[id]/gm-note` gated by `isPartyGmOfCharacter` (the
  owner can't write it, only the party GM). Read via the GM-gated dashboard.
- Dashboard card textarea with a focus guard (no resync from the 5s poll while
  focused); saves on blur.
- Migration 008 has been applied in Supabase; pushed and live.

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
