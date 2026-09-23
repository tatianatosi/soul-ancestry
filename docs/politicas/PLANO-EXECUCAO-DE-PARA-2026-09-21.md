# Plano de execução do De-Para — revisão detalhada (2026-09-21)

Companheiro de `DE-PARA-COMPLETO-APP-DESK-2026-09-21.md`. Este arquivo diz
**o que já foi executado, com SHA**, o que falta, e o que está bloqueado e
por quê. Não é um segundo De-Para: a autoridade continua sendo o mockup de
17 páginas para composição visual e as regras aprovadas para cálculo (§29).

## Autoridade, como a Proprietária fixou

O mockup **rege** e é regra, para App **e** Desk. Onde o PDF for literal
demais ou estiver atrás das páginas vivas, bom senso resolve o detalhe — o
que não autoriza redesenhar navegação, inventar número nem criar terceira
interpretação. Divergência entre mockup, De-Para e dado real se **registra**,
não se resolve por conta própria.

### Correção de rumo — 23/09/2026 (autorização explícita da Proprietária)

Três fatos corrigidos neste documento, por instrução direta:

1. **A2 Jornada já tem as duas colunas paralelas** (LINHA ANCESTRAL × LINHA
   DO PROCESSO, com "Momentos de União"), commit `435f8c74`. A linha
   "Jornada — linha do processo" na tabela de divergências abaixo descrevia
   um estado anterior (linha única de 8 fases) — **não reimplementar**; ver
   correção na própria linha.
2. **Auditoria jurídica não é reaberta**: contratos vigentes e os 8 temas
   jurídicos aprovados (migration `20260909001500_popula_regras_juridicas_pdf_marcos_juridicos.sql`,
   reconstruída/reaplicada em 23/09) estão fechados. D11 (Jurídico &
   Contrato) é tratado como publicado nesta revisão — não é escopo de novo
   corte sem autorização específica e nova.
3. **A numeração D8/D9/D10/D11 (e qualquer Dn neste ou em outro documento)
   nunca é fonte de verdade.** Ela é só índice de leitura desta tabela —
   documentos diferentes desta mesma sessão já numeraram o mesmo módulo com
   números diferentes (ex.: "Financeiro" apareceu como D9 em um relatório e
   D10 aqui; "Pessoas & Famílias" apareceu como D10 em um e D12 aqui). Onde
   a numeração conflitar com o **nome do módulo** ou a **rota real**, o nome
   e a rota vencem, sempre.

## Divergências registradas nesta rodada

| Onde | Mockup 17p | De-Para | Dado real | O que foi feito |
|---|---|---|---|---|
| Home — progresso | "Progresso da jornada 65%" + stepper de 5 (Diagnóstico→Pesquisa→Reconstrução→Validação→Entrega) | §3 linha 2: barra de progresso + nome da etapa; "o que fica oculto": veda percentual inferido | 8 fases no CHECK `case_plans_fase_chk` | Barra preenchida pela posição real; valor à direita é "Etapa N de 8", não percentual. Nenhum de-para 8→5 foi inventado |
| Jornada — linha do processo | duas colunas: LINHA ANCESTRAL × LINHA DO PROCESSO (Kickoff→Requerimento final) | §4 linha 2: linha horizontal de 4 (Início, Pesquisa, Conferência, Entrega) | as mesmas 8 fases | **Corrigido em 23/09 (`435f8c74`)**: o mockup visual vence o texto do §4 — duas colunas paralelas reais (histórico × processo), "Momentos de União" como conector. Não é mais linha única; não reabrir |
| Hoje — Decisões do dia | 6 (demonstrativo) | §11 linha 2: contagem clicável e reconciliada; linha 3 exemplifica 4 decisões | `filaDeAprovacoes` classifica achado/proposta/contrato | Número = pendentes da fila; card "Decisões prioritárias" lista os mesmos itens |

### Dívida declarada, não escondida

- **Duas das quatro decisões de §11 linha 3 não estão na fila de aprovações.**
  "Liberar pesquisa" é `registrarLiberacaoExterna` (`pesquisa/modulo.tsx`);
  "Confirmar documento mínimo" é `confirmarDocumentosMinimos` sobre
  `crm_casos.documentos_minimos_ok`. Nenhuma foi renomeada para caber na
  contagem. Entram quando entrarem pela função pura, não por soma na tela.
- **`portal_casos` perdeu `security_invoker`.** A migration `20260822232251`
  o tinha ligado; o `create or replace ... with (security_barrier = true)` de
  `20260827151500` substituiu as reloptions e o derrubou. Restaurá-lo exigiria
  policy de portal em `case_plans` (hoje só `is_org_member`) — alteração de
  RLS, fora de qualquer autorização recebida. O gate efetivo continua sendo
  `portal_caso_permitido(id)`. **Decisão da Proprietária pendente.**
- **`GRUPOS_DESK` tem 6 grupos; a memória permanente cita 8; o mockup mostra 7
  itens de Desk.** As três leituras permanecem ativas até `COMPROVADO_EM_USO`.
  Nenhuma aba nova foi criada.

## Fila — App Cliente

| # | Aba | Estado verificado contra `origin/main` | SHA |
|---|---|---|---|
| A1 | Documentos — caixa de envio, checklist, entregas | **Publicado**; `enviar-documento.tsx` liga `prepararEnvioDocumento`/`confirmarEnvioDocumento`, que existiam e só a rota profunda chamava | `1558d49c` |
| A2 | Legado — Biblioteca / Seus Achados + card de plano | **Publicado**; `legado.tsx` já traz Biblioteca, Coleção e o nível Premium derivado de entregas reais | — |
| A3 | Conta | **Publicado** | — |
| A4 | Árvore — G1–G5, teto 31 | **Publicado**; estrutura G1–G5 presente, sem inventar pessoas | — |
| A5 | Radar — 6 dimensões com percentual | **Publicado**; o cálculo por dimensão já existia (`rotuloNumero`), e a frase "Desk usa 4 eixos" saiu do DOM do cliente | `3dde5575` |
| A6 | Home — etapa atual e barra de progresso | **Publicado** — destravado pela extensão autorizada de `portal_casos` | `3ba7a0ca` |
| A7 | Jornada — linha do processo com etapa ativa | **Publicado**; substituído por duas colunas paralelas (Ancestral × Processo) por correção de rumo direta da Proprietária, 23/09 | `3ba7a0ca` → `435f8c74` |

**Composição do caso** (individual / casal / núcleo familiar) entrou na Home
com A6: `case_plans.composicao` chega sanitizado como "Caso individual" /
"Caso do casal" / "Caso da família". Valor fora de `COMPOSICOES` não vira
rótulo inventado.

## Fila — Desk (11 contextos dentro dos 6 grupos vigentes)

Nenhum destes cria aba. São views dentro de `GRUPOS_DESK`.

| # | Contexto | Rota real | De-Para | Estado |
|---|---|---|---|---|
| D1 | Hoje — 4 KPIs clicáveis | `/painel` | §11 | **Publicado** (`3dde5575`) |
| D2 | Hoje — Decisões do dia + Decisões prioritárias | `/painel` → `/golive/aprovacoes` | §11 linhas 2-3 | **Publicado** (`0b606d16`) |
| D3 | Hoje — cadência, funil, alertas, ritmo, prioridades | `/painel` | §11 linhas 5-11 | **Publicado** (`270e16f0`) |
| D4 | Comercial / CRM Vivo | `/calls`, `/leads` | §12 | **Publicado** (`666eef36`, `3f812483`) |
| D5 | Kanban operacional | `/ops` | §13 | **Publicado** (`82ffdaf9`) |
| D6 | Caso 360 | `/casos/$caseId` | §14 | **Publicado** — Estado Integrado + Cadência (`784002a1`) |
| D7 | Pessoas 360 | `/pessoas/$clienteId` | §15 | **Publicado** (`44df0a4b`) |
| D8 | Radar & Matrizes — 4 eixos internos | `/qualidade` | §16 | **Publicado** — rename (`d997c80b`) + Lista de situação (`784002a1`) |
| D9 | Pesquisa + Biblioteca Mestre | `/pesquisa-modulo`, `/biblioteca` | §17-18 | **Publicado** (`e21d09b9`, `9280aa09`) |
| D10 | Financeiro | `/financeiro` | §19 | **Publicado** (23/09) — Resumo do período, Obrigações e Evolução com EstadoVazio honesto onde a fonte não sustenta |
| D11 | Jurídico & Contrato | `/contratos`, `/matriz-juridica` | §20 | **Publicado** (batches 17-20) — contratos vigentes e 8 temas jurídicos aprovados; **não reabrir auditoria jurídica** |
| D12 | Pessoas & Famílias | `/nucleos` | §21 | **Publicado** (`22a4d7bd`) |
| D13 | Portal interno + Configuração/Acesso | `/acessos-portal`, `/configuracoes` | §22-23 | **Publicado** — Fila editorial em Portal interno (`784002a1`) + as 5 zonas de Configuração & Acesso em `/equipe` (23/09) |

**Os dois radares não se misturam**: Desk usa 4 eixos internos (prioridade,
urgência, elegibilidade, sinais); App usa 6 dimensões públicas. §16 e o kit
dizem o mesmo. A distinção é real; o que não podia era vazar a frase para o
DOM do cliente.

## Rota `/golive`

Mantida como está para o go-live, por decisão explícita da Proprietária. As
contagens do Hoje abrem exatamente essas telas — é de onde vem a
reconciliação exigida por §11.

## Como cada corte é executado

Worktree limpo de `origin/main` → implementar contra o mockup e o De-Para →
`tsc --noEmit` → teste focado de comportamento → `vitest run` completo
comparado à baseline estável (**6 arquivos / 7 testes**, conferindo os
**nomes**, não a contagem) → `vite build` → `git status --short` →
commit → `git push origin HEAD:main`.

Onde o número não tiver regra publicada, o elemento aparece sem número
inventado. Onde a regra existir em função já consumida por outra tela, a
tela nova chama a mesma função — nunca reimplementa o critério.

## Prova visual

`PROVA_VISUAL_AUSENTE` em tudo que muda UI. Sem credencial Supabase nesta
sessão e com o MCP exigindo OAuth interativo, não há prints desktop/375 px.
Nenhum corte acima está declarado `COMPROVADO_EM_USO`.
