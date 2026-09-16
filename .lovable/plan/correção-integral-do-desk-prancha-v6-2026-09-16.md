# Correção integral do Desk — prancha v6

## Objetivo
Resolver as divergências P0, P1 e P2 já auditadas, implementar faixas auditáveis de KPIs nas 15 superfícies, consolidar a Biblioteca Mestre na rota existente e transformar o detalhe contratual em uma leitura única, sem criar dados, fixtures, tabelas, migrations, RLS, publicação ou deploy.

## 1. Indicadores das 15 superfícies
- Evoluir a faixa de KPIs para aceitar, em cada indicador, **fonte, fórmula, período e explicação do estado**, exibidos em detalhe recolhido.
- Manter no máximo quatro KPIs por superfície e mostrar zero/“Sem registros” quando a fonte real não retornar itens.
- Preservar os KPIs já ligados em Hoje, Comercial, Kanban, Pesquisa, Radar, Jurídico, Financeiro e Portal.
- Adicionar faixas, com dados já carregados, em Leads, Caso 360, Pessoa 360, Pessoas & Famílias, Painel do caso, Formalização e Configurações.
- Centralizar critérios frágeis de Pesquisa e Jurídico em funções nomeadas, sem alterar os dados ou estados persistidos.

## 2. Correções P0 da auditoria
- Renomear a superfície jurídica para **Validação jurídica da trilha**.
- Retirar o gráfico de Leads, preservando lista, ficha e ações.
- Retirar os gráficos secundários do Kanban e manter somente decisão por prazo.
- Fazer os gráficos consumirem os tokens Pantone vigentes, sem mudar a paleta global.
- Corrigir a numeração da Formalização.

## 3. Leveza e telas donas
- Reduzir o Painel do caso a quatro indicadores, resumos curtos e links para Pesquisa, Pessoas & Famílias, Caso 360, Financeiro e Portal; remover gráficos duplicados.
- Em Comercial, manter visão do funil e encaminhar a ficha/ação detalhada para Leads.
- Em Jurídico, concentrar conferência, risco e validação; em Formalização, manter a execução da cadeia.
- Em Financeiro, manter proposta/contrato apenas como contexto recolhido.
- Recolher textos extensos de proposta/contrato e detalhes secundários, preservando o conteúdo real.
- Reforçar visualmente Pessoa individual versus Núcleo familiar.
- Ajustar rótulos e legenda do Radar para leitura em 375 px.

## 4. Biblioteca Mestre na rota existente
- Manter `/biblioteca` dentro da navegação vigente e aplicar os seis cards: Acervo, Bases Genealógicas, Dicionários, Trilhas Jurídicas, Modelos e Referências.
- Cada card mostrará contagem real ou “Sem registros”, fonte e estado honesto.
- Bases Genealógicas poderá abrir a ação já existente na tela de fontes; os demais cards usarão somente ações já existentes.
- Não inventar fonte distinta para Modelos ou Referências: quando compartilharem o Acervo, isso será explicitado no detalhe, sem duplicar contagem como se fosse uma nova coleção.

## 5. Contrato em superfície única
- Usar a rota real de detalhe do contrato, preservando fonte, permissões, validações e ações existentes.
- Substituir a navegação fragmentada por leitura sequencial com atalhos internos para: Resumo, Partes, Escopo, Condição comercial, Texto, Anexos/OS, Validação jurídica da trilha e Assinatura/Histórico.
- Exibir somente o texto e os campos persistidos; ausência fica como “Não registrado”.
- Manter referência Canva apenas quando existir; caso contrário, mostrar “Link do Canva não registrado”.
- Preservar confirmações das ações existentes e não disparar assinatura, envio, publicação ou cobrança.

## 6. Validação
- Conferir compilação e testes existentes.
- Provar as 15 superfícies, Biblioteca e contrato em desktop, 390 px e 375 px.
- Verificar ausência de overflow, sobreposição, erro de console, gráfico sem fonte, CTA duplicado e rótulo técnico indevido.
- Entregar preview e capturas; não publicar nem fazer deploy.
