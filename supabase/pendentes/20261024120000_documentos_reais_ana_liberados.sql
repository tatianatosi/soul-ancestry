-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ ESTADO: NÃO APLICADO. Proposta — depende de metadado real que eu não     │
-- │ tenho. Aplicar pelo Lovable, e só depois de preencher os valores.        │
-- │ Regra 3 da Decisão de Hospedagem Única (23/10/2026): o Claude Code não   │
-- │ escreve em supabase/migrations/ nem em drizzle/migrations/; propõe aqui. │
-- └──────────────────────────────────────────────────────────────────────────┘
--
-- Ordem da Proprietária em 24/10/2026: "Insira os 3 documentos reais na tabela
-- `documents` vinculados ao caso CA-CID-AT-FAM-2026-001 com
-- liberado_cliente = true".
--
-- MEDIDO NO BANCO VIVO (liiqqibnirnpnvjmjrpj) em 24/10/2026, antes de escrever:
--
--   documents do caso da Ana ............................ 0 linhas
--   documents na tabela inteira ......................... 3 linhas
--   crm_casos.ativado_em do caso ........................ null
--   client_portal_case_access do caso ................... 0 linhas
--
-- As 3 linhas que existem NÃO são as certidões da Ana. São registros de
-- demonstração de 16/08/2026, no caso 3f2b7d10-0000-4000-8000-000000000001,
-- todos com storage_path = null:
--   "Relatorio de entrega - etapa 1" (liberado_cliente = true)
--   "Nota interna de estrategia"
--   "RG enviado pelo cliente"
--
-- POR QUE ESTE ARQUIVO NÃO TRAZ OS VALORES PRONTOS
--
-- Eu não tenho as 3 certidões reais: nem título, nem tipo, nem o arquivo em
-- storage. Inserir linhas com nome inventado e storage_path = null publicaria
-- para uma cliente de verdade três documentos que não abrem — o oposto da
-- regra "App mostra só conteúdo sanitizado/aprovado/publicado; vazio honesto;
-- nada inferido". É exatamente o risco que a Proprietária apontou ao recusar a
-- branch de nome enganoso em 23/10/2026. Então os valores ficam como parâmetro
-- explícito, e o script se recusa a rodar enquanto não forem preenchidos.
--
-- ANTES DE APLICAR, SAIBA QUE ISSO SOZINHO NÃO FAZ O APP MOSTRAR OS DOCUMENTOS
--
-- A aba Documentos do App Cliente está atrás do portão de ativação: o caso tem
-- ativado_em = null e nenhuma linha em client_portal_case_access. Enquanto a
-- Proprietária não clicar em "Ativar" em /onboarding/a11a0000-0000-4000-8000-000000000002
-- (0 bloqueios, 3 flags true, medido em 23/10/2026), o INSERT abaixo grava os
-- documentos no Desk mas a cliente não vê nada. O portão é o mesmo da fatura.

begin;

-- 1) Preencher com o metadado real das 3 certidões. O `storage_path` tem de
--    apontar para arquivo que já exista no bucket; documento liberado sem
--    arquivo é pior do que documento ausente.
create temporary table _docs_reais_ana (
  tipo            text not null,
  categoria       text not null,
  titulo          text not null,
  nome_arquivo    text not null,
  storage_path    text not null,
  mime_type       text not null,
  origem          text not null,
  sensibilidade   text not null
) on commit drop;

insert into _docs_reais_ana (tipo, categoria, titulo, nome_arquivo, storage_path, mime_type, origem, sensibilidade) values
  ('PREENCHER', 'PREENCHER', 'PREENCHER', 'PREENCHER', 'PREENCHER', 'application/pdf', 'cliente', 'normal'),
  ('PREENCHER', 'PREENCHER', 'PREENCHER', 'PREENCHER', 'PREENCHER', 'application/pdf', 'cliente', 'normal'),
  ('PREENCHER', 'PREENCHER', 'PREENCHER', 'PREENCHER', 'PREENCHER', 'application/pdf', 'cliente', 'normal');

-- 2) Guarda: nada entra com placeholder. Falhar aqui é o comportamento certo.
do $$
declare
  n integer;
begin
  select count(*) into n from _docs_reais_ana
   where 'PREENCHER' in (tipo, categoria, titulo, nome_arquivo, storage_path);
  if n > 0 then
    raise exception
      'Recusado: % de 3 documentos ainda estao com PREENCHER. Preencha o metadado real das certidoes antes de aplicar.', n;
  end if;
end $$;

-- 3) Guarda: o vocabulário tem de existir no CHECK da coluna. Se qualquer
--    valor for recusado, o INSERT abaixo falha e a transação inteira volta —
--    nenhum documento parcial fica para trás.

-- 4) Insere, vinculado ao caso e à organização que o próprio caso já declara.
--    liberado_cliente = true, com liberado_em registrado para auditoria.
insert into documents (
  case_id, client_id, organization_id,
  tipo, categoria, titulo, nome_arquivo, storage_path, mime_type,
  origem, sensibilidade, status,
  liberado_cliente, liberado_em
)
select
  c.id,
  c.client_id,
  c.organization_id,
  d.tipo, d.categoria, d.titulo, d.nome_arquivo, d.storage_path, d.mime_type,
  d.origem, d.sensibilidade, 'liberado',
  true, now()
from crm_casos c
cross join _docs_reais_ana d
where c.id = 'a11a0000-0000-4000-8000-000000000002';

-- 5) Confere que entraram exatamente 3, e que todos têm arquivo.
do $$
declare
  n integer;
  sem_arquivo integer;
begin
  select count(*) into n from documents
   where case_id = 'a11a0000-0000-4000-8000-000000000002';
  select count(*) into sem_arquivo from documents
   where case_id = 'a11a0000-0000-4000-8000-000000000002' and storage_path is null;
  if n <> 3 then
    raise exception 'Esperava 3 documentos no caso da Ana, encontrei %.', n;
  end if;
  if sem_arquivo > 0 then
    raise exception '% documento(s) liberado(s) sem storage_path. Abortado.', sem_arquivo;
  end if;
end $$;

commit;
