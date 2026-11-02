# Protocolo de sincronia Lovable ↔ GitHub ↔ Claude Code (01/11/2026)

Autorizado pela Proprietária em 01/11/2026 (S1 a S7 do plano de sincronia). Motivo: o commit `00ab0cc5` do
editor do Lovable mesclou sobre uma base antiga e derrubou 101 arquivos; a restauração foi feita duas vezes
(`fc8c865`, #211) porque nada acusou a perda. Nos 7 dias anteriores: 143 commits do editor, 109 do Claude, 26 seus.

## O que está automatizado

| # | Peça | Onde |
| --- | --- | --- |
| S1 | Alarme: após cada push na `main`, `scripts/detectar-regressao-merge.sh` conta arquivos que um merge perdeu ou reverteu (limite 10) e abre issue `alerta-sync`. Commit simples só conta se vier do editor | `.github/workflows/alarme-regressao-main.yml` |
| S2 | O CI da `main` deixa de ser cancelado a cada commit; só PR cancela o run anterior | `.github/workflows/ci.yml` |
| S3 | Regras de sincronia no *knowledge* do projeto Lovable (puxar a `main` antes de editar, parar se o merge removeria arquivo que o editor não tocou) | projeto Lovable `1a628b61-…` |
| S6 | Painel de sincronia (issue `painel-sync`) também atualiza a cada push na `main`, com espera de 90 s para juntar a rajada do editor; sem comentário a cada push | `.github/workflows/sync-report.yml` |
| S7 | PRs de um assunto só, atrás da `main` por merge commit, sem rebase/squash/force push, aviso acima de 60 arquivos | `.github/workflows/sync-guard.yml` (já em vigor) |

## S4: janela de edição

### Complemento aprovado em 02/11 — evidências por PR

- O modelo de PR declara responsável, base, SHA testado, arquivos reservados e matriz requisito/teste/evidência. Arquivos declarados em duas PRs abertas produzem falha de sobreposição; a transferência exige retirar a reserva da tarefa anterior.
- `scripts/pr-evidence.mjs` valida a declaração pelo SHA exato, mantendo PASSOU separado de pendências. Links presentes não provam autenticidade, aceite da Proprietária ou execução integral.
- `sync-guard.yml` usa o validador da base confiável, não código fornecido pela PR. O primeiro corte instala esse validador na base; até sua integração autorizada não existe proteção remota nova em operação.
- `sync-report.yml` audita retrospectivamente todas as PRs integradas, com paginação e artefato completo; CI, integração, declaração de evidências e publicação são campos distintos. PRs históricas sem matriz ficam não verificadas, nunca automaticamente concluídas.
- O SHA de publicação do painel é declaração manual, não verificação independente do endereço público.
- Verificação em 02/11: API retornou `Branch not protected` e nenhuma regra adicional aplicável à main. Os workflows não impedem merge enquanto seus checks não forem exigidos por proteção/ruleset configurado pela Proprietária com autorização específica.
- Não há integração MCP nem envio automático de instruções ao Claude: os agentes compartilham o protocolo e as verificações do GitHub. Branches isolam código; a prévia e o publicado deste projeto compartilham dados.

1. Quando a Proprietária edita no Lovable, o Claude Code **não empurra na `main`** e só trabalha em branch
   `claude/*`, com PR em rascunho.
2. Merge de PR do Claude só com o editor parado: nenhum commit de `gpt-engineer-app[bot]` nos últimos 10 minutos
   e `agentFinished: true` no projeto (a skill `/lancar` já exige).
3. Antes de abrir ou atualizar um PR: `git merge origin/main` na branch (merge commit, nunca rebase).
4. Se o alarme S1 abrir issue `alerta-sync`, ninguém publica até a issue ser resolvida: restaurar por merge
   corretivo ou registrar na issue que a remoção foi proposital.

## S5: territórios

Arquivos que **os dois lados** mais editaram nos últimos 30 dias (editor / Claude), onde nasce o conflito.
Regra: enquanto o editor está ativo, o Claude Code não edita estes arquivos; propõe a mudança em PR e espera.

| Editor | Claude | Arquivo |
| ---: | ---: | --- |
| 19 | 15 | `src/routes/_authenticated/casos.$caseId.index.tsx` |
| 20 | 10 | `src/routes/portal/conta.tsx` |
| 9 | 8 | `src/lib/persistencia.server.ts` |
| 8 | 8 | `src/routes/_authenticated/fontes-genealogicas.tsx` |
| 8 | 11 | `src/lib/contratos.functions.ts` |
| 8 | 10 | `src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx` |
| 11 | 8 | `src/lib/navegacao-desk.ts` |
| 9 | 7 | `src/routes/_authenticated/contratos.$id.tsx` |
| 9 | 7 | `src/lib/portal.functions.ts` |
| 15 | 7 | `src/routes/portal/documentos.tsx` |
| 14 | 7 | `src/routes/_authenticated/painel.tsx` |
| 12 | 7 | `src/routes/portal/jornada.tsx` |
| 12 | 7 | `src/components/saas/shell.tsx` |
| 11 | 7 | `src/components/portal/portal-shell.tsx` |
| 17 | 7 | `src/integrations/supabase/types.ts` (gerado: só o editor) |

Divisão geral: o editor cuida de telas e de dados de caso; o Claude Code cuida de `src/lib` (regras), testes e `docs`.
Medido por `git log --since='30 days ago' --no-merges`, contando commits por arquivo (não linhas).
