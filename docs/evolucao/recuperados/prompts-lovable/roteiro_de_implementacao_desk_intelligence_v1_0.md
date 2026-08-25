# Clube Ancestral — Roteiro de Implementação do Desk Intelligence

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** artefato de implementação versionado  
**Objetivo:** aplicar a revisão integral da jornada operacional do Desk Intelligence em cortes coerentes, testáveis e sem criar uma colcha de retalhos.

---

## Sumário

1. [Princípios de execução](#1-princípios-de-execução)
2. [Ordem obrigatória dos prompts](#2-ordem-obrigatória-dos-prompts)
3. [Gates entre prompts](#3-gates-entre-prompts)
4. [Prompt 01 — Persistência e Caso](#4-prompt-01--persistência-e-caso)
5. [Prompt 02 — Produtos, trilhas e planejador](#5-prompt-02--produtos-trilhas-e-planejador)
6. [Prompt 03 — Família, pessoas e formalização](#6-prompt-03--família-pessoas-e-formalização)
7. [Prompt 04 — Próxima ação, alertas e Meta Agent](#7-prompt-04--próxima-ação-alertas-e-meta-agent)
8. [Prompt 05 — Dicionários, glossário e taxonomia](#8-prompt-05--dicionários-glossário-e-taxonomia)
9. [Prompt 06 — Pesquisa, evidências e relatórios](#9-prompt-06--pesquisa-evidências-e-relatórios)
10. [Prompt 07 — Achados genealógicos](#10-prompt-07--achados-genealógicos)
11. [Prompt 08 — Plano de ação e terceiros](#11-prompt-08--plano-de-ação-e-terceiros)
12. [Prompt 09 — Cockpit e higiene de dados](#12-prompt-09--cockpit-e-higiene-de-dados)
13. [Casos de teste](#13-casos-de-teste)
14. [Fora do escopo de hoje](#14-fora-do-escopo-de-hoje)

---

## 1. Princípios de execução

1. O Desk Intelligence/Supabase é a fonte canônica operacional.
2. Planilha Mestre, CRM OPS, Placego e outras planilhas são legado de referência/migração; não recebem operação nova.
3. Não criar uma arquitetura paralela nem duplicar dados existentes.
4. Executar um prompt por vez, validar persistência e só então avançar.
5. Nenhum prompt cria cobrança, contrato, link Asaas, documento, pasta, pesquisa externa, mensagem externa, calendário ou integração externa.
6. Comunicação externa é sempre rascunho em fila e exige aprovação humana.
7. App Cliente recebe somente conteúdo sanitizado, aprovado e publicado.
8. Dados fictícios devem ser classificados e isolados; nunca podem aparecer como operação real.
9. Evidência, documento, achado, relatório e micro-entrega têm funções diferentes e não devem ser confundidos.
10. País/via é trilha técnica; produto-pai é catálogo comercial; serviço contratado é uma composição do caso.

---

## 2. Ordem obrigatória dos prompts

| Ordem | Prompt | Resultado esperado |
|---:|---|---|
| 01 | Persistência e Caso | Editar, salvar, recarregar e manter dados; ficha de caso operacional |
| 02 | Produtos, trilhas e planejador | Produto-pai + trilha + case service; sem SKU por país |
| 03 | Família, pessoas e formalização | Cadastro individual separado do caso; núcleo e gates |
| 04 | Próxima ação, alertas e Meta Agent | Ação datada vira tarefa, alerta e rascunho de comunicação |
| 05 | Dicionários, glossário e taxonomia | Vocabulário único, controlado e versionado |
| 06 | Pesquisa, evidências e relatórios | Fonte → evidência → validação → relatório; sem duplicar Fases 1 e 2 |
| 07 | Achados genealógicos | Achado vinculado a prova, árvore, timeline e planejamento |
| 08 | Plano de ação e terceiros | Pendência → ação → rechecagem → fila de comunicação; previsão sem caixa |
| 09 | Cockpit e higiene de dados | Cockpit diário funcional e isolamento de dados fictícios |

---

## 3. Gates entre prompts

- Após o Prompt 01: testar salvar um campo, recarregar e validar persistência no Supabase.
- Após o Prompt 02: criar um case service de teste sem preço/cobrança real.
- Após o Prompt 03: validar que dados de pessoa não aparecem como campos globais do caso.
- Após o Prompt 04: validar que uma próxima ação cria alerta interno e rascunho, sem envio externo.
- Após o Prompt 05: validar que estados estruturados não foram transformados em etiquetas.
- Após o Prompt 06: validar que evidência não é publicada automaticamente.
- Após o Prompt 07: validar que achado exige fonte/evidência vinculada.
- Após o Prompt 08: validar que ação externa exige aprovação humana e custo não vira caixa do Clube.
- Após o Prompt 09: validar Ana, João e naturalização brasileira no Cockpit.

Se o Lovable não salvar, criar migration inconsistente ou exibir mock como produção, parar, corrigir e não seguir ao próximo prompt.

---

## 4. Prompt 01 — Persistência e Caso

```text
IMPLEMENTAR O CORTE 01 — PERSISTÊNCIA E FICHA OPERACIONAL DE CASO.

PRIORIDADE ABSOLUTA:
1. Corrigir o problema atual em que edições na Aba Casos não persistem.
2. Garantir persistência no Supabase, com feedback e recarga confiável.
3. Estruturar a Aba Caso como ficha operacional; não como contrato nem cadastro único.

NÃO criar ou alterar contratos, cobranças Asaas, links de pagamento, pastas, documentos, mensagens externas, pesquisas externas, webhooks ou automações externas.

A. PERSISTÊNCIA
- Persistir todos os formulários em Supabase, não em state local/mock.
- Exibir Salvando, Salvo às HH:MM e erro legível.
- Bloquear navegação com mudanças não salvas.
- Implementar updated_at, updated_by e log de alteração (campo, anterior, novo, usuário, data/hora).
- Após reload, dados salvos devem existir.
- Exibir dados mock somente se data_origin = development_fixture e nunca como produção.

B. ESTRUTURA DA ABA CASO
Criar tabs:
1. Visão geral
2. Jornada e próxima ação
3. Produto, trilha e escopo
4. Família e participantes
5. Formalização
6. Onboarding
7. Dossiê e documentos
8. Interações, calls e brief
9. Entregas e comunicação
10. Histórico/auditoria

C. STATUS
Criar campos separados:
- eixo_comercial: Novo lead; Triagem; Discovery agendada; Discovery realizada; Diagnóstico em elaboração; Proposta enviada; Negociação; Aceite verbal; Confirmação formal recebida; Nutrição; Perdido; Encerrado sem aderência.
- eixo_formalizacao_operacao: Não iniciado; Formalização em preparação; Contrato enviado; Contrato assinado; Pagamento inicial confirmado; Onboarding iniciado; Caso ativo; Arquivado.
- status_caso_derivado: Pré-onboarding bloqueado; Formalização pendente; Onboarding pendente; Em execução; Aguardando cliente; Aguardando terceiro; Concluído; Arquivado.

Cliente ativo não pode ser campo livre. Só pode ser derivado após contrato assinado, pagamento confirmado, responsável, núcleo/dossiê e plano inicial.

D. RESPONSÁVEL
- responsavel_principal obrigatório: Tatiana Melani Tosi.
- cargo: Genealogista profissional e pesquisadora.
- supervisora_do_caso: Tatiana Melani Tosi, somente leitura.
- colaboradores opcionais não substituem responsável/supervisora.

E. PROPOSTA
Campos: data_confirmacao_formal_proposta; data_entrada_caso; proposta_referencia_interna; proposta_url_interna; proposta_id_origem; data_proposta; escopo_incluido_resumido; escopo_excluido_resumido; marcos_gerais_da_proposta; condicao_comercial_interna_pendente.

Data de entrada recebe data da confirmação formal. Aceite verbal não preenche data de entrada.

F. ANA
Configurar somente como caso interno bloqueado:
- Case ID CA-CID-AT-FAM-2026-001
- Alias CA-AUT-ANALUIZA-FAM-2026-001
- Responsável/supervisora Tatiana Melani Tosi
- País Áustria
- Eixo comercial Confirmação formal recebida
- Eixo formalização Formalização em preparação
- Status derivado Pré-onboarding bloqueado
- Data de entrada 14/08/2026
- Não criar contrato, cobrança, pesquisa externa, App Cliente, pasta ou comunicação.

G. ENTREGA
Mostrar causa e correção do salvamento, migrations/campos, tela alterada e teste editar → salvar → recarregar.
```

---

## 5. Prompt 02 — Produtos, trilhas e planejador

```text
IMPLEMENTAR O CORTE 02 — PRODUTO-PAI, TRILHA TÉCNICA E PLANEJADOR.

Pré-requisito: Persistência do Corte 01 validada.

NÃO criar SKU novo comercial, preço novo, contrato, cobrança, link Asaas, pesquisa externa ou recomendação automática.

Criar product_catalog com:
- code; nome_comercial; jornada_fase; tipo_oferta; prioridade_catalogo; status_homologacao; elegivel_para_proposta; preco_comercial_vigente; preco_historico_legado; condicao_comercial_padrao; escopo_aprovado; requer_fechamento_humano; ativo.

Criar citizenship_tracks com:
- pais; nacionalidade; via_preliminar; marco_juridico_referencia; status_via; requisitos_entrada; documentos_prioritarios; riscos_internos; idioma_entrevista; autorizacao_pesquisa_necessaria; revisao_humana_juridica; status_atualizacao; ultima_revisao_em; responsavel_revisao; texto_sanitizado_cliente; ativo.

Cadastrar trilhas: Itália, Portugal, Espanha, Alemanha, Áustria, Polônia, Hungria, Luxemburgo, Croácia, Romênia, Brasil — Naturalização/residência, Multipaís, Em investigação.

Criar case_services:
- case_id; product_catalog_id; citizenship_track_id; escopo_aprovado; composicao_familiar; preco_acordado; condicao_comercial_aprovada; status draft/approved/contracted/active/completed/cancelled; contrato_referencia_interna; responsavel_user_id.

Regras:
- País não é SKU.
- Serviço contratado = produto-pai + trilha + escopo + composição + condição.
- Planejador não calcula elegibilidade final, score, prazo jurídico ou produto automático.
- Planejador só gera checklist, perguntas prioritárias, pendências, próxima ação, marco verificável, entrega prevista e revisão humana/jurídica.

Criar case service da Ana em draft/formalization_in_preparation:
- produto-pai Diagnóstico Familiar Multipaís
- trilha Áustria/§58c
- R$ 9.600 apenas referência interna de proposta, sem cobrança.

Criar João como produto-pai Diagnóstico de Cidadania por Etapas + trilha Portugal/via a confirmar, sem case_service contratado.
Criar naturalização brasileira como Diagnóstico de Cidadania por Etapas + Brasil/Naturalização-residência, sem case ativo.

Mostrar migrations, telas e teste de composição sem efeitos externos.
```

---

## 6. Prompt 03 — Família, pessoas e formalização

```text
IMPLEMENTAR O CORTE 03 — NÚCLEO FAMILIAR, PESSOAS E GATES DE FORMALIZAÇÃO.

Pré-requisito: Cortes 01 e 02 validados.

NÃO criar contrato, Ordem de Serviço, cobrança, cliente Asaas, pasta, pedido externo ou comunicação.

Criar:
1. families: nome, case_id, dossie_mae, ambiente_autorizado, nivel_acesso, responsavel_dossie, status_dossie.
2. family_members: pessoa, família, papel, contratante, titular, dependente, representante legal, relacionamento, status cadastral.
3. people/participants: nome completo, CPF, RG, telefone, e-mail, endereço, CEP, profissão, estado civil, consentimentos, origem do dado, data de verificação, acesso restrito.
4. formalization_checklist: cadastro, escopo, case service, contrato, OS, revisão jurídica, assinatura, pagamento, dossiê, autorização de pesquisa.

Regras:
- Dados cadastrais pertencem à pessoa; não ao caso global.
- Um núcleo pode compartilhar dossiê-mãe.
- Cada participante tem registro individual.
- Não inferir dados ausentes.
- Dados pessoais não devem aparecer em App Cliente.

Configurar Ana:
- Ana Luiza Gomes Silveira Rodrigues: contratante/titular.
- Adair Pinto Silveira Júnior: titular.
- Alice Gomes Silveira: titular, cadastro pendente.
- Felipe Silveira Rodrigues: dependente menor vinculado a Ana; representação pendente.
- Adriel Felipe: interlocutor externo, não membro contratual.

Registrar bloqueios: cadastro, dados da contratada, contrato, OS/critério de aceite, revisão jurídica, assinatura, Alice, Felipe, case service/escopo e Asaas.

Mostrar navegação Caso → Família → Pessoa → Formalização, sem efeito externo.
```

---

## 7. Prompt 04 — Próxima ação, alertas e Meta Agent

```text
IMPLEMENTAR O CORTE 04 — PRÓXIMA AÇÃO, ALERTAS, FILA DE COMUNICAÇÃO E MAPA META AGENT.

Pré-requisito: Cortes 01 a 03 validados.

NÃO enviar WhatsApp, e-mail, push, webhook, calendário ou qualquer comunicação externa.

Criar em toda próxima ação:
- proxima_acao; prazo_proxima_acao; responsavel_principal; target_audience; visibility; suggested_channel; requires_human_approval; communication_status; alert_status; alert_triggered_at; communication_queue_id.

Próximas ações controladas:
Solicitar confirmação formal; Solicitar dados cadastrais; Validar núcleo familiar; Validar representação de menor; Revisar proposta e escopo; Definir produto-pai/trilha/case service; Preparar contrato; Preparar OS; Solicitar revisão jurídica; Definir assinatura; Enviar contrato; Confirmar assinatura; Preparar cobrança; Confirmar pagamento; Iniciar onboarding; Criar/validar dossiê-mãe; Criar grupo familiar; Enviar checklist inicial; Solicitar documentos; Revisar documentos; Preparar diagnóstico; Preparar plano de ação; Publicar primeira micro-entrega; Atualizar cliente; Encerrar; Outro — justificar.

Regras:
- Ação interna gera alerta automático no Desk.
- Ação externa cria rascunho em communication_queue, com aprovação humana obrigatória.
- D10 sem touchpoint: alerta de atenção.
- D14 sem atualização: alerta crítico + rascunho de atualização.
- Ação vencida não envia pressão/cobrança ao cliente.
- Todo alerta, aprovação e resultado gera interação imutável.

Criar Mapa Meta Agent somente para mapeamento futuro; sem sincronização externa.
- Desk é fonte canônica de etiquetas auxiliares.
- Etiquetas sem mapeamento entram em fila de revisão.

Configurar Ana:
- Próxima ação Solicitar dados cadastrais.
- Público Cliente contratante.
- Canal WhatsApp.
- Criar apenas rascunho, não enviar.

Configurar João:
- Aceite verbal.
- Próxima ação Solicitar confirmação formal.
- Prazo máximo D+2.
- Criar rascunho, não enviar.

Mostrar alertas e rascunhos sem efeito externo.
```

---

## 8. Prompt 05 — Dicionários, glossário e taxonomia

```text
IMPLEMENTAR O CORTE 05 — DICIONÁRIOS, GLOSSÁRIO E TAXONOMIA CANÔNICA.

Pré-requisito: Cortes 01 a 04 validados.

Criar área administrativa interna “Dicionários e Glossário”.

Cada item deve ter: code, name, description, domain, active, sort_order, visibility, meta_agent_equivalent opcional, version, effective_from, effective_to opcional.

Criar dicionários para:
- eixo_comercial
- eixo_formalizacao_operacao
- status_caso_derivado
- proxima_acao
- target_audience
- suggested_channel
- communication_status
- alert_status e alert_priority
- citizenship_tracks
- via_juridica_preliminar
- status_via
- sinal_aderencia_preliminar e confianca_triagem
- riscos_identificados
- research_status, source_type, evidence_type, evidence_nature, evidence_status
- legal_review_status
- report_type e report_status
- deliverable_type e approval_status
- canonical_labels

Regra de taxonomia:
Não criar etiqueta para origem, status de call, status comercial, contrato, pagamento, trilha, documento validado, triagem ou D10/D14. Esses são campos/eventos/alertas estruturados.

Etiquetas auxiliares canônicas permitidas:
- Prioridade: PRIORIDADE_CRITICA, PRIORIDADE_ALTA, PRIORIDADE_NORMAL
- Bloqueios: BLOQUEIO_CADASTRO, BLOQUEIO_ESCOPO, BLOQUEIO_CONTRATO, BLOQUEIO_ASSINATURA, BLOQUEIO_PAGAMENTO, BLOQUEIO_REVISAO_JURIDICA, BLOQUEIO_AUTORIZACAO_PESQUISA, BLOQUEIO_REPRESENTACAO_MENOR, BLOQUEIO_DOSSIE
- Família: NUCLEO_FAMILIAR, TEM_DEPENDENTE_MENOR, MULTIPLOS_TITULARES, INTERLOCUTOR_TERCEIRO
- Pesquisa: PESQUISA_DOCUMENTAL, PESQUISA_GENEALOGICA, PESQUISA_MULTIPAIS, FONTE_EXTERNA_RELEVANTE
- Documentação: PENDENCIA_DOCUMENTAL_CLIENTE, RETIFICACAO_POSSIVEL, TRADUCAO_APOSTILA_POSSIVEL, DIVERGENCIA_DOCUMENTAL
- Comunicação: COMUNICACAO_REQUER_APROVACAO, ATUALIZACAO_CLIENTE_PRIORITARIA, SEM_CONTATO_D10, SEM_ATUALIZACAO_D14
- Migração: ORIGEM_LEGADA, IMPORTADO_PLACEGO, DADO_REQUER_REVISAO, DADO_FICTICIO_A_REMOVER
- Exceção: EXCECAO_COMERCIAL, ESCOPO_SOB_DEFINICAO, CASO_MODELO_INTERNO

Criar glossário com Caso, Núcleo familiar, Pessoa, Oportunidade, Case service, Produto-pai, Trilha, Fonte, Evidência, Documento, Achado, Hipótese, Validação interna, Relatório, Micro-entrega, Pendência, Próxima ação, Touchpoint, Alerta e Etiqueta.

Sem sincronização externa.
```

---

## 9. Prompt 06 — Pesquisa, evidências e relatórios

```text
IMPLEMENTAR O CORTE 06 — PESQUISA GENEALÓGICA, EVIDÊNCIAS E RELATÓRIOS.

Pré-requisito: Cortes 01 a 05 validados.

Criar área “Pesquisa Genealógica e Evidências” com:
1. Visão de pesquisa
2. Pessoas, famílias e ramos
3. Fontes e consultas
4. Documentos e Solicitações
5. Evidências e documentos
6. Hipóteses e lacunas
7. Validação e pendências
8. Achados e micro-entregas
9. Relatórios de fase
10. Alertas e histórico

Definições:
- Pesquisa: processo de busca/cruzamento/organização.
- Fonte: origem consultada.
- Evidência: informação rastreável que sustenta fato, vínculo ou hipótese.
- Documento: evidência com arquivo ou referência documental.
- Relatório: entrega robusta baseada em evidências.
- Micro-entrega: atualização menor aprovada ao cliente.

Criar: research_items, research_people, research_sources, evidences, evidence_validations, research_hypotheses, case_reports, report_evidence_links, document_requests.

Criar naturezas de evidência: Documento original; Cópia/digitalização; Índice/transcrição; Relato; Fonte secundária; Síntese interna; Evidência de comunicação; Evidência jurídica.

Criar tipos de evidência civil, identidade/migração, nacionalidade, histórico, religioso, operacional, analítico, conversacional e jurídico conforme dicionário.

Criar status de evidência: Recebida; Registrada; Em revisão; Validada internamente; Divergente; Insuficiente; Requer complemento; Requer retificação; Requer tradução/apostila; Rejeitada/inaplicável; Aprovada para entrega ao cliente; Publicada ao cliente.

Regra: validada internamente não é conclusão jurídica nem cidadania reconhecida.

RELATÓRIOS:
Não duplicar relatórios existentes de Fase 1 e Fase 2.
Criar case_reports com:
- REPORT_F1_DIAGNOSTICO — Relatório de Diagnóstico e Direcionamento
- REPORT_F2_PESQUISA — Relatório de Pesquisa Genealógica e Evidências
- REPORT_F3_PRONTIDAO_DOCUMENTAL
- REPORT_F4_PROTOCOLO
- REPORT_F5_CONCLUSAO
- REPORT_MEM_LEGADO

Status: A preparar; Em elaboração; Em revisão; Aprovado internamente; Entregue; Arquivado.

Cada relatório vincula evidências, pendências, versão, responsável, revisor, datas, link interno e resumo aprovado ao cliente.

Para Ana:
- Pesquisa em Preparação pendente.
- Autorização de pesquisa Pendente.
- Permitir somente registrar referências internas existentes.
- Relatório Fase 1 a preparar/em elaboração conforme realidade.
- Não iniciar Relatório Fase 2 automaticamente.
- Não iniciar pesquisa externa, contato institucional, pedido ou publicação.

Mostrar a cadeia Fonte → Evidência → Validação → Relatório/Micro-entrega sem efeitos externos.
```

---

## 10. Prompt 07 — Achados genealógicos

```text
IMPLEMENTAR O CORTE 07 — ACHADOS GENEALÓGICOS ESTRUTURADOS.

Pré-requisito: Corte 06 validado.

Criar subaba “Achados Genealógicos”.

Cadeia obrigatória:
Fonte → Evidência → Validação interna → Achado Genealógico → Árvore/Linha do Tempo → Micro-entrega ou Relatório, se aprovado.

Criar genealogical_findings:
- case_id; family_id; research_item_id; primary_research_person_id; title; generation; finding_type; internal_summary; confirmed_facts; facts_to_confirm; period_start; period_end; locality; family_relationship; relevance; validation_status; evidence_links; source_links; tree_impact; timeline_impact; planning_impact; eligible_for_client_deliverable; client_deliverable_id; responsible_user_id; found_at; validated_at; internal_notes.

Tipos: Registro civil; Registro religioso; Registro militar; Migração; Naturalização/nacionalidade; Patrimônio/notarial; Correspondência familiar; Foto/acervo visual; Estrutura familiar; Linha do tempo; Localidade; Documento divergente; Resultado negativo de pesquisa; Hipótese de pesquisa; Outro.

Regras:
- Todo achado exige fonte ou evidência vinculada.
- Achado validado não equivale a decisão jurídica.
- Achado negativo registra fonte consultada, data e ação/fonte alternativa.
- Atualização da árvore/linha do tempo exige revisão antes de exposição externa.
- Elegível para cliente cria somente rascunho de micro-entrega.
- Achado com nova pendência/próxima ação gera alerta interno e tarefa datada.

Criar visualização card/tabela sem publicar ao cliente.
```

---

## 11. Prompt 08 — Plano de ação e terceiros

```text
IMPLEMENTAR O CORTE 08 — PLANO DE AÇÃO DE PESQUISA, URGÊNCIAS, INSTITUIÇÕES E PREVISÃO DE TERCEIROS.

Pré-requisito: Cortes 06 e 07 validados.

Criar subaba “Plano de Ação de Pesquisa”.

Criar research_action_plan_items:
- case_id; research_item_id; document_request_id; evidence_id; finding_id; institution_id; action_type; priority; reason; status; due_date; responsible_user_id; suggested_channel; communication_draft; requires_human_approval; contacted_at; contact_result_internal; next_action; next_check_at; estimated_cost_amount; estimated_cost_currency; expense_approval_status; payer; internal_evidence_link.

Ações: Reenviar lembrete; Telefonar; Verificar protocolo/pedido; Pesquisar fonte alternativa; Solicitar documento; Revisar evidência; Pedir esclarecimento; Encaminhar para parceiro; Preparar estimativa; Outro.

Prioridade: Crítica; Alta; Média; Baixa.
Status: Planejada; Pronta para revisão; Aguardando aprovação; Aprovada; Realizada; Aguardando resposta; Concluída; Cancelada.

Regras:
- Crítica com prazo hoje/vencido gera alerta imediato no Cockpit para Tatiana.
- Alta aparece em Esta Semana.
- Aguardando resposta exige next_check_at.
- Ação externa cria rascunho e exige aprovação humana.
- Ação realizada cria crm_interaction imutável.
- Não enviar comunicação.

Criar institutions como referências reutilizáveis, com e-mail/telefone/horário, fonte, última verificação e estado de atualização.

Criar expense_estimates para previsão interna; nunca caixa/reembolso do Clube.
- Cliente/família paga diretamente ao terceiro ou antecipa valor aprovado.
- Não criar despesa real, cobrança ou pagamento.

Usar qualquer exemplo histórico somente como development_fixture e excluir de Cockpit de produção.
```

---

## 12. Prompt 09 — Cockpit e higiene de dados

```text
IMPLEMENTAR O CORTE 09 — COCKPIT DIÁRIO E HIGIENE DE DADOS.

Pré-requisito: Cortes 01 a 08 validados.

Criar Cockpit “Hoje” com:
- Calls de hoje
- Follow-ups vencidos
- Leads/casos sem próxima ação
- Aceites verbais aguardando confirmação formal
- Confirmações formais aguardando formalização
- Contratos enviados aguardando assinatura
- Pagamentos aguardados
- Onboardings bloqueados
- Casos sem responsável, dossiê, plano ou case service
- Pendências documentais críticas
- Ações críticas de pesquisa
- Rechecagens vencidas
- Evidências aguardando validação
- Relatórios em revisão
- Micro-entregas aguardando aprovação
- D10 e D14

Criar data_origin obrigatório em todos os registros relevantes:
- production_real
- migration_legacy
- development_fixture
- sandbox
- unknown_needs_review

Regras:
- development_fixture e sandbox não entram no Cockpit de produção, App Cliente, métricas ou comunicação.
- unknown_needs_review entra em fila de saneamento.
- Não excluir dados reais automaticamente.
- Gerar relatório de saneamento: preservados, migrados, fixtures, pendentes, arquivados e candidatos a exclusão.

Validar no Cockpit:
1. Ana: formalização bloqueada, próxima ação dados cadastrais, rascunho não enviado.
2. João: aceite verbal, confirmação formal em D+2.
3. Naturalização brasileira: triagem, call/checklist datado, sem caso ativo.

Não criar automações externas, dashboards de CAC/ROI, integração Placego contínua ou Asaas.
```

---

## 13. Casos de teste

### Ana Luiza

- ID: `CA-CID-AT-FAM-2026-001`
- Alias: `CA-AUT-ANALUIZA-FAM-2026-001`
- Trilha: Áustria / §58c
- Estado: confirmação formal recebida; formalização em preparação; pré-onboarding bloqueado
- Produto-pai: Diagnóstico Familiar Multipaís
- Condição: referência interna de R$ 9.600, sem cobrança
- Próxima ação: solicitar dados cadastrais
- Comunicação: rascunho WhatsApp, sem envio

### João

- Produto-pai: Diagnóstico de Cidadania por Etapas
- Trilha: Portugal / via a confirmar
- Estado: aceite verbal
- Próxima ação: solicitar confirmação formal em até D+2
- Sem contrato, cobrança, onboarding ou App

### Naturalização brasileira

- Origem: indicação
- Produto-pai: Diagnóstico de Cidadania por Etapas
- Trilha: Brasil / naturalização-residência
- Estado: triagem
- Próxima ação: confirmar call ou enviar checklist
- Sem conclusão jurídica, caso ativo ou pesquisa externa

---

## 14. Fora do escopo de hoje

- Envio efetivo de WhatsApp/e-mail.
- Webhooks e automações externas.
- Criação de cliente, cobrança, assinatura ou pagamento Asaas.
- Geração/assinatura de contrato ou Ordem de Serviço.
- Criação/alteração de pastas e arquivos no Drive.
- Pesquisa externa, pedido de certidão, contato institucional ou diligência.
- Simulador jurídico, score de elegibilidade ou prazo automático.
- CAC, ROI, atribuição de mídia e dashboards financeiros avançados.
- Sincronização contínua Placego.
- Publicação automática de conteúdo no App Cliente.
