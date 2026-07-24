-- Multiple named spell penetration entries per character (migration 014).
-- Mirrors spell_dc_entry (migration 012): a caster can track several CL-check
-- bonuses vs spell resistance (e.g. base, vs a specific creature, greater SP).

create table if not exists spell_pen_entry (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid not null references character(id) on delete cascade,
  name         text not null,
  bonus        integer not null,
  notes        text,
  sort_order   integer not null default 0
);
create index if not exists spell_pen_entry_character_idx on spell_pen_entry (character_id, sort_order);

-- Seed from existing single spell_penetration value so existing characters
-- keep their number as the first entry.
insert into spell_pen_entry (character_id, name, bonus, sort_order)
select id, 'Spell Pen', spell_penetration, 0
from character
where spell_penetration is not null;

alter table spell_pen_entry enable row level security;
