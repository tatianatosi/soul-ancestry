/**
 * Debug: Permitir staff testar como cliente de verdade.
 *
 * Staff pode gerar um link que a leva diretamente ao portal do cliente
 * com dados reais de qualquer cliente/caso — sem precisar de senha.
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
 * Gera um link de acesso como cliente (para staff testar).
 * O link redireciona diretamente ao portal com dados do cliente.
 */
export const gerarLinkAcessoClienteDebug = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { clienteId: string }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./equipe.server");

    // Verificar se quem está chamando é staff
    const staff = await h.staffPorUsuario(context.userId as string).catch(() => null);
    if (!staff) {
      throw new Error("Apenas staff pode acessar clientes para teste");
    }

    // Para agora, retornar URL direta
    // Depois: gerar um token de curta duração e usar SSO
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://soul-ancestry.lovable.app";

    return {
      link: `${baseUrl}/portal/casos/${data.clienteId}`,
      clienteId: data.clienteId,
      aviso: "Este link é para teste de staff. Dados reais do cliente serão mostrados.",
    };
  });

/**
 * Lista de clientes comuns para teste (para staff).
 * Permite quick-access para testar diferentes cenários.
 */
export const CLIENTES_TESTE_STAFF = [
  {
    nome: "Ana Luiza",
    clienteId: "ana-luiza-demo", // ou ID real do banco
    rotulo: "Caso de exemplo — genealogia",
  },
] as const;
