-- P31 (26/09/2026) — pedido direto da Proprietária: "telefone 55 11 também
-- aplicar se é o WhatsApp ou não". Não existe hoje nenhuma coluna que
-- distinga se o telefone cadastrado é WhatsApp (confirmado por grep em
-- types.ts: só existem whatsapp_configurado de integração e
-- fallback_whatsapp_enviado de cadência — nenhum é "este telefone é
-- WhatsApp?"). Aditiva, nullable, três estados (null = não informado ainda):
-- nunca sobrescreve dado existente, nunca quebra leitor antigo.
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS telefone_whatsapp boolean;

COMMENT ON COLUMN public.clientes.telefone_whatsapp IS
  'Se o telefone cadastrado (clientes.telefone) é WhatsApp. NULL = não informado ainda; nunca inferido automaticamente.';

ALTER TABLE public.case_members
  ADD COLUMN IF NOT EXISTS telefone_whatsapp boolean;

COMMENT ON COLUMN public.case_members.telefone_whatsapp IS
  'Se o telefone deste membro do caso (case_members.telefone) é WhatsApp. NULL = não informado ainda.';
