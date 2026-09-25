# P13 — Revisão do "Planejador Universal Multipaís/Produtos-Pai/Preços Resgatados" contra o schema real (2026-09-25)

```yaml
status: executado — só 1 gap real encontrado e fechado; resto já estava executado
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Revise todo o conteúdo e que esteja dentro do planejador pai casos 360
  verifique e execute" (documento colado: "PROJETO: Clube Ancestral — Planejador Universal
  Multipaís, Produtos-Pai, Jornada, Catálogo-Alimento e Preços Resgatados")
fontes:
  - Documento colado pela Proprietária (prompt canônico, variante já vista nesta base)
  - docs/evolucao/recuperados/fontes-primarias/01_CATALOGO_E_SKUS/DICIONARIO_DE_SKUS.csv
  - schema real do Supabase (projeto 1a628b61-ec68-454f-85e1-671d6f297370), consultado ao
    vivo em 25/09/2026
```

## Método

O documento colado é uma variante do "Prompt Canônico — Planejador Universal Multipaís,
Catálogo-Alimento e Preços Resgatados" já executado nesta base em 04/09/2026 (ver
`docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md`) e reconciliado
em 09/09/2026 (`docs/arquitetura/2026-09-09_DE-PARA-PLANEJADOR-MARCOS-JURIDICOS-CRM-VIVO-vs-PRECOS-RESGATADOS.md`).
Em vez de reexecutar o documento literalmente — o que duplicaria estrutura já real, exatamente
o erro já cometido e corrigido várias vezes nesta sessão —, verifiquei item por item contra o
banco ao vivo antes de decidir o que fazer.

## O que já estava 100% executado (confirmado por leitura direta do banco, não do documento)

- **9 produtos-pai canônicos**: já existem como valores internos de orquestração
  (`PRODUTOS_PAI_CANONICOS`, `case_plans.produto_pai_id`) — nenhuma família/SKU/categoria
  nova criada por eles.
- **`price_catalog_rescued`**: já existe com exatamente o schema proposto pelo documento
  (`item_id`, `country_code`, `phase`, `price_component`, `amount`, `price_status` etc.) e o
  mesmo CHECK de 6 estados (`REFERENCIA_RESGATADA`, `CONDICAO_PARTICULAR_DE_CASO`,
  `HOMOLOGADO_CATALOGO`, `PENDENTE_DE_HOMOLOGACAO`, `DIVERGENTE`, `ARQUIVADO`). Todos os
  valores item-a-item citados no documento (CA-CID-001=R$247, CA-CID-002A/B/D, CA-CID-003,
  CA-CID-006, CA-CID-016/018/019, CA-CID-DE-001/002/003b, CA-CID-AT-001, CA-ASS-001/002/003,
  CA-WPP-001/002, CA-FAM-001/002) já estão gravados com os mesmos valores. As divergências
  descritas (Itália 3 valores conflitantes, Portugal 3 valores conflitantes) já estão
  marcadas `DIVERGENTE`; a condição particular de R$9.600 da Ana Luiza (Áustria) já está
  `CONDICAO_PARTICULAR_DE_CASO`, sem sobrescrever a referência de R$4.800; Luxemburgo/
  Hungria/Irlanda já têm estrutura `PENDENTE_DE_HOMOLOGACAO` sem valor estimado.
- **30 itens `ESPECIFICACAO_PENDENTE`** em `planner_catalog_feed` para os 10 países/processos
  pedidos (Croácia, Portugal, Espanha, Polônia, Romênia, Luxemburgo, Hungria, Irlanda ×3 cada,
  + Áustria-002/003, + naturalização BR/FR ×2 cada) — todos já existem, sem preço, sem link.
- **6 itens `CA-GEN-MULTI-001..006`** (base compartilhada, diagnóstico comparativo, ramo
  adicional, pesquisa de segundo país, dossiê multipaís, acompanhamento paralelo) — já
  existem, `ESPECIFICACAO_PENDENTE`.
- **`CA-CURSO-001`** já está `ARQUIVADO_DECISAO_PROPRIETARIA` — não aparece em catálogo ativo.
- **"Europa geral" (PACOTE-EU-01)** já está corretamente modelado em `price_catalog_rescued`
  com `item_id = null` e nota própria "não é produto de processo final — usar só como
  referência legada de triagem" — exatamente a cautela que o documento pede, já em vigor.

## O único gap real encontrado

`planner_catalog_feed.legacy_aliases` (coluna `text[]`, existe desde a criação da tabela)
estava **vazia em 100% das linhas** — a regra "preservar identificadores antigos como alias
legado; não criar novos identificadores com esse padrão" nunca tinha sido cumprida para os
8 códigos legados citados no documento (`PACOTE-CROACIA-01`, `PACOTE-PT-01`, `PACOTE-ES-01`,
`PACOTE-DE-01`, `PACOTE-PL-01`, `PACOTE-RO-01`, `PACOTE-FR-01`, `NAT-BR-01`).

Mapeamento usado — **não inventado por analogia**, extraído literalmente de
`DICIONARIO_DE_SKUS.csv` (linha 14, regra de migração explícita: *"Se aprovados: renomear
para CA-CID-[SIGLA_PAIS]-NNN (ex.: CA-CID-HR-001)"* — o próprio dicionário já usa
`PACOTE-CROACIA-01 → CA-CID-HR-001` como exemplo literal; linha 15, mesma lógica para
`NAT-BR-01 → CA-NAT-BR-001`; `PACOTE-FR-01` segue o mesmo prefixo `CA-NAT` já adotado para
naturalização):

| Alias legado | Item vigente (`planner_catalog_feed.item_id`) |
|---|---|
| `PACOTE-CROACIA-01` | `CA-CID-HR-001` |
| `PACOTE-PT-01` | `CA-CID-PT-001` |
| `PACOTE-ES-01` | `CA-CID-ES-001` |
| `PACOTE-DE-01` | `CA-CID-DE-001` |
| `PACOTE-PL-01` | `CA-CID-PL-001` |
| `PACOTE-RO-01` | `CA-CID-RO-001` |
| `PACOTE-FR-01` | `CA-NAT-FR-001` |
| `NAT-BR-01` | `CA-NAT-BR-001` |

`PACOTE-EU-01` **não** recebeu alias de item (já corretamente sem `item_id`, por desenho —
ver acima). `PACOTE-AT-*` nunca existiu — Áustria já nasceu com `CA-CID-AT-001` real, sem
origem em `PACOTE-*`.

Migration: `supabase/migrations/20260925200000_planner_catalog_feed_legacy_aliases_pacotes.sql`
(idempotente, `UPDATE` puro sobre um array já existente — nenhuma tabela nova, nenhum SKU
renomeado ou apagado).

## Não fazer sem decisão adicional (reafirma decisões já tomadas nesta sessão)

- **`legacy_catalog_import`, `family_case`, `family_branch`, `research_base`,
  `nationality_track`, `incremental_scope`, `case_commercial_condition`, `microdelivery`
  como tabelas novas** — não criadas. Os equivalentes reais já existem sob outros nomes
  (`case_plans`+`crm_casos`, `citizenship_tracks`, `commercial_conditions`+`case_services`,
  `client_deliverables`), exceto `research_base`/`family_branch`/`incremental_scope`
  (múltiplos ramos por caso), que já está registrado como **gap real, mas de decisão
  arquitetural maior** desde o de-para de 09/09/2026 — não fabricado aqui sem aprovação
  explícita de escopo, mesma linha do P9/P11.
- Nenhum SKU, família, categoria, preço ou link ativo foi alterado.

## Verificação

`tsc --noEmit` (limpo, só o erro pré-existente de `portal/index.tsx`), teste novo
(`p13-legacy-aliases-pacotes-2026-09-25.test.ts`: mapeamento exato dos 8 aliases, Europa/
Áustria fora do escopo, escrita idempotente, nenhuma taxonomia nova criada), suíte completa
(baseline idêntica), `vite build` limpo. Migration aplicada ao banco real e registrada em
`schema_migrations`.

## Prova Lovable pós-push

Não há tela nova para conferir visualmente — `legacy_aliases` é metadado de rastreabilidade
consumido por `construirMapaProdutoPaiPorCodigo`/`produtoPaiDoCodigo`
(`src/lib/planejador-produtos-pai.ts`), já em produção. Conferência possível apenas por
consulta direta à tabela (`select item_id, legacy_aliases from planner_catalog_feed where
legacy_aliases <> '{}'`).
