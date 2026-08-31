# Revisão do mandato — Auditoria do Desk simplificado e localização do prompt de origem

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: revisão de mandato, reconciliação de arquitetura e inventário de fontes
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Prompt_Claude_Autoridade_Admin_Mapa_Desk_e_App_Cliente.md
  - Reveja-o-desk-Fluxo-visual-completo-WhatsApp.pdf
  - CA-UX-03_Navegacao_Desk_8_Grupos.md
  - ABAS_DESK_ORIGINAL_E_INCORPORACOES_v1.0.md
  - Elemento-NoDeskIntelligence-NoAppCliente.csv
  - Mandato de auditoria e de-para — Simplificação do Desk, grupos, abas e patrimônio material
escopo:
  - localizar o prompt associado ao Mapa de Autoridade Admin
  - identificar a fonte da estrutura do Desk simplificado em seis núcleos
  - corrigir o mandato anterior que confundiu estruturas de 14 abas, 8 grupos e 6 núcleos
  - definir método correto de auditoria e de-para antes de alterar navegação
premissas:
  - as três estruturas representam camadas/versões diferentes, não devem ser tratadas como equivalentes
  - a estrutura de 6 núcleos do fluxo visual é a referência de simplificação solicitada para o próximo de-para
  - a navegação atual de 8 grupos permanece implementada e não deve ser alterada durante a auditoria
limites:
  - não autoriza renomear, fundir, remover ou migrar rotas
  - não autoriza remover dados, alterar RLS, sessões, permissões, auditoria ou integrações
  - não autoriza iniciar P4, P5 ou P9
próximos passos:
  - produzir inventário completo das rotas atuais contra a estrutura de seis núcleos
  - localizar o inventário de patrimônio material e incluí-lo no de-para
  - registrar decisões humanas necessárias para cada item sem aba clara de destino
critério de aceite:
  - toda rota, aba, card e lista possui origem, finalidade, fonte, tipo de dado, sobreposição, destino e tratamento
substitui:
  - o mandato anterior na parte em que ele indicou CA-UX-03 como se fosse a fonte da estrutura de seis abas
```

## 1. Resposta direta

O prompt que estava junto do Mapa de Autoridade Admin foi localizado:

```text
Prompt_Claude_Autoridade_Admin_Mapa_Desk_e_App_Cliente.md
```

Ele é o mandato de verificação operacional por rota:

```text
rota → componente → handler → server function → tabela/RPC → política/estado → releitura
```

Seu objetivo é mapear, para cada grupo/rota, o que a proprietária pode ler, criar, editar, arquivar, concluir/reprogramar, o que persiste após refresh, e o que é leitura, ação externa, lacuna ou risco.

A estrutura de **Desk simplificado em seis núcleos** não vem do CA-UX-03. Ela está explicitamente no documento:

```text
Reveja-o-desk-Fluxo-visual-completo-WhatsApp.pdf
```

A versão correta de seis núcleos é:

```text
1. Visão geral
2. Casos 360
3. Pesquisa e Biblioteca
4. Financeiro e formalização
5. Radar e decisões
6. Operação
```

## 2. Três camadas que não podem ser confundidas

| Camada | Fonte | Estrutura | Papel correto |
|---|---|---|---|
| Mockup/arquitetura original | `ABAS_DESK_ORIGINAL_E_INCORPORACOES_v1.0.md` | 14 abas originais | Preserva o escopo aprovado originalmente e mostra onde elementos posteriores poderiam residir; não autoriza mover/renomear sem decisão |
| Navegação implementada no repositório | `CA-UX-03_Navegacao_Desk_8_Grupos.md` | 8 grupos | É a navegação/rótulos implementados em `src/lib/navegacao-desk.ts`; mantém rotas preservadas e não altera dados, banco, RLS ou integrações |
| Simplificação orientadora de produto | `Reveja-o-desk-Fluxo-visual-completo-WhatsApp.pdf` | 6 núcleos | É a arquitetura a ser usada no de-para futuro para reduzir dispersão; não autoriza apagar/fundir abas agora |

### Regra

```text
14 abas = origem e escopo aprovado.
8 grupos = navegação atualmente implementada.
6 núcleos = destino conceitual de simplificação a auditar.
```

Não usar um como se anulasse os outros.

## 3. Estrutura de seis núcleos a preservar

| Núcleo simplificado | Função | Deve concentrar | Não deve fazer |
|---|---|---|---|
| Visão geral | Carteira e ritmo de entrega | Casos novos, alertas, pagamentos permitidos, entregas pendentes e visão de prioridade | Virar lista longa, reexibir dados técnicos ou simular KPI |
| Casos 360 | Mesa central por caso | Saúde, fase, responsável, próximos marcos, contexto, síntese operacional e seções contextuais | Criar cópia de caso, duplicar dados ou disputar informação com páginas paralelas |
| Pesquisa e Biblioteca | Produção de inteligência e entrega | Árvore interna, documentos, fontes, evidências, agente, achados, relatórios e microentregas em produção | Expor material cru ao app ou manter Pesquisa Operacional como sistema paralelo sem destino |
| Financeiro e formalização | Vínculo comercial e instrumentos | Proposta, contrato, OS, cobrança/status, catálogo homologado e despesas | Tratar pagamento como gatilho automático de caso/pesquisa/portal ou manter preço sem fonte única |
| Radar e decisões | Prioridade e decisão qualificada | Radar interno, validação jurídica, qualidade, exceções e oportunidade de upgrade | Exibir score/hipótese bruta ao cliente ou bloquear rascunho operacional por indicadores |
| Operação | Execução diária | Tarefas, Kanban, SLA, carga, checklist interno e automações | Ser dono paralelo de onboarding, pesquisa ou microentregas; manter cartões legados redundantes |

A lista acima vem da seção “Arquitetura visual sugerida” do documento de fluxo visual. [file:786]

## 4. Princípios do fluxo visual

O documento de fluxo visual estabelece três camadas, cada qual com responsabilidade distinta:

```text
WhatsApp: inicia, chama atenção, recupera e apoia.
App Cliente: mostra progresso, entregas e próximo passo já liberados.
Desk: produz, decide e coordena o que precisa acontecer.
```

Ele também afirma que o Desk não precisa espelhar literalmente cada tela do App, mas deve ter o equivalente operacional que gera as entregas cliente-facing. [file:786]

### Microentregas

Microentrega não é um formulário isolado de Ops. É a unidade de valor que nasce na operação, tem evidência, estado, responsável, revisão, destino e data de liberação; depois pode ser apresentada como card, alerta, item de Biblioteca ou Legado no App. [file:786]

Fluxo esperado:

```text
Achado ou tarefa
→ microentrega em produção
→ revisão humana
→ liberada ao cliente
→ App / WhatsApp / reunião / PDF, conforme destino aprovado
```

### Radar e Árvore em dois níveis

- **Desk:** leitura completa de risco, fontes, evidência, conflitos, lacunas e prioridade.
- **App:** leitura simplificada, narrativa e liberada, sem score cru, hipótese jurídica, força probatória ou dados internos. [file:786]

### Biblioteca e Legado

Biblioteca e Legado são produção e entrega recorrente, não decoração. O Desk controla o que foi produzido, revisado, liberado e comunicado; o App mostra somente o que passou por essas etapas. [file:786]

## 5. Mandato de auditoria corrigido

A auditoria deve usar simultaneamente:

1. O **Prompt de Autoridade Admin** para verificar capacidade e persistência por rota.
2. A **estrutura de seis núcleos** para definir destino simplificado.
3. A matriz de **14 abas originais** para preservar significado e não deslocar/apagar elemento aprovado sem decisão.
4. A navegação de **8 grupos implementados** para registrar a origem real de cada rota no repositório.

### Inventário obrigatório por item

| Campo | Registro exigido |
|---|---|
| Origem | Grupo de 8, aba original de 14 e rota atual |
| Item | Card, lista, formulário, Kanban, indicador, dado técnico, biblioteca, onboarding, pesquisa ou ação externa |
| Finalidade real | O que efetivamente permite fazer hoje |
| Fonte | Tabela, view, função, AppSheet, Drive, planilha ou serviço |
| Persistência | Validada, código aguardando teste, parcial, sem UI, stub, leitura ou não aplicável |
| Sobreposição | Onde a mesma informação/ação se repete |
| Camada | Desk interno, App Cliente, WhatsApp, integração ou referência técnica |
| Destino de 6 núcleos | Um dos seis núcleos simplificados ou “decisão humana pendente” |
| Tratamento | Manter, mover, consolidar visualmente, recolher, transformar, arquivar com histórico, remover UI, marcar stub ou aguardar fonte canônica |
| Critério de aceite | Como provar que a mudança preservou capacidade e não criou duplicidade |

## 6. De-para inicial conhecido

Este é um de-para de trabalho inicial, não alteração autorizada de navegação:

| Origem atual | Destino simplificado | Tratamento de auditoria |
|---|---|---|
| Hoje / Painel / métricas / relatórios | Visão geral | Separar alerta e indicador real de lista decorativa, relatório histórico e dado técnico |
| Leads, Calls, Discovery, propostas e conversão | Financeiro e formalização para proposta/condição; Casos 360 após handoff; Visão geral para visão de carteira | Manter Calls/Discovery como entrada contextual, sem criar segundo CRM ou repositório de WhatsApp |
| Casos, núcleos, piloto, go-live e Caso 360 | Casos 360 | Recolher gates/dados técnicos; separar ativação externa de trabalho interno; não duplicar onboarding |
| Pesquisa, pesquisa operacional, fontes, evidências, achados, relatórios e pessoas/linhagens | Pesquisa e Biblioteca | Mapear os três sistemas existentes; preservar fonte/registro; retirar UI legada apenas após definir destino dos itens úteis |
| Contratos, parâmetros, OS, catálogo, faturas, pagamentos e conciliação | Financeiro e formalização | Manter proposta/contrato/OS/financeiro como subpáginas contextuais, cada uma ligada ao mesmo caso |
| Tarefas, Ops, exceções, SLA, Kanban e automações | Operação | Tratar Kanban como visão possível da fonte de tarefas; separar atalhos úteis de Painel Ops legado |
| Matriz jurídica, qualidade, radar, exceções, decisões e upgrade | Radar e decisões | Manter como informação de decisão; não bloquear rascunhos nem expor ao App |
| Acessos de portal, atendimento, publicação autorizada e espelho do App | Casos 360 e Pesquisa/Biblioteca conforme conteúdo; Visão geral para alertas | Não criar “Cliente” como núcleo paralelo; manter como links contextuais/ações de liberação |
| Integrações, importações, equipe, configurações, auditoria e administração | Decisão humana pendente: camada técnica transversal | Não confundir suporte técnico com núcleo diário do Desk; preservar acessibilidade e manter recolhido/contextual |

## 7. Pontos que exigem decisão, não inferência

- O destino definitivo de Marketing/Calls/CRM dentro dos seis núcleos: o fluxo visual começa em WhatsApp/lead, mas os seis núcleos não trazem “Comercial” como aba independente.
- O destino de Cliente/Portal: ele é uma função transversal de Casos 360 e da liberação de conteúdo, não está listado como um dos seis núcleos.
- O destino de Integrações/Administração/Governança: são camadas técnicas e não devem ser apagadas por simplificação.
- O destino de Pesquisa Operacional e dos três sistemas de Pesquisa: exige fonte canônica e matriz de preservação antes de qualquer retirada.
- O destino do patrimônio material: deve ser levantado em `/governanca/inventario-patrimonial` e confrontado com Pesquisa e Biblioteca antes de classificá-lo.

## 8. Limites de execução

O documento de fluxo visual determina explicitamente:

```text
Não apagar nem fundir abas agora.
Não transformar KPI em prioridade de caso.
Não transformar SLA em checklist cliente.
Não expor árvore, radar, fontes ou hipótese interna para criar sensação de progresso.
Não liberar caso/pesquisa automaticamente depois do pagamento.
Não usar WhatsApp como repositório/centro de execução.
```

Portanto, o próximo trabalho é **inventário e de-para**. Não é redesign, remoção de rotas, migração de dados ou implementação de P4/P5/P9.

## 9. Próximos passos

1. Ler o conteúdo completo do `Prompt_Claude_Autoridade_Admin_Mapa_Desk_e_App_Cliente.md` e usar suas categorias de estado para cada rota.
2. Extrair as rotas atuais da navegação de 8 grupos.
3. Mapear cada rota contra as 14 abas originais, quando houver correspondência.
4. Destinar cada capacidade a um dos seis núcleos simplificados, ou registrar decisão humana pendente.
5. Ler `/governanca/inventario-patrimonial` e adicionar patrimônio material ao inventário, sem criar módulo novo por default.
6. Separar PRs de baixo risco: recolher dados técnicos, remover botões de navegação redundantes, marcar stubs, substituir duplicação visual por link contextual e organizar Kanban sobre a mesma fonte.
7. Manter bloqueados: unificação de onboarding, unificação de pesquisa, case_participants, sincronização institucional de CNPJ, migrações de dados e indicadores sobre fontes não canônicas.

> A estrutura correta não é escolher entre 14 abas, 8 grupos ou 6 núcleos. É usar cada uma na sua função: origem preservada, navegação atual e destino simplificado auditado.
