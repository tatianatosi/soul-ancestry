/**
 * Cadência do onboarding — o percurso, não duas listas.
 *
 * Antes desta tela, o mesmo assunto aparecia partido em dois blocos: "Plano de
 * ação" como lista numerada e "Touchpoints previstos" como grade de cartões.
 * Nenhum dos dois respondia quando, e por isso nenhum dos dois respondia o que
 * está atrasado — o prazo estava escrito como texto ("D3 após início") e ficava
 * ali, sem virar data.
 *
 * Aqui as duas fontes viram um trilho único, na ordem do calendário. Cada marco
 * mostra o dia, quem responde e em que situação está. O que ainda não tem data
 * não some: fica no fim, dito com todas as letras.
 *
 * Cor nunca decide sozinha: toda situação carrega sinal e rótulo em texto. O
 * ouro da marca fica em 1,71:1 sobre o creme, abaixo do piso de 3:1, e a
 * contrapartida exigida é exatamente essa — rótulo sempre visível.
 */
import {
  TOM_CADENCIA,
  lerCadenciaOnboarding,
  leituraDaCadencia,
  type EntradaCadencia,
  type ItemChecklistParaCadencia,
  type PlanoParaCadencia,
} from "@/lib/cadencia-onboarding";

const ORIGEM_ROTULO: Record<EntradaCadencia["origem"], string> = {
  plano_acao: "ação interna",
  touchpoint: "toque com o cliente",
  checklist: "checklist",
};

export function CadenciaOnboarding({
  plano,
  checklist,
}: {
  plano: PlanoParaCadencia | null | undefined;
  checklist?: ItemChecklistParaCadencia[] | null;
}) {
  const c = lerCadenciaOnboarding({ plano, checklist });
  if (!c.entradas.length) return null;

  const datadas = c.entradas.filter((e) => e.dias !== null);
  const semData = c.entradas.filter((e) => e.dias === null);
  const pedemAcao = c.resumo.atrasados + c.resumo.venceHoje;

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/50 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">Cadência do onboarding</h3>
        <p className="text-xs text-navy/55">
          {c.inicio ? `Início em ${formatarDia(c.inicio)}` : "Sem data de início"}
          {" · "}
          {c.resumo.total} marco(s)
        </p>
      </div>

      {/* A frase antes do número: o estado em linguagem de gente. */}
      <p className={`mt-2 text-sm ${pedemAcao ? "text-terracotta" : "text-navy/70"}`}>
        {leituraDaCadencia(c)}
      </p>

      {c.motivosBloqueio.length > 0 ? (
        <ul className="mt-3 space-y-1 rounded-lg bg-cream/60 px-3 py-2">
          {c.motivosBloqueio.map((m) => (
            <li key={m} className="text-xs text-navy/70">
              <span aria-hidden="true">⏸</span> {m}
            </li>
          ))}
        </ul>
      ) : null}

      {/* O trilho. A linha contínua é o que faz disto percurso e não lista. */}
      {datadas.length > 0 ? (
        <ol className="relative mt-5 space-y-0 border-l border-navy/15 pl-5">
          {datadas.map((e) => (
            <Marco key={e.id} entrada={e} />
          ))}
        </ol>
      ) : null}

      {semData.length > 0 ? (
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
            Ainda sem data
          </p>
          <ol className="mt-2 space-y-0 border-l border-dashed border-navy/15 pl-5">
            {semData.map((e) => (
              <Marco key={e.id} entrada={e} />
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function Marco({ entrada }: { entrada: EntradaCadencia }) {
  const tom = TOM_CADENCIA[entrada.situacao];
  const destacar = entrada.situacao === "atrasado" || entrada.situacao === "vence_hoje";

  return (
    <li className="relative py-2.5">
      {/* O ponto no trilho. Preenchido quando há situação com cor; vazado
          quando a espera não é gravidade, e sim ausência de prazo. */}
      <span
        aria-hidden="true"
        className="absolute -left-[1.4rem] top-4 block h-2.5 w-2.5 rounded-full border-2 border-white"
        style={{ backgroundColor: tom.cor ?? "#C9CFD8" }}
      />

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {entrada.dias !== null ? (
          <span className="rounded bg-navy/5 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-navy/70">
            D{entrada.dias}
          </span>
        ) : null}
        <p className={`text-sm ${destacar ? "font-medium text-navy" : "text-navy/85"}`}>
          {entrada.rotulo}
        </p>
      </div>

      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-navy/55">
        {/* Sinal + rótulo: a situação é legível sem depender da cor. */}
        <span
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
          style={
            tom.cor
              ? { color: tom.cor, backgroundColor: `${tom.cor}14` }
              : { color: "#4A5568", backgroundColor: "#4A55680F" }
          }
        >
          <span aria-hidden="true">{tom.sinal}</span>
          {tom.rotulo}
        </span>

        {entrada.previstaEm ? <span>previsto {formatarDia(entrada.previstaEm)}</span> : null}

        {entrada.situacao === "atrasado" && entrada.diferencaDias !== null ? (
          <span className="tabular-nums">
            {entrada.diferencaDias} dia{entrada.diferencaDias === 1 ? "" : "s"} de atraso
          </span>
        ) : null}

        {entrada.responsavel ? <span>{entrada.responsavel}</span> : null}
        <span className="text-navy/40">{ORIGEM_ROTULO[entrada.origem]}</span>
      </p>
    </li>
  );
}

function formatarDia(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
}
