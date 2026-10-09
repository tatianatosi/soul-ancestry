-- Corte C / D3 (08/10/2026) — contrato COM ou SEM anexos separados.
--
-- Até aqui a incorporação do Anexo I era só DERIVADA: se os cinco blocos de
-- `BLOCOS_QUE_INCORPORAM_ANEXO_I` estivessem completos, o Anexo I deixava de
-- ser documento separado. Derivação não é escolha — bastava um bloco ficar
-- pendente para o modelo do instrumento mudar de forma no meio da preparação.
--
-- Esta migration cria o parâmetro `modo_anexos` (grupo `servicos`, ordem 45,
-- entre `anexos_aplicaveis` e `prazos_referencia`), com lista controlada
-- `incorporado` | `separado` no lado TypeScript (`modo-anexos.ts`) e
-- justificativa obrigatória — a escolha passa pela mesma trilha auditada de
-- `salvarParametro`, sem writer novo.
--
-- `obrigatorio = false` por decisão explícita: marcar como obrigatório
-- transformaria esta mudança num bloqueio novo em todo contrato já existente
-- (inclusive o da Ana, que está em preparação). Sem escolha registrada, o
-- modo continua sendo o derivado, e a tela diz que é derivado.
--
-- Aditiva: acrescenta uma definição e semeia a linha que falta. Não altera
-- valor, status, origem, justificativa nem obrigatoriedade de nenhuma linha
-- existente, e não apaga nada.

CREATE OR REPLACE FUNCTION public.contract_parameter_definicoes()
 RETURNS TABLE(grupo text, campo text, label text, obrigatorio boolean, ordem integer)
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT * FROM (VALUES
    ('partes','contratante_nome','Contratante — nome completo',true,10),
    ('partes','contratante_documento','Contratante — documento de identificação',true,20),
    ('partes','contratante_endereco','Contratante — endereço completo',true,30),
    ('partes','contratante_contato','Contratante — e-mail e telefone',true,40),
    ('partes','contratada_qualificacao','Contratada — qualificação completa',true,50),
    ('partes','representacao_legal','Representação legal / menores representados',false,60),
    ('membros','beneficiarios','Beneficiários incluídos no projeto',true,10),
    ('membros','vinculo_familiar','Vínculo familiar declarado entre os beneficiários',true,20),
    ('membros','ancestral_referencia','Ancestral de referência declarado',true,30),
    ('membros','membros_excluidos','Pessoas expressamente fora do escopo',false,40),
    ('membros','dependentes','Dependentes e situação de representação',false,50),
    ('objeto','objeto_contrato','Objeto do contrato',true,10),
    ('objeto','produto_sku','Produto / SKU contratado',false,20),
    ('objeto','pais_rota','País e rota pretendida',true,30),
    ('objeto','escopo_resumo','Resumo do escopo aprovado',true,40),
    ('servicos','servicos_incluidos','Serviços incluídos',true,10),
    ('servicos','servicos_excluidos','Serviços expressamente excluídos',true,20),
    ('servicos','fases_entregas','Fases e entregas previstas',true,30),
    ('servicos','anexos_aplicaveis','Anexos aplicáveis ao produto/escopo',true,40),
    ('servicos','modo_anexos','Modo dos anexos — incorporados ao corpo ou documentos separados',false,45),
    ('servicos','prazos_referencia','Prazos de referência (não promessa de resultado)',false,50),
    ('comerciais','valor_total','Valor total aprovado',true,10),
    ('comerciais','forma_pagamento','Forma de pagamento',true,20),
    ('comerciais','parcelas','Parcelas',true,30),
    ('comerciais','vencimentos','Datas de vencimento',true,40),
    ('comerciais','despesas_externas','Despesas externas e reembolsos',false,50),
    ('comerciais','excecoes_comerciais','Exceções comerciais autorizadas',false,60),
    ('assinatura','partes_signatarias','Partes signatárias',true,10),
    ('assinatura','forma_assinatura','Forma de assinatura e registro externo',true,20),
    ('assinatura','data_assinatura','Data da assinatura',false,30),
    ('assinatura','referencia_assinatura','Referência/comprovante da assinatura',false,40),
    ('assinatura','revisor_responsavel','Revisor humano responsável',true,50)
  ) AS t(grupo, campo, label, obrigatorio, ordem);
$function$;

-- Semeadura da linha que falta nos registros mestres já criados. O trigger
-- `trg_seed_contract_parameters` só roda no INSERT do registro mestre, então
-- contrato já existente nunca receberia o campo novo.
INSERT INTO public.contract_parameter_values
  (organization_id, parameters_id, grupo, campo, label, obrigatorio, ordem, status)
SELECT p.organization_id, p.id, d.grupo, d.campo, d.label, d.obrigatorio, d.ordem, 'vazio'
FROM public.contract_case_parameters p
CROSS JOIN public.contract_parameter_definicoes() d
WHERE d.campo = 'modo_anexos'
  AND NOT EXISTS (
    SELECT 1 FROM public.contract_parameter_values v
    WHERE v.parameters_id = p.id AND v.campo = d.campo AND v.archived_at IS NULL
  );
