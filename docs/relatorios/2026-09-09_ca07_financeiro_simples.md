# CA07-FINANCEIRO-SIMPLES — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0: nenhuma tabela nova, nenhum motor de ERP, nenhuma integração externa. Uma métrica, uma fonte — documentado em `financeiro-caso.ts`.

## 1. Fontes reais localizadas

- **Proposta/condição comercial**: `proposals` (case_id, valor, moeda, forma_pagamento) — a aprovada, ou a mais recente se nenhuma foi aprovada.
- **Faturas/recebíveis**: `invoices` (case_id, valor, `valor_pago` já mantido pelo trigger `fn_payments_pos` a partir de `payments` conciliados, vencimento, status).
- **Pagamentos**: `payments`, só via `invoices.valor_pago` — nunca resomados diretamente nesta leitura, para não duplicar o mesmo cálculo em fonte diferente.
- **Despesas de terceiros**: `third_party_expenses` (já lida por `conferirRegraComercial`, agora também por esta leitura, mesma tabela).

## 2. Leitura única (Caso 360 e Visão Geral)

Nova função pura `calcularResumoFinanceiroCaso` (`src/lib/financeiro-caso.ts`) + leitor `obterResumoFinanceiroCaso` (`comercial.functions.ts`, reutiliza `contextoInterno`). Uma só chamada por caso, usada nos dois lugares exigidos: card completo com ações no topo do Caso 360 (`#resumo-financeiro`) e card só-leitura dentro de `AbaVisaoGeral` (mesmo componente que já é "Visão Geral" do caso — nenhuma tela nova). Mostra exatamente os oito campos pedidos; nenhum outro número financeiro foi adicionado.

## 3. Métrica eliminada / nunca duplicada

Valor recebido e saldo aberto vêm só de `invoices.valor_pago` (autoridade já mantida por trigger) — descartei somar `payments` de novo, que seria a mesma métrica em fonte diferente. `/financeiro` (visão por organização) e este card (por caso) continuam com escopos distintos, sem sobreposição.

## 4. Ações internas

- **Registrar pagamento**: reusa `salvarPagamento` (cria) + `conciliarPagamento` (concilia) — o mesmo par que `/financeiro` já usa em dois passos manuais, aqui em uma sequência só. Ao conciliar, `conciliarPagamento` já propaga `crm_casos.pagamento_confirmado`, que alimenta os gates de ativação existentes — "atualiza próxima ação/caso quando aplicável" sem lógica nova.
- **Preparar cobrança**: reusa `salvarFatura` — cria fatura em `rascunho` ou move uma `rascunho` existente para `emitida`. Nunca envia link, e-mail ou mensagem (não há nenhum mecanismo de envio nem em `/financeiro`).
- Nenhuma das duas ações toca `proposals`, `contracts` ou `service_orders` — confirmado que financeiro não bloqueia proposta rascunho, contrato rascunho ou OS interna.

## Testes

`financeiro-caso.test.ts` (10, função pura: sem dados → "Sem dados suficientes"; recebido/saldo só de `valor_pago`; próxima parcela por vencimento mais próximo; vencido é sempre calculado pela data real, nunca só pelo campo `status`; fatura cancelada não entra em nenhum total; despesas nunca entram em valor/saldo). `ca07-financeiro-simples.test.ts` (14: os oito campos aparecem nos dois lugares; Visão Geral é só leitura; ações reusam os escritores existentes; nenhuma tabela nova; RLS por organização e por caso preservada; nenhum `service_role`). `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (188 arquivos, 1814 testes) e `npx vite build` — todos limpos.

## Pendência (0 de até 5)

Nenhuma nova. `sku_price_exceptions`/preço homologado (Planilha Mestre) seguem fora desta leitura — mission explícita: nenhuma fonte de preço nova, e essa fila já é lida por `conferirRegraComercial`.

Commit: branch temporária → main → recovery.
