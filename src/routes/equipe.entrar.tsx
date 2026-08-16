import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { confirmarSessaoEquipe, prepararLoginEquipe } from "@/lib/equipe.functions";
import { EquipeMoldura } from "@/components/equipe/moldura";

export const Route = createFileRoute("/equipe/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Equipe Clube Ancestral" },
      { name: "description", content: "Acesso restrito da equipe interna do Clube Ancestral." },
      { property: "og:title", content: "Entrar — Equipe Clube Ancestral" },
      { property: "og:description", content: "Área exclusiva da equipe Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EntrarEquipe,
});

const ERRO_NEUTRO = "Não foi possível entrar. Verifique os dados e tente novamente.";

function EntrarEquipe() {
  const navigate = useNavigate();
  const preparar = useServerFn(prepararLoginEquipe);
  const confirmar = useServerFn(confirmarSessaoEquipe);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const limite = await preparar({ data: { email } });
      if (limite.bloqueado) {
        setErro("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
      if (error) {
        setErro(ERRO_NEUTRO);
        return;
      }
      const r = await confirmar({});
      if (!r.autorizado) {
        navigate({ to: "/equipe/sem-permissao", replace: true });
        return;
      }
      navigate({ to: "/painel", replace: true });
    } catch {
      setErro(ERRO_NEUTRO);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <EquipeMoldura titulo="Entrar" subtitulo="Área exclusiva da equipe Clube Ancestral.">
      <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-navy">
            E-mail corporativo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="senha" className="text-sm font-medium text-navy">
            Senha
          </label>
          <input
            id="senha"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
          />
        </div>
        {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-sm">
        <Link to="/equipe/esqueci-minha-senha" className="block text-navy/70 underline underline-offset-4">
          Esqueci minha senha
        </Link>
        <Link to="/acesso" className="block text-navy/50 underline underline-offset-4">
          Sou cliente e recebi um link de acesso
        </Link>
      </div>
      <p className="mt-5 text-xs text-navy/50">
        Não há autocadastro: contas internas são criadas apenas por um administrador.
      </p>
    </EquipeMoldura>
  );
}
