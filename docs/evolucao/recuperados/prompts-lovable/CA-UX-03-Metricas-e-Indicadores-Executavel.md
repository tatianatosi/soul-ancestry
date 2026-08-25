# CA-UX-03 — Métricas e Indicadores Executável

**Versão:** 1.0  
**Data:** 23 de agosto de 2026  
**Estado:** implementado localmente; pendente de validação visual no domínio publicado  
**Escopo:** Desk Intelligence — Fase B de métricas, indicadores, Painel Hoje, Conversão, Alertas, Prioridade e Financeiro

---

## 1. Decisão operacional

A Fase B consolida a visualização de métricas do Desk Intelligence em torno de fontes canônicas. O objetivo é impedir números concorrentes entre Painel Hoje, Métricas, Conversão, Casos e Financeiro.

Regra principal:

> **Painel Hoje avisa; a página canônica explica e permite agir.**

Não houve alteração de dados, migration, RLS, permissões, autenticação, sessão, integrações, ações externas ou deploy.

---

## 2. Estado implementado

| Tema | Estado | Decisão implementada |
|---|---|---|
| Painel Hoje | Implementado | Mantém resumo acionável; não replica funis e painéis detalhados |
| Comercial hoje | Implementado | Uma frase única: `Comercial hoje: X leads aguardando ação` com link para `/conversao` |
| Conversão e saúde comercial | Implementado | `/conversao` é fonte canônica de funil, eventos, saúde e higiene comercial |
| Página Métricas | Implementado | Cinco cartões de decisão; histórico em acordeão fechado por padrão |
| Alertas | Implementado | Derivados; não criam fonte paralela de tarefa, prazo ou status |
| Prioridade | Cálculo único confirmado | `prioridade-matriz.ts` alimenta Painel Hoje e Casos 360 |
| Financeiro | Preservado | Resumo no Painel Hoje; detalhe em `/financeiro` |
| Painéis Hoje legados | Preservados como históricos | Disponíveis em `/historico/*` com banner; sem redirecionamento automático |

---

## 3. Definição canônica: Comercial hoje

### Indicador

`X leads aguardando ação`

### Regra de cálculo

A contagem é a união deduplicada de:

- `calls_hoje`;
- `propostas_sem_followup`;
- `leads_sem_proxima_acao`.

Aplicar:

- data menor ou igual a hoje + 7 dias;
- precedência de fila → exceções → comercial;
- exclusão de itens já exibidos em filas anteriores;
- exclusão de dados demonstrativos quando `incluirDemo=false`.

### Exibição

| Superfície | Uso permitido |
|---|---|
| `/painel` | Única contagem resumida: `Comercial hoje: X leads aguardando ação` |
| `/conversao` | Funil, eventos, saúde comercial, higiene comercial e ação por lead |
| `/metricas` | Link para `/conversao`, sem número, gráfico, percentual ou funil concorrente |

---

## 4. Fonte canônica por família

| Família | Fonte canônica | Resumo permitido | Detalhe e ação | Regra anti-duplicação |
|---|---|---|---|---|
| Conversão / Funil | `/conversao` | Painel Hoje: somente `X leads aguardando ação` | `/conversao` | `/metricas` não apresenta funil/higiene como KPI próprio |
| Saúde / Higiene comercial | `/conversao` | Link em `/metricas` | `/conversao` | Nenhuma segunda contagem em Visão Geral |
| Prioridade | `prioridade-matriz.ts` | Lista em Painel Hoje; badge em Casos | Radar Interno/Qualidade como análise | Mesmo cálculo e mesmas entradas; nenhuma escala paralela |
| Alertas | Funções derivadas sobre objetos canônicos | Sinais de atenção no Painel Hoje | Objeto de origem | Alerta não cria tarefa, prazo, status ou fila própria |
| Financeiro | `/financeiro` | Card/link no Painel Hoje | `/financeiro` | Sem segundo funil ou dashboard financeiro concorrente |
| Histórico | Fonte indicada pelo indicador | Não ocupa fila | `Histórico e análise` em `/metricas` | Acordeão fechado por padrão; não cria ação operacional |

---

## 5. Limites de UX

- Cada grupo do Desk tem no máximo cinco métricas principais.
- Métrica principal precisa indicar fonte, recorte e ação, quando aplicável.
- Métricas históricas ficam em `Histórico e análise`, fechado por padrão.
- Painel Hoje é a única fila diária operacional.
- Um objeto não pode aparecer duas vezes na mesma fila.
- Painéis antigos são históricos: não entram em menu, atalho, busca ou fluxo diário.
- Alertas e prioridade são sinais derivados, não fontes de verdade.

---

## 6. Arquivos implementados

| Arquivo | Alteração |
|---|---|
| `src/lib/comercial-hoje-canonico.ts` | Regra canônica de `X leads aguardando ação` |
| `src/lib/fontes-canonicas-indicadores.ts` | Fonte de Funil comercial; indicadores Higiene comercial e Leads aguardando ação |
| `src/components/painel/painel-dia.tsx` | Resumo comercial único e link a `/conversao`; resumo financeiro preservado |
| `src/routes/_authenticated/metricas.tsx` | Cinco métricas de decisão, link de Conversão e `Histórico e análise` fechado |
| `src/lib/__tests__/ca-ux-03-fase-b.test.ts` | Dezesseis testes de regressão |
| `docs/ux/CA-UX-03_Fontes_Canonicas_Indicadores.md` | Registro detalhado de fontes canônicas |
| `docs/ux/fase-a-auditoria-metricas-desk.md` | Seção Fase B — implementação e resultado |
| `docs/changelog/2026-08-23_CA-UX-03_Fase-B.md` | Changelog da implementação |

---

## 7. Verificações

| Verificação | Resultado |
|---|---|
| Typecheck | Sem erros |
| Testes | 1021 testes passando em 112 arquivos |
| Build | OK |
| Ações externas | Nenhuma executada |
| Dados / migrations / RLS | Nenhuma alteração |
| Deploy | Não executado |

---

## 8. Lacunas preservadas

| Item | Estado | Regra |
|---|---|---|
| Radar multi-país | Ausente | Não simular nem inventar fonte/cálculo |
| CAC e ROI | Sem fonte canônica | Não exibir como métrica operacional até definição de origem e fórmula |
| Integrações externas | Desligadas ou não configuradas | Não inferir prontidão a partir de botões de interface |
| Validação publicada | Pendente | Validar visualmente no domínio publicado com sessão autorizada |

---

## 9. Critérios de aceite contínuo

Antes de alterar indicadores novamente:

1. Identificar a fonte canônica.
2. Registrar fórmula, recorte, responsável e rota de ação.
3. Garantir que não há contagem concorrente.
4. Atualizar `CA-UX-03_Fontes_Canonicas_Indicadores.md`.
5. Criar ou atualizar teste de regressão.
6. Rodar typecheck, testes e build.
7. Obter aceite explícito da proprietária para mudanças estruturais.

---

## 10. Controle de alterações

| Versão | Data | Alteração | Aceite |
|---|---|---|---|
| 1.0 | 23/08/2026 | Consolidação de métricas e indicadores da Fase B | Pendente de aceite da proprietária |
