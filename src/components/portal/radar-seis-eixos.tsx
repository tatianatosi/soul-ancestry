import type { DimensaoRadar } from "@/lib/radar-seis-eixos";

const RAIO = 90;
const CENTRO = 110;
const N = 6;

function ponto(indice: number, raio: number): { x: number; y: number } {
  const angulo = (-90 + indice * (360 / N)) * (Math.PI / 180);
  return { x: CENTRO + raio * Math.cos(angulo), y: CENTRO + raio * Math.sin(angulo) };
}

/** Anéis de fundo (25/50/75/100%), só para leitura visual — sem dado. */
function anelDeFundo(fracao: number, chave: string) {
  const pontos = Array.from({ length: N }, (_, i) => ponto(i, RAIO * fracao));
  return (
    <polygon
      key={chave}
      points={pontos.map((p) => `${p.x},${p.y}`).join(" ")}
      fill="none"
      stroke="currentColor"
      className="text-navy/10"
      strokeWidth={1}
    />
  );
}

/**
 * Radar Ancestral — gráfico de teia das 6 dimensões (mockup pág. 3/7).
 *
 * RADAR-APP-SEMANTICA-PROGRESSO (18/09/2026): todos os 6 eixos, inclusive o
 * de progresso geral, representam andamento da jornada — nunca elegibilidade
 * jurídica, chance ou parecer. Dimensão sem percentual publicado fica no
 * centro do polígono — nunca inventa posição.
 */
export function RadarSeisEixos({ dimensoes }: { dimensoes: DimensaoRadar[] }) {
  const pontosPoligono = dimensoes
    .map((d, i) => ponto(i, d.estado === "percentual" ? RAIO * ((d.percentual ?? 0) / 100) : 0))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const comProgresso = dimensoes.some(
    (d) => d.estado === "percentual" && (d.percentual ?? 0) > 0,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" data-radar-grafico>
      <div className="border-b border-navy/10 px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Visão das seis dimensões</p>
        <h2 className="mt-0.5 font-serif text-xl text-navy">Radar Ancestral</h2>
      </div>
      {!comProgresso ? (
        <p className="mx-4 mt-4 rounded-lg border border-border bg-cream/70 px-3 py-2 text-center text-xs text-navy/65">
          Radar ainda não publicado. Ele ganha forma conforme a equipe publica documentação e achados — a teia
          permanece no centro até lá, sem inventar percentual.
        </p>
      ) : null}
      <svg
        viewBox="-90 -30 400 300"
        className="mx-auto w-full max-w-md px-2 pb-2"
        role="img"
        aria-label="Radar das 6 dimensões da sua jornada"
      >
        {[0.25, 0.5, 0.75, 1].map((f) => anelDeFundo(f, String(f)))}
        {dimensoes.map((_, i) => {
          const p = ponto(i, RAIO);
          return (
            <line
              key={i}
              x1={CENTRO}
              y1={CENTRO}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              className="text-navy/10"
              strokeWidth={1}
            />
          );
        })}
        <polygon points={pontosPoligono} className="fill-gold/25 stroke-gold" strokeWidth={2} />
        {dimensoes.map((d, i) => {
          const rotulo = ponto(i, RAIO + 28);
          // Âncora por quadrante evita corte dos rótulos nas bordas do SVG.
          const angulo = -90 + i * (360 / N);
          const textAnchor =
            angulo > -80 && angulo < 80 ? "start" : angulo > 100 && angulo < 260 ? "end" : "middle";
          return (
            <text
              key={d.id}
              x={rotulo.x}
              y={rotulo.y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="fill-navy text-[9px] font-medium"
            >
              {d.titulo}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
