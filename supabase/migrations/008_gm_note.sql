-- =============================================================================
-- Migration 008 — GM private note per character
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- A free-text note the DM keeps on each character, shown + edited ONLY on the
-- GM dashboard. It lives in its own table (rather than a character column) so
-- it is structurally impossible to leak into the player-facing character GET,
-- which returns `select(*)`. The dashboard endpoint (GM-gated) is the only
-- reader; a dedicated GM-only PUT is the only writer.
--
-- One row per character (character_id is the PK).
-- =============================================================================

create table if not exists gm_note (
  character_id uuid primary key references character(id) on delete cascade,
  body         text,
  updated_at   timestamptz not null default now()
);

alter table gm_note enable row level security;
