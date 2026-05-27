# Pathfinder Tracker — Player Guide

**TL;DR:** [pathsix.games/wrath/tracker](https://pathsix.games/wrath/tracker) → sign in with Google → make your character → use during play. Tells you what your character can do so you stop forgetting.

---

## What it does

Tracks the stuff you actually forget mid-combat:

- **HP** with automatic DR/resistance/vulnerability math (and crit-fortification rolling if you've got Stoneblood-style 25% fort)
- **AC / Touch / Flat-Footed** at a glance
- **Conditions** with the rules text right there (no flipping books)
- **Resource pools** — Ki, Arcane Pool, Mythic Power, whatever
- **Cool stuff cards** — your signature abilities with use counters, action-type badges, and reminders for the conditional stuff you keep forgetting

Built for our table specifically, not for all of Pathfinder. Things like *Korroc has cold vulnerability from his Oracle curse, so he takes ×1.5 cold damage* are baked in.

---

## Getting in

1. Visit **[pathsix.games/wrath/tracker](https://pathsix.games/wrath/tracker)**
2. Sign in with Google (the same account you use for the campaign log)
3. That's it

Works on desktop, tablet, phone. Add the URL to your home screen for one-tap access.

---

## Make your character

Click **+ New Character** on the roster.

- **Templates**: if your character is in the dropdown, pick it — it fills in HP, AC, DR, vulnerabilities, and all the ability cards.
- **Blank**: name and max HP are the only required fields. Add the rest as you go, or tell William what to build.

Tell William the broad strokes of your character (race / class / level / cool stuff you keep forgetting) and he'll build a template. ~10 minutes per character.

---

## During play

### HP panel

- Big number = current HP, max next to it. Color shifts amber/red as you take hits.
- **Damage**: amount → type dropdown (physical/fire/cold/etc.) → Apply. DR subtracts automatically for physical. Vulnerability multiplies ×1.5 for matching energy types. Check **Crit?** to roll fortification (if your character has it).
- **Bypasses DR**: check this if the attacker's weapon matches your DR's bypass type (e.g. you have DR/magic and they swung a magic sword).
- **Heal**: amount → Heal. Capped at max.
- **Temp HP**: Set to N.
- **Undo** (or **Ctrl+Z**): reverses the last HP event.
- **Long Rest**: end of day. Resets all per-day abilities + per-day pools + clears nonlethal.

### AC / Touch / Flat-Footed

Gold-bordered box on the bar. Click the ✎ next to your name to edit when gear changes.

### Conditions

The middle card on the bar. **+ Add condition** opens a picker with all 27 PF1e conditions, searchable. Each badge shows the effect text right there.

Some conditions are **house ruled** — they'll have a small "house rule" tag. Right now: Frightened, Panicked, Nauseated (these all let you keep fighting with stiffer penalties instead of forcing you to flee/puke).

Click a condition to set a duration in rounds. Click the **−1 round** button to tick down each round (auto-removes at 0). Click **✕** to remove.

### Resource pools

Left card on the bar. **+ Add pool** for things like Ki, Mythic Power, Arcane Pool, Grit, Panache.

- **−1** when you spend a point
- **+1** to undo
- **↺** to reset to max
- Per-day pools reset automatically on Long Rest

---

## Cool Stuff cards

Your signature abilities. Each card:

| Action | What it does |
|---|---|
| **−1** | Spend a use (Lay on Hands, Channel, Stonestrike, etc.) |
| **+1** | Restore a use (undo a spend) |
| **↺** | Reset to max (e.g., between scenes) |
| **⠿** | Drag handle on the left — reorder cards by dragging |
| **✎** | Edit the card (name, description, uses, action type, etc.) |
| **✕** | Park the card (hides from the grid) |

Click **+ New ability** at the top of the Cool Stuff section to add your own card. Or ask William and he'll add one with the proper rules text + uses-per-day already filled in.

**Parked cards** sit at the bottom in a collapsible section. Click any parked card to restore it. Useful for things like Korroc's *Detect Evil* — it's there if needed, but it's not cluttering the grid when it's not.

---

## Saving

Don't think about it. Every change saves to the cloud immediately. Open the app on your phone, your laptop, your tablet — same data. Sign out and back in — still there.

---

## For GMs

- **Create party** in the Parties section on the roster
- Share the **Code** with your players (button on the party card)
- **GM →** opens the dashboard with everyone's HP, AC, conditions, and pools updated live (polls every 5s while the tab is visible)

Each player joins by either clicking your invite link or pasting the code via **Join by code**, then picking which of their characters belongs to the party.

---

## When something breaks

Tell William. Two minutes to revert a bad deploy. Your character data isn't affected by code reverts — it lives in the database.

---

That's the whole thing. Now go remember to use your swift action.
