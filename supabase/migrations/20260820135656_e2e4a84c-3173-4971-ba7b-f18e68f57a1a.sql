UPDATE public.case_services SET
  escopo_aprovado = 'Escopo derivado da proposta Canva conferida (deck interno DECK-CANVA-CA-CID-AT-FAM-2026-001-v1, páginas 1–7): diagnóstico familiar multipaís com linha prioritária Áustria § 58c StbG. Extração ainda parcial — páginas 3 a 7 com campos não localizados, sem inferência.',
  composicao_familiar = 'Titulares/signatários: Ana Luiza Gomes Silveira Rodrigues (contratante), Adair Gomes Silveira e Alice Gomes Silveira. Dependente menor: Felipe, representado por Ana — representação pendente.',
  condicao_comercial_aprovada = 'R$ 9.600,00 — referência interna pendente de formalização, espelhada do catálogo homologado PROD-DIAG-FAM-MULTI. Sem cobrança, parcela, link Asaas, contrato ou assinatura.',
  preco_somente_leitura = true,
  status = 'draft',
  observacao_interna = 'Consolidação CORTE C. Aprovação bloqueada enquanto a conferência de escopo estiver bloqueada e a representação do dependente estiver pendente. Financeiro não liberado.',
  updated_at = now()
WHERE case_id = 'a11a0000-0000-4000-8000-000000000002' AND archived_at IS NULL;

INSERT INTO public.case_service_criterios
  (organization_id, case_id, case_service_id, entrega_codigo, entrega_rotulo, criterio_codigo, criterio_descricao, obrigatorio, ordem)
SELECT cs.organization_id, cs.case_id, cs.id, v.entrega_codigo, v.entrega_rotulo, v.criterio_codigo, v.criterio_descricao, true, v.ordem
FROM public.case_services cs
CROSS JOIN (VALUES
  ('ENT-DIAG-FAM','Diagnóstico familiar multipaís','CRIT-ESCOPO-CANVA','Escopo entregue confere com as páginas 1–7 da proposta Canva conferida.',0),
  ('ENT-DIAG-FAM','Diagnóstico familiar multipaís','CRIT-NUCLEO','Núcleo considerado é o registrado: Ana, Adair, Alice e Felipe como dependente.',1),
  ('ENT-DIAG-FAM','Diagnóstico familiar multipaís','CRIT-SEM-MERITO','Material entregue ao cliente não contém juízo de mérito nem promessa de resultado.',2),
  ('ENT-TRILHA-AT','Linha prioritária Áustria — § 58c StbG','CRIT-TRILHA-PRELIMINAR','Trilha apresentada como preliminar e revisável, com base legal citada.',3),
  ('ENT-TRILHA-AT','Linha prioritária Áustria — § 58c StbG','CRIT-FONTES','Fontes catalogadas sem disparar consulta externa não autorizada.',4),
  ('ENT-DOSSIE','Dossiê e evidências','CRIT-EVIDENCIA-PROJECAO','Nenhuma evidência exibida ao cliente sem projeção autorizada.',5),
  ('ENT-DOSSIE','Dossiê e evidências','CRIT-RASTREIO','Cada afirmação do dossiê aponta para evidência registrada no Desk.',6),
  ('ENT-COMERCIAL','Condição comercial e formalização','CRIT-PRECO-HOMOLOGADO','Valor praticado vem do catálogo homologado ou de exceção comercial aprovada.',7),
  ('ENT-COMERCIAL','Condição comercial e formalização','CRIT-TERCEIROS','Despesas de terceiros declaradas fora dos honorários.',8),
  ('ENT-COMERCIAL','Condição comercial e formalização','CRIT-SEM-AUTOMACAO','Nenhuma cobrança, link ou mensagem disparada sem decisão humana.',9)
) AS v(entrega_codigo, entrega_rotulo, criterio_codigo, criterio_descricao, ordem)
WHERE cs.case_id = 'a11a0000-0000-4000-8000-000000000002' AND cs.archived_at IS NULL
ON CONFLICT (case_id, entrega_codigo, criterio_codigo) DO NOTHING;