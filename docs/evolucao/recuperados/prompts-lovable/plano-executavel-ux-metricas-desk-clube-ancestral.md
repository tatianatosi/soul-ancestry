# Plano executável — UX e métricas do Desk Intelligence

**Versão:** 1.0  
**Data:** 23 de agosto de 2026  
**Estado:** proposta operacional para execução controlada

## Problema confirmado

O Desk operacional possui sete grupos de navegação e aproximadamente 75 rotas, enquanto um mockup histórico de 14 abas ainda existe em uma superfície distinta. Isso gerou perda de descoberta: Radar Interno está associado a `/qualidade`, Validação Jurídica está em `/matriz-juridica`, prioridade existe como sinal derivado, e Alertas são derivados; porém esses nomes e destinos não são evidentes no fluxo diário.

O objetivo não é criar um segundo Desk, restaurar o mockup como operação ou adicionar menus. É tornar o Desk atual fácil de entender, reduzir métricas duplicadas e manter uma única fonte de verdade por sinal.

## Arquitetura operacional mantida

1. Visão geral
2. Comercial
3. Casos e núcleos
4. Pesquisa genealógica
5. Contratos e financeiro
6. Governança e biblioteca
7. App Cliente

O Mockup de 14 abas, se exposto, deve ser somente referência histórica interna e nunca fonte operacional.

## Decisões UX

### Painel Hoje

Deve ser a entrada operacional única, com cinco blocos já definidos:

- Fila priorizada: vencidos, hoje e próximos sete dias.
- Exceções que exigem proprietária.
- Trabalho comercial de hoje.
- Casos por prazo.
- Atalhos de descoberta.

Cada objeto só aparece uma vez na fila. Um cartão deve conter caso/lead, motivo, responsável, prazo, prioridade e uma ação que abre o objeto canônico.

### Métricas

Separar métricas de decisão de métricas de histórico:

| Grupo | Até 5 indicadores visíveis | Fonte canônica |
|---|---|---|
| Hoje | vencidos, vence hoje, sem responsável, exceções críticas, SLA em risco | tarefas/casos/alertas derivados |
| Comercial | novos leads, tempo de primeira resposta, calls agendadas, propostas ativas, confirmação formal pendente | leads/eventos de conversão/calls |
| Casos | casos por fase, próximos marcos, bloqueios, prioridade, entregas pendentes | casos/gates/entregas |
| Pesquisa | pendências documentais, evidências aguardando validação, solicitações internas, achados prontos para revisão, relatórios pendentes | pesquisa/evidências/documentos |
| Financeiro | condições pendentes, faturas internas pendentes, despesas aguardando aprovação, divergências, bloqueios de cobrança | financeiro/contrato/gates |
| Governança | acessos pendentes, decisões humanas, inconsistências, integrações bloqueadas, alertas de risco | auditoria/gates/integrações |

Nenhum KPI pode existir em mais de um painel como número independente. Outros locais devem mostrar link, etiqueta ou recorte do indicador canônico.

### Descoberta

Usar nomes humanos e links a rotas existentes:

- Radar Interno para `/qualidade`.
- Validação Jurídica para `/matriz-juridica`.
- Prioridade dos casos para a matriz derivada de prioridade.
- Pesquisa Genealógica para o grupo/rotas de pesquisa.

Adicionar no Painel Hoje um bloco compacto "Encontrar no Desk", apenas com links; ele não cria dados, tarefas nem alertas.

## Implementação em duas fases

### Fase A — auditoria e proposta (read-only)

Mapear todos os cards e KPIs atuais: rota, componente, query/fonte, fórmula, frequência, público, duplicações e ação vinculada. Propor remoções visuais, agrupamentos e rótulos sem implementar.

### Fase B — correção de UX controlada

Após aceite humano:

- preservar as sete áreas e as rotas;
- simplificar o Painel Hoje;
- limitar cada área a cinco métricas principais;
- deslocar métricas secundárias para "Ver detalhes";
- corrigir rótulos e atalhos;
- impedir duplicação de contagem e de filas;
- não alterar dados, bancos, regras comerciais, autenticação, RLS, integrações ou ações externas.

## Critérios de aceite

- Toda métrica tem fonte e fórmula documentadas no código ou tela de ajuda.
- Todo card tem ação, responsável ou explicação de estado vazio.
- Nenhum item se repete em duas filas operacionais.
- Nenhuma função histórica some: funções mudadas possuem atalho e rótulo humano.
- App Cliente continua isolado de qualquer métrica, dado ou controle interno.
- Typecheck, testes relevantes e build passam.
- Nenhuma ação externa, deploy ou alteração de dados é executada sem autorização explícita.
