# G-03 — Biblioteca de Evidências e Projeções Autorizadas (v1.0)

Data: 20/08/2026 · Escopo: interno (Desk Intelligence) · Status: implantado

Princípio: **integração invisível, evidência visível**.

Cadeia: Fonte/material → Biblioteca de Evidências → Desk/Pesquisa → Projeção autorizada →
App Cliente / One-page / PDF aprovado.

## 1. Tabelas

### `evidences`
`case_id`, `research_item_id`, `research_person_id`, `source_id`, `evidence_type`, `evidence_nature`,
`title_internal`, `description_internal`, `reference_date`, `reference_location`,
`storage_reference_internal`, `access_level` (restrito | equipe_do_caso | cliente_autorizado),
`workflow_status` (recebida → registrada → em_revisao → divergente → insuficiente → requer_complemento →
requer_retificacao → requer_traducao_apostila → rejeitada_inaplicavel → aprovada_para_entrega → publicada),
`epistemic_validation_status` (INFORMACAO_COMPARTILHADA_FAMILIA, DADO_PESQUISA_INICIAL,
EM_VALIDACAO_DOCUMENTAL, VALIDADO_POR_DOCUMENTO, PENDENTE_CONFIRMACAO, NAO_APLICAVEL),
`confidence_level` (INICIAL, BAIXO, MEDIO, ALTO), `reviewed_by`, `reviewed_at`, `legal_review_status`,
campos de busca negativa, autoria, arquivamento, `created_at`, `updated_at`.

### `evidence_validations`
`evidence_id`, `estado_anterior`, `estado_novo`, `confianca_anterior`, `confianca_nova`,
`justificativa` (mínimo 10 caracteres), `revisado_por`, `revisado_em`.

### `app_projections`
`source_entity_type`, `source_entity_id`, `case_id`, `projection_type`,
`destination` (app | one_page | pdf_aprovado), `content_sanitized`,
`approval_status` (draft | in_review | approved | published | archived), `approved_by`, `approved_at`,
`visibility_scope`, `effective_from`, `archived_at`.

## 2. Travas executáveis (banco)

- **Busca negativa é evidência válida** e exige fonte consultada, data e próxima ação possível.
- **Sem salto automático de INICIAL para ALTO**; evidência nasce em INICIAL ou BAIXO.
- **Elevação de confiança** exige responsável, data e justificativa registrada em `evidence_validations`.
- **Fonte colaborativa** não atinge VALIDADO_POR_DOCUMENTO nem confiança ALTA sozinha.
- **VALIDADO_POR_DOCUMENTO** exige natureza documental + revisor + data (e não equivale a parecer jurídico,
  cidadania reconhecida ou resultado garantido — disclaimer fixo nas projeções).
- **Projeção**: recusa conteúdo com URL, link, referência de arquivo, transcrição, hipótese, risco, nota
  interna ou juízo de mérito; exige evidência não restrita e aprovada para entrega; aprovação exige
  aprovador e data; publicada só pode ser arquivada.
- **Sem exclusão física** em nenhuma das três tabelas: apenas arquivamento com motivo.

## 3. RLS

- Isolamento por `organization_id` (`is_org_member` / `can_write`) nas três tabelas.
- Evidência com `access_level = 'restrito'` só é lida por administração, pesquisa, autor ou revisor
  (`has_org_role`), mesmo dentro da organização.
- Nenhuma política concede acesso a `anon`. O App Cliente não lê `evidences`: lê apenas projeção publicada.

## 4. Telas

Rota interna `/biblioteca-evidencias/$caseId`, ligada à ficha canônica do caso, com abas:
Evidências, Nova evidência, Validação e confiança, Projeções autorizadas e Cadeia evidência → projeção.

## 5. Exemplo de cadeia

1. **Evidência** — "Certidão de nascimento — Adair", natureza documental oficial, acesso equipe do caso,
   estado `registrada`, epistêmico `DADO_PESQUISA_INICIAL`, confiança `INICIAL`.
2. **Validação 1** — conferência com o registro civil: `INICIAL → BAIXO`, justificativa registrada,
   responsável e data gravados.
3. **Validação 2** — `BAIXO → MEDIO`, estado `EM_VALIDACAO_DOCUMENTAL`. (Tentar `INICIAL → ALTO` é recusado.)
4. **Aprovação para entrega** — `workflow_status = aprovada_para_entrega`, acesso `cliente_autorizado`.
5. **Projeção** — destino `app`, conteúdo sanitizado: "Registro de nascimento localizado e conferido."
   Rascunho → aprovação humana (aprovador + data) → publicação.
6. **App Cliente** — passa a ler apenas o texto sanitizado, com o disclaimer padrão. A evidência, sua
   referência de armazenamento, notas internas e histórico permanecem no Desk.

## 6. Testes (`src/lib/__tests__/biblioteca-evidencias.test.ts`) — 11 passando

1. Evidência interna não aparece no App sem projeção aprovada (e só publicada chega ao App).
2. Busca negativa persiste como evidência válida; sem próxima ação é recusada.
3. Salto de confiança sem revisão é negado; INICIAL → ALTO é negado.
4. Conteúdo com URL interna ou hipótese não pode compor projeção.
5. Evidência restrita ou não aprovada não é projetável (equivalente aplicativo do bloqueio de acesso, que
   no banco é feito pela política de RLS por papel).
6. Fonte colaborativa não valida sozinha vínculo ou direito.
7. Validação por documento exige responsável e data.
8. Projeção aprovada exige aprovador, data e evidência elegível.
9. Cadeia evidência → validação → projeção é auditável e ordenada.
10. Campos mínimos da evidência.

## 7. Confirmação

Nenhuma consulta externa, scraping, API, login externo ou pesquisa externa foi executada.
Nenhuma mensagem foi enviada, nenhum documento externo foi criado e nada foi publicado no App Cliente:
não há projeção com estado `published` neste momento.
