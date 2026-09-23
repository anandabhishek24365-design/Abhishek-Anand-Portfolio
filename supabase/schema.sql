-- Create contact_messages table for storing contact form submissions
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  subject text not null check (char_length(subject) between 1 and 200),
  message text not null check (char_length(message) between 20 and 5000),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.contact_messages enable row level security;

-- Drop existing policies if any
drop policy if exists "Allow public contact message insert" on public.contact_messages;
drop policy if exists "Allow message reading" on public.contact_messages;

-- Create policy allowing anyone (anonymous or authenticated) to submit contact form messages
create policy "Allow public contact message insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Create policy allowing reading of messages
create policy "Allow message reading"
  on public.contact_messages
  for select
  to anon, authenticated
  using (true);

