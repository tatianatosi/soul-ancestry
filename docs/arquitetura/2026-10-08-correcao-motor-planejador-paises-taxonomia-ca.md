# Correção — motor do Planejador, países e taxonomias antigas

Status: em revisão
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: site clubeancestral.com.br e /sobre, lidos em 08/10/2026; código em tatianatosi/soul-ancestry main; consulta anterior de citizenship_tracks, planner_catalog_feed e price_catalog_rescued na organização 11f32aae-ea08-47e0-8114-f5d8a900c9a1; instrução atual da proprietária.
Escopo: listar referências às taxonomias antigas, fixar o motor de preço e a jornada por propósito, e agregar países sem completar lacuna com Mestre.
Premissas: o que permanece é o propósito da jornada e os prefixos estáveis CA-CID e CA-MEM, entre outros códigos CA- já usados para o mesmo propósito. PP, Top 10/Top 30, produto-mãe e códigos criados em rodadas horárias não governam. SKU não valida. A maioria dos mais de 90 registros de catálogo é deduplicação ou legado e não alimenta o motor.
Limites: esta publicação corrige a governança documental. Não altera banco, não regrava casos e não substitui os arquivos TypeScript, porque o texto integral desses arquivos não foi recuperado nesta sessão. Não declara Países Baixos nem países bálticos como trilhas existentes.
Substitui: a seção 4 da revisão v1.1, que ainda preservava PP-01–PP-09 como taxonomia confirmada. Essa seção não deve ser executada.
Próximos passos: ler os arquivos TypeScript listados e trocar a governança PP/CA-PROT sem migração cega.
Critério de aceite: seção 6.

## 1. Motor correto

O motor de orçamento que corresponde ao pedido está em:

- src/lib/orcamento-produtos-pai.ts
- src/lib/orcamento-produtos-pai.functions.ts
- src/lib/catalogo-precos-produtos-pai.ts
- src/components/contrato/orcamento-produto-pai.tsx

Ele separa quatro componentes e não os funde na regra de cálculo:

valor final = honorários do Clube Ancestral + despesas de terceiros + taxas oficiais + outros

A tela soma os componentes apenas para exibição. Ausência de valor continua nula, não zero. Condição particular de proposta Canva não vira preço de país.

O desvio é de governança, não de fórmula. O processo completo está hoje apontado para CA-PROT-001, um código de rodada posterior. A instrução atual manda preservar o propósito, não esse código horário. O propósito de cidadania permanece na família CA-CID; memória e legado permanecem em CA-MEM. CA-PROT pode existir só como alias histórico do mesmo propósito, não como nova taxonomia.

## 2. Arquivos que ainda referenciam taxonomia antiga

Código que ainda trata PP como vigente ou mapeia CA- para PP:

- src/lib/planejador-produtos-pai.ts
- src/lib/planejador-produtos-pai.functions.ts
- src/lib/sku-produto-pai.ts
- src/lib/sku-produto-pai.functions.ts
- src/lib/jornada-planejador.ts
- src/lib/catalogo-importacao.ts
- src/lib/cadeia-operacional.ts
- src/lib/decisoes-da-proprietaria.ts
- src/components/catalogo/de-para-sku-produto-pai.tsx

src/lib/plano-publicacao.ts cita PP e CA apenas para não expor código técnico ao cliente. Não é governança de produto.

Documentos que não devem governar:

- docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md
- docs/arquitetura/2026-09-04_MATRIZ-HOMOLOGACAO-PRODUTOS-PAI-PP01-PP08.md
- docs/arquitetura/2026-09-04_RECONCILIACAO-PP01-14-vs-35-SKUS-ATIVOS.md
- docs/arquitetura/2026-09-25_EQUIVALENCIA-PP01-08-PP01-09.md
- docs/arquitetura/2026-09-25_DE-PARA-PRODUTO-PAI-CORRIGE-PRODUCT-PARENT.md
- docs/arquitetura/2026-10-08-revisao-coerencia-produtos-pai-jornada-planejador-precos-sem-legado.md, seção 4
- docs/evolucao/recuperados/CA-06_Catalogo_Operacional_30.md
- docs/evolucao/recuperados/CRM-MESTRE_Arquitetura_Conceitual_v1.0.md
- materiais de Top 10/Top 30 e Planilha Mestre

Os dois títulos confirmados no banco — Correção Canônica v2.0 e Prompt Canônico v2.1 — são origem de registros, não recuperação integral dos cinco arquivos e não autorização para usar a tabela inteira.

## 3. Países: site, scan e trilha

O site publica oito cidadanias: Itália, Portugal, Espanha, Alemanha, Polônia, Luxemburgo, Hungria e Áustria. A página Sobre acrescenta Romênia e Irlanda. O AncestralScan é descrito como índice para 10 países; a composição pública compatível com esse número é o conjunto dos oito mais Romênia e Irlanda. Isso não foi confirmado no código do scan nesta sessão.

| País | Site | Trilha na organização | Referência de preço recuperada | Ligação correta |
|---|---|---|---|---|
| Itália | Sim | Sim | Honorários divergentes | CA-CID, por via |
| Portugal | Sim | Sim | Honorários divergentes | CA-CID, por via |
| Espanha | Sim | Sim | R$ 3.200 + R$ 1.200 + R$ 400 | CA-CID, por via |
| Alemanha | Sim | Sim | R$ 4.200 + R$ 1.500 + R$ 500 | CA-CID, por via |
| Polônia | Sim | Sim | R$ 3.900 + R$ 1.500 + R$ 450 | CA-CID, por via |
| Luxemburgo | Sim | Sim | Honorários nulos | CA-CID, sem estimar |
| Hungria | Sim | Sim | Honorários nulos | CA-CID, sem estimar |
| Áustria | Sim | Sim | R$ 4.800 + R$ 1.800 + R$ 600 | CA-CID, por via |
| Romênia | Sobre | Sim | R$ 3.600 + R$ 1.400 + R$ 450 | CA-CID, por via |
| Irlanda | Sobre | Não demonstrada nesta organização | Honorários nulos | Não agregar por outra organização |
| Croácia | Não está nos oito | Sim | R$ 4.000 + R$ 1.800 + R$ 600 | Trilha interna, não oferta pública automática |
| Países Baixos | Não | Não demonstrada | Não | Não criar |
| Países bálticos | Não | Não demonstrados | Não | Não criar |
| Bélgica, Tchéquia, Eslovênia | Não no site | Não demonstradas nesta consulta | Não | Não criar a partir de nome de documento |

Europa central, oriental e ocidental no site não é uma lista adicional de países. É o território coberto pelas cidadanias publicadas. Não transforma Croácia, Países Baixos ou bálticos em oferta.

Propostas Canva continuam sendo condição do caso. Não substituem a referência de país nem preenchem país sem preço.

## 4. Catálogo e deduplicação

product_catalog tinha 90 linhas na consulta de inventário. A maioria não é produto vigente: há duplicata, arquivado, variante e linha antiga. Não usar os 90 como alimento. CA-CID-001 e CA-CID-AT-001 marcados LEGADO_RECONCILIAR, CA-CURSO-001 arquivado e associações por analogia continuam fora da alimentação.

O feed não entra inteiro. Entram apenas linhas com propósito comprovado, organização correta e estado não legado. País é parâmetro da jornada CA-CID, não um SKU novo.

## 5. Correção executada nesta publicação

Foi corrigida a governança: PP deixa de ser taxonomia a preservar. O propósito estável é jornada de cidadania por país, identificada em CA-CID, e memória/legado em CA-MEM. O valor final continua a soma explícita dos componentes, sem fusão e sem fallback de Mestre.

Não foi executada a troca no TypeScript nem a gravação de países ausentes. Fazer isso agora, sem o arquivo integral e sem trilha comprovada, criaria país ou código falso.

## 6. Aceite da próxima execução de código

- PP não é gravado como taxonomia nova.
- CA-PROT não substitui CA-CID.
- CA-MEM não é reclassificado por analogia.
- Valor final mostra os quatro componentes.
- País sem preço não gera orçamento.
- Países Baixos e bálticos só entram depois de trilha jurídica própria.
- Casos e propostas Canva existentes não são reprecificados por esta correção.
