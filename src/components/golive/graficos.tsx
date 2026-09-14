/**
 * Elementos gráficos do shell de go-live.
 *
 * Só apresentação: recebem números já lidos do motor aprovado e desenham.
 * Não buscam dado, não estimam, não inventam percentual. Quando não há
 * nenhum valor, quem chama mostra o estado vazio canônico.
 */

const NAVY = "#2F4B6E";
const GOLD = "#C9A84C";
const TERRA = "#9A3A2F";

export type Fatia = { rotulo: string; valor: number };

/** Barras horizontais rotuladas — contagens simples por categoria. */
export function Barras({ dados, titulo }: { dados: Fatia[]; titulo: string }) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  return (
    <div className="min-w-0 space-y-2" role="img" aria-label={`${titulo}: ${dados.map((d) => `${d.rotulo} ${d.valor}`).join(", ")}.`}>
      {dados.map((d) => (
        <div key={d.rotulo} className="min-w-0">
          <div className="flex items-baseline justify-between gap-2 text-xs text-navy/65">
            <span className="truncate">{d.rotulo}</span>
            <span className="shrink-0 font-semibold text-navy">{d.valor}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-navy/10">
            <div
              className="h-2 rounded-full"
              style={{ width: `${(d.valor / max) * 100}%`, background: d.valor ? GOLD : "transparent" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Escada da cadeia: cada degrau é um marco concluído ou pendente. */
export function Escada({ etapas }: { etapas: { rotulo: string; feito: boolean }[] }) {
  const feitos = etapas.filter((e) => e.feito).length;
  return (
    <div
      className="min-w-0"
      role="img"
      aria-label={`Cadeia: ${feitos} de ${etapas.length} marcos concluídos. ${etapas
        .map((e) => `${e.rotulo} ${e.feito ? "concluído" : "pendente"}`)
        .join(", ")}.`}
    >
      <div className="flex min-w-0 items-end gap-1">
        {etapas.map((e, i) => (
          <div key={e.rotulo} className="min-w-0 flex-1">
            <div
              className="rounded-t"
              style={{
                height: `${18 + i * 6}px`,
                background: e.feito ? NAVY : "rgba(47,75,110,0.12)",
              }}
            />
            <p className="mt-1 truncate text-[10px] leading-tight text-navy/60" title={e.rotulo}>
              {e.rotulo}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-navy/60">
        {feitos} de {etapas.length} marcos concluídos
      </p>
    </div>
  );
}

/** Rosca de composição — usada para situação de faturas, evidências etc. */
export function Rosca({ dados, titulo }: { dados: Fatia[]; titulo: string }) {
  const total = dados.reduce((s, d) => s + d.valor, 0);
  const cores = [NAVY, GOLD, TERRA, "#7D8FA6"];
  let acumulado = 0;
  const raio = 46;
  const circ = 2 * Math.PI * raio;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-4">
      <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0" role="img" aria-label={`${titulo}: ${dados.map((d) => `${d.rotulo} ${d.valor}`).join(", ")}.`}>
        <circle cx="60" cy="60" r={raio} fill="none" stroke="rgba(47,75,110,0.12)" strokeWidth="14" />
        {total > 0 &&
          dados.map((d, i) => {
            const fracao = d.valor / total;
            const el = (
              <circle
                key={d.rotulo}
                cx="60"
                cy="60"
                r={raio}
                fill="none"
                stroke={cores[i % cores.length]}
                strokeWidth="14"
                strokeDasharray={`${fracao * circ} ${circ}`}
                strokeDashoffset={-acumulado * circ}
                transform="rotate(-90 60 60)"
              />
            );
            acumulado += fracao;
            return el;
          })}
        <text x="60" y="64" textAnchor="middle" fontSize="18" fill={NAVY} fontWeight="600">
          {total}
        </text>
      </svg>
      <ul className="min-w-0 space-y-1 text-xs text-navy/70">
        {dados.map((d, i) => (
          <li key={d.rotulo} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cores[i % cores.length] }} />
            <span className="truncate">
              {d.rotulo} — {d.valor}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Linha de ritmo: série curta de contagens já apuradas, por período. */
export function Linha({ dados, titulo }: { dados: Fatia[]; titulo: string }) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  const largura = 320;
  const altura = 96;
  const passo = dados.length > 1 ? largura / (dados.length - 1) : 0;
  const pontos = dados.map((d, i) => [i * passo, altura - (d.valor / max) * (altura - 16) - 8] as const);
  const caminho = pontos.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  return (
    <div className="min-w-0">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="h-24 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${titulo}: ${dados.map((d) => `${d.rotulo} ${d.valor}`).join(", ")}.`}
      >
        <path d={caminho} fill="none" stroke={NAVY} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {pontos.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={GOLD} />
        ))}
      </svg>
      <ul className="mt-1 flex justify-between gap-1 text-[10px] text-navy/55">
        {dados.map((d) => (
          <li key={d.rotulo} className="min-w-0 truncate text-center">
            {d.rotulo}
            <span className="block font-semibold text-navy">{d.valor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barras de completude em porcentagem — escala fixa de 0 a 100. */
export function BarrasPercentual({ dados, titulo }: { dados: Fatia[]; titulo: string }) {
  return (
    <div
      className="min-w-0 space-y-2"
      role="img"
      aria-label={`${titulo}: ${dados.map((d) => `${d.rotulo} ${d.valor}%`).join(", ")}.`}
    >
      {dados.map((d) => (
        <div key={d.rotulo} className="min-w-0">
          <div className="flex items-baseline justify-between gap-2 text-xs text-navy/65">
            <span className="truncate">{d.rotulo}</span>
            <span className="shrink-0 font-semibold text-navy">{d.valor}%</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-navy/10">
            <div
              className="h-2 rounded-full"
              style={{ width: `${Math.max(0, Math.min(100, d.valor))}%`, background: d.valor ? NAVY : "transparent" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Faixa de confiança em estrelas, com a contagem que a originou. */
export function Estrelas({
  estrelas,
  confirmados,
  pendentes,
}: {
  estrelas: number;
  confirmados: number;
  pendentes: number;
}) {
  return (
    <div
      className="min-w-0 space-y-1"
      role="img"
      aria-label={`Confiança ${estrelas} de 5. ${confirmados} itens confirmados e ${pendentes} pendentes.`}
    >
      <div className="flex items-center gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="text-lg leading-none" style={{ color: n <= estrelas ? GOLD : "rgba(47,75,110,0.2)" }}>
            ★
          </span>
        ))}
      </div>
      <p className="text-xs text-navy/60">
        {confirmados} confirmado{confirmados === 1 ? "" : "s"} · {pendentes} pendente{pendentes === 1 ? "" : "s"}
      </p>
    </div>
  );
}

/** Rede de relações aprovadas: uma linha por vínculo declarado. */
export function Rede({ relacoes }: { relacoes: { id: string; de: string; para: string; rotulo: string }[] }) {
  return (
    <ul
      className="min-w-0 space-y-2"
      role="img"
      aria-label={`Relações aprovadas: ${relacoes.map((r) => `${r.de} é ${r.rotulo} de ${r.para}`).join("; ")}.`}
    >
      {relacoes.map((r) => (
        <li key={r.id} className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-navy">
          <span className="min-w-0 truncate rounded-lg border border-navy/15 bg-cream/70 px-2 py-1">{r.de}</span>
          <span className="shrink-0 text-xs text-navy/55">— {r.rotulo} de →</span>
          <span className="min-w-0 truncate rounded-lg border border-gold/50 bg-gold/15 px-2 py-1">{r.para}</span>
        </li>
      ))}
    </ul>
  );
}

/** Linha do tempo vertical: eventos já gravados, do mais recente ao mais antigo. */
export function LinhaDoTempo({
  itens,
}: {
  itens: { id: string; titulo: string; quando: string; detalhe?: string | null }[];
}) {
  return (
    <ol className="min-w-0 space-y-3 border-l border-navy/15 pl-4">
      {itens.map((i) => (
        <li key={i.id} className="relative min-w-0">
          <span
            className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full"
            style={{ background: GOLD }}
            aria-hidden
          />
          <p className="break-words text-sm text-navy">{i.titulo}</p>
          <p className="text-xs text-navy/55">
            {i.quando}
            {i.detalhe ? ` · ${i.detalhe}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
