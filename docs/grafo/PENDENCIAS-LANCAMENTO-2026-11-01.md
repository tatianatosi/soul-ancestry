# Pendências de lançamento — conferência de 01/11/2026

Gerado pela skill `/understand`. **Verificado agora** = medido nesta execução (Git, GitHub, arquivos).
**Do plano** = copiado de `docs/PLANO-MESTRE-LANCAMENTO-2026-10-30.md` e `docs/PLANO-TAREFAS-2026-10-31.md`, sem remedir.
Nada foi consultado no banco: a ferramenta do Lovable não estava autenticada nesta sessão.

## Grafo (verificado agora)

- 1.648 arquivos em `src/`, 4.455 dependências, 41 domínios. Mapa por domínio: `docs/grafo/grafo-dominios.mmd`.
- 49 módulos sem importador de produção (`orfaos-sem-importador.txt`). 47 aparecem nos registros de órfãos. Os 2 restantes são o próprio registro (`orfaos-modulos-classificados.ts`, esperado) e `src/data/saneamento.ts`, que o plano diz estar com veredicto antigo em `classificacao-dados.ts` (item O10/N2, não religado ainda).

## Estado do repositório (verificado agora)

| Item | Estado |
| --- | --- |
| `main` | `27359eb`; CI do `ci.yml` nesse SHA: `completed/success`. |
| PRs do plano | #201, #203, #205, #207 e #209 já não estão abertas (o #203 foi mesclado em 01/11). Restam abertas #202 (rascunho) e #212 (CI/bun, rascunho). |
| PRs antigas | 12 abertas de agosto/setembro: #32, #97, #102, #104, #105, #108, #110, #114, #117, #118, #120, #121, #125. Decisão da Proprietária (R4). |
| `supabase/pendentes/` | Cabeçalhos `NÃO APLICADO`: `20261020150000` (o README diz aplicado em 30/10: contradição, E4), `20261024120000` (README diz dados já no banco) e `20261030180000` (despublicar documentos da Ana, bloqueado por guard; só pelo Desk). Nenhum bloqueia o código segundo o plano. |
| `TODO:` em produção | 10 arquivos, incluindo `components/painel/botao-testar-cliente.tsx` (faz o `pipeline.py` abortar; O7). |

## Pendências abertas (do plano, por dono)

**Proprietária (P) — destravam o resto**
1. J1: 3 documentos da Ana liberados ao cliente (manter, sanitizar ou retirar). Antes de J2.
2. J5: nome do pai ("Adair Gomes Silveira" × "Adair Pinto Silveira Júnior"). Antes de H5.
3. H5, H6, H7: aprovar parâmetros do contrato (95%, `rascunho`), gerar a prévia **final**, registrar a revisão. H9: assinatura.
4. J2, J3, J4, J10: acesso da Ana ao portal (hoje 0), consentimento do lead, representação do Felipe, publicar `resumo_caso`.
5. J9: custo e prazo dos 76 itens do §58c (hoje 0 e 0).
6. J12 e `COMPROVADO_EM_USO`: prints autenticados por motor.
7. Decisões: O1 (pessoa e pagamento no GoLive), O2 (pilotos), O3 (radar), O8 (4 funções do `painel-preparacao`), N5, N6, N7, E1, E3, R4.

**Claude Code (C)**
- N1, N2: Painel Hoje (W4a), Governança (W4b) e saneamento (W5): trabalho parcial parou no limite de uso.
- N3, N4: navegação única do portal e retirada de dado fixo da Ana (`anexos-tres-camadas.ts`).
- N8: teste que renderiza as telas religadas. N9: `sha` em `/api/saude` (hoje `null`). N10: trava do hook Prettier.
- O6, O11: classificar `src/data/*` e estender o teste de órfãos a todo o `src`.
- P2, P3: auditoria e endurecimento de gravação (releitura estrita).
- E4: alinhar cabeçalhos `ESTADO:` ao README.
- R6/P1: fechar a #32 com motivo, depois de conferir as 3 peças.

**Lovable (L):** aplicar qualquer proposta de banco que a Proprietária aprovar.

## Não verificado

Contagens do banco (itens do §58c, acessos, prévias, `lineage_encounters`), estado do Lovable (`latest_commit_sha`, `agentFinished`), `/api/saude` no ar, `tsc` e suíte de testes locais (sem `node_modules`). A `/lancar` cobre os três primeiros, com autorização.
