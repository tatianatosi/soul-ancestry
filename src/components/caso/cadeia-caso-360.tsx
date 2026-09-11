import { Link } from "@tanstack/react-router";

import {
  montarCadeiaCaso360,
  type CamadaMontada,
  type EntradaCadeiaCaso360,
} from "@/lib/cadeia-caso-360";

const TOM: Record<CamadaMontada["estado"], string> = {
  operavel: "border-navy/15 bg-white",
  pendente: "border-gold/40 bg-gold/5",
  legado_somente: "border-navy/10 bg-cream/40",
  bloqueado: "border-terracotta/40 bg-terracotta/5",
};

const SELO: Record<CamadaMontada["estado"], string> = {
  operavel: "operável",
  pendente: "pendente",
  legado_somente: "legado — não opera",
  bloqueado: "bloqueado",
};

/**
 * Espinha do Caso 360: legado só inventaria; o planejador alimenta o caso;
 * o Desk libera; o App mostra; o WhatsApp comunica com aprovação humana.
 */
export function CadeiaCaso360({
  caseId,
  entrada,
}: {
  caseId: string;
  entrada: EntradaCadeiaCaso360;
}) {
  const cadeia = montarCadeiaCaso360(entrada);
  const pecas = cadeia.camadas.find((c) => c.id === "caso_360")?.pecas;

  return (
    <section aria-labelledby="cadeia-caso-360" className="rounded-xl border border-navy/12 bg-cream/20 p-5">
      <div className="mb-3">
        <h2 id="cadeia-caso-360" className="font-serif text-lg text-navy">
          Cadeia deste caso
        </h2>
        <p className="mt-1 text-xs text-navy/55">
          Legado → lista-alimento → catálogo do planejador → Caso 360 (produto-pai, fase, trilha, itens,
          condição particular) → Desk libera → App mostra → WhatsApp comunica. A Planilha Mestre não
          volta como fonte viva.
        </p>
      </div>

      <ol className="grid gap-2 lg:grid-cols-5">
        {cadeia.camadas.map((camada, i) => (
          <li key={camada.id} className={`rounded-lg border p-3 ${TOM[camada.estado]}`}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-navy/45">
              {i + 1}. {SELO[camada.estado]}
            </p>
            <p className="mt-1 text-sm font-medium text-navy">{camada.titulo}</p>
            <p className="mt-1 text-xs text-navy/65">{camada.resumo}</p>
          </li>
        ))}
      </ol>

      {pecas ? (
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Peca rotulo="Produto-pai" valor={pecas.produtoPai} />
          <Peca rotulo="Fase" valor={pecas.fase?.replace(/_/g, " ") ?? null} />
          <Peca rotulo="Trilha(s)" valor={pecas.trilhas.join(" · ") || null} />
          <Peca rotulo="Itens" valor={pecas.itens.join(" · ") || null} />
          <Peca rotulo="Condição particular" valor={pecas.condicaoParticular} />
        </dl>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
        <Link to="/catalogo" className="text-navy underline underline-offset-4">
          Abrir catálogo do planejador
        </Link>
        <Link to="/casos/$caseId" params={{ caseId }} hash="jornada" className="text-navy underline underline-offset-4">
          Planejador deste caso
        </Link>
        <Link
          to="/app-cliente-como-pessoa"
          search={{ casoId: caseId }}
          className="text-navy underline underline-offset-4"
        >
          O que o App mostra
        </Link>
      </div>
    </section>
  );
}

function Peca({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="text-navy/80">{valor || "—"}</dd>
    </div>
  );
}
