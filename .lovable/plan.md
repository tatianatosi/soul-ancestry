# Pesquisa Genealógica e Evidências — restauração da cadeia completa

Consolidar a área dentro de **Casos 360**, sem nova aba principal e sem redesenho de navegação. A subárea passa a se chamar **Pesquisa Genealógica e Evidências** em todos os pontos de entrada.

## O que já existe (será reaproveitado, não recriado)
- Tabelas `research_cases`, `research_people`, `research_sources`, `evidences`, `genealogical_findings`, `research_reports`, `research_name_variants`, `research_relationships`, `research_events`, `research_pending_items`, `genealogical_person_profiles`, `lineage_paths`, além do módulo de fontes/documentos (G-08).
- Rota `/pesquisa-evidencias/:caseId` já com as 9 seções contextuais.

## Ajustes de dados (uma migration aditiva)
Sem tabela nova quando já há equivalente canônico. Colunas que faltam para o modelo A–F:
- `research_cases`: `family_id`, `citizenship_track_id`, `research_type`, `internal_hypothesis`, `authorized_scope`, `next_milestone`; lista fechada de status (`nao_iniciada` … `arquivada`) por trigger de validação.
- `research_people`: `family_member_id`, `genealogical_person_profile_id`, `papel_na_linhagem`, `geracao`, `linha_transmissao`, `pais_localidade`.
- `research_sources`: `source_location`, `consulted_at`, `consulted_by`, `result_summary_internal`.
- `evidences`: `validation_notes_internal` e lista fechada dos 12 estados de evidência.
- `genealogical_findings`: `confidence`, `client_projection_status` (nunca publica sozinho).
- `research_reports`: `version`, `internal_reference`, `evidence_summary_internal`, `approved_summary_client`, `responsible_user_id`, `published_at`; estados `rascunho_interno | em_revisao | aprovado_interno | publicado_cliente | arquivado`.

Regras aplicadas no banco (triggers):
- upload/fonte não cria pessoa, relação, evento nem linhagem;
- relação/evento exige evidência vinculada ou marca explícita de hipótese interna;
- `validada_internamente` não altera nenhum estado jurídico, contratual ou financeiro;
- relatório só chega a `publicado_cliente` com resumo sanitizado próprio preenchido e aprovação registrada;
- exclusão física bloqueada — apenas arquivamento com motivo e autoria, com auditoria.

RLS: mantida por organização e caso, leitura/escrita apenas para equipe autorizada; cliente nunca alcança fonte, evidência, achado ou nota interna.

## Camada de aplicação
- `src/lib/pesquisa-cadeia.ts` (novo): listas fechadas de status, regra de cadeia Ficha → Fonte → Evidência → Validação → Achado → Relatório → App Cliente, e os gatilhos internos por mudança de estado de evidência (tarefa de triagem, alerta crítico, próxima ação datada, pendência de retificação/tradução) — todos internos, sem envio, sem publicação.
- `src/lib/pesquisa-cadeia.functions.ts` (novo): leitura consolidada do caso (visão, ficha, pessoas, fontes, evidências, validação, achados, relatórios, alertas) e escritas auditadas (registrar fonte, registrar evidência, mudar estado com nota, arquivar com motivo, preparar rascunho de microentrega).
- `src/lib/documentos-solicitacoes.ts`: rótulos das 9 seções alinhados ao texto normativo.
- `src/components/saas/shell.tsx` e mockup do Desk: rótulo passa a **Pesquisa Genealógica e Evidências**.

## Interface (sem novas abas)
`src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx` — as 9 seções passam a ler dados reais:
1. Visão de pesquisa — objetivo, trilha, status, autorização, responsável, hipótese interna, próximo marco, próxima ação/prazo, alertas.
2. Ficha genealógica — pessoas, variantes, relações, eventos, linhagens, árvore e timeline internas derivadas, lacunas, confiança.
3. Pessoas, famílias e ramos — geração, linha de transmissão, localidade, estado de identificação e vínculos.
4. Fontes e documentos — G-08 preservado no lugar, com catálogo controlado, metadados e arquivamento com motivo.
5. Evidências e validação — estados, revisor, data, nota interna, revisão jurídica e pendências derivadas.
6. Achados e microentregas — achado interno e preparação de entrega sanitizada separada.
7. Relatórios F1/F2 — tipo, estado, versão, responsável e vínculos internos.
8. Alertas e histórico — pendências, prazos, responsável e auditoria.

## Caso Ana (CA-CID-AT-FAM-2026-001)
Área criada com status `preparacao_pendente` e autorização de pesquisa pendente. Nenhuma pessoa, relação, evento, linhagem ou evidência inventada; nenhuma pesquisa externa; nada publicado no App Cliente; bloqueios de formalização, onboarding, contrato e financeiro intocados.

## Testes
`src/lib/__tests__/pesquisa-cadeia.test.ts`: listas fechadas, ordem da cadeia, gatilhos internos por estado (sem envio/publicação), evidência validada não vira conclusão jurídica, relatório não publicado invisível ao cliente, arquivamento exige motivo e nenhuma aba principal nova.
