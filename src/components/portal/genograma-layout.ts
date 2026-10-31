import type { PessoaNaArvore } from "@/lib/arvore-publicacao";

/** Explicit, owner-authorized highlight; neither names nor age establish a root. */
export function raizAutorizada(casoId: string | null | undefined, pessoas: readonly PessoaNaArvore[]) {
  const id = casoId === "a11a0000-0000-4000-8000-000000000002"
    ? "b923bd30-21a4-49de-8384-f3a9d74429f0" : undefined;
  return pessoas.some((p) => p.chave === id) ? id : undefined;
}

/** Conservative glyph budget, including unbroken names; never discard characters. */
export function linhasNome(nome: string, largura = 150) {
  const linhas: string[] = [];
  let linha = "";
  const medir = (s: string) => [...s].reduce((n, c) => n + (/[MW@]/.test(c) ? 12 : /[ilI .,'-]/.test(c) ? 4 : 8), 0);
  for (const palavra of nome.trim().split(/\s+/)) {
    if (linha && medir(`${linha} ${palavra}`) > largura) { linhas.push(linha); linha = ""; }
    for (const letra of palavra) {
      if (medir(linha + letra) > largura) { linhas.push(linha); linha = ""; }
      linha += letra;
    }
    linha += " ";
  }
  if (linha.trim()) linhas.push(linha.trim());
  return linhas.map((l) => l.trim());
}

type VinculoLayout = { de: string; para: string; tipo: "pai_mae" | "conjuge" };

/**
 * 31/10/2026 — a published explicit filiação (`de` = pai/mãe, `para` = filho/a)
 * always wins over a contradictory published generation number: a parent is
 * drawn at least one row above the child, and spouses share a row. Only
 * explicit published relationships move anyone; nothing is inferred from names.
 */
export function geracoesCoerentes<T extends PessoaNaArvore>(pessoas: readonly T[], vinculos: readonly VinculoLayout[]): T[] {
  const g = new Map(pessoas.map((p) => [p.chave, p.geracao ?? 1]));
  for (let passo = 0; passo < pessoas.length * 2 + 2; passo++) {
    let mudou = false;
    for (const v of vinculos) {
      const a = g.get(v.de), b = g.get(v.para);
      if (a === undefined || b === undefined) continue;
      if (v.tipo === "pai_mae" && a <= b) { g.set(v.de, b + 1); mudou = true; }
      if (v.tipo === "conjuge" && a !== b) { const m = Math.max(a, b); g.set(v.de, m); g.set(v.para, m); mudou = true; }
    }
    if (!mudou) break;
  }
  return pessoas.map((p) => (g.get(p.chave) === (p.geracao ?? 1) ? p : { ...p, geracao: g.get(p.chave)! }));
}

/** Rectangular cards (mockup p.6): y is the card top; altura is the card height. */
export const CARTAO_LARGURA = 170;
/** 29/10/2026: rótulo de ano autorizado por pessoa (ex.: "n. 1873"); ausente = sem linha. */
export function layoutGenograma(pessoas: readonly PessoaNaArvore[], anosPorPessoa?: Readonly<Record<string, string>>, vinculos: readonly VinculoLayout[] = []) {
  const geracoes = [...new Set(pessoas.map((p) => p.geracao ?? 1))].sort((a, b) => b - a);
  const largura = Math.max(540, ...geracoes.map((g) => pessoas.filter((p) => (p.geracao ?? 1) === g).length * 200 + 80));
  let y = 44;
  const rotulos: { geracao: number; y: number }[] = [];
  // Children sit under their published parents: order each row by the mean column of its parents.
  const coluna = new Map<string, number>();
  const nos = geracoes.flatMap((g) => {
    const grupo = pessoas
      .filter((p) => (p.geracao ?? 1) === g)
      .map((p, i) => {
        const pais = vinculos.filter((v) => v.tipo === "pai_mae" && v.para === p.chave).map((v) => coluna.get(v.de)).filter((c): c is number => c !== undefined);
        return { p, peso: pais.length ? pais.reduce((s, c) => s + c, 0) / pais.length : Number.POSITIVE_INFINITY, i };
      })
      .sort((a, b) => (a.peso === b.peso ? a.i - b.i : a.peso - b.peso))
      .map(({ p }) => p);
    const linhaY = y;
    const preparados = grupo.map((pessoa) => ({ pessoa, linhas: linhasNome(pessoa.nome), ano: anosPorPessoa?.[pessoa.chave] ?? null }));
    const temAno = preparados.some((p) => p.ano);
    const altura = 22 + Math.max(1, ...preparados.map((p) => p.linhas.length)) * 16 + (temAno ? 16 : 0) + 8;
    rotulos.push({ geracao: g, y: linhaY - 10 });
    y += altura + 64;
    return preparados.map((p, indice) => {
      const x = largura / 2 + (indice - (grupo.length - 1) / 2) * 186;
      coluna.set(p.pessoa.chave, x);
      return { ...p, altura, x, y: linhaY };
    });
  });
  return { nos, rotulos, largura, altura: Math.max(240, y - 44) };
}

/** Opens showing every generation (oldest to "Você") when the viewport height is known. */
export function enquadramentoGenograma(largura: number, viewport: number, alturaConteudo?: number, alturaViewport?: number) {
  const porAltura = alturaConteudo && alturaViewport ? (alturaViewport - 16) / alturaConteudo : 1;
  const zoom = Math.round(Math.min(1, Math.max(0.3, Math.min((viewport - 24) / largura, porAltura))) * 100) / 100;
  return { zoom, left: Math.max(0, (largura * zoom - viewport) / 2), top: 0 };
}