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
| LC-05 / A–O | A EXECUTAR | — | — | — | — | — | — | — | Escolher item A–O não reservado após a fila chegar à main |
| LC-06 / L, M | A EXECUTAR | — | — | — | — | — | — | — | PR nativo com JSON de evidências agent=Lovable |
