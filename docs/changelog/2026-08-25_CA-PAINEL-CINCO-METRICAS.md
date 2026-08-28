# Painel Hoje — cinco métricas de decisão e fim da contagem concorrente

**Data:** 25/08/2026 · **Norma aplicada:** CA-UX-02 §6 e §7 · CA-UX-03 §1

## Por que

A Proprietária relatou, ao usar o Desk: *"listas e mais listas, nada de
sistemas funcionando entre si, nada de cadência"*.

O cotejo do Painel Hoje contra o CA-UX-02 — documento de decisão que ela
aprovou em 23/08 e que foi recuperado em
`docs/evolucao/recuperados/prompts-lovable/` — mostrou que a queixa tem
tradução normativa exata. Duas divergências são conformidade pura, sem nada
a decidir:

1. O §7 define **cinco** métricas principais para o grupo Visão geral. O
   código declarava **oito**, e faltavam justamente as duas mais decisórias.
2. O §7 proíbe contagem concorrente. Quatro dos oito cartões eram recontados
   mais abaixo na mesma tela.

Este changelog cobre só essas duas. A redução de blocos (§6: "somente cinco
blocos") e a Regra de cartão (§6) mexem em tela aprovada e dependem de
decisão da Proprietária — o §3.1 proíbe remoção silenciosa.

## O que mudou

### Cartões do topo: oito chaves de fila → cinco métricas de decisão

`CARDS_HOJE` (`src/lib/painel-dia.ts`) passa a ser exatamente a lista do §7:

| § CA-UX-02 §7 | Chave | Fonte |
| --- | --- | --- |
| vencidos | `acoes_vencidas` | fila do dia |
| vence hoje | `acoes_hoje` | fila do dia |
| sem responsável | `sem_responsavel` | `ItemDia.semResponsavel`, sobre todos os registros |
| exceções críticas | `excecoes_criticas` | registros distintos em `FILAS_BLOQUEIO` |
| SLA em risco | `sla_em_risco` | **sem fonte carregada** — declara ausência |

Três notas sobre o comportamento:

- **"Sem responsável" deixou de ser só de leads.** Antes era
  `leads_sem_responsavel`; a norma pede o indicador amplo, e a fonte
  (`ItemDia.semResponsavel`) já cobria caso e lead.
- **Nada se perdeu.** Os quatro cartões de bloqueio (contrato enviado,
  pagamento aguardado, onboarding pendente, documento aguardado) consolidam
  em "Exceções críticas" e continuam detalhados em Sinais de atenção e nas
  páginas canônicas. "Exceções críticas" conta **registro distinto**, não
  ocorrência: um caso travado em duas filas é uma exceção, não duas.
- **SLA em risco não mente.** A fonte é `tarefas.sla_status` /
  `ops_microentregas.prazo_status`, que a consulta do Painel Hoje ainda não
  carrega. `total` passou a ser `number | null` e o cartão exibe "Sem dados
  suficientes" em vez de `0` — ausência de fonte nunca vira "não há risco".

Os cartões passaram a usar `CardIndicador`, que já implementa essa regra. O
tom de cor só se aplica com valor maior que zero: contador zerado é boa
notícia e não aparece em vermelho.

### Bloco Comercial: contagem repetida → rótulo e link

O resumo financeiro exibia `X contrato(s) enviado(s) · Y pagamento(s)
aguardado(s)`, contando as mesmas filas dos cartões do topo. Pior: contava
via `itensNaoExibidos`, deduplicando contra as filas acima — então **exibia
um número diferente sob o mesmo nome**, na mesma tela.

Agora é rótulo e link para `/financeiro`, como o §7 manda ("outras telas usam
rótulo, recorte ou link, nunca uma contagem concorrente"). O helper
`itensFila`, que só servia a isso, saiu.

## Verificação

- `npx tsc --noEmit` — limpo
- `npx vitest run` — 1.300 testes verdes (139 arquivos)
- `npx vite build` — build de produção verde
- `npx eslint` — **nenhum erro novo**: `painel-dia.ts` 18 → 13,
  `painel-dia.tsx` 65 → 63 (os remanescentes são de formatação pré-existente)

Quatro testes novos em `painel-cards-filtros.test.ts` fixam a ordem canônica,
a ausência de recontagem, a contagem por registro distinto e o `null` do SLA.

## Não foi feito

Nenhuma migration, alteração de RLS, integração externa, cobrança,
assinatura, publicação ou deploy. Nenhuma tela, rota ou módulo removido.
