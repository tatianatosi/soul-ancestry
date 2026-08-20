# G-08 — Fontes e documentos dentro de Pesquisa Transversal (v1.1)

## Mapeamento do eixo existente
O eixo transversal de pesquisa do caso já existe na rota interna
`/_authenticated/pesquisa-evidencias/$caseId` ("Pesquisa Genealógica e Evidências"),
com 8 seções internas (Visão, Pessoas, Fontes e consultas, Documentos e Solicitações,
Evidências, Hipóteses, Relatórios, Alertas). A seção de trabalho "Fontes e documentos"
entra como **seção contextual dessa mesma tela**, reutilizando layout, autorização e padrões.
Sem nova rota, aba global, item de menu ou redesenho. Caso piloto de aceite: Ana —
CA-CID-AT-FAM-2026-001 (Ana, Adair, Alice, Felipe ou "Pessoa ainda não identificada").

## Banco de dados (1 migration)
Nova tabela `public.case_source_documents`:
- vínculo obrigatório: `organization_id`, `case_id`; `pessoa_ref_id` opcional + flag controlada `pessoa_nao_identificada`
- obrigatórios: `storage_path`, `nome_arquivo`, `tipo_documento` (catálogo de 28 tipos), `origem_documento`, `status` (default `pendente_revisao`)
- opcionais: título interno, data do documento, país, estado/província, cidade, instituição emissora, livro/folha/termo/matrícula, referência ou URL de origem, idioma, observações, confidencialidade, qualidade/origem
- trilha: `created_by`, `updated_by`, `created_at`, `updated_at`, `archived_at`, `archive_motivo`
- extensão futura: `extracao_status` default `nao_preparado` (nenhuma ação implementada)

Travas e RLS:
- GRANTs para `authenticated` e `service_role` (sem `anon`)
- RLS por organização + pertencimento à equipe do caso para ler, incluir, editar e arquivar
- `fn_case_source_document_guard`: dicionários fechados (tipo, status, qualidade, confidencialidade, origem), pessoa por referência (nunca texto livre), bloqueio de DELETE físico, arquivamento exige motivo, autoria/timestamps automáticos
- auditoria sanitizada em `audit_logs` (sem CPF, preço ou condição comercial)

## Storage
Reutilizar o bucket privado `documentos` já existente, prefixo `fontes/{organization_id}/{case_id}/…`,
com URL assinada de curta duração para upload e leitura (padrão de `documentos.functions.ts`).
Nunca URL pública. Aceitos PDF, JPG, JPEG, PNG (+ TIFF apenas se o bucket atual aceitar).

## Arquivos
- `src/lib/fontes-documentos.ts` (novo) — catálogos controlados (28 tipos, 4 estados, 7 qualidades, confidencialidade, origem), validação de extensão/tamanho/arquivo vazio, validação do formulário, filtros/busca e mascaramento da lista.
- `src/lib/fontes-documentos.functions.ts` (novo) — server fns autenticadas: `listarFontesDocumentos`, `criarUploadFonte`, `registrarFonteDocumento`, `editarMetadadosFonte`, `arquivarFonteDocumento`, `verFonteDocumento`. Sem OCR, IA, extração, evidência, pessoa, relação, evento, linhagem, achado, relatório, publicação ou comunicação.
- `src/components/pesquisa/fontes-documentos.tsx` (novo) — seção com cabeçalho e contador de documentos ativos, botão "Adicionar documento", busca, filtros (status, tipo, pessoa, origem, país/local, confidencialidade), tabela com as 11 colunas pedidas e ações ver/editar/arquivar; formulário e detalhe em painel contextual; arquivamento exige motivo. "Preparar para extração assistida" apenas como indisponível/em breve dentro do detalhe existente.
- `src/lib/documentos-solicitacoes.ts` — acrescentar a seção `fontes_documentos` à lista `SECOES` já existente (navegação interna, não global).
- `src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx` — renderizar a nova seção.

## Testes
`src/lib/__tests__/fontes-documentos.test.ts` (dados sintéticos, nunca arquivos reais da família):
1. extensão inválida, excesso de tamanho e arquivo vazio/corrompido são rejeitados
2. obrigatoriedade de arquivo, tipo, pessoa (ou não identificada) e origem; estado inicial `pendente_revisao`
3. edição de metadados preserva autoria/criação e gera trilha auditada
4. arquivamento lógico exige motivo; exclusão física é rejeitada
5. isolamento: documento de outro caso/organização não aparece nem é acessível
6. nenhuma criação automática de evidência, pessoa, relação, evento, linhagem, achado ou relatório
7. lista não expõe CPF completo, preço nem condição comercial
8. nada do módulo entra em projeção ao App Cliente (regra de `legado-visibilidade.ts` intacta)

## Fora de escopo (confirmado)
Nenhuma nova aba/rota/menu, nenhum redesenho, nenhuma alteração em Legado, App Cliente, gates da Ana,
contrato, assinatura, financeiro, onboarding, pesquisa externa ou integração.
