create table if not exists public.member_records (
  sl_no text primary key,
  address text not null default '',
  establishment text not null default '',
  cell_no text not null default '',
  search_key text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists member_records_address_idx on public.member_records (address);
create index if not exists member_records_establishment_idx on public.member_records (establishment);
create index if not exists member_records_cell_no_idx on public.member_records (cell_no);
create index if not exists member_records_search_key_idx on public.member_records (search_key);

create table if not exists public.support_counter (
  key text primary key,
  count bigint not null default 121,
  updated_at timestamptz not null default now()
);

create table if not exists public.slot_counts (
  slot_key text primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.jcci_directors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_name text not null,
  business_address text not null,
  residence_address text not null,
  photo_url text not null,
  contact_number text not null,
  whatsapp_number text not null,
  email text not null,
  experience_expertise text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jcci_directors_created_at_idx on public.jcci_directors (created_at desc);

create or replace function public.increment_support_counter()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count bigint;
begin
  insert into public.support_counter (key, count)
  values ('support_count', 1)
  on conflict (key) do update
    set count = public.support_counter.count + 1,
        updated_at = now()
  returning count into next_count;

  return next_count;
end;
$$;

create or replace function public.apply_slot_delta(previous_slot text default null, next_slot text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  counts jsonb;
begin
  if previous_slot is not null then
    update public.slot_counts
    set count = greatest(count - 1, 0),
        updated_at = now()
    where slot_key = previous_slot;
  end if;

  if next_slot is not null then
    insert into public.slot_counts (slot_key, count)
    values (next_slot, 1)
    on conflict (slot_key) do update
      set count = public.slot_counts.count + 1,
          updated_at = now();
  end if;

  select coalesce(jsonb_object_agg(slot_key, count), '{}'::jsonb)
  into counts
  from public.slot_counts;

  return counts;
end;
$$;

insert into public.support_counter (key, count)
values ('support_count', 121)
on conflict (key) do update
set count = excluded.count,
    updated_at = now();

insert into public.support_counter (key, count)
values ('visitor_count', 0)
on conflict (key) do nothing;

insert into public.slot_counts (slot_key, count)
values
  ('09:00-09:15', 0),
  ('09:15-09:30', 0),
  ('09:30-09:45', 0),
  ('09:45-10:00', 0),
  ('10:00-10:15', 0),
  ('10:15-10:30', 0),
  ('10:30-10:45', 0),
  ('10:45-11:00', 0),
  ('11:00-11:15', 0),
  ('11:15-11:30', 0),
  ('11:30-11:45', 0),
  ('11:45-12:00', 0),
  ('12:00-12:15', 0),
  ('12:15-12:30', 0),
  ('12:30-12:45', 0),
  ('12:45-13:00', 0),
  ('13:00-13:15', 0),
  ('13:15-13:30', 0),
  ('13:30-13:45', 0),
  ('13:45-14:00', 0),
  ('14:00-14:15', 0),
  ('14:15-14:30', 0),
  ('14:30-14:45', 0),
  ('14:45-15:00', 0)
on conflict (slot_key) do update
set count = excluded.count,
    updated_at = now();
