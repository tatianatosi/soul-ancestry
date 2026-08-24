# Auditoria aba a aba — dia do pesquisador e dia do cliente

**Data:** 24/08/2026 · **Pedido:** verificar lacunas remanescentes, checar se
ainda existe informação "contextual" (documentada mas não aplicada) entre as
abas do Desk, e revisar aba a aba o que pode entrar no dia a dia do
pesquisador (grupo Pesquisa) e do cliente (grupo Cliente).

## O que foi aplicado nesta rodada

| Aba | Arquivo | O que faltava | O que foi adicionado |
| --- | --- | --- | --- |
| Pesquisa → `/pesquisa` (Plano de ação e ficha genealógica) | `src/routes/_authenticated/pesquisa.index.tsx` | Lista de casos sem nenhum resumo do dia; pesquisador precisava abrir cada caso para saber se tinha via/país definidos | 4 `CardIndicador`: casos em pesquisa, casos ativos, sem via jurídica definida, sem país definido |
| Cliente → `/atendimento` (Atendimento e solicitações) | `src/components/portal/atendimento-interno.tsx` | Painel ia direto para o seletor de caso e formulário; nenhum resumo do que precisa de ação hoje | 4 `CardIndicador`: envios pendentes de revisão, solicitações abertas, tickets abertos, faturas aguardando liberação |

Ambos seguem o padrão já usado em Casos/Pesquisa-módulo/Acessos-portal/Equipe
nesta mesma sessão: `valor={q.data ? ... : null}`, nunca estimativa, "Sem
dados suficientes" quando não há dado. `tsc --noEmit` limpo, suíte completa
(1210/1210) verde após a mudança.

## Lacunas remanescentes identificadas (não aplicadas nesta rodada)

### 1. `desk-modulos.ts` está desatualizado em relação à navegação real

`src/lib/desk-modulos.ts` (CA-UX-01.2) e a tela
`/governanca/modulos-contextuais` usam uma taxonomia de **7 telas**
(`overview, crm, casos, checklist, juridica, biblio, alertas`) que antecede a
navegação real de **8 grupos** hoje em `src/lib/navegacao-desk.ts`
(CA-UX-03: Hoje, Marketing, Comercial, Casos, Pesquisa, Contratos e
financeiro, Cliente, Governança). Consequência prática: **Pesquisa, Cliente,
Marketing e Contratos e financeiro não têm entrada nenhuma** no catálogo de
módulos contextuais — a tela de governança que deveria mostrar "o que é
operacional, métrica, duplicado ou a confirmar" simplesmente não cobre essas
quatro abas do menu atual. Isso não foi corrigido aqui porque é uma decisão
de reconciliação de dois modelos de navegação, não uma lacuna de UI simples.

### 2. `ale-rascunhos` — Rascunhos de comunicação: lógica real, zero superfície

`src/lib/desk-modulos.ts:137` já marca isso como
`estadoReal: "catalogado, sem superfície implementada"`. Confirmado:
`src/lib/fila-comunicacao.ts` tem uma função pronta e seguríssima
(`montarFilaHumana`) que calcula sugestões de contato em rascunho — nunca
envia nada — mas **não existe nenhuma rota nem painel** que liste essas
sugestões individualmente. Hoje ela só aparece como dois números agregados
no Painel Hoje (`comunicacao_critica` / `comunicacao_hoje`,
`painel-dia.tsx:307-337`), sem link para nenhum lugar que mostre *quais*
contatos são esses. Isto é um gap real, mas construir a superfície exige
uma função de servidor nova que junte lead/caso real a cada gatilho — não
fiz isso especulativamente; fica registrado para decisão.

### 3. `/relatorios` está genérico, mas o menu promete "Achados, microentregas e relatórios F1/F2"

`src/routes/_authenticated/relatorios.tsx` mostra 4 blocos agregados
genéricos (casos por status/via, evidências por status, tarefas por
prioridade) — útil, mas não é especificamente "achados, microentregas e
relatórios F1/F2" como o rótulo do menu promete (`navegacao-desk.ts`, grupo
Pesquisa). Mesmo padrão de descompasso nome-do-menu × conteúdo-da-tela já
documentado na Fase D desta sessão para outros grupos; não fiz alteração
porque não foi pedido "corrigir", só mapear.

### 4. `/evidencias` e `/fontes-genealogicas` não têm resumo do dia

Ambas usam listas ricas (uma via `EntidadeCrud` genérico, outra com contagem
textual inline em `fontes-genealogicas.tsx:187-188`), mas nenhuma tem um
`CardIndicador` de estado do dia (ex.: evidências pendentes de validação,
fontes com termo a confirmar). Não apliquei cards aqui porque `evidencias.tsx`
usa `EntidadeCrud`, que busca dados internamente sem os expor à rota — dar
um card exigiria uma query extra dedicada só para contagem, o que é possível,
mas é uma decisão de escopo (duplicar leitura) que prefiro que a Proprietária
confirme antes.

## Nada de "informação contextual" perdida encontrada além do já mapeado

Reconferi a classificação CA-UX-01.3 completa (`contarPorTipo()` em
`desk-modulos.ts`): dos módulos catalogados, **apenas dois** têm
`estadoReal: "catalogado, sem superfície implementada"` — `bib-templates-com`
(intencional: aponta para a Biblioteca de Mensagens como fonte única, não é
lacuna) e `ale-rascunhos` (item 2 acima, lacuna real). Todos os outros itens
"a confirmar" (12 no total) já têm painel/subrota existente dentro da tela
principal — a etiqueta "a confirmar" nesses casos é sobre a **fonte de
dado**, não sobre existência de UI.
