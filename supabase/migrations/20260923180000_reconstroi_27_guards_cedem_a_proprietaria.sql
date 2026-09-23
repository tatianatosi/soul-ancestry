-- Reconstrução da migration 20260905210000_guards_cerimonia_cedem_a_proprietaria.sql.
--
-- Achado (23/09/2026): aquele arquivo só contém a criação do helper
-- `fn_proprietaria_operando()`. As 27 funções de guarda que o próprio
-- comentário da migration diz terem sido alteradas (cláusula de cessão logo
-- após o BEGIN) nunca foram capturadas em nenhum arquivo versionado — foram
-- editadas fora do controle de versão, no banco de produção original
-- (projeto zsxpdbhdvbuulwpepemd), e nunca propagadas para este repositório
-- nem para o banco real conectado ao Lovable (que ficou um mês inteiro sem
-- receber esta e outras 39 migrations, achado da mesma rodada).
--
-- Esta migration fecha a lacuna: reproduz, para as 27 funções, a mesma
-- cláusula documentada no comentário original —
--
--   if public.fn_proprietaria_operando() then
--     if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
--   end if;
--
-- — inserida logo após o BEGIN de cada função, sobre o corpo REAL de cada
-- uma (lido diretamente do banco em produção antes de escrever este
-- arquivo, nunca reconstruído de memória).
--
-- Exceção deliberada: `fn_legal_matrix_guard` bloqueia exclusão física
-- ("Exclusão física não permitida na matriz jurídica") como sua primeira
-- verificação. Essa proteção é uma das "Proteções" do AGENTS.md
-- ("bloqueio de exclusão física crítica" nunca é removido) — a cessão foi
-- inserida DEPOIS desse bloqueio, para que a proprietária continue sem
-- poder excluir fisicamente um tema jurídico, mesmo operando como admin.
--
-- Idempotente (CREATE OR REPLACE FUNCTION); não cria trigger novo, não
-- altera tabela, não apaga guarda nenhuma — só acrescenta o caminho de
-- override já autorizado pela Proprietária em 05/09/2026.

CREATE OR REPLACE FUNCTION public.fn_artifact_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.archived_at IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.archived_at IS NULL) THEN
    IF NEW.sucessor_id IS NULL AND COALESCE(btrim(NEW.archive_motivo), '') = '' THEN
      RAISE EXCEPTION 'Arquivar artefato exige sucessor ou motivo.';
    END IF;
    IF NEW.status_recuperacao = 'NAO_LOCALIZADO' THEN
      IF staff_meu_papel(NEW.organization_id) IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Artefato não localizado só pode ser arquivado por admin.';
      END IF;
      IF length(COALESCE(btrim(NEW.archive_motivo), '')) < 15 THEN
        RAISE EXCEPTION 'Arquivar artefato não localizado exige justificativa detalhada do admin.';
      END IF;
    END IF;
  END IF;

  IF NEW.sucessor_id IS NOT NULL AND NEW.sucessor_id = NEW.id THEN
    RAISE EXCEPTION 'Um artefato não pode substituir a si mesmo.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_atendimento_solicitacao_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE b text[];
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF TG_OP = 'INSERT' OR NEW.case_id IS DISTINCT FROM OLD.case_id THEN
    IF NEW.case_id IS NULL THEN RAISE EXCEPTION 'Solicitação exige caso vinculado.'; END IF;
    b := public.atendimento_bloqueios(NEW.case_id);
    IF array_length(b,1) > 0 THEN
      RAISE EXCEPTION 'Caso sem portal elegível: %', array_to_string(b, '; ');
    END IF;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(btrim(NEW.finalidade),'') = '' THEN RAISE EXCEPTION 'Informe a finalidade da solicitação.'; END IF;
    IF COALESCE(btrim(NEW.categoria),'') = '' THEN RAISE EXCEPTION 'Informe a categoria do documento solicitado.'; END IF;
    IF NEW.responsavel_id IS NULL THEN RAISE EXCEPTION 'Informe o responsável interno pela solicitação.'; END IF;
    IF NEW.prazo IS NULL THEN RAISE EXCEPTION 'Informe o prazo da solicitação.'; END IF;
    IF COALESCE(btrim(NEW.participante_nome),'') = '' THEN RAISE EXCEPTION 'Informe o participante a quem o documento se refere.'; END IF;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.fn_case_dependent_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  _participa boolean := coalesce(NEW.participa_do_contrato,false)
                     OR coalesce(NEW.possui_acesso_app,false)
                     OR coalesce(NEW.anexo_individual_aplicavel,false);
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.status_representacao = 'documentada'
     AND coalesce(NEW.documento_representacao_referencia_interna, '') = '' THEN
    RAISE EXCEPTION 'Representação documentada exige referência interna do documento.';
  END IF;

  IF _participa THEN
    IF NEW.status_representacao <> 'documentada' THEN
      RAISE EXCEPTION 'Contrato, App ou anexo individual do dependente exigem representação documentada.';
    END IF;
    IF coalesce(NEW.documento_representacao_referencia_interna, '') = '' THEN
      RAISE EXCEPTION 'Participação do dependente exige referência interna válida da representação.';
    END IF;
    IF NEW.dependent_person_id IS NULL OR NEW.titular_responsavel_legal_id IS NULL THEN
      RAISE EXCEPTION 'Participação do dependente exige pessoa e responsável legal referenciados por ID.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_case_service_promocao_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  pendentes integer;
  condicoes integer;
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.status IN ('approved','contracted','active')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN

    SELECT count(*) INTO pendentes
      FROM public.case_service_criterios c
     WHERE c.case_id = NEW.case_id
       AND c.archived_at IS NULL
       AND c.obrigatorio
       AND (c.status = 'pendente_decisao_humana'
            OR (c.status IN ('aceito','recusado') AND (c.decidido_por IS NULL OR c.decidido_em IS NULL)));
    IF pendentes > 0 THEN
      RAISE EXCEPTION 'CRITERIO_ACEITE_PENDENTE: % critério(s) obrigatório(s) sem decisão humana registrada.', pendentes;
    END IF;

    SELECT count(*) INTO condicoes
      FROM public.commercial_conditions cc
     WHERE cc.case_service_id = NEW.id
       AND cc.archived_at IS NULL
       AND cc.status = 'homologada';
    IF condicoes = 0 THEN
      RAISE EXCEPTION 'CONDICAO_COMERCIAL_NAO_HOMOLOGADA: serviço não pode sair de rascunho sem condição comercial homologada.';
    END IF;

    IF NEW.contrato_referencia_interna IS NULL OR btrim(NEW.contrato_referencia_interna) = '' THEN
      RAISE EXCEPTION 'REFERENCIA_CONTRATUAL_AUSENTE: serviço exige referência contratual interna antes da promoção.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_caso_ativacao_gates_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bloqueios text[];
  v_virou_ativo boolean;
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  v_virou_ativo :=
    (COALESCE(NEW.ativo, false) AND NOT COALESCE(OLD.ativo, false))
    OR (NEW.status = 'ativo' AND COALESCE(OLD.status, '') <> 'ativo')
    OR (NEW.eixo_operacao = 'caso_ativo' AND COALESCE(OLD.eixo_operacao, '') <> 'caso_ativo');

  IF NOT v_virou_ativo THEN
    RETURN NEW;
  END IF;

  v_bloqueios := public.case_activacao_bloqueios(NEW.id);

  IF array_length(v_bloqueios, 1) > 0 THEN
    RAISE EXCEPTION 'NÃO ELEGÍVEL — ATIVAÇÃO BLOQUEADA: % requisito(s) obrigatório(s) fora de validado. %',
      array_length(v_bloqueios, 1), array_to_string(v_bloqueios, ' | ');
  END IF;

  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.fn_caso_ativo_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_pend integer;
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.eixo_operacao = 'caso_ativo' AND COALESCE(OLD.eixo_operacao,'') <> 'caso_ativo' THEN
    IF NEW.onboarding_iniciado_em IS NULL THEN
      RAISE EXCEPTION 'Caso ativo exige onboarding iniciado.';
    END IF;
    SELECT count(*) INTO v_pend FROM public.onboarding_checklist
      WHERE case_id = NEW.id AND obrigatorio IS TRUE
        AND COALESCE(status,'pendente') NOT IN ('concluido','nao_aplicavel')
        AND archived_at IS NULL;
    IF v_pend > 0 THEN
      RAISE EXCEPTION 'Caso ativo bloqueado: % item(ns) obrigatório(s) do checklist de onboarding pendente(s).', v_pend;
    END IF;
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.fn_decisao_guard()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.status IN ('publicada','substituida') THEN
    IF COALESCE(btrim(NEW.contexto), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige contexto.';
    END IF;
    IF COALESCE(btrim(NEW.decisao), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige a decisão tomada.';
    END IF;
    IF COALESCE(btrim(NEW.impacto), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige o impacto esperado.';
    END IF;
    IF NEW.responsavel_user_id IS NULL AND COALESCE(btrim(NEW.responsavel_nome), '') = '' THEN
      RAISE EXCEPTION 'Publicar decisão exige responsável.';
    END IF;
    IF NEW.data_decisao IS NULL THEN
      RAISE EXCEPTION 'Publicar decisão exige a data da decisão.';
    END IF;
  END IF;

  IF NEW.archived_at IS NOT NULL AND COALESCE(btrim(NEW.archive_motivo), '') = '' THEN
    RAISE EXCEPTION 'Arquivar decisão exige motivo.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_evidence_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  ordem_ant int;
  ordem_nova int;
  tem_registro boolean;
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.evidence_nature = 'busca_negativa' THEN
    IF coalesce(btrim(NEW.negative_search_source), '') = ''
       OR NEW.negative_search_date IS NULL
       OR coalesce(btrim(NEW.negative_search_next_action), '') = '' THEN
      RAISE EXCEPTION 'Busca negativa exige fonte consultada, data da consulta e próxima ação possível.';
    END IF;
  END IF;

  IF NEW.evidence_nature = 'colaborativa_familiar' THEN
    IF NEW.epistemic_validation_status = 'VALIDADO_POR_DOCUMENTO' THEN
      RAISE EXCEPTION 'Fonte colaborativa não valida sozinha vínculo, direito, cidadania ou relação: exige documento.';
    END IF;
    IF NEW.confidence_level = 'ALTO' THEN
      RAISE EXCEPTION 'Fonte colaborativa não atinge confiança ALTA sem validação documental.';
    END IF;
  END IF;

  IF NEW.epistemic_validation_status = 'VALIDADO_POR_DOCUMENTO' THEN
    IF NEW.evidence_nature NOT IN ('documental_oficial','documental_nao_oficial') THEN
      RAISE EXCEPTION 'Validação por documento exige evidência de natureza documental.';
    END IF;
    IF NEW.reviewed_by IS NULL OR NEW.reviewed_at IS NULL THEN
      RAISE EXCEPTION 'Validação por documento exige responsável pela revisão e data da revisão.';
    END IF;
  END IF;

  ordem_ant := CASE coalesce(OLD.confidence_level, 'INICIAL')
                 WHEN 'INICIAL' THEN 0 WHEN 'BAIXO' THEN 1 WHEN 'MEDIO' THEN 2 ELSE 3 END;
  ordem_nova := CASE NEW.confidence_level
                 WHEN 'INICIAL' THEN 0 WHEN 'BAIXO' THEN 1 WHEN 'MEDIO' THEN 2 ELSE 3 END;

  IF TG_OP = 'INSERT' THEN
    IF NEW.confidence_level IN ('MEDIO','ALTO') THEN
      RAISE EXCEPTION 'Evidência nasce com confiança INICIAL ou BAIXO: elevação exige revisão registrada.';
    END IF;
    RETURN NEW;
  END IF;

  IF ordem_nova > ordem_ant THEN
    IF ordem_ant = 0 AND ordem_nova = 3 THEN
      RAISE EXCEPTION 'Salto de confiança INICIAL para ALTO não é permitido: eleve por etapas com revisão.';
    END IF;
    IF NEW.reviewed_by IS NULL OR NEW.reviewed_at IS NULL THEN
      RAISE EXCEPTION 'Elevação de confiança exige responsável e data da revisão.';
    END IF;
    SELECT EXISTS (
      SELECT 1 FROM public.evidence_validations v
       WHERE v.evidence_id = NEW.id
         AND v.confianca_nova = NEW.confidence_level
         AND v.revisado_em >= now() - interval '10 minutes'
    ) INTO tem_registro;
    IF NOT tem_registro THEN
      RAISE EXCEPTION 'Elevação de confiança exige justificativa registrada no histórico de validação.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_finding_projecao_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.confidence NOT IN ('baixa','media','alta') THEN
    RAISE EXCEPTION 'Nível de confiança inválido: %', NEW.confidence;
  END IF;
  IF NEW.client_projection_status NOT IN ('nao_projetado','rascunho_sanitizado','aprovado_interno','publicado_cliente') THEN
    RAISE EXCEPTION 'Situação de projeção inválida: %', NEW.client_projection_status;
  END IF;
  IF NEW.client_projection_status IN ('aprovado_interno','publicado_cliente')
     AND NEW.validation_status <> 'validado' THEN
    RAISE EXCEPTION 'Achado precisa estar validado internamente antes de qualquer projeção ao cliente.';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_g02_evento_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.validation_status = 'confirmado'
     AND NEW.evidence_id IS NULL AND NEW.source_id IS NULL THEN
    RAISE EXCEPTION 'Evento confirmado exige evidência ou fonte vinculada.';
  END IF;
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL AND NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'Data final do evento não pode ser anterior à data inicial.';
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.fn_g02_modulo_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.status_verificacao = 'confirmado'
     AND NEW.evidence_id IS NULL AND NEW.source_id IS NULL THEN
    RAISE EXCEPTION 'Registro histórico confirmado exige evidência ou fonte vinculada.';
  END IF;
  IF NEW.periodo_inicio IS NOT NULL AND NEW.periodo_fim IS NOT NULL
     AND NEW.periodo_fim < NEW.periodo_inicio THEN
    RAISE EXCEPTION 'Período final não pode ser anterior ao inicial.';
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.fn_g02_variante_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF length(btrim(coalesce(NEW.variante,''))) < 2 THEN
    RAISE EXCEPTION 'Variante de nome exige texto com pelo menos 2 caracteres.';
  END IF;
  IF NEW.estado_validacao = 'validada' AND NEW.evidence_id IS NULL AND NEW.source_id IS NULL THEN
    RAISE EXCEPTION 'Variante validada exige evidência ou fonte vinculada.';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.person_id <> OLD.person_id THEN
    RAISE EXCEPTION 'Variante de nome não pode ser transferida para outra pessoa.';
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.fn_guard_consentimento_ativacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.status = 'ativo' AND OLD.status IS DISTINCT FROM 'ativo' THEN
    IF NOT public.consentimento_ativo(NEW.id, NEW.cliente_id)
       AND NOT public.consentimento_dispensado(NEW.id, NEW.cliente_id) THEN
      RAISE EXCEPTION 'Ativação bloqueada: o caso não possui consentimento de tratamento de dados ativo nem exceção formal aprovada.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_guard_pesquisa_externa()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare c record;
begin
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  if NEW.caso_id is null then return NEW; end if;
  if coalesce(NEW.origem,'interna') in ('interna','cliente') then return NEW; end if;
  if TG_OP = 'UPDATE' and NEW.origem is not distinct from OLD.origem
     and NEW.caso_id is not distinct from OLD.caso_id then
    return NEW;
  end if;
  select * into c from public.crm_casos where id = NEW.caso_id;
  if c is null then return NEW; end if;
  if not coalesce(c.contrato_assinado,false) then
    raise exception 'Pesquisa externa bloqueada: o caso não possui contrato assinado.';
  end if;
  return NEW;
end $function$;

CREATE OR REPLACE FUNCTION public.fn_lead_desk_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  ativo boolean;
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  ativo := NEW.archived_at IS NULL
       AND coalesce(NEW.eixo_comercial, '') NOT IN ('perdido', 'encerrado_sem_aderencia');

  IF ativo THEN
    IF coalesce(NEW.area_responsavel, '') = '' OR coalesce(NEW.responsavel_nome, '') = ''
       OR coalesce(NEW.proxima_acao, '') = '' OR NEW.proxima_acao_em IS NULL THEN
      RAISE EXCEPTION 'Lead ativo exige área responsável, responsável nominal, próxima ação e data da próxima ação.';
    END IF;
  END IF;

  IF NEW.eixo_comercial IN ('discovery_realizada', 'diagnostico_em_elaboracao', 'proposta_enviada', 'negociacao') THEN
    IF coalesce(NEW.discovery_resultado, '') = '' OR NOT coalesce(NEW.resumo_validado, false)
       OR NEW.proxima_acao_em IS NULL THEN
      RAISE EXCEPTION 'Discovery realizada exige resultado da Discovery, resumo validado e próxima ação datada.';
    END IF;
  END IF;

  IF NEW.eixo_comercial IN ('proposta_enviada', 'negociacao') THEN
    IF coalesce(NEW.proposta_link_interno, '') = '' OR coalesce(NEW.responsavel_nome, '') = '' THEN
      RAISE EXCEPTION 'Proposta enviada exige link interno da proposta e responsável nominal.';
    END IF;
  END IF;

  IF NEW.eixo_comercial = 'perdido' AND coalesce(NEW.motivo_perda, '') = '' THEN
    RAISE EXCEPTION 'Lead perdido exige motivo de perda.';
  END IF;

  IF NEW.eixo_formalizacao IN ('contrato_assinado', 'pagamento_inicial_confirmado', 'cliente_ativo', 'onboarding_iniciado', 'caso_ativo')
     AND coalesce(NEW.contrato_link_interno, '') = '' THEN
    RAISE EXCEPTION 'Contrato assinado exige link interno do contrato.';
  END IF;

  IF NEW.eixo_formalizacao IN ('pagamento_inicial_confirmado', 'cliente_ativo', 'onboarding_iniciado', 'caso_ativo')
     AND coalesce(NEW.asaas_evento_referencia, '') = '' THEN
    RAISE EXCEPTION 'Pagamento inicial confirmado exige referência ao evento transacional do Asaas.';
  END IF;

  IF NEW.eixo_formalizacao = 'caso_ativo' AND NEW.case_id IS NULL THEN
    RAISE EXCEPTION 'Caso ativo exige caso operacional vinculado: Discovery ou proposta não abrem caso.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_lead_dossie_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.dossie_ativo THEN
    IF coalesce(btrim(NEW.dossie_mae_ref), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ID/nome do dossiê-mãe.';
    END IF;
    IF coalesce(btrim(NEW.dossie_ambiente), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ambiente autorizado.';
    END IF;
    IF coalesce(btrim(NEW.dossie_link_interno), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige link interno autorizado.';
    END IF;
    IF coalesce(btrim(NEW.dossie_nivel_acesso), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige nível de acesso.';
    END IF;
    IF coalesce(btrim(NEW.dossie_responsavel), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige responsável nominal.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_legal_clause_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.status IN ('aprovado', 'rejeitado', 'substituir', 'nao_aplicavel') THEN
    IF coalesce(NEW.responsavel_revisao, '') = '' OR coalesce(NEW.decisao, '') = ''
       OR coalesce(NEW.justificativa, '') = '' OR NEW.decidido_em IS NULL THEN
      RAISE EXCEPTION 'Decisão jurídica exige responsável, decisão, justificativa e data da decisão.';
    END IF;
  END IF;
  IF NEW.status = 'aprovado' AND coalesce(NEW.versao_juridica_aplicavel, '') = '' THEN
    RAISE EXCEPTION 'Tema aprovado exige versão jurídica aplicável registrada.';
  END IF;
  RETURN NEW;
END;
$function$;

-- Exceção deliberada: cessão inserida DEPOIS do bloqueio de exclusão física
-- (ver nota no cabeçalho deste arquivo).
CREATE OR REPLACE FUNCTION public.fn_legal_matrix_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Exclusão física não permitida na matriz jurídica. Use arquivamento com motivo.';
  END IF;

  if public.fn_proprietaria_operando() then
    return NEW;
  end if;

  IF NEW.status NOT IN ('pendente_revisao_juridica','aprovado','rejeitado','substituir','nao_aplicavel') THEN
    RAISE EXCEPTION 'Status de tema jurídico inválido: %', NEW.status;
  END IF;

  IF NEW.status = 'aprovado' THEN
    IF COALESCE(NEW.versao_juridica_aplicavel,'') = '' THEN
      RAISE EXCEPTION 'Tema aprovado exige versão jurídica aplicável registrada.';
    END IF;
    IF COALESCE(NEW.responsavel_revisao,'') = '' OR NEW.decidido_em IS NULL THEN
      RAISE EXCEPTION 'Tema aprovado exige responsável humano e data da decisão.';
    END IF;
    IF COALESCE(NEW.justificativa,'') = '' THEN
      RAISE EXCEPTION 'Tema aprovado exige justificativa registrada.';
    END IF;
  END IF;

  IF NEW.status IN ('rejeitado','substituir','nao_aplicavel')
     AND (COALESCE(NEW.responsavel_revisao,'') = '' OR NEW.decidido_em IS NULL OR COALESCE(NEW.justificativa,'') = '') THEN
    RAISE EXCEPTION 'Decisão jurídica exige responsável, data e justificativa.';
  END IF;

  IF NEW.archived_at IS NOT NULL AND COALESCE(NEW.archive_motivo,'') = '' THEN
    RAISE EXCEPTION 'Arquivamento exige motivo registrado.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_nucleo_dossie_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.dossie_status = 'ativo' THEN
    IF coalesce(btrim(NEW.dossie_mae), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ID/nome do dossiê-mãe.';
    END IF;
    IF coalesce(btrim(NEW.ambiente), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige ambiente autorizado.';
    END IF;
    IF coalesce(btrim(NEW.link_interno), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige link interno do dossiê.';
    END IF;
    IF coalesce(btrim(NEW.nivel_acesso), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige nível de acesso.';
    END IF;
    IF coalesce(btrim(NEW.responsavel_nome), '') = '' THEN
      RAISE EXCEPTION 'Dossiê ativo exige responsável nominal.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_piloto_contrato_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_piloto boolean; v_code text;
begin
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  select coalesce(c.piloto,false) into v_piloto from public.crm_casos c where c.id = NEW.case_id;
  if not coalesce(v_piloto,false) then return NEW; end if;

  select t.code into v_code from public.contract_templates t where t.id = NEW.template_id;
  if v_code is null then
    raise exception 'Contrato do piloto exige um modelo contratual ativo (MODELO ESTUDO ou base genérica v2).';
  end if;
  if v_code in ('MODELO-SIMPLES','MODELO-2024') then
    raise exception 'Modelo % não é aplicável ao piloto real. Use MODELO ESTUDO com a base contratual genérica v2.', v_code;
  end if;
  if v_code not in ('MODELO-ESTUDO','BASE-GEN-V2') then
    raise exception 'Modelo contratual não autorizado para o piloto real.';
  end if;

  if NEW.status = 'signed' and coalesce(OLD.status,'') <> 'signed' then
    if NEW.signed_at is null or NEW.signature_reference is null or NEW.signed_source is null then
      raise exception 'Assinatura exige data, origem externa e referência de assinatura registradas.';
    end if;
    if NEW.approved_for_send_by is null then
      raise exception 'Assinatura exige aprovação humana registrada antes do envio.';
    end if;
    if not exists (
      select 1 from public.contract_parties p
       where p.contract_id = NEW.id and p.archived_at is null
    ) then
      raise exception 'Assinatura exige partes qualificadas registradas no contrato.';
    end if;
  end if;
  return NEW;
end $function$;

CREATE OR REPLACE FUNCTION public.fn_quality_guard_ativacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_bloqueios text;
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF (NEW.status = 'ativo' OR NEW.ativo IS TRUE)
     AND (TG_OP = 'INSERT' OR (COALESCE(OLD.status,'') <> 'ativo' AND COALESCE(OLD.ativo,false) = false)) THEN
    SELECT string_agg(titulo, '; ') INTO v_bloqueios
      FROM quality_issues
     WHERE case_id = NEW.id AND severidade = 'critica'
       AND status IN ('aberta','reconhecida');
    IF v_bloqueios IS NOT NULL THEN
      RAISE EXCEPTION 'Ativação bloqueada por inconsistências críticas em aberto: %', v_bloqueios;
    END IF;
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.fn_research_case_estado_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF NEW.status NOT IN (
    'not_started','preparation','internal_research','awaiting_documents',
    'awaiting_review','paused','completed','archived'
  ) THEN
    RAISE EXCEPTION 'Situação de pesquisa inválida: %', NEW.status;
  END IF;

  IF coalesce(NEW.external_research_gate_status,'blocked_by_contract') = 'released_by_authorized_user'
     AND coalesce(NEW.external_research_authorization_status,'not_requested')
         NOT IN ('authorized','autorizada') THEN
    RAISE EXCEPTION 'Pesquisa externa não pode ser liberada sem autorização registrada.';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_rg_evento_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  if new.status = 'validated' and not public.rg_tem_evidencia_validada('event', new.id) then
    raise exception 'Evento validado exige ao menos uma evidência validada vinculada.';
  end if;
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.fn_rg_relatorio_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  if new.status = 'released' and (new.approved_by is null or new.client_release_authorized_by is null) then
    raise exception 'Relatório cliente-facing exige aprovação e liberação humana.';
  end if;
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.fn_rg_resumo_cliente_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare txt text;
begin
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  txt := lower(coalesce(new.title_client_facing,'') || ' ' || coalesce(new.summary_client_facing,''));
  if txt ~ '(hip[oó]tese|probabilidad|chance|elegibilidad|eleg[ií]vel|[êe]xito|garantia|prazo garantido|r\$|pre[çc]o|http|familysearch|sku)' then
    insert into public.research_audit_events(organization_id, research_case_id, entity_type, entity_id, event_type, metadata)
    values (new.organization_id, new.research_case_id, 'research_client_summaries', new.id, 'client_visibility_blocked', '{}'::jsonb);
    raise exception 'Resumo cliente-facing não pode conter hipótese, probabilidade, elegibilidade, preço ou referência de fonte.';
  end if;
  if new.status in ('approved_for_release','released') and new.approved_by is null then
    raise exception 'Resumo cliente-facing exige aprovação humana registrada.';
  end if;
  if new.status = 'released' and (new.released_by is null or new.released_at is null) then
    raise exception 'Liberação de resumo exige usuário e data de liberação.';
  end if;
  return new;
end $function$;

CREATE OR REPLACE FUNCTION public.fn_sku_price_exception_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF coalesce(btrim(NEW.motivo),'') = '' THEN
    RAISE EXCEPTION 'Exceção comercial exige motivo registrado.';
  END IF;
  IF coalesce(btrim(NEW.responsavel),'') = '' THEN
    RAISE EXCEPTION 'Exceção comercial exige responsável identificado.';
  END IF;
  IF NEW.status = 'aprovada' AND (NEW.aprovado_por IS NULL OR NEW.aprovado_em IS NULL) THEN
    RAISE EXCEPTION 'Exceção comercial só pode ser aprovada com aprovador humano e data de aprovação.';
  END IF;
  IF NEW.status = 'aprovada' AND NEW.valido_ate < current_date THEN
    RAISE EXCEPTION 'Exceção comercial aprovada exige validade futura.';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_third_party_expense_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  if public.fn_proprietaria_operando() then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  IF coalesce(btrim(NEW.descricao),'') = '' THEN
    RAISE EXCEPTION 'Despesa de terceiro exige descrição.';
  END IF;
  IF NEW.estado <> 'nao_aplicavel' THEN
    IF NEW.estado <> 'estimativa_pendente' AND NEW.estimativa_min IS NULL AND NEW.estimativa_max IS NULL THEN
      RAISE EXCEPTION 'Despesa aplicável exige estimativa ou faixa antes de ser comunicada.';
    END IF;
    IF NEW.estado IN ('estimada_comunicada','aguardando_aprovacao','aprovada','paga_diretamente_pelo_cliente','parcialmente_paga')
       AND NEW.comunicado_em IS NULL THEN
      RAISE EXCEPTION 'Despesa exige comunicação prévia ao cliente registrada.';
    END IF;
    IF NEW.estado IN ('aprovada','paga_diretamente_pelo_cliente','parcialmente_paga')
       AND (NEW.aprovado_pelo_cliente_em IS NULL OR coalesce(btrim(NEW.aprovacao_evidencia),'') = '') THEN
      RAISE EXCEPTION 'Execução de despesa de terceiro exige aprovação do cliente registrada com evidência.';
    END IF;
    IF NEW.executado_em IS NOT NULL AND NEW.aprovado_pelo_cliente_em IS NULL THEN
      RAISE EXCEPTION 'Despesa não pode ser executada antes da aprovação do cliente.';
    END IF;
  END IF;
  IF NEW.pagador <> 'cliente' AND NEW.excecao_id IS NULL THEN
    RAISE EXCEPTION 'Pagador diferente do cliente exige exceção formal aprovada.';
  END IF;
  RETURN NEW;
END;
$function$;
