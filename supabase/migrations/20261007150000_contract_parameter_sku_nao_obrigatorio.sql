-- PREMISSA da Proprietária (reafirmada 06-07/10/2026, não reabrir):
-- "o SKU nunca bloqueia o contrato da Ana; ela é governada por condição
-- particular aprovada". O lado TypeScript (parametros-dicionario.ts) já
-- reflete isso desde o Corte A (06/10): produto_sku aceita origem
-- "planejador"/"proposta" e o texto da validação diz "caso sem código de
-- catálogo não é bloqueio". Mas o cálculo real de completude e a lista de
-- pendências (contract_parameters_completude/_pendencias) não leem o
-- dicionário TypeScript — leem contract_parameter_definicoes(), uma função
-- SQL separada que nunca foi sincronizada e ainda marca produto_sku como
-- obrigatorio=true. Resultado medido: o campo fica "vazio" para sempre (o
-- dropdown CAT_PRODUTO_SKU hoje só tem 1 opção fabricada, que não bate com
-- nenhum SKU real nem com o produto-pai PP-03 do caso) e trava a
-- completude/pendências do contrato real da Ana em vez de ser ignorado,
-- como a premissa manda.
--
-- Correção: produto_sku deixa de ser obrigatorio nesta função (false).
-- Nada é alterado em contract_parameter_values já existentes por esta
-- migration — só altera o que SEEDS NOVOS herdam e precisa de
-- reconciliação manual (ou de nova execução) para linhas já criadas.
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

-- Reconciliação das linhas já existentes (todas as organizações, todos os
-- casos): obrigatorio passa a seguir a definição acima — nunca toca valor,
-- status, origem ou justificativa, só a flag que a definição canônica já
-- mudou.
UPDATE public.contract_parameter_values v
SET obrigatorio = d.obrigatorio
FROM public.contract_parameter_definicoes() d
WHERE v.campo = d.campo
  AND v.archived_at IS NULL
  AND v.obrigatorio IS DISTINCT FROM d.obrigatorio;
