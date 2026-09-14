# Patch global de responsividade do Desk autenticado

## Escopo
- Alterar somente a moldura autenticada, os estilos globais escopados ao Desk e os componentes-base visuais usados por todas as telas.
- Não alterar dados, banco, permissões, rotas, consultas, gravações, catálogo, gates, jornada Ana, navegação ou conteúdo das telas.
- Não arquivar nenhuma tela e não executar a ligação funcional das superfícies nesta etapa.

## Implementação
1. Marcar a moldura autenticada como escopo exclusivo do Desk e impedir que ela ou seus filhos ampliem a largura da página.
2. Em telas abaixo de 768px, manter a navegação lateral fechada por padrão e aberta somente como painel sobreposto acionado pelo menu.
3. Aplicar `min-width: 0`, largura máxima de 100% e quebra segura de texto longo em conteúdo, cartões, formulários, filtros, cabeçalhos e componentes-base do Desk.
4. Fazer grades do Desk usarem uma coluna no mobile, preservando as composições existentes a partir de 768px.
5. Conter tabelas em rolagem horizontal própria, sem permitir vazamento para o corpo da página.
6. Ocultar no mobile os lançadores flutuantes do Desk e reservar espaço inferior com `safe-area-inset-bottom`.
7. Corrigir cabeçalhos móveis para que título, ações e ícones não se sobreponham.

## Validação e evidência
- Capturar o estado anterior nas rotas `/painel`, `/calls`, `/casos`, `/biblioteca`, `/contratos` e `/configuracoes`.
- Após o patch, testar as seis rotas em 320, 375, 390 e 430 px.
- Conferir largura do documento, cortes, sobreposição do menu/lançador, tabelas, filtros, formulários e textos longos.
- Entregar somente comparativos antes/depois e a lista exata dos arquivos globais alterados.
- Parar após essa entrega para nova aprovação.
