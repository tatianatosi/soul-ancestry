# Clube Ancestral — Adendo de Prompts Pendentes do Dia 19/08/2026

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Natureza:** artefato versionado de implementação  
**Complementa:** `Roteiro de Implementação do Desk Intelligence v1.0`  
**Objetivo:** consolidar os prompts restantes do escopo funcional do dia, com prioridade para o caso Ana Luiza, CRM Discovery/Handoff, Cockpit diário, Placego CSV e fechamento técnico de proposta/contrato sem executar atos externos.

---

## Sumário

1. [Regras de uso](#1-regras-de-uso)
2. [Ordem de aplicação](#2-ordem-de-aplicação)
3. [Prompt 10 — Proposta Canva, escopo e dependentes](#3-prompt-10--proposta-canva-escopo-e-dependentes)
4. [Prompt 11 — Discovery e handoff operacional](#4-prompt-11--discovery-e-handoff-operacional)
5. [Prompt 12 — Cockpit diário e três casos](#5-prompt-12--cockpit-diário-e-três-casos)
6. [Prompt 13 — Importação Placego CSV](#6-prompt-13--importação-placego-csv)
7. [Prompt 14 — Higiene de dados e desativação de legado](#7-prompt-14--higiene-de-dados-e-desativação-de-legado)
8. [Prompt 15 — Preparação contratual e matriz jurídica](#8-prompt-15--preparação-contratual-e-matriz-jurídica)
9. [Matriz de aceite do dia](#9-matriz-de-aceite-do-dia)
10. [Fora de escopo](#10-fora-de-escopo)

---

## 1. Regras de uso

1. Executar um prompt por vez.
2. Validar a persistência e os gates antes do prompt seguinte.
3. Não criar, enviar, assinar, cobrar, publicar, pesquisar externamente ou alterar sistemas externos.
4. Toda comunicação externa deve permanecer como rascunho em fila, com aprovação humana posterior.
5. Dados de Ana, João e naturalização brasileira são dados reais/restritos; fixtures históricos devem ser marcados como desenvolvimento e ficar fora do Cockpit de produção.
6. Não usar planilhas como fonte operacional nova. Desk/Supabase é o sistema vivo; fontes legadas ficam em leitura/migração.
7. Nenhum campo de triagem, risco, hipótese ou revisão jurídica deve ser projetado ao App Cliente.

---

## 2. Ordem de aplicação

| Ordem | Prompt | Pré-requisito | Resultado |
|---:|---|---|---|
| 10 | Proposta Canva, escopo e dependentes | Painel de Casos persistindo | Proposta registrada/validada e bloqueios inequívocos |
| 11 | Discovery e handoff operacional | Dicionários e interações disponíveis | Painel de Calls funcionando no Desk |
| 12 | Cockpit e três casos | Próxima ação e alertas funcionando | Ana, João e naturalização visíveis e priorizados |
| 13 | Placego CSV | Contacts/opportunities disponíveis | Pré-importação e deduplicação segura |
| 14 | Higiene e legado | Dados de origem disponíveis | Fictícios isolados e legado só leitura |
| 15 | Preparação contratual e matriz jurídica | Prompt 10 concluído | Gates de contrato preparados, sem contrato real |

---

## 3. Prompt 10 — Proposta Canva, escopo e dependentes

```text
IMPLEMENTAR O CORTE 10 — COMPLETUDE DA PROPOSTA CANVA, CONFERÊNCIA DE ESCOPO E PARÂMETRO DEPENDENTES.

NÃO CRIAR, PREENCHER OU ALTERAR CONTRATO, CLÁUSULA JURÍDICA, ORDEM DE SERVIÇO, PEDIDO DE ASSINATURA, COBRANÇA ASAAS, LINK DE PAGAMENTO, PASTA, DOCUMENTO EXTERNO, PESQUISA EXTERNA OU COMUNICAÇÃO EXTERNA.

CONTEXTO:
- O módulo escopo-proposta.ts foi conectado à preparação contratual e aos gates.
- O piloto CA-CID-AT-FAM-2026-001 possui proposta Canva v1 aceita, mas está inválida para escopo porque não possui referência interna do deck, páginas 1–7 registradas nem conteúdo estruturado extraído por página.
- MODELO-ESTUDO v1 e BASE-GEN-V2 v2 são motores de parâmetros/gates; não há cláusulas-base jurídicas versionadas.
- Não inventar ou redigir cláusulas jurídicas nesta entrega.

A. PROPOSTA CANVA
Criar/completar fluxo interno de proposta:
- proposal_id
- case_id
- origin = canva
- deck_reference_interna
- proposal_version
- proposal_status
- approved_or_accepted_at
- extracted_by
- extracted_at
- extraction_status
- page_number
- page_content_structured
- source_page_for_each_field
- archived_at opcional
- replaced_by_proposal_id opcional
- refused_at opcional
- expires_at opcional

Critérios de validade:
- case_id coincide;
- origin Canva;
- status approved ou accepted;
- não arquivada, substituída, recusada ou expirada;
- deck_reference_interna preenchida;
- páginas 1 a 7 completas e únicas;
- conteúdo estruturado por página;
- versão válida;
- conferência de escopo sem bloqueio crítico.

Nunca inferir conteúdo ausente.
Permitir marcar “não localizado na proposta”.
Não exigir/registrar URL externa sensível em logs.

B. PAINEL DE CADASTRO E CONFERÊNCIA
Em Casos → Formalização → Preparar contrato, criar painel “Proposta Canva e Escopo”:
- status da proposta;
- versão;
- data de aprovação;
- páginas 1–7;
- campos extraídos;
- campos ausentes;
- conflitos;
- anexos afetados;
- bloqueios;
- botão interno Conferir escopo.

Mapa página→anexo:
- ANX-ESCOPO: páginas 2–5;
- ANX-COMERCIAL: páginas 6–7;
- ANX-INDIVIDUAL: página 4;
- ANX-PRIVACIDADE: cláusula-base futura;
- ANX-REPRESENTACAO: condicional.

C. CONFERÊNCIA
Executar conferirEscopoProposta(caseId, proposalId, actorId):
- validar proposta;
- extrair apenas campos fechados do escopo-proposta.ts;
- identificar campos extraídos, ausentes e conflitantes;
- comparar com case_service, product_catalog, condição comercial, família e formalization_checklist;
- retornar aprovado_para_preparacao, bloqueado ou requer_revisao;
- gravar auditoria sanitizada sem URL, dados pessoais, conteúdo integral ou links internos.

D. DEPENDENTES
Adicionar dependentes ao dicionário e contract_parameter_values:
- dependent_person_id
- case_id
- nome_completo
- vínculo_com_titular
- titular_responsavel_legal_id
- status_representacao: Pendente, Documentada, Não aplicável
- documento_representacao_referencia_interna
- participa_do_contrato
- possui_acesso_app
- anexo_individual_aplicavel
- observacao_interna

Regras:
- dependente não é automaticamente signatário;
- dependente não gera cobrança própria;
- dependente não tem App independente sem representação aplicável;
- se participar de contrato/App/anexo e status de representação for Pendente, criar bloqueio;
- manter Felipe vinculado à Ana com representação pendente.

E. ANA
Exibir no painel da Ana:
- proposta v1 aceita, origem Canva;
- fonte inválida até registrar deck, páginas 1–7 e extração;
- campos obrigatórios não localizados;
- gate bloqueando versão final, assinatura e financeiro;
- condição R$ 9.600 apenas como referência interna da proposta; sem cobrança.

F. TESTES
- proposta Canva completa → conferência executável;
- página faltante → bloqueio;
- campo obrigatório ausente → bloqueio;
- proposta substituída → bloqueio;
- dependente pendente que participa de contrato → bloqueio;
- dependente sem participação contratual → não bloquear apenas por existir.

G. ENTREGA
Mostrar tabelas/campos, painel, resultado de conferência, bloqueios e testes.
Nenhuma ação externa executada.
```

---

## 4. Prompt 11 — Discovery e handoff operacional

```text
IMPLEMENTAR O CORTE 11 — CRM DISCOVERY, PAINEL DE CALLS E HANDOFF OPERACIONAL.

NÃO CRIAR PROPOSTA, CONTRATO, COBRANÇA, LINK ASAAS, PASTA, PESQUISA EXTERNA, MENSAGEM EXTERNA OU AUTOMAÇÃO DE ENVIO.

OBJETIVO:
Fazer o Desk registrar calls, WhatsApp, e-mails e reuniões como interações imutáveis, capturar Discovery estruturada e gerar handoff com responsável e próxima ação obrigatória.

A. CRM_INTERACTIONS
Criar ou finalizar:
- id
- contact_id
- opportunity_id
- case_id opcional
- interaction_type: call, whatsapp, email, meeting, internal_note
- direction: inbound, outbound, internal
- occurred_at
- status
- consent_status
- consent_at
- consent_channel
- notice_version
- recording_url_internal
- summary_validated
- outcome
- next_action
- next_action_due_at
- responsible_area
- responsible_user_id
- event_source
- supersedes_interaction_id
- data_origin
- created_at

Interações são imutáveis; correção gera nova interação ligada à anterior.

B. PAINEL DE CALLS
Criar tela interna para:
- agendar call;
- confirmar;
- registrar realizada;
- remarcar;
- no-show;
- cancelar;
- registrar consentimento;
- registrar SPIN;
- gravar resumo validado;
- definir resultado e próxima ação.

Validações:
- call Realizada exige resumo validado, resultado e próxima ação datada;
- gravação só com consentimento Concedido, data/hora/canal/aviso;
- consentimento recusado ou não solicitado bloqueia link de gravação/transcrição;
- nenhum lead ativo sem área, responsável nominal e próxima ação datada.

C. DISCOVERY_ASSESSMENTS
Criar:
- interaction_id
- opportunity_id
- objetivo_principal
- nacionalidade_interesse
- pais_linha_prioritaria
- estrutura_familiar
- geração_ascendente
- linha_transmissao
- via_juridica_preliminar
- status_via
- sinal_aderencia_preliminar
- confianca_triagem
- complexidade_documental
- estado_documental_inicial
- risco_de_ruptura
- exige_idioma_entrevista
- spin_situacao
- spin_problema
- spin_implicacao
- spin_necessidade_valor
- resumo_operacional
- brief_interno_referencia
- created_at

Regras:
- campos são internos e não constituem parecer ou elegibilidade final;
- nenhum score ou prazo jurídico automático;
- Planejador recebe insumos, não conclusão.

D. HANDOFF
Ao concluir Discovery:
- criar/atualizar oportunidade;
- registrar evento discovery_completed;
- exigir responsável e próxima ação;
- permitir resultado: avançar para diagnóstico, avançar para proposta, solicitar documentos, pesquisa prévia, nutrição, sem aderência, encerrar;
- não criar caso ativo apenas pela Discovery.

E. ENTREGA
Mostrar telas, campos, validações, teste de call realizada e teste de lead ativo sem próxima ação.
```

---

## 5. Prompt 12 — Cockpit diário e três casos

```text
IMPLEMENTAR O CORTE 12 — COCKPIT DIÁRIO E VALIDAÇÃO DOS CASOS ANA, JOÃO E NATURALIZAÇÃO BRASILEIRA.

NÃO ENVIAR MENSAGENS, CRIAR CONTRATOS, COBRANÇAS, LINKS, PASTAS, DOCUMENTOS OU PESQUISAS EXTERNAS.

Criar rota/tela “Hoje” para Tatiana Melani Tosi com blocos:
- calls de hoje;
- follow-ups vencidos;
- leads/casos sem próxima ação;
- aceite verbal aguardando confirmação formal;
- confirmação formal aguardando formalização;
- contratos enviados aguardando assinatura;
- pagamentos iniciais aguardados;
- onboardings bloqueados;
- casos sem responsável, dossiê-mãe, plano ou case service;
- pendências documentais críticas;
- rechecagens de pesquisa vencidas;
- evidências aguardando validação;
- relatórios em revisão;
- micro-entregas aguardando aprovação;
- alertas D10 e D14.

A. ANA
Configurar e exibir:
- Case ID CA-CID-AT-FAM-2026-001;
- alias CA-AUT-ANALUIZA-FAM-2026-001;
- responsável Tatiana Melani Tosi;
- Áustria / §58c;
- Confirmação formal recebida;
- Formalização em preparação;
- Pré-onboarding bloqueado;
- próxima ação Solicitar dados cadastrais;
- bloqueios de proposta Canva, cadastro, dados da contratada, contrato, OS, revisão jurídica, assinatura, Alice, Felipe, case service, condição comercial e Asaas;
- comunicação como rascunho não enviado.

B. JOÃO
Configurar e exibir:
- produto-pai Diagnóstico de Cidadania por Etapas;
- trilha Portugal / via a confirmar;
- estado Aceite verbal;
- próxima ação Solicitar confirmação formal;
- prazo máximo D+2;
- rascunho WhatsApp para aprovação, sem envio;
- sem contrato, cobrança, onboarding ou caso ativo.

C. NATURALIZAÇÃO BRASILEIRA
Configurar e exibir:
- origem Indicação;
- produto-pai Diagnóstico de Cidadania por Etapas;
- trilha Brasil / Naturalização-residência;
- estado Triagem;
- status de via Em confirmação jurídica;
- próxima ação Confirmar call ou Enviar checklist, com responsável e data;
- sem conclusão jurídica, case_service ativo, pesquisa externa ou App Cliente.

D. REGRAS
- Cockpit só mostra production_real e migration_legacy autorizados;
- não exibir development_fixture/sandbox em operação;
- blocos devem mostrar por que o caso aparece e o próximo passo;
- permitir abrir ficha do caso diretamente.

E. ENTREGA
Mostrar a tela e os três testes funcionais, sem efeitos externos.
```

---

## 6. Prompt 13 — Importação Placego CSV

```text
IMPLEMENTAR O CORTE 13 — IMPORTAÇÃO PLACEGO CSV APENAS PARA CONTATOS.

NÃO CONECTAR API, NÃO SINCRONIZAR CONTINUAMENTE, NÃO IMPORTAR MÉTRICAS, INVESTIMENTO, CONVERSÃO, STATUS, PREÇO OU DADOS NÃO PRESENTES EM CSV.

OBJETIVO:
Importar contatos do Placego com rastreabilidade, preview, mapeamento e deduplicação humana assistida.

Criar entidades:
1. legacy_import_batches:
- id
- source_system
- source_file_name
- mapping_version
- status
- imported_by
- started_at
- finished_at
- total_rows
- created_records
- updated_records
- duplicates
- rejected_records
- error_log

2. legacy_record_links:
- canonical_entity_type
- canonical_entity_id
- legacy_system
- legacy_record_id
- batch_id
- confidence
- deduplication_reason
- imported_at

3. migration_exceptions:
- batch_id
- source_record_id
- exception_type
- reason
- proposed_resolution
- status
- assigned_to

Campos Placego mínimos:
- placego_contact_id
- nome
- email
- telefone/WhatsApp
- data_entrada, se disponível
- origem, se disponível
- campanha, se disponível
- observação legada, se disponível

Fluxo:
- upload CSV;
- preview;
- mapeamento de colunas;
- normalização de telefone/e-mail;
- deduplicação por telefone, e-mail e revisão humana;
- lista de conflitos;
- confirmação de importação;
- relatório final;
- registros importados recebem data_origin = migration_legacy e etiqueta IMPORTADO_PLACEGO.

Regras:
- Placego não é fonte de conversão, investimento ou funil;
- não criar oportunidades automaticamente sem regra explícita;
- não sobrescrever contatos existentes sem revisão;
- não importar dados em branco por inferência;
- não usar CSV como sistema vivo após migração.

Criar tela Importações com histórico e possibilidade de revisar exceções.
```

---

## 7. Prompt 14 — Higiene de dados e desativação de legado

```text
IMPLEMENTAR O CORTE 14 — HIGIENE DE DADOS E DESATIVAÇÃO OPERACIONAL DE LEGADOS.

NÃO EXCLUIR FISICAMENTE REGISTROS REAIS, NÃO ALTERAR PLANILHAS, NÃO CRIAR EXPORTAÇÃO OU SINCRONIZAÇÃO EXTERNA.

A. DATA ORIGIN
Adicionar/garantir data_origin em entidades relevantes:
- production_real
- migration_legacy
- development_fixture
- sandbox
- unknown_needs_review

B. REGRAS
- development_fixture e sandbox não aparecem em Cockpit de produção, App Cliente, métricas, alertas operacionais ou comunicação.
- unknown_needs_review entra em fila de saneamento.
- production_real requer rastreabilidade de origem.
- migration_legacy preserva sistema/ID de origem.
- não excluir automaticamente dados reais.

C. LEGADO
Criar registro de sistemas legados:
- Planilha Mestre
- CRM OPS
- outras planilhas CRM
- Placego

Campos:
- source_name
- status = read_only_legacy
- finalidade permitida
- data_de_corte
- owner
- última_importação
- observação

Regra:
- nenhuma tela operacional nova deve gravar em legado;
- nenhum webhook novo usa planilha como ponte;
- produto/preço operacional vem de product_catalog Desk homologado, não de planilha viva.

D. FILA DE SANEAMENTO
Criar visualização com:
- registros sem origem;
- registros fictícios em ambiente produtivo;
- duplicidades;
- dados pessoais incompletos;
- referências quebradas;
- case services sem trilha/produto;
- contatos importados sem deduplicação concluída.

E. RELATÓRIO
Gerar relatório interno de saneamento com:
- preservados;
- migrados;
- fixtures;
- pendentes;
- arquiváveis;
- candidatos a exclusão, sem excluir.
```

---

## 8. Prompt 15 — Preparação contratual e matriz jurídica

```text
IMPLEMENTAR O CORTE 15 — PREPARAÇÃO CONTRATUAL, GATES E MATRIZ DE DECISÃO JURÍDICA.

Pré-requisito: Prompt 10 concluído.

NÃO CRIAR, REDIGIR OU ALTERAR TEXTO JURÍDICO FINAL, CONTRATO REAL, ORDEM DE SERVIÇO REAL, ASSINATURA, CLIENTE ASAAS, COBRANÇA OU LINK DE PAGAMENTO.

A. PAINEL /casos/:caseId/contrato/preparar
Criar blocos:
1. Proposta Canva: versão, status, páginas, extração, ausências, conflitos e bloqueios.
2. Escopo e anexos: incluído, excluído, participantes, critérios de aceite, anexos afetados.
3. Produto e condição: product_catalog homologado, case_service, preço vigente, condição, exceção aprovada se houver, divergências com proposta/planejador/manual.
4. Despesas de terceiros: estados, faixa, pagador, comunicação, aprovação e bloqueio.
5. Gates: proposta, escopo, produto, cadastro, família, dependentes, revisão jurídica, contrato/OS, assinatura, pagamento, autorização de pesquisa.

B. FONTE DE PREÇO
Desk product_catalog homologado é fonte canônica operacional.
Planilha Mestre é legado de auditoria/migração.
Bloquear valor/cobrança/checkout futuro quando não houver preço homologado ou exceção aprovada.

C. MATRIZ JURÍDICA
Criar matriz interna sem texto de cláusulas:
- tema
- status: pendente revisão jurídica, aprovado, rejeitado, substituir, não aplicável
- versão jurídica aplicável
- responsável pela revisão
- decisão
- justificativa
- data
- impacto em template
- bloqueia assinatura

Temas:
- natureza intelectual/técnica;
- não garantia de documento, linhagem, cidadania, resultado ou prazo;
- limite do relatório e ausência de parecer jurídico individual;
- retenção/descarte/acesso a dados;
- suspensão de prazo;
- encerramento;
- inadimplemento;
- rescisão;
- foro;
- parcelamento;
- despesas de terceiros;
- dependentes/representação.

D. GATES
Conectar bloqueios de escopo aos pontos futuros:
- gerar versão final;
- preparar anexos;
- solicitar assinatura;
- liberar financeiro;
- transicionar para Contrato enviado/assinado;
- pagamento inicial confirmado;
- onboarding.

Toda tentativa bloqueada deve gerar histórico interno com código legível.

E. ANA
O painel deve continuar bloqueado enquanto proposta Canva estiver incompleta, cadastro pendente, case service/condição pendentes, revisão jurídica pendente e representação de Felipe pendente.

F. ENTREGA
Mostrar gates, bloqueios, matriz jurídica e testes sem criar instrumentos reais.
```

---

## 9. Matriz de aceite do dia

| Item | Aceite |
|---|---|
| Ana | Mostra bloqueios inequívocos, próxima ação e rascunho não enviado |
| João | Mostra aceite verbal e tarefa D+2 de confirmação formal |
| Naturalização brasileira | Mostra triagem sem conclusão jurídica |
| Proposta Canva | Só libera preparação após referência + páginas 1–7 + extração + conferência |
| Contrato | Não é criado nem assinado sem gates |
| Pesquisa | Não inicia sem autorização aplicável |
| Comunicação | Fica em rascunho e exige aprovação |
| Dados fictícios | Não aparecem no Cockpit de produção |
| Placego | Importa contatos com rastreabilidade, sem virar sistema vivo |

---

## 10. Fora de escopo

- Envio efetivo de WhatsApp/e-mail.
- Contato com arquivos, órgãos ou instituições.
- Criação/alteração de contratos, anexos ou cláusulas jurídicas finais.
- Assinatura eletrônica.
- Criação de cliente, assinatura, cobrança ou pagamento Asaas.
- Criação de pasta, arquivo ou permissões no Drive.
- Pesquisa externa, diligência ou solicitação de certidão.
- Webhooks e automações externas.
- Integração Placego contínua.
- CAC, ROI, dashboards financeiros avançados e atribuição de mídia.
- Publicação automática no App Cliente.
