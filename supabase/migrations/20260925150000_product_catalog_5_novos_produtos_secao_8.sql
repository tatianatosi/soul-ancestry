-- P9 (25/09/2026) — 5 dos ~12 códigos genuinamente ausentes do catálogo
-- de 33 produtos-pai por jornada (seção 8, CA-DECISOES-CANONICAS-CRM-
-- CATALOGO-PLANEJADOR-JORNADA-v1.0.md), confirmados sem SKU real
-- correspondente entre os 35 SKUs vivos nem na lista-alimento
-- (planner_catalog_feed) por leitura direta do banco.
--
-- Conservador: status_homologacao='em_revisao', elegivel_para_proposta=
-- false, sem preço — nada aqui pode ser proposto/cobrado até homologação
-- humana real. `CA-MEM-004` (Mapa Ancestral Ilustrado) foi excluído deste
-- lote: o código já existe em product_catalog para um produto diferente
-- ("Livro da Historia Familiar") — colisão de código, registrada no
-- de-para, sem código novo atribuído aqui.
insert into public.product_catalog
  (organization_id, code, nome_comercial, jornada_fase, tipo_oferta, prioridade_catalogo,
   status_homologacao, elegivel_para_proposta, condicao_comercial_padrao, escopo_aprovado,
   origem_legada_referencia, observacao_de_governanca)
select o.id, v.code, v.nome_comercial, v.jornada_fase, v.tipo_oferta, v.prioridade_catalogo,
       'em_revisao', false, v.condicao_comercial_padrao, v.escopo_aprovado,
       'docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md §8',
       v.observacao_de_governanca
from public.organizations o
cross join (values
  ('CA-DIAG-003', 'Diagnóstico de Pesquisa de Origem', 'diagnostico', 'produto_pai', 'TOP_30',
   'Preço não homologado — aguardando decisão comercial.',
   'Diagnóstico focado em pesquisa de origem ancestral, distinto do diagnóstico familiar multipaís (PROD-DIAG-FAM-MULTI). Escopo pendente de validação humana.',
   'Criado no P9 (25/09/2026) — de-para do catálogo de 33 produtos-pai por jornada. Sem SKU real correspondente encontrado nos 35 SKUs vivos.'),
  ('CA-DOC-005', 'Coordenação de Tradução e Apostilamento', 'documentacao', 'complemento', 'TOP_30',
   'Preço não homologado — aguardando decisão comercial.',
   'Coordenação de tradução juramentada e apostilamento de documentos. Escopo pendente de validação humana.',
   'Criado no P9 (25/09/2026). Sem SKU real correspondente encontrado nos 35 SKUs vivos nem na lista-alimento (planner_catalog_feed).'),
  ('CA-PROT-002', 'Estratégia de Via Jurídica com Parceiro', 'protocolo', 'complemento', 'SOB_DEMANDA',
   'Sob demanda, revisão jurídica obrigatória antes de qualquer proposta.',
   'Estratégia de via jurídica desenvolvida em conjunto com parceiro externo. Escopo pendente de validação humana e jurídica.',
   'Criado no P9 (25/09/2026). Sem SKU real correspondente encontrado.'),
  ('CA-PROT-004', 'Preparação de Reunião ou Entrevista Consular', 'protocolo', 'complemento', 'TOP_30',
   'Preço não homologado — aguardando decisão comercial.',
   'Preparação do cliente para reunião ou entrevista em instituição consular. Escopo pendente de validação humana.',
   'Criado no P9 (25/09/2026). Sem SKU real correspondente encontrado.'),
  ('CA-MEM-006', 'Acervo Digital Familiar', 'memoria', 'complemento', 'TOP_30',
   'Preço não homologado — aguardando decisão comercial.',
   'Acervo digital organizado de documentos e memórias familiares. Escopo pendente de validação humana.',
   'Criado no P9 (25/09/2026). Sem SKU real correspondente vivo hoje.')
) as v(code, nome_comercial, jornada_fase, tipo_oferta, prioridade_catalogo,
       condicao_comercial_padrao, escopo_aprovado, observacao_de_governanca)
where o.id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and not exists (
    select 1 from public.product_catalog p
    where p.organization_id = o.id and p.code = v.code
  );

-- Corrige case_plans.produto_pai_id do caso-piloto Ana Luiza (P8): estava
-- null apesar de case_services.product_catalog_id já apontar para
-- PROD-DIAG-FAM-MULTI (nome idêntico ao produto-pai canônico PP-01).
update public.case_plans
set produto_pai_id = 'PP-01'
where id = '02a0bb14-130f-42a3-aa4e-ac2b8685bb29'
  and produto_pai_id is null;
