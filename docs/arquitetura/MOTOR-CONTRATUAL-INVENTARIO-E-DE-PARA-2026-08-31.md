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

## 9. Revisão 01/09/2026 — correção de citação + mecanismo real do Canva encontrado

A proprietária pediu para verificar como o resync já foi implementado antes de decidir entre automático e manual, e apontou que o ideal é `proposals` ser alimentada a partir do link/extração do Canva, com aprovação humana. Duas correções e uma confirmação, todas verificadas em código real (branch `main`, commit `2a772bb`):

### 9.1 Correção — `ressincronizarContratanteDaMatriz` não existe

A linha 58 (tabela da seção 6) citava `ressincronizarContratanteDaMatriz` (PR #35) como precedente funcional de resync. **Isso estava errado — essa função não existe no código.** O único mecanismo de resync real hoje é `ressincronizarAnexosDoCaso` (`contrato-parametros.functions.ts:779`), para anexos/Ordem de Serviço, não para contratante/partes. Padrão real, confirmado:

- Botão "Verificar" chama a função com `confirmar: false` → só simula, devolve um plano (`{ codigo, titulo, acao: "ja_canonica" | "materializar", versaoAtual }`), não grava nada.
- Botão "Sincronizar" chama de novo com `confirmar: true` → aí sim grava, usando `sincronizarAnexosPersistidos`.
- Idempotente por hash de conteúdo — só regrava quando o conteúdo realmente mudou.
- Nunca sobrescreve instância já congelada (assinada/anexada/arquivada).
- Grava em `audit_logs` com o motivo e o plano executado.

Esse é o padrão real a generalizar para objeto/escopo/partes — dois botões (verificar → sincronizar), nunca automático sem confirmação, sempre auditado. **Recomendação:** seguir esse mesmo padrão explícito de botão, não resync automático — mantém o mesmo nível de auditoria já usado no resto do motor contratual e evita gravação silenciosa que a proprietária já rejeitou antes (é o motivo de `gravarComVerificacao` existir). A proprietária disse "acredito que resync seja melhor" sem especificar automático ou manual — esta recomendação assume o padrão de botão já comprovado; se a intenção era resync automático, precisa de confirmação explícita antes de especificar diferente do que já existe.

### 9.2 Confirmação — a "Proposta (referência interna)" já foi localizada com precisão

A citação original (linha 20) tinha os nomes de campo aproximados. Confirmado o local exato: seção **"Proposta (referência interna)"** em `casos.$caseId.index.tsx` (não em `fechamento.tsx`, e não dentro do próprio Contrato — vive no índice/Jornada do Caso 360). Campos reais:

- `proposta_referencia_interna` — texto livre ("Referência interna da proposta")
- `data_proposta` — data
- `proposta_url_interna` — texto livre ("Link interno da proposta")
- `condicao_comercial_interna_pendente` — booleano ("Condição comercial interna": pendente/homologada)
- `escopo_incluido_resumido` / `escopo_excluido_resumido` — texto livre

Um comentário no próprio código (27/08/2026) documenta que esses campos foram movidos de "Comercial" para o índice do Caso por decisão da proprietária ("o que é lead e faz parte da pessoa... tudo que compõe ela") — **é essa seção que a proprietária está chamando de "campo livre de jornada de onboarding no contrato".** Confirmado: sim, é isso, com a ressalva de que fica no Caso 360, não dentro da tela do Contrato em si.

**Achado adicional não documentado antes:** existe um SEGUNDO campo livre equivalente, `proposta_link_interno`, no formulário de **Leads** (`leads.tsx`) — redundante com `proposta_url_interna` do Caso, sem nenhuma ligação entre os dois nem com a tabela `proposals` real.

### 9.3 Mecanismo real já existe para "proposals alimentada pelo Canva + aprovação humana"

A proprietária pediu que o ideal fosse `proposals` vir do link do Canva com aprovação humana. **Isso já existe em código, só não está conectado aos Parâmetros Contratuais:**

- Tabela real `proposal_canva_pages` (migration `20260819213622`): uma linha por página 1–7 da proposta Canva, vinculada a `proposal_id`, com `page_content_structured` (jsonb), `campos_nao_localizados`, `extracao_status` (pendente/em_extração/extraída/não_aplicável).
- Componente `CompletudeCanva` (`completude-canva.tsx`): tela real onde um humano registra a extração de cada página, marca o que não foi localizado (nunca inventa valor) e confirma status — isto já é a "aprovação humana" que a proprietária pediu.
- Gate real em `crm-desk.functions.ts`: geração de contrato e anexos fica **bloqueada** até as 7 páginas estarem `extraída` — "Fonte obrigatória de escopo: páginas 1 a 7".
- `proposals` já tem `lead_id` e `client_id` como FK reais (schema, migration `20260816190336`) — a ligação Lead→Proposta→Cliente já existe estruturalmente, só não há `person_id` comum (ver revisão da Pessoa Canônica).

**O que falta, e é isso que muda o de-para da seção 6:** `page_content_structured` (já extraído e aprovado por humano) não alimenta `contract_case_parameters.objeto_contrato`/`escopo_resumo` — o de-para da seção 6 deve ler dali, não de `proposals.escopo` (que é só um campo de texto único, não estruturado) nem do campo livre da Jornada (que segue sendo anotação solta, sem gate nenhum).

### 9.4 Atualização da seção 7 (decisões abertas)

- Ponto 1 (automático vs. manual): a proprietária já indicou preferência por resync — recomendação é usar o padrão de botão verificar/sincronizar já existente (9.1), aguardando confirmação final.
- Ponto 3 (`proposals` alimenta parâmetros direto?): **respondido** — via `proposal_canva_pages` após completude + aprovação humana (9.3), não via `proposals.escopo` direto e não pulando a aprovação.
- Ponto 2 (campo livre da Jornada): segue em aberto — agora com a localização exata (9.2) e o achado do campo duplicado em Leads, a proprietária pode decidir com mais precisão: aposentar ambos, ou explicitar na UI que nenhum alimenta o contrato.
