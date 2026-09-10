import { FASES_MOTOR_CIDADANIA } from "@/lib/motor-cidadania";
import {
  MOTOR_CIDADANIA_SOB,
  MOTORES_TABELAS,
  ROTULO_ESTADO_MOTOR,
} from "@/lib/motores-tabelas";
import { rotuloTabela } from "@/lib/rotulo-negocio";

function classeEstado(estado: string) {
  if (estado === "operando" || estado === "com_dado") return "bg-gold/15 text-navy";
  if (estado === "planta") return "bg-navy/5 text-navy/55";
  return "bg-terracotta/10 text-terracotta";
}

/**
 * Inventário visível dos motores P0–P11 e do Planejador de Cidadania 0–8.
 * Não cria 9º grupo no Desk nem área nova na Biblioteca Mestre.
 */
export function MotoresPrimordiais() {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-medium text-foreground">Motores primordiais P0–P11</h2>
      <p className="mb-3 mt-1 text-sm text-muted-foreground">
        Ordem do prompt-mestre. Cada motor aponta para tabelas que já existem. Não há 13º motor: o
        Planejador de Cidadania (fases 0–8) mora em {MOTOR_CIDADANIA_SOB}.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="py-2 pr-3">Motor</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2 pr-3">Onde grava</th>
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
                </td>
                <td className="py-2 pr-3 text-muted-foreground">
                  {m.tabelas.length === 0
                    ? "Visual / marca — sem tabela nova"
                    : m.tabelas.map((t) => rotuloTabela(t)).join(" · ")}
                  {"oQueJaEscreve" in m && m.oQueJaEscreve ? (
                    <p className="mt-1 text-[10px] text-foreground/70">{m.oQueJaEscreve}</p>
                  ) : null}
                  {m.tabelas.length > 0 ? (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[10px] text-muted-foreground/80">
                        Detalhes técnicos
                      </summary>
                      <code className="mt-1 block font-mono text-[10px]">{m.tabelas.join(" · ")}</code>
                    </details>
                  ) : null}
                </td>
                <td className="py-2 text-muted-foreground">
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
      <p className="mb-2 mt-1 text-xs text-muted-foreground">
        Sem country_catalog, sem percentual de elegibilidade, sem preço na trilha jurídica.
      </p>
      <ol className="grid gap-2 sm:grid-cols-3">
        {FASES_MOTOR_CIDADANIA.map((f) => (
          <li key={f.fase} className="rounded-lg border border-border px-3 py-2">
            <p className="text-[11px] font-medium text-foreground">
              Fase {f.fase} — {f.nome}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {f.tabelas.map((t) => rotuloTabela(t)).join(" · ")}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
