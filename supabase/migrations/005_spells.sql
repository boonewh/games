-- =============================================================================
-- Migration 005 — Individual spell tracking
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- Spells live in their own table because they have richer metadata than
-- generic abilities (level, casting class, school) and prepared casters
-- need separate prepared_count / cast_count tracking. The existing
-- "X 1st-level spells" ability cards on the HP panel remain the slot
-- counter; this table is the source of truth for WHICH spells you know
-- or have prepared, and (for prepared) which you've cast today.
-- =============================================================================

create table if not exists spell (
  id              uuid primary key default gen_random_uuid(),
  character_id    uuid not null references character(id) on delete cascade,
  name            text not null,
  level           integer not null check (level >= 0 and level <= 9),
  casting_class   text not null,        -- 'paladin' | 'oracle' | 'wizard' | etc.
  school          text,                  -- evocation, conjuration, ...
  description     text,                  -- short rules text from PDF or manual entry
  prepared_count  integer,               -- null = spontaneous (no preparation); N = prepared N times today
  cast_count      integer not null default 0,
  notes           text,
  sort_order      integer not null default 0
);

create index if not exists spell_character_idx
  on spell (character_id, casting_class, level, sort_order);

alter table spell enable row level security;
