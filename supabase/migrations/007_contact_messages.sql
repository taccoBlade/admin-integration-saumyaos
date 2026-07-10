-- Create contact_messages table
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read_status boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Policies
-- Anyone can insert a new message
create policy "Anyone can insert contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

-- Only authenticated admins can view and update messages
create policy "Admins can view contact messages"
on public.contact_messages
for select
to authenticated
using (
  auth.uid() in (
    select auth_user_id from public.admin_profile where role = 'owner'
  )
);

create policy "Admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (
  auth.uid() in (
    select auth_user_id from public.admin_profile where role = 'owner'
  )
);

create policy "Admins can delete contact messages"
on public.contact_messages
for delete
to authenticated
using (
  auth.uid() in (
    select auth_user_id from public.admin_profile where role = 'owner'
  )
);
