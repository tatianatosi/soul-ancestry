# De-para: materiais externos recebidos em 28/08/2026 vs. arquitetura canônica

**Data:** 28 de agosto de 2026
**Origem dos materiais:** 3 documentos colados pela Proprietária diretamente na conversa (não fazem parte do acervo já recuperado em `docs/evolucao/recuperados/`):

1. `CLUBE_ANCESTRAL_PRODUCTS_SKU.md` — catálogo de produtos/SKU por fase do cliente
2. `CLUBE_ANCESTRAL_CRM_JOURNEY.md` — CRM, calls, onboarding WhatsApp, micro-entregas
3. `Clube Ancestral — Planejador de Cidadania, Jornada, Micro-entregas, Touchpoints e SKUs` (sem nome de arquivo, v1.0, 28/08/2026)

**Método:** cada um propõe nomes de tabela, SKU e vocabulário de fase próprios, gerados fora deste repositório. Este documento não os implementa como estão — verifica, para cada termo proposto, se já existe um equivalente canônico real (com evidência de arquivo), segue o padrão dos de-paras já existentes (`src/lib/jornada-de-para.ts`, `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md`, `07_contratos_e_comercial/ARQUITETURA_SKU_CICLO_DE_VIDA_E_MICROENTREGAS.md`) em vez de duplicá-los.

---

## 1. Fases da jornada

Os três documentos propõem vocabulários de fase próprios (4 fases no doc 1, estágios de funil no doc 2, 6 fases 0–5 no doc 3). **Não criar um quarto vocabulário.** `src/lib/jornada-de-para.ts` já resolve isso: é a ponte declarada entre os 5 vocabulários de fase que já existiam no código, com `onboarding-jornada.ts` como canônico (é o único que grava em `case_plans.fase_jornada`).

| Termo proposto | Documento | Correspondência mais próxima no canônico | Precisão |
|---|---|---|---|
| Fase 1 "Descoberta e Diagnóstico" | doc 1 | `aceite_e_formalizacao` (via `derivacao_jornada`) | aproximada |
| Fase 2 "Pesquisa e Montagem" | doc 1 | `pesquisa_inicial` / `pesquisa_e_validacao` | aproximada |
| Fase 3 "Validação Jurídica e Retificação" | doc 1 | `preparacao_documental` | aproximada |
| Fase 4 "Protocolo e Conclusão" | doc 1 | `protocolo_e_acompanhamento` | aproximada |
| Fase 0 "Descobrir sua história" | doc 3 | pré-venda, sem fase canônica de caso (`derivacao_jornada.triagem_inicial`) | aproximada |
| Fase 1 "Diagnóstico e Direção" | doc 3 | `aceite_e_formalizacao` | aproximada |
| Fase 2 "Pesquisa e Documentos" | doc 3 | `pesquisa_inicial` / `pesquisa_e_validacao` | aproximada |
| Fase 3 "Validação e Pasta" | doc 3 | `preparacao_documental` | aproximada |
| Fase 4 "Protocolo e Acompanhamento" | doc 3 | `protocolo_e_acompanhamento` | aproximada |
| Fase 5 "Reconhecimento e Legado" | doc 3 | `pos_reconhecimento` (+ pós-jornada sem fase canônica para "legado") | aproximada |

**Ação aplicada:** o motor de fases sobre o catálogo (já aprovado) usa `onboarding-jornada.ts` como fonte de fase, traduzida por `jornada-de-para.ts` quando precisar ler de um vocabulário não-canônico. Nenhuma fase nova é criada.

---

## 2. Nomes de SKU

Os três documentos usam três convenções de SKU diferentes entre si e diferentes da real. A real, com 91 SKUs catalogados por prefixo, está em `docs/evolucao/recuperados/fontes-primarias/01_CATALOGO_E_SKUS/DICIONARIO_DE_SKUS.csv`. Uma segunda camada, mais recente (Top 30 por jornada, 19/08), está em `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md` seção 8 — usa prefixos como `CA-DIAG`, `CA-PESQ`, `CA-PROT` que **não aparecem** no dicionário de 91 SKUs. As duas ainda não foram reconciliadas entre si; isso é anterior a hoje e não deste de-para.

| Prefixo/código proposto | Documento | Existe no dicionário de 91 SKUs? | Existe na decisão Top 30 (19/08)? | Nota |
|---|---|---|---|---|
| `SKU-DIAG-FREE-001`, `SKU-RES-ITA-007` etc. | doc 1 | Não | Não | Convenção própria do documento, sem correspondência em nenhuma fonte real. Não usar para cadastro. |
| `CA-DIAG-FREE-001`, `CA-CID-001/002/003` | doc 3 | Parcial — `CA-CID-NNN` é formato real (37 de 91 SKUs), mas `CA-DIAG-FREE-001` não existe em nenhuma fonte | `CA-DIAG-001..004` existe na decisão Top 30 | `CA-CID-001/002/003` do doc 3 confunde com o padrão real `CA-CID-NNN`, mas os números específicos (001=diagnóstico, 002=pasta, 003=assessoria) não batem com o dicionário real, onde `CA-CID` é só "cidadania por país/etapa" |
| `CA-RES-ITA-001`, `CA-RES-POR-001` etc. | doc 3 | Não | Não | Não existe prefixo `CA-RES` em nenhuma fonte real |
| `CA-LAW-TRAD-001`, `CA-LAW-APOS-001`, `CA-LAW-RET-001`, `CA-LAW-VAL-001` | doc 3 | Não | Não | Não existe prefixo `CA-LAW` em nenhuma fonte real |
| `CA-PROT-CONS-001`, `CA-PROT-JUDI-001`, `CA-PROT-CONT-001` | doc 3 | Não | `CA-PROT-001..004` existe (formato diferente, sem sufixo de país/via) | — |
| `CA-POS-AIRE-001` | doc 3 | Próximo — dicionário real tem `CA-POS-001` (AIRE + Passaporte), sem sufixo `AIRE` | `CA-POS-001..004` existe | — |
| `CA-CID-AT-FAM-2026-001`, `CA-CID-AT-001` (já em uso em `planejador-parametros.ts`, não nos 3 docs de hoje) | já no código | **O próprio dicionário de 91 SKUs marca esse formato (`CA-CID-[PAÍS]-NNN`) como "FORMATO AMBÍGUO — parece oficial mas não é" e "PROPOSTA PENDENTE DE APROVAÇÃO"** | — | Inconsistência real, anterior a hoje: há código em produção usando um formato que o próprio dicionário de SKU diz que nunca foi aprovado. Sinalizado aqui, não corrigido — decisão humana, não é escopo deste de-para. |

**Ação aplicada:** nenhum código de SKU dos 3 documentos entra em `product_catalog`. Onde o motor de fases precisar de um SKU real para popular a tela, usa exclusivamente o que já está homologado em `product_catalog` (via `homologacao-skus`), nunca os códigos inventados nos documentos.

---

## 3. Entidades/tabelas propostas

| Tabela proposta | Documento | Equivalente real já decidido/implementado | Evidência |
|---|---|---|---|
| `products`, `pricing_rules`, `pilot_status` | doc 1 | `product_catalog` (única fonte canônica) | `src/lib/catalogo-canonico.ts`, `supabase/migrations/*` |
| `crm_calls` | doc 2 | Painel de Calls / CA-04 (biblioteca pura, sem tabela solta) | `src/lib/ca04-crm-mestre.ts` |
| `discovery_data` | doc 2 | `discovery_assessments` (decidido 19/08) | `docs/governanca/CA-DECISOES-CANONICAS-...md` seção 5 |
| `whatsapp_automations` | doc 2 | Fora do MVP por decisão explícita: "WhatsApp automático... ficam fora do MVP" | idem, seção 2 |
| `micro_entregas` | doc 2 | `client_deliverables` (decidido 19/08) | idem, seção 11 |
| `crm_interactions` | doc 2 | `crm_interactions` (mesmo nome, mas schema já decidido é diferente do proposto no doc 2 — imutável, com `supersedes_interaction_id`) | idem, seção 6 |
| `crm_metrics` | doc 2 | `conversion_events` (decidido 19/08) | idem, seção 5 |
| `clients`, `citizenship_cases`, `persons`, `person_relationships`, `case_lineages` | doc 3 | `contacts`, `citizenship_tracks`, `case_services` (já implementado e migrado) | `src/lib/ca04-crm-mestre.ts`, migrações com `citizenship_tracks` (9 referências no schema) |
| `micro_deliveries`, `touchpoint_events`, `offers`, `offer_events` | doc 3 | `client_deliverables` (existe); motor de "próxima oferta contextual" — **não encontrado equivalente real**, é lacuna genuína | busca no repositório sem resultado |

**Único item genuinamente novo, sem equivalente real construído:** o motor de "oferta contextual" do doc 3 (seção 6 — decidir a próxima oferta certa com base em micro-entrega concluída, SKU já contratado e janela de supressão). Isso não existe hoje. Não está no escopo aprovado agora (mapear fases sobre o catálogo real); fica registrado aqui como candidato a próximo pedido explícito, não construído por conta própria.

---

## 4. O que este de-para aplica, e o que fica em aberto

**Aplicado:** o motor de fases da jornada (já aprovado) usa exclusivamente `onboarding-jornada.ts` + `jornada-de-para.ts` para fase, e `product_catalog` para SKU — nenhum nome dos 3 documentos externos entra em código ou schema.

**Fica em aberto, não decidido aqui:**
- A inconsistência do formato `CA-CID-[PAÍS]-NNN` já em uso em `planejador-parametros.ts` apesar de nunca aprovado no dicionário de SKU.
- A reconciliação entre o dicionário de 91 SKUs e a decisão Top 30 de 19/08 (prefixos diferentes, mesma responsabilidade) — anterior a hoje.
- O motor de oferta contextual do doc 3, genuinamente ausente.
