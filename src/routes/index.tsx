import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { BrandLogo } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import { decidirAcessoDesk } from "@/lib/superficie-interna-regras";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clube Ancestral — Cidadania europeia com pesquisa genealógica" },
      {
        name: "description",
        content:
          "O Clube Ancestral conduz processos de cidadania europeia com pesquisa genealógica documentada, acompanhamento jurídico e transparência em cada etapa.",
      },
      { property: "og:title", content: "Clube Ancestral — Cidadania europeia com pesquisa genealógica" },
      {
        property: "og:description",
        content: "Pesquisa genealógica documentada e acompanhamento jurídico para o reconhecimento da cidadania europeia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Esta vitrine repete o conteúdo de clubeancestral.com.br, que é o site
      // canônico e o único que deve ranquear. Duas cópias do mesmo texto em
      // domínios diferentes competem entre si e diluem o resultado. O noindex
      // protege o SEO do domínio principal em vez de disputá-lo.
      //
      // Deliberadamente NÃO existe robots.txt com Disallow: bloquear a
      // varredura impediria o Google de ler este noindex, e a URL poderia
      // acabar indexada mesmo assim, sem conteúdo. Para tirar do índice de
      // verdade é preciso deixar rastrear e declarar noindex — é o que se faz
      // aqui. Com isso, todas as 81 rotas deste host passam a ter noindex.
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Home,
});

/**
 * Vitrine institucional pública (CA-UX-04).
 *
 * Nenhum componente de protótipo/mockup, dado demo, caso-modelo, rótulo interno
 * ou link para superfícies operacionais é renderizado aqui. Usuários com sessão
 * são encaminhados para a superfície correta (Desk ou App Cliente).
 */
function Home() {
  const navigate = useNavigate();

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
      void navigate({ to: decisao === "permitir" ? "/painel" : "/portal", replace: true });
    })();

    return () => {
      ativo = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="border-b border-navy/10 bg-cream">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          {/*
            O cabeçalho tem fundo creme, então o wordmark precisa da variante
            clara (navy). O padrão do componente é "client-dark", que pinta o
            texto de creme — creme sobre creme, ilegível.
          */}
          <BrandLogo size={40} showText variant="client-light" />
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/acesso" className="text-navy/70 underline-offset-4 hover:text-navy hover:underline">
              Acesso do cliente
            </Link>
            <Link
              to="/equipe/entrar"
              className="rounded-full bg-navy px-4 py-2 font-medium text-white hover:bg-navy/90"
            >
              Acesso da equipe
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-20">
          <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
            Cidadania europeia conduzida com pesquisa genealógica documentada
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-navy/75">
            O Clube Ancestral reconstrói a história da sua família a partir de fontes primárias, organiza a documentação
            necessária e acompanha cada etapa do processo com registro completo e linguagem clara.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/acesso" className="rounded-full bg-gold px-6 py-3 font-medium text-navy hover:brightness-95">
              Entrar como cliente
            </Link>
            <Link
              to="/previa-desk"
              className="rounded-full border border-navy/25 px-6 py-3 font-medium text-navy hover:bg-cream"
            >
              Ver prévia das telas
            </Link>
          </div>
        </section>

        <section className="border-y border-navy/10 bg-cream/60">
          <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-3">
            {[
              {
                titulo: "Pesquisa genealógica",
                texto:
                  "Levantamento em arquivos civis, eclesiásticos e de imigração, com registro da origem de cada documento.",
              },
              {
                titulo: "Documentação organizada",
                texto:
                  "Certidões, retificações e traduções acompanhadas de forma centralizada, com histórico de cada etapa.",
              },
              {
                titulo: "Acompanhamento transparente",
                texto:
                  "Você acompanha o andamento do seu processo em uma área exclusiva, sempre com informação verificada.",
              },
            ].map((item) => (
              <article key={item.titulo}>
                <h2 className="font-serif text-xl">{item.titulo}</h2>
                <p className="mt-3 text-sm leading-relaxed text-navy/70">{item.texto}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-navy/60">
        © {new Date().getFullYear()} Clube Ancestral
      </footer>
    </div>
  );
}
