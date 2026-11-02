import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizarCodigo, type ResultadoBuscaCaso } from "@/lib/caso-busca";

/**
 * Localiza o caso canônico a partir do código canônico OU de um identificador
 * histórico registrado em case_aliases. Somente leitura: nenhum registro é criado.
 */
export const resolverCasoPorCodigo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { termo: string }) => data)
  .handler(async ({ data, context }): Promise<ResultadoBuscaCaso | null> => {
    const supabase = context.supabase;
    const termo = normalizarCodigo(data.termo ?? "");
    if (!termo) return null;

    const direto = await supabase
      .from("crm_casos")
      .select("id, codigo, titulo")
      .eq("codigo", termo)
      .maybeSingle();

    if (direto.data) {
      return {
        caseId: direto.data.id as string,
        codigoCanonico: direto.data.codigo as string,
        titulo: (direto.data.titulo as string) ?? null,
        termo,
        viaAlias: false,
        aliasUsado: null,
      };
    }

    const alias = await supabase
      .from("case_aliases")
      .select("alias, case_id")
      .eq("alias", termo)
      .maybeSingle();

    if (!alias.data) return null;

    const caso = await supabase
      .from("crm_casos")
      .select("id, codigo, titulo")
      .eq("id", alias.data.case_id)
      .maybeSingle();

    if (!caso.data) return null;

    return {
      caseId: caso.data.id as string,
      codigoCanonico: caso.data.codigo as string,
      titulo: (caso.data.titulo as string) ?? null,
      termo,
      viaAlias: true,
      aliasUsado: alias.data.alias as string,
    };
  });
