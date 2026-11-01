# Design Engineering Audit: Clube Ancestral (soul-ancestry)

**Perspective**: Design Engineer
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)

## Scope Summary

TanStack Start + React 19 app with two surfaces (Desk interno V4 + App Cliente), own design-token system in `src/styles.css` (hex + `color-mix`, not oklch — deliberate project convention, not a deviation), Tailwind v4, shadcn/radix primitives in `src/components/ui`, and a canonical card component (`CaCard`) that already prevents a "third card implementation."

## Files Reviewed

| File                                                    | Visual Role                                               | Risk                                |
| ------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| `src/styles.css`                                        | Design token root (`:root`, `@theme inline`)              | Low — single source, well organized |
| `src/components/ui/button.tsx`                          | Button primitive (cva variants)                           | Low                                 |
| `src/components/ui/ca-card.tsx`                         | Canonical card (padrao/compacto)                          | Low                                 |
| `src/components/saas/estado-dados.tsx`                  | Shared loading/error/empty state wrapper                  | Low — this is the right pattern     |
| `src/components/contratos/painel-estado-contratual.tsx` | Recently religated panel (#209)                           | Low-Medium                          |
| `src/components/golive/graficos.tsx`                    | Chart colors                                              | Low                                 |
| `src/lib/marca.ts`                                      | `MARCA_CORES` token export for non-CSS consumers (charts) | Low                                 |

## Verdict: APPROVE WITH CHANGES

The design system is more disciplined than most codebases this size: one canonical card component with documented variants instead of duplicated implementations, a shared `EstadoDados` wrapper that forces every data-driven screen to handle loading/error/empty consistently, and a single token root. The main gap is structural, not cosmetic: **the app has no dark mode implementation at all** (not a bug — just worth confirming it's intentional) and interactive touch targets sit below the 44px accessibility guideline across the whole button system.

## Critical Issues (Must Fix)

None. Nothing found breaks the existing visual contract.

## Recommendations

| #   | Issue                                                                                                                                               | File(s)                                           | Why                                                                                                                                                                    | Fix                                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Default/sm button heights are `h-9` (36px) / `h-8` (32px)                                                                                           | `src/components/ui/button.tsx:19-21`              | Below the 44×44px touch-target guideline (WCAG 2.5.5, iOS HIG); this app is client-facing on mobile (App Cliente)                                                      | Raise default to `h-10`/`h-11` on touch contexts, or confirm this was a deliberate density choice already validated against mockups                                                                       |
| 2   | One raw hex (`#7D8FA6`) outside `MARCA_CORES`/token vocabulary                                                                                      | `src/components/golive/graficos.tsx:75`           | The other 3 series colors (`NAVY`, `GOLD`, `TERRA`) come from the token system; the 4th doesn't, so a future palette change misses it                                  | Add the 4th series color to `src/lib/marca.ts` alongside `MARCA_CORES` and import it                                                                                                                      |
| 3   | No dark mode token overrides (`.dark { … }`) anywhere; `@custom-variant dark` is declared but unused except one `dark:` class in a shadcn primitive | `src/styles.css:8`, `src/components/ui/alert.tsx` | If dark mode is genuinely out of scope for this product, the unused Tailwind dark-variant scaffolding is dead surface area; if it's planned, there's no foundation yet | Either remove the unused `@custom-variant dark` declaration (and the stray `dark:` class) to stop implying support that doesn't exist, or treat this as a tracked gap before any future dark-mode request |

## Nice-to-Haves

| #   | Suggestion                                                                                                   | Rationale                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1   | Consider a lint rule (stylelint or a custom script) flagging raw `#hex` in `.tsx` outside `src/lib/marca.ts` | Keeps the one drift found (finding #2) from recurring silently as more chart/export components are added |

## Design System Compliance

Strong. `CaCard`'s own doc comment explicitly rejects reimplementing a second card component and instead adds a `variante="compacto"` that reuses the approved surface tokens (`bg-card` with shadow applied via `[data-marca-guia="oki"]`) — this is exactly the right instinct and should be the model other shared components follow. `EstadoDados` centralizes the loading/error/empty contract so individual screens can't silently skip a state; that pattern alone eliminates an entire class of findings this audit would otherwise be flagging per-screen.

## Visual State Coverage

| Component/Element             | Hover | Focus                       | Active                          | Disabled | Loading            | Empty                      | Error                                                   | Dark Mode           |
| ----------------------------- | ----- | --------------------------- | ------------------------------- | -------- | ------------------ | -------------------------- | ------------------------------------------------------- | ------------------- |
| `Button` (ui primitive)       | ✅    | ✅ (`focus-visible:ring-1`) | — (no explicit `:active` style) | ✅       | n/a                | n/a                        | n/a                                                     | N/A (no dark theme) |
| `EstadoDados`-wrapped screens | n/a   | n/a                         | n/a                             | n/a      | ✅ (role="status") | ✅ (explicit `vazio` prop) | ✅ (role="alert", with `/app` vs `/desk` message split) | N/A                 |
| `PainelEstadoContratual`      | n/a   | n/a                         | n/a                             | n/a      | via `EstadoDados`  | via `EstadoDados`          | via `EstadoDados`                                       | N/A                 |

## Verdict Details

- Design Token Fidelity: **PASS** (one minor drift, finding #2)
- Visual State Coverage: **PASS** (shared `EstadoDados` wrapper enforces loading/error/empty; no explicit `:active` state on buttons, minor)
- Dark Mode Parity: **N/A — not implemented app-wide** (confirm intentional; see finding #3)
- Animation Quality: **PASS** (the one keyframe found, `desk-entrada 200ms ease-out`, respects `prefers-reduced-motion` via a global `transition-duration: 0.01ms !important` override; `portal-v11.css` has its own dedicated reduced-motion blocks)
- Visual Consistency: **PASS** (single card primitive, single state wrapper, single token root)
