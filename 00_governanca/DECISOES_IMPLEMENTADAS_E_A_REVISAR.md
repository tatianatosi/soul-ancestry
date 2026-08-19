# Decisões Implementadas e a Revisar

**Atualização:** 2026-08-19

## Finalidade

Painel de governança para distinguir o que já existe no produto do que ainda depende de documentação, teste, regra operacional ou validação humana. “Implementada” não significa automaticamente “homologada para todos os casos”.

## Implementadas, com documentação incompleta

| Prioridade | Decisão | Domínio | Evidência | Falta documentar |
|---|---|---|---|---|
| P0 | Correção do motor contratual | Contratos/comercial | `ff590b46` | Regra corrigida, impacto, teste de regressão e exceções. |
| P0 | Regra de despesas | Comercial/contrato/financeiro | `a24aba9b`, `dc2bff1e` | Matriz de despesa, aprovação, exibição e responsabilidade. |
| P0 | Pré-carga por proposta | Comercial/onboarding/dados | `c56dd8ec` | Fonte, precedência, campos autorizados, bloqueios e rollback. |
| P1 | Ficha e estrutura familiar | CRM/app/dados | `7d8c96de`, `457c5ace`, `e2e82b33` | Schema, permissões, relação caso-pessoa-família e ciclo de vida. |
| P1 | Coerência país/canônico | Dados/catálogo/app | `22dfd69d` | Regras por país, normalização e exceções. |
| P1 | Jornada austríaca e pré-carga | Dados/proposta/jornada | `3de2e018`, `321d15f7` | Catálogo, componentes, conteúdo e validação humana. |
| P1 | Login e UUID | Acesso/dados | `c9b31ce6`, `81fd9335` | Política de acesso, mensagens de erro e cenários de teste. |
| P2 | Atualização de proposta Canva | Comercial/design | `f11cd74b` | Identificador do design, versão, campos e aprovação comercial. |

## Decisões que não podem ser inferidas

- Preço vigente, desconto, link Asaas ou condição de pagamento.
- Elegibilidade, rota jurídica, prazo ou garantia de cidadania/documento.
- Escopo comercial final por país apenas porque um dado foi pré-carregado.
- Permissões ou compartilhamento de dados familiares sem regra explícita e revisão de privacidade.

## Protocolo de documentação retroativa

Cada decisão deve ganhar um registro contendo: problema; regra anterior; regra implementada; arquivos/migrations/componentes afetados; commit(s); impacto operacional; dados pessoais envolvidos; testes; risco; responsável por validação; status; e data da próxima revisão.

## Critério de encerramento

Uma linha só sai desta lista quando possuir documentação funcional, evidência técnica, cenário de teste e responsável de validação definidos.
