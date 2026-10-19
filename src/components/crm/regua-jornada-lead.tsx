import { ROTULO_ESTADO_ETAPA, type EstadoEtapa, type EtapaRegua, type LinhaBrief } from "@/lib/regua-jornada-lead";

const NATUREZA: Record<EstadoEtapa, string> = {
  concluido: "pessoas",
  andamento: "financeiro",
  aguardando: "neutro",
  nao_registrado: "neutro",
};

/** Régua da jornada do lead — leitura, sem botão. */
export function ReguaJornadaLead({ etapas }: { etapas: EtapaRegua[] }) {
  return (
    <section className="ca-cartao-natureza" data-natureza="acao" data-regua-jornada aria-label="Jornada do lead">
      <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">Jornada do lead</p>
      <ol className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {etapas.map((e, i) => (
          <li key={e.id} className="min-w-0 rounded-lg border border-navy/10 bg-card px-2.5 py-2" data-etapa={e.id} data-estado={e.estado}>
            <p className="text-[10px] text-navy/45">{i + 1}</p>
            <p className="truncate text-sm font-medium text-navy">{e.rotulo}</p>
            <span className="ca-selo-natureza mt-1" data-natureza={NATUREZA[e.estado]}>
              {ROTULO_ESTADO_ETAPA[e.estado]}
            </span>
            {e.detalhe !== ROTULO_ESTADO_ETAPA[e.estado] ? (
              <p className="mt-1 text-[11px] leading-snug text-navy/60">{e.detalhe}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

const ROTULO_BRIEF: Record<LinhaBrief["estado"], { texto: string; natureza: string }> = {
  ja_sabemos: { texto: "Já sabemos", natureza: "pessoas" },
  sugerido: { texto: "Sugerido · a confirmar", natureza: "financeiro" },
  nao_registrado: { texto: "Não registrado · perguntar", natureza: "neutro" },
};

/** Brief pré-call — "O que já sabemos" do roteiro. Nada é preenchido sozinho. */
export function BriefPreCall({ linhas }: { linhas: LinhaBrief[] }) {
  return (
    <section className="ca-cartao-natureza" data-natureza="pesquisa" data-brief-pre-call aria-label="Brief pré-call">
      <p className="font-serif text-lg text-navy">Brief pré-call · O que já sabemos</p>
      <p className="text-xs text-navy/60">
        Lido do lead e da varredura. Sugestão só vira dado quando alguém confirma. Triagem interna, nunca parecer.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {linhas.map((l) => (
          <li key={l.campo} className="min-w-0 rounded-lg border border-navy/10 bg-card px-3 py-2">
            <p className="text-[11px] text-navy/55">{l.rotulo}</p>
            <p className="break-words text-sm text-navy">{l.valor ?? "Não registrado"}</p>
            <span className="ca-selo-natureza mt-1" data-natureza={ROTULO_BRIEF[l.estado].natureza}>
              {ROTULO_BRIEF[l.estado].texto}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
