# CLUBE_ANCESTRAL_CRM_JOURNEY.md

**Artefato Mestre de Engenharia de Jornada e Arquitetura de CRM**  
**Projeto:** Clube Ancestral (`clubeancestral.com.br`)  
**Versã©·o:** 1.0  
**Data:** 18 de agosto de 2026  
**Responsá··vel:** Enterprise CXO / Arquiteto de CRM  
**Integraç··õ···es:** Desk Intelligence, Supabase (Sã··o Paulo), WhatsApp API, Lovable, Asaas  

---

## Propó···sito

Este documento consolida a esteira comercial e o ecossistema de relacionamento do Clube Ancestral, mapeando o funil desde a reuniã··o de descoberta até·· o onboarding no WhatsApp, amarrando tudo às micro-entregas de maior valor perceptí··vel dentro do aplicativo do cliente.

Serve como guia téé··cnico para:
- **Claude Code** programar as automaç··õ···es de mensageria e o funil administrativo do Desk Intelligence.
- **Modelagem das tabelas de interaç··ã··o** (`public.crm_interactions` no Supabase).
- **Configuraç··ã··o de webhooks** da API do WhatsApp conectada ao Supabase.
- **Blindagem da retenç··ã··o** de clientes no piloto (5 a 10 usuá··rios), indicando em quais telas focar para gerar valor na primeira semana.

---

## Princí··pios Obrigató···rios

1. **Painel de Calls** é a camada de entrada, preparaç··ã··o, registro inicial, SPIN, handoff e próó···xima açã··o.
2. **CRM Mestre** é a camada estruturada de ciclo de vida (lead → oportunidade → proposta → formalizaç··ã··o → cliente → onboarding → ví­nculo de caso).
3. **Planilha Mestre** é a fonte de verdade para SKU, status de produto, escopo, preç··o homologado, condiç··ã··o e link de cobranç··a.
4. **Asaas** é a fonte de verdade para evento e status transacional de cobranç··a/pagamento.
5. **Desk e dossiê·· autorizado** sã··o fontes de verdade para caso, pesquisa, fonte, evidê··ncia, documento, pendê··ncia e histó···rico operacional.
6. **App Cliente e one-page** recebem somente conteúé··do aprovado, sanitizado e autorizado.
7. **Nenhum dado interno** (documento cru, fonte de pesquisa, URL interna, token, API, mecanismo de matching, gravaç··ã··o, transcriç··ã··o, CRM, Desk, log, dados de terceiros, estrutura familiar interna, SKU téé··cnico, preç··o provisó···rio, saldo, margem, hipóó···tese jurí··dica, score, percentual de elegibilidade ou aná··lise interna) pode vazar para App Cliente ou one-page.

---

## 1. Estrutura do CRM Proprietá··rio e Painel de Calls

### 1.1 Está··gios do Funil de Leads e Clientes (Integrado ao Desk Intelligence)

| Est ágio | Definiç··ã··o | Fonte de Verdade | Pr óxima Açã··o Padrã··o |
|----------|---------------|------------------|--------------------------|
| **Lead Bruto** | Contato inicial via site, LinkedIn, WhatsApp, indicaç··ã··o | Painel de Calls | Agendar Call de Discovery |
| **Lead Qualificado** | Discovery realizada, SPIN preenchido, aderê··ncia preliminar avaliada | CRM Mestre | Enviar proposta ou nutrir |
| **Oportunidade** | Proposta enviada, aguardando decisã··o | Planilha Mestre / Asaas | Follow-up em 48h |
| **Proposta Aceita** | Link de cobranç··a pago ou contrato assinado | Asaas / Drive | Disparar onboarding WhatsApp |
| **Cliente Ativo** | Onboarding iniciado, caso vinculado no Desk | Desk / Supabase | Primeira micro-entrega em 7 dias |
| **Cliente em Pesquisa** | SLA de pesquisa em andamento, documentos sendo validados | Desk | Alerta de progresso no App |
| **Cliente Pó···s-Reconhecimento** | Cidadania reconhecida, foco em legado e manutenç··ã··o | App Cliente | Oferta de plano recorrente |

### 1.2 Especificaç··ã··o do Painel de Calls

O Painel de Calls loga os touchpoints de ligaç··õ···es, anotaç··õ···es de reuniõ···es e histó···rico de contatos diretamente no perfil do usuá··rio no Supabase.

**Campos Obrigató···rios por Call:**

| Campo | Tipo | Validaç··ã··o | Responsabilidade |
|-------|------|--------------|------------------|
| `call_id` | UUID | Autom ático | Supabase |
| `opportunity_id` | Texto | Obrigat ório | Painel de Calls |
| `data_hora_call` | Timestamp | Obrigat ório | Comercial |
| `status_call` | Dropdown | `Agendada`, `Realizada`, `Cancelada`, `Sem Show` | Comercial |
| `consentimento_gravacao` | Dropdown | `Concedido`, `Recusado`, `N/A` | Comercial |
| `link_gravacao` | URL interna | Restrito (equipe autorizada) | Sistema |
| `spin_situacao` | Dropdown | `Nã··o iniciado`, `Em andamento`, `Concluí··do` | Comercial |
| `spin_problema` | Dropdown | `Nã··o iniciado`, `Em andamento`, `Concluí··do` | Comercial |
| `spin_implicacao` | Dropdown | `Nã··o iniciado`, `Em andamento`, `Concluí··do` | Comercial |
| `spin_necessidade` | Dropdown | `Nã··o iniciado`, `Em andamento`, `Concluí··do` | Comercial |
| `resumo_validado` | Texto curto | Máá··x 500 caracteres | Comercial |
| `proxima_acao` | Dropdown | Lista controlada | Comercial |
| `data_proxima_acao` | Data | Nã··o pode ser passada | Comercial |
| `area_responsavel` | Dropdown | `Comercial`, `Pesquisa`, `Operaç··õ···es`, `Financeiro`, `Jurí··dico` | Comercial |
| `responsavel_nominal` | Referê··ncia | Pessoa cadastrada no CRM | Comercial |

**Regra de Validaç··ã··o:** Nenhum lead ativo pode permanecer sem `á··rea responsá··vel`, `responsá··vel nominal` e `pró···xima açã··o datada`.

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

## 2. Roteiro de Discovery e Reuniõ···es de Alinhamento

### 2.1 Premissas Coletadas na Call de Discovery

| Dado | Campo no CRM | Uso no Back-End |
|------|--------------|-----------------|
| **Dados dos antepassados** | `estrutura_familiar`, `geracao_ascendente`, `linha_transmissao` | Alimenta Simulador de Cidadania (cá··lculo de elegibilidade) |
| **Objetivo do cliente** | `objetivo_principal` (`Cidadania`, `Genealogia`, `Ambos`) | Define trilha de produtos e micro-entregas |
| **Limitaç··õ···es financeiras** | `sinal_aderencia_preliminar`, `confianca_triagem` | Sugere plano (Essê··ncia → Memó···rias → Legado) |
| **Limitaç··õ···es temporais** | `complexidade_documental`, `estado_documental_inicial` | Define SLA de pesquisa e prioridade no Desk |
| **Nacionalidade de interesse** | `nacionalidade_interesse`, `pais_linha_prioritaria` | Filtra marcos jurí··dicos e fontes de pesquisa |
| **Via jurí··dica preliminar** | `via_juridica_preliminar` (`Administrativa`, `Judicial`, `A definir`) | Aciona fluxos especí··ficos no Planejador |

### 2.2 Alimentaç··ã··o Automá··tica do Simulador e Planejador

**Fluxo de Dados:**

1. **Call de Discovery → CRM Mestre:** Comercial preenche campos no Painel de Calls.
2. **CRM Mestre → Supabase:** Dados sã··o persistidos em `public.crm_calls` e `public.opportunities`.
3. **Supabase → Simulador de Cidadania:** Funç··ã··o no back-end lê dados do lead e préé··-preenche o simulador com:
   - Nacionalidade de interesse
   - Geraç··ã··o do ascendente identificado
   - Linha de transmissã··o (paterna, materna, mista)
   - Risco de ruptura na linha
4. **Simulador → Planejador:** O resultado do simulador (score de elegibilidade, marcos jurí··dicos aplicá··veis) alimenta o Planejador, que gera:
   - Checklist de documentos faltantes
   - Estimativa de prazo por etapa
   - Sugestã··o de SKUs (Consultoria, Pedido Unitário, Combo, Assessoria Completa)

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

## 3. Onboarding via WhatsApp e Automaç··õ···es de Gatilho

### 3.1 Fluxo de Boas-Vindas Assí··ncrono

**Gatilho Inicial:** Contrato assinado **OU** Magic Link gerado **OU** primeiro pagamento confirmado no Asaas.

**Sequê··ncia de Mensagens (API do WhatsApp):**

| Dia | Gatilho | Mensagem | Canal | Responsá··vel |
|-----|---------|----------|-------|---------------|
| **D0** | Contrato assinado / Pagamento confirmado | **Boas-vindas + Link do App** <br> "Olá··, [Nome]! Bem-vindo(a) ao Clube Ancestral. Seu caso já está em andamento. Acesse seu app: [Magic Link]. Em até 24h, você·· ter á sua primeira micro-entrega." | WhatsApp API | Autom ático |
| **D1** | App acessado pela primeira vez | **Tutorial de Primeiros Passos** <br> "Vi que voc ê acessou seu app! Aqui está um guia ráá··pido: [Link do vídeo/tutorial]. D úvidas? Responda esta mensagem." | WhatsApp API | Autom ático |
| **D3** | Primeira micro-entrega liberada | **Alerta de Valor** <br> "[Nome], temos uma novidade na sua árvore! Um novo achado hist órico foi liberado. Acesse: [Deep Link para tela especí··fica]." | WhatsApp API | Autom ático |
| **D7** | SLA de pesquisa atualizado | **Relató···rio de Progresso** <br> "Sua pesquisa completou [X]%. Pr óximos passos: [Lista]. Veja detalhes no app." | WhatsApp API | Autom ático |
| **D14** | Documento validado | **Celebraç··ã··o** <br> "Parabé··ns! Sua certidã··o de [Nome] foi validada. Baixe no app: [Link]." | WhatsApp API | Autom ático |
| **D30** | 30 dias de cliente | **Check-in de Satisfaç··ã··o** <br> "Como está sendo sua jornada? Responda esta pesquisa ráá··pida: [Link NPS]." | WhatsApp API | Autom ático |

### 3.2 Réé··guas de Comunicaç··ã··o e Alertas de SLA

**Tabela de Eventos de Gatilho:**

| Evento no Desk | Gatilho WhatsApp | Prioridade | Template |
|----------------|------------------|------------|----------|
| `status_pesquisa` = `Em Andamento` → `Documento Localizado` | Alerta de Achado | Alta | `template_achado_historico` |
| `status_documento` = `Pendente` → `Validado` | Alerta de Validaç··ã··o | Alta | `template_documento_validado` |
| `sla_pesquisa` atualizado (ex: 25% → 50%) | Alerta de Progresso | Méé··dia | `template_progresso_sla` |
| `pendencia_cliente` criada | Solicitaç··ã··o de Açã··o | Méé··dia | `template_pendencia` |
| `reuniao_agendada` | Lembrete de Call | Méé··dia | `template_lembrete_call` |
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

### 4.1 Aç··õ···es que Geram Efeito "Uau!" no App

| Micro-Entrega | Descriç··ã··o | Tela no App | Gatilho de Notificaç··ã··o |
|---------------|---------------|-------------|---------------------------|
| **Achado Hist órico Liberado** | Novo documento, foto ou registro adicionado à árvore geneal ógica | Timeline da Fam ília / Árvore | Push notification + WhatsApp |
| **Certidã··o Digitalizada** | PDF de certidã··o localizada e validada dispon ível para download | Meus Documentos | Push notification + WhatsApp |
| **Barra de Progresso Jur ídica Atualizada** | SLA de pesquisa avanç··a (ex: 25% → 50%) | Dashboard Principal | Push notification |
| **Relató···rio de Elegibilidade Sintetizado** | Resumo visual da elegibilidade com marcos jur ídicos | Diagn óstico / Simulador | Deep link no WhatsApp |
| **Checklist de Documentos Faltantes** | Lista priorizada do que falta para avanç··ar | Checklist / Pr óximos Passos | Deep link no WhatsApp |
| **Linha do Tempo da Fam ília Gerada** | Visualizaç··ã··o cronoló···gica interativa da hist ória familiar | Timeline / Legado | Push notification |
| **Plano de Açã··o por Via Escolhida** | Roteiro personalizado com etapas, prazos e SKUs sugeridos | Planejador / Estrat égia | Deep link no WhatsApp |

### 4.2 Estruturaç··ã··o do Cóó···digo Lovable para Notificaç··õ···es Prioritá··rias

**Requisitos Téé··cnicos:**

1. **Webhook Supabase → Lovable:** Cada evento de micro-entrega (ex: `documento_validado`, `achado_liberado`) dispara um webhook para o back-end do Lovable.
2. **Fila de Prioridade:** Notificaç··õ···es de micro-entregas t êm prioridade `alta` e devem ser exibidas em até 5 minutos.
3. **Deep Linking:** Cada notificaç··ã··o deve levar o usuá··rio diretamente à tela relevante (ex: `/arvore/achado/123`, `/documentos/certidao/456`).
4. **Fallback WhatsApp:** Se o usuá··rio nã··o abrir o app em 24h, disparar mensagem no WhatsApp com deep link.

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

| Est ágio do Ciclo de Vida | Ritual/Call/Touchpoint | Gatilho/Autom açã··o WhatsApp | Micro-Entrega de Maior Valor no App | Status no Piloto |
|---------------------------|------------------------|-------------------------------|-------------------------------------|------------------|
| **Lead Bruto** | Call de Discovery (agendada) | Lembrete de call 24h antes | N/A | **Cr ítico para MVP** |
| **Lead Qualificado** | Reuni ão de Alinhamento (SPIN) | Follow-up 48h ap ós call | Relató···rio de Elegibilidade Sintetizado | **Cr ítico para MVP** |
| **Oportunidade** | Envio de Proposta | Follow-up 48h se sem resposta | Checklist de Documentos Faltantes | **Cr ítico para MVP** |
| **Proposta Aceita** | Contrato Assinado / Pagamento | Boas-vindas + Link do App (D0) | Plano de Açã··o por Via Escolhida | **Cr ítico para MVP** |
| **Cliente Ativo (Onboarding)** | Primeira acesso ao app | Tutorial de Primeiros Passos (D1) | Barra de Progresso Jur ídica (inicial) | **Cr ítico para MVP** |
| **Cliente em Pesquisa** | SLA de pesquisa atualizado | Alerta de Progresso (D7, D14, etc.) | Achado Hist órico Liberado | **Cr ítico para MVP** |
| **Cliente em Pesquisa** | Documento validado | Alerta de Validaç··ã··o | Certidã··o Digitalizada | **Cr ítico para MVP** |
| **Cliente em Pesquisa** | Reuni ão de Check-in (opcional) | Lembrete de call | N/A | Backlog |
| **Pó···s-Reconhecimento** | Cidadania reconhecida | Celebraç··ã··o + Oferta de Legado | Linha do Tempo da Fam ília Gerada | Backlog |
| **Cliente Recorrente** | Check-in de Satisfaç··ã··o (D30) | Pesquisa NPS | N/A | Backlog |

---

## 6. Guia Téé··cnico para Implementaç··ã··o

### 6.1 Modelagem das Tabelas de Interaç··ã··o (`public.crm_interactions`)

O Claude Code deve criar as seguintes tabelas no Supabase para registrar hist óricos de ligaç··õ···es, reuniõ···es e mensagens:

```sql
-- Tabela mestre de interaç··õ···es (agrega calls, mensagens, emails, etc.)
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

### 6.2 Automaç··ã··o do WhatsApp (Webhook + Supabase)

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
  -- Inserir na fila de automa çã··o
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

**Relató···rios de Conversã··o de Leads:**

O painel deve exibir:

- **Taxa de Conversã··o por Est ágio:** Lead Bruto → Lead Qualificado → Oportunidade → Proposta Aceita → Cliente Ativo.
- **Tempo Méé··dio por Est ágio:** Quantos dias, em méé··dia, um lead leva para avanç··ar de um est ágio para outro.
- **Motivos de Perda:** Dropdown com opç··õ···es (Preç··o, Prazo, Nã··o eleg ível, Desist ência, Outro).
- **Performance por Comercial:** Quantas calls, propostas e fechamentos cada respons ável nominal realizou.

**Tabela Supabase para Méé··tricas:**

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

| Item | Descriç··ã··o | Prioridade | Respons ável |
|------|---------------|------------|--------------|
| **Integraç··ã··o WhatsApp API** | Configurar webhook e templates no Supabase | **Cr ítico** | Claude Code |
| **Modelagem das Tabelas** | Criar `crm_interactions`, `whatsapp_automations`, `micro_entregas` | **Cr ítico** | Claude Code |
| **Painel de Calls no Desk** | Implementar relató···rios de conversã··o e performance | **Cr ítico** | Claude Code |
| **Notificaç··õ···es Push no App** | Configurar deep links e filas de prioridade no Lovable | **Cr ítico** | Claude Code |
| **R égua de Onboarding (D0-D30)** | Implementar sequ ência completa de mensagens | Alto | Claude Code |
| **Check-in de Satisfaç··ã··o (NPS)** | Criar pesquisa e dashboard de resultados | Méé··dio | Claude Code |
| **Linha do Tempo da Fam ília** | Desenvolver tela de timeline interativa no app | Méé··dio | Lovable |
| **Plano de Legado Recorrente** | Criar SKUs e ofertas de manutenç··ã··o pós-reconhecimento | Baixo | Comercial |

---

## 8. Referê··ncias e Documentos Relacionados

- **CA 04: CRM Mestre, Discovery e Handoff** (Artefato Consolidado v1.0.1)
- **CA-EVO-04: Dados Vivos e Integraç··õ···es**
- **CA-EVO-05A: Preparaç··ã··o Go-Live**
- **Planilha Mestre de Produtos** (57 SKUs)
- **Documentaç··ã··o Asaas** (Links de cobranç··a e webhooks)
- **Documentaç··ã··o Supabase** (Triggers, webhooks, pg_net)

---

**Fim do Documento**  
*Este artefato é um guia téé··cnico para implementaç··ã··o. Nã··o executa alteraç··õ···es em sistemas sem aprovaç··ã··o humana e codificaç··ã··o expl ícita.*