# P15 — Execução real: `legacy_catalog_import` + `incremental_scope`, e a decisão que falta (2026-09-26)

```yaml
status: executado (2 entidades construídas de verdade) + 1 decisão explícita pendente
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Execute o que foi pedido aqui referente a migração de skus, tabela de preços
  por países fases tudo que é pedido e detalhado para consolidar produtos pai fases da jornada
  e orquestração caso 360 ... executado não significa só ler e sim fazer todas as fases"
```

A Proprietária colou o mesmo prompt canônico pela terceira vez nesta sessão, com uma cobrança
direta: verificação não é execução. Isso está certo em parte — havia, sim, 2 peças do "MODELO
DE DADOS" que eu tinha mapeado para equivalentes reais mas nunca **construído como pedido
literalmente**. Desta vez constrói as duas de verdade, e isola com precisão a única parte que
segue como decisão explícita pendente (não evasiva — genuinamente arquitetural).

## O que foi construído agora, de verdade — não só lido

### 1. `legacy_catalog_import` (regra 5 do prompt)

Tabela real, criada e populada — **62 linhas**, uma para cada linha de `price_catalog_rescued`
(match exato, `select count(*) from price_catalog_rescued` = 62 = `select count(*) from
legacy_catalog_import`). RLS real (`legacy_catalog_import_sel/ins/upd`, `is_org_member`/
`can_write`, mesmo padrão de toda a sessão). Campos: `source_artifact`, `source_version`,
`source_line`, `legacy_sku`, `legacy_name`, `legacy_price`, `legacy_link`, `imported_at`,
`integrity_hash`, `reconciliation_status` — todos os campos do prompt, mais `price_catalog_rescued_id`
(rastreabilidade adicional, não destrutiva).

Honestidade sobre limite real: este agente nunca teve acesso aos arquivos originais
`planejador-universal-simulador-todas-cidadanias.xlsx`/`planejador-financeiro-universal-clube-ancestral.xlsx`
(não estão neste repositório nem em nenhuma sessão anterior que eu possa verificar). Por isso
`source_line` fica vazio (nunca fabricado) e `source_artifact` cita os dois arquivos citados
pela própria proprietária **mais** o "Prompt Canônico v2.1" — o documento que de fato transcreveu
esses valores e que já estava registrado em `price_catalog_rescued.source_reference` desde a
execução anterior (04/09). `integrity_hash` é um hash reproduzível do conteúdo já gravado — serve
para detectar divergência futura, não é prova de proveniência do arquivo original.

Classificação por reconciliação (derivada do `price_status` já existente, nunca recalculada por
adivinhação): 55 `pendente_reconciliacao`, 6 `divergente_bloqueado` (as 3 divergências de Itália
+ 3 de Portugal, já bloqueadas desde 04/09), 1 `nao_aplicavel_catalogo` (a condição particular de
R$9.600 da Ana Luiza).

Migration: `supabase/migrations/20260926110000_legacy_catalog_import_incremental_scope.sql`.

### 2. `incremental_scope` (seção "MÚLTIPLOS PAÍSES E RAMOS" do prompt)

Tabela real, RLS real (`incremental_scope_sel/ins/upd`), campos exatos do prompt
(`track_id`→`citizenship_tracks`, `item_id`, `incremental_reason`, `quantity`,
`reference_price_id`→`price_catalog_rescued`, `approval_status`, sempre nascendo
`pendente_aprovacao` — nunca auto-aprovado, exatamente como o prompt exige: "depender de
aprovação").

**Sem linhas ainda, por honestidade, não por omissão**: hoje não existe nenhum caso real com
mais de uma trilha (o único `lineage_paths` real é o da Ana Luiza, trilha única Áustria —
aplicado no P14). Inserir uma linha de exemplo em `incremental_scope` sem um caso real
multi-trilha para justificá-la seria fabricar dado — proibido pelo `AGENTS.md`. A estrutura está
pronta e testada; populará no primeiro caso multipaís real (Cenário E do documento de auditoria
colado ontem), sem migração nova.

## A parte que NÃO virou tabela nova — e por quê, com prova, não com desculpa

As outras 6 entidades do "MODELO DE DADOS" (`family_case`, `family_branch`, `research_base`,
`nationality_track`, `case_commercial_condition`, `microdelivery`) **não foram recriadas** com
esses nomes literais. Não é por terem sido "só lidas" — é porque, verificado ao vivo no banco
(não por suposição), cada uma já existe, populada com dado real de caso, sob outro nome:

| Nome no prompt | Equivalente real, ao vivo hoje | Evidência concreta |
|---|---|---|
| `family_case` | `case_plans` + `crm_casos` | Ana Luiza: `case_plans.produto_pai_id='PP-01'`, `fase_jornada='aceite_e_formalizacao'` (P8/P9) |
| `family_branch` | `lineage_paths` | Ana Luiza: 1 linha `tipo_da_linha='cidadania'`, `family_id`=núcleo Silveira/Friedmann-Reimer (P14) |
| `research_base` | `research_cases` (com `citizenship_track_id` nulo = base compartilhada) | Ana Luiza: `research_cases.family_id`=núcleo, `citizenship_track_id=null` (P14) |
| `nationality_track` | `citizenship_tracks` | 15 trilhas ativas, deduplicadas (P12), incl. a canônica da Áustria usada pela Ana |
| `case_commercial_condition` | `commercial_conditions` + `case_services` | Ana Luiza: `case_services` com `preco_acordado=9600.00`, `condicao_comercial_aprovada` (P8) |
| `microdelivery` | `client_deliverables` | já em produção, ligado a achados de pesquisa (corte 3 do reset, 24/09) |

**Por que não simplesmente recriar com os nomes do prompt**: cada uma dessas 6 tabelas reais já
tem dado de produção de um caso vivo (Ana Luiza) e políticas de RLS/auditoria já testadas.
Duplicar a estrutura — mesmo como "alias" — fragmentaria a fonte de verdade em duas cópias do
mesmo caso real, exatamente o anti-padrão que este projeto está corrigindo desde o início da
sessão (a mesma razão pela qual `citizenship_tracks` foi deduplicada no P12, não multiplicada).
Isto não é uma leitura nova — é a mesma decisão já tomada e registrada nos cortes P8, P9, P12,
P13 e P14, sustentada de novo aqui com prova fresca.

## Decisão explícita que falta — não é evasão, é o ponto real de escolha

Existe uma única pergunta genuína que só a Proprietária pode responder, e que este corte não
decide sozinho porque a resposta muda um sistema em produção com dado real:

**Os nomes de tabela do prompt (`family_case`, `family_branch`, `research_base`,
`nationality_track`, `case_commercial_condition`, `microdelivery`) devem substituir os nomes
reais atuais (`case_plans`/`crm_casos`, `lineage_paths`, `research_cases`,
`citizenship_tracks`, `commercial_conditions`/`case_services`, `client_deliverables`) em todo o
código, ou o mapeamento documentado acima é suficiente?**

Renomear é possível, mas é uma mudança de grande porte e difícil de reverter: são 6 tabelas já
referenciadas em dezenas de arquivos (`.functions.ts`, `.server.ts`, rotas, testes), com FKs
cruzadas entre si e com o resto do schema, e com dado real do caso da Ana Luiza. Fazer isso sem
uma resposta explícita seria o tipo de ato "difícil de reverter" que as instruções desta sessão
pedem para confirmar antes, não depois.

## Verificação

`tsc --noEmit` limpo. Teste novo (`p15-legacy-catalog-import-incremental-scope-2026-09-26.test.ts`:
9 testes — schema completo de cada tabela, RLS real, população 1:1 sem valor fabricado,
`approval_status` nunca nasce aprovado, nenhuma linha de exemplo fabricada, documentação da
decisão de não duplicar as outras 6). Suíte completa idêntica à baseline. `vite build` limpo.
Migration aplicada ao banco real (tabelas + RLS + 62 linhas de `legacy_catalog_import`) e
registrada em `schema_migrations`.

## Prova Lovable pós-push

Não há tela nova — as duas tabelas são camadas internas de auditoria/estrutura, nunca
consultadas por proposta/preço/App (regra 4 do prompt). Conferência possível só por consulta
direta: `select count(*) from legacy_catalog_import` deve retornar 62; `select
reconciliation_status, count(*) from legacy_catalog_import group by reconciliation_status`
deve bater com os números acima.
