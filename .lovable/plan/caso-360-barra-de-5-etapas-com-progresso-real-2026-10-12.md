# Caso 360 — barra de 5 etapas com progresso real

## Onde
Na tela oficial do Caso 360 (`/casos/$caseId`), seção Visão. A rota `/admin/desk/caso360` não existe e não será criada.

## O que é
Uma barra só de leitura com 5 etapas. Cada etapa é calculada a partir das verificações de ativação que já existem no caso (14 itens já registrados). Nenhum gate, tabela ou vocabulário novo é criado.

| Etapa | Itens existentes que contam |
|---|---|
| Diagnóstico | Cliente identificado, Consentimento, Núcleo familiar conferido, Dossiê-mãe criado |
| Documentação | Checklist documental e plano preparados, Escopo definido |
| Jurídico | Proposta aprovada, Contrato assinado (ou isenção autorizada) |
| Financeiro | Pagamento confirmado na fonte transacional (ou condição autorizada) |
| App Cliente | Ambiente e nível de acesso definidos, Aprovação interna de ativação |

Progresso = itens satisfeitos ÷ itens da etapa, com selo em texto: Concluído, Em andamento, Aguardando. Clicar leva à seção do Caso 360 onde o item se resolve (preserva o caso).
Itens não cobertos (ordem de serviço, responsável, primeira tarefa) seguem no checklist de ativação atual.

## Radar e Cockpit
- Radar (`/qualidade`): coluna "Etapa atual" por caso, mesma regra.
- Painel Hoje (`/painel`): sem novo KPI (já há 4); a fila de exceções passa a citar a etapa travada.

## Fora do escopo
Sem migration, RLS, marcar etapa manualmente, cobrança ou publicação.

## Técnico
Leitura via a função existente `case_activation_gates(_case)`; agrupamento num único helper em `src/lib` reutilizado por Caso 360, Radar e Painel. Testes do helper + capturas 1440/375.
