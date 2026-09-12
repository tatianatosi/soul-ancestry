# Kit Pantone unificado — Desk e App Cliente

## Objetivo
Consolidar um único padrão visual reutilizável para o Desk e o App Cliente e aplicar esse padrão a todas as telas reais do Desk, sem alterar navegação, dados, permissões ou fluxos.

## Implementação
- Unificar tokens e componentes reutilizáveis em torno da paleta Pantone aprovada do kit: `#13294B`, `#1B365D`, `#F0EEE9`, `#C2A84D`, `#28334A` e branco.
- Manter os logotipos vetoriais locais oficiais e a tipografia Cormorant Garamond + Inter no kit exportável.
- Fazer o shell compartilhado do Desk aplicar o padrão Pantone por padrão, cobrindo também carregamento, erro e vazio; manter os seis grupos vigentes.
- Manter o App Cliente no mesmo padrão, preservando exatamente as sete abas: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
- Remover divergências entre o kit consolidado, o kit exportável e os tokens de tela, mantendo uma única definição reutilizável e sem dados embutidos.
- Corrigir somente exceções visuais de alto impacto encontradas na revisão das telas: cores fora dos tokens, componentes de estado inconsistentes e superfícies que escapem do shell comum.

## Verificação
- Conferir por código todas as rotas reais do Desk e classificar a aderência após a aplicação do shell comum.
- Validar Desk e App Cliente em desktop e celular, incluindo navegação, títulos, cartões, tabelas, estados vazios e foco visível.
- Confirmar compilação limpa e ausência de erros de tela/console.
- Atualizar o pacote exportável para adaptação no Soul Ancestry, sem backend, migrations, RLS, integrações, CRM novo ou telas novas.

## Preservações
- Nenhuma mudança em fontes de dados, regras operacionais, autenticação, permissões, gravação ou publicação.
- Nenhuma nova aba ou grupo.
- Nenhum conteúdo demonstrativo apresentado como dado real.
- Nenhuma mudança no site institucional ou publicação automática.
