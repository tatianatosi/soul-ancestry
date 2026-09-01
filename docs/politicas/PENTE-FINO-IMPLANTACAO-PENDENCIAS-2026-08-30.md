# Pente-fino de Implantação e Pendências — Clube Ancestral

**Data de referência:** 30 de agosto de 2026  
**Projeto:** `tatianatosi/soul-ancestry`  
**Fontes verificadas:** GitHub — PRs abertas e diffs; artefatos de projeto já recuperados; histórico de validações de banco e preview disponível na conversa.  
**Finalidade:** separar com precisão o que foi implementado, o que está apenas em PR, o que foi apenas declarado, o que permanece parcial e o que ainda precisa ser implementado antes da revisão ampla de layout/brand.

---

## Resumo executivo

Houve avanço material na camada de persistência, no piloto, em partes do contrato, em fontes, núcleo, tarefas e correções de schema. Porém, o repositório está com múltiplas PRs abertas e dependências entre elas; nada dessas PRs deve ser tratado como produção até teste manual da proprietária e merge controlado.

A prioridade não é abrir nova frente visual. É fechar um fluxo operacional completo para Ana Luiza:

```text
Abrir Caso 360
→ editar/salvar dados reais
→ preencher contrato em rascunho
→ confirmar persistência após refresh
→ iniciar/retomar onboarding real no mesmo case_id
→ gerar tarefa/próxima ação/micro-entrega
→ ver no Caso 360 e Painel Hoje
→ preparar atualização do App Cliente quando aplicável
```

### Risco central

O maior risco atual é confundir:

- código corrigido em uma PR;
- build/CI verde;
- tela renderizada;
- função existente;
- e comportamento realmente validado no preview e no Supabase.

A regra de aceite continua sendo:

```text
salvar
→ confirmar linha afetada
→ reler do banco
→ refresh completo
→ reabrir
→ encontrar o valor persistido e a consequência operacional visível
```

---

## Estado das PRs abertas

| PR | Título | Base | Estado | Leitura de risco | Decisão recomendada |
|---|---|---|---|---|---|
| #29 | Tela do caso-piloto: NO_GO/gates saem do caminho de trabalho | `main` | Aberta; grande escopo acumulado | Cresceu para 54 arquivos e 26 commits; inclui correções de persistência, fontes, núcleos, piloto e mais. | Não mesclar como bloco sem roteiro de teste por domínio. Tratar como base técnica a validar. |
| #31 | P0: corrige gravação que declarava sucesso sem confirmar linha afetada | `main` | Draft | Corrige muitos caminhos de escrita, mas o próprio diagnóstico anterior indicava risco de cobertura incompleta. | Manter separada; validar fluxos prioritários e reconciliar com #29 antes de merge. |
| #32 | Pessoa: salvar com releitura real + decisão de tarefa; ajustes mobile | PR #29 | Draft | É piloto controlado de persistência + tarefa e ajustes mobile. Depende da PR #29. | Validar manualmente antes de promover/mesclar. Não pode ser tratada como solução global. |
| #30 | Fase 1 — Possíveis núcleos duplicados | `main` | Draft | Apenas detecção; não deve fazer merge/reapontamento automático. | Manter parada até CRUD, contrato e jornada de Ana estarem operáveis. |
| #28 | Tela de Contrato: 5 ações principais em destaque | `main` | Aberta | Histórico indica interface ampla, sem garantia de persistência e com necessidade de reconciliação. | Não priorizar/mesclar agora; revisar após fluxo contratual da Ana ser comprovado. |
| #10 | De–para de acesso, governança e migração | Branch antiga | Draft | Documental e desatualizada em relação ao estado atual. | Não usar como base de implementação sem reconciliação. |

### Regra de integração

Não mesclar PRs apenas porque estão `clean` ou com CI verde. Cada PR deve ser aceita por capacidade validada no preview e no banco.

---

## O que já foi implantado em código

### 1. Persistência verificada — avanço real

Em diversos módulos, a escrita passou a usar `gravarComVerificacao` ou verificações equivalentes: confirmar linha afetada, filtrar por organização e reler/validar o resultado antes de considerar a operação bem-sucedida.

Áreas tocadas no diff da PR #29 incluem:

- Achados genealógicos.
- Biblioteca de evidências.
- Biblioteca mestre.
- Checklist cadastral.
- Cadeia de formalização e cadeia operacional.
- Caso canônico.
- Clientes.
- Comercial e OS.
- Conciliação e divergências de catálogo.
- Parâmetros e preparação contratual.
- Motor de contratos, versões e itens contratuais.
- Conversão, CRM Desk e fluxo comercial.
- Documentos, solicitações e consentimento.
- Fontes Genealógicas.
- Governança/artefatos/decisões.
- Integrações.
- Jornada do Cliente e micro-entregas.
- Biblioteca de mensagens.
- Migração.
- Onboarding, ativação e plano de onboarding.
- Operações/tarefas/micro-entregas.
- Painel Hoje.
- Pesquisa, módulos de pesquisa e plano de ação de pesquisa.
- Portal/atendimento e acesso do cliente.
- Qualidade e relatórios de fase.
- Piloto e Piloto Ana.

**Estado:** implementado em PR, não homologado globalmente pela proprietária.

### 2. Ajustes de schema e consultas

Foram corrigidos pelo menos estes nomes divergentes em código:

- `contract_parameter_previews`: uso de `congelado_em` no lugar de `gerado_em` no estado da cadeia operacional.
- Propostas: conciliação passou a usar `valor` e `preco_fonte_referencia` em vez de campos divergentes como `valor_total` e `origem_preco`.

**Estado:** correção de código presente em PR; ainda exige verificação da abertura de contrato/Caso 360 sem respostas HTTP 400 no preview.

### 3. Caso-piloto e aliases

- O piloto busca o código canônico e aliases históricos antes de tentar materializar caso.
- O botão do piloto foi renomeado para reduzir leitura de criação cega: `Localizar ou registrar caso`.
- O caso existente passa a expor ações como abrir caso, editar caso, abrir núcleo, criar OS e iniciar onboarding.
- Gates A–H foram visualmente movidos para `Dados técnicos` recolhidos em rotas de piloto.
- Código canônico e aliases receberam ajuste de rolagem horizontal/mobile para não quebrar por hífen.

**Estado:** parcialmente implantado; ainda há listas e cadeias técnicas com presença excessiva em algumas superfícies e faltam testes de navegação operacional.

### 4. Núcleo familiar e membros

- Ajuste de nomes/papéis no `NUCLEO_PILOTO` para alinhamento ao schema do banco.
- Correção explícita do erro de constraint em `nucleo_membros.papel` no código do piloto.
- Tela de Núcleos passa a sugerir criar tarefa depois de salvar membro, vinculada ao `case_id` quando o núcleo estiver vinculado a caso.

**Estado:** implementado em PR; exige teste de editar membro → persistir após refresh → criar tarefa → persistir em Ops/Painel Hoje.

### 5. Fontes Genealógicas

- A rota `/fontes-genealogicas` ganhou botão `Editar` e formulário para status documental, integração, scraping, última verificação, responsável, próxima ação e observação de risco.
- Escritas de fontes/matriz/backlog foram migradas para padrão de verificação.

**Estado:** interface e backend em PR; nenhuma homologação manual de edição de fonte foi comprovada neste relatório.

### 6. Contrato e OS

- Diversas funções de contrato, parâmetros, cláusulas, anexos, versões, revisão e OS receberam verificação de escrita.
- A PR #32 altera a experiência mobile de partes do contrato para cards abaixo de `md` e remove o botão principal `Enviar ao cliente (desabilitado)`.
- Ações internas de contrato permanecem: editar, rascunho, cláusula, anexo, revisão humana e tarefa.

**Estado:** parcialmente implantado em PRs; fluxo de preencher contrato da Ana e persistir após refresh ainda não está homologado ponta a ponta.

### 7. Tarefas e continuidade

- `salvarTarefa`, movimentação de tarefas e micro-entregas receberam escrita verificada no diff.
- A PR #32 oferece, após salvar o perfil de uma pessoa, decidir entre criar tarefa vinculada ao caso ou marcar `Sem nova ação necessária`.
- A tela de Núcleos também oferece sugestão de tarefa após salvar membro.

**Estado:** o uso manual confirmou criação de uma tarefa sobre local de nascimento de Ana. Ainda não há aplicação transversal nem motor automático de pendência → tarefa em todas as áreas.

---

## O que está confirmado no uso manual

| Capacidade | Situação | Limite atual |
|---|---|---|
| Criar tarefa no Desk Operacional | Confirmado manualmente para assunto de local de nascimento da Ana. | Confirmar vínculo, persistência após refresh e visibilidade no Caso 360/Painel Hoje. |
| Edição de dados de pessoa | Formulário e botão de salvar visíveis em preview. | Precisa sequência completa salvar → releitura → refresh. |
| Edição de partes/contrato | Interface exposta no preview. | Layout mobile anterior era truncado; nova correção está em PR #32 e exige teste. |
| Leitura de caso/piloto | Caso e dados carregam. | Ainda há excesso de conteúdo técnico/gates em algumas rotas. |

---

## Pendências por prioridade

### P0 — fechar antes de qualquer revisão global de layout

#### P0.1 — Ana Luiza operável ponta a ponta

Implementar e comprovar:

```text
Caso 360
→ contrato rascunho editável
→ partes/escopo/cláusulas/anexos salváveis
→ OS vinculada
→ persistência após refresh
→ onboarding real do mesmo case_id
→ tarefas e próxima ação
→ Painel Hoje
```

Pendências específicas:

- Confirmar que Caso 360 abre como ficha operacional, não em conferência/gate/prévia.
- Confirmar ausência de HTTP 400 na abertura de caso, proposta e contrato.
- Confirmar edição/salvamento de partes existentes, não apenas arquivamento/listagem.
- Confirmar contrato rascunho com campos mínimos adequados.
- Confirmar OS e observações/escopo após refresh.
- Confirmar tarefas visíveis no Caso 360 e Painel Hoje.

#### P0.2 — Onboarding real

Ainda precisa ser implementado/validado como motor operacional:

```text
Iniciar onboarding
→ localizar onboarding do mesmo case_id
→ criar se inexistente
→ nunca duplicar
→ criar primeira micro-entrega
→ definir próxima ação
→ criar tarefas compartilhadas/individuais
→ aparecer no Caso 360 e Painel Hoje
→ persistir após refresh
```

Não depender de contrato assinado, pagamento, portal completo, Planejador, SKU, condição comercial integral ou gates A–H para iniciar o onboarding interno.

#### P0.3 — Continuidade de ação transversal

A decisão pós-save `Criar tarefa` / `Sem nova ação necessária` ainda está limitada a superfícies específicas.

Implementar gradualmente o padrão para alterações relevantes em:

- participante/núcleo;
- documento/pedido documental;
- pesquisa/achado/hipótese/fonte;
- proposta;
- contrato/cláusula/anexo;
- OS;
- micro-entrega;
- onboarding;
- mudança de fase/prazo.

Cada caso deve ter próxima ação clara. Caso sem próxima ação deve aparecer no Painel Hoje como alerta acionável, não bloqueio.

#### P0.4 — Teste de persistência por domínio

A cobertura de código aumentou, mas não substitui testes reais. Executar, após cada entrega, no preview ligado ao Supabase próprio:

- Cliente: editar campo básico.
- Caso: alterar próxima ação.
- Participante/núcleo: editar papel/vínculo.
- Tarefa: criar, editar, concluir e reabrir.
- Pesquisa: salvar achado/hipótese/pendência.
- Fonte: alterar próxima ação/risco.
- Proposta: salvar rascunho.
- Contrato: salvar rascunho, cláusula e anexo.
- OS: criar/editar escopo/observação.
- Onboarding: iniciar/reabrir/tarefas.

### P1 — consolidar operação e eliminar fontes concorrentes

#### P1.1 — Fonte canônica de participantes

Mapear e decidir, por tela, como coexistem:

```text
nucleo_membros
case_members
case_dependents
pessoas
participantes
```

Não permitir que uma tela escreva em uma entidade e outra releia uma diferente sem sincronização explícita.

#### P1.2 — Unificação de núcleos e casos

A PR #30 é apenas detecção de possíveis duplicidades. Antes de qualquer merge:

```text
Detecção
→ comparação
→ matriz de reconciliação
→ decisão humana
→ reapontamento controlado
→ aliases/histórico preservados
→ validação após refresh
```

Não executar unificação antes da estabilidade de Ana, contrato, onboarding e persistência.

#### P1.3 — Clientes e Biblioteca de Mensagens

- Clientes: confirmar/implementar edição de campos básicos de cliente existente, não somente criar/ativar/reclassificar.
- Biblioteca de Mensagens: confirmar/implementar criação e edição do texto de template, não somente estado/status.

#### P1.4 — Piloto Real

A lista `BLOQUEIOS_PILOTO` não deve continuar como lista fixa com aparência de estado vivo.

Implementar primeiro leitura derivada do estado real, em Dados técnicos recolhidos:

```text
origem
pessoa/entidade afetada
estado
impacto restrito
ação relacionada
referência de tarefa
```

Não criar botão genérico de dispensar requisito. Regras de dispensa devem ser específicas por domínio e decisão humana.

### P2 — Cockpit do Desk, indicadores e cadências

Depois de Ana operável e onboarding real:

- Transformar Painel Hoje em cockpit de decisão.
- Pessoa 360 rápida no Hoje.
- Cadência D0/D3/D7/D10/D14 do onboarding.
- Sinal → pessoa/caso → impacto → tarefa/próxima ação → atualização preparada para App Cliente.
- Indicadores acionáveis em Comercial, Casos, Pessoas & Famílias, Pesquisa, Marketing e Configuração.
- Remover listas decorativas/bibliotecas sem responsável, status, próxima ação ou vínculo.

### P3 — Revisão visual e marca

Executar somente após os P0/P1 operacionais:

- Aplicar Desk simples: Hoje, Comercial, Casos, Pessoas & Famílias, Pesquisa, Marketing e Configuração.
- Caso 360 com poucas áreas de primeiro nível.
- Contrato e partes em cards no mobile.
- Acordeões para dados técnicos, bibliotecas e histórico.
- Marca oficial, logo vetorial e paleta do Clube Ancestral.
- Separação rigorosa Desk interno / App Cliente / Centro de Inteligência.

---

## Bloqueios reais versus não-bloqueios

| Tipo | Exemplo | Tratamento |
|---|---|---|
| Persistência | UPDATE com zero linhas, payload inválido, enum/constraint incompatível, query de releitura divergente. | Corrigir cadeia de escrita e comprovar após refresh. |
| Lacuna de UI | Função existe, mas não há botão/formulário para usá-la. | Conectar UI ao caminho real de gravação e testar. |
| Regra de estado | Assinatura, cobrança, convite externo, ativação formal. | Validar no momento da ação específica; não bloquear rascunho interno. |
| Tela de referência | Matriz, inventário, auditoria, relatório técnico. | Manter como leitura ou mover a Dados técnicos. |
| Lista estática | Bloqueio hardcoded, biblioteca sem vínculo, indicador sem ação. | Substituir por dado real ou retirar do topo. |

---

## Proibições permanentes

- Não remover RLS, sessão, login, organização, permissões ou auditoria de fundo.
- Não usar service-role no navegador.
- Não criar bypass genérico para admin.
- Não criar novo caso, núcleo, pessoa ou cliente para contornar inconsistência.
- Não fazer merge automático de núcleos/casos/pessoas.
- Não apagar dados, executar `DROP TABLE`, `TRUNCATE`, reset de banco ou migration destrutiva.
- Não exibir número simulado como métrica real.
- Não usar gate, NO_GO, GO_CONDICIONAL ou cadeia técnica como superfície principal.
- Não disparar envio externo, cobrança, assinatura, WhatsApp ou e-mail sem integração real e confirmação explícita.
- Não marcar funcionalidade como pronta com base apenas em CI verde, toast, função existente ou teste mockado.

---

## Critério de pronto antes da revisão de layout

A revisão visual ampla só começa quando estes pontos estiverem comprovados:

1. Ana Luiza abre no Caso 360 correto, sem criar cadastro paralelo.
2. Contrato rascunho pode ser preenchido e salvo.
3. Partes, escopo, cláusulas e anexos persistem após refresh.
4. OS vinculada pode ser criada/editada e persiste.
5. Onboarding real é criado ou retomado pelo mesmo `case_id`.
6. Onboarding cria primeira micro-entrega, próxima ação e tarefas reais.
7. Tarefas aparecem em Caso 360 e Painel Hoje.
8. Alteração relevante cria/atualiza tarefa ou próxima ação, ou é marcada como sem ação necessária.
9. Pessoa, núcleo, pesquisa, fontes, proposta, contrato e OS têm pelo menos um fluxo de persistência validado por uso real.
10. Dados técnicos não bloqueiam a operação interna diária.

---

## Regra final

> O produto não está pronto quando tem muitas abas, bibliotecas e indicadores. Ele está pronto quando a proprietária consegue trabalhar em um caso real, preservar o que registrou, saber o próximo passo e fazer a jornada avançar.

```text
Um caso canônico.
Dados persistidos.
Contrato operável.
Jornada real.
Tarefa quando necessária.
Próxima ação clara.
Nenhum trabalho perdido.
```
