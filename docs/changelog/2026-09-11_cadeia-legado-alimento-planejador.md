# 2026-09-11 — Cadeia Legado → Alimento → Planejador → Caso 360

## Correção

- Planilha Mestre = legado inventariado (nunca runtime).
- Lista-alimento: `planner_catalog_feed` + `price_catalog_rescued`.
- Preço operacional: `product_catalog` / exceção comercial (`preco-canonico` + `precos-sku` alinhados).
- CRM Vivo / Painel = projeção do Caso 360.

## Arquivos

- `src/lib/cadeia-catalogo-planejador.ts`
- `src/lib/precos-resgatados-matriz.ts`
- `src/lib/precos-sku.ts` (drift corrigido)
- `src/lib/perfil-institucional.ts`
- `src/lib/sistema-operacional-dia.ts` (radar jurídico + higiene preço)
- Testes: `cadeia-catalogo-planejador.test.ts`

## Não executado

Migration nova, homologação de preço, cobrança, WhatsApp, App expandido, `research_base` / `legal_gate`.
