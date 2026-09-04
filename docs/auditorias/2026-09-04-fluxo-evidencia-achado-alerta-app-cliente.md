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

O "ideal" descrito pela Proprietária — evidência → achado → alerta → app — não existe ponta a ponta em
nenhum trecho. Cada elo é uma peça isolada e manual, e o elo de notificação simplesmente não está
implementado (nem automático, nem manual funcional). Resumo por elo:

| Elo | Estado |
|---|---|
| Evidência → achado | Manual, sem gatilho (só uma sugestão textual em tela) |
| Achado → elegível para cliente | Checkbox manual; 2 dos 3 campos sem rotina de preenchimento |
| Achado → `client_deliverables` | Duas telas humanas desconectadas, sem vínculo automático nem campo de UI |
| Alerta ao cliente | **Não existe** — protótipo de template WhatsApp nunca enviado, componente órfão não importado |
| Achado → visível no App | Caminho real (`app_projections`) parte de evidência, não de achado; caminho "certo" (`client_deliverables`/`/portal/entregas`) está bloqueado por RLS e a rota é estática |

## 8. Backlog P0/P1/P2

**P0**
1. **Decidir a via oficial de exposição de achado ao cliente**: dar policy de portal a
   `client_deliverables` e conectar `/portal/entregas` ao dado real, ou formalizar `app_projections`
   (já funcional) como o caminho único — hoje as duas coexistem, nenhuma decidida, e nenhuma parte de
   achado.
2. **Decidir o canal de alerta ao cliente** (e-mail, WhatsApp retomando `alertas-whatsapp.ts`, ou
   notificação dentro do próprio app) — nenhum existe hoje, nem manual funcional.
3. Se o vínculo achado↔entrega continuar manual por decisão (não automatizar ainda), ao menos criar o
   campo de UI para `client_deliverable_id` em `achados.$caseId.tsx` — hoje o campo existe no schema e
   na validação, mas não tem onde ser preenchido.

**P1**
4. Avaliar transformar `gatilhosDaEvidencia()` (já sugere "rascunho de microentrega" na tela quando a
   evidência é validada) num botão real de "criar achado a partir desta evidência", pré-preenchido —
   assistido, não necessariamente automático, reduzindo o trabalho manual do elo 1.
5. Conectar `DescoberturasAlertas`/`alertas-whatsapp.ts` a uma tela real (hoje órfãos) ou arquivá-los
   como protótipo descontinuado, para não confundir leitura futura do código.

**P2**
6. Renomear ou documentar a colisão de nome `client_projection_status` (existe em `genealogical_findings`
   e, com sentido diferente, na entidade de pessoa usada por `arvore-cliente-projecao.ts`).

## 9. Perguntas de decisão que só a Proprietária pode responder

1. **Via de exposição ao cliente**: `client_deliverables`/`/portal/entregas` (hoje bloqueada e
   desconectada) ou `app_projections` (hoje funcional, mas alimentada por evidência, não por achado)?
2. **Canal de alerta**: e-mail, WhatsApp, notificação no app, ou combinação? Nenhum está implementado.
3. **Grau de automação desejado**: o vínculo achado→entrega e o próprio alerta devem nascer automáticos
   quando um achado é marcado elegível, ou a equipe quer manter uma etapa de revisão humana explícita
   antes de cada envio ao cliente (padrão já usado em `communication_queue` para outras comunicações)?

## 10. O que este documento NÃO decide

- **Não decide** qual tabela (`client_deliverables` ou `app_projections`) é a via canônica de entrega
  ao cliente.
- **Não decide** nem implementa nenhum canal de alerta.
- **Não altera nenhuma linha de banco, nenhum arquivo de código, nenhuma migration.**
