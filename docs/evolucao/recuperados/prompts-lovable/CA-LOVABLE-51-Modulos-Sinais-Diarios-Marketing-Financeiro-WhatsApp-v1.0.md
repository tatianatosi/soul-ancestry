# CA-LOVABLE-51-Módulos-Sinais-Diários-Marketing-Financeiro-WhatsApp v1.0

**Projeto:** Clube Ancestral  
**Data:** 21/08/2026  
**Status:** Prompt único de implementação e reconexão operacional  
**Objetivo:** Transformar os 51 módulos contextuais já mapeados em dados e sinais efetivamente utilizados nas telas de trabalho, nos indicadores de marketing/conversão/financeiro e no Painel Hoje — sem criar novas abas primárias, sem reabrir arquitetura e sem lançar ações externas automáticas.

---

# PROMPT PARA LOVABLE

## 1. Ordem de execução

**IMPLEMENTAR AGORA. NÃO AUDITAR DE NOVO. NÃO REDESENHAR O DESK. NÃO CRIAR NOVA ARQUITETURA. NÃO REMOVER NADA QUE JÁ FUNCIONA.**

Use como base o Desk Intelligence já existente, as rotas já implementadas e o mapa de 51 módulos contextuais. O problema a corrigir é de **conexão operacional**: módulos existentes precisam alimentar indicadores, sinais e decisões nas telas corretas.

Preservar integralmente:

- RLS por organização, validação no banco/servidor e auditoria append-only.
- Exclusão de dados demo das métricas reais por padrão.
- Fontes canônicas: Planilha Mestre/Planejador para catálogo, escopo e preço homologado; financeiro/Asaas para eventos transacionais; Desk/dossiê para documentos, pesquisa, fontes, evidências e execução.
- Gatilhos existentes de contrato, pagamento, onboarding, acesso e pesquisa.
- Nenhuma comunicação, cobrança, assinatura, pesquisa externa, convite ou acesso ao portal será disparado automaticamente neste corte.
- Painel Hoje continua sendo uma fila operacional, não um dashboard decorativo.

Não criar abas de primeiro nível. Trabalhar dentro das rotas existentes:

```text
/painel
/leads
/conversao
/casos
/tarefas
/atendimento
/biblioteca
/biblioteca-mensagens
/contratos
/propostas
/financeiro
/ordens-servico
/pesquisa
/evidencias
/matriz-juridica
/qualidade
/governanca/indicadores
/governanca/modulos-contextuais
/piloto
```

---

## 2. Resultado esperado

Ao terminar, o Desk deve responder diariamente, sem abrir uma tela de referência:

1. **O que está vencido, bloqueado, sem dono ou exige ação hoje?**
2. **Quais leads estão avançando, esfriando ou parados entre Discovery, proposta, formalização e pagamento?**
3. **Quais casos têm risco operacional, documental, jurídico preliminar ou de relacionamento?**
4. **Quanto o Clube investiu em mídia, quantos leads entraram, quantos fizeram Discovery, quantos receberam proposta, quantos formalizaram e quantos viraram clientes ativos?**
5. **Qual é a receita contratada, recebida, em aberto e qual é a despesa real de mídia/operacional do Clube?**
6. **Onde existe necessidade de mensagem humana pelo WhatsApp, sem disparo automático?**
7. **Que score/sinal de elegibilidade preliminar existe em cada caso, com seus fatores e limitações, sem ser apresentado como parecer jurídico ou promessa?**

---

## 3. Regra central de dados e indicadores

Criar/adaptar uma camada governada de indicadores com definições explícitas, fontes canônicas e período selecionável.

Cada indicador deve ter:

```text
id
organization_id
nome
categoria: operacional | comercial | marketing | financeiro | jurídico_preliminar | qualidade
fórmula/documentação
fonte_canônica
entidades_origem
periodicidade: hoje | semanal | mensal | intervalo_personalizado
filtros_aplicáveis
última_atualização
responsável_por_validação
status: rascunho | homologado | vigente | suspenso
visibilidade: interna
```

Regras:

- Todo número exibido mostra período e critério de inclusão.
- Dados demo ficam excluídos por padrão de todos os indicadores, inclusive denominadores.
- Dado ausente deve aparecer como `Sem dados suficientes` e não como zero, quando zero não estiver comprovado.
- Não inventar custo, receita, evento transacional ou atribuição de origem.
- Mostrar origem/fórmula em tooltip, drawer ou link de detalhe, sem poluir a tela principal.
- Indicadores não podem alterar estados de negócio; apenas revelam sinais e abrem filtros/listas de trabalho.

---

## 4. Painel Hoje: sinais diários

Manter os cinco blocos da fila operacional e incluir sinais derivados com precedência:

```text
1. Crítico/bloqueado
2. Vencido
3. Exige ação hoje
4. Risco nos próximos 7 dias
5. Acompanhamento/atalho
```

Cada registro aparece **uma única vez**, no bloco de maior prioridade. Toda ocorrência sem responsável nominal é falha de qualidade e deve estar visível.

### 4.1 Bloco A — Vencidos, hoje e próximos 7 dias

Alimentar por tarefas, calls, follow-ups, formalização, pagamentos, casos e atendimento.

Sinais:

```text
Tarefa vencida
Tarefa para hoje
Próxima ação de lead vencida
Follow-up de proposta vencido
Call agendada/confirmada hoje
Call realizada sem resumo validado, resultado ou próxima ação
Contrato enviado sem ação de acompanhamento
Pagamento inicial previsto/aguardado
Pendência de onboarding com prazo
Touchpoint/entrega prometida vencida
```

### 4.2 Bloco B — Exceções sem dono ou sem próximo passo

Sinais:

```text
Lead ativo sem área responsável
Lead ativo sem responsável nominal
Lead ativo sem próxima ação ou prazo
Caso sem responsável
Caso ativo sem plano/próxima tarefa
Proposta sem responsável/follow-up
Evento de conversão posterior sem evento inicial de lead
Registro em conflito sem responsável de resolução
```

### 4.3 Bloco C — Trabalho comercial de hoje

Sinais:

```text
Discovery agendada para hoje
Discovery realizada aguardando decisão/handoff
Triagem com score/sinal relevante ainda sem decisão comercial
Proposta enviada sem follow-up dentro do SLA interno configurado
Aceite verbal sem confirmação formal
Confirmação formal sem formalização em preparação
Contrato enviado aguardando assinatura
Contrato assinado aguardando pagamento inicial
```

### 4.4 Bloco D — Casos, qualidade e risco

Sinais:

```text
Gate de ativação pendente
Checklist obrigatório pendente com impacto de bloqueio
Pendência documental prioritária
Conflito de parâmetro, rota, país, proposta ou fonte
Marco jurídico a revisar/desatualizado
Via preliminar restrita, encerrada ou em confirmação jurídica
Pesquisa externa solicitada sem autorização aplicável
Caso sem touchpoint/entrega dentro da cadência configurada
SLA em atenção/crítico
Microentrega atrasada, sem evidência ou sem critério de aceite
```

### 4.5 Bloco E — Atalhos e decisões gerenciais do dia

Exibir apenas cards compactos que abram a lista filtrada correspondente:

```text
Leads novos hoje
Discoveries de hoje
Propostas sem follow-up
Formalizações pendentes
Pagamentos aguardados
Onboardings pendentes
Casos em atenção/críticos
Custo de mídia do período selecionado
Receita recebida no período selecionado
```

Não duplicar a fila nos cards. Card é resumo clicável; fila é a ação.

---

## 5. Score de elegibilidade preliminar: core do produto

O score é parte central do Clube Ancestral e deve ser implementado como **instrumento interno, explicável, auditável e revisável**. Ele não é parecer jurídico, decisão automática, garantia de direito, previsão de prazo ou conteúdo público sem revisão humana.

### 5.1 Nome e posicionamento

Usar no Desk:

```text
Radar de Elegibilidade Preliminar
```

No App Cliente, quando houver conteúdo aprovado, usar apenas formulação sanitizada como:

```text
Leitura inicial da jornada
Pontos favoráveis identificados
Pontos que ainda precisam de confirmação documental
Próximo passo recomendado
```

Nunca expor nota numérica, regras internas, risco bruto, fonte, hipótese, marco jurídico interno ou conclusão automática ao cliente.

### 5.2 Dimensões do score

Cadastrar fatores configuráveis por trilha/país/via, com versão e responsável de revisão.

```text
1. Identificação do ascendente/linha
2. Geração e continuidade da transmissão
3. Estado documental inicial
4. Existência de documento-chave
5. Riscos de ruptura conhecidos
6. Coerência de nomes, datas e localidades
7. Status e vigência da via de referência
8. Marco jurídico e necessidade de revisão
9. Exigência de idioma/entrevista
10. Estrutura familiar e dependências
11. Autorização e escopo de pesquisa
12. Confiança da triagem: documentos vistos, narrativa parcial ou relato inicial
```

### 5.3 Saídas do score

Não usar uma nota isolada como conclusão. Exibir cinco elementos:

```text
Faixa de sinal: Forte | Provável | Possível com pesquisa | Baixa | Inconclusiva | Sem aderência atual
Confiança: Alta | Média | Baixa
Completude da leitura: percentual de fatores disponíveis, sem confundir com chance de êxito
Fatores favoráveis: lista curta e explicável
Fatores pendentes/riscos: lista curta e ação recomendada
```

### 5.4 Regras

```text
- Score somente pode ser calculado quando houver dados mínimos de objetivo, país/linha, estrutura/ascendente ou estado documental.
- Se os dados forem insuficientes, usar Inconclusiva e informar o que falta; não inventar score.
- Forte/Provável exige via preliminar, geração, linha de transmissão, estado documental e confiança informados.
- Marco jurídico a revisar/desatualizado reduz a certeza e bloqueia uso externo como referência vigente.
- Via restrita/encerrada/em confirmação exige revisão humana e impede recomendação automática de protocolo.
- Qualquer alteração manual de resultado exige justificativa, responsável, data/hora, versão da matriz e auditoria.
- Transcrição, WhatsApp e relato podem preencher sugestão `a confirmar`, mas não validam fator automaticamente.
- Score não seleciona SKU, não cria proposta, não cria contrato e não inicia pesquisa externa.
```

### 5.5 Onde o score aparece

```text
/leads: bloco Radar de Elegibilidade Preliminar na ficha de Discovery
/matriz-juridica: regras/fatores por trilha e versão
/casos: resumo de leitura inicial, fatores pendentes e necessidade de revisão
/painel: apenas alertas derivados (inconclusivo sem próximo passo, risco crítico, marco a revisar, revisão obrigatória)
/governanca/indicadores: distribuição dos sinais por país, via, origem e resultado de conversão, sem tratar score como verdade jurídica
```

---

## 6. Marketing, conversão e jornada real

Implementar o funil completo com fontes e eventos existentes, sem criar dados sintéticos.

### 6.1 Etapas do funil

```text
Investimento em mídia
→ Lead captado
→ Lead qualificado/triagem
→ Discovery agendada
→ Discovery realizada
→ Diagnóstico/proposta enviada
→ Aceite verbal
→ Confirmação formal
→ Contrato enviado
→ Contrato assinado
→ Pagamento inicial confirmado
→ Onboarding iniciado
→ Caso ativo
```

Cada passagem deve ser derivada de evento/data válida. Não inferir a passagem com base em texto livre ou clique.

### 6.2 Indicadores de marketing e conversão

Criar na rota existente `/governanca/indicadores`, com recorte diário, semanal, mensal e intervalo personalizado. Consumir também em `/conversao` e, de forma compacta, no Painel Hoje.

| Indicador | Fórmula/critério | Fonte canônica |
|---|---|---|
| Investimento em mídia | Soma de despesas classificadas como mídia no período | Financeiro/despesas homologadas |
| Leads captados | Leads novos não-demo com data de entrada no período | CRM/Leads |
| Leads por origem | Leads por origem/canal | CRM/Leads |
| CPL | Investimento em mídia ÷ leads captados atribuíveis | Financeiro + CRM; mostrar indisponível se atribuição faltar |
| Leads qualificados | Leads que concluíram triagem mínima válida | CRM/Discovery |
| Taxa lead → qualificado | Qualificados ÷ leads captados | CRM |
| Discoveries agendadas | Calls/meetings com status agendada/confirmada no período | CRM Interactions |
| Discoveries realizadas | Calls/meetings realizados com resumo, resultado e próxima ação | CRM Interactions + Discovery |
| Taxa lead → Discovery | Discoveries realizadas ÷ leads captados | CRM |
| Taxa Discovery → proposta | Propostas enviadas ÷ Discoveries realizadas | Propostas + CRM |
| Taxa proposta → aceite formal | Confirmações formais ÷ propostas enviadas | Eventos de conversão |
| Taxa contrato → pagamento | Pagamentos iniciais confirmados ÷ contratos assinados | Contratos + Financeiro |
| Taxa pagamento → onboarding | Onboardings iniciados ÷ pagamentos iniciais confirmados | Onboarding |
| Conversão para cliente ativo | Casos ativos ÷ leads captados, por coorte e período | Casos + CRM |
| CAC de cliente pago | Investimento em mídia ÷ novos pagamentos iniciais confirmados atribuíveis | Financeiro + CRM/atribuição |
| Receita contratada | Valor de contratos assinados no período, fonte homologada | Contratos/Propostas homologadas |
| Receita recebida | Soma de eventos financeiros recebidos no período | Financeiro/Asaas |
| Receita em aberto | Cobranças válidas pendentes/atrasadas, sem duplicar canceladas | Financeiro/Asaas |
| ROI de mídia realizado | (Receita recebida atribuível - investimento em mídia) ÷ investimento em mídia | Financeiro + CRM/atribuição |
| ROAS realizado | Receita recebida atribuível ÷ investimento em mídia | Financeiro + CRM/atribuição |

Regras de honestidade do funil:

```text
- CAC, CPL, ROI e ROAS só exibem valor quando custo, período e atribuição mínima estiverem registrados.
- Sem atribuição confiável, exibir “atribuição incompleta” e os componentes disponíveis; nunca calcular como se todos viessem de mídia.
- Separar receita contratada de receita recebida.
- Separar custo de mídia de despesa de terceiro paga pelo cliente.
- Não usar pagamento previsto como receita recebida.
- Não promover aceite verbal a venda confirmada.
- Mostrar denominador e janela temporal ao abrir cada indicador.
```

### 6.3 Sinais diários derivados de marketing e conversão

Exibir no Painel Hoje e em `/conversao`:

```text
Investimento de mídia registrado sem leads atribuídos no período
Origem de lead não preenchida
Lead com origem atribuível sem evento de entrada
Discovery realizada sem proposta, diagnóstico ou decisão após prazo configurado
Proposta sem follow-up vencido
Aceite verbal parado sem confirmação formal
Contrato assinado sem cobrança/referência financeira válida
Pagamento confirmado sem onboarding iniciado
Receita prevista/contratada com valor fora da fonte homologada
Custo de mídia sem categoria/campanha/período
```

---

## 7. Dashboard financeiro real do Clube Ancestral

Usar a rota existente `/financeiro` para visão transacional e criar, dentro dela, uma seção recolhível **Realidade do Clube Ancestral**. Também alimentar `/governanca/indicadores` com a visão gerencial.

Não criar “financeiro” paralelo, não registrar despesas de terceiros como custo do Clube e não produzir projeções sem premissas explícitas.

### 7.1 Bloco Caixa e resultado real

Exibir para o período selecionado:

```text
Receita recebida
Receita contratada ainda não recebida
Cobranças pendentes
Cobranças vencidas
Investimento em mídia
Despesas operacionais do Clube
Despesas de terceiros: fora do caixa do Clube, exibidas separadamente como contexto
Resultado de caixa do período = receita recebida - despesas operacionais do Clube - investimento em mídia
```

### 7.2 Bloco Funil financeiro-comercial

Exibir:

```text
Investimento em mídia
Leads captados
Discoveries realizadas
Propostas enviadas
Contratos assinados
Pagamentos iniciais confirmados
Onboardings iniciados
Casos ativos
```

Para cada etapa, mostrar volume, taxa em relação à etapa anterior e valor financeiro quando aplicável.

### 7.3 Bloco previsão controlada

Separar claramente:

```text
Previsão contratada: contratos assinados ainda sem recebimento
Previsão em formalização: confirmação formal/contrato em preparação — não contar como receita
Previsão de proposta: propostas enviadas — não contar como receita
```

Nunca somar previsão como receita recebida ou caixa disponível.

### 7.4 Dimensões e filtros

Permitir filtros por:

```text
Período
Origem/canal
Campanha, quando existir
Nacionalidade/país/linha
Produto/jornada (referência de SKU homologado)
Responsável comercial
Responsável operacional
Status do caso
```

Dados sem dimensão preenchida devem aparecer em `Não classificado`, com alerta de qualidade e link para correção.

---

## 8. Mapeamento completo dos 51 módulos

Os módulos continuam contextuais e não se tornam novas abas. Cada um deve alimentar uma área, indicador, filtro, sinal ou seção de ficha conforme o mapa abaixo.

### 8.1 Casos — 15 módulos

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| Resumo 360 do caso | `/casos` | Estado operacional, próxima ação, responsável, bloqueio principal |
| Eixo comercial | `/casos` e `/conversao` | Gargalo entre Discovery, proposta e formalização |
| Eixo formalização | `/casos` | Contrato/OS/revisão pendente |
| Eixo financeiro | `/casos` e `/financeiro` | Pagamento aguardado, vencido ou confirmado |
| Eixo operação | `/casos` e `/ops` se existente | Caso ativo, pausado, bloqueado, arquivado |
| Checklist de ativação | `/casos` | Quantidade de gates pendentes e bloqueio principal |
| Plano de caso/jornada | `/casos` | Próximo marco, tarefa e cadência |
| Dossiê-mãe | `/casos`/dossiê | Dossiê ausente, ambiente/acesso/responsável pendente |
| Núcleo familiar | `/nucleos` | Participante/requerente sem vínculo ou dado mínimo |
| Requerentes individuais | `/clientes`/`/nucleos` | Requerente pendente de qualificação/vínculo |
| Pendências documentais | `/casos`/`/pesquisa` | Pendência prioritária vencida ou bloqueante |
| Entregas/microentregas | `/atendimento`/`/casos` | Entrega atrasada, sem aceite/evidência, touchpoint pendente |
| SLA e espera externa | `/casos`/`/ops` | Atenção/crítico, espera externa sem revisão |
| Conflitos e exceções | `/casos`/`/qualidade` | Conflito sem resolução/responsável |
| Histórico e decisões | `/casos`/`/auditoria` | Contexto sob demanda; alerta só se decisão bloqueante |

### 8.2 Biblioteca — 10 módulos

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| Bases genealógicas | `/biblioteca` | Disponibilidade/versão para pesquisa; alerta se base obrigatória suspensa |
| Dicionários controlados | `/biblioteca` | Rejeição de valores livres; qualidade de classificação |
| Trilhas de cidadania | `/biblioteca` e `/matriz-juridica` | Trilha vigente/versão aplicável na triagem |
| Marcos jurídicos | `/matriz-juridica` | Marco a revisar/desatualizado; revisão obrigatória |
| Fontes oficiais | `/biblioteca` | Fonte ausente/inativa para trilha vigente |
| Matriz de produto/jornada | `/biblioteca`/`/propostas` | Produto não homologado ou sem escopo aplicável |
| Top 30 comercial | `/biblioteca`/`/propostas` | Referência comercial disponível, sem sugerir SKU automático |
| Modelos e anexos | `/contratos`/`/biblioteca` | Modelo/anexo sem versão vigente bloqueia formalização |
| Biblioteca de mensagens | `/biblioteca-mensagens` | Template aplicável para fila humana de comunicação |
| Definições de indicadores | `/governanca/indicadores` | Fórmula/fonte/status do indicador, sem nova métrica solta |

### 8.3 Alertas — 7 módulos

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| Alertas de prazo | `/painel`/`/tarefas` | Vencido, hoje, próximos 7 dias |
| Alertas de responsável | `/painel` | Sem área/responsável/owner |
| Alertas de conversão | `/conversao`/`/painel` | Follow-up, aceite, formalização, pagamento parado |
| Alertas de caso/SLA | `/casos`/`/ops` | Atenção/crítico, espera externa, tarefa bloqueante |
| Alertas jurídicos preliminares | `/leads`/`/matriz-juridica` | Marco a revisar, via restrita, revisão obrigatória |
| Alertas documentais | `/casos`/`/pesquisa` | Documento prioritário, divergência, pendência vencida |
| Alertas de comunicação | `/atendimento`/`/biblioteca-mensagens` | Mensagem humana sugerida, não enviada automaticamente |

### 8.4 Checklist — 7 módulos

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| Checklist de Discovery | `/leads` | Call realizada incompleta; dados mínimos ausentes |
| Checklist de qualificação | `/leads` | Triagem incompleta/inconclusiva sem próximo passo |
| Checklist de formalização | `/casos`/`/contratos` | Contrato/OS/revisão/assinatura pendentes |
| Checklist de onboarding | `/casos` | Pagamento confirmado sem onboarding ou item D0 pendente |
| Checklist de dossiê | `/casos` | Dossiê/responsável/acesso/ambiente pendentes |
| Checklist documental | `/pesquisa`/`/casos` | Pendência prioritária e solicitação documentada |
| Checklist de qualidade | `/qualidade` | Falha de qualidade que impede avanço |

### 8.5 Matriz jurídica — 5 módulos

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| País/linha prioritária | `/leads`/`/matriz-juridica` | Filtro de funil, casos e score preliminar |
| Via preliminar | `/leads`/`/matriz-juridica` | Via restrita, encerrada ou em confirmação |
| Marco jurídico | `/matriz-juridica` | Atualizado/a revisar/desatualizado |
| Requisitos e riscos | `/leads`/`/casos` | Fatores do Radar e pendência prioritária |
| Documentos/fonte de prova | `/pesquisa`/`/evidencias` | Documento-chave ausente ou evidência a validar |

### 8.6 CRM — 3 módulos

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| Conversas/interações | `/leads` | Discovery/call sem resumo, consentimento ou próxima ação |
| Eventos de conversão | `/conversao` | Estado faltante, salto recusado, etapa parada |
| Origem/atribuição do lead | `/leads`/`/governanca/indicadores` | CPL, CAC, canal e origem não classificada |

### 8.7 Visão geral — 3 módulos

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| Funil comercial | `/conversao` | Volumes/taxas por etapa e gargalos |
| Marketing e mídia | `/governanca/indicadores`/`/financeiro` | Investimento, leads, CPL, CAC, ROAS/ROI quando dados suficientes |
| Realidade financeira | `/financeiro` | Receita recebida, contratada, em aberto, mídia, despesas e resultado de caixa |

### 8.8 Assistente — 1 módulo

| Módulo contextual | Tela/fonte principal | Indicador/sinal/uso diário |
|---|---|---|
| Assistente consultivo de pesquisa | `/pesquisa` | Sugere perguntas, fontes e tarefas; nunca pesquisa externamente, conclui direito ou publica conteúdo sem revisão |

---

## 9. WhatsApp: prioridade após migração, sem automação prematura

A automação de WhatsApp é prioridade **imediatamente após a migração/estabilização técnica**, mas não deve ser disparada neste corte.

### 9.1 Implementar agora apenas a base segura

Criar/adaptar uma **Fila Humana de Comunicação** dentro de `/atendimento` e integrada à `/biblioteca-mensagens`:

```text
id
organization_id
lead_id/opportunity_id/case_id/deliverable_id
trigger_type
recommended_template_id
draft_body
channel: whatsapp | email | outro
reason_for_contact
priority
suggested_at
suggested_by_rule
approval_status: rascunho | em_revisao | aprovado | descartado
approved_by
approved_at
scheduled_at opcional
sent_at opcional
sent_by_user_id
delivery_status: nao_enviado | enviado_manual | confirmado | falhou | nao_aplicavel
external_message_reference opcional
created_at
updated_at
```

A fila pode criar **sugestões**, nunca disparar mensagem.

### 9.2 Gatilhos de sugestão humana

```text
Lembrete de Discovery agendada
Follow-up de proposta sem resposta
Confirmação formal recebida
Contrato enviado e aguardando assinatura
Pagamento inicial aguardado
Boas-vindas após onboarding liberado
Pendência documental prioritária
Atualização contextual aprovada de caso
Ausência de touchpoint no prazo configurado
```

### 9.3 Bloqueios

```text
- Não sugerir mensagem se o contato não tiver canal/consentimento aplicável.
- Não sugerir conteúdo jurídico conclusivo, score, prazo garantido ou hipótese interna.
- Não sugerir cobrança sem referência financeira autorizada.
- Não sugerir onboarding antes de contrato assinado e pagamento inicial confirmado.
- Não disparar WhatsApp por webhook, cron, front-end ou clique sem aprovação humana.
- URL, token, gravação, fonte, documento interno, dado sensível ou log nunca entram no texto sugerido.
```

### 9.4 Backlog pós-migração — para Claude, sem design

Reservar para Claude, após a migração e sem redesenho visual:

```text
1. Adaptador de provedor WhatsApp com credenciais em secret manager.
2. Webhook de status de entrega, sem armazenar conteúdo sensível em log.
3. Serviço de fila com idempotência, rate limit, retentativa segura e opt-out.
4. Worker agendado para transformar sugestão aprovada em envio autorizado.
5. Testes de isolamento por organização, consentimento, template, destinatário e duplicidade.
6. Reconciliação sent_at/delivery_status e trilha de auditoria append-only.
7. Monitoramento de erro, falha de webhook e mensagem duplicada.
8. Templates versionados e revisão humana antes de ativação.
```

Não desenvolver esses itens no Lovable agora. Não criar UI nova para eles; apenas manter a fila humana e contratos de dados necessários.

---

## 10. O que fica no Lovable e o que não fica

### Implementar no Lovable agora

```text
- Ligações dos 51 módulos às telas existentes, indicadores, filtros e sinais.
- Radar de Elegibilidade Preliminar interno, explicável e auditável.
- Indicadores de marketing, conversão, CAC, CPL, ROI/ROAS condicionado à qualidade dos dados.
- Dashboard financeiro real dentro da rota Financeiro existente.
- Sinais diários do Painel Hoje e listas filtradas para cada card.
- Fila Humana de Comunicação WhatsApp, sem envio automático.
- Catálogo de indicadores, fontes, versões e fórmulas.
- Testes, constraints, RLS e auditoria.
```

### Reservar para Claude após migração, sem design

```text
- Integração real de WhatsApp/webhooks/workers.
- Importadores e reconciliações externas de mídia/ads, quando credenciais e fonte forem definidas.
- Conectores financeiros avançados/reconciliação automática, se não existirem na fonte atual.
- Jobs de agregação materializada/otimização de consultas quando houver volume real.
- Exportações avançadas, automações de rotina e monitoramento técnico.
- Testes end-to-end de integrações e observabilidade de produção.
```

---

## 11. Regras de UX

- Não criar novas abas principais nem dashboards redundantes.
- Painel Hoje é fila; card abre lista filtrada; ficha mostra detalhe.
- Cada sinal deve ter: motivo, entidade, responsável, prazo/idade, severidade e ação/rota de destino.
- Não usar apenas cor; texto deve indicar o problema.
- Mostrar `Sem dados suficientes` em vez de número enganoso.
- Permitir filtro de período, responsável, origem, país/via e status onde fizer sentido.
- Não expor ao App Cliente indicadores internos, score bruto, risco, evidência, notas, fontes, custos, ROI, CAC, CPL, referências financeiras internas ou marcos jurídicos não sanitizados.

---

## 12. Testes obrigatórios

### Integridade e segurança

1. Usuário de outra organização não vê dados, indicadores, filas ou regras de outra organização.
2. Dados demo não entram em métricas reais por padrão.
3. Alteração de score, fator, marco, indicador ou fila registra auditoria append-only.
4. Interface não é o único controle: validações relevantes existem no banco/servidor.

### Painel e sinais

5. Registro aparece uma vez só no Painel Hoje, na maior prioridade aplicável.
6. Item sem responsável aparece como exceção de qualidade.
7. Cards abrem lista filtrada e não duplicam a fila.
8. Sinais de call, conversão, formalização, caso, checklist e jurídico mostram motivo e rota correta.

### Score preliminar

9. Score sem dados mínimos retorna Inconclusiva e lista pendências, sem nota fictícia.
10. Forte/Provável sem campos dependentes é recusado.
11. Marco a revisar/desatualizado bloqueia uso externo como referência vigente.
12. Via restrita/encerrada/em confirmação exige revisão humana.
13. Mudança manual de sinal exige justificativa e versão de matriz.
14. Score não cria SKU, proposta, contrato, cobrança, pesquisa externa ou acesso ao portal.

### Marketing e financeiro

15. CPL/CAC/ROI/ROAS exibem indisponibilidade se custo, receita ou atribuição forem insuficientes.
16. Receita contratada e recebida não são somadas indevidamente.
17. Pagamento previsto não conta como receita recebida.
18. Despesa de terceiro não entra como custo do Clube.
19. Investimento de mídia, leads, Discoveries, propostas, contratos, pagamentos, onboarding e casos ativos respeitam período e fonte canônica.
20. Origem não classificada aparece em qualidade e não é descartada.

### Fila humana de WhatsApp

21. Gatilho cria somente sugestão/draft, nunca envio.
22. Sem consentimento/canal aplicável, não cria sugestão acionável.
23. Texto sugerido não contém dados internos, score, hipótese jurídica ou documentos/fontes restritos.
24. Não existe chamada de API externa nem envio automático nesta entrega.

### Entrega técnica

25. Migrations são aditivas, versionadas e não apagam dados existentes.
26. Typecheck, testes e build passam.
27. Apresentar changelog, rotas/componentes alterados, migrations e pendências realmente bloqueantes.
28. Confirmar expressamente: nenhuma mensagem, cobrança, contrato, assinatura, pesquisa externa, convite ou alteração automática de dado real foi executada.

---

## 13. Entrega final exigida

Ao final, entregar uma resposta objetiva com:

1. Módulos conectados, por rota.
2. Sinais implementados no Painel Hoje e na Conversão.
3. Score de Elegibilidade Preliminar: fatores, versão, regras e locais de exibição.
4. Indicadores de marketing e conversão, com fórmulas e fontes.
5. Dashboard financeiro real, com critérios de receita, custo e previsão.
6. Fila Humana de Comunicação e lista de gatilhos, comprovando ausência de envio automático.
7. Lista dos itens reservados para Claude após migração, sem design.
8. Testes realizados e resultados.
9. Changelog da versão.
10. Pendências reais e bloqueantes — sem inventar pendência de arquitetura ou propor novo redesign.
