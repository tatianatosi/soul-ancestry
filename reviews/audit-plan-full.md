# Auditoria de espectro completo — `main`, a branch e o padrão de execução interrompida

**Data**: 27/10/2026
**Modo**: Repo — escopo redefinido pela Proprietária
**Escopo pedido, nas palavras dela**: "verificar todas as prs que não foram executadas e hoje está em main, branch vs. main e comportamento de não continuação de execução que nem sequer chegou a fazer as primeiras fases, e portanto tudo está duplicado, sobreposto, gambiarras, e sem planejamento"
**Base medida**: `origin/main` (`667d112b`) e `claude/modest-carson-28pij2` (43 commits, 109 arquivos, +3312/−428)
**Frentes**: 3 em paralelo (PRs não executadas · duplicação viva · diff da branch) + verificação própria no banco de produção

---

## Veredicto geral: NEEDS REWORK

Não pelo volume de dívida antiga, que é grande mas conhecido e classificado. É por **dois defeitos que esta sessão introduziu** e por **um mecanismo que desfaz trabalho já mesclado sem avisar ninguém** — esse último explica melhor a queixa "nada persiste" do que a hipótese de abandono de fases.

A branch **não deve ser mesclada** antes de corrigir o Crítico 1.

---

## Correções de premissa — o que eu afirmei errado antes e corrijo agora

Isto vem primeiro de propósito. Metade do valor desta auditoria é derrubar conclusões minhas e das frentes.

| Afirmação anterior                                                                                                   | Correção, com evidência                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "PR #186 / `selo-caso-cliente.ts` é falso positivo da auditoria — `rotuloSeloCaso` está ligado" (eu, 26/10)          | **Eu medi a branch, não `main`.** Em `main`, `rotuloSeloCaso` tem **zero** chamadores: a ligação foi feita (`ae2e0726`) e **desfeita** por `53fe082d "Changes"`, do bot do Lovable. A auditoria original estava certa para `main`; eu estava certo para a branch. O veredicto depende da base, e eu não disse qual estava usando.                                                                                                                                                                                             |
| "`contract_clause_overrides` nunca renderizado é a explicação completa de 'texto que editei não aparece'" (Frente B) | **Lacuna real, explicação falsa.** Medi no banco: existem 2 linhas ativas, as duas são `DEMO —`, de **outros contratos** (`d7c287a9`, `bd029bcc`), com `clause_text` **vazio** (0 caracteres). O contrato da Ana tem **zero** overrides. O renderizador de fato ignora a tabela (fase 2 ausente), mas isso não pode ser a causa de uma edição que não existe no banco. **A causa do "texto que editei não aparece" segue não provada** — e eu não vou inventar uma.                                                           |
| "A migration de `user_roles` precisava mudar 17 leituras" (eu, no cabeçalho do próprio SQL em `supabase/pendentes/`) | **Enumerei só as leituras TypeScript.** A autorização real deste projeto está em funções SQL usadas pelas policies de RLS, e elas ficaram fora da minha própria lista de guarda. Ver Crítico 1.                                                                                                                                                                                                                                                                                                                               |
| "O CI está verde" (eu, várias vezes, baseado nos avisos de `check_suite`)                                            | Esses avisos **não cobrem o GitHub Actions**. Conferi direto em `ci.yml`: os 8 últimos commits da branch passaram. A conclusão estava certa; o fundamento estava errado.                                                                                                                                                                                                                                                                                                                                                      |
| Quatro suspeitas de duplicação da Frente B                                                                           | Não se confirmaram: a RPC `proxima_acao_prioritaria` trata o override manual como nível 8 (não é fonte paralela); `golive-escritores.patchCaso` é limitado a 3 campos e não ativa caso; `planejador-parametros.ts` cita `src/data/casos` **só em comentário**; `contrato-base-consolidado.ts` está vivo com 22 consumidores.                                                                                                                                                                                                  |
| "Peça A do laudo #189 deve somar `piloto_bloqueios` ao inventário do Caso 360" (eu, 27/10, ao retomar a fila)        | **A causa raiz que motivou o laudo já não existe.** `supabase/pendentes/20261024170000_ativacao_cede_a_proprietaria.sql` foi aplicado em produção um dia depois do laudo (25/10) — conferido via `pg_get_functiondef`: `fn_piloto_caso_guard` e `fn_guard_ativacao` agora cedem a `fn_proprietaria_operando()`. Quando é a Proprietária quem ativa, nenhum dos dois recusa. Somar `piloto_bloqueios` ao Caso 360 reintroduziria o que essa correção removeu. Detalhe em `reviews/laudo-nada-persiste-2026-10-24.md`, seção 6. |

---

## Problemas críticos (bloqueiam merge)

| #   | Problema                                                                                                                                                                                                                                                                                                                                           | Frente                           | Arquivo                                       | Impacto                                                                                                                                                                                                  | Correção                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | **Remover papel deixou de revogar acesso no banco.** Troquei `.delete()` por soft-delete em `user_roles` e filtrei `archived_at` nas 13 leituras TypeScript — mas as funções SQL que as policies de RLS usam não filtram. `definirPapel(conceder:false)` arquiva a linha e `can_write`/`has_org_role`/`can_write_financeiro` continuam contando-a. | C + verificação própria no banco | `saas.functions.ts:1153-1164` + 4 funções SQL | Papel removido continua escrevendo via PostgREST. **225 policies** dependem de `can_write`, 32 de `has_org_role`, 8 de `can_write_financeiro`. Antes do meu diff, `.delete()` derrubava o acesso de fato | `and r.archived_at is null` nas 4 funções → exige migration → proposta em `supabase/pendentes/`, com sua autorização |
| 2   | **A seção Faturas quebrava exatamente onde você olha.** A query entrou sem `enabled`, e `minhasFaturas` recusa quem não tem `client_portal_access` ativo — o seu caso na prévia do admin e na demo institucional                                                                                                                                   | C                                | `conta.tsx`                                   | Você veria aviso de instabilidade financeira em vez da seção que pediu; cliente em prospecção veria o mesmo na demo                                                                                      | **Corrigido nesta rodada** (`enabled: previa === null`) + teste que exercita o caminho de prévia                     |

**Nota de enquadramento, importante:** o Crítico 1 **não está em produção**. Conferi: `main` ainda usa `.delete()` (`saas.functions.ts:1134`). A coluna `archived_at` já está aplicada no banco, mas o código que a usa está só na branch. A regressão entraria no merge — por isso ela bloqueia o merge, e não é um incidente aberto agora.

---

## Preocupações transversais — apontadas por 2+ frentes

| Preocupação                                                                                                                                                                                                                                                                                   | Frentes               | Causa raiz                                                                           | Correção unificada                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Um segundo escritor desfaz trabalho mesclado, sem rastro.** O bot do Lovable tem **3.142 commits** em `main` tocando `src/`, assunto `Changes`/`Work in progress`; **43 dos últimos 60 são literalmente "Changes"**. Um deles (`53fe082d`) desfez a entrega da PR #186. Nenhum teste barrou | A + B                 | Sincronização bidirecional sem sinal de regressão nem teste de contrato nas entregas | Teste de invariante por entrega (o padrão que eu já uso: travar o comportamento num teste nomeado e datado). É o único mecanismo que sobrevive a um commit sem assunto                                                                |
| **Guardas de detecção escritas e nunca ligadas.** `destinosDuplicados()`, `destinosSobrepostos()`, `origemDoAtalho()`, `LINKS_CONTEXTUAIS` — 4 funções em `navegacao-desk.ts`, 0 consumidores, todas devolvendo vazio                                                                         | B + crítica de design | Fase 1 (escrever a guarda) entregue, fase 2 (preencher e ligar) nunca                | São exatamente o que pegaria a duplicação de menu que existe hoje (`/casos` fatiada em 4 entradas em 2 grupos). Preencher ou classificar                                                                                              |
| **Correções que existem só na branch não mesclada**                                                                                                                                                                                                                                           | A + B                 | —                                                                                    | `/devolutiva` sem autenticação em `main` (one-pages com nomes de clientes, guard existe na branch); religação do L3; arquivo da migration `20261020150000`. **Enquanto a branch não entra, `main` está pior que o trabalho já feito** |
| **Camada de Contrato/Formalização sem rota** — 6 de 6 painéis com 0 importadores                                                                                                                                                                                                              | A + B                 | A superfície mais afetada pelo padrão de execução interrompida                       | Classificar (`CASCA_DUPLICADA`/`AGUARDA_DECISAO`), não apagar                                                                                                                                                                         |

---

## Frente A — PRs mescladas em `main` sem o trabalho prometido

52 PRs verificadas uma por uma (45 `DOC APENAS` + 7 `FASE 1 SÓ`), sem amostragem.

### Resumo quantitativo

| Categoria                                                      | Qtd                      |
| -------------------------------------------------------------- | ------------------------ |
| Documentação por design — **não é lacuna**                     | 36                       |
| Falso positivo da metodologia (entregou código fora de `src/`) | 3                        |
| Plano/laudo com execução incompleta ou não comprovada          | 6                        |
| `FASE 1 SÓ` → artefato morto (zero chamador)                   | 4 (#13, #91, #126, #130) |
| `FASE 1 SÓ` → superada, resta aposentar                        | 2 (#1, #5)               |
| `FASE 1 SÓ` → **fase 2 desfeita pelo sync do bot**             | 1 (#186)                 |

**A classificação `DOC APENAS` da auditoria original é mecânica e engana**: foi medida como "0 arquivos em `src/`". Isso junta três coisas diferentes. 36 das 45 prometeram registro e entregaram registro — não são dívida. Três entregaram código operante fora de `src/` (a #192 entregou o próprio hook `PreToolUse` que faz cumprir a regra 3; a #113 mudou config de deploy; a #103/#106 são governança-como-código). A lacuna real está em 6.

### As 6 com execução incompleta

| PR           | O que propôs                                                                                                                                           | Estado em `main`                                                                                                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **189**      | Laudo "nada persiste": 692 `RAISE EXCEPTION`; peças A (inventário de portões), B (tradutor de recusa), C (trava) + corte de 19 mutations sem `onError` | **Fase 1 de N.** Peça A: grep zero. Peça B: ausente. Peça C: só na forma estreita. Do primeiro corte: `onboarding.$id.tsx` ✅, **`importacoes.tsx` ❌ (3 mutations, 0 `onError`)**                                                                                                                  |
| **176**      | Laudo de prontidão: 1 crítico + 7 itens                                                                                                                | **3 de 8.** ✅ item 1 (crítico, `origem-canonica.ts` é allowlist real) e item 4. ❌ **zero coletor de erro** (produção cega); ❌ journal do Drizzle com 3 entradas contra 235 migrations; ❌ migration `20261020150000` sem arquivo em `main`; ❌ **nenhuma rota de saúde expondo o SHA publicado** |
| **92**       | Plano "tudo no ar": fatias A–E                                                                                                                         | 5 fases nomeadas, nenhuma rastreável como concluída                                                                                                                                                                                                                                                 |
| **129**      | Comandos C1/C2/C3 (revogação de legados)                                                                                                               | **Não comprovado** — `conciliarPropostaComCatalogo` segue chamado; não afirmo que falhou, afirmo que não há prova                                                                                                                                                                                   |
| **36**       | "Fase 1 (mapear sem modificar)"                                                                                                                        | Fase 1 entregue por design; nenhuma fase posterior                                                                                                                                                                                                                                                  |
| **63/61/82** | Reorganização do core, Motor Cidadania, matriz PP01–PP08                                                                                               | Parcial: `sku-produto-pai.ts` existe (#82); os outros dois sem artefato                                                                                                                                                                                                                             |

### Os 5 piores para o lançamento (Frente A)

1. **O bot reverte trabalho mesclado e ninguém é avisado** — mecanismo, não acidente.
2. **Produção é cega** — zero coletor de erro, 12 linhas de log em 678 server functions.
3. **`main` pode divergir da produção sem alarme** — nenhuma rota de saúde com o SHA publicado.
4. **Correções presas na branch** — `main` está pior que o trabalho já feito.
5. **`importacoes.tsx`: 3 mutations, 0 `onError`** — o item mais mecânico do corte do #189, pela metade.

---

## Frente B — duplicação e sobreposição vivas em `main`

Medido por grafo de imports e grep, não por impressão.

### Mecanismos paralelos

| Achado                                | Vivo hoje                                  | Paralelo                                    | Classificação             |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------- | ------------------------- |
| **Dois gates de visibilidade do App** | `portal-visibilidade.tsx` (8 rotas)        | `app-cliente-gate.ts` — 0 chamadores        | `CASCA_DUPLICADA`         |
| Duas fontes de navegação do App       | lista à mão em `portal-shell.tsx:135-141`  | `portal-navegacao.ts` — **0 importadores**  | `CASCA_DUPLICADA`         |
| Dois motores de árvore do cliente     | `arvore-publicacao` + `genograma-familiar` | `arvore-cliente-projecao.ts` — 0 chamadores | `APOSENTADA_CLASSIFICADA` |
| Árvore canônica do Desk               | —                                          | `desk-arvore-canonica.ts` — 0 chamadores    | `AGUARDA_DECISAO`         |

### Escritores por tabela

Varridas 11 tabelas centrais. **A sobreposição perigosa não é escritor duplicado — é escrita sem leitura.** `crm_casos` tem 13 escritas em 11 módulos mas só `onboarding.functions.ts` escreve ativação: sem conflito de transição. O caso de escrita-sem-leitura é `contract_clause_overrides` (abaixo).

### Ilhas de código morto

| Ilha                             | Tamanho                       | Observação                                                                          |
| -------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| Painéis de Contrato/Formalização | **6 de 6 com 0 importadores** | superfície inteira escrita e nunca montada                                          |
| Painel Hoje antigo               | 9 de 22 órfãos                | `painel-dia.tsx` é **protegido pelo AGENTS.md** ("não tocar") — decisão, não dívida |
| `src/data/*`                     | 16 arquivos, 4 sem importador | `devolutiva.tsx` consome `client-one-page.ts`                                       |
| `src/components/ui`              | 32 órfãos                     | boilerplate shadcn vendorizado — **não é dívida**                                   |

**Total: 119 módulos sem importador fora de testes; descontando `components/ui`, 87 órfãos reais.**

### Rotas sem link de entrada

8 de 123; 3 são achado real: `/portal/casos/$id` + `/portal/mensagens/$id` (ilha de tickets funcional e inalcançável) e `/portal/faturas` (referenciada só pelo módulo morto `portal-navegacao.ts` — órfã de fato em `main`; na branch, agora vive dentro da Conta).

### Ranking de risco (Frente B)

1. **Regressão do selo do caso em `main`** — `elementos-mockup.tsx:82-84` reimplementou inline e mostra `statusRotulo` cru ou literalmente **"Não registrado"** num selo dourado para a família. O módulo canônico proíbe exatamente isso no próprio docstring.
2. **`contract_clause_overrides`: escrito, listado, escalado — e nunca renderizado.** `contrato-corpo.server.ts` tem 0 ocorrências de "override" e renderiza de `CLAUSULAS_FIXAS` (linha 245). Fase 2 ausente, confirmada. _(Mas ver a correção de premissa: isto não explica a sua queixa, porque não há override real salvo.)_
3. **`/devolutiva` sem autenticação em `main`** — guard existe na branch, não mesclado.
4. Dois gates de visibilidade do App.
5. Exclusão física de papel ainda em `main` (3 pontos).
6. Ilha de tickets do cliente inalcançável.
7. 6 painéis de Contrato com 0 importadores.
8. 4 guardas de detecção inertes.

---

## Frente C — auditoria adversarial do diff da branch

### Veredicto por lente

| #   | Lente                                                  | Veredicto            | Crít. | Rec. |
| --- | ------------------------------------------------------ | -------------------- | ----- | ---- |
| 1   | Design Engineer                                        | APPROVE WITH CHANGES | 0     | 2    |
| 2   | UX Engineer                                            | APPROVE WITH CHANGES | 0     | 3    |
| 3   | Frontend Engineer                                      | **NEEDS REWORK**     | 1     | 3    |
| 4   | Backend/Server (adaptado: `createServerFn` + Supabase) | **NEEDS REWORK**     | 1     | 1    |
| 5   | Structural Engineer                                    | APPROVE              | 0     | 0    |
| 6   | Repo Maintainer                                        | APPROVE WITH CHANGES | 0     | 1    |
| 7   | Production Readiness                                   | APPROVE WITH CHANGES | 0     | 2    |
| 8   | DX Engineer                                            | APPROVE              | 0     | 1    |
| 9   | Performance Engineer                                   | APPROVE              | 0     | 1    |
| 10  | Accessibility Engineer                                 | APPROVE              | 0     | 0    |

### Recomendações abertas

| #   | Recomendação                                                                                                                                                                                                              | Arquivo                                | Por quê                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R3  | **Toast afirma "com o dado atual" justamente quando não é.** Com `parametrizacao.executada === false`, o toast verde diz "Documento regerado com o dado atual" enquanto o aviso abaixo diz que a parametrização não rodou | `documento-do-instrumento.tsx:57-64`   | Contraria o princípio do projeto de não afirmar o que não se cumpriu. Usar `toast.warning` e texto sem "dado atual"                                                  |
| R6  | **Apagamento de tipo no caminho que libera documento jurídico**: `as Record<string, unknown>` + `as never`                                                                                                                | `documento-do-instrumento.tsx:87-89`   | Se o shape mudar, `tsc` fica verde, `previaId` vira `null` e o download fica **permanentemente desabilitado sem erro visível** — o sintoma original que você relatou |
| R7  | `ultimoAviso` vaza entre casos (`useState` sem reset por `caseId`)                                                                                                                                                        | `documento-do-instrumento.tsx:53`      | Mesma classe do bug de rascunho que corrigi em `leads.tsx`                                                                                                           |
| R4  | Explicação do botão desabilitado vem **depois** do botão                                                                                                                                                                  | `documento-do-instrumento.tsx:119-147` | Dois botões cinzas sem motivo visível até rolar                                                                                                                      |
| R10 | `supabase/migrations/` **não reproduz mais o schema de produção** (a coluna `archived_at` vive em `supabase/pendentes/`)                                                                                                  | —                                      | Ambiente reconstruído do histórico trava o acesso ao Desk: toda leitura de papel falha → `erroLeitura: true`                                                         |
| R8  | `proprietariaOperando` concede o bypass a **qualquer admin ativo**, não só a você                                                                                                                                         | `autoridade.server.ts:43-58`           | Hoje é a mesma pessoa. Um segundo admin herdaria os bypasses, incluindo o de consentimento/gravação (LGPD)                                                           |
| R2  | 5 dicionários novos em `rotulos.tsx` elevaram `react-refresh/only-export-components` de 11 para 16                                                                                                                        | `rotulos.tsx:90-140`                   | Único arquivo do diff onde erro de regra real subiu. Mover para um `.ts` sem componente                                                                              |
| R13 | O hook `PostToolUse` roda `tsc --noEmit` do projeto inteiro a cada edit                                                                                                                                                   | `.claude/settings.json`                | Segundos por edição, somando em sessão longa. Restringir ou aceitar consciente                                                                                       |

### O que a Frente C verificou e **não** era defeito

- **`validarLead`**: `livre` vem de `proprietariaOperando`, derivado no servidor de `staff_access` ativo + papel admin — **não é falsificável pelo cliente**. As 5 regras liberadas são decisão nominal sua.
- **RPC em loop em `minhasFaturas`**: é uma chamada por `case_id` **distinto**, dentro de `Promise.all`. Para uma família típica, 1-2 casos. Não é N+1.
- **Ordem de deploy da coluna `archived_at`**: correta — banco antes do código.
- **Acessibilidade da seção Faturas**: `role="status"` no carregamento, `role="alert"` no erro, `<ul>/<li>` semântico, `<h2>` na hierarquia certa, valor e status no mesmo `<li>`. Sem achado.
- **Fronteira de módulo do contrato**: `gerarPreviaNucleo`/`parametrizarAutomaticamente` ficaram internos, com as cascas públicas preservadas. Sem segundo caminho vivo.

---

## Sobre o diagnóstico da Proprietária

Ela descreveu: "não continuação de execução que nem sequer chegou a fazer as primeiras fases, e portanto tudo está duplicado, sobreposto, gambiarras, e sem planejamento".

O que a medição sustenta, e o que corrige:

- **Sustenta "fase 1 e para"**: 4 artefatos nomeados existem no repositório sem nenhum chamador; 6 planos/laudos com execução parcial; 6 painéis de Contrato nunca montados; 4 guardas de detecção escritas e vazias. O padrão é real e mensurável.
- **Sustenta "duplicado e sobreposto"**: 2 gates de visibilidade do App, 2 fontes de navegação, 2 motores de árvore, `/casos` fatiada em 4 entradas em 2 grupos, 87 órfãos reais.
- **Corrige um ponto, e é o mais importante**: em pelo menos um caso comprovado (#186), a fase **foi terminada e depois desfeita** por um escritor paralelo — o bot do Lovable, num commit de assunto "Changes". Isso explica "nada persiste / tudo volta" melhor do que abandono. E significa que terminar as fases, sozinho, não resolve: sem um teste de invariante por entrega, a próxima também pode voltar atrás sozinha.
- **Não sustenta "tudo"**: 36 das 45 PRs `DOC APENAS` entregaram exatamente o que prometiam; 32 dos órfãos são boilerplate shadcn; 4 suspeitas de duplicação da Frente B não se confirmaram; `painel-dia.tsx` é decisão sua, não dívida. A dívida é grande e concentrada — não é universal.

---

## Fila de correção, em ordem

1. **Crítico 1** — 4 funções SQL (`can_write`, `has_org_role`, `can_write_financeiro`, `bootstrap_primeiro_admin`). **Bloqueia o merge.** Exige migration → precisa da sua autorização nominal.
2. **Crítico 2** — ✅ corrigido nesta rodada, com teste que exercita o caminho de prévia.
3. **R3** (toast que afirma o que não cumpriu) e **R6** (casts no caminho do documento) — defeitos meus, no caminho do contrato da Ana.
4. **Mesclar a branch** depois do item 1: ela carrega o guard de `/devolutiva`, a religação do L3 e o arquivo da migration que faltam em `main`.
5. **Teste de invariante por entrega** — a única defesa contra o sync que desfaz trabalho.
6. **Coletor de erro em produção** (#176 item 2) e **rota de saúde com o SHA** (item 8) — antes de cliente pagante real.
7. `importacoes.tsx` (3 mutations, 0 `onError`); classificação formal dos 87 órfãos e das 4 guardas inertes.

## Decisões que já foram tomadas (27/10/2026)

1. **Crítico 1 autorizado e aplicado.** As 4 funções SQL (3 na verdade — `bootstrap_primeiro_admin` era falso positivo, só faz INSERT) já filtram `archived_at`. Ver `supabase/pendentes/20261027150000_user_roles_archived_at_nas_funcoes_rls.sql`.
2. **Override de cláusula: "só depois da revisão humana".** Fase 2 implementada em `contrato-corpo.server.ts` — edição sem `reviewed_at` nunca entra no texto, aparece declarada numa seção própria de pendências.
3. **`/portal/casos/$id` + `/portal/mensagens/$id`: "o cliente ganha tickets e deve ir para as áreas correspondentes no desk das suas demandas e o atendimento é feito pelo whatsapp".** Veredicto `APOSENTADA_CLASSIFICADA`: a ilha de tickets não entra no App Cliente. Nenhum código apagado — os arquivos de rota continuam existindo, só não são promovidos a aba nem linkados. Travado por teste (`ilha-tickets-cliente-aposentada-2026-10-27.test.ts`): falha se alguém religar sem decisão nova.

## Limites desta auditoria

- Não exercitei o App nem o Desk em navegador: não há `.env` neste contêiner e a tela de Faturas exige sessão de contratante real. Tudo acima é medição de código, de `git log` e de banco — não substitui o seu print autenticado, conforme o adendo de 10/09/2026.
- "Migration aplicada" na Frente A significa registro em `supabase/pendentes/README.md`, não estado do Postgres — exceto onde eu medi o banco diretamente (as 4 funções SQL, as colunas de `user_roles` e as linhas de `contract_clause_overrides`, que conferi eu mesmo).
- Não contei a dívida de Prettier (6496 ocorrências já em `main`): é anterior, conhecida, e o CI não a barra.
