# De-para — D7, onboarding e micro-entregas reais (P3)

- Data: 2026-09-25
- Ordem: "P3 — Executar e publicar: onboarding único e microentregas reais" (aprovada pela Proprietária, com publicação em `main`).
- Decisão da Proprietária nesta rodada: aplicar a migration da projeção no App (`20260925120000_portal_casos_proxima_entrega`).
- Estado: código, teste e migration aplicados; **falta a prova autenticada** da Proprietária no Lovable. Nada promovido a `IMPLEMENTADO_EM_FLUXO_REAL`.

## 1. Onde o D7 morava (antes)

| Lugar | O que era | Problema |
|---|---|---|
| `ops_microentregas` | A micro-entrega real (Ops, `/ops`) | — (fonte legítima) |
| `onboarding_checklist.micro_entrega_d7` | Item **obrigatório** que segura a ativação no banco (`case_ativacao_bloqueios_reais`) | Caixinha manual: ninguém a ligava à micro-entrega. No caso da Ana havia micro-entrega real ("Prancha 1", prazo 30/09, sem responsável) e o item seguia **pendente** |
| `onboarding_planos.checklist_inicial` ("Primeira micro-entrega planejada") | Item do plano | Já derivado desde o corte D (24/09) |
| Gate `primeira_microentrega` da jornada (`onboarding-jornada.ts`) | Gate da jornada | Já derivado desde o corte D |
| `case_plans.proxima_microentrega` | Texto do plano ativo | Nenhum escritor o atualizava |
| `criarPrimeiraMicroentregaOnboarding` | CTA do Caso 360 | Só reaproveitava pelo título fixo (reexecução num caso com outra micro-entrega criava uma segunda); não gravava responsável; prazo = hoje+7, não D0+7 |
| Painel Hoje, cartão "SLA em risco" | Cartão do topo | Declarado `null` por não ler a fonte |

## 2. Fonte única e espelhos (agora)

**Fonte operacional:** `ops_microentregas`. A micro-entrega D7 é a **mais antiga ativa** (não arquivada, não cancelada) do caso (`microentregaD7`, `src/lib/d7-microentrega.ts`). Regra "conta" continua a mesma de `primeiraMicroentregaReal`.

**Reconciliador único:** `reconciliarD7Caso` (`src/lib/d7-microentrega.server.ts`). Grava com releitura (`inserirComVerificacao`/`gravarComVerificacao`):

1. Micro-entrega: cria só se falta **e** foi pedido (`criarSeFaltar`); prazo = D0 do onboarding + 7 (`DIAS_PRIMEIRA_MICROENTREGA`), responsável = responsável do caso (ou quem executa), status `pendente`, critério de aceite padrão. Se existe, só **completa** responsável/prazo vazios — nunca sobrescreve valor humano.
2. `onboarding_checklist.micro_entrega_d7`: concluído com observação "Derivado de ops_microentregas <id>: <título>"; volta a pendente só o que o próprio espelho concluiu (ex.: micro-entrega cancelada/arquivada); **"não aplicável" humano é preservado**.
3. `onboarding_planos.checklist_inicial`: recalculado pelo dado real (mesma `checklistComGates`).
4. `case_plans.proxima_microentrega` (planos ativos): "<título> — até <prazo>", ou vazio quando concluída.
5. `case_alerts` tipo `primeira_microentrega_pendente`: abre só depois do D7 sem micro-entrega; resolve (`completed`) quando ela existe. Sem duplicar.
6. Linha do tempo do caso: só quando algo mudou. Reexecutar é silencioso.

**Quem chama o reconciliador:**

| Writer | Arquivo | `criarSeFaltar` |
|---|---|---|
| "Criar ou reconciliar micro-entrega D7" (Caso 360 › Onboarding) | `onboarding-plano.functions.ts#criarPrimeiraMicroentregaOnboarding` | sim |
| Recalcular plano de onboarding | `onboarding-plano.functions.ts#recalcularPlanoOnboarding` | não |
| Salvar micro-entrega em Ops (criar/editar/cancelar) | `ops.functions.ts#salvarMicroentrega` | não |
| Arquivar micro-entrega em Ops | `ops.functions.ts#arquivarOps` | não |
| Tick manual do item D7 (tela de ativação e Caso 360) | `onboarding.functions.ts#atualizarItemChecklistOnboarding`, `caso-canonico.functions.ts#atualizarItemOnboarding` → `tratarTickManualD7` | não |

Tick manual: "concluído"/"pendente" no item D7 não gravam caixinha — reconciliam; aceita se o pedido coincide com a realidade, recusa com o motivo se não. "Não aplicável" (com evidência) continua manual. As duas telas mostram o aviso "segue a micro-entrega real" e escondem Concluir/Reverter do item D7.

## 3. Leitores

| Superfície | O que mostra | Fonte |
|---|---|---|
| Caso 360 › Onboarding (`onboarding-plano.tsx`) | Cartão D7: micro-entrega, prazo, responsável, estado (`prazo_status`), próxima ação, lacunas, estado do item D7 de ativação, "Abrir em Ops" | `carregarPlanoOnboarding` → `v_ops_microentregas` + `onboarding_checklist` + `profiles` |
| Painel de jornada (`/ops`) | D7, "sem micro-entrega", cadência | já lia `ops_microentregas` (corte D) |
| Painel Hoje, cartão "SLA em risco" (existente) | Micro-entregas `em_risco`/`atrasada` + tarefas com `sla_status` em risco, só dos casos visíveis | `painelHojeDesk` → `v_ops_microentregas` + `v_ops_tarefas`; falha de leitura = cartão sem número (nunca zero). **Nenhum cartão novo.** |
| App Cliente, Home e Jornada | "Próxima entrega prevista para dd/mm/aaaa." | `portal_casos.proxima_entrega_prevista_em` (só a data) |

## 4. App Cliente — migration aplicada

`supabase/migrations/20260925120000_portal_casos_proxima_entrega.sql` recria `portal_casos` idêntica a `20260922120000` (mesmas reloptions `security_barrier=true, security_invoker=false`, mesmo filtro `portal_caso_permitido`, mesmas colunas e ordem) e acrescenta no fim `proxima_entrega_prevista_em` = menor `prazo` das micro-entregas não arquivadas e não concluídas/canceladas. Nenhum título, descrição, responsável, critério, evidência ou status atravessa. O App continua sem ler `ops_microentregas` (teste de fronteira intacto).

Aplicada em 25/09/2026 pelo conector do Lovable e registrada em `supabase_migrations.schema_migrations`. Conferido: reloptions `{security_barrier=true,security_invoker=false}`, 17 colunas (a nova no fim), sem SELECT para `anon`, contagens de `crm_casos` (4) e `ops_microentregas` (1) inalteradas. O leitor do App relê sem a coluna se outro banco ainda não a tiver.

Reversão: recriar a view de `20260922120000` (sem a coluna) e remover a linha `20260925120000` de `schema_migrations`.

## 5. O que não mudou

- Nenhuma tabela nova, nenhuma linha apagada, nenhuma RLS alterada.
- `onboarding_templates` e `case_activation_checks`: sem item D7 (o D7 de ativação é `onboarding_checklist.micro_entrega_d7`; `activation_check_definicoes()` não tem D7). Nada a espelhar ali.
- Dados reais não foram reconciliados por SQL: o caso da Ana se alinha quando a Proprietária clicar no botão (prova abaixo).

## 6. Testes

`src/lib/__tests__/p3-d7-microentrega-2026-09-25.test.ts` (18): regras puras; reconciliador com banco em memória (cria com prazo/responsável/estado/critério e espelha; reexecução não duplica micro-entrega nem evento; micro-entrega de outro título é reaproveitada e só completa lacunas; alerta abre após D7 e resolve; cancelar volta o D7 a pendente; não aplicável preservado; tick manual aceita/recusa pela realidade); ligações dos writers; UI do Caso 360; SLA do Painel Hoje; App só com a data. Ajustados de propósito: `d7-microentrega-real`, `releitura-onboarding-microentregas`, `motores-executam` (CTA renomeado) e `portal-casos-modelo-de-acesso` (a regra agora é "toda migration posterior à fixação repete as reloptions e nunca liga `security_invoker`").

## 7. Prova no Lovable (sessão autenticada da Proprietária)

1. Caso da Ana → Caso 360 → aba Onboarding → cartão "D7 — primeira micro-entrega": ver "Prancha 1 — Linha materna Silveira", prazo 30/09, "sem responsável".
2. Clicar "Criar ou reconciliar micro-entrega D7": aviso "D7 reconciliado… · completado: responsável · checklist D7 marcado pelo dado real". Nenhuma micro-entrega nova.
3. Recarregar: responsável preenchido; "Item D7 do checklist de ativação: concluído pelo dado real". Em `/onboarding/<caso>`, o item "Primeira micro-entrega planejada até D7" aparece Concluído, com a observação derivada e sem botão Concluir/Reverter.
4. Clicar de novo: nada muda (sem duplicar).
5. Painel Hoje: o cartão "SLA em risco" mostra um número (não mais vazio).
6. App (cliente com acesso ao caso): Home e Jornada mostram "Próxima entrega prevista para 30/09/2026." — sem título nem responsável.

Prints: inicial, ação, confirmação, releitura e integração, em `docs/relatorios/2026-09-11_registro-prova-autenticada.md`.
