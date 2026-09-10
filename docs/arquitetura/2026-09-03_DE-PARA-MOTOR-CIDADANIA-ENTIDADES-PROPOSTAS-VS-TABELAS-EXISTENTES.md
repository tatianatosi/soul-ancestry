# De-Para — Motor Planejador de Cidadania: entidades propostas × tabelas já existentes no Supabase

```yaml
status: em revisão
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: auditoria de arquitetura / de-para técnico
responsável pela decisão: Proprietária Administradora do Clube Ancestral
base normativa: docs/prompts/instrucoes-motor-cidadania-v1.0.md (PR #61);
  docs/arquitetura/contexto-motor-cidadania-v1.0.md e
  contexto-motor-cidadania-v1.0-referencias-completas.md (PR #60);
  docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md (PR #59)
repositório: tatianatosi/soul-ancestry
fonte: consultas diretas ao Supabase (list_tables, information_schema.columns, execute_sql),
  projeto zsxpdbhdvbuulwpepemd, em 2026-09-03
```

## Objetivo e escopo

A instrução "Pode preparar o de-para, como também aproveitar e estender, manter a lógica — vai
mudar em relação ao atual para algo mais amplo e que abarque mais" (2026-09-03) pede o
mapeamento entre as 12 entidades que `instrucoes-motor-cidadania-v1.0.md` propõe criar do zero
e o que já existe em produção — para reusar/estender em vez de duplicar, e para que a lógica do
motor evolua para algo mais amplo (multi-país, multi-hipótese) sem recriar o que já está
construído.

Este documento é só **mapeamento**. Nenhuma migração, nenhuma alteração de schema e nenhum
código foram executados a partir dele — ver seção "Fora do escopo desta entrega".

## Achado prévio confirmado: duplicação real em produção

Antes do de-para, dois achados quantificados sobre a base atual (necessários porque um de-para
sobre dado duplicado propagaria o problema em vez de resolvê-lo):

| Tabela | Grupos duplicados | Linhas envolvidas | Total de linhas | Natureza |
|---|---:|---:|---:|---|
| `product_catalog` | 31 | 86 | 90 | Maioria triplicatas idênticas linha a linha (só `id` muda). Uma exceção real: `CA-COMBO-001` tem 1 linha com `tipo_oferta="sazonal"` e 2 com `"produto_pai"` — divergência de classificação, não ruído. |
| `citizenship_tracks` | 11 | 33 | 46 | Mesmo padrão: por `país+nacionalidade+via_preliminar+status_via`, aparecem normalmente 3 linhas em `lifecycle_status="em_revisao"` mais 1 linha solta em `"rascunho"` com texto de via ainda não normalizado. |

Nenhuma linha foi apagada ou alterada — este documento só relata o achado, conforme a regra de
nunca apagar fisicamente sem decisão explícita.

## De-para: entidade proposta → tabela real

| # | Entidade proposta (`instrucoes-motor-cidadania-v1.0.md`) | Status | Tabela(s) real(is) já em produção | Observação |
|---|---|---|---|---|
| 1 | `country_catalog` | **Existe parcial** | `citizenship_tracks.pais` (texto livre) + `controlled_taxonomies` (lista genérica `dominio`/`codigo`/`nome`, 61 linhas) | Não existe registro dedicado de país com ISO2, região operacional e política de visibilidade separada. Precisa de extensão, não de tabela nova: promover `pais` de texto livre para FK a um catálogo formal (pode nascer como linhas de `controlled_taxonomies` com `dominio='pais'`, ou como tabela derivada de `citizenship_tracks` distinct). |
| 2 | `legal_frameworks` | **Existe, fundido com a track** | `citizenship_tracks` (campos `marco_juridico_referencia`, `legal_reference_label`, `legal_reference_summary`, `official_source_name`, `official_source_url`, `criterio_aprovacao`, `versao`, `lifecycle_status`) | O framework jurídico hoje vive dentro do registro da via (`track`), não como entidade própria versionável independente da via. Extensão possível sem tabela nova: normalizar esses campos para permitir mais de um framework por track ao longo do tempo (hoje é 1:1 embutido). |
| 3 | `legal_milestones` | **Existe** | `legal_reference_milestones` (FK `track_id`, `label`, `reference_type`, `official_source_url`, `status`, `verified_at/by`, `review_required`, `versao`, `lifecycle_status`) | Mapeamento quase direto. Já tem 32 linhas reais cobrindo os países do núcleo publicado. |
| 4 | `citizenship_routes` | **Existe parcial** | `citizenship_tracks.via_preliminar` + `.status_via` (texto livre, não normalizado) | Maior lacuna real: não há `route_code`/`route_type`/`generation_rule`/`residence_rule`/`dual_citizenship_rule` estruturados — está tudo condensado em dois campos de texto. Precisa de extensão de schema em `citizenship_tracks` ou tabela filha `citizenship_track_routes`, não uma `citizenship_routes` paralela e desconectada. |
| 5 | `route_requirements` | **Não existe estruturado** | `citizenship_tracks.requisitos_entrada` (texto livre) | Gap real. Hoje é um campo de texto, não uma lista de requisitos avaliáveis um a um. |
| 6 | `source_registry` | **Existe** | `research_sources` (`source_type`, `title`, `repository_or_institution`, `citation_text`, `url`, `access_date`, `source_status`, `access_level`, `reviewed_by/at`) | Cobre bem o conceito, mas hoje é escopado por `research_case_id` (por caso), não por país/framework. `citizenship_tracks.official_source_name/url` duplica parcialmente isso no nível da via. Precisa de extensão (permitir fonte vinculada a framework/via, não só a caso) mais reconciliação com o campo duplicado em `citizenship_tracks`. |
| 7 | `case_country_hypotheses` | **Existe, fragmentado em 2 tabelas** | `research_case_hypotheses` (`research_case_id`, `title`, `statement`, `category`, `status`, `confidence_level`, `related_person_id/relationship_id/event_id`) **e** `research_hypotheses` (`case_id`, `person_id`, `titulo`, `descricao`, `status`, `grau_confianca`) | Duas tabelas de hipótese que se sobrepõem e nenhuma tem `country_id`/`route_id` — não dá para hoje saber "qual país esta hipótese testa" diretamente. Este é o gap mais importante para o motor multipaís: precisa de FK país/via, e as duas tabelas de hipótese precisam ser reconciliadas (uma delas provavelmente é legado de uma fase anterior). |
| 8 | `lineage_links` | **Existe, fragmentado em 2 tabelas** | `genealogical_relationships` (`person_from_id`, `person_to_id`, `relation_type`, `evidence_id`, `source_id`) **e** `research_relationships` (`person_a_id`, `person_b_id`, `relationship_type`, `confidence_level`, `validated_by/at`) | Mesma duplicação estrutural de #7: dois modelos de relacionamento familiar coexistindo. Precisa de reconciliação antes de estender, não de uma terceira tabela `lineage_links`. |
| 9 | `life_events` | **Existe, fragmentado em 3 tabelas** | `research_case_events`, `research_events` **e** `historical_context_events` — todas com `person_id`/`event_type`/data/local, cada uma com um subconjunto de campos diferente | Fragmentação mais séria encontrada. Três tabelas de evento genealógico paralelas. Consolidar é pré-requisito para qualquer `life_events` unificado — criar uma quarta tabela pioraria o problema que os documentos dizem estar resolvendo. |
| 10 | `citizenship_events` (ACQUISITION/NATURALIZATION/LOSS/…) | **Não existe tipado** | mais próximo: `research_case_events.event_type` (texto livre, sem `legal_basis`/`naturalization_country`/`voluntary_act`/`impact_on_transmission`) | Gap real. Hoje um evento de naturalização/perda seria só uma linha genérica de `research_case_events`, sem os campos jurídicos específicos que o motor precisa (base legal, ato voluntário, impacto na transmissão). |
| 11 | `evidence_records` | **Existe e é mais completo que a proposta** | `research_evidence_items` (`evidence_type`, `title`, `person_id`, `relationship_id`, `event_id`, `source_id`, `document_id`, `evidence_status`, `confidence_level`, `validation_rationale`, `discard_reason`, `reviewed_by/at`, `validated_by/at`, `sensitivity_level`, `client_visibility`) + `research_evidence_links` (vínculo polimórfico `entity_type`/`entity_id`) | Melhor cobertura de todo o de-para. Não há necessidade de estender nem criar nada aqui — só ligar o motor jurídico a essas tabelas já maduras. |
| 12 | `rule_evaluations` | **Não existe** | — | Gap real confirmado. Não há hoje nenhum registro de "regra X aplicada à hipótese Y, com este resultado explicável, nesta versão do framework". É a peça genuinamente nova a construir — mas pequena e focada (snapshot de avaliação), não uma reconstrução de tudo em volta. |
| 13 | `human_decisions` | **Existe, fragmentado em 3 tabelas** | `decisions` (genérico: `titulo`, `dominio`, `status`, `versao`, `contexto`, `decisao`, `alternativas`, `impacto`, `responsavel_user_id`, `vigencia_inicio/fim`, `case_id`) + `owner_override_events` (40 linhas, log de exceções da proprietária) + `legal_clause_matrix` (36 linhas, decisão jurídica por tema de cláusula contratual, `bloqueia_assinatura`) | Terceira fragmentação: três lugares diferentes onde uma "decisão humana" pode estar registrada, cada um com propósito ligeiramente distinto (governança geral / override pontual / cláusula contratual). `decisions` é o mais genérico e provavelmente a base certa para decisão de hipótese jurídica, mas isso é uma escolha para a proprietária confirmar, não algo para eu decidir sozinho. |

## Padrão que se repete: fragmentação, não ausência

Em 4 das 12 entidades propostas (hipóteses, relacionamentos, eventos, decisões), o problema não é
"falta a tabela" — é que **já existem 2 ou 3 tabelas concorrentes** para o mesmo conceito,
provavelmente construídas em fases diferentes do projeto sem reconciliação:

- Hipóteses: `research_case_hypotheses` × `research_hypotheses`
- Relacionamentos: `genealogical_relationships` × `research_relationships`
- Eventos: `research_case_events` × `research_events` × `historical_context_events`
- Decisões: `decisions` × `owner_override_events` × `legal_clause_matrix`

Adicionar as 4 tabelas novas que `instrucoes-motor-cidadania-v1.0.md` propõe para esses mesmos
conceitos (`case_country_hypotheses`, `lineage_links`, `life_events`, `human_decisions`) criaria
uma **quarta** camada em cima de uma fragmentação que já existe — o oposto do "estender, não
duplicar". A lógica mais ampla que a proprietária pede ("algo mais amplo que abarque mais") deve
nascer de **consolidar** essas duplas/triplas primeiro, não de somar mais uma tabela a cada grupo.

## O que é gap real (vale construir)

Depois do de-para, restam três peças genuinamente ausentes, pequenas e bem definidas:

1. **Estrutura de rota normalizada** dentro de `citizenship_tracks` (hoje é texto livre em
   `via_preliminar`/`status_via`/`requisitos_entrada`) — extensão de schema, não tabela nova.
2. **`citizenship_events` tipado** com os campos jurídicos específicos (base legal, ato
   voluntário, país de naturalização, impacto na transmissão) — hoje só existe como evento
   genérico sem esses campos.
3. **`rule_evaluations`** — snapshot explicável de avaliação de regra por hipótese, verdadeiramente
   inexistente hoje.

## Fora do escopo desta entrega

- Nenhuma migração SQL, nenhuma alteração de schema e nenhuma linha de código foram criadas ou
  alteradas a partir deste documento — é só o mapeamento pedido.
- A consolidação das tabelas fragmentadas (hipóteses, relacionamentos, eventos, decisões) e a
  extensão de `citizenship_tracks` para rota normalizada dependem de decisão da proprietária sobre
  qual das tabelas concorrentes vira a canônica em cada grupo — listado em "Próximos passos".
- A deduplicação de `product_catalog` e `citizenship_tracks` (linhas triplicadas) não foi
  executada — nenhuma linha foi apagada ou alterada.
- As "Fases 0–8" e a "Condição para aprovação" de `instrucoes-motor-cidadania-v1.0.md` continuam
  pendentes; este de-para é insumo para essas fases, não substitui a aprovação formal.

## Próximos passos (aguardando decisão da proprietária)

1. Para cada grupo fragmentado, escolher a tabela canônica e o destino da(s) tabela(s)
   concorrente(s) — migrar dados e arquivar (nunca apagar fisicamente), ou manter ambas com papéis
   explicitamente distintos se de fato servirem propósitos diferentes:
   - Hipóteses: `research_case_hypotheses` vs. `research_hypotheses`.
   - Relacionamentos: `genealogical_relationships` vs. `research_relationships`.
   - Eventos: `research_case_events` vs. `research_events` vs. `historical_context_events`.
   - Decisões: `decisions` vs. `owner_override_events` vs. `legal_clause_matrix`.
2. Confirmar a divergência de classificação em `CA-COMBO-001` (`tipo_oferta`) antes de qualquer
   dedup automática de `product_catalog`.
3. Decidir a forma de deduplicar `citizenship_tracks` (11 grupos/33 linhas) — mesma regra de
   "nunca apagar fisicamente" da Planilha Mestre.
4. Só depois de 1–3: desenhar a extensão de `citizenship_tracks` para rota normalizada, o
   `citizenship_events` tipado e o `rule_evaluations` novo — as três únicas peças genuinamente
   ausentes.
