# De-para — Catálogo de 33 produtos-pai por jornada (seção 8, CA-DECISOES-CANONICAS 19/08) × 35 SKUs reais (P8, 25/09/2026)

## Contexto

A Proprietária pediu, repetidamente, para verificar se o catálogo de 33
produtos-pai por jornada descrito em `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md`
(19/08/2026, seção 8) e a lógica de `case_services` (seção 9) foram
executados.

## Achado 1 — `case_services` já é real e já funciona (não é pendência)

Confirmado por leitura direta do schema (`information_schema.columns`) e
dos dados reais: `case_services` tem exatamente os campos da fórmula da
seção 9 (`case_id`, `product_catalog_id`, `citizenship_track_id`,
`escopo_aprovado`, `composicao_familiar`, `condicao_comercial_aprovada`,
`preco_acordado`, `status`, `contrato_referencia_interna`,
`responsavel_user_id`), criada na mesma migration do dia do documento
(`20260819203256_...sql`). O caso-piloto Ana Luiza
(`CA-CID-AT-FAM-2026-001`) tem uma linha real em `case_services`, com
composição familiar, trilha e condição comercial batendo quase
literalmente com a seção 12 do documento. João segue como `lead`, sem
`case_services` — o estágio correto para "aceite verbal", não um gap.

## Achado 2 — o catálogo de 33 produtos-pai da seção 8 nunca foi criado

A mesma migration de 19/08 só inseriu 3 produtos-tampão em
`product_catalog` (`PROD-DIAG-FAM-MULTI`, `PROD-DIAG-INDIVIDUAL`,
`PROD-COMPL-DOC`) — o suficiente para o piloto da Ana funcionar. Nenhum
dos 33 códigos `CA-DIAG-*`/`CA-PESQ-*`/`CA-DOC-*`/`CA-PROT-*`/`CA-POS-*`/
`CA-MEM-*`/`CA-ASS-*` da seção 8 existe hoje sob esse prefixo exato. Em
paralelo, cresceu o catálogo real de 35 SKUs (`CA-CID-*`, `CA-ASS-*`,
`CA-HIST-*`, `CA-IND-*`, `CA-MEM-*`, `CA-COMBO-*`, `CA-FAM-*`,
`CA-WPP-*` — o mesmo catálogo do P6), nunca reconciliado contra os 33.
`legacy_sku_mappings`, a tabela que a própria seção 8 previa para essa
ligação, não existe.

## De-para (leitura direta de cada `nome_comercial` real contra a descrição da seção 8)

Regra aplicada (decisão da Proprietária): **o SKU real vira alias do
código novo — nenhum `code` já em uso é renomeado ou apagado.**

| Código seção 8 | Nome (seção 8) | Correspondência real |
|---|---|---|
| CA-DIAG-001 | Diagnóstico de Cidadania por Etapas | Próximo: `CA-CID-001` "Consultoria de Cidadania Italiana"; produto-tampão `PROD-DIAG-INDIVIDUAL` já existe |
| CA-DIAG-002 | Diagnóstico Familiar Multipaís | **Alias de `PROD-DIAG-FAM-MULTI`** (já homologado, já em uso — caso Ana) |
| CA-DIAG-003 | Diagnóstico de Pesquisa de Origem | Sem SKU real |
| CA-DIAG-004 | AncestralScan / Discovery gratuita | Sem SKU real (`CA-CID-022`/`026` ausentes do catálogo, já achado no P6) |
| CA-PESQ-001 | Pesquisa Genealógica de Base | Próximo: `CA-HIST-005` "Pesquisa de Base Familiar" |
| CA-PESQ-002 | Pesquisa Genealógica Familiar Ampliada | Próximo: `CA-HIST-004` "Pacote Família Completa (3 Sobrenomes)" |
| CA-PESQ-003 | Pesquisa Documental Direcionada | Ambíguo — sem SKU com nome equivalente |
| CA-PESQ-004 | Pesquisa de Linha Alternativa/Multipaís | Próximo: `CA-HIST-006` "Combo Pesquisa + Diagnóstico de Cidadania Italiana" |
| CA-DOC-001 | Plano Documental e Checklist de Prontidão | Sem SKU real — mais próximo de artefato do Planejador (checklist) |
| CA-DOC-002 | Montagem de Pasta para Cidadania | **Alias de `CA-CID-002`** "Montagem Completa de Pasta para Cidadania" |
| CA-DOC-003 | Revisão ou Atualização de Pasta | **Alias de `CA-CID-002A`+`CA-CID-002B`** (revisão + atualização) |
| CA-DOC-004 | Retificação Documental Assistida | Ambíguo — candidato `CA-CID-002C`/`CA-CID-020`, sem nome idêntico |
| CA-DOC-005 | Coordenação de Tradução e Apostilamento | Sem SKU real |
| CA-DOC-006 | Solicitação de Certidões e Registros | Próximo: `CA-CID-018` "Emissão de Transcrição de Atos" |
| CA-PROT-001 | Assessoria de Protocolo e Acompanhamento | Próximo: `CA-CID-023` "Assessoria Completa de Cidadania Italiana" |
| CA-PROT-002 | Estratégia de Via Jurídica com Parceiro | Sem SKU real |
| CA-PROT-003 | Acompanhamento Familiar de Processo Compartilhado | **Alias de `CA-CID-025`** "Acompanhamento Familiar — Processo Compartilhado" (já homologado, já em proposta real) |
| CA-PROT-004 | Preparação de Reunião ou Entrevista Consular | Sem SKU real |
| CA-POS-001 | Regularização Pós-Reconhecimento | Próximo (família): `CA-CID-006`/`009`/`016`/`018` |
| CA-POS-002 | Registros Familiares Derivados | **Alias de `CA-CID-009`+`CA-CID-016`** |
| CA-POS-003 | Passaporte e Registros Consulares | **Alias de `CA-CID-003`** "AIRE + Agendamento de Passaporte" |
| CA-POS-004 | Continuidade Cidadão | Ambíguo — sobreposição parcial com `CA-ASS-*` |
| CA-MEM-001 | Entrevista de Memória Guiada | **Alias de `CA-MEM-003`** "Entrevista Guiada com Idoso" |
| CA-MEM-002 | Livro de História Familiar | **Alias de `CA-MEM-004`** "Livro da História Familiar" (mesmo nome, número diferente) |
| CA-MEM-003 | Livro de Memórias Premium | **Alias de `CA-MEM-008`** "Livro de Memórias Premium" (mesmo nome, número diferente) |
| CA-MEM-004 | Mapa Ancestral Ilustrado | Sem SKU real vivo (existiu como candidato em `ca06-catalogo-operacional.ts`, nunca promovido) |
| CA-MEM-005 | Legado em Vídeo | **Alias de `CA-IND-002`** "Legado em Vídeo — Mini-Série de Depoimentos" |
| CA-MEM-006 | Acervo Digital Familiar | Sem SKU real vivo |
| CA-ASS-001 | Plano Essência | **Colisão de código** — ver seção própria abaixo |
| CA-ASS-002 | Plano Memórias | **Alias de `CA-ASS-002`** "Plano Memorias" (mesmo code, mesmo nome, já homologado) |
| CA-ASS-003 | Plano Legado | **Colisão de código** — ver seção própria abaixo |
| CA-ASS-004 | Plano Anual Memórias | **Colisão + deslocamento** — ver seção própria abaixo |
| CA-ASS-005 | Assinatura Pós-Reconhecimento | **Colisão + deslocamento** — ver seção própria abaixo |

## Colisão de código na linha de Assinaturas (CA-ASS-001/003/004/005)

Diferente dos demais, estes 4 códigos **já existem em `product_catalog`
sob outro nome comercial**, e dois deles (004/005) estão deslocados um
índice entre a seção 8 e o banco real:

| Código | Nome pedido pela seção 8 | Nome real hoje no banco (mesmo `code`) |
|---|---|---|
| CA-ASS-001 | Plano Essência | "Continuidade — Assinatura Base" (`em_revisao`) |
| CA-ASS-003 | Plano Legado | "Continuidade — Assinatura Familiar" (`em_revisao`) |
| CA-ASS-004 | Plano Anual Memórias | "Continuidade — Assinatura Patrimônio Ancestral" (`em_revisao`) — o nome pedido bate, na verdade, com o `CA-ASS-005` real |
| CA-ASS-005 | Assinatura Pós-Reconhecimento | "Plano Anual com Desconto — Memórias" (`homologado`) — não existe SKU real para "Assinatura Pós-Reconhecimento" sob nenhum código |

Achado que confirma a origem da divergência: `src/lib/ca06-catalogo-operacional.ts`
(14/08/2026, ainda em `main`, rotulado "PROPOSTA — PENDENTE DE VALIDAÇÃO
HUMANA") já nomeava `CA-ASS-001` = "Plano Essência" e `CA-ASS-003` =
"Plano Legado" — batendo com a seção 8, não com o banco real. Ou seja: o
nome originalmente pretendido para esses códigos era o da seção 8; o
banco real foi renomeado depois (Lovable/UI), sem reconciliação com
nenhum dos dois documentos.

**Decisão da Proprietária (25/09): aplicar a mesma lógica de alias —
nenhum `code` real é renomeado.** Este de-para registra a correspondência
por conteúdo (ex.: "CA-ASS-004 da seção 8" ↔ SKU real `CA-ASS-005`) como
referência documental. Não há ação de escrita adicional aqui — os 4
`code`s continuam exatamente como estão em produção.

## Achado à parte, corrigido nesta rodada — Ana Luiza sem `produto_pai_id`

`case_plans.produto_pai_id` do caso-piloto Ana Luiza estava `null`,
apesar de `case_services.product_catalog_id` já apontar para
`PROD-DIAG-FAM-MULTI` — cujo nome bate exatamente com o produto-pai
canônico `PP-01` ("Diagnóstico Familiar Multipaís",
`src/lib/planejador-produtos-pai.ts`). Corrigido por atualização pontual
(mesmo padrão de edição pontual do P4 — só o campo `produto_pai_id`,
nenhuma outra coluna tocada, `versao`/`plano_hash`/`status` inalterados):
`case_plans.produto_pai_id = 'PP-01'` para o plano ativo da Ana
(`id = 02a0bb14-130f-42a3-aa4e-ac2b8685bb29`).

## O que não foi feito nesta rodada (sem aprovação)

- Nenhum dos ~15 códigos "sem SKU real" foi criado em `product_catalog`
  — decisão de catálogo comercial (nome, preço, homologação) que ainda
  não foi pedida explicitamente.
- Nenhuma tabela `legacy_sku_mappings` foi criada — o de-para acima é
  documental; se a Proprietária quiser essa ligação consultável em
  tela/código no futuro, é uma decisão separada.
- Nenhum `product_catalog.code` foi renomeado, arquivado ou reaproveitado.

## Prova Lovable pós-push

Abrir Caso 360 da Ana Luiza (`CA-CID-AT-FAM-2026-001`) → seção Jornada →
cartão "Jornada do planejador" (P4) → conferir que o campo Produto-Pai
agora mostra "PP-01 — Diagnóstico Familiar Multipaís" (antes vazio).
