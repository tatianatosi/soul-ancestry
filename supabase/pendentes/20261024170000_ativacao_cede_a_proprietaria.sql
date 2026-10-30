-- ============================================================================
-- Ativação de caso cede à proprietária — remove os dois portões que sobraram
-- Proposta de 24/10/2026. APLICADA PELO LOVABLE (comando L1), nunca pelo Claude Code.
-- ESTADO: JÁ APLICADO em 25/10/2026 — ver supabase/pendentes/README.md.
--
-- Objetivo: a Proprietária (staff_access role=admin, status=active) pode ativar
-- um caso mesmo com pendências de onboarding, como ela pediu várias vezes.
--
-- Contexto: em 05/09/2026 ela autorizou, expressamente e com ressalva do risco
-- legal, que 27 guards de "cerimônia de processo" cedessem a ela
-- (migration 20260905210000 / 20260923180000, helper fn_proprietaria_operando()).
-- Dois guards de ATIVAÇÃO ficaram de fora e são os que ainda recusam o caso:
--   1. fn_piloto_caso_guard  → "Ativação operacional NO_GO" por 19 linhas de
--                              piloto_bloqueios (critico/aberto, paradas desde agosto)
--   2. fn_guard_ativacao     → "Ativação bloqueada. Requisitos pendentes" (checklist)
--
-- O que muda: SÓ a recusa por pendência. Fica exatamente como está:
--   - proteção de caso real: piloto não pode ser demo / cliente demo / org DEMO
--   - fn_guard_ativacao: papel admin/operacoes, carimbos de ativação, motivo de pausa
--   - todos os outros guards (isolamento de organização, cobrança, assinatura,
--     fronteira do App Cliente) — não são tocados aqui.
--
-- Não apaga nem altera dado. Não mexe em piloto_bloqueios (os 19 continuam lá,
-- como registro, sem impedir nada). Idempotente (CREATE OR REPLACE).
--
-- ANTES DE APLICAR (o Lovable confere, e este arquivo também confere sozinho):
--   select pg_get_functiondef('public.fn_piloto_caso_guard'::regproc);
--   select pg_get_functiondef('public.fn_guard_ativacao'::regproc);
-- Se o corpo atual for diferente do esperado, o bloco DO abaixo ABORTA sem alterar nada.
--
-- VERIFICAÇÃO DEPOIS:
--   select position('fn_proprietaria_operando' in pg_get_functiondef('public.fn_piloto_caso_guard'::regproc)) > 0 as piloto_cede,
--          position('fn_proprietaria_operando' in pg_get_functiondef('public.fn_guard_ativacao'::regproc)) > 0 as ativacao_cede;
--   -- esperado: true, true
--
-- REVERSÃO: recriar as duas funções sem a condição "and not public.fn_proprietaria_operando()"
-- (corpos originais: migrations 20260816232935 e 20260816191148).
-- ============================================================================

DO $$
DECLARE d1 text; d2 text;
BEGIN
  IF to_regprocedure('public.fn_proprietaria_operando()') IS NULL THEN
    RAISE EXCEPTION 'ABORTADO: fn_proprietaria_operando() não existe neste banco. Nada foi alterado.';
  END IF;
  IF to_regprocedure('public.fn_piloto_caso_guard()') IS NULL OR to_regprocedure('public.fn_guard_ativacao()') IS NULL THEN
    RAISE EXCEPTION 'ABORTADO: um dos dois guards não existe neste banco. Nada foi alterado.';
  END IF;
  d1 := pg_get_functiondef('public.fn_piloto_caso_guard()'::regprocedure);
  d2 := pg_get_functiondef('public.fn_guard_ativacao()'::regprocedure);
  IF position('Ativação operacional NO_GO' in d1) = 0 OR position('piloto_bloqueios' in d1) = 0 THEN
    RAISE EXCEPTION 'ABORTADO: o corpo atual de fn_piloto_caso_guard difere do esperado. Mostre ao Claude antes de aplicar.';
  END IF;
  IF position('Requisitos pendentes' in d2) = 0 OR position('case_activation_pendencias' in d2) = 0 THEN
    RAISE EXCEPTION 'ABORTADO: o corpo atual de fn_guard_ativacao difere do esperado. Mostre ao Claude antes de aplicar.';
  END IF;
END $$;

-- 1. Piloto: o NO_GO por bloqueios abertos cede à proprietária; as proteções de caso real ficam.
CREATE OR REPLACE FUNCTION public.fn_piloto_caso_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_abertos text;
begin
  if NEW.piloto then
    if NEW.demo then
      raise exception 'O caso piloto real não pode ser marcado como demonstração.';
    end if;
    if exists (select 1 from public.clientes c where c.id = NEW.cliente_id and c.demo) then
      raise exception 'O caso piloto real não pode ser vinculado a um cliente de demonstração.';
    end if;
    if exists (select 1 from public.organizations o where o.id = NEW.organization_id and o.nome ilike 'DEMO%') then
      raise exception 'O caso piloto real não pode pertencer a uma organização de demonstração.';
    end if;

    if (NEW.ativo and not coalesce(OLD.ativo,false)) or (NEW.status = 'ativo' and coalesce(OLD.status,'') <> 'ativo') then
      select string_agg(b.descricao, '; ') into v_abertos
        from public.piloto_bloqueios b
       where b.case_id = NEW.id and b.status = 'aberto' and b.criticidade = 'critico' and b.archived_at is null;
      if v_abertos is not null and not public.fn_proprietaria_operando() then
        raise exception 'Ativação operacional NO_GO. Bloqueios críticos abertos: %', v_abertos;
      end if;
    end if;
  end if;
  return NEW;
end $function$;

-- 2. Ativação: a recusa por "requisitos pendentes" cede à proprietária; papel, carimbos e pausa ficam.
CREATE OR REPLACE FUNCTION public.fn_guard_ativacao()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare v_pend text;
begin
  if (NEW.ativo and not coalesce(OLD.ativo,false)) or (NEW.status = 'ativo' and coalesce(OLD.status,'') <> 'ativo') then
    if not (public.has_org_role(NEW.organization_id,'admin') or public.has_org_role(NEW.organization_id,'operacoes')) then
      raise exception 'Somente admin ou operações podem ativar um caso.';
    end if;
    select string_agg(p.label, '; ') into v_pend from public.case_activation_pendencias(NEW.id) p;
    if v_pend is not null and not public.fn_proprietaria_operando() then
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
end $function$;
