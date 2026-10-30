import { AcaoOperacional } from "@/components/saas/acao-operacional";
import type { AcaoExterna, Capacidade } from "@/lib/modo-proprietaria";
import type { Opcao } from "@/lib/caso-ficha";

export const inputCls =
  "w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50";

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
    <section className="rounded-xl border border-navy/10 bg-cream/50 p-5">
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
  erro,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  desabilitado?: boolean;
  area?: boolean;
  tipo?: string;
  ajuda?: string;
  /**
   * Varredura de máscaras (03/10/2026): até aqui `Texto` não tinha estado de
   * erro, então cada tela que quisesse validar precisava montar input e
   * mensagem à mão — e por isso 77 das 87 telas com campo mascarável não
   * validavam nada. Com o erro aqui, aplicar validador vira uma linha por
   * campo, e a varredura deixa de ser artesanal.
   *
   * Mensagem presente = campo inválido. A borda muda e a mensagem aparece;
   * nada é bloqueado aqui — quem recusa continua sendo o servidor.
   */
  erro?: string | null;
}) {
  const classe = erro ? `${inputCls} border-terracotta` : inputCls;
  return (
    <label className="block">
      <Rotulo>{label}</Rotulo>
      {area ? (
        <textarea className={classe} rows={4} value={valor} disabled={desabilitado} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(erro)} />
      ) : (
        <input className={classe} type={tipo} value={valor} disabled={desabilitado} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(erro)} />
      )}
      {erro ? <span className="mt-1 block text-[11px] text-terracotta">{erro}</span> : null}
      {ajuda && !erro ? <span className="mt-1 block text-[11px] text-navy/45">{ajuda}</span> : null}
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

/**
 * Chips de um toque — reaproveita as mesmas `opcoes` (CA-04/dicionário já
 * existente) de `Selecao`/`MultiSelecao`, mas cada opção é um botão que
 * seleciona no próprio clique, sem abrir dropdown nem precisar de segundo
 * clique de confirmação. `multiplo` decide se mais de um valor pode ficar
 * marcado ao mesmo tempo (reusa `valores`) ou só um (reusa `valor`/`onChange`
 * de string única). Sem lógica nova: mesma fonte de opções e mesmo campo de
 * destino que o seletor que substitui.
 */
export function ChipsEscolha(
  props:
    | { label: string; opcoes: Opcao[]; multiplo: true; valores: string[]; onChange: (v: string[]) => void; desabilitado?: boolean }
    | { label: string; opcoes: Opcao[]; multiplo?: false; valor: string; onChange: (v: string) => void; desabilitado?: boolean },
) {
  const { label, opcoes, desabilitado } = props;
  const selecionado = (valor: string) => (props.multiplo ? props.valores.includes(valor) : props.valor === valor);
  const alternar = (valor: string) => {
    if (props.multiplo) {
      props.onChange(props.valores.includes(valor) ? props.valores.filter((v) => v !== valor) : [...props.valores, valor]);
    } else {
      props.onChange(props.valor === valor ? "" : valor);
    }
  };
  return (
    <div>
      <Rotulo>{label}</Rotulo>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            disabled={desabilitado}
            aria-pressed={selecionado(o.valor)}
            onClick={() => alternar(o.valor)}
            className={
              "rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50 " +
              (selecionado(o.valor)
                ? "border-navy bg-navy text-cream"
                : "border-navy/20 bg-cream text-navy/70 hover:bg-cream/70 hover:text-navy")
            }
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
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
