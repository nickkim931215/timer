-- Run this in your Supabase SQL Editor

create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  duration_minutes integer not null,
  mode text check (mode in ('pomodoro','stopwatch')) default 'pomodoro',
  completed boolean default true,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  estimated_pomodoros integer default 1,
  completed_pomodoros integer default 0,
  is_done boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table focus_sessions enable row level security;
alter table tasks enable row level security;

create policy "Users can manage own sessions"
  on focus_sessions for all using (auth.uid() = user_id);

create policy "Users can manage own tasks"
  on tasks for all using (auth.uid() = user_id);
