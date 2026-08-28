# CA-LOVABLE-CRM-Discovery-Roteiro-Vivo-Trilhas-Jurídicas v1.0

**Projeto:** Clube Ancestral  
**Data:** 21/08/2026  
**Status:** Prompt de implementação final para Lovable  
**Escopo:** Painel de Calls/Discovery, roteiro vivo, trilhas jurídicas internas e regras de decisão  
**Decisão de produto:** Implementar somente o corte abaixo. Não criar arquitetura paralela, automações externas, cálculo jurídico automático, novos SKUs por país ou dashboards adicionais.

---

## 1. Objetivo

Consolidar o **Painel de Calls** como a camada estruturada de entrada, Discovery, triagem comercial/técnica preliminar e handoff para o CRM/Desk do Clube Ancestral.

O Painel deve ajudar a equipe a conduzir boas conversas, registrar contexto verificável, selecionar a trilha de referência adequada e encaminhar a próxima ação. Ele não deve concluir elegibilidade, rota jurídica, cidadania, prazo institucional, preço, contrato, cobrança, pesquisa externa ou onboarding.

A meta é concluir este último corte de CRM/Discovery com qualidade suficiente para operar a jornada completa da Ana Luiza e o fluxo padronizado de João, sem depender de novas expansões no Lovable.

---

## 2. Limites de arquitetura

Preservar esta separação sem exceção:

```text
Painel de Calls / Leads
  entrada, Discovery, consentimento, SPIN, triagem e handoff

CRM / Conversão
  oportunidades, proposta, aceite, confirmação formal, formalização e eventos imutáveis

Biblioteca Mestre / citizenship_tracks
  marcos jurídicos de referência, fontes oficiais, vigência, revisão e status da trilha

Desk / Casos 360
  caso, núcleo, dossiê, tarefas, documentos, evidências, plano, onboarding e entregas

App Cliente
  apenas conteúdo aprovado, sanitizado e explicitamente liberado
```

O Painel de Calls **não** é:

- Fonte de verdade de preço, SKU, condição comercial, link Asaas, contrato ou pagamento.
- Dossiê de pesquisa, repositório de documento bruto, fonte ou evidência genealógica.
- Motor de decisão jurídica, elegibilidade, cálculo de prazo ou recomendação automática de rota.
- Tela de envio de WhatsApp, e-mail, convite, cobrança ou automação externa.

---

## 3. Regras globais obrigatórias

1. Aplicar `organization_id`, autenticação, autorização por papel e RLS em todas as entidades e consultas.
2. Não permitir exclusão física de calls, interações, triagens, trilhas, marcos, eventos ou logs. Arquivar com motivo, autor e data.
3. Todo campo classificatório usa catálogo/lista fechada. Rejeitar valor fora da lista no banco e no servidor.
4. Texto livre somente para resumo validado, observações internas, narrativa familiar, limites autorizados, links internos e justificativas de exceção.
5. Todo lead ativo exige área responsável, responsável nominal, próxima ação e data de próxima ação.
6. Nenhuma informação de transcrição, WhatsApp, relato ou reunião se torna fato, parentesco, evidência validada, rota jurídica ou conteúdo client-facing automaticamente.
7. Triagem é preliminar e interna. Usar linguagem de `sinal`, `hipótese`, `a confirmar`, `em revisão`, `possível com pesquisa` e `inconclusivo`.
8. Todo avanço relevante deve gerar evento/auditoria append-only com ator, data/hora, origem, estado anterior, estado novo e justificativa quando aplicável.
9. Não enviar comunicação externa por este escopo.
10. Dados demo ficam identificados por `is_demo=true`, ocultos por padrão e excluídos de métricas reais.

---

## 4. Modelo de dados

Aproveitar entidades existentes quando compatíveis. Não duplicar modelo de CRM.

### 4.1 Interações

Usar `crm_interactions` como entidade canônica; call é um tipo de interação.

Campos mínimos:

```text
id
organization_id
lead_id/opportunity_id/case_id/contact_id conforme aplicável
interaction_type: call | whatsapp | email | meeting | internal_note
occurred_at
direction: inbound | outbound | internal
status
consent_status
consent_at
consent_channel
consent_notice_version
recording_or_transcript_internal_url
summary_validated
next_action
next_action_due_at
responsible_area
responsible_user_id
event_source
created_at
created_by
supersedes_interaction_id opcional
```

### 4.2 Triagem de Discovery

Criar ou adaptar `discovery_assessments`, ligada a uma `crm_interaction` de tipo `call` ou `meeting`:

```text
id
organization_id
interaction_id
lead_id/opportunity_id
objective_main
nationality_interest[]
priority_country_line
family_structure
potential_applicants_count
ancestor_generation
ancestor_name_or_reference opcional e interno
known_localities
transmission_line
preliminary_path
preliminary_path_status
reference_track_id
reference_legal_milestone_id opcional
triage_signal
triage_confidence
documentation_complexity
initial_document_state
line_break_risks[]
key_document_types[]
priority_document_gap
language_or_interview_requirement
prior_research_authorization
prior_research_scope[]
prior_research_limit_note
primary_objection
intent_level
discovery_outcome
internal_notes
created_at
created_by
updated_at
updated_by
```

### 4.3 Trilhas jurídicas internas

Criar ou aproveitar uma coleção governada dentro da Biblioteca Mestre chamada `citizenship_tracks`.

Campos mínimos:

```text
id
organization_id
country
track_name
preliminary_path
legal_reference_label
legal_reference_summary
official_source_name
official_source_url
path_status: aberta | aberta_com_requisito | aberta_com_prazo | restrita | encerrada | em_confirmacao_juridica | nao_aplicavel
last_verified_at
review_required: obrigatoria | dispensa_homologada | a_definir
entry_requirements
common_risks
priority_document_types[]
language_or_interview_requirement
external_research_applicable
external_research_authorization_required
client_safe_explanation
version
owner_id
approval_criterion
approval_evidence_reference
lifecycle_status
is_active
created_at
updated_at
```

A tabela deve seguir o ciclo governado da Biblioteca Mestre:

```text
rascunho → em_revisao → homologado → vigente → substituido/suspenso/arquivado
```

Não permitir que trilha sem versão, responsável, critério/evidência e aprovação autorizada fique vigente.

### 4.4 Marcos jurídicos de referência

Criar `legal_reference_milestones` ligada a `citizenship_tracks`:

```text
id
track_id
label
reference_type: lei | artigo | regulamento | procedimento | prazo | requisito | fonte_oficial
summary_internal
official_source_url
status: vigente | a_revisar | desatualizado | historico | encerrado
verified_at
verified_by
review_required
notes
version
lifecycle_status
```

O marco jurídico selecionado no Painel é uma referência de triagem. Ele não é parecer jurídico, garantia de direito ou instrução automática para cliente.

---

## 5. Catálogos fechados

Criar/manter `CATALOGOS`/listas versionadas para os valores abaixo. Mudança de vocabulário exige auditoria.

### 5.1 Origem do lead

```text
Diagnóstico rápido site
Diagnóstico profundo site
WhatsApp orgânico
Instagram
Indicação
Google orgânico
Google Ads
Evento
Parceiro
Base antiga
Placego importado
Outro
```

### 5.2 Objetivo principal

```text
Cidadania
Pesquisa de origem
Genealogia / árvore
Memória familiar
Pós-cidadania
Documento específico
Outro
```

### 5.3 Nacionalidade de interesse

Permitir múltipla seleção controlada:

```text
Italiana
Portuguesa
Espanhola
Alemã
Austríaca
Polonesa
Húngara
Luxemburguesa
Croata
Romena
Europeia geral
Em investigação
Outra UE — validar antes de ofertar
```

### 5.4 País/linha prioritária

```text
Itália
Portugal
Espanha
Alemanha
Áustria
Polônia
Hungria
Luxemburgo
Croácia
Romênia
Multipaís
A definir
```

### 5.5 Status de call

```text
Agendada
Confirmada
Realizada
Remarcada
No-show
Cancelada pelo lead
Cancelada pelo Clube
```

### 5.6 Área responsável

```text
Comercial
Pesquisa
Operações
Financeiro
Jurídico/parceiro
A definir
```

### 5.7 Sinal de aderência preliminar

```text
Forte
Provável
Possível com pesquisa
Baixa
Inconclusiva
Sem aderência atual
```

### 5.8 Confiança da triagem

```text
Alta — documentos-chave vistos
Média — narrativa e parte documental
Baixa — apenas relato inicial
```

### 5.9 Via jurídica preliminar

```text
Descendência / jus sanguinis
Reparação histórica
Linha materna judicial
Memória Democrática
Descendência direta
Recuperação de nacionalidade
Naturalização / residência
Via familiar
Via a confirmar
Sem via identificada
```

### 5.10 Status da via

```text
Aberta
Aberta com requisito específico
Aberta com prazo
Restrita
Encerrada para novos pedidos
Em confirmação jurídica
Não aplicável
```

### 5.11 Geração do ascendente

```text
Pai/mãe
Avô/avó
Bisavô/bisavó
Trisavô/trisavó
Tetravô/tetravó ou anterior
Ainda não identificado
```

### 5.12 Linha de transmissão

```text
Paterna
Materna
Mista
Linha única ainda não confirmada
```

### 5.13 Risco de ruptura na linha

Permitir múltipla seleção:

```text
Nenhum identificado
Naturalização estrangeira
Divergência de nomes/datas
Casamento/estado civil
Linha materna pré-1948
Adoção/reconhecimento
Falta de certidão
Perseguição/prova histórica
Migração/localidade incerta
Outro
Em investigação
```

### 5.14 Complexidade documental

```text
Baixa
Média
Alta
Muito alta
```

### 5.15 Estado documental inicial

```text
Documentos-chave disponíveis
Documentos parciais
Só informações orais
Árvore/nomes sem certidões
Sem dados suficientes
```

### 5.16 Documento-chave

```text
Certidão de nascimento
Certidão de casamento
Certidão de óbito
Passaporte
Registro de imigração
Registro militar
Registro religioso
Naturalização/negativa de naturalização
Registro consular
Prova de perseguição
Documento pessoal do requerente
Nenhum ainda
```

### 5.17 Pendência documental prioritária

```text
Certidão de nascimento
Certidão de casamento
Certidão de óbito
Naturalização/negativa
Passaporte
Imigração
Registro militar
Registro religioso
Retificação
Tradução
Apostila
Prova histórica
Documento pessoal do requerente
Nenhuma
A definir
```

### 5.18 Idioma/entrevista

```text
Não
Sim — idioma
Sim — entrevista
Sim — ambos
A confirmar
```

### 5.19 Estrutura familiar

```text
Individual
Casal
Núcleo familiar
Família ampliada
Linha com menores
A definir
```

### 5.20 Autorização de pesquisa prévia

```text
Não solicitada
Pendente
Registrada
Não autorizada
Não aplicável
```

### 5.21 Escopo de pesquisa prévia

```text
Triagem pública
Documentos fornecidos
Pesquisa genealógica
Outro
```

### 5.22 Objeção predominante

```text
Preço
Prazo
Falta de documentos
Dúvida de elegibilidade
Família/decisor
Confiança
Momento financeiro
Idioma
Comparação com concorrente
Não houve
Outro
```

### 5.23 Nível de intenção

```text
Alta — quer avançar
Média — precisa avaliar
Baixa — exploratório
Sem intenção atual
```

### 5.24 Resultado da Discovery

```text
Avançar para diagnóstico
Avançar para proposta
Solicitar documentos
Pesquisa prévia
Nutrição
Sem aderência
Encerrar
```

### 5.25 Próxima ação

```text
Confirmar call
Enviar checklist
Solicitar documentos
Revisar documentos
Preparar diagnóstico
Enviar proposta
Cobrar retorno
Preparar formalização
Enviar contrato
Confirmar pagamento
Iniciar onboarding
Encerrar
Outro
```

---

## 6. Roteiro vivo de Discovery

Adicionar à ficha de Call um painel recolhível chamado **Roteiro vivo de Discovery**. Ele não é formulário obrigatório integral; é guia contextual de perguntas e campos relacionados.

### 6.1 Abertura e contexto

Perguntas sugeridas:

1. “O que você gostaria de organizar, esclarecer ou viabilizar neste momento?”
2. “Seu interesse está mais ligado a cidadania, origem familiar, documentos, memória ou uma combinação desses objetivos?”
3. “Há algum país, pessoa da família ou história que aparece como ponto de partida?”
4. “Quem participa dessa decisão e quem pode estar envolvido na jornada?”

Preencher quando houver resposta:

- Objetivo principal
- Nacionalidade(s) de interesse
- País/linha prioritária
- Estrutura familiar
- Número de requerentes potenciais
- Responsável e próxima ação

### 6.2 Linha familiar e pessoas

Perguntas sugeridas:

1. “Quem é o ascendente que conecta a família a esse país?”
2. “O que vocês já sabem sobre nome, localidade, data e parentesco dessa pessoa?”
3. “Essa linha parece paterna, materna ou ainda precisa ser confirmada?”
4. “Há casamento, mudança de nome, migração, naturalização, adoção, reconhecimento ou outra situação que mereça atenção?”
5. “Existem menores, outros titulares ou familiares que possam precisar participar mais adiante?”

Preencher quando houver resposta:

- Geração do ascendente
- Linha de transmissão
- Localidades conhecidas
- Riscos de ruptura
- Estrutura familiar
- Requerentes potenciais

### 6.3 Documentos e lacunas

Perguntas sugeridas:

1. “Quais documentos a família já possui ou sabe onde localizar?”
2. “Qual certidão, nome, data, local ou vínculo parece mais incerto?”
3. “Há documentos de nascimento, casamento, óbito, imigração, naturalização, passaporte, igreja, exército ou consulado?”
4. “O que seria mais útil confirmar primeiro para reduzir a incerteza?”

Preencher quando houver resposta:

- Estado documental inicial
- Documento-chave disponível
- Pendência documental prioritária
- Complexidade documental
- Confiança da triagem

### 6.4 Trilha, requisitos e marcos

Perguntas sugeridas:

1. “Vocês já investigaram alguma via ou país específico?”
2. “Existe idioma, entrevista, deslocamento ou exigência externa que possa influenciar a jornada?”
3. “Faz sentido registrar uma pesquisa prévia limitada? Qual seria o escopo?”
4. “Há alguma informação que precise de revisão jurídica antes de ser apresentada como caminho possível?”

Preencher quando houver resposta:

- Via jurídica preliminar
- Status da via
- Trilha de referência
- Marco jurídico de referência
- Fonte oficial do marco
- Status de atualização do marco
- Idioma/entrevista
- Autorização e escopo de pesquisa prévia

### 6.5 Decisão e próximo passo

Perguntas sugeridas:

1. “O que você precisa entender para decidir com segurança?”
2. “Sua principal preocupação é investimento, documentos, tempo, família, confiança, idioma ou outra questão?”
3. “Qual próximo passo seria mais útil agora: diagnóstico, checklist, documentos, proposta, nova conversa ou nutrição?”
4. “Quem será responsável por esse próximo passo e qual prazo é realista?”

Preencher:

- Objeção predominante
- Nível de intenção
- Resultado da Discovery
- Próxima ação
- Prazo da próxima ação
- Área responsável
- Responsável nominal

---

## 7. Trilhas jurídicas iniciais

Cadastrar as trilhas abaixo como conteúdo interno, inicialmente com status `em_revisao` ou `homologado` conforme a evidência já disponível. Não mostrar para clientes. Não apresentar prazo estimado como promessa.

| País | Via de referência | Marco de referência | Status inicial de uso |
|---|---|---|---|
| Itália | Descendência / jus sanguinis | Lei nº 91/1992; questões de linha materna pré-1948 requerem atenção específica | Em revisão jurídica quando aplicável |
| Portugal | Descendência direta / outras vias a confirmar | Lei da Nacionalidade nº 37/1981 | Em revisão conforme linha e documentação |
| Espanha | Memória Democrática e outras vias aplicáveis | Ley 20/2022, de Memoria Democrática; janelas e vias exigem verificação atual | A revisar antes de nova oferta baseada em prazo |
| Alemanha | Reparação histórica / Art. 116(2) e §15 StAG quando aplicável | Grundgesetz Art. 116(2); StAG §15 | Revisão humana obrigatória |
| Áustria | Reparação histórica | §58c StbG | Revisão humana obrigatória; evidência de perseguição/fuga conforme caso |
| Polônia | Confirmação de cidadania por descendência | Legislação e procedimento de confirmação aplicáveis | Revisão documental obrigatória |
| Hungria | Naturalização simplificada / descendência | Regime de naturalização simplificada | Revisar idioma/entrevista e documentação |
| Luxemburgo | Recuperação/descendência conforme regime aplicável | Lei de Nacionalidade e procedimento vigente | Revisão documental obrigatória |
| Croácia | Descendência e vias aplicáveis | Marco oficial a homologar | Não ofertar como rota concluída sem revisão |
| Romênia | Descendência e cidadania aplicável | Marco oficial a homologar | Não ofertar como rota concluída sem revisão |
| Multipaís | Em investigação | Não aplicável | Triagem e pesquisa documental inicial |

Para cada trilha, registrar fonte oficial verificável na Biblioteca Mestre. Links, texto legal, vigência e interpretação devem ser revisados e versionados por responsável autorizado.

---

## 8. Regras de decisão e bloqueios

Implementar no servidor e banco. Interface apenas explica a regra.

### 8.1 Lead ativo

```text
Lead ativo exige:
- área responsável
- responsável nominal
- próxima ação
- data da próxima ação

Se faltar qualquer item, bloquear avanço relevante e abrir exceção de qualidade.
```

### 8.2 Call realizada

```text
Status = Realizada exige:
- resumo validado
- resultado da Discovery
- próxima ação
- prazo da próxima ação

Se houver gravação/transcrição:
- consentimento = Concedido
- data/hora do consentimento
- canal do consentimento
- versão do aviso
```

Consentimento `Recusado` ou `Não solicitado` bloqueia gravação, transcrição e URL interna associada.

### 8.3 SPIN

```text
SPIN Concluído exige:
- situação registrada
- problema/lacuna objetiva registrada
- implicação explicada no resumo
- necessidade/valor verbalizado ou próximo passo confirmado
```

Não permitir marcar SPIN concluído apenas por checkboxes sem resumo correspondente.

### 8.4 Triagem forte ou provável

```text
Sinal de aderência Forte ou Provável exige:
- confiança da triagem
- via preliminar
- geração do ascendente
- linha de transmissão
- estado documental inicial
- referência de trilha ou marco, quando aplicável
```

Mesmo com todos os campos preenchidos, o status continua sendo triagem preliminar; não equivale a elegibilidade comprovada ou parecer jurídico.

### 8.5 Marco jurídico

```text
Marco a revisar ou desatualizado:
- pode ser visível internamente
- não pode ser apresentado como vigente em proposta ou comunicação externa
- bloqueia recomendação de rota/protocolo baseada nesse marco
- exige revalidação humana na Biblioteca Mestre
```

### 8.6 Pesquisa prévia

```text
Sem autorização aplicável registrada:
- bloquear pesquisa nominal externa
- bloquear pedido institucional
- bloquear contato com órgão/arquivo em nome do cliente
- bloquear solicitação externa personalizada
- bloquear entrega derivada de pesquisa externa
```

A triagem pública ou organização de documentos fornecidos pode ocorrer somente dentro do escopo autorizado e registrado.

### 8.7 Produto, SKU e despesas

```text
Produtos/serviços recomendados = referência controlada.
SKU = somente leitura, consultado após produto/serviço recomendado.

Não permitir:
- digitação livre de SKU
- digitação livre de preço
- digitação livre de condição comercial
- digitação livre de link Asaas
- criação de cobrança pelo Painel
```

Despesas de terceiros:

```text
Status Aprovada exige:
- referência de proposta/escopo aplicável
- aprovação registrada
- faixa de despesa
- responsável pagador
- regra: pagamento direto pelo cliente ao terceiro

Nunca registrar como caixa, desembolso ou reembolso do Clube.
```

### 8.8 Lifecycle separado

Manter eixos independentes:

```text
Eixo comercial:
Novo lead → Triagem → Discovery agendada → Discovery realizada →
Diagnóstico em elaboração → Proposta enviada → Negociação →
Nutrição | Perdido | Encerrado sem aderência

Eixo formalização/operação:
Não iniciado → Confirmação formal recebida → Formalização em preparação →
Contrato enviado → Contrato assinado → Pagamento inicial confirmado →
Onboarding iniciado → Caso ativo → Arquivado
```

Resultado comercial é derivado. Ele nunca substitui esses dois eixos.

Regras:

- Aceite verbal não cria cliente ativo, contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente.
- Confirmação formal libera apenas preparação interna da formalização.
- Contrato assinado exige referência interna ao instrumento e evidência válida de assinatura.
- Pagamento confirmado exige referência transacional autorizada.
- Onboarding exige contrato assinado e pagamento inicial confirmado, além dos gates aplicáveis.
- Caso ativo exige onboarding iniciado e requisitos de ativação validados.
- Perdido exige motivo de perda.

### 8.9 Dossi e handoff

```text
Um núcleo pode ter um dossiê-mãe compartilhado.
Cada requerente mantém registro individual e vínculo próprio.

Não criar caso, dossiê operacional, acesso de portal ou onboarding apenas por lead,
Discovery, proposta, aceite verbal ou confirmação formal.
```

---

## 9. Handoff sem duplicação

Implementar somente referências estruturadas entre camadas:

```text
Painel de Calls
→ registra call, consentimento, SPIN, resumo, triagem e próxima ação

CRM / oportunidade
→ recebe campos estruturados aprovados: objetivo, país, responsável,
autorização de pesquisa, eixos, proposta e eventos

Desk / Caso 360
→ recebe somente após gates de cliente/onboarding/responsável/ambiente

App Cliente
→ recebe somente entregas e conteúdo aprovados/sanitizados
```

Nunca transmitir ao App Cliente:

- Gravação, transcrição, call privada ou nota interna.
- Documento bruto, fonte, evidência, hipótese, risco ou decisão interna.
- Marco jurídico, score, sinal de aderência, preço provisório, SKU técnico, link interno, saldo, margem ou logs.
- Dados de terceiros sem autorização específica.

---

## 10. Interface

Ajustar somente `/leads` e subpainéis contextuais existentes. Não criar abas primárias novas.

A ficha de lead deve ter seções recolhíveis:

1. Entrada e responsabilidade.
2. Call, consentimento e SPIN.
3. Triagem preliminar.
4. Documentos e linha familiar.
5. Pesquisa prévia autorizada.
6. Oferta e despesas de terceiros.
7. Lifecycle e handoff.
8. Roteiro vivo de Discovery.

Mostrar sinais de qualidade:

- Sem responsável.
- Sem próxima ação.
- Prazo vencido.
- Consentimento ausente para gravação.
- Marco a revisar/desatualizado.
- Triagem forte/provável incompleta.
- Pesquisa externa bloqueada.
- Via restrita/encerrada/em confirmação jurídica.

Não usar cores como única informação. Exibir texto e motivo.

---

## 11. Testes obrigatórios

1. Campo classificatório rejeita valor fora do catálogo.
2. Lead ativo sem área, responsável, próxima ação ou prazo é recusado/bloqueado conforme política.
3. Call realizada sem resumo, resultado ou próxima ação datada falha.
4. Consentimento recusado/não solicitado bloqueia gravação, transcrição e URL associada.
5. Consentimento concedido sem data, canal ou versão do aviso falha.
6. SPIN concluído sem resumo correspondente falha.
7. Sinal forte/provável sem dependências obrigatórias falha.
8. Marco a revisar/desatualizado bloqueia comunicação externa como se estivesse vigente.
9. Pesquisa nominal externa falha sem autorização aplicável registrada.
10. SKU não ativo/homologado não pode ser selecionado.
11. Preço, condição e link Asaas não podem ser digitados no Painel.
12. Despesa de terceiro não vira pagamento, caixa ou reembolso do Clube.
13. Aceite verbal e confirmação formal não liberam contrato, cobrança, onboarding, pesquisa externa ou portal.
14. Contrato/pagamento não avançam sem referências autorizadas.
15. Dossiê familiar permite um dossiê-mãe com requerentes individuais vinculados.
16. Dados internos da Call, transcrição, triagem e marco não aparecem no App Cliente.
17. Registro demo nunca serve como fallback para dado real faltante.
18. Usuário de outra organização não consulta, altera ou vincula lead/call/trilha de outra organização.
19. Typecheck, testes e build passam antes de considerar a implementação concluída.

---

## 12. Fora de escopo

Não implementar nesta rodada:

- Automação de WhatsApp, e-mail, push, fallback ou campanhas.
- Criação de contrato, cobrança, assinatura, produto, SKU, preço ou link Asaas.
- Simulador que calcule elegibilidade, score, prazo jurídico, rota definitiva ou resultado.
- Sugestão automática de SKU por nacionalidade.
- Pesquisa externa automática, consulta nominal, pedidos institucionais ou integração com acervos.
- Webhooks e sincronização externa.
- Nova aba principal de pesquisa, SLA, KPI ou checklist.
- Exposição de triagem jurídica, hipóteses ou fontes internas ao cliente.

---

## 13. Entrega esperada

Ao finalizar, apresentar:

1. Migrations, entidades e campos criados/adaptados.
2. Rotas e componentes alterados.
3. Catálogos fechados aplicados.
4. Trilhas/marcos cadastrados com status e versão.
5. Regras de decisão e bloqueios implementados no servidor/banco.
6. Handoff implementado sem duplicação de dados.
7. Testes executados e resultado.
8. Lista de pendências reais, se existirem.
9. Confirmação expressa de que nenhuma mensagem, cobrança, contrato, pesquisa externa, acesso de portal ou automação externa foi disparada.
