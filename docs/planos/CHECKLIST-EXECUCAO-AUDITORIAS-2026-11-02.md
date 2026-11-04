# Checklist de execução — auditorias do Cartographer e do Understand (02/11/2026)

Atualizado a cada tarefa executada. Cada linha separa três provas diferentes, porque código pronto não é app funcionando:

- **Código:** commit e teste que passa (`tsc` e vitest).
- **Banco/produção:** conferido contra o banco vivo ou contra o app publicado. "Não" quer dizer que ainda não foi mesclado e publicado.
- **Uso:** a Proprietária usou a função no app e funcionou. Só ela fecha esta coluna.

Legenda: ✅ feito e provado · 🟡 feito em parte · ⬜ não feito · ➖ não se aplica.

## Fases do plano (`PLANO-AUDITORIAS-CARTOGRAPHER-UNDERSTAND-2026-11-02.md`)

| Fase                                                                                    | Estado                                                          | Evidência                                                                         | Falta                                                 |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1. Cartographer, ondas 2 e 3                                                            | ✅ 7 de 7 relatórios                                            | arquivos em `.cartographer/reports/` (pasta local da sessão, fora do git)         | nada                                                  |
| 2. Cartographer, onda 1 que faltou | ✅ 3 de 3 | `.cartographer/reports/` | nada |
| 3. Síntese e triagem | 🟡 backlog com F1–F16 e G1–G4 (rodada 2, 03/11) | `synthesize.py` e `FINAL_REPORT` não rodaram | síntese oficial (não muda tarefas) |
| 4. Understand de novo e matriz do grosso | 🟡 grafo regenerado em 03/11 (1.697 arquivos, 30 órfãos) | `docs/grafo/` | matriz das 195 tabelas |
| 5. Correções | 🟡 A, B, C e E5 publicados; D, F e G pendentes | PRs #223–#229 | D1–D5, F1–F16, G1–G4 |
| 6. Publicação e leitura de erros reais | ✅ publicado `7dbf5716` em 03/11; 0 `erro_app` desde a publicação | `/api/saude` | uso real pela Proprietária |
| 7. Lançamento com um cliente (Ana) | ⬜ bloqueado | `REALIDADE-LANCAMENTO-2026-11-03.md` | 8 bloqueios listados lá |

## O que o banco vivo mostrou (A0, lido em 02/11/2026)

- `audit_logs` com `acao='erro_app'`: **43 linhas** em ~3 horas. O coletor funciona.
- 16 são `h3_swallowed` (erro 500 na renderização). A pilha mostra `/dev-server/...`: vêm do **servidor de desenvolvimento do Lovable** (a prévia do editor), não da publicação. O coletor não guardava a rota; corrigido (ver B9).
- 26 são `request_middleware` com "aborted" ou "This operation was aborted": requisição cancelada ao navegar ou recarregar. Ruído, filtrado (ver B9).
- 1 `leitura` "Failed to fetch" em `/contratos/…`, 1 `teste_manual` (o meu).
- Papéis: 2 linhas em `user_roles` (ambas `admin`), 2 em `organization_members`, 12 em `staff_access`, 7 usuários.
- Vocabulário real do banco: `app_proj_source_ck` aceita `evidence, finding, lineage, event, milestone, case`; `tarefas_prioridade_chk` aceita `baixa, media, alta, critica`; `invoices_status_check` aceita `rascunho, emitida, pendente, parcialmente_paga, paga, vencida, cancelada`; `invoices.status` real: `emitida` 1, `rascunho` 1.

## Tarefas do backlog

| Tarefa                                                   | Código                                                                                                    | Banco/produção                                                                                                                            | Uso                                                                            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| A0 Provar a causa (ler o banco)                          | ➖                                                                                                        | ✅ leitura acima; **ainda não prova** que `getContexto` falha para a admin: os 43 erros não incluem `getContexto` com erro de autorização | ⬜                                                                             |
| A1 Erro real quando o contexto falha                     | ✅ `autoridade-operacional.ts`, `autoridade.tsx` + teste                                                  | ✅ publicado `7dbf5716` (03/11) | ⬜                                                                             |
| A2 `AcaoOperacional` com aviso de falha                  | ✅ `acao-operacional.tsx`                                                                                 | ✅ publicado `7dbf5716` (03/11) | ⬜                                                                             |
| A3 "Salvo" só quando houve linha alterada | ✅ PR #226 + teste | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| A4 Resolvedor único de papel e organização | 🟡 `getContexto` lê os erros, sem admin por padrão, refaz o vínculo (PR #226); os outros resolvedores seguem | ✅ publicado `7dbf5716` (03/11) (parte feita) | ⬜ |
| B1 `enviarParaAssinatura` com valores válidos | ✅ `contrato-parametros.functions.ts` (status `draft`, categorias `contracted_scope`/`exclusion`, status do item e `source_type` válidos) + teste | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| B2 Conversa exige caso                                   | ✅ `crm-fluxo.functions.ts`, `desk-canonico.functions.ts`                                                 | ✅ publicado `7dbf5716` (03/11) | ⬜                                                                             |
| B3 Fatura: `emitida/pendente/vencida`                    | ✅ 5 arquivos + testes P27 atualizados                                                                    | ✅ publicado `7dbf5716` (03/11) | ⬜ (a RPC nível 6 segue lendo só `pendente`/`vencida`: é migration, fica fora) |
| B4 Prioridade de tarefa                                  | ✅ `ops.server.ts` (`critica`)                                                                            | ✅ publicado `7dbf5716` (03/11) | ⬜                                                                             |
| B5 `source_entity_type` de `app_projections`             | ✅ União de Ramos, entregas, relatórios de fase + testes                                                  | ✅ publicado `7dbf5716` (03/11) | ⬜                                                                             |
| B6 Versão de condição comercial | ✅ PR #226 + teste | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| B7 Eventos de contrato fora do CHECK | ✅ `evento()` mapeia para os 16 tipos aceitos (nome original em `metadata.tipo_original`), deixa de engolir erro, leitor do "manter com motivo" ajustado + teste | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| B8 `audit_logs` sem checar erro | ✅ `registrarAuditoria` em 83 pontos de 44 arquivos (PR #227) | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| B9 Coletor: filtrar cancelamento e guardar a rota do 500 | ✅ `producao-erros.server.ts`, `server.ts` + 3 testes                                                     | ✅ publicado `7dbf5716` (03/11) | ➖                                                                             |
| C1 Link mágico confere o envio                           | ✅ `portal.server.ts`                                                                                     | ✅ publicado `7dbf5716` (03/11) | ⬜                                                                             |
| C2, C5, C6, C7 Convite, prévia admin, genograma, despublicar | ✅ PR #226 + testes | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| C3 Portal sem erro engolido | ✅ PR #226 | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| C4 Dados enganosos no App | ✅ PR #226 | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| C8 Link para mensagens do caso | ✅ PR #226 | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| D1–D5 Documentos | ⬜ (a tela de Privacidade foi destravada) | ⬜ 3 documentos da Ana seguem liberados (03/11) | ⬜ |
| E5 Órfãos de família | ✅ `saneamento-desk-app-v4`, `app-visibilidade-registro` e `rascunhos-comunicacao-governados` agora aparecem em Qualidade, em "Dados fixos no código", cada bloco rotulado como retrato fixo ou DEMO, só leitura + teste; `decisao-ana-canonica` já vive em `case_aliases` (3 códigos lidos do banco) | ✅ publicado `7dbf5716` (03/11) | ⬜ |
| E1–E4, E6 Planejador, handoff, infra | ⬜ | ⬜ | ⬜ |
| Restauração de "Observações internas" (#202)             | ✅ `contratos.$id.tsx` + teste                                                                            | ✅ publicado `7dbf5716` (03/11) | ⬜                                                                             |

## Como cada tarefa passa a ✅ de verdade

1. Código: teste novo que falha antes e passa depois; `tsc` limpo; suíte `src/lib` verde.
2. Banco/produção: PR mesclado e publicado, depois conferir `/api/saude` (sha e `bancoOk`) e a linha no banco ou a tela.
3. Uso: a Proprietária usa a função; qualquer falha aparece em `audit_logs` (`erro_app`) e entra neste checklist.

## Achados novos dos relatórios da onda 1 (02/11/2026)

| Achado | Estado | O que falta |
|---|---|---|
| `public.has_role` não existia no banco; 3 triggers a chamavam (publicar entrega de documento, liberar fatura, assinatura externa) | ✅ aplicado em 02/11 pelo Lovable Cloud (arquivo `20261102160000_cria_has_role.sql`); banco conferido antes e depois | testar no app: publicar entrega de um documento e liberar uma fatura (uso: Proprietária) |
| Os 3 documentos da Ana seguem liberados ao cliente | ⬜ | "Retirar do App" no Desk (tela destravada no PR #223), na sessão da admin |
| Convite da Ana (`client_portal_access` 820b628e) está `invited`, sem primeiro login, expira em 03/11/2026 14:25 UTC | ⬜ | decidir se reenvia; enquanto `invited` a Ana não vê nada |
| `sincronizarVinculo` roda só no login por senha e falha em silêncio; aceite de convite nunca ativa o vínculo (`equipe.functions.ts:130`, `equipe.redefinir-senha.tsx:116`) | ⬜ | corrigir no código (A4) |
| `resolverOrganizacao` cria organização para qualquer autenticado sem vínculo (`saas.functions.ts:372`) | ⬜ | corrigir no código (A4) |

## Atualização de 02/11/2026 (tarde)

- Publicado: `main` `703b6579` no ar em `https://soul-ancestry.lovable.app` (`/api/saude`: ok, bancoOk, sha `703b6579`). Contém #223, #224 e #225 (trabalho do Lovable).
- Na branch `claude/backlog-a3-a4-b6-b8-c2-c8` (sem PR ainda): A3, A4, B6, C3, C4, C8 — `tsc` limpo e suíte `src/lib` com 675 arquivos e 6.189 testes passando.
- Ainda não feito: B8 (cerca de 90 inserts de `audit_logs` sem checar erro), C2/C5/C6/C7 (agente em andamento), D1–D5, F1–F16 do backlog.


## Atualização de 03/11/2026, 17h UTC

- **Publicado:** `main` `7dbf5716` no ar (`/api/saude`: ok, `bancoOk`, sha `7dbf5716`). Contém #226 (A3, A4 em parte, B6, C2–C8), #227 (B8) e #229 (sincronização com o trabalho do Lovable). Nenhum `erro_app` desde a publicação; o app ainda não foi usado depois dela.
- **Auditoria completa:** os 4 relatórios da rodada 2 chegaram. Viraram as microtarefas G1 (dinheiro e contrato), G2 (Caso 360), G3 (leads e calls) e G4 (banco vivo, pesquisa e portal) no backlog. Não há relatório pendente.
- **Realidade do lançamento:** `docs/planos/REALIDADE-LANCAMENTO-2026-11-03.md` (8 bloqueios, órfãos e tarefas dos planos anteriores não executadas).

| Tarefa | Código | Banco/produção | Uso |
|---|---|---|---|
| G1 Dinheiro e contrato (18 microtarefas) | ⬜ | ⬜ | ⬜ |
| G2 Caso 360 diz a verdade (12) | ⬜ | ⬜ | ⬜ |
| G3 Leads e calls (7) | ⬜ | ⬜ | ⬜ |
| G4 Banco vivo, pesquisa e portal (8) | ⬜ | ⬜ 3 documentos e 8 vínculos publicados; convite venceu | ⬜ |
| F1–F16 | ⬜ | ⬜ | ⬜ |
