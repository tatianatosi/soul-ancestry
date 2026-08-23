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
