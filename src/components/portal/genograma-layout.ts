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

export function layoutGenograma(pessoas: readonly PessoaNaArvore[]) {
  const geracoes = [...new Set(pessoas.map((p) => p.geracao ?? 1))].sort((a, b) => b - a);
  const largura = Math.max(540, ...geracoes.map((g) => pessoas.filter((p) => (p.geracao ?? 1) === g).length * 190 + 80));
  let y = 90;
  const nos = geracoes.flatMap((g) => {
    const grupo = pessoas.filter((p) => (p.geracao ?? 1) === g);
    const linhaY = y;
    const preparados = grupo.map((pessoa) => ({ pessoa, linhas: linhasNome(pessoa.nome) }));
    const alturaRotulo = Math.max(2, ...preparados.map((p) => p.linhas.length)) * 17;
    y += Math.max(230, 56 + alturaRotulo + 140);
    return preparados.map((p, coluna) => ({ ...p, x: largura / 2 + (coluna - (grupo.length - 1) / 2) * 190, y: linhaY, geracaoY: 56 + Math.max(2, p.linhas.length) * 17 + 1 }));
  });
  return { nos, largura, altura: Math.max(340, y - 80) };
}

export function enquadramentoGenograma(largura: number, viewport: number) {
  const zoom = Math.min(1, Math.max(0.4, (viewport - 24) / largura));
  return { zoom, left: Math.max(0, (largura * zoom - viewport) / 2), top: 0 };
}