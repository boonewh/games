-- Regression checks for migration 016. Run against a migrated disposable DB.
-- Everything below rolls back, including the fixture profile and character.
begin;
do $$
declare
  cid uuid;
  c public.character%rowtype;
  event_count integer;
begin
  insert into public.user_profile(user_id) values ('hp-boost-regression');
  insert into public.character(user_id, name, level, max_hp, current_hp, temp_hp, nonlethal)
    values ('hp-boost-regression', 'Boost test', 10, 100, 65, 7, 3) returning id into cid;

  update public.character set hp_boost_per_level = 2 where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = 65 and not c.hp_boost_active, 'Saving an inactive rate changed HP';

  update public.character set hp_boost_active = true where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = 85 and c.max_hp = 100 and c.temp_hp = 7 and c.nonlethal = 3,
    'Activation must change only real current HP';

  select count(*) into event_count from public.hp_event where character_id = cid;
  update public.character set hp_boost_active = true where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = 85, 'Repeated activation stacked the boost';
  assert (select count(*) from public.hp_event where character_id = cid) = event_count,
    'Repeated activation created a spurious event';

  update public.character set current_hp = current_hp - 15 where id = cid;
  update public.character set hp_boost_active = false where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = 50 and c.hp_boost_per_level = 2, 'Ending must preserve damage and saved rate';
  update public.character set hp_boost_active = false where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = 50, 'Repeated deactivation subtracted twice';

  update public.character set hp_boost_active = true where id = cid;
  update public.character set level = 11 where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = 72 and c.max_hp = 100, 'Level change lost the base or damage';
  update public.character set hp_boost_per_level = 3 where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = 83, 'Active rate change must apply only the difference';

  update public.character set current_hp = 5 where id = cid;
  update public.character set hp_boost_active = false where id = cid;
  select * into c from public.character where id = cid;
  assert c.current_hp = -28, 'Ending the boost incorrectly clamped negative HP';

  update public.character set level = null where id = cid;
  begin
    update public.character set hp_boost_active = true where id = cid;
    raise exception 'Missing level should reject activation';
  exception when check_violation then null;
  end;
  select * into c from public.character where id = cid;
  assert not c.hp_boost_active and c.current_hp = -28, 'Failed activation was not atomic';

  begin
    update public.character set hp_boost_per_level = -1 where id = cid;
    raise exception 'Negative rate should be rejected';
  exception when check_violation then null;
  end;
end;
$$;
rollback;
