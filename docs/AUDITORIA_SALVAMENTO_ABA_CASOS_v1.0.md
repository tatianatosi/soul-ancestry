# Auditoria do Fluxo de Salvamento — Aba Casos (Desk Intelligence)

**Versão:** 1.0 · **Data:** 20/08/2026 · **Modo:** somente leitura
**Não executado:** nenhuma alteração de código, banco, dados ou interface.

## 0. Achado estrutural

A "aba Casos" existe hoje em **duas camadas não sincronizadas**:

- **Camada real (persistida)** — rotas `/casos` (lista) e `/casos/$caseId` (ficha operacional canônica, 11 abas) + componentes em `src/components/caso/*`. Toda escrita passa por **server functions** (`createServerFn`) que acessam o banco no servidor. Não há chamada direta ao banco no cliente.
- **Camada protótipo (mock)** — seção "Casos 360" dentro do shell `src/components/desk-app.tsx:490-561`, alimentada por `src/data/casos.ts` (constantes). Somente leitura, sem formulário e sem escrita.

Classificação global: caminho real **confirmado**; camada mock **sem evidência de persistência (por desenho)**.

---

## 1. Matriz de caminhos de salvamento

### 1.1 Lista de Casos — `src/routes/_authenticated/casos.index.tsx` (via `EntidadeCrud`)

| Item | Evidência |
|---|---|
| Dados enviados | Código, título, cliente, status, tipo de serviço, fase, responsável, prioridade, data de entrada, país, via, hipótese, resumo, risco, próxima ação (`casos.index.tsx:72-132`) |
| Mutation | `criarRegistro` / `atualizarRegistro` / `arquivarRegistro` (`entidade-crud.tsx:80-111`) |
| Tabela/colunas | `crm_casos`, filtrada no servidor por lista branca `CAMPOS_PERMITIDOS.crm_casos` (`saas.functions.ts:79-145`) |
| RLS/permissões | Políticas `casos_select/insert/update` para `authenticated`, escopadas por organização. **Não existe policy de DELETE** e há trigger `no_delete_casos` (`fn_block_delete`) — exclusão física impossível, só arquivamento |
| Tratamento de erro | `onError` grava mensagem em estado e exibe inline (`entidade-crud.tsx:87,99,110`) |
| Feedback | Texto inline e botão desabilitado durante `isPending`; **sem toast** |
| updated_at / updated_by | `updated_at` por trigger `t_upd_casos`; `updated_by` setado no servidor com `context.userId` (`saas.functions.ts:482`). Cliente é impedido de enviá-los (lista `BLINDADOS`, `saas.functions.ts:271`) |
| Auditoria | Triggers `audit_casos` (`fn_audit`) e `status_audit_casos` (`fn_audit_status`) gravam em `audit_logs` |
| Após reload | Dados relidos do banco; `invalidateQueries` após sucesso (`entidade-crud.tsx:76-78`) |
| Risco de mock/local state | Baixo — estado local só existe dentro do modal aberto |
| Mudanças não salvas | Fechar o modal descarta o formulário sem aviso |
| **Classificação** | **Confirmado** |

### 1.2 Ficha do caso — abas "Caso", "Comercial", "Técnico" (`casos.$caseId.index.tsx`)

| Item | Evidência |
|---|---|
| Dados enviados | Diff acumulado em `useState` (`v()`/`set()`, linhas 232-240): identificação, responsáveis, próxima ação, brief, eixo comercial, referências de proposta, escopos, país/via, radar, riscos |
| Mutation | `atualizarRegistro` (`casos.$caseId.index.tsx:242-252`) |
| Tabela/colunas | `crm_casos`, sanitizado por lista branca (`saas.functions.ts:278-313`) — **campos fora da lista são silenciosamente descartados** |
| RLS | Igual a 1.1 |
| Erro | `onError` → mensagem inline no corpo da página (`:251`) |
| Feedback | "Salvando… / Salvo às / Alterações não salvas" em texto (`:307-315`); **sem toast** |
| updated_at/by | Trigger + `context.userId`; nunca vindos do cliente |
| Auditoria | `audit_logs` via `fn_audit` (antes/depois completos) |
| Após reload | `form` só é resetado quando `caso.updated_at` muda (`:215-217`); há aviso `beforeunload` (`:222-230`), mas **nenhum rascunho persistido** |
| Risco de local state | **Médio-alto**: um F5 confirmado descarta todo o diff não salvo |
| Mudanças não salvas | Indicadas em texto e no `beforeunload`; troca de aba dentro da ficha **mantém** o diff, mas navegar para outra rota o perde sem bloqueio de router |
| **Classificação** | **Incompleto** (persiste corretamente, mas sem proteção de rascunho e com feedback pouco visível) |

### 1.3 Aba "Pessoas" (`AbaPessoas` / `CartaoPessoa`, `casos.$caseId.index.tsx:643-785`)

| Item | Evidência |
|---|---|
| Dados | Criação por nome (`:662`) e ~17 campos por pessoa (papel, status cadastral, parentesco, documentos, contatos, consentimentos) |
| Mutation | `criarRegistro`/`atualizarRegistro` (`:661-668, 727-736`) |
| Tabela | `case_members`, lista branca em `saas.functions.ts:146-172` |
| RLS | `case_members_sel/ins/upd` para `authenticated`; sem DELETE + trigger `case_members_no_delete` |
| updated_at/by | Trigger `case_members_meta` (`fn_touch_meta`) preenche `created_by`, `updated_by` e `updated_at` no banco |
| Auditoria | Trigger `case_members_audit` → `audit_logs` |
| Erro/feedback | Inline, botão desabilitado durante `isPending` |
| Após reload | Relê do banco após invalidate |
| **Classificação** | **Confirmado** |

### 1.4 Produto/Trilha e Case Service (`caso/produto-trilha.tsx`, `caso/consolidacao-case-service.tsx`)

| Item | Evidência |
|---|---|
| Dados | Produto, trilha, escopo, condição comercial; critérios de aceite |
| Mutation | `salvarCaseService` (`caso-canonico.functions.ts:54-99`), `semearCriteriosAceite`, `decidirCriterioAceite` |
| Tabela | `case_services` (preço forçado no servidor: `preco_acordado`, `preco_somente_leitura`) e `case_service_criterios` |
| RLS | Políticas `authenticated` para select/insert/update; sem DELETE + triggers de bloqueio |
| updated_at/by | `updated_at` por trigger; `updated_by` explícito no server fn (`:77,93`) |
| Auditoria | **Sem trigger de auditoria dedicado** nessas duas tabelas |
| **Classificação** | **Incompleto** (persistência confirmada, trilha de auditoria ausente) |

### 1.5 Próxima Ação, Alertas e Comunicação (`caso/proxima-acao.tsx`)

| Item | Evidência |
|---|---|
| Mutations | `registrarProximaAcao` (`caso-canonico.functions.ts:146-216`), `atualizarAlerta` (`:218-237`), `aprovarRascunho` (`:240-259`) |
| Tabelas | `case_alerts` (insert/update), `communication_queue` (insert e aprovação), `crm_casos` (status de alerta/comunicação) |
| Pré-condições | Registro exige `proxima_acao_codigo`, `prazo_proxima_acao` e `responsavel_principal` **já persistidos** — se o usuário preencher esses campos e não salvar a aba "Caso" antes, a ação falha |
| updated_at/by | `updated_at` por trigger em ambas as tabelas; **`updated_by` não é setado** em `atualizarAlerta`; `aprovarRascunho` seta (`:254`) |
| Auditoria | Sem trigger de auditoria em `case_alerts` / `communication_queue` |
| **Classificação** | **Incompleto** (dependência de ordem de salvamento não sinalizada na interface; `updated_by` parcial) |

### 1.6 Etiquetas (`caso/etiquetas-caso.tsx`)

| Item | Evidência |
|---|---|
| Mutations | `aplicarEtiqueta` / `removerEtiqueta` (`caso-canonico.functions.ts:102-140`) |
| Tabela | `entity_labels` — remoção é lógica (`removed_at`), com trigger `no_delete_entity_labels` |
| updated_at/by | Apenas `updated_at` por trigger; **sem `updated_by`** |
| Auditoria | Ausente |
| Feedback | Toggle imediato via mutation; **sem optimistic update** — o chip só muda após o refetch |
| **Classificação** | **Incompleto** |

### 1.7 Onboarding do caso (`caso/onboarding-caso.tsx`, `onboarding-plano.tsx`)

| Item | Evidência |
|---|---|
| Dados | Status e observação por item (`:112-114`), salvo item a item (`:149`) |
| Mutation | `atualizarItemOnboarding` (`caso-canonico.functions.ts:261-295`) |
| Tabela | `onboarding_checklist` (`status`, `observacao`, `concluido_em/por`); `onboarding_planos` |
| updated_at/by | Trigger de `updated_at`; **`updated_by` não setado** |
| Após reload | Itens não salvos individualmente são perdidos (cada linha tem estado próprio) |
| **Classificação** | **Incompleto** |

### 1.8 Cadastro / Checklist cadastral (`caso/cadastro-checklist.tsx`)

| Item | Evidência |
|---|---|
| Mutations | `mSemear`, `mSalvar`, `mAcao` (`:54,59,64`) |
| Tabela | `checklist_cadastral` — políticas em `public` (não restritas a `authenticated`), sem DELETE, trigger de bloqueio de exclusão |
| updated_at/by | **Sem trigger de `updated_at`/`updated_by`** nessa tabela |
| Auditoria | Ausente |
| **Classificação** | **Incompleto** — e ponto de atenção de governança: políticas concedidas ao papel `public` (mesmo caso de `case_timeline_events`) |

### 1.9 Preparação contratual (`casos.$caseId.contrato.preparar.tsx`)

| Item | Evidência |
|---|---|
| Mutations | Preparar/congelar versão, solicitar e aprovar revisão humana, solicitação e registro de assinatura (linhas 90-164) |
| Feedback | **Único fluxo com toast (`sonner`)**, sucesso e erro |
| Auditoria | Tabelas de contrato possuem `fn_contract_meta` (created_by/updated_by/updated_at + exigência de motivo de arquivamento) |
| **Classificação** | **Confirmado** |

### 1.10 "Casos 360" no shell do Desk (`desk-app.tsx:490-561`)

| Item | Evidência |
|---|---|
| Dados | Constantes de `src/data/casos.ts` |
| Mutation/tabela | Nenhuma |
| Risco | Tela intitulada "Casos" com aparência operacional e **zero escrita**; usuário pode supor que reflete o banco |
| **Classificação** | **Sem evidência de persistência** (protótipo por desenho) |

### 1.11 CRM vivo (`desk-crm.tsx` + `src/lib/crm.functions.ts:125-216`)

| Item | Evidência |
|---|---|
| Mutations | `registrarTouchpoint`, `alternarTarefa`, `alternarVisibilidadeEntrega`, `publicarCanvas` |
| Tabelas | `touchpoints`, `planner_tarefas`, `microentregas` — todas com trigger de `updated_at`, **nenhuma com `updated_by` ou auditoria**; políticas RLS únicas por tabela (1 policy), não segregadas por comando |
| **Classificação** | **Incompleto** |

---

## 2. Consolidação dos riscos

1. **Perda de rascunho na ficha do caso** — diff mantido apenas em memória; `beforeunload` avisa, mas navegação interna de rota não é bloqueada e não há persistência local. *(Incompleto)*
2. **Feedback inconsistente** — só o fluxo contratual usa toast; o restante depende de texto inline que pode ficar fora da área visível. *(Incompleto)*
3. **Descarte silencioso por lista branca** — campos fora de `CAMPOS_PERMITIDOS` são removidos no servidor sem erro; a interface reporta "salvo". *(Risco de "salvei e não gravou")*
4. **Dependência de ordem de salvamento** em Próxima Ação, sem sinalização prévia. *(Incompleto)*
5. **`updated_by` ausente** em `case_alerts`, `onboarding_checklist`, `entity_labels`, `checklist_cadastral`, `touchpoints`, `planner_tarefas`, `microentregas`. *(Incompleto)*
6. **Auditoria limitada** — `audit_logs` cobre `crm_casos` e `case_members`; demais tabelas da aba não têm trilha. *(Incompleto)*
7. **Políticas concedidas ao papel `public`** em `checklist_cadastral` e `case_timeline_events`, divergindo do padrão `authenticated` das demais. *(Atenção de governança)*
8. **Coexistência de camada mock** com nome de módulo operacional. *(Sem evidência / confusão de fonte)*
9. **Ausência de optimistic update** em toggles (etiquetas, tarefas) gera sensação de lentidão, sem risco de dado.

**Confirmados:** 1.1, 1.3, 1.9 · **Incompletos:** 1.2, 1.4, 1.5, 1.6, 1.7, 1.8, 1.11 · **Quebrados:** nenhum caminho encontrado · **Sem evidência:** 1.10.

---

## 3. Menor conjunto de correções controladas (proposta, não executada)

Sujeito a revisão humana antes de qualquer implementação.

**Correção 1 — Não descartar campo em silêncio.** Fazer o servidor retornar a lista de campos ignorados pela sanitização e a interface exibir aviso explícito em vez de "Salvo". Apenas `saas.functions.ts` + a mensagem de status da ficha.

**Correção 2 — Proteger o rascunho da ficha.** Bloquear navegação de rota quando houver diff pendente (mesmo critério já usado no `beforeunload`). Sem mudança de dados ou de layout.

**Correção 3 — Feedback uniforme.** Padronizar sucesso e erro em toast nos formulários da aba Casos, mantendo o texto inline atual.

**Correção 4 — Completar `updated_by`.** Migração de trigger padronizada (`fn_touch_meta`) para `case_alerts`, `onboarding_checklist`, `entity_labels` e `checklist_cadastral`, mais `updated_at`/`updated_by` na `checklist_cadastral`.

**Correção 5 — Estender auditoria.** Aplicar `fn_audit` a `case_services`, `case_service_criterios` e `onboarding_checklist`.

**Correção 6 — Alinhar políticas ao padrão.** Reescrever as políticas de `checklist_cadastral` e `case_timeline_events` do papel `public` para `authenticated`, preservando a mesma condição de organização.

**Correção 7 — Rotular a camada protótipo.** Marcar visualmente "Casos 360" do shell como visualização de demonstração, sem removê-la.

**Correção 8 — Sinalizar pré-condições da Próxima Ação.** Desabilitar o botão com motivo quando responsável, código de ação ou prazo ainda não estiverem persistidos.

Ordem sugerida: 1 → 2 → 8 → 3 → 4 → 5 → 6 → 7.

---

*Auditoria em modo leitura. Nenhum código, dado, esquema ou interface foi alterado.*
