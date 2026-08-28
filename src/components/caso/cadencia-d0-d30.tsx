/**
 * Cadência MVP D0–D30 — a norma da casa, e o que o plano deste caso cobre.
 *
 * Fica ao lado do trilho da cadência, e responde outra pergunta. O trilho diz
 * "o que combinamos com este cliente e quando"; aqui se vê "o combinado atende
 * ao padrão". Sem esta segunda leitura, um caso aparece impecavelmente em dia
 * com um plano que esqueceu metade da escada.
 *
 * A coluna de entrega ao cliente é sempre condicional: descreve o que PODE ser
 * preparado, nunca o que será enviado. Nada aqui agenda, enfileira ou cria
 * rascunho — a aprovação humana continua sendo a única porta de saída.
 */
import { TOM_D0_D30, lerCadenciaD0D30, leituraD0D30 } from "@/lib/cadencia-d0-d30";
import {
  lerCadenciaOnboarding,
  type ItemChecklistParaCadencia,
  type PlanoParaCadencia,
} from "@/lib/cadencia-onboarding";

export function CadenciaD0D30({
  plano,
  checklist,
}: {
  plano: PlanoParaCadencia | null | undefined;
  checklist?: ItemChecklistParaCadencia[] | null;
}) {
  const cadenciaDoCaso = lerCadenciaOnboarding({ plano, checklist });
  const l = lerCadenciaD0D30({ cadenciaDoCaso });
  if (!plano) return null;

  const temLacuna = l.resumo.descobertos > 0;

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">Cadência MVP · D0 a D30</h3>
        <p className="text-xs text-navy/55">
          {l.resumo.cobertos} de {l.resumo.total} momentos cobertos pelo plano
        </p>
      </div>
      <p className="mt-0.5 text-[11px] text-navy/45">
        Norma da casa, decisão canônica §10.3. Toda entrega ao cliente depende de aprovação humana.
      </p>

      <p className={`mt-2 text-sm ${temLacuna ? "text-terracotta" : "text-navy/70"}`}>
        {leituraD0D30(l)}
      </p>

      <ol className="mt-4 space-y-2">
        {l.momentos.map(({ momento, situacao, cobertura, cobertoPor, deEm, ateEm }) => {
          const tom = TOM_D0_D30[situacao];
          const descoberto = cobertura === "descoberto";
          return (
            <li
              key={momento.id}
              className={`rounded-lg border p-3 ${
                descoberto ? "border-terracotta/35 bg-terracotta/5" : "border-navy/12 bg-cream/25"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="rounded bg-navy/8 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-navy/75">
                  {momento.rotulo}
                </span>
                <p className="text-sm font-medium text-navy">{momento.acaoInterna}</p>
              </div>

              <p className="mt-1 text-xs text-navy/65">
                <span className="text-navy/45">Ao cliente, se aprovado:</span>{" "}
                {momento.entregaAoCliente}
                {momento.aprovacaoExtra ? (
                  <span className="text-terracotta"> · {momento.aprovacaoExtra}</span>
                ) : null}
              </p>

              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                {/* Cobertura e situação sempre em texto: a cor não decide. */}
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${
                    descoberto ? "bg-terracotta/15 text-terracotta" : "bg-navy/6 text-navy/70"
                  }`}
                >
                  <span aria-hidden="true">{descoberto ? "!" : "✓"}</span>
                  {descoberto ? "O plano não prevê nada aqui" : "Previsto no plano"}
                </span>

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

                {deEm ? (
                  <span className="text-navy/50">
                    {deEm === ateEm
                      ? formatarDia(deEm)
                      : `${formatarDia(deEm)} a ${formatarDia(ateEm!)}`}
                  </span>
                ) : null}
              </p>

              {cobertoPor.length > 0 ? (
                <p className="mt-1 text-[11px] text-navy/50">
                  Coberto por: {cobertoPor.join(" · ")}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function formatarDia(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
}
