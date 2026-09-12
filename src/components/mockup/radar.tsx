/** Radar SVG visual-only, reutilizado pelo App Cliente e pelo Radar Interno. */
export type SerieRadar = { nome: string; cor: string; valores: number[] };

export function RadarSvg({
  eixos,
  series,
  tamanho = 280,
}: {
  eixos: string[];
  series: SerieRadar[];
  tamanho?: number;
}) {
  const c = tamanho / 2;
  const r = tamanho / 2 - 46;
  const ponto = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / eixos.length - Math.PI / 2;
    const d = (r * v) / 100;
    return [c + d * Math.cos(a), c + d * Math.sin(a)] as const;
  };

  return (
    <svg viewBox={`0 0 ${tamanho} ${tamanho}`} width="100%" height={tamanho} role="img" aria-label="Radar de eixos">
      {[25, 50, 75, 100].map((n) => (
        <polygon
          key={n}
          points={eixos.map((_, i) => ponto(i, n).join(",")).join(" ")}
          fill="none"
          stroke="#2F4B6E"
          strokeOpacity={0.12}
        />
      ))}
      {eixos.map((_, i) => {
        const [x, y] = ponto(i, 100);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#2F4B6E" strokeOpacity={0.12} />;
      })}
      {series.map((s) => (
        <polygon
          key={s.nome}
          points={s.valores.map((v, i) => ponto(i, v).join(",")).join(" ")}
          fill={s.cor}
          fillOpacity={series.length > 1 ? 0.14 : 0.3}
          stroke={s.cor}
          strokeWidth={2}
        />
      ))}
      {eixos.map((e, i) => {
        const [x, y] = ponto(i, 118);
        return (
          <text
            key={e}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="#2F4B6E"
            opacity={0.7}
          >
            {e}
          </text>
        );
      })}
    </svg>
  );
}
