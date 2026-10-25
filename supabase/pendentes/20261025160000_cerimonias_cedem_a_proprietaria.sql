-- ============================================================================
-- Retirada máxima de cerimônia: as recusas de processo cedem à proprietária
-- Proposta de 25/10/2026, véspera do lançamento.
-- ESTADO: JÁ APLICADO em 25/10/2026 (~16:10 UTC), pelo Claude Code via a
-- ferramenta de banco do Lovable, sob autorização explícita da Proprietária
-- ("aplique as 110 e também as 27 que sejam primordiais").
--
-- O QUE FOI APLICADO DE FATO (difere do texto abaixo, que é a proposta de 81):
--   A Proprietária mandou liberar também as funções de proteção que a impediam
--   de agir. Saíram da lista KEEP_WHOLE 10 funções: fn_documents_guard,
--   fn_consent_guard, fn_app_projection_guard, fn_portal_access_autorizacao_guard,
--   fn_authorized_portal_email_guard, fn_portal_case_access_guard,
--   fn_case_codigo_canonico, fn_caso_alias_guard, fn_case_alias_guard,
--   fn_lead_case_id_guard. Nelas também vale o padrão PROT (organização,
--   consentimento, sanitização, código canônico continuam ativos para todos).
--   Resultado gravado: 89 funções alteradas, 328 recusas cedem, 52 mantidas.
--   118 funções de trigger cedem à proprietária. Valem para todos (19):
--   sem exclusão física (5), histórico append-only (8), último admin,
--   log sem credencial, integração desligada (2), e os dois guards de alias
--   (todas as recusas deles são de colisão de código canônico).
--   O bloco DO abaixo é a versão de 81; a aplicada usou KEEP_WHOLE de 17.
--
-- Pedido da Proprietária (25/10/2026): "retirada máxima de bloqueios sem
-- sentido para uma startup de pesquisa genealógica que não precisa de 500
-- auditorias e verificações, sendo que tudo foi aprovado anteriormente".
--
-- O QUE O BANCO TINHA (medido no banco vivo em 25/10/2026, 15:50 UTC):
--   137 funções de trigger podem recusar uma gravação, com 510 pontos de
--   recusa (RAISE EXCEPTION). 29 já cediam à proprietária (decisões de 05/09
--   e 23/09). 108 recusavam inclusive a ela.
--
-- O QUE ESTE ARQUIVO FAZ:
--   Nas 81 funções de cerimônia, cada RAISE EXCEPTION passa a valer só para
--   quem não é a proprietária:
--       if not public.fn_proprietaria_operando() then RAISE EXCEPTION ...; end if;
--   290 recusas passam a ceder. Para os demais papéis tudo continua igual.
--
-- O QUE NÃO MUDA, DE PROPÓSITO (proteção real, não cerimônia):
--   A) 27 funções inteiras ficam intocadas (lista KEEP_WHOLE abaixo):
--      - sem exclusão física (arquivar continua livre);
--      - histórico imutável / append-only (auditoria, conversões, overrides);
--      - último administrador ativo nunca é removido (você não se tranca fora);
--      - acesso do cliente ao portal só com e-mail autorizado;
--      - documentos e consentimentos presos à organização certa;
--      - conteúdo que chega ao App Cliente precisa ser sanitizado;
--      - integração desligada não faz chamada externa;
--      - código canônico do caso e aliases não colidem.
--   B) Dentro das 81 funções, 37 recusas com conteúdo de proteção real ficam
--      ativas para todos, inclusive a proprietária (padrão PROT abaixo):
--      outra organização, consentimento (LGPD), menor de idade sem
--      representante legal, contrato assinado/versão congelada imutável,
--      fatura paga, numeração gerada pelo sistema, dado restrito.
--
-- POR QUE ENVOLVER A RECUSA EM VEZ DE PULAR A FUNÇÃO INTEIRA:
--   Muitas dessas funções também preenchem campos (quem/quando reconheceu,
--   carimbos de resolução, updated_at). Pular a função apagaria esses
--   carimbos. Envolver só o RAISE mantém todo o resto funcionando.
--
-- PROVA FEITA ANTES DE PROPOR (no banco vivo, dentro de transação desfeita):
--   - 81 de 81 funções recompilaram sem erro.
--   - fn_quality_issue_guard: usuário comum sem comentário → RECUSADO;
--     proprietária sem comentário → PASSOU, com reconhecida_por e
--     reconhecida_em preenchidos automaticamente.
--
-- SEGURANÇA DA APLICAÇÃO:
--   - Atômico: se qualquer função falhar ao recompilar, NADA é aplicado.
--   - Idempotente: funções que já citam fn_proprietaria_operando são puladas,
--     então reaplicar este arquivo não faz nada.
--   - Lê o corpo ATUAL de cada função no banco (não um texto congelado aqui),
--     então não desfaz mudanças feitas depois desta proposta.
--   - Não toca em RLS, não apaga e não altera nenhum dado.
--
-- LIMITE CONHECIDO: o banco é só metade. Várias telas do Desk têm seus próprios
-- portões no código (motivo obrigatório para clicar, digitar "PUBLICAR",
-- homologação de SKU no catálogo). Esses são mudança de código, numa segunda
-- etapa, e estão listados nos relatórios da auditoria (.cartographer/reports/).
--
-- VERIFICAÇÃO DEPOIS DE APLICAR:
--   select count(*) filter (where prosrc ilike '%fn_proprietaria_operando%') as cedem,
--          count(*) filter (where prosrc not ilike '%fn_proprietaria_operando%') as nao_cedem
--     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname = 'public' and p.prorettype = 'trigger'::regtype
--      and p.prosrc ilike '%raise exception%';
--   -- esperado: cedem = 110 (29 + 81), nao_cedem = 27 (as KEEP_WHOLE)
--
-- REVERSÃO: em cada função alterada, trocar
--   "if not public.fn_proprietaria_operando() then RAISE ...; end if;"
-- de volta para "RAISE ...;". Os corpos anteriores estão no histórico de
-- migrations e podem ser lidos com pg_get_functiondef antes de aplicar.
-- ============================================================================

DO $$
DECLARE
  f       record;
  def     text;
  newdef  text;
  stmt    text;
  n_func  int := 0;
  n_cede  int := 0;
  n_mant  int := 0;
  -- Recusas cujo texto trata de proteção real: ficam ativas para todos.
  prot constant text := '(imut|organiza|exclus|consentimento|menor de idade|representante legal|token|credencial|payload|sanitiz|restrito|numera|administrador ativo|alias|can[oô]nic|fatura paga|congelad|append-only)';
  -- Funções que são proteção real do começo ao fim: não são tocadas.
  keep_whole constant text[] := array[
    'fn_block_delete','fn_crm_no_delete','fn_jornada_no_delete','fn_pesquisa_sem_exclusao','fn_biblioteca_mensagens_sem_delete',
    'fn_case_alias_imutavel','fn_catalog_audit_append_only','fn_catalog_recon_run_append_only','fn_conversion_event_imutavel',
    'fn_crm_interaction_imutavel','fn_owner_override_append_only','fn_institutional_profile_events_imutavel','fn_perfil_institucional_evento_append_only',
    'fn_proteger_ultimo_admin','fn_g08_access_log_guard','fn_portal_case_access_guard','fn_portal_access_autorizacao_guard',
    'fn_authorized_portal_email_guard','fn_documents_guard','fn_consent_guard','fn_app_projection_guard',
    'fn_integration_run_guard','fn_integration_run_pre','fn_case_codigo_canonico','fn_caso_alias_guard','fn_case_alias_guard','fn_lead_case_id_guard'];
BEGIN
  IF to_regproc('public.fn_proprietaria_operando') IS NULL THEN
    RAISE EXCEPTION 'fn_proprietaria_operando() não existe neste banco: proposta abortada, nada foi alterado.';
  END IF;

  FOR f IN
    SELECT p.oid, p.proname
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prorettype = 'trigger'::regtype
       AND p.prosrc ILIKE '%raise exception%'
       AND p.prosrc NOT ILIKE '%fn_proprietaria_operando%'
       AND p.proname <> ALL (keep_whole)
     ORDER BY p.proname
  LOOP
    def := pg_get_functiondef(f.oid);
    newdef := def;
    FOR stmt IN
      SELECT DISTINCT m[1]
        FROM regexp_matches(def,
          '(raise\s+exception\s+''(?:[^'']|'''')*''(?:[^;'']|''(?:[^'']|'''')*'')*;)', 'gi') AS m
    LOOP
      IF stmt ~* prot THEN
        n_mant := n_mant + 1;
      ELSE
        newdef := replace(newdef, stmt, 'if not public.fn_proprietaria_operando() then ' || stmt || ' end if;');
        n_cede := n_cede + 1;
      END IF;
    END LOOP;
    IF newdef <> def THEN
      EXECUTE newdef;  -- erro aqui aborta a transação inteira: nada é aplicado
      n_func := n_func + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Funções alteradas: %; recusas que cedem à proprietária: %; recusas mantidas para todos: %',
    n_func, n_cede, n_mant;
END $$;
