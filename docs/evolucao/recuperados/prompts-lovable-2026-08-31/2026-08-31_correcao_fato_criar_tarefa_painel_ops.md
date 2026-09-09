# Correção de fato — Criação de tarefa disponível somente no Painel Ops

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

A ação **“Criar tarefa” está disponível somente no Painel Ops**.

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

Registros e respostas anteriores nesta conversa afirmaram, de forma incorreta, que “Criar tarefa” funcionava em Pessoa, Caso 360, Contrato e sistemas de Pesquisa. Essas afirmações devem ser consideradas **revogadas**.

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

1. Atualizar ou substituir os artefatos anteriores que mencionaram cobertura de “Criar tarefa” fora do Painel Ops.
2. Marcar esses trechos como informação superada, sem apagar o histórico.
3. Antes de recomendar P3 ou P4, mapear a fonte canônica da tarefa, as rotas de criação e a chave de idempotência.
4. Só então elaborar uma especificação de implementação para expandir a ação a outras superfícies, se a proprietária autorizar.
