import { Link } from "@tanstack/react-router";

import { FASES_MOTOR_CIDADANIA } from "@/lib/motor-cidadania";
import {
  MOTOR_CIDADANIA_SOB,
  MOTORES_TABELAS,
  ROTULO_ESTADO_MOTOR,
} from "@/lib/motores-tabelas";
import { rotuloTabela } from "@/lib/rotulo-negocio";

function classeEstado(estado: string) {
  if (estado === "IMPLEMENTADO_EM_FLUXO_REAL" || estado === "com_dado") return "bg-gold/15 text-navy";
  if (estado === "NAO_IMPLEMENTADO" || estado === "REFERENCIA_LEGADA") return "bg-navy/5 text-navy/55";
  return "bg-terracotta/10 text-terracotta";
}

/**
 * Índice dos motores P0–P11 para a tela que EXECUTA — não é o produto.
 * Cada linha abre a rota do Desk onde a escrita acontece.
 */
export function MotoresPrimordiais() {
  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <h2 className="text-lg font-medium text-foreground">Motores primordiais P0–P11</h2>
      <p className="mb-3 mt-1 text-sm text-navy/65">
        Esta tabela não executa nada. Cada motor abre a tela do Desk onde a gravação acontece. O
        Planejador de Cidadania (fases 0–8) mora em {MOTOR_CIDADANIA_SOB}, no Caso 360.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-wide text-navy/65">
            <tr>
              <th className="py-2 pr-3">Motor</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2 pr-3">Onde executar</th>
              <th className="py-2">Não criar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOTORES_TABELAS.map((m) => (
              <tr key={m.id}>
                <td className="py-2 pr-3 font-medium text-foreground">{m.motor}</td>
                <td className="py-2 pr-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${classeEstado(m.estado)}`}>
                    {ROTULO_ESTADO_MOTOR[m.estado]}
                  </span>
                  <p className="mt-1 text-[10px] text-navy/60">
                    Homologação da Proprietária: {m.homologacaoProprietaria}
                  </p>
                  {m.lacunas.length ? (
                    <ul className="mt-1 list-disc pl-4 text-[10px] text-navy/60">
                      {m.lacunas.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  ) : null}
                </td>
                <td className="py-2 pr-3 text-navy/65">
                  <Link to={m.rotaDesk} className="font-medium text-navy underline underline-offset-2">
                    Abrir no Desk
                  </Link>
                  {m.oQueJaEscreve ? (
                    <p className="mt-1 text-[10px] text-foreground/80">{m.oQueJaEscreve}</p>
                  ) : null}
                  {m.tabelas.length > 0 ? (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[10px] text-navy/65/80">
                        Tabelas ({m.tabelas.map((t) => rotuloTabela(t)).join(" · ")})
                      </summary>
                      <code className="mt-1 block font-mono text-[10px]">{m.tabelas.join(" · ")}</code>
                    </details>
                  ) : (
                    <p className="mt-1 text-[10px]">Visual / marca — sem tabela nova</p>
                  )}
                </td>
                <td className="py-2 text-navy/65">
                  {m.naoCriar.length ? m.naoCriar.join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-5 text-sm font-medium text-foreground">
        Planejador de Cidadania — fases 0–8 ({MOTOR_CIDADANIA_SOB})
      </h3>
      <p className="mb-2 mt-1 text-xs text-navy/65">
        Sem country_catalog, sem percentual de elegibilidade, sem preço na trilha jurídica. A
        escrita da fase 4 (tarefa de avaliação) está no Caso 360 → Indicadores.
      </p>
      <ol className="grid gap-2 sm:grid-cols-3">
        {FASES_MOTOR_CIDADANIA.map((f) => (
          <li key={f.fase} className="rounded-lg border border-navy/10 px-3 py-2">
            <p className="text-[11px] font-medium text-foreground">
              Fase {f.fase} — {f.nome}
            </p>
            <p className="mt-1 text-[10px] text-navy/65">
              {f.tabelas.map((t) => rotuloTabela(t)).join(" · ")}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
