# Gap: CRM Journey (18/08/2026) × app vivo

**Fontes:** `docs/politicas/CLUBE_ANCESTRAL_CRM_JOURNEY.md` · `src/components/crm/painel-calls.tsx` · `src/lib/handoff-discovery*.ts*` · `src/lib/crm-desk.ts` (`validarLead`) · `src/integrations/supabase/types.ts`  
**Veredito:** o circuito Discovery → lead → pessoa/caso **já opera** em `leads` + `clientes` + `crm_casos`. O Journey descreve tabelas e WhatsApp API que **não** dirigem o runtime; Planilha Mestre / Asaas como “fonte de verdade operacional” **contradiz** a memória permanente (planejador + caso).

---

## 1. De-para (conceito Journey → real)

| Conceito Journey | Onde está de fato |
|---|---|
| Painel de Calls / call fields | Colunas em `leads` (SPIN, resumo, próxima ação, consentimento). UI: `painel-calls.tsx` → `salvarLeadDesk`. **Não** há `crm_calls`. |
| CRM Mestre / estágio funil | `leads` (eixos comercial/formalização + estágio). |
| Discovery / SPIN / premissas | Campos no próprio `leads`. Roteiro: Mesa Discovery. **Não** há `discovery_data`. |
| Handoff → pessoa/caso | `executarHandoffDiscovery` → `clientes` + `crm_casos` + `leads.case_id`. Destino lógico `proposta` em `avaliarHandoffCall`. |
| Proposta | Tabela `proposals` (`lead_id` / `case_id` / `client_id`). Rota `/propostas`. |
| Micro-entregas App | `client_deliverables` (+ `ops_microentregas` interno). **Não** há `micro_entregas`. |
| WhatsApp API / régua D0–D30 | Só varredura de dump colado. Sem envio, webhook ou fila. |
| Planejador / próxima ação | `crm_casos` + RPC próxima ação + `case_plans`. |
| Validação lead ativo | `validarLead` / gates de handoff (área, responsável, próxima ação datada). |

**Tabelas sugeridas no Journey e proibidas como núcleo:** `crm_calls`, `discovery_data`, `whatsapp_automations`, `micro_entregas`, `crm_metrics`.

---

## 2. O que já funciona

- Persistência da call no lead canônico (`leads`).
- Gates + handoff → pessoa e caso com vínculo e próxima ação.
- Pós-handoff: navegação para Caso 360 (CTA proposta reforçada nesta fatia).
- Filas/KPIs no Hoje leem `leads`, sem tabela de métricas paralela.
- Jornada D0–D365 em código: `cadencia-d0-d30.ts`, `cadencia-d31-d365.ts`, painel Ops, Caso 360.

---

## 3. Gaps

1. WhatsApp automático (Journey) — inexistente e fora do MVP de comunicação.
2. DDL inventado no Journey — não implementar.
3. CTA proposta após handoff — destino declarado `proposta`; circuito comercial precisa do deep link (esta fatia).
4. Dupla via `leads` vs `opportunities` — risco se o Journey for seguido ao pé da letra.
5. Contadores de jornada sem deep link — dívida de **sistema** (não de KPI); ver adendo D0–D365.

---

## 4. Próximas fatias (só schema existente)

1. CTA pós-handoff → `/propostas` + caso/onboarding (sem `crm_calls`).
2. Deep links Ops/Hoje → `/casos/$id` e `/onboarding/$id`.
3. Uma leitura de proposta ligada ao caso no Calls/Hoje.
4. Micro-entrega piloto via `client_deliverables` / `ops_microentregas` já existentes.
5. **Não fazer:** DDL do Journey; Planilha Mestre como motor; WhatsApp auto.

---

*Gap de engenharia. Não comprova uso autenticado.*

---

## Anexo — de-para de colunas (`LeadDesk`)

| Journey | `leads` |
|---|---|
| `status_call` | `status_call` |
| `consentimento_gravacao` | `consentimento_status` / `consentimento_gravacao` |
| `spin_*` | `spin_situacao` / `problema` / `implicacao` / `necessidade` |
| `proxima_acao` + data | `proxima_acao` / `proxima_acao_em` |
| `area_responsavel` / responsável | `area_responsavel` / `responsavel_nome` |
| `crm_calls` / `crm_interactions` | **Não criar** |

Ver também `ADENDO-CRM-JOURNEY-PAINEL-CALLS-2026-09-11.md` e `src/lib/crm-journey-calls.ts`.

