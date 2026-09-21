# De-para — Uma identidade operacional do Lead ao Caso

- Status: rascunho
- Versão: v1.0
- Data: 2026-09-21
- Responsável pela decisão: Proprietária do Clube Ancestral
- Fonte de evidência: leitura direta de código em `origin/main` (`04384d28`), via worktree isolado (`p1-identidade-lead-caso`). Toda citação é arquivo:linha real.
- Escopo: registrar, campo a campo, como a cadeia Lead → Contato → Discovery → Cliente/Pessoa Canônica → Caso já funciona hoje, e o que nesta execução foi de fato novo (não redescrever o que já existia).
- Objetivo do pedido: `clientes.id` já é a pessoa canônica pós-conversão; não deve existir fusão automática, exclusão automática ou cópia de identidade; conflito exige decisão humana registrada.

## Achado central desta execução

A maior parte da cadeia **já está implementada e testada** — mais do que o pedido presumia. Não recriei nada que já existisse; o que segue documenta o que já há, para não virar "arquitetura paralela" numa próxima rodada.

## 1. Lead — writer único, já compartilhado

`salvarLeadDesk` (`src/lib/crm-desk.functions.ts`) é o writer canônico de `leads`, chamado tanto por `/leads` (`leads.tsx`) quanto por `/calls` (`painel-calls.tsx`, Mesa de Discovery). **Já era um writer único antes desta execução** — nenhuma mudança necessária no item "unificar writer entre /calls e /leads".

`/crm-mestre` (rota histórica) é mapa de regras/handoff, nunca escreve `leads` diretamente — confirmado, decisão já vigente.

## 2. Busca preventiva por e-mail/telefone/CPF — 2 de 3 já existiam; CPF era o gap real

Duas funções de deduplicação já existiam, cada uma com sua própria normalização (não reaproveitam `pessoa-identidade.ts` — achado à parte, ver seção "Dívida não perseguida"):

- **`verificarDuplicidadeCliente`** (`src/lib/clientes.functions.ts:159-188`) — já busca por e-mail, telefone (últimos 8 dígitos) e nome antes de criar um `clientes` novo. Usada pelo modal "Novo cadastro" (`clientes.tsx:734-745`), que já mostra a lista de possíveis duplicatas com link "abrir ficha existente" e exige confirmação explícita para "cadastrar mesmo assim".
- **`verificarDuplicidadeLead`** (`src/lib/crm-desk.functions.ts:826-832`, via `buscarDuplicidades`) — mesma ideia para `leads`, usada por `criarLeadManual` com a flag `confirmarDuplicidade` (mesmo padrão "conflito exige decisão humana").

**Gap real, confirmado e fechado nesta execução**: `evidenciaDeMesmaPessoa` (`src/lib/pessoa-identidade.ts`) — a função central de evidência de identidade, usada em Pessoa 360 ("Antes de virar cliente") e no handoff Discovery → Cliente — comparava só e-mail e telefone, nunca CPF. CPF é sinal mais forte que e-mail (documento não é compartilhado; e-mail de família às vezes é). `normalizarCpf` (novo) e o CPF como primeiro critério em `evidenciaDeMesmaPessoa` (antes do e-mail) fecham esse gap.

**Segundo gap, encontrado e fechado na rodada de publicação**: `verificarDuplicidadeCliente` (`clientes.functions.ts`) trazia um comentário afirmando que não podia usar CPF porque *"`clientes` não tem coluna de documento validada; CPF é dona de `case_members.cpf`"*. **Isso estava errado.** `clientes.cpf` existe desde a migration `20260902144855_pessoa_canonica_extensao_clientes.sql`, com o comentário de coluna *"Pessoa Canônica — campo próprio, distinto do texto livre em `documento`"* — decisão da proprietária de 02/09/2026 (estender `clientes` em vez de criar `pessoas_canonicas`). É a mesma coluna que `sincronizarPessoaDoCaso` já usa como valor canônico ao reconciliar `contract_parties`. A ausência em `src/integrations/supabase/types.ts` é **drift de tipo, não de schema** — exatamente o caso que o AGENTS.md prevê ("migration existe; pode faltar em `types.ts`").

Consequência prática: a busca preventiva do cadastro de pessoa ignorava o sinal mais forte que tinha disponível. Fechado agora — `verificarDuplicidadeCliente` lê `clientes.cpf`, compara com `normalizarCpf` (a mesma função de `pessoa-identidade.ts`, não uma quarta normalização paralela) e reporta "mesmo CPF" como primeiro motivo. O modal "Novo cadastro" passou a coletar CPF (opcional, com `formatarCpf`) para que o sinal exista no ponto da prevenção, e a lista de candidatos exibe o CPF do registro existente.

`leads` **não tem** coluna de CPF (confirmado em migrations) — lead só ganha documento depois de virar cliente. Por isso "CPF quando disponível" é, na prática, um sinal de nível cliente: vale ao comparar `clientes` entre si e ao confirmar um candidato no handoff, não na triagem do lead.

## 3. Ação única "Converter em cliente/pessoa canônica" — já existe como `executarHandoffDiscovery`

`executarHandoffDiscovery` (`src/lib/handoff-discovery.functions.ts:96-...`) já faz exatamente o que o pedido descreve:

1. Resolve ou cria `clientes` via `decidirClienteDoHandoff` (`src/lib/handoff-discovery.ts:27-77`) — reusa automaticamente só quando o e-mail é **confirmado**; telefone ou múltiplos candidatos "prováveis" retornam `{ ok: false, precisaConfirmarCliente: true, candidatos }`, sem criar nada — decisão humana obrigatória antes de prosseguir.
2. Preserva o lead: `leads.case_id` é gravado, o lead não é apagado nem duplicado; `resumoHandoffDoLead` (`handoff-discovery.ts`) leva call/Discovery/elegibilidade/próxima ação para o resumo do caso, sem redigitar.
3. Registra evento — `registrarTimelineCaso` já é chamado dentro do fluxo.
4. **Caso só depois da pessoa canônica escolhida**: quando `precisaConfirmarCliente: true`, a função retorna sem criar `crm_casos` — o caso só nasce depois de um `clienteIdConfirmado` explícito ou `forcarCriarCliente: true`.

Exposta hoje só em `painel-calls.tsx` (`/calls`) — os dois botões que chamam essa mutation (`"Usar esta pessoa"`/`"Criar pessoa nova"`) já foram unificados sob a mesma confirmação (`AcaoOperacional`) num batch anterior desta sessão (Lote 4, batch 14) — não é mais "duas portas para a mesma escrita externa".

## 4. Vínculo canônico exibido no Caso e na pesquisa — já feito em rodadas anteriores desta sessão

- **Caso 360**: `case_members.cliente_id` (migration `20260904140000`) já vincula cada membro a `clientes`; o bloco "Estado Integrado do Caso" (execução anterior desta mesma sessão) já exibe a pessoa canônica e o núcleo com link para Pessoa 360.
- **Perfil genealógico**: `genealogical_person_profiles.client_id` (Corte U2, migration `20260906134500`) já é editável via seletor explícito "Vincular a pessoa já cadastrada (opcional)" em `pessoas-linhagens.$caseId.tsx` — nunca automático.

Nenhuma vinculação automática foi introduzida ou é necessária aqui — já é opt-in humano nos dois casos.

## 5. `case_members`/pessoas-linhagens/participantes — mesma regra já aplicada

Reconciliação de CPF entre `clientes` e as tabelas satélite (`case_members`, `contract_parties`) já foi conectada a UI em execuções anteriores desta sessão (`conferirDivergenciaCpfMembrosCaso`, `sincronizarPessoaDoCaso`) — nunca sobrescreve, sempre marca conflito para decisão humana.

## Dívida não perseguida nesta execução (registrada, não corrigida)

`verificarDuplicidadeCliente`/`verificarDuplicidadeLead` reimplementam normalização de **e-mail/telefone/nome** com código próprio, em vez de reaproveitar `normalizarEmail`/`normalizarTelefone`/`normalizarNome` de `pessoa-identidade.ts`. Funciona corretamente hoje — não é bug — mas é lógica paralela que poderia convergir para uma fonte só. O CPF, acrescentado agora, **já entrou pela função canônica** (`normalizarCpf`), então a dívida não cresceu: ela ficou restrita aos três sinais antigos. Não foi tocada porque mexe em dois gates de criação já em produção sem necessidade objetiva comprovada, e a ordem pedia o sinal que faltava, não a refatoração dos que já funcionam.

## O que esta execução mudou de fato

1. `normalizarCpf` (novo) + CPF como critério de evidência mais forte em `evidenciaDeMesmaPessoa` — `src/lib/pessoa-identidade.ts`. Aditivo: nenhuma assinatura de função mudou, `cpf` é campo opcional em `RegistroDePessoa`.
2. CPF na busca preventiva de cliente — `verificarDuplicidadeCliente` (`clientes.functions.ts`) lê `clientes.cpf`, compara via `normalizarCpf` e reporta "mesmo CPF"; `PossivelDuplicidadeCliente` ganhou o campo `cpf` (aditivo). Comentário factualmente errado sobre a inexistência da coluna foi corrigido com a citação da migration.
3. Modal "Novo cadastro" (`clientes.tsx`) coleta CPF opcional com `formatarCpf`, envia à checagem preventiva e mostra o CPF do candidato na lista de possíveis duplicidades.
4. Este documento.

Nada de fusão automática foi introduzido: CPF igual **mostra** o candidato e oferece "abrir ficha existente"; gravar mesmo assim continua exigindo o segundo clique consciente ("Cadastrar mesmo assim").

## Testes

- `src/lib/__tests__/p1-identidade-conversao-lead-cliente.test.ts` (novo, 19 casos) — duplicidade preventiva por CPF na coluna canônica, reuso da normalização única, preservação dos três sinais antigos, isolamento por `organization_id` e exclusão de arquivados, coleta/envio do CPF no cadastro, gate de segundo clique, trava de duplo submit, link para ficha existente; conversão para cliente existente por e-mail e por CPF, recusa de conversão automática por telefone e por nome, dois confirmados pedindo decisão humana, criação de pessoa nova sem elo, confirmação humana explícita; caso só depois do cliente canônico, preservação do lead e registro no histórico; writer único de lead entre `/calls` e `/leads`.
- `src/lib/__tests__/pessoa-identidade.test.ts` — 4 casos novos: CPF normalizado corretamente, CPF com contagem errada de dígitos recusado, CPF idêntico confirma mesmo com nome/e-mail diferentes, CPF é checado antes do e-mail sem quebrar o caso onde os dois confirmam.
- Cobertura pré-existente reaproveitada, não reescrita: `src/lib/__tests__/circuito-abas-mesa-kpis.test.ts` (linha 58: "e-mail confirmado reusa cliente; telefone pede confirmação; sem elo cria").
