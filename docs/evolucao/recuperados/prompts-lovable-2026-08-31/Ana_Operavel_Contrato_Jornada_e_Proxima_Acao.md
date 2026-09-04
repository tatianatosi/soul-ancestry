# Ana Operável — Contrato, Jornada e Próxima Ação

**Projeto:** Clube Ancestral — `tatianatosi/soul-ancestry`  
**Caso de referência:** Ana Luiza Gomes Silveira Rodrigues  
**Objetivo:** tornar o caso existente da Ana plenamente operável antes de qualquer revisão ampla de layout, simplificação de menu, motor CRM Vivo, unificação de núcleos ou nova integração.

---

## Regra de prioridade

Antes de redesenhar o Desk, deve ser possível:

```text
Abrir Caso 360
→ preencher contrato em rascunho
→ salvar e confirmar persistência
→ iniciar ou retomar jornada/onboarding real
→ criar ou atualizar próxima ação/tarefa
→ visualizar no Caso 360 e no Painel Hoje
→ atualizar a página
→ reencontrar tudo preservado
```

A revisão visual do Desk acontece somente depois de esse ciclo funcionar para Ana Luiza.

---

## 1. Fonte de verdade

Ana Luiza não é um caso excepcional nem deve receber um cadastro novo como solução.

```text
Um caso.
Um case_id canônico.
Um case_code humano oficial.
Aliases preservados.
Um núcleo familiar quando aplicável.
Uma jornada.
Uma fonte de verdade.
Uma próxima ação.
Nenhum trabalho perdido.
```

### Regras

- Não criar novo caso, cliente, núcleo, dossiê, participante, proposta, contrato, onboarding ou app para corrigir inconsistência existente.
- “Canônico” não significa criar registro novo. Significa escolher, por decisão humana, um registro existente como fonte de verdade.
- Códigos antigos devem permanecer pesquisáveis como aliases/histórico.
- Caso, proposta, contrato, OS, tarefas, pesquisa, documentos, micro-entregas, portal e App Cliente devem usar o mesmo `case_id` canônico.
- Não apagar dados, contratos, documentos, propostas, tarefas ou histórico.
- Não executar merge de núcleo/caso antes de matriz de reconciliação e aprovação explícita da proprietária.

---

## 2. Abrir Caso 360

A entrada principal deve abrir o Caso 360 operacional da Ana, não uma tela de Piloto, conferência, prévia, cadeia operacional, gate, checklist ou auditoria.

### Cabeçalho mínimo

```text
Ana Luiza Gomes Silveira Rodrigues
Código do caso: [case_code]
Tipo: Caso familiar / individual, conforme registro real
Núcleo familiar: [nome e link]
Fase operacional: [fase atual]
Próxima ação: [descrição]
Responsável: [nome/papel]
Última atualização: [data/hora]

[Editar caso] [Pessoas] [Tarefas] [Contrato] [OS] [Pesquisa]
```

### O Caso 360 deve abrir mesmo sem

- Planejador persistido.
- Proposta estruturada.
- SKU vinculado.
- Condição comercial completa.
- Contrato assinado.
- Pagamento confirmado.
- Portal habilitado.
- Checklist cadastral completo.
- Onboarding ativado.
- Gates A–H concluídos.

Dados técnicos, integridade, validações de ativação, auditoria e critérios de serviço podem ficar recolhidos em “Dados técnicos e validações”. Não devem impedir acesso ao caso nem dominar a tela.

---

## 3. Contrato operacional

O objetivo imediato é permitir que a proprietária preencha e mantenha o contrato em rascunho, preservando a regra de validação apenas para assinatura, envio ou cobrança.

### A proprietária deve conseguir

- Abrir contrato associado ao `case_id` existente.
- Editar título e dados de contexto permitidos.
- Editar partes.
- Editar escopo.
- Criar, editar e salvar cláusulas.
- Criar, editar e salvar anexos.
- Editar observações necessárias.
- Criar/editar Ordem de Serviço vinculada ao caso/contrato, quando aplicável.
- Salvar o rascunho em qualquer etapa razoável de preparação.
- Solicitar revisão humana como ação interna, se necessário.

### Partes do contrato

Exibir em cards no mobile, não em tabela horizontal cortada:

```text
Nome da parte
Papel: Prestador / Contratante / Cocontratante / Dependente / Representante
Capacidade: adulta / menor / conforme dado real
Assinatura: necessária / não necessária / pendente de decisão
Vínculo com caso
[Editar]
```

### Regras de rascunho

- Cláusula deve poder salvar com título e texto.
- Anexo deve poder salvar com título; código interno pode ser gerado automaticamente se houver estrutura para isso.
- Não exigir dados de todos os participantes antes de permitir rascunho.
- Não exigir assinatura, pagamento, portal completo, Planejador, SKU, condição comercial integral, gate A–H ou checklist perfeito para salvar rascunho.
- Dados institucionais da contratada devem vir do Perfil Institucional; não repetir razão social, CNPJ, endereço, e-mail ou representante legal como pendência de cada família/caso.

### Ações externas

- Não manter “Enviar ao cliente (desabilitado)” como botão principal.
- Se existir fluxo real de revisão via portal, mostrar “Preparar convite de revisão” apenas quando o contato/e-mail estiver autorizado e a ação puder ser executada de verdade.
- Enviar e-mail, WhatsApp, cobrança ou assinatura requer integração real, alvo resolvido e confirmação explícita.
- A ausência dessas ações não pode impedir preencher ou salvar o contrato interno.

---

## 4. Jornada e onboarding real

“Iniciar onboarding” não pode ser somente um link para uma tela com requisitos. Deve criar ou recuperar um onboarding operacional do mesmo caso.

### Fluxo obrigatório

```text
Iniciar onboarding
→ localizar onboarding existente do mesmo case_id
→ se houver onboarding ativo/rascunho, retomar
→ se não houver, criar onboarding real
→ definir primeira micro-entrega
→ definir próxima ação
→ gerar tarefas aplicáveis
→ exibir no Caso 360
→ exibir no Painel Hoje
→ persistir após refresh
```

### Regras

- Um onboarding por `case_id`, não por tela, aba, pessoa, país ou cenário.
- Templates podem variar por serviço, SKU, país, rota, escopo e composição familiar.
- Caso familiar pode ter tarefas compartilhadas e individuais por participante.
- Não criar onboarding duplicado em novos cliques.
- Não criar outro caso, núcleo ou participante para iniciar onboarding.
- O onboarding interno pode existir como rascunho ou ativo antes de assinatura/pagamento, desde que ações externas e ativação formal continuem sendo validadas no momento próprio.

### Estrutura mínima

```text
Status: rascunho / ativo / pausado / concluído
Data de início
Responsável
Primeira micro-entrega
Próxima ação
Tarefas abertas
Pendências individuais
Pendências compartilhadas
Histórico de atualizações
```

---

## 5. Alteração salva gera continuidade

Nenhuma alteração relevante deve ficar sem próximo passo operacional.

Depois de salvar um dado, o sistema deve apresentar uma das alternativas:

1. Atualizar a próxima ação do caso.
2. Criar uma tarefa vinculada ao mesmo caso.
3. Registrar “Sem nova ação necessária”.

Essa decisão não pode bloquear o salvamento do dado principal.

### Alterações relevantes

- Inclusão/edição de participante.
- Mudança de papel, vínculo, representação ou contratante.
- Documento solicitado, recebido, rejeitado ou incompleto.
- Descoberta de pesquisa, fonte, evidência ou hipótese.
- Alteração de proposta, contrato, cláusula, anexo ou OS.
- Mudança de fase ou prazo.
- Início, pausa ou retomada de onboarding.
- Conclusão de micro-entrega.
- Preparação de portal ou comunicação.

### Regras para tarefa

```text
case_id: obrigatório
participante: opcional, obrigatório quando a ação for individual
título: obrigatório
status: obrigatório
responsável: obrigatório
prioridade: obrigatória
prazo: opcional para rascunho interno
origem: cadastro / documento / pesquisa / contrato / OS / onboarding / manual
```

- Não criar tarefas duplicadas para a mesma pendência aberta.
- Reutilizar/atualizar tarefa existente por `case_id + origem + referência + status aberto`.
- Se uma tarefa falhar, informar que o dado principal foi salvo, mas a tarefa não foi criada.
- Se o dado principal falhar, não criar tarefa como se tivesse sido salvo.

### Exibição após salvar

```text
Salvo e confirmado no banco.

Próxima ação: [descrição]
Responsável: [nome/papel]
Prazo: [data ou sem prazo definido]

[Tarefa criada] / [Próxima ação atualizada] / [Sem nova ação necessária]
```

---

## 6. Persistência comprovada

Uma função, botão, toast, mutation, cache ou teste unitário não é prova de persistência.

### Padrão obrigatório

```text
editar
→ validar somente campos aplicáveis
→ gravar no Supabase
→ confirmar erro ou número de linhas afetadas
→ reler a mesma entidade no banco
→ comparar com valor enviado
→ atualizar cache
→ informar sucesso
→ refresh completo
→ reabrir
→ confirmar o mesmo valor
```

### Regras técnicas

- Tratar zero linhas afetadas como erro.
- Mostrar o erro real do Supabase/Postgres na tela de forma legível.
- Não fechar formulário se a gravação falhar.
- Não mostrar “salvo” antes da releitura confirmar o valor.
- Leituras e escritas devem usar os mesmos IDs canônicos e a mesma organização.
- UI e banco devem usar o mesmo vocabulário de enum/check constraints.
- Não usar service-role no navegador.

### Correções obrigatórias conhecidas

- Resolver incompatibilidade de valores de `nucleo_membros.papel` com `nucleo_membros_papel_check`.
- Corrigir selects incompatíveis que geram HTTP 400 em `proposals` e `contract_parameter_previews`.
- Definir, por tela, a fonte canônica entre `nucleo_membros`, `case_members`, `case_dependents`, pessoas e participantes.
- Impedir que uma tela grave em uma estrutura e outra releia outra sem ponte/sincronização explícita.

---

## 7. Painel Hoje e Pessoa 360

Depois de estabilizar contrato e onboarding, o Painel Hoje deve oferecer acesso rápido à Ana e ao seu contexto sem criar uma nova identidade.

```text
Ana Luiza
Caso: [case_code]
Fase: [fase atual]
Próxima ação: [descrição]
Responsável: [nome/papel]
Tarefas abertas: [número]
Contrato: rascunho / revisão / pronto
Documentos pendentes: [número]
Última atualização: [data]

[Ver Pessoa 360] [Abrir Caso 360]
```

Pessoa 360 deve reunir dados, casos, núcleo, tarefas, proposta, contrato, OS, documentos, pesquisa, fontes, entregas, comunicação e histórico ligados às entidades canônicas existentes.

---

## 8. Critérios de aceite

### Contrato

1. Abrir o contrato da Ana sem erro HTTP 400.
2. Editar partes, escopo, cláusulas, anexos e observações permitidas.
3. Salvar rascunho sem assinatura/pagamento/gates futuros.
4. Atualizar a página e confirmar os mesmos valores.
5. Usar cards de partes no mobile, sem tabela truncada.

### Jornada

1. Iniciar ou retomar onboarding do mesmo `case_id`.
2. Não criar onboarding duplicado.
3. Criar primeira micro-entrega, próxima ação e tarefas aplicáveis.
4. Atualizar a página e confirmar persistência.
5. Exibir tarefas no Caso 360 e no Painel Hoje.

### Continuidade

1. Salvar uma alteração relevante.
2. Confirmar que o dado principal persistiu.
3. Confirmar que uma tarefa/próxima ação foi criada, atualizada ou marcada como sem ação necessária.
4. Dar refresh completo e confirmar dado + consequência operacional.
5. Concluir ou reprogramar tarefa e confirmar reavaliação da próxima ação.

### Limites

1. Não criar caso novo, núcleo novo, cliente novo ou participante novo para contornar falha.
2. Não alterar RLS, login, sessão, permissões de organização ou auditoria em segundo plano.
3. Não executar envio externo, cobrança, assinatura ou convite externo nesta etapa.
4. Não executar unificação/merge de dados antes de matriz de reconciliação aprovada.
5. Não declarar concluído por testes mockados, interface visual ou CI verde.

---

## 9. Ordem de execução

```text
1. Abrir Caso 360 da Ana corretamente.
2. Corrigir erros de schema e abertura de contrato.
3. Preencher e salvar contrato em rascunho.
4. Comprovar persistência após refresh.
5. Implementar/confirmar próxima ação ou tarefa após alteração relevante.
6. Iniciar/retomar onboarding real no mesmo case_id.
7. Materializar tarefas e primeira micro-entrega.
8. Exibir no Caso 360 e Painel Hoje.
9. Comprovar persistência após refresh.
10. Somente então revisar visualmente todo o Desk simples.
```

---

## Regra final

> Ana Luiza só está operável quando a proprietária consegue preencher o contrato, conduzir a jornada, preservar cada edição e ver claramente o que acontece em seguida.

```text
Um caso.
Um contrato editável.
Uma jornada real.
Uma próxima ação clara.
Uma tarefa quando necessária.
Nenhum trabalho perdido.
```
