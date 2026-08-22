/**
 * Renderização somente-leitura dos Anexos I–V governados:
 * campos com fonte, pendências agrupadas e gates bloqueados.
 */

import { ROTULO_ESTADO_ANEXO } from "@/lib/anexos-dicionario";
import { documentoDoAnexo } from "@/lib/anexos-documento";
import { AnexoDocumento } from "@/components/contrato/anexo-documento";
import {
  ACOES_BLOQUEADAS_SEM_ANEXO_III,
  ANEXO_III_MODELO_VERSAO,
  ANEXO_IV_MODELO_VERSAO,
  ANEXO_V_MODELO_VERSAO,
  ANEXO_I_MODELO_VERSAO,
  REGRAS_MOTOR_ANEXO_III,
  REGRAS_MOTOR_ANEXO_IV,
  REGRAS_MOTOR_ANEXO_V,
  REGRAS_MOTOR_ANEXO_I,
  ROTULO_FONTE,
  ROTULO_GATE,
  ROTULO_GRUPO_PENDENCIA,
  pendenciasDosAnexos,
  type AnexoGovernado,
  type ConflitoFonte,
  type EntradaAnexosIaV,
  type GateContratual,
} from "@/lib/anexos-i-v";

export function AnexosIaV({ anexos, entrada }: { anexos: AnexoGovernado[]; entrada?: EntradaAnexosIaV }) {
  return (
    <div className="space-y-3">
      {anexos.map((a) => (
        <article key={a.codigo} id={`anexo-${a.codigo}`} className="rounded-lg border border-navy/15 bg-white p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-navy">{a.titulo}</p>
            <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
              {ROTULO_ESTADO_ANEXO[a.estado]}
              {a.condicional ? " · condicional" : ""}
            </span>
          </div>
          <p className="mt-1 text-xs text-navy/65">{a.finalidade}</p>
          <p className="mt-0.5 text-[11px] text-navy/50">Regra: {a.regra}</p>
          {a.codigo === "ANEXO_III_AUTORIZACAO_PESQUISA" && (
            <details className="mt-1 rounded border border-navy/10 bg-cream/40 p-2">
              <summary className="cursor-pointer text-[11px] font-medium text-navy/70">
                Regras do motor ({ANEXO_III_MODELO_VERSAO})
              </summary>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] text-navy/65">
                {REGRAS_MOTOR_ANEXO_III.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
              <p className="mt-1 text-[11px] font-medium text-navy/70">Bloqueado sem autorização válida:</p>
              <ul className="mt-0.5 space-y-0.5 pl-3 text-[11px] text-navy/65">
                {ACOES_BLOQUEADAS_SEM_ANEXO_III.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </details>
          )}
          {a.codigo === "ANEXO_IV_PROCURACAO" && (
            <details className="mt-1 rounded border border-navy/10 bg-cream/40 p-2">
              <summary className="cursor-pointer text-[11px] font-medium text-navy/70">
                Regras do motor ({ANEXO_IV_MODELO_VERSAO})
              </summary>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] text-navy/65">
                {REGRAS_MOTOR_ANEXO_IV.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </details>
          )}
          {a.codigo === "ANEXO_V_ALTERACAO_ESCOPO" && (
            <details className="mt-1 rounded border border-navy/10 bg-cream/40 p-2">
              <summary className="cursor-pointer text-[11px] font-medium text-navy/70">
                Regras do motor ({ANEXO_V_MODELO_VERSAO})
              </summary>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] text-navy/65">
                {REGRAS_MOTOR_ANEXO_V.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </details>
          )}
          {a.codigo === "ANEXO_I_ORDEM_SERVICO" && (
            <details className="mt-1 rounded border border-navy/10 bg-cream/40 p-2">
              <summary className="cursor-pointer text-[11px] font-medium text-navy/70">
                Regras do motor ({ANEXO_I_MODELO_VERSAO})
              </summary>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] text-navy/65">
                {REGRAS_MOTOR_ANEXO_I.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </details>
          )}
          <p className="text-[11px] text-navy/50">Motivo da seleção: {a.motivo}</p>

          <dl className="mt-2 divide-y divide-navy/5 rounded border border-navy/10">
            {a.campos.map((c) => (
              <div key={c.rotulo} className="grid gap-0.5 p-2 sm:grid-cols-[220px_1fr]">
                <dt className="text-[11px] text-navy/50">
                  {c.rotulo}
                  <span className="block text-[10px] text-navy/35">{ROTULO_FONTE[c.fonte] ?? c.fonte}</span>
                </dt>
                <dd className="text-xs text-navy/80">
                  {c.valor ?? <span className="text-terracotta">{c.observacaoAusencia ?? "Pendente — não inferido."}</span>}
                </dd>
              </div>
            ))}
          </dl>

          {a.pendencias.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-[11px] text-terracotta">
              {a.pendencias.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-[11px] text-navy/50">Impacto da ausência: {a.impactoAusencia}</p>
          <p className="text-[11px] text-navy/50">
            Destino: {a.destinos.map((d) => ROTULO_GATE[d]).join(" · ")}
            {a.gatesBloqueados.length > 0 && ` · Bloqueia: ${a.gatesBloqueados.map((d) => ROTULO_GATE[d]).join(", ")}`}
          </p>
          {entrada &&
            (() => {
              const doc = documentoDoAnexo(a, entrada);
              return doc ? <AnexoDocumento documento={doc} /> : null;
            })()}
        </article>
      ))}
    </div>
  );
}

export function PainelPendenciasContratuais({
  anexos,
  conflitos = [],
  gates = [],
}: {
  anexos: AnexoGovernado[];
  conflitos?: ConflitoFonte[];
  gates?: { gate: GateContratual; motivo: string }[];
}) {
  const pendencias = pendenciasDosAnexos(anexos);
  const grupos = [...new Set(pendencias.map((p) => p.grupo))];

  return (
    <section className="rounded-lg border border-navy/15 bg-white p-3">
      <h3 className="text-sm font-medium text-navy">Pendências agrupadas e efeito no gate</h3>
      {grupos.length === 0 && conflitos.length === 0 && <p className="mt-1 text-xs text-navy/60">Nenhuma pendência registrada.</p>}
      {grupos.map((g) => (
        <div key={g} className="mt-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">{ROTULO_GRUPO_PENDENCIA[g]}</p>
          <ul className="mt-1 space-y-1">
            {pendencias
              .filter((p) => p.grupo === g)
              .map((p) => (
                <li key={`${p.entidade}-${p.motivo}`} className="rounded border border-navy/10 p-2 text-[11px] text-navy/75">
                  <span className="font-medium text-navy">{p.motivo}</span>
                  <p className="text-navy/55">
                    {p.entidade} · responsável {p.responsavel} · severidade {p.severidade} · gate {ROTULO_GATE[p.gate]}
                  </p>
                  <p className="text-navy/45">Resolver em: {p.rotaResolucao}</p>
                </li>
              ))}
          </ul>
        </div>
      ))}

      {conflitos.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">{ROTULO_GRUPO_PENDENCIA.conflito_de_fontes}</p>
          <ul className="mt-1 space-y-1">
            {conflitos.map((c) => (
              <li key={c.campo} className="rounded border border-terracotta/30 bg-terracotta/5 p-2 text-[11px] text-navy/75">
                <span className="font-medium text-navy">{c.campo}</span>
                <p>
                  Atual: {c.valorAtual ?? "—"} ({ROTULO_FONTE[c.origemAtual] ?? c.origemAtual})
                </p>
                <p>
                  Concorrente: {c.valorConcorrente ?? "—"} ({ROTULO_FONTE[c.origemConcorrente] ?? c.origemConcorrente})
                </p>
                <p className="text-navy/55">
                  Exige revisão humana e justificativa. Bloqueia apenas: {ROTULO_GATE[c.transicaoBloqueada]}. Histórico preservado.
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {gates.length > 0 && (
        <div className="mt-3 rounded border border-navy/10 bg-cream/40 p-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">Gates bloqueados</p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70">
            {gates.map((g, i) => (
              <li key={`${g.gate}-${i}`}>
                • {ROTULO_GATE[g.gate]} — {g.motivo}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[10px] text-navy/45">Rascunho de trabalho nunca é bloqueado.</p>
        </div>
      )}
    </section>
  );
}
