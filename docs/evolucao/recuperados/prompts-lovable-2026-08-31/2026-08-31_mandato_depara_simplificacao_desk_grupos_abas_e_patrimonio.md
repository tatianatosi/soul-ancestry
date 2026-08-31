# Mandato de auditoria e de-para — Simplificação do Desk, grupos, abas e patrimônio material

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: mandato de auditoria, de-para e decisão de arquitetura operacional
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - docs/arquitetura/CA-UX-03_Navegacao_Desk_8_Grupos.md
  - docs/arquitetura/CA-UX-03_Matriz_Rotas_e_Modulos.csv
  - docs/arquitetura/CA-UX-03_Metricas_Canonicas.md
  - Mapa de Autoridade Admin — Desk e App Cliente
  - Prompt Mestre — Motores a Implantar
  - Inventário consolidado de prompts, fases e próximos passos
  - Adendo do Painel de Calls e Discovery
  - Inventário de patrimônio material a localizar e confrontar nesta auditoria
escopo:
  - revisar aba por aba e grupo por grupo do Desk
  - aplicar de-para de simplificação já definido na arquitetura do repositório
  - identificar listas, cards redundantes, dados técnicos, onboarding fragmentado e pesquisa duplicada
  - preservar e priorizar o que é operacionalmente útil, incluindo Kanban e Painel de Calls/Discovery
premissas:
  - a arquitetura canônica de navegação deve ser recuperada dos documentos CA-UX-03 antes de qualquer renomeação
  - o Desk não deve criar novas superfícies paralelas para tarefas, onboarding, pesquisa, microentregas ou patrimônio
  - microentregas pertencem à jornada/onboarding único e à biblioteca de entregas; não devem ser apenas um formulário solto no Painel Ops
limites:
  - este documento não altera código, não remove rotas, não migra dados e não inicia P4/P5/P9
  - não autoriza apagar legado; qualquer retirada exige classificação, destino e preservação de acesso/histórico quando aplicável
  - não fixa nomes finais de 6 abas sem reproduzir literalmente a versão aprovada no CA-UX-03 e confrontá-la com Mapa de Autoridade e Revisão de Layout
próximos passos:
  - extrair nomes e de-para canônicos dos arquivos CA-UX-03
  - localizar inventário de patrimônio material e anexar seus domínios ao mapa
  - produzir inventário completo por grupo/aba, com decisão de manter, mover, recolher, consolidar, arquivar ou substituir
critério de aceite:
  - cada rota/aba possui origem, finalidade, dados, ação real, fonte canônica, destino na nova estrutura e decisão de tratamento
substitui:
  - propostas anteriores de simplificação que usaram nomes divergentes ou trataram apenas Painel Ops/Pesquisa sem inventário completo
```

## 1. Correção de direção

A simplificação do Desk não pode ser redefinida a partir de uma taxonomia improvisada ou de nomes divergentes. A referência obrigatória é a arquitetura previamente registrada no repositório, especialmente:

```text
docs/arquitetura/CA-UX-03_Navegacao_Desk_8_Grupos.md
docs/arquitetura/CA-UX-03_Matriz_Rotas_e_Modulos.csv
docs/arquitetura/CA-UX-03_Metricas_Canonicas.md
```

Antes de propor uma estrutura final de seis abas, a auditoria deve extrair literalmente desta arquitetura:

- nomes aprovados;
- grupos/rotas existentes;
- módulos e seu destino;
- indicadores canônicos;
- separação entre operação, pesquisa, comercial, jornada e dados técnicos.

Nenhum nome novo deve substituir silenciosamente a versão já aprovada.

## 2. Problema a resolver

O Desk acumula em grupos e abas diferentes:

```text
cards repetidos
listas sem ação
painéis legados
indicadores sem fonte ou sem destino
formulários isolados
módulos que são versões paralelas da mesma finalidade
dados técnicos expostos no fluxo de trabalho
onboarding fragmentado em múltiplas superfícies
pesquisa distribuída entre sistemas concorrentes
microentregas tratadas como cadastro isolado, não como parte da jornada
```

A tarefa não é apenas “reduzir abas”. É aplicar um de-para controlado:

```text
cada capacidade
→ uma finalidade operacional
→ uma fonte canônica
→ um ponto principal de trabalho
→ subtelas/abas contextuais quando necessárias
→ sem apagar histórico ou criar cópia paralela
```

## 3. Princípios de simplificação

### 3.1 Uma função, um lugar principal

- O usuário não deve procurar a mesma informação em cards repetidos no início, meio e fim de uma página.
- Navegação e ação devem ser separadas: botão de ação precisa executar algo distinto; trocar de aba é navegação.
- Dados técnicos, integridade, logs, gates e diagnóstico ficam recolhidos e não se repetem como cards operacionais.
- Uma lista só permanece quando permite abrir, filtrar, priorizar ou agir sobre um item real.

### 3.2 Onboarding único

Onboarding deve ser tratado como motor transversal por `case_id`, com subtelas e componentes de jornada. Não deve sobreviver como:

```text
checklist isolado
painel de ativação
plano vazio no Caso 360
formulário independente no Ops
coleção de cards repetidos em todas as áreas
```

A auditoria deve identificar em cada grupo tudo o que é onboarding e direcioná-lo ao motor único futuro, sem construir o motor agora.

### 3.3 Microentregas como jornada, não formulário solto

Microentregas são unidades de valor e acompanhamento; devem ser vinculadas a caso, fase, participante quando aplicável, fonte e visibilidade.

Elas pertencem a:

```text
Jornada/Onboarding único
→ Biblioteca Mestre de entregas e conteúdos
→ Caso 360
→ App Cliente, somente quando liberadas
```

O Painel Ops pode oferecer um atalho contextual de registro, mas não deve ser proprietário da definição, biblioteca, status de liberação ou jornada de microentregas.

### 3.4 Pesquisa como um domínio

Pesquisa Operacional, Pesquisa A, Pesquisa B, Pesquisa C, evidências, fontes, documentos, achados, hipóteses e planos de ação precisam ser analisados como um único domínio funcional com fontes internas ainda concorrentes.

A decisão esperada não é apagar “Pesquisa Operacional” por ser legado, nem criar outra pesquisa. É:

```text
inventariar
→ identificar o que tem uso real, dados e persistência
→ definir o que deve ser mantido como submódulo de Pesquisa
→ indicar a fonte canônica/futura ponte
→ arquivar ou recolher apenas interfaces legadas sem uso
```

### 3.5 Patrimônio material

O inventário de patrimônio material deve ser confrontado contra cada grupo/aba porque ele pode conter:

```text
bens
imóveis
objetos
acervos
fotografias
documentos patrimoniais
coleções
histórias de posse
vínculos familiares
fontes documentais
```

Esses itens não podem virar um módulo isolado se já pertencem à Pesquisa, à Árvore/Legado ou à Biblioteca Mestre. A auditoria deverá decidir, item a item, se o patrimônio é:

```text
pesquisa/documento
achado/evidência
microentrega/legado
conteúdo liberado ao App
referência interna
ou ativo operacional específico que justifique submódulo próprio
```

## 4. Itens específicos já identificados

| Item | Situação informada | Decisão de auditoria necessária |
|---|---|---|
| Painel Ops | Legado de sistema não utilizado | Mapear seus componentes; manter somente o que for fonte ativa ou atalho útil; retirar duplicações e não usar como dono de onboarding/microentregas |
| Kanban | Considerado válido e priorizável | Mapear entidade, filtros, escrita e vínculo com caso; avaliar como superfície de execução/Checklist, não como sistema paralelo |
| Microentregas no Ops | Tratadas como formulário de adicionar | Reposicionar conceitualmente para Jornada/Onboarding + Biblioteca + Caso 360 + App liberado |
| Pesquisa Operacional | Legado/resquício não usado | Inventariar dados/funções; migrar o que importa para o domínio Pesquisa; retirar somente após destino definido |
| Pesquisa A/B/C | Sistemas paralelos | Mapear fonte, formulário, listas e evidências; não criar quarto sistema |
| Painel de Calls/Discovery | Aba existente e relevante | Manter como entrada/handoff do Comercial; verificar fórmula, fontes e relação com Caso 360/WhatsApp |
| Indicadores | Muitos cards, alguns redundantes ou sem fonte | Classificar indicador real, lista, leitura, técnico, onboarding, tarefa, métrica sem dado ou card redundante |
| Dados técnicos | Repetidos/expostos em telas | Recolher e centralizar por contexto, sem eliminar auditoria ou segurança |

## 5. Inventário obrigatório por grupo e aba

A auditoria deve cobrir todos os grupos/abas existentes, não apenas Pesquisa ou Painel Ops.

Para cada item, registrar:

| Campo | Pergunta obrigatória |
|---|---|
| Grupo atual | Em qual grupo/menu vive? |
| Aba/rota atual | Qual é a página ou subtela? |
| Nome visível | Qual é o rótulo apresentado? |
| Finalidade declarada | Para que deveria servir? |
| Finalidade real | O que de fato faz hoje? |
| Entidade/fonte | Qual tabela, view, planilha, AppSheet, Drive ou serviço usa? |
| Tipo de superfície | Formulário, lista, Kanban, dashboard, leitura, dados técnicos, biblioteca, onboarding, pesquisa, legado ou ação externa? |
| Ações reais | Criar, editar, arquivar, concluir, reprogramar, liberar, navegar ou nenhuma? |
| Persistência | Validada, em código aguardando teste, parcial, inexistente ou não aplicável? |
| Relação com caso | Usa `case_id`? Lead? pessoa? núcleo? produto? |
| Sobreposição | Em quais outras abas/card a mesma informação aparece? |
| Estado de uso | Ativo, legado usado, legado não usado, stub, mock, referência, técnico? |
| Destino na nova estrutura | Manter, mover, consolidar, recolher, arquivar, substituir ou remover UI? |
| Justificativa | Qual evidência sustenta a decisão? |
| Dependência | O que precisa ser validado antes de mudar? |

## 6. De-para obrigatório

Para cada grupo atual, produzir um de-para com esta estrutura:

| Origem atual | Problema | Destino canônico | Tratamento | Regra de dados | Critério de aceite |
|---|---|---|---|---|---|
| Aba/grupo/card/rota atual | Duplicação, legado, lista, dado técnico, fluxo real, stub ou ausência de fonte | Uma das seis abas aprovadas/subpágina contextual | Manter, mover, fundir visualmente, recolher, arquivar ou substituir por link contextual | Fonte canônica e vínculo obrigatório | Teste de navegação, ação e persistência quando aplicável |

### Tratamentos permitidos

```text
MANTER
MOVER
CONSOLIDAR_VISUALMENTE
RECOLHER_EM_DADOS_TECNICOS
TRANSFORMAR_EM_FORMULARIO
TRANSFORMAR_EM_LISTA_ACAO
TRANSFORMAR_EM_KANBAN
ARQUIVAR_COM_HISTORICO
REMOVER_UI_SEM_USO
MARCAR_STUB
AGUARDAR_DECISAO_DE_FONTE_CANONICA
```

“Remover” só pode ser usado para UI redundante sem valor operacional e depois de registrar destino/histórico. Não apagar tabela, dado, documento ou registro por simplificação de navegação.

## 7. Indicadores: classificação obrigatória

Todo card/contador/alerta deve ser classificado antes de permanecer no topo:

| Tipo | Definição | Tratamento |
|---|---|---|
| Indicador real acionável | Tem fonte persistida, fórmula/rule, entidade afetada e ação contextual | Manter no cockpit apropriado |
| Indicador real de leitura | Tem fonte e valor real, mas não requer ação | Manter em seção secundária, se útil |
| Lista de trabalho | Registros reais filtráveis com ação | Converter em lista/kanban, não em card repetido |
| Dado técnico | Integridade, logs, IDs, auditoria, gates e diagnóstico | Recolher no contexto técnico correto |
| Estado de onboarding | Etapa, pendência ou marco da jornada | Direcionar ao onboarding único; não repetir em todos os grupos |
| Estado de pesquisa | Fonte, hipótese, evidência, documento ou pendência | Direcionar ao domínio Pesquisa e contextualizar no Caso 360 |
| Card redundante | Reexibe a mesma informação sem ação nova | Remover da superfície duplicada ou substituir por link contextual |
| Métrica sem dados suficientes | Não tem base persistida/confiável | Exibir “Sem dados suficientes” ou retirar do cockpit |
| Stub/mock | Texto fixo/array local/sem consulta real | Marcar stub; não apresentar como indicador ou funcionalidade |

## 8. Painel Ops e Kanban

### Painel Ops

O Painel Ops deve ser submetido a inventário de origem e uso. Como é relatado como legado de sistema não utilizado, ele não pode continuar definindo a arquitetura principal apenas por existir.

Possíveis destinos, a decidir com evidência:

```text
- Tarefas e execução → Checklist/Kanban da nova estrutura.
- Atalhos de criação → contexto do Caso 360 ou formulário de ação.
- Microentregas → Jornada/Onboarding e Biblioteca Mestre.
- Pendências de pesquisa → Pesquisa.
- Métricas/alertas → cockpit/Visão Geral, somente se reais e acionáveis.
- Dados técnicos → seção recolhida ou auditoria.
```

### Kanban

O Kanban é candidato a superfície prioritária de execução se atender a estes requisitos:

```text
- cada cartão representa entidade real;
- possui case_id/lead_id/pessoa aplicável;
- mudança de coluna persiste;
- status, responsável e prazo são reais;
- abre o contexto certo;
- não cria duplicidade de tarefa ou próxima ação;
- não substitui o Caso 360, apenas oferece visão de fluxo.
```

O Kanban deve ser avaliado como forma de visualização do motor de trabalho, e não como fonte paralela de dados.

## 9. Painel de Calls e Discovery

O Painel de Calls/Discovery já existe e deve constar no de-para como entrada e handoff:

```text
Lead
→ Call/Discovery
→ resumo estruturado
→ responsável e próxima ação
→ oportunidade/proposta
→ caso canônico
→ Caso 360
```

Dump/transcrição de WhatsApp e call devem ficar como referência interna restrita, vinculada ao lead/oportunidade/caso. Não devem ser duplicados no App Cliente, nem tratados como indicador ou lista solta.

## 10. Resultado esperado

A entrega desta auditoria deve gerar, antes de qualquer código:

1. Um inventário completo de grupos, abas, rotas, cards e listas.
2. Um de-para integral da estrutura atual para as seis abas aprovadas e suas subpáginas.
3. Um mapa de sobreposições: cards repetidos, onboarding repetido, pesquisa paralela, dados técnicos duplicados e legados sem uso.
4. Uma matriz específica de Painel Ops, Kanban, microentregas, Pesquisa Operacional, Painel de Calls/Discovery e patrimônio material.
5. Uma lista priorizada de pequenas mudanças que podem ser feitas sem tocar motores ainda bloqueados.
6. Uma lista de decisões de arquitetura que exigem aprovação explícita antes de qualquer migração, arquivamento ou consolidação de dados.

## 11. O que pode ser adiantado sem mudar dados

Após inventário e aprovação de cada de-para, podem ser preparados em PRs separadas e reversíveis:

- Remoção de botões de navegação redundantes, preservando as abas/subpáginas.
- Recolhimento visual de dados técnicos repetidos.
- Substituição de card redundante por link contextual para a fonte principal.
- Rotulagem explícita de stub, lista de referência ou “sem dados suficientes”.
- Organização do Kanban como visão da mesma fonte de tarefas, sem nova tabela.
- Ajuste de menu para apontar para a superfície canônica já existente.
- Consolidação visual de formulários já existentes sem migrar registros.

Não podem ser adiantados sem autorização específica:

- Migração/unificação de pesquisa e evidências.
- Migração/unificação de onboarding.
- Criação de `case_participants` ou reapontamento de pessoas/núcleos.
- Sincronização do perfil institucional/CNPJ.
- Exclusão/arquivamento de dados.
- Indicadores que dependam de fontes ainda concorrentes ou não validadas.

## 12. Próxima ação

A próxima ação é ler integralmente os documentos CA-UX-03 e a revisão de layout/Mapa de Autoridade do GitHub, extrair os nomes canônicos e iniciar o inventário aba a aba. Somente então será produzida a versão final do de-para da estrutura de seis abas.

> Simplificar não é esconder trabalho em outra aba. É dar a cada dado, ação e jornada um único lugar principal, com contexto suficiente para operar sem duplicação.
