# Pessoa 360 — Conjunto Unificado de Dados (todos os aspectos da vida da pessoa)

```yaml
status: em revisão — mapeamento completo, nenhuma execução
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: decisão de arquitetura
responsável pela decisão: Proprietária Administradora do Clube Ancestral
base normativa: docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md;
  docs/arquitetura/PESSOA-CANONICA-FICHA-PILOTO-GIOVANNA-PRADE-2026-09-02.md (PR #46);
  docs/G02_PESSOAS_E_LINHAGENS_v1.0.md; docs/prompts/PACOTE-REDESENHO-UNIFICADO-DESK-APP-PESSOAS-FAMILIAS-2026-08-31.md
repositório: tatianatosi/soul-ancestry
fonte: leitura direta de código (src/types/case.ts, src/lib/genealogia-modulos.ts, src/data/caseDataGiovanna.ts,
  src/data/caseDataSophia.ts) e schema real do Supabase (projeto zsxpdbhdvbuulwpepemd), em 2026-09-03
```

## Causa

"Leia a documentação em diversos prompts, todos esses dados coletados, principalmente os dados da
ficha piloto, são dados necessários que serão migrados e apresentados no App Cliente. O ideal é
verificar todos os dados dessas tabelas, unificar, e ter um conjunto que permeia por todos os
aspectos da vida da pessoa." (2026-09-03)

Este documento junta, pela primeira vez num único lugar, as 5 camadas de dado de pessoa que hoje
existem espalhadas em prompts e código diferentes, para responder com evidência: o que já existe,
o que é real vs. demo, e o que "unificar" deveria significar na prática.

## As 5 camadas encontradas

### Camada 1 — Pessoa Canônica (identidade civil)

**Tabela real:** `clientes`, já estendida em produção (confirmado por schema): nome, sexo,
nacionalidade, profissão, CPF, RG (número + órgão/UF), endereço estruturado (logradouro/número/
complemento/bairro/cidade/UF/CEP/país), estado civil, nome do cônjuge, procurador (`procurador_cliente_id`
+ `procurador_escopo`), data e cidade de nascimento, nome do pai e da mãe.

**Origem:** `PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`, revisado contra uma procuração real
(Danilo Kluyber). **Status:** implementado — o que o documento propôs em 31/08 já está no schema.

### Camada 2 — Vínculo a caso/núcleo

**Tabelas reais:** `nucleo_membros` (papel no núcleo, vínculo, `cliente_id`), `contract_parties`
(parte assinante de um contrato específico). Ligam a Pessoa Canônica a um caso/contrato concreto.

### Camada 3 — Pesquisa genealógica interna (G-02)

**Tabelas reais, implementadas e testadas** (`docs/G02_PESSOAS_E_LINHAGENS_v1.0.md`, 12 testes
passando): `genealogical_person_profiles` (perfil 360° do pesquisado — nascimento/morte exatos ou
aproximados, sepultamento, causa da morte, status de verificação), `name_variants` (variantes de
nome, tipadas), `genealogical_relationships` (relações estruturadas, sem campo rígido tipo "Filho 1"),
`genealogical_events` (nascimento, batismo, casamento, morte, sepultamento, residência, migração,
serviço militar, patrimônio), `lineage_paths` (linhagens do caso, suporta linha dupla).

**Por design, esta camada é só interna.** Citação direta do próprio documento: *"O App Cliente não
lê perfis, relações, eventos, variantes ou notas internas: a projeção permanece bloqueada até
devolutiva aprovada."* Isso é regra deliberada, não lacuna.

### Camada 4 — Módulos históricos (G-02c) — literalmente "todos os aspectos da vida"

**13 tabelas reais**, cada uma com schema próprio (`case_id`, `person_id`, `family_id`, `evidence_id`,
`source_id`, `institution_id`, `status_verificacao`, `client_visibility`), catalogadas em
`src/lib/genealogia-modulos.ts`:

| Tabela | Aspecto da vida coberto |
|---|---|
| `residences_migrations` | Residências e migrações |
| `occupations_assets` | Trabalho e patrimônio |
| `military_records` | Vida militar |
| `notarial_records` | Atos notariais (escritura, procuração, inventário, testamento) |
| `cadastral_records` | Cadastro civil e fiscal (censo, registro eleitoral) |
| `education_records` | Educação e formação |
| `cultural_records` | Cultura e língua |
| `religious_records` | Vida religiosa (batismo, crisma, casamento religioso) |
| `correspondence_records` | Correspondência e memória escrita |
| `social_political_records` | Vida social e política |
| `audiovisual_records` | Acervo audiovisual |
| `preserved_objects` | Objetos preservados |
| `historical_context_events` | Contexto histórico (sucessão territorial, soberania) |

**Confirmado no schema real: as 13 tabelas existem, com estrutura completa — e as 13 têm 0 linhas.**
Esta é a camada mais completa em desenho e mais vazia em dado real de todo o levantamento. Não é um
problema de schema — é ausência de pesquisa/preenchimento real ainda.

### Camada 5 — Contrato de exibição ao cliente (o que a ficha piloto realmente é)

**Tipo `CaseData`** (`src/types/case.ts`, 392 linhas, 13 blocos): `geral`, `cliente`, `familia_direta`
(pai/mãe/avós/bisavós, cada um com `status_evidencia`, `variantes_nome`, IDs FamilySearch), `arvore`
(heatmap de país, pessoas conectadas, gerações lidas, conexão-chave), `rota` (aderência % por país,
hipótese), `jornada` (trilhas narrativas, linha do tempo dupla ancestral×cliente), `descobertas`,
`documentos`, `fontes`, `alerta`, `conta` (histórico, upgrade), `governanca`, mais os blocos
opcionais `procuracoes`, `contrato`, `contratacao` (kit contratual completo: OS, despesas, autorizações).

**Este é o formato real da ficha piloto da Giovanna** (54 campos da planilha = os campos deste tipo).
**Confirmado agora: existe uma segunda ficha no mesmo formato — `caseDataSophia.ts`** (caso Sophia
Piccoli Santiago, linha Piccoli/Veneto), nunca cruzada contra o estudo de Pessoa Canônica até hoje.

**Status: 100% demo.** `src/lib/classificacao-dados.ts` classifica os dois arquivos (`caseDataGiovanna.ts`,
`caseDataSophia.ts`) como `mockup_interno`, "nunca promovido a real". **Não existe hoje nenhuma tabela
real no Supabase com colunas para heatmap, genograma-resumo, trilhas narrativas, linha do tempo dupla
ou histórico de conta** — confirmado pela ausência dessas colunas nas 4 tabelas de pessoa já
inventariadas (`clientes`, `nucleo_membros`, `genealogical_person_profiles`, `contract_parties`).

## De-para: os 13 blocos de `CaseData` × onde o dado real viria

| Bloco `CaseData` | Fonte real equivalente hoje | Gap |
|---|---|---|
| `geral`, `cliente` | Camada 1 (`clientes`) + Camada 2 (`nucleo_membros`) | Nenhum — já existe |
| `familia_direta` (pai/mãe/avós, `status_evidencia`, `variantes_nome`) | Camada 3 (`genealogical_relationships` + `name_variants` + `genealogical_person_profiles`) | Existe em forma normalizada (linhas), não em forma fixa (pai/mãe/avô nomeados) — precisa de **projeção**, não de tabela nova |
| `arvore` (heatmap, pessoas conectadas, gerações, conexão-chave) | Derivável de Camada 3 (`lineage_paths` + `genealogical_relationships`) via `montarArvore` | Contagens são deriváveis; o **texto narrativo** ("conexão-chave", "lacuna crítica") não é — hoje é redigido à mão |
| `rota` (aderência % por país, hipótese) | Camada de motor jurídico (`citizenship_tracks`, ver PR #59-63) | Existe fonte de rota/via real; o **percentual de aderência** não tem equivalente em nenhuma tabela — é editorial, não calculado |
| `jornada` (trilhas, linha do tempo dupla) | Camada 3 (`genealogical_events`) para a metade "ancestral"; nada para a metade "cliente" | Timeline ancestral é derivável; timeline do cliente (jornada comercial/operacional) não tem fonte cruzada com a genealógica ainda |
| `descobertas` | G-06 (achados/Encontros de Linhagem, citado na PR #55) | Motor existe segundo o resgate de relatórios; publicação como bloco de `CaseData` não está conectada |
| `documentos`, `fontes` | `research_evidence_items`, `research_sources`, `case_source_documents` | Existe fonte real; falta o adaptador que resume para o formato de exibição |
| `alerta` | Nenhuma tabela de alerta de engajamento ao cliente | Gap real — não existe hoje |
| `conta` (histórico, upgrade) | `case_timeline_events` parcialmente | Existe estrutura de timeline de caso; o texto de "histórico"/"upgrade" cliente-facing não é derivado dela ainda |
| `contratacao` (OS, despesas, autorizações) | `service_orders`, `expense_estimates`, `contract_annexes` | Fonte real já existe e é a mais madura de todo o de-para — só falta o adaptador de leitura |

## O que "unificar" deveria significar (recomendação, não decisão)

**Não é uma tabela nova gigante.** O padrão que o próprio repositório já usa em outros lugares —
`app_projections`, `client_deliverables`, `portal_projecoes` — é exatamente isto: uma **camada de
projeção/leitura** que combina as Camadas 1–4 (dado real, disperso, correto) num formato pronto para
exibição (o formato que `CaseData` já descreve), sanitizado e só populada após aprovação humana —
a mesma regra que já vale para o resto do App Cliente (nunca ler direto da pesquisa bruta).

Isso significa que **grande parte do "conjunto que permeia todos os aspectos da vida da pessoa"
já existe** — está nas Camadas 1–4, real e com schema maduro. O que falta não é dado novo por
tabela: é (a) preencher as 13 tabelas da Camada 4, hoje vazias, com pesquisa real caso a caso, e
(b) construir o adaptador que lê as Camadas 1–4 e produz o formato de `CaseData` (Camada 5) —
hoje esse formato só existe escrito à mão, em 2 casos demo.

## Fora do escopo desta entrega

Nenhuma tabela foi criada, nenhum dado foi migrado, nenhum adaptador foi escrito. Este documento é
só o mapeamento pedido — junta o que estava disperso em `PESSOA-CANONICA-MODELO-DE-CAMPOS`,
`G02_PESSOAS_E_LINHAGENS`, `genealogia-modulos.ts`, os dois `caseData*.ts` e o pacote de redesenho,
num único lugar, com evidência de schema real.

## Próximos passos

1. Confirmar com a proprietária se a ficha da Sophia deve ser arquivada/documentada com o mesmo
   tratamento que a da Giovanna recebeu (PR #46) — mesmo método, já validado.
2. Priorizar quais dos 13 módulos históricos (Camada 4) recebem pesquisa real primeiro — hoje
   nenhum tem uma linha sequer.
3. Desenhar o adaptador Camadas 1–4 → formato `CaseData` (Camada 5) como projeção/view, seguindo
   o padrão já existente de `app_projections`/`client_deliverables` — não como tabela nova.
4. Decidir os 3 gaps reais sem fonte alguma hoje: percentual de aderência por país (`rota`), texto
   de alerta de engajamento (`alerta`) e timeline do lado "cliente" em `jornada`.
