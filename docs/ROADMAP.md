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

## Schema changes (migration 007 — DM visibility)

The DM wants to see more per character. These render on the **GM dashboard only**
(keep the player screen lean). New columns on `character` unless noted:

- `deity` (text) — important for WotR
- `alignment` (text)
- saving throws: `save_fort`, `save_ref`, `save_will` (int)
- `cmb` (int)
- `cmd` (int)
- `languages` (text — comma list, or its own table? probably text is fine)
- `gm_notes` (text) — **GM-only free-text note per character**

### Open design points for migration 007
- **`gm_notes` must not leak to the player.** The character `GET` returns `*`,
  which players can read for their own character. Saves/deity/alignment/CMB/CMD/
  languages are the player's own data — fine for them to see. But `gm_notes` is
  the DM's private note about the character and must be stripped from any
  player-facing payload (or stored in a separate GM-only table gated to the
  party GM).
- **Who edits these?** Likely the GM, from the dashboard. Editing must be gated
  to the party GM (existing `canEditCharacter` already returns true for the GM).
- Decide: extra `character` columns vs. a separate `gm_character_notes` table.
  Single column is simplest for everything except `gm_notes`, where a separate
  table makes the "never expose to player" rule structurally enforceable.

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
