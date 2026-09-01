# REVERSÃO EMERGENCIAL — RESTAURAR PLATAFORMA OPERACIONAL

**Prioridade:** P0 absoluta  
**Projeto:** `tatianatosi/soul-ancestry`  
**Branch obrigatória:** `hotfix/reverter-bloqueios-e-restaurar-operacao`  
**Objetivo:** reverter imediatamente as mudanças que converteram a plataforma operacional em telas de gates, bloqueios, auditoria, validações e rascunhos não acionáveis.

> Não criar funcionalidades novas nesta tarefa. Não redesenhar arquitetura. Não adicionar governança. Não criar prompts, relatórios, checklist, dashboards, migrações destrutivas ou dados de demonstração. Restaurar primeiro a capacidade da proprietária de operar a plataforma.

---

## 1. Incidente

A versão atualmente disponível impede o uso prático da própria plataforma. As telas exibem mecanismos de bloqueio e controle como fluxo central:

```text
PRÉ-ONBOARDING BLOQUEADO
NO_GO
Gates A a H
7 gates críticos pendentes
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
CAC / ROI / ROAS como conteúdo de trabalho
Registrar caso-piloto no Desk
Erro de alias histórico
```

Também há regressão visual crítica em celular:

```text
Código do caso quebra por caractere.
Cabeçalho ocupa largura errada.
Botão “Salvar alterações” fica fora de alinhamento ou parcialmente inacessível.
Botão Assistente cobre campos, ações e conteúdo.
Botões e abas extrapolam a tela.
```

---

## 2. Ação imediata obrigatória

1. Identificar o último commit/deploy em que a plataforma ainda funcionava como mesa operacional.
2. Criar branch a partir de `main`:

```text
hotfix/reverter-bloqueios-e-restaurar-operacao
```

3. Reverter somente os commits, componentes, feature flags, rotas, guards, middleware, validações e renderizações que introduziram:

```text
gates
NO_GO
pré-onboarding bloqueado
bloqueio comercial
approval/confirmation flow
justificativa obrigatória
revisão humana obrigatória
confiança mínima como impedimento
contrato como fluxo exclusivo
painel com alerta de “padrão acordado”
checklist CAC/ROI/ROAS no fluxo de operação
botões desabilitados por governança
```

4. Se não houver um commit anterior confiável, fazer reversão cirúrgica apenas no front-end e nas regras de bloqueio, preservando dados.
5. Publicar preview Vercel da branch antes de qualquer merge.
6. Não fazer merge em `main` até validação manual da proprietária.

---

## 3. Regra de segurança de dados

É proibido nesta reversão:

```text
DROP TABLE
TRUNCATE
DELETE em massa
resetar banco
apagar cases
apagar pessoas
apagar documentos
apagar contratos
apagar aliases
apagar histórico
alterar dados reais para dados de demonstração
```

A reversão deve alterar fluxo e interface, não apagar registros reais.

---

## 4. Resultado mínimo que deve voltar a funcionar

### Caso

No Caso 360, a proprietária deve ver e conseguir usar:

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

Nenhuma dessas ações pode ser bloqueada por gate, aprovação, auditoria, confirmação adicional, confiança mínima, justificativa ou status derivado.

### Pessoas

Na área de pessoas:

```text
[Adicionar pessoa]
[Editar]
[Salvar]
[Criar tarefa]
[Adicionar documento]
```

“Identidade não revisada” e “Dados restrita” podem existir apenas como informação, nunca como bloqueio de owner/admin.

### Ordem de Serviço

Se a Ordem de Serviço tiver existido em commit anterior, restaurar rota, botão e fluxo exatamente do ponto funcional mais recente.

Se nunca existiu como objeto real, não fingir que existe em tela de contrato. Exibir, de modo transitório e simples:

```text
Ordem de Serviço: em implantação.
Enquanto isso, use “Registrar atualização” e “Criar tarefa” no caso.
```

Não substituir OS por contrato-base, auditoria, gates ou tela de validações.

### Contrato

O contrato deve voltar a ser apenas um rascunho editável.

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

Manter apenas:

```text
[Editar]
[Salvar rascunho]
[Ver prévia]
[Arquivar]
```

Campos vazios devem ser editáveis e não bloquear o salvamento do rascunho.

### Onboarding

Substituir todo bloqueio de pré-onboarding por:

```text
Onboarding: disponível para iniciar
[Iniciar onboarding]
```

Se ainda não houver motor de onboarding real, o botão deve criar uma tarefa real “Iniciar onboarding de [cliente]”, com prazo editável, e abrir o caso. Não pode estar desabilitado.

### Painel Hoje

O Painel Hoje deve conter apenas trabalho real:

```text
Tarefas vencidas
Tarefas de hoje
Próximas ações
Casos sem próxima ação
```

Remover:

```text
A leitura desta tela saiu do padrão acordado
Bloco métricas-dia não faz parte da ordem canônica
Governança
Catálogo
Métricas internas
Checklist de prontidão
CAC
ROI
ROAS
```

---

## 5. Resolver bug de alias sem criar casos

### Caso canônico

```text
CA-CID-AT-FAM-2026-001
```

### Aliases existentes

```text
CA-AUT-ANALUIZA-FAM-2026-001
CA-2026-ANA-001
CA-CID-AT-2026-002
```

### Comportamento obrigatório

Ao abrir qualquer alias:

```text
resolver alias → obter case_id canônico → abrir o caso canônico
```

Nunca fazer `INSERT` automático em `cases` quando o código já exista como alias.

Remover da interface:

```text
[Registrar caso-piloto no Desk]
```

Se a resolução ainda não estiver implementada, apresentar uma ação segura:

```text
[Abrir caso canônico]
```

que navega diretamente para o case_id existente, sem erro e sem criar dados.

---

## 6. Corrigir salvamento

Todo botão “Salvar” deve:

```text
executar update/insert real
aguardar resposta do banco
exibir “Salvo.” somente após sucesso
recarregar/invalidate a query da tela
mostrar valor salvo na tela
preservar valor após refresh
exibir mensagem técnica em caso de falha
```

Remover qualquer bloqueio que exija confirmação, justificativa, aprovação ou confiança mínima antes de salvar um rascunho ou dado operacional.

---

## 7. Correção mobile obrigatória

Testar o preview em 375px e 430px de largura.

Obrigatório:

```text
Nenhum case code quebra por caractere.
Nenhum botão fica fora da área visível.
Nenhum botão fica parcialmente coberto.
Assistente não pode cobrir conteúdo, campo, erro ou ação crítica.
Cabeçalho deve ter layout de coluna/flex responsivo.
Cards devem usar largura disponível sem overflow horizontal.
Abas devem rolar horizontalmente ou quebrar em linhas sem cortar labels.
```

Correção recomendada:

```css
@media (max-width: 640px) {
  .app-header { grid-template-columns: auto minmax(0, 1fr); }
  .app-header-actions { width: 100%; display: flex; flex-wrap: wrap; }
  .case-code { overflow-wrap: anywhere; word-break: normal; }
  .page-content, .card, .form-control { min-width: 0; max-width: 100%; }
  .assistant-fab { bottom: max(1rem, env(safe-area-inset-bottom)); }
}
```

Adaptar as classes à implementação do projeto. O efeito visual é obrigatório; o trecho não deve ser copiado cegamente se a arquitetura for diferente.

---

## 8. Checklist de aceite manual

A hotfix só pode ser considerada pronta quando todos os itens abaixo funcionarem no preview:

1. Abrir o Caso 360 de Ana Luiza.
2. Abrir o mesmo caso por `CA-CID-AT-FAM-2026-001`.
3. Abrir o mesmo caso por `CA-AUT-ANALUIZA-FAM-2026-001` sem erro.
4. Não ver “Registrar caso-piloto no Desk”.
5. Não ver `NO_GO`, “Pré-onboarding bloqueado”, gates A–H, “Bloqueado em Comercial” ou auditoria no fluxo operacional.
6. Editar uma pessoa e salvar.
7. Recarregar a página e confirmar persistência da alteração.
8. Criar uma tarefa a partir do caso.
9. Ver a tarefa no Painel Hoje.
10. Abrir contrato e salvar rascunho com campo incompleto.
11. Iniciar onboarding ou, se o motor não existir, criar automaticamente uma tarefa real de onboarding.
12. Não ver CAC/ROI/ROAS/checklist de atribuição no Painel Hoje nem no Caso 360.
13. Usar o aplicativo em 375px sem sobreposição do Assistente.
14. Usar o aplicativo em 430px sem quebra de código por caractere, overflow ou botão inacessível.

---

## 9. Entrega obrigatória

Entregar somente:

```text
1. Branch hotfix/reverter-bloqueios-e-restaurar-operacao
2. Preview Vercel funcional da branch
3. Lista objetiva de commits revertidos ou arquivos alterados
4. Resultado dos 14 testes manuais
5. Falhas remanescentes reais, se existirem
```

Não entregar como conclusão:

```text
build passou
testes unitários passaram
relatório foi criado
prompt foi gerado
mock foi renderizado
dados de demonstração foram exibidos
```

A conclusão válida é a proprietária recuperar a capacidade de operar o caso sem bloqueios.