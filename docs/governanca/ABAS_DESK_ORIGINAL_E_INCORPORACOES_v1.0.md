# Abas do Desk — original aprovado × incorporações posteriores (v1.0)

Somente leitura. Nenhuma aba aprovada é renomeada, removida ou deslocada. Este documento diz **o que já foi incorporado** ao Desk depois do mockup e **em qual aba original cada elemento pode residir**.

## 1. Abas originais do Desk (mockup aprovado — `src/components/desk-app.tsx`)

| # | Aba original | Escopo aprovado |
|---|---|---|
| 1 | Visão Geral | KPIs, funil de leads, alertas de achados, prioridades do dia |
| 2 | CRM vivo | Leads e contatos em movimento |
| 3 | Casos 360 | Ficha operacional do caso |
| 4 | Propostas | Proposta comercial e estados |
| 5 | Go-live | Ativação do caso |
| 6 | Formalização | Contrato, procurações, fontes de pesquisa |
| 7 | Checklist AppCliente | O que o cliente vê / precisa entregar |
| 8 | Financeiro | Receita, cobranças, despesas |
| 9 | Checklist semanal | Rotina operacional |
| 10 | Validação Jurídica | Conferência jurídica interna |
| 11 | Radar Interno | Sinais e riscos internos |
| 12 | Alertas | Pendências e SLA |
| 13 | Integrações | Conectores e automações |
| 14 | Biblioteca Mestre | Curadoria e conhecimento |

## 2. Rotas incorporadas ao Desk depois do mockup (`src/components/saas/shell.tsx`)

30 itens hoje na navegação lateral do Desk Intelligence: `/painel`, `/leads`, `/clientes`, `/acessos-portal`, `/casos`, `/piloto`, `/piloto-ana`, `/conversao`, `/importacoes`, `/pesquisa`, `/pesquisa-modulo`, `/evidencias`, `/tarefas`, `/ops`, `/ops-excecoes`, `/propostas`, `/contratos`, `/contrato-parametros`, `/matriz-juridica`, `/ordens-servico`, `/financeiro`, `/privacidade`, `/atendimento`, `/qualidade`, `/integracoes`, `/biblioteca`, `/governanca/inventario-recuperacao`, `/governanca/decisoes`, `/governanca/matriz-conformidade`, `/etiquetas`, `/relatorios`, `/configuracoes` (+ `/equipe` e `/auditoria` para admin).

## 3. De-para — onde cada elemento pode residir na aba original

| Aba original | Elementos que podem residir nela | Origem incorporada |
|---|---|---|
| Visão Geral | Painel Hoje, Painel Desk Hoje, contadores de leads/clientes/casos/evidências/tarefas, funil e CAC | `/painel`, `/conversao` |
| CRM vivo | Workbench de leads com eixo comercial e eixo formalização, higiene de SLA, clientes, núcleos familiares | `/leads`, `/clientes` |
| Casos 360 | Ficha canônica em 9 abas internas: Visão Geral, Caso, Pessoas, Produto/Trilha, Próxima ação, Etiquetas, Onboarding, Comercial, Técnico; linha do tempo, blueprint, fila Drive, dependentes | `/casos`, `/casos/$id`, `/etiquetas`, `/piloto`, `/piloto-ana` |
| Propostas | Ciclo de vida da proposta, versionamento, completude Canva (páginas 1–7), escopo homologado | `/propostas` |
| Go-live | Checks de ativação, onboarding do caso, provisionamento de dossiê, acessos ao portal | `/onboarding/$id`, `/acessos-portal` |
| Formalização | Preparação contratual, parâmetros parametrizáveis, gates de formalização, preço canônico, anexos e assinaturas | `/contratos`, `/contrato-parametros`, `/casos/$id/contrato/preparar`, `/ordens-servico` |
| Checklist AppCliente | Projeção autorizada ao cliente, documentos pendentes, atendimento e mensagens | `/atendimento`, `/privacidade` |
| Financeiro | Eventos financeiros, despesas de terceiros, preços de SKU homologados, faturas | `/financeiro` |
| Checklist semanal | Desk Operacional (kanban, SLA, microentregas), tarefas, exceções operacionais | `/ops`, `/ops-excecoes`, `/tarefas` |
| Validação Jurídica | Matriz jurídica interna (12 temas), representação de dependentes, cláusulas de não garantia | `/matriz-juridica` |
| Radar Interno | Radar de eixos, riscos internos, qualidade e bloqueios do caso-piloto | `/qualidade` |
| Alertas | Alertas de caso, pendências de gate, fila de comunicação (sem envio automático) | derivado de `case_alerts` |
| Integrações | Centro de integrações, importações e migração de legado, deduplicação | `/integracoes`, `/importacoes` |
| Biblioteca Mestre | Governança, decisões operacionais, inventário e recuperação, matriz de conformidade, auditoria, equipe/papéis, configurações | `/biblioteca`, `/governanca/*`, `/auditoria`, `/equipe`, `/configuracoes` |

## 4. Sem aba original correspondente (exigem decisão humana)

| Elemento incorporado | Situação |
|---|---|
| Pesquisa genealógica e módulo de evidências (`/pesquisa`, `/pesquisa-modulo`, `/evidencias`) | Existe no App Cliente como Árvore/Radar, mas o Desk aprovado não tem aba de pesquisa dedicada. Candidatos: subaba de Casos 360 ou nova aba aprovada. |
| Relatórios e Studio de Devolutivas (`/relatorios`, `/studio-devolutivas`) | Hoje fora das 14 abas. Candidato: subaba de Casos 360 ou Biblioteca Mestre. |
| Conversão e marketing (`/conversao`) | Pode ficar como bloco da Visão Geral ou virar aba própria. |

## 5. Regra

Enquanto não houver decisão humana registrada, os itens da seção 4 permanecem como rotas laterais e **não** substituem nenhuma das 14 abas aprovadas. Qualquer reorganização deve ser registrada na matriz de conformidade antes de alterar a navegação.
