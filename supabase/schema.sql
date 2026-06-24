-- ────────────────────────────────────────────────────────────────────
-- Numi Finance — Schema completo
-- Execute INTEIRO no Supabase SQL Editor (pode rodar mais de uma vez)
-- ────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── user_profiles ──────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text not null default '',
  avatar_url      text,
  currency_code   text not null default 'BRL',
  timezone        text not null default 'America/Sao_Paulo',
  theme           text not null default 'dark' check (theme in ('dark','light','system')),
  onboarding_step int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── accounts ───────────────────────────────────────────────────────
create table if not exists public.accounts (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  type            text not null check (type in ('checking','savings','credit_card','cash','investment','joint')),
  institution     text,
  initial_balance numeric(15,2) not null default 0,
  currency_code   text not null default 'BRL',
  color           text,
  icon            text,
  credit_limit    numeric(15,2),
  billing_day     int  check (billing_day between 1 and 31),
  due_day         int  check (due_day between 1 and 31),
  is_active       boolean not null default true,
  display_order   int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  deleted_by      uuid
);

-- ── system_categories (categorias padrão, read-only) ───────────────
create table if not exists public.system_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  icon        text not null default '📦',
  color       text not null default '#64748B',
  type        text not null check (type in ('income','expense','transfer')),
  parent_id   uuid references public.system_categories(id),
  sort_order  int  not null default 0,
  is_active   boolean not null default true
);

-- ── user_categories ────────────────────────────────────────────────
create table if not exists public.user_categories (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  icon               text,
  color              text,
  type               text not null check (type in ('income','expense','transfer')),
  parent_id          uuid references public.user_categories(id),
  system_category_id uuid references public.system_categories(id),
  is_active          boolean not null default true,
  sort_order         int  not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

-- ── transactions ───────────────────────────────────────────────────
create table if not exists public.transactions (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  account_id           uuid not null references public.accounts(id),
  category_id          uuid references public.user_categories(id),
  bill_id              uuid,
  recurrence_rule_id   uuid,
  installment_group_id uuid,
  installment_number   int,
  installment_total    int,
  type                 text not null check (type in ('income','expense','transfer')),
  amount               numeric(15,2) not null check (amount > 0),
  currency_code        text not null default 'BRL',
  date                 date not null,
  description          text,
  notes                text,
  status               text not null default 'confirmed' check (status in ('pending','confirmed','cancelled')),
  is_recurring         boolean not null default false,
  attachment_urls      text[],
  idempotency_key      text unique,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,
  deleted_by           uuid
);

-- ── ledger_entries ─────────────────────────────────────────────────
create table if not exists public.ledger_entries (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  account_id     uuid not null references public.accounts(id),
  transaction_id uuid references public.transactions(id),
  transfer_id    uuid,
  direction      text not null check (direction in ('credit','debit')),
  amount         numeric(15,2) not null,
  currency_code  text not null default 'BRL',
  created_at     timestamptz not null default now()
);

-- ── transfers ──────────────────────────────────────────────────────
create table if not exists public.transfers (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references public.accounts(id),
  to_account_id   uuid not null references public.accounts(id),
  amount          numeric(15,2) not null,
  currency_code   text not null default 'BRL',
  date            date not null,
  description     text,
  from_ledger_id  uuid references public.ledger_entries(id),
  to_ledger_id    uuid references public.ledger_entries(id),
  idempotency_key text unique,
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- ── budgets ────────────────────────────────────────────────────────
create table if not exists public.budgets (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category_id   uuid not null references public.user_categories(id),
  amount        numeric(15,2) not null,
  currency_code text not null default 'BRL',
  period_type   text not null default 'monthly' check (period_type in ('monthly','custom')),
  start_date    date,
  end_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  deleted_by    uuid
);

-- ── goals ──────────────────────────────────────────────────────────
create table if not exists public.goals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  icon          text,
  target_amount numeric(15,2) not null,
  currency_code text not null default 'BRL',
  deadline      date,
  account_id    uuid references public.accounts(id),
  status        text not null default 'active' check (status in ('active','completed','cancelled','paused')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  deleted_by    uuid
);

-- ── goal_contributions ─────────────────────────────────────────────
create table if not exists public.goal_contributions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  goal_id        uuid not null references public.goals(id),
  transaction_id uuid references public.transactions(id),
  amount         numeric(15,2) not null,
  currency_code  text not null default 'BRL',
  date           date not null,
  notes          text,
  created_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

-- ── credit_card_bills ──────────────────────────────────────────────
create table if not exists public.credit_card_bills (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  account_id             uuid not null references public.accounts(id),
  reference_month        text not null,  -- ex: '2026-06'
  closing_date           date not null,
  due_date               date not null,
  total_amount           numeric(15,2) not null default 0,
  status                 text not null default 'open' check (status in ('open','closed','paid','overdue')),
  paid_at                timestamptz,
  payment_transaction_id uuid references public.transactions(id),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ── asset_master (catálogo de ativos, público) ─────────────────────
create table if not exists public.asset_master (
  id            uuid primary key default uuid_generate_v4(),
  ticker        text unique,
  name          text not null,
  type          text not null check (type in ('fixed_income','stock','etf','fii','crypto','cash')),
  exchange      text,
  currency_code text not null default 'BRL',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── user_positions ─────────────────────────────────────────────────
create table if not exists public.user_positions (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  asset_master_id          uuid references public.asset_master(id),
  account_id               uuid not null references public.accounts(id),
  name                     text,
  type                     text,
  quantity                 numeric(20,8) not null default 0,
  average_price            numeric(15,6) not null default 0,
  current_price            numeric(15,6),
  current_price_updated_at timestamptz,
  currency_code            text not null default 'BRL',
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz,
  deleted_by               uuid
);

-- ── monthly_snapshots ──────────────────────────────────────────────
create table if not exists public.monthly_snapshots (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  year            int  not null,
  month           int  not null check (month between 1 and 12),
  income          numeric(15,2) not null default 0,
  expense         numeric(15,2) not null default 0,
  savings         numeric(15,2) not null default 0,
  savings_rate    numeric(5,2),
  net_worth       numeric(15,2) not null default 0,
  invested_amount numeric(15,2) not null default 0,
  currency_code   text not null default 'BRL',
  computed_at     timestamptz not null default now(),
  unique(user_id, year, month)
);

-- ── financial_events ───────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────
alter table public.user_profiles      enable row level security;
alter table public.accounts           enable row level security;
alter table public.system_categories  enable row level security;
alter table public.user_categories    enable row level security;
alter table public.transactions       enable row level security;
alter table public.ledger_entries     enable row level security;
alter table public.transfers          enable row level security;
alter table public.budgets            enable row level security;
alter table public.goals              enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.credit_card_bills  enable row level security;
alter table public.asset_master       enable row level security;
alter table public.user_positions     enable row level security;
alter table public.monthly_snapshots  enable row level security;
alter table public.financial_events   enable row level security;

-- Cada usuário acessa apenas seus próprios dados
drop policy if exists "user_profiles: own"       on public.user_profiles;
drop policy if exists "accounts: own"            on public.accounts;
drop policy if exists "user_categories: own"     on public.user_categories;
drop policy if exists "transactions: own"        on public.transactions;
drop policy if exists "ledger_entries: own"      on public.ledger_entries;
drop policy if exists "transfers: own"           on public.transfers;
drop policy if exists "budgets: own"             on public.budgets;
drop policy if exists "goals: own"               on public.goals;
drop policy if exists "goal_contributions: own"  on public.goal_contributions;
drop policy if exists "credit_card_bills: own"   on public.credit_card_bills;
drop policy if exists "user_positions: own"      on public.user_positions;
drop policy if exists "monthly_snapshots: own"   on public.monthly_snapshots;
drop policy if exists "financial_events: own"    on public.financial_events;
drop policy if exists "system_categories: read"  on public.system_categories;
drop policy if exists "asset_master: read"       on public.asset_master;

create policy "user_profiles: own"       on public.user_profiles      for all using (auth.uid() = id);
create policy "accounts: own"            on public.accounts           for all using (auth.uid() = user_id);
create policy "user_categories: own"     on public.user_categories    for all using (auth.uid() = user_id);
create policy "transactions: own"        on public.transactions       for all using (auth.uid() = user_id);
create policy "ledger_entries: own"      on public.ledger_entries     for all using (auth.uid() = user_id);
create policy "transfers: own"           on public.transfers          for all using (auth.uid() = user_id);
create policy "budgets: own"             on public.budgets            for all using (auth.uid() = user_id);
create policy "goals: own"              on public.goals              for all using (auth.uid() = user_id);
create policy "goal_contributions: own" on public.goal_contributions for all using (auth.uid() = user_id);
create policy "credit_card_bills: own"  on public.credit_card_bills  for all using (auth.uid() = user_id);
create policy "user_positions: own"     on public.user_positions     for all using (auth.uid() = user_id);
create policy "monthly_snapshots: own"  on public.monthly_snapshots  for all using (auth.uid() = user_id);
create policy "financial_events: own"   on public.financial_events   for all using (auth.uid() = user_id);

-- Catálogos públicos (leitura livre)
create policy "system_categories: read" on public.system_categories for select using (true);
create policy "asset_master: read"      on public.asset_master      for select using (true);

-- ─────────────────────────────────────────────────────────────────────
-- Trigger: cria user_profile automaticamente ao registrar
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  -- Seed categorias padrão para o novo usuário
  insert into public.user_categories (user_id, name, icon, color, type, system_category_id, sort_order)
  select new.id, name, icon, color, type, id, sort_order
  from public.system_categories
  where is_active = true
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- Seed: categorias padrão do sistema
-- ─────────────────────────────────────────────────────────────────────
insert into public.system_categories (name, icon, color, type, sort_order) values
  ('Moradia',       '🏠', '#8B5CF6', 'expense', 1),
  ('Alimentação',   '🍔', '#F97316', 'expense', 2),
  ('Transporte',    '🚗', '#3B82F6', 'expense', 3),
  ('Saúde',         '❤️', '#EF4444', 'expense', 4),
  ('Educação',      '📚', '#10B981', 'expense', 5),
  ('Lazer',         '🎉', '#EC4899', 'expense', 6),
  ('Assinaturas',   '🔁', '#6366F1', 'expense', 7),
  ('Vestuário',     '👗', '#F59E0B', 'expense', 8),
  ('Outros',        '📦', '#64748B', 'expense', 9),
  ('Salário',       '💰', '#34D399', 'income',  1),
  ('Freelance',     '💻', '#38BDF8', 'income',  2),
  ('Investimentos', '📈', '#6366F1', 'income',  3),
  ('Outros (Rec.)', '💵', '#94A3B8', 'income',  4)
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Trigger: cria ledger_entries ao inserir transação confirmada
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_transaction_ledger()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'confirmed' then
    if new.type = 'income' then
      insert into public.ledger_entries (user_id, account_id, transaction_id, direction, amount, currency_code)
      values (new.user_id, new.account_id, new.id, 'credit', new.amount, new.currency_code);
    elsif new.type = 'expense' then
      insert into public.ledger_entries (user_id, account_id, transaction_id, direction, amount, currency_code)
      values (new.user_id, new.account_id, new.id, 'debit', new.amount, new.currency_code);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_transaction_insert on public.transactions;
create trigger on_transaction_insert
  after insert on public.transactions
  for each row execute procedure public.handle_transaction_ledger();
