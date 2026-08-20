# Fontes e documentos dentro de Pesquisa Transversal

## Mapeamento do eixo existente
Hoje o eixo transversal de pesquisa do caso é a rota interna já aprovada
`/_authenticated/pesquisa-evidencias/$caseId` ("Pesquisa Genealógica e Evidências"),
com suas 8 seções internas (Visão, Pessoas, Fontes e consultas, Documentos e Solicitações,
Evidências, Hipóteses, Relatórios, Alertas). A nova seção de trabalho "Fontes e documentos"
entra como **seção interna dessa tela**, ao lado das existentes — sem nova rota, aba global,
item de menu ou redesenho. A aba Legado do App Cliente não é tocada.

## Banco de dados (1 migration)
Nova tabela `public.case_source_documents`:
- vínculo obrigatório: `organization_id`, `case_id`; opcional `pessoa_ref_id` (pessoa existente do caso) ou marcador "pessoa ainda não identificada"
- obrigatórios: `storage_path`, `nome_arquivo`, `tipo_documento` (catálogo de 28 tipos), `origem_documento`, `status` = `pendente_revisao`
- opcionais: título interno, data do documento, país, estado, cidade, instituição emissora, livro/folha/termo/matrícula, referência ou URL de origem, idioma, observações, confidencialidade, qualidade/origem
- trilha: `created_by`, `updated_by`, `created_at`, `updated_at`, `archived_at`, `archive_motivo`
- ponto de extensão futuro: `extracao_status` default `nao_preparado` (sem nenhuma ação implementada)

Travas e segurança:
- GRANTs para `authenticated` e `service_role`
- RLS por organização + pertencimento ao caso (mesmo padrão das tabelas de pesquisa já existentes)
- trigger de guarda: dicionários fechados (tipo, status, qualidade, confidencialidade), bloqueio de DELETE físico, arquivamento exige motivo, autoria/timestamps automáticos
- trigger de auditoria sanitizada em `audit_logs` (sem CPF, preço ou condição comercial)

## Storage
Reutilizar o bucket privado `documentos` já em uso, com prefixo `fontes/{organization_id}/{case_id}/…`
e URL assinada de curta duração (padrão já existente em `documentos.functions.ts`).
Nenhuma URL pública. Aceitos PDF, JPG, JPEG, PNG (+ TIFF apenas se aceito pelo bucket atual).

## Arquivos
- `src/lib/fontes-documentos.ts` (novo) — catálogos controlados (28 tipos, 4 estados, 7 qualidades, confidencialidade), validação de extensão/tamanho, validação de formulário, rótulos e mascaramento de lista.
- `src/lib/fontes-documentos.functions.ts` (novo) — server fns autenticadas: `listarFontesDocumentos`, `criarUploadFonte` (URL assinada de upload), `registrarFonteDocumento`, `editarMetadadosFonte`, `arquivarFonteDocumento`, `verFonteDocumento` (URL assinada de leitura). Sem OCR, IA, extração, evidência, pessoa, relação, achado, publicação ou comunicação.
- `src/components/pesquisa/fontes-documentos.tsx` (novo) — seção interna: lista (arquivo, tipo, pessoa, origem/emissor, data, local, status, qualidade, inclusão, autor, ações ver/editar/arquivar), botão "Adicionar documento" com formulário em painel contextual, diálogo de arquivamento com motivo. Botão "Preparar para extração assistida" apenas como indisponível/em breve, dentro do detalhe já existente.
- `src/lib/documentos-solicitacoes.ts` — acrescentar a seção `fontes_documentos` à lista `SECOES` (sem nova navegação global).
- `src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx` — renderizar a nova seção reutilizando layout, autorização e padrões atuais.

## Testes
`src/lib/__tests__/fontes-documentos.test.ts`:
1. upload válido/invalidez de extensão, tamanho e arquivo vazio/corrompido
2. formulário exige arquivo, tipo, pessoa (ou "não identificada") e origem; estado inicial `pendente_revisao`
3. edição de metadados preserva autoria/estado e é auditada
4. arquivamento lógico exige motivo e exclusão física é rejeitada
5. isolamento: registro de outro caso/organização não é listado
6. nenhuma criação automática de evidência, pessoa, relação, evento, linhagem ou achado
7. lista não expõe CPF, preço ou condição comercial

## Fora de escopo (confirmado)
Nenhuma nova aba, rota pública, redesenho, alteração em Legado/App Cliente, gates comerciais/jurídicos,
OCR/IA/extração, pesquisa externa, contrato, cobrança, comunicação ou integração.
