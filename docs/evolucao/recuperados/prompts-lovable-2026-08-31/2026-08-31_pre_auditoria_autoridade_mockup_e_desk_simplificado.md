# Pré-auditoria obrigatória — Autoridade Admin, mockup aprovado e Desk simplificado

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: mandato de pré-auditoria e reconciliação de referências
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Prompt_Claude_Autoridade_Admin_Mapa_Desk_e_App_Cliente.md
  - clube-ancestral-mockup.pdf
  - Reveja-o-desk-Fluxo-visual-completo-WhatsApp.pdf
  - CA-UX-03_Navegacao_Desk_8_Grupos.md
  - ABAS_DESK_ORIGINAL_E_INCORPORACOES_v1.0.md
  - Elemento-NoDeskIntelligence-NoAppCliente.csv
escopo:
  - estabelecer leituras obrigatórias antes da auditoria do Desk e App Cliente
  - diferenciar taxonomia visual aprovada, navegação atual e estrutura de simplificação
  - corrigir inconsistências de nomes e proibir mudança prematura de rotas/abas
premissas:
  - o Prompt de Autoridade Admin define método de evidência, não a arquitetura visual final
  - o mockup aprovado define os nomes visuais canônicos de 7 telas do App e 7 telas do Desk
  - o fluxo visual WhatsApp/App/Desk define 6 núcleos conceituais para simplificação futura
  - CA-UX-03 registra a navegação atualmente implementada em 8 grupos
limites:
  - não autoriza alteração de código, rotas, dados, migrações, RLS, sessão, permissões ou auditoria
  - não autoriza renomear, apagar, fundir ou deslocar abas antes do inventário e decisão formal
  - não autoriza classificar tela ou ação como validada sem teste de persistência e refresh
próximos passos:
  - produzir matriz de rastreabilidade entre 7 telas do mockup, 14 abas originais, 8 grupos atuais e 6 núcleos simplificados
  - iniciar inventário por rota/aba depois da matriz
critério de aceite:
  - todo item futuro de auditoria deve apontar para referência de nome, grupo atual, núcleo de destino e evidência técnica
substitui:
  - interpretações que trataram os 8 grupos atuais ou os 6 núcleos como substituição automática da taxonomia aprovada
```

## Objetivo

Antes de continuar qualquer auditoria, inventário, de-para, simplificação de menu ou revisão visual, é obrigatório ler e conciliar cinco referências. O objetivo é evitar que a operação misture quatro modelos diferentes do Desk e passe a renomear, mover ou avaliar itens contra uma estrutura incorreta.

## Referências obrigatórias

| Ordem | Documento | Papel na auditoria |
|---:|---|---|
| 1 | `Prompt_Claude_Autoridade_Admin_Mapa_Desk_e_App_Cliente.md` | Método de auditoria: capacidade por rota, evidência técnica, persistência, organização, classificação e releitura após refresh |
| 2 | `clube-ancestral-mockup.pdf` | Taxonomia visual aprovada: 7 telas do App Cliente e 7 telas do Desk Intelligence; explicitamente um protótipo sem dados reais |
| 3 | `Reveja-o-desk-Fluxo-visual-completo-WhatsApp.pdf` | Visão de produto e simplificação: WhatsApp inicia, App sustenta valor percebido, Desk produz/decide; 6 núcleos conceituais para o Desk |
| 4 | `ABAS_DESK_ORIGINAL_E_INCORPORACOES_v1.0.md` | Inventário histórico das 14 abas originais e de-para de incorporações posteriores; não autoriza renomear ou deslocar abas sem decisão |
| 5 | `CA-UX-03_Navegacao_Desk_8_Grupos.md` | Navegação atualmente implementada no código, em 8 grupos e rotas preservadas |

## Hierarquia de interpretação

```text
Método de prova       → Prompt de Autoridade Admin
Nomes visuais         → Mockup aprovado
Visão da jornada      → Fluxo WhatsApp / App Cliente / Desk
Origem e incorporações→ Abas originais e incorporações
Navegação atual       → CA-UX-03 em 8 grupos
Destino simplificado  → 6 núcleos do fluxo visual, somente após inventário e decisão
```

Nenhum documento, isoladamente, invalida os demais.

## Taxonomia visual aprovada

### App Cliente — 7 telas

```text
Home
Jornada
Radar
Árvore
Documentos
Legado
Conta
```

### Desk Intelligence — 7 telas

```text
Visão Geral
Casos 360
Checklist
Validação Jurídica
Radar Interno
Alertas
Biblioteca Mestre
```

O mockup informa que é um **protótipo navegável sem dados reais**. Portanto, seus nomes e papéis visuais são aprovados, mas não provam motor, CRUD, persistência ou integração. [file:782]

## Estrutura de simplificação

O fluxo visual estabelece estes seis núcleos para orientar o de-para futuro:

```text
1. Visão geral
2. Casos 360
3. Pesquisa e Biblioteca
4. Financeiro e formalização
5. Radar e decisões
6. Operação
```

Esses núcleos são uma estrutura de organização operacional. Eles não autorizam apagar as sete telas aprovadas do mockup, renomear a navegação atual ou fundir rotas antes de mapear as capacidades e fontes de dados. [file:786]

## Navegação atual implementada

A navegação presente no repositório está documentada como oito grupos:

```text
Hoje
Comercial
Casos
Pesquisa
Contratos e financeiro
Cliente
Governança
Administração
```

Ela preserva rotas existentes e declara que dados, banco, RLS e integrações não foram alterados pela reorganização de navegação. [file:787]

## Regras de auditoria que permanecem obrigatórias

Para cada grupo, rota, aba, card, formulário ou botão, registrar:

```text
rota
→ componente
→ handler
→ server function/RPC
→ tabela/view/bucket/serviço
→ escopo de usuário e organização
→ payload
→ resultado de escrita
→ linhas afetadas
→ releitura
→ refresh
→ resultado
```

Classificar um item com apenas uma categoria principal:

```text
HABILITADA_E_VALIDADA
HABILITADA_EM_CODIGO_AGUARDANDO_TESTE
PARCIAL
BLOQUEADA_POR_REGRA_DE_ESTADO
ACAO_EXTERNA_NAO_IMPLEMENTADA
SOMENTE_LEITURA_DELIBERADA
SEM_UI_PARA_FUNCAO_EXISTENTE
SEM_FUNCAO_OU_SCHEMA
COM_ERRO_OU_RISCO_CONHECIDO
```

Não usar presença de UI, CI verde, toast, rota, função, mock ou estado local como prova de persistência. [file:785]

## Princípios de produto a preservar

### Separação de camadas

```text
WhatsApp: inicia, chama atenção, recupera e apoia.
Desk: produz, decide, revisa, coordena e registra.
App Cliente: mostra progresso, próximos passos e valor já aprovado.
```

WhatsApp não é repositório operacional; App Cliente não mostra dados técnicos, hipóteses internas, evidências cruas, scores ou gates. [file:786]

### Microentregas

Microentregas são unidade de valor e devem seguir:

```text
achado/tarefa
→ produção
→ revisão humana
→ aprovação/liberação
→ destino contextual: App, WhatsApp, reunião, PDF ou interno
```

Elas devem conter caso, pessoa/núcleo quando aplicável, tipo, fonte/evidência, responsável, prioridade, estado, texto interno, texto cliente-facing, destino e data de liberação. Não são apenas um formulário solto em Ops. [file:786][file:788]

### Radar e árvore em dois níveis

- Desk: análise completa, fonte, conflito, risco, prioridade e evidência.
- App: informação simplificada e liberada, com linguagem compreensível e fatos validados.

Não expor elegibilidade, score, hipótese jurídica ou força probatória crua no App. [file:786]

## Mandato de auditoria corrigido

A auditoria seguinte deve produzir uma matriz por item com quatro identificadores simultâneos:

| Campo | Obrigatório |
|---|---|
| Nome visual aprovado | Uma das 7 telas do mockup, quando aplicável |
| Aba original | Uma das 14 abas históricas, quando aplicável |
| Grupo atual | Um dos 8 grupos de navegação existentes |
| Núcleo simplificado | Um dos 6 núcleos, ou “decisão humana pendente” |

Acrescentar finalidade real, dados, ações, persistência, sobreposição, origem, destino e tratamento proposto.

## Itens que exigem cuidado especial

- **Pesquisa:** há rotas/sistemas concorrentes; mapear e preservar antes de mover/remover UI.
- **Onboarding:** é motor futuro único; registrar onde aparece, mas não tratá-lo como uma coleção de abas independentes.
- **Painel Ops/Kanban:** avaliar como execução e visualização da mesma fonte de tarefa, sem torná-lo proprietário de microentregas ou onboarding.
- **Cliente/Portal:** é capacidade transversal de Casos 360 e liberação de conteúdo; não deve induzir cópia de caso.
- **Governança/Administração:** são camadas técnicas/transversais que precisam ficar acessíveis, mas não dominar a superfície diária do Desk.
- **Patrimônio material:** localizar o inventário específico antes de definir se cabe em Pesquisa, Biblioteca, Legado, Documentos ou outro submódulo.

## Próximos passos

1. Criar a matriz de rastreabilidade das referências acima.
2. Auditar grupo por grupo e rota por rota usando o Prompt de Autoridade Admin.
3. Identificar cards repetidos, listas sem ação, stubs, formulários, dados técnicos e fontes paralelas.
4. Propor de-para para os seis núcleos sem alterar navegação.
5. Separar melhorias de baixo risco de decisões que exigem aprovação: microentregas, onboarding, pesquisa, patrimônio e integrações.
6. Só depois preparar PRs isoladas para alterações de interface, mantendo todas as rotas e dados preservados.
