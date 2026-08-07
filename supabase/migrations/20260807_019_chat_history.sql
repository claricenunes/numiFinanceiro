-- =============================================================
--  Migration 019 — Persisted chat assistant history
--  Multiple named conversations per user, server-authoritative.
--  `metadata` is the extension point for tool calls, citations,
--  structured blocks, feedback and attachments — additive keys,
--  no future schema change needed for those.
-- =============================================================

create table if not exists public.chat_sessions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id         uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "chat_sessions: own" on public.chat_sessions;
create policy "chat_sessions: own"
  on public.chat_sessions for all
  using (auth.uid() = user_id);

drop policy if exists "chat_messages: own" on public.chat_messages;
create policy "chat_messages: own"
  on public.chat_messages for all
  using (auth.uid() = user_id);

-- Both tables sit in a hot path (every chat message touches both) —
-- unlike most of this schema, these are worth an explicit index.
create index if not exists chat_sessions_user_id_updated_at_idx
  on public.chat_sessions(user_id, updated_at desc);

create index if not exists chat_messages_session_id_created_at_idx
  on public.chat_messages(session_id, created_at);
