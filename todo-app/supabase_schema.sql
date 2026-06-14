-- TaskFlow Supabase Schema Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/editor)

-- 1. Create categories table
create table if not exists categories (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at bigint not null
);

-- 2. Create todos table
create table if not exists todos (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  completed boolean default false not null,
  priority text default 'medium' not null,
  category_id text references categories(id) on delete set null,
  due_date bigint,
  subtasks jsonb default '[]'::jsonb not null,
  created_at bigint not null,
  updated_at bigint not null,
  completed_at bigint,
  order_index integer default 0 not null,
  roadmap_phase text
);

-- 3. Create meetings table
create table if not exists meetings (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  date text not null,
  time text not null,
  attendees text default '',
  notes text default '',
  meeting_link text default '',
  created_at bigint not null
);

-- 4. Create habits table
create table if not exists habits (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  frequency text default 'daily' not null,
  streak integer default 0 not null,
  completed_days jsonb default '[]'::jsonb not null,
  created_at bigint not null
);

-- 5. Create inspirations table
create table if not exists inspirations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  type text not null,
  content text not null,
  notes text default '',
  linked_todo_id text references todos(id) on delete set null,
  created_at bigint not null
);

-- 6. Create user profiles table
create table if not exists user_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  user_persona text default 'professional' not null,
  updated_at bigint not null
);

-- Enable Row Level Security (RLS) on all tables
alter table categories enable row level security;
alter table todos enable row level security;
alter table meetings enable row level security;
alter table habits enable row level security;
alter table inspirations enable row level security;
alter table user_profiles enable row level security;

-- Create Policies for Authenticated Users

-- Categories Policies
create policy "Users can perform all actions on their categories"
  on categories for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Todos Policies
create policy "Users can perform all actions on their todos"
  on todos for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Meetings Policies
create policy "Users can perform all actions on their meetings"
  on meetings for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Habits Policies
create policy "Users can perform all actions on their habits"
  on habits for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inspirations Policies
create policy "Users can perform all actions on their inspirations"
  on inspirations for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User Profiles Policies
create policy "Users can perform all actions on their profile"
  on user_profiles for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
