/**
 * Entregas liberadas ao cliente — a mesma regra da aba Documentos do App
 * (`minhasEntregas`), num lugar só. Só `documents` com
 * `liberado_cliente === true` viram entrega; a lista chega já sem fixture.
 * Nunca lê evidência interna, fonte, dossiê ou documento não liberado.
 */

export type EntregaLiberada = {
  id: string;
  caseId: string | null;
  titulo: string;
  caso: string;
  liberadoEm: string | null;
};

export function entregasLiberadasParaCliente(
  documentos: readonly Record<string, any>[], // eslint-disable-line @typescript-eslint/no-explicit-any
  nomeDoCaso: ReadonlyMap<unknown, unknown>,
): EntregaLiberada[] {
  return documentos
    .filter((d) => d.liberado_cliente === true)
    .map((d) => ({
      id: d.id,
      caseId: (d.case_id as string | null) ?? null,
      titulo: d.titulo,
      caso: String(nomeDoCaso.get(d.case_id) ?? ""),
      liberadoEm: (d.liberado_em as string | null) ?? null,
    }));
}
