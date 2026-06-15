-- =============================================================================
-- Migration 010 — Mythic path & tier
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotent.
--
-- Wrath of the Righteous adds a parallel mythic progression. We capture it as:
--   mythic_path  — the path name(s). Free text so a single field handles a
--                  Dual Path character: e.g. "Hierophant / Guardian".
--   mythic_tier  — the shared mythic tier (1-10). Dual Path does NOT grant
--                  separate tiers, so one number covers both paths.
--
-- Hero Lab is inconsistent about printing the path (some sheets name it in the
-- class line, some only imply it via mythic abilities), so both fields are
-- nullable and editable by hand on the character editor.
-- =============================================================================

alter table character
  add column if not exists mythic_path text,
  add column if not exists mythic_tier integer;
