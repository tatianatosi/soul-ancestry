import {
  MATRIZ_CLAUSULAS_MODELO,
  MATRIZ_CLAUSULAS_VERSAO,
  ROTULO_FONTE_CLAUSULA,
  ROTULO_STATUS_CLAUSULA,
  ROTULO_TIPO_CLAUSULA,
  type LinhaClausulaAvaliada,
  type StatusClausula,
} from "@/lib/matriz-clausulas";
import { ROTULO_GATE } from "@/lib/anexos-i-v";

const COR: Record<StatusClausula, string> = {
  presente: "border-emerald-600/30 bg-emerald-50 text-emerald-800",
  pendente: "border-terracotta/30 bg-terracotta/10 text-terracotta",
  conflito: "border-terracotta/40 bg-terracotta/15 text-terracotta",
  bloqueante: "border-red-600/30 bg-red-50 text-red-700",
};

export function MatrizClausulas({ linhas }: { linhas: LinhaClausulaAvaliada[] }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-white p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Matriz de cláusulas A–P · {MATRIZ_CLAUSULAS_VERSAO}
        </p>
        <p className="text-[11px] text-navy/50">{MATRIZ_CLAUSULAS_MODELO}</p>
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-navy/50">
              <th className="px-2 py-1">Cláusula</th>
              <th className="px-2 py-1">Fonte</th>
              <th className="px-2 py-1">Tipo</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Parâmetro / versão de origem</th>
              <th className="px-2 py-1">Efeito nos gates</th>
              <th className="px-2 py-1">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.id} className="border-t border-navy/10 align-top">
                <td className="px-2 py-1.5 font-medium text-navy">
                  {l.id}. {l.titulo}
                  {!l.editavelPorCaso && (
                    <span className="ml-1 text-[10px] uppercase text-navy/40">não editável por caso</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-navy/70">{ROTULO_FONTE_CLAUSULA[l.fonte]}</td>
                <td className="px-2 py-1.5 text-navy/70">{ROTULO_TIPO_CLAUSULA[l.tipo]}</td>
                <td className="px-2 py-1.5">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase ${COR[l.status]}`}>
                    {ROTULO_STATUS_CLAUSULA[l.status]}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-navy/70">
                  {l.origem}
                  {l.parametros.length > 0 && (
                    <span className="block text-[10px] text-navy/45">{l.parametros.join(" · ")}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 text-navy/70">
                  {l.gates.length ? l.gates.map((g) => ROTULO_GATE[g]).join(" · ") : "Sem efeito de gate"}
                </td>
                <td className="px-2 py-1.5 text-navy/70">{l.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PerfilInstitucionalBloco({
  campos,
  versao,
  status,
  pendencias,
}: {
  campos: { campo: string; rotulo: string; valor: string }[];
  versao: string;
  status: string;
  pendencias: string[];
}) {
  return (
    <div className="rounded-lg border border-navy/10 bg-white p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Perfil institucional versionado — {status === "vigente" ? "vigente" : "em revisão jurídica"}
        </p>
        <p className="text-[11px] text-navy/50">
          {versao} · {status}
        </p>
      </div>
      <dl className="mt-2 divide-y divide-navy/10 rounded border border-navy/10">
        {campos.map((c) => (
          <div key={c.campo} className="grid grid-cols-[220px_1fr] gap-2 px-2 py-1.5 text-xs">
            <dt className="text-navy/55">{c.rotulo}</dt>
            <dd className="text-navy">{c.valor}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] text-navy/50">
        Dados institucionais não são editáveis dentro de caso. Exceção administrativa exige perfil autorizado, motivo,
        vigência e auditoria.
      </p>
      {pendencias.length > 0 && (
        <ul className="mt-2 space-y-1 text-[11px] text-terracotta">
          {pendencias.map((p) => (
            <li key={p}>• {p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
