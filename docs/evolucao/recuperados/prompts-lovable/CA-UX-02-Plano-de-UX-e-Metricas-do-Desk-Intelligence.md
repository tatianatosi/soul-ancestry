# CA-UX-02 — Plano de UX e Métricas do Desk Intelligence

**Versão:** 1.0  
**Data:** 23 de agosto de 2026  
**Estado:** documento de decisão e execução controlada  
**Proprietária:** Clube Ancestral

---

## 1. Finalidade

Este documento registra as decisões de UX, arquitetura de navegação e métricas operacionais do Desk Intelligence do Clube Ancestral.

Ele existe para impedir que decisões aprovadas fiquem apenas em mensagens de chat, sejam perdidas, ou levem à remoção silenciosa de telas, rotas, módulos e capacidades aprovadas.

Este documento **não autoriza automaticamente** deploy, ação externa, alteração comercial, cobrança, contrato, assinatura, publicação, integração ou exclusão de dados.

---

## 2. Problema registrado

O projeto contém duas superfícies diferentes:

1. **Mockup histórico de 14 abas** em `src/components/desk-app.tsx`, destinado a representar a estrutura visual original.
2. **Desk operacional** em `src/components/saas/shell.tsx` e rotas autenticadas, organizado em sete grupos e aproximadamente 75 rotas.

A coexistência sem uma matriz visual de equivalência gerou confusão de descoberta. Capacidades não foram necessariamente removidas, mas podem ter sido movidas, renomeadas, ocultadas em menus, ou deslocadas para rotas internas.

Achados confirmados por auditoria read-only:

- Radar Interno existe no mockup e tem equivalência operacional em `/qualidade`.
- Validação Jurídica existe em `/matriz-juridica`.
- Prioridade dos casos existe como sinal derivado em `src/lib/prioridade-matriz.ts`, Painel Hoje e lista de casos.
- Alertas existem como visão derivada em `src/lib/alertas-derivados.ts`.
- Radar multi-país/índice de elegibilidade é uma lacuna real: não há fonte canônica consolidada definida.
- A proteção P0.2 de classificação de dados foi reportada como aprovada localmente; o teste no domínio publicado ainda exige comprovação externa.

---

## 3. Princípios obrigatórios

### 3.1 Preservação

- Tela aprovada, rota, componente, módulo, dado demonstrativo e fluxo existente não pode ser removido silenciosamente.
- Exclusão física de registros é proibida; arquivamento exige motivo, autor e data.
- O mockup histórico não pode ser reutilizado como segundo Desk operacional.

### 3.2 Fonte canônica

- Cada prazo, tarefa, alerta, prioridade, SLA, responsável, status, métrica e evento possui uma fonte canônica.
- Alertas são derivados e não criam fonte paralela de prazo, tarefa ou status.
- Uma ação no Desk deve abrir ou atualizar o objeto canônico correspondente.

### 3.3 App Cliente

- O App Cliente é uma projeção sanitizada e não é fonte de verdade.
- O cliente recebe somente conteúdo classificado como `real`, autorizado e publicado conforme as regras do portal.
- Hipóteses, evidências internas, fontes, riscos, classificação/origem do dado, notas internas, preços, SKU, documentos privados, gravações e controles administrativos nunca aparecem ao cliente.

### 3.4 Segurança operacional

- Nenhuma integração externa é considerada pronta apenas porque há botão na interface.
- E-mail, assinatura, cobrança, Asaas, WhatsApp e pesquisa institucional dependem de configuração, validação e confirmação contextual.
- Toda alteração estrutural exige evidência, testes, build e aceite explícito da proprietária.

---

## 4. Navegação operacional atual

A estrutura operacional atual é composta por sete grupos:

1. Visão geral
2. Comercial
3. Casos e núcleos
4. Pesquisa genealógica
5. Contratos e financeiro
6. Governança e biblioteca
7. App Cliente

O limite atual de sete grupos deve ser preservado antes do lançamento. Nenhuma consolidação de sete para oito grupos pode ocorrer sem atualização da Matriz de Equivalência CA-UX e aceite explícito da proprietária.

---

## 5. Arquitetura UX por grupo

| Grupo | Objetivo | Conteúdos e módulos contextuais | Regra de UX |
|---|---|---|---|
| Visão geral | Decidir e executar o dia | Painel Hoje, filas, exceções, prioridade, atalhos, métricas resumidas | Um item aparece uma única vez na fila operacional |
| Comercial | Atrair, qualificar e converter | Marketing e aquisição, origem do lead, CRM, leads, calls, propostas, conversão, follow-up, clientes | Aceite verbal não libera contrato, assinatura, cobrança ou onboarding |
| Casos e núcleos | Operar dossiês e jornadas | Casos 360, núcleos, pessoas, tarefas, operações, qualidade, onboarding, piloto, entregas | Caso é o contexto canônico da operação |
| Pesquisa genealógica | Organizar inteligência técnica | Plano de ação, fontes, evidências, documentos, privacidade, ficha piloto, Assistente IA, relatórios e pendências | Achado não é publicado automaticamente; requer validação humana |
| Contratos e financeiro | Controlar escopo e condição | Contratos, anexos, origem de escopo, catálogo, conciliação, parâmetros, financeiro | Gate comercial e jurídico impede emissão/cobrança indevida |
| Governança e biblioteca | Regras, risco e memória institucional | Modo Proprietária, Biblioteca Mestre, mensagens, catálogo, Jurídico, auditoria, inventário, integrações | Não é fila operacional paralela; decisões e exceções precisam ser rastreáveis |
| App Cliente | Controlar acesso e projeção ao cliente | Acessos, atendimento, publicação autorizada, projeção sanitizada, solicitações de documento, futuro preview read-only | Cliente nunca recebe conteúdo ou controle interno |

---

## 6. Painel Hoje

O Painel Hoje é a entrada operacional diária. Deve conter somente cinco blocos:

1. **Fila priorizada:** vencidos, hoje e próximos sete dias.
2. **Exceções que exigem a proprietária:** bloqueios, dados insuficientes, decisões humanas e acessos.
3. **Trabalho comercial de hoje:** leads, calls, follow-up e confirmação formal.
4. **Casos por prazo:** apenas itens com atenção ou criticidade.
5. **Encontrar no Desk:** atalhos para módulos existentes, sem criar dados ou tarefas.

### Regra de cartão

Todo card operacional deve deixar claro:

- o que exige atenção;
- qual é o objeto/caso/lead de origem;
- quem é responsável;
- prazo, SLA ou risco;
- ação que abre o registro canônico.

Cards sem ação, sem fonte, sem responsável ou sem prazo não devem ocupar fila prioritária. Devem aparecer em detalhe, histórico ou diagnóstico de qualidade.

---

## 7. Métricas operacionais

Cada grupo exibe, no topo, no máximo cinco métricas de decisão. Métricas secundárias ficam em “Ver detalhes”.

| Grupo | Até cinco métricas principais | Fonte canônica |
|---|---|---|
| Visão geral | vencidos; vence hoje; sem responsável; exceções críticas; SLA em risco | tarefas, casos, exceções e alertas derivados |
| Comercial | novos leads; tempo de primeira resposta; calls agendadas; propostas ativas; confirmação formal pendente | leads, interactions, calls e conversion_events |
| Casos e núcleos | casos por fase; próximos marcos; bloqueios; prioridade; entregas pendentes | crm_casos, gates, tarefas e entregas |
| Pesquisa genealógica | pendências documentais; evidências aguardando validação; solicitações internas; achados para revisão; relatórios pendentes | research_cases, evidências, documentos e validações |
| Contratos e financeiro | condições pendentes; faturas internas pendentes; despesas aguardando aprovação; divergências; bloqueios de cobrança | contratos, condições, financeiro e gates |
| Governança e biblioteca | acessos pendentes; decisões humanas; inconsistências; integrações bloqueadas; riscos críticos | auditoria, decisões, validações e integrations |
| App Cliente | acessos pendentes; projeções aguardando confirmação; solicitações de documento; tickets abertos; itens publicados autorizados | client_portal_access, app_projections e atendimento |

### Regra de não duplicação

- Um KPI possui uma fonte canônica e uma fórmula definida.
- Outras telas usam rótulo, recorte ou link, nunca uma contagem concorrente.
- Um mesmo item não pode aparecer simultaneamente em duas filas operacionais.
- Alertas apontam para o objeto canônico e recalculam após a resolução nele.

---

## 8. Descoberta e linguagem humana

A navegação e os cabeçalhos devem usar linguagem humana, mantendo o nome técnico somente quando necessário para manutenção:

| Nome técnico/rota | Nome humano exibido |
|---|---|
| `/qualidade` | Radar Interno e Qualidade |
| `/matriz-juridica` | Validação Jurídica |
| matriz derivada de prioridade | Prioridade dos casos |
| `/integracoes` | Integrações e prontidão externa |
| `/pesquisa-modulo` | Pesquisa Genealógica e Evidências |

O bloco “Encontrar no Desk” pode ter links para Radar Interno e Qualidade, Validação Jurídica, Prioridade dos casos, Pesquisa Genealógica, Integrações e App Cliente. Ele não pode criar tarefas, alertas, status ou dados.

---

## 9. Pesquisa genealógica e Assistente IA

Pesquisa Genealógica é um grupo visível e possui, no mínimo, as seguintes capacidades:

1. Visão de pesquisa e plano de ação.
2. Ficha genealógica.
3. Pessoas, famílias e ramos.
4. Fontes e consultas.
5. Evidências e documentos.
6. Validação e pendências.
7. Achados e microentregas.
8. Relatórios F1/F2.
9. Alertas e histórico.
10. Bases, catálogo e matriz de avaliação de fontes.
11. Assistente IA de pesquisa por caso.

### Assistente IA

- Exige confirmação explícita de `case_id`.
- Uma mudança de URL não pode carregar/analisar outro caso automaticamente.
- Dados insuficientes bloqueiam análise e registram somente `analysis_blocked_insufficient_case_data`.
- DEMO só pode rodar por comando explícito e com o aviso: `DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO`.
- O Assistente não faz pesquisa externa, não solicita certidão, não contata instituição, não envia mensagens e não publica dados.
- Sugestões não confirmam achado nem projetam conteúdo ao cliente automaticamente.

---

## 10. Espelho do App Cliente

O Desk deve disponibilizar, como módulo contextual de App Cliente, um preview read-only para a proprietária e equipe autorizada.

O preview deve:

- usar a mesma projeção sanitizada e canônica do portal;
- mostrar as sete abas reais, na mesma ordem, com os mesmos estados vazios;
- exigir escolha explícita do caso elegível;
- mostrar banner: `PRÉVIA READ-ONLY — projeção sanitizada do App Cliente`;
- ser auditado na abertura;
- nunca exibir dados internos, dados de outros casos, classificação de dados, controles Desk, hipótese, evidência, fonte, risco, preço ou SKU.

A atividade do cliente — abertura, visualização e download — somente pode ser exibida fora da prévia se existir evento canônico real. Nunca deve ser inventada nem exposta ao cliente.

---

## 11. Integrações e WhatsApp

A interface pode exibir estado, histórico, fila e preview interno, mas envio real continua bloqueado até configuração e validação do provedor.

Estado conhecido em 23 de agosto de 2026:

- E-mail: bloqueado por DNS do domínio.
- Assinatura eletrônica: não configurada.
- Asaas e links de pagamento: não configurados; gateway simulado desligado.
- Cobrança externa: não configurada.
- WhatsApp Meta: não configurado; sem número e template aprovados.
- Pesquisa institucional externa: depende de confirmação da proprietária e canal oficial validado.
- Publicação no App Cliente: configurada internamente, mas exige QA, classificação `real` e confirmação explícita.

O WhatsApp deve ter três camadas distintas:

1. Histórico/espelho interno de comunicação já registrada.
2. Prévia de conteúdo para aprovação/cópia.
3. Envio externo real, sempre sujeito a integração, consentimento, template aplicável e confirmação contextual.

---

## 12. Lacunas e backlog

| Item | Estado | Decisão |
|---|---|---|
| Radar multi-país e índice de elegibilidade | Ausente | Especificar após lançamento; não inventar fonte canônica |
| Assistente IA | Parcial | Auditar rota, confirmação de caso, DEMO e bloqueios antes de expansão |
| Jurídico | Parcial | Confirmar fontes de marcos, trilhas e casos impactados |
| Financeiro externo | Parcial | Manter bloqueado até gateway, contrato e condições homologadas |
| Integrações externas | A confirmar/não configuradas | Configurar uma por vez, primeiro em sandbox |
| P0.1 acesso e isolamento | Não comprovado neste registro | Exigir devolutiva e teste no domínio publicado |
| P0.2 classificação de dados | Implementado localmente | Executar QA read-only no domínio publicado |
| P0.3 checklist de lançamento | Não comprovado neste registro | Executar após P0.1 e P0.2 publicado |
| Marketing e aquisição | Módulo a mapear | Manter dentro de Comercial até decisão arquitetural posterior |

---

## 13. Processo obrigatório de mudança

Toda evolução deve seguir esta ordem:

1. Auditoria read-only do estado atual.
2. Documento/artefato versionado com escopo, regras e critérios de aceite.
3. Aceite explícito da proprietária.
4. Implementação isolada.
5. Devolutiva com arquivos, linhas, testes, build, estado de deploy e ações externas.
6. Atualização deste documento e da Matriz de Equivalência CA-UX.
7. Commit no repositório remoto somente após confirmação explícita da proprietária.

Nenhum prompt seguinte pode começar automaticamente após a devolutiva de outro prompt.

---

## 14. Critérios de aceite

Uma alteração de UX/métricas só é aceita quando:

- cada métrica possui fonte e fórmula identificáveis;
- cada card operacional possui objeto, responsável, prazo/risco e ação;
- não há item duplicado em filas operacionais;
- função movida/renomeada possui atalho e rótulo humano;
- App Cliente continua isolado e sanitizado;
- typecheck, testes relevantes e build passam;
- não há ação externa, deploy ou alteração de dados sem autorização explícita;
- o arquivo é atualizado e apresentado à proprietária.

---

## 15. Controle de alterações

| Versão | Data | Alteração | Aceite |
|---|---|---|---|
| 1.0 | 23/08/2026 | Criação inicial do plano de UX e métricas do Desk Intelligence | Pendente |
