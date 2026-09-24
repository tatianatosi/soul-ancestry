# Matriz de fontes concorrentes da Pesquisa — evidências, relações e eventos

Data: 2026-09-24 · Fase 1 da consolidação pedida pela Proprietária.
Registro em código: `src/lib/fontes-pesquisa-canonicas.ts` (testado em
`src/lib/__tests__/fontes-pesquisa-canonicas-2026-09-24.test.ts`).

Regra: nada é apagado nem fundido à força. Cada conceito tem **uma** fonte
canônica de escrita; camadas com papel próprio ficam; legado não recebe
registro novo (edição e arquivamento do que existe continuam) e tem ponte
explícita, com prévia, para a canônica.

## Base factual (banco conectado, 24/09/2026)

| Tabela | Linhas ativas | Casos | Referências (FK) |
|---|---|---|---|
| `research_evidence_items` | 5 | DEMO + Ana | pessoa → `research_people`; relação → `research_relationships`; evento → `research_case_events` |
| `evidences` | 0 | — | pessoa → `research_people`; fonte → `research_sources` |
| `evidencias` | 3 | só DEMO | pessoa → `case_members`; hipótese → `research_hypotheses` |
| `genealogical_relationships` | 0 | — | pessoas → `research_people`; evidência → `research_evidence_items` |
| `research_relationships` | 3 | DEMO + Ana | pessoas → `research_people` |
| `case_members.pai_id/mae_id` | 1 | 1 | pessoa do caso |
| `genealogical_events` | 0 | — | pessoa → `research_people`; evidência → `research_evidence_items`; núcleo |
| `research_case_events` | 2 | DEMO + Ana | pessoa → `research_people` |
| `research_events` | 3 | só DEMO | pessoa → `case_members`; evidência → `evidencias` |

A camada genealógica (`genealogical_*`) já foi desenhada sobre
`research_people` e `research_evidence_items`. Em 04/09 a Proprietária já
tinha decidido que `genealogical_relationships` é a relação canônica
(migration `20260904190000`); os dados antigos nunca tinham sido copiados —
por isso a relação da Ana não aparecia na Ficha Piloto.

## Matriz de responsabilidade

| Conceito | Tabela | Papel | Escreve registro novo | Casa | Ponte |
|---|---|---|---|---|---|
| Evidência | `research_evidence_items` | **Canônica** | `salvarBlocoPesquisa` | `/pesquisa-modulo/$id` | — |
| Evidência | `evidences` | Decisão pendente | `biblioteca-evidencias.functions.ts` | `/biblioteca-evidencias/$caseId` | 0 linhas; decidir extensão 1:1 ou absorção |
| Evidência | `evidencias` | Legado | ninguém | `/pesquisa/$id`, `/evidencias` (só editar/arquivar) | Sem dado real a migrar |
| Relação | `genealogical_relationships` | **Canônica** | `salvarRegistroG02` | `/pessoas-linhagens/$caseId` → Relações | — |
| Relação | `case_members.pai_id/mae_id` | Camada própria | Caso 360 | Parentesco administrativo do caso, não fato genealógico | — |
| Relação | `research_relationships` | Legado | ninguém | `/pesquisa-modulo/$id` (só editar/arquivar) | Copiada por `pontearFontesDePesquisa` |
| Evento | `genealogical_events` | **Canônica** | `salvarRegistroG02` | `/pessoas-linhagens/$caseId` → Eventos | — |
| Evento | `case_timeline_events` | Camada própria | `registrarTimelineCaso` | Caso 360 → "Linha do tempo do caso" (operação) | — |
| Evento | `research_case_events` | Legado | ninguém | `/pesquisa-modulo/$id` (só editar/arquivar) | Copiado por `pontearFontesDePesquisa` (evento sem pessoa fica pendente) |
| Evento | `research_events` | Legado | ninguém | `/pesquisa/$id` (só editar/arquivar) | Sem dado real a migrar |

## O que foi executado

1. **Legado sem registro novo** — servidor recusa criação em `evidencias`
   (dossiê e `/evidencias`), `research_events` (dossiê),
   `research_relationships` e `research_case_events` (módulo antigo), com
   mensagem que aponta a casa canônica; as telas trocam o botão de criar pelo
   mesmo aviso.
2. **Ponte com prévia** — `/governanca/migracao-onboarding-gate` → "Pontes das
   fontes da pesquisa": "Ver o que será copiado" e "Copiar agora". Copia, não
   altera a origem; cada cópia leva `[origem tabela:id]` (idempotente),
   auditoria e evento na linha do tempo do caso. Mapeamento conservador: sem
   evidência vinculada nada vira "confirmado" (o banco recusaria).
   Prévia real: 3 relações e 2 eventos a copiar (1 relação e 1 evento da Ana).
3. **Leitura canônica primeiro** — a pesquisa do caso
   (`/pesquisa-evidencias/$caseId`) lê a camada genealógica; legado só aparece
   enquanto não foi copiado, marcado "legado, ainda não copiado".
4. **Linhas do tempo separadas** — "Linha do tempo genealógica" (fatos da
   pesquisa), "Linha do tempo do caso" (operação, Caso 360) e "Linha do tempo
   do dossiê (legado)".

## O que falta (decisão ou ação da Proprietária)

| Item | Tipo |
|---|---|
| Clicar "Copiar agora" na tela de migrações (prova autenticada da ponte) | Ação visual |
| `evidences`: extensão 1:1 de `research_evidence_items` ou absorção | Decisão |
| Hipóteses em duas tabelas (`research_hypotheses` do dossiê, `research_case_hypotheses` do módulo) | Próxima matriz |
| Variantes de nome em duas tabelas (`name_variants`, `research_name_variants`) | Próxima matriz |
| RLS de portal ainda existe sobre `evidencias` (nenhuma tela do App lê) | Decisão de banco |
