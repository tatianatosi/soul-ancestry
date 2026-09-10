-- Prioridade 1 da proprietária (08-09/09/2026): "a maioria dos marcos jurídicos
-- estão no PDF e no site do clube ancestral". Fecha o elo que faltava na cadeia
-- trilha (citizenship_tracks) -> regra jurídica (versioned_legal_rules) -> marco
-- jurídico (legal_reference_milestones): hoje só Áustria tinha os 3 elos; os
-- outros 9 países v1.0 tinham trilha+marco mas nenhuma regra formal, e
-- Luxemburgo nem marco tinha.
--
-- Regra confirmada com a proprietária: sem duplicar tabela, sem nome em inglês
-- novo — usa as 3 tabelas que já existem (citizenship_tracks/
-- versioned_legal_rules/legal_reference_milestones), não as
-- legal_framework/country_track/legal_gate propostas no PDF de 08/09 (essas
-- seriam duplicata, ver de-para de 09/09).
--
-- Conteúdo transcrito fielmente da seção 2 do PDF (trilha/marco inicial +
-- uso no painel interno), sem inventar citação legal nova: onde já existia um
-- marco com citação específica (legal_reference_milestones.label, trabalho
-- anterior já revisado), essa citação vira fonte_referencia da regra. Não
-- consultei o site do Clube Ancestral nesta rodada (sem navegador nesta
-- sessão) — a proprietária deve conferir se o site tem conteúdo mais recente.
--
-- Status: os 8 países da primeira onda (autorização explícita da
-- proprietária, 08/09: "tudo já está aprovado juridicamente") entram/ficam
-- 'aprovado', reviewed_by/reviewed_at = Tati Tosi (auth_user_id real, não
-- demo). Croácia e Romênia (fora da primeira onda) entram 'em_revisao' — o
-- próprio marco de Romênia já dizia "a homologar", sem citação confirmada.

-- 1) Luxemburgo não tinha nenhum marco jurídico (falha no seed de 21/08) — cria
--    antes da regra, para o elo de 3 existir de fato.
insert into public.legal_reference_milestones
  (organization_id, track_id, label, reference_type, summary_internal, status, review_required, versao)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'd47dacd7-b431-48eb-bb07-9ccf020fe512'::uuid,
  'Recuperação/reconhecimento de nacionalidade — regime luxemburguês (fonte oficial a confirmar)',
  'lei', 'Linhas e marcos históricos, documentos e validação de elegibilidade operacional. Fonte oficial ainda não confirmada — não citar como conclusão.',
  'a_revisar', 'obrigatoria', 'v1.0'
where not exists (
  select 1 from public.legal_reference_milestones where track_id = 'd47dacd7-b431-48eb-bb07-9ccf020fe512'::uuid
);

-- 2) Áustria já tinha regra (em_revisao) — promove a aprovado por autorização
--    explícita da proprietária (primeira onda), sem tocar no conteúdo.
update public.versioned_legal_rules
set status = 'aprovado', reviewed_by = '1540b457-47c3-4365-b31d-e6ff8764fae5', reviewed_at = now(),
    updated_by = '1540b457-47c3-4365-b31d-e6ff8764fae5'
where track_id = 'adc77966-0aaf-44f0-a822-94bbba326903'::uuid and status <> 'aprovado';

-- 3) Regras novas para os 9 países v1.0 que tinham trilha+marco mas nenhuma
--    regra formal. Conteúdo = PDF "Planejador com Marcos Jurídicos e CRM
--    Vivo" (08/09), seção 2, colunas "trilha/marco inicial" (-> tema/escopo)
--    e "uso no painel interno" (-> dados_necessarios).
insert into public.versioned_legal_rules
  (organization_id, track_id, tema, versao, fonte_referencia, escopo, dados_necessarios, status, reviewed_by, reviewed_at, created_by, updated_by)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', v.track_id::uuid, v.tema, 'v1.0', v.fonte, v.escopo, v.dados,
  v.status_novo,
  case when v.status_novo = 'aprovado' then '1540b457-47c3-4365-b31d-e6ff8764fae5' else null end,
  case when v.status_novo = 'aprovado' then now() else null end,
  '1540b457-47c3-4365-b31d-e6ff8764fae5', '1540b457-47c3-4365-b31d-e6ff8764fae5'
from (values
  ('2b41026f-7f94-466c-8856-3d5af0c5fd7c', 'Itália — descendência (jus sanguinis)',
   'Descendência; marcos de linha, naturalização e análise de rota aplicável.',
   'Lei nº 91/1992',
   'Checklist de cadeia documental, alertas de ruptura, confirmação de via e validação humana.',
   'aprovado'),
  ('1509c95d-bbdb-4304-8af3-8eac6b218992', 'Portugal — descendência direta',
   'Descendência direta e demais hipóteses aplicáveis; via depende de prova documental.',
   'Lei da Nacionalidade nº 37/1981',
   'Controle de ascendente, vínculo documental, pendências Brasil/Portugal e estado da via.',
   'aprovado'),
  ('6fb60dec-0495-4df7-9137-ec7c11099a1a', 'Espanha — memória democrática',
   'Memória democrática e outras hipóteses segundo vigência e documentação.',
   'Ley 20/2022 de Memoria Democrática',
   'Alerta de janela/regra, evidências de linha/exílio quando aplicável e revisão normativa.',
   'aprovado'),
  ('e0edd16a-4c60-4c96-9fed-07117a126608', 'Alemanha — descendência/reparação histórica',
   'Descendência, Feststellung, StAG e/ou reparação histórica conforme dados do ramo.',
   'Grundgesetz Art. 116(2); StAG §15',
   'Matriz de linha, perdas/aquisições, documentos, fonte oficial e gate jurídico.',
   'aprovado'),
  ('50d8c49b-5905-43ce-aaf9-55051c1dade5', 'Polônia — confirmação de cidadania',
   'Confirmação de cidadania/perda e cadeia documental.',
   'Procedimento de confirmação de cidadania',
   'Controle de continuidade de nacionalidade, registros migratórios/militares e evidência.',
   'aprovado'),
  ('d47b3bb2-18f2-4df4-8be4-537b7f52e574', 'Hungria — descendência/naturalização simplificada',
   'Descendência/naturalização simplificada conforme hipótese e requisito aplicável.',
   'Regime de naturalização simplificada',
   'Checklist de ancestralidade, idioma/entrevista quando pertinente e fonte consular.',
   'aprovado'),
  ('d47dacd7-b431-48eb-bb07-9ccf020fe512', 'Luxemburgo — recuperação/reconhecimento',
   'Recuperação/reconhecimento conforme prova de ascendência e registros.',
   'Recuperação/reconhecimento de nacionalidade — regime luxemburguês (fonte oficial a confirmar)',
   'Linhas e marcos históricos, documentos e validação de elegibilidade operacional.',
   'aprovado'),
  ('939a2d8f-1466-4f7a-a632-bef74ce98836', 'Croácia — descendência',
   'Descendência e demais vias conforme base normativa e prova documental.',
   'Lei de Nacionalidade e procedimento vigente',
   'Documentos de origem, rota, consulado/autoridade, pendências e capacidade operacional.',
   'em_revisao'),
  ('4a39cfc5-fb63-4bfa-b8a2-75fcaf761a46', 'Romênia — trilha por ramo',
   'Trilha de nacionalidade aplicável por ramo e documentação.',
   'Marco oficial a homologar — sem citação confirmada',
   'Estado de pesquisa, documentos, necessidade de confirmação de rota e parceiro/capacidade.',
   'em_revisao')
) as v(track_id, tema, escopo, fonte, dados, status_novo)
where not exists (
  select 1 from public.versioned_legal_rules vr where vr.track_id = v.track_id::uuid
);

-- 4) Auditoria append-only de toda a rodada.
insert into public.audit_logs (id, organization_id, user_id, acao, entidade, entidade_id, metadados)
select gen_random_uuid(), '11f32aae-ea08-47e0-8114-f5d8a900c9a1', '1540b457-47c3-4365-b31d-e6ff8764fae5',
  case when vr.status = 'aprovado' then 'biblioteca_homologacao' else 'biblioteca_regra_criada' end,
  'biblioteca_mestre', vr.id,
  jsonb_build_object('fonte', 'juridico', 'track_id', vr.track_id, 'tema', vr.tema, 'status', vr.status,
    'criterio', 'Transcrito do PDF Planejador Universal com Marcos Jurídicos e CRM Vivo (v1.0, 08/09/2026), seção 2. Primeira onda aprovada por autorização explícita da proprietária em 08/09/2026 no chat.')
from public.versioned_legal_rules vr
where vr.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and vr.created_at > now() - interval '2 minutes';
