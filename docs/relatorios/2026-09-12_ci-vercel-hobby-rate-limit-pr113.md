# Nota CI — Vercel Hobby rate limit (PR #113)

**Data:** 2026-09-12  
**Check:** `Vercel` → `Deployment rate limited — retry in 24 hours` (`upgradeToPro=build-rate-limit`)  
**Plano:** Hobby (`tati-6134s-projects`)

## Causa raiz

Não é falha de build/código. O GitHub App da Vercel recusou **criar** o deployment desta branch por limite de builds do plano Hobby. Labeler passou; Supabase Preview skipped. A PR é documental (sync/SKU/nav).

Outras branches (ex.: PR #122) consumiram dezenas de deploys READY no mesmo dia — pressão sobre a cota Hobby.

## O que não corrige sozinho

- Re-push / merge `main` (já tentado em `00da671a`) — o status volta vermelho no ato.
- Alterar markdown da sync — não há erro de TypeScript/teste no check.

## Mitigação no repo

`vercel.json` com `ignoreCommand`: pula build quando o commit não toca `src/`, locks, Vite/tsconfig, `supabase/` nem o próprio `vercel.json`. Assim commits só-docs não queimam cota quando o limite aliviar.

## Desbloqueio (decisão da proprietária)

1. **Esperar** a janela de 24h do Hobby e deixar um push leve (ou o skip do `ignoreCommand`) esverdear o check; ou  
2. **Upgrade Pro** na Vercel (cobrança — só com ordem explícita); ou  
3. **Mesclar com override** se a política do repo permitir (PR mergeable; conteúdo = docs).
