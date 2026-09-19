# Fechamento de evidência — P0 Acesso e wireframe do contrato da Ana

Trabalho estritamente de validação e geração de evidência. Nenhum código do produto, dado, acesso, permissão, contrato, publicação, integração ou ambiente será alterado.

## 1. Build final

- Rodar uma única build completa da versão atual.
- Registrar apenas `PASSOU` ou `FALHOU`, com a mensagem objetiva quando houver falha.
- Não corrigir nenhum achado neste corte.

## 2. Prova autenticada do P0

Na sessão master, abrir **App Cliente como pessoa**, selecionar o caso real `CA-CID-AT-FAM-2026-001` e conferir, após a última correção:

- Jornada;
- Radar;
- Árvore;
- Legado;
- Conta.

Em cada aba, verificar por tela renderizada e sinais do navegador:

1. código e nome do caso real;
2. ausência de `65%`, Sophia e qualquer conteúdo demonstrativo;
3. vazio específico e honesto quando não houver publicação;
4. ausência de notas internas, SKU, gates, hipóteses, evidência bruta, dados sensíveis e pagamentos não confirmados;
5. nenhum erro de console;
6. largura de 375 px sem rolagem horizontal.

Qualquer divergência será marcada como `FALHOU`; não haverá correção automática.

## 3. Capturas

- Uma captura desktop mostrando o seletor com o caso da Ana e as sete abas canônicas.
- Cinco capturas em 375 px, uma para cada aba solicitada.
- As imagens ficarão na pasta de evidências entregue ao usuário, sem entrar no produto.

## 4. Wireframe do contrato da Ana

Gerar duas imagens independentes, desktop e 375 px, fora do produto, usando somente o inventário real já confirmado:

- caso `CA-CID-AT-FAM-2026-001`;
- contrato `2026-CB-0001`, versão 1, em revisão humana e não assinado;
- proposta Canva v1 aprovada, R$ 9.600,00, sem URL Canva persistida;
- partes reais já registradas;
- escopo existente com conferência parcial das páginas;
- divergência de exclusões explicitamente sinalizada para decisão humana;
- anexos I–V: I e II pendentes; III, IV e V não aplicáveis com motivo;
- nenhuma ordem de serviço emitida;
- sem CTA ativo para abrir Canva, assinar, enviar, publicar ou cobrar.

O desenho manterá leitura contínua, coluna contextual no desktop e uma coluna em 375 px. As duas imagens serão inspecionadas para texto cortado, sobreposição, contraste e overflow antes da entrega.

## 5. Entrega e parada

Entregar somente:

| Aba | Caso real | Estado honesto | Sem dado interno | Console | 375 px sem overflow | Screenshot |
|---|---|---|---|---|---|---|

Além da tabela:

- resultado da build;
- imagem desktop da visão master;
- cinco imagens mobile das abas;
- imagens desktop e 375 px do wireframe do contrato.

Depois disso, parar. Sem commit, push, PR, merge, publicação ou deploy.
