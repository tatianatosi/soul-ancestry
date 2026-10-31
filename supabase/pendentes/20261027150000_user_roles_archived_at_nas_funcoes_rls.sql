-- ESTADO: JÁ APLICADO em 27/10/2026, sob autorização explícita da
-- Proprietária ("autorizo migration do critico 1"). Conferido depois de
-- aplicar: as 3 funções filtram `archived_at is null` e cada uma manteve a
-- própria guarda de prefixo original.
--
-- DUAS CORREÇÕES QUE SÓ APARECERAM NA HORA DE APLICAR (o aviso no fim deste
-- arquivo, de conferir o corpo vigente antes de substituir, se provou certo):
--
--  1. `has_org_role` usa `public.is_staff_ativo(_org)`, NÃO `is_org_member`.
--     O rascunho abaixo foi escrito SEM nenhuma guarda de prefixo nessa
--     função — aplicá-lo literalmente teria REMOVIDO uma proteção de
--     segurança em 32 policies. Aplicado o corpo vivo + a cláusula nova.
--  2. `bootstrap_primeiro_admin` NÃO precisava da mudança: ela só faz
--     INSERT em user_roles, nunca lê para autorizar (a guarda dela é
--     bootstrap_lock/staff_access vazios). Era falso positivo da auditoria.
--
-- O SQL efetivamente aplicado está no fim do arquivo, em APLICADO EM 27/10.
--
-- Por quê: completa o item 2 da auditoria pré-lançamento, que eu entreguei
-- pela metade em 27/10/2026. Eu troquei .delete() por soft-delete em
-- user_roles e filtrei `archived_at is null` nas 13 LEITURAS TypeScript —
-- mas a autorização real deste projeto não está no TypeScript: está nestas
-- funções SQL, usadas pelas policies de RLS. Elas não filtram `archived_at`,
-- então um papel arquivado continua concedendo acesso no banco.
--
-- Medido no banco de produção em 27/10/2026 (pg_proc):
--   can_write ................. NÃO filtra  -> 225 policies dependem
--   has_org_role .............. NÃO filtra  ->  32 policies dependem
--   can_write_financeiro ...... NÃO filtra  ->   8 policies dependem
--   bootstrap_primeiro_admin .. NÃO filtra
--
-- Caminho de falha concreto (só existe DEPOIS do merge; `main` ainda usa
-- .delete(), então não há furo em produção hoje):
--   1. Admin remove o papel `financeiro` de U em definirPapel(conceder:false).
--   2. Tela: a leitura filtrada esconde as telas financeiras. Parece revogado.
--   3. Banco: can_write_financeiro = is_org_member(true, U é staff ativo)
--      AND exists(user_roles ... role in ('admin','financeiro')) -> TRUE,
--      porque a linha arquivada ainda conta.
--   4. U mantém escrita em 8 policies financeiras via PostgREST.
--
-- Os fluxos de suspender/arquivar MEMBRO seguem seguros: eles desativam
-- staff_access, o que derruba is_org_member e is_staff_ativo. O furo é
-- específico de remover PAPEL mantendo o membro ativo.
--
-- Idempotente: CREATE OR REPLACE com a mesma assinatura; não cria policy
-- nova, não altera dado, não mexe em service_role. Reaplicar é no-op.
--
-- ATENÇÃO ao aplicar: as definições abaixo precisam ser conferidas contra o
-- corpo vigente de cada função no momento da aplicação (pg_get_functiondef),
-- porque uma delas pode ter mudado depois de 27/10. O que esta proposta
-- acrescenta é UMA cláusula por função: `and r.archived_at is null`.

-- 1) can_write — a mais crítica (225 policies)
create or replace function public.can_write(_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_org_member(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org
      and r.user_id = auth.uid()
      and r.role in ('admin','operacoes','comercial','financeiro','pesquisador')
      and r.archived_at is null
  )
$$;

-- 2) has_org_role (32 policies)
create or replace function public.has_org_role(_org uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles r
    where r.organization_id = _org
      and r.user_id = auth.uid()
      and r.role = _role
      and r.archived_at is null
  )
$$;

-- 3) can_write_financeiro (8 policies)
create or replace function public.can_write_financeiro(_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_org_member(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org
      and r.user_id = auth.uid()
      and r.role in ('admin','financeiro')
      and r.archived_at is null
  )
$$;

-- 4) bootstrap_primeiro_admin — revisar junto: um papel arquivado não deve
--    contar como "já existe admin" nem como credencial de bootstrap.
--    Deixado FORA desta proposta de propósito: o corpo dela precisa ser lido
--    inteiro antes de reescrever, porque é um caminho de criação de acesso.

-- Conferência pós-aplicação (rodar e comparar):
--   select p.proname, (pg_get_functiondef(p.oid) ilike '%archived_at%') as ok
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname='public' and p.prokind='f'
--     and p.proname in ('can_write','has_org_role','can_write_financeiro');
--   -- esperado: ok = true nas três.

-- ============================================================
-- APLICADO EM 27/10/2026 — este é o SQL que de fato rodou,
-- construído a partir de pg_get_functiondef do banco vivo + a cláusula
-- `and r.archived_at is null`. Nada mais foi alterado em cada corpo.
-- bootstrap_primeiro_admin ficou de fora (só faz INSERT; não autoriza).
-- ============================================================

create or replace function public.can_write(_org uuid)
 returns boolean language sql stable security definer set search_path to 'public'
as $function$
  select public.is_org_member(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org and r.user_id = auth.uid()
      and r.role in ('admin','operacoes','pesquisador','comercial','financeiro')
      and r.archived_at is null)
$function$;

create or replace function public.can_write_financeiro(_org uuid)
 returns boolean language sql stable security definer set search_path to 'public'
as $function$
  select public.is_org_member(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org and r.user_id = auth.uid()
      and r.role in ('admin','financeiro')
      and r.archived_at is null)
$function$;

create or replace function public.has_org_role(_org uuid, _role app_role)
 returns boolean language sql stable security definer set search_path to 'public'
as $function$
  select public.is_staff_ativo(_org) and exists (
    select 1 from public.user_roles r
    where r.organization_id = _org and r.user_id = auth.uid() and r.role = _role
      and r.archived_at is null
  )
$function$;
