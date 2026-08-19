ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS eixo_comercial text NOT NULL DEFAULT 'novo_lead',
  ADD COLUMN IF NOT EXISTS eixo_formalizacao text NOT NULL DEFAULT 'nao_iniciado',
  ADD COLUMN IF NOT EXISTS status_caso_derivado text,
  ADD COLUMN IF NOT EXISTS responsavel_principal text NOT NULL DEFAULT 'Tatiana Melani Tosi',
  ADD COLUMN IF NOT EXISTS cargo_responsavel_principal text NOT NULL DEFAULT 'Genealogista profissional e pesquisadora',
  ADD COLUMN IF NOT EXISTS supervisora_do_caso text NOT NULL DEFAULT 'Tatiana Melani Tosi',
  ADD COLUMN IF NOT EXISTS colaboradores_do_caso text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS data_confirmacao_formal_proposta date,
  ADD COLUMN IF NOT EXISTS data_entrada_caso date,
  ADD COLUMN IF NOT EXISTS proposta_referencia_interna text,
  ADD COLUMN IF NOT EXISTS proposta_url_interna text,
  ADD COLUMN IF NOT EXISTS data_proposta date,
  ADD COLUMN IF NOT EXISTS escopo_incluido_resumido text,
  ADD COLUMN IF NOT EXISTS escopo_excluido_resumido text,
  ADD COLUMN IF NOT EXISTS condicao_comercial_interna_pendente boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS citizenship_track_id text,
  ADD COLUMN IF NOT EXISTS pais_linha_prioritaria text,
  ADD COLUMN IF NOT EXISTS via_juridica_preliminar text,
  ADD COLUMN IF NOT EXISTS status_via text,
  ADD COLUMN IF NOT EXISTS hipotese_trabalho_interna text,
  ADD COLUMN IF NOT EXISTS status_radar text NOT NULL DEFAULT 'nao_calculado',
  ADD COLUMN IF NOT EXISTS radar_aderencia_percentual numeric,
  ADD COLUMN IF NOT EXISTS revisao_humana_juridica text NOT NULL DEFAULT 'a_definir',
  ADD COLUMN IF NOT EXISTS riscos_identificados text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS resumo_interno text,
  ADD COLUMN IF NOT EXISTS brief_interno text,
  ADD COLUMN IF NOT EXISTS origem_brief text,
  ADD COLUMN IF NOT EXISTS link_origem_interna text,
  ADD COLUMN IF NOT EXISTS proxima_acao_codigo text,
  ADD COLUMN IF NOT EXISTS proxima_acao_justificativa text,
  ADD COLUMN IF NOT EXISTS alias_historico text;

ALTER TABLE public.case_members
  ADD COLUMN IF NOT EXISTS papel_no_caso text,
  ADD COLUMN IF NOT EXISTS representante_legal text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS rg text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS endereco text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS profissao text,
  ADD COLUMN IF NOT EXISTS estado_civil text,
  ADD COLUMN IF NOT EXISTS status_cadastral text NOT NULL DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS documentos_pendentes text,
  ADD COLUMN IF NOT EXISTS consentimentos text;

CREATE TABLE IF NOT EXISTS public.caso_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  entidade text NOT NULL DEFAULT 'crm_casos',
  entidade_id uuid,
  campo text NOT NULL,
  valor_anterior text,
  valor_novo text,
  autor_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.caso_log TO authenticated;
GRANT ALL ON public.caso_log TO service_role;

ALTER TABLE public.caso_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "caso_log_select" ON public.caso_log
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));

CREATE POLICY "caso_log_insert" ON public.caso_log
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));

CREATE INDEX IF NOT EXISTS caso_log_case_idx ON public.caso_log (case_id, created_at DESC);

CREATE TRIGGER no_delete_caso_log BEFORE DELETE ON public.caso_log
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();