# Marca oficial — pacote 2026-09-11

## Conteúdo

| Arquivo | Papel |
|---|---|
| `CA-MARCA-Guia-Apresentacao-8-paginas.pdf` | Guia de Marca (8 páginas). Mesmo SHA256 do já arquivado `CA-MARCA_Guia_de_Marca_Oficial.pdf` (`e85bcf91…`). |
| `logos/logo-variante-1.svg` … `3.svg` | Três variantes oficiais do logotipo (zip `logotipo-clube`). |

Cópia runtime em `public/marca/` para o app servir os SVGs.

## Presença digital (SEO)

- **Site institucional:** https://clubeancestral.com.br/ — marketing/SEO. **Não** apontar para o projeto Vercel do Desk/portal; **não** redirect apex→app.
- **Produto (Desk + App Cliente):** Vercel (`*.vercel.app` / previews). Cita o site só como URL institucional.

## Norma de uso

- Paleta e tokens: `src/lib/marca.ts` + `src/styles.css`.
- Sem logo improvisado nem paleta paralela.
- Tipografia do guia impresso (Amolina + Montserrat) diverge do app atual (Cormorant + Inter) — troca tipográfica **fora** desta fatia.

Destilado: `docs/politicas/ADENDO-MARCA-SITE-SEO-2026-09-11.md` e `.cursor/rules/clube-ancestral-core.mdc`.
