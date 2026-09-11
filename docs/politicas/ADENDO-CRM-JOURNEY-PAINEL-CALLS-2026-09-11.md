# Adendo — CRM Journey ↔ Painel de Calls (2026-09-11)

**Status:** vigente para memória e operação Desk.  
**Fonte bruta:** `docs/evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md`  
**Complementa:** `ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`, `ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md`, core Fase 1.

## 1. Papéis

| Conceito Journey | Papel no produto |
|---|---|
| **Painel de Calls** (`/calls`, `PainelCalls`) | Entrada canônica do CRM vivo (discovery comercial). **Não esconder.** |
| **CRM** | Ciclo de vida: lead → discovery/call → handoff → proposta → onboarding → caso operacional |
| **Planejador** | Fonte do plano operacional do **caso** após handoff (`case_plans` + `salvarPlanejadorOperacional`) |
| **Fonte persistida de Calls** | Tabela **`leads`** (e handoff para `clientes` / `crm_casos`) — **não** `crm_calls` |

Calls alimenta lead/discovery até o handoff. Depois disso, o eixo é o caso; o lead permanece rastreável (`crm_casos.lead_id`).

## 2. De-para Journey → schema real

| Journey (doc / SQL de exemplo) | Runtime Clube Ancestral |
|---|---|
| `crm_calls` | **Não criar.** Usar `leads` + campos SPIN / call / próximo passo |
| `crm_interactions` | **Não criar nesta fatia.** Timeline/audit existentes; WhatsApp = dívida |
| `opportunities` | **Não criar.** Proposta = `/propostas` + `propostas` (quando houver); oferta = produtos-pai / Canva |
| Lead bruto / qualificado | `leads` + filas em `/calls` e `/leads` |
| SPIN Discovery | Mesa em `painel-calls.tsx` + `discovery-roteiro.ts` |
| `status_call`, consentimento, `proxima_acao` | Colunas e JSON em `leads` (ver gap report) |
| Handoff → pessoa + caso | `executarHandoffDiscovery` → `clientes` + `crm_casos` (**já grava**; doc antigo “só avalia” está desatualizado) |
| Proposta pós-discovery | Rota `/propostas`; CTA a partir do Calls após handoff / com `case_id` |
| Onboarding WhatsApp / webhooks | **BLOQUEADO** nesta fatia (efeito externo exige aprovação humana) |
| Asaas como master de cobrança | **BLOQUEADO** como motor; financeiro = `invoices` / eventos ligados a caso |

Vocabulário CHECK e tabelas novas do SQL de exemplo do Journey **não** autorizam migration. Cruzar `types.ts` + migrations.

## 3. Estável vs piloto vs bloqueado

| Estado | Itens |
|---|---|
| **ESTÁVEL** | `/calls` PainelCalls; `/leads`; SPIN na mesa; validação de próxima ação/responsável em lead ativo; handoff → pessoa+caso; RLS; App Cliente sem vazamento interno |
| **PILOTO / reforço** | CTA Calls → `/propostas` com contexto `lead`/`caso`; avisos UI de lead sem próxima ação (pendência informa) |
| **BLOQUEADO (dívida)** | Tabela `crm_calls` / `crm_interactions`; WhatsApp onboarding automático; webhooks; Asaas como fonte de status operacional; Edge “Claude” como gate; split monorepo App×Desk do Enterprise PRD |

## 4. App Cliente

Proibido vazar para o portal: nota interna de call, score SPIN bruto, hipóteses como fato, SKU/preço técnico, gates internos, dados de outro cliente. App Cliente = projeção sanitizada (`client_visibility`, views portal).

## 5. Autoridade operacional

Para a proprietária: **pendência informa, não impede.** Aviso de lead sem próxima ação/responsável não substitui override auditado nem inventa hard-block além de identidade/organização.

## 6. Oferta comercial

Sem inventar SKUs Lovable. Oferta alinhada a produtos-pai e artefatos Canva já vigentes na memória de propostas.

## Relacionados

- Gap: `docs/relatorios/2026-09-11_gap-crm-journey-vs-app.md`
- Enterprise: `ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md`
- Calls discovery (2026-08-31): atualizar mentalmente — handoff **já persiste** pessoa+caso
