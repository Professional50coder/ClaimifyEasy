-- Create profiles table for user metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text default 'patient',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Allow users to view their own profile
create policy "profiles_select_own" on public.profiles 
  for select using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "profiles_insert_own" on public.profiles 
  for insert with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id);

-- Allow admins to view all profiles
create policy "profiles_select_admin" on public.profiles 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );
