-- 1. Campos de suspensão
ALTER TABLE public.crm_casos
  ADD COLUMN IF NOT EXISTS suspenso_motivo text,
  ADD COLUMN IF NOT EXISTS suspenso_em timestamptz,
  ADD COLUMN IF NOT EXISTS suspenso_por uuid;

-- 2. Tabela de checks
CREATE TABLE IF NOT EXISTS public.case_activation_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  case_id uuid NOT NULL REFERENCES public.crm_casos(id) ON DELETE CASCADE,
  check_key text NOT NULL,
  label text NOT NULL,
  dominio text NOT NULL DEFAULT 'operacional',
  obrigatorio boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pendente',
  validado_em timestamptz,
  validado_por uuid,
  observacao text,
  origem_validacao text,
  isencao_motivo text,
  isencao_autorizada_por uuid,
  isencao_autorizada_em timestamptz,
  isencao_expira_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT case_activation_checks_status_chk CHECK (status IN ('pendente','validado','isento','nao_aplicavel')),
  CONSTRAINT case_activation_checks_dominio_chk CHECK (dominio IN ('operacional','comercial','contratual','financeiro')),
  CONSTRAINT case_activation_checks_unq UNIQUE (case_id, check_key)
);

GRANT SELECT, INSERT, UPDATE ON public.case_activation_checks TO authenticated;
GRANT ALL ON public.case_activation_checks TO service_role;
ALTER TABLE public.case_activation_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checks_select_org" ON public.case_activation_checks
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "checks_insert_org" ON public.case_activation_checks
  FOR INSERT TO authenticated WITH CHECK (public.can_write(organization_id));
CREATE POLICY "checks_update_org" ON public.case_activation_checks
  FOR UPDATE TO authenticated USING (public.can_write(organization_id)) WITH CHECK (public.can_write(organization_id));

CREATE INDEX IF NOT EXISTS idx_cac_case ON public.case_activation_checks(case_id);

CREATE TRIGGER trg_cac_touch BEFORE UPDATE ON public.case_activation_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cac_audit AFTER INSERT OR UPDATE ON public.case_activation_checks
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit();
CREATE TRIGGER trg_cac_block_delete BEFORE DELETE ON public.case_activation_checks
  FOR EACH ROW EXECUTE FUNCTION public.fn_block_delete();

-- 3. Definições canônicas
CREATE OR REPLACE FUNCTION public.activation_check_definicoes()
RETURNS TABLE(check_key text, label text, dominio text, obrigatorio boolean)
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT * FROM (VALUES
    ('cliente_identificado','Cliente identificado','operacional',true),
    ('consentimento_registrado','Consentimento registrado','operacional',true),
    ('proposta_aprovada_ou_isencao_autorizada','Proposta aprovada ou isenção autorizada','comercial',true),
    ('contrato_assinado_ou_isencao_autorizada','Contrato assinado ou isenção autorizada','contratual',true),
    ('pagamento_confirmado_ou_condicao_financeira_autorizada','Pagamento confirmado ou condição financeira autorizada','financeiro',true),
    ('ordem_de_servico_criada','Ordem de serviço criada','operacional',true),
    ('escopo_definido','Escopo definido','operacional',true),
    ('responsavel_designado','Responsável designado','operacional',true),
    ('primeira_tarefa_criada','Primeira tarefa criada','operacional',true)
  ) AS t(check_key,label,dominio,obrigatorio);
$$;

-- 4. Semear checks
CREATE OR REPLACE FUNCTION public.fn_seed_activation_checks()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  insert into public.case_activation_checks (organization_id, case_id, check_key, label, dominio, obrigatorio)
  select NEW.organization_id, NEW.id, d.check_key, d.label, d.dominio, d.obrigatorio
  from public.activation_check_definicoes() d
  on conflict (case_id, check_key) do nothing;
  return NEW;
end $$;

CREATE TRIGGER trg_seed_activation_checks AFTER INSERT ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_seed_activation_checks();

INSERT INTO public.case_activation_checks (organization_id, case_id, check_key, label, dominio, obrigatorio, status, validado_em, origem_validacao)
SELECT c.organization_id, c.id, d.check_key, d.label, d.dominio, d.obrigatorio,
  CASE WHEN c.ativo THEN 'validado' ELSE 'pendente' END,
  CASE WHEN c.ativo THEN coalesce(c.ativado_em, now()) ELSE NULL END,
  CASE WHEN c.ativo THEN 'migracao_historica' ELSE NULL END
FROM public.crm_casos c CROSS JOIN public.activation_check_definicoes() d
ON CONFLICT (case_id, check_key) DO NOTHING;

-- 5. Pendências
CREATE OR REPLACE FUNCTION public.case_activation_pendencias(_case uuid)
RETURNS TABLE(check_key text, label text, motivo text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT k.check_key, k.label,
    CASE
      WHEN k.status = 'pendente' THEN 'Aguardando validação'
      WHEN k.status = 'isento' AND k.isencao_expira_em is not null AND k.isencao_expira_em < now() THEN 'Isenção expirada'
      ELSE 'Pendente'
    END
  FROM public.case_activation_checks k
  WHERE k.case_id = _case AND k.obrigatorio
    AND (k.status = 'pendente'
      OR (k.status = 'isento' AND k.isencao_expira_em is not null AND k.isencao_expira_em < now()));
$$;

-- 6. Guarda de autorização nos checks
CREATE OR REPLACE FUNCTION public.fn_activation_check_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
declare v_admin boolean; v_papel app_role;
begin
  v_admin := public.has_org_role(NEW.organization_id, 'admin');
  v_papel := public.staff_meu_papel(NEW.organization_id);

  if TG_OP = 'UPDATE' and (NEW.check_key <> OLD.check_key or NEW.case_id <> OLD.case_id) then
    raise exception 'Não é permitido alterar a chave ou o caso de um requisito de ativação.';
  end if;

  if TG_OP = 'UPDATE' and NEW.status is distinct from OLD.status then
    if not v_admin then
      if v_papel is null or v_papel in ('leitura','pesquisador') then
        raise exception 'Seu papel não permite validar requisitos de ativação.';
      end if;
      if NEW.status in ('isento','nao_aplicavel') then
        raise exception 'Apenas admin pode autorizar isenção ou dispensa de requisito.';
      end if;
      if NEW.dominio = 'financeiro' and v_papel <> 'financeiro' then
        raise exception 'Apenas financeiro ou admin pode validar o requisito financeiro.';
      end if;
      if NEW.dominio = 'comercial' and v_papel not in ('comercial','operacoes') then
        raise exception 'Apenas comercial, operações ou admin pode validar o requisito comercial.';
      end if;
      if NEW.dominio in ('operacional','contratual') and v_papel not in ('operacoes','comercial','financeiro') then
        raise exception 'Seu papel não permite validar este requisito.';
      end if;
      if NEW.dominio = 'contratual' and v_papel <> 'operacoes' then
        raise exception 'Apenas operações ou admin pode validar o requisito contratual.';
      end if;
    end if;

    if NEW.status = 'isento' then
      if NEW.isencao_motivo is null or length(trim(NEW.isencao_motivo)) < 10 then
        raise exception 'Isenção exige motivo com no mínimo 10 caracteres.';
      end if;
      NEW.isencao_autorizada_por := auth.uid();
      NEW.isencao_autorizada_em := now();
    else
      NEW.isencao_motivo := null;
      NEW.isencao_autorizada_por := null;
      NEW.isencao_autorizada_em := null;
      NEW.isencao_expira_em := null;
    end if;

    if NEW.status = 'pendente' then
      NEW.validado_em := null;
      NEW.validado_por := null;
      NEW.origem_validacao := null;
    else
      NEW.validado_em := now();
      NEW.validado_por := auth.uid();
      NEW.origem_validacao := coalesce(NEW.origem_validacao, 'validacao_manual');
    end if;
  end if;

  return NEW;
end $$;

CREATE TRIGGER trg_activation_check_guard BEFORE INSERT OR UPDATE ON public.case_activation_checks
  FOR EACH ROW EXECUTE FUNCTION public.fn_activation_check_guard();

-- 7. Trava de ativação por checks + suspensão com motivo
CREATE OR REPLACE FUNCTION public.fn_guard_ativacao()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
declare v_pend text;
begin
  if (NEW.ativo and not coalesce(OLD.ativo,false)) or (NEW.status = 'ativo' and coalesce(OLD.status,'') <> 'ativo') then
    if not (public.has_org_role(NEW.organization_id,'admin') or public.has_org_role(NEW.organization_id,'operacoes')) then
      raise exception 'Somente admin ou operações podem ativar um caso.';
    end if;
    select string_agg(p.label, '; ') into v_pend from public.case_activation_pendencias(NEW.id) p;
    if v_pend is not null then
      raise exception 'Ativação bloqueada. Requisitos pendentes: %', v_pend;
    end if;
    NEW.ativo := true;
    NEW.status := 'ativo';
    NEW.ativado_em := coalesce(NEW.ativado_em, now());
    NEW.ativado_por := coalesce(NEW.ativado_por, auth.uid());
    NEW.data_ativacao := coalesce(NEW.data_ativacao, now());
  end if;

  if TG_OP = 'UPDATE' and NEW.status = 'pausado' and OLD.status <> 'pausado' then
    if NEW.suspenso_motivo is null or length(trim(NEW.suspenso_motivo)) < 10 then
      raise exception 'Suspensão exige motivo com no mínimo 10 caracteres.';
    end if;
    NEW.ativo := false;
    NEW.suspenso_em := now();
    NEW.suspenso_por := auth.uid();
  end if;

  return NEW;
end $$;

CREATE OR REPLACE FUNCTION public.fn_suspensao_tarefa_revisao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if NEW.status = 'pausado' and OLD.status <> 'pausado' then
    insert into public.tarefas (organization_id, caso_id, titulo, descricao, responsavel_id, prioridade, status, prazo, created_by)
    values (NEW.organization_id, NEW.id,
      'Revisão de caso suspenso: ' || NEW.codigo,
      'Motivo da suspensão: ' || coalesce(NEW.suspenso_motivo,''),
      NEW.responsavel_id, 'alta', 'aberta', (current_date + 3), auth.uid());
  end if;
  return NEW;
end $$;

CREATE TRIGGER trg_suspensao_tarefa_revisao AFTER UPDATE ON public.crm_casos
  FOR EACH ROW EXECUTE FUNCTION public.fn_suspensao_tarefa_revisao();