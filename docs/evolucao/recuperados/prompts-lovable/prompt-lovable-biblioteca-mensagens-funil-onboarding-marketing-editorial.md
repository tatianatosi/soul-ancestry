# Prompt Lovable — Biblioteca de Mensagens, Funil, Onboarding e Marketing Editorial

## Objetivo

Implementar no Desk Intelligence do Clube Ancestral uma **Biblioteca de Mensagens e Conteúdos** interna, governada e reutilizável, para apoiar comunicação manual por WhatsApp, e-mail, portal e marketing editorial.

A biblioteca não deve disparar mensagens, e-mails, WhatsApp, notificações, posts, campanhas, cobranças ou automações externas. Ela serve para selecionar, personalizar, revisar, aprovar, copiar e registrar o uso de modelos. Toda ação externa continua exigindo decisão humana, destinatário resolvido e confirmação específica no fluxo próprio.

## Princípios obrigatórios

1. Dados de clientes, familiares, documentos, contratos, conversas e pesquisas são sensíveis. Aplicar RLS por `organization_id`, autorização por papel e menor privilégio.
2. A Biblioteca é interna e não aparece no App Cliente.
3. Nenhum template pode enviar comunicação automaticamente.
4. Não permitir que templates criem, alterem ou liberem contrato, cobrança, assinatura, pagamento, portal, pesquisa externa, solicitação institucional, acesso ou onboarding.
5. Mensagens devem usar linguagem clara, humana, acolhedora e de parceria; sem prometer cidadania, elegibilidade, prazo jurídico, resultado de pesquisa ou ação ainda não autorizada.
6. Toda alteração, aprovação, arquivamento, cópia e uso de template gera auditoria sem armazenar tokens, links mágicos, número de documento, conteúdo integral de anexos ou dados pessoais desnecessários.
7. Templates de demonstração ou exemplo ficam marcados como `is_demo=true` e ocultos por padrão.
8. Não excluir fisicamente templates, versões, aprovações ou registros de uso. Usar arquivamento lógico com motivo.

---

# 1. Modelo de dados

Criar as entidades abaixo. Todas devem conter, no mínimo:

- `id`
- `organization_id`
- `created_at`
- `created_by`
- `updated_at`
- `updated_by`
- `archived_at`
- `archived_by`
- `archive_reason`

## 1.1 `message_template_categories`

Campos:

- `key` único por organização
- `name`
- `description`
- `sort_order`
- `is_active`

Criar categorias iniciais:

- `comercial`
- `formalizacao`
- `financeiro`
- `onboarding`
- `documentos`
- `pesquisa`
- `atualizacao_contextual`
- `portal_cliente`
- `marketing_editorial`
- `interno`

## 1.2 `message_templates`

Campos:

- `category_id`
- `key` controlada e única
- `name`
- `objective`
- `channel`: `whatsapp`, `email`, `portal`, `artigo`, `newsletter`, `social`, `interno`
- `stage_scope`: etapa/gate em que pode ser usado
- `audience`: `lead`, `contato`, `contratante`, `participante_autorizado`, `cliente_ativo`, `interno`, `publico`
- `body`
- `subject` opcional para e-mail/artigo
- `safe_variables` JSON com campos permitidos
- `required_variables` JSON
- `prohibited_claims` JSON
- `requires_human_review` boolean, padrão verdadeiro
- `requires_gate_validation` boolean, padrão verdadeiro quando aplicável
- `status`: `rascunho`, `em_revisao`, `aprovado`, `vigente`, `substituido`, `suspenso`, `arquivado`
- `version`
- `effective_from`
- `effective_until` opcional
- `approved_by`
- `approved_at`
- `supersedes_template_id` opcional
- `is_demo`

## 1.3 `message_template_versions`

Criar versão imutável toda vez que um template for enviado para revisão, aprovado, tornado vigente, substituído ou alterado após estar vigente.

Campos:

- `template_id`
- `version`
- `body_snapshot`
- `subject_snapshot`
- `variables_snapshot`
- `change_reason`
- `status_snapshot`
- `created_by`
- `created_at`

## 1.4 `message_template_usage`

Registro interno de uso do template, sem disparo externo.

Campos:

- `template_id`
- `template_version`
- `lead_id` opcional
- `opportunity_id` opcional
- `case_id` opcional
- `person_id` opcional
- `channel`
- `rendered_preview` somente com conteúdo sanitizado e sem dados sensíveis indevidos
- `variables_used` com valores minimizados
- `used_by`
- `used_at`
- `purpose`
- `external_send_status`: `nao_enviado`, `copiado_para_envio_manual`, `registrado_como_enviado_externamente`
- `external_evidence_reference` opcional
- `notes`

## 1.5 `editorial_content_items`

Para marketing editorial separado da comunicação de cliente.

Campos:

- `title`
- `content_type`: `artigo`, `newsletter`, `post_social`, `roteiro_video`, `pauta`, `atualizacao_site`
- `theme`
- `funnel_stage`: `descoberta`, `consideracao`, `decisao`, `onboarding`, `legado`, `institucional`
- `target_audience`
- `country_or_service` opcional
- `status`: `ideia`, `pauta_aprovada`, `rascunho`, `em_revisao`, `aprovado`, `agendado`, `publicado`, `arquivado`
- `owner_id`
- `planned_for` opcional
- `published_at` opcional
- `content_body`
- `source_references` internas
- `review_notes`
- `approval_by`
- `approval_at`
- `is_demo`

## 1.6 `editorial_content_links`

Permitir vínculos internos entre conteúdo editorial, tema, serviço, template, campanha futura ou biblioteca, sem criar campanha ou automação.

Campos:

- `editorial_content_item_id`
- `linked_entity_type`
- `linked_entity_id`
- `link_type`: `referencia`, `derivado_de`, `reutiliza_template`, `relacionado_a`
- `created_by`
- `created_at`

---

# 2. Papéis e permissões

Aplicar autorização no servidor e no banco, não apenas na interface.

| Papel | Permissões |
|---|---|
| `admin` | Gerenciar categorias, templates, versões, vigência, arquivamento, aprovações e editorial |
| `operacoes` | Criar, editar rascunhos, usar templates aprovados, registrar uso, propor revisão |
| `comercial` | Usar templates comerciais aprovados, criar rascunhos comerciais, registrar conversas e confirmações |
| `financeiro` | Usar templates financeiros aprovados, sem criar cobrança ou alterar condição comercial |
| `pesquisador` | Usar templates internos/de pesquisa aprovados, sem comunicação externa automática |
| `leitura` | Apenas visualizar templates vigentes autorizados; sem copiar dados sensíveis nem editar |

Regras:

- Somente `admin` pode tornar template vigente, suspenso, substituído ou arquivado.
- Templates financeiros, contratuais, de pagamento, privacidade e portal exigem `admin` ou aprovação formal definida.
- Todo uso deve verificar se o papel, público, canal e gate são compatíveis.
- Usuário não pode acessar ou usar templates de outra organização.

---

# 3. Tela Biblioteca de Mensagens

Criar uma rota interna contextual, por exemplo:

```text
/configuracoes/biblioteca-mensagens
```

Não criar uma nova aba principal se existir área de Configurações ou Biblioteca Mestre. Exibir como subrota/painel contextual.

## 3.1 Listagem

Filtros:

- Categoria
- Canal
- Etapa do funil/jornada
- Público
- Status
- Responsável
- Vigência
- Incluir arquivados
- Incluir demonstrações
- Busca por título, chave, objetivo e texto

Colunas:

- Nome
- Categoria
- Canal
- Etapa aplicável
- Status
- Versão
- Responsável/aprovador
- Vigência
- Última atualização
- Demonstração

## 3.2 Detalhe do template

Mostrar:

- Objetivo e limite de uso
- Canal e público
- Gate/etapa exigido
- Texto do template
- Variáveis permitidas e obrigatórias
- Proibições explícitas
- Versões e histórico
- Critérios de aprovação
- Botão `Usar como rascunho`
- Botão `Copiar texto`
- Botão `Registrar uso`
- Botão `Propor revisão`

Não incluir botão “Enviar WhatsApp”, “Enviar e-mail”, “Publicar” ou equivalente nesta entrega.

## 3.3 Uso seguro

Ao selecionar “Usar como rascunho”:

1. Escolher ou confirmar lead, oportunidade, caso e destinatário, conforme aplicável.
2. Revalidar no servidor: organização, papel, etapa, gate e finalidade.
3. Mostrar somente variáveis permitidas.
4. Gerar prévia sem executar ação externa.
5. Exibir alertas de bloqueio, quando houver.
6. Permitir copiar o texto ou registrar que foi enviado manualmente, com evidência/referência opcional.
7. Registrar `message_template_usage`.

---

# 4. Biblioteca inicial — Funil comercial

Criar templates iniciais abaixo como `rascunho` ou `em_revisao`; não marcar como vigente sem aprovação humana.

## 4.1 Proposta enviada

**Chave:** `comercial.proposta_enviada`

**Etapa:** `proposta_enviada`

**Público:** lead/contato autorizado

**Canal:** WhatsApp

**Texto:**

```text
Oi, {{primeiro_nome}}! Te enviei a proposta com o caminho que desenhamos para {{objetivo_resumido}}.

Leia com calma. Se fizer sentido, podemos conversar sobre dúvidas ou ajustes antes de qualquer decisão. Estou por aqui.
```

**Proibições:** não prometer resultado, prazo jurídico, contrato, cobrança ou início automático de pesquisa.

## 4.2 Follow-up de proposta

**Chave:** `comercial.followup_proposta`

**Etapa:** `proposta_enviada`

**Texto:**

```text
Oi, {{primeiro_nome}}! Passando para saber se conseguiu olhar a proposta.

Não precisa decidir com pressa; queria apenas entender se ficou alguma dúvida ou se faz sentido ajustarmos algum ponto.
```

## 4.3 Aceite verbal registrado

**Chave:** `comercial.aceite_verbal_registrado`

**Etapa:** `aceite_verbal_confirmado`

**Texto:**

```text
Fico muito feliz em seguirmos juntos, {{primeiro_nome}}.

Vou registrar nossa conversa como aceite verbal e, para avançarmos com segurança, vou te pedir uma confirmação escrita simples por aqui.
```

**Regra:** não usar “cliente”, “contrato pronto”, “cobrança” ou “onboarding” nesta etapa.

## 4.4 Pedido de confirmação formal

**Chave:** `comercial.solicitar_confirmacao_formal`

**Etapa:** `aceite_verbal_confirmado`

**Texto:**

```text
Para eu registrar direitinho esse próximo passo, você pode me confirmar por escrito aqui no WhatsApp que está de acordo em iniciar {{servico_nome}} nas condições que conversamos?

Pode responder algo simples como:
“Confirmo que estou de acordo em iniciar {{servico_nome}} nas condições apresentadas.”

Assim que receber sua confirmação, organizo a preparação interna da formalização. Estou por aqui se surgir qualquer dúvida.
```

**Regra:** não afirma que contrato, cobrança, assinatura, pesquisa externa ou onboarding já existem.

## 4.5 Confirmação formal recebida

**Chave:** `comercial.confirmacao_formal_recebida`

**Etapa:** `confirmacao_formal_recebida`

**Texto:**

```text
Obrigada, {{primeiro_nome}}! Recebi sua confirmação.

Agora vamos iniciar a preparação interna da formalização, conferindo cadastro, escopo e os dados necessários para a próxima etapa. Ainda não há nenhuma cobrança ou assinatura para você fazer neste momento.
```

## 4.6 Dados para formalização

**Chave:** `formalizacao.solicitar_dados_minimos`

**Etapa:** `confirmacao_formal_recebida`

**Texto:**

```text
Oi, {{primeiro_nome}}! Para preparar a formalização com cuidado, preciso confirmar alguns dados cadastrais e, quando aplicável, os participantes envolvidos no escopo.

Vou te enviar uma lista objetiva. Se preferir, podemos organizar isso por etapas.
```

**Regra:** coletar somente dados mínimos necessários; não pedir documentos de pesquisa externa, documentos de terceiros ou dados de menor sem necessidade, base e autorização aplicáveis.

## 4.7 Formalização em preparação

**Chave:** `formalizacao.atualizacao_preparacao`

**Etapa:** `formalizacao_em_preparacao`

**Texto:**

```text
Estamos conferindo os dados e o escopo para que a formalização reflita exatamente o que foi combinado.

Ainda não há cobrança, assinatura ou início operacional para você fazer neste momento. Aviso assim que a próxima etapa estiver pronta.
```

## 4.8 Contrato pronto para assinatura

**Chave:** `formalizacao.contrato_pronto_para_assinatura`

**Etapa:** `contrato_enviado`

**Pré-requisito:** contrato aprovado internamente, versão, partes, método de assinatura e destinatários resolvidos.

**Texto:**

```text
Oi, {{primeiro_nome}}! A formalização foi preparada com base no escopo que confirmamos.

Vou te enviar a versão para leitura e assinatura. Se houver qualquer dúvida antes de assinar, falamos e ajustamos com tranquilidade.
```

## 4.9 Contrato assinado

**Chave:** `formalizacao.contrato_assinado`

**Etapa:** `contrato_assinado`

**Texto:**

```text
Obrigada, {{primeiro_nome}}! Recebemos o contrato assinado.

Agora vamos conferir a etapa financeira combinada. Assim que o pagamento inicial estiver confirmado na fonte transacional, seguimos para o onboarding.
```

## 4.10 Pagamento inicial confirmado

**Chave:** `financeiro.pagamento_inicial_confirmado`

**Etapa:** `pagamento_inicial_confirmado`

**Pré-requisito:** evento financeiro confirmado pela fonte transacional.

**Texto:**

```text
Oi, {{primeiro_nome}}! Confirmamos o pagamento inicial.

A partir de agora, seu caso entra na etapa de onboarding. Você receberá a identificação do responsável, o checklist inicial e o plano dos próximos passos.
```

---

# 5. Biblioteca inicial — Onboarding e jornada

## 5.1 Boas-vindas D0

**Chave:** `onboarding.boas_vindas_d0`

**Etapa:** `onboarding_iniciado`

**Texto:**

```text
Oi, {{primeiro_nome}}! Seja bem-vindo(a) oficialmente ao Clube Ancestral.

Seu caso entrou em onboarding e {{responsavel_nome}} será seu ponto principal de contato. Nos próximos dias, vamos organizar o checklist e o plano inicial de trabalho.
```

## 5.2 Plano e checklist D1–D3

**Chave:** `onboarding.plano_checklist_d1_d3`

**Texto:**

```text
Oi, {{primeiro_nome}}! Organizamos os primeiros passos do seu caso.

Você receberá um checklist priorizado e o plano de ação inicial, para saber com clareza o que depende da nossa equipe e o que precisaremos de você.
```

## 5.3 Convite para call de onboarding

**Chave:** `onboarding.convite_call`

**Pré-requisito:** onboarding iniciado e agenda/responsável definidos.

**Texto:**

```text
Oi, {{primeiro_nome}}! Para alinharmos o início da jornada, gostaria de agendar nossa call de onboarding.

Nela vamos revisar o plano, o checklist e os próximos marcos. Qual destes horários funciona melhor para você: {{opcoes_horario}}?
```

## 5.4 Documento recebido

**Chave:** `documentos.confirmacao_recebimento`

**Texto:**

```text
Recebemos o documento de {{documento_nome}}.

Vamos revisá-lo internamente e, se precisarmos de complemento ou nova versão, explicaremos exatamente o que falta.
```

**Regra:** não declarar documento validado automaticamente.

## 5.5 Pedido de reenvio

**Chave:** `documentos.pedir_reenvio`

**Pré-requisito:** revisão interna com justificativa registrada.

**Texto:**

```text
Oi, {{primeiro_nome}}! Para conseguirmos usar o documento de {{documento_nome}}, precisamos de uma nova versão porque {{motivo_objetivo}}.

Você consegue nos enviar {{orientacao_simples}}? Se quiser, posso te orientar.
```

## 5.6 Primeira micro-entrega D5–D7

**Chave:** `onboarding.primeira_microentrega`

**Pré-requisito:** entrega aprovada, sanitizada e liberada para o cliente.

**Texto:**

```text
Oi, {{primeiro_nome}}! Temos uma primeira atualização do seu caso: {{entrega_cliente_resumida}}.

Isso marca o início prático da nossa jornada. O próximo passo é {{proximo_marco}}.
```

## 5.7 Atualização contextualizada D14

**Chave:** `jornada.atualizacao_contextualizada`

**Texto:**

```text
Oi, {{primeiro_nome}}! Passando com uma atualização do seu caso.

Nesta etapa, avançamos em {{trabalho_realizado}} e estamos aguardando {{dependencia_ou_marco}}.

Por enquanto, {{acao_cliente_necessaria}}. O próximo marco verificável é {{proximo_marco}}.
```

**Regra:** não enviar mensagem vazia; exigir trabalho realizado, espera contextualizada ou próximo marco verificável.

## 5.8 Espera externa

**Chave:** `jornada.espera_externa`

**Pré-requisito:** espera externa completa e registrada no Desk.

**Texto:**

```text
Oi, {{primeiro_nome}}! Nesta etapa, estamos aguardando um retorno externo relacionado a {{dependencia_resumida}}.

Isso não exige nenhuma ação sua agora. Seguimos acompanhando e voltamos a atualizar você até {{data_revisao}} ou antes, se houver novidade.
```

## 5.9 Documento validado

**Chave:** `pesquisa.documento_validado`

**Pré-requisito:** evidência/entrega aprovada para comunicação externa.

**Texto:**

```text
Oi, {{primeiro_nome}}! Concluímos a validação de {{item_resumido}}.

Esse avanço foi incorporado à organização do seu caso. O próximo passo é {{proximo_marco}}.
```

## 5.10 Achado aprovado

**Chave:** `pesquisa.achado_aprovado`

**Pré-requisito:** achado interno validado, versão sanitizada e publicação aprovada.

**Texto:**

```text
Oi, {{primeiro_nome}}! Temos uma atualização importante da pesquisa: {{achado_sanitizado}}.

Esse material foi incorporado ao acompanhamento do seu caso. Seguimos agora com {{proximo_marco}}.
```

---

# 6. Biblioteca inicial — Marketing editorial

Marketing editorial é independente de conversas de cliente, proposta, contrato, cobrança e onboarding. Não usar dados de casos reais, pessoas identificáveis, transcrições ou documentos sem base, autorização e revisão apropriadas.

## 6.1 Pauta editorial

**Chave:** `editorial.pauta`

Campos obrigatórios:

- Tema
- Pergunta principal
- Público
- Etapa do funil
- Serviço/país, se aplicável
- Tese editorial
- Fontes/referências internas permitidas
- Riscos de afirmação
- Responsável
- Data planejada

## 6.2 Artigo educativo — descoberta

**Chave:** `editorial.artigo_descoberta`

Estrutura:

```text
Título: {{titulo}}

Abertura
Apresente a dúvida real do público sem prometer resultado.

O que vale entender
Explique conceitos, etapas ou documentos de forma acessível.

O que costuma exigir confirmação
Diferencie informação geral de análise individual, documental ou jurídica.

Próximo passo possível
Convide para organizar informações, buscar orientação ou iniciar uma conversa de diagnóstico.

Aviso responsável
Cada caso depende de documentos, contexto e análise aplicável. Este conteúdo é informativo e não constitui garantia de resultado.
```

## 6.3 Artigo — consideração

**Chave:** `editorial.artigo_consideracao`

Estrutura:

```text
Título: {{titulo}}

Contexto
Descreva a decisão que a pessoa está tentando tomar.

Critérios para comparar caminhos
Apresente escopo, documentos, etapas, riscos e limites de modo transparente.

Como funciona uma análise inicial
Explique o papel do diagnóstico, sem prometer elegibilidade ou resultado.

Convite
Se fizer sentido, organize suas informações para uma conversa inicial.
```

## 6.4 Artigo — jornada e legado

**Chave:** `editorial.artigo_legado`

Estrutura:

```text
Título: {{titulo}}

História e contexto
Apresente o valor de preservar memória, documentos e narrativa familiar.

Cuidado com fontes
Explique a diferença entre lembrança, hipótese, documento e evidência validada.

Como uma família pode começar
Sugira entrevistas, organização de documentos e registro de referências, sem expor casos reais.

Convite
Conheça as formas de organizar sua história familiar com acompanhamento responsável.
```

## 6.5 Checklist editorial antes de publicar

Obrigatório antes de status `publicado`:

- Título e público definidos.
- Responsável editorial definido.
- Fontes/referências conferidas.
- Nenhuma promessa de cidadania, elegibilidade, prazo garantido ou resultado.
- Nenhum dado real de cliente sem autorização e sanitização.
- País, serviço e informação normativa tratados como conteúdo que exige revisão quando aplicável.
- Aprovação humana registrada.
- Canal e data de publicação registrados.

---

# 7. Gatilhos de uso e bloqueios

Criar uma função server-side para validar uso de template, por exemplo:

```text
fn_validar_uso_template(template_id, actor_id, lead_id, opportunity_id, case_id, person_id, channel)
```

A função deve:

1. Validar organização e papel do usuário.
2. Validar status do template: somente `aprovado` ou `vigente` pode ser usado externamente.
3. Validar canal, público e etapa aplicáveis.
4. Validar gates correspondentes.
5. Bloquear uso quando houver dado de demonstração em contexto real ou caso demo em métrica real.
6. Validar variáveis permitidas e obrigatórias.
7. Bloquear variáveis que exponham documento, CPF, RG, token, link mágico, pagamento interno, hipótese, nota interna, transcrição ou conteúdo de anexo.
8. Registrar resultado, inclusive tentativas bloqueadas, sem gravar dados sensíveis.

## Exemplos de bloqueio obrigatório

- Template de pedido de confirmação formal não pode ser usado antes de aceite verbal registrado.
- Template de contrato pronto para assinatura não pode ser usado sem contrato interno revisado e estado `contrato_enviado` permitido.
- Template de pagamento confirmado não pode ser usado sem evento transacional confirmado.
- Template de boas-vindas não pode ser usado sem onboarding iniciado.
- Template de primeira micro-entrega não pode ser usado sem entrega aprovada e sanitizada.
- Template de espera externa não pode ser usado sem registro completo de espera externa.
- Template editorial não pode puxar dados de pessoa, caso, documento, conversa ou pesquisa identificável.

---

# 8. Integração com funil e jornada

Na ficha de Lead/Oportunidade/Caso, mostrar um painel contextual “Mensagens sugeridas”, sem envio automático.

Exemplos:

| Estado | Sugestão interna |
|---|---|
| Proposta enviada | Proposta enviada; Follow-up de proposta |
| Aceite verbal confirmado | Aceite verbal registrado; Pedido de confirmação formal |
| Confirmação formal recebida | Confirmação formal recebida; Solicitar dados mínimos |
| Formalização em preparação | Atualização de preparação |
| Contrato enviado | Contrato pronto para assinatura |
| Contrato assinado | Contrato assinado |
| Pagamento inicial confirmado | Pagamento inicial confirmado |
| Onboarding iniciado | Boas-vindas; plano/checklist; convite para call |
| D7 | Primeira micro-entrega, se houver entrega aprovada |
| D14 | Atualização contextualizada, se houver conteúdo útil |
| Espera externa | Atualização de espera externa |

Cada sugestão deve explicar o motivo e exibir bloqueios, por exemplo:

```text
Bloqueado: contrato ainda não enviado.
Bloqueado: pagamento inicial não confirmado.
Bloqueado: não há entrega aprovada para publicação.
```

---

# 9. Auditoria e privacidade

Registrar em auditoria:

- Template criado, editado, revisado, aprovado, tornado vigente, suspenso, substituído, arquivado e restaurado.
- Uso iniciado, prévia gerada, cópia realizada, registro de envio manual, envio não comprovado e tentativa bloqueada.
- Alteração de variáveis, canal, público, gate e status.
- Conteúdo editorial criado, revisado, aprovado, publicado ou arquivado.

Nunca registrar em logs:

- Token, sessão, senha, link mágico completo ou chave de API.
- CPF, RG, número de passaporte, cartão, dados bancários ou conteúdo integral de anexos.
- Transcrição integral, conversa privada integral ou documento bruto.
- Dados de terceiros que não sejam necessários para identificação operacional mínima.

---

# 10. Critérios de aceite

1. A Biblioteca existe como rota interna contextual, sem nova aba primária e sem exposição no App Cliente.
2. Templates são versionados, aprovados e arquivados logicamente.
3. Nenhum botão dispara WhatsApp, e-mail, post ou automação externa.
4. Um template só pode ser usado quando papel, canal, público, organização e gate forem válidos no servidor/banco.
5. Aceite verbal e confirmação formal possuem templates distintos.
6. O template de confirmação formal não libera contrato, cobrança, assinatura, onboarding, pesquisa externa ou portal.
7. Templates financeiros e de onboarding ficam bloqueados antes dos eventos correspondentes.
8. A biblioteca editorial é separada da biblioteca de cliente e não usa dados reais de casos sem autorização e sanitização.
9. Uso de template gera evento auditável, com conteúdo minimizado.
10. Demos ficam ocultas por padrão e não contaminam métricas nem sugestões de casos reais.
11. Tentativa de usar template de outra organização, de alterar `case_id` ou de contornar gate via API é recusada no servidor.
12. Typecheck, testes de RLS/autorização e build devem passar antes de considerar a entrega concluída.

---

# 11. Fora de escopo desta entrega

- Integração com API de WhatsApp, Meta, e-mail, CRM externo ou automação editorial.
- Envio automático ou agendado de mensagens.
- Criação de cobrança, link de pagamento, assinatura, contrato, proposta ou caso.
- Publicação automática de artigos, newsletters ou posts.
- Sincronização com planilhas, webhooks ou plataformas de mídia.
- Uso de IA para inferir elegibilidade, parentesco, conclusão jurídica ou promessa de resultado.

Ao final, entregar:

- Migrations e entidades criadas.
- Políticas RLS e funções server-side de validação.
- Rotas e componentes internos criados/alterados.
- Templates iniciais carregados como rascunho ou em revisão.
- Lista de gates e bloqueios aplicados.
- Testes executados e resultado.
- Confirmação explícita de que nenhuma mensagem, publicação, cobrança, contrato, acesso ou automação externa foi disparada.
