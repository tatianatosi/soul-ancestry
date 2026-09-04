# Resgate — PR #32 e PR #33: Ana, Persistência, Tarefa e Pendências Vivas

**Projeto:** `tatianatosi/soul-ancestry`  
**Data de consulta:** 30 de agosto de 2026  
**Fonte de verificação:** GitHub — PR #32 e PR #33  
**Status das PRs nesta consulta:** abertas como draft, não mescladas; ambas baseadas na branch da PR #29.

---

## 1. Regra de leitura

Uma PR com CI verde, build verde ou `mergeable_state: clean` não é prova de que a funcionalidade está ativa em produção nem de que a proprietária já validou o fluxo.

A prova de aceite continua sendo:

```text
editar
→ salvar
→ confirmar linha afetada
→ reler do banco
→ refresh completo
→ reabrir
→ encontrar o mesmo valor
→ confirmar tarefa/próxima ação quando aplicável
```

Nenhuma PR descrita neste documento deve ser mesclada sem validação manual explícita da proprietária no preview.

---

## 2. PR #32 — Pessoa: salvar com releitura real + decisão de tarefa

**Título:** `Pessoa: salvar com releitura real + decisão de tarefa; ajustes mobile`  
**Branch:** `feat/pessoa-salvar-tarefa-continuidade`  
**Commit de cabeça:** `9353916c076424242b2d45802071cb3353d66295`  
**Base:** `fix/caso-canonico-salvamento-operacional` — PR #29  
**Estado:** aberta, draft, limpa para merge tecnicamente  
**Escopo declarado:** 8 arquivos, 2 commits.

### 2.1 Causa identificada

O formulário de pessoa exibia a mensagem “Registro gravado e reconferido no servidor”, porém a reconferência era apenas a própria linha devolvida pelo `UPDATE`.

Não havia:

- releitura independente no banco pelo mesmo ID;
- comparação campo a campo entre o que foi enviado e o que foi persistido;
- decisão operacional depois do salvamento;
- escolha entre criar tarefa, atualizar consequência ou marcar que não havia nova ação necessária.

Assim, um dado podia parecer salvo sem haver confirmação independente, e a alteração podia ficar sem continuidade de trabalho.

### 2.2 Correção implementada

A função genérica `salvarRegistroG02`, em `pessoas-linhagens.functions.ts`, foi ajustada para:

```text
confirmar que houve linha afetada
→ reler diretamente a mesma pessoa pelo mesmo ID
→ comparar os campos enviados com os valores relidos
→ devolver sucesso somente se os valores corresponderem
```

A função cobre o perfil e estruturas associadas do G-02, incluindo:

```text
perfil
variantes
relações
eventos
linhagens
módulos históricos associados
```

### 2.3 Continuidade após salvar

No salvamento do perfil de pessoa, a interface deve apresentar:

```text
Salvo e confirmado no banco.

[Criar tarefa]
[Sem nova ação necessária]
```

A tarefa deve reutilizar o motor existente de Operações:

```text
tabela: tarefas
função: salvarTarefa
vínculo: mesmo case_id da pessoa/caso
```

Regras declaradas:

- Criar tarefa não bloqueia o salvamento do dado principal.
- Escolher “Sem nova ação necessária” não bloqueia o salvamento.
- Se a tarefa falhar, o dado principal permanece salvo.
- Em caso de falha de tarefa, a interface deve informar: o dado foi salvo, mas a tarefa não foi criada.
- A tarefa deve aparecer na fila de Ops e no Painel Hoje e sobreviver a refresh, por vir do banco.

### 2.4 Ajustes mobile e contrato

A PR #32 inclui também:

- Botão flutuante do Assistente respeitando `env(safe-area-inset-bottom)`.
- Área autenticada com respiro inferior equivalente.
- Aba Partes do contrato convertendo linhas em cards empilhados abaixo de `md`.
- Tabela horizontal de partes mantida apenas em telas `md+`.
- Remoção de “Enviar ao cliente (desabilitado)” da barra principal.
- Indicação de “Solicitar revisão humana” como ação interna real.

### 2.5 Fora de escopo da PR #32

A PR não implementa:

- Criação de caso, pessoa, núcleo ou dado duplicado.
- Alterações de RLS, sessão, permissões de organização ou auditoria de fundo.
- Ações externas: envio, assinatura, cobrança ou pesquisa externa.
- Edição em linha de partes existentes do contrato; a cobertura declarada é cartão/listagem e arquivamento, não editor completo de parte.
- Decisão visual de tarefa em todas as demais abas de G-02; relações, eventos, variantes, linhagens e módulos precisam receber a mesma superfície em uma etapa posterior.
- Motor completo de onboarding.

### 2.6 Teste manual obrigatório

Usar no preview um dado de teste não sensível:

1. Abrir a pessoa da Ana Luiza.
2. Alterar `Local de nascimento` com valor identificável.
3. Salvar.
4. Confirmar a mensagem “Salvo e confirmado no banco”.
5. Selecionar “Criar tarefa” ou “Sem nova ação necessária”.
6. Se criar tarefa, confirmar que ela está vinculada ao mesmo `case_id`.
7. Dar refresh completo.
8. Reabrir a mesma pessoa e confirmar o valor alterado.
9. Abrir Ops/Painel Hoje e confirmar a tarefa após refresh.

### 2.7 Critério de aceite

```text
Dado persistido
+ releitura independente confirmada
+ refresh confirmado
+ consequência operacional escolhida
+ tarefa existente quando solicitada
= PR #32 validada para o perfil de pessoa
```

---

## 3. PR #33 — Piloto Real: pendências vivas no lugar da lista fixa

**Título:** `Piloto Real: pendências vivas no lugar da lista fixa de 11 bloqueios`  
**Branch:** `fix/piloto-real-pendencias-vivas`  
**Commit de cabeça:** `7ce92ccd30dc84a95d24d79dd17311ac425e0893`  
**Base:** `fix/caso-canonico-salvamento-operacional` — PR #29  
**Estado:** aberta, draft, limpa para merge tecnicamente  
**Escopo declarado:** 7 arquivos, 1 commit; 381 linhas adicionadas e 528 removidas.

### 3.1 Causa identificada

A tela Piloto Real apresentava sempre a mesma lista fixa de 11 itens em `BLOQUEIOS_PILOTO`.

Características do problema:

- Lista hardcoded, sem consulta ao banco.
- Sem ação associada por item.
- Independente do avanço real do caso.
- Gates A–H aparentemente vivos, mas com vários campos configurados como `conferido: false` por construção.
- Códigos de bloqueio fixos por gate.
- Estado visual `NO_GO` persistente, mesmo com evolução real de contrato, pagamento e revisão jurídica.

Esse modelo confundia referência técnica com pendência operacional real e reforçava a percepção de bloqueio mesmo quando a ficha e ações internas podiam avançar.

### 3.2 Correção implementada

A PR remove da tela do Piloto Real:

```text
BLOQUEIOS_PILOTO
piloto-conferencia.ts
gates A–H fixos
lista hardcoded de 11 bloqueios
NO_GO como estado principal fixo
“crítico pendente” como superfície dominante
```

E introduz:

```text
derivarPendenciasPiloto
→ carregarPilotoAna
→ leitura de pendências reais, abertas e vinculadas ao case_id
```

As fontes declaradas de leitura são:

```text
crm_casos
nucleo_membros
contracts
service_orders
perfil institucional
```

### 3.3 Estrutura de pendência viva

Cada pendência real exibida deve informar:

```text
descrição
entidade ou pessoa afetada
origem
ação relacionada, quando existir
tarefa vinculada, quando existir
estado atual
```

Classificações de origem previstas:

```text
cadastro/participante
documento
contrato
proposta/comercial
ativação
```

A PR declara que não deve listar como pendência aberta uma política permanente de integração/ação externa, como Asaas bloqueado ou envio externo desabilitado, quando ela não representa uma pendência específica daquele caso.

### 3.4 Comportamento esperado

A tela Piloto Real deve obedecer a esta regra:

```text
Dados técnicos e validações
→ bloco recolhido
→ só quando há pendência real
→ não bloqueia abrir caso, editar caso, abrir núcleo,
   criar OS ou iniciar onboarding
```

Não deve haver:

```text
NO_GO fixo
lista fixa de 11 bloqueios
bloco vazio exibido como problema
cadeia fixa como porta principal de trabalho
```

### 3.5 Fora de escopo da PR #33

A PR não implementa:

- Ação genérica de “resolver” pendência.
- Ação genérica de “dispensar” pendência.
- Caso, núcleo, participante ou lista fixa novos para Ana Luiza.
- Mudança de RLS, sessão, permissões, auditoria, aliases ou regras de ação externa.
- Motor de onboarding ou geração automática de tarefas.

A ausência de botão genérico de dispensar é adequada: requisitos de domínios diferentes não devem ser removidos por uma única ação sem regra específica e decisão humana.

### 3.6 Teste manual obrigatório

1. Abrir Piloto Real no preview da PR #33.
2. Verificar que não há a lista fixa dos 11 bloqueios.
3. Conferir se pendências exibidas correspondem ao estado real do caso da Ana.
4. Conferir se não há selo `NO_GO` fixo dominando a tela.
5. Confirmar que “Dados técnicos e validações” aparece recolhido apenas se houver pendência real.
6. Confirmar os atalhos:

```text
Abrir caso
Editar caso
Ver núcleo familiar
Criar Ordem de Serviço
Iniciar onboarding
```

7. Abrir o Caso 360 e confirmar que o fluxo operacional continua acessível.

### 3.7 Critério de aceite

```text
Pendências derivadas de dados reais
+ sem lista hardcoded
+ sem NO_GO fixo
+ dados técnicos recolhidos
+ atalhos operacionais disponíveis
= PR #33 validada para a tela Piloto Real
```

---

## 4. Relação entre PR #32 e PR #33

| Tema | PR #32 | PR #33 |
|---|---|---|
| Perfil/pessoa | Releitura independente e decisão pós-save | Não altera perfil diretamente |
| Tarefa após salvar | Disponível no perfil de pessoa | Apenas mostra tarefa vinculada quando existir |
| Mobile | Safe area e cards de partes de contrato | Não é objetivo principal |
| Pendências | Não altera a lista técnica do Piloto Real | Substitui lista fixa por pendências derivadas do caso |
| Gates/NO_GO | Não é objetivo central | Remove `NO_GO` fixo da superfície principal |
| Caso canônico | Não cria duplicidade | Não cria duplicidade |
| Segurança | Mantém RLS/sessão/auditoria | Mantém RLS/sessão/auditoria |
| Onboarding real | Não implementa | Não implementa |

As duas PRs dependem da base da PR #29. Não devem ser avaliadas como funcionalidades independentes de produção antes de validar essa cadeia de base e sua compatibilidade com a `main`.

---

## 5. Próxima sequência após aceite

Depois de validar as duas PRs:

1. Estender a decisão pós-save de PR #32 para relações, eventos, variantes, linhagens, documentos, achados, fontes, proposta, contrato, OS e micro-entregas.
2. Implementar o motor de onboarding real:

```text
Iniciar onboarding
→ localizar/reutilizar pelo mesmo case_id
→ criar se inexistente
→ primeira micro-entrega
→ próxima ação
→ tarefas compartilhadas/individuais
→ Caso 360
→ Painel Hoje
→ refresh confirmado
```

3. Aplicar na tela de Piloto apenas pendências reais, tarefas vinculadas e ações operacionais contextualizadas.
4. Só depois iniciar revisão ampla de layout e marca do Desk.

---

## Regra final

> PR #32 comprova o caminho de uma edição de pessoa virar persistência confirmada e decisão operacional. PR #33 retira o bloqueio estático do Piloto Real e o troca por pendências vivas. Nenhuma das duas, isoladamente, substitui o onboarding real nem a operação completa da Ana.

```text
Dado salvo.
Dado relido.
Refresh confirmado.
Tarefa quando necessária.
Pendência real, não lista fixa.
Caso único.
Nenhum trabalho perdido.
```
