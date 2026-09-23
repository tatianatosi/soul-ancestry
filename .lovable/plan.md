# Corte visual: prancha v4, App de 17 páginas e contrato da Ana

## Objetivo
Aplicar o acabamento visual aprovado às superfícies oficiais, sem alterar dados, regras, permissões, rotas, cálculos ou estados. O Desk mantém seis grupos; o App mantém sete abas.

## 1. Nova proposta do contrato da Ana
- Refazer o wireframe completo com mais espaço entre capítulos, linha de leitura confortável e menos caixas simultâneas.
- Preservar o inventário real já confirmado: contrato `2026-CB-0001` v1, proposta aprovada de R$ 9.600,00, Canva sem URL persistida, Anexos I–V, instrumentos internos, ausência de OS, revisão humana, efeitos separados e histórico.
- Entregar desktop e 375 px como arquivos de aprovação, sem tocar na tela do produto.

## 2. App Cliente — mockup aprovado de 17 páginas
- Mapear as 17 páginas para as sete rotas oficiais, tratando páginas complementares como estados ou seções das rotas existentes — nunca como novas abas ou rotas paralelas.
- Aplicar primeiro Home e Radar; depois Jornada, Árvore, Documentos, Legado e Conta.
- Reproduzir cabeçalho, hierarquia, superfícies, espaçamento, tipografia, rodapé fixo e estados vazios do mockup.
- Preservar todas as leituras reais, textos de estado, alertas, ações, atributos `data-*` e filtros de publicação.
- Remover apenas divergências visuais; nenhum vazio será preenchido com conteúdo inventado.

## 3. Desk — prancha visual v4
- Aplicar o acabamento ao shell e às rotas oficiais, preservando os seis grupos de `GRUPOS_DESK`.
- Harmonizar faixa institucional, topo, sidebar, navegação, fundo, cards, hierarquia e responsividade com os tokens canônicos.
- Manter componentes, propriedades, dados, ações, estados e atributos existentes; nenhuma rota `/golive/*` será promovida como navegação oficial.

## 4. Prova visual autenticada
- Com sessão master e o caso `CA-CID-AT-FAM-2026-001`, validar Home, Jornada, Radar, Árvore, Documentos e Conta em desktop e 375 px.
- Confirmar caso real, estado honesto, ausência de conteúdo demo/interno, sete abas, console sem erro e nenhum overflow horizontal.
- Abrir o wireframe completo da Ana nas duas larguras e registrar: Resumo, Partes, Escopo, Comercial, Texto, Matriz, Anexos, Assinatura e Histórico.
- Capturar evidências por tela e por largura.

## Validação e entrega
- Executar tipos, testes relevantes e uma validação de compilação após o corte visual.
- Conferir visualmente todas as capturas; corrigir cortes, colisões, contraste, espaçamento e palavras quebradas.
- Informar arquivos alterados, resumo do diff, verificações e capturas.
- Parar antes de commit, push, PR, merge, publicação ou deploy.

## Limites técnicos
- Sem mudanças em banco, schema, migrations, RLS, policies, consultas, funções de servidor, permissões, regras de publicação, cálculo do Radar, caso ativo ou dados reais.
- Sem mocks, fixtures, KPIs falsos, fontes duplicadas, novas rotas ou navegação extra.
- Somente TSX/CSS/tokens e artefatos visuais estritamente necessários.
