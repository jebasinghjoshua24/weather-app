-- ─────────────────────────────────────────────────────────────
-- 0001_init.sql — Core schema with Row-Level Security (RLS)
-- Why RLS: even though the Supabase anon key is public (it ships in the
-- browser), RLS means the database ONLY returns rows where
-- `auth.uid() = user_id`. An attacker who steals the anon key still
-- cannot read or write another user's data.
-- Think: the anon key is a locker key that only opens YOUR locker.
-- ─────────────────────────────────────────────────────────────

-- =============================================================
-- 1. profiles — one row per auth user (settings + GDPR consent)
-- =============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  unit text not null default 'celsius' check (unit in ('celsius', 'fahrenheit')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  -- GDPR consent record (timestamp = proof of consent)
  consent_granted boolean not null default false,
  consent_timestamp timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profile is created automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS: users can only read/update their own profile
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- =============================================================
-- 2. saved_locations — user's saved/favorite cities
-- =============================================================
create table if not exists public.saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  lat double precision not null,
  lon double precision not null,
  country text,
  is_favorite boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name, lat, lon)
);

alter table public.saved_locations enable row level security;

create policy "saved_locations_select_own" on public.saved_locations
  for select using (auth.uid() = user_id);

create policy "saved_locations_insert_own" on public.saved_locations
  for insert with check (auth.uid() = user_id);

create policy "saved_locations_update_own" on public.saved_locations
  for update using (auth.uid() = user_id);

create policy "saved_locations_delete_own" on public.saved_locations
  for delete using (auth.uid() = user_id);

-- =============================================================
-- 3. weather_history — the "Weather History Diary" (#21)
-- =============================================================
create table if not exists public.weather_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  location jsonb not null,          -- {name, lat, lon, country, timezone}
  snapshot jsonb not null,          -- the weather snapshot at that time
  mood text,                        -- optional user mood note
  note text,                        -- optional user note
  created_at timestamptz not null default now()
);

alter table public.weather_history enable row level security;

create policy "weather_history_select_own" on public.weather_history
  for select using (auth.uid() = user_id);

create policy "weather_history_insert_own" on public.weather_history
  for insert with check (auth.uid() = user_id);

create policy "weather_history_update_own" on public.weather_history
  for update using (auth.uid() = user_id);

create policy "weather_history_delete_own" on public.weather_history
  for delete using (auth.uid() = user_id);

-- Index for fast "recent entries" queries
create index if not exists weather_history_user_created_idx
  on public.weather_history (user_id, created_at desc);

-- =============================================================
-- 4. GDPR retention: auto-purge old diary entries after 12 months
-- =============================================================
-- pg_cron runs nightly and deletes entries older than 365 days.
-- Why: GDPR storage limitation (Art 5(1)(e)) — don't keep data forever.
-- NOTE: requires the `pg_cron` extension (enable in Supabase dashboard →
-- Database → Extensions → pg_cron). Wrapped so the migration still applies
-- if the extension is not yet enabled.
create or replace function public.purge_old_weather_history()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.weather_history
  where created_at < now() - interval '365 days';
end;
$$;

do $do_block$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'purge-old-weather-history',
      '0 3 * * *',
      'select public.purge_old_weather_history()'
    );
  end if;
end;
$do_block$;

-- =============================================================
-- 5. GDPR erasure: deleting the auth user cascades to all their data
-- =============================================================
-- Because every table has `references auth.users (id) on delete cascade`,
-- running `delete from auth.users where id = X` automatically removes the
-- profile, saved locations, and diary. Handled by the "Delete Account"
-- feature (Phase 4) using the service role.

-- =============================================================
-- 6. helper: get current user's id (used by RLS elsewhere if needed)
-- =============================================================
create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

-- Harden SECURITY DEFINER functions — revoke PUBLIC execute (F1)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
revoke execute on function public.purge_old_weather_history() from public, anon, authenticated;
grant execute on function public.purge_old_weather_history() to service_role;
revoke execute on function public.current_user_id() from public, anon, authenticated;
grant execute on function public.current_user_id() to authenticated, service_role;
