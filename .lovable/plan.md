# App Cliente fiel ao mockup aprovado de 17 páginas

## Objetivo
Preparar o App Cliente nas sete rotas oficiais, replicando a composição visual do mockup aprovado e da prancha mobile, sem alterar dados, regras, permissões, publicações ou fontes existentes.

## Escopo visual
1. **Estrutura comum**
   - Ajustar o cabeçalho navy para seguir marca, identificação do aplicativo, título e subtítulo da tela.
   - Manter o rodapé fixo com exatamente sete abas: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta; ativo em dourado.
   - Uniformizar fundo off-white, cartões brancos, tipografia serifada nos títulos, filetes dourados, espaçamento e estados vazios.

2. **Sete telas oficiais**
   - **Home:** cartão principal da jornada, próxima ação, achados e microentrega somente quando já existirem/publicados.
   - **Jornada:** Linha Ancestral e Linha do Processo separadas, com Momentos de União como conector e etapa real.
   - **Radar:** gráfico das seis dimensões, lista das dimensões e próximo passo, sem criar percentual onde ele não existe.
   - **Árvore:** estrutura G1–G5, ligações e atualização publicada, sem inventar pessoas ou parentescos.
   - **Documentos:** Solicitados, Recebidos, Liberados e Entregas, preservando upload e download reais.
   - **Legado:** abertura editorial e coleções publicadas; vazios específicos quando não houver material.
   - **Conta:** dados do acesso, acompanhamento, alertas e histórico, sem expor informação interna.

3. **Páginas complementares do mockup**
   - Tratar variações das 17 páginas como estados e seções das sete rotas existentes.
   - Não criar rota, aba, fonte, dado, KPI ou componente paralelo.

## Preservações obrigatórias
- Manter todas as leituras, links, botões, ações, atributos `data-*`, estados de carregamento/vazio/erro e regras de visibilidade.
- Preservar o caso ativo, conteúdo sanitizado e a separação entre cliente e visualização master.
- Não tocar no banco, schema, migrations, RLS, queries, funções de servidor, permissões, cálculos ou publicação.

## Validação
- Abrir as sete abas com sessão master e caso real em 375 px e desktop.
- Comparar cada captura com o mockup aprovado.
- Confirmar rodapé de sete itens, tela ativa, ausência de rolagem horizontal e erros de console.
- Confirmar que vazios continuam honestos e que nenhuma informação interna aparece.
- Verificar o resultado do build e registrar as prévias por tela.
