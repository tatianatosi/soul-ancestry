import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ESTADO_EIXO_LABEL, ESTADO_EIXO_TOM, type EixoRadar } from "@/lib/radar-eixos";

export type ContextoRadarInterno = {
  caseId: string;
  status: string;
  prioridade: string;
  urgencia: string;
  elegibilidade: string;
  responsavel: string;
  prazo: string;
  proximaAcao: string;
  bloqueios: string;
};

const NIVEL_ESTADO = {
  identificado: 92,
  em_confirmacao: 62,
  proxima_etapa: 34,
} as const;

function ponto(angulo: number, nivel: number): [number, number] {
  const raio = (nivel / 100) * 76;
  const rad = ((angulo - 90) * Math.PI) / 180;
  return [100 + Math.cos(rad) * raio, 100 + Math.sin(rad) * raio];
}

function GraficoRadarIndividual({ eixos }: { eixos: EixoRadar[] }) {
  const angulos = [0, 90, 180, 270];
  const pontos = eixos
    .map((eixo, indice) => ponto(angulos[indice] ?? 0, NIVEL_ESTADO[eixo.estado]).join(","))
    .join(" ");

  return (
    <figure className="rounded-lg border border-navy/10 bg-cream/50 p-4">
      <figcaption className="mb-2 font-serif text-base text-navy">Leitura comparativa dos 4 eixos</figcaption>
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label="Radar Individual com História, Documentos, Estratégia e Próximos"
        className="mx-auto aspect-square w-full max-w-[320px] text-navy"
      >
        {[76, 52, 28].map((raio) => (
          <circle key={raio} cx="100" cy="100" r={raio} fill="none" stroke="currentColor" strokeOpacity="0.13" />
        ))}
        <line x1="100" y1="24" x2="100" y2="176" stroke="currentColor" strokeOpacity="0.16" />
        <line x1="24" y1="100" x2="176" y2="100" stroke="currentColor" strokeOpacity="0.16" />
        <polygon points={pontos} className="fill-gold/25 stroke-terracotta" strokeWidth="2" />
        {eixos.map((eixo, indice) => {
          const [x, y] = ponto(angulos[indice] ?? 0, NIVEL_ESTADO[eixo.estado]);
          return <circle key={eixo.id} cx={x} cy={y} r="4" className="fill-terracotta" />;
        })}
        <text x="100" y="14" textAnchor="middle" className="fill-navy text-[8px]">História</text>
        <text x="190" y="103" textAnchor="end" className="fill-navy text-[8px]">Documentos</text>
        <text x="100" y="195" textAnchor="middle" className="fill-navy text-[8px]">Estratégia</text>
        <text x="10" y="103" className="fill-navy text-[8px]">Próximos</text>
      </svg>
      <p className="mt-2 text-center text-[11px] text-navy/55">
        Leitura operacional baseada nos registros do caso; não é parecer jurídico.
      </p>
    </figure>
  );
}

/**
 * Radar Individual (micro) do caso — ver src/lib/radar-interno-caso.ts para
 * a taxonomia (mesmos 4 eixos do Radar do cliente) e a fonte de cada campo.
 */
export function RadarInternoCaso({
  eixos,
  contexto,
}: {
  eixos: EixoRadar[];
  contexto?: ContextoRadarInterno;
}) {
  return (
    <div className="space-y-4">
      {contexto ? (
        <section className="rounded-lg border border-navy/10 bg-cream/50 p-4" aria-label="Status e ações do Radar Individual">
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-navy/50">Status do caso</dt><dd className="font-medium text-navy">{contexto.status}</dd></div>
            <div><dt className="text-navy/50">Prioridade</dt><dd className="font-medium text-navy">{contexto.prioridade}</dd></div>
            <div><dt className="text-navy/50">Urgência</dt><dd className="font-medium text-navy">{contexto.urgencia}</dd></div>
            <div><dt className="text-navy/50">Elegibilidade</dt><dd className="font-medium text-navy">{contexto.elegibilidade}</dd></div>
            <div><dt className="text-navy/50">Responsável</dt><dd className="font-medium text-navy">{contexto.responsavel}</dd></div>
            <div><dt className="text-navy/50">Prazo</dt><dd className="font-medium text-navy">{contexto.prazo}</dd></div>
            <div className="sm:col-span-2"><dt className="text-navy/50">Próxima ação</dt><dd className="font-medium text-navy">{contexto.proximaAcao}</dd></div>
            <div className="sm:col-span-2 lg:col-span-4"><dt className="text-navy/50">Bloqueios reais</dt><dd className="font-medium text-navy">{contexto.bloqueios}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/casos/$caseId" params={{ caseId: contexto.caseId }} hash="secao-visao">
                Abrir Caso 360
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/casos/$caseId" params={{ caseId: contexto.caseId }} hash="secao-jornada">
                Ver jornada e ações
              </Link>
            </Button>
          </div>
        </section>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
        <GraficoRadarIndividual eixos={eixos} />
        <div className="grid gap-3 sm:grid-cols-2">
          {eixos.map((eixo) => (
            <article key={eixo.id} className="rounded-lg border border-navy/10 bg-cream/50 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm text-navy">{eixo.titulo}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${ESTADO_EIXO_TOM[eixo.estado]}`}
            >
              {ESTADO_EIXO_LABEL[eixo.estado]}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-navy/55">{eixo.resumo}</p>
          {eixo.itens.length > 0 ? (
            <dl className="mt-2 space-y-1">
              {eixo.itens.map((i) => (
                <div key={i.rotulo} className="flex justify-between gap-2 text-xs text-navy/70">
                  <dt className="text-navy/50">{i.rotulo}</dt>
                  <dd className="text-right font-medium text-navy">{i.valor}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-xs text-navy/50">{eixo.mensagemVazio}</p>
          )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
