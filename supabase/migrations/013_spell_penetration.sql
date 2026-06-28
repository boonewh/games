-- Spell penetration bonus: the CL check modifier vs spell resistance.
-- Nullable because not every character is a caster.
alter table character add column spell_penetration integer;
