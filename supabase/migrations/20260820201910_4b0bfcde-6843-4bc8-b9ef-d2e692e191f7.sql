-- A. Checklist cadastral por pessoa (referência obrigatória + reconciliação auditável)
ALTER TABLE public.checklist_cadastral
  ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.clientes(id),
  ADD COLUMN IF NOT EXISTS pessoa_ref_tabela text,
  ADD COLUMN IF NOT EXISTS pessoa_nome_historico text,
  ADD COLUMN IF NOT EXISTS reconciliado_em timestamptz,
  ADD COLUMN IF NOT EXISTS reconciliado_por uuid,
  ADD COLUMN IF NOT EXISTS reconciliacao_motivo text;

CREATE OR REPLACE FUNCTION public.fn_checklist_pessoa_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _nome text;
  _homonimo uuid;
BEGIN
  IF NEW.pessoa_tipo IN ('titular','dependente') THEN
    IF NEW.pessoa_ref_id IS NULL THEN
      SELECT id INTO _homonimo FROM public.case_members
        WHERE case_id = NEW.case_id AND archived_at IS NULL
          AND lower(btrim(nome)) = lower(btrim(coalesce(NEW.pessoa_nome,'')))
        LIMIT 1;
      IF _homonimo IS NULL THEN
        SELECT id INTO _homonimo FROM public.case_dependents
          WHERE case_id = NEW.case_id AND archived_at IS NULL
            AND lower(btrim(nome_completo)) = lower(btrim(coalesce(NEW.pessoa_nome,'')))
          LIMIT 1;
      END IF;
      IF _homonimo IS NOT NULL THEN
        RAISE EXCEPTION 'Já existe pessoa registrada neste caso para "%": use a referência (pessoa_ref_id), não o nome.', NEW.pessoa_nome;
      END IF;
      RAISE EXCEPTION 'Checklist cadastral exige referência obrigatória à pessoa (pessoa_ref_id).';
    END IF;

    -- Nome canônico vem do cadastro referenciado, nunca de texto solto.
    IF NEW.pessoa_tipo = 'dependente' THEN
      SELECT nome_completo INTO _nome FROM public.case_dependents WHERE id = NEW.pessoa_ref_id AND case_id = NEW.case_id;
      IF _nome IS NULL THEN
        SELECT nome INTO _nome FROM public.case_members WHERE id = NEW.pessoa_ref_id AND case_id = NEW.case_id;
      END IF;
      IF _nome IS NULL THEN
        RAISE EXCEPTION 'Referência de dependente inválida para este caso.';
      END IF;
      NEW.pessoa_ref_tabela := coalesce(NEW.pessoa_ref_tabela, 'case_dependents');
    ELSE
      SELECT nome INTO _nome FROM public.case_members WHERE id = NEW.pessoa_ref_id AND case_id = NEW.case_id;
      IF _nome IS NULL THEN
        RAISE EXCEPTION 'Referência de pessoa inválida para este caso.';
      END IF;
      NEW.pessoa_ref_tabela := coalesce(NEW.pessoa_ref_tabela, 'case_members');
    END IF;

    IF NEW.cliente_id IS NOT NULL THEN
      SELECT nome INTO _nome FROM public.clientes WHERE id = NEW.cliente_id;
      IF _nome IS NULL THEN
        RAISE EXCEPTION 'Cliente canônico informado não existe.';
      END IF;
    END IF;

    IF TG_OP = 'UPDATE' AND coalesce(OLD.pessoa_nome,'') <> coalesce(_nome,'') THEN
      NEW.pessoa_nome_historico := coalesce(NEW.pessoa_nome_historico, OLD.pessoa_nome);
      IF coalesce(btrim(NEW.reconciliacao_motivo),'') = '' THEN
        RAISE EXCEPTION 'Reconciliação de pessoa exige motivo registrado.';
      END IF;
      NEW.reconciliado_em := coalesce(NEW.reconciliado_em, now());
      NEW.reconciliado_por := coalesce(NEW.reconciliado_por, auth.uid());
      INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, valores_anteriores, valores_posteriores, metadados)
      VALUES (NEW.organization_id, auth.uid(), 'reconciliacao_pessoa', 'checklist_cadastral', NEW.id,
              jsonb_build_object('pessoa_nome', OLD.pessoa_nome, 'pessoa_ref_id', OLD.pessoa_ref_id, 'cliente_id', OLD.cliente_id),
              jsonb_build_object('pessoa_nome', _nome, 'pessoa_ref_id', NEW.pessoa_ref_id, 'cliente_id', NEW.cliente_id),
              jsonb_build_object('motivo', NEW.reconciliacao_motivo));
    END IF;

    NEW.pessoa_nome := _nome;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_checklist_pessoa_guard ON public.checklist_cadastral;
CREATE TRIGGER trg_checklist_pessoa_guard
BEFORE INSERT OR UPDATE ON public.checklist_cadastral
FOR EACH ROW EXECUTE FUNCTION public.fn_checklist_pessoa_guard();

-- B. Dependentes: FKs reais e travas de participação
ALTER TABLE public.case_dependents
  DROP CONSTRAINT IF EXISTS case_dependents_dependent_person_fk,
  DROP CONSTRAINT IF EXISTS case_dependents_titular_responsavel_fk;
ALTER TABLE public.case_dependents
  ADD CONSTRAINT case_dependents_dependent_person_fk FOREIGN KEY (dependent_person_id) REFERENCES public.case_members(id),
  ADD CONSTRAINT case_dependents_titular_responsavel_fk FOREIGN KEY (titular_responsavel_legal_id) REFERENCES public.case_members(id);

CREATE OR REPLACE FUNCTION public.fn_case_dependent_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _participa boolean := coalesce(NEW.participa_do_contrato,false)
                     OR coalesce(NEW.possui_acesso_app,false)
                     OR coalesce(NEW.anexo_individual_aplicavel,false);
BEGIN
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
$$;

-- C. Completude do núcleo por critérios persistidos (nunca booleano opaco)
CREATE OR REPLACE FUNCTION public.nucleo_completude(_case uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _n public.nucleos_familiares%ROWTYPE;
  _participantes_sem_papel int := 0;
  _participantes int := 0;
  _deps_sem_status int := 0;
  _deps int := 0;
  _itens jsonb := '[]'::jsonb;
BEGIN
  SELECT * INTO _n FROM public.nucleos_familiares
    WHERE case_id = _case AND archived_at IS NULL ORDER BY created_at LIMIT 1;

  IF _n.id IS NOT NULL THEN
    SELECT count(*), count(*) FILTER (WHERE coalesce(btrim(papel),'') = '')
      INTO _participantes, _participantes_sem_papel
      FROM public.nucleo_membros WHERE nucleo_id = _n.id AND archived_at IS NULL;
  END IF;

  SELECT count(*), count(*) FILTER (WHERE status_representacao IS NULL OR btrim(status_representacao) = '')
    INTO _deps, _deps_sem_status
    FROM public.case_dependents WHERE case_id = _case AND archived_at IS NULL;

  _itens := jsonb_build_array(
    jsonb_build_object('chave','nucleo_vinculado','rotulo','Núcleo familiar vinculado ao caso',
      'ok', _n.id IS NOT NULL,
      'motivo', CASE WHEN _n.id IS NULL THEN 'Nenhum núcleo familiar ativo vinculado a este caso.' ELSE NULL END),
    jsonb_build_object('chave','contratante','rotulo','Contratante identificada',
      'ok', coalesce(btrim(_n.contratante_nome),'') <> '',
      'motivo', CASE WHEN coalesce(btrim(_n.contratante_nome),'') = '' THEN 'Contratante do núcleo não identificada.' ELSE NULL END),
    jsonb_build_object('chave','participantes','rotulo','Participantes com papel definido',
      'ok', _participantes > 0 AND _participantes_sem_papel = 0,
      'motivo', CASE WHEN _participantes = 0 THEN 'Nenhum participante registrado no núcleo.'
                     WHEN _participantes_sem_papel > 0 THEN _participantes_sem_papel || ' participante(s) sem papel definido.'
                     ELSE NULL END),
    jsonb_build_object('chave','dependentes','rotulo','Dependentes com status de representação',
      'ok', _deps_sem_status = 0,
      'motivo', CASE WHEN _deps_sem_status > 0 THEN _deps_sem_status || ' dependente(s) sem status de representação.' ELSE NULL END),
    jsonb_build_object('chave','dossie_ambiente','rotulo','Dossiê-mãe, ambiente e nível de acesso',
      'ok', coalesce(btrim(_n.dossie_mae),'') <> '' AND coalesce(btrim(_n.ambiente),'') <> '' AND coalesce(btrim(_n.nivel_acesso),'') <> '',
      'motivo', CASE WHEN _n.id IS NULL THEN 'Sem núcleo para avaliar dossiê e ambiente.'
                     WHEN coalesce(btrim(_n.dossie_mae),'') = '' OR coalesce(btrim(_n.ambiente),'') = '' OR coalesce(btrim(_n.nivel_acesso),'') = ''
                       THEN 'Dossiê-mãe, ambiente ou nível de acesso não registrados.'
                     ELSE NULL END)
  );

  RETURN jsonb_build_object(
    'nucleo_id', _n.id,
    'itens', _itens,
    'completo', NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_itens) i WHERE (i->>'ok')::boolean IS NOT TRUE)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.nucleo_completude(uuid) TO authenticated;