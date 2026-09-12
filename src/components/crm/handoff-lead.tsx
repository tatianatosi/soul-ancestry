import { escadaConversao, handoffLead, resultadoComercialDerivado, rotulo, type LeadDesk } from "@/lib/crm-desk";

const CORES: Record<string, string> = {
  concluido: "border-gold/50 bg-gold/10 text-navy",
  em_andamento: "border-navy/20 bg-cream/40 text-navy",
  bloqueado: "border-terracotta/40 bg-terracotta/5 text-terracotta",
};

const ROTULO_ESTADO: Record<string, string> = {
  concluido: "Concluído",
  em_andamento: "Em andamento",
  bloqueado: "Bloqueado",
};

const ROTULO_ALVO: Record<string, string> = {
  proposta: "Proposta",
  formalizacao: "Formalização",
  onboarding: "Onboarding",
};

/**
 * Leitura de handoff Discovery → oportunidade → operação.
 * Somente leitura e derivada do próprio lead: não cria ficha paralela,
 * não avança contrato, cobrança nem onboarding.
 */
export function HandoffLead({ lead }: { lead: LeadDesk }) {
  const h = handoffLead(lead);
  const escada = escadaConversao(lead);

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">Handoff Discovery → oportunidade → operação</h3>
        <span className="text-xs text-navy/55">Resultado derivado: {resultadoComercialDerivado(lead)}</span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        {escada.map((d) => (
          <div key={d.chave} className={`rounded-lg border px-3 py-2 text-xs ${CORES[d.estado]}`}>
            <p className="font-medium">{d.rotulo}</p>
            <p className="text-[11px] uppercase tracking-wide opacity-70">{ROTULO_ESTADO[d.estado]}</p>
            <p className="mt-1 text-[11px] opacity-80">{d.nota}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-navy/50">Confirmado no Discovery</p>
          <ul className="mt-1 space-y-1 text-xs text-navy/70">
            {h.confirmado.map((c) => (
              <li key={c}>• {c}</li>
            ))}
            {!h.confirmado.length ? <li>Nada confirmado ainda.</li> : null}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-navy/50">Falta confirmar</p>
          <ul className="mt-1 space-y-1 text-xs text-navy/70">
            {h.falta.map((c) => (
              <li key={c}>• {c}</li>
            ))}
            {!h.falta.length ? <li>Sem pendências de Discovery.</li> : null}
          </ul>
        </div>
      </div>

      <p className="mt-3 text-xs text-navy/65">
        Responsável atual: <strong>{h.responsavel ?? "não definido"}</strong>
        {" · "}Área: {h.area ? rotulo("area_responsavel", h.area) : "não definida"}
        {" · "}Próxima ação: {h.proximaAcao ? rotulo("proxima_acao", h.proximaAcao) : "não definida"}
        {" · "}Prazo: {h.prazo ?? "sem prazo"}
      </p>
      {!h.operavel ? (
        <p className="mt-2 rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
          Oportunidade não operável: exige responsável, próxima ação e prazo.
        </p>
      ) : null}

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-navy/50">Bloqueios ativos</p>
        <ul className="mt-1 space-y-1 text-xs text-navy/70">
          {h.bloqueios.map((b, i) => (
            <li key={`${b.alvo}-${i}`}>
              <strong>{ROTULO_ALVO[b.alvo]}</strong>: {b.motivo}
            </li>
          ))}
          {!h.bloqueios.length ? <li>Nenhum bloqueio comercial ativo.</li> : null}
        </ul>
      </div>
    </section>
  );
}
