# Cadeia canônica — execução 2026-09-11

```text
LEGADO (Planilha Mestre / OPS)
        ↓ inventário (nunca runtime)
planner_catalog_feed + price_catalog_rescued
        ↓
catálogo operacional do Planejador
        ↓
Caso 360 (case_plans + trilhas + condição)
        ↓
Desk → App sanitizado → WhatsApp (só liberado)
```

## O que esta fatia fechou

| Item | Evidência | Estado |
|---|---|---|
| Autoridade anti-Planilha-runtime | `cadeia-catalogo-planejador.ts` | OPERACIONAL |
| Drift `precos-sku` → `product_catalog` | `precos-sku.ts` + testes | OPERACIONAL |
| Matriz preços resgatados (status) | `precos-resgatados-matriz.ts` | LEITURA_DERIVADA |
| Ana Luiza 9600 isolada | fixture `CONDICAO_PARTICULAR_DE_CASO` | OPERACIONAL (regra) |
| HU/LU/IE sem valor | `PENDENTE_DE_HOMOLOGACAO` | PENDENTE_DE_DADO |
| Radar jurídico / higiene no Painel | `derivarRadarJuridicoPainel` / `derivarHigienePrecoPainel` | LEITURA_DERIVADA |
| CRM Vivo = projeção Caso 360 | copy + constante no sistema do dia | OPERACIONAL (mensagem) |

## Gaps explícitos (não inventar)

- `legal_gate`, `research_base`, `family_branch` — `PENDENTE_DE_DECISAO_PROPRIETARIA`
- Sem `HOMOLOGADO_CATALOGO` novo, sem cobrança, sem migration de schema

## Proibições

Sem deploy, dados vivos alterados, Asaas, WhatsApp, publicação App, leitura Planilha em runtime.
