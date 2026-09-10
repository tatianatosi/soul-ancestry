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
5. Políticas aprovadas em `docs/politicas/` (autoridade operacional, fonte de verdade de design, taxonomia do mockup).
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

**Desk: exatamente 8 grupos** em `src/lib/navegacao-desk.ts` (`GRUPOS_DESK`), decisão vinculante. Não fundir, não criar nona aba, não voltar às 7 itens do mockup sem nova decisão da proprietária.

1. `hoje` — Visão Geral (`/painel`)
2. `marketing` — Marketing
3. `comercial` — Comercial
4. `casos` — Casos 360
5. `pesquisa` — Pesquisa
6. `contratos` — Contratos e financeiro (financeiro **não** é grupo separado)
7. `cliente` — Cliente / App
8. `governanca` — Biblioteca Mestre

Configuração, equipe e preferências ficam no **menu da conta**, não como 9º grupo.

A “hierarquia de telas” da memória permanente (planner, lista de casos, caso 360, pessoa, documentos, pesquisa, portal, admin) é **prioridade funcional**, não um menu novo.

**App Cliente canônico: 7 abas** (taxonomia do mockup de 17 páginas), em `src/components/portal/portal-shell.tsx`:

Home · Jornada · Radar · Árvore · Documentos · Legado · Conta

Rótulo da primeira aba no mockup e em `COPY_TELAS.casos.navegacao`: **Home** (não “Início”). O portal sanitiza: sem notas internas, hipóteses como fato, SKU, preço técnico, gates, dados de outros casos.

Abas extras condicionais (Entregas, Fase 01, Fase 02, Proposta) existem no código — dívida a declarar, não expansão silenciosa da taxonomia aprovada.

**Mockup vs produção:** o PDF de 17 páginas é normativo visual. O PDF de auditoria de **47 páginas** (`clube-ancestral-mockup-auditoria.pdf`) é complementar (conteúdo/estados/fluxos), **sem força normativa de design**. Produção tem 8 grupos operacionais; o mockup mostra 7 itens de Desk — divergência já decidida: manter os 8.

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

## Recuperação (se o produto estiver fragmentado)

Núcleo canônico → motor de casos → planner ligado à próxima ação → timeline → documentos → permissões e portal → comunicação → dashboards a partir de dado real → legado só em trilha segregada → visual por último (P11). Não começar por página nova, Cockpit ou refinamento estético se o fluxo central não estiver provado.

## Antes de cada entrega, perguntar

Isto fortalece ou fragmenta o motor? Qual é a fonte de verdade? O planejador continua válido? Há legado tratado como operação atual? Há responsável, próxima ação e prazo? O perfil certo vê a informação? O fluxo fecha sem planilha/banco manual? Há persistência e teste? Falha é visível? O requisito original tem prova?
