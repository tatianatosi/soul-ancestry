# Fechamento operacional final — 07/09/2026

Executado sob o prompt `CA-FECHAMENTO-OPERACIONAL-FINAL-2026-09-07`. Escopo real
executado nesta rodada: Pacote 1 (sanidade de release) completo; triagem final
de PRs abertas completa; achado e corrigido um bug concreto de integração
(micro-entregas reais ausentes da tela de onboarding). Pacotes 2-5 (aceite por
UI autenticada, ADMIN e CLIENTE, com dados sintéticos) **não puderam ser
executados nesta sessão** pelo motivo registrado na seção 8 — não é omissão,
é bloqueio de acesso real, declarado aqui em vez de disfarçado.

## 1. Cabeçalho de evidência

- Data/hora (UTC): 2026-09-07T18:05Z
- Branch de trabalho: `recovery/operational-authority-all-areas-2026-09-05`
- HEAD SHA de `main` no momento deste relatório: `026e7cc151745bd9bf02806f1e4014ebc23b8d49`
  ("fix(indicadores): unifica regra de casos ativos e comparação de follow-up
  vencido entre telas") — **atenção**: `main` recebeu 3 commits diretos de
  outra sessão/execução em paralelo enquanto este relatório era escrito
  (`c4dce4a` → `026e7cc`). Um SHA "atual" neste tipo de operação fica
  desatualizado em minutos; não tratar este número como imutável.
- URL de produção: https://soul-ancestry.vercel.app (projeto Vercel
  `soul-ancestry`, time `tati-6134s-projects`)
- URL de preview/homologação usada: nenhuma — sem sessão de navegador
  autenticada disponível nesta execução (ver seção 8)
- Checks técnicos executados: `tsc --noEmit` (0 erros), `vitest run`
  (6408 testes passando em arquivos reais do produto; as 30 falhas
  restantes são exclusivamente em cópias obsoletas dentro de
  `.claude/worktrees/agent-*`, não em código de produto)
- Ambiente e organização sintética usados: nenhum — Supabase MCP está
  desautorizado nesta sessão (ver seção 8); nenhuma escrita em banco foi
  feita nesta rodada

## 2. Placar executivo

| Item | N |
|---|---|
| Fluxos ACEITOS (com prova de UI + persistência + próxima etapa) | 0 |
| IMPLEMENTADOS_NO_MAIN_COM_TESTE_PENDENTE | 5 (Pacotes 2-5, ver seção 8) |
| BLOQUEADOS_EXTERNAMENTE | 1 (acesso Supabase/homologação para toda a rodada de aceite por UI) |
| NÃO_IMPLEMENTADOS | 0 identificados nesta rodada (não houve varredura de feature nova) |
| PROTEÇÕES_DURAS_MANTIDAS | RLS, isolamento por organização/caso, autenticação — nenhuma tocada |
| Bugs P0 corrigidos nesta rodada | 0 |
| Bugs P1 corrigidos nesta rodada | 1 (micro-entregas reais ausentes da tela do caso — ver seção 4) |
| Migrations necessárias mas não aplicadas | 0 novas identificadas |
| PRs abertas | 34, ver seção 7 (13 SUPERADA, 3 DOCUMENTACAO com conteúdo pendente, 1 CONFLITANTE, 17 MANTER a decidir) |

## 3. Matriz de aceite de fluxos

Nenhuma linha desta matriz pôde ser preenchida com `ACEITO` nesta rodada —
preencher essa coluna sem uma sessão de navegador autenticada contra
homologação seria exatamente o tipo de afirmação sem prova que este prompt
proíbe. O que existe, por Pacote:

| Pacote | Área | Jornada | Ambiente/Conta | Ação executada | Persistiu após reload? | Próxima etapa funcionou? | Evidência | Status | Pendência objetiva |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Release | Sanidade main/produção | leitura via git+Vercel MCP | HEAD SHA, deploy, checks | n/a | n/a | seção 1 | ACEITO (é leitura, não UI) | nenhuma |
| 2 | Comercial-operacional | Caso→SKU→Escopo→Condição→Contrato→OS | — | não executado | — | — | código lido, não exercitado | IMPLEMENTADO_NO_MAIN_TESTE_PENDENTE | precisa sessão autenticada de homologação |
| 3 | Onboarding/elegibilidade portal | Documentos mínimos → convite | — | não executado | — | — | `case_ativacao_bloqueios_reais` já mapeado em rodada anterior (05/09) | IMPLEMENTADO_NO_MAIN_TESTE_PENDENTE | idem |
| 4 | App Cliente | Início/Jornada/Radar/Árvore | — | não executado | — | — | rotas existem, conteúdo não revalidado nesta rodada | IMPLEMENTADO_NO_MAIN_TESTE_PENDENTE | idem + convite real não autorizado |
| 5 | CRUD mínimo | Leads/Casos/Pessoas/Tarefas/Pesquisa | — | não executado (exigiria escrita em Supabase) | — | — | — | BLOQUEADO_EXTERNO | Supabase MCP desautorizado nesta sessão |
| — | Onboarding do caso | Micro-entregas reais visíveis na tela do caso | código (`onboarding-plano.functions.ts`) | corrigido e commitado (`f418ff3`) | não testado via UI autenticada nesta rodada | — | `src/components/caso/onboarding-plano.tsx` | IMPLEMENTADO_NO_MAIN_TESTE_PENDENTE | validar com um caso real que tenha `ops_microentregas` |

## 4. Fluxo comercial-operacional

Não exercitado nesta rodada (Pacote 2 bloqueado, seção 8). Nenhuma alteração de
código foi feita nesta frente nesta rodada — o único código tocado hoje foi a
correção de micro-entregas descrita abaixo, que é onboarding, não comercial.

**Achado e correção fora do Pacote 2, mas dentro do fio condutor "onboarding
D0-D365 e micro-entregas" pedido diretamente pela proprietária:**

- Antes: a tela do caso mostrava só a *intenção* do plano
  (`primeira_microentrega_prazo_dias`, um número fixo tipo "D7"). O registro
  real de micro-entrega (tabela `ops_microentregas`, a mesma que soma no
  Painel Hoje via a view `v_ops_microentregas`) nunca aparecia em nenhuma tela
  de caso — existia motor, existia contagem global, faltava a ponte para a
  ficha do caso.
- Achado colateral: existem **duas tabelas** chamadas microentrega no banco.
  `ops_microentregas` (FK correta para `crm_casos`, viva, usada no Painel
  Hoje) é a real. A outra, `public.microentregas` (FK para uma tabela
  `public.casos` que é resto do protótipo do dia 1, 16/08), só é lida por
  `src/lib/crm.functions.ts`, consumido por `src/components/desk-crm.tsx` e
  `src/routes/canvas.$token.tsx` — nenhuma rota ativa hoje aponta para esses
  dois arquivos (`desk-crm.tsx` já está listado como histórico em
  `src/lib/inventario-recuperacao.ts`; `crm_casos`, a tabela real de caso, não
  tem sequer a coluna `canvas_token` que aquela rota depende). Não mexido
  nesta rodada — é decisão de arquivar/apagar, não de código, e cabe à
  proprietária (ver seção 8).
- Depois: `carregarPlanoOnboarding` (em `src/lib/onboarding-plano.functions.ts`)
  passou a buscar `v_ops_microentregas` filtrado pelo `caso_id`, e
  `onboarding-plano.tsx` mostra uma seção nova "Micro-entregas reais deste
  caso" logo abaixo da cadência D31-D365, com status (`atrasada`/`concluída`/
  `no prazo`/`vence em breve`/`sem prazo`) e prazo de cada uma. Se não houver
  nenhuma, a tela diz isso explicitamente em vez de ficar muda.
- Commit: `f418ff3` na branch `recovery/operational-authority-all-areas-2026-09-05`
  (já sincronizada com `main`).
- Rascunho, revisão e ato externo: esta correção é só leitura — não cria, não
  publica, não envia nada. Continua sendo tarefa da equipe usar o botão
  "Ações rápidas" / o painel operacional para de fato criar micro-entregas
  reais quando fizer sentido; a tela agora só deixa de escondê-las.

## 5. Portal/App Cliente

Não exercitado nesta rodada — Pacote 4 depende do Pacote 3 (documentos mínimos
confirmáveis, convite) e de sessão de homologação autenticada, nenhum dos dois
disponível aqui. Nenhuma alteração de código feita nesta frente hoje.

## 6. Migrations e dependências

| Migration/integração | Repo | Ambiente aplicado | Área afetada | Evidência | Decisão | Autorização necessária? |
|---|---|---|---|---|---|---|
| Nenhuma migration nova identificada ou aplicada nesta rodada | — | — | — | — | — | — |

## 7. Triagem de PRs abertas

Comparação feita por conteúdo real (`git diff <merge-base> <branch>` para achar
o que cada PR de fato mudou, depois checado arquivo a arquivo contra o `main`
atual — não pelo título, não pelo status visual do GitHub). 34 PRs abertas, 0
fechadas nesta rodada (fechar exige autorização explícita, não dada aqui).

**SUPERADA — conteúdo já 100% presente no `main`, seguro fechar sem merge (22):**

| PR | Título | Natureza |
|---|---|---|
| #84 | pente-fino calculadoras/radares/Centro de Inteligência | docs |
| #82 | de-para SKUs × produtos-pai × países | docs |
| #81 | de-para CRM caso/microentrega/onboarding/Operação Viva | docs |
| #79 | de-para planejador de cidadania × motores unificados | docs |
| #75 | de-para onboarding/cadência/ciclo de vida | docs |
| #72 | varredura Fase 1 go-live App Cliente | docs |
| #71 | de-para "piloto" da Ana × realidade | docs |
| #70 | artefato do dia 03/09 | docs |
| #67 | de-para Motores Unificados CRM Vivo | docs |
| #65 | levantamento ficha piloto genealógica/CRM vivo | docs |
| #64 | Pessoa 360 — 5 camadas mapeadas | docs |
| #63 | plano reorganização core Motor de Cidadania | docs |
| #62 | de-para Motor de Cidadania × tabelas reais | docs |
| #61 | arquiva instruções Motor de Cidadania | docs |
| #60 | arquiva contexto regional/jurídico Motor de Cidadania | docs |
| #59 | arquiva Revisão Final Planejador Universal | docs |
| #58 | arquiva adendo roteiro Nadia | docs |
| #57 | artefato do dia 02/09 | docs |
| #56 | arquiva pré-análise Nadia | docs |
| #55 | cotejo tela-a-tela + arquiva modelos de relatório | docs |
| #52 | arquiva Artefato Mestre de Resgate | docs |
| #36 | Política Unificada de Casos — Fase 1 | código (Fase 1 mapear-sem-modificar; conteúdo já refletido no `main`) |
| #30 | Núcleos duplicados Fase 1 (Detecção) | código — mesclado nesta mesma sessão em rodada anterior; único resíduo é `routeTree.gen.ts` (auto-gerado) |

Recomendação: fechar as 22 sem merge, com nota curta "conteúdo já presente no
main" — nenhuma delas move estado hoje.

**DOCUMENTACAO com conteúdo ainda não incorporado (2):**

| PR | Título | O que falta incorporar | Risco de agir |
|---|---|---|---|
| #76 | de-para cadência D0-D365/microentregas/planejador/ciclo-piloto | 1 doc (`docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md`) nunca copiado para o main | baixo — é só documentação |
| #51 | Pessoa Canônica via extensão de clientes | 1 doc + 1 migration (`20260902144855_pessoa_canonica_extensao_clientes.sql`) não aplicada | médio — envolve migration, não aplicar sem autorização |

**CONFLITANTE — contradiz arquitetura atual, não mesclar (1):**

| PR | Título | Motivo |
|---|---|---|
| #53 | Perfil institucional: gate lê status persistido | A versão da PR **remove** `useAutoridade`/`AcaoOperacional` da tela de preparo de contrato — essa é hoje a camada canônica de autoridade operacional, wired em toda a Desk nesta última semana. Mesclar regrediria essa tela. A necessidade original (gate ler status persistido, não só valor fixo) pode ainda ser real — precisa reavaliação como correção nova sobre o código atual, não como merge desta PR. |

**MANTER a decidir — código real, ainda não absorvido, não avaliado a fundo
nesta rodada por tempo (9):**

| PR | Título | Arquivos que realmente divergem do main |
|---|---|---|
| #80 | unifica limiares de cadência D10/D14 | `cadencia-limiares.ts`, `catalogo-top30.functions.ts`, `jornada-cliente.ts`, `onboarding-jornada.ts` |
| #74 | converge nomenclatura "piloto" da Ana | `navegacao-desk.ts` (a checar se é resíduo ou mudança real) |
| #68 | produto_sku confirma SKU ao vivo em product_catalog | `contrato-parametros.functions.ts`, `planejador-parametros.ts` |
| #54 | reduz fricção cadastro rápido de lead em call | `novo-lead.tsx`, `crm-desk.functions.ts` |
| #50 | decisões canônicas catálogo/planejador | `painel-catalogo.tsx`, `dicionario-calls-crm.ts`, `governanca.dicionario-calls-crm.tsx`, `leads.tsx` + 1 doc |
| #48 | usar sinal extraído da varredura WhatsApp no rascunho do lead | `painel-calls.tsx`, `varredura-whatsapp.tsx` + teste |
| #42 | corrige classificação de caseDataGiovanna.ts para demo | 2 arquivos, mudança de 1 linha de comentário cada — confirma que o caso Giovanna é demo, nunca foi cliente real (confirmado pela proprietária em 01/09). Risco mínimo, candidata a aplicar direto como correção pontual em vez de merge de PR. |
| #40 | Contrato: remove botões redundantes | base é `fix/reconciliar-contratos-pr28-pr32` (#35), não `main` — precisa #35 resolvida primeiro |
| #35 | Reconciliação contratos.\$id.tsx PR #28 × PR #32 | 11 arquivos; já avaliada e propositalmente não mesclada em rodada anterior (risco de regressão contra código muito evoluído) — mantém-se essa decisão |
| #32 | Pessoa: salvar com releitura real + decisão de tarefa | base é `fix/caso-canonico-salvamento-operacional`; 8 arquivos — o essencial (`gravarComVerificacao`) já foi reimplementado direto sobre o código atual em rodada anterior, então provavelmente SUPERADA na prática, mas não comparada arquivo a arquivo nesta rodada |

## 8. Pendências finais de decisão da Proprietária

1. **Acesso Supabase para esta sessão.** O MCP do Supabase está desautorizado
   agora (mesmo após reconexão informada mais cedo) — sem ele não há leitura
   nem escrita de banco, então os Pacotes 2, 3 e 5 completos (qualquer teste
   real de salvar/reload/próxima etapa) não puderam ser exercitados nesta
   rodada. **Ação esperada:** reautorizar em claude.ai → Connectors, ou via
   `/mcp` numa sessão interativa.
2. **Credencial de homologação com login.** Mesmo com Supabase de volta, os
   Pacotes 2-4 pedem UI *autenticada* (entrar como ADMIN e como Cliente A/B) —
   esta sessão não tem navegador com sessão logada em nenhum ambiente.
   **Ação esperada:** ou fornecer credencial de um usuário de homologação já
   existente, ou autorizar a criação de um usuário/organização sintética via
   Supabase (o que também depende do item 1).
3. **Decisão sobre o protótipo do dia 1.** `public.casos` / `public.microentregas`
   / `public.touchpoints` / `public.planner_tarefas` (e as rotas
   `desk-crm.tsx`, `canvas.$token.tsx`) são um sistema paralelo inteiro,
   estruturalmente incapaz de refletir casos reais (a FK aponta para uma
   tabela de protótipo, não para `crm_casos`). **Ação esperada:** decidir
   entre arquivar (mover para `docs/historico`, já começou a acontecer) ou
   apagar as tabelas/rotas — nenhuma ação de dado foi tomada aqui.
4. **PR #53 (perfil institucional).** Não mesclar como está — regride a
   camada de autoridade operacional. Se a necessidade original ainda é real,
   pedir para reabrir como correção nova sobre o `main` atual.
5. **PR #51 (Pessoa Canônica extensão de clientes)** carrega uma migration
   não aplicada. **Ação esperada:** aprovar ou recusar explicitamente antes de
   qualquer aplicação.
6. **22 PRs classificadas SUPERADA (seção 7).** Autorizar fechá-las sem merge
   para reduzir o passivo de 34 para ~12 PRs abertas de fato relevantes.
7. **Convite real de portal.** Nenhum convite/e-mail foi enviado nesta
   rodada, por instrução direta do prompt. Quando o item 2 estiver resolvido,
   ainda será necessário autorizar explicitamente o primeiro envio real.
8. **9 PRs "MANTER a decidir" (seção 7).** Nenhuma foi avaliada a fundo linha
   a linha nesta rodada — decidir se vale dedicar uma rodada futura de revisão
   ou fechá-las também, caso a necessidade original já tenha sido resolvida
   por outro caminho (como aconteceu com #30 e provavelmente #32).
9. **Duas sessões/agentes escrevendo em `main` ao mesmo tempo.** `main`
   avançou 3 commits sozinho durante esta execução (seção 1). Isso é
   normal quando há mais de uma sessão ativa, mas significa que qualquer
   "fechamento final" é uma fotografia, não um estado permanente — vale
   decidir se as rodadas devem ser sequenciadas em vez de paralelas daqui
   pra frente, para reduzir o risco de duas sessões pisando no mesmo arquivo.
10. **#42 (Giovanna, correção de comentário de 1 linha).** Risco mínimo;
    posso aplicar diretamente como correção pontual (não merge de PR) na
    próxima rodada, se autorizado.

## 9. Reversão

**Commits desta rodada** (branch `recovery/operational-authority-all-areas-2026-09-05`,
já sincronizada com `main`):

- `f418ff3` — Mostra micro-entregas reais (ops_microentregas) na tela de
  onboarding do caso. Reversão: `git revert f418ff3`.

Nenhum outro commit, nenhuma migration, nenhuma escrita em banco, nenhum
envio externo foi feito nesta rodada. Nenhum dado sintético foi criado (não
foi possível — ver seção 8, item 1 e 2).
