import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";

/** Leitura enxuta do núcleo do caso (leitor canônico existente; RLS do usuário). */
export const lerNucleoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const pessoas = await pessoasDoCasoComFallbackNucleo(context.supabase as any, data.caseId);
    return pessoas.map((p) => ({
      id: String(p.id),
      nome: String(p.nome ?? ""),
      parentesco: (p.parentesco as string | null) ?? null,
      papel: String(p.papel_no_caso ?? ""),
      titular: Boolean(p.titular),
    }));
  });
