# INCIDENTE P0 — RESTAURAR MOTOR CONTRATUAL, OS, ANEXOS E OPERAÇÃO SEM BLOQUEIOS

**Projeto:** `tatianatosi/soul-ancestry`  
**Ambiente afetado:** produção/preview que a proprietária está abrindo no celular  
**Branch obrigatória:** `hotfix/restaurar-operacao-contratual-sem-bloqueios`  
**Prioridade:** P0 absoluta  
**Regra de entrega:** código funcional no preview + teste manual reproduzível. Relatório, PDF, PR citado, commit citado, build verde ou teste unitário não são entrega.

---

## 1. Ordem direta

A plataforma foi convertida em uma interface de auditoria, exigências, formulário técnico e bloqueios. Isso está impedindo a proprietária de operar casos, contratos, Ordens de Serviço, anexos e onboarding.

**Restaurar imediatamente a operação interna.**

Não criar arquitetura nova, motor novo, nova taxonomia, novas aprovações, novas regras, novas auditorias, novas telas de governança ou qualquer reescrita ampla nesta tarefa. Corrigir o fluxo existente e restaurar os módulos que foram escondidos/substituídos por formulários e validações.

---

## 2. Evidência do incidente

Os prints do ambiente ativo mostram todos os sintomas abaixo simultaneamente:

```text
Caso CA-CID-AT-FAM-2026-001 ainda com “PRÉ-ONBOARDING BLOQUEADO”.
Caso/painel exibindo NO_GO, gates, bloqueios, conferência Canva e prazos vencidos.
Tela de onboarding afirmando: “A ativação depende de requisitos verificáveis. A interface explica o bloqueio; o banco impede o desvio.”
Tela com “Aprovação interna de ativação registrada”, exigência de evidência e ação “Autorizar isenção”.
Modal de isenção com motivo, administrador autorizador, data/hora e expiração.
Contrato com tabs principais “Validações”, “Revisão” e “Auditoria”.
Checklist jurídico automático mostrando “7 bloqueio(s)”.
Contrato com estados `pending_contract` e `blocked_by_contract`.
Formulário de cláusula exigindo código, título, tipo, referência de cláusula-base, justificativa de alteração e declaração de precedência.
Formulário de anexo exigindo código, título, tipo e obrigatoriedade.
Painel Hoje exibindo apenas contadores, sem lista de tarefas acionáveis.
Tela de “Origem do escopo” como auditoria/exportação CSV, sem operação de caso.
Assistente flutuante cobrindo tabelas, formulários, avisos e botões.
Layout mobile quebrando case code por caractere, cabeçalho e botão Salvar alterações.
```

Esses são defeitos de fluxo e UX operacional. Não são “segurança necessária”.

---

## 3. O que deve permanecer e o que deve sair

### Manter

Apenas estes limites técnicos básicos:

```text
Usuário não autenticado não acessa.
Usuário de outra organização não acessa dados da organização.
Owner/admin autorizado pode operar todos os dados internos da própria organização.
```

### Remover do fluxo interno do owner/admin

Remover tanto da interface quanto da lógica que desabilita, condiciona, impede ou redireciona a operação:

```text
NO_GO
GO/NO_GO
Pré-onboarding bloqueado
Bloqueado em Comercial
Gates A–H
Gate de escopo
Conferência Canva
Conferência do piloto
Requisitos de ativação como pré-condição
Aprovação interna de ativação
Autorizar isenção
Reverter requisito
Exceção a um gate
Evidência exigida
Justificativa obrigatória
Declaração de precedência obrigatória
Confiança mínima
Pontuação mínima
Revisão humana obrigatória
Validações obrigatórias
Checklist jurídico automático como bloqueio
Bloqueio(s)
blocked_by_contract
pending_contract
Auditoria como aba, tela ou etapa de trabalho
Origem do escopo como tela principal
“Banco impede o desvio”
Avisos de padrão, governança e leitura auditável no fluxo operacional
Campos obrigatórios que impedem salvar um rascunho
Botões Confirmar, Bloquear, Executar validações e Solicitar revisão humana
```

Não ocultar somente por CSS. Remover guard, condição, handler bloqueante, feature flag e lógica de estado correspondente no fluxo do owner/admin.

---

## 4. Caso de referência e aliases

### Caso canônico

```text
CA-CID-AT-FAM-2026-001
```

### Aliases que devem abrir o mesmo caso

```text
CA-AUT-ANALUIZA-FAM-2026-001
CA-2026-ANA-001
CA-CID-AT-2026-002
```

### Regra obrigatória

```text
case code ou alias
→ localizar case_id canônico
→ abrir o mesmo Caso 360
→ nunca criar novo caso
→ nunca exigir isenção, gate, aprovação ou justificativa
```

Remover definitivamente a ação e qualquer handler relacionado a:

```text
Registrar caso-piloto no Desk
```

---

## 5. Restaurar Caso 360 como mesa de trabalho

A tela inicial de um caso deve conter somente informações e ações operacionais úteis.

### Ações obrigatórias e sempre disponíveis para owner/admin

```text
[Abrir caso]
[Editar caso]
[Salvar alterações]
[Registrar atualização]
[Adicionar pessoa]
[Editar pessoa]
[Adicionar documento]
[Criar tarefa]
[Abrir Ordem de Serviço]
[Editar Ordem de Serviço]
[Iniciar onboarding]
```

### Estado visível aceitável

```text
Status: Rascunho | Em preparação | Em andamento | Concluído | Arquivado
Pendências: [quantidade]
Próxima ação: [tarefa ou ação objetiva]
```

Campos faltantes devem virar pendência ou tarefa opcional. Não devem alterar o status para bloqueado e não devem impedir nenhuma ação interna.

---

## 6. Ordem de Serviço: restaurar como objeto operacional real

A lista de OS já mostra uma Ordem de Serviço existente:

```text
2026-OS-0002
Caso: CA-CID-AT-FAM-2026-001
```

Não criar uma OS substituta e não tratar contrato como OS.

### A OS existente deve permitir

```text
[Abrir]
[Editar]
[Salvar rascunho]
[Adicionar/editar escopo]
[Definir responsável]
[Definir prazo]
[Registrar observação]
[Criar tarefa vinculada]
[Adicionar documento]
[Arquivar]
[Restaurar]
```

### Campos mínimos da OS

```text
Número
Caso
Título
Status
Responsável
Escopo
Prazo
Valor e moeda opcionais
Observações
Documentos vinculados
Tarefas vinculadas
```

Nenhum campo deve ser obrigatório para salvar o rascunho, com exceção da associação ao caso quando for criação de OS nova. A OS deve reabrir após refresh com as alterações preservadas.

### Remover da OS

```text
Bloqueios
Gates
Conferências
Validações
Aprovação interna
Isenção
Auditoria
Justificativa obrigatória
Requisito de contrato assinado
Requisito de cobrança
Requisito de pagamento conciliado
Requisito de anexos obrigatórios
```

---

## 7. Restaurar o motor contratual

O motor contratual não pode abrir como um painel de auditoria, checklist jurídico ou cadastro técnico de cláusula.

### Rota inicial de contrato

Ao abrir contrato, a visão padrão deve ser:

```text
Resumo
Partes
Escopo
Conteúdo
Anexos
[Salvar rascunho]
[Gerar prévia]
```

A tela de conteúdo deve permitir editar o documento ou uma observação de contrato e salvar.

### Elementos que devem sair das abas principais

```text
Validações
Revisão
Auditoria
Fontes
Origem do escopo
Versões como fluxo dominante
```

Se algum dado técnico tiver de continuar existindo no código, coloque-o em uma única seção recolhida:

```text
Mais opções > Dados técnicos
```

Ela não pode aparecer por padrão, bloquear qualquer ação ou ficar na navegação principal.

### Rascunho contratual

Para owner/admin:

```text
[Editar]
[Salvar rascunho]
[Ver prévia]
[Arquivar]
[Restaurar]
```

Rascunho pode ter contratada incompleta, contratante incompleto, membros pendentes, escopo em construção, valor vazio, prazo vazio e anexos ausentes. Esses campos aparecem como avisos discretos em “Pendências”, nunca como bloqueio.

### Não implementar nesta tarefa

Não enviar contrato, não disparar cobrança, não solicitar assinatura, não integrar terceiros e não executar ação externa. O escopo é recuperar o rascunho interno e a operação.

---

## 8. Cláusulas: simplificar e não bloquear

A tela atual exige metadados técnicos antes de permitir trabalhar o texto.

### Formulário padrão de cláusula

```text
Título
Texto
[Salvar cláusula]
```

### Detalhes avançados, opcionais e recolhidos

```text
Código da cláusula
Tipo
Referência da cláusula-base
Justificativa da alteração
Declaração de precedência
```

### Regras

- Não exigir cláusula-base, justificativa, precedência ou revisão humana para salvar uma cláusula de rascunho.
- Não impedir edição por silêncio, substituição, tipo ou ausência de metadados.
- O botão Assistente não pode cobrir o formulário, mensagens de erro ou botão Salvar.

---

## 9. Anexos: restaurar como função de documento simples

A tela atual de anexos é um formulário de cadastro técnico. Restaurar a operação simples.

### Formulário padrão de anexo

```text
Arquivo ou URL
Título opcional
Tipo opcional
[Adicionar anexo]
```

### Opcional/recolhido

```text
Código interno
Obrigatório
Origem
Classificação técnica
```

### Regras

- Adicionar anexo não exige código, justificativa, aprovação, validação, vínculo financeiro, cláusula ou checklist.
- O anexo aparece imediatamente na lista depois de salvo.
- O anexo continua após refresh.
- A exclusão/arquivamento de anexo deve pedir confirmação simples no próprio app, mas a criação e edição interna não.
- Não usar `SUPABASE_SERVICE_ROLE_KEY` no navegador. O upload deve usar sessão autorizada/RLS apropriada ou endpoint server-side seguro.

---

## 10. Onboarding: sair da tela de ativação/gates

Remover a rota e a interface que dizem:

```text
A ativação depende de requisitos verificáveis.
A interface explica o bloqueio; o banco impede o desvio.
Requisitos de ativação.
Aprovação interna de ativação.
Autorizar isenção.
Exceção a um gate.
```

### Substituir por

```text
Onboarding do caso
Status: Não iniciado | Em andamento | Concluído
[Iniciar onboarding]
[Adicionar tarefa]
[Editar tarefa]
[Concluir tarefa]
[Reabrir tarefa]
```

Iniciar onboarding cria um registro interno e tarefas iniciais editáveis. Não deve depender de contrato, valor, cobrança, anexos, aprovação, gate, isenção, validação ou status comercial.

---

## 11. Painel Hoje: entregar tarefas, não números vazios

A tela atual mostra contadores como “1 vencido” e “2 sem responsável”, mas não entrega os itens de trabalho.

### Substituir por lista real

Cada item deve mostrar:

```text
Título da tarefa
Caso
Responsável
Prazo
Status
[Abrir caso]
[Concluir]
[Adiar]
[Editar]
```

### Seções

```text
Vencidas
Vencem hoje
Próximas ações
Sem responsável
Sem prazo
```

Remover do Painel Hoje:

```text
Incluir demonstrações
Métricas internas
Governança
Catálogo
CAC
ROI
ROAS
Alertas de auditoria
Contadores sem links acionáveis
```

---

## 12. Remover telas de auditoria e “origem” do fluxo

A tela “Origem do escopo” e as tabelas de cadeia “Proposta VN → SKU → Condição comercial → OS” não devem ser a porta de entrada para trabalhar uma OS ou contrato.

- Manter exportação CSV somente em uma área administrativa separada, se necessária.
- Remover a rota da navegação operacional.
- Não exibir termos como “auditável”, “nada é vinculado, corrigido ou enviado aqui” para a proprietária que está tentando trabalhar.

---

## 13. Persistência: prova obrigatória para cada Salvar

Para todos os botões de salvar em caso, pessoa, OS, contrato, cláusula, anexo e tarefa:

```text
1. Executar INSERT/UPDATE real.
2. Aguardar resposta do banco.
3. Exibir “Salvo.” somente após sucesso.
4. Atualizar/invalidate a consulta da tela.
5. Mostrar o novo dado imediatamente.
6. Manter o novo dado após refresh.
7. Se falhar, mostrar erro técnico útil e não mascarar a falha com mensagem de bloqueio.
```

### Proibido

```text
Salvar só em estado local.
Exibir sucesso falso.
Redirecionar sem confirmar persistência.
Ocultar erro de API, banco, storage ou RLS.
Exigir justificativa, aprovação, gate ou validação para salvar rascunho.
```

---

## 14. Responsividade móvel — requisito de aceite, não melhoria futura

Testar os fluxos em **375px** e **430px** de largura.

### Corrigir obrigatoriamente

```text
Case code não pode quebrar por caractere.
Cabeçalho não pode sobrepor título, código, status e botão Salvar.
Nenhum card, tabela, aba ou formulário pode ter overflow horizontal que esconda ações.
Abas devem ter scroll horizontal funcional ou reflow legível.
Botões devem caber e permanecer clicáveis.
Assistente não pode cobrir conteúdo, input, botão, snackbar, erro, tabela ou controle de navegação.
Quando teclado estiver aberto, ação de salvar/adicionar deve continuar alcançável.
```

### Assistente

- Em mobile, posicionar fora de formulários e ações fixas.
- Se não houver espaço seguro, recolher/minimizar automaticamente.
- Não usar `z-index` que sobreponha modal, input ativo, botão de submit ou toast de erro.

---

## 15. Restrições de segurança e integridade

Nesta hotfix:

```text
Não apagar casos, pessoas, OS, contratos, anexos, documentos, tarefas, aliases ou histórico.
Não executar DROP TABLE, TRUNCATE, DELETE em massa ou reset de banco.
Não criar dados demo para mascarar falta de registros reais.
Não desativar login ou acessar dados entre organizações.
Não expor service role key no front-end.
Não realizar envio de e-mail, WhatsApp, contrato, cobrança, assinatura ou outra ação externa.
```

O trabalho interno da proprietária deve ficar livre de gates e auditoria; integridade de dados e isolamento por organização devem continuar.

---

## 16. Aceite manual obrigatório

Executar no deployment de preview da branch, autenticado como owner/admin, e entregar o resultado de cada item:

1. Abrir `CA-CID-AT-FAM-2026-001`.
2. Abrir `CA-AUT-ANALUIZA-FAM-2026-001` e chegar ao mesmo caso canônico.
3. Confirmar que não aparecem `NO_GO`, pré-onboarding bloqueado, gates, aprovação de ativação, isenção ou auditoria no Caso 360.
4. Abrir a OS existente `2026-OS-0002` do caso.
5. Alterar observação ou escopo da OS, salvar, dar refresh e confirmar persistência.
6. Criar uma tarefa vinculada à OS e confirmá-la no Painel Hoje com link para o caso.
7. Abrir contrato existente e confirmar que a tela inicial é Resumo/Partes/Escopo/Conteúdo/Anexos, sem tabs de Validações, Revisão ou Auditoria.
8. Editar um dado de rascunho do contrato, salvar, refresh e confirmar persistência.
9. Adicionar um anexo com apenas arquivo/URL e título opcional, salvar, refresh e confirmar persistência.
10. Adicionar cláusula com somente título e texto, salvar, refresh e confirmar persistência.
11. Iniciar onboarding interno sem gate, aprovação, isenção ou evidência.
12. Confirmar que o Painel Hoje mostra tarefas acionáveis e não apenas números.
13. Repetir os fluxos relevantes em 375px.
14. Repetir os fluxos relevantes em 430px.
15. Confirmar que o Assistente não encobre nenhuma ação, formulário, erro ou dado essencial.

Se qualquer item falhar, informar:

```text
número do teste
rota
ação executada
endpoint/tabela/storage/RPC chamado
status HTTP ou erro do banco
policy/guard/condição que causou o bloqueio
correção aplicada
novo resultado do mesmo teste
```

---

## 17. Entrega final permitida

Responder somente após executar e testar. A resposta deve ter:

```text
Branch
Commit/PR
Preview Vercel
Rotas corrigidas
Tabelas/endpoints afetados
Resultado dos 15 testes manuais
Falhas reais restantes, se houver
```

Não responder com PDF, relatório narrativo, promessa, explicação de arquitetura, número de testes unitários, “zero erros de runtime” ou afirmação de que algo está mesclado.

A plataforma estará restaurada somente quando a proprietária conseguir abrir caso, editar/salvar, abrir OS, salvar OS, trabalhar contrato e anexos, criar tarefa e iniciar onboarding sem gates, validações, auditoria ou barreiras internas.