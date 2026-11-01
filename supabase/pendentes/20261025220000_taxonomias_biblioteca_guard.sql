-- ============================================================================
-- Biblioteca: editar taxonomia falhava para qualquer pessoa
-- ESTADO: JÁ APLICADO em 25/10/2026 (~21:50 UTC), pelo Claude Code via a
-- ferramenta de banco do Lovable, sob autorização da Proprietária
-- ("sim prossiga com as suas sugestões").
--
-- CAUSA (medida no banco vivo): fn_biblioteca_mestre_guard foi escrita para
-- master_library_items, mas o trigger trg_controlled_taxonomies_guard a liga
-- também a controlled_taxonomies, que não tem vigencia_estado. Todo UPDATE
-- nessa tabela parava em: record "new" has no field "vigencia_estado".
-- Vinha assim desde a migration 20260821121120.
--
-- CORREÇÃO: em controlled_taxonomies a função só carimba updated_at,
-- updated_by e archived_by e retorna. master_library_items não muda.
-- Idempotente (pula se já aplicado); lê o corpo atual da função.
--
-- PROVA: simulando a proprietária, UPDATE em controlled_taxonomies afetou 1
-- linha dentro de transação desfeita, antes de aplicar.
-- ============================================================================
DO $$
DECLARE def text; novo text;
BEGIN
  def := pg_get_functiondef('public.fn_biblioteca_mestre_guard'::regproc);
  IF def ILIKE '%TG_TABLE_NAME = ''controlled_taxonomies''%' THEN RETURN; END IF;
  novo := replace(def, E'BEGIN\n  IF TG_OP = ''UPDATE'' THEN\n    NEW.updated_at := now();',
    E'BEGIN\n  -- controlled_taxonomies não tem os campos de vigência de master_library_items:\n  -- aqui só carimba autoria e arquivamento (correção de 25/10/2026).\n  IF TG_TABLE_NAME = ''controlled_taxonomies'' THEN\n    IF TG_OP = ''UPDATE'' THEN\n      NEW.updated_at := now();\n      NEW.updated_by := auth.uid();\n      IF NEW.archived_at IS NOT NULL AND NEW.archived_by IS NULL THEN\n        NEW.archived_by := auth.uid();\n      END IF;\n    END IF;\n    RETURN NEW;\n  END IF;\n\n  IF TG_OP = ''UPDATE'' THEN\n    NEW.updated_at := now();');
  IF novo = def THEN RAISE EXCEPTION 'trecho não encontrado: nada alterado'; END IF;
  EXECUTE novo;
END $$;
