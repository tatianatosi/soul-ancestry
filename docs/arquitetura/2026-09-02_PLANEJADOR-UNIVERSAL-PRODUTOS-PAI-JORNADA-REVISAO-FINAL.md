# Planejador Universal, Produtos-Pai e Jornada — Revisão Final (arquivado como legado/referência)

- **Status:** legado versionado — referência de arquitetura, execução parcial decidida em 2026-09-03
- **Versão:** v1.0 (documento original) + nota de decisão v1.0 (2026-09-03)
- **Data do documento original:** 2026-09-02
- **Data da decisão de execução:** 2026-09-03
- **Responsável pela decisão:** Proprietária Administradora do Clube Ancestral
- **Classificação:** decisão de arquitetura + recomendação operacional + especificação de motor
- **Repositório:** `tatianatosi/soul-ancestry`
- **Caminho:** `docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md`

## Nota de decisão (2026-09-03)

O documento abaixo (seção "Documento original") propunha criar 11 entidades canônicas
novas (`case`, `case_member`, `lineage`, `eligibility_assessment`, `journey_instance`,
`journey_module`, `catalog_product`, `proposal_scope`, `service_order`, `financial_item`,
`evidence`) e migrar 5 casos reais (Ana Luiza, Danilo, Giovanna, João Marcelo, Lara).

Antes de executar, foi feito o levantamento de "o que já existe" (`list_tables` no
Supabase, projeto `zsxpdbhdvbuulwpepemd`). Achado: a maior parte das 11 entidades já
existe em produção, com dado real, sob outro nome:

| Entidade proposta no documento | Já existe hoje como |
|---|---|
| `case` | `crm_casos` |
| `case_member` | `case_members` / `nucleo_membros` |
| `catalog_product` | `product_catalog` |
| `journey_module` | `case_services` |
| `proposal_scope` | `proposals` / `proposal_canva_pages` |
| `service_order` | `service_orders` |
| `financial_item` | `invoices` / `payments` |
| `evidence` | `evidences` / `evidencias` / `research_evidence_items` |
| `eligibility_assessment` | sem equivalente claro identificado ainda |
| `journey_instance` | sem equivalente claro identificado ainda |
| `lineage` | a verificar |

Foi também identificado, de forma independente do documento, um problema real de
qualidade de dado em `product_catalog`: 20+ valores de `code` aparecem exatamente
triplicados (3 linhas cada), de um total de 90 linhas — por exemplo `CA-COMBO-001`,
`CA-CID-002A`, `CA-ASS-001`, `CA-CID-016`, `CA-HIST-002`. Essa é a mesma classe de
problema ("IDs duplicados", `#ERROR!`) que o documento original atribui apenas à
Planilha Mestre legada — só que presente na tabela já tratada como "catálogo
homologado" desde a PR #50.

**Decisão da proprietária (2026-09-03):** não criar as 11 entidades novas. Usar as
tabelas de entidades que já existem, adicionar somente o que estiver faltando. Para
SKUs e produtos-pai: montar um de-para entre o catálogo existente (aba/área de SKU já
usada como referência) e a taxonomia de produtos-pai P01–P09, adicionando apenas os
produtos que realmente faltam — não recriar o catálogo do zero. Este documento original
fica arquivado como legado/referência versionada em governança.

**Bloqueio técnico registrado nesta data:** o acesso MCP ao Supabase (projeto
`zsxpdbhdvbuulwpepemd`) está pedindo reautenticação nesta sessão. Até a proprietária
reautorizar (via `claude mcp` / `/mcp` em sessão interativa, ou nas configurações do
conector), não é possível:
- confirmar se as 3 linhas duplicadas por `code` em `product_catalog` são idênticas ou
  divergem em algum campo;
- localizar/confirmar equivalentes reais para `eligibility_assessment`, `journey_instance`
  e `lineage`;
- montar o de-para SKU → produto-pai contra o dado vivo;
- migrar os 5 casos reais.

Nenhuma dessas ações foi executada. Este arquivamento cobre apenas a preservação do
documento original como referência versionada — a execução do de-para e da migração
fica pendente da reautorização do Supabase.

## Documento original

> Preservado integralmente como enviado em 2026-09-02, sem alteração de conteúdo.
> Contradições entre este texto e decisões mais recentes de governança (ex.: uso de
> `product_catalog` existente em vez de `catalog_product` novo) resolvem-se a favor da
> decisão mais recente, registrada na seção acima.

- **Status:** em revisão
- **Versão:** v1.0
- **Data:** 2026-09-02
- **Responsável pela decisão:** Proprietária do Clube Ancestral
- **Classificação:** decisão de arquitetura + recomendação operacional + especificação de motor
- **Fonte(s) de evidência:**
  - Planilha anexada `planejador-universal-simulador-todas-cidadanias.xlsx`.
  - `05_CATALOGO_OPERACIONAL_30/05_CA06_Catalogo_Operacional_30_Clube_Ancestral.md`.
  - `04_TOP_SKUS_CANDIDATOS/04_TOP_SKUS_CANDIDATOS_Clube_Ancestral.md`.
  - `CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza.md`.
  - Pesquisa em Google Drive e Dropbox em 2026-09-02.
  - Site público `https://clubeancestral.com.br/`, revisado em 2026-09-02.
  - GitHub: `tatianatosi/recriacao-do-clube-ancestral` e `tatianatosi/clube-ancestral-intelligence-desk`.
- **Substitui:** não substitui documentos aprovados; consolida a fase final de revisão e propõe sucessor canônico do Planejador Universal.

### 1. Decisão proposta

O Clube Ancestral deve deixar de operar o Planejador Universal como uma planilha orientada por país, por preço-base e por `SKU Base` pré-cadastrado. A nova referência deve ser um **Motor Universal de Jornada por Caso**, em que:

1. o caso e sua composição familiar são o centro do modelo;
2. a jornada é selecionada por elegibilidade, via jurídica, estágio, complexidade e necessidades do núcleo familiar;
3. produtos-pai representam capacidades e entregas do Clube, não um país ou um pacote genérico;
4. módulos, complementos e despesas são acionados por marcos/condições do caso;
5. país, via, autoridade, requisitos e fontes jurídicas são parâmetros de elegibilidade e execução;
6. a proposta aceita, a Ordem de Serviço e o contrato congelam o escopo comercial específico do caso;
7. Desk/CRM passa a ser a fonte operacional do caso; catálogo é fonte de oferta; financeiro é fonte de cobrança/recebimento; planilhas legadas tornam-se importação e histórico, não governança.

Essa decisão elimina a dependência estrutural da Planilha Mestre sem apagar seu valor histórico: os 91 SKUs permanecem em inventário, reconciliação e rastreabilidade até a decisão individual de consolidar, arquivar ou reclassificar.

### 2. Diagnóstico consolidado

#### 2.1. Planejador atual

O arquivo revisado declara que a Planilha Mestre é o centro de SKUs, CRM e links. Essa premissa deve ser removida da arquitetura alvo. O próprio arquivo também apresenta evidências de que não pode ser fonte operacional: há IDs repetidos, um ID com ano inválido (`CA-CID-AT-20026-001`), lançamentos usando `CASO-001` em vez dos IDs canônicos e linhas `#ERROR!` em `RESUMO_CASOS`.

O desenho atual mistura cinco responsabilidades que precisam ser separadas:

| Camada misturada hoje | Problema | Destino proposto |
|---|---|---|
| Cadastro de casos | IDs duplicados e modelos convivem com casos reais | Desk/CRM com `case_id` canônico |
| Parâmetros por país | Valores-base viram falsa precificação | matriz de elegibilidade e regras de jornada |
| SKU de referência | Pacotes por país e SKUs antigos se confundem | catálogo de capacidades, produtos-pai e módulos |
| Lançamentos financeiros | Mistura honorário, custo externo, taxa pública e complemento | módulo financeiro ligado a OS/cobrança |
| Simulador | Resume valores sem escopo, variáveis ou validação | configurador de proposta por caso |

#### 2.2. Catálogo de 91 linhas

Há um catálogo histórico de 91 linhas, já submetido a saneamento e priorização. O material operacional anterior organiza 30 candidatos para uso contextual e deixa 61 itens em destinos como `FUNDIR`, `FASE_2`, `PENDENTE_DE_VALIDAÇÃO` ou `ARQUIVAR_HISTÓRICO`.

Isso não deve ser transformado em 91 produtos vendáveis nem em 91 caminhos de jornada. O inventário é essencial para reconciliação, histórico, links, preços antigos, propostas existentes e migração. O motor operacional precisa trabalhar com uma camada menor, estável e semanticamente clara.

#### 2.3. Site e cobertura de países

O site apresenta oito nacionalidades atendidas: Itália, Portugal, Espanha, Alemanha, Polônia, Luxemburgo, Hungria e Áustria. O AncestralScan comunica 10 países, mas a listagem visível revisada contém oito. O Planejador legado, por sua vez, inclui Croácia, Romênia, França (naturalização), Brasil (naturalização) e Europa Geral, além de registros de caso e materiais para Croácia. Essa divergência exige uma matriz explícita de cobertura.

| Cobertura | País/processo | Situação observada | Decisão de produto proposta |
|---|---|---|---|
| Exposto no site | Itália | Jornada e produtos de cidadania mais documentados | ativo no motor, sujeito à validação jurídica por via |
| Exposto no site | Portugal | Exposto; planejador antigo contém pacote genérico | ativo somente por via validada; não usar preço-base legado |
| Exposto no site | Espanha | Exposto; texto do site ainda menciona LMD como caminho | manter como triagem/diagnóstico até validação vigente por via |
| Exposto no site | Alemanha | Exposto; há referências a §15/§5 e produtos legados | ativo por trilha de elegibilidade, sem pacote-país |
| Exposto no site | Polônia | Exposto | ativo por trilha de cadeia de nacionalidade |
| Exposto no site | Luxemburgo | Exposto | ativo por trilha de verificação documental e via aplicável |
| Exposto no site | Hungria | Exposto | ativo por trilha de descendência, idioma e requisitos consulares |
| Exposto no site | Áustria | Exposto; caso Ana Luiza documenta §58c | ativo por trilhas separadas, incluindo reparação histórica |
| Material/caso fora do site | Croácia | Caso Danilo e pacote legado identificado | classificar como `ATENDIMENTO_CONDICIONAL`; não expor comercialmente até aprovar cobertura |
| Material legado fora do site | Romênia | Só parâmetro/pacote genérico localizado | `EM_PESQUISA`; sem oferta e sem precificação |
| Material legado fora do site | França — naturalização | Parâmetro e caso-modelo localizados | `FORA_DO_PORTFÓLIO_PUBLICO` até decisão estratégica |
| Material legado fora do site | Brasil — naturalização | Parâmetro e caso-modelo localizados | `FORA_DO_PORTFÓLIO_PUBLICO` até decisão estratégica |
| Categoria técnica | Europa geral | Placeholder de simulador | eliminar como produto; usar somente como estado de triagem multivia |

**Regra:** um país ou via não entra em proposta, contrato ou cobrança porque aparece em uma planilha. Ele precisa estar marcado como `ATIVO`, ter fonte jurídica/revisão vigente, regras de elegibilidade, limites de atendimento e capacidade operacional atribuída.

### 3. Arquitetura-alvo

#### 3.1. Entidades canônicas

> Ver "Nota de decisão" no topo: as entidades abaixo foram mapeadas para tabelas já
> existentes em produção em vez de criadas do zero.

| Entidade | Finalidade | Campos mínimos | Fonte de verdade |
|---|---|---|---|
| `case` | Caso familiar/comercial | `case_id`, titular contratante, status, origem, responsável, modalidade | Desk/CRM |
| `case_member` | Titular, familiar, dependente, ascendente | nome, papel, vínculo, consentimento, representação | Desk/Dossiê |
| `lineage` | Linha de ancestralidade analisada | pessoa de origem, país, fatos, geração, evidências | Dossiê/Pesquisa |
| `eligibility_assessment` | Resultado de triagem | país, via, hipótese, confiança, bloqueios, fontes, validade de revisão | Motor de elegibilidade |
| `journey_instance` | Jornada selecionada para o caso | jornada, estágio, marcos, responsáveis, status | Desk |
| `journey_module` | Módulo aplicável/contratado | módulo, condição de entrada, escopo, dependências, evidências | Desk + OS |
| `catalog_product` | Item comercial interno | produto-pai, papel, visibilidade, política de preço, ciclo de vida | Catálogo |
| `proposal_scope` | Oferta enviada/aceita | versão, itens, preço, descontos, validade, premissas | Proposta/Canva + Desk |
| `service_order` | Escopo contratual executável | participantes, entregas, cronograma, aceite, valor congelado | Contrato/Anexo I |
| `financial_item` | Cobrança, recebimento, custo ou reembolso | natureza, valor, vencimento, status, origem | Financeiro/Asaas |
| `evidence` | Documento e prova vinculada | tipo, origem, titular, data, permissões, verificação | Drive/Dossiê |

#### 3.2. Separação de papéis

- **Site / AncestralScan:** descoberta, explicação por nacionalidade, captação e triagem inicial. Não exibe SKU, preço técnico, ranking interno ou regra jurídica definitiva.
- **Catálogo:** oferece capacidades, produtos-pai, módulos, complementos, vigência, regras de combinação e status de ciclo de vida.
- **Motor de elegibilidade:** avalia linha, país, via, condições, riscos e evidência. Não gera preço automaticamente.
- **Desk/CRM:** opera o caso, etapa, pendências, responsáveis, proposta, contrato, tarefas e evidências.
- **Contrato/OS:** fixa o escopo aprovado para o caso. O que está fora da OS não é execução contratada.
- **Financeiro/Asaas:** registra somente cobranças e recebimentos autorizados por proposta/OS aceita; custos externos ficam segregados.
- **Planilha legado:** importação controlada, consulta histórica e reconciliação; nunca fonte simultânea de cadastro, produto, preço e CRM.

### 4. Taxonomia de produtos-pai

A proposta não cria preços, não ativa produtos e não altera SKUs em sistemas. Ela define uma estrutura de produto para decisão humana e posterior implementação.

| Código proposto | Produto-pai / capacidade | Papel na jornada | Pode ser usado em | Derivados que absorve ou organiza |
|---|---|---|---|---|
| `P01` | Diagnóstico de elegibilidade e direção | entrada e decisão de caminho | todas as nacionalidades e linhas | consultorias, scans, diagnósticos e consultas pontuais validáveis |
| `P02` | Reconstrução genealógica e prova de linhagem | pesquisa/documentação | todas as vias por descendência ou reparação | pesquisa base, estudo aprofundado, pesquisa por sobrenome, relatórios de evidência |
| `P03` | Estratégia documental e saneamento de dossiê | preparação | todas as vias | montagem, revisão, atualização, checklist, certidões, retificações sob escopo |
| `P04` | Execução de reconhecimento/nacionalidade | execução principal | país/via aprovados | acompanhamento administrativo, consular ou judicial, conforme OS |
| `P05` | Gestão familiar e expansão do núcleo | extensão de caso | casos multipessoa | acompanhamento compartilhado, titulares adicionais, filhos e agrupamentos familiares |
| `P06` | Pós-reconhecimento e vida civil | continuidade pós-cidadania | países aplicáveis | AIRE, passaporte, registros, transcrições, identificadores e atos correlatos |
| `P07` | Pesquisa histórica, memória e legado | linha independente ou complementar | transversal | estudos, livros, entrevista, biografia, acervo e memória empresarial |
| `P08` | Continuidade, assinatura e relacionamento | recorrência | após entrega/por política comercial | planos, suporte, canais premium e acervo, se aprovados |
| `P09` | Educação e autonomia | produto educacional | transversal | kits, cursos, webinars; não entra na jornada de cidadania sem decisão comercial |

#### 4.1. Estados de catálogo

Todo item legado deve receber exatamente um destes estados antes de ganhar uso operacional:

| Estado | Efeito no motor |
|---|---|
| `CANONICO_ATIVO` | pode ser selecionado em proposta/OS conforme regras |
| `MODULO_ATIVO` | pode compor produto-pai sob condição |
| `COMPLEMENTO_CONDICIONAL` | aparece apenas quando gatilho do caso é atendido |
| `PILOTO_CONTROLADO` | uso manual, com aprovação e registro de evidência |
| `EM_REVISAO_COMERCIAL` | não aparece ao cliente e não gera cobrança nova |
| `ARQUIVADO_HISTORICO` | mantido para rastreabilidade; não selecionável |
| `FORA_DE_ESCOPO` | não elegível para a fase atual |

### 5. Jornada universal por caso

#### 5.1. Macroetapas

| Etapa | Resultado exigido | Exemplos de produto-pai/módulo | Gatilho para avançar |
|---|---|---|---|
| `J0 Descoberta` | lead identificado e consentimento de contato | AncestralScan, conversa inicial | dados mínimos e interesse confirmado |
| `J1 Triagem` | hipóteses de países/vias e lacunas iniciais | P01 | evidência mínima da linha e classificação de risco |
| `J2 Diagnóstico contratado` | parecer de elegibilidade e direção | P01 + P02 quando necessário | proposta aceita e escopo de diagnóstico definido |
| `J3 Estratégia e dossiê` | linha documental, plano e pendências priorizadas | P02 + P03 | OS, documentação mínima e autorização aplicável |
| `J4 Formalização` | contrato, OS, consentimentos e financeiro válidos | suporte operacional, não produto-país | requisitos de go-live atendidos |
| `J5 Execução da via` | protocolo/andamento conforme país e via | P04 | dossiê e requisitos específicos aprovados |
| `J6 Reconhecimento` | decisão/registro reconhecido e evidenciado | P04 | comunicação da autoridade ou registro válido |
| `J7 Pós-cidadania` | documentos e registros de uso civil | P06 | reconhecimento concluído e gatilhos aplicáveis |
| `J8 Legado e continuidade` | relação posterior, memória, recorrência | P07/P08/P09 | escolha explícita do cliente e produto aprovado |

#### 5.2. Regras de seleção

1. Uma **linha de ancestralidade** pode gerar várias hipóteses de país/via; o caso não deve ser fechado em um país antes da triagem.
2. Um **caso familiar** pode conter participantes em estágios diferentes; cada pessoa deve ter elegibilidade, documentos e escopo próprios quando necessário.
3. Um produto-pai pode operar em vários países. A regra local fica no módulo de elegibilidade, não no nome do SKU.
4. Complementos só entram por gatilho verificável: pessoa adicional, documento faltante, exigência de autoridade, registro civil, idioma, deslocamento, custo externo aprovado ou mudança de escopo.
5. A proposta usa linguagem comercial e valores aprovados; a OS traz entregas, limites, exclusões, responsabilidades e critérios de aceite.
6. Nenhuma regra jurídica é tratada como eterna: deve conter fonte, data de verificação, responsável e status de revisão jurídica.

### 6. De-para do legado

| Elemento legado | Problema | Destino no modelo final |
|---|---|---|
| `PACOTE-PT-01`, `PACOTE-ES-01`, `PACOTE-DE-01`, etc. | confundem país com produto e carregam preços-base não homologados | arquivar como referência histórica; substituir por P01–P06 + parâmetros de país/via |
| `CA-CID-002A/B/C/D` | variantes de pasta/revisão fragmentadas | módulos de P03; seleção por condição e escopo da OS |
| `CA-CID-004` e `CA-CID-005` | itens isolados sobrepostos ao combo | manter histórico; absorver em P06 quando aplicável |
| `CA-CID-023` | válido como referência de execução italiana, mas país-específico | reclassificar como instância de P04 para Itália, não como molde universal |
| `CA-CID-025` | componente familiar | módulo de P05 |
| `CA-CID-003`, `006`, `009`, `016`, `018` | pós-cidadania e registros fragmentados | P06 com módulos/condições por autoridade e pessoa |
| `CA-HIST-*`, `CA-MEM-*`, `CA-IND-*` | linha de memória com itens sobrepostos | P07 com catálogo específico e decisão comercial própria |
| `CA-ASS-*`, `CA-FAM-*`, `CA-WPP-*` | assinaturas com escopo/preço ainda não reconciliados | P08 em revisão comercial; invisível até homologação |
| `CA-CURSO-*` | educação misturada à operação de cidadania | P09, separado da jornada de execução |
| Planilha Mestre | centraliza campos heterogêneos e gera dependência | legado de reconciliação; exportação/migração, não fonte central |

### 7. Prioridades de implementação

#### Fase A — congelamento e segurança

- Congelar o Planejador legado em modo leitura e registrar sua versão/identificador.
- Corrigir ou descontinuar uso de IDs duplicados, `#ERROR!`, campos de caso-modelo e preços-base apresentados como parâmetro operacional.
- Proibir novos cadastros, propostas, cobranças ou contratos que dependam de um `SKU Base` legado sem mapeamento para produto-pai e módulo.
- Criar registro de cobertura por país/via com status, fonte jurídica, data de revisão, responsável e limite de atendimento.

#### Fase B — núcleo de dados

- Definir `case_id` único e migrar os casos reais, começando por Ana Luiza, Danilo, Giovanna, João Marcelo e Lara após verificação de dados.
- Criar tabelas/coleções para caso, membro, linha, elegibilidade, jornada, produto, proposta, OS, financeiro e evidência.
- Manter o identificador de SKU legado em uma tabela de alias/migração, sem fazê-lo comandar a jornada.
- Criar uma grade de decisão por `país + via + estágio + condição`, sem inserir preço automático.

> **Nota de decisão (2026-09-03):** a criação de tabelas novas descrita acima foi
> substituída por extensão das tabelas já existentes (ver "Nota de decisão" no topo).

#### Fase C — catálogo operacional

- Aprovar os produtos-pai P01–P09 ou ajustar os nomes pela proprietária.
- Mapear os 30 itens candidatos para produtos-pai, módulos e estados de catálogo.
- Encaminhar os 61 itens restantes ao destino já proposto: fundir, arquivar, fase futura ou validação humana.
- Reconciliar preço, condição, link e copy somente para os itens que forem aprovados para venda.

#### Fase D — experiência e integrações

- Alinhar o site ao cadastro de cobertura: os oito países expostos devem ter páginas/descrições com status de revisão e sem promessas rígidas de prazo ou elegibilidade.
- Resolver a divergência entre "10 países" do AncestralScan e os oito países exibidos.
- Adicionar Croácia, Romênia, França e Brasil somente após decisão explícita de cobertura pública; antes disso, tratá-los no Desk como condicionais ou históricos.
- Integrar financeiro apenas depois de proposta/OS aceita; não usar o Planejador para criar cobrança ou definir preço.

### 8. Critérios de aceite

A fase final será considerada pronta para implementação quando todos os critérios abaixo forem satisfeitos:

- Produto-pai, módulo e estado de catálogo estão aprovados para cada item utilizado na operação.
- Nenhum cadastro novo exige a Planilha Mestre como fonte única de SKU, CRM, preço, link ou jornada.
- Todo caso tem `case_id` único, sem duplicidade e sem IDs de exemplo ativos.
- `RESUMO_CASOS` ou seu sucessor não contém fórmulas com `#ERROR!` e calcula por dados canônicos.
- Cada jornada ativa depende de `país + via + condição + evidência`, e não somente de país.
- Preços usados em proposta/OS são aprovados e versionados; valores-base legados não são tratados como preço comercial.
- Países visíveis no site coincidem com a matriz de cobertura aprovada ou exibem claramente a condição de atendimento.
- Contrato, OS, Desk e financeiro compartilham o mesmo `case_id` e a mesma versão de escopo.
- SKUs legados arquivados não aparecem no App Cliente, site, proposta nova ou automação.
- A validação jurídica é registrada por via e data, sem automação de conclusão jurídica.

### 9. Limites e riscos

- Este documento não valida juridicamente regras de nacionalidade, elegibilidade, prazos ou documentos para qualquer país. São necessárias fontes oficiais atuais e revisão profissional antes de comunicação vinculante, proposta ou execução.
- O site contém afirmações de cobertura e regras resumidas que precisam ser auditadas periodicamente; não devem virar regra automática de decisão.
- A pesquisa realizada localizou referências, planilhas e documentos, mas parte dos arquivos de Drive/Dropbox retornou sem indexação no conector. Portanto, a revisão é sólida para a arquitetura, mas não substitui uma leitura integral de cada material externo antes da migração.
- O catálogo operacional de 30 e o inventário de 91 SKUs são propostas pendentes de decisão humana; não são autorização de ativação comercial.
- O repositório `clube-ancestral-intelligence-desk` foi identificado como vazio e o repositório `recriacao-do-clube-ancestral` contém a estrutura inicial do site, sem a documentação canônica observada nesta revisão.

### 10. Próximos passos (do documento original)

1. Proprietária aprova, rejeita ou ajusta a taxonomia P01–P09 e a matriz de cobertura.
2. Definir o repositório canônico de documentação do produto. Sugestão: `tatianatosi/clube-ancestral-intelligence-desk`, criando `docs/arquitetura/` e `docs/relatorios/`.
3. Abrir uma tarefa de migração técnica com inventário de tabelas, campos, IDs e regras de importação da Planilha Mestre e do Planejador legado.
4. Revisar por amostragem os casos reais e formalizar o mapa `SKU legado → produto-pai → módulo → jornada`.
5. Fazer auditoria jurídica e de conteúdo das oito nacionalidades expostas antes de ampliar o AncestralScan ou publicar novos países.
6. Após aprovação da proprietária, publicar este artefato no GitHub em `docs/arquitetura/2026-09-02-planejador-universal-produtos-pai-jornada.md` via branch e pull request, sem alterar código de produção.

## Próximos passos reais (pós-decisão de 2026-09-03)

1. Reautorizar o MCP do Supabase (bloqueio atual).
2. Confirmar se as triplicações em `product_catalog` são idênticas linha a linha ou divergem em algum campo (preço, status, jornada_fase etc.).
3. Deduplicar `product_catalog` antes de montar o de-para — um de-para sobre código triplicado propaga o erro em vez de corrigi-lo.
4. Montar o de-para SKU (`product_catalog`, usando a área/aba de SKU já existente como fonte) → produto-pai (P01–P09), adicionando apenas os produtos-pai que faltarem — não recriando o catálogo.
5. Confirmar existência ou ausência real de equivalentes para `eligibility_assessment`, `journey_instance` e `lineage` nas tabelas já existentes antes de propor qualquer tabela nova para essas três.
6. Só então migrar os 5 casos reais (Ana Luiza, Danilo, Giovanna, João Marcelo, Lara).
