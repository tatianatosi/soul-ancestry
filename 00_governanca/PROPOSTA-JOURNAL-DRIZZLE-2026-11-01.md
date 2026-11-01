# Proposta — o que fazer com o journal do Drizzle (E1 do plano mestre)

Data: 2026-11-01
Status: **PROPOSTA — aguarda decisão da Proprietária.** Não decidida, não aplicada.
Origem: achado crítico #1 do `audit-as-prod-readiness` na auditoria full-spectrum de 01/11/2026
(`reviews/audit-as-prod-readiness.md`), já rastreado como item **E1** em
`docs/PLANO-TAREFAS-2026-10-31.md` desde 23/10/2026 ("P decide, C propõe em `supabase/pendentes/`").
Esta proposta cumpre essa linha — colocada aqui, em `00_governanca/`, e não em
`supabase/pendentes/`, porque nenhuma das duas opções abaixo é um `.sql` a aplicar pelo chat
do Lovable: é uma decisão de processo/documentação, não uma mudança de schema.

## 1. O que foi medido hoje (01/11/2026, só leitura)

| Fonte                                   | Estado                                                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `drizzle/migrations/meta/_journal.json` | **3 entradas**: `0000_portal_sou_contratante_financeiro`, `0001_client_tab_dwell_events`, `0002_ativacao_cede_a_proprietaria` |
| `drizzle/schema.ts`                     | 1 linha: `// auto-generated and intentionally left blank, do not edit` — **vazio**                                            |
| `supabase/migrations/*.sql`             | **236 arquivos**                                                                                                              |
| `supabase/pendentes/*.sql`              | 12 arquivos, a maioria já `JÁ APLICADO` (ver `supabase/pendentes/README.md`)                                                  |

A lacuna já estava registrada em 23/10 como 2 entradas do journal × 234 migrations brutas; hoje
são 3 × 236 — **cresceu**, não encolheu, porque todo trabalho de schema recente (as 12 propostas
de `supabase/pendentes/`, aplicadas pelo chat do Lovable) continuou fora do Drizzle.

## 2. Por que a lacuna existe e por que não é um bug de hoje

- Este projeto tem **dois caminhos de schema**: a "ferramenta de migração gerenciada" (Drizzle,
  journal de 3 entradas) e o chat do Lovable (aplicando SQL de `supabase/pendentes/`, histórico em
  `supabase/migrations/`). `AGENTS.md` já nomeia os dois: "Approved existing support migrations are
  applied through the managed migration tool and recorded in its Drizzle journal" — ou seja, só
  uma fatia do trabalho de schema nunca passou pelo Drizzle, por desenho: a Proprietária decidiu
  (`00_governanca/DECISAO-HOSPEDAGEM-LOVABLE-UNICA-2026-10-23.md`) que produção e banco são só
  Lovable, e "o Lovable não executa migrações que chegam pelo GitHub" — então o caminho real de
  aplicação é sempre o chat, nunca um `drizzle push`/`migrate` direto.
- Eu (Claude Code) **nunca escrevo** em `drizzle/migrations/` nem em `supabase/migrations/` —
  regra dura do `AGENTS.md`. Isso significa que, mesmo que eu quisesse reconciliar o journal, não
  posso fazer isso sozinho: a aplicação de qualquer baseline teria que passar pela mesma ferramenta
  gerenciada que grava as 3 entradas existentes, com autorização explícita, por item.

## 3. Duas opções

### Opção A — Documentar o limite (não mexer no journal)

Registrar formalmente, em `drizzle/README.md` (criar, se não existir) e num parágrafo do
`AGENTS.md`, que:

- o journal do Drizzle (3 entradas) **não é** o histórico completo de schema deste projeto;
- o histórico completo e a fonte de verdade operacional são `supabase/migrations/` (236 arquivos,
  aplicados pelo Lovable) + `supabase/pendentes/` (propostas em trânsito);
- o Drizzle só registra os schemas que passaram pela ferramenta de migração gerenciada
  especificamente (hoje, 3 casos pontuais: contratante financeiro, telemetria de aba do cliente,
  ativação cede à proprietária).

**Custo:** quase zero — é só escrever a frase que já é verdade e deixar de tratar a lacuna como
pendência aberta.
**Risco:** nenhum — não toca schema, não toca dado, não precisa de credencial de banco.
**Limite:** o journal continua não sendo canônico. Se um dia a equipe quiser rodar
`drizzle-kit generate`/`migrate` contra o banco real a partir do `schema.ts` (hoje vazio), a
ferramenta vai assumir que o banco só tem os 3 schemas do journal — e vai tentar recriar, do zero,
tudo que já existe via `supabase/migrations/`. Documentar o limite não evita esse acidente; só o
nomeia.

### Opção B — Baseline do banco real no Drizzle

Gerar, a partir do banco de produção real (introspecção, não uma migration que muda algo), um
`drizzle/schema.ts` que reflita o estado atual das 194+ tabelas e marcar esse baseline como já
aplicado no journal (uma entrada nova, sem SQL executável de verdade — ou com SQL que é puro no-op
porque tudo já existe). A partir daí, o journal e o banco real ficam sincronizados, e qualquer
mudança futura feita _pela ferramenta gerenciada_ entra no mesmo histórico.

**Custo:** exige rodar `drizzle-kit introspect`/`pull` com `LOVABLE_DB_MIGRATION_URL` apontando
para o banco de produção real — ou seja, uma credencial de escrita/leitura de schema contra
produção, que hoje não está configurada neste ambiente (a variável existe no `drizzle.config.ts`
mas não foi testada aqui). É trabalho de uma sessão específica para isso, com a credencial
liberada e autorização explícita por ser uma operação de schema (mesmo que read-only na prática).
**Risco:** baixo se feito por introspecção pura (não deveria alterar nenhuma tabela), mas qualquer
operação que toque a ferramenta de migração contra produção merece a mesma cautela de uma
migration — por isso seria tratada como tal, com autorização por item, nunca por mim sem essa
autorização.
**Ganho:** o journal passa a ser confiável como _parte_ do histórico real (ainda não substitui
`supabase/migrations/` como registro cronológico de 236 mudanças — isso exigiria importar o
histórico inteiro, trabalho maior e provavelmente não vale o esforço frente ao que ele resolveria).

## 4. Recomendação

Nenhuma falha concreta foi causada pela lacuna até hoje: toda mudança de schema continuou sendo
aplicada e auditada via `supabase/pendentes/` + chat do Lovable, com os dois caminhos já nomeados
no `AGENTS.md`. Diante disso, a Opção A (documentar) é a que resolve o achado da auditoria — "o
journal não reflete a realidade" deixa de ser um fato não-escrito e passa a ser um fato escrito —
sem abrir uma frente de trabalho contra produção que não tem, hoje, uma necessidade concreta
puxando por ela. A Opção B fica registrada para quando (se) a equipe quiser usar o Drizzle para
gerar migrations novas a partir de um `schema.ts` que reflita o banco real — o que hoje não
acontece (os schemas.ts atuais são 1 linha vazia).

**Peço a decisão da Proprietária**: A, B, ou nenhuma das duas (manter como está, registrado como
risco aceito).

## 5. O que acontece depois da decisão

- Se **A**: abro PR com o `drizzle/README.md` novo e o parágrafo no `AGENTS.md`, sem tocar schema.
- Se **B**: preciso da variável `LOVABLE_DB_MIGRATION_URL` configurada neste ambiente (ou que a
  introspecção seja feita por quem já tem acesso de produção) e autorização explícita para essa
  operação, por ser contra o banco real.
