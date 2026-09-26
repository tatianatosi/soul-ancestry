# P20 — A fórmula de cálculo e o "Prompt Canônico" já estão implementados desde o P13 (2026-09-26)

```yaml
status: verificado item a item contra o banco real — 1 gap fechado (parcelas), resto já existia
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Revise e execute e você vai ver como deve funcionar em relação ao cálculo"
  + documento colado "2026-09-04-prompt-canonico-planejador-multipais-precos-resgatados.md"
  (tabela de honorários/despesas/taxas/parcelas por país, os 6 estados de price_status, o
  fluxo Canva/Blueprint, o exemplo multi-ramo, o curso arquivado)
```

## Achado principal: isto já foi executado — no P13, há um dia, sob o mesmo prompt

O documento que você colou agora é a mesma variante do "Prompt Canônico — Planejador Universal
Multipaís, Catálogo-Alimento e Preços Resgatados" que já foi executada em **2026-09-25 (P13)** —
que por sua vez era a segunda execução do prompt original de **04/09/2026**. Conferi campo a
campo contra o banco real antes de escrever qualquer coisa nova, e o resultado é: **quase tudo
que você descreveu como novo já está lá, com os mesmos números.**

### A tabela `price_catalog_rescued` já existe com exatamente esse schema

```
item_id · country_code · phase · price_component · amount · currency ·
source_type · source_reference · source_date · price_status ·
effective_from/effective_to · case_only · notes
```

E o CHECK real de `price_status` já é, palavra por palavra, os 6 estados que você listou:
`REFERENCIA_RESGATADA`, `CONDICAO_PARTICULAR_DE_CASO`, `HOMOLOGADO_CATALOGO`,
`PENDENTE_DE_HOMOLOGACAO`, `DIVERGENTE`, `ARQUIVADO`.

### Os honorários/despesas/taxas por país já batem, número a número

| País | Honorários (banco) | Despesas (banco) | Taxas (banco) | Sua tabela |
|---|---:|---:|---:|---|
| Itália (IT) | 4.700 | 1.600 | 500 | idêntico |
| Croácia (HR) | 4.000 | 1.800 | 600 | idêntico |
| Portugal (PT) | 4.800 | 1.400 | 450 | idêntico |
| Espanha (ES) | 3.200 | 1.200 | 400 | idêntico |
| Alemanha (DE) | 4.200 | 1.500 | 500 | idêntico |
| Polônia (PL) | 3.900 | 1.500 | 450 | idêntico |
| Romênia (RO) | 3.600 | 1.400 | 450 | idêntico |
| Áustria (AT) | 4.800 | 1.800 | 600 | idêntico |
| Naturalização BR | 900 | 300 | (sem linha) | idêntico |
| Naturalização FR | 1.000 | 350 | 250 | idêntico |

Luxemburgo, Hungria e Irlanda já estão lá como `PENDENTE_DE_HOMOLOGACAO`, `amount=null`, nota
"Sem valor localizado; estrutura nula, não estimar" — exatamente como você descreveu agora.

### O caso da Ana Luiza já está exatamente como você descreveu

`price_catalog_rescued` já tem a linha `AT / honorarios / 9.600,00 / CONDICAO_PARTICULAR_DE_CASO
/ case_only=true`, com a nota: *"Exclusiva do caso da Ana Luiza; não substitui nem sobrescreve a
referência de R$ 4.800 para Áustria"* — e a referência geral de R$4.800 para Áustria continua
intacta, separada. Além disso, `commercial_conditions` (a tabela real que corresponde ao seu
`case_commercial_condition`) já tem a condição comercial dela: `valor_total_referencia=9.600,00`,
`forma_pagamento="3 assinaturas mensais de R$320 por responsável, durante 10 meses"`,
`origem='proposta'`, ligada ao `case_id` da Ana — não ao catálogo geral.

### As 6 divergências (Itália + Portugal) já estão marcadas `DIVERGENTE`, bloqueadas

Itália: 4.500 / 4.700 / 4.800 (3 referências incompatíveis). Portugal: 3.800 / 4.400 / 4.800.
Nota em cada uma: *"bloqueado para exibição/cobrança até validação país a país pela
proprietária"* — exatamente a regra que você pediu, já em produção.

### Curso arquivado — confirmado, sem alteração

`CA-CURSO-001` continua `ARQUIVADO_DECISAO_PROPRIETARIA` — fora de catálogo ativo, proposta,
App, CTA, automação ou pagamento, como sempre.

## O único gap real: contagem de parcelas — fechado agora

A única coisa genuinamente ausente era o número de parcelas por país (a coluna "Parcelas" da
sua tabela). O CHECK de `price_component` já previa o valor `parcelas_padrao` desde a criação da
tabela, mas nenhuma linha o usava. Adicionei as 10 linhas (Itália 6, Croácia 4, Portugal 10,
Espanha 5, Alemanha 6, Polônia 6, Romênia 6, Áustria 10, naturalização BR 3, naturalização FR 3),
como `REFERENCIA_RESGATADA`, nota deixando claro que é referência, não regra de cobrança
automática.

## Sobre "o Canva deixa de ler Planilha Mestre/PARAMETROS/SKUS_REFERENCIA diretamente"

Verifiquei o escritor real da proposta, `materializarProposta`
(`src/lib/cadeia-operacional.server.ts:218`): ele já lê o SKU/preço de `product_catalog` (via
`case_plans`/`blueprint_parameters`), **nunca** de `PARAMETROS`/`SKUS_REFERENCIA` diretamente —
isso já é verdade hoje, no caminho que efetivamente decide o que vai para a proposta.

Achado à parte, honesto: `planejador-parametros.ts` (usado só nas telas de **preparação de
contrato**, não na proposta) ainda lê `PARAMETROS` de `@/data/casos` — mas apenas para **exibir**
um texto de referência histórica ("Despesas previstas R$X · taxas previstas R$Y") para a equipe
consultar; nunca grava preço, nunca alimenta `case_services.preco_acordado` nem
`commercial_conditions`. Não é a mesma coisa que "a proposta ler Planilha Mestre" — é uma tela
de apoio mostrando dado histórico como referência de contexto. Se você quiser que essa exibição
pare de citar `PARAMETROS` também, isso é uma decisão separada (trocar a fonte de um texto de
apoio, não corrigir uma proposta que estivesse errada) — me avise se é isso que você quer.

## Sobre "estrutura pronta para approved_offer_items/third_party_costs/payment_terms/version"

Mapeamento real, sem inventar tabela nova:
- `payment_terms` → `commercial_conditions.forma_pagamento`/`parcelas`/`vencimento_dia`/
  `primeiro_vencimento` (já real, já usado no caso da Ana).
- `third_party_costs` → módulo `despesas-terceiros.ts`, que já trata despesa de terceiro como
  trilha própria, nunca somada a honorário/receita (achado confirmado nesta investigação).
- `approved_offer_items` → `case_services.escopo_aprovado` (escopo já aprovado por caso).
- `version` → parcial: `contracts.current_version_id` existe no nível de contrato; não existe
  campo de versão em `commercial_conditions`/`proposals` — se você precisa de versionamento
  também nesse nível, é uma decisão de schema nova, não fabricada aqui sem seu sinal.

## Sobre "Itália não é mais a referência central" e "base compartilhada multi-país"

Isto é orientação de produto (por onde o motor deve começar — família/ramos/pesquisa antes de
cidadania), não uma tabela para migrar — não há código hoje que trate Itália como "central" de
forma estrutural (nenhuma constante fixando Itália como padrão); é mais uma diretriz de
storytelling/priorização de UI do que um bug de dado. A arquitetura de base compartilhada
multi-país (`lineage_paths` + `research_cases.citizenship_track_id` nullable = base
compartilhada) **já existe e já foi aplicada** ao único caso real elegível (Ana Luiza, no P14) —
o exemplo "ramo paterno Itália / ramo materno Alemanha" do seu prompt é ilustrativo, sem caso
real correspondente hoje; não fabriquei um segundo caso fictício para demonstrá-lo.

## Verificação

`tsc --noEmit` limpo, teste novo (`p20-price-catalog-rescued-parcelas-2026-09-26.test.ts`:
4 testes — 10 países corretos, vocabulário já existente no CHECK, idempotente/nunca UPDATE,
nota de referência vs. cobrança automática), suíte completa idêntica à baseline, `vite build`
limpo. Migration aplicada ao banco real e registrada em `schema_migrations`.

## Prova Lovable pós-push

Onde a lista-alimento/preços resgatados for exibida: os 10 países agora mostram também o número
de parcelas de referência, ao lado de honorários/despesas/taxas já existentes — sem mudança em
nenhum valor anterior.
