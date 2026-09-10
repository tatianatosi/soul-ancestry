import { AcaoOperacional } from "@/components/saas/acao-operacional";
import type { AcaoExterna, Capacidade } from "@/lib/modo-proprietaria";
import type { Opcao } from "@/lib/caso-ficha";

export const inputCls =
  "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50";

/**
 * Ação de escrita com validade de formulário separada da autoridade.
 *
 * - `faltando`: campo obrigatório vazio do próprio formulário. Desabilita o
 *   controle e diz o que falta. Não é trava de autoridade.
 * - `pendenciaGate`: pendência de domínio. Nunca desabilita: vai para
 *   `AcaoOperacional`, que decide e registra o motivo.
 */
export function AcaoDeEscrita({
  rotulo,
  faltando,
  capacidade,
  acaoExterna,
  pendenciaGate,
  efeito,
  className,
  onConfirmar,
}: {
  rotulo: string;
  faltando?: string | null;
  capacidade?: Capacidade;
  acaoExterna?: AcaoExterna | string;
  pendenciaGate?: string | null;
  efeito?: string;
  className?: string;
  onConfirmar: (motivo: string) => void | Promise<void>;
}) {
  if (faltando) {
    return (
      <span className="inline-flex flex-col gap-1">
        <button type="button" disabled className={className ?? "rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"}>
          {rotulo}
        </button>
        <span className="text-xs text-navy/70">{faltando}</span>
      </span>
    );
  }
  return (
    <AcaoOperacional
      rotulo={rotulo}
      capacidade={capacidade}
      acaoExterna={acaoExterna}
      pendenciaGate={pendenciaGate ?? null}
      efeito={efeito}
      className={className}
      onConfirmar={onConfirmar}
    />
  );
}

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

/** Seleção múltipla por checkbox — mesmo padrão visual de Selecao/Texto. */
export function MultiSelecao({
  label,
  opcoes,
  valores,
  onChange,
  desabilitado,
}: {
  label: string;
  opcoes: Opcao[];
  valores: string[];
  onChange: (v: string[]) => void;
  desabilitado?: boolean;
}) {
  return (
    <div>
      <Rotulo>{label}</Rotulo>
      <div className="mt-1 grid gap-1 md:grid-cols-2">
        {opcoes.map((o) => (
          <label key={o.valor} className="flex items-center gap-2 text-xs text-navy">
            <input
              type="checkbox"
              disabled={desabilitado}
              checked={valores.includes(o.valor)}
              onChange={(e) => onChange(e.target.checked ? [...valores, o.valor] : valores.filter((v) => v !== o.valor))}
            />
            {o.rotulo}
          </label>
        ))}
      </div>
    </div>
  );
}
