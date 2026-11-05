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
| [x] LC-08 | TESTADO | Correção: o Lovable abre PR pela conexão GitHub do projeto. PR #234 (`lovable-sync-1793831954`) com JSON agent=Lovable; guard e typecheck-test-build verdes em `6468d9fd` | `a1e6f7a1` | — | — | — |
| [x] LC-09 | TESTADO | CI vermelho lido: #234 (coluna `crm_casos.client_id` inexistente, painel MCP sem aviso F5, validação das partes não detectada, testes A04/U1 desatualizados); #233 (mock de `staff_access` esperava `maybeSingle`). Corrigidos sem remover teste nem check | #233 `5424728a`, #231 `fe7a2687`, #232 `dc39a6e9` | — | — | — |
| [~] LC-10 | PUBLICAÇÃO PEDIDA | Publicação solicitada após os merges (04/11 ~23:20). `/api/saude`: `ok`, `bancoOk`, mas `sha: null` | `fe7a2687` | — | Pedida | Igualdade publicado = main não comprovada: o publicado não expõe o sha |
| [~] LC-11 | EM ANÁLISE | Banco 04/11: `case_commercial_condition` já tem gatilho `zz_admin_approval_boundary` (de 02/11) que exige `contract_pode_aprovar(org)` para aprovar ou alterar conteúdo aprovado; o alerta é de 30/10, anterior ao gatilho. Verificação básica 04/11 22:35: sem achados (não cobre a análise profunda que gerou o alerta) | — | Nenhuma escrita | — | Rodar a verificação profunda após a integração; se o alerta persistir, propor SQL em `supabase/pendentes/` e aguardar autorização |
| [ ] LC-12 | BLOQUEADO (ato da Proprietária) | Leitura 04/11: os 3 documentos (`6ff8741d…`, `bf5cdce1…`, `ca8da621…`) continuam `liberado_cliente = true`, `status = liberado` — ainda visíveis ao App. Vínculos (P2) não decididos | — | Somente leitura | — | Desk → Privacidade → "Retirar do App" nos 3; decidir vínculos; só então reconvite |
| [~] LC-13 | EM CURSO | #233 integrada: `docs/execucao/` na main. Fila v2 seguida a partir do bloco A (seção abaixo) | — | — | — | Mover as linhas LC para `docs/execucao/` num corte de documentação |

## Fila v2 — bloco A (04/11 23:45, execução Lovable)

| ID | Estado | Arquivos | Teste | Main | Banco | Publicado | Observação |
|---|---|---|---|---|---|---|---|
| [x] A01, A04 | JÁ FEITO | — | PR #234 | `a1e6f7a1` | — | Pedida | — |
| [x] A02, A03 | JÁ FEITO | — | PR #233 | `5424728a` | — | Pedida | — |
| [x] A05 | TESTADO | `src/lib/escopo-conferencia.server.ts` | `fila-a05-a08-proprietaria-2026-11-04.test.ts` | PR #235 `e02902fc` | Nenhuma escrita | Não | Proprietária assume a pendência interna no ato; auditoria `gate_superado_por_decisao_proprietaria` com `origem: proprietaria_assumiu_no_ato`; ação externa segue na confirmação |
| [x] A06 | TESTADO (parcial no servidor) | `src/routes/api/pesquisa-assistente.ts` | mesmo teste | PR #235 `e02902fc` | Nenhuma escrita | Não | Tentativa sem autorização grava `analysis_blocked_research_not_authorized` (usuário, motivo, tela). Gate de formalização já gravava `gate_formalizacao_bloqueado`. `decidirAcao=bloquear` no navegador só ocorre sem identidade/organização: não vira log para não gerar ruído |
| [x] A07 | TESTADO | `src/lib/autorizacao-pesquisa.ts`, `src/components/pesquisa/registrar-autorizacao.tsx`, `src/components/pesquisa/assistente.tsx`, `src/lib/saas.functions.ts` | mesmo teste (valores = CHECK da migration 20260821135341) | PR #235 `e02902fc` | Nenhuma escrita no teste | Não | Antes o painel do assistente mostrava o JSON cru do 409; agora mostra "Registrar autorização" com os 4 valores reais |
| [x] A08 | TESTADO | — | mesmo teste: todas as capacidades × ações externas × pendência, papéis `admin` e `proprietaria_administradora` | PR #235 `e02902fc` | — | — | Nenhuma combinação devolve "bloquear" com identidade e organização |
| [x] Ruído de teste | TESTADO | `src/lib/producao-erros.server.ts` | `coletor-erro-sem-ruido-de-teste-2026-11-04.test.ts` | PR #235 `e02902fc` | 7 linhas `erro_app` de teste (23:12 e 23:18 UTC) ficam no histórico; nada apagado | Não | A suíte local não grava mais erro falso no banco real |
| [x] A09 | TESTADO | `src/lib/erros-e-recusas.ts`, `src/lib/qualidade.functions.ts`, `src/components/qualidade/erros-e-recusas.tsx`, `src/routes/_authenticated/qualidade.tsx` | `a09-erros-e-recusas-2026-11-04.test.ts`; prévia autenticada 1280/375 sem rolagem lateral: 93 erros em 13 situações agrupadas, 7 registros de teste ocultos por padrão | PR #235 `e02902fc` | Sem SQL: a política `audit_select_admin` já permite a leitura ao admin da organização (lida em 04/11) | Não | Desk → Radar & Matrizes → "Erros do app e recusas" |
| [x] Hidratação | TESTADO | `src/components/desk/fonte-alimento.tsx` | prévia: aviso "details dentro de p" sumiu do console | PR #235 `e02902fc` | — | Não | Afetava toda tela do Desk com a faixa "Alimento" |
| [x] Exclusão física em `contract_validation_results` | JÁ CORRIGIDO | — | leitura do código e da função do banco (05/11) | — | Recusada pelo banco (correto) | — | Não há `.delete()` no código; a revalidação atual (`validate_contract_readiness`) arquiva os resultados antigos com `archived_at`/`archived_by` |
| [ ] LC-14 | AGUARDA LC-08 | — | — | — | — | Registrar `lovable-sync-*` como cobertas após merge; #222 → SUPERADO com decisão da Proprietária |

## Fila — bloco B, contrato (05/11 00:30, execução Lovable)

| ID | Estado | Arquivos | Teste | Main | Banco | Publicado | Observação |
|---|---|---|---|---|---|---|---|
| [x] B01 | JÁ FEITO | — | — | antes de #235 | — | — | Texto real da versão: botão "Ver o texto real da versão vN" (prévia HTML) em Versões; PDF/DOCX em "Documento do instrumento". Não criei segundo leitor |
| [x] B02 | JÁ FEITO (decisão da Proprietária) | — | prévia 04/11 22:12: v7 `working` | antes de #235 | v7 gravada (autorizada) | — | Campos salvam no ato; "Salvar rascunho" grava nova versão, como a Proprietária testou e aprovou em 04/11 |
| [x] B03 | TESTADO | `src/lib/contratos.functions.ts`, `src/routes/_authenticated/contratos.$id.tsx` | `fila-b03-b05-contrato-2026-11-04.test.ts` | via PR | Nenhum contrato cancelado no teste | Não | "Cancelar contrato" com motivo obrigatório: status `cancelled` + `cancellation_reason`, linha do tempo do caso; assinado/cancelado/arquivado não cancela; separado de Arquivar |
| [x] B04 | TESTADO | mesmos | mesmo teste | via PR | — | Não | "Enviar ao cliente" leva a `/atendimento?rascunho=<id>`, inclusive quando o rascunho já existia |
| [x] B05 | TESTADO | `src/lib/decisao-humana-contrato.ts`, `src/components/contrato/decisao-humana-atual.tsx`, `contratos.$id.tsx` | mesmo teste; prévia autenticada 1280/375 sem rolagem lateral | via PR | Só leitura | Não | Ana: "A versão 6 está aprovada para envio. A versão 7, mais recente, está em preparação. 2 bloqueio(s) formal(is)…"; selo "Sem atos externos automáticos" |
| [x] B06, B07 | JÁ FEITO | — | prévia 375 sem rolagem lateral (05/11) | antes de #235 | — | — | Sete cartões já existem com resumo/estado/âncora; tabela de versões vira cartões no celular |
| [x] B08 | JÁ FEITO (código) | — | gatilho `fn_contracts_guard` lido em 05/11 | antes de #235 | — | — | `registrarAssinatura` grava `signed`+`signature_reference`+`signed_at` e o banco recusa sem versão renderizada, revisão humana, condição comercial e pendências; `crm_casos.contrato_assinado=true` da Ana veio da reconciliação autorizada de 23/10 (`requisitos_portal_reconciliados`) — mudar isso é decisão da Proprietária |
