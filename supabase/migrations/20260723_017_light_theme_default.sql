-- =============================================================
--  Migration 017 — Novo padrão visual: tema claro
--  Muda o default da coluna theme para 'light' (rebrand) e
--  atualiza os perfis já existentes para 'light' também.
--  Só faz sentido rodar o UPDATE abaixo se não houver usuários
--  reais que já tenham escolhido 'dark' de propósito — nesse
--  projeto, ainda não há outros usuários cadastrados além do dev.
-- =============================================================

alter table public.user_profiles
  alter column theme set default 'light';

update public.user_profiles
  set theme = 'light';
