# Motores primordiais P0–P11 — verificação 2026-09-10

Tatiana pediu para conferir se há diversos motores primordiais. Há: **P0–P11** no prompt-mestre, mais o **Planejador de Cidadania fases 0–8** (PRs #61–#63), que não é um 13º P — mora em **P7**.

Fonte: `docs/politicas/PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md`. Mapa: `src/lib/motores-tabelas.ts`. Cidadania: `src/lib/motor-cidadania.ts`.

Nenhuma tabela nova. Recusados: `case_participants`, `citizenship_cases`, `onboarding_runs`, `cadence_runs`, `country_catalog`.

## Estado nesta branch

| Motor | Estado | Onde opera | O que ainda falta |
|---|---|---|---|
| P0 Autoridade e persistência | Operando | `crm_casos`, `clientes`, `tarefas`, `contracts`, `proposals` | Homologação logada (F5) |
| P1 Caso, núcleo, participantes | Parcial | `crm_casos`, `nucleos_familiares`, `nucleo_membros`, `case_members`, `case_dependents` | Merge controlado 2–6; Pessoa 360 cinco camadas |
| P2 Contrato, proposta, OS | Parcial | `contracts`, `proposals`, `service_orders`, `contract_case_parameters` | Catálogo vivo no SKU (ligado nesta rodada; depende da linha homologada) |
| P3 Tarefa, próxima ação, cadência | Parcial | `tarefas`, `crm_casos`, `case_plans`, `case_alerts` | CRM Vivo restante (#67) |
| P4 Onboarding real | Parcial | `onboarding_planos` — agora **cria a linha** se faltar, no recálculo | Não ativa cliente; D0–D365 ainda cadência, não envio |
| P5 Pesquisa e evidências | Parcial | `research_cases`, `research_people`, `research_sources`, evidências | Três stores de evidência ainda coexistentes |
| P6 Micro-entregas e App Cliente | Parcial | `client_deliverables`, `ops_microentregas`, `app_projections` | `client_deliverables.case_id` em cadeia (#81) |
| P7 Comercial, financeiro, catálogo | Parcial | `product_catalog`, `citizenship_tracks`, `case_plans`, faturas | Planejador × produto × jornada (#79/#82) |
| P8 Marketing e conversão | Parcial | `leads`, `crm_casos` | Card Discovery (#58) |
| P9 Cockpit e alertas | Parcial | `case_alerts`, `crm_casos` | — |
| P10 Integrações externas e escala | Planta | `communication_queue`, `invoices`, `payments` | Integração real continua confirmação humana |
| P11 Revisão visual e marca | Parcial | Sem tabela — mockup 17 p. nesta PR | Distortion PDF P0/P1; homologação visual logada |

## Planejador de Cidadania 0–8

Diagnóstico no Caso 360 (Indicadores) e inventário na Biblioteca Mestre. Fase 6 = projeção sanitizada no App Cliente. Fase 8 = planta (revisão humana). Não emite parecer, não calcula percentual de elegibilidade, não grava preço na trilha.

## O que esta rodada ligou

1. Inventário P0–P11 visível na Biblioteca Mestre.
2. Fases 0–8 no Caso 360, lendo tabelas vivas.
3. P4: `recalcularPlanoOnboarding` insere `onboarding_planos` se a linha não existir (UNIQUE `case_id`). CTA no estado vazio.
4. P7: pré-carga de contrato consulta `product_catalog`; SKU só entra se ativo e `homologado`.

Desk permanece com **8 grupos**. App Cliente permanece com **7 abas**.
