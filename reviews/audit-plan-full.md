# Full Spectrum Audit: Clube Ancestral (soul-ancestry)

**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)
**Source**: working tree, `main` @ `27359eb9` (post-restoration, post-#212)
**Lenses Run**: 9/10 full + 1 skipped
**Lenses Skipped**: Backend Engineer (Rust/Tauri-specific; this stack is Node/TypeScript/Supabase, no Rust anywhere)

**Note on format**: per the user's redirect to prioritize executing fixes, this master file is a condensed index rather than a byte-for-byte reproduction of each lens's full output. The complete report for each lens, with every table (Files Reviewed, full Recommendations, Verdict Details, etc.), lives in its own file under `reviews/audit-as-*.md`, linked below.

## Master Verdict: APPROVE WITH CHANGES

No lens returned NEEDS REWORK. Two genuinely serious items were found: a security-adjacent dead-end in the contract-send flow (no UI ever reads the approval queue it creates) and a keyboard-accessibility gap in one widget. One systemic-but-non-blocking item (210 files suppressing TypeScript's any-check) and one infrastructure item that is explicitly the Proprietária's call, not mine to execute (Drizzle journal vs. migrations folder). The single root cause behind two lenses' findings (Structural + Performance) is the same file: `casos.$caseId.index.tsx`.

## Verdict by Lens

| #   | Lens                   | Verdict              | Critical | Recommendations | Report                                |
| --- | ---------------------- | -------------------- | -------- | --------------- | ------------------------------------- |
| 1   | Design Engineer        | APPROVE WITH CHANGES | 0        | 3               | `reviews/audit-as-design-eng.md`      |
| 2   | UX Engineer            | APPROVE WITH CHANGES | 1        | 2               | `reviews/audit-as-ux-eng.md`          |
| 3   | Frontend Engineer      | APPROVE WITH CHANGES | 1        | 2               | `reviews/audit-as-frontend-eng.md`    |
| 4   | Backend Engineer       | Skipped              | —        | —               | n/a (no Rust/Tauri)                   |
| 5   | Structural Engineer    | APPROVE WITH CHANGES | 1        | 2               | `reviews/audit-as-structural-eng.md`  |
| 6   | Repo Maintainer        | APPROVE WITH CHANGES | 0        | 2               | `reviews/audit-as-repo-maintainer.md` |
| 7   | Production Readiness   | APPROVE WITH CHANGES | 1        | 2               | `reviews/audit-as-prod-readiness.md`  |
| 8   | DX Engineer            | APPROVE WITH CHANGES | 0        | 2               | `reviews/audit-as-dx-eng.md`          |
| 9   | Performance Engineer   | APPROVE WITH CHANGES | 0*       | 2               | `reviews/audit-as-perf-eng.md`        |
| 10  | Accessibility Engineer | APPROVE WITH CHANGES | 1        | 1               | `reviews/audit-as-a11y-eng.md`        |

\* Performance filed its Caso 360 finding as a high-impact Recommendation rather than Critical, since nothing crashes — see Cross-Cutting Concerns below, it's the same root cause as Structural's Critical.

## All Critical Issues (Must Fix)

| #   | Issue                                                                                                                                                 | Lens(es)                  | File(s)                                                 | Impact                                                                                          | Status after this session                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `communication_queue` rows (contract-send drafts) are created but read by zero `.tsx` files — no screen to find/approve a pending send                | UX                        | `src/lib/contratos.functions.ts` (`tentarEtapaExterna`) | Staff action creates permanent state with no way back to it in the product                      | **Delegated this session** — see Execution below                                                                                                              |
| 2   | 210 files (~13% of `src`) suppress `@typescript-eslint/no-explicit-any`, almost always at the `createServerFn` boundary                               | Frontend, Repo Maintainer | repo-wide, growing (confirmed 17-min-old instance)      | Strict TS is neutralized exactly where server data shape changes most                           | **Tracked as phased cleanup**, not a single-PR fix — see master plan                                                                                          |
| 3   | `casos.$caseId.index.tsx` — 5,171 lines, 95 imports, 27 domains, ~12+ ungated queries firing on every mount                                           | Structural, Performance   | `src/routes/_authenticated/casos.$caseId.index.tsx`     | Highest blast-radius file in the repo; every case-open pays for sections the user isn't viewing | **Partially fixed this session** (query gating) — full decomposition tracked as phased work                                                                   |
| 4   | Matrix cells in a Radar/Matrizes widget are mouse-only; no keyboard path to activate them                                                             | Accessibility             | `src/components/qualidade/radar-matrizes-prancha.tsx`   | WCAG 2.1.1 violation — keyboard/screen-reader users cannot use this widget                      | **Fixed this session**                                                                                                                                        |
| 5   | `supabase/migrations/` (236 files) vs. Drizzle journal (3 entries) — no single source of truth for deployed schema; gap widened since the 10/23 audit | Production Readiness      | `drizzle/migrations/meta/_journal.json`                 | No DR/staging path reconstructs current schema                                                  | **Not executed — requires the Proprietária's decision** (AGENTS.md: Claude Code never writes to `drizzle/migrations/`; E1 is explicitly "P decide, C propõe") |

## Cross-Cutting Concerns

| Concern                                    | Flagged By                                            | Root Cause                                                                                                           | Unified Fix                                                                                               |
| ------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| God-module concentration                   | Structural (Critical), Performance (Recommendation)   | `casos.$caseId.index.tsx` owns 27 domains' worth of imports and fires their queries unconditionally                  | Same fix serves both: decompose by section, and each extracted section naturally gets its own gated query |
| Type-safety opt-out at the server boundary | Frontend (Critical), Repo Maintainer (Recommendation) | `createServerFn` handlers have an inferable return type that 210 files re-type by hand as `any[]` instead of reusing | Export the inferred type once per `.functions.ts` source file; fix consumers in dependency order          |

## All Recommendations

See each lens's own file for its full Recommendations table (format preserved per-lens; not flattened here to avoid losing the "why" context tied to each file).

---

# Lens Reports

Each lens's complete report — Files Reviewed, full issue tables, and Verdict Details — is in its own file:

1. **Design Engineer** → `reviews/audit-as-design-eng.md`
2. **UX Engineer** → `reviews/audit-as-ux-eng.md`
3. **Frontend Engineer** → `reviews/audit-as-frontend-eng.md`
4. **Backend Engineer** — Skipped (no Rust/Tauri in this stack)
5. **Structural Engineer** → `reviews/audit-as-structural-eng.md`
6. **Repo Maintainer** → `reviews/audit-as-repo-maintainer.md`
7. **Production Readiness** → `reviews/audit-as-prod-readiness.md`
8. **DX Engineer** → `reviews/audit-as-dx-eng.md`
9. **Performance Engineer** → `reviews/audit-as-perf-eng.md`
10. **Accessibility Engineer** → `reviews/audit-as-a11y-eng.md`
