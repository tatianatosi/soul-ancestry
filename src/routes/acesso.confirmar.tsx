import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand";
import { confirmarAcessoPortal } from "@/lib/portal.functions";

export const Route = createFileRoute("/acesso/confirmar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Confirmando acesso — Clube Ancestral" },
      { name: "description", content: "Validação do link de acesso do cliente ao portal do Clube Ancestral." },
      { property: "og:title", content: "Confirmando acesso — Clube Ancestral" },
      { property: "og:description", content: "Validando seu link de acesso seguro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmarPage,
});

function ConfirmarPage() {
  const navigate = useNavigate();
  const confirmar = useServerFn(confirmarAcessoPortal);
  const [estado, setEstado] = useState<"validando" | "negado">("validando");

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // aguarda o Supabase processar o link mágico da URL
        await new Promise((r) => setTimeout(r, 1200));
      }
      const sessao = (await supabase.auth.getSession()).data.session;
      if (!sessao) {
        if (!cancelado) setEstado("negado");
        return;
      }
      try {
        const r = await confirmar({});
        if (cancelado) return;
        if (r.autorizado && r.destino) navigate({ to: r.destino, replace: true });
        else setEstado("negado");
      } catch {
        if (!cancelado) setEstado("negado");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [confirmar, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md rounded-2xl bg-cream p-8 text-center shadow-xl">
        {estado === "validando" ? (
          <>
            <h1 className="font-serif text-2xl text-navy">Validando seu acesso…</h1>
            <p className="mt-2 text-sm text-navy/70">Confirmando autorização e casos liberados.</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-navy">Não foi possível liberar o acesso</h1>
            <p className="mt-2 text-sm text-navy/70">
              Seu link pode ter expirado ou o acesso ainda não está liberado pela equipe. Solicite um novo link.
            </p>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/acesso", replace: true });
              }}
              className="mt-5 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream"
            >
              Solicitar novo link
            </button>
          </>
        )}
      </div>
    </main>
  );
}
