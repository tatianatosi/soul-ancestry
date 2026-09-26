-- P14 (26/09/2026) — "Múltiplos ramos por caso": achado real é que a
-- infraestrutura JÁ EXISTIA e já estava construída ponta a ponta
-- (lineage_paths com FK case_id/family_id/citizenship_track_id/
-- pessoa_ancora_id e CHECK tipo_da_linha com paterna/materna/direta/
-- colateral/cidadania/memoria_legado/dupla_familiar/alternativa/
-- a_confirmar; research_cases com citizenship_track_id nullable — nulo =
-- base compartilhada do caso, preenchido = esforço incremental por
-- trilha; case_services sem unique constraint em case_id, já permite
-- múltiplas linhas), com leitor+escritor+UI reais em
-- pessoas-linhagens.functions.ts/.tsx — mas NUNCA aplicada: `lineage_paths`
-- estava vazia em toda a organização (zero linhas, qualquer caso).
--
-- Este corte não cria nenhuma tabela/coluna nova — só aplica a
-- infraestrutura já existente ao único caso real com dado suficiente
-- (Ana Luiza, CA-CID-AT-FAM-2026-001), conforme o Cenário C da
-- "Auditoria de Coerência — Produto-Pai, Jornada, Planejador Universal
-- e Legado" (v1.0, 04/09/2026): trilha única Áustria §58c, produto-pai
-- Diagnóstico Familiar Multipaís, condição particular R$9.600 (já
-- refletida em case_services desde P8/P9, sem alteração aqui).
--
-- Não fabricado: pessoa_ancora (Ana Luiza, já cadastrada em
-- research_people), family_id (núcleo Silveira/Friedmann-Reimer, já
-- cadastrado), citizenship_track_id (trilha canônica Áustria já corrigida
-- no P12) — todos ids de registros já existentes, nenhum dado inventado.
insert into public.lineage_paths
  (organization_id, case_id, family_id, nome_da_linha, pessoa_ancora_id, tipo_da_linha, citizenship_track_id, objetivo, status, responsavel)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'a11a0000-0000-4000-8000-000000000002',
       'a11a0000-0000-4000-8000-0000000000f1', 'Linha de cidadania — Áustria (§58c StbG)',
       'c1a50000-0000-4000-8000-0000000000e1', 'cidadania', 'adc77966-0aaf-44f0-a822-94bbba326903',
       'Reconhecimento de cidadania austríaca por reparação (§58c StbG) — caso familiar Silveira / Friedmann-Reimer.',
       'em_estruturacao', 'Equipe de operações — responsável a confirmar'
where not exists (
  select 1 from public.lineage_paths
  where case_id = 'a11a0000-0000-4000-8000-000000000002' and citizenship_track_id = 'adc77966-0aaf-44f0-a822-94bbba326903'
);

-- Liga a pesquisa da Ana (research_cases, base compartilhada — sem
-- citizenship_track_id, portanto reutilizável por qualquer ramo futuro
-- do mesmo núcleo) ao mesmo núcleo familiar, fechando a cadeia
-- caso → família → linha → trilha → pesquisa que a auditoria pede.
update public.research_cases
set family_id = 'a11a0000-0000-4000-8000-0000000000f1'
where id = 'c1a50000-0000-4000-8000-0000000000a1' and family_id is null;
