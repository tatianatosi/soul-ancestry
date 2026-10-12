# App da Ana — acabamento da Árvore, Jornada e Conta

Fica só nas telas do App que já existem. Não entra nenhuma aba, tela ou dado inventado.

## 1. Árvore
Já está pronto: as linhas douradas ligam as 8 pessoas publicadas, e as gerações vão de 1 a 5.
Falta fazer:
- **Ana Luiza como "Você":** hoje a geração 1 mostra um cartão "Você" e, ao lado, um cartão de Ana Luiza. Os dois passam a ser um só, com o nome dela e o destaque em ouro.
- **Destaque em ouro dos ascendentes:** Lotte e Otto, e também Rudolf e Heinrich, recebem o mesmo destaque. Eles são marcados por estarem na linha direta de ascendência da titular, calculada pelos vínculos aprovados, sem lista fixa de nomes. Assim, o destaque nunca depende de digitar nomes no código.
- **Moldura:** o quadro "Ligações da família" vem logo abaixo das gerações, com borda dourada e mais respiro.
- **Ordem das ligações:** das gerações mais antigas para as mais novas, para a leitura acompanhar a história.

## 2. Jornada
- Os quatro marcos já aparecem.
- Vou conferir em 375 px se algum texto quebra palavras ou sai da tela, e corrigir o espaçamento se for preciso.
- Vou confirmar que não sobra "Lacuna" nem linha cinza de erro nessa aba.

## 3. Documentos
Bloqueado: o caso não tem nenhum arquivo. Os cartões e os botões de ver e baixar aparecem quando os PDFs forem enviados no Desk e liberados. Nada será simulado.

## 4. Conta
- Quando a própria Ana entra, a Conta já mostra o nome dela, que vem do cadastro.
- Na visão de administradora, hoje fica neutra. Passa a mostrar o código do caso, CA-CID-AT-FAM-2026-001, e o nome da titular vindo do cadastro do caso, sem e-mail, documento ou valor de outra pessoa.
- O nome de demonstração só continua na demonstração oficial.

## 5. Conferência
- Capturas em 375 e 1280 px de Árvore, Jornada e Conta.
- Checagem de tipos e testes do App.
- Publicação do site só com a sua autorização.

## Detalhes técnicos
- `explorador-arvore.tsx`: na G1, se houver uma pessoa publicada, ela vira a âncora. Calcular os ascendentes diretos subindo as arestas `pai_mae` de `vinculosArvore` a partir da pessoa da G1, e aplicar a classe `app-arvore-perfil--destaque`. Ordenar as ligações pela geração da pessoa de origem.
- `portal-v11.css`: estilos do destaque e da moldura com `--ca-gold` e `--ca-navy`, sem cor solta.
- `conta.tsx` e a leitura administrativa: usar `previa.identidade.codigo` e incluir em `dadosPortalComoAdmin` o nome do titular do caso, vindo de `crm_casos` → cliente. É leitura de equipe, já protegida pela organização.
- `jornada.tsx` / `portal-v11.css`: ajustes de quebra só se a captura mostrar problema.
