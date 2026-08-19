# Arquitetura de SKU, Ciclo de Vida e Microentregas

**Status:** arquitetura operacional a reconciliar com catálogo e implementação vigente.

## Princípios

1. SKU é identificador interno; não é a experiência do cliente.
2. O cliente vê etapa, entrega, pendência, evidência e próximo passo.
3. O ciclo de vida comercial deve separar proposta, aceite, contrato, pagamento, onboarding, execução, pausa, encerramento e continuidade.
4. Nenhum preço, link, desconto, condição ou escopo entra em automação sem fonte aprovada.
5. Microentregas existem para tornar o avanço perceptível, sem gerar overdelivery ou promessa indevida.

## Ciclo de vida do caso/oferta

| Estado | Definição operacional | Gatilho de entrada | Saída permitida | Cliente vê | Backoffice registra |
|---|---|---|---|---|---|
| Descoberta | Interesse e dados mínimos recebidos | Formulário, WhatsApp ou indicação | Triagem, call ou encerramento | Próxima interação | Origem, consentimento e dados mínimos |
| Diagnóstico | Leitura inicial sob limites explícitos | Dados mínimos e análise humana | Proposta contextual, pesquisa ou encerramento | Síntese, checklist e próximo passo | Hipóteses, riscos e evidências |
| Proposta | Escopo apresentado | Decisão comercial humana | Aceite, revisão, arquivo ou perda | Próxima ação combinada | Versão, escopo, validade e dados de pré-carga |
| Contrato | Instrumento em preparação/assinatura | Aceite e dados exigidos | Assinado, revisão ou cancelamento | Ação documental pertinente | Cláusulas, versão, responsáveis e exceções |
| Pagamento | Condição financeira em confirmação | Contrato/condição aprovada | Confirmado, pendente, renegociação ou cancelamento | Orientação contextual | Valor aprovado, link oficial e conciliação |
| Onboarding | Caso e grupo familiar organizados | Primeira condição de avanço aprovada | Documentos, pesquisa ou execução | Próximos passos e checklist | Ficha familiar, acesso, pendências e consentimentos |
| Execução | Escopo contratado em andamento | Evidências e condições mínimas | Marco seguinte, pausa ou encerramento | Entrega atual e pendência | Fontes, tarefas, responsáveis e risco |
| Pós-cidadania/continuidade | Necessidades posteriores habilitadas por contexto | Evento validado e escopo aprovado | Registro, renovação, legado ou encerramento | Próximo documento/benefício | Escopo, elegibilidade operacional e condição comercial |

## Microentregas por etapa

| Etapa | Microentrega mínima | Limite de comunicação |
|---|---|---|
| Descoberta | Recebimento confirmado e orientação de próximo passo | Não concluir elegibilidade. |
| Diagnóstico | Síntese inicial, lacunas e checklist mínimo | Não prometer rota, prazo ou resultado. |
| Proposta | Escopo e passos seguintes contextualizados | Não usar preço/link não reconciliado. |
| Onboarding | Caso, membros autorizados e checklist ativados | Não solicitar dado excessivo sem finalidade. |
| Execução | Marco, evidência recebida e pendência priorizada | Não prometer emissão ou aprovação. |
| Continuidade | Entrega/benefício contextual liberado | Não criar upsell automático sem condição aprovada. |

## Regras de SKU

- Código canônico, nome comercial, escopo, preço, link e microentregas são campos distintos.
- Uma pré-carga por proposta nunca cria ou aprova SKU.
- Código proposto por país ou pacote fora do catálogo aprovado deve ser marcado como proposta e não pode virar cobrança automática.
- Versões `-OLD`, itens arquivados e duplicidades permanecem rastreáveis, mas não são reexpostos por padrão.
- Componentes internos podem compor uma entrega sem aparecer como produto separado para o cliente.

## Relação com implementação recente

A correção do motor contratual, a regra de despesas, a pré-carga via proposta, a estrutura familiar e a coerência país/canônico exigem que o ciclo de vida seja tratado como modelo único compartilhado por app, CRM, proposta, contrato e dados.
