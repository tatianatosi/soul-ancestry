import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandLogo } from "@/components/brand";
import { TELAS_PREVIA_DESK } from "@/components/desk/previa-desk-telas";
import { MAPA_APP_CLIENTE_KIT } from "@/lib/portal-mapa-kit";
import { COPY_TELAS } from "@/lib/portal-copy";

/**
 * Catálogo de superfícies — índice de leitura que liga cada prancha visual
 * (Desk e App Cliente) à rota real onde ela é aplicada.
 *
 * Rota pública de leitura, como /previa-desk: não lê dado de cliente, não
 * escreve nada, não cria aba de navegação. É índice do pacote visual.
 */
export const Route = createFileRoute("/catalogo-superficies")({
  head: () => ({
    meta: [
      { title: "Catálogo de superfícies — Clube Ancestral" },
      {
        name: "description",
        content:
          "Índice das superfícies do Desk Intelligence e do App Cliente do Clube Ancestral, com prévia visual e rota real de adaptação.",
      },
      { property: "og:title", content: "Catálogo de superfícies — Clube Ancestral" },
      {
        property: "og:description",
        content: "Cada prancha visual do Clube Ancestral e a rota real onde ela é aplicada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CatalogoSuperficies,
});

const cartao =
  "rounded-2xl border border-navy/10 bg-cream/50 p-4 shadow-sm transition hover:border-gold/60";

function CatalogoSuperficies() {
  return (
    <div data-visual-kit="pantone" className="min-h-screen bg-cream/40 px-4 py-8 md:px-10">
      <header className="mx-auto max-w-6xl">
        <BrandLogo className="h-10 w-auto" />
        <h1 className="ca-titulo mt-4 text-3xl text-navy">Catálogo de superfícies</h1>
        <p className="mt-2 max-w-2xl text-sm text-navy/70">
          Cada superfície aprovada, sua prévia visual e a rota real onde o layout é
          aplicado. As prévias usam conteúdo demonstrativo; as rotas reais dependem de
          login e mostram apenas dados do próprio caso.
        </p>
      </header>

      <main className="mx-auto mt-8 max-w-6xl space-y-10">
        <section>
          <h2 className="ca-titulo text-xl text-navy">
            Desk Intelligence — {TELAS_PREVIA_DESK.length} superfícies
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {TELAS_PREVIA_DESK.map((tela) => (
              <article key={tela.id} className={cartao}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-navy/45">
                  {tela.grupo}
                </p>
                <h3 className="ca-titulo mt-1 text-lg text-navy">{tela.titulo}</h3>
                <p className="mt-2 font-mono text-xs text-navy/55">Rota real: {tela.rota}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <Link
                    to="/previa-desk"
                    hash={tela.id}
                    className="rounded-full border border-navy/20 px-3 py-1 text-navy hover:bg-gold/20"
                  >
                    Ver prévia
                  </Link>
                  <a
                    href={tela.rota}
                    className="rounded-full border border-navy/20 px-3 py-1 text-navy hover:bg-gold/20"
                  >
                    Abrir rota real
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="ca-titulo text-xl text-navy">
            App Cliente — {MAPA_APP_CLIENTE_KIT.length} abas canônicas
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {MAPA_APP_CLIENTE_KIT.map((item, indice) => (
              <article key={item.aba} className={cartao}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-navy/45">
                  Aba {indice + 1}
                </p>
                <h3 className="ca-titulo mt-1 text-lg text-navy">
                  {COPY_TELAS[item.aba]?.titulo ?? item.aba}
                </h3>
                <p className="mt-2 font-mono text-xs text-navy/55">Rota real: {item.rota}</p>
                <p className="mt-1 text-xs text-navy/55">Kit: {item.kit.join(", ")}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <Link
                    to="/previa-app-cliente"
                    search={{ formato: "desktop" as const, tela: item.aba }}
                    className="rounded-full border border-navy/20 px-3 py-1 text-navy hover:bg-gold/20"
                  >
                    Ver prévia
                  </Link>
                  <a
                    href={item.rota}
                    className="rounded-full border border-navy/20 px-3 py-1 text-navy hover:bg-gold/20"
                  >
                    Abrir rota real
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
