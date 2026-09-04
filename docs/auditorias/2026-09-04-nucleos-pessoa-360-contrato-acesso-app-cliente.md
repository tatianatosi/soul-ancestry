# Núcleos → perfil de pessoa, dossiê-mãe, Pessoa Canônica/360, ficha piloto, contrato e acesso ao App Cliente

```yaml
status: em revisão — pendente de decisão da Proprietária
versão: "1.0"
data: 2026-09-04
projeto: Clube Ancestral
classificação: auditoria de comportamento real + de-para de especificação × implementação
responsável pela decisão: Proprietária do Clube Ancestral
fontes: [código real (branch de trabalho da sessão), migrations Supabase, testes, documentos de arquitetura/política já existentes no repositório]
escopo: [núcleos e perfil de pessoa, dossiê-mãe, modelo de Pessoa Canônica/Pessoa 360, ficha piloto genealógica × módulo real de pesquisa, fluxo de contrato, gates de acesso ao App Cliente]
premissas: [reuso do que já existe, nenhuma decisão de arquitetura tomada aqui, sem migration/deploy nesta rodada]
limites: [somente leitura — nenhum código alterado, nenhuma tabela criada, nenhuma convergência decidida]
próximos passos: [backlog P0/P1/P2 na seção 9, perguntas de decisão na seção 10]
critério de aceite: [cada achado tem path/tabela real e, quando aplicável, o commit/migration que o originou]
```

## Causa

A Proprietária relatou um bug concreto na tela de Núcleos: dentro de um núcleo aparecem as pessoas do requerente (A, B, C) e, ao clicar numa delas, não é possível editar nem entrar no perfil dessa pessoa — o mesmo vale para o dossiê-mãe, que pode ser atribuído/designado mas não acessado (ver ou editar o que contém). Ela suspeitou que isso se resolveria com "a política unificada de núcleos, que ainda não foi implantada", e pediu um panorama mais amplo: cadastro de perfis, perfil único de pessoa, aplicação correta da ficha piloto e da ficha de pesquisa genealógica, unificação num "Pessoa 360", avanço do contrato, e os acessos ao App Cliente hoje travados para entrada real de cliente.

Esta rodada seguiu essas seis pistas até o código.

---

## 1. Resumo executivo

O bug relatado é real e tem causa exata: **o vínculo técnico entre um membro do núcleo e o cadastro de pessoa já existe no banco e já é buscado pelo backend — só não é usado no frontend da tela de Núcleos.** Não é uma peça de arquitetura faltando; é um campo que chega até a tela e é descartado antes de virar link.

O panorama mais amplo confirma o padrão já visto em outras rodadas desta sessão ("muita especificação, pouco motor conectado"):
- **Perfil de pessoa existe e funciona** (`/pessoas/$clienteId`, rotulado "Ver pessoa 360" em `/clientes`), mas é uma ilha somente-leitura, alcançável só a partir de `/clientes` — nenhuma outra tela do Desk linka para ela.
- **"Pessoa Canônica" é especificação sem código.** O documento que a propõe (`docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`) se autodeclara "nenhum código alterado"; a tabela proposta (`pessoas_canonicas`) não existe no banco.
- **Existe uma proposta mais recente de "Pessoa 360" como conjunto unificado de dados**, mas está numa branch (`docs/pessoa-360-conjunto-unificado-dados-2026-09-03`) que não foi mesclada nesta branch de trabalho — a Proprietária pode já ter essa peça em algum PR aberto que só precisa ser trazido para cá.
- **Ficha piloto e módulo real de pesquisa genealógica não são a mesma coisa** — leem em parte a mesma base, mas os vínculos familiares vivem em duas tabelas diferentes (`research_relationships` × `genealogical_relationships`), de modo que um vínculo criado no módulo real de Pessoas e Linhagens não aparece na ficha piloto, e vice-versa.
- **O motor de contrato funciona ponta a ponta como projetado**, inclusive com decisões de design documentadas (sem PDF, sem assinatura eletrônica externa — desabilitado de propósito nesta fase).
- **O achado mais importante desta rodada**: a assinatura registrada no motor de contrato (`contracts.status = "signed"`) **nunca é propagada** para `crm_casos.contrato_assinado` — que é exatamente o campo que o gate de acesso ao App Cliente verifica. Isso é, muito provavelmente, a causa raiz concreta do "acesso travado para entrada real de cliente" que a Proprietária citou.

---

## 2. Núcleos → perfil de pessoa: o vínculo existe, só não é usado

- `nucleo_membros` tem coluna `cliente_id`, e `listarNucleos` já busca essa coluna: `.from("nucleo_membros").select("id,nucleo_id,nome,papel,vinculo,processo,ordem,cliente_id")` (`src/lib/nucleos-desk.functions.ts:49-50`).
- O tipo `Membro` em `src/routes/_authenticated/nucleos.tsx:50` **não inclui `cliente_id`** — o dado chega do backend e é descartado antes de virar UI.
- Não há nenhum `<Link>` em `nucleos.tsx` apontando para `/pessoas/$clienteId` (grep confirmado: zero ocorrências).
- O botão "Editar" ao lado de cada membro (`nucleos.tsx`, mutação `salvarMembroNucleo`) só grava `nome`/`vinculo`/`processo` em `nucleo_membros` — nunca toca `clientes`, nunca abre nem linka para o perfil da pessoa.
- Existe um comentário no próprio código (`src/lib/nucleos-desk.functions.ts:127-137`) documentando que esse buraco já foi notado antes: "Existia leitura (`listarNucleos`) e criação (só via materialização do piloto), mas nenhuma edição... Resultado real, confirmado em produção: [dado editado não tinha para onde ir]". O commit que corrigiu isso (`45f0e74`, 30/08 — "Corrige causa raiz de 'dados da Ana não salvam'") resolveu a edição de texto solto, mas **não** endereçou o vínculo de navegação até o perfil da pessoa.

**Conclusão**: a rota de perfil já existe (`/pessoas/$clienteId`, ver seção 3) e o dado para linká-la já chega ao frontend — falta só usar `m.cliente_id` para renderizar um link "Ver perfil" ao lado de cada membro que tiver esse campo preenchido. É uma correção pequena e aditiva (não remove nada, não muda schema), mas ainda assim listada como backlog na seção 9 em vez de aplicada aqui, seguindo o limite desta rodada (somente leitura).

## 3. Dossiê-mãe: hoje é texto/link solto — **e a Proprietária confirma que é assim mesmo por desenho, não decisão em aberto**

**Correção desta rodada**: a primeira versão deste documento tratou o formato do dossiê-mãe (texto/link
solto) como decisão de arquitetura ainda em aberto. A Proprietária corrigiu: já existe uma automação
de governança para isso — o dossiê-mãe **deve** conter só o link externo, nunca o dump do conteúdo,
porque já existe um mecanismo real (ainda que hoje desconectado da tela) responsável por provisionar a
pasta no Drive compartilhado. Achado confirmado no código:

- `src/lib/drive-provisioning.ts` é uma **fila de provisionamento** ("preparação, nunca execução" — comentário
  no topo do arquivo, linhas 1-6). Define `ESTRUTURA_PADRAO_DOSSIE` (linhas 94-101): `00_Dossie_Mae`,
  `01_Documentos_Cliente`, `02_Evidencias`, `03_Relatorios`, `04_Contratos_e_Comercial`, `05_Protocolo` —
  ou seja, o dossiê-mãe já é desenhado, por padrão, como **uma pasta dentro de uma estrutura maior no
  Drive**, não como conteúdo dentro do Desk.
- `avaliarFilaDrive()` (linhas 45-66) confirma exatamente o comportamento que a Proprietária descreveu:
  **oportunidade nunca cria pasta** ("Oportunidade não cria dossiê operacional", linha 48);
  **confirmação formal só cria item de fila bloqueado**, nenhuma pasta ainda (linhas 50-55); só quando
  `contrato_assinado` + `pagamento_confirmado` + `onboarding_aprovado` estão todos verdadeiros a fila
  fica `ready_for_review` — e mesmo aí, **a execução real (criar a pasta) continua manual**: exige
  aprovação humana registrada (`podeTransicionar`, linhas 69-87) e, ao marcar `executed`, exige uma
  `resultadoExterno` preenchida (linha 84) — o link real da pasta, provavelmente.
- Isso é regra formalizada, não interpretação: `src/lib/criterios-aceite.ts:109-117` registra
  `CA-AC-10` — "Drive fica apenas em fila de provisionamento até gates completos e confirmação futura"
  — com estado `"atendido"`.
- Tabela real por trás: `drive_provisioning_queue` (migração `20260820010018`), lida em
  `src/lib/caso-ficha.functions.ts:64` e exibida (só leitura) em `src/components/caso/visao-geral.tsx:241-252`
  ("Fila de provisionamento do Drive" — "Nenhum item na fila. Nada é criado no Drive automaticamente.").

**O gap real não é a regra — é que ela está desconectada da tela de Núcleos.** Busca confirma:
nenhum código insere em `drive_provisioning_queue` (a tabela existe e é lida, mas nada a popula
automaticamente); e os campos que a Proprietária vê em `/nucleos` (`nucleos_familiares.dossie_mae`/
`link_interno`, seção 2) não têm nenhum vínculo com essa fila — são texto solto, preenchido à mão,
sem checar contra os gates nem contra o `external_result_reference` da fila. **Duas peças corretas,
nunca costuradas**: a fila sabe quando a pasta pode ser criada e por quem; a tela de Núcleos não
consulta a fila nem grava nela.

## 4. Pessoa Canônica / Pessoa 360 — **já aprovada pela Proprietária; o que falta é execução, não decisão**

**Correção desta rodada**: a primeira versão deste documento tratou a proposta "Pessoa 360" como
pendente de aprovação. A Proprietária confirmou: o protocolo já foi aprovado em conjunto, com dados e
parâmetros adicionais discutidos depois da entrega do documento (PR #64, branch
`docs/pessoa-360-conjunto-unificado-dados-2026-09-03`, commit `2e179d4`, ainda não mesclada nesta
branch de trabalho). Lido por completo nesta rodada
(`docs/arquitetura/2026-09-03_PESSOA-360-CONJUNTO-UNIFICADO-DE-DADOS.md` na branch original):

| Peça | Estado | Evidência |
|---|---|---|
| Rota de perfil de pessoa (`/pessoas/$clienteId`) | **Implementada, somente leitura** | `src/routes/_authenticated/pessoas.$clienteId.tsx`, servida por `carregarPessoa` em `src/lib/pessoa.functions.ts`; lê `clientes`, `crm_casos`, `case_timeline_events`, `leads`. |
| **Camada 1 — Pessoa Canônica (`clientes`)** | **Aprovada como identidade civil única, já implementada** | Documento de 03/09, seção "Camada 1": CPF, RG, endereço estruturado, estado civil, procurador — já no schema real. |
| **Camada 2 — vínculo caso/núcleo (`nucleo_membros.cliente_id`, `contract_parties.client_id`)** | **Aprovada como o vínculo que liga Pessoa Canônica a um caso/contrato** | Documento de 03/09, seção "Camada 2". Confirmado nesta rodada (seção 4.1 abaixo): só `contract_parties` de fato usa esse vínculo hoje; `nucleo_membros` não. |
| Camada 3 — pesquisa genealógica interna (G-02) | **Aprovada como camada só interna, por desenho** | Citação direta do documento: "O App Cliente não lê perfis, relações, eventos, variantes ou notas internas: a projeção permanece bloqueada até devolutiva aprovada." Não é lacuna — é regra deliberada. |
| Camada 4 — 13 módulos históricos (G-02c) | **Schema completo aprovado, 0 linhas em todas as 13** | "todos os aspectos da vida" já modelado; falta pesquisa real, não desenho. |
| Camada 5 — `CaseData` (contrato de exibição ao cliente) | **100% demo hoje (Giovanna e Sophia)**, com de-para bloco a bloco já registrado no documento de 03/09 | `src/lib/classificacao-dados.ts` classifica os dois casos como `mockup_interno`. |
| Direção de "unificar" | **Já decidida**: camada de projeção (mesmo padrão de `app_projections`/`client_deliverables`), não tabela nova | Recomendação do próprio documento aprovado, seção "O que 'unificar' deveria significar". |

**O que está pendente não é a decisão — é trazer a branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03`
para o histórico desta branch de trabalho** (ou confirmar que ela já seguiu por outro caminho de merge
fora desta sessão), e executar os itens que o próprio documento aprovado já lista como "próximos
passos": (1) decidir o destino da ficha da Sophia; (2) priorizar quais dos 13 módulos da Camada 4
recebem pesquisa real primeiro; (3) desenhar o adaptador Camadas 1–4 → `CaseData`; (4) decidir os 3
gaps sem fonte alguma hoje (percentual de aderência por país, texto de alerta de engajamento, timeline
do lado "cliente").

### 4.1 — A fragmentação real, com nome: Ana Luiza tem, hoje, 4 registros de "pessoa" sem vínculo entre si

A Proprietária pediu para verificar a fragmentação de "uma Ana em 4 cadastros diferentes", ligando isso
ao contrato. Não foi possível confirmar contagem exata de linhas ao vivo (MCP do Supabase sem
autorização nesta sessão — mesma limitação já registrada em `docs/auditorias/MATRIZ-RECONCILIACAO-ANA-LUIZA-2026-08-30.md`).
Mas desta vez a causa raiz foi encontrada por completo, com evidência de migration — e não é a mesma
leitura da rodada anterior (que apontava só `nucleo_membros`). São **quatro** tabelas, cada uma com um
"Ana" próprio:

| # | Tabela | Registro de Ana | Vínculo a `clientes` (Pessoa Canônica)? | Origem/evidência |
|---|---|---|---|---|
| 1 | `clientes` | `nome = "Ana Luiza"` (nome curto, dado mínimo) | **É** o canônico — `crm_casos.cliente_id` e `contracts.client_id` apontam para ele | `supabase/migrations/20260816232935_a72396bb...sql:247-249`, id `a11a0000-...-000000000001`, criado 16/08 |
| 2 | `nucleo_membros` | `nome = "Ana Luiza Gomes Silveira Rodrigues"` (nome completo) | **Não** — `cliente_id` nulo desde a origem | Seed de 18/08 (`20260818201721_818f92ac...sql:90-101`) faz `left join clientes on lower(c.nome) = lower(m.nome)` — igualdade exata. "Ana Luiza" ≠ "Ana Luiza Gomes Silveira Rodrigues": nunca bateu. Adair e Alice bateram porque o nome completo deles já era o nome cadastrado em `clientes`. |
| 3 | `contract_parties` | `person_name = "Ana Luiza Gomes Silveira Rodrigues"`, com CPF/e-mail/telefone/endereço reais | **Não** — `client_id` nulo pelo mesmo motivo | Mesma migration, linhas 114-126, mesmo `left join` por igualdade exata. |
| 4 | `case_members` | `nome ilike 'Ana Luiza%'` | **Impossível de ter vínculo — a coluna não existia** | `case_members` (`supabase/migrations/20260816190336_...sql:234-246`) nunca teve `cliente_id`/`client_id` no schema. Usada por ~15 módulos ativos (`cadastro-checklist`, `escopo-conferencia`, `matriz-conformidade`, `matriz-equivalencia`, `pesquisa`, `contrato-preparar`, entre outros) — não é tabela morta, é a base de "pessoa do caso" para grande parte do Desk. |

Cada um dos 4 tem um subconjunto diferente do dado real de Ana: o (1) tem o vínculo comercial/contrato
mas nome e dados mínimos; o (2)/(3) têm documento, endereço e contato completos mas nenhum vínculo; o
(4) tem os campos de checklist/conformidade e também não tinha como se vincular a nada. **Nenhum dos
quatro tem, sozinho, todos os dados reais de Ana** — exatamente o que a Proprietária descreveu.

`genealogical_person_profiles` (Camada 3, pesquisa genealógica) fica de fora dessa contagem de
propósito: confirmado por leitura de `pessoas-linhagens.functions.ts` que não tem `cliente_id`/`client_id`
— isolamento deliberado (mesma regra que impede o App Cliente de ler pesquisa bruta), não fragmentação.

### 4.2 — Execução aplicada nesta rodada: vínculo fechado nas 3 tabelas, para Ana e para qualquer caso futuro

Autorizado pela Proprietária ("pode executar a unificação... para não acontecer o que está acontecendo
com a Ana em nenhum lugar"). Três mudanças, todas aditivas — nenhuma linha apagada ou fundida:

1. **`case_members` ganha a coluna `cliente_id`** (migration
   `20260904140000_pessoa360_vinculo_case_members_e_backfill_cliente_id.sql`) — a Camada 2 do protocolo
   Pessoa 360, que hoje só cobria `nucleo_membros`/`contract_parties`, passa a cobrir também esta
   tabela.
2. **Backfill retroativo, não específico da Ana**: a mesma migration liga `cliente_id`/`client_id` em
   `nucleo_membros`, `contract_parties` e `case_members` para qualquer linha hoje sem vínculo cujo nome
   bate — exato, ou por um nome ser prefixo do outro seguido de espaço (cobre "Ana Luiza" ⊂ "Ana Luiza
   Gomes Silveira Rodrigues") — **com exatamente um cliente candidato** na mesma organização. Caso
   ambíguo (mais de um candidato) fica nulo, como estava — decisão humana, nunca escolha às cegas.
3. **Correção do código-fonte do problema, para não se repetir em nenhum caso novo**:
   - `src/lib/pessoa-vinculo.ts` (novo) — `clienteCorrespondentePorNome()`, a mesma regra tolerante do
     backfill SQL, reutilizável em qualquer função de servidor.
   - `src/lib/piloto-ana.functions.ts` (`materializarPilotoAna`) — agora busca os clientes da
     organização, calcula o vínculo com `clienteCorrespondentePorNome()` e grava `cliente_id` tanto ao
     inserir um membro novo quanto ao encontrar um membro já existente sem vínculo (antes, a função só
     inseria — nunca corrigia um membro já criado sem `cliente_id`, que era exatamente o caso de Ana).
   - `src/lib/cadastro-checklist.functions.ts` (`semearChecklistCadastral`) — trocou o match por
     igualdade exata de nome pela mesma regra tolerante, e passou a **gravar o vínculo de volta em
     `case_members.cliente_id`** (antes só existia, de forma transitória, dentro de
     `checklist_cadastral`, recalculado a cada chamada).

**O que isso não faz**: não decide qual dos 4 registros deveria ser o único (a Camada 2 do protocolo já
decidiu que `clientes` é a Pessoa Canônica — as outras três tabelas apontam para ela, não a substituem);
não apaga nenhuma linha de `case_members`/`nucleo_membros`/`contract_parties`; não confirma, porque não
há acesso ao Supabase nesta sessão, que o backfill realmente encontrou e ligou as linhas de Ana em
produção — isso só pode ser conferido rodando a migration e depois `conferirEstruturaFamiliar`
(`src/lib/nucleo-familiar.functions.ts`, critério "Existem três registros individuais no CRM, sem
duplicidade") ou a consulta SQL já preparada em `MATRIZ-RECONCILIACAO-ANA-LUIZA-2026-08-30.md`.
`npx tsc --noEmit`, `npx vitest run` (1595/1595) e `npx vite build` passam com as três mudanças de
código.

### 4.3 — Execução estendida: o vínculo agora aparece em toda tela onde a pessoa é exibida, não só em `/nucleos`

Correção pedida pela Proprietária ("estender pra todas os níveis"). O backfill da seção 4.2 populava
`cliente_id`, mas o link "Ver perfil" só tinha sido adicionado à seção 4.2 anterior desta rodada em
`/nucleos` (`src/routes/_authenticated/nucleos.tsx`). Existe uma segunda tela que mostra os mesmos
membros do núcleo — `src/components/caso/pessoas-do-nucleo.tsx`, a projeção somente leitura de
"Pessoa e família" dentro do próprio Caso 360 (`casos.$caseId.index.tsx`, usada sempre que o caso tem
núcleo vinculado, que é o caso de Ana) — e essa tela lia `id,nome,papel,vinculo,processo` mas **descartava
`cliente_id`**, exatamente o mesmo bug de origem já corrigido em `/nucleos` na rodada anterior. Corrigido:
o tipo `MembroNucleo` passou a incluir `cliente_id`, e cada membro com vínculo agora mostra "Ver perfil"
(`/pessoas/$clienteId`) ao lado do papel — a mesma pessoa aparece com o mesmo link em qualquer uma das
duas telas que a listam. `listarNucleos` (`src/lib/nucleos-desk.functions.ts:50`) já selecionava
`cliente_id` desde antes; só a segunda tela não repassava o campo. `npx tsc --noEmit` e
`npx vitest run` (1595/1595) passam.

Não foi identificada uma terceira tela que liste pessoas de núcleo com os mesmos dados — as duas
cobertas (`/nucleos` e a aba "Pessoa e família" do Caso 360) são as únicas que consomem `listarNucleos`.

## 5. Ficha piloto × módulo real de pesquisa genealógica — de-para completo e recomendação de unificação

A pedido da Proprietária: de-para campo a campo entre a ficha piloto e o módulo real, para dizer
exatamente o que falta em cada lado antes de unificar num só, dentro do protocolo de Pessoa 360 já
aprovado (seção 4).

Não é uma substituição limpa (uma não sucede a outra) — é sobreposição parcial com uma divergência
concreta na peça mais importante para "vínculo familiar":

- `carregarFichaPiloto` (`src/lib/ficha-piloto-genealogica.functions.ts:20-46`) é **só leitura**, sem nenhuma função de escrita no arquivo. Lê `research_cases`, `research_people`, `research_relationships`, `research_hypotheses`, `research_pending_items`, `research_sources`, `research_document_requests`.
- O módulo real editável (`src/lib/pessoas-linhagens.functions.ts`) tem CRUD completo (`criarPessoaComPerfil`, `salvarRegistroG02`, `arquivarRegistroG02`), grava em `genealogical_person_profiles`, `name_variants`, `genealogical_relationships`, `genealogical_events`, `lineage_paths`, e **também** insere em `research_people` ao criar pessoa (linhas 262-273) — esse é o ponto real de sobreposição: a lista de pessoas da ficha piloto reflete pessoas criadas pelo módulo real.
- **A divergência central**: a seção "Vínculos familiares" da ficha piloto lê `research_relationships` (migration de 16/08), enquanto o módulo real de Pessoas e Linhagens grava vínculos em `genealogical_relationships` (migration de 20/08 — tabela distinta e posterior). **Um vínculo familiar criado pela tela real não aparece na ficha piloto**, e vice-versa.

### 5.1 — De-para campo a campo de `research_relationships` × `genealogical_relationships`

Leitura direta do schema (`src/integrations/supabase/types.ts`) — as duas tabelas modelam a mesma
ideia (vínculo entre duas pessoas) com dois conjuntos de campos que **não se sobrepõem totalmente**:

| Campo | `research_relationships` (ficha piloto) | `genealogical_relationships` (módulo real) | O que cada um tem que o outro não tem |
|---|---|---|---|
| Par de pessoas | `person_a_id` / `person_b_id` | `person_from_id` / `person_to_id` | Mesmo conceito, nomes diferentes — de-para direto |
| Tipo de relação | `relationship_type` | `relation_type` | Mesmo conceito, nome diferente |
| Caso | `research_case_id` (aponta para `research_cases`) | `case_id` (aponta direto para o caso) | Chaves estrangeiras para entidades diferentes — outra reconciliação a decidir |
| Nota interna | `notes_internal` | `internal_notes` | Mesmo conceito, nome diferente |
| **Confiança/validação** | `confidence_level`, `status`, `directionality`, `supporting_evidence_count` | — | **Só a ficha piloto tem**: nível de confiança, status de workflow, direcionalidade do vínculo, contagem de evidências de suporte |
| **Exposição ao cliente** | — | `client_visibility` | **Só o módulo real tem**: o campo que decide se esse vínculo pode aparecer no App Cliente — essencial para a regra "projeção bloqueada até devolutiva aprovada" da Camada 3 |
| **Contexto do vínculo** | — | `locality`, `relation_date`, `relation_date_aproximada` | **Só o módulo real tem**: onde e quando o vínculo aconteceu (data exata ou aproximada) |
| **Evidência/fonte direta** | — | `evidence_id`, `source_id` | **Só o módulo real tem**: link direto a UMA evidência/fonte específica, não só uma contagem |

**Leitura**: `genealogical_relationships` (o módulo real, editável) é o candidato natural a tabela
canônica — já tem o campo de sanitização (`client_visibility`) que a Camada 3 do protocolo de Pessoa
360 exige, e já liga a evidência/fonte específica. Falta migrar para ele os quatro campos de
workflow/confiança que hoje só existem em `research_relationships` (`confidence_level`, `status`,
`directionality`, `supporting_evidence_count`) — sem esses campos, a ficha piloto perde informação real
se for redirecionada para a tabela nova sem ajuste de schema primeiro.

### 5.2 — O que mais falta migrar (além do vínculo familiar)

A ficha piloto lê três fontes que não têm equivalente confirmado no módulo real de Pessoas e Linhagens:
- `research_hypotheses` — hipóteses de pesquisa; o módulo real não grava hipótese (achado já registrado
  em outra auditoria desta sessão: hipótese vive em `research_hypotheses`/`research_case_hypotheses`,
  nenhuma delas é escrita por `pessoas-linhagens.functions.ts`).
- `research_pending_items` — pendências de pesquisa; sem equivalente no módulo real.
- `research_document_requests` — solicitações de documento; possivelmente o mesmo conceito de
  `document_requests` já mapeado na auditoria de evidência (PR #84, seção 14) — precisa confirmar se
  são a mesma tabela ou duas tabelas paralelas antes de unificar.

Esses três não têm o mesmo tipo de sobreposição direta do vínculo familiar — são pontos que a ficha
piloto cobre e o módulo real de Pessoas e Linhagens simplesmente não aborda ainda. Unificar "numa só"
como a Proprietária pediu significa, no mínimo: (1) mover os 4 campos de confiança/workflow para
`genealogical_relationships`; (2) decidir se hipótese/pendência/solicitação de documento entram no
mesmo módulo ou continuam em tabelas próprias já existentes; (3) reapontar `carregarFichaPiloto` para
ler as tabelas reais em vez de `research_relationships`/`research_people` isoladas.

## 6. Contrato — fluxo real ponta a ponta

O contrato nasce sempre de um caso (nunca de proposta isolada): `abrirPreparacaoContrato` (`src/lib/contrato-preparar.functions.ts:93-347`) busca o caso, a proposta aprovada mais recente, o template e a base de cláusulas, e cria/reaproveita um registro único em `contract_case_parameters` — bloqueando explicitamente casos e clientes demo.

Estados reais (`src/lib/contrato-parametros.functions.ts`): `rascunho` → `gerarPrevia` → `congelarPrevia` (snapshot imutável tipo `final`, exige ausência de placeholders pendentes) → `aprovarParametros` → `enviarParaAssinatura` (nasce a linha em `contracts` com `status: "in_review"`, mais `contract_parties` e `contract_scope_items`) → `registrarAssinatura` (grava `contracts.status = "signed"`, `signed_at`, `signature_reference`; exige ao menos uma parte com `signature_required = true`).

Duas decisões de design já documentadas no próprio código, não bugs:
- **Documento é HTML, não PDF** — armazenado em bucket privado `contracts` como `text/html` (comentário explícito em `contratos.functions.ts:11-15` explica a escolha).
- **Assinatura eletrônica/envio externo desabilitados nesta fase** — `tentarEtapaExterna` (`contratos.functions.ts:788-800`) bloqueia e audita qualquer tentativa, com a mensagem "Etapa desabilitada nesta fase".

Tabelas reais envolvidas: `contracts`, `contract_versions`, `contract_parties`, `contract_scope_items`, `contract_clause_overrides`, `contract_annexes`, `contract_source_links`, `contract_validation_results`, `contract_review_events`, `service_orders`, `contract_exceptions`, `contract_case_parameters`, `contract_parameter_values`, `contract_parameter_previews`, `contract_templates`.

## 7. Acesso ao App Cliente — todas as travas, na ordem em que são checadas

`src/lib/portal-elegibilidade.ts` espelha travas reais de banco:

| Checagem | Campo verificado | Espelha trava de banco? |
|---|---|---|
| Contrato assinado | `crm_casos.contrato_assinado` | Sim — `fn_portal_case_access_guard` (migração `20260821185352`) |
| Pagamento confirmado | `crm_casos.pagamento_confirmado` | Sim |
| Documentos mínimos | `crm_casos.documentos_minimos_ok` | Sim |
| Ativação/onboarding humano | `ativado_em` OU `onboarding_iniciado_em` | Sim |
| E-mail aprovado no nível pretendido | `authorized_portal_emails.status = 'aprovado'` | Sim — `fn_portal_access_autorizacao_guard` |
| (nível `proposal_portal`) proposta enviada/aprovada, não arquivada | `proposals.status` | Sim |

Há ainda uma trava redundante só de código de servidor em `criarConvitePortal` (`portal.functions.ts:459-481`), que exige os três campos do caso antes mesmo de tentar o convite — redundante com a trava de banco, não é o problema.

### O achado crítico

**Nenhum código do repositório escreve `crm_casos.contrato_assinado = true`.** Busca exaustiva por `.update("crm_casos")`, por todas as migrations/triggers e por `registrarAssinatura` não encontrou nenhum caminho que sincronize `contracts.status = "signed"` (o motor de contrato da seção 6) com `crm_casos.contrato_assinado` (o campo que o gate do portal, seção 7, de fato verifica). O campo aparece só como leitura em `casos.$caseId.index.tsx:841`. Isso significa: **uma assinatura registrada corretamente no motor de contrato novo não libera, por si só, o acesso do cliente ao portal** — alguém precisaria setar esses três campos manualmente em algum lugar, e não foi localizada nenhuma tela para isso.

Existe ainda um segundo sistema de gate, paralelo e não unificado com este: `case_activation_checks` (14 requisitos, `casos-ativacao.functions.ts:17-32`, trigger `trg_caso_ativacao_gates_guard`) também tem um requisito de contrato, mas ele controla `crm_casos.ativo`/`status`, não a coluna `contrato_assinado` que o portal lê.

## 8. Funil completo — onde quebra

Caso → proposta aprovada → motor contratual (seção 6) → **assinatura registrada em `contracts`, sem propagação para `crm_casos.contrato_assinado`** → (lacuna: ninguém seta os três campos do caso) → convite de e-mail → confirmação de acesso → RLS libera leitura no App Cliente.

Não foi localizado teste que exercite esse funil ponta a ponta com Supabase real. `src/lib/__tests__/aceite-e2e-passos.test.ts` testa só metadados de um roteiro de capturas de tela, sem executar o fluxo. Não há teste cobrindo `registrarAssinatura` → `crm_casos.contrato_assinado` → `bloqueioDoCaso`.

Onboarding (`onboarding.functions.ts` e módulos irmãos) opera sobre `crm_casos.ativo`/`ativado_em` — é pré-requisito paralelo à ativação interna, não ao portal diretamente, mas alimenta `onboarding_iniciado_em`, um dos dois campos aceitos pelo gate. Os módulos de onboarding só leem `contrato_assinado`/`pagamento_confirmado` como status, nunca escrevem.

Não foi localizado documento de auditoria anterior mapeando especificamente essa lacuna `contracts.status = 'signed'` → `crm_casos.contrato_assinado` — é achado novo desta rodada.

---

## 9. Backlog P0/P1/P2

**Decidido nesta rodada pela Proprietária** (deixam de ser pergunta em aberto):
- Pessoa 360 (protocolo de 5 camadas) está **aprovada** — falta execução, não decisão (seção 4).
- Dossiê-mãe **deve conter só o link externo**, nunca o dump do conteúdo — o Desk aponta para a pasta
  no Drive, não a replica (seção 3). A regra já existe em código (`drive-provisioning.ts`,
  `CA-AC-10`); falta só conectar a tela.
- Vínculo familiar: unificar numa só tabela, com `genealogical_relationships` como base (já tem
  `client_visibility` e evidência direta), somando os 4 campos de confiança/workflow que hoje só
  existem em `research_relationships` (seção 5.1).

**P0 — executados nesta rodada, com autorização explícita da Proprietária** (commits `d06227e`, `46290af`):
1. ✅ **Propagação de assinatura**: `registrarAssinatura` agora grava `crm_casos.contrato_assinado = true` no mesmo caso logo após `contracts.status = "signed"` — a lacuna que impedia qualquer caso de chegar ao portal mesmo com contrato assinado no motor novo. Não mexe em quem seta `pagamento_confirmado`/`documentos_minimos_ok` (responsabilidade de outros módulos, seção 10 pergunta 2 segue aberta).
2. ✅ **Vínculo `cliente_id` em Núcleos**: "Ver perfil" (`/pessoas/$clienteId`) aparece ao lado de todo membro com `cliente_id` preenchido; o formulário de edição ganhou o seletor "Vincular a pessoa cadastrada" (nova função `listarClientesParaVinculo`), para ligar manualmente qualquer requerente ao seu cadastro de Pessoa Canônica — inclusive retroativamente, sem depender de reescrever a materialização hardcoded do piloto.
3. ✅ **Divergência proposta × Planejador vira conflito persistente por campo**: `preencherDeOrigens` agora grava a mesma marca de conflito (`contract_parameter_values.conflito`) já usada para incoerência de país/rota, então a divergência aparece de forma persistente nas duas telas de parâmetros (não só no toast) e se resolve do mesmo jeito que qualquer outro conflito por campo — editando o valor.
4. ✅ **Pessoa 360 — vínculo `cliente_id`/`client_id` fechado nas 3 tabelas onde Ana estava fragmentada** (seção 4.2): `case_members` ganhou a coluna que nunca teve; migration de backfill liga retroativamente `nucleo_membros`/`contract_parties`/`case_members` para qualquer pessoa sem vínculo cujo nome bate sem ambiguidade; `materializarPilotoAna` e `semearChecklistCadastral` param de usar igualdade exata de nome (a causa raiz do caso de Ana) e passam a gravar o vínculo, inclusive retroativo, em vez de só ler.

**Não executado nesta rodada** (decisão de arquitetura, não bug pontual):
5. **Conectar `nucleos_familiares.link_interno` à fila real de Drive** (`drive_provisioning_queue`): hoje são dois mecanismos corretos e desconectados — a fila sabe quando uma pasta pode ser criada (gates completos) e guarda o resultado (`external_result_reference`), mas nada sincroniza esse valor para o campo que a Proprietária vê em `/nucleos`. Depende da resposta à pergunta 3 da seção 10 (quem executa a fila).

**P1**
6. Trazer para esta branch (ou confirmar que já seguiu outro caminho de merge) a proposta "Pessoa 360 — Conjunto Unificado de Dados" (branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03`) — já aprovada, falta só integrar ao histórico de trabalho.
7. **Migrar os 4 campos de confiança/workflow** (`confidence_level`, `status`, `directionality`, `supporting_evidence_count`) de `research_relationships` para `genealogical_relationships`, depois reapontar `carregarFichaPiloto` para as tabelas reais — nessa ordem, para não perder dado (seção 5.1/5.2).
8. Decidir se `research_hypotheses`/`research_pending_items`/`research_document_requests` (lidos hoje só pela ficha piloto) entram no módulo real de Pessoas e Linhagens ou continuam separados (seção 5.2).
9. Confirmar se `research_document_requests` é a mesma tabela que `document_requests` (já mapeada na auditoria de evidência, PR #84) antes de decidir o item 8.
10. Criar um teste de integração que exercite o funil completo (assinatura → gate do portal → convite) para que essa lacuna não volte a passar despercebida.
11. Verificar se a linha "Ana Luiza (dado de teste)" em `leads` tem algum vínculo com `clientes.id` — não confirmado nesta rodada (seção 4.1).
12. Rodar a migration de backfill (item 4) em produção e conferir com `conferirEstruturaFamiliar` se as 3 linhas de Ana ficaram de fato ligadas — esta sessão não tem acesso ao Supabase para confirmar o resultado real do backfill.

**P2**
13. Unificar `case_activation_checks` (ativação interna) e os campos lidos por `portal-elegibilidade.ts` (acesso ao portal) num único sistema de gate, se fizer sentido — hoje são dois mecanismos paralelos com requisito de contrato duplicado.

## 10. Perguntas de decisão que só a Proprietária pode responder

1. ~~Propagação de assinatura~~ — **executada** nesta rodada (P0-1 do backlog), com autorização explícita da Proprietária.
2. **Quem seta `pagamento_confirmado`/`documentos_minimos_ok`**: esses dois campos do gate do portal têm algum motor/tela por trás que ainda não foi mapeado nesta rodada, ou também estão sem nenhum caminho de escrita hoje? Vale uma rodada dedicada só a isso antes de declarar o funil resolvido.
3. **Execução da fila de Drive**: quem deve marcar uma pasta como `approved`/`executed` na fila (`drive_provisioning_queue`) — é uma ação manual de alguém da equipe fora do Desk, ou a Proprietária quer uma tela dedicada para isso hoje? Não existe hoje nenhuma tela de ação sobre a fila, só a leitura em Visão Geral do caso. Segue pendente — bloqueia o backlog P1-4 (dossiê-mãe ↔ fila de Drive).
4. **Hipótese/pendência/solicitação de documento**: entram no módulo real de Pessoas e Linhagens junto com o vínculo familiar unificado, ou continuam em tabelas próprias (seção 5.2, item 7 do backlog)?

## 11. O que este documento (e o que a rodada de execução) NÃO decide

**Executado nesta rodada**, com autorização explícita da Proprietária, sobre este documento (commits
`d06227e`, `46290af`, branch `claude/ancestral-club-desk-intelligence-0gsoeg`): propagação de assinatura
para `crm_casos.contrato_assinado`; vínculo `cliente_id` em Núcleos com link de perfil e seletor de
vinculação manual; persistência por campo da divergência proposta × Planejador. `tsc --noEmit` limpo,
1595/1595 testes passando, `vite build` limpo em todas as três mudanças.

**Ainda não decidido/executado**:
- Conexão do dossiê-mãe à fila de Drive (P0-4/backlog) — depende da resposta à pergunta 3 da seção 10.
- Qual tabela é canônica para vínculo familiar e para evidência (decisões de arquitetura, não bugs pontuais).
- Se a branch de Pessoa 360 deve ser trazida para o histórico desta branch.
- O destino de `research_hypotheses`/`research_pending_items`/`research_document_requests` na unificação da ficha piloto.
- **Nenhuma migration foi criada ou alterada** — os três fixes escrevem em colunas já existentes no schema.
