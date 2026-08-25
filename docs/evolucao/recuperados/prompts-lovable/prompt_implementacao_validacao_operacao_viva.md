# Prompt de Implementação e Validação — Operação Viva

## Objetivo

Transformar capacidades já configuradas, documentadas ou implementadas localmente em fluxos **operacionais, auditáveis e comprovados**, sem assumir que a existência de código, template, integração configurada ou arquivo histórico é prova de uso real.

Este prompt cobre somente lacunas classificadas como:

- `CONFIGURADO_PENDENTE_DE_TESTE`
- `DOCUMENTADO_SEM_IMPLEMENTACAO`
- `PENDENTE_DE_IMPLEMENTACAO`
- `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO`
- `PENDENTE_DE_VERIFICACAO_DIRETA`

Não autoriza criação de dados fictícios, alterações financeiras, envio de comunicações, publicação para cliente, assinatura, cobrança, pesquisa externa, alteração de RLS, migration ou deploy sem comando explícito posterior.

---

## Princípio de verdade operacional

Considere uma capacidade como **aplicada no dia a dia** somente se atender simultaneamente aos critérios abaixo:

1. Existe um dono operacional definido.
2. Existe uma fonte de verdade única e declarada.
3. O identificador canônico está definido e reconciliado.
4. A entrada, alteração e leitura possuem fluxo explícito.
5. Há evidência de execução com dado real ou cenário de homologação autorizado.
6. Há controle de falha, auditoria e reversibilidade quando aplicável.
7. A prova foi repetida no ambiente publicado quando a capacidade depende de sessão, permissão, RLS, URL assinada ou integração.

Se qualquer critério falhar, registrar a capacidade como **não comprovada para operação viva**, indicando a lacuna exata. Nunca promover status por inferência.

---

## Escopo obrigatório

### Frente 1 — Identificadores e fontes de verdade

Auditar e preparar plano de reconciliação para:

- `Case_ID`: eleger uma única convenção e uma única fonte proprietária; não criar um terceiro ID.
- `Lead_ID`, `Contact_ID`, `Opportunity_ID`, `Client_ID`, `Family_ID`, `Proposal_ID`, `Contract_ID`, `Order_Service_ID` e IDs de anexos: registrar proprietário, formato, regra de geração, vínculo e estado de reconciliação.
- CRM, Desk/Dossiê, Planejador Universal, Planilha Mestre, Asaas, Drive e Dropbox: confirmar a precedência por domínio.

### Frente 2 — CRM, tarefas e cronograma

Mapear o fluxo real e eleger uma fonte ativa para cada domínio:

- Lead, oportunidade, aceite e handoff comercial.
- Tarefa operacional.
- Marco, prazo e cronograma.
- Evento de calendário.

Verificar sobreposições entre CRM/Painel, Pipeline legado, Pipeline de Vendas, OPS Tarefas, Google Tasks, Planejador Universal, Google Calendar e arquivos `.ics`.

Não integrar sistemas ainda. Primeiro, definir e comprovar qual deles é a fonte ativa por domínio.

### Frente 3 — Catálogo, preço e financeiro

Verificar a cadeia:

`SKU → preço/condição vigente → proposta → link de pagamento → cobrança → pagamento → reconciliação`

Para cada SKU em uso operacional:

- Confirmar status e preço na Planilha Mestre.
- Identificar links Asaas ativos, ausentes, duplicados ou sem SKU associado.
- Separar produto sem link, link sem produto, múltiplos links para o mesmo produto e links com condição divergente.
- Confirmar que pagamento não altera preço, escopo ou elegibilidade.
- Impedir que SKU pendente, arquivado ou não conciliado seja exposto como oferta, cobrança ou jornada ativa.

Não criar, editar, desativar ou publicar produtos, links, cobranças ou assinaturas nesta etapa.

### Frente 4 — Planejador e operação de caso

Verificar antes de qualquer uso com dados vivos:

- IDs duplicados.
- Erros de fórmula, incluindo erros em resumos de casos.
- Relação entre case, marcos, responsáveis, tarefas, fases e alertas.
- Regra de precedência entre Planejador, Desk e calendário.
- Coerência entre próxima ação, último elo pendente, responsável e prazo.

O Planejador só poderá ser promovido a fonte operacional ativa após a correção e a validação de todos os bloqueios encontrados.

### Frente 5 — Portal do Cliente e produção autenticada

Preparar um roteiro E2E somente leitura que comprove no domínio publicado:

- Login de usuário interno autorizado.
- Login de usuário cliente de homologação autorizado.
- Acesso ao Desk e às rotas administrativas conforme papel.
- Persistência de sessão após reload.
- Exibição de apenas casos autorizados no portal.
- Bloqueio de URL direta para caso de outro cliente.
- Estado vazio seguro quando não houver conteúdo publicado.
- Exibição de conteúdo somente quando aprovado, sanitizado, vigente e permitido por RLS.
- Ausência de SKU, preço, gate, SLA, hipótese, evidência bruta e conteúdo interno no portal.

A execução deve usar sessão de homologação autorizada e caso de homologação classificado como real, sem usar fixture ou dado demo como prova de conteúdo real.

### Frente 6 — Integrações e automações

Mapear, sem ativar, cada integração configurada ou planejada:

- Webhook CRM.
- Logs de integração.
- Asaas.
- Google Drive.
- Google Calendar.
- Google Tasks.
- Google Forms.
- WhatsApp/Meta.

Para cada uma, registrar:

- Objetivo.
- Evento de entrada.
- Dados mínimos.
- Sistema produtor e consumidor.
- Credencial necessária.
- Idempotência e chave de deduplicação.
- Log/auditoria.
- Política de falha.
- Estado atual: inexistente, configurada, testada em homologação, comprovada em produção ou bloqueada.

WhatsApp/Meta, disparos, pixels, campanhas, webhooks de envio e comunicação externa permanecem desligados.

---

## Entregáveis exigidos

Produza os itens abaixo, sem executar efeitos externos:

1. **Matriz de prontidão operacional**
   - Capacidade
   - Dono
   - Fonte de verdade
   - ID canônico
   - Ambiente
   - Evidência existente
   - Lacuna
   - Risco
   - Ação mínima
   - Critério de pronto
   - Estado final

2. **Matriz de reconciliação de identificadores**
   - Entidade
   - IDs encontrados
   - Fonte proprietária proposta
   - Conflito
   - Decisão humana necessária
   - Plano de migração ou conciliação

3. **Inventário de integrações**
   - Integração
   - Direção do dado
   - Estado
   - Gatilho
   - Chave de idempotência
   - Evidência de teste
   - Próximo teste permitido
   - Bloqueio

4. **Roteiro E2E publicado e autenticado**
   - Pré-requisitos de sessão e dados de homologação
   - Casos de teste
   - Resultado esperado
   - Evidência a capturar
   - Critério de aprovação/reprovação

5. **Backlog priorizado**
   - P0: bloqueia operação viva ou segurança
   - P1: necessário antes de escala
   - P2: melhoria pós-operação
   - Sem classificar como resolvido sem evidência direta.

6. **Changelog e relatório de validação**
   - Arquivos lidos/alterados, se houver
   - Testes executados
   - Resultado de typecheck e build, se código for alterado
   - Nenhuma ação externa executada
   - Lista de decisões humanas pendentes

---

## Critérios de aceite

Uma capacidade poderá ser marcada `OPERACIONAL_COMPROVADA` apenas quando houver:

- Fonte de verdade única efetiva.
- Identificador reconciliado ou decisão formal de coexistência.
- Fluxo com dono responsável.
- Evidência executável de leitura e, quando autorizado, de escrita controlada.
- Teste autenticado em produção para funções dependentes de autenticação, RLS ou sessão.
- Registro de erro/falha sem promoção silenciosa de estado.
- Ausência de dado demo usado como prova de operação real.

Estados permitidos:

- `OPERACIONAL_COMPROVADA`
- `OPERACIONAL_COM_RESSALVAS`
- `IMPLEMENTADO_LOCAL`
- `CONFIGURADO_PENDENTE_DE_TESTE`
- `DOCUMENTADO_SEM_IMPLEMENTACAO`
- `PENDENTE_DE_VALIDACAO_HUMANA`
- `BLOQUEADO_POR_GATILHO`
- `NAO_LOCALIZADO_NESTA_SESSAO`

---

## Proibições

Não realizar, nesta etapa:

- Envio de e-mail, WhatsApp, SMS ou qualquer comunicação externa.
- Publicação de conteúdo para clientes.
- Criação de leads, casos, campanhas, UTMs, pagamentos, cobranças, assinaturas, contratos ou ordens de serviço.
- Alteração de preço, SKU, catálogo, link de cobrança, RLS, trigger, migration ou dados existentes.
- Deploy, alteração de domínio, conexão de API ou criação de credenciais.
- Pesquisa externa, diligência documental ou consulta paga.
- Uso de dados demo ou fixture como evidência de operação real.

Se qualquer etapa exigir escrita, apresentar antes: alvo resolvido, dados exatos a alterar, impacto, reversibilidade e uma solicitação de autorização específica.

---

## Ordem de execução

1. Ler o estado atual e produzir a matriz de prontidão sem alterar nada.
2. Identificar P0s e decisões humanas pendentes.
3. Preparar artefatos de reconciliação e roteiros de teste.
4. Solicitar autorização separada para cada alteração ou teste que demande sessão, credenciais, escrita ou ação externa.
5. Após cada rodada autorizada, atualizar somente com evidência verificável.

---

## Formato da devolutiva

Comece com uma conclusão objetiva:

> “X capacidades estão operacionais comprovadas; Y permanecem locais/configuradas; Z estão bloqueadas por decisão, dado, reconciliação ou teste autenticado.”

Em seguida, entregue:

1. Tabela de prontidão operacional.
2. Bloqueios P0 e decisão necessária.
3. Próxima ação mínima, sem efeitos externos.
4. Evidências e limitações.

Não declarar go-live, automação ativa ou operação viva sem evidência direta.