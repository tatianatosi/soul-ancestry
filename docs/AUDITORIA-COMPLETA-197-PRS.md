# Auditoria completa das Pull Requests — `tatianatosi/soul-ancestry`

**Data:** 2026-10-26 · **Base medida:** `main` em `125f749d` ("Apliquei a paleta completa") · **Branch mais avançado:** `claude/modest-carson-28pij2` (25 commits à frente de `main`, não mesclado) · **Trabalho somente de leitura:** nenhum arquivo de produto, commit, push, merge ou migration foi tocado.

## 0. Cobertura real e correções de premissa (leia antes do resumo)

Três premissas do pedido precisam de correção factual, cada uma verificada com comando:

1. **Não existem 197 PRs. Existem 195.** Os números `#107` e `#133` nunca foram Pull Requests (são números consumidos por issues). Verificação: `gh api "repos/tatianatosi/soul-ancestry/pulls?state=all&per_page=100&page=N"` em 3 páginas → 195 registros, `min=1`, `max=197`, faltando exatamente `[107, 133]`. **Auditei 195 de 195 — cobertura completa, sem amostragem.**

2. **O histórico de `main` NÃO foi reescrito nem comprimido.** O ambiente estava com clone *shallow*. Antes: `git rev-parse --is-shallow-repository` → `true`. Depois de `git fetch --deepen=5000`: `false` e `git rev-list --count HEAD` → **5887 commits**. O "achado grave" de 330 commits da auditoria anterior era artefato do ambiente. Está descartado.

3. **A hipótese "praticamente TODAS as PRs pararam na fase 1" não se sustenta nos números, mas a preocupação de fundo se sustenta — em outro lugar.** A medição por PR mostra 104 COMPLETAS. O que existe de verdade é um **volume grande de código de produto morto (122 módulos de produção inalcançáveis)**, e a maior parte dele **não entrou por PR**: entrou por commits diretos de sincronização do Lovable (assunto `Changes` / `Work in progress`), que a numeração de PR não cobre. Ou seja: a parada na fase 1 é real, mas é majoritariamente **pré-PR e extra-PR**, não um padrão das PRs. Isso muda a priorização e está detalhado na seção 3.

### Como cada veredicto foi medido (método reproduzível)

- **Alcançabilidade:** grafo de imports de todo `src/` (1568 arquivos), resolvendo `@/`, caminhos relativos, `index.ts` e `await import("./x")`. Raízes = `src/routes/**`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routeTree.gen.ts`. Resultado: **808 alcançáveis, 760 não**. Dos 760, **583 são testes** (`src/lib/__tests__`), **38 são primitivos shadcn não usados** e **122 são módulos de produção de fato mortos**. Os testes não são achado.
- **Órfão só é chamado de órfão com grep de importador retornando zero fora de `__tests__`.** Importador em teste não conta como uso de produto (o teste prova que a função calcula, não que alguém a vê).
- **"Ilha morta"** = o arquivo tem importador, mas o importador também é inalcançável. Citada como tal, nunca como "órfã".
- **Atribuição de arquivo morto → PR** feita pelo diff que o próprio GitHub reporta (`status: added`), não por adivinhação. Quando o arquivo nasceu em commit direto do Lovable, isto está dito.
- **Respeitei a regra de não confundir função parecida com duplicação.** Exemplo verificado: `src/components/desk/kanban-tarefas.tsx` aparece como inalcançável, mas `src/routes/_authenticated/tarefas.tsx:60` traz o comentário explícito *"src/components/desk/kanban-tarefas.tsx (não usada aqui, para não …)"* — é peça **estacionada de propósito**, não esquecimento.

---

## 1. Resumo executivo

Das **195** PRs existentes: **104 COMPLETAS** (o que prometeram está no código e alcançável por um usuário), **45 DOC APENAS** (zero `src/`), **25 ABERTAS nunca mescladas**, **6 fechadas sem merge**, **1 fechada com 0 commits**, **7 FASE 1 SÓ**, **4 SUPERADAS**, **3 só SQL/migration** (2 delas explicitamente pendentes de aplicação no banco).

O gargalo de lançamento não está na contagem de PRs incompletas: está em **três acúmulos**. (a) **122 módulos de produção inalcançáveis** convivendo com os vivos, concentrados em Painel/Hoje antigo, Contrato/Formalização e dados de demo — a maioria nascida de commits diretos do Lovable, antes e fora das PRs. (b) **25 PRs abertas**, várias competindo pela *mesma* superfície (cinco propostas distintas para a navegação do Desk: #99, #111, #112, #115, #116, mais a #119 fechada) — é fila de decisão da Proprietária, não falta de código. (c) **motores do App Cliente que existem, têm teste, e nenhuma tela chama** — o padrão que a Proprietária descreve, confirmado de forma cirúrgica em 4 arquivos.

Contraponto honesto e importante: o padrão "writer existe e nenhuma tela lê" está **sob governo** na camada de servidor. Das **548 `createServerFn` exportadas**, apenas **24 não têm referência em `src/routes|src/components|src/hooks`**, e os **9 módulos** que as contêm estão todos inventariados com veredicto em `src/lib/orfaos-classificados.ts` (`CASCA_DUPLICADA` / `APOSENTADA_CLASSIFICADA` / `AGUARDA_DECISAO`), com teste que falha se aparecer órfã nova sem veredicto. Esse mecanismo funciona. O que **não** está sob governo é a camada de **componentes e libs de leitura** — é lá que estão os 122.

### As 10 lacunas mais graves para o lançamento

| # | Lacuna | Evidência | Confiança |
|---|---|---|---|
| 1 | **Duas fontes de navegação do App Cliente.** `src/lib/portal-navegacao.ts` define `PORTAL_ABAS_CANONICAS` e `PORTAL_ROTAS_SPEC`, e **ninguém** fora de testes a importa; as 7 abas estão escritas à mão em `src/components/portal/portal-shell.tsx:133-141`. O AGENTS.md exige "uma fonte de navegação". | `grep -rn "portal-navegacao" src` → só `__tests__/enterprise-prd-portal-canonicos-2026-09-11.test.ts` e `__tests__/app-cliente-contrato-experiencia-2026-09-24.test.ts` | CONFIRMADO |
| 2 | **O gate do App Cliente não está ligado.** `src/lib/app-cliente-gate.ts` (`telasVisiveis`, `estadoDaTela`, `podeLerConteudo`) existe e é testado; nenhuma tela o chama. A regra "App mostra só conteúdo sanitizado/aprovado/publicado" está sem o motor que decide. | `grep -rn "app-cliente-gate" src` → só `__tests__/onboarding-jornada.test.ts` e um teste que lê o arquivo como texto | CONFIRMADO |
| 3 | **PR #185 + #194 (documentos reais da Ana no App) são só SQL e estão pendentes.** O próprio título do #185 diz "aguarda metadado real". Sem a migration aplicada, a aba Documentos do App não tem o que listar para o caso piloto. | #185 e #194 tocam só `supabase/` (+1 teste); nenhum arquivo em `src/` | CONFIRMADO |
| 4 | **Contrato/Formalização tem uma camada inteira de painéis fora de rota:** `painel-instrumentos.tsx`, `painel-preparacao.tsx`, `painel-estado-contratual.tsx`, `timeline-contratual.tsx`, `kit-contratual.tsx`, `anexos-tres-camadas.tsx` — e com eles os motores `instrumentos-preparacao(.functions).ts`, `escopo-conferencia.functions.ts`, `anexos-tres-camadas.ts`, `visibilidade.ts`, `tema-clausula-texto.ts`. | grafo: 0 importadores fora de `__tests__` para cada um (verificado também por `grep -rl`) | CONFIRMADO |
| 5 | **O commit "Corte F: religa os 8 órfãos" criou um novo órfão.** `src/components/contratos/painel-estado-contratual.tsx` nasceu em `42c4aaec` (05/10/2026), cujo assunto é exatamente *"Corte F: religa os 8 órfãos RELIGAR…"*, e nunca foi montado em rota. | `grep -rl painel-estado-contratual src` → só `src/lib/__tests__/corte-f-orfaos-religados-2026-10-05.test.ts` | CONFIRMADO |
| 6 | **A árvore do cliente tem dois motores; o canônico está morto.** `src/lib/arvore-cliente-projecao.ts` (`projetarArvoreCliente`, `projecaoLimpa`) só é importado pelo próprio teste; `src/routes/portal/arvore.tsx:13,18` usa `arvore-publicacao` + `genograma-familiar`. | `grep -rn "arvore-cliente-projecao" src` → só `__tests__/arvore-cliente-projecao.test.ts` | CONFIRMADO |
| 7 | **PR #186 (L3, selo do caso no vocabulário da família, mesclada em 24/10) parou na função.** `rotuloSeloCaso` existe e passa no teste; nenhuma tela a renderiza. É o exemplar mais recente e mais limpo do padrão que a Proprietária descreve. | `grep -rn "selo-caso-cliente" src` → só `__tests__/l3-selo-caso-vocabulario-cliente-2026-10-24.test.ts` | CONFIRMADO |
| 8 | **Cinco PRs abertas disputam a mesma navegação do Desk** (#99, #111, #112, #115, #116; #119 fechada sem merge). `main` hoje renderiza `SETORES_DESK` em `src/components/saas/shell.tsx:241,451` — regra cumprida —, mas a decisão "7 telas × 6/8 grupos" segue sem veredicto e congela quem toca o menu. | `gh api .../pulls/{99,111,112,115,116}` → `merged_at: null`; `shell.tsx:100-102` registra que a segunda lista foi movida para `SETORES_DESK_V5` | CONFIRMADO |
| 9 | **PR #170 (FORCE ROW LEVEL SECURITY nas 167 tabelas) está aberta.** É uma PR de segurança de 1 arquivo SQL, nunca mesclada. Enquanto isso, o AGENTS.md exige "autorização sempre em RLS/servidor". | `gh api .../pulls/170` → `merged_at: null`, 1 arquivo em `supabase/` | CONFIRMADO |
| 10 | **PR #126 ("Entrega 1: Sistema visual e App Home") entregou o sistema visual e não o aplicou.** `ca-badge.tsx`, `ca-empty-state.tsx`, `ca-progress.tsx`, `ca-table.tsx` e `src/lib/design-tokens.ts` entraram e nenhuma tela os importa (só `ca-card.tsx`, da mesma entrega, foi adotado). | grafo + `grep -rl`: 0 importadores; `ca-card` aparece em `routes/_authenticated/painel.tsx:12` | CONFIRMADO |

### O padrão que a Proprietária descreve — onde ele é verdade e onde não é

- **É verdade, cirurgicamente, na camada de leitura do App Cliente e do Contrato:** motor/lib/painel entra com teste, a tela nunca é ligada (lacunas 1, 2, 4, 5, 6, 7, 10). Sete PRs mescladas carregam esse resíduo como fase que ficou faltando.
- **É verdade na forma de fila de decisão:** 32 PRs (25 abertas + 7 sem merge) são trabalho pronto que nunca virou produto — a "fase que falta" delas é literalmente o merge.
- **Não é verdade na camada de servidor:** 548 `createServerFn`, 24 sem chamador, todas as 9 famílias inventariadas com veredicto. Esse pedaço do processo está funcionando.
- **Não é verdade que as PRs sejam a origem do código morto:** a maior parte dos 122 módulos mortos nasceu em commits diretos do Lovable (assunto `Changes`), datados de 06–27/08/2026, que entraram em `main` por merge de histórico e não por diff de PR revisado.

---

## 2. Tabela com todas as 195 PRs

Legenda das categorias: **COMPLETA** = o que prometeu está no código e alcançável · **FASE 1 SÓ** = a primeira camada entrou, falta a ponta que a torna utilizável · **DOC APENAS** = só `.md`/`.csv`/regras, zero `src/` · **ÓRFÃ** = entrou e hoje nada referencia (grep zero comprovado) · **SUPERADA** = outra PR refez a superfície · **ABERTA NÃO MESCLADA** = nunca entrou · **SQL/MIGRATION** = só schema/dados, sem camada de tela.

Na coluna Evidência, "grafo de imports" significa o grafo descrito na seção 0, construído a partir de `src/routes`; "resíduo morto tocado (não introduzido)" marca PRs que apenas editaram arquivo hoje morto — **isso não as torna incompletas** e está dito para não inflar a conta.

| # | Título | Mesclada? | Categoria | Fase que falta (se aplicável) | Evidência | Confiança |
|---|---|---|---|---|---|---|
| 1 | Override auditável da Proprietária, correção do Anexo I (D-02), catálogo homologado e recupe | Sim | FASE 1 SÓ | 20 modulos de producao entraram no diff desta PR (527 arquivos) e hoje nenhuma rota os alcanca: a camada `src/components/painel/*` + `src/lib/painel-*` do "Painel Hoje" antigo. Falta: nada a religar — a PR #168 reconstruiu /painel na grade V4 com `golive-*`; o que falta e aposentar o codigo morto com classificacao, como o AGENTS.md exige. | `src/routes/_authenticated/painel.tsx` importa `@/lib/golive-aprovacoes/golive-comercial/golive-microentregas` e nenhum `components/painel/*` morto; `grep -rhn 'components/painel/[a-z0-9-]*' -o src/routes / sort -u` lista so 5 paineis vivos | CONFIRMADO |
| 2 | Planejador: entrada que faltava no elo 1 da cadeia operacional | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 3 | Fix: resolução de organização sempre filtrada por usuário | Sim | COMPLETA | — | 16 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/piloto-ana.functions.ts` | CONFIRMADO |
| 4 | Jurídico vigente + fix: ativação de caso pula estados exigidos pelo banco | Sim | COMPLETA | — | 8 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 5 | Fix: vocabulário da Pesquisa não batia com as constraints do banco — nada salvava | Sim | FASE 1 SÓ | A branch desta PR carrega, por merge, a camada `src/components/painel/*` (16 de 22 componentes) e `src/lib/painel-*`: nenhuma rota os importa hoje. Falta: nada — a fase foi substituída pela PR #168; o código morto segue no repo. | graph de imports: 0 rotas importam `components/painel/{painel-dia,painel-hoje,abertura,acoes-rapidas,caso-destaque,fila-cadencia,itens-derivados,jornada-casos,sinais-por-grupo,painel-top30,painel-cadencia,painel-desk-hoje,metricas-jornada,faixa-historica,ancora-app,botao-testar-cliente}` | CONFIRMADO |
| 6 | Fix: Modo Proprietária sem saída + gate institucional ignorando status vigente | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 7 | Fix: modal de aprovação enganoso + diagnóstico da chave de serviço no reconfirmar propriedad | Sim | SUPERADA | Nada a religar: a superfície que a PR editou não existe mais em `main` ou ficou inalcançável. | arquivos da PR hoje ausentes/inalcançáveis: `src/components/governanca/reconfirmar-propriedade.tsx`, `src/components/governanca/varredura-administracao.tsx` | CONFIRMADO |
| 8 | docs: de-para dos 3 materiais externos recebidos hoje vs. arquitetura canônica | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 9 | feat: motor de catálogo por fase da jornada | Sim | COMPLETA | — | 4 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 10 | docs: de-para de acesso, governança e migração — auditoria de 28/08 | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 11 | Remove motivo/fonte como pré-requisito de salvar no Painel Hoje | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/acoes-rapidas.tsx` | CONFIRMADO |
| 12 | Remove motivo/fonte como pré-requisito em todos os blocos de aprovação | Sim | COMPLETA | — | 5 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/acoes-rapidas.tsx` | CONFIRMADO |
| 13 | Arquiva as telas e o motor de "modo proprietária" | Sim | FASE 1 SÓ | Falta ligar à tela: `src/lib/painel-hoje-acoes.functions.ts` entrou e nenhuma rota/componente alcançável o importa. | grafo de imports a partir de `src/routes` + `grep -rl` → 0 importadores fora de `__tests__` | CONFIRMADO |
| 14 | Remove trava de tamanho mínimo em motivo/justificativa em todos os módulos | Sim | COMPLETA | — | 58 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/piloto.functions.ts` | CONFIRMADO |
| 15 | Abre caso real na confirmação formal de qualquer oportunidade, não só a piloto | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 16 | Corrige erro de alias no caso-piloto e remove aviso do Painel Hoje | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx`, `src/lib/piloto-ana.functions.ts` | CONFIRMADO |
| 17 | Contratada carrega qualificação institucional automaticamente | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx`, `src/lib/piloto-ana.functions.ts` | CONFIRMADO |
| 18 | Renomeia "Pré-onboarding bloqueado" para "Pendências de pré-onboarding" | Sim | COMPLETA | — | 6 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx`, `src/lib/piloto-ana.functions.ts` | CONFIRMADO |
| 19 | Apontar app para o novo projeto Supabase próprio | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 20 | Ordem de serviço abre filtrada pelo caso, direto do Caso 360 | Sim | COMPLETA | — | 8 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx`, `src/lib/piloto-ana.functions.ts` | CONFIRMADO |
| 21 | Qualificação da contratada usa todo o perfil institucional | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 22 | Corrige quarta ocorrência esquecida de "Pré-onboarding bloqueado" | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 23 | Reduz fricção operacional: OS editável, abas técnicas fora do fluxo, formulários sem código  | Sim | COMPLETA | — | 8 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 24 | Revert "Reduz fricção operacional: OS editável, abas técnicas fora do fluxo, formulários sem | Sim | COMPLETA | — | 6 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 25 | hotfix: restaura autonomia operacional da proprietária | Sim | COMPLETA | — | 6 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 26 | Remove telas redundantes de gate/auditoria da ficha do caso e do contrato | Sim | COMPLETA | — | 10 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 27 | Corrige causa raiz de "dados da Ana não salvam": núcleo nunca tinha edição de pessoa | Sim | COMPLETA | — | 12 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 28 | Tela de Contrato: 5 ações principais em destaque, dados técnicos recolhidos | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 29 | Tela do caso-piloto: NO_GO/gates saem do caminho de trabalho, viram Dados técnicos | Sim | COMPLETA | — | 49 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/painel-hoje-acoes.functions.ts`, `src/lib/piloto-ana.functions.ts` | CONFIRMADO |
| 30 | Fase 1 (Detecção) — Possíveis núcleos duplicados | Sim | COMPLETA | — | 5 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 31 | P0: corrige gravação que declarava sucesso sem confirmar linha afetada | Não | ABERTA NÃO MESCLADA (fechada sem merge) | Tudo: nunca entrou em `main`. | `gh api .../pulls/31` → merged_at null, state closed; 48 arquivos propostos | CONFIRMADO |
| 32 | Pessoa: salvar com releitura real + decisão de tarefa; ajustes mobile | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/32` → merged_at null, state open; 8 arquivos propostos | CONFIRMADO |
| 33 | Piloto Real: pendências vivas no lugar da lista fixa de 11 bloqueios | Sim | SUPERADA | Nada a religar: a superfície que a PR editou não existe mais em `main` ou ficou inalcançável. | arquivos da PR hoje ausentes/inalcançáveis: `src/lib/piloto-conferencia.ts`, `src/routes/_authenticated/piloto-ana.tsx` | CONFIRMADO |
| 34 | Mapa de autoridade admin — 10/10 áreas cobertas | Sim | COMPLETA | — | 49 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/painel-hoje-acoes.functions.ts`, `src/lib/piloto-ana.functions.ts` | CONFIRMADO |
| 35 | Reconciliação contratos.$id.tsx — PR #28 × PR #32 | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/35` → merged_at null, state open; 5 arquivos propostos | CONFIRMADO |
| 36 | Política Unificada de Casos — Fase 1 (mapear sem modificar) | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 37 | docs: adiciona política de entrega de artefatos e versionamento | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 38 | docs: adiciona prompt diário de artefato primeiro | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 39 | P0: gravação verificada em todas as escritas de Comercial/Financeiro | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 40 | Contrato: remove botões de ação redundantes com a navegação de abas | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/40` → merged_at null, state open; 1 arquivos propostos | CONFIRMADO |
| 41 | docs: revisa Motor Contratual e Pessoa Canônica com achados reais | Sim | DOC APENAS | — | 0 arquivos em `src/`; 6 arquivos de documentação | CONFIRMADO |
| 42 | fix: corrige classificação de caseDataGiovanna.ts para demo | Sim | SUPERADA | Nada a religar: a superfície que a PR editou não existe mais em `main` ou ficou inalcançável. | arquivos da PR hoje ausentes/inalcançáveis: `src/data/caseDataGiovanna.ts`, `src/lib/classificacao-dados.ts` | CONFIRMADO |
| 43 | docs: arquiva decisões canônicas de 19/08 (Ficha Piloto, CRM/Catálogo, Ana Luiza) | Sim | DOC APENAS | — | 0 arquivos em `src/`; 4 arquivos de documentação | CONFIRMADO |
| 44 | Corrige bugs de persistência e aposenta campo livre de proposta no Caso 360 | Sim | COMPLETA | — | 5 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 45 | Atualiza Mapa de Autoridade Admin com achados de 01/09 | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 46 | Adiciona ficha piloto Giovanna Prade ao estudo de Pessoa Canônica e arquiva pacote de redese | Sim | DOC APENAS | — | 0 arquivos em `src/`; 3 arquivos de documentação | CONFIRMADO |
| 47 | Corrige leads arquivados que continuavam aparecendo na lista | Não | ABERTA NÃO MESCLADA (fechada sem merge) | Tudo: nunca entrou em `main`. | `gh api .../pulls/47` → merged_at null, state closed; 3 arquivos propostos | CONFIRMADO |
| 48 | Varredura de WhatsApp: usar o sinal extraído no rascunho do lead | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 49 | Arquiva Artefato de Resgate — Skills de Inteligência, Varredura e Dossiê | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 50 | Aplica e reconcilia Decisões Canônicas de Catálogo/Planejador; corrige premissa de Planilha  | Sim | COMPLETA | — | 4 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 51 | Pessoa Canônica via extensão de clientes (schema já aplicado); verificação da política unifi | Sim | SQL/MIGRATION | Schema declarado como já aplicado; sem código de tela nesta PR. | PR toca 1 arquivo `supabase/` + 1 doc | SUSPEITA |
| 52 | docs: arquiva Artefato Mestre de Resgate e Adendo de PRs interrompidas | Sim | DOC APENAS | — | 0 arquivos em `src/`; 2 arquivos de documentação | CONFIRMADO |
| 53 | Perfil institucional: gate lê status persistido, não só o valor fixo | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 54 | Reduz fricção do cadastro rápido de lead durante call | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 55 | Cotejo tela a tela (6 abas) e arquiva modelos de relatórios de jornada de vida | Sim | DOC APENAS | — | 0 arquivos em `src/`; 4 arquivos de documentação | CONFIRMADO |
| 56 | Arquiva pré-análise Nadia como referência para motores de WhatsApp e Discovery | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 57 | docs: artefato do dia — 02/09/2026 | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 58 | Arquiva adendo do roteiro de conversa e proposta de referência (Nadia) | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 59 | docs: arquiva Revisão Final do Planejador Universal com decisão de reuso | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 60 | docs: arquiva Contexto Regional e Jurídico do novo Motor Planejador (2 versões) | Sim | DOC APENAS | — | 0 arquivos em `src/`; 2 arquivos de documentação | CONFIRMADO |
| 61 | docs: arquiva Instruções de Construção do Motor Planejador de Cidadania | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 62 | docs: de-para entre entidades propostas do Motor de Cidadania e tabelas reais | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 63 | docs: plano de reorganização do core do Motor de Cidadania (sem novas tabelas) | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 64 | docs: Pessoa 360 — conjunto unificado de dados (5 camadas mapeadas) | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 65 | docs: levantamento histórico — ficha piloto, genealógica, cliente, CRM vivo | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 66 | fix: adiciona "Abrir visão do cliente" no caso e na ficha da pessoa | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 67 | docs: de-para entre Motores Unificados CRM Vivo e o que já existe | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 68 | fix: produto_sku confirma SKU ao vivo em product_catalog | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 69 | feat: máscara/validação reutilizável de CPF, CEP, UF e telefone | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 70 | docs: artefato do dia — 03/09/2026 | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 71 | docs: de-para "piloto" da Ana × realidade | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 72 | docs: varredura Fase 1 — go-live controlado do App Cliente | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 73 | fix: remove link de Proposta na tela Conta do portal | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 74 | feat: converge nomenclatura "piloto" da Ana para o fluxo real de fechamento | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 75 | docs: de-para onboarding, cadência e ciclo jornada de vida | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 76 | docs: de-para cadência D0-D365, micro-entregas, planejador e ciclo-piloto | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 77 | fix: retira o painel decorativo "ciclo completo" de /piloto | Sim | SUPERADA | Nada a religar: a superfície que a PR editou não existe mais em `main` ou ficou inalcançável. | arquivos da PR hoje ausentes/inalcançáveis: `src/lib/ciclo-piloto-ana.ts`, `src/routes/_authenticated/piloto.tsx` | CONFIRMADO |
| 78 | fix: link de Faturas na Conta só aparece com pagamento real registrado | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 79 | docs: de-para planejador de cidadania × produto-pai × motores unificados | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 80 | refactor: unifica limiares de cadência D10/D14 em módulo único | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/catalogo-top30.functions.ts` | CONFIRMADO |
| 81 | docs: de-para CRM caso, micro-entrega, onboarding, Operação Viva, Motores e Núcleos Unificad | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 82 | docs: de-para SKUs × produtos-pai × países novos, triagem da sub-aba de catálogo | Sim | DOC APENAS | — | 0 arquivos em `src/`; 4 arquivos de documentação | CONFIRMADO |
| 83 | fix: painel TOP 30 em /contratos mostra erro em vez de sumir silenciosamente | Não | ABERTA NÃO MESCLADA (fechada sem merge) | Tudo: nunca entrou em `main`. | `gh api .../pulls/83` → merged_at null, state closed; 1 arquivos propostos | CONFIRMADO |
| 84 | docs: pente-fino de calculadoras, radares, cadência e Centro de Inteligência | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 85 | Desbloqueio operacional real: App Cliente, Comercial e correção de bugs de causa raiz | Sim | COMPLETA | — | 69 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/contrato/painel-preparacao.tsx`, `src/components/ops/fila-sla-operacional.tsx` | CONFIRMADO |
| 86 | Pessoa 360 operacional, gate real de Entregas/Fase 01/Fase 02 e quadro de PRs #1-#85 | Sim | COMPLETA | — | 20 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 87 | Recovery: operational authority across Desk and App Cliente | Sim | COMPLETA | — | 5 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/estados-edicao.ts` | CONFIRMADO |
| 88 | Recovery: liga a autoridade operacional tela a tela (fiação da PR #87) | Sim | COMPLETA | — | 97 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-cadencia.tsx`, `src/components/painel/painel-desk-hoje.tsx` | CONFIRMADO |
| 89 | Zera as travas de autoridade em todo o repositorio | Sim | COMPLETA | — | 17 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/contrato/painel-preparacao.tsx` | CONFIRMADO |
| 90 | Servidor para de recusar a decisao da proprietaria | Sim | COMPLETA | — | 4 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 91 | Corrigir distorções visuais do Desk e reconectar pesquisa ao Supabase | Sim | FASE 1 SÓ | Falta ligar à tela: `src/components/biblioteca/motores-primordiais.tsx` entrou e nenhuma rota/componente alcançável o importa. | grafo de imports a partir de `src/routes` + `grep -rl` → 0 importadores fora de `__tests__` | CONFIRMADO |
| 92 | Plano: operação no ar e arquivo do passado | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 93 | P1: unificação de núcleos grava de verdade (fases 2–6) | Sim | COMPLETA | — | 4 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 94 | Desk operável: abrir caso, Calls na face, P3/P4 e legado isolado | Sim | COMPLETA | — | 34 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/biblioteca/motores-primordiais.tsx`, `src/components/painel/painel-dia.tsx` | CONFIRMADO |
| 95 | Cockpit do Desk: indicadores com ação, Calls e App Cliente (sem 14 abas) | Sim | COMPLETA | — | 17 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx`, `src/lib/fontes-canonicas-indicadores.ts` | CONFIRMADO |
| 96 | Desk em 6 grupos, de-para do mockup e CA-04 vivo com as Calls | Sim | COMPLETA | — | 39 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx`, `src/lib/fontes-canonicas-indicadores.ts` | CONFIRMADO |
| 97 | KPIs vivos no Hoje e arquivo GitHub do catálogo legado | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/97` → merged_at null, state open; 21 arquivos propostos | CONFIRMADO |
| 98 | Mesa de Discovery: SPIN como perguntas, não checkbox | Sim | COMPLETA | — | 6 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx` | CONFIRMADO |
| 99 | Face do Desk (7 telas) e cadeia legado → Caso 360 | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/99` → merged_at null, state open; 69 arquivos propostos | CONFIRMADO |
| 100 | Abas: cada função vive em um único grupo do Desk | Sim | COMPLETA | — | 5 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/painel-dia.tsx` | CONFIRMADO |
| 101 | Circuito + jornada D0–D365 como sistema + Calls→proposta | Sim | COMPLETA | — | 53 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/contrato/painel-preparacao.tsx`, `src/components/desk-go-live.tsx` | CONFIRMADO |
| 102 | Reset de confiança + SPIN na Mesa Discovery | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/102` → merged_at null, state open; 27 arquivos propostos | CONFIRMADO |
| 103 | Adendo vinculante: contexto não arquivável e prova autenticada | Sim | DOC APENAS | — | 0 arquivos em `src/`; 7 arquivos de documentação | CONFIRMADO |
| 104 | docs: adendo vinculante — contexto não arquivável + prova autenticada | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/104` → merged_at null, state open; 9 arquivos propostos | CONFIRMADO |
| 105 | Registro vivo de prova autenticada — contexto não arquivável | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/105` → merged_at null, state open; 24 arquivos propostos | CONFIRMADO |
| 106 | Adendo vivo: contexto não arquivável + prova autenticada da prévia | Sim | DOC APENAS | — | 0 arquivos em `src/`; 17 arquivos de documentação | CONFIRMADO |
| 108 | Quadro vivo de tarefas da Mesa (manhã e fim do dia) | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/108` → merged_at null, state open; 3 arquivos propostos | CONFIRMADO |
| 109 | Auditoria fim de tarde: CHECK evidências + checklist de pendências | Sim | COMPLETA | — | 9 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 110 | CRM Journey na memória + Painel de Calls / CRM vivo | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/110` → merged_at null, state open; 29 arquivos propostos | CONFIRMADO |
| 111 | Desk: sistema operacional do dia no Painel Hoje | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/111` → merged_at null, state open; 42 arquivos propostos | CONFIRMADO |
| 112 | CRM Journey + face Desk 7 telas (decisão de navegação) | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/112` → merged_at null, state open; 67 arquivos propostos | CONFIRMADO |
| 113 | Sincronização mestre: nav 7+6, SKU legado (PR #97) e Asaas bloqueado | Sim | DOC APENAS | — | 0 arquivos em `src/`; 11 arquivos de documentação | CONFIRMADO |
| 114 | Pessoa 360: mapa em cards da família, pesquisa, achados, proposta, contrato, Discovery e Wha | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/114` → merged_at null, state open; 18 arquivos propostos | CONFIRMADO |
| 115 | Face do Desk: 7 telas do mockup, 6 grupos só por dentro | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/115` → merged_at null, state open; 11 arquivos propostos | CONFIRMADO |
| 116 | Desk: face de 7 telas + 6 grupos internos (decisão 2026-09-11) | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/116` → merged_at null, state open; 18 arquivos propostos | CONFIRMADO |
| 117 | Caso 360: cadeia legado → lista-alimento → planejador → App → WhatsApp | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/117` → merged_at null, state open; 21 arquivos propostos | CONFIRMADO |
| 118 | fix(planejador): motor ponta a ponta — hidratar, fase, ativo e espelho | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/118` → merged_at null, state open; 22 arquivos propostos | CONFIRMADO |
| 119 | Desk: sidebar canônica de 7 telas do mockup + limpeza §22 | Não | ABERTA NÃO MESCLADA (fechada sem merge) | Tudo: nunca entrou em `main`. | `gh api .../pulls/119` → merged_at null, state closed; 39 arquivos propostos | CONFIRMADO |
| 120 | Caso 360: macro operacional (sem muro de pesquisa/financeiro) | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/120` → merged_at null, state open; 6 arquivos propostos | CONFIRMADO |
| 121 | Arquivar Planilha, SKU e conciliação só no GitHub | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/121` → merged_at null, state open; 24 arquivos propostos | CONFIRMADO |
| 122 | Go-live: App Cliente mockup + marca OKI + caseId App↔Desk | Sim | COMPLETA | — | 165 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/biblioteca/motores-primordiais.tsx`, `src/components/caso/descobertas-alertas.tsx` | CONFIRMADO |
| 123 | Go-live: App Cliente mockup + marca OKI + caseId App↔Desk | Não | ABERTA NÃO MESCLADA (fechada sem merge) | Tudo: nunca entrou em `main`. | `gh api .../pulls/123` → merged_at null, state closed; 434 arquivos propostos | CONFIRMADO |
| 124 | CA-APP-01: Portal de proposta usa invoices real, não eventos_financeiros | Não | ABERTA NÃO MESCLADA (fechada, 0 commits) | Nada falta: a promessa entrou fora desta PR. | `src/lib/portal.functions.ts:~300` tem o comentário `CA-APP-01: invoices tem RLS própria do portal` e `.from("invoices")`; `gh api .../pulls/124` → changed_files 0, commits 0 | CONFIRMADO |
| 125 | fix: --background/--card do :root nunca receberam o creme OKI aprovado | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/125` → merged_at null, state open; 2 arquivos propostos | CONFIRMADO |
| 126 | Entrega 1: Sistema visual e App Home | Sim | FASE 1 SÓ | Os 4 primitivos `ca-badge/ca-empty-state/ca-progress/ca-table` e `src/lib/design-tokens.ts` entraram e nenhuma tela os importa — falta trocar os componentes equivalentes nas telas do App/Desk por eles (ou aposentá-los com classificação). | `grep -rl ca-badge src --include=*.tsx` → 0 fora de components/ui; graph: inalcançável | CONFIRMADO |
| 127 | fix(contrato): valida parte contratante ao enviar assinatura | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 128 | fix(pessoa): aplica validadores canônicos em Lead e Cliente | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 129 | docs: consolidar revogação dos legados e comandos de execução | Sim | DOC APENAS | — | 0 arquivos em `src/`; 4 arquivos de documentação | CONFIRMADO |
| 130 | fix(nucleos): traduz violação do índice único de caso em erro amigável | Sim | FASE 1 SÓ | O próprio commit "Corte F: religa os 8 órfãos" criou `src/components/contratos/painel-estado-contratual.tsx` e nunca o montou em rota — falta montá-lo em `src/routes/_authenticated/contratos.$id.tsx` (ou em `casos.$caseId.contrato.preparar.tsx`). | `grep -rl painel-estado-contratual src` → só `src/lib/__tests__/corte-f-orfaos-religados-2026-10-05.test.ts` | CONFIRMADO |
| 131 | Restringir faturas/condições do App Cliente ao papel financeiro do caso | Sim | COMPLETA | — | 10 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 132 | Telemetria de permanência nas abas do App Cliente (Home, Radar, Legado, Árvore) | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 134 | fix(dados): saneia nucleo_membros do caso CA-CID-AT-FAM-2026-001 | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 135 | fix(portal): restaura tipagem de client_tab_dwell_events em types.ts | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 136 | feat(painel/caso-360): fila RPC canônica + cartões financeiros Custos/Margem (P5) | Sim | COMPLETA | — | 4 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 137 | chore(infra): CI automatizado, scripts e security headers (launchworthy audit) | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 138 | docs: corrigir AGENTS.md sobre grupos do Desk | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 139 | refactor(types): tipagem estrita de callbacks em painel-calls e estabilização de hooks no po | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 140 | fix(db): sanitizar caracteres curinga em buscas ilike de clientes e contatos | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 141 | Lovable sync 1791737548 | Sim | COMPLETA | — | 6 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 142 | docs(mapa): mapa do App Cliente (portal) gerado pelo Cartographer | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/142` → merged_at null, state open; 1 arquivos propostos | CONFIRMADO |
| 143 | test(radar): atualizar asserção do cálculo para acompanhar componente RadarSeisEixos | Sim | COMPLETA | — | 0 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 144 | fix(portal): impedir emissão de convite para dependentes sob representação legal | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 145 | docs(prompts): salvar prompt v3.0 dos três perfis da família Silveira | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 146 | test(menu): atualizar expectativas do menu da Conta para a decisão de 11/10 | Sim | COMPLETA | — | 0 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 147 | Paridade com o mockup: Home + Jornada do App, Shell do Desk V4 e Caso 360 | Sim | COMPLETA | — | 6 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 148 | Prancha V4 com dado real: Pessoas & Linhagens (G1–G10) em /nucleos e gráficos do Caso 360 | Sim | COMPLETA | — | 8 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 149 | Hotfix: zera as 2 falhas antigas de teste do main | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 150 | Pessoa 360 na composição da prancha V4 com dado real | Sim | COMPLETA | — | 5 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 151 | Saneamento: remove documento fictício do acervo vazio em /portal/documentos | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/151` → merged_at null, state open; 2 arquivos propostos | CONFIRMADO |
| 152 | fix(caso360): rosca do Dossiê permanece visível sem evidência | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 153 | feat(clientes): lista de pessoas alinhada à Prancha V4 | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 154 | feat(hoje): Prancha V4 com gráficos sempre desenhados no /painel | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 155 | feat(hoje): funil, cadências, casos sem ação e alertas em barras V4 | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 156 | feat(financeiro): rosca de situação das faturas e fluxo do contrato V4 | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 157 | feat(comercial): 6 blocos canônicos V4 completos em /leads | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 158 | feat(comercial): CRM Vivo & Discovery Calls (/calls) em Prancha V4 | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 159 | fix(comercial): /calls — remove Kanban comercial, mesa só de atendimento | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 160 | feat(ops): redesenha a aba Kanban de /ops na prancha V4 | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 161 | feat(caso360): faixa resumida compacta dos 4 lotes abaixo do cabeçalho | Não | ABERTA NÃO MESCLADA (fechada sem merge) | Tudo: nunca entrou em `main`. | `gh api .../pulls/161` → merged_at null, state closed; 2 arquivos propostos | CONFIRMADO |
| 162 | style(caso360): acabamento visual — respiro, bordas e badge real de status | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 163 | feat(pessoa360): árvore genealógica em SVG nativo + CPF/estado civil/papéis na Identidade | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 164 | feat(qualidade): 4 KPIs de prontidão + recomendações por caso na V4 | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 165 | style(pessoa360): 3 refinamentos cirúrgicos de homologação final | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 166 | feat(pesquisa): Dossiê de pesquisa (KPIs, cobertura de fontes, produção) em /pesquisa-modulo | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 167 | feat(pesquisa): miniatura familiar real no Dossiê de pesquisa | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 168 | feat(painel): reconstrói Hoje na grade V4, golive-* arquivado como legado | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/orfaos-classificados.ts` | CONFIRMADO |
| 169 | fix(nav): desengaveta todas as 8 telas no menu principal do Desk V4 (#169) | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 170 | feat(segurança): FORCE ROW LEVEL SECURITY nas 167 tabelas com RLS | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/170` → merged_at null, state open; 1 arquivos propostos | CONFIRMADO |
| 171 | Casca V4 no Desk: lotes V4-02 a V4-05 executados | Sim | COMPLETA | — | 85 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 172 | chore(banco): congelar Supabase próprio e adotar banco único (Lovable Cloud) | Sim | DOC APENAS | — | 0 arquivos em `src/`; 3 arquivos de documentação | CONFIRMADO |
| 173 | fix(ana-luiza): histórico do contrato vindo do banco antigo + complemento de cadastro | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/173` → merged_at null, state open; 1 arquivos propostos | CONFIRMADO |
| 174 | Acabamento e polimento visual do Desk e do App (pareceres de design de 22/10) | Sim | COMPLETA | — | 26 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/components/painel/metricas-jornada.tsx` | CONFIRMADO |
| 175 | Kanban de /ops: leitura mobile dos KPIs (corte 2/3 do plano de acabamento) | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 176 | Laudo de prontidão de produção da camada de servidor | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 177 | Rateio do caso da Ana Luiza: texto passa a dizer rateio igualitário | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 178 | Auditoria de telemetria: censo do que o código rastreia hoje | Sim | DOC APENAS | — | 0 arquivos em `src/`; 3 arquivos de documentação | CONFIRMADO |
| 179 | Registra a regra 5: publicação pelo Claude Code após merge em main | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 180 | G1 — GoLive por cliente dentro de Casos (Caso 360 macro → GoLive vida completa) | Sim | COMPLETA | — | 27 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 181 | G2 — Caso 360 em cards-resumo da vida do cliente | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 182 | E1 — Link de acesso do cliente com origem fixa (crítico do laudo #176) | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 183 | Leitura do contrato: tira os dois pop-ups que o navegador bloqueava | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 184 | P0 do App — Checklist consolidado de documentos com contador (sem inventar documentos) | Sim | COMPLETA | — | 4 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 185 | Proposta: documentos reais da Ana liberados no App (aguarda metadado real) | Sim | SQL/MIGRATION PENDENTE | Só SQL; o próprio título diz "aguarda metadado real". Falta aplicar a migration e confirmar que o App lista os documentos da Ana. | PR só toca `supabase/`; ver também #194 que reconcilia o mesmo SQL | CONFIRMADO |
| 186 | L3 — selo do caso no vocabulário da família | Sim | FASE 1 SÓ | `rotuloSeloCaso` existe e é testada, mas nenhuma tela do App/Desk a chama — falta renderizar o selo em `src/components/portal/portal-shell.tsx` (ou no cabeçalho do Caso 360). | `grep -rn selo-caso-cliente src` → só `src/lib/__tests__/l3-selo-caso-vocabulario-cliente-2026-10-24.test.ts` | CONFIRMADO |
| 187 | L4 (opção A) — régua de preparação e percentual com rótulo próprio | Sim | COMPLETA | — | 3 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 188 | Ativação: mostra o portão do piloto que o banco usa e que a tela escondia | Sim | COMPLETA | — | 2 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 189 | Laudo: por que "nada persiste" — a causa são 692 portões invisíveis, não escrita perdida | Sim | DOC APENAS | — | 0 arquivos em `src/`; 1 arquivos de documentação | CONFIRMADO |
| 190 | Bloqueio do piloto: monta a tela que nunca existiu para resolvê-lo | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/orfaos-classificados.ts`, `src/lib/piloto.functions.ts` | CONFIRMADO |
| 191 | Corrige PR190: justificativa operável e teste real de interação | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 192 | Tira duas armadilhas: exclude do Vitest e hook que faz cumprir a regra 3 | Sim | DOC APENAS | — | 0 arquivos em `src/`; 3 arquivos de documentação | CONFIRMADO |
| 193 | EXEC-06 + revisão do SQL do #185: onError e correções no SQL pendente | Sim | COMPLETA | — | 1 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 194 | Reconcilia o SQL dos documentos da Ana com metadado real do storage | Sim | SQL/MIGRATION PENDENTE | Só SQL de reconciliação do #185. Falta a aplicação autorizada no banco. | PR só toca `supabase/` + 1 teste | CONFIRMADO |
| 195 | Títulos não terminam com palavra órfã (text-wrap: balance/pretty) | Sim | COMPLETA | — | 0 arquivos de produção da PR alcançáveis a partir de `src/routes` | CONFIRMADO |
| 196 | Remove as camadas de bloqueio da ativação do caso (guards ativam cedem à proprietária) | Sim | COMPLETA | — | 6 arquivos de produção da PR alcançáveis a partir de `src/routes`; resíduo morto tocado (não introduzido): `src/lib/orfaos-classificados.ts`, `src/lib/piloto.functions.ts` | CONFIRMADO |
| 197 | chore: ignora .cartographer/ (scratch local da auditoria) | Não | ABERTA NÃO MESCLADA | Tudo: nunca entrou em `main`. | `gh api .../pulls/197` → merged_at null, state open; 78 arquivos propostos | CONFIRMADO |

---

## 3. Lacunas agrupadas por superfície do produto

### 3.1 Contrato / Formalização — **a superfície mais afetada**

Uma camada de apresentação inteira existe fora de rota. Arquivos com **0 importadores fora de `__tests__`** (grep confirmado):

| Arquivo | Fase que falta | Confiança |
|---|---|---|
| `src/components/contrato/painel-instrumentos.tsx` | montar em `src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx` ou `contratos.$id.tsx` | CONFIRMADO |
| `src/components/contrato/painel-preparacao.tsx` | idem; é o único consumidor de `escopo-conferencia.functions.ts` | CONFIRMADO |
| `src/components/contratos/painel-estado-contratual.tsx` | montar em rota — nasceu no commit do "Corte F" (42c4aaec, 05/10) e nunca foi montado | CONFIRMADO |
| `src/components/timeline-contratual.tsx` · `src/components/kit-contratual.tsx` | montar em rota; são os únicos consumidores de `src/lib/visibilidade.ts` | CONFIRMADO |
| `src/components/governanca/anexos-tres-camadas.tsx` | montar em `src/routes/_authenticated/governanca.*`; único consumidor de `src/lib/anexos-tres-camadas.ts` | CONFIRMADO |
| `src/lib/instrumentos-preparacao.ts` · `.functions.ts` · `src/lib/escopo-conferencia.functions.ts` | só chegam à tela pelos dois painéis acima; religar com eles ou aposentar com classificação | CONFIRMADO |
| `src/lib/tema-clausula-texto.ts` · `src/lib/criterios-aceite.ts` · `src/lib/aceite-e2e-passos.ts` | 0 importadores; decidir religar ou classificar | CONFIRMADO |
| `src/lib/contrato-preparar.functions.ts → auditoriaPreparacao` | já classificada `APOSENTADA_CLASSIFICADA` em `orfaos-classificados.ts:73` — **não é lacuna** | CONFIRMADO |

PRs abertas desta superfície: **#35** (reconciliação `contratos.$id.tsx` entre #28 e #32), **#40** (remover botões redundantes no Contrato), **#173** (histórico do contrato da Ana Luiza vindo do banco antigo — só SQL).

### 3.2 Onboarding / Pessoa

| Lacuna | Evidência | Confiança |
|---|---|---|
| `src/lib/campos-obrigatorios.server.ts` com **zero referências em todo `src/`**, nem teste | `grep -rn "campos-obrigatorios.server" src` → vazio | CONFIRMADO |
| `src/lib/estados-edicao.ts` inalcançável (entrou pela PR #87, "Recovery: operational authority") | grafo: 0 importadores fora de teste | CONFIRMADO |
| `src/lib/cadastro-checklist.functions.ts` tem 1 só consumidor — ponto único de falha, não lacuna | `grep -rl` → 1 arquivo de tela | SUSPEITA |
| PRs abertas: **#32** (Pessoa: salvar com releitura real + decisão de tarefa), **#114** (Pessoa 360 em cards da família) | `merged_at: null` | CONFIRMADO |
| `src/lib/piloto.functions.ts` (5 funções) e `piloto-ana.functions.ts` (3) sem chamador | ambos `AGUARDA_DECISAO` em `orfaos-classificados.ts:134,142` — **decisão da Proprietária, não esquecimento** | CONFIRMADO |

### 3.3 App Cliente (portal)

As quatro lacunas mais graves do lançamento estão aqui (ver itens 1, 2, 3, 6, 7 da seção 1).

| Lacuna | Fase que falta | Confiança |
|---|---|---|
| `src/lib/portal-navegacao.ts` | ou `portal-shell.tsx` passa a renderizar `PORTAL_ABAS_CANONICAS`, ou o arquivo é aposentado com classificação — hoje são duas fontes de navegação | CONFIRMADO |
| `src/lib/app-cliente-gate.ts` | ligar `telasVisiveis`/`podeLerConteudo` ao `PortalShell`/`portal-visibilidade`, que hoje decidem por outro caminho | CONFIRMADO |
| `src/lib/arvore-cliente-projecao.ts` | decidir entre ele e `arvore-publicacao` + `genograma-familiar` (o que a rota usa); a regra de "um SVG genograma como única visualização" está cumprida pela rota | CONFIRMADO |
| `src/lib/selo-caso-cliente.ts` (PR #186) | renderizar `rotuloSeloCaso` no cabeçalho do App ou do Caso 360 | CONFIRMADO |
| `src/lib/legado-visibilidade.ts` | 0 importadores; a aba Legado decide visibilidade por outro caminho — religar ou classificar | CONFIRMADO |
| `src/lib/portal-experiencia-integral.ts` · `portal-fallback-canonico.ts` · `portal-mapa-kit.ts` | 0 importadores (os dois primeiros são os únicos consumidores de `saneamento-desk-app-v4.ts`) | CONFIRMADO |
| `src/components/portal/bloco-exemplo-visual.tsx` + `exemplos-visuais-mockup.ts` | nasceram em `02671b2c` (09/10), assunto **"Work in progress"**, nunca montados | CONFIRMADO |
| `src/lib/app-visibilidade-registro.ts` · `src/lib/par-app-desk.ts` | 0 importadores vivos (`par-app-desk` só pelo morto `painel/ancora-app.tsx`) | CONFIRMADO |
| `golive-escritores.functions.ts → publicarNoAppGoLive` | `CASCA_DUPLICADA` em `orfaos-classificados.ts:64` — **não é lacuna** | CONFIRMADO |
| PRs abertas/pendentes | **#185/#194** (SQL dos documentos da Ana, pendente), **#125** (creme OKI em `--background/--card`), **#151** (remover documento fictício de `/portal/documentos`), **#120** (Caso 360 macro), **#142** (doc do mapa do App) | CONFIRMADO |

Regras do AGENTS.md verificadas como **cumpridas** em `main`: as 7 abas estão em `portal-shell.tsx:133-141` sem 8ª aba; a RPC `portal_sou_contratante_financeiro` e suas chamadas seguem no código; `confirmarDocumentosMinimos` → `documentos_minimos_ok` (PR #85) segue presente.

### 3.4 Desk / Navegação

| Lacuna | Evidência | Confiança |
|---|---|---|
| **Fila de decisão, não falta de código.** `main` renderiza uma única lista (`SETORES_DESK` em `shell.tsx:241,451`), como o AGENTS.md exige; `shell.tsx:100-102` registra que a segunda lista foi movida para `SETORES_DESK_V5` | leitura direta do arquivo | CONFIRMADO |
| **Cinco PRs abertas para a mesma superfície:** #99, #111, #112, #115, #116 (+ #119 fechada sem merge). Fase que falta: a decisão da Proprietária e o merge de **uma** delas | `merged_at: null` nas cinco | CONFIRMADO |
| **Painel Hoje antigo: 16 de 22 componentes de `src/components/painel/` mortos** — `painel-dia`, `painel-hoje`, `painel-desk-hoje`, `painel-cadencia`, `painel-top30`, `abertura`, `acoes-rapidas`, `caso-destaque`, `fila-cadencia`, `itens-derivados`, `jornada-casos`, `sinais-por-grupo`, `cards-alertas-centrais`, `metricas-jornada`, `faixa-historica`, `ancora-app`, `botao-testar-cliente`. Com eles morrem 9 libs `painel-*`. Substituídos pela **PR #168**, que reconstruiu `/painel` na grade V4 sobre `golive-*`. Fase que falta: **aposentar com classificação** (o AGENTS.md proíbe apagar em silêncio e exige veredicto). `painel-dia.tsx` segue sob a regra "aguarda decisão; não tocar". | `routes/_authenticated/painel.tsx:14-16` importa `golive-aprovacoes`/`golive-comercial`/`golive-microentregas`; `grep -rhn 'components/painel/[a-z0-9-]*' -o src/routes \| sort -u` lista só 5 painéis vivos (`painel-catalogo`, `painel-formalizacao`, `painel-onboarding-jornada`, `catalogo-saneamento`, `pendencias-criticas-pesquisa`) | CONFIRMADO |
| `src/components/desk-go-live.tsx` · `desk/modulos-contextuais.tsx` (+ `src/lib/desk-modulos.ts`) · `desk/kanban-tarefas.tsx` · `src/lib/desk-arvore-canonica.ts` · `src/lib/superficie-interna.tsx` inalcançáveis | grep zero; `kanban-tarefas` é **estacionamento declarado** em `tarefas.tsx:60`, não esquecimento | CONFIRMADO |
| GoLive: as 19 telas `golive.*` estão todas em `src/routes/_authenticated/`, conforme a decisão de 23/10 (PR #180) | `ls src/routes/_authenticated/golive.*` → 19 rotas | CONFIRMADO |

### 3.5 Pesquisa

| Lacuna | Evidência | Confiança |
|---|---|---|
| `src/components/pesquisa/plano-acao-demo.tsx` — 0 importadores em todo `src/` | `grep -rl plano-acao-demo src` → vazio | CONFIRMADO |
| `src/lib/fontes-por-pais.ts` · `src/lib/fontes-documentos-rls.ts` — 0 importadores fora de teste | grafo + grep | CONFIRMADO |
| `src/lib/evidencia-canonica.functions.ts` (4 funções sem chamador) | já inventariado em `orfaos-classificados.ts:55` como `CASCA_DUPLICADA` — **não é lacuna** | CONFIRMADO |
| `src/lib/radar-marcos-juridicos.ts` + `.functions.ts` (`radarMarcosJuridicosDoPainel`) | `AGUARDA_DECISAO` em `orfaos-classificados.ts:153`; dependem do Painel Hoje antigo, que morreu com a PR #168 | CONFIRMADO |
| `src/components/biblioteca/motores-primordiais.tsx` (PR #94) | 0 importadores; o registro dos motores P0–P11 nunca ganhou tela | CONFIRMADO |

### 3.6 Financeiro

Esta é a superfície **menos** afetada, e aqui a hipótese da Proprietária se mostra falsa num ponto concreto:

| Item | Veredicto | Confiança |
|---|---|---|
| **PR #124** ("Portal de proposta usa invoices real, não eventos_financeiros") fechada com **0 commits e 0 arquivos** — parecia promessa perdida | **Entregue fora da PR.** `src/lib/portal.functions.ts` (bloco de `portalProposta`, a partir da linha 289) traz o comentário `CA-APP-01: invoices tem RLS própria do portal — fonte viva certa` e `.from("invoices")`. Não é lacuna. | CONFIRMADO |
| `portal_sou_contratante_financeiro` e o estado neutro para não-contratante (PR #131) | presentes e alcançáveis | CONFIRMADO |
| `src/lib/comercial-hoje-canonico.ts` | ilha morta: único consumidor é `painel/painel-dia.tsx`, que morreu com a PR #168 | CONFIRMADO |
| `src/lib/fila-comunicacao.ts` · `fila-follow-up-proprietaria.ts` · `alertas-derivados.ts` · `agenda-assistida.ts` · `alertas-whatsapp.ts` · `rascunhos-comunicacao-governados.ts` | ilhas mortas do mesmo cluster do Painel Hoje antigo | CONFIRMADO |
| PR **#170** (FORCE RLS em 167 tabelas) aberta | fase que falta: autorização da Proprietária + aplicação da migration | CONFIRMADO |

### 3.7 Dívida transversal: dados de demonstração vivos no repositório

13 arquivos em `src/data/` são inalcançáveis e formam uma ilha fechada entre si: `activeCase.ts`, `case-directory.ts`, `case-registry.ts`, `caseDataGiovanna.ts`, `caseDataSophia.ts`, `caseTemplate.ts`, `caso-sophia.ts`, `casos.ts`, `entrega-consultiva.ts`, `propostas.ts`, `relatorio-fase02.ts`, `relatorio-visual.ts`, `saneamento.ts` — junto com os componentes `entrega-consultiva.tsx`, `entrega-modelo.tsx`, `relatorio-visual.tsx`, `relatorio-fase02.tsx`, `clube-ancestral-kit/kit-consolidado.tsx`, `clube-ancestral-kit/preview-fixtures.ts`. Nenhuma rota os alcança (grep zero comprovado para cada um). **Fase que falta: aposentar com classificação**, conforme a regra do AGENTS.md — enquanto estiverem no `src/`, qualquer agente futuro pode reconectá-los e vazar dados de família fictícia para uma tela real.

---

## 4. Limites desta auditoria (o que eu não provei)

- **Não verifiquei o banco.** Nenhuma afirmação sobre migration aplicada, RLS ativa ou linha existente. Onde o assunto aparece (#51, #170, #173, #185, #194), o veredicto é sobre o *arquivo* da PR, não sobre o estado do Postgres.
- **A medição é sobre `main` (`125f749d`).** O branch `claude/modest-carson-28pij2` está 25 commits à frente e **não** foi usado como base; apenas 1 arquivo da PR #197 existe só nele. Se a Proprietária quiser o retrato do branch avançado, o mesmo grafo precisa rodar lá.
- **Alcançabilidade é condição necessária, não suficiente.** Uma tela pode ser alcançável e ainda assim não gravar nada. "COMPLETA" aqui significa "o código da PR chega ao usuário", não "funciona em produção". Provar o segundo exige clique com prova autenticada da Proprietária (`COMPROVADO_EM_USO`), que nenhuma auditoria de código substitui.
- **Não li o corpo de todas as 195 PRs.** Li os de todas as que classifiquei fora de COMPLETA/DOC APENAS, e o título de todas. Para as COMPLETAS, o veredicto é mecânico (arquivos da PR alcançáveis) — marcado CONFIRMADO para a alcançabilidade, não para a intenção literal do prompt original.
