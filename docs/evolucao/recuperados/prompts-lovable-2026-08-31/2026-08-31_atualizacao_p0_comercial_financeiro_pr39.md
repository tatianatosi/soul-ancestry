# Atualização de estado — P0 Comercial/Financeiro e condição para P4

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: atualização operacional e decisão de gate de sequência
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Relato operacional recebido em 2026-08-31
  - PR #39 — P0: gravação verificada em todas as escritas de Comercial/Financeiro
  - Decisão operacional — Sequenciamento dos motores P0 a P4
escopo:
  - encerramento técnico de P0 no domínio Comercial/Financeiro
  - condição pendente de validação manual de P2
  - proibição de iniciar P4 ou P1 Fases 2/3 antes do aceite
premissas:
  - as 11 funções citadas foram alteradas na PR #39, em branch isolada a partir de main
  - tsc, testes e build verdes confirmam integridade de código, não homologação manual do comportamento em preview
limites:
  - este registro não declara P0 homologado em produção sem teste manual no navegador
  - não autoriza P4 — Onboarding Real / Motor Único
  - não autoriza P1 Fases 2/3, incluindo case_participants, unificação, reapontamento ou merge de núcleos
próximos passos:
  - executar validação de P2 no preview com caso real
  - registrar resultado de salvar, refresh e reabertura
  - somente depois solicitar autorização explícita para especificar/iniciar P4
critério de aceite:
  - editar parte contratual e CPF/CNPJ permitido
  - salvar rascunho
  - confirmar resultado/linha afetada
  - reler pelo mesmo ID
  - refresh completo
  - reabrir e confirmar persistência
substitui:
  - estado anterior que tratava P0 Comercial/Financeiro como lacuna de gravação não verificada
```

## Atualização confirmada por relato

O item técnico de P0 referente a Comercial/Financeiro foi concluído em código na PR #39. As onze funções de escrita anteriormente fora do padrão agora devem:

```text
executar INSERT/UPDATE
→ confirmar linha afetada
→ reler a entidade pelo mesmo ID
→ comparar dados relevantes
→ só então retornar sucesso
```

A alteração foi relatada como realizada em branch isolada a partir de `main`, com TypeScript, testes e build verdes.

## O que P0 passa a significar

A lacuna de implementação identificada para propostas, faturas, pagamentos, ajustes, conciliação, arquivamento e criação de Ordem de Serviço deixa de ser uma pendência de padrão de código na PR #39.

Ainda assim, o estado correto é:

```text
P0 Comercial/Financeiro: corrigido em código; aguardando validação manual no preview.
```

CI verde, build verde e teste automatizado não substituem o teste manual de navegador com escrita, refresh e reabertura.

## Condição pendente: P2

Antes de iniciar P4, a proprietária ou Ana deve validar o fluxo contratual em preview no caso real:

1. Abrir o contrato correto associado ao caso.
2. Editar parte contratual existente.
3. Alterar CPF/CNPJ permitido, quando aplicável.
4. Salvar como rascunho.
5. Confirmar resultado da escrita e a identificação da linha afetada.
6. Reler a mesma parte/contrato pelo mesmo ID.
7. Dar refresh completo no navegador.
8. Reabrir o contrato.
9. Confirmar que os valores editados persistem.

Qualquer erro deve ser registrado com rota, ação executada, identificação do caso/contrato, mensagem retornada e comportamento após refresh.

## Decisão de sequência mantida

Até a validação acima:

```text
Não iniciar P4 — Onboarding Real / Motor Único.
Não iniciar P1 Fase 2/3 — motor case_participants, unificação, reapontamento ou merge.
Não criar novo caso, núcleo, pessoa, participante ou onboarding para contornar falhas.
Não tratar interface, toast, cache, tsc, testes ou build como aceite de uso real.
```

## Próxima autorização possível

Depois que o teste de P2 for registrado como aprovado, a próxima ação é preparar o artefato de especificação de P4, contendo no mínimo:

```text
- caso e case_id canônico;
- onboarding canônico escolhido entre os sistemas existentes;
- regra de unicidade por case_id;
- reaproveitamento/tratamento dos sistemas paralelos;
- tarefas e próxima ação, sem inventar cobertura onde ela não existe;
- regra de participantes compartilhados e individuais;
- persistência, releitura e teste após refresh;
- nenhum envio externo automático;
- nenhuma mudança em RLS, sessão, permissões ou auditoria.
```

A implementação de P4 exige autorização explícita posterior da proprietária.
