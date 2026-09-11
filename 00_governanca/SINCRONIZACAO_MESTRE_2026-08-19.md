# Sincronização Mestre — 2026-08-19

**Status:** trilha histórica (commits 17–19/08). **Sync ativa:** [`SINCRONIZACAO_MESTRE_2026-09-11.md`](./SINCRONIZACAO_MESTRE_2026-09-11.md) — inclui nav 7+6, SKU legado (PR #97), Asaas bloqueado até automações, microentregas na jornada.

## Objetivo

Consolidar decisões implementadas no aplicativo, CRM, proposta, contrato e dados que estavam dispersas em commits, conversas e mudanças do Lovable, mas sem documentação funcional equivalente. Este documento não substitui código, migrations, contratos vigentes nem decisão humana sobre preço, elegibilidade ou escopo.

## Fonte de evidência

- Repositório `tatianatosi/soul-ancestry`, commits de 17 a 19 de agosto de 2026.
- Histórico operacional e memória do projeto.
- Estado efetivamente implementado tem precedência sobre auditorias antigas quando houver conflito, desde que a implementação seja identificada e validada.

## Decisões recuperadas

| ID | Decisão implementada | Evidência técnica inicial | Impacto | Estado documental | Ação de fechamento |
|---|---|---|---|---|---|
| DEC-20260817-PAIS-CANONICO | Correção de coerência entre país e referência canônica do caso/produto. | Commit `22dfd69d` — “Corrigiu coerência país/canônico”. | App, dados de caso, jornada e proposta. | A documentar em detalhe. | Mapear campos, regras e exceções. |
| DEC-20260817-AUSTRIA-PRECARGA | Pré-carga e SKU/partes relacionados à jornada austríaca foram corrigidos e inseridos. | Commits `3de2e018` e `321d15f7`. | Catálogo interno, proposta, dados e jornada por país. | A documentar em detalhe. | Diferenciar SKU efetivo, componente interno e conteúdo de pré-carga. |
| DEC-20260817-ACESSO | Nota/restrição de login foi adicionada e a validação de UUID foi corrigida. | Commits `c9b31ce6` e `81fd9335`. | Autenticação, segurança e consistência de dados. | A documentar em detalhe. | Registrar regra, perfis afetados e cenários de erro. |
| DEC-20260818-CONTRATO-P0 | Motor contratual recebeu correção classificada como P0. | Commit `ff590b46`. | Contrato, escopo, dados de proposta e fluxo operacional. | A documentar em detalhe. | Registrar defeito, correção, regra vigente e teste de regressão. |
| DEC-20260818-FICHA-FAMILIAR | Ficha familiar foi integrada ao app e uma estrutura familiar foi criada no CRM. | Commits `7d8c96de`, `457c5ace` e `e2e82b33`. | CRM, app, grupo familiar, proposta e pré-carga. | A documentar em detalhe. | Publicar schema funcional, permissões e ciclo de vida de vínculos familiares. |
| DEC-20260818-PROPOSTA-PRECARGA | Pré-carga via proposta foi corrigida; proposta arquivada teve ajuste. | Commits `c56dd8ec` e `65071568`. | Comercial, onboarding, dados do caso e app. | A documentar em detalhe. | Definir campos autorizados, precedência e regras de arquivamento. |
| DEC-20260818-DESPESAS | Regra de despesas foi aplicada/implementada. | Commits `a24aba9b` e `dc2bff1e`. | Contrato, proposta, operação e financeiro. | A documentar em detalhe. | Documentar categorias, responsabilidade, aprovação e exibição ao cliente. |
| DEC-20260819-PROPOSTA-CANVA | Proposta no Canva foi atualizada a partir do fluxo implementado. | Commit `f11cd74b`. | Comercial, proposta e identidade de entrega. | A documentar em detalhe. | Identificar design, versão e relação com dados do sistema. |

## Regra de reconciliação

1. Não reverter uma regra implementada com base apenas em auditoria ou transcrição anterior.
2. Toda documentação retroativa deve citar commit, arquivo, migration, tela ou teste que a sustente.
3. Se código e regra operacional divergirem, abrir item de decisão com impacto, risco e responsável; não presumir a intenção.
4. Preços, links de pagamento, elegibilidade, rota jurídica, prazos e escopo comercial continuam dependentes de fonte aprovada e validação humana.

## Saídas obrigatórias

- Atualizar `DECISOES_IMPLEMENTADAS_E_A_REVISAR.md`.
- Atualizar os mapas de operação, contratos e integrações deste commit.
- Criar ADR específica quando uma decisão tiver efeito transversal ou irreversível.
- Vincular cada nova implementação a commit com mensagem descritiva, evitando “Changes” como único registro semântico.
