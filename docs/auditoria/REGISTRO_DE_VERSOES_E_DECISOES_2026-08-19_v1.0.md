# Registro de Versões e Decisões — 2026-08-19 v1.0

**Finalidade:** registrar a evolução verificável do projeto no GitHub e separar fatos implementados de hipóteses, documentação legada ou decisões ainda pendentes. Este documento é o ponto de partida para a migração futura do Lovable para uma base reprodutível em GitHub, Supabase e ambiente de deploy independente.

## Regra de evidência

- Uma decisão só é marcada como implementada quando há evidência no repositório: commit, migration, rota, componente, integração, teste ou configuração.
- Um commit com mensagem genérica (“Changes” ou “Work in progress”) preserva cronologia, mas não basta sozinho para definir a regra funcional.
- Preço, Asaas, contrato vigente, elegibilidade, rota jurídica, prazo e escopo comercial continuam sujeitos à fonte aprovada e à validação humana.

## Versão documental de referência

| Versão | Data | Commit | Escopo | Estado |
|---|---|---|---|---|
| 1.0 | 2026-08-19 | `44e23711cacd34b2b77dab1e4cb8338276950779` | Sincronização mestre, decisões a revisar, mapas de operação, arquitetura SKU, matriz de integração e inventários de auditoria. | Registrada no GitHub. |

O commit de referência adicionou sete documentos e 279 linhas de documentação.

## Linha de decisões recuperadas

| ID | Data | Decisão/alteração observada | Evidência inicial | Domínios afetados | Situação documental |
|---|---|---|---|---|---|
| DEC-20260817-PAIS-CANONICO | 2026-08-17 | Correção de coerência entre país e referência canônica. | `22dfd69d` | Caso, catálogo, app, proposta e dados. | Requer inspeção de campos e regras. |
| DEC-20260817-AUSTRIA-PRECARGA | 2026-08-17 | Correções de pré-carga e inclusão de SKU/partes para Áustria. | `3de2e018`, `321d15f7` | Dados, proposta, catálogo e jornada. | Requer separação entre dado de referência, SKU e componente. |
| DEC-20260817-ACESSO | 2026-08-17 | Restrição/nota de login e correção de validação UUID. | `c9b31ce6`, `81fd9335` | Acesso, autenticação e dados. | Requer política e cenários de teste. |
| DEC-20260818-CONTRATO-P0 | 2026-08-18 | Correção P0 no motor contratual. | `ff590b46` | Contrato, proposta, dados e operação. | Requer explicação da regra e regressão. |
| DEC-20260818-FAMILIA | 2026-08-18 | Ficha familiar no app e estrutura familiar no CRM. | `7d8c96de`, `457c5ace`, `e2e82b33` | CRM, app, família, onboarding e dados. | Requer schema, RLS/permissões e ciclo de vida. |
| DEC-20260818-PROPOSTA-PRECARGA | 2026-08-18 | Correção de proposta arquivada e pré-carga via proposta. | `65071568`, `c56dd8ec` | Proposta, onboarding, dados e comercial. | Requer precedência, idempotência e rollback. |
| DEC-20260818-DESPESAS | 2026-08-18 | Implementação de regra de despesas. | `a24aba9b`, `dc2bff1e` | Contrato, financeiro, proposta e operação. | Requer modelo, aprovação e exibição. |
| DEC-20260819-CANVA | 2026-08-19 | Atualização de proposta no Canva. | `f11cd74b` | Proposta e design comercial. | Requer identificação do design e versão aprovada. |

## Decisões de arquitetura confirmadas no repositório

| Tema | Evidência de estrutura | Conclusão limitada e verificável |
|---|---|---|
| Aplicação web | `src/router.tsx`, `src/routes/`, `src/components/` | Existe aplicação com roteamento e módulos de interface versionados. |
| Autenticação e acesso | Rotas `acesso.*`, `auth.tsx`, `equipe.*`, cliente Supabase e middleware | Há camada de acesso/autenticação implementada, cuja política detalhada ainda deve ser extraída do código. |
| Desk operacional | `desk-app.tsx`, `desk-crm.tsx`, `desk-go-live.tsx` e rotas autenticadas | Há implementação de Desk, CRM e Go-live no repositório. |
| Contratos | Rotas de contratos, parâmetros e preparação; componentes contratuais | Há motor e telas de contrato versionados; regra P0 precisa de especificação retroativa. |
| Propostas e comercial | Rota `propostas.tsx`, dados de propostas e componentes comerciais | Há fluxo de proposta no código; vigência comercial não é inferida pela existência técnica. |
| Dados e Supabase | `supabase/migrations/` e `src/integrations/supabase/` | Banco e integração Supabase são parte da base técnica versionada. |
| Cliente e entregas | `cliente-app.tsx`, `entrega-consultiva.tsx`, relatórios e Canvas | Há experiência de cliente, entrega consultiva e devolutivas implementadas. |

## Convenção futura de versão

- Documento novo: `v1.0`.
- Alteração incremental sem mudança de finalidade: `v1.1`, `v1.2` etc.
- Mudança de finalidade, modelo ou regra de negócio: nova versão principal e ADR vinculada.
- Todo documento deve indicar data, fonte de evidência, escopo, status e próxima revisão.

## Backlog documental derivado

1. Inventário de schema, migrations, funções e RLS.
2. Especificação de família, proposta, pré-carga, despesas e contrato.
3. Contrato de dados entre app, Desk, proposta, Asaas e Supabase.
4. Mapa de componentes e rotas para substituição gradual do Lovable.
5. Matriz de testes de regressão por thread.
