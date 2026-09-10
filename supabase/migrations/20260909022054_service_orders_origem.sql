-- Corte B (CA-CONSOLIDAÇÃO-3-REDUNDÂNCIAS-CRÍTICAS, 09/09/2026)
-- Rastreia a origem de cada versão de OS emitida pelo escritor único
-- (emitirOuRecuperarOS), sem criar motor novo.
alter table public.service_orders
  add column if not exists origem text;

comment on column public.service_orders.origem is
  'Como esta versão da OS foi criada/atualizada: planejador_proposta_condicao | manual | reabertura_ou_ajuste. Não cria motor novo — só rastreia a origem do mesmo escritor único (emitirOuRecuperarOS).';
