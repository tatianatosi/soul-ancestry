# Revisão das 225 branches e plano de lançamento — 30/10/2026

Lançamento = **Publish no Lovable**. Banco = **Supabase do Lovable**, alterado só pelo chat do Lovable
(ou por consulta SQL do projeto, com autorização). Código = PR pequena, merge com autorização.

Planilha completa, uma linha por branch: `docs/relatorios/2026-10-30-branches-classificadas.csv`.

## 0. Resumo

1. **O `main` não perdeu histórico.** Relatórios anteriores (inclusive um meu, nesta sessão) disseram
   que o histórico tinha sido reescrito. Não foi: o clone do ambiente era raso (`shallow`). Com o
   histórico completo (5.969 commits), toda branch tem base comum com o `main`.
2. Das 225 branches, **126 foram mescladas** e **99 nunca entraram no `main`**.
3. O que nunca entrou e ainda importa está concentrado em **uma branch**: `claude/modest-carson-28pij2`
   (PR #197, título enganoso "chore: ignora .cartographer/"). Ela tem ~50 commits de correções de
   pré-lançamento de 25 a 29/10, incluindo segurança e privacidade, a auditoria das 195 PRs e um plano de
   lançamento. Quase nada disso está no `main`. **É por isso que as auditorias "não resolviam": as
   correções ficaram presas numa PR que ninguém mesclou.**
4. Parte desse trabalho foi aplicada **no banco** e não no código. Exemplo verificado hoje: o banco já
   trata `user_roles.archived_at` (arquivamento de papel), mas o código do `main` ainda apaga a linha
   (`.delete()` em `equipe.server.ts:97,196,221` e `saas.functions.ts:1134`).
5. As PRs antigas de setembro (#110, #114, #117, #118, #120 etc.) não foram executadas, mas foram
   **superadas por decisões posteriores** (Desk V4 em 18–19/10, Caso 360 macro e GoLive em 23/10).
   Não são bloqueio de lançamento.
6. O que bloqueia o lançamento são três coisas: **uma correção de privacidade fora do `main`**, **CI
   vermelho por 13 testes de texto** e **dados da cliente piloto** (sem acesso ao App, sem fatura).

## 1. Método (reproduzível)

- `git fetch --unshallow`; `origin/main` em `ecbf1c30` (30/10 17:40).
- Base de cada branch = primeiro commit da sua cadeia *first-parent* que também está na cadeia
  *first-parent* do `main`. Diferença própria = base..ponta.
- Para cada linha de código acrescentada (`src/`, `supabase/`, `drizzle/`; ignorando linhas curtas,
  imports e comentários), verifica se a linha existe hoje em qualquer arquivo do `main`. Testes medidos
  à parte. Documentos medidos contra `docs/` e `*.md`.
- Limites: mede **presença de código**, não comportamento. Linha presente não prova tela ligada; linha
  ausente pode ter sido reescrita com outras palavras. Nenhuma branch foi executada.

## 2. Resultado por grupo

| Grupo | Qtde | Mescladas e vivas | Já no main por outro caminho | Mescladas e depois reescritas | Parciais (fora do main) | Não executadas | Só documentos | Outros |
|---|---|---|---|---|---|---|---|---|
| claude/* | 55 | 24 | 3 | 11 | 5 | 3 | 6 | 3 |
| docs/* | 36 | 0 | 2 | 0 | 0 | 0 | 34 | 0 |
| cursor/* | 34 | 3 | 4 | 0 | 13 | 9 | 4 | 1 |
| fix/* | 31 | 9 | 3 | 5 | 4 | 4 | 2 | 4 |
| lovable-sync* | 28 | 0 | 3 | 6 | 1 | 15 | 2 | 1 |
| feat/* | 13 | 5 | 0 | 4 | 1 | 1 | 1 | 1 |
| recovery/* | 12 | 8 | 1 | 2 | 0 | 0 | 0 | 1 |
| demais | 16 | 2 | 2 | 4 | 2 | 0 | 3 | 3 |
| **Total** | **225** | **51** | **18** | **32** | **26** | **32** | **52** | **14** |

Leitura:

- **Realidade executada em código: 69 branches** (51 mescladas e vivas + 18 cujo código chegou por
  outro caminho).
- **Mescladas e depois reescritas: 32.** É evolução normal (ex.: #188, #190 e #191 foram retiradas de
  propósito pela #196, "remove as camadas de bloqueio").
- **Só documentadas: 52** (34 das 36 `docs/*`). Documento não é funcionalidade; ficam como histórico.
- **Feitas pela metade ou nunca executadas: 58** (26 parciais + 32 não executadas). Detalhe na seção 3.

## 3. O que não foi executado — e o que fazer com cada um

### 3.1 PR #197 — `claude/modest-carson-28pij2` (a que importa)

62 commits fora do `main`. Por commit, a fração do código que existe hoje no `main`:

| Tema | Commit | No main | Lançamento? |
|---|---|---|---|
| Privacidade: achado podia ser compartilhado com cliente de **outra família** | `ee897bdd` | 15% | **Sim, bloqueia.** Verificado hoje: a policy `app_projection_shares_portal_ins` só confere organização e titular, e o guarda do servidor não está no `main`. |
| Texto cru do banco e status interno de fatura chegando ao cliente | `ff2c6ada` | 5% | Sim |
| Matriz jurídica lida sem filtro de organização; injeção em evento de conversão | `64a504cf` | 37% | Sim |
| Faturas só ao contratante em `meuCaso`; tamanho/tipo do upload conferido no servidor | `57bec33a` | 12% | Sim |
| Cliente reconvidado ficava trancado (2 linhas de acesso); login da equipe podia trancar o e-mail da Proprietária | `f1c40e23` | 35% | **Sim**: é o caminho do convite da Ana |
| `user_roles`: arquivar em vez de apagar (banco já aplicado) | `a447913a` | 36% | Sim (regra "sem exclusão física") |
| Crítico 1 (banco aplicado) + override de cláusula fase 2 | `5ceaa508` | 48% | Parte de banco feita; conferir código |
| Faturas dentro da Conta + portão de prévia | `09ae382e`, `91682bc6` | 30–33% | Conferir se a Conta atual já tem Faturas |
| Contrato: PDF/DOCX do dado atual, pt-BR | `bf368f3d`, `fc6d186d`, `5900888d`, `0fca9cda` | 9–24% | Pós-lançamento, se o contrato da Ana já estiver resolvido |
| App: Radar, Jornada, Documentos/Legado | `f9a2764b`, `98a362a5`, `aa0c19e4` | 26–46% | Não: o Lovable reescreveu essas telas depois |
| Laudo #189 peças A, B e C (inventário de portões, tradutor de recusa) | `d65a07b7`, `97d4e5c8`, `5785f6ef` | 4–66% | Pós-lançamento |
| `/api/saude`, onError no Desk, guardas da navegação | `c18aff00`, `61636623`, `af32c0ba` | 15–26% | Pós-lançamento |
| Auditoria das 195 PRs, idioma pt-BR, plano de 26/10 | `6fa39f3d` | só docs | Registro: esta revisão a substitui |

**Não mesclar a #197 inteira.** O Lovable reescreveu os mesmos arquivos depois (só `casos.$caseId.index.tsx`
diverge em 5 mil linhas). O certo é **portar as 6 correções de segurança** (linhas "Sim") para o `main`
de hoje, em uma PR pequena, e fechar a #197 com referência a este documento.

### 3.2 PRs abertas

| PR | Conteúdo | Medição | Recomendação |
|---|---|---|---|
| #32 | Pessoa: salvar + tarefa (30/08) | parcial, 79% | Fechar: superada |
| #97 | KPIs vivos no Hoje (11/09) | parcial, 80% | Fechar: Hoje refeito na #168 |
| #102 | Reset de confiança + SPIN na Mesa Discovery | parcial, 72% | Pós-lançamento: decidir o SPIN |
| #104 | Adendo "contexto não arquivável" (docs) | docs, 65% | Fechar |
| #105 | Registro de prova autenticada | 85% já no main | Fechar |
| #108 | Quadro de tarefas da Mesa (docs, 12/09) | docs, 2% | Fechar |
| #110 | CRM Journey + Painel de Calls | 9% | Pós-lançamento: decidir se ainda vale |
| #114 | Pessoa 360 em cards | 27% | Pós-lançamento (Pessoa 360 V4, #150, já cobre parte) |
| #117, #118, #120 | Cadeia/motor/macro do Caso 360 (11/09) | 4–36% | Fechar: superadas pela decisão de 23/10 (Caso 360 macro + GoLive) |
| #121 | Arquivar Planilha/SKU | parcial, 45% | Fechar |
| #125 | Creme `#ECDFCD` no `:root` | 0% | Fechar se a paleta de 26/10 for a aprovada (decisão sua) |
| #142 | Mapa do App (Cartographer) | 98% no main | Fechar |
| #197 | ver 3.1 | 53% | Portar segurança e fechar |
| #199 | README de pendentes | 95% no main | Fechar |
| #201 | SQL que revoga `anon` (já aplicado) + este relatório | docs | Mesclar |

Mescladas hoje: #151 (saneamento de documentos fictícios) e #173 (histórico do contrato da Ana).

### 3.3 `lovable-sync*` (28)

Edições do Lovable de 08 a 18/10 que ficaram em branches de sincronização: Conta, Home, Painel Hoje,
`portal-v11.css`. 15 não estão no `main`, mas **todas as telas que elas tocam foram refeitas depois**
(25 a 30/10). Não há nada a recuperar para o lançamento. Depois do lançamento, apagar com sua
autorização (é ação no GitHub).

### 3.4 Outras não executadas

`cursor/*` de 10–12/09 (Desk 7 telas, sistema operacional do dia, KPIs transversais): superadas pela
casca V4 (`GRUPOS_DESK`, 18–19/10). `fix/*` de 29/08–04/09 (#35, #40, #47, #78, #83): o
`contratos.$id.tsx` recebeu a mesma correção por outro caminho em 09/09.

## 4. Estado do banco hoje (Supabase do Lovable, leitura)

| Item | Estado |
|---|---|
| RLS | 195/195 tabelas; 556 policies; 27 tabelas sem `FORCE RLS` |
| Funções acessíveis sem login | 0 (corrigido hoje, PR #201) |
| Bootstrap do primeiro admin | fechado |
| Caso da Ana (`CA-CID-AT-FAM-2026-001`) | ativo; 14/14 portões; 25 publicações no App; 5 pessoas no núcleo; 2 tarefas abertas |
| Acesso da Ana ao App | **0 acessos ativos** |
| Fatura da Ana | **0** (a única emitida é do caso demo) |
| Contrato da Ana | `pending_data` (+1 arquivado). O portão "contrato assinado ou isenção" está validado |
| Pedidos de documento à família | 0 |
| Relatórios/entregas do Legado | 0 (vazio honesto) |
| Casos no banco | 4: demo, teste, Portugal individual (`pronto_para_ativar`) e Ana |

## 5. Plano de lançamento (sexta 30/10 → domingo 01/11; folga na segunda 02/11)

Quem faz: **P** = Proprietária · **L** = chat do Lovable (código direto e banco) · **C** = Claude Code (PR).

### Sexta 30/10 — decisões (P), sem código

| # | Decisão | Por que trava |
|---|---|---|
| D1 | Os 13 testes vermelhos: para cada grupo, a tela atual está certa (ajusto o teste) ou o teste está certo (restauro a tela)? Grupos: Documentos/caixa "Entregas" e atalho do Legado (5), Home "Hoje você está aqui"/"Achados da sua história" (2), Conta assinatura e "condição prevista" (2), esqueleto de carregamento (1), selo do caso (1), rótulo "Preparação do caso" na Jornada (1), Documentos com envio + Legado (1) | CI vermelho esconde qualquer falha nova |
| D2 | Abas do App no lançamento: `Home · Jornada · Radar · Árvore · Documentos · Legado · Conta` (AGENTS.md) ou `Painel · Jornada · Árvore · Descobertas · Documentos · Biblioteca · Conta` (`roadmap.md`, item aberto) | Duas fontes de verdade |
| D3 | Quem entra no lançamento: só a Ana (e Adair/Alice?) ou outras famílias | Define convites e o risco da falha de privacidade |
| D4 | Contrato da Ana: `pending_data` com portão validado. Isenção registrada ou falta assinar? E o rateio antigo que o Lovable deixou "aguardando decisão" | O App mostra contrato e condição |
| D5 | Casos demo e teste: ficam visíveis no Desk de produção? | Higiene do lançamento |
| D6 | Domínio: `soul-ancestry.lovable.app` ou `clubeancestral.com.br` | Se mudar, entra em `ORIGENS_PERMITIDAS` e nos redirects do Supabase |

### Sábado 31/10 — código e banco

| # | Quem | Tarefa | Pronto quando |
|---|---|---|---|
| S1 | C | PR "segurança pré-lançamento": porta da #197 `ee897bdd`, `ff2c6ada`, `64a504cf`, `57bec33a`, `f1c40e23` e o soft-delete de `a447913a` para o `main` atual | typecheck, build e testes dos arquivos tocados verdes; uma linha de teste por correção |
| S2 | C | PR "CI verde": aplica D1 aos 13 testes ou às telas | `vitest run` 0 falhas |
| S3 | P→L | Mescla S1 e S2; o Lovable recebe pelo `main` | `main` verde |
| S4 | L | Banco, pelo fluxo do próprio Desk (não SQL solto): convite de portal da Ana (e de Adair/Alice, se D3), fatura dela no Financeiro e pedidos de documento reais, se houver | consulta mostra acesso ativo e fatura no caso da Ana |
| S5 | L | Árvore no celular (plano atual do Lovable) | prévia em 375 e 320 px sem corte |
| S6 | P | Decide os 3 achados de "preço e contrato" da verificação de segurança do Lovable | lista fechada ou aceita com motivo |

### Domingo 01/11 — Publish e prova

| # | Quem | Tarefa |
|---|---|---|
| P1 | P | Prova na prévia: login da equipe, abrir o caso da Ana no Desk, `/app-cliente-como-pessoa?casoId=` nas 7 abas em 375 e 1280 px |
| P2 | P | Prova como cliente: a Ana (ou você, com o convite dela) recebe o link, entra e vê as 7 abas; Conta mostra a fatura só para a contratante |
| P3 | L | **Publish** no Lovable; registrar no "Painel de sincronização" (`marcar_publicado`) |
| P4 | P | Repetir P1 e P2 no link público |
| P5 | C | Leitura do banco depois do Publish: acesso usado, erros, nenhuma função aberta a `anon` |

**Critério de vai/não vai (domingo):** S1 mesclada e verde; Ana com acesso ativo; P2 feita pela
Proprietária com print. Se S1 não estiver pronta, o lançamento só pode abrir para **uma** família
(a falha de privacidade só se manifesta entre famílias diferentes).

### Depois do lançamento (não bloqueia)

- Fechar as PRs marcadas "Fechar" na seção 3.2, com link para este documento.
- Decidir #102, #110 e #114 (funcionalidades de setembro nunca executadas).
- Restante da #197: contrato PDF/DOCX, laudo #189, `/api/saude`, onError do Desk.
- `FORCE RLS` nas 27 tabelas restantes; policy de `app_projection_shares` conferindo o caso do
  destinatário (hoje só o servidor conferirá, depois de S1).
- Apagar branches `lovable-sync*` e as `docs/*` já registradas, com autorização.
- Manter `/api/saude` + painel de sincronização para saber o que está publicado.

## 6. Limites desta revisão

- Presença de código não é prova de uso. Nenhuma tela foi aberta e nenhum login foi feito.
- O Lovable pode ter corrigido algum item da #197 com outras palavras. Conferi a fundo dois:
  compartilhamento entre famílias (ausente) e `user_roles` (banco aplicado, código não).
- A lista de PRs é a do GitHub em 30/10 à tarde.
