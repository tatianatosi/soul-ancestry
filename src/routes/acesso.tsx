import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { solicitarLinkAcesso } from "@/lib/portal.functions";

export const Route = createFileRoute("/acesso")({
  head: () => ({
    meta: [
      { title: "Acesso do cliente — Clube Ancestral" },
      {
        name: "description",
        content:
          "Receba um link de acesso seguro por e-mail para acompanhar sua pesquisa genealógica no Clube Ancestral.",
      },
      { property: "og:title", content: "Acesso do cliente — Clube Ancestral" },
      { property: "og:description", content: "Entrada sem senha, por link enviado ao seu e-mail autorizado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcessoPage,
});

function AcessoPage() {
  const enviar = useServerFn(solicitarLinkAcesso);
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      await enviar({ data: { email } });
    } finally {
      setCarregando(false);
      setEnviado(true);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-cream p-8 shadow-xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-navy/50">Clube Ancestral</p>
        <h1 className="mt-2 font-serif text-3xl text-navy">Acesso do cliente</h1>
        <p className="mt-3 text-sm text-navy/70">
          O acesso é feito por link enviado ao seu e-mail. Não usamos senha e não é possível criar conta por conta
          própria: o e-mail precisa ter sido autorizado previamente pela nossa equipe.
        </p>

        {enviado ? (
          <div className="mt-6 rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm text-navy">
            Se este e-mail estiver autorizado, enviamos um link de acesso. Verifique sua caixa de entrada e o spam.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-navy">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
                placeholder="voce@exemplo.com"
              />
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {carregando ? "Enviando…" : "Enviar link de acesso"}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-navy/50">
          Por segurança, nunca informamos se um e-mail está ou não cadastrado.
        </p>
      </div>
    </main>
  );
}
