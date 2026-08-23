# CA-UX-03 — Fontes canônicas de indicadores (Fase B)

Versão 1.0 — 23/08/2026. Registro declarativo espelhado em `src/lib/fontes-canonicas-indicadores.ts`.
Regra geral: cada indicador tem **uma única superfície que conta**. As demais exibem etiqueta ou link.
Teto: **máximo de cinco métricas principais por grupo** (`TETO_METRICAS_PRINCIPAIS = 5`).

| indicador | grupo | tipo | fonte canônica | fórmula/regra | recorte | responsável | rota/ação | onde pode contar | onde só aparece como etiqueta/link | confiança | observação |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Vencidos e vence hoje | Hoje | decisão | `src/lib/painel-dia.ts` (fila priorizada) | tarefas e marcos com prazo < hoje (vencido) ou = hoje, após `filtrarParaFila` | dia corrente | responsável do registro | `/painel` | `/painel` | `/metricas`, `/leads`, `/casos`, `/tarefas` | confirmado | um objeto aparece uma única vez na fila |
| Sem responsável | Hoje | decisão | `src/lib/alertas-derivados.ts` | casos e tarefas ativos com `responsavel_id` nulo | estado atual | proprietária / operações | `/painel` | `/painel` | `/casos`, `/tarefas`, `/metricas` | confirmado | alerta derivado, some ao atribuir responsável |
| Leads aguardando ação | Hoje | decisão | `src/lib/comercial-hoje-canonico.ts` sobre `comercialHoje` | união deduplicada de `calls_hoje` + `propostas_sem_followup` + `leads_sem_proxima_acao`, data ≤ hoje+7, sem itens já exibidos em filas anteriores; demo fora por padrão | hoje até hoje+7 | comercial | `/conversao` | `/painel` | `/conversao`, `/metricas`, `/leads` | confirmado | resumo comercial único do Painel Hoje |
| Contratos enviados e pagamentos aguardados | Contratos e financeiro | decisão | cadeia de formalização (`contracts`, `commercial_conditions`, `service_orders`) | contratos enviados sem assinatura + condições aprovadas sem pagamento confirmado | estado atual | financeiro | `/contratos` | `/contratos` | `/financeiro`, `/painel`, `/metricas` | confirmado | Painel Hoje mostra resumo, detalhe em `/financeiro` |
| Divergência de catálogo | Contratos e financeiro | decisão | `src/lib/conciliacao-catalogo.ts` | itens de escopo com SKU ou preço divergente da fonte homologada | última conciliação | comercial / financeiro | `/conciliacao-catalogo` | `/conciliacao-catalogo` | `/divergencias-catalogo`, `/painel`, `/metricas` | confirmado | bloqueio de emissão de OS permanece no registro canônico |
| Pendência documental | Pesquisa | decisão | pesquisa e evidências | documentos solicitados sem entrega válida, por responsável | estado atual | pesquisador / operações | `/pesquisa-modulo` | `/pesquisa-modulo` | `/evidencias`, `/painel`, `/metricas` | confirmado | `/metricas` exibe apenas link |
| Funil comercial | Comercial | decisão | `src/lib/indicadores-marketing.ts` (13 eventos) | razão entre eventos consecutivos do funil | semana e mês corrente | comercial | `/conversao` | `/conversao` | `/metricas`, `/painel` | confirmado | Fase B: card removido visualmente de `/metricas` |
| Higiene comercial | Comercial | decisão | `indicadores-marketing.ts` + leads (follow-up e próxima ação) | leads ativos sem próxima ação + follow-ups vencidos | estado atual | comercial | `/conversao` | `/conversao` | `/metricas`, `/painel` | confirmado | Fase B: substituído por link único em `/metricas` |

## Painéis aposentados visualmente

| componente | rota histórica | substituído por |
|---|---|---|
| `src/components/painel/painel-desk-hoje.tsx` | `/historico/painel-desk-hoje` | `/painel` |
| `src/components/painel/painel-hoje.tsx` | `/historico/painel-hoje` | `/painel` |

Ambas fora de menus, atalhos, breadcrumbs e descoberta; em acesso direto interno exibem a faixa
"Visão histórica — use Painel Hoje para execução diária." com link para `/painel`. Sem redirect automático.
Rotas internas (`_authenticated`): cliente não acessa.

## Prioridade

Status: **DIVERGÊNCIA DE PRIORIDADE — DECISÃO HUMANA NECESSÁRIA** (nenhum cálculo foi alterado).

Função de cálculo: `src/lib/prioridade-matriz.ts` (`calcularPrioridade`, `matriz-elegibilidade-urgencia-v1.0`).
Não há segunda função de cálculo, mas as **entradas e escalas divergem** entre superfícies:

| Superfície | Função | Entradas informadas | Escala exibida | Divergência |
|---|---|---|---|---|
| Painel Hoje (`painel-dia.tsx`, lista) | `calcularPrioridade` + `etiquetaParaFila` | `tipo`, `id`, `prazo`, `bloqueios`, `responsavel`, `origem` | crítica / atenção / acompanhada / sem dados | **não** informa `elegibilidade`, `diasSemTouchpoint`, `slaStatus` |
| Casos 360 (`casos.index.tsx`, badge/coluna) | `calcularPrioridade` | as acima **+** `hipotese_elegibilidade` e bloqueios de requisitos de ativação pendentes | mesma escala | inclui eixo de elegibilidade ausente no Painel Hoje |
| Casos 360 — coluna `prioridade` (campo manual, legado) | nenhuma (campo do registro) | valor definido pelo operador | urgente / alta / média / baixa | escala distinta, convive com o sinal derivado |
| Radar Interno / Qualidade (`components/qualidade/painel.tsx`) | não usa a matriz | indicadores próprios de qualidade | — | não consome `prioridade-matriz.ts` |

Consequência: o mesmo caso pode aparecer como "acompanhada" no Painel Hoje e "atenção" em Casos 360
quando a hipótese de elegibilidade é o fator decisivo. Decisão humana pendente: (a) igualar as entradas
do Painel Hoje às de Casos 360, (b) manter leituras propositalmente distintas e rotulá-las, ou
(c) aposentar a coluna manual `prioridade`. Até a decisão, nada é alterado.

## Conversão

`/conversao` é a fonte canônica de funil, saúde e higiene comercial, rotulada na própria página com
"Fonte canônica de conversão e saúde comercial". `/metricas` só exibe link; Painel Hoje só exibe a
frase "Comercial hoje: X leads aguardando ação".
