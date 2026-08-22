UPDATE public.crm_casos
SET titulo = 'Projeto familiar — Ana Luiza',
    codigos_legados = ARRAY(
      SELECT DISTINCT c FROM unnest(
        COALESCE(codigos_legados, ARRAY[]::text[]) || ARRAY['CA-AUT-ANALUIZA-FAM-2026-001']
      ) AS c
    )
WHERE codigo = 'CA-CID-AT-FAM-2026-001';

UPDATE public.case_aliases
SET reason = 'Referência legada resolvida para CA-CID-AT-FAM-2026-001. Decisão da Proprietária Administradora em 2026-08-22: identificador canônico já definido na operação.'
WHERE case_id = 'a11a0000-0000-4000-8000-000000000002';