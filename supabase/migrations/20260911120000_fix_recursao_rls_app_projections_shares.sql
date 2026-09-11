-- Quebra recursão RLS entre app_projections ↔ app_projection_shares.
--
-- Sintoma: SELECT em app_projections (staff ou portal) falha com
--   "infinite recursion detected in policy for relation app_projections"
--
-- Causa: app_proj_select_portal faz EXISTS em app_projection_shares;
-- policies de shares fazem EXISTS de volta em app_projections.
-- Com policies PERMISSIVE em OR, a avaliação do portal dispara o ciclo
-- mesmo quando is_org_member já autorizaria a linha (App Cliente master).
--
-- Correção: helpers SECURITY DEFINER leem a tabela cruzada sem RLS,
-- preservando a mesma regra de negócio da migration 20260909040000.

CREATE OR REPLACE FUNCTION public.fn_app_projection_compartilhada_com_cliente(
  p_projection_id uuid,
  p_client_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.app_projection_shares s
     WHERE s.projection_id = p_projection_id
       AND s.compartilhado_com_client_id = p_client_id
       AND s.revogado_em IS NULL
  );
$$;

COMMENT ON FUNCTION public.fn_app_projection_compartilhada_com_cliente(uuid, uuid) IS
  'Leitura de compartilhamento de achado sem RLS (evita recursão app_projections ↔ shares). Só uso em policies.';

CREATE OR REPLACE FUNCTION public.fn_sou_titular_app_projection(p_projection_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.app_projections p
     WHERE p.id = p_projection_id
       AND p.titular_client_id IS NOT NULL
       AND p.titular_client_id = public.portal_meu_cliente()
  );
$$;

COMMENT ON FUNCTION public.fn_sou_titular_app_projection(uuid) IS
  'Confirma titular do achado sem RLS na leitura de app_projections (evita recursão com shares).';

CREATE OR REPLACE FUNCTION public.fn_app_projection_org_bate(
  p_projection_id uuid,
  p_organization_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.app_projections p
     WHERE p.id = p_projection_id
       AND p.organization_id = p_organization_id
       AND p.titular_client_id IS NOT NULL
       AND p.titular_client_id = public.portal_meu_cliente()
  );
$$;

COMMENT ON FUNCTION public.fn_app_projection_org_bate(uuid, uuid) IS
  'Titular + organização da projeção, sem RLS (insert/update de shares pelo portal).';

REVOKE ALL ON FUNCTION public.fn_app_projection_compartilhada_com_cliente(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_sou_titular_app_projection(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_app_projection_org_bate(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_app_projection_compartilhada_com_cliente(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_sou_titular_app_projection(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_app_projection_org_bate(uuid, uuid) TO authenticated;

-- Portal: mesma regra da 20260909040000, sem EXISTS direto em shares.
DROP POLICY IF EXISTS app_proj_select_portal ON public.app_projections;
CREATE POLICY app_proj_select_portal ON public.app_projections
  FOR SELECT TO authenticated
  USING (
    destination = 'app'
    AND approval_status = 'published'
    AND archived_at IS NULL
    AND effective_from IS NOT NULL
    AND effective_from <= now()
    AND visibility_scope = ANY (ARRAY['titular'::text, 'nucleo'::text])
    AND public.portal_caso_permitido(case_id)
    AND (
      visibility_scope = 'nucleo'
      OR titular_client_id IS NULL
      OR titular_client_id = public.portal_meu_cliente()
      OR public.fn_app_projection_compartilhada_com_cliente(id, public.portal_meu_cliente())
    )
  );

-- Shares portal: sem EXISTS direto em app_projections.
DROP POLICY IF EXISTS app_projection_shares_portal_sel ON public.app_projection_shares;
CREATE POLICY app_projection_shares_portal_sel ON public.app_projection_shares
  FOR SELECT TO authenticated
  USING (
    compartilhado_com_client_id = public.portal_meu_cliente()
    OR public.fn_sou_titular_app_projection(projection_id)
  );

DROP POLICY IF EXISTS app_projection_shares_portal_ins ON public.app_projection_shares;
CREATE POLICY app_projection_shares_portal_ins ON public.app_projection_shares
  FOR INSERT TO authenticated
  WITH CHECK (
    autorizado_por = 'titular'
    AND public.fn_app_projection_org_bate(projection_id, organization_id)
  );

DROP POLICY IF EXISTS app_projection_shares_portal_upd ON public.app_projection_shares;
CREATE POLICY app_projection_shares_portal_upd ON public.app_projection_shares
  FOR UPDATE TO authenticated
  USING (public.fn_sou_titular_app_projection(projection_id))
  WITH CHECK (public.fn_sou_titular_app_projection(projection_id));
