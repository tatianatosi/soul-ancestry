# Pendências de lançamento — conferência de 01/11/2026 (noite)

Gerado pela skill `/understand`. **Verificado agora** = medido nesta execução. **Do plano** = copiado de
`docs/PLANO-MESTRE-LANCAMENTO-2026-10-30.md` e `docs/PLANO-TAREFAS-2026-10-31.md`, sem remedir (são de 30/31 de outubro).
Banco: **não consultado** (a ferramenta do Lovable não faz `SELECT` de banco nesta sessão sem autorização).

## Verificado agora

| Item | Estado |
| --- | --- |
| `main` | `e3766a6`; CI do `ci.yml` nesse SHA: **success**. O run anterior (`66c85d5`) falhou, por causa do teste de `noindex` da vitrine, já corrigido; o `2f51736` aparece **cancelado**, que é o problema que o S2 resolve |
| No ar | `https://soul-ancestry.lovable.app/api/saude` → `ok: true`, `sha: e3766a6f…`, igual à `main` |
| Painel de sincronia (#208) | Último Publish registrado `e3766a6`; 0 commits depois |
| Grafo | 1.658 arquivos, 4.494 dependências, 41 domínios |
| Órfãos sem importador de produção | **36** (eram 49 em 01/11 de manhã): 11 casca duplicada, 17 aposentada, 6 aguardam decisão, 2 sem veredito (o próprio registro e `data/saneamento.ts`) |
| PRs abertos | **20** |
| `supabase/pendentes/` | 3 arquivos com `ESTADO: NÃO APLICADO` (abaixo) |

### PRs abertos (20)
- **#219 (meu, rascunho):** Onda 3 (9 órfãos religados) e relatório dos PRs antigos. CI em andamento. Falta sua autorização para mesclar e publicar.
- **#214, #215, #216, #217, #218 (de outras sessões, hoje):** a11y da matriz, teste da vitrine, performance do Caso 360, tela de aprovação da fila de comunicação, limpeza de `eslint-disable`. O #215 repete a correção do teste de indexação que já está na `main` e está em conflito (`dirty`): pode ser fechado como duplicado. Não toquei em nenhum.
- **#202 e #212:** o conteúdo já está na `main` (via #213); os PRs seguem abertos.
- **Antigos (#32, #97, #102, #104, #105, #108, #110, #114, #117, #118, #120, #121, #125):** classificados em `docs/grafo/EXECUCAO-PRS-E-ORFAOS-2026-11-01.md`: 6 já na `main` em outra forma, 4 superados, 2 não executados de propósito (arquivam telas sem prova de uso), 1 parcial (#110).

### Banco (cabeçalhos, não confirmado no banco)
- `20261020150000_ana_luiza_historico…`: diz "NÃO APLICADO; BLOQUEADO_POR_TAMANHO", mas o README e o plano dizem aplicado em 30/10. **Contradição** (E4): precisa de um `SELECT` em `contract_history_imports` para fechar.
- `20261024120000_documentos_reais_ana_liberados`: "NÃO APLICADO"; o README diz que os dados já estão no banco por outro caminho.
- `20261030180000_despublica_documentos_ana…`: "NÃO APLICADO; BLOQUEADO_POR_GUARD". Só pelo Desk, por decisão da Proprietária.
- Nenhuma proposta bloqueia o código da `main`, segundo o plano (não remedido).

## Do plano, sem remedir (dependem da Proprietária)
J1 documentos da Ana (3 liberados ao cliente); J5 nome do pai; H5 a H7 e H9 (aprovar parâmetros do contrato, gerar a prévia final, revisar, assinar); J2, J3, J4, J10 (acesso da Ana ao portal, consentimento, representação do Felipe, `resumo_caso`); J9 custo e prazo dos 76 itens do §58c; J12 e `COMPROVADO_EM_USO` com prints autenticados; E1 (journal do Drizzle).

## Do Claude Code
- Mesclar e publicar o #219 (aguarda autorização).
- Atualizar o *knowledge* do projeto no Lovable (S3): ele descreve 6 grupos de menu, o código tem 8; a ferramenta recusa texto acima de 10.000 caracteres e o conteúdo atual já ocupa quase tudo.
- Onda 2 do Painel Hoje: 7 painéis duplicam o `/painel` V4 e não foram ligados; 7 módulos com dado de família no código precisam virar dado de cada caso antes.
- N2 (saneamento com contagens ao vivo na Governança), N8 (render das telas religadas), N10, O6/O11.

## Não verificado
Contagens do banco, comportamento no navegador (desktop e 375 px), estado das demais telas campo a campo.
