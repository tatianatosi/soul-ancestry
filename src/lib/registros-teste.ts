/**
 * Registros de teste, homologação e demonstração.
 *
 * 14/09/2026 — decisão da Proprietária: as telas do Desk mostram apenas o que
 * é real. Registros criados para teste, homologação ou demonstração continuam
 * no banco (nada é apagado) e só aparecem quando a pessoa pede explicitamente
 * "mostrar registros de teste".
 *
 * A classificação é apenas de leitura: não grava, não arquiva, não altera
 * nenhum campo.
 */

const PADROES = [
  /\bteste?s?\b/i,
  /\btest\b/i,
  /homolog/i,
  /\bdemo\b/i,
  /demonstra/i,
  /sandbox/i,
  /\bexemplo\b/i,
  /\bfake\b/i,
  /\bmock\b/i,
];

function marcado(valor: unknown): boolean {
  if (typeof valor !== "string" || !valor.trim()) return false;
  return PADROES.some((p) => p.test(valor));
}

/** `true` quando o registro foi criado para teste/homologação/demonstração. */
export function ehRegistroDeTeste(linha: {
  codigo?: unknown;
  case_id?: unknown;
  titulo?: unknown;
  nome?: unknown;
  cliente_nome?: unknown;
  demo?: unknown;
  is_demo?: unknown;
  papel_registro?: unknown;
}): boolean {
  if (linha.demo === true || linha.is_demo === true) return true;
  if (linha.papel_registro === "demonstracao") return true;
  return (
    marcado(linha.codigo) ||
    marcado(linha.case_id) ||
    marcado(linha.titulo) ||
    marcado(linha.nome) ||
    marcado(linha.cliente_nome)
  );
}

/** Separa uma lista em registros reais e registros de teste. */
export function separarRegistrosDeTeste<T extends Parameters<typeof ehRegistroDeTeste>[0]>(
  linhas: T[],
): { reais: T[]; teste: T[] } {
  const reais: T[] = [];
  const teste: T[] = [];
  for (const linha of linhas) (ehRegistroDeTeste(linha) ? teste : reais).push(linha);
  return { reais, teste };
}
