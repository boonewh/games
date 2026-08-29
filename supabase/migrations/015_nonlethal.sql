-- Nonlethal damage (migration 015).
--
-- character.nonlethal already exists; what was missing is the ability to APPLY
-- nonlethal damage and to undo it. Undo replays an hp_event backwards, so every
-- event now records how much it moved the nonlethal pool:
--
--   nonlethal damage  → +N   (kind = 'nonlethal')
--   heal              → -N   (PF1e: healing hp removes an equal amount of nonlethal)
--   full heal         → -N   (clears the pool)
--
-- Undo subtracts nonlethal_delta, so one rule covers every kind. Existing rows
-- default to 0, which is correct — none of them touched nonlethal.

alter table hp_event add column if not exists nonlethal_delta integer not null default 0;
