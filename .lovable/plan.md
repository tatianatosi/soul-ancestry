# CA-LOVABLE-ONBOARDING-JORNADA-v1.1 — plano de implementação

Sem novas abas principais. Desk continua com as 7 áreas e o App Cliente com as 6 abas.
Tudo entra dentro de Casos 360 (Go-live, Formalização, Ficha), Alertas, Checklist, Painel Hoje
e nas abas Home / Jornada / Documentos / Legado já existentes.

## 1. Banco (uma migration)

Tabelas novas:
- `case_plans` — plano operacional do caso: fase da jornada, marco atual, responsável, próxima ação e prazo, checklists aplicáveis, pendências do cliente e internas, entrega robusta atual, próxima microentrega, última atualização ao cliente, limite da próxima atualização, dias sem touchpoint, saúde (regular/atenção/crítico) e status (rascunho/ativo/pausado/concluído/arquivado).
- `case_espera_externa` — motivo, responsável, prazo de rechecagem e status controlado; é a única forma de suspender alerta de cadência.

Ajustes aditivos (nada é removido):
- `onboarding_checklist` ganha: `descricao_interna`, `responsavel_user_id`, `evidencia_referencia_interna`, `bloqueio_codigo`, `archived_at`/`archived_by`/`archive_motivo` e status ampliado para pendente | em_revisao | concluido | bloqueado | nao_aplicavel.
- `client_deliverables` ganha `approved_by`, `approved_at`, `published_at`, e passa a aceitar os 13 tipos de entrega e os 5 estados de aprovação (draft → in_review → approved → published → archived).
- `crm_casos` ganha `eixo_operacao` (nao_iniciado … arquivado) e mantém `status_caso_derivado` com os 8 estados derivados.
- `case_alerts` ganha `origem_regra` (D7 / D10 / D14 / gate / plano) e `resolucao_observacao`.

Enums/listas controladas: eixo de formalização e operação, estado derivado, fase da jornada (8 fases), status de checklist, tipo de entrega, status de aprovação, saúde do plano.

Triggers e regras:
- `caso_ativo` só pode ser gravado com onboarding iniciado e todos os gates mínimos validados.
- plano ativo exige responsável, próxima ação e prazo; proibido plano ativo em `pre_onboarding_bloqueado`; apenas um plano ativo por fase/case_service.
- publicação de entrega exige `approved_by` + `approved_at` e resumo sanitizado.
- bloqueio de exclusão física em planos, checklists, entregas e alertas — só arquivamento com motivo.
- auditoria sanitizada (sem CPF, documento, preço) em gate, estado, checklist, plano, entrega e alerta.

GRANTs e RLS por organização e papel em todas as tabelas novas; App Cliente lê apenas projeções sanitizadas.

## 2. Regras (arquivos novos, puros e testáveis)

- `src/lib/onboarding-jornada.ts` — estados, fases, gates, `diagnosticarOnboarding(caso)` (somente leitura: status pronto_para_iniciar | requer_revisao | bloqueado, gates ok/pendentes, bloqueios, próxima ação, responsável, prazo), derivação do estado do caso, os 15 itens padrão do checklist e cálculo de cadência D7/D10/D14.
- `src/lib/onboarding-jornada.functions.ts` — server functions: diagnóstico, criar checklist padrão, concluir/bloquear item, criar e atualizar plano, iniciar onboarding, ativar caso, gerar alertas de cadência, registrar espera externa, e o ciclo da entrega (rascunho → revisão → aprovação → publicação → arquivamento).
- `src/lib/app-cliente-gate.ts` — gate único de visibilidade por aba (Home, Jornada, Documentos, Legado), usado tanto pelo menu quanto pelas rotas. Legado continua usando `legado-visibilidade.ts` sem alteração de lógica.

## 3. Interface (somente telas existentes)

- `src/components/desk-go-live.tsx` — passa a mostrar diagnóstico de gates, checklist de onboarding com 15 itens, plano operacional (responsável / próxima ação / prazo), cadência e botão de iniciar onboarding bloqueado por gate.
- Ficha do caso (`casos.$caseId.index.tsx`) — bloco de estado de formalização, estado derivado e motivo interno do bloqueio.
- Painel Hoje (`painel.tsx`) — 9 contadores operacionais pedidos (bloqueados, prontos, sem responsável, sem próxima ação, sem plano, sem microentrega até D7, D10, D14, entregas aguardando aprovação).
- Alertas — gravidade, caso, responsável, prazo, origem, próxima ação, status, com reconhecer/concluir auditado e sem exclusão de alerta crítico.
- Aprovação de entregas dentro de Casos 360, não como aba nova.
- `src/components/cliente-app.tsx` — Home, Jornada e Documentos passam a ler apenas entregas publicadas e conteúdo sanitizado; antes do onboarding a Jornada exibe o estado seguro aprovado.

## 4. Rotas

Nenhuma rota principal nova. Os gates passam a ser validados também no carregamento das rotas de jornada, documentos, árvore, relatório e entrega — URL direta devolve estado bloqueado seguro, sem dado interno.

## 5. Caso Ana (CA-CID-AT-FAM-2026-001)

Permanece `pre_onboarding_bloqueado`, formalização em preparação, onboarding não iniciado, sem pesquisa externa e sem conteúdo publicado no App Cliente. Bloqueios atuais preservados, inclusive Felipe sem contrato/anexo/App até representação documentada. Nenhum contrato, OS, cobrança, link, comunicação ou entrega publicada será criado.

## 6. Testes

`src/lib/__tests__/onboarding-jornada.test.ts` cobrindo os 13 casos exigidos: sem contrato, sem pagamento, gates parciais, pronto_para_iniciar sem criação automática, caso ativo sem onboarding, D10, D14, entregas não publicadas, entrega publicada, ausência de fonte/evidência/risco/preço nas projeções, paridade rota × menu, Ana bloqueada e bloqueio de exclusão física.

## 7. Fora de escopo (não será feito)

Contrato, OS, assinatura, cobrança, link de pagamento, WhatsApp/e-mail/push, pesquisa externa, OCR, IA, extração automática, publicação automática e qualquer nova aba ou navegação global.
