# CA05-CADENCIA-MICROENTREGAS — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0: nenhuma alteração silenciosa de contrato/dado; divergência entre comportamento prometido e implementação registrada abaixo, não corrigida por hipótese. Nenhuma tabela, checklist ou microentrega nova criada.

## 1. Fontes ativas localizadas

Três sistemas de "microentrega" coexistem, distintos e legítimos, nenhum novo:
- **`ops_microentregas`** (trabalho interno: responsável, prazo, critério de aceite, evidência) — escrito/lido por `ops.functions.ts`, sugerido por `sugerirProximaMicroentrega` (função pura em `onboarding-jornada.ts`, pré-preenche o formulário em `desk-operacional.tsx`).
- **`client_deliverables`** (cliente-facing, por caso) — escrito por `criarMicroentregaCliente`/`transicionarMicroentrega` (`jornada-cliente.functions.ts`), único chamador `AbaJornadaCliente` (Caso 360, seção Jornada).
- **`app_projections`** (Biblioteca Mestre) — escrito por `salvarProjecao`/`aprovarProjecao`/`publicarProjecaoApp`, único caminho que hoje chega ao App/portal (`portal-dados-vivos.ts`, RLS `app_proj_select_portal`).

Onboarding: `onboarding_planos` (execução, `recalcularPlanoOnboarding`, nunca ativa cliente) e `diagnosticarOnboarding`/`avaliarCadencia`/`derivarEstadoCaso` (puras, `onboarding-jornada.ts`) permanecem fontes únicas, sem escritor concorrente.

## 2. Estados normalizados

Verificado, sem mistura entre tabelas: `client_deliverables.approval_status` = rascunho/em_revisao/aprovado/publicado/arquivado (unificado em rodada anterior, 04/09/2026); `app_projections.approval_status` = draft/approved/published/in_review (vocabulário próprio, consistente em todos os leitores); `ops_microentregas.status` = pendente/concluída/cancelada (tabela própria). Nenhuma leitura cruzada encontrada — nada a normalizar além do já feito.

## 3. Vínculo fechado nesta rodada

Achado real: `transicionarMicroentrega` movia `client_deliverables` para "em_revisao" sem nenhum sinal fora da aba Jornada do caso — ninguém descobria uma entrega pronta para revisão sem abrir aquele caso específico. Fechado reusando exatamente o padrão já existente de `prepararAlertaProjecao`: ao entrar em "em_revisao", grava/reaproveita (dedup por case_id+tipo+pending) um `case_alerts` tipo `microentrega_em_revisao`, aparecendo em `/alertas` e no Painel Hoje. Não cria tarefa; não é lida por nenhum canal externo.

Confirmado por leitura de código: `criarMicroentregaCliente` nunca toca `tarefas`/`crm_casos.responsavel_principal`/`prazo_proxima_acao` (item 4); nenhum escritor de tarefa/ops chama `criarMicroentregaCliente` (item 3, sem conversão automática).

## 4. D0–D365

Confirmado como jornada contínua por caso: `AbaOnboarding`/`PainelPlanoOnboarding`/`PainelJornadaPosGates` são todos parametrizados por `caseId` real, lendo gates e cadência do caso — nenhuma lista de datas fixas nem cenário de exemplo. O único artefato "cenário" encontrado (`OrquestracaoContextual`, em `biblioteca-mensagens.tsx`) é preview isolado e explicitamente não-persistente; não afeta o Caso 360.

## Testes

`src/lib/__tests__/ca05-cadencia-microentregas.test.ts` (novo, 13 testes): fontes sem tabela nova; ops_microentregas ≠ client_deliverables; alerta de revisão usa case_alerts com dedup e nunca cria tarefa; transição respeita a máquina de estados e persiste available_at/archived_at; client_deliverables ainda sem leitor no App (grep em `src/routes`); app_projections sanitizado antes de publicar; onboarding parametrizado por caso. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (185 arquivos, 1771 testes) e `npx vite build` — todos limpos.

## App bloqueado até liberação

Parcialmente diferente do esperado: para `app_projections` sim — `contemConteudoInterno` bloqueia publicação antes de qualquer exposição. Para `client_deliverables`, o bloqueio hoje é absoluto, não condicional: nenhuma rota do App lê essa tabela (grep confirma zero ocorrências em `src/routes`), mesmo já `publicado`. A UI da Jornada promete "só publicado aparece no App Cliente" — promessa correta quanto a nunca vazar rascunho, mas o caminho de exposição em si não existe ainda.

## Pendência (1 de até 5)

Construir o leitor App-facing de `client_deliverables` (via `projetarEntregasCliente`, já pronta e testada) é mudança de escopo — decisão da Proprietária, fora do corte desta missão.

Commit: branch temporária → main → recovery (hash no push).
