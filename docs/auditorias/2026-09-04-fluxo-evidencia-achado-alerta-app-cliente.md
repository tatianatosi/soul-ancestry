# Fluxo evidência → achado → alerta ao cliente → App Cliente: nenhum elo automático

```yaml
status: em revisão — pendente de decisão da Proprietária
versão: "1.0"
data: 2026-09-04
projeto: Clube Ancestral
classificação: auditoria de comportamento real (micro-entregas e jornada do cliente)
responsável pela decisão: Proprietária do Clube Ancestral
fontes: [código real (branch de trabalho da sessão), migrations Supabase, testes]
escopo: [módulo de achados genealógicos, micro-entregas do cliente, alerta/notificação ao cliente,
  visibilidade de achado no App Cliente]
premissas: [reuso do que já existe, nenhuma decisão de arquitetura tomada aqui, sem migration/deploy nesta rodada]
limites: [somente leitura — nenhum código alterado, nenhuma tabela criada, nenhuma convergência decidida]
próximos passos: [backlog P0/P1/P2 na seção 8, perguntas de decisão na seção 9]
critério de aceite: [cada achado tem path/tabela real, com file:line]
```

## Causa

A Proprietária descreveu o fluxo ideal: a cada nova evidência encontrada, ela vira um achado; o achado
gera um alerta enviado ao cliente; e o achado também fica visível no App Cliente. Pediu para verificar
isso em todo o material de micro-entregas e no fluxo da jornada do cliente. Esta rodada complementa a
auditoria de 03/09 (`2026-09-03-pente-fino-calculadoras-radares-e-centro-inteligencia.md`), que já tinha
deixado essa pergunta em aberto (seção 9, pergunta 5) sem confirmar se o pipeline estava implementado.

## Resumo executivo

**Não está implementado ponta a ponta. Quebra nos cinco elos, um por um.** O padrão é o mesmo já visto
hoje em duas outras frentes (evidência em 3 tabelas com vocabulário divergente, PR #84; assinatura de
contrato que não propaga para o gate do portal, PR #85): peças isoladas, cada uma funcionando por si,
sem nenhuma automação nem vínculo programático entre elas.

## 1. De evidência a achado — sempre ação humana, sem gatilho automático

`salvarAchado` (`src/lib/achados-genealogicos.functions.ts:123-149`) é a única forma de criar/editar
`genealogical_findings`, chamada só pelo formulário humano em `src/routes/_authenticated/achados.$caseId.tsx:143-150,353-359`.
Nenhum código de evidência (`mudarEstadoEvidencia`, `src/lib/pesquisa-cadeia.functions.ts:218-278`)
insere ou atualiza achado.

Existe um quase-elo: `gatilhosDaEvidencia()` (`src/lib/pesquisa-cadeia.ts:83-117`) devolve, quando a
evidência muda para `"validada_internamente"`, um `GatilhoInterno` do tipo `rascunho_microentrega`
(linhas 111-113) — mas é função pura, só renderizada como texto na tela (`pesquisa-evidencias.$caseId.tsx:556`).
Não grava nada; é uma sugestão visual para o humano agir, não um gatilho.

## 2. De achado a "elegível para entrega ao cliente" — checkbox manual, dois campos sem rotina

- `eligible_for_client_deliverable`: checkbox humano em `achados.$caseId.tsx:343-350` ("Elegível para
  entrega ao cliente — só após validação interna").
- `client_deliverable_id`: **não existe campo de UI nem código que o preencha** em lugar nenhum lido
  nesta rodada.
- `client_projection_status`: aparece só em leitura (`pesquisa-cadeia.functions.ts:95`,
  `pesquisa-evidencias.$caseId.tsx:274,436`) — nenhuma mutação server-side grava esse campo.

`validarAchado()` (`src/lib/achados-genealogicos.ts:169-174`) só impõe consistência (não deixa marcar
elegível sem `validado_internamente`; não deixa ter `client_deliverable_id` sem elegibilidade) — é
trava, não gatilho que preenche.

## 3. De achado a `client_deliverables` — duas telas humanas desconectadas

`client_deliverables` nasce de `criarMicroentregaCliente` (`src/lib/jornada-cliente.functions.ts:177-220`),
server function separada, chamada por ação humana distinta (tela de jornada do caso), exigindo
`tituloCliente`/`resumoAprovado` digitados à mão. O insert (linhas 199-217) **não referencia achado
nenhum** — os únicos campos livres são `internal_reference` (texto livre, não FK) e `deep_link`.

Ou seja: um achado com `client_deliverable_id` preenchido pressupõe uma entrega já existente — mas
nada cria essa entrega a partir do achado, nem grava de volta o id da entrega no achado. O humano
precisaria (a) criar a micro-entrega numa tela, (b) copiar o id gerado e colar manualmente no achado,
numa tela diferente, sem campo de UI para isso (item 2). A publicação em si também é manual —
`transicionarMicroentrega` (`jornada-cliente.functions.ts:223-263`) só marca `available_at` quando o
`approval_status` vira `"publicado"` por chamada explícita.

## 4. Alerta ao cliente — não existe, só um protótipo desconectado

- `src/lib/alertas-whatsapp.ts` gera **templates de texto** (`gerarAlertaAchado`, `gerarAlertaEquipe`).
  O próprio comentário no topo do arquivo (linha 9) diz: "Por enquanto gera templates; a integração de
  envio será via API externa."
- `src/components/caso/descobertas-alertas.tsx` (`DescoberturasAlertas`) tem um botão "Enviar via
  WhatsApp" cujo handler só faz `console.log("Alerta enviado...")` (linha 68), com
  `// TODO: Integrar com API de WhatsApp/notificações` (linha 67). **Este componente não é importado
  por nenhuma rota ou tela do produto** — confirmado por busca, só se autorreferencia e aparece citado
  num documento histórico (`docs/IMPLEMENTACAO_27-AUG-2026.md`). É código órfão.
- `communication_queue` (a fila de rascunhos com aprovação humana, já mapeada nesta sessão para
  solicitações documentais) não tem nenhuma chamada originada de achado/`client_deliverables` — é
  acionada por `proxima_acao_codigo` de CRM, um caminho totalmente diferente.

**Não há hoje nenhum canal funcional de alerta ao cliente sobre achado** — nem automático, nem manual
com um botão que funcione.

### 4.1 — Correção: existe arquitetura decidida para "alerta", e ela não é "notificar o cliente"

A Proprietária apontou que este material provavelmente já estava especificado em arquitetura/onboarding
— achado nos documentos de operação já existentes (`docs/G06_ACHADOS_E_ENCONTROS_v1.0.md`,
`docs/operacao/CA-OPS-01_Orquestracao_Jornada_CRM_Onboarding_Microentregas.md`,
`docs/operacao/CA-OPS-02_Fiacao_Cadencia_Mensagens_Alertas.md`), não cruzados na primeira versão desta
auditoria. Achado real, que corrige a leitura acima:

- **G-06 (20/08) já definia, por desenho, que "alerta" não é notificação automática ao cliente.** O
  fluxo documentado é "Fonte → Evidência → Validação interna → Achado Genealógico → Árvore/Linha do
  tempo → Micro-entrega ou Relatório, **se aprovado**" — e a confirmação do próprio documento diz:
  "nenhuma publicação, mensagem ou ação externa" é disparada pelo módulo. Isso não é lacuna — é a regra
  desde a origem do módulo.
- **CA-OPS-01/02 definem "alerta" como um sinal interno que abre um objeto e sugere um template — nunca
  envia sozinho.** Regra textual do CA-OPS-01 (seção B): ações permitidas por evento incluem "sugerir
  template vigente" e "gerar alerta derivado"; ações **não autorizadas** incluem "enviar WhatsApp/e-mail/
  SMS". O CA-OPS-02 confirma em código real: `MAPA_ALERTA_TEMPLATE`
  (`src/lib/fiacao-cadencia-catalogo.ts`) liga tipo de alerta → modelo na Biblioteca de Mensagens, com
  ação sempre `abrir_preview_e_copiar_manual` — nunca envio automático. A "Matriz de Alertas e
  Acionamentos" (`docs/operacao/CA-OPS-02_Matriz_Alertas_e_Acionamentos.csv`) já cataloga um alerta
  **especificamente para achados** — `ale-achados`, módulo "Achados novos", rota `/achados/$caseId`,
  severidade média, estado **`CONECTADO`** — confirmado em código
  (`fiacao-cadencia-catalogo.ts:227-237`, `AUDITORIA_MODULOS_ALERTA`).

**O que isso muda na leitura**: o "alerta" que a arquitetura já decidiu é um sinal **interno**, para a
equipe revisar achados/micro-entregas pendentes (`ale-achados` → `/achados/$caseId`;
`ale-microentregas` → `/ops`) e, se decidir comunicar, abrir manualmente um template pronto para copiar
e enviar — nunca um envio automático ao cliente. Isso está desenhado corretamente, e uma parte real
existe (`ale-achados` está `CONECTADO`).

**O que continua sendo gap real, mesmo dentro dessa arquitetura correta**:
1. `ale-achados` na matriz tem `template_oficial = "não aplicável"` — não existe, no catálogo de
   `MAPA_ALERTA_TEMPLATE`, nenhum modelo específico para "achado elegível pronto para virar
   micro-entrega ao cliente" (os 5 alertas com template real são todos de cadência/touchpoint, não de
   achado).
2. `DescoberturasAlertas`/`alertas-whatsapp.ts` — que seriam o componente de "abrir preview e copiar
   manual" para achado especificamente — existem em código mas o componente não está importado em
   nenhuma tela, e o botão que existe só faz `console.log`. Ou seja: mesmo a etapa manual prevista pela
   arquitetura não tem hoje um botão funcional.
3. O terceiro elo do fluxo do prompt original da Proprietária ("acha visível no App") segue sendo o
   achado real e não corrigido por este achado novo: `client_deliverables` está bloqueada por RLS de
   portal (seção 5), e o caminho que funciona (`app_projections`) não nasce de achado.

### 4.2 — Duas ações distintas pedidas pela Proprietária, e se existe backlog de comunicação

A Proprietária separou o pedido em duas ações que a arquitetura hoje trata como uma coisa só (e não
deveria):

1. **Autorizar via Desk o alerta 🔔 do achado** — um ato humano explícito, na tela `/achados/$caseId`,
   que transforma um achado em evento de alerta interno (o que `ale-achados` já cataloga como
   `CONECTADO`, seção 4.1). Confirmado em código: `achados.$caseId.tsx` hoje só registra o achado
   (`salvarAchado`) e mostra o aviso "Registro interno. Nada aqui é publicado no App Cliente nem gera
   mensagem" (linha 198) — não existe, na tela, nenhum botão de "autorizar alerta" separado do
   salvamento. A autorização que a Proprietária pede — um passo humano deliberado, distinto de só
   salvar o achado — **não existe hoje como ação própria**; é o mesmo gap já registrado no backlog P0-2
   (template + botão funcional), só que nomeado com mais precisão: falta a ação de **autorizar**, não só
   o botão de copiar.
2. **Preparar a mensagem ao cliente com o alerta no WhatsApp manual, junto com o onboarding** — depende
   do item 1 (só faz sentido preparar mensagem de um alerta já autorizado) e do template que falta no
   catálogo (`MAPA_ALERTA_TEMPLATE`, backlog P0-2). "Junto com o onboarding" significa: essa preparação
   de mensagem deveria aparecer na mesma superfície onde a equipe já acompanha onboarding/micro-entregas
   (`/ops`, `Onboarding-Jornada`), não como uma tela isolada — hoje não aparece em nenhuma das duas.

**Backlog do que já foi enviado ao cliente / o que o cliente respondeu / o que a equipe enviou** — a
Proprietária esperava que isso já existisse. A resposta é dividida, com evidência de código para os dois
lados:

- **Existe, e é real, para o canal dentro do App/Portal**: `portal_tickets` +
  `portal_ticket_messages` (`src/lib/portal-atendimento.functions.ts:582-669`). `ticketInterno` lê as
  mensagens com `autor_tipo` (equipe/cliente) e `responderTicketEquipe` grava resposta da equipe com
  `visivel_cliente`. É um histórico bidirecional real — mas é o canal de **tickets de suporte dentro do
  Portal**, não WhatsApp.
- **Não existe para WhatsApp**: `registrarUsoTemplate`
  (`src/lib/message-library.functions.ts:441-521`) grava em `message_template_usage` só que um template
  foi copiado — `external_send_status: "copiado_para_envio_manual"` — sem o texto final realmente
  enviado (a equipe edita antes de colar no WhatsApp) e sem nenhum registro de resposta do cliente no
  WhatsApp. Esse canal é, por desenho, externo ao sistema (CA-OPS-02: envio sempre manual, fora da
  plataforma), então hoje não há como o sistema capturar automaticamente o que foi enviado de fato nem
  o que o cliente respondeu — só que **um template foi copiado, quando, e por qual alerta**.

Ou seja: o backlog "o que enviamos / o que o cliente mandou / o que nós mandamos" existe de verdade só
para tickets do Portal. Para WhatsApp — o canal que `MAPA_ALERTA_TEMPLATE` e o alerta de achado
efetivamente usam — só existe o registro de que um template foi copiado, nunca o conteúdo final nem a
resposta. Fechar esse gap exigiria um passo novo (colar de volta o texto enviado e, se houver, a
resposta do cliente) — hoje inexistente em qualquer tela.

## 5. Visibilidade no App Cliente — três tabelas paralelas, sem link entre si

- `src/lib/app-visibilidade.ts` controla só estado de tela (disponível/em preparação) a partir de
  `EscopoCliente.entregasLiberadas`, um número passado de fora — não lê achado nem `client_deliverables`.
- `src/lib/arvore-cliente-projecao.ts` projeta **pessoas**, não achados — usa um campo homônimo
  `client_projection_status`, mas em outra entidade (pessoa da árvore, não `genealogical_findings`).
  Mesmo nome, dois conceitos diferentes — o mesmo padrão de colisão de nome já registrado no PR #84
  para `portal-elegibilidade.ts` × `radar-elegibilidade.ts`.
- `src/lib/portal-dados-vivos.ts` é explícito: `BLOQUEIOS_CA_PORTAL_02` (linhas 31-54) declara que a
  tela "Entregas da Jornada" (fonte `public.client_deliverables`) está **bloqueada** — "não existe
  policy de portal do cliente. Conteúdo permanece bloqueado" (linhas 33-37).
- O caminho que **de fato funciona** para algo chegar ao cliente é outro terceiro modelo:
  `app_projections` (tipo `"achado"` reconhecido em `projecoes-cliente.ts:34`), alimentado manualmente
  via `salvarProjecao`/`aprovarProjecao` (`biblioteca-evidencias.functions.ts:202-245`, a mesma tela
  "Biblioteca de evidências e projeções autorizadas" do PR #84) — mas essa tela projeta a partir de
  **evidência**, não de achado. Não há vínculo com `genealogical_findings` nesse caminho.
- Não existe campo "novo"/"não visto" do lado do cliente. `client_deliverables.viewed_at`
  (`fechamento-caso.functions.ts:185`) é métrica interna do Desk (funil de fechamento), e a tabela está
  bloqueada no portal — nunca vira badge no app.

### 5.1 — Consolidação de toda a varredura de micro-entrega: qual é a rota correta para o App Cliente

A Proprietária pediu para revisar todo o consolidado antes de qualquer implementação no App Cliente, para
não errar a rota. Reunindo esta seção com os achados de
`docs/auditorias/2026-09-04-consolidacao-12-documentos-drive-cadencia-d0-d365.md` (Parte 3) e do de-para
recuperado `docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md` (seção 1),
existem **cinco mecanismos reais ou propostos** de "micro-entrega" no repositório — não dois:

| # | Mecanismo | Tabela | Alcança o cliente hoje? | Por quê |
|---|---|---|---|---|
| 1 | Entrega cliente-facing (vocabulário unificado nesta sessão, seção 2.1 de `2026-09-04-consolidacao-...md`) | `client_deliverables` | **Não** | RLS só tem `is_org_member(organization_id)` (`portal-dados-vivos.ts:36`, `BLOQUEIOS_CA_PORTAL_02`) — **nenhuma policy de portal existe para esta tabela**. Não é falta de wiring de tela; é bloqueio estrutural no banco. `/portal/entregas` (`src/routes/portal/entregas.tsx`) nem tenta ler: é placeholder estático (seção 6 abaixo). |
| 2 | Projeção autorizada | `app_projections` (view `portal_projecoes`) | **Sim** | Única tabela com RLS de portal comprovada (`app_proj_select_portal`, restringe ao caso do próprio cliente) — é o que `projecoes-cliente.ts`/`publicacoesParaCliente` de fato usam. Mas o modelo é mais simples (`content_sanitized` + `projection_type` + vigência), sem os campos de micro-entrega (tipo, fase, evidência, próxima ação) e alimentado por evidência aprovada, não por achado nem por `client_deliverables`. |
| 3 | Tarefa operacional interna | `ops_microentregas` | Não, nem deveria | Painel Hoje/SLA — uso exclusivamente interno, tem `evidencia_url`/`concluida_em` que faltam no #1, mas não tem nenhum campo cliente-facing (`title_client`, `deep_link`). |
| 4 | `micro_deliveries` (proposta) | não existe | Não | Nunca implementada (`docs/evolucao/recuperados/prompts-lovable-2026-08-31/`); duplicaria o #1. |
| 5 | 7 estados únicos (régua F, seção 3 do Mapa de Cadências D0-D365) | nenhuma hoje | Não | Nenhuma das 4 tabelas acima tem os 7 estados (preparada/em revisão/publicada/visualizada/ação pendente/concluída/arquivada) — a mais próxima (#1) tem 5. |

**A rota correta, dado o que existe hoje, não é uma escolha livre — é uma restrição de RLS**: qualquer
implementação de App Cliente que tente ler `client_deliverables` diretamente devolve zero linhas para um
usuário que não seja da equipe, porque a policy não existe. Isso reduz a pergunta 1 da seção 9 a duas
opções concretas, não mais simétricas:

- **(a) Adicionar policy de portal a `client_deliverables`** — preserva o trabalho já feito
  (`salvarEntregaCliente`/`aprovarEntregaCliente`/`publicarEntregaCliente`/`listarEntregasPublicadas` em
  `onboarding-jornada.functions.ts`, e o vocabulário `client_deliverables.approval_status` já unificado
  em português nesta sessão) e o campo `deep_link` já modelado. Exige migration de RLS (mesmo padrão de
  `app_proj_select_portal`) e religar `/portal/entregas` para consultar a tabela real em vez do
  placeholder.
- **(b) Rotear pelo `app_projections`/`portal_projecoes`** — já funciona hoje, sem migration de RLS, mas
  exige mapear os campos de micro-entrega (tipo, fase, próxima ação) para dentro do modelo de projeção
  mais simples, ou aceitar perder esses campos na exibição ao cliente.

**Recomendação, sem decidir por conta própria**: (a) é o caminho mais coerente com o que já foi
construído (o motor de aprovação/publicação inteiro já grava e lê `client_deliverables`) — trocar de
tabela agora jogaria fora esse trabalho. Mas a decisão final, por mexer em RLS/segurança de dado do
cliente, é da Proprietária — ver pergunta 1 da seção 9, reformulada abaixo.

## 6. Jornada do cliente e micro-entregas — a rota real do portal é estática

A rota `src/routes/portal/entregas.tsx` **não lê dado nenhum**: é um placeholder que sempre mostra
"Nenhuma entrega publicada para consulta no momento." (linhas 22-38) — consistente com o bloqueio de
`client_deliverables` já confirmado na seção 5. Mesmo se o vínculo achado→entrega fosse costurado
manualmente hoje, a tela que deveria mostrar o resultado ao cliente não lê a tabela onde ele estaria.

## 7. Conclusão

**Correção após cruzar `G-06`/`CA-OPS-01`/`CA-OPS-02`**: o "ideal" da Proprietária não é literalmente
"achado dispara notificação automática ao cliente" — a arquitetura já decidida (G-06, 20/08) proíbe
isso de propósito ("nenhuma publicação, mensagem ou ação externa" a partir do módulo de achados). O
"alerta" que a arquitetura define é um sinal **interno**: equipe é avisada de que há achado/micro-entrega
pendente de revisão (`ale-achados`/`ale-microentregas`, ambos `CONECTADO`), e decide manualmente se e
como comunicar, com um template pronto para copiar — nunca envio automático.

Dentro dessa arquitetura correta, ainda faltam peças reais — não é tudo lista, mas também não é tudo
motor: falta o template específico de achado no catálogo de alertas, falta o botão funcional que a
própria arquitetura previu (`DescoberturasAlertas` está órfão), e o terceiro elo (achado visível no
App Cliente) segue genuinamente quebrado — nenhum caminho hoje leva de achado a algo visível no
App Cliente. Resumo por elo:

| Elo | Estado |
|---|---|
| Evidência → achado | Manual, sem gatilho (só uma sugestão textual em tela) — consistente com o desenho do G-06 |
| Achado → elegível para cliente | Checkbox manual; 2 dos 3 campos sem rotina de preenchimento |
| Achado → `client_deliverables` | Duas telas humanas desconectadas, sem vínculo automático nem campo de UI |
| Alerta à equipe (sinal interno) | **Existe e está conectado** (`ale-achados`/`ale-microentregas`) — mas sem template específico de achado, e o botão manual de "abrir preview e copiar" não está implementado em nenhuma tela |
| Alerta ao cliente (envio) | **Corretamente não-automático por desenho** — nunca deveria ser automático; a etapa manual prevista não tem hoje botão funcional |
| Achado → visível no App | Caminho real (`app_projections`) parte de evidência, não de achado; caminho "certo" (`client_deliverables`/`/portal/entregas`) está bloqueado por RLS e a rota é estática — este elo continua sendo o gap mais concreto |

## 8. Backlog P0/P1/P2

**P0**
1. **Decidir a via oficial de exposição de achado ao cliente**: dar policy de portal a
   `client_deliverables` e conectar `/portal/entregas` ao dado real, ou formalizar `app_projections`
   (já funcional) como o caminho único — hoje as duas coexistem, nenhuma decidida, e nenhuma parte de
   achado.
2. **Adicionar o template de "achado elegível" ao catálogo de alertas** (`MAPA_ALERTA_TEMPLATE`,
   `fiacao-cadencia-catalogo.ts`) e **conectar `DescoberturasAlertas`/`alertas-whatsapp.ts` a uma tela
   real** — a arquitetura já decidida (CA-OPS-02) prevê exatamente essa etapa manual
   (abrir preview, copiar, enviar fora do sistema); hoje ela não tem botão funcional em lugar nenhum,
   apesar de já estar corretamente desenhada como não-automática. O copy já existe, pronto para
   reaproveitar: `COM-PESQ-ACHADO-001`/`COM-PESQ-ACHADO-HIST-001` (seção 10.1).
3. Se o vínculo achado↔entrega continuar manual por decisão (não automatizar ainda), ao menos criar o
   campo de UI para `client_deliverable_id` em `achados.$caseId.tsx` — hoje o campo existe no schema e
   na validação, mas não tem onde ser preenchido.
4. **Criar a ação explícita de "autorizar alerta" em `achados.$caseId.tsx`**, distinta de salvar o
   achado — hoje o achado é salvo, mas não há um ato humano separado que o marque como "pronto para
   virar alerta" (item 4.2). Essa ação deveria alimentar o mesmo template que falta no item P0-2, e
   aparecer também na superfície de onboarding/`/ops`, não só em `/achados/$caseId`.
5. **Fechar o gap de backlog de WhatsApp**: hoje `message_template_usage` só registra que um template
   foi copiado (`copiado_para_envio_manual`), nunca o texto final enviado nem a resposta do cliente
   (item 4.2). Decidir e implementar um passo de "colar o que foi enviado / colar a resposta" — mesmo
   que manual — para que exista, por canal, o mesmo tipo de histórico que já existe para tickets do
   Portal (`portal_tickets`/`portal_ticket_messages`).

**P1**
4. Avaliar transformar `gatilhosDaEvidencia()` (já sugere "rascunho de microentrega" na tela quando a
   evidência é validada) num botão real de "criar achado a partir desta evidência", pré-preenchido —
   assistido, não necessariamente automático, reduzindo o trabalho manual do elo 1.

**P2**
6. Renomear ou documentar a colisão de nome `client_projection_status` (existe em `genealogical_findings`
   e, com sentido diferente, na entidade de pessoa usada por `arvore-cliente-projecao.ts`).

## 9. Perguntas de decisão que só a Proprietária pode responder

1. **Via de exposição ao cliente — reformulada com o achado de RLS da seção 5.1**: não é mais uma
   escolha simétrica entre duas tabelas prontas. `client_deliverables` (a mais coerente com o que já
   foi construído) exige criar policy de portal, hoje inexistente — sem isso ela devolve zero linhas
   para qualquer cliente. `app_projections` funciona hoje sem migration, mas com modelo mais pobre.
   Aprovar (a) adicionar RLS a `client_deliverables` e religar `/portal/entregas`, ou (b) aceitar rotear
   pelo `app_projections` e perder os campos de micro-entrega na exibição?
2. ~~Canal de alerta~~ — **já decidido pela arquitetura existente** (CA-OPS-01/02): WhatsApp via
   Biblioteca de Mensagens, sempre com abertura manual de preview e cópia — nunca envio automático.
   Não é mais pergunta em aberto; falta só a execução (backlog P0-2).
3. ~~Grau de automação~~ — **já decidido**: revisão humana explícita antes de cada envio, por desenho
   (G-06 + CA-OPS-01), não uma lacuna a preencher.

## 10. Material recuperado (`docs/evolucao/recuperados/`) — o de-para de mensagens e o mapa de cadências já têm resposta escrita para achado, mas nunca foram implementados

A Proprietária apontou para continuar a varredura no material de onboarding/micro-entregas em busca do
"mapa dos alertas" e de automações. Dois documentos recuperados de prompts anteriores (pasta
`docs/evolucao/recuperados/prompts-lovable-2026-08-31/`, datados de 31/08 — depois de CA-OPS-02, de
23/08) têm exatamente o conteúdo que faltava, mas **nenhuma linha deles existe em código hoje**
(confirmado por busca exaustiva de cada código citado abaixo em `src/` e `supabase/migrations/`: zero
resultados).

### 10.1 — `CA_COMUNICACAO_DE_PARA_MICROENTREGAS_APP_COPY_CTA.md`: o template de achado já foi escrito

A "Parte III — De-para: micro-entrega × mensagem × app copy × CTA" desse documento já resolve, com copy
pronta, exatamente o gap registrado no backlog P0-2 (falta o template de achado no catálogo de
alertas):

| Evento | Código | Canal | Copy no app | CTA na mensagem |
|---|---|---|---|---|
| Certidão localizada | `COM-PESQ-ACHADO-001` | App imediato + WhatsApp opcional | "Encontramos um novo registro da sua história." | "Encontramos uma certidão/registro importante e já estamos avaliando os próximos passos." |
| Achado histórico relevante | `COM-PESQ-ACHADO-HIST-001` | Portal + WhatsApp de celebração opcional | "Uma nova peça da sua história foi encontrada." | "Encontramos um registro que ajuda a contar mais um capítulo da sua família." |

Isso não substitui a decisão já tomada (seção 4.1: alerta é sinal interno, nunca envio automático) —
complementa exatamente o pedaço que faltava: o **conteúdo** do template que a equipe abriria/copiaria
manualmente. Hoje `MAPA_ALERTA_TEMPLATE` (`fiacao-cadencia-catalogo.ts`) não tem nenhum dos dois
códigos; a Biblioteca de Mensagens não foi conferida nesta rodada para saber se algum template
equivalente já existe lá com outro código (fica como verificação pendente, não como gap confirmado).

### 10.2 — `PROMPT_MOTORES_UNIFICADOS_CRM_VIVO_ONBOARDING_CADENCIAS_INDICADORES.md`: mapa de cadências e resposta à pergunta sobre a aba "Cliente" do Caso 360

Este documento (seção 6, "Caso 360: única mesa de trabalho") lista as abas obrigatórias do Caso 360:
"Visão geral, Discovery e diagnóstico, Jornada e Planejador, Onboarding e cadências, Documentos,
Pesquisa, Propostas, Contratos, Financeiro, Atualizações e comunicação, Produtos/SKUs, **Visão do
cliente**" — e um botão de cabeçalho "Abrir visão do cliente". Isso responde, com evidência de material
já decidido, a pergunta da Proprietária sobre por que o Caso 360 de Ana não tem uma aba "Cliente"
isolada: **deveria ter uma "Visão do cliente"**, e a implementação real (`SECOES` em
`casos.$caseId.index.tsx:274-281` — Indicadores/Jurídico/Técnico e riscos/Pessoa e família/Jornada/
Registro de alterações) não tem nenhuma aba equivalente. Registro formal do achado, como devido.

A seção 8 do mesmo documento ("Cadências unificadas") lista um catálogo de eventos canônicos
(`lead_created`, `proposal_sent`, `contract_signed`, `document_received`, **`research_finding_created`**,
`milestone_completed`, etc.) e cadências (`CAD-LEAD-PRIMEIRO-CONTATO`, `CAD-ONBOARDING`,
`CAD-DOCUMENTO-PENDENTE`...) com regra de parada por evento — e a seção 9 define uma tabela
`micro_deliveries` (com `visible_to_client`, `related_product_sku_id`, `source_type`/`source_id`) como a
peça central de micro-entrega. **Nenhuma dessas duas coisas existe em código**: nenhum evento `CAD-*`,
nenhuma tabela `micro_deliveries` — o que existe de fato é outro desenho, com outro nome
(`client_deliverables`, `ale-achados`/`ale-microentregas` em `AUDITORIA_MODULOS_ALERTA`), construído
depois (CA-OPS-01/02, 20-23/08) e parcialmente implementado. Os dois documentos não são a mesma decisão
com nomes diferentes — são duas propostas de arquitetura para o mesmo problema, uma nunca chegou a ser
código, a outra chegou parcialmente. Isso não é uma correção do que já foi registrado nesta auditoria
(a leitura de que `ale-achados`/CA-OPS-02 é a arquitetura real e vigente continua de pé) — é a
confirmação de que existe também um plano mais antigo, mais amplo e mais ambicioso, nunca executado, que
a Proprietária pode querer resgatar ou descartar explicitamente.

## 11. O que este documento NÃO decide

- **Não decide** qual tabela (`client_deliverables` ou `app_projections`) é a via canônica de entrega
  ao cliente.
- **Não decide** nem implementa nenhum canal de alerta.
- **Não decide** se o material recuperado da seção 10 (`COM-*`, `CAD-*`, `micro_deliveries`, aba "Visão
  do cliente") deve ser resgatado, adaptado ou descartado — só confirma que existe e nunca foi
  implementado.
- **Não altera nenhuma linha de banco, nenhum arquivo de código, nenhuma migration.**
