# Adendo — Enterprise PRD vs memória permanente / core (2026-09-11)

- Status: vigente
- Fonte arquivada: [`CLUBE_ANCESTRAL_ENTERPRISE_PRD.md`](./CLUBE_ANCESTRAL_ENTERPRISE_PRD.md) (v0.1, 18/08/2026)
- Norma que **prevalece** em conflito: `MEMORIA-PERMANENTE…`, `AGENTS.md`, `.cursor/rules/clube-ancestral-core.mdc`, planejador ativo

## O que o PRD ainda manda (alinhavado ao core)

| Tema PRD | Como aplicar hoje |
|---|---|
| App Cliente isolado (sem notas internas, sem segredos) | RLS + `portal_*` / projeções sanitizadas; nav **7 abas** |
| Desk operacional com caso, próxima ação, auditoria | `crm_casos`, RPC `proxima_acao_*`, `audit_logs` |
| Segredos só no servidor | `.env.example` só URL + publishable; sem `service_role` |
| Canva = proposta/layout | Formalização puxa Canva; SKU Lovable não é oferta |
| Efeito externo com aprovação humana | Gates + override auditado da proprietária |
| Site vs app | Site SEO `clubeancestral.com.br` **separado** do Vercel app (`ADENDO-MARCA-SITE-SEO`) |

## O que o PRD **não** autoriza mais (supersedido)

| Trecho PRD | Motivo |
|---|---|
| Planilha Mestre como fonte de SKU/preço | Legado — catálogo/`product_catalog` + **produtos-pai** do planejador |
| SQL de `client_accounts` / enums novos / schema paralelo | Inventar tabela — usar `clientes`, `crm_casos`, etc. |
| Dois projetos Vercel App/Desk obrigatórios agora | Monorepo atual; split só com decisão nova (não liga domínio SEO ao app) |
| Rotas App `/jornada` etc. fora do portal canônico | App Cliente = `/portal` + 7 abas mockup |
| Asaas legado como operação | Eventos financeiros atuais ≠ reconciliação antiga |

## Execução desta rodada (Trilha A / P0 saneado)

1. PRD copiado para `docs/politicas/` e apontado no core / MEMORIA / AGENTS.
2. `portal-navegacao.ts`: 7 abas canônicas explícitas; Entregas/Fase 01/02 = rotas profundas, não nav.
3. Inventário: este adendo (não recriar monorepo nem migrations do blueprint SQL).

## Próximas fatias do PRD (só se caberem no schema real)

- Views sanitizadas / prova RLS A×B autenticada
- Alertas de prazo a partir do planejador (sem Cockpit paralelo)
- Contratos/Canva já em curso — aprofundar, não duplicar
