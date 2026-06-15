-- User-defined sections for ability cards (migration 011).
-- Each character can have named sections; abilities get an optional section_id.
-- Deleting a section sets section_id to null (abilities drop to "Unsorted").

create table if not exists ability_section (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid not null references character(id) on delete cascade,
  name         text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists ability_section_character_idx on ability_section (character_id, sort_order);

alter table ability add column if not exists section_id uuid references ability_section(id) on delete set null;

alter table ability_section enable row level security;
