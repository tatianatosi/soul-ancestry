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
 * Dimensão sem percentual (elegibilidade, por decisão institucional) fica no
 * centro do polígono — nunca inventa posição.
 */
export function RadarSeisEixos({ dimensoes }: { dimensoes: DimensaoRadar[] }) {
  const pontosPoligono = dimensoes
    .map((d, i) => ponto(i, d.estado === "percentual" ? RAIO * ((d.percentual ?? 0) / 100) : 0))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 220 240" className="mx-auto w-full max-w-xs" role="img" aria-label="Radar das 6 dimensões da sua jornada">
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
      <polygon
        points={pontosPoligono}
        className="fill-gold/25 stroke-gold"
        strokeWidth={2}
      />
      {dimensoes.map((d, i) => {
        const rotulo = ponto(i, RAIO + 26);
        return (
          <text
            key={d.id}
            x={rotulo.x}
            y={rotulo.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-navy text-[9px] font-medium"
          >
            {d.titulo}
          </text>
        );
      })}
    </svg>
  );
}
