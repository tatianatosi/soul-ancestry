import { createServerFn } from "@tanstack/react-start";
import { comoUnico } from "@/lib/portal-vinculo";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { semFixtures } from "@/lib/fixtures";
import type { EscopoCliente } from "@/lib/app-visibilidade";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * CA-PORTAL-01 — escopo real de visibilidade do cliente autenticado.
 *
 * Sempre lê pelo client autenticado do próprio usuário (RLS decide). Nenhum
 * dado interno do Desk, nenhum exemplo normativo, nenhum seed. Na ausência de
 * fonte viva homologada, o escopo é conservador: a tela existe e mostra estado
 * seguro em vez de conteúdo presumido.
 */
export const escopoDoPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EscopoCliente> => {
    semCache();
    const supabase = context.supabase as any;

    const acesso = await supabase
      .from("client_portal_access")
      .select("id, access_level, access_status, updated_at")
      .eq("auth_user_id", context.userId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false })
      .limit(10)
      .then(comoUnico);

    // C3 (02/11/2026): erro de leitura não vira "sem acesso".
    if (acesso.error) throw new Error("Falha ao carregar o escopo do portal.");
    const temAcesso =
      !!acesso.data && acesso.data.access_status === "active" && acesso.data.access_level === "client_workspace";

    if (!temAcesso) {
      return {
        temAcesso: false,
        entregasLiberadas: 0,
        fase1Contratada: false,
        fase1Status: "nao_prevista",
        escopoIncluiFase2: false,
        fase2Status: "nao_aplicavel",
      };
    }

    const [docs, casos] = await Promise.all([
      supabase.from("documents").select("id, liberado_cliente").eq("liberado_cliente", true),
      // portal_casos não expõe is_demo (a view só tem id/codigo/titulo/...) —
      // selecionar uma coluna inexistente falhava a consulta inteira e
      // zerava "casosReais" para qualquer cliente real, sempre.
      supabase.from("portal_casos").select("id, codigo, titulo"),
    ]);

    if (docs.error || casos.error) throw new Error("Falha ao carregar o escopo do portal.");
    const entregasLiberadas = semFixtures((docs.data ?? []) as any[]).length;
    const casosReais = semFixtures((casos.data ?? []) as any[]).length;

    return {
      temAcesso: true,
      // Fase 01 acompanha a existência de caso autorizado; sem entrega liberada
      // permanece em preparação — nunca "entregue" por presunção.
      fase1Contratada: casosReais > 0,
      fase1Status: casosReais === 0 ? "nao_prevista" : entregasLiberadas > 0 ? "disponivel" : "em_preparacao",
      entregasLiberadas,
      // Fase 02 só deixa de ser "não prevista" quando houver fonte viva
      // homologada de escopo contratado. Sem ela, nada é prometido nem ofertado.
      escopoIncluiFase2: false,
      fase2Status: "nao_aplicavel",
    };
  });
