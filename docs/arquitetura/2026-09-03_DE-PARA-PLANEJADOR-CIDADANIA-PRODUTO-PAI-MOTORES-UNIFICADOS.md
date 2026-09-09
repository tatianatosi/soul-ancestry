# De-Para — Planejador de Cidadania × Produto-Pai × Motores Unificados × Pessoa 360

```yaml
status: mapeamento — nenhum código alterado, aguardando decisão da Proprietária
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: de-para de convergência (arquitetura interna) / correção pontual ao PR #76
responsável pela decisão: Proprietária Administradora do Clube Ancestral (Tatiana Melani Tosi)
base normativa: pedido verbatim da Proprietária (03/09/2026, ver "Causa"); PR #76
  (docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md, seção 2);
  PR #67 (docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md, v1.1);
  PR #64 (docs/arquitetura/2026-09-03_PESSOA-360-CONJUNTO-UNIFICADO-DE-DADOS.md);
  PR #65 (docs/auditorias/2026-09-03_LEVANTAMENTO-FICHA-PILOTO-GENEALOGICA-CLIENTE-CRM-VIVO.md);
  PR #59 (docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md,
  arquivado); PR #61 (docs/prompts/instrucoes-motor-cidadania-v1.0.md, arquivado);
  docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md (já em `main`);
  docs/evolucao/recuperados/fontes-primarias/LOVABLE-CHAT_2026-08-25.md;
  docs/evolucao/recuperados/prompts-lovable-2026-08-31/CA_Planejador_Jornada_Microentregas_Touchpoints_SKU.md
repositório: tatianatosi/soul-ancestry
fonte: leitura completa de src/lib/cadeia-operacional.ts, cadeia-operacional.server.ts,
  cadeia-operacional.functions.ts, planejador-parametros.ts, orquestracao-jornada.ts,
  catalogo-desk.ts, preco-canonico.ts, case-service-consolidacao.ts; leitura de
  src/components/contrato/planejador-operacional.tsx; leitura de
  src/integrations/supabase/types.ts (schema de `case_plans`, `product_catalog`); grep completo
  de "produto_pai"/"produto-pai" em src/ e supabase/migrations/; leitura dos 4 documentos
  históricos citados acima (2 já arquivados como legado, 1 já em `main`, 1 recuperado de prompts
  Lovable); em 2026-09-03
limite desta sessão: o MCP do Supabase não está autorizado neste ambiente — nenhuma tabela real
  foi consultada ao vivo. Todo o mapeamento de coluna/tabela vem de
  `src/integrations/supabase/types.ts` (schema gerado) e leitura de código, não de query real
  contra o banco em produção. Esta sessão também não altera nenhum arquivo de `src/`, não cria
  branch nem PR — é leitura e documentação apenas.
```

## Causa

Pedido da Proprietária (03/09/2026, verbatim): "Relembrando o planejador de cidadania está ligado
conectado aos motores unificados e pessoas canônicas e pessoa 360 reveja no material histórico sim
tem um prompt que envolve as jornadas com produto pai micro entrega e cadência de onboarding."

Isso corrige/complementa a seção 2 do PR #76, que concluiu que "planejador" no código atual
(`planejador-parametros.ts`, `planejador-operacional.tsx`) é só sobre parâmetros/escopo de
contrato, sem relação com cadência, e recomendou "não force correspondência". Este documento
reexamina essa conclusão à luz do material histórico apontado pela Proprietária e de um mecanismo
de código que o PR #76 leu mas sub-relatou.

**Resumo do achado, antes do detalhamento:** a Proprietária está certa sobre a existência do
material histórico — não um prompt único, mas pelo menos dois documentos, um deles já em `main`,
que amarram explicitamente jornada + produto-pai + micro-entrega + cadência de onboarding. E está
parcialmente certa sobre o código: existe hoje um mecanismo real, vivo e testado (`case_plans` via
`cadeia-operacional.ts`) que o próprio código rotula como **"Planejador operacional"** e que carrega
fase da jornada e produto (via SKU), o que o PR #76 não destacou. Mas esse "planejador" real segue
**sem nenhuma ligação de código** com o motor de cadência D0–D365 (`orquestracao-jornada.ts`,
CA-OPS-01/02, que a PR #67 confirmou ser o motor real de cadência) nem com Pessoa 360/Pessoa
Canônica (PR #64/#65) — são três motores reais, vivos, mas **desconectados entre si**. E o
`produto_pai_id` (coluna FK auto-referencial em `product_catalog`) segue confirmado morto: nenhum
consumidor em código, nenhuma migration além da que o criou. O "produto-pai" que de fato vive em
código hoje é outro mecanismo, não essa coluna — ver seção 3.

## 1. O material histórico: não um prompt único, mas dois documentos que já amarravam os quatro elementos

Nenhum documento recuperado usa literalmente as quatro palavras-chave (jornada, produto-pai,
micro-entrega, cadência de onboarding) ao mesmo tempo com essa grafia exata. Mas dois documentos,
somados, cobrem os quatro conceitos amarrados entre si — um já em `main`, outro só arquivado como
legado/prompt.

| Elemento citado pela Proprietária | Documento histórico que amarra o conceito | Arquivo:linha | Status do documento hoje |
|---|---|---|---|
| Jornada + produto-pai (hierarquia/combo) | "Planejador Universal, Produtos-Pai e Jornada — Revisão Final" | `docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md`, seção 4 ("Taxonomia de produtos-pai", `P01`–`P09`) e seção 5.1 (macroetapas `J0`–`J8` cada uma mapeada a um produto-pai) | **Arquivado como legado** na PR #59 (commit `8bef659`, branch `docs/arquiva-planejador-universal-produtos-pai-jornada-2026-09-03`) — proprietária decidiu não criar as 11 entidades novas do documento, reaproveitar tabelas existentes |
| Jornada + produto-pai + micro-entrega + onboarding (fluxo) | "Instruções de Construção do Motor Planejador de Cidadania" | `docs/prompts/instrucoes-motor-cidadania-v1.0.md`, seção "Integração comercial" (linhas 941–972): "3. produto-pai identificado no catálogo homologado; 4. componentes e microentregas definidos [...] → onboarding" | **Arquivado como legado** na PR #61 (commit `db06edd`, branch `docs/arquiva-instrucoes-motor-cidadania-2026-09-03`) — proprietária confirmou "permanece contexto e segue as instruções corretas do planejador", mas o documento nunca saiu de "em revisão" |
| Jornada + produto-pai + micro-entrega + cadência de onboarding (os quatro juntos, com números D+) | "Decisões Canônicas: CRM, Catálogo, Planejador e Jornada" | `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md`, §7 (Planejador e trilhas), §8 ("Produtos-pai por jornada", CA-DIAG-001 etc.), §10 ("Onboarding e ciclo do cliente" — cadência D0/D1–D3/D7/D10/D14/D30), §11 (Micro-entregas, `client_deliverables`) | **Já em `main`** (não arquivado; datado 19/08/2026, mais antigo que os outros três) |
| Jornada + produto-pai + micro-entrega + cadência de onboarding (touchpoints por fase, SKU por evento) | "Planejador de Cidadania, Jornada, Micro-entregas, Touchpoints e SKUs" | `docs/evolucao/recuperados/prompts-lovable-2026-08-31/CA_Planejador_Jornada_Microentregas_Touchpoints_SKU.md`, seções 1–5 | **Nunca arquivado formalmente** — está em `docs/evolucao/recuperados/`, tratado como material recuperado, não como decisão canônica ativa |

**Conclusão da seção 1:** o documento que mais literalmente amarra os quatro elementos com números
de cadência concretos é `CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md` — e ele já
está em `main`, não em uma branch aguardando revisão. Isso é relevante porque a implementação real
(`case_plans`, ver seção 3) foi confirmada como executada em
`docs/evolucao/recuperados/fontes-primarias/LOVABLE-CHAT_2026-08-25.md:15640`: *"case_plans já
contempla todos os campos do planejador (fase, marco, próxima ação, pendências, micro-entrega,
limite de 14 dias, saúde)"* — a mesma sessão de implementação (25/08/2026) que criou a coluna
`produto_pai_id` (linha 15638 do mesmo arquivo). Os dois nasceram na mesma migration/sessão, o que
explica por que a Proprietária lembra dos dois conectados.

## 2. Correção ao PR #76, seção 2: "planejador" no código tem, sim, uma face ligada à jornada — só não é a face de cadência

O PR #76 leu `cadeia-operacional.ts` e concluiu que "planejador" no código é só
`planejador-parametros.ts` (lista estática) e um formulário de escopo contratual sem relação com
jornada/cadência. Isso está correto sobre `planejador-parametros.ts`, mas **incompleto** sobre
`cadeia-operacional.ts` — o próprio arquivo que o PR #76 leu se autodenomina, no cabeçalho e em uma
constante exportada, como o motor do "Planejador":

```
src/lib/cadeia-operacional.ts:1-8 (docstring do módulo)
"PLANEJADOR (case_plans) → PROPOSTA ESTRUTURADA (proposals) →
 SKU/PREÇO (product_catalog, Planilha Mestre) → CONDIÇÃO COMERCIAL
 (commercial_conditions) → OS/ANEXO I (service_orders + contract_scope_items) → [...]"

src/lib/cadeia-operacional.ts:429 (ELOS_OPERACIONAIS, primeiro elo)
{ chave: "planejador", titulo: "Planejador operacional", entrada: "crm_casos/leads", saida: "case_plans" }
```

| Conceito histórico (CA-DECISOES-CANONICAS §7/§8) | Mecanismo real hoje | Arquivo:linha | Correspondência | Observação |
|---|---|---|---|---|
| Planejador gera checklist/próximos passos por caso | `avaliarPlanejador(EntradaPlanejador): SaidaPlanejador` | `cadeia-operacional.ts:81-128` | **Aproximada** | Função pura, não infere nada (declarado na linha 79); transforma pendências/bloqueios explícitos a partir do que falta na entrada — bate com "sem decisão jurídica automática" da política |
| "Fase" da jornada dentro do plano do caso | `case_plans.fase_jornada` | `types.ts:1672`; escrito por `SaidaPlanejador.fase_jornada` (`cadeia-operacional.ts:47,110`) | **Exata** | Campo real, gravado pelo planejador operacional |
| Produto-pai vinculado ao plano do caso | `case_plans.product_catalog_id`, resolvido a partir de `EntradaPlanejador.produtoSkuCodigo` via lookup em `product_catalog` | `cadeia-operacional.server.ts:116-128,211-212,253,347,381,411,716` | **Exata, mas não via `produto_pai_id`** | A ligação planejador↔produto é real e wireada — mas é `case_plans.product_catalog_id → product_catalog.id` (a linha do SKU escolhido), não a coluna `produto_pai_id` (hierarquia entre SKUs) — ver seção 3 |
| Micro-entrega prevista no plano | `case_plans.microentregas` (texto livre) | `cadeia-operacional.ts:42,59,95,100,415`; comentário na própria linha 415: `"Microentrega prevista no planejador."` | **Aproximada** | Confirma o que o PR #76 já havia mapeado como mecanismo #5 de micro-entrega (seção 1.0, item 5 do PR #76) — é texto solto, sem `id`, sem `status`, sem ligação por chave a `client_deliverables`/`ops_microentregas` |
| Cadência (D0/D7/D10/D14/D30) do onboarding | **nenhum campo em `avaliarPlanejador`/`EntradaPlanejador`** | — | **Gap confirmado** | O PR #76 está certo neste ponto específico: não há lógica de dia/prazo dentro do motor do planejador. `case_plans` tem colunas com nome de cadência (`dias_sem_touchpoint`, `proxima_atualizacao_limite_em`, `status_saude`) mas elas não são escritas por `avaliarPlanejador` — são preenchidas/lidas por outros módulos (`painel-cadencia-derivada.ts`, `alertas-derivados.ts`, `derivacao-jornada.ts`), não pelo "elo 1" da cadeia operacional |

**Correção proposta ao PR #76, seção 2.3:** a frase "planejador não tem nada a ver com jornada" é
forte demais. O código correto seria: *"planejador" (`case_plans` via `cadeia-operacional.ts`) tem
uma face real ligada a jornada (`fase_jornada`) e a produto (`product_catalog_id` por SKU), mas
nenhuma face de cadência D0–D365 — essa fica inteiramente em outro motor (seção 4 abaixo). O achado
central do PR #76 (nenhum "planejador de cadência" existe) continua válido; o que muda é que
"planejador" não é *apenas* `planejador-parametros.ts` — é também esse elo 1 vivo da cadeia
operacional, e ele carrega jornada e produto, só não cadência.*

## 3. `produto_pai_id`: coluna morta confirmada — o "produto-pai" vivo em código é outro mecanismo

Nova varredura, como pedido, confirma o levantamento anterior: `produto_pai_id` (FK
auto-referencial em `product_catalog`, criada em
`supabase/migrations/20260821133440_329e42ed-b0f1-42c5-8f4e-90eb0a1cdd18.sql:3`) **não tem nenhum
consumidor em `src/` nem em nenhuma outra migration**. `grep -rn "produto_pai_id"` em
`supabase/migrations/` retorna só a linha que a criou; nenhuma view, RPC ou função a lê ou escreve.

Mas a expressão **"produto-pai" está viva em código real**, só que não é essa coluna — é um
conceito/rótulo aplicado à própria linha de `product_catalog` que o caso contratou, não uma relação
pai↔filho entre linhas:

| Onde "produto-pai" aparece em código real | Arquivo:linha | O que significa ali |
|---|---|---|
| Tipo de oferta do catálogo | `src/lib/catalogo-desk.ts:15`: `export type TipoOferta = "produto_pai" \| "complemento" \| "contextual"` | Classifica a própria linha do catálogo — "este SKU É um produto-pai" (vendável isoladamente), em oposição a complemento/contextual (exige `case_service`) — não aponta para outra linha |
| Bloqueio de precificação | `src/lib/preco-canonico.ts:111`: `"Caso sem produto-pai homologado vinculado (product_catalog)"` | Refere-se ao `product_catalog` vinculado ao `case_service`/`case_plan` do caso — o SKU escolhido, não um FK hierárquico |
| Bloqueio de escopo | `src/lib/escopo-conferencia.ts:131`: `"Caso sem case_service (produto-pai/trilha)"` | Mesmo sentido — `case_service` concentra "produto-pai, trilha, escopo e condição" |
| Consolidação de case service | `src/lib/case-service-consolidacao.ts:113`; `src/lib/decisoes-operacionais.ts:632,656`; `src/lib/caso-ficha.ts:109`; `src/lib/gates-formalizacao.ts:227`; `src/lib/caso-canonico.functions.ts:63` | Todos usam "produto-pai" como sinônimo de "o produto que o `case_service`/`case_plan` do caso aponta", nunca como hierarquia SKU→SKU |

**Conclusão da seção 3:** há uma sobreposição terminológica real, não uma correspondência de
mecanismo. O desenho histórico (PR #59, taxonomia P01–P09) previa produto-pai como **categoria
ampla que agrupa módulos/derivados** (ex.: P02 "Reconstrução genealógica" absorve "pesquisa base,
estudo aprofundado, pesquisa por sobrenome"). O código vivo usa "produto-pai" como **o SKU
individual vinculado ao caso**, sem agrupamento de módulos-filhos. A coluna `produto_pai_id` foi
criada para modelar exatamente a ideia histórica (SKU-filho apontando para um produto-pai) e nunca
foi conectada a nada — é "lista/dicionário que não foi implantado", mesma categoria já sinalizada
em sessões anteriores (uma FK real, viva no schema, zero leitura/escrita).

## 4. `planejador-parametros.ts` × `case_plans`: duas peças diferentes do mesmo desenho, não motores concorrentes

| Pergunta | Resposta |
|---|---|
| São a mesma coisa? | Não. |
| São peças complementares? | Sim, mas raramente citadas juntas em código — não há import cruzado entre `planejador-parametros.ts` e `cadeia-operacional.ts`/`case_plans`. |
| São dois desenhos concorrentes? | Não — atendem perguntas diferentes e não competem pelo mesmo dado. |

`planejador-parametros.ts` (linhas 1-13, cabeçalho): "Planejador Universal como FONTE CANÔNICA de
parâmetros... homologados no Planejador Universal... entram na ficha contratual com origem
`planejador`" — é uma lista estática (`CONVENCOES_PLANEJADOR`) de convenções fixas por `case_id`
(tipo de processo, país, rota, SKU, etapas descritivas em texto). Não lê nem escreve `case_plans`.
É, na prática, um dicionário de valores de referência para preencher a ficha contratual — "lista",
não "motor".

`case_plans` (via `cadeia-operacional.ts`/`.server.ts`) é o motor real que **grava** o plano
operacional do caso — fase, produto, micro-entregas em texto, pendências, próxima ação — e serve de
entrada para a proposta estruturada seguinte na cadeia (`ELOS_OPERACIONAIS`). É "motor", não
"lista".

**Achado confirmado:** `LOVABLE-CHAT_2026-08-25.md:15640` já registrava a intenção — "case_plans já
contempla todos os campos do planejador" — como um único destino de dado. O código de hoje cumpre
essa intenção via `cadeia-operacional.ts`, e `planejador-parametros.ts` é um insumo separado
(convenções de contrato), não um segundo motor de plano. Não há duplicação de mecanismo aqui — são
uma lista de parâmetros e um motor de plano, cada um resolvendo uma pergunta diferente, como o PR
#76 já havia concluído sobre `planejador-parametros.ts` isoladamente.

## 5. Motores Unificados (PR #67) e Pessoa 360 (PR #64/#65) × Planejador — lacuna nova, não registrada antes

Releitura integral dos dois documentos já escritos confirma: **nenhum dos dois registrou a conexão
entre "planejador"/`case_plans`/produto-pai e o próprio motor deles.**

| Documento | Menciona `case_plans`? | Menciona "planejador"? | Menciona produto-pai/`produto_pai_id`? | O que cobre em vez disso |
|---|---|---|---|---|
| PR #67 — Motores Unificados / CRM Vivo (v1.1) | Não | Não | Não | Confirma que o motor de cadência real é `orquestracao-jornada.ts` (CA-OPS-01/02) — ver seção 6. Mapeia `micro_deliveries` → tabela real `microentregas` (6 linhas) e `product_catalog`/`sku_catalog` — mas nunca cruza com `case_plans` |
| PR #64 — Pessoa 360 (conjunto unificado de dados) | Não | Não | Não | Cobre 5 camadas de dado da pessoa (ficha piloto, genealógica, cliente, CRM vivo) — nenhuma delas é o plano/produto do caso |
| PR #65 — Levantamento ficha piloto genealógica/cliente/CRM vivo | Não | Não (só em lista de referências) | Não | Levantamento de fontes históricas para o PR #64; não entra em `case_plans` |

**Conclusão da seção 5:** a ligação que a Proprietária lembra ("o planejador está conectado aos
motores unificados e pessoa 360") **não está registrada em nenhum de-para anterior desta série** —
não porque a conexão exista e tenha sido omitida, mas porque, verificando o código, **essa conexão
não existe hoje**. `case_plans.family_id` é o único campo estrutural que aponta na direção de
"pessoa"/família (`types.ts:1671`), mas nenhum dos três documentos (PR #64, #65, #67) o cita, e
esta sessão não encontrou nenhum ponto de código que leia `case_plans.family_id` para compor a
Pessoa 360. É lacuna nova, real, ainda não mapeada — não uma correspondência que algum documento já
tinha registrado e este trabalho recupera.

## 6. Planejador × cadência real: dois motores vivos, testados, e desconectados entre si

A PR #67 (v1.1, já corrigida pela Proprietária) confirmou que o motor de cadência real **existe** e
não é hipótese: `src/lib/orquestracao-jornada.ts` (CA-OPS-01/02), testado
(`ca-ops-01-orquestracao-jornada.test.ts`, `ca-ops-02-orquestracao-contextual.test.ts`), com uma
cadeia de 11 elos (`ELOS_CADEIA`) ligando CRM → Onboarding → Cadência → Microentregas → Alertas →
Painel Hoje, visível em `/biblioteca-mensagens`.

Esta sessão confirma, por grep direto em `orquestracao-jornada.ts`, que esse arquivo **não contém
nenhuma referência** a `case_plans`, `planejador`, `product_catalog` ou `produto_pai` — zero
ocorrências das quatro strings. É um motor genuinamente separado do "Planejador operacional"
(`cadeia-operacional.ts`) mapeado nas seções 2 e 4 acima.

| Motor | Arquivo | O que faz | Conecta a `case_plans`? | Conecta a produto/SKU? |
|---|---|---|---|---|
| Planejador operacional | `cadeia-operacional.ts` + `.server.ts` | Grava plano do caso (fase, produto, micro-entregas texto, pendências) | É a origem — grava `case_plans` | Sim — `case_plans.product_catalog_id` |
| Cadência/orquestração | `orquestracao-jornada.ts` (CA-OPS-01/02) | Liga onboarding → cadência → micro-entrega estruturada (`microentregas`, tabela) → alertas → Painel Hoje | **Não** — zero referência a `case_plans` | **Não** — zero referência a `product_catalog`/produto-pai |

**Isso é o achado central deste documento.** A intenção histórica (CA-DECISOES-CANONICAS §7-§11,
19/08/2026) sempre tratou planejador/produto/jornada/cadência como um conjunto amarrado. A
implementação real construiu **dois motores corretos e vivos**, cada um cobrindo metade do desenho
original, sem FK nem chamada de função entre eles. Não é um gap de "nunca implementado" (como
`produto_pai_id`) — é um gap de **integração entre dois mecanismos que já existem e funcionam
isoladamente**.

## 7. Não force correspondência: o que NÃO é verdade, mesmo depois desta revisão

- Não é verdade que exista hoje um "Motor Planejador de Cidadania" único, no sentido dos documentos
  arquivados (PR #59/#60/#61) — aquele motor descrito (avaliação jurídica multipaís, hipóteses de
  rota, `country_catalog`/`legal_frameworks`/`citizenship_routes`) nunca foi implementado; o que
  existe sob o nome "planejador" no código (`cadeia-operacional.ts`) é outra coisa: um motor de
  plano/escopo operacional por caso, não um motor de elegibilidade jurídica.
- Não é verdade que `produto_pai_id` conecte hoje jornada, produto e micro-entrega — essa coluna
  segue morta; a conexão real passa por `case_plans.product_catalog_id`, um campo diferente, com
  semântica diferente (SKU do caso, não hierarquia de SKU).
- Não é verdade que a cadência D0–D365 (`orquestracao-jornada.ts`) leia ou escreva o "planejador"
  (`case_plans`/`cadeia-operacional.ts`) — são motores paralelos, não uma cadeia única, apesar de o
  desenho histórico prever os dois como uma coisa só.
- Não é verdade que PR #64/#65/#67 já tenham registrado a ligação planejador↔motores
  unificados↔pessoa 360 — não registraram; é lacuna nova identificada aqui, não uma correção de
  omissão anterior.

## O que este documento NÃO decide

- Não decide se o "Motor Planejador de Cidadania" jurídico/multipaís dos documentos arquivados
  (PR #59/#60/#61) deve ser retomado, construído do zero ou definitivamente descartado como
  intenção — só constata que nunca foi implementado.
- Não decide se `produto_pai_id` deve ganhar um consumidor real (hierarquia de combos) ou ser
  formalmente marcado como legado/arquivado no schema — só confirma que está morto hoje.
- Não decide se `case_plans` (via `cadeia-operacional.ts`) e `orquestracao-jornada.ts` (CA-OPS-01/02)
  devem ganhar uma ligação de código (FK, chamada de função, ou leitura cruzada) — só mapeia que
  hoje não têm nenhuma, e que essa é provavelmente a lacuna que a Proprietária está lembrando do
  material histórico.
- Não decide se `case_plans.microentregas` (texto livre) deve ser substituído por referência
  estruturada a `client_deliverables`/`ops_microentregas` — o PR #76 já registrou essa mesma
  pergunta em aberto para o mecanismo #5 do seu inventário; este documento não reabre nem resolve.
- Não decide se Pessoa 360 (PR #64) deve incorporar `case_plans.family_id` como uma sexta camada de
  dado — só sinaliza que hoje não incorpora.
- Não consultou o banco Supabase ao vivo — todo o mapeamento de tabela/coluna vem de
  `src/integrations/supabase/types.ts` e leitura de código, não de query real contra produção.
- Não altera nenhum arquivo de `src/`, não cria migration, não cria branch nem PR — é mapeamento
  para revisão da Proprietária antes de qualquer decisão de convergência.
- Segue o mesmo padrão de todo de-para desta série: **mapear primeiro, decidir depois, executar só
  com autorização explícita da Proprietária. Nada é apagado, só arquivado/documentado.**
