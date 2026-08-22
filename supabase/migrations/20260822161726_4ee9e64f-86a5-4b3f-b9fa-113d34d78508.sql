-- Importação controlada, aditiva e idempotente do Top 30 Pareto da fonte canônica.
ALTER TABLE public.product_catalog
  ADD COLUMN IF NOT EXISTS fonte_arquivo text,
  ADD COLUMN IF NOT EXISTS fonte_aba text,
  ADD COLUMN IF NOT EXISTS fonte_versao text,
  ADD COLUMN IF NOT EXISTS fonte_linha integer,
  ADD COLUMN IF NOT EXISTS pareto_classificacao text,
  ADD COLUMN IF NOT EXISTS categoria_fonte text,
  ADD COLUMN IF NOT EXISTS subcategoria_fonte text,
  ADD COLUMN IF NOT EXISTS familia_fonte text,
  ADD COLUMN IF NOT EXISTS tipo_fonte text,
  ADD COLUMN IF NOT EXISTS descricao_curta_fonte text,
  ADD COLUMN IF NOT EXISTS canal_fechamento_fonte text,
  ADD COLUMN IF NOT EXISTS moeda text NOT NULL DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS preco_atual_fonte numeric(14,2),
  ADD COLUMN IF NOT EXISTS preco_sugerido_fonte numeric(14,2),
  ADD COLUMN IF NOT EXISTS status_fonte text,
  ADD COLUMN IF NOT EXISTS link_asaas_fonte text,
  ADD COLUMN IF NOT EXISTS status_link_asaas_fonte text,
  ADD COLUMN IF NOT EXISTS divergencia text,
  ADD COLUMN IF NOT EXISTS importado_em timestamptz;

CREATE TABLE IF NOT EXISTS public.catalog_source_divergences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  sku text NOT NULL,
  tipo text NOT NULL,
  detalhe text NOT NULL,
  fonte_referencia text NOT NULL,
  fonte_linha integer,
  resolvido boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS catalog_source_div_uidx
  ON public.catalog_source_divergences (organization_id, sku, tipo);

GRANT SELECT, INSERT, UPDATE ON public.catalog_source_divergences TO authenticated;
GRANT ALL ON public.catalog_source_divergences TO service_role;
ALTER TABLE public.catalog_source_divergences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalog_source_div_select ON public.catalog_source_divergences;
CREATE POLICY catalog_source_div_select ON public.catalog_source_divergences
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
DROP POLICY IF EXISTS catalog_source_div_insert ON public.catalog_source_divergences;
CREATE POLICY catalog_source_div_insert ON public.catalog_source_divergences
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
DROP POLICY IF EXISTS catalog_source_div_update ON public.catalog_source_divergences;
CREATE POLICY catalog_source_div_update ON public.catalog_source_divergences
  FOR UPDATE TO authenticated USING (public.can_write(organization_id))
  WITH CHECK (public.can_write(organization_id));

DROP TRIGGER IF EXISTS trg_catalog_source_div_no_delete ON public.catalog_source_divergences;
CREATE TRIGGER trg_catalog_source_div_no_delete BEFORE DELETE ON public.catalog_source_divergences
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

WITH fonte(sku, produto, categoria, subcategoria, familia, tipo, descricao, preco_atual, preco_sugerido,
           status_fonte, link_asaas, status_link, canal, linha, faixa) AS (
  VALUES
  ('CA-CID-001','Consultoria de Cidadania Italiana','Cidadania Italiana','Consultoria','F1 – Consultoria / Decisão','Venda Unica','Analise completa do caso + plano de acao personalizado',197.0,260.0,'Ativo','https://www.asaas.com/c/qh7grpxtwr6o7h2d','link_criado','WhatsApp Direto',2,'TOP_10'),
  ('CA-CID-002','Montagem Completa de Pasta para Cidadania','Cidadania Italiana','Documentacao','F3 – Documentos / Burocracia','Venda Unica','Servico do zero a pasta pronta para uso consular',1436.0,990.0,'Ativo','https://www.asaas.com/c/40jg1p7d9k6heau9','link_criado','WhatsApp Direto',3,'TOP_10'),
  ('CA-CID-003','AIRE + Agendamento de Passaporte','Cidadania Italiana','Regularizacao','F3 – Documentos / Burocracia','Venda Unica','Regularizacao AIRE e apoio no agendamento de passaporte italiano',530.0,490.0,'Ativo','https://www.asaas.com/c/s6gn74dkizo1p2jk','link_criado','WhatsApp Direto',4,'TOP_10'),
  ('CA-CID-006','Combo Codice + SPID','Cidadania Italiana','Documentos Avulsos','F3 – Documentos / Burocracia','Bundle','Codice Fiscale + SPID com desconto',280.0,249.0,'Ativo','https://www.asaas.com/c/nckx16l6u66myjrt','link_criado','WhatsApp Direto',7,'TOP_30'),
  ('CA-CID-009','Registro de 1o Filho','Cidadania Italiana','Registros','F3 – Documentos / Burocracia','Venda Unica','Registro de primeiro filho no consulado italiano',628.0,490.0,'Ativo','https://www.asaas.com/c/bcdzse9of253idkf','link_criado','WhatsApp Direto',10,'TOP_30'),
  ('CA-MEM-003','Entrevista Guiada com Idoso','Memoria Familiar','Entrevistas','F5 – Memória / Legado / Presentes / Conteúdo','Venda Unica','Sessao estruturada para capturar historias de vida',297.0,197.0,'Ativo','https://www.asaas.com/c/nufu1fsxm2zr9yks','link_criado','WhatsApp Direto',14,'TOP_30'),
  ('CA-MEM-004','Livro da Historia Familiar','Memoria Familiar','Livros','F5 – Memória / Legado / Presentes / Conteúdo','Venda Unica','Livro personalizado com historia e arvore genealogica',490.0,390.0,'Ativo','https://www.asaas.com/c/7me3z13aox80l4gw','link_criado','WhatsApp Direto',15,'TOP_10'),
  ('CA-HIST-001','Estudo Genealogico e Patrimonial Aprofundado','Historia da Familia','Estudo Completo','F2 – Origem / Genealogia','Venda Unica','Levantamento completo de linhagem + documentos historicos + patrimonio',5651.0,4500.0,'Ativo','https://www.asaas.com/c/tk0r7l62pzkkvpee','link_criado','WhatsApp Direto',18,'TOP_10'),
  ('CA-HIST-002','Pesquisa Genealogica Extra com Sobrenome Adicional','Historia da Familia','Extensao','F2 – Origem / Genealogia','Upsell','Pesquisa adicional para aprofundar ramos apos estudo principal',7053.0,7700.0,'Ativo','https://www.asaas.com/c/4ndyo99vbepz8jxx','link_criado','WhatsApp Direto',19,'TOP_30'),
  ('CA-ASS-002','Plano Memorias','Assinatura','Recorrente','F4 – Assinaturas / Acompanhamento contínuo','Assinatura Mensal','Acompanhamento mensal com entregas de memoria e suporte prioritario',269.0,169.0,'Ativo','https://www.asaas.com/c/w5j0vaamo8lqwbmj','link_criado','WhatsApp Direto',21,'TOP_10'),
  ('CA-CID-016','Registro de Filhos Adicionais (mesmo pedido AIRE)','Cidadania Italiana','Registros','F3 – Documentos / Burocracia','Venda Unica','Registro de filhos adicionais no mesmo pedido de atualizacao de AIRE',1511.0,2490.0,'Ativo','https://www.asaas.com/c/83qju7fpbxktynz8','link_criado','WhatsApp Direto',28,'TOP_30'),
  ('CA-CID-018','Emissao de Transcricao de Atos no Pais de Origem Europeia','Cidadania Italiana','Certidoes','F3 – Documentos / Burocracia','Venda Unica','Transcricao de atos no pais de origem europeia',1588.0,2490.0,'Ativo','https://www.asaas.com/c/zxjcziro4nnvx73a','link_criado','WhatsApp Direto',30,'TOP_30'),
  ('CA-CID-019','Declaracao de Valor - Ensino Fundamental ate Universidade','Cidadania Italiana','Documentos Avulsos','F3 – Documentos / Burocracia','Venda Unica','Declaracao de equivalencia/valor de diploma',3881.0,4500.0,'Ativo','https://www.asaas.com/c/blp0qnjvfvxwg8j5','link_criado','WhatsApp Direto',31,'TOP_30'),
  ('CA-CID-020','Consultoria e Declaracao de Valor','Cidadania Italiana','Documentos Avulsos','F1 – Consultoria / Decisão','Bundle','Consultoria completa + declaracao de valor para processos documentais',3520.0,4500.0,'Ativo','https://www.asaas.com/c/sokd3fsi44mp5wc2','link_criado','WhatsApp Direto',32,'TOP_30'),
  ('CA-MEM-008','Livro de Memórias Premium','Memória Familiar','Serviço','F5 – Memória / Legado / Presentes / Conteúdo','Avulso','Livro de memórias premium com ghostwriting, fotos e encadernação',2990.0,1990.0,'Ativo','https://www.asaas.com/c/iu2vcbobtcvjvw6x','link_criado','WhatsApp Direto',34,'TOP_30'),
  ('CA-IND-001','Autobiografia Guiada — Pacote Express','Memória Individual','Serviço','F5 – Memória / Legado / Presentes / Conteúdo','Avulso','3 sessões de entrevista + ghostwriting + e-book de 40–60 páginas',1490.0,890.0,'Ativo','https://www.asaas.com/c/840llpmal066npod','link_criado','WhatsApp Direto',36,'TOP_30'),
  ('CA-IND-002','Legado em Vídeo — Mini-Série de Depoimentos','Memória Individual','Serviço','F5 – Memória / Legado / Presentes / Conteúdo','Avulso','Série de mini-documentários em vídeo com depoimentos familiares',1590.0,1990.0,'Ativo','https://www.asaas.com/c/05doqjg1zxqg3su6','link_criado','WhatsApp Direto',37,'TOP_30'),
  ('CA-IND-005','Livro Biográfico Completo — Premium','Memória Individual','Serviço','F5 – Memória / Legado / Presentes / Conteúdo','Avulso','Livro biográfico completo com pesquisa aprofundada e edição premium',7700.0,5900.0,'Ativo',NULL,'pendente_criar_link','WhatsApp Direto',40,'TOP_30'),
  ('CA-IND-006','Memória Empresarial — História da Empresa','Memória Individual','Serviço','F5 – Memória / Legado / Presentes / Conteúdo','Avulso','Registro profissional da história e trajetória da empresa',8500.0,5900.0,'Ativo',NULL,'pendente_criar_link','WhatsApp Direto',41,'TOP_30'),
  ('CA-COMBO-001','Combo Vó (Restauração + Entrevista + Diário)','Combos Sazonais','Combo','F5 – Memória / Legado / Presentes / Conteúdo','Combo','Restauração de 1 foto + Entrevista Guiada com idoso + Diário',490.0,490.0,'Ativo','https://www.asaas.com/c/xnyiixgeqw57cxo1','link_criado','WhatsApp Direto',43,'TOP_10'),
  ('CA-CID-021','Combo Starter Cidadania (Códice + SPID + Consultoria Express)','Cidadania Italiana','Combo','F1 – Consultoria / Decisão','Combo','Códice Fiscale + SPID + Consultoria Express 30min',340.0,490.0,'Ativo','https://www.asaas.com/c/kabbxo6ql3nw48i1','link_criado','WhatsApp Direto',46,'TOP_10'),
  ('CA-ASS-005','Plano Anual com Desconto — Memórias','Assinaturas','Assinatura','F4 – Assinaturas / Acompanhamento contínuo','Recorrente','Plano Memórias pré-pago anual com desconto vs mensal',2148.0,1825.0,'Ativo','https://www.asaas.com/c/dcsypo4zsl348q78','link_criado','WhatsApp Direto',47,'TOP_30'),
  ('CA-HIST-004','Pacote Família Completa (3 Sobrenomes)','História da Família','Serviço','F2 – Origem / Genealogia','Avulso','Pesquisa genealógica abrangente de 3 famílias',3200.0,2490.0,'Ativo','https://www.asaas.com/c/3m9fo98fzouff0t2','link_criado','WhatsApp Direto',52,'TOP_30'),
  ('CA-CID-023','Assessoria Completa de Cidadania Italiana','Cidadania Italiana','Serviço','F1 – Consultoria / Decisão','Sob Consulta','Condução completa do processo de cidadania do início ao fim',4500.0,4500.0,'Ativo','https://www.asaas.com/c/c3yc6d3pljifsi25','link_criado','WhatsApp Direto',54,'TOP_10'),
  ('CA-CID-025','Acompanhamento Familiar — Processo Compartilhado','Cidadania Italiana','Serviço','F1 – Consultoria / Decisão','Pacote','Coordenação do processo para mais de um membro da mesma família',990.0,1190.0,'Ativo','https://www.asaas.com/c/id9vd92n9zwlrn5f','link_criado','WhatsApp Direto',56,'TOP_30'),
  ('CA-CID-002A','Revisão de Pasta para Cidadania','Cidadania Italiana','Derivado Pasta','F2 – Execução','Venda Unica','Auditoria técnica de pasta já existente com relatório de pendências',690.0,690.0,'Ativo',NULL,'pendente_criar_link','WhatsApp Direto',59,'TOP_30'),
  ('CA-CID-002B','Atualização de Pasta para Cidadania','Cidadania Italiana','Derivado Pasta','F2 – Execução','Venda Unica','Atualização de pasta após novos registros ou mudanças familiares',890.0,890.0,'Ativo',NULL,'pendente_criar_link','WhatsApp Direto',60,'TOP_30'),
  ('CA-CID-002C','Complemento de Pasta para Cidadania','Cidadania Italiana','Derivado Pasta','F2 – Execução','Venda Unica','Inclusão de peças faltantes específicas em pasta quase pronta',490.0,490.0,'Ativo',NULL,'pendente_criar_link','WhatsApp Direto',61,'TOP_30'),
  ('CA-CID-002D','Pasta + Checklist de Pendências','Cidadania Italiana','Derivado Pasta','F2 – Execução','Venda Unica','Mapa de pendências estruturado sem montagem completa',390.0,390.0,'Ativo',NULL,'pendente_criar_link','WhatsApp Direto',62,'TOP_30'),
  ('CA-WPP-002','Pacote WhatsApp Premium','WhatsApp Familiar','Conexão Familiar','F4 – Memória','Venda Unica','Pacote premium de conexão familiar via WhatsApp',149.0,119.0,'Ativo',NULL,'pendente_criar_link','App / WhatsApp',82,'TOP_30')
), orgs AS (SELECT DISTINCT organization_id FROM public.product_catalog)
INSERT INTO public.product_catalog (
  organization_id, code, nome_comercial, faixa_prioridade, prioridade_catalogo, status_produto,
  preco_comercial_vigente, moeda, categoria_fonte, subcategoria_fonte, familia_fonte, tipo_fonte,
  descricao_curta_fonte, canal_fechamento_fonte, preco_atual_fonte, preco_sugerido_fonte,
  status_fonte, link_asaas_fonte, status_link_asaas_fonte, status_link_asaas,
  pareto_classificacao, fonte_arquivo, fonte_aba, fonte_versao, fonte_linha, importado_em,
  status_homologacao, elegivel_para_proposta, ativo, versao_vigencia, origem_legada_referencia
)
SELECT o.organization_id, f.sku, f.produto, f.faixa, f.faixa, 'ativo',
       f.preco_sugerido, 'BRL', f.categoria, f.subcategoria, f.familia, f.tipo,
       f.descricao, f.canal, f.preco_atual, f.preco_sugerido,
       f.status_fonte, f.link_asaas, f.status_link,
       CASE WHEN f.status_link = 'link_criado' THEN 'validado' ELSE 'pendente' END,
       'TOP_PARETO', 'CA · FIN · Planilha Mestre de Produtos OFICIAL 2.xlsx', 'Catalogo Produtos',
       'OFICIAL-2/2b0a6512abdf641f', f.linha, now(),
       'homologado', true, true, 'OFICIAL-2/2b0a6512abdf641f',
       'Planilha Mestre linha ' || f.linha
FROM fonte f CROSS JOIN orgs o
ON CONFLICT (organization_id, code) DO UPDATE SET
  nome_comercial = EXCLUDED.nome_comercial,
  faixa_prioridade = EXCLUDED.faixa_prioridade,
  prioridade_catalogo = EXCLUDED.prioridade_catalogo,
  status_produto = EXCLUDED.status_produto,
  preco_comercial_vigente = EXCLUDED.preco_comercial_vigente,
  moeda = EXCLUDED.moeda,
  categoria_fonte = EXCLUDED.categoria_fonte,
  subcategoria_fonte = EXCLUDED.subcategoria_fonte,
  familia_fonte = EXCLUDED.familia_fonte,
  tipo_fonte = EXCLUDED.tipo_fonte,
  descricao_curta_fonte = EXCLUDED.descricao_curta_fonte,
  canal_fechamento_fonte = EXCLUDED.canal_fechamento_fonte,
  preco_atual_fonte = EXCLUDED.preco_atual_fonte,
  preco_sugerido_fonte = EXCLUDED.preco_sugerido_fonte,
  status_fonte = EXCLUDED.status_fonte,
  link_asaas_fonte = EXCLUDED.link_asaas_fonte,
  status_link_asaas_fonte = EXCLUDED.status_link_asaas_fonte,
  status_link_asaas = EXCLUDED.status_link_asaas,
  pareto_classificacao = EXCLUDED.pareto_classificacao,
  fonte_arquivo = EXCLUDED.fonte_arquivo,
  fonte_aba = EXCLUDED.fonte_aba,
  fonte_versao = EXCLUDED.fonte_versao,
  fonte_linha = EXCLUDED.fonte_linha,
  importado_em = now(),
  versao_vigencia = EXCLUDED.versao_vigencia,
  status_homologacao = 'homologado',
  elegivel_para_proposta = true,
  ativo = true
WHERE public.product_catalog.fonte_versao IS DISTINCT FROM EXCLUDED.fonte_versao;

INSERT INTO public.catalog_source_divergences (organization_id, sku, tipo, detalhe, fonte_referencia, fonte_linha)
SELECT p.organization_id, p.code, 'divergencia_preco',
       'Preço praticado na fonte (' || p.preco_atual_fonte || ') difere do preço sugerido oficial (' || p.preco_sugerido_fonte || ').',
       p.fonte_arquivo || ' · ' || p.fonte_aba || ' · ' || p.fonte_versao, p.fonte_linha
FROM public.product_catalog p
WHERE p.pareto_classificacao = 'TOP_PARETO'
  AND p.preco_atual_fonte IS NOT NULL AND p.preco_sugerido_fonte IS NOT NULL
  AND p.preco_atual_fonte <> p.preco_sugerido_fonte
ON CONFLICT (organization_id, sku, tipo) DO NOTHING;

INSERT INTO public.catalog_source_divergences (organization_id, sku, tipo, detalhe, fonte_referencia, fonte_linha)
SELECT p.organization_id, p.code, 'reconciliacao_asaas',
       'Estado do link na fonte: ' || p.status_link_asaas_fonte || '. Nenhuma chamada ou alteração no Asaas foi executada.',
       p.fonte_arquivo || ' · ' || p.fonte_aba || ' · ' || p.fonte_versao, p.fonte_linha
FROM public.product_catalog p
WHERE p.pareto_classificacao = 'TOP_PARETO' AND p.status_link_asaas_fonte <> 'link_criado'
ON CONFLICT (organization_id, sku, tipo) DO NOTHING;

INSERT INTO public.catalog_source_divergences (organization_id, sku, tipo, detalhe, fonte_referencia, fonte_linha)
SELECT p.organization_id, p.code, 'campo_ausente_na_fonte',
       'A fonte não possui colunas de Entregáveis, Inclusões, Exclusões, Microentrega, Regra de aplicabilidade, Tipo de cobrança e Responsável. Nenhum valor foi inventado.',
       p.fonte_arquivo || ' · ' || p.fonte_aba || ' · ' || p.fonte_versao, p.fonte_linha
FROM public.product_catalog p
WHERE p.pareto_classificacao = 'TOP_PARETO'
ON CONFLICT (organization_id, sku, tipo) DO NOTHING;