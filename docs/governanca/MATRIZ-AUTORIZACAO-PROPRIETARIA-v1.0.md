# Matriz de autorização da Proprietária Administradora — v1.0

Fonte executável: `src/lib/varredura-autorizacoes.ts` (renderizada em `/modo-proprietaria`).
Nenhum documento, dado, comunicação, cobrança, assinatura, pagamento, publicação, pesquisa externa ou integração foi executado nesta varredura.

## Princípio

- **Interno**: a proprietária (papel `admin`) executa e autoriza tudo por decisão humana auditada, mesmo com pendências. Gates permanecem visíveis, nunca impeditivos.
- **Externo**: só ocorre após confirmação final explícita, com janela que lista ação, destinatário, conteúdo, valor, anexos, dados enviados, impacto e aviso de irreversibilidade.

## Áreas canônicas varridas (12)

| Área | Rota | Interno liberado | Externo com confirmação |
|---|---|---|---|
| Leads e Discovery | /leads | criar/editar lead, avançar Discovery incompleto | WhatsApp |
| Proposta e condição comercial | /propostas | corrigir escopo/preço/SKU, aprovar com pendências, homologar condição | envio ao cliente |
| Catálogo e SKUs | /catalogo | homologar SKU, resolver divergência de preço | — |
| Contrato, versões e Anexos I–V | /contratos | gerar versão final com parâmetros pendentes, prévia interna | enviar contrato, solicitar assinatura |
| Ordens de serviço | /ordens-servico | criar/corrigir OS e anexos, aprovar com pendências | — |
| Onboarding e gates | /casos | liberar onboarding com gates assumidos, registrar exceção | — |
| Casos, planejador e tarefas | /tarefas | avançar caso/tarefa, editar fila, responsáveis e prazos | — |
| Pesquisa e evidências | /pesquisa | avançar pesquisa, evidências e microentregas | pesquisa externa, pedido a instituição |
| Documentos e acervo | /evidencias | criar sem arquivo, anexar depois, reclassificar | liberar ao cliente |
| Financeiro | /financeiro | corrigir parcelas, valores e vencimentos internos | emitir cobrança, registrar pagamento, link de pagamento |
| App Cliente e projeções | /acessos-portal | aprovar projeção interna | publicar no App Cliente |
| Governança e auditoria | /auditoria | ver todos os estados, consultar arquivados | excluir registro ou versão |

## Registro

Toda decisão interna grava em `audit_logs` e, quando assume pendência, em `owner_override_events` (append-only, com ator, papel, organização, entidade, antes/depois, motivo e origem). Ações externas exigem motivo e confirmação manual antes de qualquer execução.

## Verificação automatizada

`src/lib/__tests__/varredura-autorizacoes.test.ts` garante que:
- nenhuma ação interna bloqueia o avanço (`bloqueiaInterno === false` em 100%);
- toda área tem pelo menos uma ação interna liberada;
- toda ação externa mapeada pertence ao catálogo canônico `ACOES_EXTERNAS` e exige confirmação final.
