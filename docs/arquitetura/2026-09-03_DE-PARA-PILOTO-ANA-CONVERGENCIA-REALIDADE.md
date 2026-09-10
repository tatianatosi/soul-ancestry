---
status: mapeamento — nenhum código alterado, aguardando decisão da Proprietária
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral — Desk Intelligence
classificação: de-para de convergência (arquitetura interna)
responsável pela decisão: Proprietária Administradora (Tatiana Melani Tosi)
base normativa: mesmo padrão desta sessão para todo de-para — mapear primeiro, decidir depois, executar só com autorização explícita
repositório: soul-ancestry
fonte: leitura de código nesta sessão (src/lib, src/routes/_authenticated, src/data, src/components) + observação direta da Proprietária em conversa (03/09/2026)
---

## 1. Causa

A Proprietária pediu, em conversa (03/09/2026), para convergir a nomenclatura e a mecânica de "piloto" para a realidade: Ana Luiza não é mais um piloto — é uma cliente real, com caso real, cobrando decisão real. Ela observou que **"no Desk tem piloto go-live, piloto real Ana e um outro"** — ou seja, ela mesma reconhece, de fora, que existem múltiplos mecanismos tratando o caso da Ana como piloto, sem saber ao certo quantos são e o que cada um faz. Pediu:

1. Um de-para de tudo que existe;
2. Uma decisão de qual mecanismo PREVALECE como regra geral para TODOS os casos futuros (não só o da Ana);
3. Um plano para aposentar/reconciliar os demais — sem apagar histórico, sem criar caso ou tabela nova.

Este documento entrega os itens 1 e 3 (mapeamento e plano); o item 2 é uma recomendação para decisão da Proprietária, não uma execução.

**Achado prévio, relevante para a leitura do resto do documento:** a frase da Proprietária citando "piloto go-live" bate exatamente com o rótulo de menu real da rota `/piloto` — `{ to: "/piloto", label: "Piloto e go-live" }` em `src/lib/navegacao-desk.ts:142`. Existe também, no repositório, um componente **não relacionado** chamado `GoLiveDesk` (`src/components/desk-go-live.tsx`) com dado 100% mockado — mas ele está **fora do menu, sem rota, sem consulta ao banco**, e o próprio inventário de governança do sistema já o classifica como legado (ver seção 2.4). Ou seja: o "piloto go-live" que a Proprietária vê na tela é a rota `/piloto`, não o componente `GoLiveDesk`. Isso já reduz a hipótese inicial de trabalho ("GoLiveDesk é o mecanismo geral que deve prevalecer") a uma hipótese refutada — ver seção 4.

## 2. Inventário completo dos mecanismos encontrados

Foram encontrados **três mecanismos navegáveis e reais** tratando o caso da Ana como "piloto", mais **dois artefatos órfãos** (código presente, sem consumidor real) que reforçam a mesma linguagem. Nenhum deles foi inventado para esta pesquisa — todos já existem em produção.

### 2.1 Mecanismo A — `/piloto` ("Piloto e go-live")

| | |
|---|---|
| Rota | `src/routes/_authenticated/piloto.tsx` — título "Piloto real — conferir dados" |
| Rótulo de menu | "Piloto e go-live" (`navegacao-desk.ts:142`, grupo Casos → Ativação) |
| Funções de servidor | `src/lib/piloto.functions.ts` — `painelPiloto`, `salvarDadoPiloto`, `verificarDadoPiloto`, `resolverBloqueioPiloto`, `criarPesquisaPiloto`, `liberarPortalPiloto` |
| Bibliotecas de apoio | `src/lib/gates-piloto.ts` (gates A–H), `src/lib/ciclo-piloto-ana.ts` (4 fases de referência) |
| Tabelas lidas/escritas | `crm_casos` (filtro `eq("piloto", true)` — pega **o primeiro** caso com essa flag, `piloto.functions.ts:41-48`), `piloto_conferencia` (campos com origem obrigatória), `piloto_bloqueios` (itens agrupados por gate A–H), `research_cases`, `clientes` |
| Como acha "o" caso | Não por ID: por uma **flag booleana global** `crm_casos.piloto = true`. Assume que existe no máximo um caso com a flag ligada (`dados.duplicatas > 0` mostra aviso: "existe mais de um caso marcado como piloto. Consolide em um único case_id" — `piloto.tsx:171-175`) |
| Gates | `GATES_PILOTO` — 8 gates sequenciais A (governança) a H (operação), estruturado de forma genérica (`gates-piloto.ts:14-23`); `REQUISITOS_BLOQUEIO` mapeia chaves de bloqueio → gate/responsável/evidência, e várias chaves já são hardcoded para os nomes da família da Ana (`alice_nome_completo`, `felipe_representacao_legal`, `gates-piloto.ts:41-52`), com fallback genérico (`REQUISITO_PADRAO`) para chaves desconhecidas |
| Bloqueia comportamento real? | **Não.** O próprio texto da tela diz: "Não bloqueia a ficha do caso, tarefas, pesquisa, propostas, contratos ou OS em rascunho — só é exigida antes de assinatura, envio externo ou ativação operacional real" (`piloto.tsx:182-185`). "Resolver" um bloqueio apenas grava evidência; nenhum status muda automaticamente (`piloto.tsx:239-241`) |

### 2.2 Mecanismo B — `/piloto-ana` ("Caso-piloto Ana Luiza")

| | |
|---|---|
| Rota | `src/routes/_authenticated/piloto-ana.tsx` |
| Rótulo de menu | "Caso-piloto Ana Luiza" (`navegacao-desk.ts:143`, mesmo grupo Casos → Ativação, linha imediatamente abaixo de `/piloto`) |
| Funções de servidor | `src/lib/piloto-ana.functions.ts` — `carregarPilotoAna`, `materializarPilotoAna`, `definirIdCanonicoPiloto` |
| Constantes/lógica | `src/lib/piloto-ana.ts` — `PILOTO_ANA` (nome, país, valores de referência), `NUCLEO_PILOTO` (4 pessoas nomeadas, hardcoded), `derivarPendenciasPiloto` (função pura, genérica na assinatura — recebe `caseId/caso/membros/contrato/ordemServico/perfilInstitucionalVigente` e devolve pendências derivadas do estado real, sem nada Ana-específico na lógica em si) |
| Tabelas lidas/escritas | `crm_casos` (localizado por **lista hardcoded de códigos legados da Ana**, `CODIGOS_BUSCA_PILOTO` em `piloto-ana.functions.ts:23-26`, não por `case_id`), `nucleos_familiares`, `nucleo_membros`, `contracts`, `service_orders`; `materializarPilotoAna` pode **criar** o caso e o núcleo se não existirem, usando os dados hardcoded de `PILOTO_ANA`/`NUCLEO_PILOTO` |
| Como acha "o" caso | Por **códigos históricos hardcoded da Ana** (`ids_historicos` em `piloto-ana.ts:16`), não por flag nem por ID canônico puro — impossível de generalizar sem reescrever a busca |
| Decisão de ID canônico | `definirIdCanonicoPiloto` grava `crm_casos.id_canonico_decidido` (**real, no banco**) e, na mesma operação, resolve o bloqueio `id_canonico_pendente` em `piloto_bloqueios` (`piloto-ana.functions.ts:182-224`) — este é o mecanismo **vivo** de decisão de ID canônico |
| Bloqueia comportamento real? | **Não.** Texto explícito: "Nenhuma pendência listada abaixo bloqueia editar o caso, a pessoa, a pesquisa, uma tarefa, uma fonte, uma proposta rascunho, um contrato rascunho ou uma OS" (`piloto-ana.tsx:145-148`) |

**Achado relevante:** os Mecanismos A e B são **duas implementações paralelas e redundantes** para o mesmo caso real. `/piloto` lê pendências de uma tabela dedicada (`piloto_conferencia`/`piloto_bloqueios`, preenchida manualmente campo a campo pela equipe). `/piloto-ana` **deriva** pendências ao vivo do estado real (`derivarPendenciasPiloto`, lendo `crm_casos`/`nucleo_membros`/`contracts`/`service_orders` diretamente) — é estritamente mais atual e menos sujeito a ficar desatualizado, porque não depende de alguém digitar o mesmo dado duas vezes. Nenhuma das duas lê a outra.

### 2.3 Mecanismo C — `/governanca/corte-vertical` ("Corte vertical e fontes")

| | |
|---|---|
| Rota | `src/routes/_authenticated/governanca.corte-vertical.tsx` |
| Rótulo de menu | "Corte vertical e fontes" (`navegacao-desk.ts:235`, grupo Governança → Conformidade) |
| Fonte de dados | `src/lib/corte-vertical.ts` — **100% constantes estáticas**, nenhuma consulta ao banco |
| Bloco específico da Ana | `ANA_ESTADO_REAL` (`corte-vertical.ts:150-160`), incluindo `situacaoOperacional: "NO_GO"`, e `ANA_BLOQUEIOS` (`corte-vertical.ts:162-173`) — uma lista fixa de 10 bloqueios, hardcoded, renderizada verbatim na tela (`governanca.corte-vertical.tsx:111-136`) |
| Bloqueia comportamento real? | **Não — confirmado por busca de todos os importadores.** `ANA_ESTADO_REAL`, `ANA_BLOQUEIOS` e `situacaoOperacional` só aparecem em dois lugares no repositório inteiro: a própria declaração (`corte-vertical.ts`) e a própria tela que os imprime (`governanca.corte-vertical.tsx`). Nenhuma função de servidor, nenhuma rota, nenhum componente lê o valor `"NO_GO"` para decidir nada. É **só texto na tela**, sem consumidor lógico |
| Está desatualizado? | **Sim, materialmente.** O próprio código de `piloto-ana.ts` documenta (comentário de 30/08/2026) que uma lista fixa equivalente de 11 bloqueios (`BLOQUEIOS_PILOTO`) foi **removida** de `piloto-ana.ts` por ser "sempre os mesmos itens, independente do estado real do caso" e por manter o caso permanentemente NO_GO mesmo com progresso real (`piloto-ana.ts:26-38`). A lista quase idêntica sobreviveu, sem ser tocada, em `corte-vertical.ts` — o mesmo problema que já foi corrigido num arquivo continua existindo, sem uso real, em outro |

### 2.4 Artefatos órfãos — mencionados por completude, não são mecanismos ativos

Dois pedaços de código usam a mesma linguagem de "piloto"/"go-live" da Ana mas **não têm nenhum consumidor real** hoje:

- **`src/lib/decisao-ana-canonica.ts`** — módulo de resolução de alias (`resolverReferenciaAna`, `rotuloExibicaoAna`, etc.), com o mesmo propósito de `definirIdCanonicoPiloto` (Mecanismo B), mas **estático** (constante `DECISAO_ANA_CANONICA` fixa no código, não lê o banco). Busca por todos os importadores confirma: só é usado no próprio arquivo de teste (`__tests__/decisao-ana-canonica.test.ts`). Zero rotas, zero funções de servidor, zero telas o importam. É código morto que replica, de forma pior (estática em vez de viva), o que o Mecanismo B já resolve no banco.
- **`src/components/desk-go-live.tsx`** (`GoLiveDesk`) + **`src/data/case-registry.ts`** (`CASE_REGISTRY`) — um painel de "Go-live e registro de casos" com 5 casos fictícios/demo hardcoded (Sophia, Giovanna, Ana, João genérico, Lara genérica), estado local em `useState` que **não persiste em lugar nenhum**. Busca confirma: nenhuma rota importa `GoLiveDesk`; nenhum outro componente o usa. O **próprio inventário de governança do sistema** (`src/lib/inventario-recuperacao.ts:232-243`) já documenta isso: *"arquivo histórico sem rota ativa... nenhum import de runtime e nenhuma consulta ao banco... status: legado... decisão: preservar"*. Ou seja: este item já foi encontrado, classificado e arquivado **antes** desta pesquisa — não é a peça que a Proprietária viu no Desk (ver seção 1), e não precisa de nova decisão aqui.

## 3. De-para lado a lado

| | Mecanismo A — `/piloto` | Mecanismo B — `/piloto-ana` | Mecanismo C — `/governanca/corte-vertical` |
|---|---|---|---|
| Rótulo no menu | "Piloto e go-live" | "Caso-piloto Ana Luiza" | "Corte vertical e fontes" |
| Lê o banco? | Sim | Sim | **Não** — estático |
| Escreve no banco? | Sim (`piloto_conferencia`, `piloto_bloqueios`, `crm_casos.app_access_status`, cria `research_cases`) | Sim (`crm_casos`, `nucleos_familiares`, `nucleo_membros`, decisão de ID canônico) | Não |
| Como localiza o caso | Flag global `crm_casos.piloto = true` (assume 1 só) | Lista hardcoded de códigos legados da Ana | N/A (dados fixos) |
| Generalizável para qualquer caso? | Estrutura de gates é genérica; localização por flag global **não é** | Lógica de derivação (`derivarPendenciasPiloto`) é genérica; localização e constantes **não são** | Não — é uma foto fixa, específica da Ana, sem mecanismo |
| Bloqueia ação real hoje? | Não (declarado explicitamente na tela) | Não (declarado explicitamente na tela) | Não (nenhum importador consome o valor) |
| Está desatualizado/duplicado? | Não, é a fonte "oficial" das duas tabelas dedicadas | Não, é a leitura mais recente e mais viva | **Sim** — duplica um dado que já foi corrigido em outro arquivo (seção 2.3) |
| Peça reaproveitável para o padrão geral | `GATES_PILOTO` A–H + `agruparBloqueiosPorGate`/`primeiroGatePendente` (estrutura de sequência de gates, já case-agnóstica no código) | `derivarPendenciasPiloto` (motor de derivação ao vivo, já case-agnóstico na assinatura) + `definirIdCanonicoPiloto` (decisão de ID canônico gravada no banco, já genérica na escrita) | Nenhuma — é só apresentação, sem lógica |

## 4. Recomendação

**Nenhum dos três mecanismos, como está hoje, deve virar a regra geral tal e qual.** Todos os três carregam a palavra "piloto" e, em maior ou menor grau, algum grau de hardcoding da Ana (nomes de família, códigos legados, ou um estado congelado). Copiar qualquer um inteiro para o próximo cliente replicaria o mesmo problema que motivou este pedido.

O que deve prevalecer é a **combinação das duas peças de lógica já genéricas na prática**, hoje espalhadas entre A e B:

1. **Motor de derivação ao vivo** — `derivarPendenciasPiloto` (Mecanismo B). Já não lê nada fixo: recebe o estado real do caso e devolve pendências. É a peça mais correta arquiteturalmente das três porque não pode ficar desatualizada — não existe lista para esquecer de atualizar.
2. **Estrutura de gates sequenciais A–H** — `GATES_PILOTO`/`agruparBloqueiosPorGate`/`primeiroGatePendente` (Mecanismo A). Já é genérica no código; só precisa parar de ser alimentada por uma flag global e passar a ser alimentada por `case_id`.
3. **Decisão de ID canônico gravada no banco** — `definirIdCanonicoPiloto` (Mecanismo B). Já é o jeito certo (grava em `crm_casos`, resolve o bloqueio correspondente na mesma operação); deve ser o único jeito — aposentando o resolvedor estático de `decisao-ana-canonica.ts`.

**O que vira legado a reconciliar (preservar, não apagar):**

- `src/lib/decisao-ana-canonica.ts` — código morto, zero consumidor real. Reconciliar significa: manter o arquivo e seu histórico, mas parar de tratá-lo como fonte de verdade (já não é, na prática — ninguém o chama).
- `src/lib/corte-vertical.ts` — bloco `ANA_ESTADO_REAL`/`ANA_BLOQUEIOS`/`situacaoOperacional: "NO_GO"`. Sem consumidor lógico, desatualizado frente ao que `derivarPendenciasPiloto` já sabe ao vivo. As demais constantes do mesmo arquivo (`FONTES_CANONICAS`, `ENTIDADES_VERTICAIS`, `FORA_DO_PRIMEIRO_RELEASE`, a escada de onboarding genérica de João) **não têm relação com o problema da Ana** e não precisam de nenhuma mudança — são referência de escopo do primeiro release, não "piloto".
- `PILOTO_ANA`/`NUCLEO_PILOTO`/`materializarPilotoAna` em `piloto-ana.ts`/`piloto-ana.functions.ts` — bootstrap específico da Ana. Como o caso dela já existe de verdade no banco (confirmado nesta sessão via `clientes.observacoes`/`crm_casos.selo_interno`/`crm_casos.resumo`), a função de "criar se não existir" já não tem mais trabalho a fazer para ela — é história, não mecanismo ativo.
- A rota `/piloto` como hoje localiza o caso (`crm_casos.piloto = true`, assumindo um só) — esse desenho não serve de regra geral por definição: a "regra geral para todos os casos futuros" não pode depender de uma flag global que só um caso por vez pode ter ligada.

**Ordem de execução sugerida** (quando e se a Proprietária autorizar — nenhuma linha de código foi tocada nesta pesquisa):

1. Decidir o nome/local definitivo do mecanismo geral (ex.: uma aba "Conferência e ativação" dentro de Casos 360, endereçada por `case_id`, não mais uma rota separada chamada "piloto").
2. Migrar `derivarPendenciasPiloto` para um arquivo neutro (sem "piloto" no nome), mantendo a assinatura genérica que já tem.
3. Migrar `GATES_PILOTO` e as funções de agrupamento para o mesmo arquivo neutro, trocando a busca por `crm_casos.piloto = true` por busca por `case_id`.
4. Reapontar `/piloto` e `/piloto-ana` (ou uma rota nova unificada) para essa fonte única; decidir se as duas rotas atuais desaparecem do menu ou viram redirecionamento para a nova.
5. Remover o bloco `ANA_ESTADO_REAL`/`ANA_BLOQUEIOS` de `corte-vertical.ts` (ou substituir por uma chamada ao motor genérico, se a Proprietária quiser manter a tela de Corte Vertical mostrando o estado real da Ana).
6. Marcar `decisao-ana-canonica.ts` como histórico (mesmo tratamento que `inventario-recuperacao.ts` já deu a `desk-go-live.tsx`: preservar arquivo, documentar como não-consumido).
7. Antes de finalizar, verificar o mecanismo "9 gates de fechamento" já referenciado em `src/lib/desk-modulos.ts` (`caso-go-live`, destino `/casos/$id (aba Fechamento) · /onboarding/$id`) — esta pesquisa **não auditou esse mecanismo em profundidade**, mas ele aparenta já ser um motor de go-live case-agnóstico, real, endereçado por `$id`, potencialmente sobrepondo-se ao que este documento recomenda construir. Antes de qualquer execução, vale confirmar se ele já resolve o problema, evitando construir uma quarta peça.

## 5. O que este documento NÃO decide / não executa

- Nenhum arquivo em `src/` foi alterado. Nenhuma migration foi criada. Nenhum código foi movido.
- Não decide o nome final da rota/aba geral, nem se `/piloto` e `/piloto-ana` somem do menu ou viram redirecionamento.
- Não decide o destino exato de `ciclo-piloto-ana.ts` (as 4 fases são uma referência genérica, mas alguns itens da Fase 1 citam Ana/Felipe/Alice nominalmente — precisa de decisão humana sobre generalizar o texto ou aposentar o arquivo).
- Não audita em profundidade o mecanismo "9 gates de fechamento" (`/casos/$id` aba Fechamento + `/onboarding/$id`) citado no passo 7 da seção 4 — só confirma que ele existe, é referenciado como real e case-agnóstico, e merece checagem antes de qualquer execução.
- Não decide se as tabelas `piloto_conferencia`/`piloto_bloqueios` mudam de nome — seguindo o mesmo padrão já usado nesta sessão para outros de-paras (mapear antes de tocar em schema).
- Segue o mesmo padrão já validado nesta sessão para todo de-para: **mapear primeiro, decidir depois, executar só com autorização explícita da Proprietária.**

## 6. Fora do escopo

- Qualquer alteração em `clientes.observacoes`, `crm_casos.selo_interno` ou `crm_casos.resumo` (linguagem "PILOTO REAL" já encontrada no banco em sessão anterior) — é dado, não código; fica para decisão e execução separadas, se a Proprietária quiser.
- O componente `GoLiveDesk`/`CASE_REGISTRY` (seção 2.4) — já resolvido pelo próprio sistema como legado preservado; não faz parte da convergência "piloto → real" porque nunca foi, de fato, sobre o piloto da Ana.
- Qualquer mudança em `contract_case_parameters`/motor contratual — já endereçado em `docs/arquitetura/MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md`, tema separado.
- Testes automatizados relacionados (`__tests__/decisao-ana-canonica.test.ts`, `__tests__/piloto-pendencias-vivas.test.ts`) — não foram lidos linha a linha nem alterados; qualquer execução futura precisa revisá-los junto.
