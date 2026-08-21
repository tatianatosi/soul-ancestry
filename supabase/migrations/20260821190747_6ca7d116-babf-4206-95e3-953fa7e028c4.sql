-- 1. Colunas independentes de situação
ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS situacao_financeira text NOT NULL DEFAULT 'sem_cobranca',
  ADD COLUMN IF NOT EXISTS situacao_operacional text NOT NULL DEFAULT 'nao_iniciada',
  ADD COLUMN IF NOT EXISTS proxima_acao_responsavel text,
  ADD COLUMN IF NOT EXISTS proxima_acao_dependencia text,
  ADD COLUMN IF NOT EXISTS proxima_acao_criterio_conclusao text,
  ADD COLUMN IF NOT EXISTS data_prevista_contrato date,
  ADD COLUMN IF NOT EXISTS data_prevista_pagamento date,
  ADD COLUMN IF NOT EXISTS data_prevista_onboarding date;

ALTER TABLE public.crm_casos DROP CONSTRAINT IF EXISTS crm_casos_situacao_financeira_chk;
ALTER TABLE public.crm_casos ADD CONSTRAINT crm_casos_situacao_financeira_chk
  CHECK (situacao_financeira IN ('sem_cobranca','cobranca_prevista','cobranca_emitida','pagamento_inicial_confirmado','pagamento_parcial','inadimplente','quitado','isencao_autorizada'));

ALTER TABLE public.crm_casos DROP CONSTRAINT IF EXISTS crm_casos_situacao_operacional_chk;
ALTER TABLE public.crm_casos ADD CONSTRAINT crm_casos_situacao_operacional_chk
  CHECK (situacao_operacional IN ('nao_iniciada','preparacao_interna','aguardando_documentos_cliente','pesquisa_em_andamento','aguardando_instituicao_externa','entrega_em_preparacao','em_execucao','suspensa','concluida','arquivada'));

-- 2. Hipótese de elegibilidade em estados controlados
UPDATE public.crm_casos SET hipotese_elegibilidade = CASE
  WHEN hipotese_elegibilidade IS NULL OR btrim(hipotese_elegibilidade) = '' THEN 'nao_avaliada'
  WHEN hipotese_elegibilidade IN ('possivel','provavel','elegivel') THEN 'possivel'
  WHEN hipotese_elegibilidade IN ('incerta','em_analise','em_validacao') THEN 'em_validacao_documental'
  WHEN hipotese_elegibilidade IN ('confirmada','documentalmente_confirmada') THEN 'documentalmente_confirmada'
  WHEN hipotese_elegibilidade IN ('improvavel','inconclusiva','nao_elegivel') THEN 'inconclusiva'
  WHEN hipotese_elegibilidade IN ('nao_avaliada','em_validacao_documental') THEN hipotese_elegibilidade
  ELSE 'nao_avaliada' END;

ALTER TABLE public.crm_casos ALTER COLUMN hipotese_elegibilidade SET DEFAULT 'nao_avaliada';
ALTER TABLE public.crm_casos ALTER COLUMN hipotese_elegibilidade SET NOT NULL;
ALTER TABLE public.crm_casos DROP CONSTRAINT IF EXISTS crm_casos_hipotese_elegibilidade_chk;
ALTER TABLE public.crm_casos ADD CONSTRAINT crm_casos_hipotese_elegibilidade_chk
  CHECK (hipotese_elegibilidade IN ('nao_avaliada','possivel','em_validacao_documental','documentalmente_confirmada','inconclusiva'));

-- 3. Checklist canônico de ativação (8 requisitos do Prompt 05 + requisitos já vigentes)
CREATE OR REPLACE FUNCTION public.activation_check_definicoes()
RETURNS TABLE(check_key text, label text, dominio text, obrigatorio boolean)
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT * FROM (VALUES
    ('cliente_identificado','Cliente identificado','operacional',true),
    ('consentimento_registrado','Consentimento registrado','operacional',true),
    ('proposta_aprovada_ou_isencao_autorizada','Proposta aprovada ou isenção autorizada','comercial',true),
    ('contrato_assinado_ou_isencao_autorizada','Contrato assinado ou isenção autorizada','contratual',true),
    ('pagamento_confirmado_ou_condicao_financeira_autorizada','Pagamento inicial confirmado na fonte transacional','financeiro',true),
    ('ordem_de_servico_criada','Ordem de serviço criada','operacional',true),
    ('escopo_definido','Escopo definido','operacional',true),
    ('responsavel_designado','Responsável interno definido','operacional',true),
    ('primeira_tarefa_criada','Primeira tarefa criada','operacional',true),
    ('nucleo_familiar_conferido','Núcleo familiar e participantes conferidos','operacional',true),
    ('dossie_mae_criado','Dossiê-mãe criado','operacional',true),
    ('ambiente_acesso_definido','Ambiente e nível de acesso definidos','operacional',true),
    ('checklist_documental_e_plano_preparados','Checklist documental e plano de ação preparados','operacional',true),
    ('aprovacao_interna_ativacao','Aprovação interna de ativação registrada','operacional',true)
  ) AS t(check_key,label,dominio,obrigatorio);
$$;

-- 4. Backfill dos novos requisitos para casos existentes (sempre pendentes, sem presumir fato)
INSERT INTO public.case_activation_checks (organization_id, case_id, check_key, label, dominio, obrigatorio, status)
SELECT c.organization_id, c.id, d.check_key, d.label, d.dominio, d.obrigatorio, 'pendente'
FROM public.crm_casos c CROSS JOIN public.activation_check_definicoes() d
ON CONFLICT (case_id, check_key) DO NOTHING;

UPDATE public.case_activation_checks k
SET label = d.label
FROM public.activation_check_definicoes() d
WHERE d.check_key = k.check_key AND k.label IS DISTINCT FROM d.label;