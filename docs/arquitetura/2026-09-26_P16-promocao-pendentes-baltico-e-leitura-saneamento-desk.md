# P16 — Promoção dos pendentes, Bálticos no planejador, e leitura do saneamento do Desk (2026-09-26)

```yaml
status: parte executada (promoção + Bálticos); parte investigada, 1 decisão pendente antes de agir
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Verifique se foi criado a tabela com os skus pedidos novos e seus preços
  verifique quais estão pendentes se for as que estão e foram enviadas agora pode já sair do
  estado que estão pois serão usadas e o mesmo equivale para cada países báltico não trazido
  para o planejador e produtos pai peço que leia atentamente o que consiste o caso 360, a
  função do novo motor de raciocínio, e o papel que todas essas informações terão no Crm vivo
  no painel de calls e veja que lá tem muitas tabelas como listas base que deve ser incorporado
  ao sistema e aqueles como catálogo skus divergência è homologação skus antigos levar para o
  legacy no sentido que será limpo e sair da linha sem rota de volta reveja sobre o saneamento
  do desk"
```

## Parte 1 — executada: os 36 pendentes saem do estado que estavam

Verificado ao vivo: `planner_catalog_feed` tinha **36 itens `ESPECIFICACAO_PENDENTE`** — os 30
códigos `CA-CID-XX-00N`/`CA-NAT-XX-00N` (Croácia, Portugal, Espanha, Polônia, Romênia,
Áustria-002/003, Luxemburgo, Hungria, Irlanda, naturalização BR/FR) criados no P9/P13, mais os 6
`CA-GEN-MULTI-00N` do P6/P9.

Promovidos para `ATIVO_SEM_PRECO_HOMOLOGADO` — **o mesmo estado já usado hoje para os itens reais
da Alemanha** (`CA-CID-DE-001/002/003b`) e `CA-HIST-001/005`, ou seja, não é um estado inventado
para esta rodada: é o degrau já existente entre "especificação" e "catálogo homologado com
preço". Nenhum preço foi fabricado, nenhum link Asaas criado, nenhuma homologação comercial
declarada — exatamente como a regra de preços do prompt exige ("não estimar" para Luxemburgo/
Hungria/Irlanda).

Migration: `supabase/migrations/20260926120000_promove_pendentes_e_baltico_no_planejador.sql`.

## Parte 2 — executada: Bálticos e Países Baixos trazidos ao planejador/produtos-pai

Confirmado o mesmo tipo de gap que a Proprietária apontou: os 4 países do dedup do P12 (Países
Baixos, Estônia, Letônia, Lituânia — tier `legal_research_pilot` do documento-fonte) tinham
trilha jurídica real (`citizenship_tracks`) mas **nunca tinham entrado em `planner_catalog_feed`
nem em nenhum produto-pai** — zero itens de catálogo/orquestração para eles. Corrigido: 12 itens
novos (3 fases × 4 países — Diagnóstico F1, Pesquisa/prova F2, Acompanhamento F4), mesmo padrão
já usado para Croácia/Portugal/Espanha/Polônia/Romênia/Hungria/Irlanda/Luxemburgo, já nascendo
`ATIVO_SEM_PRECO_HOMOLOGADO`. Bélgica continua fora — decisão do P12 (`detection_only`), não
revista aqui.

## Parte 3 — leitura atenta: Caso 360, motor de raciocínio, CRM Vivo/painel de calls

Lido diretamente o código (não resumo):

- **`citizenship_tracks` já alimenta o painel de calls automaticamente.**
  `listarTrilhasJuridicas` (`src/lib/trilhas-juridicas.functions.ts`) lê todas as trilhas não
  arquivadas, sem filtro de país — os 4 países bálticos e o dedup do P12 já aparecem no dropdown
  "Trilha jurídica de referência" da Mesa Discovery **sem precisar de nenhum código novo**. Desde
  o corte 6 do reset (24/09), `aplicarAchado` já liga automaticamente a trilha do país aceito na
  varredura de WhatsApp ao campo `trilha_referencia_id` do lead, sem sobrescrever escolha humana.
- **O motor de raciocínio por fase (`raciocinio-juridico-jornada.ts`, P12) opera sobre
  `case_plans.fase_jornada`** — um dado que só existe depois que o lead vira caso e o Planejador é
  preenchido. Mesa Discovery trabalha com **leads**, antes desse estágio. Portanto o motor por
  fase correto continua vivendo só em Caso 360 (onde já está, desde P12) — replicá-lo em Mesa
  Discovery duplicaria lógica sobre um dado que ainda não existe naquele estágio. Não fiz essa
  duplicação.

## Achado crítico — antes de tocar em "saneamento"/"legacy sem rota de volta"

Fui ler exatamente o que a Proprietária pediu ("tabelas como listas base", "catálogo skus
divergência e homologação", "skus antigos") e encontrei duas coisas que mudam a ação segura:

1. **Os 20 itens hoje em `LEGADO_RECONCILIAR` em `planner_catalog_feed` NÃO são SKUs antigos/
   descontinuados** — são o oposto: `CA-CID-001/002/009/019/020/021/023`, `CA-CID-AT-001`,
   `CA-ASS-001/004/005`, `CA-COMBO-001`, `CA-HIST-004/006`, `CA-IND-001/002/005/006`,
   `CA-MEM-003`. Cada linha traz a nota `"Item real ativo"` — são produtos **vivos, vendidos
   hoje**, pendentes apenas de reconciliar sua ligação ao produto-pai/documentação, não de
   arquivamento. Tratá-los como "legado a limpar, sem rota de volta" arquivaria produtos
   comerciais reais em uso — um erro grave e exatamente o tipo de ato irreversível que estas
   instruções pedem para confirmar antes de executar.
2. **Achei uma peça real de "saneamento do desk" pendente, distinta dos 20 itens acima**:
   `src/lib/catalogo-homologacao.ts` é um módulo de governança **mais antigo**, que ainda declara
   textualmente *"A fonte canônica é o catálogo de produtos"* e cita explicitamente a "Planilha
   Mestre de Produtos" como a fonte — o mesmo vocabulário que o `AGENTS.md` hoje classifica como
   legado, não fonte de runtime. Ele mantém um dicionário estático embutido no código
   (`DECISOES_INICIAIS`) com decisões de homologação para só 3 SKUs (`CA-CID-006`, `CA-MEM-003`,
   `CA-HIST-005`), nunca reconciliado com `product_catalog`/`planner_catalog_feed` reais.
   Isso **é** dívida de saneamento real — mas descobri isso só agora, e "limpar sem rota de
   volta" ainda precisa de uma decisão específica sobre O QUE fazer com este módulo (arquivar o
   arquivo? migrar as 3 decisões para `product_catalog`? as duas coisas?), não algo para eu
   decidir sozinho dado o peso da frase "sem rota de volta".

## Pergunta que preciso que você responda antes de arquivar qualquer SKU

Não toquei em nenhum item de `LEGADO_RECONCILIAR` nem apaguei/arquivei nenhum SKU — os 20 itens
lá são produtos reais em uso, não lixo. Para eu executar o "saneamento... sem rota de volta" com
segurança, preciso que você aponte **quais SKUs ou divergências específicas** devem sair da
linha ativa e ir para legado — por exemplo:

- As 6 linhas hoje marcadas `DIVERGENTE` em `price_catalog_rescued`/`legacy_catalog_import`
  (3 conflitos de preço na Itália, 3 em Portugal)?
- O módulo `catalogo-homologacao.ts` (código antigo, vocabulário "Planilha Mestre")?
- Algum código de SKU específico que você já sabe estar descontinuado e que eu ainda não
  encontrei nesta leitura?

Assim que você confirmar o alvo exato, executo o arquivamento real (nunca `DELETE`, sempre
`archived_at`/`archive_motivo`, rastreável e nunca oculto — mas definitivo na leitura ativa do
Desk, como você pediu).

## Verificação

`tsc --noEmit` limpo, teste novo (`p16-promocao-pendentes-baltico-2026-09-26.test.ts`: 6 testes
— promoção sem fabricar preço/homologação, 12 itens bálticos corretos, Bélgica fora, idempotência),
suíte completa idêntica à baseline, `vite build` limpo. Migration aplicada ao banco real e
registrada em `schema_migrations`.

## Prova Lovable pós-push

Abrir `/catalogo` ou a lista-alimento: os 36 itens (Croácia, Portugal, Espanha, Polônia,
Romênia, Áustria-002/003, Luxemburgo, Hungria, Irlanda, naturalização BR/FR, os 6 CA-GEN-MULTI)
e os 12 novos itens bálticos/Países Baixos aparecem como `ATIVO_SEM_PRECO_HOMOLOGADO`, sem
preço. Em `/calls`, o dropdown "Trilha jurídica de referência" já lista Países Baixos/Estônia/
Letônia/Lituânia sem nenhuma tela nova.
