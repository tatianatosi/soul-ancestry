# Backlog em tarefas — achados das auditorias do Cartographer (02/11/2026)

Origem: 7 relatórios em `.cartographer/reports/` (contrato-comercial, crm-leads-calls, pesquisa-genealogia, jornada-planejador-motores, golive-casos, app-cliente-portal, desk-telas) mais os 2 anteriores (documentos, infra). Os 3 relatórios que faltavam (auth-sessao, persistencia-banco, banco-esquema-rls) chegaram em 02/11/2026; os achados deles que ainda não viraram tarefa estão na seção "Achados sem tarefa" no fim.

**Limite do que está provado:** os relatórios leram só o código. Nenhum consultou o banco vivo nem rodou o app. Todo item marcado "confirmar no banco" tem a primeira tarefa de leitura antes de qualquer correção.

**Regras:** um PR pequeno por tarefa ou tema, em branch `claude/*`; `git merge origin/main` antes do PR; teste que falha antes e passa depois; sem migration, RLS, convite, publicação, merge ou deploy sem autorização explícita; sem tabela nova nem CHECK novo. Tamanho: XS 1 arquivo, S 1–2, M 3–5. Nada acima de M.

## Fase A — Autoridade e erro visível (a causa provável de "nada salva")

### A0 (XS) Provar a causa antes de corrigir

- **Descrição:** ler, sem alterar nada, as linhas `acao='erro_app'` de `audit_logs`; contar `staff_access`, `organization_members` e `user_roles` da conta da Proprietária; pedir a resposta de `getContexto` na aba Network.
- **Aceite:** um parágrafo no relatório dizendo se `getContexto` falha para a admin e com qual erro.
- **Verificação:** consulta de leitura via Lovable `query_database`; resposta do navegador colada pela Proprietária.
- **Depende de:** nada. Se a admin usar o app e gerar erros, a leitura passa a ter dados.

### A1 (S) Mostrar o erro real quando `getContexto` falha

- **Arquivos:** `src/components/saas/shell.tsx:55-83`, `src/lib/autoridade-operacional.ts:84-112`.
- **Aceite:** com `getContexto` falhando, a tela mostra o erro e "tentar de novo"; o botão desabilitado diz o motivo (carregando, sem papel, sem organização).
- **Verificação:** teste de renderização com `getContexto` rejeitado; `tsc` e vitest.
- **Depende de:** A0 (para saber se é essa a causa).

### A2 (XS) `AcaoOperacional.executar` com catch e aviso

- **Arquivo:** `src/components/ops/acao-operacional.tsx:80-92`.
- **Aceite:** erro de uma ação vira toast com a mensagem; nunca fica mudo.
- **Verificação:** teste com ação que rejeita.

### A3 (S) Dizer a verdade sobre o que foi salvo

- **Arquivos:** `src/routes/casos.$caseId.index.tsx:5220` ("Salvo e conferido" com `alterados=[]`; `ignorados` nunca lido), `src/lib/portal-atendimento.functions.ts:36-52` (erro de pós-escrita vira toast de falha com a linha já gravada).
- **Aceite:** "Salvo" só aparece quando houve linha alterada; falha de auditoria não cancela o aviso de sucesso da escrita principal e fica registrada.
- **Verificação:** testes dos dois fluxos.

### A4 (M) Um só resolvedor de organização e papel — **precisa de decisão**

- **Fato:** 4 resolvedores no servidor com fontes diferentes (`saas.functions.ts:359` e `:379`, `ops.server.ts:131`, `documentos.server.ts:66`, `onboarding-regras.ts:61`); o RLS exige `user_roles` e `organization_members`. `getContexto` concede "admin" por padrão a quem não tem `staff_access` (`saas.functions.ts:438`).
- **Decisão da Proprietária:** a regra única (qual tabela manda) e se o "admin por padrão" sai.
- **Depende de:** A0.

**Checkpoint A:** tela de erro visível em `/qualidade`; vitest e `tsc` limpos; Proprietária confirma se o erro some.

## Fase B — Gravações que sempre falham

Cada tarefa começa lendo o CHECK real na migration (`supabase/migrations`) e `types.ts`.

| Tarefa                                        | Tam.          | Arquivos                                                                                                     | Aceite                                                                                                                              |
| --------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| B1 `enviarParaAssinatura` com valores válidos | M             | `contrato-parametros.functions.ts:2176`, `:2209-2233`                                                        | os 4 valores fora do CHECK (status, categorias, source_type) trocados pelo vocabulário existente; teste contra o CHECK              |
| B2 Conversa exige caso                        | S             | `crm-fluxo.functions.ts:287`, `desk-canonico.functions.ts:136`, `calls.tsx:303-318`                          | sem `case_id` a função recusa com mensagem clara; a tela mostra o erro em vez de engolir                                            |
| B3 Fatura `'aberta'` → vocabulário real       | S             | `golive.functions.ts:164`, `portal-cliente.functions.ts:154`, `portal-dados-vivos.functions.ts:191`          | leitores usam `emitida`/`pendente`/`vencida`; a RPC nível 6 que lê só `pendente`/`vencida` é migration: **vai para a Proprietária** |
| B4 Prioridade `urgente`                       | XS            | `ops.server.ts:28`, `desk-operacional.tsx`                                                                   | confirmar o CHECK no banco; se confirmado, o formulário oferece só `baixa/media/alta/critica`                                       |
| B5 `source_entity_type='app_projections'`     | S             | `uniao-ramos.functions.ts:146`, `biblioteca-evidencias.functions.ts:508`, `relatorios-fase.functions.ts:205` | valor aceito pelo CHECK `app_proj_source_ck`; teste de vocabulário                                                                  |
| B6 Versão de condição comercial               | S             | `condicao-comercial-caso.functions.ts:173-212`                                                               | criar rascunho não marca a versão aprovada como `substituida`; caso nunca fica sem condição vigente                                 |
| B7 Eventos de contrato fora do CHECK          | S             | `contract_review_events` (7 tipos), função `evento()`                                                        | tipos válidos; erro do `evento()` não é engolido                                                                                    |
| B8 `audit_logs` sem checar erro               | M por domínio | 28 pontos em contratos, 15 em genealogia, 8 em leads                                                         | helper único que verifica `.error` e registra falha; um PR por domínio                                                              |

**Checkpoint B:** teste de vocabulário que varre os escritores contra os CHECKs (a trava `scripts/reconciliar-codigo-banco.mjs` ganha essa checagem); CI verde.

## Fase C — Portal, convite e genograma da Ana

| Tarefa                             | Tam. | Arquivos                                                                                                                                       | Aceite                                                                                                                                                                                  |
| ---------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 Link mágico confere o envio     | S    | `src/lib/portal.server.ts` (`enviarLinkMagico`)                                                                                                | erro do `signInWithOtp` chega à tela; nunca "link enviado" sem envio                                                                                                                    |
| C2 Convite em duas gravações       | M    | `client_portal_access` + `client_portal_case_access`                                                                                           | falha do 2º insert não deixa linha órfã que bloqueie reconvite (arquivar com motivo, sem apagar); confere `demo` do caso × `is_demo` do acesso — **decisão sobre a forma de compensar** |
| C3 Portal sem erro engolido        | M    | `dadosVivosDoPortal`, `minhasEntregas`, `portalContexto`, `escopoDoPortal`, Home, Entregas, Fases, Legado                                      | erro vira aviso honesto, não "vazio" nem "sem permissão"                                                                                                                                |
| C4 Dados enganosos no App          | M    | Radar (100% de documentação), Conta (e-mail e telefone do titular), filtro de Documentos com `casoAtivo` nulo, `documents.is_demo` (4 lugares) | Radar usa o checklist canônico; Conta não mostra dado do titular a outros membros; sem `casoAtivo` mostra vazio, nunca tudo; filtro inerte removido                                     |
| C5 Prévia admin com paridade       | M    | `app-cliente-como-pessoa.functions.ts`                                                                                                         | devolve checklist, solicitações, etapa e histórico                                                                                                                                      |
| C6 Relação publicável no genograma | S    | `pessoas-linhagens.$caseId.tsx:1077`                                                                                                           | formulário de relação tem `client_visibility` e permite editar                                                                                                                          |
| C7 Despublicar acompanha arquivar  | S    | arquivamento de perfil → `app_projections`                                                                                                     | arquivar ou rebaixar visibilidade retira a pessoa da projeção, com histórico                                                                                                            |
| C8 Link para mensagens e tickets   | S    | abas do App → `/portal/casos/$id`, `/portal/mensagens/$id`                                                                                     | cliente alcança mensagens por uma das 7 abas                                                                                                                                            |

**Checkpoint C:** a Proprietária abre `/app-cliente-como-pessoa?casoId=` e confere as 7 abas; só depois disso se fala em convidar a Ana.

## Fase D — Documentos

| Tarefa                                | Tam. | Arquivos                                                                           | Aceite                                                                                                                                     |
| ------------------------------------- | ---- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 Curadoria antes de liberar         | M    | `liberarEntregaCliente` (`portal-atendimento.functions.ts:431`), `salvarDocumento` | liberar exige estado curado; INSERT já liberado passa pela mesma regra e gera auditoria — **decisão: qual é o estado mínimo de curadoria** |
| D2 `storagePath` validado             | S    | `documentos.functions.ts:133`, `:217`                                              | caminho precisa estar sob o prefixo do caso; teste com caminho de outro caso                                                               |
| D3 Duas rotas de "retirar do App"     | S    | Privacidade × portal                                                               | uma só regra; a tela de Privacidade já destravada (PR #223)                                                                                |
| D4 `STATUS_DOCUMENTO`                 | XS   | `pendente_de_revisao` ausente                                                      | lista alinhada ao CHECK                                                                                                                    |
| D5 Despublicar os 3 documentos da Ana | XS   | `supabase/pendentes/20261030180000`                                                | **ato da Proprietária** pela tela Privacidade (ou SQL aplicado por ela); antes de qualquer convite                                         |

## Fase E — Órfãos, planejador e infra

- **E1 (S)** Tarefa sem prazo nunca entra na RPC: `garantirTarefaAberta` (níveis 2 e 3).
- **E2 (S)** `sincronizarPlanejador` regrava `case_plans.status='rascunho'` e nenhum caminho promove para `ativo`: definir a promoção.
- **E3 (S)** Handoff lead → caso: atômico e sem `clienteId "null"` (`crm-fluxo`, `conversao.functions.ts:267`).
- **E4 (S)** Lead real (`/leads`, `/calls`) grava `conversion_events` e `crm_interactions`, com `origem='lead'` e `origem_id` (GoLive e CRM).
- **E5 (M)** Órfãos de família: `varredura-completude`, `inventario-recuperacao` e `corte-vertical` já estão em `/qualidade`. Para `decisao-ana-canonica`, `saneamento-desk-app-v4`, `app-visibilidade-registro` e `rascunhos-comunicacao-governados`: **decisão da Proprietária** (versão alternativa sem dado de família fixo, ou ficam fora do lançamento).
- **E6 (S)** CI que barra de fato: depois do alarme e da proteção da `main`, conferir que o `Supabase Preview` (aponta para o banco antigo) deixa de ser check exigido; remover restos da Vercel do repo.

## Decisões que só a Proprietária pode tomar

1. A4: qual tabela manda para organização e papel; "admin por padrão" sai?
2. B3: aplicar a migration que corrige a RPC de fatura (nível 6)?
3. C2: forma de compensar o convite incompleto.
4. D1: estado mínimo de curadoria para liberar documento.
5. E5: os 4 órfãos de família.
6. Divergência `crm_casos.contrato_assinado=true` × contrato `pending_data` (veio do SQL de 23/10).

## Ordem recomendada

A0 → A1/A2 → B1–B5 (paralelas, arquivos distintos) → C1/C3 → D2/D3 → C4–C8 → D1 → E. Checkpoints depois de A, B e C. O convite da Ana só depois de C1, C2 e D5.

## Achados sem tarefa ainda (todos os 12 relatórios, revisão de 02/11/2026)

Identificador F = achado de relatório ainda sem correção. Nenhum exige migration, exceto quando indicado.

| ID | Achado | Onde | Origem |
|---|---|---|---|
| F1 | `conversion_events` exige lead_id ou case_id, responsável nominal e evento anterior; o código viola e o contato já foi gravado quando o erro aparece | `crm-fluxo.functions.ts:189`, `:357-461`, `migracao.functions.ts:156` | persistencia-banco |
| F2 | Lead real (`/leads`, `/calls`, handoff) não grava `conversion_events` nem `crm_interactions`; handoff lead→caso não é atômico e pode devolver `clienteId "null"` | `leads.tsx`, `conversao.functions.ts:267` | crm-leads-calls |
| F3 | Escritas de negócio com erro engolido | `contrato-parametros.functions.ts:1225`, `:1618`; `jornada-cliente.functions.ts:286`; `achados-genealogicos.functions.ts:165-172`; `pessoas-linhagens.functions.ts:354`; `onboarding.functions.ts:290`; `handoff-discovery.functions.ts:242` | persistencia-banco |
| F4 | Guards que recusam não-admin e a UI não antecipa (`fn_cpv_guard`, `fn_app_projection_guard`, `fn_checklist_item_guard`, `fn_activation_check_guard`, `fn_case_plan_guard`) | banco | persistencia-banco |
| F5 | `UPDATE` em `audit_logs` sem policy de UPDATE; `casos` lido sem policy de SELECT | `contrato-preparar.functions.ts:99`, `catalogo-homologacao.functions.ts:67` | banco-esquema-rls |
| F6 | 27 tabelas sem FORCE RLS (168 de 195 têm) — **exige decisão e SQL pelo Lovable** | banco | banco-esquema-rls |
| F7 | Cabeçalhos "NÃO APLICADO" desatualizados em `20261024120000` e `20261020150000` | `supabase/pendentes/` | banco-esquema-rls |
| F8 | Convites residuais (org `b0fa3d42`, `0343f7b0`) e 2 contas auth não confirmadas: arquivar com autorização | banco | banco-esquema-rls |
| F9 | Aceite de convite nunca ativa nem sincroniza o vínculo (o `getContexto` agora refaz o vínculo, mas o aceite continua sem sincronizar) | `equipe.redefinir-senha.tsx:116` | auth-sessao |
| F10 | `registrarAssinatura` não cumpre os triggers de assinatura (versão renderizada, `approved_for_send_by`, `external_signature_*`) | `contratos.functions.ts` | contrato-comercial |
| F11 | `UPDATE` em `contract_parameter_previews` afeta 0 linhas para não-admin; valor contratado ignora `case_commercial_condition`; `invoice_adjustments` e `invoices.contract_id` sem escritor; preços fixos em `src/data/propostas.ts` | contrato | contrato-comercial |
| F12 | `garantirTarefaAberta` cria tarefa sem prazo (a RPC nunca a enxerga); `sincronizarPlanejador` regrava `case_plans.status='rascunho'` e nada promove a `ativo`; Painel Hoje só calcula `proxima_acao_prioritaria` para casos com `documentos_minimos_ok=false` | `cadeia-operacional.server.ts`, `painel-hoje-acoes.functions.ts` | jornada, crm |
| F13 | GoLive grava `crm_interactions` sem `origem='lead'` nem `origem_id`; `leads.ultimo_followup_em` sem escritor; `registrarPagamentoGoLive` e `aprovarMicroentregaGoLive` não escopam por caso; `publicarProjecaoApp` pula os guards de publicação; `registrarMembroNucleoGoLive` sem `cliente_id` nem `papel_no_caso` | `golive-*.functions.ts` | golive-casos |
| F14 | Cliente vê relação refutada ou hipótese; `filho` é ignorado pelo App; `salvarBlocoPesquisa` e `vincularEvidencia` não conferem o caso do registro; painel de pessoas faz INSERT dentro de um GET | `pessoas-linhagens.functions.ts`, `portal-dados-vivos.functions.ts` | pesquisa-genealogia |
| F15 | Capacidade só existe para admin; `proprietariaOperando` engole erro | `modo-proprietaria.ts:57-61`, `autoridade.server.ts` | desk-telas, jornada |
| F16 | O script de reconciliação não cobre CHECK nem NOT NULL; `reconciliacao-codigo-banco.json` desatualizado; `pesquisa-vocabulario-banco.test.ts` compara com cópia manual do CHECK | `scripts/reconciliar-codigo-banco.mjs` | persistencia-banco |

**Cobertura que falta (áreas não lidas a fundo):** `leads.tsx`, `painel-calls.tsx`, `casos.$caseId.index.tsx` e as ~25 funções do Caso 360, rotas de contratos/financeiro/propostas, `conciliacao-catalogo.server.ts`. Uma segunda rodada dos especialistas nessas áreas (com acesso ao banco) é a próxima etapa da auditoria.

