-- Unificação Pessoa 360 (docs/auditorias/2026-09-04-nucleos-pessoa-360-contrato-acesso-app-cliente.md,
-- seção 5.1): genealogical_relationships (módulo real de Pessoas e Linhagens, editável) ganha os 4
-- campos de confiança/workflow que só existiam em research_relationships (ficha piloto, somente
-- leitura) — sem eles, um vínculo criado pela ficha piloto não tinha como ser representado na tabela
-- real, e um vínculo criado pela tela real não aparecia na ficha piloto.
--
-- Mesmos valores/defaults de research_relationships (20260816231149), para não quebrar
-- src/lib/ficha-piloto-genealogica.ts (STATUS_VINCULO já espera exatamente estes 6 estados).
alter table public.genealogical_relationships
  add column if not exists confidence_level text not null default 'low'
    check (confidence_level in ('low', 'medium', 'high')),
  add column if not exists status text not null default 'asserted'
    check (status in ('asserted', 'under_review', 'supported', 'validated', 'conflicting', 'rejected')),
  add column if not exists directionality text not null default 'unknown'
    check (directionality in ('a_to_b', 'b_to_a', 'bidirectional', 'unknown')),
  add column if not exists supporting_evidence_count integer not null default 0;

-- Backfill: para cada vínculo já registrado nos dois lados (mesmo par de pessoas — em qualquer sentido
-- — e mesmo caso, via research_cases.case_id = genealogical_relationships.case_id), copia os 4 campos
-- de research_relationships. Idempotente (só atualiza quem ainda está no default 'low'/'asserted'/
-- 'unknown'/0, ou seja, nunca tocado); não apaga nem funde nenhuma linha de nenhuma das duas tabelas.
update public.genealogical_relationships gr
set confidence_level = rr.confidence_level,
    status = rr.status,
    directionality = rr.directionality,
    supporting_evidence_count = rr.supporting_evidence_count
from public.research_relationships rr
join public.research_cases rc on rc.id = rr.research_case_id
where rc.case_id = gr.case_id
  and rr.archived_at is null
  and (
    (rr.person_a_id = gr.person_from_id and rr.person_b_id = gr.person_to_id)
    or (rr.person_a_id = gr.person_to_id and rr.person_b_id = gr.person_from_id)
  )
  and gr.confidence_level = 'low' and gr.status = 'asserted' and gr.directionality = 'unknown' and gr.supporting_evidence_count = 0;
