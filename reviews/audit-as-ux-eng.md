# UX Audit: Clube Ancestral (soul-ancestry)

**Perspective**: UX Engineer
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)

## Plan Summary

Internal Desk (staff) tool over `crm_casos` plus a client-facing portal. Traced three representative journeys end-to-end: opening/reusing a contract from Caso 360, sending a contract draft to the client, and how a database-level refusal reaches the user.

## User Journey Map

### Journey 1 — "Abrir contrato (rascunho)" from Caso 360

| Step                       | What happens                                                                            | Status                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Trigger                    | Staff clicks "Abrir contrato (rascunho)" button, `casos.$caseId.index.tsx:3733`         | OK                                                                                                              |
| Action                     | `mAbrirContrato.mutate()` → button label switches to "Abrindo…", disabled while pending | OK                                                                                                              |
| Feedback (success, new)    | Toast: "Contrato rascunho criado."                                                      | OK                                                                                                              |
| Feedback (success, reused) | Toast: "Contrato existente reaberto — nada duplicado."                                  | OK — explicitly tells the user nothing was duplicated, preventing the "did I just create a second one?" anxiety |
| Feedback (error)           | Toast with the server's (translated) error message                                      | OK                                                                                                              |
| Outcome                    | Auto-navigates to `/contratos/$id` with the real id                                     | OK                                                                                                              |

### Journey 2 — "Enviar ao cliente" (contract draft to communication queue)

| Step                                                                        | What happens                                                                                                                                       | Status                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Trigger                                                                     | Staff clicks "Enviar ao cliente" on the contract screen, `contratos.$id.tsx:414`                                                                   | OK                                                  |
| Pre-action disclosure                                                       | Button's `efeito` text: "Cria um rascunho de envio na fila de comunicações do caso, aguardando sua aprovação — nenhum e-mail sai automaticamente." | OK — sets the correct mental model before the click |
| Action                                                                      | Server creates a row in `communication_queue` (`status: awaiting_approval`), logs event + timeline                                                 | OK (server side)                                    |
| Feedback                                                                    | Presumably a toast confirming the draft was queued (not independently re-verified in this pass)                                                    | WARN                                                |
| **Where does the user go to find, review, or approve the draft afterward?** | **No screen in the entire `src` tree reads `communication_queue`.** Zero `.tsx` matches.                                                           | **FAIL**                                            |
| Outcome                                                                     | The draft exists in the database, permanently, with no UI path back to it                                                                          | **FAIL — dead end**                                 |

### Journey 3 — A blocked write reaches the user

| Step        | What happens                                                                                                                                        | Status                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Trigger     | Any mutation hits a Postgres trigger that raises an exception (692+ such gates, per the repo's own audit docs)                                      | OK                                                                                              |
| Translation | `exigirLinhaGravada` → `traduzirRecusa` (single choke point in `persistencia.server.ts`) rewrites the raw Postgres message into actionable guidance | OK — confirmed centralized, not ad hoc per screen                                               |
| Feedback    | Relies on each call site's `onError: (e) => toast.error(e.message)` pattern (confirmed present on the Journey 1 mutation)                           | WARN — not verified across all mutations in this pass; depends on every screen wiring `onError` |

## Verdict: APPROVE WITH CHANGES

The two journeys that are fully wired (contract reuse, error translation) are genuinely well done — explicit non-duplication messaging and a single translation choke point are exactly right. The one that isn't wired (sending a contract draft) is a real dead end: the product's own PR description for that feature claimed it would be visible in Caso 360, and it isn't. A staff member who clicks "Enviar ao cliente" has no way to find that draft again to approve it, short of going directly into the database.

## Critical Issues (Must Fix)

| #   | Issue                                                                                                                                                           | Step in Journey        | Impact on User                                                                                                                                                                                                                   | Fix                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `communication_queue` rows (contract-send drafts, `requires_human_approval: true`) are created by `tentarEtapaExterna` but read by zero `.tsx` files in the app | Journey 2, post-action | Staff creates a pending approval they can never find again in the UI; the only way to act on it is a direct database query. Functionally, "Enviar ao cliente" is a one-way action with no second step reachable from the product | Add a list/panel (Caso 360 or a dedicated "Fila de comunicações" screen) that reads `communication_queue` filtered by case, with an approve/reject action. This was claimed as already working in the #205 PR description — it isn't |

## Recommendations

| #   | Issue                                                                                                                    | Impact                                                                                                                                                     | Fix                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Journey 2's post-click toast/confirmation wasn't independently re-verified beyond the button's pre-click `efeito` text   | Minor — if the toast is missing or generic, staff get disclosure before the click but no explicit confirmation after                                       | Confirm (or add) a toast on `tentarEtapaExterna` success distinct from generic mutation success, naming what was queued                                            |
| 2   | `onError: (e) => toast.error(e.message)` is confirmed on one mutation (contract open/reuse) but not verified system-wide | If some mutations lack an `onError` handler, the translated Postgres message (Journey 3) never reaches the user despite the server-side work being correct | Worth a systematic grep across `useMutation` call sites for missing `onError` as a follow-up audit (Production Readiness lens, later in this pass, may cover this) |

## Nice-to-Haves

| #   | Suggestion                                                                                                                                    | Rationale                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Surface `contract_review_events` (already logged on draft creation) as a visible timeline entry even before the dedicated queue screen exists | Cheaper interim fix for finding #1 if the full approval UI takes longer to build — at least makes the pending state discoverable |

## Interaction Consistency Check

Journey 1's pattern (button → pending label → distinct success/error toasts → navigate) is a strong, consistent template. Journey 2 breaks from it not in the click itself but in what happens _after_: every other write-then-navigate-or-surface pattern in this codebase eventually shows the user the thing they created (the new contract, the new instrument). The communication-queue draft is the one write that currently goes nowhere visible.

## Verdict Details

- Discoverability: **CONCERNS** (the draft, once created, is not discoverable again)
- Flow Completeness: **CONCERNS** (Journey 2 has no second step)
- Error Recovery: **PASS** (centralized translation, confirmed toast wiring on at least one real mutation)
- Feedback & Status: **PASS** on the pre-click and immediate-click feedback; **CONCERNS** on anything after the first screen
- Consistency: **CONCERNS** (Journey 2 is the outlier against an otherwise consistent "show me what I made" pattern)
