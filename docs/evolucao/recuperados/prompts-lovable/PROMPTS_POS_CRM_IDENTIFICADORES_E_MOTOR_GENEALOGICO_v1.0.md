# Prompts pós-CRM — identificadores canônicos e motor genealógico

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Roteiro executável após o CRM/Família já enfileirado no Lovable  
**Regra:** executar um prompt por vez, validar o gate e registrar resultado antes do próximo.

---

## 1. Ordem de execução

O pacote CRM/Família já está na fila do Lovable. Após ele, executar nesta ordem:

| Ordem | ID | Prompt | Finalidade | Dono primário |
|---:|---|---|---|---|
| 1 | G-01 | Identificadores canônicos | Estabilizar IDs de caso, lead, aliases e deck Canva | Claude Code; Lovable só se limitar a UI |
| 2 | G-02 | Ficha Piloto Genealógica | Pessoas, relações, variantes, linhagens, árvore e timeline | Claude Code + Lovable visual |
| 3 | G-03 | Biblioteca de Evidências | Fonte → evidência → validação → projeção autorizada | Claude Code + Lovable visual |
| 4 | G-04 | Pesquisa, documentos e solicitações | Operação documental e ligação pessoa/fonte/evidência | Claude Code + Lovable visual |
| 5 | G-05 | Relatórios F1/F2 | Conectar relatórios existentes, sem duplicar | Claude Code + Lovable visual |
| 6 | G-06 | Achados e Encontros de Linhagem | Converter evidência validada em achado, árvore/timeline e entrega aprovada | Claude Code + Lovable visual |
| 7 | G-07 | Plano de ação e instituições | Rechecagens, ações de pesquisa e estimativas de terceiros | Claude Code + Lovable visual |
| 8 | G-08 | Bases genealógicas 5B-Pre | Catálogo de fontes e governança, sem API/scraping | Claude Code + Lovable visual |

### Regra de parada

- Não iniciar G-02 sem a confirmação do CRM/Família de que Caso → Núcleo → Pessoa salva e recarrega corretamente.
- Não iniciar G-03 sem pessoas e relações persistentes.
- Não iniciar G-04 sem Biblioteca de Evidências.
- Não iniciar G-05 sem evidências e pendências vinculáveis.
- Não iniciar G-06 sem linhagens, evidências e projeções autorizadas.
- Não iniciar G-07 sem solicitações documentais e próximas ações.
- Não iniciar G-08 se houver necessidade de pesquisa externa ativa; este corte é apenas de governança.

---

## 2. G-01 — Identificadores canônicos

> **Canal recomendado:** Claude Code/GitHub. Use no Lovable apenas se ele puder aplicar exclusivamente telas/validações visuais sem tocar em IDs reais.  
> **Não renomear casos existentes em produção neste corte.**

```text
[ID G-01] IMPLEMENTAR A NORMA DE IDENTIFICADORES CANÔNICOS DO CLUBE ANCESTRAL.

NÃO RENOMEAR CASOS REAIS EXISTENTES.
NÃO ALTERAR PROPOSTAS, CONTRATOS, COBRANÇAS, ASSINATURAS, PASTAS, DOCUMENTOS EXTERNOS, PESQUISAS EXTERNAS OU COMUNICAÇÕES.
NÃO CRIAR CASOS NOVOS REAIS COMO EFEITO DE TESTE.

DECISÃO NORMATIVA:
O ID canônico não carrega país, via jurídica, produto, preço, pessoa, estado comercial ou hipótese.

Formato canônico de caso:
CA-CID-[MODELO]-[ANO]-[SEQUENCIA]

MODELOS PERMITIDOS:
- IND = individual
- FAM = familiar
- MULTI = multipaís
- PESQ = pesquisa sem cidadania como objeto principal
- LEG = memória/legado
- POS = pós-reconhecimento

REGRAS:
1. País, nacionalidade, via, produto-pai, case_service, preço, status e responsável ficam em campos estruturados; não entram no case_id.
2. O case_id é gerado pelo servidor/banco, único, transacional e imutável.
3. Leads usam identificador próprio CA-LEAD-[ANO]-[SEQUENCIA] e só recebem case_id quando a abertura formal do caso for autorizada.
4. Um caso possui exatamente um ID canônico.
5. IDs históricos devem ser preservados em case_aliases e nunca apagados.
6. Propostas Canva não criam nem redefinem case_id; usam referência:
DECK-CANVA-[CASE_ID]-v[N].
7. Fixtures usam prefixo DEMO e não podem se confundir com casos reais.

CRIAR OU CONFIRMAR:
- case_aliases:
  - id
  - case_id
  - alias
  - alias_type
  - source
  - reason
  - created_at
  - created_by
  - superseded_by opcional
- gerador transacional de case_id
- gerador transacional de lead_id
- validação server-side de MODELO
- proteção contra edição manual de case_id
- visualização de aliases somente no histórico/detalhe interno

APLICAÇÃO DE REFERÊNCIA, SEM RENOMEAR NADA AGORA:
- Ana: modelo FAM; futuro canônico pretendido CA-CID-FAM-2026-001; preservar CA-CID-AT-FAM-2026-001 e CA-AUT-ANALUIZA-FAM-2026-001 como aliases.
- João: CA-CID-IND-2026-002 quando houver caso formal; Portugal fica em citizenship_track.
- Amigo do Danilo: manter CA-LEAD-2026-[SEQUENCIA] enquanto estiver em triagem; somente depois de abertura formal usar CA-CID-IND-2026-003; Brasil/naturalização fica em citizenship_track e via_preliminar.

TESTES:
1. Criar fixture individual gera ID IND único.
2. Criar fixture familiar gera ID FAM único.
3. País/via não alteram case_id.
4. Alteração manual de case_id é negada.
5. Alias histórico fica consultável e não vira chave primária.
6. Proposta Canva recebe referência a case_id existente.
7. Lead não recebe case_id antes da abertura formal.

ENTREGA:
- migrations/tabelas/funções alteradas;
- testes e resultados;
- lista de aliases preservados;
- plano separado de migration para renomear Ana somente após aprovação humana;
- confirmação de que nenhum caso real, proposta, contrato, cobrança ou ação externa foi alterado.
```

### Gate G-01

- IDs de fixtures passam nos testes.
- Nenhum ID real é renomeado.
- Alias de Ana aparece no histórico interno.

---

## 3. G-02 — Ficha Piloto Genealógica, pessoas e árvores

```text
[ID G-02] IMPLEMENTAR A FICHA PILOTO GENEALÓGICA COMO ORIGEM CANÔNICA DE PESSOAS, RELAÇÕES, LINHAGENS, ÁRVORE E LINHA DO TEMPO.

NÃO INICIAR PESQUISA EXTERNA.
NÃO CRIAR OU ALTERAR DOCUMENTO EXTERNO, PASTA, CONTRATO, COBRANÇA, ASSINATURA, MENSAGEM OU PUBLICAÇÃO NO APP CLIENTE.
NÃO INFERIR DADOS AUSENTES.

ARQUITETURA:
Pessoa + Relações estruturadas + Linhagens + Eventos + Evidências = Árvore interna e linha do tempo interna.

CRIAR OU CONFIRMAR:

1. genealogical_person_profiles
- research_person_id
- nome_completo
- nome_nascimento
- sexo
- nascimento_data
- nascimento_data_aproximada
- nascimento_localidade
- morte_data
- morte_data_aproximada
- morte_localidade
- causa_morte
- sepultamento_localidade
- status_verificacao: confirmado, provável, hipótese, pendente, não_aplicável
- evidence_id de suporte quando confirmado
- verified_at
- internal_notes

2. name_variants
- person_id
- variante
- tipo: grafia, tradução, italianização, aportuguesamento, apelido, erro_documental, nome_religioso, outro
- período
- localidade
- estado_validacao
- nivel_confianca
- evidence_id
- source_id
- observacao_interna

3. genealogical_relationships
- person_from_id
- person_to_id
- relation_type: pai_mae, filho, conjuge, irmão, tutor_representante, padrinho_madrinha, colateral, a_confirmar
- relation_date_or_approximate
- locality
- status_pesquisa
- evidence_id
- internal_notes

4. genealogical_events
- person_id
- event_type: nascimento, batismo, casamento, morte, sepultamento, residencia, migracao, servico_militar, patrimonio, outro
- start_date
- end_date
- approximate_date
- locality
- description_internal
- validation_status
- evidence_id
- source_id

5. lineage_paths
- case_id
- family_id
- nome_da_linha
- pessoa_ancora_id
- tipo_da_linha: paterna, materna, direta, colateral, cidadania, memoria_legado, dupla_familiar, alternativa, a_confirmar
- citizenship_track_id opcional
- objetivo
- geração_alvo
- status
- evidencias_chave
- risco_principal
- proximo_marco
- responsavel

REGRAS:
- Não usar campos rígidos Filho 1, Filho 2, Irmão 1 ou Irmão 2.
- Fato confirmado exige evidência ou fonte vinculada.
- Variante de nome não cria pessoa duplicada.
- Relação a confirmar não é exibida como confirmada.
- Linha dupla é uma configuração de análise; não duplica pessoa nem cria novo caso.
- Árvore e timeline devem derivar de registros persistidos, nunca de texto livre.
- Conteúdo interno não aparece no App Cliente sem projeção autorizada futura.

UI:
Dentro de Pesquisa Genealógica e Evidências, criar área Pessoas e Linhagens com:
- perfil Genealógico 360°;
- árvore interna;
- timeline interna;
- relações;
- variantes de nome;
- linhagens;
- lacunas e próximas pesquisas.

CASO ANA:
Criar somente a estrutura interna vinculável ao caso, sem inventar nomes, documentos, datas, relações ou evidências além das já verificadas.

TESTES:
1. Pessoa e relação persistem após salvar/recarregar.
2. Árvore muda ao criar relação válida.
3. Variante de nome não duplica pessoa.
4. Relação sem evidência permanece a confirmar.
5. Linha dupla aceita duas linhas no mesmo caso.
6. App Cliente não lê diretamente perfis ou relações internas.

ENTREGA:
- migrations, rotas, componentes e testes;
- como criar pessoa, relação, variante, linhagem e evento;
- confirmação de que nenhuma ação externa foi executada.
```

### Gate G-02

- Criar pessoa, variante, relação e evento; salvar; recarregar; confirmar persistência.
- Árvore e timeline respondem a registros reais.

---

## 4. G-03 — Biblioteca de Evidências e projeções

```text
[ID G-03] IMPLEMENTAR A BIBLIOTECA DE EVIDÊNCIAS E PROJEÇÕES AUTORIZADAS.

NÃO CONSULTAR FONTES EXTERNAS.
NÃO FAZER SCRAPING, API, LOGIN EXTERNO OU PESQUISA EXTERNA.
NÃO ENVIAR MENSAGENS, NÃO PUBLICAR NO APP CLIENTE E NÃO CRIAR DOCUMENTOS EXTERNOS.

PRINCÍPIO:
Integração invisível, evidência visível.

ARQUITETURA:
Fonte/material → Biblioteca de Evidências → Desk/Pesquisa → Projeção autorizada → App Cliente/One-page/PDF aprovado.

CRIAR OU CONFIRMAR:

1. evidences
- case_id
- research_item_id opcional
- research_person_id opcional
- source_id opcional
- evidence_type
- evidence_nature
- title_internal
- description_internal
- reference_date
- reference_location
- storage_reference_internal
- access_level: restrito, equipe_do_caso, cliente_autorizado
- workflow_status: recebida, registrada, em_revisao, divergente, insuficiente, requer_complemento, requer_retificacao, requer_traducao_apostila, rejeitada_inaplicavel, aprovada_para_entrega, publicada
- epistemic_validation_status:
  INFORMACAO_COMPARTILHADA_FAMILIA
  DADO_PESQUISA_INICIAL
  EM_VALIDACAO_DOCUMENTAL
  VALIDADO_POR_DOCUMENTO
  PENDENTE_CONFIRMACAO
  NAO_APLICAVEL
- confidence_level: INICIAL, BAIXO, MEDIO, ALTO
- reviewed_by
- reviewed_at
- legal_review_status
- created_at
- updated_at

2. evidence_validations
- evidence_id
- estado_anterior
- estado_novo
- confiança_anterior
- confiança_nova
- justificativa
- revisado_por
- revisado_em

3. app_projections
- source_entity_type
- source_entity_id
- case_id
- projection_type
- destination: app, one_page, pdf_aprovado
- content_sanitized
- approval_status: draft, in_review, approved, published, archived
- approved_by
- approved_at
- visibility_scope
- effective_from
- archived_at

REGRAS:
- Busca negativa é evidência válida e deve registrar fonte consultada, data e próxima ação possível.
- Não permitir salto automático de INICIAL para ALTO.
- Elevação de confiança exige responsável, data e justificativa.
- Fonte colaborativa não valida sozinha vínculo, direito, cidadania ou relação.
- Validado por documento não equivale a parecer jurídico, cidadania reconhecida ou resultado garantido.
- Fonte crua, URL interna, transcrição, risco, hipótese, documento bruto e dado de terceiro nunca chegam ao App.
- Nenhuma evidência é acessível pelo App sem app_projection aprovada e conteúdo sanitizado.

TESTES:
1. Evidência interna não aparece no App sem projeção aprovada.
2. Busca negativa persiste como evidência.
3. Salto de confiança sem revisão é negado.
4. Conteúdo com URL interna não pode compor projeção.
5. Usuário sem permissão não acessa evidência restrita.

ENTREGA:
- schema/migrations, RLS, telas e testes;
- exemplo de cadeia evidência → validação → projeção;
- confirmação de que nenhuma consulta externa ou publicação foi executada.
```

### Gate G-03

- Evidência restrita não aparece em App/cliente.
- Busca negativa cria registro e próxima ação interna.

---

## 5. G-04 — Pesquisa, documentos e solicitações

```text
[ID G-04] IMPLEMENTAR A ÁREA PESQUISA GENEALÓGICA E EVIDÊNCIAS, COM FOCO EM DOCUMENTOS E SOLICITAÇÕES.

NÃO INICIAR PESQUISA EXTERNA.
NÃO SOLICITAR CERTIDÃO, CONTATAR INSTITUIÇÃO, CRIAR DESPESA, GERAR COBRANÇA, PASTA, MENSAGEM OU DOCUMENTO EXTERNO.

CRIAR ÁREA:
Pesquisa Genealógica e Evidências
- Visão de pesquisa
- Pessoas, famílias e ramos
- Fontes e consultas
- Documentos e Solicitações
- Evidências e validações
- Hipóteses e lacunas
- Relatórios de fase
- Alertas e histórico

CRIAR document_requests com grade visível:
1. Geração
2. Nome Completo
3. Tipo de Documento
4. Arquivo/Instituição
5. Data Pedido
6. Status
7. Data Recebimento
8. Observação

Campos técnicos adicionais:
- case_id
- family_id
- research_person_id
- source_id
- evidence_id
- request_type
- responsável
- próxima_ação
- prazo_próxima_ação
- prioridade
- custo_externo_estimado opcional
- aprovação_cliente_status
- link_interno
- nível_acesso
- origem
- created_at
- updated_at

STATUS:
Não solicitado; A preparar; Solicitado; Aguardando pagamento do cliente; Aguardando cliente; Aguardando instituição; Recebido; Em revisão; Validado internamente; Divergente; Insuficiente; Requer complemento; Requer retificação; Requer tradução/apostila; Não localizado; Cancelado; Não aplicável.

REGRAS:
- Nome completo referencia pessoa existente, não texto livre quando já houver pessoa cadastrada.
- Campos classificatórios usam dicionário fechado.
- Data de pedido é obrigatória a partir de Solicitado.
- Data de recebimento é obrigatória a partir de Recebido.
- Recebido cria/vincula evidência com workflow_status Recebida.
- Aguardando cliente, Aguardando instituição, Divergente, Não localizado e Requer retificação exigem próxima ação, prazo, responsável e alerta interno.
- Ação dirigida ao cliente gera somente rascunho em communication_queue; não enviar WhatsApp.
- Custos externos são previsão; nunca caixa, receita, reembolso ou cobrança automática do Clube.
- Link interno e documento bruto não são exibidos no App.

TESTES:
1. Solicitação vinculada a pessoa, fonte e caso persiste após reload.
2. Recebido cria/vincula evidência.
3. Aguardando cliente gera alerta e rascunho, sem envio.
4. Requer tradução/apostila não gera despesa.
5. Não localizado exige ação alternativa.

ENTREGA:
- tabelas, rotas, dicionários, RLS, testes;
- confirmação de nenhuma ação externa.
```

### Gate G-04

- Documento recebido vira evidência rastreável.
- Pendência vira próxima ação e alerta, não simples texto.

---

## 6. G-05 — Relatórios Fase 1 e Fase 2

```text
[ID G-05] CONECTAR OS RELATÓRIOS EXISTENTES DAS FASES 1 E 2 À FICHA PILOTO, EVIDÊNCIAS E JORNADA.

NÃO CRIAR RELATÓRIOS PARALELOS.
NÃO GERAR PDF EXTERNO, NÃO ENVIAR AO CLIENTE E NÃO PUBLICAR NO APP NESTA ENTREGA.

CRIAR OU CONFIRMAR case_reports:
- case_id
- report_type:
  REPORT_F1_DIAGNOSTICO
  REPORT_F2_PESQUISA
  REPORT_F3_PRONTIDAO_DOCUMENTAL
  REPORT_F4_PROTOCOLO
  REPORT_F5_CONCLUSAO
  REPORT_MEM_LEGADO
- report_status: a_preparar, em_elaboracao, em_revisao, aprovado_internamente, entregue, arquivado
- fase_jornada
- versão
- responsável
- revisor
- data_aprovacao
- data_entrega
- link_interno
- resumo_aprovado_cliente
- created_at
- updated_at

CRIAR report_evidence_links:
- report_id
- evidence_id
- relação: principal, suporte, pendência, contraponto
- observacao_interna

REGRAS:
- F1 = Relatório de Diagnóstico e Direcionamento.
- F2 = Relatório de Pesquisa Genealógica e Evidências.
- Relatório é entrega robusta; não substitui evidência, documento, achado ou micro-entrega.
- Micro-entrega não cria relatório duplicado.
- Conteúdo cliente-facing exige projeção aprovada e sanitizada.
- Para Ana, F1 inicia somente conforme dados reais; F2 não inicia automaticamente por haver proposta aprovada.

TESTES:
1. F1 e F2 aparecem como cards distintos.
2. Evidência é vinculada sem ser duplicada.
3. Relatório não publicado não aparece no App.
4. Micro-entrega vinculada não cria novo relatório.

ENTREGA:
- tabelas/rotas/testes;
- como vincular evidência e pendência a F1/F2;
- confirmação de nenhuma publicação ou envio externo.
```

### Gate G-05

- F1/F2 reconhecíveis como entregas existentes.
- Evidências e pendências aparecem por vínculo, não cópia.

---

## 7. G-06 — Achados e Encontros de Linhagem

```text
[ID G-06] IMPLEMENTAR ACHADOS GENEALÓGICOS E ENCONTROS DE LINHAGEM.

NÃO PUBLICAR NO APP CLIENTE, NÃO ENVIAR MENSAGEM E NÃO AFIRMAR RELAÇÃO FAMILIAR SEM EVIDÊNCIA E REVISÃO HUMANA.

FLUXO:
Fonte → Evidência → Validação interna → Achado Genealógico → Árvore/Linha do Tempo → Micro-entrega ou Relatório, se aprovado.

CRIAR genealogical_findings:
- case_id
- family_id
- research_item_id
- primary_research_person_id opcional
- title
- generation
- finding_type
- internal_summary
- confirmed_facts
- facts_to_confirm
- period_start
- period_end
- locality
- family_relationship
- relevance: baixa, média, alta, crítica
- validation_status: rascunho, em_revisao, validado_internamente, divergente, arquivado
- evidence_links
- source_links
- tree_impact
- timeline_impact
- planning_impact
- eligible_for_client_deliverable
- client_deliverable_id opcional
- responsible_user_id
- found_at
- validated_at
- internal_notes

Tipos controlados:
Registro civil; Registro religioso; Registro militar; Migração; Naturalização/nacionalidade; Patrimônio/notarial; Correspondência familiar; Foto/acervo visual; Estrutura familiar; Linha do tempo; Localidade; Documento divergente; Resultado negativo de pesquisa; Hipótese de pesquisa; Outro justificar.

CRIAR lineage_encounters:
- case_id
- family_id
- lineage_path_a_id
- lineage_path_b_id
- encounter_type: conexão_confirmada, convergencia_documental, separacao_de_ramos, linha_paralela_relevante, dupla_linhagem_familiar, marco_de_origem
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
- disclaimer_obrigatorio
- tree_impact
- timeline_impact
- approval_status
- client_deliverable_id
- responsible_user_id
- data_marco

REGRAS:
- Achado exige ao menos uma fonte ou evidência.
- Resultado negativo de pesquisa registra fonte consultada, data e próxima ação alternativa.
- Achado validado não equivale a conclusão jurídica ou cidadania reconhecida.
- Encontro de Linhagem exige duas linhas e evidência por lado, salvo marco de origem.
- Não usar linguagem determinista, terapêutica ou de traço psicológico de ancestralidade.
- Encontro sem disclaimer e aprovação não cria projeção cliente.
- Atualização de árvore/timeline exige revisão interna.
- Conteúdo cliente-facing é rascunho sanitizado; nunca publicação automática.

TESTES:
1. Achado sem evidência/fonte é negado.
2. Resultado negativo pode ser registrado.
3. Encontro sem disclaimer não pode ser aprovado.
4. Hipótese não aparece como conexão confirmada.
5. App não lê resumo interno nem fontes restritas.

ENTREGA:
- schema, telas, dicionários, testes;
- confirmação de nenhuma publicação, mensagem ou ação externa.
```

### Gate G-06

- Achado e encontro não publicam automaticamente.
- Árvore/timeline recebem apenas impacto revisado.

---

## 8. G-07 — Plano de ação de pesquisa, instituições e terceiros

```text
[ID G-07] IMPLEMENTAR PLANO DE AÇÃO DE PESQUISA, INSTITUIÇÕES E PREVISÃO DE TERCEIROS.

NÃO CONTATAR INSTITUIÇÕES, NÃO ENVIAR E-MAIL/WHATSAPP, NÃO GERAR DESPESA, COBRANÇA, REEMBOLSO, PEDIDO EXTERNO OU EVENTO DE CALENDÁRIO.

CRIAR research_action_plan_items:
- case_id
- research_item_id
- document_request_id opcional
- evidence_id opcional
- finding_id opcional
- institution_id opcional
- action_type
- priority: crítica, alta, média, baixa
- reason
- status: planejada, pronta_para_revisao, aguardando_aprovacao, aprovada, realizada, aguardando_resposta, concluida, cancelada
- due_date
- responsible_user_id
- suggested_channel
- communication_draft
- requires_human_approval = true por padrão
- contacted_at
- contact_result_internal
- next_action
- next_check_at
- estimated_cost_amount opcional
- estimated_cost_currency
- expense_approval_status
- payer
- internal_evidence_link

CRIAR institutions:
- name
- institution_type
- country
- city
- email
- phone
- opening_hours
- preferred_channel
- operational_instruction
- contact_source
- last_verified_at
- verified_by
- update_status

CRIAR expense_estimates:
- case_id
- research_action_plan_item_id opcional
- institution_id opcional
- expense_type
- quantity
- unit_price_min
- unit_price_max
- estimated_total_min
- estimated_total_max
- currency
- estimated_wait_days_min
- estimated_wait_days_max
- estimate_source
- client_approval_status
- payer
- notes_internal

REGRAS:
- Prioridade crítica com prazo hoje/vencido cria alerta imediato no Desk para Tatiana.
- Item aguardando resposta exige next_check_at.
- Comunicação externa gera apenas rascunho em fila, sempre com aprovação humana.
- Toda ação realizada cria crm_interaction imutável, mas este corte não realiza contato externo.
- Estimativa de terceiro não é caixa, receita, custo próprio, reembolso ou cobrança automática do Clube.
- Instituição é referência reutilizável; não duplicar contatos em cada tarefa.

TESTES:
1. Pendência crítica aparece no Painel Hoje.
2. Item aguardando resposta sem data de rechecagem é negado.
3. Rascunho externo não envia comunicação.
4. Estimativa não cria lançamento financeiro.

ENTREGA:
- tabelas, telas, alertas e testes;
- confirmação de nenhuma ação externa.
```

### Gate G-07

- Ações e rechecagens tornam-se operáveis no Desk.
- Nada é enviado ou cobrado.

---

## 9. G-08 — Bases genealógicas e 5B-Pre

```text
[ID G-08] IMPLEMENTAR BLOCO 5B-PRE: CATÁLOGO E GOVERNANÇA DE BASES E FONTES GENEALÓGICAS.

NÃO IMPLEMENTAR SCRAPING.
NÃO CONECTAR API.
NÃO CONSULTAR BASE EXTERNA.
NÃO GERAR CREDENCIAIS.
NÃO INICIAR PESQUISA EXTERNA.
NÃO PUBLICAR NO APP CLIENTE.

Criar módulo interno: Fontes e Integrações Genealógicas.

CRIAR genealogical_sources_catalog:
- nome
- pais_eixo
- citizenship_track_id opcional
- tipo_de_acervo
- cobertura_temporal
- cobertura_geografica
- nivel_de_fonte: primária, secundária, colaborativa, indice, institucional
- acesso: público, login, pago, parceria, restrito
- licenca_termos
- url_referencia_interna opcional
- custo
- autenticacao_necessaria
- trata_dados_pessoais
- risco
- uso_recomendado
- prioridade
- modo_de_uso_permitido: manual, metadados_linkout, api_validada, parceria, restrito, nao_validado
- scraping_status: proibido_por_padrao, exige_validacao_juridica_tecnica, nao_aplicavel
- ultima_verificacao
- status_documentacao
- status_integracao
- proxima_acao
- observacao_risco
- responsavel_revisao

CRIAR estágio de maturidade:
CATALOGADA, DOCUMENTADA, TERMOS_A_CONFIRMAR, ELEGIVEL_PARA_PILOTO, PILOTO_INTERNO, HOMOLOGADA_MANUAL, HOMOLOGADA_API, RESTRITA, DESCONTINUADA.

CRIAR source_evaluation_matrix e sources_activation_backlog.

REGRAS:
- Fonte catalogada não é integração.
- Fonte manual não equivale a API homologada.
- Fonte com termos a confirmar não avança a piloto.
- Fonte restrita/descontinuada não aparece como recomendação operacional.
- Vincular fonte a pesquisa não consulta a fonte.
- `source_access_logs` pode existir como estrutura futura, mas não gerar logs reais neste corte.
- Fonte crua nunca aparece no App Cliente.

TESTES:
1. Fonte catalogada não permite consulta automática.
2. Fonte com termos a confirmar não pode ser homologada.
3. Fonte manual pode ser vinculada a research_item sem acesso externo.
4. Fonte restrita não aparece em sugestão de pesquisa.
5. Logs futuros não aceitam token/payload bruto.

ENTREGA:
- catálogo, matrizes, backlog, dicionários, RLS e testes;
- confirmação explícita de nenhuma API, scraping, consulta, comunicação ou publicação externa.
```

### Gate G-08

- O Desk sabe quais fontes existem, como podem ser usadas e para qual trilha/caso são relevantes.
- Nenhuma fonte é consultada automaticamente.

---

## 10. Registro de aplicação

| Data | Prompt | Resultado | Créditos Lovable | Evidência | Decisão seguinte |
|---|---|---|---:|---|---|
| 20/08/2026 | G-01 | Pendente | 0 se feito em Claude Code |  |  |
| 20/08/2026 | G-02 | Pendente |  |  |  |
| 20/08/2026 | G-03 | Pendente |  |  |  |
| 20/08/2026 | G-04 | Pendente |  |  |  |
| 20/08/2026 | G-05 | Pendente |  |  |  |
| 20/08/2026 | G-06 | Pendente |  |  |  |
| 20/08/2026 | G-07 | Pendente |  |  |  |
| 20/08/2026 | G-08 | Pendente |  |  |  |

---

## 11. Decisão de ferramenta

- **Lovable:** mobile, telas, menus, comportamento visual e fluxo delimitado.
- **Claude Code/GitHub:** IDs, migrations, persistência, RLS, regras de servidor, testes, árvores derivadas, dados, infraestrutura e versionamento.
- **Nenhuma ferramenta:** não executar contrato, assinatura, cobrança, mensagem, pesquisa externa ou integração sem gate e autorização humana específicos.
