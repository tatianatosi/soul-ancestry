# Planejador Universal Multipaís v2.1 — execução 2026-09-11

```text
LEGADO (Planilha Mestre / OPS / 91 SKUs / PACOTE-*)
        ↓ inventário único (nunca runtime)
planner_catalog_feed + price_catalog_rescued
        ↓
catálogo operacional do Planejador (produtos-pai + fase + trilha)
        ↓
Caso 360 (case_plans + citizenship_tracks + commercial_conditions)
        ↓
Desk produz/valida/libera → App sanitizado → WhatsApp só liberado
```

## Entregas desta fatia

| Entrega | Evidência | Estado |
|---|---|---|
| Matriz preços resgatados expandida (país + despesas/taxas/parcelas + itens IT/DE/AT/ASS/WPP/FAM) | `src/lib/precos-resgatados-matriz.ts` | LEITURA_DERIVADA |
| Divergências IT/PT + Ana Luiza 9600 isolada | `PRECOS_DIVERGENTES_SPEC` + `PRECO_ANA_LUIZA_AT` | OPERACIONAL (regra) |
| HU/LU/IE + specs HR/PT/ES/PL/RO/AT-002/003/NAT + CA-GEN-MULTI-001..006 sem valor | `PRECOS_PENDENTES_HOMOLOGACAO` | PENDENTE_DE_HOMOLOGACAO |
| Dicionário/saneamento dos 91 SKUs + pré-lista + aliases PACOTE | `src/lib/dicionario-skus-91.ts` | LEITURA_DERIVADA |
| Regras multipaís / gates / Canva (puro) | `src/lib/planejador-universal-multipais.ts` | OPERACIONAL (regra) |
| Testes cenários Ana/João/Danilo/multipaís/curso/Canva | `src/lib/__tests__/planejador-universal-multipais.test.ts` | PASSOU (vitest) |

## De–para prompt → schema real (não inventar)

| Prompt | Real |
|---|---|
| lista-alimento | `planner_catalog_feed` |
| preços resgatados | `price_catalog_rescued` |
| catálogo vivo | `product_catalog` |
| planejador / caso | `case_plans` |
| trilha | `citizenship_tracks` |
| condição comercial | `commercial_conditions` |
| research_base / family_branch / legal_gate | `GAPS_SCHEMA_PENDENTES` — PENDENTE_DE_DECISAO_PROPRIETARIA |

## Estados de preço (só homologado expõe)

`REFERENCIA_RESGATADA` · `CONDICAO_PARTICULAR_DE_CASO` · `HOMOLOGADO_CATALOGO` · `PENDENTE_DE_HOMOLOGACAO` · `DIVERGENTE` · `ARQUIVADO`

Somente `HOMOLOGADO_CATALOGO` pode aparecer em oferta/link. Nenhum valor desta fatia foi homologado.

## Fila de divergências

| Escopo | Valores | Status |
|---|---|---|
| Itália honorários | 4500 / 4700 / 4800 | `DIVERGENTE` |
| Portugal honorários | 3800 / 4400 / 4800 | `DIVERGENTE` |
| Áustria Ana Luiza | 9600 vs ref 4800 | `CONDICAO_PARTICULAR_DE_CASO` |
| HU / LU / IE | sem número | `PENDENTE_DE_HOMOLOGACAO` |

## Proibições respeitadas

- Planilha Mestre fora de runtime
- Sem migration de schema novo
- Sem homologar preço, criar link Asaas, enviar proposta, alterar dado vivo
- `CA-CURSO-001` fora de recomendação comercial
- PACOTE-* só como alias legado

## Prova autenticada

Registro vivo: `docs/relatorios/2026-09-11_registro-prova-autenticada.md`  
Esta fatia **não** é `COMPROVADO_EM_USO` — falta prova da proprietária (inicial/ação/confirmação/releitura/integração).
