# Pendências de lançamento — 02/11/2026 (noite)

Rotina `/understand`. Rodada às 20:20 UTC. Dono: **C** = Claude, **L** = Lovable, **P** = Proprietária.

## Verificado agora

| Item | Resultado |
|---|---|
| Grafo | 1.691 arquivos, 4.564 arestas, 41 domínios (`node scripts/gerar-grafo.mjs`) |
| Órfãos sem importador de produção | **30** (eram 33 em 01/11 e 49 no começo) |
| Veredito dos 30 | 12 `CASCA_DUPLICADA` · 12 `APOSENTADA_CLASSIFICADA` · 4 `AGUARDA_DECISAO` · 2 sem veredito (`src/data/saneamento.ts` e o próprio registro `orfaos-modulos-classificados.ts`) |
| `main` | `703b6579`, CI do `ci.yml` desse commit: **success** |
| Produção | `https://soul-ancestry.lovable.app/api/saude`: ok, bancoOk, sha `703b6579` (o mesmo da `main`) |
| Lovable ↔ GitHub | em dia: `latest_commit_sha` do Lovable = `main` |
| PRs abertas | 18: #226 (este lote) e 17 antigas (ver abaixo) |
| `supabase/pendentes/` | 13 arquivos: 10 aplicados, 3 com "NÃO APLICADO" (ver abaixo) |

### Os 4 órfãos que aguardam decisão
`src/components/clube-ancestral-kit/preview-fixtures.ts` (dados de demonstração), `src/components/painel/painel-top30.tsx`, `src/lib/agenda-assistida.ts` (sugestão de reunião com confirmação), `src/lib/fontes-documentos-rls.ts`.

### Pendentes de banco
- `20261030180000_despublica_documentos_ana_ate_sanitizar.sql`: **não aplicado**, bloqueado por guard. O caminho é "Retirar do App" no Desk (tela de Privacidade destravada e publicada).
- `20261024120000_documentos_reais_ana_liberados.sql`: o cabeçalho diz "NÃO APLICADO", mas os dados já estão no banco (relatório banco-esquema-rls). Não precisa aplicar; falta corrigir o cabeçalho.
- `20261020150000_ana_luiza_historico_contrato_banco_antigo.sql`: cabeçalho "NÃO APLICADO; BLOQUEADO_POR_TAMANHO" desatualizado segundo o mesmo relatório.
- `20261102160000_cria_has_role.sql`: **aplicado hoje** (conferido antes e depois no banco).

### PRs antigas (não mexi; decisão de arquivar é da Proprietária)
`#32` empilhada (não mescla), `#97`, `#121` (arquivar planilha só no GitHub), `#104`, `#105`, `#108`, `#110`, `#114`, `#117`, `#118`, `#120`, `#125`, `#102`, `#202`, `#212`, `#215`, `#217`, `#222`. Parte do que elas trazem já está na `main` por outras vias (#202 e #212 foram executados em 01/11 e conferidos de novo hoje). Falta um levantamento item a item de qual PR ainda tem peça não executada.

## Do plano, sem remedir hoje
`docs/PLANO-MESTRE-LANCAMENTO-2026-10-30.md` e `docs/PLANO-TAREFAS-2026-10-31.md`: os números deles têm data e não foram refeitos nesta rodada.

## O que depende de cada dono

### P (Proprietária)
1. **Retirar do App** os 3 documentos da Ana (Desk → Privacidade). Fazer antes de qualquer convite.
2. **Convite da Ana:** o acesso `client_portal_access` está `invited`, sem primeiro login, e expira em 03/11/2026 14:25 UTC. Decidir se reenvia (depois do passo 1).
3. **Divergência de contrato da Ana:** `crm_casos.contrato_assinado=true` (veio de um SQL de 23/10) × contrato `pending_data` e nenhum contrato `signed`.
4. **Os 4 órfãos que aguardam decisão** acima.
5. **Usar o app e dizer onde falha:** em qual tela, qual botão, qual mensagem (texto, sem print). Desde a publicação das 19:50 UTC o coletor de erros não recebeu nada e não houve gravação sua.
6. Publicar o #226 quando os checks passarem (pedido explícito, rotina `/lancar`).

### C (Claude)
1. Mesclar #226 depois do CI verde; receber os 4 relatórios da rodada 2 (leads/calls, Caso 360, contratos/financeiro, banco vivo) e transformar os achados em tarefas.
2. B8 (cerca de 90 inserts de `audit_logs` sem checar erro) e D1 a D5 (documentos) do backlog; F1 a F16.
3. Corrigir os cabeçalhos "NÃO APLICADO" desatualizados (F7).

### L (Lovable)
1. Não recriar a exigência de revisão independente na `main` (o pedido já foi enviado e a proteção está com 0 aprovações; conferir que não volta).
2. Confirmar que `https://soul-ancestry.lovable.app/acesso/confirmar` está na lista de redirecionamentos do login (relatório golive-casos).
