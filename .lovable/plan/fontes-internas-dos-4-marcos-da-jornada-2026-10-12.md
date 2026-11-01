# Fontes internas dos 4 marcos da Jornada

## O que será registrado
Uma anotação interna por marco, visível só para a equipe no Histórico do Caso 360 da Ana. Nunca aparece no App.

| Marco | Fonte anotada |
|---|---|
| 24/09/1895 — Nascimento de Otto Reimer em Graz | Geburtsbuch de Graz (registro de nascimento) |
| 1938–1939 — Perseguição em Viena e emigração forçada | Lista de bordo |
| 1941 — Casamento civil e chegada ao Brasil | Lista de bordo (registro de imigração) |
| 2026 — Submissão do processo (§58c StbG) | Início do processo pela titular Ana Luiza em 2026 (marco do processo, sem documento histórico) |

Cada anotação diz que a fonte foi informada pela Proprietária em 12/10/2026 e que o documento ainda não foi anexado (verificação pendente).

## Garantias
- Os textos dos marcos que a cliente vê não mudam.
- Visibilidade "interno": o App lê só conteúdo aprovado para cliente, então essas anotações não chegam lá.
- Nenhuma tela, coluna ou regra nova; nada é publicado.

## Detalhes técnicos
- 4 linhas novas em `case_timeline_events` (caso `a11a0000-...-0002`): `visibility='interno'`, `status='registrado'`, `summary_internal` com a fonte, `summary_client_approved` nulo, `source_entity_type='app_projection'` e `source_entity_id` = id de cada marco em `app_projections`.
- Depois, confirmar por consulta que as 4 linhas existem e que os leitores do App não as retornam.
