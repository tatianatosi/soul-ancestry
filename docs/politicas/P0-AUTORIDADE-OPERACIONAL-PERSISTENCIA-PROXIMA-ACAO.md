# P0 — Autoridade Operacional, Persistência e Próxima Ação

**Projeto:** `tatianatosi/soul-ancestry`  
**Infraestrutura:** Supabase próprio + Vercel + GitHub  
**Prioridade:** restaurar e comprovar a autoridade operacional da proprietária, a persistência confiável e a continuidade do trabalho por próxima ação/tarefa.  
**Regra de execução:** não tratar como concluído nenhum fluxo apenas porque existe uma tela, botão, função, toast, teste unitário ou alteração de estado local.

---

## 1. Contexto comprovado

O acesso direto ao banco mostra que **há persistência real em alguns fluxos**, mas ela é inconsistente entre áreas. O problema não deve ser descrito como “nada salva”; o diagnóstico correto é: existem fluxos que salvam de fato e outros que continuam sem validação de uso real ou sem caminho de escrita disponível para a proprietária.

### Persistências confirmadas em 30/08/2026

| Fluxo | Evidência registrada | Situação |
|---|---|---|
| Pessoa e família — caso Ana Luiza | Seis itens persistidos entre 12:52 e 12:53: informações de Felipe e cinco campos institucionais da contratada. | Confirmado no banco. |
| Caso 360 — Ana Luiza | Registro em `crm_casos` atualizado às 13:40 pela proprietária. | Confirmado no banco. |
| Partes e qualificação contratual | Nome, CPF, endereço e condição de contratante presentes desde 28/08. | Confirmado no banco. |
| Ordem de Serviço | OS mais recente persistida na noite de 29/08. | Confirmado no banco. |

### Fluxos ainda não comprovados pela proprietária

| Fluxo | Estado atual | Risco operacional |
|---|---|---|
| Tarefas / Ops | Nenhuma criação de tarefa pela proprietária foi confirmada no banco. | O trabalho pode ficar sem continuidade e sem responsável/prazo. |
| Clientes | Ativação/reclassificação não foi comprovada por uso real; edição de dados básicos precisa ser verificada. | Cadastro pode não ser operacionalmente administrável. |
| Núcleos familiares | Alteração de dossiê/requerente não foi comprovada por uso real. | Risco de vínculo familiar sem manutenção verificável. |
| Fontes Genealógicas | Nenhuma gravação confirmada no dia. | O novo botão de edição não é prova de persistência. |

---

## 2. Objetivo principal

A proprietária autenticada como admin da própria organização deve conseguir operar o Desk com autoridade efetiva, preservando segurança e rastreabilidade.

A regra de aceite de qualquer edição é:

```text
editar
→ salvar
→ receber resposta real do banco
→ confirmar a linha afetada
→ reler a entidade no banco
→ definir ou atualizar próxima ação/tarefa quando aplicável
→ refresh completo
→ sair da tela
→ voltar
→ encontrar o mesmo valor e o encaminhamento operacional preservados
```

A proprietária deve poder:

- Abrir clientes, pessoas, núcleos e casos da própria organização.
- Editar caso e próxima ação.
- Editar cliente existente.
- Editar núcleo familiar e participantes.
- Criar, editar, concluir e reprogramar tarefas.
- Registrar Discovery, pesquisa, documentos, fontes, hipóteses, notas e micro-entregas.
- Criar proposta em rascunho.
- Criar contrato em rascunho.
- Criar e editar Ordem de Serviço.
- Abrir a visão de pessoa, núcleo, caso e família sem logout, nova conta ou ritual de “modo proprietária”.

---

## 3. Autoridade não é bypass de segurança

A autoridade operacional da proprietária não autoriza remoção de controles estruturais. Manter obrigatoriamente:

- RLS.
- Login e sessão.
- Permissões por organização e usuário.
- Isolamento entre organizações.
- Logs e auditoria em segundo plano.
- Confirmação explícita para ações externas reais e irreversíveis.

A autoridade operacional significa: dentro da própria organização, a proprietária consegue trabalhar, editar, salvar e conduzir a operação interna sem ser bloqueada por checklist, gate visual, cadeia artificial de pré-condições ou tela cerimonial.

Não recriar:

- Modo Proprietária.
- Reconhecimento/reconfirmação de autoridade.
- Painel de capacidades.
- Aprovação em lote.
- Auditoria bloqueante.
- Override genérico.

---

## 4. Caso 360 como porta principal

O botão “Abrir ficha” ou “Abrir caso” deve levar ao **Caso 360 operacional**, não à tela de Piloto, conferência, gate, cadeia operacional ou prévia contratual.

O Caso 360 precisa abrir e permitir trabalho interno mesmo que não existam:

- Planejador persistido.
- Proposta estruturada.
- SKU vinculado.
- Condição comercial.
- Contrato assinado.
- Pagamento confirmado.
- Portal habilitado.
- Checklist cadastral completo.
- Onboarding ativado.
- Gates A–H concluídos.

### Estrutura mínima do Caso 360

**Cabeçalho**

- Cliente e contato principal.
- Código humano do caso.
- Tipo: individual ou familiar.
- Fase/status operacional.
- Próxima ação.
- Responsável.
- Núcleo familiar vinculado.
- Dossiê vinculado, quando houver.
- Identificação clara de Piloto real ou Demonstração, quando aplicável.

**Ações operacionais**

- Editar caso.
- Editar cliente.
- Editar núcleo.
- Adicionar ou editar participante.
- Definir contato principal.
- Definir próxima ação.
- Criar tarefa.
- Registrar Discovery.
- Adicionar documento.
- Registrar descoberta/pesquisa.
- Criar ou editar proposta em rascunho.
- Criar ou editar contrato em rascunho.
- Criar ou editar OS.
- Registrar micro-entrega.
- Abrir pesquisa.
- Abrir Fontes Genealógicas.
- Abrir visão do cliente/família quando houver conteúdo liberado.

**Seções do caso**

- Visão geral.
- Participantes e núcleo.
- Próximas ações e tarefas.
- Discovery.
- Proposta.
- Contrato.
- OS.
- Documentos.
- Pesquisa.
- Fontes.
- Micro-entregas.
- Comunicação.
- Financeiro.
- Acesso do app/portal.
- Histórico.

Dados técnicos, auditoria, critérios de ativação, integridade, regras de serviço e diagnóstico de inconsistências podem existir, mas devem ficar recolhidos e fora do caminho de trabalho diário.

---

## 5. Fonte única para caso, núcleo e participantes

Não criar novo cadastro/caso/núcleo “canônico” para resolver inconsistências de Ana Luiza ou de qualquer outra família.

> “Canônico” não significa “novo”. Significa selecionar, por decisão humana, um registro já existente como fonte de verdade e preservar referências anteriores como aliases/histórico.

### Regras

- Um atendimento individual ou familiar possui um único `case_id` canônico.
- `case_id` é a chave técnica imutável.
- `case_code` é o código humano visível.
- Códigos antigos permanecem pesquisáveis como aliases/histórico.
- Não criar outro `case_id` para App Cliente, proposta, contrato, OS, financeiro, Drive, portal, pesquisa ou onboarding.
- Não criar cópia de caso para exibição ao cliente.
- Não criar novo núcleo para escapar de erro de vínculo.
- Não criar novo participante para escapar de erro de edição.

Mapear e resolver, sem apagar dados e sem merge automático, o uso de:

- `nucleo_membros`.
- `case_members`.
- `case_dependents`.
- Pessoas.
- Participantes do caso.

Para cada tela que exibe ou edita família, definir explicitamente:

- Entidade canônica.
- Tabela/RPC de escrita.
- Tabela/view de releitura.
- Como o registro se vincula a `case_id`, `nucleo_id`, cliente e organização.
- Como a visibilidade de contratante, dependente, representante e participante é preservada.

Não executar migração, reapontamento, merge ou arquivamento antes de uma matriz de reconciliação e aprovação explícita da proprietária.

---

## 6. Persistência transversal

### Padrão obrigatório de escrita

Toda escrita interna deve seguir um padrão comum:

1. Resolver sessão e organização corretamente.
2. Validar payload contra o schema real do Supabase.
3. Validar enum/check constraint com a mesma fonte canônica usada pela UI.
4. Executar INSERT/UPDATE real.
5. Confirmar erro ou sucesso devolvido pelo banco.
6. Tratar zero linhas afetadas como erro, não como sucesso.
7. Reler a entidade no banco depois da gravação.
8. Comparar o valor lido com o valor enviado.
9. Invalidar/atualizar cache apenas após confirmação real.
10. Informar “Salvo e confirmado no banco” apenas se a releitura confirmar o dado.
11. Manter o formulário aberto e mostrar erro legível se houver falha.
12. Exibir identificador de operação para investigação, sem expor dados sensíveis.

### Não aceitar como prova de persistência

- Estado local.
- Cache do React Query.
- Toast isolado.
- Tela que parece atualizada.
- Mutation sem releitura.
- Teste mockado.
- Teste unitário que não alcança banco.
- Declaração de que “a função existe”.
- Resposta de sucesso sem confirmação de linha afetada.

---

## 7. Correções já exigidas

### 7.1 Núcleo: `nucleo_membros_papel_check`

Há falha real registrada no banco:

```text
new row for relation "nucleo_membros"
violates check constraint "nucleo_membros_papel_check"
```

Corrigir sem remover ou enfraquecer a constraint:

- Localizar a definição SQL exata da constraint.
- Listar valores técnicos permitidos.
- Localizar todos os formulários, constantes, enums e server functions que gravam `nucleo_membros.papel`.
- Fazer UI e banco usarem a mesma enumeração canônica.
- Exibir rótulo amigável em português, mantendo valor técnico permitido no payload.
- Criar migration aditiva apenas se houver papel de produto realmente necessário que não exista no schema.
- Exibir o erro real na tela em caso de falha.
- Comprovar salvar, refresh completo e releitura de membro de núcleo.

### 7.2 Consultas 400 na ficha/contrato

Corrigir selects incompatíveis com o schema real, sem mascarar falhas:

- Consulta em `proposals` que solicita campos divergentes ou inexistentes.
- Consulta em `contract_parameter_previews` que solicita `gerado_em` de forma incompatível com a tabela/view disponível.

Obrigatório:

- Conferir schema real no Supabase.
- Corrigir nomes de colunas, views, tipos e selects.
- Garantir que prévias ou painéis secundários falhem isoladamente e não impeçam abertura do Caso 360.
- Confirmar abertura de caso/contrato sem respostas HTTP 400.

---

## 8. Próxima ação ou tarefa após salvar

Nenhuma alteração relevante deve ficar sem consequência operacional explícita.

Após salvar uma alteração, o sistema deve conduzir uma destas alternativas:

1. Atualizar a próxima ação já existente do caso.
2. Criar uma tarefa interna vinculada ao caso.
3. Registrar explicitamente: “Sem nova ação necessária”, com razão curta selecionável ou campo opcional.

Isso não pode impedir o salvamento do dado principal.

### Alterações relevantes

Aplicar esta regra a:

- Inclusão ou edição de participante.
- Alteração de papel ou vínculo.
- Pendência documental adicionada, resolvida, rejeitada ou incompleta.
- Documento recebido.
- Descoberta de pesquisa.
- Fonte cadastrada ou alterada.
- Hipótese criada ou alterada.
- Proposta criada/editada.
- Contrato criado/editado.
- OS criada/editada.
- Condição comercial alterada.
- Mudança de fase.
- Onboarding iniciado, pausado ou reprogramado.
- Preparação de app, portal ou convite.
- Comunicação registrada.
- Micro-entrega concluída.
- Prazo alterado.

### Comportamento visual após salvar

```text
Alteração salva e confirmada no banco.

Próxima ação:
[descrição]

Responsável:
[nome ou papel]

Prazo:
[data ou “sem prazo definido”]

[Tarefa criada] ou [Próxima ação atualizada] ou [Sem nova ação necessária]
```

### Regras para tarefas

- Toda tarefa deve possuir `case_id` obrigatório.
- Participante é opcional, quando a ação for individual.
- Tarefa deve ter título, status, responsável e prioridade.
- Prazo é recomendado, mas sua ausência não bloqueia rascunho interno.
- A tarefa deve indicar visibilidade/contexto quando aplicável: interna, familiar, individual, contato principal ou representante legal.
- Em telas de pessoa, núcleo e participante, oferecer ações rápidas contextualizadas, tais como:
  - Solicitar documento.
  - Confirmar vínculo.
  - Definir acesso ao app.
  - Confirmar representação.
  - Revisar dado.
  - Agendar conversa.
  - Preparar proposta.
  - Preparar contrato.
- Se a proprietária salvar uma alteração relevante sem escolher uma consequência, perguntar de forma simples:
  “Deseja criar uma próxima ação, uma tarefa ou marcar como sem ação necessária?”
- Essa decisão é posterior ao dado principal e não pode bloquear a gravação.
- Se a tarefa falhar, informar claramente:
  “O dado foi salvo, mas a tarefa não foi criada”, e permitir nova tentativa.
- Se o dado principal falhar, não criar tarefa como se ele tivesse sido salvo.

### Próxima ação do Caso 360

- Todo caso deve exibir uma próxima ação ativa relevante.
- Quando houver tarefas múltiplas, destacar a priorizada/mais próxima, ou usar uma próxima ação definida manualmente.
- A proprietária pode criar, editar, concluir, reprogramar, pausar, substituir ou marcar “sem ação por agora”.
- A próxima ação não pode ser bloqueada por gates técnicos, contrato assinado, pagamento, portal ou checklist completo.
- Casos sem próxima ação devem aparecer no Painel Hoje como alerta operacional, nunca como bloqueio de acesso.

---

## 9. Rascunhos, validações e ações externas

Rascunhos internos devem funcionar com dados mínimos estruturais.

Devem poder ser criados/editados sem bloqueio por pendências futuras:

- Caso.
- Participante.
- Tarefa.
- Pesquisa.
- Fonte.
- Documento interno.
- Proposta rascunho.
- Contrato rascunho.
- Cláusula.
- Anexo.
- Ordem de Serviço.
- Micro-entrega.
- Próxima ação.

Validar requisitos no ponto de ação adequado:

- Assinatura: partes, qualificação e representação realmente necessárias.
- Cobrança: valor, responsável financeiro e dados necessários à cobrança.
- Convite externo: e-mail/contato autorizado, nível de acesso e confirmação.
- Envio externo: destinatário resolvido e confirmação explícita.
- Ativação formal: requisitos estritamente ligados à ativação.
- Pesquisa externa: integração, custo e autorização quando necessário.

Não usar requisitos de assinatura, cobrança, portal completo ou ativação formal para impedir edição e preparação internas.

---

## 10. Gates e dados técnicos

Remover da superfície principal de trabalho:

- `NO_GO`.
- `GO_CONDICIONAL`.
- “Bloqueado pelo elo anterior”.
- Cadeia sequencial que impede a operação interna.
- “Portal bloqueado” como estado dominante.
- Contagem de gates como abertura da ficha.
- Texto que afirma que pendências cadastrais bloqueiam genericamente contrato, assinatura e financeiro.

Manter, quando útil, em seção recolhida:

```text
Dados técnicos e validações
- requisitos de ativação;
- integridade da cadeia;
- auditoria;
- critérios de serviço;
- status de integração;
- diagnósticos de inconsistência.
```

Esses dados servem para diagnóstico e para decisões formais/externalizadas, não como porta de entrada do trabalho diário.

---

## 11. Teste de aceite obrigatório

Usar dados de teste não sensíveis e marcadores únicos, por exemplo:

```text
TESTE-PERSISTENCIA-30AGO-HHMM
```

Executar no preview ligado ao Supabase próprio, registrando resposta real e releitura após refresh completo.

| Domínio | Teste mínimo | Aceite |
|---|---|---|
| Cliente | Editar campo básico permitido. | Dado permanece após refresh e reabertura. |
| Caso | Editar próxima ação. | Dado persiste e cria/atualiza tarefa ou registra sem ação necessária. |
| Núcleo/participante | Alterar papel/vínculo permitido. | Não ocorre erro de constraint; dado persiste. |
| Tarefa | Criar tarefa vinculada ao caso. | Título, responsável, status, prioridade, vínculo e prazo reaparecem após refresh. |
| Pesquisa | Criar/editar achado, hipótese ou pendência. | Valor persiste e próxima ação/tarefa aplicável fica visível. |
| Fonte Genealógica | Editar próxima ação ou risco. | Dado reaparece após refresh. |
| Proposta/contrato | Salvar rascunho permitido. | Não depende de Planejador, SKU, assinatura ou pagamento para existir como rascunho. |
| OS | Criar ou editar OS em rascunho. | Dados reaparecem após refresh. |
| Caso 360 | Abrir o caso da Ana. | A rota abre sem HTTP 400 e sem depender de gates para permitir edição interna. |

Nenhum fluxo deve ser marcado como verde por ser apenas “teoricamente existente”.

---

## 12. Priorização imediata

A sequência de trabalho deve ser:

1. Corrigir abertura do Caso 360 e as consultas HTTP 400.
2. Corrigir erro de persistência de `nucleo_membros.papel`.
3. Implementar/confirmar padrão de persistência com releitura real.
4. Implementar/confirmar tarefa e próxima ação após alterações relevantes.
5. Testar Tarefas/Ops — não há gravação da proprietária confirmada.
6. Testar Clientes — ativar/reclassificar/editar dados básicos, com persistência após refresh.
7. Testar Núcleos — editar dossiê ou requerente, com persistência após refresh.
8. Testar Fontes Genealógicas — nenhuma gravação real confirmada no dia.
9. Somente depois retomar CRM Vivo, unificação de núcleos, portal, onboarding, integrações e demais frentes de produto.

A detecção de duplicidade de núcleos pode permanecer como leitura/diagnóstico, mas não executar nenhum merge, arquivamento ou reapontamento automático enquanto o CRUD base não estiver confiável e enquanto a proprietária não aprovar a matriz de reconciliação.

---

## 13. Entrega exigida

Criar uma branch nova a partir da `main` atual:

```text
fix/autoridade-operacional-persistencia-proxima-acao
```

A PR deve conter somente:

1. Abertura do Caso 360 como superfície operacional.
2. Correções de schema/selects que retornam HTTP 400.
3. Correção de enum/check constraint de membros de núcleo.
4. Padrão compartilhado de escrita e confirmação pós-save.
5. Decisão explícita de entidade canônica nas telas de participantes/núcleo.
6. Próxima ação/tarefa após alterações relevantes.
7. Bateria de testes de persistência real no preview.
8. Sem migração destrutiva e sem mudanças de segurança estrutural.

Na descrição da PR, informar:

- Fluxos corrigidos.
- Tabelas/RPCs usadas.
- Valores de enum aceitos.
- Consultas 400 corrigidas.
- Fonte canônica definida por tela para caso, núcleo e participante.
- Resultado de cada teste após refresh.
- Exemplo de uma alteração que gerou tarefa/próxima ação.
- Falhas reais ainda existentes.
- URL do preview.

Não mesclar sem aceite explícito da proprietária, depois de testar:

1. Abrir ficha operacional.
2. Editar.
3. Salvar.
4. Ver próxima ação/tarefa.
5. Dar refresh completo.
6. Reabrir.
7. Confirmar dados e encaminhamento preservados.

---

## Regra final

> O aplicativo só tem valor operacional se o trabalho da proprietária permanecer no banco e produzir continuidade de ação.

```text
Um caso.
Uma fonte de verdade.
Uma edição persistida.
Uma próxima ação clara.
Nenhum trabalho perdido.
```
