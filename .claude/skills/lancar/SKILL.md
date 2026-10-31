---
name: lancar
description: Rotina de lançamento no Lovable depois do merge — confere CI verde na main, sincronia Git↔Lovable, migrations pendentes e PRs em conflito; só então publica (deploy_project), confirma no ar e registra o Publish no painel de sincronização. Use quando a Proprietária pedir para lançar/publicar/sincronizar com o Lovable, ou para saber "o que falta para publicar".
---

# Lançar no Lovable

O Git é o único ponto de sincronização: o Lovable puxa a branch conectada (`main`)
sozinho. O que esta rotina cobre é o que vem **depois** do merge: conferir, publicar
e registrar.

## Autorização (leia antes de tudo)

O `AGENTS.md` proíbe deploy, migration e merge sem autorização explícita.

- Sem pedido explícito de publicar nesta conversa: rode **só os passos 1 a 4**
  (verificação) e termine com o relatório. Não chame `deploy_project`.
- Com pedido explícito ("pode publicar", "lance"): o pedido vale **só para esta
  execução** e **só para o HEAD da main verificado no passo 1**. Se a main avançar
  depois, volte ao passo 1.
- Aplicar migration de `supabase/pendentes/` **nunca** vem junto: exige autorização
  própria, e a regra 3 continua valendo (nada em `supabase/migrations/` nem
  `drizzle/migrations/`).

## Passos

1. **Git.** `git fetch origin main`; anote o `HEAD` da main. Liste PRs abertas com
   `mergeable_state: dirty` e branches `lovable-sync-*` paradas há mais de 24 h
   (merge commit, nunca squash/rebase). Conflito ou sync parada **não bloqueia** a
   publicação, mas entra no relatório.
2. **CI do HEAD.** `actions_list` do `ci.yml` na `main`: o run do `head_sha` anotado
   precisa estar `completed/success`. `in_progress` = espere; `failure` = **pare** e
   diga qual teste/checagem falhou. Nunca publique em cima de CI vermelho ou pendente.
3. **Lovable.** `get_project` (id `1a628b61-ec68-454f-85e1-671d6f297370`):
   - `latest_commit_sha` precisa ser igual ao HEAD da main. Diferente = o Lovable
     ainda não puxou (ou tem edição dele não sincronizada): pare e diga.
   - `project.agentFinished` precisa ser `true`; `false` = o agente do Lovable está
     editando, espere.
4. **Banco.** Leia o cabeçalho `ESTADO:` de cada `supabase/pendentes/*.sql`
   (e o README da pasta). **Cabeçalho pode estar velho** (já aconteceu em 31/10):
   confirme no banco com `query_database` (SELECT em `information_schema`) antes de
   tratar uma proposta como pendente, e corrija o cabeçalho se ela já foi aplicada. Se o código da main depende de uma proposta `NÃO APLICADO`
   (ex.: coluna que o TypeScript já lê), **bloqueie** e diga qual arquivo precisa de
   autorização. Propostas independentes só entram no relatório.
5. **Publicar** (só com autorização): `deploy_project` com o `project_id`. Guarde a
   URL devolvida.
6. **Conferir no ar.** Abra `<url>/api/saude`: precisa responder `ok: true`. Se `sha`
   vier preenchido, tem de ser o HEAD publicado; `sha: null` é limite conhecido do
   ambiente (não é falha) — registre assim, não invente.
7. **Registrar.** Antes, `git fetch` de novo: se a main ainda está no HEAD do passo 1,
   dispare `sync-report.yml` com `marcar_publicado=true` (`actions_run_trigger`,
   `run_workflow`) e confirme que a issue `painel-sync` mostra "Commits na main
   depois do último Publish: 0". Se a main avançou, **não marque** (marcaria um
   commit que não foi publicado): diga quantos commits ficaram de fora.

## Relatório final (curto)

Uma tabela com: HEAD da main · CI · Lovable em dia? · pendentes bloqueando? ·
publicado (URL) · registrado no painel. Mais, em uma linha cada, PRs em conflito e
syncs paradas. Não declare "no ar" sem o passo 6.

## O que esta rotina não faz

Não faz merge, não aplica migration, não resolve conflito, não mexe em
`supabase/migrations/` ou `drizzle/migrations/`.
