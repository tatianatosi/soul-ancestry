# Motor do Planejador Universal — Produtos-Pai, Jornada e Multipaís: versão canônica final

```yaml
status: em revisão — consolidação final, pendente de aprovação da Proprietária
versão: 1.0
data: 2026-09-04
projeto: Clube Ancestral
classificação: consolidação de 5 documentos externos + cruzamento com dado real do repositório
responsável pela decisão: Proprietária do Clube Ancestral
fontes:
  - CA-CAT-02 — Catálogo de Produtos-Pai, Multipaís e Planejador Universal (v1.0, 04/09) — 11 produtos-pai
  - Revisão Corrigida — Planejador Universal, Lista-Alimento e Legado (v1.1, 03/09) — revoga produtos-pai
  - Revisão Final — Motor do Planejador, Produtos-Pai, Jornada e Catálogo Multipaís (v1.2, 04/09) — 10 produtos-pai
  - Revisão Canônica — Planejador Universal, Produtos-Pai, Jornada e Nacionalidades (v1.3, 04/09) — 9 produtos-pai
  - De-Para de Prompts — Planejador Universal, Produtos-Pai, Jornada, Desk e Valores (v1.0, 04/09) — reconciliação
    dos quatro acima, prompt final único
  - código real: src/data/casos.ts (PARAMETROS, SKUS_REFERENCIA), src/lib/planejador-parametros.ts,
    src/lib/contrato-parametros.functions.ts
  - as três reconciliações já feitas hoje nesta sessão contra os 35 SKUs ativos reais (PR #82, matriz
    PP-01-08, PR #85 parte 1)
escopo: consolidar em UMA versão final os cinco documentos recebidos hoje sobre produtos-pai/jornada/
  multipaís, aproveitando a lista de valores do quinto (de-para) e cruzando tudo contra o catálogo real
  (35 SKUs ativos) e contra o código real de precificação (PARAMETROS)
premissas: taxonomia de SKU existente não muda; produtos-pai são camada de orquestração, não nova
  família comercial; a Planilha Mestre vira legado/lista-alimento, não motor de decisão
limites: nenhuma migration, nenhuma escrita em product_catalog, nenhum preço publicado, nenhum SKU novo
  criado no banco. Implementação de código nesta rodada é limitada a dados/tipos locais versionados
  (mesmo padrão de drive-provisioning.ts: preparação, nunca execução externa).
próximos passos: seção 9
```

## Causa

A Proprietária enviou hoje cinco documentos, em sequência, sobre a mesma decisão — cada um corrigindo ou
revertendo o anterior: primeiro propôs 11 produtos-pai (CA-CAT-02); depois revogou a ideia inteira
("Revisão Corrigida"); depois reconciliou como camada de orquestração com 10 produtos-pai ("Revisão
Final"); depois refinou para 9 ("Revisão Canônica"); e por fim enviou um de-para que resolve as
contradições entre os quatro e propõe um prompt único de execução ("De-Para de Prompts"). Pediu para
consolidar tudo, aproveitando **somente a lista de valores** do quinto documento, cruzar com o material
principalmente dos novos países, e fechar isso de uma vez — parando de depender da Planilha Mestre e
aplicando o novo motor do Planejador.

## 1. Decisão consolidada: qual versão prevalece

O próprio quinto documento (De-Para de Prompts, seção 2) já arbitra as contradições entre os quatro
anteriores. Adoto essa arbitragem como a decisão vigente:

| Ponto em disputa | Versão que prevalece |
|---|---|
| Produtos-pai existem como camada de motor? | **Sim** — a revogação total (v1.1) foi "superada em excesso"; produtos-pai são orquestração, não taxonomia |
| Quantos produtos-pai? | **9** (PP-01 a PP-09), conforme "Revisão Canônica" (v1.3) e o prompt final do de-para (v1.0, seção 5) — não os 11 de v1.0 nem os 10 de v1.2 |
| Convenção de SKU novo por país | `CA-CID-[PAÍS]-NNN`, `CA-NAT-[PAÍS]-NNN`, `CA-GEN-MULTI-NNN` (de-para, seção 2, item 7) — não o `CA-NAC-[PAÍS]-NNN` de v1.2 |
| `CA-CURSO-001` | **Arquivado por decisão expressa da Proprietária** — todas as versões de 04/09 concordam; fora de qualquer oferta, Top SKU, App ou link |
| Planilha Mestre | **Legado + lista-alimento versionada** — nunca mais dependência de tempo real do Planejador, Desk ou App |

Os 9 produtos-pai canônicos (de-para, seção 5 · "Revisão Canônica", seção 3.1):

| ID | Produto-pai | Ciclo de vida |
|---|---|---|
| PP-01 | Diagnóstico Familiar Multipaís | Descoberta |
| PP-02 | Diagnóstico de Cidadania por Etapas | Diagnóstico |
| PP-03 | Pesquisa Genealógica por Ramo Familiar | Prova e pesquisa |
| PP-04 | Preparação de Prova e Pasta Documental | Prova e pesquisa |
| PP-05 | Estratégia de Via e Composição Familiar | Estratégia |
| PP-06 | Acompanhamento Familiar de Nacionalidade | Execução |
| PP-07 | Regularização e Vida Civil Pós-Reconhecimento | Pós-reconhecimento |
| PP-08 | História de Família, Memória e Legado | Memória e legado |
| PP-09 | Continuidade e Acervo Familiar | Continuidade |

## 1.1 — Sexto documento (04/09, enviado depois deste): confirma PP-01–PP-09, mas não resolve o conflito com PP-01–PP-08

A Proprietária enviou um sexto documento — "Reconciliação Canônica dos Cinco Artefatos" — que faz,
independentemente, a mesma arbitragem dos cinco documentos-fonte descrita na seção 1: chega à **mesma
lista de 9 produtos-pai, nos mesmos nomes e na mesma ordem** (PP-01 Diagnóstico Familiar Multipaís …
PP-09 Continuidade e Acervo Familiar). Duas sínteses independentes do mesmo material convergindo no
mesmo resultado é um sinal real de solidez — mas **não fecha a pergunta em aberto desta seção**: o
sexto documento reconcilia os 5 artefatos entre si, não contra a terceira linhagem já registrada nesta
sessão.

Especificamente, `2026-09-04_MATRIZ-HOMOLOGACAO-PRODUTOS-PAI-PP01-PP08.md` (commit `a6a3b69`, mesma
sessão) usa uma taxonomia diferente — **PP-01 a PP-08, organizada por fase da vida** (Descobrir → Decidir
→ Preparar → Executar → Transicionar → Preservar → Manter), não por bloco de cidadania — e diz
explicitamente, sobre a linhagem P01–P09: *"não deve ser usada isoladamente para orientar o novo
Planejador Universal — ela representa material de saneamento anterior."* Essa matriz foi cruzada **ao
vivo contra o `product_catalog` real** (35 códigos ativos, Supabase, 04/09), com status de homologação
por SKU — algo que nem o sexto documento nem os 5 originais fizeram (todos são reconciliação de
documento contra documento, não de documento contra o banco real).

Ou seja: continuam existindo **duas linhagens de produtos-pai que se rejeitam mutuamente por
declaração explícita** (PP-01–09 "por bloco de cidadania" vs. PP-01–08 "por fase da vida"), mais a
terceira já registrada (PP-01–14, `2026-09-04_RECONCILIACAO-PP01-14-vs-35-SKUS-ATIVOS.md`). O sexto
documento reforça a primeira, mas não é o desempate — quem cruzou contra dado real (produção) foi a
segunda. Isso pesa a favor de tratar a matriz PP-01-08 como o ponto de partida mais confiável para
qualquer implementação, mas a decisão continua sendo da Proprietária, não algo que este documento
resolve sozinho.

**Sobre "ajudar na cadência"**: o sexto documento não traz nenhum dia (D0, D+7, D365…) — sua seção 4.3
("Fases de jornada") define 8 fases sem prazo (F0 Entrada e triagem → F7 Continuidade), estrutura
compatível com as oito fases sem prazo do fluxo canônico já implementado (seção 10 de
`docs/politicas/PROMPT-EIXO-COMUNICACAO-IMPLANTACAO-FUTURA.md` e CA-DECISOES-CANONICAS §10, ver
`2026-09-04-consolidacao-12-documentos-drive-cadencia-d0-d365.md`). Isso pode servir de esqueleto para
mapear uma régua de dias sobre as fases — decidir quantos dias cada fase leva, por produto-pai — mas
não é, por si só, a régua D0→D365: não há data em nenhuma linha deste documento.

## 2. Cruzamento contra os 35 SKUs reais ativos hoje

Os cinco documentos descrevem "SKUs existentes" a partir da Planilha Mestre/Planejador — não do
`product_catalog` real. Esta sessão já extraiu ao vivo, duas vezes de forma independente, a lista dos
35 SKUs realmente ativos hoje (mesma base usada nas três reconciliações de produto-pai já feitas hoje).
Cruzando os 9 produtos-pai contra esses 35:

| Code real (ativo) | PP segundo os documentos de hoje | Observação |
|---|---|---|
| `CA-CID-001` | PP-02 | Consistente entre os 5 documentos |
| `CA-CID-002`, `002A`, `002B`, `002C`, `002D` | PP-04 | Consistente |
| `CA-CID-006` | PP-07 | Consistente |
| `CA-CID-009`, `016`, `018`, `019`, `020` | PP-07 | Consistente ("Revisão Canônica") |
| `CA-CID-021` | PP-02/PP-07 (combo, sem PP único) | Mesma ambiguidade já registrada 3× hoje nas rodadas anteriores |
| `CA-CID-023`, `025` | PP-06 | Consistente |
| `CA-COMBO-001` | **Não mencionado em nenhum dos 5 documentos** | Gap — mesma família que já tinha saído das rodadas PP-01-14 hoje |
| `CA-FAM-002` | **Não mencionado** | Gap |
| `CA-HIST-001/002/004/005/006` | PP-08 (mapeamento de família, `CA-HIST-*`) | Consistente |
| `CA-IND-001/002/005/006` | **Não mencionado em nenhuma tabela nominal** — só por analogia de família a PP-08 | Gap parcial |
| `CA-MEM-003/004/008` | **Não mencionado em nenhuma tabela nominal** — só por analogia de família a PP-08/PP-09 | Gap parcial |
| `CA-WPP-002` | **Não mencionado** | Gap |
| `CA-ASS-001` a `005` | PP-09, por analogia (v1.0/v1.2 mapeavam explicitamente; v1.3/de-para não repetem a tabela) | Consistente por herança, não repetido na versão final |

**Padrão que se repete pela quarta vez hoje**: as famílias `CA-COMBO-*`, `CA-FAM-*`, `CA-WPP-*` somem de
toda proposta nova de produto-pai recebida hoje (P01-09, PP-01-08, PP-01-14, e agora este conjunto de 5
documentos) — 3 dos 35 SKUs ativos reais ficam sem produto-pai declarado em nenhuma das quatro rodadas.
`CA-IND-*`/`CA-MEM-*` têm mapeamento só por analogia de família, nunca linha a linha, nesta rodada.

## 3. Achado crítico: valores "existentes" divergem do código real de precificação

Os documentos afirmam repetidamente que os valores por país já "existem no Planejador" como referência
consolidada. O Planejador real, em código, é `src/data/casos.ts` (`PARAMETROS`, `SKUS_REFERENCIA`) —
fonte de dados que alimenta de fato `src/lib/planejador-parametros.ts` e, por ele,
`contrato-parametros.functions.ts` em produção (`parametrosDoPlanejador()`, já mapeado em rodada anterior
desta sessão). Cruzamento linha a linha:

| País | Valor citado nos documentos de hoje | Valor real em `PARAMETROS` (código) | Situação |
|---|---:|---:|---|
| Itália | R$4.700 | **R$4.500** | Divergente — código bate com "caso Giovanna R$4.500", citado no próprio CA-CAT-02 |
| Croácia | R$4.000 | R$4.000 | Igual |
| Portugal | R$4.800 | **R$5.300** | Divergente |
| Espanha | R$3.200 | R$3.200 | Igual |
| Alemanha | R$4.200 | R$4.200 | Igual |
| Polônia | R$3.900 | R$3.900 | Igual |
| Romênia | R$3.600 | R$3.600 | Igual |
| Europa geral | R$3.500 | R$3.500 | Igual |
| Brasil | R$900 | R$900 | Igual |
| França | R$1.000 | R$1.000 | Igual |
| **Áustria** | **R$4.800** ("Referência do Planejador") | **R$0 / R$0 / R$0 — `obs: "Preencher manualmente"`** | **Divergência crítica**: o código real não tem nenhum valor para Áustria hoje — é literalmente vazio, marcado para preenchimento manual. O R$4.800 citado nos 5 documentos não existe no Planejador real. |

`SKUS_REFERENCIA` (também em `casos.ts`) confirma o mesmo padrão: `CA-CID-023` está lá como R$4.500 (não
R$4.800, como diz a "Revisão Final" na seção 6). Como o próprio Ana Luiza é o caso-piloto de Áustria e os
documentos citam repetidamente "condição particular R$9.600" para ela, a ausência de qualquer valor-base
real para Áustria no Planejador é o achado mais importante desta seção — não é possível hoje distinguir,
no código, o que é "preço base austríaco" do que é "condição particular da Ana Luiza", porque não existe
preço base algum.

**Aplicando a instrução da Proprietária ("somente aproveite a lista de valores")**: a lista de valores do
quinto documento (seção 4 dele) é aproveitada como **referência de origem**, mas os valores reais e
vigentes em código continuam sendo os de `PARAMETROS` — não substituo um pelo outro sem decisão humana.
Ambos ficam registrados lado a lado na tabela acima; a reconciliação (qual valor é o correto) é
explicitamente uma decisão da Proprietária (seção 8).

## 4. Achado crítico: SKUs "existentes" por país que não existem no catálogo real

Os cinco documentos citam repetidamente SKUs por país como "existentes" ou "ativos no Planejador":
`CA-CID-DE-001/002/003b`, `CA-CID-AT-001`, `PACOTE-CROACIA-01`, `PACOTE-PT-01`, `PACOTE-ES-01`,
`PACOTE-PL-01`, `PACOTE-RO-01`, `PACOTE-EU-01`, `PACOTE-DE-01`, `NAT-BR-01`, `PACOTE-FR-01`,
`CA-CID-024`, `CA-CID-022`.

**Nenhum desses códigos existe em `product_catalog` hoje** — confirmado por duas extrações ao vivo já
feitas nesta sessão antes deste documento (`DE-PARA-SKUS-PRODUTOS-PAI-PAISES`, `MATRIZ-HOMOLOGACAO-PP01-08`).
Eles existem em `SKUS_REFERENCIA`/na Planilha Mestre — ou seja, são exatamente o tipo de dado que os
próprios documentos de hoje instruem a tratar como **legado**, não como catálogo ativo. Isso não
contradiz os documentos — na verdade confirma a premissa central deles ("a Planilha Mestre é legado, não
motor") com dado real: esses códigos são legado de fato, ainda quando os documentos os chamam de
"existentes" ou "ativos no Planejador".

## 5. Cobertura de países — consolidada

| País | Camada pública (site) | Camada de triagem (AncestralScan) | Preço-base real hoje |
|---|---|---|---|
| Itália, Portugal, Espanha, Alemanha, Polônia, Hungria, Áustria, Luxemburgo | Sim | Sim | Só Itália/Portugal/Espanha/Alemanha/Polônia têm valor em `PARAMETROS`; Áustria zerada; Hungria/Luxemburgo sem linha alguma em `PARAMETROS` |
| Romênia, Irlanda | Não | Sim | Sem linha em `PARAMETROS` — `PENDENTE_DE_VALIDACAO_COMERCIAL`, conforme instrução do de-para |
| Croácia, Europa geral, naturalização brasileira, naturalização francesa | Contexto interno/proposto, não oferta pública | — | Têm linha em `PARAMETROS` (dado real), mas não devem virar oferta pública sem decisão |

Hungria e Luxemburgo não têm sequer uma linha em `PARAMETROS` hoje — nem zerada como Áustria. Precisam
ser criados como estrutura pendente, não só como preço pendente.

## 6. Multipaís e multirramos — modelo alvo (não implementado)

Os documentos convergem num modelo consistente para o caso com mais de uma nacionalidade/ramo, que
registro aqui como especificação alvo, não implementada:

- **Caso familiar** (comercial/operacional) pode ter uma **base de pesquisa compartilhada** (árvore,
  certidões brasileiras, entrevistas) e duas ou mais **trilhas** (país + via + ramo).
- Não se cobra a base comum duas vezes; só o **esforço incremental** por país/ramo é módulo/SKU novo.
- Campos mínimos no Caso 360, segundo os 5 documentos: `produto_pai_id`, `ramo_id`, `base_pesquisa_id`,
  `trilha_id`, `pais_codigo`, `via_status`, `esforco_incremental`, `sku_origem`, `microentrega_id`,
  `gate_operacional`.
- Exemplo canônico citado nos documentos: ramo paterno com hipótese Itália + ramo materno com hipótese
  Alemanha, uma única árvore/base compartilhada, dois planos de pesquisa específicos.

Isso exige schema novo (tabelas de ramo, base de pesquisa, trilha) — fora do escopo desta consolidação,
que é só dados/tipos locais versionados, sem migration.

## 7. SKUs novos propostos por país — registrados como pendentes, não criados

Os documentos propõem ~40 SKUs novos por país (`CA-CID-[PAÍS]-001/002/003`, mais `CA-NAT-BR-*`,
`CA-NAT-FR-*`, `CA-GEN-MULTI-001` a `007`). Todos, nos próprios documentos, nascem com
`status_catalogo = PENDENTE_DE_VALIDACAO_HUMANA` e `price_status = PENDENTE_DE_VALIDACAO_COMERCIAL` —
nenhum é para ser criado como SKU ativo agora. Por isso, e seguindo a instrução de aproveitar só a lista
de valores (não a lista de SKUs propostos), **este documento não materializa esses ~40 códigos como dado
de catálogo** — ficam registrados aqui como especificação, à espera de aprovação individual de escopo,
capacidade e preço (a mesma disciplina que os 5 documentos pedem entre si).

## 8. Perguntas de decisão que só a Proprietária pode responder

1. **Áustria**: qual é o preço-base real — os R$4.800 citados nos documentos, ou o Planejador real
   fica correto em não ter nenhum valor até hoje? Sem essa decisão, `PARAMETROS["Cidadania Austríaca"]`
   continua zerado em produção.
2. **Itália e Portugal**: os valores dos documentos (R$4.700 / R$4.800) ou os valores reais do código
   (R$4.500 / R$5.300) são os corretos? Enquanto não decidido, o código continua valendo.
3. **Hungria e Luxemburgo**: criar a estrutura (linha em `PARAMETROS`, mesmo vazia) agora, ou só quando
   houver preço definido?
4. **Famílias sem produto-pai** (`CA-COMBO-001`, `CA-FAM-002`, `CA-WPP-002`, e o mapeamento fino de
   `CA-IND-*`/`CA-MEM-*`): usar PP-08/PP-09 por analogia de família (como já era antes desta rodada),
   ou tratar como pendência de mapeamento explícito?
5. **Multipaís/multirramos**: aprovar o desenho de schema (seção 6) para uma rodada de implementação
   dedicada, com migration própria?
6. **PP-01–09 (bloco de cidadania) ou PP-01–08 (fase da vida)**: duas linhagens de produtos-pai se
   rejeitam mutuamente por declaração explícita (seção 1.1). A segunda foi cruzada ao vivo contra os 35
   SKUs reais; a primeira (reforçada por um sexto documento nesta rodada) nunca foi. Qual prevalece?
   Enquanto essa pergunta não for respondida, nenhuma implementação de produto-pai deve começar — o
   risco de escolher errado e ter que desfazer é alto.

## 9. Próximos passos

1. Proprietária decide as 5 perguntas da seção 8.
2. Depois da decisão sobre Áustria/Itália/Portugal, corrigir `PARAMETROS` em `src/data/casos.ts` —
   ação de código pequena e segura, sem migration (é array TypeScript local).
3. Criar as linhas de estrutura pendente para Hungria, Luxemburgo, Romênia e Irlanda em `PARAMETROS`
   (mesmo padrão do Áustria zerado hoje), se a Proprietária confirmar o item 3 da seção 8.
4. Só depois disso, avaliar se algum dos ~40 SKUs propostos por país (seção 7) começa a ser cadastrado,
   um de cada vez, com escopo e preço reais aprovados — nunca em lote.
5. Desenho de schema para multipaís/multirramos (seção 6) como rodada própria, com migration, quando
   priorizada.
6. Responder a pergunta 6 da seção 8 (PP-01-09 × PP-01-08) antes de tratar qualquer uma das três
   linhagens de produto-pai desta sessão (P01-09, PP-01-08, PP-01-14) como encerrada — um sexto
   documento reforçou PP-01-09, mas não desempatou contra PP-01-08, que é a única cruzada ao vivo
   contra os 35 SKUs reais.

## 10. O que este documento NÃO decide

- **Não decide** qual valor é correto para Itália, Portugal e Áustria — regista a divergência, não a resolve.
- **Não cria** nenhum dos ~40 SKUs regionais propostos.
- **Não implementa** o schema de multipaís/multirramos (ramo, base de pesquisa, trilha) — precisa de
  migration e rodada própria.
- **Não altera `PARAMETROS`** nem qualquer outro dado em código nesta entrega — a correção de valores
  é ação futura, condicionada à decisão da seção 8.
- **Não altera nenhuma linha de `product_catalog`, nenhuma migration.**
