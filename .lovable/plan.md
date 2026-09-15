# Auditoria somente leitura — Pesquisa e Conta do App

Nada foi criado, publicado, enviado ou alterado. Leitura de código e de dados do caso `CA-CID-AT-FAM-2026-001`.

## 1. Pesquisa — os três blocos

| Bloco | Rota | Fonte real | Filtro | Estados incluídos | Data / fuso | Fórmula | Vazio |
|---|---|---|---|---|---|---|---|
| Cobertura por fonte | /golive/pesquisa | evidências do caso + fontes do caso | caso pela organização e pelo código canônico; fontes e evidências pelo caso de pesquisa do caso; só registros não arquivados; teto de 50 linhas | todos os estados gravados, separados em "validada" e "em revisão" | não usa data | agrupa evidência pela fonte de origem; sem fonte, agrupa pelo tipo; conta total, validadas e em revisão | "Nenhuma linha de pesquisa aberta" com CTA de navegação |
| Produção semanal | /golive/pesquisa | fontes, evidências e achados do caso | mesmos filtros acima | todos | fonte usa data de consulta, senão criação; evidência usa criação; achado usa data do achado, senão criação; semana começa na segunda, cálculo em data local, sem deslocamento de fuso | conta registros por semana, últimas 8 semanas; registro sem data fica de fora | vazio quando nenhum registro tem data |
| Fila editorial | /golive/pesquisa | evidências + achados do caso | mesmos filtros | quatro faixas: rascunho, em revisão, aprovado, publicado | não usa data | classifica pelo estado textual gravado; nunca altera estado | mostra sempre as quatro faixas, com zero visível |

Observação honesta: o filtro por organização é aplicado no caso; fontes e evidências herdam o vínculo pelo caso de pesquisa, e a RLS da organização é a garantia efetiva. O limite de 50 linhas por tabela não é exibido na tela.

## 2. Os três registros da semana de 17/08

Todos do mesmo tipo — **fontes de pesquisa**, criadas em 20/08/2026 (semana de 17/08), nenhuma com data de consulta:

- `eb030298…3485` — Documentos declarados pelo núcleo familiar
- `e1e50085…6acd` — Catálogos de arquivo austríacos
- `3e256fa3…271f` — Registros civis brasileiros da linha familiar

Correção em relação à leitura anterior: não são três entidades diferentes; são três fontes. O gráfico está certo, mas o rótulo deve dizer "3 fontes registradas".

## 3. Perguntas, fontes, evidências e achados

Três perguntas abertas, confiança baixa: linha austríaca por ascendência direta; enquadramento § 58c; documentação civil da geração intermediária. Três fontes: as listadas acima.

**Não confirmo a ausência de evidências e achados.** O caso tem hoje:
- 1 evidência — "Certidão de casamento Silveira 1912", estado coletada, confiança baixa, visibilidade ao cliente "nunca", criada em 15/09;
- 2 achados duplicados — "Vínculo materno Silveira documentado", ambos em revisão, não elegíveis ao cliente, criados em 15/09.

Eles não aparecem na produção da semana de 17/08 porque são de setembro.

## 4. Aprovar achado não propaga sozinho

A tela de Pesquisa do go-live é somente leitura: os únicos botões levam a outras telas; não existe ali ação de aprovar, publicar ou vincular.

No Desk histórico, ao salvar um achado marcado como elegível para entrega, o sistema **cria ou atualiza um alerta interno** de "achado pendente de decisão" e o encerra quando deixa de ser elegível. É a única consequência automática. Não escreve relação genealógica, não altera a árvore, não cria microentrega e não cria projeção para o App. Ou seja: a afirmação "não gera alerta" é falsa; "não publica, não vincula e não altera a árvore" é verdadeira.

## 5. Conta do App — contrato e financeiro

| Elemento | Fonte | Filtro | Estados aceitos | Regra de liberação |
|---|---|---|---|---|
| Título e número do contrato | contratos do caso | pelo caso, não arquivados | escolhe o assinado; na falta, um com situação assinado/vigente/ativo | só esse instrumento chega à tela |
| Assinatura | data de assinatura do contrato | idem | data gravada; sem data, mostra a situação em texto | — |
| Parcelas pagas / em aberto | faturas do caso | pelo caso, não arquivadas | exclui rascunho e cancelada; paga = tem data de pagamento ou situação de pago/quitado/liquidado | — |
| Próximo vencimento | primeira parcela em aberto por data de vencimento | idem | — | — |
| CTA "Ver proposta e escopo" | navegação fixa | — | — | ver item 7 |

Lacuna real: contrato e faturas são filtrados **apenas pelo caso**, não pelo titular. Como o App deve ler sempre caso + titular, falta esse segundo filtro. Hoje não há divergência prática porque o caso tem um único titular e nenhuma fatura, mas a regra não está implementada.

## 6. Pagamento e assinatura

Confirmado. Parcela só conta como paga quando existe data de pagamento ou situação explícita de pago/quitado/liquidado — emissão de fatura não vira pagamento. Contrato só aparece como assinado quando existe data de assinatura; sem ela, a tela mostra a situação em texto, nunca "assinado". No caso da Ana: contrato sem assinatura, nenhuma fatura, nenhum pagamento.

## 7. Destino do CTA — falha confirmada

Na aba Conta, tanto o bloco preenchido quanto o estado vazio levam a **/golive/formalizacao** e **/golive/juridico**, que são telas internas do Desk. Isso viola a regra: o CTA do App só pode ir a rota cliente-facing ou permanecer como estado informativo. Hoje o /golive/app é espelho interno, mas o mesmo componente é o contrato visual do App do cliente — precisa apontar para o portal do cliente ou virar texto sem link. Correção já classificada como P0.

## 8. Campos de contrato e financeiro proibidos no App

Não aparecem hoje e devem continuar fora: valor do contrato e valor da proposta, preço, SKU e catálogo, condição comercial e desconto, margem, custo, despesas de terceiros, referência interna de proposta, cláusulas e anexos internos, situação técnica do instrumento (por exemplo "aguardando dados"), gates internos, notas de revisão jurídica, dados de cobrança externa, identificadores de outro caso ou de outra família. O App mostra somente: título e número do contrato, assinatura, parcelas emitidas com vencimento e pagamento, e situação do acesso.

## Prova de interface

Preview interno autenticado: `/golive/pesquisa` e `/golive/app` (aba Conta). **A prova pelo lado da cliente permanece pendente**: Ana não tem e-mail autorizado, acesso ao portal nem link mágico, e nenhuma projeção publicada — portanto não é possível comprovar a leitura real do App pela família.

## Correções sugeridas (não executadas)

1. Apontar o CTA da Conta para rota cliente-facing ou estado informativo.
2. Somar o filtro por titular a contrato e faturas do App.
3. Rotular o gráfico semanal por entidade ("3 fontes").
4. Resolver a duplicidade dos dois achados.

Aguardo sua aprovação antes de qualquer alteração.
