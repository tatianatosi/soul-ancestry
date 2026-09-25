# De-para — Espelho da próxima ação do Planejador em `crm_casos` (P5, 25/09/2026)

## Contexto

Investigação corretiva pedida pela Proprietária: auditorias anteriores
desta sessão arquivavam/listavam PRs e documentos sobre Produto-Pai/
Planejador de Cidadania sem ler o conteúdo. Ao reler a fundo, confirmei um
gap técnico real no meu próprio corte P4 ("Jornada do Planejador no Caso
360", `2026-09-25_DE-PARA-JORNADA-PLANEJADOR-CASO-360.md`).

## O gap

`salvarJornadaDoCaso` (P4) grava `case_plans.proxima_acao`/
`prazo_proxima_acao`/`responsavel_user_id` — mas a RPC canônica que decide
a próxima ação prioritária de um caso (`proxima_acao_prioritaria`,
`supabase/migrations/20260905130000_proxima_acao_prioritaria_caso.sql`,
nível 8) só lê `crm_casos.proxima_acao`/`prazo_proxima_acao`. Confirmado
lendo o corpo inteiro da função: nenhuma referência a `case_plans`.
Consequência prática: preencher a próxima ação no cartão da Jornada não
movia nada em Painel Hoje, na Ficha do caso nem na Lista de Casos —
gravava um campo que nenhum consumidor de prioridade lia.

Achado relacionado: a branch remota órfã e obsoleta
`origin/cursor/motor-planejador-ponta-a-ponta-fced` (11/09/2026, nunca
mesclada) já tinha implementado a mesma ideia (`espelharProximaAcaoNoCaso`)
de forma independente — confirma que o gap é real, não uma hipótese.
Também existe um escritor pontual e separado,
`definirProximaAcaoGoLive` (`golive-escritores.functions.ts`), que já fazia
esse mesmo espelho para o fluxo de piloto/golive — reaproveitado como
referência do formato de `crm_casos.proxima_acao_responsavel` (texto de
exibição, nunca um UUID).

## O que foi feito

`src/lib/jornada-planejador.server.ts`: nova função privada
`espelharProximaAcaoNoCaso`, chamada por `salvarJornadaDoCaso` logo após a
gravação pontual em `case_plans`:

- Espelha `proxima_acao` → `crm_casos.proxima_acao` (mesmo texto).
- Espelha `prazo_proxima_acao` → `crm_casos.prazo_proxima_acao`.
- Quando `responsavel_user_id` é gravado, resolve o nome via `profiles` e
  espelha em `crm_casos.proxima_acao_responsavel` (texto de exibição já
  usado por `kit-conectado.tsx`, `radar-interno-integrado.tsx`,
  `matriz-prioridades-conectada.tsx`, `visao-geral.tsx`,
  `casos.$caseId.index.tsx`, `casos.index.tsx`, `pessoas.$clienteId.tsx`).
- Usa `gravarComVerificacao` (mesmo padrão de todo escritor pontual desta
  sessão): grava, relê, compara.
- Nunca apaga um valor existente em `crm_casos`: só espelha o campo que
  veio com valor novo no patch da jornada (mesmo cuidado defensivo do
  espelhamento de `motivos_bloqueio` já em produção).

## Não tocado

- `case_plans` continua exatamente como o P4 deixou (sem mudança de
  schema, sem migration nova).
- `sincronizarPlanejador`/`PlanejadorOperacional` (formulário grande).
- Nenhuma tabela nova, nenhuma RLS nova.

## Prova Lovable pós-push

No caso de teste: Caso 360 → Jornada → definir/alterar "próxima ação" +
prazo no cartão do P4, salvar → abrir Painel Hoje (ou a Ficha do mesmo
caso) → a mesma próxima ação/prazo aparece como a ação prioritária do
caso (nível 8, quando não há nada mais urgente nos níveis 1-6) → mudar de
novo e conferir que atualiza.
