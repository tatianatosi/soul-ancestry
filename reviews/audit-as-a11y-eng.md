# Accessibility Audit: Clube Ancestral (soul-ancestry)

**Perspective**: Accessibility Engineer
**Date**: 2026-11-01
**Mode**: General Repo Health (no specific diff)

## Plan Summary

Overall surface is small and mostly well-handled: icon-only buttons are rare (4 files) and every one sampled has a correct `aria-label`; shared state components (`EstadoDados`) already use `role="status"`/`role="alert"` consistently. One real, concrete keyboard-access gap was found in a custom matrix widget.

## Files Reviewed

| File                                                  | A11y Role                                          | Risk                               |
| ----------------------------------------------------- | -------------------------------------------------- | ---------------------------------- |
| `src/components/ui/button.tsx`                        | Button primitive, `focus-visible` ring             | Low                                |
| `src/components/portal/genograma-familiar.tsx`        | Zoom/pan controls on the client family-tree widget | Low (sampled controls all labeled) |
| `src/components/qualidade/radar-matrizes-prancha.tsx` | Clickable matrix cells via event delegation        | **High**                           |
| `src/components/saas/estado-dados.tsx`                | Shared loading/error/empty wrapper                 | Low                                |
| `src/components/portal/bloco-exemplo-visual.tsx`      | Disabled example/demo controls                     | Low                                |

## Verdict: APPROVE WITH CHANGES

## Critical Issues (Must Fix)

| #   | Issue                                                                                                                                                                                                                                                | WCAG Criterion               | File(s)                                                                                        | Impact                                                                                                                                                                                                                                                                                                                                     | Fix                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Matrix cells (`span[title]` elements inside a `<div onClick={cliqueNaMatriz}>` using event-delegation) are the actual interactive targets (styled `cursor-pointer`), but have no `tabIndex`, `role="button"`, or `onKeyDown` handler anywhere nearby | **2.1.1 Keyboard** (Level A) | `src/components/qualidade/radar-matrizes-prancha.tsx:247` and the cell-rendering code above it | A keyboard-only or screen-reader user cannot activate any individual matrix cell — the interaction is mouse-only. This is the one of only two `<div onClick>` patterns in the entire codebase (the other, in `entrega-consultiva.tsx`, is a correct `stopPropagation` guard on a modal, not an interactive target, and is not a violation) | Give each clickable cell `tabIndex={0}`, `role="button"`, an `aria-label` describing what clicking it does, and an `onKeyDown` handler for Enter/Space — or, simpler, render each as an actual `<button>` styled to match, which gets focus/keyboard/role for free |

## Recommendations

| #   | Issue                                                                                                                                                                           | WCAG Criterion               | Fix                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Color contrast was not computed this pass (would require rendering + a contrast-measurement tool against the actual computed `oklch`/hex token pairs in both the default theme) | **1.4.3 Contrast (Minimum)** | Worth a dedicated pass with an actual contrast checker against the token pairs in `styles.css` (e.g. `--terracotta` text on `--cream` backgrounds, `--gold` on `--navy`) rather than guessing — flagging the gap honestly rather than asserting pass or fail without evidence |

## Nice-to-Haves

| #   | Suggestion                                                                                                                                      | Rationale |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | None beyond the above — the small interactive surface sampled (genogram zoom controls, button primitive, shared state wrapper) is in good shape |

## Keyboard Navigation Walkthrough

| Step | Action                                                                                  | Expected Focus                                                                                                            | Expected Announcement                                                                                                                                                                                 | Plan Handles?                                                           |
| ---- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1    | Tab to the family-tree zoom controls (`genograma-familiar.tsx`)                         | Each button receives visible focus ring (inherited from `Button` primitive's `focus-visible:ring-1`)                      | "Diminuir árvore, button" / "Ampliar árvore, button" / "Restaurar visão da árvore, button"                                                                                                            | **Yes** — all three sampled controls have both `title` and `aria-label` |
| 2    | Tab toward a Radar/Matrizes cell and try Enter/Space                                    | Focus never lands on an individual cell — only the parent `role="group"` container is in the accessibility tree as a unit | Nothing — the cell-level interaction is invisible to keyboard/AT users                                                                                                                                | **No** — Critical #1                                                    |
| 3    | Trigger a toast (e.g., contract-open success/error, confirmed pattern from the UX lens) | n/a (toast, not focus-based)                                                                                              | Depends on the toast library's own `aria-live` wiring — not independently re-verified this pass (the project's toast calls were confirmed functionally, not re-audited for `aria-live` region config) | Not verified — flagging as unconfirmed, not failing it without evidence |

## ARIA Checklist

| Element                                    | Role                             | Label                                                   | States                                                                       | Keyboard                                                        | Notes                  |
| ------------------------------------------ | -------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------- |
| `Button` (icon variant, sampled instances) | implicit `button`                | `aria-label` present in all 4 sampled icon-button files | `disabled` via native attribute (confirmed `disabled={zoom <= 0.3}` pattern) | Native button — full keyboard support                           | PASS                   |
| `EstadoDados` loading state                | `role="status"`                  | Text content ("Carregando {recurso}…")                  | n/a                                                                          | n/a (not interactive)                                           | PASS                   |
| `EstadoDados` error state                  | `role="alert"`                   | Text content, app-vs-desk message split                 | n/a                                                                          | Has "Tentar novamente" button when `aoTentarNovamente` provided | PASS                   |
| Radar/Matrizes group                       | `role="group"` with `aria-label` | Group-level only                                        | n/a                                                                          | **Individual cells: none**                                      | **FAIL** (Critical #1) |

## Verdict Details

- Screen Reader Compatibility: **CONCERNS** (the matrix group announces as a labeled group, but its individual interactive cells are invisible to the accessibility tree)
- Keyboard Navigation: **CONCERNS** (Critical #1 is the one confirmed gap in an otherwise small, clean interactive surface)
- Focus Management: **PASS** (sampled controls all have `focus-visible` styling via the shared `Button` primitive; no custom modal/overlay focus-trap logic was found to audit beyond the one correctly-implemented `stopPropagation` guard)
- Color Contrast: **Not computed** (Recommendation #1 — honest gap, not asserted either way)
- Motion Sensitivity: **PASS** (cross-referenced with the Design Engineer lens: the one keyframe animation found respects `prefers-reduced-motion` via a global override, and `portal-v11.css` has dedicated reduced-motion blocks)
