# Execução dos PRs antigos e dos órfãos (01/11/2026, sobre a `main` publicada `e3766a6`)

Método: para cada PR, baixei o diff real, testei contra a `main` (aplica de frente = falta; aplica ao contrário =
já está; conflito = precisa de porte) e comparei **comportamento**, não só nome de símbolo (a busca por símbolo
dá falso negativo: o #118 existe com outros nomes). Para os órfãos, regerei o grafo na `main` publicada.

## PRs abertos

| PR | Resultado | Evidência |
| --- | --- | --- |
| #202 Observações internas | **executado** (#213, `contratos.$id.tsx`) | teste `prs-abertos-executados` |
| #212 CI com bun fixo e cache | **executado** (#213, `ci.yml`) | idem |
| #110 CRM Journey | **parcial**: aviso de lead sem área/responsável/próxima ação executado na Mesa. Rota `/crm-journey` e renomeação de menu **não** executadas: contrariam "uma só navegação" (`AGENTS.md`); o handoff já leva a `/propostas` | idem |
| #118 Planejador ponta a ponta | **já na `main`** com outros nomes: `lerPlanejadorSalvo` hidrata, `FASES_JORNADA` valida a fase, `entradaDoPlano` espelha. Falta só a prova autenticada da Proprietária | `planejador-operacional.tsx`, `cadeia-operacional.server.ts` |
| #114 Pessoa 360 em cards | **já na `main`** em forma mais nova (V4): núcleo e papéis, propostas/contratos/documentos, pesquisa, achados, linha do tempo | `pessoas.$clienteId.tsx` |
| #117 Cadeia do Caso 360 | **já na `main`**: `lib/cadeia-caso-360.ts` e `components/caso/cadeia-caso-360.tsx` montados no Caso 360 | `casos.$caseId.index.tsx` |
| #120 Caso 360 macro | **já na `main`**: 8 seções + "Visão Concreta"; financeiro mostra só o estado e a ação fica no resumo | `casos.$caseId.index.tsx:4227` |
| #102 Reset de confiança + SPIN | **já na `main`** (todos os símbolos presentes) | triagem por símbolo |
| #32 Pessoa: salvar com releitura | **já na `main`**: `lib/tarefas-do-caso` no Caso 360, safe-area no shell, assistente oculto no mobile, releitura estrita no #199 | `shell.tsx:473` |
| #125 cor `--background`/`--card` | **superado**: a `main` já usa `var(--cream)`; aplicar mudaria a cor do app inteiro contra a V4 | `styles.css` |
| #104, #105, #108 adendo/prova/quadro de tarefas | **superados**: regras de processo do Cursor; a regra vive no `AGENTS.md` ("nada arquiva sem `COMPROVADO_EM_USO`"). As capturas de tela são prova da Proprietária, não código | `AGENTS.md` |
| #97, #121 arquivar Planilha/SKU no GitHub | **não executados de propósito**: arquivar sem `COMPROVADO_EM_USO` contraria o `AGENTS.md` | `AGENTS.md` |

## Órfãos: 45 → 36 sem importador de produção

Religados nesta rodada (cada um com teste de render): `indicadores-governanca`, `matriz-capacidades-jornada`,
`matriz-conformidade`, `matriz-equivalencia`, `criterios-aceite`, `canvas-audit`, `aceite-e2e-passos`,
`inventario-campos-abas` e `motores-primordiais`, todos no painel "Inventários de governança" de `/qualidade`.
Antes: os porteiros da Onda 0, a experiência e o fallback do portal por caso, `debug-cliente-access` e
`botao-testar-cliente`.

Ainda sem chamador, com o motivo:

| Grupo | Módulos | Por que não liguei |
| --- | --- | --- |
| Painel Hoje duplicado | `painel-top30`, `painel-cadencia`, `metricas-jornada`, `cards-alertas-centrais`, `kanban-tarefas`, `modulos-contextuais`, `descobertas-alertas` | o `/painel` V4 já cobre; ligar cria segundo KPI/card para a mesma função (regra de "máx. 4 KPIs" e "sem card duplicado") |
| Painel anterior | `painel-dia`, `painel-hoje`, `painel-desk-hoje`, `faixa-historica` | decisão N7 de 01/11: `/painel` é a fonte viva |
| Dado de família no código | `inventario-recuperacao`, `varredura-completude`, `corte-vertical`, `decisao-ana-canonica`, `saneamento-desk-app-v4`, `app-visibilidade-registro`, `rascunhos-comunicacao-governados` | precisam virar dado de cada caso antes; `rascunhos` mexe no envio ao cliente |
| Relatórios e entregas de demo | `entrega-consultiva`, `entrega-modelo`, `relatorio-visual`, `relatorio-fase02`, `plano-acao-demo`, `kit-consolidado`, `desk-arvore-canonica` | demos com família fictícia; a V4 tem as telas reais |
| Lógica sem tela | `agenda-assistida`, `fontes-documentos-rls`, `design-tokens`, `useActiveCase`, `demo-cliente-helper`, `debug-cliente-access`, `botao-testar-cliente`, `preview-fixtures`, `portal-fallback-canonico`, `data/saneamento` | sem lugar natural na V4, ou duplicam algo ativo |
