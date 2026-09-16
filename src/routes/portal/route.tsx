import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Portão do portal do cliente. Autenticar não é autorizar:
 * a autorização real é validada por RLS no banco a cada leitura.
 *
 * 16/09/2026 — uma única leitura de sessão tratava falha momentânea de rede
 * (ou renovação de token em andamento) como "sem sessão" e devolvia a família
 * para /acesso sem explicação. Só expulsa depois da segunda leitura, igual à
 * porta do Desk.
 */
export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    let usuario = !error && data.user ? data.user : null;
    if (!usuario) {
      const { data: sessao } = await supabase.auth.getSession();
      usuario = sessao.session?.user ?? null;
    }
    if (!usuario) throw redirect({ to: "/acesso" });
    return { user: usuario };
  },
  component: () => <Outlet />,
});
