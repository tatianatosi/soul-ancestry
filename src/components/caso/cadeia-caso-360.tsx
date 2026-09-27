import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { lerCadeiaCaso360 } from "@/lib/cadeia-caso-360.functions";
import type { EstadoCamada } from "@/lib/cadeia-caso-360";

function classeEstado(estado: EstadoCamada) {
  if (estado === "operavel") return "bg-gold/15 text-navy";
  if (estado === "bloqueado") return "bg-terracotta/10 text-terracotta";
  return "bg-navy/5 text-navy/55";
}

function rotuloEstado(estado: EstadoCamada) {
  if (estado === "operavel") return "Operável";
  if (estado === "bloqueado") return "Bloqueado";
  return "Pendente";
}

function Selo({ estado }: { estado: EstadoCamada }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${classeEstado(estado)}`}
    >
      {rotuloEstado(estado)}
    </span>
  );
}

/**
 * Cadeia Caso 360 (Corte 3, 27/09/2026) — camada de leitura unificada
 * pedida explicitamente pela Proprietária: produto-pai, trilha jurídica,
 * plano/jornada, estágio de liberação Desk→App e o raciocínio jurídico
 * automático (Corte 2), tudo na Visão do caso. Só leitura — nada aqui
 * substitui os writers reais das abas Jornada/Formalização/Pesquisa.
 */
export function CadeiaCaso360({ caseId }: { caseId: string }) {
  const carregar = useServerFn(lerCadeiaCaso360);
  const q = useQuery({
    queryKey: ["cadeia-caso-360", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  if (q.isLoading) {
    return <p className="mt-5 text-sm text-navy/55">Compondo produto-pai, trilha, plano e liberação…</p>;
  }
  if (q.isError || !q.data) {
    return (
      <p role="alert" className="mt-5 text-sm text-destructive">
        {q.error instanceof Error ? q.error.message : "Não foi possível compor a Cadeia Caso 360."}
      </p>
    );
  }

  const d = q.data;

  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Cadeia deste caso (camada unificada)
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-navy">Produto-pai</p>
            <Selo estado={d.produtoPai.estado} />
          </div>
          <p className="mt-1 text-[11px] text-navy/60">
            {d.produtoPai.codigo
              ? `${d.produtoPai.codigo} — ${d.produtoPai.nomeComercial ?? "sem nome"}`
              : "Nenhum produto-pai vinculado ainda."}
          </p>
          {d.produtoPai.composicaoFamiliar ? (
            <p className="mt-1 text-[11px] text-navy/50">Composição: {d.produtoPai.composicaoFamiliar}</p>
          ) : null}
        </div>

        <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-navy">Trilha jurídica</p>
            <Selo estado={d.trilhaJuridica.estado} />
          </div>
          <p className="mt-1 text-[11px] text-navy/60">
            {d.trilhaJuridica.pais
              ? `${d.trilhaJuridica.pais} · ${d.trilhaJuridica.via ?? "via não definida"}`
              : "Nenhuma trilha jurídica vinculada ainda."}
          </p>
        </div>

        <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-navy">Plano / jornada</p>
            <Selo estado={d.plano.estado} />
          </div>
          <p className="mt-1 text-[11px] text-navy/60">
            {d.plano.faseJornada ?? "Sem fase de jornada registrada"}
          </p>
        </div>

        <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-medium text-navy">Liberação Desk→App</p>
            <Selo estado={d.liberacao.estado} />
          </div>
          <p className="mt-1 text-[11px] text-navy/60">
            {d.liberacao.publicadas} publicada(s) · {d.liberacao.aprovadas} aprovada(s) · {d.liberacao.rascunhos} rascunho(s)
          </p>
        </div>
      </div>

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-navy/50">
        Raciocínio jurídico automático (3 índices — nunca um score único)
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
          <p className="text-[12px] font-medium text-navy">Continuidade da linha</p>
          {d.raciocinioJuridico.continuidade.length === 0 ? (
            <p className="mt-1 text-[11px] text-navy/55">Nenhuma linha de pesquisa registrada ainda.</p>
          ) : (
            d.raciocinioJuridico.continuidade.map((c, i) => (
              <p key={i} className="mt-1 text-[11px] text-navy/60">
                {c.proporcao === null ? "sem elos ainda" : `${Math.round(c.proporcao * 100)}% dos elos comprovados`}
                {c.pendencias.length ? ` · ${c.pendencias[0]}` : ""}
              </p>
            ))
          )}
        </div>
        <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
          <p className="text-[12px] font-medium text-navy">Completude documental</p>
          <p className="mt-1 text-[11px] text-navy/60">
            {d.raciocinioJuridico.completude.proporcaoValidada === null
              ? "sem evidência ainda"
              : `${Math.round(d.raciocinioJuridico.completude.proporcaoValidada * 100)}% das evidências validadas`}
          </p>
          {d.raciocinioJuridico.completude.pendencias[0] ? (
            <p className="mt-1 text-[11px] text-navy/50">{d.raciocinioJuridico.completude.pendencias[0]}</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
          <p className="text-[12px] font-medium text-navy">Confiabilidade jurídica</p>
          <p className="mt-1 text-[11px] text-navy/60">
            {d.raciocinioJuridico.confiabilidade.proporcaoRegrasAprovadas === null
              ? "sem regra vinculada ainda"
              : `${Math.round(d.raciocinioJuridico.confiabilidade.proporcaoRegrasAprovadas * 100)}% das regras aprovadas`}
          </p>
          {d.raciocinioJuridico.confiabilidade.pendencias[0] ? (
            <p className="mt-1 text-[11px] text-navy/50">{d.raciocinioJuridico.confiabilidade.pendencias[0]}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
