# CA13-UXUI-PANTONE-MOCKUP — comparação tela a tela, contra o mockup real de 17 páginas (09/09/2026)

## Status

Concluído. Este relatório substitui a comparação de `2026-09-09_ca13_uxui_pantone_mockup.md` (que precisou comparar contra o PDF de auditoria de 47 páginas, por o mockup de 17 páginas não estar disponível no repositório até agora). O arquivo correto foi enviado pela Proprietária e salvo em `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf` (17 páginas, confirmado via `pdfinfo`).

## Fonte

`clube-ancestral-mockup.pdf` (17 páginas: capa + divisor App Cliente + 7 telas do App + divisor Desk Intelligence + 7 telas do Desk), lido integralmente. Comparado contra o código-fonte real das 14 telas.

## Confirmado — paleta, tipografia e estrutura visual aderentes

O mockup de 17 páginas usa exatamente a mesma paleta e composição já identificadas e travadas por teste em CA24 (parcial): navy `#2F4B6E`-like, gold, cream, terracotta; wordmark "Clube Ancestral" em script itálico; títulos em serif itálico; sidebar do Desk escura com item ativo em gold; conteúdo em cream; cards brancos; pílulas de status coloridas (verde/laranja/vermelho); barra inferior do App por ícone+rótulo. Isso bate com o que já está implementado em `src/styles.css`, `src/components/saas/shell.tsx` e `src/components/portal/portal-shell.tsx` — nenhuma divergência visual de paleta, tipografia, cards ou hierarquia encontrada nas 14 telas.

## Confirmado — a navegação do Desk no mockup real tem exatamente os 7 itens da taxonomia aprovada

Diferente do PDF de auditoria (47 páginas, que mostra uma lista exploratória maior — Propostas, Go-live, Formalização, Checklist AppCliente, Financeiro, Checklist semanal, Integrações etc.), o mockup de 17 páginas (o aprovado) mostra a sidebar do Desk com **exatamente 7 itens**: Visão Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno, Alertas, Biblioteca Mestre — idêntico a `TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`. Isso confirma que a taxonomia doc já citava a fonte certa; o erro desta série estava só no relatório de comparação anterior, que usou o PDF de auditoria como substituto visual.

A navegação real do Desk (`src/lib/navegacao-desk.ts`) continua com 8 grupos operacionais (Hoje, Marketing, Comercial, Casos, Pesquisa, Contratos, Financeiro, Biblioteca/Governança) e dezenas de subitens — **mantidos por decisão vinculante da Proprietária já registrada** em `2026-09-09_correcao_referencia_mockup_17_paginas.md`. Esta comparação contra o mockup real não muda essa decisão nem a reabre: confirma apenas que a divergência é a mesma já identificada e já decidida, agora com a fonte visual certa.

## Não alterado

Nenhuma tela, rota, CTA, dado ou regra de negócio foi tocada nesta comparação — só leitura e confirmação. Nenhum código faz referência ao nome de arquivo do mockup, então nenhum teste automatizado se aplica.

## Verificações

`npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` e `npx vite build` executados nesta mesma sessão, antes desta comparação, sem alteração de código desde então — resultado inalterado (208 arquivos, 1994 testes, build limpo).

## Pendência

Nenhuma nova. A verificação visual ao vivo em mobile (320-414px) continua dependendo de sessão autenticada real, indisponível nesta sessão (mesma limitação já registrada em CA23/CA24).
