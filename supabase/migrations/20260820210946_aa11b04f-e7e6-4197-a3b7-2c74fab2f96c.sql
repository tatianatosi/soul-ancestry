-- ANA-E-01 — consolidação da matriz jurídica: dedup lógica, trilha e guardas.

ALTER TABLE public.legal_clause_matrix
  ADD COLUMN IF NOT EXISTS substituido_por_id uuid REFERENCES public.legal_clause_matrix(id),
  ADD COLUMN IF NOT EXISTS substituicao_motivo text,
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'decisao_humana_interna',
  ADD COLUMN IF NOT EXISTS tema_codigo_historico text;

-- Padronização do código canônico do tema de retenção de dados (histórico preservado).
UPDATE public.legal_clause_matrix
   SET tema_codigo_historico = COALESCE(tema_codigo_historico, 'dados_retencao'),
       tema_codigo = 'retencao_dados',
       updated_at = now()
 WHERE tema_codigo = 'dados_retencao';

INSERT INTO public.audit_logs (organization_id, entidade, entidade_id, acao, valores_anteriores, valores_posteriores)
SELECT organization_id, 'legal_clause_matrix', id, 'normalizacao_tema',
       jsonb_build_object('tema_codigo','dados_retencao'),
       jsonb_build_object('tema_codigo','retencao_dados')
  FROM public.legal_clause_matrix
 WHERE tema_codigo_historico = 'dados_retencao';

-- Uma linha canônica por organização + tema (somente entre as não arquivadas).
CREATE UNIQUE INDEX IF NOT EXISTS legal_clause_matrix_canonica_uidx
  ON public.legal_clause_matrix (organization_id, tema_codigo)
  WHERE archived_at IS NULL;

-- Guarda: sem exclusão física e sem aprovação sem rastro humano completo.
CREATE OR REPLACE FUNCTION public.fn_legal_matrix_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Exclusão física não permitida na matriz jurídica. Use arquivamento com motivo.';
  END IF;

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
$$;

DROP TRIGGER IF EXISTS trg_legal_matrix_guard ON public.legal_clause_matrix;
CREATE TRIGGER trg_legal_matrix_guard
  BEFORE INSERT OR UPDATE OR DELETE ON public.legal_clause_matrix
  FOR EACH ROW EXECUTE FUNCTION public.fn_legal_matrix_guard();

-- Deduplicação lógica auditada: mantém a linha canônica e arquiva as demais.
CREATE OR REPLACE FUNCTION public.matriz_juridica_deduplicar(_org uuid)
RETURNS TABLE(tema_codigo text, canonica_id uuid, arquivadas integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  n integer;
BEGIN
  IF NOT public.can_write(_org) THEN
    RAISE EXCEPTION 'Sem permissão para consolidar a matriz jurídica desta organização.';
  END IF;

  FOR r IN
    SELECT m.tema_codigo AS tc,
           (SELECT id FROM public.legal_clause_matrix x
             WHERE x.organization_id = _org AND x.tema_codigo = m.tema_codigo AND x.archived_at IS NULL
             ORDER BY (x.decidido_em IS NOT NULL) DESC, x.decidido_em DESC NULLS LAST, x.updated_at DESC
             LIMIT 1) AS canonica
      FROM public.legal_clause_matrix m
     WHERE m.organization_id = _org AND m.archived_at IS NULL
     GROUP BY m.tema_codigo
    HAVING count(*) > 1
  LOOP
    UPDATE public.legal_clause_matrix d
       SET archived_at = now(),
           archive_motivo = 'Deduplicação ANA-E-01: linha substituída pela canônica do tema.',
           substituido_por_id = r.canonica,
           substituicao_motivo = 'Uma linha canônica por organização e tema.',
           updated_at = now()
     WHERE d.organization_id = _org AND d.tema_codigo = r.tc AND d.archived_at IS NULL AND d.id <> r.canonica;
    GET DIAGNOSTICS n = ROW_COUNT;

    INSERT INTO public.audit_logs (organization_id, entidade, entidade_id, acao, valores_anteriores, valores_posteriores)
    VALUES (_org, 'legal_clause_matrix', r.canonica, 'deduplicacao',
            jsonb_build_object('tema_codigo', r.tc),
            jsonb_build_object('arquivadas', n, 'canonica_id', r.canonica));

    tema_codigo := r.tc; canonica_id := r.canonica; arquivadas := n;
    RETURN NEXT;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.matriz_juridica_deduplicar(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.matriz_juridica_deduplicar(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.fn_legal_matrix_guard() FROM PUBLIC, anon, authenticated;