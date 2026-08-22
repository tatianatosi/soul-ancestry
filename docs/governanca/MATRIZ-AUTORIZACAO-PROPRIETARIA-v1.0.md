# Matriz de autorização da Proprietária Administradora — v1.1

Fonte canônica: `src/lib/varredura-autorizacoes.ts` (áreas, ações, exceções, fluxo documental) e `src/lib/modo-proprietaria.ts` (ações externas).
Regra: nenhum gate interno impede salvar, corrigir ou avançar até `pronto_para_confirmacao_externa` por decisão humana auditada.

| Área | Rota | Estado interno máximo |
|---|---|---|
| Leads e Discovery | `/leads` | `pronto_para_confirmacao_externa` |
| Proposta e condição comercial | `/propostas` | `pronto_para_confirmacao_externa` |
| Catálogo e SKUs | `/catalogo` | `pronto_para_confirmacao_externa` |
| Contrato, versões e Anexos I–V | `/contratos` | `pronto_para_confirmacao_externa` |
| Ordens de serviço | `/ordens-servico` | `pronto_para_confirmacao_externa` |
| Onboarding e gates de ativação | `/casos` | `pronto_para_confirmacao_externa` |
| Casos, planejador e tarefas | `/tarefas` | `pronto_para_confirmacao_externa` |
| Pesquisa genealógica e evidências | `/pesquisa` | `pronto_para_confirmacao_externa` |
| Documentos e acervo | `/evidencias` | `pronto_para_confirmacao_externa` |
| Financeiro | `/financeiro` | `pronto_para_confirmacao_externa` |
| App Cliente e projeções | `/acessos-portal` | `pronto_para_confirmacao_externa` |
| Governança, auditoria e arquivamento | `/auditoria` | `pronto_para_confirmacao_externa` |
| Planejador diário | `/planner` | `pronto_para_confirmacao_externa` |
| Pessoas, núcleos, dependentes e representação | `/pessoas` | `pronto_para_confirmacao_externa` |
| Painel Hoje, fila, sinais e exceções | `/painel` | `pronto_para_confirmacao_externa` |
| Administração, usuários, papéis, RLS, storage e integrações | `/administracao` | `pronto_para_confirmacao_externa` |

## Ações externas (confirmação final explícita)

enviar_email, enviar_whatsapp, enviar_mensagem, enviar_contrato, solicitar_assinatura, emitir_cobranca, enviar_cobranca, criar_ou_alterar_link_asaas, registrar_pagamento, publicar_no_app_cliente, pesquisar_externamente, enviar_pedido_instituicao, criar_procuracao, agir_em_nome_do_cliente, aplicar_migration_producao, restaurar_backup, excluir_registro_ou_versao.
