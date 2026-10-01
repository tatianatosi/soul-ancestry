# Ficha master de 54 campos — de-para, unificação e máscaras

```yaml
data: 2026-10-01
ficha_master: clube_ancestral_ficha_caso_real_piloto.xlsx (enviada pela Proprietária em 01/10)
substitui_como_fonte: docs/arquitetura/2026-09-27_TABELA-54-CAMPOS-GIOVANNA-x-FICHA-PESQUISA-DESK.md
  (mantido como coluna de comparação — não reescrito)
regra_de_dono: "Pessoa, Núcleo, Pesquisa, Planejador e Contrato são os donos únicos dos campos"
  (roteiro de 01/10). O Caso é o eixo em que os campos penduram, não um sexto dono.
verificacao: cada `tabela.coluna` citada foi conferida por script contra
  src/integrations/supabase/types.ts — 0 colunas não encontradas.
prova: estática (código + banco, somente leitura). Não comprovado em uso.
```

## O que a ficha nova é, e o que ela não é

Não são duas fichas de 54 campos. É **a mesma série**, agora autoritativa: os 54 campos
batem 1:1, em ordem, com a tabela de 27/09. O que a versão de 01/10 acrescenta — e é por
isso que ela é a master — são quatro colunas que antes não existiam:

| Coluna nova | Para que serve |
|---|---|
| `input_ou_output` | separa o que a equipe digita (11 campos) do que o sistema deriva (43) |
| `limite_caracteres` | o limite que a validação tem de aplicar, campo a campo |
| `max_links` / `max_anexos` | quantos links e anexos cada campo aceita |
| `formato_esperado` | a máscara, em linguagem de negócio |

A Ficha Piloto Giovanna continua sendo **especificação de cobertura**, não uma terceira
ficha (decisão 1 de 01/10, reafirmada no roteiro).

## Achado que decide o Corte 2: a ficha master já existe em código, órfã

Isto muda o trabalho de "construir a ficha" para "ligar a ficha que existe".

| Peça | O que é | Estado |
|---|---|---|
| `src/types/case.ts` (392 linhas) | o formato completo dos 54 campos, tipado | existe |
| `src/lib/caseAdapter.ts#toFichaPiloto` | achata `CaseData` nos 54 campos planos, com os **mesmos ids** da ficha nova (`heatmap_pct_1`, `genograma_pessoa_1`…) | **zero consumidores** |
| `src/data/caseDataGiovanna.ts`, `caseDataSophia.ts`, `caseTemplate.ts`, `case-directory.ts` | de onde `CaseData` vem hoje | **dado estático de demonstração**, não o banco |
| `src/components/timeline-contratual.tsx`, `kit-contratual.tsx` | consomem `CaseData` | **nenhuma rota os monta** |

Ou seja: existe uma camada inteira da ficha master, alimentada por demo, que não chega a
nenhuma tela e não grava nada. O AGENTS.md é explícito sobre o que fazer com isso —
"conectar peça órfã existente antes de criar arquitetura paralela". Então o Corte 2 liga
`toFichaPiloto` a um leitor do banco real e implementa os campos sem coluna, em vez de
desenhar uma quarta ficha.

## Distribuição dos 54 campos

| Dono | Campos |
|---|---|
| Pesquisa | 32 |
| Planejador | 12 |
| Caso (eixo) | 4 |
| Núcleo | 3 |
| Contrato | 2 |
| Pessoa | 1 |

`input` = 11 campos · `output` = 43 campos.

Pesquisa concentra 32 dos 54 — é o motivo pelo qual o Centro de Inteligência é o eixo, e
não uma biblioteca lateral.

## Lacuna real: 5 campos sem onde gravar

| # | Campo | Por que falta | Decisão |
|---|---|---|---|
| 14 | `heatmap_pct_1` | percentual de aderência era proibido no App | **liberado por você em 01/10** → precisa de coluna |
| 15 | `heatmap_pais_2` | 2º país candidato não tem lugar por caso | precisa de coluna ou de leitura dos ramos do caso |
| 16 | `heatmap_pct_2` | idem 14 | idem |
| 17 | `heatmap_pais_3` | 3º país candidato | idem 15 |
| 18 | `heatmap_pct_3` | idem 14 | idem |

Os outros 49 têm destino real e verificado. Nenhuma outra lacuna de gravação existe
nesta ficha — o que faltava era leitor e validação, não tabela.

## Tabela master — 54 campos

Legenda de dono: Pessoa · Núcleo · Pesquisa · Planejador · Contrato · Caso (eixo).
`io` = input (equipe digita) ou output (sistema deriva).

| # | campo_id | Campo | io | obrig. | Dono | Tabela.coluna real | Onde a equipe grava | Aba no App | Máscara sugerida | Validação |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `case_id` | ID do caso | input | sim | Caso (eixo) | `crm_casos.codigo` | Caso 360 › Visão | — (nunca no App) | Texto, máx. 40 | obrigatório; recusar acima de 40 caracteres |
| 2 | `case_nome` | Nome do caso | input | sim | Caso (eixo) | `crm_casos.titulo` → `portal_casos.titulo` | Caso 360 › Visão | Home (título) | Texto, máx. 80 | obrigatório; recusar acima de 80 caracteres |
| 3 | `cliente_nome` | Nome do cliente | input | sim | Pessoa | `clientes.nome` → `portal_meu_cadastro.nome` | Pessoa 360 | Conta (Perfil) | Texto, máx. 120 | obrigatório; recusar acima de 120 caracteres |
| 4 | `status_caso` | Status do caso | input | sim | Caso (eixo) | `crm_casos.status` → `portal_casos.status` | Caso 360 › Visão | Home | Select de valores controlados: novo/em leitura/em documentos/em upgrade | obrigatório; recusar valor fora da lista (sem sinônimo novo) |
| 5 | `rota_provavel` | Rota provável | output | sim | Planejador | `clientes.pais_interesse` | Pessoa 360 / Mesa Discovery | Conta ("Origem de interesse") | Texto, máx. 40 | obrigatório; recusar acima de 40 caracteres |
| 6 | `documento_foco` | Documento foco | output | sim | Pesquisa | `portal_document_requests.titulo` | `/atendimento` (solicitar documento) | Documentos › Solicitados + link na Home | Texto, máx. 80 | obrigatório; recusar acima de 80 caracteres |
| 7 | `etapa_atual` | Etapa atual do caso | output | sim | Planejador | `case_plans.fase_jornada` → `portal_casos` | Caso 360 › Jornada (Planejador) | Home, Jornada | Texto, máx. 80 | obrigatório; recusar acima de 80 caracteres |
| 8 | `contexto_resumo` | Resumo do caso | output | sim | Pesquisa | `app_projections` (`resumo`) | `/biblioteca-evidencias/$caseId` tipo `resumo` | Home (Achados), Jornada | Texto, máx. 500 | obrigatório; recusar acima de 500 caracteres |
| 9 | `hipotese_principal` | Hipótese principal | output | sim | Pesquisa | `research_cases.internal_hypothesis` / `research_case_hypotheses` | Hub › Dimensões da pesquisa; `/pesquisa-modulo/$id` › Hipóteses | — (proibido no App) | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 10 | `trilha_origem` | Trilha origem | output | sim | Pesquisa | `app_projections` | `/biblioteca-evidencias` (`resumo`/`linha_tempo`) | Jornada (se publicada) | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 11 | `trilha_cidadania` | Trilha cidadania | output | sim | Planejador | `app_projections` | idem | Jornada (se publicada) | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 12 | `trilha_memoria` | Trilha memória | output | sim | Pesquisa | `app_projections` | idem | Jornada/Legado (se publicada) | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 13 | `heatmap_pais_1` | País 1 | output | sim | Planejador | `clientes.pais_interesse`, `citizenship_tracks.pais` | Pessoa 360; Caso 360 › Visão (trilha) | Conta; Radar | Texto, máx. 40 | obrigatório; recusar acima de 40 caracteres |
| 14 | `heatmap_pct_1` | Aderência país 1 | output | sim | Pesquisa | **FALTA_ONDE_GRAVAR** | — | Home › Heatmap (percentual **liberado em 01/10**) | Inteiro 0–100, gravado SEM o símbolo % (regra da ficha) | obrigatório; recusar <0 ou >100 e recusar string com % |
| 15 | `heatmap_pais_2` | País 2 | output | não | Planejador | **FALTA_ONDE_GRAVAR** | — | Home › Heatmap | Texto, máx. 40 | opcional; recusar acima de 40 caracteres |
| 16 | `heatmap_pct_2` | Aderência país 2 | output | não | Pesquisa | **FALTA_ONDE_GRAVAR** | — | Home › Heatmap (percentual **liberado em 01/10**) | Inteiro 0–100, gravado SEM o símbolo % (regra da ficha) | opcional; recusar <0 ou >100 e recusar string com % |
| 17 | `heatmap_pais_3` | País 3 | output | não | Planejador | **FALTA_ONDE_GRAVAR** | — | Home › Heatmap | Texto, máx. 40 | opcional; recusar acima de 40 caracteres |
| 18 | `heatmap_pct_3` | Aderência país 3 | output | não | Pesquisa | **FALTA_ONDE_GRAVAR** | — | Home › Heatmap (percentual **liberado em 01/10**) | Inteiro 0–100, gravado SEM o símbolo % (regra da ficha) | opcional; recusar <0 ou >100 e recusar string com % |
| 19 | `genograma_pessoa_1` | Pessoa central 1 | output | sim | Núcleo | `genealogical_person_profiles` → `app_projections.pessoa_id` | G-02 › Perfil 360° (`client_visibility = aprovada`) → publicar na árvore | Árvore | Texto, máx. 80 | obrigatório; recusar acima de 80 caracteres |
| 20 | `genograma_pessoa_2` | Pessoa central 2 | output | não | Núcleo | idem | idem | Árvore | Texto, máx. 80 | opcional; recusar acima de 80 caracteres |
| 21 | `genograma_pessoa_3` | Pessoa central 3 | output | não | Núcleo | idem | idem | Árvore | Texto, máx. 80 | opcional; recusar acima de 80 caracteres |
| 22 | `arvore_conexao_chave` | Conexão-chave | output | sim | Pesquisa | `app_projections` (`arvore`) | `/biblioteca-evidencias` tipo `arvore` | Árvore ("Próxima atualização"), Jornada | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 23 | `arvore_territorio` | Conexão territorial | output | sim | Pesquisa | idem | idem | Árvore, Jornada | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 24 | `arvore_lacuna` | Lacuna crítica | output | sim | Pesquisa | `app_projections` | G-02 › Lacunas (interno) → publicação `arvore` | Árvore (texto filtrado) | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 25 | `alerta_titulo` | Título do alerta | output | sim | Pesquisa | `app_projections` (`atualizacao`) | `/atendimento` tipo `atualizacao` | Home (Achados); Conta › Avisos | Texto, máx. 90 | obrigatório; recusar acima de 90 caracteres |
| 26 | `alerta_texto` | Texto do alerta | output | sim | Pesquisa | idem | idem | idem | Texto, máx. 280 | obrigatório; recusar acima de 280 caracteres |
| 27 | `doc_principal` | Documento principal | output | sim | Pesquisa | `documents.liberado_cliente` | Pessoa 360 › Documentos (liberar ao cliente) | Documentos › Liberados | Texto, máx. 120 | obrigatório; recusar acima de 120 caracteres |
| 28 | `doc_pendencia` | Pendência principal | output | sim | Pesquisa | `portal_document_requests` | `/atendimento` | Documentos › Solicitados | Texto, máx. 120 | obrigatório; recusar acima de 120 caracteres |
| 29 | `doc_status` | Status documental | output | sim | Pesquisa | `documents`, `portal_document_requests` | Caso 360 › Documentos | Documentos; Radar (Documentação) | Texto, máx. 60 | obrigatório; recusar acima de 60 caracteres |
| 30 | `origem_pessoas_conectadas` | Pessoas conectadas | output | sim | Pesquisa | contagem de `app_projections.pessoa_id` distintos | derivado das pessoas publicadas | Árvore | Inteiro, sem separador; limite até 4 | obrigatório; recusar negativo |
| 31 | `origem_geracoes_lidas` | Gerações lidas | output | sim | Pesquisa | `app_projections.geracao_cliente` | G-02 › Árvore interna → geração na publicação | Árvore (G1–G5) | Inteiro, sem separador; limite até 3 | obrigatório; recusar negativo |
| 32 | `origem_base_1` | Base externa 1 | input | não | Pesquisa | `research_sources`, `case_source_documents` | Hub › Fontes e documentos | — (nunca no App) | URL: exigir prefixo https:// ; 1 link; limite até 250 | opcional; recusar esquema != https; recusar texto que não seja URL |
| 33 | `origem_base_2` | Base externa 2 | input | não | Pesquisa | idem | idem | — | URL: exigir prefixo https:// ; 1 link; limite até 250 | opcional; recusar esquema != https; recusar texto que não seja URL |
| 34 | `origem_base_3` | Base externa 3 | input | não | Pesquisa | idem | idem | — | URL: exigir prefixo https:// ; 1 link; limite até 250 | opcional; recusar esquema != https; recusar texto que não seja URL |
| 35 | `origem_radar_resumo` | Resumo do radar | output | sim | Pesquisa | `radar-seis-eixos.ts` | derivado de dado real | Radar (6 eixos, sem juízo) | Texto, máx. 240 | obrigatório; recusar acima de 240 caracteres |
| 36 | `origem_arvore_ampliada` | Resumo da árvore | output | sim | Pesquisa | `app_projections` | `/biblioteca-evidencias` tipo `arvore` | Árvore | Texto, máx. 350 | obrigatório; recusar acima de 350 caracteres |
| 37 | `jornada_ancestral_1` | Linha ancestral | output | sim | Pesquisa | `app_projections` (`linha_tempo`) | G-02 › Linha do tempo → publicação `linha_tempo` | Jornada (Passado familiar) | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 38 | `jornada_cliente_1` | Linha do cliente | output | sim | Planejador | `app_projections` (`marco`) | Caso 360 › Jornada; publicação `marco` | Jornada (Presente) | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 39 | `jornada_intersecao_1` | Interseção 1 | output | sim | Pesquisa | `app_projections` (`uniao_ramos`) | Caso 360 › Jornada → publicação `uniao_ramos` | Jornada | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 40 | `jornada_intersecao_2` | Interseção 2 | output | não | Pesquisa | idem | idem | Jornada | Texto, máx. 180 | opcional; recusar acima de 180 caracteres |
| 41 | `descoberta_1` | Achado 1 | output | sim | Pesquisa | `genealogical_findings` → `app_projections` | `/achados/$caseId` → `/biblioteca-evidencias` tipo `achado` | Home, Jornada | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 42 | `descoberta_2` | Achado 2 | output | não | Pesquisa | idem | idem | Home, Jornada | Texto, máx. 180 | opcional; recusar acima de 180 caracteres |
| 43 | `entregavel_1` | Entregável | output | sim | Pesquisa | `app_projections` (`legado`), `client_deliverables` | `/biblioteca-evidencias` tipo `legado`; microentrega | Legado; Documentos | Texto, máx. 120 | obrigatório; recusar acima de 120 caracteres |
| 44 | `conta_produto_atual` | Produto atual | output | sim | Contrato | `app_projections` (nome comercial + situação + vigência) | Caso 360 › Formalização → "Publicar plano no App" | Conta › Plano | Texto, máx. 80 | obrigatório; recusar acima de 80 caracteres |
| 45 | `conta_status_jornada` | Status da jornada | output | sim | Planejador | `case_plans.fase_jornada` | Caso 360 › Jornada | Home, Jornada | Texto, máx. 120 | obrigatório; recusar acima de 120 caracteres |
| 46 | `conta_ultima_atualizacao` | Última atualização | output | sim | Planejador | `app_projections.effective_from` | derivado da publicação mais recente | Home (1º achado) | Texto, máx. 140 | obrigatório; recusar acima de 140 caracteres |
| 47 | `conta_historico_1` | Marco 1 | output | sim | Planejador | `case_timeline_events.summary_client_approved` | Caso 360 › Histórico ("Marcos aprovados para o App") | Conta › Histórico | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 48 | `conta_historico_2` | Marco 2 | output | sim | Planejador | idem | idem | idem | Texto, máx. 180 | obrigatório; recusar acima de 180 caracteres |
| 49 | `conta_historico_3` | Marco 3 | output | não | Planejador | idem | idem | idem | Texto, máx. 180 | opcional; recusar acima de 180 caracteres |
| 50 | `conta_upgrade` | Texto do upgrade | output | sim | Contrato | regra `permiteUpsell: false` | — | — (sem upsell) | Texto, máx. 220 | obrigatório; recusar acima de 220 caracteres |
| 51 | `link_pasta_docs` | Pasta principal de documentos | input | não | Pesquisa | `drive_provisioning_queue` | Caso 360 › Documentos (Drive) | — (interno) | URL: exigir prefixo https:// ; 1 link; limite até 250 | opcional; recusar esquema != https; recusar texto que não seja URL |
| 52 | `link_imagens` | Pasta de imagens do caso | input | não | Pesquisa | idem | idem | — (interno) | URL: exigir prefixo https:// ; 1 link; limite até 250 | opcional; recusar esquema != https; recusar texto que não seja URL |
| 53 | `link_fontes_extra` | Links de fontes extras | input | não | Pesquisa | `research_sources` | Hub › Fontes e documentos | — (interno) | Lista de URLs (uma por linha, cada uma https://); limite até 1000 | opcional; recusar esquema != https; recusar texto que não seja URL |
| 54 | `obs_input_output` | Regra de input/output | input | sim | Caso (eixo) | `publicacoesParaCliente` + `contemConteudoInterno` | aplicada em toda publicação | todas as abas (filtro) | Texto, máx. 500 | obrigatório; recusar acima de 500 caracteres |
---

## Inventário de todas as fichas e cadastros do Clube

Oito superfícies reais, ligadas por id — não formulários duplicados da mesma entidade —
mais a camada órfã da ficha master. Cada linha foi conferida por rota existente no
repositório.

### Fichas reais, ligadas ao banco

| Ficha / cadastro | Rota | Tabelas donas | Papel |
|---|---|---|---|
| **Pessoa 360** | `/pessoas/$clienteId` | `clientes` (+ leitura de `case_members`, `nucleo_membros`, `documents`, `research_people`, `genealogical_person_profiles`) | dona de identidade, contato e documentos civis. É o dossiê-mãe da pessoa. |
| **Núcleo 360** | `/nucleos` | `nucleos_familiares`, `nucleo_membros` | dona de vínculo, composição e representação. Dossiê-mãe da família. |
| **Lead / Mesa Discovery** | `/leads`, `/calls` | `leads` (+ `leads.discovery_registro`) | dona da narrativa e necessidade inicial. Uma oportunidade = um lead. |
| **Caso 360** | `/casos/$caseId` (8 seções) | `crm_casos` | o eixo. Visão · Jornada · Pessoas e família · Pesquisa · Documentos · Formalização · Financeiro · Histórico. |
| **Pesquisa / Genealogia 360** | `/pessoas-linhagens/$caseId` (10 abas), `/pesquisa-evidencias/$caseId`, `/achados/$caseId` | `research_*`, `lineage_*`, `genealogical_*` | dona de hipótese, linhagem, evento, fonte, evidência e achado. |
| **Contrato / Formalização / OS** | `/casos/$caseId/contrato/preparar`, `/contrato-parametros/$id` | `contracts`, `contract_parties`, `contract_parameter_values`, `service_orders` | dona de partes, escopo e snapshot assinado. |
| **Biblioteca de evidências / publicação** | `/biblioteca-evidencias/$caseId` | `app_projections` | fronteira Desk → App. Só publica o que foi aprovado. |
| **Planejador** | Caso 360 › Jornada | `case_plans` | dono de produto-pai, rota, fase, marcos e próxima ação. |
| **Ficha Piloto (painel)** | montada em Caso 360 › Técnico e riscos | só leitura | prévia pré-pesquisa; nenhum escritor próprio. |

### Camada órfã da ficha master — a ligar, não recriar

| Peça | Rota que a monta | Fonte de dados hoje |
|---|---|---|
| `src/types/case.ts` + `caseAdapter.ts` | nenhuma | — |
| `timeline-contratual.tsx`, `kit-contratual.tsx` | nenhuma | `CaseData` estático |
| `src/data/caseDataGiovanna.ts`, `caseDataSophia.ts`, `caseTemplate.ts` | nenhuma | demonstração escrita em código |

### Módulos históricos (15), da planilha italiana — organizam narrativa, não substituem fonte

As abas `CL_*` de `Mapeamento_Completo_Arquivos_Italianos` dão a estrutura dos módulos
históricos por pessoa: informações básicas · documentos vitais · família · vida
residencial · vida profissional · documentos civis e administrativos · documentos
notariais e de propriedade · registros catastais · vida acadêmica · vida militar · vida
artística e cultural · vida religiosa · correspondência e manuscritos · vida associativa ·
fotografias e audiovisuais · objetos pessoais · eventos significativos · contexto
histórico · próximos passos de pesquisa.

Equivalente real no Desk: a aba **Módulos históricos** de `/pessoas-linhagens/$caseId`.
Regra (sua decisão 6 de 01/10, reafirmada no roteiro): organizam evento e narrativa;
**não** substituem fonte nem evidência.

---

## Unificação — o que para de ser perguntado duas vezes

A regra é a mesma em toda a ficha: **quem não é dono lê e mostra "vindo de …"**, nunca
guarda cópia própria — salvo snapshot por regra (contrato assinado).

| Informação | Dono que grava | Quem lê |
|---|---|---|
| Identidade, contato, documentos civis | Pessoa 360 (`clientes`) | Caso, Núcleo, Contrato, App autorizado |
| Núcleo, vínculo, representação | Núcleo (`nucleos_familiares`, `nucleo_membros`) | Caso, Contrato, Árvore, App autorizado |
| Narrativa e necessidade inicial | Lead/Discovery (com origem válida); sem ela, Caso 360 | Pesquisa e Planejador |
| Hipótese, localidade, linha, evidência | Pesquisa (`research_*`, `lineage_*`) | Caso, Radar, referência contratual |
| Produto-pai, rota, condição operacional | Planejador (`case_plans`) | Caso 360, Formalização, Contrato |
| Partes, escopo, snapshot | Contrato (`contract_*`) | Revisão e assinatura, sem retropropagação |

---

## A Ana cresce o cadastro a cada fase, sem dedup

Regra do roteiro de 01/10: o cadastro **ganha** dado por fase; nunca funde pessoa por
semelhança. A proibição é explícita e vale em toda a cadeia:
**não fundir pessoas por nome, endereço, profissão ou filiação** (sua decisão 9).

| Fase | O que entra de novo | Quem grava | Nunca acontece |
|---|---|---|---|
| Discovery / lead | narrativa, país de interesse, consentimento, próxima ação | `leads` | lead não cria caso, proposta, contrato nem cobrança |
| Triagem / handoff | linha, geração, localidade, trilha, autorização de pesquisa | preenche **só campo vazio** no destino | nunca sobrescreve valor já preenchido no caso |
| Pessoa 360 | CPF, RG, nascimento, filiação, profissão, endereço | `clientes` | campo divergente vira **sinal**, com escolha humana |
| Núcleo | composição, vínculo, representação de menor | `nucleo_membros` | não promove ancestral a contratante |
| Pesquisa | pessoa G1…Gn, evento, fonte, evidência, achado | `research_*` | evidência não vira conclusão jurídica |
| Planejador | produto-pai, rota, fase, marcos, próxima ação | `case_plans` | não grava preço no App |
| Contrato | partes, escopo, condição particular | `contract_*` (snapshot) | depois de assinado, não muda |

### Participação da família da Ana (roteiro de 01/10)

| Pessoa | Papel | Assina | App |
|---|---|---|---|
| Ana Luiza | contratante/titular principal | assinante 1 | acesso familiar + perfil próprio |
| Adair | contratante/titular | assinante 2 | acesso familiar + perfil próprio |
| Alice | contratante/titular | assinante 3 | acesso familiar + perfil próprio |
| Felipe | **dependente menor** | não assina; exige representação quando aplicável | só conforme regra de menor e responsável |
| Clube Ancestral | contratada | perfil institucional | não usa o App como cliente |

**Compartilhado por núcleo:** árvore publicada, jornada e marcos sanitizados, documentos
liberados ao núcleo, legado/narrativas/relatórios/achados publicados, plano publicado sem
preço/SKU/parcela, atualizações da equipe.

**Individual por pessoa:** convite e autenticação, dados de perfil autorizados, status de
assinatura, preferências de comunicação, visibilidade de menor, documentos de acesso
individual.

---

## O que este documento não decide

- Onde gravar os 5 campos do heatmap (14–18): precisa de migration aditiva, que entra no
  Corte 2 — mas a coluna de `aderência` só faz sentido depois de você dizer se o número
  vem de cálculo do Radar ou de digitação da equipe.
- Percentual no 4º eixo "Elegibilidade" do Radar: você liberou o percentual do **heatmap
  de aderência por país**; o eixo Elegibilidade continua sem número até você dizer o
  contrário.
- Aposentar ou ligar a camada órfã (`CaseData`, `caseAdapter`, `case-directory`): ligar é
  o que o AGENTS.md manda, mas apagar os arquivos de demonstração é decisão sua —
  registrada em `docs/decisoes/DECISOES-PENDENTES-DA-PROPRIETARIA-2026-10-01.md`.
