update public.crm_casos
set pais = 'Áustria',
    via = 'Administrativa — reparação histórica (§ 58c StbG)',
    pais_linha_prioritaria = coalesce(pais_linha_prioritaria, 'Áustria'),
    via_juridica_preliminar = coalesce(via_juridica_preliminar, 'Administrativa — § 58c StbG'),
    alias_historico = 'CA-AUT-ANALUIZA-FAM-2026-001',
    responsavel_principal = coalesce(responsavel_principal, 'Tatiana Melani Tosi'),
    aceite_comercial_em = '2026-08-14',
    data_confirmacao_formal_proposta = '2026-08-14',
    eixo_formalizacao = 'formalizacao_em_preparacao',
    ativacao_operacional = 'NO_GO'
where codigo = 'CA-CID-AT-FAM-2026-001';