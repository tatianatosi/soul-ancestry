import type { Opcao } from "@/lib/caso-ficha";

export const inputCls =
  "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50";

export function Rotulo({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">{children}</span>;
}

export function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="font-serif text-lg text-navy">{titulo}</h2>
      {descricao ? <p className="mb-4 mt-1 text-xs text-navy/55">{descricao}</p> : <div className="mb-4" />}
      {children}
    </section>
  );
}

export function Texto({
  label,
  valor,
  onChange,
  desabilitado,
  area,
  tipo = "text",
  ajuda,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  desabilitado?: boolean;
  area?: boolean;
  tipo?: string;
  ajuda?: string;
}) {
  return (
    <label className="block">
      <Rotulo>{label}</Rotulo>
      {area ? (
        <textarea className={inputCls} rows={4} value={valor} disabled={desabilitado} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} type={tipo} value={valor} disabled={desabilitado} onChange={(e) => onChange(e.target.value)} />
      )}
      {ajuda ? <span className="mt-1 block text-[11px] text-navy/45">{ajuda}</span> : null}
    </label>
  );
}

export function Selecao({
  label,
  valor,
  opcoes,
  onChange,
  desabilitado,
  ajuda,
}: {
  label: string;
  valor: string;
  opcoes: Opcao[];
  onChange: (v: string) => void;
  desabilitado?: boolean;
  ajuda?: string;
}) {
  return (
    <label className="block">
      <Rotulo>{label}</Rotulo>
      <select className={inputCls} value={valor} disabled={desabilitado} onChange={(e) => onChange(e.target.value)}>
        <option value="">— selecionar —</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {ajuda ? <span className="mt-1 block text-[11px] text-navy/45">{ajuda}</span> : null}
    </label>
  );
}
