# Políticas e prompts de implementação — arquivo de referência

Cópias verbatim dos documentos de política/prompt enviados pela proprietária, guardadas aqui para que nada dependa de memória de conversa ou de contexto que pode ser resumido ao longo de uma sessão longa. Nenhum deles foi implementado só por estar aqui — este diretório é **arquivo de referência**, não registro de execução. O estado real de cada capacidade fica no Mapa de Autoridade Admin (`docs/auditorias/MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md`).

## Sequência confirmada pela proprietária (30/08/2026)

> "Concordo com a sequência: manter P0 e P1 operacionais agora; Cockpit, indicadores e revisão visual somente depois."

| Ordem | Documento | Status |
|---|---|---|
| 1 (agora) | `PENTE-FINO-IMPLANTACAO-PENDENCIAS-2026-08-30.md` | P0/P1 em andamento — Ana operável, persistência, reconciliação de PRs |
| 1 (agora) | `PROMPT-AUTORIDADE-ADMIN-MAPA-DESK-APP.md` | Em andamento — Mapa de Autoridade Admin, primeiro corte entregue (PR #34) |
| 2 (depois do motor) | `PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md` | Não iniciado — política de caso canônico único, participantes, grupo familiar, onboarding único |
| 2 (depois do motor) | `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` | Não iniciado — CRM vivo, motor contratual, cadências por evento, indicadores reais |
| 3 (Cockpit) | `PROMPT-COCKPIT-DESK-INDICADORES-CADENCIAS-ACOES.md` | Não iniciado — indicadores acionáveis por grupo do Desk |
| 4 (visual, por último) | `TAXONOMIA-CANONICA-MOCKUP-APROVADO.md` | Não implementado — é a fonte de verdade de nomenclatura para quando a revisão visual começar. Os nomes das 7 telas do App Cliente e das 7 telas do Desk Intelligence não podem ser renomeados, fundidos ou substituídos sem aprovação explícita quando esse trabalho começar. |

## Regra de leitura

Estes documentos frequentemente se sobrepõem ou usam nomes de tabela/schema hipotéticos (ex.: `citizenship_cases`, `case_participants`, `onboarding_runs`) que **não necessariamente existem** no schema real do Supabase deste projeto. Antes de implementar qualquer parte deles, confirmar contra o schema real (`supabase/migrations/`) qual tabela existente já cobre a necessidade — a regra de todos os documentos é reaproveitar entidades existentes antes de criar novas.
