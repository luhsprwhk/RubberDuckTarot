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

-- Create users table with premium flag
create table public.users (
  id text primary key,
  created_at timestamp with time zone not null default now(),
  preferences jsonb,
  premium boolean not null default false,
  auth_uid text not null unique
);

-- Create user_profiles table for detailed user information
create table public.user_profiles (
  id serial primary key,
  user_id text not null references public.users(id) on delete cascade,
  name text not null,
  birthday text not null,
  birth_place text not null,
  profession jsonb not null,
  debugging_mode text not null,
  block_pattern text not null,
  superpower text not null,
  kryptonite text not null,
  spirit_animal text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique(user_id)
);

-- Create insights table (renamed from readings, with reading column)
create table public.insights (
  id serial primary key,
  user_id text references public.users(id) on delete set null,
  spread_type text not null check (spread_type in ('quick-draw', 'full-pond')),
  block_type_id text not null references public.block_types(id),
  user_context text,
  cards_drawn jsonb not null,
  reading jsonb not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS on all tables
alter table public.cards enable row level security;
alter table public.block_types enable row level security;
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.insights enable row level security;

-- Create policies for cards and block_types (public read access)
create policy "Allow public read access on cards" on public.cards
  for select using (true);

create policy "Allow public read access on block_types" on public.block_types
  for select using (true);

-- Create policies for users (users can only access their own data)
create policy "Users can view their own profile" on public.users
  for select using (auth.uid()::text = auth_uid);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid()::text = auth_uid);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid()::text = auth_uid);

-- Create policies for user_profiles (users can only access their own profiles)
create policy "Users can view their own user_profile" on public.user_profiles
  for select using (auth.uid()::text = user_id);

create policy "Users can update their own user_profile" on public.user_profiles
  for update using (auth.uid()::text = user_id);

create policy "Users can insert their own user_profile" on public.user_profiles
  for insert with check (auth.uid()::text = user_id);

-- Create policies for insights (users can only access their own insights)
create policy "Users can view their own insights" on public.insights
  for select using (auth.uid()::text = user_id);

create policy "Users can insert their own insights" on public.insights
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update their own insights" on public.insights
  for update using (auth.uid()::text = user_id);

-- Allow anonymous insights (where user_id is null)
create policy "Allow anonymous insights" on public.insights
  for all using (user_id is null);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, auth_uid)
  values (new.id, new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create user record
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();