# CA-Consolidação-3-Redundâncias-Críticas — execução

```yaml
data_hora: 2026-09-09
head_main_no_inicio: f25953d
branch_de_trabalho: claude/consolidacao-3-redundancias-criticas-2026-09-09
ambiente: produção (Supabase zsxpdbhdvbuulwpepemd), sem navegador autenticado
checks: TypeScript limpo | 178 arquivos de teste / 1696 testes verdes | build não executado nesta rodada (mesmo padrão de rodadas anteriores)
dados_utilizados: schema real e contagens agregadas (dry-run); nenhum dado pessoal de caso real foi exposto ou alterado
limites: nenhuma migration de dado real aplicada; nenhuma tabela nova; nenhuma taxonomia/Planejador/CRM/motor de jornada/tela de Caso/OS novos; client_deliverables não recriado nem promovido
```

## Placar

```text
Próxima ação única: PARCIAL
Escritor único de OS: ACEITO
Dry-run blueprint → case_plans: CONCLUÍDO
Tarefas/alertas idempotentes: ACEITO
Migrations aplicadas: 1 (aditiva, schema — ver seção "Migrations", nenhum dado real alterado)
Dados reais alterados: NENHUM
Ações externas: NENHUMA
```

Por que "Próxima ação única" é PARCIAL, não ACEITO: a fonte canônica ficou unificada e correta em Caso 360 e Lista de Casos (a mesma RPC, o mesmo selo, a mesma ação final). Painel Hoje e Perfil 360 não foram tocados — o primeiro calcula sua própria fila priorizada por regra diferente (não lê `crm_casos.proxima_acao` diretamente) e o segundo ainda não existe como tela. Não estendi essa unificação a eles nesta rodada porque exigiria decidir se a fila do Painel Hoje deve mudar de régua (fora do escopo deste corte) — ver decisão 1.

## 1. Achado real, não estava no prompt: a causa raiz de "próxima ação diverge" era um bug de sincronização entre duas colunas

Antes de escrever qualquer código, chequei o schema e os dados reais. A RPC `proxima_acao_prioritaria` (usada por Caso 360) **já é** o motor canônico: ela verifica, nesta ordem, bloqueio de ativação real, tarefa vencida, tarefa do dia, documento pendente, proposta/contrato aguardando resposta e pagamento pendente (níveis 1–6) — só se nenhum desses existir ela olha o campo manual `crm_casos.proxima_acao` (nível 8), e só por último cai no fallback fixo (nível 9). Ou seja, a garantia "P0 real nunca fica escondido atrás de override manual" já existia na função SQL, por construção.

O problema real não era "duas fontes concorrentes" no sentido de duas lógicas de decisão — era mais simples e mais grave: a aba "Próxima Ação" da Ficha 360 escreve em `crm_casos.proxima_acao_codigo`, mas a RPC (nível 8) e a Lista de Casos leem `crm_casos.proxima_acao` — **duas colunas diferentes que nunca eram sincronizadas**. Conferido no caso real da Ana (`CA-CID-AT-FAM-2026-001`):

```text
proxima_acao        = "validar_representacao_menor"
proxima_acao_codigo = "solicitar_dados_cadastrais"
```

Duas próximas ações genuinamente diferentes gravadas para o mesmo caso, uma nunca vista pela RPC. Isso explica exatamente o "diverge do campo manual" que a Lista de Casos vinha mostrando.

## 2. Matriz de próxima ação

| Item | Estado |
|---|---|
| Escritor da RPC (motor de decisão) | `proxima_acao_prioritaria` (SQL, já existente) — não alterado |
| Escritor do override manual | `registrarProximaAcao` (`caso-canonico.functions.ts`) — **corrigido**: agora grava `proxima_acao` a partir de `proxima_acao_codigo` no mesmo commit, fechando a divergência de raiz |
| Novo: reverter ao automático | `voltarProximaAcaoAoAutomatico` — limpa `proxima_acao`/`proxima_acao_codigo`/justificativa, sem exigir a completude de responsável/público/canal (reverter não é registrar ação nova) |
| Novo: sem nova ação necessária | `marcarSemNovaAcaoNecessaria` — grava o código `sem_nova_acao_necessaria` (novo valor em `PROXIMAS_ACOES`, sem constraint de banco a alterar) |
| Leitura consolidada | `obterProximaAcaoCanonica` (`caso-ficha.ts`, pura, testada) — empacota o resultado da RPC com selo `Sugerida pela operação` / `Definida manualmente` |
| Caso 360 (`casos.$caseId.index.tsx`) | Card do topo agora usa `obterProximaAcaoCanonica` + selo, no lugar do texto cru da RPC |
| Lista de Casos (`casos.index.tsx`) | A ação canônica é a linha principal com selo; os campos manuais extras (dependência, critério de conclusão) só aparecem quando a origem é manual — não como uma segunda ação ao lado |
| Painel Hoje | **Não tocado.** Não lê `crm_casos.proxima_acao` — calcula sua própria fila priorizada (`PainelDia`) por regra de negócio diferente (SLA de contrato/pagamento/onboarding). Unificar exigiria decidir se essa régua muda — decisão 1 |
| Perfil/Pessoa 360 | Não existe como tela hoje — nada a unificar |
| App Cliente | Não existe superfície de "próxima ação liberada" hoje — nada a unificar |

Override manual preserva origem (`proxima_acao_codigo`), responsável (`responsavel_principal`, campo já existente e obrigatório em `crm_casos`) e prazo (`prazo_proxima_acao`) — nada disso foi removido ou trocado por texto novo.

## 3. Matriz de OS

| Item | Antes | Depois |
|---|---|---|
| Caminho automático | `emitirOSAnexoI(supabase, {org, userId, proposalId})` | Renomeado para `emitirOuRecuperarOS(supabase, {org, userId, origem, proposalId?, caseId?})` — mesma lógica interna, sem motor novo |
| Caminho manual | `salvarOrdemServico` inseria direto em `service_orders`, sem checar OS existente, sem `proposal_id`/`commercial_condition_id`/hash | Na criação (sem `id`), resolve `case_id` (direto ou via `contracts.case_id`) e chama `emitirOuRecuperarOS(..., origem: "manual")` — mesmo escritor, mesma checagem de idempotência |
| Idempotência | Só o caminho automático checava OS existente (por `proposal_id` + hash de conteúdo) | Os dois caminhos passam pela mesma checagem agora |
| Origem rastreável | Não existia | Coluna nova `service_orders.origem` (`planejador_proposta_condicao` \| `manual` \| `reabertura_ou_ajuste`), aditiva, nula, sem migration de dado |
| Autoria | `created_by`/`updated_by` já existiam e já eram preenchidos pelo caminho automático; o manual não preenchia | Manual agora preenche via `emitirOuRecuperarOS`, com `context.userId` real |
| OS histórica (mais de uma por caso) | Não investigado a fundo | Não apaguei nem fundi nada — cada versão de OS continua vinculada ao `proposal_id`, versionada (`versao`), nunca duplicada às cegas |
| Rascunho sem SKU/assinatura/pagamento/catálogo homologado | Já funcionava no caminho automático (achado de rodada anterior) | Preservado — nenhuma exigência nova adicionada |
| Divergência comercial vira pendência, não bloqueio | Já corrigido em rodada anterior (`assumirOuRecusarComUsuario`) | Preservado, reaproveitado pelo caminho manual também |
| Edição de OS existente (`data.id` presente) | Update direto | **Inalterado** — editar campos de uma OS já criada não é "criar uma segunda", segue como estava |

Teste técnico #5/#6 da lista obrigatória (mesma OS recuperada nos dois caminhos, origem/autoria registradas) foi validado por leitura de código, não por execução ao vivo — ver seção 6.

## 4. Dry-run `blueprint_parameters` → `case_plans`

Executado, somente leitura, nenhuma escrita. Organização real (Clube Ancestral), casos não arquivados:

```text
Total de casos: 7
Somente case_plans: 0
Somente blueprint_parameters: 1
Ambas as fontes: 0
Nenhuma das duas: 6
```

**Zero conflitos** — não existe hoje nenhum caso com as duas fontes preenchidas simultaneamente, porque `case_plans` não tem nenhuma linha real ainda em produção (o formulário do Planejador existe e está testado, mas ainda não foi usado para nenhum caso real). O único caso com `blueprint_parameters` é o da Ana (`CA-CID-AT-FAM-2026-001`), com conteúdo real e específico (fases da jornada, entregas previstas, critérios de aceite, escopo aprovado) — classificação: `COMPATIVEL_PARA_MIGRAR` (nada para sobrescrever, nenhum conflito de conteúdo a resolver).

Plano de migração (não executado, aguardando autorização — reversível):

1. Para o caso com `blueprint_parameters` e sem `case_plans`: gerar uma linha de `case_plans` copiando os campos compatíveis (`entregas_previstas → entregas`, `escopo_aprovado → objetivo`, `fases_jornada → marcos`), sem apagar `blueprint_parameters`.
2. `blueprint_parameters` permanece como histórico de leitura; nenhuma UI nova passa a escrever nela.
3. `materializarProposta` continua decidindo por `updated_at` entre as duas fontes durante e depois da migração — nenhuma mudança de código necessária nele.
4. Repetir o dry-run antes de qualquer nova rodada, já que dado real muda entre uma execução e outra.

`onboarding_planos` não foi usado nesta rodada como fonte de decisão de produto/oferta/proposta/condição comercial em nenhum ponto verificado — confirmado por leitura de código (`recalcularPlanoOnboarding` só grava campos de execução: fase, tarefas, checklist).

## 5. Matriz de sobreposição removida/evitada nesta rodada

| Sobreposição | Antes | Depois |
|---|---|---|
| `crm_casos.proxima_acao` vs `proxima_acao_codigo` | Duas colunas divergentes, sem sincronização | Sincronizadas no momento do registro; ação de reverter/marcar-sem-necessidade usa as duas juntas |
| Escritor de OS | Dois caminhos, dois formatos de linha | Um escritor (`emitirOuRecuperarOS`), origem rastreada |
| Alerta de próxima ação (rodada anterior) | Reaproveitado, sem mudança nesta rodada |
| Card de "próxima ação" em 2 telas | Uma mostrava campo manual cru, outra a RPC, sem selo comum | Mesmo componente conceitual (`obterProximaAcaoCanonica` + `SELO_PROXIMA_ACAO`) nas duas telas |

Não escondida, apenas não resolvida nesta rodada: os campos `proxima_acao_responsavel`/`proxima_acao_dependencia`/`proxima_acao_criterio_conclusao` (usados só pela Lista de Casos) parecem ser uma **terceira** representação de próxima ação, distinta de `responsavel_principal`/`proxima_acao_codigo`/`proxima_acao_justificativa` (usados pela aba da Ficha 360). Não investiguei a fundo se são de fato a mesma coisa com nomes diferentes — registrado como achado novo, não como corte fechado (decisão 2).

## 6. Testes técnicos e UI/reload

### Executado

- `npx tsc --noEmit`: limpo.
- `npx vitest run`: 178 arquivos, 1696 testes, todos verdes (4 novos, cobrindo `obterProximaAcaoCanonica`: ação automática vence, override manual só vence sem sinal mais urgente e é reversível, nível 1 nunca é tratado como manual, fallback seguro sem RPC).
- Item 8 da lista obrigatória (dry-run não escreve): confirmado — todas as consultas desta rodada foram `select`; a única escrita foi a migration aditiva de schema (`service_orders.origem`), sem tocar dado de caso.
- Item 9 (`entregas_previstas → entregas` preservado): confirmado por leitura — `materializarProposta` não foi alterado nesta rodada.
- Item 10 (`onboarding_planos` não é fonte de decisão comercial): confirmado por leitura de código.
- Item 11 (RLS/isolamento sem regressão): nenhuma policy foi tocada nesta rodada.

### Não testado (`TESTE_UI_PENDENTE_DE_HOMOLOGACAO`)

Sem sessão autenticada disponível nesta sessão — mesma limitação já registrada nos relatórios de 08-09/09. Não usei a Ana nem nenhum cliente pagante como laboratório. Pendente, quando houver homologação segura:

- Abrir caso → assumir override manual → salvar → reload → conferir mesma ação em Caso 360/Lista de Casos → voltar ao automático → reload.
- Abrir contrato/OS → criar pelo caminho manual → reload → acionar caminho automático → confirmar que recupera a mesma OS.
- Testes técnicos #3 e #4 da lista obrigatória (Caso/Painel Hoje/Lista concordam; refetch não duplica alerta/tarefa) na parte que depende de UI real — a parte de código (dedup de alerta) já foi validada por leitura e por reaproveitar o padrão testado de `registrarRevalidacaoProposta`.

## 7. Arquivos, commits e reversão

Arquivos alterados nesta rodada:

- `src/lib/cadeia-operacional.server.ts` — `emitirOuRecuperarOS`.
- `src/lib/cadeia-operacional.functions.ts` — wrapper atualizado.
- `src/lib/contratos.functions.ts` — `salvarOrdemServico` chama o escritor único na criação.
- `src/lib/caso-canonico.functions.ts` — sincroniza `proxima_acao`/`proxima_acao_codigo`; novas ações `voltarProximaAcaoAoAutomatico`/`marcarSemNovaAcaoNecessaria`.
- `src/lib/caso-ficha.ts` — `obterProximaAcaoCanonica`, `SELO_PROXIMA_ACAO`, novo código `sem_nova_acao_necessaria`.
- `src/components/caso/proxima-acao.tsx` — botões "Voltar à sugestão automática" e "Marcar sem nova ação necessária".
- `src/routes/_authenticated/casos.$caseId.index.tsx` — card de próxima ação com selo.
- `src/routes/_authenticated/casos.index.tsx` — próxima ação canônica como linha principal.
- `src/lib/__tests__/caso-ficha-proxima-acao-canonica.test.ts` (novo).
- `supabase/migrations/20260909020000_service_orders_origem.sql` (novo, aditivo).

Commit único, direto em `main` (mesmo fluxo desta sessão: branch a partir de `origin/main`, `tsc`/`vitest` limpos, fast-forward, sync da branch de recuperação). SHA final registrado após o push — ver mensagem de resposta.

**Reversão**: `git revert` do commit desfaz todo o código sem efeito colateral em dado — a coluna nova (`service_orders.origem`) é nula e aditiva; `crm_casos.proxima_acao`/`proxima_acao_codigo` seguem existindo com os mesmos valores de antes (a sincronização só passa a acontecer daqui para frente, não reescreve histórico).

## Decisões da Proprietária

1. **Painel Hoje deve passar a usar a mesma régua de próxima ação (RPC canônica) ou continua com a fila priorizada própria dele?** Unificar totalmente exigiria decidir isso — não decidi sozinha porque mudaria o comportamento de uma tela que já funciona com lógica própria e testada.
2. **`proxima_acao_responsavel`/`proxima_acao_dependencia`/`proxima_acao_criterio_conclusao` (só na Lista de Casos) são uma terceira representação da mesma próxima ação, ou um conceito genuinamente diferente?** Não investiguei a fundo nesta rodada — acabei de encontrar isso ao consertar o par `proxima_acao`/`proxima_acao_codigo`.
3. **Autorizar o dry-run de migração `blueprint_parameters → case_plans`** (seção 4) — hoje é só 1 caso real, sem conflito, então o risco de migrar é baixo, mas a decisão de quando/se migrar continua sendo sua.
4. As 5 decisões já registradas no relatório anterior (09/09, consolidação de jornada/checklists/gates) continuam pendentes — não foram tratadas nesta rodada por não fazerem parte do escopo dos 3 cortes pedidos aqui.
5. **Unificar `emitirOSAnexoI`'s nome antigo em outros lugares que eu não tenha encontrado** — só há 1 chamador conhecido (`cadeia-operacional.functions.ts`), mas se houver referência externa (script, relatório antigo, documentação) ao nome antigo, ela ficará desatualizada.
