# Matriz de Implementação — SKU, Preço, Asaas, App e Desk

**Status:** matriz de governança e reconciliação; não é tabela de preços nem autorização de cobrança.

## Separação obrigatória de responsabilidades

| Elemento | Fonte canônica esperada | Pode aparecer no app | Pode gerar automação | Controles obrigatórios |
|---|---|---|---|---|
| SKU canônico | Catálogo aprovado | Não como código técnico | Somente após aprovação | ID estável, status, ciclo de vida e histórico |
| Nome comercial | Catálogo/proposta aprovada | Sim, como entrega contextual | Sim, se reconciliado | Versão e relação com SKU |
| Escopo | Contrato/proposta aprovada | Sim, em linguagem de jornada | Não sem validação humana | Inclusões, exclusões e exceções |
| Preço | Fonte comercial/financeira aprovada | Somente se vigente e contextual | Somente se reconciliado | Moeda, validade, condição e responsável |
| Link Asaas | Registro financeiro aprovado | Não como dado técnico | Sim, apenas após reconciliação | Link, produto, valor e status confirmados |
| Proposta | Fonte comercial versionada | Resumo contextual | Pré-carga controlada | Versão, status e regras de arquivo |
| App | Estado da jornada/caso | Sim | Não determina cobrança | Permissão, dados mínimos e trilha de auditoria |
| Desk/CRM | Operação e rastreabilidade | Não diretamente | Pode orquestrar ações aprovadas | Perfil, consentimento, logs e responsabilidade |

## Fluxo de reconciliação

1. Identificar `sku_id` canônico ou registrar ausência de SKU aprovado.
2. Vincular nome comercial, escopo e ciclo de vida sem misturar os campos.
3. Validar proposta vigente e seu estado: ativa, revisada, aceita, arquivada ou substituída.
4. Confirmar preço e link na fonte financeira autorizada; divergência bloqueia automação.
5. Permitir pré-carga no caso apenas para campos definidos, com origem e versão registradas.
6. Exibir no app somente a entrega e o próximo passo pertinentes; preservar controles internos no Desk/CRM.
7. Registrar alteração em log com data, origem, responsável e evidência técnica.

## Implementações que demandam documentação técnica

| Tema | Decisão/implementação observada | Risco de integração | Ação documental |
|---|---|---|---|
| Pré-carga por proposta | Corrigida em commit recente | Sobrescrever dados do caso ou usar proposta arquivada | Definir precedência, campos, idempotência e rollback |
| Proposta arquivada | Correção aplicada | Reativação ou consumo indevido | Definir status e bloqueios de leitura/uso |
| Estrutura familiar | CRM e app receberam integração | Vínculos duplicados, acesso indevido, dados inconsistentes | Schema, RLS/permissões, eventos e testes |
| País/canônico | Coerência corrigida | Produto/etapa incompatível com o país | Dicionário, normalização e validação por transação |
| Despesas | Regra implementada | Valor/escopo exibido ou cobrado indevidamente | Modelo de dados, aprovação, contrato e trilha financeira |
| Motor contratual | P0 corrigido | Documento inconsistente ou incompleto | Campos obrigatórios, template e regressão |

## Bloqueadores absolutos

- Divergência entre preço, SKU, proposta, link ou escopo.
- Proposta arquivada, sem versão ou sem aprovação identificada.
- Dado familiar sem finalidade, consentimento, perfil de acesso ou auditoria.
- Código de SKU proposto tratado como catálogo oficial.
- Tela do app tratada como fonte financeira ou jurídica.
