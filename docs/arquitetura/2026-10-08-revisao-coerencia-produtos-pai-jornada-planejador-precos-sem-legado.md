# Revisão de coerência — produtos, jornada, Planejador e preços

Status: aprovado
Versão: v1.2
Data: 2026-10-08
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: instruções da proprietária em 08/10/2026; site clubeancestral.com.br; motor em src/lib/orcamento-produtos-pai.ts; consulta anterior das tabelas planner_catalog_feed, price_catalog_rescued, controlled_taxonomies e citizenship_tracks.
Escopo: corrigir o texto que ainda preservava PP-01–PP-09 e transformar as evidências do feed em regra executável.
Premissas: governam o propósito da jornada e os prefixos estáveis CA-CID e CA-MEM. PP, Top 10/Top 30, produto-mãe e códigos de rodada horária não governam. SKU, Planilha Mestre, CRM Mestre e OPS não alimentam nem validam.
Limites: esta versão corrige o documento. Não regrava banco nem substitui os arquivos TypeScript listados na correção de motor.
Substitui: v1.1 deste arquivo, em especial a seção 4 que mandava preservar PP-01–PP-09. O histórico Git conserva a v1.1.
Critério de aceite: nenhuma leitura desta versão trata PP como taxonomia vigente.

## 1. Os dois títulos não são os cinco arquivos

Correção Canônica — Catálogo Multipaís, Produtos-Pai, Jornada, Valores e Legado v2.0 e Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados v2.1 são origem registrada de linhas no banco. Não recuperam os cinco arquivos citados pela proprietária e não autorizam usar a tabela inteira como alimento.

## 2. Feed: o que entra e o que fica fora

planner_catalog_feed mistura versão, legado, pendência, curso arquivado e analogia. A tabela inteira não alimenta o Planejador.

| Registro | Estado | Regra |
|---|---|---|
| CA-CID-001 e CA-CID-AT-001 | LEGADO_RECONCILIAR | Fora da alimentação enquanto permanecerem legado. O propósito de cidadania continua em CA-CID, sem reativar essas linhas por prefixo. |
| CA-CURSO-001 | ARQUIVADO_DECISAO_PROPRIETARIA, archived_at nulo | Fora. O estado semântico exclui; data vazia não reativa. |
| CA-FAM-002, CA-IND-001 e CA-COMBO-001 | Analogia sem citação nominal | Fora. Analogia não homologa. |
| Consolidação de Dossiê Familiar Multipaís | ESPECIFICACAO_PENDENTE, fase F3 | Não reclassificar. Não está provado se é prova ou editorial. |
| Pesquisa Genealógica por Ramo e História, Memória e Legado Familiar | Nomes divergentes | Não equivaler por texto parecido. |
| WhatsApp Essencial/Premium | Continuidade com fase F4 | Separar canal, benefício, serviço e fase. Não autorizar oferta. |
| Estratégia de Via e Composição Familiar | Ausente como product_parent | Não preencher por analogia. |
| requires_case_gate=true | Campo não lido na implementação | Não tratar como prova de trava de SKU nem como autorização. |

## 3. Eventos não são jornada

controlled_taxonomies trouxe fontes, documentos, evidências, relações, eventos, países, etiquetas, risco, pesquisa e relatório. Nascimento, casamento e óbito são tipo_evento. Não formam sozinhos produto, fase de jornada ou etapa de vida. Evento contextualiza; não substitui a jornada.

## 4. Trilhas

Usar somente a organização 11f32aae-ea08-47e0-8114-f5d8a900c9a1. status_via=homologada com lifecycle_status=em_revisao e evidência vazia não é conclusão jurídica. Aprovação operacional e confirmação jurídica são distintas.

Não completar Irlanda, França, Bélgica, Tchéquia, Eslovênia, Países Baixos ou países bálticos com outra organização, nome de documento ou Mestre.

## 5. Famílias: propósito, não PP

A lista abaixo descreve propósitos da jornada. Não é taxonomia PP e não deve ser gravada como PP-01–PP-09.

| Propósito | Família estável | O que não fazer |
|---|---|---|
| Diagnóstico e cidadania por país/via | CA-CID | Não criar SKU por país nem usar PP |
| Pesquisa e preparação de prova | CA-CID, conforme o propósito do caso | Não fundir com memória |
| Acompanhamento e vida civil posterior | CA-CID, por pessoa, país e ato | Não aplicar item italiano a todos os países |
| História, memória e legado | CA-MEM | Não exigir cidadania |
| Continuidade e acervo | Família CA- de continuidade já existente, se o propósito for comprovado | Não autorizar por analogia |

Uma fase pode conter mais de um propósito. Memória pode existir sem cidadania. Separar eixos não converte a lista antiga de oito ou nove códigos PP.

## 6. Admissão

Entra somente linha da organização correta, com propósito comprovado, escopo e estado não legado, não arquivado e não rejeitado. Mestre não revalida linha excluída. Prefixo, SKU e analogia não decidem admissão.

Preço pendente não bloqueia planejamento. Bloqueia compromisso comercial não aprovado daquele escopo. Autorização, escopo e formalização continuam sendo gates reais. Junção por item_id localiza proveniência; não valida jornada.

Valor final = honorários do Clube Ancestral + despesas de terceiros + taxas oficiais + outros. Nulo não vira zero. Condição Canva não vira preço de país.
