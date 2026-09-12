# Resgate mockup 17/47 + guia de marca — App Cliente e Desk

**Data:** 2026-09-12  
**Decisão da proprietária:** conteúdo mobile/desktop da Ordem 1 **aprovado**; marca/layout/Pantone/taxonomia/UX **ainda não** — resgatar sob o guia oficial.  
**Guia enviado (execução):** `docs/evolucao/recuperados/marca-oficial-2026-09-11/Apresentacao-Clube-Ancestral-OKI.pdf` (8 páginas; hex extraídos p.4).

## Fontes normativas (não redesenhar navegação)

| Fonte | Papel |
|---|---|
| Mockup **17 páginas** | Contrato visual App (7 telas) + Desk face (7 telas históricas) |
| Auditoria **47 páginas** | Conteúdo, estados, indicadores — **junto** com o de 17 |
| Guia de Marca OKI (8 pág.) | Cor, logo, tipografia declarada — tokens em `src/lib/marca.ts` / `src/styles.css` |
| Taxonomia canônica | App: Home → Jornada → Radar → Árvore → Documentos → Legado → Conta |
| Menu Desk vigente | **6 grupos** em `GRUPOS_DESK` (face 7 do mockup = contexto ativo até `COMPROVADO_EM_USO`) |

## Paleta oficial (hex do guia OKI p.4 = runtime)

| Papel | Hex | Token |
|---|---|---|
| Navy | `#2F4B6E` | `--navy` / `MARCA_CORES.azul` |
| Preto | `#101010` | `--preto` / `MARCA_CORES.preto` |
| Cream | `#ECDFCD` | `--cream` / `MARCA_CORES.creme` |
| Gold | `#FCB73A` | `--gold` / `MARCA_CORES.dourado` |
| Terracotta | `#9A3A2F` | `--terracotta` / `MARCA_CORES.terracota` |

Pantone/CMYK do PDF = impressão. Produto usa **somente** estes hex. Tipografia do guia: **Montserrat** (funcional) + decorativa no logo — app hoje usa Cormorant + Inter (dívida tipográfica documentada; troca só com ordem explícita).

## App Cliente — de-para mockup 17 (páginas 3–9)

| Aba | Descrição mockup | Runtime |
|---|---|---|
| Home | Painel do caso, progresso e achados recentes | `/portal` + `COPY_TELAS.home` |
| Jornada | Linha do tempo ancestral 1820–2024 | `/portal/jornada` |
| Radar | Radar de elegibilidade em 6 eixos | `/portal/radar` |
| Árvore | Árvore genealógica G1–G5 | `/portal/arvore` |
| Documentos | Upload, checklist e entregas do caso | `/portal/documentos` |
| Legado | Biblioteca de conteúdo e nível premium | `/portal/legado` |
| Conta | Perfil, plano, alertas e histórico | `/portal/conta` |

Layout alvo: header navy + wordmark gold, canvas cream, bottom nav mobile, full-bleed em `/previa-app-cliente`. Entregas/Fase 01/02 **fora** da barra.

## Desk — face mockup vs runtime

Mockup Desk (págs. 11–17): Visão Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno, Alertas, Biblioteca Mestre.  
Runtime: 6 grupos (`GRUPOS_DESK`). Chrome visual: sidebar navy, item ativo gold, canvas cream — **sem** restaurar sidebar Lovable de 14 itens.

## Regra permanente de fatia

```text
mockup 17/47 + guia OKI → de-para → código → print → "Aprova marca/layout?" / "Aprova merge?"
```

Backend (Caso 360, CRM, contrato, financeiro, radar) só avança com linha de de-para para página 17/47 + indicador.

## Site SEO ≠ app

`https://clubeancestral.com.br/` institucional. Produto em Vercel. Não apontar domínio SEO ao app.

## Gate

Print → aprovação de **marca/layout** (separada do conteúdo Ordem 1) → merge produção só com **sim** explícito (branch + SHA).
