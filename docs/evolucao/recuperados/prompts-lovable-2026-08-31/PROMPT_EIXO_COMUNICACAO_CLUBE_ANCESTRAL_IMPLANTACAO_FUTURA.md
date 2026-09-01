# Prompt de Implantação Futura — Eixo de Comunicação do Clube Ancestral

**Projeto:** `tatianatosi/soul-ancestry`  
**Destino:** Claude Code / equipe de desenvolvimento  
**Momento de uso:** somente após a proprietária recuperar acesso estável e os fluxos básicos de Cliente → Caso → Proposta → Contrato → Financeiro funcionarem com dados persistidos.  
**Objetivo:** implantar o eixo completo de comunicação do Clube Ancestral, conectando biblioteca de mensagens, onboarding por cenário, cadências, atendimento, propostas, atualizações de caso, pós-venda e conteúdo/redes sociais.

---

## 0. Pré-condição obrigatória

**Não iniciar esta implantação enquanto os fluxos básicos ainda falharem.**

Antes desta tarefa, a proprietária precisa conseguir:

```text
Entrar no Desk
→ criar cliente
→ criar caso
→ registrar atualização
→ criar proposta
→ gerar contrato
→ registrar pagamento
→ recarregar e encontrar os dados persistidos
```

Se uma dessas ações não funcionar, interromper este prompt e corrigir o núcleo primeiro.

---

## 1. Decisão de produto

O eixo de comunicação não é um conjunto de listas de mensagens. Ele é um motor que conecta evento, contexto, mensagem, canal, responsável, data, resposta e próximo passo.

```text
Evento real de negócio ou caso
→ identificar cenário e contexto
→ selecionar template correto da biblioteca
→ criar comunicação/tarefa agendada
→ proprietária revisa e envia, ou automação envia somente quando configurada
→ registrar entrega/resposta
→ criar ou atualizar próxima ação
→ mostrar histórico no Caso 360 e no portal, quando aplicável
```

Nenhuma mensagem deve ser disparada sem contexto de cliente/caso/cenário. Nenhuma cadência deve ser uma sequência fixa universal de D+0, D+1 e D+15.

---

## 2. Escopo do eixo

Implementar os blocos abaixo, conectados e persistidos:

```text
A. Biblioteca de mensagens
B. Onboarding por cenário
C. Cadências por evento e fase
D. Atendimento e histórico de conversas
E. Comunicação de proposta e fechamento
F. Comunicação de andamento, documentos e descobertas
G. Pós-venda, legado, indicação e renovação
H. Conteúdo e redes sociais: calendário, produção e distribuição
I. Caso 360 e portal do cliente: visualização de comunicações relevantes
```

---

## 3. Regras de segurança e operação

### A proprietária

- Pode criar, editar, ativar, pausar, duplicar e arquivar templates, cadências e campanhas.
- Pode enviar mensagem manualmente a qualquer momento para clientes/leads da própria organização.
- Pode pausar automações por caso ou por cliente.
- Não precisa usar Modo Proprietária, reconfirmação, auditoria, gate, aprovação ou justificativa para operar comunicação interna.

### Ações externas reais

- Enviar e-mail, WhatsApp, SMS ou publicar em rede social são ações externas.
- Na primeira versão, o sistema deve criar o rascunho e a tarefa; o envio deve acontecer somente após clique explícito da proprietária.
- Quando integrações estiverem configuradas, a automação só pode enviar mensagens com template ativo, consentimento aplicável e registro de envio.
- Falha de integração deve criar tarefa/aviso e não travar o caso nem apagar o rascunho.

### Anti-spam

- Nunca criar duas ações iguais para o mesmo cliente/caso/template na mesma janela de supressão.
- Não enviar mais de um contato automático pelo mesmo canal em 48 horas, salvo se a proprietária enviar manualmente ou houver vencimento/urgência configurada.
- Quando o cliente responde, paga, envia documento ou conclui a ação esperada, cancelar os lembretes equivalentes.
- Cadências devem ser pausáveis por cliente/caso.

---

## 4. Modelo de dados

Usar tabelas existentes quando compatíveis. Criar migrations apenas se a entidade correspondente não existir. Não duplicar tabelas já implantadas sob outro nome.

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

create index communication_actions_org_status_date_idx
  on communication_actions (organization_id, status, scheduled_for);
create index communication_actions_case_idx
  on communication_actions (case_id, created_at desc);
create index communication_runs_case_status_idx
  on communication_runs (case_id, status);
create index content_calendar_org_date_idx
  on content_calendar_items (organization_id, planned_for, status);
```

### Estados padronizados

```text
Templates: draft, active, archived
Cadências: draft, active, paused, archived
Runs: active, paused, completed, cancelled
Ações: draft, scheduled, ready_for_review, sent, delivered, read, replied, completed, skipped, cancelled, failed
Consentimento: unknown, granted, denied, withdrawn
Conteúdo: idea, briefing, drafting, review, approved, scheduled, published, archived
```

---

## 5. Biblioteca de mensagens

### Estrutura de template

Cada template precisa ter:

```text
Código único
Nome interno
Categoria
Canal
Público
Cenário aplicável
Assunto, se e-mail
Texto-base editável
Variáveis disponíveis
Status: rascunho/ativo/arquivado
Versão
```

### Variáveis padronizadas

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

Variável ausente não pode gerar mensagem quebrada. Antes de enviar, destacar a variável faltante e permitir edição manual. Isso não deve impedir salvar o rascunho.

### Categorias iniciais

```text
boas_vindas
onboarding
agenda
proposta
contrato
pagamento
documentos
pesquisa
atualizacao_de_caso
achado_historico
planejador
protocolo
pos_reconhecimento
legado
indicacao
retencao
marketing_organico
newsletter
suporte
```

---

## 6. Onboarding completo por cenário

Não limitar onboarding a uma cadência universal de D+0, D+1 e D+15. Cada cenário deve ter uma jornada que possa seguir da entrada até a continuidade.

### Cenários que devem existir

| Chave | Cenário | Entrada possível |
|---|---|---|
| `DIAG_CIDADANIA` | Diagnóstico/consultoria de cidadania | proposta aceita, pagamento ou ativação manual |
| `PESQUISA_GENEALOGICA` | Pesquisa genealógica e memória | contrato/pagamento/manual |
| `CERTIDAO_AVULSA` | Pedido unitário de certidão | compra/manual |
| `COMBO_CERTIDOES` | Lote/combo de certidões | compra/manual |
| `MONTAGEM_PASTA` | Montagem documental | proposta/contrato/pagamento |
| `ASSESSORIA_COMPLETA` | Assessoria completa de cidadania | contrato ativo |
| `PROTOCOLO_CONSULAR` | Protocolo consular | pasta aprovada/manual |
| `PROTOCOLO_JUDICIAL` | Via judicial | pasta aprovada/manual |
| `POS_RECONHECIMENTO` | AIRE, passaporte e registros | reconhecimento/manual |
| `REGISTRO_FAMILIAR` | Registro de filho/casamento | compra/manual |
| `ASSINATURA_ESSENCIA` | Plano Essência | assinatura ativa |
| `ASSINATURA_MEMORIAS` | Plano Memórias | assinatura ativa |
| `ASSINATURA_LEGADO` | Plano Legado | assinatura ativa |

### Etapas obrigatórias de cada onboarding

Cada cenário deve poder configurar as etapas abaixo, com tarefas e comunicações próprias:

```text
1. Entrada e boas-vindas
2. Coleta inicial
3. Primeira entrega ou devolutiva
4. Pendências do cliente
5. Execução interna/pesquisa
6. Atualizações recorrentes
7. Preparação de próxima etapa
8. Conclusão do escopo contratado
9. Continuidade, pós-venda ou legado
```

### Exemplo: `DIAG_CIDADANIA`

| Momento | Ação/touchpoint | Objetivo |
|---|---|---|
| Entrada | Confirmação acolhedora + link de informações | Confirmar início e reduzir ansiedade |
| Coleta | Solicitar dados familiares e documentos disponíveis | Preparar análise |
| Primeira entrega | Confirmar que análise/mapeamento começou | Mostrar avanço concreto |
| Devolutiva | Enviar/compartilhar relatório e convidar para conversa | Entregar direção inicial |
| Próxima etapa | Apresentar opções de pesquisa, documentos ou assessoria | Converter com contexto |
| Continuidade | Registrar aceite, pausa ou follow-up | Evitar perda de contexto |

### Exemplo: `ASSESSORIA_COMPLETA`

| Momento | Ação/touchpoint | Objetivo |
|---|---|---|
| Entrada | Boas-vindas e apresentação do espaço do cliente | Início claro |
| Coleta | Checklist inicial de documentos e dados | Preparar execução |
| Pesquisa | Atualização por achado/documento/pendência relevante | Transparência |
| Documentos | Solicitação e lembrete contextual de item crítico | Desbloquear caso |
| Pasta | Atualização de progresso e preparação para revisão | Mostrar evolução |
| Protocolo | Comunicar preparação, protocolo e comprovante | Formalizar marco |
| Acompanhamento | Boletim periódico por marco ou data definida | Manter previsibilidade |
| Conclusão | Orientar pós-reconhecimento e legado | Continuidade lógica |

### Exemplo: `PESQUISA_GENEALOGICA`

| Momento | Ação/touchpoint | Objetivo |
|---|---|---|
| Entrada | Boas-vindas e perguntas de memória familiar | Coletar contexto |
| Coleta | Solicitar sobrenomes, locais, documentos, fotos e histórias | Aumentar base de pesquisa |
| Primeira descoberta | Compartilhar achado com contexto | Entregar valor emocional/técnico |
| Pesquisa recorrente | Atualização por marco de pesquisa | Acompanhar progresso |
| Entrega | Relatório, linha do tempo ou árvore | Concluir escopo |
| Legado | Oferecer continuidade de memória/assinatura se fizer sentido | Retenção contextual |

---

## 7. Cadências por evento

A cadência deve ser iniciada por evento real e guardar o vínculo com o lead, cliente, caso, proposta, contrato ou pagamento.

### Eventos mínimos

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

### Cadências mínimas

| Código | Disparador | Resultado real |
|---|---|---|
| `CAD-LEAD-PRIMEIRO_CONTATO` | `lead_created` | tarefa de primeiro contato + rascunho de mensagem |
| `CAD-LEAD-QUALIFICACAO` | `lead_qualified` | tarefa de atendimento e convite para diagnóstico |
| `CAD-PROPOSTA-FOLLOW_UP` | `proposal_sent` | follow-ups contextuais até resposta/aceite/pausa |
| `CAD-CONTRATO-ASSINATURA` | `contract_sent` | lembrete de assinatura até aceite/pausa |
| `CAD-ONBOARDING-*` | contrato, pagamento ou ativação manual | tarefas e mensagens por cenário |
| `CAD-DOCUMENTO-PENDENTE` | `document_requested` | lembrete contextual e tarefa interna |
| `CAD-ATUALIZACAO-EM_ANDAMENTO` | caso ativo sem atualização | tarefa de atualização periódica, não envio cego |
| `CAD-PAGAMENTO-ATRASO` | `payment_overdue` | tarefa financeira e rascunho de mensagem |
| `CAD-POS-RECONHECIMENTO` | `recognition_confirmed` | orientação e oportunidade de continuidade |
| `CAD-RENOVACAO-ASSINATURA` | renovação próxima | tarefa de retenção e mensagem de valor entregue |

### Regra de encerramento

Cada cadência deve encerrar ou pausar quando ocorrer o resultado esperado. Exemplos:

```text
Proposta aceita, recusada ou pausada → encerrar follow-up de proposta
Contrato assinado/cancelado → encerrar lembrete de assinatura
Documento recebido → encerrar lembrete daquele documento
Pagamento registrado → encerrar cobrança correspondente
Caso encerrado → pausar cadências operacionais do caso
Cliente pede pausa/opt-out → pausar comunicações automáticas
```

---

## 8. Atendimento, propostas e mensagens comerciais

### Princípios de linguagem

- Tom humano, consultivo, claro e respeitoso.
- Não prometer cidadania, prazo garantido ou resultado jurídico.
- Não usar urgência artificial.
- Sempre explicar o próximo passo.
- Quando houver proposta, comunicar escopo e decisão, não apenas preço.
- Mensagens devem ser curtas em WhatsApp e mais detalhadas em e-mail/portal quando necessário.

### Template: proposta pronta após confirmação verbal

**Código:** `COM-PROP-ENVIO-VERBAL-001`  
**Canal:** WhatsApp  
**Uso:** cliente confirmou verbalmente interesse em seguir para o primeiro estágio; proposta está pronta e será enviada com print/arquivo para apreciação.

```text
Oi, {{primeiro_nome}}! Tudo bem?

Conforme conversamos, preparei a sua proposta para seguirmos com o primeiro estágio do seu processo.

Estou te enviando o material aqui para você olhar com calma. Nele estão o escopo desta etapa, o investimento e os próximos passos para iniciarmos a organização do caso.

Quando conseguir analisar, me confirme por aqui se está de acordo ou se prefere que eu esclareça algum ponto antes de avançarmos.

Fico à disposição. 🌿
```

### Versão curta para WhatsApp

**Código:** `COM-PROP-ENVIO-VERBAL-002`

```text
Oi, {{primeiro_nome}}! Tudo bem?

Conforme combinamos, preparei a sua proposta para o primeiro estágio do processo e estou te enviando o print/material aqui.

Dá uma olhada com calma e, quando puder, me confirma se está de acordo para seguirmos. Se tiver qualquer dúvida, estou à disposição. 🌿
```

### Template: proposta pronta para apresentar em reunião

**Código:** `COM-PROP-REUNIAO-001`

```text
Oi, {{primeiro_nome}}! 😊

Passando para te contar que finalizei o mapeamento inicial e a proposta está pronta.

Quero te apresentar tudo com calma — o caminho identificado, o escopo, os valores e os próximos passos — para que você possa decidir com segurança.

Quando você tiver disponibilidade, me avisa e marcamos uma conversa breve. 🌿
```

### Template: confirmação de início após aceite

**Código:** `COM-ONB-INICIO-001`

```text
Oi, {{primeiro_nome}}! 😊

Que bom seguirmos juntos. A partir de agora, vamos organizar as primeiras informações e documentos do seu caso.

Seu próximo passo é: {{proxima_acao}}.

Você também poderá acompanhar as atualizações pelo seu espaço do Clube Ancestral: {{link_portal}}

Qualquer dúvida, estou por aqui. 🌿
```

---

## 9. Mensagem pronta para João — envio da proposta

Com base no modelo curto já utilizado para Ana Luiza — atualização acolhedora, proposta pronta, convite para analisar com calma e abertura para dúvidas — usar a versão abaixo para João. O modelo de Ana Luiza foi resgatado dos materiais do projeto: primeiro como aviso de preparação da proposta e depois como follow-up informando que o mapeamento/proposta estavam finalizados. [file:83]

```text
Oi, João! Tudo bem?

Conforme conversamos e após a sua confirmação verbal para seguirmos com o primeiro estágio, preparei a sua proposta.

Estou te enviando o print/material aqui para você analisar com calma. Nele estão o escopo desta etapa, os valores e os próximos passos para iniciarmos a organização do seu processo.

Quando conseguir olhar, me confirma por aqui se está de acordo para avançarmos. Se tiver qualquer dúvida ou quiser conversar sobre algum ponto antes, fico à disposição. 🌿
```

### Versão mais direta

```text
Oi, João! Tudo bem?

Conforme combinamos, estou te enviando a proposta do primeiro estágio do seu processo.

Dá uma olhada com calma e, quando puder, me confirma se está de acordo para seguirmos. Se tiver qualquer dúvida, estou à disposição. 🌿
```

### Mensagem de follow-up caso João não responda

**Uso recomendado:** enviar somente depois de alguns dias úteis e apenas se não houver resposta.

```text
Oi, João! Tudo bem?

Passando só para confirmar se você conseguiu ver a proposta que te enviei.

Quando puder, me diz se ficou alguma dúvida ou se está tudo certo para seguirmos com o primeiro estágio. Estou à disposição. 🌿
```

---

## 10. Comunicação de caso, documentos e micro-entregas

### Eventos que justificam comunicação ao cliente

```text
Primeira linha ancestral organizada
Certidão localizada
Documento recebido
Documento validado
Pendência documental identificada
Retificação necessária
Atualização relevante de pesquisa
Pasta em revisão final
Protocolo realizado
Marco externo relevante
Reconhecimento confirmado
```

### Regra de micro-entrega

Uma micro-entrega é algo concreto e perceptível pelo cliente: relatório, checklist qualificado, documento localizado, documento validado, achado histórico, marco de protocolo ou linha do tempo.

Cada micro-entrega deve poder gerar:

```text
registro no caso
atualização no portal
notificação in-app
rascunho de WhatsApp/e-mail
próxima tarefa interna
oferta contextual, quando aplicável e aprovada
```

Nunca transformar toda alteração interna em mensagem. Usar comunicação ativa quando houver valor, ação necessária, marco ou risco que o cliente precise compreender.

---

## 11. Conteúdo, redes sociais e distribuição

O módulo de conteúdo não deve ser uma lista solta de postagens. Cada conteúdo deve ter objetivo, público, canal, CTA, data, ativo de origem e resultado.

### Pilares editoriais

```text
Genealogia profissional
Cidadania por ancestralidade
Documentos e pesquisa histórica
Memória, identidade e legado
Bastidores de método e descobertas
Orientação para famílias brasileiras
Histórias e aprendizados sem expor dados de clientes
```

### Canais

```text
Perfil pessoal de Tatiana no LinkedIn
Newsletter LinkedIn
Página institucional Clube Ancestral
Instagram
WhatsApp/Status, quando aplicável
Site/Blog
E-mail/nurture
App cliente: conteúdos educacionais e ajuda contextual
```

### Regra de canal

| Canal | Papel principal |
|---|---|
| Perfil pessoal LinkedIn | Autoridade humana, artigos autorais, bastidores, reflexões e confiança |
| Newsletter LinkedIn | Recorrência, séries educativas e nutrição de audiência |
| Página Clube Ancestral | Conteúdo institucional, explicação de serviço e conversão para diagnóstico/app |
| Instagram | Descoberta visual, memória, bastidores, educação curta e relacionamento |
| Site | Conversão, diagnóstico e páginas de serviço |
| E-mail/WhatsApp | Relacionamento com lead/cliente mediante contexto e permissão |
| App cliente | Orientação durante a jornada, entregas e ajuda contextual |

### Campos mínimos para item de conteúdo

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
Link do ativo
Métrica real, se disponível
Relação com campanha/lead, quando houver
```

### Métricas

Só calcular/apresentar métricas quando houver dado real:

```text
publicações realizadas
cliques por CTA
leads originados
diagnósticos iniciados
propostas atribuídas
receita atribuída
```

Não inventar alcance, CAC, ROI, conversão ou seguidores.

---

## 12. Telas necessárias

### Desk — Comunicação

Criar ou consolidar uma área de comunicação com:

```text
Biblioteca de mensagens
Cadências
Ações de comunicação pendentes
Histórico de contatos
Onboarding por cenário
Conteúdo e calendário editorial
Preferências/consentimentos
```

### Caso 360

Dentro de cada caso, mostrar:

```text
Última comunicação
Próxima comunicação/tarefa
Cadência ativa
Onboarding em andamento
Histórico de mensagens e contatos
Atualizações liberadas ao cliente
Botão: criar mensagem manual
Botão: pausar cadência
Botão: iniciar/reiniciar onboarding
```

### App Cliente

O cliente deve ver apenas:

```text
Atualizações liberadas
Próximo passo
Solicitações de documentos
Mensagens/orientações relevantes
Ajuda e canais de contato
```

Não mostrar templates internos, cadências, notas privadas, métricas, dados de outros clientes ou controles de marketing.

---

## 13. Critérios de aceite

Não declarar este eixo implantado sem demonstrar, no preview Vercel e com dados persistidos:

1. Criar template de WhatsApp, e-mail e portal com variáveis.
2. Criar cenário de onboarding e steps até a continuidade, não só primeiros dias.
3. Iniciar onboarding manualmente para um caso e confirmar criação de `communication_run`, ações e tarefas reais.
4. Criar proposta e confirmar criação de follow-up de proposta conforme cadência ativa.
5. Renderizar mensagem de proposta com nome e dados reais do cliente/caso.
6. Salvar mensagem como rascunho e reencontrá-la após refresh.
7. Marcar mensagem como enviada manualmente e registrar o evento no histórico.
8. Registrar resposta do cliente e interromper os lembretes equivalentes.
9. Criar documento pendente e confirmar tarefa/mensagem contextual correspondente.
10. Criar micro-entrega/achado e liberar uma atualização para o portal do cliente.
11. Visualizar no Caso 360 a última comunicação, próxima ação e cadência ativa.
12. Criar item de calendário editorial e confirmar que não exibe métrica inventada.
13. Pausar uma cadência por caso e confirmar que nenhuma nova ação é criada enquanto estiver pausada.
14. Confirmar que falha de canal externo não perde rascunho, não trava o caso e cria aviso/tarefa objetiva.
15. Confirmar que owner/admin opera tudo sem Modo Proprietária, auditoria, reconfirmação, gate ou aprovação.

---

## 14. Proibições

Não fazer nesta implantação:

- Não criar cadências universais desconectadas de cenário, evento e caso.
- Não limitar onboarding a D+0, D+1, D+7 ou D+15.
- Não enviar mensagens automáticas sem uma política configurada, contexto e mecanismo de interrupção.
- Não usar dados mockados como se fossem conversas reais.
- Não declarar integração WhatsApp/e-mail/rede social como pronta sem envio/registro real.
- Não bloquear cliente, caso, contrato, proposta ou financeiro se um template/cadência falhar.
- Não criar auditoria, Modo Proprietária, reconfirmação, override ou gate de governança.
- Não apagar biblioteca de mensagens, dados de clientes, histórico, propostas ou documentos existentes.
- Não publicar conteúdo automaticamente sem aprovação explícita da proprietária.

---

## 15. Entrega esperada

1. Migrations não destrutivas, somente quando necessárias.
2. Biblioteca de templates persistida e editável.
3. Motor de cadência por evento e cenário, com ações/tarefas persistidas.
4. Onboarding completo por cenário, não apenas cronograma curto.
5. Histórico de comunicação no Caso 360.
6. Conteúdo/calendário editorial estruturado, com dados reais e sem métricas inventadas.
7. Preview Vercel para validação da proprietária.
8. Relatório curto com os 15 critérios de aceite e as falhas reais restantes.

Não fazer merge em `main` nem ativar envio automático sem validação explícita da proprietária.

---

## Regra final

> Comunicação no Clube Ancestral deve reduzir a carga de memória da proprietária, preservar contexto de cada família e tornar claro o próximo passo. Ela não pode criar mais listas, mais ruído, mais promessas ou mais bloqueios.
