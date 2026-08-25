# Clube Ancestral — Ficha Piloto Genealógica e Árvores

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** decisão canônica para implementação  
**Escopo:** Perfil Genealógico 360°, Ficha Piloto Genealógica, relações, linhagens, árvore, linha do tempo, evidências e integração com Desk Intelligence.

---

## Sumário

1. [Decisão](#1-decisão)
2. [Finalidade da ficha piloto](#2-finalidade-da-ficha-piloto)
3. [Fontes e limites](#3-fontes-e-limites)
4. [Modelo de dados](#4-modelo-de-dados)
5. [Dados pessoais e vitais](#5-dados-pessoais-e-vitais)
6. [Relações e árvore](#6-relações-e-árvore)
7. [Linhagens e linha dupla](#7-linhagens-e-linha-dupla)
8. [Documentos, fontes e evidências](#8-documentos-fontes-e-evidências)
9. [Eventos, migrações e linha do tempo](#9-eventos-migrações-e-linha-do-tempo)
10. [Módulos históricos complementares](#10-módulos-históricos-complementares)
11. [Validação e visibilidade](#11-validação-e-visibilidade)
12. [Árvore no Desk e App Cliente](#12-árvore-no-desk-e-app-cliente)
13. [Integração com relatórios e entregas](#13-integração-com-relatórios-e-entregas)
14. [Critérios de aceite](#14-critérios-de-aceite)
15. [Prompt de implementação](#15-prompt-de-implementação)

---

## 1. Decisão

A **Ficha Piloto Genealógica** é a estrutura canônica de pessoa e linhagem do Clube Ancestral. Ela não é uma planilha, não é um documento estático e não é substituída pela aba de Caso.

A árvore genealógica e a linha do tempo devem ser geradas a partir da Ficha Piloto, de relações estruturadas, de eventos e de evidências vinculadas. Nenhuma pessoa, relação, data, localidade ou fato deve aparecer como confirmado na árvore sem estado de validação e referência de fonte/evidência.

A ficha integra a área **Pesquisa Genealógica e Evidências** do Desk Intelligence.

---

## 2. Finalidade da ficha piloto

A ficha deve permitir:

- Registrar uma pessoa em profundidade histórica e genealógica.
- Separar fato confirmado, informação provável, hipótese e lacuna.
- Vincular documentos, fontes e evidências aos campos da pessoa.
- Registrar relações sem limitar quantidade de filhos, irmãos ou cônjuges.
- Construir árvore familiar interna e versões sanitizadas ao cliente.
- Alimentar linha do tempo, relatórios Fase 1/Fase 2, achados e micro-entregas.
- Organizar linhas paterna, materna, direta, colateral, cidadania, memória e dupla linhagem.
- Produzir tarefas e próximas pesquisas a partir de lacunas identificadas.

---

## 3. Fontes e limites

### Fontes permitidas

- Documento civil, religioso, militar, notarial, migratório ou consular.
- Documento ou relato fornecido pela família.
- Fonte institucional ou arquivo público.
- Entrevista, WhatsApp, call ou transcrição, sempre classificados como evidência conversacional/relato.
- Índice, transcrição ou fonte secundária.
- Síntese interna vinculada a evidência.

### Regras

- Documento não é automaticamente fato confirmado; precisa de validação proporcional.
- Relato familiar não é convertido em fato confirmado sem qualificação de fonte.
- Hipótese de pesquisa nunca é exibida como fato no App Cliente.
- Dados de pessoas vivas exigem controles de acesso e minimização.
- A árvore interna pode conter hipótese com sinalização; a árvore do cliente só mostra itens aprovados e sanitizados.

---

## 4. Modelo de dados

```text
Caso
└── Núcleo familiar
    ├── Pessoa / Perfil Genealógico 360°
    │   ├── Identidade e dados vitais
    │   ├── Relações
    │   ├── Residências e migrações
    │   ├── Ocupação e patrimônio
    │   ├── Vida militar
    │   ├── Vida religiosa/comunitária
    │   ├── Acervo e memória
    │   ├── Eventos e contexto
    │   └── Evidências vinculadas
    ├── Linhagens
    ├── Árvore interna
    ├── Linha do tempo interna
    ├── Achados
    └── Relatórios e entregas aprovadas
```

Entidades canônicas:

- `research_people`
- `genealogical_person_profiles`
- `genealogical_relationships`
- `lineage_paths`
- `lineage_encounters`
- `genealogical_events`
- `residences_migrations`
- `occupations_assets`
- `military_records`
- `notarial_records`
- `cadastral_records`
- `education_records`
- `cultural_records`
- `religious_records`
- `correspondence_records`
- `social_political_records`
- `audiovisual_records`
- `preserved_objects`
- `historical_context_events`
- `research_sources`
- `evidences`
- `evidence_validations`

---

## 5. Dados pessoais e vitais

A Ficha Piloto deve ter os campos abaixo. Campos podem ficar vazios; dados confirmados exigem fonte ou evidência vinculada.

| Campo | Tipo | Estado de verificação |
|---|---|---|
| Nome completo | Texto controlado | Confirmado; provável; hipótese; pendente |
| Nome ao nascimento | Texto | Confirmado; provável; hipótese; pendente |
| Sobrenomes alternativos/variações | Lista/texto | Confirmado; provável; hipótese; pendente |
| Sexo | Dropdown | Confirmado; provável; pendente; não aplicável |
| Data de nascimento | Data/flexível | Exata; aproximada; estimada; desconhecida |
| Local de nascimento | Localidade estruturada | Confirmado; provável; hipótese; pendente |
| Data de morte | Data/flexível | Exata; aproximada; estimada; desconhecida |
| Local de morte | Localidade estruturada | Confirmado; provável; hipótese; pendente |
| Causa da morte | Texto restrito | Confirmado; provável; pendente; não aplicável |
| Local de sepultamento | Localidade/arquivo | Confirmado; provável; pendente; não aplicável |
| Foto/representação | Referência interna | Acesso controlado |
| Nota biográfica interna | Texto restrito | Não é fonte; deve apontar evidências quando fizer afirmações |

---

## 6. Relações e árvore

Não usar campos fixos como Filho 1, Filho 2 ou Irmão 1. Toda relação é um registro independente.

### `genealogical_relationships`

| Campo | Regra |
|---|---|
| Pessoa de origem | Referência a pessoa |
| Pessoa de destino | Referência a pessoa |
| Tipo de relação | Pai/mãe; filho(a); cônjuge; irmão(ã); tutor/representante; padrinho/madrinha; colateral; a confirmar |
| Data/período | Exato, aproximado, estimado ou desconhecido |
| Localidade | Estruturada quando disponível |
| Estado | Confirmado; provável; hipótese; pendente; refutado |
| Evidência vinculada | Obrigatória para confirmado |
| Observação interna | Restrita |
| Visibilidade cliente | Nunca; sanitizada; aprovada |

### Regras da árvore

- A árvore interna pode mostrar vínculos prováveis ou hipotéticos com legenda própria.
- A árvore do cliente só mostra vínculos aprovados/sanitizados.
- Vínculo refutado é preservado no histórico de pesquisa, mas não aparece na árvore ativa.
- Relações de pessoa viva só aparecem conforme nível de acesso e autorização.
- Uma atualização de árvore gera histórico e pode gerar achado/micro-entrega, nunca publicação automática.

---

## 7. Linhagens e linha dupla

### `lineage_paths`

| Campo | Valores/uso |
|---|---|
| Nome da linhagem | Nome interno identificável |
| Pessoa âncora | Pessoa de partida da linha |
| Tipo | Paterna; materna; direta; colateral; cidadania; memória/legado; dupla/familiar; alternativa; a confirmar |
| País/trilha | Opcional; referência técnica |
| Objetivo | Cidadania, origem, patrimônio, memória, outra finalidade |
| Geração-alvo | Quando aplicável |
| Estado | Não iniciada; em pesquisa; em validação; consolidada; pausada; arquivada |
| Evidências-chave | Referências vinculadas |
| Risco principal | Campo estruturado/observação |
| Próximo marco | Campo datado e responsável |

### Linha dupla

Linha dupla é uma configuração de caso/família que mantém duas linhas de pesquisa independentes e comparáveis.

Exemplo:

```text
Linha A — Melani
Pessoa âncora: Giuseppe Gen I
Tipo: Direta / Cidadania
Estado: Em pesquisa

Linha B — Tosi
Pessoa âncora: Domenico Tosi
Tipo: Alternativa / Memória
Estado: Em investigação
```

A existência de duas linhas não confirma parentesco entre elas. Cruzamentos só viram encontro de linhagem após validação interna.

---

## 8. Documentos, fontes e evidências

### Documento e solicitação

A grade operacional mínima:

| Coluna | Regra |
|---|---|
| Geração | Dropdown controlado |
| Nome completo | Referência a pessoa |
| Tipo de documento | Dropdown do dicionário |
| Arquivo/Instituição | Referência a instituição/fonte |
| Data pedido | Obrigatória após solicitado |
| Status | Dropdown controlado |
| Data recebimento | Obrigatória após recebido |
| Observação | Interna e restrita |

### Tipos documentais

- Civil: nascimento, casamento, óbito, retificação, averbação.
- Religioso: batismo, casamento religioso, óbito religioso, sepultamento, Stato d’Anime, crisma.
- Militar: Lista di Leva, Ruolo Matricolare, Foglio Matricolare, patente, campanha, condecoração.
- Identidade/migração: passaporte, carta d’identità, residência, Estado de Família, imigração, lista de passageiro.
- Nacionalidade: naturalização, negativa de naturalização, registro consular, AIRE, passaporte estrangeiro.
- Notarial/patrimonial: testamento, compra/venda, doação, locação, divisão, dote, procuração, catasto.
- Educação/cultura: escola, diploma, laurea, publicação, obra, exposição, prêmio.
- Religioso-comunitário: cargo religioso, confraria, vocação, organização.
- Correspondência/memória: cartas, diário, manuscrito, foto, áudio, filme, objeto preservado.
- Histórico/jurídico: evento histórico, processo, marco oficial, parecer, decisão.

### Estados de evidência

- Recebida
- Registrada
- Em revisão
- Validada internamente
- Divergente
- Insuficiente
- Requer complemento
- Requer retificação
- Requer tradução/apostila
- Rejeitada/inaplicável
- Aprovada para entrega ao cliente
- Publicada ao cliente

`Validada internamente` não equivale a direito, cidadania, elegibilidade, prazo ou via confirmada.

---

## 9. Eventos, migrações e linha do tempo

### `genealogical_events`

| Campo | Exemplos |
|---|---|
| Tipo de evento | Nascimento, casamento, óbito, migração, serviço militar, aquisição, processo, calamidade, evento histórico |
| Data/período | Exato, aproximado, estimado, desconhecido |
| Local | Estruturado |
| Pessoas vinculadas | Uma ou mais |
| Descrição interna | Restrita |
| Fonte/evidência | Referência obrigatória para confirmado |
| Impacto | Familiar, patrimonial, migratório, documental, jurídico, memória |
| Estado | Confirmado; provável; hipótese; pendente; refutado |
| Visibilidade cliente | Interna; sanitizada; aprovada |

A linha do tempo é uma projeção de eventos confirmados e aprovados. Eventos prováveis/hipotéticos podem aparecer apenas na visão interna com legenda.

---

## 10. Módulos históricos complementares

Cada módulo é opcional e deve ser vinculado à pessoa, período, local, fonte/evidência e estado de validação.

### Residências e migrações

- Residência ao nascimento
- Residências sucessivas
- Residência ao óbito
- Emigração/imigração
- Origem, destino, porto, navio, período, motivo, fonte

### Trabalho e patrimônio

- Profissão principal/secundária
- Empregador/empresa
- Função, local e período
- Propriedades/terras
- Guildas, associações profissionais e sindicatos

### Vida militar

- Classe
- Distretto
- Número de matrícula
- Regimento/unidade
- Período de serviço
- Campanhas
- Grau/promoção
- Condecorações
- Ferimentos/hospitalização
- Arquivo/fonte

### Atos notariais e cadastro

- Testamento
- Compra e venda
- Doação
- Locação
- Divisão
- Dote/contrato matrimonial
- Procuração
- Visura cadastral
- Mapa cadastral
- Catasto Terreni/Fabbricati
- Herdeiros, valores, objetos, propriedades

### Educação, cultura e religião

- Escolaridade, escola, universidade, diploma, laurea
- Publicações, obras, exposições, prêmios
- Paróquia, sacramentos, cargos, confrarias, vocação, túmulo

### Correspondência, memória e acervo

- Cartas, diários, manuscritos, documentos autógrafos
- Fotografias, retratos, áudio, filmagem
- Objetos preservados, roupas, joias, livros, documentos pessoais
- Localização atual, proprietário, proveniência e história

### Contexto histórico e social

- Migração, calamidade, processo judicial, evento histórico vivido
- Contexto político, econômico e social
- Impacto familiar e fonte

---

## 11. Validação e visibilidade

| Estado | Uso interno | App Cliente |
|---|---|---|
| Confirmado | Pode alimentar árvore/timeline interna | Só após aprovação/sanitização |
| Provável | Visível com legenda interna | Nunca como fato |
| Hipótese | Pesquisa interna | Nunca |
| Pendente | Lacuna/tarefa | Nunca |
| Refutado | Histórico de pesquisa | Nunca |

Toda confirmação deve indicar fonte/evidência e responsável pela validação.

---

## 12. Árvore no Desk e App Cliente

### Desk interno

- Árvore completa por pessoa, núcleo, linha e caso.
- Legenda de estados: confirmado, provável, hipótese, pendente.
- Filtros por geração, linha, localidade, tipo de evidência e período.
- Visualização de lacunas e documentos pendentes.
- Registro de alterações de relações e pessoas.

### App Cliente

- Apenas árvore sanitizada e aprovada.
- Sem fontes internas, URLs, notas, risco, hipótese, score, dados de terceiros ou documentos brutos.
- Relações e fatos exibidos só após validação e aprovação de conteúdo.

---

## 13. Integração com relatórios e entregas

A Ficha Piloto alimenta:

- Relatório Fase 1 — Diagnóstico e Direcionamento.
- Relatório Fase 2 — Pesquisa Genealógica e Evidências.
- Achados genealógicos.
- Linha do tempo.
- Encontros de linhagem.
- Plano de ação de pesquisa.
- Micro-entregas aprovadas.

### Encontro de Linhagem

É entrega intermediária aprovada que registra uma conexão confirmada, convergência documental, separação de ramos, linha paralela relevante, dupla linhagem familiar ou marco de origem.

Nunca afirmar parentesco ou conexão jurídica sem evidências e validação internas.

---

## 14. Critérios de aceite

A implementação está aceita quando:

1. Uma pessoa pode ser criada com perfil genealógico e estados de verificação.
2. Relações não têm limite fixo de filhos, irmãos ou cônjuges.
3. Toda relação/fato confirmado pode referenciar evidência/fonte.
4. Linhagens podem ser criadas, inclusive dupla linhagem, sem duplicar pessoas ou casos.
5. Documentos e evidências se vinculam a pessoa, geração, fonte e status.
6. Eventos geram linha do tempo interna.
7. A árvore interna diferencia confirmado, provável, hipótese e pendente.
8. A árvore cliente mostra somente conteúdo aprovado/sanitizado.
9. Achados e relatórios usam dados da ficha sem duplicar campos.
10. Ações de pesquisa podem ser geradas a partir de lacunas documentais.
11. Nenhuma pesquisa externa, documento, contato ou publicação externa é criada automaticamente.

---

## 15. Prompt de implementação

```text
IMPLEMENTAR A FICHA PILOTO GENEALÓGICA E A ORIGEM CANÔNICA DAS ÁRVORES E LINHAS DO TEMPO.

NÃO CRIAR PESQUISA EXTERNA, PEDIDO DE CERTIDÃO, PASTA, DOCUMENTO EXTERNO, CONTATO COM INSTITUIÇÃO, COMUNICAÇÃO EXTERNA OU PUBLICAÇÃO AUTOMÁTICA NO APP CLIENTE.

DECISÃO:
A Ficha Piloto Genealógica é a estrutura canônica para Pessoas, Relações, Linhagens, Árvores e Linhas do Tempo. A árvore não deve ser alimentada por texto livre ou dados soltos do Caso. Ela deve ser derivada de pessoas, relações, eventos e evidências com estado de validação.

A. LOCALIZAÇÃO
Dentro de “Pesquisa Genealógica e Evidências”, criar área principal:
“Pessoas e Linhagens”.

Subáreas:
- Perfil Genealógico 360°
- Relações e Árvore
- Linhagens
- Linha do Tempo
- Documentos e Evidências
- Eventos e Contexto
- Lacunas e Próximas Pesquisas

B. PESSOAS E PERFIL GENEALÓGICO
Criar/ajustar research_people e genealogical_person_profiles.

Campos de perfil:
- nome_completo
- nome_ao_nascimento
- sobrenomes_alternativos
- sexo
- nascimento_data
- nascimento_precisao: exata, aproximada, estimada, desconhecida
- nascimento_localidade
- morte_data
- morte_precisao
- morte_localidade
- causa_morte
- sepultamento_localidade
- nota_biografica_interna
- status_verificacao
- evidence_reference
- verified_at
- responsible_user_id

Estados de verificação:
- Confirmado
- Provável
- Hipótese
- Pendente
- Não aplicável

Regra: dados Confirmados exigem evidência/fonte vinculada. Nunca inferir dado ausente.

C. RELAÇÕES
Criar genealogical_relationships. Não criar campos fixos Filho 1, Filho 2, Irmão 1 etc.

Campos:
- pessoa_origem_id
- pessoa_destino_id
- tipo_relacao
- data_ou_periodo
- localidade
- status_relacao: Confirmado, Provável, Hipótese, Pendente, Refutado
- evidence_id
- source_id
- observacao_interna
- client_visibility
- created_at
- updated_at

Tipos de relação:
- Pai/mãe
- Filho(a)
- Cônjuge
- Irmão(ã)
- Tutor/representante legal
- Padrinho/madrinha
- Parente colateral
- Relação a confirmar

D. LINHAGENS
Criar lineage_paths:
- case_id
- family_id
- nome_da_linhagem
- pessoa_ancora_id
- tipo_da_linha: Paterna, Materna, Direta, Colateral, Cidadania, Memória/legado, Dupla/familiar, Alternativa, A confirmar
- citizenship_track_id opcional
- objetivo
- geracao_alvo
- status: Não iniciada, Em pesquisa, Em validação, Consolidada, Pausada, Arquivada
- evidencias_chave
- risco_principal
- proximo_marco
- responsible_user_id

Permitir dupla linhagem sem duplicar pessoa ou caso.

E. ÁRVORE E LINHA DO TEMPO
Criar projeções internas derivadas:
- Árvore interna por família/caso/linhagem.
- Linha do tempo interna por pessoa, família e linhagem.

Regras:
- Árvore interna mostra legenda de Confirmado, Provável, Hipótese e Pendente.
- Árvore cliente mostra somente relações/fatos aprovados e sanitizados.
- Relação refutada fica no histórico, não na árvore ativa.
- Alteração de árvore gera auditoria e tarefa de revisão.
- Evento confirmado exige fonte/evidência.

Criar genealogical_events:
- case_id
- family_id
- pessoa_id opcional
- event_type
- data_inicio
- data_fim
- precisao_data
- localidade
- descricao_interna
- impact_type
- evidence_id
- source_id
- status_verificacao
- client_visibility

F. MÓDULOS COMPLEMENTARES
Criar tabelas opcionais, vinculadas a pessoa, fonte/evidência, período e estado:
- residences_migrations
- occupations_assets
- military_records
- notarial_records
- cadastral_records
- education_records
- cultural_records
- religious_records
- correspondence_records
- social_political_records
- audiovisual_records
- preserved_objects
- historical_context_events

Não tornar todos os campos obrigatórios. Não criar dados por inferência.

G. DOCUMENTOS E EVIDÊNCIAS
Usar o dicionário de documentos/evidências já aprovado.
Cada documento/evidência deve poder apontar para:
- pessoa
- geração
- linhagem
- evento
- relação
- fonte/instituição
- status
- link interno

H. INTEGRAÇÃO
A Ficha Piloto deve alimentar:
- Achados Genealógicos
- Relatório Fase 1
- Relatório Fase 2
- Linha do Tempo
- Encontros de Linhagem
- Plano de Ação de Pesquisa
- Micro-entregas em rascunho

I. SEGURANÇA
- Não expor hipótese, risco, score, fonte interna, documento bruto, URL interna, dado de terceiro ou informação de pessoa viva no App Cliente.
- App Cliente só recebe árvore e timeline aprovadas/sanitizadas.
- Nenhuma publicação automática.

J. TESTES
Criar testes com fixtures de desenvolvimento:
1. Pessoa com dado confirmado e evidência vinculada.
2. Pessoa com dado hipótese sem publicação.
3. Relação sem limite de filhos/irmãos.
4. Relação confirmada com evidência.
5. Linha dupla sem duplicar pessoas.
6. Evento alimentando timeline.
7. Relação provável aparece apenas no Desk.
8. Conteúdo não aprovado não aparece no App Cliente.
9. Alteração de relação gera auditoria.

K. ENTREGA
Mostrar:
- migrations/tabelas;
- telas e navegação;
- árvore e timeline internas;
- regras de visibilidade;
- integração com evidências/achados/relatórios;
- resultados de testes;
- confirmação de nenhuma ação externa executada.
```
