Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: Financeiro/CRM como prioridade 1 (conforme matriz operacional da proprietária + Perplexity).
Este prompt NÃO constrói nada novo — o mecanismo de reconciliação de catálogo já existe
(product_catalog, catalogo-fonte-mestre.ts, /conciliacao-catalogo, /divergencias-catalogo). O trabalho
aqui é rodar, verificar e relatar com dado real, e resolver o que puder ser resolvido sem decisão de
preço nova.

Modo de execução obrigatório: EXECUTE, com evidência objetiva (números reais, não estimativa).

Escopo e proibições
- Não alterar preço de nenhum SKU — preço é decisão humana (DH-002), não decisão técnica.
- Não criar produto novo nem SKU novo.
- Não apagar nenhum produto — só marcar status (ativo/arquivado) se for claramente teste/dummy, com
  registro de motivo.

────────────────────────────────────────

1. Rodar a conciliação real e reportar números

Abrir /conciliacao-catalogo e /divergencias-catalogo com sessão real. Reportar:
- Quantos SKUs existem hoje em product_catalog (tabela oficial/comercial).
- Quantos SKUs existem no snapshot catalogo-fonte-mestre.ts (fonte: "CA · FIN · Planilha Mestre de
  Produtos OFICIAL 2.xlsx").
- Quantas divergências estão listadas em /divergencias-catalogo hoje, separadas por status (bloqueio /
  atenção / resolvidas).
- Para as divergências de status "bloqueio": listar SKU, tipo de divergência (preço, escopo, link
  Asaas) e o valor de cada lado — sem resolver sozinho, só reportar para a proprietária decidir.

2. Confirmar ausência de produto fictício/teste em produção

Verificar se algum registro em product_catalog tem nome, código ou padrão que indique teste/dummy
(ex.: "teste", "exemplo", "TBD", código fora do padrão CA-XXX-000). Se encontrar algum: reportar
individualmente (SKU, nome, criado por, criado quando) — não arquivar sozinho, só listar para decisão.

3. Confirmar fonte única de preço no fluxo comercial e no App Cliente

Verificar, com evidência de código (não suposição): as telas de Propostas (/propostas) e o que o
cliente vê em /portal/proposta leem preço de onde? Precisa ser sempre product_catalog
(preco_comercial_vigente), nunca diretamente de catalogo-fonte-mestre.ts (que é só snapshot de
referência) nem de nenhum outro lugar. Se encontrar qualquer tela lendo preço de uma fonte que não seja
product_catalog, reportar como risco de divergência silenciosa (o mesmo problema que a proprietária já
queria evitar).

4. Convenção de nomes — relatar, não corrigir sozinho

Levantar se os códigos de SKU seguem um padrão único e consistente hoje (ex.: CA-CID-001, CA-MEM-003,
CA-HIST-001 — prefixo por categoria) em toda a base de product_catalog, ou se há inconsistência.
Reportar exemplos de inconsistência, se houver, sem renomear nada sozinho — renomear SKU pode quebrar
link Asaas já em uso por cliente real.

────────────────────────────────────────

Ao final: reportar em números reais — SKUs totais, divergências por status, produtos suspeitos de
teste, confirmação (ou não) de fonte única de preço, e convenção de nomes — para a proprietária decidir
o que resolver primeiro. Nenhuma decisão de preço, SKU novo ou exclusão deve ser tomada neste ciclo.
