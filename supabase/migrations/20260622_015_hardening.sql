-- =============================================================
--  Migration 015 — Hardening de segurança
--  Fase 4.11 — 6 correções antes de entrar em produção
-- =============================================================

-- ─────────────────────────────────────────────────────────────
--  Fix 1: WITH CHECK em todas as policies UPDATE
-- ─────────────────────────────────────────────────────────────

drop policy if exists "accounts_update"         on accounts;
drop policy if exists "user_categories_update"  on user_categories;
drop policy if exists "transactions_update"     on transactions;
drop policy if exists "budgets_update"          on budgets;
drop policy if exists "goals_update"            on goals;
drop policy if exists "positions_update"        on user_positions;
drop policy if exists "events_update"           on financial_events;
drop policy if exists "bills_update"            on credit_card_bills;
drop policy if exists "recurrence_update"       on recurrence_rules;

create policy "accounts_update" on accounts for update
  using    (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

create policy "user_categories_update" on user_categories for update
  using    (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

create policy "transactions_update" on transactions for update
  using    (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

create policy "budgets_update" on budgets for update
  using    (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

create policy "goals_update" on goals for update
  using    (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

create policy "positions_update" on user_positions for update
  using    (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

create policy "events_update" on financial_events for update
  using    (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "bills_update" on credit_card_bills for update
  using    (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "recurrence_update" on recurrence_rules for update
  using    (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
--  Fix 2: Revogar escrita direta em tabelas derivadas
-- ─────────────────────────────────────────────────────────────

revoke insert, update, delete on ledger_entries    from authenticated;
revoke insert, update, delete on monthly_snapshots from authenticated;
revoke insert, update, delete on financial_events  from authenticated;
revoke insert, update, delete on position_history  from authenticated;

grant update (is_read) on financial_events to authenticated;

-- ─────────────────────────────────────────────────────────────
--  Fix 3: Triggers de validação de ownership de FK
-- ─────────────────────────────────────────────────────────────

create or replace function validate_account_owner()
returns trigger language plpgsql security definer as $$
declare v_account_user_id uuid;
begin
  select user_id into v_account_user_id
  from accounts where id = new.account_id and deleted_at is null;

  if v_account_user_id is null then
    raise exception 'account_id % not found or deleted', new.account_id;
  end if;
  if v_account_user_id != new.user_id then
    raise exception 'account_id % does not belong to user %', new.account_id, new.user_id;
  end if;
  return new;
end;
$$;

create trigger trg_transactions_account_owner
  before insert or update on transactions
  for each row execute procedure validate_account_owner();

create trigger trg_positions_account_owner
  before insert or update on user_positions
  for each row execute procedure validate_account_owner();

create or replace function validate_transfer_accounts_owner()
returns trigger language plpgsql security definer as $$
declare v_from uuid; v_to uuid;
begin
  select user_id into v_from from accounts where id = new.from_account_id and deleted_at is null;
  select user_id into v_to   from accounts where id = new.to_account_id   and deleted_at is null;
  if v_from != new.user_id or v_to != new.user_id then
    raise exception 'transfer accounts must both belong to user %', new.user_id;
  end if;
  return new;
end;
$$;

create trigger trg_transfers_accounts_owner
  before insert on transfers
  for each row execute procedure validate_transfer_accounts_owner();

create or replace function validate_goal_owner()
returns trigger language plpgsql security definer as $$
declare v_goal_user_id uuid;
begin
  select user_id into v_goal_user_id from goals where id = new.goal_id and deleted_at is null;
  if v_goal_user_id != new.user_id then
    raise exception 'goal_id % does not belong to user %', new.goal_id, new.user_id;
  end if;
  return new;
end;
$$;

create trigger trg_contributions_goal_owner
  before insert on goal_contributions
  for each row execute procedure validate_goal_owner();

create or replace function validate_category_owner()
returns trigger language plpgsql security definer as $$
declare v_cat_user_id uuid;
begin
  select user_id into v_cat_user_id from user_categories where id = new.category_id and deleted_at is null;
  if v_cat_user_id is not null and v_cat_user_id != new.user_id then
    raise exception 'category_id % does not belong to user %', new.category_id, new.user_id;
  end if;
  return new;
end;
$$;

create trigger trg_budgets_category_owner
  before insert or update on budgets
  for each row execute procedure validate_category_owner();

-- ─────────────────────────────────────────────────────────────
--  Fix 4: Trigger de prevenção de hard delete
-- ─────────────────────────────────────────────────────────────

create or replace function prevent_hard_delete()
returns trigger language plpgsql as $$
begin
  raise exception 'Hard delete not allowed on %. Use soft delete (deleted_at = now()).', TG_TABLE_NAME;
  return null;
end;
$$;

create trigger trg_accounts_no_delete          before delete on accounts          for each row execute procedure prevent_hard_delete();
create trigger trg_user_categories_no_delete   before delete on user_categories   for each row execute procedure prevent_hard_delete();
create trigger trg_transactions_no_delete      before delete on transactions      for each row execute procedure prevent_hard_delete();
create trigger trg_recurrence_no_delete        before delete on recurrence_rules  for each row execute procedure prevent_hard_delete();
create trigger trg_budgets_no_delete           before delete on budgets           for each row execute procedure prevent_hard_delete();
create trigger trg_goals_no_delete             before delete on goals             for each row execute procedure prevent_hard_delete();
create trigger trg_positions_no_delete         before delete on user_positions    for each row execute procedure prevent_hard_delete();

-- ─────────────────────────────────────────────────────────────
--  Fix 5: Unicidade de idempotency_key por usuário em transfers
-- ─────────────────────────────────────────────────────────────

alter table transfers drop constraint if exists transfers_idempotency_key_key;
alter table transfers add constraint transfers_idempotency_unique unique (user_id, idempotency_key);

-- ─────────────────────────────────────────────────────────────
--  Fix 6: TRIGGER substituindo RULE no ledger_entries
-- ─────────────────────────────────────────────────────────────

drop rule if exists ledger_no_update on ledger_entries;
drop rule if exists ledger_no_delete on ledger_entries;

create or replace function prevent_ledger_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'ledger_entries is immutable. Entries cannot be updated or deleted.';
  return null;
end;
$$;

create trigger trg_ledger_immutable
  before update or delete on ledger_entries
  for each row execute procedure prevent_ledger_mutation();
