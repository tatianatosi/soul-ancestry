# Adendo — CRM Journey × Painel de Calls / CRM vivo (2026-09-11)

- Status: vigente
- Fonte arquivada: [`docs/evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md`](../evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md) (v1.0, 18/08/2026)
- Norma que **prevalece** em conflito: `MEMORIA-PERMANENTE…`, `AGENTS.md`, `.cursor/rules/clube-ancestral-core.mdc`, planejador ativo, schema real
- Irmão: [`ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`](./ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md), [`ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md`](./ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md)
- Gap detalhado: [`docs/relatorios/2026-09-11_gap-crm-journey-vs-app.md`](../relatorios/2026-09-11_gap-crm-journey-vs-app.md)

## Sequência comercial canônica (revisão 2026-09-11)

Ordem que a operação deve respeitar — **não** começar pela call:

1. **Lead** — captura e triagem (`/leads`). Existe antes de qualquer call.
2. **Call Discovery / diagnóstico** — SPIN, elegibilidade preliminar, próxima ação (`/calls`, Mesa). Faz parte do **CRM vivo**.
3. **Call de apresentação da proposta** (ideal) — mostrar a oferta ao lead/cliente; o registro formal da proposta fica em `/propostas` (handoff **não** cria proposta).

Calls ⊂ CRM vivo. Lead ⊂ CRM vivo. A call **não** antecede o lead.

## Papéis canônicos

| Camada | Papel | Persistência real |
|---|---|---|
| **CRM vivo · Lead** (`/leads`) | Entrada comercial: captura, triagem, agenda da Discovery | Tabela **`leads`** |
| **CRM vivo · Calls** (`/calls`, `PainelCalls`) | Discovery/diagnóstico e (idealmente) call de proposta; registro SPIN, próxima ação, handoff | Conceito Journey `crm_calls` → **`leads`** (não criar `crm_calls`) |
| **CRM vivo · pós-handoff** | Pessoa, caso, proposta registrada, follow-up, App | `leads` → **`clientes`** + **`crm_casos`**; proposta em **`proposals`** |
| **Planejador** | Plano operacional do **caso** (não do lead) | `case_plans` + `salvarPlanejadorOperacional` |

## De-para Journey → runtime (não inventar tabela)

O Journey sugere `crm_calls`, `crm_interactions`, `opportunities`, `discovery_data`, `whatsapp_automations`. **Proibido criar** nesta etapa.

| Conceito Journey | Onde está hoje |
|---|---|
| Lead bruto / triagem | `/leads` + colunas de origem/status em `leads` |
| Call Discovery / diagnóstico (SPIN) | `/calls` sobre o mesmo `leads` (`status_call`, SPIN, consentimento, resumo) |
| Call de apresentação da proposta | Ritual ideal na Mesa/`/calls` + registro em `/propostas` (`proposals`) |
| `proxima_acao` + data + área/responsável | `leads.proxima_acao`, `proxima_acao_em`, `area_responsavel`, `responsavel_nome` |
| Opportunity | Etapa comercial do `leads` (`eixo_comercial`) + caso após handoff |
| Handoff → pessoa + caso | `executarHandoffDiscovery` → `clientes` + `crm_casos` + `leads.case_id` (**já grava**) |
| Proposta (artefato) | `/propostas` + `proposals` — **não** criada pelo handoff |
| Interações / WhatsApp webhooks | Varredura local no Calls; automação WhatsApp = **BLOQUEADO** |
| Asaas / Planilha Mestre | Legado — não dirigem a operação atual |

## ESTÁVEL · PILOTO · BLOQUEADO

| Estado | Itens |
|---|---|
| **ESTÁVEL** | Lead antes da call; `/calls` sobre `leads`; SPIN Discovery; validação lead ativo; handoff → pessoa+caso |
| **PILOTO** | Ritual explícito da **call de proposta** (ideal) + CTA pós-handoff → `/propostas`; avisos operacionais; hub `/crm-journey` |
| **BLOQUEADO** | Tabela `crm_calls` / `crm_interactions`; envio WhatsApp automático; Asaas master; apontar SEO ao Vercel |

## Regras que não se negociam

1. Sequência: **Lead → Discovery → (ideal) call de proposta** — não inverter.
2. Nenhum dado interno vaza ao App Cliente.
3. Lead ativo sem área, responsável e próxima ação datada → aviso; para a proprietária **informa, não impede**.
4. Handoff **não** envia proposta, mensagem nem cobrança.
5. Site SEO ≠ app Vercel.

## Correção ao inventário antigo

- Handoff **já grava** pessoa + caso (`ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`).
- Calls não é “pré-CRM” nem o primeiro objeto: o **Lead** vem primeiro; Calls é a superfície viva de conversa do CRM vivo.
