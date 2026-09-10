# Varredura e Go-Live Controlado do App Cliente — Fase 1 (leitura)

```yaml
status: em revisão
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: auditoria técnica/operacional — Fase 1 de 2 (varredura read-only)
responsável pela decisão: Proprietária Administradora do Clube Ancestral (Tatiana)
executor: Claude (sessão read-only, sem escrita em src/, sem execução externa)
base normativa: "Prompt Claude — Varredura e Go-Live Controlado do App Cliente" (upload de 2026-09-03)
fontes/evidências (paths exatos lidos nesta sessão):
  - src/routes/_authenticated/acessos-portal.tsx
  - src/routes/_authenticated/atendimento.tsx
  - src/routes/_authenticated/app-cliente-como-pessoa.tsx
  - src/routes/_authenticated/app-cliente-demo.tsx
  - src/routes/portal/route.tsx, index.tsx, jornada.tsx, radar.tsx, arvore.tsx,
    documentos.tsx, entregas.tsx, fase-01.tsx, fase-02.tsx, proposta.tsx,
    conta.tsx, legado.tsx, faturas.tsx, mensagens.$id.tsx, casos.$id.tsx
  - src/components/portal/portal-shell.tsx, fonte-portal.tsx, portal-visibilidade.tsx,
    caso-detalhe.tsx, atendimento-interno.tsx
  - src/lib/app-visibilidade.ts, visibilidade.ts, portal-jornada.functions.ts,
    portal.functions.ts, portal-cliente.functions.ts, app-cliente-como-pessoa.functions.ts,
    classificacao-dados.ts, navegacao-desk.ts (GRUPOS_DESK, LACUNAS_CONHECIDAS),
    piloto-ana.ts
  - src/lib/__tests__/superficie-interna-regras.test.ts,
    src/lib/__tests__/app-cliente-como-pessoa.test.ts,
    src/lib/__tests__/fontes-documentos-rls.test.ts
  - supabase/migrations/20260816152446_d0ffdd66-abe6-405a-92a7-d79b1bdc0abf.sql
    (client_portal_access, client_portal_case_access, client_access_events,
    portal_caso_permitido, RLS de portal)
  - supabase/migrations/20260816212117_5d18eed0-0eeb-4a70-94d6-e30cf94bc0e5.sql
    (documents_sel_portal, invoices_sel_portal)
  - docs/portal/CA-PORTAL-02_Dados_Vivos_e_Isolamento.md e
    docs/portal/CA-PORTAL-02_Matriz_RLS_Por_Tela.csv (auditoria anterior, reutilizada
    como evidência já verificada — não refeita do zero)
  - docs/auditorias/MATRIZ-RECONCILIACAO-ANA-LUIZA-2026-08-30.md (estado do case_id
    canônico de Ana: CA-CID-AT-FAM-2026-001)
  - docs/arquitetura/2026-09-03_DE-PARA-MOTORES-UNIFICADOS-CRM-VIVO.md (referência de
    tom/rigor; lido via `git show` do branch onde foi commitado, pois este worktree
    está em cima de origin/main e o arquivo não está nesse branch)
escopo: leitura de código e schema; nenhuma escrita em src/, nenhuma migração, nenhum
  convite/e-mail/WhatsApp/cobrança/assinatura disparado, nenhum dado real alterado
premissas:
  - "Autenticar não é autorizar" — todo dado do portal depende de client_portal_access +
    client_portal_case_access ativos + RLS, não de rota alcançável
  - rota existir não é prova de que a área está pronta ou deve ser mostrada
  - tela sem conteúdo publicado nunca é marcada como pronta/usada/entregue
  - nenhuma publicação de portal é automática — exige ação humana rastreável
  - Faturas não faz parte do pacote/navegação entregue de Ana
  - não se inventa modelo de caso/pessoa/produto/SKU novo — reaproveita-se o core existente
limites desta entrega:
  - sem credencial Supabase MCP ativa nesta sessão (servidor "supabase" pede autorização
    fora deste ambiente não-interativo) — nenhuma linha real foi consultada ao vivo;
    tudo abaixo é auditoria de código/schema declarado nas migrations, na mesma limitação
    já registrada em MATRIZ-RECONCILIACAO-ANA-LUIZA-2026-08-30.md
  - a conta qa-tela-a-tela@clubeancestral.test citada no prompt não aparece em nenhum
    arquivo do repositório (é dado, não código) — não foi possível confirmar aqui se ela
    tem papel de staff; só é verificável com acesso vivo ao Supabase
  - nenhuma ação de PR, branch, commit ou migração foi executada por este documento
  - esta é a Fase 1 (varredura). Nenhuma especificação de implementação é proposta aqui —
    apenas os achados e a ordem sugerida de PRs pequenos, para revisão da proprietária
    antes da Fase 2
```

## 1. Resumo objetivo — o que existe

O App Cliente e a aba "Cliente" do Desk **existem, têm profundidade real e não são
protótipo**. Isso é o achado mais importante desta varredura: a maior parte da
infraestrutura de segurança, convite e visibilidade que o prompt pedia para verificar
já está construída e testada — o trabalho pendente é principalmente **conteúdo,
navegação e amarração dos poucos módulos ainda vazios**, não arquitetura.

- **Aba Cliente no Desk** (`src/lib/navegacao-desk.ts`, grupo `id: "cliente"`, base
  `/acessos-portal`) tem 4 sub-rotas reais: `/acessos-portal` (convites, e-mails
  autorizados, casos autorizados, histórico de eventos), `/atendimento` (solicitações
  de documento, envios do cliente, liberação de entregas/faturas, tickets),
  `/app-cliente-demo` (prévia com caso fictício Sophia) e `/app-cliente-como-pessoa`
  (prévia com **dado real** de um caso, PR #66, ainda não mergeada nesta branch).
- **Portal do cliente** (`src/routes/portal/`) tem 14 rotas reais montadas sob
  `/portal` (`route.tsx` exige sessão Supabase válida — "autenticar não é autorizar"
  está literalmente no comentário do arquivo). De 10 telas do spec CA-UX-01.2
  (`TelaApp` em `app-visibilidade.ts`), **3 renderizam dado vivo sanitizado**
  (Jornada, Radar, Árvore, via `portal_projecoes`/`documents` + `*Sanitizada()`),
  **1 é totalmente funcional com CRUD real** (Documentos — download de entregas
  liberadas e envio pelo cliente), **1 é funcional mas fora do pacote de Ana**
  (Faturas, lendo `invoices` com RLS própria), e **3 são placeholders de estado**
  que nunca renderizam conteúdo mesmo quando "liberadas" (Entregas, Fase 01, Fase 02
  — ver seção 3).
- **Segurança de acesso** é a parte mais madura: link mágico de uso único (24h,
  reenvio reabre janela de 20 min), taxa de emissão limitada por e-mail e por
  IP/origem, resposta sempre genérica (anti-enumeração), RLS de banco real (não só
  checagem em React) via `portal_caso_permitido()` — função `SECURITY DEFINER` que
  exige vínculo ativo em `client_portal_access` **e** `client_portal_case_access`,
  caso não arquivado, `app_access_status='liberado'`, `app_visibility_level` em
  `workspace`/`completo` e `consentimento_compartilhamento=true` — e trilha de
  eventos (`client_access_events`) que nunca é apagada (trigger `fn_block_delete`).
- **Ver como cliente / admin preview** (decisão canônica 3a) existe e é real:
  `/app-cliente-como-pessoa` lê `portal_projecoes.content_sanitized` — a mesma
  projeção que o cliente veria — autorizada só para `ehProprietariaAdministradora(papel)`,
  nunca para o cliente e nunca dado bruto do Desk. Mas **cobre só 3 das 10 telas**
  (Jornada, Árvore, Radar): o próprio arquivo documenta isso em comentário — as
  outras 7 (Documentos, Entregas, Fase 01/02, Legado, Conta, Faturas) "só exportam
  `Route`, precisam do mesmo tratamento antes de entrar aqui".
- **QA externo com conta sem papel de staff** (decisão canônica 3b) — o mecanismo
  para isso (link mágico + RLS) existe e é o mesmo caminho de qualquer cliente real,
  mas **não há evidência no código de uma conta de teste dedicada e sem papel de
  staff já usada para provar isolamento entre dois titulares reais**. O próprio
  `CA-PORTAL-02_Dados_Vivos_e_Isolamento.md` (auditoria anterior, 2026-08-2x/09-0x)
  já registra isso textualmente: *"Não há duas contas de cliente autorizadas
  disponíveis nesta sessão: o isolamento entre dois titulares reais **NÃO COMPROVADO
  NO DOMÍNIO PUBLICADO**."*

## 2. Matriz — prometido / existe vivo / existe parcial / mock-demo / bloqueado / não existe

| Item | Estado | Evidência |
|---|---|---|
| Convite por link mágico (24h, uso único) | **existe vivo** | `src/lib/portal.functions.ts:9-80` (`solicitarLinkAcesso`), `:419` (`criarConvitePortal`) |
| Rate limit de emissão de link (e-mail/IP) | **existe vivo** | `portal.functions.ts:29-33` (`limiteExcedido("portal_magic_link_email", …)`) |
| RLS de `client_portal_access`/`client_portal_case_access` | **existe vivo** | migration `20260816152446_…`, policies `cpa_*`/`cpca_*` |
| `portal_caso_permitido()` (gate de caso por caso) | **existe vivo** | mesma migration, função `SECURITY DEFINER` |
| Trilha de eventos de acesso (nunca apagada) | **existe vivo** | `client_access_events` + trigger `fn_block_delete`; UI em `acessos-portal.tsx:691-705` |
| Tela "Acessos ao portal" (Desk) — convites, e-mails, casos, histórico | **existe vivo** | `src/routes/_authenticated/acessos-portal.tsx` (716 linhas, sem mock) |
| Tela "Atendimento" (Desk) — solicitação de doc, liberar entrega/fatura, tickets | **existe vivo** | `src/routes/_authenticated/atendimento.tsx` + `src/components/portal/atendimento-interno.tsx` (`liberarEntregaCliente`, `liberarFaturaCliente`, `criarSolicitacaoDocumento`) |
| Portal › Documentos (download + envio) | **existe vivo** | `src/routes/portal/documentos.tsx` + `minhasEntregas`/`baixarEntrega`, RLS `documents_sel_portal` |
| Portal › Jornada / Radar / Árvore | **existe vivo, dado sanitizado** | `portal-dados-vivos.ts` (`jornadaSanitizada`, `radarSanitizado`, `arvoreSanitizada`) sobre `portal_projecoes` |
| Portal › Faturas | **existe vivo, mas fora do pacote de Ana** | `faturas.tsx` + `minhasFaturas` + RLS `invoices_sel_portal` — funcional, real, não deve ser mostrado a Ana |
| Portal › Proposta | **existe parcial** | `proposta.tsx` renderiza `portalProposta()`; só visível a quem ainda não é `client_workspace` (nav condicional) |
| Portal › Entregas da Jornada | **bloqueado (estado seguro)** | rota só renderiza `BlocoVisibilidade` com texto fixo "Nenhuma entrega publicada" — **nunca lista conteúdo real mesmo quando `released`**; gate lê `documents.liberado_cliente`, mas `client_deliverables` (a tabela usada pelo motor de onboarding real) **não tem policy de portal** — só `is_org_member` (confirmado em `CA-PORTAL-02_Matriz_RLS_Por_Tela.csv`) |
| Portal › Fase 01 | **bloqueado (estado seguro)** | mesmo padrão de placeholder; `escopoDoPortal()` deriva `fase1Status` só da existência de caso + `documents.liberado_cliente`, nunca lê contrato real |
| Portal › Fase 02 | **bloqueado por padrão, corretamente conservador** | `escopoDoPortal()` **hardcoda** `escopoIncluiFase2: false` / `fase2Status: "nao_aplicavel"` até existir "fonte viva homologada de escopo contratado" — comentário explícito no código; nenhuma Fase 02 pode abrir hoje para ninguém |
| Portal › Legado | **bloqueado (estado seguro)** | sem `released_to_client` com policy de portal (`CA-PORTAL-02`) |
| Portal › Conta | **existe vivo, mas com vazamento de navegação** | link fixo para `/portal/faturas` sempre visível, independente de pacote (ver seção 5) |
| Portal › Mensagens/Atendimento (`mensagens.$id`) | **existe vivo** | `meuTicket`/`responderTicketCliente`, thread real |
| "Ver como cliente" (`/app-cliente-como-pessoa`) | **existe parcial** | cobre 3/10 telas; PR #66 ainda não mergeada nesta branch (`origin/main` não a contém) |
| Sessão demo (`/app-cliente-demo`) | **existe vivo, dado fixture declarado** | `DADOS_DEMO_SOPHIA`, sem consulta real, mesmos componentes |
| QA externo (conta sem papel de staff, 2 titulares reais) | **não comprovado** | mecanismo existe (link mágico + RLS), mas nenhuma evidência de execução com 2 contas reais; auditoria anterior já registra isso como gap aberto |
| Isolamento cross-case comprovado ao vivo | **existe parcial** | comprovado por leitura *sem* sessão de cliente (`0 linhas`/`permission denied`); isolamento entre dois titulares *ambos autenticados* não testado |
| Telemetria de uso do portal (abertura/download) | **não existe** | `LACUNAS_CONHECIDAS` em `navegacao-desk.ts:452-462` declara isso textualmente: "Só é exibida quando houver evento canônico registrado" — não há tabela nem UI simulando dado |
| Pacote de Ana como registro explícito (quais telas ela deveria ver) | **não existe** | `piloto-ana.ts` só resolve `case_id` canônico; nenhuma menção a fatura/fase/entrega/pacote — o fechamento de Fase 02 hoje é genérico (vale para todo cliente), não uma decisão registrada especificamente para Ana |

## 3. De-para — aba Cliente (Desk) × superfícies do App Cliente

| Aba Cliente (Desk) | Rota | Superfície do portal que ela administra | Ação real disponível |
|---|---|---|---|
| Acessos ao portal e App Cliente | `/acessos-portal` | `client_portal_access`, `client_portal_case_access` — todo o portal | Registrar e-mail autorizado → validar (aprovar/recusar/revogar) → criar convite (link mágico) → suspender/reativar/revogar acesso → liberar/bloquear caso "no app" → ver histórico de eventos. **Não tem link direto para `/app-cliente-como-pessoa`** (gap de UX — ver P1) |
| Atendimento e solicitações de documentos | `/atendimento` | `/portal/documentos`, `/portal/mensagens/:id` | Criar solicitação de documento, revisar envio do cliente, responder ticket, mudar status |
| Publicação de entregas autorizadas (`/atendimento#publicacao`) | `/atendimento` | `/portal/entregas` (potencial — hoje sem tabela ligada), `/portal/faturas` | `liberarEntregaCliente`, `liberarFaturaCliente` — é aqui que a decisão canônica 9 ("nenhuma publicação é automática") é aplicada na prática |
| Sessão demo do App Cliente | `/app-cliente-demo` | Jornada/Árvore/Radar com fixture Sophia | Só demonstração; nenhuma leitura real |
| App Cliente como pessoa (dado real) | `/app-cliente-como-pessoa` | Jornada/Árvore/Radar com projeção real sanitizada de um caso escolhido | Somente leitura, exige papel de Proprietária Administradora; 3/10 telas |

**Gap de de-para identificado:** não existe hoje, em nenhuma das 4 sub-rotas do grupo
Cliente, um ponto único que mostre "isto é o que a Ana vê agora" cobrindo as 10
telas — a visão mais completa (`/acessos-portal`) administra acesso, não conteúdo; a
visão mais completa de conteúdo (`/app-cliente-como-pessoa`) cobre 3 telas.

## 4. Matriz de abertura/visibilidade — pacote de Ana

Baseado em `ESCOPO_ANA` (exemplo normativo já existente em `app-visibilidade.ts:187-194`,
**não é dado real de banco** — é o exemplo de referência do próprio spec CA-UX-01.2) e
no comportamento real de `visibilidadeTela()`/`escopoDoPortal()`/nav de
`portal-shell.tsx`:

| Tela | Estado hoje (código real) | Condição para abrir (canônica) | Observação |
|---|---|---|---|
| Home (`/portal`) | sempre na nav quando há acesso `client_workspace` | onboarding/acesso liberado | lista casos reais via `meusCasos` |
| Jornada | sempre na nav; conteúdo = publicações reais em `portal_projecoes` | idem | `jornadaSanitizada` já filtra por publicado |
| Radar | sempre na nav; eixos fixos, itens só aparecem se publicados | idem | "Estratégia" é sempre `in_preparation` por decisão de produto (nunca parecer jurídico) |
| Árvore | sempre na nav; vazio até haver publicação tipo `arvore` | idem | — |
| Documentos | sempre na nav; lista real de liberados + envios do cliente | por solicitação/permissão | única tela com fluxo de escrita do cliente (upload) |
| Legado | sempre na nav; **sempre vazio hoje** | fora do corte inicial (decisão canônica 6) | correto manter fora — mas está na nav sempre visível, não "ausente"; ver seção 5 |
| Conta | sempre na nav | sempre | tem o link para Faturas (ver seção 5) |
| Entregas da Jornada | só entra na nav quando `onboarding_iniciado_em` está preenchido no caso | só quando microentrega publicada de fato | hoje **nunca mostra conteúdo real** mesmo liberada — gap de dado (`client_deliverables` sem policy de portal) |
| Fase 01 | mesma condição de nav (`onboardingIniciado`) | milestone correto de onboarding/entrega | mesmo placeholder — sem conteúdo real amarrado |
| Fase 02 | mesma condição de nav, mas **conteúdo travado por padrão para todos** (`escopoIncluiFase2: false` hardcoded) | condição contratual/operacional específica | correto e seguro hoje — mas também significa que **nada abre Fase 02 para Ana até essa leitura de contrato ser implementada**, não é uma decisão específica sobre Ana |
| Proposta | só na nav antes de `client_workspace` | pré-contratação | some do menu principal após virar `client_workspace`; só alcançável via link em Conta |
| Faturas | **não está na nav principal**, só alcançável via link em Conta/Proposta | **fora do pacote de Ana — não deveria ser alcançável para ela em nenhuma forma** | ver seção 5 |
| Mensagens/Atendimento | alcançável via ticket individual (`/portal/mensagens/:id`), sem lista própria na nav | por autorização/caso | — |

## 5. Inventário — o que está na navegação mas deve ficar FORA do pacote de Ana

- **Faturas é o item central.** Hoje ela:
  1. Não aparece na barra de navegação principal (`portal-shell.tsx:65-83`) — correto,
     por padrão nenhum cliente vê "Faturas" como aba.
  2. **Aparece como link fixo e incondicional** dentro de `Conta`
     (`conta.tsx:44-46`, `<Link to="/portal/faturas">Faturas</Link>`) — sem nenhuma
     checagem de pacote/produto.
  3. **Aparece como seção de dados** dentro de `Proposta` (`proposta.tsx:56-78`,
     bloco "Condições" lendo `data.faturas`) — também sem checagem de pacote.
  4. A rota `/portal/faturas` em si é real, funcional e tem RLS própria
     (`invoices_sel_portal`) — **não é mock, é uma feature completa de outro
     produto/caso**, o que reforça que não deve ser tocada/apagada globalmente.
- **Mudança mínima e não destrutiva recomendada** (proposta, não implementação —
  fica para a Fase 2): condicionar os dois links (`Conta` e a seção "Condições" de
  `Proposta`) a um sinal de escopo (ex.: "este caso tem faturamento visível ao
  cliente?"), com o padrão seguro sendo **não mostrar** até essa condição existir —
  sem remover a rota `/portal/faturas`, que outros casos podem legitimamente usar.
  Isso resolve Faturas para Ana sem quebrar a rota globalmente.
- **Legado** também está sempre na nav e sempre vazio — correto por ora (nunca
  fica vazio "por engano", o texto é honesto: "Nenhum material de legado publicado
  no momento"), mas caso a proprietária queira reforçar a decisão canônica 6
  ("Legado fora do corte inicial, salvo decisão futura"), o ponto de decisão fica
  registrado aqui para a Fase 2.
- **Entregas / Fase 01 / Fase 02** ficam corretamente fora da nav até
  `onboarding_iniciado_em` — mas, uma vez que entram na nav, mostram um placeholder
  genérico que **não distingue "ainda não há nada" de "o mecanismo de publicação
  nem existe"** (caso de Entregas, por causa da tabela sem RLS). Isso é uma questão
  de honestidade de estado, não de conteúdo indevido — mas vale registrar porque o
  texto fixo é idêntico nos três casos e esconde a diferença real entre eles.

## 6. Análise de segurança / QA

**O que está sólido e verificado por código+schema:**
- Autenticação ≠ autorização: `portal/route.tsx` só exige sessão; toda leitura de
  dado depois passa por `portal_caso_permitido()` no banco (não em React).
- Link mágico de uso único, expiração curta, invalidado ao suspender acesso
  (`portal.functions.ts:711-714`), rate-limited, resposta sempre genérica.
- RLS real (não só checagem de app) em `client_portal_access`,
  `client_portal_case_access`, `client_access_events`, `clientes`, `crm_casos`,
  `evidencias`, `eventos_financeiros`, `documents`, `invoices` — todas amarradas a
  `portal_caso_permitido()`/`portal_meu_cliente()`/`portal_minha_org()`.
- Trilha de auditoria imutável (`fn_block_delete` em `client_portal_access`,
  `client_portal_case_access`, `client_access_events`).
- Teste automatizado real (`superficie-interna-regras.test.ts`) comprova, via
  leitura de código-fonte e da função `decidirAcessoDesk`, que: cliente autenticado
  nunca vê controle interno; cliente não acessa rota Desk por URL direta (é
  redirecionado a `/portal`); reload/falha de leitura não vaza papel de equipe
  para o cliente.
- Preview de admin (`app-cliente-como-pessoa.test.ts`) comprova: só
  `ehProprietariaAdministradora` passa; lê exclusivamente `content_sanitized` de
  `portal_projecoes`; escopado por `organization_id`; `semCache()` chamado (sem
  cache de resposta autenticada); nenhum `insert`/`update`/`delete` no componente.

**O que NÃO está verificado e é bloqueio real para o go-live:**
1. **Isolamento cross-case entre dois titulares reais autenticados** nunca foi
   executado — só foi verificado o caso trivial (sem sessão nenhuma → RLS nega).
   Precisa de uma segunda conta de cliente real (ou QA) autenticada tentando abrir
   `caseId` de outro titular.
2. **Conta QA sem papel de staff** — a existência de
   `qa-tela-a-tela@clubeancestral.test` foi citada no prompt, mas não há vestígio
   dela no repositório (é dado de produção/staging, não código) e este ambiente não
   tem credencial Supabase para checar seu papel. **Não dá para confirmar aqui se
   ela serve para este teste** — precisa ser confirmado com acesso vivo ao banco, ou
   uma conta nova, deliberadamente sem nenhuma linha em papéis de staff, precisa
   ser criada para este fim específico.
3. **Documentos/Entregas/Fase01/Fase02 não têm teste automatizado dedicado** (só
   Jornada/Radar/Árvore têm componente reutilizável testado via
   `app-cliente-como-pessoa.test.ts`) — o gate de visibilidade (`app-visibilidade.ts`)
   tem lógica testável mas não encontrei teste unitário específico para
   `visibilidadeTela()` nesta varredura (vale confirmar antes de assumir cobertura).
4. Nenhum teste comprova magic link expirado/consumido sendo rejeitado no fluxo
   ponta a ponta (a lógica existe em `confirmarAcessoPortal`, mas é chamada
   real/servidor, não coberta pelos testes lidos aqui).

## 7. Telemetria e indicadores — o que existe e o que não existe

**Existe, real:**
- `client_access_events` — eventos de ciclo de vida do *acesso* (convite criado,
  reenviado, link solicitado/enviado, autenticado, negado, sessão expirada,
  suspenso, revogado, caso concedido/revogado). É **evento de acesso**, não de
  **uso de conteúdo**.
- `last_authenticated_at`/`first_authenticated_at` em `client_portal_access` —
  mostrado na UI de `/acessos-portal` ("último acesso …").

**Não existe — confirmado, não presumido:**
- Nenhuma tabela `portal_events`/`analytics`/`page_view`/`session_log` foi
  encontrada em `supabase/migrations`.
- O próprio código já declara essa ausência de forma honesta:
  `LACUNAS_CONHECIDAS` em `src/lib/navegacao-desk.ts:452-462` — "Atividade real de
  abertura/download no App Cliente" é listada como lacuna, motivo: "Só é exibida
  quando houver evento canônico registrado" (ou seja, o slot de UI existe em
  algum lugar do Desk, mas honestamente não mostra número simulado).
- Não há favoritos, heatmap, tempo em tela, ou taxa de conclusão de nenhuma tela
  do portal. `updated_at`, renderização de página e uso de admin preview **não
  contam como uso real do cliente** e não devem ser reportados como tal — nesta
  varredura nenhum deles foi encontrado sendo tratado como proxy de uso, o que é
  o comportamento correto.
- Consequência prática: hoje **não há como responder "a Ana já abriu o portal?"
  ou "ela já baixou o documento X?"** a partir de dado de produto — só via
  `last_authenticated_at` (login, não uso de tela) e via download realizado através
  de `baixarEntrega` (que não parece logar evento próprio, além do resultado de
  `client_access_events` que só cobre acesso, não ação em tela — não confirmado
  como logando download individual nesta leitura).

## 8. Plano P0/P1/P2 (achados desta varredura, não Fase 2)

**P0 — bloqueia o go-live controlado do piloto real:**
1. Confirmar (com acesso vivo ao Supabase) se `qa-tela-a-tela@clubeancestral.test`
   tem papel de staff; se tiver, criar conta QA genuinamente sem papel, e executar
   o teste de isolamento cross-case com 2 titulares reais autenticados.
2. Decidir e registrar, para o caso de Ana especificamente, o sinal que vai
   condicionar os links de Faturas em `Conta` e `Proposta` — sem isso, Faturas
   continua alcançável por ela mesmo "fora do pacote".
3. Confirmar com a proprietária se Entregas/Fase 01 devem continuar aparecendo na
   nav (via `onboarding_iniciado_em`) antes de terem qualquer mecanismo de
   publicação real ligado (`client_deliverables` sem RLS de portal ainda).

**P1 — necessário antes de abrir o portal para uso recorrente de Ana:**
4. Adicionar RLS de portal para `client_deliverables` (ou decidir formalmente que
   Entregas usa outra fonte) — pré-requisito para Entregas mostrar conteúdo real.
5. Ligar `/acessos-portal` a `/app-cliente-como-pessoa` com um link direto por
   cliente/caso (hoje são telas desconectadas dentro do mesmo grupo Cliente).
6. Estender `/app-cliente-como-pessoa` (e a demo) para cobrir Documentos e
   Entregas — as duas telas com maior chance de serem usadas cedo por Ana.

**P2 — qualidade e visibilidade, não bloqueante:**
7. Diferenciar, no texto do placeholder, "ainda não há nada publicado" de
   "o mecanismo de publicação não existe" (Entregas vs. Fase 01/02 vs. Legado).
8. Cobrir Fase 01/02/Legado com o mesmo tratamento de componente reutilizável
   quando a proprietária decidir abrir cada uma.
9. Avaliar se `client_access_events` deveria (decisão da proprietária, não
   assumida aqui) ganhar eventos de ação em tela (download, visualização de
   entrega) — hoje só cobre ciclo de vida do acesso.

## 9. Critérios de aceite e roteiro de teste para a Fase 2 / preview de Tatiana

Critérios de aceite sugeridos (a validar/ajustar pela proprietária antes da Fase 2):
- Ana só vê, em qualquer sessão real, as telas liberadas pela matriz da seção 4 —
  nunca Faturas.
- Toda liberação de conteúdo (entrega, fatura, documento) tem `liberado_por`/evento
  rastreável — nenhuma aparece "sozinha".
- Reload da sessão do portal não perde a autorização nem vaza dado de outro caso.
- Acesso por URL direta ao Desk, estando autenticado só como cliente, redireciona
  para `/portal` (já comprovado por teste — reconfirmar no ambiente publicado).

Roteiro de teste para Tatiana rodar em preview:
1. **Ver como cliente (admin preview):** abrir `/app-cliente-como-pessoa`, escolher
   o caso de Ana (`CA-CID-AT-FAM-2026-001`), conferir Jornada/Árvore/Radar — são as
   únicas 3 telas cobertas hoje.
2. **QA externo:** com uma conta sem papel de staff (confirmar/():criar conforme P0.1),
   solicitar link mágico em `/acesso`, autenticar, conferir: nav mostra só as telas
   esperadas (sem Entregas/Fase01/02 se onboarding não começou; sem Faturas em
   nenhum caso); reload mantém sessão; tentar abrir `/portal/casos/<id-de-outro-caso>`
   deve devolver vazio/negado.
3. **Negativa de acesso ao Desk:** logado só como cliente, tentar `/acessos-portal`
   ou `/atendimento` diretamente pela URL — deve redirecionar para `/portal`.
4. **Publicação manual:** em `/atendimento`, liberar uma entrega ou documento de
   teste e confirmar que só aparece no portal depois da ação explícita (nunca antes).
5. **Revogação:** suspender o acesso de teste em `/acessos-portal` e confirmar que
   o link mágico anterior deixa de funcionar (evento `magic_link_expires_at` no
   passado, conforme `portal.functions.ts:711-714`).
