-- =============================================================================
-- Migration 007 — DM-visibility character fields
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- The DM wants more detail per character than the lean player "cool stuff"
-- screen shows. These fields are surfaced on the GM dashboard (and editable in
-- the character editor); they intentionally do NOT clutter the player combat
-- screen. All nullable — fill in as you go.
--
-- NOTE: the DM's private free-text note box is a separate feature (its own
-- table + migration) so it can be structurally kept out of player-facing
-- payloads. This migration is just the stat fields.
-- =============================================================================

alter table character
  add column if not exists deity      text,
  add column if not exists alignment  text,
  add column if not exists save_fort  integer,
  add column if not exists save_ref   integer,
  add column if not exists save_will  integer,
  add column if not exists cmb        integer,
  add column if not exists cmd        integer,
  add column if not exists languages  text;
