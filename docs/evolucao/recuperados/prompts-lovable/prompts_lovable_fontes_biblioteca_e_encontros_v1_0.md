# Clube Ancestral — Prompts Lovable: Fontes, Biblioteca, Projeções e Encontros de Linhagem

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Uso:** aplicar em cortes sequenciais e validar cada gate antes do próximo.  
**Pré-requisito:** navegação móvel acessível e persistência de Casos funcionando.

---

## Ordem de aplicação

1. Prompt 1 — Biblioteca de Evidências e Projeções.
2. Prompt 2 — Catálogo de Bases Genealógicas 5B-Pre.
3. Prompt 3 — Ficha Piloto Genealógica v1.1 e árvore.
4. Prompt 4 — Encontros de Linhagem e template estático.
5. Prompt 5 — Radar, Marcos Jurídicos e Visão Geral ampliada.

Não aplicar dois prompts no mesmo ciclo sem validar o anterior.

---

## Prompt 1 — Biblioteca de Evidências e Projeções

```text
IMPLEMENTAR A BIBLIOTECA DE EVIDÊNCIAS E PROJEÇÕES AUTORIZADAS.

NÃO INICIAR API, SCRAPING, PESQUISA EXTERNA, PEDIDOS, CONTATOS INSTITUCIONAIS, MENSAGENS, PUBLICAÇÕES AUTOMÁTICAS, COBRANÇAS OU CONTRATOS.

Arquitetura obrigatória:
Fonte/material → Biblioteca de Evidências → Desk/Pesquisa → Projeção autorizada → App/One-page/PDF aprovado.

Criar/ajustar entidades:
- research_sources
- evidences
- evidence_validations
- name_variants
- app_projections
- report_evidence_links

Evidência deve ter:
- estado epistemológico: INFORMACAO_COMPARTILHADA_FAMILIA, DADO_PESQUISA_INICIAL, EM_VALIDACAO_DOCUMENTAL, VALIDADO_POR_DOCUMENTO, PENDENTE_CONFIRMACAO, NAO_APLICAVEL;
- nível de confiança: INICIAL, BAIXO, MEDIO, ALTO;
- responsável e data de validação;
- tipo documental;
- país/localidade;
- classificação de acesso;
- consentimento quando aplicável;
- retenção;
- destinos permitidos.

Não permitir salto automático de INICIAL para ALTO.
Busca negativa deve existir como evidência válida.

Criar app_projections com entidade-fonte, case opcional, destination (app, one_page, pdf_aprovado), conteúdo sanitizado, aprovação, aprovador, data e vigência.

Regras:
- App não lê evidência/fonte diretamente.
- Fonte crua, URL interna, documentos, hipótese, risco, score, terceiro e logs nunca vão ao cliente.
- Toda projeção exige aprovação humana.
- Relatórios F1/F2 referenciam evidências sem duplicar dados.

Criar testes de estado, confiança, busca negativa, projeção bloqueada sem aprovação e isolamento de fonte no App.
```

---

## Prompt 2 — Catálogo de Bases Genealógicas 5B-Pre

```text
IMPLEMENTAR BLOCO 5B-PRE — FONTES E INTEGRAÇÕES GENEALÓGICAS EM MODO DE GOVERNANÇA.

NÃO IMPLEMENTAR SCRAPING, API, CREDENCIAL, CONSULTA EXTERNA, PESQUISA EXTERNA, CONTATO INSTITUCIONAL, COMUNICAÇÃO OU PUBLICAÇÃO.

Criar módulo interno “Fontes e Integrações Genealógicas”.

Criar genealogical_sources_catalog com:
- nome, pais_eixo, citizenship_track_id, tipo_de_acervo, cobertura_temporal, cobertura_geografica, nivel_de_fonte, acesso, licenca_termos, custo, autenticacao_necessaria, trata_dados_pessoais, risco, uso_recomendado, prioridade, modo_de_uso_permitido, scraping_status, ultima_verificacao, status_documentacao, status_integracao, proxima_acao, observacao_risco, responsavel_revisao, data_origin.

Modos permitidos:
- manual
- metadados_linkout
- api_validada
- parceria
- restrito
- nao_validado

Scraping é apenas campo de vedação:
- proibido_por_padrao
- exige_validacao_juridica_tecnica
- nao_aplicavel

Criar maturidade:
CATALOGADA, DOCUMENTADA, TERMOS_A_CONFIRMAR, ELEGIVEL_PARA_PILOTO, PILOTO_INTERNO, HOMOLOGADA_MANUAL, HOMOLOGADA_API, RESTRITA, DESCONTINUADA.

Criar source_evaluation_matrix e sources_activation_backlog.

Permitir vínculo de fonte a pesquisa/pessoa/documento/evidência/achado/plano de ação sem consultar a fonte.

Criar source_access_logs apenas como estrutura futura; não criar acesso real.

Testar que fonte catalogada não habilita consulta automática, fonte restrita não aparece em sugestões e fonte manual pode ser vinculada sem chamada externa.
```

---

## Prompt 3 — Ficha Piloto Genealógica v1.1 e árvore

```text
IMPLEMENTAR FICHA PILOTO GENEALÓGICA V1.1 E ÁRVORE DERIVADA DE EVIDÊNCIAS.

NÃO INICIAR PESQUISA EXTERNA, PEDIDO DE DOCUMENTO, CONTATO, PUBLICAÇÃO OU ALTERAÇÃO DE DADOS EXTERNOS.

Dentro de Pesquisa e Evidências, criar Pessoas e Linhagens:
- Perfil Genealógico 360°
- Relações e Árvore
- Linhagens
- Linha do Tempo
- Documentos e Evidências
- Eventos e Contexto
- Lacunas e Próximas Pesquisas

Criar/ajustar:
- research_people
- genealogical_person_profiles
- genealogical_relationships
- lineage_paths
- genealogical_events
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

Relações não usam Filho 1/2 ou Irmão 1/2. Cada relação é um registro com pessoa origem, destino, tipo, período/localidade, status, evidência, fonte e visibilidade.

A árvore interna mostra Confirmado, Provável, Hipótese e Pendente. App mostra somente relações/fatos sanitizados e aprovados.

Criar name_variants para grafia, tradução, italianização, aportuguesamento, apelido, erro documental, nome religioso e outro.

Linha dupla pode coexistir no mesmo caso sem duplicar pessoa ou caso.

Eventos alimentam linha do tempo interna; evento confirmado exige evidência.

Criar testes de pessoa, relação com evidência, linha dupla, evento, variante sem duplicação e bloqueio de hipótese no App.
```

---

## Prompt 4 — Encontros de Linhagem e modelo estático

```text
IMPLEMENTAR ENCONTROS DE LINHAGEM NO DESK E SUA PROJEÇÃO APROVADA NO APP CLIENTE.

NÃO PUBLICAR NADA AUTOMATICAMENTE, NÃO ENVIAR MENSAGEM, NÃO AFIRMAR VÍNCULO SEM EVIDÊNCIA, NÃO USAR LINGUAGEM TERAPÊUTICA, DETERMINISTA OU ESPIRITUAL.

NO DESK:
Localização: Pesquisa e Evidências → Pessoas e Linhagens → Encontros de Linhagem.

Criar lineage_encounters com:
- case_id
- family_id
- lineage_path_a_id
- lineage_path_b_id
- encounter_type
- title_internal
- title_client
- contexto_historico
- territorios_migratorios
- memoria_familiar
- praticas_culturais_documentadas
- encontros_no_brasil
- repertorios_narrativos
- resumo_interno
- resumo_aprovado_cliente
- evidence_links
- confidence_internal
- validation_status
- tree_impact
- timeline_impact
- disclaimer_obrigatorio
- approval_status
- client_deliverable_id
- responsible_user_id
- data_marco

Tipos:
- Conexão confirmada
- Convergência documental
- Separação de ramos
- Linha paralela relevante
- Dupla linhagem familiar
- Marco de origem

NO APP CLIENTE:
Não criar nova aba principal.
Exibir somente quando houver app_projection/client_deliverable publicada em:
Jornada do Cliente → Entregas da Jornada → História e Linhagens → Encontro de Linhagem.

Modelo estático de projeção:
1. Título aprovado
2. Contexto histórico
3. Territórios migratórios
4. Memória familiar
5. Práticas culturais documentadas
6. Encontros no Brasil
7. Próximo passo
8. Disclaimer

Proibições:
- Sem “cura ancestral”, “destino familiar”, “karma”, “trauma herdado”, “verdadeira identidade”, promessas espirituais ou comportamento derivado de ancestralidade.
- Não afirmar parentesco por sobrenome/localidade.
- Não mostrar fonte crua, URL, confiança interna, hipótese ou dado de terceiro.

Criar teste: encontro sem evidência/disclaimer não publica; encontro aprovado cria apenas rascunho de projeção.
```

---

## Prompt 5 — Radar, Marcos e Visão Geral ampliada

```text
IMPLEMENTAR RADAR INTERNO, MARCOS JURÍDICOS E VISÃO GERAL AMPLIADA.

NÃO CALCULAR ELEGIBILIDADE FINAL, NÃO GERAR PRAZO JURÍDICO AUTOMÁTICO, NÃO CRIAR COBRANÇA, COMUNICAÇÃO, PESQUISA EXTERNA OU PUBLICAÇÃO.

Criar Radar por caso com eixos:
- Estrutura familiar
- Linha de transmissão
- Evidência documental
- Marco jurídico
- Via preliminar
- Risco de ruptura
- Autorização de pesquisa
- Formalização
- Financeiro
- Jornada do cliente

Estados: Regular, Atenção, Crítico, Pendente, Não aplicável.
Cada estado deve apontar para dados que o originaram e próxima ação vinculada.

Criar Biblioteca Base → Marcos Jurídicos com:
- país/trilha
- marco jurídico
- fonte oficial
- status de atualização
- última verificação
- responsável
- revisão humana/jurídica
- casos impactados
- urgência
- próxima revisão

Expandir Visão Geral com KPIs comerciais, operacionais, pesquisa, jornada, jurídico, financeiro e higiene de dados. Cada KPI abre lista filtrada. Ausência de fonte deve mostrar “Sem dado” ou “Pendente de fonte”, não zero.

Nunca mostrar radar, risco, hipótese, score ou marco interno no App Cliente.
```
