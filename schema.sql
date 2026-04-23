-- ============================================
-- Sign It: Messaging & Summarization Schema
-- ============================================

-- 1) Threads (conversations)
-- Can be 1:1 (user + AI) or group discussions
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thread_type text not null default 'individual', -- 'individual' or 'group'
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.threads enable row level security;

-- 2) Thread membership (who can read/write)
create table if not exists public.thread_members (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member', -- 'admin', 'member'
  joined_at timestamptz not null default now(),

  unique(thread_id, user_id)
);

alter table public.thread_members enable row level security;

-- 3) Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- 4) Summaries (OpenAI output - per user)
-- Different summaries for different users (personalized)
create table if not exists public.message_summaries (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  summary_for_user uuid not null references auth.users(id) on delete cascade,

  summary text not null,
  key_points jsonb not null default '[]'::jsonb,
  focus_area text, -- e.g., 'learning', 'progress', 'areas_to_improve'

  last_message_id uuid references public.messages(id) on delete set null,
  last_message_at timestamptz,

  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.message_summaries enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Thread Members Policies
create policy "thread_members: select own memberships"
on public.thread_members
for select
to authenticated
using (user_id = auth.uid());

create policy "thread_members: select thread members"
on public.thread_members
for select
to authenticated
using (
  exists (
    select 1 from public.thread_members tm
    where tm.thread_id = thread_members.thread_id
      and tm.user_id = auth.uid()
  )
);

create policy "thread_members: join yourself"
on public.thread_members
for insert
to authenticated
with check (user_id = auth.uid());

create policy "thread_members: leave yourself"
on public.thread_members
for delete
to authenticated
using (user_id = auth.uid());

-- Threads Policies
create policy "threads: members can read"
on public.threads
for select
to authenticated
using (
  exists (
    select 1 from public.thread_members tm
    where tm.thread_id = threads.id
      and tm.user_id = auth.uid()
  )
);

create policy "threads: creator can insert"
on public.threads
for insert
to authenticated
with check (created_by = auth.uid());

create policy "threads: members can update"
on public.threads
for update
to authenticated
using (
  exists (
    select 1 from public.thread_members tm
    where tm.thread_id = threads.id
      and tm.user_id = auth.uid()
      and tm.role = 'admin'
  )
);

-- Messages Policies
create policy "messages: thread members can read"
on public.messages
for select
to authenticated
using (
  exists (
    select 1 from public.thread_members tm
    where tm.thread_id = messages.thread_id
      and tm.user_id = auth.uid()
  )
);

create policy "messages: sender can insert"
on public.messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.thread_members tm
    where tm.thread_id = messages.thread_id
      and tm.user_id = auth.uid()
  )
);

create policy "messages: sender can delete"
on public.messages
for delete
to authenticated
using (user_id = auth.uid());

create policy "messages: sender can update"
on public.messages
for update
to authenticated
using (user_id = auth.uid());

-- Message Summaries Policies
create policy "summaries: thread members can read"
on public.message_summaries
for select
to authenticated
using (
  summary_for_user = auth.uid()
  or exists (
    select 1 from public.thread_members tm
    where tm.thread_id = message_summaries.thread_id
      and tm.user_id = auth.uid()
  )
);

create policy "summaries: thread member can insert own summary"
on public.message_summaries
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.thread_members tm
    where tm.thread_id = message_summaries.thread_id
      and tm.user_id = auth.uid()
  )
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_messages_thread_created_at 
  on public.messages(thread_id, created_at desc);

create index if not exists idx_thread_members_user_id 
  on public.thread_members(user_id);

create index if not exists idx_thread_members_thread_id 
  on public.thread_members(thread_id);

create index if not exists idx_summaries_thread_created_at 
  on public.message_summaries(thread_id, created_at desc);

create index if not exists idx_summaries_user_created_at 
  on public.message_summaries(summary_for_user, created_at desc);
