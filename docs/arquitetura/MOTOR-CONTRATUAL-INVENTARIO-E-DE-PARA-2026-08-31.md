# Motor Contratual — Inventário e De-Para

**Status:** especificação — nenhum código alterado
**Data:** 2026-08-31
**Responsável pela decisão:** Proprietária do Clube Ancestral
**Autorização:** confirmada em conversa (31/08/2026) — "começar a especificação agora", sem implementar código nesta etapa
**Escopo:** ler e inventariar o fluxo real Proposta → Parâmetros Contratuais → Contrato, mapear rota → componente → handler → função → tabela para cada campo, e propor o de-para de sincronização. Não altera nenhum arquivo de código nem migration.

## 1. Causa

Testando a PR #40 em preview, a proprietária encontrou objeto/escopo/partes do contrato não vindo dos Parâmetros Contratuais mesmo depois de preenchidos e aprovados, e observou que a jornada da Ana não tem "um só lugar" com todos os dados da pessoa. Investigação em código confirmou uma causa estrutural real, não um bug isolado: **existem hoje pelo menos três lugares distintos para "proposta/objeto do contrato", nenhum sincroniza com os outros, e não existe tela de reconciliação quando divergem.**

O padrão que já resolve exatamente esse problema para o perfil institucional (`PERFIL_INSTITUCIONAL`, escreve uma vez de fonte fixa/aprovada, nunca redigita) precisa ser generalizado — essa é a peça central desta especificação.

## 2. As três fontes de proposta/objeto hoje

| Fonte | Onde vive | Como é preenchida | Alimenta o contrato? |
|---|---|---|---|
| Tabela `proposals` (comercial real) | `/propostas`, `comercial.functions.ts` (`salvarProposta`, corrigido na PR #39 para `gravarComVerificacao`) | Fluxo comercial: leads → discovery → proposta → condição → conversão | Não diretamente — nenhuma função lê `proposals` para popular `contracts`/`contract_case_parameters` |
| "Proposta (referência interna)" na aba Jornada do Caso 360 | `fechamento.tsx`/painel de jornada do caso | Campos de texto livre: `REFERÊNCIA INTERNA DA PROPOSTA`, `LINK INTERNO DA PROPOSTA`, `CONDIÇÃO COMERCIAL INTERNA`, escopo incluído/excluído — tudo digitado à mão | Não — é um registro de referência solto, sem `contract_id` nem `proposal_id` vinculado |
| `contract_case_parameters` / `contract_parameter_values` (Parâmetros Contratuais) | `/contrato-parametros`, `contrato-parametros.functions.ts` | Campos do dicionário (`objeto_contrato`, `escopo_resumo`, `servicos_incluidos`, `servicos_excluidos`, `fases_entregas`), cada um com `origem` declarada (planejador/crm/proposta/documento/preenchimento_humano) | Sim, mas só uma vez — ver Achado 1 |

Nenhuma tem `case_id`/`contract_id`/`proposal_id` cruzados de forma que uma reconcilie a outra. Preencher uma não atualiza as demais, e não existe UI para comparar/decidir quando os valores divergem.

## 3. Achado 1 — resync de Parâmetros → Contrato é one-shot (confirmado em código)

`contrato-parametros.functions.ts`, função `enviarParaAssinatura` (comentário do próprio código: *"cria/atualiza o contrato, as partes e o escopo a partir dos parâmetros aprovados. Nenhum destino pede redigitação."*):

```text
if (!contratoId) {
  // cria contracts.title / purpose_summary / scope_summary
  // cria contract_parties (role: contracting_client)
  // cria contract_scope_items (included/excluded/deliverable)
}
// fora do if: só atualiza contract_case_parameters.status = "enviado_assinatura"
```

Se o contrato **já existe** quando os parâmetros são preenchidos/editados (o caso real de teste: contrato criado antes, parâmetros preenchidos depois), o bloco inteiro é pulado. `enviarParaAssinatura` só marca o registro como enviado — não grava nada no contrato. O comentário do código promete o contrário do que o código faz.

Isso explica ao mesmo tempo: objeto/finalidade não aparecendo em "Título"/"Finalidade" (`contratos.$id.tsx`, aba Resumo, campos `c.title`/`c.purpose_summary`), partes não aparecendo na aba Partes (`contract_parties` filtrado por `contratoId` — real e funcional, só não é alimentado de novo), e escopo não aparecendo em `contract_scope_items`.

## 4. Achado 2 — o padrão que já funciona: `PERFIL_INSTITUCIONAL`

`contrato-base-consolidado.ts` mantém `PERFIL_INSTITUCIONAL` como fonte fixa versionada (`PERFIL-INST-v1.0`), renderizada na Matriz de Cláusulas A–P como bloco **"NÃO EDITÁVEL POR CASO"**, com regra explícita: *"Dados institucionais não são editáveis dentro de caso. Exceção administrativa exige perfil autorizado, motivo, vigência e auditoria."*

Esse é exatamente o modelo certo para objeto/escopo/partes também — a diferença é que esses campos **são** editáveis por caso (vêm de planejador/CRM/proposta, não são fixos institucionais), então o padrão certo não é "nunca editável", é "sempre lido da fonte aprovada mais recente, nunca digitado direto no contrato".

## 5. Matriz de cláusulas já modela a dependência corretamente

`matriz-clausulas.ts` já declara, por cláusula, `tipo` (`fixa`/`parametrizada`/`condicional`), `status` (`presente`/`pendente`/`conflito`/`bloqueante`) e a fonte exigida. Nos prints reais da Ana, a Cláusula C ("Objeto do estudo/serviço") aparece com `status: BLOQUEANTE`, motivo *"Nenhuma proposta/OS aprovada vinculada ao caso"* — ou seja, o motor de cláusulas **já sabe** que objeto depende de Proposta/OS aprovada. O gap não é de modelagem, é de que a fonte real (`contract_case_parameters`/`proposals`) não está conectada ao pipeline que a matriz de cláusulas consulta.

## 6. De-para proposto (especificação, não implementação)

| Campo do contrato | Fonte canônica correta | Regra de sincronização proposta |
|---|---|---|
| `contracts.title` / `purpose_summary` | `contract_parameter_values.objeto_contrato` (dicionário já declara origens: planejador/crm/proposta) | Ler sempre que os parâmetros estiverem `aprovado`, não só na criação — mesmo padrão de `gravarComVerificacao`: grava → confirma → relê |
| `contracts.scope_summary` | `contract_parameter_values.escopo_resumo` | Idem |
| `contract_parties` (role `contracting_client`) | `contratante_nome`/`contratante_documento`/`contratante_endereco` dos parâmetros | Idem — já existe `ressincronizarContratanteDaMatriz` (PR #35) como precedente funcional; generalizar o mesmo padrão para os demais campos em vez de deixar só a parte contratante coberta |
| `contract_parties` (role `provider`) | `PERFIL_INSTITUCIONAL` (fixo) | Já correto — não mexer |
| `contract_scope_items` | `servicos_incluidos`/`servicos_excluidos`/`fases_entregas` dos parâmetros | Idem — recriar/atualizar em vez de só inserir uma vez |
| "Proposta (referência interna)" na Jornada | *(a decidir pela proprietária)* | Duas opções: (a) aposentar o campo livre e substituir por link de leitura para a proposta real (`proposals`) quando existir; (b) manter como anotação interna deliberadamente informal, mas deixar isso explícito na UI ("isto não alimenta o contrato") em vez de implícito |

## 7. O que esta especificação NÃO decide

- Não decide se o resync deve ser automático (toda vez que os parâmetros mudam) ou por ação explícita (botão, como o resync de contratante já é) — impacto em auditoria e em "quem decidiu o quê" precisa de decisão da proprietária.
- Não decide o destino do campo "Proposta (referência interna)" da Jornada.
- Não decide se `proposals` (tabela comercial real) deve alimentar diretamente `contract_case_parameters.objeto_contrato`/`escopo_resumo`, ou se a Proprietária prefere manter a etapa de aprovação humana nos Parâmetros como o único ponto de entrada para o contrato (mais seguro, mais devagar).
- Não define o motor de reconciliação de divergência (quando duas fontes têm valores diferentes) — hoje isso não existe em nenhuma tela.

## 8. Próximo passo

Esta especificação está pronta para decisão. Antes de qualquer PR de código, a proprietária precisa decidir os três pontos da seção 7. A implementação, quando autorizada, deve seguir o mesmo padrão já testado e aprovado nesta sessão (`gravarComVerificacao`/`inserirComVerificacao`, PRs #31/#32/#35/#39) — sem criar mecanismo novo de persistência.
