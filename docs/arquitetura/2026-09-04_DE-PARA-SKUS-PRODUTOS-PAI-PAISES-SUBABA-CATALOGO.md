# De-para: SKUs × Produtos-Pai × Países Novos, e Triagem da Sub-aba de Catálogo/SKU

- **Status:** proposta de de-para — pendente de decisão da proprietária (nenhuma convergência foi executada)
- **Versão:** v1.0
- **Data:** 2026-09-04
- **Responsável pela decisão:** Proprietária Administradora do Clube Ancestral
- **Classificação:** de-para de dado real contra taxonomia proposta + triagem de tela (somente leitura)
- **Repositório:** `tatianatosi/soul-ancestry`
- **Fontes:**
  - `product_catalog` (Supabase, projeto `zsxpdbhdvbuulwpepemd`), estado em 2026-09-04 após arquivamento das 55 linhas duplicadas na mesma sessão — 90 linhas totais, **35 ativas** (`archived_at is null`).
  - `docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md`, lido via `git show origin/docs/arquiva-planejador-universal-produtos-pai-jornada-2026-09-03` (não mesclado; conteúdo preservado no histórico).
  - `docs/arquitetura/contexto-motor-cidadania-v1.0.md`, lido via `git show origin/docs/arquiva-contexto-regional-juridico-motor-cidadania-2026-09-03` (não mesclado).
  - Código real em `src/` (rotas, `src/lib/*.ts`, `src/routes/_authenticated/*.tsx`) e `src/lib/navegacao-desk.ts`.
- **Escopo:** somente leitura. Nenhuma migration, nenhuma escrita em `product_catalog` ou em qualquer tabela além do que já foi arquivado antes desta tarefa. Nenhum arquivo de código foi editado.
- **Regra institucional aplicada:** nenhuma correspondência foi forçada. Onde o dado real não bate com a taxonomia proposta, ou onde o próprio documento-fonte se contradiz, isso é reportado como está — não resolvido por mim.

---

## 1. Resumo executivo

| Métrica | Valor |
|---|---|
| SKUs ativos em `product_catalog` hoje | 35 (de 90 linhas totais; as outras 55 foram arquivadas nesta sessão por duplicidade) |
| Mapeiam para 1 produto-pai (P01–P09) sem ambiguidade | 21 |
| Mapeiam, mas com ambiguidade no próprio documento-fonte (P02 vs. P07) | 4 (família `CA-HIST-*`) |
| Sem correspondência de produto-pai único (combo cruza 2+ produtos-pai) | 2 (`CA-CID-021`, `CA-HIST-006`) |
| Sem nenhum SKU ativo hoje | P09 (Educação e autonomia) — zero itens |
| Elementos citados nominalmente na seção 6 do documento-fonte que **não existem** em `product_catalog` (nem ativos, nem arquivados) | `PACOTE-PT-01/ES-01/DE-01`, `CA-CID-003`, `CA-CID-004`, `CA-CID-005`, `CA-CURSO-*` |
| Coluna de país estruturada em `product_catalog` | **não existe** — país só aparece em texto livre de `nome_comercial` em 4 dos 35 itens ativos |
| Entidades de país (`country_catalog` etc.) do segundo documento-fonte implementadas no schema real | zero (confirmado nesta sessão, ver Seção 4) |
| Sub-abas reais do grupo "Catálogo" no Desk | 5 rotas, todas com leitura/escrita real em tabela Supabase — nenhuma é lista estática pura (ver Seção 5) |
| Peça estática pura encontrada no perímetro "Catálogo" | `governanca.catalogo-operacional-30.tsx` (CA-06) — já mora em Governança, como a regra da proprietária pede |

---

## 2. De-para: SKU ativo → produto-pai (P01–P09)

Fonte da lista de SKU: `select code, nome_comercial, familia_comercial, tipo_oferta, papel_comercial, status_homologacao, jornada_fase from product_catalog where archived_at is null order by code` (35 linhas, executado nesta sessão).

Legenda de precisão:
- **exata** — o próprio documento-fonte cita este `code` (ou a família `CA-XXX-*`) nominalmente na seção 6 ("De-para do legado"), ou o nome/papel comercial repete quase literalmente os "derivados que absorve" do P-código na seção 4.
- **aproximada** — compatível por tema/família comercial, mas não citado nominalmente nem literal na seção 4/6.
- **sem correspondência clara** — o item cruza mais de um produto-pai (ex.: um combo que mistura diagnóstico com pós-cidadania) ou não há base textual para escolher um único P-código.

| Code real (ativo) | Nome comercial | Produto-pai proposto | Precisão | País(es) aplicável(is) hoje | Estado de catálogo proposto | Observação |
|---|---|---|---|---|---|---|
| `CA-CID-001` | Consultoria de Cidadania Italiana | **P01** — Diagnóstico de elegibilidade e direção | exata | Itália (citado no `nome_comercial`) | `CANONICO_ATIVO` | `papel_comercial` = "Diagnóstico e direção" repete a definição de P01 quase literalmente; não citado por `code` na seção 6, mas o casamento textual é direto. |
| `CA-CID-002` | Montagem Completa de Pasta para Cidadania | **P03** — Estratégia documental e saneamento de dossiê | exata (via derivados, não citado por code na seção 6) | não estruturado | `EM_REVISAO_COMERCIAL` (status real = `bloqueado`) | "montagem" está literalmente nos derivados de P03 na seção 4. |
| `CA-CID-002A` | Revisão de Pasta para Cidadania | **P03** | exata (citado: "CA-CID-002A/B/C/D → módulos de P03") | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-CID-002B` | Atualização de Pasta para Cidadania | **P03** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-CID-002C` | Complemento de Pasta para Cidadania | **P03** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-CID-002D` | Pasta + Checklist de Pendências | **P03** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-CID-006` | Combo Codice + SPID | **P06** — Pós-reconhecimento e vida civil | exata (citado: "CA-CID-003, 006, 009, 016, 018 → P06") | não estruturado (tema pós-cidadania italiana) | `EM_REVISAO_COMERCIAL` (real = `em_revisao`) | `CA-CID-003`, citado no mesmo grupo, **não existe** em `product_catalog` (nem ativo nem arquivado). |
| `CA-CID-009` | Registro de 1º Filho | **P06** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-CID-016` | Registro de Filhos Adicionais (mesmo pedido AIRE) | **P06** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-CID-018` | Emissão de Transcrição de Atos no País de Origem Europeia | **P06** | exata (citado) | Europa (genérico, texto livre) | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-CID-019` | Declaração de Valor — Ensino Fundamental até Universidade | **P03** (candidato) | aproximada | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Não citado no documento-fonte. Poderia também ser lido como P06 (uso pós-reconhecimento, matrícula escolar no exterior); não force — decisão humana. |
| `CA-CID-020` | Consultoria e Declaração de Valor | **P03** (candidato) | aproximada | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Mesma ressalva de `CA-CID-019`. |
| `CA-CID-021` | Combo Starter Cidadania (Códice + SPID + Consultoria Express) | — | **sem correspondência clara** | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Combo mistura "Consultoria Express" (P01) com Códice+SPID (P06, mesmo padrão de `CA-CID-006`). Cruza dois produtos-pai; não escolhi um. |
| `CA-CID-023` | Assessoria Completa de Cidadania Italiana | **P04** — Execução de reconhecimento/nacionalidade | exata (citado: "reclassificar como instância de P04 para Itália") | Itália (citado no `nome_comercial` e no de-para do documento) | `PILOTO_CONTROLADO` (documento-fonte trata como instância país-específica, não molde universal) | Documento-fonte é explícito: "válido como referência de execução italiana, mas país-específico... não como molde universal". |
| `CA-CID-025` | Acompanhamento Familiar — Processo Compartilhado | **P05** — Gestão familiar e expansão do núcleo | exata (citado: "CA-CID-025 → módulo de P05") | não estruturado | `COMPLEMENTO_CONDICIONAL` (já homologado, `jornada_fase = execucao`) | Único item da lista já `status_homologacao = homologado` fora da família assinatura/WhatsApp. |
| `CA-COMBO-001` | Combo Vó (Restauração + Entrevista + Diário) | **P07** — Pesquisa histórica, memória e legado | aproximada | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Não citado nominalmente; conteúdo (entrevista, diário) bate com os derivados de P07. `tipo_oferta = sazonal` é uma dimensão que a taxonomia P01–P09 não modela — ver Seção 3. |
| `CA-FAM-002` | Familiar Conectado Plus | **P08** — Continuidade, assinatura e relacionamento | exata (citado: "CA-ASS-*, CA-FAM-*, CA-WPP-* → P08, em revisão comercial") | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | `CA-FAM-001`, citado no mesmo grupo lógico (existe como item estático em `catalogo-desk.ts`), **não existe** em `product_catalog` — ver Seção 5.4. |
| `CA-HIST-001` | Estudo Genealógico e Patrimonial Aprofundado | **P02** *ou* **P07** — ambíguo no próprio documento | ambígua | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Ver nota de ambiguidade abaixo da tabela. |
| `CA-HIST-002` | Pesquisa Genealógica Extra com Sobrenome Adicional | **P02** *ou* **P07** — ambíguo | ambígua | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Ver nota de ambiguidade. |
| `CA-HIST-004` | Pacote Família Completa (3 Sobrenomes) | **P02** *ou* **P07** — ambíguo | ambígua | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Ver nota de ambiguidade. |
| `CA-HIST-005` | Pesquisa de Base Familiar | **P02** *ou* **P07** — ambíguo | ambígua | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | Ver nota de ambiguidade. |
| `CA-HIST-006` | Combo Pesquisa + Diagnóstico de Cidadania Italiana | — | **sem correspondência clara** | Itália (citado no `nome_comercial`) | `EM_REVISAO_COMERCIAL` (`em_revisao`) | "Ponte pesquisa/cidadania" — cruza P02 (pesquisa) e P01 (diagnóstico) explicitamente pelo próprio nome. |
| `CA-IND-001` | Autobiografia Guiada — Pacote Express | **P07** | exata (citado: "CA-HIST-*, CA-MEM-*, CA-IND-* → P07") | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | "biografia" está nos derivados literais de P07. |
| `CA-IND-002` | Legado em Vídeo — Mini-Série de Depoimentos | **P07** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-IND-005` | Livro Biográfico Completo — Premium | **P07** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-IND-006` | Memória Empresarial — História da Empresa | **P07** | exata (citado; "acervo e memória empresarial" nos derivados) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-MEM-003` | Entrevista Guiada com Idoso | **P07** | exata (citado; "entrevista" nos derivados) | não estruturado | `EM_REVISAO_COMERCIAL` (`em_revisao`) | — |
| `CA-MEM-004` | Livro da História Familiar | **P07** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-MEM-008` | Livro de Memórias Premium | **P07** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`bloqueado`) | — |
| `CA-WPP-002` | Pacote WhatsApp Premium | **P08** | exata (citado; "canais premium" nos derivados) | não estruturado | `COMPLEMENTO_CONDICIONAL` (já homologado; `catalogo-desk.ts` exige `case_service` e justificativa de escopo) | `CA-WPP-001`, citado no mesmo grupo lógico (existe como item estático em `catalogo-desk.ts`), **não existe** em `product_catalog` — ver Seção 5.4. |
| `CA-ASS-001` | Continuidade — Assinatura Base | **P08** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (real = `em_revisao`) | — |
| `CA-ASS-002` | Plano Memórias | **P08** | exata (citado) | não estruturado | `CANONICO_ATIVO` (já `homologado`) | Nome sugere P07 (memória), mas natureza comercial é recorrência — a taxonomia trata "natureza da cobrança" (P08) e "tema do conteúdo" (P07) como eixos diferentes; este item está nos dois. |
| `CA-ASS-003` | Continuidade — Assinatura Familiar | **P08** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`em_revisao`) | — |
| `CA-ASS-004` | Continuidade — Assinatura Patrimônio Ancestral | **P08** | exata (citado) | não estruturado | `EM_REVISAO_COMERCIAL` (`em_revisao`) | — |
| `CA-ASS-005` | Plano Anual com Desconto — Memórias | **P08** | exata (citado) | não estruturado | `CANONICO_ATIVO` (já `homologado`) | Mesma observação de `CA-ASS-002` sobre o eixo tema × natureza de cobrança. |

**Nota de ambiguidade — família `CA-HIST-*` (4 itens, P02 vs. P07):** o próprio documento-fonte se contradiz. Na seção 4 (taxonomia), os derivados de **P02** — "Reconstrução genealógica e prova de linhagem" — são listados como "pesquisa base, estudo aprofundado, pesquisa por sobrenome, relatórios de evidência", o que bate quase palavra por palavra com os nomes comerciais de `CA-HIST-001` (Estudo... Aprofundado), `CA-HIST-002` (...Sobrenome Adicional) e `CA-HIST-005` (Pesquisa de Base). Já na seção 6 (de-para do legado), a mesma família é despachada em bloco para **P07** ("CA-HIST-*, CA-MEM-*, CA-IND-* → P07"). Não resolvi essa contradição — ela precisa de decisão humana: `CA-HIST-*` é pesquisa-meio-de-cidadania (P02) ou é um produto de memória/legado independente (P07)? A resposta provavelmente não é a mesma para os 4 itens (`CA-HIST-004`, por exemplo, é "pesquisa familiar ampliada" — mais próximo de P02 puro que os outros).

**P09 (Educação e autonomia):** zero SKUs ativos mapeiam para P09 hoje. O documento-fonte já admite isso — P09 é definido como "kits, cursos, webinars; não entra na jornada de cidadania sem decisão comercial", e nenhum `CA-CURSO-*` existe em `product_catalog` (nem ativo, nem arquivado — busca direta por `code`). P09 é taxonomia pura, sem dado real por trás ainda.

**Itens citados no de-para original (seção 6) que não existem em `product_catalog` hoje** — busca direta confirmou zero linhas, ativas ou arquivadas, para: `PACOTE-PT-01`, `PACOTE-ES-01`, `PACOTE-DE-01` (e variantes por país), `CA-CID-003`, `CA-CID-004`, `CA-CID-005`, `CA-CURSO-*`. Esses elementos existiam apenas no Planejador legado (planilha) ou já foram descontinuados antes de qualquer migração para a tabela real — o de-para do documento-fonte, nesses pontos, descreve a planilha antiga, não o catálogo atual.

---

## 3. O que a taxonomia P01–P09 não cobre no dado real

Dois eixos aparecem no dado real (`product_catalog`) que não têm lugar na taxonomia de 9 produtos-pai, e nenhum mapeamento acima tenta forçar isso a caber:

1. **Natureza de cobrança (recorrente vs. pontual) é ortogonal a tema.** `CA-ASS-002`/`CA-ASS-005` ("Plano Memórias") são recorrência (P08) sobre um tema de memória (P07) — a taxonomia não separa esses dois eixos.
2. **`tipo_oferta = "sazonal"`** (`CA-COMBO-001`) é um terceiro valor do campo real que não existe em nenhuma classificação do documento-fonte (que só fala em `produto_pai`, `complemento`, `contextual`).

Isso não é um problema a resolver aqui — é um limite explícito do que a taxonomia proposta cobre, para a proprietária decidir se P01–P09 precisa de um eixo adicional ou se esses casos ficam como exceção documentada.

---

## 4. Países novos — cobertura proposta em `contexto-motor-cidadania-v1.0.md`

Confirmado nesta sessão (não repetido aqui em detalhe): **nenhuma** das 14 entidades que este documento propõe (`country_catalog`, `legal_frameworks` etc.) existe no schema real. É especificação pura. A tabela abaixo é a matriz de cobertura do documento, sem de-para contra dado real — porque não há dado real de país para comparar. `product_catalog` não tem coluna de país (confirmado: 92 colunas listadas, nenhuma chamada `pais`/`country`/`nacionalidade`); país só aparece em texto livre de `nome_comercial` em 4 dos 35 itens ativos (`CA-CID-001`, `CA-CID-018`, `CA-CID-023`, `CA-HIST-006` — todos mencionam Itália ou "Europeia" genericamente).

| Grupo (documento) | Países (ISO) | Estado proposto no documento | Existe estrutura real hoje? |
|---|---|---|---|
| Publicados no site | IT, PT, ES, DE, AT, PL, HU, LU | "Publicado" / "Migrar e revalidar"; HU e LU com "preço bloqueado" | Não — nenhuma tabela de país; presença só em texto livre |
| Operacionais (fora do site) | HR, RO, CZ, SI | "Pré-cadastro interno" / "Regra jurídica pendente" | Não |
| Expansão controlada | NL, BE, EE, LV, LT | "Piloto jurídico interno" / "Detecção de vínculo; backlog jurídico" | Não |
| Backlog oriental | SK, UA, BG, RS, MD | `PESQUISA_JURIDICA_PENDENTE`, sem preço | Não |

Isso confirma, com dado real, a premissa central dos dois documentos ("país é parâmetro, não estrutura"): hoje o catálogo realmente não tem onde guardar país como campo — o que é consistente com a decisão proposta (país entra como parâmetro de elegibilidade/execução dentro da jornada J0–J8, não como coluna do catálogo ou como SKU por país). Isso não é uma recomendação minha de criar a coluna — é só o registro de que a premissa e o dado real não se contradizem.

---

## 5. Triagem da sub-aba de SKU/catálogo no Desk

A navegação real (`src/lib/navegacao-desk.ts:183-191`) tem um grupo `"Catálogo"` dentro de `"Contratos e financeiro"`, com 5 rotas. Investiguei cada uma lendo a rota, a `server fn` e a tabela Supabase por trás. Nenhuma delas é lista estática pura — todas as 5 leem e a maioria escreve em tabela real.

| Rota (label no menu) | Arquivo | Tabela(s) Supabase real(is) | Classificação | Veredito |
|---|---|---|---|---|
| `/catalogo` — "Catálogo e SKUs" | `src/routes/_authenticated/catalogo.tsx:1-174`, lê via `src/lib/catalogo-importacao.functions.ts:21-82` | `product_catalog` (filtro `pareto_classificacao = 'TOP_PARETO'`, 29 dos 35 ativos) + `catalog_source_divergences` | **Alimento** | Mantém em Governança/Contratos — tela lê dado real e é a porta de entrada do catálogo comercial. |
| `/homologacao-skus` — "Homologação de SKUs" | `src/routes/_authenticated/homologacao-skus.tsx:1-305`, lê/escreve via `src/lib/catalogo-canonico.functions.ts` e `src/lib/homologacao-revisao.functions.ts` | `product_catalog` (leitura) + `catalog_audit_events` (grava decisão de homologação) | **Alimento** | Decisão humana real, com escrita auditada. Mantém. |
| `/conciliacao-catalogo` — "Conciliação de catálogo" | `src/routes/_authenticated/conciliacao-catalogo.tsx:1-159`, via `src/lib/conciliacao-catalogo.server.ts` | `product_catalog`, `proposals`, `contracts`, `service_orders`, `catalog_source_divergences`, `catalog_reconciliation_runs`, `audit_logs` | **Alimento** | Motor de bloqueio de OS/contrato por divergência — é operacional, não referência. Mantém. |
| `/divergencias-catalogo` — "Divergências de catálogo" | `src/routes/_authenticated/divergencias-catalogo.tsx:1-202`, via `src/lib/divergencias-catalogo.server.ts` | `catalog_source_divergences` (183 linhas reais hoje), `crm_casos`, `contracts`, `service_orders`, `audit_logs` | **Alimento** | Tela grava observação de resolução (escrita real, auditada). Mantém. |
| `/governanca/catalogo-operacional-30` — "Catálogo Operacional 30 (CA-06)" | `src/routes/_authenticated/governanca.catalogo-operacional-30.tsx:1-241`, dados 100% de `src/lib/ca06-catalogo-operacional.ts` | **nenhuma** — array TypeScript hardcoded, sem `useServerFn`, sem `supabase.from(...)` | **Dicionário** (mas obsoleto — ver 5.1) | Já mora em Governança, como a proprietária pede para "fuso/dicionário". Não precisa de ação de navegação. |

### 5.1. `governanca.catalogo-operacional-30.tsx` (CA-06) — dicionário, mas datado e não validado

`src/lib/ca06-catalogo-operacional.ts:10-14` se autodeclara: `CA06_STATUS_PROPOSTA = "PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA"`, versão "1.1 — Execução Econômica", data `14/08/2026` — mais de 3 semanas antes desta sessão, ainda pendente. É puramente estático: 30 itens de catálogo, 61 itens "fora do catálogo 30", matriz de ciclo de vida e decisões bloqueadoras, tudo hardcoded, zero leitura de `product_catalog`.

Achado relevante para o de-para da Seção 2: o próprio CA-06 já usa a frase `"todas as vias/países aplicáveis (parâmetro de caso; sem SKU por país)"` (`src/lib/ca06-catalogo-operacional.ts:45-46`) — ou seja, a premissa "país é parâmetro, não SKU" já estava escrita neste arquivo estático **antes** dos dois documentos de 02/09 que a proprietária citou como "premissas de ontem". Não é uma premissa nova — já existia no CA-06 desde 14/08.

Como já está em Governança (não no grupo "Catálogo" operacional), a orientação da proprietária ("dicionário pode ir em governança ou só no GitHub") já está satisfeita pela localização atual. A única pendência real é de conteúdo, não de local: a proposta segue "pendente de validação humana" há 3+ semanas — decisão de arquivar como histórico, validar, ou manter pendente é da proprietária, não desta triagem.

### 5.2. Tabela `sku_catalog` — órfã, candidata a arquivar como histórico

`sku_catalog` existe no schema (`select * from information_schema.columns` confirmou 21 colunas, incluindo `archived_at`/`archive_reason` já prontos) e tem **zero linhas**. Busca por `.from("sku_catalog")` em todo `src/` — **zero ocorrências**. Nenhuma rota, nenhuma `server fn`, nenhum componente lê ou escreve nela.

As únicas duas menções ao nome `"sku_catalog"` em código são rótulos de texto, não consultas reais à tabela:
- `src/lib/matriz-equivalencia.ts:133` — a própria Matriz de Equivalência (rota → dado → estado) declara `{ mockup: "Catálogo comercial", rota: "/catalogo", dado: "product_catalog, sku_catalog", estado: "implementado" }`. Isso está **desatualizado**: `/catalogo` (Seção 5, linha 1 desta tabela) lê `product_catalog` e `catalog_source_divergences` — nunca `sku_catalog`. A própria matriz de governança que deveria apontar o de-para real está com um erro de rótulo aqui.
- `src/lib/alertas-derivados.ts:303` — usa a string literal `"sku_catalog"` como rótulo de origem de um alerta de divergência, mas o alerta é gerado a partir de `catalog_source_divergences` (parâmetro `entrada.divergencias`), não de uma consulta à tabela `sku_catalog`.

**Veredito:** `sku_catalog` é uma tabela sem mecanismo nenhum por trás — nem alimento, nem indicador, nem dicionário (não é nem lida por código para virar lista estática). É esqueleto morto. Segundo a regra de "nada é apagado", não recomendo dropar a tabela agora (fora do escopo desta tarefa, que é somente leitura), mas ela é candidata natural a documentar como legado/arquivado — e o rótulo errado em `matriz-equivalencia.ts:133` merece correção em uma tarefa futura de código (não fiz essa edição aqui: está fora do escopo somente-leitura desta tarefa).

### 5.3. Outras tabelas do perímetro "Catálogo" — mecanismo real, ainda sem dado

`catalog_reconciliation_runs`, `catalog_audit_events`, `catalog_payment_link_refs` e `sku_price_exceptions` estão todas com **zero linhas** hoje, mas diferente de `sku_catalog`, todas têm código real de leitura/escrita:
- `catalog_reconciliation_runs` — escrita real em `src/lib/conciliacao-catalogo.server.ts:278,316,364` (grava a cada execução de conciliação).
- `catalog_audit_events` — escrita real em `src/lib/catalogo-canonico.functions.ts:162` (grava a cada confirmação de homologação).
- `catalog_payment_link_refs` — leitura real em `src/lib/catalogo-canonico.functions.ts:50`.
- `sku_price_exceptions` — leitura/escrita real em `src/lib/regra-comercial.functions.ts:88`, `src/lib/instrumentos-preparacao.functions.ts:123` e `src/lib/escopo-conferencia.server.ts:140`.

Zero linhas aqui significa "ainda não foi exercido" (ninguém homologou em lote, conciliou uma proposta ou abriu uma exceção de preço nesta base ainda) — não significa "sem mecanismo". Diferença importante da `sku_catalog`: estas quatro são **alimento com prato vazio**, não dicionário nem tabela morta.

### 5.4. Divergência entre `catalogo-desk.ts` (estático) e `product_catalog` (real)

`src/lib/catalogo-desk.ts` é um array TypeScript hardcoded (`COMPLEMENTOS_TOP30`) usado por `src/lib/blueprint.ts:10` para checar bloqueios de proposta. Ele lista `CA-WPP-001` ("Pacote WhatsApp Essencial") e `CA-FAM-001` ("Familiar Conectado") como itens de catálogo — nenhum dos dois existe em `product_catalog`, nem ativo nem arquivado (busca direta confirmou). Só as variantes `-002` (`CA-WPP-002`, `CA-FAM-002`) existem na tabela real.

Isso é exatamente o padrão "muita lista, pouco motor" que a regra do projeto pede para não deixar passar: um dicionário estático (`catalogo-desk.ts`) descrevendo SKUs que a fonte de verdade real (`product_catalog`) não tem. Não decidi se isso é erro no dicionário (itens que nunca deveriam ter sido cadastrados lá) ou lacuna real no catálogo (itens que deveriam ser criados em `product_catalog`) — é uma divergência para a proprietária resolver, documentada aqui, não corrigida.

---

## 6. O que este documento NÃO decide

- **Não decide** qual produto-pai (P02 ou P07) é o correto para a família `CA-HIST-*` — o próprio documento-fonte se contradiz nisso (Seção 2, nota de ambiguidade); é decisão humana.
- **Não decide** como resolver os combos que cruzam produtos-pai (`CA-CID-021`, `CA-HIST-006`) — apenas relata que cruzam.
- **Não decide** se `PACOTE-PT-01/ES-01/DE-01`, `CA-CID-003/004/005` e `CA-CURSO-*` devem ser recriados em `product_catalog` como itens novos, ou se ficam apenas como referência histórica da planilha legada — apenas confirma que não existem na tabela real hoje.
- **Não decide** se a tabela `sku_catalog` deve ser arquivada, reaproveitada ou eventualmente removida — apenas documenta que está órfã (zero linhas, zero código real por trás) e que dois arquivos de código a citam de forma desatualizada.
- **Não decide** se `catalogo-desk.ts` deve perder `CA-WPP-001`/`CA-FAM-001` ou se `product_catalog` deve ganhá-los — apenas registra a divergência entre dicionário estático e tabela real.
- **Não decide** o estado de catálogo final (`CANONICO_ATIVO`, `MODULO_ATIVO` etc.) de nenhum dos 35 SKUs — a coluna "Estado de catálogo proposto" na Seção 2 é uma leitura mecânica de `status_homologacao` real cruzada com a taxonomia do documento-fonte, não uma homologação.
- **Não decide** se o CA-06 (`governanca.catalogo-operacional-30.tsx`) deve ser validado, atualizado para v1.2 ou arquivado como histórico — apenas confirma que já está no lugar certo da navegação (Governança) e que segue "pendente" há mais de 3 semanas.
- **Não decide** nenhuma cobertura de país nova — a Seção 4 é o estado da proposta do documento-fonte, sem que nenhuma estrutura real de país exista para comparar.
- **Não altera nenhuma linha de `product_catalog`, nenhum arquivo de código, nenhuma migration.** Todas as 55 linhas duplicadas já haviam sido arquivadas antes desta tarefa começar; nada mudou no banco ou no repositório durante esta investigação.
