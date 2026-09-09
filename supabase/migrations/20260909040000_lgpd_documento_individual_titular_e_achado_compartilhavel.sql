-- Decisão da Proprietária (09/09/2026) — Documentos sensíveis e LGPD.
--
-- Pessoa é única na jornada. Documento é individual por padrão. Achado é
-- compartilhável apenas quando sanitizado e autorizado.
--
-- Causa raiz corrigida: fn_documents_guard atribuía documents.client_id (o
-- "titular") automaticamente ao cliente CONTRATANTE do caso sempre que
-- nenhum era informado. Um documento de um dependente (ex.: certidão de
-- nascimento de um menor) virava, por padrão, visível no portal do
-- contratante — a RLS documents_sel_portal já filtra por
-- client_id = portal_meu_cliente(), mas o valor gravado nunca era o titular
-- real. Documento sensível agora exige titular explícito; nunca mais é
-- inferido. Documento não-sensível (contrato, entrega, interno) mantém o
-- comportamento anterior — não é o caso relatado e não deve regredir.

-- 1. Rastreabilidade adicional exigida pela decisão.
alter table public.documents
  add column if not exists finalidade text;

comment on column public.documents.finalidade is
  'Para que este documento foi recebido/é usado (ex.: "instrução do processo de cidadania"). Registrado pela equipe ao salvar; obrigatório para categoria sensível na aplicação.';

-- 2. fn_documents_guard reescrita.
CREATE OR REPLACE FUNCTION public.fn_documents_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cliente uuid;
  v_portal boolean := false;
  v_sensivel boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Envio de documentos exige usuário autenticado.';
  END IF;

  v_portal := (NEW.origem = 'cliente')
              AND NEW.case_id IS NOT NULL
              AND public.portal_caso_permitido(NEW.case_id)
              AND NEW.client_id IS NOT DISTINCT FROM public.portal_meu_cliente();

  IF NOT v_portal AND NOT public.is_org_member(NEW.organization_id) THEN
    RAISE EXCEPTION 'Documento fora da sua organização.';
  END IF;

  v_sensivel := NEW.categoria IN ('identificacao','certidao','documento_civil','documento_financeiro');

  IF TG_OP = 'INSERT' THEN
    NEW.carregado_por := COALESCE(NEW.carregado_por, auth.uid());
    NEW.carregado_em := COALESCE(NEW.carregado_em, now());

    IF v_portal THEN
      NEW.status := 'pendente_de_revisao';
      NEW.visibilidade := 'interno_restrito';
      NEW.categoria := 'interno';
      NEW.entrega_cliente := false;
      NEW.liberado_em := NULL;
      NEW.liberado_por := NULL;
      NEW.revisado_em := NULL;
      NEW.revisado_por := NULL;
    ELSIF v_sensivel THEN
      -- Pessoa é única na jornada: documento sensível exige titular
      -- explícito — nunca inferido do cliente contratante do caso.
      IF NEW.client_id IS NULL THEN
        RAISE EXCEPTION 'Documento de categoria sensível exige o titular (a pessoa a quem o documento pertence) — selecione a pessoa antes de salvar.';
      END IF;
      -- Documento individual por padrão: sensível nasce sempre restrito,
      -- não é uma opção do formulário. "Guardar restrito, sem uso externo"
      -- é permitido aqui, sem exigir consentimento prévio — consentimento
      -- passa a ser exigido só para SAIR do estado restrito (ver UPDATE).
      NEW.visibilidade := 'interno_restrito';
      IF NEW.status = 'liberado' THEN NEW.status := 'pendente'; END IF;
      NEW.entrega_cliente := false;
    ELSIF NEW.case_id IS NOT NULL AND NEW.client_id IS NULL THEN
      -- Categoria não-sensível (contrato, entrega ao cliente, evidência de
      -- pesquisa, interno): comportamento já existente preservado — cai no
      -- cliente contratante do caso quando ninguém escolheu uma pessoa.
      SELECT cliente_id INTO v_cliente FROM public.crm_casos WHERE id = NEW.case_id;
      NEW.client_id := v_cliente;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NOT public.is_org_member(NEW.organization_id) THEN
      RAISE EXCEPTION 'Apenas a equipe interna pode alterar documentos.';
    END IF;
    IF NEW.storage_path IS DISTINCT FROM OLD.storage_path AND NEW.storage_path IS NOT NULL THEN
      NEW.versao := COALESCE(OLD.versao, 1) + 1;
    END IF;

    -- Sair do estado restrito (liberar ao cliente OU marcar como entrega)
    -- é o único momento em que este guard exige consentimento/base
    -- aplicável para categoria sensível — nunca no recebimento/guarda.
    IF (NEW.status = 'liberado' AND OLD.status IS DISTINCT FROM 'liberado')
       OR (NEW.entrega_cliente = true AND OLD.entrega_cliente IS DISTINCT FROM true) THEN
      IF NEW.status = 'liberado' AND NEW.visibilidade <> 'cliente_quando_liberado' THEN
        RAISE EXCEPTION 'Só documentos com visibilidade "cliente quando liberado" podem ser liberados ao cliente.';
      END IF;
      IF NOT public.is_staff_ativo(NEW.organization_id) THEN
        RAISE EXCEPTION 'Liberação de entrega exige usuário interno ativo.';
      END IF;
      IF NEW.categoria IN ('identificacao','certidao','documento_civil','documento_financeiro')
         AND NOT public.consentimento_ativo(NEW.case_id, NEW.client_id)
         AND NOT public.consentimento_dispensado(NEW.case_id, NEW.client_id) THEN
        RAISE EXCEPTION 'Categoria sensível bloqueada para liberação/entrega: registre consentimento de tratamento de dados ou uma exceção formal aprovada.';
      END IF;
    END IF;

    IF NEW.status = 'liberado' AND OLD.status IS DISTINCT FROM 'liberado' THEN
      NEW.liberado_em := now();
      NEW.liberado_por := auth.uid();
    END IF;
  END IF;

  NEW.liberado_cliente := (NEW.visibilidade = 'cliente_quando_liberado' AND NEW.status = 'liberado');
  RETURN NEW;
END;
$function$;

-- 3. Achado (app_projections) — visibilidade por pessoa, não só por caso.
--    pessoa_id (já existente) identifica o ANCESTRAL pesquisado
--    (research_people); titular_client_id é a pessoa VIVA (clientes) cujo
--    portal pode ver o achado por padrão quando visibility_scope='titular'.
alter table public.app_projections
  add column if not exists titular_client_id uuid references public.clientes(id);

comment on column public.app_projections.titular_client_id is
  'Quando visibility_scope=titular: a pessoa (clientes.id) que vê este achado por padrão. NULL preserva o comportamento anterior (visível a qualquer acesso de portal do caso) — só passa a restringir por pessoa quando preenchido. Compartilhar com outro membro da família exige um registro em app_projection_shares; nunca é automático.';

-- 4. Autorização explícita e granular de compartilhamento de um achado.
create table if not exists public.app_projection_shares (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  projection_id uuid not null references public.app_projections(id),
  compartilhado_com_client_id uuid not null references public.clientes(id),
  escopo text not null default 'achado_sanitizado' check (escopo in ('achado_sanitizado')),
  autorizado_por text not null check (autorizado_por in ('titular','equipe_interna')),
  autorizado_por_user_id uuid,
  autorizado_em timestamptz not null default now(),
  revogado_em timestamptz,
  revogado_por_user_id uuid,
  revogado_motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

comment on table public.app_projection_shares is
  'Compartilhar achado nunca significa compartilhar o documento original, arquivo, imagem, URL, número de registro, dados de terceiros ou acesso ao dossiê individual — só o achado/síntese já sanitizado e aprovado (app_projections.content_sanitized) com UM destinatário específico, por decisão explícita do titular (ou da equipe registrando essa decisão em nome dele).';

create index if not exists idx_app_projection_shares_projection on public.app_projection_shares(projection_id);
create index if not exists idx_app_projection_shares_destinatario on public.app_projection_shares(compartilhado_com_client_id);

alter table public.app_projection_shares enable row level security;

create policy app_projection_shares_staff_sel on public.app_projection_shares
  for select to authenticated using (public.is_org_member(organization_id));
create policy app_projection_shares_staff_ins on public.app_projection_shares
  for insert to authenticated with check (public.can_write(organization_id));
create policy app_projection_shares_staff_upd on public.app_projection_shares
  for update to authenticated using (public.can_write(organization_id)) with check (public.can_write(organization_id));

-- Portal: o titular do achado autoriza (insert) e revoga (update); titular
-- e destinatário podem ver o registro da autorização (nunca o documento
-- original, que não é exposto por nenhuma política de portal).
create policy app_projection_shares_portal_sel on public.app_projection_shares
  for select to authenticated using (
    compartilhado_com_client_id = public.portal_meu_cliente()
    or exists (
      select 1 from public.app_projections p
      where p.id = projection_id and p.titular_client_id = public.portal_meu_cliente()
    )
  );
create policy app_projection_shares_portal_ins on public.app_projection_shares
  for insert to authenticated with check (
    autorizado_por = 'titular'
    and exists (
      select 1 from public.app_projections p
      where p.id = projection_id
        and p.titular_client_id = public.portal_meu_cliente()
        and p.organization_id = organization_id
    )
  );
create policy app_projection_shares_portal_upd on public.app_projection_shares
  for update to authenticated using (
    exists (
      select 1 from public.app_projections p
      where p.id = projection_id and p.titular_client_id = public.portal_meu_cliente()
    )
  ) with check (
    exists (
      select 1 from public.app_projections p
      where p.id = projection_id and p.titular_client_id = public.portal_meu_cliente()
    )
  );

-- 5. app_proj_select_portal passa a respeitar titular_client_id/compartilhamento.
--    visibility_scope='nucleo' continua case-wide por definição (não é o
--    problema relatado); só 'titular' passa a restringir por pessoa, e só
--    quando titular_client_id está preenchido (achados antigos sem essa
--    coluna preenchida mantêm o comportamento de hoje, sem regressão).
drop policy if exists app_proj_select_portal on public.app_projections;
create policy app_proj_select_portal on public.app_projections
  for select to authenticated using (
    destination = 'app'
    and approval_status = 'published'
    and archived_at is null
    and effective_from is not null
    and effective_from <= now()
    and visibility_scope = any (array['titular','nucleo'])
    and portal_caso_permitido(case_id)
    and (
      visibility_scope = 'nucleo'
      or titular_client_id is null
      or titular_client_id = public.portal_meu_cliente()
      or exists (
        select 1 from public.app_projection_shares s
        where s.projection_id = app_projections.id
          and s.compartilhado_com_client_id = public.portal_meu_cliente()
          and s.revogado_em is null
      )
    )
  );
