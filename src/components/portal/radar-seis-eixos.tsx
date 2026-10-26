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
 * jurídica, chance ou parecer. Dimensão sem percentual não ganha posição
 * nem é desenhada como zero.
 */
export function RadarSeisEixos({ dimensoes }: { dimensoes: DimensaoRadar[] }) {
  const comProgresso = dimensoes.some(
    (d) => d.estado === "percentual" && (d.percentual ?? 0) > 0,
  );

  return (
    <div className="min-w-0 py-2" data-radar-grafico>
      <div className="px-1 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Visão das seis dimensões</p>
        <h2 className="mt-1 font-serif text-2xl text-navy">Radar Ancestral</h2>
      </div>
      {!comProgresso ? (
        <p className="mx-4 mt-4 rounded-lg border border-border bg-cream/70 px-3 py-2 text-center text-xs text-navy/65">
          Este desenho ganhará forma conforme documentos e descobertas forem compartilhados com você.
        </p>
      ) : null}
      <svg
        viewBox="-105 -35 430 295"
        className="app-radar-svg mx-auto w-full pb-2"
        role="img"
        aria-label={`Radar das 6 dimensões da sua jornada: ${dimensoes.map((d) => `${d.titulo}: ${d.rotuloNumero}`).join("; ")}`}
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
              className="text-navy/30"
              strokeWidth={1}
            />
          );
        })}
        {/* Área dourada preenchida (13/10/2026): uma pétala por eixo com dado
            real; eixo sem dado não é desenhado como zero. */}
        {dimensoes.map((d, i) => {
          if (d.percentual === null && d.rotuloNumero !== "Compartilhado") return null;
          if (d.percentual !== null && d.percentual <= 0) return null;
          const r = d.percentual === null ? RAIO : RAIO * (d.percentual / 100);
          const pts = [{ x: CENTRO, y: CENTRO }, ponto(i - 0.5, r * 0.5), ponto(i, r), ponto(i + 0.5, r * 0.5)];
          return (
            <polygon
              key={`area-${d.id}`}
              data-radar-area
              points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
              className="fill-gold/35 stroke-gold"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          );
        })}
        {dimensoes.map((d, i) => {
          if (d.percentual === null) return null;
          const valor = ponto(i, RAIO * (d.percentual / 100));
          return (
            <line
              key={`progresso-${d.id}`}
              x1={CENTRO}
              y1={CENTRO}
              x2={valor.x}
              y2={valor.y}
              className="stroke-gold"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
        {dimensoes.map((d, i) => {
          if (d.percentual === null) return null;
          const valor = ponto(i, RAIO * (d.percentual / 100));
          return <circle key={`valor-${d.id}`} cx={valor.x} cy={valor.y} r={4} className="fill-gold stroke-navy" strokeWidth={1.5} />;
        })}
        {dimensoes.map((d, i) => {
          const rotulo = ponto(i, RAIO + 28);
          // Âncora por quadrante evita corte dos rótulos nas bordas do SVG.
          const angulo = -90 + i * (360 / N);
          const textAnchor =
            angulo > -80 && angulo < 80 ? "start" : angulo > 100 && angulo < 260 ? "end" : "middle";
          // Rótulo em até duas linhas + andamento real (ou "Em pesquisa"), para a teia ocupar mais área.
          const palavras = d.titulo.split(" ");
          const linhas = palavras.length > 1 ? [palavras.slice(0, -1).join(" "), palavras[palavras.length - 1]] : [d.titulo];
          const andamento = d.rotuloNumero === "Compartilhado" ? "Compartilhado" : "Em preparação";
          const topo = rotulo.y - ((linhas.length) * 15) / 2;
          return (
            <text key={d.id} x={rotulo.x} y={topo} textAnchor={textAnchor} className="fill-navy text-[13px] font-medium">
              {linhas.map((l, k) => <tspan key={k} x={rotulo.x} dy={k === 0 ? 0 : 15}>{l}</tspan>)}
              <tspan x={rotulo.x} dy={16} className={d.percentual === null ? "fill-navy/60 text-[11px]" : "fill-gold text-[13px] font-semibold"}>{andamento}</tspan>
            </text>
          );
        })}
      </svg>
      <p className="pb-4 text-sm leading-relaxed text-navy/70">Cada dimensão acompanha registros compartilhados pela equipe, sem notas, chances ou promessa de resultado.</p>
    </div>
  );
}
