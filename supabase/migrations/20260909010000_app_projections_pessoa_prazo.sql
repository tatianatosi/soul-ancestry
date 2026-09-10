-- Fecha o elo pedido em 09/09/2026 (marco jurídico/achado aprovado -> caso ->
-- microentrega -> responsável/prazo -> App Cliente). app_projections já tinha
-- case_id, origem/evidência (source_entity_type/source_entity_id), responsável
-- (created_by/approved_by) e destino (destination); faltavam só pessoa/núcleo
-- e prazo de revisão. Aditivo, nulo, não toca RLS nem apaga dado existente.
alter table public.app_projections
  add column if not exists pessoa_id uuid null references public.research_people(id),
  add column if not exists due_at timestamptz null;

comment on column public.app_projections.pessoa_id is
  'Pessoa/núcleo da microentrega, quando aplicável (ex.: achado ligado a um ascendente específico). Nulo quando a projeção é do caso como um todo.';
comment on column public.app_projections.due_at is
  'Prazo interno de revisão/liberação da microentrega. Nunca exibido ao cliente.';
