# P9 — Criação de 5 produtos genuinamente ausentes do catálogo (seção 8) + correção de colisão

## Contexto

Continuação do P8 (`2026-09-25_DE-PARA-CATALOGO-33-CODIGOS-SECAO-8-vs-35-SKUS-REAIS.md`).
A Proprietária aprovou criar os produtos ausentes, pedindo antes para
verificar reconciliação com SKUs legados (muitos ligados à Itália) e
considerar que alguns códigos poderiam ser agregadores em vez de SKU
novo.

## Verificação antes de criar (nada era um SKU legado escondido)

Antes de inserir qualquer linha, verifiquei os ~12 códigos sem
correspondência clara contra:
- `product_catalog` arquivado (`archived_at is not null`) — **zero linhas
  arquivadas existem hoje**; não há SKU legado escondido para reaproveitar.
- `planner_catalog_feed` (lista-alimento, inclui variantes por país —
  Áustria/Alemanha/Espanha/Croácia/Hungria/Irlanda/Luxemburgo/Polônia/
  Portugal/Romênia/Brasil/França) — busca por palavra-chave
  (tradução/apostilamento/certidão/mapa/acervo/consular/parceiro/origem/
  retificação) não encontrou nenhum item da lista-alimento cobrindo essas
  ideias. Os itens por país existentes seguem só o padrão de 3 fases
  (diagnóstico/documentação/acompanhamento) por país — nenhum cobre os
  conceitos pedidos.
- `escopo_aprovado` dos SKUs italianos reais (`CA-CID-002`/`CA-CID-023`/
  `CA-CID-003` etc.) — todos vazios (nunca preenchidos); não há texto de
  escopo escondendo esses conceitos dentro de um SKU maior.

Conclusão: os ~12 códigos são, de fato, ausentes — não SKUs legados sob
outro nome.

## Classificação antes de criar — nem tudo deveria virar SKU comercial

| Código | Decisão | Motivo |
|---|---|---|
| CA-DIAG-004 (AncestralScan) | **Não criar como produto** | O próprio documento descreve como "funil, sem cobrança" — é uma ferramenta/agregador de captação, não um SKU vendável. Não existe hoje como feature real em nenhuma rota do código (confirmado: "AncestralScan" só aparece em `ca06-catalogo-operacional.ts`, proposta nunca implementada). |
| CA-DOC-001 (Plano Documental e Checklist de Prontidão) | **Não criar como produto** | É um artefato do Planejador (checklist), não um item comercial — já teria equivalente funcional em `case_plans`/`onboarding_planos` (checklist), não em `product_catalog`. |
| CA-DIAG-003, CA-DOC-005, CA-PROT-002, CA-PROT-004, CA-MEM-006 | **Criados** (ver migration) | Conceitos comerciais plausíveis, sem SKU real nem artefato interno equivalente. |
| CA-MEM-004 (Mapa Ancestral Ilustrado) | **Não criado — colisão de código** | Ver seção própria abaixo. |
| CA-PESQ-003, CA-DOC-004, CA-POS-001, CA-POS-004 | **Não criados — agregadores/ambíguos** | Ver seção própria abaixo. |

## Colisão descoberta na hora de criar: `CA-MEM-004` já existe

A tentativa de inserir `CA-MEM-004` "Mapa Ancestral Ilustrado" foi
recusada pelo próprio banco (`unique (organization_id, code)`) — o código
já pertence a um produto real diferente, `CA-MEM-004` = "Livro da
Historia Familiar" (já documentado como alias de `CA-MEM-002` da seção 8
no P8). Esta é a **5ª colisão de código** encontrada nesta investigação
(as outras 4 eram `CA-ASS-001/003/004/005`) — mesma regra aplicada: o
código real não é tocado; "Mapa Ancestral Ilustrado" fica sem código
próprio, registrado aqui como pendência de nomeação (precisaria de um
código livre, ex. `CA-MEM-0XX`, se e quando a Proprietária quiser criá-lo
como produto real).

## Os 4 códigos tratados como agregador/ambíguo, não como SKU novo

Seguindo a sugestão da Proprietária ("poderia ser agregador"):

- **CA-POS-001** "Regularização Pós-Reconhecimento": é a família inteira
  já coberta por 4 SKUs reais (`CA-CID-006`/`009`/`016`/`018`) — um
  agregador conceitual sobre eles, não um 5º produto com preço próprio.
  `product_catalog.produto_pai_id` (FK auto-referenciada, hoje sem uso em
  nenhuma linha) poderia modelar essa hierarquia formalmente no futuro,
  se a Proprietária quiser — não fiz isso agora (mudaria 4 linhas reais
  sem pedido explícito).
- **CA-POS-004** "Continuidade Cidadão": sobreposição parcial com a linha
  `CA-ASS-*` (continuidade/assinatura) — mesmo espírito de agregador,
  não um SKU isolado.
- **CA-PESQ-003** "Pesquisa Documental Direcionada" e **CA-DOC-004**
  "Retificação Documental Assistida": mais próximos de variações/
  encomendas dentro do escopo de SKUs reais existentes
  (`CA-HIST-002`/`CA-CID-020`) do que de produtos autônomos — ficam como
  nota de conteúdo próximo (já registrada no P8), sem produto novo.

## Migration

`supabase/migrations/20260925150000_product_catalog_5_novos_produtos_secao_8.sql`:
insere os 5 produtos aprovados, todos `status_homologacao='em_revisao'`,
`elegivel_para_proposta=false` (nunca entram em proposta sem homologação
humana real), sem preço. Idempotente (`not exists` por código). Também
re-registra, de forma idempotente, a correção pontual de
`case_plans.produto_pai_id` da Ana Luiza (P8) — aplicada diretamente no
banco naquela rodada, mas nunca capturada em migration até agora.

## Não feito sem aprovação adicional

- `CA-MEM-004`/"Mapa Ancestral Ilustrado" sem código próprio atribuído.
- `CA-POS-001`/`004`, `CA-PESQ-003`, `CA-DOC-004`: nenhum produto novo,
  nenhuma hierarquia via `produto_pai_id` nas 4 linhas reais pós-cidadania.
- `CA-DIAG-004` (AncestralScan) e `CA-DOC-001` (checklist): nenhuma
  feature nova construída — ficam fora do catálogo comercial por
  natureza, não por lacuna a fechar.

## Prova Lovable pós-push

Abrir `/catalogo` → conferir que os 5 novos produtos aparecem (código,
nome, `em_revisao`, não elegível para proposta) e que nenhum SKU real
existente mudou de nome, preço ou status.
