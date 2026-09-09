# De-Para — Prompt "Planejador Universal com Marcos Jurídicos e CRM Vivo" (v1.0, 08/09) vs. "Prompt Canônico — Preços Resgatados" (v2.1, 04/09) vs. schema real

```yaml
status: concluído — documento de análise, nenhum ato executado
versão: 1.0
data: 2026-09-09
responsável pela decisão: Proprietária do Clube Ancestral
classificação: de-para de dois prompts + cruzamento contra o banco real
fontes:
  - Prompt de Implementação — Planejador Universal com Marcos Jurídicos e CRM Vivo (PDF, v1.0, 08/09/2026)
  - Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados (v2.1, 04/09/2026)
  - docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md (execução real do v2.1)
  - schema real do Supabase (zsxpdbhdvbuulwpepemd), consultado ao vivo em 09/09/2026
  - migrations 20260908230000/20260908231000/20260909000000 (correções aplicadas em 08-09/09)
escopo: confirmar entendimento de ciclo de vida/produto-pai/trilha/marco jurídico e comparar os dois
  prompts entre si e contra o que já existe implementado, sem executar nada novo
limites: documento de análise. Nenhuma tabela criada, nenhum dado escrito, nenhuma migração aplicada
  nesta entrega — só leitura e comparação.
```

## 1. Confirmação de entendimento

Os quatro conceitos centrais dos dois prompts já estão implementados e coerentes entre si — não há
conflito a resolver:

| Conceito | O que os prompts pedem | O que já existe (real, hoje) |
|---|---|---|
| **Ciclo de vida (F0–F7)** | 8 fases sem prazo: Entrada → Diagnóstico autorizado → Pesquisa/prova → Estratégia/formalização → Execução → Pós-reconhecimento → Memória/legado → Continuidade | Os 9 produtos-pai (`PRODUTOS_PAI_CANONICOS`, `src/lib/planejador-produtos-pai.ts`) já cobrem exatamente essas 8 fases — PP-03/PP-04 dividem "Pesquisa e prova" em dois produtos-pai, o resto é 1:1. Decisão já tomada pela proprietária em 07/09. |
| **Produto-pai** | Atributo de orquestração do Caso 360; nunca família, categoria, SKU ou produto público | Implementado: `planner_catalog_feed.product_parent` (78 itens), `agruparPorProdutoPai()`. Nenhum SKU/família/faceta foi tocado. |
| **Trilha** | País + via (+ ramo), ligada a um marco jurídico | `citizenship_tracks` — já existe, já corrigido ontem (ver seção 3): 1 trilha v1.0 por país na organização real, sem sobreposição. |
| **Marco jurídico** | Dado versionado/auditável, vinculado a fonte oficial, nunca conclui elegibilidade, orienta checklist/gate/revisão humana | `versioned_legal_rules` (a "regra"/framework) + `legal_reference_milestones` (o "marco" propriamente dito), ambas com `track_id` → `citizenship_tracks.id`. Homologação real via `homologarTrilhaOuRegra` (08/09). |

**Achado central deste de-para**: o prompt de 08/09 propõe nomes de tabela novos
(`legal_framework`, `country_track`) para conceitos que **já existem** sob outros nomes
(`versioned_legal_rules`, `citizenship_tracks`). Criar as tabelas novas do jeito que o prompt descreve
duplicaria a base normativa que foi corrigida ontem — a seção 2 detalha campo a campo.

## 2. De-para de entidades — os dois prompts contra o schema real

| Entidade no prompt 08/09 | Entidade no prompt v2.1 (04/09) | Equivalente real hoje | Situação |
|---|---|---|---|
| `legal_framework` | (motor jurídico separado, não especificado em campos) | `versioned_legal_rules` (`track_id`, `tema`≈title, `status`≈review_status, `fonte_referencia`≈official_source_url, `vigencia_inicio/fim`≈effective_from/to, `reviewed_by/at` iguais) | **Já existe.** Não recriar — só faltam `risk_level` e `route_code` como colunas novas, se necessário. |
| `legal_gate` | — | **Nada equivalente.** | **Gap real.** Nem `versioned_legal_rules` nem `legal_reference_milestones` modelam um gate com `trigger`/`evidence_required`/`outcome_if_pass`/`outcome_if_fail`/`owner_role`. Hoje isso vive difuso em `bloqueios-dicionario.ts` (bloqueios genéricos do caso, não por marco jurídico específico de um país). |
| `country_track` | `nationality_track` | `citizenship_tracks` (`id`, `pais`, `via_preliminar`, `status_via`, `marco_juridico_referencia`, `track_id` em `versioned_legal_rules`/`legal_reference_milestones`) | **Já existe**, e foi exatamente o que a consolidação de ontem corrigiu (uma trilha v1.0 por país, sem sobreposição, ligada à regra/marco reais). |
| `research_base` | `research_base` | — | **Gap real, nos dois prompts.** Registrado como "não executado" no v2.1 (seção 11.3) e continua não implementado. |
| `family_case`, `family_branch` | idem | — | **Gap real, nos dois prompts.** Mesmo motivo: mexe em como um caso se relaciona a ramos/trilhas — mudança estrutural maior. |
| `case_product_parent` | — | `planner_catalog_feed.product_parent` já cumpre esse papel por item; falta só a ligação direta `case_id → product_parent` no Caso 360 | **Parcial.** O dado existe no catálogo-alimento; falta materializar por caso. |
| `commercial_condition` | `case_commercial_condition` | **`commercial_conditions`** (`case_id`, `proposal_id`, `valor_total_referencia`, `forma_pagamento`, `parcelas`, `status`, `homologado_por/em`) | **Já existe**, tabela real e madura (elo 3 da cadeia operacional: Proposta → Condição Comercial). Nenhum dos dois prompts precisa recriar isso. |
| `microdelivery` | idem | **`client_deliverables`** (`case_id`, `journey_phase`, `deliverable_type`, `approval_status`, `published_at`, `title_client`, `deep_link`) | **Já existe**, cobre o fluxo produção → revisão → aprovação → liberação pedido pelos dois prompts. |
| `crm_case_projection` | — | **Nada como tabela única** — o Painel Hoje (`PainelDia`, 1038 linhas) já cobre formalização/comercial, financeiro, checklist jurídico, higiene de cadastro, fila de revisão jurídica, mas calculado ao vivo em várias consultas, não materializado numa projeção por caso. | **Gap parcial.** A informação em grande parte já existe e já aparece no painel; falta uma projeção única (`crm_stage`, `health`, `blocking_gate`, `legal_review_status` num só lugar) se o objetivo for performance/API, não conteúdo novo. |
| `price_catalog_rescued` | idem (mesmo nome, mesmo prompt de origem) | `price_catalog_rescued` | **Já existe e já foi conferido** contra o v2.1 linha a linha (52 valores + 6 divergências IT/PT, ver migration de 09/09). O prompt de 08/09 só reafirma "usar como referência, nunca como preço ativo" — já é assim. |

## 3. O que a consolidação de ontem (08/09) já fechou, e que este prompt novo confirma como certo

- Trilha (`citizenship_tracks`) ligada a marco jurídico (`versioned_legal_rules` +
  `legal_reference_milestones`) via `track_id` — exatamente o modelo que a seção 3 do prompt de 08/09
  pede ("marco não conclui elegibilidade... orienta checklist, gates e validação humana").
- O caso real da Ana (Áustria) hoje aponta para a trilha v1.0 certa, com marco jurídico vinculado —
  antes da correção de ontem, ele apontava para uma trilha sem marco algum.
- `homologarTrilhaOuRegra` (08/09) é a ação que faltava para o "review_status"/"reviewed_by"/"reviewed_at"
  do `legal_framework` proposto neste prompt novo — já implementada, sob os nomes reais
  (`status`, `reviewed_by`, `reviewed_at` de `versioned_legal_rules`).

## 4. Cobertura de países — os dois prompts batem

Os 13 países/processos do prompt de 08/09 (Itália, Portugal, Espanha, Alemanha, Polônia, Hungria,
Áustria, Croácia, Romênia, Luxemburgo, Irlanda, Brasil/naturalização, França/naturalização) são
exatamente os mesmos do v2.1 e os mesmos já semeados em `citizenship_tracks`/`price_catalog_rescued`.
Nenhum país novo a modelar — o prompt de 08/09 é mais rico em **conteúdo jurídico por país** (rota,
documento-chave, condição que exige revisão humana, fonte oficial) do que em países novos. Essa riqueza
(seção 2 do PDF) é o material certo para enriquecer `legal_reference_milestones`/`versioned_legal_rules`
dos países que hoje têm só 1 marco genérico — mas é conteúdo a transcrever com cuidado, não a inventar
por analogia, e depende de decisão da proprietária sobre quais das ~10 linhas viram registro formal.

## 5. Gaps genuínos (não implementados por nenhum dos dois prompts até hoje)

1. **`legal_gate`** — modelo estruturado de gate por marco jurídico (trigger/evidência/outcome). Hoje
   existe só como bloqueio genérico de caso (`bloqueios-dicionario.ts`), não amarrado a um marco jurídico
   específico de um país.
2. **`research_base` / `family_branch` / `family_case` / `nationality_track`(multi-ramo)** — mudança
   estrutural maior em como um caso se relaciona a ramos e trilhas; os dois prompts pedem o mesmo desenho
   e nenhum foi implementado. Precisa de rodada própria com migration dedicada.
3. **`crm_case_projection`** — projeção única por caso para o Painel Hoje. O conteúdo já existe espalhado
   (`PainelDia`, `commercial_conditions`, `client_deliverables`, checklist jurídico); falta materializar
   como uma visão/tabela só, se isso for prioridade além do que o painel já mostra hoje.
4. **Conteúdo jurídico rico por país** (rota, documento-chave, condição de revisão humana, fonte oficial,
   alertas específicos) para os países além de Áustria — hoje só Áustria tem 1 regra jurídica cadastrada;
   os outros 10 têm marco (`legal_reference_milestones`) mas nenhuma regra formal (`versioned_legal_rules`)
   ainda.

## 6. Recomendação — não recriar, só fechar o que falta

Executar o prompt de 08/09 **literalmente** (criando `legal_framework`, `legal_gate`, `country_track`,
`commercial_condition`, `microdelivery`, `crm_case_projection` do zero) duplicaria cinco tabelas que já
existem e funcionam sob outros nomes — repetindo o padrão já visto várias vezes nesta sessão. O caminho
correto é:

1. Não recriar `legal_framework`/`country_track`/`commercial_condition`/`microdelivery` — já existem.
2. Tratar os 4 gaps genuínos da seção 5 como o escopo real de qualquer próxima execução.
3. Antes de tocar em `legal_gate` ou nas entidades multi-ramo, decidir com a proprietária: transcrever o
   conteúdo jurídico da seção 2 do PDF para os 10 países sem regra formal ainda (gap 4) é o item mais
   barato e sem risco — pode ser feito primeiro, isolado dos outros três gaps estruturais.
