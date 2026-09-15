# Desk: painel consolidado, navegação aprovada e entradas da Biblioteca

## Objetivo
Aplicar somente apresentação e composição sobre fontes já existentes, sem alterar dados, banco, regras de acesso, writers, publicação ou deploy.

## 1. Painel de KPIs dentro de Hoje
- Manter `/painel` como entrada canônica do grupo **Hoje**, sem criar nova aba ou rota principal.
- Acrescentar uma visão consolidada com sete seções: **Hoje, Comercial, Kanban, Pesquisa, Financeiro, Jurídico e Portal**.
- Exibir em cada seção os mesmos quatro indicadores já definidos nas respectivas superfícies, reaproveitando seus cálculos e leitores reais.
- Identificar o escopo de cada conjunto quando ele for organizacional ou do caso em foco; não misturar contagens sem rótulo.
- Mostrar `0`, `Sem registros` ou erro de leitura de forma explícita. Nenhum número será estimado.
- Tornar cada seção acionável para sua tela de origem, sem duplicar ações de escrita no painel.
- Usar grade responsiva: blocos analíticos em duas colunas no desktop e uma coluna no celular; até quatro números por seção.

## 2. Cabeçalho e navegação do Desk
- Preservar a navegação canônica de **seis grupos** definida no produto:
  1. Hoje
  2. Marketing & Comercial
  3. Pessoas & Casos
  4. Inteligência & Pesquisa
  5. Formalização & Financeiro
  6. Governança & Administração
- Manter no desktop a sidebar navy da prancha aprovada, com marca e estado ativo dourado.
- No celular, aplicar cabeçalho navy com marca e abrir os seis grupos em uma grade de duas colunas.
- Os subitens continuam dentro do grupo correspondente; nenhuma tela go-live vira novo grupo e nenhum menu antigo de 7, 8 ou 14 itens será restaurado.
- Preservar permissões, badges, menu da conta, logout e comportamento atual de expansão.

## 3. Seis entradas da Biblioteca Mestre
- Na primeira dobra de `/biblioteca`, criar seis cards de entrada:
  - Acervo
  - Bases Genealógicas
  - Dicionários
  - Trilhas Jurídicas
  - Modelos
  - Referências
- Cada card abre a seção existente correspondente da Biblioteca Mestre; não cria tabelas, conteúdo, catálogo ou fonte paralela.
- Contagens aparecem somente quando o leitor atual entregar fonte válida; caso contrário, o card mostra `Sem registros`.
- A gestão detalhada permanece recolhida abaixo das entradas, preservando busca, proveniência, versionamento, arquivamento lógico e revisão existentes.
- Biblioteca Mestre continua interna e não será projetada no App Cliente.

## Contrato visual
- Aplicar a paleta já aprovada do Desk: navy dominante, ativo dourado, canvas creme e terracota apenas para atenção.
- Títulos editoriais em serifada; números, listas e controles em sans-serif.
- Selos sempre combinam cor e texto; estado nunca depende apenas da cor.
- Validar 1440 px e 375 px sem cortes, sobreposição ou rolagem horizontal.

## Validação
- Conferir as sete seções do painel contra as telas de origem e suas fontes reais.
- Verificar navegação dos seis grupos, submenus, permissões e estados ativos em desktop e mobile.
- Verificar os seis cards da Biblioteca com dados existentes e vazios honestos.
- Rodar testes direcionados, verificação de tipos e build.
- Produzir capturas desktop e 375 px de `/painel`, do menu móvel aberto e de `/biblioteca`.

## Fora desta rodada
- Não implementar as expansões maiores de Marketing, Conteúdo, Planejador, contrato ou jornada descritas no rascunho.
- Não criar nova taxonomia de navegação, Biblioteca como catálogo, gráficos decorativos ou dados fictícios.
- Não alterar App Cliente, banco, dados, RLS, migrations, writers, contratos, faturas, campanhas, integrações, publicação ou deploy.
