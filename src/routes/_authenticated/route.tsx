import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { decidirAcessoDesk } from "@/lib/superficie-interna-regras";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";

export const Route = createFileRoute("/_authenticated")({
  staticData: { sitemap: "exclude-subtree" },
  ssr: false,
  errorComponent: ({ error, reset }) => <ErroSuperficieDesk error={error as Error} reset={reset} />,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    let usuario = !error && data.user ? data.user : null;
    if (!usuario) {
      // Falha de rede não é ausência de sessão: só redireciona quando não há
      // sessão persistida no navegador.
      const { data: sessao } = await supabase.auth.getSession();
      usuario = sessao.session?.user ?? null;
    }
    if (!usuario) throw redirect({ to: "/equipe/entrar" });

    // Autenticar não é autorizar: cliente de link mágico não entra no Desk por URL.
    const { data: papeis, error: erroPapeis } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", usuario.id)
      .is("archived_at", null);
    const decisao = decidirAcessoDesk({
      autenticado: true,
      papeis: (papeis ?? []).map((p) => p.role as string),
      erroLeitura: Boolean(erroPapeis),
    });
    if (decisao === "portal") throw redirect({ to: "/portal" });

    return { user: usuario };
  },
  component: () => <Outlet />,
});
