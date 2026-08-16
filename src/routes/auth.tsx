import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Clube Ancestral" },
      {
        name: "description",
        content: "Acesso restrito à plataforma de gestão de pesquisa genealógica do Clube Ancestral.",
      },
      { property: "og:title", content: "Entrar — Clube Ancestral" },
      { property: "og:description", content: "Área autenticada da plataforma Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/painel", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: `${window.location.origin}/painel`,
            data: { nome },
          },
        });
        if (error) throw error;
        setMsg("Conta criada. Confirme o e-mail enviado para concluir o acesso.");
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-cream p-7 shadow-xl">
        <p className="font-serif text-3xl text-navy">Clube Ancestral</p>
        <p className="mt-1 text-sm text-navy/60">
          Plataforma interna de pesquisa genealógica e jornada de dupla cidadania.
        </p>

        <form onSubmit={enviar} className="mt-6 space-y-3">
          {modo === "criar" ? (
            <label className="block text-sm">
              <span className="mb-1 block text-navy/70">Nome</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2"
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block text-navy/70">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-navy/70">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-navy/20 bg-white px-3 py-2"
            />
          </label>

          {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
          {msg ? <p className="text-sm text-sage">{msg}</p> : null}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-navy px-3 py-2.5 text-sm font-medium text-cream disabled:opacity-60"
          >
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
          className="mt-4 w-full text-center text-sm text-navy/60 underline"
        >
          {modo === "entrar" ? "Não tenho conta" : "Já tenho conta"}
        </button>

        <p className="mt-6 rounded-lg bg-gold/15 p-3 text-xs text-navy/70">
          Ambiente com dados sensíveis de clientes e famílias. Acesso individual, por papel e isolado por
          organização. Conteúdo de demonstração é fictício e sinalizado como DEMO.
        </p>
      </div>
    </div>
  );
}
