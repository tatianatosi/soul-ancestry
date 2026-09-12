# Radares e gráficos do Desk

## Objetivo
Ajustar apenas a prévia visual do Desk para que os radares e novos elementos gráficos sigam a mesma construção visual do App Cliente, sem alterar dados, permissões ou navegação.

## Implementação
- Criar um radar gráfico reutilizável com teia, anéis, eixos, área preenchida, pontos e legenda.
- Manter a distinção vigente: Radar Interno do Desk com 4 eixos; App Cliente com 6 dimensões.
- Substituir as barras atuais da tela “Radar & Matrizes” pelo radar em teia e refinar a matriz com legenda visual e leitura por quadrantes.
- Aplicar a mesma linguagem gráfica a elementos novos da prévia, incluindo progressão da jornada, linha do tempo e vínculos familiares, sem mudar o conteúdo das abas.
- Conferir a prévia em desktop e celular, além de validar carregamento sem erros.

## Limites
- Trabalho somente visual e demonstrativo em `/previa-desk`.
- Nenhum dado real, regra operacional, banco, acesso, menu ou fluxo autenticado será alterado.
