# De-Para — Onboarding, Cadência e Ciclo de Jornada de Vida: mecanismos reais × histórico

```yaml
status: mapeamento — nenhum código alterado, aguardando decisão da Proprietária
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: de-para de convergência (arquitetura interna) / auditoria de onboarding e cadência
responsável pela decisão: Proprietária Administradora do Clube Ancestral (Tatiana Melani Tosi)
base normativa: docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md;
  docs/operacao/CA-OPS-01_Matriz_Eventos_Acoes_Templates.csv;
  docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md;
  docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md (§10.3);
  docs/auditoria/CA-AUD-12_Cotejo_Fases_Jornada_Touchpoints_2026-08-26.md;
  docs/auditoria/MAPA-EXCECOES-OPERACIONAIS-v1.0.md;
  docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md (v1.1, correção sobre cadência);
  docs/arquitetura/2026-09-03_DE-PARA-PILOTO-ANA-CONVERGENCIA-REALIDADE.md (achado do passo 7, não auditado até agora)
repositório: tatianatosi/soul-ancestry
fonte: leitura completa de src/lib/orquestracao-jornada.ts, cadencia-onboarding.ts, cadencia-d0-d30.ts,
  onboarding-padrao.ts, onboarding-jornada.ts, onboarding-jornada.functions.ts, onboarding-plano.ts,
  onboarding-plano.functions.ts, onboarding.functions.ts, onboarding-regras.ts, jornada-pos-gates.ts,
  fechamento-caso.ts, fechamento-caso.functions.ts, fiacao-cadencia-catalogo.ts,
  consolidacao-catalogos-templates.ts, jornada-cliente.ts (calcularCadencia), trecho de caso-ficha.ts
  (gatesClienteAtivo); src/components/caso/onboarding-caso.tsx, onboarding-plano.tsx, jornada-pos-gates.tsx;
  src/components/desk/orquestracao-contextual.tsx; src/components/painel/painel-onboarding-jornada.tsx;
  src/routes/_authenticated/onboarding.$id.tsx (completo) e grep de casos.$caseId.index.tsx,
  biblioteca-mensagens.tsx, ops.tsx para confirmar wiring real; varredura de
  docs/evolucao/recuperados/{prompts-lovable,prompts-lovable-2026-08-31,fontes-primarias,estudos-ux}/,
  docs/auditoria/CA-AUD-12..., docs/auditoria/MAPA-EXCECOES-OPERACIONAIS-v1.0.md,
  docs/governanca/CA-DECISOES-CANONICAS-...-v1.0.md, docs/ux/fase-c-... e fase-d-...,
  docs/operacao/CA-OPS-01.../CA-OPS-02..., em 2026-09-03.
limite desta sessão: o MCP do Supabase não está autorizado neste ambiente — nenhuma tabela real foi
  consultada ao vivo. Toda evidência de "quais tabelas cada mecanismo lê/escreve" vem de leitura de
  código (`.from("...")`), não de uma query real contra o banco. Isso está sinalizado onde relevante.
```

## Causa

Pedido da Proprietária (03/09/2026, em português, verbatim): "verifique todos os mecanismos
utilizados pela ana seja por casos e núcleos, verifique esse módulo que tem o onboarding
provavelmente é a cadência que permeia em todo o onboarding se você verificar todo material sobre
as mecânicas de onboarding nos documentos históricos faça um de para de todos os estudos de
onboarding para unificar de uma vez por toda o ciclo jornada de vida revise junto com a política
cadência e veja também o que é só lista dicionário e não foi implantado".

Três pedidos nessa frase, tratados nas três seções seguintes:
1. Verificar os mecanismos reais que tratam o caso da Ana (`crm_casos`, `nucleos_familiares`/
   `nucleo_membros`) e confirmar (ou refutar) a hipótese de que existe **um** módulo de onboarding
   que já é a cadência — seção 1.
2. Varrer o material histórico sobre onboarding/cadência e montar o de-para — seção 2.
3. Separar o que é lista/dicionário estática (nunca virou lógica executando) do que é gap real —
   seção 2, coluna "é só lista/dicionário" — e reconciliar o conflito de regras de dias — seção 3.

**Achado prévio que corrige a hipótese de partida:** não existe *um* módulo de onboarding que seja
*a* cadência. Existem **sete mecanismos reais e distintos**, em código, cada um vivo, testado e
wireado numa rota diferente — nenhum inventado para esta pesquisa. A cadência (no sentido de "dias
desde o último contato" → regular/atenção/crítico) é de fato transversal, mas está implementada uma
vez como primitiva pura (`calcularCadencia`, `jornada-cliente.ts`) e depois **redeclarada** — não
importada — como constantes equivalentes em pelo menos cinco arquivos diferentes. A seção 3
reconcilia isso.

## 1. Inventário dos mecanismos reais de onboarding/cadência

Sete mecanismos, cada um lido por inteiro nesta sessão. A tabela-resumo vem primeiro; o detalhe de
cada um, com citação exata, vem depois.

| # | Mecanismo | Arquivo(s) | Rota real | Tabela(s) | Tipo de regra de dia |
|---|---|---|---|---|---|
| A | Orquestração de eventos + fiação de cadência (CA-OPS-01) | `orquestracao-jornada.ts` | `/biblioteca-mensagens` (`OrquestracaoContextual`) | **nenhuma** — `caso_id`/data digitados à mão na tela | acolhimento D+3 (fixo no código) |
| B | Fiação alerta→template (rotulado CA-OPS-02 no próprio doc) | `fiacao-cadencia-catalogo.ts` | `/ops` (`painel-onboarding-jornada.tsx`) | `case_plans`, `onboarding_checklist`, `case_alerts`, `client_deliverables`, `case_espera_externa`, `touchpoints` (via mecanismo E) | D10/D14 (herdado de E) |
| C | Plano por caso + cadência de marcos | `onboarding-plano.ts`, `cadencia-onboarding.ts`, `cadencia-d0-d30.ts` | `/casos/$id` aba Onboarding (`PainelPlanoOnboarding`) | `onboarding_planos`, `crm_casos`, `communication_queue` | catálogo por item (D2–D14) + norma D0/D1–D3/D7/D10/D14/D30 |
| D | "Gates de cliente ativo" (inline, sem arquivo próprio de regra) | `caso-ficha.ts` (`gatesClienteAtivo`) | `/casos/$id` aba Onboarding (mesma tela do mecanismo C) | nenhuma — deriva de props já carregadas | nenhuma (booleano puro) |
| E | Diagnóstico de gates + cadência de acompanhamento (CA-LOVABLE-ONBOARDING-JORNADA) | `onboarding-jornada.ts`, `onboarding-jornada.functions.ts` | `/ops` (`painel-onboarding-jornada.tsx`) | `case_plans`, `onboarding_checklist`, `case_alerts`, `client_deliverables`, `case_espera_externa`, `touchpoints`, `crm_casos` | D7/D10/D14 (`CADENCIA`) |
| F | "Jornada após gates" / Corte J | `jornada-pos-gates.ts`, `jornada-pos-gates.tsx` | `/casos/$id` aba Onboarding (mesma tela dos mecanismos C e D) | nenhuma direta — lê `research_cases`/fontes via `ficha-piloto-genealogica.functions.ts` | D7/D10/D14 (`D_PRIMEIRA_ENTREGA`/`D_ALERTA_INTERNO`/`D_ALERTA_CRITICO`) |
| G | Ativação por checklist (gate de ligar o caso) | `onboarding.functions.ts`, `onboarding-regras.ts` | `/onboarding/$id` | `case_activation_checks`, `crm_casos`, `audit_logs` | nenhuma — checklist humano puro |
| H | Fechamento do caso — 9 gates | `fechamento-caso.ts`, `fechamento-caso.functions.ts` | `/casos/$id` aba Fechamento (e referenciado como `caso-go-live` em `desk-modulos.ts`) | `crm_casos`, `checklist_cadastral`, `contracts`, `invoices`, `nucleos_familiares`, `nucleo_membros`, `consent_records`, `onboarding_planos`, `tarefas` | nenhuma direta — usa `calcularCadencia` só para o card de saúde do caso |

**Leitura da tabela, em uma frase:** existem **duas famílias de tabela** para "o plano de
onboarding do caso" — `onboarding_planos` (mecanismos C e H) e `case_plans` (mecanismos B e E) —
nunca lidas uma pela outra, e **quatro painéis de gate diferentes** (C, D, F, mais o checklist de H)
empilhados na mesma aba "Onboarding" de `/casos/$id`.

### 1.A — CA-OPS-01: orquestração de eventos (`orquestracao-jornada.ts`)

Módulo puro de ~1080 linhas. Contém o catálogo de templates governados (`TEMPLATES_GOVERNADOS`,
linhas 65–209), a cadeia de 11 elos (`ELOS_CADEIA`, linhas 782–795, testada em
`ca-ops-01-orquestracao-jornada.test.ts`) e `fiarCadenciaDoCaso` (linhas 1005–1081), que resolve o
template vigente a partir da cadência real de um caso.

`planejarOnboarding` (linhas 511–544) usa um prazo de acolhimento padrão de **3 dias**
(`entrada.prazoDias ?? 3`, linha 531) — isso bate exatamente com a linha `onboarding_elegivel` da
matriz CA-OPS-01 (`docs/operacao/CA-OPS-01_Matriz_Eventos_Acoes_Templates.csv:9`: "3 dias uteis"
para "Acolhimento de onboarding"). É a única regra de dia deste arquivo que tem fonte normativa
própria; o resto do arquivo não deriva prazo, só estado.

**Wiring real, confirmado em `src/components/desk/orquestracao-contextual.tsx`:** o componente
`OrquestracaoContextual`, montado em `/biblioteca-mensagens` (`biblioteca-mensagens.tsx:5,243`), é
um **simulador manual**, não um painel automático. O `caso_id` e a data do último touchpoint são
digitados em campos de texto pela pessoa que usa a tela (`orquestracao-contextual.tsx:174–192`); o
próprio componente avisa duas vezes que nenhum dado é carregado do banco: "Nenhum evento
selecionado... **Nenhum dado de caso é carregado neste painel**" (linha 90) e "Sem caso informado.
**Nenhum dado de caso é carregado ou consultado neste painel**" (linha 197). Ou seja: o motor é
real e testado, mas a tela que o expõe não lê `crm_casos` nem nenhuma outra tabela — é uma
calculadora "e se", não um radar automático do caso da Ana.

### 1.B — Fiação alerta→template (rotulada CA-OPS-02 no próprio doc)

`fiacao-cadencia-catalogo.ts` (323 linhas, confirmado pelo comentário da Fase C do estudo de UX —
seção 2 abaixo). Cabeçalho próprio: "CA-OPS-02 — Fiação read-only entre cadência
(Onboarding-Jornada), Biblioteca de Mensagens e catálogo de módulos" (linhas 1–10). Contém
`MAPA_ALERTA_TEMPLATE` (tipos `sem_touchpoint_10d`, `sem_atualizacao_14d`, `sem_proxima_acao`,
`sem_microentrega_planejada`, `caso_bloqueado`) e `resolverModeloVigente`.

**Este é o mecanismo que `docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md` documenta
de fato** — confirmado por grep: o doc cita `src/lib/fiacao-cadencia-catalogo.ts` por nome (linha
12) e `obterPainelJornada` de `onboarding-jornada.functions.ts` (linha 6) como fonte do `case_id`.
Wireado em `painel-onboarding-jornada.tsx:8–11`, dentro de `/ops`
(`desk-operacional.tsx`/`ops.tsx`), **lendo dado real por caso** (mecanismo E, abaixo).

### 1.C — Plano de onboarding e cadência de marcos (`/casos/$id` aba Onboarding)

Três arquivos que trabalham juntos, todos lidos por inteiro:

- `onboarding-padrao.ts` — catálogo case-agnóstico com 12 itens (`CHECKLIST_ONBOARDING`, linhas
  34–47), cada um com `prazo_dias` (`dossie_mae`: 7, `ambiente_acesso`: 3, `checklist documental`:
  5, `plano de ação`: 5, `call de onboarding`: 7, `boas-vindas`: 2, `primeira micro-entrega`: 7,
  `data-limite de atualização`: 14) e constantes `LIMITE_ALERTA_DIAS = 10`,
  `LIMITE_CRITICO_DIAS = 14`, `LIMITE_PRIMEIRA_ENTREGA_DIAS = 7` (linhas 55–57).
- `cadencia-onboarding.ts` — junta `onboarding_planos.plano_acao`/`touchpoints` (texto livre tipo
  "D3 após início") com `onboarding_checklist` e vira isso em datas reais
  (`lerCadenciaOnboarding`). Tem seu **próprio** catálogo de prazo por item,
  `PRAZO_POR_CODIGO` (linhas 322–335) — `dossie_mae: 7`, `ambiente_acesso: 3`,
  `checklist_inicial: 5`, `plano_acao: 5`, `micro_entrega_d7: 7` — **redeclarado, não importado**
  de `onboarding-padrao.ts`, embora os valores coincidam item a item onde os dois catálogos se
  sobrepõem. Documenta com honestidade o caso da Ana no próprio cabeçalho (linhas 17–20): "o plano
  está bloqueado e o início nunca foi marcado. A resposta certa é 'ainda não começou'."
- `cadencia-d0-d30.ts` — confronta a norma de seis momentos (`CADENCIA_D0_D30`, linhas 68–124: D0,
  D1–D3, até D7, D10, D14, D30) com o que o plano do caso realmente cobre. O comentário do arquivo
  (linhas 17–20) já registra, como fato observado em dado real, que "os touchpoints da Ana Luiza
  cobrem D7, D10 e D14, e não há nada em D0, D1–D3 nem D30" — ou seja, o gap de cobertura da norma
  no caso da Ana já foi constatado por quem escreveu este módulo, em 26/08/2026.

Servido por `onboarding-plano.functions.ts`, que lê `onboarding_planos`, `crm_casos` (só
`contrato_assinado`/`pagamento_confirmado`/`responsavel_principal`) e `communication_queue`
(rascunhos em `status = "draft"`) — linhas 19–39. Renderizado por
`PainelPlanoOnboarding` (`onboarding-plano.tsx`), que embute `<CadenciaOnboarding>` e
`<CadenciaD0D30>` (linhas 137–139).

### 1.D — "Gates de cliente ativo" (a terceira lista de gates na mesma aba)

`gatesClienteAtivo` (`caso-ficha.ts:350–366`) é uma lista curta e independente — contrato,
pagamento, responsável, núcleo, dossiê, plano inicial — sem arquivo de regra próprio, sem
persistência própria: recebe booleanos já calculados pelo componente pai e devolve uma lista de
`{ chave, rotulo, ok }`. Renderizada dentro de `AbaOnboarding` (`onboarding-caso.tsx:59–74`),
**na mesma tela** dos mecanismos C e F, como a seção "Gates de cliente ativo".

### 1.E — CA-LOVABLE-ONBOARDING-JORNADA implementado (`/ops`)

`onboarding-jornada.ts` se autodeclara no cabeçalho "CA-LOVABLE-ONBOARDING-JORNADA-v1.1 — regras
puras" (linha 2) — é a implementação real do prompt histórico
`docs/evolucao/recuperados/prompts-lovable/CA-LOVABLE-ONBOARDING-JORNADA-v1.0.md` (seção 2 traz o
de-para exato). Contém:

- `CHECKLIST_ONBOARDING_PADRAO` — 15 itens (linhas 106–122), diferente do catálogo de 12 itens de
  `onboarding-padrao.ts` (item C) — nomes de gate parcialmente sobrepostos
  (`dossie_mae`, `ambiente_acesso`), parcialmente exclusivos (`representacao_menor`,
  `case_service`, `escopo_aprovado` só existem aqui).
- `diagnosticarOnboarding` (linhas 182–239) — 16 gates avaliados por vez, com
  `GATES_CRITICOS = ["contrato_assinado", "pagamento_inicial"]` (linha 179) bloqueando o status.
- `CADENCIA = { primeiraMicroentregaDias: 7, atencaoDias: 10, criticoDias: 14 }` (linha 258) e
  `avaliarCadencia` (linhas 278–319) — mesma tríade D7/D10/D14 do item C, redeclarada.

`onboarding-jornada.functions.ts` lê `crm_casos`, `onboarding_checklist`, **`case_plans`**
(não `onboarding_planos`), `case_espera_externa`, `client_deliverables`, `case_alerts`,
`touchpoints` (linhas 49–74, 162–166) — a segunda família de tabela citada na tabela-resumo.
`iniciarOnboarding` (linhas 384+) escreve em `crm_casos.eixo_operacao = "onboarding_iniciado"`
diretamente, sem tocar `onboarding_planos`.

Wireado em `painel-onboarding-jornada.tsx`, que importa `obterPainelJornada` de
`onboarding-jornada.functions.ts` (linha 8), `ESTADO_DERIVADO`/`rotulo` de `onboarding-jornada.ts`
(linha 10) e `tipoAlertaDeTexto` de `fiacao-cadencia-catalogo.ts` (linha 11) — os três arquivos dos
mecanismos B e E convergem nesta única tela, dentro de `/ops` (`ops.tsx` → `desk-operacional.tsx`).

### 1.F — "Jornada após gates" / Corte J

`jornada-pos-gates.ts` (184 linhas): `onboardingIniciado` (linhas 43–51) é um **quarto** conjunto
de seis fatos exigidos (contrato, pagamento, responsável, núcleo, dossiê, plano de ação) — quase
idêntico ao mecanismo D, mas em arquivo, tipo e assinatura próprios. Define
`D_PRIMEIRA_ENTREGA = 7`, `D_ALERTA_INTERNO = 10`, `D_ALERTA_CRITICO = 14` (linhas 38–40) — a
mesma tríade dos mecanismos C e E, redeclarada pela terceira vez. `alertaDeAcompanhamento` e
`primeiraMicroEntrega` (linhas 55–74) implementam a mesma lógica de D7/D10/D14 que `avaliarCadencia`
(mecanismo E) e `PRAZO_POR_CODIGO`+`CADENCIA_D0_D30` (mecanismo C) — três implementações
independentes da mesma regra, com o mesmo número, nunca uma chamando a outra.

Renderizado por `PainelJornadaPosGates` (`jornada-pos-gates.tsx`), que lê estado de pesquisa via
`carregarFichaPiloto` (`ficha-piloto-genealogica.functions.ts`) — **não** lê `onboarding_planos`
nem `case_plans` diretamente; recebe o restante do estado (`contrato_assinado`,
`pagamento_confirmado` etc.) como prop do componente pai. Embutido em `AbaOnboarding`
(`onboarding-caso.tsx:47–57`) — a mesma tela dos mecanismos C e D.

### 1.G — Ativação por checklist (`/onboarding/$id`)

Confirma o item 3 do contexto desta pesquisa, agora lido por inteiro. `onboarding.functions.ts` lê
e escreve `case_activation_checks` (linhas 38, 103, 130), `crm_casos` (195, 222, 258) e grava
auditoria em `audit_logs` (linha 47). `onboarding-regras.ts` fornece `podeValidar`/`podeAtivar`/
`responsavelDoCheck` — regras de permissão por papel, não de prazo. A tela
(`onboarding.$id.tsx`, lida por inteiro) é um checklist `pendente/validado/isento/nao_aplicavel`
com isenção auditável (motivo, quem autorizou, expiração) e um botão "Ativar caso" que só aparece
quando `pendencias.length === 0`. **Nenhuma computação de dia, atraso ou D0 existe aqui** — é
puramente "todos os itens estão marcados, sim ou não".

### 1.H — Fechamento do caso, 9 gates (`/casos/$id` aba Fechamento)

Confirma e aprofunda o item 4 do contexto. `avaliarFechamento` (`fechamento-caso.ts:173–214`) é
pura e case-agnóstica; `fechamento-caso.functions.ts` (`carregarFechamentoCaso`, linhas 14–125) é
quem faz a ponte com o banco. Achado que fecha a pergunta "fechamento e cadencia-onboarding operam
no mesmo caso ao mesmo tempo, ou em sequência?":

```
const plano = (planos.data ?? [])[0] as any | undefined;   // vem de onboarding_planos (linha 39)
const onboardingIniciado = !!plano && plano.estado !== "bloqueado" && plano.estado !== "nao_iniciado";
const onboardingMinimoConcluido =
  !!plano && ["concluido", "ativo", "em_execucao"].includes(String(plano.estado ?? "")) && !!plano.plano_acao;
```
(`fechamento-caso.functions.ts:79–82`)

O gate 8 ("onboarding") do fechamento **lê o mesmo `onboarding_planos.estado`** que o mecanismo C
grava — não lê `case_plans` (mecanismo E). Isso responde à pergunta do item 4 do escopo com
evidência de código: **fechamento (gate 8/9) e a cadência do mecanismo C são sequenciais e do mesmo
trilho de dado** — o gate 8 "abre" quando `onboarding_planos.estado` sai de `bloqueado`/
`nao_iniciado`, e é exatamente esse mesmo campo que `cadencia-onboarding.ts`/`cadencia-d0-d30.ts`
leem para saber se há D0. O gate 9 ("caso ativo") exige `plano.plano_acao` preenchido, o que por
sua vez é lido por `lerCadenciaOnboarding` (mecanismo C) como uma das três fontes de marco. **O
fechamento e o mecanismo C operam no mesmo caso em sequência, sobre a mesma tabela — não em
paralelo.** O mecanismo E (`/ops`, `case_plans`) fica de fora dessa cadeia: o fechamento nunca lê
`case_plans`.

`fechamento-caso.functions.ts` também chama `calcularCadencia` diretamente (linha 96–101, mesma
função de `jornada-cliente.ts` usada pelo mecanismo A) só para exibir a saúde de cadência do caso
ao lado dos 9 gates — não para decidir gate algum.

## 2. De-para dos estudos históricos de onboarding/cadência

A varredura cobriu `docs/evolucao/recuperados/{prompts-lovable,prompts-lovable-2026-08-31,
fontes-primarias,estudos-ux}/`, `docs/auditoria/`, `docs/governanca/`, `docs/operacao/` e
`docs/ux/`. Mais de 90 arquivos citam "onboarding", "jornada" ou "cadência"; a tabela abaixo cobre
os que de fato propõem uma **mecânica** (regra de dia, gate, estado) — não os que só mencionam a
palavra em passagem (marca, contrato, catálogo de SKU etc., fora de escopo).

| Documento | O que propõe | Já implementado como/onde | É só lista/dicionário? | Status |
|---|---|---|---|---|
| `docs/evolucao/recuperados/prompts-lovable/CA-LOVABLE-ONBOARDING-JORNADA-v1.0.md` (21/08/2026) | Gates obrigatórios, estados (`EIXO_OPERACAO`/`ESTADO_DERIVADO`), 8 fases, template `case_plans` com os campos exatos usados hoje | **Sim, quase literal.** `onboarding-jornada.ts` se autodeclara "v1.1" deste prompt; `case_plans` tem os mesmos campos propostos (`fase_jornada`, `marco_atual`, `proxima_microentrega`, `status_saude` etc.) | Não — virou lógica executando (mecanismo E) | **Implementado** |
| `docs/operacao/CA-OPS-01_Matriz_Eventos_Acoes_Templates.csv` (evento `onboarding_elegivel`: "3 dias uteis") | Prazo de 3 dias úteis para a tarefa de acolhimento do onboarding | `orquestracao-jornada.ts:531` (`prazoDias ?? 3`) | Não — é o CSV normativo de um motor real, e o número bate | **Implementado, mas tela manual** (mecanismo A não lê banco) |
| `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md` §10.3 ("Cadência MVP") | D0 checklist/responsável · D1–D3 revisão · até D7 primeiro valor · D10 alerta · D14 crítico · D30 check-in (NPS se aprovado) | `cadencia-d0-d30.ts` (`CADENCIA_D0_D30`, transcrição literal, comentário do próprio arquivo diz isso) | Não | **Implementado, fielmente** |
| `docs/evolucao/recuperados/prompts-lovable-2026-08-31/CA_EXECUTAVEIS_FINANCEIRO_CADENCIAS_MARKETING_PLANEJADOR_PESQUISA.md` (linhas 404–408) | Sequência de onboarding **0 / 0 / 2 / 7 / 14 dias** (preparar boas-vindas → enviar formulário → verificar resposta → follow-up → revisar caso sem documento) | Não localizado. Nenhum código implementa esta sequência específica de 5 passos com estes 5 números | Não — é proposta de tarefa-a-tarefa, não catálogo estático | **Histórico, superseded pela norma D0–D30** |
| `docs/evolucao/recuperados/prompts-lovable-2026-08-31/CA_Planejador_Jornada_Microentregas_Touchpoints_SKU.md` (linhas 65–117) | Cadência por fase com D+1/D+2/D+3/D+7/D+14 variando conforme o evento (lead, diagnóstico, onboarding, documento) | Parcialmente ecoado: D+2/D+7 para onboarding aparece na linha 71 do próprio doc, mas nenhum código replica esta tabela fase-a-fase completa | Não — é planejador de microentregas por evento, mais rico que o implementado | **Histórico, parcialmente superseded** (a ideia de "D+2 se sem upload" não virou regra) |
| `docs/evolucao/recuperados/prompts-lovable-2026-08-31/CA_COMUNICACAO_DE_PARA_MICROENTREGAS_APP_COPY_CTA.md` (linha 457) | Alerta normativo: "Não tratar D+0/D+1/D+15 como onboarding completo" | Não é uma regra a implementar, é uma restrição de copy/produto | Não | **Diretriz ainda válida, não é regra de dia a reconciliar** |
| `docs/auditoria/MAPA-EXCECOES-OPERACIONAIS-v1.0.md` (linha 24) | "Onboarding ou acesso externo pendente… 15 dias" como regra de exceção operacional | Não localizado um código que use exatamente 15 dias para onboarding/acesso externo pendente | Não — está numa tabela de exceções com decisão operacional (reaparece na fila 3 dias antes de expirar) | **Gap real** — número (15) não bate com nenhuma constante do código (10/14/30) |
| `docs/auditoria/CA-AUD-12_Cotejo_Fases_Jornada_Touchpoints_2026-08-26.md` | Já documentou, em 26/08, "quatro vocabulários de fase" (`derivacao-jornada.ts`, `jornada-cliente.ts`, `onboarding-jornada.ts`, `relatorios-fase.ts`) e que `case_plans.fase_jornada` é string livre sem trava | Confirmado ainda válido nesta sessão — nenhuma unificação ocorreu desde 26/08 | Não — é auditoria de código real, com achado ainda vigente | **Achado confirmado, ainda não corrigido** |
| `docs/ux/fase-c-subabas-cartoes-e-cadencia-percebida.md` (26/08/2026, seção 3) | "A cadência de onboarding existe — mas não é sentida, por desenho" — já mapeava `fiacao-cadencia-catalogo.ts` e a cadeia de 11 elos | Confirma os mecanismos A e B desta seção 1, de forma independente | Não | **Achado confirmado, mesma leitura desta sessão** |
| `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` (984 linhas) — seção `onboarding_templates`/`cadence_actions` | ~39 entidades novas, incluindo tabelas paralelas de onboarding e cadência | Já resolvido em `docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md`: a esmagadora maioria já existe sob nome em português (`onboarding_planos`, `onboarding_templates`, `onboarding_template_items`) | **Sim, em parte** — lista de nomes de tabela em inglês nunca implantada como está | **Superseded pelo de-para de 2026-09-03 (v1.1)** — não repetir aqui |
| `docs/evolucao/PENTE_FINO_PROMPTS_ARTEFATOS_E_IMPLANTACAO_v1.0.md` / `Clube_Ancestral_Prompts_0_a_P1.md` (citam CA-OPS-03) | Consolidação de catálogos de templates concorrentes | `consolidacao-catalogos-templates.ts` — decide `/biblioteca-mensagens` como fonte canônica única, `bib-templates-com` como alias histórico | Não — é decisão já tomada e codificada | **Implementado** (precedente direto de reconciliação — ver seção 4) |
| `docs/evolucao/recuperados/estudos-ux/Clube_Ancestral_Cadencia_Onboarding_Cliente.xlsx` | Planilha (não lida célula a célula nesta sessão — fora do alcance de leitura de texto; citada por nome em várias auditorias) | Provável origem de parte do catálogo D2/D3/D5/D7/D14 de `onboarding-padrao.ts`, não confirmável sem abrir a planilha | Possivelmente sim — não verificado | **Não verificado nesta sessão** — recomenda-se leitura futura se a Proprietária quiser confirmar a origem exata do catálogo |
| `docs/evolucao/recuperados/fontes-primarias/CA-10A1_Pre_Onboarding_Deduplicado_Ana_Luiza.md` | Onboarding específico da Ana, pré-deduplicação | Superseded pela decisão de ID canônico único (`CA-CID-AT-FAM-2026-001`), já registrada em `varredura-completude.ts` e no de-para do piloto (2026-09-03) | Não | **Histórico, arquivado** |
| `docs/evolucao/recuperados/fontes-primarias/CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza.md` | Preparação de go-live específica da Ana | Sobreposta pelo mecanismo H (fechamento de caso, 9 gates, case-agnóstico) e pelos mecanismos "piloto" já mapeados em `2026-09-03_DE-PARA-PILOTO-ANA-CONVERGENCIA-REALIDADE.md` | Não | **Histórico, superseded** |

**Nota sobre volume:** dezenas de outros arquivos do arquivo histórico (`Roadmap_Prompts...`,
`Prompt_Motores_a_Implantar...`, `PROMPT_MOTORES_UNIFICADOS_CRM_VIVO_ONBOARDING_CADENCIAS_
INDICADORES.md`, `Prompt_Cockpit_Desk_Indicadores_Cadencias_e_Acoes.md` etc.) mencionam onboarding
ou cadência en passant, dentro de escopos maiores (indicadores, cockpit, motores unificados) já
tratados pelo de-para de 2026-09-03 (v1.1) referenciado na tabela acima. Repeti-los aqui duplicaria
aquele documento sem acrescentar mecânica nova; nenhum deles, na leitura desta sessão, propõe uma
regra de dia ou de gate diferente das já catalogadas acima.

## 3. Reconciliação do conflito de regras de dias

A pesquisa anterior desta sessão (citada no contexto deste pedido) havia identificado quatro
variantes conflitantes. Com os sete mecanismos lidos por inteiro, a reconciliação é a seguinte:

**A regra que está viva hoje, em código, é D7 (primeira microentrega) / D10 (atenção) / D14
(crítico) — com D0/D1–D3/D30 como moldura mais ampla vinda de
`docs/governanca/CA-DECISOES-CANONICAS-...v1.0.md` §10.3.** Essa tríade/moldura aparece,
consistentemente e com os mesmos números, em **seis lugares independentes do código real**:

1. `onboarding-padrao.ts:55–57` — `LIMITE_ALERTA_DIAS = 10`, `LIMITE_CRITICO_DIAS = 14`,
   `LIMITE_PRIMEIRA_ENTREGA_DIAS = 7`.
2. `onboarding-jornada.ts:258` — `CADENCIA = { primeiraMicroentregaDias: 7, atencaoDias: 10,
   criticoDias: 14 }`.
3. `onboarding-plano.ts:57–61` — `TOUCHPOINTS_PADRAO` com marcos D7/D10/D14.
4. `jornada-pos-gates.ts:38–40` — `D_PRIMEIRA_ENTREGA = 7`, `D_ALERTA_INTERNO = 10`,
   `D_ALERTA_CRITICO = 14`.
5. `cadencia-d0-d30.ts:68–124` — os seis momentos completos, D0 a D30, transcritos do §10.3.
6. `jornada-cliente.ts:180–181` — a primitiva `calcularCadencia`, usada por A e H, usa 10/14 dias
   como limiar de atenção/crítico (o D7 de "primeira entrega" não se aplica a esta função, que só
   olha "dias sem touchpoint").

Nenhum destes seis pontos importa a constante de outro — são seis declarações independentes do
mesmo número. **Isso é duplicação real de código (redundância a resolver), mas não é conflito de
regra** (todos concordam no valor). O risco não é "a Ana vê dois D14 diferentes"; é que, se algum
dia alguém decidir mudar o limiar (de 14 para 10 dias, por exemplo), terá que lembrar de mudar em
seis arquivos, e um esquecimento não quebraria nenhum teste porque cada arquivo tem os próprios
testes isolados validando a própria constante.

**As regras que são histórico superado, não spec em aberto:**

- **"3 dias úteis"** (CA-OPS-01, CSV, linha 9) — não é conflitante com D7/D10/D14: é uma regra de
  **outro objeto** (prazo da tarefa interna de acolhimento, não do marco de entrega ao cliente).
  Já implementada (`orquestracao-jornada.ts:531`). Não compete com a tríade D7/D10/D14 — resolve
  uma pergunta diferente ("quando a equipe deve acolher" vs. "quando o cliente deve ver a primeira
  entrega").
- **"0/2/7/14 dias"** (`CA_EXECUTAVEIS_FINANCEIRO_CADENCIAS...md`, linhas 404–408) — proposta de
  sequência de 5 tarefas específicas (preparar boas-vindas D0, solicitar documento D0, verificar
  resposta D2, follow-up D7, revisar caso D14). Nunca implementada como essa sequência de 5 passos;
  os números 0/7/14 coincidem parcialmente com a norma vigente (D0 e D7 e D14 aparecem também na
  norma), mas o "D2" desta proposta não tem equivalente em nenhum código real. **Superseded** —
  tratar como proposta histórica, não como spec pendente.
- **"D+1/D+2/D+3/D+7/D+14" variando por fase** (`CA_Planejador_Jornada_Microentregas_
  Touchpoints_SKU.md`, linhas 65–117) — desenho mais granular (prazo diferente por tipo de evento:
  lead, diagnóstico, onboarding, documento faltante), nunca implementado como tabela fase-a-fase.
  **Superseded pela norma D0–D30**, que é mais simples e é a que está em produção.
- **"15 dias"** (`MAPA-EXCECOES-OPERACIONAIS-v1.0.md`, linha 24) — único número que **não** bate
  com nenhuma constante viva (10, 14 e 30 aparecem; 15 não aparece em lugar nenhum do código lido
  nesta sessão). Não é "superseded" no sentido de já ter sido substituído por outra coisa — é um
  **gap real**: ou vira um novo estado de exceção específico (onboarding/acesso externo pendente
  há 15 dias, distinto do "14 dias crítico" genérico), ou a Proprietária decide que 15 foi um erro
  de digitação para 14 e o documento de exceções deveria ser corrigido para casar com a norma
  vigente.

**Recomendação desta seção:** tratar D7/D10/D14 (+ D0/D1–D3/D30 como moldura) como a regra
canônica única daqui para frente. As três variantes divergentes (0/2/7/14; D+1…D+14 por fase;
15 dias) ficam como histórico registrado nesta tabela, não como specs concorrentes — nenhuma delas
tem um único caso de uso implementado hoje que a norma D0–D30 não cubra, exceto o gap dos "15 dias"
apontado acima.

## 4. Recomendação de convergência — um ciclo de jornada de vida único

**O que já existe e resolve isso, parcialmente:** a tríade D7/D10/D14 já é, de fato, uma regra
única na prática — é o mesmo número em todo lugar, só declarado seis vezes. `consolidacao-
catalogos-templates.ts` (CA-OPS-03, seção 1) já mostra o padrão exato de reconciliação que este
tipo de duplicação pede: um catálogo vira canônico, o outro vira "alias histórico" que aponta para
o canônico, sem apagar nada. Recomenda-se o mesmo padrão aqui, quando e se a Proprietária
autorizar execução:

1. **Extrair a tríade D7/D10/D14 (e a moldura D0/D1–D3/D30) para um único módulo neutro** — por
   exemplo `cadencia-normativa.ts`, contendo só as constantes e a leitura de §10.3 — e fazer os
   seis arquivos hoje redeclarando-a (`onboarding-padrao.ts`, `onboarding-jornada.ts`,
   `onboarding-plano.ts`, `jornada-pos-gates.ts`, `cadencia-d0-d30.ts`, e a lógica de
   `jornada-cliente.ts` onde aplicável) importarem dali. Baixo risco: são só constantes numéricas
   já concordantes.
2. **Decidir entre `onboarding_planos` e `case_plans` qual tabela é a canônica do "plano de
   onboarding do caso".** Hoje `onboarding_planos` é a que o fechamento de caso (mecanismo H) e a
   aba Onboarding de `/casos/$id` (mecanismo C) usam; `case_plans` é a que `/ops` (mecanismos B e
   E) usa. Nenhuma lê a outra. Isso é a duplicação mais séria encontrada nesta pesquisa — mais
   séria que a duplicação de constante, porque aqui há **dois registros possivelmente divergentes
   do mesmo fato** (o estado real do onboarding de um caso) em duas tabelas diferentes,
   dependendo de qual tela a equipe usou para editar por último.
3. **Reduzir os quatro painéis de gate empilhados na aba Onboarding de `/casos/$id`** (mecanismos
   C, D, F, mais o checklist reaproveitado do mecanismo G) a um só, ou deixar claro na própria tela
   qual é a fonte de verdade de cada bloco — hoje a pessoa que abre essa aba vê "Plano de
   onboarding" (C), "Jornada após gates" (F) e "Gates de cliente ativo" (D) um em cima do outro,
   três listas de pré-condição parecidas sem indicação de qual manda.
4. **Unificar o vocabulário de fase**, retomando a recomendação #1 já registrada em
   `CA-AUD-12_Cotejo_Fases_Jornada_Touchpoints_2026-08-26.md` — ainda não executada, e esta
   pesquisa confirma que o problema (`case_plans.fase_jornada` como string livre, quatro conjuntos
   de IDs de fase) continua exatamente como estava em 26/08.

**O que é gap real, sem mecanismo hoje:**
- A regra de "15 dias" de `MAPA-EXCECOES-OPERACIONAIS-v1.0.md` não tem constante equivalente —
  decidir se vira estado novo ou correção de digitação (seção 3).
- Nenhum mecanismo hoje soma os quatro/cinco conjuntos de gate (D, F, G, H, e os 16 de E) numa
  visão única "isto está pronto para ativar" — cada um responde por um pedaço, e a pessoa que
  precisa da resposta completa tem que olhar quatro telas.

**O que este documento recomenda aposentar (preservar, não apagar), quando a Proprietária
autorizar:**
- As três declarações redundantes de D7/D10/D14 sobrando após a extração do item 1 acima
  (mantêm-se como estão até a extração; nada muda sozinho).
- Nenhuma tabela histórica de dias (0/2/7/14; D+1…D+14 por fase) precisa de "aposentadoria" porque
  nenhuma delas foi promovida a código — já são apenas documentos, e continuam como registro
  histórico do que foi cogitado.

## 5. O que este documento NÃO decide / não executa

- Nenhum arquivo em `src/` foi alterado. Nenhuma migration foi criada. Nenhum código foi movido.
- Não decide qual tabela — `onboarding_planos` ou `case_plans` — vira a canônica; só constata que
  são duas tabelas paralelas para o mesmo conceito e aponta o precedente de reconciliação já usado
  em CA-OPS-03.
- Não decide o destino final dos quatro painéis de gate empilhados na aba Onboarding — só descreve
  que estão empilhados e sem hierarquia declarada na tela.
- Não corrige o número "15 dias" de `MAPA-EXCECOES-OPERACIONAIS-v1.0.md` nem decide se é erro de
  digitação — fica registrado como pergunta em aberto para a Proprietária.
- Não abriu nem leu célula a célula a planilha `Clube_Ancestral_Cadencia_Onboarding_Cliente.xlsx` —
  fora do alcance de leitura de texto desta sessão; citada apenas por nome onde outras auditorias a
  referenciam.
- Não consultou o banco Supabase ao vivo (MCP não autorizado nesta sessão) — todo o mapeamento de
  tabela vem de leitura de código (`.from("...")`), não de query real. Não é, portanto, uma
  confirmação de que as tabelas citadas têm exatamente essas colunas hoje em produção, nem de
  quantas linhas cada uma tem — é o que o código declara ler/escrever.
- Segue o mesmo padrão já validado nesta sessão para todo de-para: **mapear primeiro, decidir
  depois, executar só com autorização explícita da Proprietária.**

## 6. Fora do escopo

- O de-para completo de "motores unificados CRM Vivo" (39 entidades propostas) — já resolvido em
  `docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md` (v1.1); citado aqui só onde
  tangencia onboarding/cadência, não repetido por inteiro.
- A convergência dos três mecanismos "piloto" (`/piloto`, `/piloto-ana`,
  `/governanca/corte-vertical`) — já mapeada em
  `docs/arquitetura/2026-09-03_DE-PARA-PILOTO-ANA-CONVERGENCIA-REALIDADE.md`; o passo 7 daquele
  documento pedia para auditar o mecanismo de "9 gates de fechamento" antes de qualquer execução —
  é exatamente a seção 1.H deste documento, e a resposta é: **não se sobrepõe** ao que aquele
  de-para recomenda, porque o fechamento de caso é sobre formalização/ativação (gates 1–9), não
  sobre "piloto" como rótulo.
- Qualquer alteração em `contract_case_parameters` ou no motor contratual — endereçado em
  `docs/arquitetura/MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md`, tema separado.
- A unificação de vocabulário de fase (`aceite_e_formalizacao` vs. `aceite_formalizacao` etc.) —
  já é recomendação #1 de `CA-AUD-12`, repetida aqui na seção 4 mas não expandida com novo detalhe.
- Testes automatizados relacionados (`cadencia-onboarding.test.ts`, `cadencia-d0-d30.test.ts`,
  `fechamento-caso.test.ts`, `onboarding-jornada.test.ts`, `ca-ops-01-orquestracao-jornada.test.ts`,
  `ca-ops-02-fiacao-cadencia-catalogo.test.ts`, `ca-ops-02-orquestracao-contextual.test.ts`,
  `ca-ops-03-consolidacao-catalogos-templates.test.ts`) — confirmados existentes por nome, não
  lidos linha a linha; qualquer execução futura precisa revisá-los junto.
- A planilha `Clube_Ancestral_Cadencia_Onboarding_Cliente.xlsx` e as demais planilhas `.xlsx` do
  arquivo `estudos-ux/` — citadas por nome, não abertas nesta sessão.
