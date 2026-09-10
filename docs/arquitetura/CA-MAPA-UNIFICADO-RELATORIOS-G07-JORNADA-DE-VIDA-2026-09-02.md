# Mapa unificado de relatórios, G-07 e Jornada de Vida

- **Status:** em revisão
- **Versão:** v1.0
- **Data:** 2026-09-02
- **Responsável pela decisão:** Proprietária do Clube Ancestral
- **Fonte(s) de evidência:** memória documental do projeto; arquivos do projeto; repositório GitHub `tatianatosi/soul-ancestry`; modelo identificado no Google Drive.
- **Escopo:** consolidar os relatórios e entregas existentes, corrigir a interpretação do modelo de Jornada de Vida, e apresentar o de-para entre capacidades implementadas e faltantes no app/desk/motores.
- **Premissas:** "Jornada de Vida 360°" é uma denominação funcional de resgate criada nesta análise, não um nome comprovadamente existente no Drive; Fase 1/Fase 2 permanecem modelos de relatório já existentes, mas hoje classificados como template/mockup até persistência e publicação serem validadas.
- **Limites:** não altera, não propõe mudança e não depende de bases genealógicas, catálogo de fontes, scraping, APIs de acervos ou consultas externas. Este documento trata exclusivamente de dados já registrados no caso, relatórios, projeções e plano de ação.
- **Próximos passos:** validar os nomes canônicos de apresentação ao cliente; definir o conjunto mínimo de dados para cada relatório; implementar a composição persistida, revisão e publicação da Jornada de Vida 360°.
- **Critério de aceite:** os quatro relatórios devem ter finalidade, fonte de dados, permissão, estado de revisão e regra de publicação explícitos; o G-07 deve alimentar o relatório sem expor dados internos ao cliente.

---

## 1. Decisão de nomenclatura

Há quatro objetos distintos. Eles não devem ser confundidos com SKU, fase comercial ou módulo de fonte.

| Código funcional | Nome de trabalho | Finalidade | Público |
|---|---|---|---|
| R-01 | Relatório de Elegibilidade / Fase 1 | Síntese inicial: cenário, hipóteses, lacunas, riscos e próximos passos | Cliente, após revisão humana |
| R-02 | Relatório de Estratégia / Fase 2 | Organiza linha prioritária, documentos críticos, marcos, estratégia e plano de ação recomendado | Cliente, após revisão humana |
| R-03 | Relatório de Pesquisa Genealógica | Devolutiva técnico-narrativa: escopo, evidências, documentos, linhagens e achados comprovados | Cliente, após validação e sanitização |
| R-04 | Jornada de Vida 360° | Leitura histórica estruturada de pessoas e ramos: indicadores, linha do tempo e marcos civis, religiosos, militares, comunitários e patrimoniais, com síntese de pendências e próximos passos aprovados | Cliente, após curadoria e aprovação |

**Encontros de Linhagem não é um quinto relatório.** É um tipo de achado/seção transversal que pode aparecer em R-03 e R-04 quando a convergência entre ramos, pessoas, fontes ou eventos estiver validada.

**G-07 não é relatório.** É o motor interno de Plano de Ação de Pesquisa, Instituições e Terceiros. Ele dá material operacional aos relatórios, mas não pode ser projetado integralmente ao cliente.

---

## 2. Inventário dos relatórios

### R-01 — Relatório de Elegibilidade / Fase 1

**Papel:** entrega de diagnóstico inicial. Traduz dados declarados, documentos disponíveis, lacunas, riscos e rota possível em linguagem de cliente; não promete reconhecimento, prazo ou resultado.

**Conteúdo mínimo esperado:**

- objetivo do cliente e linha familiar declarada;
- dados e documentos já recebidos;
- leitura inicial de evidências e lacunas;
- hipótese de via/estratégia, sempre condicionada à análise humana;
- riscos ou pontos que exigem confirmação;
- próximos passos e checklist inicial aprovado.

**Limite:** não expor pontuações internas, parecer jurídico cru, dados de terceiros, URLs internas, preços técnicos ou hipóteses sem marcação de incerteza.

### R-02 — Relatório de Estratégia / Fase 2

**Papel:** entrega de direção organizada após a leitura inicial. A implementação localizada contém uma seção explícita "Plano de ação recomendado", com ordem sugerida de providências, consolidação de documentos pendentes, revisão de hipóteses após novos documentos e definição de continuidade com a equipe.

**Conteúdo mínimo esperado:**

- síntese da linha ou objetivo prioritário;
- documentos críticos, pendências e divergências contextualizadas;
- marcos e sequência recomendada;
- plano de ação recomendado, em linguagem sanitizada;
- próximos passos, responsável percebido e momento de reavaliação.

**Limite:** plano completo com instituição, custo estimado, rechecagem, alerta e minuta de comunicação continua sendo interno no G-07.

### R-03 — Relatório de Pesquisa Genealógica

**Papel:** devolutiva técnico-narrativa de investigação genealógica, baseada somente em evidências já validadas para compartilhamento.

**Conteúdo mínimo esperado:**

- identificação do caso, cliente e linhagem;
- objetivo e período histórico investigado;
- regiões e países cobertos;
- geração mais antiga documentalmente comprovada;
- documentos-chave e sua contribuição à hipótese/vínculo;
- achados relevantes, incluindo Encontros de Linhagem quando comprovados;
- árvore ou percurso de linhagem aprovado;
- lacunas remanescentes e próximos passos de alto nível.

**Limite:** não apresentar fonte bruta, URL interna, transcrição ainda não revisada, hipótese como fato ou dados pessoais de terceiros sem autorização.

### R-04 — Jornada de Vida 360°

**Papel:** relatório de memória histórica e leitura de trajetória. Este nome é novo e foi criado para dar unidade à estrutura já existente; não deve ser tratado como documento previamente localizado no Drive.

**O que ele reúne:**

- indicadores descritivos derivados do próprio caso, por exemplo: pessoas registradas, ramos mapeados, períodos alcançados, localidades, eventos por categoria, evidências validadas, itens pendentes e marcos confirmados;
- linha do tempo de uma pessoa, núcleo ou família;
- marcos de vida e contexto por camadas: civil, religioso, residência/migração, ocupação/patrimônio, militar, comunitário/social, educação/cultura, correspondência/acervo e contexto histórico;
- momentos de convergência ou Encontros de Linhagem;
- narrativa curta de jornada, sempre separando confirmado, provável e pendente;
- seção "continuidade da pesquisa", alimentada por uma projeção sanitizada do G-07.

**O que não é:** não é diagnóstico de cidadania, parecer jurídico, relatório automático de estatísticas, inventário de fonte, nem painel interno do pesquisador.

---

## 3. De-para de implementação

A coluna "implementado" significa que existe evidência de código, estrutura de dados, rota ou teste no repositório. Não significa, por si só, que esteja homologado para produção, preenchido com dados reais ou liberado ao cliente.

| Capacidade | Já existe / evidência | Estado | Falta para entrega operacional | Não tocar |
|---|---|---|---|---|
| Template R-01 / Fase 1 | Relatórios F1/F2 registrados como existentes no conjunto de pesquisa e relatórios | Parcialmente comprovado | Confirmar fonte de dados, aprovação, publicação e modelo de exportação | Bases genealógicas |
| Template R-02 / Fase 2 | `src/data/relatorio-fase02.ts` e componente `src/components/relatorio-fase02.tsx` | Existe como mockup/template | Separar dados do caso, persistir versão, revisão humana, publicação autorizada e PDF/visual final | Bases genealógicas |
| Plano de ação recomendado no R-02 | Seção "Plano de ação recomendado" já declarada no template Fase 2 | Existe como conteúdo-modelo | Mapear cada item a dados reais permitidos e impedir publicação de detalhes internos | Bases genealógicas |
| Relatório visual | `src/data/relatorio-visual.ts` e `src/components/relatorio-visual.tsx` identificados como template/composição | Template/modelo | Definir quais relatórios usa, dados de entrada, versão, aprovação e persistência | Bases genealógicas |
| Studio de Devolutivas | Rota `/studio-devolutivas` e componente interno de preview | Existe como modelo interno | Autorização, ligação por `case_id`, histórico de versões e fluxo de publicar/revogar | Bases genealógicas |
| R-03 Relatório de Pesquisa Genealógica | Modelo no Drive e estrutura documental preservada na memória do projeto | Modelo encontrado; integração não comprovada | Transformar a estrutura em template versionado e vinculá-la ao fluxo de aprovação/publicação | Bases genealógicas |
| Pessoas, relações, linhagens e eventos | `research_people`, `genealogical_relationships`, `lineage_paths`, `genealogical_events` e rotas/módulos associados | Estrutura e leitura implementadas; preenchimento varia por caso | Regra de seleção de registros liberáveis e composição do relatório | Bases genealógicas |
| Linha do tempo, árvore e lacunas | Funções derivadas `montarArvore`, `montarTimeline`, `calcularLacunas` descritas como leitura | Implementado como derivado de dados do caso | Definir layout/recorte por relatório e camada de aprovação do conteúdo | Bases genealógicas |
| Marcos civil, religioso, militar e patrimonial | Tipos de evento e achados controlados; módulos históricos declarados | Implementado no domínio | Curadoria editorial, ordenação cronológica e projeção autorizada para R-04 | Bases genealógicas |
| Vida comunitária/social | Módulo histórico `social_political_records` e referência a vida religiosa/comunitária na ficha piloto | Estrutura declarada/implementada | Campo de narrativa e critérios de publicação; ainda não há relatório cliente específico | Bases genealógicas |
| Indicadores da Jornada de Vida | Dados necessários estão dispersos em pessoas, ramos, eventos, achados e evidências | Não há relatório comprovado | Definir fórmulas descritivas, período de corte, tratamento de ausência e cards do R-04 | Bases genealógicas |
| Encontros de Linhagem (G-06) | Motor identificado como achados + encontros → árvore/timeline/entrega aprovada | Implementado segundo status recuperado, mas requer validação funcional | Definir regra editorial para virar bloco do R-03/R-04 e publicação por aprovação | Bases genealógicas |
| G-07 Plano de Ação de Pesquisa | Migration, funções, tela, testes e G-07B para pendências críticas no Painel Hoje | Implementado/parte declarada como concluída; há também registro histórico de "parcialmente implantado" | Homologar fluxo real por caso, permissões, critérios de sanitização e vínculo com relatório | Bases genealógicas |
| Ações, prazos, rechecagens e terceiros | Estrutura G-07 para itens, instituições, previsões e alertas; sem execução externa | Implementado como registro/leitura | Definir projeção resumida ao cliente: próximo passo, dependência e prazo indicativo, sem detalhe interno | Bases genealógicas |
| Entregas ao cliente | `client_deliverables` com estados draft, in_review, approved, published e archived | Estrutura de governança definida | Conectar R-01 a R-04 a esse fluxo e registrar versão, aprovador, disponibilidade e visualização | Bases genealógicas |
| Acesso e sanitização | Política determina que só conteúdo publicado chegue ao app e proíbe exposição de dados internos | Regra definida | Testes de permissão e bloqueios de publicação para cada relatório | Bases genealógicas |
| Estatísticas de jornada | Não há resultado de busca que comprove painel ou cálculo específico como relatório cliente | Ausente | Criar agregador apenas a partir de dados do caso e regras de privacidade; nenhuma consulta externa | Bases genealógicas |
| R-04 Jornada de Vida 360° | Não existe como template comprovado no Drive/GitHub | Ausente | Criar template, adaptador de dados, preview interno, aprovação, publicação e testes | Bases genealógicas |

---

## 4. G-07: papel correto no conjunto

### O que o G-07 já cobre

O G-07 é o motor de **Plano de Ação de Pesquisa, Instituições e Terceiros**. Há migration, biblioteca de funções, funções de servidor, rota/tela e testes. O motor opera como previsão e organização: não envia mensagens, não contata instituições, não cria despesa, não cobra e não agenda eventos externos automaticamente.

Os dados internos previstos incluem, entre outros:

- pendência ou pergunta de pesquisa;
- ação, prioridade, responsável e prazo;
- instituição/terceiro, quando aplicável;
- rechecagem, risco, previsão e alerta;
- rascunho de comunicação, sem envio automático;
- ações críticas exibíveis no Painel Hoje por G-07B.

### O que o G-07 deve fornecer aos relatórios

| Relatório | Projeção permitida do G-07 |
|---|---|
| R-01 / Fase 1 | Próximos passos iniciais e checklist aprovado |
| R-02 / Fase 2 | Sequência recomendada, documentos prioritários, marco seguinte e reavaliação prevista |
| R-03 Pesquisa Genealógica | Próxima frente de investigação e lacuna relevante, em linguagem de alto nível |
| R-04 Jornada de Vida 360° | Bloco "continuidade da pesquisa": o que ainda precisa ser confirmado e qual marco histórico será aprofundado |

### O que nunca deve ir diretamente ao cliente

- notas internas de pesquisa;
- critérios de risco detalhados;
- previsão de custo ou despesa não aprovada;
- rascunhos de mensagens;
- instituição, contato ou URL interna sem autorização;
- dados pessoais de terceiros;
- hipótese não validada apresentada como fato;
- qualquer ação de pesquisa ainda sem autorização aplicável.

---

## 5. Especificação mínima do R-04

### Entradas permitidas

O R-04 somente consome registros já existentes e liberáveis do caso. Não solicita, altera ou consulta uma base genealógica.

| Bloco | Dados de caso usados | Saída ao cliente |
|---|---|---|
| Cabeçalho | pessoa/núcleo, período de corte, escopo aprovado | título, período, aviso de atualização |
| Indicadores | contagens de pessoas, ramos, eventos, localidades, evidências liberadas e lacunas | cards descritivos, sem score opaco |
| Jornada cronológica | eventos com data/intervalo, localidade e estado de validação | timeline sanitizada e ordenada |
| Vida civil | nascimento, casamento, morte, residência, migração, documentos civis | marcos civis confirmados e contextualizados |
| Vida religiosa | batismo, matrimônio, sepultamento e registros religiosos aprovados | marcos religiosos confirmados |
| Vida militar | alistamento, serviço, dispensa, reservista e listas de leva validadas | marco militar, quando pertinente e permitido |
| Vida comunitária | registros sociais/políticos, participação comunitária ou religiosa, correspondências/acervo liberados | contexto comunitário só quando evidenciado e aprovado |
| Patrimônio e trabalho | ocupação, patrimônio, documentos notariais/cadastrais liberados | contexto de trabalho, moradia ou patrimônio com linguagem prudente |
| Encontros de Linhagem | achados de convergência validados | bloco de conexões comprovadas entre ramos/pessoas |
| Continuidade | resumo sanitizado do G-07 | próximos fatos/documentos a confirmar e próximo marco |

### Estados do relatório

`rascunho` → `em revisão` → `aprovado` → `publicado` → `arquivado`.

- Rascunho pode conter dados de trabalho apenas no Desk.
- Em revisão exige responsável e verificações de conteúdo.
- Aprovado congela uma versão revisável.
- Publicado cria a projeção sanitizada no App Cliente.
- Arquivado preserva rastreabilidade e retira a versão da experiência ativa quando necessário.

### Critérios de aceite do R-04

1. Um relatório só é gerado para um `case_id` definido.
2. Cada marco exibido traz estado de confiança compatível com sua evidência.
3. Nenhum dado de fontes/bases externas é consultado ou alterado durante a geração.
4. Indicadores mostram apenas agregados autorizados do caso e especificam a data de corte.
5. Encontros de Linhagem só aparecem se o achado tiver evidência e aprovação.
6. O bloco de continuidade usa uma projeção sanitizada do G-07, não o plano operacional integral.
7. Publicação só ocorre com aprovação humana e política de acesso verificada.
8. O App Cliente vê somente a versão publicada; Desk mantém versão, aprovador e histórico.

---

## 6. Ordem de execução recomendada

1. **Homologar nomenclatura:** confirmar se R-01 e R-02 manterão "Fase 1/Fase 2" no cliente ou receberão nomes humanos, como "Leitura Inicial" e "Estratégia do Caso".
2. **Versionar os templates existentes:** separar `relatorio-fase02`, relatório visual, Studio e entrega consultiva de dados fixos ou de casos-modelo.
3. **Conectar R-01, R-02 e R-03 ao fluxo de `client_deliverables`:** rascunho, revisão, aprovação, publicação e arquivo.
4. **Fechar a ponte G-07 → relatórios:** criar um adaptador de projeção sanitizada para próximos passos, sem liberar o plano interno.
5. **Implantar R-04 em duas etapas:** primeiro preview interno com timeline, marcos e indicadores; depois publicação controlada para o App Cliente.
6. **Testar permissões e regressão:** confirmar que o cliente só visualiza versões publicadas e que nenhum dado interno do G-07 é vazado.

---

## 7. Conclusão operacional

O Clube Ancestral já possui boa parte dos blocos necessários: relatórios de fase como templates, relatório visual, Studio de Devolutivas, entidades de pessoas/linhagens/eventos, timeline/árvore/lacunas, G-06 para achados e encontros e G-07 para o plano interno de pesquisa.

A lacuna não está nas bases genealógicas. Está na **orquestração de entrega**: transformar esses blocos em quatro relatórios versionados por caso, com seleção de dados, curadoria humana, sanitização, aprovação e publicação no App Cliente.

A Jornada de Vida 360° deve nascer como R-04, usando apenas registros já existentes e autorizados. Ela não substitui o Relatório de Pesquisa Genealógica; complementa-o com leitura cronológica, histórica e contextual da vida familiar, mais indicadores e continuidade de pesquisa.
