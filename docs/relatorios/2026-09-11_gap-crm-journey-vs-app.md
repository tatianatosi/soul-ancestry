# Gap: CRM Journey (18/08/2026) × app vivo

**Fontes:** `docs/politicas/CLUBE_ANCESTRAL_CRM_JOURNEY.md` · `src/components/crm/painel-calls.tsx` · `src/lib/handoff-discovery*.ts*` · `src/lib/crm-desk.ts` (`validarLead`) · `src/integrations/supabase/types.ts`  
**Veredito:** o circuito Discovery → lead → pessoa/caso **já opera** em `leads` + `clientes` + `crm_casos`. O Journey descreve tabelas e WhatsApp API que **não** dirigem o runtime; Planilha Mestre / Asaas como “fonte de verdade operacional” **contradiz** a memória permanente (planejador + caso).

---

## 1. De-para (conceito Journey → real)

| Conceito Journey | Onde está de fato |
|---|---|
| Painel de Calls / call fields | Colunas em `leads` (ex.: `status_call`, SPIN, `resumo_call`, `proxima_acao*`, consentimento). UI: `painel-calls.tsx` → `salvarLeadDesk` (`crm-desk.functions.ts`). **Não** há `crm_calls`. |
| CRM Mestre / estágio funil | `leads.eixo_comercial` + `leads.eixo_formalizacao` + `leads.estagio` (`LeadDesk` / `types.ts`). |
| Discovery / SPIN / premissas | Campos no próprio `leads` (`estrutura_familiar`, `geracao_ascendente`, `via_juridica_preliminar`, …). Roteiro: `discovery-roteiro` + Mesa em `painel-calls.tsx`. **Não** há `discovery_data`. |
| Handoff → oportunidade/caso | `executarHandoffDiscovery` → `clientes` + `crm_casos` + `leads.case_id` (+ trilha `estagio` até `ganho`). Destino lógico `proposta` em `avaliarHandoffCall` (`painel-calls.ts`). |
| Oportunidade comercial | Tabela real `opportunities` existe (`types.ts`); fluxo canônico paralelo em `crm-fluxo.functions.ts` / `fluxo-canonico.tsx`. **Entrada viva do Calls = `leads`.** |
| Proposta | Tabela `proposals` (`lead_id`, `case_id`, `client_id`). Rota `/propostas` (`propostas.tsx` → `comercial.functions.ts`). |
| Interações / histórico | `crm_interactions` (schema real ≠ DDL do Journey: exige `case_id`, `canal`, `tipo`, …). |
| Micro-entregas App | `client_deliverables` (inclui `deep_link`, `fallback_whatsapp_enviado`). **Não** há `micro_entregas`. |
| WhatsApp API / régua D0–D30 | Só varredura de dump colado (`varredura-whatsapp.ts` + `VarreduraWhatsApp` no Calls). Sem envio, webhook ou fila. |
| Planilha Mestre / SKU | Legado — não opera status/prioridade. Catálogo vivo ≠ “fonte do funil”. |
| Planejador / próxima ação pós-caso | `crm_casos.proxima_acao` + RPC `proxima_acao_prioritaria*`; handoff espelha prazo/responsável no caso. |
| Validação “lead ativo sem área/responsável/ação” | `validarLead` em `crm-desk.ts` (+ guard servidor/`fn_lead_desk_guard`). |

**Tabelas sugeridas no Journey e ausentes / proibidas como núcleo:** `crm_calls`, `discovery_data`, `whatsapp_automations`, `micro_entregas`, `crm_metrics`. Não criar.

---

## 2. O que já funciona (evidência)

- **Persistência da call no lead canônico:** `listarLeadsDesk` / `salvarLeadDesk` leem/gravam `from("leads")` (`crm-desk.functions.ts`); UI confirma “Não cria ficha paralela” (`painel-calls.tsx`).
- **Gates + handoff operacional:** `avaliarHandoffCall` / `podeExecutarHandoffDiscovery`; botão “Concluir handoff para pessoa e caso” chama `executarHandoffDiscovery` — cria/reusa `clientes`, abre `crm_casos`, grava `leads.case_id`, tarefa + timeline (`handoff-discovery.functions.ts`).
- **Pós-handoff:** navega para `/casos/$caseId` (não para proposta) — `painel-calls.tsx` `onSuccess` do handoff.
- **Disciplina comercial:** `validarLead` exige área, responsável, próxima ação datada; Discovery/resumo/proposta/contrato conforme eixos.
- **Filas/KPIs:** `montarFilasHoje` / Painel Hoje (`propostas_sem_followup`, `leads_sem_proxima_acao`, calls) — leitura de `leads`, sem tabela de métricas.
- **WhatsApp útil hoje:** paste → candidatos humanos → campos do lead; conversa **não** persistida (`varredura-whatsapp.ts`).

---

## 3. Gaps (factuais)

1. **WhatsApp automático (D0–D30, webhooks, templates):** inexistente; Journey assume API + `whatsapp_automations`.
2. **Tabelas inventadas / DDL divergente:** `crm_calls`, `discovery_data`, `whatsapp_automations`, `micro_entregas`, `crm_metrics`; DDL Journey de `crm_interactions` não bate com o schema real.
3. **CTA proposta após handoff:** destino declarado `proposta`, mas sucesso só abre Caso 360; **não** cria linha em `proposals` nem leva a `/propostas`.
4. **Simulador → Planejador automático** a partir da call: não há writer Journey → `case_plans` no handoff (só resumo/tipo_serviço/próxima ação no caso).
5. **Dupla via comercial:** Calls/`leads` vs `opportunities`/`crm_interactions` — risco de CRM paralelo se o Journey for seguido ao pé da letra.
6. **Princípios Journey vs política vigente:** Planilha Mestre / Asaas como fonte de status comercial **não** valem; planejador + caso mandam.
7. **Push/deep-link Lovable + NPS D30:** backlog; micro-entrega real = publicação em `client_deliverables`, sem régua WhatsApp.

---

## 4. Próximas fatias (só schema existente)

Ordem sugerida — vertical, sem migration nova:

1. **CTA pós-handoff → proposta:** com `case_id` + `cliente_id`, link/criar rascunho em `proposals` (`lead_id`/`case_id`/`client_id`) e deep-link `/propostas` ou Caso aba Comercial; sem inventar `crm_calls`.
2. **Fechar o circuito proposta no lead:** ao gravar/enviar proposta, atualizar `leads.proposta_link_interno` / eixos e fila `propostas_sem_followup` (já em `crm-desk.ts`).
3. **Uma leitura comercial no Hoje/Calls:** exibir proposta ligada ao caso (`proposals` por `case_id`) ao lado do lead — sem segunda entidade de call.
4. **Micro-entrega piloto:** publicar 1 item em `client_deliverables` no handoff/onboarding (deep_link App); flag `fallback_whatsapp_enviado` só quando houver canal real.
5. **WhatsApp:** manter varredura humana; automação só se reusar eventos já existentes (`case_timeline_events` / entregáveis) — **não** criar `whatsapp_automations`.
6. **Não fazer:** DDL do §6 do Journey; Planilha Mestre como motor; fundir Calls em `opportunities` sem decisão da proprietária.

---

*Gap de engenharia. Não comprova uso autenticado (`COMPROVADO_EM_USO`).*
