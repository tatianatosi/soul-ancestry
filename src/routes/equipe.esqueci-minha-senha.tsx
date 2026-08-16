import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EquipeMoldura } from "@/components/equipe/moldura";
import { recuperarSenhaEquipe } from "@/lib/equipe.functions";

export const Route = createFileRoute("/equipe/esqueci-minha-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Equipe Clube Ancestral" },
      { name: "description", content: "Recuperação de senha para a equipe interna do Clube Ancestral." },
      { property: "og:title", content: "Recuperar senha — Equipe Clube Ancestral" },
      { property: "og:description", content: "Enviamos instruções para contas internas autorizadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EsqueciSenha,
});

function EsqueciSenha() {
  const enviar = useServerFn(recuperarSenhaEquipe);
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
    <EquipeMoldura titulo="Recuperar senha" subtitulo="Área exclusiva da equipe Clube Ancestral.">
      {enviado ? (
        <div className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm text-navy">
          Se houver uma conta autorizada para este e-mail, enviaremos instruções.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-navy">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
            />
          </div>
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream disabled:opacity-60"
          >
            {carregando ? "Enviando…" : "Enviar instruções"}
          </button>
        </form>
      )}
      <div className="mt-5 space-y-2 text-sm">
        <Link to="/equipe/entrar" className="block text-navy/70 underline underline-offset-4">
          Voltar ao login da equipe
        </Link>
        <Link to="/acesso" className="block text-navy/50 underline underline-offset-4">
          Sou cliente e recebi um link de acesso
        </Link>
      </div>
    </EquipeMoldura>
  );
}
