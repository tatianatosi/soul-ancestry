import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) return { user: data.user };
    // Falha de rede não é ausência de sessão: só redireciona quando não há
    // sessão persistida no navegador.
    const { data: sessao } = await supabase.auth.getSession();
    if (sessao.session?.user) return { user: sessao.session.user };
    throw redirect({ to: "/equipe/entrar" });
  },
  component: () => <Outlet />,
});
