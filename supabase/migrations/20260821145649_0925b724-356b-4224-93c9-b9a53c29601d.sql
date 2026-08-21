UPDATE public.leads
   SET servico_inicial_aprovado = 'diagnostico_por_etapas'
 WHERE codigo = 'CA-LEAD-2026-0001';

UPDATE public.leads
   SET proxima_acao = 'solicitar_documentos'
 WHERE codigo = 'CA-LEAD-2026-0002';

UPDATE public.nucleos_familiares
   SET responsavel_nome = COALESCE(NULLIF(responsavel_nome, ''), 'Equipe de operações — responsável a confirmar'),
       link_interno = COALESCE(NULLIF(link_interno, ''), 'interno://desk/nucleos/silveira-friedmann-reimer')
 WHERE id = 'a11a0000-0000-4000-8000-0000000000f1';