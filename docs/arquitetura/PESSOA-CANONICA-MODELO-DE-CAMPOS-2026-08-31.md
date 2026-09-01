# Pessoa Canônica — Modelo de Campos

**Status:** especificação — nenhum código alterado
**Data:** 2026-08-31
**Responsável pela decisão:** Proprietária do Clube Ancestral
**Autorização:** continuação da especificação do motor contratual/política unificada, autorizada em conversa (31/08/2026)
**Escopo:** propor o conjunto de campos de um cadastro único de pessoa, a partir do pedido explícito da proprietária, confrontado com os 4 cadastros reais hoje existentes e com um documento legal real (procuração). Não cria tabela, não migra dado, não altera código.

## 1. Causa

A proprietária pediu, para a política unificada: um modelo de pessoa com dados internacionais de base — nome completo, CPF, RG, telefone, e-mail, endereço completo, estado civil, nome do cônjuge e dependentes quando aplicável, dados vindos do RG (data de nascimento, nome completo dos pais), cidade de nascimento quando diferente da residência, estado (dropdown, UF brasileira) e CEP, e país quando a pessoa mora fora do Brasil.

### 1.1 Revisão a partir de documento real (procuração, 31/08/2026)

A proprietária enviou o texto de uma procuração real (outorgante Danilo Kluyber de Souza, outorgada/procuradora Tatiana Melani Tosi, 05/08/2025) e pediu para revisar o parágrafo do outorgante e completar o modelo com os itens que ele revela e que a versão anterior deste documento não cobria. Trecho relevante do outorgante:

> "Danilo Kluyber de Souza, portador(a) da cédula de identidade RG nº 29.016.052-SP inscrito no CPF/MF sob nº 221.814.338-01, **brasileiro**, solteiro, residente e domiciliada à Rua Treze de Maio, nº 1572 Apt. 24 Bela Vista São Paulo - São Paulo, CEP: 01525-001, telefone (11) 93290-6259"

E do parágrafo da procuradora (mesma procuração): *"brasileira, divorciada, **pesquisadora e consultora em CIDADANIA**, (...) endereço eletrônico: tati@pluggedresearch.com"*.

Comparando campo a campo com o modelo anterior (seção 3), este texto real confirma dois pontos e revela três campos que faltavam:

- **Confirma**: endereço precisa mesmo ser estruturado (aqui aparece como logradouro + número + complemento + bairro + cidade + estado + CEP, tudo em um parágrafo corrido — exatamente o problema que a estruturação da seção 3.3 resolve) e RG/CPF precisam ser campos próprios, não texto genérico.
- **Revela — nacionalidade**: "brasileiro"/"brasileira" é campo próprio em qualquer instrumento legal brasileiro; não existia no modelo anterior.
- **Revela — sexo/gênero**: necessário mesmo fora do contexto genealógico, porque a concordância do documento legal depende dele ("portador(a)", "brasileiro/brasileira", "solteiro/divorciada") — já existe em `genealogical_person_profiles.sexo`, mas não estava na Pessoa Canônica.
- **Revela — profissão**: aparece na qualificação da procuradora ("pesquisadora e consultora em CIDADANIA") — comum em instrumentos legais, ausente do modelo anterior.
- **Revela — RG precisa de dois subcampos, não um**: o outorgante tem "RG nº 29.016.052-SP" (número + UF) e a procuradora tem "RG. 30.784.874-7 SSP/SP" (número + órgão expedidor + UF) — formatos diferentes que só cabem bem em número + órgão/UF separados.
- **Revela — papel de procurador(a)**: a própria natureza do documento (uma pessoa outorga poderes a outra) confirma que o modelo precisa suportar "procurador(a)" como tipo de relação entre duas Pessoas Canônicas, do mesmo jeito que já previa cônjuge e dependente.

A proprietária também indicou uma planilha master no Drive compartilhado (pasta do Danilo Kluyber, aba "dados requerentes") como referência adicional de de-para. **Não tenho acesso a essa planilha nesta sessão** (conector de Drive desconectado no momento) — esta revisão usa só o texto da procuração colado na conversa. Se a proprietária colar o conteúdo da aba "dados requerentes", reviso de novo contra essa fonte.

## 2. Confronto com os 4 cadastros reais (evidência de schema)

| Tabela | Finalidade real | Campos existentes |
|---|---|---|
| `clientes` | Registro comercial do titular do caso | `nome`, `email`, `telefone`, `documento` (texto livre, sem distinguir CPF/RG), `pais_interesse`, `status`, `observacoes` |
| `nucleo_membros` | Vínculo de uma pessoa a um núcleo familiar e papel no caso | `nome`, `papel` (`contratante_signatario`/`dependente`), `vinculo`, `processo`, `ordem` |
| `genealogical_person_profiles` | Perfil de **ancestral pesquisado** (pesquisa genealógica, não necessariamente pessoa viva) | `nome_completo`, `nome_nascimento`, `sexo`, `nascimento_data`/`_aproximada`/`_localidade`, `morte_data`/`_localidade`, `causa_morte`, `status_verificacao` |
| `contract_parties` | Parte assinante de um contrato específico | `person_name`, `preferred_name`, `document_type`+`document_number` (genérico), `email`, `phone`, `address` (texto único, não estruturado), `relationship_to_case`, `legal_capacity_status` |

Nenhuma das quatro tem: CPF e RG como campos distintos, endereço estruturado (logradouro/número/complemento/bairro/cidade/UF/CEP/país), estado civil, nome do cônjuge, dependentes como atributo da pessoa (só como linha separada em `nucleo_membros`), data de nascimento de pessoa viva vinculada a documento (a data que existe em `genealogical_person_profiles` é para ancestral pesquisado, propósito diferente), filiação (nome completo dos pais) fora do contexto genealógico, ou cidade de nascimento comparada à cidade de residência.

## 3. Modelo proposto — Pessoa Canônica

Organizado nos mesmos blocos que a proprietária descreveu.

### 3.1 Identificação

| Campo | Tipo | Observação |
|---|---|---|
| Nome completo | texto | Como no documento civil |
| Sexo/gênero | dropdown (feminino/masculino/não informado) | **Novo (revisão da procuração).** Já existe em `genealogical_person_profiles.sexo`, ausente da Pessoa Canônica; necessário para concordância em documentos legais gerados ("portador(a)", "brasileiro/brasileira") |
| Nacionalidade | texto/dropdown, padrão "brasileiro(a)" | **Novo (revisão da procuração).** Campo padrão em qualquer instrumento legal brasileiro; ausente do modelo anterior e das 4 tabelas |
| Profissão | texto, opcional | **Novo (revisão da procuração).** Aparece na qualificação de partes em instrumentos legais (ex.: "pesquisadora e consultora em CIDADANIA"); ausente do modelo anterior |
| CPF | texto, máscara `000.000.000-00` | Campo próprio — hoje misturado em `documento`/`document_number` |
| RG — número | texto | Campo próprio — hoje inexistente separadamente |
| RG — órgão expedidor / UF | texto (ex.: "SSP/SP") | **Revisado.** A procuração mostra dois formatos reais ("29.016.052-SP" e "30.784.874-7 SSP/SP") — número e órgão/UF precisam ser subcampos distintos, não um único campo livre |

### 3.2 Contato

| Campo | Tipo | Observação |
|---|---|---|
| Telefone | texto, com DDI/DDD | Já existe em 3 das 4 tabelas, sem padrão de máscara comum |
| E-mail | texto | Já existe em 3 das 4 tabelas |

### 3.3 Endereço completo (estruturado, não texto único)

| Campo | Tipo | Observação |
|---|---|---|
| Logradouro | texto | Hoje só existe como texto único em `contract_parties.address` |
| Número / complemento | texto | Inexistente hoje |
| Bairro | texto | Inexistente hoje |
| Cidade | texto | Inexistente estruturado hoje |
| Estado (UF) | dropdown — 26 estados + DF | Inexistente hoje; dropdown evita erro de digitação e permite filtro |
| CEP | texto, máscara `00000-000` | Inexistente hoje |
| País | dropdown, com Brasil como padrão | Só quando a pessoa reside fora — pedido explícito da proprietária |

### 3.4 Estado civil e família

| Campo | Tipo | Observação |
|---|---|---|
| Estado civil | dropdown (solteiro/casado/divorciado/viúvo/união estável) | Inexistente hoje em qualquer tabela |
| Nome do cônjuge | texto, condicional a estado civil = casado/união estável | Inexistente hoje |
| Dependentes | lista de referências a outras Pessoas Canônicas, quando aplicável | Hoje só existe como linha separada em `nucleo_membros` com papel `dependente`, sem vínculo formal "dependente de quem" |
| Procurador(a) | referência a outra Pessoa Canônica + tipo/escopo dos poderes | **Novo (revisão da procuração).** A procuração real (outorgante → outorgada) confirma que o modelo precisa suportar uma pessoa representando outra por instrumento de procuração, não só cônjuge/dependente — mesma lógica de `legal_capacity_status`/`represented_by_party_id` já existente em `contract_parties`, mas hoje só no nível do contrato, não da pessoa |

### 3.5 Dados do RG / nascimento

| Campo | Tipo | Observação |
|---|---|---|
| Data de nascimento | data | Existe em `genealogical_person_profiles`, mas para ancestral pesquisado — precisa existir também para pessoa viva/contratante |
| Nome completo do pai | texto | Inexistente hoje fora do contexto de pesquisa genealógica (onde aparece como relação, não como campo do próprio registro) |
| Nome completo da mãe | texto | Idem |
| Cidade de nascimento | texto | Só relevante informar quando diferente da cidade de residência — regra de exibição condicional, pedido explícito da proprietária |

## 4. Relação com os 4 cadastros existentes

Este modelo **não substitui** a finalidade específica de cada tabela — substitui a ausência de uma fonte comum entre elas. Proposta de relação (especificação, não implementação):

```text
pessoas_canonicas (nova, hipotética)
  ← referenciada por clientes.pessoa_id
  ← referenciada por nucleo_membros.pessoa_id
  ← referenciada por contract_parties.pessoa_id
  ← referenciada por genealogical_person_profiles.pessoa_id (quando o ancestral pesquisado também é uma pessoa viva do caso, ex.: o próprio requerente)
```

Isso é exatamente o `person_id` compartilhado que falta hoje — já registrado como achado no Mapa de Autoridade Admin. Este documento fecha a lacuna de "que campos exatamente esse cadastro central deveria ter", que antes só existia como pergunta em aberto.

## 5. O que este documento NÃO decide

- Não decide se `pessoas_canonicas` é uma tabela nova ou se um dos 4 cadastros existentes (mais provável: `clientes`, por já ser o mais próximo do papel de "pessoa viva") é expandido para assumir esse papel.
- Não decide a estratégia de migração dos dados já existentes nas 4 tabelas (achados no Mapa: dados reais da Ana já estão consistentes entre `clientes`/`nucleo_membros`/`contract_parties` na prática, mesmo sem `person_id` comum — a migração precisa preservar isso, não recriar).
- Não decide se "Dependentes" vira lista de referência a outras Pessoas Canônicas ou continua um atributo textual simples.
- Não decide se o dropdown de país deve usar uma lista fixa curta (visto que o produto é sobre cidadania — provavelmente concentrado em poucos países de destino) ou uma lista internacional completa.

## 6. Próximo passo

Junto com as 3 decisões abertas no `MOTOR-CONTRATUAL-INVENTARIO-E-DE-PARA-2026-08-31.md`, este modelo de campos fica pronto para aprovação da proprietária antes de qualquer schema novo ou migration.
