# CA16-FINANCEIRO-E-CAMPANHAS — execução (09/09/2026)

## Achado

A classificação financeira já é real e já é separada por natureza: receita (`invoices`/`payments`, CA07), despesa de terceiro (`third_party_expenses`, CA15), investimento de marketing (`marketing_investments`, CA10) — três tabelas distintas, nunca somadas entre si (verificado: `financeiro-caso.ts` nunca referencia `marketing_investments`/`attribution_records`). O que faltava: `payments.status = 'estornado'` (reembolso) já existe no schema e já é corretamente excluído de `valorRecebido` pelo trigger `fn_payments_pos` — mas nenhuma leitura financeira por caso jamais consultava `payments`, então um estorno acontecia sem deixar nenhum rastro visível: o caso só voltava a parecer "sem cobrança" ou "com saldo aberto", sem explicação.

## Alterado

`financeiro-caso.ts`: `calcularResumoFinanceiroCaso` ganha parâmetro opcional `pagamentos` e novo campo `reembolsos` (total de estornos + valor somado) — nunca conta como receita, despesa ou custo. `comercial.functions.ts`: `obterResumoFinanceiroCaso` busca `payments` pelas faturas do próprio caso (`invoice_id in (...)`) e repassa. `casos.$caseId.index.tsx` e `visao-geral.tsx` (Caso 360 e Visão Geral, mesmo cálculo) exibem "Reembolsos (pagamentos estornados)".

## Preservado

`third_party_expenses` e `marketing_investments` não foram tocados — confirmado por teste que nenhum dos dois é lido por `financeiro-caso.ts`. `eventos_financeiros` (tabela legada, 0 linhas, sem check constraint de tipo) não foi reativada.

## Testes

`ca16-financeiro-e-campanhas.test.ts` (8): reembolso null sem estorno; total/valor corretos com um ou múltiplos estornos; retrocompatível sem o novo parâmetro; busca de payments escopada por invoice_id do caso; separação de investimento/despesa de terceiro confirmada; paridade Caso 360 × Visão Geral. Ajustada janela de um teste pré-existente (`ca07-financeiro-simples.test.ts`) que ficou pequena pelo campo novo. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (200 arquivos, 1936 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (ver mensagem de commit).

## Pendência

"Custo próprio" (despesa interna do Clube, distinta de despesa de terceiro) não tem tabela nem fonte homologada em lugar nenhum do sistema — declarado como lacuna real, não modelado nesta rodada (exigiria tabela nova e aprovação explícita, fora do escopo de uma CA curta). Não bloqueia CA17.
