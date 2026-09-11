# Sincronização Mestre — 2026-09-11

**Status:** registro vivo de decisões × implementação.  
**Precedência:** decisão explícita da proprietária → planejador → schema/código aprovados → mockup 17 → políticas.  
**Antecessor:** [`SINCRONIZACAO_MESTRE_2026-08-19.md`](./SINCRONIZACAO_MESTRE_2026-08-19.md) (commits 17–19/08; trilha histórica).

## Objetivo

Consolidar o que está **implementado**, **decidido sem fiação completa**, ou **histórico/superado** — sem presumir que Planilha Mestre, “57 SKUs”, reconciliação Asaas legada ou menu de 8 grupos dirijam App, Desk, contrato ou cobrança.

Companheiros:

| Artefato | Bloco |
|---|---|
| [`DECISOES_IMPLEMENTADAS_E_A_REVISAR.md`](./DECISOES_IMPLEMENTADAS_E_A_REVISAR.md) | `00_governanca/` |
| [`DECISAO-NAV-DESK-7-TELAS-6-GRUPOS-INTERNOS-2026-09-11.md`](./DECISAO-NAV-DESK-7-TELAS-6-GRUPOS-INTERNOS-2026-09-11.md) | `00_governanca/` |
| [`../05_operacao/MAPA_DE_PARA_BLOCOS_GITHUB.md`](../05_operacao/MAPA_DE_PARA_BLOCOS_GITHUB.md) | `05_operacao/` |
| [`../07_contratos_e_comercial/ARQUITETURA_SKU_CICLO_DE_VIDA_E_MICROENTREGAS.md`](../07_contratos_e_comercial/ARQUITETURA_SKU_CICLO_DE_VIDA_E_MICROENTREGAS.md) | `07_contratos_e_comercial/` |
| [`../08_dados_e_integracoes/MATRIZ_IMPLEMENTACAO_SKU_PRECO_ASAAS_APP_DESK.md`](../08_dados_e_integracoes/MATRIZ_IMPLEMENTACAO_SKU_PRECO_ASAAS_APP_DESK.md) | `08_dados_e_integracoes/` |

## Vocabulário de estado

| Estado | Significado |
|---|---|
| `implementado` | Schema e/ou código e/ou rota com escritor/leitor identificável. |
| `decidido` | Regra/decisão da proprietária ainda sem fiação completa (fonte + escritor + persistência + consumidor + CTA + reload). |
| `revisar` | Divergência código×docs, drift de fonte, decisão em revisão, ou prova autenticada ausente. |
| `historica_superada` | Auditoria, planilha, proposta antiga ou tela legado; **não** alimenta operação diária, App, Desk face, Asaas vivo ou contrato novo. |

---

## 1. Decisão âncora — navegação Desk (em revisão)

**Fonte:** decisão da proprietária 2026-09-11 — ver `DECISAO-NAV-DESK-7-TELAS-6-GRUPOS-INTERNOS-2026-09-11.md`.

**Recomendação (não implementar como 3ª barra concorrente):**

```text
FACE PRINCIPAL (sempre visível) = 7 telas do mockup
Visão Geral · Casos 360 · Checklist · Validação Jurídica · Radar Interno · Alertas · Biblioteca Mestre

CAMADA OPERACIONAL INTERNA (recolhida) = 6 grupos
Hoje · Comercial · Casos & Pessoas · Pesquisa · Formalização · Governança
```

| Item | Estado | Nota |
|---|---|---|
| 7 telas como face principal | `decidido` / `revisar` (status: em revisão; código ainda usa 6 grupos como face) | Mockup 17 = contrato visual |
| 6 grupos só internos/recolhidos | `decidido` | Não competir com a face |
| 8 grupos como menu principal | `historica_superada` | Causa de menu pesado e fragmentação |
| Código atual `GRUPOS_DESK` (6 como face) | `revisar` | Dívida até a face 7+6 ser aplicada numa PR de produto ativa — **sem** nova arquitetura paralela |
| Memória permanente citando 8 grupos | `revisar` | Nenhuma leitura se arquiva até certificação; proprietária agora recomenda 7+6 |

**Limite desta sync:** documentar a decisão. Não apagar rotas/módulos. Não criar nona aba. Mudança de menu só na PR de produto ativa, após preview e “pode mesclar”.

---

## 2. Decisão âncora — catálogo SKU / PR #97

**Opção B:** Planilha Mestre, SKU legado e conciliação **saem do menu** → arquivo GitHub. Rotas/tabelas não apagadas.

| Item | Estado | Evidência |
|---|---|---|
| 5 superfícies legado fora da face | `decidido` (PR #97) / `revisar` no `main` (submenu ainda visível) | PR #97; `archive/github/2026-09-10-legado-catalogo-desk/` |
| Planilha Mestre como fonte de preço/SKU | `historica_superada` | AGENTS, adendo Enterprise, `preco-canonico.ts` |
| Corpus “57 SKUs” / Top Pareto estático | `historica_superada` | Números divergem (63/85/91/35) |
| `/catalogo` + `product_catalog` | `implementado` (dado); face admin sob Biblioteca/Governança na nav 7+6 | Não é Planilha |
| Drift `precos-sku.ts` | `revisar` | Ainda declara Planilha como fonte oficial |

---

## 3. Decisão âncora — Asaas / link de pagamento

**Regra da proprietária (2026-09-11):** link Asaas **só** quando as automações estiverem ativadas **com tudo funcionando**.

| Item | Estado | Evidência |
|---|---|---|
| Integração Asaas API / checkout / webhook | `decidido` (futuro) — **bloqueado** até automações OK | `prontidao-integracoes.ts` → `financeiro_asaas` = `NAO_CONFIGURADA` |
| Colunas `link_asaas_*` / snapshot de URLs | `implementado` (campos) / uso operacional = `historica_superada` até ativação | Sem emitir link vivo |
| Reconciliação Asaas antiga (planilha/DRE) | `historica_superada` | AGENTS.md |
| App inventar preço/SKU/link | **proibido** | App lê `eventos_financeiros` / estado homologado |

---

## 4. Microentregas = intrínsecas à jornada / onboarding

Não são produto de menu nem SKU. São o mecanismo que alimenta o **alerta do dia** na Visão Geral / Alertas:

- “Hoje mandar um achado para Alice”
- “Hoje atualização no grupo da família (WhatsApp)”
- “Hoje atualização no App”

| Item | Estado | Evidência |
|---|---|---|
| Tabelas `ops_microentregas` / `microentregas` | `implementado` parcial | Writers em ops/jornada/onboarding |
| Ligação alerta Hoje ← microentrega/cadência | `decidido` / `revisar` (fiação completa) | Painel Hoje + `alertas-derivados` |
| Nome inventado `micro_deliveries` | **proibido** | `motores-tabelas.ts`, AGENTS |

---

## 5. Sincronização por domínio

| ID | Domínio | Estado | Evidência | Ação |
|---|---|---|---|---|
| SYNC-NAV-7-6 | Face Desk 7 + 6 internos | `decidido` / `revisar` | Decisão 2026-09-11 | Aplicar só em PR de produto ativa; preview antes de publicar |
| SYNC-DESK-6-FACE | 6 grupos como face atual | `revisar` | `navegacao-desk.ts` | Substituir face; manter 6 como metadado interno |
| SYNC-8-GRUPOS | 8 grupos menu principal | `historica_superada` | Memória/PRs antigas | Não restaurar como face |
| SYNC-APP-7 | App Cliente 7 abas | `implementado` parcial | `portal-shell.tsx` | Tirar Entregas/Fase01/02 da barra |
| SYNC-PLAN | Planejador fonte viva | `implementado` | `case_plans` | Precedência |
| SYNC-CASO | Caso + próxima ação | `implementado` | `proxima_acao_prioritaria` | — |
| SYNC-MICRO | Microentregas na jornada | `implementado` parcial | `ops_microentregas` | Alertas do dia; WhatsApp/App |
| SYNC-SKU-LEG | SKU/Planilha/conciliação face | `historica_superada` | PR #97 | Arquivo GitHub |
| SYNC-PRECO | Preço canônico | `implementado` + drift `revisar` | `preco-canonico` vs `precos-sku` | Uma fonte |
| SYNC-ASAAS | Link/checkout Asaas | `decidido` bloqueado | prontidão `NAO_CONFIGURADA` | Só com automações OK |
| SYNC-OFERTA | Cadeia oferta contextual App | `decidido` incompleta | matriz `08_…` | Sem inventar preço |
| SYNC-PROVA | Prova autenticada | `revisar` | registro vivo | Sem `COMPROVADO_EM_USO` não arquivar resgate |

## Regra de reconciliação

1. Decisão explícita mais recente da proprietária vence (nav 7+6; SKU legado; Asaas só com automações).
2. Planilha Mestre, DRE, Asaas legado e 8 grupos como face = `historica_superada`.
3. Não criar arquitetura/tabela/PR paralela só para nav — ajustar a PR de produto ativa.
4. Documentação cita commit, PR, migration, rota ou teste.
5. Merge/deploy só com autorização explícita (branch + SHA + se dispara produção).
