insert into public.piloto_bloqueios (organization_id, case_id, chave, descricao, criticidade, status)
select p.organization_id, p.case_id, 'pacote_familiar_sem_sku',
       'Pacote comercial familiar de R$ 9.600 (3 titulares + 1 dependente; 10 mensalidades de R$ 960, operacionalmente 3 assinaturas de R$ 320) sem SKU canônico homologado no catálogo Top 30.',
       'critico', 'aberto'
from public.piloto_bloqueios p
where p.chave = 'reconciliacao_comercial_pendente'
  and not exists (select 1 from public.piloto_bloqueios b where b.chave = 'pacote_familiar_sem_sku' and b.case_id = p.case_id)
limit 1;