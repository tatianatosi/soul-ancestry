# Varredura Final, Autonomia da Proprietária e Plano de Saneamento (v1.0)

Leitura + correções seguras. Nenhuma exclusão, mesclagem, reatribuição ou ação
externa foi executada.

## 1. Classificação por área

Legenda: (1) funciona e persiste · (2) só interface · (3) bloqueado por gate interno ·
(4) depende de confirmação externa · (5) duplicado/órfão · (6) risco DEMO ·
(7) falta teste/RLS/auditoria.

| Área | Classificação | Observação |
| --- | --- | --- |
| Planejador / tarefas | 1 | `tarefas`, `planner_tarefas` com RLS e auditoria |
| Leads, calls, proposta, escopo | 1 | Máquina de estados comercial persistida |
| Catálogo, SKU, preço, condição | 1 + 3 | 113 SKUs; preços não homologados seguem em gate, superável por decisão auditada |
| Pessoas, família, dependentes, representação | 1 | Núcleo Silveira/Friedmann-Reimer canônico |
| Casos, dossiês, documentos, jornada, fechamento | 1 | 9 gates de fechamento calculados no banco |
| Pesquisa, fontes, evidências, achados, hipóteses | 1 + 4 | Pesquisa externa exige confirmação |
| Contratos, OS, Anexos I–V, prévias, versões | 1 + 4 | Corpo fixo versionado; assinatura é externa |
| Financeiro, faturas, pagamentos, Asaas | 1 + 4 | Emissão/cobrança/pagamento externos travados por confirmação |
| App Cliente, projeções, sanitização | 1 + 4 | Publicação exige confirmação; DEMO bloqueado |
| Painel Hoje, filas, exceções, sinais, atalhos | 1 | 7 blocos na ordem exigida, item único por registro |
| Papéis, RLS, auditoria, versionamento | 1 | 520 policies, 799 triggers, auditoria append-only |
| Massa DEMO/TESTE | 6 → corrigido | `CA-TESTE-VAL-2026-001` tinha `demo=false`/`dados_teste=false`; agora é filtrado por rótulo |

## 2. Matriz de poder da Proprietária Administradora

| Área | Pode internamente | Exige confirmação externa |
| --- | --- | --- |
| Planejador/fila | responsável, prazo, prioridade, próxima ação, etapa | — |
| Comercial | corrigir proposta, escopo, preço, condição, aprovar internamente | enviar proposta/contrato |
| Catálogo | homologar SKU e condição, resolver divergência | — |
| Pessoas/família | corrigir pessoa, dependente, representação, vínculos | procuração |
| Casos | avançar fase, assumir pendência, arquivar com motivo | publicação no App Cliente |
| Pesquisa | validar internamente, versionar, derivar | pesquisa/pedido a instituição |
| Contratual | preparar contrato, OS, anexos, prévia, congelar versão interna | envio e assinatura |
| Financeiro | corrigir vínculo e previsão interna | emitir/enviar cobrança, Asaas, pagamento |
| App Cliente | aprovar projeção internamente | publicar |
| Governança | ver auditoria, pendências, arquivados | exclusão definitiva |

## 3. Gates internos e como são superados

Estados: `atende_regra`, `pendente_bloqueante`, `superado_por_decisao_proprietaria`.
O gate continua calculado e visível; a pendência original é preservada; o override
grava autora, papel, motivo (mínimo 10 caracteres), fonte, valor anterior/novo,
data/hora e `event_id` em `owner_override_events` (append-only).

| Gate | Avanço interno máximo |
| --- | --- |
| aprovação | `aprovado_internamente` |
| OS final | `os_interna_registrada` |
| congelamento | `versao_congelada_internamente` |
| assinatura | `aguardando_confirmacao_externa` |
| financeiro | `aguardando_confirmacao_externa` |
| portal/onboarding | `aguardando_confirmacao_externa` |

Override nunca executa ação externa: se o gate ou o avanço corresponde a uma ação
externa, a validação recusa e remete à janela final de confirmação.

## 4. Ações externas — janela final

Campos obrigatórios agora validados (a ação é recusada sem qualquer um deles):
ação, organização, caso, destinatário, conteúdo/documento, valor e moeda, anexos,
dados que serão enviados, impacto, aviso de irreversibilidade, motivo da confirmação
e checkbox manual. Só então o botão final é habilitado. Nada foi executado nem simulado.

## 5. Matriz do caso Ana Luiza

| Dimensão | Registro canônico |
| --- | --- |
| Pessoa | `Ana Luiza Gomes Silveira Rodrigues` (`clientes`, real, `demo=false`) |
| Núcleo | `a11a0000-…-0000000000f1` — Núcleo familiar Silveira / Friedmann-Reimer |
| Caso | `a11a0000-…-000000000002` — `CA-CID-AT-FAM-2026-001`, fase `preparacao`, `piloto=true` |
| Aliases já resolvidos | `CA-AUT-ANALUIZA-FAM-2026-001`, `CA-2026-ANA-001` → caso canônico |
| Relacionados | proposta aprovada, contrato `a11a…00c1`, plano, onboarding, tarefas, documentos, pesquisa |

Divergências abertas (sem correção automática):

1. `casos.CA-CID-AT-2026-002` (tabela legada de mockup) representa a mesma demanda,
   com canvas publicado e juízo de mérito textual — candidato a arquivamento + alias.
2. Lead `CA-LEAD-2026-0002` está marcado `dados_teste=true` mas aponta para o núcleo real.
3. Contrato real com `proposal_id` nulo apesar de existir proposta aprovada.
4. “piloto real” aparece no título do caso; deve ser rótulo/selo, não nome.

## 6. Plano de saneamento (aguarda confirmação única em lote)

| # | Registro | Ação proposta | Preserva |
| --- | --- | --- | --- |
| S-01 | `casos.CA-CID-AT-2026-002` | arquivar com motivo e registrar código como alias do caso canônico | id, histórico, canvas |
| S-02 | `crm_casos.CA-CID-AT-FAM-2026-001` | retirar “piloto real” do título, manter `piloto=true` como selo | id, códigos legados |
| S-03 | contrato `a11a…00c1` | vincular `proposal_id` à proposta aprovada | versões e assinaturas |
| S-04 | lead `CA-LEAD-2026-0002` | desvincular do núcleo real, mantendo marcação de teste | lead e auditoria |
| S-05 | `crm_casos.CA-TESTE-VAL-2026-001` | marcar `dados_teste=true` no banco (hoje só filtrado por rótulo) | registro e cadeia |

Correções seguras já aplicadas nesta entrega: filtro determinístico de DEMO/TESTE por
rótulo em toda exibição derivada, janela de confirmação externa completa e recusa
automática quando faltar campo obrigatório.

## 7. Itens DEMO/TESTE

| Registro | Marcação | Situação |
| --- | --- | --- |
| `CA-DEMO-IT-2026-001` (família Prade) | `demo=true` | oculto por padrão |
| Leads `CA-LEAD-2026-0001/0002/0003/0004/0005` | `dados_teste=true` | ocultos por padrão |
| Clientes Giovanna Prade / João Marcelo Moraes | `demo=true` | ocultos por padrão |
| `CA-TESTE-VAL-2026-001` + cliente “TESTE - Validacao Motor Contratual” | booleano falso | oculto por rótulo; correção de coluna em S-05 |

Nenhum item DEMO/TESTE é publicável no App Cliente: a confirmação externa recusa
`publicar_no_app_cliente` quando `dados_teste=true`.
