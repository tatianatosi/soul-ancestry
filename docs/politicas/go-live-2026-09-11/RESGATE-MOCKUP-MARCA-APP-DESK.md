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

## Fatia 2026-09-12 — fidelidade visual App (em curso)

Chrome OKI aplicado (nav cream, ícone Home, filete gold). Ajustes desta fatia:

| Aba | Mockup 17 | Runtime agora |
|---|---|---|
| Home | Painel + achados | Sem grade de atalhos; canvas cream |
| Jornada | 1820–2024 + feed | Eixo editorial 1820–2024 + cards de publicação |
| Radar | 6 eixos | Mantido (`RadarSeisEixos`) |
| Árvore | G1–G5 | Chrome G1–G5 + notas publicadas (`painelArvoreGeracoes`) |
| Documentos | Checklist / upload | Checklist visual na prévia + listas reais |
| Legado | Biblioteca + premium | Chip Premium + publicações `legado` |
| Conta | Perfil / plano / alertas / histórico | Quatro blocos canônicos |

Desk: header cream (sem restaurar sidebar Lovable; `GRUPOS_DESK` = 6).

## De-para backend contínuo (Ordens 3+ — páginas 17/47)

| Página mockup / indicador 47 | Entidade runtime | Escritor / RPC | Consumidor UI | Próxima fatia |
|---|---|---|---|---|
| Desk Visão Geral (p.11) + KPIs 47 | `crm_casos` + `proxima_acao_prioritaria` | RPC lote | `/painel` + `/previa-desk-indicadores` | Chrome/rótulos alinhados; prova visual nesta fatia |
| Caso 360 (p.12) | `crm_casos`, `case_plans`, `case_members` | `case_plans` + writers do planejador | Ficha caso + prévia | Quatro cards: Jornada · Pessoas · Contrato · Pesquisa |
| Checklist / docs (p.13) | `documents`, `evidences` | writers docs | Desk + App Documentos | Upload real + checklist vivo |
| Validação jurídica (p.14) | `evidences.workflow_status` (CHECK) | workflow evidence | Desk pesquisa | Sem inventar status |
| Radar interno (p.15) | radar 6 eixos + `research_cases` / `research_people` / `research_sources` | sanitizers | Desk + App Radar | Mesma identidade de eixos |
| Alertas (p.16) | `case_alerts`, timeline | alert writers | Desk Alertas / Conta | Sem mock permanente |
| Biblioteca mestre (p.17) | `legado` via `app_projections` | publish portal | App Legado | Premium só com publicação |

Regra: nenhuma Ordem 3–7 avança sem linha nesta tabela + print da fatia.


## Fatia 2026-09-12 — indicadores Desk (p.11–12 / 47)

| Superfície | Mockup 47 | Runtime agora |
|---|---|---|
| Visão Geral `/painel` | KPIs decisão do dia | Chrome cream nos `CardIndicador`; rótulos **Ações vencidas** / **Ações para hoje**; SLA continua “sem dados” se fonte não carrega |
| Caso 360 | 4 indicadores | Terceiro card **Contrato** (antes Comercial/formalização); cards em cream |
| Prévia pública | — | `/previa-desk-indicadores` (DEMO) + prints em `docs/provas/2026-09-12-desk-indicadores/` |

De-para p.11–12: status **em prova visual** (não `COMPROVADO_EM_USO`). `GRUPOS_DESK` permanece 6.

## Gate

Print → aprovação de **marca/layout** (separada do conteúdo Ordem 1) → merge produção só com **sim** explícito (branch + SHA).
