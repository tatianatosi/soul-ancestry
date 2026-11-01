# Decisões registradas × o que o código faz (01/11/2026)

Método: cada decisão do `AGENTS.md` e do plano de 31/10 foi conferida por leitura do código (grep, testes e
render). **Não** abri o app no navegador nem consultei o banco. Onde diz "corrigido", a correção está neste PR
com teste; onde diz "aberto", não foi feito.

## Executado e conferido

| Decisão | Evidência |
| --- | --- |
| App Cliente = 7 abas, ordem e rótulos | `portal-navegacao.ts`, `portal-mapa-kit.ts`, `abas-app-cliente.tsx` e a barra do shell agora leem a mesma fonte (teste de render) |
| Caso 360 = 8 seções + pílula "Visão Concreta" | `SECOES` em `casos.$caseId.index.tsx` |
| Lateral do Desk deriva de `GRUPOS_DESK`/`SETORES_DESK` | `components/saas/shell.tsx`; o código tem 8 grupos (hoje, comercial, casos, pessoas, pesquisa, marketing, financeiro, governança) |
| 5 etapas do caso numa só fonte | só `lib/etapas-caso.ts` |
| RPC `portal_sou_contratante_financeiro` e `confirmarDocumentosMinimos` preservados | presentes em `portal-cliente.functions.ts`, `portal-dados-vivos.functions.ts`, `contrato-preparar.functions.ts` |
| Árvore publicada do Desk reusa `pessoasDaArvore` | `components/desk/arvore-publicada-desk.tsx` |
| GoLive por caso (19 telas, grava no caso escolhido) | `components/golive/dados.ts`, `golive-escritores.functions.ts`, teste `golive-por-cliente` |
| N7: Painel Hoje = `/painel` (Prancha V4) | `AGENTS.md`, registro de órfãos, teste 8 |

## Executado pela metade, e o que fiz agora

| Achado | Estado |
| --- | --- |
| GoLive "por caso" mas 13 textos das 11 telas ainda diziam "caso do piloto" | **corrigido** (descrições e "Identidade da pessoa do caso") |
| `/contratos` mostrava o aviso fixo "Alerta — caso Ana Luiza" para qualquer caso | **corrigido**: "Alerta — antes de liberar contrato" |
| Placeholder da varredura de WhatsApp com nome real ("Ana Luiza: …") | **corrigido**: "Nome da pessoa: …" |
| Governança mostra `ESTADO_CASO_ANA` (retrato fixo do caso da Ana) como se fosse estado atual | **rotulado** como registro de decisão, não leitura ao vivo; a leitura ao vivo continua **aberta** (N2) |
| 4 porteiros sem chamador (`classificacao-dados`, `portal-navegacao`, `portal-mapa-kit`, `rotulos-humanos`) | **religados** (Onda 0) |

## Aberto (não executado)

1. **Onda 1, parcial.** Reescritos por caso e sem dado de família no código: `portal-experiencia-integral`,
   `portal-fallback-canonico` (antes tinham árvore, documentos, radar e datas inventados, como "Otto Reimer 1895" e
   "Dr. Klaus Becker"), `debug-cliente-access` (agora aponta para `/app-cliente-como-pessoa?casoId=`) e
   `botao-testar-cliente` (recebe o `casoId`; o `TODO:` que travava o `pipeline.py` saiu). Ficaram de fora:
   `rascunhos-comunicacao-governados` (é lógica pura sem dado de família; ligá-lo mexe no envio de comunicação ao
   cliente), `decisao-ana-canonica` e `corte-vertical` (registros de decisão e retrato do caso da Ana) e
   `demo-cliente-helper` (descreve a rota demo mantida). `app-visibilidade-registro` também: lê o caso de
   `src/data/case-registry` (demo), enquanto o App real usa `escopoAPartirDePublicacoes`.
2. 97 arquivos de produção com dado de pessoa escrito no código (57 real, 24 fictício, 16 em `src/data`).
3. Ondas 2 a 4 (Painel Hoje sem o `painel-dia`, Governança, aposentadas).
4. **Menu descrito de 3 jeitos**: README (8 grupos com outros nomes), *knowledge* do Lovable (6 grupos), `AGENTS.md`
   (7 grupos V4 + Financeiro) e código (8). O *knowledge* do Lovable está desatualizado e pode levar o editor a
   desfazer a navegação. **Não consegui atualizar:** a ferramenta recusa texto acima de 10.000 caracteres e o
   conteúdo atual já ocupa quase tudo; é preciso decidir o que sai.
5. `studio-devolutivas` está no menu (`navegacao-desk.ts`) mas a rota não usa `SaasShell` e lê `src/data/studio-devolutivas.ts` (classificado "modelo").

## Mantido de propósito

`/app-cliente-demo`: sessão demo decidida em 25/08/2026, caso fictício, rotulada, noindex. É o uso permitido de
fixture (estado visual isolado, selo DEMO).

## Não verificado

Comportamento no navegador (desktop e 375 px), estado do banco, estado do projeto no Lovable e as demais
telas campo a campo.
