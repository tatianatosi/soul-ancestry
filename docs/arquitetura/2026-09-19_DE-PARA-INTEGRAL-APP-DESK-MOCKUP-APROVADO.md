# De-para integral — App Cliente × Desk × mockup aprovado

> **Correção de autoridade (21/09/2026).** Este documento foi escrito tratando
> o PDF de 17 páginas como contrato de composição. A Proprietária corrigiu:
> **o PDF não é regra nem limite** — foi gerado pelo Lovable para mostrar que
> os elementos existem, e o go-live são as páginas vivas, mais atualizadas.
>
> O que segue continua válido como **medição do código real** (rotas, writers,
> fronteira de sanitização, gaps). O que não vale é ler as comparações abaixo
> como "a tela precisa ficar igual ao PDF". Especificação e critério de aceite
> vigentes: `docs/politicas/DE-PARA-COMPLETO-APP-DESK-2026-09-21.md`.

- Status: rascunho
- Versão: v1.0
- Data: 2026-09-21 (nome do arquivo mantém 2026-09-19, data da ordem)
- Responsável pela decisão: Proprietária do Clube Ancestral
- Fonte de evidência: leitura direta de `origin/main` em `76e8968b`, via worktree isolado (`execucao-tecnica-total`). Toda contagem foi medida, não estimada. Toda citação é arquivo:linha real.
- Escopo: ordem "CLUBE ANCESTRAL — EXECUÇÃO TÉCNICA TOTAL" v3.0, Entregável 1.

## Método e honestidade da cobertura

A ordem pede cobertura "do topo ao rodapé" de todas as superfícies. O repositório tem **90 rotas no Desk** (`src/routes/_authenticated/*.tsx`) e **15 no App Cliente** (`src/routes/portal/*.tsx`). Cobrir bloco a bloco as 105 num único documento produziria milhares de linhas — e a ordem proíbe inventar linha.

Cobertura entregue, declarada sem eufemismo:

- **Nível de rota: 100%** das 105 superfícies, com evidência real (§2, §3).
- **Nível de bloco/CTA: os domínios que a ordem enfatiza** — Pessoa, Caso 360, Planejador/Produto-Pai, Contrato e as 7 abas do App (§4 a §8).
- O que não foi descido a bloco está marcado como tal em §9, não omitido.

**Aviso de método.** Um agente auxiliar leu o working tree sujo (branch `fix/p0-magic-link-master-invoices`) em vez de `origin/main` e reportou números defasados (2 usos de `CaCard`, 77 rotas). Os números deste documento foram remedidos contra `main`. Quem reler este de-para deve repetir a medição contra `origin/main`, nunca contra o checkout primário.

## 1. Estado da infraestrutura transversal (medido)

| Infraestrutura | Arquivo | Alcance real |
|---|---|---|
| Escrita verificada | `src/lib/persistencia.server.ts` (`gravarComVerificacao`/`inserirComVerificacao`) | 37 de 90 `*.functions.ts` |
| Histórico do caso | `src/lib/timeline-operacional.server.ts` (`registrarTimelineCaso`) | 22 de 90 `*.functions.ts` |
| Confirmação humana | `src/components/saas/acao-operacional.tsx` (`AcaoOperacional`) | 47 arquivos |
| Estados de leitura | `src/components/saas/estado-dados.tsx` (`EstadoDados`) | 56 arquivos |
| Design System (cartão) | `src/components/ui/ca-card.tsx` (`CaCard`) | 7 arquivos |
| `window.prompt`/`confirm` crus | — | **0** (o único hit é um comentário em `casos.$caseId.index.tsx:490`) |

O motor universal de ação/histórico/fila está **completo** na dimensão "confirmação humana": não há CTA irreversível caindo em prompt nativo. As lacunas transversais reais são outras, e estão em §10.

## 2. App Cliente — 15 rotas, 7 abas aprovadas

Barra renderizada em `src/components/portal/portal-shell.tsx:67-78`, rótulos de `src/lib/portal-copy.ts`.

| # | Aba (rótulo real) | Rota | Linhas | Na barra | Conformidade com a taxonomia aprovada |
|---|---|---|---|---|---|
| 1 | Home | `/portal` | 368 | Sim | Conforme |
| 2 | Jornada | `/portal/jornada` | 421 | Sim | Conforme (mas ver §7 — passos hardcoded) |
| 3 | Radar | `/portal/radar` | 138 | Sim | Conforme |
| 4 | Árvore | `/portal/arvore` | 201 | Sim | Conforme |
| 5 | Documentos | `/portal/documentos` | 340 | Sim | Conforme |
| 6 | Legado | `/portal/legado` | 206 | Sim | Conforme |
| 7 | Conta | `/portal/conta` | 228 | Sim | Conforme |

**Resolvido, contra a dívida herdada:** a barra do App **não injeta mais** "Entregas", "Fase 01" ou "Fase 02" como abas de primeiro nível. O array em `portal-shell.tsx:75-85` é estático e tem exatamente 7 itens; o comentário no próprio arquivo (`:62-66`) declara a decisão. Em `src/lib/portal-navegacao.ts:37-57` essas rotas constam com `abaPrimeiroNivel: false`. A dívida registrada em AGENTS.md ("código ainda injeta Entregas/Fase 01/02 quando aplicáveis") **está fechada** — confirmo por leitura, e o AGENTS.md deve ser atualizado.

Fallback de não-cliente: quando não há acesso completo, a barra é `[]` — **nenhuma aba**, não uma 8ª aba "Proposta". O comentário em `portal-shell.tsx:68-73` registra que a barra de 1 item ("Proposta") existiu e foi removida em 16/09/2026 exatamente por ser uma 8ª aba fora da taxonomia. Conforme.

Rotas do portal fora da barra (7): `entregas`, `fase-01`, `fase-02`, `proposta`, `faturas`, `casos.$id`, `mensagens.$id`. `faturas` e `proposta` estão declaradas em `PORTAL_ROTAS_FORA_DO_SPEC` (`portal-navegacao.ts:66-69`) — rota profunda existente, não navegação aprovada. Conforme a política.

## 3. Desk — 6 grupos, 90 rotas

`GRUPOS_DESK` (`src/lib/navegacao-desk.ts:81-209`) — 6 grupos, conforme a decisão vigente da Proprietária (não 7 do mockup, não 8 da memória permanente):

| id | Rótulo | Entrada |
|---|---|---|
| `hoje` | Hoje | `/painel` |
| `comercial` | Marketing & Comercial | `/calls` |
| `casos` | Pessoas & Casos | `/casos` |
| `pesquisa` | Inteligência & Pesquisa | `/biblioteca` |
| `contratos` | Formalização & Financeiro | `/contratos` |
| `governanca` | Governança & Administração | `/configuracoes` |

Configuração/equipe permanecem em `MENU_CONTA` (`:227`), não como 7º grupo. Conforme.

As 12 superfícies mais substanciais do Desk (medidas em linhas):

| Rota | Linhas | Papel |
|---|---|---|
| `casos.$caseId.index.tsx` | 2545 | Caso 360 — eixo operacional |
| `contratos.$id.tsx` | 1327 | Instrumento contratual |
| `pessoas-linhagens.$caseId.tsx` | 1173 | Ficha genealógica interna |
| `pesquisa-evidencias.$caseId.tsx` | 1097 | Pesquisa e evidências |
| `casos.$caseId.contrato.preparar.tsx` | 1075 | Preparação de contrato |
| `pessoas.$clienteId.tsx` | 1037 | Pessoa 360 |
| `leads.tsx` | 934 | CRM de leads |
| `financeiro.tsx` | 860 | Financeiro |
| `biblioteca.tsx` | 828 | Biblioteca Mestre |
| `biblioteca-evidencias.$caseId.tsx` | 817 | Evidências e projeções |
| `clientes.tsx` | 773 | Pessoas/clientes |
| `acessos-portal.tsx` | 760 | Acessos ao App |

Rotas fora de qualquer grupo do menu (existem, não são navegação aprovada): 6 `golive.*`, `studio-devolutivas`, `plano-acao.$caseId`, `achados.$caseId`, `onboarding.$id`, `relatorios-fase.$caseId`, `governanca.decisoes`, e `historico.fluxo-comercial-canonico` (histórico, `noindex`, travado por teste). 5 rotas rotuladas "(legado)" em Governança.

## 4. Fronteira App × Desk — sanitização

| Camada | Arquivo | O que faz |
|---|---|---|
| Fonte do App | `app_projections` | Só conteúdo publicado |
| Sanitização | `src/lib/portal-dados-vivos.ts` | Funções puras: `jornadaSanitizada:79`, `radarSanitizado:123`, `arvoreSanitizada:176`, `legadoSanitizado:190`, `publicacoesDeEntrega:197` |
| Leitura no App | `usePortalVivo` / `usePreviaPortal` | 9 das 15 rotas do portal |

**A fronteira é arquiteturalmente sólida**: o App não lê tabela operacional direta; lê projeção publicada e passa por sanitização pura e testável. Isto **não** é gap. É o contrário do que a ordem temia.

Escrita no App: apenas `mensagens.$id.tsx` (`useMutation`), `conta.tsx` e `documentos.tsx` (`useServerFn`). O App é predominantemente leitura — correto para a taxonomia.

## 5. Caso 360 — eixo real

`casos.$caseId.index.tsx` (2545 linhas) concentra: ficha, pessoas/membros, núcleo, produto/trilha, planejador, tarefas, documentos, financeiro, pesquisa, jurídico, timeline, e — desde `258ead1b` — o bloco **Estado Integrado do Caso** (`src/components/caso/estado-integrado.tsx`), leitura pura compondo 10 domínios por `case_id` com link para a superfície fonte.

| Bloco | Fonte real | Estado |
|---|---|---|
| Pessoa/origem | `clientes` via `carregarFichaCaso` | OK |
| Família/núcleo | `case_members`, `nucleo_membros` | OK |
| Produto-pai/trilha | `case_services` → `product_catalog` | **DIVERGENTE** — ver §6 |
| Etapa/rota | `case_plans.etapa`, `.rota_confirmada` | **DIVERGENTE** — ver §6 |
| Marcos | `case_plans.marcos[]` | **AUSENTE na leitura** — escrito, nunca relido por tela |
| Onboarding | `onboarding-jornada` | OK |
| Microentrega | 4 fontes paralelas | **DIVERGENTE** |
| Contrato/OS | `contracts`, `service_orders` | OK |
| Acesso ao App | `client_portal_access` | OK |
| Último evento | `case_timeline_events` | OK |

Dirty-state real (`useBlocker` + `beforeunload` + diálogo "Há alterações não salvas") existe aqui (`:472-495`, `:1986-2025`) e em `contratos.$id.tsx` — **duas telas em 105**. Nunca foi extraído para reuso.

## 6. Planejador e Produtos-Pai — o gap estrutural

### 6.1 `fase_jornada` grava NULL numa coluna NOT NULL — P0

Cadeia verificada de ponta a ponta:

1. `src/components/contrato/planejador-operacional.tsx:115` envia `faseJornada: null` **hardcoded** (e `fontes: []`, `dadosDisponiveis: []`, `regrasAnexos: []`).
2. `src/lib/cadeia-operacional.ts:110` — `avaliarPlanejador` devolve `fase_jornada: e.faseJornada ?? null` → `null`.
3. `src/lib/cadeia-operacional.server.ts:136` — `sincronizarPlanejador` monta `fase_jornada: saida.fase_jornada` → `null` no payload.
4. `supabase/migrations/20260821123530_...sql:8` — a coluna é `text NOT NULL DEFAULT 'aceite_e_formalizacao'`, com CHECK de 8 valores (`:31`).

Em Postgres, **NULL explícito não cai no DEFAULT** — o default só se aplica quando a coluna é omitida. Um NULL explícito viola o NOT NULL (`23502`). Conclusão: **salvar o planejador provavelmente falha em runtime**, e a tela não distingue isso porque não há estado de erro de escrita padronizado (§10).

Efeito colateral no mesmo caminho: `bloqueios` em `avaliarPlanejador:106` só nasce de `fontes` com `estado: "conflito"` — e `fontes` é sempre `[]` por hardcode. Logo **`bloqueios` é vazio por construção**, não por ausência de bloqueio real.

**Autocrítica devida:** o bloco Estado Integrado que publiquei em `258ead1b` exibe `planejador.fase_jornada`. Na melhor hipótese ele mostra o default constante; na pior, o registro nem grava. Superfície correta lendo campo inerte — declarado aqui, não escondido.

### 6.2 Produto-Pai é catálogo isolado

- `PRODUTOS_PAI_CANONICOS` (`src/lib/planejador-produtos-pai.ts:19-29`) — 9 itens (PP-01…PP-09), **só em TypeScript**.
- Não existe tabela `produtos_pai`. `planner_catalog_feed.product_parent` guarda o **nome**, nunca o código PP-XX.
- A ligação caso → produto-pai é **match por string do nome** em `agruparPorProdutoPai:52-53`, calculada em tempo de leitura, usada apenas para agrupar um `<select>` em `src/components/caso/produto-trilha.tsx:66`, e **descartada** — não é gravada.
- `/catalogo` é a única tela que exibe PP-01…PP-09, e não conhece caso nenhum.

Caminho real caso → produto-pai, 4 saltos: `crm_casos.id` → `case_services.product_catalog_id` → `product_catalog.code` → `planner_catalog_feed.item_id` → `product_parent` (nome).

### 6.3 País/via — três fontes concorrentes

1. `case_plans.rota_confirmada` — texto livre (`planejador-operacional.tsx:201`); **nenhuma tela exibe o valor**.
2. `crm_casos.pais`/`.via`/`.via_juridica_preliminar`/`.status_via` — campos soltos.
3. `case_services.citizenship_track_id` → `citizenship_tracks` — **a única estruturada**, escrita em `produto-trilha.tsx:134-136`.

As três não se falam.

## 7. App Cliente não lê o Planejador

`src/routes/portal/jornada.tsx:19` usa `PASSOS_CASO` **hardcoded**: `["Onboarding","Pesquisa","Documentos","Validação","Entrega"]`. Nenhuma rota do portal lê `case_plans`, `fase_jornada`, `rota_confirmada`, `marcos` ou produto-pai.

Consequência direta para a ordem: a promessa "o cliente acompanha sua jornada" hoje é uma lista fixa igual para todos os casos, não a jornada real daquele caso. **Este é o gap que mais separa o produto do que o mockup promete.**

## 8. Contrato

`casos.$caseId.contrato.preparar.tsx` é a **única** tela que exibe o resultado de `estadoCadeiaOperacional` (via `lerCadeiaOperacional`, `src/components/contrato/cadeia-operacional.tsx:30`) — e, desde `258ead1b`, o Caso 360 também o consome. `estadoCadeiaOperacional` monta 8 elos lendo `case_plans`, `proposals`, `product_catalog`, `commercial_conditions`, `service_orders`, `contract_parameter_previews`, `contract_case_parameters`, `contracts`. É uma cadeia **comercial/contratual** — não contém etapa de cidadania, país/via nem marco jurídico.

## 9. O que este documento NÃO desceu a nível de bloco

Declarado, não omitido: as 78 rotas do Desk fora das 12 de §3 e as 8 rotas do portal fora das 7 abas estão cobertas **em nível de rota** (existência, grupo, papel), não bloco a bloco. Descer todas exige rodadas próprias por domínio, cada uma com verificação — e a ordem proíbe inventar linha para preencher tabela.

## 10. Gaps transversais (entram no mapa de persistência)

| # | Gap | Evidência | Prioridade |
|---|---|---|---|
| 1 | `fase_jornada` grava NULL em coluna NOT NULL | §6.1 | **P0** |
| 2 | `bloqueios` do planejador vazio por hardcode (`fontes: []`) | `planejador-operacional.tsx:110` | **P0** |
| 3 | App mostra jornada hardcoded, não a do caso | `portal/jornada.tsx:19` | **P0** |
| 4 | `ESTADOS_SALVAMENTO` órfão — zero consumidores em `src/` | `persistencia-erros.ts:44` | P1 |
| 5 | Duplo submit do `AcaoOperacional` falha com `onConfirmar` síncrono | `acao-operacional.tsx:68-81` | P1 |
| 6 | Dirty-state existe em 2 de 105 telas, nunca extraído | `casos.$caseId.index.tsx:472-495` | P1 |
| 7 | Produto-Pai ligado ao caso por string, não persistido | §6.2 | P1 |
| 8 | `case_plans.marcos[]`/`microentregas[]` escritos e nunca relidos | §5 | P1 |
| 9 | Microentregas em 4 fontes paralelas | §6 | P2 |
| 10 | ~~Drift de coluna `archive_reason` × `archive_motivo`~~ — **erro meu, retirado**: `contract_scope_items` tem `archive_reason` na própria DDL (migration `20260816155807`, linhas 85 e 144). As duas convenções coexistem por tabela (PT-BR usa `archive_motivo`, EN usa `archive_reason`); não há drift nem `RENAME COLUMN` em migration nenhuma | `cadeia-operacional.server.ts:651` | — |

## 11. O que esta execução NÃO fez

Não publicou (a própria ordem proíbe: "Nenhuma publicação executada"). Não alterou schema, RLS, migration, cobrança, assinatura ou cláusula. Não criou tabela, entidade ou Design System paralelo. Não redesenhou navegação: 6 grupos no Desk e 7 abas no App permanecem como estão.
