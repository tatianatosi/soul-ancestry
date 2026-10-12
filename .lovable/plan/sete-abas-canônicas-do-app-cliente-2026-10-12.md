# Sete abas canônicas do App Cliente

## Escopo
- Alterar somente `src/components/portal/abas-app-cliente.tsx` e `src/components/portal/portal-shell.tsx`.
- Manter exatamente sete itens de primeiro nível, nesta ordem: Painel, Jornada, Árvore, Descobertas, Documentos, Biblioteca e Conta.
- Reutilizar as rotas existentes: `/portal`, `/portal/jornada`, `/portal/arvore`, `/portal/radar`, `/portal/documentos`, `/portal/legado` e `/portal/conta`.
- Usar os ícones Home, Flag, GitFork, Compass, FileText, BookOpen e UserRound.

## Apresentação
- Preservar integralmente a identidade visual definida em `portal-v11.css`.
- Ajustar somente a composição da barra para manter os sete rótulos em uma linha, sem rolagem ou corte horizontal em 375 px e 1280 px.
- A gestão de assinatura continuará dentro de Conta; nenhuma aba, rota ou tela será criada.

## Validação
- Conferir que as duas listas contêm os mesmos sete itens, na mesma ordem, sem Financeiro ou Assinatura.
- Validar visualmente o App em 375 px e 1280 px.
- Conferir o diagnóstico automático da prévia após a mudança.

## Limites
- Não alterar banco, consultas, funções, permissões, regras de negócio, conteúdo publicado ou qualquer arquivo fora das duas pastas autorizadas.
- Não publicar o projeto.
