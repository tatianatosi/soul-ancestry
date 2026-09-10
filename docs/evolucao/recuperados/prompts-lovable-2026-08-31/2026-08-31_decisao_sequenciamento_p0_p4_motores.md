# Decisão operacional — Sequenciamento dos motores P0 a P4

```yaml
status: em revisão
a:
  data: 2026-08-31
  projeto: Clube Ancestral
  classificação: recomendação operacional e decisão de sequenciamento
  responsável pela decisão: Proprietária do Clube Ancestral
  fontes de evidência:
    - Prompt Mestre — Motores a Implantar, informado como arquivado em docs/politicas/PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md e associado ao PR #34
    - Mapa de Autoridade Admin
    - PR #34, PR #35 e PR #36, conforme relato recebido
    - Relatório do Dia 4 / achado do CNPJ institucional em três fontes sem sincronização
  escopo: definição da ordem de avanço entre P0, P1, P2, P3 e P4
  premissas:
    - cada fase exige validação com dados reais antes da próxima
    - não criar sistemas paralelos, casos duplicados ou fontes de verdade adicionais
    - não alterar RLS, login, sessão, permissões por organização ou auditoria
  limites:
    - não autoriza unificação de núcleos, criação de case_participants ou migração/reapontamento de dados
    - não autoriza sincronização institucional do CNPJ antes da política unificada
    - não equivale à validação em preview das PRs citadas
  próximos passos: validar P0 e P2 em preview; em seguida, decidir e especificar P4 como PR isolada
  critério de aceite: cada gravação relevante confirma resultado, releitura pelo mesmo ID, refresh completo e reabertura persistente
  substitui: nenhum
```

## Objetivo

Registrar a interpretação operacional do Prompt Mestre e impedir que o desenvolvimento avance para motores posteriores sem encerrar os critérios verificáveis das fases anteriores.

A sequência válida é P0 → P11. A expressão “executar após ou simultaneamente” não autoriza pular a ordem nem iniciar novas jornadas paralelas. Trabalho simultâneo só pode ocorrer quando não viola dependências, não mistura escopos e não enfraquece a validação da fase anterior.

## Estado informado

| Fase | Estado reportado | Leitura operacional |
|---|---|---|
| P0 — Persistência | Maioria concluída; aproximadamente 12 de 14 escritas de Comercial/Financeiro ainda sem padrão de gravação verificada | P0 permanece incompleta nesse domínio. Não declarar Comercial/Financeiro operacionais enquanto escrita, releitura e refresh não forem demonstrados. |
| P1 — Caso único | Fase 1 de mapeamento realizada no PR #36; unificação não iniciada | Manter Fases 2/3 pausadas. Não criar `case_participants`, unir núcleos ou reapontar vínculos sem decisão formal e matriz aprovada. |
| P2 — Contrato, proposta e OS | Contrato parcialmente evoluído no PR #35 | Validar no preview as ações reais, edição de partes, CPF/CNPJ, rascunho e persistência. Perfil institucional/CNPJ fica pausado. |
| P3 — Tarefa e próxima ação | Não iniciado | Dependente de vínculos canônicos e da persistência confiável em P0/P2. Pode ser especificado, mas não deve criar motor desconectado. |
| P4 — Onboarding único | Não iniciado; existem três sistemas paralelos já identificados | É o motor de maior prioridade após validação de P0 e P2, pois precisa consolidar uma única jornada operacional. |

## Decisão recomendada

1. Encerrar a verificação de P0 em Comercial/Financeiro, começando pelas funções que ainda não confirmam linha afetada, releitura independente e persistência após refresh.
2. Executar teste de preview de P2 no caso de Ana Luiza: editar parte, CPF/CNPJ permitido, salvar rascunho, recarregar e reabrir o mesmo registro.
3. Não iniciar P1 Fases 2/3 enquanto não houver autorização específica da proprietária para matriz de reconciliação e motor de participantes.
4. Após os itens 1 e 2, iniciar P4 em PR isolada: **Onboarding Real — Motor Único**.
5. Tratar P3 como dependência interna explícita de P4 somente se usar o mesmo `case_id`, a mesma fonte de verdade e uma chave de idempotência auditável. Caso contrário, manter P3 em PR separada e anterior a P4.

## Condições de P4

A especificação da PR de onboarding deve declarar antes de codificar:

```text
Caso canônico: tabela, case_id e regras de organização.
Onboarding canônico: tabela existente reutilizada ou nova tabela aditiva justificada.
Regra de unicidade: um onboarding ativo/rascunho por case_id.
Participantes: compartilhado familiar versus individual por pessoa.
Tarefas: tabela, responsável, vínculo e chave lógica de idempotência.
Próxima ação: entidade, responsável, prazo e origem.
Relação comercial: proposta, contrato e OS pelo mesmo case_id.
Micro-entrega: origem, revisão interna e regra de visibilidade.
Persistência: salvar → confirmação → releitura pelo mesmo ID → refresh → reabrir.
```

Não é aceitável criar um quarto sistema de onboarding. A PR deve identificar os três sistemas existentes, decidir qual se torna fonte canônica, como os demais serão tratados e como evitar duplicidade sem apagar dados para contornar inconsistência.

## Testes mínimos

Para P0 e P2:

```text
1. Abrir a rota correspondente.
2. Editar ou criar uma entidade permitida.
3. Salvar.
4. Confirmar resultado da escrita e linha afetada.
5. Reler a entidade pelo mesmo ID na fonte canônica.
6. Atualizar a página completamente.
7. Reabrir o registro.
8. Comparar os campos alterados.
9. Confirmar que nenhum toast, cache ou interface está substituindo a prova de persistência.
```

Para P4, acrescentar:

```text
10. Reexecutar “Iniciar onboarding” no mesmo case_id.
11. Confirmar reutilização do onboarding existente, sem duplicidade.
12. Confirmar tarefas idempotentes e próxima ação vinculada ao mesmo caso.
13. Confirmar que nenhuma ação externa foi enviada sem confirmação explícita.
```

## Riscos mantidos sob controle

- O CNPJ da contratada continua em três locais sem sincronização; não aplicar correção parcial antes da política unificada.
- Há representações de pessoa sem identificador comum em domínios diferentes; não usar criação de nova pessoa/caso/núcleo como atalho.
- Build, testes automatizados e UI renderizada não comprovam persistência operacional por si só.
- As PRs em draft permanecem pendentes de validação humana no preview.

## Próximos passos

1. Registrar evidência do teste de P0 e P2.
2. Atualizar esta decisão com resultado da validação ou falhas encontradas.
3. Preparar especificação do P4 somente após a confirmação dos critérios anteriores.
4. Solicitar autorização explícita para iniciar a PR de implementação P4.
