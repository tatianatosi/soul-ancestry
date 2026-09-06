/**
 * ANA-SAVE-SEC-01 — verificação pós-salvamento.
 *
 * Regra: salvar não é "o servidor não deu erro". Depois de gravar, o registro é
 * relido do servidor e cada campo enviado é comparado com o campo retornado.
 * Divergência vira erro explícito; nunca estado de sucesso.
 */

export type Divergencia = {
  campo: string;
  enviado: unknown;
  persistido: unknown;
};

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

/** Normaliza para comparação tolerante a tipo de coluna (data, número, texto, lista). */
export function normalizarValor(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "";
  if (Array.isArray(valor)) return JSON.stringify(valor.map((v) => normalizarValor(v)));
  if (typeof valor === "boolean") return valor ? "true" : "false";
  if (typeof valor === "number") return String(valor);
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor).trim();
}

function equivalente(enviado: unknown, persistido: unknown): boolean {
  const a = normalizarValor(enviado);
  const b = normalizarValor(persistido);
  if (a === b) return true;
  // data enviada como YYYY-MM-DD contra timestamp devolvido pelo banco
  if (DATA_ISO.test(a) && b.startsWith(a)) return true;
  if (DATA_ISO.test(b) && a.startsWith(b)) return true;
  // 06/09/2026 — mesmo instante, formatos diferentes: "...615Z" (enviado pelo
  // cliente) contra "...615+00:00" (devolvido pelo Postgres). Comparar como
  // texto sempre falhava e disparava DIVERGENCIA_PERSISTENCIA falsa em toda
  // acao que grava timestamp com hora (ex.: aprovar revisao). Comparar o
  // instante real, nao a string.
  if (TIMESTAMP_ISO.test(a) && TIMESTAMP_ISO.test(b)) {
    const ta = Date.parse(a);
    const tb = Date.parse(b);
    if (Number.isFinite(ta) && Number.isFinite(tb) && ta === tb) return true;
  }
  // numérico com formatação distinta (ex.: "80" x "80.00")
  const na = Number(a);
  const nb = Number(b);
  if (a !== "" && b !== "" && Number.isFinite(na) && Number.isFinite(nb) && na === nb) return true;
  return false;
}

/** Compara o payload enviado com o registro relido do servidor. */
export function compararPersistencia(
  enviado: Record<string, unknown>,
  persistido: Record<string, unknown> | null | undefined,
): Divergencia[] {
  if (!persistido) {
    return Object.keys(enviado).map((campo) => ({
      campo,
      enviado: enviado[campo],
      persistido: null,
    }));
  }
  const saida: Divergencia[] = [];
  for (const campo of Object.keys(enviado)) {
    if (enviado[campo] === undefined) continue;
    if (!equivalente(enviado[campo], persistido[campo])) {
      saida.push({ campo, enviado: enviado[campo], persistido: persistido[campo] ?? null });
    }
  }
  return saida;
}

export function mensagemDivergencia(divergencias: Divergencia[]): string {
  const lista = divergencias
    .map((d) => `${d.campo} (enviado "${normalizarValor(d.enviado)}", gravado "${normalizarValor(d.persistido)}")`)
    .join("; ");
  return `DIVERGENCIA_PERSISTENCIA: o servidor confirmou a gravação, mas a releitura não bate. Campo(s): ${lista}.`;
}

/** Lança quando há divergência — impede a tela de exibir sucesso falso. */
export function exigirPersistenciaConferida(
  enviado: Record<string, unknown>,
  persistido: Record<string, unknown> | null | undefined,
): Divergencia[] {
  const divergencias = compararPersistencia(enviado, persistido);
  if (divergencias.length > 0) throw new Error(mensagemDivergencia(divergencias));
  return divergencias;
}
