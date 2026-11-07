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

1. **Correção sobre `painel-dia.tsx`.** A versão anterior deste relatório dizia que a regra "aguardando decisão; não tocar" tinha sido descumprida. Isso estava errado: `src/lib/orfaos-modulos-classificados.ts` registra que a Proprietária decidiu em 01/11/2026 (N7) que o `painel-dia.tsx` é o desenho anterior, superado, `APOSENTADA_CLASSIFICADA`, não religado e não apagado. A alteração de 25/10 (`ab19c84c`) é anterior a essa decisão. O que sobra é a linha do `AGENTS.md`, que ainda diz "continua aguardando decisão" e está desatualizada em relação ao registro. Atualizar o `AGENTS.md` fica com a Proprietária.
2. **Legado.** `legacy_record_links` aparece em `types.ts`, `migracao.functions.ts` e `styles.css`. A premissa "legado só em trilha rotulada" não foi verificada a fundo.
3. **Premissas não conferidas:** pílula "Visão Concreta", genograma, anos nos cartões da árvore, privacidade do App (conteúdo sanitizado), RLS no servidor, apresentação comercial por identidade do caso, e vocabulário CHECK novo nas migrations (exige comparar os `CHECK` de todas as migrations, o que esta varredura não fez).

## Tabelas e migrations (segunda rodada, só leitura)

Método: script que lê os 244 arquivos `.sql` de `supabase/migrations/` e `drizzle/migrations/` (sem comentários), compara com `src/integrations/supabase/types.ts` e com os `.from("x")` de `src`. É regex, não um parser de SQL, então vale como triagem.

- `types.ts` lista 195 tabelas e 5 views. As migrations criam 183 tabelas e nenhuma é removida (`drop table`).
- **13 tabelas existem em `types.ts` sem um `create table` literal:** `audiovisual_records`, `cadastral_records`, `correspondence_records`, `cultural_records`, `education_records`, `historical_context_events`, `military_records`, `notarial_records`, `occupations_assets`, `preserved_objects`, `religious_records`, `residences_migrations`, `social_political_records`. Cada uma aparece em exatamente uma migration, que cria tabelas em laço com `CREATE TABLE IF NOT EXISTS public.%I` (DDL dinâmico). Não há divergência, só o regex não vê.
- **Sem tabela fantasma no código:** os únicos `.from("x")` com `x` fora das migrations e de `types.ts` são `documentos` e `pesquisa`, e ambos são buckets de storage (`storage.from(...)`), não tabelas.
- **Tabela fora de `types.ts`?** Nenhuma tabela criada nas migrations falta em `types.ts`. A tabela `contract_history_imports` (criada pelo Lovable, proposta em `supabase/pendentes/`) está em `types.ts` e é usada em `contratos.functions.ts`.
- **`supabase/pendentes/`:** 13 propostas, e o `README.md` marca todas as de schema como já aplicadas. A única que cria tabela é `contract_history_imports`. Nenhuma adiciona `CHECK` nem tipo novo.
- **3 tabelas sem nenhuma referência em `src`** (só em `types.ts`, testes e migrations): `incremental_scope`, `legacy_catalog_import`, `source_access_logs`. As duas primeiras têm teste (`p15-legacy-catalog-import-incremental-scope-2026-09-26.test.ts`). Candidatas a classificação, não a remoção: o `AGENTS.md` proíbe exclusão física.
- Outras 27 tabelas não têm `.from()` literal em `src`, mas são citadas por nome em outros arquivos (por exemplo `microentregas`, em 55). O acesso provavelmente passa por leitores genéricos (`listarRegistros`), então isso não indica órfã.

## Órfãos

Método: módulo de produção em `src` (fora de `routes/` e `integrations/`) que nenhum outro módulo de produção importa.

- 63 candidatos. 21 são componentes de `components/ui/` (primitivos de interface), esperados.
- Dos 42 restantes, 19 são componentes de negócio sem importador em produção, e **os 19 já têm veredicto em `src/lib/orfaos-modulos-classificados.ts`**: 8 `CASCA_DUPLICADA` ou `AGUARDA_DECISAO` e 11 `APOSENTADA_CLASSIFICADA`, entre eles `painel-dia`, `painel-hoje`, `kanban-tarefas` e `modulos-contextuais`. Cobertos pela regra "religada com prova ou aposentada com classificação".
- Os outros 23 candidatos não foram listados um a um. Esta varredura acha importação estática; uso por `import()` dinâmico ou por rota gerada pode escapar. Qualquer classificação nova segue a skill `classificar-orfao`.
- `AGUARDA_DECISAO`: `preview-fixtures.ts` e `painel-top30.tsx`. Dependem de decisão da Proprietária.

## Como repetir

```bash
pip install "graphifyy[sql]"
graphify update .
graphify query "<pergunta>"
```
