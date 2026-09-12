import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { BrandLogo } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";

/** Cliente autenticado, porém sem autorização vigente no portal. Nunca envia para telas de equipe. */
export const Route = createFileRoute("/acesso/sem-permissao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acesso indisponível — Clube Ancestral" },
      { name: "description", content: "Seu acesso ao portal do cliente não está liberado no momento." },
      { property: "og:title", content: "Acesso indisponível — Clube Ancestral" },
      { property: "og:description", content: "Fale com a sua consultora para liberar o acompanhamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SemPermissaoCliente,
});

function SemPermissaoCliente() {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/acesso", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-cream/50 p-6 text-navy">
        <BrandLogo size={40} variant="client-light" showText />
        <h1 className="mt-6 font-serif text-2xl italic">Acesso indisponível</h1>
        <p className="mt-2 text-sm text-navy/70">
          Sua autenticação funcionou, mas ainda não há liberação ativa para este e-mail. Fale com a sua
          consultora para reativar o acompanhamento.
        </p>
        <button onClick={sair} className="mt-6 w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-medium text-cream">
          Sair e voltar ao acesso
        </button>
        <Link to="/acesso" className="mt-3 block text-center text-xs text-navy/55 underline underline-offset-4">
          Solicitar novo link de acesso
        </Link>
      </div>
    </main>
  );
}
