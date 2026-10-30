# Plano mestre — jornada da Ana ponta a ponta (remedido em 30/10/2026)

Substitui, como fila de trabalho, o "Plano mestre — jornada da Ana fechada ponta a ponta (medido em 04/10/2026)". O plano de 04/10 fica como histórico.

Método: cada número abaixo foi medido hoje no banco do Lovable Cloud (somente `SELECT`) e no código de `main` (`ecbf1c3`). Onde não medi, está escrito "não remedido".

Caso: `CA-CID-AT-FAM-2026-001` (`crm_casos` `a11a…0002`), contrato `a11a…c1`.

## 1. O que mudou desde 04/10

| Item | 04/10 | 30/10 | Situação |
|---|---|---|---|
| Páginas do Canva | 7 extraídas | 7 extraídas | igual |
| Parâmetros do contrato | completude 74% | **95%**, status `rascunho`, revisão humana em 05/10, sem aprovação | avançou |
| Campos obrigatórios vazios | 5 (excluídos, despesas, prazos, SKU, dependentes) | **1: `ancestral_referencia`** (e `modo_anexos`, não obrigatório) | avançou |
| Origem dos 32 valores | — | validado 29, `importado_a_confirmar` 1, vazio 2; origem `proposta` 7, `preenchimento_humano` 10, `planejador` 11 | Canva já alimenta |
| Campos com conflito | — | **5**: `beneficiarios`, `contratante_contato`, `escopo_resumo`, `partes_signatarias`, `representacao_legal` | novo; parte está desatualizada (ver P0-3) |
| Contrato | 1, `rejected` | 1, **`pending_data`**, não assinado | mudou |
| Partes do contrato | 5 corretas | 5 | igual |
| Anexos | I/II `missing`, III–V `not_applicable` | I–V `not_applicable`; **ANEXO_II duplicado** (uma linha `not_applicable`, outra `drafting`); 6 anexos ANX-* em `drafting` | avançou, com duplicidade |
| Relações de pesquisa | 1 | **11** (`research_relationships`) | feito |
| Relações / eventos / variantes genealógicas | 0 / 0 / 0 | **8 / 7 / 10** | feito |
| Perfis genealógicos | — | 11, **8 aprovados** para o cliente | publicado em parte |
| Plano de ação (`research_action_plan_items`) | 0 | **76**, **0 com custo estimado** | estrutura feita, sem custo |
| Encontros de linha (`lineage_encounters`) | 0 | 0 | pendente (depende de evidência) |
| Documentos do caso | 0 | **3**, liberados ao cliente, `origem = interno` | ver P0-2 |
| Documentos-fonte (`case_source_documents`) | — | **0** (em todos os casos) | pendente |
| Lead de origem | nenhum | **ligado**: lead real, origem Google, Discovery preenchido, consentimento `nao_solicitado` | feito, consentimento pendente |
| Bloqueios do piloto abertos | 19 (24/10) | **0** | resolvido |
| Caso ativado | não ativado em 24/10 | `ativado_em` 25/10 | feito |
| Acesso do cliente ao portal | — | **0** linhas em `client_portal_case_access` | pendente |
| Descrições de campo (`inventario-campos-abas.ts`) | 0 | **0** | pendente |
| Testes | 503 arquivos / 4.876 | **601 / 5.793**, **13 falhando** (10 arquivos) | `main` vermelha |

## 2. Situação dos cortes do plano de 04/10

| Corte | Situação em 30/10 | Evidência |
|---|---|---|
| A — Canva alimenta os parâmetros | **Feito** | `preencherParametrosDoCanva` em `src/lib/contrato-parametros.functions.ts`; 7 valores com origem `proposta` |
| B — Partes canônicas e anexos | **Feito, com resto** | `montarPessoasContratuais` lê `contract_parties` e declara divergência de nome; anexos I–V `not_applicable`. Resto: ANEXO_II duplicado |
| C — Checklist §58c com todos os campos | **Parcial** | 76 itens no plano de ação; `DE_PARA_CAMPOS_CHECKLIST` existe; custo, aprovação de despesa, pagador e prazo vazios (0 de 76 com custo); flags `exigeCusto`/`exigeAprovacaoDespesa` não existem em `dossie-58c.ts` |
| D — Árvore e dados genealógicos | **Feito** (salvo encontros) | 11 relações, 7 eventos, 10 variantes; `lineage_encounters` 0 |
| E — Discovery e origem comercial | **Feito**, consentimento pendente | `crm_casos.lead_id` ligado; consentimento `nao_solicitado` |
| F — Religar os 10 órfãos | **Feito** | as 9 funções nomeadas têm uso em tela; `ativarCaso` virou `ativarCasoComChecks` em `/onboarding/$id`. Não conferi se `orfaos-classificados.ts` foi reclassificado |
| G — Tabela de campos e rotas | **Pendente** | 0 descrições em `inventario-campos-abas.ts`; a tabela de rotas virou teste parcial (`corte-0-religar-rotas-evidencia-2026-10-02.test.ts`) |
| H — Contrato de Uma Hora | **Parcial, parado em você** | 95%; falta `ancestral_referencia`, aprovação dos parâmetros, prévia final congelada, aprovação da revisão e assinatura |

## 3. Pendências acumuladas nesta semana (29–30/10)

- **13 testes de apresentação vermelhos** na `main` desde 25/10. O CI não funciona como portão enquanto isso durar.
- **PR #199** (rascunho): releitura estrita em `salvarRegistroG02` (resgate da #32), README de `supabase/pendentes/` e `pipeline.py`.
- **`gravarComVerificacao` e `inserirComVerificacao`** só avisam no console quando a releitura diverge (desde a #190, 24/10). Afeta 56 arquivos do Desk.
- **Caminho tolerante** em `gravarComVerificacao`: grava por `id` fora da organização da sessão quando a RLS permite.
- **Contradição de visibilidade:** os 3 arquivos estão `interna` em `evidencias` e liberados em `documents`.
- **`20261024170000_ativacao_cede_a_proprietaria.sql`** sem linha `ESTADO:`; `scripts/sync-check.sh` acusa.
- **16 PRs abertas antigas** em conflito com a `main` (de 1 a 451 arquivos) e 28 branches `lovable-sync*` (5 redundantes).
- **Publish no Lovable:** os merges recentes não mudam o app; não houve Publish por mim.

## 4. Fila de tarefas

Dono: **C** = Claude Code (em branch e PR), **L** = chat do Lovable (banco), **P** = Proprietária.
"Pronto quando" é o critério que fecha a tarefa; prova autenticada da Proprietária continua obrigatória para marcar motor como comprovado (`AGENTS.md`).

### P0 — destrava o que já está quase pronto

| # | Tarefa | Dono | Pronto quando |
|---|---|---|---|
| P0-1 | Decidir os 13 testes vermelhos: para cada um, o teste está certo (corrigir a tela) ou a tela está certa (atualizar o teste) | P decide, C executa | CI verde na `main` |
| P0-2 | Decidir os 3 documentos liberados: manter, trocar por versão sanitizada ou voltar a `liberado_cliente = false`; alinhar com `evidencias` | P decide, C propõe SQL em `supabase/pendentes/`, L aplica | `documents` e `evidencias` com a mesma visibilidade |
| P0-3 | Recalcular os 5 conflitos dos parâmetros: parte deles cita o telefone antigo e "nascimento não informado", corrigidos no banco em 30/10 | C | `conflito` vazio onde a divergência sumiu; os restantes declarados |
| P0-4 | Preencher `ancestral_referencia` (único obrigatório vazio) a partir do dossiê e da árvore já cadastrada | C propõe, P confirma | completude 100% |
| P0-5 | Resolver o ANEXO_II duplicado (`not_applicable` × `drafting`) sem apagar linha: arquivar o que sobra, com motivo | C | um ANEXO_II vivo |
| P0-6 | Revisar e mesclar a PR #199 | P | merge |

### P1 — fecha o contrato e o portal da Ana

| # | Tarefa | Dono | Pronto quando |
|---|---|---|---|
| P1-1 | Aprovar os parâmetros do contrato (95% → 100%, `rascunho` → aprovado) | P | `aprovado_em` preenchido |
| P1-2 | Gerar a prévia final congelada e registrar a revisão humana aprovada | C prepara, P aprova | versão congelada, revisão aprovada |
| P1-3 | Assinatura: ato externo, fica parado no nome da Proprietária | P | estado de assinatura registrado |
| P1-4 | Liberar o acesso da Ana ao portal (`client_portal_case_access`), depois de P0-2 | P | 1 acesso ativo e prova autenticada |
| P1-5 | Consentimento do lead (D-01): `nao_solicitado` → coletado | P | consentimento registrado |
| P1-6 | Representação do Felipe: documento real de representação do menor | P | status documentado |

### P2 — completa a pesquisa dentro da plataforma

| # | Tarefa | Dono | Pronto quando |
|---|---|---|---|
| P2-1 | Trazer os documentos-fonte do dossiê para dentro (`case_source_documents`, hoje 0): inventário da pasta do caso no Drive, depois envio pela tela Pesquisa → Fontes | C faz o inventário, P/equipe envia | cada documento com tipo, pessoa e arquivo na plataforma |
| P2-2 | Custo, aprovação de despesa, pagador e prazo nos 76 itens do plano de ação, só onde houver fonte | C estrutura, P informa valores | itens dependentes de terceiro com custo ou "sem fonte" declarado |
| P2-3 | Flags `exigeCusto` / `exigeAprovacaoDespesa` / `instituicaoProvavel` no template §58c (resto do Corte C) | C | teste cobrindo o template |
| P2-4 | `lineage_encounters`: registrar quando houver evidência; nada inferido | equipe | encontros com evidência |
| P2-5 | Publicar os 3 perfis ainda não aprovados para o cliente, se for o caso | P | decisão registrada |

### P3 — saneamento da esteira e do código

| # | Tarefa | Dono | Pronto quando |
|---|---|---|---|
| P3-1 | Endurecer `gravarComVerificacao`/`inserirComVerificacao` (divergência vira erro) e decidir o caminho tolerante fora da organização | P decide, C executa por módulo | testes por módulo |
| P3-2 | Linha `ESTADO:` em `20261024170000_ativacao_cede_a_proprietaria.sql` | C (com autorização para tocar `supabase/pendentes/`) | `sync-check.sh` sem bloqueio |
| P3-3 | Fechar as 16 PRs antigas em conflito, uma a uma, depois de conferir que a casca V4 as superou; revisar as 23 `lovable-sync*` com commit próprio e apagar as 5 redundantes | P decide, C prepara a lista | PRs fechadas com motivo |
| P3-4 | Descrição do que cada campo coleta em `inventario-campos-abas.ts` e as abas que faltam; tabela de rotas virada em teste (Corte G) | C | 0 campos sem descrição |
| P3-5 | `pipeline.py`: decidir entre aposentar o script ou adotar a versão sem push na `main` (PR #199) | P | decisão registrada |
| P3-6 | Publish no Lovable após cada merge que mude o app (regra 5 de 23/10) | C/P | publicado no mesmo dia |

## 5. Decisões que continuam com a Proprietária

| # | Decisão | Por quê |
|---|---|---|
| 1 | Os 13 testes vermelhos (P0-1) | o `roadmap.md` veda mudar cópia ou teste sem decisão |
| 2 | Visibilidade dos 3 documentos da Ana (P0-2) | conteúdo interno não pode chegar ao App sem curadoria |
| 3 | "Adair Gomes Silveira" (Canva/condição) × "Adair Pinto Silveira Júnior" (cadastro) | nome real não se funde por semelhança. Não remedido hoje |
| 4 | Aprovar parâmetros, revisão e assinatura (P1-1 a P1-3) | atos dela |
| 5 | Acesso da Ana ao portal e consentimento (P1-4, P1-5) | efeito externo e LGPD |
| 6 | `painel-dia.tsx` × `/painel` | segue aguardando decisão (`AGENTS.md`) |
| 7 | `COMPROVADO_EM_USO` com prints autenticados | só ela |

## 6. Verificação de cada corte

`npx tsc --noEmit` → teste de comportamento novo → `npx vitest run` (linha de base em 30/10: 601 arquivos / 5.793 testes, 13 falhas preexistentes) → `bun run build` → `scripts/sync-check.sh --full` → commit com os trailers → push da branch → PR. Merge e Publish só com autorização da Proprietária. Dado real do caso entra por canal auditado: SQL proposto em `supabase/pendentes/` e aplicado pelo Lovable, ou pela ferramenta de banco do Lovable com autorização explícita.
