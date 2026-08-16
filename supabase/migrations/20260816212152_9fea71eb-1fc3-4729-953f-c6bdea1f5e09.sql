ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_chk;
ALTER TABLE public.documents ADD CONSTRAINT documents_status_chk CHECK (
  status IN ('pendente','pendente_de_revisao','em_revisao','aprovado','liberado','recusado','arquivado')
);