# P24 — Caso 360: taxonomia fixada de 8 seções (2026-09-26)

```yaml
status: executado
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Adicione e execute caso 360 Visão · Jornada · Pessoas · Pesquisa · Documentos ·
  Formalização · Financeiro · Histórico"
```

## O que existia antes desta rodada

Caso 360 (`casos.$caseId.index.tsx`) já era uma página única com um índice fixo (`SECOES`) e 6
seções endereçáveis (`visao`, `comercial`, `tecnico`, `pessoas`, `jornada`, `log`) — decisão de
2026-08-27/09-09 preservada, nenhuma removida ou fundida nesta rodada também.

Achado de bug antes de qualquer execução: os rótulos de duas seções estavam **trocados**.
`{ id: "visao", rotulo: "Histórico" }` — mas o conteúdo real de "visao" é "Indicadores"; e o
histórico de verdade (histórico de fases + registro de alterações) vive na seção `log`, que
estava rotulada "Dados técnicos e validações" no índice. Corrigido: `visao` → "Visão"; `log` →
"Histórico".

## Mapeamento dos 8 nomes pedidos

| Nome pedido | Seção real | O que mudou |
|---|---|---|
| Visão | `visao` | Só o rótulo (estava "Histórico" por engano) |
| Jornada | `jornada` | Nada — já existia com esse nome |
| Pessoas | `pessoas` ("Pessoa e família") | Nada |
| Pesquisa | `tecnico` | Renomeada — conteúdo (país/via preliminar, hipótese, riscos, Ficha Piloto) já era pesquisa/diagnóstico preliminar |
| Documentos | **nova** | Seção nova — lê `qDocumentos` (já carregado nesta mesma tela), lista completa com categoria/status/data, link para gestão completa em `/pesquisa-evidencias/$caseId` |
| Formalização | `comercial` (antes "Jurídico") | Renomeada — conteúdo (eixo comercial, formalização/onboarding, validação jurídica, ponte para contrato/matriz/OS) já era formalização |
| Financeiro | **nova** | Seção nova, só leitura — lê `qFinanceiro` (já carregado), mesmos campos do resumo executivo, sem botões de ação |
| Histórico | `log` | Só o rótulo (estava "Dados técnicos e validações") |

Nenhuma tabela, rota, escritor ou query nova. As duas seções novas reaproveitam exatamente os
hooks (`qDocumentos`, `qFinanceiro`) já carregados no topo do componente para o resumo
executivo — mesmo dado, mesma fonte, sem duplicar fetch.

## Decisão deliberada: não reordenar o DOM

O índice (`SECOES`) agora segue exatamente a ordem que você pediu. A ordem física em que as
seções aparecem na página ("Ver página completa") continua a mesma de antes
(`visao, comercial, tecnico, pessoas, jornada, documentos, financeiro, log`), porque mover os 5
blocos originais — alguns com formulários de pagamento/cobrança cujo estado (`rascunhoPagamento`/
`rascunhoCobranca`) é compartilhado com outra parte da página — foi avaliado como risco
desproporcional para um ajuste de navegação, numa página que eu não posso verificar visualmente
nesta sessão. O clique em qualquer item do índice continua levando à seção certa (mecanismo de
foco por `secaoFoco`, testado); só a ordem de rolagem no modo "ver tudo" não bate 1:1 com a ordem
do índice. Se você quiser essa reordenação física também, é um corte à parte, que eu faria com
mais cautela (um bloco por vez, testado isoladamente).

## Financeiro: leitura, não uma segunda ação

A nova seção "Financeiro" é deliberadamente só leitura — os botões "Registrar pagamento" e
"Preparar cobrança" continuam existindo só no resumo executivo (topo da página), para não criar
"uma segunda CTA para a mesma função" (regra já registrada no Product Knowledge). A nova seção
existe para dar a "Financeiro" um lugar endereçável pelo índice, como você pediu.

## Verificação

`tsc --noEmit` limpo. Teste novo (`p24-caso360-taxonomia-8-secoes-2026-09-26.test.ts`: 5 testes —
os 8 rótulos exatos e na ordem certa, bug de mislabel corrigido, Documentos/Financeiro sem query
nova, Financeiro sem CTA duplicado). 3 testes pré-existentes atualizados para refletir 8 seções em
vez de 6, sem perder nenhuma verificação de conteúdo (`ca04-caso360-simples.test.ts`,
`caso-360-pagina-unica.test.ts`, `fidelidade-visual-2026-09-23.test.ts`). Suíte completa: mesma
baseline pré-existente (7 arquivos/11 testes falhos, visuais/portal, sem relação com este corte).
`vite build` limpo.

## Prova Lovable pós-push

Abrir qualquer Caso 360 → o índice fixo no topo mostra exatamente: Visão · Jornada · Pessoa e
família · Pesquisa · Documentos · Formalização · Financeiro · Histórico → clicar em "Documentos"
mostra a lista de documentos do caso com link para a gestão completa → clicar em "Financeiro"
mostra o resumo financeiro (sem botões de ação) → clicar em "Histórico" mostra o histórico de
fases e o registro de alterações (antes rotulado incorretamente).
