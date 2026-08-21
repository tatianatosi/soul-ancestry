# ANA-SAVE-SEC-01 — Relatório de entrega

Nenhuma migration, alteração de dado real ou ação externa (contrato, cobrança,
mensagem, integração, publicação) foi executada nesta rodada.

## Aplicado anteriormente
- Banco: `created_by`/`updated_by` em `case_alerts`, `entity_labels`,
  `onboarding_checklist`; trigger `fn_touch_meta`; auditoria por campo
  `fn_audit_campos` com mascaramento; execução direta revogada.
- RLS (D): `checklist_cadastral` e `case_timeline_events` migradas de `public`
  para `authenticated`; `anon` sem privilégios.
- Servidor: erro padronizado `CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA`.
- `<Toaster />` montado em `src/routes/__root.tsx` (toasts antes invisíveis).

## Concluído nesta rodada
- **A — saída com alteração pendente**: `beforeunload` mantido e navegação
  interna agora usa `useBlocker({ withResolver: true })` com diálogo de três
  escolhas na ficha (`casos.$caseId.index.tsx`): **Salvar e sair** (grava,
  confere no banco e prossegue; em erro volta à ficha), **Descartar
  alterações** e **Cancelar e continuar editando**. Após salvar, a ficha relê o
  registro e lista os campos conferidos.
- **B — mapa formal visível**: `src/components/caso/mapa-persistencia.tsx`
  exibe, dentro da própria ficha, campo → tabela/coluna/tipo/validação/permissão
  a partir de `src/lib/persistencia-caso.ts`, com busca e selo por estado
  (Salva no banco / Somente leitura / Pendente técnico).
- **C — autoria explícita**: `updated_by` é gravado pelo servidor em todos os
  caminhos (`gravarComVerificacao`/`inserirComVerificacao`), inclusive
  `atualizarAlerta`, `atualizarItemOnboarding` e etiquetas; o trigger permanece
  como segunda barreira.
- **Correção 3 — toasts**: sucesso e erro classificados (`classificarErroPersistencia`)
  em toda gravação da Aba Casos.
- **Correção 7 — rótulo de demonstração**: registros `fixture_demo` exibem o selo
  DEMONSTRAÇÃO e ficam fora de Painel Hoje, filas, métricas e App Cliente.
- **Correção 8 — pré-condições da Próxima Ação**: `exigirProximaAcaoCompleta`
  validada no servidor (responsável, prazo, público, visibilidade, canal e
  aprovação humana quando o público é externo).
- **E — testes**: `src/lib/__tests__/persistencia-aba-casos.test.ts`, 10 casos,
  todos passando (confirmação por releitura, divergência, campo não mapeado,
  bloqueio sem sucesso silencioso, próxima ação incompleta, ação externa sem
  aprovação, mascaramento, exclusão de fixtures, cobertura do mapa formal e
  rejeição de campos de controle vindos da tela).

## Pendências que dependem de decisão humana
- Proposta Canva da Ana expirada: revalidação comercial antes de qualquer
  formalização.
- Itens do checklist cadastral ainda em aberto no piloto CA-CID-AT-FAM-2026-001.
