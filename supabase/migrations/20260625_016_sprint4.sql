-- =============================================================
--  Migration 016 — Sprint 4: novas colunas e tabela
--  Adiciona o que foi introduzido no sprint 4 caso o banco
--  já existia antes dessas mudanças no schema.sql.
--  Seguro para rodar múltiplas vezes (IF NOT EXISTS).
-- =============================================================

-- ─────────────────────────────────────────────────────────────
--  1. Novas colunas em user_profiles
-- ─────────────────────────────────────────────────────────────
alter table public.user_profiles
  add column if not exists theme           text not null default 'dark'
    check (theme in ('dark','light','system')),
  add column if not exists onboarding_step int  not null default 0;

-- ─────────────────────────────────────────────────────────────
--  2. Novas colunas em user_positions (cotações em tempo real)
-- ─────────────────────────────────────────────────────────────
alter table public.user_positions
  add column if not exists current_price            numeric(15,6),
  add column if not exists current_price_updated_at timestamptz;

-- ─────────────────────────────────────────────────────────────
--  3. Tabela financial_events (notificações)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.financial_events (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  type                text not null,
  severity            text not null check (severity in ('info','warning','alert')),
  title               text not null,
  description         text,
  metadata            jsonb,
  related_entity_type text check (related_entity_type in ('budget','goal','transaction','bill')),
  related_entity_id   uuid,
  is_read             boolean not null default false,
  created_at          timestamptz not null default now(),
  expires_at          timestamptz
);

alter table public.financial_events enable row level security;

drop policy if exists "financial_events: own" on public.financial_events;
create policy "financial_events: own"
  on public.financial_events for all
  using (auth.uid() = user_id);

-- Permitir apenas marcar como lido (is_read) diretamente pelo cliente
revoke insert, update, delete on public.financial_events from authenticated;
grant update (is_read) on public.financial_events to authenticated;
