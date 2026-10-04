-- Prompt de Pesquisa: os dois itens que estavam "declarados, não construídos"
-- desde 27/09/2026 (docs/arquitetura/FICHA-PESQUISA-GENEALOGICA-CANONICA.md,
-- linhas 41 e 42). Executados em 04/10/2026, a pedido da Proprietária:
-- "a varredura que pedi em relação a pesquisa não foi só de órfãos e sim de
-- diversos prompts que não foram executados e somente documentados".
--
-- Nenhuma tabela nova: as duas que já registram o ato recebem as colunas que
-- faltavam.
--
-- 1) Log de consulta a fonte (CONSULTA_ID · FONTE_ID · CLASSIFICACAO_M ·
--    RESULTADO). `research_document_requests` já era o registro do ato de
--    consultar; `CONSULTA_ID` é o `id` da própria linha. A classificação M
--    NÃO é copiada: vem por leitura da FK para o catálogo.
-- 2) Checklist de revisão documental (LEGIVEL · INTEGRO ·
--    PESSOA_IDENTIFICAVEL). O terceiro já existia como
--    `case_source_documents.pessoa_nao_identificada`; faltavam os dois
--    primeiros. Default `a_avaliar`: documento não revisado não vira "ok".
--
-- Aditiva, nullable/com default, sem backfill. Aplicada no banco conectado e
-- registrada em supabase_migrations.schema_migrations em 04/10/2026.

ALTER TABLE public.research_document_requests
  ADD COLUMN IF NOT EXISTS genealogical_source_id uuid REFERENCES public.genealogical_sources_catalog(id),
  ADD COLUMN IF NOT EXISTS resultado_consulta text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rdr_resultado_consulta_chk') THEN
    ALTER TABLE public.research_document_requests
      ADD CONSTRAINT rdr_resultado_consulta_chk
      CHECK (resultado_consulta IS NULL OR resultado_consulta IN ('encontrado','nao_encontrado','parcial','inacessivel','aguardando'));
  END IF;
END $$;

ALTER TABLE public.case_source_documents
  ADD COLUMN IF NOT EXISTS legibilidade text DEFAULT 'a_avaliar',
  ADD COLUMN IF NOT EXISTS integridade text DEFAULT 'a_avaliar';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'csd_legibilidade_chk') THEN
    ALTER TABLE public.case_source_documents
      ADD CONSTRAINT csd_legibilidade_chk
      CHECK (legibilidade IN ('ok','parcial','ilegivel','a_avaliar'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'csd_integridade_chk') THEN
    ALTER TABLE public.case_source_documents
      ADD CONSTRAINT csd_integridade_chk
      CHECK (integridade IN ('ok','parcial','comprometida','a_avaliar'));
  END IF;
END $$;

COMMENT ON COLUMN public.research_document_requests.genealogical_source_id IS
  'Fonte consultada (FONTE_ID do template de log de consulta). A classificação M vem por leitura da FK, nunca copiada.';
COMMENT ON COLUMN public.research_document_requests.resultado_consulta IS
  'RESULTADO da consulta: encontrado, nao_encontrado (busca negativa), parcial, inacessivel, aguardando.';
COMMENT ON COLUMN public.case_source_documents.legibilidade IS 'Checklist de revisão documental: LEGIVEL.';
COMMENT ON COLUMN public.case_source_documents.integridade IS 'Checklist de revisão documental: INTEGRO.';
