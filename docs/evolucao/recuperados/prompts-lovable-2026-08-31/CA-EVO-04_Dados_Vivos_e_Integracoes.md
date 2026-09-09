# CA-EVO-04 — DADOS VIVOS E INTEGRAÇÕES

**Projeto:** Clube Ancestral
**Data de início:** 15/08/2026
**Natureza:** inventário, reconciliação, definição de fontes de verdade, contratos de dados e especificação de integrações.
**Referência interna:** CA-EVO-02 (Automações, Gatilhos e Sobreposições) + CA-EVO-03 (Motor Contratual Modular) → CA-EVO-04.

---

## 1. DECLARAÇÃO EXECUTIVA DE GOVERNANÇA DE DADOS

### 1.1. Fontes oficiais por domínio

| Domínio | Fonte de verdade primária | Função |
|---|---|---|
| Entrada de leads, status comercial, aceite e handoff | CRM/Painel (`CA · OP · CRM MESTRE`) | Sistema operacional de entrada e pipeline comercial |
| SKU, preço sugerido, escopo, condição, status e link autorizado | Planilha Mestre de Produtos | Catálogo autorizado de produtos e condições |
| Cliente, cobrança, pagamento e assinatura | Asaas | Sistema transacional financeiro |
| Caso, pesquisa, evidências, documentos, pendências, decisões e histórico operacional | Desk/Dossiê | Sistema operacional de caso |
| Cronograma, marcos, responsáveis e etapas operacionais | Planejador Universal | Sistema operacional de planejamento |
| Documentos operacionais de clientes ativos | Google Drive Compartilhado | Ambiente operacional documental |
| Conteúdo aprovado, sanitizado e elegível para exibição | App Cliente / Ancestral Canvas / One Page | Sistema de exibição ao cliente |
| Backup e histórico | Dropbox | Sistema histórico (não operacional) |

### 1.2. Classificação dos sistemas

| Classificação | Sistemas |
|---|---|
| **Operacionais** | CRM/Painel, Planilha Mestre, Desk/Dossiê, Planejador Universal, Google Drive Compartilhado |
| **Transacional** | Asaas |
| **Histórico** | Dropbox |
| **Exibição** | App Cliente / Ancestral Canvas, One Page |
| **Auxiliares (não fonte de verdade até prova)** | Google Tasks, Google Calendar, Google Forms |
| **Automação (configurado, pendente de teste)** | Apps Script CRM Webhook (Lovable → Sheets) |

### 1.3. Regra de precedência quando houver conflito

1. **Preço, escopo, SKU e condição:** Planilha Mestre prevalece sobre proposta, Planejador e Asaas.
2. **Status comercial, aceite e handoff:** CRM/Painel prevalece sobre Planejador e OPS.
3. **Dados transacionais (cobrança, pagamento, assinatura):** Asaas prevalece sobre Planilha Mestre e CRM. Asaas nunca define preço, escopo ou elegibilidade.
4. **Caso, evidências, documentos e histórico operacional:** Desk/Dossiê prevalece sobre Drive e Dropbox.
5. **Cronograma, marcos e etapas:** Planejador Universal prevalece sobre Google Calendar e Google Tasks até que relação entre eles seja comprovada.
6. **Proposta e versão-mestre:** Canva prevalece sobre Dropbox (backup) e cópias PPTX/PDF.
7. **Contrato-base:** Modelo de Estudo Genealógico é a única matriz jurídica vigente. Modelo Simples, Modelo 2024 e genérico v2 não são operacionais.
8. **Dropbox:** nunca é fonte operacional nem define versão vigente.

### 1.4. Regra de bloqueio para dados não comprovados

- Dado ausente: `PENDENTE_DE_DADO`.
- Evidência não localizada nesta sessão: `NAO_LOCALIZADO_NESTA_SESSAO`.
- Evidência histórica sem validação direta: `PENDENTE_DE_VERIFICACAO_DIRETA`.
- Registros divergentes: `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO`.
- Ações futuras dependentes de condição: `BLOQUEADO_POR_GATILHO` ou `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO`.
- Nenhuma integração deve criar, preencher, enviar ou assinar contrato, Ordem de Serviço ou anexo.
- A existência de template, planilha, integração documentada ou arquivo encontrado não é prova de aplicação a um caso.

### 1.5. Limite do CA-EVO-04

CA-EVO-04 é uma especificação de governança e integração. Não executa integrações, não altera sistemas externos, não cria nem corrige registros. Consultas diretas a fontes, se necessárias, são exclusivamente de leitura e devem registrar evidência, escopo, data e limitação.

---

## 2. MAPA DE FONTES DE VERDADE

### 2.1. Tabela de fontes de verdade por domínio

| Domínio de dados | Entidade ou objeto | Fonte de verdade primária | Fonte(s) auxiliar(es) | Consumidores autorizados | Identificador-chave | Atualização esperada | Evidência verificável | Estado global | Risco de duplicidade/conflito | Regra de precedência | Ação futura permitida |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Lead/contato | Lead | CRM/Painel (`CA · OP · CRM MESTRE`, aba `Leads_Raw`) | Apps Script webhook (Lovable → Sheets); Dropbox (histórico) | CRM operacional; Dashboard; Pipeline_Vendas | `Lead_ID` (gerado por webhook Apps Script) | Evento: submissão de formulário no app Lovable | Memory: `apps_script_crm_webhook.md`; sessions/2026-07-27_2026-08-02/1e49058e | `CONFIGURADO_PENDENTE_DE_TESTE` | CRM_Pipeline_legado e Pipeline_Vendas podem sobrepor-se ao webhook ativo | CRM/Painel (webhook) prevalece sobre CRM_Pipeline_legado | Definir Pipeline_Vendas como CRM ativo; arquivar CRM_Pipeline_legado |
| Oportunidade e status comercial | Opportunity | CRM/Painel (aba `CRM_Pipeline`) | Pipeline_Vendas (OPS); CRM_Pipeline_legado (OPS) | Dashboard; Planejador; Desk | `Opportunity_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: mudança de status comercial | Auditoria Mãe Seção 3.2 e 4.2; CRM_Pipeline_legado VAZIO; Pipeline_Vendas com zeros | `DOCUMENTADO_SEM_IMPLEMENTACAO` | 3 locais concorrentes para CRM, nenhum com dados reais | CRM/Painel (CRM_Pipeline) prevalece; Pipeline_Vendas como auxiliar | Definir Pipeline_Vendas como CRM ativo; arquivar CRM_Pipeline_legado |
| Aceite comercial | Aceite comercial | CRM/Painel (registro de aceite) | Dossiê; WhatsApp Business | Desk; Planejador; Asaas (gatilho) | `Opportunity_ID` + data de aceite | Evento: confirmação escrita de aceite | CA-EVO-01 seção 1, 4 e 5; mensagem informada por Tatiana em 15/08/2026 | `IMPLEMENTADO_E_ATIVO` (registro manual, não automatizado) | Aceite pode ser registrado em múltiplos locais (CRM, dossiê, WhatsApp) | CRM/Painel é fonte canônica; dossiê como evidência de apoio | Automatizar registro de aceite no CRM via webhook ou formulário |
| Caso e ID canônico | Case | Desk/Dossiê | Planilha go-live (`checklists_go_live_casos_clientes`); CRM/Painel | Planejador; Drive; Asaas; App | `Case_ID` (ID_CANONICO_PENDENTE_DE_CONFIRMACAO) | Evento: abertura formal de caso | CA-10A1; divergência: CA-CID-AT-FAM-2026-001 (dossiê) vs CA-AUT-ANALUIZA-FAM-2026-001 (go-live) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` | 2 IDs para o mesmo caso; risco de inconsistência entre CRM, Planejador e Desk | Desk/Dossiê propõe o ID; confirmação formal pela gestora | Eleger formalmente um ID canônico; não criar terceiro ID |
| Cliente/contratante | Client | CRM/Painel (cadastro) | Dossiê; Asaas (customer) | Desk; Planejador; Drive; App | `Client_ID` (PENDENTE_DE_IMPLEMENTACAO); `Asaas_Customer_ID` | Evento: cadastro de cliente | CA-EVO-03: dados cadastrais pendentes de coleta | `PENDENTE_DE_DADO` | Cadastro pode existir em CRM, Asaas e dossiê sem reconciliação | CRM/Painel é fonte de cadastro; Asaas espelha | Coletar dados cadastrais validados; reconciliar com Asaas |
| Núcleo familiar, titulares e dependentes | Family | Dossiê (estrutura familiar) | CRM/Painel; Planilha go-live | Desk; Planejador; Contrato; App | `Family_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: definição do núcleo familiar | CA-10A1; dossiê Ana Luiza com 13 seções; estrutura familiar registrada | `IMPLEMENTADO_E_ATIVO` (dossiê); `PENDENTE_DE_DADO` (dados cadastrais) | Estrutura pode divergir entre dossiê, CRM e proposta | Dossiê prevalece sobre CRM e proposta para estrutura familiar | Validar dados cadastrais de cada titular/dependente |
| Proposta e versão-mestre | Proposal | Canva (template-mestre) | Dropbox (backup); PPTX/PDF individuais | CRM/Painel; Desk; App (One Page) | `Proposal_ID` + `Proposal_Version` (PENDENTE_DE_IMPLEMENTACAO) | Evento: criação ou revisão de proposta | CA-10A1 itens #10-19; Ana Luiza: 9 cópias no Dropbox; fonte-mestre no Canva | `IMPLEMENTADO_E_ATIVO` (Canva); `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (Dropbox) | 9 cópias da mesma proposta no Dropbox — alto risco de confusão de versão | Canva prevalece como master; Dropbox é backup | Consolidar versões aparentes em 1 oficial; não criar novas cópias |
| SKU, produto, preço, condição e link autorizado | SKU | Planilha Mestre de Produtos | Asaas (produtos); Proposta; Planejador | CRM/Painel; Desk; App; Asaas | `SKU` (código na Planilha Mestre) | Evento: alteração de catálogo ou preço | Auditoria Mãe Seção 9; esteira de pagamento com valores conflitantes; CA-EVO-02 item #11 (Produtos_Master vs Reconciliação Asaas/Planilha) | `IMPLEMENTADO_E_ATIVO` | Valores conflitantes entre proposta, Planejador e Planilha Mestre (Giovanna 4 versões, João 3, Ana Luiza R$5.900 vs R$4.800, Portugal R$5.300 vs R$3.800, Sophi R$1.436 vs R$990) | Planilha Mestre prevalece sobre proposta, Planejador e Asaas | Reconciliar e congelar valores na Planilha Mestre; sincronizar Asaas |
| Contrato e Ordem de Serviço | Contract / Order_Service | Modelo de Estudo Genealógico (contrato-base); Anexo I (OS) | Drive (documentos por caso); Dossiê | Desk; Asaas (gatilho); App | `Contract_ID`; `Order_Service_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: preparação e assinatura de contrato | CA-EVO-03: Anexo I confirmado por exportação direta (Google Doc 1sK6c8q...); Modelo de Estudo confirmado (Google Doc 17TW-mdc...) | `IMPLEMENTADO_E_ATIVO` (global); `PENDENTE_DE_DADOS_E_PREPARACAO` (caso Ana Luiza) | 3 modelos concorrentes resolvidos no CA-EVO-03; contrato específico é placeholder | Modelo de Estudo Genealógico é única matriz; Anexo I operacionaliza | Preparar contrato específico após coleta de dados e revisão jurídica |
| Dados de cobrança, pagamento e assinatura | Asaas_Customer / Asaas_Subscription / Asaas_Payment | Asaas | Planilha Mestre (preço sugerido); CRM/Painel (status) | CRM/Painel; Planejador; Desk | `Asaas_Customer_ID`; `Asaas_Subscription_ID`; `Asaas_Payment_ID` | Evento: cobrança, pagamento, cancelamento | Memory: `asaas_subscription_configuration.md`; configuração planejada/documentada em memória para Ana Luiza (CA-CID-AT-FAM-2026-001); não comprovada como ativação transacional nesta etapa | `CONFIGURADO_PENDENTE_DE_TESTE` (configuração documentada em memória, não ativada transacionalmente) | Asaas nunca define preço, escopo ou elegibilidade; pode divergir da Planilha Mestre | Asaas é fonte transacional; Planilha Mestre define preço | Ativar cobrança após contrato assinado e OS aprovada |
| Despesas externas | Expense | Dossiê (registro de despesa); Anexo II (autorização) | Asaas (link de pagamento); Planilha Mestre | Desk; Planejador | `Expense_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: despesa externa concreta aprovada | CA-EVO-03: Anexo II PENDENTE_DE_VERIFICACAO_DIRETA | `PENDENTE_DE_VERIFICACAO_DIRETA` (Anexo II); `BLOQUEADO_POR_GATILHO` (caso Ana Luiza) | Anexo II não localizado no Drive nesta sessão | Dossiê registra; Anexo II autoriza; Asaas cobra | Verificar Anexo II no Drive; não usar até confirmação |
| Pesquisa e diligência | Research_Authorization | Anexo III (autorização); Dossiê | Planejador (cronograma); Desk | Desk; Drive; App (sanitizado) | `Research_Authorization_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: autorização de pesquisa assinada | CA-EVO-03: Anexo III IMPLEMENTADO_E_ATIVO (Google Doc 1nN1xpR...) | `IMPLEMENTADO_E_ATIVO` (global); `BLOQUEADO_POR_GATILHO` (caso Ana Luiza) | Pesquisa pode ser iniciada sem autorização formal se gatilho não for respeitado | Anexo III autoriza; Dossiê registra execução | Ativar pesquisa após Anexo III assinado e contrato vigente |
| Documentos e evidências | Drive_Document | Google Drive Compartilhado | Dossiê; Dropbox (backup) | Desk; App (sanitizado) | `Drive_Document_ID` (Google Doc ID) | Evento: criação ou atualização de documento | CA-10A1; CA-EVO-03: exportação direta de Anexo I e Anexo III confirmada | `IMPLEMENTADO_E_ATIVO` (Drive); `NAO_LOCALIZADO_NESTA_SESSAO` (pasta 01_Modelos-e-Jurídico) | Dropbox pode conter cópias desatualizadas; 9 cópias de proposta Ana Luiza | Drive é operacional; Dropbox é backup | Não criar novas cópias; consolidar versões em Drive |
| Cronograma, etapa, responsável e SLA | Calendar / Schedule | Planejador Universal | Google Calendar (auxiliar, não confirmado); Google Tasks (auxiliar, não confirmado) | Desk; CRM/Painel; App | `Calendar_Event_ID` (PENDENTE_DE_IMPLEMENTACAO); `Task_ID` | Evento: definição de marco ou etapa | Auditoria Mãe Seção 2; Planejador com 12 abas; IDs duplicados; #ERROR! no RESUMO_CASOS | `CONFIGURADO_PENDENTE_DE_TESTE` | IDs duplicados no Planejador (CA-CID-IT-2026-001 e CA-CID-PT-2026-001 usados para 2 clientes cada); Google Calendar vs arquivo .ics | Planejador prevalece sobre Google Calendar e Tasks | Corrigir IDs e #ERROR! antes de usar com dados vivos |
| Tarefas | Task | OPS Tarefas (Painel Mestre OPS, aba Tarefas) | Google Tasks (auxiliar, não confirmado) | Desk; Planejador | `Task_ID` (T-001 a T-043) | Evento: criação ou atualização de tarefa | Auditoria Mãe Seção 3.2; 43 tarefas registradas (T-001 a T-043); muitas pendentes | `DOCUMENTADO_SEM_IMPLEMENTACAO` | OPS Tarefas vs Google Tasks — 2 sistemas concorrentes | Definir OPS Tarefas como sistema ativo; não duplicar no Google Tasks | Definir sistema de tarefa ativo; integrar com Planejador |
| Calendário | Calendar_Event | Google Calendar | Planejador (fonte de verdade de cronograma); arquivo editorial .ics | Desk; App | `Calendar_Event_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: agendamento de marco ou reunião | CA-EVO-02 item #12: Google Calendar vs arquivo editorial .ics | `DOCUMENTADO_SEM_IMPLEMENTACAO` | Google Calendar vs .ics — sobreposição não resolvida | Planejador é fonte de cronograma; Google Calendar é exibição se integrado | Confirmar relação entre Planejador e Google Calendar antes de integrar |
| Nacionalidade/linha/via jurídica | Nationality / Line | Planilha Mestre (parâmetros oficiais) | Site (8); Planejador PARAMETROS (11); MARCOS_JURIDICOS (8-9); OPS dropdown (9) | CRM/Painel; Desk; App; Proposta | Código de nacionalidade (PENDENTE_DE_IMPLEMENTACAO) | Evento: definição de catálogo de serviços | Auditoria Mãe Seção 2.3; 4 fontes com contagens diferentes (8, 11, 8-9, 9) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` | 4 fontes concorrentes com contagens diferentes — conflito de escopo | Planilha Mestre deve ser fonte oficial; sincronizar as 4 fontes | Sincronizar fontes; definir lista oficial de nacionalidades |
| Conteúdo elegível ao App/One Page | App_Content | Desk/Dossiê (conteúdo aprovado) | App Cliente / Ancestral Canvas / One Page | App (exibição ao cliente) | `App_Content_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: aprovação de conteúdo para exibição | CA-EVO-01: App apenas recebe conteúdo aprovado, sanitizado e elegível | `PENDENTE_DE_IMPLEMENTACAO` | Conteúdo interno pode ser exposto indevidamente se não sanitizado | Desk aprova; App apenas exibe; minimização de dados | Definir regras de sanitização e elegibilidade antes de popular App |
| Logs, webhooks e integrações | Integration_Run / Log | Sheets_Export_Logs (Google Sheets) | Apps Script logs; CRM/Painel | Auditoria; Dashboard | `Integration_Run_ID` / `Log_ID` (PENDENTE_DE_IMPLEMENTACAO) | Evento: execução de webhook ou job | Memory: `apps_script_crm_webhook.md`; HTTP 405 corrigido; falso erro lógico HTTP 200 corrigido | `CONFIGURADO_PENDENTE_DE_TESTE` | Logs podem não capturar todas as falhas; webhook pode sobrepor CRM_Pipeline_legado | Sheets_Export_Logs é fonte de logs; CRM é consumidor | Testar webhook end-to-end; definir política de retenção de logs |

---

## 3. DICIONÁRIO DE ENTIDADES E IDENTIFICADORES

### 3.1. Lead_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Lead |
| **Definição** | Contato inicial recebido via formulário do app Lovable, antes de qualificação como oportunidade |
| **ID canônico proposto** | `LEAD-[sequencial]` ou UUID gerado pelo webhook |
| **IDs alternativos/localização atual** | Linha em `Leads_Raw` (Google Sheets `CA · OP · CRM MESTRE`); `whatsapp_normalizado` como chave de deduplicação |
| **Sistema proprietário** | CRM/Painel (`CA · OP · CRM MESTRE`, aba `Leads_Raw`) via Apps Script webhook |
| **Campos mínimos obrigatórios** | origem, nome, whatsapp, e-mail, IDs do Lovable, scores, LGPD aceita, status, diagnóstico JSON |
| **Campos sensíveis/LGPD** | nome, whatsapp, e-mail, diagnóstico (dados pessoais) |
| **Relações** | 1:1 → Contact_ID; 1:1 → Opportunity_ID |
| **Estado de reconciliação** | `CONFIGURADO_PENDENTE_DE_TESTE` |
| **Regra de geração/uso do ID** | Gerado automaticamente pelo webhook Apps Script ao receber payload de `saveDiagnosis`/`saveQuickLead`; deduplicação por `whatsapp_normalizado` |
| **Evidência** | Memory: `apps_script_crm_webhook.md`; sessions/2026-07-27_2026-08-02/1e49058e L9689-L9709, L10325-L10436 |

### 3.2. Contact_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Contact |
| **Definição** | Pessoa de contato qualificada a partir de um lead, com dados cadastrais validados |
| **ID canônico proposto** | `CONTACT-[sequencial]` ou UUID |
| **IDs alternativos/localização atual** | Linha em `CRM_Pipeline` (Google Sheets); `whatsapp_normalizado` como chave |
| **Sistema proprietário** | CRM/Painel (`CA · OP · CRM MESTRE`, aba `CRM_Pipeline`) |
| **Campos mínimos obrigatórios** | nome completo, whatsapp, e-mail, origem, status, data de qualificação |
| **Campos sensíveis/LGPD** | nome, whatsapp, e-mail, dados pessoais |
| **Relações** | N:1 → Lead_ID; 1:1 → Opportunity_ID; 1:N → Case_ID |
| **Estado de reconciliação** | `PENDENTE_DE_IMPLEMENTACAO` (convenção de ID a definir) |
| **Regra de geração/uso do ID** | Atribuído na qualificação do lead; deduplicação por `whatsapp_normalizado` |
| **Evidência** | Auditoria Mãe Seção 3.2 e 4.2; CRM_Pipeline_legado VAZIO; Pipeline_Vendas com zeros |

### 3.3. Opportunity_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Opportunity |
| **Definição** | Oportunidade comercial associada a um contato, com status de pipeline |
| **ID canônico proposto** | `OPP-[sequencial]` ou UUID |
| **IDs alternativos/localização atual** | Linha em `CRM_Pipeline`; Pipeline_Vendas (OPS); CRM_Pipeline_legado (OPS) |
| **Sistema proprietário** | CRM/Painel (`CA · OP · CRM MESTRE`, aba `CRM_Pipeline`) |
| **Campos mínimos obrigatórios** | Contact_ID, status, valor estimado, data de criação, origem |
| **Campos sensíveis/LGPD** | Valor estimado (interno) |
| **Relações** | N:1 → Contact_ID; 1:1 → Case_ID (após handoff); 1:1 → Proposal_ID |
| **Estado de reconciliação** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (3 locais concorrentes, nenhum com dados reais) |
| **Regra de geração/uso do ID** | Atribuído na criação da oportunidade no CRM; não duplicar em Pipeline_Vendas ou CRM_Pipeline_legado |
| **Evidência** | Auditoria Mãe Seção 3.2 e 4.2; 3 CRMs concorrentes mapeados no CA-EVO-02 item #1 |

### 3.4. Case_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Case |
| **Definição** | Caso genealógico formalmente aberto, associado a um cliente e núcleo familiar |
| **ID canônico proposto** | `CA-CID-[PAÍS]-FAM-[ANO]-[SEQUENCIAL]` (ex: CA-CID-AT-FAM-2026-001) |
| **IDs alternativos/localização atual** | CA-CID-AT-FAM-2026-001 (dossiê Ana Luiza); CA-AUT-ANALUIZA-FAM-2026-001 (planilha go-live) |
| **Sistema proprietário** | Desk/Dossiê (propõe); Planilha go-live (registra) |
| **Campos mínimos obrigatórios** | ID, cliente, país, linha/via, data de abertura, status, responsável |
| **Campos sensíveis/LGPD** | Dados do cliente e família |
| **Relações** | 1:1 → Opportunity_ID; 1:1 → Family_ID; 1:N → Drive_Document_ID; 1:N → Task_ID; 1:N → Calendar_Event_ID |
| **Estado de reconciliação** | `ID_CANONICO_PENDENTE_DE_CONFIRMACAO` (divergência não resolvida) |
| **Regra de geração/uso do ID** | Gerado na abertura formal do caso; formato: CA-CID-[PAÍS]-FAM-[ANO]-[SEQ]; não criar terceiro ID |
| **Evidência** | CA-10A1; divergência de ID registrada no CA-EVO-01, CA-EVO-02 e CA-EVO-03 |

### 3.5. Family_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Family |
| **Definição** | Núcleo familiar associado a um caso, composto por titulares e dependentes |
| **ID canônico proposto** | `FAM-[Case_ID]-[SEQ]` ou derivado do Case_ID |
| **IDs alternativos/localização atual** | Estrutura familiar no Dossiê; registro na Planilha go-live |
| **Sistema proprietário** | Desk/Dossiê |
| **Campos mínimos obrigatórios** | titulares, dependentes, grau de parentesco, representação do menor (se aplicável) |
| **Campos sensíveis/LGPD** | Dados pessoais de cada membro da família |
| **Relações** | N:1 → Case_ID; 1:N → Client_ID (titulares e dependentes) |
| **Estado de reconciliação** | `IMPLEMENTADO_E_ATIVO` (estrutura no dossiê); `PENDENTE_DE_DADO` (dados cadastrais) |
| **Regra de geração/uso do ID** | Derivado do Case_ID; um Family_ID por caso |
| **Evidência** | CA-10A1; dossiê Ana Luiza com 13 seções; estrutura familiar registrada |

### 3.6. Client_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Client |
| **Definição** | Cliente/contratante formalmente cadastrado, titular ou dependente do núcleo familiar |
| **ID canônico proposto** | `CLIENT-[sequencial]` ou UUID |
| **IDs alternativos/localização atual** | Cadastro no CRM; `Asaas_Customer_ID` no Asaas; registro no Dossiê |
| **Sistema proprietário** | CRM/Painel (cadastro); Asaas (customer transacional) |
| **Campos mínimos obrigatórios** | nome completo, CPF, endereço, e-mail, telefone, data de nascimento |
| **Campos sensíveis/LGPD** | CPF, endereço, data de nascimento, dados pessoais |
| **Relações** | N:1 → Family_ID; 1:1 → Asaas_Customer_ID; 1:N → Contract_ID |
| **Estado de reconciliação** | `PENDENTE_DE_DADO` (dados cadastrais da Ana Luiza pendentes de coleta) |
| **Regra de geração/uso do ID** | Atribuído no cadastro do cliente no CRM; Asaas espelha via `Asaas_Customer_ID` |
| **Evidência** | CA-EVO-03: dados cadastrais pendentes; CA-EVO-01: aceite confirma Ana Luiza, Alice e Adair |

### 3.7. Proposal_ID e Proposal_Version

| Atributo | Valor |
|---|---|
| **Entidade** | Proposal |
| **Definição** | Proposta comercial apresentada ao cliente, com versões controladas |
| **ID canônico proposto** | `PROP-[Case_ID]-[SEQ]` + `VERSION-[SEQ]` |
| **IDs alternativos/localização atual** | Canva (template-mestre); Dropbox (9 cópias Ana Luiza); PPTX/PDF individuais |
| **Sistema proprietário** | Canva (fonte-mestre) |
| **Campos mínimos obrigatórios** | Case_ID, cliente, escopo, valor, parcelamento, validade, versão |
| **Campos sensíveis/LGPD** | Dados do cliente; valor e condições comerciais |
| **Relações** | N:1 → Opportunity_ID; 1:N → Proposal_Version; 1:1 → Contract_ID (após aceite) |
| **Estado de reconciliação** | `IMPLEMENTADO_E_ATIVO` (Canva); `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (Dropbox) |
| **Regra de geração/uso do ID** | Canva é master; cada revisão incrementa versão; Dropbox é backup, não master |
| **Evidência** | CA-10A1 itens #10-19; 9 cópias de proposta Ana Luiza no Dropbox |

### 3.8. SKU

| Atributo | Valor |
|---|---|
| **Entidade** | SKU |
| **Definição** | Unidade de produto/serviço catalogada com preço, escopo e condição |
| **ID canônico proposto** | Código de SKU na Planilha Mestre (formato existente) |
| **IDs alternativos/localização atual** | Planilha Mestre; Asaas (produtos); Proposta; Planejador |
| **Sistema proprietário** | Planilha Mestre de Produtos |
| **Campos mínimos obrigatórios** | código, produto, categoria, preço, condição, status, link autorizado |
| **Campos sensíveis/LGPD** | Preço e condições comerciais (interno) |
| **Relações** | 1:N → Proposal_ID; 1:N → Asaas_Subscription_ID |
| **Estado de reconciliação** | `IMPLEMENTADO_E_ATIVO`; `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (valores conflitantes entre sistemas) |
| **Regra de geração/uso do ID** | Planilha Mestre é fonte única; Asaas espelha; proposta e Planejador consomem |
| **Evidência** | Auditoria Mãe Seção 9; CA-EVO-02 item #11 (Produtos_Master vs Reconciliação Asaas/Planilha) |

### 3.9. Contract_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Contract |
| **Definição** | Contrato específico derivado do Modelo de Estudo Genealógico, assinado entre Clube Ancestral e cliente |
| **ID canônico proposto** | `CONTRACT-[Case_ID]-[SEQ]` |
| **IDs alternativos/localização atual** | Google Doc (quando criado); Dossiê (referência) |
| **Sistema proprietário** | Drive Compartilhado (armazenamento); Dossiê (registro) |
| **Campos mínimos obrigatórios** | Case_ID, Client_ID, escopo, valor, parcelamento, data de assinatura, método de assinatura |
| **Campos sensíveis/LGPD** | Dados pessoais das partes; valor e condições |
| **Relações** | 1:1 → Case_ID; 1:1 → Order_Service_ID; 1:N → Amendment_ID |
| **Estado de reconciliação** | `PENDENTE_DE_DADOS_E_PREPARACAO` (caso Ana Luiza: placeholder de 55 bytes) |
| **Regra de geração/uso do ID** | Derivado do Case_ID; um Contract_ID por caso (aditivos geram Amendment_ID) |
| **Evidência** | CA-EVO-03: Contrato-Mãe Ana Luiza confirmado como placeholder de 55 bytes |

### 3.10. Order_Service_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Order of Service (Anexo I) |
| **Definição** | Ordem de Serviço que individualiza escopo, entregas, valores e cronograma do caso |
| **ID canônico proposto** | `OS-[Case_ID]-[SEQ]` |
| **IDs alternativos/localização atual** | Google Doc (Anexo I, Doc ID 1sK6c8q...) |
| **Sistema proprietário** | Drive Compartilhado; Dossiê |
| **Campos mínimos obrigatórios** | Case_ID, escopo, titulares, entregas, valor, parcelamento, cronograma, critérios de aceite |
| **Campos sensíveis/LGPD** | Dados do cliente; valor e condições |
| **Relações** | 1:1 → Contract_ID; N:1 → SKU |
| **Estado de reconciliação** | `IMPLEMENTADO_E_ATIVO` (global); `PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO` (caso Ana Luiza) |
| **Regra de geração/uso do ID** | Derivado do Case_ID; uma OS por contrato |
| **Evidência** | CA-EVO-03: Anexo I confirmado por exportação direta (Google Doc 1sK6c8q...) |

### 3.11. Expense_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Expense |
| **Definição** | Despesa externa aprovada (certidões, apostilamentos, traduções, taxas, postagens) |
| **ID canônico proposto** | `EXP-[Case_ID]-[SEQ]` |
| **IDs alternativos/localização atual** | Anexo II (autorização); Dossiê (registro); Asaas (link de pagamento) |
| **Sistema proprietário** | Dossiê (registro); Anexo II (autorização) |
| **Campos mínimos obrigatórios** | Case_ID, finalidade, fornecedor, valor/teto, forma de pagamento, aprovação do cliente |
| **Campos sensíveis/LGPD** | Dados do fornecedor; valor |
| **Relações** | N:1 → Case_ID; 1:1 → Anexo II; 1:1 → Asaas_Payment_ID (se pago via Asaas) |
| **Estado de reconciliação** | `PENDENTE_DE_VERIFICACAO_DIRETA` (Anexo II não localizado no Drive) |
| **Regra de geração/uso do ID** | Um Expense_ID por despesa ou conjunto de despesas aprovadas |
| **Evidência** | CA-EVO-03: Anexo II PENDENTE_DE_VERIFICACAO_DIRETA |

### 3.12. Research_Authorization_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Research Authorization (Anexo III) |
| **Definição** | Autorização específica para pesquisa externa delimitada (finalidade, pessoa, órgão, custo, prazo) |
| **ID canônico proposto** | `RAUTH-[Case_ID]-[SEQ]` |
| **IDs alternativos/localização atual** | Google Doc (Anexo III, Doc ID 1nN1xpR...) |
| **Sistema proprietário** | Drive Compartilhado; Dossiê |
| **Campos mínimos obrigatórios** | Case_ID, nome, finalidade, pessoa relacionada, órgão/acervo, objeto, custo/teto, prazo |
| **Campos sensíveis/LGPD** | Dados pessoais da pessoa pesquisada; finalidade da pesquisa |
| **Relações** | N:1 → Case_ID; 1:1 → Expense_ID (se houver despesa vinculada) |
| **Estado de reconciliação** | `IMPLEMENTADO_E_ATIVO` (global); `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO` (caso Ana Luiza) |
| **Regra de geração/uso do ID** | Um RAUTH_ID por pesquisa externa autorizada |
| **Evidência** | CA-EVO-03: Anexo III IMPLEMENTADO_E_ATIVO (Google Doc 1nN1xpR...; modificado 10/08/2026) |

### 3.13. Power_of_Attorney_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Power of Attorney (Anexo IV) |
| **Definição** | Procuração para diligência concreta que exija representação formal |
| **ID canônico proposto** | `POA-[Case_ID]-[SEQ]` |
| **IDs alternativos/localização atual** | Drive (não localizado nesta sessão); Dossiê (referência) |
| **Sistema proprietário** | Drive Compartilhado; Dossiê |
| **Campos mínimos obrigatórios** | Case_ID, dados do cliente, natureza da diligência, poderes necessários, órgão/destinatário |
| **Campos sensíveis/LGPD** | Dados pessoais do cliente; poderes conferidos |
| **Relações** | N:1 → Case_ID; 1:1 → Research_Authorization_ID (se vinculado) |
| **Estado de reconciliação** | `PENDENTE_DE_VERIFICACAO_DIRETA` (Anexo IV não localizado no Drive) |
| **Regra de geração/uso do ID** | Um POA_ID por diligência específica |
| **Evidência** | CA-EVO-03: Anexo IV PENDENTE_DE_VERIFICACAO_DIRETA |

### 3.14. Amendment_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Amendment (Anexo V) |
| **Definição** | Alteração posterior ao instrumento principal (escopo, preço, prazo, participantes) |
| **ID canônico proposto** | `AMD-[Contract_ID]-[SEQ]` |
| **IDs alternativos/localização atual** | Doc ID 1oi1LS3P16HjXYu-2lmNGU1JhxRVzvoA_W-ohtT5PEuQ (retornou HTTP 404) |
| **Sistema proprietário** | Drive Compartilhado; Dossiê |
| **Campos mínimos obrigatórios** | Contract_ID, tipo de alteração, detalhamento, impacto financeiro, novo aceite |
| **Campos sensíveis/LGPD** | Dados do cliente; novo aceite |
| **Relações** | N:1 → Contract_ID |
| **Estado de reconciliação** | `NAO_LOCALIZADO_NESTA_SESSAO` (Doc ID retornou HTTP 404) |
| **Regra de geração/uso do ID** | Um AMD_ID por alteração contratual |
| **Evidência** | CA-EVO-03: Anexo V NAO_LOCALIZADO_NESTA_SESSAO; HTTP 404 |

### 3.15. Asaas_Customer_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Asaas Customer |
| **Definição** | Cadastro de cliente no Asaas para fins transacionais |
| **ID canônico proposto** | ID gerado pelo Asaas (sistema externo) |
| **IDs alternativos/localização atual** | Asaas (sistema transacional) |
| **Sistema proprietário** | Asaas |
| **Campos mínimos obrigatórios** | nome, CPF/CNPJ, e-mail, telefone, endereço |
| **Campos sensíveis/LGPD** | CPF/CNPJ, endereço, dados pessoais |
| **Relações** | 1:1 → Client_ID; 1:N → Asaas_Subscription_ID |
| **Estado de reconciliação** | `BLOQUEADO_POR_GATILHO` (caso Ana Luiza: não ativado) |
| **Regra de geração/uso do ID** | Criado no Asaas após contrato assinado; espelha Client_ID do CRM |
| **Evidência** | Memory: `asaas_subscription_configuration.md`; CA-EVO-03: Asaas BLOQUEADO_POR_GATILHO |

### 3.16. Asaas_Subscription_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Asaas Subscription |
| **Definição** | Assinatura recorrente no Asaas vinculada a um cliente e caso |
| **ID canônico proposto** | ID gerado pelo Asaas |
| **IDs alternativos/localização atual** | Asaas |
| **Sistema proprietário** | Asaas |
| **Campos mínimos obrigatórios** | Asaas_Customer_ID, valor, ciclo, data de início, forma de cobrança |
| **Campos sensíveis/LGPD** | Valor; dados de pagamento |
| **Relações** | N:1 → Asaas_Customer_ID; N:1 → SKU; 1:N → Asaas_Payment_ID |
| **Estado de reconciliação** | `CONFIGURADO_PENDENTE_DE_TESTE` (configuração planejada/documentada em memória para Ana Luiza, não comprovada como ativação transacional nesta etapa) |
| **Regra de geração/uso do ID** | Criado no Asaas após contrato assinado e OS aprovada; ciclo mensal; ajuste automático de fim de semana/feriado |
| **Evidência** | Memory: `asaas_subscription_configuration.md`; 3 assinaturas para CA-CID-AT-FAM-2026-001; 1ª cobrança 01/10/2026 |

### 3.17. Asaas_Payment_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Asaas Payment |
| **Definição** | Cobrança individual no Asaas vinculada a uma assinatura |
| **ID canônico proposto** | ID gerado pelo Asaas |
| **IDs alternativos/localização atual** | Asaas |
| **Sistema proprietário** | Asaas |
| **Campos mínimos obrigatórios** | Asaas_Subscription_ID, valor, data de vencimento, status de pagamento |
| **Campos sensíveis/LGPD** | Dados de pagamento; valor |
| **Relações** | N:1 → Asaas_Subscription_ID; 1:1 → Expense_ID (se despesa via Asaas) |
| **Estado de reconciliação** | `BLOQUEADO_POR_GATILHO` (caso Ana Luiza: nenhuma cobrança gerada) |
| **Regra de geração/uso do ID** | Gerado pelo Asaas conforme ciclo da assinatura; notificação por WhatsApp, e-mail e SMS |
| **Evidência** | Memory: `asaas_subscription_configuration.md`; CA-EVO-03: Asaas BLOQUEADO_POR_GATILHO |

### 3.18. Drive_Folder_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Drive Folder |
| **Definição** | Pasta no Google Drive Compartilhado para documentos operacionais de um caso |
| **ID canônico proposto** | Google Drive Folder ID (sistema externo) |
| **IDs alternativos/localização atual** | Drive Compartilhado; estrutura por caso (ex: 00_Administração e Contrato, 01_Dossiê Histórico Compartilhado) |
| **Sistema proprietário** | Google Drive Compartilhado |
| **Campos mínimos obrigatórios** | Case_ID, nome da pasta, estrutura de subpastas, permissões |
| **Campos sensíveis/LGPD** | Permissões de acesso a dados de cliente |
| **Relações** | 1:1 → Case_ID; 1:N → Drive_Document_ID |
| **Estado de reconciliação** | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (pasta Ana Luiza criada em pré-onboarding antes de contrato assinado) |
| **Regra de geração/uso do ID** | Criar pasta após contrato assinado (gatilho); não criar antes do handshake |
| **Evidência** | CA-EVO-03: pasta do caso criada em pré-onboarding; CA-10A1: estrutura de pastas registrada |

### 3.19. Drive_Document_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Drive Document |
| **Definição** | Documento individual no Google Drive (contrato, anexo, dossiê, proposta, evidência) |
| **ID canônico proposto** | Google Doc ID (sistema externo) |
| **IDs alternativos/localização atual** | Drive Compartilhado; Dropbox (backup) |
| **Sistema proprietário** | Google Drive Compartilhado |
| **Campos mínimos obrigatórios** | Drive_Folder_ID, título, tipo, data de criação, última modificação |
| **Campos sensíveis/LGPD** | Conteúdo do documento (dados pessoais conforme tipo) |
| **Relações** | N:1 → Drive_Folder_ID; 1:1 → Contract_ID / Order_Service_ID / Anexo |
| **Estado de reconciliação** | `IMPLEMENTADO_E_ATIVO` (Drive); `NAO_LOCALIZADO_NESTA_SESSAO` (pasta 01_Modelos-e-Jurídico) |
| **Regra de geração/uso do ID** | Google Doc ID é canônico; Dropbox não define versão vigente |
| **Evidência** | CA-EVO-03: Anexo I e III confirmados por exportação direta; Anexo II, IV e V não localizados |

### 3.20. Task_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Task |
| **Definição** | Tarefa operacional associada a um caso ou processo interno |
| **ID canônico proposto** | `TASK-[SEQ]` (formato OPS T-001 a T-043 existente) |
| **IDs alternativos/localização atual** | OPS Tarefas (Painel Mestre OPS); Google Tasks |
| **Sistema proprietário** | OPS Tarefas (Painel Mestre OPS, aba Tarefas) |
| **Campos mínimos obrigatórios** | descrição, responsável, prazo, status, prioridade, Case_ID (se aplicável) |
| **Campos sensíveis/LGPD** | Descrição pode conter dados de cliente |
| **Relações** | N:1 → Case_ID; N:1 → Task_ID (dependências) |
| **Estado de reconciliação** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (43 tarefas registradas, sistema ativo não definido); `DOCUMENTADO_SEM_IMPLEMENTACAO` (Google Tasks como concorrente) |
| **Regra de geração/uso do ID** | OPS Tarefas é sistema ativo; Google Tasks é auxiliar não confirmado |
| **Evidência** | Auditoria Mãe Seção 3.2; T-007 CRM Mestre Crítica/Pendente; T-022 DRE A fazer; T-029 SKUs Em andamento |

### 3.21. Calendar_Event_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Calendar Event |
| **Definição** | Evento de calendário associado a marco, reunião ou etapa do caso |
| **ID canônico proposto** | Google Calendar Event ID (sistema externo) |
| **IDs alternativos/localização atual** | Google Calendar; arquivo editorial .ics |
| **Sistema proprietário** | Google Calendar (exibição); Planejador (fonte de cronograma) |
| **Campos mínimos obrigatórios** | título, data, duração, participantes, Case_ID (se aplicável), tipo |
| **Campos sensíveis/LGPD** | Participantes; local; descrição |
| **Relações** | N:1 → Case_ID; N:1 → Task_ID |
| **Estado de reconciliação** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (Google Calendar vs .ics não resolvido) |
| **Regra de geração/uso do ID** | Planejador é fonte de cronograma; Google Calendar é exibição se integrado |
| **Evidência** | CA-EVO-02 item #12: Google Calendar vs arquivo editorial .ics |

### 3.22. Integration_Run_ID / Log_ID

| Atributo | Valor |
|---|---|
| **Entidade** | Integration Run / Log |
| **Definição** | Registro de execução de webhook, job ou sincronização entre sistemas |
| **ID canônico proposto** | `RUN-[SEQ]` ou `LOG-[SEQ]` |
| **IDs alternativos/localização atual** | Sheets_Export_Logs (Google Sheets); Apps Script logs |
| **Sistema proprietário** | Sheets_Export_Logs (Google Sheets `CA · OP · CRM MESTRE`) |
| **Campos mínimos obrigatórios** | timestamp, origem, destino, payload, status, erro, duração |
| **Campos sensíveis/LGPD** | Payload pode conter dados pessoais |
| **Relações** | N:1 → Lead_ID; N:1 → Opportunity_ID |
| **Estado de reconciliação** | `CONFIGURADO_PENDENTE_DE_TESTE` (webhook configurado, pendente de teste end-to-end) |
| **Regra de geração/uso do ID** | Gerado automaticamente pelo Apps Script; um log por execução |
| **Evidência** | Memory: `apps_script_crm_webhook.md`; HTTP 405 corrigido; falso erro HTTP 200 corrigido |

### 3.23. Resumo de convenções de ID

| Entidade | Convenção proposta | Estado |
|---|---|---|
| Lead_ID | `LEAD-[SEQ]` ou UUID (webhook) | `CONFIGURADO_PENDENTE_DE_TESTE` |
| Contact_ID | `CONTACT-[SEQ]` ou UUID | `PENDENTE_DE_IMPLEMENTACAO` |
| Opportunity_ID | `OPP-[SEQ]` ou UUID | `PENDENTE_DE_IMPLEMENTACAO` |
| Case_ID | `CA-CID-[PAÍS]-FAM-[ANO]-[SEQ]` | `ID_CANONICO_PENDENTE_DE_CONFIRMACAO` |
| Family_ID | `FAM-[Case_ID]-[SEQ]` | `PENDENTE_DE_IMPLEMENTACAO` |
| Client_ID | `CLIENT-[SEQ]` ou UUID | `PENDENTE_DE_DADO` |
| Proposal_ID | `PROP-[Case_ID]-[SEQ]` | `PENDENTE_DE_IMPLEMENTACAO` |
| Proposal_Version | `VERSION-[SEQ]` | `PENDENTE_DE_IMPLEMENTACAO` |
| SKU | Código na Planilha Mestre | `IMPLEMENTADO_E_ATIVO` |
| Contract_ID | `CONTRACT-[Case_ID]-[SEQ]` | `PENDENTE_DE_DADOS_E_PREPARACAO` |
| Order_Service_ID | `OS-[Case_ID]-[SEQ]` | `PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO` |
| Expense_ID | `EXP-[Case_ID]-[SEQ]` | `PENDENTE_DE_VERIFICACAO_DIRETA` |
| Research_Authorization_ID | `RAUTH-[Case_ID]-[SEQ]` | `IMPLEMENTADO_E_ATIVO` (global) |
| Power_of_Attorney_ID | `POA-[Case_ID]-[SEQ]` | `PENDENTE_DE_VERIFICACAO_DIRETA` |
| Amendment_ID | `AMD-[Contract_ID]-[SEQ]` | `NAO_LOCALIZADO_NESTA_SESSAO` |
| Asaas_Customer_ID | ID gerado pelo Asaas | `BLOQUEADO_POR_GATILHO` |
| Asaas_Subscription_ID | ID gerado pelo Asaas | `CONFIGURADO_PENDENTE_DE_TESTE` |
| Asaas_Payment_ID | ID gerado pelo Asaas | `BLOQUEADO_POR_GATILHO` |
| Drive_Folder_ID | Google Drive Folder ID | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` |
| Drive_Document_ID | Google Doc ID | `IMPLEMENTADO_E_ATIVO` |
| Task_ID | `TASK-[SEQ]` (formato OPS T-###) | `DOCUMENTADO_SEM_IMPLEMENTACAO` |
| Calendar_Event_ID | Google Calendar Event ID | `DOCUMENTADO_SEM_IMPLEMENTACAO` |
| Integration_Run_ID / Log_ID | `RUN-[SEQ]` ou `LOG-[SEQ]` | `CONFIGURADO_PENDENTE_DE_TESTE` |

---

## 4. MATRIZ DE DADOS POR SISTEMA

### 4.1. CRM/Pipeline

| Atributo | Valor |
|---|---|
| **Sistema** | CRM/Pipeline (`CA · OP · CRM MESTRE`) |
| **Função** | Entrada de leads, status comercial, aceite e handoff |
| **Dados que recebe** | Payload JSON de `saveDiagnosis`/`saveQuickLead` (origem, IDs, scores, LGPD, status, diagnóstico) |
| **Dados que produz** | Linha em `Leads_Raw`; camadas em `CRM_Pipeline` e `Dashboard`; logs em `Sheets_Export_Logs` |
| **Dados que não pode definir** | Preço, escopo, SKU, elegibilidade, dados transacionais, cronograma, conteúdo de caso |
| **Fonte que o alimenta** | App Lovable (via webhook Apps Script); entrada manual |
| **Consumidores** | Dashboard; Pipeline_Vendas; Desk; Planejador; Asaas (gatilho) |
| **Cadência/evento de atualização** | Evento: submissão de formulário no app Lovable; atualização manual de status |
| **Estado global** | `CONFIGURADO_PENDENTE_DE_TESTE` (webhook); `DOCUMENTADO_SEM_IMPLEMENTACAO` (3 CRMs concorrentes) |
| **Estado no caso Ana Luiza** | `PENDENTE_DE_DADO` (não localizado como lead no CRM; aceite registrado manualmente no CA-EVO-01) |
| **Evidência** | Memory: `apps_script_crm_webhook.md`; Auditoria Mãe Seção 3.2 e 4.2; CRM_Pipeline_legado VAZIO; Pipeline_Vendas com zeros |
| **Risco** | 3 locais concorrentes (CRM_Pipeline_legado, Pipeline_Vendas, CRM Modelo); webhook pode sobrepor CRM_Pipeline_legado |
| **Bloqueio** | Webhook pendente de teste end-to-end; CRM ativo não definido |
| **Ação correta futura** | Definir Pipeline_Vendas como CRM ativo; arquivar CRM_Pipeline_legado; testar webhook end-to-end |

### 4.2. Planilha Mestre de Produtos

| Atributo | Valor |
|---|---|
| **Sistema** | Planilha Mestre de Produtos (Google Sheets) |
| **Função** | Catálogo autorizado de SKU, preço, escopo, condição, status e link autorizado |
| **Dados que recebe** | Definição de produtos, preços e condições (entrada manual pela gestora) |
| **Dados que produz** | SKU, preço sugerido, escopo, condição, status, link autorizado |
| **Dados que não pode definir** | Status comercial, dados de cliente, cobrança, cronograma, caso, evidências |
| **Fonte que o alimenta** | Entrada manual pela gestora; Auditoria Mãe (catálogo histórico) |
| **Consumidores** | CRM/Painel; Asaas (produtos); Proposta; Planejador; App; Desk |
| **Cadência/evento de atualização** | Evento: alteração de catálogo ou preço |
| **Estado global** | `IMPLEMENTADO_E_ATIVO` |
| **Estado no caso Ana Luiza** | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (valores conflitantes: R$5.900 vs R$4.800 para Ana Luiza; R$9.600 aceite confirmado) |
| **Evidência** | Auditoria Mãe Seção 9; CA-EVO-02 item #11 (Produtos_Master vs Reconciliação Asaas/Planilha); esteira de pagamento com valores conflitantes |
| **Risco** | Valores conflitantes entre proposta, Planejador e Planilha Mestre para múltiplos casos |
| **Bloqueio** | Valores não reconciliados nem congelados |
| **Ação correta futura** | Reconciliar e congelar valores na Planilha Mestre; sincronizar com Asaas |

### 4.3. Asaas

| Atributo | Valor |
|---|---|
| **Sistema** | Asaas |
| **Função** | Sistema transacional de cliente, cobrança, pagamento e assinatura |
| **Dados que recebe** | Cadastro de cliente (Asaas_Customer_ID); configuração de assinatura (valor, ciclo, data de início) |
| **Dados que produz** | Cobranças, pagamentos, status de assinatura, notificações |
| **Dados que não pode definir** | Preço, escopo, SKU, elegibilidade, status comercial, caso, cronograma, conteúdo |
| **Fonte que o alimenta** | Planilha Mestre (preço); CRM/Painel (cliente); contrato assinado (gatilho) |
| **Consumidores** | CRM/Painel (status de pagamento); Planejador (cronograma financeiro); Desk (registro) |
| **Cadência/evento de atualização** | Evento: cobrança mensal (ciclo); pagamento confirmado; cancelamento |
| **Estado global** | `CONFIGURADO_PENDENTE_DE_TESTE` (configuração documentada, não ativada) |
| **Estado no caso Ana Luiza** | `BLOQUEADO_POR_GATILHO` (3 assinaturas configuradas, não ativadas; 1ª cobrança 01/10/2026) |
| **Evidência** | Memory: `asaas_subscription_configuration.md`; 3 assinaturas familiares para CA-CID-AT-FAM-2026-001 |
| **Risco** | Asaas pode divergir da Planilha Mestre se preços não forem reconciliados |
| **Bloqueio** | Contrato não assinado; OS não aprovada; dados cadastrais pendentes |
| **Ação correta futura** | Ativar cobrança após contrato assinado, OS aprovada e dados cadastrais validados |

### 4.4. Google Drive Compartilhado

| Atributo | Valor |
|---|---|
| **Sistema** | Google Drive Compartilhado |
| **Função** | Ambiente operacional para documentos de clientes ativos |
| **Dados que recebe** | Contratos, anexos, dossiês, propostas, evidências, documentos de caso |
| **Dados que produz** | Documentos armazenados e versionados; links de compartilhamento |
| **Dados que não pode definir** | Status comercial, preço, escopo, cronograma, caso, dados transacionais |
| **Fonte que o alimenta** | Desk/Dossiê; CRM/Painel (gatilho de criação de pasta); Modelo de Estudo Genealógico |
| **Consumidores** | Desk; App (sanitizado); Dropbox (backup) |
| **Cadência/evento de atualização** | Evento: criação ou atualização de documento |
| **Estado global** | `IMPLEMENTADO_E_ATIVO` |
| **Estado no caso Ana Luiza** | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (pasta criada em pré-onboarding antes de contrato assinado) |
| **Evidência** | CA-EVO-03: Anexo I e III confirmados por exportação direta; pasta 01_Modelos-e-Jurídico NAO_LOCALIZADO_NESTA_SESSAO; pasta do caso criada em pré-onboarding |
| **Risco** | Pasta do caso criada antes do gatilho; pasta 01_Modelos-e-Jurídico não localizada; 2 pastas "asaas" com conteúdo não verificado |
| **Bloqueio** | Estrutura de pastas do caso exige validação de aderência ao fluxo |
| **Ação correta futura** | Validar criação antecipada de pastas; localizar pasta 01_Modelos-e-Jurídico; verificar pastas "asaas" |

### 4.5. Dossiê/Desk

| Atributo | Valor |
|---|---|
| **Sistema** | Dossiê/Desk (Google Docs por caso; Desk Intelligence) |
| **Função** | Fonte de caso, pesquisa, evidências, documentos, pendências, decisões e histórico operacional |
| **Dados que recebe** | Dados de varredura, memory, Drive, Canva; resultados de pesquisa; documentos de caso |
| **Dados que produz** | Dossiê consolidado (13 seções estruturadas); registro de pendências; decisões operacionais |
| **Dados que não pode definir** | Preço, SKU, status comercial, dados transacionais, elegibilidade |
| **Fonte que o alimenta** | Drive; CRM/Painel (handoff); Canva (proposta); pesquisa externa |
| **Consumidores** | Planejador; App (sanitizado); CRM/Painel (status de caso); Asaas (gatilho) |
| **Cadência/evento de atualização** | Evento: handoff comercial; conclusão de etapa; decisão operacional; evidência de pesquisa |
| **Estado global** | `IMPLEMENTADO_E_ATIVO` (dossiê-mãe); `PENDENTE_DE_IMPLEMENTACAO` (Desk Intelligence como sistema integrado) |
| **Estado no caso Ana Luiza** | `IMPLEMENTADO_E_ATIVO` (dossiê com 13 seções preenchidas); `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (pasta criada em pré-onboarding) |
| **Evidência** | CA-10A1 item #2; dossiê Ana Luiza com 13 seções; PDF exportado; pasta 01_Dossiê Histórico Compartilhado criada |
| **Risco** | Dossiê pode conter dados não sanitizados se expostos no App |
| **Bloqueio** | Desk Intelligence como sistema integrado não implementado |
| **Ação correta futura** | Definir regras de sanitização para App; integrar Desk com Planejador e CRM |

### 4.6. Planejador Universal

| Atributo | Valor |
|---|---|
| **Sistema** | Planejador Universal (Google Sheets — `CA_Planejador_Universal.xlsx`) |
| **Função** | Fonte de cronograma, marcos, responsáveis e etapas operacionais |
| **Dados que recebe** | Casos individuais; parâmetros por nacionalidade; dados de pagamento |
| **Dados que produz** | 12 abas: PARAMETROS, CASOS, LANCAMENTOS, PAGAMENTOS, RESUMO_CASOS, SIMULADOR, etc. |
| **Dados que não pode definir** | Preço, SKU, status comercial, dados transacionais, caso, evidências, documentos |
| **Fonte que o alimenta** | CRM/Painel (handoff); Desk/Dossiê (caso); Planilha Mestre (parâmetros) |
| **Consumidores** | Desk; CRM/Painel; App; Google Calendar (se integrado) |
| **Cadência/evento de atualização** | Evento: abertura de novo caso; conclusão de etapa; alteração de cronograma |
| **Estado global** | `CONFIGURADO_PENDENTE_DE_TESTE` (estrutura existe, IDs e #ERROR! pendentes de correção, dados vivos não carregados) |
| **Estado no caso Ana Luiza** | `PENDENTE_DE_DADO` (não carregado com dados vivos do caso) |
| **Evidência** | Auditoria Mãe Seção 2; 12 abas extraídas; IDs duplicados (CA-CID-IT-2026-001 e CA-CID-PT-2026-001 usados para 2 clientes cada); #ERROR! no RESUMO_CASOS; SIMULADOR vazio; typo Ana Luiza (20026) |
| **Risco** | IDs duplicados; #ERROR! em fórmulas; SIMULADOR vazio; 3 cópias no Dropbox |
| **Bloqueio** | IDs e #ERROR! devem ser corrigidos antes de usar com dados vivos |
| **Ação correta futura** | Corrigir IDs e #ERROR!; carregar dados vivos autorizados; não criar versão paralela |

### 4.7. App Cliente / Ancestral Canvas

| Atributo | Valor |
|---|---|
| **Sistema** | App Cliente / Ancestral Canvas |
| **Função** | Sistema de exibição ao cliente; recebe conteúdo aprovado, sanitizado e elegível |
| **Dados que recebe** | Conteúdo aprovado do Desk/Dossiê; dados sanitizados |
| **Dados que produz** | Exibição ao cliente; interações do cliente |
| **Dados que não pode definir** | Preço, SKU, status comercial, caso, evidências, documentos internos, dados transacionais |
| **Fonte que o alimenta** | Desk/Dossiê (conteúdo aprovado); CRM/Painel (status de exibição) |
| **Consumidores** | Cliente final |
| **Cadência/evento de atualização** | Evento: aprovação de conteúdo para exibição |
| **Estado global** | `PENDENTE_DE_IMPLEMENTACAO` (regras de sanitização não definidas) |
| **Estado no caso Ana Luiza** | `BLOQUEADO_POR_GATILHO` (conteúdo não aprovado nem sanitizado) |
| **Evidência** | CA-EVO-01: App apenas recebe conteúdo aprovado, sanitizado e elegível; CA-EVO-02: App mapeado |
| **Risco** | Conteúdo interno pode ser exposto indevidamente se não sanitizado |
| **Bloqueio** | Regras de sanitização e elegibilidade não definidas |
| **Ação correta futura** | Definir regras de sanitização; aprovar conteúdo caso a caso; popular App |

### 4.8. One Page

| Atributo | Valor |
|---|---|
| **Sistema** | One Page (skill `one-page-devolutiva-externa`) |
| **Função** | Devolutiva externa de leitura inicial de pesquisa genealógica, personalizada por cliente |
| **Dados que recebe** | Sinais iniciais da linha familiar; pendências documentais; próxima etapa recomendada |
| **Dados que produz** | Texto pronto para diagramação; versão WhatsApp; mensagens de envio e follow-up; checklist de revisão |
| **Dados que não pode definir** | Preço, SKU, status comercial, caso, dados transacionais, evidências internas não sanitizadas |
| **Fonte que o alimenta** | Desk/Dossiê (sinais iniciais); CRM/Painel (dados do lead) |
| **Consumidores** | Cliente/lead; WhatsApp Business |
| **Cadência/evento de atualização** | Evento: solicitação de devolutiva externa |
| **Estado global** | `IMPLEMENTADO_E_ATIVO` (skill disponível) |
| **Estado no caso Ana Luiza** | `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO` (não acionada para Ana Luiza) |
| **Evidência** | Skill `one-page-devolutiva-externa` carregada no projeto; descrição confirma funcionalidade |
| **Risco** | Dados não sanitizados podem ser expostos na devolutiva |
| **Bloqueio** | Conteúdo deve ser aprovado e sanitizado antes da devolutiva |
| **Ação correta futura** | Acionar skill após aprovação de conteúdo; sanitizar dados sensíveis |

### 4.9. Google Forms

| Atributo | Valor |
|---|---|
| **Sistema** | Google Forms |
| **Função** | Coleta de dados de diagnóstico e lead |
| **Dados que recebe** | Respostas de formulário (diagnóstico, dados de contato, LGPD) |
| **Dados que produz** | Payload JSON para webhook Apps Script; respostas em Sheets |
| **Dados que não pode definir** | Preço, SKU, status comercial, caso, dados transacionais |
| **Fonte que o alimenta** | App Lovable (formulário de diagnóstico); entrada manual do usuário |
| **Consumidores** | CRM/Painel (via webhook); Desk |
| **Cadência/evento de atualização** | Evento: submissão de formulário |
| **Estado global** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (formulário documentado, integração com webhook pendente de teste) |
| **Estado no caso Ana Luiza** | `PENDENTE_DE_DADO` (não localizado formulário específico para Ana Luiza) |
| **Evidência** | CA-EVO-02: Google Forms mapeado; webhook Apps Script recebe payload de `saveDiagnosis`/`saveQuickLead` |
| **Risco** | Formulário pode coletar dados sem consentimento LGPD explícito |
| **Bloqueio** | Integração com webhook pendente de teste end-to-end |
| **Ação correta futura** | Testar formulário → webhook → CRM end-to-end; validar consentimento LGPD |

### 4.10. Google Tasks

| Atributo | Valor |
|---|---|
| **Sistema** | Google Tasks |
| **Função** | Sistema auxiliar de tarefas (não fonte de verdade até prova) |
| **Dados que recebe** | Tarefas manuais; potencialmente integrado com OPS Tarefas (não confirmado) |
| **Dados que produz** | Tarefas com status, prazo, responsável |
| **Dados que não pode definir** | Status comercial, caso, cronograma, pipeline, preço, escopo |
| **Fonte que o alimenta** | Entrada manual; integração com OPS Tarefas (não confirmada) |
| **Consumidores** | Usuário interno |
| **Cadência/evento de atualização** | Evento: criação ou atualização manual de tarefa |
| **Estado global** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (não confirmado como sistema ativo) |
| **Estado no caso Ana Luiza** | `NAO_APLICAVEL` (não localizado tarefas de Ana Luiza no Google Tasks) |
| **Evidência** | CA-EVO-02 item #10: OPS Tarefas vs Google Tasks; Auditoria Mãe Seção 3.2 |
| **Risco** | Tarefas duplicadas entre OPS Tarefas e Google Tasks |
| **Bloqueio** | Relação entre OPS Tarefas e Google Tasks não comprovada |
| **Ação correta futura** | Definir OPS Tarefas como sistema ativo; não duplicar no Google Tasks |

### 4.11. Google Calendar

| Atributo | Valor |
|---|---|
| **Sistema** | Google Calendar |
| **Função** | Sistema auxiliar de calendário (não fonte de verdade até prova) |
| **Dados que recebe** | Eventos manuais; potencialmente integrado com Planejador (não confirmado) |
| **Dados que produz** | Eventos de calendário |
| **Dados que não pode definir** | Cronograma, marcos, responsáveis, status comercial, caso, pipeline |
| **Fonte que o alimenta** | Entrada manual; Planejador (se integrado, não confirmado) |
| **Consumidores** | Usuário interno; cliente (se compartilhado) |
| **Cadência/evento de atualização** | Evento: agendamento manual ou integração |
| **Estado global** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (não confirmado como fonte de calendário) |
| **Estado no caso Ana Luiza** | `NAO_APLICAVEL` (não localizado eventos de Ana Luiza no Google Calendar) |
| **Evidência** | CA-EVO-02 item #12: Google Calendar vs arquivo editorial .ics |
| **Risco** | Calendário pode divergir do Planejador se não integrado |
| **Bloqueio** | Relação entre Planejador e Google Calendar não comprovada |
| **Ação correta futura** | Confirmar relação entre Planejador e Google Calendar antes de integrar |

### 4.12. Dropbox

| Atributo | Valor |
|---|---|
| **Sistema** | Dropbox |
| **Função** | Backup/histórico; não é fonte operacional nem define versão vigente |
| **Dados que recebe** | Cópias de arquivos do Drive; propostas; materiais |
| **Dados que produz** | Cópias de segurança |
| **Dados que não pode definir** | Versão vigente, status, caso, preço, escopo, elegibilidade |
| **Fonte que o alimenta** | Drive (cópias manuais) |
| **Consumidores** | Nenhum (não operacional) |
| **Cadência/evento de atualização** | N/A (não automatizado) |
| **Estado global** | `IMPLEMENTADO_E_ATIVO` (como backup); `REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL` (como fonte) |
| **Estado no caso Ana Luiza** | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (9 cópias de proposta Ana Luiza no Dropbox) |
| **Evidência** | CA-10A1 itens #10-19; 9 cópias (5 PPTX + 4 PDF + 1 sem extensão); Auditoria Mãe Seção 1 item #8 (108 arquivos catalogados); 3 cópias do Planejador |
| **Risco** | Alto risco de uso de versão desatualizada; 9 cópias da mesma proposta |
| **Bloqueio** | Dropbox não é fonte operacional; não deve definir versão vigente |
| **Ação correta futura** | Consolidar versões aparentes em 1 oficial no Drive; não criar novas cópias no Dropbox |

### 4.13. Apps Script / Sheets_Export_Logs

| Atributo | Valor |
|---|---|
| **Sistema** | Apps Script CRM Webhook (container-bound em `CA · OP · CRM MESTRE`); Sheets_Export_Logs |
| **Função** | Receber leads do app Lovable, normalizar WhatsApp, upsert por `whatsapp_normalizado`; registrar logs |
| **Dados que recebe** | Payload JSON de `saveDiagnosis`/`saveQuickLead` (origem, IDs, scores, LGPD, status, diagnóstico) |
| **Dados que produz** | Linha em `Leads_Raw`; logs em `Sheets_Export_Logs`; camadas em `CRM_Pipeline` e `Dashboard` |
| **Dados que não pode definir** | Preço, escopo, SKU, elegibilidade, caso, cronograma, conteúdo |
| **Fonte que o alimenta** | App Lovable (formulário de diagnóstico) |
| **Consumidores** | CRM/Painel; Dashboard; auditoria |
| **Cadência/evento de atualização** | Evento: submissão de formulário no app Lovable |
| **Estado global** | `CONFIGURADO_PENDENTE_DE_TESTE` (HTTP 405 corrigido; falso erro HTTP 200 corrigido; pendente de teste end-to-end) |
| **Estado no caso Ana Luiza** | `NAO_APLICAVEL` (Ana Luiza não entrou via webhook; aceite foi manual) |
| **Evidência** | Memory: `apps_script_crm_webhook.md`; sessions/2026-07-27_2026-08-02/1e49058e L9689-L9709, L10325-L10436, L11061-L11082 |
| **Risco** | Webhook pode sobrepor CRM_Pipeline_legado; logs podem não capturar todas as falhas |
| **Bloqueio** | Pendente de teste end-to-end |
| **Ação correta futura** | Testar webhook end-to-end; definir política de retenção de logs; confirmar idempotência |

### 4.14. Skills (ca-client-go-live, Client Varredura, One Page)

| Atributo | Valor |
|---|---|
| **Sistema** | Skills: `ca-client-go-live`, `Client Varredura`, `one-page-devolutiva-externa` |
| **Função** | `ca-client-go-live`: compila, audita e indexa histórico completo do cliente (lead → go-live); `Client Varredura`: artefato/instruções da skill autônoma (NAO_LOCALIZADO_NESTA_SESSAO); `One Page`: devolutiva externa de leitura inicial |
| **Dados que recebe** | `ca-client-go-live`: memória, sessões passadas, Google Drive, Canva; `One Page`: sinais iniciais da linha familiar, pendências documentais |
| **Dados que produz** | `ca-client-go-live`: dossiê consolidado, checklist documental, estrutura de pastas no Drive, eventos de calendário, mensagem de formalização no WhatsApp, atualização da planilha go-live; `One Page`: texto pronto para diagramação, versão WhatsApp, mensagens de envio e follow-up |
| **Dados que não pode definir** | Preço, SKU, status comercial, dados transacionais, elegibilidade, caso (apenas consolida) |
| **Fonte que o alimenta** | Memória; sessões passadas; Google Drive; Canva; CRM/Painel |
| **Consumidores** | Gestora; Desk; App (sanitizado) |
| **Cadência/evento de atualização** | Evento: migração de cliente para go-live; solicitação de devolutiva |
| **Estado global** | `ca-client-go-live`: `IMPLEMENTADO_E_ATIVO` (skill disponível); `Client Varredura`: `NAO_LOCALIZADO_NESTA_SESSAO`; `One Page`: `IMPLEMENTADO_E_ATIVO` |
| **Estado no caso Ana Luiza** | `ca-client-go-live`: `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO` (não acionada para go-live); `One Page`: `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO` |
| **Evidência** | Skills carregadas no projeto; CA-EVO-02: skills mapeadas; CA-10A1: pré-onboarding deduplicado |
| **Risco** | Skills podem criar artefatos externos se acionadas sem gatilho |
| **Bloqueio** | Skills não devem ser acionadas sem gatilho, evidência e autorização |
| **Ação correta futura** | Acionar `ca-client-go-live` após contrato assinado e dados cadastrais validados; acionar `One Page` após aprovação de conteúdo |

---

## 5. CONTRATOS DE DADOS E INTEGRAÇÕES FUTURAS

### 5.A. CRM/Painel → Desk/Dossiê

| Atributo | Valor |
|---|---|
| **Origem** | CRM/Painel (`CA · OP · CRM MESTRE`, aba `CRM_Pipeline`) |
| **Destino** | Desk/Dossiê |
| **Finalidade** | Transferir lead qualificado e aceite comercial para abertura de caso |
| **Evento/gatilho** | Status comercial = "Aceite confirmado" ou "Handoff autorizado" |
| **Pré-condições** | Lead qualificado; aceite comercial registrado; dados mínimos de contato validados |
| **Campos mínimos de entrada** | Contact_ID, nome, whatsapp, e-mail, origem, status, data de aceite |
| **Transformação/validação permitida** | Normalização de WhatsApp; deduplicação por `whatsapp_normalizado`; validação de campos obrigatórios |
| **Campos de saída** | Case_ID (se gerado); registro de handoff no Dossiê; status atualizado no CRM |
| **Sistema que decide o valor de cada campo** | CRM/Painel decide status e dados de contato; Desk decide Case_ID e estrutura de caso |
| **Idempotência/deduplicação** | Um handoff por Opportunity_ID; não recriar caso se já existe |
| **Log/evidência exigidos** | Log em Sheets_Export_Logs; registro de handoff no Dossiê com timestamp |
| **Falhas possíveis** | Webhook falha; dados de contato incompletos; aceite não confirmado |
| **Comportamento em erro** | Não criar caso; registrar erro no log; manter status como "Handoff pendente" |
| **Estado de implementação** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (fluxo definido, não automatizado) |
| **Bloqueios** | Webhook pendente de teste; CRM ativo não definido; 3 CRMs concorrentes |
| **Condição explícita de ativação futura** | Após definição do CRM ativo, teste do webhook end-to-end e validação de dados de contato |

### 5.B. Planilha Mestre → Proposta/Ordem de Serviço/Asaas/App

| Atributo | Valor |
|---|---|
| **Origem** | Planilha Mestre de Produtos |
| **Destino** | Proposta (Canva); Ordem de Serviço (Anexo I); Asaas (produtos); App (catálogo) |
| **Finalidade** | Fornecer SKU, preço, escopo, condição e link autorizado para proposta, contrato, cobrança e exibição |
| **Evento/gatilho** | Criação de proposta; preparação de OS; configuração de assinatura no Asaas; atualização de catálogo no App |
| **Pré-condições** | SKU ativo na Planilha Mestre; preço e condição definidos; valores reconciliados e congelados |
| **Campos mínimos de entrada** | SKU, produto, categoria, preço, condição, status, link autorizado |
| **Transformação/validação permitida** | Validação de SKU ativo; verificação de preço e condição; rejeição se SKU inativo |
| **Campos de saída** | Preço e condição na proposta; escopo e valor na OS; produto e valor no Asaas; catálogo no App |
| **Sistema que decide o valor de cada campo** | Planilha Mestre decide SKU, preço, escopo e condição; Asaas espelha; Proposta e OS consomem |
| **Idempotência/deduplicação** | Um preço por SKU; não aceitar preço divergente de proposta ou Planejador |
| **Log/evidência exigidos** | Registro de versão da Planilha Mestre; timestamp de consulta; log de sincronização com Asaas |
| **Falhas possíveis** | SKU inativo; preço divergente entre sistemas; valores não reconciliados |
| **Comportamento em erro** | Rejeitar proposta/OS/assinatura se preço divergir; registrar divergência no log |
| **Estado de implementação** | `IMPLEMENTADO_E_ATIVO` (Planilha Mestre); `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (valores não reconciliados) |
| **Bloqueios** | Valores conflitantes entre proposta, Planejador e Planilha Mestre não reconciliados |
| **Condição explícita de ativação futura** | Após reconciliação e congelamento de valores na Planilha Mestre; sincronização com Asaas |

### 5.C. Contrato + Anexo I assinado → Asaas

| Atributo | Valor |
|---|---|
| **Origem** | Contrato assinado (Contract_ID) + Anexo I assinado (Order_Service_ID) |
| **Destino** | Asaas (criação de customer, subscription e cobrança) |
| **Finalidade** | Ativar cobrança recorrente conforme condições contratuais |
| **Evento/gatilho** | Contrato e Anexo I assinados; dados cadastrais validados; responsável pelo caso designado |
| **Pré-condições** | Contract_ID assinado; Order_Service_ID aprovado; Client_ID com dados cadastrais completos; SKU e preço definidos na Planilha Mestre; Asaas_Customer_ID criado |
| **Campos mínimos de entrada** | Case_ID, Client_ID, SKU, valor, ciclo, data de início, forma de cobrança |
| **Transformação/validação permitida** | Validação de contrato assinado; validação de SKU e preço contra Planilha Mestre; criação de Asaas_Customer_ID |
| **Campos de saída** | Asaas_Customer_ID, Asaas_Subscription_ID, Asaas_Payment_ID |
| **Sistema que decide o valor de cada campo** | Contrato e OS definem valor e parcelamento; Planilha Mestre valida SKU; Asaas executa cobrança |
| **Idempotência/deduplicação** | Uma assinatura por Case_ID + SKU; não criar assinatura duplicada |
| **Log/evidência exigidos** | Registro de ativação no Dossiê; log no Asaas; confirmação de cobrança |
| **Falhas possíveis** | Dados cadastrais incompletos; preço divergente; contrato não assinado; Asaas rejeita cadastro |
| **Comportamento em erro** | Não ativar cobrança; registrar erro; manter status como "Asaas pendente" |
| **Estado de implementação** | `BLOQUEADO_POR_GATILHO` (caso Ana Luiza: contrato não assinado) |
| **Bloqueios** | Contrato não assinado; OS não aprovada; dados cadastrais pendentes; ID canônico não confirmado |
| **Condição explícita de ativação futura** | Após contrato assinado, OS aprovada, dados cadastrais validados e ID canônico confirmado |

### 5.D. Asaas → CRM/Painel, Planejador e Desk

| Atributo | Valor |
|---|---|
| **Origem** | Asaas |
| **Destino** | CRM/Painel (status de pagamento); Planejador (cronograma financeiro); Desk (registro) |
| **Finalidade** | Sincronizar status de cobrança, pagamento e assinatura para atualização de status comercial, cronograma e caso |
| **Evento/gatilho** | Pagamento confirmado; cobrança gerada; assinatura cancelada; falha de pagamento |
| **Pré-condições** | Asaas_Subscription_ID ativa; webhook ou consulta periódica configurada |
| **Campos mínimos de entrada** | Asaas_Subscription_ID, Asaas_Payment_ID, status, valor, data |
| **Transformação/validação permitida** | Mapeamento de status do Asaas para status do CRM; validação de valor contra Planilha Mestre |
| **Campos de saída** | Status de pagamento no CRM; lançamento no Planejador; registro no Desk |
| **Sistema que decide o valor de cada campo** | Asaas decide status transacional; CRM mapeia para status comercial; Planejador registra financeiro |
| **Idempotência/deduplicação** | Um registro de pagamento por Asaas_Payment_ID; não duplicar lançamento |
| **Log/evidência exigidos** | Log em Sheets_Export_Logs; registro no Desk com timestamp; webhook do Asaas (se configurado) |
| **Falhas possíveis** | Webhook Asaas falha; status não mapeado; valor divergente |
| **Comportamento em erro** | Não atualizar status; registrar erro; manter status anterior |
| **Estado de implementação** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (webhook Asaas não configurado) |
| **Bloqueios** | Webhook Asaas não configurado; integração não implementada |
| **Condição explícita de ativação futura** | Após configuração de webhook Asaas e mapeamento de status |

### 5.E. Desk/Dossiê → Planejador

| Atributo | Valor |
|---|---|
| **Origem** | Desk/Dossiê |
| **Destino** | Planejador Universal |
| **Finalidade** | Carregar dados vivos autorizados do caso no Planejador (cronograma, marcos, responsáveis) |
| **Evento/gatilho** | Caso aberto; etapa concluída; marco definido |
| **Pré-condições** | Case_ID confirmado; dados do caso consolidados no Dossiê; IDs do Planejador corrigidos |
| **Campos mínimos de entrada** | Case_ID, cliente, país, linha/via, etapas, responsável, marcos, SLA |
| **Transformação/validação permitida** | Mapeamento de etapas do Dossiê para abas do Planejador; validação de Case_ID único |
| **Campos de saída** | Linha na aba CASOS; lançamentos na aba LANCAMENTOS; parâmetros na aba PARAMETROS |
| **Sistema que decide o valor de cada campo** | Desk decide etapas e responsáveis; Planejador estrutura cronograma |
| **Idempotência/deduplicação** | Uma linha por Case_ID na aba CASOS; não duplicar caso |
| **Log/evidência exigidos** | Registro no Dossiê de dados enviados ao Planejador; timestamp |
| **Falhas possíveis** | IDs duplicados no Planejador; #ERROR! em fórmulas; dados inconsistentes |
| **Comportamento em erro** | Não carregar dados; registrar erro; manter status como "Planejador pendente" |
| **Estado de implementação** | `CONFIGURADO_PENDENTE_DE_TESTE` (estrutura existe, IDs e #ERROR! pendentes de correção, dados vivos não carregados) |
| **Bloqueios** | IDs duplicados e #ERROR! no Planejador; dados do caso não consolidados |
| **Condição explícita de ativação futura** | Após correção de IDs e #ERROR! no Planejador e consolidação de dados do caso |

### 5.F. Desk aprovado → App Cliente/One Page

| Atributo | Valor |
|---|---|
| **Origem** | Desk/Dossiê (conteúdo aprovado e sanitizado) |
| **Destino** | App Cliente / Ancestral Canvas / One Page |
| **Finalidade** | Exibir conteúdo elegível ao cliente (devolutivas, cronograma sanitizado, marcos) |
| **Evento/gatilho** | Conteúdo aprovado pela gestora; sanitização concluída |
| **Pré-condições** | Regras de sanitização definidas; conteúdo aprovado caso a caso; dados sensíveis removidos |
| **Campos mínimos de entrada** | Case_ID, conteúdo sanitizado, tipo de exibição, data de aprovação |
| **Transformação/validação permitida** | Sanitização de dados sensíveis; minimização de dados pessoais; validação de elegibilidade |
| **Campos de saída** | Conteúdo exibido no App; devolutiva One Page; mensagem WhatsApp (se aplicável) |
| **Sistema que decide o valor de cada campo** | Desk decide conteúdo; gestora aprova sanitização; App apenas exibe |
| **Idempotência/deduplicação** | Uma versão de conteúdo por Case_ID + tipo; não duplicar exibição |
| **Log/evidência exigidos** | Registro de aprovação no Desk; log de sanitização; timestamp |
| **Falhas possíveis** | Conteúdo não sanitizado; dados sensíveis expostos; aprovação não registrada |
| **Comportamento em erro** | Não exibir conteúdo; registrar erro; manter App sem conteúdo |
| **Estado de implementação** | `PENDENTE_DE_IMPLEMENTACAO` (regras de sanitização não definidas) |
| **Bloqueios** | Regras de sanitização não definidas; conteúdo não aprovado |
| **Condição explícita de ativação futura** | Após definição de regras de sanitização e aprovação caso a caso |

### 5.G. Formulário de diagnóstico → CRM/Painel

| Atributo | Valor |
|---|---|
| **Origem** | Google Forms / App Lovable (formulário de diagnóstico) |
| **Destino** | CRM/Painel (`CA · OP · CRM MESTRE` via webhook Apps Script) |
| **Finalidade** | Capturar leads e dados de diagnóstico no CRM |
| **Evento/gatilho** | Submissão de formulário (saveDiagnosis/saveQuickLead) |
| **Pré-condições** | Formulário ativo; webhook Apps Script configurado; consentimento LGPD explícito |
| **Campos mínimos de entrada** | origem, nome, whatsapp, e-mail, IDs do Lovable, scores, LGPD aceita, diagnóstico JSON |
| **Transformação/validação permitida** | Normalização de WhatsApp; deduplicação por `whatsapp_normalizado`; validação de consentimento LGPD |
| **Campos de saída** | Linha em Leads_Raw; camadas em CRM_Pipeline e Dashboard; logs em Sheets_Export_Logs |
| **Sistema que decide o valor de cada campo** | Formulário coleta; webhook normaliza e valida; CRM armazena |
| **Idempotência/deduplicação** | Upsert por `whatsapp_normalizado`; não duplicar lead |
| **Log/evidência exigidos** | Log em Sheets_Export_Logs; payload JSON registrado |
| **Falhas possíveis** | Webhook falha; dados incompletos; consentimento LGPD não coletado |
| **Comportamento em erro** | Não criar lead; registrar erro no log; retornar erro ao formulário |
| **Estado de implementação** | `CONFIGURADO_PENDENTE_DE_TESTE` (webhook configurado, pendente de teste end-to-end) |
| **Bloqueios** | Webhook pendente de teste end-to-end |
| **Condição explícita de ativação futura** | Após teste end-to-end do webhook e validação de consentimento LGPD |

### 5.H. Webhook Lovable → Sheets_Export_Logs/CRM

| Atributo | Valor |
|---|---|
| **Origem** | App Lovable (saveDiagnosis/saveQuickLead) |
| **Destino** | Sheets_Export_Logs (Google Sheets); CRM/Painel |
| **Finalidade** | Registrar execução do webhook e logs de integração |
| **Evento/gatilho** | Submissão de formulário no app Lovable |
| **Pré-condições** | Webhook Apps Script configurado; `CA · OP · CRM MESTRE` acessível; Execute as Me / Anyone configurado |
| **Campos mínimos de entrada** | Payload JSON (origem, IDs, scores, LGPD, status, diagnóstico) |
| **Transformação/validação permitida** | Detecção explícita de erro HTTP 200 `{ok:false}`; normalização de WhatsApp; upsert |
| **Campos de saída** | Log em Sheets_Export_Logs; linha em Leads_Raw; camadas em CRM_Pipeline |
| **Sistema que decide o valor de cada campo** | Lovable envia payload; Apps Script valida e normaliza; CRM armazena |
| **Idempotência/deduplicação** | Upsert por `whatsapp_normalizado`; um log por execução |
| **Log/evidência exigidos** | Log em Sheets_Export_Logs com timestamp, payload, status, erro |
| **Falhas possíveis** | HTTP 405 (corrigido); falso erro HTTP 200 `{ok:false}` (corrigido); webhook indisponível |
| **Comportamento em erro** | Registrar erro no log; não criar lead; retornar erro ao Lovable |
| **Estado de implementação** | `CONFIGURADO_PENDENTE_DE_TESTE` (HTTP 405 e falso erro corrigidos; pendente de teste end-to-end) |
| **Bloqueios** | Pendente de teste end-to-end |
| **Condição explícita de ativação futura** | Após teste end-to-end e validação de idempotência |

### 5.I. Planejador → Google Calendar (somente se autorizado)

| Atributo | Valor |
|---|---|
| **Origem** | Planejador Universal |
| **Destino** | Google Calendar |
| **Finalidade** | Sincronizar marcos e etapas do Planejador com Google Calendar para exibição |
| **Evento/gatilho** | Marco definido no Planejador; etapa agendada |
| **Pré-condições** | Relação entre Planejador e Google Calendar comprovada; integração autorizada; IDs corrigidos |
| **Campos mínimos de entrada** | Case_ID, título, data, duração, tipo, responsável |
| **Transformação/validação permitida** | Mapeamento de marco do Planejador para evento do Calendar; validação de Case_ID |
| **Campos de saída** | Calendar_Event_ID no Google Calendar |
| **Sistema que decide o valor de cada campo** | Planejador decide cronograma; Google Calendar espelha para exibição |
| **Idempotência/deduplicação** | Um evento por marco; não duplicar evento |
| **Log/evidência exigidos** | Log de sincronização; registro no Planejador |
| **Falhas possíveis** | Integração falha; evento duplicado; data inconsistente |
| **Comportamento em erro** | Não criar evento; registrar erro; manter Calendar sem evento |
| **Estado de implementação** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (integração não autorizada nem confirmada) |
| **Bloqueios** | Relação entre Planejador e Google Calendar não comprovada; sobreposição com .ics não resolvida |
| **Condição explícita de ativação futura** | Após comprovação da relação Planejador → Calendar e autorização expressa |

### 5.J. OPS Tarefas → Google Tasks (somente após definição do sistema ativo)

| Atributo | Valor |
|---|---|
| **Origem** | OPS Tarefas (Painel Mestre OPS, aba Tarefas) |
| **Destino** | Google Tasks |
| **Finalidade** | Sincronizar tarefas operacionais com Google Tasks para acessibilidade |
| **Evento/gatilho** | Criação ou atualização de tarefa no OPS Tarefas |
| **Pré-condições** | OPS Tarefas definido como sistema ativo; relação entre OPS e Google Tasks comprovada |
| **Campos mínimos de entrada** | Task_ID, descrição, responsável, prazo, status, prioridade, Case_ID |
| **Transformação/validação permitida** | Mapeamento de status OPS → Google Tasks; validação de Task_ID único |
| **Campos de saída** | Tarefa no Google Tasks com status sincronizado |
| **Sistema que decide o valor de cada campo** | OPS Tarefas é fonte; Google Tasks espelha |
| **Idempotência/deduplicação** | Uma tarefa por Task_ID; não duplicar |
| **Log/evidência exigidos** | Log de sincronização; registro no OPS Tarefas |
| **Falhas possíveis** | Tarefa duplicada; status não mapeado; integração falha |
| **Comportamento em erro** | Não sincronizar; registrar erro; manter Google Tasks sem tarefa |
| **Estado de implementação** | `DOCUMENTADO_SEM_IMPLEMENTACAO` (sistema ativo não definido) |
| **Bloqueios** | OPS Tarefas vs Google Tasks não resolvido; sistema ativo não definido |
| **Condição explícita de ativação futura** | Após definição do sistema de tarefa ativo e comprovação da relação OPS → Google Tasks |

---

## 6. MATRIZ DE RECONCILIAÇÃO DE CONFLITOS

### 6.1. Tabela de reconciliação das 12 sobreposições herdadas do CA-EVO-02

| # | Conflito | Registros/sistemas envolvidos | Fonte de verdade proposta | Estado atual da evidência | Impacto | Regra de decisão | Dado a confirmar | Ação futura permitida | Ação proibida neste CA-EVO-04 | Responsável sugerido | Prioridade |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CRM: 3 locais concorrentes | CRM_Pipeline_legado (OPS, VAZIO); Pipeline_Vendas (OPS, com zeros); CRM Modelo (Google Sheet legado) | CRM/Painel (`CA · OP · CRM MESTRE`, aba `CRM_Pipeline`) | `DOCUMENTADO_SEM_IMPLEMENTACAO` — 3 locais mapeados, nenhum com dados reais | Alto — sem CRM ativo, leads e status não são rastreáveis | CRM/Painel (CRM_Pipeline) é fonte canônica; Pipeline_Vendas como auxiliar; arquivar CRM_Pipeline_legado | Qual CRM contém dados reais; status do CRM Modelo | Definir Pipeline_Vendas como CRM ativo; arquivar CRM_Pipeline_legado; verificar CRM Modelo | Alterar, criar ou excluir registros no CRM | Tatiana | Crítica |
| 2 | Modelos de contrato: 3 versões concorrentes | MODELO SIMPLES (Doc 19Ce0rd4...); MODELO ESTUDO (Doc 17TW-mdc...); Modelo 2024 (Doc 1yr8qLy2...) | Modelo de Estudo Genealógico (única matriz vigente) | Resolvido no CA-EVO-03 — Modelo de Estudo Genealógico = `IMPLEMENTADO_E_ATIVO`; Modelo Simples e 2024 = `REFERENCIA_HISTORICA_SEM_USO_OPERACIONAL` | Resolvido — sem impacto operacional residual | Modelo de Estudo Genealógico é única matriz; demais são histórico | N/A (resolvido) | Nenhuma (resolvido no CA-EVO-03) | Usar Modelo Simples ou 2024 como base operacional | Tatiana + advogado | Resolvida |
| 3 | Proposta Ana Luiza: 9 cópias no Dropbox | Dropbox (5 PPTX + 4 PDF + 1 sem extensão = 9 cópias); Canva (fonte-mestre) | Canva (fonte-mestre da proposta) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` — 9 cópias no Dropbox; Canva como master | Alto — risco de confusão de versão | Canva prevalece como master; Dropbox é backup, não master | Qual versão no Canva é a vigente; qual cópia no Dropbox corresponde à versão final | Consolidar versões aparentes em 1 oficial no Drive; não criar novas cópias | Mover, excluir ou consolidar arquivos no Dropbox | Tatiana | Alta |
| 4 | ID do caso Ana Luiza: divergência | CA-CID-AT-FAM-2026-001 (dossiê); CA-AUT-ANALUIZA-FAM-2026-001 (planilha go-live) | Desk/Dossiê (propõe); confirmação formal pela gestora | `ID_CANONICO_PENDENTE_DE_CONFIRMACAO` — divergência não resolvida | Alto — risco de inconsistência entre CRM, Planejador e Desk | Não escolher ID sem confirmação formal; não criar terceiro ID | Qual ID é o canônico (CA-EVO-01 recomendou CA-CID-AT-FAM-2026-001) | Eleger formalmente um ID canônico; manter o outro como alias/histórico | Criar terceiro ID; alterar registros sem confirmação | Tatiana | Crítica |
| 5 | Nacionalidades: 4 fontes concorrentes | Site (8); Planejador PARAMETROS (11); MARCOS_JURIDICOS (8-9); OPS dropdown (9) | Planilha Mestre (parâmetros oficiais) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` — 4 fontes com contagens diferentes | Médio — conflito de escopo de serviços | Planilha Mestre deve ser fonte oficial; sincronizar as 4 fontes | Lista oficial de nacionalidades; qual fonte é a vigente | Sincronizar fontes; definir lista oficial na Planilha Mestre | Alterar fontes sem reconciliação | Tatiana | Alta |
| 6 | Esteira de pagamento: valores conflitantes | Proposta; Planejador; Planilha Mestre; Asaas | Planilha Mestre (preço e condição) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` — Giovanna (4 versões), João (3), Ana Luiza (R$5.900 vs R$4.800), Portugal (R$5.300 vs R$3.800), Sophi (R$1.436 vs R$990) | Alto — múltiplos valores para o mesmo caso | Planilha Mestre prevalece; reconciliar e congelar valores | Valor vigente por caso; qual valor está no Asaas | Reconciliar e congelar valores na Planilha Mestre; sincronizar com Asaas | Alterar valores sem reconciliação; criar cobrança com valor divergente | Tatiana | Crítica |
| 7 | Etiquetas WhatsApp: CSVs ART-15 vs Manual Operacional Gem | CSVs ART-15; Manual Operacional Gem | Manual Operacional Gem (fonte operacional de etiquetas) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` — 2 fontes de etiquetas | Baixo — risco de uso de etiqueta desatualizada | Manual Operacional Gem prevalece; CSVs como referência | Qual fonte é a vigente; quais etiquetas estão em uso | Sincronizar etiquetas; definir fonte oficial | Alterar etiquetas sem reconciliação | Tatiana | Média |
| 8 | Follow-up: sequências D0-D14 vs Gem de Follow-up | Sequências D0-D14; Gem de Follow-up | Gem de Follow-up (fonte operacional de sequência) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` — 2 sequências concorrentes | Médio — risco de envio de mensagem incorreta | Gem de Follow-up prevalece; D0-D14 como referência | Qual sequência é a vigente; qual está em uso | Sincronizar sequências; definir fonte oficial | Enviar mensagens sem reconciliação | Tatiana | Média |
| 9 | Varredura: Client Varredura vs fase 1 de ca-client-go-live | Client Varredura (skill autônoma, NAO_LOCALIZADO_NESTA_SESSAO); ca-client-go-live (skill ativa, fase 1 = varredura) | ca-client-go-live (skill ativa) | `NAO_LOCALIZADO_NESTA_SESSAO` (Client Varredura); `IMPLEMENTADO_E_ATIVO` (ca-client-go-live) | Médio — risco de duplicação de varredura | ca-client-go-live prevalece; Client Varredura como referência histórica | Conteúdo e localização dos artefatos da Client Varredura | Confirmar se Client Varredura ainda é necessária ou foi absorvida por ca-client-go-live | Acionar Client Varredura sem confirmação | Tatiana | Média |
| 10 | Tarefas: OPS Tarefas vs Google Tasks | OPS Tarefas (Painel Mestre OPS, T-001 a T-043); Google Tasks | OPS Tarefas (sistema ativo proposto) | `DOCUMENTADO_SEM_IMPLEMENTACAO` (OPS); `DOCUMENTADO_SEM_IMPLEMENTACAO` (Google Tasks) | Médio — risco de tarefas duplicadas | Definir OPS Tarefas como sistema ativo; não duplicar no Google Tasks | Relação entre OPS e Google Tasks; qual é o sistema ativo | Definir sistema de tarefa ativo; integrar com Planejador | Duplicar tarefas entre sistemas | Tatiana | Média |
| 11 | Catálogo: Produtos_Master vs Reconciliação Asaas/Planilha Mestre | Produtos_Master; Asaas (produtos); Planilha Mestre | Planilha Mestre (fonte de SKU e preço) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` — Produtos_Master vs Asaas vs Planilha Mestre | Alto — preços e produtos podem divergir | Planilha Mestre prevalece; Asaas espelha; Produtos_Master como referência | Qual catálogo é o vigente; quais produtos estão no Asaas | Reconciliar catálogo; sincronizar Asaas com Planilha Mestre | Alterar produtos ou preços sem reconciliação | Tatiana | Alta |
| 12 | Calendário: Google Calendar vs arquivo editorial .ics | Google Calendar; arquivo editorial .ics | Planejador Universal (fonte de cronograma) | `DOCUMENTADO_SEM_IMPLEMENTACAO` — sobreposição não resolvida | Baixo — risco de evento desatualizado | Planejador é fonte de cronograma; Google Calendar é exibição se integrado; .ics como referência | Relação entre Planejador e Google Calendar; qual .ics é o vigente | Confirmar relação entre Planejador e Calendar antes de integrar | Criar eventos sem confirmação de fonte | Tatiana | Média |

---

## 7. QUALIDADE, LGPD E TRILHA DE AUDITORIA

### 7.1. Classificação de dados

| Classificação | Descrição | Exemplos no Clube Ancestral |
|---|---|---|
| **Público** | Dados disponíveis publicamente, sem restrição | Site (nacionalidades); catálogo público de serviços; One Page sanitizada |
| **Interno** | Dados operacionais internos, sem dados pessoais sensíveis | Status de pipeline; OPS Tarefas; parâmetros do Planejador; logs de integração (sem payload) |
| **Pessoal** | Dados pessoais de clientes e equipe | Nome, CPF, endereço, e-mail, telefone, whatsapp; diagnóstico do lead; estrutura familiar; dados cadastrais |
| **Pessoal sensível / Alto risco operacional** | Dados cuja exposição cause dano significativo | Dados de menores (representação do menor); dados de pagamento (cartão, conta); conteúdo de pesquisa genealógica (linhagem familiar); diagnóstico completo; dados de procuração |

### 7.2. Validações mínimas por entidade

| Entidade | Validações mínimas |
|---|---|
| Lead | Origem válida; WhatsApp normalizado; consentimento LGPD coletado; deduplicação por `whatsapp_normalizado` |
| Contact | Nome completo; WhatsApp único; e-mail válido; origem rastreável |
| Opportunity | Status válido no pipeline; valor estimado > 0; Contact_ID associado |
| Case | Case_ID único e canônico; cliente identificado; país e linha definidos; responsável designado |
| Family | Titulares e dependentes identificados; grau de parentesco; representação do menor (se aplicável) |
| Client | Nome completo; CPF válido; endereço completo; e-mail; telefone; dados conferidos entre CRM, Asaas e Dossiê |
| Proposal | Versão controlada; Case_ID associado; valor e parcelamento conferidos com Planilha Mestre |
| SKU | Código único na Planilha Mestre; preço > 0; status ativo; link autorizado válido |
| Contract | Case_ID associado; partes identificadas; escopo e valor conferidos; método de assinatura definido; assinatura confirmada |
| Order_Service | Contract_ID associado; escopo e entregas definidos; valor e parcelamento conferidos; critérios de aceite definidos |
| Asaas_Subscription | Asaas_Customer_ID criado; valor conferido com Planilha Mestre; ciclo definido; data de início definida |
| Drive_Folder | Case_ID associado; estrutura de subpastas conforme fluxo; permissões restritas |
| Task | Descrição clara; responsável designado; prazo definido; Case_ID (se aplicável) |
| Calendar_Event | Título claro; data definida; Case_ID (se aplicável); tipo definido |
| Integration_Run | Timestamp; origem e destino; payload (sanitizado); status; erro (se houver) |

### 7.3. Regras de completude, unicidade, consistência e atualidade

| Dimensão | Regra |
|---|---|
| **Completude** | Todo caso ativo deve ter: Case_ID canônico, Client_ID com dados cadastrais, Contract_ID assinado, OS aprovada, Asaas_Subscription ativa, Drive_Folder criada, Planejador carregado, responsável designado. Lacunas devem ser marcadas `PENDENTE_DE_DADO`. |
| **Unicidade** | Um Case_ID por caso; um Contract_ID por caso; uma Asaas_Subscription por Case_ID + SKU; um Drive_Folder por caso; um Lead_ID por `whatsapp_normalizado`. Divergências devem ser marcadas `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO`. |
| **Consistência** | Preço na Proposta = Preço na Planilha Mestre = Preço no Asaas. Status no CRM = Status no Desk. Case_ID no Dossiê = Case_ID no Planejador = Case_ID na go-live. Divergências devem ser registradas e não resolvidas por inferência. |
| **Atualidade** | Status comercial atualizado no CRM em até 24h após mudança. Status de pagamento atualizado em até 24h após confirmação no Asaas. Cronograma atualizado no Planejador em até 48h após mudança de etapa. Logs de integração em tempo real. |

### 7.4. Campos que exigem confirmação humana

| Campo | Motivo da confirmação humana |
|---|---|
| Case_ID canônico | Divergência entre dois IDs; exige decisão formal da gestora |
| Valor e parcelamento | Valores conflitantes entre sistemas; exige reconciliação e congelamento |
| Dados cadastrais de cliente | Dados pessoais sensíveis; exige validação direta com o cliente |
| Aceite comercial | Exige confirmação escrita; não pode ser presumido |
| Aprovação de despesa externa | Exige autorização formal do cliente |
| Autorização de pesquisa | Exige Anexo III assinado |
| Conteúdo para App/One Page | Exige aprovação e sanitização pela gestora |
| Método de assinatura eletrônica | Exige definição jurídica (REQUER_REVISAO_JURIDICA) |
| Foro | Exige decisão jurídica (São Paulo/SP vs domicílio da cliente) |
| Responsável pelo caso | Exige designação interna |

### 7.5. Regras de minimização de dados para App/One Page

| Regra | Descrição |
|---|---|
| Sanitização obrigatória | Todo conteúdo enviado ao App deve passar por sanitização: remoção de dados sensíveis, dados internos, dados de outros clientes, dados de equipe, notas internas e informações não elegíveis |
| Minimização | Enviar ao App somente o mínimo necessário para a experiência do cliente: sinais iniciais da linha familiar (sem dados completos de terceiros), pendências documentais (sem dados pessoais de terceiros), próxima etapa recomendada |
| Aprovação caso a caso | Cada envio ao App deve ser aprovado individualmente pela gestora; não existe aprovação automática |
| Proibição de dados internos | OPS Tarefas, logs, status de pipeline, dados financeiros internos, dados de equipe e dados de outros clientes não devem ser exibidos no App |
| One Page | A devolutiva One Page deve conter somente: sinais iniciais da linha familiar, pendências documentais e próxima etapa; dados excluídos devem ser registrados |

### 7.6. Política de logs de sincronização e erros

| Regra | Descrição |
|---|---|
| Log obrigatório | Toda execução de webhook, job ou sincronização deve gerar log em Sheets_Export_Logs com: timestamp, origem, destino, payload (sanitizado), status, erro (se houver), duração |
| Retenção | Logs devem ser retidos por no mínimo 90 dias; política de descarte definitiva requer definição (REQUER_REVISAO_JURIDICA) |
| Monitoramento | Logs com erro devem ser revisados em até 48h; falhas recorrentes devem ser escaladas |
| Evidência | Logs são evidência de execução; ausência de log indica que a integração não executou |

### 7.7. Evidências mínimas para considerar dado pronto para consumo

| Critério | Descrição |
|---|---|
| Fonte confirmada | Dado provém da fonte de verdade primária definida no mapa de fontes |
| ID único | Entidade possui ID canônico único e não duplicado |
| Consistência | Dado é consistente entre sistemas consumidores |
| Atualidade | Dado foi atualizado dentro da cadência esperada |
| Sem bloqueio | Dado não está marcado como `PENDENTE_DE_DADO`, `BLOQUEADO_POR_GATILHO` ou `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` |
| Evidência registrada | Existe evidência verificável da origem e atualização do dado |

### 7.8. Regras de retenção e descarte

As regras de retenção e descarte de dados pessoais devem seguir o Modelo de Estudo Genealógico e a Política de Privacidade vigente. CA-EVO-04 não cria política nova de retenção. Qualquer definição de prazo de retenção, descarte ou anonimização que extrapole a especificação operacional deve ser marcada como `REQUER_REVISAO_JURIDICA`.

---

## 8. APLICAÇÃO AO CASO ANA LUIZA

### 8.1. Quadro de prontidão por domínio

| Domínio | Dado/registro disponível | Fonte atual | Estado global | Estado no caso | Lacuna | Bloqueio | Próximo passo permitido | Evidência |
|---|---|---|---|---|---|---|---|---|
| Aceite comercial | Confirmado por escrito (15/08/2026): R$9.600, 10× R$960, 1º venc. 01/10/2026; aceitantes: Ana Luiza, Alice, Adair | CA-EVO-01 seção 1, 4 e 5; mensagem informada por Tatiana | `IMPLEMENTADO_E_ATIVO` (registro manual) | `CONFIRMADO` | Nenhuma (aceite confirmado) | Nenhum (não bloqueia preparação) | Preparar contrato específico após dados cadastrais | CA-EVO-01; aceite registrado em 15/08/2026 |
| Dados cadastrais | Pendentes de coleta (Ana Luiza, Alice, Adair; papel de Adriel; representação do menor; pagadores) | N/A (não coletados) | `PENDENTE_DE_DADO` | `PENDENTE_DE_DADO` | Dados cadastrais completos não confirmados | Bloqueia contrato específico, Anexo I e Asaas | Solicitar cadastro validado à Ana Luiza | CA-EVO-03: dados cadastrais pendentes |
| ID canônico | Divergência: CA-CID-AT-FAM-2026-001 (dossiê) vs CA-AUT-ANALUIZA-FAM-2026-001 (go-live) | Dossiê; Planilha go-live | `ID_CANONICO_PENDENTE_DE_CONFIRMACAO` | `ID_CANONICO_PENDENTE_DE_CONFIRMACAO` | ID canônico não eleito formalmente | Bloqueia identificação documental unificada | Eleger formalmente um ID canônico (CA-EVO-01 recomendou CA-CID-AT-FAM-2026-001) | CA-10A1; divergência registrada em CA-EVO-01, 02 e 03 |
| Proposta e versão-mestre | Fonte-mestre no Canva; 9 cópias no Dropbox | Canva; Dropbox (backup) | `IMPLEMENTADO_E_ATIVO` (Canva) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (Dropbox) | Versão vigente no Canva não confirmada; 9 cópias no Dropbox | Risco de confusão de versão | Consolidar versões aparentes em 1 oficial; não criar novas cópias | CA-10A1 itens #10-19; 9 cópias no Dropbox |
| SKU/escopo | SKU não confirmado para o caso; escopo da proposta familiar austríaca | Proposta; Planilha Mestre | `IMPLEMENTADO_E_ATIVO` (Planilha Mestre) | `PENDENTE_DE_DADO` (SKU não confirmado para o caso) | SKU e escopo não consolidados para o caso | Bloqueia Anexo I e Asaas | Consolidar escopo, SKU e entregas na Planilha Mestre | CA-EVO-03: escopo e SKU pendentes |
| Valor e parcelamento | Aceite: R$9.600, 10× R$960, 1º venc. 01/10/2026; divergência histórica: R$5.900 vs R$4.800 | Aceite (CA-EVO-01); Planilha Mestre; proposta | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` | Valor aceito (R$9.600) pode divergir da Planilha Mestre; modalidade financeira (3× R$320 ou R$960 central) não formalizada | Bloqueia Asaas e contrato | Reconciliar valor na Planilha Mestre; formalizar modalidade financeira | CA-EVO-01: aceite R$9.600; Auditoria Mãe Seção 9: R$5.900 vs R$4.800 |
| Contrato e Anexo I | Contrato-Mãe = placeholder de 55 bytes; Anexo I = existente mas não aplicado | Drive (placeholder); Drive (Anexo I, Doc 1sK6c8q...) | `IMPLEMENTADO_E_ATIVO` (global); `PENDENTE_DE_DADOS_E_PREPARACAO` (contrato) | `PENDENTE_DE_DADOS_E_PREPARACAO` (contrato); `PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO` (Anexo I) | Contrato não preparado; Anexo I sem escopo consolidado | Bloqueia Asaas, pesquisa e estrutura operacional | Preparar contrato após dados cadastrais e revisão jurídica; preparar Anexo I após escopo consolidado | CA-EVO-03: placeholder de 55 bytes; Anexo I confirmado |
| Documentos jurídicos condicionais | Anexo II: PENDENTE_DE_VERIFICACAO_DIRETA; Anexo III: IMPLEMENTADO_E_ATIVO; Anexo IV: PENDENTE_DE_VERIFICACAO_DIRETA; Anexo V: NAO_LOCALIZADO_NESTA_SESSAO | Drive (Anexo III); Drive (Anexos II, IV, V não localizados) | Misto (ver estados individuais) | `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO` (todos no caso) | Anexos II, IV e V não localizados ou não verificados | Bloqueia despesas (II), diligência (IV) e alterações (V) | Verificar Anexos II e IV no Drive; recuperar ou substituir Anexo V | CA-EVO-03: estados de evidência registrados |
| Cadastro Asaas | Configuração planejada/documentada em memória (3 assinaturas familiares, 1ª cobrança 01/10/2026); não comprovada como ativação transacional nesta etapa | Memory: `asaas_subscription_configuration.md` | `CONFIGURADO_PENDENTE_DE_TESTE` | `BLOQUEADO_POR_GATILHO` | Asaas_Customer_ID não criado; assinaturas não ativadas | Bloqueia cobrança | Ativar após contrato assinado, OS aprovada e dados cadastrais validados | Memory: `asaas_subscription_configuration.md` |
| Assinatura/cobrança/pagamento | Nenhuma cobrança gerada; nenhuma assinatura ativada | N/A | `BLOQUEADO_POR_GATILHO` | `BLOQUEADO_POR_GATILHO` | Sem cobrança ativa | Bloqueia fluxo financeiro | Ativar após contrato assinado e Asaas_Customer_ID criado | CA-EVO-03: Asaas BLOQUEADO_POR_GATILHO |
| Pesquisa externa | Não iniciada | N/A | `BLOQUEADO_POR_GATILHO` | `BLOQUEADO_POR_GATILHO` | Pesquisa não autorizada | Bloqueia execução genealógica | Ativar após Anexo III assinado e contrato vigente | CA-EVO-03: pesquisa BLOQUEADO_POR_GATILHO |
| Despesas externas | Não ativadas | N/A | `PENDENTE_DE_VERIFICACAO_DIRETA` (Anexo II) | `BLOQUEADO_POR_GATILHO` | Anexo II não localizado; nenhuma despesa concreta | Bloqueia despesas | Verificar Anexo II; ativar após despesa concreta e aprovação | CA-EVO-03: Anexo II PENDENTE_DE_VERIFICACAO_DIRETA |
| Estrutura Drive/Dossiê | Dossiê com 13 seções preenchidas; pasta criada em pré-onboarding | Drive; Dossiê (Doc 1oqPugh...) | `IMPLEMENTADO_E_ATIVO` (dossiê) | `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` (pasta criada em pré-onboarding) | Pasta criada antes do gatilho (contrato assinado) | Exige validação de aderência ao fluxo | Validar criação antecipada de pastas; não criar novas pastas | CA-10A1; CA-EVO-03: pasta criada em pré-onboarding |
| Planejador | Não carregado com dados vivos do caso | N/A | `CONFIGURADO_PENDENTE_DE_TESTE` | `PENDENTE_DE_DADO` | IDs duplicados; #ERROR!; dados não carregados | Bloqueia uso com dados vivos | Corrigir IDs e #ERROR!; carregar dados após consolidação | Auditoria Mãe Seção 2; IDs duplicados; #ERROR! |
| App/One Page | Não populado para Ana Luiza | N/A | `PENDENTE_DE_IMPLEMENTACAO` (App); `IMPLEMENTADO_E_ATIVO` (One Page skill) | `BLOQUEADO_POR_GATILHO` (App); `PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO` (One Page) | Conteúdo não aprovado nem sanitizado | Bloqueia exibição ao cliente | Definir regras de sanitização; aprovar conteúdo; acionar One Page após aprovação | CA-EVO-01: App apenas recebe conteúdo aprovado |
| CRM/Pipeline | Ana Luiza não localizada como lead no CRM; aceite registrado manualmente | CA-EVO-01 (manual) | `DOCUMENTADO_SEM_IMPLEMENTACAO` (3 CRMs concorrentes) | `PENDENTE_DE_DADO` (não no CRM ativo) | Aceite não registrado no CRM ativo; CRM ativo não definido | Bloqueia rastreabilidade comercial | Definir CRM ativo; registrar aceite no CRM | Auditoria Mãe Seção 3.2; 3 CRMs concorrentes |
| Tarefas e calendário | Não localizado tarefas ou eventos de Ana Luiza no Google Tasks ou Google Calendar | N/A | `DOCUMENTADO_SEM_IMPLEMENTACAO` (OPS); `DOCUMENTADO_SEM_IMPLEMENTACAO` (Google Tasks/Calendar) | `NAO_APLICAVEL` | Sistema ativo de tarefa não definido; relação com Calendar não comprovada | Bloqueia acompanhamento operacional | Definir sistema de tarefa ativo; confirmar relação Planejador → Calendar | CA-EVO-02 itens #10 e #12 |

---

## 9. BACKLOG DE DADOS E INTEGRAÇÕES

### 9.1. Backlog priorizado

| Prioridade | Pendência | Domínio | Tipo | Sistema proprietário | Responsável sugerido | Pré-requisito | Risco de não resolver | Bloqueia contrato | Bloqueia financeiro | Bloqueia pesquisa | Próximo passo permitido | Condição de conclusão |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Crítica | Eleger ID canônico do caso (CA-CID-AT-FAM-2026-001 vs CA-AUT-ANALUIZA-FAM-2026-001) | Caso e ID | Decisão | Desk/Dossiê | Tatiana | Nenhum | Inconsistência entre CRM, Planejador, Desk e App | Sim | Sim | Sim | Eleger formalmente um ID; manter o outro como alias | ID canônico confirmado por escrito |
| Crítica | Coletar dados cadastrais da contratante (Ana Luiza, Alice, Adair; papel de Adriel; representação do menor; pagadores) | Cliente | Dados | CRM/Painel | Tatiana / equipe | Nenhum | Contrato e Asaas não podem ser preparados | Sim | Sim | Não | Solicitar cadastro validado à Ana Luiza | Dados cadastrais validados e registrados no CRM |
| Crítica | Confirmar dados oficiais da contratada (razão social, CNPJ, endereço, e-mail) | Contratada | Dados/jurídico | Drive/contrato social | Tatiana / advogado | Nenhum | Contrato não pode ser preenchido | Sim | Não | Não | Confrontar com contrato social vigente | Dados oficiais confirmados |
| Crítica | Reconciliar e congelar valores na Planilha Mestre (Ana Luiza: R$9.600 aceite vs R$5.900/R$4.800 histórico) | SKU/preço | Dados/decisão | Planilha Mestre | Tatiana | Nenhum | Cobrança com valor divergente; conflito com Asaas | Sim | Sim | Não | Reconciliar valores; congelar na Planilha Mestre; sincronizar com Asaas | Valores reconciliados e congelados |
| Crítica | Definir CRM ativo (CRM_Pipeline_legado vs Pipeline_Vendas vs CRM Modelo) | CRM | Decisão | CRM/Painel | Tatiana | Nenhum | Leads e status não rastreáveis | Não | Não | Não | Definir Pipeline_Vendas como CRM ativo; arquivar CRM_Pipeline_legado | CRM ativo definido e documentado |
| Crítica | Revisar juridicamente assinatura eletrônica e logs | Contrato | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Método de assinatura não definido | Sim | Não | Não | Encaminhar cotejo ao advogado | Método de assinatura definido pelo advogado |
| Alta | Resolver conflito de foro (São Paulo/SP vs domicílio da cliente) | Contrato | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Foro não definido antes de assinatura | Sim | Não | Não | Submeter cotejo ao advogado | Foro definido pelo advogado |
| Alta | Definir composição contratual e prevalência da Ordem de Serviço | Contrato | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Arquitetura modular incompleta | Sim | Não | Não | Revisar Modelo de Estudo pelo advogado | Composição contratual definida |
| Alta | Consolidar escopo, SKU, entregas, cronograma e critérios de aceite | Anexo I | Operacional | Desk/Dossiê | Tatiana | Dados cadastrais | Anexo I não pode ser preparado | Sim | Não | Não | Consolidar proposta, dossiê e Planilha Mestre | Escopo e SKU consolidados |
| Alta | Definir responsável pelo caso | Caso | Operacional | Desk | Tatiana | Nenhum | Caso sem responsável designado | Sim | Não | Não | Designar internamente | Responsável designado |
| Alta | Revisar despesas externas, aprovações, adiantamentos e irreversibilidade | Anexo II | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Uso inseguro do Anexo II | Não | Sim | Sim | Submeter cotejo ao advogado | Cláusulas de despesas revisadas |
| Alta | Revisar cancelamento, rescisão e direito de arrependimento | Contrato | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Risco de relação de consumo incompleta | Sim | Não | Não | Submeter cotejo ao advogado | Cláusulas de cancelamento revisadas |
| Alta | Revisar procurações e formalidades separadas | Anexo IV | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Uso inseguro do Anexo IV | Não | Não | Sim | Submeter cotejo ao advogado | Cláusulas de procuração revisadas |
| Alta | Revisar flexibilidade de pagamentos além de à vista ou duas parcelas | Contrato/Asaas | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Cobrança recorrente via Asaas sem amparo contratual | Sim | Sim | Não | Submeter cotejo ao advogado | Forma de pagamento definida |
| Alta | Formalizar modalidade financeira (3× R$320 / R$960 central / obrigação familiar) | Financeiro | Decisão | Contrato/Asaas | Tatiana + advogado | Reconciliação de valores | Cobrança sem estrutura formal | Sim | Sim | Não | Definir modalidade no contrato e Asaas | Modalidade formalizada |
| Alta | Sincronizar nacionalidades (4 fontes concorrentes) | Catálogo | Dados | Planilha Mestre | Tatiana | Nenhum | Conflito de escopo de serviços | Não | Não | Não | Sincronizar fontes; definir lista oficial | Lista oficial definida |
| Alta | Reconciliar catálogo (Produtos_Master vs Asaas vs Planilha Mestre) | Catálogo | Dados | Planilha Mestre | Tatiana | Nenhum | Produtos e preços divergentes | Sim | Sim | Não | Reconciliar catálogo; sincronizar Asaas | Catálogo reconciliado |
| Média | Localizar e validar Anexo II no Drive | Anexo II | Evidência | Drive | Tatiana | Nenhum | Anexo II não disponível para uso | Não | Não | Sim | Busca dirigida no Drive por título, conteúdo ou pasta-pai | Anexo II localizado e validado |
| Média | Localizar e validar Anexo IV no Drive | Anexo IV | Evidência | Drive | Tatiana | Nenhum | Anexo IV não disponível para uso | Não | Não | Sim | Busca dirigida no Drive | Anexo IV localizado e validado |
| Média | Recuperar ou substituir Anexo V (HTTP 404) | Anexo V | Evidência/jurídico | Drive | Tatiana + advogado | Nenhum | Anexo V não disponível para alterações futuras | Não | Não | Não | Identificar ID novo ou versão aprovada | Anexo V recuperado ou substituído |
| Média | Verificar pasta 01_Modelos-e-Jurídico no Drive | Governança | Evidência | Drive | Tatiana | Nenhum | Ambiguidade de repositório jurídico | Não | Não | Não | Localizar por ID, proprietário, pasta-pai ou permissões | Pasta localizada ou referência histórica confirmada |
| Média | Validar criação antecipada das pastas de Ana Luiza | Governança | Operacional | Drive | Tatiana | Nenhum | Divergência entre gatilho planejado e execução | Não | Não | Não | Auditar fluxo de pré-onboarding | Validação registrada |
| Média | Definir canais formais de comunicação (e-mail e WhatsApp) | Contrato | Jurídico/operacional | Advogado | Advogado | Cotejo CA-EVO-03 | Canais sem amparo contratual | Sim | Não | Não | Revisar cláusula de comunicação | Canais definidos no contrato |
| Média | Definir propriedade intelectual sobre métodos, sistemas e materiais | Contrato | Jurídico | Advogado | Advogado | Cotejo CA-EVO-03 | Ativos do Clube sem proteção | Não | Não | Não | Revisar cláusula de PI | Cláusula de PI definida |
| Média | Corrigir IDs duplicados e #ERROR! no Planejador | Planejador | Dados | Planejador | Tatiana | Nenhum | Planejador não pode receber dados vivos | Não | Não | Não | Corrigir IDs e fórmulas | Planejador corrigido |
| Média | Definir sistema de tarefa ativo (OPS vs Google Tasks) | Tarefas | Decisão | OPS Tarefas | Tatiana | Nenhum | Tarefas duplicadas entre sistemas | Não | Não | Não | Definir OPS Tarefas como ativo | Sistema ativo definido |
| Média | Confirmar relação Planejador → Google Calendar | Calendário | Integração | Planejador | Tatiana | Nenhum | Calendário não integrado | Não | Não | Não | Confirmar relação antes de integrar | Relação confirmada ou descartada |
| Média | Consolidar versões da proposta Ana Luiza (9 cópias no Dropbox) | Proposta | Operacional | Canva/Drive | Tatiana | Nenhum | Risco de confusão de versão | Não | Não | Não | Consolidar em 1 oficial no Drive | Versão oficial consolidada |
| Média | Testar webhook Apps Script end-to-end | Integração | Integração | Apps Script | Tatiana | Nenhum | Leads não entram no CRM automaticamente | Não | Não | Não | Testar webhook end-to-end | Webhook testado e validado |
| Média | Definir regras de sanitização para App/One Page | App | Governança | Desk | Tatiana | Nenhum | Conteúdo interno exposto indevidamente | Não | Não | Não | Definir regras de sanitização | Regras definidas e documentadas |
| Baixa | Sincronizar etiquetas WhatsApp (CSVs ART-15 vs Gem) | WhatsApp | Operacional | Manual Gem | Tatiana | Nenhum | Etiquetas desatualizadas | Não | Não | Não | Sincronizar etiquetas | Etiquetas sincronizadas |
| Baixa | Sincronizar sequências de follow-up (D0-D14 vs Gem) | Follow-up | Operacional | Gem de Follow-up | Tatiana | Nenhum | Mensagens incorretas | Não | Não | Não | Sincronizar sequências | Sequências sincronizadas |
| Baixa | Confirmar se Client Varredura ainda é necessária | Skills | Governança | Skills | Tatiana | Nenhum | Duplicação de varredura | Não | Não | Não | Confirmar absorção por ca-client-go-live | Decisão registrada |

---

## 10. PLANO DE ATIVAÇÃO FUTURA POR ONDAS

### Onda 0 — Saneamento de evidência e decisões

| Atributo | Valor |
|---|---|
| **Objetivo** | Saneamento de evidências, eleição de IDs, definição de CRM ativo e decisões jurídicas pendentes |
| **Dados obrigatórios** | ID canônico eleito; CRM ativo definido; valores reconciliados na Planilha Mestre; nacionalidades sincronizadas; catálogo reconciliado |
| **Sistemas envolvidos** | Desk/Dossiê; CRM/Painel; Planilha Mestre; Drive; advogado |
| **Gatilhos** | Decisão formal da gestora; revisão jurídica do advogado |
| **Bloqueios** | Dados cadastrais pendentes; 3 CRMs concorrentes; valores conflitantes; revisão jurídica pendente |
| **Saída verificável** | ID canônico confirmado por escrito; CRM ativo definido; valores congelados na Planilha Mestre; parecer jurídico sobre assinatura, foro, composição, despesas, cancelamento, procurações, comunicações, PI e pagamentos |
| **Riscos** | Gestora não decide; advogado não responde; valores não reconciliados |
| **Condição de passagem para a próxima onda** | ID canônico eleito; CRM ativo definido; valores congelados; parecer jurídico recebido |

### Onda 1 — Dados cadastrais, IDs e fontes de verdade

| Atributo | Valor |
|---|---|
| **Objetivo** | Coletar e validar dados cadastrais da contratante e da contratada; implementar convenções de ID |
| **Dados obrigatórios** | Dados cadastrais de Ana Luiza, Alice, Adair (nome, CPF, endereço, e-mail, telefone); dados oficiais da contratada (razão social, CNPJ, endereço, e-mail); papel de Adriel; representação do menor; pagadores |
| **Sistemas envolvidos** | CRM/Painel; Desk/Dossiê; Drive; Asaas (cadastro) |
| **Gatilhos** | Onda 0 concluída; gestora autoriza coleta |
| **Bloqueios** | Dados cadastrais não coletados; dados oficiais não confirmados |
| **Saída verificável** | Dados cadastrais validados e registrados no CRM; dados oficiais da contratada confirmados; IDs implementados conforme convenção |
| **Riscos** | Cliente não fornece dados; dados divergentes entre fontes |
| **Condição de passagem para a próxima onda** | Dados cadastrais validados; dados oficiais confirmados; IDs implementados |

### Onda 2 — Contrato/OS e configuração documental após revisão jurídica

| Atributo | Valor |
|---|---|
| **Objetivo** | Preparar contrato específico e Anexo I a partir do Modelo de Estudo Genealógico, após revisão jurídica |
| **Dados obrigatórios** | Dados cadastrais (Onda 1); escopo consolidado; SKU e entregas definidos; critérios de aceite; responsável pelo caso; método de assinatura definido; foro definido; composição contratual definida |
| **Sistemas envolvidos** | Drive; Desk/Dossiê; advogado |
| **Gatilhos** | Onda 1 concluída; parecer jurídico recebido (Onda 0) |
| **Bloqueios** | Revisão jurídica pendente; escopo não consolidado; Anexos II e IV não localizados |
| **Saída verificável** | Contrato específico preparado e revisado; Anexo I preparado com escopo e entregas; método de assinatura definido; Anexos II e IV localizados ou substituídos |
| **Riscos** | Advogado solicita alterações; escopo muda; Anexos não localizados |
| **Condição de passagem para a próxima onda** | Contrato e Anexo I preparados e prontos para assinatura; Anexos condicionais localizados |

### Onda 3 — Financeiro e Asaas após assinatura e OS

| Atributo | Valor |
|---|---|
| **Objetivo** | Ativar cobrança no Asaas após contrato assinado e OS aprovada |
| **Dados obrigatórios** | Contract_ID assinado; Order_Service_ID aprovado; Asaas_Customer_ID criado; SKU e preço conferidos com Planilha Mestre; modalidade financeira formalizada |
| **Sistemas envolvidos** | Asaas; CRM/Painel; Planejador; Desk |
| **Gatilhos** | Contrato assinado; OS aprovada; dados cadastrais validados |
| **Bloqueios** | Contrato não assinado; OS não aprovada; valores não reconciliados; modalidade não formalizada |
| **Saída verificável** | Asaas_Subscription_ID ativa; primeira cobrança gerada; status de pagamento no CRM; lançamento no Planejador |
| **Riscos** | Asaas rejeita cadastro; valor divergente; pagamento falha |
| **Condição de passagem para a próxima onda** | Assinatura ativa; primeira cobrança confirmada (ou agendada) |

### Onda 4 — Pesquisa e execução após pagamento/autorizações

| Atributo | Valor |
|---|---|
| **Objetivo** | Iniciar pesquisa externa após contrato vigente, pagamento confirmado e autorizações assinadas |
| **Dados obrigatórios** | Anexo III assinado (se pesquisa externa); Anexo IV assinado (se diligência com procuração); Anexo II assinado (se despesa externa); cronograma no Planejador |
| **Sistemas envolvidos** | Desk/Dossiê; Drive; Planejador; acervos externos |
| **Gatilhos** | Contrato vigente; pagamento confirmado; Anexo III assinado |
| **Bloqueios** | Anexo III não assinado; pesquisa não autorizada; despesas não aprovadas |
| **Saída verificável** | Pesquisa iniciada; evidências registradas no Dossiê; despesas registradas com Anexo II; cronograma atualizado |
| **Riscos** | Pesquisa não encontra evidências; acervos não respondem; despesas excedem teto |
| **Condição de passagem para a próxima onda** | Pesquisa concluída ou etapa concluída; evidências registradas |

### Onda 5 — Sincronização de acompanhamento, Planejador, Desk e App

| Atributo | Valor |
|---|---|
| **Objetivo** | Sincronizar dados de acompanhamento no Planejador, Desk e App após execução |
| **Dados obrigatórios** | Dados de pesquisa; cronograma atualizado; marcos concluídos; conteúdo aprovado e sanitizado para App |
| **Sistemas envolvidos** | Planejador; Desk/Dossiê; App Cliente / Ancestral Canvas; One Page |
| **Gatilhos** | Conclusão de etapa; aprovação de conteúdo pela gestora |
| **Bloqueios** | Regras de sanitização não definidas; Planejador com IDs duplicados; sistema de tarefa não definido |
| **Saída verificável** | Planejador carregado com dados vivos; Desk atualizado; App populado com conteúdo sanitizado; One Page acionada (se aplicável) |
| **Riscos** | Conteúdo não sanitizado; dados desatualizados; IDs duplicados no Planejador |
| **Condição de passagem para a próxima onda** | Planejador, Desk e App sincronizados; conteúdo aprovado e exibido |

### Onda 6 — Indicadores, SLA e reconciliação contínua

| Atributo | Valor |
|---|---|
| **Objetivo** | Definir e monitorar indicadores, SLAs e reconciliação contínua entre sistemas |
| **Dados obrigatórios** | KPIs definidos; SLAs definidos; regras de reconciliação automatizadas; logs de integração monitorados |
| **Sistemas envolvidos** | CRM/Painel; Planejador; Asaas; Desk; Sheets_Export_Logs; Dashboard |
| **Gatilhos** | Onda 5 concluída; gestora autoriza monitoramento |
| **Bloqueios** | Integrações não testadas; webhook não testado; política de logs não definida |
| **Saída verificável** | KPIs e SLAs definidos; dashboard de monitoramento ativo; reconciliação automatizada (se implementada); logs monitorados |
| **Riscos** | Integrações falham; dados divergentes; KPIs não definidos |
| **Condição de passagem para a próxima onda** | N/A (onda final) |

---

## 11. RISCOS, LACUNAS E BLOQUEIOS

### 11.1. Riscos críticos

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| ID canônico não eleito | Inconsistência entre CRM, Planejador, Desk e App; caso não rastreável | Alta | Eleger formalmente CA-CID-AT-FAM-2026-001 como canônico; manter CA-AUT-ANALUIZA-FAM-2026-001 como alias |
| Dados cadastrais não coletados | Contrato, Asaas e estrutura operacional não podem ser preparados | Alta | Solicitar cadastro validado à Ana Luiza imediatamente |
| Valores não reconciliados | Cobrança com valor divergente; conflito entre Planilha Mestre, proposta e Asaas | Alta | Reconciliar e congelar valores na Planilha Mestre antes de qualquer ativação |
| CRM ativo não definido | Leads e status não rastreáveis; 3 sistemas concorrentes sem dados | Alta | Definir Pipeline_Vendas como CRM ativo; arquivar CRM_Pipeline_legado |
| Revisão jurídica pendente | Assinatura, foro, composição, despesas, cancelamento, procurações, comunicações, PI e pagamentos não definidos | Alta | Encaminhar cotejo do CA-EVO-03 ao advogado |
| Webhook não testado | Leads não entram no CRM automaticamente; integração pode falhar em produção | Média | Testar webhook end-to-end antes de depender dele |

### 11.2. Lacunas de evidência

| Lacuna | Estado | Ação permitida |
|---|---|---|
| Anexo II não localizado no Drive | `PENDENTE_DE_VERIFICACAO_DIRETA` | Busca dirigida no Drive por título, conteúdo ou pasta-pai |
| Anexo IV não localizado no Drive | `PENDENTE_DE_VERIFICACAO_DIRETA` | Busca dirigida no Drive |
| Anexo V (Doc ID 1oi1LS3P...) retornou HTTP 404 | `NAO_LOCALIZADO_NESTA_SESSAO` | Identificar ID novo ou versão aprovada |
| Pasta 01_Modelos-e-Jurídico não localizada | `NAO_LOCALIZADO_NESTA_SESSAO` | Localizar por ID, proprietário, pasta-pai ou permissões |
| Client Varredura não localizado | `NAO_LOCALIZADO_NESTA_SESSAO` | Confirmar se foi absorvida por ca-client-go-live |
| Conteúdo do CRM Modelo não lido | `DOCUMENTADO_SEM_IMPLEMENTACAO` | Verificar conteúdo se necessário para decisão de CRM ativo |
| Pastas "asaas" no Drive não verificadas | `NAO_LOCALIZADO_NESTA_SESSAO` | Verificar conteúdo; consolidar se duplicadas |

### 11.3. Bloqueios ativos

| Bloqueio | Afeta | Condição para liberar |
|---|---|---|
| Contrato não assinado | Asaas, pesquisa, estrutura operacional, App | Dados cadastrais + revisão jurídica + preparação do contrato |
| OS não aprovada | Asaas, Planejador | Escopo consolidado + responsável designado |
| Dados cadastrais pendentes | Contrato, Asaas, App | Coleta e validação com o cliente |
| ID canônico não confirmado | CRM, Planejador, Desk, App | Eleição formal pela gestora |
| Valores não reconciliados | Asaas, contrato, proposta | Reconciliação e congelamento na Planilha Mestre |
| Anexos II e IV não localizados | Despesas, diligência | Verificação direta no Drive |
| Anexo V não localizado | Alterações contratuais futuras | Recuperação ou substituição jurídica |
| Webhook não testado | CRM automático, logs | Teste end-to-end |
| Regras de sanitização não definidas | App, One Page | Definição de regras pela gestora |
| Sistema de tarefa não definido | Tarefas, acompanhamento | Decisão entre OPS e Google Tasks |
| Relação Planejador → Calendar não comprovada | Calendário | Confirmação de integração |

---

## 12. DEVOLUTIVA PADRONIZADA

CA-EVO-04 — DEVOLUTIVA PADRONIZADA
Projeto: Clube Ancestral
Prompt: CA-EVO-04 — Dados Vivos e Integrações
Data: 15/08/2026
Estado: CONCLUIDO_COM_REFINAMENTOS_PENDENTES

---

O QUE FOI ENTREGUE

1. Governança de dados e fontes de verdade
   - Declaração executiva com fontes oficiais por domínio, classificação de sistemas, regras de precedência, regras de bloqueio e limite do CA-EVO-04
   - Mapa de fontes de verdade com 18 domínios cobertos, 12 colunas por domínio

2. Dicionário de entidades e identificadores
   - 23 entidades mapeadas (Lead, Contact, Opportunity, Case, Family, Client, Proposal, SKU, Contract, Order_Service, Expense, Research_Authorization, Power_of_Attorney, Amendment, Asaas_Customer, Asaas_Subscription, Asaas_Payment, Drive_Folder, Drive_Document, Task, Calendar_Event, Integration_Run/Log)
   - Convenções de ID propostas para todas as entidades
   - Resumo de convenções com estado de reconciliação

3. Matriz de dados por sistema
   - 14 sistemas mapeados (CRM/Pipeline, Planilha Mestre, Asaas, Drive, Dossiê/Desk, Planejador, App, One Page, Google Forms, Google Tasks, Google Calendar, Dropbox, Apps Script/Logs, Skills)
   - 14 colunas por sistema incluindo estado global e estado no caso Ana Luiza

4. Contratos de dados e integrações futuras
   - 10 fluxos especificados (A-J): CRM→Desk, Planilha Mestre→Proposta/OS/Asaas/App, Contrato+OS→Asaas, Asaas→CRM/Planejador/Desk, Desk→Planejador, Desk→App/One Page, Formulário→CRM, Webhook Lovable→Logs/CRM, Planejador→Calendar, OPS→Google Tasks
   - 15 atributos por fluxo incluindo pré-condições, transformação, idempotência, falhas e condição de ativação

5. Reconciliação de conflitos e duplicidades
   - 12 sobreposições herdadas do CA-EVO-02 reconciliadas
   - Fonte de verdade proposta, estado atual, impacto, regra de decisão e ação futura para cada conflito
   - Conflito contratual resolvido (CA-EVO-03); proposta Ana Luiza com Canva como master; ID canônico pendente

6. Qualidade, LGPD e auditoria
   - Classificação de dados (público, interno, pessoal, pessoal sensível)
   - Validações mínimas por entidade
   - Regras de completude, unicidade, consistência e atualidade
   - Campos com confirmação humana obrigatória
   - Regras de minimização para App/One Page
   - Política de logs e evidências mínimas

7. Aplicação ao caso Ana Luiza
   - Quadro de prontidão com 17 domínios
   - Estado global e estado no caso para cada domínio
   - Lacunas, bloqueios e próximos passos permitidos
   - Nenhum dado da Ana Luiza foi completado por inferência

8. Backlog e ondas de ativação
   - Backlog priorizado de dados, evidências, decisões, jurídico, integração e operação
   - 7 ondas sequenciais (0 a 6) com objetivo, dados, sistemas, gatilhos, bloqueios, saída, riscos e condição de passagem
   - Backlog incorpora as 19 pendências críticas do CA-EVO-03

---

FONTES DE VERDADE REGISTRADAS

- CRM/Painel: entrada, status comercial, aceite e handoff.
- Planilha Mestre: SKU, preço, escopo, condição, status e link autorizado.
- Asaas: cliente, cobrança, assinatura e pagamento; não define preço, escopo ou elegibilidade.
- Desk/Dossiê: caso, evidências, documentos, pendências, decisões e histórico operacional.
- Planejador Universal: cronograma, marcos, responsáveis e etapas.
- Drive Compartilhado: documentos operacionais de clientes ativos.
- App/One Page: somente conteúdo aprovado e sanitizado.
- Dropbox: backup/histórico, sem função de fonte operacional.

---

ESTADOS — GLOBAL X CASO ANA LUIZA

- Aceite comercial: CONFIRMADO
- Modelo de Estudo Genealógico — global: IMPLEMENTADO_E_ATIVO
- Modelo de Estudo Genealógico — caso: DISPONIVEL_GLOBALMENTE_NAO_APLICADO_AO_CASO
- Contrato específico: PENDENTE_DE_DADOS_E_PREPARACAO
- Anexo I: PENDENTE_DE_DADOS_E_ESCOPO_CONSOLIDADO
- Anexos II, III, IV e V — caso: PENDENTE_DE_CLASSIFICACAO_E_USO_POR_GATILHO
- Pesquisa externa: BLOQUEADO_POR_GATILHO
- Asaas/financeiro: BLOQUEADO_POR_GATILHO
- ID do caso: ID_CANONICO_PENDENTE_DE_CONFIRMACAO

---

CONFLITOS E PENDÊNCIAS PRIORITÁRIAS

- ID canônico do caso: CA-CID-AT-FAM-2026-001 vs CA-AUT-ANALUIZA-FAM-2026-001 — eleição formal pendente
- Dados cadastrais da contratante: pendentes de coleta
- Dados oficiais da contratada: pendentes de confirmação
- Valores conflitantes: R$9.600 (aceite) vs R$5.900/R$4.800 (histórico) — reconciliação pendente
- CRM ativo: 3 locais concorrentes, nenhum com dados reais — definição pendente
- Revisão jurídica: assinatura, foro, composição, despesas, cancelamento, procurações, comunicações, PI e pagamentos — parecer pendente
- Anexos II e IV: PENDENTE_DE_VERIFICACAO_DIRETA no Drive
- Anexo V: NAO_LOCALIZADO_NESTA_SESSAO (HTTP 404)
- Pasta 01_Modelos-e-Jurídico: NAO_LOCALIZADO_NESTA_SESSAO
- Nacionalidades: 4 fontes concorrentes — sincronização pendente
- Catálogo: Produtos_Master vs Asaas vs Planilha Mestre — reconciliação pendente
- Webhook Apps Script: CONFIGURADO_PENDENTE_DE_TESTE

---

INTEGRAÇÕES NÃO ATIVADAS

- CRM/Painel → Desk/Dossiê: DOCUMENTADO_SEM_IMPLEMENTACAO
- Planilha Mestre → Proposta/OS/Asaas/App: IMPLEMENTADO_E_ATIVO (Planilha Mestre); REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO (valores)
- Contrato + Anexo I → Asaas: BLOQUEADO_POR_GATILHO
- Asaas → CRM/Planejador/Desk: DOCUMENTADO_SEM_IMPLEMENTACAO (webhook Asaas não configurado)
- Desk → Planejador: CONFIGURADO_PENDENTE_DE_TESTE (IDs e #ERROR! não corrigidos)
- Desk → App/One Page: PENDENTE_DE_IMPLEMENTACAO (regras de sanitização não definidas)
- Formulário → CRM: CONFIGURADO_PENDENTE_DE_TESTE
- Webhook Lovable → Logs/CRM: CONFIGURADO_PENDENTE_DE_TESTE
- Planejador → Google Calendar: DOCUMENTADO_SEM_IMPLEMENTACAO (relação não comprovada)
- OPS Tarefas → Google Tasks: DOCUMENTADO_SEM_IMPLEMENTACAO (sistema ativo não definido)

---

SISTEMAS EXTERNOS PRESERVADOS

- Google Drive: não alterado
- CRM / Pipeline: não alterado
- Planilha Mestre / Google Sheets: não alterada
- Planejador Universal: não alterado
- Asaas: não alterado
- App Cliente / Ancestral Canvas: não alterado
- Desk Intelligence: não alterado
- Google Forms: não alterado
- Google Tasks: não alterado
- Google Calendar: não alterado
- Dropbox: não indexado, salvo autorização expressa e escopo específico
- Webhooks / Apps Script / APIs: não executados nem alterados

---

PRÓXIMA ABA

CA-EVO-05A — Preparação de Go-Live Ana Luiza

CONDIÇÃO PARA AVANÇO

- Consumo do backlog de dados, evidências, decisões e revisão jurídica aplicáveis.
- Não criar, preencher, assinar, cobrar, pesquisar, sincronizar ou ativar sistemas sem gatilho, evidência e autorização correspondentes.
- Registrar toda alteração externa em devolutiva posterior com sistema, objeto, identificação, evidência, data e resultado.
