# Frontend Engineering Audit: Clube Ancestral (soul-ancestry)

**Perspective**: Frontend Engineer
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)

## Plan Summary

React 19 + TanStack Start/Router + TanStack Query app, `strict: true` TypeScript, no Zustand/Immer (state is React Query cache + local `useState`), no barrel files for `ui` primitives (direct imports confirmed). The dominant frontend risk isn't architecture — the component split (`ca-card.tsx`, `estado-dados.tsx`, feature components) is disciplined — it's a systemic type-safety opt-out at the server-function boundary.

## Files Reviewed

| File                                                    | Frontend Role                   | Risk                       |
| ------------------------------------------------------- | ------------------------------- | -------------------------- |
| `tsconfig.json`                                         | Compiler config                 | —                          |
| `src/components/contratos/painel-estado-contratual.tsx` | Query consumer, recent addition | High (typed finding below) |
| `src/lib/contratos.functions.ts`                        | `createServerFn` source         | High                       |
| `src/routes/_authenticated/casos.$caseId.index.tsx`     | Mutation pattern reference      | Low                        |
| `src/components/ui/button.tsx`, `ca-card.tsx`           | Primitives                      | Low                        |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)

| #   | Issue                                                                                                                                                                                                                                                                    | File(s)                                                                                                                                                                                                                                                                                                                                                                                    | Why It Breaks                                                                                                                                                                                                                                                                                                                                                                                                                              | Code Fix                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **210 files** (`grep -rl "eslint-disable @typescript-eslint/no-explicit-any"`, ~13% of everything under `src`) open with a blanket disable of the any-rule, almost always to type a `createServerFn` response as `Record<string, any[]>` by hand instead of inferring it | Systemic — sampled `src/components/contratos/painel-estado-contratual.tsx:17` (`type Painel = { contratos: any[]; bloqueios: any[]; … }`), confirmed pattern repeats across `.functions.ts` and route files, including one file touched **17 minutes before this audit ran** (`src/components/caso/conferencia-piloto-caso.tsx`) — this is not legacy debt, it's the current default habit | `tsconfig.json` sets `"strict": true`, but this one opt-out neutralizes it at exactly the boundary (server↔client data) where type errors matter most: a renamed or removed field in a `.functions.ts` handler produces **zero compiler feedback** in every consuming component. TanStack Start's `createServerFn().handler(...)` has an inferable return type; hand-typing `any[]` instead of reusing it is strictly worse and no shorter | Replace the local `any`-typed interface with the function's real type: `type Painel = Awaited<ReturnType<typeof painelContratual>>` (adjust to this TanStack Start version's exact inference path) exported once from the `.functions.ts` file and imported by consumers. Do this first on the highest-traffic files (`contratos.functions.ts`, `casos.$caseId.index.tsx`-adjacent panels) rather than all 210 at once |

## Recommendations

| #   | Issue                                                                                                              | File(s)   | Why                                                                                                                                                              | Fix                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No lint/CI gate currently stops a 211th file from adding the same disable comment                                  | repo-wide | The pattern is actively growing (confirmed 17-minute-old instance), so without a gate, finding #1 will keep getting worse even as individual files are fixed     | Add an ESLint rule or a CI grep check that fails on new `eslint-disable @typescript-eslint/no-explicit-any` additions outside an explicit allowlist, so the 210 is a ceiling, not a floor |
| 2   | Direct `ui` primitive imports (`@/components/ui/ca-card`) confirmed, no barrel `index.ts` found in `components/ui` | n/a       | This is correct — noting it so it isn't "fixed" into a barrel file later, which would reintroduce the exact bundle-bloat risk this architecture currently avoids | No action — preserve this pattern                                                                                                                                                         |

## Nice-to-Haves

| #   | Suggestion                                                                                                                                                                             | Rationale                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | For the 210-file cleanup, batch by directory (`lib/*.functions.ts` first, since those are the type _source_; route/component consumers follow once the source files export real types) | Fixing consumers before sources just moves the `any` one hop, it doesn't remove it |

## Render Path Analysis

`PainelEstadoContratual` (sampled): `useQuery({ queryKey: ["painel-contratual"], queryFn: () => carregar() })` with no `select`, no dependent query key — this is correct for a single global org-level panel with no per-case variant. No unnecessary re-render risk found in the sampled component: it has no local state, no effects, renders purely from query data via the shared `EstadoDados` wrapper (loading/error/success branches), and the `Numero` sub-component is a plain function component with no props that would benefit from `memo` (cheap render, re-renders alongside its 1-2 siblings only).

No Zustand/Immer in this codebase, so the "nested mutation silently dropped" class of bug this skill normally checks for does not apply here — state is TanStack Query cache (server-authoritative, revalidated) plus scoped local `useState`, which structurally avoids that failure mode.

## Type Safety Assessment

This is where the codebase's real risk lives. `strict: true` is set correctly at the compiler level, but the `any`-disable pattern (Critical #1) creates a large, growing set of components that receive untyped data from the one boundary most likely to change shape over time (server function handlers, which get edited constantly as this session's own work shows). Everywhere _else_ sampled — component props, the `CaCard` variant union, the `Button` `cva` variants — typing is explicit and precise. The gap is narrow but load-bearing.

## Verdict Details

- Component Architecture: **PASS**
- State Management: **PASS** (no Zustand/Immer footguns; Query-cache-as-source-of-truth is the right call here)
- Type Safety: **CONCERNS** (Critical #1 — systemic, growing, boundary-specific)
- Rendering Performance: **PASS** (sampled component has no unnecessary re-render surface)
- Bundle Impact: **PASS** (no barrel imports found; direct primitive imports confirmed)
