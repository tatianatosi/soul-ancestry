> **Nota de arquivamento (2026-09-03):** documento enviado pela proprietária em
> 2026-09-02, terceira peça do conjunto de contexto do novo Motor Planejador de
> Cidadania, ao lado de:
> - `docs/arquitetura/2026-09-02_PLANEJADOR-UNIVERSAL-PRODUTOS-PAI-JORNADA-REVISAO-FINAL.md`
>   (PR #59) — entidades/catálogo/produtos-pai;
> - `docs/arquitetura/contexto-motor-cidadania-v1.0.md` e
>   `docs/arquitetura/contexto-motor-cidadania-v1.0-referencias-completas.md`
>   (PR #60) — cobertura regional/jurídica por país.
>
> Este documento traduz esse contexto em **instruções executáveis** (modelo de dados,
> fases 0–8, casos de teste, critérios de aceite). A proprietária confirmou "permanece
> contexto e segue as instruções corretas do planejador" — arquivado integralmente, sem
> alteração de conteúdo, no destino que o próprio documento pede.
>
> **Continua "em revisão", não "aprovado".** O documento define sua própria condição de
> aprovação (seção "Condição para aprovação", ao final): regiões/países da primeira onda,
> política de visibilidade, autoridade de decisão jurídica, separação motor/catálogo/
> financeiro, estados e linguagem do motor, ambiente Supabase de desenvolvimento, casos
> mínimos de teste e critérios de go-live. Nenhum desses itens foi confirmado
> explicitamente ainda, então nenhuma Fase 0–8 foi iniciada nesta PR — ela cobre somente o
> arquivamento do documento. Acesso MCP ao Supabase segue bloqueado por reautenticação
> pendente (ver PR #59), o que também impede qualquer leitura de schema real (Fase 0)
> antes da reautorização.

# Instruções de Construção do Motor Planejador de Cidadania

**Status:** em revisão
**Versão:** v1.0
**Data:** 2026-09-02
**Responsável pela decisão:** Proprietária do Clube Ancestral
**Classificação:** instruções de implementação e decisão de arquitetura
**Destino proposto no GitHub:** `docs/prompts/instrucoes-motor-cidadania-v1.0.md`
**Fonte:** `contexto-motor-cidadania-v1.0.md`; `02_AUDITORIA_MAE_Clube_Ancestral.md`; `03_ARQUITETURA_OFERTA_JORNADA/03_ARQUITETURA_OFERTA_JORNADA_Clube_Ancestral.md`; Planejador Universal; Painel de Calls; memória do Clube Ancestral; fontes governamentais oficiais
**Substitui:** não substitui documento anterior; transforma o contexto consolidado em instruções executáveis

## Objetivo

Construir, dentro do ecossistema do Clube Ancestral, um novo Motor Planejador de Cidadania capaz de organizar hipóteses multipaís, linhas ancestrais, rotas jurídicas, marcos temporais, sucessões territoriais, evidências documentais, bloqueios e decisões humanas.

O motor deve apoiar a pesquisa e o planejamento do caso. Não deve emitir parecer jurídico automático, prometer elegibilidade, criar produtos, definir preços ou substituir a validação da proprietária e do profissional jurídico responsável.

## Escopo

Estas instruções abrangem:

- modelagem do banco de regras e evidências;
- migração controlada do Planejador Universal;
- catálogo de países e regiões;
- versionamento de marcos jurídicos;
- avaliação explicável de rotas;
- tratamento de linhas multipaís;
- painel interno no Desk;
- visão sanitizada no App Cliente;
- integração posterior com catálogo, contratos e Asaas;
- trilha de auditoria e decisão humana;
- testes de regressão e critérios de aceite.

Não fazem parte desta etapa:

- publicação de novas nacionalidades no site;
- alteração de preços;
- criação ou exclusão de SKUs;
- ativação de links de pagamento;
- emissão de parecer jurídico definitivo;
- automação de protocolo perante autoridades;
- alteração de dados reais em produção sem aprovação humana.

## Premissas obrigatórias

1. O Planejador é módulo do caso, não fonte-mãe do ecossistema.
2. A Planilha Mestre homologada continua sendo a fonte de catálogo, SKU e preço.
3. O motor jurídico não deve armazenar preço dentro de país, marco ou rota.
4. Existe uma jornada única e modular; o país modifica regras, provas e riscos, não cria jornada paralela.
5. Um caso pode conter várias hipóteses de país e linha ancestral, mas deve ter apenas uma próxima ação prioritária por ciclo.
6. Todo resultado depende de regra versionada, evidência rastreável e revisão humana.
7. O App Cliente recebe somente progresso, evidências, pendências e próxima ação.
8. O Desk pode exibir detalhes jurídicos, fontes, versões, bloqueios, divergências e decisões.
9. Nenhum dado ausente pode ser inventado ou preenchido por inferência silenciosa.
10. País em dropdown, planilha ou caso isolado não significa serviço comercial homologado.
11. Casos-modelo devem permanecer separados de casos reais.
12. O motor deve preservar grafias, datas e localidades originais antes de normalizá-las.

A arquitetura vigente determina que o cliente não navegue por catálogo técnico e que o Planejador apenas consuma decisões aprovadas, pois a versão legada contém IDs duplicados, fórmulas quebradas e parâmetros conflitantes.[cite:43][cite:44]

## Resultado esperado

Ao abrir um caso, a operação deve conseguir:

- visualizar todas as hipóteses nacionais relevantes;
- identificar a linha ancestral associada a cada hipótese;
- consultar as rotas jurídicas potencialmente aplicáveis;
- entender quais marcos e eventos alteram a transmissão;
- localizar o elo documental mais fraco;
- verificar naturalização, perda, renúncia, casamento, filiação e sucessão territorial;
- saber quais documentos faltam;
- registrar divergências e força probatória;
- selecionar a próxima ação de menor custo informacional;
- submeter a conclusão preliminar à revisão humana;
- liberar escopo comercial somente após aprovação.

## Autoridades de dados

| Domínio | Fonte de autoridade | Regra |
|---|---|---|
| Caso e participantes | núcleo canônico do caso | Não duplicar pessoas por país |
| Catálogo e SKU | Planilha Mestre/Supabase homologado | Motor somente consulta |
| Preço e condição | catálogo comercial aprovado | Nunca inferir por país |
| Link de pagamento | reconciliação Asaas aprovada | Nunca usar placeholder |
| Regra jurídica | banco versionado de marcos | Exigir fonte oficial e revisão |
| Evidência | arquivo/documento vinculado ao evento | Preservar origem e histórico |
| Decisão | registro de decisão humana | Guardar responsável, data e fundamento |
| Visibilidade | política App/Desk | App recebe visão sanitizada |

## Países e regiões

### Núcleo publicado

Pré-carregar como cobertura existente, ainda sujeita à revalidação jurídica:

- Itália — IT;
- Portugal — PT;
- Espanha — ES;
- Alemanha — DE;
- Áustria — AT;
- Polônia — PL;
- Hungria — HU;
- Luxemburgo — LU.

Hungria e Luxemburgo não podem receber preço ou link até a reconciliação dos parâmetros comerciais. A Auditoria-Mãe encontrou essas nacionalidades nos marcos e no site, mas sem parâmetros completos no Planejador.[cite:44]

### Contexto operacional

Pré-cadastrar apenas para operação interna:

- Croácia — HR;
- Romênia — RO;
- Tchéquia — CZ;
- Eslovênia — SI.

Croácia e Romênia não devem ser tratadas como portfólio publicado apenas por aparecerem em parâmetros ou casos. Tchéquia e Eslovênia entram inicialmente como contextos genealógicos e territoriais.[cite:42][cite:44]

### Piloto jurídico

Criar fichas internas em revisão para:

- Países Baixos — NL;
- Estônia — EE;
- Letônia — LV;
- Lituânia — LT.

Não publicar esses países no site ou gerar proposta automática. O piloto deve validar modelo de dados, eventos históricos e explicabilidade.

### Detecção territorial

Permitir detecção sem regra executável para:

- Bélgica — BE;
- Eslováquia — SK;
- Ucrânia — UA;
- Bulgária — BG;
- Sérvia — RS;
- Moldávia — MD.

Nesses casos, criar somente `INDICIO_GENEALOGICO` ou `PESQUISA_JURIDICA_PENDENTE`.

## Estados de cobertura

Implementar enumeração controlada:

```text
PUBLICADO_REVALIDACAO_PENDENTE
JURIDICO_ATIVO_PRECO_BLOQUEADO
PRE_CADASTRO_INTERNO
PILOTO_JURIDICO_INTERNO
DETECCAO_TERRITORIAL
PESQUISA_JURIDICA_PENDENTE
SUSPENSO_POR_MUDANCA_LEGAL
ARQUIVADO
```

Regras:

- somente decisão humana altera o estado de cobertura;
- `PUBLICADO_REVALIDACAO_PENDENTE` não significa rota automaticamente válida;
- `PILOTO_JURIDICO_INTERNO` não pode aparecer como serviço no App ou site;
- `SUSPENSO_POR_MUDANCA_LEGAL` bloqueia novas conclusões;
- manter histórico de toda alteração.

## Modelo de dados

Criar as entidades abaixo em ambiente de desenvolvimento.

### `country_catalog`

Campos mínimos:

```text
id
iso2
name_pt
name_local
operational_region
current_state
public_visibility
legal_visibility
commercial_visibility
notes
created_at
updated_at
```

### `legal_frameworks`

```text
id
country_id
official_name
short_name
law_number
article
route_family
valid_from
valid_until
historical_context
source_registry_id
source_language
review_status
reviewed_by
reviewed_at
version
supersedes_framework_id
created_at
updated_at
```

### `legal_milestones`

```text
id
framework_id
milestone_date
milestone_type
title
effect_before
effect_after
affected_population
requires_human_review
source_registry_id
version
```

### `citizenship_routes`

```text
id
framework_id
country_id
route_code
route_name
route_type
target_population
generation_rule
residence_rule
language_rule
integration_rule
dual_citizenship_rule
filing_authority
filing_channel
active
review_status
version
```

### `route_requirements`

```text
id
route_id
requirement_code
requirement_type
subject_role
operator
expected_value
mandatory
exception_logic
sequence
human_review_required
```

### `source_registry`

```text
id
source_type
issuing_authority
title
url_or_repository_path
country_id
language
publication_date
accessed_at
validity_status
reliability_level
archived_copy_reference
notes
```

### `case_country_hypotheses`

```text
id
case_id
country_id
route_id
lineage_branch_id
hypothesis_origin
hypothesis_state
document_completeness
lineage_continuity
legal_rule_confidence
main_blocker
priority_rank
next_action
assigned_to
last_human_review_at
created_at
updated_at
```

### `lineage_links`

```text
id
case_id
parent_person_id
child_person_id
relationship_type
biological_or_legal
proof_status
primary_evidence_id
conflict_status
human_validation_status
```

### `life_events`

```text
id
person_id
event_type
event_date_start
event_date_end
historical_place_name
current_place_name
historical_state
current_country_id
civil_jurisdiction
religious_jurisdiction
name_as_recorded
normalized_name
confidence_level
```

### `citizenship_events`

```text
id
person_id
country_id
event_type
claimed_or_proven
event_date
legal_basis
naturalization_country
voluntary_act
primary_evidence_id
impact_on_transmission
human_review_status
```

Tipos de evento mínimos:

```text
ACQUISITION
CITIZEN_AT_BIRTH
CONFIRMATION
NATURALIZATION
LOSS
RENUNCIATION
RESTORATION
OPTION
DECLARATION
UNKNOWN_STATUS
```

### `evidence_records`

```text
id
case_id
person_id
life_event_id
citizenship_event_id
evidence_type_id
file_reference
issuing_authority
issue_date
record_date
original_language
transcription
translation_reference
apostille_status
document_status
probative_strength
divergence_status
reviewed_by
reviewed_at
```

### `rule_evaluations`

```text
id
case_hypothesis_id
route_id
requirement_id
input_snapshot
result_code
explanation
blocking
engine_version
framework_version
evaluated_at
```

### `human_decisions`

```text
id
case_hypothesis_id
decision_type
decision_state
decision_text
legal_or_operational
responsible_user_id
decided_at
framework_version
engine_version
limitations
review_due_at
supersedes_decision_id
```

## Integridade e segurança

Aplicar:

- chaves estrangeiras em todas as relações;
- versionamento sem sobrescrever regra histórica;
- `created_at`, `updated_at`, autor e origem;
- exclusão lógica para regras e evidências;
- trilha de auditoria para mudança de estado;
- RLS por perfil e por vínculo com o caso;
- separação entre dados reais e fixtures;
- mascaramento de dados pessoais em logs;
- armazenamento de arquivos fora das tabelas, com referência segura;
- bloqueio de decisão jurídica por usuários sem permissão;
- bloqueio de publicação de país sem aprovação da proprietária.

## Casos-modelo

Usar namespace próprio:

```text
MODEL-CID-{PAIS}-{SEQ}
```

Casos reais permanecem:

```text
CA-CID-{PAIS}-{ANO}-{SEQ}
```

Nunca reaproveitar ID de modelo em cliente real. Corrigir duplicidades do legado durante migração, preservando tabela de correspondência entre ID antigo e novo.[cite:44]

## Motor de avaliação

### Entrada

Receber:

- objetivo do cliente;
- pessoas e parentescos;
- datas e locais;
- cidadanias alegadas ou comprovadas;
- naturalizações e perdas;
- casamentos, divórcios, adoções e reconhecimentos;
- movimentos migratórios;
- documentos existentes;
- divergências;
- países ou linhas declaradas na call.

### Normalização

1. Preservar texto original.
2. Criar valor normalizado em campo separado.
3. Relacionar local atual a local histórico.
4. Identificar mudanças de soberania.
5. Não converter etnia, idioma ou local de nascimento em cidadania.
6. Não mesclar pessoas apenas por nome semelhante.

### Geração de hipóteses

Criar hipótese quando houver:

- declaração do lead;
- ancestral com cidadania documentada;
- documento oficial com nacionalidade;
- nascimento ou residência em território relevante;
- evento de emigração/exílio;
- vínculo detectado em pesquisa;
- decisão humana anterior.

Registrar sempre a origem da hipótese.

### Seleção de rotas

Selecionar somente rotas:

- ativas;
- com fonte oficial;
- vigentes para a data relevante;
- compatíveis com o tipo de vínculo;
- não suspensas;
- com versão identificada.

Se nenhuma rota cumprir os requisitos, usar `PESQUISA_JURIDICA_PENDENTE`; não retornar "sem direito".

### Cadeia de transmissão

Para cada geração:

1. identificar o genitor transmissor;
2. confirmar a cidadania do genitor na data do nascimento;
3. verificar casamento, filiação, reconhecimento ou adoção;
4. verificar naturalização, perda ou renúncia anterior;
5. aplicar a regra vigente naquela data;
6. registrar evidência usada;
7. marcar resultado explicável;
8. encaminhar bloqueios para revisão.

### Resultados de regra

```text
COMPATIVEL_COM_EVIDENCIA_ATUAL
EVIDENCIA_INSUFICIENTE
BLOQUEIO_APARENTE
REGRA_NAO_APLICAVEL
CONFLITO_DE_FONTES
MARCO_TEMPORAL_INDEFINIDO
SUCESSAO_ESTATAL_EM_REVISAO
REVISAO_HUMANA_OBRIGATORIA
```

Nunca converter automaticamente esses códigos em parecer definitivo.

## Hipóteses do caso

Estados permitidos:

```text
DECLARADA
INDICIO_GENEALOGICO
ROTA_POSSIVEL
EVIDENCIA_INSUFICIENTE
BLOQUEIO_APARENTE
PRONTA_PARA_REVISAO
VALIDADA_HUMANAMENTE
DESCARTADA_COM_FUNDAMENTO
SUSPENSA_POR_MUDANCA_LEGAL
```

Cada mudança deve registrar:

- estado anterior e novo;
- usuário ou motor responsável;
- motivo;
- evidência;
- versão da regra;
- data;
- necessidade de revisão.

## Pontuações internas

É proibido calcular ou exibir percentual de chance de cidadania.

Calcular separadamente:

### Completude documental

Quantidade de requisitos documentais atendidos sobre os requisitos documentais aplicáveis.

### Continuidade da linha

Quantidade de elos de filiação comprovados sobre o total de elos da rota.

### Confiabilidade jurídica

Quantidade de regras aplicadas com fonte oficial, vigência e revisão válidas sobre o total de regras utilizadas.

Converter a visualização em faixas:

```text
INICIAL
EM_APURACAO
DOCUMENTACAO_AVANCADA
PRONTA_PARA_REVISAO
```

Não combinar os três índices em um score único de "elegibilidade".

## Sucessão territorial

Ativar `STATE_SUCCESSION_REVIEW` quando:

- o país atual do local for diferente do Estado da época;
- houver fronteira austro-húngara, alemã, italiana, russa, polonesa, tchecoslovaca, iugoslava, romena, soviética ou outra sucessão relevante;
- o documento usar topônimo histórico divergente;
- a autoridade registral atual não corresponder à autoridade histórica;
- cidadania e residência estiverem sendo confundidas.

O evento deve armazenar Estado histórico, jurisdição, local original e local atual. A hipótese fica bloqueada até análise humana.

## Regras regionais mínimas

### Áustria

Separar:

- descendência convencional;
- prova de cidadania ou `Heimatrecht`;
- reparação histórica pelo § 58c;
- perseguição, saída, perda e descendência.

Reaproveitar o checklist já desenvolvido para requerente, ascendente perseguido, vínculo familiar e prova de perseguição.[cite:21][cite:22][cite:27]

### Polônia

Separar:

- confirmação de posse;
- confirmação de perda;
- continuidade entre gerações;
- efeito de atos de perda e sucessão territorial.

A fonte oficial indica tramitação perante voivoda, diretamente ou por consulado, com documentação civil e probatória dos ascendentes.[cite:86][cite:92]

### Hungria

Separar:

- verificação de cidadania;
- naturalização simplificada;
- pesquisa de origem húngara;
- requisito linguístico, quando aplicável.

Ancestral cidadão ou provável origem húngara pode ser relevante à naturalização simplificada, mas não confirma cidadania automática.[cite:87]

### Croácia

Separar:

- filiação direta;
- emigrante e descendente;
- cônjuge associado;
- prova de parentesco;
- território histórico.

A rota de emigrante/descendente deve permanecer interna até reconciliação de oferta e jurídico.[cite:88][cite:100]

### Países Baixos

Modelar:

- cidadania por nascimento/filiação;
- reconhecimento de filiação;
- adoção;
- opção;
- naturalização;
- recuperação;
- perda automática.

Pergunta obrigatória: o pai ou a mãe era neerlandês na data do nascimento e qual legislação temporal se aplicava?

Não aceitar "avô neerlandês" como transmissão automática. Testar todas as gerações e possíveis perdas. As fontes oficiais distinguem nascimento/reconhecimento, opção e naturalização.[cite:46][cite:108][cite:109][cite:111]

A perda por residência prolongada fora do Reino e da União Europeia deve ser tratada como evento de bloqueio dependente de data e renovação documental.[cite:52][cite:55]

### Estônia

Modelar:

- cidadania por nascimento;
- cidadania do genitor na data do nascimento;
- restauração de perda na menoridade;
- naturalização;
- restrições de dupla cidadania.

Não equiparar origem étnica estoniana à cidadania transmissível.[cite:64][cite:78]

### Letônia

Separar:

- descendente de cidadão;
- cidadão em 17/06/1940;
- exilado e descendentes;
- letões e lívios;
- naturalização.

Para exílio, registrar fuga/deportação durante as ocupações e impossibilidade de retorno até 04/05/1990. Para continuidade, priorizar passaporte pré-guerra, registros civis, censo, arquivos fiscais e militares.[cite:51][cite:54]

A rota de letões/lívios deve ter requisitos próprios de ancestral residente, pertencimento e idioma; nunca fundi-la à continuidade de cidadania.[cite:60]

### Lituânia

Modelar:

- restauração;
- confirmação de cidadania;
- origem lituana;
- naturalização simplificada ou geral;
- saída/exílio e sucessão soviética;
- exceções de dupla cidadania.

O Migration Department é a autoridade para analisar restauração, aquisição, concessão, devolução, confirmação e perda.[cite:69][cite:77]

## Bloqueios obrigatórios

Interromper conclusão automática quando houver:

- fonte jurídica não oficial ou sem vigência;
- conflito entre leis ou interpretações;
- naturalização sem data comprovada;
- perda ou renúncia possível;
- sucessão estatal;
- prazo legal expirado ou incerto;
- cadeia de filiação incompleta;
- casamento, legitimação, adoção ou reconhecimento determinante;
- exigência linguística não verificada;
- perseguição, exílio, apatridia ou reparação histórica;
- divergência material de nomes, datas, filiação ou local;
- cidadania do genitor desconhecida na data de nascimento;
- tentativa de usar preço ou produto para inferir rota;
- país ainda em piloto ou pesquisa pendente.

## Próxima ação

O motor deve escolher apenas uma próxima ação prioritária por hipótese ou ciclo do caso.

Priorizar a ação que:

1. elimine uma rota impossível;
2. confirme cidadania ou naturalização do ascendente;
3. feche um elo de filiação;
4. esclareça uma data de corte;
5. resolva sucessão territorial;
6. tenha menor custo e maior efeito na incerteza;
7. possa ser executada sem promessa comercial antecipada.

Exemplos:

- solicitar certidão de naturalização;
- localizar passaporte histórico;
- confirmar casamento anterior ao nascimento;
- obter inteiro teor do elo com filiação incompleta;
- confirmar jurisdição histórica do município;
- encaminhar ficha ao revisor jurídico.

## Painel Desk

Construir o módulo dentro do registro do caso, sem criar nova área autônoma de catálogo.

### Cabeçalho

Exibir:

- ID canônico;
- cliente e núcleo familiar;
- objetivo;
- linha principal;
- hipóteses secundárias;
- fase;
- responsável;
- última revisão humana;
- alerta legal;
- próxima ação.

### Radar de países

Para cada país:

- região;
- origem da hipótese;
- linha ancestral;
- rota em análise;
- estado;
- completude documental;
- principal evidência;
- principal bloqueador;
- próxima ação;
- data da última revisão.

### Linha do tempo jurídica

Sobrepor:

- nascimentos, casamentos, reconhecimentos e óbitos;
- emigração e residência;
- naturalização, perda e renúncia;
- cidadania comprovada ou alegada;
- soberania territorial;
- vigência da regra;
- documento de cada evento.

Ao clicar em um marco, mostrar no Desk:

- lei/artigo;
- regra antes e depois;
- fonte oficial;
- data de acesso;
- versão;
- impacto na hipótese;
- responsável pela revisão.

### Matriz de transmissão

Colunas:

```text
Geração
Pessoa
Genitor transmissor
Nascimento
Cidadania do genitor na data
Evento de risco anterior
Regra aplicada
Evidência
Resultado
Revisão humana
```

### Grade documental

Exibir:

- documento;
- pessoa/evento;
- país e autoridade;
- tipo/formato;
- tradução;
- apostila/legalização;
- divergência;
- status;
- força probatória;
- regra que desbloqueia;
- responsável e prazo operacional.

### Comparador de rotas

Comparar:

- rota;
- base legal;
- geração;
- idioma;
- residência;
- prova histórica;
- perda/renúncia;
- dupla cidadania;
- autoridade;
- faltantes;
- bloqueios;
- estado da revisão.

Não usar rótulo "melhor cidadania". Usar "rota mais documentada" e "próxima investigação prioritária".

### Decisão humana

Criar ação explícita:

```text
Enviar para revisão
Aprovar conclusão preliminar
Solicitar mais evidências
Registrar bloqueio
Descartar hipótese com fundamento
Suspender por mudança legal
```

Toda decisão deve exigir justificativa e registrar versão da regra.

## App Cliente

Permitir somente:

- país/linha em investigação;
- etapa atual;
- documentos recebidos e pendentes;
- entrega liberada;
- explicação curta de um marco;
- próxima ação;
- aviso de revisão humana;
- relatório aprovado para download.

Proibir:

- SKU e ranking;
- preço provisório;
- link sem reconciliação;
- regra jurídica bruta;
- notas internas;
- score de elegibilidade;
- probabilidade;
- promessa de resultado;
- hipótese descartada sem linguagem acolhedora;
- país piloto como oferta publicada.

## Linguagem

| Proibido | Formulação permitida |
|---|---|
| Você tem direito | Há uma rota potencial sujeita a validação |
| Elegibilidade de 90% | A documentação está avançada, com pontos pendentes |
| Cidadania garantida | O resultado depende da autoridade competente |
| O país do ancestral confirma | O local sustenta hipótese; a cidadania exige prova própria |
| Processo simples | A rota apresenta menos lacunas neste momento |
| Prazo certo | A estimativa depende da autoridade, documentos e escopo |
| Caso impossível | A rota não se mostrou compatível com as evidências atuais |

## Integração comercial

Não integrar comercialmente antes de:

1. hipótese `VALIDADA_HUMANAMENTE`;
2. escopo aprovado;
3. produto-pai identificado no catálogo homologado;
4. componentes e microentregas definidos;
5. preço confirmado;
6. contrato aplicável confirmado;
7. link Asaas reconciliado.

Fluxo permitido:

```text
Motor jurídico
→ decisão humana
→ definição de escopo
→ consulta ao catálogo
→ proposta
→ contrato
→ pagamento
→ onboarding
```

Fluxo proibido:

```text
País detectado
→ preço automático
→ link de pagamento
```

## Migração do legado

### Inventariar

Ler e mapear integralmente:

- `INSTRUCOES`;
- `PARAMETROS`;
- `SKUS_REFERENCIA`;
- `CASOS`;
- `LANCAMENTOS`;
- `PAGAMENTOS`;
- `RESUMO_CASOS`;
- `SIMULADOR_CASO`;
- `PAINEL`;
- `AUTOMACOES`;
- `CONVENCAO_IDS`;
- `MARCOS_JURIDICOS_SYNC`.

### Classificar cada dado

```text
MIGRAR
MIGRAR_COM_CORRECAO
MANTER_COMO_HISTORICO
NAO_MIGRAR
PENDENTE_DE_VALIDACAO
CONFLITANTE
```

### Não migrar automaticamente

- IDs duplicados;
- erro de ano;
- fórmulas `#ERROR!`;
- casos-modelo misturados;
- valores conflitantes;
- links placeholder;
- SKUs de proposta como se fossem oficiais;
- "Europeia Geral" como rota;
- país sem marco validado;
- pagamento zerado sem contexto.

### Preservar rastreabilidade

Criar tabela de correspondência:

```text
legacy_source
legacy_sheet
legacy_row
legacy_id
new_entity
new_id
migration_status
migration_note
reviewed_by
reviewed_at
```

## Fases de implementação

### Fase 0 — Leitura

- confirmar branch e ambiente;
- ler documentos canônicos;
- verificar schema atual;
- inventariar rotas, tabelas e componentes existentes;
- não alterar produção.

**Saída:** diagnóstico factual e plano de migração.

### Fase 1 — Fundação

- criar `country_catalog` e `source_registry`;
- cadastrar regiões e estados de cobertura;
- criar controle de versões;
- aplicar permissões e auditoria.

**Saída:** catálogo regional interno sem preço.

### Fase 2 — Jurídico

- criar frameworks, marcos, rotas e requisitos;
- migrar oito países publicados como `EM_REVISAO`;
- cadastrar pilotos NL, EE, LV e LT;
- vincular fontes oficiais.

**Saída:** banco jurídico versionado.

### Fase 3 — Genealogia

- vincular pessoas, elos, eventos e evidências;
- adicionar geografia histórica;
- implementar naturalização, perda e renúncia;
- separar cidadania alegada de comprovada.

**Saída:** cadeia de transmissão auditável.

### Fase 4 — Avaliação

- implementar requisitos e resultados explicáveis;
- gerar bloqueios;
- gerar próxima ação;
- impedir percentual de elegibilidade;
- registrar snapshot e versão.

**Saída:** motor interno sem decisão definitiva.

### Fase 5 — Desk

- construir radar, linha do tempo, matriz, documentos e comparador;
- adicionar revisão humana;
- adicionar filtros e alertas;
- manter dentro do caso.

**Saída:** painel operacional interno.

### Fase 6 — App

- criar visão sanitizada;
- mostrar progresso, pendência e próxima ação;
- bloquear informações internas;
- respeitar política de visibilidade.

**Saída:** experiência do cliente sem promessa jurídica.

### Fase 7 — Comercial

- integrar catálogo homologado em modo somente leitura;
- liberar consulta após decisão humana;
- integrar proposta, contrato e cobrança;
- validar reconciliação Asaas.

**Saída:** passagem segura de diagnóstico para oferta.

### Fase 8 — Testes

- regressão jurídica;
- RLS e privacidade;
- visibilidade App/Desk;
- migração;
- casos multipaís;
- sucessão territorial;
- mudanças de versão.

**Saída:** relatório de testes e decisão de go-live.

## Casos mínimos de teste

1. Caso simples com cidadania parental comprovada.
2. Caso com avô, mas transmissão interrompida.
3. Caso multipaís com linha principal e complementar.
4. Caso austríaco de reparação § 58c.
5. Caso com naturalização sem data inicialmente conhecida.
6. Caso com linha materna e mudança legal histórica.
7. Caso com sucessão austro-húngara.
8. Caso neerlandês com possível perda por residência exterior.
9. Caso letão de cidadania pré-1940/exílio.
10. Caso lituano com restauração e dupla cidadania a validar.
11. Caso estoniano com origem étnica sem prova de cidadania.
12. País apenas detectado territorialmente, sem regra homologada.
13. Caso-modelo que não pode contaminar dados reais.
14. Mudança de marco que suspende conclusões anteriores.

## Critérios de aceite

### Dados

- nenhuma tabela jurídica contém preço ou SKU;
- nenhuma hipótese confirma cidadania sem decisão humana;
- toda regra tem versão, fonte e vigência;
- todo evento preserva valor original e normalizado;
- toda mudança possui auditoria;
- IDs de modelo e reais não colidem.

### Motor

- explica a regra aplicada;
- aponta evidências utilizadas e ausentes;
- identifica bloqueios;
- trata naturalização, perda, renúncia e sucessão;
- suporta várias hipóteses por caso;
- escolhe uma próxima ação;
- nunca retorna percentual de êxito.

### Desk

- contém radar, timeline, transmissão, documentos e comparador;
- permite revisão humana;
- mostra versão e fonte;
- não cria produto ou preço;
- registra decisão e fundamento.

### App

- mostra somente conteúdo autorizado;
- não expõe SKU, preço provisório ou raciocínio interno;
- não promete direito, prazo ou resultado;
- mostra pendência e próxima ação de forma compreensível.

### Comercial

- só é liberado depois da validação humana;
- consulta catálogo homologado;
- utiliza contrato correto;
- utiliza link Asaas reconciliado;
- não cria SKU automaticamente.

### Segurança

- RLS testada;
- arquivos protegidos;
- logs sem dados pessoais desnecessários;
- permissões de decisão validadas;
- produção permanece inalterada até aprovação.

## Evidências da entrega

A implementação deve entregar:

- inventário do legado;
- migrations SQL;
- dicionário de tabelas e campos;
- catálogo regional inicial;
- fontes jurídicas registradas;
- regras e fixtures dos casos-modelo;
- testes automatizados;
- capturas do Desk e App;
- relatório de RLS;
- relatório de regressão;
- lista de arquivos alterados;
- commit e PR;
- instruções de rollback;
- pendências jurídicas e comerciais.

## Formato da devolutiva

A devolutiva de cada fase deve informar:

1. o que foi lido;
2. o que já existia;
3. o que foi alterado;
4. arquivos e tabelas afetados;
5. testes executados;
6. resultado dos testes;
7. evidências;
8. bloqueios;
9. decisões pendentes;
10. próximo passo;
11. confirmação de que produção não foi alterada, quando aplicável.

Não declarar "concluído" quando houver placeholder, fixture não identificada, teste manual pendente, regra sem fonte ou migração parcial.

## Próximos passos

1. Proprietária aprovar estas instruções.
2. Confirmar o significado operacional de "Países Baixos": somente NL ou região NL + BE + LU.
3. Designar responsável pela homologação jurídica.
4. Extrair integralmente `MARCOS_JURIDICOS_SYNC`.
5. Auditar o schema atual do Supabase.
6. Produzir de-para do legado para o novo modelo.
7. Implementar Fases 1 e 2 em desenvolvimento.
8. Validar as oito nacionalidades existentes.
9. Executar o piloto NL + Bálticos.
10. Só então iniciar painel e integração comercial.

## Decisões pendentes

| Decisão | Recomendação |
|---|---|
| Alcance de Países Baixos | Tratar NL + BE + LU como região, com maturidades separadas |
| Bálticos | Piloto interno, sem publicação |
| Croácia e Romênia | Manter internas até reconciliação |
| Arquitetura | Banco versionado, não planilha monolítica |
| Resultado do motor | Hipótese explicável e revisão humana |
| Integração financeira | Somente após validação e escopo |
| Repositório | `docs/prompts/` enquanto instrução; arquitetura detalhada em `docs/arquitetura/` |

## Condição para aprovação

Este documento pode mudar de **em revisão** para **aprovado** quando a proprietária confirmar:

- regiões e países da primeira onda;
- política de visibilidade;
- autoridade de decisão jurídica;
- separação entre motor, catálogo e financeiro;
- estados e linguagem do motor;
- implementação no Supabase em ambiente de desenvolvimento;
- casos mínimos de teste;
- critérios de go-live.
