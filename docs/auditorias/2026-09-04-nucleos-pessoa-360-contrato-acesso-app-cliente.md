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

### 4.1 — A fragmentação real, com nome: `nucleo_membros` não usa a Camada 2 que o próprio protocolo já define

A Proprietária pediu para verificar a fragmentação de "uma Ana em 4 cadastros diferentes", ligando isso
ao contrato. Não foi possível confirmar contagem exata de linhas ao vivo (MCP do Supabase sem
autorização nesta sessão — mesma limitação já registrada em `docs/auditorias/MATRIZ-RECONCILIACAO-ANA-LUIZA-2026-08-30.md`,
que também não teve acesso ao banco). O que o código confirma, com evidência exata de onde a
fragmentação nasce e onde já está correta:

| Tabela | Vínculo a `clientes` (Pessoa Canônica)? | Evidência |
|---|---|---|
| `contract_parties` | **Sim, correto** | `contrato-parametros.functions.ts:1204-1208` — `client_id: caso?.cliente_id ?? null` ao criar a parte contratante. Prova que o padrão certo (referenciar `clientes.id`) já é usado em pelo menos um lugar do sistema — não precisa ser inventado, só replicado. |
| `nucleo_membros` | **Não, apesar da coluna existir** | A materialização do núcleo-piloto (`src/lib/piloto-ana.functions.ts:167-176`, função que cria "Ana Luiza", "Adair", "Alice", "Felipe" como membros) insere `organization_id`, `nucleo_id`, `nome`, `papel`, `vinculo`, `processo`, `ordem` — **sem `cliente_id`**, mesmo a coluna existindo no schema e sendo lida por `listarNucleos` (achado da seção 2). A dedupe desse insert é por **nome dentro do núcleo** (linha 161-162: `select("nome")` + `Set`), não por `cliente_id` — exatamente o padrão que gera um segundo cadastro solto para a mesma pessoa. |
| `genealogical_person_profiles` (Camada 3) | **Não tem coluna para isso — e não deveria ter, por desenho** | Confirmado por leitura de `pessoas-linhagens.functions.ts`: nenhuma referência a `cliente_id`/`client_id`. Isso não é a mesma fragmentação — é a Camada 3 sendo deliberadamente isolada (ver seção 4), a mesma regra que impede o App Cliente de ler pesquisa bruta. |
| `leads` | **Não verificado nesta rodada** | O artefato de 03/09 já registrou que existe uma linha "Ana Luiza (dado de teste)" em `leads` — não confirmei nesta rodada se ela tem algum campo de conversão apontando para `clientes.id`. Fica como item a verificar, não como achado fechado. |

**Conclusão**: a fragmentação não é um problema arquitetural amplo — o protocolo já aprovado (Camada 2)
já resolve isso corretamente para contrato. O ponto exato que falta é um: a materialização de núcleo
(hoje só usada pelo piloto, mas é o mesmo caminho de código que qualquer novo núcleo usaria) não
preenche `cliente_id` ao criar o membro. Corrigir isso é o mesmo ponto já listado como backlog P0-2
(seção 9) — a correção completa precisa dos dois lados: **popular `cliente_id` ao criar/materializar
o membro**, e **usar esse campo para linkar o perfil na tela**, como já registrado.

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

**P0**
1. **Decidir e implementar a propagação de assinatura**: quando `registrarAssinatura` grava `contracts.status = "signed"`, sincronizar `crm_casos.contrato_assinado = true` no mesmo caso. É a lacuna que, sozinha, impede qualquer caso de chegar ao portal mesmo com contrato assinado corretamente no motor novo. Não decide aqui quem seta `pagamento_confirmado`/`documentos_minimos_ok` (são responsabilidades de outros módulos) — só a ponta de contrato.
2. **Popular `cliente_id` ao materializar `nucleo_membros`, e ligar esse campo a um link de perfil em `/nucleos`**: a materialização do núcleo-piloto (`piloto-ana.functions.ts:167-176`) não grava `cliente_id`, mesmo a coluna existindo e sendo lida — é a causa concreta da fragmentação da Ana entre `clientes` (correto) e `nucleo_membros` (solto). Corrigir os dois lados: gravar o vínculo ao criar o membro, e usar `cliente_id` para renderizar "Ver perfil" apontando para `/pessoas/$clienteId`.
3. **Conectar `nucleos_familiares.link_interno` à fila real de Drive** (`drive_provisioning_queue`): hoje são dois mecanismos corretos e desconectados — a fila sabe quando uma pasta pode ser criada (gates completos) e guarda o resultado (`external_result_reference`), mas nada sincroniza esse valor para o campo que a Proprietária vê em `/nucleos`.

**P1**
4. Trazer para esta branch (ou confirmar que já seguiu outro caminho de merge) a proposta "Pessoa 360 — Conjunto Unificado de Dados" (branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03`) — já aprovada, falta só integrar ao histórico de trabalho.
5. **Migrar os 4 campos de confiança/workflow** (`confidence_level`, `status`, `directionality`, `supporting_evidence_count`) de `research_relationships` para `genealogical_relationships`, depois reapontar `carregarFichaPiloto` para as tabelas reais — nessa ordem, para não perder dado (seção 5.1/5.2).
6. Decidir se `research_hypotheses`/`research_pending_items`/`research_document_requests` (lidos hoje só pela ficha piloto) entram no módulo real de Pessoas e Linhagens ou continuam separados (seção 5.2).
7. Confirmar se `research_document_requests` é a mesma tabela que `document_requests` (já mapeada na auditoria de evidência, PR #84) antes de decidir o item 6.
8. Criar um teste de integração que exercite o funil completo (assinatura → gate do portal → convite) para que essa lacuna não volte a passar despercebida.
9. Verificar se a linha "Ana Luiza (dado de teste)" em `leads` tem algum vínculo com `clientes.id` — não confirmado nesta rodada (seção 4.1).

**P2**
10. Unificar `case_activation_checks` (ativação interna) e os campos lidos por `portal-elegibilidade.ts` (acesso ao portal) num único sistema de gate, se fizer sentido — hoje são dois mecanismos paralelos com requisito de contrato duplicado.

## 10. Perguntas de decisão que só a Proprietária pode responder

1. **Propagação de assinatura**: confirma que `registrarAssinatura` deve setar `crm_casos.contrato_assinado = true` automaticamente? Isso muda o comportamento hoje (nenhuma automação existe) — é a decisão que desbloqueia o P0-1.
2. **Quem seta `pagamento_confirmado`/`documentos_minimos_ok`**: esses dois campos do gate do portal têm algum motor/tela por trás que ainda não foi mapeado nesta rodada, ou também estão sem nenhum caminho de escrita hoje? Vale uma rodada dedicada só a isso antes de declarar o funil resolvido.
3. **Execução da fila de Drive**: quem deve marcar uma pasta como `approved`/`executed` na fila (`drive_provisioning_queue`) — é uma ação manual de alguém da equipe fora do Desk, ou a Proprietária quer uma tela dedicada para isso hoje? Não existe hoje nenhuma tela de ação sobre a fila, só a leitura em Visão Geral do caso.
4. **Hipótese/pendência/solicitação de documento**: entram no módulo real de Pessoas e Linhagens junto com o vínculo familiar unificado, ou continuam em tabelas próprias (seção 5.2, item 6 do backlog)?

## 11. O que este documento NÃO decide

- **Não decide** nem implementa a propagação de assinatura (P0-1), o vínculo `cliente_id` em Núcleos (P0-2) nem a conexão do dossiê-mãe à fila de Drive (P0-3) — ficam como backlog explícito, pendentes de execução, mesmo sendo correções pequenas e de baixo risco.
- **Não decide** o destino de `research_hypotheses`/`research_pending_items`/`research_document_requests` na unificação da ficha piloto.
- **Não altera nenhuma linha de banco, nenhum arquivo de código, nenhuma migration.**
