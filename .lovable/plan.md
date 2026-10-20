# Terminar o mockup do Desk V4 (c4d3bef9) e comparar com o mockup original

## Objetivo
Terminar a versão separada "Desk — mockup V4 completo: gavetas, árvore, funis" (código `c4d3bef9`) e entregar um PDF que compara cada aba com a prancha V4 original, página por página, com a lista exata do que falta. O trabalho fica isolado: o Claude continua aplicando o mockup no produto principal, nada é publicado e o App continua congelado.

## O que falta terminar na versão
1. Na matriz de prioridade, trocar o texto do vazio de "Sem dados reais" para "Dados insuficientes".
2. Capturar o "antes" de cada tela com login da Proprietária, em 375 e 1280/1440.
3. Revisar as 4 verificações automáticas que falharam (App e Pesquisa). Se a falha vier de antes desta versão, apenas registrar.
4. Verificar mais uma vez: gavetas abertas com a faixa "Alimento", árvore com linhas ligadas só entre pessoas publicadas (Cristiane fora, Felipe só como dependente menor), radar, funil, fluxo de publicação e título do contrato no celular.

## Comparação página por página
- Abrir a prancha V4 aprovada na coleção "Desk — estudos e convergência à prancha v4" e ligar cada página a uma aba ou subaba real do Desk.
- Cada aba ganha uma página no PDF com a prancha V4, a captura de antes e a de depois (computador e celular), lado a lado.
- Cada página traz uma tabela com cada elemento da prancha e uma situação: presente, parcial, falta, ou bloqueado (quando depende de dado, gravação ou decisão sua).
- No final, uma lista consolidada do que falta, organizada por página da prancha e com o motivo de cada pendência.

## Regras mantidas
- Nenhuma rota nova, nada em `/admin/desk/*` e nenhum segundo Caso 360 ou CRM. Sem migration, permissões, publicação, merge ou deploy.
- Nenhum dado é inventado. Os 14 documentos da Ana continuam reservados, os R$ 9.600 aparecem como previsão e o contrato continua não assinado.
- O contrato da Ana pode ser aberto para captura, gravando no máximo um rascunho interno. Nada é enviado, assinado ou cobrado.
- Nada é feito em `painel-dia.tsx` nem nos arquivos `golive-*`.
- O resultado não entra no produto sem a sua aprovação.

## Entrega
- PDF `/mnt/documents/desk-v4-c4d3bef9-vs-prancha-v4-2026-10-20.pdf`, com todas as páginas conferidas uma a uma, e o arquivo adicionado à coleção.
- Relatório com os arquivos alterados, o código da versão, os testes e o build.

## Detalhes técnicos
- As instruções vão para o chat do draft `drft_01m5a8xw2renpa0e879nc2np4x` (só ele pode ser instruído). Se isso não for possível, abro um novo draft com o mesmo escopo, partindo do principal, e reaplico as mudanças.
- O login das capturas vem de `lovable auth-session --json --self`.
- O PDF é montado com reportlab e fonte DejaVu, com QA visual de todas as páginas.
