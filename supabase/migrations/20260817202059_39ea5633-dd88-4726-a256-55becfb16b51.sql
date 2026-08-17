INSERT INTO public.proposals (
  organization_id, case_id, client_id, versao, status, valor, moeda,
  escopo, exclusoes, forma_pagamento, validade, enviada_em,
  observacoes_cliente, observacoes_internas
)
SELECT
  c.organization_id, c.id, c.cliente_id, 1, 'enviada', 9600, 'BRL',
  'Proposta familiar para Ana Luiza, pai e irmã — cidadania austríaca por reparação histórica (§ 58c StbG), com dossiê familiar compartilhado e três processos individuais.'
  || E'\n\nVisão geral: pacote familiar de 3 pessoas e 3 processos individuais, com base na emenda de 2020 à Lei de Cidadania Austríaca (descendentes de vítimas do nazismo que deixaram a Áustria antes de 15/05/1955). A pesquisa da linhagem é compartilhada; cada pessoa mantém declaração e documentos pessoais próprios.'
  || E'\n\nDiagnóstico (R$ 247, integrado ao plano familiar):\n1. Dossiê-base compartilhado e análise de linhagem — pesquisa histórica e linha sucessória levantada para Ana Luiza formam a base documental do núcleo.\n2. Avaliação de enquadramento no § 58c StbG e verificação preliminar de registros disponíveis (Arolsen Archives, Yad Vashem, arquivos paroquiais/diocesanos austríacos, MA35 de Viena).\n3. Declarações separadas e certidões individuais — cada pessoa protocola sua própria declaração no Consulado Austríaco.\n4. Acompanhamento único e relatório de elegibilidade, com status individual por membro.'
  || E'\n\nLeitura do caso familiar:\n- Ana Luiza é a titular do dossiê-base, com pesquisa histórica, linha sucessória e declaração própria.\n- O pai aproveita a mesma pesquisa e adiciona a documentação necessária para demonstrar seu elo direto.\n- A irmã aproveita integralmente o dossiê-base e reúne certidões pessoais para sua declaração.'
  || E'\n\nJornada em 5 etapas:\n1. Diagnóstico — validação do enquadramento de Ana Luiza, pai e irmã no § 58c StbG.\n2. Pendências — consolidação do dossiê histórico comum e das certidões pessoais pendentes.\n3. Execução — montagem das três pastas individuais, traduções, apostilas e preparação consular.\n4. Complementos — tratamento de exigências documentais específicas de qualquer membro.\n5. Continuidade — protocolo e acompanhamento coordenado, com atualizações por membro no app.'
  || E'\n\nComposição do pacote familiar (R$ 9.600):\n- Ana Luiza — R$ 4.800: pesquisa histórica, dossiê-base e declaração individual; responsável familiar 10x de R$ 320.\n- Pai — R$ 2.400: aproveita o dossiê já produzido, inclui o elo documental direto, documentos pessoais e declaração própria; responsável familiar 10x de R$ 320.\n- Irmã — R$ 2.400: aproveita 100% do dossiê-base compartilhado, certidões pessoais e declaração própria; responsável familiar 10x de R$ 320.'
  || E'\n\nEstrutura contratual: um contrato-mãe familiar, três anexos individuais e três responsáveis financeiros.',
  E'Não incluídos nos honorários: certidões, buscas em arquivos, traduções, apostilas, taxas consulares, correios, deslocamentos e pesquisa local. Toda despesa é previamente comunicada e aprovada, com pagamento direto ou provisão antecipada e comprovantes.\nServiços de pós-cidadania (certificado, passaporte, identidade e registros civis) são avaliados individualmente como extensão, sem renovação automática.',
  '3 assinaturas mensais de R$ 320 por responsável, durante 10 meses — total R$ 9.600. Cada assinatura termina automaticamente após a 10ª cobrança.',
  DATE '2026-08-19', now(),
  'Alertas e microatualizações pelo WhatsApp durante todo o processo. Proposta válida até 19 de agosto de 2026.',
  'Proposta importada da apresentação comercial (Canva) Ref. CA-CID-AT-FAM-2026-001, 7 páginas. Fonte única para o motor contratual do caso.'
FROM public.crm_casos c
WHERE c.codigo = 'CA-CID-AT-FAM-2026-001'
  AND NOT EXISTS (SELECT 1 FROM public.proposals p WHERE p.case_id = c.id);