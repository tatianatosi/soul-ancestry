> **Nota de arquivamento (2026-09-03):** este documento foi enviado pela proprietária em
> 2026-09-02 junto com uma segunda versão de mesmo título
> (`contexto-motor-cidadania-v1.0-referencias-completas.md`, mesma pasta). Apesar do nome
> igual, as duas cumprem funções distintas e nenhuma substitui a outra:
> - **Esta versão** usa marcadores `[cite:N]` ligados ao acervo de pesquisa Perplexity do
>   Clube Ancestral (sem lista de referências própria no rodapé) e é a que traz o
>   `Destino proposto` explícito para este caminho.
> - **A versão com referências completas** traz numeração própria `[^1]`–`[^28]` com uma
>   seção `## References` autocontida (URL e trecho de cada fonte), útil para leitura fora
>   do Perplexity.
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
**Destino proposto:** `docs/arquitetura/contexto-motor-cidadania-v1.0.md`
**Fonte:** memória do Clube Ancestral; Auditoria-Mãe; Arquitetura Única de Oferta e Jornada; Planejador Universal; Painel de Calls; fontes governamentais oficiais
**Substitui:** não substitui; consolida contexto disperso e prepara a nova versão do motor

## Escopo

Resgatar e organizar o contexto já acumulado sobre países europeus, Europa Central e Oriental, Bálticos e Países Baixos, conciliando-o com a jornada única do Clube Ancestral e preparando regras, estados, dados e componentes do novo painel.

O documento não declara elegibilidade individual, não cria preço nem publica nacionalidades novas. Ele estrutura hipóteses, marcos, evidências, bloqueios e decisões humanas.

## Premissas

- O Planejador é módulo por caso, não fonte-mãe de catálogo, preço, CRM ou links. A Planilha Mestre permanece autoridade de SKUs.[cite:43][cite:44]
- Existe uma jornada modular única. O país altera checklist, marco, evidência, risco e decisão, sem criar catálogo paralelo.[cite:43]
- O cliente vê etapa, entrega, evidência, pendência e próximo passo; SKU, preço provisório e raciocínio jurídico bruto ficam no Desk.[cite:43]
- O planejador financeiro e o simulador são internos, nunca apresentados como confirmação automática ao lead.[cite:7]
- Todo marco jurídico precisa ser verificável durante o fluxo.[cite:6]
- Sobrenome, etnia, nascimento ou território isolados não confirmam cidadania transmissível.

## Limites

- Há divergências entre site, parâmetros, marcos jurídicos e dropdowns do OPS; presença em planilha não equivale a serviço homologado.[cite:44]
- Marcos existentes precisam de revisão legal datada antes da implantação.
- País novo não recebe preço, SLA, promessa ou link Asaas nesta fase.
- Conclusões do motor são hipóteses explicáveis sujeitas a validação humana.

## Diagnóstico do legado

A Auditoria-Mãe encontrou oito nacionalidades no site, onze tipos nos parâmetros, oito na sincronização de marcos e nove opções no OPS. A cobertura publicada era Itália, Portugal, Espanha, Alemanha, Polônia, Luxemburgo, Hungria e Áustria.[cite:44]

O Planejador atual já separa instruções, parâmetros, casos, lançamentos, pagamentos, simulador, painel, automações, IDs e marcos, mas possui IDs duplicados, erro de ano, fórmulas quebradas, simulador vazio e pagamentos insuficientes.[cite:44]

A arquitetura única admite hipóteses multipaís dentro de um caso, porém exige uma próxima ação prioritária. O país não deve virar oferta autônoma antes da validação do escopo.[cite:43]

## Universo regional

### Cobertura publicada

| Região | País | ISO | Estado | Tratamento |
|---|---|---:|---|---|
| Sul | Itália | IT | Publicado | Migrar e revalidar |
| Sudoeste | Portugal | PT | Publicado | Migrar e revalidar |
| Sudoeste | Espanha | ES | Publicado | Migrar e revalidar |
| Central | Alemanha | DE | Publicado | Migrar descendência, declaração e reparação |
| Central | Áustria | AT | Publicado | Migrar descendência e § 58c |
| Central/Oriental | Polônia | PL | Publicado | Migrar continuidade e confirmação |
| Central/Oriental | Hungria | HU | Publicado, sem parâmetro financeiro completo | Jurídico ativo; preço bloqueado |
| Países Baixos históricos | Luxemburgo | LU | Publicado, sem parâmetro completo e ausente no OPS | Jurídico ativo; preço bloqueado |

### Contexto operacional

| País | ISO | Contexto encontrado | Estado |
|---|---:|---|---|
| Croácia | HR | Parâmetros e caso operacional; sem reconciliação com site/marcos | Pré-cadastro interno |
| Romênia | RO | Parâmetros e OPS; fora do site e marcos | Pré-cadastro interno |
| Tchéquia | CZ | Pesquisa, dashboard e priorização de repositórios | Regra jurídica pendente |
| Eslovênia | SI | Adjacência ítalo-eslovena e austro-húngara | Regra jurídica pendente |

O Centro de Inteligência já priorizava Itália, Portugal, Espanha, Polônia, Alemanha, Áustria/Império Austro-Húngaro, Tchéquia e Croácia; a Eslovênia era acionada por contexto territorial.[cite:42]

### Expansão controlada

| Região | País | ISO | Estado proposto |
|---|---|---:|---|
| Países Baixos | Países Baixos | NL | Piloto jurídico interno |
| Países Baixos | Bélgica | BE | Detecção de vínculo; backlog jurídico |
| Bálticos | Estônia | EE | Piloto jurídico interno |
| Bálticos | Letônia | LV | Piloto jurídico interno |
| Bálticos | Lituânia | LT | Piloto jurídico interno |

Esses países não constavam na matriz reconciliada auditada e não devem ser apresentados como serviços já homologados.[cite:44]

### Backlog oriental

Eslováquia (SK), Ucrânia (UA), Bulgária (BG), Sérvia (RS) e Moldávia (MD) podem ser detectadas pelo módulo territorial, mas permanecem em `PESQUISA_JURIDICA_PENDENTE`, sem resultado ou preço.

## Registro jurídico

Cada marco deve armazenar:

- `framework_id`, país, lei, artigo e fonte oficial;
- rota: atribuição, reconhecimento, confirmação, declaração, restauração, reparação, opção ou naturalização;
- início e fim de vigência;
- evento histórico relacionado;
- pessoas e gerações alcançadas;
- transmissão em cada nascimento;
- casamento, filiação, legitimação, adoção e reconhecimento;
- aquisição, perda, renúncia e dupla cidadania;
- residência, idioma e integração;
- documentos mínimos e reforçadores;
- autoridade e canal;
- data da revisão, revisor e versão;
- estado: `RASCUNHO`, `EM_REVISAO`, `VALIDADO_JURIDICAMENTE`, `SUSPENSO` ou `ARQUIVADO`.

## Matriz jurídica inicial

| País | Rotas a separar | Eventos críticos | Evidência inicial | Estado |
|---|---|---|---|---|
| Itália | descendência; linha materna histórica; administrativo/judicial | transmissão, nascimento, naturalização/perda | cadeia civil, cidadania e naturalização | Migrar/revalidar |
| Portugal | atribuição; aquisição; casamento/união | grau, registro, estado civil e vínculo | assentos e cadeia civil | Migrar/revalidar |
| Espanha | origem/opção; regimes de memória; residência | prazo, exílio, geração e registro | cadeia e prova histórica | Migrar/revalidar |
| Alemanha | descendência; declaração; restituição | sexo, casamento, perda, perseguição | cidadania, naturalização e perseguição | Migrar/revalidar |
| Áustria | descendência; § 58c | cidadania/Heimatrecht, perseguição, saída | vínculo austríaco, perseguição e filiação | Migrar/revalidar |
| Polônia | confirmação de posse/perda; continuidade | perda, território e lei na data | documentos poloneses e cadeia | Migrar/revalidar |
| Hungria | verificação; naturalização simplificada | origem/cidadania e idioma | documentos, cadeia e idioma | Jurídico; preço bloqueado |
| Luxemburgo | filiação; opção/recuperação | geração e prazos | registros e cadeia | Jurídico; preço bloqueado |
| Croácia | descendência; emigrante/descendentes | condição de emigrante e parentesco | prova do emigrante e cadeia | Pré-cadastro |
| Romênia | descendência/restauração | território, perda e geração | registros históricos e cadeia | Pesquisa pendente |
| Tchéquia | descendência/declaração | cidadania tcheca/tchecoslovaca e perda | registros e cadeia | Pesquisa pendente |
| Eslovênia | descendência/emigrante | cidadania, emigração e vínculo | registros e cadeia | Pesquisa pendente |

O caso austríaco já distingue descendência de reparação pelo § 58c e reúne provas do requerente, ascendente perseguido, filiação e perseguição/vínculo.[cite:21][cite:22][cite:27]

Na Polônia, a confirmação de posse/perda tramita perante o voivoda, diretamente ou via consulado, apoiada por registros civis e documentos dos pais/avós.[cite:86][cite:92]

Na Hungria, a naturalização simplificada pode alcançar quem demonstre ancestral cidadão ou provável origem húngara; deve ser separada de pesquisa genealógica e verificação de cidadania.[cite:87]

Na Croácia, a fonte oficial contempla emigrantes, descendentes e cônjuges no artigo 11, exigindo prova do parentesco.[cite:88][cite:100]

## Países Baixos

| Campo | Regra de triagem |
|---|---|
| Rotas | nascimento/filiação; reconhecimento; adoção; opção; naturalização; recuperação |
| Pergunta central | Pai ou mãe era neerlandês na data do nascimento e qual regra temporal vigorava? |
| Cortes | nascimento, casamento dos pais, reconhecimento, naturalização, perda e residência exterior |
| Risco | presumir transmissão por avô sem testar interrupção geracional |
| Evidências | certidões integrais, passaportes/certidões neerlandesas, casamento, reconhecimento e naturalização |
| Saídas | `POSSIVEL_AO_NASCER`, `POSSIVEL_OPCAO`, `POSSIVEL_RECUPERACAO`, `NATURALIZACAO_RESIDENCIAL`, `INCONCLUSA` |

Fontes oficiais separam aquisição automática por nascimento/reconhecimento, opção e naturalização; a naturalização geral normalmente exige cinco anos de residência, enquanto a opção atende grupos específicos.[cite:46][cite:108][cite:111]

A análise precisa considerar nacionalidade parental, casamento e data de nascimento, pois as regras variaram. A opção também abrange situações históricas e alguns ex-cidadãos.[cite:109][cite:110][cite:112][cite:113]

O motor deve testar perda automática. A regra governamental atual descreve perda para adulto com outra nacionalidade após 13 anos fora do Reino e da UE sem renovar passaporte ou certificado.[cite:52][cite:55]

## Bálticos

| País | Rota inicial | Marco histórico | Prova prioritária | Alerta |
|---|---|---|---|---|
| Estônia | nascimento; restauração de perda na menoridade; naturalização | cidadania do genitor no nascimento | documento estoniano e cadeia | etnia não equivale a cidadania |
| Letônia | descendente; exilado; letões/lívios; naturalização | 17/06/1940 e ocupações até 04/05/1990 | passaporte pré-guerra, censo, civil, fiscal/militar | separar continuidade, exílio e origem étnica |
| Lituânia | restauração; origem; simplificada/geral | cidadania pré-ocupação e saída antes de 11/03/1990 conforme rota | cidadania/origem, saída/exílio e cadeia | validar exceção de dupla cidadania |

A lei estoniana prevê cidadania por nascimento quando ao menos um genitor era cidadão, restauração para perda na menoridade e naturalização; também contém restrição geral à dupla cidadania.[cite:64][cite:78]

A Letônia separa exílio e continuidade. A rota de exilado combina cidadania em 17/06/1940 com fuga/deportação nas ocupações e impossibilidade de retorno até 04/05/1990; continuidade pode ser provada por passaporte pré-guerra, registros civis, censo e arquivos.[cite:51][cite:54]

A rota de letões/lívios exige ancestral residente entre 1881 e 17/06/1940, pertencimento étnico e fluência em letão, não podendo ser confundida com continuidade de cidadania.[cite:60]

Na Lituânia, o Migration Department analisa restauração, aquisição, concessão, devolução, confirmação e perda e emite certificados de origem e direito de restauração.[cite:69][cite:77]

## Geografia histórica

Território atual e cidadania histórica são dimensões distintas. Cada evento deve guardar:

- local histórico e atual;
- jurisdição civil/religiosa;
- Estado soberano na data;
- nacionalidade declarada;
- cidadania comprovada separadamente;
- residência, domicílio ou pertencimento municipal;
- idioma/grafia original;
- fonte, transcrição e confiança.

Mudança de fronteira ou Estado ativa `STATE_SUCCESSION_REVIEW`.

## Modelo decisório

Unidade: `caso → hipótese-país → rota → linha ancestral → elo → evento → evidência → decisão humana`.

Isso permite base documental compartilhada em casos multipaís sem misturar regras, escopos ou preços.[cite:31][cite:43]

### Estados

| Estado | Significado |
|---|---|
| `DECLARADA` | país informado, sem prova |
| `INDICIO_GENEALOGICO` | ancestral/local/documento compatível |
| `ROTA_POSSIVEL` | regra potencial a validar |
| `EVIDENCIA_INSUFICIENTE` | faltam provas essenciais |
| `BLOQUEIO_APARENTE` | evento pode interromper transmissão |
| `PRONTA_PARA_REVISAO` | cadeia mínima organizada |
| `VALIDADA_HUMANAMENTE` | conclusão preliminar aprovada |
| `DESCARTADA` | hipótese encerrada com fundamento |
| `SUSPENSA_POR_MUDANCA_LEGAL` | regra em revisão |

Não usar percentual de chance jurídica. Calcular internamente apenas completude documental, continuidade da linha e confiabilidade das regras; exibir faixas `INICIAL`, `EM_APURACAO`, `DOCUMENTACAO_AVANCADA` e `PRONTA_PARA_REVISAO`.

## Dados essenciais

| Entidade | Conteúdo |
|---|---|
| `country_catalog` | ISO, região, cobertura, visibilidade |
| `legal_frameworks` | lei, artigo, vigência, fonte, versão |
| `citizenship_routes` | tipo, geração, residência, idioma, dupla cidadania |
| `legal_milestones` | data, evento e efeito |
| `route_requirements` | requisito, operador, valor e exceção |
| `evidence_types` | documento, força e emissor |
| `case_country_hypotheses` | caso, país, rota, estado e responsável |
| `lineage_links` | ascendente, descendente e prova |
| `life_events` | nascimento, casamento, naturalização, emigração etc. |
| `citizenship_events` | aquisição, perda, renúncia, restauração e confirmação |
| `evidence_records` | arquivo, evento, fonte, divergência e revisão |
| `rule_evaluations` | regra, entrada, resultado, explicação e versão |
| `human_decisions` | responsável, data, fundamento, limites e revisão |
| `source_registry` | URL/arquivo, órgão, idioma, acesso e vigência |

País não contém preço; marco não contém SKU; rota não cria oferta; hipótese não confirma direito sem decisão humana. O App consome visão sanitizada.

## Painel do caso

### Cabeçalho

ID canônico; cliente/núcleo; objetivo; país/linha principal; hipóteses secundárias; fase; responsável; última revisão; alerta legal; próxima ação única.

### Radar

País; origem da hipótese; região; estado; linha ancestral; rota; evidência-chave; bloqueador; próxima ação.

### Linha do tempo

Sobrepor eventos familiares, cidadania, mudanças territoriais, naturalização/perda, vigência legal, nascimento de cada geração e documento probatório. No Desk, cada marco abre regra, versão, fonte e impacto; no App, apenas explicação curta e pedido documental.

### Matriz de transmissão

| Geração | Pessoa | Nascimento | Cidadania do genitor | Risco anterior | Prova | Regra | Revisão |
|---|---|---|---|---|---|---|---|
| G0...Gn | pessoa | data/local | comprovada/alegada/desconhecida | naturalização, casamento, perda etc. | documento | indeterminado/compatível/bloqueio | pendente |

### Grade documental

Documento, pessoa/evento, emissor, formato, apostila/legalização, tradução, divergência, status, força probatória, fonte e regra desbloqueada.

### Comparador

Comparar rota, base legal, geração, idioma, residência, prova histórica, perda, dupla cidadania, autoridade, faltantes e revisão. Indicar rota mais documentada e próxima investigação de menor custo informacional, nunca "melhor cidadania".

### Comercial

Só depois de `VALIDADA_HUMANAMENTE` e escopo aprovado, consultar produto-pai, componentes, microentregas, preço homologado, condição, contrato e link reconciliado. O Planejador não cria SKU, preço ou link.[cite:43]

## Regras de execução

1. Receber pessoas, locais, datas, documentos e objetivo.
2. Normalizar sem apagar grafias originais.
3. Detectar países atuais e Estados históricos.
4. Criar hipóteses.
5. Selecionar rotas versionadas.
6. Montar transmissão por geração.
7. Testar naturalização, perda, renúncia, casamento, filiação, adoção, idioma, residência, exílio e prazo.
8. Encontrar o menor conjunto de provas que reduz incerteza.
9. Gerar próxima ação única.
10. Exigir revisão humana.
11. Só então liberar escopo comercial.

### Bloqueios

Fonte oficial ausente; versões conflitantes; sucessão estatal; naturalização sem data; confusão entre etnia/local/cidadania; filiação incompleta; casamento ou reconhecimento determinante; prazo temporário; idioma; perda/dupla cidadania; perseguição/exílio/apatridia; divergência documental material.

### Linguagem

| Evitar | Usar |
|---|---|
| Você tem direito | Há rota potencial sujeita a validação |
| 90% elegível | Documentação avançada, com pontos pendentes |
| Garantido | Resultado depende da autoridade |
| País do ancestral confirma | O local sustenta hipótese; cidadania exige prova |
| Processo simples | Rota com menos lacunas atuais |
| Prazo certo | Estimativa após autoridade e escopo |

## Pré-carga

```yaml
published_core: [IT, PT, ES, DE, AT, PL, HU, LU]
operational_context: [HR, RO, CZ, SI]
low_countries_expansion: [NL, BE, LU]
baltic_expansion: [EE, LV, LT]
eastern_watchlist: [SK, UA, BG, RS, MD]
legal_research_pilot: [NL, EE, LV, LT]
detection_only: [BE, SK, UA, BG, RS, MD]
mandatory_human_review: true
pricing_source: catalogo_homologado
customer_output: evidence_progress_next_action
```

## Migração

### Aproveitar

- IDs `CA-CID-{PAIS}-{ANO}-{SEQ}`;
- separação de parâmetros, casos, lançamentos, pagamentos e marcos;
- Painel de Calls;
- jornada modular;
- estados operacionais;
- checklists austríacos § 58c;
- repositórios por nacionalidade/território.

### Não migrar sem saneamento

- IDs duplicados e casos-modelo misturados;
- fórmulas quebradas;
- preços conflitantes;
- SKU oficial misturado a código de proposta;
- "Europeia Geral" como rota;
- naturalizações BR/FR misturadas ao reconhecimento ancestral;
- país de dropdown tratado como serviço.

### Decisão

Implementar como banco versionado de regras e evidências, com planilha apenas para auditoria/exportação; não criar nova planilha monolítica.

## Próximos passos

1. Aprovar regiões e estados.
2. Confirmar se "Países Baixos" = NL ou NL + BE + LU.
3. Definir responsável pela homologação jurídica.
4. Extrair `MARCOS_JURIDICOS_SYNC` integralmente.
5. Revisar as oito nacionalidades publicadas.
6. Homologar piloto NL + Bálticos.
7. Pesquisar BE, RO, CZ e SI.
8. Criar tabelas no Supabase de desenvolvimento.
9. Implementar explicabilidade, versões e auditoria.
10. Construir módulo dentro do caso no Desk.
11. Testar modelos separados de casos reais.
12. Integrar catálogo/cobrança só após escopo aprovado.

## Critérios de aceite

- Nenhum país conclui sem rota versionada e fonte oficial.
- Não usar "tem direito", "garantido" ou percentual de êxito.
- Toda hipótese aponta linha, marco, provas usadas e faltantes.
- Sucessão estatal exige revisão.
- Naturalização, perda e renúncia são eventos próprios.
- Suporta múltiplos países e uma próxima ação.
- Modelos e casos reais têm namespaces separados.
- App não recebe SKU, preço provisório ou regra bruta.
- Decisão humana registra responsável, data, fundamento e versão.
- Comercial só consulta valores homologados após escopo.
- País novo permanece interno até decisão da proprietária.
- Testes cobrem caso simples, multipaís, sucessão territorial, reparação e perda incerta.

## Decisões pendentes

| Tema | Recomendação |
|---|---|
| Países Baixos | Região NL + BE + LU, com maturidades distintas |
| Bálticos | Piloto interno |
| Croácia/Romênia | Operacional interno até reconciliação |
| Motor | Banco versionado com exportação |
| Resultado | Hipótese explicável + revisão humana |
| Financeiro | Integrar após validação jurídica e de escopo |

## Síntese

O contexto acumulado permite construir a arquitetura, mas não automatizar decisões jurídicas. A base deve combinar a jornada única, as oito nacionalidades publicadas, países operacionais adjacentes e expansão controlada para Países Baixos e Bálticos.[cite:43][cite:44]

A nova lógica deve substituir "uma linha por país" por rotas, marcos, eventos, evidências e decisões versionadas. O painel explica o que se sabe, o que falta, qual regra está em teste e a próxima ação, sem prometer cidadania, prazo ou resultado.
