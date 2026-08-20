# G-06 — Achados Genealógicos e Encontros de Linhagem

Data: 20/08/2026 · Status: implantado (nenhuma publicação, mensagem ou ação externa)

Fluxo: Fonte → Evidência → Validação interna → Achado Genealógico → Árvore/Linha do tempo →
Micro-entrega ou Relatório, **se aprovado**.

## 1. Schema

`genealogical_findings` — case_id, family_id, research_item_id, primary_research_person_id,
title, generation, finding_type, internal_summary, confirmed_facts, facts_to_confirm,
period_start/end, locality, family_relationship, relevance, validation_status,
evidence_links, source_links, negative_source_consulted_at, negative_next_action,
tree_impact, timeline_impact, planning_impact, eligible_for_client_deliverable,
client_deliverable_id, responsible_user_id, found_at, validated_at, internal_notes + meta e arquivamento.

`lineage_encounters` — case_id, family_id, lineage_path_a_id, lineage_path_b_id, encounter_type,
title_internal, title_client, contexto_historico, territorios_migratorios, memoria_familiar,
praticas_culturais_documentadas, encontros_no_brasil, repertorios_narrativos, resumo_interno,
resumo_aprovado_cliente, evidence_links_a/b (evidence_links é a soma), confidence_internal,
validation_status, disclaimer_obrigatorio, tree_impact, timeline_impact, approval_status,
client_deliverable_id, responsible_user_id, data_marco + meta e arquivamento.

RLS: leitura para membros da organização, escrita para quem tem `can_write`. Sem exclusão física
(`DELETE` recusado pelo gatilho). Funções internas com `search_path` fixo e execução revogada.

## 2. Travas no banco (`fn_gf_guard`, `fn_le_guard`)

| Código | Regra |
|---|---|
| `ACHADO_SEM_EVIDENCIA` | achado exige ao menos uma evidência ou fonte |
| `RESULTADO_NEGATIVO_INCOMPLETO` | negativo exige fonte consultada + data + próxima ação alternativa |
| `HIPOTESE_NAO_VALIDAVEL` | hipótese não é validada como fato |
| `ELEGIBILIDADE_SEM_VALIDACAO` / `ENTREGA_SEM_ELEGIBILIDADE` | entrega ao cliente só após validação interna |
| `IMPACTO_SEM_REVISAO` | árvore/timeline só recebem impacto aplicado após revisão interna |
| `ENCONTRO_SEM_DUAS_LINHAS` / `ENCONTRO_SEM_EVIDENCIA_POR_LADO` / `MARCO_SEM_EVIDENCIA` | duas linhas e evidência por lado, salvo marco de origem |
| `CONEXAO_NAO_COMPROVADA` | conexão confirmada exige validação interna e confiança documental |
| `ENCONTRO_SEM_DISCLAIMER` / `ENCONTRO_SEM_RESUMO_APROVADO` / `APROVACAO_SEM_VALIDACAO` | aprovação exige disclaimer, resumo sanitizado e validação |
| `PROJECAO_SEM_APROVACAO` | sem aprovação não existe projeção cliente |
| `LINGUAGEM_PROIBIDA` | recusa termo determinista, terapêutico ou de traço psicológico em texto do cliente |

Validação interna **não** é conclusão jurídica nem cidadania reconhecida — o disclaimer padrão
acompanha toda projeção.

## 3. Dicionários (`src/lib/achados-genealogicos.ts`)

15 tipos de achado (registro civil … outro/justificar), 6 tipos de encontro, relevância,
validação, impacto, confiança, aprovação, disclaimer padrão e lista de termos proibidos.
`projetarEncontroParaCliente` devolve só título, resumo aprovado, data do marco e disclaimer —
nunca resumo interno, evidências, fontes ou confiança.

## 4. Telas

`/achados/:caseId` (Desk, link na ficha do caso): aba Achados e aba Encontros, com bloqueios
exibidos por código antes de gravar, seleção de evidências/fontes, bloco específico de resultado
negativo, pré-visualização da projeção cliente e arquivamento com motivo.

## 5. Testes (`bunx vitest run src/lib/__tests__/achados-genealogicos.test.ts` — 14 passaram)

1. achado sem evidência/fonte negado (e aceito com apenas uma fonte);
2. resultado negativo registrável com fonte, data e próxima ação; negado sem próxima ação;
3. encontro sem disclaimer não aprova;
4. hipótese não vira conexão confirmada (e conexão documentada + validada passa);
5. projeção cliente não carrega resumo interno, evidências, fontes nem confiança; sem
   aprovação/disclaimer/resumo não há projeção. Extras: duas linhas e evidência por lado,
   marco de origem, entrega sem aprovação, linguagem proibida.

## 6. Confirmação

Nenhum conteúdo foi publicado no App Cliente, nenhuma mensagem foi enviada, nenhuma pesquisa
externa foi disparada e nenhuma relação familiar foi afirmada sem evidência e revisão humana.
Nenhum registro de caso real foi criado ou alterado nesta entrega.
