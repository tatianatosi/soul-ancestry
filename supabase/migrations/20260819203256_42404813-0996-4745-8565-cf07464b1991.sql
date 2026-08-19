
-- ============ 1. CATÁLOGO DE PRODUTOS ============
create table if not exists public.product_catalog (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  nome_comercial text not null,
  jornada_fase text,
  tipo_oferta text not null default 'produto_pai',
  prioridade_catalogo text not null default 'TOP_30',
  status_homologacao text not null default 'homologado',
  elegivel_para_proposta boolean not null default true,
  preco_comercial_vigente numeric(14,2),
  preco_historico_legado numeric(14,2),
  condicao_comercial_padrao text,
  escopo_aprovado text,
  requer_fechamento_humano boolean not null default true,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  unique (organization_id, code)
);
grant select, insert, update on public.product_catalog to authenticated;
grant all on public.product_catalog to service_role;
alter table public.product_catalog enable row level security;
create policy product_catalog_sel on public.product_catalog for select to authenticated using (is_org_member(organization_id));
create policy product_catalog_ins on public.product_catalog for insert to authenticated with check (can_write(organization_id));
create policy product_catalog_upd on public.product_catalog for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 2. TRILHAS DE CIDADANIA ============
create table if not exists public.citizenship_tracks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  pais text not null,
  nacionalidade text,
  via_preliminar text,
  marco_juridico_referencia text,
  status_via text not null default 'em_confirmacao',
  requisitos_entrada text,
  documentos_prioritarios text,
  riscos_internos text,
  idioma_entrevista text,
  autorizacao_pesquisa_necessaria boolean not null default true,
  revisao_humana_juridica text not null default 'obrigatoria',
  status_atualizacao text not null default 'vigente',
  ultima_revisao_em timestamptz,
  responsavel_revisao text,
  texto_sanitizado_cliente text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  unique (organization_id, code)
);
grant select, insert, update on public.citizenship_tracks to authenticated;
grant all on public.citizenship_tracks to service_role;
alter table public.citizenship_tracks enable row level security;
create policy citizenship_tracks_sel on public.citizenship_tracks for select to authenticated using (is_org_member(organization_id));
create policy citizenship_tracks_ins on public.citizenship_tracks for insert to authenticated with check (can_write(organization_id));
create policy citizenship_tracks_upd on public.citizenship_tracks for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 3. CASE SERVICES ============
create table if not exists public.case_services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references public.crm_casos(id),
  product_catalog_id uuid references public.product_catalog(id),
  citizenship_track_id uuid references public.citizenship_tracks(id),
  escopo_aprovado text,
  composicao_familiar text,
  preco_acordado numeric(14,2),
  preco_somente_leitura boolean not null default true,
  condicao_comercial_aprovada text,
  status text not null default 'draft',
  contrato_referencia_interna text,
  responsavel_user_id uuid,
  observacao_interna text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);
grant select, insert, update on public.case_services to authenticated;
grant all on public.case_services to service_role;
alter table public.case_services enable row level security;
create policy case_services_sel on public.case_services for select to authenticated using (is_org_member(organization_id));
create policy case_services_ins on public.case_services for insert to authenticated with check (can_write(organization_id));
create policy case_services_upd on public.case_services for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 4. TAXONOMIA DE ETIQUETAS ============
create table if not exists public.label_taxonomy (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  name text not null,
  category text not null,
  scope text not null default 'case',
  description text,
  active boolean not null default true,
  meta_agent_equivalent text,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  unique (organization_id, code)
);
grant select, insert, update on public.label_taxonomy to authenticated;
grant all on public.label_taxonomy to service_role;
alter table public.label_taxonomy enable row level security;
create policy label_taxonomy_sel on public.label_taxonomy for select to authenticated using (is_org_member(organization_id));
create policy label_taxonomy_ins on public.label_taxonomy for insert to authenticated with check (can_write(organization_id));
create policy label_taxonomy_upd on public.label_taxonomy for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

create table if not exists public.entity_labels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  label_id uuid not null references public.label_taxonomy(id),
  entity_type text not null,
  entity_id uuid not null,
  applied_at timestamptz not null default now(),
  applied_by uuid,
  source text not null default 'desk_manual',
  removed_at timestamptz,
  removed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists entity_labels_entity_idx on public.entity_labels (entity_type, entity_id);
grant select, insert, update on public.entity_labels to authenticated;
grant all on public.entity_labels to service_role;
alter table public.entity_labels enable row level security;
create policy entity_labels_sel on public.entity_labels for select to authenticated using (is_org_member(organization_id));
create policy entity_labels_ins on public.entity_labels for insert to authenticated with check (can_write(organization_id));
create policy entity_labels_upd on public.entity_labels for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 5. FILA DE COMUNICAÇÃO (RASCUNHOS) ============
create table if not exists public.communication_queue (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid references public.crm_casos(id),
  acao_codigo text,
  target_audience text not null default 'interno_tatiana',
  visibility text not null default 'internal_only',
  suggested_channel text not null default 'desk_only',
  assunto text,
  corpo_rascunho text,
  status text not null default 'draft_created',
  requires_human_approval boolean not null default true,
  approved_by uuid,
  approved_at timestamptz,
  sent_at timestamptz,
  observacao_interna text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);
grant select, insert, update on public.communication_queue to authenticated;
grant all on public.communication_queue to service_role;
alter table public.communication_queue enable row level security;
create policy communication_queue_sel on public.communication_queue for select to authenticated using (is_org_member(organization_id));
create policy communication_queue_ins on public.communication_queue for insert to authenticated with check (can_write(organization_id));
create policy communication_queue_upd on public.communication_queue for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 6. ALERTAS DO CASO ============
create table if not exists public.case_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references public.crm_casos(id),
  tipo text not null,
  criticidade text not null default 'atencao',
  titulo text not null,
  detalhe text,
  status text not null default 'pending',
  due_at timestamptz,
  triggered_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.case_alerts to authenticated;
grant all on public.case_alerts to service_role;
alter table public.case_alerts enable row level security;
create policy case_alerts_sel on public.case_alerts for select to authenticated using (is_org_member(organization_id));
create policy case_alerts_ins on public.case_alerts for insert to authenticated with check (can_write(organization_id));
create policy case_alerts_upd on public.case_alerts for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 7. CHECKLIST DE ONBOARDING ============
create table if not exists public.onboarding_checklist (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references public.crm_casos(id),
  item_code text not null,
  label text not null,
  obrigatorio boolean not null default true,
  status text not null default 'pendente',
  observacao text,
  concluido_em timestamptz,
  concluido_por uuid,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (case_id, item_code)
);
grant select, insert, update on public.onboarding_checklist to authenticated;
grant all on public.onboarding_checklist to service_role;
alter table public.onboarding_checklist enable row level security;
create policy onboarding_checklist_sel on public.onboarding_checklist for select to authenticated using (is_org_member(organization_id));
create policy onboarding_checklist_ins on public.onboarding_checklist for insert to authenticated with check (can_write(organization_id));
create policy onboarding_checklist_upd on public.onboarding_checklist for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 8. ENTREGAS AO CLIENTE ============
create table if not exists public.client_deliverables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  case_id uuid not null references public.crm_casos(id),
  family_id uuid references public.nucleos_familiares(id),
  deliverable_type text not null,
  journey_phase text,
  title_client text not null,
  summary_approved text,
  approval_status text not null default 'draft',
  priority text not null default 'normal',
  deep_link text,
  notification_channel text not null default 'desk_only',
  available_at timestamptz,
  viewed_at timestamptz,
  internal_reference text,
  responsible_user_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);
grant select, insert, update on public.client_deliverables to authenticated;
grant all on public.client_deliverables to service_role;
alter table public.client_deliverables enable row level security;
create policy client_deliverables_sel on public.client_deliverables for select to authenticated using (is_org_member(organization_id));
create policy client_deliverables_ins on public.client_deliverables for insert to authenticated with check (can_write(organization_id));
create policy client_deliverables_upd on public.client_deliverables for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ 9. TRIGGERS PADRÃO (updated_at + bloqueio de exclusão) ============
do $$
declare t text;
begin
  foreach t in array array['product_catalog','citizenship_tracks','case_services','label_taxonomy','entity_labels','communication_queue','case_alerts','onboarding_checklist','client_deliverables'] loop
    execute format('create trigger t_upd_%1$s before update on public.%1$s for each row execute function public.update_updated_at_column()', t);
    execute format('create trigger no_delete_%1$s before delete on public.%1$s for each row execute function public.fn_block_delete()', t);
  end loop;
end $$;

-- ============ 10. NOVOS CAMPOS OPERACIONAIS ============
alter table public.crm_casos
  add column if not exists proposta_id_origem text,
  add column if not exists marcos_gerais_da_proposta text,
  add column if not exists sinal_aderencia_preliminar text,
  add column if not exists confianca_triagem text,
  add column if not exists risco_observacao_interna text,
  add column if not exists prazo_proxima_acao date,
  add column if not exists target_audience text not null default 'interno_tatiana',
  add column if not exists visibility text not null default 'internal_only',
  add column if not exists suggested_channel text not null default 'desk_only',
  add column if not exists requires_human_approval boolean not null default true,
  add column if not exists communication_status text not null default 'not_applicable',
  add column if not exists alert_status text not null default 'pending',
  add column if not exists alert_triggered_at timestamptz,
  add column if not exists communication_queue_id uuid,
  add column if not exists case_service_id uuid,
  add column if not exists dossie_mae_referencia text,
  add column if not exists ultimo_touchpoint_em timestamptz;

alter table public.case_members
  add column if not exists contratante boolean not null default false,
  add column if not exists titular boolean not null default false,
  add column if not exists dependente boolean not null default false,
  add column if not exists representa_pessoa_id uuid,
  add column if not exists fonte_origem_dado text,
  add column if not exists data_verificacao_dado date;

alter table public.nucleos_familiares
  add column if not exists dossie_mae text,
  add column if not exists contratante_nome text,
  add column if not exists ambiente text,
  add column if not exists nivel_acesso text;

-- ============ 11. SEEDS: TRILHAS ============
insert into public.citizenship_tracks (organization_id, code, pais, nacionalidade, via_preliminar, marco_juridico_referencia, status_via, revisao_humana_juridica, idioma_entrevista, texto_sanitizado_cliente)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, x.code, x.pais, x.nac, x.via, x.marco, x.stv, 'obrigatoria', x.idioma, x.cliente
from (values
 ('TRILHA_ITALIA','Itália','italiana','Administrativa ou judicial — em confirmação','Lei 91/1992','em_confirmacao','Italiano','Estudo de linha familiar italiana.'),
 ('TRILHA_PORTUGAL','Portugal','portuguesa','Administrativa — em confirmação','Lei da Nacionalidade portuguesa','em_confirmacao','Português','Estudo de linha familiar portuguesa.'),
 ('TRILHA_ESPANHA','Espanha','espanhola','Administrativa — em confirmação','Normativa espanhola vigente','em_confirmacao','Espanhol','Estudo de linha familiar espanhola.'),
 ('TRILHA_ALEMANHA','Alemanha','alemã','Reparação histórica — em confirmação','StAG §116/§15','em_confirmacao','Alemão','Estudo de linha familiar alemã.'),
 ('TRILHA_AUSTRIA','Áustria','austríaca','Reparação histórica — em confirmação','StbG §58c','em_confirmacao','Alemão','Estudo de linha familiar austríaca.'),
 ('TRILHA_POLONIA','Polônia','polonesa','Confirmação de cidadania — em confirmação','Lei polonesa de cidadania','em_confirmacao','Polonês','Estudo de linha familiar polonesa.'),
 ('TRILHA_HUNGRIA','Hungria','húngara','Administrativa — em confirmação','Lei húngara de nacionalidade','em_confirmacao','Húngaro','Estudo de linha familiar húngara.'),
 ('TRILHA_LUXEMBURGO','Luxemburgo','luxemburguesa','Administrativa — em confirmação','Lei luxemburguesa de nacionalidade','em_confirmacao','Francês','Estudo de linha familiar luxemburguesa.'),
 ('TRILHA_CROACIA','Croácia','croata','Administrativa — em confirmação','Lei croata de cidadania','em_confirmacao','Croata','Estudo de linha familiar croata.'),
 ('TRILHA_ROMENIA','Romênia','romena','Administrativa — em confirmação','Lei 21/1991','em_confirmacao','Romeno','Estudo de linha familiar romena.'),
 ('TRILHA_BRASIL_NATURALIZACAO','Brasil','brasileira','Naturalização/residência — em confirmação','Lei 13.445/2017','em_confirmacao','Português','Estudo de residência/naturalização no Brasil.'),
 ('TRILHA_MULTIPAIS','Multipaís',null,'Via a confirmar','A definir por linha','em_confirmacao','A definir','Estudo familiar com mais de uma linha possível.'),
 ('TRILHA_EM_INVESTIGACAO','Em investigação',null,'Via a confirmar','A definir','em_investigacao','A definir','Estudo em fase de investigação inicial.')
) as x(code,pais,nac,via,marco,stv,idioma,cliente)
on conflict (organization_id, code) do nothing;

-- ============ 12. SEEDS: PRODUTO-PAI ============
insert into public.product_catalog (organization_id, code, nome_comercial, jornada_fase, tipo_oferta, prioridade_catalogo, status_homologacao, preco_comercial_vigente, condicao_comercial_padrao, escopo_aprovado, requer_fechamento_humano)
values
 ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','PROD-DIAG-FAM-MULTI','Diagnóstico Familiar Multipaís','diagnostico','produto_pai','TOP_10','homologado',9600.00,'Definida caso a caso, com fechamento humano','Estudo genealógico familiar com análise de linhas e vias preliminares, sem garantia de resultado.',true),
 ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','PROD-DIAG-INDIVIDUAL','Diagnóstico Individual','diagnostico','produto_pai','TOP_10','homologado',null,'Definida caso a caso','Estudo genealógico individual.',true),
 ('11f32aae-ea08-47e0-8114-f5d8a900c9a1','PROD-COMPL-DOC','Complemento — Obtenção documental','execucao','complemento','TOP_30','homologado',null,'Sob demanda','Complemento de obtenção de documentos.',true)
on conflict (organization_id, code) do nothing;

-- ============ 13. SEEDS: TAXONOMIA DE ETIQUETAS ============
insert into public.label_taxonomy (organization_id, code, name, category, scope, meta_agent_equivalent, sort_order)
select '11f32aae-ea08-47e0-8114-f5d8a900c9a1'::uuid, x.code, x.name, x.cat, x.scope, x.meta, (row_number() over ())::int
from (values
 ('ORIGEM_SITE_DIAGNOSTICO_RAPIDO','Origem — Site diagnóstico rápido','A. Origem','contact','Site rápido'),
 ('ORIGEM_SITE_DIAGNOSTICO_PROFUNDO','Origem — Site diagnóstico profundo','A. Origem','contact','Site profundo'),
 ('ORIGEM_WHATSAPP_ORGANICO','Origem — WhatsApp orgânico','A. Origem','contact','WhatsApp orgânico'),
 ('ORIGEM_INSTAGRAM','Origem — Instagram','A. Origem','contact','Instagram'),
 ('ORIGEM_INDICACAO','Origem — Indicação','A. Origem','contact','Indicação'),
 ('ORIGEM_GOOGLE_ORGANICO','Origem — Google orgânico','A. Origem','contact','Google orgânico'),
 ('ORIGEM_GOOGLE_ADS','Origem — Google Ads','A. Origem','contact','Google Ads'),
 ('ORIGEM_EVENTO','Origem — Evento','A. Origem','contact','Evento'),
 ('ORIGEM_PARCEIRO','Origem — Parceiro','A. Origem','contact','Parceiro'),
 ('ORIGEM_BASE_LEGADA','Origem — Base legada','A. Origem','contact',null),
 ('ORIGEM_OUTRO','Origem — Outro','A. Origem','contact',null),
 ('CONTATO_NOVO','Contato novo','B. Contato e call','contact','Novo contato'),
 ('CONTATO_RESPONDEU','Contato respondeu','B. Contato e call','contact','Respondeu'),
 ('CONTATO_SEM_RESPOSTA','Contato sem resposta','B. Contato e call','contact','Sem resposta'),
 ('CALL_AGENDADA','Call agendada','B. Contato e call','opportunity','Call agendada'),
 ('CALL_CONFIRMADA','Call confirmada','B. Contato e call','opportunity','Call confirmada'),
 ('CALL_REALIZADA','Call realizada','B. Contato e call','opportunity','Call realizada'),
 ('CALL_REMARCADA','Call remarcada','B. Contato e call','opportunity','Call remarcada'),
 ('CALL_NO_SHOW','Call no-show','B. Contato e call','opportunity','No-show'),
 ('CALL_CANCELADA','Call cancelada','B. Contato e call','opportunity','Cancelada'),
 ('DISCOVERY_PENDENTE','Discovery pendente','C. Descoberta e qualificação','opportunity',null),
 ('DISCOVERY_REALIZADA','Discovery realizada','C. Descoberta e qualificação','opportunity',null),
 ('SPIN_EM_ANDAMENTO','SPIN em andamento','C. Descoberta e qualificação','opportunity',null),
 ('SPIN_CONCLUIDO','SPIN concluído','C. Descoberta e qualificação','opportunity',null),
 ('DOCUMENTOS_INICIAIS_PENDENTES','Documentos iniciais pendentes','C. Descoberta e qualificação','opportunity',null),
 ('DOCUMENTOS_INICIAIS_RECEBIDOS','Documentos iniciais recebidos','C. Descoberta e qualificação','opportunity',null),
 ('TRIAGEM_FORTE','Triagem — forte','C. Descoberta e qualificação','opportunity',null),
 ('TRIAGEM_PROVAVEL','Triagem — provável','C. Descoberta e qualificação','opportunity',null),
 ('TRIAGEM_POSSIVEL_COM_PESQUISA','Triagem — possível com pesquisa','C. Descoberta e qualificação','opportunity',null),
 ('TRIAGEM_INCONCLUSIVA','Triagem — inconclusiva','C. Descoberta e qualificação','opportunity',null),
 ('TRIAGEM_SEM_ADERENCIA','Triagem — sem aderência','C. Descoberta e qualificação','opportunity',null),
 ('REVISAO_JURIDICA_PENDENTE','Revisão jurídica pendente','C. Descoberta e qualificação','case',null),
 ('PROPOSTA_EM_PREPARACAO','Proposta em preparação','D. Comercial','opportunity','Proposta em preparação'),
 ('PROPOSTA_ENVIADA','Proposta enviada','D. Comercial','opportunity','Proposta enviada'),
 ('NEGOCIACAO','Negociação','D. Comercial','opportunity','Negociação'),
 ('ACEITE_VERBAL','Aceite verbal','D. Comercial','opportunity','Aceite verbal'),
 ('CONFIRMACAO_FORMAL_PENDENTE','Confirmação formal pendente','D. Comercial','opportunity','Confirmação pendente'),
 ('CONFIRMACAO_FORMAL_RECEBIDA','Confirmação formal recebida','D. Comercial','opportunity','Confirmação recebida'),
 ('FOLLOW_UP_PENDENTE','Follow-up pendente','D. Comercial','opportunity','Follow-up'),
 ('FOLLOW_UP_VENCIDO','Follow-up vencido','D. Comercial','opportunity','Follow-up vencido'),
 ('PERDIDO_PRECO','Perdido — preço','D. Comercial','opportunity','Perdido preço'),
 ('PERDIDO_ELEGIBILIDADE','Perdido — elegibilidade','D. Comercial','opportunity','Perdido elegibilidade'),
 ('PERDIDO_DOCUMENTACAO','Perdido — documentação','D. Comercial','opportunity','Perdido documentação'),
 ('PERDIDO_TIMING','Perdido — timing','D. Comercial','opportunity','Perdido timing'),
 ('PERDIDO_SEM_RETORNO','Perdido — sem retorno','D. Comercial','opportunity','Perdido sem retorno'),
 ('NUTRICAO','Nutrição','D. Comercial','opportunity','Nutrição'),
 ('CADASTRO_PENDENTE','Cadastro pendente','E. Formalização e financeiro','case',null),
 ('NUCLEO_FAMILIAR_PENDENTE','Núcleo familiar pendente','E. Formalização e financeiro','family',null),
 ('REPRESENTACAO_MENOR_PENDENTE','Representação de menor pendente','E. Formalização e financeiro','family',null),
 ('ESCOPO_PENDENTE','Escopo pendente','E. Formalização e financeiro','case',null),
 ('CASE_SERVICE_PENDENTE','Case service pendente','E. Formalização e financeiro','case',null),
 ('CONTRATO_EM_PREPARACAO','Contrato em preparação','E. Formalização e financeiro','case',null),
 ('CONTRATO_ENVIADO','Contrato enviado','E. Formalização e financeiro','case',null),
 ('CONTRATO_ASSINADO','Contrato assinado','E. Formalização e financeiro','case',null),
 ('PAGAMENTO_INICIAL_PENDENTE','Pagamento inicial pendente','E. Formalização e financeiro','case',null),
 ('PAGAMENTO_INICIAL_CONFIRMADO','Pagamento inicial confirmado','E. Formalização e financeiro','case',null),
 ('DESPESA_TERCEIRO_PENDENTE','Despesa de terceiro pendente','E. Formalização e financeiro','case',null),
 ('DESPESA_TERCEIRO_APROVADA','Despesa de terceiro aprovada','E. Formalização e financeiro','case',null),
 ('FORMALIZACAO_BLOQUEADA','Formalização bloqueada','E. Formalização e financeiro','case',null),
 ('ONBOARDING_PENDENTE','Onboarding pendente','F. Onboarding e caso','case',null),
 ('ONBOARDING_INICIADO','Onboarding iniciado','F. Onboarding e caso','case',null),
 ('DOSSIE_MAE_PENDENTE','Dossiê-mãe pendente','F. Onboarding e caso','family',null),
 ('DOSSIE_EM_PREPARACAO','Dossiê em preparação','F. Onboarding e caso','family',null),
 ('DOSSIE_ATIVO','Dossiê ativo','F. Onboarding e caso','family',null),
 ('GRUPO_FAMILIAR_PENDENTE','Grupo familiar pendente','F. Onboarding e caso','family',null),
 ('CHECKLIST_INICIAL_PENDENTE','Checklist inicial pendente','F. Onboarding e caso','case',null),
 ('PLANO_DE_ACAO_PENDENTE','Plano de ação pendente','F. Onboarding e caso','case',null),
 ('CASO_ATIVO','Caso ativo','F. Onboarding e caso','case',null),
 ('CASO_AGUARDANDO_CLIENTE','Caso aguardando cliente','F. Onboarding e caso','case','Aguardando cliente'),
 ('CASO_AGUARDANDO_TERCEIRO','Caso aguardando terceiro','F. Onboarding e caso','case',null),
 ('CASO_BLOQUEADO','Caso bloqueado','F. Onboarding e caso','case',null),
 ('CASO_CONCLUIDO','Caso concluído','F. Onboarding e caso','case',null),
 ('PESQUISA_NAO_AUTORIZADA','Pesquisa não autorizada','G. Pesquisa e documentação','case',null),
 ('AUTORIZACAO_PESQUISA_PENDENTE','Autorização de pesquisa pendente','G. Pesquisa e documentação','case',null),
 ('PESQUISA_AUTORIZADA','Pesquisa autorizada','G. Pesquisa e documentação','case',null),
 ('DOCUMENTO_SOLICITADO','Documento solicitado','G. Pesquisa e documentação','case',null),
 ('DOCUMENTO_RECEBIDO','Documento recebido','G. Pesquisa e documentação','case',null),
 ('DOCUMENTO_LOCALIZADO','Documento localizado','G. Pesquisa e documentação','case',null),
 ('DOCUMENTO_EM_REVISAO','Documento em revisão','G. Pesquisa e documentação','case',null),
 ('DOCUMENTO_VALIDADO','Documento validado','G. Pesquisa e documentação','case',null),
 ('PENDENCIA_DOCUMENTAL','Pendência documental','G. Pesquisa e documentação','case',null),
 ('RETIFICACAO_NECESSARIA','Retificação necessária','G. Pesquisa e documentação','case',null),
 ('TRADUCAO_APOSTILA_NECESSARIA','Tradução/apostila necessária','G. Pesquisa e documentação','case',null),
 ('ACHADO_HISTORICO','Achado histórico','G. Pesquisa e documentação','case',null),
 ('PRIMEIRA_MICRO_ENTREGA_PENDENTE','Primeira micro-entrega pendente','H. Jornada e comunicação','case',null),
 ('MICRO_ENTREGA_EM_REVISAO','Micro-entrega em revisão','H. Jornada e comunicação','case',null),
 ('MICRO_ENTREGA_PUBLICADA','Micro-entrega publicada','H. Jornada e comunicação','case',null),
 ('ATUALIZACAO_CLIENTE_PENDENTE','Atualização ao cliente pendente','H. Jornada e comunicação','case','Atualização pendente'),
 ('TOUCHPOINT_D10','Touchpoint D10','H. Jornada e comunicação','case',null),
 ('TOUCHPOINT_CRITICO_D14','Touchpoint crítico D14','H. Jornada e comunicação','case',null),
 ('APP_NAO_ATIVADO','App não ativado','H. Jornada e comunicação','case',null),
 ('APP_ATIVADO','App ativado','H. Jornada e comunicação','case',null),
 ('WHATSAPP_RASCUNHO_PENDENTE','WhatsApp — rascunho pendente','H. Jornada e comunicação','interaction','Rascunho pendente'),
 ('WHATSAPP_AGUARDANDO_APROVACAO','WhatsApp — aguardando aprovação','H. Jornada e comunicação','interaction','Aguardando aprovação'),
 ('WHATSAPP_ENVIADO','WhatsApp — enviado','H. Jornada e comunicação','interaction','Enviado'),
 ('TRILHA_ITALIA','Trilha — Itália','I. Trilhas','case','Itália'),
 ('TRILHA_PORTUGAL','Trilha — Portugal','I. Trilhas','case','Portugal'),
 ('TRILHA_ESPANHA','Trilha — Espanha','I. Trilhas','case','Espanha'),
 ('TRILHA_ALEMANHA','Trilha — Alemanha','I. Trilhas','case','Alemanha'),
 ('TRILHA_AUSTRIA','Trilha — Áustria','I. Trilhas','case','Áustria'),
 ('TRILHA_POLONIA','Trilha — Polônia','I. Trilhas','case','Polônia'),
 ('TRILHA_HUNGRIA','Trilha — Hungria','I. Trilhas','case','Hungria'),
 ('TRILHA_LUXEMBURGO','Trilha — Luxemburgo','I. Trilhas','case','Luxemburgo'),
 ('TRILHA_CROACIA','Trilha — Croácia','I. Trilhas','case','Croácia'),
 ('TRILHA_ROMENIA','Trilha — Romênia','I. Trilhas','case','Romênia'),
 ('TRILHA_BRASIL_NATURALIZACAO','Trilha — Brasil naturalização','I. Trilhas','case','Brasil'),
 ('TRILHA_MULTIPAIS','Trilha — Multipaís','I. Trilhas','case','Multipaís'),
 ('TRILHA_EM_INVESTIGACAO','Trilha — em investigação','I. Trilhas','case',null),
 ('OUTRO_JUSTIFICAR','Outro — justificar','Z. Exceção','case',null)
) as x(code,name,cat,scope,meta)
on conflict (organization_id, code) do nothing;

-- ============ 14. CASO ANA LUIZA ============
update public.crm_casos set
  citizenship_track_id = (select id::text from public.citizenship_tracks where organization_id = crm_casos.organization_id and code = 'TRILHA_AUSTRIA'),
  pais_linha_prioritaria = 'austria',
  via_juridica_preliminar = 'reparacao_historica',
  status_via = 'em_confirmacao',
  revisao_humana_juridica = 'obrigatoria',
  alias_historico = 'CA-AUT-ANALUIZA-FAM-2026-001',
  responsavel_principal = 'Tatiana Melani Tosi',
  cargo_responsavel_principal = 'Genealogista profissional e pesquisadora',
  supervisora_do_caso = 'Tatiana Melani Tosi',
  eixo_comercial = 'confirmacao_formal_recebida',
  eixo_formalizacao = 'formalizacao_em_preparacao',
  status_caso_derivado = 'pre_onboarding_bloqueado',
  data_confirmacao_formal_proposta = date '2026-08-14',
  data_entrada_caso = date '2026-08-14',
  condicao_comercial_interna_pendente = true,
  proposta_referencia_interna = 'Proposta interna — R$ 9.600 (referência, sem cobrança)',
  proxima_acao_codigo = 'solicitar_dados_cadastrais',
  proxima_acao = 'Solicitar dados cadastrais',
  prazo_proxima_acao = date '2026-08-22',
  target_audience = 'cliente_contratante',
  visibility = 'client_sanitized',
  suggested_channel = 'whatsapp',
  requires_human_approval = true,
  communication_status = 'awaiting_approval',
  alert_status = 'alerted',
  alert_triggered_at = now(),
  sinal_aderencia_preliminar = 'em_investigacao',
  confianca_triagem = 'media',
  status_radar = 'nao_calculado',
  riscos_identificados = array['escopo_contrato_pendente','representacao_menor','dados_cadastrais_pendentes','revisao_juridica_pendente','em_investigacao'],
  dossie_mae_referencia = 'Dossiê-mãe Silveira / Friedmann-Reimer (em preparação)'
where codigo = 'CA-CID-AT-FAM-2026-001';

-- case service (rascunho, sem contrato/cobrança)
insert into public.case_services (organization_id, case_id, product_catalog_id, citizenship_track_id, escopo_aprovado, composicao_familiar, preco_acordado, condicao_comercial_aprovada, status, responsavel_user_id, observacao_interna)
select c.organization_id, c.id,
  (select id from public.product_catalog p where p.organization_id = c.organization_id and p.code = 'PROD-DIAG-FAM-MULTI'),
  nullif(c.citizenship_track_id,'')::uuid,
  'Diagnóstico familiar multipaís com linha prioritária Áustria (§58c) — escopo pendente de formalização.',
  'Contratante/titular Ana Luiza; titulares Adair e Alice; dependente menor Felipe (representação pendente).',
  9600.00,
  'Pendente de formalização — referência interna de proposta, sem cobrança.',
  'draft', null,
  'Formalização em preparação. Nenhuma cobrança, contrato ou pesquisa externa autorizada.'
from public.crm_casos c where c.codigo = 'CA-CID-AT-FAM-2026-001'
and not exists (select 1 from public.case_services s where s.case_id = c.id);

update public.crm_casos set case_service_id = (select s.id from public.case_services s where s.case_id = crm_casos.id limit 1)
where codigo = 'CA-CID-AT-FAM-2026-001';

-- etiquetas obrigatórias
insert into public.entity_labels (organization_id, label_id, entity_type, entity_id, source)
select c.organization_id, l.id, 'case', c.id, 'migration'
from public.crm_casos c
join public.label_taxonomy l on l.organization_id = c.organization_id and l.code in (
  'CONFIRMACAO_FORMAL_RECEBIDA','TRILHA_AUSTRIA','FORMALIZACAO_BLOQUEADA','CADASTRO_PENDENTE',
  'NUCLEO_FAMILIAR_PENDENTE','REPRESENTACAO_MENOR_PENDENTE','ESCOPO_PENDENTE','CASE_SERVICE_PENDENTE',
  'CONTRATO_EM_PREPARACAO','REVISAO_JURIDICA_PENDENTE','DOSSIE_EM_PREPARACAO','ONBOARDING_PENDENTE',
  'PRIMEIRA_MICRO_ENTREGA_PENDENTE')
where c.codigo = 'CA-CID-AT-FAM-2026-001'
and not exists (select 1 from public.entity_labels e where e.entity_id = c.id and e.label_id = l.id and e.removed_at is null);

-- checklist de onboarding padrão
insert into public.onboarding_checklist (organization_id, case_id, item_code, label, ordem)
select c.organization_id, c.id, x.code, x.label, x.ord
from public.crm_casos c,
(values
 ('contrato_assinado','Contrato assinado',1),
 ('pagamento_inicial','Pagamento inicial confirmado',2),
 ('responsavel_principal','Responsável principal definido',3),
 ('nucleo_familiar','Núcleo familiar validado',4),
 ('dossie_mae','Dossiê-mãe validado',5),
 ('ambiente_acesso','Ambiente e nível de acesso definidos',6),
 ('case_service','Case service definido',7),
 ('checklist_inicial','Checklist inicial criado',8),
 ('plano_acao','Plano de ação criado',9),
 ('grupo_familiar','Grupo familiar criado, quando aplicável',10),
 ('app_cliente','Acesso App Cliente preparado, quando aplicável',11),
 ('micro_entrega_d7','Primeira micro-entrega planejada até D7',12)
) as x(code,label,ord)
where c.codigo = 'CA-CID-AT-FAM-2026-001'
on conflict (case_id, item_code) do nothing;

-- rascunho de comunicação (não enviado)
insert into public.communication_queue (organization_id, case_id, acao_codigo, target_audience, visibility, suggested_channel, assunto, corpo_rascunho, status, requires_human_approval, observacao_interna)
select c.organization_id, c.id, 'solicitar_dados_cadastrais', 'cliente_contratante', 'client_sanitized', 'whatsapp',
 'Dados cadastrais do núcleo familiar',
 'Olá, Ana Luiza! Para seguirmos com a preparação da formalização do estudo familiar, precisamos dos dados cadastrais completos dos participantes (documento, endereço e contato). Assim que recebermos, organizamos o próximo passo. Qualquer dúvida, estou por aqui.',
 'awaiting_approval', true,
 'Rascunho criado pelo Desk. Nenhum envio automático — depende de aprovação humana.'
from public.crm_casos c where c.codigo = 'CA-CID-AT-FAM-2026-001'
and not exists (select 1 from public.communication_queue q where q.case_id = c.id and q.acao_codigo = 'solicitar_dados_cadastrais');

update public.crm_casos set communication_queue_id = (select q.id from public.communication_queue q where q.case_id = crm_casos.id order by q.created_at limit 1)
where codigo = 'CA-CID-AT-FAM-2026-001';

-- alerta interno da próxima ação
insert into public.case_alerts (organization_id, case_id, tipo, criticidade, titulo, detalhe, status, due_at)
select c.organization_id, c.id, 'proxima_acao', 'atencao',
 'Próxima ação: Solicitar dados cadastrais',
 'Responsável: Tatiana Melani Tosi. Público: cliente contratante. Canal sugerido: WhatsApp (rascunho aguardando aprovação).',
 'pending', timestamptz '2026-08-22 12:00:00-03'
from public.crm_casos c where c.codigo = 'CA-CID-AT-FAM-2026-001'
and not exists (select 1 from public.case_alerts a where a.case_id = c.id and a.tipo = 'proxima_acao' and a.status = 'pending');

-- pessoas: papéis explícitos
update public.case_members m set contratante = true, titular = true, status_cadastral = coalesce(m.status_cadastral,'completo')
where m.nome ilike 'Ana Luiza%' and m.case_id = (select id from public.crm_casos where codigo='CA-CID-AT-FAM-2026-001');
update public.case_members m set titular = true
where m.nome ilike 'Adair%' and m.case_id = (select id from public.crm_casos where codigo='CA-CID-AT-FAM-2026-001');
update public.case_members m set titular = true, status_cadastral = 'pendente'
where m.nome ilike 'Alice%' and m.case_id = (select id from public.crm_casos where codigo='CA-CID-AT-FAM-2026-001');
update public.case_members m set dependente = true, status_cadastral = 'pendente'
where m.nome ilike 'Felipe%' and m.case_id = (select id from public.crm_casos where codigo='CA-CID-AT-FAM-2026-001');

update public.nucleos_familiares n set
  dossie_mae = coalesce(n.dossie_mae, 'Dossiê-mãe Silveira / Friedmann-Reimer'),
  contratante_nome = coalesce(n.contratante_nome, 'Ana Luiza Gomes Silveira Rodrigues'),
  ambiente = coalesce(n.ambiente, 'Desk Intelligence'),
  nivel_acesso = coalesce(n.nivel_acesso, 'restrito_equipe')
where n.case_id = (select id from public.crm_casos where codigo='CA-CID-AT-FAM-2026-001');
