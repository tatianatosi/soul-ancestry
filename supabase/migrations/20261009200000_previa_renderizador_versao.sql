-- Prévia contratual: versão do renderizador que produziu o HTML (09/10/2026).
--
-- A regra de defasagem comparava a prévia só com a última alteração de
-- PARÂMETRO. Quando o renderizador muda (correção de texto, de origem
-- declarada, de frase duplicada), os parâmetros não mudam — e a prévia velha
-- continuava liberada para PDF, revisão e assinatura com o texto antigo.
-- Medido no contrato da Ana em 09/10: a origem do objeto aparecia como
-- "CRM confirmado" no documento gravado, embora o código já declarasse a
-- origem real.
--
-- Aditiva: coluna nula. Nula = renderizador desconhecido = tratada como
-- desatualizada pela aplicação (bloqueia saída até regerar), nunca como atual.
alter table public.contract_parameter_previews
  add column if not exists renderizador_versao text;

comment on column public.contract_parameter_previews.renderizador_versao is
  'Versão do renderizador (RENDERIZADOR_VERSAO em src/lib/renderizador-versao.ts) que produziu o HTML. Diferente da atual = prévia desatualizada: PDF, revisão e assinatura ficam bloqueados até regerar.';
