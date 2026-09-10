-- Segue a mesma correção de 20260904220000, para o campo que ficou de fora
-- naquela rodada: a Proprietária confirmou que, sendo dona da firma individual
-- (razão empresarial "TATIANA MELANI TOSI – ME"), ela é a representante legal
-- em todos os aspectos do Clube Ancestral — não é dado novo, é o mesmo nome já
-- público em razao_empresarial. PERFIL_INSTITUCIONAL (contrato-base-consolidado.ts)
-- ganhou o campo representante_legal = "Tatiana Melani Tosi" nesta mesma rodada.
--
-- Backfill idempotente: só toca linhas ainda no estado original de seed
-- (aguarda_fonte_societaria, sem fonte, sem data) — nunca sobrescreve edição
-- manual já feita pela Proprietária ou pela equipe.
update public.checklist_cadastral
set status = 'verificado',
    fonte = 'fonte_societaria',
    data_verificacao = current_date
where pessoa_tipo = 'contratada'
  and campo = 'representante_legal'
  and status = 'aguarda_fonte_societaria'
  and fonte is null
  and data_verificacao is null;
