/**
 * Validação cruzada de coerência do caso.
 *
 * O código canônico do caso carrega o qualificador de país (ex.: `AT` = Áustria
 * em `CA-CID-AT-FAM-2026-001`). Esse qualificador é confrontado com o
 * país/rota do Planejador, o país/rota parametrizado no contrato, a proposta
 * vinculada e os anexos/SKU derivados.
 *
 * Regra: divergência NUNCA é resolvida automaticamente, nem pela origem de
 * maior confiança. Ela vira conflito crítico e bloqueia as transições.
 */

export const CONFLITO_PAIS_ROTA = "case_country_route_conflict";

export const MENSAGEM_CONFLITO_PAIS_ROTA =
  "O código do caso indica Áustria (AT), mas o Planejador informou país/rota incompatível. Revise o parâmetro homologado antes de continuar.";

/** Qualificadores de país aceitos no código canônico. */
export const QUALIFICADORES_PAIS: Record<string, { pais: string; termos: string[] }> = {
  AT: { pais: "Áustria", termos: ["austr"] },
  IT: { pais: "Itália", termos: ["ital"] },
  PT: { pais: "Portugal", termos: ["portug"] },
  ES: { pais: "Espanha", termos: ["espanh"] },
  DE: { pais: "Alemanha", termos: ["aleman", "german"] },
  PL: { pais: "Polônia", termos: ["polon", "polôn", "poland"] },
  FR: { pais: "França", termos: ["fran"] },
};

function normalizar(v?: string | null) {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Qualificador de país embutido no código canônico (ex.: CA-CID-AT-FAM-...). */
export function qualificadorPaisDoCodigo(codigo?: string | null) {
  const partes = String(codigo ?? "").toUpperCase().split("-");
  const sigla = partes.find((p) => QUALIFICADORES_PAIS[p]);
  return sigla ? { sigla, ...QUALIFICADORES_PAIS[sigla] } : null;
}

/** true quando o texto declara o país esperado pelo qualificador. */
export function textoCompativel(texto: string | null | undefined, sigla: string) {
  const alvo = QUALIFICADORES_PAIS[sigla];
  if (!alvo) return true;
  const t = normalizar(texto);
  if (!t.trim()) return true; // vazio é pendência, não divergência
  return alvo.termos.some((termo) => t.includes(termo));
}

export type FonteCoerencia = {
  fonte: string;
  rotulo: string;
  valor: string | null | undefined;
};

export type ConflitoCoerencia = {
  chave: string;
  fonte: string;
  rotulo: string;
  esperado: string;
  encontrado: string;
  mensagem: string;
};

/**
 * Confronta o qualificador do código com cada fonte informada.
 * Retorna a lista de conflitos críticos (vazia quando tudo é coerente).
 */
export function validarCoerenciaCaso(input: { codigo?: string | null; fontes: FonteCoerencia[] }): {
  qualificador: { sigla: string; pais: string } | null;
  conflitos: ConflitoCoerencia[];
} {
  const q = qualificadorPaisDoCodigo(input.codigo);
  if (!q) return { qualificador: null, conflitos: [] };

  const conflitos: ConflitoCoerencia[] = [];
  for (const f of input.fontes) {
    const valor = String(f.valor ?? "").trim();
    if (!valor) continue;
    if (textoCompativel(valor, q.sigla)) continue;
    conflitos.push({
      chave: CONFLITO_PAIS_ROTA,
      fonte: f.fonte,
      rotulo: f.rotulo,
      esperado: q.pais,
      encontrado: valor,
      mensagem: `O código do caso indica ${q.pais} (${q.sigla}), mas ${f.rotulo} informou país/rota incompatível: “${valor}”. Revise o parâmetro homologado antes de continuar.`,
    });
  }

  return { qualificador: { sigla: q.sigla, pais: q.pais }, conflitos };
}
