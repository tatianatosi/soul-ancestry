# G-08B — Plano de integração: Fontes e documentos ↔ resto da Pesquisa Transversal

Objetivo: ligar os documentos catalogados em `case_source_documents` às demais
peças da pesquisa (pessoas, solicitações, evidências, relatórios) **somente por
ação humana explícita**, sem nenhuma criação automática.

Caso piloto: CA-CID-AT-FAM-2026-001 (Ana). Sem OCR, IA, extração, pesquisa
externa, contrato, cobrança, comunicação ou publicação no App Cliente.

## Regra central
Um documento nunca gera nada sozinho. Cada vínculo é um ato humano registrado,
com autor, data, motivo e trilha em `audit_logs`. Vincular não muda o estado
epistêmico do caso: a evidência criada nasce em rascunho, com confiança mínima,
e só avança pelos fluxos que já existem no G-03.

## Banco (1 migration)
Nova tabela `public.case_source_document_links`:
- `organization_id`, `case_id`, `source_document_id` (obrigatórios)
- alvo exclusivo (exatamente um preenchido): `evidence_id`, `document_request_id`,
  `research_person_id`, `case_report_id`
- `tipo_vinculo` (dicionário fechado: `comprova`, `complementa`, `atende_solicitacao`,
  `refere_pessoa`, `citado_em_relatorio`), `observacao_interna`, `vinculado_por`,
  `vinculado_em`, `archived_at`, `archive_motivo`
- GRANT para `authenticated` e `service_role` (sem `anon`)
- RLS espelhando `case_source_documents`: organização + `pode_pesquisar_caso`
- `fn_case_source_document_link_guard`: alvo único, alvo do mesmo caso/organização,
  dicionário fechado, DELETE físico bloqueado, desvínculo exige motivo, autoria
  automática, auditoria sanitizada

Nenhuma alteração em `evidences`, `document_requests`, `case_reports` ou
`genealogical_person_profiles` além do uso normal das colunas já existentes.

## Arquivos
- `src/lib/fontes-documentos-integracao.ts` (novo) — lógica pura: dicionário de
  tipos de vínculo, validação de alvo único e de coerência de caso, montagem do
  rascunho de evidência a partir dos metadados do documento (título interno,
  data, local, pessoa) com `confidence_level` mínimo e `workflow_status` rascunho,
  e verificação de que nenhum campo de mérito/preço/CPF viaja no vínculo.
- `src/lib/fontes-documentos-integracao.functions.ts` (novo) — server fns
  autenticadas: `listarVinculosFonte`, `vincularFonteA` (evidência existente,
  solicitação, pessoa ou relatório), `criarEvidenciaRascunhoDeFonte` (ação
  humana, um clique, sem efeito em cadeia), `desvincularFonte` (lógico, com motivo).
- `src/lib/fontes-documentos.functions.ts` — `listarFontesDocumentos` passa a
  devolver a contagem de vínculos por documento (leitura apenas).
- `src/components/pesquisa/fontes-documentos.tsx` — no painel de detalhe do
  documento: bloco "Vínculos da pesquisa" com lista atual, ação "Vincular a…"
  (seletor de evidência, solicitação, pessoa do núcleo ou relatório do caso),
  ação "Criar evidência em rascunho a partir deste documento" com confirmação
  explícita, e "Desvincular" exigindo motivo. Coluna "Vínculos" na tabela.
- `src/components/pesquisa/*` (evidências, documentos e solicitações) — exibir,
  em leitura, os documentos-fonte vinculados ao item, sem editar nada por lá.
- `src/lib/relatorios-fase.ts` — reconhecer documentos-fonte vinculados como
  lastro interno na conferência do relatório, sem publicar nem anexar arquivo.

## Testes
`src/lib/__tests__/fontes-documentos-integracao.test.ts`:
1. alvo único obrigatório; dois alvos ao mesmo tempo é rejeitado
2. vínculo com alvo de outro caso/organização é rejeitado
3. evidência criada a partir de documento nasce rascunho, confiança mínima,
   sem validação epistêmica e sem avanço de estado do caso
4. vincular não cria pessoa, relação, evento, linhagem, achado nem relatório
5. desvínculo exige motivo; exclusão física é negada
6. papel `leitura` não vincula nem desvincula
7. nada do vínculo entra em projeção ao App Cliente
8. nenhum campo de mérito, CPF, preço ou condição comercial no payload do vínculo

## Fora de escopo
OCR, IA, extração automática, pesquisa externa, criação automática de qualquer
entidade, publicação no App Cliente, contrato, cobrança, comunicação, nova rota,
nova aba ou redesenho.
