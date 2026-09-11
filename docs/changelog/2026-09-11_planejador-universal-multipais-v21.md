# Changelog — Planejador Universal Multipaís v2.1 (2026-09-11)

## Adicionado

- `src/lib/dicionario-skus-91.ts` — saneamento dos 91 SKUs (status motor, pré-lista, aliases PACOTE).
- `src/lib/planejador-universal-multipais.ts` — gates de jornada, custo multipaís sem base duplicada, leitura Canva só de condição aprovada, cenários Ana/João/Danilo.
- `src/lib/__tests__/planejador-universal-multipais.test.ts` — aceite dos 8 cenários do prompt.
- `docs/relatorios/2026-09-11_planejador-universal-multipais-v21.md` — migração legado→alimento e fila de divergências.

## Alterado

- `src/lib/precos-resgatados-matriz.ts` — matriz completa país (honorários/despesas/taxas/parcelas), itens localizados, specs pendentes HU/LU/IE + GEN-MULTI.

## Não feito (de propósito)

- Homologação comercial, links, cobranças, migrations novas, tabelas inventadas (`research_base`, etc.).
