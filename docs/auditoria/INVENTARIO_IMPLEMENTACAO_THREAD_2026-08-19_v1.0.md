# Inventário de Implementação por Thread — 2026-08-19 v1.0

**Finalidade:** transformar a sequência de alterações implementadas em unidades auditáveis de documentação, teste e operação.

## Threads identificadas

| Thread | Alterações observadas | Evidências de commit | Situação | Documentos vinculados |
|---|---|---|---|---|
| T-ACESSO | Restrição/nota de login e correção de UUID | `c9b31ce6`, `81fd9335` | Implementada; documentação pendente | Governança, app/acesso, dados |
| T-PAIS-CATALOGO | Coerência país/canônico; pré-carga e SKU/partes da Áustria | `22dfd69d`, `3de2e018`, `321d15f7` | Implementada parcialmente; validar modelo | Catálogo, jornada, dados |
| T-CONTRATO | Correção P0 do motor contratual | `ff590b46` | Implementada; revisão P0 obrigatória | Contratos/comercial |
| T-FAMILIA | Ficha familiar no app e estrutura familiar no CRM | `7d8c96de`, `457c5ace`, `e2e82b33` | Implementada; schema e permissões pendentes | Operação, produto e dados |
| T-PROPOSTA | Proposta arquivada e pré-carga via proposta corrigidas | `65071568`, `c56dd8ec` | Implementada; regras de precedência pendentes | Comercial, onboarding e dados |
| T-DESPESAS | Regra de despesas implementada | `a24aba9b`, `dc2bff1e` | Implementada; política e modelo de dados pendentes | Contrato, operação e dados |
| T-CANVA | Atualização de proposta no Canva | `f11cd74b` | Implementada; identificação do design pendente | Propostas e marca |
| T-UI-TESTES | UI e testes adicionados | `02ba9fa9` | Implementada; cobertura e critérios pendentes | Produto/app |

## Metadados mínimos por thread

Cada thread deve registrar: objetivo; decisões; commits; arquivos afetados; migrations; dados impactados; riscos; testes; documentação; owner; estado de validação; dependências e reversão.

## Achado de governança

Há alta incidência de commits chamados “Changes” e “Work in progress”. Eles preservam cronologia técnica, mas não são suficientes para explicitar decisão, finalidade, impacto ou condição de uso. As threads acima devem consolidar essas sequências em documentação de domínio.

## Próxima iteração

1. Inspecionar diffs e arquivos de cada commit de referência.
2. Anotar campos, tabelas, componentes, políticas e cenários afetados.
3. Ligar cada thread a ADR ou especificação funcional.
4. Atualizar este inventário para v1.1 com o resultado da inspeção.
