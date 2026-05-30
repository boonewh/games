-- =============================================================================
-- Pathfinder Companion (tracker) schema — v1
--
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every CREATE uses IF NOT EXISTS / OR REPLACE where possible,
-- but most tables will already exist after the first run. For a clean reset,
-- drop the tables in reverse-dependency order first.
--
-- Auth model: NextAuth (Google + credentials) is the identity system.
-- user_profile.user_id mirrors NextAuth's session.user.id (a stable string).
-- All API access goes through Next.js server code using the service-role key,
-- so RLS is enabled with no policies (anon sees nothing; service role bypasses).
-- =============================================================================

-- Supabase has pgcrypto pre-enabled, but be explicit for portability.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- App-side mirror of NextAuth users.
-- Lazily upserted by the tracker on first use; no FK back to NextAuth's KV.
-- ---------------------------------------------------------------------------
create table if not exists user_profile (
  user_id      text primary key,
  display_name text,
  is_gm        boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- A party = a campaign + a GM + a set of player characters.
-- Players join via invite_code.
-- ---------------------------------------------------------------------------
create table if not exists party (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  campaign_key text not null default 'wrath',
  gm_user_id   text not null references user_profile(user_id) on delete restrict,
  invite_code  text unique,
  created_at   timestamptz not null default now()
);

create table if not exists party_member (
  party_id  uuid not null references party(id) on delete cascade,
  user_id   text not null references user_profile(user_id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (party_id, user_id)
);

-- ---------------------------------------------------------------------------
-- The character.
-- ---------------------------------------------------------------------------
create table if not exists character (
  id                    uuid primary key default gen_random_uuid(),
  user_id               text not null references user_profile(user_id) on delete cascade,
  party_id              uuid references party(id) on delete set null,
  campaign_key          text not null default 'wrath',
  name                  text not null,
  class_summary         text,
  level                 integer,
  max_hp                integer not null,
  current_hp            integer not null,
  temp_hp               integer not null default 0,
  nonlethal             integer not null default 0,
  fortification_percent integer not null default 0,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists character_user_idx     on character (user_id);
create index if not exists character_party_idx    on character (party_id);
create index if not exists character_campaign_idx on character (campaign_key);

-- ---------------------------------------------------------------------------
-- Defenses
-- ---------------------------------------------------------------------------
create table if not exists damage_reduction (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid not null references character(id) on delete cascade,
  amount       integer not null,
  bypass       text not null,
  enabled      boolean not null default true
);
create index if not exists dr_character_idx on damage_reduction (character_id);

create table if not exists energy_resistance (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid not null references character(id) on delete cascade,
  energy_type  text not null,
  amount       integer not null,
  enabled      boolean not null default true
);
create index if not exists resist_character_idx on energy_resistance (character_id);

create table if not exists energy_vulnerability (
  id           uuid primary key default gen_random_uuid(),
  character_id uuid not null references character(id) on delete cascade,
  energy_type  text not null,
  enabled      boolean not null default true
);
create index if not exists vuln_character_idx on energy_vulnerability (character_id);

-- ---------------------------------------------------------------------------
-- HP event log (append-only; undo writes new 'undo' rows rather than deleting)
-- ---------------------------------------------------------------------------
create table if not exists hp_event (
  id              uuid primary key default gen_random_uuid(),
  character_id    uuid not null references character(id) on delete cascade,
  ts              timestamptz not null default now(),
  kind            text not null,   -- damage|heal|temp_hp|nonlethal|rest|undo
  raw_amount      integer not null,
  applied_amount  integer not null,
  damage_type     text,             -- physical|fire|cold|electricity|acid|sonic|null
  dr_applied      integer not null default 0,
  temp_consumed   integer not null default 0,  -- of applied_amount, how much temp HP absorbed (for undo)
  note            text
);
create index if not exists hp_event_character_idx on hp_event (character_id, id desc);

-- ---------------------------------------------------------------------------
-- "Cool stuff" abilities. Schema is intentionally generic.
-- ---------------------------------------------------------------------------
create table if not exists ability (
  id             uuid primary key default gen_random_uuid(),
  character_id   uuid not null references character(id) on delete cascade,
  name           text not null,
  category       text not null,    -- class_feature|feat|spell|sla|item|reminder
  action_type    text,              -- free|swift|move|standard|full|immediate|reaction|passive
  description    text,
  uses_max       integer,
  uses_remaining integer,
  recharge       text,              -- per_day|per_encounter|per_round|manual
  enabled        boolean not null default true,
  sort_order     integer not null default 0
);
create index if not exists ability_character_idx on ability (character_id, sort_order);

-- ---------------------------------------------------------------------------
-- Conditions currently affecting the character (PF1e: shaken, prone, fatigued, etc.)
-- ---------------------------------------------------------------------------
create table if not exists condition (
  id              uuid primary key default gen_random_uuid(),
  character_id    uuid not null references character(id) on delete cascade,
  type            text not null,         -- shaken|frightened|panicked|sickened|nauseated|dazzled|blinded|deafened|dazed|stunned|paralyzed|prone|grappled|pinned|entangled|fatigued|exhausted|staggered|unconscious|dying|...
  duration_rounds integer,                -- null = indefinite
  notes           text,
  applied_at      timestamptz not null default now()
);
create index if not exists condition_character_idx on condition (character_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for character (other tables don't need it for now)
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists character_set_updated_at on character;
create trigger character_set_updated_at
  before update on character
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: enable on every table, no policies.
-- Service-role key (used by our Next.js API routes) bypasses RLS entirely.
-- The publishable/anon key sees nothing. Defense in depth.
-- ---------------------------------------------------------------------------
alter table user_profile          enable row level security;
alter table party                 enable row level security;
alter table party_member          enable row level security;
alter table character             enable row level security;
alter table damage_reduction      enable row level security;
alter table energy_resistance     enable row level security;
alter table energy_vulnerability  enable row level security;
alter table hp_event              enable row level security;
alter table ability               enable row level security;
alter table condition             enable row level security;
