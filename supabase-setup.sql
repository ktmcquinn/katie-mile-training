-- Katie's Mile Training - Supabase schema
-- Run this once in your Supabase project's SQL Editor (New query → paste → Run).
-- Creates five tables and Row Level Security policies so each authenticated
-- user can only read/write their own training data.
-- Re-running this script is safe — it uses "create if not exists" and
-- drops/recreates the RLS policies so it's idempotent.

-- =========================================================================
-- 1) workouts: one row per logged workout (date, distance, pace, RPE, etc.)
-- =========================================================================
create table if not exists public.workouts (
  user_id                uuid not null references auth.users(id) on delete cascade,
  date                   date not null,
  distance               numeric,
  duration_seconds       integer,
  pace_seconds_per_mile  numeric,
  pace_label             text,
  rpe                    smallint check (rpe between 1 and 10),
  heart_rate             integer,
  notes                  text,
  logged_at              timestamptz default now(),
  primary key (user_id, date)
);

-- =========================================================================
-- 2) completions: per-day section checkmarks (sections stored as JSONB)
-- =========================================================================
create table if not exists public.completions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  sections   jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, date)
);

-- =========================================================================
-- 3) weights: weight log entries
-- =========================================================================
create table if not exists public.weights (
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  weight     numeric not null,
  body_fat   numeric,
  logged_at  timestamptz default now(),
  primary key (user_id, date)
);

-- =========================================================================
-- 4) day_overrides: workout swaps (when you drag-and-drop to rearrange)
-- =========================================================================
create table if not exists public.day_overrides (
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  title      text,
  detail     text,
  routines   jsonb,
  strength   text,
  updated_at timestamptz default now(),
  primary key (user_id, date)
);

-- =========================================================================
-- 5) exercise_logs: per-exercise tracking inside strength + mobility routines.
-- routine_key examples: "strength_A_full_gym", "strength_B_home", "pre_run".
-- exercise_key examples: "back_squat", "single_leg_rdl", "couch_stretch".
-- =========================================================================
create table if not exists public.exercise_logs (
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  routine_key   text not null,
  exercise_key  text not null,
  completed     boolean default false,
  weight        numeric,
  reps          integer,
  notes         text,
  updated_at    timestamptz default now(),
  primary key (user_id, date, routine_key, exercise_key)
);

-- =========================================================================
-- Row Level Security (RLS): each user sees only their own data
-- =========================================================================
alter table public.workouts      enable row level security;
alter table public.completions   enable row level security;
alter table public.weights       enable row level security;
alter table public.day_overrides enable row level security;
alter table public.exercise_logs enable row level security;

-- Drop any existing policies so this script is idempotent
drop policy if exists "own_workouts_select" on public.workouts;
drop policy if exists "own_workouts_modify" on public.workouts;
drop policy if exists "own_completions_select" on public.completions;
drop policy if exists "own_completions_modify" on public.completions;
drop policy if exists "own_weights_select" on public.weights;
drop policy if exists "own_weights_modify" on public.weights;
drop policy if exists "own_overrides_select" on public.day_overrides;
drop policy if exists "own_overrides_modify" on public.day_overrides;
drop policy if exists "own_exercise_logs_select" on public.exercise_logs;
drop policy if exists "own_exercise_logs_modify" on public.exercise_logs;

-- Recreate policies: users can SELECT their own rows and INSERT/UPDATE/DELETE
-- only rows where user_id matches their auth uid.
create policy "own_workouts_select" on public.workouts
  for select using (auth.uid() = user_id);
create policy "own_workouts_modify" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_completions_select" on public.completions
  for select using (auth.uid() = user_id);
create policy "own_completions_modify" on public.completions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_weights_select" on public.weights
  for select using (auth.uid() = user_id);
create policy "own_weights_modify" on public.weights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_overrides_select" on public.day_overrides
  for select using (auth.uid() = user_id);
create policy "own_overrides_modify" on public.day_overrides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_exercise_logs_select" on public.exercise_logs
  for select using (auth.uid() = user_id);
create policy "own_exercise_logs_modify" on public.exercise_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- Done! You can now connect the app from the Cloud Sync section.
-- =========================================================================
