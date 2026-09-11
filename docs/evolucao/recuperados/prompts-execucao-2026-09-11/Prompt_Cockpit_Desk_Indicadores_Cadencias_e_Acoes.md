# Prompt de Implementação — Cockpit do Desk, Indicadores, Cadências e Ações

**Projeto:** `tatianatosi/soul-ancestry`  
**Superfície:** Clube Ancestral Desk Intelligence  
**Prioridade:** transformar o Desk atual — hoje fragmentado em listas, bibliotecas, cards, gates e indicadores por aba — em uma operação orientada por decisão, cadência, próxima ação e acompanhamento por pessoa/caso.

---

## 0. Contexto e regra de execução

O Desk possui muitas rotas, abas e bibliotecas que exibem dados, métricas, pendências, fontes, listas e referências. O problema não é falta de informação: é falta de uma leitura única e acionável.

Hoje, a mesma situação pode aparecer como:

- pendência cadastral;
- checklist;
- gate;
- sinal de atenção;
- tarefa;
- item de onboarding;
- documento pendente;
- fonte a revisar;
- alerta;
- indicador;
- item em biblioteca;
- bloqueio em uma cadeia operacional;
- observação em contrato;
- lista de pesquisa;
- card isolado.

Isso faz com que cada aba apresente um cenário diferente do mesmo caso, sem responder o que a proprietária precisa saber para operar:

```text
O que está atrasado?
Quem precisa agir?
Quem é responsável internamente?
Qual é a próxima ação?
Qual ação pode ser feita agora?
Qual é o impacto real da pendência?
O que muda no App Cliente da pessoa/família?
```

Este trabalho não é uma nova auditoria e não é uma recriação de telas. Usar as tabelas, funções, rotas, indicadores, Painel Hoje, Caso 360, tarefas, documentos, pesquisa, propostas, contratos, OS, onboarding e micro-entregas já existentes.

Não criar listas estáticas, bibliotecas decorativas, cards sem ação, novas entidades paralelas, casos duplicados, núcleos duplicados ou métricas falsas.

---

## 1. Objetivo

Transformar cada sinal relevante do Desk em uma cadeia operacional clara:

```text
Sinal/indicador
→ pessoa ou caso afetado
→ motivo e impacto
→ próxima ação
→ tarefa/responsável/prazo quando aplicável
→ atualização preparada para App Cliente quando aplicável
→ persistência e histórico
```

A regra visual do Desk é:

> Todo indicador deve responder “o que faço agora?”.

Se um indicador não permite abrir uma pessoa, caso, tarefa, documento, evidência, proposta, contrato, OS ou atualização preparada, ele não deve ocupar o topo do Desk.

---

## 2. Premissas que devem ser preservadas

### 2.1 Caso canônico e entidades

```text
Um caso.
Um case_id canônico.
Um case_code humano.
Aliases preservados.
Um núcleo quando aplicável.
Participantes vinculados ao mesmo caso.
Uma jornada.
Uma fonte de verdade.
Uma próxima ação.
Nenhum trabalho perdido.
```

Não criar novo caso, cliente, pessoa, núcleo, dossiê, participante, proposta, contrato ou onboarding para resolver inconsistência.

### 2.2 Segurança

Manter obrigatoriamente:

- RLS.
- Login e sessão.
- Permissões por organização e usuário.
- Isolamento entre organizações.
- Auditoria/logs em segundo plano.
- Confirmação explícita para ações externas reais e irreversíveis.

Não usar service-role no navegador. Não criar bypass de admin. Não remover controles de acesso como forma de corrigir fluxos.

### 2.3 Dados reais

- Não usar arrays locais, dados mockados, listas fixas ou números simulados como estado operacional.
- Sem dados suficientes, mostrar `Sem dados suficientes`.
- Não tratar “função existe”, toast, cache ou teste unitário como prova de persistência.
- Toda escrita precisa sobreviver a salvar → releitura → refresh completo → reabertura.

---

## 3. Estrutura do Desk simples

Organizar a experiência principal em sete grupos:

```text
HOJE
COMERCIAL
CASOS
PESSOAS & FAMÍLIAS
PESQUISA
MARKETING
CONFIGURAÇÃO
```

Não apagar rotas existentes nem alterar dados nesta etapa. A mudança é de hierarquia, filtro, ligação entre sinais e ações, não de destruição de capacidade.

---

## 4. Inventário visual: cada grupo e seus indicadores

### 4.1 Hoje

**Pergunta:** o que precisa acontecer agora e com quem?

#### Conteúdo que deve permanecer

```text
Painel Hoje
Minhas tarefas
Próximas ações
Alertas operacionais
Atividade recente
Pessoas acompanhadas
Pessoa 360 rápida
```

#### Problema atual a corrigir

Painel Hoje não pode ser uma lista longa de pendências, filas, exceções, sinais derivados, tarefas soltas e cartões que não levam a decisão.

#### Indicadores acionáveis obrigatórios

| Indicador | Fonte de dados existente | O que deve abrir | Ação principal |
|---|---|---|---|
| Tarefas vencidas ou para hoje | `tarefas` / views de Ops | Lista filtrada por prazo, responsável e caso | Concluir, reprogramar, reatribuir ou abrir Caso 360 |
| Casos sem próxima ação | `crm_casos` / próxima ação | Casos filtrados | Definir próxima ação |
| Cadências atrasadas | Onboarding, tarefas, atividade, documentos | Pessoa/caso e marco atrasado | Criar/abrir follow-up |
| Documentos aguardando retorno | Solicitações/documentos/pedidos | Documento, participante e caso | Solicitar, revisar ou reprogramar |
| Contratos em rascunho aguardando revisão | Contratos/parâmetros/revisão | Contrato correspondente | Abrir contrato ou criar tarefa de revisão |
| Propostas a vencer | Propostas/validade | Proposta e Caso 360 | Revisar, renovar, preparar contato |
| Atualizações prontas para App Cliente | Micro-entregas, atualizações, comunicação | Conteúdo e caso | Revisar/liberar atualização; não enviar automaticamente |
| Casos sem responsável | `crm_casos` / responsáveis | Caso 360 | Atribuir responsável |
| Casos sem atualização recente | Atividade/cadência | Caso e última interação | Criar próxima ação ou contato interno |

#### Pessoas acompanhadas e Pessoa 360 rápida

Incluir uma busca e cartões de pessoas prioritárias:

```text
Ana Luiza
Caso: CA-CID-AT-FAM-2026-001
Fase: [fase atual]
Próxima ação: [descrição]
Responsável: [nome/papel]
Tarefas abertas: [número]
Documentos pendentes: [número]
Contrato: [rascunho/em revisão/pronto]
Última atualização: [data/hora]
Atualização de app: [não preparada/em revisão/pronta/liberada]

[Ver Pessoa 360] [Abrir Caso 360] [Abrir tarefa]
```

Pessoa 360 é agregação dos registros reais ligados a pessoa, cliente, núcleo e caso. Não criar outra identidade, outro caso ou outro núcleo.

---

### 4.2 Comercial

**Pergunta:** quem está entrando, sendo qualificado ou se tornando caso?

#### Conteúdo

```text
Leads e oportunidades
Discovery
Propostas
Clientes
Condições comerciais
Financeiro do caso
Conversão e origem do lead
```

#### Indicadores acionáveis

| Indicador | Ação |
|---|---|
| Leads sem retorno | Abrir lead, criar tarefa de retorno ou agendar Discovery |
| Discovery sem próxima ação | Definir responsável, prazo e próxima ação |
| Propostas a vencer | Abrir proposta, renovar validade ou preparar contato |
| Propostas aceitas sem caso canônico | Abrir reconciliação controlada, sem criar duplicata automática |
| Casos sem condição comercial | Abrir Comercial do Caso 360 e preparar rascunho |
| Pagamento registrado sem próxima etapa | Criar/atualizar ação de onboarding ou execução |
| Conversão por origem | Abrir origem/campanha/segmento; não mostrar métrica isolada |

#### Fluxo

```text
Campanha/formulário
→ lead
→ discovery
→ oportunidade
→ proposta
→ aceite
→ caso canônico
```

---

### 4.3 Casos

**Pergunta:** o que estamos executando para esta pessoa/família?

#### Conteúdo

```text
Todos os casos
Caso 360
Onboarding
Ordens de Serviço
Entregas e relatórios
```

#### Indicadores acionáveis

| Indicador | Ação |
|---|---|
| Casos por fase | Abrir casos filtrados e sua próxima ação |
| Casos sem responsável | Atribuir responsável |
| Casos sem próxima ação | Definir próxima ação |
| Onboarding não iniciado | Iniciar/retomar onboarding real no mesmo case_id |
| Onboarding parado | Abrir cadência e tarefas atrasadas |
| OS sem responsável/prazo | Abrir OS e criar tarefa correspondente |
| Micro-entregas pendentes | Abrir entrega, revisar, liberar ou criar tarefa |
| Casos sem atualização recente | Preparar próxima atualização interna/app |

#### Caso 360: primeira aba

A primeira aba deve ser síntese de situação, não empilhamento de cards, listas, gates, cadeias e indicadores desconectados.

```text
CASO 360 — [Pessoa/Família]

Situação hoje
Próxima ação: [descrição]
Responsável: [nome/papel]
Prazo: [data ou sem prazo]
Motivo: [fato objetivo]
Impacto: [somente o que é afetado]

[Concluir] [Reprogramar] [Criar tarefa] [Preparar atualização do app]
```

Abaixo, mostrar apenas quatro indicadores de caso:

| Indicador | Leitura | Ação |
|---|---|---|
| Jornada | Onboarding: estado, último touchpoint, próxima etapa | Abrir jornada/tarefas |
| Pessoas | Participantes, pendências individuais e compartilhadas | Abrir Pessoas |
| Contrato | Rascunho/revisão/próxima ação | Abrir contrato |
| Pesquisa | Achados, fontes e pendências prioritárias | Abrir Pesquisa |

Depois, exibir somente:

```text
Próximas 3 tarefas
Últimas 3 atualizações
Documentos que exigem ação
Micro-entregas recentes
```

Todo o restante fica nas áreas do caso ou em Dados técnicos recolhidos.

---

### 4.4 Pessoas & Famílias

**Pergunta:** para quem e com quem estamos trabalhando?

#### Conteúdo

```text
Pessoa 360
Núcleos familiares
Participantes
Relações e linhagens familiares
Dossiês familiares
```

#### Indicadores acionáveis

| Indicador | Ação |
|---|---|
| Participantes sem papel definido | Abrir participante e definir papel/vínculo |
| Núcleo sem contato principal | Definir contato principal |
| Participante com pendência individual | Criar/abrir tarefa da pessoa vinculada ao caso |
| Representação de menor pendente | Abrir participante/representante e preparar ação interna |
| Dados de pessoa aguardando confirmação | Abrir Pessoa 360 e criar decisão/tarefa quando aplicável |
| Possíveis duplicidades | Abrir comparação; nunca fazer merge automático |
| Núcleo/dossiê sem caso canônico | Abrir matriz de reconciliação; não criar outro caso |

#### Regra

Uma pendência individual não deve ser exibida como bloqueio global de toda a família. O indicador precisa dizer:

```text
Pessoa afetada
→ dado/decisão pendente
→ por que importa
→ para qual etapa
→ próxima ação
→ responsável/prazo
```

---

### 4.5 Pesquisa

**Pergunta:** qual evidência sustenta a jornada e o que precisa ser descoberto ou validado?

#### Conteúdo

```text
Painel de pesquisa
Achados genealógicos
Pessoas da pesquisa
Linhagens
Hipóteses
Evidências
Solicitações documentais
Biblioteca de documentos
Bibliotecas genealógicas
Fontes genealógicas
Bases e repositórios
Integrações de pesquisa
Relatórios de pesquisa
```

#### Indicadores acionáveis

| Indicador | Ação |
|---|---|
| Solicitações documentais em atraso | Abrir pedido, pessoa e tarefa de acompanhamento |
| Fontes sem revisão recente | Abrir fonte, definir próxima ação ou tarefa |
| Hipóteses sem evidência | Abrir hipótese e criar tarefa de validação |
| Achados prontos para síntese | Criar micro-entrega ou relatório interno |
| Achados prontos para App Cliente | Preparar atualização, revisar/liberar, sem envio automático |
| Linhagens sem vínculo/caso | Abrir correção de vínculo, sem criar estrutura paralela |
| Bases indisponíveis ou em risco | Abrir fonte/base e tarefa de revisão técnica |

#### Fluxo de pesquisa

```text
Base/repositório
→ fonte genealógica
→ busca/consulta
→ evidência
→ achado
→ hipótese ou confirmação
→ linhagem
→ documento
→ relatório/micro-entrega
→ próxima ação ou tarefa
```

Bibliotecas, fontes, bases e repositórios não devem ser somente listas. Cada item precisa oferecer status de revisão, responsável, próxima ação e vínculo com pesquisa/caso quando aplicável.

---

### 4.6 Marketing

**Pergunta:** como atraímos, nutrimos e convertemos pessoas em casos?

#### Conteúdo

```text
Dashboard de marketing
Produtos e ofertas
Campanhas
Conteúdos
Landing pages
Formulários e captação
Segmentos e públicos
Automação e cadências
Origem de leads
Conversão e funil
Biblioteca de mensagens
Métricas de campanha
```

#### Indicadores acionáveis

| Indicador | Ação |
|---|---|
| Leads por origem | Abrir segmento/origem e oportunidades associadas |
| Leads sem sequência | Criar tarefa/cadência interna; não enviar automaticamente |
| Landing/formulário sem conversão | Abrir campanha/formulário para revisão |
| Propostas por campanha | Abrir oportunidades e proposta associada |
| Conversão por origem | Abrir canais com contexto de volume e receita real |
| CAC/CPL/ROI | Mostrar somente com dados suficientes; abrir composição do cálculo |
| Oferta contextual pronta | Abrir micro-entrega/SKU/copy para revisão |
| Biblioteca de mensagens sem conteúdo editável | Expor editor real ou indicar lacuna operacional; não deixar lista morta |

Marketing pode consultar catálogo e preços, mas não deve manter uma segunda fonte de verdade de SKU, valor, link de cobrança ou condição comercial.

---

### 4.7 Configuração

**Pergunta:** como a operação se mantém segura, consistente e administrável?

#### Conteúdo

```text
Perfil institucional
Catálogo e preços
Equipe e acessos
Integrações operacionais
Modelos e templates
Parâmetros do sistema
Dados técnicos
Qualidade e auditoria
```

#### Indicadores acionáveis

| Indicador | Ação |
|---|---|
| Perfil institucional incompleto | Abrir perfil e editar dados institucionais na superfície correta |
| SKU/preço/link inconsistente | Abrir catálogo e reconciliação correspondente |
| Integração com erro | Abrir integração e diagnóstico técnico |
| Modelo/template desatualizado | Abrir modelo para revisão/versionamento |
| Membro de equipe sem acesso adequado | Abrir equipe/acesso e corrigir dentro da organização |
| Qualidade/integridade com falha | Abrir detalhe técnico recolhido, nunca bloquear todo Desk |

Configuração não deve conter bibliotecas, fontes, bases e repositórios genealógicos: esses pertencem à Pesquisa.

---

## 5. Motor único: sinal → ação → cadência

Substituir o padrão de listas isoladas por um motor de consequência operacional.

### 5.1 Estrutura do sinal

Todo sinal operacional deve ter:

```text
origem
entidade_origem
entidade_id
case_id
person_id/participant_id quando aplicável
organization_id
prioridade
estado
motivo
impacto
responsável
prazo
próxima_ação
referência_da_tarefa
visibilidade_no_app
```

Não criar uma tabela nova se tarefas, próximas ações, alertas, onboarding, micro-entregas e registros existentes já permitirem representar a estrutura. Reutilizar primeiro; migration aditiva somente se inevitável.

### 5.2 Tipos de consequência

Após identificar ou salvar uma situação relevante, o sistema deve permitir:

1. Criar tarefa.
2. Atualizar tarefa existente.
3. Atualizar próxima ação do caso.
4. Reprogramar cadência.
5. Criar micro-entrega interna.
6. Preparar atualização para App Cliente.
7. Marcar explicitamente `Sem nova ação necessária`.

A escolha deve ser clara, mas não pode bloquear o salvamento do dado principal.

### 5.3 Idempotência

Não criar duplicata a cada visualização ou salvamento.

Usar um identificador lógico, por exemplo:

```text
case_id + origem + referência_da_entidade + estado_aberto
```

Se já existir tarefa aberta relacionada à mesma pendência, atualizar/reabrir a tarefa existente em vez de criar outra.

---

## 6. Cadência universal de onboarding

Onboarding não é apenas checklist ou tela. É uma cadência operacional aplicável a todos os casos, parametrizada por serviço, país, rota, escopo e composição familiar.

```text
Onboarding por case_id
→ última interação
→ próximo touchpoint
→ próxima ação
→ responsável
→ participante/família envolvida
→ prazo
→ tarefa
→ micro-entrega
→ atualização preparada para App Cliente
```

### Cadência-base

| Marco | Sinal | Ação interna | Resultado no Caso 360 | Reflexo no App Cliente |
|---|---|---|---|---|
| D0 — entrada | Caso criado/assumido | Definir contato principal, responsável e primeira ação | Onboarding rascunho/ativo | Jornada iniciada, quando liberada |
| D1–D3 — coleta | Dados/documentos iniciais pendentes | Criar tarefas individuais/familiares | Tarefas e prazo | Próximos passos claros |
| D4–D7 — primeira leitura | Material recebido ou pesquisa inicial | Registrar achado, hipótese ou primeira micro-entrega | Micro-entrega e ação seguinte | Primeira leitura da jornada, quando autorizada |
| D8–D10 — follow-up | Sem resposta ou documento pendente | Abrir/reprogramar tarefa de acompanhamento | Cadência atrasada e responsável | Lembrete contextual preparado, nunca enviado automaticamente |
| D11–D14 — escalonamento | Pendência permanece aberta | Repriorizar, revisar ou solicitar decisão humana | Próxima ação reprogramada | Atualização de situação, quando liberada |
| Pesquisa em progresso | Evidência/achado criado | Validar, relacionar e definir consequência | Pesquisa + tarefa/micro-entrega | Descoberta liberada somente após revisão |
| Contrato/OS | Rascunho/editado/revisado | Criar tarefa operacional correspondente | Execução atualizada | Atualização apenas quando apropriada |
| Fechamento de etapa | Micro-entrega concluída | Criar próxima etapa | Marco e próxima ação | Novo capítulo/progresso visível |

### Exemplo obrigatório

```text
Sinal: pedido de dados de João está atrasado há 3 dias.
Caso: Ana Luiza / núcleo familiar.
Pessoa responsável por revisar: Ana Luiza.
Responsável interno: Tatiana.
Impacto: impede somente a organização documental de João.
Não bloqueia rascunho de contrato, pesquisa, tarefa ou OS.

Ações disponíveis:
[abrir tarefa] [reprogramar] [marcar recebimento] [preparar atualização do app]

Atualização de app preparada:
“Ana, precisamos confirmar os dados de João para avançar na organização
 da etapa familiar. Assim que você revisar essas informações, atualizamos
 a linha de documentos da família.”

Nenhuma mensagem externa deve ser enviada automaticamente.
```

---

## 7. Desk → App Cliente

O Desk controla e prepara; o App Cliente recebe apenas informação liberada e compreensível.

### Estados de atualização

```text
interna
pronta_para_revisao
aprovada_para_app
liberada_no_app
arquivada
```

### O Desk deve permitir

- Criar uma atualização a partir de tarefa, documento, achado, micro-entrega ou marco.
- Relacionar atualização ao mesmo `case_id`.
- Indicar participante/família destinatária quando aplicável.
- Revisar antes de liberar.
- Liberar no App Cliente somente conforme visibilidade autorizada.
- Registrar a liberação no histórico.
- Preparar rascunho de comunicação externa separadamente, sem envio automático.

### O App Cliente deve mostrar

- Próximo passo familiar ou individual.
- Documento solicitado/recebido quando liberado.
- Entrega ou descoberta aprovada.
- Marco de jornada.
- Atualização clara e não técnica.

O App Cliente não deve mostrar:

- Gates.
- NO_GO.
- Listas internas de auditoria.
- Dados técnicos de banco.
- Hipóteses não revisadas.
- Informações privadas de outro participante sem necessidade.
- Tokens, APIs, custos internos ou regras de matching.

---

## 8. O que retirar do topo

Não usar como conteúdo dominante de Hoje ou Caso 360:

```text
NO_GO
GO_CONDICIONAL
Bloqueado pelo elo anterior
Gates A–H
Checklist de governança
Lista estática de bloqueios
Biblioteca sem status/ação
Tabela sem contexto no mobile
Indicador sem destino
Botão desabilitado sem fluxo real
```

Dados técnicos podem existir em seção recolhida:

```text
Dados técnicos e validações
- requisitos de ativação;
- integridade da cadeia;
- auditoria;
- critérios de serviço;
- status de integração;
- diagnósticos de inconsistência.
```

Esses dados não podem bloquear edição, rascunho, pesquisa, tarefa, documento, proposta rascunho, contrato rascunho ou OS.

---

## 9. Mobile-first

O Desk deve ser utilizável no celular para consulta e ações essenciais.

Obrigatório:

- Transformar tabelas de informação essencial em cards no viewport estreito.
- Usar acordeões para bibliotecas, detalhes técnicos, histórico e listas extensas.
- Mostrar primeiro indicador, pessoa/caso, próxima ação e botão de execução.
- Não esconder conteúdo importante em rolagem horizontal sem alternativa.
- Garantir que inputs, selects, datas e botões tenham largura e toque adequados.
- Garantir que teclado aberto não esconda botão Salvar ou ação de conclusão.
- Reservar safe area inferior.
- Impedir que assistente flutuante cubra campos, listas, botões ou ações.
- Manter código do caso/aliases sem quebra inadequada; rolagem horizontal somente quando necessária.

---

## 10. Persistência e confirmação

Toda ação criada por indicador/cadência deve seguir:

```text
Executar ação
→ gravar no Supabase
→ confirmar linha afetada
→ reler mesma entidade por mesmo ID
→ comparar dados relevantes
→ atualizar cache
→ informar resultado
→ refresh completo
→ confirmar que sinal, tarefa, próxima ação e atualização permanecem
```

Não considerar concluído por:

- Toast.
- Estado local.
- Cache.
- Função existente.
- CI verde.
- Build verde.
- Tela renderizada.
- Teste mockado.

---

## 11. Ordem de implementação

Não redesenhar todo o Desk em uma única PR.

### Fase 1 — Hoje e Caso 360

Implementar primeiro, com dados existentes:

1. Faixa de decisões prioritárias no Hoje.
2. Cadências atrasadas no Hoje.
3. Pessoas acompanhadas e Pessoa 360 rápida no Hoje.
4. Atualizações preparadas para App Cliente.
5. Nova síntese da primeira aba do Caso 360.
6. Indicadores de Jornada, Pessoas, Contrato e Pesquisa.
7. Três tarefas, três atualizações, documentos prioritários e micro-entregas recentes.

### Fase 2 — Motor sinal → tarefa/próxima ação

1. Aplicar consequências aos sinais de documentos, participantes, pesquisa, proposta, contrato, OS e onboarding.
2. Garantir idempotência.
3. Garantir vínculo de tarefa com `case_id` e participante quando aplicável.
4. Garantir persistência após refresh.

### Fase 3 — Cadência de onboarding

1. Criar ou recuperar onboarding por `case_id`.
2. Materializar tarefas e primeira micro-entrega.
3. Mostrar cadência no Caso 360 e Hoje.
4. Preparar atualizações de App Cliente.

### Fase 4 — Demais grupos

Aplicar o mesmo padrão de indicadores acionáveis em Comercial, Pessoas & Famílias, Pesquisa, Marketing e Configuração.

### Fase 5 — Revisão de layout global

Somente depois de o fluxo de Ana estar operável, persistente e com continuidade real, aplicar o prompt separado de revisão de layout e marca.

---

## 12. Critérios de aceite

### Hoje

- Cada indicador abre uma lista filtrada com ação real.
- Casos e pessoas prioritárias mostram próxima ação, responsável e prazo.
- Cadência atrasada mostra quem precisa agir, o impacto e a tarefa correspondente.
- Atualizações de app podem ser preparadas/revisadas/liberadas sem envio externo automático.
- Sem dados suficientes, exibir essa mensagem em vez de números falsos.

### Caso 360

- A primeira aba apresenta situação atual, próxima ação, responsável, prazo, motivo e impacto.
- Mostra somente indicadores úteis de Jornada, Pessoas, Contrato e Pesquisa.
- Não é uma pilha de listas, gates, cadeias, métricas e cards desconectados.
- Permite abrir/criar tarefa, reprogramar e preparar atualização do App Cliente.

### Tarefas e cadência

- Tarefa usa mesmo `case_id` da situação que a originou.
- Tarefa individual referencia participante/pessoa quando aplicável.
- Tarefas não duplicam em novos saves/refetches.
- Casos sem próxima ação aparecem no Hoje.
- Onboarding materializa tarefas e micro-entregas reais, sem criar caso/núcleo duplicado.

### Persistência

- Salvar sinal/ação → confirmar banco → refresh → reabrir → manter o mesmo estado.
- Falha de gravação deve ser explícita, nunca silenciosa.

### Segurança

- RLS, sessão, organização, permissões e auditoria em segundo plano permanecem intactos.
- Ações externas mantêm confirmação explícita contextual.

---

## 13. Proibições

Não fazer nesta implementação:

- Não criar novo caso, núcleo, cliente, pessoa ou participante para teste.
- Não mesclar ou unificar núcleos automaticamente.
- Não apagar dados, tabelas, documentos, contratos, propostas, tarefas ou histórico.
- Não executar `DROP TABLE`, `TRUNCATE`, reset de banco ou migration destrutiva.
- Não criar lista estática de pendências/bloqueios.
- Não criar dashboards com números simulados.
- Não reintroduzir Modo Proprietária, reconfirmação, auditoria bloqueante ou gates cerimoniais.
- Não disparar WhatsApp, e-mail, cobrança, assinatura ou convite externo automaticamente.
- Não alterar RLS, sessão, autenticação, isolamento por organização ou logs.
- Não iniciar revisão global de marca/layout antes de a Fase 1 estar operável e validada.

---

## Regra final

> O Desk não deve apenas mostrar o estado do trabalho. Ele deve orientar a decisão, criar continuidade e tornar explícito o próximo passo de cada pessoa e caso.

```text
Indicador útil.
Pessoa identificada.
Caso canônico.
Próxima ação clara.
Tarefa quando necessária.
Cadência visível.
Atualização preparada para o app.
Nenhum trabalho perdido.
```
