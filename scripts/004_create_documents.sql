-- Create documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_id uuid references public.claims(id) on delete cascade,
  name text not null,
  content text,
  mime_type text,
  uploaded_at timestamp with time zone default now()
);

alter table public.documents enable row level security;

-- Allow users to view their own documents
create policy "documents_select_own" on public.documents 
  for select using (auth.uid() = user_id);

-- Allow users to insert their own documents
create policy "documents_insert_own" on public.documents 
  for insert with check (auth.uid() = user_id);

-- Allow admins to view all documents
create policy "documents_select_admin" on public.documents 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role = 'admin'
    )
  );
