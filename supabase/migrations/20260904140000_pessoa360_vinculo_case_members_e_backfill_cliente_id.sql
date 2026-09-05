-- Pessoa 360 — fecha o vínculo cliente_id/client_id que faltava em três
-- tabelas onde a mesma pessoa pode aparecer sem link para o cadastro
-- canônico em `clientes`.
--
-- Causa raiz específica da Ana Luiza (achado desta sessão, com evidência de
-- migration): o cliente canônico foi cadastrado em 16/08/2026
-- (20260816232935_a72396bb) com nome curto ("Ana Luiza"). Dois dias depois,
-- 18/08/2026 (20260818201721_818f92ac), `nucleo_membros` e `contract_parties`
-- foram semeados usando o nome completo ("Ana Luiza Gomes Silveira
-- Rodrigues") via `left join clientes on lower(c.nome) = lower(m.nome)` —
-- comparação por igualdade exata, que bateu certo para Adair e Alice (cujo
-- nome completo já era o nome do cadastro em `clientes`) mas nunca bateu
-- para Ana. Resultado: `nucleo_membros.cliente_id` e
-- `contract_parties.client_id` ficaram nulos para Ana desde a origem — o
-- núcleo mostra "Ana Luiza Gomes Silveira Rodrigues" com dados ricos
-- (documento, endereço, contato) sem nenhum link para o cadastro dela em
-- `clientes`, que por sua vez é o único vinculado a `crm_casos`/`contracts`.
-- `case_members` (usado por cadastro-checklist, escopo, matriz de
-- conformidade/equivalência e outros ~10 módulos ativos) nunca teve coluna
-- de vínculo nenhuma — é a quarta pessoa "Ana" sem relação com as outras
-- três. Isso é o achado "Ana fragmentada em 4 cadastros" registrado em
-- docs/auditorias/2026-09-04-nucleos-pessoa-360-contrato-acesso-app-cliente.md.
--
-- Esta migration não apaga nem funde nenhuma linha: só cria o vínculo que
-- deveria já existir (uma FK), de forma aditiva e reversível.

-- 1) case_members ganha a coluna de vínculo com o cadastro canônico.
alter table public.case_members
  add column if not exists cliente_id uuid references public.clientes(id);

-- 2) Backfill geral (não específico da Ana): qualquer linha com vínculo
--    nulo cujo nome bate — exato, ou por um nome ser o início do outro,
--    seguido de espaço (cobre "Ana Luiza" vs. "Ana Luiza Gomes Silveira
--    Rodrigues") — com exatamente um cliente ativo da mesma organização.
--    Ambiguidade (mais de um candidato) não é resolvida automaticamente:
--    a linha permanece nula, como estava, para decisão humana.
with candidatos_nucleo as (
  select nm.id as membro_id, c.id as cliente_id,
         count(*) over (partition by nm.id) as total
  from public.nucleo_membros nm
  join public.clientes c
    on c.organization_id = nm.organization_id
   and c.archived_at is null
   and (
     lower(c.nome) = lower(nm.nome)
     or lower(nm.nome) like lower(c.nome) || ' %'
     or lower(c.nome) like lower(nm.nome) || ' %'
   )
  where nm.cliente_id is null and nm.archived_at is null
)
update public.nucleo_membros nm
set cliente_id = cd.cliente_id
from candidatos_nucleo cd
where cd.membro_id = nm.id and cd.total = 1;

with candidatos_parte as (
  select cp.id as parte_id, c.id as cliente_id,
         count(*) over (partition by cp.id) as total
  from public.contract_parties cp
  join public.clientes c
    on c.organization_id = cp.organization_id
   and c.archived_at is null
   and (
     lower(c.nome) = lower(cp.person_name)
     or lower(cp.person_name) like lower(c.nome) || ' %'
     or lower(c.nome) like lower(cp.person_name) || ' %'
   )
  where cp.client_id is null and cp.archived_at is null and cp.role <> 'provider'
)
update public.contract_parties cp
set client_id = cd.cliente_id
from candidatos_parte cd
where cd.parte_id = cp.id and cd.total = 1;

with candidatos_membro_caso as (
  select cm.id as membro_id, c.id as cliente_id,
         count(*) over (partition by cm.id) as total
  from public.case_members cm
  join public.clientes c
    on c.organization_id = cm.organization_id
   and c.archived_at is null
   and (
     lower(c.nome) = lower(cm.nome)
     or lower(cm.nome) like lower(c.nome) || ' %'
     or lower(c.nome) like lower(cm.nome) || ' %'
   )
  where cm.cliente_id is null and cm.archived_at is null
)
update public.case_members cm
set cliente_id = cd.cliente_id
from candidatos_membro_caso cd
where cd.membro_id = cm.id and cd.total = 1;
