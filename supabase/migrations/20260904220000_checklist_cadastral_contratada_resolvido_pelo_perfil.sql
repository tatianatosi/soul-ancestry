-- Achado real reportado pela Proprietária (04/09): o checklist cadastral marcava
-- razão social/CNPJ/endereço/e-mail da própria contratada (Clube Ancestral) como
-- "aguarda fonte societária" em todo caso — mesmo esse dado já sendo canônico,
-- versionado e conhecido (src/lib/contrato-base-consolidado.ts, PERFIL_INSTITUCIONAL).
-- Aparecia como bloqueio vermelho sem nenhuma ação real possível: o valor já é
-- conhecido, não há "fonte societária" nova a declarar por caso.
--
-- Backfill idempotente: só toca linhas de pessoa_tipo='contratada' ainda no estado
-- de seed original (aguarda_fonte_societaria, sem fonte, sem data) — nunca sobrescreve
-- uma linha que a Proprietária ou a equipe já tenha editado manualmente.
-- representante_legal não tem correspondente em PERFIL_INSTITUCIONAL hoje e
-- permanece genuinamente pendente — nenhum valor é inventado para ele.
update public.checklist_cadastral
set status = 'verificado',
    fonte = 'fonte_societaria',
    data_verificacao = current_date
where pessoa_tipo = 'contratada'
  and status = 'aguarda_fonte_societaria'
  and fonte is null
  and data_verificacao is null
  and campo in ('razao_social', 'cnpj', 'endereco', 'email');
