# Prints — Cano / Jornada com produto (2026-09-11)

**Caso:** `CA-CID-AT-FAM-2026-001` — Projeto familiar — Ana Luiza (fixture)  
**Produto:** `CA-HIST-005` — Pesquisa de Base Familiar  
**Produto-pai:** História de Família, Memória e Legado  
**Preview:** branch `cursor/circuito-abas-mesa-kpis-efd3` (commit do cano)  
**Quem capturou:** agente autenticado no Desk (evidência de agente — não certifica `COMPROVADO_EM_USO`)

## Sequência

| # | Arquivo | O que mostra |
|---|---|---|
| 01 | `01_caso360_topo.png` | Caso 360 aberto (topo + próxima ação) |
| 02 | `02_jornada_inicio.png` | Aba **Jornada** — card Cano + início do planejador |
| 03 | `03_cano_operacional.png` | Cano com 7 elos (lista-alimento/SKU/produto-pai **ok**; Desk libera parcial; App ausente) |
| 04 | `04_planejador.png` | Planejador do caso na mesma aba |
| 05 | `05_produto_trilha.png` | Produto **CA-HIST-005** + trilha Áustria selecionados |
| 07 | `07_catalogo.png` | Catálogo homologado (elo lista-alimento / preço) |

## Como repetir (proprietária)

1. Abrir Caso Ana → índice **Jornada** (não só o hash `#secao-jornada` — precisa do clique no índice para `setSecaoFoco`).
2. Conferir Cano + produto + planejador.
3. F5 após qualquer gravação se for certificar persistência.

## Dado preparado para o print

No fixture Ana, o `case_services` recebeu `product_catalog_id` de `CA-HIST-005` e o `case_plans` ficou amarrado (fase `aceite_e_formalizacao`). Reversível: é caso de teste.
