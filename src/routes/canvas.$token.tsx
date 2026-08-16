import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCanvasPorToken } from "@/lib/crm.functions";
import { BrandLogo } from "@/components/brand";

export const Route = createFileRoute("/canvas/$token")({
  head: () => ({
    meta: [
      { title: "Canvas do seu caso — Clube Ancestral" },
      {
        name: "description",
        content: "Acompanhe as entregas e o andamento da sua pesquisa genealógica no Clube Ancestral.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Canvas do seu caso — Clube Ancestral" },
      {
        property: "og:description",
        content: "Acompanhamento individual da sua pesquisa de ancestralidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CanvasPorToken,
});

function CanvasPorToken() {
  const { token } = Route.useParams();
  const carregar = useServerFn(getCanvasPorToken);
  const { data, isLoading } = useQuery({
    queryKey: ["canvas", token],
    queryFn: () => carregar({ data: { token } }),
  });

  return (
    <div className="min-h-screen bg-cream px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <BrandLogo size={38} showText />
        {isLoading && <p className="mt-8 text-sm text-navy/60">Carregando seu acompanhamento…</p>}
        {!isLoading && !data && (
          <div className="mt-8 rounded-xl border border-border bg-white p-5 text-navy">
            <h1 className="font-serif text-2xl italic">Link indisponível</h1>
            <p className="mt-2 text-sm text-navy/70">
              Este acompanhamento ainda não está liberado. Fale com a sua consultora para receber um
              novo link.
            </p>
          </div>
        )}
        {data && (
          <div className="mt-8 space-y-5">
            <header className="rounded-xl border border-border bg-white p-5">
              <h1 className="font-serif text-3xl italic text-navy">{data.cliente_nome}</h1>
              <p className="mt-1 text-sm text-navy/70">
                {data.produto_nome ?? "Pesquisa de ancestralidade em andamento"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                {data.pais && (
                  <span className="rounded-full bg-navy px-3 py-1 text-cream">{data.pais}</span>
                )}
              </div>
              {data.ultima_atualizacao && (
                <p className="mt-3 text-[11px] text-navy/55">
                  Última atualização: {data.ultima_atualizacao}
                </p>
              )}
            </header>

            <section className="rounded-xl border border-border bg-white p-5">
              <h2 className="font-serif text-xl text-navy">Suas entregas</h2>
              <ul className="mt-3 space-y-2">
                {data.entregas.map((e) => (
                  <li key={e.id} className="rounded-lg border border-border bg-cream/40 p-3 text-navy">
                    <div className="font-medium">{e.titulo}</div>
                    {e.status && <div className="text-[12px] text-navy/65">{e.status}</div>}
                  </li>
                ))}
                {data.entregas.length === 0 && (
                  <li className="text-sm text-navy/65">
                    Estamos preparando os primeiros materiais da sua pesquisa.
                  </li>
                )}
              </ul>
            </section>

            <p className="text-[11px] text-navy/55">
              Conteúdo preliminar de pesquisa. Toda leitura depende de confirmação por documentos
              oficiais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
