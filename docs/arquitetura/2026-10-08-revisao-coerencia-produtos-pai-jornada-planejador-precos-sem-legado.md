# Revisão de coerência — produtos-pai, jornada, Planejador Universal e preços

Status: aprovado
Versão: v1.1
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte(s) de evidência: instrução da proprietária de 08/10/2026 às 22:05; revisão v1.0 publicada em main no commit f0a38302ccfb186f3a337b5f079baffbe72b8105; correção da seção 9 no commit bd199972be2e26a228f60afaa5b3c85985156ca9; consulta somente de leitura ao Supabase zsxpdbhdvbuulwpepemd, tabelas planner_catalog_feed, price_catalog_rescued, controlled_taxonomies e citizenship_tracks; documentos verificacao-planejador-produtos-pai-multipais-07-09.md e trava-sku-planejador-corrigida-08-09.md.
Escopo: diretriz aprovada de reconciliação entre produtos-pai, jornadas múltiplas, Planejador Universal, contexto de vida, países e preços. Esta versão reorganiza e condensa a v1.0; a anterior permanece no histórico Git.
Premissas: Mestre, CRM Mestre e Painel Mestre OPS não alimentam o modelo, inclusive por fallback. SKU não valida nem bloqueia. Mesma tabela não prova mesma taxonomia. Condição particular não é preço universal.
Limites: aprovação documental não comprova implementação. Os cinco originais não foram recuperados integralmente; a revisão não se declara cotejo integral deles. Não há comprovação atual de testes de interface, triggers, consumidores, deploy ou migração. Valores resgatados não estão automaticamente homologados. Esta publicação não altera banco, código, contrato ou cobrança.
Substitui: v1.0 deste mesmo documento, preservada no histórico Git.
Próximos passos: executar e comprovar os cortes da seção 9, mantendo registro de alterações e aprovação específica de cada escrita externa.
Critério de aceite: seção 10.

## 1. Diretriz aprovada

Pessoa/núcleo + objetivos + contexto de vida + ramos/evidências → Planejador Universal → jornadas contextualizadas → escopo, entregas e aceite → composição comercial aprovada → execução e continuidade.

Produto-pai classifica finalidade. País/via qualifica aplicação. Fase registra progresso. Etapa de vida contextualiza a pessoa. Preço remunera escopo e condição. SKU é somente referência histórica/técnica opcional, nunca prova de elegibilidade, homologação, preço ou avanço.

## 2. Cinco perspectivas do mesmo sistema

| Perspectiva | Papel | Limite |
|---|---|---|
| Produtos-pai | Classificação da finalidade | Não equivalem a SKU nem compras obrigatórias |
| Jornada | Etapas, dependências, entregas e responsáveis | Não reduz toda a família a uma fase única |
| Planejador Universal | Composição de objetivos, ramos, contexto e aplicações | Não replica o catálogo antigo |
| Países e etapas de vida | Contexto de necessidades paralelas/sucessivas | Não tornam país ou evento um produto obrigatório |
| Preços | Referências e condições vinculadas ao escopo | Não homologam por existência de código/valor |

Dois títulos foram confirmados como origem de registros no banco: Correção Canônica — Catálogo Multipaís, Produtos-Pai, Jornada, Valores e Legado v2.0; Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados v2.1. Isso não identifica nem recupera integralmente os cinco arquivos citados pela proprietária.

## 3. Evidências e inconsistências preservadas

### planner_catalog_feed

A tabela mistura versões, registros legados, especificações pendentes, curso arquivado e associações por analogia. Não admitir a tabela inteira como alimento.

- CA-CID-001 e CA-CID-AT-001: LEGADO_RECONCILIAR; excluídos da alimentação nesse estado.
- CA-CURSO-001: ARQUIVADO_DECISAO_PROPRIETARIA com archived_at nulo. Exclusão depende também do estado semântico.
- CA-FAM-002, CA-IND-001 e CA-COMBO-001: notas reconhecem classificação por analogia sem citação nominal. Associação não prova homologação taxonômica.
- Consolidação de Dossiê Familiar Multipaís: vinculada a História, Memória e Legado Familiar, fase F3, ESPECIFICACAO_PENDENTE. Finalidade probatória versus editorial não comprovada; não reclassificar automaticamente.
- Pesquisa Genealógica por Ramo e História, Memória e Legado Familiar: nomes divergentes dos nomes completos documentados. Exigir equivalência semântica explícita.
- WhatsApp Essencial/Premium: Continuidade e Acervo Familiar com F4. Separar canal, benefício, serviço e fase; não pressupor erro ou autorização comercial.
- Estratégia de Via e Composição Familiar não apareceu como product_parent nos registros retornados. Não preencher lacuna por analogia.
- requires_case_gate=true não demonstra trava de SKU; a implementação do gate precisa ser lida.

### controlled_taxonomies

A consulta retornou fontes, documentos, evidências, achados, relações, eventos, transmissão, países, etiquetas, risco, pesquisa e relatório. Nascimento, casamento e óbito são tipo_evento. Não foi demonstrado domínio explícito completo de produto-pai, fase de jornada ou etapa de vida. Eventos não substituem o modelo de jornadas.

### citizenship_tracks

Há códigos semelhantes em organizações diferentes. Usar somente a organização aplicável; o feed/preços consultado usa 11f32aae-ea08-47e0-8114-f5d8a900c9a1.

Nessa organização, várias trilhas apresentam status_via=homologada, lifecycle_status=em_revisao e campos de evidência/aprovação vazios. A consulta não comprova conclusão jurídica atual. Aprovação operacional e confirmação jurídica são distintas.

Aplicações comerciais de Irlanda e França não tiveram trilhas completas correspondentes demonstradas na mesma organização. Bélgica, Tchéquia, Eslovênia e Países Baixos aparecem em nomes de documentos, mas sua cobertura operacional não foi comprovada pelos registros retornados. Não completar lacunas com outra organização ou Mestre.

## 4. Famílias de produto-pai documentadas

O registro de 07/09 confirma PP-01–PP-09. Preservar significado, sem recuperar SKU como autoridade:

1. Diagnóstico Familiar Multipaís.
2. Diagnóstico de Cidadania por Etapas.
3. Pesquisa Genealógica por Ramo Familiar.
4. Preparação de Prova e Pasta Documental.
5. Estratégia de Via e Composição Familiar.
6. Acompanhamento Familiar de Nacionalidade.
7. Regularização e Vida Civil Pós-Reconhecimento.
8. História de Família, Memória e Legado.
9. Continuidade e Acervo Familiar.

Uma fase pode envolver várias famílias. Memória e continuidade podem existir sem cidadania. Não foi demonstrada equivalência integral com a taxonomia concorrente de oito famílias; separar eixos não equivale a aprovar conversão não verificada.

## 5. Admissão de referências

Exigir organização correta, fonte/versionamento compatíveis, significado comprovado, escopo e aplicabilidade. Excluir legado, arquivado, rejeitado e derivado do Mestre não revalidado. Não inferir por prefixo, SKU ou analogia.

Estados de revisão: admitido; candidato em revisão; referência de preço; excluído da alimentação. Esses estados são diretriz aprovada, não declaração de atualização das linhas.

Junção por item_id pode localizar proveniência; não valida taxonomia ou jornada. Preço pendente não bloqueia planejamento; bloqueia compromisso comercial não aprovado daquele escopo. Gates reais de autorização, escopo e formalização permanecem.

## 6. Preços recuperados — não homologados por esta aprovação

Fonte: price_catalog_rescued, consulta de 08/10/2026. Valores BRL. Proveniência registrada: Planejador histórico/prompt v2.1; origem independente de cada valor não revalidada nesta rodada. Não somar automaticamente componentes sem escopo/unidade/vigência.

| Aplicação | Honorários de referência | Despesas | Taxas | Estado |
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
| Portugal | R$ 3.800 / R$ 4.400 / R$ 4.800 | R$ 1.400 | R$ 450 | Honorários divergentes |
| Itália | R$ 4.500 / R$ 4.700 / R$ 4.800 | R$ 1.600 | R$ 500 | Honorários divergentes |

Referências alemãs de diagnóstico R$ 247, pesquisa/montagem R$ 1.290 e protocolo R$ 890 têm escopos distintos da referência nacional; não declarar conflito sem comparação de escopo.

Planos Memórias/Legado: R$ 269/R$ 359. Essência R$ 179 está associado a LEGADO_RECONCILIAR e não alimenta o conjunto atual. WhatsApp Essencial/Premium R$ 79/R$ 149 permanecem condicionais. Familiar Conectado Plus R$ 490 tem vínculo por analogia não comprovado. Não inferir periodicidade/unidade por nome.

Europa geral R$ 3.500 é referência legada de triagem e fica excluída. Ana Luiza R$ 9.600 tem case_only=true e CONDICAO_PARTICULAR_DE_CASO; não precifica Áustria universalmente.

## 7. Cenários de teste conceituais

- Dois ramos/dois países: base familiar compartilhada, aplicações próprias, progresso separado e cobrança apenas de incremento demonstrado.
- História sem cidadania: pesquisa/memória/acervo sem exigência de via jurídica ou reconhecimento.
- Pessoa reconhecida com novo evento familiar: avaliação contextual de ato civil, sem aplicar itens italianos universalmente ou reiniciar tudo.
- Novo país sem preço: hipótese/investigação/escopo preliminar permitidos, sem orçamento automático ou fallback de outro país.
- Memória paralela à execução: espera externa de uma jornada não paralisa outra; responsável, próxima ação e aceite por entrega/jornada.

São testes propostos, não casos reais comprovados na interface.

## 8. Correções normativas aprovadas

Mestre não é autoridade ou fallback; produto-pai não equivale a SKU; país não determina preço; etapa de vida não é fase operacional; família não percorre sequência obrigatória única; resgate não equivale a homologação; analogia não comprova taxonomia; archived_at nulo não prova atividade; homologada não comprova regra jurídica atual sem evidência/revisão.

## 9. Publicação e execução integral

A v1.0 foi publicada em main em f0a38302ccfb186f3a337b5f079baffbe72b8105; a seção 9 foi corrigida em bd199972be2e26a228f60afaa5b3c85985156ca9. A proprietária aprovou a diretriz e solicitou execução integral em 08/10/2026. Não declarar implementação concluída sem evidências.

Cortes ainda não comprovados:

1. Recuperar os cinco originais integralmente e fixar inventário.
2. Cotejar consumidores atuais de feed, preços, catálogo, Mestre e SKU.
3. Verificar triggers/restrições antes de propor alteração de banco.
4. Classificar alimentação por proveniência/escopo; não apagar histórico.
5. Verificar estruturas existentes de contexto de vida/múltiplas jornadas antes de criar tabelas.
6. Implementar somente mudanças concretas examinadas, com testes e verificação de persistência.
7. Relacionar preços a escopo e evidência independente, sem homologação automática.
8. Registrar referências cruzadas nos cinco originais após recuperação.
9. Confirmar commit, testes e deploy separadamente; publicação documental não prova execução funcional.

## 10. Critérios de aceite

- Caso/plano válido sem SKU persiste e avança por requisitos reais.
- Nenhum consumidor usa Mestre/OPS/CRM Mestre como alimento ou fallback.
- Arquivados e LEGADO_RECONCILIAR não alimentam oferta/motor.
- Isolamento por organização preservado.
- Jornadas do mesmo núcleo têm progresso/responsáveis/próximas ações independentes.
- Contexto de vida distinto da fase operacional.
- Memória funciona sem objetivo de cidadania.
- País sem preço permite planejamento e não orçamento automático.
- Preço particular não se torna referência universal.
- Valores nulos não se tornam zero; divergências são explícitas.
- Base compartilhada não é cobrada novamente sem incremento comprovado.
- Produto-pai é associado por significado/evidência, não SKU/prefixo/analogia.
- Cinco originais recuperados e alinhados às mesmas definições.
- Testes, persistência e deploy comprovados antes do fechamento da execução.
