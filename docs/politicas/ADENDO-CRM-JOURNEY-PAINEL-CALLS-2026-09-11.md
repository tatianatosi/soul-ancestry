# Adendo — CRM Journey × Painel de Calls / CRM vivo (2026-09-11)

- Status: vigente
- Fonte arquivada: [`docs/evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md`](../evolucao/recuperados/crm-journey-2026-09-11/CLUBE_ANCESTRAL_CRM_JOURNEY.md) (v1.0, 18/08/2026)
- Norma que **prevalece** em conflito: `MEMORIA-PERMANENTE…`, `AGENTS.md`, `.cursor/rules/clube-ancestral-core.mdc`, planejador ativo, schema real
- Irmão: [`ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`](./ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md), [`ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md`](./ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md)
- Gap detalhado: [`docs/relatorios/2026-09-11_gap-crm-journey-vs-app.md`](../relatorios/2026-09-11_gap-crm-journey-vs-app.md)

## Papéis canônicos

| Camada | Papel | Persistência real |
|---|---|---|
| **Painel de Calls** (`/calls`, `PainelCalls`) | Entrada: preparação, SPIN, registro, próxima ação, handoff | Tabela **`leads`** |
| **CRM vivo** | Ciclo de vida comercial após/além da call | `leads` → handoff → **`clientes`** + **`crm_casos`**; proposta em **`proposals`** |
| **Planejador** | Plano operacional do **caso** (não do lead) | `case_plans` + `salvarPlanejadorOperacional` |

Calls alimenta lead/discovery até o handoff. Depois do handoff, o eixo é o caso; o planejador comanda a operação.

## De-para Journey → runtime (não inventar tabela)

O Journey sugere `crm_calls`, `crm_interactions`, `opportunities`, `discovery_data`, `whatsapp_automations`. **Proibido criar** nesta etapa.

| Conceito Journey | Onde está hoje |
|---|---|
| Call / SPIN / status_call / consentimento | Colunas em `leads` (`status_call`, `spin_*` derivados, `consentimento_*`, `resumo_validado`, …) |
| `proxima_acao` + data + área/responsável | `leads.proxima_acao`, `proxima_acao_em`, `area_responsavel`, `responsavel_nome` |
| Opportunity | Etapa comercial do próprio `leads` (`eixo_comercial`) + caso após handoff |
| Handoff → pessoa + caso | `executarHandoffDiscovery` → `clientes` + `crm_casos` + `leads.case_id` (**já grava**) |
| Proposta | `/propostas` + tabela `proposals` — **não** criada pelo handoff |
| Interações / WhatsApp webhooks | Varredura local no Calls (não persiste dump); automação WhatsApp = **BLOQUEADO** |
| Asaas como master de cobrança | Eventos financeiros atuais ≠ reconciliação legada; Asaas legado = passado |
| Planilha Mestre como SKU/preço | Legado — produtos-pai / catálogo + Canva |

## ESTÁVEL · PILOTO · BLOQUEADO

| Estado | Itens |
|---|---|
| **ESTÁVEL** | `/calls` sobre `leads`; SPIN na Mesa; validação lead ativo (área + responsável + próxima ação datada); handoff → pessoa+caso; dicionário CA-04 em `/governanca/dicionario-calls-crm` |
| **PILOTO** | CTA pós-handoff → registrar/abrir proposta; avisos operacionais claros na UI (pendência informa a proprietária — autoridade operacional); deep-link `?lead=` / `?caso=` em propostas |
| **BLOQUEADO** (fora desta fatia) | Tabela `crm_calls` / `crm_interactions`; webhooks WhatsApp; Asaas como master; Edge Functions Claude; split monorepo App/Desk; apontar `clubeancestral.com.br` ao Vercel |

## Regras que não se negociam

1. Nenhum dado interno (gravação, transcrição, score, SKU técnico, hipótese jurídica, nota de Desk) vaza ao App Cliente.
2. Lead ativo sem área, responsável nominal e próxima ação datada → **aviso claro**; para a proprietária a pendência **informa, não impede** (`politica-autoridade-operacional.md`).
3. Handoff **não** envia proposta, mensagem, cobrança nem publica no App.
4. Site SEO ≠ app Vercel (`ADENDO-MARCA-SITE-SEO-2026-09-11.md`).

## Correção ao inventário antigo

O adendo de 2026-08-31 descrevia o handoff como “avaliação em memória” sem materializar caso. **Desatualizado:** `executarHandoffDiscovery` grava pessoa + caso. Ver nota no próprio `ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`.
