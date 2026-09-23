# Desk v4 compacto nas rotas oficiais

## Objetivo
Aplicar os previews v4 anexados como referência visual soberana do Desk. Cada superfície principal termina no último bloco previsto na prancha e preserva o restante como respiro visual.

## Implementação
- Manter o shell único existente: faixa institucional, busca, conta, sidebar dos seis grupos, título, subtítulo, estado e navegação horizontal.
- Ajustar **Hoje, CRM Vivo, Kanban, Caso 360, Pessoa 360, Radar & Matrizes, Pesquisa, Financeiro, Pessoas & Famílias, Jurídico & Contrato, Portal interno e Configuração** à composição, ordem, proporção e densidade das respectivas pranchas v4.
- Usar somente dados e estados reais já carregados. Ausências permanecem como vazios honestos; nenhum número, gráfico ou conteúdo demonstrativo será incorporado do kit.
- Limitar as faixas a quatro indicadores e eliminar da primeira leitura repetições, listas extensas e painéis técnicos.
- Preservar toda capacidade operacional existente em abas internas, detalhes recolhíveis, gavetas, modais ou links já existentes, sem apagar escritores, regras, atributos `data-*`, ações ou estados.

## Superfícies críticas
- **Caso 360:** visão geral apenas com cabeçalho da família, navegação interna, linha do tempo, participantes, progresso por frente, estado do dossiê e jornada D0–D365. Onboarding, gates, consentimento, checklist, ativação e diagnóstico ficam em **Fechamento e ativação** ou detalhes internos.
- **Jurídico & Contrato:** primeira leitura com escopo/assinatura, assinatura, validação jurídica/documental, conflitos/conferências, alertas e completude. Preparação do contrato permanece na rota operacional própria; inventários e matrizes extensas ficam recolhidos.
- **Financeiro:** quatro indicadores, fluxo do contrato, parcelas, reconciliação, alertas e os dois espaços de gráfico somente quando houver dados reais. Listas, filtros, formulários e detalhes permanecem acessíveis em gestão recolhida/gavetas.
- **Portal interno:** família/núcleos com acesso, conteúdo publicado e fila editorial curta; convites, autorizações e histórico ficam na gestão recolhida.
- **Configuração:** permissões, política operacional e auditoria; gestão detalhada de membros e capacidades fica recolhida.

## Restrições
- Nenhuma mudança em banco, schema, migrations, RLS, consultas, funções de servidor, permissões, publicação, cálculos ou caso ativo.
- Nenhuma rota, menu, tela paralela, fixture, mock, KPI ou fonte duplicada.
- Nenhum commit, push, merge, publicação ou deploy.

## Validação
- Comparar cada rota oficial com a prancha v4 correspondente em 1440 px.
- Confirmar console sem erro, ausência de overflow e grande área vazia intencional após o último bloco.
- Conferir que links, ações, estados, atributos `data-*` e conteúdos recolhidos continuam acessíveis.
- Executar verificação de tipos e validar o build registrado pela prévia.
- Entregar capturas comparáveis, arquivos alterados e capacidades preservadas; parar para aprovação.
