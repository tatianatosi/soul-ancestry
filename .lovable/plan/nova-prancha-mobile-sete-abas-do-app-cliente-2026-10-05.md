# Nova prancha mobile — sete abas do App Cliente

## Resultado
Atualizar somente a apresentação do App e gerar uma nova prancha das sete abas com o conteúdo publicado da Ana, sem dados inventados ou publicação. A coluna “Falta” será conferida item a item; ausência de campo será registrada, não disfarçada como entrega.

## Mudanças nas telas
- **Navegação e topo:** manter as sete abas; no celular, rótulos curtos (Docs), fonte mínima de 11 px e toque de 44 px; topo compacto com nome do caso. Usar apenas tokens existentes.
- **Home:** preservar pessoas e “Da nossa jornada”; organizar próximo passo, documentos prioritários (até três) e alerta de achado somente com conteúdo autorizado. Consolidar ausências, sem repetir cartões vazios. Atalho para Conta enquanto o canal funcional da equipe não estiver disponível; não inventar telefone ou endereço.
- **Jornada:** tornar Origem, Processo e Memória encontráveis no celular por controles compactos; preservar as duas linhas existentes e reservar a terceira com estado vazio honesto quando não houver memória publicada. Não converter nomes de pessoas em eventos históricos inventados.
- **Radar:** mostrar os percentuais já fornecidos e “Como calculamos” em todas as seis dimensões; Conexões combina contagem e percentual somente com denominador real. Não alterar a fórmula.
- **Árvore:** preservar os nomes e gerações publicados; distinguir árvore por gerações de genograma real. Relações, mapa, lacunas e fontes dependem de campos sanitizados existentes; não inferir parentescos ou fabricar posições. Rótulos incorretos que vêm da biblioteca serão pedidos ao Claude, sem alterar a biblioteca.
- **Documentos:** organizar Pendentes, Em conferência, Recebidos e Liberados sem deduzir estados. Contagem N de M só com checklist completo. Preservar o download autorizado existente; sem arquivo liberado, não criar ação falsa.
- **Legado:** distinguir as coleções existentes de Entrevistas, Memória, Acervo e Descobertas/Biblioteca; conteúdo novo só quando a projeção autorizada existir, com uma mensagem consolidada para o que falta.
- **Conta:** preservar assinatura publicada; não acrescentar “3 assinaturas, 10 meses” sem campos entregues ao App. Canal funcional, preferências, privacidade em leitura e upsell só com dados/textos autorizados; registrar as dependências ausentes.

## Limites técnicos
- Alterar somente `src/routes/portal/*` e `src/components/portal/*`.
- Não alterar `src/lib`, testes, dependências, Desk, banco, permissões, gravações, AGENTS.md ou roadmap.md.
- Não reverter commits, emitir links, enviar mensagens, cobrar, assinar, publicar conteúdo ou lançar versão.
- Reutilizar leitores e componentes existentes. Se um teste proibir a mudança, parar e informar o arquivo e a restrição; não alterar o teste.

## Conferência e entrega
- Executar testes existentes relevantes; verificar o resultado da compilação da plataforma.
- Conferir as sete abas na sessão administrativa da Ana em 375 px; validar navegação também em 360, 390 e 430 px.
- Gerar sete capturas e uma prancha mobile nova, em versão separada das anteriores.
- Entregar lista curta de arquivos alterados e matriz “elemento | dado disponível | estado apresentado | pedido ao Claude”.
- Não declarar genograma, mapa, checklist completo, contato funcional ou preferências concluídos quando faltarem campos ou ações reais.
