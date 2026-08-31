# Pessoa Canônica — Modelo de Campos

**Status:** especificação — nenhum código alterado
**Data:** 2026-08-31
**Responsável pela decisão:** Proprietária do Clube Ancestral
**Autorização:** continuação da especificação do motor contratual/política unificada, autorizada em conversa (31/08/2026)
**Escopo:** propor o conjunto de campos de um cadastro único de pessoa, a partir do pedido explícito da proprietária, confrontado com os 4 cadastros reais hoje existentes. Não cria tabela, não migra dado, não altera código.

## 1. Causa

A proprietária pediu, para a política unificada: um modelo de pessoa com dados internacionais de base — nome completo, CPF, RG, telefone, e-mail, endereço completo, estado civil, nome do cônjuge e dependentes quando aplicável, dados vindos do RG (data de nascimento, nome completo dos pais), cidade de nascimento quando diferente da residência, estado (dropdown, UF brasileira) e CEP, e país quando a pessoa mora fora do Brasil.

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
| CPF | texto, máscara `000.000.000-00` | Campo próprio — hoje misturado em `documento`/`document_number` |
| RG (número + órgão emissor) | texto | Campo próprio — hoje inexistente separadamente |

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
