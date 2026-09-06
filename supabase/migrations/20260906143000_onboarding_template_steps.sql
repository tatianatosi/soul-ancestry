-- Onboarding como motor parametrizado (seção 7, PROMPT-MOTORES-UNIFICADOS-
-- CRM-VIVO.md): `onboarding_templates` já existia (ONB-PADRAO), mas sem
-- etapas — nada gerava `onboarding_checklist` a partir dele. O checklist de
-- 12 itens do caso da Ana foi criado à parte, sem motor por trás; os outros
-- casos reais da organização não têm nenhum item de onboarding.
--
-- Esta migration torna ONB-PADRAO real: suas etapas são exatamente os 12
-- itens já validados em produção no caso da Ana (nenhum item novo
-- inventado). A partir de agora, `iniciarOnboarding(caseId)` materializa
-- esses itens em `onboarding_checklist` para qualquer caso que ainda não os
-- tenha — reaproveitando a tabela existente, sem criar `onboarding_runs`/
-- `onboarding_actions` paralelos.
--
-- Aditivo: nenhuma tabela apagada, nenhuma linha de onboarding_checklist
-- alterada.

create table if not exists public.onboarding_template_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  onboarding_template_id uuid not null references public.onboarding_templates(id) on delete cascade,
  ordem integer not null,
  item_code text not null,
  label text not null,
  obrigatorio boolean not null default true,
  created_at timestamptz not null default now(),
  unique (onboarding_template_id, ordem)
);

alter table public.onboarding_template_steps enable row level security;

create policy onboarding_template_steps_sel on public.onboarding_template_steps
  for select to authenticated using (is_org_member(organization_id));
create policy onboarding_template_steps_ins on public.onboarding_template_steps
  for insert to authenticated with check (can_write(organization_id));
create policy onboarding_template_steps_upd on public.onboarding_template_steps
  for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

insert into public.onboarding_template_steps (organization_id, onboarding_template_id, ordem, item_code, label, obrigatorio)
select t.organization_id, t.id, s.ordem, s.item_code, s.label, true
from public.onboarding_templates t
cross join (values
  (1, 'contrato_assinado', 'Contrato assinado'),
  (2, 'pagamento_inicial', 'Pagamento inicial confirmado'),
  (3, 'responsavel_principal', 'Responsável principal definido'),
  (4, 'nucleo_familiar', 'Núcleo familiar validado'),
  (5, 'dossie_mae', 'Dossiê-mãe validado'),
  (6, 'ambiente_acesso', 'Ambiente e nível de acesso definidos'),
  (7, 'case_service', 'Case service definido'),
  (8, 'checklist_inicial', 'Checklist inicial criado'),
  (9, 'plano_acao', 'Plano de ação criado'),
  (10, 'grupo_familiar', 'Grupo familiar criado, quando aplicável'),
  (11, 'app_cliente', 'Acesso App Cliente preparado, quando aplicável'),
  (12, 'micro_entrega_d7', 'Primeira micro-entrega planejada até D7')
) as s(ordem, item_code, label)
where t.codigo = 'ONB-PADRAO'
on conflict (onboarding_template_id, ordem) do nothing;
