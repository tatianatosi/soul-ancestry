# EXECUÇÃO RETROSPECTIVA — REVISAR E EXECUTAR TODOS OS PROMPTS ANTERIORES A 17:40

**Projeto:** `tatianatosi/soul-ancestry`  
**Janela de análise:** todos os prompts, instruções, anexos e solicitações enviados pela proprietária antes de **17:40 do dia 29/08/2026**.  
**Prioridade:** P0 — recuperação da plataforma operacional.  
**Regra:** isto não é pedido de relatório, resumo, inventário ou nova arquitetura. É uma ordem de leitura, consolidação e execução do backlog anterior que permanece pendente.

---

## 1. Sua missão

Revise integralmente o histórico de prompts e mensagens recebidos antes de 17:40. Identifique tudo o que foi solicitado, tudo o que foi declarado como concluído e tudo o que continua ausente, bloqueado, falso, não persistente ou quebrado no preview.

Depois, **execute as correções reais**, em código e banco quando necessário, até que a plataforma volte a permitir trabalho operacional cotidiano.

Não peça que a proprietária reencaminhe mensagens individuais. Não exija que ela copie, divida ou repita prompts. Use o histórico desta conversa/execução, os documentos do projeto, o repositório e o ambiente já disponíveis.

Se o histórico não estiver acessível de forma técnica, use como fonte mínima obrigatória os dois artefatos existentes no projeto:

```text
PROMPT_CORRECAO_CRITICA_ALIAS_GATES_SALVAMENTO_MOBILE.md
PROMPT_REVERSAO_EMERGENCIAL_PLATAFORMA_OPERACIONAL.md
```

Eles consolidam as reclamações, telas e requisitos anteriores à janela indicada. Localize-os no workspace, arquivos fornecidos ou repositório. Se estiverem em anexo/local, use seu conteúdo como especificação de execução.

---

## 2. Contexto do incidente

A proprietária relata que a plataforma virou uma interface de bloqueios, auditoria, validações e textos internos. Em vez de permitir atendimento e operação, ela apresenta elementos como:

```text
PRÉ-ONBOARDING BLOQUEADO
NO_GO
Gates A a H
Gates críticos pendentes
Bloqueado em Comercial
Rascunho interno — não enviar / não assinar
Executar validações
Solicitar revisão humana
Enviar ao cliente (desabilitado)
Justificativa obrigatória
Confiança mínima 4
Confirmar
Bloquear
A leitura desta tela saiu do padrão acordado
Prontidão de atribuição — checklist completo
CAC / ROI / ROAS no fluxo de trabalho
Registrar caso-piloto no Desk
Erro de alias histórico
```

Além disso, há regressão de responsividade mobile: identificadores quebram por caractere, botões ficam desalinhados ou fora da tela e o botão flutuante “Assistente” cobre conteúdo e ações.

O caso de referência é da família Silveira / Friedmann-Reimer, com código canônico:

```text
CA-CID-AT-FAM-2026-001
```

Aliases históricos conhecidos:

```text
CA-AUT-ANALUIZA-FAM-2026-001
CA-2026-ANA-001
CA-CID-AT-2026-002
```

O estado atual visto pela proprietária não é aceitável: há telas, mas não há condições confiáveis para abrir, editar, salvar, criar tarefa, iniciar onboarding ou trabalhar o caso.

---

## 3. Método obrigatório

### Fase 1 — Ler e consolidar

1. Localize todos os prompts anteriores a 17:40 disponíveis no contexto, arquivos e repositório.
2. Leia os dois documentos de prompt citados acima na íntegra.
3. Verifique o repositório e compare pedidos versus implementação atual.
4. Inspecione o preview e os fluxos reais, não apenas componentes isolados ou testes unitários.
5. Gere uma lista curta de pendências em formato executável: `requisito → rota/componente/regra → ação corretiva → critério verificável`.

### Fase 2 — Reverter regressões primeiro

1. Identifique o último commit/deploy em que o fluxo operacional era utilizável.
2. Crie a branch:

```text
hotfix/revisao-retrospectiva-prompts-ate-1740
```

3. Reverter ou remover, de forma cirúrgica, as mudanças que adicionaram gates, bloqueios, validações impeditivas, auditoria como fluxo principal, mock de operação ou interface não responsiva.
4. Preservar os dados reais. Não eliminar casos, pessoas, aliases, contratos, documentos ou histórico.

### Fase 3 — Executar os requisitos funcionais

Implemente, corrija e teste os fluxos abaixo. Não responda apenas descrevendo como seria feito.

---

## 4. Requisitos que devem ser executados

### 4.1 Resolver identificador canônico e aliases

Implementar uma única resolução para case code e aliases.

```text
case_code canônico → abre case_id correspondente
alias histórico → resolve mesmo case_id canônico → abre o caso
código inexistente → somente então permite fluxo explícito de “Novo caso”
```

Regras:

- Nunca tentar inserir um novo caso ao abrir identificador que já existe como alias.
- Nunca mostrar o erro “Este identificador já existe como alias histórico” para a proprietária.
- Remover o botão “Registrar caso-piloto no Desk”.
- Ao usar um alias, mostrar apenas um toast não bloqueante:

```text
Abrimos o caso canônico vinculado a este identificador.
```

Teste obrigatório: todos os códigos conhecidos devem abrir o mesmo `case_id` canônico.

### 4.2 Restaurar Caso 360 como ficha de trabalho

O Caso 360 precisa voltar a oferecer ações reais e visíveis:

```text
[Abrir caso]
[Editar caso]
[Salvar alterações]
[Registrar atualização]
[Criar tarefa]
[Adicionar pessoa]
[Adicionar documento]
[Criar Ordem de Serviço]
[Iniciar onboarding]
```

Não pode existir bloqueio por gate, status derivado, aprovação, auditoria, confiança mínima, confirmação adicional ou justificativa para abrir, editar e salvar dados operacionais.

### 4.3 Remover bloqueios do fluxo da proprietária

Remover da interface operacional e das regras impeditivas:

```text
NO_GO
Pré-onboarding bloqueado
Bloqueado em Comercial
Gates A a H
Conferência do piloto
Evidência exigida
Quem decidiu
Auditoria
Revisão humana obrigatória
Executar validações
Confiança mínima como pré-condição
Justificativa obrigatória
Confirmar
Bloquear
A leitura desta tela saiu do padrão acordado
```

Se houver pendência de dado, transformar em tarefa editável com próxima ação. Pendência não pode impedir rascunho, atendimento ou trabalho interno.

Substituir por:

```text
Status: Em preparação
Pendências: [n]
Próxima ação: [ação concreta]
```

### 4.4 Fazer salvar persistir de verdade

Todo botão Salvar deve:

```text
validar apenas campos mínimos do contexto
executar INSERT/UPDATE real
aguardar retorno do banco
mostrar “Salvo.” apenas após sucesso
recarregar ou invalidar a query
mostrar imediatamente o dado atualizado
preservar o valor após refresh
mostrar erro técnico legível em caso de falha
```

É proibido:

```text
salvar apenas no estado local
mostrar sucesso falso
voltar para uma tela sem dado atualizado
ocultar RLS/API/database errors
pedir aprovação/justificativa/confirmação para salvar rascunho
```

### 4.5 Pessoas e participantes

Na tela de pessoas, manter informações operacionais e ações úteis:

```text
Nome
Papel no caso
Dados disponíveis
Pendências simples
Próxima ação
[Editar]
[Salvar]
[Criar tarefa]
[Adicionar documento]
```

“Identidade não revisada” e “Dados restrita” não podem bloquear edição de owner/admin. Dados restritos controlam a visualização externa, não o trabalho da proprietária.

Os participantes existentes devem continuar associados ao mesmo caso canônico, sem fichas paralelas.

### 4.6 Ordem de Serviço

Verifique honestamente se há um objeto de Ordem de Serviço real, rota, tabela/modelo, criação, persistência e reabertura.

- Se ela existia em um commit anterior funcional, restaurar o fluxo funcional.
- Se não existe, implementá-la como objeto operacional mínimo real, não como tela decorativa e não como sinônimo de contrato.

A OS mínima deve ter:

```text
id
organization_id
case_id
status (rascunho, ativa, concluída, cancelada)
título
escopo
responsável
prazo
valor e moeda opcionais
observações
created_at
updated_at
```

Na interface do caso:

```text
[Criar Ordem de Serviço]
[Abrir Ordem de Serviço]
[Salvar rascunho]
[Criar tarefa a partir da OS]
```

A OS deve persistir, reabrir após refresh e aparecer vinculada ao Caso 360. Campos incompletos não podem impedir a criação do rascunho.

Não substituir Ordem de Serviço por contrato-base, lista de versões, auditoria, pesquisa, gate ou “modelo-estudo”.

### 4.7 Contrato

Contrato é consequência opcional da OS; não substitui a OS.

Remover da interface operacional:

```text
Rascunho interno — não enviar / não assinar
Executar validações
Solicitar revisão humana
Enviar ao cliente (desabilitado)
Auditoria
Validações
Revisão
Justificativa obrigatória
Confirmar
Bloquear
```

Manter ações simples:

```text
[Editar]
[Salvar rascunho]
[Ver prévia]
[Arquivar]
```

Placeholders devem ser apenas campos a completar, não bloqueios. Mostrar versão atual como padrão, não uma lista dominante de v3/v4/v5/v6.

### 4.8 Onboarding

Substituir “Pré-onboarding bloqueado” por:

```text
Onboarding: disponível para iniciar
[Iniciar onboarding]
```

Se existir motor real, criar um `onboarding_run` e tarefas iniciais reais.

Se o motor não existir, o botão deve ao menos criar uma tarefa real intitulada:

```text
Iniciar onboarding de [nome do caso]
```

com link para o caso, responsável e prazo editável. O botão nunca pode estar desabilitado por gates ou dados faltantes.

### 4.9 Painel Hoje

O Painel Hoje deve ser uma mesa de trabalho:

```text
Tarefas vencidas
Tarefas de hoje
Próximas ações
Casos sem próxima ação
```

Cada linha precisa permitir abrir o caso e atualizar/concluir/adicionar prazo à tarefa.

Remover do Painel Hoje e do fluxo do caso:

```text
Avisos de “padrão acordado”
Métricas de exibição
Governança
Catálogo
Checklist de atribuição
CAC
ROI
ROAS
Marketing sem relação direta com ação do dia
```

### 4.10 Corrigir mobile

Validar em viewport de 375px e 430px.

Obrigatório:

```text
Nenhum código do caso quebra por caractere.
Cabeçalho não sobrepõe título, código e botões.
Botões permanecem dentro da tela e clicáveis.
Cards não produzem overflow horizontal.
Abas ficam utilizáveis por scroll horizontal ou reflow legível.
Assistente flutuante não cobre campos, alertas, conteúdo, botões ou área de salvamento.
```

Usar layout responsivo real; não corrigir somente um screenshot.

---

## 5. Não fazer

```text
Não criar outro caso para Ana Luiza.
Não criar outro identificador para Ana Luiza.
Não apagar dados reais.
Não usar DROP TABLE, TRUNCATE, DELETE em massa ou reset de banco.
Não criar feature flags que escondem o problema somente para demo.
Não trocar dados reais por dados mockados.
Não introduzir novas gates, aprovações, auditorias, confirmações, justificativas ou pré-condições.
Não responder com documentação, inventário, plano ou build verde como substituto da implementação.
Não declarar pronto sem testar manualmente o preview.
```

---

## 6. Critérios de aceite

Antes de afirmar conclusão, testar manualmente no preview Vercel da branch:

1. Abrir o caso por `CA-CID-AT-FAM-2026-001`.
2. Abrir o mesmo caso por `CA-AUT-ANALUIZA-FAM-2026-001`.
3. Abrir o mesmo caso por `CA-2026-ANA-001`.
4. Confirmar que nenhum alias tenta criar caso novo ou gera erro.
5. Confirmar que não existe botão “Registrar caso-piloto no Desk”.
6. Confirmar ausência de `NO_GO`, gates, “Pré-onboarding bloqueado”, “Bloqueado em Comercial” e auditoria no caminho de trabalho.
7. Editar uma pessoa e salvar.
8. Atualizar/recarregar e confirmar persistência.
9. Criar uma tarefa a partir do Caso 360.
10. Ver essa tarefa no Painel Hoje.
11. Criar uma Ordem de Serviço em rascunho.
12. Recarregar e abrir novamente essa Ordem de Serviço.
13. Abrir contrato e salvar rascunho com pelo menos um campo não preenchido.
14. Iniciar onboarding ou criar a tarefa real substituta de onboarding.
15. Validar mobile em 375px.
16. Validar mobile em 430px.
17. Confirmar que o botão Assistente não encobre ações ou campos.

---

## 7. Forma de entrega

Quando terminar, entregar uma única resposta objetiva contendo:

```text
Branch
PR ou commit
URL do preview Vercel
Arquivos/tabelas alterados
Resultado dos 17 testes manuais
Pendências reais restantes, se houver
```

Não use frases como “pronto”, “concluído” ou “corrigido” se qualquer critério de aceite ainda falhar.

A entrega só estará concluída quando a proprietária puder abrir o próprio caso, editar, salvar, criar tarefa, criar Ordem de Serviço e iniciar onboarding sem que a plataforma a bloqueie.