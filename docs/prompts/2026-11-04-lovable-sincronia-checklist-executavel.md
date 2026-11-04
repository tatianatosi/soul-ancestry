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
| [x] K01/K02 (autorização de pesquisa) | JÁ FEITO COM EVIDÊNCIA | — | busca no código: nenhum gravador usa "autorizada" puro; único uso só repassa o valor lido | — | — | — | Varredura de todas as CHECKs do banco ainda não feita |
| [ ] B01/B02 | EM EXECUÇÃO | — | texto do instrumento sem corte por CSS (busca); "Salvar rascunho" existe | — | — | — | Clicar em Salvar cria versão real: não clicado sem sua confirmação |
| [ ] Conferência Ana | BLOQUEADO_POR_CAUSA | — | site publicado como a Ana → /acesso/sem-permissao | — | — | Publicação pedida 22:00 | Acesso `invited`, nunca ativado; convite venceu em 03/11 14:25 UTC |
