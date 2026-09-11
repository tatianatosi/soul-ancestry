# Cadeia legado → planejador → Caso 360 → App → WhatsApp

**Status:** vigente  
**Data:** 2026-09-11  
**Responsável:** Proprietária do Clube Ancestral  
**Escopo:** uma única cadeia de dado. Sem tabela nova. Sem Planilha Mestre como motor.

```text
LEGADO (Planilha Mestre, planilhas e arquivos históricos)
          ↓ leitura, inventário e migração única
LISTA-ALIMENTO VERSIONADA (planner_catalog_feed)
          ↓
CATÁLOGO OPERACIONAL DO PLANEJADOR (product_catalog)
          ↓
CASO 360 = produto-pai + fase + trilha(s) + itens + condição particular
          ↓
DESK produz/valida/libera → APP mostra valor autorizado → WhatsApp comunica
```

## Onde isso mora hoje

| Camada | Tabela já existente |
|---|---|
| Legado | `legacy_record_links` (rastreio). Planilha não é fonte viva. |
| Lista-alimento | `planner_catalog_feed`, `price_catalog_rescued` |
| Catálogo do planejador | `product_catalog` |
| Caso 360 | `crm_casos` + `case_plans` + `case_services` + `citizenship_tracks` |
| Liberação Desk → App | `app_projections`, `client_deliverables` |
| WhatsApp | `communication_queue` (fila humana; nada sai sozinho) |

## O que isto impede

- Planilha Mestre, Top 30 ou arquivo histórico dirigindo preço, fase, próxima ação ou o que o App mostra.
- WhatsApp ou o App mostrando valor que o Desk ainda não validou e liberou.
- Uma segunda composição do caso fora do planejador.
