-- Planejador Universal — lista-alimento e preços resgatados (estrutura, sem
-- preço/link ativo), conforme decisão da Proprietária (04/09/2026):
-- "Correção Canônica — Catálogo Multipaís, Produtos-Pai, Jornada, Valores e
-- Legado" v2.0 e "Prompt Canônico — Planejador Universal Multipaís,
-- Catálogo-Alimento e Preços Resgatados" v2.1.
--
-- Regras inegociáveis destes documentos, aplicadas aqui:
-- - Não altera product_catalog nem qualquer SKU/família/faceta existente.
-- - Não cria preço homologado, link ou cobrança — apenas referências
--   versionadas com fonte, data e estado explícito.
-- - Planilha Mestre nunca é lida em runtime; estas tabelas são o destino da
--   migração dela, não um espelho vivo.
-- - CA-CURSO-001 entra como ARQUIVADO_DECISAO_PROPRIETARIA.
-- - Produtos-pai são valores internos de orquestração (texto), não uma
--   tabela/taxonomia nova — por isso não há tabela "produtos_pai" aqui.

create table if not exists public.planner_catalog_feed (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  item_id text not null,
  legacy_aliases text[] not null default '{}',
  prefix text not null,
  name text not null,
  status_dictionary text not null check (status_dictionary in (
    'ATIVO_HOMOLOGADO', 'ATIVO_SEM_PRECO_HOMOLOGADO', 'ESPECIFICACAO_PENDENTE',
    'CONDICIONAL_POR_CASO', 'LEGADO_RECONCILIAR', 'ARQUIVADO_DECISAO_PROPRIETARIA',
    'DUPLICADO_A_CONSOLIDAR', 'NAO_USAR_NO_MOTOR'
  )),
  product_parent text,
  journey_phase_default text,
  country_scope text[] not null default '{}',
  commercial_model text,
  requires_case_gate boolean not null default true,
  price_status text,
  source_artifact text not null,
  source_version text not null,
  reconciliation_note text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text,
  unique (organization_id, item_id)
);
grant select, insert, update on public.planner_catalog_feed to authenticated;
grant all on public.planner_catalog_feed to service_role;
alter table public.planner_catalog_feed enable row level security;
create policy planner_catalog_feed_sel on public.planner_catalog_feed for select to authenticated using (is_org_member(organization_id));
create policy planner_catalog_feed_ins on public.planner_catalog_feed for insert to authenticated with check (can_write(organization_id));
create policy planner_catalog_feed_upd on public.planner_catalog_feed for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

create table if not exists public.price_catalog_rescued (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  item_id text,
  -- nullable: assinaturas/planos de continuidade (CA-ASS-*/CA-WPP-*/CA-FAM-*) são
  -- produto-nível, não país-nível — não têm país para declarar.
  country_code text,
  phase text,
  price_component text not null check (price_component in ('honorarios', 'despesas', 'taxas', 'parcelas_padrao')),
  amount numeric(14,2),
  currency text not null default 'BRL',
  source_type text not null,
  source_reference text not null,
  source_date date,
  price_status text not null check (price_status in (
    'REFERENCIA_RESGATADA', 'CONDICAO_PARTICULAR_DE_CASO', 'HOMOLOGADO_CATALOGO',
    'PENDENTE_DE_HOMOLOGACAO', 'DIVERGENTE', 'ARQUIVADO'
  )),
  effective_from date,
  effective_to date,
  case_only boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  archived_at timestamptz,
  archived_by uuid,
  archive_motivo text
);
grant select, insert, update on public.price_catalog_rescued to authenticated;
grant all on public.price_catalog_rescued to service_role;
alter table public.price_catalog_rescued enable row level security;
create policy price_catalog_rescued_sel on public.price_catalog_rescued for select to authenticated using (is_org_member(organization_id));
create policy price_catalog_rescued_ins on public.price_catalog_rescued for insert to authenticated with check (can_write(organization_id));
create policy price_catalog_rescued_upd on public.price_catalog_rescued for update to authenticated using (can_write(organization_id)) with check (can_write(organization_id));

-- ============ seed: lista-alimento (pré-lista da Correção Canônica v2.0, seção 4.2) ============
-- product_parent usa os 9 nomes canônicos já confirmados por quatro sínteses
-- independentes nesta sessão (ver docs/arquitetura/2026-09-04_MOTOR-PLANEJADOR-PRODUTOS-PAI-CANONICO-FINAL.md).
insert into public.planner_catalog_feed
  (organization_id, item_id, prefix, name, status_dictionary, product_parent, journey_phase_default, country_scope, source_artifact, source_version, reconciliation_note)
select o.id, v.item_id, v.prefix, v.name, v.status_dictionary, v.product_parent, v.journey_phase_default, v.country_scope,
  'Correção Canônica — Catálogo Multipaís, Produtos-Pai, Jornada, Valores e Legado', 'v2.0', v.reconciliation_note
from public.organizations o
cross join (values
  ('CA-GEN-MULTI-001', 'CA-GEN', 'Base Genealógica Familiar Compartilhada', 'ESPECIFICACAO_PENDENTE', 'Diagnóstico Familiar Multipaís', 'F1', array[]::text[], 'Especificação nova; validar preço e escopo'),
  ('CA-GEN-MULTI-002', 'CA-GEN', 'Diagnóstico Comparativo de Trilhas Familiares', 'ESPECIFICACAO_PENDENTE', 'Diagnóstico Familiar Multipaís', 'F1', array[]::text[], 'Especificação nova; validar preço e escopo'),
  ('CA-GEN-MULTI-003', 'CA-GEN', 'Investigação de Ramo Adicional', 'ESPECIFICACAO_PENDENTE', 'Pesquisa Genealógica por Ramo', 'F2', array[]::text[], 'Especificação nova; validar preço e escopo'),
  ('CA-GEN-MULTI-004', 'CA-GEN', 'Pesquisa de Segundo País com Base Compartilhada', 'ESPECIFICACAO_PENDENTE', 'Pesquisa Genealógica por Ramo', 'F2', array[]::text[], 'Especificação nova; cobrar apenas incremento'),
  ('CA-GEN-MULTI-005', 'CA-GEN', 'Consolidação de Dossiê Familiar Multipaís', 'ESPECIFICACAO_PENDENTE', 'História, Memória e Legado Familiar', 'F3', array[]::text[], 'Especificação nova; validar preço e escopo'),
  ('CA-GEN-MULTI-006', 'CA-GEN', 'Acompanhamento Familiar de Trilhas Paralelas', 'ESPECIFICACAO_PENDENTE', 'Acompanhamento Familiar de Nacionalidade', 'F4', array[]::text[], 'Especificação nova; validar preço e escopo'),
  ('CA-CID-001', 'CA-CID', 'Diagnóstico e Checklist Inicial — Itália', 'LEGADO_RECONCILIAR', 'Diagnóstico de Nacionalidade por Etapas', 'F1', array['IT'], 'Item existente; descrição/preço a reconciliar sem usar Planilha Mestre'),
  ('CA-CID-002D', 'CA-CID', 'Pasta e Checklist de Pendências', 'CONDICIONAL_POR_CASO', 'Preparação de Prova Documental', 'F2', array[]::text[], 'Item existente; aplicabilidade por trilha'),
  ('CA-CID-002A', 'CA-CID', 'Revisão de Pasta', 'CONDICIONAL_POR_CASO', 'Preparação de Prova Documental', 'F2', array[]::text[], 'Item existente; condicional'),
  ('CA-CID-002B', 'CA-CID', 'Atualização de Pasta', 'CONDICIONAL_POR_CASO', 'Preparação de Prova Documental', 'F2', array[]::text[], 'Item existente; condicional'),
  ('CA-CID-023', 'CA-CID', 'Assessoria Completa de Cidadania Italiana', 'LEGADO_RECONCILIAR', 'Acompanhamento Familiar de Nacionalidade', 'F4', array['IT'], 'Item existente; somente quando condição formal aprovada'),
  ('CA-CID-025', 'CA-CID', 'Acompanhamento Familiar — Processo Compartilhado', 'CONDICIONAL_POR_CASO', 'Acompanhamento Familiar de Nacionalidade', 'F4', array[]::text[], 'Item existente; base de coordenação familiar'),
  ('CA-CID-DE-001', 'CA-CID', 'Diagnóstico de Linha Alemã', 'ATIVO_SEM_PRECO_HOMOLOGADO', 'Diagnóstico de Nacionalidade por Etapas', 'F1', array['DE'], 'Item existente e ativo no Planejador'),
  ('CA-CID-DE-002', 'CA-CID', 'Pesquisa e Montagem Documental Alemã', 'ATIVO_SEM_PRECO_HOMOLOGADO', 'Preparação de Prova Documental', 'F2', array['DE'], 'Item existente e ativo no Planejador'),
  ('CA-CID-DE-003b', 'CA-CID', 'Acompanhamento de Protocolo Alemã', 'ATIVO_SEM_PRECO_HOMOLOGADO', 'Acompanhamento Familiar de Nacionalidade', 'F4', array['DE'], 'Item existente e ativo no Planejador'),
  ('CA-CID-AT-001', 'CA-CID', 'Consultoria e Acompanhamento de Cidadania Austríaca', 'LEGADO_RECONCILIAR', 'Diagnóstico de Nacionalidade por Etapas', 'F1', array['AT'], 'Item existente; condição por caso não é preço de catálogo'),
  ('CA-HIST-001', 'CA-HIST', 'Estudo Genealógico e Patrimonial Aprofundado', 'ATIVO_SEM_PRECO_HOMOLOGADO', 'História, Memória e Legado Familiar', 'F2', array[]::text[], 'Manter; foco estratégico do Clube'),
  ('CA-HIST-005', 'CA-HIST', 'Pesquisa de Base Familiar', 'ATIVO_SEM_PRECO_HOMOLOGADO', 'Pesquisa Genealógica por Ramo', 'F1', array[]::text[], 'Manter; revisar sobreposição com base compartilhada'),
  ('CA-HIST-002', 'CA-HIST', 'Pesquisa Genealógica Extra por Sobrenome', 'CONDICIONAL_POR_CASO', 'Pesquisa Genealógica por Ramo', 'F2', array[]::text[], 'Manter como incremento, não como núcleo obrigatório'),
  ('CA-MEM-004', 'CA-MEM', 'Livro da História Familiar', 'CONDICIONAL_POR_CASO', 'História, Memória e Legado Familiar', 'F6', array[]::text[], 'Manter; valor e escopo devem vir de proposta aprovada'),
  ('CA-MEM-008', 'CA-MEM', 'Livro de Memórias Premium', 'CONDICIONAL_POR_CASO', 'História, Memória e Legado Familiar', 'F6', array[]::text[], 'Manter condicionado à diferenciação clara de escopo'),
  ('CA-ASS-002', 'CA-ASS', 'Plano Memórias', 'CONDICIONAL_POR_CASO', 'Continuidade e Acervo Familiar', 'F7', array[]::text[], 'Manter somente após benefícios/preço homologados'),
  ('CA-ASS-003', 'CA-ASS', 'Plano Legado', 'CONDICIONAL_POR_CASO', 'Continuidade e Acervo Familiar', 'F7', array[]::text[], 'Manter somente após benefícios/preço homologados'),
  ('CA-FAM-002', 'CA-FAM', 'Familiar Conectado Plus', 'CONDICIONAL_POR_CASO', 'Continuidade e Acervo Familiar', 'F4', array[]::text[], 'Manter como extensão condicionada'),
  ('CA-WPP-001', 'CA-WPP', 'Pacote WhatsApp Essencial', 'CONDICIONAL_POR_CASO', 'Continuidade e Acervo Familiar', 'F4', array[]::text[], 'Manter interno até validar benefício, preço e comunicação'),
  ('CA-WPP-002', 'CA-WPP', 'Pacote WhatsApp Premium', 'CONDICIONAL_POR_CASO', 'Continuidade e Acervo Familiar', 'F4', array[]::text[], 'Manter interno até validar benefício, preço e comunicação'),
  ('CA-CID-003', 'CA-CID', 'Verificação/Atualização AIRE', 'CONDICIONAL_POR_CASO', 'Regularização Pós-Reconhecimento', 'F5', array['IT'], 'Manter como item específico Itália'),
  ('CA-CID-006', 'CA-CID', 'Codice Fiscale + SPID', 'CONDICIONAL_POR_CASO', 'Regularização Pós-Reconhecimento', 'F5', array['IT'], 'Manter como item específico Itália'),
  ('CA-CID-016', 'CA-CID', 'Registro de Filhos Adicionais', 'CONDICIONAL_POR_CASO', 'Regularização Pós-Reconhecimento', 'F5', array['IT'], 'Manter condicionado a ato e elegibilidade aplicáveis'),
  ('CA-CID-018', 'CA-CID', 'Transcrição de Atos', 'CONDICIONAL_POR_CASO', 'Regularização Pós-Reconhecimento', 'F5', array['IT'], 'Manter sob condição de pendência'),
  ('CA-CURSO-001', 'CA-CURSO', 'Kit Pesquisa Faça Você Mesmo', 'ARQUIVADO_DECISAO_PROPRIETARIA', null, null, array[]::text[], 'Arquivado por decisão da proprietária; não alimentar motor comercial')
) as v(item_id, prefix, name, status_dictionary, product_parent, journey_phase_default, country_scope, reconciliation_note)
where o.archived_at is null and o.demo = false
  and not exists (select 1 from public.planner_catalog_feed x where x.organization_id = o.id and x.item_id = v.item_id);

-- ============ seed: especificações pendentes por país (Correção Canônica v2.0, seção 4.3) ============
insert into public.planner_catalog_feed
  (organization_id, item_id, prefix, name, status_dictionary, product_parent, journey_phase_default, country_scope, source_artifact, source_version, reconciliation_note)
select o.id, v.item_id, v.prefix, v.name, 'ESPECIFICACAO_PENDENTE', v.product_parent, v.journey_phase_default, array[v.country_code],
  'Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados', 'v2.1',
  'Sem item homologado hoje; não estimar preço'
from public.organizations o
cross join (values
  ('CA-CID-HR-001', 'CA-CID', 'Diagnóstico — Croácia', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'HR'),
  ('CA-CID-HR-002', 'CA-CID', 'Pesquisa/prova — Croácia', 'Preparação de Prova Documental', 'F2', 'HR'),
  ('CA-CID-HR-003', 'CA-CID', 'Acompanhamento — Croácia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'HR'),
  ('CA-CID-PT-001', 'CA-CID', 'Diagnóstico — Portugal', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'PT'),
  ('CA-CID-PT-002', 'CA-CID', 'Pesquisa/prova — Portugal', 'Preparação de Prova Documental', 'F2', 'PT'),
  ('CA-CID-PT-003', 'CA-CID', 'Acompanhamento — Portugal', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'PT'),
  ('CA-CID-ES-001', 'CA-CID', 'Diagnóstico — Espanha', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'ES'),
  ('CA-CID-ES-002', 'CA-CID', 'Pesquisa/prova — Espanha', 'Preparação de Prova Documental', 'F2', 'ES'),
  ('CA-CID-ES-003', 'CA-CID', 'Acompanhamento — Espanha', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'ES'),
  ('CA-CID-PL-001', 'CA-CID', 'Diagnóstico — Polônia', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'PL'),
  ('CA-CID-PL-002', 'CA-CID', 'Pesquisa/prova — Polônia', 'Preparação de Prova Documental', 'F2', 'PL'),
  ('CA-CID-PL-003', 'CA-CID', 'Acompanhamento — Polônia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'PL'),
  ('CA-CID-RO-001', 'CA-CID', 'Diagnóstico — Romênia', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'RO'),
  ('CA-CID-RO-002', 'CA-CID', 'Pesquisa/prova — Romênia', 'Preparação de Prova Documental', 'F2', 'RO'),
  ('CA-CID-RO-003', 'CA-CID', 'Acompanhamento — Romênia', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'RO'),
  ('CA-CID-AT-002', 'CA-CID', 'Pesquisa/prova — Áustria', 'Preparação de Prova Documental', 'F2', 'AT'),
  ('CA-CID-AT-003', 'CA-CID', 'Acompanhamento — Áustria', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'AT'),
  ('CA-CID-LU-001', 'CA-CID', 'Diagnóstico — Luxemburgo', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'LU'),
  ('CA-CID-LU-002', 'CA-CID', 'Pesquisa/prova — Luxemburgo', 'Preparação de Prova Documental', 'F2', 'LU'),
  ('CA-CID-LU-003', 'CA-CID', 'Acompanhamento — Luxemburgo', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'LU'),
  ('CA-CID-HU-001', 'CA-CID', 'Diagnóstico — Hungria', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'HU'),
  ('CA-CID-HU-002', 'CA-CID', 'Pesquisa/prova — Hungria', 'Preparação de Prova Documental', 'F2', 'HU'),
  ('CA-CID-HU-003', 'CA-CID', 'Acompanhamento — Hungria', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'HU'),
  ('CA-CID-IE-001', 'CA-CID', 'Diagnóstico — Irlanda', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'IE'),
  ('CA-CID-IE-002', 'CA-CID', 'Pesquisa/prova — Irlanda', 'Preparação de Prova Documental', 'F2', 'IE'),
  ('CA-CID-IE-003', 'CA-CID', 'Acompanhamento — Irlanda', 'Acompanhamento Familiar de Nacionalidade', 'F4', 'IE'),
  ('CA-NAT-BR-001', 'CA-NAT', 'Diagnóstico — Naturalização brasileira', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'BR'),
  ('CA-NAT-BR-002', 'CA-NAT', 'Pesquisa/prova — Naturalização brasileira', 'Preparação de Prova Documental', 'F2', 'BR'),
  ('CA-NAT-FR-001', 'CA-NAT', 'Diagnóstico — Naturalização francesa', 'Diagnóstico de Nacionalidade por Etapas', 'F1', 'FR'),
  ('CA-NAT-FR-002', 'CA-NAT', 'Pesquisa/prova — Naturalização francesa', 'Preparação de Prova Documental', 'F2', 'FR')
) as v(item_id, prefix, name, product_parent, journey_phase_default, country_code)
where o.archived_at is null and o.demo = false
  and not exists (select 1 from public.planner_catalog_feed x where x.organization_id = o.id and x.item_id = v.item_id);

-- ============ seed: preços resgatados por país — referência, não catálogo (Prompt Canônico v2.1) ============
insert into public.price_catalog_rescued
  (organization_id, country_code, price_component, amount, source_type, source_reference, price_status, case_only, notes)
select o.id, v.country_code, v.price_component, v.amount, 'planejador_universal_historico',
  'Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados v2.1', v.price_status, false, v.notes
from public.organizations o
cross join (values
  ('IT', 'honorarios', 4700.00, 'REFERENCIA_RESGATADA', 'Divergência: também há referências de R$ 4.500 e R$ 4.800 para escopos relacionados — não escolher automaticamente'),
  ('IT', 'despesas', 1600.00, 'REFERENCIA_RESGATADA', null),
  ('IT', 'taxas', 500.00, 'REFERENCIA_RESGATADA', null),
  ('HR', 'honorarios', 4000.00, 'REFERENCIA_RESGATADA', null),
  ('HR', 'despesas', 1800.00, 'REFERENCIA_RESGATADA', null),
  ('HR', 'taxas', 600.00, 'REFERENCIA_RESGATADA', null),
  ('PT', 'honorarios', 4800.00, 'REFERENCIA_RESGATADA', 'Divergência: também há referências de R$ 3.800 e R$ 4.400 — não escolher automaticamente'),
  ('PT', 'despesas', 1400.00, 'REFERENCIA_RESGATADA', null),
  ('PT', 'taxas', 450.00, 'REFERENCIA_RESGATADA', null),
  ('ES', 'honorarios', 3200.00, 'REFERENCIA_RESGATADA', null),
  ('ES', 'despesas', 1200.00, 'REFERENCIA_RESGATADA', null),
  ('ES', 'taxas', 400.00, 'REFERENCIA_RESGATADA', null),
  ('DE', 'honorarios', 4200.00, 'REFERENCIA_RESGATADA', null),
  ('DE', 'despesas', 1500.00, 'REFERENCIA_RESGATADA', null),
  ('DE', 'taxas', 500.00, 'REFERENCIA_RESGATADA', null),
  ('PL', 'honorarios', 3900.00, 'REFERENCIA_RESGATADA', null),
  ('PL', 'despesas', 1500.00, 'REFERENCIA_RESGATADA', null),
  ('PL', 'taxas', 450.00, 'REFERENCIA_RESGATADA', null),
  ('RO', 'honorarios', 3600.00, 'REFERENCIA_RESGATADA', null),
  ('RO', 'despesas', 1400.00, 'REFERENCIA_RESGATADA', null),
  ('RO', 'taxas', 450.00, 'REFERENCIA_RESGATADA', null),
  ('AT', 'honorarios', 4800.00, 'REFERENCIA_RESGATADA', 'Não confundir com a condição particular de R$ 9.600 da Ana Luiza (case_only) — ver linha AT/CONDICAO_PARTICULAR_DE_CASO'),
  ('AT', 'despesas', 1800.00, 'REFERENCIA_RESGATADA', null),
  ('AT', 'taxas', 600.00, 'REFERENCIA_RESGATADA', null),
  ('BR', 'honorarios', 900.00, 'REFERENCIA_RESGATADA', null),
  ('BR', 'despesas', 300.00, 'REFERENCIA_RESGATADA', null),
  ('FR', 'honorarios', 1000.00, 'REFERENCIA_RESGATADA', null),
  ('FR', 'despesas', 350.00, 'REFERENCIA_RESGATADA', null),
  ('FR', 'taxas', 250.00, 'REFERENCIA_RESGATADA', null),
  ('EU', 'honorarios', 3500.00, 'REFERENCIA_RESGATADA', '"Europa geral" não é produto de processo final — usar só como referência legada de triagem'),
  ('EU', 'despesas', 1400.00, 'REFERENCIA_RESGATADA', null),
  ('EU', 'taxas', 500.00, 'REFERENCIA_RESGATADA', null),
  ('LU', 'honorarios', null, 'PENDENTE_DE_HOMOLOGACAO', 'Sem valor localizado; estrutura nula, não estimar'),
  ('HU', 'honorarios', null, 'PENDENTE_DE_HOMOLOGACAO', 'Sem valor localizado; estrutura nula, não estimar'),
  ('IE', 'honorarios', null, 'PENDENTE_DE_HOMOLOGACAO', 'Sem valor localizado; estrutura nula, não estimar')
) as v(country_code, price_component, amount, price_status, notes)
where o.archived_at is null and o.demo = false
  and not exists (
    select 1 from public.price_catalog_rescued x
    where x.organization_id = o.id and x.country_code = v.country_code and x.price_component = v.price_component
      and x.item_id is null and x.case_only = false
  );

-- ============ seed: preços resgatados por item (Prompt Canônico v2.1) ============
insert into public.price_catalog_rescued
  (organization_id, item_id, country_code, price_component, amount, source_type, source_reference, price_status, case_only)
select o.id, v.item_id, v.country_code, 'honorarios', v.amount, 'planejador_universal_historico',
  'Prompt Canônico — Planejador Universal Multipaís, Catálogo-Alimento e Preços Resgatados v2.1', 'REFERENCIA_RESGATADA', false
from public.organizations o
cross join (values
  ('CA-CID-001', 'IT', 247.00),
  ('CA-CID-002D', 'IT', 390.00),
  ('CA-CID-002A', 'IT', 690.00),
  ('CA-CID-002B', 'IT', 890.00),
  ('CA-CID-003', 'IT', 530.00),
  ('CA-CID-006', 'IT', 280.00),
  ('CA-CID-016', 'IT', 1511.00),
  ('CA-CID-018', 'IT', 1588.00),
  ('CA-CID-019', 'IT', 3881.00),
  ('CA-CID-DE-001', 'DE', 247.00),
  ('CA-CID-DE-002', 'DE', 1290.00),
  ('CA-CID-DE-003b', 'DE', 890.00),
  ('CA-CID-AT-001', 'AT', 4800.00),
  ('CA-ASS-001', null, 179.00),
  ('CA-ASS-002', null, 269.00),
  ('CA-ASS-003', null, 359.00),
  ('CA-WPP-001', null, 79.00),
  ('CA-WPP-002', null, 149.00),
  ('CA-FAM-001', null, 280.00),
  ('CA-FAM-002', null, 490.00)
) as v(item_id, country_code, amount)
where o.archived_at is null and o.demo = false
  and not exists (
    select 1 from public.price_catalog_rescued x
    where x.organization_id = o.id and x.item_id = v.item_id and x.price_component = 'honorarios' and x.case_only = false
  );

-- ============ seed: condição particular de caso (não é preço de catálogo) ============
insert into public.price_catalog_rescued
  (organization_id, country_code, price_component, amount, source_type, source_reference, price_status, case_only, notes)
select o.id, 'AT', 'honorarios', 9600.00, 'proposta_canva',
  'Caso CA-CID-AT-FAM-2026-001 — Ana Luiza (projeto familiar, 3 processos)', 'CONDICAO_PARTICULAR_DE_CASO', true,
  'Exclusiva do caso da Ana Luiza; não substitui nem sobrescreve a referência de R$ 4.800 para Áustria'
from public.organizations o
where o.archived_at is null and o.demo = false
  and not exists (
    select 1 from public.price_catalog_rescued x
    where x.organization_id = o.id and x.country_code = 'AT' and x.case_only = true and x.price_status = 'CONDICAO_PARTICULAR_DE_CASO'
  );
