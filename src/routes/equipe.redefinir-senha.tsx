import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { EquipeMoldura } from "@/components/equipe/moldura";
import { supabase } from "@/integrations/supabase/client";
import { concluirRedefinicaoSenha } from "@/lib/equipe.functions";

export const Route = createFileRoute("/equipe/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Definir senha — Equipe Clube Ancestral" },
      { name: "description", content: "Definição de nova senha para contas internas do Clube Ancestral." },
      { property: "og:title", content: "Definir senha — Equipe Clube Ancestral" },
      { property: "og:description", content: "Crie uma nova senha para sua conta interna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RedefinirSenha,
});

function senhaValida(s: string) {
  return s.length >= 12 && /[A-Za-z]/.test(s) && /[0-9]/.test(s);
}

function RedefinirSenha() {
  const navigate = useNavigate();
  const concluir = useServerFn(concluirRedefinicaoSenha);
  const [pronto, setPronto] = useState(false);
  const [semLink, setSemLink] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      let sessao = (await supabase.auth.getSession()).data.session;
      if (!sessao) {
        await new Promise((r) => setTimeout(r, 1200));
        sessao = (await supabase.auth.getSession()).data.session;
      }
      if (cancelado) return;
      if (sessao) setPronto(true);
      else setSemLink(true);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!senhaValida(senha)) {
      setErro("A senha precisa ter ao menos 12 caracteres, com letras e números.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não conferem.");
      return;
    }
    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        setErro("Não foi possível concluir. Solicite um novo link e tente novamente.");
        return;
      }
      await concluir({});
      await supabase.auth.signOut();
      setOk(true);
      setTimeout(() => navigate({ to: "/equipe/entrar", replace: true }), 1800);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <EquipeMoldura titulo="Definir nova senha" subtitulo="Área exclusiva da equipe Clube Ancestral.">
      {ok ? (
        <div className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm text-navy">
          Senha atualizada. Faça login novamente com a nova senha.
        </div>
      ) : semLink ? (
        <div className="space-y-4">
          <p className="text-sm text-navy/70">
            Link inválido ou expirado. Solicite um novo link de definição de senha.
          </p>
          <Link
            to="/equipe/esqueci-minha-senha"
            className="inline-block rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream"
          >
            Solicitar novo link
          </Link>
        </div>
      ) : !pronto ? (
        <p className="text-sm text-navy/60">Validando link…</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label htmlFor="senha" className="text-sm font-medium text-navy">
              Nova senha
            </label>
            <input
              id="senha"
              name="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
            />
            <p className="mt-1 text-xs text-navy/50">Mínimo de 12 caracteres, com letras e números.</p>
          </div>
          <div>
            <label htmlFor="confirmacao" className="text-sm font-medium text-navy">
              Confirmar senha
            </label>
            <input
              id="confirmacao"
              name="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy/20 bg-white px-3 py-2 text-navy outline-none focus:border-gold"
            />
          </div>
          {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-navy px-4 py-2.5 font-medium text-cream disabled:opacity-60"
          >
            {carregando ? "Salvando…" : "Salvar senha"}
          </button>
        </form>
      )}
    </EquipeMoldura>
  );
}
