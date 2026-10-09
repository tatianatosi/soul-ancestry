# Revisão de coerência — produtos-pai, jornada, Planejador Universal e preços

Status: em revisão
Versão: v1.0
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte(s) de evidência: instrução atual da proprietária; consulta somente de leitura autorizada no Supabase zsxpdbhdvbuulwpepemd em 08/10/2026, tabelas planner_catalog_feed, price_catalog_rescued, controlled_taxonomies e citizenship_tracks; inventário list_tables; documentos de projeto docs/auditorias/verificacao-planejador-produtos-pai-multipais-07-09.md e docs/auditorias/trava-sku-planejador-corrigida-08-09.md; pesquisa de nomes de documentos no GitHub tatianatosi/soul-ancestry.
Escopo: reconciliar o modelo de produto, múltiplas jornadas, países, contexto familiar, etapas de vida e preços; separar registros utilizáveis, pendentes e excluídos. Revisão documental e de dados, sem implementação.
Premissas: Planilha Mestre, CRM Mestre e Painel Mestre OPS não são insumos, fontes subsidiárias, fallback ou validadores. SKU não valida nem bloqueia. Preço de um caso não é preço universal. Mesma tabela não significa mesma taxonomia.
Limites: os cinco arquivos originais não foram recuperados integralmente e individualmente. A revisão não se declara cotejo linha a linha desses cinco. O GitHub devolveu metadados/nomes e confirmação de download de um arquivo, sem disponibilizar seu texto nesta sessão. Dados do banco foram efetivamente retornados e lidos. Não houve auditoria atual de triggers, código, tela autenticada, RLS ou deploy. Não houve alteração de banco ou GitHub. Aprovação desta consulta não aprova políticas, preços ou implementação.
Substitui: nenhuma versão formalmente nesta rodada; propõe superar as premissas incompatíveis descritas abaixo.
Destino proposto após aprovação: docs/arquitetura/2026-10-08-revisao-coerencia-produtos-pai-jornada-planejador-precos-sem-legado.md.

## 1. Resultado central

Não existem cinco produtos ou cinco arquiteturas a escolher. Existem perspectivas sobre o mesmo sistema: produto-pai, jornada, composição do Planejador, aplicações multipaís/etapas de vida e preço. Elas precisam compartilhar significado e proveniência, sem fazer do catálogo antigo uma autoridade.

Modelo proposto para esta revisão:

Pessoa/núcleo + objetivo + contexto de vida + ramo/evidências → Planejador Universal → uma ou mais jornadas contextualizadas → escopo, entregas e critérios de aceite → composição comercial aprovada → execução e continuidade.

Produtos-pai classificam a natureza dos serviços. País/via qualificam uma aplicação. Fase informa o progresso da jornada. Etapa de vida informa o contexto da pessoa. Preço remunera escopo e condições definidos. Nenhuma dessas dimensões deve ser confundida com SKU.

Esta formulação é proposta de reconciliação, não afirmação de que todas essas relações já estejam persistidas.

## 2. Cinco perspectivas: reconciliação sem fingir recuperação dos cinco originais

| Perspectiva a reconciliar | Papel único | O que não pode fazer | Relação com as demais |
|---|---|---|---|
| Produtos-pai | Classificar a finalidade do serviço | Validar caso por SKU ou exigir compra de todas as famílias | Jornadas selecionam os serviços necessários |
| Jornada | Organizar etapas, dependências, entregas e responsáveis | Reduzir toda a família a uma fase única | Cada aplicação tem progresso próprio |
| Planejador Universal | Compor contexto, objetivos, ramos, países e escopo | Ser cópia de planilha ou catálogo antigo | Usa referências admitidas e registra decisões |
| Multipaís e etapas de vida | Contextualizar aplicações paralelas ou sucessivas | Converter país, nascimento ou casamento em produto obrigatório | Qualifica participantes, atos e próximos passos |
| Tabela de preços | Informar referência, proposta e condições aprovadas | Homologar por existência de valor ou código | Precifica escopo, sem duplicar base compartilhada |

Nomes recuperados pelo histórico, sem texto integral nesta sessão: auditoria de coerência dos cinco artefatos de 04/09; revisão canônica do Planejador/produtos-pai/jornada de 04/09; de-para de prompts/valores de 04/09. Dois títulos de origem foram confirmados diretamente em source_artifact no banco: “Correção Canônica — Catálogo Multipaís, Produtos-Pai, Jornada, Valores e Legado” v2.0 e “Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados” v2.1. Não há evidência suficiente para garantir que esses títulos correspondam, sem sobreposição, exatamente aos cinco arquivos mencionados pela proprietária.

## 3. O que o banco demonstra agora

### 3.1 planner_catalog_feed não é alimento integralmente confiável

A consulta retornou, na mesma tabela, registros provenientes de versões distintas, estados pendentes, registros legados, curso arquivado e classificações explicitamente feitas por analogia. Logo, não se pode admitir a tabela inteira só porque seu nome contém planner.

Achados literais relevantes:

- CA-CID-001: LEGADO_RECONCILIAR; nota pede reconciliar sem usar Planilha Mestre. Pela instrução atual, não entra na alimentação ativa enquanto permanecer legado.
- CA-CID-AT-001: LEGADO_RECONCILIAR; nota distingue condição de caso de preço de catálogo. Também excluído da alimentação ativa nesse estado.
- CA-CURSO-001: ARQUIVADO_DECISAO_PROPRIETARIA, mas archived_at está nulo. Filtrar somente archived_at não é suficiente para excluir o curso.
- CA-FAM-002: nota afirma mapeamento por analogia e que nenhum documento recebido o cita nominalmente. Essa associação não prova homologação taxonômica.
- CA-IND-001 e CA-COMBO-001: notas reconhecem ausência de citação nominal e associação por analogia. Permanecem fora do conjunto admitido até verificação de escopo e classificação.
- “Consolidação de Dossiê Familiar Multipaís”: associada a “História, Memória e Legado Familiar”, fase F3, status ESPECIFICACAO_PENDENTE. Não foi demonstrado se a entrega é pasta probatória ou artefato de memória; não reclassificar automaticamente.
- “Pesquisa Genealógica por Ramo” e “História, Memória e Legado Familiar” coexistem com nomes mais completos documentados. Sem identificador taxonômico e equivalência explícita, não basta comparar texto ou prefixo.
- “Pacote WhatsApp Essencial/Premium” está sob Continuidade e Acervo Familiar, mas em F4. Isso exige separar canal/benefício, serviço e fase; não significa automaticamente erro, nem autoriza sua oferta.
- “Estratégia de Via e Composição Familiar” consta na taxonomia de nove famílias do documento de 07/09, mas não apareceu como product_parent nos registros retornados nesta consulta. Não criar associações por suposição para preencher essa lacuna.

O campo requires_case_gate=true não demonstra, sozinho, uma trava de SKU: é necessário ler a implementação da regra para saber o que ele exige. Esta revisão não presume que todo gate seja indevido; requisitos reais de escopo, autorização e formalização continuam distintos de código comercial.

### 3.2 controlled_taxonomies não resolve sozinho as etapas de vida

Os registros retornados contêm domínios de fontes, documentos, evidências, achados, relações, eventos, transmissão, países, etiquetas, risco, pesquisa e relatório.

Nascimento, casamento e óbito estão em tipo_evento. Isso registra acontecimentos; não demonstra uma taxonomia completa de etapas de vida, objetivos e jornadas. Não foi retornado um domínio explícito de produto-pai, fase de jornada ou etapa de vida.

Consequência: esta tabela pode fornecer vocabulários auxiliares pertinentes, mas não deve ser apresentada como prova de que o modelo de múltiplas jornadas por etapa de vida já está completo.

### 3.3 citizenship_tracks exige isolamento por organização e revisão de estado

Há registros com códigos semelhantes em diferentes organization_id. A organização presente nas linhas do feed/preços é 11f32aae-ea08-47e0-8114-f5d8a900c9a1. Não unir trilhas de outras organizações por igualdade de país/código.

Dentro dessa organização há trilhas com status_via=homologada e, simultaneamente, lifecycle_status=em_revisao, status_atualizacao=a_revisar, criterio_aprovacao nulo e evidencia_aprovacao_referencia nula. Exemplos: Hungria, Romênia, Luxemburgo, Croácia, Polônia, Alemanha, Áustria, Portugal, Espanha e Itália.

Isso não permite concluir que a homologação seja inválida, mas demonstra que a evidência retornada não basta para tratar essas linhas como regras jurídicas finais e atualizadas. Podem integrar estudo contextual com ressalvas; aprovação operacional e confirmação jurídica não são sinônimos.

Os registros retornados incluem aplicações comerciais para Irlanda e França, porém não demonstram trilhas correspondentes completas na mesma organização. Não completar esse vazio usando outra organização ou o Mestre.

Bélgica, Tchéquia, Eslovênia e Países Baixos aparecem em nomes de documentos localizados no GitHub, mas não tiveram cobertura operacional demonstrada pelos registros retornados. Permanecem não confirmados nesta revisão.

## 4. Taxonomia: preservar famílias sem transformar fases em produtos obrigatórios

A fonte de 07/09 registra PP-01–PP-09 como confirmados. Esse registro documental é a base de comparação, não justificativa para recuperar SKUs antigos.

| Família documentada | Significado a preservar | Uso em jornadas |
|---|---|---|
| Diagnóstico Familiar Multipaís | Levantar contexto e hipóteses familiares | Uma base pode apoiar várias aplicações |
| Diagnóstico de Cidadania por Etapas | Investigar aplicação de país/via | Decisão por ramo, pessoa e evidência |
| Pesquisa Genealógica por Ramo Familiar | Produzir pesquisa de um ramo | Reutilizável quando escopo e autorização permitirem |
| Preparação de Prova e Pasta Documental | Organizar prova para uma finalidade | Exigências próprias de cada aplicação |
| Estratégia de Via e Composição Familiar | Definir estratégia e participantes | Não confundir com soma de pacotes |
| Acompanhamento Familiar de Nacionalidade | Coordenar execução aplicável | Jornadas podem avançar em ritmos distintos |
| Regularização e Vida Civil Pós-Reconhecimento | Atos posteriores contextualizados | Atos por pessoa/país/evento, não lista italiana universal |
| História de Família, Memória e Legado | Pesquisa/narrativa/preservação como finalidade | Pode existir sem cidadania e em paralelo |
| Continuidade e Acervo Familiar | Continuidade do vínculo e acervo | Não é contratação obrigatória de assinatura |

Não foi demonstrada equivalência integral entre a taxonomia de oito famílias por etapa de vida e a de nove famílias. A reconciliação proposta separa os eixos conceituais, sem declarar os oito nomes recuperados ou sua conversão aprovados.

## 5. Critério de admissão de tabelas e linhas

Uma linha candidata só integra o conjunto atual quando:

1. Pertence à organização aplicável.
2. Não está arquivada, rejeitada ou marcada como legado; excluir também por estado semântico, não só archived_at.
3. Tem fonte/versionamento compatíveis com a taxonomia atual.
4. Possui vínculo de significado comprovado com a família de serviço, sem inferência por prefixo, SKU ou analogia.
5. Explicita finalidade/escopo e aplicabilidade a contexto, pessoa/ramo/país quando pertinente.
6. Não converte preço pendente em bloqueio de planejamento, nem preço resgatado em preço homologado.
7. Não depende de Mestre/OPS/CRM Mestre, inclusive via cópia, fallback, rotina ou material derivado não revalidado.

Classificação proposta:

- Admitido: significado, proveniência e aplicabilidade verificados.
- Candidato em revisão: conteúdo atual potencialmente útil, mas vínculo/escopo/evidência incompletos.
- Referência de preço: preserva valor e fonte sem autorização automática de oferta.
- Excluído da alimentação: legado, arquivado, derivado do Mestre, outra organização, analogia não comprovada.

Não basta executar uma junção feed.item_id=preco.item_id e chamá-la de taxonomia. Esse vínculo pode ajudar a localizar a origem, mas SKU não decide aplicabilidade, elegibilidade, avanço, homologação ou preço.

## 6. Tabela de preços recuperada: existe, mas não é uma tabela final aprovada

Fonte desta seção: price_catalog_rescued, consulta autorizada de 08/10/2026. Valores em BRL. Linhas abaixo são referências retornadas, não oferta atual, orçamento aprovado nem preço de um produto-pai. A proveniência registrada é Planejador histórico/prompt v2.1, não consulta à Planilha Mestre. A origem independente de cada valor ainda não foi revalidada nesta sessão.

| Aplicação registrada | Honorários de referência | Despesas de referência | Taxas de referência | Situação |
|---|---:|---:|---:|---|
| Alemanha | R$ 4.200 | R$ 1.500 | R$ 500 | REFERENCIA_RESGATADA |
| Áustria | R$ 4.800 | R$ 1.800 | R$ 600 | REFERENCIA_RESGATADA |
| Croácia | R$ 4.000 | R$ 1.800 | R$ 600 | REFERENCIA_RESGATADA |
| Espanha | R$ 3.200 | R$ 1.200 | R$ 400 | REFERENCIA_RESGATADA |
| Polônia | R$ 3.900 | R$ 1.500 | R$ 450 | REFERENCIA_RESGATADA |
| Romênia | R$ 3.600 | R$ 1.400 | R$ 450 | REFERENCIA_RESGATADA |
| Brasil — naturalização | R$ 900 | R$ 300 | Não retornada | REFERENCIA_RESGATADA |
| França — naturalização | R$ 1.000 | R$ 350 | R$ 250 | REFERENCIA_RESGATADA |
| Hungria | Nulo | Não retornadas | Não retornadas | PENDENTE_DE_HOMOLOGACAO |
| Luxemburgo | Nulo | Não retornadas | Não retornadas | PENDENTE_DE_HOMOLOGACAO |
| Irlanda | Nulo | Não retornadas | Não retornadas | PENDENTE_DE_HOMOLOGACAO |
| Portugal | R$ 3.800 / R$ 4.400 / R$ 4.800 | R$ 1.400 | R$ 450 | Honorários divergentes; não selecionar automaticamente |
| Itália | R$ 4.500 / R$ 4.700 / R$ 4.800 | R$ 1.600 | R$ 500 | Honorários divergentes; não usar como padrão universal |

Não somar componentes automaticamente: não há escopo, unidade comercial, vigência e abrangência suficientes para assegurar que representam um orçamento completo comparável.

Tambiém retornaram referências associadas a itens de Alemanha: diagnóstico R$ 247; pesquisa/montagem R$ 1.290; acompanhamento de protocolo R$ 890. São escopos diferentes da referência por país de R$ 4.200; não afirmar conflito sem comparar escopo.

Planos Memórias e Legado têm referências R$ 269 e R$ 359. Essência tem R$ 179, mas seu vínculo no feed está marcado LEGADO_RECONCILIAR; fica excluído da alimentação ativa. WhatsApp Essencial/Premium têm R$ 79/R$ 149, mas benefício, comunicação e preço permanecem condicionais no feed. Familiar Conectado Plus tem referência R$ 490 e vínculo por analogia; não admitir por esse vínculo. Não presumir periodicidade, unidade de cobrança ou inclusão apenas pelo nome.

“Europa geral” tem referência R$ 3.500 e nota que a chama de referência legada de triagem; excluída do modelo atual. Não é país/via nem produto universal.

A condição da Ana Luiza, R$ 9.600, está case_only=true e CONDICAO_PARTICULAR_DE_CASO. Não precifica Áustria universalmente, diagnóstico nem assinatura genérica. É evidência de distinção entre caso e catálogo, não premissa de preço para todas as famílias.

## 7. Cenários coerentes no mesmo sistema

Os cenários seguintes são testes conceituais propostos, não casos reais encontrados no banco.

### A. Família com dois ramos e dois países

Uma base familiar, duas aplicações contextualizadas. A pesquisa comum é registrada uma vez; cada aplicação tem requisitos, participantes e progresso próprios. Composição comercial distingue base e incremento comprovado. Não há soma automática de dois pacotes nacionais nem trava por SKU faltante.

### B. História familiar sem objetivo de cidadania

Pesquisa, memória e acervo têm jornada própria. Não exigir país, via jurídica ou reconhecimento. Continuidade pode ser escolhida, mas não imposta. Isso evita reduzir o Clube a um funil de cidadania.

### C. Pessoa já reconhecida e novo evento familiar

Nascimento, casamento ou outro evento pode motivar uma avaliação contextual de vida civil. A aplicação depende da pessoa, finalidade e país pertinentes; não aplica automaticamente AIRE, SPID ou outros itens italianos a todos os países. Não reabre obrigatoriamente diagnóstico e pesquisa já concluídos.

### D. Novo país com preço ainda não definido

O Planejador pode registrar hipótese, investigação, evidências e escopo preliminar. Preço pendente limita compromisso comercial daquele escopo, não a existência do planejamento. Não preencher preço a partir de outro país ou Mestre.

### E. Continuidade e memória em paralelo à execução

Uma jornada de cidadania pode estar em espera externa enquanto uma entrega de memória avança. Uma única fase global não deve mascarar essas diferenças. Responsável, próximo passo, prazo e aceite pertencem à jornada/entrega aplicável.

## 8. Correções de premissa para todos os artefatos

| Premissa incompatível | Formulação corrigida |
|---|---|
| Catálogo/Mestre é autoridade e origem obrigatória | Só referências atuais, compatíveis e verificadas podem alimentar o Planejador |
| Produto-pai equivale a SKU homologado | Produto-pai classifica finalidade; SKU não valida |
| País define produto e preço automaticamente | País qualifica aplicação; escopo e condição definem composição comercial |
| Etapa de vida é fase de execução | São dimensões distintas; eventos contextualizam decisões |
| Toda família percorre a mesma sequência | Jornadas paralelas/sucessivas com progresso próprio |
| Fonte resgatada é preço aprovado | Resgate preserva evidência; aprovação comercial é outro ato |
| Legado pode permanecer como fallback | Legado fica fora das premissas e alimentação |
| Item por analogia comprova taxonomia | Analogias não verificadas ficam fora do conjunto admitido |
| archived_at nulo prova item ativo | Estado semântico também deve ser considerado |
| homologada prova regra jurídica atual | Estado, evidência, revisão e vigência precisam ser cotejados |

## 9. Próximos passos delimitados

1. Recuperar integralmente os cinco originais e fixar seu inventário exato antes de marcar o cotejo individual como concluído.
2. Usar esta reconciliação como versão em revisão; não convertê-la em aprovação retroativa.
3. Classificar linhas do feed segundo proveniência, significado e escopo; separar legados e associações por analogia sem apagá-los nesta rodada.
4. Verificar no código e banco consumidores, triggers e restrições que ainda possam usar SKU/Mestre como requisito. O documento de 08/09 descreve correção histórica em três camadas; não demonstra estado atual integral.
5. Identificar como persistir contexto de vida e múltiplas jornadas usando estruturas existentes, antes de propor tabelas novas.
6. Relacionar preços a escopo e condições com evidência independente; não homologar por país nem por código.
7. Após decisão da proprietária, preparar publicação canônica em docs/arquitetura e referências cruzadas nos cinco originais. Não foi feito commit.

## 10. Critérios de aceite para implementação futura

- Caso/plano válido sem SKU persiste e avança conforme requisitos reais.
- Nenhum consumidor consulta Mestre/OPS/CRM Mestre como alimentação ou fallback.
- Curso arquivado e linhas LEGADO_RECONCILIAR não entram nas ofertas nem no motor.
- Isolamento por organização é preservado.
- Duas jornadas do mesmo núcleo podem ter fases, responsáveis e próximos passos distintos.
- Etapa/contexto de vida não substitui fase operacional.
- Memória pode funcionar sem objetivo de cidadania.
- País sem preço permite planejamento e não gera orçamento automático.
- Preço de caso não vira referência universal.
- Referências/divergências aparecem como tais; valor nulo nunca vira zero.
- Base compartilhada não é cobrada novamente sem incremento de escopo demonstrado.
- Mapeamentos de produto-pai possuem evidência sem depender de prefixo/SKU/analogia.
- Os cinco documentos, quando integralmente recuperados, usam as mesmas definições e declaram claramente seu papel, fonte, status e limites.
