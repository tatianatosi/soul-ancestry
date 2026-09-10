# CA-CORTE-ALERTAS-ROTA-CANONICA-2026-09-09 — execução

## Decisão de fonte

O Desk já tinha DOIS mecanismos de "alerta" que não são a mesma coisa: `alertas-derivados.ts` (visão pura computada, sem estado próprio, usada hoje só para cadência dentro de "Itens derivados" em `/painel`) e `case_alerts` (tabela real, já escrita por 4 funções deduplicadas — `prepararAlertaProjecao`, `registrarProximaAcao`, `alertaInternoTicket`, `registrarRevalidacaoProposta` — com colunas prontas para reconhecer/reprogramar: `acknowledged_at`, `acknowledged_by`, `due_at`, `status`). Como a missão exige reconhecer e reprogramar (estado persistido), e `alertas-derivados.ts` proíbe explicitamente qualquer ação além de abrir o registro canônico, a fonte escolhida foi **`case_alerts`** — sem criar tabela nem escritor novo. `alertas-derivados.ts` não foi tocado.

Correção de um relatório anterior desta mesma data: eu havia registrado que `case_alerts` já aparecia "embutida em `/painel`" — não aparecia; a confusão foi com a cadência derivada. Este round corrige isso criando a leitura de fato.

## O que foi construído

- `src/lib/alertas.functions.ts` (novo, só leitura): `listarAlertas(filtro)` — única função de leitura de `case_alerts`, usada por `/painel` e por `/alertas`. Junta `crm_casos` (caso/responsável) e `tarefas` (tarefa aberta do mesmo caso, se houver) — nenhuma tabela nova, nenhum join gravado.
- `src/routes/_authenticated/alertas.tsx` (novo): lista completa/filtrável (status, criticidade), com as ações permitidas: abrir contexto (link ao caso), abrir/reutilizar tarefa (chama `salvarTarefa`, já deduplicado — só oferece "criar" quando não há tarefa aberta encontrada), reconhecer e reprogramar (chamam `atualizarAlerta`), e "preparar para revisão" (link à Biblioteca de Evidências do caso, quando o tipo é `microentrega_pendente` — não cria nada).
- `src/lib/caso-canonico.functions.ts`: `atualizarAlerta` ganhou um campo opcional `dueAt` (mesma função, mesmo `case_alerts.update`, mesmo escritor de sempre) para suportar reprogramar.
- `src/components/painel/painel-dia.tsx`: nova seção "Alertas de hoje" (bloco `data-painel-bloco="alertas"`), chamando a MESMA `listarAlertas` com `{status:"pending", limite:5}` — só conta e linka para `/alertas`; nenhuma ação (reconhecer/reprogramar/tarefa) vive aqui.
- `src/lib/navegacao-desk.ts` e `src/lib/matriz-equivalencia.ts`: rota adicionada à navegação e à matriz de equivalência, substituindo a nota antiga "sem rota própria".

## O que não foi feito (fora do escopo, por regra)

Nenhuma tabela, motor, checklist, taxonomia, indicador novo. Nenhuma alteração em App, Caso 360, Perfil 360, UX/UI Pantone, CRM/Calls. `alertas-derivados.ts` e o bloco "Itens derivados"/cadência continuam exatamente como estavam.

## Testes

`src/lib/__tests__/alertas-rota-canonica.test.ts` (novo, 8 testes) confirma: rota existe e está na navegação; lê só `case_alerts`; Painel e `/alertas` chamam a mesma função; Painel força `status:"pending"`+`limite:5` e `/alertas` não força status; reconhecer/reprogramar reusam `atualizarAlerta`; abrir tarefa reusa `salvarTarefa` e primeiro verifica tarefa existente; toda leitura filtra por `organization_id`; nenhuma ação proibida (WhatsApp, e-mail, publicar, bypass de RLS) aparece no código novo. Dois testes pré-existentes que enumeravam os blocos do Painel (`painel-caso-destaque.test.ts`, `ca-ux-03-fase-b.test.ts`) foram atualizados para incluir o bloco `alertas`, já que a lista era a "norma" anterior e este round adiciona um bloco novo por decisão explícita da missão. `npx tsc --noEmit`, `npx vitest run` (181 arquivos, 1716 testes) e `npx vite build` — todos limpos.

Não testado nesta rodada (requer navegador real): confirmação visual de reconhecer/reprogramar refletindo imediatamente na lista sem F5.
