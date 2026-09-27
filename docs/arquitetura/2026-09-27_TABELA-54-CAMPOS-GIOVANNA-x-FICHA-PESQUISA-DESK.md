# Tabela dos 54 campos — Ficha Piloto Giovanna × Ficha de Pesquisa Genealógica do Desk

```yaml
data: 2026-09-27
fontes:
  - docs/arquitetura/PESSOA-CANONICA-FICHA-PILOTO-GIOVANNA-PRADE-2026-09-02.md (a ficha, 54 campos)
  - docs/arquitetura/2026-09-27_REVERIFICACAO-ADVERSARIAL-FICHA-GIOVANNA.md (veredito por campo, arquivo:linha)
  - docs/arquitetura/FICHA-PESQUISA-GENEALOGICA-CANONICA.md (hub de pesquisa do Desk)
prova: estática (código). Não comprovado em uso — falta a sessão autenticada da Proprietária.
```

Legenda do veredito: **CR** = conectado de verdade · **SD** = substituído por regra escrita ·
**GC** = gap corrigido em 27/09 · **GP** = gap que depende de decisão (fechado pelo Corte 2/3
do plano de 27/09 quando indicado).

Rotas do Desk usadas na tabela:

- **Ficha genealógica (G-02)** `/pessoas-linhagens/$caseId`. Abas: Perfil 360° · Árvore interna ·
  Linha do tempo · Relações · Variantes · Linhagens · Eventos · Módulos históricos ·
  Lacunas · Projeção ao cliente. A aba Projeção ao cliente é só uma prévia e não publica.
- **Hub de pesquisa** `/pesquisa-evidencias/$caseId`.
- **Achados** `/achados/$caseId`.
- **Publicações para o App** `/biblioteca-evidencias/$caseId`. Grava em `app_projections` e
  publica por tipo: `achado`, `arvore`, `linha_tempo`, `marco`, `resumo`, `atualizacao`,
  `legado`, `relatorio_fase`.
- **Atendimento** `/atendimento`: solicitações de documento e avisos.
- **Caso 360** `/casos/$caseId`. Seções: Visão · Jornada · Pessoas e família · Pesquisa ·
  Documentos · Formalização · Financeiro · Histórico.
- **Pessoa 360** `/pessoas/$clienteId`.

| # | ID do campo | O que é | Aba no App | Onde a equipe grava no Desk | Tabela.coluna | Veredito |
|---|---|---|---|---|---|---|
| 1 | giovanna.geral.01 | ID do caso | — (nunca no App) | Caso 360 › Visão | `crm_casos.codigo` | SD |
| 2 | giovanna.geral.02 | Nome do caso | Home (título) | Caso 360 › Visão | `crm_casos.titulo` → `portal_casos.titulo` | CR |
| 3 | giovanna.geral.03 | Nome do cliente | Conta (Perfil) | Pessoa 360 | `clientes.nome` → `portal_meu_cadastro.nome` | CR |
| 4 | giovanna.geral.04 | Status do caso | Home | Caso 360 › Visão | `crm_casos.status` → `portal_casos.status` | CR |
| 5 | giovanna.home.05 | Rota provável (país) | Conta ("Origem de interesse") | Pessoa 360 / Mesa Discovery | `clientes.pais_interesse` | CR |
| 6 | giovanna.home.06 | Documento foco | Documentos › Solicitados + link na Home | `/atendimento` (solicitar documento) | `portal_document_requests.titulo` | GC |
| 7 | giovanna.home.07 | Etapa atual | Home, Jornada | Caso 360 › Jornada (Planejador) | `case_plans.fase_jornada` → `portal_casos` | CR |
| 8 | giovanna.home.08 | Resumo do caso | Home (Achados), Jornada | `/biblioteca-evidencias/$caseId` tipo `resumo` | `app_projections` (`resumo`) | SD |
| 9 | giovanna.home.09 | Hipótese principal | — (proibido no App) | Hub › Dimensões da pesquisa; `/pesquisa-modulo/$id` › Hipóteses | `research_cases.internal_hypothesis` / `research_case_hypotheses` | SD |
| 10 | giovanna.home.10 | Trilha origem | Jornada (se publicada) | `/biblioteca-evidencias` (`resumo`/`linha_tempo`) | `app_projections` | SD |
| 11 | giovanna.home.11 | Trilha cidadania | Jornada (se publicada) | idem | `app_projections` | SD |
| 12 | giovanna.home.12 | Trilha memória | Jornada/Legado (se publicada) | idem | `app_projections` | SD |
| 13 | giovanna.home.13 | País 1 | Conta; Radar | Pessoa 360; Caso 360 › Visão (trilha) | `clientes.pais_interesse`, `citizenship_tracks.pais` | CR |
| 14 | giovanna.home.14 | Aderência país 1 (%) | — (percentual proibido) | — | — | SD |
| 15 | giovanna.home.15 | País 2 | — | — | — | SD |
| 16 | giovanna.home.16 | Aderência país 2 | — | — | — | SD |
| 17 | giovanna.home.17 | País 3 | — | — | — | SD |
| 18 | giovanna.home.18 | Aderência país 3 | — | — | — | SD |
| 19 | giovanna.home.19 | Pessoa central 1 (nome + vínculo) | Árvore | G-02 › Perfil 360° (`client_visibility = aprovada`) → publicar na árvore | `genealogical_person_profiles` → `app_projections.pessoa_id` | GP → Corte 2 |
| 20 | giovanna.home.20 | Pessoa central 2 | Árvore | idem | idem | GP → Corte 2 |
| 21 | giovanna.home.21 | Pessoa central 3 | Árvore | idem | idem | GP → Corte 2 |
| 22 | giovanna.home.22 | Conexão-chave | Árvore ("Próxima atualização"), Jornada | `/biblioteca-evidencias` tipo `arvore` | `app_projections` (`arvore`) | CR |
| 23 | giovanna.home.23 | Conexão territorial | Árvore, Jornada | idem | idem | CR |
| 24 | giovanna.home.24 | Lacuna crítica | Árvore (texto filtrado) | G-02 › Lacunas (interno) → publicação `arvore` | `app_projections` | CR (ressalva) |
| 25 | giovanna.home.25 | Título do alerta | Home (Achados); Conta › Avisos | `/atendimento` tipo `atualizacao` | `app_projections` (`atualizacao`) | CR → Corte 3 (Avisos na Conta) |
| 26 | giovanna.home.26 | Texto do alerta | idem | idem | idem | CR → Corte 3 |
| 27 | giovanna.home.27 | Documento principal | Documentos › Liberados | Pessoa 360 › Documentos (liberar ao cliente) | `documents.liberado_cliente` | CR |
| 28 | giovanna.home.28 | Pendência principal | Documentos › Solicitados | `/atendimento` | `portal_document_requests` | GC |
| 29 | giovanna.home.29 | Status documental | Documentos; Radar (Documentação) | Caso 360 › Documentos | `documents`, `portal_document_requests` | CR |
| 30 | giovanna.origem.30 | Pessoas conectadas (contagem) | Árvore | derivado das pessoas publicadas | contagem de `app_projections.pessoa_id` distintos | CR (ressalva) → Corte 3 |
| 31 | giovanna.origem.31 | Gerações lidas | Árvore (G1–G5) | G-02 › Árvore interna → geração na publicação | `app_projections.geracao_cliente` | SD → Corte 2 |
| 32 | giovanna.origem.32 | Base externa 1 (URL) | — (nunca no App) | Hub › Fontes e documentos | `research_sources`, `case_source_documents` | SD |
| 33 | giovanna.origem.33 | Base externa 2 | — | idem | idem | SD |
| 34 | giovanna.origem.34 | Base externa 3 | — | idem | idem | SD |
| 35 | giovanna.origem.35 | Resumo do radar | Radar (6 eixos, sem juízo) | derivado de dado real | `radar-seis-eixos.ts` | SD |
| 36 | giovanna.origem.36 | Resumo da árvore | Árvore | `/biblioteca-evidencias` tipo `arvore` | `app_projections` | CR |
| 37 | giovanna.jornada.37 | Linha ancestral | Jornada (Passado familiar) | G-02 › Linha do tempo → publicação `linha_tempo` | `app_projections` (`linha_tempo`) | CR |
| 38 | giovanna.jornada.38 | Linha do cliente | Jornada (Presente) | Caso 360 › Jornada; publicação `marco` | `app_projections` (`marco`) | CR |
| 39 | giovanna.jornada.39 | Interseção 1 (União de Ramos) | Jornada | Caso 360 › Jornada → publicação `uniao_ramos` | `app_projections` (`uniao_ramos`) | GP → Corte 3 |
| 40 | giovanna.jornada.40 | Interseção 2 | Jornada | idem | idem | GP → Corte 3 |
| 41 | giovanna.descobertas.41 | Achado 1 | Home, Jornada | `/achados/$caseId` → `/biblioteca-evidencias` tipo `achado` | `genealogical_findings` → `app_projections` | CR |
| 42 | giovanna.descobertas.42 | Achado 2 | Home, Jornada | idem | idem | CR |
| 43 | giovanna.descobertas.43 | Entregável | Legado; Documentos | `/biblioteca-evidencias` tipo `legado`; microentrega | `app_projections` (`legado`), `client_deliverables` | CR |
| 44 | giovanna.conta.44 | Produto atual (plano) | Conta › Plano | Caso 360 › Formalização → "Publicar plano no App" | `app_projections` (nome comercial + situação + vigência) | GP → Corte 3 |
| 45 | giovanna.conta.45 | Status da jornada | Home, Jornada | Caso 360 › Jornada | `case_plans.fase_jornada` | CR |
| 46 | giovanna.conta.46 | Última atualização | Home (1º achado) | derivado da publicação mais recente | `app_projections.effective_from` | CR (ressalva) |
| 47 | giovanna.conta.47 | Marco 1 | Conta › Histórico | Caso 360 › Histórico ("Marcos aprovados para o App") | `case_timeline_events.summary_client_approved` | GC |
| 48 | giovanna.conta.48 | Marco 2 | idem | idem | idem | GC |
| 49 | giovanna.conta.49 | Marco 3 | idem | idem | idem | GC |
| 50 | giovanna.conta.50 | Texto do upgrade | — (sem upsell) | — | regra `permiteUpsell: false` | SD |
| 51 | giovanna.anexos.51 | Pasta principal de documentos | — (interno) | Caso 360 › Documentos (Drive) | `drive_provisioning_queue` | SD |
| 52 | giovanna.anexos.52 | Pasta de imagens | — (interno) | idem | idem | SD |
| 53 | giovanna.anexos.53 | Links de fontes extras | — (interno) | Hub › Fontes e documentos | `research_sources` | SD |
| 54 | giovanna.anexos.54 | Regra de input/output | todas as abas (filtro) | aplicada em toda publicação | `publicacoesParaCliente` + `contemConteudoInterno` | CR |

## Contagem

- Conectados de verdade (CR): 26.
- Substituídos por regra escrita (SD): 20.
- Gaps já corrigidos (GC): 5 (#6, #28, #47–49).
- Gaps que dependiam de decisão, agora no plano aprovado (GP): #19–21 (nomes na árvore),
  #39–40 (União de Ramos) e #44 (plano contratado). Mais duas ressalvas: #25–26 (Avisos na
  Conta) e #30 (contagem por pessoa). Tudo isso entra nos Cortes 2 e 3 de 27/09.
