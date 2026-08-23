import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppSwitcher } from "@/components/brand";
import { ClienteApp } from "@/components/cliente-app";
import { DeskApp } from "@/components/desk-app";
import { supabase } from "@/integrations/supabase/client";
import { SuperficieInternaProvider, useSessaoInterna } from "@/lib/superficie-interna";
import { decidirAcessoDesk } from "@/lib/superficie-interna-regras";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { caso?: string } => ({
    caso: typeof search["caso"] === "string" ? search["caso"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Clube Ancestral — App Cliente e Desk Intelligence" },
      {
        name: "description",
        content:
          "Navegue pelas telas do Clube Ancestral: jornada do cliente na cidadania europeia e o Desk Intelligence da equipe.",
      },
      { property: "og:title", content: "Clube Ancestral — App Cliente e Desk Intelligence" },
      {
        property: "og:description",
        content: "Telas navegáveis da jornada do cliente e do painel interno de pesquisa genealógica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [app, setApp] = useState<"cliente" | "desk">("cliente");
  const navigate = useNavigate();
  const interna = useSessaoInterna();

  useEffect(() => {
    let ativo = true;

    void (async () => {
      const { data } = await supabase.auth.getUser();
      const usuario = data.user;
      if (!ativo || !usuario) return;
      const { data: papeis, error } = await supabase.from("user_roles").select("role").eq("user_id", usuario.id);
      if (!ativo) return;
      const decisao = decidirAcessoDesk({
        autenticado: true,
        papeis: (papeis ?? []).map((p) => p.role as string),
        erroLeitura: Boolean(error),
      });
      // Cliente autenticado por link mágico vai para o App Cliente, nunca para o Desk.
      void navigate({ to: decisao === "permitir" ? "/painel" : "/portal", replace: true });
    })();


    return () => {
      ativo = false;
    };
  }, [navigate]);

  return (
    <SuperficieInternaProvider valor={interna}>
      <div className="min-h-screen bg-cream">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-navy px-4 py-2 text-center text-[11px] uppercase tracking-widest text-cream/80">
          <span>Demonstração / dados não operacionais</span>
          {interna && (
            <Link to="/painel" className="text-gold underline-offset-2 hover:underline">
              Módulos internos (novos)
            </Link>
          )}
          <Link to="/equipe/entrar" className="text-gold underline-offset-2 hover:underline">
            Acesso da equipe
          </Link>
          <Link to="/acesso" className="text-gold underline-offset-2 hover:underline">
            Acesso do cliente
          </Link>
        </div>

        {interna && <AppSwitcher current={app} onChange={setApp} />}
        {interna && app === "desk" ? <DeskApp /> : <ClienteApp />}
      </div>
    </SuperficieInternaProvider>
  );
}
