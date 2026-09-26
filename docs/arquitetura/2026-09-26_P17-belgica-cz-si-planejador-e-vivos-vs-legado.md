# P17 — Bélgica/Tchéquia/Eslovênia no planejador + "vivos" vs "legado" (2026-09-26)

```yaml
status: executado
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Pode adicionar Bélgica e os demais países faltantes no planejador, faça uma
  varredura em relação aos casos 360 e uma das premissas mais importantes já colocado diversas
  vezes e que tudo vive no caso e portanto não será uma duplicação na mesa e os itens que estão
  vivos pode adicionar a tabela como vivos sem divergência já aqueles que já fazem e são parte
  da planilha mestre devem ser legado e cuidado como legado"
```

## 1. Bélgica reaberta, e a varredura encontrou 2 outros países realmente faltantes

No P12 eu tinha decidido não trazer a Bélgica (classificada `detection_only` no documento-fonte,
mesmo nível do backlog oriental). A Proprietária reabriu essa decisão explicitamente agora —
executado: trilha `TRK-BE-DESC` criada com o mesmo padrão conservador de sempre (conteúdo fino,
"Detecção de vínculo; backlog jurídico", nenhuma fonte legal afirmada como homologada).

A varredura pedida ("os demais países faltantes") encontrou, por comparação direta entre
`citizenship_tracks` (trilhas reais) e `planner_catalog_feed` (produtos-pai/catálogo-alimento):
**Tchéquia (CZ) e Eslovênia (SI) já tinham trilha jurídica real desde o P11, mas nunca tinham
entrado no planejador** — exatamente o mesmo tipo de gap que o P16 já tinha corrigido para
Países Baixos/Estônia/Letônia/Lituânia. Corrigido: 9 itens novos (3 fases × Bélgica/Tchéquia/
Eslovênia), mesmo padrão dos demais países. Conferido por consulta direta: **todo país com
trilha real agora tem item de planejador correspondente** — zero gaps restantes.

## 2. "Tudo vive no caso, não duplica na mesa" — confirmado, não presumido

Antes de tocar em Mesa Discovery/CRM Vivo, confirmei por leitura direta (não por suposição) a
premissa que a Proprietária reafirmou: `listarTrilhasJuridicas` (painel de calls) lê todas as
`citizenship_tracks` não arquivadas sem filtro de país — os novos Bélgica/Tchéquia/Eslovênia já
aparecem lá **sem nenhum código novo**, exatamente porque a trilha vive numa fonte única
(`citizenship_tracks`) e o painel de calls só a lê, nunca a copia. `planner_catalog_feed`
(produtos-pai) é um nível abaixo — só existe dentro do Caso 360, depois que o lead vira caso —
por isso não aparece (nem deveria aparecer) em Mesa Discovery. Isto não é uma lacuna: é a mesma
arquitetura de fonte única que a Proprietária pediu para confirmar.

## 3. "Vivos sem divergência" vs "legado" — critério objetivo, não arbitrário

A varredura dos 20 itens que estavam em `LEGADO_RECONCILIAR` (rótulo herdado de uma reconciliação
anterior, mas cada nota já dizia "Item real ativo") comparou cada código contra o catálogo real
(`product_catalog`, organização real `11f32aae-...`):

| Critério verificado | Resultado |
|---|---|
| `status_produto = 'ativo'`, sem `archived_at` | 19 de 20 confirmados (1 — `CA-CID-AT-001` — não tem linha própria em `product_catalog`, mas já é usado como referência real em `price_catalog_rescued`/`case_services`, mesmo padrão de `CA-CID-DE-001/002/003b`, que também não têm linha em `product_catalog` e já estavam `ATIVO_SEM_PRECO_HOMOLOGADO`) |
| Preço duplicado/conflitante dentro do catálogo real | Nenhum encontrado — cada código tem uma única linha na organização real |
| `status_homologacao = 'homologado'` **e** preço vigente definido | Só `CA-ASS-005` (R$1.825,00) |

Com isso, a reclassificação foi objetiva, não um "promover tudo":

- **`CA-ASS-005` → `ATIVO_HOMOLOGADO`** (único com homologação comercial completa e preço vigente).
- **Os 19 restantes → `ATIVO_SEM_PRECO_HOMOLOGADO`** (vivos, sem divergência, mas ainda sem
  homologação comercial fechada no catálogo real — `bloqueado`/`em_revisao`).

Resultado: `planner_catalog_feed` não tem mais nenhum item em `ESPECIFICACAO_PENDENTE` nem em
`LEGADO_RECONCILIAR` — só `ATIVO_HOMOLOGADO` (1), `ATIVO_SEM_PRECO_HOMOLOGADO` (81),
`CONDICIONAL_POR_CASO` (16, inalterado) e `ARQUIVADO_DECISAO_PROPRIETARIA` (1, `CA-CURSO-001`,
inalterado).

## 4. O que continua "legado" — intocado, por não ser "vivo sem divergência"

**Não reclassifiquei** as 6 linhas hoje `DIVERGENTE` em `price_catalog_rescued`/
`legacy_catalog_import` (3 conflitos de preço na Itália, 3 em Portugal) — são exatamente o
oposto de "vivo sem divergência": têm mais de uma referência incompatível, sem vencedor
confirmado. Continuam com `reconciliation_status='divergente_bloqueado'`, segregadas, exatamente
o "cuidado como legado" que a Proprietária pediu.

Também não toquei em `catalogo-homologacao.ts` (módulo de código mais antigo, achado no P16, que
ainda cita "Planilha Mestre" como fonte canônica) — confirmei que ele está **em uso real**
(`catalogo-homologacao.functions.ts` + `painel-catalogo.tsx`), não é código órfão. Decidir o que
fazer com um painel em produção exige investigação própria (o que ele mostra hoje, quem usa,
se conflita com `product_catalog`/`planner_catalog_feed`) — fica como corte separado, não
decidido às pressas dentro desta rodada.

## Verificação

`tsc --noEmit` limpo, teste novo (`p17-belgica-cz-si-e-reclassificacao-vivos-2026-09-26.test.ts`:
7 testes — trilha da Bélgica com conteúdo fino, 9 itens BE/CZ/SI corretos, idempotência, regra
de promoção baseada em dado real (não fixa), só toca `LEGADO_RECONCILIAR`, nunca mexe nas linhas
`DIVERGENTE`, lista os 20 códigos corretos), suíte completa idêntica à baseline, `vite build`
limpo. Migration aplicada ao banco real e registrada em `schema_migrations`.

## Prova Lovable pós-push

Em `/calls`, o dropdown "Trilha jurídica de referência" já lista Bélgica. Na lista-alimento/
catálogo do planejador, Bélgica/Tchéquia/Eslovênia aparecem com os 3 itens cada
(`ATIVO_SEM_PRECO_HOMOLOGADO`); os 20 itens antigos (Consultoria de Cidadania Italiana, Plano
Anual com Desconto — Memórias etc.) aparecem como ativos, sem o rótulo "legado" que carregavam
antes; as 6 divergências de preço Itália/Portugal continuam bloqueadas/segregadas.
