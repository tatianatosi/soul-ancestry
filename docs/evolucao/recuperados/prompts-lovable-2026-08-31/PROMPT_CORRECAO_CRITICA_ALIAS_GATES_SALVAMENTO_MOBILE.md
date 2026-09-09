# BUG CRÍTICO — Salvar Não Produz Resultado, Alias Não Abre Caso e Gates Bloqueiam Operação

**Projeto:** `tatianatosi/soul-ancestry`  
**Branch obrigatória:** `fix/caso-canonico-salvamento-operacional`  
**Prioridade:** P0 — correção imediata de operação da proprietária  
**Escopo:** corrigir comportamento real do caso, salvamento, navegação por alias, gates visíveis e responsividade mobile.  
**Não é uma tarefa de arquitetura, auditoria, inventário, mock, dashboard ou documentação.**

---

## 1. Problema confirmado por telas reais

A proprietária não consegue trabalhar no próprio aplicativo. As telas mostram que o sistema continua priorizando estados de governança, gates e pendências sobre ações de trabalho.

### Sintomas reais exibidos

```text
“PRÉ-ONBOARDING BLOQUEADO”
“NO_GO”
“Conferência do piloto — gates A a H”
“7 gate(s) crítico(s) pendente(s)”
“Não foi possível registrar o caso-piloto: Este identificador já existe como alias histórico.”
“22 placeholder(s) pendente(s)”
“Salvar / Confirmar / Bloquear”
“Justificativa (para substituição ou bloqueio)”
“Identidade: Não revisada”
“Dados Restrita”
“Prontidão de atribuição — checklist completo”
CAC / ROI / ROAS sem dados ocupando a área de trabalho
```

Esses elementos não podem continuar controlando o fluxo de trabalho da proprietária.

---

## 2. Objetivo único

Transformar o caso familiar existente de Ana Luiza em uma ficha operacional utilizável, sem criar outro caso, outro identificador, outro dossiê, outro onboarding ou qualquer camada adicional de governança.

### Resultado obrigatório

```text
Proprietária abre código histórico ou canônico
→ app resolve o case_id correto
→ abre Caso 360
→ proprietária cria/edita/salva
→ dado persiste no Supabase
→ tela mostra o resultado salvo
→ refresh preserva o dado
→ próxima ação/tarefa aparece no caso e no Painel Hoje
```

---

## 3. Caso canônico de Ana Luiza

### Código oficial

```text
CA-CID-AT-FAM-2026-001
```

### Códigos históricos/aliases preservados

```text
CA-AUT-ANALUIZA-FAM-2026-001
CA-2026-ANA-001
CA-CID-AT-2026-002
```

### Regra definitiva

```text
Um case_id canônico.
Um case_code oficial.
Aliases servem para localizar o mesmo caso.
Alias nunca cria erro para a proprietária.
Alias nunca tenta criar um segundo caso.
Alias nunca exige nova confirmação humana.
```

---

## 4. Corrigir resolução de alias

### Criar função única

```ts
export async function resolveCaseIdentifier(
  identifier: string,
  organizationId: string,
): Promise<{ caseId: string; caseCode: string; resolvedFromAlias: boolean }> {
  // 1. procurar case_code canônico
  // 2. se não existir, procurar alias na tabela de aliases
  // 3. retornar o case_id canônico correspondente
  // 4. nunca criar case durante resolução
}
```

### Comportamento obrigatório

1. Se o usuário digitar ou abrir o código oficial, abrir o caso canônico.
2. Se o usuário digitar ou abrir qualquer alias histórico, resolver o `case_id` canônico e abrir o mesmo caso.
3. Se o código for alias, exibir somente um toast não bloqueante:

```text
Abrimos o caso canônico vinculado a este identificador.
```

4. Se não existir código nem alias, permitir criar um novo caso somente por uma ação explícita “Novo caso”.
5. Remover qualquer tentativa automática de `INSERT` em `cases` ao abrir um identificador conhecido.

### Remover da interface

```text
[Registrar caso-piloto no Desk]
```

### Substituir por

```text
[Abrir caso]
[Editar caso]
[Ver núcleo familiar]
[Registrar atualização]
[Criar Ordem de Serviço]
[Iniciar onboarding]
```

---

## 5. Converter gates em pendências operacionais

### Remover da interface operacional

```text
NO_GO
PRÉ-ONBOARDING BLOQUEADO
Gate A até H
Conferência do piloto
Evidência exigida
Quem decidiu
Critério de conclusão de gate
Auditoria obrigatória
Justificativa obrigatória
Confirmar
Bloquear
```

Esses elementos podem permanecer em arquivos técnicos fora do bundle operacional, mas não podem ser renderizados, consultados nem usados para impedir ações no Caso 360, Painel Hoje, Pessoas, Contratos, Financeiro, Onboarding ou Pesquisa.

### Substituir por

```text
Status do caso: Formalização em preparação
Próxima ação: [ação concreta]
Pendências de formalização: [quantidade]
```

### Exemplo para Ana Luiza

```text
Status: Formalização em preparação
Próxima ação: Criar Ordem de Serviço e completar dados faltantes do núcleo
Pendências: Dados complementares de Alice; representação de Felipe; revisão de escopo
Onboarding: Disponível para iniciar
```

### Regra

Pendência deve criar tarefa simples. Pendência nunca bloqueia:

```text
abrir caso
editar pessoa
salvar alteração
criar proposta
criar Ordem de Serviço
criar contrato em rascunho
registrar pagamento manual
iniciar onboarding
adicionar documento
registrar atualização
```

---

## 6. Corrigir salvamento real

### Regra única

Para toda ação “Salvar”:

```text
Formulário
→ valida somente campos mínimos
→ INSERT/UPDATE real no Supabase
→ tratar retorno de erro
→ toast “Salvo.”
→ invalidar/refazer query
→ renderizar valor atualizado
→ refresh mantém valor
```

### Proibido

```text
Salvar apenas em state local
Mostrar sucesso sem retorno do banco
Voltar para lista sem confirmar persistência
Ocultar erro do Supabase/RLS/API
Pedir confirmação/bloqueio/justificativa para salvar
Usar audit_logs ou owner_override_events como pré-condição de salvamento
```

### Erro permitido

```text
Não foi possível salvar: [mensagem técnica retornada]. Tente novamente.
```

### Erros proibidos

```text
Ação ignorada
Aprovação necessária
Reconfirme sua propriedade
Bloqueado por governança
Bloqueado por gate
Bloqueado por checklist
```

---

## 7. Pessoas e participantes

Na tela **Pessoas e identidades**, transformar estados de controle em dados operacionais.

### Exibir por pessoa

```text
Nome
Papel no caso
Dados disponíveis
Pendências simples
Próxima ação individual
Documentos
[Editar]
[Criar tarefa]
[Adicionar documento]
```

### Não exibir como bloqueio

```text
Identidade: Não revisada
Dados Restrita
Planejador homologado
confiança mínima
justificativa obrigatória
```

### Regras de visibilidade

- “Dados restritos” controla somente o que aparece ao cliente/participante no portal.
- “Dados restritos” não impede owner/admin de editar ou salvar.
- Ausência de dados deve criar pendência/tarefa editável.
- Ana Luiza, Adair, Alice e Felipe devem estar vinculados ao mesmo `case_id` canônico.
- Não criar ficha paralela para qualquer pessoa ou subgrupo familiar.

---

## 8. Ordem de Serviço e contrato

### Criar ações reais no Caso 360

```text
[Criar Ordem de Serviço]
[Abrir Ordem de Serviço]
[Editar contrato]
[Salvar rascunho]
[Ver prévia]
[Gerar nova versão]
```

### Ordem de Serviço

A OS deve usar o mesmo `case_id` canônico e carregar automaticamente:

```text
Dados institucionais da contratada
Cliente/contato principal
Participantes do núcleo familiar
País: Áustria
Referência jurídica: §58c StbG
Escopo/serviços
Proposta vinculada, quando houver
Valores disponíveis, quando houver
Cronograma inicial
Pendências e observações
Responsável
```

### Contratada

A contratada deve vir da organização Clube Ancestral, não do nome pessoal da proprietária:

```text
legal_name
trade_name
cnpj
legal_address
official_email
official_phone
legal_representative_name
legal_representative_role
```

`Tatiana Melani Tosi` pode aparecer como representante/responsável, mas não como substituta dos dados institucionais da contratada.

### Placeholders

Substituir:

```text
22 placeholder(s) pendente(s)
7 placeholder(s) pendente(s)
```

por:

```text
Informações a completar: [n]
```

Agrupar os campos em:

```text
Dados do cliente
Participantes
Dados institucionais
Escopo
Financeiro
Cronograma
Observações
```

### Regra de rascunho

- Placeholders são avisos editáveis; não são bloqueio.
- Rascunho pode ser criado, salvo e aberto com campos incompletos.
- Criar OS não exige contrato assinado, Asaas, pagamento, auditoria, gate ou reconfirmação.
- Não listar v3, v4, v5 e v6 como fluxo principal.
- Exibir apenas a versão atual, uma versão anterior opcional e ações de editar/salvar/prévia/OS.

---

## 9. Onboarding

### Estado visível

Substituir qualquer “pré-onboarding bloqueado” por:

```text
Onboarding: disponível para iniciar
```

### Ação obrigatória

```text
[Iniciar onboarding]
```

A proprietária deve conseguir iniciar onboarding manualmente, mesmo com pendências de dados, contrato, financeiro, documento ou integração externa.

Ao iniciar:

```text
Criar onboarding_run real
Criar tarefas iniciais reais
Criar próximos passos
Atualizar Caso 360
Atualizar Painel Hoje
```

Pendências permanecem listadas dentro do onboarding como tarefas. Nunca bloquear o caso inteiro.

---

## 10. Painel Hoje

O Painel Hoje deve ser uma mesa de trabalho, não uma tela de alerta de auditoria ou marketing.

### Mostrar

```text
Boa tarde, Tatiana.

Sua próxima ação
Tarefas vencidas
Tarefas de hoje
Propostas aguardando resposta
Contratos em rascunho
Pagamentos pendentes
Documentos pendentes
Casos sem próxima ação
```

Cada linha deve ter:

```text
Cliente
Caso
Ação
Prazo
[Abrir caso]
[Concluir]
[Adiar]
```

### Não mostrar

```text
“A leitura desta tela saiu do padrão acordado”
“Bloco não faz parte da ordem canônica”
“Aviso de exibição”
Governança
Auditoria
Métricas sem dado
CAC/ROI/ROAS
Checklist de prontidão
```

Marketing e indicadores podem existir em uma rota separada, mas não devem aparecer como obstáculo ou conteúdo dominante do Painel Hoje.

---

## 11. Responsividade mobile obrigatória

O layout exibido no celular está quebrado. Código do caso, textos e botões aparecem com quebras por caractere e elementos se sobrepõem.

### Corrigir

```css
/* Usar princípios equivalentes; adaptar ao framework do projeto. */
.case-code {
  overflow-wrap: anywhere;
  word-break: normal;
  white-space: normal;
}

.mobile-card,
.mobile-form,
.mobile-action-row {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.mobile-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
```

### Critérios visuais

- Testar largura de 375px e 430px.
- Case code quebra por palavra/unidade lógica, não por caractere.
- Botões não saem da tela.
- “Salvar alterações” permanece visível, alinhado e clicável.
- O botão/flutuante “Assistente” não cobre campos, erros, ações, texto ou botões críticos.
- Cards usam largura responsiva e não deixam grande área vazia ao lado do conteúdo.
- Textos longos continuam legíveis.

---

## 12. O que não fazer

```text
Não criar novo caso para Ana Luiza.
Não criar novo ID para Ana Luiza.
Não apagar dados, documentos, propostas, contratos, pagamentos ou pessoas.
Não executar DROP TABLE, TRUNCATE ou migration destrutiva.
Não criar novas auditorias, gates, modos, reconfirmações, justificativas ou fluxos de aprovação.
Não construir novos dashboards, landing pages, métricas, CAC/ROI/ROAS, automações ou catálogo nesta tarefa.
Não entregar mock, lista, documentação, build verde ou teste unitário como se fosse correção funcional.
```

---

## 13. Critérios de aceite — obrigatórios

A tarefa só é concluída quando Tatiana conseguir, em preview Vercel conectado ao Supabase próprio:

1. Abrir `CA-CID-AT-FAM-2026-001`.
2. Abrir `CA-AUT-ANALUIZA-FAM-2026-001` e ser levada ao mesmo caso canônico.
3. Abrir `CA-2026-ANA-001` e ser levada ao mesmo caso canônico.
4. Não ver erro de alias nem botão de registrar caso-piloto.
5. Não ver `NO_GO`, gates, “pré-onboarding bloqueado”, auditoria ou governança no caminho de trabalho.
6. Editar uma pessoa do núcleo e salvar.
7. Recarregar e confirmar que a alteração persiste.
8. Criar tarefa para uma pendência de Alice ou Felipe.
9. Criar Ordem de Serviço em rascunho.
10. Abrir contrato atual, editar e salvar rascunho com campos incompletos.
11. Iniciar onboarding manualmente.
12. Ver tarefas/ações de onboarding no Caso 360 e Painel Hoje.
13. Abrir o Caso 360 no celular sem quebra de layout.
14. Confirmar que o Assistente não cobre nenhuma ação crítica.

### Aceitar somente

```text
Tatiana entra, abre o caso existente por qualquer identificador histórico,
cria/edita/salva dados reais, cria OS, inicia onboarding e continua trabalhando
após refresh — sem bloqueios, gates, auditoria ou telas de governança.
```

---

## 14. Entrega esperada

1. Branch `fix/caso-canonico-salvamento-operacional`.
2. Pull request somente com esta correção.
3. Preview Vercel funcional.
4. Relatório curto contendo:
   - função de resolução de alias;
   - rotas/componentes corrigidos;
   - ações que passaram a persistir;
   - resultado dos 14 critérios de aceite;
   - falhas reais restantes, se houver;
   - URL de preview.
5. Não fazer merge em `main` até a proprietária testar o preview.
