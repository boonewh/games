-- =============================================================================
-- Migration 002 — AC tracking
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent (IF NOT EXISTS), safe to re-run.
--
-- Layer 1 only: three nullable columns on character. Existing rows get NULL,
-- meaning "not set yet"; UI shows "—" until the player fills them in.
-- =============================================================================

alter table character add column if not exists ac              integer;
alter table character add column if not exists ac_touch        integer;
alter table character add column if not exists ac_flat_footed  integer;
