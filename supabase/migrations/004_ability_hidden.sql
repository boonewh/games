-- =============================================================================
-- Migration 004 — Hidden (parked) ability cards
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- Adds a "hidden" flag so players can park cards they never use (e.g. Energy
-- Body for a character who skips it most sessions) and unpark them when
-- needed. Hidden cards stay in the database — they don't render in the main
-- ability grid, but show up in a collapsible "Parked" section.
-- =============================================================================

alter table ability add column if not exists hidden boolean not null default false;
