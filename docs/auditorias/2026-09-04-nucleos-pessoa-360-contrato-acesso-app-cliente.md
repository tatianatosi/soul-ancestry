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

## 3. Dossiê-mãe: hoje é texto/link solto, não conteúdo acessível

Os campos de dossiê-mãe em `nucleos.tsx` (`dossie_mae`, `ambiente`, `nivel_acesso`, `link_interno`, `responsavel_nome`, `dossie_status`) são todos texto ou URL solta. O próprio campo `link_interno` tem a ajuda explícita: "URL do ambiente autorizado. **Arquivos não são replicados no Desk.**" (`nucleos.tsx:412` na leitura desta sessão). Ou seja: "atribuir o dossiê" hoje é preencher um formulário descritivo; "acessar o dossiê" significaria sair do Desk e abrir a URL cadastrada em `link_interno`, num ambiente externo (Drive/Dropbox, presumivelmente) — não há conteúdo do dossiê armazenado ou navegável dentro do Desk. Isso não é um bug de vínculo perdido como o da seção 2 — é uma decisão de arquitetura ainda não tomada: o dossiê-mãe deveria ganhar conteúdo real dentro do Desk, ou continuar sendo só um ponteiro para um ambiente externo com metadado de governança (status, responsável, nível de acesso)? Fica registrado como pergunta de decisão (seção 10), não como bug a corrigir.

## 4. Pessoa Canônica / Pessoa 360 — especificação sem código, mais uma proposta não mesclada

| Peça | Estado | Evidência |
|---|---|---|
| Rota de perfil de pessoa (`/pessoas/$clienteId`) | **Implementada, somente leitura** | `src/routes/_authenticated/pessoas.$clienteId.tsx`, servida por `carregarPessoa` em `src/lib/pessoa.functions.ts`; lê `clientes`, `crm_casos`, `case_timeline_events`, `leads`. Comentário explícito no arquivo: "Não grava, não funde registro" (`pessoa.functions.ts:14-16`). |
| Link "Ver pessoa 360" | **Implementado, mas só em `/clientes`** | `clientes.tsx:261-267` e `:310-316` — nenhuma outra tela do Desk linka para lá. |
| `docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md` | **Especificação, zero código** | O próprio documento diz "nenhum código alterado" (linha 3) e deixa em aberto se `pessoas_canonicas` é tabela nova (seção 5, linhas 110-115). Tabela **não existe** no banco. |
| Vínculo `person_id`/`pessoa_id` compartilhado entre `clientes`, `nucleo_membros`, `genealogical_person_profiles` | **Não existe** | Nenhuma dessas três tabelas aponta para um cadastro central único de pessoa — cada uma tem sua própria chave. |
| Proposta "Pessoa 360 — Conjunto Unificado de Dados" (5 camadas mapeadas) | **Existe como commit, não mesclado nesta branch** | Branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03` (commit `2e179d4`) — não é ancestral da branch de trabalho atual, não está em `docs/arquitetura/` do checkout de hoje. |

Isso confirma a hipótese da Proprietária ("acho que isso se resolve com a política unificada de núcleos, que ainda não foi implantada"): existe pelo menos uma proposta de unificação já escrita, mas ainda fora desta branch — vale confirmar com ela se esse PR já foi aprovado/deve ser trazido para cá antes de qualquer novo desenho.

## 5. Ficha piloto × módulo real de pesquisa genealógica

Não é uma substituição limpa (uma não sucede a outra) — é sobreposição parcial com uma divergência concreta:

- `carregarFichaPiloto` (`src/lib/ficha-piloto-genealogica.functions.ts:20-46`) é **só leitura**, sem nenhuma função de escrita no arquivo. Lê `research_cases`, `research_people`, `research_relationships`, `research_hypotheses`, `research_pending_items`, `research_sources`, `research_document_requests`.
- O módulo real editável (`src/lib/pessoas-linhagens.functions.ts`) tem CRUD completo (`criarPessoaComPerfil`, `salvarRegistroG02`, `arquivarRegistroG02`), grava em `genealogical_person_profiles`, `name_variants`, `genealogical_relationships`, `genealogical_events`, `lineage_paths`, e **também** insere em `research_people` ao criar pessoa (linhas 262-273) — esse é o ponto real de sobreposição: a lista de pessoas da ficha piloto reflete pessoas criadas pelo módulo real.
- **A divergência**: a seção "Vínculos familiares" da ficha piloto lê `research_relationships` (colunas `person_a_id`/`person_b_id`, migration de 16/08), enquanto o módulo real de Pessoas e Linhagens grava vínculos em `genealogical_relationships` (colunas `person_from_id`/`person_to_id`, migration de 20/08 — tabela distinta e posterior). **Um vínculo familiar criado pela tela real não aparece na ficha piloto**, e vice-versa.

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

**P0**
1. **Decidir e implementar a propagação de assinatura**: quando `registrarAssinatura` grava `contracts.status = "signed"`, sincronizar `crm_casos.contrato_assinado = true` no mesmo caso. É a lacuna que, sozinha, impede qualquer caso de chegar ao portal mesmo com contrato assinado corretamente no motor novo. Não decide aqui quem seta `pagamento_confirmado`/`documentos_minimos_ok` (são responsabilidades de outros módulos) — só a ponta de contrato.
2. **Ligar `nucleo_membros.cliente_id` a um link de perfil em `/nucleos`**: incluir `cliente_id` no tipo `Membro` do frontend e renderizar "Ver perfil" apontando para `/pessoas/$clienteId` quando o campo existir. Correção pequena, aditiva, sem mudança de schema.

**P1**
3. Trazer para esta branch (ou decidir arquivar) a proposta "Pessoa 360 — Conjunto Unificado de Dados" (branch `docs/pessoa-360-conjunto-unificado-dados-2026-09-03`) antes de desenhar qualquer unificação nova — para não duplicar esforço de leitura do mesmo problema em duas frentes.
4. Decidir a tabela canônica de vínculos familiares (`research_relationships` × `genealogical_relationships`) — mesma lógica da decisão de evidência canônica já registrada no PR #84: enquanto não for decidida, um vínculo criado numa tela pode não aparecer na outra.
5. Criar um teste de integração que exercite o funil completo (assinatura → gate do portal → convite) para que essa lacuna não volte a passar despercebida.

**P2**
6. Especificar se o dossiê-mãe deve ganhar conteúdo navegável dentro do Desk ou permanecer como ponteiro de governança para ambiente externo (seção 3) — depende de decisão de produto, não é bug.
7. Unificar `case_activation_checks` (ativação interna) e os campos lidos por `portal-elegibilidade.ts` (acesso ao portal) num único sistema de gate, se fizer sentido — hoje são dois mecanismos paralelos com requisito de contrato duplicado.

## 10. Perguntas de decisão que só a Proprietária pode responder

1. **Propagação de assinatura**: confirma que `registrarAssinatura` deve setar `crm_casos.contrato_assinado = true` automaticamente? Isso muda o comportamento hoje (nenhuma automação existe) — é a decisão que desbloqueia o P0-1.
2. **Quem seta `pagamento_confirmado`/`documentos_minimos_ok`**: esses dois campos do gate do portal têm algum motor/tela por trás que ainda não foi mapeado nesta rodada, ou também estão sem nenhum caminho de escrita hoje? Vale uma rodada dedicada só a isso antes de declarar o funil resolvido.
3. **Pessoa 360**: a proposta na branch não mesclada (`docs/pessoa-360-conjunto-unificado-dados-2026-09-03`) já é a direção aprovada, ou ainda está em avaliação?
4. **Dossiê-mãe**: deve virar conteúdo dentro do Desk, ou continuar como metadado + link externo?
5. **Vínculo familiar canônico**: `research_relationships` ou `genealogical_relationships`?

## 11. O que este documento NÃO decide

- **Não decide** nem implementa a propagação de assinatura (P0-1) nem o link de perfil em Núcleos (P0-2) — ambos ficam como backlog explícito, pendentes de aprovação, mesmo sendo correções pequenas e de baixo risco.
- **Não decide** qual proposta de "Pessoa 360"/Pessoa Canônica é a direção final, nem se a branch não mesclada deve ser trazida para cá.
- **Não decide** a tabela canônica de vínculo familiar, nem o destino do dossiê-mãe.
- **Não altera nenhuma linha de banco, nenhum arquivo de código, nenhuma migration.**
