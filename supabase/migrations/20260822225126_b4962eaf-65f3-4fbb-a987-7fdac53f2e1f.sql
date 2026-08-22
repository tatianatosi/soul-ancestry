DO $$
DECLARE
  v_org uuid := '11f32aae-ea08-47e0-8114-f5d8a900c9a1';
  v_uid uuid := '92fa5a0c-a551-4035-8e35-a924fe74f6f0';
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (v_uid, 'Tati Tosi', 'tati@pluggedresearch.com')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, nome = COALESCE(public.profiles.nome, EXCLUDED.nome);

  INSERT INTO public.staff_access (organization_id, auth_user_id, email, full_name, role, status, invited_at, activated_at, reason)
  VALUES (v_org, v_uid, 'tati@pluggedresearch.com', 'Tati Tosi', 'admin', 'active', now(), now(), 'Bootstrap da proprietaria administradora (raiz)')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.organization_members (organization_id, user_id)
  SELECT v_org, v_uid
  WHERE NOT EXISTS (
    SELECT 1 FROM public.organization_members WHERE organization_id = v_org AND user_id = v_uid
  );

  INSERT INTO public.user_roles (organization_id, user_id, role)
  SELECT v_org, v_uid, 'admin'::app_role
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE organization_id = v_org AND user_id = v_uid AND role = 'admin'::app_role
  );

  INSERT INTO public.audit_logs (organization_id, user_id, acao, entidade, entidade_id, valores_posteriores, metadados)
  VALUES (
    v_org, v_uid, 'bootstrap_proprietaria', 'staff_access', v_uid,
    jsonb_build_object('email','tati@pluggedresearch.com','role','admin','status','active'),
    jsonb_build_object('origem','bootstrap_raiz_producao','motivo','Proprietaria sem acesso e sem outro admin disponivel','convite','email de convite/definicao de senha disparado')
  );
END $$;