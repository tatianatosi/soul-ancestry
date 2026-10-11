-- Saneamento do núcleo familiar do caso CA-CID-AT-FAM-2026-001 (11/10/2026).
--
-- Orientação da Proprietária, a partir do levantamento read-only desta
-- sessão: `nucleo_membros` tinha uma linha fantasma de Ana Luiza (sem
-- nome, duplicada da oficial) e os papéis_no_caso de Ana/Adair/Alice
-- divergiam do pretendido. Nunca DELETE (mesmo padrão de
-- 20260925190000_citizenship_tracks_dedup_p12.sql): a linha fantasma é
-- arquivada via archived_at/archive_motivo, histórico preservado.
--
-- Estado-alvo confirmado pela Proprietária:
--   - Ana Luiza Gomes Silveira Rodrigues: papel_no_caso = 'contratante'
--     (titular financeira do caso).
--   - Adair Pinto Silveira Júnior e Alice Gomes Silveira: papel_no_caso
--     = 'dependente' (sem papel financeiro — o filtro
--     portal_sou_contratante_financeiro, migration 20261010120000, passa
--     a ocultar fatura/condição comercial deles no portal).
--   - Felipe (dependente, representado por Ana no § 58c, sem cliente_id
--     próprio): já estava correto — não tocado nesta migração.
--
-- `where archived_at is null` e os filtros por conteúdo (não só id) tornam
-- a migration idempotente mesmo se já aplicada manualmente antes.

-- 1) Arquiva a linha fantasma de Ana Luiza (nome vazio).
update public.nucleo_membros
set archived_at = now(),
    archive_motivo = 'Saneamento 11/10/2026: linha fantasma sem nome, duplicada da oficial de Ana Luiza Gomes Silveira Rodrigues no mesmo núcleo. Orientação da Proprietária após levantamento read-only do caso CA-CID-AT-FAM-2026-001.'
where id = '74f628ed-d7c3-44f4-814c-f78a9b99c6f5'
  and archived_at is null
  and trim(coalesce(nome, '')) = '';

-- 2) Ana Luiza: titular financeira do caso.
update public.nucleo_membros
set papel_no_caso = 'contratante'
where id = 'f2b80016-b714-4915-93d0-0108c4b86d68'
  and nome = 'Ana Luiza Gomes Silveira Rodrigues'
  and archived_at is null;

-- 3) Adair e Alice: dependentes (sem papel financeiro).
update public.nucleo_membros
set papel_no_caso = 'dependente'
where id in ('8871edd9-0623-473f-bf8f-6bf0bcb51c73', '90d29bd9-269b-4f86-975d-051f35e8b6a3')
  and nome in ('Adair Pinto Silveira Júnior', 'Alice Gomes Silveira')
  and archived_at is null;
