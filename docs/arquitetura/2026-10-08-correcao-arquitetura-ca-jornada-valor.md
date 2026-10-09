# Correção de arquitetura — CA-, jornada e composição de valor

Status: em revisão
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: busca em tatianatosi/soul-ancestry, ref 5f0f08d1115b77897ae335cd10ec5cd2bf4698f6; consulta anterior de trilhas e preços; instrução de 08/10/2026, 22:57.
Escopo: listar taxonomias antigas, identificar o motor de valor e corrigir a governança. Não migra banco nem reescreve o motor nesta publicação.
Premissas: o propósito da jornada e a composição de valor prevalecem sobre códigos que mudaram por prompt. CA-CID e CA-MEM permanecem. PP não governa. Mestre, CRM Mestre, OPS e SKU não alimentam.
Limites: não foi lido o texto integral de cada arquivo listado. Não houve teste, migration nem deploy. Países bálticos têm fonte oficial no código, não preço homologado.
Substitui: a seção 4 da revisão v1.1, que ainda preservava PP-01–PP-09 como governança.
Próximos passos: trocar o default CA-PROT-001 da calculadora somente depois de alias explícito com CA-CID; não fazer isso por analogia.
Critério de aceite: PP deixa de ser citado como taxonomia vigente; valor final não funde componentes; países sem preço não recebem zero.

## 1. Motor correto de valor

O motor que calcula a composição pedida está em `src/lib/orcamento-produtos-pai.ts` e `src/lib/orcamento-produtos-pai.functions.ts`.

| Componente | Campo | Regra |
|---|---|---|
| Honorários do Clube Ancestral | honorarios | Não fundir com despesas |
| Despesas de terceiros | despesas_terceiros | Não viram honorário |
| Taxas oficiais | taxas_oficiais | Separadas |
| Outros | outros | Separados |
| Valor final | soma apenas para exibição | Componentes continuam distintos |

`VALOR_NAO_CADASTRADO` é o estado correto quando a trilha existe e o preço não. Nulo não vira zero. Preço de proposta Canva, inclusive a condição particular, não vira preço de país.

`src/lib/financeiro-referencia.ts` lê honorários, despesas, taxas e parcelas da trilha como referência, não como homologação.

## 2. O que permanece: propósito, não taxonomia da hora

CA-CID permanece para cidadania por país, etapa e acompanhamento. CA-MEM permanece para memória e legado. CA-HIST permanece para pesquisa genealógica. Essas famílias não são substituídas por PP nem por CA-PROT.

CA-PROT-001 é o default atual da calculadora e da tela de orçamento. O de-para de 25/09 o trata como próximo de CA-CID-023, e CA-PROT-003 como alias de CA-CID-025. Isso não autoriza fusão automática. A calculadora não deve passar a governar o catálogo real só porque usa outro prefixo.

A jornada europeia é o propósito: diagnóstico, prova, estratégia, acompanhamento e vida civil, por país e ramo. O código da hora não cria uma jornada nova.

## 3. Países

Já ligados a trilha jurídica e/ou referência de preço, sem completar lacuna com Mestre:

- Com referência resgatada, não homologada por esta correção: Alemanha, Áustria, Croácia, Espanha, Itália, Polônia, Portugal, Romênia. França e Brasil aparecem como naturalização, não como cidadania europeia.
- Trilha com honorários nulos na consulta anterior: Hungria, Irlanda, Luxemburgo.
- Fonte oficial documentada no motor jurídico, sem preço desta correção: Croácia, Estônia, Hungria, Letônia, Lituânia, Países Baixos, Polônia (`src/lib/marcos-fontes-oficiais.ts`).
- Trilha jurídica registrada, fonte de pesquisa ainda não documentada: Bélgica, Eslovênia, Estônia, França, Hungria, Irlanda, Letônia, Lituânia, Luxemburgo, Países Baixos, Romênia (`src/lib/decisoes-da-proprietaria.ts`).

Estônia, Letônia e Lituânia entram pelo motor de validação jurídica. Não receberam preço inventado.

## 4. Arquivos que ainda referenciam taxonomia antiga

Executam ou exigem PP:

- supabase/migrations/20260921150000_case_plans_produto_pai.sql
- src/lib/planejador-produtos-pai.ts
- src/lib/planejador-produtos-pai.functions.ts
- src/lib/sku-produto-pai.ts
- src/lib/sku-produto-pai.functions.ts
- src/components/catalogo/de-para-sku-produto-pai.tsx
- src/lib/jornada-planejador.ts
- src/lib/catalogo-importacao.ts
- src/lib/cadeia-operacional.ts
- src/lib/decisoes-da-proprietaria.ts
- src/lib/__tests__/corte3-produto-pai-governa.test.ts

Documentos legados que não alimentam:

- docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md
- docs/arquitetura/2026-09-04_MATRIZ-HOMOLOGACAO-PRODUTOS-PAI-PP01-PP08.md
- docs/arquitetura/2026-09-04_RECONCILIACAO-PP01-14-vs-35-SKUS-ATIVOS.md
- docs/arquitetura/2026-09-25_EQUIVALENCIA-PP01-08-PP01-09.md
- docs/arquitetura/2026-09-25_DE-PARA-PRODUTO-PAI-CORRIGE-PRODUCT-PARENT.md
- docs/arquitetura/2026-09-04_DE-PARA-SKUS-CORPUS-HISTORICO-COMPLETO.md
- docs/arquitetura/2026-10-08-revisao-coerencia-produtos-pai-jornada-planejador-precos-sem-legado.md, seção 4
- docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md, onde CA-DIAG/CA-PESQ/CA-PROT foram propostos e não implantados no catálogo real
- docs/evolucao/recuperados/CA-06_Catalogo_Operacional_30.md e saneamentos Top 10/Top 30

`product_catalog` chegou a 90 linhas; a maior parte foi arquivada por duplicidade. Não reabrir os 90 como catálogo vigente. Deduplicação não apaga histórico e não cria produto novo.

## 5. Correção aplicada nesta publicação

PP-01–PP-09 deixa de ser a taxonomia vigente, apesar do registro de 07/09 e da migration. O propósito das nove finalidades pode continuar como linguagem de jornada, sem código PP e sem obrigatoriedade de compra.

Não foi executada troca de `case_plans.produto_pai_id` nem do default `CA-PROT-001`. Essas escritas quebrariam casos e testes se feitas sem alias aprovado e sem o arquivo integral.

## 6. Aceite da próxima execução de código

- Leitura integral dos arquivos da seção 4 antes de editar.
- Nenhuma gravação nova de PP.
- CA-CID e CA-MEM não são reclassificados por analogia.
- Valor final exibido como soma, com componentes separados.
- País sem preço permanece `VALOR_NAO_CADASTRADO`.
- Países bálticos não recebem preço copiado de outro país.
