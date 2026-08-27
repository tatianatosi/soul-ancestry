-- 27/08/2026 — unificação do Eixo Comercial e Eixo Formalização entre leads
-- e casos, pedida pela Proprietária ("estamos falando da mesma pessoa, do
-- mesmo lead"). Achado: "confirmação formal recebida" já vivia com dois
-- sentidos diferentes em dado real — em crm_casos (piloto Ana Luiza) como
-- evento COMERCIAL (junto de "aceite verbal"), e no lead da Ana como estado
-- de FORMALIZAÇÃO. O funil canônico já fechado em desk-canonico.ts
-- (EVENTOS_FUNIL, "lista fechada... nada fora daqui é aceito") resolve a
-- dúvida: é evento comercial. Este arquivo só corrige o único lugar que
-- divergia (o lead da Ana) e um bug adjacente encontrado na mesma função.

-- 1) Alinha o lead de teste da Ana Luiza ao mesmo estado do caso-piloto real
--    dela (crm_casos), que já usava a leitura correta.
UPDATE public.leads
SET eixo_comercial = 'confirmacao_formal_recebida',
    eixo_formalizacao = 'formalizacao_em_preparacao'
WHERE id = 'cf100000-0000-4000-8000-000000000002'
  AND eixo_comercial = 'negociacao'
  AND eixo_formalizacao = 'confirmacao_formal_recebida';

-- 2) atendimento_bloqueios(): corrige dois valores que nunca bateram com
--    nenhum estado real ('confirmacao_formal' sem sufixo, 'diagnostico' sem
--    sufixo) — bug pré-existente, não relacionado à unificação em si, mas
--    na mesma função e no mesmo eixo.
CREATE OR REPLACE FUNCTION public.atendimento_bloqueios(_case uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c record; m text[] := '{}';
BEGIN
  SELECT * INTO c FROM public.crm_casos WHERE id = _case;
  IF NOT FOUND THEN RETURN ARRAY['Caso não encontrado']; END IF;
  IF c.archived_at IS NOT NULL THEN m := m || 'Caso arquivado'; END IF;
  IF COALESCE(c.contrato_assinado,false) IS NOT TRUE THEN m := m || 'Contrato não assinado'; END IF;
  IF COALESCE(c.pagamento_confirmado,false) IS NOT TRUE THEN m := m || 'Pagamento inicial não confirmado'; END IF;
  IF COALESCE(c.documentos_minimos_ok,false) IS NOT TRUE THEN m := m || 'Documentos mínimos pendentes'; END IF;
  IF c.ativado_em IS NULL AND c.data_ativacao IS NULL THEN m := m || 'Falta decisão humana de ativação'; END IF;
  IF COALESCE(c.eixo_formalizacao,'') IN ('nao_iniciado','formalizacao_em_preparacao')
     OR COALESCE(c.eixo_comercial,'') IN ('novo_lead','diagnostico_em_elaboracao','aceite_verbal','confirmacao_formal_recebida')
  THEN m := m || 'Caso ainda em diagnóstico/aceite verbal/confirmação formal/formalização'; END IF;
  RETURN m;
END; $$;

GRANT EXECUTE ON FUNCTION public.atendimento_bloqueios(uuid) TO authenticated, service_role;
