# Auditoria visual do App Cliente real e do espelho interno

## Objetivo
Comparar o App Cliente real e o espelho interno com a prancha v4 e as referências aprovadas, sem implementar, publicar ou contornar a ausência de uma sessão cliente autorizada.

## Fontes da auditoria
- `02-prancha-app-cliente-v4.pdf` como referência visual mais recente do App.
- `01-pranchas-visuais-clube-ancestral-v3.pdf` como referência complementar aprovada.
- As sete abas canônicas: **Home, Jornada, Radar, Árvore, Documentos, Legado e Conta**.
- O shell real, as sete rotas `/portal/*`, o espelho `/golive/app`, os tokens Pantone, a tipografia e os logotipos vetoriais atuais.
- Capturas existentes e novas observações somente leitura em desktop, 390 px e 375 px.

## 1. Matriz App atual × referência aprovada
Registrar item a item, para o App real e para o espelho:
- paleta Pantone, contraste, tipografia, logo e aplicação da marca;
- cabeçalho, sidebar desktop, largura útil, primeira dobra e áreas de ação;
- barra móvel, sete abas, tamanho de toque, área segura, scroll e overflow;
- hierarquia de jornada, próxima ação, entregas, documentos, família, mensagens e conta;
- estados de carregamento, vazio, pendência, conteúdo aprovado, conteúdo não publicado e erro de permissão;
- situação `ADERENTE`, `PARCIAL`, `DIVERGENTE`, `NÃO COMPROVADO` ou `BLOQUEADO`;
- evidência exata e ajuste visual mínimo, sem sugerir dado fictício.

## 2. Wireframes de ajuste
Produzir wireframes antes/depois das sete abas em três larguras:
- desktop;
- 390 px;
- 375 px.

Os wireframes preservarão:
- cabeçalho navy, filete dourado, marca vetorial e títulos editoriais;
- sidebar desktop e barra móvel com exatamente sete abas;
- primeira dobra centrada na decisão do cliente;
- um estado vazio honesto por domínio;
- CTAs somente quando já houver ação cliente real;
- área segura inferior e ausência de rolagem horizontal;
- nenhuma informação interna, preço técnico, gate, teste ou conteúdo não publicado.

## 3. Lista de ajustes somente visuais
Separar correções que podem ser aprovadas sem tocar em dados ou permissões, incluindo:
- proporção e contraste de cabeçalho, cards, selos e textos;
- largura da sidebar e do conteúdo;
- ordem, densidade, espaçamento e agrupamento dos blocos;
- tratamento mobile das sete abas, rótulos, ícones, CTAs e área segura;
- alinhamento do Radar, régua da Jornada, grades de Documentos/Legado/Conta e apresentação da família;
- consistência entre shell real e espelho, sem confundir seus papéis.

## 4. Bloqueios separados
Classificar cada item que dependa de:
- sessão cliente autorizada;
- dado ou projeção aprovada/publicada;
- regra de produto ou decisão humana;
- autorização/RLS;
- ação externa, convite ou link mágico.

Registrar explicitamente:
- **Espelho interno:** validado sem overflow; serve somente para validar apresentação.
- **App Cliente real:** redirecionado por falta de permissão de cliente nesta sessão; não declarar aderência visual final.
- Não criar conteúdo fictício para preencher vazios.
- Não publicar, gerar acesso, convite, link mágico ou alterar permissões para liberar a prova.

## 5. Roteiro de prova autenticada futura
Preparar um roteiro para um usuário cliente já autorizado:
1. entrar pelo fluxo oficial existente;
2. registrar tela inicial, identidade do usuário e escopo do caso sem expor dados sensíveis;
3. visitar as sete abas em desktop, 390 px e 375 px;
4. confirmar apenas conteúdo sanitizado, aprovado, publicado e pertencente ao caso/titular;
5. verificar carregamento, vazio, pendência e erro controlado;
6. testar navegação, CTAs, scroll, área segura e ausência de overflow;
7. recarregar cada aba e confirmar persistência da leitura;
8. registrar resultado como `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISÃO`, `ERRO_DE_FONTE` ou `NÃO LOCALIZADO`.

## Entrega e validação
- Um Markdown consolidado com matriz, ajustes visuais, bloqueios e roteiro de prova.
- Três PDFs de wireframes: desktop, 390 px e 375 px, com sete abas cada.
- Arquivos individuais organizados por aba e largura.
- Inspeção visual de todas as páginas para cortes, sobreposição, contraste, ordem e consistência.
- Parada obrigatória após a devolutiva para aprovação explícita da Proprietária.

## Fora de escopo
- Código, componentes, tokens, rotas, dados, publicações, convites, links mágicos, permissões, RLS, banco, integrações, commits, merge ou deploy.
- Declaração de aderência final do App Cliente real sem prova em sessão cliente autorizada.