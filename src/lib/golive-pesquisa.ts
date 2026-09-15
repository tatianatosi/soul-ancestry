/**
 * Cálculos puros da Pesquisa do caso (go-live).
 *
 * A operação canônica é por case_id: tudo aqui recebe já filtrado pelo caso.
 * A Biblioteca aparece só como acervo/fila editorial — nunca como segundo
 * motor de pesquisa. Nenhuma função inventa fonte, evidência ou achado.
 */

export type EvidenciaPesquisaCaso = {
  id: string;
  titulo?: string | null;
  tipo?: string | null;
  status?: string | null;
  fonteId?: string | null;
  registradaEm?: string | null;
  validadaEm?: string | null;
};

export type FontePesquisaCaso = {
  id: string;
  titulo?: string | null;
  tipo?: string | null;
  instituicao?: string | null;
  registradaEm?: string | null;
};

export type AchadoPesquisaCaso = {
  id: string;
  titulo?: string | null;
  validacao?: string | null;
  publicavel?: boolean;
  registradoEm?: string | null;
  validadoEm?: string | null;
  impactoArvore?: string | null;
};

export type CoberturaFonte = {
  origem: string;
  total: number;
  validadas: number;
  emRevisao: number;
};

/** Estado só de duas leituras reais: já validada, ou ainda em revisão. */
export function evidenciaValidada(e: EvidenciaPesquisaCaso): boolean {
  if (e.validadaEm) return true;
  return /validad|aprovad|publicad|confirmad/i.test(String(e.status ?? ""));
}

/**
 * Bloco 1 — cobertura por fonte: agrupa evidências pela fonte de origem
 * (quando gravada) ou pelo tipo declarado, com validada × em revisão.
 */
export function coberturaPorFonte(
  evidencias: readonly EvidenciaPesquisaCaso[],
  fontes: readonly FontePesquisaCaso[],
): CoberturaFonte[] {
  const nomeFonte = new Map(fontes.map((f) => [f.id, f.titulo || f.instituicao || f.tipo || "Fonte"]));
  const mapa = new Map<string, CoberturaFonte>();
  for (const e of evidencias) {
    const origem =
      (e.fonteId ? nomeFonte.get(e.fonteId) : null) || e.tipo || "Origem não informada";
    const atual = mapa.get(origem) ?? { origem, total: 0, validadas: 0, emRevisao: 0 };
    atual.total += 1;
    if (evidenciaValidada(e)) atual.validadas += 1;
    else atual.emRevisao += 1;
    mapa.set(origem, atual);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

export type PontoProducao = { rotulo: string; valor: number };

/** Chave ISO da segunda-feira da semana da data (sem deslocamento de fuso). */
function semanaDe(iso: string): string | null {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  const d = new Date(ano, mes - 1, dia);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Bloco 2 — produção de evidência: fontes, evidências e achados com data
 * gravada, agrupados por semana. Registro sem data fica de fora.
 */
export function producaoPorSemana(
  fontes: readonly FontePesquisaCaso[],
  evidencias: readonly EvidenciaPesquisaCaso[],
  achados: readonly AchadoPesquisaCaso[],
  semanas = 8,
): PontoProducao[] {
  const datas = [
    ...fontes.map((f) => f.registradaEm),
    ...evidencias.map((e) => e.registradaEm),
    ...achados.map((a) => a.registradoEm),
  ].filter((d): d is string => Boolean(d));
  const mapa = new Map<string, number>();
  for (const d of datas) {
    const chave = semanaDe(d);
    if (!chave) continue;
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .slice(-semanas);
}

export type FilaEditorial = {
  rascunho: number;
  revisao: number;
  aprovado: number;
  publicado: number;
};

/**
 * Bloco 3 — fila editorial da Biblioteca: acervo do caso em quatro estados.
 * Evidência e achado entram na mesma fila; nada muda de estado aqui.
 */
export function filaEditorial(
  evidencias: readonly EvidenciaPesquisaCaso[],
  achados: readonly AchadoPesquisaCaso[],
): FilaEditorial {
  const fila: FilaEditorial = { rascunho: 0, revisao: 0, aprovado: 0, publicado: 0 };
  const classificar = (estado: string) => {
    if (/publicad/i.test(estado)) fila.publicado += 1;
    else if (/aprovad|validad|confirmad/i.test(estado)) fila.aprovado += 1;
    else if (/revis|analis|pendente|divergente|insuficiente/i.test(estado)) fila.revisao += 1;
    else fila.rascunho += 1;
  };
  for (const e of evidencias) classificar(String(e.status ?? ""));
  for (const a of achados) classificar(String(a.validacao ?? ""));
  return fila;
}

/** Fila em formato de gráfico, sempre com os quatro estados visíveis. */
export function filaEmSerie(fila: FilaEditorial): PontoProducao[] {
  return [
    { rotulo: "Rascunho", valor: fila.rascunho },
    { rotulo: "Em revisão", valor: fila.revisao },
    { rotulo: "Aprovado", valor: fila.aprovado },
    { rotulo: "Publicado", valor: fila.publicado },
  ];
}

export type ImpactoArvore = {
  validados: number;
  aplicados: number;
  propostos: number;
  semImpacto: number;
  emRevisao: number;
  itens: { id: string; titulo: string; impacto: string; validadoEm: string | null }[];
};

/**
 * Impacto dos achados aprovados na árvore interna.
 *
 * Só conta o que está gravado: achado validado internamente e o impacto
 * declarado no próprio achado. Aprovação interna não publica nada para a
 * família e não cria vínculo sozinha.
 */
export function impactoNaArvore(achados: readonly AchadoPesquisaCaso[]): ImpactoArvore {
  const validados = achados.filter((a) => String(a.validacao ?? "") === "validado_internamente");
  const impactoDe = (a: AchadoPesquisaCaso) => String(a.impactoArvore ?? "nenhum");
  return {
    validados: validados.length,
    aplicados: validados.filter((a) => impactoDe(a) === "aplicado").length,
    propostos: validados.filter((a) => impactoDe(a) === "proposto").length,
    semImpacto: validados.filter((a) => impactoDe(a) === "nenhum").length,
    emRevisao: achados.length - validados.length,
    itens: validados
      .filter((a) => impactoDe(a) !== "nenhum")
      .map((a) => ({
        id: a.id,
        titulo: a.titulo ?? "Achado sem título",
        impacto: impactoDe(a),
        validadoEm: a.validadoEm ?? null,
      })),
  };
}
