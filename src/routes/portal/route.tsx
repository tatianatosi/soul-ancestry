import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Portão do portal do cliente. Autenticar não é autorizar:
 * a autorização real é validada por RLS no banco a cada leitura.
 */
export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/acesso" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
