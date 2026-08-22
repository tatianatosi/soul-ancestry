ALTER TABLE public.service_orders
  ADD COLUMN IF NOT EXISTS commercial_condition_id uuid REFERENCES public.commercial_conditions(id);

ALTER TABLE public.contract_scope_items
  ADD COLUMN IF NOT EXISTS proposal_id uuid REFERENCES public.proposals(id),
  ADD COLUMN IF NOT EXISTS commercial_condition_id uuid REFERENCES public.commercial_conditions(id),
  ADD COLUMN IF NOT EXISTS service_order_id uuid REFERENCES public.service_orders(id);

CREATE INDEX IF NOT EXISTS idx_service_orders_commercial_condition ON public.service_orders(commercial_condition_id);
CREATE INDEX IF NOT EXISTS idx_csi_proposal ON public.contract_scope_items(proposal_id);
CREATE INDEX IF NOT EXISTS idx_csi_service_order ON public.contract_scope_items(service_order_id);
CREATE INDEX IF NOT EXISTS idx_cc_proposal ON public.commercial_conditions(proposal_id);