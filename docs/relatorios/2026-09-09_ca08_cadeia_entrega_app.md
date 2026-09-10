# CA08-CADEIA-ENTREGA-APP — execução (09/09/2026)

Aplicada `docs/politicas/fonte-de-verdade-design-e-execucao.md` v1.0. Instrução recebida sem "MISSÃO ÚNICA"/TESTAR/CRIAR SOMENTE explícitos — tratada como a decisão mais recente da Proprietária que resolve uma pendência já registrada duas vezes (relatórios de 09/09/2026 do CA05-CADENCIA-MICROENTREGAS e CA06-APP-NO-DESK): "client_deliverables `publicado` promete chegar ao App Cliente, mas nenhuma rota lê essa tabela — App bloqueado por ausência de leitor, não só por approval_status."

## Cadeia implementada

```
Tarefa/onboarding/marco
  → client_deliverables (criarMicroentregaCliente, já existente — quando há entrega operacional real)
  → revisão interna (transicionarMicroentrega, já existente — até "publicado")
  → PONTE NOVA: projetarMicroentregaParaApp
  → app_projections em rascunho
  → revisão e aprovação (revisarProjecao / aprovarProjecao, já existentes e testados)
  → app_projections "published" → portal_projecoes (view/RLS já existentes)
  → conteúdo liberado no App
```

## O que foi criado (só a ponte — nenhuma tabela, nenhuma tela)

`projetarMicroentregaParaApp` (`biblioteca-evidencias.functions.ts`): lê uma `client_deliverables` já `publicado` (único estado cuja própria UI prometia alcançar o App), sanitiza com `conteudoProjetavel` — a mesma checagem que toda projeção já passa — e cria uma `app_projections` em `draft`, com dedup por `source_entity_type`+`source_entity_id` (uma micro-entrega nunca gera duas projeções). Dali em diante é o fluxo da Biblioteca Mestre já existente (revisar → aprovar → publicar), sem pular etapa nem aprovar/publicar automaticamente.

Botão "Projetar ao App" adicionado em `AbaJornadaCliente` (Caso 360, seção Jornada), visível só quando a micro-entrega está `publicado`. Textos que prometiam alcance direto ao App ("Somente publicadas aparecem no App Cliente", "Nada aparece no App Cliente antes de publicar") foram corrigidos para descrever a cadeia real.

## O que não mudou

`criarMicroentregaCliente` continua manual (nenhuma tarefa vira microentrega sozinha — CA05). `revisarProjecao`/`aprovarProjecao`/`despublicarProjecao` continuam exatamente como testados no CA06, incluindo os alertas automáticos de "pronta para revisão/liberação". Nenhuma policy de RLS tocada.

## Testes

`ca08-cadeia-entrega-app.test.ts` (9): a ponte só age sobre `client_deliverables`/`app_projections`; só aceita origem `publicado`; dedup confirmado; nasce sempre em `draft`, nunca aprovada/publicada por si; nunca chama `revisarProjecao`/`aprovarProjecao` por dentro (não pula etapa humana); botão só aparece com o estado certo; cópia da tela não promete mais do que a cadeia real entrega. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (189 arquivos, 1823 testes) e `npx vite build` — todos limpos.

## Pendência (0 de até 5)

Nenhuma nova — a pendência de duas rodadas anteriores está fechada.

Commit: branch temporária → main → recovery.
