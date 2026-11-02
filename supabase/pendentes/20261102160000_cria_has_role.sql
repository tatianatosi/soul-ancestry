-- ESTADO: JÁ APLICADO em 02/11/2026 pelo Lovable Cloud (autorização da Proprietária: "autorizo has a rolê no Lovable").
-- Conferido antes (has_role = 0 funções, 3 triggers dependentes) e depois (1 função, SECURITY DEFINER, anon sem execute,
-- authenticated com execute, true para a admin real e false para uuid inexistente).
-- Auditoria do Cartographer (02/11/2026), segmento banco-esquema-rls, P1-1.
--
-- O que faz: cria `public.has_role(uuid, app_role)`, função que NÃO existe no banco vivo (pg_proc = 0,
-- conferido em 02/11/2026) mas é chamada por três triggers: fn_atendimento_entrega_guard (publicar entrega
-- de documento ao cliente), fn_atendimento_fatura_guard (liberar ou ocultar fatura) e
-- fn_contracts_signature_guard (assinatura externa sem arquivo). Sem a função, esses três caminhos falham
-- com "function public.has_role does not exist" para qualquer usuário, inclusive a admin, e o erro acontece
-- antes de `fn_proprietaria_operando()`. É a causa de "não consigo publicar entrega nem liberar fatura".
--
-- Idempotente: `create or replace function`, `revoke`/`grant` repetíveis. Não altera dado, não apaga nada.
-- Ignora papéis arquivados (`archived_at is not null`), como as demais funções de papel.
--
-- Não resolve sozinha: não despublica os 3 documentos da Ana (isso é o botão "Retirar do App" do Desk) e
-- não cria o acesso da Ana ao portal.
--
-- Conferir antes:  select count(*) from pg_proc where proname = 'has_role' and pronamespace = 'public'::regnamespace;  -- 0
-- Conferir depois: select public.has_role('92fa5a0c-0000-0000-0000-000000000000'::uuid, 'admin'); -- trocar pelo uid real da admin; deve dar true

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.user_roles r
     where r.user_id = _user_id
       and r.role = _role
       and r.archived_at is null
  );
$$;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
