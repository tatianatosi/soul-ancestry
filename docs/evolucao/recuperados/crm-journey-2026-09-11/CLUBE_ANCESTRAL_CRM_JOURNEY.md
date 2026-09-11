> **Arquivo recuperado (2026-09-11):** upload da proprietária. Encoding limpo na cópia.
> **Leitura operacional:** `docs/politicas/ADENDO-CRM-JOURNEY-PAINEL-CALLS-2026-09-11.md`.
> Blueprint histórico — **não** criar `crm_calls` / `crm_interactions` / `opportunities`; runtime = `leads` + handoff → `clientes`/`crm_casos`. Planilha Mestre / Asaas como master de oferta/cobrança = **legado** (núcleo).

# CLUBE_ANCESTRAL_CRM_JOURNEY.md

**Artefato Mestre de Engenharia de Jornada e Arquitetura de CRM**  
**Projeto:** Clube Ancestral (`clubeancestral.com.br`)  
**Versão:** 1.0  
**Data:** 18 de agosto de 2026  
**Responsável:** Enterprise CXO / Arquiteto de CRM  
**Integrações:** Desk Intelligence, Supabase (São Paulo), WhatsApp API, Lovable, Asaas  

---

## Propósito

Este documento consolida a esteira comercial e o ecossistema de relacionamento do Clube Ancestral, mapeando o funil desde a reunião de descoberta até o onboarding no WhatsApp, amarrando tudo às micro-entregas de maior valor perceptível dentro do aplicativo do cliente.

Serve como guia técnico para:
- **Claude Code** programar as automações de mensageria e o funil administrativo do Desk Intelligence.
- **Modelagem das tabelas de interação** (`public.crm_interactions` no Supabase).
- **Configuração de webhooks** da API do WhatsApp conectada ao Supabase.
- **Blindagem da retenção** de clientes no piloto (5 a 10 usuários), indicando em quais telas focar para gerar valor na primeira semana.

---

## Princípios Obrigatórios

1. **Painel de Calls** é a camada de entrada, preparação, registro inicial, SPIN, handoff e próxima ação.
2. **CRM Mestre** é a camada estruturada de ciclo de vida (lead → oportunidade → proposta → formalização → cliente → onboarding → vínculo de caso).
3. **Planilha Mestre** é a fonte de verdade para SKU, status de produto, escopo, preço homologado, condição e link de cobrança.
4. **Asaas** é a fonte de verdade para evento e status transacional de cobrança/pagamento.
5. **Desk e dossiê autorizado** são fontes de verdade para caso, pesquisa, fonte, evidência, documento, pendência e histórico operacional.
6. **App Cliente e one-page** recebem somente conteúdo aprovado, sanitizado e autorizado.
7. **Nenhum dado interno** (documento cru, fonte de pesquisa, URL interna, token, API, mecanismo de matching, gravação, transcrição, CRM, Desk, log, dados de terceiros, estrutura familiar interna, SKU técnico, preço provisório, saldo, margem, hipóótese jurídica, score, percentual de elegibilidade ou análise interna) pode vazar para App Cliente ou one-page.

---

## 1. Estrutura do CRM Proprietário e Painel de Calls

### 1.1 Estágios do Funil de Leads e Clientes (Integrado ao Desk Intelligence)

| Est ágio | Definição | Fonte de Verdade | Pr óxima Ação Padrão |
|----------|---------------|------------------|--------------------------|
| **Lead Bruto** | Contato inicial via site, LinkedIn, WhatsApp, indicação | Painel de Calls | Agendar Call de Discovery |
| **Lead Qualificado** | Discovery realizada, SPIN preenchido, aderência preliminar avaliada | CRM Mestre | Enviar proposta ou nutrir |
| **Oportunidade** | Proposta enviada, aguardando decisão | Planilha Mestre / Asaas | Follow-up em 48h |
| **Proposta Aceita** | Link de cobrança pago ou contrato assinado | Asaas / Drive | Disparar onboarding WhatsApp |
| **Cliente Ativo** | Onboarding iniciado, caso vinculado no Desk | Desk / Supabase | Primeira micro-entrega em 7 dias |
| **Cliente em Pesquisa** | SLA de pesquisa em andamento, documentos sendo validados | Desk | Alerta de progresso no App |
| **Cliente Pós-Reconhecimento** | Cidadania reconhecida, foco em legado e manutenção | App Cliente | Oferta de plano recorrente |

### 1.2 Especificação do Painel de Calls

O Painel de Calls loga os touchpoints de ligações, anotações de reuniões e histórico de contatos diretamente no perfil do usuário no Supabase.

**Campos Obrigatórios por Call:**

| Campo | Tipo | Validação | Responsabilidade |
|-------|------|--------------|------------------|
| `call_id` | UUID | Autom ático | Supabase |
| `opportunity_id` | Texto | Obrigat ório | Painel de Calls |
| `data_hora_call` | Timestamp | Obrigat ório | Comercial |
| `status_call` | Dropdown | `Agendada`, `Realizada`, `Cancelada`, `Sem Show` | Comercial |
| `consentimento_gravacao` | Dropdown | `Concedido`, `Recusado`, `N/A` | Comercial |
| `link_gravacao` | URL interna | Restrito (equipe autorizada) | Sistema |
| `spin_situacao` | Dropdown | `Não iniciado`, `Em andamento`, `Concluído` | Comercial |
| `spin_problema` | Dropdown | `Não iniciado`, `Em andamento`, `Concluído` | Comercial |
| `spin_implicacao` | Dropdown | `Não iniciado`, `Em andamento`, `Concluído` | Comercial |
| `spin_necessidade` | Dropdown | `Não iniciado`, `Em andamento`, `Concluído` | Comercial |
| `resumo_validado` | Texto curto | Mááx 500 caracteres | Comercial |
| `proxima_acao` | Dropdown | Lista controlada | Comercial |
| `data_proxima_acao` | Data | Não pode ser passada | Comercial |
| `area_responsavel` | Dropdown | `Comercial`, `Pesquisa`, `Operações`, `Financeiro`, `Jurídico` | Comercial |
| `responsavel_nominal` | Referência | Pessoa cadastrada no CRM | Comercial |

**Regra de Validação:** Nenhum lead ativo pode permanecer sem `área responsável`, `responsável nominal` e `próxima ação datada`.

**Tabela Supabase Sugerida:**

```sql
CREATE TABLE public.crm_calls (
  call_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL,
  data_hora_call TIMESTAMP NOT NULL,
  status_call TEXT NOT NULL,
  consentimento_gravacao TEXT,
  link_gravacao TEXT,
  spin_situacao TEXT,
  spin_problema TEXT,
  spin_implicacao TEXT,
  spin_necessidade TEXT,
  resumo_validado TEXT,
  proxima_acao TEXT,
  data_proxima_acao DATE,
  area_responsavel TEXT,
  responsavel_nominal UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. Roteiro de Discovery e Reuniões de Alinhamento

### 2.1 Premissas Coletadas na Call de Discovery

| Dado | Campo no CRM | Uso no Back-End |
|------|--------------|-----------------|
| **Dados dos antepassados** | `estrutura_familiar`, `geracao_ascendente`, `linha_transmissao` | Alimenta Simulador de Cidadania (cálculo de elegibilidade) |
| **Objetivo do cliente** | `objetivo_principal` (`Cidadania`, `Genealogia`, `Ambos`) | Define trilha de produtos e micro-entregas |
| **Limitações financeiras** | `sinal_aderencia_preliminar`, `confianca_triagem` | Sugere plano (Essência → Memórias → Legado) |
| **Limitações temporais** | `complexidade_documental`, `estado_documental_inicial` | Define SLA de pesquisa e prioridade no Desk |
| **Nacionalidade de interesse** | `nacionalidade_interesse`, `pais_linha_prioritaria` | Filtra marcos jurídicos e fontes de pesquisa |
| **Via jurídica preliminar** | `via_juridica_preliminar` (`Administrativa`, `Judicial`, `A definir`) | Aciona fluxos específicos no Planejador |

### 2.2 Alimentação Automática do Simulador e Planejador

**Fluxo de Dados:**

1. **Call de Discovery → CRM Mestre:** Comercial preenche campos no Painel de Calls.
2. **CRM Mestre → Supabase:** Dados são persistidos em `public.crm_calls` e `public.opportunities`.
3. **Supabase → Simulador de Cidadania:** Função no back-end lê dados do lead e préé-preenche o simulador com:
   - Nacionalidade de interesse
   - Geração do ascendente identificado
   - Linha de transmissão (paterna, materna, mista)
   - Risco de ruptura na linha
4. **Simulador → Planejador:** O resultado do simulador (score de elegibilidade, marcos jurídicos aplicáveis) alimenta o Planejador, que gera:
   - Checklist de documentos faltantes
   - Estimativa de prazo por etapa
   - Sugestão de SKUs (Consultoria, Pedido Unitário, Combo, Assessoria Completa)

**Tabela Supabase Sugerida:**

```sql
CREATE TABLE public.discovery_data (
  discovery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL,
  estrutura_familiar TEXT,
  geracao_ascendente TEXT,
  linha_transmissao TEXT,
  objetivo_principal TEXT,
  nacionalidade_interesse TEXT,
  pais_linha_prioritaria TEXT,
  via_juridica_preliminar TEXT,
  complexidade_documental TEXT,
  estado_documental_inicial TEXT,
  simulador_preenchido BOOLEAN DEFAULT FALSE,
  planejador_gerado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Onboarding via WhatsApp e Automações de Gatilho

### 3.1 Fluxo de Boas-Vindas Assíncrono

**Gatilho Inicial:** Contrato assinado **OU** Magic Link gerado **OU** primeiro pagamento confirmado no Asaas.

**Sequência de Mensagens (API do WhatsApp):**

| Dia | Gatilho | Mensagem | Canal | Responsável |
|-----|---------|----------|-------|---------------|
| **D0** | Contrato assinado / Pagamento confirmado | **Boas-vindas + Link do App** <br> "Olá, [Nome]! Bem-vindo(a) ao Clube Ancestral. Seu caso já está em andamento. Acesse seu app: [Magic Link]. Em até 24h, você ter á sua primeira micro-entrega." | WhatsApp API | Autom ático |
| **D1** | App acessado pela primeira vez | **Tutorial de Primeiros Passos** <br> "Vi que voc ê acessou seu app! Aqui está um guia ráápido: [Link do vídeo/tutorial]. D úvidas? Responda esta mensagem." | WhatsApp API | Autom ático |
| **D3** | Primeira micro-entrega liberada | **Alerta de Valor** <br> "[Nome], temos uma novidade na sua árvore! Um novo achado hist órico foi liberado. Acesse: [Deep Link para tela específica]." | WhatsApp API | Autom ático |
| **D7** | SLA de pesquisa atualizado | **Relatório de Progresso** <br> "Sua pesquisa completou [X]%. Pr óximos passos: [Lista]. Veja detalhes no app." | WhatsApp API | Autom ático |
| **D14** | Documento validado | **Celebração** <br> "Parabéns! Sua certidão de [Nome] foi validada. Baixe no app: [Link]." | WhatsApp API | Autom ático |
| **D30** | 30 dias de cliente | **Check-in de Satisfação** <br> "Como está sendo sua jornada? Responda esta pesquisa ráápida: [Link NPS]." | WhatsApp API | Autom ático |

### 3.2 Rééguas de Comunicação e Alertas de SLA

**Tabela de Eventos de Gatilho:**

| Evento no Desk | Gatilho WhatsApp | Prioridade | Template |
|----------------|------------------|------------|----------|
| `status_pesquisa` = `Em Andamento` → `Documento Localizado` | Alerta de Achado | Alta | `template_achado_historico` |
| `status_documento` = `Pendente` → `Validado` | Alerta de Validação | Alta | `template_documento_validado` |
| `sla_pesquisa` atualizado (ex: 25% → 50%) | Alerta de Progresso | Méédia | `template_progresso_sla` |
| `pendencia_cliente` criada | Solicitação de Ação | Méédia | `template_pendencia` |
| `reuniao_agendada` | Lembrete de Call | Méédia | `template_lembrete_call` |
| `proposta_enviada` + 48h sem resposta | Follow-up Comercial | Baixa | `template_followup_proposta` |
| `pagamento_atrasado` | Alerta Financeiro | Alta | `template_cobranca` |

**Tabela Supabase Sugerida:**

```sql
CREATE TABLE public.whatsapp_automations (
  automation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL,
  event_trigger TEXT NOT NULL,
  template_name TEXT NOT NULL,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. Matriz de Micro-Entregas e Touchpoints de Maior Valor

### 4.1 Ações que Geram Efeito "Uau!" no App

| Micro-Entrega | Descrição | Tela no App | Gatilho de Notificação |
|---------------|---------------|-------------|---------------------------|
| **Achado Hist órico Liberado** | Novo documento, foto ou registro adicionado à árvore geneal ógica | Timeline da Fam ília / Árvore | Push notification + WhatsApp |
| **Certidão Digitalizada** | PDF de certidão localizada e validada dispon ível para download | Meus Documentos | Push notification + WhatsApp |
| **Barra de Progresso Jur ídica Atualizada** | SLA de pesquisa avança (ex: 25% → 50%) | Dashboard Principal | Push notification |
| **Relatório de Elegibilidade Sintetizado** | Resumo visual da elegibilidade com marcos jur ídicos | Diagn óstico / Simulador | Deep link no WhatsApp |
| **Checklist de Documentos Faltantes** | Lista priorizada do que falta para avançar | Checklist / Pr óximos Passos | Deep link no WhatsApp |
| **Linha do Tempo da Fam ília Gerada** | Visualização cronológica interativa da hist ória familiar | Timeline / Legado | Push notification |
| **Plano de Ação por Via Escolhida** | Roteiro personalizado com etapas, prazos e SKUs sugeridos | Planejador / Estrat égia | Deep link no WhatsApp |

### 4.2 Estruturação do Cóódigo Lovable para Notificações Prioritárias

**Requisitos Téécnicos:**

1. **Webhook Supabase → Lovable:** Cada evento de micro-entrega (ex: `documento_validado`, `achado_liberado`) dispara um webhook para o back-end do Lovable.
2. **Fila de Prioridade:** Notificações de micro-entregas t êm prioridade `alta` e devem ser exibidas em até 5 minutos.
3. **Deep Linking:** Cada notificação deve levar o usuário diretamente à tela relevante (ex: `/arvore/achado/123`, `/documentos/certidao/456`).
4. **Fallback WhatsApp:** Se o usuário não abrir o app em 24h, disparar mensagem no WhatsApp com deep link.

**Exemplo de Payload do Webhook:**

```json
{
  "event_type": "achado_historico_liberado",
  "opportunity_id": "opp_12345",
  "user_id": "user_67890",
  "priority": "high",
  "deep_link": "/arvore/achado/123",
  "notification_body": "Um novo achado hist órico foi liberado na sua árvore!",
  "created_at": "2026-08-18T21:30:00Z"
}
```

**Tabela Supabase Sugerida:**

```sql
CREATE TABLE public.micro_entregas (
  entrega_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL,
  tipo_entrega TEXT NOT NULL, -- 'achado_historico', 'certidao_validada', 'progresso_sla', etc.
  tela_app TEXT NOT NULL, -- 'timeline', 'documentos', 'dashboard', etc.
  deep_link TEXT NOT NULL,
  notificacao_enviada BOOLEAN DEFAULT FALSE,
  whatsapp_fallback_enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Matriz de Jornada (Tabela Mestre)

| Est ágio do Ciclo de Vida | Ritual/Call/Touchpoint | Gatilho/Autom ação WhatsApp | Micro-Entrega de Maior Valor no App | Status no Piloto |
|---------------------------|------------------------|-------------------------------|-------------------------------------|------------------|
| **Lead Bruto** | Call de Discovery (agendada) | Lembrete de call 24h antes | N/A | **Cr ítico para MVP** |
| **Lead Qualificado** | Reuni ão de Alinhamento (SPIN) | Follow-up 48h ap ós call | Relatório de Elegibilidade Sintetizado | **Cr ítico para MVP** |
| **Oportunidade** | Envio de Proposta | Follow-up 48h se sem resposta | Checklist de Documentos Faltantes | **Cr ítico para MVP** |
| **Proposta Aceita** | Contrato Assinado / Pagamento | Boas-vindas + Link do App (D0) | Plano de Ação por Via Escolhida | **Cr ítico para MVP** |
| **Cliente Ativo (Onboarding)** | Primeira acesso ao app | Tutorial de Primeiros Passos (D1) | Barra de Progresso Jur ídica (inicial) | **Cr ítico para MVP** |
| **Cliente em Pesquisa** | SLA de pesquisa atualizado | Alerta de Progresso (D7, D14, etc.) | Achado Hist órico Liberado | **Cr ítico para MVP** |
| **Cliente em Pesquisa** | Documento validado | Alerta de Validação | Certidão Digitalizada | **Cr ítico para MVP** |
| **Cliente em Pesquisa** | Reuni ão de Check-in (opcional) | Lembrete de call | N/A | Backlog |
| **Pós-Reconhecimento** | Cidadania reconhecida | Celebração + Oferta de Legado | Linha do Tempo da Fam ília Gerada | Backlog |
| **Cliente Recorrente** | Check-in de Satisfação (D30) | Pesquisa NPS | N/A | Backlog |

---

## 6. Guia Téécnico para Implementação

### 6.1 Modelagem das Tabelas de Interação (`public.crm_interactions`)

O Claude Code deve criar as seguintes tabelas no Supabase para registrar hist óricos de ligações, reuniões e mensagens:

```sql
-- Tabela mestre de interações (agrega calls, mensagens, emails, etc.)
CREATE TABLE public.crm_interactions (
  interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'call', 'whatsapp', 'email', 'meeting', 'note'
  direction TEXT, -- 'inbound', 'outbound', 'internal'
  subject TEXT,
  body TEXT,
  status TEXT, -- 'scheduled', 'completed', 'cancelled', 'no_show'
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  area_responsavel TEXT,
  responsavel_nominal UUID,
  metadata JSONB, -- Para campos espec íficos (ex: spin, consentimento, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_crm_interactions_opportunity ON public.crm_interactions(opportunity_id);
CREATE INDEX idx_crm_interactions_type ON public.crm_interactions(interaction_type);
CREATE INDEX idx_crm_interactions_scheduled ON public.crm_interactions(scheduled_at);
```

### 6.2 Automação do WhatsApp (Webhook + Supabase)

**Fluxo:**

1. **Evento no Desk** (ex: `documento_validado`) → Insere registro em `public.whatsapp_automations`.
2. **Trigger no Supabase** → Dispara webhook para API do WhatsApp (ex: Twilio, Z-API, Evolution API).
3. **API do WhatsApp** → Envia mensagem template para o cliente.
4. **Callback da API** → Atualiza status em `public.whatsapp_automations` (`sent`, `failed`).

**Exemplo de Trigger no Supabase:**

```sql
CREATE OR REPLACE FUNCTION trigger_whatsapp_automation()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir na fila de automa ção
  INSERT INTO public.whatsapp_automations (
    opportunity_id,
    event_trigger,
    template_name,
    scheduled_at,
    status
  ) VALUES (
    NEW.opportunity_id,
    NEW.event_type,
    NEW.template_name,
    NOW(),
    'pending'
  );
  
  -- Aqui voc ê pode chamar um webhook externo via pg_net ou similar
  -- SELECT net.http_post(...);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_documento_validado
AFTER UPDATE ON public.documentos
FOR EACH ROW
WHEN (OLD.status = 'pendente' AND NEW.status = 'validado')
EXECUTE FUNCTION trigger_whatsapp_automation();
```

### 6.3 Painel de Calls no Desk Intelligence

**Relatórios de Conversão de Leads:**

O painel deve exibir:

- **Taxa de Conversão por Est ágio:** Lead Bruto → Lead Qualificado → Oportunidade → Proposta Aceita → Cliente Ativo.
- **Tempo Méédio por Est ágio:** Quantos dias, em méédia, um lead leva para avançar de um est ágio para outro.
- **Motivos de Perda:** Dropdown com opções (Preço, Prazo, Não eleg ível, Desist ência, Outro).
- **Performance por Comercial:** Quantas calls, propostas e fechamentos cada respons ável nominal realizou.

**Tabela Supabase para Méétricas:**

```sql
CREATE TABLE public.crm_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL,
  stage_from TEXT NOT NULL,
  stage_to TEXT NOT NULL,
  days_in_stage INTEGER,
  converted BOOLEAN DEFAULT FALSE,
  loss_reason TEXT,
  comercial_responsavel UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Backlog e Pr óximos Passos

| Item | Descrição | Prioridade | Respons ável |
|------|---------------|------------|--------------|
| **Integração WhatsApp API** | Configurar webhook e templates no Supabase | **Cr ítico** | Claude Code |
| **Modelagem das Tabelas** | Criar `crm_interactions`, `whatsapp_automations`, `micro_entregas` | **Cr ítico** | Claude Code |
| **Painel de Calls no Desk** | Implementar relatórios de conversão e performance | **Cr ítico** | Claude Code |
| **Notificações Push no App** | Configurar deep links e filas de prioridade no Lovable | **Cr ítico** | Claude Code |
| **R égua de Onboarding (D0-D30)** | Implementar sequ ência completa de mensagens | Alto | Claude Code |
| **Check-in de Satisfação (NPS)** | Criar pesquisa e dashboard de resultados | Méédio | Claude Code |
| **Linha do Tempo da Fam ília** | Desenvolver tela de timeline interativa no app | Méédio | Lovable |
| **Plano de Legado Recorrente** | Criar SKUs e ofertas de manutenção pós-reconhecimento | Baixo | Comercial |

---

## 8. Referências e Documentos Relacionados

- **CA 04: CRM Mestre, Discovery e Handoff** (Artefato Consolidado v1.0.1)
- **CA-EVO-04: Dados Vivos e Integrações**
- **CA-EVO-05A: Preparação Go-Live**
- **Planilha Mestre de Produtos** (57 SKUs)
- **Documentação Asaas** (Links de cobrança e webhooks)
- **Documentação Supabase** (Triggers, webhooks, pg_net)

---

**Fim do Documento**  
*Este artefato é um guia técnico para implementação. Não executa alterações em sistemas sem aprovação humana e codificação expl ícita.*