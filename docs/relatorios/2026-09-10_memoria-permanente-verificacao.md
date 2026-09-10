# Verificação — memória permanente vs projeto real (2026-09-10)

Fonte lida: upload da proprietária (Tatiana) `memoria_permanente_clube_ancestral_e_instrucoes_de_implementacao_135a.md`. Distilado operacional em `AGENTS.md` e `.cursor/rules/clube-ancestral.mdc`. Arquivo completo em `docs/politicas/MEMORIA-PERMANENTE-CLUBE-ANCESTRAL-2026-09-10.md`.

Nenhuma tela, rota ou tabela foi alterada nesta verificação. Outro agente nesta branch edita `src/lib/navegacao-desk.ts` e alinhamento mockup; este relatório não compete com isso.

## O que o código confirma

| Afirmação a checar | Estado real |
|---|---|
| 8 grupos do Desk | Confirmado em `GRUPOS_DESK`: `hoje`, `marketing`, `comercial`, `casos`, `pesquisa`, `contratos`, `cliente`, `governanca`. Testes em `src/lib/__tests__/assistente-transversal.test.ts` e `ca-ux-04-marketing-administracao.test.ts` travam “exatamente 8”. |
| Mockup 17 páginas como visual normativo | Arquivo presente: `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf`. Decisão já registrada em `docs/relatorios/2026-09-09_correcao_referencia_mockup_17_paginas.md`. |
| PDF de distorção / 47 páginas ≠ produção normativa | `clube-ancestral-mockup-auditoria.pdf` é auditoria complementar. Relatórios de 09/09 documentam o erro de tê-lo tratado como mockup aprovado. Produção não replica a sidebar longa desse PDF. |
| App Cliente 7 abas | Navegação canônica em `portal-shell.tsx`: Home (`COPY_TELAS.casos.navegacao`), Jornada, Radar, Árvore, Documentos, Legado, Conta. Taxonomia em `TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`. |
| Planejador / próxima ação | `planner_tarefas` + RPC `proxima_acao_prioritaria` existem. |
| Caso como eixo | `crm_casos` é o caso operacional; `case_members` cobre participantes. |
| Legado segregável | `legacy_record_links` existe. |
| Auditoria / override | `audit_logs`, `owner_override_events`, trigger `case_phase_history` (migration `20260906140000`; **ausente** de `types.ts`). |
| Lovable | `AGENTS.md` mantém o bloco `LOVABLE:BEGIN/END`. Sem force-push. |

## Contradições e dívidas (declaradas, não “corrigidas” aqui)

1. **Hierarquia de 8 telas da memória permanente ≠ 8 grupos do Desk.** O documento lista planner, lista de casos, detalhe do caso, contato/família, documentos, pesquisa, portal, admin. O código agrupa Hoje, Marketing, Comercial, Casos 360, Pesquisa, Contratos e financeiro, Cliente, Biblioteca Mestre. Interpretação adotada: prioridade funcional, não mandato de redesenho. Decisão já existente (09/09): **não** colapsar para as 7 itens do mockup.

2. **Mockup 17 páginas mostra 7 itens de Desk** (Visão Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno, Alertas, Biblioteca Mestre). Produção tem 8 grupos com dezenas de subitens. Já decidido: manter os 8. O documento novo não revoga isso e não cita os 8 grupos — não inventar um “CHECK” nem um menu novo para forçar o alinhamento.

3. **App Cliente tem mais que 7 abas no código.** Além das 7 canônicas, `portal-shell.tsx` inclui Entregas / Fase 01 / Fase 02 quando aplicáveis, e há copy de Proposta, Faturas e Atendimento. `COPY_TELAS.home.navegacao` ainda é `"Início"`; a aba real usa `casos.navegacao` = `"Home"`. Residual, não relabelizar nesta entrega.

4. **README raiz** descreve protótipo visual-only com **6** abas de cliente e sidebar Desk de 6 itens e KPIs fictícios. É o prompt original Lovable (nota de 24/08). Não é a operação atual.

5. **Fragmentação vs motor unificado.** O documento exige um núcleo. O schema tem eixos paralelos: `crm_casos` e `casos`; `documents` / `evidencias` / `evidences` / `case_source_documents`; `microentregas` / `ops_microentregas` / `client_deliverables`; `/pesquisa` (dossiê antigo) vs `/pesquisa-modulo` (`research_cases`). Dívida real — não criar mais uma cópia.

6. **Nomes hipotéticos de prompts antigos não existem e não devem ser criados:** `case_participants` (usar `case_members`), `citizenship_cases` (usar `crm_casos`), `onboarding_runs` / `cadence_runs`. `docs/politicas/README.md` já alerta isso.

7. **`case_phase_history`** está em migration e é lido em `caso-ficha.functions.ts`, mas não aparece em `src/integrations/supabase/types.ts`.

8. **Tensão com `politica-autoridade-operacional.md` (2026-09-05).** A memória permanente pede transições de estado controladas no back-end. A política vigente da proprietária diz que **pendência informa, não impede**, e só identidade/organização bloqueiam de verdade. As duas convivem: regras para o sistema/equipe; override auditado para a proprietária. A memória permanente **não** revoga a política de 05/09.

9. **Alguns relatórios listam “Financeiro” como 8º grupo.** No código, financeiro é subgrupo de `contratos` (`Contratos e financeiro`). O 8º grupo é `cliente`.

10. **O documento permanente não define vocabulário CHECK, IDs de requisito nem as 17 páginas / 8 grupos.** Não completar essas lacunas com taxonomia inventada. Requisitos continuam na matriz de rastreabilidade descrita no próprio documento, sem prefixo CHECK-*.

## Políticas já existentes (atualizadas, não substituídas)

- `docs/politicas/fonte-de-verdade-design-e-execucao.md` — ordem visual/execução; agora aponta para o planejador e para o legado.
- `docs/politicas/politica-autoridade-operacional.md` — permanece vigente.
- `docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` — nomes das 7+7 telas do mockup; revisão visual continua P11.
- `docs/politicas/README.md` — índice; o destilado para agentes passou a ser `AGENTS.md`, não este rastreador histórico.
