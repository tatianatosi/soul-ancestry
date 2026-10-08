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
- **Correção da auditoria (08/10, 11:25 UTC):** a afirmação acima sobre Documentos não corresponde à UI atual: o texto “Por enquanto, não precisamos de nenhum documento seu” permanece nas duas apresentações e é exigido por `a5-documentos-separacao-semantica.test.ts:62`. PEDIDO AO CLAUDE: substituir essa invariável pela distinção entre ausência de pedido publicado e dispensa documental explícita. Lovable não alterou o teste nem declarou a diretriz concluída.
- Dependências de Claude continuam: datas factuais/trilhas, classificação explícita das coleções, checklist integral, originais/entrevistas/fontes autorizados, nome de apresentação, plano, canais, preferências e histórico publicado. Conteúdo demonstrativo do PDF não foi importado.
- 36 testes existentes passaram, compilação da plataforma OK; 21 capturas finais, sete abas em 375/768/1280, conteúdo igual nas três larguras, sem overflow ou erro JavaScript. Prova pela visão administrativa autenticada; não comprova login cliente, isolamento, escrita/releitura ou publicação.

## Paridade integral — rodada de composição e interação (08/10/2026)

**Execução visual, não homologação de conteúdo:** sete abas preservadas; cabeçalho e friso, narrativa Home, eventos expansíveis na Jornada, seis dimensões do Radar, exploração por pessoa/geração na Árvore, quatro acordeões documentais, coleções editoriais e Conta de leitura. Nenhum leitor, fórmula, teste, writer, contrato, dado, dependência ou publicação alterado.

**Fontes inspecionadas:** `portal-dados-vivos.ts`, `projecoes-cliente.ts`, `arvore-publicacao.ts`, `portal-arvore-geracoes.ts`, `radar-seis-eixos.ts`, provider `fonte-portal.tsx` e visão administrativa existente. Os componentes novos apenas apresentam os dados que esses leitores já entregam; não constituem leitores paralelos.

| Elemento | Aba | Fonte / campos existentes | Campos faltantes | Ação Desk / responsável / bloqueio |
|---|---|---|---|---|
| Genograma relacional | Árvore | `portal_projecoes`: `pessoa_id`, `geracao_cliente`, nome/vínculo textual sanitizado; seis pessoas atuais G3–G7 | Relação estruturada autorizada entre dois IDs, direção/tipo/posição | Claude reconciliar relações canônicas e publicação humana no Desk; **BLOQUEADO_POR_DADO**. UI oferece foco e ficha, sem conectores inventados. Banco/writer ainda limitam G10; não declarar ilimitado. |
| Países, ramos e mapa/heatmap | Radar / Origem | Registros de árvore/linha usados pelo cálculo atual | Lugar histórico contextualizado, país de apresentação, ramo, unidade, intensidade e fonte aprovados | Claude definir contrato sanitizado usando o modelo existente; **BLOQUEADO_POR_DADO**. Área de Origem e explicação expansível, sem mapa ou país fictício. |
| Percentuais documentais e Origem | Radar | Fórmula existente lê documentos; Origem conta publicações da árvore/linha | Checklist integral e critério do universo; base geográfica real distinta de pessoas | Claude reconciliar fórmula/leitor/testes na própria janela; **dependência de regra**. Não foi alterado o cálculo 6/10 nem a média parcial. |
| Data/precisão/local histórico | Jornada | Texto sanitizado e data de publicação; ano textual extraído pelo leitor atual | Data factual e precisão estruturadas, fonte e trilha histórica | Claude reconciliar campos e projeção, aprovação humana no Desk; **BLOQUEADO_POR_DADO**. Pessoas não foram convertidas em eventos. |
| Checklist, prioridade e estado de conferência | Home / Documentos | Pedidos com título/descrição/prazo, `documents` com origem/liberação | Universo completo aplicável, prioridade aprovada, estado explícito de conferência e original liberado | Claude mapear fontes/writers existentes; **BLOQUEADO_POR_DADO**. Acordeões mantêm Solicitados/Recebidos/Liberados/Entregas separados. Download/preview não verificados: nenhum arquivo liberado disponível. |
| Categoria editorial | Legado | Tipos e texto de publicações; classificação atual por função existente | Categoria explícita aprovada, coleção e referência autorizada de artefato | Claude reconciliar classificação; **dependência de regra/dado**. Não criar categorias pelo visual ou novas regex. Capas com ícones representam coleções, não acervo fabricado. |
| Próxima ação, prioridade e contato | Home / Conta | Conteúdo dos providers atuais; projeção de ação/canal não encontrada no conjunto da Ana | Texto aprovado, destino contextual autorizado e canal vigente | Claude disponibilizar contrato existente/reconciliado; **BLOQUEADO_POR_DADO**. Ausências agrupadas em detalhes compactos; link do topo é Conta, não contato fictício. |
| PP-03 e assinatura vigente | Conta | Assinatura sanitizada publicada aparece como Pesquisa Genealógica por Ramo Familiar, R$320/mês | Reconciliação do nome/vigência com decisão PP-03 e condições do caso | Claude e Proprietária reconciliar publicação, sem preço hardcoded nem confirmação de pagamento; **BLOQUEADO_POR_DECISAO/DADO**. Valor existente preservado, não homologado por esta captura. |

**Sessão:** Proprietária autenticada na visão administrativa do App da Ana, caso `a11a0000-0000-4000-8000-000000000002`, ambiente local do preview Lovable. Não é sessão da cliente nem prova de isolamento A×B. Antes SHA `f45878d9bbaea1125600c8b2dd40fbf09a03b787`; SHA depois e capturas individuais constam no índice entregue. Aceite visual continua parcial enquanto mapa, genograma relacional e contratos acima não existirem.

## Revisão consolidada da coleção — 08/10/2026, 11:25 UTC

O comparativo anterior não incluía o corte posterior de Documentos/Legado/Conta. Nova versão reúne as sete telas efetivamente abertas no preview, não uma montagem de revisões de datas diferentes. Originais antigos preservados; comparativo atualizado identificado por data e SHA.

- Home: pessoas publicadas separadas de achados; próximo passo e contato ausentes. Contexto editorial completo ainda depende de resumo aprovado.
- Jornada: linha ancestral e processo distintos; pessoa não vira evento. Datas factuais, trilhas e encontros dependem de campos aprovados.
- Radar: removida a superfície de cartões repetidos; seis resumos em linhas, valores à direita, gráfico sem moldura. Fórmulas intactas. Origem tem contagem, não mapa ou percentual fictício; mapa/heatmap continua bloqueado por dado.
- Árvore: nomes nas gerações efetivamente publicadas; foco e ficha; sem pirâmide anônima ou ligações inventadas. Genograma relacional continua bloqueado.
- Documentos: quatro acordeões e lista contínua mantidos; checklist completo e download sem arquivo seguem não comprovados. Texto de dispensa bloqueado pelo teste citado acima.
- Legado: abertura editorial, coleções compactas e compartilhamento em expansão; classificação por função legada continua dependência do Claude, não homologação de categoria.
- Conta: perfil, assinatura, plano, novidades e atendimento agrupados; valores publicados preservados. Plano, canais e preferências não foram fabricados.

Validação: 39 testes existentes passaram; plataforma compilou sem erros; 21 combinações de aba/largura em 375/768/1280, sem overflow nem erro de página. Sessão administrativa da Proprietária, não login cliente. Capturas de topo e sequência até o fim, mais detalhes expandidos. Nenhum dado ou publicação alterado. **Paridade integral NÃO concluída:** genograma, mapa, checklist, conteúdo editorial factual, preferências e texto documental ainda têm dependências explicitadas.
