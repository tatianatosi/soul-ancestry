-- Contexto jurídico dos países novos — Tchéquia (CZ) e Eslovênia (SI)
-- (P11, 25/09/2026). Fonte: docs/arquitetura/contexto-motor-cidadania-v1.0.md
-- (02/09/2026, seção "Matriz jurídica inicial"), mesma maturidade
-- ("Pesquisa jurídica pendente") que Croácia/Romênia já têm no banco hoje.
--
-- Mesmo padrão conservador dos dois: nenhuma fonte legal é afirmada como
-- homologada (`legal_reference_label`/`official_source_name` =
-- "a homologar", `legal_reference_summary` = "Não ofertar como rota
-- concluída sem revisão jurídica"). O conteúdo transcrito (via/eventos a
-- testar/evidência) vem do documento fonte, nunca inventado por analogia.
insert into public.citizenship_tracks
  (organization_id, code, pais, nacionalidade, via_preliminar, marco_juridico_referencia, status_via,
   requisitos_entrada, documentos_prioritarios, riscos_internos, autorizacao_pesquisa_necessaria,
   revisao_humana_juridica, status_atualizacao, pesquisa_externa_aplicavel, lifecycle_status,
   legal_reference_label, legal_reference_summary, official_source_name, official_source_url)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', v.code, v.pais, 'outra_nacionalidade', v.via_preliminar,
       'Marco oficial a homologar', 'em_confirmacao_juridica',
       null, v.documentos, v.riscos, true, 'obrigatoria', 'vigente', true, 'em_revisao',
       'Marco oficial a homologar', 'Não ofertar como rota concluída sem revisão jurídica.',
       'Fonte oficial a homologar', ''
from (values
  ('TRK-CZ-DESC', 'Tchéquia', 'descendencia', 'Registros e cadeia civil tchecos/tchecoslovacos.',
   'Testar cidadania tcheca/tchecoslovaca e evento de perda antes de confirmar rota (contexto regional 2026-09-02).'),
  ('TRK-SI-DESC', 'Eslovênia', 'descendencia', 'Registros e cadeia civil eslovenos; vínculo do emigrante.',
   'Separar cidadania, emigração e vínculo étnico — não presumir transmissão sem prova (contexto regional 2026-09-02).')
) as v(code, pais, via_preliminar, documentos, riscos)
where not exists (select 1 from public.citizenship_tracks t where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and t.code = v.code);

insert into public.versioned_legal_rules
  (organization_id, track_id, tema, status, escopo, dados_necessarios, fonte_referencia)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id, v.tema, 'em_revisao', v.escopo, v.dados,
       'Marco oficial a homologar — sem citação confirmada'
from public.citizenship_tracks t
join (values
  ('TRK-CZ-DESC', 'Tchéquia — descendência/declaração', 'Descendência e declaração conforme base normativa e prova documental.', 'Estado de pesquisa, registros civis, cadeia documental e evento de perda de cidadania tcheca/tchecoslovaca.'),
  ('TRK-SI-DESC', 'Eslovênia — descendência/emigrante', 'Descendência e vínculo de emigrante conforme base normativa e prova documental.', 'Estado de pesquisa, registros civis, cadeia documental e comprovação de vínculo/emigração.')
) as v(code, tema, escopo, dados) on v.code = t.code
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and not exists (select 1 from public.versioned_legal_rules r where r.track_id = t.id);

insert into public.legal_reference_milestones
  (organization_id, track_id, label, reference_type, status, review_required, lifecycle_status, summary_internal)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id, 'Marco oficial a homologar', 'lei', 'a_revisar', 'obrigatoria', 'em_revisao',
       'Não ofertar como rota concluída sem revisão jurídica.'
from public.citizenship_tracks t
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and t.code in ('TRK-CZ-DESC', 'TRK-SI-DESC')
  and not exists (select 1 from public.legal_reference_milestones m where m.track_id = t.id);
