# 09 — Autoria e responsabilidade (correção obrigatória, Seção 1)

## Registro de governança

- A recuperação representada pelas **PR #87** e **PR #88** foi conduzida, segundo declaração da proprietária, pelo **Perplexity Computer**. Essa autoria de condução **não é verificável tecnicamente pelos metadados do Git** — o GitHub só registra quem é dono da conta que abriu/mesclou a PR e quem assina cada commit, não qual ferramenta ou pessoa operou a sessão. Este documento registra a declaração da proprietária como fato de governança, sem reivindicar ou contestar tecnicamente a autoria de condução.
- O nome de **Claude** em commits, `Co-authored-by`, descrição de sessão ou metadados Git é **autoria/coautoria técnica de commits específicos**, nunca prova de liderança, condução ou crédito exclusivo por uma recuperação inteira.
- A conta `tatianatosi` aparece como autora de PR, criadora de deploy ou merged-by porque as ferramentas operam dentro da sessão/conta da proprietária — isso é metadado Git de propriedade de conta, não atribuição de iniciativa.

## PR #87 — "Recovery: operational authority across Desk and App Cliente"

| Campo | Valor | Fonte |
|---|---|---|
| Autora da PR (conta GitHub) | `tatianatosi` | GitHub API |
| Executor/condução declarado | Perplexity Computer (declaração da proprietária nesta conversa) | Declaração da usuária |
| Autoria de commit | Não coletada nesta rodada (exigiria `get_commits` por PR) | — |
| Quem mesclou | Não retornado pela API para esta PR (`merged_by` nulo no payload obtido) | GitHub API |
| Criada | 2026-09-05T18:41:46Z | GitHub API |
| Mesclada | 2026-09-05T19:19:23Z | GitHub API |
| Está em `main` | Sim (mesclada com base `main`) | GitHub API |
| Estado funcional comprovado | Não avaliado nesta rodada (exigiria diff completo da PR) | — |

## PR #88 — "Recovery: liga a autoridade operacional tela a tela (fiação da PR #87)"

| Campo | Valor | Fonte |
|---|---|---|
| Autora da PR (conta GitHub) | `tatianatosi` | GitHub API |
| Executor/condução declarado | Perplexity Computer (declaração da proprietária) | Declaração da usuária |
| Commits reais identificados nesta PR | 3 commits com autor `Tatiana Tosi <tati@pluggedresearch.com>` (e-mail real, verificável): `9f5b319` "destrava as telas pendentes", `ab6c9f0` "27 guards de cerimonia cedem a proprietaria", `9a1c47b` "autoridade da proprietaria nos guards" | `git log`, deployments Vercel (githubCommitAuthorEmail confere) |
| Quem mesclou | Não retornado pela API para esta PR | GitHub API |
| Criada | 2026-09-05T20:58:11Z | GitHub API |
| Mesclada | 2026-09-05T21:47:36Z | GitHub API |
| Está em `main` | Sim | GitHub API |
| Está em produção | Sim — os 3 commits acima são ancestrais do SHA de produção atual | `git merge-base --is-ancestor` |

## PR #89 — "Zera as travas de autoridade em todo o repositorio"

| Campo | Valor |
|---|---|
| Autor do commit único (`43fd0ac`) | Tatiana Tosi `<tati@pluggedresearch.com>` — e-mail real da proprietária, confirmado pelo `creator.email` do deployment Vercel correspondente |
| Executor/condução | Commit real da proprietária, não atribuível ao Perplexity Computer nem à Claude |
| Está em `main` e em produção | Sim |

## PR #90 — "Servidor para de recusar a decisao da proprietaria"

| Campo | Valor |
|---|---|
| Autor do commit único (`2cba76b`) | Tatiana Tosi `<tati@pluggedresearch.com>` |
| Executor/condução | Commit real da proprietária |
| Está em `main` e em produção | **Sim — é o commit mais recente em produção agora** (`4ee6f6d`, merge da PR #90). As correções de servidor para SKU em lote, promoção a cliente ativo, aprovação de prévia contratual e versão final de contrato descritas neste commit estão ao vivo. |

## Separação de papéis exigida pela Seção 1 (resumo)

| PR | Executor/condução | Autora da PR | Autoria de commit | Coautoria | Quem mesclou | Estado funcional |
|---|---|---|---|---|---|---|
| #87 | Perplexity Computer (declarado) | tatianatosi | não coletada | não coletada | não retornado pela API | não avaliado |
| #88 | Perplexity Computer (declarado) + commits reais de Tatiana Tosi | tatianatosi | Tatiana Tosi (3 commits confirmados) | — | não retornado pela API | em produção |
| #89 | Tatiana Tosi (commit real) | tatianatosi | Tatiana Tosi | — | não retornado pela API | em produção |
| #90 | Tatiana Tosi (commit real) | tatianatosi | Tatiana Tosi | — | não retornado pela API | em produção, mais recente |
