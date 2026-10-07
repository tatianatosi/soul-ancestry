# Canos faltando — App Cliente (07/10/2026)

## Contrato deste corte

Paridade com o mockup aprovado de 17 páginas, em 375 e 1280 px, mantendo Home, Jornada, Radar, Árvore, Documentos, Legado e Conta. Para cada elemento, a fonte exigida é `portal_projecoes`, por tipo e conteúdo sanitizado. Não criar dados, inferir parentesco, deduzir país, fabricar percentuais, publicar conteúdo ou substituir ausência por demonstração.

Contrato e proposta não são conteúdo do App. A assinatura do contrato pertence ao fluxo próprio do portal, fora das sete abas; este corte não altera esse fluxo.

## Resultado da conferência de código

**BLOQUEADO_POR_DADO / dependência de leitor:** `usePortalVivo` usa `dadosVivosDoPortal`, que agrega `portal_projecoes`, `portal_casos`, `documents`, `portal_document_requests`, `invoices` e `case_timeline_events`. A visualização administrativa recebe dados por outro provider. Não existe ainda garantia de fonte única para os sete elementos/telas.

Colunas selecionadas de `portal_projecoes` pelo leitor atual:

`id, case_id, projection_type, content_sanitized, effective_from, updated_at, pessoa_id, geracao_cliente, source_entity_id, vinculo_projecao_id`.

Tipos reconhecidos em `projecoes-cliente.ts`: `linha_tempo`, `arvore`, `achado`, `evidencia`, `marco`, `resumo`, `atualizacao`, `legado`, `relatorio_fase`, `plano`, `uniao_ramos`, `assinatura`, `upsell`, `microentrega`, `relatorio_f1`, `relatorio_f2`. `contrato` e `proposta` são recusados.

**Importante:** os nomes de campos e tipos marcados abaixo como “a definir” são necessidades de apresentação, não schema comprovado, novos tipos autorizados ou instrução para criar tabelas. Claude deve reconciliá-los com o modelo e os escritores existentes antes de propor qualquer mudança. `documents` não é tipo de projeção; `uniao_ramos` é ponte de publicações, não genograma; `resumo_caso` não equivale automaticamente a `resumo` aceito pelo leitor.

## Matriz de necessidades para Claude

| Elemento | Aba | Projeção esperada | Campos que a tela precisa |
|---|---|---|---|
| Contexto do caso | Home | `resumo`, com contrato sanitizado a confirmar | título de cliente e resumo aprovado; data de publicação. Não usar título interno ou rascunho como substituto. |
| Alerta de achado | Home | `achado` | título, interpretação aprovada, pessoa vinculada e data/ano do fato quando documentado. Não tratar todo nó da árvore como achado. |
| Pessoas conectadas | Home / Árvore | `arvore` (existente) | `pessoa_id`, `content_sanitized` com nome e vínculo aprovado, `geracao_cliente`; contagem de pessoas distintas, não de linhas. |
| Documentos prioritários | Home / Documentos | tipo/classificação de prioridade a definir | título de cliente, pessoa, prioridade explicitamente publicada, estado, orientação e prazo se registrado. Pedido aberto não implica prioridade. |
| Da nossa jornada — entrega atual | Home / Jornada / Legado | `microentrega` (existente) | `content_sanitized`, `effective_from`; título/descrição e indicação explícita de entrega atual se necessária. Não inferir atualidade pelo tipo. |
| Próximo passo | Home / Jornada / Radar | projeção de próximo passo a definir | texto aprovado, trilha, destino contextual autorizado e data prevista somente quando registrada. `proxima_acao` não está na lista permitida atual. |
| Etapa/régua da jornada | Home / Jornada | `marco` ou contrato de andamento a definir | trilha, etapa atual, ordem e estados publicados. Hoje a etapa vem de `portal_casos`, não da fonte única exigida. |
| Árvore dinâmica | Árvore | `arvore` | `pessoa_id`, geração positiva publicada, nome/vínculo sanitizados; leitor sem filtro G1–G10 e composição sem teto fixo. |
| Vínculo individual | Árvore | `arvore` (existente) | vínculo aprovado no `content_sanitized`; geração não autoriza deduzir avós/bisavós ou outro parentesco. |
| Genograma | Árvore | contrato de relações a definir | IDs sanitizados das duas pessoas, tipo de relação aprovado, direção e geração/posição publicadas. `uniao_ramos` sozinho não fornece essas relações. |
| Pessoas mapeadas | Árvore / Radar | projeção de contagem a definir | total real de pessoas mapeadas, caso, período/data e critério de contagem; nunca total teórico de ascendentes. |
| Conexões familiares | Árvore / Radar | `arvore` + projeção de denominador a definir | pessoas distintas publicadas e pessoas mapeadas do mesmo universo/data; cálculo visível; inconsistência não vira percentual coerente por arredondamento. |
| Lacunas | Árvore | projeção de lacunas a definir | geração, ramo e rótulo aprovados; posição somente quando explícita. Não criar slots como se fossem pessoas faltantes reais. |
| Sugerir correção | Árvore | projeção de canal permitido a definir | canal/destino autorizado, vínculo contextual à pessoa/caso. Não criar ação falsa nem edição direta. |
| Países da sua origem / heatmap | Radar | projeção de origem a definir | país/localidade de apresentação, ramo, base geográfica e intensidade/métrica publicada, fonte contextualizada. `origem_pais` não é tipo comprovado no leitor atual. |
| Seis dimensões de progresso | Radar | contrato de progresso por dimensão a definir | dimensão, numerador, denominador, percentual publicado quando houver, fórmula em linguagem de cliente e data. Hoje há cálculo com `documents` e `portal_casos`, fora da fonte única. |
| História familiar / Linha Ancestral | Jornada | `linha_tempo` / `achado` | narrativa aprovada, pessoa, local e data/precisão do fato. Ano extraído de texto não substitui campo factual estruturado. |
| Rituais diários dos ancestrais | Jornada / Linha Ancestral | classificação histórica a definir | prática documentada, pessoa, período/local, narrativa aprovada e fonte; não deduzir hábitos de país, religião ou sobrenome. |
| Andamento / Linha do Processo | Jornada | `marco` / `atualizacao` | texto aprovado, trilha e data factual ou de publicação identificada. Histórico externo não deve substituir projeção ausente. |
| Origem → Cidadania → Memória | Jornada | classificação de trilha a definir | trilha explícita, ordem e título de cliente; correspondência com a prancha. Não classificar pessoa como evento nem marco como trilha por dedução. |
| Momentos de União | Jornada | `uniao_ramos` (existente) | `content_sanitized`, `source_entity_id`, `vinculo_projecao_id`; duas pontas publicadas e autorizadas. |
| Checklist completo | Documentos | projeção de checklist a definir | itens publicados, título, pessoa, estado, total completo e critério de completude. Sem lista completa, não mostrar N de M. |
| Pendentes / pedidos | Documentos | projeção documental a definir | título, estado pendente, orientação, pessoa e prazo opcional; hoje vêm de `portal_document_requests`. |
| Recebidos | Documentos | projeção documental a definir | título de cliente, estado explícito e data de recebimento; hoje vêm de `documents`, não de `portal_projecoes`. |
| Em conferência | Documentos | projeção documental a definir | estado publicado e orientação de cliente. Recebido não significa automaticamente em conferência. |
| Originais liberados | Documentos / Legado | projeção de original a definir | título, classificação documental, pessoa, data/ano, referência autorizada de arquivo e liberação. Preservar autorização do download; não inventar URL. |
| Descobertas interpretadas | Documentos / Legado | `achado` / `evidencia` | título, interpretação aprovada, tipo de documento, pessoa, data/ano factual e classificação editorial explícita. |
| Bases e fontes contextualizadas | Documentos / Legado | projeção de fonte a definir | nome de cliente, contexto/uso, período e referência pública autorizada; sem nome técnico de tabela ou evidência bruta. |
| Biblioteca / microentregas | Documentos / Legado | `microentrega`, `relatorio_fase`, `relatorio_f1`, `relatorio_f2`, `legado` | conteúdo aprovado, data, coleção/classificação explícita e referência de material autorizado quando existente. |
| Narrativas | Legado | `legado`, com classificação a definir | título, narrativa aprovada, data e coleção; classificação por palavras do texto não comprova categoria editorial. |
| Acervo | Legado | `legado`, com classificação a definir | título, descrição, tipo de peça, data e arquivo/referência autorizada. |
| Entrevistas | Legado | `legado`, com classificação a definir | título, resumo aprovado, data, participantes permitidos e referência autorizada; nenhuma gravação/transcrição bruta. |
| Entregas de memória | Legado / Jornada | `legado` / `microentrega`, classificação a definir | título, descrição, data e coleção de memória explicitamente publicada. |
| Acesso e dados permitidos | Conta | projeção de perfil permitido a definir | nome de apresentação e dados de acesso autorizados, sem documento civil/endereço; hoje vêm de `portalContexto`, fora da fonte única. Controle de sessão permanece independente do conteúdo. |
| Assinatura com preço | Conta | `assinatura` (existente) | formato sanitizado já lido: nome ⋅ valor em BRL ⋅ periodicidade ⋅ situação; não representa confirmação de pagamento. |
| Upsell com preço | Conta | `upsell` (existente) | nome, valor e periodicidade no formato existente; descrição/destino somente se publicados. Nenhuma cobrança automática. |
| Plano e continuidade | Conta | `plano` / `upsell`, contrato de continuidade a definir | nome, situação e vigência no formato existente; continuidade/descritivo explícitos. Não transformar proposta em conteúdo do App. |
| Membros conectados | Conta | projeção de membros a definir | nome permitido, papel em linguagem de cliente e autorização individual de exibição. |
| Canal da equipe | Conta | projeção de contato a definir | rótulo, destino permitido e disponibilidade real; não inventar telefone/e-mail. |
| Preferências e privacidade | Conta | projeção de preferências/privacidade a definir | canais, estados autorizados, texto aprovado e vigência. Nenhum controle editável sem ação existente. |
| Novidades e histórico | Conta | `atualizacao` / `marco` | conteúdo sanitizado, data e ordenação; hoje parte do histórico vem de `case_timeline_events`. |

## PEDIDOS AO CLAUDE — bloqueios que impedem executar este corte

1. **Sete abas / fonte única:** reconciliar `portal-dados-vivos.functions.ts`, `portal-dados-vivos.ts`, `portal.functions.ts` e o leitor administrativo existente para entregar cada elemento de conteúdo por `portal_projecoes`, sem novo leitor paralelo. Preservar sessão, isolamento, sanitização e autorização de arquivo; não substituir dado ausente por fontes internas.
2. **Home:** distinguir `resumo` aceito de `resumo_caso` em rascunho; entregar contexto, prioridade documental e próximo passo com contratos explícitos. A Home hoje consulta `meusCasos`, deriva prioridade de solicitações e inclui árvore no grupo de achados. Não apresentar essas derivações como paridade cumprida.
3. **Árvore:** `portal-arvore-geracoes.ts` contém IDs/lista G1–G10 e parentescos fixos; `arvore-publicacao.ts` transforma geração fora de `GERACOES_PUBLICAVEIS` em `null`. Liberar gerações futuras somente no visual não resolve o leitor. Reconciliar vínculo real e remover conectores que não correspondam a relações publicadas.
4. **Teste da Árvore:** `src/lib/__tests__/revisao-prancha-app-2026-10-05.test.ts:19` ainda exige literalmente `geracoesPublicadas.has(geracao.id)`. Os testes de geração já não vetam G11, mas esse teste ainda está acoplado à implementação da lista. Não alterado neste corte.
5. **Radar:** entregar denominador real e contrato das seis dimensões exclusivamente pela projeção; manter Progresso Geral como progresso, não parecer de elegibilidade. Não restaurar “Elegibilidade”, 31 pessoas, percentuais ou países do mockup como fatos da Ana.
6. **Jornada e Legado:** entregar data factual, trilha, prática documentada e classificação editorial explícitas; não usar data de publicação como previsão, pessoa como evento histórico ou regex como classificação homologada.
7. **Documentos:** mapear checklist, prioridade, estados e original autorizado para projeções existentes/reconciliadas. Não criar tipos `documento_prioritario`/`documento_checklist` como se já estivessem homologados.
8. **Conta:** mapear perfil permitido, continuidade, canais, preferências e histórico; assinatura/upsell com preço permanecem exclusivamente nos formatos sanitizados já autorizados. Contrato/proposta continuam fora do App.

## Evidência deste corte

- Conferência de código e do mockup de 17 páginas; nenhum arquivo do produto, biblioteca, teste, banco ou publicação alterado.
- 14 testes existentes passaram: `revisao-prancha-app-2026-10-05`, `portal-arvore-geracoes` e `lancamento-ana-2026-10-05`. Isso não comprova publicação, fonte única ou experiência ponta a ponta.
- Tentativa autenticada de abrir `/app-cliente-como-pessoa?casoId=` no caso da Ana: carregamento seguido de tela vazia. Capturas comparativas 375/1280 e releitura das sete abas **não comprovadas neste corte**. Não entregar captura vazia como paridade aprovada.
- Inventário anterior: seis pessoas, uma microentrega e uma assinatura publicadas; resumo em rascunho. Essas contagens não foram consultadas novamente no banco neste corte e não são afirmação de estado atual.
- Próximo passo: Claude reconciliar os contratos acima; retomar ajustes exclusivamente visuais e capturas das sete abas em 375/1280 com a mesma informação, sem publicação automática.

## Corte 07/10/2026 — Árvore, Radar e Home (19:46 UTC)

Este registro complementa, sem arquivar, a auditoria anterior. Consulta somente leitura no Lovable Cloud confirmou 6 projeções `arvore`, 1 `assinatura` e 1 `microentrega` em `portal_projecoes` para o caso da Ana; nenhuma solicitação documental não arquivada. Não há projeção de checklist completo, próxima ação ou canal nesse conjunto. Nenhum dado foi criado ou publicado.

**Apresentação implementada e conferida:** G1 como âncora, demais rótulos numerados neutros (G4 · 4ª geração), sem renumerar pessoas; Home limita Achados ao tipo `achado` e explicita ausência de prioridade/checklist e canal; Radar não conecta dimensões sem percentual ao centro como se fossem zero. O cálculo existente continua intacto: Conexões mostra 6/10 = 60%, e Progresso Geral informa que atualmente utiliza apenas esse eixo.

**Limite:** a convenção foi corrigida na apresentação da Árvore, não na biblioteca compartilhada pelo Claude. A existência de documentos recebidos não comprova checklist completo. Ticket interno não equivale a canal publicado. Próxima ação produzida pelo motor não equivale a projeção de próxima ação, e a procura por `proxima_acao` na linha atual não possui tipo reconhecido pelo leitor.

| Elemento | Aba | Projeção esperada | Campos que a tela precisa / pedido ao Claude |
|---|---|---|---|
| Convenção de geração compartilhada | Árvore / leitores / simulação | `arvore` existente | Unificar biblioteca: G1 âncora; Gn · nª geração; preservar `geracao_cliente` e vínculos publicados. Não reinterpretar G4 como parentesco pela posição. |
| Checklist completo | Home / Radar | Contrato a reconciliar, sem inventar tipo | Universo integral aplicável ao caso, IDs de itens, estados publicados, numerador e denominador com critério de completude. `docs.length` é contagem de arquivos disponíveis, não prova desse universo. |
| Próxima ação | Home / Radar | Contrato a reconciliar com leitores existentes | Texto sanitizado aprovado, caso, destino permitido e data opcional real. Entregar a mesma ação nas duas telas sem texto interno ou pagamento não confirmado. Não habilitar tipo desconhecido só na UI. |
| Canal de contato | Home | Contrato a reconciliar | Rótulo, destino autorizado, disponibilidade e contexto do caso; ação existente persistente se for atendimento interno. Sem telefone/e-mail inventado ou atalho apresentado como contato funcional. |
| Base de Origem | Radar | Contrato de origem aprovado | Origem histórica contextualizada e unidade/total quando houver; árvore publicada não comprova localização nem progresso de origem. |

**Validação deste corte:** 33 testes existentes passaram; compilação da plataforma OK. Navegação administrativa autenticada nas três abas em 375×1800 e 1280×1800, capturas topo/meio/fim, sem overflow de documento e sem erro JavaScript. Capturas em `/tmp/browser/ana-bases-reais/`. Login cliente, isolamento A×B, escrita/releitura, publicação e PDF não foram testados neste corte. Não declarar paridade concluída: os contratos de conteúdo acima dependem do Claude.

## Corte visual v11 — quatro abas (07/10/2026, 23:37 UTC)

- Tokens locais de apresentação vinculados aos valores canônicos, aplicados pelo shell às sete abas; nenhuma mudança de paleta do Desk.
- Jornada, Documentos, Legado e Conta usam faixas editoriais, vazios compactos e hierarquia sem caixas aninhadas. Pessoas de `arvore` não ocupam eventos históricos. Não há afirmação de ritmo em dia pela simples presença de publicação.
- Documentos sem pedido não afirma que nenhum documento é necessário. Conta explicita ausência de canal; assinatura existente e seu estado foram preservados, sem mudança de preço ou confirmação de pagamento.
- Dependências de Claude continuam: datas factuais/trilhas, classificação explícita das coleções, checklist integral, originais/entrevistas/fontes autorizados, nome de apresentação, plano, canais, preferências e histórico publicado. Conteúdo demonstrativo do PDF não foi importado.
- 36 testes existentes passaram, compilação da plataforma OK; 21 capturas finais, sete abas em 375/768/1280, conteúdo igual nas três larguras, sem overflow ou erro JavaScript. Prova pela visão administrativa autenticada; não comprova login cliente, isolamento, escrita/releitura ou publicação.
