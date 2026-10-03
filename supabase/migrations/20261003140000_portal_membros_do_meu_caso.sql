-- Compartilhamento de achado entre membros do MESMO processo e família.
--
-- Decisão da Proprietária (03/10/2026), que desbloqueia a ponta do App:
-- "o compartilhamento de achado será compartilhado somente com cada membro
-- que faz parte do mesmo processo e família, e não é necessário leitor pois
-- já temos um anexo no contrato referente a privacidade de dados, como
-- também as premissas estão em https://clubeancestral.com.br/".
--
-- Por que uma função e não uma policy nova ampla: hoje o titular autenticado
-- no portal NÃO consegue listar os membros da própria família —
-- `nucleo_membros` é `is_org_member` (só equipe) e `client_portal_case_access`
-- devolve apenas a própria linha. Sem isto, a tela do App não tem com quem
-- compartilhar. A função segue o padrão que o schema já usa para o portal
-- (`portal_meu_acesso`, `portal_meu_cliente`, `fn_sou_titular_app_projection`):
-- SECURITY DEFINER, escopo fechado, privilégio mínimo.
--
-- Privilégio mínimo, deliberado: devolve só id do cliente, nome e papel no
-- caso. NUNCA CPF, RG, e-mail, telefone, endereço, data de nascimento ou
-- qualquer outro dado civil — nem do próprio titular. O escopo são os casos
-- em que o titular tem acesso ATIVO ao portal, e o próprio titular sai da
-- lista (ninguém compartilha consigo mesmo).

CREATE OR REPLACE FUNCTION public.portal_membros_do_meu_caso()
 RETURNS TABLE (case_id uuid, cliente_id uuid, nome text, papel text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH meus_casos AS (
    SELECT ca.case_id
      FROM public.client_portal_case_access ca
     WHERE ca.client_portal_access_id = public.portal_meu_acesso()
       AND ca.access_status = 'active'
  ),
  -- Duas fontes de membro do caso, como o resto do produto já faz:
  -- `nucleo_membros` (núcleo familiar) e `case_members` (membros do caso).
  -- O nome vem de `clientes`, que é a Pessoa 360 — fonte canônica do nome.
  membros AS (
    SELECT n.case_id, m.cliente_id, m.papel_no_caso AS papel
      FROM public.nucleos_familiares n
      JOIN public.nucleo_membros m ON m.nucleo_id = n.id
     WHERE n.case_id IN (SELECT case_id FROM meus_casos)
       AND n.archived_at IS NULL
       AND m.archived_at IS NULL
       AND m.cliente_id IS NOT NULL
    UNION
    SELECT cm.case_id, cm.cliente_id, cm.papel_no_caso AS papel
      FROM public.case_members cm
     WHERE cm.case_id IN (SELECT case_id FROM meus_casos)
       AND cm.archived_at IS NULL
       AND cm.cliente_id IS NOT NULL
  )
  SELECT DISTINCT
         mb.case_id,
         mb.cliente_id,
         COALESCE(c.nome, '(sem nome)') AS nome,
         mb.papel
    FROM membros mb
    JOIN public.clientes c ON c.id = mb.cliente_id
   WHERE mb.cliente_id <> public.portal_meu_cliente()
     AND c.archived_at IS NULL;
$function$;

COMMENT ON FUNCTION public.portal_membros_do_meu_caso() IS
  'Membros do mesmo processo/familia do titular autenticado, para compartilhamento de achado. Devolve somente cliente_id, nome e papel: nunca dado civil. Decisao da Proprietaria 03/10/2026, coberta pelo anexo de privacidade do contrato.';

REVOKE ALL ON FUNCTION public.portal_membros_do_meu_caso() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_membros_do_meu_caso() TO authenticated;
