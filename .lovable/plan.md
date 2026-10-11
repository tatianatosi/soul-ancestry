# Ajustes finais de homologação — Desk V4 (App já ajustado)

## Situação
O App Cliente (Radar, Árvore, Conta) já foi ajustado no corte anterior, conforme suas decisões: Ouro Nobre com "Lacuna", pessoas por geração sem genograma, condição de R$ 320 x 10 marcada como "prevista". Este corte trata só os itens do Desk que ficaram de fora quando você pediu "sem tocar desk". Ao aprovar este plano, você libera o Desk apenas para estes três ajustes.

## O que será feito

### 1. Painel Hoje (/painel)
- Tirar do menu lateral o atalho "Sessão demo do App Cliente (dado fictício)". A tela de demonstração continua existindo, mas só pode ser aberta dentro da área Demo.
- Manter os quatro cartões atuais do Go Live. O cartão "Casos sem próxima ação" passa a usar a mesma fila oficial de próxima ação dos casos, sem contar casos demo ou de teste.
- Nenhum número será digitado à mão.

### 2. Caso 360 — Assistente e heatmap
- Mudar a posição do botão flutuante "Assistente" para que ele não cubra a última coluna do heatmap em 375 e 1280 px. O botão continua funcionando como hoje.

### 3. Caso 360 — Financeiro
- Mostrar uma grade de 5 cartões: Total Contratado, Liquidado, Saldo Aberto, Custos de Busca e Margem Bruta.
- Total Contratado mostra R$ 9.600,00 quando a condição do caso estiver registrada. Os outros quatro cartões hoje não têm dados (o caso tem zero pagamentos, faturas e custos) e vão mostrar "Não registrado", nunca zero inventado.
- Os cartões aproveitam o resumo financeiro que já existe. Não será criada uma segunda leitura do financeiro.

## Fora deste corte (bloqueado por falta de dado, não por visual)
- **Asaas e assinatura ativa na Conta:** não há cobrança confirmada nem integração com o Asaas no App. Continua aparecendo "prevista / aguardando confirmação".
- **Linhas de parentesco na Árvore:** há zero relações publicadas, e o App não pode deduzir parentesco.
- **Teia do Radar preenchida:** Documentação, Memória e Legado não têm base, então continuam como "Lacuna".
- **Adair e Alice:** sem acesso próprio, não há como comprovar o que eles veem. A tela não mostra aviso de bloqueio para contratantes.

## Garantias
- As sete abas do App e os seis grupos do Desk continuam iguais. A descrição do banco não é alterada.
- Nenhuma mudança em dados, permissões, migrations, convites ou publicação.
- Trabalho feito em rascunho separado, que para no final para a sua aprovação.

## Validação
- Capturas antes e depois, em 375 e 1280 px, do Painel e do Caso 360 da Ana (heatmap e Financeiro).
- Verificações automáticas relacionadas e build.

## Detalhes técnicos
- `src/lib/navegacao-desk.ts`: remover só o item demo de `MENU_CONTA` e atualizar os testes que esperam esse item (`app-cliente-demo.test.ts`, `navegacao-desk.test.ts`).
- `src/routes/_authenticated/painel.tsx` + `src/lib/golive.functions.ts`: o card "sem próxima ação" passa a usar a RPC `proxima_acao_prioritaria_lote` sobre os casos visíveis, excluindo demo/teste. `painel-dia.tsx` não será tocado.
- `src/components/desk/assistente-transversal.tsx`: ajustar posição e z-index. Remover a margem manual `md:mr-40` do heatmap só se ela deixar de ser necessária.
- `casos.$caseId.index.tsx`: grade de 5 cartões a partir de `obterResumoFinanceiroCaso`. Margem Bruta é calculada como liquidado menos custos só quando ambos existirem; se faltar algum, fica ausente.
