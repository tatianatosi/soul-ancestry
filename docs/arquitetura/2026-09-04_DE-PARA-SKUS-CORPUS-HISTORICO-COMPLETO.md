# De-para: Corpus Histórico Completo de SKUs × Produtos-Pai (Legado, Catálogo e Material de 24-25/08)

- **Status:** revisão de corpus — pendente de decisão da proprietária (nenhuma convergência foi executada)
- **Versão:** v1.0
- **Data:** 2026-09-04
- **Responsável pela decisão:** Proprietária Administradora do Clube Ancestral
- **Classificação:** auditoria de corpus documental (somente leitura) + cruzamento contra migrations reais do Supabase e código em `src/`
- **Repositório:** `tatianatosi/soul-ancestry`
- **Motivação:** a proprietária apontou que o PR #82 (`docs/arquitetura/2026-09-04_DE-PARA-SKUS-PRODUTOS-PAI-PAISES-SUBABA-CATALOGO.md`) usou apenas 2 documentos de 02/09 e que "existem vários prompts com listas infinitas" no legado, no catálogo e no material de 24-25/08 ainda não revisados.
- **Escopo:** somente leitura. Nenhuma migration nova, nenhuma escrita em `product_catalog` ou qualquer outra tabela, nenhum arquivo de código editado. Os números de `product_catalog` citados aqui são reaproveitados do PR #82 (35 ativos de 90 linhas totais) — não houve nova consulta ao Supabase nesta tarefa porque o MCP do Supabase está sem autenticação nesta sessão; toda comparação com "o real" usa, em vez disso, as migrations SQL versionadas em `supabase/migrations/`, que são texto auditável e não exigem sessão autenticada.
- **Regra institucional aplicada:** nenhuma correspondência foi forçada. Quando o corpus histórico genuinamente não resolve uma ambiguidade, isso é reportado como está.

---

## 1. Resumo executivo

| Métrica | Valor |
|---|---|
| Documentos/CSVs do corpus histórico examinados nesta tarefa | 19 (15 indicados pela tarefa + 4 achados por grep adicional) |
| Duplicata/reformatação de outro documento já lido | 8 |
| Histórico de saneamento já superado (sem produto-pai relevante além do que outros documentos já dão) | 3 |
| Contém informação nova relevante ao de-para do PR #82 | 5 |
| Lista de SKU/taxonomia nunca implantada, sem equivalente real hoje | 3 |
| **Achado central** | Existe um mecanismo de "produto-pai" **já implementado em código e em migrations reais do Supabase** (`product_catalog.papel_comercial`, `.faixa_prioridade`, e o array estático `produto_mae` de `src/lib/ca06-catalogo-operacional.ts`) que o PR #82 não usou — apesar de ter selecionado `papel_comercial` na sua própria query. Esse mecanismo resolve parte da ambiguidade P02×P07 da família `CA-HIST-*` que o PR #82 deixou em aberto. |
| CA-HIST-001/002/004/005 — ambiguidade P02×P07 do PR #82 | **Parcialmente resolvida** por 3 fontes independentes (ver Seção 5) — todas tratam a família como "pesquisa/documentação", não como "memória/legado" |
| CA-HIST-006 — sem correspondência clara no PR #82 | **Parcialmente resolvida**: CA-06 (código real) documenta explicitamente `produto_mae = "CA-HIST-005 + CA-CID-022"` — é um combo declarado, não uma ambiguidade sem base |
| CA-CID-021 — sem correspondência clara no PR #82 | **Continua sem resolução** — nenhuma das 19 fontes examinadas escolhe um produto-pai único; a mais recente (CA-06) explicitamente o deixa fora do Catálogo 30, sem produto-pai atribuído |
| P09 (Educação) vazio | **Confirmado, não resolvido** — 3 fontes independentes adicionais (25/08, 21/08, e o próprio código) mostram P09/"Autonomia e educação" sempre vazio ou com apenas os `CA-CURSO-*` arquivados, nunca ativos |
| 91 SKUs (corpus 25/08) vs. 90 linhas hoje (35 ativas + 55 arquivadas) | Números próximos, mas não idênticos — ver Seção 6 |

---

## 2. O achado central: um mecanismo de produto-pai já existe no banco e no código

O PR #82 mapeou os 35 SKUs ativos contra a taxonomia **P01–P09** do documento `2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md` — um documento que, como o próprio PR #82 confirmou, tem **zero implementação em código** (nenhuma tabela `country_catalog`, nenhum enum P01–P09 no schema).

O que esta tarefa encontrou é que **existe outro mecanismo de produto-pai, mais antigo (21–22/08), que está de fato implementado**:

1. **`product_catalog.papel_comercial`** (texto livre: "Diagnóstico e direção", "Pesquisa principal", "Pesquisa familiar ampliada" etc.) e **`product_catalog.faixa_prioridade`** (`TOP_10` | `TOP_30` | `HISTORICO`) — colunas criadas e populadas pela migration `supabase/migrations/20260821133440_329e42ed-b0f1-42c5-8f4e-90eb0a1cdd18.sql:1-118`, para exatamente 30 SKUs (10 `TOP_10` + 20 `TOP_30`).
2. Essas colunas são **lidas ao vivo** por `src/lib/catalogo-top30.functions.ts:21-22,51-52` (`painelTop30Planejador()`), que agrupa os itens em `top10`/`top30`/`historico` e expõe o campo `papel` — e **renderizadas na tela real** `src/components/painel/painel-top30.tsx:196,212`, embutida na rota `/contratos` via `src/routes/_authenticated/contratos.index.tsx:2,168` (`<PainelTop30 />`). Ou seja: **não é um dicionário estático nem uma proposta — é um painel operacional em produção**, fora do grupo de navegação "Catálogo" que o PR #82 triou na Seção 5 (por isso passou despercebido).
3. **`src/lib/ca06-catalogo-operacional.ts:27` (`produto_mae: string`)** — array estático de 30 itens, já identificado pelo PR #82 (Seção 5.1) como o CA-06, mas cujo campo `produto_mae` **não foi cruzado** contra a ambiguidade da Seção 2 do PR #82. Esse campo atribui explicitamente um produto-pai por SKU (ex.: `CA-HIST-002.produto_mae = "CA-HIST-001 (extra sobre o mesmo estudo)"`).

**Proveniência confirmada:** o vocabulário exato dessas colunas (`tipo: produto_pai | complemento | upgrade | recorrente | sazonal`; `prioridade: top10 | top30 | historico`) aparece, palavra por palavra, na Seção 8 de `docs/evolucao/recuperados/prompts-lovable/CA-LOVABLE-BIBLIOTECA-MESTRE-v1.0.md:123-139`, datado de 21/08/2026 — o mesmo dia da migration. Este não é um mecanismo acidental: é a especificação de origem que a migration implementou.

**O que isso muda para o PR #82:** a Seção 2 do PR #82 fez de-para manual, item a item, contra um documento sem nenhuma implementação, quando já havia — nas próprias colunas que o PR #82 selecionou em sua query (`papel_comercial`, `familia_comercial`) — uma resposta parcial gravada no banco desde 21-22/08. O PR #82 não é "errado" (ele documentou honestamente a ambiguidade que via na fonte que escolheu), mas sua fonte não era a única, nem a mais antiga, nem a única implementada.

**Ressalva:** não foi possível confirmar por consulta ao vivo (Supabase MCP sem autenticação nesta sessão) se `papel_comercial`/`faixa_prioridade` permanecem com esses valores exatos hoje (04/09) — apenas que nenhuma migration entre 22/08 e 27/08 (a mais recente no repositório) sobrescreve essas duas colunas. Se o arquivamento das 55 linhas duplicadas (feito na mesma sessão do PR #82, fora de qualquer migration versionada) alterou esses campos, isso não pode ser verificado aqui.

---

## 3. Classificação do corpus (19 documentos/CSVs)

| Documento/CSV | Data (origem) | Classificação | Achado |
|---|---|---|---|
| `fontes-primarias/01_CATALOGO_E_SKUS/01_CATALOGO_E_SKUS_Saneamento_Mestre_SKUs.md` | 25/08 (commit) | **Nova, relevante** | Auditoria-mãe do corpus: confirma "91 SKUs" como número de referência (FASE 9, linha 453), define `produto-pai` como hierarquia *dentro da mesma família* (ex.: CA-CID-002 é pai de CA-CID-002A/B/C/D; CA-CID-004/005 absorvidos por CA-CID-006) — um conceito de produto-pai **diferente** do P01–P09 do PR #82. Não resolve a ambiguidade CA-HIST P02×P07 (marca `Produto-pai` como `PENDENTE DE VALIDAÇÃO` para toda a família). |
| `fontes-primarias/01_CATALOGO_E_SKUS/DICIONARIO_DE_SKUS.csv` | 25/08 | **Duplicata/reformatação** | Mesmo conteúdo da FASE 2 do .md acima (16 linhas = 13 prefixos), em CSV. |
| `fontes-primarias/01_CATALOGO_E_SKUS/SANEAMENTO_DE_SKUS.csv` | 25/08 | **Duplicata/reformatação** | Mesmo conteúdo da FASE 3 do .md acima (91 linhas), em CSV. |
| `fontes-primarias/01_CATALOGO_E_SKUS/PARETO_E_PRIORIDADE.csv` | 25/08 | **Duplicata/reformatação** | Mesmo conteúdo da FASE 4 do .md acima (69 linhas = SKUs pós-exclusão de ARQUIVAR), em CSV. |
| `fontes-primarias/01_CATALOGO_E_SKUS/SKU_PARA_JORNADA_E_ENTREGA.csv` | 25/08 | **Duplicata/reformatação** | Mesmo conteúdo da FASE 6 do .md acima, em CSV. |
| `fontes-primarias/01_CATALOGO_E_SKUS/INVENTARIO_DE_ARTEFATOS.csv` | 25/08 | **Duplicata/reformatação** | Mesmo conteúdo da FASE 1 do .md acima (24 artefatos-fonte catalogados), em CSV. |
| `fontes-primarias/01_CATALOGO_E_SKUS/MAPA_DE_RECONCILIACAO_ASAAS.csv` | 25/08 | **Histórico superado** | Mapa de link Asaas por SKU da época (21 concluídos, 26 pendentes) — sobre reconciliação de pagamento, não sobre produto-pai; superado pela reconciliação real de `catalog_source_divergences` que o PR #82 já cobriu (Seção 5). |
| `fontes-primarias/03_ARQUITETURA_OFERTA_JORNADA/03_ARQUITETURA_OFERTA_JORNADA_Clube_Ancestral.md` | 25/08 | **Nova, relevante** | Define uma **terceira** taxonomia de produto-pai (Núcleo Top10 + Ampliado Top30), com família "Estratégia/pesquisa/documentação" agrupando **CA-CID-002, CA-HIST-001 e CA-HIST-004** (linha 80) — evidência de que CA-HIST é tratado como pesquisa-meio, não como memória/legado independente. Origem direta da migration `20260821133440` (mesma lista de 10 produtos-pai, quase idêntica lista de 20 complementos). |
| `fontes-primarias/03_ARQUITETURA_OFERTA_JORNADA/classificacao_91_skus_arquitetura_proposta.csv` | 25/08 | **Duplicata/reformatação** | Confirmado por diff amostral: mesmo conteúdo da tabela "Classificação integral dos 91 SKUs" do .md acima, em CSV. |
| `fontes-primarias/04_TOP_SKUS_CANDIDATOS/04_TOP_SKUS_CANDIDATOS_Clube_Ancestral.md` | 25/08 | **Nova, relevante (mas convergente com a anterior)** | Matriz de pontuação 0–5 (critérios A–J) para os mesmos 91 SKUs; mesma lista de Top10 da 03_ARQUITETURA (CA-CID-001/002/023/003, CA-ASS-002, CA-HIST-001/004, CA-MEM-003/004, CA-IND-005); reforça família "2. Estratégia, pesquisa e documentação" para CA-CID-002 e implicitamente CA-HIST. |
| `fontes-primarias/04_TOP_SKUS_CANDIDATOS/matriz_priorizacao_top_skus.csv` | 25/08 | **Duplicata/reformatação** | Mesma matriz do .md acima, em CSV (92 linhas = header + 91 SKUs). |
| `fontes-primarias/04_TOP_SKUS_CANDIDATOS/relatorio_advisor_top_skus.md` | 25/08 | **Histórico superado** | Relatório de advisor sobre o processo de pontuação em si (metodologia), não uma lista adicional de produto-pai. |
| `fontes-primarias/04_TOP_SKUS_CANDIDATOS/validacao_top_skus.json` | 25/08 | **Duplicata/reformatação** | JSON de validação de contagens (91 SKUs fonte = 91 cobertos, Top10=10, Top30=30) — confere os mesmos números do .md, sem taxonomia nova. |
| `PROPOSTA_Definicao_Top_SKUs_Arquitetura_Comercial.md` (raiz de `recuperados/`) | 24/08 (colado no chat) | **Duplicata/reformatação, mas com cotejo de código valioso** | Resumo do 04_TOP_SKUS_CANDIDATOS acima — mesma lista de Top10. Seu valor único é a Seção "Cotejo com o código atual" (linhas 51-75), que aponta `catalogo-top30.functions.ts` e `governanca.catalogo-operacional-30.tsx` como infraestrutura real já existente para este tipo de classificação — achado incorporado à Seção 2 deste documento. |
| `PROPOSTA_Matriz_Priorizacao_Top_SKUs_91.csv` (raiz de `recuperados/`) | 24/08 | **Duplicata/reformatação** | Mesmo conteúdo do `matriz_priorizacao_top_skus.csv` acima. |
| `CA-06_Catalogo_Operacional_30.md` (raiz de `recuperados/`) | 14/08 (v1.1) | **Nova, relevante — a mais decisiva** | Versão condensada (95 linhas) do CA-06. Tabela "Entrega A" atribui `produto_mãe` explícito por SKU: **CA-HIST-001 é âncora, CA-HIST-002/004/005 → produto_mãe = CA-HIST-001, CA-HIST-006 → produto_mãe = "CA-HIST-005 + CA-CID-022"**. Confirma (linha 70-94) que `src/lib/ca06-catalogo-operacional.ts` implementa este documento "quase verbatim", validado por teste automatizado (`ca06-catalogo-operacional.test.ts`). |
| `fontes-primarias/05_CATALOGO_OPERACIONAL_30/05_CA06_Catalogo_Operacional_30_Clube_Ancestral.md` | 25/08 (commit) / 14/08 (v1.1, mesma versão) | **Duplicata/reformatação (mais completa)** | Mesma v1.1, mesma data-fonte 14/08, mas versão longa (198 linhas, com Entregas A-D). Contém o registro de que `CA-CID-021` fica na "Entrega B" (fora do Catálogo 30), classificação `FASE_2`, **sem produto-pai atribuído** — "sem evidência operacional direta... não integra o núcleo enxuto agora" (linha 76). |
| `prompts-lovable/CA-LOVABLE-BIBLIOTECA-MESTRE-v1.0.md` | 21/08 | **Nova, relevante** | Seção 8 (linhas 123-139) é a especificação de origem, palavra por palavra, das colunas `papel_comercial`/`faixa_prioridade` que a migration do mesmo dia implementou — ver Seção 2 acima. |
| `prompts-lovable-2026-08-31/CLUBE_ANCESTRAL_PRODUCTS_SKU.md` | 18/08 | **Histórico superado** | Dicionário de dados genérico para a Claude Code criar tabelas de produto — não contém lista de SKU nem menção a produto-pai/P01-P09/CA-HIST. Antecede toda a evolução documentada acima. |
| `prompts-lovable-2026-08-31/CA_Planejador_Jornada_Microentregas_Touchpoints_SKU.md` | 28/08 | **Histórico superado** | Documento de referência de jornada/touchpoints; não contém taxonomia de produto-pai nem menção a P01-P09/CA-HIST/Top10. Tangencial ao escopo deste de-para. |
| `docs/auditoria/CA-AUD-09_Reconciliacao_Catalogo_Asaas_2026-08-25.md` | 25/08 | **Histórico superado** | Reconciliação de preço/link Asaas por SKU (inclui CA-HIST-001 com preço R$5.651→R$4.500) — mecanismo de preço, não de produto-pai; já coberto pelo tema "reconciliação" na Seção 5 do PR #82. |
| `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md` | 19/08 (v1.0) | **Lista nunca implantada — achado "muita lista, pouco motor"** | Seção 8 (linhas 77-97) propõe uma **quarta** codificação de SKU (`CA-DIAG-001..004`, `CA-PESQ-001..004`, `CA-PROT-001..004`, `CA-DOC-001..006` com nomes diferentes dos reais) e cita uma tabela `legacy_sku_mappings` para ligar SKU legado ao produto-pai. **Nenhum desses códigos (`CA-DIAG-*`, `CA-PESQ-*`, `CA-PROT-*`) existe em `product_catalog`** (nem ativo, nem arquivado — não aparecem em nenhuma migration). A tabela `legacy_sku_mappings` **não existe no schema** (zero ocorrências em `supabase/migrations/` e em `src/`). É a proposta de produto-pai mais ambiciosa do corpus e a que menos aderência tem ao dado real hoje. |
| `prompts-lovable/decisoes_canonicas_crm_catalogo_e_jornadas.md` | (mesma origem, versão longa) | **Duplicata/reformatação** | Versão de 735 linhas do documento acima (vs. 184 linhas da versão em `docs/governanca/`) — mesmo conteúdo de origem, mais bruto/verboso. |

---

## 4. Documentos indicados pela tarefa que não continham lista de produto-pai/SKU

Nenhum destes altera o de-para; citados apenas para registrar que foram lidos:
- `docs/evolucao/recuperados/prompts-lovable-2026-08-31/CLUBE_ANCESTRAL_PRODUCTS_SKU.md` e `CA_Planejador_Jornada_Microentregas_Touchpoints_SKU.md` (Seção 3, linhas correspondentes).

## 5. Como três fontes independentes tratam a ambiguidade CA-HIST (P02 × P07)

O PR #82 (Seção 2, nota de ambiguidade) achou que o próprio documento de 02/09 se contradiz sobre se `CA-HIST-*` é P02 (pesquisa) ou P07 (memória/legado). O corpus mais amplo não usa os rótulos "P02"/"P07" (são exclusivos do documento de 02/09), mas três fontes independentes, de datas diferentes, convergem em tratar a família como **pesquisa/documentação**, não como memória/legado:

| Fonte | Data | Como classifica CA-HIST |
|---|---|---|
| `CA-06_Catalogo_Operacional_30.md` (Entrega A) + `src/lib/ca06-catalogo-operacional.ts` (código real) | 14/08 | Categoria "2. Estratégia, pesquisa e documentação"; CA-HIST-001 é âncora; CA-HIST-002/004/005 têm `produto_mãe = CA-HIST-001`; CA-HIST-006 é combo explícito `CA-HIST-005 + CA-CID-022` |
| `03_ARQUITETURA_OFERTA_JORNADA_Clube_Ancestral.md` (família "Estratégia/pesquisa/documentação") | 25/08 | CA-CID-002, CA-HIST-001 e CA-HIST-004 no mesmo grupo de "estruturar evidências e pasta" |
| Migration `20260821133440` (`familia_comercial`) | 21/08 | CA-HIST-001/004/005/006 todos com `familia_comercial = 'pesquisa'` (não `'memoria'` nem `'legado'`, que são os valores usados para CA-MEM-*/CA-IND-*) |

**O que isso não faz:** não decide entre P02 e P07 no vocabulário específico do documento de 02/09 (nenhuma das três fontes usa esses rótulos). O que faz é mostrar que, nas três tentativas anteriores e independentes de organizar os mesmos 91 SKUs em famílias, `CA-HIST-*` nunca foi agrupado com `CA-MEM-*`/`CA-IND-*` sob um rótulo de "memória/legado" — foi sempre tratado como uma família de pesquisa/documentação distinta. Isso pesa a favor da leitura P02 da ambiguidade do PR #82, mas a decisão final continua sendo humana.

`CA-HIST-006` (o item "sem correspondência clara" do PR #82) tem, no CA-06, uma resposta concreta e não ambígua: é um combo declarado de `CA-HIST-005 + CA-CID-022` — não uma mistura indefinida de P02+P01. `CA-CID-021` (o outro item "sem correspondência clara" do PR #82) **não tem resposta em nenhuma das 19 fontes** — inclusive a versão mais completa do CA-06 o deixa deliberadamente fora do Catálogo 30, sem produto-pai atribuído, "sem evidência operacional direta... reavaliar em ciclo futuro". Aqui o PR #82 estava certo: é genuinamente sem correspondência clara, em todo o corpus, não só na fonte que ele usou.

## 6. Os "91 SKUs" batem com os 90 de hoje?

A FASE 9 do `01_CATALOGO_E_SKUS_Saneamento_Mestre_SKUs.md` (linha 453) fixa **91 SKUs** como "visão ampla, todas as fontes", em 25/08. `product_catalog` hoje tem **90 linhas totais** (35 ativas + 55 arquivadas, conforme PR #82). Os números são próximos, mas não idênticos, e a proximidade não prova convergência linha a linha:

- A auditoria de 25/08 recomendava **69 SKUs ativos remanescentes** (91 menos 22 marcados ARQUIVAR) como "número de referência para o portfólio vivo" (linha 477). Hoje há **35 ativos** — menos da metade do que a própria auditoria de 25/08 recomendava manter vivo. Isso não é uma contradição: é evidência de que, entre 25/08 e 04/09, uma segunda rodada de corte (as migrations de 21-22/08, que já preexistiam à auditoria de 25/08, mais o arquivamento de 55 duplicatas feito na sessão do PR #82) reduziu a base ativa muito além do que a auditoria de 25/08 propunha.
- Um caso específico e verificável: **`CA-CID-003`** existia como SKU ativo (`TOP_10`, `papel_comercial = "Pós-reconhecimento"`) na migration de 21/08 e novamente na de 22/08 — mas o PR #82 confirmou que `CA-CID-003` **não existe hoje em `product_catalog`, nem ativo nem arquivado** (busca direta por `code`). Ou seja: em algum ponto entre 22/08 e 04/09, essa linha foi **excluída fisicamente**, não apenas arquivada — um caso concreto de perda de rastreabilidade que a regra "nada é apagado" do corpus histórico (citada em várias das fontes acima) pretendia evitar.
- Não foi possível, sem acesso de leitura ao Supabase nesta sessão, confirmar se as demais 34 linhas ativas de hoje mapeiam 1-para-1 contra os 91 do corpus de 25/08 (nomes, `code`s e status podem ter mudado em pontos não documentados em migration). A verificação exaustiva linha a linha fica como tarefa futura, com acesso de leitura ao Supabase.

**Conclusão desta seção:** os números são de magnitude comparável (91 → 90), mas isso não é prova de continuidade — é, na melhor hipótese, uma coincidência de escala entre dois momentos de um catálogo que passou por pelo menos três rodadas de corte documentadas (25/08 recomendando 69 ativos; migrations de 21-22/08 definindo 30-36 "Top 30"; arquivamento de 55 duplicatas em 04/09 chegando a 35 ativos) — sem que nenhuma dessas rodadas cite as anteriores como base explícita de cálculo.

---

## 7. Atualização ao PR #82

Com base no corpus mais amplo lido nesta tarefa:

1. **Família `CA-HIST-001/002/004/005` (ambiguidade P02 × P07):** **não totalmente resolvida**, mas com peso adicional a favor de P02. Três fontes independentes (CA-06 de 14/08 com implementação real em código; Arquitetura Única de 25/08; `familia_comercial` gravado na migration de 21/08) tratam a família como "pesquisa/documentação" e nunca como "memória/legado". Isso não é o mesmo vocabulário P01-P09 do documento de 02/09 que gerou a ambiguidade original, então a proprietária ainda precisa decidir se aceita esse peso de evidência como resposta a P02 vs. P07, ou se trata os dois enquadramentos (o de 02/09 e o de 14-25/08) como propostas concorrentes que ela nunca comparou lado a lado.
2. **`CA-HIST-006` (sem correspondência clara):** **resolvida parcialmente**. O CA-06 (implementado em código, confirmado por teste automatizado) declara `produto_mãe = CA-HIST-005 + CA-CID-022` — um combo específico e nomeado, não uma mistura indefinida entre P01 e P02.
3. **`CA-CID-021` (sem correspondência clara):** **continua sem resolução**. Em nenhuma das 19 fontes revisadas nesta tarefa — incluindo a versão mais completa e mais recente do CA-06 — este SKU recebe um produto-pai único. A fonte mais recente (CA-06 completo) o deixa deliberadamente de fora do núcleo de 30, como item de baixa prioridade sem evidência de demanda.
4. **P09 (Educação e autonomia) vazio:** **confirmado independentemente**, não apenas pelo documento de 02/09 que o PR #82 usou. A família "Autonomia e educação" da Arquitetura Única (25/08) diz explicitamente "nenhum produto-pai ativo nesta proposta"; a auditoria-mãe de 25/08 mostra os três `CA-CURSO-*` sempre como `Arquivado`, nunca `Ativo`; e nenhuma migration desde 19/08 insere um `CA-CURSO-*` como `TOP_10`/`TOP_30`. A lacuna é real e antiga, não uma coincidência do documento de 02/09.
5. **Achado adicional não pedido, mas relevante:** o próprio PR #82 selecionou `papel_comercial` e `familia_comercial` na sua query ao `product_catalog`, mas não os reportou nem os cruzou com sua própria ambiguidade da Seção 2 — esses campos já continham uma resposta parcial (Seção 2 e 5 deste documento). Uma iteração futura do de-para deveria reconsultar `product_catalog` com foco explícito nesses dois campos, e não apenas nos `code`s e `status_homologacao`.
6. **21 mapeamentos "limpos" do PR #82:** nenhum deles foi contradito por este corpus mais amplo. Os produtos-pai do Núcleo Top10 de 25/08 (`CA-CID-001/002/023/003`, `CA-ASS-002`, `CA-MEM-003/004`, `CA-IND-005`) e as famílias de complemento coincidem, no nível grosso, com os mapeamentos P01/P03/P04/P06/P07/P08 que o PR #82 já havia feito para esses mesmos `code`s.

---

## 8. O que este documento NÃO decide

- **Não decide** se `CA-HIST-*` é P02 ou P07 na taxonomia específica de 02/09 — apenas relata que três fontes anteriores e independentes o tratam como família de pesquisa, o que é evidência a favor de P02, não uma decisão.
- **Não decide** um produto-pai para `CA-CID-021` — confirma que nenhuma fonte do corpus, incluindo a mais recente e mais completa (CA-06), resolve esse item.
- **Não decide** se o mecanismo `papel_comercial`/`faixa_prioridade`/`produto_mae` (Seção 2) deve substituir, conviver com, ou ser descartado em favor da taxonomia P01-P09 do documento de 02/09 que o PR #82 usou — apenas confirma que o primeiro está implementado em código e o segundo não, e que essa é uma decisão de arquitetura da proprietária, não uma conclusão técnica automática.
- **Não verifica**, por falta de acesso de leitura ao Supabase nesta sessão, se `papel_comercial`/`faixa_prioridade`/`familia_comercial` ainda têm hoje (04/09) os valores gravados pelas migrations de 21-22/08 — apenas que nenhuma migration posterior no repositório os sobrescreve.
- **Não reconcilia** linha a linha os 91 SKUs do corpus de 25/08 contra as 90 linhas reais de hoje — apenas nota que os totais são próximos e aponta um caso concreto de exclusão física (`CA-CID-003`) como evidência de que a proximidade numérica não implica continuidade linha a linha.
- **Não decide** se a proposta de recodificação `CA-DIAG-*`/`CA-PESQ-*`/`CA-PROT-*` da Seção 8 do documento de governança (19/08) deve ser formalmente descartada ou ainda está em consideração — apenas confirma que nenhum desses códigos existe hoje em `product_catalog` nem em nenhuma migration, e que a tabela `legacy_sku_mappings` que ela pressupõe nunca foi criada.
- **Não altera nenhuma linha de `product_catalog`, nenhum arquivo de código, nenhuma migration.** Todas as leituras desta tarefa foram sobre arquivos versionados no repositório (`docs/`, `src/`, `supabase/migrations/`); nada foi escrito no Supabase.
