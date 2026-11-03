---
name: understand
description: Mapeia o repositório (grafo de dependências de src/ por domínio, módulos sem importador) e confere as pendências de lançamento contra o plano, o Git, o GitHub e supabase/pendentes. Use quando a Proprietária pedir para entender/mapear o projeto, gerar o grafo, ou saber "o que falta para lançar". Só leitura: não commita, mescla, aplica migration nem publica.
---

# Entender o projeto: grafo + pendências de lançamento

Substitui o comando `/understand-anything:understand`, que não existe nesta sessão.
Regras do `AGENTS.md` valem: nada de migration, merge, deploy ou convite sem
autorização explícita. Esta rotina só lê e escreve em `docs/grafo/`.

## Passos

1. **Grafo.** `node scripts/gerar-grafo.mjs` (sem dependências). Gera em `docs/grafo/`:
   - `grafo-codigo.json`: nós (arquivo, domínio, importadores de produção e de teste) e arestas. Regenerável; não commitar.
   - `grafo-dominios.mmd`: Mermaid com as dependências entre domínios (`components/*`, `routes/*`, `lib`…).
   - `orfaos-sem-importador.txt`: módulos sem importador de produção (exclui rotas, `*.functions.ts`, `integrations` e `components/ui`).
2. **Órfãos × veredicto.** Cada órfão precisa estar em `src/lib/orfaos-modulos-classificados.ts` ou `src/lib/orfaos-classificados.ts`. O que faltar vira pendência.
3. **Plano.** Leia `docs/PLANO-MESTRE-LANCAMENTO-*.md` e `docs/PLANO-TAREFAS-*.md` mais recentes. Os números do plano têm data: confirme o que puder antes de repetir.
4. **Git e CI.** `git fetch origin main`; `HEAD` da main; run do `ci.yml` desse SHA (`actions_list`) precisa estar `success`.
5. **PRs.** `list_pull_requests` abertas; separe as que o plano cita das antigas.
6. **Banco.** Cabeçalho `ESTADO:` de cada `supabase/pendentes/*.sql`. Cabeçalho pode estar velho; confirmar no banco exige a ferramenta do Lovable e autorização (só `SELECT`).
7. **Relatório.** Escreva `docs/grafo/PENDENCIAS-LANCAMENTO-<data>.md`: o que foi verificado agora, o que veio só do plano (sem remedir), e o que depende da Proprietária, por dono (C, L, P).

Publicar é outra rotina: use `/lancar`.
