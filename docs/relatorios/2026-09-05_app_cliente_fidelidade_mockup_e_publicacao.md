---
titulo: App Cliente — fidelidade ao mockup aprovado e matriz de publicação (CA-APP-CLIENTE-FIDELIDADE-MOCKUP-007)
data: 2026-09-05
branch: main (achado avaliado direto contra produção, pós-merge da PR #85)
---

Mockup aprovado localizado: SIM — `docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`
Telas/abas previstas no mockup: 7 (Home/Início, Jornada, Radar, Árvore, Documentos, Legado, Conta)
Telas/abas alinhadas visualmente (nome, ordem, papel): 7/7
Telas/abas com dados vivos/publicáveis de verdade: 2/7 (Jornada, Documentos) — Radar deriva de Jornada+Documentos, então também reflete conteúdo real
Placeholders genéricos removidos: 0 (não removidos ainda — ver seção 5)
Fluxos Desk→Portal entregues nesta rodada: 0 novas telas conectadas; 2 registros de teste publicados via SQL direto para provar o caminho já existente (Jornada e Árvore)
Cliente A vê conteúdo autorizado após reload: SIM para Jornada e Árvore (publicado agora, ver seção 1) — NÃO testado visualmente por clique real (mesma limitação de sandbox já documentada; conteúdo confirmado por leitura direta do banco contra a policy real)
Cliente B não vê conteúdo de A: NÃO TESTADO NESTA RODADA (não criei Cliente B; isolamento já provado estruturalmente para o caso, não para conteúdo publicado — ver `2026-09-05_acesso_cliente_homologacao.md`)
Itens que ainda divergem do mockup: 0 na taxonomia visual; 4 na fidelidade de conteúdo (Legado, Árvore-além-de-projeção-genérica, Entregas, Fase 01/02 — ver seção 2)
Preview/produção: https://soul-ancestry-git-claude-ancestral-c-e43197-tati-6134s-projects.vercel.app (mesmo código já está em `main`)
Branch/PR: main, pós-commit `d8601e2` (merge da PR #85)
Artefato: este arquivo

Não declaro "pronto". Ver seção 5 para o que continua sem solução nesta rodada.

## 1. O que a comparação contra o mockup realmente mostra

A hipótese inicial — "o App Cliente não corresponde ao mockup" — só é parcialmente verdadeira. Comparando
`TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` linha a linha contra o código real:

| Item do mockup | Implementado? | Observação |
|---|---|---|
| 7 abas, nesta ordem | SIM | `portal-shell.tsx` monta exatamente Início→Jornada→Radar→Árvore→Documentos→Legado→Conta |
| Rótulo "Home" | Traduzido para "Início" | Decisão de consistência: todo o resto do app é em português. Não considero isto um desvio do mockup — o documento não exige o rótulo em inglês, define a taxonomia de papéis |
| Papel de cada tela (função, o que deve concentrar) | Estruturalmente correto | Os componentes (`portal-visibilidade.tsx`, `portal-copy.ts`) já implementam estados diferenciados (`always_available`, `available_empty`, `in_preparation`, `not_applicable`) com linguagem humana, sem termo técnico — exatamente como o mockup exige na seção de microcopy |
| "Disponível para você" só quando há conteúdo | Correto, não é bug | O rótulo indica que a **área está desbloqueada para o cliente** (nível de acesso), não que **há conteúdo dentro dela** — as duas coisas são informações diferentes e a tela já mostra as duas separadamente ("disponível" + "ainda não há atualizações") |

O que estava genuinamente vazio nas suas capturas de tela não é falha de fidelidade visual — é a ausência real
de conteúdo publicado para este caso específico de homologação, que eu tinha acabado de criar minutos antes
só para provar a elegibilidade de acesso (ver `2026-09-05_acesso_cliente_homologacao.md`), sem nunca ter
publicado nada nele.

**Prova**: publiquei agora, via o mecanismo real (`app_projections`, a mesma tabela que `portal_projecoes`
expõe ao cliente sob RLS), um registro de Jornada e um de Árvore para o caso de homologação
(`aae4d5f5-8329-4f53-926c-8a7448ba8bfa`). Confirmado por leitura direta da policy real (`app_proj_select_portal`)
que essas linhas atendem a todas as condições de leitura do cliente. Ao recarregar `/portal/jornada` e
`/portal/arvore` com a sessão do cliente de homologação, o conteúdo deve aparecer.

## 2. O achado real, mais sério que fidelidade visual: metade das telas não tem cano nenhum

O próprio código já documenta isto, de uma sessão anterior a esta (`src/lib/portal-dados-vivos.ts`,
constante `BLOQUEIOS_CA_PORTAL_02`) — não é um achado novo, é uma dívida conhecida e registrada que eu conferi
contra o schema real do banco (Supabase, `zsxpdbhdvbuulwpepemd`) e confirmei que continua verdadeira:

| Tela | Fonte que a tela tentaria usar | Situação real |
|---|---|---|
| Jornada | `app_projections` (tipo `marco`), via `portal_projecoes` | **Funciona.** Policy `app_proj_select_portal` real, testada agora |
| Árvore | `app_projections` (tipo `arvore`) | **Funciona**, mas só entrega projeção genérica de texto — não uma árvore genealógica estruturada (nós, gerações, vínculos). `genealogical_person_profiles` não tem nenhuma policy de portal — só `is_org_member`, ou seja, nunca chegaria ao cliente mesmo que os dados existissem |
| Documentos | `documents`, policy `documents_sel_portal` | **Funciona.** Confirmei a policy ao vivo; não consegui inserir uma linha de teste porque o trigger `fn_documents_guard` exige sessão autenticada real (mesma limitação estrutural desta sessão de automação — não um bug) |
| Legado | `knowledge_items`/`client_deliverables` | **Sem policy de portal alguma.** A tela (`legado.tsx`) nem chama `usePortalVivo()` — é estática, sempre mostra o mesmo vazio, com ou sem dado |
| Entregas | `client_deliverables` | **Sem policy de portal.** SELECT só por `is_org_member` — a tela também é estática |
| Fase 01 / Fase 02 | `contracts`/`case_services` | **Sem policy de portal.** Telas estáticas, só computam o estado de visibilidade (contratado/não aplicável), nunca leem conteúdo |

## 3. O que isso significa, sem meio-termo

Não é que a equipe "ainda não publicou" Legado/Entregas/Fase 01/02 — é que **hoje não existe ação nenhuma,
em lugar nenhum do Desk, que consiga publicar para essas três áreas**, porque o banco nunca recebeu a regra
de acesso (RLS) que permitiria ao cliente ler o resultado mesmo que alguém tentasse. Corrigir isso de verdade
exige: (a) desenhar a policy de portal para cada tabela de origem (`client_deliverables`, `knowledge_items`,
`contracts`/`case_services`), decidindo o que exatamente é seguro expor; (b) construir a ação real no Desk que
publica; (c) só então ligar a tela. Isso é trabalho de RLS e produto, não de UI — não posso fazer isso com
segurança nesta mesma resposta sem correr o risco de expor dado que ainda não foi pensado para ir ao cliente.

## 4. Matriz Desk→Portal (o que existe hoje, sem inflar)

| Conteúdo | Fonte/tabela | Quem publica no Desk hoje | Ação real | Regra RLS/leitura Portal | Componente Portal |
|---|---|---|---|---|---|
| Atualização de jornada | `app_projections` (marco) | Ninguém — não encontrei tela/ação Desk que grave nesta tabela | Nenhuma | `app_proj_select_portal` (real, testada) | `/portal/jornada` |
| Registro de árvore | `app_projections` (arvore) | Ninguém | Nenhuma | idem | `/portal/arvore` |
| Documento liberado | `documents.liberado_cliente` | Atendimento interno | `liberarEntregaCliente` (real, já testado em rodadas anteriores desta madrugada) | `documents_sel_portal` (real) | `/portal/documentos` |
| Fatura liberada | `invoices.liberada_cliente` | Atendimento interno | `liberarFaturaCliente` (real) | policy de invoices (não reverificada nesta rodada) | `/portal/conta`, `/portal/faturas` |
| Legado | `client_deliverables`/`knowledge_items` | Ninguém | Não existe | Não existe | `/portal/legado` (estático) |
| Entregas | `client_deliverables` | Ninguém | Não existe | Não existe | `/portal/entregas` (estático) |
| Fase 01/02 | `contracts`/`case_services` | Ninguém | Não existe | Não existe | `/portal/fase-01`, `/portal/fase-02` (estáticos) |

**Achado adicional**: mesmo Jornada e Árvore, que têm a policy funcionando, não têm **nenhuma ação de ADMIN no
Desk** para publicar — a única forma de gravar ali, hoje, é a que eu usei agora: SQL direto. Isso é uma lacuna
real de produto: a policy existe, mas ninguém da equipe consegue usá-la pela interface.

## 5. O que ainda não corresponde ao mockup — sem chamar de pronto

- Legado, Entregas, Fase 01 e Fase 02 continuam sem nenhum caminho de conteúdo real — são estáticos por
  desenho atual do banco, não por escolha de tela.
- Não existe, em nenhum lugar do Desk, uma ação de ADMIN para publicar Jornada ou Árvore — só funciona por
  gravação direta no banco, o que não é uma solução operacional para a equipe usar no dia a dia.
- Não testei em navegador real (mobile/desktop) — mesma limitação de sandbox de toda a madrugada, já
  documentada. O conteúdo publicado agora precisa da sua verificação visual real.
- Não criei Cliente B nem testei isolamento de conteúdo publicado entre dois clientes nesta rodada.
- Árvore, mesmo quando "funciona", só mostra texto genérico — não a árvore genealógica estruturada
  (gerações G1–G5) que o mockup descreve como papel da tela.

## 6. Roteiro da Proprietária

1. Entrar como o cliente de homologação (`docs/relatorios/2026-09-05_acesso_cliente_homologacao.md`).
2. Abrir `/portal/jornada` — deve mostrar 1 marco de teste.
3. Abrir `/portal/arvore` — deve mostrar 1 registro de teste.
4. Abrir `/portal/legado`, `/portal/entregas`, `/portal/fase-01`, `/portal/fase-02` — devem continuar vazios;
   isso é esperado até que as políticas de banco e ações de Desk sejam construídas (não é regressão desta
   correção).

## 7. Reversão

Os dois registros de teste em `app_projections` (ids `4552941c-70b2-4b16-b817-f343ebb1b7be` e
`79b7ae66-d473-4de7-a772-da1dd68a379c`) podem ser arquivados (`archived_at`) a qualquer momento sem afetar
nenhum outro caso. Nenhuma policy, RLS ou schema foi alterado nesta rodada — só leitura e duas inserções de
conteúdo de teste dentro de mecanismos já existentes.
