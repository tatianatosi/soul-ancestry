/**
 * Cobertura contratual do caso — material, não documental (04/10/2026).
 *
 * Proprietária: "corrigir a lógica de cobertura: não dizer que falta escopo
 * quando o escopo está no contrato... validar cobertura material: pessoa, papel,
 * escopo, entregas, condição comercial e representação quando necessária" e
 * "listar apenas as pendências reais de assinatura inicial, em lista separada
 * dos instrumentos condicionais posteriores".
 *
 * Esta tela não consulta nem grava nada: exibe o que o leitor de preparação já
 * calculou com as funções puras de `contrato-blocos-incorporados.ts`.
 */

import { ROTULO_PAPEL_CONTRATUAL, type PapelContratual } from "@/lib/contrato-blocos-incorporados";

export type CoberturaContratualView = {
  completa: boolean;
  anexoIIncorporadoNoCorpo: boolean;
  blocos: { chave: string; titulo: string; clausula: number; pendencias: string[]; bloqueiaAssinaturaInicial: boolean }[];
  pessoas: {
    nome: string;
    papeis: PapelContratual[];
    escopoIndividual: string | null;
    valorIndividual: number | null;
    representadoPor: string | null;
    representacaoConfirmada: boolean;
    pendencias: string[];
  }[];
  impeditivas: { pessoa: string | null; campo: string; texto: string }[];
  posteriores: { pessoa: string | null; campo: string; texto: string }[];
  /** Os cinco anexos com a aplicabilidade real e o motivo. */
  anexos?: {
    codigo: string;
    titulo: string;
    aplicavel: boolean;
    obrigatorio: boolean;
    estado: string;
    motivo: string;
    pendencias: string[];
    bloqueiaAssinaturaInicial: boolean;
  }[];
  /** Instrumentos condicionais ainda não aplicáveis. */
  instrumentosPosteriores?: { codigo: string; condicao: string; motivo: string }[];
};

export function CoberturaContratual({ cobertura }: { cobertura: CoberturaContratualView }) {
  return (
    <section className="rounded-lg border border-navy/15 bg-card p-3" data-cobertura-contratual>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-navy">Cobertura contratual deste caso</h2>
        <span className="text-[11px] text-navy/55" data-cobertura-estado>
          {cobertura.completa ? "Completa para assinatura inicial" : `${cobertura.impeditivas.length} pendência(s) impeditiva(s)`}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-navy/60">
        {cobertura.anexoIIncorporadoNoCorpo
          ? "Escopo por pessoa, serviços, entregas e condição comercial estão incorporados ao corpo do contrato — não há Anexo I separado a emitir."
          : "O escopo contratado ainda não está coberto nem pelo corpo do contrato nem por Anexo I registrado."}
      </p>

      <div className="mt-3">
        <p className="text-[11px] font-semibold text-navy">Partes e papéis</p>
        <ul className="mt-1 space-y-0.5 text-[11px] text-navy/80" data-pessoas-contratuais>
          {cobertura.pessoas.map((p) => (
            <li key={p.nome}>
              <strong>{p.nome}</strong> —{" "}
              {p.papeis.length ? p.papeis.map((x) => ROTULO_PAPEL_CONTRATUAL[x]).join(", ") : "papel não registrado"}
              {p.representadoPor
                ? ` · representado por ${p.representadoPor}${p.representacaoConfirmada ? " (confirmada)" : " (a confirmar)"}`
                : ""}
              {p.escopoIndividual ? ` · ${p.escopoIndividual}` : ""}
              {p.pendencias.length ? (
                <span className="block text-terracotta">{p.pendencias.join(" · ")}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold text-navy">Blocos incorporados ao corpo</p>
        <ul className="mt-1 space-y-0.5 text-[11px] text-navy/75" data-blocos-incorporados>
          {cobertura.blocos.map((b) => (
            <li key={b.chave}>
              <strong>{b.titulo}</strong> <span className="text-navy/50">(cláusula {b.clausula})</span>
              {b.pendencias.length ? (
                <span className={b.bloqueiaAssinaturaInicial ? "text-terracotta" : "text-navy/55"}>
                  {" "}
                  · {b.pendencias.length} pendência(s)
                  {b.bloqueiaAssinaturaInicial ? " impeditiva(s)" : " não impeditiva(s)"}
                </span>
              ) : (
                <span className="text-navy/50"> · completo</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {cobertura.anexos?.length ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-navy">
            Anexos I a V — aplicabilidade real (nenhum deles bloqueia a assinatura inicial por ausência)
          </p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-navy/75" data-anexos-aplicabilidade>
            {cobertura.anexos.map((a) => (
              <li key={a.codigo} data-anexo={a.codigo} data-aplicavel={a.aplicavel ? "sim" : "nao"}>
                <strong>{a.titulo}</strong> · {a.aplicavel ? "aplicável" : "não aplicável"} · {a.estado}
                {a.pendencias.length ? (
                  <span className="text-terracotta"> · {a.pendencias.length} pendência(s) do próprio ato</span>
                ) : null}
                <span className="block text-navy/55">{a.motivo}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold text-terracotta">
            Pendências reais de assinatura inicial ({cobertura.impeditivas.length})
          </p>
          {cobertura.impeditivas.length ? (
            <ul className="mt-1 space-y-0.5 text-[11px] text-navy/80" data-pendencias-impeditivas>
              {cobertura.impeditivas.map((x, i) => (
                <li key={i}>
                  {x.pessoa ? `${x.pessoa} — ` : ""}
                  <strong>{x.campo}</strong>: {x.texto}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[11px] text-navy/55">Nenhuma. O conteúdo do contrato está completo.</p>
          )}
        </div>
        <div>
          <p className="text-[11px] font-semibold text-navy">
            Instrumentos e atos posteriores ({cobertura.posteriores.length})
          </p>
          {cobertura.posteriores.length ? (
            <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70" data-pendencias-posteriores>
              {cobertura.posteriores.map((x, i) => (
                <li key={i}>
                  {x.pessoa ? `${x.pessoa} — ` : ""}
                  <strong>{x.campo}</strong>: {x.texto}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[11px] text-navy/55">
              Nenhum. Autorização, procuração e alteração de escopo só existem quando o ato concreto aparecer.
            </p>
          )}
          {cobertura.instrumentosPosteriores?.length ? (
            <ul className="mt-1 space-y-0.5 text-[11px] text-navy/60" data-instrumentos-condicionais>
              {cobertura.instrumentosPosteriores.map((i) => (
                <li key={i.codigo}>
                  <strong>{i.codigo}</strong> — só quando: {i.condicao}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
