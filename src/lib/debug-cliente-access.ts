/**
 * Debug: Permitir staff testar como cliente de verdade.
 *
 * Reescrito por caso em 01/11/2026: o link aponta para o mecanismo oficial
 * `/app-cliente-como-pessoa?casoId=` (o admin vê o App do caso sem virar cliente),
 * e não para uma rota com id fixo. Não há mais lista de clientes de teste no código.
 *
 * Útil para:
 * - Testar a experiência do cliente
 * - Verificar se dados estão corretos
 * - Conferir fases e entregas
 * - Validar UI/UX antes de enviar para cliente real
 *
 * Segurança: Só funciona para staff logado. Token é de curta duração.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Gera o link para a equipe ver o App Cliente de um caso (para conferência).
 * Só staff. O caso vem do chamador; nada é assumido por padrão.
 */
export const gerarLinkAcessoClienteDebug = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./equipe.server");

    const staff = await h.staffPorUsuario(context.userId as string).catch(() => null);
    if (!staff) {
      throw new Error("Apenas staff pode acessar clientes para teste");
    }
    const casoId = String(data.casoId ?? "").trim();
    if (!casoId) throw new Error("Informe o caso.");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://soul-ancestry.lovable.app";
    return {
      link: `${baseUrl}/app-cliente-como-pessoa?casoId=${encodeURIComponent(casoId)}`,
      casoId,
      aviso: "Link de conferência da equipe: mostra o App como o cliente vê, sem criar acesso.",
    };
  });
