-- ESTADO: NÃO APLICADO; AGUARDA AUTORIZAÇÃO EXPLÍCITA
-- Auditoria pré-lançamento (25/10/2026), item 2 do "Ainda pendente":
-- "Remover papel apaga a linha de `user_roles`: a tabela não tem coluna de
-- arquivo; mudar exige migration. Hoje a remoção fica registrada em
-- auditoria." AGENTS.md: "sem exclusão física; auditoria em mudanças."
--
-- O que faz: adiciona `archived_at` em `public.user_roles`, idempotente
-- (IF NOT EXISTS). Não apaga nada, não altera dado existente, não troca
-- política de RLS. Sozinha, esta migration é inócua.
--
-- O que NÃO vem neste arquivo, e por quê não é só SQL:
-- Hoje `revogarVinculo` e `sincronizarVinculo` (src/lib/equipe.server.ts,
-- linhas 194-224) fazem `.delete()` físico em `user_roles`. Para a coluna
-- nova valer algo, a exclusão física precisa virar
-- `update ... set archived_at = now()`, e TODAS as 17 leituras hoje feitas
-- em `user_roles` (saas.functions.ts, portal.server.ts, onboarding-regras.ts,
-- message-library.functions.ts, comercial.server.ts, pesquisa.server.ts,
-- pesquisa-modulo.server.ts, documentos.server.ts, superficie-interna.tsx,
-- devolutiva.tsx, route.tsx, equipe.diagnostico-rotas.tsx, index.tsx)
-- precisam passar a filtrar `.is("archived_at", null)` — senão um papel
-- "removido" continua valendo em qualquer uma dessas 17 checagens, que é
-- pior que o comportamento atual. É autorização de resolução de papel em
-- produção, não um bug de uma linha: aplicar a coluna sem o código
-- acompanhando cria uma falsa sensação de que a remoção já é reversível.
--
-- Pedido à Proprietária: autorizar esta migration E o acompanhamento de
-- código nas 17 leituras + 2 escritas na mesma mudança, não só a coluna
-- isolada.

alter table if exists public.user_roles
  add column if not exists archived_at timestamptz;

comment on column public.user_roles.archived_at is
  'Quando preenchido, o papel foi revogado sem exclusão física (AGENTS.md). NULL = papel ativo. Aplicado 20261026, item 2 da auditoria pré-lançamento.';
