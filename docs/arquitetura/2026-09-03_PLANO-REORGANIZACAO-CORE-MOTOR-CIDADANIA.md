# Plano de Reorganização do Core — Motor Planejador de Cidadania

```yaml
status: em revisão — aguardando confirmação da proprietária em 1 ponto (ver "Decisão pendente")
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: decisão de arquitetura
responsável pela decisão: Proprietária Administradora do Clube Ancestral
base normativa: docs/arquitetura/2026-09-03_DE-PARA-MOTOR-CIDADANIA-ENTIDADES-PROPOSTAS-VS-TABELAS-EXISTENTES.md (PR #62)
repositório: tatianatosi/soul-ancestry
fonte: consultas diretas ao Supabase (execute_sql), projeto zsxpdbhdvbuulwpepemd, em 2026-09-03
```

## Decisão da proprietária que este documento executa

"Concordo, não precisamos de mais tabelas e sim de uma reorganização no core" (2026-09-03),
confirmando o de-para da PR #62: em vez de criar as 12 entidades novas propostas em
`instrucoes-motor-cidadania-v1.0.md`, reorganizar o que já existe.

Este documento aprofunda o de-para com dado real linha a linha, para que "reorganizar o core"
vire um plano concreto — e não outra rodada de listas. Ainda **não executa** nenhuma migração:
ver "Decisão pendente" antes de qualquer alteração de schema.

## Achado que corrige o de-para anterior: 2 dos 4 grupos não são fragmentação — são tabela morta ao lado de tabela viva

A PR #62 tratou hipóteses, relacionamentos, eventos e decisões como 4 grupos igualmente
fragmentados. Olhando linha a linha, dois desses grupos são mais simples do que pareciam:

| Grupo | Tabela A | Tabela B | Tabela C | Evidência real |
|---|---|---|---|---|
| Relacionamentos | `genealogical_relationships` — **0 linhas** | `research_relationships` — 3 linhas, criadas entre 16/08 e 20/08 | — | `genealogical_relationships` nunca foi populada. Não é fragmentação, é andaime morto. |
| Decisões | `decisions` — **0 linhas** | `owner_override_events` — 40 linhas, uso contínuo até 28/08 | `legal_clause_matrix` — 36 linhas, todas criadas no mesmo segundo (19/08, lote único) | `decisions` nunca foi populada. `owner_override_events` e `legal_clause_matrix` têm propósitos distintos de verdade (override geral vs. decisão jurídica de cláusula contratual) — não competem entre si. |

## Os 2 grupos que são fragmentação real

### Hipóteses — evidência decide

| Tabela | Linhas | Conteúdo real |
|---|---:|---|
| `research_case_hypotheses` | 2 | 1 linha `"DEMO — hipótese de filiação"` + 1 linha `"trstes"` (teste, sem sentido) |
| `research_hypotheses` | 5 | Hipóteses reais e específicas: *"Luigi Prade nasceu na comuna de Vicenza"*, *"Linha de filiação entre Aldo e Luigi Prade"*, *"Linha austríaca por ascendência direta"*, *"Documentação civil da geração intermediária"*, *"Enquadramento § 58c StbG"* — este último bate exatamente com o caso real da Ana Luiza (Áustria, § 58c) |

**Recomendação com evidência:** `research_hypotheses` é a tabela viva; `research_case_hypotheses`
só tem dado de demo/teste. Candidata a canônica: `research_hypotheses`, estendida com
`country_id`/`route_id` (o gap real do de-para) para virar o equivalente de
`case_country_hypotheses`.

### Eventos — evidência é ambígua, decisão da proprietária necessária

| Tabela | Linhas | Padrão temporal |
|---|---:|---|
| `research_case_events` | 3 | Criadas em datas diferentes e espaçadas (16/08, 28/08, 31/08) — padrão de uso orgânico, uma de cada vez |
| `research_events` | 3 | As 3 criadas no mesmo segundo (16/08 20:18:30) — padrão de carga em lote/seed, não de uso orgânico |
| `historical_context_events` | 0 | Nunca populada — andaime morto, mesmo padrão de `genealogical_relationships`/`decisions` |

`historical_context_events` entra direto para arquivamento, como as outras duas tabelas mortas.
Entre `research_case_events` e `research_events`, a evidência (uso orgânico vs. lote único) aponta
para `research_case_events` como a mais provável de estar em uso ativo — mas ao contrário do
grupo de hipóteses, aqui as duas têm dado real e não claramente demo/teste, então esta escolha
fica para a proprietária confirmar, não para eu decidir sozinho.

## Plano de reorganização (pendente da decisão acima)

| Ação | Tabela(s) | Como |
|---|---|---|
| Arquivar (nunca apagar) | `genealogical_relationships`, `decisions`, `historical_context_events`, `research_case_hypotheses` | Marcar com o próprio campo `archived_at`/`archive_reason`/`archive_motivo` que cada tabela já tem — nenhuma linha é apagada fisicamente. As 2 linhas de `research_case_hypotheses` (demo + teste) são arquivadas com o motivo registrado. |
| Consolidar | Hipóteses → `research_hypotheses` | Nenhuma migração de dado necessária (a tabela perdedora só tinha demo/teste). Estender com `country_id`/`route_id`. |
| Consolidar (após decisão) | Eventos → tabela vencedora entre `research_case_events`/`research_events` | Migrar as 3 linhas da tabela perdedora para a vencedora antes de arquivar, preservando IDs originais em campo de rastreabilidade. |
| Manter separadas (não são fragmentação) | `owner_override_events`, `legal_clause_matrix` | Propósitos distintos confirmados pelos dados — nenhuma ação. |
| Estender (gap real #1) | `citizenship_tracks` | Normalizar `via_preliminar`/`status_via`/`requisitos_entrada` (hoje texto livre) em estrutura de rota com `route_code`/`route_type`/`generation_rule`/`residence_rule`/`dual_citizenship_rule` — aditivo, sem remover os campos de texto existentes (mantidos como espelho legível até a migração de leitura estar completa). |
| Criar (gap real #2) | `citizenship_events` (nova, pequena) | Tipos `ACQUISITION`/`CITIZEN_AT_BIRTH`/`CONFIRMATION`/`NATURALIZATION`/`LOSS`/`RENUNCIATION`/`RESTORATION`/`OPTION`/`DECLARATION`/`UNKNOWN_STATUS`, com `legal_basis`/`naturalization_country`/`voluntary_act`/`impact_on_transmission` — não existe hoje em nenhuma tabela. |
| Criar (gap real #3) | `rule_evaluations` (nova, pequena) | Snapshot explicável de avaliação de regra por hipótese — não existe hoje em nenhuma tabela. |

## Decisão pendente

**Eventos: `research_case_events` ou `research_events` como tabela canônica?** Recomendação com
base na evidência (uso orgânico ao longo de 3 datas distintas, versus lote único no mesmo
segundo): `research_case_events`. Preciso da sua confirmação antes de migrar as 3 linhas de
`research_events` e arquivá-la — é dado de caso real, não quero mover/arquivar sem seu aval.

## Fora do escopo desta entrega

- Nenhuma migração SQL foi executada. Este documento é o plano; a execução (mesmo sendo
  aditiva e não-destrutiva) só acontece depois da confirmação acima, em PR própria com
  `tsc --noEmit` + `vitest run` + `vite build` antes do commit, como de praxe.
- Nenhuma linha foi arquivada ainda — inclusive as de `research_case_hypotheses` (demo/teste),
  que só serão marcadas depois desta PR ser revisada.
- A extensão de `citizenship_tracks` para rota normalizada e as duas tabelas novas
  (`citizenship_events`, `rule_evaluations`) ficam desenhadas aqui, mas não implementadas — a
  proprietária ainda não confirmou os itens da seção "Condição para aprovação" de
  `instrucoes-motor-cidadania-v1.0.md` (regiões da primeira onda, autoridade jurídica, etc.).

## Próximos passos

1. Proprietária confirma a tabela canônica de eventos (`research_case_events` recomendada).
2. Migração aditiva: arquivar as 4 tabelas mortas/demo, estender `research_hypotheses` com
   `country_id`/`route_id`.
3. Desenhar e criar (aditivo) `citizenship_events` e `rule_evaluations`.
4. Normalizar rota dentro de `citizenship_tracks`, mantendo os campos de texto atuais como
   espelho até a leitura estar migrada.
5. Só então conectar o motor de avaliação de hipóteses descrito em
   `instrucoes-motor-cidadania-v1.0.md` às tabelas reorganizadas.
