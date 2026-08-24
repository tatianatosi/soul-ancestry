# Bloco 5A — Fichas de Pesquisa, Bases Genealógicas, Evidências e Arquitetura Backend
## Clube Ancestral · Ancestral Canvas

**Data:** 11/08/2026
**Tipo:** Modelagem e auditoria (não execução)
**Escopo:** Base de dados, fichas-modelo, regras de evidência, inventário de fontes genealógicas e arquitetura backend → Desk → Projeção App Cliente.

**Não inclui:** integração de APIs, scraping, criação de SKUs, novos produtos, alteração de sistemas externos, publicação de links/dashboards/relatórios/automações.

---

## Sumário

1. [Princípios e linguagem](#1-princípios-e-linguagem)
2. [Ficha-modelo de Pesquisa por Caso (A)](#2-ficha-modelo-de-pesquisa-por-caso-a)
3. [Dicionário de entidades e campos (B)](#3-dicionário-de-entidades-e-campos-b)
4. [Matriz de evidência e confiança (C)](#4-matriz-de-evidência-e-confiança-c)
5. [Inventário de bases genealógicas (D)](#5-inventário-de-bases-genealógicas-d)
6. [Arquitetura backend → Desk → Projeção App (E)](#6-arquitetura-backend--desk--projeção-app-e)
7. [Matriz entrega → dashboard → one-page → PDF → interno (F)](#7-matriz-entrega--dashboard--one-page--pdf--interno-f)
8. [Modelo seguro de Caderno de Encontros de Linhagem (G)](#8-modelo-seguro-de-caderno-de-encontros-de-linhagem-g)
9. [Backlog 5A e 5B (H)](#9-backlog-5a-e-5b-h)
10. [Riscos e decisões humanas pendentes (I)](#10-riscos-e-decisões-humanas-pendentes-i)

---

## 1. Princípios e linguagem

### 1.1 Integração invisível, evidência visível

| Camada | Função |
|---|---|
| Backend | Consulta, normaliza, registra e classifica dados de fontes autorizadas |
| Desk / Pesquisa | Administra evidência, valida, classifica confiança, define pendências e próximos passos |
| Projeção App Cliente | Mostra apenas resumo autorizado, estado de validação e próximo passo — por caso |
| One-page / Dashboard / PDF | Aprofunda uma síntese aprovada para contexto externo |

**Nunca expor:** token, API, URL interna, matching, fonte crua, hipótese jurídica.

### 1.2 Pesquisa não é conclusão jurídica

Nenhuma base, registro ou match confirma cidadania, parentesco ou rota sozinho. Toda informação tem um estado de validação:

| Estado | Significado |
|---|---|
| `informação_compartilhada_familia` | Dado fornecido pela família em entrevista ou formulário inicial |
| `dado_pesquisa_inicial` | Primeiro resultado de busca, sem validação documental |
| `em_validacao_documental` | Em processo de conferência com fonte primária |
| `validado_por_documento` | Confirmado por documento oficial (certidão, registro civil, etc.) |
| `pendente_confirmacao` | Não foi possível confirmar; aguarda nova fonte ou documento |
| `nao_aplicavel` | Não se aplica a este caso ou pessoa |

### 1.3 Linguagem de legado segura

**Termos proibidos:**
- Constelação familiar
- Cura ancestral
- Terapia sistêmica
- Trauma transgeracional
- Diagnóstico psicológico
- Associação de nacionalidade a personalidade ou comportamento

**Termos permitidos:**
- Contexto histórico
- Memória familiar
- Narrativas de migração
- Práticas culturais documentadas
- Encontros de linhagem
- Identidade, pertencimento e legado

**Aviso obrigatório em todo conteúdo narrativo:**

> "Este conteúdo é educativo e narrativo. Não substitui acompanhamento terapêutico, psicológico ou médico."

### 1.4 Separação de produtos e entregas

- Não criar SKU para cada PDF, insight ou card.
- Fluxo: **entrega percebida → etapa da jornada → família de oferta existente → condição de liberação**.
- Se houver lacuna comercial real: marcar `PROPOSTA_PENDENTE_DE_APROVAÇÃO`.
- Dashboard nunca mostra SKU ou preço cru.

---

## 2. Ficha-modelo de Pesquisa por Caso (A)

### Estrutura da Ficha de Pesquisa

```
FICHA DE PESQUISA POR CASO
═══════════════════════════

case_id:                    [UUID interno — nunca visível no App]
pessoa_principal:           [Nome completo validado]
objetivo_pesquisa:          [Texto livre — objetivo genealógico, não jurídico]
pais_contexto:              [País de origem da linha]
linha_familiar:              [Ex.: Linha Prade / Linha materna Piccoli]
pessoas_relacionadas:        [Lista de Pessoa IDs]
relacoes:                   [Lista de Relação IDs]
geracoes:                   [Número de gerações mapeadas]
eventos_civis:              [Lista de Evento IDs]
documentos:                 [Lista de Documento IDs — disponíveis + solicitados]
fontes:                     [Lista de Fonte IDs consultadas]
evidencias:                 [Lista de Evidência IDs]
variantes_nome:             [Lista de Variante IDs]
pendencias:                 [Lista de Pendência IDs]
grau_confianca:             [alto | medio | baixo | inicial]
responsavel:                [Nome do pesquisador responsável]
proxima_acao:               [Texto — próxima ação operacional]
regra_visibilidade:         [app | desk_only | crm_only | one_page | pdf_aprovado]
entrega_jornada_relacionada:[ID da entrega/jornada no Desk]
```

### Campos detalhados

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `case_id` | UUID | Sim | Identificador interno do caso. Nunca exibido no App. |
| `pessoa_principal` | String | Sim | Nome completo validado do cliente. |
| `objetivo_pesquisa` | Texto | Sim | Objetivo genealógico em linguagem não jurídica. |
| `pais_contexto` | Enum | Sim | País de origem da linha (Itália, Portugal, Croácia, Áustria, Brasil, etc.). |
| `linha_familiar` | String | Sim | Nome da linha pesquisada (ex.: "Linha Prade"). |
| `pessoas_relacionadas` | Lista<Pessoa> | Sim | Pessoas na árvore, vinculadas por ID. |
| `relacoes` | Lista<Relação> | Sim | Relações entre pessoas (pai, mãe, cônjuge, etc.). |
| `geracoes` | Integer | Sim | Número de gerações mapeadas. |
| `eventos_civis` | Lista<Evento> | Não | Nascimento, casamento, óbito, naturalização, etc. |
| `documentos` | Lista<Documento> | Não | Documentos disponíveis e solicitados. |
| `fontes` | Lista<Fonte> | Não | Fontes consultadas (bases, arquivos, etc.). |
| `evidencias` | Lista<Evidência> | Não | Evidências encontradas e seu estado. |
| `variantes_nome` | Lista<Variante> | Não | Variações de grafia mapeadas. |
| `pendencias` | Lista<Pendência> | Não | Pendências documentais e de pesquisa. |
| `grau_confianca` | Enum | Sim | Nível geral de confiança da pesquisa. |
| `responsavel` | String | Sim | Pesquisador responsável pela validação. |
| `proxima_acao` | Texto | Sim | Próxima ação operacional recomendada. |
| `regra_visibilidade` | Enum | Sim | Define onde a informação pode aparecer. |
| `entrega_jornada_relacionada` | ID | Sim | Vínculo com a etapa de jornada e entrega no Desk. |

### Regra de visibilidade — valores permitidos

| Valor | Significado |
|---|---|
| `app` | Pode aparecer na Projeção App Cliente (após aprovação) |
| `desk_only` | Apenas interno no Desk — nunca no App |
| `crm_only` | Apenas no CRM — dados comerciais/formalização |
| `one_page` | Pode entrar em devolutiva one-page (após aprovação) |
| `pdf_aprovado` | Pode entrar em relatório PDF (após aprovação) |

---

## 3. Dicionário de entidades e campos (B)

### 3.1 Pessoa

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pessoa_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `nome_completo` | String | — | CRM / Pesquisa | Conforme estado | `validado_por_documento` ou `em_validacao` | Sim | Condicional (só validado) | Condicional | Sim | CRM ou Pesquisa | Atualizado quando documento valida |
| `nome_exibicao` | String | — | CRM | N/A | `validado_por_documento` | Não | Sim (se validado) | Sim | Sim | CRM | Derivado de `nome_completo` |
| `data_nascimento` | Date | — | Pesquisa | Conforme estado | Conforme estado | Sim | Condicional | Condicional | Sim | Pesquisa | Atualizado por certidão |
| `local_nascimento` | String | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional (generalizado) | Condicional | Sim | Pesquisa | Atualizado por fonte primária |
| `data_falecimento` | Date | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional | Condicional | Sim | Pesquisa | Atualizado por fonte primária |
| `local_falecimento` | String | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional | Condicional | Sim | Pesquisa | Atualizado por fonte primária |
| `nacionalidade` | String | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional | Condicional | Sim | Pesquisa | Atualizado por fonte |
| `observacoes` | Texto | — | Desk | N/A | N/A | Sim | Não | Não | Sim | Desk | Pesquisador edita |
| `classificacao_acesso` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | publico_historico, cliente, interno, sensivel, restrito |
| `exige_consentimento` | Boolean | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | True se exibe dados que exigem consentimento |
| `consentimento_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Vinculado a Consentimento (se aplicável) |
| `status_retencao` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | ativo, arquivado, exclusao_pendente, excluido |
| `foto` | Imagem | — | Família | N/A | `informação_compartilhada_familia` | Sim | Não (nesta fase) | Não | Sim | CRM | Requer consentimento |

### 3.2 Relação

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `relacao_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `pessoa_a_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Pessoa |
| `pessoa_b_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Pessoa |
| `tipo_relacao` | Enum | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional | Condicional | Sim | Pesquisa | pai, mãe, cônjuge, filho, irmão |
| `confianca` | Enum | — | Desk | Conforme estado | Conforme estado | Não | Não | Não | Sim | Desk | alto, medio, baixo, inicial |
| `fonte_relacao` | UUID (FK) | — | Pesquisa | N/A | N/A | Não | Não | Não | Sim | Pesquisa | Vinculado a Fonte |

### 3.3 Evento

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `evento_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `tipo_evento` | Enum | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional | Condicional | Sim | Pesquisa | nascimento, casamento, óbito, naturalização, batismo, imigração |
| `data_evento` | Date | — | Pesquisa | Conforme estado | Conforme estado | Sim | Condicional | Condicional | Sim | Pesquisa | Atualizado por documento |
| `local_evento` | String | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional (generalizado) | Condicional | Sim | Pesquisa | Atualizado por fonte |
| `pessoa_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Pessoa |
| `documento_id` | UUID (FK) | — | Pesquisa | N/A | N/A | Não | Não | Não | Sim | Pesquisa | Vinculado a Documento |
| `fonte_id` | UUID (FK) | — | Pesquisa | N/A | N/A | Não | Não | Não | Sim | Pesquisa | Vinculado a Fonte |

### 3.4 Documento

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `documento_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `tipo_documento` | Enum | — | Desk/CRM | N/A | N/A | Condicional | Condicional (status apenas) | Não | Sim | Desk/CRM | certidao_nascimento, certidao_casamento, certidao_obito, registro_civil, passaporte, naturalizacao, batismo, outro |
| `status_documento` | Enum | — | Desk | N/A | N/A | Não | Sim (status) | Não | Sim | Desk | solicitado, recebido, em_conferencia, pendente, validado |
| `numero_documento` | String | — | Desk/CRM | N/A | N/A | Sim | Não | Não | Sim | CRM | Nunca no App |
| `data_emissao` | Date | — | Desk/CRM | N/A | N/A | Sim | Não | Não | Sim | CRM | Nunca no App |
| `orgao_emissor` | String | — | Desk/CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Nunca no App |
| `arquivo_url` | URL | — | Desk | N/A | N/A | Sim | Não | Não | Sim | Desk | Requer armazenamento seguro + LGPD |
| `classificacao_acesso` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | publico_historico, cliente, interno, sensivel, restrito |
| `exige_consentimento` | Boolean | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | True se documento exige consentimento |
| `consentimento_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Vinculado a Consentimento (se aplicável) |
| `status_retencao` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | ativo, arquivado, exclusao_pendente, excluido |
| `pessoa_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Pessoa |
| `evento_id` | UUID (FK) | — | Pesquisa | N/A | N/A | Não | Não | Não | Sim | Pesquisa | Vinculado a Evento |

### 3.5 Fonte

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `fonte_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `nome_fonte` | String | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Nome da base/arquivo consultado |
| `tipo_fonte` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | arquivo_civil, arquivo_nacional, arquivo_estadual, arquivo_municipal, imigracao, paroquia, jornal, cemiterio, militar, passageiros, plataforma_genealogica, acervo_familiar |
| `pais` | String | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | País da fonte |
| `url_interna` | URL | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Nunca no App |
| `data_consulta` | Date | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Quando a fonte foi consultada |
| `resultado_consulta` | Texto | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Resumo do que foi encontrado |
| `base_id` | UUID (FK) | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Vinculado a Inventário de Bases |

### 3.6 Evidência

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `evidencia_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `descricao` | Texto | — | Desk/Pesquisa | Conforme nível | Conforme estado | Não | Condicional (resumo autorizado) | Condicional | Sim | Desk | Descrição do achado |
| `tipo_evidencia` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | registro_civil, certidao, lista_passageiros, registro_paroquial, jornal, foto, documento_familiar, correspondencia, busca_negativa, outro |
| `nivel_confianca` | Enum | — | Desk | alto, medio, baixo, inicial | N/A | Não | Não | Não | Sim | Desk | Ver Seção 4 |
| `estado_validacao` | Enum | — | Desk | N/A | `informação_compartilhada_familia`, `dado_pesquisa_inicial`, `em_validacao_documental`, `validado_por_documento`, `pendente_confirmacao`, `nao_aplicavel` | Não | Condicional (estado visível, descrição só se aprovada) | Condicional | Sim | Desk | Ver Seção 4 |
| `fonte_id` | UUID (FK) | — | Pesquisa | N/A | N/A | Não | Não | Não | Sim | Pesquisa | Vinculado a Fonte |
| `data_evidencia` | Date | — | Pesquisa | Conforme nível | Conforme estado | Não | Não | Não | Sim | Pesquisa | Data do documento ou evento que gerou a evidência |
| `pais_localidade` | String | — | Pesquisa | Conforme nível | Conforme estado | Não | Não | Não | Sim | Pesquisa | País e localidade da evidência |
| `tipo_documental` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | certidao_nascimento, certidao_casamento, certidao_obito, registro_civil, registro_paroquial, lista_passageiros, jornal, foto, documento_familiar, correspondencia, busca_negativa, outro |
| `qualidade_evidencia` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | original, copia_certificada, copia_digitalizada, transcricao, indice, referencia_indireta |
| `responsavel_validacao` | String | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Quem validou a evidência |
| `data_validacao` | Date | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Quando a validação ocorreu |
| `pessoa_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Pessoa |
| `evento_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Evento (se aplicável) |

### 3.7 Variante de Nome

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `variante_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `pessoa_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Pessoa |
| `variante_nome` | String | — | Pesquisa | Conforme estado | Conforme estado | Não | Condicional ("em confirmação") | Condicional | Sim | Pesquisa | Ex.: Piccoli → Picoli |
| `origem_variante` | String | — | Pesquisa | N/A | N/A | Não | Não | Não | Sim | Pesquisa | Por que a variante existe (transliteração, erro de registro, etc.) |
| `fonte_id` | UUID (FK) | — | Pesquisa | N/A | N/A | Não | Não | Não | Sim | Pesquisa | Vinculado a Fonte |

### 3.8 Pendência

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pendencia_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `tipo_pendencia` | Enum | — | Desk | N/A | N/A | Não | Condicional (resumo) | Condicional | Sim | Desk | documental, pesquisa, validacao, contato |
| `descricao` | Texto | — | Desk | N/A | N/A | Não | Condicional (linguagem simples) | Condicional | Sim | Desk | Descrição em linguagem não técnica |
| `prioridade` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | alta, media, baixa |
| `status_pendencia` | Enum | — | Desk | N/A | N/A | Não | Sim (se autorizada) | Condicional | Sim | Desk | aberta, em_andamento, resolvida, cancelada |
| `prazo_interno` | Date | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Nunca no App |
| `responsavel` | String | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Pesquisador responsável |

### 3.9 Entrega

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `entrega_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `titulo_entrega` | String | — | Desk | N/A | N/A | Não | Sim (se liberada) | Sim | Sim | Desk | Título cliente-facing |
| `descricao_entrega` | Texto | — | Desk | N/A | N/A | Não | Sim (se liberada) | Sim | Sim | Desk | Descrição em linguagem simples |
| `tipo_entrega` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | diagnostico_inicial, relatorio_pesquisa, sintese_familiar, caderno_encontros, one_page |
| `status_entrega` | Enum | — | Desk | N/A | N/A | Não | Sim | Sim | Sim | Desk | em_preparacao, em_revisao, liberada, publicada |
| `data_liberacao` | Date | — | Desk | N/A | N/A | Não | Sim (se liberada) | Sim | Sim | Desk | Só exibir se status = liberada/publicada |
| `biblioteca_destino` | Enum | — | Desk | N/A | N/A | Não | Sim | Sim | Sim | Desk | pesquisa, cidadania, memoria, legado, vida_pratica |
| `conteudo_aprovado` | Boolean | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | True somente após revisão humana |
| `case_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado à Ficha de Caso |

### 3.10 Relatório

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `relatorio_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `titulo_relatorio` | String | — | Desk | N/A | N/A | Não | Não | Sim (título) | Sim | Desk | Título do relatório |
| `tipo_relatorio` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | sintese_familiar, diagnostico_completo, relatorio_fase01, relatorio_fase02, one_page |
| `conteudo` | JSON/Texto | — | Desk | Conforme conteúdo | Conforme conteúdo | Condicional | Não (conteúdo cru) | Sim (aprovado) | Sim | Desk | Conteúdo estruturado; só PDF após aprovação |
| `status_aprovacao` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | rascunho, em_revisao, aprovado, publicado |
| `versao` | Integer | — | Backend | N/A | N/A | Não | Não | Sim (versão) | Sim | Backend | Incrementado a cada revisão |
| `entrega_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Entrega |
| `data_criacao` | Date | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema registra |
| `data_aprovacao` | Date | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Quando foi aprovado |
| `classificacao_acesso` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | publico_historico, cliente, interno, sensivel, restrito |
| `exige_consentimento` | Boolean | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | True se contém dados que exigem consentimento |
| `consentimento_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Vinculado a Consentimento (se aplicável) |
| `status_retencao` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | ativo, arquivado, exclusao_pendente, excluido |
| `tipo_conteudo` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | sintese_aprovada, documento_original, transcricao_crua, imagem_crua. **PDF só pode conter sintese_aprovada; documento/transcrição/imagem crua exigem regra específica** |

### 3.11 Memória

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `memoria_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `tipo_memoria` | Enum | — | Desk/Família | N/A | N/A | Condicional | Condicional (aprovado) | Condicional | Sim | Desk | relato_oral, carta, diario, foto_historica, documento_familiar, narrativa |
| `conteudo` | Texto | — | Família/Desk | N/A | `informação_compartilhada_familia` | Sim | Não (cru) | Condicional (aprovado) | Sim | Desk | Conteúdo narrativo; requer consentimento |
| `pessoa_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado a Pessoa |
| `consentimento_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Vinculado a Consentimento |
| `fonte_id` | UUID (FK) | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Vinculado a Fonte |
| `classificacao_acesso` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | publico_historico, cliente, interno, sensivel, restrito |
| `exige_consentimento` | Boolean | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | True sempre para Memória |
| `status_retencao` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | ativo, arquivado, exclusao_pendente, excluido |
| `data_registro` | Date | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema registra |

### 3.12 Consentimento

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `consentimento_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `cliente_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Vinculado a Pessoa principal |
| `tipo_consentimento` | Enum | — | CRM | N/A | N/A | Sim | Não | Não | Sim | CRM | uso_imagem, uso_relato, compartilhamento_dados, pesquisa_genealogica, publicacao_narrativa |
| `status_consentimento` | Enum | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | pendente, concedido, revogado, expirado |
| `data_concessao` | Date | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Quando concedido |
| `data_revogacao` | Date | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Se revogado |
| `base_legal` | String | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Referência à base legal LGPD |
| `observacoes` | Texto | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Notas internas |

### 3.13 Projeção App Cliente

| Campo | Tipo | ID | Fonte | Nível de confiança | Status de validação | Dado sensível? | Pode no App? | Pode em PDF? | Exige revisão humana? | Origem | Regra de atualização |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `projecao_id` | UUID | PK | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Sistema gera |
| `case_id` | UUID (FK) | — | Backend | N/A | N/A | Não | Não | Não | Não | Backend | Vinculado à Ficha de Caso. **Obrigatório apenas para Nível 2 (Workspace)** |
| `opportunity_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Obrigatório para Nível 1 (Portal de Proposta) |
| `proposal_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Alternativa a opportunity_id para Nível 1 |
| `campo_projetado` | String | — | Desk/CRM | Conforme fonte | Conforme fonte | Condicional | Sim (se aprovado) | Condicional | Sim | Desk | Nome do campo que aparece no App |
| `valor_projetado` | Texto | — | Desk/CRM | Conforme fonte | Conforme fonte | Condicional | Sim (se aprovado) | Condicional | Sim | Desk | Valor sanitizado para o App |
| `campo_origem` | String | — | Backend | N/A | N/A | Não | Não | Não | Sim | Backend | Nome do campo na fonte original |
| `fonte_origem` | Enum | — | Backend | N/A | N/A | Não | Não | Não | Sim | Backend | crm, desk, asaas, pesquisa |
| `nivel_acesso` | Enum | — | Desk | N/A | N/A | Não | Sim | Não | Sim | Desk | portal_proposta, workspace_cliente |
| `classificacao_acesso` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | publico_historico, cliente, interno, sensivel, restrito |
| `exige_consentimento` | Boolean | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | True se o dado exige consentimento do cliente |
| `consentimento_id` | UUID (FK) | — | CRM | N/A | N/A | Não | Não | Não | Sim | CRM | Vinculado a Consentimento (se aplicável) |
| `status_retencao` | Enum | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | ativo, arquivado, exclusao_pendente, excluido |
| `data_aprovacao` | Date | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Quando o campo foi aprovado para projeção |
| `aprovado_por` | String | — | Desk | N/A | N/A | Não | Não | Não | Sim | Desk | Quem aprovou a projeção |

---

## 4. Matriz de evidência e confiança (C)

### 4.1 Estados de validação

| Estado | Descrição | Cor semântica | Pode aparecer no App? |
|---|---|---|---|
| `informação_compartilhada_familia` | Dado fornecido pela família; sem validação documental | Cinza | Não como fato; apenas como "informação compartilhada pela família" |
| `dado_pesquisa_inicial` | Primeiro resultado de busca; sem conferência | Amarelo claro | Não como fato; "dado de pesquisa inicial" |
| `em_validacao_documental` | Em conferência com fonte primária | Amarelo | Sim, como "em confirmação" |
| `validado_por_documento` | Confirmado por documento oficial | Verde | Sim, como "identificado" |
| `pendente_confirmacao` | Não foi possível confirmar | Laranja | Sim, como "pendente de confirmação" |
| `nao_aplicavel` | Não se aplica | Neutro | Não |

### 4.2 Níveis de confiança

| Nível | Descrição | Critério | Uso |
|---|---|---|---|
| `alto` | Confiança alta | Validado por 2+ fontes independentes ou 1 documento oficial | Pode alimentar Projeção App e PDF |
| `medio` | Confiança média | Validado por 1 fonte secundária confiável | Pode alimentar Projeção App como "em confirmação" |
| `baixo` | Confiança baixa | Apenas 1 fonte não oficial ou dado familiar não confirmado | Não alimenta App; fica no Desk |
| `inicial` | Pesquisa inicial | Resultado de busca preliminar; sem validação | Não alimenta App; fica no Desk |

### 4.3 Matriz: tipo de evidência × nível de confiança × destino

| Tipo de evidência | Nível alto | Nível médio | Nível baixo | Nível inicial |
|---|---|---|---|---|
| Registro civil | App (validado) + PDF | App ("em confirmação") | Desk only | Desk only |
| Certidão | App (validado) + PDF | App ("em confirmação") | Desk only | Desk only |
| Lista de passageiros | App (resumo) + PDF | App ("em confirmação") | Desk only | Desk only |
| Registro paroquial | App (resumo) + PDF | App ("em confirmação") | Desk only | Desk only |
| Jornal/obituário | App (resumo) + PDF | Desk only | Desk only | Desk only |
| Documento familiar | PDF (aprovado) | Desk only | Desk only | Desk only |
| Correspondência | Desk only | Desk only | Desk only | Desk only |
| Foto histórica | PDF (aprovado) | Desk only | Desk only | Desk only |
| Dado de plataforma genealógica | Desk only | Desk only | Desk only | Desk only |

### 4.4 Regra de elevação de confiança

```
inicial → baixo:  pesquisador revisa e confirma que a fonte é legítima
baixo  → medio:   segunda fonte independente corrobora o dado
medio  → alto:    documento oficial valida o dado
```

Nenhum dado pula de `inicial` direto para `alto`. Cada elevação exige revisão humana e registro de responsável.

### 4.5 Regra de rebaixamento

Se uma fonte é descredibilizada (erro de transcrição, fonte não confiável), o nível de confiança é rebaixado e o estado muda para `pendente_confirmacao`. O App é atualizado para refletir "pendente de confirmação".

---

## 5. Inventário de bases genealógicas (D)

### 5.1 Estrutura de registro

Cada base no inventário segue a estrutura:

```
nome:                  [Nome da base]
pais:                  [País]
tipo_acervo:           [Tipo]
cobertura_temporal:    [Período coberto]
cobertura_geografica:  [Regiões cobertas]
acesso:                [Como acessar]
licenca_termos:        [Tipo de licença/termos de uso]
custo:                 [Gratuito, pago, assinatura]
api_disponivel:        [Sim/Não]
consulta_manual:       [Sim/Não]
scraping_permitido:    [Sim/Não/Com restrição]
autenticacao:          [Tipo de autenticação necessária]
dados_pessoais:        [Sim/Não — contém dados pessoais?]
risco_tecnico_juridico:[Baixo/Médio/Alto]
uso_recomendado:       [Para que serve no Clube Ancestral]
prioridade:            [Alta/Média/Baixa]
estado_aprovacao:      [Aprovada/Em análise/Pendente/Não aprovada]
```

### 5.2 Inventário — Itália

| # | Nome | País | Tipo de acervo | Cobertura temporal | Cobertura geográfica | Acesso | Licença/Termos | Custo | API? | Manual? | Scraping? | Autenticação? | Dados pessoais? | Risco | Uso recomendado | Prioridade | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| IT-01 | Portale Antenati (Archivio di Stato) | Itália | Arquivo nacional | 1809–1927 (varia por província) | Nacional | Online | A confirmar nos termos oficiais | Gratuito | A confirmar | Sim | **Exige revisão** — pendente de validação de termos | Conta gratuita | Sim | Médio | Registros civis de nascimento, casamento, óbito | Alta | Em análise |
| IT-02 | FamilySearch (índices e imagens italianas) | Itália | Plataforma genealógica | Varia | Nacional | Online | A confirmar nos termos oficiais | Gratuito (conta) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices e imagens de registros; validação interna; nunca citado no App | Alta | Pendente |
| IT-03 | Archivi di Stato (consulta presencial) | Itália | Arquivo nacional | Varia | Nacional | Presencial | A confirmar | Gratuito (taxas de cópia) | Não | Sim | Não aplicável | Documento de identidade | Sim | Baixo | Registros civis e paroquiais não digitalizados | Média | Em análise |
| IT-04 | Antenati / portale regional | Itália | Arquivo regional | 1809–1927 (varia) | Regional | Online | A confirmar nos termos oficiais | Gratuito | A confirmar | Sim | **Exige revisão** — pendente de validação de termos | A confirmar | Sim | Médio | Consulta de registros civil por região | Alta | Em análise |
| IT-05 | Comuni (registro civil online) | Itália | Arquivo municipal | Pós-unificação | Municipal | Online ou presencial | A confirmar — requer consentimento para dados pessoais | Varia | Não | Sim | **Proibido** — dados pessoais, requer consentimento | A confirmar | Sim | Alto | Certidões e registros civis contemporâneos | Média | Pendente |
| IT-06 | Paróquias (registros paroquiais) | Itália | Arquivo paroquial | Pré-1866 em diante | Local | Presencial / contato | A confirmar — requer autorização do pároco | Gratuito (doação) | Não | Sim | Não aplicável | Não | Sim | Baixo | Batismos, casamentos, óbitos pré-registro civil | Média | Pendente |
| IT-07 | Geneanet / MyHeritage (índices italianos) | Itália / Europa | Plataforma genealógica | Varia | Nacional | Online | A confirmar nos termos oficiais | Pago (assinatura) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices colaborativos; validar com fonte primária | Baixa | Pendente |

### 5.3 Inventário — Portugal

| # | Nome | País | Tipo de acervo | Cobertura temporal | Cobertura geográfica | Acesso | Licença/Termos | Custo | API? | Manual? | Scraping? | Autenticação? | Dados pessoais? | Risco | Uso recomendado | Prioridade | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PT-01 | Arquivo Nacional Torre do Tombo | Portugal | Arquivo nacional | Séculos XVI–XX | Nacional | Online (digitarq) + presencial | A confirmar nos termos oficiais | Gratuito | A confirmar | Sim | **Exige revisão** — pendente de validação | Conta | Sim | Médio | Registros paroquiais, civis, passaportes | Alta | Em análise |
| PT-02 | Arquivos Regionais (Porto, Coimbra) | Portugal | Arquivo regional | Varia | Regional | Online + presencial | A confirmar | Gratuito | Não | Sim | **Proibido** — dados pessoais, assumir proibido | A confirmar | Sim | Médio | Registros civis e paroquiais regionais | Média | Pendente |
| PT-03 | FamilySearch (índices portugueses) | Portugal | Plataforma genealógica | Varia | Nacional | Online | A confirmar nos termos oficiais | Gratuito (conta) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices de registros paroquiais e civis | Alta | Pendente |
| PT-04 | Arquivo Distrital (online) | Portugal | Arquivo regional | Varia | Distrital | Online | A confirmar nos termos oficiais | Gratuito | Não | Sim | **Exige revisão** — pendente de validação | A confirmar | Sim | Médio | Registros paroquiais digitalizados | Média | Em análise |
| PT-05 | Consulado/Embaixada (registros) | Portugal / Brasil | Arquivo consular | Séculos XIX–XX | Consular | Presencial / contato | A confirmar — requer autorização consular | Gratuito (taxas) | Não | Sim | Não aplicável | Documento de identidade | Sim | Alto | Registros de nascimento de portugueses no exterior | Baixa | Pendente |
| PT-06 | Hemeroteca (jornais históricos) | Portugal | Jornal/hemeroteca | Séculos XIX–XX | Nacional | Online | A confirmar nos termos oficiais | Gratuito | Não | Sim | **Permitido com revisão** — pendente de validação | Não | Não | Baixo | Obituários, notícias, anúncios | Baixa | Em análise |

### 5.4 Inventário — Croácia

| # | Nome | País | Tipo de acervo | Cobertura temporal | Cobertura geográfica | Acesso | Licença/Termos | Custo | API? | Manual? | Scraping? | Autenticação? | Dados pessoais? | Risco | Uso recomendado | Prioridade | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HR-01 | Croatian State Archives | Croácia | Arquivo nacional | Varia | Nacional | Presencial / online parcial | A confirmar nos termos oficiais | Gratuito (taxas) | Não | Sim | Não aplicável | Documento de identidade | Sim | Médio | Registros civis e paroquiais | Alta | Pendente |
| HR-02 | FamilySearch (índices croatas) | Croácia | Plataforma genealógica | Varia | Nacional | Online | A confirmar nos termos oficiais | Gratuito (conta) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices de registros | Alta | Pendente |
| HR-03 | Paróquias católicas (registros) | Croácia | Arquivo paroquial | Séculos XVIII–XX | Local | Presencial / contato | A confirmar — requer autorização do pároco | Gratuito (doação) | Não | Sim | Não aplicável | Não | Sim | Baixo | Batismos, casamentos, óbitos | Média | Pendente |
| HR-04 | Portal de imigração brasileiro (croatas) | Brasil | Imigração | Séculos XIX–XX | Nacional | Online + presencial | A confirmar nos termos oficiais | Gratuito | A confirmar | Sim | **Permitido com revisão** — pendente de validação | A confirmar | Não | Baixo | Listas de passageiros e imigração | Média | Em análise |
| HR-05 | Arquivos municipais | Croácia | Arquivo municipal | Varia | Municipal | Presencial | A confirmar | Gratuito (taxas) | Não | Sim | Não aplicável | Documento de identidade | Sim | Médio | Registros civis locais | Baixa | Pendente |

### 5.5 Inventário — Áustria

| # | Nome | País | Tipo de acervo | Cobertura temporal | Cobertura geográfica | Acesso | Licença/Termos | Custo | API? | Manual? | Scraping? | Autenticação? | Dados pessoais? | Risco | Uso recomendado | Prioridade | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AT-01 | Austrian State Archives (ÖStA) | Áustria | Arquivo nacional | Séculos XVIII–XX | Nacional | Online parcial + presencial | A confirmar nos termos oficiais | Gratuito (taxas) | A confirmar | Sim | **Exige revisão** — pendente de validação | Conta | Sim | Médio | Registros civis, militares, passaportes | Alta | Pendente |
| AT-02 | Matricula Online (paróquias) | Áustria | Arquivo paroquial | Séculos XVI–XX | Nacional | Online | A confirmar nos termos oficiais | Gratuito | A confirmar | Sim | **Exige API/licença** — a confirmar nos termos | A confirmar | Sim | Médio | Registros paroquiais católicos | Alta | Em análise |
| AT-03 | FamilySearch (índices austríacos) | Áustria | Plataforma genealógica | Varia | Nacional | Online | A confirmar nos termos oficiais | Gratuito (conta) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices de registros | Média | Pendente |
| AT-04 | Wienbibliothek / hemerotecas | Áustria | Jornal/hemeroteca | Séculos XIX–XX | Municipal (Viena) | Online | A confirmar nos termos oficiais | Gratuito | Não | Sim | **Permitido com revisão** — pendente de validação | Não | Não | Baixo | Notícias, obituários, anúncios | Baixa | Em análise |
| AT-05 | Arquivos regionais (Länder) | Áustria | Arquivo regional | Varia | Regional | Presencial / online parcial | A confirmar | Gratuito (taxas) | Não | Sim | Não aplicável | Documento de identidade | Sim | Médio | Registros regionais | Baixa | Pendente |

### 5.6 Inventário — Brasil (fontes auxiliares)

| # | Nome | País | Tipo de acervo | Cobertura temporal | Cobertura geográfica | Acesso | Licença/Termos | Custo | API? | Manual? | Scraping? | Autenticação? | Dados pessoais? | Risco | Uso recomendado | Prioridade | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BR-01 | Arquivo Nacional (Brasil) | Brasil | Arquivo nacional | Séculos XIX–XX | Nacional | Online + presencial | A confirmar nos termos oficiais | Gratuito | A confirmar | Sim | **Exige revisão** — pendente de validação | A confirmar | Sim | Médio | Passaportes, naturalizações, imigração | Alta | Em análise |
| BR-02 | Memorial do Imigrante (SP) | Brasil | Imigração | 1880–presente | Estadual (SP) | Online + presencial | A confirmar nos termos oficiais | Gratuito (taxas) | A confirmar | Sim | **Exige API/licença** — a confirmar nos termos | A confirmar | Sim | Médio | Listas de passageiros, registros de imigração | Alta | Em análise |
| BR-03 | Cartórios de registro civil | Brasil | Arquivo municipal | Pós-1875 (varia) | Municipal | Presencial / online | A confirmar — requer consentimento | Pago (taxas) | Não | Sim | **Proibido** — dados pessoais, requer consentimento | Documento de identidade | Sim | Alto | Certidões de nascimento, casamento, óbito | Média | Pendente |
| BR-04 | Arquivos da Igreja (paróquias no Brasil) | Brasil | Arquivo paroquial | Séculos XVIII–XX | Local | Presencial | A confirmar — requer autorização do pároco | Gratuito (doação) | Não | Sim | Não aplicável | Não | Sim | Baixo | Batismos, casamentos, óbitos | Média | Pendente |
| BR-05 | FamilySearch (índices brasileiros) | Brasil | Plataforma genealógica | Varia | Nacional | Online | A confirmar nos termos oficiais | Gratuito (conta) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices de registros brasileiros | Média | Pendente |
| BR-06 | Hemeroteca Nacional | Brasil | Jornal/hemeroteca | Séculos XIX–XX | Nacional | Online | A confirmar nos termos oficiais | Gratuito | Não | Sim | **Permitido com revisão** — pendente de validação | Não | Não | Baixo | Obituários, notícias, anúncios de imigração | Baixa | Em análise |

### 5.7 Inventário — Plataformas genealógicas (transversais)

| # | Nome | País | Tipo de acervo | Cobertura temporal | Cobertura geográfica | Acesso | Licença/Termos | Custo | API? | Manual? | Scraping? | Autenticação? | Dados pessoais? | Risco | Uso recomendado | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PG-01 | FamilySearch | Global | Plataforma genealógica | Varia | Global | Online | A confirmar nos termos oficiais | Gratuito (conta) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices e imagens; validar com primária; **nunca citar no App** | Pendente |
| PG-02 | MyHeritage | Global | Plataforma genealógica | Varia | Global | Online | A confirmar nos termos oficiais | Pago (assinatura) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices colaborativos; validar com primária | Pendente |
| PG-03 | Ancestry | Global | Plataforma genealógica | Varia | Global | Online | A confirmar nos termos oficiais | Pago (assinatura) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Médio | Índices e DNA; não aplicável sem plano | Pendente |
| PG-04 | Geneanet | Europa | Plataforma genealógica | Varia | Europa | Online | A confirmar nos termos oficiais | Pago (freemium) | A confirmar | Sim | **Proibido** — assumir proibido até validação | Conta | Sim | Baixo | Índices colaborativos europeus | Pendente |
| PG-05 | Find a Grave | Global | Cemitério | Varia | Global | Online | A confirmar nos termos oficiais | Gratuito | A confirmar | Sim | **Exige API/licença** — a confirmar nos termos | Conta | Não | Baixo | Localização de túmulos; validar | Pendente |

### 5.9 Política de acesso, consulta e automação

**Regra-base: proibido por padrão até termos/licença/risco serem aprovados.**

Nenhuma base é consultada automaticamente (scraping/API) sem validação humana prévia de seus termos de uso, licença, restrições técnicas e risco jurídico.

| Categoria | Descrição | Exemplos | Pré-requisito |
|---|---|---|---|
| **Permitido** | Consulta manual ou automática autorizada pelos termos da base, sem restrição de uso para pesquisa genealógica | Hemerotecas públicas com open access; bases governamentais com API pública e termos permissivos | Validação dos termos + registro na Ficha de Fonte |
| **Permitido somente com revisão** | Consulta permitida, mas cada resultado deve ser revisado por pesquisador antes de registrar como evidência | Arquivos nacionais com acesso online; portais regionais | Validação dos termos + workflow de revisão humana |
| **Proibido** | Scraping e/ou uso automatizado expressamente proibido pelos termos de uso ou por risco jurídico | FamilySearch, MyHeritage, Ancestry, Geneanet (termos de uso proíbem scraping); Cartórios (dados pessoais sem consentimento) | Assumir proibido até prova em contrário |
| **Exige API/licença** | Disponível apenas via API oficial ou licença comercial; verificar termos antes de qualquer uso | Find a Grave; Matricula Online; Memorial do Imigrante (se houver API) | Confirmar API/licença + registrar na Ficha de Fonte |
| **Exige consulta manual** | Acesso apenas presencial ou por contato direto; não há automação possível | Paróquias; Arquivos municipais; Consulado; Arquivos presenciais | Agendar visita ou contato; registrar resultado na Ficha de Fonte |
| **Exige consentimento/autorização** | Dados pessoais ou registros que exigem consentimento do titular ou autorização de terceiro | Cartórios de registro civil; dados de pessoas vivas; acervos familiares privados | Consentimento registrado na entidade Consentimento + base legal LGPD |

### 5.10 Regras adicionais de scraping

1. **Proibido por padrão:** Toda base é considerada proibida para scraping até validação humana de seus termos.
2. **Validação de termos:** Antes de qualquer consulta automatizada, o pesquisador responsável deve registrar na Ficha de Fonte: termos de uso lidos, data da leitura, permissão confirmada ou negada, e nome do validador.
3. **Rate limiting:** Mesmo bases permitidas devem respeitar rate limiting e não sobrecarregar o servidor.
4. **Sem dados sensíveis sem consentimento:** Nenhum scraping coleta dados pessoais sem consentimento registrado e base legal LGPD.
5. **Cache com expiração:** Resultados de consulta automatizada podem ser cacheados no backend com TTL definido por tipo de dado.
6. **Log obrigatório:** Toda consulta automatizada gera log de auditoria com timestamp, base consultada, parâmetros, e responsável.
7. **Busca negativa:** A ausência documentada de resultado ("nada encontrado") também é registrada como evidência do tipo `busca_negativa`.

| País | Bases mapeadas | Aprovadas | Em análise | Pendentes | Prioridade piloto |
|---|---|---|---|---|---|
| Itália | 7 | 0 | 4 | 3 | Alta |
| Portugal | 6 | 0 | 3 | 3 | Alta |
| Croácia | 5 | 0 | 1 | 4 | Média |
| Áustria | 5 | 0 | 2 | 3 | Média |
| Brasil (auxiliar) | 6 | 0 | 3 | 3 | Alta |
| Plataformas transversais | 5 | 0 | 0 | 5 | Baixa (validação, não fonte primária) |

---

## 6. Arquitetura backend → Desk → Projeção App (E)

### 6.1 Fluxo de dados

```
┌─────────────────────────────────────────────────────────────┐
│                    FONTES EXTERNAS AUTORIZADAS                │
│                                                              │
│  Arquivos civis · Paróquias · Arquivos nacionais ·           │
│  Plataformas genealógicas (validação, não citação) ·         │
│  Hemerotecas · Listas de passageiros · Acervos familiares    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │  Consulta autorizada (manual ou API)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND CA                              │
│                                                              │
│  • Normaliza dados de fontes heterogêneas                    │
│  • Gera IDs internos (Pessoa, Evento, Documento, etc.)       │
│  • Classifica tipo de dado, nível de confiança, estado       │
│  • Registra data e fonte de cada coleta                     │
│  • Não toma decisões de visibilidade                        │
│  • Nunca expõe token, API, URL interna                      │
│  • Cache de resultados (com TTL e expiração)                │
│  • Logs de auditoria (quem consultou, o quê, quando)        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │  Dados normalizados e classificados
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  BIBLIOTECA DE EVIDÊNCIAS                     │
│                                                              │
│  • Armazena evidências com fonte, data, país, tipo,          │
│    qualidade e responsável                                   │
│  • Mantém versões e histórico de alterações                 │
│  • Classifica dado sensível                                  │
│  • NUNCA alimenta o App diretamente                          │
│  • Acessível apenas pelo Desk/Pesquisa                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │  Evidências classificadas
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DESK / PESQUISA                            │
│                                                              │
│  • Valida evidências (eleva/rebaixa confiança)               │
│  • Aprova o que pode ser projetado ao App                    │
│  • Define regra de visibilidade por campo e por caso        │
│  • Gera entregas (diagnóstico, relatório, caderno)          │
│  • Define pendências e próximos passos                      │
│  • Registra responsável por cada validação                  │
│  • Revisa e aprova PDFs e one-pages                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │  Campos aprovados para projeção
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PROJEÇÃO APP CLIENTE (por caso)                  │
│                                                              │
│  • Camada intermediária — não é fonte de verdade             │
│  • Recebe apenas campos aprovados pelo Desk                  │
│  • Atualiza quando fonte interna muda de estado             │
│  • Dois níveis: Portal de Proposta / Workspace do Cliente    │
│  • Nunca armazena dados sensíveis sem LGPD operacional      │
│  • Nunca expõe fonte crua, API, token, hipótese              │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  DASHBOARD   │ │  ONE-PAGE    │ │     PDF      │
│  (App)       │ │  (WhatsApp)  │ │  (Relatório) │
│              │ │              │ │              │
│ Resumo,      │ │ Devolutiva   │ │ Síntese      │
│ estado,      │ │ personalizada│ │ aprovada,    │
│ próximo      │ │ de uma       │ │ aprofundada  │
│ passo        │ │ página       │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 6.2 Regras de cada camada

| Camada | Pode fazer | Não pode fazer |
|---|---|---|
| Fontes externas | Fornecer dados brutos | Alimentar o App diretamente |
| Backend CA | Normalizar, classificar, registrar, fazer cache | Decidir visibilidade; expor dados ao App |
| Biblioteca de Evidências | Armazenar, versionar, classificar | Alimentar o App diretamente |
| Desk/Pesquisa | Validar, aprovar projeção, gerar entregas | Publicar sem revisão humana |
| Projeção App Cliente | Exibir campos aprovados | Armazenar dados sensíveis sem LGPD |
| Dashboard/One-page/PDF | Mostrar síntese aprovada | Expor fonte crua, hipótese, SKU, preço |

### 6.3 Regra de auditoria

Toda ação no backend e no Desk gera um log com:
- `timestamp`
- `usuario` (pesquisador ou sistema)
- `acao` (consulta, validação, aprovação, projeção, rebaixamento)
- `entidade_id` (qual entidade foi afetada)
- `campo_afetado` (se aplicável)
- `valor_anterior` / `valor_novo` (se aplicável)
- `fonte_origem` (qual fonte gerou a alteração)

Logs são acessíveis apenas no Desk, nunca no App.

---

## 7. Matriz entrega → dashboard → one-page → PDF → interno (F)

### 7.1 Cinco bibliotecas cliente-facing

| Biblioteca | Foco | Tipo de conteúdo |
|---|---|---|
| Pesquisa | Progresso e achados da pesquisa genealógica | Estado de validação, resumo de achados, pendências documentais |
| Cidadania | Informação sobre processo de cidadania (sem promessa) | Conteúdo educativo: contexto histórico, marcos do processo, estados sem prazo, sem garantia, sem rota jurídica definida e sem percentual de elegibilidade. **Sempre educativo, nunca conclusivo.** |
| Memória | Memória familiar e narrativas | Relatos documentados, fotos históricas (com consentimento), contextos de migração |
| Legado | Encontros de linhagem e pertencimento | Caderno de Encontros, contexto histórico, práticas culturais documentadas |
| Vida prática | Orientações práticas | Próximos passos, organização documental, dicas de coleta familiar |

### 7.2 Matriz de destino por tipo de conteúdo

| Conteúdo (tipo) | Dashboard (App) | One-page (WhatsApp) | PDF (Relatório) | Desk (interno) | Biblioteca destino |
|---|---|---|---|---|---|
| Estado de validação de evidência | Sim (resumo) | Sim (uma linha) | Não | Sim (detalhado) | Pesquisa |
| Achado de pesquisa validado | Sim (resumo) | Sim (resumo) | Sim (aprovado) | Sim (com fonte) | Pesquisa |
| Achado de pesquisa não validado | Não | Não | Não | Sim | Pesquisa (interno) |
| Pendência documental | Sim (status) | Sim (resumo) | Sim (lista) | Sim (detalhado) | Pesquisa |
| Próximo passo | Sim | Sim | Sim | Sim | Pesquisa |
| Linha familiar validada | Sim (resumo) | Sim (resumo) | Sim (aprovado) | Sim (com fonte) | Pesquisa |
| Linha familiar não validada | Não | Não | Não | Sim | Pesquisa (interno) |
| Árvore familiar | Sim (nomes validados) | Não | Sim (aprovado) | Sim (com fonte) | Pesquisa |
| Variante de nome | Sim ("em confirmação") | Não | Sim (aprovado) | Sim | Pesquisa |
| Contexto histórico | Não | Não | Sim (aprovado) | Sim | Memória / Legado |
| Memória familiar | Não | Não | Sim (com consentimento) | Sim | Memória |
| Caderno de Encontros | Não | Não | Sim (aprovado) | Sim (rascunho) | Legado |
| Relatório de Fase 01 | Não (entrega liberada no App) | Não | Sim (aprovado) | Sim (completo) | Pesquisa |
| Relatório de Fase 02 | Não (menção como possível) | Não | Sim (aprovado) | Sim (completo) | Pesquisa |
| Síntese familiar | Sim (resumo) | Sim | Sim | Sim | Pesquisa |
| Orientação de próximo passo prático | Sim | Sim | Não | Sim | Vida prática |
| Informação sobre cidadania | Não | Não | Sim (educativo) | Sim | Cidadania |
| Fonte de pesquisa crua | **Nunca** | **Nunca** | **Nunca** | Sim | — |
| Hipótese jurídica | **Nunca** | **Nunca** | **Nunca** | Sim | — |
| SKU, preço, contrato | **Nunca** | **Nunca** | **Nunca** | Sim (Desk/CRM) | — |
| Dados pessoais (RG, CPF, etc.) | **Nunca** | **Nunca** | **Nunca** | Sim (CRM) | — |
| Matching interno | **Nunca** | **Nunca** | **Nunca** | Sim | — |
| Log de auditoria | **Nunca** | **Nunca** | **Nunca** | Sim | — |

### 7.3 Regra de liberação de entrega

```
1. Conteúdo produzido no Desk (rascunho)
2. Revisão humana do responsável
3. Aprovação de conteúdo (conteudo_aprovado = true)
4. Definição de biblioteca destino
5. Projeção para App (se aplicável) ou geração de PDF (se aplicável)
6. Publicação com data de liberação
7. Log de auditoria registrado
```

Nenhuma entrega é publicada sem `conteudo_aprovado = true` e `data_aprovacao` registrada.

### 7.4 Matriz entrega → jornada → oferta existente

Esta matriz garante que toda entrega percebida pelo cliente seja mapeada a uma etapa da jornada e a uma família de oferta existente, sem criar SKU para cada PDF, insight ou card.

| Entrega percebida | Etapa da jornada | Biblioteca destino | Família de oferta existente | Condição de liberação | Status comercial |
|---|---|---|---|---|---|
| Diagnóstico inicial (Fase 01) | Leitura da linha familiar | Pesquisa | Pesquisa genealógica — Fase 01 | Pagamento confirmado + onboarding iniciado | Oferta existente |
| Relatório de pesquisa (Fase 02) | Aprofundamento de pesquisa | Pesquisa | Pesquisa genealógica — Fase 02 | Proposta aceita + formalização concluída | Oferta existente (possível aprofundamento) |
| Síntese familiar validada | Após validação documental | Pesquisa | Inclusa na Fase 01/02 | `validado_por_documento` + revisão aprovada | Incluso na entrega |
| Caderno de Encontros de Linhagem | Pós-entrega de Fase 01 | Legado | Incluso na Fase 01 (ou oferta separada se lacuna) | `conteudo_aprovado = true` + consentimento | Se lacuna: `PROPOSTA_PENDENTE_DE_APROVAÇÃO` |
| One-page de devolutiva | Pré-proposta | Pesquisa | Pré-comercial (gratuito) | Dados validados + aprovação do responsável | Pré-comercial |
| Estado de documentos (status) | Durante toda a jornada | Pesquisa | Incluso na jornada | Fonte interna correspondente | Incluso na entrega |
| Radar de quatro eixos | Durante toda a jornada | Pesquisa | Incluso na jornada | Dados aprovados para projeção | Incluso na entrega |
| Contexto histórico (educativo) | Pós-Fase 01 | Memória / Cidadania | Incluso na Fase 01 (ou oferta separada) | `conteudo_aprovado = true` | Se lacuna: `PROPOSTA_PENDENTE_DE_APROVAÇÃO` |
| Memória familiar (relato) | Pós-consentimento | Memória | Incluso na jornada (se consentido) | Consentimento registrado + aprovação | Incluso na entrega |
| Orientação de próximo passo prático | Durante toda a jornada | Vida prática | Incluso na jornada | Sempre disponível | Incluso na entrega |

### 7.5 Regra de lacuna comercial

Se uma entrega percebida pelo cliente não se encaixa em nenhuma família de oferta existente:

1. Marcar como `PROPOSTA_PENDENTE_DE_APROVAÇÃO` no Desk
2. Não criar SKU automático
3. Não prometer ao cliente
4. Encaminhar para decisão comercial humana
5. Só após aprovação comercial: criar oferta formal e liberar entrega

Nenhum PDF, insight, card ou relatório gera SKU automaticamente.

---

## 8. Modelo seguro de Caderno de Encontros de Linhagem (G)

### 8.1 Objetivo

O Caderno de Encontros de Linhagem é uma entrega narrativa que contextualiza a história familiar do cliente dentro de um quadro histórico, cultural e migratório, sem atribuir personalidade, destino ou características psicológicas a nacionalidades ou linhagens.

### 8.2 Estrutura do Caderno

```
CADERNO DE ENCONTROS DE LINHAGEM
════════════════════════════════

case_id:               [UUID interno]
cliente:               [Nome validado]
linha_familiar:        [Nome da linha]
pais_contexto:         [País de origem]
responsavel:           [Pesquisador]
data_aprovacao:        [Data]
status:                [rascunho | em_revisao | aprovado | publicado]
biblioteca_destino:    legado

SEÇÕES:

1. Contexto histórico do ramo
   - Período histórico da linha familiar
   - Eventos históricos relevantes (imigração, guerras, migrações)
   - Apenas contexto factual documentado

2. Territórios e períodos migratórios
   - De onde para onde a linhagem migrou
   - Períodos aproximados (se validados)
   - Rotas migratórias conhecidas

3. Memória familiar documentada
   - Relatos orais ou escritos da família
   - Apenas com consentimento registrado
   - Marcados como "memória familiar" (não fato verificado)

4. Práticas culturais relatadas
   - Tradições, festas, costumes documentados
   - Atribuídos à época/região, não à personalidade
   - Sem inferência psicológica

5. Encontros de linhagem no Brasil
   - Onde a linhagem se estabeleceu no Brasil
   - Comunidades, bairros, cidades
   - Adaptação e integração

6. Forças e repertórios observados em narrativas
   - Padrões narrativos documentados na família
   - Sem atribuir personalidade ou destino
   - Sem diagnóstico ou rótulo
   - Ex.: "famílias desta região frequentemente mantinham
          vínculos comunitários próximos" — não "italianos são
          familiares"

DISCLAIMER (obrigatório, em todas as páginas):

"Este conteúdo é educativo e narrativo. Não substitui
acompanhamento terapêutico, psicológico ou médico."
```

### 8.3 Regras de conteúdo

| Regra | Descrição |
|---|---|
| Sem personalidade | Não atribuir características de personalidade a nacionalidade, etnia ou linhagem |
| Sem destino | Não sugerir que a linhagem determina o futuro ou comportamento |
| Sem diagnóstico | Nenhum termo psicológico, terapêutico ou médico |
| Sem cura/trauma | Não usar "cura ancestral", "trauma transgeracional", "terapia sistêmica" |
| Factual | Contexto histórico baseado em fontes documentadas |
| Consentido | Memória familiar só com consentimento registrado |
| Aprovado | Todo conteúdo passa por revisão humana antes de publicação |
| Biblioteca | Publicado na biblioteca "Legado" |

### 8.4 Campos proibidos no Caderno

- Diagnóstico psicológico ou psiquiátrico
- "Constelação familiar" ou "terapia sistêmica"
- "Cura ancestral" ou "trauma transgeracional"
- Associação de nacionalidade a comportamento
- Sugestão de que linhagem determina destino
- Dados pessoais sem consentimento
- Fontes cruas ou FamilySearch citadas
- Hipóteses jurídicas
- Promessa de cidadania ou reconhecimento

### 8.5 Fluxo de aprovação do Caderno

```
1. Pesquisador redige rascunho no Desk
2. Revisão de linguagem (sem termos proibidos)
3. Revisão de conteúdo (factual, consentido)
4. Aprovação do responsável
5. Geração de PDF aprovado
6. Publicação na biblioteca "Legado"
7. Projeção no App (se aplicável — apenas menção de disponibilidade)
```

---

## 9. Backlog 5A e 5B (H)

### 9.1 Backlog 5A — Estrutura de dados, fichas, bases e regras

| # | Item | Categoria | Descrição | Prioridade | Dependências |
|---|---|---|---|---|---|
| 5A-01 | Schema de banco de dados | Dados e modelos | Definir schema SQL/NoSQL para as 13 entidades | Alta | Aprovação deste documento |
| 5A-02 | Ficha de Pesquisa por Caso | Dados e modelos | Implementar formulário/template da Ficha de Caso no Desk | Alta | 5A-01 |
| 5A-03 | Ficha de Fonte/Base | Dados e modelos | Implementar formulário/template de Ficha de Fonte no Desk | Alta | 5A-01 |
| 5A-04 | Enum de estados de validação | Dados e modelos | Implementar os 6 estados como enum no schema | Alta | 5A-01 |
| 5A-05 | Enum de níveis de confiança | Dados e modelos | Implementar 4 níveis (alto, medio, baixo, inicial) | Alta | 5A-01 |
| 5A-06 | Regra de elevação/rebaixamento | Dados e modelos | Implementar lógica de transição de níveis com log | Alta | 5A-04, 5A-05 |
| 5A-07 | Regra de visibilidade por campo | Dados e modelos | Implementar `regra_visibilidade` com 5 valores | Alta | 5A-01 |
| 5A-08 | Inventário de bases — preenchimento | Pesquisa manual | Preencher fichas de fonte para as bases aprovadas no piloto | Alta | 5A-03, aprovação piloto |
| 5A-09 | Caderno de Encontros — template | Dados e modelos | Criar template de Caderno no Desk | Média | 5A-01 |
| 5A-10 | Cinco bibliotecas cliente-facing | Dados e modelos | Definir estrutura das 5 bibliotecas (Pesquisa, Cidadania, Memória, Legado, Vida prática) | Média | 5A-01 |
| 5A-11 | Matriz de destino de conteúdo | Dados e modelos | Implementar regra de qual conteúdo vai para Dashboard/One-page/PDF/Desk | Média | 5A-07, 5A-10 |
| 5A-12 | Modelo de Consentimento | Dados e modelos | Implementar entidade Consentimento com tipos e estados | Alta | 5A-01, LGPD |
| 5A-13 | Disclaimer obrigatório | Dados e modelos | Garantir disclaimer em todo conteúdo narrativo | Média | 5A-09 |
| 5A-14 | Glossário de termos permitidos/proibidos | Dados e modelos | Lista verificável de termos seguros e proibidos | Média | — |

### 9.2 Backlog 5B — Permissões, APIs, backend, cache, logs, integrações e revisão humana

| # | Item | Categoria | Descrição | Prioridade | Dependências |
|---|---|---|---|---|---|
| 5B-01 | Sistema de autenticação Desk | Interface Desk | Login com roles (pesquisador, responsável, admin) | Alta | LGPD operacional |
| 5B-02 | Sistema de permissões por campo | Interface Desk | Controle de quem pode ver/editar cada campo | Alta | 5B-01, 5A-07 |
| 5B-03 | API backend — consulta de fontes | Automações permitidas | API interna para consultar fontes autorizadas (com cache) | Média | 5A-08, 5B-01 |
| 5B-04 | Cache de resultados de fonte | Automações permitidas | Redis ou equivalente com TTL e expiração | Média | 5B-03 |
| 5B-05 | Logs de auditoria | Integrações | Sistema de log para toda ação no backend e Desk | Alta | 5B-01 |
| 5B-06 | Workflow de revisão humana | Interface Desk | Fluxo: rascunho → revisão → aprovação → publicação | Alta | 5B-02 |
| 5B-07 | Projeção App Cliente — motor | Integrações | Serviço que projeta campos aprovados para o App | Alta | 5B-06, 5A-11 |
| 5B-08 | Portal de Proposta — acesso | Interface App | Implementar Nível 1 com `opportunity_id`/`proposal_id` | Média | 5B-07, CRM |
| 5B-09 | Workspace do Cliente — acesso | Interface App | Implementar Nível 2 com `case_id` + regra operacional | Média | 5B-07, 5B-01 |
| 5B-10 | Gerador de PDF aprovado | Interface App | Sistema de geração de PDF a partir de relatório aprovado | Média | 5B-06 |
| 5B-11 | Gerador de one-page | Interface App | Sistema de geração de one-page a partir de campos aprovados | Média | 5B-07 |
| 5B-12 | Integração Asaas (status financeiro) | Integrações | Receber apenas status reconciliado (pagamento pendente/confirmado) | Baixa | 5B-07, proposta formal |
| 5B-13 | Integração CRM — sync de proposta | Integrações | Sincronizar status de proposta do CRM para a Projeção | Baixa | 5B-07, CRM |
| 5B-14 | Validação de termos proibidos | Interface Desk | Checker automático que flag termos proibidos em conteúdo narrativo | Média | 5A-14 |
| 5B-15 | Notificação de pendência | Interface Desk | Alertar pesquisador sobre pendências e prazos internos | Baixa | 5B-05 |
| 5B-16 | Dashboard de saúde de pesquisa | Interface Desk | Visão interna de progresso de pesquisa por caso | Baixa | 5B-05 |
| 5B-17 | Backup e retenção | Integrações | Política de backup e retenção de dados (alinhada com LGPD) | Alta | LGPD |
| 5B-18 | Exportação de auditoria | Interface Desk | Exportar logs de auditoria para revisão externa | Baixa | 5B-05 |

---

## 10. Riscos e decisões humanas pendentes (I)

### 10.1 Riscos identificados

| # | Risco | Categoria | Severidade | Mitigação |
|---|---|---|---|---|
| R-01 | Exposição de fonte crua no App | Segurança de dados | Alta | Projeção App nunca exibe fonte; apenas Desk tem acesso |
| R-02 | Uso de FamilySearch como fonte citada | Conformidade | Alta | FamilySearch é apenas validação interna; nunca citada no App ou PDF |
| R-03 | Scraping sem licença | Legal | Alta | Política de scraping proíbe scraping sem licença; consultar termos de cada base |
| R-04 | Dados pessoais sem LGPD | Legal | Crítica | Nenhum dado pessoal é exibido/coletado sem LGPD operacional |
| R-05 | Conteúdo narrativo com termos terapêuticos | Linguagem/marca | Média | Checker de termos proibidos; revisão humana obrigatória |
| R-06 | Evidência não validada exibida como fato | Qualidade | Alta | Estados de validação obrigatórios; App só exibe "validado" ou "em confirmação" |
| R-07 | Criação de SKU para cada entrega | Comercial | Média | Regra: entrega percebida → jornada → oferta existente; lacuna = PROPOSTA_PENDENTE |
| R-08 | Base de dados desconectada do Desk | Operacional | Média | Arquitetura: Backend → Biblioteca → Desk → Projeção (sem atalhos) |
| R-09 | Consentimento não registrado para memória familiar | Legal | Alta | Entidade Consentimento obrigatória; nenhum relato sem consentimento_id |
| R-10 | Acesso ao Desk sem autenticação | Segurança | Alta | Backlog 5B-01: sistema de autenticação com roles |
| R-11 | Cache de dados sensíveis expirando mal | Técnico | Média | TTL e expiração definidos por tipo de dado |
| R-12 | Operação paralela desconectada por país | Operacional | Média | Mesmo schema, mesmas entidades, mesmas regras — varia apenas conteúdo das fontes |

### 10.2 Decisões humanas pendentes

| # | Decisão | Área | Impacto | Bloqueia |
|---|---|---|---|---|
| D-01 | Aprovar quais bases do piloto (IT e PT) podem ser consultadas | Pesquisa | Define o escopo do piloto | 5A-08, 5B-03 |
| D-02 | Validar termos de uso de cada base antes de consulta | Legal | Define scraping permitido/proibido | 5B-03, 5B-04 |
| D-03 | Aprovar política final de LGPD | Legal | Libera coleta e exibição de dados pessoais | 5B-01, 5B-09, 5B-12 |
| D-04 | Definir base legal e finalidade por categoria de dado | Legal | Define quais dados podem ser processados | 5A-12 |
| D-05 | Aprovar regras de retenção, exclusão e arquivamento | Legal | Define ciclo de vida dos dados | 5B-17 |
| D-06 | Escolher 2 nacionalidades para o piloto | Comercial/Pesquisa | Define foco inicial | 5A-08 |
| D-07 | Aprovar glossário de termos permitidos/proibidos | Linguagem | Define checker de conteúdo | 5A-14, 5B-14 |
| D-08 | Decidir se o Caderno de Encontros entra no piloto | Produto | Define escopo de entrega | 5A-09 |
| D-09 | Aprovar regra operacional do Workspace do Cliente por caso | Produto | Define acesso ao Nível 2 | 5B-09 |
| D-10 | Validar se há lacuna comercial real que exige novo produto | Comercial | Define se PROPOSTA_PENDENTE é necessário | — |

### 10.3 Pré-requisitos para iniciar pesquisa operacional

Antes de qualquer pesquisa rastreável iniciar, os seguintes itens devem estar concluídos:

1. **LGPD operacional** (D-03, D-04, D-05) — sem isso, nenhum dado pessoal pode ser coletado
2. **Bases aprovadas** (D-01, D-02) — sem isso, nenhuma consulta a fonte externa
3. **Schema de banco aprovado** (5A-01) — sem isso, não há estrutura para registrar evidências
4. **Sistema de autenticação do Desk** (5B-01) — sem isso, não há controle de quem valida
5. **Workflow de revisão humana** (5B-06) — sem isso, não há aprovação de conteúdo
6. **Glossário aprovado** (D-07) — sem isso, não há controle de linguagem segura
7. **2 nacionalidades escolhidas** (D-06) — sem isso, não há foco de pesquisa

---

*Documento de modelagem e arquitetura — Bloco 5A. Não foram integradas APIs, não foi executado scraping, não foram criados SKUs, não foram alterados sistemas externos. Toda decisão de implementação depende de aprovação humana e LGPD operacional.*
