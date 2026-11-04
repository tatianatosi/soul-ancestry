# Realidade do lançamento — 03/11/2026, 17h UTC

O que está provado hoje, o que bloqueia o lançamento com a Ana (`CA-CID-AT-FAM-2026-001`) e o que sobrou de todos os planos anteriores. Tudo abaixo foi conferido hoje no banco vivo (só `SELECT`), no GitHub ou no código. Onde não remedi, está escrito.

Dono: **P** = Proprietária · **C** = Claude · **L** = Lovable.

## 1. O que está no ar

| Item                                    | Estado conferido                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Produção                                | `https://soul-ancestry.lovable.app/api/saude`: ok, `bancoOk`, sha `7dbf5716` = `main`                                                            |
| GitHub × Lovable                        | iguais (`latest_commit_sha` do Lovable = `main`)                                                                                                 |
| O que essa versão traz                  | A1, A2, A3, A4 (parte), B1 a B9, C1 a C8, E5, restauração de "Observações internas", conferência de acesso do Lovable, migration 0006 do Lovable |
| Erros do app desde a publicação (16h25) | 0 linhas `erro_app`                                                                                                                              |
| Gravações suas hoje                     | 1 linha em `audit_logs`. O app ainda não foi usado depois das correções                                                                          |

## 2. Bloqueios do lançamento com a Ana, em ordem

| #   | Bloqueio                                                                                | Estado hoje                                                                                                                                           | Dono                                      | Liberado quando                                                              |
| --- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | 3 documentos internos da Ana liberados ao cliente                                       | **3 continuam `liberado_cliente=true`**                                                                                                               | P                                         | Desk → Caso da Ana → Privacidade → "Retirar do App" nos 3                    |
| 2   | 8 vínculos familiares `aprovada` ao cliente com pesquisa `pendente` (nenhum confirmado) | **8 publicados**                                                                                                                                      | P decide, C executa                       | você decide: o cliente só vê vínculo confirmado, ou vê "provável" com rótulo |
| 3   | Contrato da Ana                                                                         | `approved_for_send` desde 02/11 18:19; gate financeiro `pending_contract`; **sem assinatura**. `crm_casos.contrato_assinado=true` continua divergente | P                                         | envio ao cliente, assinatura registrada e a divergência corrigida            |
| 4   | Plano do caso (`case_plans`)                                                            | `rascunho`. Com plano em rascunho o portal mostra fase e composição vazias                                                                            | P                                         | você registra próxima ação, responsável e prazo e ativa o plano              |
| 5   | Próxima ação da Ana                                                                     | o motor devolve `sem_nova_acao_necessaria` com prazo vencido (10/10)                                                                                  | C corrige o texto, P registra a ação real | ação real com prazo                                                          |
| 6   | Convite da Ana                                                                          | **venceu hoje às 14h25 UTC** sem primeiro login. Há também um acesso antigo `active` sem vínculo de caso                                              | P                                         | reconvite só depois dos itens 1 e 2; arquivar o acesso antigo                |
| 7   | Pagamento e fatura                                                                      | a correção de `conciliarPagamento` (pagamento parcial ou divergente libera portal e OS) ainda não foi feita                                           | C                                         | G1.1 e G1.2 mesclados e publicados                                           |
| 8   | Uso real pela equipe                                                                    | sem prova de uso depois das correções                                                                                                                 | P                                         | você usa Casos, Contratos e Privacidade e me diz onde falhar                 |

Itens 1, 2, 3, 4 e 6 são atos seus na sua sessão. Nenhum deles eu faço por SQL.

## 3. Auditorias

- **Rodada 1:** 12 relatórios entregues em 02/11.
- **Rodada 2:** 4 relatórios entregues em 03/11 (leads e calls, banco vivo, Caso 360, contratos e financeiro): 41 achados no Caso 360, 43 em contratos e financeiro, mais os de leads, calls e banco vivo; 11 P0 no total. Viraram as microtarefas G1 a G4 no backlog.
- **Não há relatório pendente.** Falta só a síntese oficial do Cartographer (`synthesize.py` e `FINAL_REPORT`), que não muda nenhuma tarefa, e a matriz das 195 tabelas (fase 4).

## 4. Órfãos (grafo regenerado hoje: 1.697 arquivos, 4.627 arestas)

**30 módulos sem importador de produção**, o mesmo número de 02/11. Os 3 religados ontem (saneamento V4, visibilidade por registro e rascunhos de comunicação) já não eram órfãos de arquivo, por isso o número não caiu.

| Veredito                  | Qtde | Significado                                                                             |
| ------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `APOSENTADA_CLASSIFICADA` | 15   | substituídos por versão viva; ficam fora de propósito (vários têm dado de família fixo) |
| `CASCA_DUPLICADA`         | 9    | existe tela viva que faz a mesma coisa                                                  |
| `AGUARDA_DECISAO`         | 4    | precisam da sua decisão                                                                 |
| sem veredito              | 2    | `src/data/saneamento.ts` e o próprio registro de órfãos                                 |

**Os 4 que dependem de você:**

1. `clube-ancestral-kit/preview-fixtures.ts`: dados de demonstração do kit visual. Recomendo aposentar.
2. `painel/painel-top30.tsx`: lista das 30 prioridades. Recomendo religar no Painel Hoje.
3. `lib/agenda-assistida.ts`: sugere reunião e pede confirmação. Religar só se a agenda entrar no lançamento.
4. `lib/fontes-documentos-rls.ts`: regras de visibilidade de fontes. Recomendo aposentar, porque a regra vive no banco (RLS).

**Eu fecho sem decisão sua:** dar veredito a `src/data/saneamento.ts` (C).

## 5. Planos anteriores: o que não foi executado

Revisei `PLANO-MESTRE-LANCAMENTO-2026-10-30`, `PLANO-TAREFAS-2026-10-31`, `PLANO-EXECUTAVEL-2026-11-01` e `PLANO-EXECUCAO-ORFAOS-E-SYNC-2026-11-01`. O que ficou feito por outra via saiu da lista.

### Ficou feito depois (não precisa mais)

- N9 sha em `/api/saude` (agora mostra `7dbf5716`); R5 publicar; O4/O5 registro e teste de órfãos; E2 `pipeline.py`; W1 a W3 e W4d; R2; P1; H1 a H3 e H5 a H7 (o contrato está `approved_for_send`); E1 parcialmente (journal do drizzle com 7 entradas iguais aos 7 arquivos).

### Seus (P)

| Origem          | Tarefa                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| J1 = bloqueio 1 | Retirar do App os 3 documentos                                                                                             |
| J2 = bloqueio 6 | Acesso da Ana; convite de Adair e Alice (falta o CPF real da Alice)                                                        |
| J3              | Consentimento do lead: os 12 leads estão `nao_solicitado`                                                                  |
| J4              | Documento de representação do Felipe (menor)                                                                               |
| J5              | Nome do pai: "Adair Gomes Silveira" × "Adair Pinto Silveira Júnior" (não remedido hoje)                                    |
| J6 = bloqueio 2 | Perfis e vínculos aprovados ao cliente                                                                                     |
| J7              | Documentos-fonte: `case_source_documents` = **0** hoje                                                                     |
| J8              | Encontros de linha: `lineage_encounters` = **0** hoje (só com evidência)                                                   |
| J10             | Publicar o `resumo_caso` pendente                                                                                          |
| J12             | Uso autenticado de cada motor para `COMPROVADO_EM_USO`                                                                     |
| H8/H9           | Enviar o contrato ao cliente e registrar a assinatura; há 2 rascunhos `awaiting_approval` na fila de comunicação           |
| H10             | Depois da assinatura: ativar contrato e cobrança, autorização por item                                                     |
| R1              | Projeto no Sentry e `SENTRY_DSN` no Lovable (não conferido hoje)                                                           |
| R4              | PRs antigas abertas: #32, #97, #102, #104, #105, #108, #110, #114, #117, #118, #120, #121, #125. Decidir fechar com motivo |
| —               | #202 (Observações internas) já está na `main` por outra PR: pode fechar. #212, #215, #217, #222 seguem abertas             |
| —               | **#230 nova**: "retira a regra reservation-sync". Não fui eu; precisa da sua decisão antes de mesclar                      |
| N5, N6          | Kit Contratual (de onde vêm produto, valor e meio de pagamento da OS); se `estados-edicao` vira a regra única de edição    |
| O2, O3          | Piloto 5A.1 e `radarMarcosJuridicosDoPainel`: tela própria ou fora                                                         |

### Meus (C)

| Origem       | Tarefa                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| E3 = P3      | `gravarComVerificacao` só avisa no console quando a releitura diverge (56 arquivos) e regrava fora da organização. Unido a G2.9                 |
| E4 = F7      | Cabeçalhos "NÃO APLICADO" desatualizados em `supabase/pendentes/`                                                                               |
| O6, O10, O11 | Veredito de `src/data/*` e teste de órfãos cobrindo todo o `src`                                                                                |
| O7           | `botao-testar-cliente.tsx` (aposentado) ainda tem `TODO:`                                                                                       |
| O9           | `clausulasDoTema` na Matriz Jurídica (só leitura), com a sua confirmação                                                                        |
| W4a, W4b, N1 | Painel Hoje e Governança: os módulos do Painel Hoje foram classificados como casca ou aposentados; falta religar `painel-top30` se você decidir |
| N3, N4       | Portal sem dado fixo da Ana (`anexos-tres-camadas.ts` com o retrato de 22/08)                                                                   |
| N8           | Teste que renderiza as telas religadas                                                                                                          |
| N10          | Trava contra o formatador reescrever arquivo grande                                                                                             |

## 6. Ordem que proponho

1. **Você, hoje:** bloqueio 1 (retirar os 3 documentos) e decisão do bloqueio 2 (vínculos).
2. **Eu, em PRs pequenos:** G1.1 a G1.3 (pagamento e OS), G2.2 e G2.3 (bloqueios e botões escondidos no Caso 360), G3.1 a G3.3 (calls), G4.3 e G4.4 (touchpoint e próxima ação).
3. **Você:** registrar a próxima ação real, ativar o plano, enviar o contrato e decidir os 4 órfãos.
4. **Publicar** com o seu "pode publicar", conferir `/api/saude` e ler `erro_app`.
5. **Reconvite da Ana**, só com os itens 1, 2 e 6 resolvidos.
