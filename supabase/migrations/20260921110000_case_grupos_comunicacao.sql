-- §5 do "Prompt de Implantação — Política Unificada de Casos Familiares"
-- (21/09/2026): o grupo familiar/WhatsApp é um canal de coordenação
-- humana, não um banco de dados. Hoje não existe nenhum registro da
-- existência/propósito/status de um grupo no Caso 360 — WhatsApp só
-- aparecia como `channel`/`rascunhoWhatsapp` (sugestão de canal de
-- rascunho de comunicação, em caso-ficha.ts), nunca como uma entidade
-- própria.
--
-- Esta migration só REGISTRA a intenção/existência do grupo — não cria,
-- não integra e não automatiza nada no WhatsApp real. "A criação externa
-- é feita pela proprietária quando decidir" (texto do documento-fonte).
-- Mesmo padrão de `drive_provisioning_queue` (migration 20260820010018):
-- registrar antes de agir, sem execução automática de nada externo.
CREATE TABLE IF NOT EXISTS public.case_grupos_comunicacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  canal text NOT NULL DEFAULT 'whatsapp',
  nome_grupo text,
  referencia_externa text,
  proposito text NOT NULL,
  status text NOT NULL DEFAULT 'planejado',
  contato_principal_membro_id uuid REFERENCES public.case_members(id),
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  activated_at timestamptz,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  CONSTRAINT cgc_status_chk CHECK (status IN ('planejado', 'ativo', 'arquivado'))
);
CREATE INDEX IF NOT EXISTS idx_cgc_case ON public.case_grupos_comunicacao(case_id);

GRANT SELECT, INSERT, UPDATE ON public.case_grupos_comunicacao TO authenticated;
GRANT ALL ON public.case_grupos_comunicacao TO service_role;
ALTER TABLE public.case_grupos_comunicacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY cgc_select ON public.case_grupos_comunicacao FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY cgc_insert ON public.case_grupos_comunicacao FOR INSERT WITH CHECK (can_write(organization_id));
CREATE POLICY cgc_update ON public.case_grupos_comunicacao FOR UPDATE USING (can_write(organization_id)) WITH CHECK (can_write(organization_id));

CREATE OR REPLACE FUNCTION public.fn_grupo_comunicacao_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'ativo' AND NEW.activated_at IS NULL THEN
    NEW.activated_at := now();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_cgc_guard ON public.case_grupos_comunicacao;
CREATE TRIGGER trg_cgc_guard BEFORE INSERT OR UPDATE ON public.case_grupos_comunicacao
FOR EACH ROW EXECUTE FUNCTION public.fn_grupo_comunicacao_guard();
DROP TRIGGER IF EXISTS trg_cgc_no_delete ON public.case_grupos_comunicacao;
CREATE TRIGGER trg_cgc_no_delete BEFORE DELETE ON public.case_grupos_comunicacao
FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();
