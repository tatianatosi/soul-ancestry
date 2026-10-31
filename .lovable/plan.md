# Árvore inteira no celular e publicação

Os ajustes de hoje já fazem a Árvore abrir de G6 até "Você" na prévia. Eles ainda não estão no link público, onde o cartão de Ana Luiza continua cortado.

## Passos
1. Conferir na prévia, em 375 px (e em 320 px, para celulares menores), se o cartão de Ana Luiza aparece inteiro, com uma pequena folga embaixo, ao abrir e depois de "Restaurar visão".
2. Se ainda cortar: ajustar só o enquadramento inicial da Árvore, reduzindo um pouco o zoom ou aumentando a altura da área do desenho no celular. Pessoas, ligações, cores e outras abas não mudam.
3. Rodar os testes da Árvore.
4. Antes de publicar, consultar o resultado da verificação de segurança. Os 3 achados de preço e contrato continuam abertos e eu aviso sobre eles, mas a publicação não depende deles.
5. Publicar em https://soul-ancestry.lovable.app e conferir a Árvore no link público em 375 px e 1280 px: G6 a "Você" inteiros, sem rolagem lateral e sem erros.

## Fora do escopo
- Contrato da Ana: as linhas antigas do rateio continuam aguardando a sua decisão.
- Parentescos e dados no banco: nada muda.

## Detalhes técnicos
- O ajuste, se for necessário, fica em `enquadramentoGenograma` (`genograma-layout.ts`), que serve tanto à abertura quanto ao "Restaurar visão". O teste focal ganha um caso com a altura do celular.
