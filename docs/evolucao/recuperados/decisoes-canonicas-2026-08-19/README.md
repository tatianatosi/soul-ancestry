# Decisões canônicas — 19/08/2026, recebidas e arquivadas em 01/09/2026

Três documentos enviados pela proprietária, colados diretamente na conversa (não como anexo), preservados aqui na íntegra:

- `FICHA-PILOTO-GENEALOGICA-E-ARVORES.md` — estrutura canônica de Pessoa/Relações/Linhagens/Árvore/Linha do tempo, com um prompt de implementação completo (seção 15).
- `DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA.md` — modelo de CRM proprietário, catálogo Top 30, Planejador/trilhas de cidadania, onboarding, micro-entregas e higiene de dados fictícios.
- `ANA-LUIZA-CHECKLIST-REVISAO-OFFLINE-GATE-MOTOR.md` — checklist de revisão offline do caso real da Ana Luiza e um prompt de auditoria pausado (não executado), para retomar depois.

## Verificação contra o código real (branch `main`, commit `af05190`, 01/09/2026)

**Achado principal: os dois primeiros documentos não são só propostas — batem quase campo a campo com migrations reais da mesma data (19-20/08/2026).** Isso é diferente do lote de documentos de CRM de 10-11/08 (arquivado antes, em `docs/evolucao/recuperados/materiais-crm-2026-09-01/`), onde a maior parte ainda não tinha UI. Aqui, o schema em si já existe.

### Ficha Piloto Genealógica — confirmado quase por completo

O documento `docs/G02_PESSOAS_E_LINHAGENS_v1.0.md` (já existente no repositório, datado 20/08/2026, "Status: implantado") é a versão executada desta especificação. Confirmado em migration real (`20260820192635_407dd2f5...sql`):

| Proposto no documento | Tabela real | Nota |
|---|---|---|
| `genealogical_relationships` | Real, com `person_from_id`/`person_to_id`/`relation_type` — os mesmos 8 tipos de relação propostos (`pai_mae`, `filho`, `conjuge`, `irmao`, `tutor_representante`, `padrinho_madrinha`, `colateral`, `a_confirmar`) | Constraint `nao_reflexiva` impede pessoa relacionar consigo mesma |
| `genealogical_events` | Real | `validation_status` com 4 estados (`pendente`/`em_revisao`/`confirmado`/`descartado`) — não os 5 propostos no documento (ver gap abaixo) |
| `lineage_paths` | Real, com `tipo_da_linha` incluindo `dupla_familiar` — índice único `(case_id, nome_da_linha)` implementa "linha dupla sem duplicar caso" exatamente como pedido | — |
| `lineage_encounters` ("Encontro de Linhagem") | Real, com `title_client`/`resumo_aprovado_cliente` — sanitização por campo específico, não por flag genérica `client_visibility` | Solução real difere da especificação (mais específica, não pior) |
| Módulos históricos (13 tabelas — residências, ocupações, militar, notarial, cadastral, educação, cultura, religião, correspondência, social/político, audiovisual, objetos, contexto histórico) | Todas reais (migration `20260822205306`, RLS confirmada) | — |
| `research_people`, `research_sources`, `evidences`, `evidence_validations` | Todas reais | — |

**Gap real, não crítico:** os "5 estados de verificação uniformes" (Confirmado/Provável/Hipótese/Pendente/Refutado) propostos para todo campo não foram implementados como um enum único e compartilhado — cada tabela ganhou seu próprio enum de status (`status_pesquisa` em relações, `validation_status` em eventos, `status` em linhagens), com rótulos e granularidade diferentes entre si. Em particular, a distinção "Provável" vs. "Hipótese" não sobrevive como dois estados distintos em nenhuma tabela real — foi simplificada.

### Decisões Canônicas (CRM/Catálogo/Planejador) — confirmado em grande parte

A migration `20260819203256_42404813...sql` (mesma data do documento) cria, na mesma migration: `product_catalog`, `citizenship_tracks`, `case_services`, `communication_queue`, `client_deliverables` — 5 das 17 entidades da seção 5.1 já reais. Também confirmados anteriormente nesta sessão (migration `20260821122741`): `contacts`, `opportunities`, `discovery_assessments`, `crm_interactions`.

**Não encontradas como tabelas reais:** `families`, `family_members` (o real usa `nucleos_familiares`/`nucleo_membros`, já existentes desde 18/08 — nomenclatura diferente, papel equivalente), `legacy_import_batches`, `legacy_sku_mappings`. `legacy_record_links` e `migration_exceptions` são reais (migration `20260819212335`).

`data_origin` (seção 15.2, higiene de dados fictícios) — o mecanismo existe de verdade (`src/lib/classificacao-dados.ts`, já usado e corrigido nesta mesma sessão para o caso da Giovanna), mas com uma taxonomia de 4-5 valores (`real`/`demo`/`modelo`/etc.), não os 5 valores exatos propostos aqui (`production_real`/`migration_legacy`/`development_fixture`/`sandbox`/`unknown_needs_review`).

### Ana Luiza — checklist offline

Não é uma proposta de schema — é um roteiro de revisão manual e um prompt de auditoria pausado. Um ponto central do documento já foi confirmado como resolvido em código real: a decisão de identificador canônico único (`CA-CID-AT-FAM-2026-001`, com `CA-AUT-ANALUIZA-FAM-2026-001` como alias legado redirecionado) está registrada e aplicada em `src/lib/varredura-completude.ts:564-569`, `src/lib/gates-piloto.ts:38` e `src/lib/inventario-patrimonial.ts:24`, com nota explícita de que foi "decisão da proprietária em 22/08/2026" — ou seja, 3 dias depois deste documento, confirmando que a pendência descrita aqui (item A do checklist, "decidir redirecionamento") foi mesmo resolvida.

**O prompt de auditoria pausado (seção 4) não foi executado nesta verificação** — é uma auditoria proposta, não uma ação tomada. Ele continua descrevendo, com precisão, a mesma causa raiz já documentada nesta sessão em `docs/arquitetura/MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md` (objeto/escopo/partes do contrato não vindo dos Parâmetros/proposta aprovada) — os dois documentos, escritos com 12 dias de diferença e por processos diferentes, chegam à mesma causa raiz de forma independente.

## O que isto NÃO decide

Nenhuma das lacunas acima (enum de verificação único, `families`/`family_members`, taxonomia de `data_origin`) foi corrigida nesta verificação — é só o de-para real vs. proposto. Nenhum código foi alterado para produzir este README.
