CREATE TABLE IF NOT EXISTS public.onboarding_planos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  case_id uuid NOT NULL REFERENCES public.crm_casos(id),
  template_id uuid REFERENCES public.onboarding_templates(id),
  estado text NOT NULL DEFAULT 'bloqueado' CHECK (estado IN ('bloqueado','liberado_preparacao','em_andamento','concluido','cancelado')),
  motivos_bloqueio jsonb NOT NULL DEFAULT '[]'::jsonb,
  responsavel_principal text,
  dossie_mae_status text NOT NULL DEFAULT 'em_preparacao' CHECK (dossie_mae_status IN ('nao_iniciado','em_preparacao','validado')),
  dossie_mae_referencia text,
  ambiente_autorizado text,
  nivel_acesso text,
  grupo_familiar_status text NOT NULL DEFAULT 'pendente' CHECK (grupo_familiar_status IN ('pendente','planejado','criado','nao_aplicavel')),
  checklist_inicial jsonb NOT NULL DEFAULT '[]'::jsonb,
  plano_acao jsonb NOT NULL DEFAULT '[]'::jsonb,
  primeira_microentrega_prazo_dias integer NOT NULL DEFAULT 7,
  primeira_microentrega_descricao text,
  touchpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  inicio_previsto date,
  observacao_interna text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  UNIQUE (case_id)
);

GRANT SELECT, INSERT, UPDATE ON public.onboarding_planos TO authenticated;
GRANT ALL ON public.onboarding_planos TO service_role;

ALTER TABLE public.onboarding_planos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_planos_select" ON public.onboarding_planos
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() AND archived_at IS NULL));

CREATE POLICY "onboarding_planos_insert" ON public.onboarding_planos
  FOR INSERT TO authenticated
  WITH CHECK (public.can_write(organization_id));

CREATE POLICY "onboarding_planos_update" ON public.onboarding_planos
  FOR UPDATE TO authenticated
  USING (public.can_write(organization_id))
  WITH CHECK (public.can_write(organization_id));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_onboarding_planos_touch ON public.onboarding_planos;
CREATE TRIGGER trg_onboarding_planos_touch BEFORE UPDATE ON public.onboarding_planos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Template padrão de onboarding (reuso institucional)
INSERT INTO public.onboarding_templates (organization_id, codigo, nome, descricao, versao, active)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'ONB-PADRAO', 'Onboarding padrão Clube Ancestral',
       'Template operacional padrão: 6 fases, 12 itens. Preparação interna, sem envio externo.', 'v1', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_templates
  WHERE organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' AND codigo = 'ONB-PADRAO'
);

INSERT INTO public.onboarding_template_items (organization_id, template_id, fase, ordem, item, descricao, obrigatorio, prazo_dias)
SELECT t.organization_id, t.id, v.fase, v.ordem, v.item, v.descricao, true, v.prazo_dias
FROM public.onboarding_templates t
CROSS JOIN (VALUES
  ('fase_3_contrato_os', 1, 'Contrato assinado', 'Assinatura registrada pelo método homologado.', NULL::int),
  ('fase_4_pagamento', 2, 'Pagamento inicial confirmado', 'Confirmação vinda da fonte transacional canônica.', NULL),
  ('fase_2_cadastro_escopo', 3, 'Responsável definido', 'Responsável interno nomeado no caso.', NULL),
  ('fase_2_cadastro_escopo', 4, 'Núcleo familiar e participantes', 'Signatários, dependentes e representação registrados.', NULL),
  ('fase_5_onboarding', 5, 'Dossiê-mãe', 'Dossiê consolidado do caso criado ou vinculado.', 7),
  ('fase_5_onboarding', 6, 'Ambiente e nível de acesso', 'Acesso autorizado por caso, sem URL pública.', 3),
  ('fase_5_onboarding', 7, 'Checklist documental', 'Lista de documentos por participante.', 5),
  ('fase_5_onboarding', 8, 'Plano de ação', 'Sequência de tarefas e responsáveis.', 5),
  ('fase_5_onboarding', 9, 'Call de onboarding', 'Agendada com o cliente pelo canal homologado.', 7),
  ('fase_5_onboarding', 10, 'Boas-vindas', 'Rascunho aprovado por humano antes de qualquer envio.', 2),
  ('fase_6_caso_ativo', 11, 'Primeira micro-entrega prevista', 'Planejada até D7 do onboarding.', 7),
  ('fase_6_caso_ativo', 12, 'Data-limite de atualização contextualizada', 'Nenhum cliente sem atualização por mais de 14 dias.', 14)
) AS v(fase, ordem, item, descricao, prazo_dias)
WHERE t.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' AND t.codigo = 'ONB-PADRAO'
  AND NOT EXISTS (SELECT 1 FROM public.onboarding_template_items i WHERE i.template_id = t.id);

-- Plano de onboarding do caso familiar da Ana Luiza: bloqueado
INSERT INTO public.onboarding_planos (
  organization_id, case_id, template_id, estado, motivos_bloqueio, responsavel_principal,
  dossie_mae_status, dossie_mae_referencia, ambiente_autorizado, nivel_acesso, grupo_familiar_status,
  checklist_inicial, plano_acao, primeira_microentrega_prazo_dias, primeira_microentrega_descricao,
  touchpoints, observacao_interna
)
SELECT
  '11f32aae-ea08-47e0-8114-f5d8a900c9a1',
  'a11a0000-0000-4000-8000-000000000002',
  (SELECT id FROM public.onboarding_templates WHERE organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' AND codigo = 'ONB-PADRAO'),
  'bloqueado',
  '["Contrato assinado pendente.","Pagamento inicial confirmado pendente."]'::jsonb,
  'Tatiana Melani Tosi',
  'em_preparacao',
  'Dossiê-mãe Silveira / Friedmann-Reimer',
  'Desk Intelligence (App Cliente não publicado)',
  'restrito_equipe',
  'pendente',
  '[
    {"item":"Documentos de identificação dos signatários","responsavel":"Tatiana Melani Tosi","status":"pendente"},
    {"item":"Documentos do dependente Felipe e representação","responsavel":"Tatiana Melani Tosi","status":"pendente"},
    {"item":"Certidões da linha austríaca já disponíveis com o cliente","responsavel":"Tatiana Melani Tosi","status":"pendente"},
    {"item":"Confirmação de dados cadastrais do núcleo","responsavel":"Tatiana Melani Tosi","status":"pendente"}
  ]'::jsonb,
  '[
    {"ordem":1,"acao":"Concluir formalização (contrato assinado)","prazo":"pendente de gate","responsavel":"Tatiana Melani Tosi"},
    {"ordem":2,"acao":"Confirmar pagamento inicial na fonte transacional","prazo":"pendente de gate","responsavel":"Financeiro"},
    {"ordem":3,"acao":"Liberar ambiente e nível de acesso do caso","prazo":"D3 após início","responsavel":"Tatiana Melani Tosi"},
    {"ordem":4,"acao":"Publicar checklist documental por participante","prazo":"D5 após início","responsavel":"Tatiana Melani Tosi"},
    {"ordem":5,"acao":"Realizar call de onboarding","prazo":"D7 após início","responsavel":"Tatiana Melani Tosi"}
  ]'::jsonb,
  7,
  'Primeira micro-entrega planejada até D7 após o início do onboarding: consolidação inicial do dossiê-mãe familiar.',
  '[
    {"marco":"D7","descricao":"Primeira micro-entrega planejada","status":"planejado"},
    {"marco":"D10","descricao":"Touchpoint de acompanhamento contextualizado","status":"planejado"},
    {"marco":"D14","descricao":"Limite de atualização contextualizada ao cliente","status":"planejado"}
  ]'::jsonb,
  'Corte H: preparação apenas. Sem boas-vindas enviadas, sem magic link, sem publicação do App, sem pasta ou grupo externo. Caso permanece não ativo.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.onboarding_planos WHERE case_id = 'a11a0000-0000-4000-8000-000000000002'
);

-- Filas de comunicação em rascunho (nenhum envio)
INSERT INTO public.communication_queue (
  organization_id, case_id, acao_codigo, target_audience, visibility, suggested_channel,
  assunto, corpo_rascunho, status, requires_human_approval, observacao_interna
)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', 'a11a0000-0000-4000-8000-000000000002',
       v.codigo, 'cliente_contratante', 'client_sanitized', 'whatsapp', v.assunto, v.corpo,
       'draft', true,
       'Rascunho do Corte H. Bloqueado até contrato assinado e pagamento inicial confirmado. Nenhum envio automático.'
FROM (VALUES
  ('boas_vindas','Boas-vindas ao acompanhamento do estudo','Olá! Registramos internamente o início do seu acompanhamento familiar. Assim que a formalização estiver concluída, organizamos juntos o primeiro passo.'),
  ('enviar_checklist_inicial','Checklist inicial do estudo','Olá! Preparamos o checklist inicial com os documentos e informações que vamos organizar juntos nesta etapa.'),
  ('plano_de_acao','Plano de ação do onboarding','Olá! Segue o plano de ação previsto para as primeiras semanas do acompanhamento, com responsáveis e prazos internos.'),
  ('touchpoint_d10','Acompanhamento — D10','Olá! Trazendo uma atualização contextualizada do andamento do seu estudo familiar.'),
  ('touchpoint_d14','Atualização contextualizada — D14','Olá! Atualização do andamento do seu estudo familiar dentro do prazo previsto de acompanhamento.')
) AS v(codigo, assunto, corpo)
WHERE NOT EXISTS (
  SELECT 1 FROM public.communication_queue q
  WHERE q.case_id = 'a11a0000-0000-4000-8000-000000000002' AND q.acao_codigo = v.codigo
);