# active-memory handoff: soul-ancestry — auditoria full-spectrum e PRs de correção

**Handoff #1** · 2026-11-07 · Lineage: #1 (2026-11-07): sessão rodou auditoria full-spectrum de 9 lentes, corrigiu os críticos em 5 PRs, mesclou 4 e deixou 1 (#217) pendente de evidência humana.

## 0. Instructions for Claude (read first)

You are continuing work from a previous chat. That chat is gone; this file is the complete context and the source of truth.

1. Read this whole file before replying.
2. Follow sections 3 (Style), 4 (Hard rules) and 5 (Corrections) in every reply, for the rest of this chat. They override your defaults.
3. Use the values in section 8 exactly. Never round, re-estimate, or "correct" them.
4. Do not suggest anything listed in section 7 (Changed / rejected) again unless the user brings it up.
5. Code word: None active. If the user types /amcodeword, start every reply with the phrase they choose (default "Yes Boss!").
6. Your first reply: at most 5 lines covering the goal, the current state, and the next step (section 11). Mention any files from section 13 that were not attached. Ask the questions in section 12 if there are any. End with "Ready to continue with <next step>?" Then wait for the user's go.

## 1. Mission

- **Goal:** Pre-launch engineering work on `tatianatosi/soul-ancestry` (TanStack Start + React 19 + Supabase, Lovable-connected). Ran a full-spectrum code audit (9 lenses), then planned and executed fixes for each critical finding.
- **Done looks like:** Each critical finding either fixed in a merged PR, or — when it needs a decision only the Proprietária (Tatiana, the startup owner) can make — written up as a proposal/decision doc and left for her.
- **Why it matters / context:** This is a genealogy/citizenship-services business ("Clube Ancestral"). Two surfaces: Desk V4 (internal admin tool the Proprietária uses) and App Cliente (client-facing portal, web+mobile via one responsive codebase — no native app). Production is Lovable-hosted only (Vercel was decommissioned 2026-10-23).

## 2. About the user (as relevant to this work)

- Tatiana Tosi (tati@pluggedresearch.com) — the Proprietária, owns/operates the Clube Ancestral startup. Works through Claude Code sessions to build/audit/fix the Desk V4 + App Cliente product. Gives explicit one-word merge authorizations ("merge 211", "merge 217") when ready.

## 3. Style & communication

- **Language:** Reply to the user in whatever language they use (this session has been mixed Portuguese/English; project docs and commit messages are in Portuguese).
- **Tone:** Direct, concise, no narration of internal reasoning.
- **Reply length:** Short — one sentence before tool calls, short status updates at key moments, 1-2 sentence end-of-turn summaries.
- **Formatting:** No emojis unless asked. Code/paths in backticks. Tables fine for structured status.
- **Working style:** State in one sentence what you're about to do before tool calls. Give updates at key moments (found something, changed direction, hit a blocker). Never fabricate progress or evidence.
- **Avoid:** Narrating tool-call noise; repeating identical "nothing changed" notification reports (collapse/stay silent on exact repeats); merging, deploying, or running migrations without explicit per-action authorization.

## 4. Hard rules (word for word, from this repo's `AGENTS.md`/`CLAUDE.md` and the session)

1. "O Claude Code nunca escreve em `supabase/migrations/` nem em `drizzle/migrations/`. Mudanças no banco são propostas em `supabase/pendentes/` e aplicadas pelo Lovable." (from `supabase/pendentes/README.md`, reaffirmed in `CLAUDE.md`)
2. "Sem migration, RLS, convite, publicação, merge ou deploy sem autorização explícita — por quê: efeitos externos." (AGENTS.md, standing rule all session)
3. "Nada arquiva sem `COMPROVADO_EM_USO` com prints autenticados da Proprietária; build/teste não é prova." (AGENTS.md) — now mechanically enforced by the repo's PR evidence-matrix `guard` CI check (see section 9).
4. Desk sidebar renders only `SETORES_DESK`/`GRUPOS_DESK` — never a second menu list; App Cliente frozen at 7 tabs; `painel-dia.tsx` not to be touched; `casos.$caseId.index.tsx` ("Caso 360") is a known 5,171-line god-module, extraction is a separate larger initiative not undertaken this session.
5. Never write to `drizzle/migrations/` even for "baseline" reconciliation — any schema-tooling change needs explicit authorization and (for DB introspection) a credential not present in this environment.
6. Commit messages must end with:
   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01BfAhS2qY35EBUxAPp6vLz1
   ```
   PR bodies must end with:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   https://claude.ai/code/session_01BfAhS2qY35EBUxAPp6vLz1
   ```
7. "Read the active PR reservations before changing files. Use an isolated branch and declare every changed file and tested/base SHA in the existing PR evidence matrix." (`CLAUDE.md`, current canonical project instructions — replaced `AGENTS.md`, which no longer exists in the repo as of this session)
8. "Never merge or publish automatically; human authorization, integration, tests and deployment remain separate." (`CLAUDE.md`)
9. Never fabricate screenshots, "tested in production," or any evidence-matrix criterion as `PASSOU` without having actually produced that evidence. Criteria needing a published preview or a real authenticated session are declared `BLOQUEADO_POR_DECISAO` with `owner: "Proprietária"` instead.
10. `AGENTS.md`'s project-specific rules (menu structure, App Cliente scope, etc. — quoted in full at the top of this session's system prompt) remain binding even though the file itself was removed from the repo; `CLAUDE.md` says its own rules "do not duplicate" `AGENTS.md`'s, implying continuity, not replacement of content — but as of this handoff, `AGENTS.md` is confirmed **not present** in the repo. Flagged as an open question (section 12).

## 5. Corrections log

| #   | Claude did                                                                                        | The user wanted                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | (earlier session, pre-compaction) various audit/execution steps                                   | User explicitly chose "Saúde geral do repositório" (Option 3: general repo health, no specific diff) when asked to scope `/audit-suite:full-audit`                                |
| 2   | Was about to report the evidence-matrix `guard` CI check as simply an external blocker to wait on | Once `CLAUDE.md` loaded (replacing `AGENTS.md`), corrected course: the evidence-matrix system is real, instructed project process — filled it in honestly instead of just waiting |
| 3   | Repeatedly narrated identical recurring `reservation-sync` notification duplicates                | Self-corrected to stop narrating exact repeats and only surface real changes                                                                                                      |

## 6. Decisions

| Decision                                                                               | Why                                                                                                                                                                     |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge PR #211 (restore 101 files)                                                      | User said "merge 211"                                                                                                                                                   |
| Run all 9 applicable audit lenses (Backend/Rust skipped — no Rust/Tauri in this stack) | User said "pode prosseguir" after reviewing the lens list                                                                                                               |
| Scope UX fix (#217) by reusing `/atendimento` instead of a new Desk menu entry         | `AGENTS.md`: "nunca manter segunda lista de menu"                                                                                                                       |
| Frontend `any`-cleanup done as "Fase 1" (8 of 210 files) only                          | 210 files is a multi-session initiative, not a single-PR fix; files chosen were ones where the only `any` usage was a redundant `context.supabase as any` cast          |
| Drizzle journal gap: written as a proposal, not executed                               | Explicitly the Proprietária's decision per `AGENTS.md`; Claude Code never writes to `drizzle/migrations/`                                                               |
| Merge PR #217                                                                          | User said "Merge 217" — in progress; branch updated, conflict resolved, evidence matrix written, but 3 criteria remain `BLOQUEADO_POR_DECISAO` pending the Proprietária |

## 7. Changed / rejected

- ❌ Fabricating UI screenshots or "tested" evidence to force PR #217's `guard` check green — rejected; not done, ever, in this session.
- ❌ Treating the `guard`/evidence-matrix CI check as a stray/unexplained gate to just report and wait on → corrected once `CLAUDE.md` loaded: it's real, instructed process; filled it in honestly.
- Old: `AGENTS.md` as the canonical project-instructions file → New: `CLAUDE.md` is now canonical (as of partway through this session); `AGENTS.md` is confirmed no longer present in the repo. See open question in section 12.

## 8. Data & facts (exact)

**Repo:** `tatianatosi/soul-ancestry` (private). Stack: TanStack Start/React 19/Supabase, Tailwind v4, shadcn/radix. Lovable Cloud project `1a628b61-ec68-454f-85e1-671d6f297370` (older note) / Supabase project ref `zsxpdbhdvbuulwpepemd` (seen in Supabase Preview check URLs this session — may be the current/different DB, not reconciled).

**PRs touched this session:**

| PR   | Branch                                            | Title                                                                                | State                                           |
| ---- | ------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| #211 | —                                                 | Restore 101 files a bad Lovable merge dropped                                        | Merged (earlier, "merge 211")                   |
| #212 | `fix/ci-bun-pin-cache-permissions`                | CI: bun pin, cache, permissions                                                      | Open, draft (not acted on further this session) |
| #214 | `fix/a11y-keyboard-matrix-radar`                  | a11y: keyboard access to priority matrix                                             | **Merged**                                      |
| #215 | `fix/teste-robots-vitrine-publica`                | Fix stale test (`robots` meta)                                                       | **Merged**                                      |
| #216 | `perf/caso360-query-gating`                       | Perf: gate ungated queries in Caso 360                                               | **Merged**                                      |
| #217 | `fix/ux-fila-comunicacao-aprovacao`               | UX: approval screen for `communication_queue`                                        | **Open — current focus, see below**             |
| #218 | `fix/frontend-any-cleanup-fase1`                  | Frontend: remove 8 unnecessary `any` casts                                           | **Merged**                                      |
| #222 | `claude/exemplo-integracao-evidencias-2026-11-02` | Reference example of the evidence-matrix format (by a Lovable session, not this one) | Open, used as a format reference only           |
| #228 | `claude/sync-lovable-fcac46be`                    | Lovable→main sync                                                                    | Open, not touched                               |

**PR #217 exact state (as of last check):**

- Branch: `fix/ux-fila-comunicacao-aprovacao`
- Head SHA: `fec4de303c32fa5acae525d3585590538dd8df12`
- Base SHA: `96c0fd084a68d3d5b99cbfc529090446b2daba6d`
- Files changed: `src/components/portal/atendimento-interno.tsx`, `src/lib/__tests__/ca05-cadencia-microentregas.test.ts`, `src/lib/__tests__/orfaos-onda6-despublicar-app-2026-10-04.test.ts`, `src/lib/__tests__/ux-fila-comunicacao-aprovacao-2026-11-01.test.ts`, `src/lib/atendimento.ts`, `src/lib/portal-atendimento.functions.ts`, `src/routes/_authenticated/atendimento.tsx`
- Real CI evidence link (typecheck-test-build, passed on this exact head SHA): `https://github.com/tatianatosi/soul-ancestry/actions/runs/41648734845/job/125960910020`
- Evidence matrix posted to PR body: 2 criteria `PASSOU` (CI, LEITURA_FILA — both backed by the CI link above), 3 criteria `BLOQUEADO_POR_DECISAO` with `owner: "Proprietária"` (PAINEL_UI, APROVAR_ARQUIVAR, DEEP_LINK — all need a published preview or a real authenticated Desk session to verify).
- `reservation-sync` status as of last read: "0 divergências, 3 pendências" (correct/honest state, not an error).

**Drizzle proposal doc:** `00_governanca/PROPOSTA-JOURNAL-DRIZZLE-2026-11-01.md` — 2 options (A: document the limit; B: baseline the real DB, needs `LOVABLE_DB_MIGRATION_URL` not set in this environment). Recommendation: Option A. Awaiting Proprietária's decision.

**Master plan doc:** `docs/PLANO-TAREFAS-2026-10-31.md` — updated this session with a new "Q — Auditoria full-spectrum" section (Q1–Q5) tracking all 5 critical findings and their status; also updated E1 and H8 entries.

**Evidence-matrix schema** (lives in `scripts/pr-evidence.mjs`, enforced by `.github/workflows/sync-guard.yml`'s `guard` job): PR body must contain a fenced ```json block with `agent` ("Claude"|"Lovable"), `base_sha`/`tested_sha` (40-hex SHAs, `tested_sha` must equal the PR's current head), `files` (array, must include every file GitHub's diff reports changed), and `criteria` (array of `{id, requirement, test, kinds[], status, evidence?, reason?, owner?}`). `status` ∈ `PASSOU|FALHOU|BLOQUEADO_POR_DADO|BLOQUEADO_POR_DECISAO|ERRO_DE_FONTE|NAO_LOCALIZADO`. Non-`PASSOU` requires `reason`+`owner`. `PASSOU` requires HTTPS `evidence` links: always `test`; `ui` kind also needs `desktop`+`mobile`; `write` kind also needs `action`+`readback`; `access`/`contract`/`payment`/`publication` kinds also need `flow`. The check fails (exit 1) whenever `errors.length || pending.length` — i.e. it only goes green when **every** criterion is `PASSOU` with real evidence. This is by design (human sign-off required), confirmed by PR #222's own reference example also being intentionally left non-green.

**Also failing identically and unrelatedly:** a `reservation-sync` commit status reading "2 divergências, 0 pendências" recurs on PR #212 and (before the evidence matrix was added) #215 — confirmed pre-existing/unrelated to this session's work by checking it also fires on old, untouched PRs.

## 9. People, terms & names

- **People:** Tatiana Tosi — "a Proprietária" (the Owner), the user, decision-maker for anything needing production authorization, human UI verification, or schema decisions.
- **Terms & nicknames:** "Desk V4" = internal admin tool. "App Cliente" = client-facing portal (web+mobile, one codebase). "Caso 360" = the case-detail mega-route (`casos.$caseId.index.tsx`). "COMPROVADO_EM_USO" = the project's standing rule that nothing is marked done/archived without the Proprietária's authenticated proof. "reservation-sync"/"guard" = the CI check enforcing the PR evidence matrix.
- **Names in use:** `communication_queue` (DB table), `painelAtendimento`/`aprovarRascunhoComunicacao`/`arquivarRascunhoComunicacao` (new/touched server functions), `AtendimentoInterno` (component), `buscaAtendimento` (search-param validator), `MatrizQuadrantes` (a11y-fixed shared chart component in `src/components/prancha-v4/kit.tsx`).

## 10. Work state

| Item                                   | Status                                                                   | Version / location                                                                        | Notes                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| a11y fix                               | Done, merged                                                             | PR #214                                                                                   | `MatrizQuadrantes` points now real `<button>`s                                                       |
| Stale-test fix                         | Done, merged                                                             | PR #215                                                                                   | `robots` meta assertion updated                                                                      |
| Performance fix                        | Done, merged                                                             | PR #216                                                                                   | ~11 ungated queries in Caso 360 gated by section                                                     |
| Frontend any-cleanup fase 1            | Done, merged                                                             | PR #218                                                                                   | 8/210 files; 202 remain for future phases                                                            |
| UX fix (communication_queue approval)  | Code done, evidence matrix posted, 3 criteria pending human verification | PR #217, head `fec4de30`                                                                  | Not mergeable until Proprietária verifies UI/write/deep-link in a real session, or decides otherwise |
| Drizzle journal proposal               | Written, awaiting decision                                               | `00_governanca/PROPOSTA-JOURNAL-DRIZZLE-2026-11-01.md`                                    | Not executed — Proprietária's call                                                                   |
| Master plan update                     | Done                                                                     | `docs/PLANO-TAREFAS-2026-10-31.md`, section "Q"                                           | Reflects all of the above                                                                            |
| Frontend any-cleanup fases 2+          | Not started                                                              | ~202 remaining files, including the `Sb = any` shared-type files (bigger, riskier change) | Future work                                                                                          |
| Structural god-module split (Caso 360) | Not started                                                              | `src/routes/_authenticated/casos.$caseId.index.tsx`, 5,171 lines                          | Flagged, not attempted — larger refactor                                                             |
| This handoff file                      | Done                                                                     | `/home/user/soul-ancestry/handoff-soul-ancestry.md`                                       | —                                                                                                    |

## 11. Next steps

1. **Next action:** Check PR #217's current state (`gh pr view 217` or the GitHub UI) — see if the Proprietária has verified the 3 pending criteria (PAINEL_UI, APROVAR_ARQUIVAR, DEEP_LINK) in a real Desk session, or decide how to proceed (she may choose to merge anyway as repo admin, bypassing the check, or provide the evidence).
2. If she provides evidence/screenshots: update PR #217's evidence-matrix JSON (`mcp__github__update_pull_request` on the body) to flip those criteria to `PASSOU` with the real links she provides, then attempt the merge again (`mcp__github__merge_pull_request`).
3. If she decides to merge without full evidence: that's her call as repo owner — Claude should not initiate a forced/admin merge on its own; wait for her explicit instruction.
4. Separately: the Drizzle proposal and the Frontend any-cleanup phase 2 remain open backlog items whenever she wants to pick them up — no urgency flagged.
5. Resolve the open question in section 12 (AGENTS.md vs CLAUDE.md) if it becomes relevant to any future edit — re-check whether `AGENTS.md` was intentionally deleted or just not visible in this session's context.

## 12. Open questions ⚠️

- `AGENTS.md` was the canonical, extensively-quoted project-instructions file for most of this session (menu rules, App Cliente scope, "vazio honesto," etc.). Partway through, a system message said "Instructions no longer present: /home/user/soul-ancestry/AGENTS.md" and introduced `CLAUDE.md` as replacing it, with `CLAUDE.md` itself saying "Read AGENTS.md before editing. Its rules are canonical; this file does not duplicate them" — which is contradictory if `AGENTS.md` no longer exists. **Candidate answers:** (a) `AGENTS.md` still exists in the repo and was just not re-attached to this session's context by the harness — check the repo directly; (b) it was genuinely deleted/renamed to `CLAUDE.md` and the file's own cross-reference is stale; (c) something else. Check the actual repo file listing before assuming either way.
- Whether the Supabase project ref seen in this session's CI logs (`zsxpdbhdvbuulwpepemd`) matches the Lovable Cloud project id noted earlier in the session (`1a628b61-ec68-454f-85e1-671d6f297370`) — these may be the same project under different identifiers, or the project may have changed; not reconciled.
- Whether PR #212 (CI: bun pin/cache/permissions) is still something the user wants merged — it was mentioned as "CI green, still in draft awaiting merge authorization" earlier in the session but never explicitly revisited.

## 13. Re-attach checklist

Nothing to attach — this file is self-contained and the repo (`tatianatosi/soul-ancestry`) is accessible by name to any session with GitHub access configured the same way.

---

<sub>Audit: 13/13 sections · 10 rules · 3 corrections · ~15 data points · secrets removed: none found · generated by active-memory</sub>
