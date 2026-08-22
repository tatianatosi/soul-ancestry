# Catálogo de exceções operacionais — v1.1

Exceção é registro canônico temporário em `ops_excecoes` (nunca status oculto nem entidade paralela), com evento append-only em `audit_logs`/`owner_override_events`.
Campos obrigatórios: entidade, entidade_id, tipo, regra_afetada, estado_original, decisao, motivo, fonte_evidencia, valor_anterior, valor_novo, autora, criado_em, responsavel_regularizacao, valido_ate, impacto, status (aberta | regularizada | expirada | revogada).
Exceção nunca falsifica: pagamento, assinatura, elegibilidade, evidência validada, contrato executado, acesso externo. Reaparece na fila 3 dias antes de expirar.

| Tipo | Quando | Prazo | Regularização | Impacto |
|---|---|---|---|---|
| Micro-entrega em caso pausado | Entrega precisa avançar com o caso pausado. | 30 dias | Reativar o caso ou concluir a entrega pendente. | Item permanece na fila com selo de exceção até regularizar. |
| Reabertura de caso encerrado | Caso encerrado precisa voltar a operar. | sem prazo | Encerrar novamente com registro de motivo. | Histórico anterior preservado; novo ciclo auditado. |
| Desbloqueio excepcional de tarefa | Tarefa bloqueada por dependência que não se resolverá a tempo. | 15 dias | Resolver a dependência original. | Bloqueio segue visível como pendência assumida. |
| Prazo excedido com autorização | SLA estourado por decisão consciente. | 15 dias | Repactuar prazo e concluir a etapa. | Indicador de atraso continua contabilizado. |
| Documento pendente em etapa posterior | Etapa avança antes do documento existir ou ser legível. | 30 dias | Anexar ou substituir o documento e revisar. | Documento fica como pendente; nenhuma etapa interna trava. |
| Dado cadastral incompleto | Pessoa, dependente ou representação sem campo obrigatório. | 30 dias | Completar o cadastro na entidade canônica. | Campo ausente sinalizado em prévias e fichas. |
| Proposta incompleta aprovada | Aprovação necessária antes da completude das páginas 1–7. | 15 dias | Completar a proposta e revalidar a conferência de escopo. | Conferência de escopo permanece em aberto. |
| SKU ou preço ainda não homologado | Escopo usa item fora da base homologada. | 15 dias | Homologar o SKU na fonte mestre do catálogo. | Item entra na fila de saneamento do catálogo. |
| Condição comercial fora do padrão | Desconto, parcelamento ou vencimento fora da matriz. | 30 dias | Homologar a condição ou ajustar ao padrão. | Sinal comercial permanece no Painel Hoje. |
| Consentimento pendente | Operação interna precisa avançar antes do aceite formal. | 15 dias | Coletar o consentimento ou registrar dispensa fundamentada. | Nenhuma liberação ao cliente ocorre enquanto pendente. |
| Contrato sem anexo aplicável | Versão gerada antes de todos os anexos estarem prontos. | 15 dias | Vincular o anexo e gerar nova versão. | Prévia interna exibe o anexo faltante em destaque. |
| Divergência de escopo entre proposta e OS | Proposta e ordem de serviço não coincidem. | 15 dias | Reconciliar escopo na fonte canônica e reconferir. | Divergência listada na conferência de escopo. |
| Contrato ou assinatura pendente | Etapa interna avança antes do contrato assinado. | 15 dias | Concluir assinatura ou registrar desistência. | Nenhuma execução externa ocorre; assinatura nunca é presumida. |
| Pesquisa, evidência ou rechecagem pendente | Achado precisa avançar antes da validação da evidência. | 30 dias | Rechecar a fonte e validar ou descartar a evidência. | Achado permanece como hipótese; nunca vira evidência validada. |
| Responsável, prazo ou próxima ação ausente | Item entra na fila sem dono ou sem data definida. | 7 dias | Atribuir responsável, prazo e próxima ação. | Item aparece na fila com sinal de indefinição. |
| Onboarding ou acesso externo pendente | Caso opera antes do acesso do cliente estar ativo. | 15 dias | Concluir onboarding e ativar o acesso com confirmação. | Cliente não recebe nada; trabalho interno segue. |
| Integração indisponível | Serviço externo (pagamento, storage, e-mail) fora do ar ou não conectado. | 7 dias | Restabelecer a integração e reprocessar manualmente. | Ato externo permanece em pronto_para_confirmacao_externa. |
| Dado TESTE/DEMO/fixture em uso | Registro de fixture é usado em fluxo operacional. | 30 dias | Substituir por dado real ou arquivar o registro de teste. | Selo de fixture permanece visível e fora das métricas reais. |
| Conflito ou falta de fonte canônica | Duas fontes divergem ou a fonte homologada não existe. | 15 dias | Eleger a fonte canônica e registrar a decisão. | Valor exibido fica marcado como não homologado. |
