-- 07/09/2026 — Fase B do Cockpit: reduz os 14 requisitos "obrigatórios" de
-- ativação para os 8 que correspondem a um indicador real do
-- Prompt_Cockpit_Desk_Indicadores_Cadencias_e_Acoes.md (ver
-- docs/politicas/de-para-cockpit-must-have-vs-sobreposicao-07-09.md).
--
-- Achado: `case_activation_gates()` lê `obrigatorio` de
-- `activation_check_definicoes()` (esta função, IMMUTABLE, org-wide) — NÃO
-- da coluna `obrigatorio` de `case_activation_checks` por linha. Uma
-- tentativa anterior nesta mesma sessão de marcar `obrigatorio = false`
-- diretamente nas linhas do caso da Ana não teve nenhum efeito na tela por
-- este motivo exato: mais uma "fonte que ninguém lê" do mesmo padrão já
-- corrigido hoje em outras telas.
--
-- 6 dos 14 continuam obrigatórios por não terem indicador Cockpit
-- correspondente e não serem cobertos por outro requisito:
--   contrato_assinado_ou_isencao_autorizada, pagamento_confirmado_ou_condicao_financeira_autorizada,
--   responsavel_designado, nucleo_familiar_conferido,
--   proposta_aprovada_ou_isencao_autorizada, ordem_de_servico_criada
-- Os outros 8 (incluindo primeira_tarefa_criada, redundante com
-- crm_casos.proxima_acao já rastreada em Painel Hoje/Casos) deixam de ser
-- obrigatórios: continuam existindo como requisito informativo, mas não
-- bloqueiam mais a ativação nem aparecem em case_ativacao_bloqueios_reais().
-- Combinados com os 2 itens obrigatórios de onboarding_checklist (app_cliente,
-- micro_entrega_d7, que já são must-have Cockpit e não têm equivalente
-- aqui), o caso da Ana passa de 20 para 8 bloqueios reais — sem perder
-- nenhum dado, sem apagar nenhuma linha.
CREATE OR REPLACE FUNCTION public.activation_check_definicoes()
RETURNS TABLE(check_key text, label text, dominio text, obrigatorio boolean)
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT * FROM (VALUES
    ('cliente_identificado','Cliente identificado','operacional',false),
    ('consentimento_registrado','Consentimento registrado','operacional',false),
    ('proposta_aprovada_ou_isencao_autorizada','Proposta aprovada ou isenção autorizada','comercial',true),
    ('contrato_assinado_ou_isencao_autorizada','Contrato assinado ou isenção autorizada','contratual',true),
    ('pagamento_confirmado_ou_condicao_financeira_autorizada','Pagamento inicial confirmado na fonte transacional','financeiro',true),
    ('ordem_de_servico_criada','Ordem de serviço criada','operacional',true),
    ('escopo_definido','Escopo definido','operacional',false),
    ('responsavel_designado','Responsável interno definido','operacional',true),
    ('primeira_tarefa_criada','Primeira tarefa criada','operacional',false),
    ('nucleo_familiar_conferido','Núcleo familiar e participantes conferidos','operacional',true),
    ('dossie_mae_criado','Dossiê-mãe criado','operacional',false),
    ('ambiente_acesso_definido','Ambiente e nível de acesso definidos','operacional',false),
    ('checklist_documental_e_plano_preparados','Checklist documental e plano de ação preparados','operacional',false),
    ('aprovacao_interna_ativacao','Aprovação interna de ativação registrada','operacional',false)
  ) AS t(check_key,label,dominio,obrigatorio);
$$;

-- Nota de higiene registrada, não corrigida agora: a coluna
-- case_activation_checks.obrigatorio (por linha, por caso) ficou vestigial
-- depois deste achado — ninguém a lê para decidir bloqueio. Fica para uma
-- rodada futura decidir se ela é removida ou passa a ser a fonte real
-- (invertendo a dependência hoje em activation_check_definicoes()).
