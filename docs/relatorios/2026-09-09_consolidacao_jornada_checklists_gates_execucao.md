# Consolidação de redundâncias — Jornada, Checklists, Gates e Cadeia Operacional

```yaml
status: executado (parcial, por decisão de escopo — ver seção 11)
data: 2026-09-09
responsável pela decisão: Proprietária do Clube Ancestral
escopo: eliminar escritores/leitores duplicados de 14 conceitos operacionais, sem
  taxonomia nova, planejador novo, portal novo, tabela de entrega nova, checklist nova,
  tela de piloto nova ou auditoria nova.
limites respeitados: nenhuma migration de dado real executada; nenhuma tabela nova
  criada; client_deliverables não foi recriado, promovido nem tratado como segunda
  fonte cliente-facing (a fonte segue sendo Desk → app_projections → portal_projecoes).
```

Este relatório não declara nada concluído por teste unitário, build ou documento —
cada item abaixo diz explicitamente se a duplicidade foi eliminada de fato, rebaixada,
ou apenas registrada para decisão da proprietária.

## 1. Fontes canônicas e legadas — os 14 conceitos

| Conceito | Tabela(s) | Escritor canônico | Fonte legada/paralela | Duplicidade real |
|---|---|---|---|---|
| case_plans | `case_plans` | `sincronizarPlanejador` (`cadeia-operacional.server.ts`), UI real em `casos.$caseId.contrato.preparar.tsx` | `blueprint_parameters` (sem escritor de UI, só seed) | **Eliminada**: removido `salvarPlanoCaso` (`onboarding-jornada.functions.ts`), segundo escritor de `case_plans` com payload incompatível, nunca importado por rota alguma |
| blueprint_parameters | `blueprint_parameters` | nenhum (dado congelado, só leitura) | — | Já reconciliada: `materializarProposta` compara `updated_at` entre as duas tabelas em vez de tratar `blueprint_parameters` como preferencial fixo (achado de 08/09, preservado) |
| onboarding_planos / onboarding_checklist | `onboarding_planos`, `onboarding_checklist` | `recalcularPlanoOnboarding` (`onboarding-plano.functions.ts`) + `atualizarItemChecklistOnboarding` (`onboarding.functions.ts`), ambos em `onboarding.$id.tsx` | `onboarding-jornada.functions.ts`: `criarChecklistOnboarding`, `atualizarItemChecklist`, `iniciarOnboarding`, `ativarCaso`, `registrarEsperaExterna`, `obterJornadaCaso` | **Eliminada**: os 6 escritores + 1 leitor órfãos removidos do arquivo (nenhuma rota os importava) |
| tarefas | `tarefas` | `salvarTarefa`/`moverTarefa` (`ops.functions.ts`, já com dedup por título+janela), `abrirTarefaGate` (`fechamento-caso.functions.ts`), CRUD genérico (`tarefas.tsx`) | — | Não encontrada — único escritor real, sem ação |
| microentregas / app_projections | `app_projections` | `salvarProjecao`/`aprovarProjecao` (`biblioteca-evidencias.functions.ts`) | `client_deliverables` (`salvarEntregaCliente`/`aprovarEntregaCliente`/`publicarEntregaCliente`/`listarEntregasPublicadas`, todos em `onboarding-jornada.functions.ts`) | **Eliminada**: os 4 escritores/leitor de `client_deliverables` removidos do arquivo (já confirmados órfãos em 08/09, agora sem código morto). `client_deliverables` continua existindo, sem dado apagado |
| próxima ação | `crm_casos.proxima_acao` (manual) + RPC `proxima_acao_prioritaria_lote` (canônica) | `registrarProximaAcao` (`caso-canonico.functions.ts`) grava o manual; a RPC deriva a canônica | — | **Já mitigada em 07/09**: Lista de Casos (`casos.index.tsx`) mostra os dois lado a lado com aviso "diverge do campo manual" quando não batem — não são 4 telas desconexas, é 1 card com rótulo de origem. Qual fonte deve prevalecer é decisão de produto, não técnica — ver seção 10 |
| alertas | `case_alerts` | 4 escritores reais: `registrarProximaAcao`, `registrarRevalidacaoProposta`, `prepararAlertaProjecao`, `alertaInternoTicket` | — | **Reduzida**: só 1 dos 4 fazia dedup antes; os outros 3 agora também checam alerta `pending` do mesmo tipo/caso (ou mesmo ticket) antes de inserir — ver seção 6 |
| checklists | `onboarding_checklist`, `case_activation_checks`, `checklist_cadastral`, `checklist_juridico` | leitura/escrita já descritas acima | — | **Já corrigida em 04-08/09**: `case_gate_satisfeito_por_dado` (migration `20260908210000`) e as correções equivalentes de `checklist_cadastral`/`checklist_juridico` (04/09) já derivam o check do dado real antes de exigir clique manual — ver seção 3 |
| gates de ativação | `case_activation_checks`, gatilho `fn_caso_ativacao_gates_guard` | `casos-ativacao.functions.ts`, `gates-formalizacao.ts` | — | Não encontrada como duplicidade; um ponto cinzento identificado e corrigido (OS, ver abaixo) |
| documentos | `documents` | DESK: `salvarDocumento` (`documentos.functions.ts`, tela `/privacidade`); cliente: `confirmarEnvioDocumento` | — | Não eliminada nesta rodada — gate de consentimento (`fn_documents_guard`) bloqueia até upload interno de documento de trabalho; não está na lista de atos que o item 7 pede para liberar (é proteção de dado sensível/LGPD, não checklist técnico) — ver decisão 4 |
| proposta | `proposals` | `materializarProposta` (do Planejador) + `salvarProposta`/`mudarStatusProposta` (manual/Canva, `comercial.functions.ts`) | — | Duplicidade real, mas **já reconciliada**: guarda explícita em `materializarProposta` (achado de 08/09) impede que a via automática verse/apague proposta `origem: canva` aprovada |
| condição comercial | `commercial_conditions` | `aprovarPropostaEstruturada`/`derivarCondicaoComercial` (`cadeia-operacional.server.ts`) | — | Não encontrada |
| contrato | `contracts` | `gerarRascunhoInterno`/`criarInstrumento` (`contratos.functions.ts`) | — | Não encontrada. Gate de conciliação já corrigido antes (informa, não impede) — modelo usado para corrigir a OS agora |
| OS | `service_orders` | `emitirOSAnexoI` (automático, do Planejador) + `salvarOrdemServico` (manual, `contratos.functions.ts`) | — | Duplicidade de escritor existe (dois caminhos para a mesma tabela) e **não foi unificada** nesta rodada — ver decisão 5. O bloqueio indevido foi corrigido (seção 4) |

## 2. Campos/estados adaptados

Nenhum campo foi renomeado e nenhuma coluna nova foi criada nesta rodada (diferente da
rodada de microentregas, que precisou de `pessoa_id`/`due_at`). Aqui a mudança é só de
código: dois escritores retirados (`case_plans`, `client_deliverables`) e três
escritores de `case_alerts` passaram a consultar antes de gravar.

## 3. Checklists automaticamente satisfeitos por dado real

Já implementado antes desta rodada, confirmado e preservado:

- `case_gate_satisfeito_por_dado(_case, _check_key)` (migration `20260908210000_gate_satisfeito_por_dado_real.sql`)
  deriva `responsavel_designado`, `nucleo_familiar_conferido`,
  `proposta_aprovada_ou_isencao_autorizada` e `ordem_de_servico_criada` direto de
  `crm_casos`/`proposals`/`service_orders` — o item só aparece como bloqueio se o clique
  manual **e** o dado real concordarem que falta. Efeito medido no caso da Ana em 08/09:
  8 bloqueios → 4 reais.
- `contrato_assinado_ou_isencao_autorizada` e `pagamento_confirmado_ou_condicao_
  financeira_autorizada` continuam exigindo dado real de verdade — não foram
  afrouxados.
- O mesmo padrão já existia, corrigido separadamente, em `checklist_cadastral`
  (04/09) e `checklist_juridico` — ou seja, o "sistema pedindo confirmação de si mesmo"
  já foi generalizado antes desta rodada, não é um achado novo.

## 4. Pendências rebaixadas de bloqueio para informação

**OS/Anexo I (`emitirOSAnexoI`, `cadeia-operacional.server.ts`)** — única mudança de
comportamento desta rodada. Divergência de conciliação de catálogo (SKU/preço/condição/
escopo) travava com `throw new Error(barra)` a própria criação da OS, mesmo ela
nascendo em `status: "draft"` sem assinatura habilitada — o mesmo bug já corrigido em
`gerarRascunhoInterno` (contrato) em rodada anterior, nunca replicado para a OS. Agora:
a pendência passa por `assumirOuRecusarComUsuario` (mesmo mecanismo já usado 3 linhas
acima, na mesma função, para bloqueios estruturais) e é devolvida em
`pendenciasConciliacao` no retorno — informa, não impede o rascunho.

Não há mais nenhuma pendência técnica encontrada bloqueando lead, caso, escopo,
proposta rascunho, condição interna, contrato rascunho, tarefa, ou microentrega
interna — confirmado por leitura de código, não apenas por ausência de erro em teste.
Pesquisa genealógica (fluxo de evidências) não foi auditada especificamente nesta
rodada quanto a esse ponto — não afirmo que está livre de gate indevido, só que não foi
verificada.

## 5. Gates duros preservados, e em qual ato

Confirmados como corretamente escopados a ato externo/irreversível, sem alteração:

| Gate | Ato que bloqueia |
|---|---|
| `gates-formalizacao.ts` (`avaliarGates`/`bloqueiosDaAcao`) | gerar versão final, solicitar assinatura, liberar formalização financeira, liberar cobrança futura |
| `fn_caso_ativacao_gates_guard` (trigger) | só dispara na transição `ativo: false → true` de `crm_casos` — nunca no INSERT |
| `aprovarParaEnvio` (contratos) | só trava "approved_for_send", não a geração do rascunho |
| `gates-piloto.ts`/`gates-override.ts`/`app-cliente-gate.ts` | piloto Ana, override de proprietária, publicação no App Cliente |
| `fn_documents_guard` (trigger) | upload interno sem consentimento ativo/dispensado nas categorias identificação/certidão/documento civil/financeiro — não tocado (ver decisão 4) |

## 6. Tarefas/alertas deduplicados

`case_alerts` tinha 4 escritores reais; só `registrarRevalidacaoProposta`
(`escopo-conferencia.functions.ts`) checava um alerta `pending` do mesmo tipo antes de
inserir. Os outros 3 agora seguem o mesmo padrão:

- `prepararAlertaProjecao` (`biblioteca-evidencias.functions.ts`, ação que eu mesma
  adicionei em 08/09) — reaproveita alerta `microentrega_pendente` `pending` do caso em
  vez de duplicar.
- `registrarProximaAcao` (`caso-canonico.functions.ts`) — antes empilhava um novo alerta
  a cada clique em "registrar"; agora atualiza o alerta `proxima_acao` `pending`
  existente (título/detalhe/prazo) em vez de duplicar.
- `alertaInternoTicket` (`portal-cliente.server.ts`) — várias mensagens seguidas do
  cliente no mesmo ticket, antes da equipe responder, não empilham mais um alerta por
  mensagem (dedup por `case_id` + `ticketId`).

`tarefas` já tinha dedup por título+janela em `ops.functions.ts:salvarTarefa` — nenhuma
mudança necessária.

## 7. Próxima ação canônica

Não unifiquei em uma fonte única nesta rodada — ver seção 1 e decisão 1. O que existe
hoje (desde 07/09) é uma exibição transparente das duas fontes lado a lado, com aviso
quando divergem. Isso satisfaz "não aparecer como card separado sem referência" (item
6): é um card só, com rótulo de origem. Não satisfaz plenamente "apenas uma por caso"
(item 5) no sentido de existir uma única fonte de dado — existem duas, mostradas juntas.
Decidir qual prevalece é escolha de produto (ver seção 10).

## 8. Impacto em Caso 360, Painel Hoje e App

- **Caso 360**: nenhuma tela lida diretamente com nenhum dos códigos removidos — elas já
  liam os escritores canônicos (`onboarding.$id.tsx`, `casos.$caseId.contrato.preparar.tsx`).
  Impacto zero em runtime, só remoção de código morto.
- **Painel Hoje** (`PainelDia`): não lê `onboarding-jornada.functions.ts` — sem impacto.
- **App Cliente**: sem impacto — `client_deliverables` já estava bloqueado
  (`BLOQUEIOS_CA_PORTAL_02`) e continua bloqueado; a fonte cliente-facing segue sendo
  só `app_projections`/`portal_projecoes`.
- **Painel de Jornada interno** (`painel-onboarding-jornada.tsx`, único consumidor de
  `obterPainelJornada`): sem alteração de comportamento — a função foi só isolada no
  arquivo, mesma lógica, mesma consulta.

## 9. Migrations não aplicadas — plano auditável (blueprint_parameters → case_plans)

Nenhuma migration de dado foi criada nem executada, conforme item 4. Plano registrado
para decisão futura, caso a proprietária autorize:

1. Para cada `case_id` com linha em `blueprint_parameters` e **sem** linha equivalente
   (mais recente) em `case_plans`: gerar uma linha de `case_plans` a partir dos campos
   de `blueprint_parameters`, usando o mesmo mapeamento de campo que
   `materializarProposta` já usa para ler os dois (não inventar mapeamento novo).
2. Marcar a linha de origem em `blueprint_parameters` com um campo de auditoria
   (`migrado_para_case_plan_id`, a criar só se este plano for aprovado) — nunca
   apagar ou sobrescrever.
3. Rodar em modo dry-run primeiro (relatório de quantos casos seriam afetados, sem
   gravar nada), revisar com a proprietária, só então aplicar.
4. `materializarProposta` mantém a comparação por `updated_at` durante e depois da
   migração — nenhuma mudança de código é necessária nele para isso funcionar.

Não executei o dry-run nem contei quantos casos têm essa divergência hoje — isso já
seria uma consulta sobre dado de caso real, e o item 4 pede só o plano, não a execução.

## 10. Commits e reversão

- Commit único nesta rodada, direto em `main` (mesmo fluxo já usado nesta sessão:
  branch a partir de `origin/main`, `tsc`/`vitest` limpos, fast-forward, sync da branch
  de recuperação).
- Arquivos tocados: `src/lib/cadeia-operacional.server.ts` (gate da OS),
  `src/lib/biblioteca-evidencias.functions.ts` (dedup de alerta),
  `src/lib/caso-canonico.functions.ts` (dedup de alerta),
  `src/lib/portal-cliente.server.ts` (dedup de alerta),
  `src/lib/onboarding-jornada.functions.ts` (remoção de 7 exports órfãos).
- **Reversão**: `git revert` do commit restaura o comportamento anterior em todos os 5
  arquivos sem efeito colateral em dado — nenhuma tabela, coluna ou linha foi tocada,
  só código. `onboarding-jornada.functions.ts` reverte para a versão com os
  escritores mortos (sem prejuízo, já que continuavam não usados).
- **Validação (item 8 do pedido)**: sem sessão autenticada disponível nesta sessão
  (mesma limitação já registrada nos dois relatórios anteriores) — não usei o caso da
  Ana nem nenhum outro caso real como laboratório. Validação feita por: (a) leitura de
  código confirmando que o padrão de dedup novo é idêntico ao já usado e testado em
  `registrarRevalidacaoProposta`; (b) `npx tsc --noEmit` limpo; (c) os 1692 testes
  automatizados existentes (177 arquivos) continuam passando, incluindo os que cobrem
  `case_ativacao_bloqueios_reais`/`case_gate_satisfeito_por_dado` e a cadeia
  operacional. Prova de UI/reload ao vivo (criar duas próximas ações seguidas e ver um
  só alerta, por exemplo) depende de homologação com sessão autenticada — não feita.

## 11. Decisões que dependem da Proprietária

1. **Próxima ação — qual fonte prevalece.** Campo manual (`crm_casos.proxima_acao`) ou
   RPC canônica (`proxima_acao_prioritaria_lote`, mesma da Ficha 360)? Hoje os dois
   convivem, mostrados lado a lado com aviso de divergência. Unificar exigiria decidir
   se o campo manual deixa de existir ou vira só um "apelido" de exibição.
2. **blueprint_parameters → case_plans.** Autorizar o plano de migração da seção 9 (com
   dry-run primeiro) ou manter os dois convivendo indefinidamente, com
   `materializarProposta` decidindo por `updated_at` a cada caso?
3. **OS: dois escritores (`emitirOSAnexoI` automático vs. `salvarOrdemServico`
   manual).** Corrigi só o bloqueio indevido; não unifiquei os dois caminhos de
   escrita. Deve o formulário manual em `/contratos/$id` continuar existindo ao lado do
   fluxo automático da Cadeia Operacional, ou um deve ceder ao outro?
4. **`fn_documents_guard` bloqueando upload interno sem consentimento.** É proteção de
   dado sensível (LGPD) — não toquei nele por não estar na lista de atos do item 7 e por
   ser uma trava de privacidade, não um "checklist técnico" redundante. Confirmar se
   essa leitura está certa, ou se a proprietária quer que a equipe consiga arquivar um
   documento de trabalho internamente antes do consentimento formal do titular.
5. **Responsável em `proposals`/`service_orders`/`commercial_conditions`.**
   `materializarProposta`/`CadeiaOperacional` gravam `responsavel_comercial`/
   `responsavel_operacional` como texto fixo ("Comercial responsável"), não o usuário
   autenticado; `service_orders.responsible_user_id` nunca é preenchido;
   `commercial_conditions` não tem campo de responsável nenhum. Não corrigi nesta
   rodada (fora do escopo dos 6 itens de correção pedidos) — registrado para decidir se
   entra numa próxima rodada.
