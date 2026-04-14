-- Create claims table
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diagnosis text not null,
  amount numeric(12, 2) not null,
  status text default 'submitted',
  hospital text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.claims enable row level security;

-- Allow users to view their own claims
create policy "claims_select_own" on public.claims 
  for select using (auth.uid() = user_id);

-- Allow users to insert their own claims
create policy "claims_insert_own" on public.claims 
  for insert with check (auth.uid() = user_id);

-- Allow users to update their own claims
create policy "claims_update_own" on public.claims 
  for update using (auth.uid() = user_id);

-- Allow admins/hospitals/insurers to view and update all claims
create policy "claims_select_admin" on public.claims 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'hospital', 'insurer')
    )
  );

create policy "claims_update_admin" on public.claims 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'hospital', 'insurer')
    )
  );
