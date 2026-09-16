# Design System — Clube Ancestral

**Versão:** Corte 1 (2026-09-16) · **Escopo:** somente tokens e documentação.
**Projeto canônico:** `tatianatosi/soul-ancestry`. Lançamento: Lovable.

## O que o Corte 1 faz

- Cria `src/styles/tokens-clube-ancestral.css` como **fonte única** de valores
  aprovados (cor, tipografia, escala, espaçamento, raio, borda, sombra,
  breakpoints, área segura).
- Faz `src/styles.css` importar esse arquivo.
- Documenta tokens, componentes duplicados e regras de uso.

## O que o Corte 1 NÃO faz

- Não migra telas, não altera aparência, não renomeia classes.
- Não apaga nenhum arquivo ou componente existente.
- Não cria novas versões de Cartão, Selo, KPI, Vazio, Tabela, Gráfico ou Timeline.
- Não toca em dados, RLS, migrations, acessos, contratos, publicações ou deploy.

## Três autoridades de cor — plano de convergência

| Arquivo | Papel hoje | Papel após migração |
| --- | --- | --- |
| `src/styles/tokens-clube-ancestral.css` | novo | **fonte canônica única** |
| `src/styles.css` | tokens Tailwind/shadcn (`--navy`, `--gold`, …) | mapeia para `--ca-*` |
| `src/lib/marca.ts` | valores literais para e-mail/PDF/SVG | permanece, espelhando os mesmos hex, documentado como saída não-CSS |
| `src/components/clube-ancestral-kit/tokens.css` | `--ca-*` locais em `[data-clube-ancestral-kit]` | passa a herdar de `:root` |

Sequência segura (um corte por vez, com screenshot antes/depois e F5):

1. **Corte 1 (este):** criar tokens + docs + import. Zero mudança visual.
2. **Corte 2:** `clube-ancestral-kit/tokens.css` deixa de redeclarar hex e
   referencia `var(--ca-navy)` etc. Piloto visual: **Pesquisa do Desk**.
3. **Corte 3:** `src/styles.css` (`:root` e `[data-marca="guia"]`) passa a
   `--navy: var(--ca-navy)` etc., eliminando a duplicação de hex.
4. **Corte 4:** consolidação de componentes (ver `componentes.md`).
5. **Corte 5:** varredura de cores literais em telas (cadência, gráficos, fichas).
6. **Corte 6:** legados de e-mail/PDF avaliados separadamente.

Nenhum corte avança sem aprovação explícita da Proprietária.

## Documentos

- [`tokens.md`](./tokens.md) — tabela aprovado × atual × legado.
- [`componentes.md`](./componentes.md) — catálogo e cópias a consolidar.
- [`regras-de-uso.md`](./regras-de-uso.md) — regras fixas e anti-padrões.

## Design System Enterprise

Não existe registro Enterprise ativo. A fonte de verdade é este repositório
(`src/styles/tokens-clube-ancestral.css` + `docs/design-system/`) mais o
Project Knowledge. Caso a Proprietária aprove um registro externo depois,
ele deve **importar** destes arquivos, nunca ser uma segunda autoridade.
