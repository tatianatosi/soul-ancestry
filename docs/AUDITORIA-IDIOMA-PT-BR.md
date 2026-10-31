# Auditoria de idioma — português do Brasil

**Data:** 26/10/2026 · **Escopo:** repositório `tatianatosi/soul-ancestry` (Desk interno + App Cliente) e banco de produção Lovable `1a628b61-ec68-454f-85e1-671d6f297370`
**Natureza:** somente leitura. Nenhum arquivo de produto foi alterado, nenhuma migration proposta para execução, nenhum commit.
**Método:** 384 CHECK constraints extraídos de `pg_constraint` + `information_schema.columns`; contagens reais de linha via `pg_stat_user_tables`; distribuição real de valores por `GROUP BY`; grep sobre 1.563 arquivos `.ts`/`.tsx` em `src/`.

Cada achado traz **CONFIRMADO** (evidência direta: linha de arquivo ou resultado de query) ou **SUSPEITA** (indício consistente, sem prova fechada).

---

## 1. Resumo executivo

O produto **não está "misturado" no texto que o cliente lê** — essa parte da percepção da Proprietária não se confirma. A interface do Desk e as 7 abas do App Cliente estão em português do Brasil de forma consistente: 100% dos `toast` auditados, 100% dos `label=`/`placeholder=`/`aria-label=` auditados e os textos de estado vazio estão em pt-BR. O inglês visível que resta é **boilerplate não traduzido do shadcn/ui** ("Close", em 3 telas) e, nos componentes órfãos (`sidebar`, `pagination`, `carousel`, `breadcrumb`), inglês que nunca chega a um usuário porque nada os importa.

**O que é GRAVE (brasileiro lê inglês hoje, em produção).** Existe um ponto real e localizado: a tela **Contratos → instrumento** (`contratos.$id.tsx`) imprime valores crus do banco, em inglês, dentro de tabelas cujo cabeçalho está em português. O operador lê "Status: `included`", "Origem: `annex`", "Severidade: `blocking`", "Situação: `open`", "activation_gate · …". Não é um problema de idioma do código: é um dicionário de rótulo que existe no repositório (`src/components/contratos/rotulos.tsx`) e **não foi aplicado nessas 5 posições**. É a correção de menor custo e maior retorno de toda esta auditoria — não exige migration, não exige decisão de vocabulário, não toca schema.

**O que é INCONSISTÊNCIA DE DOMÍNIO (mesmo conceito em duas línguas, risco de bug).** Aqui a Proprietária está certa, e o problema é maior do que a semente que ela trouxe. O banco tem **duas camadas de domínio paralelas e simultaneamente vivas**: uma em português (`crm_casos`, `clientes`, `documents`, `tarefas`, `genealogical_*`, `evidencias`, `name_variants`) e uma em inglês (`contract_*`, `research_*`, `service_orders`). Elas não são legado e sucessor — **as duas têm linha gravada, leitor ativo, escritor ativo e tela própria**. `genealogical_relationships` guarda 13 relações como `pai_mae`/`conjuge`; `research_relationships` guarda 13 relações como `parent`/`spouse`/`sibling`/`grandparent`. `name_variants` tem 0 linhas e uma tela CRUD completa; `research_name_variants` tem 12 linhas e outra tela. A tese dela de que "se construiu componente novo por causa de divergência de idioma, em vez de padronizar o vocabulário" **está confirmada por evidência direta de código**: existe um arquivo inteiro (`src/lib/fontes-pesquisa-canonicas.ts`) cuja única função é traduzir registros do inglês para o português e copiá-los de uma tabela para a outra, com perda de informação documentada no próprio código.

**O que é CONVENÇÃO TÉCNICA ACEITÁVEL (não é defeito).** 1.500 das 4.507 colunas do schema (33%) são chaves e metadados de infraestrutura — `id`, `organization_id`, `created_at`, `updated_at`, `created_by`, `archived_at`, `case_id`, `client_id`. Isso é padrão de banco relacional, não é texto que o usuário lê, e traduzir custaria caro sem ganho nenhum. Igualmente aceitáveis: `status` como palavra (empréstimo consolidado em pt-BR), siglas (`GO`, `NO_GO`, `UF`, `CPF`, `RG`), nomes de biblioteca e classes CSS. **Nada disso deve entrar em plano de correção.**

---

## 2. Frente 1 — vocabulário de valor (CHECK constraints)

### 2.1 Panorama

Dos 384 CHECK constraints do schema `public`, 365 definem vocabulário de valor. Classificados:

| Camada | Tabelas | Vocabulário |
|---|---|---|
| Português puro | 65 tabelas (`crm_casos`, `clientes`, `tarefas`, `leads`, `invoices`, `payments`, `opportunities`, `portal_document_requests`, `case_commercial_condition`, `documents`, `institutions`, `genealogical_sources_catalog`, …) | pt-BR |
| **Inglês puro** | **19 tabelas** (abaixo) | en |
| Misto **dentro da mesma tabela** | 28 tabelas | pt + en |

**Evidência:** query `SELECT t.relname, c.conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE c.contype='c' AND n.nspname='public'` — 384 linhas.

### 2.2 Tabelas com vocabulário de valor 100% em inglês — CONFIRMADO

As 19: `contracts`, `contract_parties`, `contract_annexes`, `contract_versions`, `contract_scope_items`, `contract_templates`, `contract_exceptions`, `contract_review_events`, `contract_validation_results`, `service_orders`, `drive_provisioning_queue`, `research_people`, `research_relationships`, `research_case_events`, `research_pending_items`, `research_audit_events`, `research_client_summaries`, `research_evidence_links`, `research_name_variants`.

As colunas de maior impacto operacional:

| Tabela | Coluna | Valores atuais (inglês) | Equivalente pt-BR natural | Linhas | Risco de traduzir |
|---|---|---|---|---|---|
| `contract_parties` | `role` | `contracting_client`, `co_contractor`, `dependent`, `provider`, `legal_representative`, `authorized_payer`, `witness`, `third_party_reference` | `contratante`, `cocontratante`, `dependente`, `prestador`, `representante_legal`, `pagador_autorizado`, `testemunha`, `referencia_terceiro` | 7 | **ALTO** — colide conceitualmente com `case_members.papel_no_caso` e `nucleo_membros.papel_no_caso`, que já usam `contratante`/`titular`/`dependente`. Unificar as três exige decidir qual é a tabela canônica de papel, não só renomear valores. |
| `contracts` | `status` | `draft`, `pending_data`, `ready_for_review`, `under_human_review`, `approved_for_send`, `sent`, `signed`, `rejected`, `cancelled`, `archived` | `rascunho`, `dados_pendentes`, `pronto_para_revisao`, `em_revisao_humana`, `aprovado_para_envio`, `enviado`, `assinado`, `rejeitado`, `cancelado`, `arquivado` | 7 | **ALTO** — 10 valores, ≥12 arquivos leitores (incl. `golive-escritores.functions.ts`, `comercial-fluxo.ts`, `cards-fluxo-contrato.tsx`, `juridico-contrato-v4.tsx`) e uma máquina de estados (`ORDEM_STATUS`). |
| `contracts` | `financial_gate_status` | `blocked`, `confirmed`, `exception_authorized`, `not_applicable`, `pending_confirmation`, `pending_contract` | `bloqueado`, `confirmado`, `excecao_autorizada`, `nao_aplicavel`, `aguardando_confirmacao`, `aguardando_contrato` | 7 | **ALTO** — é gate financeiro; errar um valor libera ou bloqueia operação indevidamente. |
| `contracts` | `research_gate_status` | `blocked_by_contract`, `blocked_by_financial_gate`, `eligible_for_human_release`, `released_by_authorized_user` | `bloqueado_por_contrato`, `bloqueado_por_gate_financeiro`, `elegivel_liberacao_humana`, `liberado_por_usuario_autorizado` | 7 | **ALTO** — mesmo motivo. |
| `contract_versions` | `status` | `working`, `validation_failed`, `ready_for_review`, `under_review`, `approved_for_send`, `superseded`, `signed_snapshot`, `archived` | `trabalho`, `falha_validacao`, `pronta_para_revisao`, `em_revisao`, `aprovada_para_envio`, `superada`, `registro_assinatura`, `arquivada` | 2 | MÉDIO — dicionário já completo em `rotulos.tsx:57-66`. |
| `contract_scope_items` | `status` | `included`, `excluded`, `conditional`, `pending`, `not_applicable` | `incluido`, `excluido`, `condicional`, `pendente`, `nao_aplicavel` | — | MÉDIO — **hoje exibido cru ao operador** (ver Frente 2, item G1). |
| `contract_scope_items` | `source_type` | `annex`, `case`, `manual_review`, `proposal`, `template` | `anexo`, `caso`, `revisao_manual`, `proposta`, `modelo` | — | MÉDIO — **hoje exibido cru** (G2). |
| `contract_scope_items` | `category` | `contracted_scope`, `deliverable`, `operational_condition`, `customer_obligation`, `club_obligation`, `exclusion`, `dependency`, `external_expense` | `escopo_contratado`, `entrega`, `condicao_operacional`, `obrigacao_contratante`, `obrigacao_clube`, `exclusao`, `dependencia`, `despesa_terceiros` | — | MÉDIO — dicionário completo em `rotulos.tsx:79-88` e já aplicado. |
| `contract_annexes` | `annex_type` / `status` | `scope`, `service_order`, `financial_schedule`, … / `missing`, `drafting`, `ready_for_review`, `approved`, `attached`, `signed_with_contract`, `not_applicable`, `archived` | `escopo`, `ordem_servico`, `cronograma_financeiro` / `ausente`, `em_preparacao`, … | — | MÉDIO — dicionários completos em `rotulos.tsx:89-110`. |
| `contract_validation_results` | `severity` / `status` | `blocking`, `high`, `medium`, `low` / `open`, `passed`, `resolved`, `waived` | `bloqueante`, `alta`, `media`, `baixa` / `aberta`, `aprovada`, `resolvida`, `dispensada` | — | MÉDIO — **hoje exibido cru** (G3, G4), apesar de `ROTULO_SEVERIDADE` existir. |
| `contract_exceptions` | `scope` | `activation_gate`, `financial_gate`, `validation_waiver`, `other` | `gate_ativacao`, `gate_financeiro`, `dispensa_validacao`, `outro` | — | BAIXO — **hoje exibido cru** (G5); não existe dicionário. |
| `service_orders` | `status` | `draft`, `pending_approval`, `approved`, `active`, `paused`, `completed`, `cancelled`, `archived` | `rascunho`, `aguardando_aprovacao`, `aprovada`, `ativa`, `pausada`, `concluida`, `cancelada`, `arquivada` | 3 | **ALTO** — colide com `crm_casos.status` (`ativo`, `rascunho`, `concluido`, `arquivado`, `pausado`): mesmas palavras, duas línguas, duas tabelas. |
| `service_orders` | `start_condition_status` | `blocked`, `contract_signed`, `financial_condition_met`, `manually_authorized`, `pending` | `bloqueada`, `contrato_assinado`, `condicao_financeira_atendida`, `autorizada_manualmente`, `pendente` | 3 | MÉDIO |
| `research_cases` | `status` | `not_started`, `preparation`, `internal_research`, `awaiting_documents`, `awaiting_review`, `paused`, `completed`, `archived` | `nao_iniciada`, `preparacao`, `pesquisa_interna`, `aguardando_documentos`, `aguardando_revisao`, `pausada`, `concluida`, `arquivada` | 4 | **ALTO** — já existe ponte de tradução bidirecional em `src/lib/pesquisa-cadeia.ts:39-44` mapeando `nao_iniciada→not_started`, `aguardando_cliente→awaiting_documents` etc. Traduzir obriga a reescrever essa ponte. |
| `research_people` | `person_status` | `subject`, `ancestor`, `descendant`, `family_member`, `related_person`, `unknown_person` | `requerente`, `ascendente`, `descendente`, `membro_familia`, `pessoa_relacionada`, `pessoa_desconhecida` | 13 | **ALTO** — a mesma tabela já tem `papel_na_linhagem` em pt-BR com valores `ascendente_austriaco`, `ascendente_perseguido`, `elo_da_cadeia` (ver 2.3). |
| `research_relationships` | `relationship_type` | `parent`, `child`, `spouse`, `sibling`, `grandparent`, `grandchild`, `guardian`, `adopter`, `adopted_child`, `other`, `unknown` | `pai_mae`, `filho`, `conjuge`, `irmao`, `avo`, `neto`, `tutor`, `adotante`, `filho_adotivo`, `outro`, `desconhecido` | 13 | **ALTO** — `genealogical_relationships.relation_type` já grava `pai_mae`/`conjuge` em pt-BR para as mesmas pessoas (ver Frente 3, D2). |
| `research_relationships` / `research_case_events` / `research_evidence_items` / `genealogical_relationships` | `status` | `asserted`, `under_review`, `supported`, `validated`, `conflicting`, `rejected` | `afirmada`, `em_revisao`, `com_suporte`, `validada`, `conflitante`, `refutada` | 13+2+5+13 | **ALTO** — vocabulário epistêmico; é a base do "nada inferido" do App. Há ponte de tradução lossy em `fontes-pesquisa-canonicas.ts:203-209`. |
| `research_case_events` | `event_type` | `birth`, `baptism`, `marriage`, `death`, `burial`, `migration`, `military_service`, `residence`, `naturalization`, `name_change`, `document_issue`, `divorce`, `other` | `nascimento`, `batismo`, `casamento`, `morte`, `sepultamento`, `migracao`, `servico_militar`, `residencia`, … | 2 | MÉDIO — tradução já escrita e em uso em `fontes-pesquisa-canonicas.ts:241-250`. |
| `research_document_requests` | `status` / `request_type` | `draft`, `requested_from_client`, `under_review`, `received`, `completed`, `blocked_by_gate`, `cancelled`, `archived` / `client_document`, `registry_request`, `archive_request`, `translation`, `apostille`, `internal_review`, `future_external_request`, `other` | `rascunho`, `solicitado_ao_cliente`, `em_revisao`, `recebido`, … | 5 | **ALTO** — colide com `portal_document_requests.status` em pt-BR (`aceito`, `aguardando`, `em_revisao`, `recebido`, `recusado`, `cancelado`). Dois vocabulários de pedido de documento. |
| `research_pending_items` | `status` / `item_type` / `priority` | `open`, `in_progress`, `blocked`, `resolved`, `not_applicable`, `archived` / `document`, `event`, `review`, `authorization`, `conflict`, `identity`, `relationship`, `source`, `external_gate`, `other` / `critical`, `high`, `medium`, `low` | `aberta`, `em_andamento`, … / `critica`, `alta`, `media`, `baixa` | — | MÉDIO — `priority` colide com `crm_casos.prioridade_chk` e `tarefas.prioridade_chk`, ambos já em pt-BR (`alta`, `baixa`, `critica`, `media`). |
| `research_name_variants` | `variant_type` / `status` | `spelling`, `transliteration`, `abbreviation`, `married_name`, `alternate_language`, `record_error`, `other` / `unreviewed`, `plausible`, `validated`, `rejected` | `grafia`, `transliteracao`, `abreviacao`, `nome_de_casada`, … | 12 | MÉDIO — `name_variants` (pt, 0 linhas) usa `estado_validacao`/`nivel_confianca` em pt-BR. |
| `drive_provisioning_queue` | `status` | `approved`, `blocked`, `cancelled`, `executed`, `failed`, `ready_for_review` | `aprovada`, `bloqueada`, `cancelada`, `executada`, `falhou`, `pronta_para_revisao` | 1 | BAIXO |
| `app_projections` | `approval_status` | `draft`, `in_review`, `approved`, `published`, `archived` | `rascunho`, `em_revisao`, `aprovada`, `publicada`, `arquivada` | 25 | **ALTO** — é o gate de publicação do App Cliente. Há código defensivo que já aceita as duas línguas (ver Frente 3, D7). |

### 2.3 Mistura de línguas **dentro da mesma tabela** — CONFIRMADO

As 28 piores. Destaco as que são defeito e não convenção:

| Tabela | Coluna/constraint em pt-BR | Coluna/constraint em inglês | Observação |
|---|---|---|---|
| `app_projections` | `visibility_scope` = `equipe_interna`, `nucleo`, `titular` · `destination` = `app`, `one_page`, `pdf_aprovado` | `approval_status` = `draft`, `in_review`, `approved`, `published`, `archived` · `source_entity_type` = `case`, `event`, `evidence`, `finding`, `lineage`, `milestone` | **A mesma linha de tabela carrega escopo em português e estado em inglês.** 25 linhas gravadas. Coluna `geracao_cliente`/`pessoa_id` (pt) ao lado de `created_by`/`effective_from` (en). |
| `genealogical_relationships` | `status_pesquisa` (CHECK pt: `hipotese`, `pendente`, `provavel`, `a_confirmar`, `refutado`) · `client_visibility` = `interna` | `status` (CHECK en: `asserted`, `under_review`, `supported`, `validated`, `conflicting`, `rejected`) · `confidence_level` = `high`/`low`/`medium` · `relation_type` (valores pt `pai_mae`/`conjuge`, nome de coluna en) | **Duas colunas de status na mesma tabela, uma em cada língua, as duas preenchidas em todas as 13 linhas:** `status_pesquisa='pendente'` (13/13) e `status='asserted'` (13/13). Risco real de bug: um leitor confia em uma, outro na outra, e elas podem divergir sem que nada acuse. |
| `research_people` | `papel_na_linhagem` (`ascendente_austriaco`, `ascendente_perseguido`, `ascendente_perseguida`, `elo_da_cadeia`) · `geracao` · `linha_transmissao` · `pais_localidade` | `person_status` (`subject`, `ancestor`, `descendant`, `family_member`) · `living_status` · `identity_status` · `sensitivity_level` | **Dois eixos de papel da pessoa na mesma tabela, um em cada língua, ambos preenchidos** (`person_status`: 13/13; `papel_na_linhagem`: 6/13). Colunas pt-BR foram evidentemente acrescentadas depois a uma tabela inglesa, em vez de padronizar. |
| `research_evidence_items` | `origem_externa`, `fornecida_pelo_cliente` | `evidence_status`, `confidence_level`, `sensitivity_level`, `workflow_status`, `access_level`, `epistemic_validation_status`, `legal_review_status` | Mesmo padrão: colunas pt-BR enxertadas numa tabela inglesa. Note ainda `evidence_status` **e** `workflow_status` **e** `epistemic_validation_status` — três eixos de estado na mesma tabela. |
| `genealogical_person_profiles` | `nome_completo`, `nome_nascimento`, `sexo`, `nascimento_data`, `nascimento_localidade`, `morte_data`, `causa_morte`, `sepultamento_localidade`, `status_verificacao`, `nascimento_precisao` | `case_id`, `evidence_id`, `source_id`, `archive_reason`, `client_visibility`, `verified_at`, `responsible_user_id` | Tabela de nome inglês com corpo em português. |
| `genealogical_events` | `data_precisao`, `client_visibility`(valores pt) | `event_type`, `approximate_date`, `validation_status`, `impact_type` | **`data_precisao` (pt) e `approximate_date` (en) coexistem para o mesmo problema de precisão de data.** |
| `case_members` | `nome`, `parentesco`, `observacoes_protegidas`, `requerente`, `pai_id`, `mae_id`, `papel_no_caso`, `archive_motivo`, `status_cadastral`, `profissao`, `estado_civil`, `fonte_origem_dado` | `case_id`, `organization_id`, `created_by`, `archived_at`, `client_id`, `represented_by`… | Mistura de nome de coluna. **Além disso** carrega `papel_no_caso` **e** três booleanos redundantes `contratante`/`titular`/`dependente` — três representações do mesmo papel na mesma tabela. |
| `documents` | `documents_status_chk`, `categoria`, `origem`, `sensibilidade`, `visibilidade` — todos pt | valor `interno`/`cliente` ok, mas `documents_visibilidade_chk` contém `equipe_do_caso`, `interno_restrito`, `cliente_quando_liberado` (pt) | Esta é **boa** — fica aqui só como contraste: é o padrão que a Proprietária pediu. |
| `third_party_expenses` | `tpe_estado_chk`, `tpe_pagador_chk` | mesmos constraints contêm valores en | CHECK com valores das duas línguas na **mesma lista**. SUSPEITA de que a lista foi ampliada sem limpar a antiga. |
| `contract_source_links` | `access_level` com `finance_restricted`, `internal_restricted` (en) e termos pt no mesmo CHECK | `source_type` = `case`, `client`, `dossie`, `checklist`, `proposal`, `prior_contract`, `external_authorization`, `other` | **`dossie` (pt) convive com `checklist`/`proposal` (en) na mesma lista de valores permitidos.** |

### 2.4 Custo e risco de traduzir — leitura honesta

O `AGENTS.md` proíbe inventar vocabulário CHECK novo, e com razão. **Esta auditoria não propõe traduzir nada.** O que ela mede é o preço, para que a decisão seja dela e informada:

Para cada coluna traduzida é preciso, na mesma entrega atômica: (1) migration que amplia o CHECK para aceitar os dois vocabulários; (2) `UPDATE` dos dados existentes; (3) reescrita de **todo** leitor e escritor — para `contracts.status` isso são ao menos 12 arquivos incluindo uma máquina de estados (`src/lib/comercial-fluxo.ts:18-19`) e um escritor de servidor (`src/lib/golive-escritores.functions.ts:599,642`); (4) reescrita dos dicionários de rótulo, que hoje mapeiam de inglês para pt-BR e passariam a mapear pt-BR para pt-BR (ou seriam descartados); (5) reescrita das pontes de tradução (`src/lib/pesquisa-cadeia.ts`, `src/lib/fontes-pesquisa-canonicas.ts`); (6) atualização dos testes que fixam os valores (`src/lib/__tests__/pesquisa-vocabulario-banco.test.ts` fixa as listas inglesas explicitamente; `src/lib/__tests__/p0-1-contrato-parte-contratante-role.test.ts:28` existe **só** para garantir que o código escreve `"contracting_client"`); (7) migration final que estreita o CHECK. **Nada disso pode ser feito sem autorização explícita dela**, e a ordem importa: inverter (3) e (7) derruba a operação.

O risco maior não é o trabalho, é o **meio-caminho**. Hoje já existem três provas de meio-caminho anterior: `genealogical_relationships` com duas colunas de status, `research_people` com dois eixos de papel, e `third_party_expenses` com os dois vocabulários no mesmo CHECK. Cada uma delas é uma tradução começada e não terminada.

---

## 3. Frente 2 — texto visível ao usuário

### 3.1 Resultado geral

Varredura de 14.765 literais de string em `src/routes/**` e `src/components/**`. Depois de descartar classes CSS, `data-*`, nomes de ícone e imports, **os textos de interface escritos à mão estão em pt-BR**. Amostras verificadas integralmente e **limpas**: todos os `label=`/`placeholder=`/`aria-label=` (≈200 ocorrências), todos os `toast.success`/`toast.error` (≈40), todos os `throw new Error` de mensagem ao usuário, todos os textos de estado vazio (`PortalVazio`, `VazioDesk`, `KitEmptyState`, `vazio=`).

Ou seja: **a reclamação, na forma em que foi colocada ("o sistema está misturado"), não se confirma para o texto autoral.** O que existe é inglês em dois lugares precisos.

### 3.2 Inglês visível hoje — CONFIRMADO

| # | Arquivo:linha | Texto em inglês | Em qual tela aparece | Gravidade |
|---|---|---|---|---|
| G1 | `src/routes/_authenticated/contratos.$id.tsx:859` | valor cru de `contract_scope_items.status`: `included`, `excluded`, `conditional`, `pending`, `not_applicable` | **Desk → Contratos → instrumento → aba Escopo**, coluna "Status" da tabela `["Item","Categoria","Status","Origem","Ações"]` (linha 854). A coluna "Categoria" ao lado **é** traduzida (`ROTULO_CATEGORIA_ESCOPO[s.category] ?? s.category`, linha 858) — a inconsistência é visível na mesma linha da tabela. | **GRAVE** |
| G2 | `src/routes/_authenticated/contratos.$id.tsx:860` | valor cru de `contract_scope_items.source_type`: `annex`, `case`, `manual_review`, `proposal`, `template` | mesma tabela, coluna "Origem" | **GRAVE** |
| G3 | `src/routes/_authenticated/contratos.$id.tsx:1212` | valor cru de `contract_validation_results.severity`: `blocking`, `high`, `medium`, `low` | **Desk → Contratos → instrumento → Validações registradas**, coluna "Severidade" da tabela `["Validação","Severidade","Situação"]` (linha 1207). Agrava: o dicionário `ROTULO_SEVERIDADE` **existe** em `src/components/contratos/prancha-juridico-contrato.tsx:54-59` com cobertura completa dos 4 valores, e é usado lá (linhas 214, 325) — mas não aqui. | **GRAVE** |
| G4 | `src/routes/_authenticated/contratos.$id.tsx:1214` | valor cru de `contract_validation_results.status`: `open`, `passed`, `resolved`, `waived`, dentro de `<Selo texto={v.status}>` | mesma tabela, coluna "Situação". O `tom` já é decidido por `v.status === "open"`, isto é, o código entende o valor — só não o traduz. | **GRAVE** |
| G5 | `src/routes/_authenticated/contratos.$id.tsx:1530` | valores crus de `contract_exceptions.scope`: `activation_gate`, `financial_gate`, `validation_waiver`, `other` | **Desk → Contratos → instrumento → Exceções formais**. Não existe dicionário para este CHECK em lugar nenhum do repositório. | **GRAVE** |
| G6 | `src/components/ui/dialog.tsx:49` | `<span className="sr-only">Close</span>` | Botão de fechar de todo modal. Consumidores reais: `src/routes/_authenticated/nucleos-duplicidades.tsx:16`, `src/components/clube-ancestral-kit/base.tsx:13`, `src/components/ui/command.tsx:9`. É lido por leitor de tela, não pelos olhos. | MÉDIA |
| G7 | `src/components/ui/sheet.tsx:66` | `<span className="sr-only">Close</span>` | Painel lateral. Consumidor real: `src/routes/_authenticated/leads.tsx:13` (gaveta de lead). | MÉDIA |
| G8 | `src/components/ui/form.tsx:46,50` · `sidebar.tsx:43` · `carousel.tsx:35` | `"useFormField should be used within <FormField>"`, `"useSidebar must be used within a SidebarProvider."`, `"useCarousel must be used within a <Carousel />"` | Nunca. São erros de contrato de desenvolvedor, disparados só em uso incorreto do componente. | **NÃO É DEFEITO** |
| G9 | `src/components/ui/sidebar.tsx:280,294` · `pagination.tsx:54,67,85` · `carousel.tsx:198,226` · `breadcrumb.tsx:88` | `"Toggle Sidebar"`, `"Go to previous page"`, `"Go to next page"`, `"More pages"`, `"Previous slide"`, `"Next slide"` | **Nenhuma.** Grep de importadores retorna **0** para `components/ui/sidebar`, `components/ui/pagination`, `components/ui/carousel` e `components/ui/breadcrumb`. Órfãos do scaffold shadcn. | **NÃO É DEFEITO** (mas é código morto) |

### 3.3 Valor cru do banco exibido ao usuário — pt-BR, porém sem rótulo

Não é inglês, mas é o mesmo defeito de apresentação e merece a mesma correção:

| Arquivo:linha | Valor cru | Tela | Vocabulário |
|---|---|---|---|
| `src/routes/portal/proposta.tsx:87` | `invoices.status`: `rascunho`, `emitida`, `paga`, `parcialmente_paga`, `pendente`, `vencida`, `cancelada` | **App Cliente → Proposta/condições**, linha da fatura. O cliente final lê `parcialmente_paga` em caixa baixa com sublinhado, não "Parcialmente paga". | pt-BR |
| `src/routes/_authenticated/alertas.tsx:241` | `status` do alerta, sem dicionário (ao lado de `a.criticidade`, que **tem** `TOM_CRITICIDADE`) | Desk → Alertas | pt-BR |
| `src/routes/_authenticated/biblioteca.tsx:592` | `i.status` dentro de `<Etiqueta>` | Desk → Biblioteca Mestre | pt-BR |
| `src/routes/_authenticated/biblioteca-mensagens.tsx:573` | `v.status` da versão do modelo | Desk → Biblioteca de mensagens | pt-BR |
| `src/routes/_authenticated/contrato-parametros.index.tsx:105` | `status {c.status}` | Desk → Parâmetros de contrato | misto |

### 3.4 Dicionários com fallback que vaza valor cru — SUSPEITA de vazamento futuro

15 posições usam `DICIONARIO[valor] ?? valor`. Quando a cobertura do dicionário é completa, o fallback nunca dispara e está correto. Verifiquei três contra o CHECK real e **os três têm cobertura completa** — não vazam hoje:

- `ROTULO_STATUS_VERSAO` (`rotulos.tsx:57-66`): 8/8 valores de `contract_versions_status_check`. ✅
- `ROTULO_CATEGORIA_ESCOPO` (`rotulos.tsx:79-88`): 8/8 de `contract_scope_items_category_check`. ✅
- `ROTULO_SEVERIDADE` (`prancha-juridico-contrato.tsx:54-59`): 4/4 de `contract_validation_results_severity_check`. ✅

O risco é de regressão: **qualquer migration futura que acrescente um valor ao CHECK sem acrescentar ao dicionário passa a imprimir inglês na tela**, sem teste que acuse. Posições a vigiar: `fila-publicacao-real.tsx:21`, `conteudo-editorial-conectado.tsx:20`, `microentregas.tsx:54`, `linha-parametro.tsx:91,95`, `atendimento-interno.tsx:698,699,705`, `integracoes/centro.tsx:42`, `governanca/manifesto.tsx:43`, `grupo-comunicacao-caso.tsx:118`, `status-envio-recuperacao.tsx:224`, `biblioteca-mensagens.tsx:640`, `contratos.$id.tsx:858,1292`.

---

## 4. Frente 3 — duplicação causada por idioma

### 4.1 A tese da Proprietária está CONFIRMADA

Existe no repositório um arquivo cuja razão de existir é traduzir domínio inglês para domínio português e **copiar o registro de uma tabela para outra**: `src/lib/fontes-pesquisa-canonicas.ts`.

```
src/lib/fontes-pesquisa-canonicas.ts:190-196   TIPO_RELACAO: parent→pai_mae, child→filho, spouse→conjuge,
                                               sibling→irmao, guardian→tutor_representante
src/lib/fontes-pesquisa-canonicas.ts:203-209   STATUS_PESQUISA_RELACAO: asserted→hipotese, under_review→pendente,
                                               supported→provavel, validated→provavel,
                                               conflicting→a_confirmar, rejected→refutado
src/lib/fontes-pesquisa-canonicas.ts:225-239   relacaoDePesquisaParaGenealogica(): monta o payload da tabela pt
                                               a partir da linha da tabela en
src/lib/fontes-pesquisa-canonicas.ts:241-250   TIPO_EVENTO: birth→nascimento, baptism→batismo, …
src/lib/fontes-pesquisa-canonicas.ts:252-258   PRECISAO: exact→exata, month_year→aproximada, …
src/lib/pontes-pesquisa.functions.ts:76        consumidor: plano.push({ …, acao: "copiar", payload: relacaoDePesquisaParaGenealogica(r, caseId) })
```

**É perda de dado, e o próprio código registra isso.** `TIPO_RELACAO` cobre 5 dos 11 valores de `research_relationships_relationship_type_check`. Os outros 6 — `grandparent`, `grandchild`, `adopter`, `adopted_child`, `other`, `unknown` — caem no fallback `?? "a_confirmar"` (linha 226) e o tipo original é **despejado em texto livre** (`internal_notes`), com o comentário literal `Tipo original: ${r.relationship_type}.` (linha 228). Um avô atravessa a ponte e chega do outro lado como "a confirmar", com a informação real sobrando numa nota interna. Isso é consequência direta de ter duas línguas para o mesmo conceito. **CONFIRMADO.**

O mesmo padrão em `STATUS_PESQUISA_RELACAO`: `supported` e `validated` colapsam os dois em `provavel` (linhas 206-207), e `VALIDACAO_EVENTO` (linhas 264-271) colapsa `supported`/`validated`/`conflicting` em `em_revisao`. Os comentários do arquivo explicam que é conservadorismo deliberado ("o banco recusaria, e com razão") — o que é correto como mitigação, mas confirma que o par de vocabulários não é traduzível um no outro sem perda.

### 4.2 Pares de tabelas duplicados por idioma — CONFIRMADO

Contagens de `pg_stat_user_tables`; leitores/escritores por grep (excluindo `__tests__`).

| # | Camada **português** | Linhas | Camada **inglês** | Linhas | Veredito |
|---|---|---|---|---|---|
| D1 | `genealogical_person_profiles` | **11** | `research_people` | **13** | **Ambas vivas.** 12 arquivos tocam a pt (`pessoas-linhagens.functions.ts`, `pessoa.functions.ts`, `arvore-publicacao.functions.ts`, `golive.functions.ts`, `motor-caso.ts`, rota `pessoas-linhagens.$caseId.tsx`…); 19 arquivos tocam a en (`pesquisa-modulo.functions.ts`, `pesquisa-modulo.server.ts`, `dossie-58c.functions.ts`, `motor-cidadania.ts`…). Existe um "fio" de ligação (`pessoa-unificada-fio.functions.ts`, `research_people.genealogical_person_profile_id`) — isto é, **uma terceira peça de código criada para conciliar as duas**, em vez de unificá-las. |
| D2 | `genealogical_relationships` | **13** | `research_relationships` | **13** | **Ambas vivas, com os mesmos 13 vínculos e distribuição divergente.** pt: `pai_mae`=10, `conjuge`=3. en: `parent`=10, `spouse`=1, `sibling`=1, `grandparent`=1. **As duas já divergiram**: a camada pt perdeu o irmão e o avô (viraram `conjuge`/`pai_mae` ou foram agregados), exatamente o efeito previsto pelo fallback de 4.1. Além disso a tabela pt tem `status` **e** `status_pesquisa` (2.3). 12 arquivos leem a pt, 8 a en. |
| D3 | `genealogical_events` | **7** | `research_case_events` | **2** | Ambas vivas, 7 e 2 arquivos. Vocabulários de tipo de evento diferentes (`nascimento` vs `birth`) e dois eixos de precisão de data (`data_precisao` vs `event_date_precision`/`approximate_date`). |
| D4 | `research_hypotheses` (**colunas e CHECK em pt**: `titulo`, `descricao`, `grau_confianca`, `justificativa`, `pesquisador_id`, `archive_motivo`) | **5** | `research_case_hypotheses` (**colunas e CHECK en**: `title`, `statement`, `confidence_level`, `closure_reason`, `archive_reason`) | **1** | **Ambas vivas.** pt: 5 arquivos (`pesquisa.functions.ts`, `ficha-unica-caso.ts`, `golive.functions.ts`, `ficha-piloto-genealogica.functions.ts`). en: 5 arquivos (`pesquisa-modulo.functions.ts`, `pesquisa-modulo.server.ts`, `routes/api/pesquisa-assistente.ts`). **O prefixo `research_` nas duas mostra que foram criadas pela mesma iniciativa, em momentos diferentes, com vocabulário diferente** — exatamente o padrão que a Proprietária descreveu. |
| D5 | `evidencias` (pt: `titulo`, `tipo`, `visibilidade`, `grau_confianca`, `justificativa`, `archive_motivo`) | **6** | `evidences` (en) **+** `research_evidence_items` (en, com `origem_externa`/`fornecida_pelo_cliente` enxertados) | **0** e **5** | **Três tabelas para evidência.** `evidences` tem **0 linhas** mas **6 arquivos a referenciam** (`fontes-documentos.ts`, `kit-superficies.functions.ts`, `motores-tabelas.ts`, `pesquisa-cadeia.functions.ts`, `fontes-documentos-integracao.functions.ts`, `fontes-pesquisa-canonicas.ts`) — **SUSPEITA: `evidences` é o esqueleto abandonado de uma tentativa de padronizar em inglês**, cujo lugar foi tomado por `research_evidence_items`. `evidencias` (pt) e `research_evidence_items` (en) seguem as duas vivas, com 16 e 18 arquivos. |
| D6 | `name_variants` (pt: `variante`, `tipo`, `periodo`, `localidade`, `estado_validacao`, `nivel_confianca`, `observacao_interna`) | **0** | `research_name_variants` (en: `variant_name`, `variant_type`, `status`, `notes`) | **12** | **O achado mais eloquente da auditoria.** A tabela portuguesa está **vazia** e tem **CRUD completo em tela**: aba "Variantes de nome" em `src/routes/_authenticated/pessoas-linhagens.$caseId.tsx:167`, campos nas linhas 1189-1213 (`label="Pessoa"`, `"Variante"`, `"Tipo"`, `"Localidade"`, `"Fonte"`), escrita em `pessoas-linhagens.functions.ts:382` (`.from("name_variants")`) via `onSalvar={(id, valores) => salvar.mutate({ tabela: "name_variants", … })}` (linha 678). Os 12 registros reais estão na tabela **inglesa**, escrita por outra tela (`pesquisa-modulo.index.tsx` → `pesquisa-modulo.functions.ts`/`.server.ts`). **Há uma tela em pt-BR que a Proprietária pode abrir e usar, e que não enxerga nenhum dos dados que existem.** |
| D7 | — | — | `app_projections.approval_status` (en) **vs** dados gravados em pt | 25 | `src/components/biblioteca/fila-publicacao-real.tsx:12-17` carrega o comentário **`/** Estados equivalentes das entregas ao cliente (português ou inglês) por etapa da fila. */`** e o mapa `draft: ["draft","rascunho"]`, `in_review: ["in_review","em_revisao","revisao"]`, `approved: ["approved","aprovado","aprovada"]`, `published: ["published","publicado","publicada"]`. **Código defensivo bilíngue escrito porque o mesmo estado chega nas duas línguas.** É a confirmação mais direta possível, em comentário de código, do problema que a Proprietária relatou. |

**Duas superfícies paralelas de Pesquisa.** O corolário de D1-D6: a rota `pessoas-linhagens.$caseId.tsx` se descreve como "Origem canônica de pessoas, relações, variantes de nome, eventos e linhagens do caso" (linha 74) e opera sobre as tabelas **portuguesas**; a rota `pesquisa-modulo.index.tsx` (via `components/pesquisa/modulo.tsx`) opera sobre as **inglesas**. **Duas telas, cada uma se dizendo canônica, cada uma cega para os dados da outra.** CONFIRMADO por grep de `.from(...)` em ambos os caminhos.

### 4.3 Dicionários de rótulo duplicados e divergentes — CONFIRMADO

| Valor do banco | Tradução A | Tradução B | Problema |
|---|---|---|---|
| `family_member` | **"Familiar"** — `src/components/pesquisa/fio-pessoa-unificada.tsx:65` | **"Membro da família"** — `src/components/pesquisa/modulo-campos.ts:89` e **novamente** `:516` | Mesmo valor, **dois rótulos diferentes em duas telas**, e o segundo arquivo o define duas vezes. |
| `ancestor` | "Ascendente" — `fio-pessoa-unificada.tsx:67` | "Ascendente" — `modulo-campos.ts:90`, `:517` | Iguais, mas triplicados. |
| `draft` | "Rascunho" — `rotulos.tsx:8`, `comercial/base.tsx:22`, `rotulos-golive.ts:42`, `portal-visao-interna-v4.tsx:65`, `modulo-campos.ts:381,480,503,550`, `biblioteca-evidencias.ts:71` | **"Em preparação"** — `src/lib/golive-escritores.functions.ts:1404` · **"Não solicitado / a preparar"** — `src/lib/ficha-piloto-genealogica.ts:77` | **Três traduções diferentes do mesmo valor**, em 11 definições espalhadas. Nenhum módulo único de vocabulário. |
| `draft` | — | **`draft: "draft"`** — `src/components/desk/kit-conectado.tsx:201` | Mapa identidade; por sorte alimenta um tipo interno de tom, não um rótulo de tela. SUSPEITA de vazamento se for reusado como rótulo. |
| `ready_for_review` | "Pronto para revisão" — `rotulos.tsx:10` e `:105` | **"Pronta para revisão"** — `rotulos.tsx:60` | Divergência de gênero **dentro do mesmo arquivo**, porque o mesmo valor serve contrato (m.) e versão/anexo (f.). Sintoma de vocabulário compartilhado entre entidades de gênero diferente. |

### 4.4 Inventário completo de máscara e formatação de dado civil

Base para a unificação progressiva pedida pela Proprietária.

#### Módulo canônico: `src/lib/validacao-pessoa.ts`

| Função | Linha | Comportamento | Usos fora do arquivo |
|---|---|---|---|
| `formatarCpf` | 22 | Máscara de **entrada** progressiva: `123`, `123.456`, `123.456.789`, `123.456.789-01` | **15** |
| `mascararCpf` | 37 | Máscara de **privacidade**: `•••.•••.123-45` (decisão da Proprietária, 22/10/2026). CPF incompleto → `•••.•••.•••-••`, nunca um parcial que pareça completo | **2** (`cpf-mascarado.tsx:3`, `composicao-pessoa360-v4.tsx:15`) |
| `cpfValido` | 44 | Dígito verificador da Receita + rejeita sequência repetida | — |
| `formatarCep` | 66 | Entrada | **8** |
| `cepValido` | 72 | — | — |
| `formatarTelefone` | 141 | Entrada, com parâmetro `pais` | **25** |
| `telefoneValido` | 155 | — | — |
| `rgOrgaoUfValido` | 191 | Valida RG + órgão/UF. **Não há `formatarRg` nem `mascararRg`** | — |
| `emailValido` | 172 | — | — |
| `contemCpf` | 223 | Detector de CPF em texto livre | — |
| `formatarDataBr` | 254 | Entrada `DD/MM/AAAA` a partir de dígitos | **0 fora do próprio arquivo** |
| `dataValida` | 278 | Aceita `DD/MM/AAAA` e ISO; `ANO_MINIMO_GENEALOGICO` = 1500 para ancestral | — |

#### Máscaras de CPF concorrentes — 4 implementações, 4 máscaras diferentes

| # | Arquivo:linha | Máscara produzida | Dígitos revelados | Fallback | Status de uso |
|---|---|---|---|---|---|
| M1 | `src/lib/validacao-pessoa.ts:37` | `•••.•••.123-45` | **5 últimos** | `•••.•••.•••-••` | **CANÔNICA** (decisão de 22/10/2026). 2 consumidores. |
| M2 | `src/lib/ficha-civil-pessoa360.ts:23` (não exportada) | `•••.•••.•••-45` | **2 últimos** | `"pendente de validação"` | **EM USO** — `ficha-civil-pessoa360.ts:38`, campo "CPF" da ficha civil do Caso 360. **Diverge da decisão da Proprietária: esconde 3 dígitos que ela mandou mostrar.** |
| M3 | `src/lib/crm-fluxo.ts:187` `mascararDocumento` | `•••45` | **2 últimos** | `"—"` | **EM USO** (exportada). Formato sem pontuação de CPF; serve documento genérico. |
| M4 | `src/lib/fontes-documentos.ts:205` `mascararCpf` | `***.123.***-**` | **3 do meio** | `""` (string vazia) | **ÓRFÃ — CÓDIGO MORTO. CONFIRMADO.** Grep de importadores de `@/lib/fontes-documentos` retorna 4 ocorrências, e nenhuma importa `mascararCpf` (importam `INTEGRIDADE`, `LEGIBILIDADE`, `TIPOS_DOCUMENTO`). Usa `*` em vez de `•`, revela os dígitos do **meio** — padrão incompatível com os outros três. |

Há ainda uma máscara de CPF **em texto livre** em `src/lib/crm-fluxo.ts:184`: `texto.replace(CPF, m => '***.***.' + últimos2)` — quinto formato, para sanitização de transcrição.

**Componente de apresentação:** `src/components/campos/cpf-mascarado.tsx` — `CpfMascarado`, mascarado por padrão com botão "revelar"/"ocultar", `aria-pressed`, `data-cpf-mascarado`. É a peça bem resolvida: documenta a decisão, documenta o fora-de-escopo (telas de reconciliação de CPF comparam dois documentos e mascarar inutilizaria a ferramenta). **Deveria ser o único caminho de exibição de CPF em leitura** — hoje não é: `composicao-pessoa360-v4.tsx:272` chama `mascararCpf` direto, sem o botão revelar, e a ficha civil usa M2.

#### Máscaras de log / payload (propósito diferente — não unificar com as de tela)

| Arquivo:linha | Função | Propósito |
|---|---|---|
| `src/lib/persistencia-mascara.ts:28` | `mascararValor` | Esconder valor em log de persistência |
| `src/lib/persistencia-mascara.ts:36` | `mascararParaLog` | Idem, por campo |
| `src/lib/integracoes.server.ts:124` | `mascararTexto` | Payload de integração |
| `src/lib/integracoes.server.ts:140` | `mascararPayload` | Idem, recursivo por chave |

#### Formatação de data — 1 canônica sem uso + 5 cópias locais

| # | Arquivo:linha | Implementação | Saída |
|---|---|---|---|
| F0 | `src/lib/validacao-pessoa.ts:254` `formatarDataBr` | string, a partir de dígitos | `DD/MM/AAAA` — **0 consumidores fora do arquivo** |
| F1 | `src/lib/ficha-civil-pessoa360.ts:28` `dataPtBr` | `split("-")` sobre ISO | `DD/MM/AAAA` |
| F2 | `src/lib/proposta-saneamento.ts:135` `formatarData` | `new Date(iso).toLocaleDateString("pt-BR",{timeZone:"UTC"})` | `DD/MM/AAAA` |
| F3 | `src/components/caso/cadencia-d0-d30.tsx:120` `formatarDia` | `new Date(iso.slice(0,10)+"T12:00:00Z")`, `{day:"2-digit",month:"short",timeZone:"UTC"}` | `05 out` |
| F4 | `src/components/caso/cadencia-d31-d365.tsx:129` `formatarDia` | **idêntica a F3** | `05 out` |
| F5 | `src/components/caso/cadencia-onboarding.tsx:152` `formatarDia` | **idêntica a F3** | `05 out` |
| F6 | `src/components/crm/varredura-whatsapp.tsx:296` `formatarDia` | **`new Date(iso)` — sem o `T12:00:00Z`** | `05 out`, **com erro de um dia** |

**Defeito concreto, não só duplicação: F6 difere de F3/F4/F5 em um detalhe que é exatamente o motivo de as outras três forçarem meio-dia UTC.** Para uma data ISO sem hora, `new Date("2026-10-05")` é meia-noite UTC; renderizada em fuso brasileiro (UTC-3) volta para 04/10. **A tela de varredura de WhatsApp mostra o dia anterior; as três telas de cadência mostram o dia certo.** Copiar a função quatro vezes fez com que a correção aplicada em três não chegasse à quarta. **CONFIRMADO** por leitura das quatro implementações.

Há ainda `formatarDia` em `src/components/crm/varredura-whatsapp.tsx` e dezenas de `new Date(...).toLocaleDateString("pt-BR")` inline espalhados (ex.: `contratos.$id.tsx:1531`, `portal/proposta.tsx:88`) — nenhum usando um formatador central.

#### Telefone e CEP

`formatarTelefone` (25 usos) e `formatarCep` (8 usos) **não têm duplicata** e **não têm máscara de privacidade** correspondente — não existe `mascararTelefone` nem `mascararCep`. Se a unificação progressiva de dados civis vale para telefone (ele aparece em `case_members.telefone`, `case_members.telefone_whatsapp`, `contract_parties.phone`), **essa peça ainda não existe e precisa ser criada, não unificada.** Idem RG: existe `rgOrgaoUfValido`, não existe formatador nem máscara.

---

## 5. Recomendação de sequência

### Faixa 1 — sem migration, sem decisão de vocabulário, sem risco de dado (fazer primeiro)

Nada aqui toca schema, CHECK, RLS ou dado. São correções de apresentação e de código morto.

1. **Traduzir as 5 posições que vazam inglês na tela** (G1-G5, todas em `src/routes/_authenticated/contratos.$id.tsx`). G1, G2, G3, G4 já têm dicionário pronto no repositório — basta aplicar (`ROTULO_SEVERIDADE` precisa ser exportado de `prancha-juridico-contrato.tsx` ou movido para `rotulos.tsx`). G5 (`contract_exceptions.scope`) precisa de um dicionário novo de 4 entradas. **É a correção de maior retorno da auditoria.**
2. **Traduzir "Close"** em `src/components/ui/dialog.tsx:49` e `sheet.tsx:66` → `"Fechar"` (G6, G7). Duas linhas, 3 telas atingidas.
3. **Dar rótulo aos 5 valores crus pt-BR** da seção 3.3, começando por `src/routes/portal/proposta.tsx:87` — é a única das cinco que o **cliente final** lê.
4. **Corrigir o bug de data** em `src/components/crm/varredura-whatsapp.tsx:296` (F6) e, no mesmo passo, **promover uma única `formatarDia` para `src/lib/validacao-pessoa.ts`** (ou módulo de formatação) e remover F3, F4, F5, F2, F1. Assim a próxima correção chega a todas as telas.
5. **Unificar as máscaras de CPF na canônica M1.** Trocar M2 (`ficha-civil-pessoa360.ts:23`) por `mascararCpf` de `validacao-pessoa.ts` — hoje a ficha civil do Caso 360 **contraria a decisão de 22/10/2026**, mostrando 2 dígitos onde ela pediu 5. Avaliar com ela se M3 (`mascararDocumento`, `•••45`) deve convergir ou se documento genérico merece formato próprio.
6. **Remover o código morto**: `mascararCpf` em `src/lib/fontes-documentos.ts:205` (M4, órfã confirmada) e os 4 componentes shadcn sem importador (`sidebar`, `pagination`, `carousel`, `breadcrumb`), que são a maior parte do inglês restante no repositório.
7. **Consolidar os dicionários de rótulo divergentes** (4.3): um único rótulo para `family_member`, um único para `draft`, resolver o gênero de `ready_for_review`. Reduzir as 11 definições de `draft` a uma.
8. **Travar a regressão com teste**: para cada CHECK de vocabulário inglês que tem dicionário, um teste que afirma `Object.keys(DICIONARIO)` ⊇ lista do CHECK. Hoje `src/lib/__tests__/pesquisa-vocabulario-banco.test.ts` já fixa listas do banco — o padrão existe e pode ser estendido. **Sem isso, a Faixa 1 regride na próxima migration.**

### Faixa 2 — exige decisão dela, não exige migration

9. **Decidir qual camada é canônica em cada par de D1-D6**, antes de qualquer tradução de valor. Não é uma decisão de idioma, é de produto: `genealogical_*`/`evidencias`/`name_variants` (pt) ou `research_*` (en)? A resposta determina tudo que vem depois. Sugiro começar por **D6 (`name_variants` vs `research_name_variants`)**, que é o caso mais simples e mais chocante: uma tela em pt-BR, operável, cega para os 12 registros reais. Enquanto a decisão não vier, **essa tela deveria ser desabilitada ou sinalizada**, porque hoje ela convida a gravar num lugar que ninguém lê.
10. **Decidir sobre `evidences` (0 linhas, 6 referências de código)** — se é esqueleto abandonado, arquivar a referência; se é destino planejado, declarar. Lembrando o `AGENTS.md`: nada arquiva sem `COMPROVADO_EM_USO` com prints autenticados dela. Build e teste não são prova.
11. **Decidir sobre a ponte `fontes-pesquisa-canonicas.ts`.** Enquanto houver duas camadas, a ponte é necessária; mas ela **perde informação hoje** (6 de 11 tipos de relação viram `a_confirmar`). Mínimo imediato, sem decidir a canônica: ampliar `TIPO_RELACAO` para cobrir `grandparent`, `grandchild`, `adopter`, `adopted_child` — se o CHECK de `genealogical_relationships.relation_type` já aceitar os equivalentes pt-BR. **Verificar o CHECK antes**, porque o `AGENTS.md` proíbe vocabulário novo.
12. **Resolver as duas colunas de status de `genealogical_relationships`** (`status` en + `status_pesquisa` pt, ambas 13/13 preenchidas). Hoje nada garante que não divirjam. Decidir qual é fonte e fazer a outra derivada ou somente-leitura — isto é saneamento de risco de bug, independente de tradução.

### Faixa 3 — exige migration e autorização explícita dela (não fazer sem isso)

13. Tradução de vocabulário CHECK. **Somente depois de 9.** Ordem por risco crescente, uma coluna por entrega atômica, cada entrega com os 7 passos da seção 2.4 completos (nunca estreitar o CHECK antes de reescrever todos os escritores):
    - **Mais seguras** (poucas linhas, dicionário já completo, poucos leitores): `drive_provisioning_queue.status`, `contract_versions.status`, `contract_annexes.status`/`annex_type`, `contract_validation_results.severity`/`status`, `contract_exceptions.scope`, `contract_scope_items.*`.
    - **Médias**: `research_name_variants.*`, `research_case_events.event_type`, `research_pending_items.*`, `service_orders.start_condition_status`.
    - **Mais arriscadas** (gates, máquinas de estado, pontes, testes que fixam o valor): `contracts.status`, `contracts.financial_gate_status`, `contracts.research_gate_status`, `contract_parties.role`, `service_orders.status`, `research_cases.status`, `app_projections.approval_status`, e o vocabulário epistêmico `asserted`/`supported`/`validated`/`conflicting`/`rejected` que atravessa 4 tabelas.
14. **Não traduzir** nomes de coluna de infraestrutura (`id`, `organization_id`, `created_at`, `updated_at`, `created_by`, `archived_at`, `case_id`, `client_id` — 1.500 das 4.507 colunas). Custo alto, ganho zero, e o usuário nunca as lê.
15. **Não renomear tabelas** como passo de idioma. Renomear `research_people` para `pessoas_pesquisa` não resolve nada se as duas camadas continuarem vivas — e se uma for eliminada em 9, o rename vira irrelevante. Nome de tabela é o último item da fila, não o primeiro.

---

## 6. Cobertura desta auditoria

**Coberto integralmente:** os 384 CHECK constraints do schema `public` (classificados um a um); contagem de linha e distribuição real de valor das 34 tabelas dos pares duplicados e dos vocabulários críticos; inventário completo de coluna das 17 tabelas de D1-D6; todos os `label=`/`placeholder=`/`aria-label=`/`title=` de `src/routes/**` e `src/components/**`; todos os `toast.*` e `throw new Error` de `src/`; inventário completo de função de máscara e formatação de dado civil (CPF, RG, telefone, CEP, data) com prova de uso ou de orfandade por grep; leitores e escritores por tabela nos 13 pares duplicados.

**Coberto por amostragem, não exaustivamente:**
- **Cobertura dicionário × CHECK:** verifiquei 3 dos ~15 dicionários com fallback `?? valor` contra o CHECK real (os 3 estavam completos). Os outros 12, listados em 3.4, **não foram conferidos um a um** — pode haver mais vazamento de inglês além de G1-G5. Verificação completa é mecanizável e deveria virar o teste do item 8.
- **Mistura de nome de coluna:** examinei em detalhe as 17 tabelas de D1-D6 e as citadas em 2.3. As outras ~177 tabelas foram cobertas só pela contagem agregada (1.500/4.507 colunas de convenção técnica). Pode haver mais enxerto de coluna pt-BR em tabela inglesa.
- **Texto visível:** a varredura de 14.765 literais filtrou por marcadores de função inglesa. Uma string inglesa curta sem essas palavras (ex.: `"Save"` isolado) escaparia. As verificações dirigidas (`label=`, `toast`, `aria-label`, estados vazios, componentes `ui/`) foram exaustivas e limpas, o que torna isso pouco provável, mas não impossível.

**Não coberto:**
- `supabase/migrations/**` e `drizzle/**` — o histórico de quando e por que cada vocabulário inglês entrou. Isso diria *quem* decidiu e em que ordem, o que ajudaria a decisão do item 9, mas não muda nenhum achado desta auditoria.
- Funções e triggers no banco (`pg_proc`), que podem conter vocabulário e mensagem em qualquer das duas línguas.
- RPCs, políticas RLS e Edge Functions.
- `src/routes/api/**` além de `pesquisa-assistente.ts`.
- Documentos de `docs/`, `00_governanca/`, `archive/` e `migracao-supabase/`.
- Conteúdo de linha das tabelas (texto gravado pela equipe), exceto as colunas de vocabulário controlado.
