# Arquitetura de SKU, Ciclo de Vida e Microentregas

**Status:** frente própria de varredura — reconciliar com código vigente e decisões 2026-09-11.  
**Sync:** [`../00_governanca/SINCRONIZACAO_MESTRE_2026-09-11.md`](../00_governanca/SINCRONIZACAO_MESTRE_2026-09-11.md)  
**Matriz:** [`../08_dados_e_integracoes/MATRIZ_IMPLEMENTACAO_SKU_PRECO_ASAAS_APP_DESK.md`](../08_dados_e_integracoes/MATRIZ_IMPLEMENTACAO_SKU_PRECO_ASAAS_APP_DESK.md)

Estados: `implementado` | `decidido` | `revisar` | `historica_superada`.

## Princípios

1. SKU é identificador interno; o cliente vê etapa, entrega, pendência e próximo passo.
2. **Catálogo SKU / Planilha / Top 30 / conciliação de face = legado** (PR #97). Não dirigem o dia.
3. Preço/condição só de fonte homologada (`product_catalog` / exceção comercial) — nunca Planilha Mestre em runtime.
4. **Link Asaas só quando automações estiverem ativas e tudo funcionando** (ordem proprietária).
5. **Microentregas são intrínsecas à jornada/onboarding** — alimentam o alerta do dia (achado, WhatsApp, App), não são menu nem SKU.
6. App nunca inventa preço, SKU ou link.

## Cadeia planejada (classificada)

```text
Etapa da jornada
→ Microentrega (jornada/onboarding)
→ SKU elegível (catálogo homologado — não Planilha)
→ Preço/condição homologados
→ Oferta contextual no App
→ Checkout/link Asaas          ← BLOQUEADO até automações OK
→ Pagamento confirmado
→ Desk registra conversão e próxima ação
```

| Hop | Estado | Nota |
|---|---|---|
| Etapa jornada (`case_plans.fase_jornada`) | `implementado` | CHECK canônico nas migrations |
| Microentrega ops | `implementado` parcial | `ops_microentregas`; legado `microentregas`→`casos` |
| Alerta do dia ← microentrega | `decidido` / `revisar` | Ex.: achado Alice; WA família; App |
| SKU elegível | `implementado` parcial + face legado `historica_superada` | `product_catalog`; telas homologação/Top30 fora (PR #97) |
| Preço homologado | `implementado` + drift `revisar` | `preco-canonico` vs `precos-sku` |
| Oferta contextual App | `decidido` / incompleto | `tipo_oferta` no Desk; App não lê catálogo para preço |
| Link/checkout Asaas | `decidido` **bloqueado** | Sem automações = sem link |
| Pagamento → Desk próxima ação | `implementado` parcial | `eventos_financeiros`, proposals/invoices; webhook Asaas ausente |

## Ciclo de vida (caso/oferta)

| Estado | Definição | Estado impl. | Cliente vê | Backoffice |
|---|---|---|---|---|
| Descoberta | Interesse e dados mínimos | `implementado` parcial | Próxima interação | Origem, consentimento |
| Diagnóstico | Leitura sob limites | `implementado` parcial | Síntese, checklist | Hipóteses (não fato) |
| Proposta | Escopo apresentado | `implementado` | Próxima ação | Versão, validade |
| Contrato | Instrumento | `implementado` parcial | Ação documental | Cláusulas, exceções |
| Pagamento | Condição em confirmação | `decidido` bloqueado p/ Asaas auto | Orientação sem link vivo indevido | Valor aprovado; **sem** link Asaas até gate |
| Onboarding | Caso/grupo organizados + **microentregas** | `implementado` parcial | Checklist, próximos passos | Ficha, acesso, cadência |
| Execução | Escopo em andamento | `implementado` parcial | Entrega/pendência | Tarefas, evidências |
| Pós-reconhecimento / legado | Continuidade | `decidido` | Benefício contextual | Escopo aprovado |

## Microentregas por etapa (mínimo)

| Etapa | Microentrega | Limite | Estado |
|---|---|---|---|
| Descoberta | Recebimento + próximo passo | Sem elegibilidade | `decidido` |
| Diagnóstico | Síntese + lacunas | Sem prometer rota/prazo | `decidido` |
| Proposta | Escopo contextual | Sem preço/link não reconciliado | `implementado` parcial |
| Onboarding | Caso, membros, checklist + **cadência de alertas** | Sem dado excessivo | `implementado` parcial |
| Execução | Marco + evidência + alerta “hoje mandar X” | Sem prometer emissão | `revisar` fiação alerta |
| Continuidade | Benefício liberado / update App ou WA | Sem upsell automático | `decidido` |

## Regras de SKU

| Regra | Estado |
|---|---|
| Código, nome comercial, escopo, preço, link e microentregas = campos distintos | `decidido` |
| Pré-carga por proposta não cria/aprova SKU | `implementado` / doc `revisar` |
| `-OLD`, arquivados, duplicidades rastreáveis, não reexpostos na face | `historica_superada` na face (PR #97) |
| “57 SKUs” / Pareto estático não é corpus operacional | `historica_superada` |
| Não criar tabela `micro_deliveries` | `implementado` (proibição em código) |

## Relação com nav Desk 7+6

Catálogo, SKUs e legado moram sob **Biblioteca Mestre → Governança** (submenu), nunca na primeira dobra. Microentregas aparecem em **Visão Geral / Alertas** via jornada — não como aba.
