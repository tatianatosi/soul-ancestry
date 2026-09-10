# CA06-APP-NO-DESK — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0: nenhuma tela nova (0 rotas adicionadas, as sete telas do Desk seguem intactas), nenhuma camada paralela, nenhum dado simulado — campo sem fonte viva é rotulado como tal, nunca inferido.

## 1. Caso 360 — resumo "Visão do cliente"

Adicionado como quinto card no mesmo grid dos "resumos acionáveis" já existentes (`casos.$caseId.index.tsx`), não como aba nova. Nova função `resumoVisaoClienteCaso` (`app-cliente-como-pessoa.functions.ts`, ao lado da já existente `dadosVivosDoPortalComoAdmin`) lê, só leitura:

- **Acesso**: `client_portal_case_access` + `client_portal_access` (join por FK) + os quatro gates já existentes em `crm_casos` (`app_access_status`, `app_visibility_level`, `consentimento_compartilhamento`, `info_cliente_liberada`) — mesma condição que `portal_caso_permitido` já valida no banco.
- **Última atualização liberada**: `app_projections` publicada mais recente (`effective_from`) do caso.
- **Microentregas prontas para revisão**: `app_projections` em draft/in_review/approved (o que ainda vai virar cliente-facing).
- **Documentos disponíveis ao titular**: `documents` com `liberado_cliente = true`.
- **Projeções de árvore**: `app_projections` publicadas com `projection_type = "arvore"`.
- **Preferências**: nenhuma fonte viva homologada encontrada — exibido como tal, não fabricado.
- **Estado de publicação**: contagem publicadas/pendentes/arquivadas, só de `app_projections`.

Produção interna (`client_deliverables` em revisão) aparece rotulada à parte ("Produção interna em revisão — não vai ao App sozinha"), nunca somada ao total cliente-facing.

## 2. Biblioteca Mestre — ações confirmadas

As seis ações já existiam e já estavam ligadas na UI (`biblioteca-evidencias.$caseId.tsx`): preparar (`salvarProjecao`, rascunho), revisar (`revisarProjecao` → in_review), aprovar (`aprovarProjecao` publicar:false), liberar (`aprovarProjecao` publicar:true), despublicar (`despublicarProjecao`), arquivar (`arquivarRegistroG03`, nunca exclusão física). Nenhuma faltava — confirmado por leitura de código e coberto por teste novo.

## 3. Alertas — conteúdo pronto sem tarefa duplicada

Achado real: só existia alerta manual (botão "Criar alerta interno"). Fechado: `revisarProjecao` e `aprovarProjecao` (quando aprovada sem publicar) agora gravam/reaproveitam automaticamente o mesmo `case_alerts` (tipo `microentrega_pendente`, dedup por caso+tipo+pending) — extraído para uma função interna única (`criarOuReaproveitarAlertaProjecao`), reaproveitada também pelo botão manual. Nenhuma tabela nova, nenhum leitor novo em `/alertas` (continua `listarAlertas`), nenhuma tarefa criada.

## 4. Fonte cliente-facing

Confirmado sem alteração: `app_projections`/`portal_projecoes` é a única fonte que o App lê (RLS `app_proj_select_portal`); `client_deliverables` é produção interna e só chegaria ao App por projeção sanitizada/autorizada — hoje sem esse caminho construído (achado já registrado no relatório CA05).

## Testes

`src/lib/__tests__/ca06-app-no-desk.test.ts` (novo, 19 testes): resumo sem tela nova, sete campos presentes, preferências rotuladas como sem fonte, nenhum formulário embutido, fontes corretas (app_projections/client_portal_access/documents, client_deliverables só à parte), as seis ações da Biblioteca existem e estão ligadas na rota, despublicar preserva histórico (sem `.delete()`), arquivar nunca é exclusão física, alerta automático sem duplicar tarefa, dedup confirmado, nenhuma ação de convite/e-mail/WhatsApp no código tocado, RLS preservada (sem `service_role`, filtro por organização mantido), navegação sem rota nova. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (186 arquivos, 1790 testes) e `npx vite build` — todos limpos.

## Pendência (0 de até 5)

Nenhuma nova além da já registrada em CA05 (App sem leitor de `client_deliverables` — decisão de escopo da Proprietária, não tocada aqui).

Commit: branch temporária → main → recovery.
