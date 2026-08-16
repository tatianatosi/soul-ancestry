CREATE OR REPLACE FUNCTION public.fn_documents_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cliente uuid;
  v_portal boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Envio de documentos exige usuário autenticado.';
  END IF;

  v_portal := (NEW.origem = 'cliente')
              AND NEW.case_id IS NOT NULL
              AND public.portal_caso_permitido(NEW.case_id)
              AND NEW.client_id IS NOT DISTINCT FROM public.portal_meu_cliente();

  IF NOT v_portal AND NOT public.is_org_member(NEW.organization_id) THEN
    RAISE EXCEPTION 'Documento fora da sua organização.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.carregado_por := COALESCE(NEW.carregado_por, auth.uid());
    NEW.carregado_em := COALESCE(NEW.carregado_em, now());
    IF NEW.case_id IS NOT NULL THEN
      SELECT cliente_id INTO v_cliente FROM public.crm_casos WHERE id = NEW.case_id;
      NEW.client_id := COALESCE(NEW.client_id, v_cliente);
    END IF;

    IF v_portal THEN
      NEW.status := 'pendente_de_revisao';
      NEW.visibilidade := 'interno_restrito';
      NEW.categoria := 'interno';
      NEW.entrega_cliente := false;
      NEW.liberado_em := NULL;
      NEW.liberado_por := NULL;
      NEW.revisado_em := NULL;
      NEW.revisado_por := NULL;
    ELSE
      IF NEW.categoria IN ('identificacao','certidao','documento_civil','documento_financeiro')
         AND NOT public.consentimento_ativo(NEW.case_id, NEW.client_id)
         AND NOT public.consentimento_dispensado(NEW.case_id, NEW.client_id) THEN
        RAISE EXCEPTION 'Categoria sensível bloqueada: registre consentimento de tratamento de dados ou uma exceção formal aprovada.';
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NOT public.is_org_member(NEW.organization_id) THEN
      RAISE EXCEPTION 'Apenas a equipe interna pode alterar documentos.';
    END IF;
    IF NEW.storage_path IS DISTINCT FROM OLD.storage_path AND NEW.storage_path IS NOT NULL THEN
      NEW.versao := COALESCE(OLD.versao, 1) + 1;
    END IF;
    IF NEW.status = 'liberado' AND OLD.status IS DISTINCT FROM 'liberado' THEN
      IF NEW.visibilidade <> 'cliente_quando_liberado' THEN
        RAISE EXCEPTION 'Só documentos com visibilidade "cliente quando liberado" podem ser liberados ao cliente.';
      END IF;
      IF NOT public.is_staff_ativo(NEW.organization_id) THEN
        RAISE EXCEPTION 'Liberação de entrega exige usuário interno ativo.';
      END IF;
      NEW.liberado_em := now();
      NEW.liberado_por := auth.uid();
    END IF;
  END IF;

  NEW.liberado_cliente := (NEW.visibilidade = 'cliente_quando_liberado' AND NEW.status = 'liberado');
  RETURN NEW;
END;
$function$;