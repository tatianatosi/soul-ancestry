-- ESTADO: NÃO APLICADO; BLOQUEADO_POR_GUARD (30/10/2026). Decisão explícita da Proprietária
-- (P0-2 do plano mestre: "Despublicar até sanitizar"). A tentativa pela ferramenta de banco
-- do Lovable foi recusada por `fn_documents_guard`: "Envio de documentos exige usuário
-- autenticado". O guard só cede a `auth.uid()` de um admin ativo; uma conexão SQL não tem
-- usuário, e forjar a sessão para contorná-lo não é aceitável. Precisa sair de uma ação
-- autenticada no Desk (sessão da Proprietária).
-- Caminho: Desk → Privacidade → Documentos → "Retirar do App" em cada um dos 3 documentos
-- (`retirarDocumentoDoApp`, PR #204), com motivo. Este SQL fica só como registro da decisão.
--
-- O QUE FAZ
-- Os 3 documentos do caso CA-CID-AT-FAM-2026-001 (dossiê consolidado e registro
-- unificado em PDF e texto-fonte) estavam liberados ao cliente (`liberado_cliente = true`),
-- mas a mesma pesquisa os registra como internos em `evidencias`
-- (`visibilidade = interna`, `liberada_cliente = false`), e o dossiê de origem traz
-- dados comerciais internos e dados de outras pessoas da família.
-- Esta mudança deixa os 3 fora do App até existir versão sanitizada:
-- `liberado_cliente = false` e `status = 'pendente_de_revisao'`.
--
-- O QUE NÃO FAZ
-- Não apaga linha nem arquivo do storage, não altera título, caminho ou evidências.
-- Idempotente: só age em linha ainda liberada.
--
-- PARA REVERTER (quando houver versão sanitizada aprovada): liberar pela tela de
-- documentos do Desk, que registra quem liberou e quando.

begin;

update public.documents
   set liberado_cliente = false,
       status = 'pendente_de_revisao'
 where case_id = 'a11a0000-0000-4000-8000-000000000002'
   and id in (
     '6ff8741d-fc28-4290-a439-5c65cfa3ce32',
     'bf5cdce1-1d18-407e-a2d4-e622c53932a4',
     'ca8da621-c6ca-4ca3-b5b8-d545175693c8'
   )
   and liberado_cliente = true;

insert into public.audit_logs (organization_id, acao, entidade, entidade_id, metadados)
select organization_id, 'documento_despublicado_ate_sanitizar', 'documents', id,
       jsonb_build_object(
         'motivo', 'Conteúdo interno sem versão sanitizada; evidências correspondentes marcadas como internas.',
         'decisao', 'Proprietária, 30/10/2026, P0-2 do plano mestre',
         'executado_por', 'Claude Code via ferramenta de banco do Lovable')
  from public.documents
 where case_id = 'a11a0000-0000-4000-8000-000000000002'
   and id in (
     '6ff8741d-fc28-4290-a439-5c65cfa3ce32',
     'bf5cdce1-1d18-407e-a2d4-e622c53932a4',
     'ca8da621-c6ca-4ca3-b5b8-d545175693c8'
   );

commit;
