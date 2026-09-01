# Reconciliação factual — Criar tarefa e fechamento do Mapa de Autoridade Admin

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: diagnóstico de divergência factual e registro de auditoria
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Relato de auditoria de código recebido em 2026-08-31
  - PR #32 — Pessoa: salvar com releitura real + decisão de tarefa; ajustes mobile
  - PR #35 — Reconciliação contratos.$id.tsx — PR #28 × PR #32
  - Mapa de Autoridade Admin, atualização final relatada
  - Documento anterior de correção sobre Criar tarefa, arquivado com contestação anexada
escopo:
  - corrigir a classificação de disponibilidade de Criar tarefa segundo evidência de código reportada
  - separar existência em código, disponibilidade contextual e validação manual de persistência
  - registrar achados finais em Marketing, Configuração e App Cliente
premissas:
  - os caminhos e linhas informados foram conferidos diretamente nos branches indicados pelo auditor
  - nenhum item é considerado homologado em preview sem teste manual independente
limites:
  - não afirma que os fluxos de tarefa funcionam no deployment atual
  - não autoriza criar, editar, deduplicar ou expandir tarefas
  - não altera classificação de rotas não listadas neste documento
próximos passos:
  - verificar se cada branch está incluída no preview/deploy que a proprietária usa
  - executar teste por rota de criação de tarefa e persistência após refresh
  - atualizar o Mapa com a evidência e o resultado do teste manual
critério de aceite:
  - botão/ação disponível no contexto correto
  - mutation chama função de servidor real
  - INSERT/UPDATE confirma resultado
  - tarefa aparece na fonte canônica pelo mesmo ID/case_id
  - refresh e reabertura preservam o registro
substitui:
  - afirmação absoluta anterior de que Criar tarefa existe somente no Painel Ops
```

> **Nota ao arquivar:** este documento reconcilia e substitui a conclusão de
> `docs/politicas/CORRECAO-CRIAR-TAREFA-PAINEL-OPS-2026-08-31.md` — aquele
> documento já tinha sido arquivado com uma contestação anexada (evidência de
> código nos branches PR #32/PR #35) e, no mesmo dia, resolvido em conversa:
> o teste que gerou a divergência foi feito em `main`/produção, sem nenhuma
> das PRs mescladas, não no preview correto. Esta reconciliação formaliza a
> mesma conclusão com um roteiro de verificação mais preciso, separando
> "existe em código" de "validado manualmente no preview correto" — a
> distinção certa a manter daqui para frente.

## Correção de premissa

A afirmação anterior de que "Criar tarefa" existe somente no Painel Ops não deve ser tratada como fato aceito. A evidência de código relatada indica que há implementações adicionais em branches abertas, com disponibilidade contextual e não necessariamente visível em todas as abas.

A formulação correta, até os testes manuais, é:

```text
Painel Ops: capacidade de tarefa conhecida e visível.
Pessoa/Perfil 360, Caso 360 e Contrato: implementação de criação de tarefa existe em código nas PRs indicadas; aguarda confirmação de disponibilidade no deploy usado e validação manual de persistência.
Outras superfícies: não assumir disponibilidade sem rastreamento específico.
```

## Evidência reportada para Criar tarefa

| Superfície | Evidência reportada | Disponibilidade esperada | Estado correto no Mapa |
|---|---|---|---|
| Painel Ops | Motor de tarefas conhecido no domínio Ops | Ação disponível na superfície de operações | HABILITADA_EM_CODIGO_AGUARDANDO_TESTE ou HABILITADA_E_VALIDADA, somente conforme teste real registrado |
| Pessoas e Linhagens / Perfil 360 | `pessoas-linhagens.$caseId.tsx`, PR #32: `criarTarefaFn` e mutation no componente `DecisaoPosSalvamento` | Surge depois de salvar campo da pessoa; não é botão permanentemente exposto | HABILITADA_EM_CODIGO_AGUARDANDO_TESTE — contextual pós-salvamento |
| Caso 360 | `casos.$caseId.index.tsx`, PR #32: `<TarefasDoCaso caseId={id} />` em Indicadores | Disponível dentro da seção Indicadores; pode não aparecer em outra aba/contexto | HABILITADA_EM_CODIGO_AGUARDANDO_TESTE — depende da rota/seção correta |
| Contrato | `contratos.$id.tsx`, PR #35: botão "Criar tarefa" na barra de ações | Exposto na tela de contrato pertencente à branch/PR correspondente | HABILITADA_EM_CODIGO_AGUARDANDO_TESTE — depende de deploy e teste de escrita |

A existência de código não equivale automaticamente a funcionalidade homologada. Porém, ela impede classificá-lo como "não implementado" ou "somente Painel Ops" sem qualificar que a conclusão se referia à experiência visível/testada em determinado deployment, e não a todos os branches existentes.

## Hipóteses para a divergência observada

O problema real pode estar em um ou mais dos seguintes níveis:

1. **Branch/deploy divergente:** a pessoa pode estar usando preview que não inclui PR #32 ou PR #35.
2. **Disponibilidade condicional:** em Pessoa, o controle só aparece após salvar; em Caso 360, fica dentro de Indicadores; em Contrato, depende da rota/branch reconciliada.
3. **Botão renderizado sem execução concluída:** o controle pode existir, mas mutation, permissões, payload, `case_id` ou tabela podem falhar.
4. **Escrita não persistida no ambiente em uso:** a função pode estar correta em código e ainda falhar por RLS, organização, schema, constraint ou deploy desatualizado.
5. **Confusão entre tarefa criada e tarefa visível:** a tarefa pode ser inserida no banco, mas não aparecer na lista/releitura do contexto devido a consulta, filtro, `case_id`, status ou cache.

*(Confirmado em conversa no mesmo dia: para esta divergência específica, a causa foi a hipótese 1 — branch/deploy divergente, teste feito em produção.)*

## Roteiro de verificação por rota

Executar no preview que contenha a PR alvo e registrar, para cada teste, URL, branch/commit, usuário, organização, case_id e task_id retornado.

### Pessoa / Perfil 360

```text
1. Abrir /pessoas-linhagens/$caseId do caso de teste.
2. Editar um campo permitido e salvar.
3. Confirmar se DecisaoPosSalvamento aparece.
4. Acionar Criar tarefa.
5. Registrar resposta da mutation e task_id, se houver.
6. Abrir Painel Ops e localizar a tarefa por case_id/título.
7. Dar refresh completo em Pessoa e Painel Ops.
8. Confirmar que a tarefa continua presente e não foi duplicada por novo clique.
```

### Caso 360

```text
1. Abrir /casos/$caseId.
2. Localizar a seção Indicadores e o componente TarefasDoCaso.
3. Acionar Criar tarefa, se o controle estiver exposto.
4. Registrar task_id e case_id.
5. Confirmar listagem no Painel Ops e na própria seção de caso.
6. Dar refresh completo e reabrir o Caso 360.
7. Confirmar persistência e vínculo com o mesmo case_id.
```

### Contrato

```text
1. Abrir /contratos/$id no preview que inclui PR #35.
2. Acionar Criar tarefa na barra principal.
3. Registrar resposta, task_id e contract_id/case_id associado.
4. Abrir Painel Ops e localizar a tarefa.
5. Atualizar navegador e reabrir contrato/Painel Ops.
6. Confirmar persistência e que não há criação duplicada por repetição indevida.
```

## Regra de classificação futura

Não usar apenas "sim" ou "não" para a capacidade de tarefa. Cada rota precisa usar uma das classificações abaixo:

```text
IMPLEMENTADA_EM_CODIGO_AGUARDANDO_TESTE
DISPONIVEL_NO_PREVIEW_AGUARDANDO_PERSISTENCIA
HABILITADA_E_VALIDADA
BOTAO_OU_UI_SEM_MUTATION_COMPROVADA
MUTATION_SEM_PERSISTENCIA_COMPROVADA
NAO_IMPLEMENTADA
```

A classificação anterior "somente Painel Ops" deve ser entendida como relato de uso/visibilidade observado, não como inventário exaustivo de código. Ela foi arquivada com contestação e não deve orientar decisões técnicas sem a reconciliação acima.

## Fechamento do Mapa de Autoridade

A auditoria final relatada cobre Marketing, Configuração e App Cliente. Os seguintes achados devem ser incorporados no Mapa, com rota, componente, função e tabela identificados:

| Achado | Classificação inicial | Ação mínima |
|---|---|---|
| Edição de texto da Biblioteca de Mensagens existe em código, mas nenhuma tela a chama | SEM_UI_PARA_FUNCAO_EXISTENTE | Conectar uma superfície de edição à função existente, após validar escopo e persistência |
| Dois sistemas paralelos de "Usuários e papéis" | COM_ERRO_OU_RISCO_CONHECIDO | Mapear entidades, rotas e fonte canônica antes de sincronizar, migrar, fundir ou remover |
| App Cliente: Legado, Entregas, Fase 01 e Fase 02 exibem texto fixo sem busca de dado real | PARCIAL ou SEM_FUNCAO_OU_SCHEMA, conforme o rastreamento por tela | Declarar stubs; definir fonte de dados e regra de visibilidade antes de construir conteúdo vivo |

*(Os três achados acima já estão registrados no Mapa de Autoridade Admin, seções Marketing/Configuração/App Cliente, commit `cf4c86a` — este documento confirma que a classificação usada bate com a recomendada aqui.)*

## Limites para próximos motores

O Mapa completo melhora a visibilidade da dívida, mas não desbloqueia automaticamente P3, P4 ou P9.

Antes de iniciar:

```text
P3: confirmar a fonte canônica de tarefas, cobertura de rotas e regra de idempotência.
P4: escolher um único sistema de onboarding por case_id e tratar os sistemas paralelos.
P9: usar apenas fontes que tenham leitura/escrita e significado operacional comprovados; não montar indicadores sobre stubs, listas ou sistemas concorrentes.
```
