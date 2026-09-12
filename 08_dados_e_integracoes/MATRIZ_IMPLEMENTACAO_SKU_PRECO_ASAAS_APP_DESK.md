# Matriz de Implementação — SKU, Preço, Asaas, App e Desk

**Status:** matriz de governança; **não** é tabela de preços nem autorização de cobrança.  
**Sync:** [`../00_governanca/SINCRONIZACAO_MESTRE_2026-09-11.md`](../00_governanca/SINCRONIZACAO_MESTRE_2026-09-11.md)  
**Arquitetura:** [`../07_contratos_e_comercial/ARQUITETURA_SKU_CICLO_DE_VIDA_E_MICROENTREGAS.md`](../07_contratos_e_comercial/ARQUITETURA_SKU_CICLO_DE_VIDA_E_MICROENTREGAS.md)

Estados: `implementado` | `decidido` | `revisar` | `historica_superada`.

---

## Separação de responsabilidades

| Elemento | Fonte canônica esperada | App | Automação | Estado | Controles |
|---|---|---|---|---|---|
| SKU canônico | `product_catalog` homologado | Não como código técnico | Só após aprovação | `implementado` (dado); face legado `historica_superada` (PR #97) | Status, histórico |
| Nome comercial | Catálogo/proposta | Sim, contextual | Se reconciliado | `implementado` parcial | Versão ↔ SKU |
| Escopo | Contrato/proposta | Linguagem de jornada | Não sem validação humana | `implementado` parcial | Inclusões/exclusões |
| Preço | Catálogo homologado / exceção comercial | Só vigente contextual | Só reconciliado | `implementado` + drift `revisar` (`precos-sku`) | Moeda, validade |
| **Link Asaas** | Registro financeiro + **automações ativas e OK** | Não como dado técnico solto | **Bloqueado** até gate | `decidido` bloqueado | Sem link se automação não pronta |
| Planilha Mestre / Top 30 face | — | Não | Não | `historica_superada` | Só archive/GitHub |
| Proposta | Fonte comercial versionada | Resumo | Pré-carga controlada | `implementado` | Status/arquivo |
| Microentrega | Jornada/onboarding (`ops_microentregas`) | Entrega/alerta | Cadência | `implementado` parcial | Alerta Hoje / WA / App |
| Desk | Operação + próxima ação | Não diretamente | Orquestra ações aprovadas | `implementado` | Perfil, logs |

---

## Quatro blocos da varredura SKU

### 1. Catálogo

| Verificação | Achado | Estado |
|---|---|---|
| “57 SKUs” | Número histórico divergente (63/85/91/35) | `historica_superada` |
| Top Pareto / Catálogo operacional 30 | Sai da face (PR #97) | `historica_superada` (face) |
| Ativos/arquivados em `product_catalog` | Tabela + `/catalogo` | `implementado` |
| Produto comercial vs operacional | Produtos-pai no planejador | `implementado` parcial |
| Homologação SKUs / conciliação / divergências | Rotas existem; menu → archive | `historica_superada` face; rotas preservadas |

### 2. Ciclo de vida

| Fase | Estado |
|---|---|
| Descoberta → estratégia (proposta) → execução → pós-reconhecimento → legado | Ver arquitetura `07_…`; misto `implementado`/`decidido` |
| Legado de produto (SKU face) ≠ legado de cliente (App Legado) | Distinção obrigatória |

### 3. Oferta contextual

| Elo | Estado |
|---|---|
| Microentrega → SKU → regra exibição → CTA → canal | `decidido`; fiação incompleta |
| `tipo_oferta` (`produto_pai` \| `complemento` \| `contextual`) | `implementado` no Desk |
| App consulta só catálogo/condição homologada | `decidido`; App hoje lê `eventos_financeiros` na proposta — não inventa |

### 4. Financeiro / Asaas

| Elo | Estado |
|---|---|
| Preço homologado | `implementado` + `revisar` drift |
| Link Asaas | **`decidido` bloqueado** — só com automações funcionando |
| Modalidade / condição | `implementado` parcial (`commercial_conditions`, proposals) |
| Reconciliação Asaas antiga | `historica_superada` |
| Webhook / API Asaas | Ausente (`NAO_CONFIGURADA`) — `decidido` futuro |
| Pagamento + auditoria | `implementado` parcial (`payments`, `eventos_financeiros`, `audit_logs`) |

---

## Gate Asaas (obrigatório)

Antes de qualquer link/checkout/webhook:

1. Condição comercial aprovada (valor, moeda, destinatário).
2. Automações financeiras **ativadas** e validadas end-to-end.
3. Idempotência por condição/parcela.
4. Confirmação explícita da proprietária para ambiente (sandbox → produção).

Enquanto o gate falhar: **não** expor link Asaas no App; **não** tratar colunas `link_asaas_*` como autorização de cobrança.

---

## Fluxo de reconciliação (quando permitido)

1. Identificar SKU canônico ou registrar ausência.
2. Vincular nome, escopo e ciclo sem misturar campos.
3. Validar proposta vigente.
4. Confirmar preço na fonte canônica; divergência bloqueia.
5. **Só então** (com gate Asaas) emitir/exibir link.
6. Pré-carga no caso só com campos definidos + origem/versão.
7. App: entrega + próximo passo; Desk: conversão + próxima ação.
8. Log: data, origem, responsável, evidência.

---

## Bloqueadores absolutos

- Divergência preço / SKU / proposta / link / escopo.
- Proposta arquivada ou sem aprovação.
- Dado familiar sem finalidade/consentimento/auditoria.
- SKU proposto tratado como catálogo oficial.
- App como fonte financeira/jurídica.
- **Link Asaas sem automações ativas e OK.**
- Planilha Mestre ou reconciliação antiga como operação.

---

## Implementações que pedem fechamento documental

| Tema | Estado | Risco | Ação |
|---|---|---|---|
| Pré-carga proposta | `implementado` / doc `revisar` | Sobrescrever caso | Precedência, idempotência |
| Estrutura familiar | `implementado` / doc `revisar` | Acesso indevido | RLS + ciclo |
| País/canônico | `implementado` / `revisar` | Produto×país | Dicionário |
| Despesas | `implementado` / doc `revisar` | Cobrança indevida | Modelo + trilha |
| Motor contratual P0 | `implementado` / doc `revisar` | Documento incompleto | Regressão |
| `precos-sku.ts` drift | `revisar` | Fonte errada | Alinhar a `preco-canonico` |
| PR #97 legado fora do menu | `decidido` | Face confusa no `main` | Seguir PR; merge só com ordem |
