> **Nota de arquivamento (2026-09-03):** este documento foi enviado pela proprietária em
> 2026-09-02 junto com uma segunda versão de mesmo título
> (`contexto-motor-cidadania-v1.0.md`, mesma pasta). Apesar do nome igual, as duas cumprem
> funções distintas e nenhuma substitui a outra:
> - **Esta versão** traz numeração própria `[^1]`–`[^28]` com uma seção `## References`
>   autocontida (URL e trecho de cada fonte) — útil para leitura fora do Perplexity, sem
>   depender do acervo de pesquisa vinculado.
> - **A outra versão** (`contexto-motor-cidadania-v1.0.md`) usa marcadores `[cite:N]`
>   ligados ao acervo de pesquisa Perplexity do Clube Ancestral e é a que traz o
>   `Destino proposto` explícito no cabeçalho original.
>
> Este documento cobre o **contexto regional/jurídico** (países, rotas, marcos legais,
> estados de hipótese) do novo Motor Planejador de Cidadania. É complementar — não
> concorrente — ao documento "Revisão Final — Planejador Universal, Produtos-Pai e
> Jornada" arquivado em `docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md`
> (PR #59), que cobre entidades/catálogo/produtos-pai. Nenhuma tabela nova, migração ou
> alteração de código foi executada a partir deste arquivamento — ver nota de decisão da
> PR #59 sobre o bloqueio de reautenticação do Supabase.

# Contexto Regional e Jurídico para o Novo Motor Planejador de Cidadania

**Status:** em revisão
**Versão:** v1.0
**Data:** 2026-09-02
**Responsável pela decisão:** Proprietária do Clube Ancestral
**Classificação para repositório:** `docs/arquitetura/`
**Fonte:** memória do Clube Ancestral; Auditoria-Mãe; Arquitetura Única de Oferta e Jornada; Planejador Universal; Painel de Calls; pesquisa em fontes governamentais oficiais
**Substitui:** não substitui documento anterior; consolida contexto disperso e prepara a base de uma nova versão do motor

## Escopo

Este documento resgata o contexto já acumulado pelo Clube Ancestral sobre países europeus, Europa Central e Oriental, Bálticos e Países Baixos, reconcilia esse contexto com a arquitetura aprovada da jornada única e prepara a estrutura de dados, regras, estados e componentes visuais para o novo Motor Planejador de Cidadania.

O material não declara elegibilidade jurídica individual, não define preços e não publica novas nacionalidades como serviços oficiais. Ele organiza hipóteses, marcos jurídicos, evidências e lacunas para que o motor apoie — sem substituir — a decisão humana especializada.

## Premissas

- O Planejador Universal é um módulo por caso, não a fonte-mãe de catálogo, preço, CRM ou links de pagamento. A Planilha Mestre continua sendo a autoridade para SKUs, enquanto o planejador consome parâmetros já homologados.[^1][^2]
- Existe uma única jornada modular. O país altera checklist, evidência, marco jurídico, risco e decisão; não cria uma jornada comercial paralela.[^1]
- O painel do cliente deve mostrar etapa, entrega, evidência, pendência e próximo passo. SKU, preço provisório, classificação interna, parecer jurídico e negociação permanecem no backoffice.[^1]
- O simulador e o planejador financeiro são instrumentos internos do Clube Ancestral e não devem ser apresentados ao lead como resposta automática de elegibilidade.
- A proprietária já determinou que marcos jurídicos por nacionalidade precisam ser verificáveis e aplicáveis durante o fluxo, em lógica semelhante à de um simulador.
- País de nascimento, etnia, sobrenome ou território histórico isoladamente nunca bastam para afirmar cidadania transmissível.

## Limites

- A Auditoria-Mãe confirmou divergências entre site, parâmetros, marcos jurídicos e listas do OPS. Portanto, "existir em uma planilha" não equivale a "serviço oficial homologado".[^2]
- Os marcos existentes foram resgatados como contexto operacional, mas precisam de revisão legal datada antes de implantação, principalmente onde houve mudança legislativa recente.
- Países novos nesta consolidação não recebem preço, SLA, promessa comercial ou link Asaas.
- Bélgica, Eslováquia, Ucrânia, Bulgária, Sérvia e Moldávia ficam como backlog de pesquisa, sem regra jurídica executável nesta versão.
- Toda conclusão do motor deve ser expressa como hipótese, indicação, incompatibilidade aparente ou necessidade de validação humana.

## Diagnóstico resgatado

O ecossistema já contém quatro universos diferentes de países: oito nacionalidades no site, onze tipos nos parâmetros do Planejador, oito nacionalidades na sincronização de marcos jurídicos e nove opções no dropdown do OPS. A Auditoria-Mãe registrou explicitamente que esses universos não estão reconciliados.[^2]

A cobertura publicada no site era: Itália, Portugal, Espanha, Alemanha, Polônia, Luxemburgo, Hungria e Áustria. Nos parâmetros também apareciam Croácia, Romênia, "Europeia Geral", naturalização brasileira e naturalização francesa; Luxemburgo e Hungria, embora publicados e presentes nos marcos, não tinham parâmetros financeiros completos.[^2]

O Planejador atual possui boa separação conceitual em instruções, parâmetros, casos, lançamentos, pagamentos, simulador, painel, automações, convenção de IDs e marcos jurídicos. Porém, contém IDs duplicados, erro de ano, fórmulas quebradas no resumo, simulador vazio e pagamentos sem dados úteis, o que impede utilizá-lo como base automática da nova versão.[^2]

A arquitetura única já decidiu que um caso pode conter múltiplas linhas e nacionalidades paralelas, mas deve selecionar apenas uma próxima ação por vez. O motor precisa comparar hipóteses sem transformar cada país em uma oferta separada.[^1]

## Universo regional

### Camada A — cobertura já publicada

| Região operacional | País | Código | Estado resgatado | Uso no novo motor |
|---|---|---:|---|---|
| Sul da Europa | Itália | IT | Publicado; parâmetros e marcos existentes | Migrar, versionar e revalidar regras |
| Sudoeste europeu | Portugal | PT | Publicado; parâmetros e marcos existentes | Migrar, versionar e revalidar regras |
| Sudoeste europeu | Espanha | ES | Publicado; parâmetros e marcos existentes | Migrar, versionar e revalidar regras |
| Europa Central | Alemanha | DE | Publicado; parâmetros e marcos existentes | Migrar com rotas de descendência, reparação e declaração |
| Europa Central | Áustria | AT | Publicado; parâmetros e marcos existentes | Migrar com rota comum e rota de reparação histórica § 58c |
| Europa Central/Oriental | Polônia | PL | Publicado; parâmetros e marcos existentes | Migrar com linha de continuidade e confirmação |
| Europa Central/Oriental | Hungria | HU | Publicado e presente em marcos; parâmetros incompletos | Ativar só a camada jurídica; preço bloqueado |
| Países Baixos históricos | Luxemburgo | LU | Publicado e presente em marcos; parâmetros incompletos e ausente no OPS | Ativar só a camada jurídica; preço e dropdown bloqueados |

Essa camada corresponde à cobertura que já aparecia no site e à base central usada no Painel de Calls e no Planejador.[^2]

### Camada B — contexto operacional

| Região operacional | País | Código | Estado resgatado | Uso no novo motor |
|---|---|---:|---|---|
| Sudeste/Centro-Oriental | Croácia | HR | Existe em parâmetros e em caso operacional; não estava reconciliada com site e marcos | Pré-cadastro interno; publicação bloqueada |
| Europa Oriental | Romênia | RO | Existe em parâmetros e OPS; não estava no site nem nos marcos | Pré-cadastro interno; publicação bloqueada |
| Europa Central | Tchéquia | CZ | Presente em pesquisas, dashboards e priorização de repositórios | Descoberta e pesquisa; regra jurídica pendente |
| Europa Central | Eslovênia | SI | Identificada como adjacência do ex-Império Austro-Húngaro e fronteira ítalo-eslovena | Descoberta avançada; regra jurídica pendente |

O Centro de Inteligência já havia priorizado Itália, Portugal, Espanha, Polônia, Alemanha, Áustria/Império Austro-Húngaro, Tchéquia e Croácia para pesquisa genealógica, com Eslovênia ativada por gatilho geográfico e histórico.[^3]

### Camada C — expansão solicitada

| Região operacional | País | Código | Estado nesta versão | Uso no novo motor |
|---|---|---:|---|---|
| Países Baixos | Países Baixos | NL | Nova pré-configuração com fontes oficiais | Triagem jurídica e documental interna |
| Países Baixos | Bélgica | BE | Novo cadastro regional sem regra executável | Apenas detecção de vínculo e backlog jurídico |
| Bálticos | Estônia | EE | Nova pré-configuração com lei oficial | Triagem de cidadania por nascimento/continuidade |
| Bálticos | Letônia | LV | Nova pré-configuração com rotas oficiais de descendentes e exilados | Triagem histórica e documental |
| Bálticos | Lituânia | LT | Nova pré-configuração com restauração e origem lituana | Triagem histórica e documental |

Países Baixos, Estônia, Letônia e Lituânia não constavam na matriz reconciliada do Planejador auditado; entram, portanto, como expansão controlada e não como serviços já homologados.[^2]

### Camada D — backlog oriental

| País | Código | Motivo para manter no radar | Estado permitido |
|---|---:|---|---|
| Eslováquia | SK | Fronteiras e sucessão austro-húngara/tchecoslovaca | `PESQUISA_JURIDICA_PENDENTE` |
| Ucrânia | UA | Registros históricos poloneses, austro-húngaros, romenos e soviéticos | `PESQUISA_JURIDICA_PENDENTE` |
| Bulgária | BG | Possível demanda regional futura | `PESQUISA_JURIDICA_PENDENTE` |
| Sérvia | RS | Sucessão iugoslava e austro-húngara | `PESQUISA_JURIDICA_PENDENTE` |
| Moldávia | MD | Sobreposição histórica romena e soviética | `PESQUISA_JURIDICA_PENDENTE` |

Esses países podem ser reconhecidos pelo módulo geográfico, mas não podem gerar resultado, preço ou proposta até existir ficha jurídica validada.

## Marcos jurídicos

### Estrutura comum

O novo motor não deve armazenar apenas uma frase de "marco jurídico". Cada marco precisa ser um registro versionado com:

- `framework_id` e `country_code`;
- nome oficial da lei, artigo ou regime;
- tipo de rota: atribuição ao nascer, reconhecimento, confirmação, declaração, restauração, reparação, opção ou naturalização;
- início e fim de vigência;
- evento histórico relacionado;
- pessoas alcançadas e gerações;
- condição de transmissão em cada nascimento;
- efeitos de casamento, sexo do ascendente, legitimação, adoção ou reconhecimento de filiação;
- regras de perda, renúncia, aquisição voluntária de outra nacionalidade e dupla cidadania;
- residência, idioma e integração quando aplicáveis;
- documentos mínimos e documentos reforçadores;
- autoridade competente e canal de protocolo;
- fonte oficial, data da última verificação e revisor;
- estado: `RASCUNHO`, `EM_REVISAO`, `VALIDADO_JURIDICAMENTE`, `SUSPENSO` ou `ARQUIVADO`.

### Fichas resgatadas

| País | Rotas que o motor deve distinguir | Marcos e eventos a modelar | Evidência mínima inicial | Estado |
|---|---|---|---|---|
| Itália | reconhecimento por descendência; linha materna histórica; naturalização/perda; via administrativa ou judicial | lei vigente na data de cada nascimento; transmissão entre gerações; naturalização do ascendente; restrições e mudanças legislativas recentes | cadeia civil completa, cidadania do ascendente, naturalização, casamento e datas de nascimento | `MIGRAR_E_REVALIDAR` |
| Portugal | atribuição; aquisição; casamento/união; outras rotas legais | grau de parentesco, nacionalidade do ascendente, transcrição/registro e vínculo exigido pela rota | certidões, assentos portugueses, cadeia de filiação e estado civil | `MIGRAR_E_REVALIDAR` |
| Espanha | origem/opção; memória democrática quando temporalmente aplicável; casamento/residência | lei vigente, prazo de regimes temporários, exílio, geração e registro civil | cadeia civil, prova de nacionalidade/origem e prova histórica quando aplicável | `MIGRAR_E_REVALIDAR` |
| Alemanha | descendência; declaração por discriminação histórica; restituição/reparação | nacionalidade alemã do ascendente, datas de nascimento e casamento, discriminação por sexo, perda e perseguição | registros civis, prova de cidadania, naturalização, casamento e perseguição | `MIGRAR_E_REVALIDAR` |
| Áustria | descendência; aquisição excepcional; reparação histórica pelo § 58c StbG | cidadania austríaca ou Heimatrecht, perseguição nazista, saída, perda e cadeia de descendência | prova de cidadania/vínculo austríaco, perseguição, emigração e filiação completa | `MIGRAR_E_REVALIDAR` |
| Polônia | confirmação de posse/perda; continuidade; outras aquisições | cidadania do ascendente, possíveis atos de perda, mudanças territoriais e legislação vigente em cada evento | registros civis, documentos poloneses, passaportes, registros militares e cadeia de filiação | `MIGRAR_E_REVALIDAR` |
| Hungria | verificação de cidadania; naturalização simplificada; casamento quando aplicável | ancestral cidadão ou provável origem húngara, continuidade documental e requisito linguístico da rota | documentos do ancestral, cadeia civil e prova linguística quando exigida | `JURIDICO_EXISTENTE_PRECO_BLOQUEADO` |
| Luxemburgo | filiação, opção/recuperação e regimes históricos encerrados | nacionalidade do ascendente, geração, prazos legais e efeitos de procedimentos antigos | registros luxemburgueses e cadeia civil | `JURIDICO_EXISTENTE_PRECO_BLOQUEADO` |
| Croácia | descendência; emigrante e descendentes; casamento associado quando aplicável | condição de emigrante, vínculo com território/cidadania e parentesco | prova do emigrante, registros croatas e cadeia de parentesco | `PRE_CADASTRO_INTERNO` |
| Romênia | descendência/restauração e sucessão territorial | nacionalidade anterior, território, perda não imputável e limite geracional conforme rota | registros romenos/históricos, cadeia civil e prova territorial | `PESQUISA_JURIDICA_PENDENTE` |
| Tchéquia | descendência/declaração/restauração conforme regime | cidadania tcheca ou tchecoslovaca, perda e sucessão estatal | registros civis, cidadania e cadeia familiar | `PESQUISA_JURIDICA_PENDENTE` |
| Eslovênia | descendência, emigrante/expatriado e naturalização especial conforme rota | cidadania, origem, emigração e vínculo ativo quando exigido | registros eslovenos, cadeia e prova de vínculo | `PESQUISA_JURIDICA_PENDENTE` |

No caso austríaco já existe uma base operacional detalhada: o Clube Ancestral distinguiu descendência convencional de reparação histórica pelo § 58c e organizou blocos de prova do requerente, ascendente perseguido, filiação e perseguição/vínculo com a Áustria.[^4][^5][^6]

Para a Polônia, a autoridade oficial orienta que a confirmação de posse ou perda seja solicitada ao voivoda, diretamente ou via consulado, com registros civis e documentos capazes de demonstrar a origem/cidadania de pais ou avós.[^7][^8]

A naturalização simplificada húngara admite, entre outros casos, requerente cujo ancestral tenha sido cidadão húngaro ou seja provavelmente de origem húngara; essa rota deve ficar separada da mera pesquisa genealógica e da verificação de cidadania.[^9]

Na Croácia, a fonte oficial reconhece emigrantes, descendentes e respectivos cônjuges no regime do artigo 11, exigindo prova do parentesco com o emigrante.[^10][^11]

### Países Baixos

| Elemento | Pré-configuração do motor |
|---|---|
| Rotas | nacionalidade automática ao nascer/por filiação; reconhecimento de filiação; adoção; procedimento de opção; naturalização; recuperação |
| Pergunta crítica | O pai ou a mãe era efetivamente neerlandês na data do nascimento e qual regra temporal se aplicava? |
| Marcos temporais | data de nascimento; estado civil dos pais; data e forma do reconhecimento de filiação; aquisição/perda de outra nacionalidade; residência fora do Reino/UE |
| Risco principal | tratar "avô neerlandês" como transmissão automática, ignorando perda ou interrupção entre gerações |
| Evidências | certidão integral do requerente; certidões dos pais; passaportes/certidões de nacionalidade neerlandesa; casamento; reconhecimento; naturalização e residência |
| Resultado permitido | `POSSIVEL_NACIONALIDADE_AO_NASCER`, `POSSIVEL_OPCAO`, `POSSIVEL_RECUPERACAO`, `NATURALIZACAO_RESIDENCIAL` ou `ANALISE_INCONCLUSA` |

Fontes oficiais neerlandesas distinguem aquisição automática por nascimento ou reconhecimento, opção e naturalização; a naturalização geral normalmente exige cinco anos de residência legal, enquanto a opção atende grupos específicos.[^12][^13][^14]

A análise histórica precisa considerar a nacionalidade do pai ou da mãe, o casamento dos pais e a data de nascimento, porque as regras de transmissão variaram. A via de opção também contempla algumas situações de discriminação histórica e ex-cidadãos.[^15][^16][^17][^18]

O motor deve verificar perda automática: um adulto com outra nacionalidade pode perder a neerlandesa após período prolongado fora do Reino e da União Europeia sem renovar passaporte ou certificado; a fonte governamental atual descreve um período de 13 anos.[^19][^20]

### Bálticos

| País | Rota inicial | Marco histórico obrigatório | Evidência prioritária | Alerta de motor |
|---|---|---|---|---|
| Estônia | cidadania por nascimento; restauração de quem perdeu quando menor; naturalização | cidadania do genitor na data de nascimento; continuidade da República | passaporte/cidadania estoniana do ascendente, registros civis e cadeia de filiação | não confundir descendência étnica com cidadania transmissível |
| Letônia | descendente de cidadão; exilado e descendentes; letões/lívios; naturalização | cidadania em 17/06/1940; saída/deportação entre 17/06/1940 e 04/05/1990 para rota de exílio | passaporte pré-guerra, censo de 1935, registros fiscais/militares, registros civis e cadeia | diferenciar continuidade de cidadania, exílio e origem étnica/linguística |
| Lituânia | restauração/reinstatement; origem lituana; naturalização simplificada ou geral | cidadania anterior à ocupação; exílio ou saída antes de 11/03/1990 conforme rota | prova de cidadania/origem, saída/exílio, cadeia civil e mudanças de nome | não presumir dupla cidadania; validar a exceção aplicável |

A lei estoniana prevê cidadania adquirida por nascimento quando pelo menos um dos pais era cidadão na data do nascimento, restauração para quem a perdeu quando menor e naturalização com requisitos próprios; a própria lei também contém restrição geral à dupla cidadania, que exige análise jurídica cuidadosa no caso concreto.[^21][^22]

A Letônia mantém rotas oficiais distintas. Para exilados, a referência combina cidadania em 17 de junho de 1940 com fuga ou deportação durante as ocupações e impossibilidade de retorno até 4 de maio de 1990; para descendência por continuidade, a autoridade aceita documentos como passaporte pré-guerra, registros civis, censo de 1935 e arquivos fiscais ou militares.[^23][^24]

A rota letã de letões e lívios é diferente da continuidade de cidadania: exige ancestral residente no território entre 1881 e 17 de junho de 1940, pertencimento étnico e fluência em letão. O motor deve manter essas rotas separadas.[^25]

Na Lituânia, o Migration Department é o órgão responsável por analisar restauração, aquisição, concessão, devolução, confirmação e perda, além de emitir certificados de origem lituana e do direito de restaurar a cidadania.[^26][^27]

## Eventos históricos transversais

O novo motor precisa tratar território e cidadania como dimensões diferentes. Um nascimento em local hoje pertencente à Croácia, Romênia, Eslovênia, Ucrânia ou Polônia pode ter ocorrido sob soberania austro-húngara, italiana, alemã, russa, tchecoslovaca, iugoslava ou soviética. O país atual do município não determina sozinho a cidadania histórica.

Cada evento genealógico deve carregar:

- nome histórico e nome atual do local;
- jurisdição civil e religiosa na data;
- Estado soberano na data;
- nacionalidade declarada no documento;
- cidadania comprovada por fonte própria;
- residência/domicílio e eventual direito de pertencimento municipal;
- idioma e variante do nome;
- fonte primária, transcrição e nível de confiança.

O motor deve ativar `STATE_SUCCESSION_REVIEW` sempre que houver mudança de fronteira ou Estado entre o nascimento do ascendente e o nascimento do descendente.

## Modelo decisório

### Unidade de análise

A unidade correta não é "família + país". É:

`caso → hipótese de país → rota jurídica → linha ancestral → elo de transmissão → evento → evidência → decisão humana`.

Isso permite que um mesmo caso contenha, por exemplo, uma linha húngara principal e uma linha alemã complementar, compartilhando documentos brasileiros sem misturar regras ou preços. A arquitetura do Clube Ancestral já prevê base documental compartilhada e hipóteses multipaís, com próxima ação única e proposta somente após decisão humana.[^28][^1]

### Estados da hipótese

| Estado | Significado | Pode aparecer no App? |
|---|---|---|
| `DECLARADA` | país informado pelo lead, sem prova | Sim, como "origem informada" |
| `INDICIO_GENEALOGICO` | existe ancestral/local/documento compatível | Sim, como "linha em investigação" |
| `ROTA_POSSIVEL` | regra jurídica potencialmente aplicável | Sim, sem linguagem de direito adquirido |
| `EVIDENCIA_INSUFICIENTE` | faltam provas essenciais | Sim, com checklist objetivo |
| `BLOQUEIO_APARENTE` | há evento que pode interromper a rota | Sim, com texto neutro e próxima ação |
| `PRONTA_PARA_REVISAO` | cadeia e documentos mínimos organizados | Sim |
| `VALIDADA_HUMANAMENTE` | especialista aprovou a conclusão preliminar | Sim, nos limites do parecer |
| `DESCARTADA` | hipótese encerrada com fundamento registrado | Sim, em linguagem acolhedora |
| `SUSPENSA_POR_MUDANCA_LEGAL` | regra precisa ser revista | Apenas aviso de revisão |

### Pontuação interna

Não usar "percentual de chance de cidadania". O painel interno pode calcular três índices separados, nunca exibidos como probabilidade jurídica:

- **Completude documental:** documentos obtidos ÷ documentos exigidos para a rota.
- **Continuidade da linha:** elos com filiação comprovada ÷ total de elos.
- **Confiabilidade jurídica:** proporção de regras aplicadas que estão validadas e vigentes.

O resultado visível deve usar faixas descritivas: `INICIAL`, `EM_APURACAO`, `DOCUMENTACAO_AVANCADA` e `PRONTA_PARA_REVISAO`.

## Estrutura de dados

### Entidades essenciais

| Entidade | Finalidade | Campos mínimos |
|---|---|---|
| `country_catalog` | catálogo regional | código ISO, nome, região, estado de cobertura, visibilidade |
| `legal_frameworks` | leis e regimes | país, nome, artigo, vigência, fonte, versão, estado de validação |
| `citizenship_routes` | rotas jurídicas | tipo, framework, público-alvo, geração, residência, idioma, dupla cidadania |
| `legal_milestones` | eventos de corte | data, evento, efeito, regra antes/depois, fonte |
| `route_requirements` | requisitos estruturados | requisito, operador, valor esperado, obrigatoriedade, exceção |
| `evidence_types` | tipos de prova | documento, força probatória, autoridade emissora, validade |
| `case_country_hypotheses` | hipóteses do caso | caso, país, rota, estado, confiança documental, responsável |
| `lineage_links` | elos familiares | ascendente, descendente, filiação, estado da prova |
| `life_events` | eventos | nascimento, casamento, naturalização, emigração, óbito, reconhecimento |
| `citizenship_events` | eventos jurídicos | aquisição, perda, renúncia, restauração, confirmação |
| `evidence_records` | evidências reais | arquivo, pessoa, evento, fonte, transcrição, divergência, revisão |
| `rule_evaluations` | aplicação de regra | regra, entrada, resultado, explicação, versão do motor |
| `human_decisions` | autoridade humana | decisão, responsável, data, fundamento, limites, revisão |
| `source_registry` | governança | URL/arquivo, órgão, idioma, data de acesso, vigência, confiabilidade |

### Separação obrigatória

- `country_catalog` não contém preço.
- `legal_frameworks` não contém SKU.
- `citizenship_routes` não cria oferta comercial.
- `case_country_hypotheses` não confirma direito sem `human_decisions`.
- preços e condições vêm do catálogo homologado somente depois da definição de escopo.
- o App Cliente consome uma visão sanitizada, não as tabelas jurídicas brutas.

## Painel pré-preparado

O módulo deve viver dentro do caso no Desk, sem criar um catálogo paralelo nem uma nova navegação principal. Ele pode ser aberto por um card "Planejamento de cidadania" no registro do caso.

### Cabeçalho do caso

- ID canônico do caso;
- cliente e núcleo familiar;
- objetivo declarado;
- país/linha principal;
- hipóteses secundárias;
- fase da jornada;
- responsável;
- última revisão humana;
- alerta de mudança legal;
- próxima ação única.

### Radar de países

| Campo | Comportamento |
|---|---|
| País | mostra nome e código |
| Origem da hipótese | lead, documento, árvore, call, pesquisa ou revisão humana |
| Região | Sul, Central, Oriental, Bálticos ou Países Baixos |
| Estado | usa a taxonomia de hipótese |
| Linha ancestral | identifica o ascendente e lado familiar |
| Rota em análise | uma ou mais rotas sem afirmar elegibilidade |
| Evidência-chave | documento que mais altera a decisão |
| Bloqueador | lacuna, perda, naturalização, idioma, prazo ou território |
| Próxima ação | uma ação objetiva |

### Linha do tempo jurídica

A visualização deve sobrepor:

1. eventos familiares;
2. cidadania comprovada ou alegada;
3. mudanças territoriais;
4. naturalização e perda;
5. vigência dos marcos legais;
6. nascimento de cada geração;
7. documento que prova cada evento.

Ao clicar em um marco, o Desk exibe regra, versão, fonte oficial, data da última revisão e impacto potencial. O App Cliente recebe apenas uma explicação curta e o documento solicitado.

### Matriz de transmissão

| Geração | Pessoa | Nascimento | Cidadania do genitor na data | Evento de risco anterior | Prova disponível | Resultado da regra | Revisão humana |
|---|---|---|---|---|---|---|---|
| G0 | ascendente de origem | data/local | comprovada, alegada ou desconhecida | emigração/naturalização | documento | indeterminado/compatível/bloqueio aparente | pendente |
| G1...Gn | descendentes | data/local | derivada de prova anterior | casamento, perda, renúncia | certidão | indeterminado/compatível/bloqueio aparente | pendente |

### Grade documental

- documento exigido;
- pessoa e evento;
- país emissor;
- inteiro teor/extrato/cópia;
- apostila/legalização;
- tradução;
- divergência nominal/data/local;
- solicitado, localizado, recebido, validado ou insuficiente;
- força probatória;
- fonte e arquivo;
- desbloqueia qual regra.

### Comparador de rotas

O comparador deve usar colunas para rota, base legal, geração, idioma, residência, prova histórica, risco de perda, dupla cidadania, autoridade, evidências faltantes e estado da revisão. Não deve exibir "melhor cidadania"; deve indicar a rota mais documentada e a próxima investigação de menor custo informacional.

### Bloco comercial

Somente após `VALIDADA_HUMANAMENTE` ou aprovação explícita de escopo, o Desk pode consultar:

- produto-pai aplicável;
- componentes documentais;
- microentregas;
- preço homologado;
- condição à vista/recorrência;
- contrato aplicável;
- link Asaas reconciliado.

O Planejador não pode criar SKU, preço ou link. Essa separação segue a Arquitetura Única, que mantém o catálogo técnico no backoffice e a jornada no App.[^1]

## Regras do motor

### Ordem de execução

1. Receber objetivo, pessoas, lugares, datas e documentos.
2. Normalizar nomes e geografia sem apagar grafias originais.
3. Detectar países atuais e Estados históricos relacionados.
4. Criar hipóteses `DECLARADA` ou `INDICIO_GENEALOGICO`.
5. Selecionar rotas jurídicas vigentes e versionadas.
6. Montar a cadeia de transmissão por geração.
7. Testar eventos críticos: naturalização, perda, renúncia, casamento, filiação, adoção, idioma, residência, exílio e prazo.
8. Identificar o menor conjunto de evidências que reduz a incerteza.
9. Gerar próxima ação única.
10. Encaminhar conclusão para revisão humana.
11. Somente depois, liberar escopo comercial e jornada operacional.

### Bloqueios automáticos

O motor deve interromper a conclusão e exigir revisão humana quando houver:

- regra jurídica sem fonte oficial vigente;
- conflito entre versões legais;
- território com sucessão estatal;
- naturalização com data desconhecida;
- diferença entre cidadania, nacionalidade étnica e local de nascimento;
- cadeia de filiação incompleta;
- casamento ou reconhecimento de filiação potencialmente determinante;
- regime temporário com prazo incerto ou expirado;
- exigência de idioma não verificada;
- possibilidade de perda de nacionalidade ou restrição de dupla cidadania;
- caso de perseguição, exílio, apatridia ou reparação histórica;
- documento com divergência material.

### Linguagem permitida

| Evitar | Usar |
|---|---|
| "Você tem direito" | "Há uma rota potencial que precisa de validação" |
| "Elegibilidade de 90%" | "A documentação está avançada, mas há pontos jurídicos pendentes" |
| "Cidadania garantida" | "O resultado depende da autoridade competente" |
| "País do ancestral confirma a cidadania" | "O local sustenta uma hipótese; a cidadania precisa de prova própria" |
| "Processo simples" | "A rota possui menos lacunas documentais neste momento" |
| "Prazo certo" | "Prazo estimado somente após confirmação da autoridade e do escopo" |

## Pré-carga regional

```yaml
regional_groups:
  published_core:
    - IT
    - PT
    - ES
    - DE
    - AT
    - PL
    - HU
    - LU
  operational_context:
    - HR
    - RO
    - CZ
    - SI
  low_countries_expansion:
    - NL
    - BE
    - LU
  baltic_expansion:
    - EE
    - LV
    - LT
  eastern_watchlist:
    - SK
    - UA
    - BG
    - RS
    - MD

visibility_policy:
  public_service: published_core
  internal_hypothesis: operational_context
  legal_research_pilot: [NL, EE, LV, LT]
  detection_only: [BE, SK, UA, BG, RS, MD]

mandatory_human_review: true
pricing_source: catalogo_homologado
legal_source: official_versioned_framework
customer_output: evidence_progress_next_action
```

A pré-carga é uma configuração de contexto, não uma autorização de publicação.

## Migração do legado

### Aproveitar

- convenção de IDs `CA-CID-{PAIS}-{ANO}-{SEQ}`;
- separação entre parâmetros, casos, lançamentos, pagamentos e marcos;
- Painel de Calls com comparativo, marcos jurídicos, roteiro SPIN e listas-base;
- jornada única e modular;
- estados operacionais já definidos;
- documentos e checklists do caso austríaco § 58c;
- pesquisa de repositórios por nacionalidade e território.

### Não migrar sem saneamento

- IDs duplicados;
- casos-modelo misturados a casos reais;
- fórmulas `#ERROR!`;
- preços conflitantes;
- SKUs de proposta misturados a SKUs oficiais;
- "Europeia Geral" como se fosse rota jurídica;
- naturalização brasileira/francesa misturada ao catálogo de reconhecimento por ancestralidade;
- países presentes apenas em dropdown como se estivessem homologados.

### Decisão de arquitetura

O novo motor deve ser implementado como banco versionado de regras e evidências, não como nova planilha monolítica. A planilha pode continuar como camada de auditoria/exportação, mas não deve ser a única execução do motor.

## Próximos passos

1. Aprovar a taxonomia regional e os estados de cobertura.
2. Confirmar se Países Baixos significa apenas NL ou o conjunto NL + BE + LU.
3. Nomear a autoridade jurídica responsável por homologar cada ficha.
4. Extrair as linhas completas da atual aba `MARCOS_JURIDICOS_SYNC` para migração controlada.
5. Revisar primeiro as oito nacionalidades publicadas.
6. Homologar o piloto Países Baixos + Bálticos usando somente fontes oficiais.
7. Pesquisar e preencher Bélgica, Romênia, Tchéquia e Eslovênia.
8. Criar as tabelas do modelo de dados no Supabase em ambiente de desenvolvimento.
9. Implementar regras explicáveis, histórico de versão e trilha de auditoria.
10. Construir o painel dentro do registro do caso no Desk.
11. Testar com casos-modelo separados de casos reais.
12. Integrar catálogo e cobrança apenas depois da aprovação de escopo.

## Critérios de aceite

- Nenhum país gera conclusão sem rota jurídica versionada e fonte oficial.
- Nenhum resultado automático usa as expressões "tem direito", "garantido" ou percentual de êxito.
- Toda hipótese aponta a linha ancestral, o marco aplicado, as evidências usadas e as faltantes.
- Mudanças de fronteira e sucessão estatal ativam revisão obrigatória.
- Naturalização, perda e renúncia são eventos de primeira classe no modelo.
- O painel suporta múltiplos países por caso e uma próxima ação prioritária.
- Caso-modelo e caso real possuem namespaces distintos.
- O App Cliente não recebe SKU, preço provisório ou regra jurídica bruta.
- O Desk registra decisão humana, responsável, data, fundamento e versão da regra.
- A camada comercial só consulta preço e link homologados após aprovação de escopo.
- Países novos permanecem internos até decisão da proprietária.
- A implementação passa por testes de regressão com ao menos um caso simples, um multipaís, um de sucessão territorial, um de reparação histórica e um com perda/naturalização incerta.

## Decisões pendentes

| Decisão | Opções | Recomendação desta versão |
|---|---|---|
| Alcance de "Países Baixos" | apenas NL; NL + BE + LU | Tratar como região NL + BE + LU, com níveis diferentes de maturidade |
| Publicação dos Bálticos | imediata; piloto interno | Piloto interno |
| Croácia e Romênia | publicar; manter operacional | Manter operacional até reconciliação jurídica e comercial |
| Forma do motor | nova planilha; banco versionado | Banco versionado com exportação para planilha |
| Resultado do motor | elegibilidade; hipótese explicável | Hipótese explicável + revisão humana |
| Integração financeira | embutida; posterior | Posterior à validação jurídica e de escopo |

## Síntese decisória

O contexto já acumulado é suficiente para construir a arquitetura do novo motor, mas não para automatizar decisões jurídicas. A base correta combina a jornada única já aprovada, as oito nacionalidades publicadas, os países operacionais adjacentes e uma expansão controlada para Países Baixos e Bálticos.[^1][^2]

A mudança principal é abandonar a lógica de uma linha por país e adotar um sistema versionado de rotas, marcos, eventos, evidências e decisões humanas. O painel deve explicar o que se sabe, o que falta, qual regra está sendo testada e qual é a próxima ação — sem prometer cidadania, prazo ou resultado.

---

## References

1. [03_ARQUITETURA_OFERTA_JORNADA/03_ARQUITETURA_OFERTA_JORNADA_Clube_Ancestral.md](03_ARQUITETURA_OFERTA_JORNADA/03_ARQUITETURA_OFERTA_JORNADA_Clube_Ancestral.md)

2. [02_AUDITORIA_MAE_Clube_Ancestral.md](02_AUDITORIA_MAE_Clube_Ancestral.md)

3. [eb3d89e9-da6f-48c9-a12c-07f59d1209d0.md](eb3d89e9-da6f-48c9-a12c-07f59d1209d0.md)

4. [como provar a cidadania austriaca anterior a 1938](https://www.perplexity.ai/search/12749c2d-8a10-4773-a9ea-271453a714b5) - Para provar cidadania austríaca anterior a 1938, o ideal é obter um documento que declare expressame...

5. [Documentos exigidos para enquadramentos no parágrafo 58c](https://www.perplexity.ai/search/4ec276b1-55a7-40aa-baa5-90659b8a833e) - Para o enquadramento pelo § 58c StbG, os documentos se dividem em quatro blocos: requerente, ascende...

6. [Crie um checklist estruturado para o processo de cidadania austríaca nos termos do § 58c da Lei de Cidadania, contendo: (1) O fluxo detalhado para emissão da Certidão Negativa de Naturalização no portal do Ministério da Justiça; (2) A lista completa de documentos pessoais necessários (certidões, antecedentes criminais, passaporte); (3) Os requisitos de prova de ascendência perseguida (evidência...](https://www.perplexity.ai/search/6d83288b-aaa9-47dd-8210-5f01f08f624c) - O checklist está pronto. Aqui está um resumo do que foi estruturado: Parte 1 — CNN (Certidão Negati...

7. [Confirming Polish citizenship or its loss - Poland in US](https://www.gov.pl/web/usa-en/confirming-polish-citizenship-or-its-loss)

8. [Confirmation of possession or loss of Polish citizenship](https://www.gov.pl/web/mswia-en/confirmation-of-possession-or-loss-of-polish-citizenship) - Do you need official certification of holding or not holding Polish citizenship? Here you will find ...

9. [Simplified naturalization (citizenship) - Embassy of Hungary](https://telaviv.mfa.gov.hu/eng/page/egyszerusitett-honositas)

10. [Citizenship](https://mup.gov.hr/aliens-281621/citizenship/281629)

11. [Na koji način hrvatsko državljanstvo može steći osoba koja ...](https://mup.gov.hr/pristup-informacijama-16/najcesca-pitanja-219/drzavljanstvo-281594/na-koji-nacin-hrvatsko-drzavljanstvo-moze-steci-osoba-koja-nema-reguliran-boravak-u-republici-hrvatskoj/281905)

12. [Becoming a Dutch citizen | Government.nl](https://www.government.nl/themes/migration-and-travel/dutch-citizenship/becoming-a-dutch-citizen) - Foreign citizens can apply for Dutch citizenship if they have lived in the Netherlands legally for a...

13. [Becoming a Dutch citizen abroad - NetherlandsWorldwide](https://www.netherlandsworldwide.nl/dutch-nationality/becoming-dutch-national-abroad) - There are 3 ways to become a Dutch citizen outside the Netherlands: by birth or acknowledgement, thr...

14. [Becoming a Dutch national through naturalisation | IND](https://ind.nl/en/dutch-citizenship/becoming-a-dutch-national-through-naturalisation) - Becoming a Dutch national by means of an option application · For an option application, you usually...

15. [Dutch citizen by birth, acknowledgment or adoption - IND](https://ind.nl/en/dutch-citizenship/dutch-citizen-by-birth-acknowledgment-or-adoption) - Last update: 31 December 2025. A child can automatically become a Dutch citizen by birth, acknowledg...

16. [Becoming a Dutch national by birth, acknowledgement or adoption](https://www.netherlandsworldwide.nl/dutch-nationality/birth-recognition) - Even children abroad can automatically receive Dutch nationality by birth, acknowledgement of parent...

17. [Becoming a Dutch citizen abroad through the option procedure](https://www.netherlandsworldwide.nl/dutch-nationality/option-procedure) - You may be able to become a Dutch citizen abroad through the option procedure. The exact conditions ...

18. [Regaining Dutch citizenship - IND](https://ind.nl/en/dutch-citizenship/regaining-dutch-citizenship) - When you lost Dutch citizenship, you can regain Dutch nationality in 2 ways: By submitting an applic...

19. [Automatic loss of Dutch citizenship - Government.nl](https://www.government.nl/themes/migration-and-travel/dutch-citizenship/loss-of-dutch-citizenship/automatic-loss-of-dutch-citizenship) - If you are an adult (18 years of age and above), you will automatically lose your Dutch citizenship ...

20. [Losing Dutch citizenship | Government.nl](https://www.government.nl/themes/migration-and-travel/dutch-citizenship/loss-of-dutch-citizenship) - If you only hold citizenship of the Netherlands, you will never automatically lose it. However, you ...

21. [Citizenship Act - Riigi Teataja](https://www.riigiteataja.ee/en/eli/512022015001/consolide) - A person who by birth acquires the citizenship of another state in addition to Estonian citizenship ...

22. [Citizenship Act](https://www.riigiteataja.ee/en/compare_original/528072025002) - Riigi Teataja

23. [Latvian exiles and their descendants - Citizenship - PMLP](https://www.pmlp.gov.lv/en/latvian-exiles-and-their-descendants) - Their descendants born before 1 October 2014 may concurrently acquire citizenship of Latvia. In case...

24. [A person who was a citizen of Latvia on 17 June 1940, or a his or ...](https://www.pmlp.gov.lv/en/person-who-was-citizen-latvia-17-june-1940-or-his-or-her-descendant-and-who-citizen-another-country) - Along with an adult, Latvian citizenship may be acquired by their children under age 15. If an adult...

25. [Latvians and Livs | Pilsonības un migrācijas lietu pārvalde - PMLP](https://www.pmlp.gov.lv/en/latvians-and-livs) - Their descendants under the age of 15 may concurrently acquire citizenship of Latvia. In case of reg...

26. [About the migration department](https://migracija.lrv.lt/en/administrative-information/about-the-migration-department/) - Within its competence, the Migration Department monitors the presence and residence of foreigners in...

27. [Citizenship of the Republic of Lithuania](https://migracija.lrv.lt/en/activities/citizenship-of-the-republic-of-lithuania-1/) - The Migration Department evaluates documents regarding the restoration, acquisition, granting, retur...

28. [Retome e revise o planejador universal em conjunto com os skus de produtos pai e jornada prepare um...](https://www.perplexity.ai/search/b6bead4f-0122-46af-b0d3-fe1ad1fa601e) - Concluí a revisão e criei o artefato 2026-09-02-revisao-planejador-universal-catalogo-pai-jornada-fi...
