# Adendo — Marca oficial, site institucional e SEO (2026-09-11)

- Status: vigente (decisão da proprietária)
- Complementa: Guia de Marca 8 páginas; `.cursor/rules/clube-ancestral-core.mdc`

## Site vs app

| Superfície | URL | Papel |
|---|---|---|
| Site institucional | https://clubeancestral.com.br/ | Marketing, conteúdo, **SEO** |
| Produto Desk + App Cliente | Vercel (`*.vercel.app` / previews do `soul-ancestry`) | Operação autenticada |

**Proibido** (risco de perda de SEO):

- Adicionar `clubeancestral.com.br` (ou www) como domínio de produção do projeto Vercel do app.
- Redirect 301/302 do site para o Desk/portal.
- Substituir o conteúdo indexado do site pelo monorepo operacional.

O app **cita** a URL institucional (contratos, perfil) — não a hospeda.

## Marca

- Guia: `docs/evolucao/recuperados/marca-oficial-2026-09-11/` (PDF = mesmo hash `e85bcf91…` do Guia já arquivado).
- Logos: `public/marca/logo-variante-{1,2,3}.svg` + alias `public/clube-ancestral-logo.svg` (bytes = variante 1).
- Tokens: `src/lib/marca.ts` (`SITE_OFICIAL`, `MARCA_LOGOS`, `MARCA_CORES`).
- UI logo: apenas `<BrandLogo />` / `BRAND_LOGO_URL`.
- Tipografia do guia (Amolina + Montserrat) ≠ runtime atual (Cormorant + Inter) — troca só com ordem explícita.
