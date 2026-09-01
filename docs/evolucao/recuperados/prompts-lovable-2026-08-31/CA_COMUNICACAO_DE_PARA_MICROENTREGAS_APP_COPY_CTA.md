# Clube Ancestral — Eixo de Comunicação: Biblioteca, Cadências, Touchpoints, Micro-entregas, App Copy e CTAs

**Versão:** 1.0  
**Data:** 28 de agosto de 2026  
**Destino:** Claude Code / produto / operações do Clube Ancestral  
**Objetivo:** consolidar em um único artefato a implantação futura do eixo de comunicação e o de-para entre eventos operacionais, micro-entregas, mensagens, touchpoints, superfícies do app, copy e CTA.

> **Regra operacional:** comunicação só é considerada implantada quando um evento real do cliente/caso gera uma ação persistida — mensagem, tarefa, atualização, card ou próxima ação — e quando o resultado da comunicação fica registrado no Caso 360. Não tratar biblioteca, lista de templates ou calendário sem execução como motor pronto.

---

# Parte I — Prompt completo de implantação

## Prompt para Claude Code

```markdown
# IMPLANTAÇÃO FUTURA — EIXO COMPLETO DE COMUNICAÇÃO DO CLUBE ANCESTRAL

Repositório: tatianatosi/soul-ancestry
Infraestrutura: Supabase próprio + Vercel

## Momento de execução

Executar somente depois que a proprietária tenha acesso estável e que estes fluxos já funcionem com dados persistidos:

Cliente → Caso → Proposta → Contrato → Financeiro → Atualização do caso.

Não iniciar se criar/editar/salvar dados básicos ainda falhar.

## Objetivo

Implantar um motor real de comunicação que conecte:

Evento de negócio/caso
→ cenário do cliente
→ micro-entrega ou pendência
→ mensagem/template correto
→ touchpoint no canal adequado
→ tarefa/ação da equipe
→ resposta/resultado registrado
→ próxima ação no Caso 360
→ atualização no app cliente quando liberada.

Não criar listas soltas. Não criar cadência genérica de D+0/D+1/D+15 para todos os clientes. Não criar automações que enviem mensagens cegamente.

## Escopo completo

1. Biblioteca de mensagens e templates.
2. Onboarding por cenário contratado.
3. Cadências por evento, fase e resultado.
4. Touchpoints de WhatsApp, e-mail, portal/app, reunião e tarefa interna.
5. Comunicação comercial: lead, proposta, contrato, pagamento.
6. Comunicação operacional: documentos, pesquisa, achados, pendências, milestones e protocolo.
7. Comunicação de pós-reconhecimento, memória, legado e assinatura.
8. Conteúdo e redes sociais: calendário editorial, canais, CTA e resultado.
9. Caso 360: histórico, última comunicação, próxima comunicação e cadência ativa.
10. Portal do cliente: atualizações e ações liberadas, sem dados internos.

## Acesso

Owner/admin autenticada com membership ativo pode criar, editar, ativar, pausar, duplicar, arquivar e executar rascunhos/comunicações da própria organização.

Não exigir:

- Modo Proprietária;
- reconfirmação de propriedade;
- auditoria como condição;
- aprovação em lote;
- gate de governança;
- SKU homologado;
- link Asaas;
- contrato assinado;
- fase obrigatória;
- checklist completo.

Falha de canal externo não pode bloquear caso, proposta, contrato, pagamento, documento, pesquisa ou tarefas. Deve preservar o rascunho e criar uma tarefa/aviso objetivo.

## Ações externas

Na primeira versão, WhatsApp, e-mail e publicação social devem funcionar como:

```text
Evento → rascunho + tarefa → revisão da proprietária → clique explícito de envio → registro do resultado.
```

Não ativar envio automático até que a proprietária aprove explicitamente a integração, os templates e a cadência correspondente.

## Modelo de dados

Usar tabelas existentes quando forem compatíveis. Criar migrations não destrutivas apenas quando a entidade não existir sob nome equivalente.

### communication_templates

```sql
create table communication_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  name text not null,
  category text not null,
  channel text not null,
  audience_type text not null,
  scenario_key text,
  trigger_event text,
  subject_template text,
  body_template text not null,
  variables_schema jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  version integer not null default 1,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code, version)
);
```

### communication_cadences

```sql
create table communication_cadences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  name text not null,
  scenario_key text,
  trigger_event text not null,
  status text not null default 'draft',
  stop_conditions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table communication_cadence_steps (
  id uuid primary key default gen_random_uuid(),
  cadence_id uuid not null references communication_cadences(id) on delete cascade,
  step_order integer not null,
  relative_to text not null default 'trigger',
  offset_days integer not null default 0,
  action_type text not null,
  channel text,
  template_id uuid references communication_templates(id),
  title text not null,
  requires_previous_outcome text,
  audience_type text not null default 'client',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (cadence_id, step_order)
);
```

### communication_runs e actions

```sql
create table communication_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  cadence_id uuid not null references communication_cadences(id),
  client_id uuid,
  lead_id uuid,
  case_id uuid,
  proposal_id uuid,
  contract_id uuid,
  source_event text not null,
  source_id uuid,
  scenario_key text,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  completed_at timestamptz,
  stop_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table communication_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  run_id uuid references communication_runs(id) on delete cascade,
  template_id uuid references communication_templates(id),
  client_id uuid,
  lead_id uuid,
  case_id uuid,
  channel text not null,
  direction text not null default 'outbound',
  action_type text not null,
  title text not null,
  rendered_subject text,
  rendered_body text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  completed_at timestamptz,
  status text not null default 'draft',
  assigned_to uuid,
  external_message_id text,
  related_task_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### communication_consents e content_calendar_items

```sql
create table communication_consents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  client_id uuid,
  lead_id uuid,
  channel text not null,
  consent_status text not null default 'unknown',
  source text,
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table content_calendar_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  title text not null,
  content_pillar text,
  format text,
  primary_channel text,
  secondary_channels text[] not null default '{}',
  audience text,
  funnel_stage text,
  status text not null default 'idea',
  planned_for timestamptz,
  published_at timestamptz,
  source_asset_url text,
  cta text,
  notes text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Criar índices por `organization_id`, `case_id`, `client_id`, `lead_id`, `status` e `scheduled_for`.

## Estados

```text
Template: draft, active, archived
Cadência: draft, active, paused, archived
Run: active, paused, completed, cancelled
Ação: draft, scheduled, ready_for_review, sent, delivered, read, replied, completed, skipped, cancelled, failed
Consentimento: unknown, granted, denied, withdrawn
Conteúdo: idea, briefing, drafting, review, approved, scheduled, published, archived
```

## Biblioteca e variáveis

Variáveis suportadas:

```text
{{primeiro_nome}}
{{nome_completo}}
{{nome_cliente}}
{{nome_lead}}
{{nome_caso}}
{{codigo_caso}}
{{pais}}
{{via}}
{{objetivo}}
{{nome_proposta}}
{{link_proposta}}
{{nome_contrato}}
{{link_contrato}}
{{valor_total}}
{{entrada}}
{{parcelas}}
{{proxima_acao}}
{{data_proxima_acao}}
{{documento_pendente}}
{{nome_documento}}
{{link_portal}}
{{link_pagamento}}
{{nome_responsavel}}
{{canal_contato}}
```

Se uma variável estiver ausente, destacar no editor e permitir correção manual. Permitir salvar rascunho sem bloquear.

## Cenários de onboarding

Implementar templates de onboarding por cenário:

```text
DIAG_CIDADANIA
PESQUISA_GENEALOGICA
CERTIDAO_AVULSA
COMBO_CERTIDOES
MONTAGEM_PASTA
ASSESSORIA_COMPLETA
PROTOCOLO_CONSULAR
PROTOCOLO_JUDICIAL
POS_RECONHECIMENTO
REGISTRO_FAMILIAR
ASSINATURA_ESSENCIA
ASSINATURA_MEMORIAS
ASSINATURA_LEGADO
```

Cada cenário deve contemplar:

```text
Entrada e boas-vindas
→ coleta inicial
→ primeira entrega
→ pendências do cliente
→ execução/pesquisa interna
→ atualizações recorrentes
→ preparação da próxima etapa
→ conclusão do escopo
→ continuidade, pós-venda ou legado
```

Não limitar os templates a uma timeline curta por dias. A cadência depende da fase, do resultado do cliente e dos marcos do caso.

## Eventos que devem disparar rascunhos/tarefas

```text
lead_created
lead_qualified
radar_completed
consultation_scheduled
consultation_completed
proposal_created
proposal_sent
proposal_accepted
proposal_declined
contract_created
contract_sent
contract_signed
payment_registered
payment_overdue
case_created
document_requested
document_received
document_validated
document_requires_action
research_finding_created
case_phase_changed
milestone_completed
filing_completed
recognition_confirmed
subscription_started
subscription_renewal_due
```

## Regras de cadência

- Um evento cria `communication_run` e ações/tarefas vinculadas.
- Não duplicar run para o mesmo evento-fonte, caso e template ativo.
- Se cliente responder, pagar, enviar documento, aceitar/recusar proposta ou assinar contrato, encerrar/suprimir lembretes equivalentes.
- Owner/admin pode pausar, reativar, concluir, cancelar ou reprogramar qualquer run/action.
- Não enviar mais de um contato automático pelo mesmo canal em 48 horas, salvo ação manual ou regra financeira explicitamente configurada.
- Ações de app/portal criam atualização e notificação in-app; não dependem de WhatsApp ou e-mail.

## Caso 360

Adicionar ao Caso 360:

```text
Última comunicação
Próxima comunicação/tarefa
Cadência ativa
Status do onboarding
Histórico de contatos
Rascunhos para revisão
Atualizações liberadas ao cliente
Botão: Criar mensagem manual
Botão: Pausar/Reativar cadência
Botão: Iniciar onboarding
```

## App Cliente

Exibir apenas informações liberadas:

```text
Atualização importante
Próximo passo
Documento solicitado
Documento liberado
Achado/descoberta liberado
Proposta/contrato disponível
Pagamento/informação financeira liberada
Ajuda e contato
```

Não expor templates internos, notas internas, cadências, métricas, regras comerciais, custo interno ou dados de outro cliente.

## Marketing e conteúdo

Implementar calendário editorial, não uma lista desconectada. Cada conteúdo deve ter:

```text
Título
Pilar
Formato
Canal principal
Canais secundários
Público
Etapa de funil
CTA
Data planejada
Status
Ativo/link
Métrica real quando disponível
Relação com campanha, lead ou origem quando houver
```

Canais:

```text
Perfil pessoal de Tatiana no LinkedIn
Newsletter LinkedIn
Página institucional Clube Ancestral
Instagram
Site/Blog
WhatsApp/Status quando aplicável
E-mail/nurture
App cliente: conteúdo de ajuda e orientação
```

Não inventar métricas, alcance, CAC, ROI ou conversão.

## Critérios de aceite

1. Criar template de WhatsApp, e-mail e atualização de portal com variáveis.
2. Criar um onboarding por cenário com etapas até continuidade, não apenas primeiros dias.
3. Iniciar onboarding manualmente para um caso e persistir run, tarefas e ações.
4. Criar proposta e gerar follow-up de proposta em rascunho/tarefa.
5. Renderizar mensagem com dados reais de cliente/caso/proposta.
6. Salvar rascunho e reencontrá-lo após refresh.
7. Registrar envio manual e resultado/resposta.
8. Encerrar lembrete equivalente após resposta/aceite/pagamento/documento recebido.
9. Criar pendência documental e gerar comunicação/tarefa contextual.
10. Criar micro-entrega/achado e liberar atualização no portal do cliente.
11. Exibir última comunicação, próxima ação e cadência ativa no Caso 360.
12. Criar item de conteúdo/calendário sem métricas fictícias.
13. Pausar uma cadência e confirmar que não cria novas ações enquanto pausada.
14. Simular falha de canal externo e confirmar que o rascunho é preservado e o caso não trava.
15. Confirmar que owner/admin opera sem Modo Proprietária, auditoria, reconfirmação ou gate.

## Proibições

- Não criar listas decorativas de mensagens.
- Não tratar D+0/D+1/D+15 como onboarding completo.
- Não disparar mensagem automática sem template, cenário, evento e mecanismo de parada.
- Não bloquear operação se uma integração externa falhar.
- Não criar auditoria/gate/reconfirmação para comunicação.
- Não usar dados de clientes reais em mocks.
- Não publicar conteúdo automaticamente sem aprovação explícita da proprietária.
- Não apagar bibliotecas, dados, propostas, contratos, contatos ou documentos existentes.

## Entrega

Entregar migrations não destrutivas, rotas/telas, CRUD persistido, preview Vercel, resultado dos critérios de aceite e falhas reais restantes. Não fazer merge em main sem aceite explícito da proprietária.
```

---

# Parte II — Biblioteca resgatada e catálogo de mensagens

Os materiais recuperados definem que o tom do Clube Ancestral é humano, consultivo, acolhedor, orientado à história familiar e à clareza de próximos passos; as mensagens devem apoiar a decisão sem pressão artificial. A estrutura de comunicação inclui propostas, follow-ups, WhatsApp, onboarding, micro-entregas, cards do app, conteúdo e relacionamento pós-reconhecimento. [file:22][file:36][file:83]

## 1. Convenção de códigos

```text
COM-LEAD-*       Lead, diagnóstico e agendamento
COM-PROP-*       Proposta e fechamento
COM-CONT-*       Contrato e formalização
COM-PAG-*        Financeiro e pagamento
COM-ONB-*        Onboarding
COM-DOC-*        Documentos
COM-PESQ-*       Pesquisa e achados
COM-PLAN-*       Jornada, milestones e protocolo
COM-POS-*        Pós-reconhecimento
COM-LEG-*        Legado, memória e assinatura
COM-SUP-*        Suporte e portal
COM-MKT-*        Conteúdo, marketing e nutrição
```

## 2. Princípios de copy

| Princípio | Aplicação |
|---|---|
| Humano e próximo | Tratar cada caso como história familiar e jornada individual, não como ticket burocrático. |
| Claro | Dizer o que aconteceu, o que isso significa e qual é o próximo passo. |
| Sem promessa jurídica | Usar “possibilidades”, “análise”, “enquadramento”, “estimativa” e “conforme documentação”. |
| Sem pressão artificial | Não criar urgência falsa, não repetir cobrança e não enviar link de pagamento sem contexto. |
| Um CTA por toque | Toda mensagem deve pedir uma única ação: responder, enviar documento, escolher opção, agendar, abrir portal ou confirmar recebimento. |
| Contexto antes de oferta | Primeiro entregar clareza/valor; depois oferecer serviço complementar quando ele resolve uma necessidade real. |
| Linguagem de parceria | “Vamos organizar”, “seguimos juntos”, “estou por aqui”, “no seu ritmo”. |

---

# Parte III — De-para: micro-entrega × mensagem × app copy × CTA

| Evento / Micro-entrega | Código de mensagem | Canal e touchpoint | Copy no app cliente | CTA no app | CTA na mensagem | Próxima ação no Desk | Oferta/SKU quando aplicável |
|---|---|---|---|---|---|---|---|
| Lead cadastrado | `COM-LEAD-BOASVINDAS-001` | WhatsApp/e-mail manual ou rascunho imediato | “Seu caminho começa aqui.” | “Iniciar diagnóstico” | “Conte o que você já sabe sobre sua família.” | Criar/atribuir lead e primeiro contato | Diagnóstico gratuito / Radar |
| Radar iniciado | `COM-LEAD-RADAR-001` | In-app; lembrete humano somente se abandono | “Você já começou a mapear sua história.” | “Continuar diagnóstico” | “Quando puder, retome de onde parou.” | Tarefa de follow-up se inativo | Diagnóstico gratuito |
| Radar concluído | `COM-LEAD-RESULTADO-001` | App + e-mail/WhatsApp de devolutiva | “Encontramos caminhos possíveis para analisar.” | “Ver próximos passos” | “Posso te explicar a leitura inicial e os próximos passos?” | Qualificar lead; criar oportunidade | Diagnóstico/consultoria |
| Diagnóstico contratado | `COM-ONB-DIAG-001` | WhatsApp + app | “Vamos organizar as primeiras informações do seu caso.” | “Enviar informações iniciais” | “Seu próximo passo é compartilhar o que você já possui.” | Iniciar onboarding `DIAG_CIDADANIA` | Diagnóstico individual |
| Primeira análise iniciada | `COM-ONB-DIAG-002` | App + atualização opcional | “Seu diagnóstico está em preparação.” | “Ver informações enviadas” | “Já iniciamos a leitura da sua linha familiar.” | Criar micro-entrega de início | Diagnóstico individual |
| Relatório de elegibilidade entregue | `COM-PLAN-DIAG-RESULTADO-001` | Portal + e-mail/WhatsApp | “Sua leitura inicial está disponível.” | “Abrir relatório” | “Preparei uma síntese com as possibilidades e próximos passos.” | Registrar entrega; criar follow-up de proposta | Consultoria / Montagem de Pasta / Assessoria Completa |
| Plano de ação definido | `COM-PLAN-ESTRATEGIA-001` | Portal + reunião/WhatsApp | “Seu caminho está organizado em etapas.” | “Ver jornada” | “Organizamos o caminho inicial para seguirmos com clareza.” | Criar milestones, requisitos e próxima ação | Montagem de Pasta / Assessoria Completa |
| Proposta criada | `COM-PROP-PRONTA-001` | Tarefa interna; rascunho | “Sua proposta está em preparação.” | — | “Estou finalizando a proposta com o escopo e os próximos passos.” | Criar follow-up/registrar proposta | Produto ou combo conforme caso |
| Proposta enviada | `COM-PROP-ENVIO-001` | WhatsApp/e-mail + arquivo/portal | “Sua proposta está disponível.” | “Abrir proposta” | “Estou te enviando a proposta para você analisar com calma.” | Registrar envio e data de follow-up | SKU(s) da proposta |
| Aceite verbal já registrado | `COM-PROP-ACEITE-VERBAL-001` | WhatsApp | “Aguardando sua confirmação para formalizar.” | “Confirmar escolha” | “Conforme combinamos, peço apenas sua confirmação por escrito para avançarmos com a formalização.” | Aguardar aceite escrito | Proposta ativa |
| Proposta aceita por escrito | `COM-PROP-ACEITE-001` | WhatsApp/e-mail + app | “Escolha registrada. Vamos formalizar sua entrada.” | “Ver próximos passos” | “Recebi sua confirmação. Vou preparar a formalização e o início da etapa.” | Criar contrato/financeiro; iniciar onboarding quando aplicável | SKU contratado |
| Proposta sem resposta | `COM-PROP-FOLLOW-001` | WhatsApp curto; após janela configurada | “Sua proposta segue disponível.” | “Abrir proposta” | “Passando para saber se conseguiu olhar o material e se ficou alguma dúvida.” | Tarefa de follow-up; pausar após limite | Nenhuma oferta nova |
| Contrato pronto | `COM-CONT-ENVIO-001` | E-mail/WhatsApp + portal | “Seu contrato está disponível para leitura.” | “Abrir contrato” | “Preparei o documento de formalização conforme a proposta escolhida.” | Registrar contrato enviado | Contrato vinculado |
| Contrato assinado/aceito | `COM-CONT-CONFIRMADO-001` | WhatsApp + app | “Sua contratação foi formalizada.” | “Iniciar jornada” | “Tudo certo com a formalização. Agora vamos iniciar a organização do seu caso.” | Ativar onboarding e plano financeiro | Produto contratado |
| Pagamento registrado | `COM-PAG-CONFIRMADO-001` | App + mensagem humana opcional | “Pagamento confirmado.” | “Ver próximos passos” | “Recebemos a confirmação e já vamos seguir para a próxima etapa.” | Atualizar financeiro; liberar onboarding | Produto contratado |
| Parcela próxima do vencimento | `COM-PAG-LEMBRETE-001` | Rascunho WhatsApp/e-mail | “Próxima parcela em [data].” | “Ver detalhes” | “Passando para lembrar da parcela com vencimento em [data].” | Criar tarefa financeira | Link Asaas apenas se válido |
| Pagamento vencido | `COM-PAG-ATRASO-001` | Rascunho; contato humano | “Há uma pendência financeira para revisar.” | “Ver detalhes” | “Identificamos uma parcela em aberto. Se precisar, podemos verificar a melhor forma de regularizar.” | Tarefa financeira; não bloquear caso automaticamente | Link de pagamento se aplicável |
| Onboarding iniciado | `COM-ONB-BOASVINDAS-001` | WhatsApp + portal | “Bem-vindo ao seu espaço no Clube Ancestral.” | “Enviar primeiros documentos” | “Que bom seguirmos juntos. Seu primeiro passo é [próxima ação].” | Criar tarefas e requisitos do cenário | Serviço contratado |
| Cliente não enviou item inicial | `COM-ONB-PENDENCIA-001` | Lembrete contextual | “Ainda precisamos de uma informação para seguir.” | “Enviar agora” | “Quando puder, nos envie [item] para continuarmos a organização do seu caso.” | Reagendar/acompanhar pendência | Nenhuma oferta |
| Checklist documental criado | `COM-DOC-CHECKLIST-001` | App + e-mail/WhatsApp | “Organizamos os documentos iniciais do seu caso.” | “Ver checklist” | “Seu checklist está disponível; começamos pelos itens mais importantes.” | Criar requisitos/documentos/tarefas | Pedido unitário / Combo de certidões |
| Documento solicitado | `COM-DOC-SOLICITADO-001` | Portal + rascunho WhatsApp | “Precisamos deste documento para seguir.” | “Enviar documento” | “O próximo documento que precisamos é [nome_documento].” | Criar/atualizar tarefa documental | Pedido de certidão, se necessário |
| Pedido de certidão iniciado | `COM-DOC-PEDIDO-001` | App | “Seu pedido documental foi iniciado.” | “Acompanhar status” | “Iniciamos a busca/solicitação do documento e atualizaremos você assim que houver novidade.” | Monitorar SLA/pedido | Pedido de certidão |
| Certidão localizada | `COM-PESQ-ACHADO-001` | App imediato + WhatsApp opcional | “Encontramos um novo registro da sua história.” | “Ver descoberta” | “Encontramos uma certidão/registro importante e já estamos avaliando os próximos passos.” | Criar micro-entrega e revisar documento | Emissão, tradução ou apostila se aplicável |
| Documento recebido | `COM-DOC-RECEBIDO-001` | App | “Recebemos seu documento.” | “Ver documento” | “Recebemos o material e ele seguirá para análise.” | Criar tarefa de revisão | Nenhuma oferta |
| Documento validado | `COM-DOC-VALIDADO-001` | App + resumo periódico | “Documento validado.” | “Ver progresso” | “Esse documento foi validado e fortalece a organização do seu caso.” | Atualizar checklist/progresso | Tradução/apostila se necessário |
| Tradução necessária | `COM-DOC-TRAD-001` | Portal + mensagem contextual | “Este documento precisa de tradução para avançarmos.” | “Ver próximo passo” | “Identificamos a necessidade de tradução deste documento para a etapa seguinte.” | Criar pendência/tarefa e proposta se aplicável | Tradução |
| Apostila necessária | `COM-DOC-APOS-001` | Portal + mensagem contextual | “Este documento precisa de apostilamento.” | “Ver próximo passo” | “Para a rota definida, este documento precisa passar por apostilamento.” | Criar pendência/tarefa | Apostilamento |
| Retificação necessária | `COM-DOC-RET-001` | WhatsApp/e-mail humano + app | “Encontramos uma divergência que precisa de atenção.” | “Entender a pendência” | “Identificamos uma divergência em [documento]. Vamos explicar o impacto e o caminho para tratá-la.” | Abrir retificação/revisão; orientar cliente | Retificação/revisão |
| Achado histórico relevante | `COM-PESQ-ACHADO-HIST-001` | Portal + WhatsApp de celebração opcional | “Uma nova peça da sua história foi encontrada.” | “Conhecer a descoberta” | “Encontramos um registro que ajuda a contar mais um capítulo da sua família.” | Liberar descoberta; criar atualização | Pesquisa complementar / Memórias |
| Linha ancestral inicial organizada | `COM-PESQ-LINHAGEM-001` | App + atualização | “Sua linha familiar começa a ganhar forma.” | “Explorar sua árvore” | “Organizamos os primeiros vínculos da sua linhagem e seguimos investigando as lacunas.” | Atualizar pessoas/relações | Pesquisa Genealógica / Plano Memórias |
| Relatório/entrega de pesquisa liberado | `COM-PESQ-RELATORIO-001` | Portal + e-mail | “Seu relatório está disponível.” | “Abrir relatório” | “Preparamos uma nova entrega da pesquisa para você consultar no seu espaço.” | Registrar micro-entrega/arquivo | Relatório expandido / Livro / Memória |
| Fase do caso mudou | `COM-PLAN-FASE-001` | App | “Você avançou para: [fase].” | “Ver jornada” | “Seu caso avançou para a etapa de [fase]. O próximo passo é [próxima_acao].” | Atualizar milestone, próxima tarefa e portal | Produto vinculado ao escopo |
| Pasta 80% pronta | `COM-PLAN-PASTA-001` | App + mensagem de progresso | “Sua pasta está 80% organizada.” | “Ver o que falta” | “Já concluímos uma parte importante da organização; agora faltam [itens].” | Priorizar pendências; agendar revisão | Revisão final, se não incluída |
| Pasta pronta para revisão final | `COM-PLAN-REVISAO-001` | App + mensagem humana | “Sua documentação entrou em revisão final.” | “Acompanhar jornada” | “A documentação essencial está organizada e entramos na etapa de revisão final.” | Criar revisão/proposta de protocolo se aplicável | Protocolo/Assessoria Completa |
| Protocolo realizado | `COM-PLAN-PROTOCOLO-001` | App + WhatsApp/e-mail | “Seu processo foi protocolado.” | “Ver comprovante e próximos marcos” | “O protocolo foi realizado. A partir de agora, acompanharemos os próximos movimentos e atualizaremos você.” | Registrar comprovante, milestone e próxima atualização | Serviço de protocolo |
| Atualização periódica de acompanhamento | `COM-PLAN-ATUALIZACAO-001` | App/e-mail mensal ou por marco | “Atualização do seu processo.” | “Ver andamento” | “Passando para compartilhar o andamento atual e o próximo marco previsto.” | Registrar atualização e próxima data | Acompanhamento contratado |
| Reconhecimento confirmado | `COM-POS-RECONHECIMENTO-001` | Portal + mensagem humana | “Uma nova etapa da sua história começa agora.” | “Ver próximos passos” | “Recebemos a confirmação do reconhecimento. Vamos orientar você nos próximos passos de registro e documentos.” | Criar jornada pós-reconhecimento | AIRE + Passaporte |
| AIRE/passaporte aplicável | `COM-POS-AIRE-001` | App + WhatsApp consultivo | “Seu próximo passo pós-reconhecimento.” | “Conhecer a etapa” | “Com o reconhecimento concluído, podemos organizar AIRE e passaporte conforme sua necessidade.” | Criar oportunidade/tarefa | AIRE + Passaporte |
| Registro de filho/casamento aplicável | `COM-POS-REG-001` | Portal + mensagem contextual | “Sua história também pode seguir com sua família.” | “Ver possibilidade” | “Podemos avaliar o registro de [filho/casamento] para ampliar esse legado familiar.” | Criar oportunidade familiar | Registro familiar |
| Descoberta de valor para memória | `COM-LEG-MEMORIA-001` | Portal + e-mail/WhatsApp | “Sua história merece ser preservada.” | “Ver sua linha do tempo” | “As descobertas reunidas já permitem construir uma memória mais completa da sua família.” | Criar entrega/contato de legado | Plano Memórias / Livro / Relatório |
| Linha do tempo familiar liberada | `COM-LEG-LINHA-TEMPO-001` | App | “Sua linha do tempo está disponível.” | “Explorar história” | “Organizamos marcos e histórias importantes da sua família em uma linha do tempo.” | Registrar entrega | Plano Memórias/Legado |
| Renovação de assinatura próxima | `COM-LEG-RENOVACAO-001` | Rascunho WhatsApp/e-mail | “Seu plano de continuidade está próximo da renovação.” | “Ver plano” | “Seu plano segue apoiando a organização e preservação da sua história. Posso te mostrar as opções de continuidade.” | Criar tarefa de retenção | Assinaturas CA-ASS-001/002/003 |
| Pedido de indicação | `COM-LEG-INDICACAO-001` | WhatsApp manual, após entrega relevante | “Sua história pode inspirar outras famílias.” | “Compartilhar o Clube” | “Se você conhecer alguém que também queira investigar a própria origem, será um prazer acolher essa pessoa.” | Registrar indicação/origem | Nenhuma oferta direta |
| Primeiro acesso ao portal | `COM-SUP-PORTAL-001` | E-mail/WhatsApp + app | “Seu espaço está pronto.” | “Entrar no meu espaço” | “Criamos seu espaço para acompanhar a jornada, documentos e descobertas.” | Registrar convite/acesso | Nenhuma oferta |
| Ajuda solicitada | `COM-SUP-AJUDA-001` | App + tarefa interna | “Estamos aqui para ajudar.” | “Falar com a equipe” | “Recebemos sua solicitação e retornaremos com orientação.” | Criar ticket/tarefa de suporte | Nenhuma oferta |

---

# Parte IV — Biblioteca de mensagens-base

## 1. Lead e diagnóstico

### `COM-LEAD-BOASVINDAS-001`

```text
Oi, {{primeiro_nome}}! Tudo bem?

Que bom ter você por aqui. No Clube Ancestral, começamos pelo que você já sabe sobre a sua família para organizar possibilidades, documentos e próximos caminhos.

Quando puder, conte um pouco sobre os sobrenomes, países de origem ou histórias que sua família preserva. 🌿
```

### `COM-LEAD-RESULTADO-001`

```text
Oi, {{primeiro_nome}}! 😊

A partir das informações que você compartilhou, já conseguimos identificar caminhos que valem uma análise mais cuidadosa.

Se fizer sentido para você, posso te explicar essa leitura inicial e os próximos passos possíveis para a sua história familiar.
```

## 2. Proposta e fechamento

### `COM-PROP-ENVIO-001`

```text
Oi, {{primeiro_nome}}! Tudo bem?

Preparei a sua proposta com o escopo desta etapa, o investimento e os próximos passos para organizarmos o processo com clareza.

Estou te enviando o material para você analisar com calma. Quando puder, me diga se ficou alguma dúvida ou se está de acordo para seguirmos. 🌿
```

### `COM-PROP-ACEITE-VERBAL-001`

```text
Oi, {{primeiro_nome}}! Tudo bem?

Conforme alinhamos na nossa última conversa, estou te enviando a proposta revisada referente à primeira etapa do seu processo.

Como já combinamos que vamos seguir, peço apenas que você me confirme por aqui que está de acordo com o material para eu avançar com a formalização e o início da etapa.

Se surgir qualquer dúvida pontual, estou à disposição. 🌿
```

### `COM-PROP-FOLLOW-001`

```text
Oi, {{primeiro_nome}}! Tudo bem?

Passando só para confirmar se você conseguiu ver a proposta que te enviei.

Quando puder, me diz se ficou alguma dúvida ou se está tudo certo para seguirmos. Estou à disposição. 🌿
```

## 3. Contrato, pagamento e entrada

### `COM-CONT-ENVIO-001`

```text
Oi, {{primeiro_nome}}! 😊

Preparei o documento de formalização conforme a proposta escolhida e deixei tudo organizado para sua leitura.

Quando puder, confira o material. Se estiver tudo certo, seguimos para a confirmação e para o início da jornada.
```

### `COM-PAG-CONFIRMADO-001`

```text
Oi, {{primeiro_nome}}! 😊

Recebemos a confirmação do pagamento. Obrigada pela confiança!

Agora seguimos para {{proxima_acao}}. Você também poderá acompanhar as atualizações pelo seu espaço do Clube Ancestral: {{link_portal}}
```

## 4. Onboarding e documentos

### `COM-ONB-BOASVINDAS-001`

```text
Oi, {{primeiro_nome}}! 😊

Que bom seguirmos juntos. A partir de agora, vamos organizar as primeiras informações e documentos do seu caso.

Seu próximo passo é: {{proxima_acao}}.

Você poderá acompanhar a jornada pelo seu espaço do Clube Ancestral: {{link_portal}}

Qualquer dúvida, estou por aqui. 🌿
```

### `COM-DOC-SOLICITADO-001`

```text
Oi, {{primeiro_nome}}! Tudo bem?

Para seguirmos com a organização do seu caso, precisamos do seguinte item: {{nome_documento}}.

Quando puder, envie pelo seu espaço ou me avise caso tenha alguma dúvida sobre como localizar esse documento. 🌿
```

### `COM-DOC-RET-001`

```text
Oi, {{primeiro_nome}}! 😊

Durante a análise, identificamos uma divergência em {{nome_documento}} que merece atenção antes de avançarmos.

Não precisa se preocupar: vamos organizar com você o impacto dessa informação e o caminho mais adequado para tratá-la.
```

## 5. Pesquisa, descobertas e jornada

### `COM-PESQ-ACHADO-001`

```text
Oi, {{primeiro_nome}}! 😊

Encontramos um novo registro importante para a sua pesquisa familiar.

Ele ajuda a avançar a organização da sua história e já estamos avaliando como essa descoberta se conecta aos próximos passos do caso. Assim que a análise estiver concluída, atualizamos você pelo seu espaço. 🌿
```

### `COM-PESQ-ACHADO-HIST-001`

```text
Oi, {{primeiro_nome}}! 🌿

Encontramos um registro que ajuda a contar mais um capítulo da sua família.

Já deixamos essa descoberta disponível no seu espaço para você conhecer com calma.
```

### `COM-PLAN-FASE-001`

```text
Oi, {{primeiro_nome}}!

Seu caso avançou para a etapa de {{fase}}.

O próximo passo é: {{proxima_acao}}. Você pode acompanhar a jornada e os marcos pelo seu espaço do Clube Ancestral.
```

### `COM-PLAN-PROTOCOLO-001`

```text
Oi, {{primeiro_nome}}! 😊

O protocolo do seu processo foi realizado.

A partir de agora, acompanharemos os próximos movimentos e manteremos você informado sobre cada marco relevante. O comprovante e a jornada atualizada estarão disponíveis no seu espaço.
```

## 6. Pós-reconhecimento e legado

### `COM-POS-RECONHECIMENTO-001`

```text
Oi, {{primeiro_nome}}! 🌿

Recebemos a confirmação de uma etapa muito importante: o reconhecimento foi concluído.

Agora podemos organizar os próximos passos práticos, como registros, AIRE e passaporte, conforme o seu caso e os planos da sua família.
```

### `COM-LEG-MEMORIA-001`

```text
Oi, {{primeiro_nome}}! 😊

As descobertas reunidas até aqui já mostram uma história familiar rica, que pode ser preservada para você e para as próximas gerações.

Quando fizer sentido, podemos transformar essa pesquisa em uma linha do tempo, caderno de memória ou outro registro de legado da sua família.
```

---

# Parte V — Copy e CTAs do app cliente

## 1. Home / Meu caso

| Situação | Copy principal | CTA |
|---|---|---|
| Caso recém-criado | “Seu caso começou. Vamos organizar os primeiros passos juntos.” | “Ver próximos passos” |
| Onboarding ativo | “Estamos reunindo as informações iniciais para orientar sua jornada.” | “Enviar informações” |
| Documento pendente | “Há um documento importante para continuarmos.” | “Enviar documento” |
| Documento recebido | “Recebemos seu documento. Ele está em análise.” | “Ver documento” |
| Atualização relevante | “Há uma nova atualização no seu caso.” | “Ver atualização” |
| Proposta disponível | “Sua proposta está pronta para consulta.” | “Abrir proposta” |
| Contrato disponível | “Seu documento de formalização está disponível.” | “Abrir contrato” |
| Pagamento confirmado | “Pagamento confirmado. Vamos seguir para a próxima etapa.” | “Ver próximos passos” |
| Achado histórico | “Encontramos uma nova peça da sua história.” | “Conhecer descoberta” |
| Caso em acompanhamento externo | “Seu processo segue em acompanhamento. Atualizaremos você a cada marco relevante.” | “Ver jornada” |

## 2. Jornada

| Estado | Copy | CTA |
|---|---|---|
| Diagnóstico | “Estamos organizando as informações que ajudam a definir seu caminho.” | “Ver diagnóstico” |
| Pendências | “Alguns documentos e informações ainda precisam ser reunidos.” | “Ver pendências” |
| Execução | “Sua jornada está em andamento com pesquisa, documentos e organização do processo.” | “Ver andamento” |
| Complementos | “Estamos tratando os ajustes necessários para fortalecer a próxima etapa.” | “Entender ajustes” |
| Continuidade | “Seguimos acompanhando os próximos marcos e as possibilidades para sua família.” | “Ver próximos passos” |

## 3. Documentos

| Estado | Copy | CTA |
|---|---|---|
| Sem documentos enviados | “Comece pelos documentos que você já tem em mãos.” | “Adicionar documento” |
| Documento solicitado | “Este documento ajuda a avançar a organização do seu caso.” | “Enviar documento” |
| Documento em análise | “Recebemos seu arquivo e estamos verificando as informações.” | “Ver status” |
| Documento validado | “Este documento foi validado e já compõe a organização do seu caso.” | “Ver progresso” |
| Ação adicional necessária | “Este item precisa de uma etapa complementar antes de seguir.” | “Ver orientação” |

## 4. Descobertas

| Situação | Copy | CTA |
|---|---|---|
| Primeira pessoa mapeada | “Sua árvore começa a ganhar forma.” | “Explorar árvore” |
| Achado histórico | “Uma nova descoberta foi adicionada à sua história familiar.” | “Conhecer descoberta” |
| Relatório liberado | “Preparamos uma nova entrega para você consultar.” | “Abrir relatório” |
| Linha do tempo disponível | “Os marcos da sua família estão organizados em uma linha do tempo.” | “Explorar história” |

## 5. Propostas, contratos e financeiro

| Situação | Copy | CTA |
|---|---|---|
| Proposta pendente | “Sua proposta está disponível para leitura.” | “Abrir proposta” |
| Escolha aguardada | “Quando estiver pronto, escolha o formato que faz mais sentido para este momento.” | “Ver opções” |
| Contrato pronto | “Seu documento de formalização está disponível.” | “Abrir contrato” |
| Pagamento pendente | “Há uma informação financeira disponível para você consultar.” | “Ver detalhes” |
| Link de pagamento válido | “Você pode seguir com a forma de pagamento escolhida.” | “Ir para pagamento” |
| Link não configurado | “Fale com a equipe para organizar a próxima etapa.” | “Falar com a equipe” |

---

# Parte VI — Touchpoints e cadências por jornada

| Momento | Canal primário | Canal secundário | Frequência/regra | Objetivo | Parar quando |
|---|---|---|---|---|---|
| Novo lead | WhatsApp ou e-mail | Tarefa no Desk | Imediato ou em até 1 dia útil | Acolher e entender objetivo | Lead responder ou ser pausado |
| Radar abandonado | In-app | WhatsApp humano | Após janela configurada, sem repetição excessiva | Retomar diagnóstico | Radar concluído ou lead pausar |
| Proposta enviada | WhatsApp/e-mail + portal | Tarefa no Desk | Follow-up contextual conforme política | Esclarecer e receber decisão | Aceite, recusa ou pausa |
| Contrato enviado | E-mail/portal | WhatsApp humano | Lembrete somente se pendente | Formalizar | Contrato aceito/assinado/cancelado |
| Pagamento registrado | App | WhatsApp humano opcional | Imediato | Confirmar início | Sempre após confirmação |
| Onboarding | App + WhatsApp | E-mail | Por tarefa/pêndencia real | Coletar dados e orientar | Coleta mínima concluída ou pausada |
| Documento pendente | App | WhatsApp/e-mail | Consolidado; priorizar bloqueantes | Solicitar ação | Documento recebido ou requisito dispensado |
| Achado histórico | App | WhatsApp de celebração opcional | Por descoberta relevante | Entregar valor | Entrega registrada |
| Atualização de pesquisa | App | E-mail/WhatsApp periódico | Por marco ou ciclo definido | Transparência | Caso pausado/concluído |
| Protocolo e acompanhamento | App | E-mail/WhatsApp por evento | Por marco externo ou boletim | Informar sem ansiedade | Caso concluído |
| Pós-reconhecimento | Portal + WhatsApp | E-mail | Após confirmação formal | Abrir continuidade | Serviço pós-venda concluído/recusado |
| Assinatura/legado | App/e-mail | WhatsApp consultivo | Próximo à renovação ou nova entrega | Retenção e valor contínuo | Renovação, cancelamento ou pausa |

---

# Parte VII — Conteúdo e redes sociais

## 1. Papel de cada canal

| Canal | Papel | Tipos de conteúdo | CTA predominante |
|---|---|---|---|
| Perfil pessoal de Tatiana no LinkedIn | Autoridade, história e confiança | Artigos autorais, bastidores, vocação, aprendizados e reflexões | “Conheça o Clube Ancestral” / “Converse conosco” |
| Newsletter LinkedIn | Recorrência e nutrição | Séries temáticas, educação, curadoria e história familiar | “Acompanhe a próxima edição” / “Faça seu diagnóstico” |
| Página institucional Clube Ancestral | Educação e conversão | Serviços, método, cidadania, genealogia, documentos e provas de processo | “Descobrir meu caminho” |
| Instagram | Alcance visual, memória e vínculo | Carrosséis, relatos, bastidores, descobertas, educação curta | “Salvar”, “Compartilhar”, “Falar com a equipe” |
| Site | Conversão e profundidade | Landing, páginas de país, diagnóstico, explicações de serviço | “Iniciar diagnóstico” |
| WhatsApp | Relacionamento individual | Proposta, follow-up, orientação, atualização e acolhimento | “Responder”, “Enviar documento”, “Confirmar escolha” |
| App cliente | Continuidade e transparência | Jornada, documentos, atualizações, entregas e ajuda | “Ver próximos passos” |

## 2. Pilares editoriais

```text
Genealogia profissional
Cidadania por ancestralidade
Documentos e pesquisa histórica
Memória, identidade e legado
Bastidores de método
Orientação para famílias brasileiras
Histórias e aprendizados sem exposição de dados de clientes
```

## 3. De-para conteúdo → funil → CTA

| Pilar | Formato | Canal | Fase de funil | CTA |
|---|---|---|---|---|
| O que faz um genealogista | Artigo/carrossel | LinkedIn/site | Descoberta | “Entenda como funciona” |
| Como começar uma pesquisa familiar | Carrossel/reel/post | Instagram/LinkedIn | Descoberta | “Conte o que você já sabe” |
| Cidadania por ancestralidade | Página/artigo | Site/LinkedIn | Consideração | “Fazer diagnóstico” |
| Documentos e certidões | Guia/checklist | Site/app | Consideração/execução | “Ver checklist” |
| Bastidor de descoberta | Post/relato | Instagram/LinkedIn | Relacionamento | “Acompanhar o Clube” |
| Memória familiar | Artigo/newsletter | Perfil pessoal/newsletter | Relacionamento | “Preservar sua história” |
| Pós-reconhecimento | Guia/caso educacional | Site/app | Retenção | “Conhecer próximos passos” |
| Legado familiar | Carrossel/landing | Instagram/site | Retenção/indicação | “Falar com a equipe” |

---

# Parte VIII — Operação diária no Caso 360

## Checklist de leitura rápida

Ao abrir um caso, a proprietária deve enxergar:

```text
Cliente e contato
Fase e próxima ação
Última comunicação
Rascunho pendente de revisão
Cadência/onboarding ativo
Proposta, contrato e pagamento
Documentos críticos
Última micro-entrega
Próximo milestone
Atualização liberada ou pendente para o portal
```

## Ações rápidas obrigatórias

```text
Criar mensagem manual
Usar template
Enviar atualização ao cliente
Registrar resposta
Iniciar onboarding
Pausar cadência
Criar tarefa de follow-up
Liberar descoberta/documento
Enviar proposta
Enviar contrato
Registrar pagamento
Abrir visão do cliente
```

---

# Parte IX — Critério de “pronto”

O eixo de comunicação só pode ser marcado como funcional quando:

1. Um evento real cria uma ação/tarefa persistida.
2. A proprietária consegue editar um rascunho e enviá-lo manualmente.
3. O histórico aparece no Caso 360 após recarregar a página.
4. A resposta do cliente encerra os lembretes equivalentes.
5. Uma micro-entrega gera atualização contextual no app/portal quando liberada.
6. Onboarding varia de acordo com cenário/serviço, não somente por dias.
7. Nenhuma falha de WhatsApp/e-mail/Asaas trava o caso.
8. Nenhuma ação exige Modo Proprietária, reconfirmação, auditoria, gate ou aprovação interna.
9. A proprietária mantém controle de pausa, revisão e envio.
10. Métricas de conteúdo/marketing só aparecem quando há dados reais.

---

# Fontes resgatadas

- Estudo de micro-entregas, ofertas contextuais, app cliente, Desk e catálogo/SKUs. [file:22]
- Materiais do Ancestral Canvas: jornada de cinco etapas, cards de Home/Jornada/Documentos/Conta e integração proposta → pagamento → app/Desk. [file:36]
- Modelos de comunicação acolhedora e follow-up de proposta, incluindo referência de Ana Luiza. [file:83]
- Plano de conteúdo, canais e funis do Clube Ancestral recuperado nos materiais do projeto. [file:22]
