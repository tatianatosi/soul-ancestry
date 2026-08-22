/**
 * Registro de ato praticado em nome do cliente perante instituição externa.
 *
 * Nada é enviado, assinado, cobrado ou pesquisado aqui: a função apenas
 * verifica, no servidor, os anexos exigidos (III e IV) e registra a intenção
 * para revisão humana. Sem Anexo IV vigente o servidor recusa.
 */

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { orgDoUsuario } from "@/lib/cadeia-formalizacao.server";
import { exigirAnexosDeAcaoExterna } from "@/lib/anexos-persistidos.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const verificarAtoEmNomeDoCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; descricao: string }) => {
    if (!d.caseId) throw new Error("Informe o caso.");
    if (!d.descricao || d.descricao.trim().length < 10) {
      throw new Error("Descreva o ato pretendido (mínimo de 10 caracteres).");
    }
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const org = await orgDoUsuario(supabase, context.userId as string);
    await exigirAnexosDeAcaoExterna(supabase, {
      organizationId: org,
      caseId: data.caseId,
      acao: "ato_em_nome_do_cliente",
    });
    return { liberado: true, descricao: data.descricao.trim().slice(0, 300) };
  });
