-- PROPOSTA NÃO APLICADA — exige autorização específica da Proprietária.
-- Banco conferido em 05/11/2026: ccc_write_org permite ALL a qualquer membro.
-- Preserva leitura existente e preparação por admin/operações/comercial/financeiro.
-- Aprovação e alterações de condição já aprovada continuam protegidas pelo
-- trigger existente zz_admin_approval_boundary e contract_pode_aprovar(org).
-- Não altera preços, registros, assinaturas ou as funções globais de papéis.
-- Retira também a permissão DELETE da policy ALL; nenhuma exclusão é executada.

DROP POLICY IF EXISTS ccc_write_org ON public.case_commercial_condition;

CREATE POLICY ccc_insert_preparadores
ON public.case_commercial_condition
FOR INSERT TO authenticated
WITH CHECK (public.contract_pode_preparar(organization_id));

CREATE POLICY ccc_update_preparadores
ON public.case_commercial_condition
FOR UPDATE TO authenticated
USING (public.contract_pode_preparar(organization_id))
WITH CHECK (public.contract_pode_preparar(organization_id));

-- A policy ccc_select_org permanece intacta.
-- Validar após aplicação com sessões reais: leitura/pesquisador sem escrita;
-- preparador pode preparar, não aprovar; admin pode preparar e aprovar.
-- Acesso a outra organização permanece negado.