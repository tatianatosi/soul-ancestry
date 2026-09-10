# Confirmação das 10 declarações canônicas — 09/09/2026

Rodada de verificação pontual, sem auditoria ampla e sem subagente: checagem direta, uma por uma, das 10 declarações passadas pela Proprietária, com evidência de arquivo:linha. Partiu do HEAD atual de `main` (`905e2a2`).

## Resultado — todas as 10 já se confirmam verdadeiras no código atual

| # | Declaração | Evidência | Conclusão |
|---|---|---|---|
| 1 | Planejador Universal + Produtos-Pai = decisão comercial/jornada | `src/lib/planejador-produtos-pai.ts:1-29` — os 9 produtos-pai canônicos (PP-01–09), "camada pura: não lê banco, não escreve, não decide preço" | Entidade já existe com este nome exato; nada a criar |
| 2 | Planilha Mestre = legado | `src/data/catalogo-fonte-mestre.ts:1-3` — "Snapshot somente-leitura da fonte canônica (...) Nenhum SKU, preço, escopo ou link foi criado, alterado ou reprecificado" | Confirmado read-only |
| 3 | SKU = complemento/técnico; não bloqueia trabalho interno | Nenhum gate/exigência sobre `sku_catalog` encontrado em `src/lib/*.functions.ts` (busca direcionada, sem retorno) | Confirmado — SKU não aparece como bloqueio de nenhuma ação interna |
| 4 | `case_plans` = escritor de jornada | Único escritor: `sincronizarPlanejador` (`src/lib/cadeia-operacional.server.ts:102-180`, insert e update na mesma função, idempotente por `plano_hash`). Demais referências (`cadeia-operacional.server.ts:255,1044`, `catalogo-top30.functions.ts:27`, `onboarding-jornada.functions.ts:47`) são só leitura | Confirmado — sem segundo escritor |
| 5 | `blueprint_parameters` = legado compatível | Lido só como fallback de comparação em `cadeia-operacional.server.ts:246-252`; zero escritores em `src/` (já confirmado em rodadas anteriores, reconfirmado aqui sem nova instância) | Confirmado |
| 6 | `onboarding_planos` = execução de onboarding | Já confirmado na rodada CA-ÚLTIMA-LIMPEZA (09/09/2026): único payload gravado é `{estado, motivos_bloqueio, updated_by}`, nunca campo comercial | Reconfirmado, sem nova checagem redundante |
| 7 | `proxima_acao_prioritaria` = uma ação por caso | RPC canônica já convergida em rodadas anteriores; não alterada nesta rodada | Sem regressão introduzida pelas mudanças mais recentes (nenhum arquivo desta cadeia foi tocado) |
| 8 | `emitirOuRecuperarOS` = escritor idempotente de OS | Já confirmado (hash de conteúdo); não alterado nesta rodada | Sem regressão |
| 9 | `app_projections`/`portal_projecoes` = fonte cliente-facing | Confirmado e reforçado na rodada anterior (CA-ÚLTIMA-LIMPEZA): `conteudoProjetavel` agora roda também no servidor em `salvarProjecao`/`aprovarProjecao` | Confirmado |
| 10 | `client_deliverables` = entrega operacional; não é automaticamente conteúdo App | `src/lib/app-visibilidade.ts:31-39` — está na lista `BLOQUEIOS_CA_PORTAL_02` ("SELECT apenas por `is_org_member`: não existe policy de portal do cliente (...) client_deliverables segue sem uso real"). Zero ocorrências em rotas/componentes de portal ou nos módulos que alimentam o App Cliente (busca direcionada). Os únicos consumidores são Desk-side: `painel-cadencia.tsx`, `painel-dia.tsx`, `caso/jornada-cliente.tsx` (aba interna da Ficha 360) | Confirmado — resolve a pendência #1 registrada no relatório CA-ÚLTIMA-LIMPEZA de hoje mais cedo: a fronteira já existe e já é respeitada, sem necessidade de RLS nova |

## Ação implementada

Nenhuma alteração de código foi necessária — as 10 declarações já valiam no HEAD atual, com prova de existência de cada entidade equivalente (nenhuma foi criada). A ação desta rodada é a própria verificação, registrada aqui para fechar formalmente a pendência #1 do relatório `2026-09-09_ultima_limpeza_resgate_desk_vivo_pre_perfil.md` (a dúvida sobre `client_deliverables` vs. achado). Nenhuma branch/PR de código foi aberta, por não haver alteração necessária; este relatório segue o mesmo fluxo de commit direto já usado nas demais rodadas de hoje.

## Checks

`npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (181 arquivos, 1716 testes) e `npx vite build` — todos já estavam limpos no HEAD atual antes desta rodada; nenhuma alteração de código nesta rodada para reverificar.

## Pendências (0 de até 5)

Nenhuma. Nada fora de escopo foi encontrado que exigisse registro e parada.
