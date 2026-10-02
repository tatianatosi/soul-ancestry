-- Corte 0 (01/10/2026) — a tabela canônica recebe os 12 campos que a Biblioteca
-- de Evidências já coletava e não tinha onde gravar.
--
-- ## O problema
--
-- No Corte 1a `research_evidence_items` foi eleita canônica (era a única com
-- dado real: 5 linhas contra 0 de `evidences`). Mas a construção funcional
-- tinha sido feita em `evidences`: o formulário de `/biblioteca-evidencias`
-- coleta 23 campos, e 12 deles não existem na tabela canônica. Religar a tela
-- sem isto faria o escritor recusar quase toda gravação, ou — pior — descartar
-- em silêncio o que a equipe digitou.
--
-- ## O que esta migration faz
--
-- Acrescenta as 12 colunas, **carregando os CHECKs que `evidences` já tem**,
-- palavra por palavra. Nenhum vocabulário é inventado (AGENTS.md: "gravar só
-- estes; não inventar sinônimo"). Em particular, `epistemic_validation_status`
-- traz os seis estados do Bloco 5A — que são exatamente os critérios A, B e C
-- de elevação de evidência aprovados pela Proprietária em 01/10 (D-06):
--   INFORMACAO_COMPARTILHADA_FAMILIA → DADO_PESQUISA_INICIAL
--   → EM_VALIDACAO_DOCUMENTAL → VALIDADO_POR_DOCUMENTO
-- e `evidence_nature = 'busca_negativa'` é o critério D (registro de busca
-- negativa), que os três campos `negative_search_*` sustentam com escopo,
-- período e próxima ação.
--
-- ## Por que nullable, e o que o DEFAULT faz nas linhas que já existem
--
-- Em `evidences`, `evidence_nature`, `access_level` e `epistemic_validation_status`
-- são NOT NULL. Aqui entram nullable, para que nenhuma linha fique inválida.
--
-- Atenção ao efeito real do DEFAULT, conferido no banco depois de aplicar: as 3
-- colunas que têm DEFAULT (`access_level`, `epistemic_validation_status`,
-- `legal_review_status`) **passam a valer esse default também nas 5 linhas que
-- já existiam** — é assim que `ADD COLUMN ... DEFAULT` se comporta. Isso é
-- deliberado e seguro aqui, porque os três defaults são os mais conservadores
-- do domínio: acesso restrito à equipe do caso, dado de pesquisa inicial, e
-- revisão jurídica não solicitada. Nenhum deles afirma algo a mais sobre a
-- evidência do que já se sabia.
--
-- `evidence_nature` fica sem default de propósito: natureza é classificação
-- humana (oficial, não oficial, colaborativa familiar, busca negativa…) e
-- escolher uma por conta própria seria inventar. Linha antiga fica NULL, que
-- significa honestamente "ainda não classificada".
--
-- Aditiva. Não altera nem remove nada. Não mexe em RLS.

ALTER TABLE public.research_evidence_items
  ADD COLUMN IF NOT EXISTS evidence_nature text,
  ADD COLUMN IF NOT EXISTS access_level text DEFAULT 'equipe_do_caso',
  ADD COLUMN IF NOT EXISTS epistemic_validation_status text DEFAULT 'DADO_PESQUISA_INICIAL',
  ADD COLUMN IF NOT EXISTS legal_review_status text DEFAULT 'nao_solicitado',
  ADD COLUMN IF NOT EXISTS legal_review_notes_internal text,
  ADD COLUMN IF NOT EXISTS reference_date date,
  ADD COLUMN IF NOT EXISTS reference_location text,
  ADD COLUMN IF NOT EXISTS storage_reference_internal text,
  ADD COLUMN IF NOT EXISTS negative_search_source text,
  ADD COLUMN IF NOT EXISTS negative_search_date date,
  ADD COLUMN IF NOT EXISTS negative_search_next_action text,
  ADD COLUMN IF NOT EXISTS research_item_id uuid;

-- CHECKs idênticos aos de `evidences`, tolerando NULL na linha histórica.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rei_nature_ck') THEN
    ALTER TABLE public.research_evidence_items ADD CONSTRAINT rei_nature_ck
      CHECK (evidence_nature IS NULL OR evidence_nature = ANY (ARRAY[
        'documental_oficial','documental_nao_oficial','colaborativa_familiar',
        'registro_interno','busca_negativa','material_de_apoio']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rei_access_ck') THEN
    ALTER TABLE public.research_evidence_items ADD CONSTRAINT rei_access_ck
      CHECK (access_level IS NULL OR access_level = ANY (ARRAY[
        'restrito','equipe_do_caso','cliente_autorizado']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rei_epistemic_ck') THEN
    ALTER TABLE public.research_evidence_items ADD CONSTRAINT rei_epistemic_ck
      CHECK (epistemic_validation_status IS NULL OR epistemic_validation_status = ANY (ARRAY[
        'INFORMACAO_COMPARTILHADA_FAMILIA','DADO_PESQUISA_INICIAL','EM_VALIDACAO_DOCUMENTAL',
        'VALIDADO_POR_DOCUMENTO','PENDENTE_CONFIRMACAO','NAO_APLICAVEL']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rei_legal_ck') THEN
    ALTER TABLE public.research_evidence_items ADD CONSTRAINT rei_legal_ck
      CHECK (legal_review_status IS NULL OR legal_review_status = ANY (ARRAY[
        'nao_solicitado','solicitado','em_analise','concluido','nao_aplicavel']));
  END IF;
END $$;

COMMENT ON COLUMN public.research_evidence_items.epistemic_validation_status IS
  'Estado epistemico do Bloco 5A. A elevacao segue os criterios D-06 aprovados em 01/10/2026 e exige revisao humana registrada.';
COMMENT ON COLUMN public.research_evidence_items.negative_search_source IS
  'Busca negativa (criterio D do D-06): onde se buscou. A ausencia documentada de resultado nunca conclui por si.';
