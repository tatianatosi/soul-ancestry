# CA-UX-03 — Adendo v1.0: Assistente transversal do Desk Intelligence

**Data:** 23/08/2026 · **Estado:** implementado (regra arquitetural obrigatória)

## Decisão

O Assistente IA é capacidade transversal do Desk, disponível nos 8 grupos conforme
contexto e permissão. Não cria nona aba, não cria segunda fonte de verdade e não
concede permissão adicional.

## Implementação

| Peça | Arquivo |
|---|---|
| Regras por grupo, visibilidade, contexto e confirmação de caso | `src/lib/assistente-transversal.ts` |
| Ponto de entrada persistente (botão + painel lateral) | `src/components/desk/assistente-transversal.tsx` |
| Montagem única na casca do Desk | `src/components/saas/shell.tsx` |
| Motor de análise por caso (reutilizado) | `src/components/pesquisa/assistente.tsx` + `/api/pesquisa-assistente` |
| Testes | `src/lib/__tests__/assistente-transversal.test.ts` (11 casos) |

O grupo é derivado do registro canônico `GRUPOS_DESK` por prefixo de rota mais longo —
não há segundo mapa de navegação.

## Guardas verificadas por teste

1. Presença nos 8 grupos apenas para papéis autorizados (`REGRAS_ASSISTENTE.papeis`).
2. Nunca renderiza fora da superfície interna nem em `/portal*`/`/acesso*`.
3. Análise por caso exige confirmação explícita de `case_id`.
4. Mudança de URL descarta a confirmação: nenhum caso é trocado silenciosamente.
5. Bloqueio por dados insuficientes registra apenas `analysis_blocked_insufficient_case_data`.
6. Selo `DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO` preservado.
7. Sem caso confirmado, o Assistente atua só como orientador de navegação.
8. Atalhos abrem rotas existentes; nenhuma execução automática, envio externo ou
   elevação de permissão.
