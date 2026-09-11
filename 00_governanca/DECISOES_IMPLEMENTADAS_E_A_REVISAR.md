# Decisões Implementadas e a Revisar

**Atualização:** 2026-09-11  
**Sync ativa:** [`SINCRONIZACAO_MESTRE_2026-09-11.md`](./SINCRONIZACAO_MESTRE_2026-09-11.md)

## Finalidade

Distinguir o que existe no produto do que ainda depende de documentação, fiação, teste ou validação humana. “Implementada” ≠ “homologada / comprovada em uso”.

Estados: `implementado` | `decidido` | `revisar` | `historica_superada`.

---

## Decisões âncora (2026-09-11)

| Prioridade | Decisão | Estado | Domínio | Evidência | Falta |
|---|---|---|---|---|---|
| P0 | Face Desk = **7 telas mockup** + **6 grupos internos** (não 6-face, não 8-face) | `decidido` / `revisar` | Nav Desk | `DECISAO-NAV-DESK-…-2026-09-11.md`; mockup 17 | Aplicar na PR de produto ativa; preview; certificar |
| P0 | Catálogo SKU / Planilha / conciliação **fora do menu** (PR #97 opção B) | `decidido` | Catálogo legado | PR #97; archive na branch | Merge só com ordem; `main` ainda mostra submenu Legado |
| P0 | **Link Asaas só** quando automações estiverem ativas e tudo funcionando | `decidido` (bloqueado) | Financeiro | Ordem proprietária; `prontidao-integracoes` `NAO_CONFIGURADA` | Não emitir link/checkout até gate de automação |
| P0 | Microentregas intrínsecas à jornada/onboarding → alertas do dia (App/WhatsApp/achado) | `decidido` / `revisar` fiação | Operação | `ops_microentregas`; decisão sync | Ligar alerta Hoje de ponta a ponta; prova autenticada |
| P1 | Planilha Mestre / “57 SKUs” / Asaas legado como operação | `historica_superada` | Comercial/dados | AGENTS; adendo Enterprise | Não reexpor na face |
| P1 | 8 grupos como menu principal | `historica_superada` | Nav | Decisão 2026-09-11 | Não restaurar |

---

## Implementadas, com documentação ou face incompleta

| Prioridade | Decisão | Estado | Domínio | Evidência | Falta |
|---|---|---|---|---|---|
| P0 | Correção motor contratual | `implementado` / `revisar` doc | Contratos | commit `ff590b46` | Regra, regressão, exceções |
| P0 | Regra de despesas | `implementado` / `revisar` doc | Comercial/financeiro | `a24aba9b`, `dc2bff1e` | Matriz, aprovação, exibição |
| P0 | Pré-carga por proposta | `implementado` / `revisar` doc | Comercial/onboarding | `c56dd8ec` | Precedência, campos, rollback |
| P1 | Ficha / estrutura familiar | `implementado` / `revisar` doc | CRM/app | `7d8c96de`… | Schema, RLS, ciclo de vida |
| P1 | Coerência país/canônico | `implementado` / `revisar` doc | Dados/catálogo | `22dfd69d` | Regras por país |
| P1 | Jornada Áustria / pré-carga | `implementado` parcial | Dados/proposta | `3de2e018`… | Validação humana de escopo |
| P1 | Login / UUID | `implementado` / `revisar` doc | Acesso | `c9b31ce6`… | Política e cenários |
| P1 | Planejador + próxima ação | `implementado` | Operação | `case_plans`, RPC | Prova autenticada |
| P1 | `product_catalog` + `/catalogo` | `implementado` (dado) | Formalização | types + rota | Face admin sob Biblioteca/Governança na nav 7+6 |
| P2 | Proposta Canva | `implementado` / `revisar` | Comercial | `f11cd74b` | Versão design vigente |
| P2 | Drift `precos-sku.ts` vs `preco-canonico.ts` | `revisar` | Preço | ambos em `src/lib` | Uma fonte canônica no código |

---

## Não inferir (bloqueados até decisão/fonte)

- Preço vigente, desconto, **link Asaas** ou condição de pagamento sem fonte homologada **e** sem automações ativas.
- Elegibilidade, rota jurídica, prazo ou garantia de cidadania.
- Escopo comercial final só porque houve pré-carga.
- Permissões familiares sem regra e revisão de privacidade.
- Restaurar 8 grupos ou Planilha como face/operação.

## Protocolo

Cada linha: problema; regra anterior; regra atual; arquivos/migrations; commit/PR; impacto; dados pessoais; testes; risco; responsável; status; próxima revisão.

## Encerramento

Sai da lista só com: documentação funcional + evidência técnica + cenário de teste + responsável. Arquivamento de contexto de resgate só com `COMPROVADO_EM_USO` da proprietária no registro vivo.
