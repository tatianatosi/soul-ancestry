# Pessoa 360 — De-para do lead até cliente (Ana Luiza como caso real)

**Status:** aplicado em parte (schema), documentado em parte (de-para) — não é redesenho de tela
**Data:** 02/09/2026
**Decisão que autoriza:** "aplique pessoas canônicas com extensão de clientes comercial... verifique e aplique a política unificada... de-para das fichas e modelos enviados... visão super completa do lead até ser cliente como a Ana, tudo centrado na pessoa 360" (proprietária, 02/09/2026)

## 1. O que foi aplicado agora

**Migração `pessoa_canonica_extensao_clientes` aplicada ao Supabase real** (projeto `zsxpdbhdvbuulwpepemd`, migração `20260902144855`, arquivo `supabase/migrations/20260902144855_pessoa_canonica_extensao_clientes.sql`). `clientes` ganhou 21 colunas novas, todas nullable, aditivas — nenhum dos 7 clientes reais hoje cadastrados foi alterado ou perdeu dado:

| Bloco | Colunas novas |
|---|---|
| Identificação | `sexo`, `nacionalidade`, `profissao`, `cpf`, `rg_numero`, `rg_orgao_uf` |
| Endereço estruturado | `endereco_logradouro`, `endereco_numero`, `endereco_complemento`, `endereco_bairro`, `endereco_cidade`, `endereco_uf`, `endereco_cep`, `endereco_pais` |
| Estado civil / procuração | `estado_civil`, `nome_conjuge`, `procurador_cliente_id` (referencia outra linha de `clientes`), `procurador_escopo` |
| RG / nascimento | `data_nascimento`, `nome_pai`, `nome_mae`, `cidade_nascimento` |

`clientes` é agora a Pessoa Canônica — decisão explícita da proprietária, substituindo a alternativa que o estudo anterior (`PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`) deixava em aberto (tabela nova `pessoas_canonicas` vs. estender `clientes`). `nucleo_membros`, `contract_parties`, `genealogical_person_profiles` continuam existindo com seus papéis próprios (vínculo ao núcleo, parte do contrato, ancestral pesquisado) — não foram fundidos nem alterados.

**Não incluído nesta migração, propositalmente:** nenhuma coluna de UI foi conectada ainda — os campos existem no banco, mas nenhuma tela de `/clientes` os lê ou grava. Isso é o próximo passo natural, não decidido aqui sem confirmação.

## 2. Política unificada — verificação (não Fase 3 ainda)

Re-executadas as consultas de reconciliação já feitas em 30/08 (`docs/politicas/FASE-1-MATRIZ-RECONCILIACAO-CASOS-2026-08-30.md`), direto no Supabase real, para confirmar que nada mudou:

| Consulta | 30/08 | 02/09 (agora) |
|---|---|---|
| `case_code` duplicado | 0 | 0 |
| Cliente duplicado por telefone | 0 | 0 |
| Cliente duplicado por e-mail | 0 | 0 |
| `genealogical_person_profiles` | 0 linhas | 2 linhas |
| `institutional_profiles` | 0 linhas | 1 linha |
| `case_aliases` (Ana Luiza) | 3 aliases | 3 aliases |

**Confirmado, sem mudança**: o caso da Ana Luiza já está reconciliado (um único `crm_casos`, 3 aliases históricos preservados em `case_aliases`), sua família já está vinculada na prática (`nucleo_membros.cliente_id` → `clientes.id` para Ana/Adair/Alice; `contract_parties` completo com CPF/CNPJ). A Fase 2 do documento de origem ("corrigir Ana Luiza") já estava feita antes desta sessão — nada a aplicar aqui.

**Não aplicado: Fase 3 (motor `case_participants`).** O próprio documento de 30/08 registrou dois pré-requisitos que ainda não foram respondidos pela proprietária: (1) confirmar se "CNPJ da contratante" bloqueado se referia à Clube Ancestral como contratada (perfil institucional) ou a um cliente específico; (2) decidir se `PERFIL_INSTITUCIONAL` (hoje hardcoded em `contrato-base-consolidado.ts`) deve migrar para a tabela `institutional_profiles` (já existe no schema, agora com 1 linha, ainda não confirmado se conectada). Além disso, o caso real da Ana funciona hoje sem `case_participants` — `nucleo_membros` + `contract_parties` já cobrem papel e vínculo na prática, o mesmo padrão já usado nesta sessão para não criar tabela nova quando a existente já resolve (ver `CA-LOVABLE-RESGATE-DESK-7-SECOES-CRM-VIVO-E-SUBITENS-v1.1`). Criar `case_participants` agora seria repetir esse erro sem necessidade comprovada — fica registrado como pendência, não implementado.

## 3. De-para — das fichas enviadas para a Pessoa Canônica extendida

### 3.1 Procuração real (Danilo Kluyber / Tatiana Tosi, 31/08) → `clientes`

| Campo da procuração | Coluna em `clientes` |
|---|---|
| "brasileiro"/"brasileira" | `nacionalidade` |
| RG nº 29.016.052-SP | `rg_numero` = "29.016.052", `rg_orgao_uf` = "SP" |
| CPF/MF 221.814.338-01 | `cpf` |
| "solteiro"/"divorciada" | `estado_civil` |
| Rua Treze de Maio, nº 1572 Apt. 24, Bela Vista, São Paulo - São Paulo, CEP 01525-001 | `endereco_logradouro`="Rua Treze de Maio", `endereco_numero`="1572", `endereco_complemento`="Apt. 24", `endereco_bairro`="Bela Vista", `endereco_cidade`="São Paulo", `endereco_uf`="SP", `endereco_cep`="01525-001" |
| "pesquisadora e consultora em CIDADANIA" | `profissao` |
| outorgante → outorgada | `procurador_cliente_id` na linha do outorgante, apontando para a linha da procuradora; `procurador_escopo` com a finalidade do instrumento |

Todos os 6 achados que motivaram a revisão de 31/08 do modelo de campos têm coluna real agora — nenhum ficou de fora.

### 3.2 Ficha piloto Giovanna da Veiga Prade → onde entra, e onde NÃO entra

A ficha de 54 campos (`PESSOA-CANONICA-FICHA-PILOTO-GIOVANNA-PRADE-2026-09-02.md`) **não é sobre identidade** — é o contrato de dados narrativo das 5 telas do App Cliente (Home/Origem/Jornada/Descobertas/Conta) para um caso: heatmap de país, genograma, trilhas de contexto, linha do tempo dupla, histórico. Isso não vira coluna de `clientes`. Fica de fora desta extensão de propósito — é a camada "Pessoa 360 view" (achado 2 do documento anterior), que continua sem tabela própria hoje (a infraestrutura mais próxima é `portal_projecoes`, e o texto narrativo curado da ficha não tem hoje derivação automática — precisa ser redigido).

O único campo de identidade que a ficha carrega é o nome ("Giovanna da Veiga Prade") — esse sim mapeia para `clientes.nome`, já existente.

### 3.3 Ana Luiza (caso real, dado confirmado por consulta ao banco) → estado atual da Pessoa Canônica

| Pessoa | `clientes` hoje | Pendente para virar Pessoa Canônica completa |
|---|---|---|
| Ana Luiza (contratante, titular) | `nome`, tem `nucleo_membros.cliente_id`, tem `contract_parties` com CPF | CPF já existe em `contract_parties`, ainda não copiado para `clientes.cpf`; sexo/RG/endereço/estado civil/nascimento — nenhum preenchido ainda |
| Adair (pai) | idem Ana | idem |
| Alice (irmã) | idem Ana | idem |
| Felipe (dependente menor) | **sem `cliente_id` em `nucleo_membros`** — esperado, é menor sem cadastro próprio de cliente | Continua representado só via `nucleo_membros`, não via `clientes` — correto para menor sem capacidade civil própria |

Isso mostra exatamente o "de para" pedido: os dados de CPF/qualificação da família da Ana **já existem** no sistema — só não estão na Pessoa Canônica (`clientes`) ainda, estão em `contract_parties` (por contrato, não por pessoa). Copiar isso é ação futura de UI/migração de dados, não decidida nem executada aqui — a coluna existe, o dado não foi movido.

## 4. Visão "lead até cliente", centrada em Pessoa 360 — o que já existe, ponta a ponta

```text
leads (real, tabela própria)
  → nome, telefone, email, origem, eixo_comercial...
  → sem vínculo formal a clientes ainda (conversão hoje é operacional, não uma FK)

clientes (Pessoa Canônica, estendida agora)
  → identidade completa (novo), endereço (novo), estado civil/procuração (novo)
  → nucleo_membros.cliente_id → papel na família (contratante_signatario/dependente)
  → contract_parties → papel no contrato (contracting_client/co_contractor/dependent/provider), com CPF/documento já capturado por instrumento

crm_casos (Caso 360)
  → case_aliases → histórico de códigos, já funcionando (Ana: 3 aliases)
  → sem case_participants ainda (pendente, ver seção 2)

App Cliente / Pessoa 360 view
  → portal_projecoes (existe) para Jornada/Árvore/Radar
  → narrativa curada tipo ficha-Giovanna (Home/Origem/Descobertas/Conta) — sem fonte automática ainda
```

**O que falta para a "visão super completa" pedida, na ordem em que os dados já mostram ser necessário** (não implementado aqui, registrado como próximo passo):

1. UI em `/clientes` para ler/gravar os 21 campos novos — sem isso, a Pessoa Canônica existe só no banco.
2. Decisão sobre `leads → clientes`: hoje a conversão de lead para cliente não tem vínculo formal (nenhuma FK); Pessoa 360 "do lead até cliente" pede que isso exista.
3. As duas perguntas em aberto de institutional_profiles/CNPJ-contratante antes de decidir `case_participants`.
4. Decisão sobre onde a narrativa tipo Giovanna (heatmap, genograma, trilhas) é escrita e por quem — hoje só existe como planilha manual, sem tabela.

## 5. O que este documento NÃO decide

- Não decide o formulário de UI para os 21 campos novos.
- Não decide o vínculo formal `leads → clientes`.
- Não cria `case_participants`.
- Não move dado de `contract_parties`/`nucleo_membros` para `clientes` automaticamente — nenhuma migração de dado, só de schema.
