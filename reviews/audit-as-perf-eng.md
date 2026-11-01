# Performance Audit: Clube Ancestral (soul-ancestry)

**Perspective**: Performance Engineer
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)
**Scope note**: No Tauri/IPC in this stack. Translated the lens to its real equivalent here: `useServerFn`/`createServerFn` round trips are the "IPC calls," a staff member's workday with the Desk open is the "8+ hour session," and TanStack Query's cache is the state that can accumulate or over-fetch.

## Plan Summary

The main performance risk is concentrated in the same file the Structural lens already flagged as a god module: `casos.$caseId.index.tsx` fires roughly a dozen-plus independent server-function queries essentially unconditionally on mount, regardless of which of the case's 8 sections the staff member actually wants to see.

## Files Reviewed

| File                                                           | Performance Role                                                               | Risk                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| `src/routes/_authenticated/casos.$caseId.index.tsx`            | Primary case screen, 31 `useQuery`/`useSuspenseQuery`/`useMutation` call sites | **High**                                  |
| `src/components/equipe/status-envio-recuperacao.tsx`           | 20s polling, opt-in, background-disabled                                       | Low                                       |
| `src/components/portal/fonte-portal.tsx`                       | 30s fixed polling                                                              | Low-Medium                                |
| `src/integrations/supabase/types.ts` (20,597 lines, generated) | Type-only Supabase types                                                       | None (compile-time only, erased at build) |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)

None — nothing found causes unbounded memory growth, a listener leak, or a correctness bug. The finding below is a real cost, not a crash risk, so it's filed as a high-impact recommendation rather than a blocker.

## Recommendations

| #   | Issue                                                                                                                                                                                                                                                                                                                        | File(s)                                                                                                            | Why                                                                                                                                                                                                                                                                                                                                                                                                | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Of ~13 top-level `useQuery` calls sampled in `casos.$caseId.index.tsx` (31 total React Query hook call sites in the file), only **2** use an `enabled:` gate. The rest fire the moment the route mounts, independent of which section (tasks, documents, financial, research, legal, …) the staff member is actually viewing | `casos.$caseId.index.tsx:462,836,841,848,862,868,878,887,897,908,940,4608,4622` (and more below the sampled range) | Every case open costs on the order of a dozen-plus concurrent server-function round trips — React Query parallelizes them (no waterfall), so this isn't a sequential-latency bug, but it is real, avoidable server load repeated on every single case-open, all day, for every staff member. A staff member who only needs "Tarefas" still triggers the financial, research, and genealogy queries | Gate section-specific queries (`qFinanceiro`, `qPesquisa`, `qJuridico`, `qDocumentos`, etc.) behind `enabled: secaoAtiva === "financeiro"` (or equivalent), matching whichever section-visibility state already drives the Lote A/B/C/D rendering. This is the same fix surface as the Structural lens's extraction recommendation — splitting the file into per-section components naturally gives each its own query, gated by whether that section is mounted/visible |
| 2   | `fonte-portal.tsx` polls every 30s unconditionally (no visible `enabled`/background-disable gate confirmed in the grep, unlike the 20s poll in `status-envio-recuperacao.tsx` which does disable in the background)                                                                                                          | `src/components/portal/fonte-portal.tsx:158`                                                                       | If this component can be mounted and left in a background tab for a workday, it's 2,880 extra requests/day per open tab for data that likely doesn't need 30s freshness                                                                                                                                                                                                                            | Confirm whether `refetchIntervalInBackground: false` (or equivalent `enabled` tied to tab visibility) is set elsewhere in the same hook config; if not, add it to match the pattern already used correctly one file over                                                                                                                                                                                                                                                 |

## Nice-to-Haves

| #   | Suggestion                                                                                                                                                                                                                 | Rationale |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | None beyond the above — the codebase already avoids the classic Zustand/listener-leak failure modes this lens usually hunts for, simply by not using that state-management shape (confirmed by the Frontend Engineer lens) |

## Resource Budget

| Resource                            | Current                                                                                   | After Plan                                             | Concern?                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Server-function calls per case-open | ~12+ fired on mount (sampled), largely ungated                                            | n/a — general health check, no plan to compare against | **Yes** — Recommendation #1                |
| Polling intervals found             | 2 (20s opt-in/background-safe, 30s unconditional)                                         | n/a                                                    | Minor — Recommendation #2                  |
| Generated-types bundle cost         | `types.ts` is 20,597 lines but type-only                                                  | n/a                                                    | None — erased at compile time, not shipped |
| Memory growth over a long session   | No unbounded arrays/caches found (React Query handles cache eviction by default `gcTime`) | n/a                                                    | None found                                 |

## Hot Path Analysis

The hottest path in the app, by construction, is opening a case: it's the screen staff will open most often, for the longest cumulative time, across the most working hours. Right now that hot path pays for roughly a dozen server round trips unconditionally, most of which serve sections the user may never scroll to in that visit. This is the performance-lens expression of the same root cause the Structural lens found (one file owning too much) — fixing the file's decomposition and fixing this query-gating issue are the same piece of work, which makes it a higher-value fix than if they were unrelated.

## Verdict Details

- Memory Management: **PASS** (no unbounded accumulation found; React Query's default cache GC applies)
- IPC Efficiency (→ server-function call volume): **CONCERNS** (Recommendation #1)
- I/O Patterns: **PASS** (no blocking reads, no redundant-fetch pattern found beyond the gating issue above)
- Startup Impact: **CONCERNS** (same root cause — case-open is the de facto "startup" of the Desk's main workflow)
- Long-Session Stability: **PASS** (polling found is bounded in frequency and mostly well-behaved; one gap noted in Recommendation #2)
