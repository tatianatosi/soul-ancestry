# ORDEM DIRETA — REMOVER TODAS AS BARREIRAS DA OPERAÇÃO INTERNA

**Projeto:** `tatianatosi/soul-ancestry`  
**Prioridade:** P0 — incidente de usabilidade e operação.  
**Branch:** `hotfix/remover-barreiras-operacionais`  
**Escopo:** remover imediatamente todo mecanismo que bloqueia, condiciona, desabilita, exige aprovação ou impede o trabalho interno da proprietária autorizada.

> Esta ordem substitui interpretações anteriores que preservavam bloqueios internos em nome de “alta segurança”. A proprietária não consegue trabalhar. A plataforma precisa voltar a ser utilizável antes de qualquer melhoria adicional.

---

## 1. Regra única de operação

Para usuário **owner/admin autorizado da própria organização**, nenhuma ação interna de criação, edição, rascunho, salvamento, tarefa, caso, pessoa, documento, Ordem de Serviço, contrato em rascunho ou onboarding interno pode ser bloqueada por qualquer regra de produto.

```text
Ação interna do owner/admin
→ permitir
→ salvar dados reais
→ mostrar resultado
→ manter após refresh
```

Não criar “modo especial”, “exceção temporária”, “override”, reconfirmação, justificativa, workflow paralelo ou tela adicional para isso. O comportamento padrão do owner/admin deve ser trabalhar.

---

## 2. Remover todas as barreiras internas

Remover do front-end, back-end, guards, middleware, feature flags, queries, schemas de validação e regras de estado que impeçam ou desabilitem operação interna:

```text
NO_GO
GO/NO_GO
Pré-onboarding bloqueado
Bloqueado em Comercial
Bloqueado por requisito
Gate A, B, C, D, E, F, G ou H
Conferência do piloto
Checklist crítico
Pendência crítica
Evidência exigida
Quem decidiu
Decisão humana obrigatória
Revisão humana obrigatória
Executor de validações
Validação obrigatória
Confiança mínima
Pontuação mínima
Justificativa obrigatória
Motivo obrigatório de substituição/bloqueio
Confirmar como condição para salvar
Bloquear
Ação desabilitada por estado derivado
Ação desabilitada por campos incompletos
Ação desabilitada por placeholder
Ação desabilitada por falta de campanha/origem/investimento
Ação desabilitada por CAC, ROI ou ROAS
Ação desabilitada por auditoria
Ação desabilitada por contrato não assinado
Ação desabilitada por pagamento não conciliado
Ação desabilitada por onboarding não aprovado
Ação desabilitada por status comercial
Ação desabilitada por alias histórico
“Registrar caso-piloto no Desk”
“A leitura desta tela saiu do padrão acordado”
“Aviso de exibição”
“Sem dados suficientes” usado como bloqueio
```

Remover também toda mensagem, card, badge, aba, modal, tooltip, texto de erro ou banner que exiba esses mecanismos no fluxo de trabalho da proprietária.

Não esconder somente por CSS. Remover renderização, regra impeditiva e dependência de fluxo.

---

## 3. Manter somente autenticação básica

O único limite técnico aceitável é:

```text
usuário não autenticado → não acessa
usuário autenticado fora da organização → não acessa dados da organização
owner/admin da organização → opera livremente todos os dados internos da organização
```

Para este hotfix, owner/admin pode criar, editar, salvar, arquivar, restaurar, criar OS, criar contrato em rascunho, criar tarefa, editar pessoa, anexar documento e iniciar onboarding sem fluxos de aprovação.

Não usar RLS, sessão, role, auditoria, integração externa, status, contrato, pagamento, placeholder ou checklist como justificativa para bloquear o owner/admin.

Se uma policy de RLS hoje impedir owner/admin de gravar os próprios dados da organização, corrigi-la estritamente para permitir `SELECT`, `INSERT`, `UPDATE` e `DELETE` nos registros pertencentes à organização do usuário. Não liberar acesso entre organizações.

---

## 4. Fluxos que precisam funcionar agora

### Caso

```text
[Abrir caso]
[Editar caso]
[Salvar alterações]
[Registrar atualização]
[Arquivar]
[Restaurar]
```

### Pessoas

```text
[Adicionar pessoa]
[Editar]
[Salvar]
[Arquivar]
[Restaurar]
[Criar tarefa]
[Adicionar documento]
```

### Ordem de Serviço existente

A Ordem de Serviço já existe. Não criar duplicata e não substituir por contrato.

```text
[Ver OS]
[Editar OS]
[Salvar rascunho]
[Criar tarefa]
[Adicionar documento]
[Arquivar]
[Restaurar]
```

Campos vazios ou incompletos não impedem salvar rascunho.

### Contrato

```text
[Editar]
[Salvar rascunho]
[Ver prévia]
[Arquivar]
[Restaurar]
```

Contrato em rascunho não exige validação, revisão, justificativa, aprovação, confiança mínima ou assinatura.

### Onboarding

```text
[Iniciar onboarding]
[Adicionar tarefa]
[Concluir tarefa]
[Reabrir tarefa]
```

Onboarding interno deve ser iniciável independentemente de contrato, cobrança, proposta, dados incompletos, OS, gates ou pendências.

### Tarefas e Painel Hoje

```text
[Criar tarefa]
[Editar]
[Concluir]
[Reabrir]
[Adiar]
[Excluir]
[Abrir caso]
```

O Painel Hoje só mostra trabalho: tarefas vencidas, tarefas de hoje, próximas ações e casos sem próxima ação. Não exibir governança, auditoria, métricas, marketing, CAC, ROI, ROAS ou avisos internos.

---

## 5. Resolver aliases sem bloquear

O caso canônico é:

```text
CA-CID-AT-FAM-2026-001
```

Aliases conhecidos:

```text
CA-AUT-ANALUIZA-FAM-2026-001
CA-2026-ANA-001
CA-CID-AT-2026-002
```

Todo alias deve abrir o mesmo caso canônico, sem INSERT, erro, modal, confirmação ou bloqueio.

```text
alias → localizar case_id canônico → abrir caso
```

Remover definitivamente o fluxo que tenta registrar caso-piloto e falha porque o identificador é alias.

---

## 6. Corrigir salvamento sem condições

Todo botão Salvar deve funcionar para owner/admin:

```text
validar formato básico quando aplicável
executar INSERT/UPDATE real
mostrar “Salvo.” após sucesso
recarregar dados da tela
preservar valores após refresh
exibir o erro real se houver falha técnica
```

Proibido bloquear salvamento por:

```text
campo opcional vazio
placeholder
status do caso
status comercial
estado do onboarding
contrato não assinado
falta de documento
falta de pagamento
falta de campanha
falta de investimento
origem de lead
atribuição
CAC/ROI/ROAS
gate
revisão
auditoria
justificativa
confiança
```

---

## 7. Remover interface de controle excessivo

Remover do Caso 360, OS, contratos, pessoas, onboarding, Painel Hoje e telas de marketing operacional:

```text
Abas de Auditoria
Abas de Validações
Abas de Revisão
Cards de governança
Cards de bloqueio
Cards de checklist de prontidão
Cards de “evidência exigida”
Cards de “padrão acordado”
Cards de status derivado
Banners de rascunho proibido
Banners de não enviar/não assinar para trabalho interno
Botões Confirmar
Botões Bloquear
Botões Executar validações
Botões Solicitar revisão humana
```

Se houver necessidade futura de auditoria, ela deve existir apenas como log técnico invisível no caminho normal de trabalho, sem bloquear e sem ocupar a interface.

---

## 8. Mobile: tornar utilizável

Testar e corrigir em 375px e 430px:

```text
Nenhum case code pode quebrar por caractere.
Nenhum título, botão, card ou aba pode sair da tela.
Nenhum botão pode ficar inacessível ou sobreposto.
O Assistente não pode cobrir campos, alertas, textos, botões ou área de salvar.
Cards e formulários ocupam largura disponível.
Abas devem ser roláveis ou reorganizadas de forma legível.
```

Não entregar correção visual somente em screenshot. Validar os fluxos clicáveis no preview mobile.

---

## 9. Proibido nesta tarefa

```text
Não criar mais auditorias.
Não criar mais regras de bloqueio.
Não criar mais fluxos de aprovação.
Não criar mais status derivados impeditivos.
Não criar novo caso para Ana Luiza.
Não criar nova Ordem de Serviço para substituir a existente.
Não apagar dados reais.
Não executar DROP TABLE, TRUNCATE, reset de banco ou DELETE em massa.
Não usar feature flag para mostrar uma versão falsa/demonstrativa.
Não responder com planejamento, relatório, build verde ou teste unitário em lugar da execução.
```

---

## 10. Testes manuais de aceite

No preview Vercel da branch, com owner/admin autenticado, demonstrar:

1. Abrir o caso por `CA-CID-AT-FAM-2026-001`.
2. Abrir o mesmo caso por `CA-AUT-ANALUIZA-FAM-2026-001`.
3. Abrir o mesmo caso por `CA-2026-ANA-001`.
4. Não ver `NO_GO`, gates, pré-onboarding bloqueado, bloqueado em comercial, auditoria, validações, revisão, justificativa, confirmar ou bloquear.
5. Editar uma pessoa e salvar.
6. Recarregar a tela e confirmar persistência.
7. Abrir a Ordem de Serviço existente.
8. Editar a OS e salvar rascunho com campos incompletos.
9. Recarregar e confirmar que a OS continua alterada.
10. Criar uma tarefa no caso ou na OS.
11. Ver a tarefa no Painel Hoje.
12. Iniciar onboarding interno sem qualquer condição.
13. Criar e salvar contrato em rascunho sem validação/revisão.
14. Abrir em 375px e concluir os testes acima.
15. Abrir em 430px e concluir os testes acima.
16. Confirmar que o Assistente não cobre nenhuma ação essencial.

---

## 11. Entrega

Entregar somente após os testes manuais passarem:

```text
Branch: hotfix/remover-barreiras-operacionais
PR ou hash do commit
Preview Vercel
Lista de componentes/regras removidos
Resultado dos 16 testes manuais
Lista de falhas técnicas reais remanescentes, se houver
```

Não declarar “concluído” se qualquer item ainda exibir ou impor uma barreira à operação interna da proprietária.
