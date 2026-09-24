import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import {
  MAPEAMENTO_ANEXOS_PAGINAS,
  PROTECOES_ESCOPO,
  ROTULO_COBERTURA,
  type EstadoCobertura,
  type LinhaCobertura,
} from "@/lib/escopo-proposta";

const TOM: Record<EstadoCobertura, string> = {
  coberto: "border-navy/30 bg-cream text-navy",
  importado_a_confirmar: "border-gold bg-gold/15 text-navy",
  parametro_vazio: "border-gold bg-gold/10 text-navy",
  nao_localizado_na_proposta: "border-terracotta bg-terracotta/10 text-terracotta",
  divergente: "border-terracotta bg-terracotta/15 text-terracotta",
  opcional_nao_declarado: "border-navy/20 bg-cream text-navy/70",
};

export type EscopoPropostaDados = {
  validade: { valida: boolean; motivos: string[] };
  cobertura: LinhaCobertura[];
  conflitos: number;
};

export function EscopoProposta({
  dados,
  proposta,
}: {
  dados: EscopoPropostaDados | null | undefined;
  proposta: { versao?: number | null; status?: string | null; origem?: string | null; paginas_registradas?: number[] | null } | null;
}) {
  if (!dados) return null;
  const linhas = dados.cobertura ?? [];
  const paginas = proposta?.paginas_registradas ?? [];

  return (
    <CaCard variante="compacto" titulo="Escopo — proposta Canva vigente aprovada (páginas 1–7)">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Selo
          tom={dados.validade.valida ? "ok" : "alerta"}
          texto={dados.validade.valida ? "Fonte mandatória válida" : "Fonte mandatória inválida"}
        />

        <span className="text-navy/70">
          Proposta {proposta?.versao ? `v${proposta.versao}` : "sem versão"} · status {proposta?.status ?? "—"} · origem{" "}
          {proposta?.origem ?? "não declarada"} · páginas registradas {paginas.length ? paginas.join(", ") : "nenhuma"}
        </span>
      </div>

      {!dados.validade.valida && (
        <ul className="mt-3 space-y-1 text-xs text-terracotta">
          {dados.validade.motivos.map((m) => (
            <li key={m}>• {m}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead className="text-navy/60">
            <tr>
              <th className="border-b border-navy/15 py-2 pr-3">Campo de escopo</th>
              <th className="border-b border-navy/15 py-2 pr-3">Página/origem</th>
              <th className="border-b border-navy/15 py-2 pr-3">Parâmetro de destino</th>
              <th className="border-b border-navy/15 py-2 pr-3">Anexo</th>
              <th className="border-b border-navy/15 py-2 pr-3">Cobertura</th>
              <th className="border-b border-navy/15 py-2">Divergência</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.campo} className="align-top">
                <td className="border-b border-navy/10 py-2 pr-3 font-medium text-navy">
                  {l.label}
                  {l.obrigatorio ? <span className="text-terracotta"> *</span> : null}
                </td>
                <td className="border-b border-navy/10 py-2 pr-3 text-navy/70">{l.origem}</td>
                <td className="border-b border-navy/10 py-2 pr-3 text-navy/70">
                  {l.parametros.map((p) => (
                    <div key={p.campo}>
                      <code>{p.campo}</code> — {p.valor ? `${p.status ?? "sem status"} · ${p.origem ?? "origem não declarada"}` : "vazio"}
                    </div>
                  ))}
                </td>
                <td className="border-b border-navy/10 py-2 pr-3 text-navy/70">{l.anexos.join(", ") || "—"}</td>
                <td className="border-b border-navy/10 py-2 pr-3">
                  <span className={`inline-block rounded border px-2 py-0.5 ${TOM[l.estado]}`}>{ROTULO_COBERTURA[l.estado]}</span>
                </td>
                <td className="border-b border-navy/10 py-2 text-terracotta">{l.divergencia ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded border border-navy/15 bg-cream p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/70">Mapeamento normativo página → anexo</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/80">
            {MAPEAMENTO_ANEXOS_PAGINAS.map((m) => (
              <li key={m.anexo}>
                <strong>{m.anexo}</strong> — {m.paginas ? `páginas ${m.paginas.join(", ")}` : "sem página fixa"}: {m.regra}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-navy/15 bg-cream p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/70">Proteções aplicadas</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/80">
            {PROTECOES_ESCOPO.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </div>
      </div>
    </CaCard>
  );
}
