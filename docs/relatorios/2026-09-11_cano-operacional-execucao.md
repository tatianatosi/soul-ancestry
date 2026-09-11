# Cano operacional — execução (2026-09-11)

Diagrama confirmado pela proprietária:

`LEGADO → LISTA-ALIMENTO → CATÁLOGO PLANEJADOR → CASO 360 → DESK libera → APP → WhatsApp`

Sem tabela nova. Sem envio automático de WhatsApp. Vocabulário só do CHECK existente.

## O que foi ligado

| Elo | Fonte | Escritor / consumidor | Estado nesta fatia |
|---|---|---|---|
| Legado | Planilha Mestre isolada | só migração → feed | ok (isolado) |
| Lista-alimento | `planner_catalog_feed` | Catálogo Desk | leitura + de-para F1…F7 |
| Catálogo / produto-pai | `product_catalog` + feed | `AbaProdutoTrilha` | já existia |
| Caso 360 | `case_services` + `case_plans` | `salvarCaseService` → `amarrarServicoAoPlanejador` | **novo elo** |
| Desk libera | `client_deliverables` → `app_projections` | `projetarMicroentregaParaApp` com `source_entity_type: milestone` | **corrigido** (CHECK) |
| App | `app_projections` / RLS | portal + `/app-cliente-como-pessoa` | consumidor |
| WhatsApp | `case_alerts` + Biblioteca de Mensagens | cópia manual | CTA no card |

## Correção crítica

`projetarMicroentregaParaApp` gravava `source_entity_type: "client_deliverable"`, valor **fora** de `app_proj_source_ck` (`evidence|finding|lineage|event|milestone|case`). A ponte nunca persistia. Agora usa `milestone` (marco liberável), dedup alinhado.

## UI

Card **Cano operacional** no Caso 360 (seção Jornada), acima do planejador: estado dos 7 elos + próximo passo + CTAs (Catálogo, Biblioteca, App master, Mensagens).

## Testes

- `src/lib/__tests__/cano-operacional.test.ts` (novo)
- `src/lib/__tests__/ca08-cadeia-entrega-app.test.ts` (atualizado para `milestone`)

## Critério de aceite (operável)

1. Salvar produto/trilha no Caso → `case_plans` recebe `product_catalog_id` / `case_service_id` / fase (stub `rascunho` se não houver plano).
2. Micro-entrega `publicado` → Projetar ao App cria rascunho em `app_projections` com `milestone`.
3. Card do cano reflete serviço/plano/projeções/alertas após reload.
4. WhatsApp continua só cópia humana.

## Prints da jornada com produto (2026-09-11)

Pasta: `docs/relatorios/provas/2026-09-11-cano-jornada-produto/`

Caso fixture Ana + produto **CA-HIST-005** (Pesquisa de Base Familiar). Preview da branch do cano. Card mostra elos ok até Caso 360; Desk libera parcial; App ausente (nada publicado). Evidência de agente autenticado — **não** `COMPROVADO_EM_USO`.

## Fora desta fatia (dívida declarada)

- Botão em `/achados` (aguardando decisão 1–4 da proprietária).
- Envio WhatsApp automático (proibido).
- Unificação Pessoa 360 / CA-008 exit report.
- Timeline dupla no portal.
- Merge/deploy produção (exige OK explícito).
