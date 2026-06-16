-- Multiple named spell DCs per character (migration 012).

create table if not exists spell_dc_entry (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid not null references character(id) on delete cascade,
  name         text not null,
  dc           integer not null,
  notes        text,
  sort_order   integer not null default 0
);
create index if not exists spell_dc_entry_character_idx on spell_dc_entry (character_id, sort_order);

-- Seed from existing single spell_dc value so existing characters keep their number.
insert into spell_dc_entry (character_id, name, dc, sort_order)
select id, 'Spell DC', spell_dc, 0
from character
where spell_dc is not null;

alter table spell_dc_entry enable row level security;
