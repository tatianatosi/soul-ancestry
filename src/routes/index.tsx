import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { BrandLogo } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_ESPECIALISTA } from "@/lib/contato-especialista";
import { decidirAcessoDesk } from "@/lib/superficie-interna-regras";

/**
 * Árvore genealógica institucional (22/10/2026, decisão da Proprietária).
 *
 * Desenho nativo em SVG, em marinho e dourado, só como elemento de marca: não
 * representa família, caso ou dado de ninguém — por isso é decorativa e fica
 * fora da árvore de acessibilidade. Linhas finas e opacidade baixa para não
 * competir com o título.
 */
function ArvoreInstitucional() {
  const geracoes = [
    { y: 36, xs: [40, 104, 216, 280], r: 3 },
    { y: 110, xs: [72, 248], r: 4.5 },
    { y: 184, xs: [160], r: 6 },
  ];
  const ligacoes = [
    { de: [40, 36], para: [72, 110] },
    { de: [104, 36], para: [72, 110] },
    { de: [216, 36], para: [248, 110] },
    { de: [280, 36], para: [248, 110] },
    { de: [72, 110], para: [160, 184] },
    { de: [248, 110], para: [160, 184] },
  ];

  return (
    <svg
      viewBox="0 0 320 220"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className="hidden h-auto w-[320px] shrink-0 lg:block"
    >
      <g stroke="var(--navy)" strokeOpacity="0.28" strokeWidth="1" fill="none" strokeLinecap="round">
        {ligacoes.map((l) => (
          <path key={`${l.de.join()}-${l.para.join()}`} d={`M ${l.de[0]} ${l.de[1]} V ${(l.de[1] + l.para[1]) / 2} H ${l.para[0]} V ${l.para[1]}`} />
        ))}
      </g>
      {geracoes.map((g) =>
        g.xs.map((x) => (
          <circle key={`${g.y}-${x}`} cx={x} cy={g.y} r={g.r} fill="var(--gold)" fillOpacity={g.r >= 6 ? 1 : 0.55} />
        )),
      )}
      <line x1="160" y1="190" x2="160" y2="212" stroke="var(--gold)" strokeOpacity="0.45" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Clube Ancestral — Genealogia e história familiar" },
      {
        name: "description",
        content:
          "Conheça suas origens com pesquisa genealógica profissional, fontes documentadas e acompanhamento da história familiar, ancestralidade e legado no Clube Ancestral.",
      },
      { property: "og:title", content: "Clube Ancestral — Genealogia e história familiar" },
      {
        property: "og:description",
        content: "Pesquisa genealógica profissional para conhecer suas origens, documentar a história familiar e preservar seu legado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // A página inicial pública é elegível para busca por solicitação da Proprietária.
      // Esta decisão não altera autorização nem indexabilidade das áreas privadas.
      { name: "robots", content: "index, follow" },
      { property: "og:url", content: "https://soul-ancestry.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://soul-ancestry.lovable.app/" }],
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
      const { data: papeis, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", usuario.id)
        .is("archived_at", null);
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
        {/*
          22/10/2026 — decisão da Proprietária: a vitrine pública fica com dois
          botões apenas (Entrar no Clube e Falar com Especialista). A prévia da
          equipe do App Cliente saiu daqui e segue acessível dentro do Desk, em
          /app-cliente-como-pessoa; o atalho para /golive também saiu, porque
          era superfície interna exposta na vitrine.
        */}
        <section className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
              Cidadania europeia conduzida com pesquisa genealógica documentada
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-navy/75">
              O Clube Ancestral reconstrói a história da sua família a partir de fontes primárias, organiza a
              documentação necessária e acompanha cada etapa do processo com registro completo e linguagem clara.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/acesso"
                className="inline-flex min-h-11 items-center rounded-full bg-navy px-7 py-3 font-medium text-cream shadow-md transition-colors hover:bg-navy/90"
              >
                Entrar no Clube
              </Link>
              <a
                href={WHATSAPP_ESPECIALISTA.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-navy/25 px-6 py-3 font-medium text-navy transition-colors hover:border-gold"
              >
                Falar com Especialista
              </a>
            </div>
          </div>
          <ArvoreInstitucional />
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
