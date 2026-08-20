# G-04 — Pesquisa Genealógica e Evidências: Documentos e Solicitações (v1.0)

## Área criada
Rota interna `/pesquisa-evidencias/$caseId` com as oito seções: Visão de pesquisa; Pessoas, famílias e ramos;
Fontes e consultas; Documentos e Solicitações; Evidências e validações; Hipóteses e lacunas; Relatórios de fase;
Alertas e histórico. Ligada na ficha canônica do caso.

## Tabela `document_requests`
Grade visível: Geração · Nome Completo · Tipo de Documento · Arquivo/Instituição · Data Pedido · Status ·
Data Recebimento · Observação.

Campos técnicos: `case_id`, `family_id`, `research_person_id`, `source_id`, `evidence_id`, `request_type`,
`responsible_user_id`, `next_action`, `next_action_due`, `priority`, `estimated_external_cost`,
`client_approval_status`, `internal_link`, `access_level`, `data_origin`, `created_at`, `updated_at`
(+ autoria, arquivamento com motivo).

### Dicionário de situações (17)
Não solicitado; A preparar; Solicitado; Aguardando pagamento do cliente; Aguardando cliente; Aguardando instituição;
Recebido; Em revisão; Validado internamente; Divergente; Insuficiente; Requer complemento; Requer retificação;
Requer tradução/apostila; Não localizado; Cancelado; Não aplicável.

## Travas no banco (`fn_document_request_guard` / `fn_document_request_pos`)
- Dicionário fechado para situação, tipo, prioridade, nível de acesso e aprovação do cliente.
- Nome completo em texto só quando não há pessoa cadastrada vinculada.
- Data do pedido obrigatória a partir de Solicitado; data de recebimento obrigatória em Recebido.
- Recebido cria/vincula evidência com `workflow_status = recebida`.
- Aguardando cliente, Aguardando instituição, Divergente, Não localizado e Requer retificação exigem próxima ação,
  prazo e responsável e geram alerta interno.
- Aguardando cliente gera apenas rascunho em `communication_queue` (`requires_human_approval = true`, sem envio).
- Custo externo é previsão; nunca despesa, receita, reembolso ou cobrança.
- Sem exclusão física: apenas arquivamento com motivo.

## RLS
Leitura por membro da organização; solicitações `restrito` só para administração e pesquisa. Escrita por papel com
permissão de escrita. Link interno e documento bruto ficam fora de qualquer projeção ao App.

## Testes
`src/lib/__tests__/documentos-solicitacoes.test.ts` — 11 testes, incluindo os 5 exigidos.

## Confirmação
Nenhuma pesquisa externa, solicitação de certidão, contato com instituição, despesa, cobrança, pasta, mensagem ou
documento externo foi criado ou disparado.
