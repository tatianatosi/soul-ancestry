# L02 — Mapa de listas: fonte, função e consumidor

Data: 18/10/2026. Ambiente: checkout local Lovable, sessão autenticada da Proprietária.
Escopo: `/biblioteca`, `/crm-mestre`, `/governanca/dicionario-calls-crm`. Somente leitura + enriquecimento visual dos cartões da Biblioteca. Nenhuma rota nova, nenhum writer executado, nada publicado.

## 1. /biblioteca — Biblioteca Mestre

| Subárea | Fonte (tabela) | Função | Consumidor | Efeito do uso |
|---|---|---|---|---|
| Acervo | master_library_items | Modelos internos, guias e materiais aprovados, com ciclo de vigência auditado | Caso 360 (cadeia do caso) e Formalização (contrato e proposta) | Só item vigente entra em seletor de nova utilização; substituído/suspenso/arquivado segue legível |
| Bases Genealógicas | genealogical_sources_catalog | Catálogo de repositórios, cartórios, acervos e coleções por país | /fontes-genealogicas (edição completa) e Pesquisa e Evidências do caso | Pesquisa consulta a base como referência; consulta externa exige autorização registrada |
| Dicionários | controlled_taxonomies | Taxonomias controladas (tipo de fonte, documento, evidência, relação, evento, estados) | Pesquisa e Evidências do caso (listas de seleção) | Termo fora do dicionário ativo não pode ser gravado como valor canônico |
| Trilhas de pesquisa | citizenship_tracks | Vias preliminares por país, com requisitos, documentos e riscos | Painel de Calls (triagem) e Validação Jurídica do Caso 360 | Trilha homologada vira referência de triagem; nunca vira parecer ao cliente |
| Regras jurídicas versionadas | versioned_legal_rules | Base normativa citável, versionada e datada | Referências normativas da pesquisa e Validação Jurídica do Caso 360 | Regra só é citável se aprovada, vigente e não arquivada; sem conclusão automática |
| Governança | master_library_items (categoria) | Decisões, políticas, retenção, LGPD, nomenclaturas | Governança do Desk e Manifesto de Resgate (seção da página) | Decisão registrada é imutável; correção entra como nova decisão |
| Modelos F1/F2 | master_library_items (categoria modelo) | Templates de relatório de fase com versões aprovadas | Relatórios de fase do caso | Relatório publicado aponta para versão aprovada de modelo |
| Catálogo Top 30 | product_catalog | Catálogo interno homologado com escopo, condição e preço vigente | Proposta e Formalização (seleção de elegíveis) | Só item homologado, elegível e vigente entra em proposta; nunca exposto ao App Cliente |
| Mapas operacionais | master_library_items (categoria) | Fluxos, gates, checklists e playbooks | Operação do Desk (referência de processo) | Divergência entre mapa e execução abre pendência de governança |
| Arquivo histórico | itens arquivados de todas as fontes | Legado preservado com motivo e data | Consulta histórica interna | Sem exclusão física; item arquivado sai de qualquer seletor |

Contadores reais lidos na sessão (18/10/2026): Acervo 1 · Bases 23 · Dicionários 61 · Trilhas 21 · Modelos 2 · Referências (regras jurídicas) 20. Top 30 segue fora da face operacional (`naFace: false`).

## 2. /crm-mestre — Dicionário CA04 (somente leitura)

| Lista | Fonte | Função | Consumidor |
|---|---|---|---|
| Fontes de verdade | src/lib/ca04-crm-mestre.ts (FONTES_VERDADE_CA04) | Declara camadas e o que cada uma não é | Referência humana da operação comercial |
| Eixo Comercial | EIXO_COMERCIAL_TRANSICOES | Máquina de estados do lead | /calls e /leads (referência; não grava) |
| Eixo Formalização/Operação | EIXO_FORMALIZACAO_TRANSICOES | Máquina de estados pós-conversão | /calls e /leads (referência) |
| Roteiro Discovery v2 | ROTEIRO_DISCOVERY_V2 | Passos da conversa de descoberta | Mesa de Discovery em /calls |
| Brief de Discovery | BRIEF_DISCOVERY | Campos por pessoa, origem e retorno ao CRM | Mesa de Discovery |
| Matriz de handoff | MATRIZ_HANDOFF_CA04 + BLOQUEIOS_EXEMPLARES_HANDOFF | O que cada etapa recebe, cria e bloqueia | Handoff lead → caso |
| Campos proibidos ao cliente | CAMPOS_PROIBIDOS_CLIENTE_CA04 | Sanitização: o que nunca vai ao App | Todas as projeções cliente-facing |
| Listas controladas v1.1 | LISTAS_BASE_CA04 | Valores canônicos dos campos do CRM | /calls e /leads (validação humana) |
| Decisões humanas pendentes | DECISOES_PENDENTES_CA04 | 13 decisões que dependem da Proprietária | Governança |

Nenhuma lista do CA04 persiste: é biblioteca pura, somente leitura. A operação vive em /calls e /leads, na mesma tabela de leads.

## 3. /governanca/dicionario-calls-crm — Dicionário de validações + Glossário

| Lista | Fonte | Função | Consumidor |
|---|---|---|---|
| Princípios de governança | src/lib/dicionario-calls-crm.ts (PRINCIPIOS_GOVERNANCA_CALLS) | Regras vivas do Painel de Calls | /calls |
| Campos e critérios de validação | CAMPOS_DICIONARIO_CALLS | Campo, tipo, obrigatoriedade, lista controlada, regra | /calls e /leads |
| Listas controladas | LISTAS_BASE_CALLS / LISTAS_DICIONARIO_CALLS | Valores permitidos por campo | Validação da ficha do lead |
| Mapeamento do painel | MAPEAMENTO_PAINEL_CALLS | Onde cada campo aparece no painel | /calls |
| Formatação condicional | FORMATACAO_CONDICIONAL_CALLS | Cores/estados de leitura | /calls |
| Critérios de aceite | CRITERIOS_ACEITE_CALLS | Quando o lead está apto a avançar | /calls e /leads |
| Glossário oficial | src/lib/glossario-oficial.ts (VOCABULARIO_OFICIAL, TERMOS_BLOQUEADOS/PERMITIDOS_CLIENTE, SUBSTITUICOES_OBRIGATORIAS) | Terminologia oficial cliente-facing | Todas as superfícies com texto ao cliente |
| Checklists D06/D07/D11 | CHECKLIST_VALIDACAO_TERMINOLOGICA, D06_CRITERIO_ELEVACAO, D07_CHECKLIST_PDF, D11_GLOSSARIO_FINAL | Validação terminológica e elevação | Revisão humana de conteúdo |

## 4. O que mudou no produto (L02 aplicado)

- `src/lib/biblioteca-mestre.ts`: novo `MAPA_CONSUMO_SUBAREAS` (conteúdo, consumidor, efeito por subárea) + helper `consumoSubarea`. Declaração de leitura; não move dado.
- `src/routes/_authenticated/biblioteca.tsx`:
  - Cada cartão de entrada passa a mostrar: o que contém (descrição), contador real, "Quem usa" e "Efeito".
  - Nova tabela "Fonte → consumidor" dentro da gestão da Biblioteca, com rótulo humano da fonte e detalhe técnico recolhido.
- Nenhuma rota nova, nenhum writer novo, nenhuma mudança de dados, RLS ou publicação.

## 5. Verificação

- Typecheck (tsgo): limpo. Build: OK (17:10 UTC).
- Capturas autenticadas: antes/depois em 1280 e 375 px — cartões e tabela fonte→consumidor.
- 375 px: uma coluna, sem overflow horizontal de página; tabelas longas rolham dentro do próprio contêiner (padrão já usado no Centro de Inteligência).

## 6. Fora de escopo / pendências

- Catálogo Top 30 continua oculto da face operacional (decisão anterior); aparece só na tabela fonte→consumidor.
- Escolha de subárea não persiste após recarregar (estado local) — complemento de L01 ainda não aprovado.
- Jornada viva da Ana (lead → contrato, somente leitura, comparada à prancha V4): registrada no roadmap, próxima entrega.
