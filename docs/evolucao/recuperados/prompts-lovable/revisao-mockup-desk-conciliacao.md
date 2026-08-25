# Revisão do mockup do Desk Intelligence — conciliação inicial

**Data:** 23 de agosto de 2026  
**Base disponível nesta sessão:** `CA-CONN-01_base_existente_desk.md`, `Item-AppClienteFase1Base-AppIntelligenceDeskv2Prem.csv`, memória de projeto e devolutivas fornecidas pela proprietária.

> Limite da evidência: os PDFs/mockups citados pela proprietária não foram recuperados integralmente nesta leitura. Portanto, esta versão não afirma que uma aba foi removida; usa os estados **não comprovado**, **mapeado por relato** ou **documentado**.

## 1. Princípios originais recuperados

O documento de conexão do Desk estabelece que a evolução deve ser incremental: não deletar, substituir, renomear ou recriar telas, rotas, componentes, dados demonstrativos, cards, estilos, integrações ou módulos existentes. App Cliente e Desk devem utilizar a mesma camada de caso por `caseId`, com o Desk adicionando somente campos internos opcionais e preservando o App Cliente sanitizado.

A comparação App Cliente Fase 1 versus App + Intelligence Desk v2 Premium diferencia claramente:

- App Cliente: linha do tempo simples, documentos com status e instruções, atualizações essenciais/WhatsApp, radar de país básico e árvore simplificada.
- Desk Premium: insights adicionais, priorização de riscos, relatórios consolidados, radar multi-país com índice de elegibilidade, árvore avançada, matriz de fontes e alertas.

## 2. Mapa de capacidades recuperado

| Capacidade | Superfície original esperada | Evidência atual | Estado | Destino recomendado na arquitetura de 8 abas |
|---|---|---|---|---|
| Visão diária / prioridades | Desk | Painel Hoje mencionado em devolutivas | Documentado por memória | Hoje |
| CRM, leads e Calls Discovery | Desk | Fluxo comercial e `/calls` documentados | Documentado por memória | Comercial |
| Casos e contexto 360 | Desk | Casos 360 documentado | Documentado por memória | Casos |
| Pesquisa, fontes e evidências | Desk contextual por caso | G-04 e cadeia de pesquisa documentados | Documentado por memória | Casos > Pesquisa Genealógica e Evidências |
| Radar multi-país / elegibilidade | Desk Premium | CSV histórico cita radar multi-país e índice | Documentado em arquivo | Casos > Elegibilidade e países; sinal em Hoje |
| Radar de prioridade | Desk | Proprietária relata perda visual/funcional | Mapeado por relato | Hoje + Casos |
| Jurídico / validação | Desk | Proprietária relata perda visual/funcional | Mapeado por relato | Governança, com links contextuais em Comercial e Casos |
| Radar Interno | Desk | Proprietária relata perda visual/funcional | Mapeado por relato | Governança |
| Alertas e matriz de fontes | Desk Premium | CSV histórico menciona; G-04 inclui alertas/histórico | Parcialmente documentado | Hoje para ação; Governança para regras/histórico |
| Documentos | Ambos | App: lista/status; Desk: risco/comentário | Documentado em arquivo | Cliente no App; Casos no Desk |
| Entregas / relatórios | Ambos | Módulo consultivo e relatórios documentados | Documentado por memória | Casos e Cliente |
| Comunicação / WhatsApp | Ambos | App: atualizações essenciais + WhatsApp; Desk: relatórios consolidados | Documentado em arquivo | Cliente: espelho/previsão; Comercial: registro do lead; envio separado por gate |
| Financeiro | Desk | Fluxo financeiro/governança citado em devolutivas | Documentado por contexto | Financeiro |
| Biblioteca, homologações e integrações | Desk | Módulos atuais relatados | Mapeado por relato | Governança |
| Equipe, perfis e Modo Proprietária | Desk administrativo | Acesso administrativo documentado | Documentado por memória | Menu da conta / Modo Proprietária |

## 3. Conciliação de arquitetura: 14 abas para 8

| Grupo de origem / função | Destino de navegação | O que deve ficar contextual | Regra anti-sobreposição |
|---|---|---|---|
| Painel Hoje, prazos, prioridade e atalhos | Hoje | Filtros por urgência, proprietário, SLA e caso | Um objeto aparece uma vez na fila; prioridade é sinal, não uma segunda tarefa |
| CRM, Leads, Calls, propostas, conversão e formalização | Comercial | Linha do tempo comercial e saúde comercial por lead/caso | Comercial não cria fontes paralelas de contrato, cobrança ou caso |
| Casos 360, núcleos, pessoas, documentos, entregas | Casos | Pesquisa, árvore, elegibilidade, países, documentos e entregas por caso | Caso é o contexto canônico; campos internos não vão ao cliente |
| Pesquisa, evidências, fontes, achados, relatórios | Casos > Pesquisa Genealógica e Evidências | Nove seções internas e cadeia de pesquisa | Não vira aba principal; pesquisa não publica automaticamente |
| App Cliente, checklist, publicações e preview | Cliente | Espelho sanitizado por caso e papel; comunicações como histórico | Preview não é Desk disfarçado e não usa dados internos |
| Financeiro, despesas, cobranças, condições | Financeiro | Conciliação e detalhes por caso | Não libera cobrança sem gates comerciais/jurídicos |
| Checklist semanal, tarefas, SLA, capacidade | Operação | Rotina por responsável e por equipe | Tarefa/prazo não se duplica em Alertas |
| Jurídico, Radar Interno, alertas, integrações, biblioteca, homologação e auditoria | Governança | Alertas e regras, histórico, validação jurídica, matriz e controles | Alertas são derivados; Jurídico bloqueia/valida, não vira atalho comercial |
| Equipe, papéis, preferências e Modo Proprietária | Menu administrativo | Configurações de conta e segurança | Não precisa ser aba principal |
| Marketing, campanha, conteúdo e atribuição | Marketing contextual dentro de Comercial por enquanto | Origem, UTM, canal, CAC e conteúdo | Não duplicar lead; Marketing entrega lead qualificado para Comercial |

> Observação de decisão: se a proprietária exigir Marketing como aba principal, a arquitetura passa a 9 áreas. Para manter o máximo de 8, Marketing deve iniciar como módulo contextual de Comercial e evoluir para aba apenas se houver volume operacional que justifique.

## 4. Estado de prompts e lacunas

| ID | Tema | Evidência disponível | Estado |
|---|---|---|---|
| P0.1 | Login proprietária e isolamento App Cliente | Não há devolutiva final anexada nesta sessão | Não comprovado |
| P0.2 | Classificação de dados | Devolutiva recebida: filtros, inventário, 935 testes e build local | Implementado localmente; produção não comprovada |
| P0.3 | Checklist de lançamento controlado | Prompt fornecido; sem devolutiva | Não comprovado |
| P1.1 | Alertas derivados | Prompt fornecido; sem devolutiva | Não comprovado |
| P1.2 | Prioridade no Painel Hoje | Prompt fornecido; sem devolutiva | Não comprovado |
| P2.1 | T1/T2, autoria e consolidação | Prompt fornecido; sem devolutiva | Não comprovado |
| ARQ | Auditoria 14 abas, radar interno, jurídico e prioridade | Pedido atual; sem inventário por código | Pendente |
| MKT | Marketing, aquisição, conteúdo e atribuição | Pedido atual; sem inventário por código | Pendente |

## 5. Correções mínimas pré-lançamento

1. Auditar por rota e guarda se Radar Interno, Jurídico e radar de prioridade existem, foram movidos, ficaram ocultos ou foram removidos.
2. Não consolidar abas antes desse inventário factual.
3. Confirmar no domínio publicado a proteção de dados do App Cliente implementada em P0.2.
4. Tornar visível à proprietária a rota correta de cada função encontrada, sem reestruturar o menu inteiro.
5. Manter envio de WhatsApp, cobrança, assinatura e publicação externa separados do espelho/histórico e sujeitos a gate específico.

## 6. Próxima execução recomendada

Executar uma auditoria read-only no Lovable para inventariar rotas, abas, módulos, guardas e evidências de prompts. Só após o relatório e o aceite da proprietária implementar uma correção mínima de menu/guarda. Não reorganizar o Desk inteiro na véspera do lançamento.
