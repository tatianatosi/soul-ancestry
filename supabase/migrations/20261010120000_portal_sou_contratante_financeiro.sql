-- Visibilidade por papel no App Cliente (10/10/2026).
--
-- Tarefa da Proprietária: em casos com múltiplos usuários do portal
-- vinculados ao mesmo caso via nucleo_membros (ex.: Ana como titular
-- financeira, pai e irmã como familiares na jornada), faturas e condições
-- comerciais devem ficar visíveis só a quem tem o papel financeiro —
-- vocabulário real já existente em `nucleo_membros.papel_no_caso`
-- ('contratante') e no legado `nucleo_membros.papel`
-- ('contratante_signatario'), ou em `case_members.papel_no_caso`
-- ('contratante'). Nenhum valor novo de CHECK é criado aqui.
--
-- Árvore genealógica, linha do tempo e envio de documento civil individual
-- já são concedidos por pessoa (client_id, via client_portal_case_access e
-- RLS de documents/portal_casos) e não por papel — por isso não precisam de
-- nenhuma função ou policy nova: um familiar com seu próprio
-- client_portal_access ativo no mesmo caso já lê e envia normalmente.
--
-- Mesmo padrão de segurança de portal_membros_do_meu_caso() (03/10/2026):
-- SECURITY DEFINER, privilégio mínimo, porque o titular autenticado no
-- portal não tem SELECT direto em nucleo_membros/case_members (RLS dessas
-- tabelas é is_org_member — só equipe interna).
CREATE OR REPLACE FUNCTION public.portal_sou_contratante_financeiro(p_case_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH meu_caso AS (
    SELECT ca.case_id
      FROM public.client_portal_case_access ca
     WHERE ca.client_portal_access_id = public.portal_meu_acesso()
       AND ca.access_status = 'active'
       AND ca.case_id = p_case_id
  )
  SELECT EXISTS (
    SELECT 1
      FROM public.nucleos_familiares n
      JOIN public.nucleo_membros m ON m.nucleo_id = n.id
     WHERE n.case_id IN (SELECT case_id FROM meu_caso)
       AND n.archived_at IS NULL
       AND m.archived_at IS NULL
       AND m.cliente_id = public.portal_meu_cliente()
       AND (
         m.papel_no_caso = 'contratante'
         OR (m.papel_no_caso IS NULL AND m.papel = 'contratante_signatario')
       )
    UNION
    SELECT 1
      FROM public.case_members cm
     WHERE cm.case_id IN (SELECT case_id FROM meu_caso)
       AND cm.archived_at IS NULL
       AND cm.cliente_id = public.portal_meu_cliente()
       AND cm.papel_no_caso = 'contratante'
  );
$function$;

COMMENT ON FUNCTION public.portal_sou_contratante_financeiro(uuid) IS
  'True quando o titular autenticado no portal tem papel financeiro (contratante) no caso informado, lendo nucleo_membros.papel_no_caso/papel ou case_members.papel_no_caso — nenhum vocabulário novo. Usado para restringir faturas/condições comerciais a quem assina e paga; árvore, linha do tempo e documentos individuais não dependem deste papel e continuam liberados por pessoa.';

REVOKE ALL ON FUNCTION public.portal_sou_contratante_financeiro(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_sou_contratante_financeiro(uuid) TO authenticated;
