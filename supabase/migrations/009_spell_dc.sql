-- =============================================================================
-- Migration 009 — Spell DC
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- Single spell save DC per character. In this campaign ALL spells (every level)
-- use the caster's highest DC, so one number on the character is enough — no
-- need to track a DC per spell or per spell level. Surfaced on the player combat
-- screen (next to AC) and the GM dashboard. Nullable — non-casters leave it blank.
-- =============================================================================

alter table character
  add column if not exists spell_dc integer;
