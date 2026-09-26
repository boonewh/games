-- Per-level HP boost. max_hp remains the permanent/base maximum.
-- Apply before deploying the accompanying app changes.
begin;

alter table public.character
  add column if not exists hp_boost_per_level integer not null default 0
    check (hp_boost_per_level >= 0 and hp_boost_per_level <= 1000),
  add column if not exists hp_boost_active boolean not null default false;

-- Use a trigger so editor/PDF level changes and repeated requests obey the
-- same rule. The row update and event are one transaction. Never clamp current
-- HP to zero: ending a boost can leave a wounded character at negative HP.
create or replace function public.apply_character_hp_boost()
returns trigger language plpgsql set search_path = public as $$
declare
  old_bonus integer;
  new_bonus integer;
begin
  if new.hp_boost_active and
     (new.level is null or new.level <= 0 or new.hp_boost_per_level <= 0) then
    raise exception 'Set a positive character level and HP per level before enabling HP boost'
      using errcode = '23514';
  end if;

  old_bonus := case when old.hp_boost_active
    then old.hp_boost_per_level * greatest(coalesce(old.level, 0), 0) else 0 end;
  new_bonus := case when new.hp_boost_active
    then new.hp_boost_per_level * new.level else 0 end;

  new.current_hp := new.current_hp + new_bonus - old_bonus;
  if new_bonus <> old_bonus or new.hp_boost_active <> old.hp_boost_active then
    insert into public.hp_event
      (character_id, kind, raw_amount, applied_amount, note)
    values (new.id, 'hp_boost', new_bonus, new_bonus - old_bonus,
      case when new.hp_boost_active then 'HP boost updated' else 'HP boost ended' end);
  end if;
  return new;
end;
$$;

drop trigger if exists character_hp_boost on public.character;
create trigger character_hp_boost
  before update of level, hp_boost_per_level, hp_boost_active on public.character
  for each row execute function public.apply_character_hp_boost();

commit;
