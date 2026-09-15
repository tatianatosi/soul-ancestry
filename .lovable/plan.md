# Jurídico & Contratos e Financeiro como superfícies separadas

Duas telas do shell de go-live, cada uma com exatamente três blocos analíticos, lendo só o que já está gravado no caso do piloto. Nada é cobrado, assinado, enviado ou integrado.

## Jurídico & Contratos (`/golive/juridico`)

1. **Completude formal por instrumento** — barras de percentual para proposta, escopo, contrato, anexos e OS. Cada instrumento é "completo" quando tem registro com situação gravada; nunca estimado.
2. **Riscos e prazos** — quatro contadores: revisão pendente, assinatura pendente, anexo pendente e prazo próximo (vigência ou início de OS nos próximos dias). Sem prazo gravado, o item aparece como "sem prazo registrado".
3. **Pipeline** — proposta → escopo → rascunho → revisão humana → pronto para assinatura → registrado, com o degrau atual destacado.

Abaixo dos gráficos ficam as listas já existentes de proposta, escopo, contrato, anexos/OS e revisão. A proposta Canva entra só como referência de apresentação (versão, envio, aprovação e link quando houver), nunca como fonte de preço; o contrato usa o escopo aprovado.

## Financeiro (`/golive/financeiro`)

1. **KPIs** — valor contratado, recebido, a receber e vencido.
2. **Linha mensal de recebimentos confirmados** — só pagamentos com data de confirmação; sem eles, faturas com data de quitação.
3. **Donut de situação das faturas** — aberta, vencida, paga e cancelada/dispensada, com a fatura vencida separada da aberta pela data de vencimento.

As listas de faturas e pagamentos e o registro manual existente continuam abaixo, inalterados.

## Regras mantidas

- Sem catálogo, SKU, preço provisório, homologação de catálogo, contrato de teste ou dado fictício: registros marcados como teste/arquivados ficam fora da leitura.
- Sem dado, cada bloco mostra o estado vazio canônico com um único CTA de navegação existente.
- Nenhuma cobrança, assinatura, Asaas, e-mail, WhatsApp ou ação externa é criada.

## Detalhes técnicos

- `src/lib/golive.functions.ts`: acrescentar leitura somente de `contract_annexes` (por `case_id`/`contract_id`, excluindo `is_test` e arquivados) e expor campos já existentes de `contracts` (vigência, `approved_for_send_at`), `service_orders` (`start_date`, `end_date`, `status`) e `proposals` (referência Canva). Nenhuma tabela, coluna, migration, RLS ou writer novo.
- `src/lib/golive-juridico.ts` (novo, puro): completude por instrumento, contadores de risco/prazo com `agora` injetável e etapa atual do pipeline. Testes em `src/lib/golive-juridico.test.ts`.
- `src/lib/golive-analitico.ts`: reaproveitar `totaisFinanceiros` e `recebimentoPorMes`; acrescentar classificação de situação de fatura em aberta/vencida/paga/cancelada, com teste.
- Telas: reescrever `golive.juridico.tsx` e `golive.financeiro.tsx` só na camada de apresentação, usando `Barras`, `BarrasPercentual`, `Escada`, `Linha` e `Rosca` já existentes.
- Verificação: `bunx vitest run`, `bunx tsgo --noEmit`, `bun run build` e prints autenticados desktop e 375 px das duas telas, com tabela de fontes por bloco. Sem commit, publicação ou deploy.
