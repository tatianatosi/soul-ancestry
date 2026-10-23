# Decisão — Hospedagem única no Lovable e desligamento da Vercel

Data: 2026-10-23
Decisão da Proprietária (Tatiana Tosi): a produção do Clube Ancestral passa a ser **somente o Lovable** (`soul-ancestry.lovable.app`). A Vercel foi desligada.
Status: VIGENTE. Esta decisão substitui qualquer instrução anterior que trate a Vercel como produção ou prévia oficial.

## 1. Motivo

- Com o Lovable Cloud (banco `liiqqibnirnpnvjmjrpj`), a chave service role não sai do Lovable. Na Vercel, as funções de servidor que dependem dela (controle de tentativas do login, Caso 360, CRM e outras) falham. Por isso o Desk na Vercel nunca ficou igual ao do Lovable.
- Os builds da Vercel dependem do registro npm privado do Lovable. Em 23/10/2026, duas publicações sem cache falharam com erro 429.
- Duas hospedagens publicando versões diferentes causavam divergência constante.

## 2. O que foi feito em 2026-10-23

1. As variáveis da Vercel foram realinhadas para `liiqq…`, e as 18 credenciais do banco congelado `zsxpd…` foram removidas.
2. Login: a remoção da chave service role travou o controle de tentativas. A produção da Vercel foi revertida para `dpl_FXPqZz9d75xqPSr9Z1oDHBkLMgGD`, e o login voltou a funcionar.
3. Vercel desligada: a ligação com o GitHub foi desfeita (sem publicações automáticas e sem e-mails de falha), e o projeto `soul-ancestry` foi pausado. `soul-ancestry.vercel.app` responde 503.
4. Nada se perdeu: a Vercel só publicava o GitHub `main`. Todo o código que estava lá já está em `main` (o commit de produção era `ffdbac1`, que é o `main` atual).

Para reverter: no painel da Vercel, retomar o projeto (Resume) e religar o repositório em Settings → Git.

## 3. Como fica o fluxo

```
Claude Code → branch claude/* → PR → merge em main (com autorização da Proprietária)
        ↓ sincronização automática nos dois sentidos
Lovable (editor) → Publish → soul-ancestry.lovable.app (ÚNICA PRODUÇÃO)
Banco: Lovable Cloud liiqqibnirnpnvjmjrpj (mudanças só pelo chat do Lovable)
```

- O GitHub `main` ↔ Lovable sincroniza sozinho.
- O site publicado no Lovable **não atualiza sozinho**. A documentação do Lovable diz que as mudanças não vão para o ar automaticamente e que é preciso clicar em Publish → Publish changes (https://docs.lovable.dev/features/publish). Depois de cada merge, publique no Lovable ou peça a publicação no chat (a ferramenta de publicação do chat pode ficar com aprovação automática).
- O Lovable não executa migrações nem publica Edge Functions que chegam pelo GitHub (https://docs.lovable.dev/integrations/git-sync-overview). Isso é feito pelo chat do Lovable.
- O Claude Code valida o visual localmente (`bun run dev` / build) ou pela prévia do editor do Lovable. Não existe mais prévia na Vercel.

## 4. Auditoria das PRs em 2026-10-23

Total: 175 PRs, sendo 140 mescladas, 28 abertas (17 rascunhos) e 7 fechadas sem merge.

### 4.1 Mescladas
Todas as 140 PRs mescladas estão no histórico de `main`, e portanto também no Lovable. A Vercel publicou até `ffdbac1` (PR #174).
Duas PRs recentes tiveram arquivos alterados depois pelo Lovable (commits "Changes" de 19/10). Só uma parte do texto delas continua em `main`:
- #155 `feat(hoje)`, funil e cadências V4: cerca de 28% das linhas continuam no código atual.
- #169 `fix(nav)`, 8 telas no menu do Desk V4: cerca de 24% das linhas continuam no código atual.
É preciso conferir na tela se essas mudanças foram substituídas de propósito, pela casca V4 da PR #171, ou se foram sobrescritas.

### 4.2 Abertas (nunca foram para o ar — é por isso que "não subiram")

| PR | Estado | Criada | Branch | Título |
|---|---|---|---|---|
| #177 | rascunho | 2026-10-23 | `claude/rateio-igualitario-ana` | Rateio do caso da Ana Luiza: texto passa a dizer rateio igualitário |
| #176 | rascunho | 2026-10-23 | `claude/laudo-prontidao-producao` | Laudo de prontidão de produção da camada de servidor |
| #175 | rascunho | 2026-10-22 | `claude/composicao-ops-v4` | Kanban de /ops: leitura mobile dos KPIs (corte 2/3 do plano de acabamento) |
| #173 | aberta | 2026-10-20 | `fix/ana-luiza-historico-contrato-2026-10-20` | fix(ana-luiza): histórico do contrato vindo do banco antigo + complemento de cadastro |
| #172 | aberta | 2026-10-20 | `chore/congelar-banco-proprio-2026-10-20` | chore(banco): congelar Supabase próprio e adotar banco único (Lovable Cloud) |
| #170 | rascunho | 2026-10-18 | `claude/force-rls-167-tabelas` | feat(segurança): FORCE ROW LEVEL SECURITY nas 167 tabelas com RLS |
| #151 | rascunho | 2026-10-13 | `claude/saneamento-documentos-ficticios` | Saneamento: remove documento fictício do acervo vazio em /portal/documentos |
| #142 | rascunho | 2026-10-12 | `docs/cartographer-app-cliente` | docs(mapa): mapa do App Cliente (portal) gerado pelo Cartographer |
| #125 | aberta | 2026-09-12 | `fix/background-card-cor-oki-nao-aplicada` | fix: --background/--card do :root nunca receberam o creme OKI aprovado |
| #121 | rascunho | 2026-09-11 | `cursor/legado-arquivo-github-0ed5` | Arquivar Planilha, SKU e conciliação só no GitHub |
| #120 | rascunho | 2026-09-11 | `cursor/casos-360-macro-cenario-5722` | Caso 360: macro operacional (sem muro de pesquisa/financeiro) |
| #118 | rascunho | 2026-09-11 | `cursor/motor-planejador-ponta-a-ponta-fced` | fix(planejador): motor ponta a ponta — hidratar, fase, ativo e espelho |
| #117 | rascunho | 2026-09-11 | `cursor/cadeia-caso-360-planejador-0ed5` | Caso 360: cadeia legado → lista-alimento → planejador → App → WhatsApp |
| #116 | aberta | 2026-09-11 | `cursor/desk-face-7-telas-nav-722e` | Desk: face de 7 telas + 6 grupos internos (decisão 2026-09-11) |
| #115 | aberta | 2026-09-11 | `cursor/desk-face-7-telas-3a20` | Face do Desk: 7 telas do mockup, 6 grupos só por dentro |
| #114 | rascunho | 2026-09-11 | `cursor/pessoa-360-cards-0ed5` | Pessoa 360: mapa em cards da família, pesquisa, achados, proposta, contrato, Discovery e W |
| #112 | aberta | 2026-09-11 | `cursor/circuito-abas-mesa-kpis-efd3` | CRM Journey + face Desk 7 telas (decisão de navegação) |
| #111 | aberta | 2026-09-11 | `cursor/desk-sistema-operacional-dia-5722` | Desk: sistema operacional do dia no Painel Hoje |
| #110 | aberta | 2026-09-11 | `cursor/crm-journey-painel-calls-8085` | CRM Journey na memória + Painel de Calls / CRM vivo |
| #108 | aberta | 2026-09-11 | `cursor/relatorio-tarefas-aba-mesa-3a20` | Quadro vivo de tarefas da Mesa (manhã e fim do dia) |
| #105 | rascunho | 2026-09-11 | `cursor/registro-prova-autenticada-5d7b` | Registro vivo de prova autenticada — contexto não arquivável |
| #104 | aberta | 2026-09-11 | `cursor/adendo-contexto-nao-arquivavel-prova-fced` | docs: adendo vinculante — contexto não arquivável + prova autenticada |
| #102 | aberta | 2026-09-11 | `cursor/reset-confianca-mesa-discovery-d5d3` | Reset de confiança + SPIN na Mesa Discovery |
| #99 | rascunho | 2026-09-10 | `cursor/kpis-transversais-seis-abas-5d7b` | Face do Desk (7 telas) e cadeia legado → Caso 360 |
| #97 | rascunho | 2026-09-10 | `cursor/kpis-vivos-arquivo-catalogo-5d7b` | KPIs vivos no Hoje e arquivo GitHub do catálogo legado |
| #40 | rascunho | 2026-08-31 | `fix/contrato-botoes-redundantes` | Contrato: remove botões de ação redundantes com a navegação de abas |
| #35 | rascunho | 2026-08-30 | `fix/reconciliar-contratos-pr28-pr32` | Reconciliação contratos.$id.tsx — PR #28 × PR #32 |
| #32 | rascunho | 2026-08-30 | `feat/pessoa-salvar-tarefa-continuidade` | Pessoa: salvar com releitura real + decisão de tarefa; ajustes mobile |

Recomendação: decidir primeiro as PRs recentes do Claude (#177, #176, #175, #173, #172, #170). As PRs de setembro (`cursor/*`, #97–#125) e de agosto (#32–#40) provavelmente já foram superadas pela casca V4 e devem ser fechadas depois de revisão.

### 4.3 Branches `lovable-sync`
Existem 27 branches `lovable-sync*`, criadas entre 30/09 e 18/10 quando o Lovable e o GitHub divergiram. Em 22 delas há commits que nunca entraram em `main`, todos de UI do App Cliente e do Desk (Home, abas do portal, Conta, tela Hoje V4, fichas). Todas estão centenas de commits atrás de `main`. Não mesclar em bloco: revisar uma a uma depois que a casca V4 for publicada no Lovable. Desde 21/10, o Lovable grava direto em `main`.

## 5. Regras daqui em diante
1. A única produção é `soul-ancestry.lovable.app`. Não reativar a Vercel sem uma nova decisão registrada.
2. Todo merge em `main` deve ser seguido de Publish no Lovable no mesmo dia.
3. O Claude Code nunca escreve em `supabase/migrations/` nem em `drizzle/migrations/`. Mudanças no banco são propostas em `supabase/pendentes/` e aplicadas pelo Lovable.
4. Se aparecer uma nova branch `lovable-sync`, mesclar com merge commit em até 24 h (nunca squash nem rebase).
