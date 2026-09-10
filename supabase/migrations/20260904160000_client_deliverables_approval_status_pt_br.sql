-- Decisão da Proprietária (04/09/2026): vocabulário em português sempre
-- prevalece. client_deliverables.approval_status recebia dois conjuntos de
-- strings conflitantes na mesma coluna: inglês
-- (draft/in_review/approved/published/archived, gravado por
-- onboarding-jornada.functions.ts) e português
-- (rascunho/em_revisao/aprovado/publicado/arquivado, gravado por
-- jornada-cliente.functions.ts). Uma entrega publicada por um caminho não
-- era reconhecida como publicada por uma consulta que filtra pelo outro
-- vocabulário — risco de dado invisível entre telas, não só duplicação de
-- manutenção (achado original: docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md).
--
-- O código já foi corrigido para gravar/ler só em português (mesma rodada).
-- Esta migration só traduz as linhas já existentes com valor em inglês —
-- idempotente, não apaga nem funde nenhuma linha.

update public.client_deliverables
set approval_status = case approval_status
  when 'draft' then 'rascunho'
  when 'in_review' then 'em_revisao'
  when 'approved' then 'aprovado'
  when 'published' then 'publicado'
  when 'archived' then 'arquivado'
  else approval_status
end
where approval_status in ('draft', 'in_review', 'approved', 'published', 'archived');

-- O default da coluna também estava em inglês ('draft'); alinhado para que
-- um insert que não informe approval_status explicitamente já nasça em
-- português, em vez de recriar o conflito na próxima linha gravada.
alter table public.client_deliverables alter column approval_status set default 'rascunho';
