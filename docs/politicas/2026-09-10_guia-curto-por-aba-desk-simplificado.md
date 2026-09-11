# Clube Ancestral — Guia curto por aba

**Status:** vigente como checklist de conteúdo (10/09/2026).  
**Decisão da Proprietária:** as abas definem onde cada função vive; a Mesa de Discovery faz a entrada comercial funcionar; os KPIs do Hoje mostram o que está parado, vencido ou precisa de decisão.

Não apagar dados, rotas, componentes, migrations, RLS nem histórico nesta rodada. Recolher do fluxo diário o que é legado, DEMO, lista administrativa ou duplicidade. Nos demais lugares: só sinal e link para a origem.

## Três camadas

1. **Abas** — dona do dado. Trabalho completo mora em um único grupo.
2. **Mesa de Discovery** (`/calls`) — entrada comercial: dump, perguntas SPIN, próxima ação, handoff.
3. **KPIs do Hoje** — o que está parado, vencido ou pede decisão, sempre com link para a aba dona.

## Onde vive

| Se o item é… | Fica em… | Nos demais lugares… |
|---|---|---|
| Ação do dia | Hoje | Só resumo/link |
| Lead, Call, Discovery, proposta, conteúdo | Marketing & Comercial | Resumo em Hoje; ponte ao Caso após handoff |
| Pessoa, núcleo, jornada, tarefa, bloqueio de caso | Pessoas & Casos | Resumo em Hoje e links contextuais |
| Fonte, evidência, árvore, lacuna, achado | Inteligência & Pesquisa | Contexto no Caso; projeção autorizada ao cliente |
| Contrato, assinatura, condição, financeiro | Formalização & Financeiro | Bloqueio/status no Caso e em Hoje |
| Política, fórmula, RLS, integração, DEMO, legado | Governança & Administração | Nunca como operação diária |

## Recolher da operação diária

CA OPS, Matriz Operacional, Planilha Mestre, SKU/ranking legado, conciliação histórica e DEMO/local não orientam o dia. Continuam no repositório; no Desk entram só em Governança, rotulados como legado.

**Agora:** menu de Governança, grupo “Legado (fora da operação diária)”.  
**No pente fino:** essas rotas saem do Desk e vão para arquivo GitHub. Nada é apagado nesta rodada. Não tirar do menu antes do pente fino.

## Superfícies no código

| Camada | Onde está | O que não é |
|---|---|---|
| Abas | `GRUPOS_DESK` + `grupoDonoDaRota` | Painel de KPI paralelo, 7ª aba, segundo CRM |
| Mesa | `/calls` (Painel de Calls) | Checkbox SPIN, formulário longo, score de elegibilidade |
| KPIs | Painel Hoje (`/painel`) | Receita/conversão no topo, Planilha Mestre como operação |

URLs não mudam. Nada é apagado nesta rodada.
