-- =====================================================
-- EcoScan AI Database Schema
-- =====================================================

create extension if not exists "pgcrypto";

-- =====================================================
-- PROFILES
-- =====================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    email text unique not null,

    full_name text,

    avatar_url text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

-- =====================================================
-- SCAN HISTORY
-- =====================================================

create table if not exists public.scan_history (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references public.profiles(id) on delete cascade,

    item_name text not null,

    category text not null,

    recyclable boolean not null,

    disposal_method text not null,

    environmental_impact text not null,

    reuse_ideas text not null,

    confidence integer not null,

    created_at timestamptz not null default now()
);

create index idx_scan_history_user
on public.scan_history(user_id);

create index idx_scan_history_created
on public.scan_history(created_at desc);

-- =====================================================
-- ECO POINTS
-- =====================================================

create table if not exists public.eco_points (
    user_id uuid primary key references public.profiles(id) on delete cascade,

    points integer not null default 0,

    level text not null default 'Beginner',

    updated_at timestamptz not null default now()
);

-- =====================================================
-- ENABLE RLS
-- =====================================================

alter table public.profiles
enable row level security;

alter table public.scan_history
enable row level security;

alter table public.eco_points
enable row level security;

-- =====================================================
-- PROFILE POLICY
-- =====================================================

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

-- =====================================================
-- SCAN HISTORY POLICY
-- =====================================================

create policy "Users can view own scans"
on public.scan_history
for select
using (auth.uid() = user_id);

create policy "Users can insert own scans"
on public.scan_history
for insert
with check (auth.uid() = user_id);

create policy "Users can delete own scans"
on public.scan_history
for delete
using (auth.uid() = user_id);

-- =====================================================
-- ECO POINTS POLICY
-- =====================================================

create policy "Users can view own points"
on public.eco_points
for select
using (auth.uid() = user_id);

create policy "Users can insert own points"
on public.eco_points
for insert
with check (auth.uid() = user_id);

create policy "Users can update own points"
on public.eco_points
for update
using (auth.uid() = user_id);
