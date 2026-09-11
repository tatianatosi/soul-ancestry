# Adendo — CRM Journey × Painel de Calls / CRM vivo (2026-09-11)

- Status: vigente
- Fonte arquivada: [`docs/evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md`](../evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md) (v1.0, 18/08/2026)
- Norma que **prevalece** em conflito: `MEMORIA-PERMANENTE…`, `AGENTS.md`, `.cursor/rules/clube-ancestral-core.mdc`, planejador ativo, schema real
- Irmão: [`ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`](./ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md), [`ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md`](./ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md)
- Gap: [`docs/relatorios/2026-09-11_gap-crm-journey-vs-app.md`](../relatorios/2026-09-11_gap-crm-journey-vs-app.md)
- Código: `SEQUENCIA_COMERCIAL_CRM_VIVO` em `src/lib/crm-journey-fases.ts`

## Cadeia comercial canônica (ordem obrigatória)

```
Lead
→ Call / Discovery
→ oportunidade
→ proposta
→ confirmação
→ handoff
→ pessoa e caso canônicos
→ Planejador Universal
```

| Passo | O quê | Rota Desk | Persistência |
|---|---|---|---|
| 1 | **Lead** | `/leads` | `leads` |
| 2 | **Call / Discovery** | `/calls` | mesmas colunas em `leads` (conceito `crm_calls` → `leads`) |
| 3 | **Oportunidade** | `/conversao` | etapa comercial do lead |
| 4 | **Proposta** | `/propostas` | `proposals` (ideal: call de apresentação antes/durante) |
| 5 | **Confirmação** | `/propostas` | aceite — **ainda sem** handoff |
| 6 | **Handoff** | `/calls` (ação) | **depois** da confirmação |
| 7 | **Pessoa e caso canônicos** | `/casos` | `clientes` + `crm_casos` |
| 8 | **Planejador Universal** | caso (`PlanejadorOperacional`) | plano do **caso** = fonte do que vem a seguir |

Calls ⊂ CRM vivo. Lead ⊂ CRM vivo. **Handoff não antecede proposta/confirmação.**

## Papéis

| Camada | Papel |
|---|---|
| Lead + Calls + oportunidade/proposta/confirmação | CRM vivo comercial |
| Handoff → pessoa/caso | Materialização canônica (`executarHandoffDiscovery` **já grava**) |
| Planejador Universal | Única fonte válida do planejamento operacional do caso |
| Pós-ativação (pesquisa, docs, legado) | Continuidade do ciclo — depois do Planejador |

## De-para (não inventar tabela)

Proibido criar `crm_calls`, `crm_interactions`, `opportunities`, `whatsapp_automations` nesta etapa.

| Conceito | Onde está |
|---|---|
| Lead | `/leads` → `leads` |
| Call / Discovery | `/calls` → `leads` |
| Oportunidade | eixo comercial / `/conversao` |
| Proposta + confirmação | `/propostas` → `proposals` |
| Handoff | `executarHandoffDiscovery` → `clientes` + `crm_casos` |
| Planejador Universal | UI no caso; `case_plans` / escritor do planejador |

## ESTÁVEL · PILOTO · BLOQUEADO

| Estado | Itens |
|---|---|
| **ESTÁVEL** | Cadeia acima; Lead antes da call; `/calls` sobre `leads`; handoff grava pessoa+caso |
| **PILOTO** | Ritual explícito call de proposta; CTA e hub `/crm-journey` com a sequência |
| **BLOQUEADO** | Tabela `crm_calls`; WhatsApp automático; Asaas master; SEO→Vercel |

## Regras

1. Respeitar a ordem: Lead → Discovery → oportunidade → proposta → confirmação → handoff → pessoa/caso → Planejador.
2. Handoff **depois** da confirmação; **não** cria proposta.
3. Planejador Universal comanda o caso — não o lead.
4. Pendência informa a proprietária, não impede (`politica-autoridade-operacional`).
5. Site SEO ≠ app Vercel.
