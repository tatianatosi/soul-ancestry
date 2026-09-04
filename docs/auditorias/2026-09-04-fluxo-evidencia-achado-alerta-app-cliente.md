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
   apesar de já estar corretamente desenhada como não-automática.
3. Se o vínculo achado↔entrega continuar manual por decisão (não automatizar ainda), ao menos criar o
   campo de UI para `client_deliverable_id` em `achados.$caseId.tsx` — hoje o campo existe no schema e
   na validação, mas não tem onde ser preenchido.

**P1**
4. Avaliar transformar `gatilhosDaEvidencia()` (já sugere "rascunho de microentrega" na tela quando a
   evidência é validada) num botão real de "criar achado a partir desta evidência", pré-preenchido —
   assistido, não necessariamente automático, reduzindo o trabalho manual do elo 1.

**P2**
6. Renomear ou documentar a colisão de nome `client_projection_status` (existe em `genealogical_findings`
   e, com sentido diferente, na entidade de pessoa usada por `arvore-cliente-projecao.ts`).

## 9. Perguntas de decisão que só a Proprietária pode responder

1. **Via de exposição ao cliente**: `client_deliverables`/`/portal/entregas` (hoje bloqueada e
   desconectada) ou `app_projections` (hoje funcional, mas alimentada por evidência, não por achado)?
2. ~~Canal de alerta~~ — **já decidido pela arquitetura existente** (CA-OPS-01/02): WhatsApp via
   Biblioteca de Mensagens, sempre com abertura manual de preview e cópia — nunca envio automático.
   Não é mais pergunta em aberto; falta só a execução (backlog P0-2).
3. ~~Grau de automação~~ — **já decidido**: revisão humana explícita antes de cada envio, por desenho
   (G-06 + CA-OPS-01), não uma lacuna a preencher.

## 10. O que este documento NÃO decide

- **Não decide** qual tabela (`client_deliverables` ou `app_projections`) é a via canônica de entrega
  ao cliente.
- **Não decide** nem implementa nenhum canal de alerta.
- **Não altera nenhuma linha de banco, nenhum arquivo de código, nenhuma migration.**
