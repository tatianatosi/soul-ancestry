# Lovable — sincronia e checklist contínuo (v1.0, aprovado 2026-11-04)

Instrução integral da Proprietária de 04/11/2026 18:47. Este arquivo guarda apenas o estado LC do executor Lovable;
a fila canônica continua sendo `docs/execucao/FILA_DE_MICROCORTES_AUTORIZADA_v2.md` (IDs A–O/Q), que deve receber
estas linhas quando estiver presente na base do Lovable. Não é fila independente.

Regras: sem branch fixa `lovable`, sem auto-merge, sem restaurar reservation-sync (removido na PR #230).
Reservas são lidas no corpo das PRs e verificadas pelo Sync Guard quando executa; não há trava em tempo real.

| ID original / LC | Estado | Alteração/arquivos | Base e head | Teste e evidência | PR/commit | Main | Banco | Publicado | Próxima ação/causa |
|---|---|---|---|---|---|---|---|---|---|
| LC-01 / L01 | TESTADO | `AGENTS.md` (linha reservation-sync substituída) | base edição `0b842aee` | workflows na base: alarme-regressao-main, ci, label, sync-guard, sync-report; `rg reservation-sync` sem instrução ativa | edição interna Lovable | Não integrado | Não se aplica | Não publicado | Integrar via sincronia nativa |
| LC-02 / M, Q | BLOQUEADO_POR_CAUSA | este arquivo | base `0b842aee` | `docs/execucao/` ausente na base do Lovable | — | Não integrado | Não se aplica | Não publicado | Fila v2 só existe nas refs #233/#231; copiar seção LC quando chegar à main |
| LC-03 / A02, A03 | BLOQUEADO_POR_CAUSA | — | — | Lovable não lê logs de CI do GitHub nesta sessão | #233 | — | — | — | Claude/Proprietária obtêm log do typecheck-test-build da #233 |
| LC-04 / Q01–Q08 | BLOQUEADO_POR_CAUSA | — | — | `scripts/triagem-branches-e-docs.mjs` ausente na base | — | — | — | — | Depende da integração da #231/#233 |
| LC-05 / A–O | BLOQUEADO_POR_CAUSA | — | releitura 2026-11-04 22:00 UTC, head `47c3dfbb` | `docs/execucao/` e `scripts/triagem-branches-e-docs.mjs` ainda ausentes | — | — | — | — | Itens A–O só são identificáveis pela fila v2; aguardar integração das #233/#231 |
| LC-06 / L, M | A EXECUTAR | — | — | — | — | — | — | — | PR nativo com JSON de evidências agent=Lovable |

## Esteira direta 04/11 22:03 (execução Lovable sem PRs externas)

| ID | Estado | Arquivos | Teste e evidência | Main | Banco | Publicado | Observação |
|---|---|---|---|---|---|---|---|
| [x] A01 | TESTADO | `src/lib/modo-proprietaria.ts` | `staff-vigente.test.ts` + `__tests__/modo-proprietaria.test.ts` verdes; tipos sem erro | Não integrado | Não se aplica | Não | `admin` ≡ `proprietaria_administradora` |
| [x] A04 | TESTADO | `src/lib/saas.functions.ts`, `src/lib/staff-vigente.ts` | 3 testes da escolha do acesso vigente; prévia abriu o contrato como Proprietária sem "sem permissão" | Não integrado | Não se aplica | Não | Ativo mais recente; erro de leitura continua explícito |
| [x] C01 | TESTADO | `contratos.$id.tsx` (Partes), `contratos.functions.ts` | 3 testes no servidor; prévia 1280/375 sem rolagem lateral, "CPF inválido." aparece ao digitar; CPF das partes mascarado | Não integrado | Nenhuma escrita | Não | Nenhuma parte gravada no teste |
| [x] C03 | TESTADO | `src/routes/portal/conta.tsx` | build OK | Não integrado | Não se aplica | Não | Só o WhatsApp formatado; CPF/CEP não aparecem no App por regra |
| [x] K01/K02 (autorização de pesquisa) | JÁ FEITO COM EVIDÊNCIA | — | busca no código: nenhum gravador usa "autorizada" puro; único uso só repassa o valor lido | — | Leitura 04/11 22:27 UTC | — | Varredura das CHECKs feita (8 regras com "autoriza"): nenhuma aceita "autorizada" puro; pesquisa usa `nao_autorizada`/`autorizada_interna`/`autorizada_externa`/`suspensa`. Item fechado |
| [x] B01/B02 | TESTADO | — | prévia 04/11 22:12 UTC: clique em "Salvar rascunho" sem janela extra; v7 `working` criada e lida após recarregar; v6 segue `approved_for_send` | Não integrado | v7 gravada (autorizada pela Proprietária) | Publicação pedida 22:11 | Nada enviado, assinado ou cobrado |
| [ ] Conferência Ana | BLOQUEADO_POR_CAUSA | — | site publicado como a Ana → /acesso/sem-permissao | — | — | Publicação pedida 22:00 | Acesso `invited`, nunca ativado; convite venceu em 03/11 14:25 UTC |
| [ ] Painel Agentes (MCP) no Desk | TESTADO (sem cadastro real) | `integracoes.functions.ts`, `integracoes.server.ts`, `components/integracoes/agentes-mcp.tsx`, `centro.tsx`, `_authenticated/integracoes.tsx`; migration `0007_integrations_categoria_agente_mcp` | prévia 1280/375 sem rolagem lateral; estado vazio honesto | Não integrado | CHECK de categoria ampliado com `agente_mcp` (aplicado) | Não | Reusa `integrations` (cadastro/perfil) e `integration_runs` (visitas); nenhum agente criado no teste; não há servidor MCP ligado |

## Integração à main — LC-07 a LC-14 (instrução v1.0 de 04/11 22:26)

Correção registrada: `0b842aee` é commit do Lovable, não a main; a main real lida pela Proprietária é `4dcf374a`. "Publicado" ≠ "na main".

| ID | Estado | Evidência | Main | Banco | Publicado | Próxima ação/causa |
|---|---|---|---|---|---|---|
| [x] LC-07 | TESTADO | head Lovable `961ccad5` (04/11 ~22:30 UTC); 26 arquivos vs `4dcf374a`: `.lovable/plan/retomar-a-sincronia-checklist-lc-2026-11-04.md`, `AGENTS.md`, este checklist, `drizzle/migrations/0007_*` (+ snapshot, journal), `roadmap.md`, `src/components/desk/prazos-contratuais-caso.tsx`, `src/components/integracoes/{agentes-mcp,centro}.tsx`, `src/lib/{__tests__/prazos-contratuais-2026-11-03.test.ts,contrato-liberacao.functions.ts,contrato-liberacao.ts,contrato-partes-validacao.test.ts,contratos.functions.ts,integracoes.functions.ts,integracoes.server.ts,modo-proprietaria.ts,prazos-contratuais.ts,saas.functions.ts,staff-vigente.test.ts,staff-vigente.ts}`, `src/routes/_authenticated/{casos.$caseId.index,contratos.$id,integracoes}.tsx`, `src/routes/portal/conta.tsx`. Nenhum coincide com os arquivos da #233 | Não integrado | — | Publicação pedida 22:25 | O head muda a cada edição do Lovable; reler antes da PR |
| [ ] LC-08 | BLOQUEADO_POR_CAUSA | O Lovable não abre PR nem lê CI do GitHub nesta sessão (git de escrita é gerido pela plataforma) | — | — | — | Proprietária/Claude abrem PR da `lovable-sync-*` mais nova → main, merge commit, JSON agent=Lovable, base `4dcf374a`, tested_sha = head do branch |
| [ ] LC-09 | AGUARDA LC-08 | — | — | — | — | Colar o trecho vermelho do log se o CI falhar |
| [ ] LC-10 | AGUARDA LC-08 | — | — | — | — | Após merge: Lovable confere a main e republica com "pode publicar" |
| [~] LC-11 | EM ANÁLISE | Banco 04/11: `case_commercial_condition` já tem gatilho `zz_admin_approval_boundary` (de 02/11) que exige `contract_pode_aprovar(org)` para aprovar ou alterar conteúdo aprovado; o alerta é de 30/10, anterior ao gatilho. Verificação básica 04/11 22:35: sem achados (não cobre a análise profunda que gerou o alerta) | — | Nenhuma escrita | — | Rodar a verificação profunda após a integração; se o alerta persistir, propor SQL em `supabase/pendentes/` e aguardar autorização |
| [ ] LC-12 | BLOQUEADO (ato da Proprietária) | Leitura 04/11: os 3 documentos (`6ff8741d…`, `bf5cdce1…`, `ca8da621…`) continuam `liberado_cliente = true`, `status = liberado` — ainda visíveis ao App. Vínculos (P2) não decididos | — | Somente leitura | — | Desk → Privacidade → "Retirar do App" nos 3; decidir vínculos; só então reconvite |
| [ ] LC-13 | AGUARDA #233 | `docs/execucao/` ausente na base Lovable | — | — | — | Mover linhas LC para a fila v2 quando a #233 entrar |
| [ ] LC-14 | AGUARDA LC-08 | — | — | — | — | Registrar `lovable-sync-*` como cobertas após merge; #222 → SUPERADO com decisão da Proprietária |
