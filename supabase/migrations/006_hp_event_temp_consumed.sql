-- =============================================================================
-- Migration 006 — Track temp HP consumed per damage event
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- Damage can be partly absorbed by temp HP before spilling into current HP.
-- The append-only undo path needs to know how that split fell so it can
-- restore BOTH halves (temp + current) instead of dumping the whole hit back
-- onto current HP. Without this, undoing a temp-absorbed hit over-heals current
-- HP and silently loses the temp pool. Defaults to 0 so every other event kind
-- (heal, temp_hp, rest, undo) and all pre-existing rows are unaffected.
-- =============================================================================

alter table hp_event
  add column if not exists temp_consumed integer not null default 0;
