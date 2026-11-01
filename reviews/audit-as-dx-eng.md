# DX Audit: Clube Ancestral (soul-ancestry)

**Perspective**: Developer Experience Engineer
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)
**Scope note**: This app has no CLI/desktop surface for end users — "developer" here means the people (and agents) who work _in_ this repository day to day. Audited through that lens: onboarding docs, internal scripts, test/lint ergonomics, and error-message quality at the code level (end-user-facing error UX was already covered by the UX Engineer lens).

## Plan Summary

The developer-facing surface is small but deliberately crafted in places: a hardened CLI script (`pipeline.py`), a documented vitest config fix with its own "why", and a layered policy-doc structure (40-line root `AGENTS.md` pointing to a 214-line full-text policy). The main friction is the size of what must be read before a first safe change, and no fast local-check short of full type/test/build.

## Files Reviewed

| File                                                                | DX Role                                   | Risk                    |
| ------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| `pipeline.py`                                                       | Internal publish script (CLI)             | Low — recently hardened |
| `AGENTS.md`, `docs/politicas/AGENTS-MEMORIA-COMPLETA-2026-10-11.md` | Onboarding / binding policy               | Medium (size)           |
| `vitest.config.ts`                                                  | Test runner config, with inline rationale | Low (exemplary)         |
| `src/lib/recusa-traducao.server.ts`                                 | Error-message translation layer           | Low (exemplary)         |
| `.claude/skills/{lancar,classificar-orfao,pendente-sql}/SKILL.md`   | Repeatable developer/agent procedures     | Low                     |
| `package.json` scripts                                              | `typecheck`, `test`, `build`              | Low                     |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)

None.

## Recommendations

| #   | Issue                                                                                                                                                                            | Why                                                                                                                                                                                                                                                                                                       | Fix                                                                                                                                                                                                                                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | No fast, partial local check exists between "read the diff" and "run the full suite" (`bun run test` runs all 648 test files; `bun run build` runs a full Vite production build) | A developer or agent making a one-line fix to a single module has no `vitest run <path>` alias surfaced in `package.json` — it's discoverable (vitest supports path args natively) but not documented as a script, so the path of least resistance is "run everything," which is slow for quick iteration | Add a `"test:file": "vitest run"` (accepting a path arg) note in `AGENTS.md`'s dev-workflow section, or just document that `bun run test -- <path>` scopes the run — small discoverability win                                                                                                                                            |
| 2   | Full binding-policy reading burden before a safe first change is ~254 lines across two files (`AGENTS.md` 40 + the full-text policy 214)                                         | Not unreasonable for a compliance/privacy-sensitive domain (this is a genuine constraint, not a design mistake), but worth naming: a new contributor (or a fresh agent session) pays this cost every time, since the root file is a pointer, not a summary with enough detail to act alone                | Consider whether the root `AGENTS.md` could carry the 5-6 highest-stakes rules inline (no fabricated progress, no direct `supabase/migrations/` writes, no merge without authorization — these already seem to be there) so a reader gets the critical subset before needing the full 214-line document for anything beyond basic changes |

## Nice-to-Haves

| #   | Suggestion                                                                                                                                                  | Rationale |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | None beyond the above — the small internal tooling that exists (`pipeline.py`, the 3 `.claude/skills/*`) is already a strong pattern worth preserving as-is |

## Error Message Audit

| Error Scenario                                                                   | Current Message                                                                                                                  | What Developer Needs             | Suggested Message                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pipeline.py` called with an unknown flag                                        | `"opção desconhecida"` to stderr, exit code 2 (confirmed by this repo's own hardening tests)                                     | What was unknown, what's valid   | Already good — confirmed test asserts the message appears in stderr, not stdout, so it doesn't get mistaken for a commit message. No change needed                                                                                                                                                                                                   |
| A Postgres trigger refuses a write, translation exists                           | Original Postgres message + `—` + specific guidance (confirmed pattern in `recusa-traducao.server.ts`)                           | What happened, why, what to do   | Already good — this is the model pattern. The function's own docstring states the honesty contract explicitly: "sem correspondência, devolve a mensagem original — nunca inventa contexto" (no match → returns the original, never invents context). That's exactly the right failure-mode design: never worse than the raw error, often much better |
| A Postgres trigger refuses a write, no translation entry yet                     | Raw Postgres exception text                                                                                                      | Same quality as the matched case | Not a code defect — correctly falls back to the original message rather than guessing. Worth knowing the translation table's coverage is partial (this repo's own docs cite "692+ points" of possible refusal, translation table has a handful of entries) — an ongoing coverage gap, not a design flaw                                              |
| `vitest run` picks up 10,680 agent-worktree test files instead of ~595 real ones | Fixed, documented inline in `vitest.config.ts` with the exact incident ("CI passava limpo e só quebrava quem rodava localmente") | —                                | Already fixed — flagging as a **positive** DX pattern: the fix includes _why_, not just _what_, so a future contributor won't "simplify" the exclude list back into the bug                                                                                                                                                                          |

## Developer Journey

- **First use** (new contributor or fresh agent session): reads root `AGENTS.md` (40 lines, fast), told to read the 214-line full-text policy before touching flow/schema/nav/App — a real but bounded cost (Recommendation #2).
- **Daily use**: `bun run typecheck` / `bun run test` / `bun run build` are the three standard gates, matching what CI runs (verified in the devops-config-reviewer pass) — no drift between local and CI commands, which is the right baseline. No scoped-test shortcut documented (Recommendation #1).
- **Power use** (repeated workflows): the `.claude/skills/` directory (`lancar`, `classificar-orfao`, `pendente-sql`) encodes exactly the kind of "I do this often, here's the checklist" pattern this lens looks for — each is a documented, repeatable procedure rather than tribal knowledge. This is a genuine DX strength worth calling out explicitly.

## Verdict Details

- Error Quality: **PASS** (translation layer is a model pattern; fallback behavior is honest)
- Defaults & Config: **PASS** (test/build/typecheck scripts match CI exactly, zero drift)
- Keyboard Experience: **N/A** (no interactive CLI surface to evaluate)
- Discoverability: **CONCERNS** (scoped test runs work but aren't documented; otherwise strong — skills directory is highly discoverable)
- Workflow Integration: **PASS** (`.claude/skills/*` is exactly the right shape for recurring procedures)
