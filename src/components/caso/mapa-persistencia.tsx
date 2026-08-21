/**
 * ANA-SAVE-SEC-01 — item B: mapa formal campo → tabela/coluna/tipo/validação/permissão
 * exposto na própria ficha, com destaque para o que é somente leitura ou pendente técnico.
 * Painel apenas informativo: não grava, não envia nada.
 */

import { useMemo, useState } from "react";

import { MAPA_PERSISTENCIA, type LinhaPersistencia } from "@/lib/persistencia-caso";

const ROTULO_ESTADO: Record<LinhaPersistencia["estado"], string> = {
  implementado: "Salva no banco",
  somente_leitura: "Somente leitura",
  nao_mapeado: "Pendente técnico",
};

export function MapaPersistenciaCaso() {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const linhas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return MAPA_PERSISTENCIA;
    return MAPA_PERSISTENCIA.filter((l) =>
      [l.campoUi, l.entidade, l.tabela, l.coluna].some((c) => c.toLowerCase().includes(t)),
    );
  }, [busca]);

  const pendentes = MAPA_PERSISTENCIA.filter((l) => l.estado === "nao_mapeado").length;
  const leitura = MAPA_PERSISTENCIA.filter((l) => l.estado === "somente_leitura").length;

  return (
    <section className="mt-8 rounded-xl border border-navy/10 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-navy">Mapa de persistência desta ficha</h3>
          <p className="mt-1 text-xs text-navy/60">
            {MAPA_PERSISTENCIA.length} campos declarados · {leitura} somente leitura · {pendentes} pendente(s) técnico(s).
            Campo fora deste mapa é recusado pelo servidor com <code>CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA</code>.
          </p>
        </div>
        <button
          onClick={() => setAberto((a) => !a)}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy"
        >
          {aberto ? "Ocultar mapa" : "Ver mapa completo"}
        </button>
      </div>

      {aberto ? (
        <div className="mt-4">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar campo, tabela ou coluna"
            className="mb-3 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm text-navy"
          />
          <div className="max-h-96 overflow-auto rounded-lg border border-navy/10">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-navy/5 text-navy/70">
                <tr>
                  <th className="px-2 py-2 font-medium">Campo</th>
                  <th className="px-2 py-2 font-medium">Tabela.coluna</th>
                  <th className="px-2 py-2 font-medium">Tipo</th>
                  <th className="px-2 py-2 font-medium">Validação</th>
                  <th className="px-2 py-2 font-medium">Permissão</th>
                  <th className="px-2 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={`${l.tabela}-${l.campoUi}`} className="border-t border-navy/5 align-top">
                    <td className="px-2 py-2 text-navy">{l.campoUi}</td>
                    <td className="px-2 py-2 text-navy/70">
                      {l.tabela}.{l.coluna}
                    </td>
                    <td className="px-2 py-2 text-navy/70">{l.tipo}</td>
                    <td className="px-2 py-2 text-navy/70">{l.validacao}</td>
                    <td className="px-2 py-2 text-navy/70">{l.permissao}</td>
                    <td className="px-2 py-2">
                      <span
                        className={
                          l.estado === "implementado"
                            ? "rounded-full bg-navy/5 px-2 py-0.5 text-navy/70"
                            : "rounded-full bg-gold/20 px-2 py-0.5 font-medium text-navy"
                        }
                      >
                        {ROTULO_ESTADO[l.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
                {linhas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-4 text-navy/60">
                      Nenhum campo corresponde à busca.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
