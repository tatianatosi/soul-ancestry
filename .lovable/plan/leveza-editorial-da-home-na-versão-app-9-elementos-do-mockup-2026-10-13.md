# Leveza editorial da Home — na versão "App — 9 elementos do mockup"

Aplicar a leveza na versão "App — 9 elementos do mockup", que já tem a estrutura certa (régua, próximos passos, achados e perfil). O App no ar está congelado e não muda. Nada é publicado.

## O que muda na Home
1. **Respiro:** mais espaço entre os blocos (24–32 px) e mais espaço dentro dos cartões (24–28 px no celular).
2. **Cartões suaves:** brancos sobre o creme, com borda quase transparente (azul 5% ou dourado 15%), cantos de 16–24 px e sombra leve e flutuante.
3. **Cartão azul do caso:** azul profundo aveludado, com um filete dourado fino. Fica só com as boas-vindas, o nome da família, o selo e a régua. "Bem-vinda à sua história" e o nome da família na letra serifada, com linhas mais espaçadas.
4. **Cartões separados:** "Próximos passos", "Pessoas conectadas" e "Achados da sua história", cada um independente. A lista das oito pessoas sai do cartão azul e vai para "Pessoas conectadas", com etiquetas leves (branco ou dourado bem claro e borda dourada fina).

Nenhum texto, dado ou pessoa muda. Sem Cristiane. Continuam: sete abas, ouro escuro em texto pequeno, toques de 44/52 px e nada rolando para o lado.

## Como chega à versão
Daqui eu não consigo mandar instruções para uma versão que já existe. Depois que você aprovar, te passo o texto pronto para colar no chat da versão "App — 9 elementos do mockup". Ela aplica, captura a Home no celular (375) e no computador (1280), lado a lado com o mockup e o App no ar, e para esperando você aprovar.

A versão "App — mockup completo v2" fica redundante e pode ser descartada.

## Detalhes técnicos
- Mudança só visual, escopada pelo PortalShell à Home (`src/routes/portal/index.tsx` e `portal-v11.css`), usando os tokens canônicos. Sem tocar em dados, permissões ou nos tokens globais do Desk.
