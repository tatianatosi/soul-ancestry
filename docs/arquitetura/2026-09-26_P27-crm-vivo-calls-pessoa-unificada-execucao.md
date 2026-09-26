# P27 — Execução das premissas de CRM Vivo, Painel de Calls, Painel Hoje e Pessoa Unificada (2026-09-26)

```yaml
status: executado — gaps genuínos e aditivos fechados; 1 bug de vocabulário real corrigido
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "no pente fino dos documentos execute as premissas também para o crm vivo painel
  de calls pessoa unificada e as demais políticas que não foram executadas, em relação ao painel
  tomaremos essa decisão quando estivermos fechando o desk"
```

## Como investiguei

Localizados em disco os documentos reais de 31/08/2026 que fundamentam as premissas pedidas —
`docs/evolucao/recuperados/prompts-lovable-2026-08-31/PROMPT_MOTORES_UNIFICADOS_CRM_VIVO_ONBOARDING_CADENCIAS_INDICADORES.md`,
`docs/politicas/ADENDO-PAINEL-CALLS-DISCOVERY-2026-08-31.md`,
`docs/evolucao/recuperados/prompts-lovable-2026-08-31/pacote_instrucoes_redesenho_unificado_desk_app_pessoas_familias.md`
(o "Pacote de Instruções" citado pela Proprietária) e os documentos já existentes de Pessoa
Unificada (`docs/design-system/de-para-pessoa-unificada.md`,
`docs/relatorios/2026-09-24_roteiro-homologacao-pessoa-unificada.md`). Disparei 3 agentes Explore
em paralelo (só leitura) para cruzar cada premissa concreta contra o código real, com a instrução
explícita de nunca tratar vocabulário hipotético do documento (`clients`, `cases`, `contracts`,
`cadence_actions` etc.) como tabela ausente — só flagar gap quando o CONCEITO realmente não tem
equivalente real, depois de busca ampla.

## Gaps genuínos encontrados e fechados

1. **`salvarLeadDesk` — insert de lead novo sem releitura de verificação.** Gap já apontado no
   adendo do Painel de Calls em 31/08/2026 ("`.insert()` direto... sem a releitura de
   `inserirComVerificacao`"), confirmado ainda aberto hoje. Corrigido: o insert agora chama
   `inserirComVerificacao` (mesmo helper já usado no caminho de update da mesma função) — grava,
   relê pelo id, compara payload, lança erro explícito se divergir.
2. **Caso 360 sem botão "Mover fase" no cabeçalho.** A fase comercial (`eixo_comercial`) só era
   editável via um dropdown genérico enterrado na seção "Formalização", exigindo rolar a página e
   usar o botão "Salvar alterações" do formulário inteiro. Adicionado um `<select>` de um clique
   no mesmo bloco dos outros CTAs do cabeçalho ("Concluir", "Reprogramar", "Criar tarefa"),
   chamando `atualizar()` diretamente — mesmo escritor, sem tabela/coluna nova.
3. **Rótulo divergente da "Visão Administrativa do Cliente" entre Pessoa 360 e Caso 360.** Pessoa
   360 dizia "Visão do cliente"; Caso 360 dizia "Abrir visão do cliente" — mesma ação
   (`/app-cliente-como-pessoa?casoId=`), nomes diferentes. Unificado para "Abrir Visão
   Administrativa do Cliente" nos dois lugares (rótulo do Pacote de Instruções, linha 124).
4. **"Experiência no App" ausente em Pessoa 360.** Caso 360 já tinha um resumo ("Visão do
   cliente"); Pessoa 360 só linkava para a visão completa, sem nenhum resumo inline. Criado
   `<ExperienciaNoApp caseId>`, reaproveitando o mesmo `resumoVisaoClienteCaso` já usado em Caso
   360 — nenhum escritor, rota ou consulta nova.
5. **"Próximo passo publicado" e "último acesso do cliente" nunca apareciam em nenhum dos dois
   resumos**, embora o dado já estivesse computável (`projetarProximaAcaoCliente`/
   `sinaisDoCasoPortal`, os mesmos usados em `dadosVivosDoPortalComoAdmin`) ou já retornado
   (`acesso.ultimoAcessoEm`) e simplesmente não renderizado. `resumoVisaoClienteCaso` passou a
   calcular `proximaAcao` (2 consultas adicionais — `portal_document_requests` e `invoices`,
   mesmo padrão já usado alhures) e os dois campos agora aparecem em Caso 360 e Pessoa 360.
6. **Painel Hoje (`/painel`) sem 3 dos 10 blocos obrigatórios do Pacote de Instruções**:
   "Propostas aguardando resposta", "Contratos aguardando assinatura" e "Pagamentos
   pendentes/vencidos". Fechado com dado real, sem tabela nova: `eixo_comercial` passou a ser
   carregado na mesma consulta de carteira já existente (nova função pura
   `propostasAguardandoResposta`); duas novas consultas leves por organização em
   `carregarGoLive` (`contracts.status = 'sent'`, `invoices.status in ('aberta','vencida')` —
   vocabulário real dos CHECKs, não inventado) alimentam os outros dois cards. Todos os itens dos
   3 cards linkam para `/casos/$caseId` do caso correspondente — nunca uma lista desconectada
   (item pedido explicitamente pelo documento: "ação direta deve abrir o contexto correto no Caso
   360").

## Bug real encontrado por acaso e corrigido (não pedido, mas evidenciado durante a investigação)

Ao implementar `proximaAcao` em `resumoVisaoClienteCaso`, copiei o padrão de
`dadosVivosDoPortalComoAdmin` — que filtra faturas por
`.in("status", ["pendente", "vencida"])`. Conferindo o CHECK real de `invoices.status`
(`rascunho, aberta, paga, parcial, vencida, cancelada` — migration `20260816190336`), **`"pendente"`
nunca é um valor possível**: essa condição só captura faturas `vencida`, nunca as `aberta`
(pendentes de pagamento mas ainda dentro do prazo). O mesmo bug já existia, sem relação com esta
tarefa, em mais dois pontos que alimentam o **sinal real do App Cliente** de "pagamento pendente":
`portal-cliente.functions.ts` (`portalCasos`) e `portal-dados-vivos.functions.ts`
(`portal-dados-vivos`). Corrigidos os 3 pontos para `["aberta", "vencida"]` — o sinal "há um
pagamento em aberto" no portal do cliente provavelmente nunca disparava para faturas ainda não
vencidas antes deste corte.

## Não executado — decisão adiada pela própria Proprietária

**Sobreposição `painel-dia.tsx` × `/painel` (golive).** Achado do corte anterior (P26): 13 testes
tratam `painel-dia.tsx` como fonte viva do Painel Hoje, mas a rota real usa uma implementação
diferente (`golive-*.ts`). A Proprietária confirmou explicitamente: "em relação ao painel tomaremos
essa decisão quando estivermos fechando o desk" — nenhum dos dois arquivos foi tocado, nenhuma
reconciliação foi feita. Os 3 cards novos deste corte foram implementados na implementação golive
vigente (a que a rota realmente usa hoje), não em `painel-dia.tsx`.

Itens dos documentos ainda genuinamente sem decisão (já registrados em P26, não repetidos aqui):
vocabulário de 7 estados de microentrega, portal de proposta pré-conversão, Núcleo 360 endereçável.

## Verificação

`tsc --noEmit` limpo. 17 testes novos
(`p27-crm-vivo-calls-pessoa-unificada-2026-09-26.test.ts`) cobrindo os 6 gaps fechados e os 2
pontos do bug de vocabulário corrigido. 2 testes existentes atualizados para a nova implementação
(`d2-lead-auditavel.test.ts`, `motor-lote2-batch2-erros-silenciosos.test.ts` — o insert de lead
passou a usar `inserirComVerificacao`, mensagem de erro mudou de propósito). Suíte completa
idêntica à baseline estável (7 arquivos/11 testes pré-existentes, visuais/portal, sem relação com
este corte). `vite build` limpo.

## Prova Lovable pós-push

- Em `/casos/$caseId` de um caso real: conferir o novo seletor "Mover fase" no topo, ao lado de
  "Criar tarefa"; escolher uma fase e confirmar que "Etapa comercial" (seção Formalização) reflete
  a mudança sem precisar salvar o formulário grande. Conferir também "Abrir Visão Administrativa do
  Cliente" (rótulo novo) e as duas linhas novas no card "Visão do cliente" (próximo passo
  publicado, último acesso).
- Em `/pessoas/$clienteId` de uma pessoa com caso: conferir o novo bloco "Experiência no App" sob
  cada caso listado, e o mesmo rótulo "Abrir Visão Administrativa do Cliente".
- Em `/painel`: conferir os 3 cards novos ("Propostas aguardando resposta", "Contratos aguardando
  assinatura", "Pagamentos pendentes/vencidos") e que clicar em qualquer item abre o Caso 360
  correspondente.
