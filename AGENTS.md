<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Clube Ancestral — memória permanente para agentes

Documento normativo da proprietária (Tatiana, tati@pluggedresearch.com), destilado em 2026-09-10. Texto completo arquivado em `docs/politicas/MEMORIA-PERMANENTE-CLUBE-ANCESTRAL-2026-09-10.md`. Regra Cursor espelhada em `.cursor/rules/clube-ancestral.mdc`.

Isto **não** autoriza redesenho de navegação, vocabulário novo (incluindo taxonomia “CHECK-*”) nem tabelas hipotéticas de prompts antigos. Antes de implementar, confirmar o schema real e as decisões já vigentes.

## Ordem de autoridade

1. Decisão explícita e mais recente da proprietária.
2. **Planejador** = única fonte válida do planejamento operacional ativo (prioridades, capacidade, prazos, responsáveis, o que vem a seguir).
3. Modelo de dados, migrations e código efetivamente aprovados. Divergência = dívida ou bloqueio declarado, nunca escondida.
4. Mockup aprovado de **17 páginas** (`docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf`) = contrato visual normativo.
5. Políticas aprovadas em `docs/politicas/` (autoridade operacional, fonte de verdade de design, taxonomia do mockup, **adendo de contexto não arquivável e prova autenticada** de 2026-09-10).
6. Materiais legados = histórico / auditoria / migração controlada. **Nunca** dirigem a operação atual.

Se o código divergir destas instruções, declarar a dívida. Não “corrigir” a realidade do schema inventando entidades paralelas.

## Legado — regra inegociável

A matriz operacional legada, a planilha mestre, o DRE e a reconciliação antiga do Asaas são passado. Proibido usá-los como premissa arquitetural, motor de priorização, dashboard operacional, CRM, planner ou razão do negócio.

Acesso permitido só com tarefa formal de: preservação histórica, conferência pontual, migração mapeada e aprovada, auditoria de divergência, ou exportação de evidência. Dados históricos devem estar rotulados como **legado**, separados da camada ativa, e incapazes de sobrescrever o planejador.

Tabela já existente para vínculos históricos: `legacy_record_links`. Não recriar a matriz legada como núcleo.

Asaas, quando houver integração aprovada, registra eventos financeiros ligados a cliente/caso/contrato. Não substitui caso, tarefa, documento, planner nem comunicação.

## Motor unificado (núcleo obrigatório)

O produto é um **sistema operacional de casos e jornadas**, não um site, CRM genérico ou coleção de telas. Todo cliente, lead, caso, serviço, jornada, etapa, tarefa, documento, evento, interação, pendência, responsável e decisão precisa se relacionar a esse núcleo.

Cadeia mínima verificável: entrada → decisão → criação/atualização do caso → plano → execução → evidência → comunicação → acompanhamento → encerramento.

Não é entrega: página desconectada, kanban sem dados relacionais, checklist estático, formulário que não persiste, dashboard manual, portal sem dados reais, tabela sem fluxo utilizável.

Um caso ativo deve responder: **qual é a próxima ação concreta, quem executa, quando, o que bloqueia?** “Sem informação” não é estado aceitável — usar aguardando / pausado / encerrado / cancelado de forma explícita.

RPC já existente: `proxima_acao_prioritaria` / `proxima_acao_prioritaria_lote`. Reusar.

## Schema real — mapear, não inventar

Confirmar sempre em `src/integrations/supabase/types.ts` e `supabase/migrations/`. Reaproveitar entidades existentes. **Não criar** nomes hipotéticos de prompts antigos (`citizenship_cases`, `case_participants`, `onboarding_runs`, `cadence_runs`, `micro_deliveries` como tabela nova, vocabulário CHECK-* de requisitos).

| Conceito do documento | Onde está hoje |
|---|---|
| Caso | `crm_casos` (eixo). Também existe `casos` — não tratar como segundo eixo sem decisão. |
| Participantes do caso | `case_members`, `case_dependents`, `nucleo_membros` — **não** `case_participants`. |
| Cliente / pessoa | `clientes`, `contacts`, `client_contacts`, `genealogical_person_profiles` |
| Tarefa / planner | `tarefas`, `planner_tarefas` |
| Documento / evidência | `documents`, `evidencias`, `evidences`, `case_source_documents`, `genealogical_findings` (há fragmentação — dívida, não licença para uma quarta cópia) |
| Pesquisa | `research_cases`, `research_people`, `research_sources`, `genealogical_*` |
| Timeline | `case_timeline_events`; mudança de fase: `case_phase_history` (migration existe; pode faltar em `types.ts`) |
| Portal | `client_portal_access`, `app_projections`, `client_deliverables` |
| Financeiro | `invoices`, `payments`, `eventos_financeiros` — não o Asaas legado |
| Auditoria / override da proprietária | `audit_logs`, `owner_override_events` |

Migrations versionadas; sem alteração manual de produção como substituto. Validação no servidor. RLS real — esconder botão não é autorização. Segredos fora do cliente e do git.

## Navegação real — não redesenhar

**Desk vigente: 6 grupos** em `src/lib/navegacao-desk.ts` (`GRUPOS_DESK`), decisão explícita da proprietária (adendo §4 “seis áreas”). Não criar nona aba. Não voltar às 7 itens do mockup sem nova decisão.

1. `hoje` — Hoje / Visão Geral (`/painel`)
2. `comercial` — Marketing & Comercial
3. `casos` — Pessoas & Casos
4. `pesquisa` — Inteligência & Pesquisa
5. `contratos` — Formalização & Financeiro (financeiro **não** é grupo separado)
6. `governanca` — Governança & Administração

Configuração, equipe e preferências ficam no **menu da conta**, não como 7º grupo.

O texto de **8 grupos** (hoje, marketing, comercial, casos, pesquisa, contratos, cliente, governança) permanece **contexto ativo** até `COMPROVADO_EM_USO`. Não arquivar, não tratar como superado, não restaurar como menu sem decisão explícita.

A “hierarquia de telas” da memória permanente (planner, lista de casos, caso 360, pessoa, documentos, pesquisa, portal, admin) é **prioridade funcional**, não um menu novo.

**App Cliente canônico: 7 abas** (taxonomia do mockup de 17 páginas), em `src/components/portal/portal-shell.tsx`:

Home · Jornada · Radar · Árvore · Documentos · Legado · Conta

Rótulo da primeira aba no mockup e em `COPY_TELAS.casos.navegacao`: **Home** (não “Início”). O portal sanitiza: sem notas internas, hipóteses como fato, SKU, preço técnico, gates, dados de outros casos.

Abas extras condicionais (Entregas, Fase 01, Fase 02, Proposta) ainda existem no código — **dívida a retirar da barra**, não expansão da taxonomia. Ver artefato 007 abaixo.

**Mockup vs produção:** o PDF de 17 páginas é normativo visual. O PDF de auditoria de **47 páginas** (`clube-ancestral-mockup-auditoria.pdf`) é complementar (conteúdo/estados/fluxos), **sem força normativa de design**. Menu vigente = 6 grupos; mockup mostra 7 itens de Desk; memória permanente descreve 8 — os três textos permanecem ativos até prova integrada. Radar não é aba extra.

README raiz ainda descreve o protótipo visual antigo (6 abas, dados fictícios). É histórico, não a operação atual.

## Front-end e integração

- PT-BR, marca em `src/lib/marca.ts` / `src/styles.css` (navy `#2F4B6E`, dourado `#FCB73A`, creme `#ECDFCD`, terracota `#9A3A2F`).
- Interface lê e grava dados reais; recarregar deve mostrar o persistido.
- Não simular sucesso. Distinguir carregando / vazio legítimo / erro (`EstadoDados`).
- Próxima ação e responsável visíveis em caso ativo; bloqueios destacados; status não só por cor.
- Formulário cria/atualiza objeto real. Permissões no servidor/RLS.
- Pesquisa: separar fonte, transcrição, interpretação, hipótese e conclusão.

## Política de autoridade operacional (vigente, 2026-09-05)

`docs/politicas/politica-autoridade-operacional.md` **não foi revogada**. Para a proprietária: **pendência informa, não impede.** Transições controladas valem para o sistema e a equipe; override da proprietária permanece com motivo e `owner_override_events`. Só bloqueia de verdade: sem identidade / sem organização ativa.

## O que não contar como “feito”

Protótipo só visual; componente sem persistência; schema sem fluxo; endpoint sem UI; demo no lugar de produção; permissões só na UI; erro conhecido no fluxo central; requisito sem critério de aceite.

Relato de progresso deve dizer: o que foi implementado, em qual camada, quais entidades, qual evidência, o que falta, bloqueio, próximo passo concreto. Evitar “estrutura criada” / “quase finalizado” sem prova.

Print de homepage, login sem sessão, Vitest, build, PR verde ou declaração de agente **não** comprovam motor. Ver adendo de prova autenticada abaixo.

## Adendo vinculante — contexto não arquivável e prova autenticada (2026-09-10)

Texto integral: `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`. Registro vivo: `docs/relatorios/2026-09-11_registro-prova-autenticada.md`.

- O Clube Ancestral é **um produto**, não módulos soltos. A cadeia comercial → Discovery → Pessoa/Dossiê → Caso/Planejador → Pesquisa → Formalização/Financeiro → Entrega/App → Hoje/Radar precisa preservar a mesma identidade, fonte e próxima ação.
- Nenhum agente pode arquivar, reduzir a “histórico” ou declarar “já resolvido, pode arquivar” só porque existe código, PR, teste, migration, mockup ou log.
- Arquivamento só depois de `COMPROVADO_EM_USO` pela proprietária autenticada (`tati@pluggedresearch.com`), com prints **inicial, ação, confirmação, releitura** e, na cadeia, **integração**. Resultado: `PASSOU` / `FALHOU` / `BLOQUEADO_POR_DADO` / `BLOQUEADO_POR_DECISAO` / `ERRO_DE_FONTE` / `NAO_LOCALIZADO`.
- Este adendo **não** autoriza alterar dados, contratos, pagamentos, RLS, permissões, migrations, integrações, publicações, mensagens ou merges. Print complementa — não substitui — RLS, auditoria e persistência.
- “Seis áreas” no adendo mapeia para os **6 grupos vigentes** do Desk. As **7 abas** do App Cliente permanecem. O texto de **8 grupos** da memória permanente permanece **contexto ativo** até `COMPROVADO_EM_USO` — não arquivar, não restaurar como menu sem nova decisão.
- Contextos de resgate (Discovery, Pessoa 360, Pesquisa, formalização, Radar, App Cliente, RLS etc.) permanecem **ativos** até a prova integrada. Listar um documento como “arquivado” no inventário antigo **não** retira a continuidade.
- Checklist de PR: `docs/politicas/CHECKLIST-PR-CONTINUIDADE-PROVA.md`. Prints da sessão autenticada: `docs/provas/`.

## Recuperação (se o produto estiver fragmentado)

Núcleo canônico → motor de casos → planner ligado à próxima ação → timeline → documentos → permissões e portal → comunicação → dashboards a partir de dado real → legado só em trilha segregada → visual por último (P11). Não começar por página nova, Cockpit ou refinamento estético se o fluxo central não estiver provado.

## Antes de cada entrega, perguntar

Isto fortalece ou fragmenta o motor? Qual é a fonte de verdade? O planejador continua válido? Há legado tratado como operação atual? Há responsável, próxima ação e prazo? O perfil certo vê a informação? O fluxo fecha sem planilha/banco manual? Há persistência e teste? Falha é visível? O requisito original tem prova? Há prints autenticados da proprietária (inicial, ação, confirmação, releitura, integração) no registro vivo, ou o resultado é `BLOQUEADO_*` / `NAO_LOCALIZADO`?

## Artefatos 005–010 (verificados contra o repo em 2026-09-10)

Destilado operacional dos uploads CA-MOCKUP-007, CA-FICHAS-009, CA-PENTE-FINO-010, CA-FECHAMENTO-PR85-006 e CA-ENTREGA-REAL-005. Complementam as seções acima; não criam memória paralela.

### App Cliente — fidelidade ao mockup (007)

Nav de primeiro nível: **exatamente 7 abas**, nesta ordem e com estes rótulos:

`Home` · `Jornada` · `Radar` · `Árvore` · `Documentos` · `Legado` · `Conta`

**Não** colocar `Entregas`, `Fase 01` ou `Fase 02` na barra do cliente. Entregas são conteúdo (Documentos / Jornada / Home) quando publicadas; Fase 01/02 são entregáveis, não abas. Rotas profundas podem existir até arquivamento explícito — não são navegação aprovada. Proposta, Faturas e Mensagens também não são aba de primeiro nível (bloco em Conta / Home-Jornada / Atendimento).

Critério: rota existir ou a tela carregar **não** é alinhamento. Placeholder genérico não é aceite. Estado vazio deve ser específico da aba. Desk publica e despublica (autor, data, caso, estado) sem SQL manual. Cliente A só vê conteúdo publicado próprio. Não inventar conteúdo genealógico nem expor dado interno ou de outro cliente.

Código atual (`portal-shell.tsx`, `portal-navegacao.ts`) ainda injeta Entregas/Fase 01/02 quando “aplicáveis” e `PORTAL_ROTAS_SPEC` lista 10 telas — **dívida**, não autorização. Outro agente nesta branch corrige `src/`; não expandir essa nav.

### Desk — fichas e mockups (009)

Oito superfícies distintas, ligadas por IDs — não formulários duplicados da mesma entidade: Pessoa 360, Núcleo 360, Lead/Discovery, Caso 360, Pesquisa/Genealogia 360, Contrato/Formalização/OS, visão admin do App Cliente, Desk em 8 grupos.

Menu vigente = 6 grupos (adendo). O texto de 8 grupos desta ficha permanece contexto ativo até `COMPROVADO_EM_USO` — não arquivar.

Seis blocos = composição de trabalho, não substituição de navegação. CA-UX-04: Marketing explícito; Administração = utilidade no menu da conta. Protótipo histórico fora do runtime. App Cliente = projeção autorizada dos mesmos objetos canônicos, não um segundo banco.

Visual normativo: mockup de **17 páginas**. PDF de auditoria de **47 páginas**, PDF de distorção/comparação visual e relatórios de pente-fino visual = **auditoria**, não briefing de redesign. Nenhuma migration/merge/deploy de produção sem autorização explícita. Homologação só com dado sintético reversível.

### Motores, planejadores, skills, dumps (010)

Um item só é **entregue e operável** se existir, ao mesmo tempo: (1) fonte/evento de entrada, (2) escritor real no servidor ou UI, (3) persistência, (4) consumidor no Desk ou App, (5) rota/CTA acessível, (6) teste com reload ou consulta persistida. Documento, migration, função, tipo, teste unitário, dump, seed, branch, PR, build ou rota isolada **não** são aceite.

Cruzar escritores em `src/lib` (`*.functions.ts` / `*.server.ts`) com `src/integrations/supabase/types.ts` **e** `CHECK`/`CONSTRAINT` em `supabase/migrations/`. `types.ts` tipa muitas colunas restritas como `string` — isso **não** autoriza vocabulário novo.

Vocabulário CHECK verificado (gravar só estes; não inventar sinônimo):

- `status_pesquisa`: `a_confirmar`, `pendente`, `hipotese`, `provavel`, `com_suporte`, `confirmado`, `refutado`
- `evidences.workflow_status`: `recebida`, `registrada`, `em_revisao`, `divergente`, `insuficiente`, `requer_complemento`, `requer_retificacao`, `requer_traducao_apostila`, `rejeitada_inaplicavel`, `aprovada_para_entrega`, `publicada`
- `case_plans.fase_jornada`: `aceite_e_formalizacao`, `onboarding`, `pesquisa_inicial`, `pesquisa_e_validacao`, `preparacao_documental`, `protocolo_e_acompanhamento`, `reconhecimento`, `pos_reconhecimento`
- `client_visibility`: `interna`, `sanitizada`, `aprovada`

Drift já no código (não “corrigir” inventando CHECK): `pessoas-linhagens.ts` oferece `em_pesquisa` / `descartado`; `jornada-pos-gates.ts` faz fallback `not_started`; aliases de leitura (`fase_2_pesquisa`) só via de-para, nunca como valor gravado; trigger antigo cita `validada_internamente` / `aprovada_para_entrega_cliente`, que **não** estão no CHECK atual de `evidences`.

Conectar peça órfã existente antes de criar arquitetura paralela. Não apagar sem classificação, dependência, arquivamento e reversão. Isto é distinto da proibição de prefixo `CHECK-*` em IDs de requisito (prompts antigos): são duas regras, ambas válidas.

### PR #85 e entrega real ADMIN + cliente (006 + 005)

A PR #85 foi **mesclada** em 2026-09-05 (`Desbloqueio operacional real: App Cliente, Comercial e correção de bugs de causa raiz`). Não regredir esses fechamentos.

Preservar o escritor `confirmarDocumentosMinimos` → `crm_casos.documentos_minimos_ok` (o gate do portal consulta esse campo). Distinguir erro de leitura vs estado vazio **não** prova CRUD. TypeScript, Vitest, build e preview **não** substituem prova autenticada na UI.

Acesso cliente: fluxo oficial (e-mail autorizado, convite/magic link, login sem staff). Nunca colar ou pedir `service_role` em chat/GitHub/artefato. Isolamento A×B só é SIM com dois clientes/logins; prova estrutural de RLS ≠ prova de UI. Homologação: dado sintético reversível, nunca dado real.

Merge/deploy irreversível só com autorização explícita da Proprietária, informando branch, SHA e se o merge dispara produção. Sem essa resposta, não mesclar.

### Proteções (todos os artefatos)

Não remover: RLS/isolamento, LGPD e consentimento, representação de menor, histórico/auditoria, canônicos, contrato assinado, evidência para achado confirmado, bloqueio de exclusão física crítica.
