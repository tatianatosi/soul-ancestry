# Fluxo de lançamento — Git, Lovable e Claude Code

Regra de ouro: um assunto por PR, a main só recebe PR verde, e nada vai ao ar sem Publish no Lovable.

## Quem faz o quê

| Camada | Quem escreve | Como chega ao ar |
|---|---|---|
| Código (src, docs) | Claude Code em branch `claude/*`; Lovable direto na `main` | PR, merge com autorização da Proprietária, Publish no Lovable |
| Banco | Só o chat do Lovable | SQL proposto em `supabase/pendentes/`, aplicado no chat, cabeçalho vira `ESTADO: JÁ APLICADO em AAAA-MM-DD` |
| Produção | Lovable | Botão Publish. Merge na main não publica sozinho |

## Rotina de cada entrega

1. Antes de começar: `scripts/sync-check.sh`. Se a branch estiver atrás da main, `git merge origin/main` (merge commit, nunca rebase nem squash).
2. Trabalhar em PR pequena (até 60 arquivos, um assunto, título que descreve o conteúdo).
3. Antes de abrir ou atualizar a PR: `scripts/sync-check.sh --full`.
4. CI e Sync Guard verdes. Conflito com a main bloqueia PR pronta.
5. Merge na main só com autorização explícita.
6. Publish no Lovable no mesmo dia. Depois, rodar o workflow "Painel de sincronização" com `marcar_publicado`.
7. Se houver SQL em `supabase/pendentes/`, aplicar pelo chat do Lovable e atualizar o cabeçalho.

## O que a automação cobre e o que não cobre

- Cobre: bloqueio de migrations por agentes, `.env`, PR em conflito, PR gigante, cabeçalho ESTADO, build no CI, painel diário com PRs, branches lovable-sync, commits não publicados e migrations pendentes.
- Não cobre: o Publish em si, a aplicação de SQL no banco e a prova autenticada da Proprietária. Esses passos continuam manuais por decisão do AGENTS.md.
- O painel só sabe o último Publish se alguém o registrar no passo 6.

## Proibido

- Usar `pipeline.py` da raiz sem decisão da Proprietária: ele faz checkout e push direto na main, o que contradiz a decisão de 23/10/2026.
- Rebase, squash ou force push em branch já publicada.
- Reativar a Vercel sem nova decisão registrada.
