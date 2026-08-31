# Correção de fato — Criação de tarefa disponível somente no Painel Ops

> **Nota adicionada ao arquivar, 31/08/2026:** este documento afirma que "Criar tarefa" existe somente no Painel Ops e que as afirmações anteriores desta sessão (Pessoa/Perfil 360, Caso 360, Contrato) estão "revogadas". Checagem direta do código nos branches reais, feita no momento em que este documento chegou, **não confirma essa correção** — encontrei as três implementações citadas, com arquivo e linha exatos, nos branches onde foram construídas nesta sessão:
>
> - `pessoas-linhagens.$caseId.tsx` (branch `feat/pessoa-salvar-tarefa-continuidade`, PR #32) — `criarTarefaFn = useServerFn(salvarTarefa)` (linha 146), mutation `criarTarefa` (linha 171), acionada pelo botão dentro do componente `DecisaoPosSalvamento` (linha 419/634) — aparece **depois** de salvar um campo da pessoa, não como botão sempre visível.
> - `casos.$caseId.index.tsx` (mesmo branch) — importa e renderiza `<TarefasDoCaso caseId={id} />` (linha 30/632), componente com botão "Criar tarefa" próprio, embutido dentro da seção "Indicadores" da página.
> - `contratos.$id.tsx` (branch `fix/reconciliar-contratos-pr28-pr32`, PR #35) — `mTarefa` (linha 99), botão "Criar tarefa" na barra de ações principal (linha 160).
>
> Por isso este documento **não foi tratado como correção aceita** e o Mapa de Autoridade Admin não foi alterado por causa dele. Arquivado como registro do relato recebido, não como fato verificado.
>
> **Resolvido no mesmo dia:** a proprietária confirmou que o teste foi feito em produção (`main`) ou outro link, não no preview do PR #35 — nenhuma dessas implementações está mesclada em `main`, então realmente não apareceriam lá. Não era bug: era a URL errada, mesmo problema de navegação já visto antes nesta sessão. URL correta para testar as três: `https://soul-ancestry-git-fix-reconciliar-co-14c2c9-tati-6134s-projects.vercel.app`.

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: correção de diagnóstico operacional
responsável pela decisão: Proprietária do Clube Ancestral
fonte de evidência:
  - Correção explícita da proprietária em 2026-08-31
escopo:
  - disponibilidade atual da ação "Criar tarefa"
  - correção de registros e respostas anteriores que atribuíram essa ação a outras telas
premissas:
  - a declaração explícita da proprietária prevalece sobre as inferências e relatos anteriores
limites:
  - esta correção não declara persistência, idempotência ou funcionamento de qualquer ação fora do Painel Ops
  - não altera código, dados, permissões ou rotas
próximos passos:
  - retificar documentos que tenham indicado outras superfícies como operacionais para criar tarefa
  - validar cada rota por execução real antes de voltar a afirmar cobertura de tarefa
critério de aceite:
  - somente uma rota deve ser declarada como disponível quando houver ação executável, escrita confirmada, releitura pelo mesmo ID e persistência após refresh
substitui:
  - afirmações anteriores desta conversa que indicaram "Criar tarefa" em Pessoa/Perfil 360, Caso 360, Contrato ou Pesquisa
```

## Correção obrigatória

A ação **"Criar tarefa" está disponível somente no Painel Ops**.

Ela **não está disponível** atualmente em:

- Pessoa ou Perfil 360.
- Caso 360.
- Contratos.
- Pesquisa, incluindo as rotas anteriormente mencionadas.
- Piloto Real.
- Núcleos.
- Propostas/Comercial.
- Clientes.
- Qualquer outra aba ou grupo não confirmado explicitamente pela proprietária.

## Erro registrado

Registros e respostas anteriores nesta conversa afirmaram, de forma incorreta, que "Criar tarefa" funcionava em Pessoa, Caso 360, Contrato e sistemas de Pesquisa. Essas afirmações devem ser consideradas **revogadas**.

O erro decorreu de tratar relatos anteriores como confirmação de implementação sem executar verificação independente por rota e sem respeitar a correção já reiterada pela proprietária.

## Regra para respostas futuras

Até existir nova evidência verificável, a formulação correta é:

```text
Criar tarefa: disponível somente no Painel Ops.
Demais superfícies: não declarar disponível; tratar como não implementado/não confirmado.
```

Não afirmar que uma tela possui criação de tarefa porque:

- há um botão visível;
- há uma intenção de produto;
- existe handler, componente ou rota;
- existe tarefa em outra superfície;
- uma PR relata uma futura integração;
- o fluxo parece plausível.

A disponibilidade só pode ser declarada após demonstração de:

```text
abrir a rota
→ acionar Criar tarefa
→ confirmar a escrita na fonte canônica
→ confirmar a linha/resultado da operação
→ reler pelo mesmo ID
→ atualizar completamente a página
→ reabrir e confirmar persistência
```

## Impacto no motor P3

P3 — tarefas, próxima ação e cadência — permanece **não iniciado/incompleto** fora do Painel Ops.

A existência de um único ponto operacional de criação de tarefa não equivale a cobertura transversal do motor. Não há base para afirmar integração de tarefas com Pessoa, Caso 360, Contrato, Pesquisa, Comercial ou Onboarding até que cada ponto seja implementado e validado.

## Próximos passos de documentação

1. Atualizar ou substituir os artefatos anteriores que mencionaram cobertura de "Criar tarefa" fora do Painel Ops.
2. Marcar esses trechos como informação superada, sem apagar o histórico.
3. Antes de recomendar P3 ou P4, mapear a fonte canônica da tarefa, as rotas de criação e a chave de idempotência.
4. Só então elaborar uma especificação de implementação para expandir a ação a outras superfícies, se a proprietária autorizar.
