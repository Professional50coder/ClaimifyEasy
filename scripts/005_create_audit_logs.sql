-- Create audit logs table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id text,
  changes jsonb,
  created_at timestamp with time zone default now()
);

alter table public.audit_logs enable row level security;

-- Only allow users to view their own audit logs
create policy "audit_logs_select_own" on public.audit_logs 
  for select using (auth.uid() = user_id);

-- Only admins can view all audit logs
create policy "audit_logs_select_admin" on public.audit_logs 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );
