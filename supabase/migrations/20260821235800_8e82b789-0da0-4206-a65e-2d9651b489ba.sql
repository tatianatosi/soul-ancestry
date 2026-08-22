-- 1. citizenship_tracks: governança da Biblioteca Mestre
ALTER TABLE public.citizenship_tracks
  ADD COLUMN IF NOT EXISTS track_name text,
  ADD COLUMN IF NOT EXISTS legal_reference_label text,
  ADD COLUMN IF NOT EXISTS legal_reference_summary text,
  ADD COLUMN IF NOT EXISTS official_source_name text,
  ADD COLUMN IF NOT EXISTS official_source_url text,
  ADD COLUMN IF NOT EXISTS pesquisa_externa_aplicavel boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS versao text,
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS criterio_aprovacao text,
  ADD COLUMN IF NOT EXISTS evidencia_aprovacao_referencia text,
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'rascunho';

DO $$ BEGIN
  ALTER TABLE public.citizenship_tracks
    ADD CONSTRAINT citizenship_tracks_lifecycle_chk
    CHECK (lifecycle_status IN ('rascunho','em_revisao','homologado','vigente','substituido','suspenso','arquivado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.fn_citizenship_track_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.lifecycle_status = 'vigente' THEN
    IF coalesce(NEW.versao,'') = '' OR NEW.owner_id IS NULL
       OR coalesce(NEW.criterio_aprovacao,'') = ''
       OR coalesce(NEW.evidencia_aprovacao_referencia,'') = '' THEN
      RAISE EXCEPTION 'Trilha só fica vigente com versão, responsável, critério e evidência de aprovação registrados';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_citizenship_track_guard ON public.citizenship_tracks;
CREATE TRIGGER trg_citizenship_track_guard
  BEFORE INSERT OR UPDATE ON public.citizenship_tracks
  FOR EACH ROW EXECUTE FUNCTION public.fn_citizenship_track_guard();

-- 2. Marcos jurídicos de referência
CREATE TABLE IF NOT EXISTS public.legal_reference_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  track_id uuid NOT NULL REFERENCES public.citizenship_tracks(id),
  label text NOT NULL,
  reference_type text NOT NULL DEFAULT 'lei'
    CHECK (reference_type IN ('lei','artigo','regulamento','procedimento','prazo','requisito','fonte_oficial')),
  summary_internal text,
  official_source_url text,
  status text NOT NULL DEFAULT 'a_revisar'
    CHECK (status IN ('vigente','a_revisar','desatualizado','historico','encerrado')),
  verified_at timestamptz,
  verified_by uuid,
  review_required text NOT NULL DEFAULT 'a_definir'
    CHECK (review_required IN ('obrigatoria','dispensa_homologada','a_definir')),
  notes text,
  versao text,
  lifecycle_status text NOT NULL DEFAULT 'rascunho'
    CHECK (lifecycle_status IN ('rascunho','em_revisao','homologado','vigente','substituido','suspenso','arquivado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);

GRANT SELECT, INSERT, UPDATE ON public.legal_reference_milestones TO authenticated;
GRANT ALL ON public.legal_reference_milestones TO service_role;
ALTER TABLE public.legal_reference_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS legal_reference_milestones_sel ON public.legal_reference_milestones;
CREATE POLICY legal_reference_milestones_sel ON public.legal_reference_milestones
  FOR SELECT TO authenticated USING (is_org_member(organization_id));
DROP POLICY IF EXISTS legal_reference_milestones_ins ON public.legal_reference_milestones;
CREATE POLICY legal_reference_milestones_ins ON public.legal_reference_milestones
  FOR INSERT TO authenticated WITH CHECK (can_write(organization_id));
DROP POLICY IF EXISTS legal_reference_milestones_upd ON public.legal_reference_milestones;
CREATE POLICY legal_reference_milestones_upd ON public.legal_reference_milestones
  FOR UPDATE TO authenticated USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_legal_milestone_meta()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_legal_milestone_meta ON public.legal_reference_milestones;
CREATE TRIGGER trg_legal_milestone_meta BEFORE UPDATE ON public.legal_reference_milestones
  FOR EACH ROW EXECUTE FUNCTION public.fn_legal_milestone_meta();

-- 3. Ficha de call/lead: consentimento, trilha, pesquisa prévia
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS consentimento_status text NOT NULL DEFAULT 'nao_solicitado',
  ADD COLUMN IF NOT EXISTS consentimento_em timestamptz,
  ADD COLUMN IF NOT EXISTS consentimento_canal text,
  ADD COLUMN IF NOT EXISTS consentimento_versao_aviso text,
  ADD COLUMN IF NOT EXISTS nacionalidades_interesse text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pais_linha_prioritaria text,
  ADD COLUMN IF NOT EXISTS localidades_conhecidas text,
  ADD COLUMN IF NOT EXISTS documentos_chave text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trilha_referencia_id uuid REFERENCES public.citizenship_tracks(id),
  ADD COLUMN IF NOT EXISTS marco_referencia_id uuid REFERENCES public.legal_reference_milestones(id),
  ADD COLUMN IF NOT EXISTS pesquisa_previa_autorizacao text NOT NULL DEFAULT 'nao_solicitada',
  ADD COLUMN IF NOT EXISTS pesquisa_previa_escopo text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pesquisa_previa_limite text;

DO $$ BEGIN
  ALTER TABLE public.leads ADD CONSTRAINT leads_consentimento_status_chk
    CHECK (consentimento_status IN ('nao_solicitado','pendente','concedido','recusado'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.leads ADD CONSTRAINT leads_pesquisa_previa_autorizacao_chk
    CHECK (pesquisa_previa_autorizacao IN ('nao_solicitada','pendente','registrada','nao_autorizada','nao_aplicavel'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Travas de Discovery no banco
CREATE OR REPLACE FUNCTION public.fn_lead_discovery_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.archived_at IS NOT NULL THEN RETURN NEW; END IF;

  -- Call realizada
  IF NEW.status_call = 'realizada' THEN
    IF coalesce(NEW.resumo_call,'') = '' OR coalesce(NEW.resumo_validado,false) = false
       OR coalesce(NEW.discovery_resultado,'') = ''
       OR coalesce(NEW.proxima_acao,'') = '' OR NEW.proxima_acao_em IS NULL THEN
      RAISE EXCEPTION 'Call realizada exige resumo validado, resultado da Discovery e próxima ação com prazo';
    END IF;
  END IF;

  -- Consentimento e gravação
  IF NEW.consentimento_status = 'concedido' THEN
    IF NEW.consentimento_em IS NULL OR coalesce(NEW.consentimento_canal,'') = ''
       OR coalesce(NEW.consentimento_versao_aviso,'') = '' THEN
      RAISE EXCEPTION 'Consentimento concedido exige data/hora, canal e versão do aviso';
    END IF;
  ELSE
    NEW.consentimento_gravacao := false;
    IF coalesce(NEW.gravacao_link_interno,'') <> '' THEN
      RAISE EXCEPTION 'Gravação/transcrição só é permitida com consentimento concedido';
    END IF;
  END IF;

  -- SPIN concluído exige resumo correspondente
  IF coalesce(NEW.spin_situacao,false) AND coalesce(NEW.spin_problema,false)
     AND coalesce(NEW.spin_implicacao,false) AND coalesce(NEW.spin_necessidade,false)
     AND length(coalesce(NEW.resumo_call,'')) < 30 THEN
    RAISE EXCEPTION 'SPIN concluído exige resumo validado correspondente na ficha';
  END IF;

  -- Sinal de aderência forte/provável
  IF NEW.elegibilidade_preliminar IN ('forte','provavel') THEN
    IF coalesce(NEW.confianca_triagem,'') = '' OR coalesce(NEW.via_juridica_preliminar,'') = ''
       OR coalesce(NEW.geracao_ascendente,'') = '' OR coalesce(NEW.linha_transmissao,'') = ''
       OR coalesce(NEW.estado_documental_inicial,'') = '' THEN
      RAISE EXCEPTION 'Sinal forte/provável exige confiança, via preliminar, geração, linha de transmissão e estado documental';
    END IF;
  END IF;

  -- SKU é referência somente após produto recomendado
  IF coalesce(NEW.sku_referencia,'') <> ''
     AND coalesce(array_length(NEW.produtos_recomendados,1),0) = 0 THEN
    RAISE EXCEPTION 'Referência de SKU exige produto/serviço recomendado registrado antes';
  END IF;

  -- Despesas de terceiros
  IF NEW.despesas_terceiros_status = 'aprovadas' THEN
    IF coalesce(NEW.despesas_terceiros_faixa,'') = '' OR coalesce(NEW.despesas_terceiros_regra,'') = ''
       OR coalesce(NEW.proposta_referencia_interna,'') = '' THEN
      RAISE EXCEPTION 'Despesa aprovada exige faixa, regra de pagamento e referência de proposta/escopo';
    END IF;
    IF NEW.despesas_terceiros_regra = 'clube_nao_antecipa' THEN
      RAISE EXCEPTION 'Despesa aprovada exige regra de pagamento direto do cliente ao terceiro';
    END IF;
  END IF;

  -- Pesquisa prévia
  IF coalesce(array_length(NEW.pesquisa_previa_escopo,1),0) > 0
     AND NEW.pesquisa_previa_autorizacao <> 'registrada' THEN
    RAISE EXCEPTION 'Escopo de pesquisa prévia exige autorização registrada';
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_lead_discovery_guard ON public.leads;
CREATE TRIGGER trg_lead_discovery_guard
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_lead_discovery_guard();

-- 5. Trilhas jurídicas iniciais (conteúdo interno, em revisão)
INSERT INTO public.citizenship_tracks
  (organization_id, code, pais, nacionalidade, via_preliminar, track_name,
   marco_juridico_referencia, legal_reference_label, legal_reference_summary,
   official_source_name, official_source_url, status_via, status_atualizacao,
   revisao_humana_juridica, idioma_entrevista, autorizacao_pesquisa_necessaria,
   lifecycle_status, versao, ativo)
SELECT o.id, t.code, t.pais, t.nacionalidade, t.via, t.nome,
       t.marco, t.marco, t.resumo, t.fonte_nome, t.fonte_url,
       t.status_via, 'a_revisar', t.revisao, t.idioma, true, 'em_revisao', 'v1.0', true
FROM public.organizations o
CROSS JOIN (VALUES
  ('TRK-IT-DESC','Itália','italiana','descendencia','Itália — descendência (jus sanguinis)','Lei nº 91/1992','Cidadania por descendência; linha materna pré-1948 exige atenção específica e via judicial.','Normattiva','https://www.normattiva.it','aberta_com_requisito','obrigatoria','nao'),
  ('TRK-PT-DESC','Portugal','portuguesa','descendencia','Portugal — descendência direta','Lei da Nacionalidade nº 37/1981','Atribuição/aquisição conforme grau de descendência e requisitos vigentes.','Diário da República','https://diariodarepublica.pt','aberta_com_requisito','obrigatoria','a_confirmar'),
  ('TRK-ES-MEMORIA','Espanha','espanhola','reparacao_historica','Espanha — Memória Democrática','Ley 20/2022 de Memoria Democrática','Janelas e vias exigem verificação atual antes de qualquer oferta baseada em prazo.','BOE','https://www.boe.es','em_confirmacao_juridica','obrigatoria','nao'),
  ('TRK-DE-REPARACAO','Alemanha','alema','reparacao_historica','Alemanha — reparação histórica','Grundgesetz Art. 116(2); StAG §15','Restauração/naturalização para descendentes de perseguidos, conforme enquadramento.','Gesetze im Internet','https://www.gesetze-im-internet.de','aberta_com_requisito','obrigatoria','a_confirmar'),
  ('TRK-AT-58C','Áustria','austriaca','reparacao_historica','Áustria — reparação histórica','§58c StbG','Exige evidência de perseguição/fuga conforme o caso; revisão humana obrigatória.','RIS','https://www.ris.bka.gv.at','aberta_com_requisito','obrigatoria','nao'),
  ('TRK-PL-CONF','Polônia','polonesa','descendencia','Polônia — confirmação de cidadania','Procedimento de confirmação de cidadania','Confirmação por descendência com revisão documental obrigatória.','Fonte oficial a homologar','','aberta_com_requisito','obrigatoria','a_confirmar'),
  ('TRK-HU-SIMPL','Hungria','outra_nacionalidade','naturalizacao_residencia','Hungria — naturalização simplificada','Regime de naturalização simplificada','Revisar exigência de idioma/entrevista e documentação de ascendência.','Fonte oficial a homologar','','aberta_com_requisito','obrigatoria','ambos'),
  ('TRK-LU-REC','Luxemburgo','outra_nacionalidade','descendencia','Luxemburgo — recuperação/descendência','Lei de Nacionalidade e procedimento vigente','Revisão documental obrigatória; verificar regime aplicável e prazos.','Fonte oficial a homologar','','em_confirmacao_juridica','obrigatoria','a_confirmar'),
  ('TRK-HR-DESC','Croácia','outra_nacionalidade','descendencia','Croácia — descendência','Marco oficial a homologar','Não ofertar como rota concluída sem revisão jurídica.','Fonte oficial a homologar','','em_confirmacao_juridica','obrigatoria','a_confirmar'),
  ('TRK-RO-DESC','Romênia','outra_nacionalidade','descendencia','Romênia — descendência','Marco oficial a homologar','Não ofertar como rota concluída sem revisão jurídica.','Fonte oficial a homologar','','em_confirmacao_juridica','obrigatoria','a_confirmar'),
  ('TRK-MULTI','Multipaís','nacionalidade_a_confirmar','via_a_confirmar','Multipaís — em investigação','Não aplicável','Triagem e pesquisa documental inicial antes de definir país/linha.','Não aplicável','','em_confirmacao_juridica','obrigatoria','a_confirmar')
) AS t(code, pais, nacionalidade, via, nome, marco, resumo, fonte_nome, fonte_url, status_via, revisao, idioma)
WHERE NOT EXISTS (
  SELECT 1 FROM public.citizenship_tracks c
  WHERE c.organization_id = o.id AND c.code = t.code
);

INSERT INTO public.legal_reference_milestones
  (organization_id, track_id, label, reference_type, summary_internal, official_source_url,
   status, review_required, versao, lifecycle_status)
SELECT c.organization_id, c.id, c.legal_reference_label, 'lei',
       c.legal_reference_summary, nullif(c.official_source_url,''),
       'a_revisar', 'obrigatoria', 'v1.0', 'em_revisao'
FROM public.citizenship_tracks c
WHERE c.code LIKE 'TRK-%'
  AND c.legal_reference_label IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.legal_reference_milestones m WHERE m.track_id = c.id
  );