-- Contexto jurídico dos países novos — Países Baixos (NL), Estônia (EE),
-- Letônia (LV) e Lituânia (LT) (P12, 25/09/2026). Fonte:
-- docs/arquitetura/contexto-motor-cidadania-v1.0.md (02/09/2026), seções
-- "Países Baixos" e "Bálticos", e YAML de pré-carga
-- (`legal_research_pilot: [NL, EE, LV, LT]`).
--
-- Decisão de escopo (não fabricada — vem da própria pré-carga do
-- documento fonte): Bélgica (BE) NÃO entra nesta migration. O documento
-- classifica BE em `detection_only`, mesmo nível de SK/UA/BG/RS/MD
-- ("Detecção de vínculo; backlog jurídico" / "PESQUISA_JURIDICA_PENDENTE,
-- sem resultado ou preço") — distinto de NL/EE/LV/LT, que o próprio
-- documento agrupa como `legal_research_pilot` ("Piloto jurídico
-- interno"). Construir uma trilha com conteúdo para BE agora contrariaria
-- a própria cautela do documento-fonte.
--
-- Mesmo padrão conservador de P11 (Tchéquia/Eslovênia): nenhuma fonte
-- legal é afirmada como homologada (`legal_reference_label`/
-- `official_source_name` = "a homologar", `legal_reference_summary` =
-- "Não ofertar como rota concluída sem revisão jurídica"). Conteúdo
-- transcrito das seções "Países Baixos"/"Bálticos" do documento fonte,
-- nunca inventado por analogia.
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
  ('TRK-NL-FILIACAO', 'Países Baixos', 'nascimento/filiação; reconhecimento; adoção; opção; naturalização; recuperação',
   'Certidões integrais, passaportes/certidões neerlandesas, atos de casamento, reconhecimento e naturalização.',
   'Pergunta central: pai ou mãe era neerlandês na data do nascimento e qual regra temporal vigorava? Cortes a testar: nascimento, casamento dos pais, reconhecimento, naturalização, perda e residência exterior. Risco: presumir transmissão por avô sem testar interrupção geracional; testar perda automática por 13 anos fora do Reino/UE sem renovar passaporte/certificado (contexto regional 2026-09-02).'),
  ('TRK-EE-DESC', 'Estônia', 'nascimento; restauração de perda na menoridade; naturalização',
   'Documento estoniano e cadeia civil/genealógica que comprove cidadania do genitor no nascimento.',
   'Marco histórico: cidadania do genitor no nascimento. Alerta: etnia não equivale a cidadania — não presumir vínculo étnico como prova de cidadania (contexto regional 2026-09-02).'),
  ('TRK-LV-DESC', 'Letônia', 'descendente; exilado; letões/lívios; naturalização',
   'Passaporte pré-guerra, censo, registros civis, fiscal/militar.',
   'Marco histórico: cidadania em 17/06/1940 e ocupações até 04/05/1990. Alerta: separar continuidade, exílio e origem étnica — rota de letões/lívios exige ancestral residente entre 1881 e 17/06/1940 mais pertencimento étnico e fluência, não pode ser confundida com continuidade de cidadania (contexto regional 2026-09-02).'),
  ('TRK-LT-RESTAURACAO', 'Lituânia', 'restauração; origem; simplificada/geral',
   'Documentos de cidadania/origem, saída/exílio e cadeia civil/genealógica.',
   'Marco histórico: cidadania pré-ocupação e saída antes de 11/03/1990, conforme rota. Alerta: validar exceção de dupla cidadania antes de confirmar rota (contexto regional 2026-09-02).')
) as v(code, pais, via_preliminar, documentos, riscos)
where not exists (select 1 from public.citizenship_tracks t where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' and t.code = v.code);

insert into public.versioned_legal_rules
  (organization_id, track_id, tema, status, escopo, dados_necessarios, fonte_referencia)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id, v.tema, 'em_revisao', v.escopo, v.dados,
       'Marco oficial a homologar — sem citação confirmada'
from public.citizenship_tracks t
join (values
  ('TRK-NL-FILIACAO', 'Países Baixos — nascimento/filiação, reconhecimento, opção e naturalização',
   'Aquisição automática por nascimento/reconhecimento, opção (grupos específicos) e naturalização (regra geral: cinco anos de residência), conforme base normativa e prova documental.',
   'Nacionalidade parental, data de casamento dos pais, data de nascimento, cortes de reconhecimento/naturalização/perda, e teste de perda automática por residência prolongada fora do Reino/UE.'),
  ('TRK-EE-DESC', 'Estônia — nascimento e restauração',
   'Cidadania por nascimento quando ao menos um genitor era cidadão, restauração para perda na menoridade, naturalização; restrição geral à dupla cidadania.',
   'Documento estoniano do genitor, cadeia civil/genealógica, e verificação de que não há confusão entre etnia e cidadania.'),
  ('TRK-LV-DESC', 'Letônia — descendência, exílio e origem étnica',
   'Continuidade (passaporte pré-guerra/registros civis/censo/arquivos), exílio (cidadania em 17/06/1940 + fuga/deportação + impossibilidade de retorno até 04/05/1990) e rota de letões/lívios (residência 1881–17/06/1940 + pertencimento étnico + fluência), tratadas como rotas distintas.',
   'Prova de continuidade documental, prova de exílio/deportação, ou prova de residência/etnia/idioma conforme a rota testada — nunca combinadas sem distinção.'),
  ('TRK-LT-RESTAURACAO', 'Lituânia — restauração, origem e regime simplificado/geral',
   'Restauração, aquisição, concessão, devolução, confirmação e perda avaliadas pelo Migration Department; emissão de certificados de origem e direito de restauração.',
   'Cidadania pré-ocupação, data de saída (antes de 11/03/1990 conforme rota), cadeia documental de origem/saída/exílio, e validação de eventual exceção de dupla cidadania.')
) as v(code, tema, escopo, dados) on v.code = t.code
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and not exists (select 1 from public.versioned_legal_rules r where r.track_id = t.id);

insert into public.legal_reference_milestones
  (organization_id, track_id, label, reference_type, status, review_required, lifecycle_status, summary_internal)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1', t.id, 'Marco oficial a homologar', 'lei', 'a_revisar', 'obrigatoria', 'em_revisao',
       'Não ofertar como rota concluída sem revisão jurídica.'
from public.citizenship_tracks t
where t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and t.code in ('TRK-NL-FILIACAO', 'TRK-EE-DESC', 'TRK-LV-DESC', 'TRK-LT-RESTAURACAO')
  and not exists (select 1 from public.legal_reference_milestones m where m.track_id = t.id);
