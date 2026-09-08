---
titulo: P0 — Contrato da Ana e pré-go-live do App Cliente
data: 2026-09-08
branch: claude/planejador-proposta-condicao-2026-09-08
---

## 0. Identificação do caso (sem ambiguidade)

Confirmado por SQL, único resultado: `crm_casos.id = a11a0000-0000-4000-8000-000000000002`, código
`CA-CID-AT-FAM-2026-001`, título "Projeto familiar — Ana Luiza", `cliente_id = a11a0000-0000-4000-8000-000000000001`,
`demo = false`. Nenhum outro caso corresponde ao nome ou código. Sem ambiguidade — segue como o caso-piloto.

## 1. Cabeçalho de evidência

- Branch de trabalho: `claude/planejador-proposta-condicao-2026-09-08` (a mesma indicada no prompt — não criei
  branch nova porque o P0-A pede explicitamente verificar comportamento "após o patch" nela).
- HEAD inicial e final: `e5d3e25` (sem novo commit de código — ver seção 9 sobre por quê).
- `main` na abertura: `5a7148c` (confirmado, sem mudança).
- Nenhum merge, nenhuma PR, nenhum deploy, nenhuma migration aplicada, nenhuma ação externa.
- Todas as consultas ao Supabase (projeto `zsxpdbhdvbuulwpepemd`) foram só leitura.

## 2. P0-A — Contrato da Ana: estado real, campo a campo

| Item | Estado real (SQL, 08/09) |
|---|---|
| Proposta | v1, `status=aprovada`, `origem=canva`, `origem_referencia=DECK-CANVA-CA-CID-AT-FAM-2026-001-v1`, não arquivada, não substituída |
| Páginas Canva | 7/7 com `extracao_status=extraida`, conteúdo estruturado presente em todas |
| Template contratual | `MODELO-ESTUDO` (v1) e `BASE-GEN-V2` (v2), ambos `status=active` |
| Ficha (`contract_case_parameters`) | 1 registro, vinculado à proposta e ao template corretos |
| Contrato (`contracts`) | 1 registro, `status=ready_for_review`, `signed_at=null` |
| Campos obrigatórios (30 no total) | 28 `validado`, 1 vazio (`ancestral_referencia`), 1 `importado_a_confirmar` (`escopo_resumo`) |
| Placeholders remanescentes | 0 |
| Conflitos de origem | 0 |
| Signatários (grupo "partes", obrigatórios) | todos `validado` — sem bloqueio |
| Prévia final aprovada | não existe ainda (só rascunho `estado=rascunho_editavel`) — bloqueio **não impeditivo**, é o passo seguinte às duas ações humanas, não uma pendência oculta |
| Conflito país/rota | nenhum — código `AT` (Áustria) e `pais=Áustria` coerentes |
| Gate de escopo Canva (o bug corrigido ontem em `bloqueios-dicionario.ts`) | **não se aplica a este caso** — a proposta da Ana já satisfaz `validarPropostaCanva` integralmente (origem, referência e 7 páginas OK), então esse bloqueio nunca disparava para ela. O fix de ontem corrige a mensagem/navegação para *outros* casos que não tenham Canva completo — não é o que trava a Ana. |
| Fonte do Planejador (patch da branch atual) | **não se aplica a este caso**: a proposta v1 da Ana tem `plan_id = null` — ela nunca foi gerada por `materializarProposta()`/`blueprint_parameters`/`case_plans`. É uma proposta aprovada diretamente pelo fluxo Canva, anterior e independente da cadeia operacional nova. O patch de ontem é real e corrige o comportamento futuro daquele pipeline, mas não altera nada do que já existe para a Ana hoje. |

**Achado de risco (não corrigido, só registrado — decisão sua, não uma ação minha):** se algum dia alguém acionar
`materializarProposta()` (o pipeline novo) para o caso da Ana, o código atual criaria uma **v2** da proposta e
marcaria a v1 aprovada como substituída — porque a v1 está `status=aprovada`, não `rascunho`. Isso substituiria
silenciosamente a proposta Canva real por uma gerada a partir de um Planejador vazio (nem `case_plans` nem
`blueprint_parameters` têm dado utilizável para o caso dela hoje). Não toquei nesse comportamento nesta rodada
por ser fora do escopo do P0 e por exigir decisão sua sobre qual pipeline é definitivo para casos já em Canva.
Registro para você não ser pega de surpresa se outra ação/rodada futura chamar essa função "para sincronizar".

**Confirmação das duas pendências humanas** (única fonte real de bloqueio impeditivo hoje):
1. `ancestral_referencia` ("Ancestral de referência declarado") — vazio, obrigatório.
2. `escopo_resumo` ("Resumo do escopo aprovado") — tem valor importado, status `importado_a_confirmar`, exige
   clique humano em "Confirmar" (proteção de revisão — não removida, não deve ser removida).

Não existem pendências ocultas, estados inválidos ou falhas de persistência adicionais.

### Validação de UI

**Sem navegador autenticado disponível nesta sessão** (mesma limitação de sandbox já registrada em rodadas
anteriores: o classificador de modo automático bloqueia login com senha mesmo para contas de teste próprias).
Não simulei sucesso. Por isso, apesar de toda a evidência de código e banco apontar para as duas pendências
como únicos bloqueios reais, a classificação correta — pela própria régua deste prompt — é
`IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE`, não `PRONTO_PARA_ACAO_HUMANA`.

**Roteiro para você validar em produção (máximo 8 passos):**

1. Abra `/casos/CA-CID-AT-FAM-2026-001/contrato/preparar`.
2. Confirme que a tela carrega sem erro e mostra a proposta v1 aprovada com as 7 páginas do Canva.
3. Role até o grupo "Membros" e localize o campo "Ancestral de referência declarado" — deve estar vazio, com
   asterisco de obrigatório.
4. Role até o grupo "Objeto" e localize "Resumo do escopo aprovado" — deve mostrar o texto já importado com o
   selo "Importado — a confirmar" e um botão "Confirmar".
5. Preencha o campo do passo 3 com o dado real e clique em "Salvar".
6. Clique em "Confirmar" no campo do passo 4.
7. Recarregue a página inteira (F5) e confirme que os dois campos agora aparecem como "Validado".
8. Confira o painel "Bloqueios acionáveis": deve mostrar só o item não impeditivo "Revisão humana da versão
   final pendente" (esperado — é o próximo passo, gerar e aprovar a versão final antes do envio para assinatura).

### Classificação P0-A

**`IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE`.** Todos os critérios de código/banco do critério de aceite são
verdadeiros; falta só a prova de UI + reload, que só você pode fazer (ou autorizar acesso de navegador para
esta sessão).

## 3. P0-B — Matriz real de gates do App Cliente

| Gate | Campo/tabela | Escritor real | Estado da Ana | Ação necessária | Classificação |
|---|---|---|---|---|---|
| Contrato assinado | `crm_casos.contrato_assinado` | `contrato-parametros.functions.ts:1460`, ao registrar assinatura | `false` | Concluir as 2 pendências humanas → gerar versão final → assinatura | `IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE` |
| Pagamento confirmado | `crm_casos.pagamento_confirmado` | `comercial.functions.ts:634`, ao conciliar fatura | `false` | Fatura emitida e conciliada após assinatura | `IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE` |
| Caso ativado | `crm_casos.ativado_em` | `onboarding.functions.ts` → `ativarCasoComChecks` (rota `/onboarding/$id`), exige 14 requisitos obrigatórios validados | `null`; `onboarding_iniciado_em` também `null` | Rodar a ativação assistida em `/onboarding/CA-CID-AT-FAM-2026-001` depois da assinatura | `IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE` |
| Documentos mínimos | `crm_casos.documentos_minimos_ok` | `portal-atendimento.functions.ts` → `confirmarDocumentosMinimos`, botão real em `atendimento-interno.tsx` ("Confirmar documentos mínimos deste caso"), admin/operações, com auditoria | `false` | Ação admin explícita — **mas sem checklist canônico por trás, ver seção 4** | `PENDENTE_DE_DEFINICAO_CANONICA` |
| Usuário/convite do portal | `client_portal_access` + `client_portal_case_access` | `portal.functions.ts` → `criarConvitePortal`, exige `authorized_portal_emails.status=aprovado` | Nenhuma linha para a Ana em nenhuma das três tabelas — estado limpo, nada pendente de convite anterior | Aguarda P0-C | `PENDENTE_DE_AUTORIZACAO_DA_PROPRIETARIA` |
| Vínculo cliente ↔ caso | `crm_casos.cliente_id` | já existente | `cliente_id` preenchido corretamente | nenhuma | `ACEITO_COM_EVIDENCIA_UI` (SQL direto) |
| Conteúdo visível no App | `app_projections` (destination=app, approval_status=published) via policy `app_proj_select_portal` | ação de publicação em `atendimento-interno.tsx` → `publicarProjecaoApp` | Nenhuma projeção publicada ainda para o caso (não verificado necessário até o caso estar ativo) | Publicar após ativação, quando houver conteúdo real aprovado | `NAO_IMPLEMENTADO` (nada publicado ainda — correto para o estágio atual) |
| Isolamento Ana × Cliente B | RLS: função `portal_caso_permitido()` (SECURITY DEFINER, chave por `auth.uid()`) usada nas policies `documents_sel_portal`, `invoices_sel_portal` e na view `portal_casos`; exige `client_id = portal_meu_cliente()` em paralelo | Migrations de RLS existentes, não desta rodada | Verificado por leitura de `pg_policies`/definição da função — dupla checagem (case + client) em toda superfície revisada | Nenhuma — arquitetura correta | `IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE` (sem teste negativo ao vivo com dois usuários) |

## 4. Documentos mínimos — investigação dedicada (P0 crítico do prompt)

A premissa do prompt ("essa coluna não possuía escritor/UI comprovado") está **desatualizada**: em 05/09/2026
uma rodada anterior já fechou essa lacuna. Hoje existe:
- Escritor real: `confirmarDocumentosMinimos` (`portal-atendimento.functions.ts`), restrito a papéis
  admin/operações (`PAPEIS_ENTREGA`), com auditoria (`documentos_minimos_confirmados`, autor, data, motivo).
- UI real: botão "Confirmar documentos mínimos deste caso" em `atendimento-interno.tsx`, visível só quando
  `documentos_minimos_ok !== true`.

**O que continua sem definição canônica:** a ação é uma **atestação binária** — não existe, em nenhum lugar do
código, uma lista fechada de quais documentos compõem "mínimos" nem uma checagem automática contra essa lista.
Busquei em `docs/` e no código por uma definição fechada (`checklist_aplicavel`, políticas de documentos) e não
encontrei uma lista canônica ligada especificamente a este gate. Por isso, sigo a instrução do prompt: não
inventei uma lista, não gravei nada, e elevo a decisão a você — a pergunta específica está na seção 7.

## 5. Convite e login — auditoria sem envio

- Fluxo real localizado: `portal.functions.ts` → `criarConvitePortal`. Exige, nesta ordem: e-mail em
  `authorized_portal_emails` com `status=aprovado` e `nivel_pretendido` correspondente; para nível
  `client_workspace`, exige também `contrato_assinado`, `pagamento_confirmado`, `documentos_minimos_ok` todos
  `true` e (`ativado_em` OU `onboarding_iniciado_em`) preenchido — revalidado no servidor, não confia no payload
  do cliente.
- **A ação é real e externa**: ao criar o convite, o código chama `helpers.enviarLinkMagico(email, ...)` — isto
  envia um e-mail de verdade com link de acesso. Não é "gera só um link para eu copiar": é envio automático.
  Por isso não cheguei perto de executar esta função nesta rodada.
- Vínculo do convite: por `authorized_portal_emails.id` (não por nome) — `client_id`/`case_id` são validados
  contra o registro de autorização, sem comparação frouxa de nome.
- Estado atual da Ana: **zero linhas** em `authorized_portal_emails`, `client_portal_access` e
  `client_portal_case_access` — nenhum convite pendente, nenhum resíduo de teste, estado limpo.
- Login/primeiro acesso: `confirmarAcessoPortal` consome o link mágico (uso único, expira em 24h para convite,
  20 min para reenvio de login) e ativa o acesso.
- Ambiente de homologação: existe um login de teste criado em rodada anterior (Cliente A de homologação, não a
  Ana), mas ele não substitui o teste real da Ana — usá-lo aqui misturaria evidência de conta de teste com
  evidência do caso real, o que o prompt pede para evitar.

## 6. Isolamento Ana × Cliente B

Verificado por leitura de schema (não por navegação, sem navegador autenticado disponível):
- `portal_caso_permitido(_case)`: função `SECURITY DEFINER`, chave por `auth.uid()`, exige o vínculo ativo em
  `client_portal_access`/`client_portal_case_access`, organização batendo, `client_id` do caso batendo com o do
  acesso, `app_access_status='liberado'`, `app_visibility_level` em `('workspace','completo')`,
  `consentimento_compartilhamento=true`, `info_cliente_liberada=true`.
- `documents_sel_portal` e `invoices_sel_portal`: além de `portal_caso_permitido(case_id)`, exigem também
  `client_id = portal_meu_cliente()` — dupla trava (caso E cliente), não uma só.
- `client_deliverables`: **confirmado (achado já registrado em rodada anterior desta sessão) que não tem
  nenhuma policy `_sel_portal`** — não é lido diretamente pelo portal; o conteúdo cliente-facing de entregas
  passa por `app_projections` (que tem sua própria policy `app_proj_select_portal`, também usando
  `portal_caso_permitido`). Isso é desenho correto, não uma lacuna: `client_deliverables` é puramente interno.
- Nenhuma dessas policies aceita `client_id`/`case_id` vindo de fora sem revalidação — todas amarram em
  `auth.uid()` no banco, não no payload do cliente.

Não fiz prova negativa ao vivo (Cliente B tentando abrir dado da Ana) por falta de navegador autenticado e por
não haver hoje um "Cliente B" de homologação criado e autorizado. Classificação:
`IMPLEMENTADO_COM_VALIDACAO_UI_PENDENTE`.

## 7. Evidências técnicas

```text
tsc --noEmit: limpo (sem mudança de código nesta rodada, mesmo estado da branch e5d3e25)
vitest run --exclude '**/.claude/**': 176 arquivos, 1682 testes, 100% passando (mesmo estado — nenhum código novo)
vite build: não re-executado nesta rodada (sem mudança de código desde o último build limpo, commit e5d3e25)
```

Nenhum teste novo foi criado nesta rodada porque **não corrigi nenhum bug de código** — o P0-A e P0-B desta
rodada foram diagnóstico e auditoria, não correção. O único achado corrigível continua sendo o que a rodada
anterior já corrigiu (branch atual). Isso é deliberado: o prompt pede para só corrigir "um bug comprovado que
impede a tela de contrato ou a auditoria de elegibilidade" — não encontrei um bug assim nesta rodada; encontrei
uma decisão pendente (documentos mínimos) e um risco registrado (materializarProposta sobre proposta aprovada),
nenhum dos dois é um bug a corrigir sem decisão sua primeiro.

## 8. Migrations e ações externas

- Migrations propostas ou aplicadas: **nenhuma**.
- Ações externas executadas: **nenhuma**. Nenhum e-mail, convite, link, WhatsApp, cobrança ou alteração de dado
  real foi enviado, criado ou modificado.

## 9. Por que não há commit novo de código nesta rodada

O P0-A e P0-B, conduzidos com rigor, não revelaram um bug de código a corrigir — revelaram que os dois
bloqueios da Ana são humanos e intencionais (confirmado, não contestado) e que os gates do portal têm escritor
real para os quatro campos (contradizendo a premissa desatualizada do prompt sobre documentos mínimos, que já
tinha sido corrigida em 05/09). A única decisão em aberto (lista canônica de documentos mínimos) não é algo que
eu deva resolver por inferência. Por isso a branch permanece em `e5d3e25`, e este relatório é o produto desta
rodada.

## 10. Roteiro operacional para você (máximo 10 passos)

1. Em `/casos/CA-CID-AT-FAM-2026-001/contrato/preparar`, preencha "Ancestral de referência declarado" e salve.
2. Clique "Confirmar" no campo "Resumo do escopo aprovado".
3. Gere a versão final do contrato e aprove a revisão humana (painel "Prévias").
4. Envie para assinatura pelo canal já vigente (fora desta sessão — ação externa, não automatizada aqui).
5. Após assinatura registrada, confirme em `/casos/.../contrato/preparar` que `contrato_assinado` virou `true`.
6. Emita e concilie a fatura inicial pela tela financeira — isso deve marcar `pagamento_confirmado=true`.
7. Em `/onboarding/CA-CID-AT-FAM-2026-001`, rode a ativação assistida (14 requisitos) — isso grava `ativado_em`.
8. Decida a definição de "documentos mínimos" (ver pergunta na seção 11) e, quando atendida, use o botão
   "Confirmar documentos mínimos deste caso" em Atendimento.
9. Com os 4 gates verdadeiros, revise a elegibilidade em Atendimento → seletor de acesso, nível "Espaço do
   cliente" — a Ana deve aparecer como elegível.
10. Só então me avise para eu preparar a solicitação formal de autorização do convite (P0-C) — vou pedir sua
    aprovação explícita antes de qualquer envio real.

## 11. Pergunta única e objetiva para você (não misturo com outras)

**Qual é a lista mínima de documentos que precisa estar reunida antes de confirmar "documentos mínimos" para um
caso, e quem pode confirmá-la?** Hoje a ação existe (botão + auditoria), mas é uma atestação de confiança sem
checklist automático por trás. Não vou inventar essa lista. Se você me der os itens (ex.: certidão de
nascimento do requerente, documento de identidade, comprovante de residência — só um exemplo, não é a resposta),
posso avaliar se dá para transformar isso em checklist automático ligado ao botão, em vez de atestação livre.

## 12. Reversão

Nenhum código foi alterado nesta rodada — nada a reverter. Se quiser desfazer o patch da rodada anterior
(`58c3496`), `git revert 58c3496` na branch `claude/planejador-proposta-condicao-2026-09-08` continua válido e
sem risco de dado (nenhuma escrita em produção esteve envolvida nesse patch nem nesta rodada).
