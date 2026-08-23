# Fase A — Auditoria de UX e métricas do Desk Intelligence (read-only)

Versão 1.0 — 23/08/2026. Nenhuma alteração de código, dados, RLS, integrações ou paleta foi executada.

## 1. Superfícies mapeadas

| Superfície | Arquivo | Papel atual |
|---|---|---|
| Painel Hoje (operacional) | `src/components/painel/painel-dia.tsx` (831 linhas) + `src/lib/painel-dia.ts` | Entrada operacional única |
| Painel Desk Hoje (variante) | `src/components/painel/painel-desk-hoje.tsx` | Duplica leitura de fila |
| Painel Hoje (legado) | `src/components/painel/painel-hoje.tsx` | Legado, mesmo nome humano |
| Métricas | `src/routes/_authenticated/metricas.tsx` (~19 cartões) | Histórico + decisão misturados |
| Indicadores de governança | `src/lib/indicadores-governanca.ts` (544 linhas) | Fonte de risco/auditoria |
| Indicadores de marketing/funil | `src/lib/indicadores-marketing.ts` (13 eventos) | Funil comercial |
| Alertas derivados | `src/lib/alertas-derivados.ts` (9 geradores) | Exceções read-only |
| Prioridade derivada | `src/lib/prioridade-matriz.ts` | Sinal, não fila |
| Mockup histórico (14 abas) | `/referencia-mockup-desk` | Somente referência interna |

Rotas internas mapeadas: 76 arquivos em `src/routes/_authenticated`, organizados nos 7 grupos aprovados.

## 2. Duplicações confirmadas (KPI repetido como número independente)

| Indicador | Aparece em | Fonte canônica proposta |
|---|---|---|
| Ações vencidas / vence hoje | Painel Hoje (`CARDS_HOJE`), Painel Desk Hoje, Métricas | `painel-dia.ts` → fila priorizada |
| Sem responsável | Painel Hoje (exceções), Alertas (`Caso sem responsável`, `Tarefa sem responsável`), Casos 360 | `alertas-derivados.ts` |
| Contratos enviados / pagamentos aguardados | Painel Hoje, Contratos, Financeiro | cadeia de formalização |
| Divergência de catálogo | Alertas, Divergências de catálogo, Conciliação | `conciliacao-catalogo` |
| Pendência documental | Painel Hoje, Pesquisa, Evidências | pesquisa/documentos |
| Funil comercial (13 eventos) | Métricas, Conversão, Painel Hoje | `indicadores-marketing.ts` |

Três componentes distintos ("Painel Hoje", "Painel Desk Hoje", "Painel Hoje legado") competem pelo mesmo nome humano — principal causa da perda de descoberta.

## 3. Proposta (sem implementar)

### 3.1 Painel Hoje — 5 blocos apenas
Fila priorizada · Exceções que exigem proprietária · Trabalho comercial de hoje · Casos por prazo · Encontrar no Desk.
Regra de deduplicação já existente (`filtrarParaFila`) passa a ser obrigatória para todos os blocos; um objeto aparece uma única vez.

### 3.2 Teto de 5 indicadores por área

| Área | Indicadores visíveis | Fonte |
|---|---|---|
| Hoje | vencidos, vence hoje, sem responsável, exceções críticas, SLA em risco | tarefas/casos/alertas |
| Comercial | novos leads, tempo de 1ª resposta, calls agendadas, propostas ativas, confirmação formal pendente | leads/eventos/calls |
| Casos | casos por fase, próximos marcos, bloqueios, prioridade, entregas pendentes | casos/gates/entregas |
| Pesquisa | pendências documentais, evidências a validar, solicitações internas, achados a revisar, relatórios pendentes | pesquisa/evidências |
| Financeiro | condições pendentes, faturas internas, despesas a aprovar, divergências, bloqueios de cobrança | financeiro/contrato/gates |
| Governança | acessos pendentes, decisões humanas, inconsistências, integrações bloqueadas, alertas de risco | auditoria/gates/integrações |

Demais números migram para "Ver detalhes" dentro da própria área, como recorte do indicador canônico (link/etiqueta, nunca contagem própria).

### 3.3 Remoções visuais propostas
- Aposentar visualmente `painel-hoje.tsx` (legado) e `painel-desk-hoje.tsx`, mantendo os arquivos e as rotas.
- Em `metricas.tsx`, reduzir de ~19 cartões para 5 de decisão + bloco "Histórico" recolhido.
- Nenhuma rota removida; nenhuma função histórica perdida.

### 3.4 Rótulos humanos (já parcialmente aplicados)
Radar Interno → `/qualidade` · Validação Jurídica → `/matriz-juridica` · Prioridade dos casos → matriz derivada · Pesquisa Genealógica → grupo de pesquisa.

## 4. Riscos e limites
- Reduzir cartões em `metricas.tsx` altera hábito de leitura: exige aceite explícito.
- Nenhuma alteração toca dados, RLS, autenticação, integrações, regras comerciais ou App Cliente.
- App Cliente permanece isolado: nenhum indicador interno é projetado.

## 5. Aceite necessário para Fase B
Aprovar: (a) teto de 5 métricas por área, (b) aposentadoria visual dos dois painéis redundantes, (c) enxugamento de `metricas.tsx`, (d) tabela de fontes canônicas acima.

## Fase B — Implementação e resultado (23/08/2026)

Executada integralmente. Nenhuma ação externa, alteração de dados reais, migration, mudança de RLS,
autenticação, sessão, permissões, integrações, paleta ou App Cliente. Nenhuma rota, arquivo, componente,
dado ou teste removido.

| Decisão aprovada | Resultado |
|---|---|
| Painel Hoje único em `/painel` com 5 blocos | `painel-dia.tsx` mantém fila priorizada, exceções, comercial, prazos e Encontrar no Desk; deduplicação por precedência preservada |
| Painéis redundantes aposentados visualmente | `painel-hoje.tsx` e `painel-desk-hoje.tsx` só acessíveis por `/historico/painel-hoje` e `/historico/painel-desk-hoje`, fora de menus, com faixa "Visão histórica…" e link para `/painel`; sem redirect |
| Teto de 5 métricas | `/metricas` exibe 5 cartões de decisão; demais em `<details>` "Histórico e análise", fechado por padrão |
| Conversão e saúde comercial | Cards "Funil de conversão" e "Higiene comercial" removidos visualmente de `/metricas` e substituídos pelo link "Conversão e saúde comercial — ver no Comercial"; `/conversao` é a única superfície com número |
| Resumo comercial no Painel Hoje | Frase única "Comercial hoje: X leads aguardando ação", com X definido em `src/lib/comercial-hoje-canonico.ts` e clique para `/conversao` |
| Prioridade | **DIVERGÊNCIA DE PRIORIDADE — DECISÃO HUMANA NECESSÁRIA**: função única (`prioridade-matriz.ts`), mas entradas divergem (Painel Hoje não informa `elegibilidade`), Casos 360 mantém coluna manual em escala urgente/alta/média/baixa e Radar Interno/Qualidade não consome a matriz. Nenhum cálculo alterado; diferenças documentadas em `docs/ux/CA-UX-03_Fontes_Canonicas_Indicadores.md` |
| Financeiro | Resumo preservado no Painel Hoje (`data-painel-resumo="financeiro"`) com detalhe em `/financeiro`; nenhum gate alterado |

Definição canônica de X: união deduplicada de `calls_hoje`, `propostas_sem_followup` e
`leads_sem_proxima_acao`, com data ≤ hoje+7, excluídos registros já exibidos em filas anteriores e
registros demo quando `incluirDemo=false`.

Lacunas preservadas: radar multi-país, CAC/ROI sem fonte canônica, envio externo de WhatsApp desligado.

### Fase B — reverificação de prioridade e rótulo canônico (23/08/2026)

- Prioridade reauditada superfície a superfície: registrada **DIVERGÊNCIA DE PRIORIDADE — DECISÃO HUMANA NECESSÁRIA**, sem alterar card, cor, badge ou cálculo.
- `/conversao` passou a exibir o rótulo discreto "Fonte canônica de conversão e saúde comercial" (`data-conversao="rotulo-canonico"`), sem tocar máquina de estados, eventos, gates ou regras comerciais.
