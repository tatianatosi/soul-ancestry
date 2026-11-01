# Repo Maintenance Audit: Clube Ancestral (soul-ancestry)

**Perspective**: Repo Maintainer
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)

## Plan Summary

Project convention is: no barrel `index.ts` files (deliberate, confirmed by the frontend lens), no structured-logger module (console.error is the de facto convention, 17 call sites vs. 3 stray `console.log`), and a single root `AGENTS.md` (not per-directory `CLAUDE.md`) as the binding governance document, backed by `docs/politicas/*.md`. Reviewed against those actual conventions, not generic defaults.

## Files Reviewed

| File                                                                                      | Convention Status                               | Risk                          |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------- |
| `eslint.config.ts`                                                                        | Configured, `tseslint.configs.recommended` base | Low                           |
| `src/data/case-directory.ts`, `activeCase.ts`, `caseDataGiovanna.ts`, `caseDataSophia.ts` | Partial cleanup                                 | Medium                        |
| `src/lib/useActiveCase.ts`                                                                | Consumer of the above                           | Low (confirmed safe fallback) |
| Repo-wide `console.log`/`console.error` usage                                             | Convention check                                | Low                           |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)

None at this pass's scope — the one issue that looked critical on first read (default-case fallback leaking a real client's data) was already fixed on 2026-10-31 per `src/data/activeCase.ts`'s own changelog comment, verified in the current source.

## Recommendations

| #   | Issue                                                                                                                                                                                                                              | File(s)                           | Why                                                                                                                                                                                                                                                                                                                                                                    | Fix                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `CASE_DIRECTORY` still imports and exposes `caseDataGiovanna`/`caseDataSophia` (named, real-sounding client fixtures) by `case_id`; any URL carrying one of those two case ids still resolves to that fixture data via `casoPorId` | `src/data/case-directory.ts:3-12` | The no-default-leak bug is fixed (confirmed: unmatched id falls back to the empty `caseTemplate`, not a named person), but the two named fixtures remain live, queryable data paths. The file's own comment says "Nenhuma tela deve importar um caso fixo" (no screen should import a fixed case) — yet `CASOS_DISPONIVEIS` still publishes both as selectable options | Confirm with the product owner whether these are intentional QA/demo fixtures (in which case, rename away from a real person's apparent identity to something explicitly fake, e.g. `caseDataDemo1`) or leftover from before the 31/10 fix and safe to delete now that nothing requires a default fallback through them |
| 2   | `eslint.config.ts` does not explicitly configure `@typescript-eslint/no-explicit-any`; it inherits whatever severity `tseslint.configs.recommended` sets, and 210 files locally override it with a disable comment                 | `eslint.config.ts`                | Ties to the Frontend Engineer lens's Critical #1 — flagging here because the fix for that finding should also make the rule's severity explicit in config (not just rely on the recommended preset's default), so the intent is visible in one place rather than inferred from the preset version                                                                      | Add an explicit `"@typescript-eslint/no-explicit-any": "error"` rule entry once the 210-file cleanup lands, so a regression is caught at config level, not just by convention                                                                                                                                           |

## Nice-to-Haves

| #   | Suggestion                                                      | Rationale |
| --- | --------------------------------------------------------------- | --------- |
| 1   | None beyond what's already covered by other lenses in this pass | —         |

## Convention Compliance Checklist

| Convention             | Status            | Notes                                                                                                                                                                              |
| ---------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File placement         | PASS              | Routes in `routes/`, server functions in `lib/*.functions.ts`, core logic in `lib/*.server.ts`, data fixtures in `data/` — all consistent with where neighboring files already are |
| Naming conventions     | PASS              | kebab-case files, Portuguese domain terms used consistently (not mixed with English ad hoc)                                                                                        |
| Barrel exports         | PASS              | Project deliberately has none in `components/ui`; consumers import specific files directly — confirmed intentional, not an oversight                                               |
| Import ordering        | Not verified      | Would require running `eslint .`; out of scope for a read-only pass                                                                                                                |
| Type imports separated | Not verified      | Same — spot checks during this pass showed mixed value/type imports in some files (e.g., `case-directory.ts:1` uses `import type`), but not systematically checked                 |
| Path aliases used      | PASS              | `@/lib/...`, `@/components/...` used consistently in every file sampled across all lenses so far                                                                                   |
| No dead code left      | CONCERNS          | Recommendation #1 — two named fixture files remain reachable after their default-fallback role was removed                                                                         |
| Structured logging     | N/A               | Project convention is `console.error`, not a dedicated logger module — this is the actual convention, not a violation of one                                                       |
| No lint suppressions   | CONCERNS          | 210 files suppress `no-explicit-any` (see Frontend Engineer lens for full detail; cross-referenced here as Recommendation #2)                                                      |
| CLAUDE.md present      | PASS (equivalent) | Root `AGENTS.md` + `docs/politicas/*.md` serve this role project-wide; no per-directory doc convention exists or is expected here                                                  |

## Reuse Opportunities

None found this pass that weren't already covered by other lenses (the `CaCard` compact-variant pattern, flagged positively under Design Engineering, is itself a reuse success story worth naming here too: it replaced what would have been a third card implementation).

## Verdict Details

- File Organization: **PASS**
- Naming Consistency: **PASS**
- Import Hygiene: **CONCERNS** (not fully verified; the one concrete item is lint-suppression density, already counted under Frontend Engineering)
- Code Reuse: **PASS**
- Lint Compliance: **CONCERNS** (210 suppressions of one rule; everything else sampled was clean)
