// Regras puras da triagem (Bloco Q01): sem git, sem disco. Usadas por scripts/triagem-branches-e-docs.mjs e pelos testes.

export const VEREDITOS = [
  "JA_NA_MAIN",
  "ENTREGUE",
  "DOC_SEM_EXECUCAO",
  "PORTAR_ARQUIVOS_NOVOS",
  "PORTAR_OU_SUPERADO_REVISAR",
  "ERRO_GIT",
];

export const ehDoc = (p) =>
  /^(docs|\.lovable|\.cursor|reviews|\.cartographer)\//.test(p) ||
  (/\.(md|mdx|txt|csv|json)$/.test(p) && !/^(src|supabase|scripts)\//.test(p));

/**
 * Lê a saída de `git diff --name-status -M` em entradas { status, caminho }.
 * Renomeação/cópia vale pelo caminho novo; remoção fica marcada para não contar como "ausente na main".
 */
export function lerNameStatus(saida) {
  return String(saida ?? "")
    .split("\n")
    .filter(Boolean)
    .map((linha) => {
      const partes = linha.split("\t");
      const status = partes[0].charAt(0);
      const caminho = status === "R" || status === "C" ? partes[2] : partes[1];
      return { status, caminho };
    })
    .filter((e) => e.caminho);
}

/**
 * Veredito de uma branch.
 * - `frente` null = o git falhou ao contar commits: ERRO_GIT (nunca vira 0/JA_NA_MAIN).
 * - `arquivos`: [{ status, caminho, noRef, naMain, erro }] — blobs (sha) na branch e na main; `erro` = leitura falhou.
 */
export function classificarBranch({ frente, arquivos = [] }) {
  if (frente === null || frente === undefined || Number.isNaN(frente)) {
    return { veredito: "ERRO_GIT", iguais: 0, divergem: 0, ausentes: 0, removidos: 0, erros: 1, soDocumentacao: false };
  }
  if (frente === 0) return { veredito: "JA_NA_MAIN", iguais: 0, divergem: 0, ausentes: 0, removidos: 0, erros: 0, soDocumentacao: false };
  const codigo = arquivos.filter((a) => !ehDoc(a.caminho));
  let iguais = 0,
    divergem = 0,
    ausentes = 0,
    removidos = 0,
    erros = 0;
  for (const a of codigo) {
    if (a.erro) erros++;
    else if (a.status === "D" || !a.noRef) removidos++;
    else if (!a.naMain) ausentes++;
    else if (a.naMain === a.noRef) iguais++;
    else divergem++;
  }
  let veredito;
  if (erros) veredito = "ERRO_GIT";
  else if (!codigo.length) veredito = "DOC_SEM_EXECUCAO";
  else if (!divergem && !ausentes && !removidos) veredito = "ENTREGUE";
  else if (ausentes && !divergem && !removidos) veredito = "PORTAR_ARQUIVOS_NOVOS";
  else veredito = "PORTAR_OU_SUPERADO_REVISAR";
  return { veredito, iguais, divergem, ausentes, removidos, erros, soDocumentacao: !codigo.length };
}

export const MARCADORES = [
  ["PLANEJADO", /\[PLANEJADO\]/],
  ["PENDENTE", /PENDENTE/i],
  ["CHECKBOX_ABERTO", /^\s*[-*] \[ \]/],
  ["PROXIMOS_PASSOS", /Pr[oó]ximos passos/i],
  ["TODO", /\bTODO\b/],
];

export function marcadorDaLinha(texto) {
  const m = MARCADORES.find(([, r]) => r.test(texto));
  return m ? m[0] : null;
}

export const csv = (m) => m.map((l) => l.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n") + "\n";
