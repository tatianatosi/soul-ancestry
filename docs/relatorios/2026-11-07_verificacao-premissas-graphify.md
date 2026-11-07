# Verificação das premissas do `AGENTS.md` com o graphify

Data: 07/11/2026. Base: `main` em `692bbb3`. Ferramenta: graphifyy 0.9.103 (`graphify update .`, só AST, sem chamadas a modelo).
Somente leitura: nenhum arquivo de código foi alterado. Este relatório não substitui a prova autenticada da Proprietária.

## Grafo gerado

- 28.334 nós, 55.131 arestas, 1.789 comunidades (com `graphifyy[sql]`).
- Dos 261 arquivos `.sql`, 186 passaram a contribuir. 75 seguem sem símbolos, entre eles `supabase/migrations/20260816151123_*.sql`, `drizzle/migrations/0006_*.sql` e `migracao-supabase/02-dados-public.sql`. O extrator não modela esses arquivos.
- `src/routes/_authenticated/qualidade.tsx` tem erro de sintaxe (região na linha 125) e foi extraído só em parte.
- O grafo fica em `graphify-out/` (ignorado pelo git). Para regenerar: `pip install "graphifyy[sql]"` e `graphify update .` (cerca de 1 minuto).

## Premissas conferidas

| Premissa                                                                         | Resultado                                                                                                                                                                         | Onde                                                                       |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A lateral renderiza `SETORES_DESK`, derivado de `GRUPOS_DESK`; sem segunda lista | Confere. `SETORES_DESK_V5` é só um alias (`= SETORES_DESK`).                                                                                                                      | `src/lib/navegacao-desk.ts:183`, `:393`, `:401`                            |
| Caso 360 = 8 seções (`SECOES`)                                                   | Confere: Visão, Jornada, Pessoa e família, Pesquisa, Documentos, Formalização, Financeiro, Histórico. A pílula "Visão Concreta" não foi conferida.                                | `src/routes/_authenticated/casos.$caseId.index.tsx:454`                    |
| App Cliente = 7 abas                                                             | Confere: home, jornada, radar, arvore, documentos, legado, conta.                                                                                                                 | `src/components/portal/abas-app-cliente.tsx:16-22`                         |
| 5 etapas do caso vêm só de `etapas-caso.ts`                                      | Confere: diagnostico, documentacao, juridico, financeiro, app_cliente.                                                                                                            | `src/lib/etapas-caso.ts:8-34`                                              |
| Preservar a RPC `portal_sou_contratante_financeiro` e suas chamadas              | Presente em `portal.functions.ts`, `portal-cliente.functions.ts`, `portal-dados-vivos.functions.ts`, `types.ts` e na migration `20261011130000`. Há teste de gate do contratante. | `src/lib/__tests__/condicao-comercial-gate-contratante-2026-10-31.test.ts` |
| Preservar `confirmarDocumentosMinimos` → `documentos_minimos_ok`                 | Presente em `atendimento-interno.tsx`, `contrato-preparar.functions.ts`, `caso-ficha.ts`, `desk-go-live.tsx`.                                                                     | `src/components/portal/atendimento-interno.tsx`                            |
| GoLive: as 19 telas recebem o caso por `?casoId=`                                | Confere: 19 arquivos `golive-*` e todos citam `casoId`.                                                                                                                           | `src/routes/_authenticated/golive-*.tsx`                                   |
| Sem exclusão física                                                              | Um `.delete()` em `src`: apaga contadores de `auth_throttle` no login. É controle operacional, não registro de negócio. `saas.functions.ts:1182` já arquiva com `archived_at`.    | `src/lib/equipe.server.ts:97`                                              |

## Pontos que pedem decisão da Proprietária

1. **`painel-dia.tsx`.** A regra diz "continua aguardando decisão; não tocar". O arquivo `src/components/painel/painel-dia.tsx` foi alterado por último em 25/10/2026, no commit `ab19c84c` ("Reimplementou checklist de Docs"). Não sei se houve autorização. Conferir.
2. **Legado.** `legacy_record_links` aparece em `types.ts`, `migracao.functions.ts` e `styles.css`. A premissa "legado só em trilha rotulada" não foi verificada a fundo.
3. **Tabelas e CHECK novos.** Não verificado: exige comparar todas as migrations com `types.ts`. Os 75 `.sql` sem símbolos incluem migrations, então o grafo não cobre essa checagem.
4. **Premissas não conferidas:** pílula "Visão Concreta", genograma, anos nos cartões da árvore, privacidade do App (conteúdo sanitizado), RLS no servidor, apresentação comercial por identidade do caso.

## Como repetir

```bash
pip install "graphifyy[sql]"
graphify update .
graphify query "<pergunta>"
```
