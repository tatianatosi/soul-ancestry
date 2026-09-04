# Reconciliação: de-para pronto do documento PP-01–PP-14 × 35 SKUs reais ativos

```yaml
status: reconciliação — pendente de decisão da Proprietária
versão: 1.0
data: 2026-09-04
projeto: Clube Ancestral
classificação: cruzamento de dado real contra a terceira proposta de taxonomia de produtos-pai
  recebida em 04/09 ("Planejador Universal, Catálogo por Jornada e Produtos-Pai
  Multipaís — Fase Final", PP-01 a PP-14, 14 categorias, seção 5 com de-para
  SKU a SKU já preenchido)
responsável pela decisão: Proprietária Administradora do Clube Ancestral
fontes:
  - documento-fonte desta rodada (upload 04/09, versão v1.0, data 2026-09-03), seção 4
    (14 produtos-pai) e seção 5 ("De-para dos SKUs já identificados")
  - docs/arquitetura/2026-09-04_DE-PARA-SKUS-PRODUTOS-PAI-PAISES-SUBABA-CATALOGO.md
    (lido via git show origin/docs/de-para-skus-produtos-pai-paises-subaba-catalogo-2026-09-04,
    não mesclado nesta branch) — lista dos 35 códigos ativos, extraída ao vivo de
    product_catalog em 04/09
  - docs/arquitetura/2026-09-04_MATRIZ-HOMOLOGACAO-PRODUTOS-PAI-PP01-PP08.md (mesma origem)
    — segunda extração independente dos mesmos 35 códigos, taxonomia PP-01–PP-08
    (fase da vida)
  - docs/arquitetura/2026-09-04_SKUS-91-REAPROVEITAMENTO-PRODUTO-PAI.md (mesma origem)
    — de-para dos 91 SKUs do saneamento de 25/08 contra os 35 ativos de hoje
escopo: cruzar a seção 5 do documento PP-01–PP-14 contra os 35 códigos reais ativos já
  extraídos nas duas rodadas anteriores. Não reconsulta product_catalog ao vivo — o
  MCP do Supabase está sem autorização nesta sessão; usa as duas extrações
  independentes já feitas em 04/09, que concordam em número (35) e composição.
  Somente leitura. Nenhuma escrita em product_catalog, nenhum código alterado.
limites: como as duas extrações-fonte já convergem no mesmo conjunto de 35 códigos,
  trato essa lista como base confiável para o cruzamento. Não reabre a discussão de
  qual das três taxonomias (P01–P09, PP-01–PP-08, PP-01–PP-14) é a correta — isso já
  está registrado como pendente de decisão da Proprietária nos três documentos
  anteriores.
```

## Causa

Terceiro desenho de produtos-pai recebido em 04/09 — depois de P01–P09 (por bloco de
cidadania) e PP-01–PP-08 (por fase da vida, 8 categorias), agora PP-01–PP-14 (14
categorias), com de-para SKU a SKU já preenchido na seção 5. Diferente dos dois
anteriores, este documento entrega o cruzamento pronto — pedido aqui foi verificar
esse de-para contra os 35 códigos reais ativos, sinalizar o que bate e o que fica de
fora, e reconciliar com as duas rodadas anteriores sem recomeçar o mapeamento do zero.

## 1. Resumo executivo

| Métrica | Valor |
|---|---|
| Linhas na tabela de de-para da seção 5 do documento-fonte | 35 |
| Dessas 35 linhas, correspondem a um SKU real ativo hoje | **20** |
| Dessas 35 linhas, citam código que **não existe** em `product_catalog` hoje (nem ativo, nem arquivado) | **15** |
| SKUs reais ativos hoje que a seção 5 **não menciona em nenhuma linha** | **15** (famílias inteiras `CA-HIST-*`, `CA-IND-*`, `CA-MEM-*`, `CA-COMBO-001`, `CA-FAM-002`, `CA-WPP-002`) |
| Cobertura líquida da seção 5 sobre os 35 ativos reais | 20/35 = 57% |

O documento-fonte se autodeclara parcial no rodapé ("a matriz nominal integral dos 91
SKUs não pôde ser reextraída... institui a regra para completar a enumeração 91/91
antes do go-live"). O cruzamento confirma isso com número: quase metade dos SKUs
vivos hoje simplesmente não aparece na proposta, e quase metade das linhas da
proposta descreve código que não existe no banco.

## 2. Os 20 SKUs reais que a seção 5 cobre — comparação com P01–P09 e PP-01–PP-08

| Code real (ativo) | P-código antigo (P01–P09) | PP-código fase da vida (PP-01–PP-08) | PP-código novo (PP-01–PP-14, seção 5) | Leitura |
|---|---|---|---|---|
| `CA-CID-001` | P01 (diagnóstico/direção) | PP-01 (Descoberta) | **PP-02** (Consultoria estratégica) | Diverge dos dois anteriores. O próprio `papel_comercial` no banco é "Diagnóstico e direção" (citado no doc `DE-PARA-SKUS`) — o novo doc empurra o mesmo SKU para "consultoria estratégica", contra o campo real. |
| `CA-CID-002` | P03 | PP-04 (Preparar) | PP-03 (Preparação documental) | Mesmo conceito (dossiê/documentação), renumerado — consistente em conteúdo. |
| `CA-CID-002A` | P03 | PP-04 | PP-05 (Saneamento e revisão) | Os dois docs de fase-da-vida/pai concordam em agrupar 002A–D sob um único PP; o novo doc os separa entre PP-03 e PP-05. |
| `CA-CID-002B` | P03 | PP-04 | PP-05 | idem |
| `CA-CID-002C` | P03 | PP-04 | PP-03/PP-05 (o próprio doc não decide) | idem — e o novo doc já chega indeciso nesta linha. |
| `CA-CID-002D` | P03 | PP-04 | PP-03 | idem |
| `CA-CID-006` | P06 | PP-06 (Transicionar) | PP-08 (Regularização pós-reconhecimento) | Mesmo conceito (pós-cidadania), renumerado — consistente. |
| `CA-CID-009` | P06 | PP-06 | PP-09 (Registros familiares) | Consistente. |
| `CA-CID-016` | P06 | PP-06 | PP-09 | Consistente. |
| `CA-CID-018` | P06 | PP-06 | PP-09/PP-10 | Consistente. |
| `CA-CID-019` | P03 (candidata) | PP-04 | PP-10 (Certidões avulsas) | Migra de "documentação estratégica" para "avulso" — mudança de leitura, não necessariamente erro. |
| `CA-CID-020` | P03 (candidata) | PP-04 | PP-10 | idem |
| `CA-CID-021` | sem correspondência (combo) | sem correspondência única (PP-01+PP-06) | sem correspondência única (PP-01/PP-02/PP-08) | **Os três documentos concordam em não conseguir decidir** — é o único caso onde a ambiguidade é estável nas três rodadas, não uma divergência entre elas. |
| `CA-CID-023` | P04 (execução) | PP-03 ("Decidir" — mas o próprio doc admite que "cruza PP-03 a PP-06 na prática") | **PP-06** (Coordenação de processo de reconhecimento) | P04 antigo e PP-06 novo concordam (execução/coordenação). O PP-03 do doc de fase-da-vida é o valor isolado aqui — ele mesmo já se autodeclarava inseguro nessa linha. |
| `CA-CID-025` | P05 | PP-05 (Executar) | PP-07 (Acompanhamento familiar) | Mesmo conceito (coordenação familiar), renumerado — consistente. |
| `CA-ASS-001` | P08 | PP-08 (Manter) | PP-14 (Assinatura de continuidade) | Consistente, renumerado. |
| `CA-ASS-002` | P08 | PP-08 | PP-14 (nota do doc: "vincular ao PP-12 e validar modelo comercial") | Única linha em que o novo doc reconhece o eixo duplo (natureza de cobrança × tema) que o doc `DE-PARA-SKUS` (§3) já tinha sinalizado como não coberto pela taxonomia P01–P09 — avanço real sobre as rodadas anteriores. |
| `CA-ASS-003` | P08 | PP-08 | PP-14 | Consistente. |
| `CA-ASS-004` | P08 | PP-08 | PP-14 | Consistente. |
| `CA-ASS-005` | P08 | PP-08 | PP-14 (mesma nota de `CA-ASS-002`) | Mesmo avanço de leitura. |

## 3. Os 15 SKUs reais que a seção 5 simplesmente não menciona

Famílias inteiras do catálogo ativo ficam de fora do de-para novo:

| Code real (ativo) | Nome | P-código antigo | PP-código fase da vida | Presente na seção 5 do novo doc? |
|---|---|---|---|---|
| `CA-COMBO-001` | Combo Vó (Restauração + Entrevista + Diário) | P07 | PP-07 (Preservar) | **Não** |
| `CA-FAM-002` | Familiar Conectado Plus | P08 | PP-05/PP-08 (ambíguo) | **Não** |
| `CA-HIST-001` | Estudo Genealógico e Patrimonial Aprofundado | P02/P07 (ambíguo) | PP-02 (Descobrir) | **Não** |
| `CA-HIST-002` | Pesquisa Genealógica Extra — Sobrenome Adicional | P02/P07 (ambíguo) | PP-02 | **Não** |
| `CA-HIST-004` | Pacote Família Completa (3 Sobrenomes) | P02/P07 (ambíguo) | PP-02 | **Não** |
| `CA-HIST-005` | Pesquisa de Base Familiar | P02/P07 (ambíguo) | PP-02 | **Não** |
| `CA-HIST-006` | Combo Pesquisa + Diagnóstico de Cidadania Italiana | sem correspondência (P01/P02) | PP-02/PP-03 (combo) | **Não** |
| `CA-IND-001` | Autobiografia Guiada — Pacote Express | P07 | PP-07 | **Não** |
| `CA-IND-002` | Legado em Vídeo — Mini-Série de Depoimentos | P07 | PP-07 | **Não** |
| `CA-IND-005` | Livro Biográfico Completo — Premium | P07 | PP-07 | **Não** |
| `CA-IND-006` | Memória Empresarial — História da Empresa | P07 | PP-07 | **Não** |
| `CA-MEM-003` | Entrevista Guiada com Idoso | P07 | PP-07 | **Não** |
| `CA-MEM-004` | Livro da História Familiar | P07 | PP-07 | **Não** |
| `CA-MEM-008` | Livro de Memórias Premium | P07 | PP-07 | **Não** |
| `CA-WPP-002` | Pacote WhatsApp Premium | P08 | PP-05/PP-08 (ambíguo) | **Não** |

Na prática: tudo que as duas rodadas anteriores agrupavam sob "memória, acervo e
legado" (`CA-HIST-*`, `CA-IND-*`, `CA-MEM-*`, `CA-COMBO-001` — o que seria PP-11/PP-12
na taxonomia nova) e os dois SKUs de continuidade ambíguos (`CA-FAM-002`,
`CA-WPP-002`) somem da seção 5. Não é um recorte proposital documentado — o
documento-fonte não explica por que essas famílias ficaram de fora; é consistente
com sua própria ressalva de que a extração ficou parcial.

## 4. As 15 linhas da seção 5 que citam código sem existência real hoje

| Code citado no novo doc | Situação real (confirmada nas rodadas anteriores) |
|---|---|
| `CA-CID-024` | Não existe. Fusão com `CA-CID-001` proposta em 25/08, nunca decidida (`SKUS-91-REAPROVEITAMENTO` §1). |
| `CA-CID-022` | Não existe. Decisão `MANTER` em 25/08 (lead magnet AncestralScan), ausente hoje — exatamente o achado de `SKUS-91-REAPROVEITAMENTO` §2 sobre PP-01/P01 não ter SKU vivo de diagnóstico gratuito. |
| `CA-CID-003` | Não existe. Fisicamente excluído do banco, era `TOP PARETO` (achado original do PR #82, confirmado em `SKUS-91-REAPROVEITAMENTO` §2). |
| `CA-CID-004` | Não existe. Absorvido por `CA-CID-006`, decisão `DESCONTINUAR` em 25/08 (`SKUS-91-REAPROVEITAMENTO` §1). |
| `CA-CID-005` | Não existe. Mesma absorção/decisão que `CA-CID-004`. |
| `CA-CID-007` | Não existe. Absorvido por `CA-CID-011`, decisão `ARQUIVAR` em 25/08. |
| `CA-CID-008` | Não existe. Absorvido por `CA-CID-014`, decisão `ARQUIVAR` em 25/08. |
| `CA-CID-011` | Não existe hoje — um dos 6 códigos pós-cidadania (`011/012/013/014/015/017`) com decisão `AJUSTAR` em 25/08 que nunca voltaram ("precisa de link Asaas novo — Fase 2"), per `SKUS-91-REAPROVEITAMENTO` §2. |
| `CA-CID-012` | Não existe — mesmo grupo dos 6 códigos pós-cidadania. |
| `CA-CID-013` | Não existe — mesmo grupo. |
| `CA-CID-014` | Não existe — mesmo grupo. |
| `CA-CID-017` | Não existe — mesmo grupo. |
| `CA-CID-010` | Não existe — **não fazia parte do grupo dos 6 já sinalizado** nas rodadas anteriores; é uma ausência nova, não catalogada antes. |
| `CA-ASS-006` | Não existe. Decisão `AJUSTAR` em 25/08, status divergente entre fontes nunca resolvido (`SKUS-91-REAPROVEITAMENTO` §2, `MATRIZ-HOMOLOGACAO` nota PP-08). |
| `CA-CURSO-001` | Ver nota abaixo — discrepância factual, não só ausência. |

**Nota sobre `CA-CID-015`**: fazia parte do grupo dos 6 códigos pós-cidadania
`AJUSTAR`/ausentes já identificado (`011/012/013/014/015/017`). A seção 5 do novo
documento cita os outros 5 do grupo, mas **não cita `CA-CID-015`** — nem como
ausente a reconciliar, nem de nenhuma forma. Fica fora de qualquer um dos três
documentos agora.

**Nota sobre `CA-CURSO-001`**: o novo documento descreve esse código como "Status
legado Arquivado exige decisão humana explícita antes de reativar ou oferecer" — ou
seja, trata como um SKU que existe no banco com `archived_at` preenchido. Isso
contradiz o achado direto do documento `DE-PARA-SKUS-PRODUTOS-PAI-PAISES` (§2): busca
por `code like 'CA-CURSO-%'` em `product_catalog` retornou **zero linhas, ativas ou
arquivadas**. Não é uma ausência simples como as outras 14 linhas desta seção — é uma
afirmação sobre o estado do banco que a extração ao vivo já havia contradito antes
deste documento chegar.

## 5. Achado estrutural

As 35 linhas da seção 5 quase por coincidência batem em número com os 35 SKUs reais
ativos — mas são conjuntos praticamente disjuntos na metade: 20 linhas acertam um
código real, 15 descrevem código inexistente, e simetricamente 15 códigos reais
ficam de fora. Isso sugere que a seção 5 foi montada a partir de uma lista de
trabalho anterior (provavelmente o CSV de 91 linhas do saneamento de 25/08, ou a
planilha mestre legada) sem recruzar contra o estado atual de `product_catalog` — o
mesmo padrão que os documentos `SKUS-91-REAPROVEITAMENTO` e `DE-PARA-SKUS-PRODUTOS-PAI`
já haviam identificado para o de-para original do PR #82 e para os itens da seção 6
daquele primeiro documento de arquitetura.

## 6. O que este documento NÃO decide

- **Não decide** qual das três taxonomias (P01–P09, PP-01–PP-08 por fase da vida,
  PP-01–PP-14 desta rodada) é a arquitetura final — isso segue pendente nas três
  rodadas anteriores e não é resolvido aqui.
- **Não decide** se `CA-CID-001` deve ficar em PP-01/P01 (diagnóstico, como o campo
  `papel_comercial` do banco sugere) ou em PP-02 (consultoria estratégica, como o
  novo doc propõe) — só sinaliza a divergência com o dado real.
- **Não decide** se as famílias ausentes da seção 5 (`CA-HIST-*`, `CA-IND-*`,
  `CA-MEM-*`, `CA-COMBO-001`, `CA-FAM-002`, `CA-WPP-002`) devem ser encaixadas em
  PP-11/PP-12/PP-14 por analogia com o mapeamento já feito em `MATRIZ-HOMOLOGACAO-PP01-PP08`
  — apenas confirma que a seção 5 não as cobre.
- **Não decide** o destino de `CA-CID-024`, `CA-CID-022`, `CA-CID-003/004/005`,
  `CA-CID-007/008/010/011/012/013/014/015/017`, `CA-ASS-006` ou `CA-CURSO-001` —
  esses já estavam sinalizados como pendentes de decisão nos documentos anteriores
  (reativar, formalizar ou manter como histórico); esta reconciliação não avança essa
  decisão.
- **Não reconsulta `product_catalog` ao vivo.** O MCP do Supabase está sem
  autorização nesta sessão; este documento usa as duas extrações independentes já
  feitas em 04/09 (que convergem em número e composição) como base do cruzamento, e
  não deveria ser tratado como substituto de uma terceira extração ao vivo se a
  Proprietária quiser confirmar antes de decidir.
- **Não altera nenhuma linha de `product_catalog`, nenhuma migration, nenhum código.**
