-- Corte R4 (de-para-pessoa-unificada.md / auditoria de reconciliação,
-- 21/09/2026): `nucleo_membros.papel_no_caso` já tem um CHECK fechado
-- (migration 20260821135341) com 5 valores: contratante/titular/dependente/
-- representante/interlocutor_externo. `case_members.papel_no_caso` (mesmo
-- conceito, tabela irmã) nunca teve CHECK nenhum — era texto livre, e a UI
-- (`PAPEIS_PESSOA`, src/lib/caso-ficha.ts) só oferecia 4 valores, um deles
-- ("interlocutor") divergente do vocabulário fechado da tabela irmã.
--
-- Esta migration fecha a mesma lista em `case_members`, incluindo
-- "interlocutor" como variante legada — nenhuma linha já gravada com esse
-- valor é invalidada. Aditiva, reversível, sem backfill nem reescrita de
-- dado existente.
DO $$ BEGIN
  ALTER TABLE public.case_members
    ADD CONSTRAINT case_members_papel_no_caso_chk
    CHECK (
      papel_no_caso IS NULL
      OR papel_no_caso IN (
        'contratante',
        'titular',
        'dependente',
        'representante',
        'interlocutor_externo',
        'interlocutor'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
