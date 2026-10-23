# Production Readiness Audit: camada de servidor do Clube Ancestral (pós-lançamento)

**Perspective**: Production Readiness Engineer
**Date**: 2026-10-23
**Escopo auditado**: as 678 server functions (`createServerFn`), autenticação/autorização, validação de entrada, observabilidade, integridade de dados e pipeline de deploy — conforme pedido ("a camada de backend real deste projeto"). A PR #175 (Kanban de `/ops`) é cosmética e entra só no checklist de build.

**Método**: auditoria **estática**, sobre código e configuração. **Não li nem gravei no banco** `zsxpdbhdvbuulwpepemd` (congelado em só-leitura desde 20/10, PR #172), conforme sua ordem. Onde a conclusão depende de configuração que só existe no painel do Supabase, isto está dito explicitamente em vez de presumido.

## Plan Summary

O produto está no ar em produção (`soul-ancestry.vercel.app` respondeu 200 com a home nova da PR #174). A fundação de autorização é sólida — RLS é de fato a fronteira. Os riscos reais não estão na autorização: estão em **um redirect de autenticação que confia num header do cliente**, em **ausência total de telemetria em produção** e em **não haver fonte única de verdade do schema implantado**.

## Files Reviewed

| Arquivo | Papel em produção | Risco |
|---|---|---|
| `src/lib/portal.functions.ts` | Portal do cliente; contém o **único** endpoint público que dispara e-mail de login | **Alto** |
| `src/lib/portal.server.ts` | `enviarLinkMagico` — repassa `redirectTo` ao Supabase sem validar | **Alto** |
| `src/lib/equipe.functions.ts` | Login/recuperação/bootstrap da equipe | Médio |
| `src/lib/lovable-error-reporting.ts` | Único reporte de erro do produto | **Alto** (inoperante em prod) |
| `src/routes/__root.tsx` | Error boundary que chama o reporte | Médio |
| `src/integrations/supabase/client.server.ts` | `service_role`; chave só do ambiente | Baixo (correto) |
| `src/integrations/supabase/auth-middleware.ts` | `requireSupabaseAuth` em 668/678 funções | Baixo (correto) |
| `supabase/migrations/` (234 arquivos) vs `drizzle/migrations/meta/_journal.json` (2 entradas) | Histórico de schema | **Alto** |
| `vercel.json` | Headers de segurança + `ignoreCommand` | Baixo |

## Verdict: APPROVE WITH CHANGES

Nada aqui bloqueia a PR #175 nem desfaz a PR #174 — ambas são visuais e não tocam esta camada. Mas há **1 item crítico** e **3 itens altos** que valem ser fechados agora que o produto tem cliente pagante real em produção.

## Critical Issues (Must Fix)

| # | Issue | Arquivo(s) | Modo de falha em produção | Correção |
|---|---|---|---|---|
| 1 | O destino do link de login do cliente é montado a partir dos headers `origin`/`host`, **controláveis por quem chama**, num endpoint **sem autenticação**. `enviarLinkMagico` repassa isso direto ao `emailRedirectTo` do Supabase, sem validação alguma. | `portal.functions.ts:22-25`, `portal.server.ts:176-182` | Alguém chama `solicitarLinkAcesso` com o e-mail de uma cliente e `Host: dominio-falso`. A cliente recebe um e-mail **legítimo**, do remetente real, cujo link aponta para o domínio do atacante com o token de acesso na URL → sequestro de conta. A única barreira é a allowlist de redirect do Supabase (Site URL + `additional_redirect_urls`), que **não consigo ver pelo código** — e que costuma conter curinga `*.vercel.app` para previews, o que tornaria isto explorável. | Definir URL canônica em variável de ambiente (ex. `APP_URL`) e usá-la como destino. Header só como fallback, e validado contra allowlist **no código** — não blocklist. Enquanto isso: conferir no painel do Supabase (Authentication → URL Configuration) que não há curinga e que só os domínios oficiais estão na lista. |

## Recommendations

| # | Issue | Por quê | Correção |
|---|---|---|---|
| 2 | **Produção é cega.** `reportLovableError` retorna cedo no servidor (`typeof window === "undefined"`) e, no navegador, depende de `window.__lovableEvents` — um global do runtime do Lovable. **Verifiquei: o HTML servido em `soul-ancestry.vercel.app` não contém nenhuma referência a esse global.** O optional chaining (`?.`) engole a chamada em silêncio. Somadas, as 678 server functions têm **12** linhas de log. | Se algo quebrar para uma cliente agora, não existe nada para olhar depois. Nenhum erro de servidor é reportado; nenhum erro de cliente é capturado em produção. Isto é o que transforma um incidente de 10 minutos em um de 2 dias. | Adotar um coletor que funcione fora do Lovable (Sentry ou equivalente), cobrindo **os dois lados**: error boundary do cliente e um wrapper nas server functions. Mínimo viável: logar erro com contexto (função, usuário, organização) no `catch` das funções de escrita. |
| 3 | **Não há fonte única de verdade do schema implantado.** São 234 arquivos em `supabase/migrations/` (histórico, aplicados por outros meios) contra **2** entradas no journal do Drizzle, que o AGENTS.md define como o dono do histórico de deploy. | Nenhuma ferramenta sozinha reconstrói o banco. Em recuperação de desastre, ou ao criar um ambiente de homologação, não existe comando que chegue ao schema atual — e não há como provar que produção e repositório batem. | Registrar no journal do Drizzle as 234 migrations já aplicadas como baseline (ou documentar formalmente o ponto de corte: "o schema anterior a X é baseline, daqui em diante o journal é autoritativo"). Sem isso, rollback e DR são manuais e não testáveis. |
| 4 | A migration `20261011130000_saneamento_nucleo_ana_luiza` **continua não aplicada** (está no repo, ausente do journal). | Consequência concreta e **ao vivo**: a linha fantasma de Ana Luiza e os `papel_no_caso` divergentes fazem o filtro `portal_sou_contratante_financeiro` **não liberar a fatura** dela no App. Uma cliente pagante (3 assinaturas de R$ 320/mês) não vê a própria fatura. A migration em si está bem feita — idempotente, arquiva em vez de apagar. | Aplicar pelo caminho autorizado. Depende da sua decisão: o banco está congelado e os `nucleo_membros` ids fixos nunca foram conferidos contra o Lovable Cloud. |
| 5 | `ORIGEM_PRODUCAO = "https://soul-ancestry.lovable.app"` (`equipe.functions.ts:9`), mas produção responde em `soul-ancestry.vercel.app`. | É o destino de **convites e redefinição de senha** da equipe quando o header cai no fallback. Se `lovable.app` não é mais o domínio canônico, esses e-mails apontam para o host errado. | Confirmar qual é o domínio canônico e unificá-lo com o item 1 (uma única variável de ambiente para os dois fluxos). |
| 6 | Endurecimento inconsistente: o fluxo da **equipe** tem `origem()` com fallback de produção e bloqueio de preview/localhost; o fluxo do **portal do cliente** não tem nada disso. E mesmo o da equipe é blocklist (`/lovableproject\.com\|id-preview\|localhost/`), não allowlist. | O lado que atende cliente final é o menos protegido dos dois. Blocklist falha por omissão: qualquer host novo passa. | Um único helper, allowlist, usado pelos dois fluxos. |
| 7 | A migration `20261020150000` (PR #173), listada como pendente para o Lovable, **não tem arquivo no repositório**. | Um item de schema rastreado como pendente sem artefato versionado não pode ser aplicado nem auditado. | Localizar e commitar, ou remover da lista de pendências. |

## Nice-to-Haves

| # | Sugestão | Racional |
|---|---|---|
| 8 | 212 dos 458 `inputValidator` são passagem direta (`(data) => data`). | **Calibrando corretamente**: não é falha de autorização. O AGENTS.md define RLS como a fronteira, e o código cumpre isso (item abaixo). São asserções de tipo sem validação de valor — defesa em profundidade, não buraco. Vale endurecer os que recebem id/enum vindo da tela. |
| 9 | `./drizzle` não está no `ignoreCommand` da Vercel. | Inofensivo hoje: nada em runtime importa de `drizzle/`, e migrations não são aplicadas pelo build. Só registro. |
| 10 | Em `criarPrimeiroAdmin`, a limpeza do usuário órfão usa `.catch(() => undefined)`. | Se o `deleteUser` falhar, sobra uma conta de auth sem organização e ninguém fica sabendo. Logar o erro. |

## Failure Mode Analysis

| Cenário | O que falha | Impacto no usuário | Recuperação | O código trata? |
|---|---|---|---|---|
| Atacante chama `solicitarLinkAcesso` com `Host` forjado | Link de login vai para domínio do atacante | Sequestro de conta da cliente | Nenhuma no código | **Não** — depende só da allowlist do Supabase, não verificável aqui |
| Server function lança exceção em produção | Erro sobe para a tela; nada é registrado | Cliente vê falha; você não descobre que aconteceu | Nenhuma | **Não** |
| Erro de render no navegador em produção | Error boundary chama um global inexistente | Tela quebrada, zero telemetria | Recarregar | **Não** (no-op verificado) |
| Supabase fora do ar / lento | 417 chamadas sem timeout explícito | Telas penduradas | Recarregar | Parcial — React Query cobre retry de leitura, não de escrita |
| Precisar recriar o banco (DR/homologação) | Nenhuma ferramenta reconstrói o schema | Indisponibilidade prolongada | Manual | **Não** |
| Ana Luiza abre a fatura hoje | Filtro de contratante não libera | Cliente pagante não vê a própria fatura | Aplicar a migration | **Não** (pendente) |
| Tentativa de criar segundo "primeiro admin" | Bloqueado no banco | — | — | **Sim** — rate limit + `bootstrap_permitido` + trava + auditoria |
| Enumeração de e-mail no portal | Resposta é sempre `{ ok: true }` | — | — | **Sim** |
| Chave `service_role` vazar para o cliente | Confinada a `.server.ts`, só do ambiente | — | — | **Sim** |

## Environment Checklist

| Preocupação | Dev | Prod | Lacuna? |
|---|---|---|---|
| URL canônica | header da requisição | header da requisição | **Sim** — nenhuma env var; `ORIGEM_PRODUCAO` possivelmente defasada (`lovable.app` vs `vercel.app`) |
| Rede | Supabase direto | Supabase direto | Sem timeout explícito nas escritas |
| Permissões | RLS + `service_role` | idem | Não. `FORCE RLS` segue como item rastreado (PR #170, fora de escopo por decisão sua) |
| Config | `VITE_SUPABASE_URL` / `process.env` | idem, com guarda que falha explícito | Não — `client.ts` erra alto se faltar chave |
| Telemetria | global do Lovable existe no editor | **global ausente** | **Sim** — reporte é no-op em produção |
| Saída de build | `vite build` limpo | Vercel, `ignoreCommand` | Não (`drizzle/` irrelevante em runtime) |
| Headers de segurança | — | nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy | Não — presentes. Sem CSP (aceitável para o estágio) |

## Verdict Details

- **E2E Flow**: PASS — produção respondendo 200 com o conteúdo esperado.
- **Error Recovery**: CONCERNS — sem timeout nas escritas; `criarPrimeiroAdmin` é o único fluxo com desfazimento explícito (e é exemplar).
- **Data Integrity**: CONCERNS — duas linhagens de migration sem reconciliação; uma migration pendente com impacto visível em cliente real. Crédito: as migrations escritas são idempotentes e arquivam em vez de apagar.
- **Environment Parity**: CONCERNS — URL de autenticação derivada de header; constante de produção possivelmente apontando para o host antigo.
- **Observability**: **FAIL** — o único coletor é inoperante em produção, verificado. É a lacuna que eu fecharia primeiro depois do item 1.
- **Authorization (fora do template, mas é o que mais importa aqui)**: PASS, com mérito — 417 chamadas pelo client do usuário (RLS) contra 14 de `service_role`, confinadas a 5 arquivos; segredo só do ambiente; 668 de 678 funções com `requireSupabaseAuth`, e as 6 públicas restantes são exatamente as que precisam ser (login, recuperação, bootstrap, magic link), todas com rate limit.
