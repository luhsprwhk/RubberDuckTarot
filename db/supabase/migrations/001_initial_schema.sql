-- RLS is already enabled on auth.users by default

-- Create cards table
create table public.cards (
  id integer primary key,
  name text not null,
  emoji text not null,
  traditional_equivalent text not null,
  core_meaning text not null,
  duck_question text not null,
  visual_description text not null,
  perspective_prompts jsonb not null,
  block_applications jsonb not null,
  duck_wisdom text not null,
  reversed_meaning text not null,
  tags jsonb not null
);

-- Create block_types table
create table public.block_types (
  id text primary key,
  name text not null,
  description text not null,
  emoji text not null
);

-- Create users table
create table public.users (
  id text primary key,
  created_at timestamp with time zone not null default now(),
  preferences jsonb
);

-- Create readings table
create table public.readings (
  id serial primary key,
  user_id text references public.users(id),
  spread_type text not null check (spread_type in ('quick-draw', 'full-pond')),
  block_type_id text not null references public.block_types(id),
  user_context text,
  cards_drawn jsonb not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on all tables
alter table public.cards enable row level security;
alter table public.block_types enable row level security;
alter table public.users enable row level security;
alter table public.readings enable row level security;

-- Create policies for cards and block_types (public read access)
create policy "Allow public read access on cards" on public.cards
  for select using (true);

create policy "Allow public read access on block_types" on public.block_types
  for select using (true);

-- Create policies for users (users can only access their own data)
create policy "Users can view their own profile" on public.users
  for select using (auth.uid()::text = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid()::text = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid()::text = id);

-- Create policies for readings (users can only access their own readings)
create policy "Users can view their own readings" on public.readings
  for select using (auth.uid()::text = user_id);

create policy "Users can insert their own readings" on public.readings
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update their own readings" on public.readings
  for update using (auth.uid()::text = user_id);

-- Allow anonymous readings (where user_id is null)
create policy "Allow anonymous readings" on public.readings
  for all using (user_id is null);