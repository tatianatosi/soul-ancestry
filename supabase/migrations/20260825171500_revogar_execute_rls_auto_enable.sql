-- Fecha o achado do linter do Supabase (25/08/2026):
--   anon_security_definer_function_executable
--   authenticated_security_definer_function_executable
--
-- `public.rls_auto_enable()` é SECURITY DEFINER e está exposta em
-- /rest/v1/rpc/rls_auto_enable para os papéis `anon` e `authenticated`. Ou
-- seja: qualquer pessoa, sem sessão, pode invocá-la, e ela roda com os
-- privilégios de quem a definiu.
--
-- Esta função não tem migration neste repositório nem referência no código —
-- foi criada fora do repo (provavelmente pela automação do Lovable Cloud).
-- Não sendo possível auditar o corpo dela aqui, o tratamento seguro é o mesmo
-- já aplicado a toda função de guarda do projeto: nenhuma função SECURITY
-- DEFINER de infraestrutura é chamável por papel de cliente.
--
-- Revogar EXECUTE de anon/authenticated não impede que a automação de
-- plataforma a use: essa automação atua pelo papel de serviço, que não é
-- alcançado por este REVOKE.
--
-- Idempotente e defensiva: se a função não existir no ambiente, não falha.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'rls_auto_enable'
      AND p.pronargs = 0
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END
$$;
