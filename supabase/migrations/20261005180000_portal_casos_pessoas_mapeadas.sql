-- PREMISSA (05/10/2026, autorização explícita da Proprietária): o percentual
-- de "Conexões Familiares" (uma das 6 dimensões do Radar Ancestral do App)
-- usa como denominador as PESSOAS MAPEADAS do caso, nunca o teto ilustrativo
-- de 31 (G1-G5). Antes desta migration não havia nenhum jeito seguro de o
-- App saber esse número: `genealogical_person_profiles` está listada em
-- `BLOQUEIOS_CA_PORTAL_02` (src/lib/portal-dados-vivos.ts) por não ter policy
-- de portal — ela só permite SELECT por is_org_member, nunca pelo cliente.
--
-- Esta migration não cria policy nova, nem GRANT novo, nem expõe nenhum dado
-- pessoal: segue exatamente o padrão já aprovado em 20260921160000 (fase e
-- composição) e 20260925120000/20260925130000 (próxima entrega, pendência) —
-- `create or replace view` com o mesmo `security_barrier = true` e o mesmo
-- gate `portal_caso_permitido(c.id)`, só acrescentando uma COLUNA agregada
-- (contagem inteira), nunca uma linha de pessoa.
--
-- Fonte: `genealogical_person_profiles.case_id`, não arquivado. É a mesma
-- tabela que a Árvore usa internamente no Desk para "mapear" pessoas antes de
-- publicar; contar linhas não-arquivadas dela é "quantas pessoas a pesquisa já
-- mapeou para este caso", distinto de "quantas já foram publicadas" (que já
-- vem de portal_projecoes, tipo arvore/linha_tempo, com RLS própria).

create or replace view public.portal_casos
with (security_barrier = true, security_invoker = false) as
select c.id, c.organization_id, c.cliente_id, c.codigo, c.titulo, c.pais, c.via,
       c.status, c.ativo, c.suspenso_em, c.app_access_status, c.onboarding_iniciado_em,
       c.created_at, c.updated_at,
       p.fase_jornada,
       p.composicao,
       (
         select min(m.prazo)
         from public.ops_microentregas m
         where m.caso_id = c.id
           and m.archived_at is null
           and m.status <> all (array['concluida', 'cancelada'])
       ) as proxima_entrega_prevista_em,
       coalesce(
         (
           select cardinality(p2.dependencias_cliente) > 0
           from public.case_plans p2
           where p2.case_id = c.id
             and p2.status = 'ativo'
             and p2.archived_at is null
           order by p2.updated_at desc
           limit 1
         ),
         false
       ) as pendencia_cliente_pendente,
       coalesce(pm.pessoas_mapeadas, 0) as pessoas_mapeadas
from public.crm_casos c
left join lateral (
  select cp.fase_jornada, cp.composicao
  from public.case_plans cp
  where cp.case_id = c.id
    and cp.status = 'ativo'
    and cp.archived_at is null
  order by cp.updated_at desc
  limit 1
) p on true
left join lateral (
  select count(*)::int as pessoas_mapeadas
  from public.genealogical_person_profiles gpp
  where gpp.case_id = c.id
    and gpp.archived_at is null
) pm on true
where c.archived_at is null and public.portal_caso_permitido(c.id);

revoke all on public.portal_casos from anon;
grant select on public.portal_casos to authenticated;

comment on view public.portal_casos is
  'Projeção do caso para o App Cliente. Gate: portal_caso_permitido(id). '
  'fase_jornada e composicao vêm do plano ativo mais recente do caso; '
  'pessoas_mapeadas é a contagem (não as linhas) de genealogical_person_profiles '
  'não arquivadas do caso — denominador do eixo Conexões Familiares do Radar, '
  'nunca o teto ilustrativo de 31 (decisão da Proprietária, 05/10/2026).';
