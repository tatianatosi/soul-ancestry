-- Consolida sobreposição real (não duplicação): para os 11 países com trilha
-- v1.0 refinada (batch 21/08, com marco jurídico vinculado), a organização
-- Clube Ancestral também tinha a trilha genérica de 19/08 (versao null),
-- criada 2 dias antes. As duas nunca deveriam coexistir como trilha "ativa"
-- do mesmo país. O caso real da Ana (CA-CID-AT-FAM-2026-001) estava
-- referenciando a trilha antiga tanto em blueprint_parameters (Alemanha)
-- quanto em case_services (Áustria) — a cadeia trilha→regra→marco nunca
-- alcançava esse caso porque ele apontava para a trilha sem marco/regra
-- vinculados. A única regra jurídica cadastrada (Áustria, versioned_legal_rules)
-- também apontava para a trilha antiga.
--
-- Repontamos toda referência viva para a trilha v1.0 e arquivamos a trilha
-- antiga (arquivamento lógico — mesmo padrão de arquivarItemBiblioteca:
-- archived_at + archive_motivo + ativo=false; nunca exclusão física).
--
-- Nota: as 3 cópias por país que uma leitura inicial confundiu com
-- "triplicação" eram, na verdade, seed correto por organização (Clube
-- Ancestral real + 2 organizações DEMO fictícias) — nenhuma duplicação
-- dentro da organização real. A sobreposição real era só o par
-- trilha-genérica-19/08 vs. trilha-v1.0-21/08 dentro da própria Clube
-- Ancestral, que esta migration resolve.

with pares as (
  select b1.id as id_antigo, b2.id as id_novo, b1.pais, b1.organization_id
  from citizenship_tracks b1
  join citizenship_tracks b2
    on b2.organization_id = b1.organization_id
   and b2.pais = b1.pais
   and b2.versao = 'v1.0'
   and b2.archived_at is null
  where b1.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
    and b1.versao is null
    and b1.archived_at is null
),
upd_blueprint as (
  update blueprint_parameters bp
  set citizenship_track_id = p.id_novo
  from pares p
  where bp.citizenship_track_id = p.id_antigo
  returning bp.id
),
upd_case_services as (
  update case_services cs
  set citizenship_track_id = p.id_novo
  from pares p
  where cs.citizenship_track_id = p.id_antigo
  returning cs.id
),
upd_genealogical as (
  update genealogical_sources_catalog g
  set citizenship_track_id = p.id_novo
  from pares p
  where g.citizenship_track_id = p.id_antigo
  returning g.id
),
upd_leads as (
  update leads l
  set trilha_referencia_id = p.id_novo
  from pares p
  where l.trilha_referencia_id = p.id_antigo
  returning l.id
),
upd_lineage as (
  update lineage_paths lp
  set citizenship_track_id = p.id_novo
  from pares p
  where lp.citizenship_track_id = p.id_antigo
  returning lp.id
),
upd_opportunities as (
  update opportunities o
  set citizenship_track_id = p.id_novo
  from pares p
  where o.citizenship_track_id = p.id_antigo
  returning o.id
),
upd_research_cases as (
  update research_cases rc
  set citizenship_track_id = p.id_novo
  from pares p
  where rc.citizenship_track_id = p.id_antigo
  returning rc.id
),
upd_regras as (
  update versioned_legal_rules v
  set track_id = p.id_novo
  from pares p
  where v.track_id = p.id_antigo
  returning v.id
),
upd_marcos as (
  update legal_reference_milestones m
  set track_id = p.id_novo
  from pares p
  where m.track_id = p.id_antigo
  returning m.id
),
arquivamento as (
  update citizenship_tracks ct
  set archived_at = now(),
      archive_motivo = 'Sobreposta pela trilha v1.0 ' || p.id_novo || ' (mesmo país, dados mais completos com marco jurídico vinculado) — consolidação de 08/09/2026',
      ativo = false
  from pares p
  where ct.id = p.id_antigo
  returning ct.id, p.pais, p.id_novo
)
insert into audit_logs (id, organization_id, user_id, acao, entidade, entidade_id, metadados)
select gen_random_uuid(), '11f32aae-ea08-47e0-8114-f5d8a900c9a1', null,
  'biblioteca_consolidacao_sobreposicao', 'biblioteca_mestre', a.id,
  jsonb_build_object('fonte', 'trilhas', 'pais', a.pais, 'trilha_antiga_id', a.id, 'trilha_nova_id', a.id_novo,
    'motivo', 'Duas trilhas para o mesmo país (genérica de 19/08 vs. v1.0 de 21/08 com marco jurídico); consolidado para a v1.0 e repontadas as referências vivas.')
from arquivamento a;
