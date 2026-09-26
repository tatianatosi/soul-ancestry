-- P21 (26/09/2026) — a Proprietária confirmou: "em relação aos produtos
-- divergentes veja que te pontuei as soluções para eles anteriormente para
-- já estarem ativos com as mudanças acima" — referindo-se à tabela de
-- honorários-base que ela colou no P20 (Itália R$4.700, Portugal R$4.800),
-- que já batia exatamente com as linhas REFERENCIA_RESGATADA existentes.
--
-- Isto resolve as 6 linhas DIVERGENTE de price_catalog_rescued (3 para
-- Itália: 4.500/4.700/4.800; 3 para Portugal: 3.800/4.400/4.800) que
-- bloqueavam exposição/cobrança desde o P15/P16. A referência vencedora
-- (a mesma que ela confirmou) é promovida a HOMOLOGADO_CATALOGO — único
-- estado que pode aparecer em oferta/link/cobrança, por definição do
-- próprio dicionário de estados. As alternativas perdedoras são arquivadas
-- (archived_at/archive_motivo — nunca DELETE), preservando rastreabilidade.

update public.price_catalog_rescued
set price_status = 'HOMOLOGADO_CATALOGO',
    notes = 'Divergência resolvida em 2026-09-26 (P21) por decisão explícita da Proprietária: R$4.700 confirmado como honorário-base de referência para a Itália (as alternativas de R$4.500 e R$4.800 foram arquivadas como não vencedoras).'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and id = '2cbb2828-33d0-430a-8a21-ffff23db40d4'
  and price_status <> 'HOMOLOGADO_CATALOGO';

update public.price_catalog_rescued
set price_status = 'HOMOLOGADO_CATALOGO',
    notes = 'Divergência resolvida em 2026-09-26 (P21) por decisão explícita da Proprietária: R$4.800 confirmado como honorário-base de referência para Portugal (as alternativas de R$3.800 e R$4.400 foram arquivadas como não vencedoras).'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and id = '1f392d2e-626f-4a6e-b8dd-8d423868873a'
  and price_status <> 'HOMOLOGADO_CATALOGO';

update public.price_catalog_rescued
set price_status = 'ARQUIVADO',
    archived_at = coalesce(archived_at, now()),
    archive_motivo = 'Divergência resolvida em 2026-09-26 (P21) por decisão explícita da Proprietária: valor não escolhido como referência-base do país.'
where organization_id = '11f32aae-ea08-47e0-8114-f5d8a900c9a1'
  and id in (
    '7df50c2b-0db6-4098-a6e0-7b53c64b8557', -- IT 4500 (perdedor)
    '75cecaad-757f-423b-9c46-036d8bbe5613', -- IT 4700 (duplicado do vencedor)
    'fc7318d8-a12f-4fc5-8c18-303dd6a97ac4', -- IT 4800 (perdedor)
    '5cb15e2b-c931-4c26-b8e1-c975a41e62e1', -- PT 3800 (perdedor)
    '489485fd-ded1-41bd-8732-61716c9d5e9a', -- PT 4400 (perdedor)
    '41d29af0-b92d-4854-a373-7540dd6093f3'  -- PT 4800 (duplicado do vencedor)
  )
  and archived_at is null;
