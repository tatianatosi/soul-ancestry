# Inventário consolidado — Prompts anteriores, fases, estado e próximos passos

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: inventário operacional, reconciliação de prompts e próximos passos
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Prompt Mestre — Motores a Implantar no Clube Ancestral
  - README de políticas e prompts, associado ao PR #34
  - Mapa de Autoridade Admin — Desk e App Cliente, associado ao PR #34
  - PR #31, #32, #33, #34, #35, #36, #39 e #40, conforme levantamento no GitHub e relatos operacionais
  - Relatório do Dia 4
  - Registros de correção factual desta conversa
escopo:
  - consolidar prompts anteriores como referências/substituídos/arquivados
  - relacionar cada prompt à sequência única P0→P11
  - registrar estado conhecido, evidência disponível, lacunas e próximos passos
premissas:
  - Prompt Mestre é a referência única de ordem de motores
  - documento arquivado não equivale a capacidade implementada
  - código em PR não equivale a homologação em preview ou produção
  - alegações de tarefa fora do Painel Ops exigem classificação por rota, branch, contexto e teste, não negação absoluta
limites:
  - não autoriza merge de PRs, alterações de código, migrations, unificação de dados, publicação externa ou mudanças de segurança
  - não substitui validação manual em preview
  - não trata dados de relatos como prova de produção sem evidência verificável correspondente
próximos passos:
  - validar P2 no preview
  - concluir incorporação da auditoria final ao Mapa de Autoridade Admin
  - reconciliar a matriz de cobertura de Criar tarefa por rota/deploy
  - preparar especificação de P4 somente após aceite P2
critério de aceite:
  - cada fase deve ter fonte, estado, dependência, teste de aceite e decisão explícita de avanço
substitui: nenhum
```

## 1. Decisão de referência

O documento de referência para evolução do produto é:

```text
PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md
```

Ele consolida a sequência única:

```text
P0 — Autoridade operacional e persistência
P1 — Caso canônico, núcleo e participantes
P2 — Contrato, proposta e Ordem de Serviço
P3 — Tarefas, próxima ação e cadência
P4 — Onboarding real
P5 — Pesquisa, fontes, documentos e evidências
P6 — Micro-entregas, App Cliente e portal
P7 — Catálogo, financeiro e comercial
P8 — Marketing, conteúdo e conversão
P9 — Cockpit, indicadores e alertas
P10 — Integrações externas e escala
P11 — Revisão visual e marca
```

Regra de avanço:

```text
Cada fase deve ser validada com dados reais antes da próxima.
```

Os prompts anteriores permanecem como evidência histórica e detalhamento temático; não devem mais ser tratados como trilhas paralelas de implementação.

## 2. Inventário dos prompts anteriores

| Documento anterior | Função original | Relação com Prompt Mestre | Estado de referência | Ação documental |
|---|---|---|---|---|
| `P0-AUTORIDADE-OPERACIONAL-PERSISTENCIA-PROXIMA-ACAO.md` | Autoridade admin, persistência, próximo passo e tarefas | Absorvido principalmente em P0 e P3 | Histórico ativo como detalhe; não é trilha independente | Manter como referência e apontar para P0/P3 |
| `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` | Caso canônico, família, participantes, aliases e visibilidade | Absorvido em P1 e parte de P6 | Fase 1 de mapeamento realizada; fases de motor pausadas | Manter arquivado; não iniciar `case_participants` sem autorização |
| `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | CRM, Caso 360, onboarding, cadências, financeiro e indicadores | Conteúdo distribuído entre P2 a P10 | Referência histórica; não iniciar como pacote monolítico | Usar somente por fase correspondente |
| `PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` | Indicadores acionáveis, Painel Hoje, cadências e sinais | Absorvido em P3, P4 e P9 | Não iniciado como motor | Manter como referência de requisitos; não antecipar P9 |
| `PROMPT-AUTORIDADE-ADMIN-MAPA-DESK-APP.md` | Auditoria rota→função→tabela→persistência | Suporta P0 e o diagnóstico transversal | Mapa reportado como completo em 31/08, aguardando consolidação/verificação final | Atualizar sem reescrever silenciosamente evidências anteriores |
| `PROMPT-REVISAO-MOTORES-E-CASO-360.md` | Revisões R00–R07 antes de novas funções | Complementar: método de auditoria | Parcialmente coberto pelo Mapa e inventários | Reaproveitar para lacunas ainda não rastreadas |
| `PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md` | Comunicação, cadências, conteúdos e relacionamento | P8, P9 e P10 | Não iniciado; depende de base operacional | Manter arquivado como escopo futuro |
| `PROMPT-VISAO-PRODUTO-ARQUITETURA-MOCKUPS-LANDINGS.md` | Visão de produto, arquitetura e mockups/landings | P6, P9 e P11 | Não iniciado como implementação | Preservar taxonomia e adiar execução visual ampla |
| `PROMPT-CORRECAO-ADMIN-VISAO-CLIENTE.md` | Preview administrativo do portal | P6 | Não confirmado como implementado/validado | Reproduzir e auditar antes de qualquer correção |
| `PROMPT-REVERSAO-EMERGENCIAL-PLATAFORMA-OPERACIONAL.md` | Reversão de gates e barreiras excessivas | Histórico de incidente e princípios de operação interna | Histórico; não executar sem confirmação de problema atual | Manter apenas como referência histórica |
| `PROMPT-REMOCAO-TOTAL-BARREIRAS-OPERACIONAIS-REJEITADO.md` | Remoção indiscriminada de controles | Conflita com limites permanentes de segurança | Rejeitado | Permanecer em arquivados/rejeitados; nunca executar |
| `PENTE-FINO-IMPLANTACAO-PENDENCIAS-2026-08-30.md` | Inventário de pendências e priorização | Subsidiário do Prompt Mestre | Arquivado; conteúdo parcialmente superado por PRs posteriores | Preservar histórico e citar quando necessário |

## 3. Estado das fases P0→P11

| Fase | Objetivo | Estado atual consolidado | Evidência/PR | Dependência para avanço | Próximo passo verificável |
|---|---|---|---|---|---|
| P0 | Autoridade operacional e persistência | Em grande parte corrigido em código; Comercial/Financeiro corrigido em PR #39, ainda sem homologação manual | PR #31, #32, #35, #39; relatos de consulta/preview | Teste manual por domínio | Validar salvar → reler → refresh → reabrir |
| P1 | Caso canônico, núcleo e participantes | Fase 1 de mapeamento reportada; unificação/motor não iniciado | PR #36; Mapa de Autoridade | Decisão explícita e matriz de reconciliação | Não criar `case_participants` ou reapontar registros antes de autorização |
| P2 | Proposta, contrato e OS | Parcialmente implementado; PR #35 concentra reconciliação contratual; P0 financeiro recebeu correção em PR #39 | PR #35 e #39 | Teste manual do contrato real | Editar parte/CPF-CNPJ, salvar rascunho, refresh, reabrir |
| P3 | Tarefa, próxima ação e cadência | Parcial e controverso por superfície: implementação em código reportada em Painel Ops, Pessoa, Caso 360 e Contrato; não homologada transversalmente e sem idempotência | PR #32, #35; reconciliação factual de 31/08 | Teste por rota/deploy e definição de fonte canônica | Confirmar botão/contexto → mutation → task_id → listagem → refresh; especificar idempotência |
| P4 | Onboarding real/motor único | Não iniciado | Mapa identificou três sistemas paralelos | Aceite de P2 e decisão de arquitetura | Especificar onboarding canônico por `case_id`; não criar quarto sistema |
| P5 | Pesquisa, documentos e evidências | Parcialmente existente em sistemas paralelos; não consolidado | Mapa: Sistemas A/B/C | Decidir fonte/motor canônico e encerrar lacunas de persistência | Mapear modelo de evidência e regra de transição entre sistemas |
| P6 | Micro-entregas, App Cliente e portal | Parcial; Mapa final reporta quatro telas stub sem busca de dados reais | Auditoria final relatada; rotas de App Cliente | Fonte de conteúdo liberado, visibilidade e caso canônico | Classificar cada tela e remover alegação de dado vivo em stubs |
| P7 | Catálogo, financeiro e comercial | Persistência corrigida em código no PR #39; fonte única de catálogo e jornada completa ainda não consolidadas | PR #39; achados de CNPJ e catálogo | Preview P0/P2 e decisão de fonte institucional | Validar fluxo de proposta/fatura/pagamento e manter perfil institucional pausado |
| P8 | Marketing, conteúdo e conversão | Auditoria final reportada como concluída; motor ainda não iniciado | Mapa final relatado | Classificação de listas versus formulários e fontes reais | Registrar rotas, funções, tabelas e lacunas; não criar métricas falsas |
| P9 | Cockpit, indicadores e alertas | Não iniciado como motor | Prompt Cockpit; Painel Hoje predominantemente leitura | P3/P4/P5 com dados canônicos e persistidos | Implementar apenas indicadores acionáveis sobre fontes comprovadas |
| P10 | Integrações externas e escala | Não iniciado | Prompt Mestre | Fluxo interno confiável | Manter ações externas com integração real e confirmação explícita |
| P11 | Revisão visual e marca | Não iniciado como revisão ampla | Taxonomia do mockup aprovada; PR #40 é ajuste local de UX | P0–P10 essenciais e jornada real | Não redesenhar antes de dados, tarefas, onboarding e indicadores reais |

## 4. Mapa de Autoridade Admin — fechamento reportado

O Mapa de Autoridade Admin foi reportado como completo nas três áreas finais: Marketing, Configuração e App Cliente.

### Achados a preservar

| Área | Achado reportado | Classificação provisória | Consequência |
|---|---|---|---|
| Biblioteca de Mensagens | Edição de texto existe em código, mas nenhuma tela chama a função | `SEM_UI_PARA_FUNCAO_EXISTENTE` | Não tratar biblioteca como editor funcional até a UI chamar a função e a escrita ser validada |
| Usuários e papéis | Dois sistemas paralelos com a mesma finalidade | `COM_ERRO_OU_RISCO_CONHECIDO` | Mapear fontes e vínculos antes de sincronizar, fundir, migrar ou excluir |
| App Cliente | Legado, Entregas, Fase 01 e Fase 02 mostram texto fixo e não buscam dados reais | `PARCIAL` ou `SEM_FUNCAO_OU_SCHEMA` por rota | Declarar stubs; não apresentar como jornadas/entregas vivas |
| Marketing | Cobertura final reportada, com necessidade de distinguir formulário, lista, leitura e métrica real | A classificar por linha no Mapa final | Não implantar indicadores antes da classificação por fonte/ação |
| Configuração | Cobertura final reportada; perfil institucional continua com problema de três fontes sem sincronização | `COM_ERRO_OU_RISCO_CONHECIDO` | Não realizar sincronização parcial do CNPJ durante auditoria |

## 5. Reconciliação de Criar tarefa

A posição correta não é binária. Há diferença entre código presente, botão visível, ação contextual, preview implantado e persistência homologada.

| Superfície | Evidência reportada | Estado a registrar |
|---|---|---|
| Painel Ops | Superfície conhecida de tarefas | Implementada; validar também no deployment vigente se necessário |
| Pessoa/Perfil 360 | PR #32: `DecisaoPosSalvamento` expõe criação após salvar dado | Implementada em código, contextual pós-salvamento; aguarda teste de preview/persistência |
| Caso 360 | PR #32: `TarefasDoCaso` na seção Indicadores | Implementada em código, contextual à seção Indicadores; aguarda teste de preview/persistência |
| Contrato | PR #35: botão Criar tarefa na barra de ações | Implementada em código; aguarda teste de preview/persistência |
| Outras rotas | Sem rastreamento específico consolidado | Não presumir disponibilidade |

### Regra de evidência

Para uma rota ser classificada como `HABILITADA_E_VALIDADA`, demonstrar:

```text
abrir a rota e o contexto correto
→ acionar Criar tarefa
→ registrar payload e resposta/task_id
→ confirmar escrita na fonte canônica
→ localizar por case_id e task_id
→ refresh completo
→ reabrir e confirmar persistência
→ testar repetição para medir idempotência
```

Até esse teste, usar `IMPLEMENTADA_EM_CODIGO_AGUARDANDO_TESTE`, e não “não implementada” nem “validada”.

## 6. Prioridades imediatas

### Prioridade 1 — validação manual de P2

Executar no preview que contém o fluxo contratual:

```text
abrir contrato real
→ editar parte existente
→ alterar CPF/CNPJ permitido
→ salvar rascunho
→ confirmar resultado de escrita
→ refresh completo
→ reabrir contrato
→ confirmar persistência
```

Registrar URL/branch/commit, `case_id`, `contract_id`, resultado e qualquer erro literal.

### Prioridade 2 — consolidar o Mapa final

Incorporar o resultado da auditoria em Marketing, Configuração e App Cliente no documento canônico do Mapa, preservando:

```text
rota
→ componente
→ handler
→ server function
→ tabela/view/bucket
→ organização/permissão
→ comportamento real
→ tipo de evidência
→ classificação
→ menor correção ou teste necessário
```

### Prioridade 3 — conciliar tarefa por rota

Executar o roteiro de validação de tarefa em Pessoa, Caso 360 e Contrato nos previews que realmente incluem PR #32/#35. Não iniciar expansão de tarefa nem P3 completo antes de saber:

```text
qual botão aparece
qual mutation roda
qual case_id é enviado
qual task_id retorna
onde a tarefa é relida
se ela permanece após refresh
se duplica em cliques repetidos
```

### Prioridade 4 — preparar P4, sem implementar

Somente após P2 aprovado e reconciliação factual de P3, preparar a especificação de P4:

```text
um onboarding por case_id
fonte canônica escolhida entre os três sistemas existentes
regra para sistemas legados
participantes compartilhados/individuais
primeira ação e responsáveis
relação com tarefa e próxima ação
persistência e releitura
nenhuma ação externa automática
```

## 7. Itens expressamente proibidos neste momento

- Não iniciar P1 Fase 2/3, `case_participants`, merge de núcleos ou reapontamento de dados.
- Não iniciar P4 em código antes do aceite de P2.
- Não criar indicadores de P9 sobre listas, stubs, mocks ou sistemas concorrentes.
- Não reestruturar taxonomia visual aprovada do App Cliente ou Desk.
- Não sincronizar parcialmente o perfil institucional/CNPJ mantido em fontes distintas.
- Não tratar PR, build verde, teste unitário, botão, componente ou rota como homologação em preview.
- Não alterar RLS, login, sessão, permissões por organização, auditoria ou confirmação de ações externas.
- Não apagar dados, fazer migration destrutiva ou criar entidades paralelas para contornar lacunas.

## 8. Condição para mudança de fase

A passagem para P4 exige registro aprovado da validação de P2 e uma decisão explícita da proprietária. A passagem para P9 exige, adicionalmente, fonte canônica e persistência demonstrada para tarefas, próxima ação, onboarding e pesquisa.

```text
P0/P2 validados
→ P3 reconciliado e especificado
→ P4 especificado e autorizado
→ P5/P6/P7/P8 com fontes claras
→ P9 com indicadores reais e acionáveis
→ P11 apenas depois da operação estar funcional
```

> O inventário não substitui execução. Ele impede que prompts históricos, PRs abertas e componentes visuais sejam confundidos com uma operação única, validada e pronta.
