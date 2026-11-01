# Current Implementation — como a telemetria está fiada hoje

Varredura de 2026-10-23. Descreve a fiação, não o que é rastreado (isso está em `current-state.yaml`).

## SDK e versão

Nenhum SDK de analytics. `package.json` não declara Segment, Amplitude, Mixpanel, PostHog, Accoil, gtag ou equivalente. Não há `dataLayer`, pixel ou script de terceiros no HTML servido em produção.

A telemetria é de primeira parte: inserts em tabelas Postgres do próprio projeto, via Supabase.

## Coletores

Seis tabelas recebem evento:

| Tabela | Escritor | Natureza |
|---|---|---|
| `audit_logs` | 98 inserts diretos em 55 arquivos + helper `registrar()` | mudança de estado, auditoria |
| `case_timeline_events` | helper `registrarTimelineCaso()` (38 chamadores) | linha do tempo do caso |
| `client_access_events` | helper `registrarEvento()` (8 chamadores) | ciclo de vida de acesso ao App |
| `owner_override_events` | 11 inserts em 9 arquivos | decisão da Proprietária sobre gate |
| `institutional_profile_events` | 2 inserts diretos + 1 helper ocioso | versionamento contratual |
| `client_tab_dwell_events` | `registrarTempoNaAba()` (1 chamador) | permanência por aba no App |

## Inicialização

Não há inicialização de SDK. O que existe é a construção do cliente Supabase:

- `src/integrations/supabase/client.ts` — cliente do navegador. Lê `VITE_SUPABASE_URL` em tempo de build, com `process.env.SUPABASE_URL` como alternativa no servidor. Falha explícita e alta se a chave não existir (`client.ts:70`).
- `src/integrations/supabase/client.server.ts` — cliente `service_role`, só servidor. O segredo vem exclusivamente do ambiente; nunca do repositório.
- `src/integrations/supabase/auth-middleware.ts` — `requireSupabaseAuth`, presente em 668 das 678 `createServerFn`. É o que popula `context.userId` e `context.supabase`.

## Cliente vs servidor

Toda gravação de evento acontece **no servidor**, dentro do handler de uma `createServerFn`. Nenhum evento é enviado direto do navegador para um endpoint externo.

O único evento originado por interação do navegador é a permanência por aba:

- `src/components/portal/portal-shell.tsx:41` — hook `useTelemetriaDePermanencia(rotaAtiva, bloqueado)`
- Guarda `{ tab, desde }` em `useRef`, mede a diferença e chama a server function via `useServerFn`
- Mapeia rota → aba por um dicionário literal (`/portal/legado` → `legado`)
- Respeita o estado `bloqueado`: não registra quando o App está bloqueado

## Roteamento de chamadas

Parcialmente centralizado. Quatro helpers compartilhados existem e são usados:

- `registrarEvento` — `src/lib/portal.server.ts:54`
- `registrarTimelineCaso` — `src/lib/timeline-operacional.server.ts:12`
- `registrar` — `src/lib/onboarding-regras.ts:80` (escopo onboarding, grava em `audit_logs`)
- `registrarEventoInstitucional` — `src/lib/perfil-institucional-persistido.server.ts:32`

Ao lado deles, `audit_logs` recebe 98 inserts diretos espalhados por 55 arquivos, sem passar por helper. Os dois caminhos coexistem na mesma tabela.

`registrarTimelineCaso` é o helper mais adotado (38 chamadores) e faz verificação de duplicidade antes de inserir (`timeline-operacional.server.ts:17`).

## Identidade

Sem `identify()` ou `group()`. A identidade é relacional, em coluna:

- `organization_id` — presente e NOT NULL nos seis coletores. É o agrupamento de fato (tenant).
- `case_id` — em `case_timeline_events` e `client_tab_dwell_events`. Segundo nível natural de agrupamento: o caso é a unidade de trabalho do produto.
- `user_id` / `actor_user_id` / `auth_user_id` — ator, conforme o coletor.

No servidor a identidade vem de `context.userId` (do middleware). Dentro do banco, funções `SECURITY DEFINER` resolvem o contexto do cliente do App: `portal_meu_acesso()` por `auth.uid()` e `portal_meu_cliente()` pelo `client_id` do acesso.

## Variáveis de ambiente

`SUPABASE_URL` / `VITE_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SECRET_KEY`). Lidas por `src/lib/config-servidor.ts` e `src/lib/config-publica.ts`. Nenhuma variável específica de telemetria.

## Tratamento de erro

Varia por caminho:

- `registrarEventoInstitucional` devolve `{ registrado, motivo }` em vez de lançar.
- `registrarTempoNaAba` captura o `error` do insert e devolve `{ ok: false }` quando a aba não está na lista permitida.
- A maioria dos inserts diretos em `audit_logs` é `await supabase.from("audit_logs").insert({...})` sem checar o retorno: uma falha de gravação de auditoria passa em silêncio.
- Nenhum envoltório try/catch global para telemetria.

## Shutdown / flush

Não se aplica. O insert é síncrono, no mesmo handler da ação; não há fila, lote nem buffer a esvaziar. No caminho do navegador, o hook de permanência envia ao trocar de aba e ao desmontar.

## O que já funciona e vale preservar

- **RLS como fronteira do coletor.** `client_tab_dwell_events` é gravada pelo próprio cliente autenticado via política `ctde_insert_self`, não por `service_role` — o comentário em `portal-cliente.functions.ts:700` registra essa escolha.
- **Vocabulário fechado na borda.** `ABAS_COM_TELEMETRIA` é uma tupla `as const` e o handler rejeita aba fora da lista, então a cardinalidade do campo não pode crescer por acidente.
- **`registrarTimelineCaso` com deduplicação.** Verifica evento existente antes de inserir.
- **`organization_id` obrigatório em todos os coletores.** O isolamento multi-tenant está na coluna, não na aplicação.

## Potencial de hierarquia de grupos

O modelo tem hierarquia explícita: `organizations` → `crm_casos` → `nucleos_familiares` → `nucleo_membros`, com `case_members` e `case_dependents` ao lado. Hoje os eventos carregam no máximo dois níveis (`organization_id` e `case_id`).

Se a hierarquia vier a ser enviada a uma ferramenta de terceiros: Segment, Mixpanel e PostHog tratam grupos multinível nativamente; Amplitude exige contorno.
