# Auditoria Final do SPIN e Esquema Completo de Campos do CRM
## Clube Ancestral

**Data:** 11/08/2026 · **Natureza:** leitura, auditoria, modelagem de dados e recomendação. Não alterar sistemas externos.

---

## A. Auditoria do Manual SPIN Selling para Genealogia

**Arquivo:** `Manual-Analitico-da-Pesquisadora-Closer-SPIN-Selling-para-Genealogia.docx` (174 KB, 139 parágrafos, 05/07/2026)

**Diagnóstico geral:** o manual é bem-estruturado e tem framework útil, mas carrega linguagem de venda pressionadora ("closer", "fechar", "mata a venda", "custo do não agir", "banco de objeções") que conflita com os princípios do Clube Ancestral (acolhedor, consultivo, sem pressão, sem promessa jurídica).

| Seção do Manual | Decisão | Motivo | Risco | Responsável validação |
|---|---|---|---|---|
| 1. Premissa Fundamental (pesquisadora-closer) | **Adaptar** | Conceito de "pesquisadora que fecha casos" é válido, mas "closer" carrega conotação de venda agressiva | Médio — linguagem | Tatiana |
| 2. Mapeamento (app vs humana) | **Manter** | Divisão app/ humana correta e útil | Baixo | — |
| 3.1 S — Situação | **Manter** | Perguntas de situação são levantamento factual | Baixo | — |
| 3.2 P — Problema | **Adaptar** | "Dor real" e "dor óbvia" são termos de venda; reescrever para "lacuna" e "bloqueador" | Médio — linguagem | Tatiana |
| 3.3 I — Implicação | **Remover trechos** | "Lei italiana mudou em março/2025 restringindo netos" usa legislação como pressão; "Quem adia 6 meses termina em 2029" cria urgência artificial; "filhos — quanto mais espera, mais difícil" cria medo | **Alto — promessa/ameaça jurídica e urgência artificial** | Tatiana |
| 3.4 N — Necessidade | **Adaptar** | "Fazer o cliente pedir a solução, não você empurrar" é técnica de venda; reescrever para "identificar o próximo passo útil" | Médio — linguagem | Tatiana |
| 4.1 Call de Diagnóstico (15 min) | **Adaptar** | "Efeito Uau" com promessa ("você provavelmente está numa geração em que ainda é possível") é promessa jurídica | **Alto — promessa** | Tatiana |
| 4.2 Apresentando o Preço | **Adaptar** | "Nunca apresente o preço sozinho" e "âncoras de valor" (faculdade, viagem) são técnicas de venda; manter apenas "preço sempre com contexto de escopo" | Médio — técnica | Tatiana |
| 5. Banco de Objeções | **Deslocar para treinamento interno** | Técnicas de "reenquadramento de valor", "revelar custo oculto" são vendas; útil como treinamento interno mas não como guia de atendimento | Médio — pode gerar pressão | Tatiana |
| 5.1-5.6 Respostas a objeções | **Deslocar para treinamento** | Respostas prontas úteis para treinar, mas não para usar como script fixo | Médio | Tatiana |
| 6. Fluxo completo da conversa | **Adaptar** | Estrutura útil mas com "reação técnica" que pode prometer | Baixo | — |
| 7. Cadência de Follow-up | **Adaptar** | "Script de e-mail de reativação" menciona "encontrei algo sobre a família" — pode ser inventiva | Médio — pode inventar descoberta | Tatiana |
| 8. Tickets e Contexto por Cidadania | **Deslocar para Biblioteca Jurídica** | Valores e prazos por cidadania são referência jurídica — não devem estar no roteiro de call | **Alto — pode ser tratado como regra conclusiva** | Tatiana |
| 9. Armadilhas (erros a evitar) | **Adaptar** | "Isso mata a venda" e "Feche com autoridade" são linguagem de venda; "nunca mande link Asaas sem fechar valor" é correto | Médio — linguagem | Tatiana |
| 10. Scripts prontos / Áudios | **Remover** | Áudios-modelo com promessas ("você provavelmente está numa geração em que ainda é possível") não podem ser usados como fixos | **Alto — promessa automatizada** | Tatiana |
| 11. Métricas | **Manter** | Métricas de funil são úteis | Baixo | — |
| 12. Guia de consulta rápida | **Adaptar** | Resumo útil mas herda problemas das seções acima | Médio | Tatiana |
| Referências (Playbook, sales-content.ts, objecoes.tsx) | **Arquivar** | Referências a código de vendas e playbooks antigos | Baixo | — |

---

## B. Guia SPIN oficial do Clube Ancestral

### S — Situação

**Perguntas-modelo:**
1. Qual país ou origem despertou seu interesse?
2. Qual sobrenome ou ancestral você conhece? Tem ideia da geração?
3. Que documentos, certidões, fotos ou relatos você já tem?
4. Em que cidade ou região seu ancestral vivia antes de emigrar?
5. Já iniciou algum processo ou conversou com outro consultor?

| Campo no Painel | Campo CRM | Tarefa Desk? | Portal Proposta? | Workspace? | Proibido no App? | Validação humana? |
|---|---|---|---|---|---|---|
| SPIN-S OK | Nacionalidade, Linha, Documentos disponíveis, Histórico | Iniciar pesquisa preliminar (se virar caso) | Escopo resumido | — | Transcrição | Não |

### P — Problema

**Perguntas-modelo:**
1. O que está faltando organizar ou comprovar?
2. Tem documento que sabe que existe mas não acessou?
3. Alguém da família já tentou? O que aconteceu?
4. Qual é a sua dúvida principal hoje?

| Campo no Painel | Campo CRM | Tarefa Desk? | Portal Proposta? | Workspace? | Proibido no App? | Validação humana? |
|---|---|---|---|---|---|---|
| SPIN-P OK, Documentos Pendentes | Documentos pendentes, Bloqueadores | Solicitar documentos (se virar caso) | — | Pendências | Objeções, transcrição | Sim — pode indicar bloqueio jurídico |

### I — Implicação

**Perguntas-modelo:**
1. O que acontece se isso ficar como está — sem organizar, sem evidência, sem orientação?
2. Isso afeta outras pessoas da família?
3. Há prazo ou evento que motivou buscar agora?
4. Quais os riscos operacionais de não organizar as evidências?

**Regras inegociáveis:**
- Nunca usar legislação, artigo, prazo legal ou mudança de lei como argumento de pressão
- Nunca criar medo artificial ("quanto mais espera, mais difícil")
- Nunca prometer resultado, prazo, cidadania ou aprovação
- Explicar apenas consequências operacionais documentais (ex.: "sem a certidão, não é possível avançar")

| Campo no Painel | Campo CRM | Tarefa Desk? | Portal Proposta? | Workspace? | Proibido no App? | Validação humana? |
|---|---|---|---|---|---|---|
| SPIN-I OK, Objeções | Maturidade, Urgência | Priorizar no funil | Próximo passo | — | Hipótese jurídica, transcrição | Não |

### N — Necessidade de solução

**Perguntas-modelo:**
1. Qual seria o próximo passo mais útil para você?
2. Diagnóstico, coleta documental, pesquisa ou orientação?
3. Gostaria de receber uma proposta com escopo e investimento?
4. Ou prefere pensar com calma — sem pressa?

**Regras:**
- SPIN é guia de escuta e organização, não técnica de pressão
- A pessoa pode pensar, pausar ou recusar sem pressão
- Nunca enviar link de pagamento sem contexto de proposta formal

| Campo no Painel | Campo CRM | Tarefa Desk? | Portal Proposta? | Workspace? | Proibido no App? | Validação humana? |
|---|---|---|---|---|---|---|
| SPIN-N OK, Resultado | Estágio, Próxima ação | Preparar proposta (se solicitado) | Próximo passo, proposta | Próximo passo | Preço cru, SKU, link interno | Sim — proposta só com preço da Mestre |

---

## C. Inventário auditado do Painel de Calls

| Aspecto | Resultado |
|---|---|
| Abas existentes | 3: Painel Calls, Marcos Jurídicos, Comparativo Cidadanias |
| Abas mencionadas mas inexistentes | "Roteiro SPIN" e "Listas Base" — não existem na versão atual. PENDENTE DE VALIDAÇÃO HUMANA. |
| Colunas do Painel Calls | 21 (Data, Cliente, E-mail/WhatsApp, Nacionalidade, Vendedor, Status da Call, Gravação, Consentimento, SPIN-S/P/I/N, Diagnóstico, Via Jurídica, Documentos Pendentes, Objeções, Produto/Valor, Resultado, Follow-up, Link Gravação, Observações) |
| Linhas com dados reais | **1** (Ana Luiza Gomes Silveira, 03/08/2026) |
| Linhas vazias | 48 — são apenas estrutura, não dados operacionais |
| Dados de teste | Nenhum identificado no Painel (mas o CRM Pipeline na Mestre tem Maria Silva etc.) |
| Dados de legado | Nenhum identificado no Painel |
| Duplicidades | Nenhuma no Painel (mas 2 cópias do Roteiro Ana Luiza existem como arquivos separados) |
| Campos que atendem o CRM | Cliente, E-mail, Nacionalidade, Vendedor, Status, SPIN, Diagnóstico, Via Jurídica, Documentos, Resultado, Follow-up |
| Campos exclusivamente internos | Gravação, Consentimento, Link Gravação, Objeções, Observações |
| Ação para linhas vazias | Classificar como estrutura; não tratar como dados; não preencher automaticamente |

---

## D. Matriz Painel × CRM × Desk × App

| Campo | Painel | CRM (entidade) | Estágio | Obrigatório? | Tipo ideal | Origem verdade | Gera tarefa Desk? | Módulo Desk | Portal Proposta? | Workspace? | Proibido App? | Validação humana? | LGPD? | Ação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Data | Sim | Lead | Entrada | Sim | Data | CRM | Não | — | Não | Não | Sim | Não | Não | Manter |
| Cliente | Sim | Contato | Contato | Sim | Texto | CRM | Não | — | Nome | Nome | Não | Sim (2 sem nome) | Não | Manter |
| E-mail/WhatsApp | Sim | Contato | Contato | Sim | Texto | CRM | Não | — | Não | Não | Sim | Não | Sim | Manter |
| Nacionalidade | Sim | Lead | Lead | Sim | Dropdown | CRM | Não | — | Escopo | — | Não | Não | Não | Manter — virar dropdown |
| Vendedor(a) | Sim | Lead | Lead | Sim | Dropdown | CRM | Não | — | Não | Não | Sim | Não | Não | Manter — virar dropdown |
| Status da Call | Sim | Lead/Oportunidade | Lead | Sim | Dropdown | CRM | Sim | Go-live | Não | Não | Sim | Não | Não | Manter — virar dropdown |
| Gravação Ativada | Sim | — | — | Sim | Dropdown (sim/não) | Painel | Não | — | Não | Não | Sim | Sim | Sim | Manter só no Painel |
| Consentimento Lido | Sim | — | — | Sim | Dropdown (sim/não) | Painel | Não | — | Não | Não | Sim | Sim | Sim | Manter só no Painel |
| SPIN-S OK | Sim | Oportunidade | Oportunidade | Sim | Dropdown (ok/pendente) | CRM | Sim | Go-live | Não | Não | Sim | Não | Não | Manter — renomear "Situação" |
| SPIN-P OK | Sim | Oportunidade | Oportunidade | Sim | Dropdown | CRM | Sim | Go-live | Não | Não | Sim | Não | Não | Manter — renomear "Problema" |
| SPIN-I OK | Sim | Oportunidade | Oportunidade | Sim | Dropdown | CRM | Sim | Go-live | Não | Não | Sim | Não | Não | Manter — renomear "Implicação" |
| SPIN-N OK | Sim | Oportunidade | Oportunidade | Sim | Dropdown | CRM | Sim | Go-live | Não | Não | Sim | Não | Não | Manter — renomear "Necessidade" |
| Via Jurídica Identificada | Sim | Oportunidade | Oportunidade | Sim | Dropdown (não definida / em levantamento / depende de evidências / revisão humana / escopo não aplicável) | CRM | Sim | Validação Jurídica | Não | Não | Sim | **Sim — sempre hipótese** | Não | **Renomear "Hipótese de rota"** |
| Documentos Pendentes | Sim | Oportunidade/Caso | Oportunidade | Não | Texto livre | CRM/Desk | Sim | Go-live | — | Pendências | Sim (detalhe) | Não | Não | Manter — mover detalhe para Desk |
| Objeções | Sim | Lead/Oportunidade | Todos | Não | Texto livre | CRM | Não | — | Não | Não | Sim | Não | Não | Manter no CRM |
| Produto/Valor Proposto | Sim | Proposta | Proposta | Não | Relação (SKU da Mestre) | Mestre | Sim | Propostas | Não | Não | Sim | **Sim — só da Mestre** | Não | **No Painel: só "Proposta enviada: sim/não"** |
| Resultado da Call | Sim | Lead/Oportunidade | Lead | Sim | Dropdown | CRM | Sim | Go-live | Próximo passo | Próximo passo | Sim | Não | Não | Manter — virar dropdown |
| Follow-up Agendado | Sim | Oportunidade | Oportunidade | Sim | Data | CRM | Sim | Go-live | Próximo passo | Próximo passo | Sim | Não | Não | Manter |
| Link Gravação/Transcrição | Sim | — | — | Não | Texto | Painel | Não | — | Não | Não | Sim | Sim | Sim | Manter só no Painel |
| Observações | Sim | Histórico | Todos | Não | Texto livre | CRM | Não | — | Não | Não | Sim | Não | Não | Manter no CRM |

---

## E. Esquema completo de entidades e campos do CRM

### E.1 — Entidade Contato

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| contact_id | ID automático | Sim | Nasce no primeiro contato registrado |
| nome completo | Texto | Sim | Não pode avançar para Lead sem nome |
| nome social/preferido | Texto | Não | Se diferente do nome completo |
| WhatsApp normalizado | Texto | Sim | Formato internacional (+55...) |
| e-mail | Texto | Não | Se disponível |
| canal/origem inicial | Dropdown (Google Ads, Instagram, indicação, direto, evento, outro) | Sim | Onde ocorreu o primeiro contato |
| data do primeiro contato | Data | Sim | |
| consentimento de uso de dados | Dropdown (Sim/Não/Parcial) | Sim | LGPD |
| status de duplicidade | Dropdown (Único/Duplicado/Fundido) | Sim | |
| vínculo familiar/grupo | Texto | Não | Se aplicável |
| observação histórica | Texto livre | Não | |
| status | Dropdown (Ativo/Legado/Teste) | Sim | |

### E.2 — Entidade Lead

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| lead_id | ID automático | Sim | Nasce após interesse confirmado |
| contact_id | ID (relação) | Sim | |
| origem detalhada | Dropdown | Sim | Campanha ou canal específico |
| campanha/origem secundária | Texto | Não | |
| data de entrada | Data | Sim | |
| interesse principal | Dropdown (Cidadania/Genealogia/Memória/Herança/Outro) | Sim | |
| país/contexto declarado | Dropdown | Sim | |
| linha investigada | Texto | Sim | Sobrenome/ancestral |
| maturidade | Dropdown (Explorando/Comparando/Decidido) | Sim | |
| urgência declarada | Dropdown (Baixa/Média/Alta) | Sim | |
| responsável | Dropdown (equipe) | Sim | |
| status do lead | Dropdown (Novo/Aguardando resposta/Interessado/Pausado/Descartado) | Sim | |
| próxima ação | Texto | Sim | |
| data da próxima ação | Data | Sim | |
| motivo de pausa/perda | Dropdown | Não | Se aplicável |
| consentimento de contato | Dropdown (Sim/Não) | Sim | |
| classificação | Dropdown (Ativo/Legado/Teste) | Sim | |

### E.3 — Entidade Discovery

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| discovery_id | ID automático | Sim | |
| lead_id | ID (relação) | Sim | |
| data | Data | Sim | |
| canal | Dropdown (WhatsApp/Meet/Presencial/Outro) | Sim | |
| participantes | Texto | Sim | |
| consentimento de gravação | Dropdown (Sim/Não) | Sim | LGPD |
| consentimento de uso de dados | Dropdown (Sim/Não/Parcial) | Sim | LGPD |
| SPIN-S (Situação) | Dropdown (OK/Pendente) | Sim | |
| SPIN-P (Problema) | Dropdown (OK/Pendente) | Sim | |
| SPIN-I (Implicação) | Dropdown (OK/Pendente) | Sim | |
| SPIN-N (Necessidade) | Dropdown (OK/Pendente) | Sim | |
| resumo factual | Texto livre | Sim | Sem conclusão jurídica |
| documentos/evidências mencionadas | Texto livre | Sim | |
| hipótese de rota | Dropdown (não definida / em levantamento / depende de evidências / revisão humana necessária / escopo não aplicável) | Sim | Sempre hipótese |
| resultado da call | Dropdown | Sim | |
| próxima ação | Texto | Sim | |
| responsável | Dropdown (equipe) | Sim | |
| prazo | Data | Sim | |
| follow-up | Data + texto | Sim | |
| precisa de proposta? | Dropdown (Sim/Não/Ainda não) | Sim | |
| status da call | Dropdown (Agendada/Realizada/Remarcada/Não compareceu) | Sim | |
| link de gravação/transcrição | Texto | Não | Interno, com consentimento |

### E.4 — Entidade Oportunidade

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| opportunity_id | ID automático | Sim | Nasce após discovery qualificado |
| lead_id | ID (relação) | Sim | |
| discovery_id | ID (relação) | Sim | |
| objetivo validado | Dropdown | Sim | |
| contexto/país | Dropdown | Sim | |
| linha investigada | Texto | Sim | |
| escopo preliminar | Texto livre | Sim | |
| maturidade | Dropdown | Sim | |
| urgência | Dropdown | Sim | |
| hipótese de rota | Dropdown (mesmos valores) | Sim | |
| bloqueadores | Texto livre | Não | |
| diagnostico_solicitado | Dropdown (Sim/Não) | Sim | Campo próprio, separado de "precisa de proposta" |
| diagnostico_entregue | Dropdown (Sim/Não) | Não | Campo próprio, com data de entrega |
| data_diagnostico_entregue | Data | Não | Quando diagnostico_entregue = Sim |
| precisa_proposta | Dropdown (Sim/Não/Ainda não) | Sim | Campo separado de proposta enviada |
| proposta_enviada | Dropdown (Sim/Não) | Não | Campo separado de precisa_proposta |
| responsável | Dropdown | Sim | |
| estágio | Dropdown (Oportunidade/Pausado/Descartado) | Sim | |
| data de entrada | Data | Sim | |
| próxima ação | Texto | Sim | |
| prazo | Data | Sim | |
| motivo de perda/pausa | Dropdown | Não | |
| histórico anterior | Texto | Não | Se veio de legado |

### E.5 — Entidade Proposta

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| proposal_id | ID automático | Sim | Nasce quando há proposta formal |
| opportunity_id | ID (relação) | Sim | |
| contato principal | ID (relação) | Sim | |
| escopo humano aprovado | Texto | Sim | Validado por humana |
| produto/SKU de referência | Relação (Mestre) | Sim | **Somente da Mestre** |
| preço aprovado | Decimal | Sim | **Somente da Mestre** |
| condição comercial | Dropdown (À vista/Etapas/Recorrência) | Sim | |
| proposta emitida em | Data | Sim | |
| validade | Data | Sim | |
| status de proposta | Dropdown (Enviada/Aceita/Recusada/Expirada) | Sim | |
| aceite | Dropdown (Sim/Não/Pendente) | Sim | |
| observações | Texto | Não | |
| link/arquivo da proposta | Texto | Não | |
| responsável | Dropdown | Sim | |
| data de follow-up | Data | Sim | |

### E.6 — Entidade Caso Operacional

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| case_id | ID automático | Sim | **Só nasce após aceite comercial** |
| proposal_id | ID (relação) | Sim | |
| contact_id | ID (relação) | Sim | |
| cliente/família | Texto | Sim | |
| responsável | Dropdown | Sim | |
| país/linha | Dropdown + texto | Sim | |
| escopo contratado | Texto | Sim | |
| contrato | Dropdown (Pendente/Assinado/Não aplicável) | Sim | |
| pagamento | Dropdown (Pendente/Confirmado/Não aplicável) | Sim | Confirmado só após Asaas |
| onboarding | Dropdown (Liberado/Em andamento/Não iniciado) | Sim | |
| documentos | Texto livre | Não | |
| fase atual | Dropdown (Fase 1/Fase 2 prevista/Fase 2 em produção/Fase 2 entregue) | Sim | |
| entregas | Texto | Não | |
| próxima ação | Texto | Sim | |
| riscos | Texto | Não | |
| data de abertura | Data | Sim | |
| status operacional | Dropdown (Ativo/Pausado/Concluído) | Sim | |
| acesso ao App permitido | Dropdown (Sim/Não) | Sim | |
| nível de acesso | Dropdown (Interno/Portal proposta/Workspace) | Sim | |

### E.7 — Entidade Legado

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| legacy_id | ID automático | Sim | |
| entidade original | Dropdown (Contato/Lead/Oportunidade/Proposta/Caso) | Sim | |
| ID original | ID | Sim | |
| motivo de arquivamento | Dropdown (Não convertido/Pausado >180d/Concluído/Inativo 12m/Duplicado) | Sim | |
| data de arquivamento | Data | Sim | |
| último contato | Data | Sim | |
| condição de reativação | Texto | Sim | |
| observação | Texto | Não | |
| relação com novo lead | ID | Não | Se reativado |

### E.8 — Entidade Interação e Tarefa

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| interaction_id | ID automático | Sim | |
| entidade relacionada | Dropdown (Contato/Lead/Oportunidade/Proposta/Caso) | Sim | |
| ID da entidade | ID | Sim | |
| canal | Dropdown (WhatsApp/Meet/E-mail/Presencial/Outro) | Sim | |
| data/hora | DateTime | Sim | |
| resumo | Texto | Sim | |
| responsável | Dropdown | Sim | |
| próximo passo | Texto | Sim | |
| due_date | Data | Sim | |
| status | Dropdown (Pendente/Em andamento/Concluído) | Sim | |
| prioridade | Dropdown (Baixa/Média/Alta/Crítica) | Sim | |
| vínculo com follow-up | ID | Não | |
| origem da tarefa | Dropdown (Call/Desk/App/Manual/Automática) | Sim | |

---

## F. Tabela de campos faltantes do Painel de Calls

| Nome do campo | Nome técnico | Tipo | Valores (dropdown) | Obrigatório? | Regra de preenchimento | Entidade CRM | Campo CRM | Gera tarefa? | LGPD | Visibilidade | Exemplo | Dependência humana? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Origem do lead | origem_lead | Dropdown | Google Ads, Instagram, Indicação, Direto, Evento, Outro | Sim | Selecionar ao criar Lead | Lead | origem_detalhada | Não | Não | Interno | Instagram | Não |
| Linha investigada | linha_investigada | Texto | — | Sim | Sobrenome/ancestral mencionado | Lead | linha_investigada | Sim (pesquisa preliminar) | Não | Interno | Piccoli | Não |
| Maturidade | maturidade | Dropdown | Explorando, Comparando, Decidido | Sim | Avaliar após call | Lead/Oportunidade | maturidade | Não | Não | Interno | Comparando | Não |
| Urgência declarada | urgencia | Dropdown | Baixa, Média, Alta | Sim | Perguntar na call | Lead | urgencia_declarada | Sim (priorizar) | Não | Interno | Média | Não |
| Consentimento de uso de dados | consentimento_dados | Dropdown | Sim, Não, Parcial | Sim | Confirmar verbalmente | Contato | consentimento_uso_dados | Não | Sim | Interno | Sim | Não |
| Responsável pela próxima ação | resp_proxima_acao | Dropdown | (lista de equipe) | Sim | Definir no pós-call | Tarefa | responsável | Sim | Não | Interno | Tatiana | Não |
| Prazo da próxima ação | prazo_proxima_acao | Data | — | Sim | Definir no pós-call | Tarefa | due_date | Sim | Não | Interno | 15/08/2026 | Não |
| Contact ID | contact_id | ID automático | — | Sim | Gerado ao criar contato | Contato | contact_id | Não | Não | Interno | CT-0001 | Não |
| Lead ID | lead_id | ID automático | — | Sim | Gerado ao criar lead | Lead | lead_id | Não | Não | Interno | LD-0001 | Não |
| Opportunity ID | opportunity_id | ID automático | — | Não | Gerado ao qualificar | Oportunidade | opportunity_id | Não | Não | Interno | OP-0001 | Não |
| Proposal ID | proposal_id | ID automático | — | Não | Gerado ao enviar proposta | Proposta | proposal_id | Não | Não | Interno | PR-0001 | Não |
| Case ID | case_id | ID automático | — | Não | Gerado após aceite comercial | Caso | case_id | Não | Não | Interno | CA-CID-IT-2026-001 | Sim (aceite) |
| Classificação de dados | classificacao_dados | Dropdown | Operacional, Legado, Teste, Modelo | Sim | Marcar em todo registro | Todas | classificacao | Não | Não | Interno | Operacional | Não |
| Hipótese de rota | hipotese_rota | Dropdown | Não definida, Em levantamento, Depende de evidências, Revisão humana necessária, Escopo não aplicável | Sim | Substitui "Via Jurídica Identificada" | Oportunidade | hipotese_rota | Sim (Validação Jurídica) | Não | Nunca expor | Depende de evidências | Sim |
| Necessidade de proposta | precisa_proposta | Dropdown | Sim, Não, Ainda não | Sim | Avaliar no pós-call | Oportunidade | proposta_necessaria | Sim (Preparar proposta) | Não | Interno | Sim | Não |
| Motivo de pausa/perda | motivo_pausa_perda | Dropdown | Sem resposta, Preço, Decidiu não prosseguir, Caso não qualifica, Outro | Não | Se aplicável | Lead/Oportunidade | motivo_saida | Não | Não | Interno | Preço | Não |
| Nível de acesso cliente | nivel_acesso_cliente | Dropdown | Interno, Portal de Proposta, Workspace do Cliente | Sim | Definir conforme estágio | Caso | nivel_acesso | Não | Não | Interno | Portal de Proposta | Sim |

---

## G. Template oficial de pós-call

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Data da call | Data | Sim | |
| Canal | Dropdown | Sim | WhatsApp/Meet/Presencial/Outro |
| Participantes | Texto | Sim | |
| Consentimento de gravação | Dropdown | Sim | LGPD |
| Consentimento de uso de dados | Dropdown | Sim | LGPD |
| Resumo factual | Texto livre | Sim | Sem conclusão jurídica |
| SPIN-S (Situação) | Dropdown | Sim | OK/Pendente |
| SPIN-P (Problema) | Dropdown | Sim | OK/Pendente |
| SPIN-I (Implicação) | Dropdown | Sim | OK/Pendente |
| SPIN-N (Necessidade) | Dropdown | Sim | OK/Pendente |
| Objetivo declarado | Dropdown | Sim | Cidadania/Genealogia/Memória/Herança/Outro |
| País/linha declarada | Texto | Sim | |
| Pessoas e gerações mencionadas | Texto | Não | |
| Documentos/evidências disponíveis | Texto | Sim | |
| Lacunas, dúvidas e bloqueadores | Texto | Sim | |
| Hipótese de rota | Dropdown | Sim | Sempre "PENDENTE DE VALIDAÇÃO HUMANA" |
| Produto/serviço discutido | Texto | Sim | Nunca ativado automaticamente |
| Maturidade | Dropdown | Sim | |
| Urgência declarada | Dropdown | Sim | |
| Estágio do ciclo de vida | Dropdown | Sim | |
| Decisão pós-call | Dropdown | Sim | Qualificar/Pausar/Descartar/Proposta |
| Próxima ação | Texto | Sim | |
| Responsável | Dropdown | Sim | |
| Prazo | Data | Sim | |
| Nível de acesso cliente | Dropdown | Sim | Interno/Portal/Workspace |
| Follow-up | Data + texto | Sim | |
| Necessidade de proposta | Dropdown | Sim | Sim/Não/Ainda não |
| Motivo de pausa/perda | Dropdown | Não | Se aplicável |
| Alertas para Desk | Texto | Não | Documentos faltantes, bloqueadores |
| Restrições de exposição ao App | Texto | Sim | O que NÃO pode aparecer no App |

---

## H. Modelo de Biblioteca Jurídica Interna

**Regra:** não construir nem alimentar conteúdo jurídico nesta rodada. Definir apenas o modelo.

| Campo | Tipo | Regra |
|---|---|---|
| knowledge_id | ID automático | |
| país/contexto | Dropdown | |
| tema | Texto | Ex: "Lei de Memória Democrática", "Jus sanguinis" |
| fonte oficial | Texto | URL ou referência |
| URL | Texto | Link da fonte |
| data de publicação | Data | Da fonte |
| data da última revisão | Data | Quando foi revisada pela última vez |
| responsável humano | Dropdown | Quem validou |
| status de validade | Dropdown (Vigente/Em revisão/Desatualizada/Encerrada) | |
| risco | Dropdown (Baixo/Médio/Alto) | Risco de uso indevido |
| observações | Texto | |
| aplicabilidade | Texto | Em quais casos se aplica |
| restrição de acesso | Dropdown (Interno/Painel/Nunca expor) | |
| proibição de uso como conclusão automática | Checkbox (sempre marcado) | **Nunca usar como regra conclusiva no roteiro ou no App** |

---

## I. Biblioteca WhatsApp organizada

**Fonte canônica:** [CA · CRM · Respostas Rápidas WhatsApp OFICIAL](https://docs.google.com/spreadsheets/d/1Tybe9MkHxWlatmEz0P9mr8GCrDF1AbRFu9MiJ2AJVdw/edit) — 32 mensagens, 8 famílias.

| Momento | Mensagens existentes | Status |
|---|---|---|
| Primeiro contato | /boasvindas, /saudacao, /ausencia, /contexto | Coberto (4) |
| Triagem | /contexto, /documentos, /momento | Coberto (3) |
| Confirmação de discovery | /call15 | Coberto (1) |
| Pós-call | **Gap** | Criar 1: "Resumo da nossa conversa + próximo passo" |
| Envio de proposta | /diag_1_apresentacao, /diag_2_link, combo | Coberto (3) |
| Follow-up leve | D+1, D+2, D+6 | Coberto (3) |
| Pausa | /sinalizou que não está no momento | Coberto (1) |
| Reativação | Lead que sumiu 2 semanas | Coberto (1) |
| Reativação 3+ meses | **Gap** | Criar 1: suave, sem pressão |
| Onboarding | **Gap** | Criar 1: boas-vindas ao workspace |
| Pós-entrega | **Gap** | Criar 1: satisfação + convite |
| Pós-compra | Após confirmar pagamento | Coberto (1) |
| Proposta recusada | **Gap** | Criar 1: sem pressão, à disposição |

### Mensagens-modelo para gaps (rascunho, não publicar)

1. **Pós-call:** "Oi [NOME], obrigada pela conversa de hoje. Resumindo: vamos [PRÓXIMO PASSO] até [PRAZO]. Qualquer dúvida, estou aqui."
2. **Reativação 3+ meses:** "Oi [NOME], lembrei de você e da história da família [SOBRENOME]. Se em algum momento quiser retomar, estou à disposição — sem pressa."
3. **Onboarding:** "Oi [NOME], bem-vinda ao seu espaço no Clube Ancestral. Para começar, preciso dos seguintes documentos: [LISTA]. Pode enviar quando tiver disponível."
4. **Pós-entrega:** "Oi [NOME], seu relatório foi entregue. Espero que sua família aproveite cada descoberta. Se quiser continuar explorando, tenho algumas opções — mas sem pressa."
5. **Proposta recusada:** "Entendo perfeitamente, [NOME]. É uma decisão importante e o timing precisa ser o certo. Fico à disposição se quiser conversar no futuro."

**Regras:** não automatizar agora; tom curto, acolhedor, humano; sem preço fora de proposta; sem promessa de resultado.

---

## J. Métricas reais de CRM e Discovery

| Métrica | Fórmula | Entidade fonte | Campo fonte | Exclusão | Condição dashboard | Periodicidade |
|---|---|---|---|---|---|---|
| Contatos novos | Contagem de contact_id no período | Contato | data_primeiro_contato | Excluir teste/legado/duplicados | CRM ativo | Semanal |
| Leads válidos | Contagem de lead_id ativos | Lead | status = Ativo | Excluir teste/legado/sem nome | CRM ativo | Semanal |
| Leads em triagem | Leads sem discovery | Lead | status = Aguardando resposta | Mesmo | CRM ativo | Semanal |
| Calls agendadas | Leads com call marcada | Discovery | status = Agendada | Mesmo | Painel + CRM | Semanal |
| Calls realizadas | Discovery completo | Discovery | status = Realizada | Mesmo | Painel | Semanal |
| Oportunidades qualificadas | Discovery qualificado | Oportunidade | opportunity_id | Mesmo | CRM ativo | Mensal |
| Diagnósticos solicitados | Oportunidades com diagnostico_solicitado = Sim | Oportunidade | diagnostico_solicitado (campo próprio Sim/Não) | Mesmo | CRM | Mensal |
| Diagnósticos entregues | Diagnóstico confirmado com data | Oportunidade/Desk | diagnostico_entregue (campo próprio Sim/Não + data) | Mesmo | CRM/Desk | Mensal |
| Propostas enviadas | proposal_id no período (campo separado de "precisa de proposta") | Proposta | proposta_emitida_em | Mesmo | CRM | Mensal |
| Propostas aceitas | Proposta status = Aceita | Proposta | status_proposta = Aceita | Mesmo | CRM | Mensal |
| Contratos assinados | Casos com contrato assinado | Caso | contrato = Assinado | Mesmo | Desk | Mensal |
| Pagamentos confirmados | Casos com pagamento confirmado | Caso | pagamento = Confirmado | Mesmo + Asaas reconciliado | Desk + Asaas | Mensal |
| Onboarding iniciado | Casos com onboarding liberado | Caso | onboarding = Liberado | Mesmo | Desk | Mensal |
| Casos ativos | Casos com status = Ativo | Caso | status_operacional = Ativo | Excluir concluído/legado | Desk | Semanal |
| Origem principal | Origem mais frequente | Lead | origem_detalhada | Excluir teste/legado | CRM | Mensal |
| Motivo principal pausa/perda | Razão mais comum | Lead/Oportunidade | motivo_saida | Mesmo | CRM | Mensal |
| Tempo contato → lead | Dias entre contato e lead | Contato/Lead | datas de entrada | Excluir sem data | CRM | Mensal |
| Tempo lead → call | Dias entre lead e discovery | Lead/Discovery | datas | Excluir sem data | CRM | Mensal |
| Tempo call → proposta | Dias entre discovery e proposta | Discovery/Proposta | datas | Excluir sem data | CRM | Mensal |
| Tempo proposta → aceite | Dias entre proposta e aceite | Proposta | datas | Excluir sem data | CRM | Mensal |
| Tempo aceite → pagamento | Dias entre aceite e confirmação | Proposta/Caso | datas | Excluir sem data | CRM + Asaas | Mensal |

**Hoje:** nenhuma métrica pode ser calculada — CRM é "DADOS TESTE" e o Painel tem 1 linha com dados reais.

---

## K. Backlog final

### Pronto para definir agora
1. Adotar roteiro mestre (Seção B do pente-fino anterior), guia SPIN (Seção B deste documento) e template pós-call (Seção G) como oficiais
2. Adotar esquema de campos do CRM (Seção E) como modelo conceitual canônico
3. Adotar modelo de Biblioteca Jurídica (Seção H) como estrutura
4. Confirmar que "Roteiro SPIN" e "Listas Base" não existem (PENDENTE DE VALIDAÇÃO HUMANA)

### Pronto para implementar depois de validação
5. Adicionar 17 campos faltantes no Painel de Calls (Seção F)
6. Converter campos de texto livre em dropdown
7. Renomear "Via Jurídica Identificada" para "Hipótese de rota" com valores não-conclusivos
8. Criar 5 mensagens de WhatsApp para gaps (Seção I)
9. Adaptar Manual SPIN conforme Seção A (remover trechos de pressão/promessa)

### Bloqueado por dados reais
10. Dashboard de métricas (Seção J) — requer CRM operacional
11. Funil de conversão — requer dados reais no CRM
12. Tempo entre estágios — requer datas preenchidas

### Bloqueado por decisão humana
13. Ratificar se o Manual SPIN adaptado substitui o original
14. Decidir se roteiros específicos por caso (ex.: Ana Luiza) continuam como referência
15. Confirmar se as 2 cópias duplicadas do Roteiro Ana Luiza são arquivadas

### Automação futura
16. Respostas rápidas automáticas no WhatsApp Business
17. Integração Painel Calls → CRM Lovable
18. Dashboard de métricas em tempo real

### Arquivar/histórico
19. 2 cópias duplicadas do Roteiro Ana Luiza
20. Master Fam. Mega Miranda (verificar se concluído)
21. Chat Alinhamento Fam. Mega (2025)
22. Referências a sales-content.ts, objecoes.tsx e Playbook antigo no Manual SPIN

---

## L. Decisão final

| Aspecto | Decisão |
|---|---|
| O que pode ser implementado no CRM | O esquema de 8 entidades (Seção E) com seus campos — quando o CRM operacional for ativado. Os 17 campos faltantes do Painel (Seção F) podem ser adicionados à estrutura existente. |
| O que deve permanecer conceitual | O modelo de Biblioteca Jurídica (Seção H) — definir estrutura, não alimentar conteúdo. O modelo de Legado (E.7) — definir regras, não migrar dados. |
| O que depende de dados reais | Todas as métricas (Seção J). O funil de conversão. Os tempos entre estágios. O dashboard. |
| O que exige validação humana | Renomear "Via Jurídica Identificada" para "Hipótese de rota". Decidir se Manual SPIN adaptado substitui o original. Confirmar inexistência das abas "Roteiro SPIN" e "Listas Base". Decidir se roteiros específicos por caso continuam. |
| O que não pode ser automatizado | Criação de case_id por interesse/call/diagnóstico. Promoção de candidato a produto ativo. Cobrança sem link Asaas aprovado. Decisão de elegibilidade jurídica. Envio de proposta sem preço da Mestre. Quaisquer indicadores baseados em dados fictícios ou legado. |

**Critério de aceite atendido:** o esquema permite construir um CRM Mestre simples, seguro e rastreável (8 entidades, campos obrigatórios definidos, identificadores únicos por estágio). As calls geram registro humano e estruturado (pós-call em 3 níveis). O legado é preservado sem contaminar o pipeline (entidade Legado separada, classificação obrigatória). Oportunidade nasce antes de caso. O App só recebe dados autorizados (3 níveis de acesso, 14 campos proibidos). Nada é automatizado sem validação humana.

---

## Adendo corretivo — fronteira CRM → Desk, consentimentos e métricas

### 1. Fronteira CRM → Desk

**Regra fundamental:** antes da existência de case_id, nenhuma tarefa deve ser enviada para Go-live, Formalização, Documentos, Financeiro, Fase 1 ou Fase 2 no Desk. Tarefas pré-case_id existem somente como Interação/Tarefa no CRM.

| Estágio | Onde ficam as tarefas | O que vai para o Desk |
|---|---|---|
| Contato / Lead / Discovery / Oportunidade | CRM (Interação/Tarefa) | Nada |
| Proposta / Aceite | CRM + Blueprint | Nada |
| Case_id (após aceite) | Desk passa a receber | Go-live, Formalização, Documentos, Financeiro, Fase 1/2 |

**Campos corrigidos na matriz (Seção D):** SPIN-S/P/I/N, Diagnóstico Feito, Via Jurídica, Documentos Pendentes, Produto/Valor, Resultado da Call e Follow-up — todos agora geram tarefa no CRM (Interação/Tarefa), não no Desk Go-live. O Desk só recebe após case_id.

### 2. Template de pós-call em níveis

O pós-call foi reestruturado em 3 níveis (Seção G atualizada):
- **Nível 1 (mínimo, toda call):** 10 campos obrigatórios — data, canal, participantes, responsável, resumo factual, objetivo, próximo passo, prazo, status do lead, consentimento aplicável.
- **Nível 2 (oportunidade qualificada):** 14 campos adicionais — país/linha, documentos, lacunas, maturidade, urgência, hipótese de rota, SPIN, necessidade de proposta, produto discutido, decisão, follow-up, nível de acesso, restrições de exposição.
- **Nível 3 (caso operacional, só após case_id):** 8 campos — case_id, escopo contratado, documentos detalhados, onboarding, formalização, pagamento, acesso App, alertas Desk.

Não tornar todos os campos obrigatórios para toda primeira call.

### 3. Consentimentos separados conceitualmente

Não tratar "consentimento lido" como prova universal. Separar:

| Tipo | O que cobre |
|---|---|
| a) Consentimento para contato | Autorização para manter comunicação |
| b) Ciência/consentimento para armazenamento e uso de dados | LGPD — armazenar e processar dados da conversa |
| c) Consentimento para gravação | Autorização específica para gravar a call |
| d) Consentimento para recebimento/compartilhamento de documentos | Autorização para enviar/receber documentos sensíveis |

**Política final de LGPD: PENDENTE DE VALIDAÇÃO HUMANA antes de implementação.**

### 4. Métricas corrigidas

- **Leads válidos** = lead identificado + contato válido + consentimento de contato quando aplicável + classificação operacional + sem teste/legado/duplicado. "Status ativo" isoladamente não define lead válido.
- **Diagnóstico solicitado** tem campo próprio: `diagnostico_solicitado = Sim/Não`.
- **Diagnóstico entregue** tem campo próprio: `diagnostico_entregue = Sim/Não` com data.
- **Precisa de proposta** e **Proposta enviada** são campos separados na entidade Oportunidade.

### 5. Preservado

- Manual SPIN adaptado como treinamento interno (não como guia de atendimento público).
- SPIN acolhedor, sem urgência artificial, sem promessa jurídica.
- Hipótese de rota como campo não conclusivo.
- Produto/preço apenas da Planilha Mestre.
- case_id somente após aceite comercial ou abertura formal de escopo.
- App Cliente recebendo somente dados autorizados após regras de acesso adequadas.
