# Prompt para Claude — Autoridade Admin, Mapa Desk e App Cliente

**Projeto:** `tatianatosi/soul-ancestry`  
**Infraestrutura:** Supabase próprio + Vercel + GitHub  
**Prioridade:** confirmar e tornar efetiva a autoridade administrativa da proprietária dentro da própria organização, sem remover RLS, sessão, permissões, isolamento organizacional ou auditoria em segundo plano.

---

## 1. Objetivo

A proprietária precisa conseguir trabalhar no próprio aplicativo com autoridade operacional real.

Isso significa:

```text
abrir
→ editar
→ salvar
→ confirmar linha afetada
→ reler do banco
→ refresh completo
→ encontrar o mesmo valor
→ criar/atualizar tarefa ou próxima ação quando aplicável
```

Não basta que o usuário esteja classificado como `admin` no banco. A autoridade só é efetiva quando a proprietária consegue operar os fluxos internos da própria organização e o trabalho dela não desaparece.

---

## 2. Regras obrigatórias

Manter obrigatoriamente:

- RLS.
- Login e sessão.
- Permissões por organização e usuário.
- Isolamento de dados por organização.
- Auditoria/logs em segundo plano.
- Confirmação explícita somente para ações externas reais e irreversíveis.

Não fazer:

- Não remover RLS.
- Não usar `service_role` no navegador.
- Não remover sessão/login/autenticação.
- Não criar bypass genérico de admin.
- Não criar outro caso, cliente, pessoa, núcleo, dossiê, proposta, contrato ou onboarding para contornar falhas.
- Não apagar dados nem executar `DROP TABLE`, `TRUNCATE`, reset de banco ou migration destrutiva.
- Não tratar CI verde, toast, estado local, cache, função existente ou tela renderizada como prova de persistência.
- Não disparar e-mail, WhatsApp, cobrança, assinatura, convite externo ou pesquisa externa automaticamente.

---

## 3. Pergunta a responder

Para cada grupo e rota abaixo, responder de forma verificável:

```text
A proprietária/admin consegue ler?
A proprietária/admin consegue criar?
A proprietária/admin consegue editar?
A proprietária/admin consegue arquivar?
A proprietária/admin consegue concluir/reprogramar?
A ação persiste após refresh?
A ação gera próxima ação/tarefa quando aplicável?
A rota é leitura deliberada, ação externa ou lacuna de implementação?
```

Não responder por inferência ou descrição de código. Mapear rota → componente → handler → server function → tabela/RPC → política/estado → releitura.

---

## 4. Classificações obrigatórias

Para cada item, usar somente uma classificação principal:

| Classificação | Significado |
|---|---|
| `HABILITADA_E_VALIDADA` | Ação funciona com dados reais, confirma gravação, releitura e refresh. |
| `HABILITADA_EM_CODIGO_AGUARDANDO_TESTE` | Existe em código/PR, mas a proprietária ainda não homologou no preview e banco. |
| `PARCIAL` | Parte do fluxo funciona, mas falta UI, persistência, releitura, vínculo, tarefa, próxima ação ou etapa complementar. |
| `BLOQUEADA_POR_REGRA_DE_ESTADO` | A ação exige condição real e específica, como assinatura, pagamento, consentimento ou ativação formal. |
| `ACAO_EXTERNA_NAO_IMPLEMENTADA` | Depende de integração real e confirmação explícita; não deve ser simulada. |
| `SOMENTE_LEITURA_DELIBERADA` | É matriz, inventário, relatório, indicador, auditoria ou referência sem escrita planejada. |
| `SEM_UI_PARA_FUNCAO_EXISTENTE` | Função/tabela existe, mas não há superfície operável. |
| `SEM_FUNCAO_OU_SCHEMA` | Não existe motor/tabela/RPC necessário para a capacidade desejada. |
| `COM_ERRO_OU_RISCO_CONHECIDO` | Há erro confirmado, schema divergente, constraint, escrita zero-linha ou leitura/escrita em entidades diferentes. |

Nunca chamar de “bloqueio” algo que seja apenas tela de leitura, função ausente, botão sem handler, requisito de ação externa ou dado não persistido.

---

## 5. Mapa obrigatório — Desk

### 5.1 Hoje

| Aba/área | Capacidades a verificar |
|---|---|
| Painel Hoje | Alertas, tarefas, próximas ações, atividade e itens derivados; cada indicador abre uma ação real? |
| Minhas tarefas | Listar, abrir, criar, editar, concluir, reprogramar e persistir tarefas. |
| Próximas ações | Editar próxima ação do caso, responsável e prazo; persistir. |
| Alertas operacionais | Abrir causa, pessoa/caso afetado e ação correspondente. |
| Atividade recente | Leitura de histórico; confirmar se é intencionalmente somente leitura. |
| Pessoas acompanhadas | Abrir Pessoa 360 e Caso 360 a partir de pessoa prioritária. |
| Pessoa 360 rápida | Consolidar dados reais de pessoa, caso, tarefas, documentos, contrato, OS, pesquisa e histórico sem criar identidade paralela. |

### 5.2 Comercial

| Aba/área | Capacidades a verificar |
|---|---|
| Leads e oportunidades | Criar, editar, converter, arquivar e definir próxima ação. |
| Discovery | Registrar dados, responsável, retorno e consequência operacional. |
| Propostas | Criar rascunho, editar, vincular ao mesmo case_id, revisar e persistir. |
| Clientes | Criar, editar dados básicos, ativar, reclassificar e arquivar sem duplicidade. |
| Condições comerciais | Criar/editar condição, vincular a proposta/caso e confirmar persistência. |
| Financeiro do caso | Registrar leitura/condição/pagamento manual quando houver função; separar de cobrança externa. |
| Conversão e origem | Consultar indicadores reais e abrir leads/propostas/casos relacionados. |

### 5.3 Casos

| Aba/área | Capacidades a verificar |
|---|---|
| Todos os casos | Buscar, filtrar e abrir caso canônico. |
| Caso 360 — Visão geral | Abrir sem depender de gate, Planejador, pagamento, contrato assinado ou portal. Editar próxima ação/responsável/prazo. |
| Caso 360 — Pessoas | Abrir, editar e vincular participantes/núcleo sem criar caso paralelo. |
| Caso 360 — Tarefas | Criar/editar/concluir/reprogramar tarefas do case_id. |
| Caso 360 — Pesquisa | Abrir e registrar achados, hipóteses, fontes, evidências e pedidos. |
| Caso 360 — Documentos | Registrar documentos, solicitações e visibilidades; distinguir metadado de upload real. |
| Caso 360 — Comercial | Abrir Discovery, proposta, condição e financeiro do mesmo case_id. |
| Caso 360 — Execução | Contrato, OS, onboarding, micro-entregas, marcos e comunicação interna. |
| Onboarding | Criar ou recuperar onboarding único por case_id; gerar primeira micro-entrega, tarefas e próxima ação. |
| Ordem de Serviço | Criar, editar escopo/observação, mudar status permitido e persistir. |
| Entregas e relatórios | Criar/editar/liberar entrega interna e preparar publicação no App Cliente conforme regra. |

### 5.4 Pessoas & Famílias

| Aba/área | Capacidades a verificar |
|---|---|
| Pessoa 360 | Dados, casos, tarefas, documentos, pesquisa, contrato e histórico agregados. |
| Núcleos familiares | Criar/editar núcleo, dossiê e vínculo com caso. |
| Participantes | Criar/editar papel, vínculo, contato, visibilidade, contratante, dependente e representação. |
| Relações e linhagens familiares | Criar/editar relação/linhagem usando valores aceitos pelo schema. |
| Dossiês familiares | Editar dossiê e vínculo canônico. |
| Duplicidades | Detectar e comparar; nunca mesclar automaticamente. |

Obrigatório mapear a fonte canônica e as pontes entre:

```text
nucleo_membros
case_members
case_dependents
pessoas
participantes
```

Não permitir que uma tela grave em uma entidade e outra releia outra sem sincronização explícita.

### 5.5 Pesquisa

| Aba/área | Capacidades a verificar |
|---|---|
| Painel de pesquisa | Visão de casos, pendências, responsáveis e próxima ação. |
| Achados genealógicos | Criar/editar/arquivar e vincular a caso/pessoa/linhagem. |
| Pessoas da pesquisa | Criar/editar perfil, variantes, eventos e identificação. |
| Linhagens | Criar/editar e relacionar pessoas/achados/evidências. |
| Hipóteses | Criar/editar, separar de evidência confirmada e criar tarefa de validação quando necessário. |
| Evidências | Registrar, validar, relacionar e arquivar com histórico. |
| Solicitações documentais | Criar/editar/encerrar e gerar tarefa de acompanhamento. |
| Biblioteca de documentos | Consulta, vínculo e ação de uso no caso. |
| Bibliotecas genealógicas | Mostrar status, responsável, próxima ação e vínculo; não apenas lista. |
| Fontes genealógicas | Editar status, risco, responsável e próxima ação; confirmar persistência. |
| Bases e repositórios | Consulta/revisão de catálogo de fontes, sem expor credenciais. |
| Integrações de pesquisa | Exibir estado real e separar de pesquisa externa efetiva. |
| Relatórios de pesquisa | Criar/editar/arquivar e vincular evidências/entregas. |

### 5.6 Marketing

| Aba/área | Capacidades a verificar |
|---|---|
| Dashboard de marketing | Métricas reais; sem dados suficientes em vez de zeros falsos. |
| Produtos e ofertas | Consultar catálogo/SKU; não duplicar fonte de preço. |
| Campanhas | Criar/editar/publicar internamente quando houver motor. |
| Conteúdos | Criar/editar e vincular a campanha/oferta. |
| Landing pages | Verificar se há editor, integração ou apenas referência. |
| Formulários e captação | Verificar entrada real de leads e origem. |
| Segmentos e públicos | Criar/editar segmentação, sem mensagem automática. |
| Automação e cadências | Criar rascunhos/tarefas; mensagens externas só mediante integração/confirmação. |
| Origem de leads | Leitura e ligação com conversão. |
| Conversão e funil | Métricas e abertura de itens relacionados. |
| Biblioteca de mensagens | Criar/editar texto e status de templates; não apenas trocar estado. |
| Métricas de campanha | CAC/CPL/ROI apenas se houver dados para cálculo. |

### 5.7 Configuração

| Aba/área | Capacidades a verificar |
|---|---|
| Perfil institucional | Editar dados oficiais uma única vez; contrato deve reutilizar. |
| Catálogo e preços | Criar/editar/homologar itens com fonte única de SKU, preço e condição. |
| Equipe e acessos | Convidar, ativar, editar papel e preservar isolamento por organização. |
| Integrações operacionais | Editar configurações internas, pausar/reativar conforme estado real. |
| Modelos e templates | Criar/editar/versionar modelos e mensagens. |
| Parâmetros do sistema | Editar parâmetros permitidos e persistir. |
| Dados técnicos | Leitura técnica/referência; não pode bloquear trabalho interno. |
| Qualidade e auditoria | Leitura e tratamento de itens quando houver função; não virar gate de operação diária. |

---

## 6. Mapa obrigatório — App Cliente

O App Cliente é uma visualização segura da jornada do caso/núcleo. Não é uma cópia do caso e não deve criar novo `case_id`.

### 6.1 Painel

- Exibir etapa atual, próximo passo, atualizações liberadas, entregas e alertas permitidos.
- Verificar se existe leitura de dados reais e se a liberação é controlada.
- Não exibir notas internas, gates, auditoria, tokens ou regras técnicas.

### 6.2 Árvore

- Exibir árvore simples e modo robusto quando aplicável.
- Mostrar somente pessoas e relações com visibilidade autorizada.
- Verificar GEDCOM/importação/deduplicação como funcionalidade real, parcial ou futura.

### 6.3 Cidadania

- Exibir trilha, documentos liberados, status e próximos passos.
- Não apresentar hipótese não revisada como elegibilidade confirmada.
- Verificar se o conteúdo vem do caso canônico e não de estrutura paralela.

### 6.4 Memória

- Biblioteca de relatos, fotos, entrevistas, cronologia afetiva e materiais liberados.
- Verificar CRUD interno e regra de liberação para o cliente.

### 6.5 Legado

- Micro-entregas, relatórios, linha do tempo, forças/legados e conteúdos aprovados.
- Verificar se entregas possuem visibilidade e publicação real, não apenas cards estáticos.

### 6.6 Documentos

- Documentos compartilhados, pedidos e status autorizados.
- Distinguir metadado de upload real de arquivo.
- Verificar pedido → recebimento → revisão → liberação, quando aplicável.

### 6.7 Alertas

- Atualizações liberadas, próximos passos e lembretes contextualizados.
- Confirmar que não dispara comunicação externa sem confirmação e integração.

### 6.8 Acesso

- Convites, níveis de acesso, participantes e visibilidade familiar/individual.
- Verificar `proposal_portal` como possível revisão antes da assinatura e `client_workspace` apenas conforme regra real de estado.
- Não usar portal completo como bloqueio para criar rascunhos internos ou iniciar onboarding interno.

---

## 7. De–para: autoridade técnica → autoridade efetiva

| Situação atual | Problema | Resultado exigido |
|---|---|---|
| Admin reconhecida em `user_roles`/`staff_access` | O papel existe, mas algumas telas não possuem fluxo de trabalho validado. | Admin abre e opera registros da própria organização. |
| Botão/formulário existe | Pode salvar apenas estado local ou zero linhas. | Confirmação de linha afetada, releitura e refresh. |
| Função de servidor existe | Pode não ter UI ou não ser acionada. | Ação disponível no contexto correto da tela. |
| Checklist/gate exibido | Pode dominar a experiência e bloquear rascunho. | Dados técnicos recolhidos; regra aplicada somente na ação correspondente. |
| Pendência exibida | Pode virar lista sem continuidade. | Pendência → tarefa/próxima ação/sem ação necessária. |
| Onboarding abre tela | Pode não materializar plano ou tarefas. | Um onboarding real por case_id, tarefas, micro-entrega e cadência. |
| App Cliente exibe card | Pode ser estático ou duplicar caso. | Conteúdo real liberado a partir do mesmo case_id. |

---

## 8. Próxima ação e tarefa obrigatórias

Depois de uma alteração relevante, o sistema deve permitir uma destas três saídas:

1. Criar tarefa vinculada ao mesmo `case_id`.
2. Atualizar a próxima ação do caso.
3. Registrar explicitamente `Sem nova ação necessária`.

Não bloquear o salvamento do dado principal por essa decisão.

Toda tarefa deve possuir:

```text
case_id obrigatório
participante/pessoa quando aplicável
título
status
responsável
prioridade
origem
prazo opcional para rascunho
```

Aplicar progressivamente a alterações de:

- participante/núcleo;
- documento/pedido documental;
- achado, evidência, fonte e hipótese;
- proposta;
- contrato, cláusula e anexo;
- OS;
- micro-entrega;
- mudança de fase/prazo;
- onboarding.

---

## 9. Onboarding real

A implementação deve garantir:

```text
Iniciar onboarding
→ localizar onboarding do mesmo case_id
→ reutilizar se ativo/rascunho
→ criar apenas se inexistente
→ definir responsável e primeira micro-entrega
→ criar tarefas compartilhadas/individuais aplicáveis
→ definir próxima ação
→ exibir no Caso 360 e Painel Hoje
→ preparar atualização para App Cliente quando aplicável
→ persistir após refresh
```

Não criar onboarding separado por aba, pessoa, país ou cenário. Variações devem ser templates parametrizados por serviço, país, rota, escopo e composição familiar.

---

## 10. Entrega obrigatória

Criar um documento versionado no repositório, sem criar documento apenas para dizer que auditou. O documento deve refletir código e teste real disponível.

Nome sugerido:

```text
docs/auditorias/MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md
```

Para cada rota/aba, a tabela deve incluir:

| Grupo | Rota | Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Concluir/Reprogramar | Função/RPC | Tabela/view | Regra de estado | UI existe? | Persistência confirmada? | Próxima ação/tarefa? | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

### Evidência obrigatória por item funcional

```text
rota
→ componente
→ handler
→ server function
→ tabela/RPC
→ usuário/organização
→ payload
→ resultado da escrita
→ linhas afetadas
→ releitura
→ refresh
→ resultado
```

Separar claramente:

- confirmado em banco/preview;
- confirmado apenas em código/PR;
- não testado;
- bloqueado por regra de estado;
- sem função;
- sem UI;
- leitura deliberada.

---

## 11. Critério final

A proprietária será considerada admin operacionalmente reconhecida quando, na própria organização, conseguir:

1. Abrir qualquer caso e Pessoa 360 relevante.
2. Criar, editar e persistir dados internos essenciais.
3. Preencher contrato rascunho e OS sem gates artificiais.
4. Criar e gerir tarefas.
5. Iniciar/retomar onboarding real no mesmo `case_id`.
6. Ver próxima ação e cadência no Caso 360 e Painel Hoje.
7. Preparar atualizações ao App Cliente sem disparar ações externas automaticamente.
8. Manter dados isolados entre organizações e ações externas confirmadas quando necessário.

```text
Admin reconhecida
= autoridade dentro da própria organização
+ persistência comprovada
+ continuidade operacional
+ segurança preservada.
```
