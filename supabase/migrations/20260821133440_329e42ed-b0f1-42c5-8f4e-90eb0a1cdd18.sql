ALTER TABLE public.product_catalog
  ADD COLUMN IF NOT EXISTS familia_comercial text,
  ADD COLUMN IF NOT EXISTS produto_pai_id uuid REFERENCES public.product_catalog(id),
  ADD COLUMN IF NOT EXISTS entregas_principais text,
  ADD COLUMN IF NOT EXISTS permite_recorrencia boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS papel_comercial text,
  ADD COLUMN IF NOT EXISTS faixa_prioridade text NOT NULL DEFAULT 'HISTORICO'
    CHECK (faixa_prioridade IN ('TOP_10','TOP_30','HISTORICO'));

ALTER TABLE public.sku_price_exceptions
  ADD COLUMN IF NOT EXISTS product_catalog_id uuid REFERENCES public.product_catalog(id),
  ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES public.opportunities(id),
  ADD COLUMN IF NOT EXISTS valor_excepcional numeric,
  ADD COLUMN IF NOT EXISTS justificativa text,
  ADD COLUMN IF NOT EXISTS data_inicio date,
  ADD COLUMN IF NOT EXISTS data_fim date;

-- Base comercial Top 30 (sem preço, sem link, sem elegibilidade de venda)
WITH base(code, nome_comercial, familia_comercial, tipo_oferta_novo, faixa, papel) AS (VALUES
 ('CA-CID-001','Consultoria de Cidadania Italiana','cidadania','produto_pai','TOP_10','Diagnóstico e direção'),
 ('CA-CID-002','Montagem Completa de Pasta para Cidadania','cidadania','produto_pai','TOP_10','Estratégia/documentação'),
 ('CA-CID-003','AIRE + Agendamento de Passaporte','pos_reconhecimento','produto_pai','TOP_10','Pós-reconhecimento'),
 ('CA-CID-023','Assessoria Completa de Cidadania Italiana','cidadania','produto_pai','TOP_10','Jornada completa'),
 ('CA-HIST-001','Estudo Genealógico e Patrimonial Aprofundado','pesquisa','produto_pai','TOP_10','Pesquisa principal'),
 ('CA-HIST-004','Pacote Família Completa — 3 Sobrenomes','pesquisa','produto_pai','TOP_10','Pesquisa familiar ampliada'),
 ('CA-MEM-003','Entrevista Guiada com Idoso','memoria','produto_pai','TOP_10','Memória/origem'),
 ('CA-MEM-004','Livro da História Familiar','memoria','produto_pai','TOP_10','Entrega de legado'),
 ('CA-ASS-002','Plano Memórias','continuidade','recorrente','TOP_10','Continuidade recorrente'),
 ('CA-IND-005','Livro Biográfico Completo — Premium','legado','produto_pai','TOP_10','Legado premium'),
 ('CA-ASS-001','Plano Essência','continuidade','recorrente','TOP_30','Entrada/continuidade'),
 ('CA-ASS-003','Plano Legado','continuidade','recorrente','TOP_30','Continuidade premium'),
 ('CA-ASS-004','Assinatura Cidadão Pós-Reconhecimento','continuidade','recorrente','TOP_30','Pós-cidadania recorrente'),
 ('CA-ASS-005','Plano Anual com Desconto — Memórias','continuidade','recorrente','TOP_30','Modalidade anual'),
 ('CA-CID-006','Combo Codice + SPID','pos_reconhecimento','complemento','TOP_30','Complemento pós-cidadania'),
 ('CA-CID-009','Registro de 1º Filho','cidadania','complemento','TOP_30','Regularização familiar'),
 ('CA-CID-016','Registro de Filhos Adicionais','cidadania','complemento','TOP_30','Extensão familiar'),
 ('CA-CID-018','Transcrição de Atos no País de Origem Europeia','cidadania','complemento','TOP_30','Regularização contextual'),
 ('CA-CID-019','Declaração de Valor','documental','complemento','TOP_30','Documento especializado'),
 ('CA-CID-020','Consultoria e Declaração de Valor','documental','complemento','TOP_30','Bundle especializado'),
 ('CA-CID-021','Combo Starter Cidadania','cidadania','complemento','TOP_30','Entrada estruturada'),
 ('CA-CID-025','Acompanhamento Familiar — Processo Compartilhado','cidadania','complemento','TOP_30','Complemento familiar'),
 ('CA-HIST-005','Pesquisa de Base Familiar','pesquisa','complemento','TOP_30','Pesquisa inicial'),
 ('CA-HIST-006','Combo Pesquisa + Diagnóstico de Cidadania Italiana','pesquisa','complemento','TOP_30','Ponte pesquisa/cidadania'),
 ('CA-IND-001','Autobiografia Guiada — Pacote Express','memoria','complemento','TOP_30','Memória individual'),
 ('CA-IND-002','Legado em Vídeo — Mini-Série de Depoimentos','memoria','upgrade','TOP_30','Upgrade de memória'),
 ('CA-IND-006','Memória Empresarial — História da Empresa','legado','produto_pai','TOP_30','B2B/premium'),
 ('CA-MEM-008','Livro de Memórias Premium','memoria','upgrade','TOP_30','Upgrade editorial'),
 ('CA-COMBO-001','Combo Vó','sazonal','sazonal','TOP_30','Oferta sazonal'),
 ('CA-FAM-002','Familiar Conectado Plus','continuidade','complemento','TOP_30','Continuidade familiar')
)
INSERT INTO public.product_catalog (
  organization_id, code, nome_comercial, familia_comercial, tipo_oferta, faixa_prioridade,
  papel_comercial, status_homologacao, elegivel_para_proposta, requer_fechamento_humano,
  permite_recorrencia, ativo, observacao_de_governanca
)
SELECT '11f32aae-ea08-47e0-8114-f5d8a900c9a1', b.code, b.nome_comercial, b.familia_comercial, b.tipo_oferta_novo,
       b.faixa, b.papel, 'em_revisao', false, true,
       b.tipo_oferta_novo = 'recorrente', true,
       'Base comercial Top 30. Entra no seletor apenas após homologação de preço vigente, escopo e condição no Desk.'
FROM base b
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_catalog p
  WHERE p.organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1' AND p.code = b.code
);

-- Atualiza itens já existentes que pertencem à base Top 30
WITH base(code, familia_comercial, tipo_oferta_novo, faixa, papel) AS (VALUES
 ('CA-CID-001','cidadania','produto_pai','TOP_10','Diagnóstico e direção'),
 ('CA-CID-002','cidadania','produto_pai','TOP_10','Estratégia/documentação'),
 ('CA-CID-003','pos_reconhecimento','produto_pai','TOP_10','Pós-reconhecimento'),
 ('CA-CID-023','cidadania','produto_pai','TOP_10','Jornada completa'),
 ('CA-HIST-001','pesquisa','produto_pai','TOP_10','Pesquisa principal'),
 ('CA-HIST-004','pesquisa','produto_pai','TOP_10','Pesquisa familiar ampliada'),
 ('CA-MEM-003','memoria','produto_pai','TOP_10','Memória/origem'),
 ('CA-MEM-004','memoria','produto_pai','TOP_10','Entrega de legado'),
 ('CA-ASS-002','continuidade','recorrente','TOP_10','Continuidade recorrente'),
 ('CA-IND-005','legado','produto_pai','TOP_10','Legado premium'),
 ('CA-ASS-001','continuidade','recorrente','TOP_30','Entrada/continuidade'),
 ('CA-ASS-003','continuidade','recorrente','TOP_30','Continuidade premium'),
 ('CA-ASS-004','continuidade','recorrente','TOP_30','Pós-cidadania recorrente'),
 ('CA-ASS-005','continuidade','recorrente','TOP_30','Modalidade anual'),
 ('CA-CID-006','pos_reconhecimento','complemento','TOP_30','Complemento pós-cidadania'),
 ('CA-CID-009','cidadania','complemento','TOP_30','Regularização familiar'),
 ('CA-CID-016','cidadania','complemento','TOP_30','Extensão familiar'),
 ('CA-CID-018','cidadania','complemento','TOP_30','Regularização contextual'),
 ('CA-CID-019','documental','complemento','TOP_30','Documento especializado'),
 ('CA-CID-020','documental','complemento','TOP_30','Bundle especializado'),
 ('CA-CID-021','cidadania','complemento','TOP_30','Entrada estruturada'),
 ('CA-CID-025','cidadania','complemento','TOP_30','Complemento familiar'),
 ('CA-HIST-005','pesquisa','complemento','TOP_30','Pesquisa inicial'),
 ('CA-HIST-006','pesquisa','complemento','TOP_30','Ponte pesquisa/cidadania'),
 ('CA-IND-001','memoria','complemento','TOP_30','Memória individual'),
 ('CA-IND-002','memoria','upgrade','TOP_30','Upgrade de memória'),
 ('CA-IND-006','legado','produto_pai','TOP_30','B2B/premium'),
 ('CA-MEM-008','memoria','upgrade','TOP_30','Upgrade editorial'),
 ('CA-COMBO-001','sazonal','sazonal','TOP_30','Oferta sazonal'),
 ('CA-FAM-002','continuidade','complemento','TOP_30','Continuidade familiar')
)
UPDATE public.product_catalog p
SET familia_comercial = COALESCE(p.familia_comercial, b.familia_comercial),
    tipo_oferta = b.tipo_oferta_novo,
    faixa_prioridade = b.faixa,
    papel_comercial = b.papel,
    permite_recorrencia = (b.tipo_oferta_novo = 'recorrente'),
    requer_fechamento_humano = true
FROM base b
WHERE p.code = b.code;

-- Fora da base Top 30: histórico e fora do seletor comercial
UPDATE public.product_catalog
SET faixa_prioridade = 'HISTORICO',
    elegivel_para_proposta = false,
    observacao_de_governanca = COALESCE(observacao_de_governanca, 'Fora da base comercial Top 30. Preservado como histórico e uso interno; não entra no seletor de proposta.')
WHERE faixa_prioridade = 'HISTORICO'
  AND code NOT IN (
   'CA-CID-001','CA-CID-002','CA-CID-003','CA-CID-023','CA-HIST-001','CA-HIST-004','CA-MEM-003','CA-MEM-004','CA-ASS-002','CA-IND-005',
   'CA-ASS-001','CA-ASS-003','CA-ASS-004','CA-ASS-005','CA-CID-006','CA-CID-009','CA-CID-016','CA-CID-018','CA-CID-019','CA-CID-020',
   'CA-CID-021','CA-CID-025','CA-HIST-005','CA-HIST-006','CA-IND-001','CA-IND-002','CA-IND-006','CA-MEM-008','CA-COMBO-001','CA-FAM-002');