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
| Radar interno Desk (p.15) | **4 eixos jornada** (`radar-eixos.ts`) + matriz carteira | sanitizers | `/qualidade` + prévia | Não confundir com App 6 dims |
| Radar App (mockup 17) | **6 dimensões** (`radar-seis-eixos.ts`) | publicações portal | App Radar | Elegibilidade ≠ parecer jurídico |
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

## Fatia 2026-09-12 — faces Desk 13–17 (chrome OKI)

| Face mockup | Rota viva | Chrome agora | Prévia DEMO |
|---|---|---|---|
| Checklist (p.13) | `/tarefas` (`EntidadeCrud`) | Cards/modais cream | `?face=checklist` |
| Validação Jurídica (p.14) | `/matriz-juridica` | `Secao` cream | `?face=juridica` |
| Radar Interno (p.15) | `/qualidade` | Painel + matriz cream; eixos cream | `?face=radar` |
| Alertas (p.16) | `/alertas` | Selects cream + `BadgeDesk` | `?face=alertas` |
| Biblioteca Mestre (p.17) | `/biblioteca` | Seções/chips cream/gold (sem `primary` genérico) | `?face=biblioteca` |

Prévia unificada: `/previa-desk-indicadores?face=visao|caso360|checklist|juridica|radar|alertas|biblioteca`.  
Prints: `docs/provas/2026-09-12-desk-faces-13-17/`.  
De-para p.13–17: **em prova visual** (não `COMPROVADO_EM_USO`). Sem tabela inventada; sem restaurar 8 grupos.


## Fatia 2026-09-12 — App Cliente fidelidade P1 (chrome cliente)

| Superfície | Gap | Runtime agora |
|---|---|---|
| Home chip | UUID/fonte no chrome | Só título + código humano; `data-*` para prova |
| Home progresso | Contagem sem barra | Barra gold proporcional a marcos publicados |
| Visibilidade | Pill/cartão em toda aba | Só em estados não liberados |
| Jornada links | Rótulos Fase/Entregas | “ver materiais / relatório / atualização” |
| Legado Premium | Sempre ligado | Só com publicação `legado` |
| Conta titular | Título do caso na demo | Nome da pessoa (`CLIENTE_DEMO_NOME` / `cliente.nome`) |
| Documentos vivo | Sem checklist | Checklist só com entregas/envios reais |
| Tipografia `marca.ts` | Comentário Inter | Corpo = Montserrat (já no CSS/`__root`) |

Prints: `docs/provas/2026-09-12-app-fidelidade-p1/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).

## Fatia 2026-09-12 — Radar + Árvore + comparativo marca

| Superfície | Gap | Runtime agora |
|---|---|---|
| Radar (App) | Teia sem chrome cream / empty state | Card cream + empty sem inventar %; rótulos com padding SVG |
| Árvore (App) | Bandas sem G1 gold / conectores | Canvas cream; G1 gold; conectores verticais; sem nomes inventados |
| Gate marca | Sem superfície única para dona | `/previa-comparativo-marca` — paleta OKI + checklist + atalhos + 3 perguntas |

Prints: `docs/provas/2026-09-12-radar-arvore-marca/`.  
De-para Radar/Árvore: **em prova visual** (não `COMPROVADO_EM_USO`).

## Fatia 2026-09-12 — App cream chrome P2 (coesão visual)

| Superfície | Gap | Runtime agora |
|---|---|---|
| Home / Jornada / Legado | Cards `bg-white` vs Radar/Árvore cream | Painéis `bg-cream/40–50` |
| Documentos / Conta | Blocos brancos SaaS | Checklist + 4 blocos Conta em cream |
| `PortalVazio` | Fundo branco | `bg-cream/50` dashed |
| Rotas profundas | H1 Entregas / Fase 01 / Fase 02 | Materiais / Relatório / Atualização (`COPY_TELAS`) |
| Gate marca | Checklist desatualizado | `/previa-comparativo-marca` marca cream P2 + rotas soft |

Prints: `docs/provas/2026-09-12-app-cream-chrome/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).

## Fatia 2026-09-12 — Desk Pessoas OKI (grupo vivo)

| Superfície | Gap | Runtime agora |
|---|---|---|
| `/clientes` | Tokens `primary`/`muted`/`card` | Navy/cream/gold (etiquetas, CTA, modais, tabela) |
| `/biblioteca` + mensagens | `text-primary` / `muted-foreground` | `text-navy` / `text-navy/65` |
| Prévia | Sem face Pessoas | `/previa-desk-indicadores?face=pessoas` (grupo Desk, não p.11–17) |

Prints: `docs/provas/2026-09-12-desk-pessoas-oki/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). `GRUPOS_DESK` permanece 6.


## Fatia 2026-09-12 — Desk Cadeia Jornada OKI

| Superfície | Gap | Runtime agora |
|---|---|---|
| `cadeia-jornada.tsx` / orquestração | Tokens `border-border` / `muted` / `card` | Cream/navy/gold |
| Governança modelos contratuais | `text-muted-foreground` | `text-navy/65` |
| Prévia | Sem face jornada | `/previa-desk-indicadores?face=jornada` (CadeiaJornada real, DEMO) |

Prints: `docs/provas/2026-09-12-desk-jornada-oki/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).


## Fatia 2026-09-12 — Caso 360 / Pessoa cream

| Superfície | Gap | Runtime agora |
|---|---|---|
| `/casos/$caseId` + `caso/*` | Cards `bg-white` SaaS | `bg-cream/40–50` |
| `/pessoas/$clienteId` | Seções brancas | Cream OKI |
| `portal/caso-detalhe` | Cards brancos | Cream (App deep) |
| Prévia p.12 | Só 4 KPIs | + próxima ação + bloqueio; grupo Pessoas & Casos ativo |
| Gate marca | Checklist parcial | Caso/Pessoa cream + cadeia jornada = ok |

Prints: `docs/provas/2026-09-12-caso360-cream/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).


## Fatia 2026-09-12 — Desk Comercial / Formalização / Pesquisa cream

| Superfície | Gap | Runtime agora |
|---|---|---|
| `/marketing`, `/leads` | Painéis `bg-white` SaaS | `bg-cream/40` OKI |
| `/financeiro`, `/contratos` | Cards brancos | Cream |
| `/pesquisa`, `/casos` (lista) | Cards/input brancos | Cream |
| Prévia | Sem faces de grupo | `?face=comercial\|formalizacao\|pesquisa` |
| Gate marca | Checklist parcial | Item cream Comercial/Formalização/Pesquisa = ok |

Prints: `docs/provas/2026-09-12-desk-comercial-formalizacao/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). `GRUPOS_DESK` permanece 6.


## Fatia 2026-09-12 — Mesa Discovery + CRM + módulo Pesquisa cream

| Superfície | Gap | Runtime agora |
|---|---|---|
| `/calls` (`PainelCalls`) | Cards `bg-white` SaaS | `bg-cream/40` + etapa ativa gold |
| `/conversao`, `/propostas`, `/crm-mestre` | Painéis brancos | Cream OKI |
| `painel-canonico` / `derivacao-jornada` | Cards brancos | Cream |
| `pesquisa/modulo` + `/pesquisa-modulo` | 14+ painéis brancos | Cream |
| Prévia `?face=comercial` | Só KPIs leads | + etapas Mesa + call DEMO |
| Prévia `?face=pesquisa` | Só KPIs | + abas módulo Fontes/Pessoas/Achados/Plano |
| Gate marca | Checklist | Mesa Discovery + módulo pesquisa = ok |

Prints: `docs/provas/2026-09-12-mesa-discovery-oki/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). `GRUPOS_DESK` permanece 6.


## Fatia 2026-09-12 — Painel Hoje + Governança/Contrato cream (p.11)

| Superfície | Gap | Runtime agora |
|---|---|---|
| `PainelDia` / `PainelDeskHoje` / top30 / catálogo | Cards `bg-white` | `bg-cream/40` |
| Manifesto governança + contrato-base | Painéis brancos | Cream |
| `/contratos/$id`, onboarding, biblioteca evidências | Cards brancos | Cream |
| `planejador-operacional` | Cards brancos | Cream |
| Prévia `?face=visao` | Só KPIs | + fila do dia + bloqueios cream |
| Gate marca | Checklist | Painel Hoje + governança/contrato = ok |

Prints: `docs/provas/2026-09-12-painel-hoje-oki/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). `GRUPOS_DESK` permanece 6.


## Fatia 2026-09-12 — App deep + Desk Governança cream

| Superfície | Gap | Runtime agora |
|---|---|---|
| Portal proposta / mensagens / faturas / docs chips | `bg-white` residual | `bg-cream/40` |
| Radar empty chip | `bg-white/70` | `bg-cream/70` |
| Atendimento interno / sessão demo | Painéis brancos | Cream |
| Integrações + prontidão + desk operacional | White / muted shadcn | Cream / navy |
| Equipe, acessos portal, decisões, inventário | Cards brancos | Cream |
| Pesquisa painel/fontes/plano + contrato leftovers | White | Cream |
| Prévia | Sem face governança | `?face=governanca` |
| Gate marca | Checklist | App deep + Governança = ok |

Prints: `docs/provas/2026-09-12-app-deep-governanca-oki/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). `GRUPOS_DESK` permanece 6.


## Fatia 2026-09-12 — Entregas + mapa mockup 17/47 no gate

| Superfície | Gap | Runtime agora |
|---|---|---|
| Entrega consultiva / modelo / fase 02 / studio | Cards `bg-white` | `bg-cream/40` |
| Módulos contextuais + assistente transversal Desk | White/80 | Cream |
| CRM WhatsApp / handoff / fluxo / próximas ações | White residual | Cream |
| Catálogo / homologação SKUs / escopo / config | White | Cream |
| Contrato leftovers (matriz, anexos, leitor) | White | Cream |
| Gate `/previa-comparativo-marca` | Sem mapa 17 | Mapa App 7 abas + Desk faces 11–17 + grupos; checklist + de-para 47 |
| Gate painéis | `bg-white/*` | Cream |

Prints: `docs/provas/2026-09-12-mapa-mockup-entregas-oki/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). Ordens 3–7 ainda bloqueadas.


## Fatia 2026-09-12 — fidelidade Radar 4≠6 + vocabulário 47 (p.13/16)

| Superfície | Gap | Runtime agora |
|---|---|---|
| Face Radar Desk | Dizia “4 eixos = cliente” (falso vs App 6 dims) | 4 eixos jornada Desk + faixa App 6 dims separada |
| De-para p.15 | Conflato 6 eixos | Desk 4 ≠ App 6 documentado |
| Face Checklist p.13 | Sem caso/responsável | Campos caso · responsável · prazo · bloqueio |
| Face Alertas p.16 | Sem caso | Coluna caso + criticidade + status |
| Rotas residuais nucleos/ops/importações/… | `bg-white` residual | Cream |
| Gate marca | Checklist | Itens Radar 4≠6 + vocabulário 47 |

Prints: `docs/provas/2026-09-12-fidelidade-radar-47/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).


## Fatia 2026-09-12 — fidelidade Jurídica/Biblioteca (p.14/17) + soft Fase 01

| Superfície | Gap | Runtime agora |
|---|---|---|
| Face Jurídica p.14 | Temas genéricos + “Escopo Fase 01”; sem responsável/versão | Temas canônicos `TEMAS_JURIDICOS` + status `STATUS_TEMA` · responsável · versão · bloqueia |
| Face Biblioteca p.17 | 5 chips curtos sem dimensões 47 | Subáreas canônicas + país · versão · vigência · responsável · status |
| Face Alertas p.16 | Caso sem responsável | Coluna responsável (vocabulário 47) |
| Gate marca | Checklist sem p.14/17 | Itens Jurídica sem Fase 01 + Biblioteca canônica |

Prints: `docs/provas/2026-09-12-fidelidade-juridica-biblioteca-47/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). Ordens 3–7 ainda bloqueadas até marca/layout + merge.


## Fatia 2026-09-12 — Visão/Caso360 + mapa 17/47 densificado + cream Home

| Superfície | Gap | Runtime agora |
|---|---|---|
| Face Visão p.11 | Header genérico | Vocabulário 47: fila · vencidas · responsável · exceções · SLA |
| Face Caso 360 p.12 | Sem barra de caso/código | Caso · código · responsável · fase + 4 eixos + próxima ação/bloqueio |
| App Home | Gradiente `to-white` residual | `bg-cream/50` puro |
| Prévia caseId | Banner `bg-white` | `bg-cream/60` |
| Gate marca | Mapa só com links | Mapa com vocabulário 47 por página App+Desk |

Prints: `docs/provas/2026-09-12-fidelidade-visao-caso360-mapa47/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`). Ordens 3–7 ainda bloqueadas.


## Fatia 2026-09-12 — Formalização cream + rotas profundas soft

| Superfície | Gap | Runtime agora |
|---|---|---|
| Componentes contrato/governança/catálogo | `bg-white` residual | `bg-cream/40–50` |
| Face Formalização | Só KPI genérico | Tabela caso·contrato·status·responsável·próximo passo |
| Meta/empty Fase 01/02 | Copy com “Fase 01/02” | Relatório / Atualização (sem H1 Fase) |
| Gate | Sem checklist formalização/profundas | Itens + atalhos Materiais/Relatório/Atualização |

Prints: `docs/provas/2026-09-12-fidelidade-formalizacao-profundas-47/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).


## Fatia 2026-09-12 — Painel abertura cream + Pesquisa 47 + pack mobile 7 abas

| Superfície | Gap | Runtime agora |
|---|---|---|
| `AberturaPainel` (live `/painel`) | Gradiente `to-white` | `bg-cream/50` |
| `RelatorioVisual` | Cards `bg-white` | `bg-cream/40` |
| Face Visão p.11 | Só KPIs | + bloco saudação/fila (espelha abertura live) |
| Face Pesquisa | Lista curta | Tabela fonte·pessoa·status·camada·caso |
| App mobile | Pack visual incompleto | Prints das 7 abas com bottom nav cream |
| Gate | Checklist | Itens Painel cream + Pesquisa 47 |

Prints: `docs/provas/2026-09-12-fidelidade-painel-pesquisa-mobile-47/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).


## Fatia 2026-09-12 — Pessoas/Comercial/Governança vocab 47 + Canvas/equipe cream

| Superfície | Gap | Runtime agora |
|---|---|---|
| Face Pessoas | Só nome/camada/status | + caso · próxima ação · responsável |
| Face Comercial | Lead/origem/ação | + etapa · caso · responsável |
| Face Governança | KPIs prontidão | + tabela decisões (escopo/caso) |
| Canvas cliente (`canvas.$token`) | Cards `bg-white` | `bg-cream/50` |
| Equipe auth (entrar/senha/diagnóstico) | Inputs/cards brancos | cream OKI |
| Gate | Checklist | Item Canvas + vocab 47 Pessoas/Comercial/Governança |

Prints: `docs/provas/2026-09-12-fidelidade-pessoas-comercial-canvas-47/`.  
Status: **em prova visual** (não `COMPROVADO_EM_USO`).

## Gate

Print → aprovação de **marca/layout** (separada do conteúdo Ordem 1) → merge produção só com **sim** explícito (branch + SHA).

Perguntas abertas (dona):

1. **Aprova marca/layout?**
2. **Aprova Ordem 2 caseId para merge?**
3. Produção: **sim** + branch + SHA?
