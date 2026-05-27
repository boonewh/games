-- =============================================================================
-- Migration 003 — Resource pools
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- For things like Ki, Arcane Pool, Grit, Panache, Mythic Power, etc. —
-- a single pool that multiple abilities can deduct from.
-- Naming parallels ability.uses_remaining / uses_max for code symmetry.
-- =============================================================================

create table if not exists resource_pool (
  id               uuid primary key default gen_random_uuid(),
  character_id     uuid not null references character(id) on delete cascade,
  name             text not null,            -- "Ki Pool", "Arcane Pool", "Mythic Power"
  points_remaining integer not null default 0,
  points_max       integer not null,
  recharge         text,                      -- 'per_day' | 'per_encounter' | 'manual'
  notes            text,                      -- e.g. "1 to flurry, 2 to stun"
  sort_order       integer not null default 0
);

create index if not exists pool_character_idx on resource_pool (character_id, sort_order);

alter table resource_pool enable row level security;
