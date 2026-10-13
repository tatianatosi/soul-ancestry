/**
 * Kit visual da Prancha V4 (13/10/2026) — as mesmas primitivas da prancha
 * aprovada (cartão, etiqueta, linha, barras, colunas, rosca, árvore de
 * gerações, rede de vínculos, jornada), agora alimentadas por dado real.
 *
 * Regra da Proprietária: o componente gráfico NUNCA some. Sem registro, ele
 * desenha o estado zero dentro do próprio gráfico (trilho vazio, rosca
 * cinza, coluna em zero) e diz isso em texto curto.
 */
import { cn } from "@/lib/utils";

export type Tom = "neutro" | "critico" | "atencao" | "sucesso";

const TOM: Record<Tom, string> = {
  neutro: "border-navy/15 bg-cream/70 text-navy/75",
  critico: "border-critico/30 bg-critico-suave text-critico",
  atencao: "border-atencao/30 bg-atencao-suave text-atencao",
  sucesso: "border-sucesso/30 bg-sucesso-suave text-sucesso",
};

export const sigla = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "?";

export function Etiqueta({ texto, tom = "neutro" }: { texto: string; tom?: Tom }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        TOM[tom],
      )}
    >
      {texto}
    </span>
  );
}

export function Cartao({
  titulo,
  children,
  className,
  acao,
  ...resto
}: {
  titulo: string;
  children: React.ReactNode;
  className?: string;
  acao?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "title">) {
  return (
    <section
      {...resto}
      className={cn(
        "min-w-0 rounded-xl border border-navy/10 bg-card p-4 shadow-[0_1px_2px_rgba(16,16,16,0.05)]",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-serif text-base leading-none text-navy">{titulo}</h3>
        {acao}
      </div>
      {children}
    </section>
  );
}

export function Linha({ rotulo, valor, tom }: { rotulo: string; valor?: string; tom?: Tom }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy/5 py-1.5 last:border-0">
      <span className="min-w-0 truncate text-xs text-navy/80">{rotulo}</span>
      {valor ? <Etiqueta texto={valor} tom={tom} /> : null}
    </div>
  );
}

export function Indicador({ rotulo, valor, apoio }: { rotulo: string; valor: string; apoio?: string }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-widest text-navy/55">{rotulo}</p>
      <p className="mt-1 font-serif text-2xl leading-none tabular-nums text-navy">{valor}</p>
      {apoio ? <p className="mt-1 text-[11px] text-navy/55">{apoio}</p> : null}
    </div>
  );
}

export function Pessoa({ nome, papel, destaque }: { nome: string; papel: string; destaque?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[11px] font-medium",
          destaque ? "border-navy bg-gold text-navy" : "border-gold/50 bg-navy text-gold",
        )}
        aria-hidden="true"
      >
        {sigla(nome)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-navy">{nome}</span>
        <span className="block truncate text-[10px] text-navy/55">{papel}</span>
      </span>
    </div>
  );
}

/** Barras horizontais; `valor` em 0–100. Valor 0 mantém o trilho visível. */
export function BarrasHorizontais({
  itens,
  tituloAcessivel,
}: {
  itens: { rotulo: string; valor: number; apoio?: string; tom?: "navy" | "gold" | "terracotta" }[];
  tituloAcessivel: string;
}) {
  return (
    <figure role="img" aria-label={tituloAcessivel} className="space-y-3">
      {itens.map((item) => {
        const largura = Math.max(0, Math.min(100, item.valor));
        return (
          <div key={item.rotulo}>
            <div className="mb-1 flex items-center justify-between gap-3 text-[10px]">
              <span className="font-medium text-navy">{item.rotulo}</span>
              <span className="tabular-nums text-navy/55">{item.apoio ?? `${Math.round(item.valor)}%`}</span>
            </div>
            <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="h-2 w-full overflow-hidden rounded-full">
              <rect width="100" height="4" className="fill-navy/10" />
              {largura > 0 ? (
                <rect
                  width={largura}
                  height="4"
                  rx="2"
                  className={item.tom === "terracotta" ? "fill-terracotta" : item.tom === "gold" ? "fill-gold" : "fill-navy"}
                />
              ) : null}
            </svg>
          </div>
        );
      })}
    </figure>
  );
}

/** Colunas verticais; coluna em zero aparece como base fina, nunca some. */
export function GraficoColunas({
  itens,
  tituloAcessivel,
}: {
  itens: { rotulo: string; valor: number; destaque?: boolean; secundario?: number }[];
  tituloAcessivel: string;
}) {
  const maior = Math.max(...itens.map((item) => item.valor), 1);
  return (
    <figure role="img" aria-label={tituloAcessivel}>
      <div className="flex h-36 items-end gap-1.5 border-b border-l border-navy/15 px-2 pt-3">
        {itens.map((item) => {
          const altura = item.valor > 0 ? Math.max(10, (item.valor / maior) * 92) : 2;
          const alturaSec = item.secundario && item.valor > 0 ? (item.secundario / item.valor) * altura : 0;
          return (
            <div key={item.rotulo} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[9px] font-semibold tabular-nums text-navy/60">{item.valor}</span>
              <svg viewBox="0 0 32 96" preserveAspectRatio="none" className="h-24 w-full max-w-10 overflow-hidden rounded-t-sm">
                <rect x="0" y={96 - altura} width="32" height={altura} className={item.destaque ? "fill-gold" : item.valor > 0 ? "fill-navy/70" : "fill-navy/15"} />
                {alturaSec > 0 ? <rect x="0" y={96 - alturaSec} width="32" height={alturaSec} className="fill-gold" /> : null}
              </svg>
              <span className="w-full truncate text-center text-[8px] text-navy/55">{item.rotulo}</span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/** Rosca de estados; total zero desenha o anel cinza com "0" no centro. */
export function DonutEstados({
  segmentos,
  tituloAcessivel,
}: {
  segmentos: { rotulo: string; valor: number; tom: "navy" | "gold" | "terracotta" | "sucesso" }[];
  tituloAcessivel: string;
}) {
  const total = segmentos.reduce((soma, item) => soma + item.valor, 0);
  let acumulado = 0;
  const classes = { navy: "stroke-navy", gold: "stroke-gold", terracotta: "stroke-terracotta", sucesso: "stroke-sucesso" } as const;
  const fundo = { navy: "bg-navy", gold: "bg-gold", terracotta: "bg-terracotta", sucesso: "bg-sucesso" } as const;
  return (
    <figure role="img" aria-label={tituloAcessivel} className="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-center">
      <div className="relative mx-auto h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r="42" fill="none" className="stroke-navy/10" strokeWidth="18" />
          {segmentos.map((segmento) => {
            const proporcao = total > 0 ? segmento.valor / total : 0;
            const inicio = acumulado;
            acumulado += proporcao;
            return proporcao > 0 ? (
              <circle
                key={segmento.rotulo}
                cx="60"
                cy="60"
                r="42"
                fill="none"
                className={classes[segmento.tom]}
                strokeWidth="18"
                strokeDasharray={`${proporcao * 263.89} 263.89`}
                strokeDashoffset={-inicio * 263.89}
              />
            ) : null;
          })}
        </svg>
        <span className="absolute inset-0 grid place-items-center font-serif text-2xl tabular-nums text-navy">{total}</span>
      </div>
      <figcaption className="space-y-2">
        {segmentos.map((segmento) => (
          <div key={segmento.rotulo} className="flex items-center justify-between gap-3 text-[10px]">
            <span className="flex items-center gap-2 text-navy/65">
              <span className={cn("h-2.5 w-2.5 rounded-sm", fundo[segmento.tom])} />
              {segmento.rotulo}
            </span>
            <strong className="tabular-nums text-navy">{segmento.valor}</strong>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}

/** Linha do tempo horizontal; sem eventos, desenha 4 marcos vazios. */
export function LinhaTempoGrafica({ eventos }: { eventos: { id: string; nome: string; data: string | null }[] }) {
  const itens = eventos.length
    ? eventos.map((e) => ({ ...e, vazio: false }))
    : Array.from({ length: 4 }, (_, i) => ({ id: `vazio-${i}`, nome: "—", data: null, vazio: true }));
  return (
    <div>
      <ol className="grid pt-3" style={{ gridTemplateColumns: `repeat(${itens.length}, minmax(0, 1fr))` }}>
        {itens.map((e, indice) => (
          <li key={e.id} className="relative text-center">
            {indice > 0 ? <span className={cn("absolute left-0 top-2 h-0.5 w-1/2", e.vazio ? "bg-navy/10" : "bg-sucesso")} /> : null}
            {indice < itens.length - 1 ? <span className={cn("absolute right-0 top-2 h-0.5 w-1/2", e.vazio ? "bg-navy/10" : "bg-sucesso")} /> : null}
            <span
              className={cn(
                "relative mx-auto block h-4 w-4 rounded-full border-2 border-card ring-1",
                e.vazio ? "bg-card ring-navy/20" : indice === itens.length - 1 ? "bg-gold ring-gold" : "bg-sucesso ring-sucesso",
              )}
            />
            <p className="mt-2 line-clamp-2 px-1 text-[10px] font-medium text-navy">{e.nome}</p>
            <p className="text-[9px] text-navy/50">{e.data ?? (e.vazio ? "" : "Sem data")}</p>
          </li>
        ))}
      </ol>
      {!eventos.length ? <p className="mt-2 text-[10px] text-navy/50">Nenhum evento registrado ainda.</p> : null}
    </div>
  );
}

/**
 * Jornada em marcos com trilho e preenchimento dourado. `atual` é o índice
 * do marco em andamento (null = nenhum registrado). Sem marcos, desenha os 5
 * pontos vazios D0–D365.
 */
export function JornadaMarcos({ marcos, atual }: { marcos: string[]; atual: number | null }) {
  const lista = marcos.length ? marcos : ["D0", "D14", "D60", "D180", "D365"];
  const vazio = !marcos.length;
  const progresso = vazio || atual === null ? 0 : (atual / Math.max(1, lista.length - 1)) * 100;
  const margem = 50 / lista.length;
  return (
    <div className="relative grid gap-1 pt-2" style={{ gridTemplateColumns: `repeat(${lista.length}, minmax(0, 1fr))` }}>
      <div className="absolute top-[19px] h-1 rounded-full bg-navy/10" style={{ left: `${margem}%`, right: `${margem}%` }}>
        <div className="h-full rounded-full bg-gold" style={{ width: `${progresso}%` }} />
      </div>
      {lista.map((marco, indice) => {
        const estado = vazio || atual === null ? "futuro" : indice < atual ? "feito" : indice === atual ? "atual" : "futuro";
        return (
          <div key={`${indice}-${marco}`} className="relative text-center">
            <span
              className={cn(
                "mx-auto grid h-7 w-7 place-items-center rounded-full border-2 border-card text-[9px] font-semibold ring-1",
                estado === "feito" ? "bg-navy text-primary-foreground ring-navy" : estado === "atual" ? "bg-gold text-navy ring-gold" : "bg-card text-navy/45 ring-navy/20",
              )}
            >
              {indice + 1}
            </span>
            <p className="mt-2 line-clamp-2 px-0.5 text-[9px] font-medium text-navy">{marco}</p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Árvore de gerações (cartões por linha, mais antiga no alto). Linha sem
 * pessoa registrada mostra um cartão vazio "—", nunca some.
 */
export function ArvoreGeracoes({
  geracoes,
  total,
}: {
  geracoes: Map<number, { id: string; nome: string; apoio?: string | null; confirmado?: boolean }[]>;
  total: number;
}) {
  const niveis = Array.from({ length: total }, (_, i) => total - i);
  return (
    <div className="space-y-1.5">
      {niveis.map((g) => {
        const pessoas = geracoes.get(g) ?? [];
        return (
          <div key={g} className="grid grid-cols-[2.5rem_1fr] items-center gap-2" data-geracao={`G${g}`}>
            <span className="text-[9px] font-semibold text-gold">G{g}</span>
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {pessoas.length ? (
                pessoas.map((p) => (
                  <span
                    key={p.id}
                    className={cn(
                      "max-w-full truncate rounded-md border px-2 py-1.5 text-[9px] text-navy",
                      p.confirmado ? "border-gold/40 bg-gold/10" : "border-navy/10 bg-cream/40",
                    )}
                  >
                    {p.nome}
                    {p.apoio ? ` · ${p.apoio}` : ""}
                  </span>
                ))
              ) : (
                <span className="rounded-md border border-dashed border-navy/15 px-2 py-1.5 text-[9px] text-navy/35">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Rede em teia: pessoa central e vínculos ao redor. Sem pessoa central,
 * desenha o nó vazio e diz que não há vínculo registrado.
 */
export function RedeVinculos({
  centro,
  vizinhos,
  legenda,
}: {
  centro: { nome: string } | null;
  vizinhos: { id: string; nome: string; ligado: boolean }[];
  legenda: string;
}) {
  const w = 520;
  const h = 220;
  const cx = w / 2;
  const cy = h / 2;
  const lista = vizinhos.slice(0, 10);
  const nos = lista.map((v, i) => {
    const ang = (2 * Math.PI * i) / Math.max(1, lista.length) - Math.PI / 2;
    return { ...v, x: cx + Math.cos(ang) * 190, y: cy - 14 + Math.sin(ang) * 62 };
  });
  return (
    <figure role="img" aria-label={legenda} className="relative mx-auto h-56 max-w-xl overflow-hidden rounded-lg border border-navy/10 bg-cream/35">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
        {nos.map((n) => (
          <line key={`l-${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y} className={n.ligado ? "stroke-gold/60" : "stroke-navy/15"} strokeWidth="2" strokeDasharray={n.ligado ? undefined : "4 4"} />
        ))}
        <g>
          <circle cx={cx} cy={cy} r={27} className={centro ? "fill-gold stroke-navy" : "fill-card stroke-navy/20"} strokeWidth="2" />
          <text x={cx} y={cy + 4} textAnchor="middle" className="fill-navy text-[11px] font-semibold">
            {centro ? sigla(centro.nome) : "—"}
          </text>
        </g>
        {nos.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={22} className="fill-card stroke-navy/40" strokeWidth="2" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-navy text-[11px] font-semibold">
              {sigla(n.nome)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="absolute bottom-2 left-3 right-3 text-[9px] text-navy/50">{legenda}</figcaption>
    </figure>
  );
}
