import { Link } from "@tanstack/react-router";

import {
  FASES_CRM_JOURNEY,
  ctaPrincipalFase,
  fasePorId,
  faseVizinha,
  type FaseCrmJourney,
  type FaseJourneyId,
} from "@/lib/crm-journey-fases";

const CARTAO = "rounded-xl border border-navy/10 bg-white p-4";

function SeloCanal({ canal }: { canal: FaseCrmJourney["whatsapp"]["canal"] }) {
  const texto =
    canal === "communication_queue"
      ? "WhatsApp → fila (aprovação humana)"
      : canal === "copia_manual"
        ? "WhatsApp → cópia manual"
        : "WhatsApp → bloqueado (auto)";
  const tom =
    canal === "bloqueado_auto"
      ? "border-navy/15 bg-navy/5 text-navy/60"
      : "border-gold/40 bg-gold/10 text-navy";
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${tom}`}>{texto}</span>;
}

export function JornadaCrmHub({
  faseAtivaId,
  onSelecionar,
}: {
  faseAtivaId: string;
  onSelecionar: (id: FaseJourneyId) => void;
}) {
  const ativa = fasePorId(faseAtivaId);
  const anterior = faseVizinha(ativa.id, -1);
  const proxima = faseVizinha(ativa.id, 1);
  const cta = ctaPrincipalFase(ativa);
  const indice = FASES_CRM_JOURNEY.findIndex((f) => f.id === ativa.id) + 1;

  return (
    <div className="space-y-4" data-crm-journey-hub>
      <div className={`${CARTAO} border-gold/30 bg-cream/50`}>
        <p className="text-[11px] uppercase tracking-wide text-navy/50">CRM Journey · ciclo completo</p>
        <h2 className="mt-1 font-serif text-xl text-navy">
          Fase {indice} de {FASES_CRM_JOURNEY.length}: {ativa.rotulo}
        </h2>
        <p className="mt-1 text-sm text-navy/70">{ativa.ritual}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SeloCanal canal={ativa.whatsapp.canal} />
          <span className="text-[11px] text-navy/55">
            {ativa.statusPiloto === "mvp" ? "MVP" : "Backlog"} · persistência em leads / caso / proposals
          </span>
        </div>
        <p className="mt-2 text-xs text-navy/60">{ativa.whatsapp.detalhe}</p>
        {ativa.microEntregaApp ? (
          <p className="mt-1 text-xs text-navy/65">
            Micro-entrega App: <span className="font-medium text-navy">{ativa.microEntregaApp}</span>
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={cta.to}
            hash={cta.hash}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream hover:bg-navy/90"
            data-cta-fase={ativa.id}
          >
            {cta.rotulo}
          </Link>
          {anterior ? (
            <button
              type="button"
              onClick={() => onSelecionar(anterior.id)}
              className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5"
            >
              ← {anterior.rotulo}
            </button>
          ) : null}
          {proxima ? (
            <button
              type="button"
              onClick={() => onSelecionar(proxima.id)}
              className="rounded-lg border border-gold bg-gold/15 px-3 py-2 text-sm text-navy hover:bg-gold/25"
            >
              {proxima.rotulo} →
            </button>
          ) : null}
        </div>
      </div>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {FASES_CRM_JOURNEY.map((f, i) => {
          const selecionada = f.id === ativa.id;
          return (
            <li key={f.id}>
              <button
                type="button"
                data-fase-journey={f.id}
                onClick={() => onSelecionar(f.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selecionada
                    ? "border-gold bg-gold/10 ring-1 ring-gold/40"
                    : "border-navy/10 bg-white hover:border-navy/25"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wide text-navy/45">
                  {i + 1} · {f.statusPiloto === "mvp" ? "MVP" : "Backlog"}
                </p>
                <p className="mt-0.5 text-sm font-medium text-navy">{f.rotulo}</p>
                <p className="mt-1 text-[11px] text-navy/55">{f.rotaDesk}</p>
              </button>
            </li>
          );
        })}
      </ol>

      <div className={`${CARTAO} text-xs text-navy/65`}>
        <p className="font-medium text-navy">Como operar esta jornada</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Use a Mesa (`/calls`) para Lead Bruto → Qualificado e handoff (pessoa + caso).</li>
          <li>Registre a proposta em `/propostas` — o handoff não cria proposta sozinho.</li>
          <li>Formalize em `/contratos` e libere App em `/acessos-portal`.</li>
          <li>Pesquisa e documentos: `/pesquisa-modulo` e `/atendimento#publicacao`.</li>
          <li>WhatsApp nunca dispara sozinho: fila `communication_queue` ou cópia manual.</li>
        </ol>
        <p className="mt-3">
          Funil por eventos:{" "}
          <Link to="/conversao" className="underline decoration-gold underline-offset-2">
            Conversão
          </Link>
          {" · "}
          Próximas ações:{" "}
          <Link to="/proximas-acoes" className="underline decoration-gold underline-offset-2">
            /proximas-acoes
          </Link>
        </p>
      </div>
    </div>
  );
}
