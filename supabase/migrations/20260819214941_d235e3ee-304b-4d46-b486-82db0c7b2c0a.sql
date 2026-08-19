-- 1. Dicionário de parâmetros: acrescenta "dependentes" ao grupo membros ------
CREATE OR REPLACE FUNCTION public.contract_parameter_definicoes()
RETURNS TABLE(grupo text, campo text, label text, obrigatorio boolean, ordem integer)
LANGUAGE sql IMMUTABLE
SET search_path = public
AS $$
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
    ('objeto','produto_sku','Produto / SKU contratado',true,20),
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
$$;

-- 2. Backfill nas fichas existentes -----------------------------------------
INSERT INTO public.contract_parameter_values
  (organization_id, parameters_id, grupo, campo, label, obrigatorio, ordem, status)
SELECT p.organization_id, p.id, d.grupo, d.campo, d.label, d.obrigatorio, d.ordem, 'vazio'
FROM public.contract_case_parameters p
CROSS JOIN public.contract_parameter_definicoes() d
WHERE d.campo = 'dependentes'
  AND NOT EXISTS (
    SELECT 1 FROM public.contract_parameter_values v
    WHERE v.parameters_id = p.id AND v.campo = d.campo
  );

-- 3. Felipe como dependente da Ana no caso familiar da Áustria --------------
INSERT INTO public.case_dependents
  (organization_id, case_id, nome_completo, vinculo_com_titular, titular_responsavel_legal_nome,
   status_representacao, participa_do_contrato, possui_acesso_app, anexo_individual_aplicavel, observacao_interna)
SELECT c.organization_id, c.id, 'Felipe', 'filho', 'Ana Luiza Gomes Silveira Rodrigues',
       'pendente', false, false, false,
       'Dependente menor vinculado à titular. Não é signatário, não gera cobrança própria e não recebe acesso ao App.'
FROM public.crm_casos c
WHERE c.codigo = 'CA-CID-AT-FAM-2026-001'
  AND NOT EXISTS (
    SELECT 1 FROM public.case_dependents d
    WHERE d.case_id = c.id AND d.nome_completo = 'Felipe'
  );

-- 4. Matriz interna de decisão jurídica (somente temas, sem texto de cláusula)
INSERT INTO public.legal_clause_matrix
  (organization_id, tema_codigo, tema, status, impacto_templates, bloqueia_assinatura)
SELECT o.id, t.tema_codigo, t.tema, 'pendente_revisao_juridica', t.impacto, t.bloqueia
FROM public.organizations o
CROSS JOIN (VALUES
  ('natureza_servico','Natureza intelectual/técnica do serviço', ARRAY['MODELO-ESTUDO','BASE-GEN-V2'], true),
  ('nao_garantia','Não garantia de documento, linhagem, cidadania, resultado ou prazo', ARRAY['MODELO-ESTUDO','BASE-GEN-V2'], true),
  ('limite_relatorio','Limite do relatório e ausência de parecer jurídico individual', ARRAY['MODELO-ESTUDO'], true),
  ('dados_retencao','Retenção, descarte e acesso a dados e documentos', ARRAY['BASE-GEN-V2','ANX-PRIVACIDADE'], true),
  ('suspensao_prazo','Suspensão de prazo', ARRAY['BASE-GEN-V2'], false),
  ('encerramento','Encerramento', ARRAY['BASE-GEN-V2'], false),
  ('inadimplemento','Inadimplemento', ARRAY['BASE-GEN-V2','ANX-COMERCIAL'], true),
  ('rescisao','Rescisão', ARRAY['BASE-GEN-V2'], true),
  ('foro','Foro', ARRAY['BASE-GEN-V2'], false),
  ('parcelamento','Parcelamento', ARRAY['ANX-COMERCIAL'], false),
  ('despesas_terceiros','Despesas de terceiros', ARRAY['ANX-COMERCIAL'], true),
  ('dependentes_representacao','Dependentes e representação', ARRAY['ANX-INDIVIDUAL','ANX-REPRESENTACAO'], true)
) AS t(tema_codigo, tema, impacto, bloqueia)
WHERE NOT EXISTS (
  SELECT 1 FROM public.legal_clause_matrix m
  WHERE m.organization_id = o.id AND m.tema_codigo = t.tema_codigo
);