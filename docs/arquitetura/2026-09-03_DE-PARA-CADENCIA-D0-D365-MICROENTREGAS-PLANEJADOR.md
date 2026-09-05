# De-Para — Cadência D0–D365, Micro-entregas, Planejador e Ciclo-Piloto: política nova × mecanismos reais

> **Nota de recuperação (04/09/2026):** este documento foi escrito em 03/09/2026 (commit `6fc2521`)
> numa branch própria (`docs/de-para-cadencia-microentregas-planejador-2026-09-03`) que nunca foi
> mesclada a `main` nem a nenhuma outra branch de trabalho — por isso ficou invisível a toda busca
> feita em `docs/`/`src/` nesta sessão até a Proprietária apontar para ele diretamente. Recuperado
> aqui sem alteração de conteúdo, só com esta nota. Ver
> `docs/auditorias/2026-09-04-consolidacao-12-documentos-drive-cadencia-d0-d365.md`, seção 2.1, para
> a correção que isso gera na varredura de cadência de hoje — em especial: os dois vocabulários
> conflitantes de `client_deliverables.approval_status` (seção 1.0/1.1 abaixo) **continuam ativos e
> não corrigidos** em 04/09, um dia depois deste achado.

```yaml
status: mapeamento — nenhum código alterado, aguardando decisão da Proprietária
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: de-para de convergência (arquitetura interna) / auditoria de cadência e micro-entregas
responsável pela decisão: Proprietária Administradora do Clube Ancestral (Tatiana Melani Tosi)
base normativa: "Mapa de cadências D0–D365 — Ana Luiza como piloto e regra universal" (rascunho v1.0,
  2026-09-03, documento novo da Proprietária — a política que motivou esta pesquisa);
  src/lib/jornada-de-para.ts (ponte de-para de fase já existente, NÃO recriada aqui);
  docs/arquitetura/2026-09-03_DE-PARA-ONBOARDING-JORNADA-DE-VIDA-CADENCIA.md (PR #75 — sete
  mecanismos de onboarding/cadência já mapeados, NÃO repetidos aqui exceto onde a política nova
  acrescenta algo que aquele documento não cobria);
  docs/arquitetura/2026-09-03_DE-PARA-PILOTO-ANA-CONVERGENCIA-REALIDADE.md.
repositório: tatianatosi/soul-ancestry
fonte: leitura completa de src/lib/onboarding-jornada.ts, jornada-cliente.ts,
  jornada-cliente.functions.ts, onboarding-jornada.functions.ts, ops.functions.ts,
  cadeia-operacional.ts, planejador-parametros.ts, ciclo-piloto-ana.ts, app-visibilidade.ts,
  app-visibilidade-registro.ts, portal-jornada.functions.ts, fechamento-caso.ts,
  fechamento-caso.functions.ts; leitura de src/components/contrato/planejador-operacional.tsx,
  src/routes/portal/fase-01.tsx, src/routes/portal/fase-02.tsx, src/routes/_authenticated/piloto.tsx;
  grep completo de "microentrega"/"micro-entrega"/"micro_entrega" em src/; leitura de
  src/integrations/supabase/types.ts para os esquemas reais de client_deliverables e
  ops_microentregas; em 2026-09-03.
limite desta sessão: o MCP do Supabase não está autorizado neste ambiente — nenhuma tabela real foi
  consultada ao vivo. Todo o mapeamento de coluna/tabela vem do arquivo gerado
  src/integrations/supabase/types.ts (que reflete o schema no momento da última geração) e de
  leitura de código (`.from("...")`), não de query real contra o banco em produção.
premissa desta sessão: a Proprietária mencionou ter "acabado de colocar cadência onboarding para
  todos" — uma ação em dados/UI do Desk que esta sessão não tem como verificar (sem acesso ao
  banco). Nenhuma feature de código chamada "aplicar cadência para todos os casos" foi encontrada
  nesta varredura — ver seção 6.
```

## Causa

Pedido da Proprietária (03/09/2026, verbatim): "O ideal aplicar essa regra agora que acabei de
colocar de cadência onboarding para todos e de qualquer forma fazer um de para de tudo que já
existe entre onboarding, fases, micro entregas, ciclo de vida e no planejador."

O PR #75 (`docs/arquitetura/2026-09-03_DE-PARA-ONBOARDING-JORNADA-DE-VIDA-CADENCIA.md`) já cobriu
onboarding/fases/cadência (sete mecanismos A–H) e não precisa ser refeito. Este documento cobre o
que aquele **não** cobriu, e que a política nova (Mapa D0–D365) torna urgente: micro-entregas como
conceito formal (seção 6 da política), o "planejador" citado ao lado de onboarding/fases/ciclo de
vida, o `ciclo-piloto-ana.ts` (não incluído nos seis vocabulários de fase do `jornada-de-para.ts`),
Fase 01/Fase 02 do App Cliente, e a comparação entre os "portões de ativação" (D0, seção 3 da
política) e os nove gates de `fechamento-caso.ts`.

**Achado central desta sessão:** existem **quatro representações estruturalmente diferentes** do
conceito "micro-entrega" em código real — não duas, como a hipótese inicial supunha — e uma delas
(`documents.liberado_cliente`) nem se chama micro-entrega, mas é o que de fato decide o gate de
Fase 01 no portal em produção. A seção 1 detalha isso; é o achado mais sério deste documento.

## 1. Micro-entregas: quatro mecanismos reais, campo a campo contra a seção 6 da política nova

### 1.0 Inventário — antes do de-para de campo

| # | Mecanismo | Tabela real | Vocabulário de estado | Quem escreve | Rota/consumidor real |
|---|---|---|---|---|---|
| 1 | Sugestão de próxima micro-entrega | nenhuma (função pura) | n/a — sugere `tipo`+`fase`, não persiste | `sugerirProximaMicroentrega` (`onboarding-jornada.ts:483–524`) | testado em `sugestao-microentrega.test.ts`; não encontrado wireado em nenhum componente/rota — ver nota abaixo |
| 2 | Entrega cliente-facing, vocabulário A (inglês) | `client_deliverables` | `draft`/`in_review`/`approved`/`published` (`onboarding-jornada.ts:64–67`) | `onboarding-jornada.functions.ts:503,530,562` (`salvarEntrega`/`aprovarEntrega`/`publicarEntrega`) | `/ops` (painel-onboarding-jornada) |
| 3 | Entrega cliente-facing, vocabulário B (português) | **a mesma tabela** `client_deliverables` | `rascunho`/`em_revisao`/`aprovado`/`publicado`/`arquivado` (`STATUS_APROVACAO`, `jornada-cliente.ts:90–91`, transições em `140–146`) | `jornada-cliente.functions.ts:199–219` (criação), `223–263` (`transicionarMicroentrega`) | `/casos/$id` aba Jornada (via `jornada-cliente.tsx`) |
| 4 | Tarefa operacional interna "micro-entrega" | `ops_microentregas` (+ view `v_ops_microentregas`) | `status` livre — valores vistos: `concluida`, `cancelada`, e implicitamente `pendente`/`em_andamento` (`alertas-derivados.ts:234,262`; `ops.functions.ts:78,153,247`) | `ops.functions.ts` (CRUD completo) | `/ops` → `v_ops_tarefas`/`v_ops_microentregas` (fila SLA) |
| 5 | Linha de texto livre "microentregas" no planejador de escopo contratual | nenhuma tabela própria — vira `string[]` dentro do hash de escopo do contrato (`cadeia-operacional.ts`) | n/a — texto solto, sem estado | `planejador-operacional.tsx` (form) → `cadeia-operacional.functions.ts` (`salvarPlanejadorOperacional`) | `/casos/$id` (aba Planejador — ver seção 2) |

Nota sobre o item 1: `sugerirProximaMicroentrega` é uma função pura testada isoladamente
(`sugestao-microentrega.test.ts`), mas esta sessão não encontrou nenhum componente ou rota que a
importe e chame — nem `painel-onboarding-jornada.tsx`, nem `onboarding-plano.tsx`, nem
`jornada-cliente.tsx`. É motor testado sem consumidor de tela confirmado nesta varredura (mesma
categoria de risco que o mecanismo A do PR #75 — "motor real e testado, mas tela que o expõe não
lê banco" — aqui é o oposto: motor real e testado, mas **nenhuma tela o lê ainda**).

**Achado adicional, fora dos quatro acima, citado por três documentos internos mas não
investigado até agora:** `inventario-recuperacao.ts:884` e `inventario-patrimonial.ts:511,852`
registram uma **quinta** tabela, `public.microentregas` — "(6, protótipo, órfãs)" — distinta de
`ops_microentregas` ("0, operacional"). Nenhum arquivo de código lido nesta sessão faz
`.from("microentregas")`; é citada só nos inventários de patrimônio de dado, como tabela-protótipo
abandonada. Preservada, não apagada — fica registrada aqui como a mesma duplicação que aqueles dois
inventários já tinham sinalizado, agora conectada ao pedido da Proprietária.

**O achado mais sério — vocabulário de estado duplicado na MESMA coluna da MESMA tabela:**
`client_deliverables.approval_status` recebe **dois conjuntos de strings disjuntos**, escritos por
dois módulos diferentes que nunca se importam um ao outro: `onboarding-jornada.functions.ts`
grava `"in_review"`/`"approved"`/`"published"`; `jornada-cliente.functions.ts` grava
`"rascunho"`/`"em_revisao"`/`"aprovado"`/`"publicado"`/`"arquivado"`. Isso é qualitativamente
diferente da duplicação de D7/D10/D14 que o PR #75 já tinha mapeado (lá, seis lugares concordam no
mesmo número — é redundância, não conflito). **Aqui há risco de conflito real**: uma linha gravada
por um caminho como `"published"` não é reconhecida como publicada por uma consulta que filtra
`approval_status === "publicado"` (e vice-versa) — são strings diferentes, comparação estrita.
`onboarding-jornada.functions.ts:585` filtra `.eq("approval_status", "published")`;
`jornada-cliente.ts:124` filtra `i.approval_status === "publicado"`. Se as duas telas operarem sobre
o mesmo caso, cada uma só enxerga as entregas que ela mesma criou/moveu — a outra metade fica
invisível.

### 1.1 De-para campo a campo — seção 6 da política nova × `client_deliverables` (mecanismo real mais próximo)

| Campo da política (seção 6) | Mecanismo real | Arquivo:linha | Correspondência | Observação |
|---|---|---|---|---|
| `case_id` | `case_id` (not null) | `types.ts:3310`; gravado em `jornada-cliente.functions.ts:203`, `onboarding-jornada.functions.ts:~495` | **Exata** | — |
| pessoa/participante autorizado | `client_id` (nullable) + `family_id` (nullable) | `types.ts:3311,3317` | **Aproximada** | Nenhum campo garante "autorizado" — é FK opcional, sem trava de que a pessoa tenha acesso liberado ao caso. A autorização de fato mora em `client_portal_access`/`app_projections`, tabelas separadas nunca cruzadas aqui. |
| tipo de entrega | `deliverable_type` | `types.ts:3315`; `TipoEntrega` em `onboarding-jornada.ts` | **Exata** | Vocabulário de tipo (`boas_vindas`, `plano_de_acao`, `checklist_documental`, `arvore_inicial`, …) só existe do lado do mecanismo 2 (onboarding-jornada.ts); o mecanismo 3 (jornada-cliente.ts) grava a mesma coluna sem importar esse enum — não verificado se valida contra a mesma lista. |
| fase da jornada | `journey_phase` (string \| null) | `types.ts:3320` | **Aproximada** | Coluna é string livre no banco (igual ao achado já registrado para `case_plans.fase_jornada` em `CA-AUD-12`/`jornada-de-para.ts`). O tipo TS (`SugestaoMicroentrega.fase: FaseJornada`, `onboarding-jornada.ts:469`) é validado só no lado que sugere, não há trava de banco. |
| origem e evidência | `internal_reference` (nullable, texto livre) | `types.ts:3319`; `jornada-cliente.functions.ts:210` (`referenciaInterna`) | **Aproximada/gap parcial** | Existe um campo de referência interna, mas não há campo de "evidência" estruturado (URL, anexo) como o que `ops_microentregas` tem (`evidencia_descricao`, `evidencia_url` — `types.ts:13120–13121`) — a peça de evidência estruturada existe, mas na tabela **errada** (a interna, não a cliente-facing). |
| responsável interno | `responsible_user_id` | `types.ts:3325`; `jornada-cliente.functions.ts:213` | **Exata** | — |
| estado (7 valores: preparada/em revisão/publicada/visualizada/ação pendente/concluída/arquivada) | `approval_status` — dois vocabulários conflitantes (ver 1.0) | `onboarding-jornada.ts:64–67` vs `jornada-cliente.ts:90–91,140–146` | **Aproximada, e conflitante** | Nenhum dos dois vocabulários tem 7 valores. O inglês tem 4 (draft/in_review/approved/published — sem "arquivado"). O português tem 5 (rascunho/em_revisao/aprovado/publicado/arquivado — sem "visualizada", sem "ação pendente", sem "concluída"). "Visualizada" existe como **timestamp** (`viewed_at`, ver linha de datas abaixo), não como estado da máquina de estados. "Ação pendente" e "concluída" **não existem em nenhum dos dois vocabulários de `client_deliverables`** — "concluída" só existe no mecanismo 4 (`ops_microentregas.status = "concluida"`), tabela diferente. |
| regra de projeção cliente-facing | `title_client` + `summary_approved` (só exibidos quando `approval_status` = publicado/published) | `types.ts:3327,3326`; gate em `onboarding-jornada.functions.ts:554–558` ("Conteúdo não sanitizado. Publicação bloqueada.") | **Aproximada** | A regra existe mas é implícita (condicional de publicação), não um campo/motor de projeção nomeado. O motor de projeção mais genérico do produto é `app_projections` (citado em `biblioteca-evidencias.ts`, `fontes-documentos-integracao.ts`) — tabela **separada**, não usada por `client_deliverables`. |
| próxima ação da equipe e/ou cliente | **gap na tabela** — existe só como texto livre em `case_plans.proxima_microentrega` (plano do caso, não da entrega individual) | `onboarding-jornada.ts:152,214`; `onboarding-jornada.functions.ts:116,200,208,356` | **Gap real** | `client_deliverables` não tem campo de "próxima ação" por entrega. O que existe é um campo de nível-de-plano (uma "próxima microentrega" textual por caso, não por entrega já criada) — objeto diferente do que a política pede. |
| relação opcional com SKU/oferta | **gap total** | — | **Gap real** | Nenhuma FK para `product_catalog` em `client_deliverables` nem em `ops_microentregas`. Não encontrado em nenhum lugar do grep. |
| datas de publicação/leitura/conclusão | `published_at` ✓, `viewed_at` ✓, conclusão: **gap** | `types.ts:3324,3330` | **Aproximada** | Publicação e leitura existem. "Conclusão" não existe nesta tabela — só existe em `ops_microentregas.concluida_em`/`concluida_por` (`types.ts:13116–13117`), tabela diferente, sem FK entre as duas. |

### 1.2 Por que `ops_microentregas` cobre melhor "evidência" e "conclusão", mas é a tabela errada

`ops_microentregas` tem `criterio_aceite`, `evidencia_descricao`, `evidencia_url`,
`concluida_em`, `concluida_por` — exatamente os pedaços que faltam em `client_deliverables` para
bater com a seção 6 da política. Mas `ops_microentregas` não tem `title_client`,
`summary_approved`, `deep_link`, `published_at` nem `viewed_at` — os campos cliente-facing. Em
outras palavras: **a política pede um único conceito com um único estado de 7 valores; o código
real tem esse conceito partido em duas tabelas complementares que nunca se referenciam** (nenhuma
FK entre `client_deliverables` e `ops_microentregas`), cada uma cobrindo a metade do modelo da
política. `matriz-conformidade.ts:107` já lista as duas juntas como fonte da mesma tela ("Entregas
da Jornada"), sem reconciliá-las.

### 1.3 Resumo do de-para de micro-entregas

| Campo da política | Existe hoje? | Onde | Precisão |
|---|---|---|---|
| case_id | Sim | `client_deliverables.case_id` | Exata |
| pessoa/participante | Parcial | `client_deliverables.client_id`/`family_id` | Aproximada (sem trava de autorização) |
| tipo | Sim | `client_deliverables.deliverable_type` | Exata |
| fase | Parcial | `client_deliverables.journey_phase` (string livre) | Aproximada |
| origem/evidência | Partido em duas tabelas | `internal_reference` (client_deliverables) + `evidencia_url`/`evidencia_descricao` (ops_microentregas) | Aproximada, tabela errada |
| responsável | Sim | `client_deliverables.responsible_user_id` | Exata |
| estado (7 valores) | Não — dois vocabulários conflitantes, nenhum com 7 valores | `approval_status` (dois vocabulários) | **Gap real + conflito ativo** |
| projeção cliente-facing | Implícita | gate de publicação + `title_client`/`summary_approved` | Aproximada |
| próxima ação | Não, no nível certo | `case_plans.proxima_microentrega` (nível-plano, não nível-entrega) | Gap real |
| SKU opcional | Não | — | Gap real |
| datas pub/leitura/conclusão | 2 de 3 | `published_at`, `viewed_at`; conclusão só em `ops_microentregas` | Aproximada |

## 2. Planejador: não é sobre cadência — é sobre parâmetros contratuais (achado, não correspondência forçada)

A palavra "planejador" no pedido da Proprietária aparece ao lado de "onboarding, fases, micro
entregas, ciclo de vida" — conceitos de jornada. No código, **"planejador" é outra coisa**: são
dois mecanismos, nenhum deles sobre cadência D0–D365.

### 2.1 `planejador-parametros.ts` — fonte canônica de parâmetros de contrato

Cabeçalho do próprio arquivo (linhas 1–13): "Planejador Universal como FONTE CANÔNICA de
parâmetros... homologados no Planejador Universal... entram na ficha contratual com origem
`planejador`". `CONVENCOES_PLANEJADOR` (a partir da linha 40) é uma lista estática de convenções
de `case_id` → parâmetros de contrato: `tipoProcesso`, `pais`, `rota`, `estruturaFamiliar`, `sku`,
`skuNome`, `etapas`, `gates`, `responsavel`, `checklists`. Não tem nenhuma noção de dia, prazo D+,
fase de jornada ou micro-entrega estruturada — `etapas` e `gates` aqui são texto descritivo do
processo de cidadania (ex.: "1. Diagnóstico e checklist inicial"), não gates operacionais
verificáveis como os de `fechamento-caso.ts`.

### 2.2 `planejador-operacional.tsx` + `cadeia-operacional.ts` — planejador de escopo contratual, não de cadência

`planejador-operacional.tsx` **não importa** `planejador-parametros.ts` — importa
`cadeia-operacional.ts`/`cadeia-operacional.functions.ts` (linhas 8–9). É um formulário manual por
caso (`EntradaPlanejador`, `cadeia-operacional.ts:22`) com campos como `objetivo`, `etapa`,
`composicao`, `rotaConfirmada`, `produtoSkuCodigo`, `proximaAcao`, `prazoProximaAcao`, `entregas`,
`microentregas`, `marcos`, `checklist`. O campo `microentregas` aqui **é um `string[]` de texto
livre** (linhas 42, 59, 95, 100 de `cadeia-operacional.ts`) — cada linha digitada vira um item de
"microentrega prevista no planejador" dentro do hash de escopo do contrato
(`cadeia-operacional.ts:415`: `for (const s of c.microentregas) add("deliverable", "included", s, ...)`).
Isso alimenta a **declaração de escopo do contrato** (o que o cliente contratou), não o registro de
entregas reais ao cliente — é o objeto de "o que prometemos entregar", não "o que já entregamos".
Sem `case_id` estruturado, sem `estado`, sem `data` — é uma lista de frases dentro de um formulário
de escopo.

### 2.3 Achado desta seção

**"Planejador" no código não tem nada a ver com a cadência D0–D365 da política nova.** É o motor de
parâmetros/escopo contratual (SKU, rota, país, e uma lista de frases-microentrega dentro do escopo
prometido). Não force correspondência: não há um "planejador de cadência" a mapear contra a
política — o "planejador" existente resolve uma pergunta diferente ("o que este contrato inclui"),
não "quando cada coisa acontece depois de D0". A única sobreposição real é terminológica: a mesma
palavra "microentregas" aparece como campo de texto livre no planejador de escopo (§2.2) e como
tabela estruturada em dois lugares (§1) — são três coisas diferentes chamadas pelo mesmo nome.

## 3. `ciclo-piloto-ana.ts`: consumido, mas só como referência — não decide nada

Diferente da hipótese de partida ("pode ser órfão como `decisao-ana-canonica.ts`"), o grep encontra
**um consumidor real**: `src/routes/_authenticated/piloto.tsx:18,76` importa
`FASES_CICLO_PILOTO`/`NOTA_CICLO` e renderiza as 4 fases como um painel de referência ("Ciclo
completo — fases 1 a 4") na rota `/piloto`. Não é código morto.

Mas também não é motor de decisão: a mesma tela usa `agruparBloqueiosPorGate`,
`estadoDoCampo`, `primeiroGatePendente` — importados de `gates-piloto.ts`, um arquivo
**diferente**, para toda a lógica de bloqueio real. `FASES_CICLO_PILOTO` é lido só para
`.map()` e exibição de texto (`piloto.tsx:76–92`); nenhum `if`, gate ou cálculo depende de seu
conteúdo. **Classificação: consumido para exibição, não para decisão** — categoria intermediária
entre "legado documental órfão" (`decisao-ana-canonica.ts`, sem consumidor de tela) e "motor real"
(os sete mecanismos do PR #75). Não recomendamos tratá-lo como legado a arquivar — a tela que o usa
está viva — mas também não é um mecanismo de gate a reconciliar com os outros.

### 3.1 De-para das 4 fases do ciclo-piloto × 8 fases canônicas (mesmo formato de `jornada-de-para.ts`)

| Fase do ciclo-piloto | Fase canônica (`onboarding-jornada.ts`) | Precisão | Motivo |
|---|---|---|---|
| 1. `mapa_identidade` — "identificador canônico e núcleo familiar" | *(nenhuma)* | **Sem correspondência** | É pré-caso — define o `case_id` e as pessoas antes de qualquer fase da jornada existir. Mesma categoria das fases de pré-venda de `derivacao-jornada.ts` que `jornada-de-para.ts` já trata como "fora da canônica, é pré-caso". |
| 2. `aceite_formalizacao` — "aceite registrado, bloqueios de formalização visíveis" | `aceite_e_formalizacao` | **Exata** (variação de grafia) | Mesmo padrão já documentado em `jornada-de-para.ts:66–68` para `jornada-cliente.ts` — falta o "_e_" no id, resolvível por `idCanonicoDeFase`. |
| 3. `onboarding_padrao` — "início operacional... valor percebido em até D7" | `onboarding` | **Aproximada** | Cobre o mesmo conceito, mas embute regra de cadência (D7, "a cada 14 dias") dentro da descrição da fase — a canônica não carrega cadência, só nome/rótulo. |
| 4. `execucao_valor` — "pesquisa inicial, documento, árvore, linha do tempo, relatório parcial, preparação documental, protocolo" | `pesquisa_inicial` + `pesquisa_e_validacao` + `preparacao_documental` + `protocolo_e_acompanhamento` | **Aproximada, agrega 4 fases em 1** | Mesmo padrão que `relatorios-fase.ts` já tem documentado em `jornada-de-para.ts` (4 fases largas). Esta fase não cobre `reconhecimento` nem `pos_reconhecimento` — o ciclo-piloto termina em "execução", plausível porque é o ciclo do caso ainda em formação, não o ciclo de vida completo. |

### 3.2 Vale a pena adicionar como 7º dicionário em `jornada-de-para.ts`?

**Recomendação: não, na forma atual.** Os seis dicionários que `jornada-de-para.ts` já pontua
descrevem estados **gravados ou lidos por telas operacionais reais** (o que grava em
`case_plans.fase_jornada`, o que lê `product_catalog.jornada_fase` etc.). `ciclo-piloto-ana.ts` não
grava nem lê nada — é 100% apresentação estática. Adicioná-lo à ponte de-para sugeriria que é mais
um vocabulário "vivo" concorrendo pelos mesmos dados, quando na verdade é só um roteiro de leitura
para humanos em `/piloto`. Se a Proprietária quiser mesmo assim uma referência cruzada (por
exemplo, para revisar se o roteiro do piloto ainda bate com as 8 fases canônicas conforme elas
evoluem), a tabela da seção 3.1 acima já cumpre esse papel sem precisar tocar no módulo central.

## 4. Fase 01 / Fase 02 do App Cliente × coluna "App Cliente" da política nova

### 4.1 Os gates reais

`app-visibilidade.ts` define `TelaApp` com `"relatorio"` (rotulado "Fase 01",
`TELA_APP_LABEL.relatorio`, linha 57) e `"fase02"` (linha 58). `visibilidadeTela` (linhas 109–149)
resolve o estado de cada uma a partir de `EscopoCliente` (linhas 74–85):

- **Fase 01** (`tela === "relatorio"`, linhas 125–134): `not_applicable` se `!fase1Contratada`;
  `in_preparation` se `fase1Status === "em_preparacao"`; `released` se `disponivel`/`entregue`;
  senão `contracted_not_released`.
- **Fase 02** (`tela === "fase02"`, linhas 136–146): `not_applicable` se
  `!escopoIncluiFase2`; `contracted_not_released` se `prevista`; `in_preparation` se
  `em_preparacao`; senão `released`.

`src/routes/portal/fase-01.tsx:23` chama `useVisibilidade("relatorio")`;
`src/routes/portal/fase-02.tsx:23` chama `useVisibilidade("fase02")` — o wiring de rota está
correto e confirmado.

### 4.2 Onde o escopo é calculado de verdade — e o achado

`portal-jornada.functions.ts:escopoDoPortal` (linhas 17–63) é quem preenche `EscopoCliente` na
produção. Achado: **`fase1Status` não vem de `client_deliverables` nem de nenhuma tabela chamada
"micro-entrega"** — vem de `documents.liberado_cliente = true` (linha 45) e `portal_casos` (linha
46):

```
fase1Contratada: casosReais > 0,
fase1Status: casosReais === 0 ? "nao_prevista" : entregasLiberadas > 0 ? "disponivel" : "em_preparacao",
```
(`portal-jornada.functions.ts:56–57`, `entregasLiberadas` calculado na linha 49 a partir de
`documents`, não de `client_deliverables`)

Isso contradiz o próprio comentário do tipo que consome esse valor —
`app-visibilidade.ts:77`: `/** Entregas aprovadas/released disponíveis (client_deliverables). */`
— o comentário diz `client_deliverables`; a implementação real lê `documents`. É uma variante nova
da mesma classe de achado do PR #75 (documentação/comentário desatualizado em relação ao código que
de fato roda), desta vez no caminho que decide se a Fase 01 aparece "disponível" para o cliente.

`escopoIncluiFase2` está **hardcoded `false`** (`portal-jornada.functions.ts:61`), com comentário
explícito: "Fase 02 só deixa de ser 'não prevista' quando houver fonte viva homologada de escopo
contratado. Sem ela, nada é prometido nem ofertado." Não existe, hoje, nenhum caminho de código que
jamais mude esse valor para `true`.

### 4.3 De-para contra a seção 4/100 da política nova

| Janela (política) | Regra da política | Estado real do código | Correspondência |
|---|---|---|---|
| D0 | "Fechada até gate `relatorio` + conteúdo" | `fase1Status` = `"em_preparacao"` até `entregasLiberadas > 0`; mas a fonte de `entregasLiberadas` é `documents.liberado_cliente`, não um gate `relatorio` nomeado nem conteúdo aprovado por `client_deliverables` | **Aproximada** — o efeito (fechada até haver conteúdo) bate; o mecanismo (qual tabela decide) diverge do que os outros módulos de micro-entrega (seção 1) tratam como fonte |
| D1–D30 | "Abrir apenas quando aplicável" | Mesmo cálculo acima — nenhuma checagem de janela de dias (D1–D30) existe no cálculo de `fase1Status`; é puramente "tem documento liberado ou não", sem relação com D0/tempo decorrido | **Aproximada** — abre "quando aplicável" no sentido de "quando há conteúdo", mas não modela a janela D1–D30 da política |
| D31–D90 | "Concluir/replanejar" | Não há um terceiro estado de "concluído" em `fase1Status` (só `em_preparacao`/`disponivel`; o tipo declara também `"entregue"` mas `escopoDoPortal` nunca atribui esse valor) | **Gap real** — o estado `"entregue"` existe no tipo (`app-visibilidade.ts:81`) mas está morto: nenhum código escreve nele |
| D91–D365 | "Histórico de Fase 01" | Não modelado — não há uma vista de "histórico" separada de "disponível" | **Gap real** |
| Fase 02, D0–D30 | "Bloqueada salvo condição excepcional" | `escopoIncluiFase2` hardcoded `false` — sempre bloqueada, sem exceção possível | **Aproximada, mas mais rígida que a política** — a política prevê exceção; o código não tem esse caminho |
| Fase 02, D31–D90 | "Liberar por gate `fase02` + condição" | Não existe nenhum gate `fase02` real — o campo nunca é calculado a partir de dado vivo | **Gap real** — corresponde exatamente ao "gap total" já sinalizado pelo comentário do próprio arquivo, mas fica formalmente registrado aqui contra a política nova |

## 5. D0 (10 critérios, seção 3 da política) × `GATES_FECHAMENTO` (9 gates, `fechamento-caso.ts`)

### 5.1 O que `fechamento-caso.ts` realmente é

Apesar do nome "Fechamento", o comentário do próprio arquivo (linhas 1–8) descreve exatamente um
conjunto de **portões de ativação**: "os nove gates de formalização... nenhum gate avança sozinho.
Cobrança, assinatura, pesquisa externa e comunicação continuam sendo atos humanos — aqui só se
registra e se bloqueia." A tela que o usa é a aba "Fechamento" de `/casos/$id`, mas o gate 9
(`caso_ativo`) tem `acaoDesk: "Abrir o caso operacional e a cadência de entregas"`
(`fechamento-caso.ts:116`) — ou seja, o "fechamento" aqui **abre** o caso para operação, não o
encerra. Isso já responde à instrução de não forçar equivalência sem checar o momento do ciclo de
vida: **os dois mecanismos tratam do mesmo momento (abertura/ativação), apesar do nome do arquivo
sugerir o oposto.**

### 5.2 De-para gate a gate

| Gate de fechamento | Condição de avanço real | Critério D0 da política | Correspondência |
|---|---|---|---|
| `aceite_comercial` (ordem 1) | "Proposta/escopo aprovado registrado" | 2. Contratante/partes confirmadas | **Aproximada** — cobre aceite, mas o critério 2 da política fala de "partes confirmadas no CRM", mais amplo que "proposta aprovada" |
| `cadastro` (ordem 2) | "Nome civil, CPF, endereço e contatos validados" | 2. Contratante/partes confirmadas no CRM | **Aproximada** — junto com `aceite_comercial`, cobre o critério 2 |
| `contrato` (ordem 3) | "Instrumento específico preenchido e assinado" | 5. Contrato/OS revisados humanamente + assinatura | **Exata** |
| `cobranca` (ordem 4) | "Cobrança criada/validada + pagamento inicial confirmado" | 6. Condição financeira confirmada | **Exata** |
| `dossie_mae` (ordem 5) | "Pasta canônica, acesso, responsável, subpastas confirmados" | 7. Dossiê mínimo de onboarding definido | **Exata** |
| `familia` (ordem 6) | "Núcleo criado, requerentes vinculados" | 1. Caso canônico e participantes identificados | **Aproximada** — parte do critério 1 (participantes), não cobre "caso canônico" isoladamente |
| `pesquisa` (ordem 7) | "Autorização e escopo de pesquisa registrados" | *(nenhum critério D0 correspondente)* | **Sem correspondência** — a política trata pesquisa como algo que começa **depois** de D0 (janela D4–D7 "diagnóstico operacional"), não como pré-condição de D0. O fechamento exige isso antes do caso ficar `caso_ativo` — divergência genuína de modelagem, não erro: fechamento mistura "pronto para abrir" com "pronto para pesquisar" |
| `onboarding` (ordem 8) | "Contrato assinado + pagamento + dossiê mínimo" | agregação de 5, 6, 7 | **Aproximada** — é um gate composto, não corresponde a um único critério da política |
| `caso_ativo` (ordem 9) | "Onboarding mínimo concluído" | 8. Responsável, próxima ação e prazo registrados (parcial) | **Aproximada** — depende de `onboarding_planos.plano_acao` preenchido (achado do PR #75, `fechamento-caso.functions.ts:79–82`), o que cobre parte do critério 8, não o critério inteiro |

### 5.3 Critérios D0 sem qualquer gate de fechamento correspondente

| Critério D0 da política | Existe em `fechamento-caso.ts`? |
|---|---|
| 3. Produto/SKU e escopo reconciliados com fonte viva | Não — nenhum gate verifica reconciliação de SKU contra `product_catalog` |
| 4. Perfil institucional vigente e gate contratual aprovado | Não — conceito não aparece nos 9 gates (é tratado em outro motor, o contratual — `MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md`, fora do escopo aqui) |
| 9. Conteúdo inicial do portal preparado e aprovado, se acesso liberado | Não — nenhum gate lê `client_deliverables`/`app_projections`/portal |
| 10. Nenhum bloqueio crítico de autorização, RLS, cadastro ou integridade | Não como gate nomeado — não há um gate "sem bloqueio de RLS" na lista dos 9 |

### 5.4 Conclusão desta seção

**Não são a mesma coisa, mas também não são momentos opostos do ciclo de vida** — a instrução do
pedido para não forçar equivalência "abertura vs. fechamento" se aplica parcialmente: apesar do
nome do arquivo, `fechamento-caso.ts` é sobre abertura/ativação, o mesmo momento do D0 da política.
A divergência real não é de momento, é de **cobertura**: dos 9 gates de fechamento, 6 batem (exata
ou aproximadamente) com 5 dos 10 critérios D0; o gate `pesquisa` não tem lugar na política (é
tratado como pós-D0); e 4 dos 10 critérios D0 (SKU/escopo, perfil institucional, conteúdo do
portal, ausência de bloqueio crítico) não têm gate correspondente hoje. Isto sugere — sem decidir —
que `fechamento-caso.ts` seria a base natural para implementar os 10 critérios D0 se a Proprietária
autorizar (é o único mecanismo já case-agnóstico, testado e com estrutura de gate/dependência
pronta), mas precisaria de 4 gates novos e da remoção de `pesquisa` da lista de pré-condições de
ativação (movendo-a para pós-D0, como a política desenha).

## 6. Sobre "cadência onboarding para todos" — sinalização, não verificação

A Proprietária mencionou ter "acabado de colocar cadência onboarding para todos" — provavelmente
uma ação em dados/UI do Desk, não em código. Esta sessão não tem acesso ao banco (MCP Supabase não
autorizado) e não tentou adivinhar o que foi alterado. Grep por variações de "aplicar cadência para
todos os casos" (`aplicar.*cadencia.*todos`, `bulk.*cadencia`, `aplicarCadenciaTodos`) não encontrou
nenhuma feature de código com esse nome — os três resultados do grep são frases não relacionadas
("mesma espinha dorsal para todos os casos", "template... reutilizável para todos os casos", "mesmo
padrão para todos os casos"), nenhuma delas uma função de aplicação em massa de cadência. Se a ação
da Proprietária foi feita diretamente no banco (ex.: um `UPDATE` em `case_plans` ou
`onboarding_planos` para todos os casos ativos), nenhum mecanismo de código aqui mapeado teria
gerado isso — vale confirmar com ela onde essa ação foi feita antes de qualquer decisão de
convergência.

## 7. O que este documento NÃO decide / não executa

- Nenhum arquivo em `src/` foi alterado. Nenhuma migration foi criada.
- Não decide qual vocabulário de `approval_status` em `client_deliverables` vira canônico (inglês
  de `onboarding-jornada.ts` ou português de `jornada-cliente.ts`) — só constata o conflito ativo
  na mesma coluna e sinaliza que, diferente da duplicação D7/D10/D14 do PR #75, este é risco de
  dado invisível entre telas, não só de manutenção.
- Não decide se `client_deliverables` e `ops_microentregas` devem ganhar uma FK entre si, nem qual
  vira a fonte de verdade de "micro-entrega" no sentido da política nova — só mapeia que, juntas,
  cobrem o modelo da seção 6, e que separadas, nenhuma cobre sozinha.
- Não decide se `ciclo-piloto-ana.ts` deve virar 7º dicionário de `jornada-de-para.ts` — recomenda
  que não, pelos motivos da seção 3.2, mas a decisão final é da Proprietária.
- Não corrige o comentário desatualizado de `app-visibilidade.ts:77` (que cita
  `client_deliverables` onde o código real lê `documents`) nem implementa os gates D0 ausentes de
  `fechamento-caso.ts` — apenas os registra.
- Não consultou o banco Supabase ao vivo — todo o mapeamento de tabela/coluna vem de
  `src/integrations/supabase/types.ts` e leitura de código, não de query real contra produção.
- Não verificou nem tentou adivinhar a ação "cadência onboarding para todos" mencionada pela
  Proprietária (seção 6) — não há acesso a banco nesta sessão para isso.
- Segue o mesmo padrão de todo de-para desta série: **mapear primeiro, decidir depois, executar só
  com autorização explícita da Proprietária.**

## 8. Fora do escopo

- Os sete mecanismos A–H de onboarding/cadência e a reconciliação de D7/D10/D14 — já cobertos por
  `docs/arquitetura/2026-09-03_DE-PARA-ONBOARDING-JORNADA-DE-VIDA-CADENCIA.md` (PR #75), não
  repetidos aqui.
- Os seis vocabulários de fase da jornada já pontuados por `src/lib/jornada-de-para.ts` — não
  recriados; usados como referência para o de-para da seção 3.
- A convergência de Faturas no `/portal/conta` (PR #72/#73) — mencionada na política nova (seção 4,
  linha "Faturas — Fora do pacote Ana") só como contexto; a política já registra Faturas como
  deliberadamente adiada, e este documento não reabre esse tema.
- Ativação do Google Calendar como espelho de cadência (seção 9 da política nova) — a própria
  política diz explicitamente que não deve ser ativado ainda; nenhum código de integração com
  Google Calendar foi buscado nesta sessão por estar fora do pedido.
- O motor contratual (`contract_case_parameters`, perfil institucional) — endereçado em
  `docs/arquitetura/MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md`, citado na seção 5.3 só
  como referência de onde o critério D0 #4 provavelmente pertence.
