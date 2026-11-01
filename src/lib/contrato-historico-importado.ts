/**
 * Histórico do contrato vindo do banco antigo (`contract_history_imports`,
 * importado em 30/10/2026, somente leitura). Não é versão ativa: não muda
 * status, valor, cláusula nem assinatura. Aqui só se resume o que foi guardado.
 */
export type LinhaHistoricoImportado = {
  id: string;
  source_table: string;
  source_created_at: string | null;
  payload: Record<string, unknown> | null;
  import_note: string | null;
};

export type ResumoHistoricoImportado = {
  versoes: { numero: number | null; status: string; criadaEm: string | null }[];
  eventos: { tipo: string; quando: string | null }[];
  validacoes: { total: number; porStatus: Record<string, number> };
  vazio: boolean;
};

const texto = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

export function resumirHistoricoImportado(
  linhas: LinhaHistoricoImportado[],
): ResumoHistoricoImportado {
  const versoes: ResumoHistoricoImportado["versoes"] = [];
  const eventos: ResumoHistoricoImportado["eventos"] = [];
  const porStatus: Record<string, number> = {};
  let totalValidacoes = 0;

  for (const l of linhas) {
    const p = l.payload ?? {};
    if (l.source_table === "contract_versions") {
      const n = typeof p["version_number"] === "number" ? (p["version_number"] as number) : null;
      versoes.push({
        numero: n,
        status: texto(p["status"]) ?? "sem status",
        criadaEm: texto(p["created_at"]) ?? l.source_created_at,
      });
    } else if (l.source_table === "contract_review_events") {
      eventos.push({
        tipo: texto(p["event_type"]) ?? "evento",
        quando: texto(p["occurred_at"]) ?? l.source_created_at,
      });
    } else if (l.source_table === "contract_validation_results") {
      totalValidacoes += 1;
      const s = texto(p["status"]) ?? "sem status";
      porStatus[s] = (porStatus[s] ?? 0) + 1;
    }
  }

  versoes.sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
  eventos.sort((a, b) => (a.quando ?? "").localeCompare(b.quando ?? ""));
  return {
    versoes,
    eventos,
    validacoes: { total: totalValidacoes, porStatus },
    vazio: linhas.length === 0,
  };
}
