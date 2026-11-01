# Structural Audit: Clube Ancestral (soul-ancestry)

**Perspective**: Systems/Structural Architect
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)

## Plan Summary

Layered structure is: routes (UI) → `lib/*.functions.ts` (server-function/HTTP boundary) → `lib/*.server.ts` (core logic, admin client) → `integrations/supabase` (data access) → Postgres/Supabase. The layering itself is sound and the repo's own orphan-registry discipline (functions reclassified as `CASCA_DUPLICADA` when logic already reaches the screen through a `.server.ts` core) shows real architectural self-awareness. The structural risk is concentration, not direction: one route file has become the de facto integration hub for nearly the entire domain.

## Files Reviewed

| File                                                                 | Structural Role                                    | Layer           | Risk                             |
| -------------------------------------------------------------------- | -------------------------------------------------- | --------------- | -------------------------------- |
| `src/routes/_authenticated/casos.$caseId.index.tsx`                  | "Caso 360" — primary case screen                   | UI/route        | **Critical**                     |
| `src/lib/*.functions.ts` (119 files)                                 | Server-function boundary                           | Server boundary | Medium (inconsistent split)      |
| `src/lib/*.server.ts` (43 files)                                     | Core logic                                         | Domain          | Low                              |
| `src/lib/orfaos-classificados.ts`, `orfaos-modulos-classificados.ts` | Dependency-direction enforcement (orphan registry) | Meta/governance | Low — this is a structural asset |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)

| #   | Issue                                                                                                                                                                                                                             | Files Involved                                                                                                 | Structural Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `casos.$caseId.index.tsx` is **5,171 lines** with **95 top-level imports**, 27 of them distinct `@/lib` modules spanning contracts, documents, finance, GoLive, research, and quality/gates — nearly every domain the product has | `casos.$caseId.index.tsx` (confirmed: next-largest route file, `leads.tsx`, is 1,782 lines — under 3x smaller) | This is the textbook god module: highest fan-in (every feature wave this session added a button/section here — confirmed via #203's "Abrir contrato" button, the W1–W5 religação work) and highest fan-out (27 domains). It is now the single highest blast-radius file in the repo — a change to almost any domain module risks a merge conflict or a review burden here, and no single reviewer can hold its full behavior in mind. The repeated pattern observed this session ("add the new panel/button to Caso 360") is itself the god-module gotcha in real time | Extract by section: the file already groups into named blocks (Lote A/B/C/D per existing `data-caso360-lote` markers found in tests). Each lote is a candidate for its own component file receiving `caseId` as a prop, with the route file reduced to composition + data orchestration. Do this incrementally — do not attempt a single rewrite PR, which would itself carry unacceptable risk on the highest-traffic file in the app |

## Recommendations

| #   | Issue                                                                                                                                                                                                                | Why                                                                                                                                                                                                                                                                                                                                                                                                                     | Fix                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Only 43 of 119 `.functions.ts` files have a paired `.server.ts` core; the rest mix the HTTP/server-fn boundary and business logic in one file                                                                        | Not wrong by default (small handlers don't need a split), but the files that _do_ have the split (e.g., `evidencia-canonica.functions.ts` → `.server.ts`, confirmed this session as the pattern that let a duplicate HTTP wrapper be safely retired) show the split pays off specifically when logic needs to be called from more than one entry point. Without a clear threshold, it's inconsistent which files get it | No blanket fix — flag the rule of thumb for new work: split out a `.server.ts` core as soon as a second caller (another server fn, a script, a test needing the logic directly) appears, not before |
| 2   | The orphan registries (`orfaos-classificados.ts`, `orfaos-modulos-classificados.ts`) are a strong structural control — they make "add new path while an old one still exists" a test failure instead of silent drift | n/a — this is working as intended                                                                                                                                                                                                                                                                                                                                                                                       | Keep enforcing it; it directly prevents the "feature flag as architectural boundary" and "second caller without a clean interface" gotchas this lens normally has to hunt for manually              |

## Nice-to-Haves

| #   | Suggestion                                                                                                                                                        | Rationale                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | A simple CI check (`wc -l` threshold, e.g. fail/warn over 2,000 lines for `.tsx`) would have flagged Critical #1 automatically well before it reached 5,171 lines | Cheap, catches god-module growth at the moment it happens rather than after the fact |

## Dependency Map

```
routes/_authenticated/casos.$caseId.index.tsx  (5,171 lines, 95 imports)
   │
   ├─▶ lib/contratos.functions.ts  ──▶ lib/*.server.ts (core) ──▶ integrations/supabase
   ├─▶ lib/documentos.functions.ts ──▶ …
   ├─▶ lib/golive.functions.ts     ──▶ …
   ├─▶ lib/pesquisa-cadeia.functions.ts ──▶ …
   ├─▶ lib/saas.functions.ts       ──▶ …
   └─▶ … (22 more @/lib modules)

   ^ single file depends on ~27 domain modules directly —
     no intermediate "case-overview" aggregation layer exists;
     every new case-level feature's natural first home is this file.
```

Dependency _direction_ is correct (route → functions → server → data access, never reversed). The problem is fan-out magnitude at one node, not a cycle or an inverted arrow.

## Boundary Crossing Analysis

| Crossing                     | From → To                                        | Clean?  | Notes                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route → server function      | `casos.$caseId.index.tsx` → `lib/*.functions.ts` | Yes     | Via `useServerFn`, consistent with the rest of the codebase                                                                                                                        |
| Server function → core logic | `lib/*.functions.ts` → `lib/*.server.ts`         | Partial | Clean where the split exists (43 files); the other 76 mix boundary and logic in one file — not a violation, just an inconsistency worth a documented threshold (Recommendation #1) |
| Core logic → data access     | `lib/*.server.ts` → `integrations/supabase`      | Yes     | Confirmed pattern: `client.server.ts` validates the service-role key belongs to the declared project before use                                                                    |

## Verdict Details

- Dependency Direction: **PASS** (no inversions or cycles found)
- Module Coupling: **CONCERNS** (Critical #1 — one file coupled to 27 domains)
- Cohesion: **CONCERNS** (same root cause — Caso 360 has accreted unrelated feature sections rather than each living in its owning domain's own surface)
- Layer Boundaries: **PASS** (route/function/server/data-access layering is respected in direction; only the function/server split is inconsistent, not violated)
- Change Propagation: **CONCERNS** (a change to almost any domain has a plausible path back to this one file, which is the opposite of appropriate propagation scope)
