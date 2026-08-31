# Prompt de Execução — Reconciliação de Contratos, Matriz Jurídica e Mapa de Autoridade Admin

**Projeto:** `tatianatosi/soul-ancestry`  
**Infraestrutura:** Supabase próprio + Vercel + GitHub  
**Prioridade:** preservar a semântica jurídica do contrato, reconciliar alterações concorrentes das PRs #28 e #32 e continuar o Mapa de Autoridade Admin sem alterar a taxonomia visual aprovada ou quebrar a operação em andamento.

---

## 1. Contexto

A revisão de layout e a arquitetura operacional não podem tratar tudo que não é ação imediata como “Dados técnicos”.

No Clube Ancestral, existem três camadas distintas:

```text
Contrato e validação jurídica
≠ Dados técnicos de sistema
≠ Biblioteca Mestre / conteúdo por caso
```

Matrizes jurídicas, modelos de contrato, versões, revisão humana, parâmetros contratuais, cláusulas e exigências documentais pertencem ao domínio jurídico/contratual. Não podem ser escondidos, rebatizados ou rebaixados para uma seção genérica de “Dados técnicos”.

Dados técnicos devem ficar reservados para diagnóstico de sistema, IDs, auditoria de fundo, logs, integridade, sincronização e falhas de integração.

---

## 2. Objetivo principal

Executar três entregas coordenadas, sem misturar escopos:

1. Reconciliar a tela de contrato alterada em paralelo pelas PRs #28 e #32.
2. Preservar a matriz e os modelos jurídicos como conteúdo jurídico acessível.
3. Continuar o Mapa de Autoridade Admin no mesmo documento versionado, expandindo de Pessoas & Famílias/Caso 360/Contrato/Piloto para Painel Hoje, Comercial e Pesquisa.

Não iniciar revisão global de layout, mudança de taxonomia, nova arquitetura de menu ou funcionalidades externas nesta tarefa.

---

## 3. Regra semântica obrigatória

### 3.1 Contrato e jurídico

Devem permanecer reconhecíveis como domínio jurídico/contratual:

```text
Partes
Escopo
Cláusulas
Anexos
Versões
Revisão jurídica
Observações
Matriz jurídica aplicável
Modelo contratual vigente
Parâmetros contratuais
Conflitos e exigências documentais jurídicas
Decisões humanas de revisão
```

Esses conteúdos podem ter hierarquia visual adequada no mobile, mas não devem ser classificados como “Dados técnicos”.

### 3.2 Dados técnicos

Devem conter apenas itens de sistema e rastreabilidade técnica:

```text
IDs técnicos
Auditoria em segundo plano
Logs
Integridade de dados
Erros de sincronização
Diagnóstico de integração
Rastreabilidade técnica
Estado de cache/releitura, quando necessário ao suporte
```

### 3.3 Biblioteca Mestre

Deve conter conteúdo/produção por caso e referências de trabalho:

```text
Entregas
Relatórios
Templates de conteúdo
Materiais de memória e legado
Referências internas
Conteúdo reutilizável por caso
Status, responsável, próxima ação e visibilidade
```

Biblioteca Mestre não substitui modelos jurídicos, matriz jurídica ou versões contratuais vigentes.

---

## 4. Conflito a reconciliar: PR #28 e PR #32

### PR #28

**Título:** `Tela de Contrato: 5 ações principais em destaque, dados técnicos recolhidos`  
**Situação:** aberta; base na `main`; alteração ampla da tela `contratos.$id.tsx`.

Direção descrita:

```text
Ações principais em destaque
Versões/Revisão deslocadas junto de Fontes/Validações para “Dados técnicos”
```

### PR #32

**Título:** `Pessoa: salvar com releitura real + decisão de tarefa; ajustes mobile`  
**Situação:** draft; baseada na PR #29; altera a mesma tela `contratos.$id.tsx`.

Direção descrita:

```text
Partes como cards em telas abaixo de md
Tabela horizontal apenas em md+
Remoção do botão “Enviar ao cliente (desabilitado)”
Ajustes de safe-area e observações
```

### Risco

As duas PRs alteram a mesma superfície a partir de bases diferentes. Se uma for mesclada antes da outra sem reconciliação explícita, pode sobrescrever silenciosamente:

- cards mobile de Partes;
- remoção do botão morto de envio;
- barra de ações úteis;
- observações;
- organização de Versões/Revisão;
- comportamento de persistência;
- ações de tarefa e revisão humana.

---

## 5. Entrega 1 — PR de reconciliação do contrato

Criar uma PR isolada de reconciliação, baseada na `main` mais atualizada e somente depois de atualizar/reconciliar as branches necessárias.

Nome sugerido:

```text
fix/reconciliar-contrato-juridico-mobile
```

### 5.1 Estrutura visual obrigatória do contrato

```text
Contrato

[Editar contrato]
[Salvar rascunho]
[Adicionar cláusula]
[Adicionar anexo]
[Criar tarefa]
[Solicitar revisão humana]

Resumo
Partes
Escopo
Cláusulas
Anexos
Versões
Revisão jurídica
Observações

Matriz jurídica e modelo aplicável
[recolhido/expansível quando necessário, mas juridicamente identificado]

Dados técnicos
[recolhido]
- IDs
- auditoria de fundo
- logs
- integridade
- diagnóstico de integração
```

### 5.2 O que deve ser preservado da PR #32

- Cards empilhados para Partes em telas abaixo de `md`.
- Tabela horizontal somente em desktop/telas médias ou maiores.
- Remoção de “Enviar ao cliente (desabilitado)” como botão de destaque.
- Safe-area e espaço inferior para não encobrir controles no mobile.
- Observações quando já existentes na tela.
- Nenhuma perda do comportamento de salvar/reler confirmado.

### 5.3 O que pode ser preservado da PR #28

Preservar apenas o que for realmente útil e ligado a funções existentes:

```text
Editar contrato
Salvar rascunho
Adicionar cláusula
Adicionar anexo
Criar tarefa
Solicitar revisão humana
```

Não manter botão apenas decorativo, desabilitado ou sem fluxo real.

### 5.4 Correção obrigatória de nomenclatura

Não colocar estes itens em “Dados técnicos”:

```text
Versões
Revisão jurídica
Matriz jurídica
Modelo vigente
Parâmetros contratuais
Cláusulas
Anexos
```

Se a interface precisar reduzir poluição visual, usar agrupamento juridicamente correto, por exemplo:

```text
Instrumento e revisão jurídica
Modelos, matriz e parâmetros aplicáveis
Histórico de versões
```

Mas não usar o rótulo genérico “Dados técnicos”.

### 5.5 Regras de operação

- Rascunho de contrato deve poder ser preenchido e salvo com requisitos mínimos estruturais.
- Cláusula deve salvar com título e texto, quando essa for a regra já aprovada.
- Anexo deve salvar com título, com código interno opcional/gerado quando aplicável.
- Partes e escopo devem ser editáveis conforme o schema real e as permissões existentes.
- Revisão jurídica é ação interna; deve persistir e criar/atualizar tarefa ou próxima ação quando aplicável.
- Assinatura, envio, convite externo e cobrança continuam ações externas/formais com regras próprias e confirmação explícita.
- Não usar assinatura, pagamento, portal, gate ou checklist futuro para impedir rascunho e trabalho interno.

---

## 6. Entrega 2 — Mapa de Autoridade Admin

Continuar no mesmo documento versionado já iniciado, sem criar relatórios concorrentes.

Nome canônico sugerido:

```text
docs/auditorias/MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md
```

### 6.1 Áreas já cobertas ou em cobertura

```text
Pessoas & Famílias / G-02
Caso 360
Contratos
Piloto Real
```

### 6.2 Próxima expansão obrigatória

Continuar por commits separados, na ordem:

```text
1. Painel Hoje
2. Comercial
3. Pesquisa
4. Documentos e solicitações
5. Onboarding e jornada
6. Operações / tarefas / micro-entregas
7. Portal e App Cliente
8. Marketing
9. Configuração, equipe, catálogo e integrações
```

### 6.3 Tabela obrigatória por rota/aba

| Grupo | Rota | Aba/área | Entidade | Ler | Criar | Editar | Arquivar | Concluir/Reprogramar | Função/RPC | Tabela/view | Papel/permissão | Regra de estado | UI existe? | Persistência confirmada? | Próxima ação/tarefa? | Classificação | Próximo passo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

### 6.4 Classificações permitidas

Usar somente:

```text
HABILITADA_E_VALIDADA
HABILITADA_EM_CODIGO_AGUARDANDO_TESTE
PARCIAL
BLOQUEADA_POR_REGRA_DE_ESTADO
ACAO_EXTERNA_NAO_IMPLEMENTADA
SOMENTE_LEITURA_DELIBERADA
SEM_UI_PARA_FUNCAO_EXISTENTE
SEM_FUNCAO_OU_SCHEMA
COM_ERRO_OU_RISCO_CONHECIDO
```

Não chamar tudo de “bloqueio”. Diferenciar claramente:

- regra real de estado;
- ação externa não implementada;
- UI ausente;
- função ausente;
- tela de leitura;
- falha de persistência;
- dado inconsistente;
- requisito jurídico;
- diagnóstico técnico.

---

## 7. Autoridade da proprietária

A proprietária deve ser reconhecida como admin de forma operacional dentro da própria organização.

Isso significa conseguir:

```text
abrir
→ editar
→ salvar
→ confirmar linha afetada
→ reler o banco
→ atualizar a página
→ encontrar o mesmo valor
→ criar/atualizar tarefa ou próxima ação quando aplicável
```

A autoridade não significa remover:

```text
RLS
sessão/login
autenticação
permissões por organização
isolamento de dados
auditoria em segundo plano
confirmação de ações externas reais e irreversíveis
```

A autoridade significa não depender de:

```text
Modo Proprietária
reconfirmação de propriedade
gate visual
auditoria manual
cadeia decorativa
NO_GO fixo
GO_CONDICIONAL fixo
checklist técnico para salvar rascunho interno
```

---

## 8. Continuidade operacional

Toda alteração relevante deve resultar em uma das opções abaixo:

```text
1. Criar tarefa vinculada ao mesmo case_id.
2. Atualizar a próxima ação do caso.
3. Registrar “Sem nova ação necessária”.
```

Não bloquear o salvamento do dado principal para exigir essa decisão.

Aplicar progressivamente a:

```text
Pessoa/participante
Núcleo
Documento/solicitação
Fonte/pesquisa/achado/hipótese
ação comercial/proposta
Contrato/cláusula/anexo
Ordem de Serviço
Micro-entrega
Onboarding
Mudança de fase/prazo
```

Toda tarefa deve ter:

```text
case_id obrigatório
participante/pessoa quando aplicável
título
status
responsável
prioridade
origem
prazo opcional para rascunho interno
```

Não duplicar tarefas para a mesma pendência aberta.

---

## 9. Onboarding real

O Mapa de Autoridade deve registrar de forma explícita se hoje existe apenas tela/checklist ou um motor real de onboarding.

O resultado desejado é:

```text
Iniciar onboarding
→ localizar onboarding existente pelo mesmo case_id
→ reutilizar se ativo/rascunho
→ criar somente se inexistente
→ definir primeira micro-entrega
→ definir próxima ação
→ criar tarefas compartilhadas e individuais
→ exibir no Caso 360
→ exibir no Painel Hoje
→ preparar atualização para App Cliente quando aplicável
→ persistir após refresh
```

Não criar onboarding por pessoa, aba, país ou cenário como registros concorrentes. Usar um motor por caso com templates parametrizados por serviço, país, rota, escopo e composição familiar.

---

## 10. Limites desta tarefa

Não fazer nesta PR de reconciliação/mapeamento:

- Não mudar a taxonomia visual aprovada do mockup.
- Não renomear as sete telas do App Cliente:

```text
Home
Jornada
Radar
Árvore
Documentos
Legado
Conta
```

- Não renomear as sete telas do Desk Intelligence:

```text
Visão Geral
Casos 360
Checklist
Validação Jurídica
Radar Interno
Alertas
Biblioteca Mestre
```

- Não iniciar revisão global de layout/brand.
- Não unificar/mesclar casos, núcleos ou pessoas.
- Não criar novo caso/núcleo/cliente/participante para Ana Luiza.
- Não remover RLS, sessão, permissões, auditoria ou confirmações de ações externas.
- Não executar `DROP TABLE`, `TRUNCATE`, reset de banco ou migration destrutiva.
- Não habilitar e-mail, WhatsApp, cobrança, assinatura ou pesquisa externa nesta tarefa.
- Não criar dashboards com números simulados.

---

## 11. Testes de aceite

### Contrato

1. Abrir contrato associado ao caso real no preview.
2. Confirmar que não há conflito visual entre PR #28 e PR #32.
3. Confirmar que Partes aparecem como cards no mobile.
4. Confirmar que Versões e Revisão jurídica permanecem identificadas como jurídicas/contratuais.
5. Confirmar que “Enviar ao cliente (desabilitado)” não aparece como ação principal.
6. Editar/salvar rascunho permitido.
7. Dar refresh completo e confirmar persistência.
8. Criar tarefa ou atualizar próxima ação a partir de revisão/alteração relevante quando aplicável.

### Mapa de Autoridade

1. Cada rota coberta indica ação, função, tabela/RPC e classificação.
2. Nenhum item é marcado como habilitado apenas por existir em código.
3. Cada item diferencia main, PR aberta e validação manual pendente.
4. Regras jurídicas não são classificadas como dados técnicos.
5. Telas deliberadamente somente leitura são identificadas sem serem tratadas como bug.
6. Lacunas de UI e lacunas de motor/schema são separadas.

---

## 12. Entregas

1. PR isolada de reconciliação do contrato.
2. Atualização do documento único `MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md` com commits separados por domínio.
3. Preview Vercel para a reconciliação do contrato.
4. Relato de teste contendo:

```text
rota
→ ação
→ função
→ tabela/RPC
→ resultado da escrita
→ releitura
→ refresh
→ resultado final
```

5. Lista explícita de pontos ainda em PR, pontos pendentes de teste manual e lacunas sem função/UI.
6. Nenhum merge em `main` sem aceite explícito da proprietária.

---

## Regra final

> Contrato e matriz jurídica devem permanecer juridicamente legíveis. Dados técnicos devem continuar técnicos. A proprietária precisa conseguir operar o próprio caso sem que a interface esconda o que é jurídico ou transforme a operação em uma sequência de gates.

```text
Matriz jurídica é jurídico.
Modelo contratual é jurídico.
Revisão é jurídica.
Dados técnicos são técnicos.
Rascunho interno é operável.
Persistência é comprovada.
Próxima ação é clara.
Nenhum trabalho perdido.
```
