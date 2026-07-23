-- =============================================================
--  Migration 018 — Deduplicar user_categories + travar contra
--  duplicação futura.
--
--  Causa raiz: o app tinha dois pontos (QuickAddModal e o modal
--  de orçamento) que, ao verem user_categories vazia para um
--  usuário, inseriam cópias das system_categories sem proteção
--  contra concorrência/re-execução — o mesmo clique/efeito rodando
--  duas vezes gerava categorias repetidas.
--
--  Este script:
--  1. Remapeia transactions/budgets que apontam para uma categoria
--     "duplicada" para a categoria "original" (a mais antiga),
--     antes de apagar as duplicatas — evita perder referências.
--  2. Apaga as linhas duplicadas de user_categories.
--  3. Cria um índice único parcial (user_id, system_category_id)
--     para impedir que isso volte a acontecer.
-- =============================================================

with ranked as (
  select
    id, user_id, system_category_id, name, type,
    row_number() over (
      partition by user_id, type, coalesce(system_category_id::text, name)
      order by created_at asc, id asc
    ) as rn
  from public.user_categories
),
dupes as (
  select r.id as dup_id, k.id as keep_id
  from ranked r
  join ranked k
    on k.user_id = r.user_id
   and k.type    = r.type
   and coalesce(k.system_category_id::text, k.name) = coalesce(r.system_category_id::text, r.name)
   and k.rn = 1
  where r.rn > 1
)
update public.transactions t
set category_id = d.keep_id
from dupes d
where t.category_id = d.dup_id;

with ranked as (
  select
    id, user_id, system_category_id, name, type,
    row_number() over (
      partition by user_id, type, coalesce(system_category_id::text, name)
      order by created_at asc, id asc
    ) as rn
  from public.user_categories
),
dupes as (
  select r.id as dup_id, k.id as keep_id
  from ranked r
  join ranked k
    on k.user_id = r.user_id
   and k.type    = r.type
   and coalesce(k.system_category_id::text, k.name) = coalesce(r.system_category_id::text, r.name)
   and k.rn = 1
  where r.rn > 1
)
update public.budgets b
set category_id = d.keep_id
from dupes d
where b.category_id = d.dup_id;

with ranked as (
  select
    id, user_id, system_category_id, name, type,
    row_number() over (
      partition by user_id, type, coalesce(system_category_id::text, name)
      order by created_at asc, id asc
    ) as rn
  from public.user_categories
)
delete from public.user_categories uc
using ranked r
where uc.id = r.id
  and r.rn > 1;

-- Trava definitiva: impede duas categorias com o mesmo
-- system_category_id para o mesmo usuário (categorias custom,
-- sem system_category_id, não são afetadas — NULL nunca colide
-- em índice único no Postgres).
create unique index if not exists user_categories_user_system_uniq
  on public.user_categories (user_id, system_category_id)
  where system_category_id is not null;
