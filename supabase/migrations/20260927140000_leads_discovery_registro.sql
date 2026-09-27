-- Mesa Discovery como camada viva do CRM (autorização explícita da
-- Proprietária, 27/09/2026 — "EXECUTE EM MAIN").
--
-- Um único registro estruturado, no próprio lead canônico, para o que antes
-- só existia na memória da tela:
--   * blocos SPIN: nota opcional e dispensa com motivo, por bloco;
--   * decisões sobre sugestões da varredura (aceita / rejeitada / hipótese),
--     com a origem (fonte, autor, trecho, data) — nunca a conversa inteira.
-- Aditiva, sem backfill: lead existente nasce com '{}'.
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS discovery_registro jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.leads.discovery_registro IS
  'Mesa Discovery: {blocos:{situacao|problema|implicacao|necessidade:{nota,dispensado,motivo_dispensa,em,por}}, sugestoes:[{id,campo,valor,decisao,origem:{fonte,autor,trecho,data},em,por}]}. Nunca guarda a conversa inteira. Nunca lido pelo App.';
