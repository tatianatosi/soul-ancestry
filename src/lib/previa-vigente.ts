/**
 * Prévia vigente, defasagem e bloqueio de saída (08/10/2026).
 *
 * Medido no caso da Ana antes de escrever este módulo: existem 7 prévias do
 * mesmo contrato, e a tela mostrava todas como "versão congelada". Só que
 * v1–v6 nasceram SEM corpo contratual (`legado_sem_corpo = true`, 7–10 KB de
 * HTML), e a única prévia com o contrato inteiro (43 KB) é o rascunho
 * editável. Como o botão de PDF aceitava qualquer prévia escolhida na lista,
 * dava para baixar um "contrato" que não tem o contrato dentro.
 *
 * Regras, nenhuma inventada:
 *  - VIGENTE é uma só: o rascunho editável quando existe; senão, a congelada
 *    de maior versão. Prévia arquivada nunca é vigente — `archived_at` +
 *    `archive_reason` é o mecanismo que o schema já tem para "substituída sem
 *    apagar" (o CHECK de `estado` só aceita `rascunho_editavel`/`congelado`,
 *    então NÃO se inventa um estado novo).
 *  - DEFASADA é prévia gerada antes da última alteração de parâmetro. O
 *    documento não pode sair mais novo que os dados que o originaram.
 *  - Sem corpo contratual não é documento: não vira PDF nem vai para revisão
 *    ou assinatura, por mais "congelada" que esteja.
 */

export type PreviaRegistro = {
  id: string;
  versao?: number | null;
  tipo?: string | null;
  estado?: string | null;
  congelado_em?: string | null;
  created_at?: string | null;
  aprovado_em?: string | null;
  corpo_contratual?: boolean | null;
  legado_sem_corpo?: boolean | null;
};

const ts = (v: unknown): number => {
  const t = Date.parse(String(v ?? ""));
  return Number.isNaN(t) ? 0 : t;
};

/** Quando a prévia foi gerada (congelamento, ou criação do rascunho). */
export function geradaEm(p: PreviaRegistro): string | null {
  return p.congelado_em ?? p.created_at ?? null;
}

/** A prévia que vale — rascunho editável, senão a congelada de maior versão. */
export function previaVigente(previas: readonly PreviaRegistro[]): PreviaRegistro | null {
  const vivas = previas.filter((p) => p?.id);
  if (!vivas.length) return null;
  const rascunho = vivas.find((p) => p.estado === "rascunho_editavel");
  if (rascunho) return rascunho;
  return [...vivas].sort((a, b) => (Number(b.versao ?? 0) - Number(a.versao ?? 0)) || ts(geradaEm(b)) - ts(geradaEm(a)))[0] ?? null;
}

/** Prévias que a vigente substitui — ficam no histórico, nunca são apagadas. */
export function previasSubstituidas(previas: readonly PreviaRegistro[]): PreviaRegistro[] {
  const vigente = previaVigente(previas);
  if (!vigente) return [];
  return previas.filter((p) => p.id !== vigente.id);
}

/** A prévia traz o contrato dentro? Prévia legada nasceu sem corpo. */
export function temCorpoContratual(p: PreviaRegistro | null): boolean {
  if (!p) return false;
  if (p.legado_sem_corpo === true) return false;
  return p.corpo_contratual !== false;
}

/** Gerada antes da última alteração de parâmetro = defasada. */
export function previaDefasada(p: PreviaRegistro | null, parametroAlteradoEm: string | null | undefined): boolean {
  if (!p) return false;
  const alterado = ts(parametroAlteradoEm);
  if (!alterado) return false;
  const gerada = ts(geradaEm(p));
  if (!gerada) return true;
  return alterado > gerada;
}

export const AVISO_PREVIA_DESATUALIZADA =
  "Prévia desatualizada: algum parâmetro mudou depois que ela foi gerada. Gere a prévia de novo antes de baixar o PDF, pedir revisão ou preparar assinatura.";

export const AVISO_PREVIA_SEM_CORPO =
  "Esta prévia não tem o corpo do contrato (versão legada, anterior ao modelo vigente). Gere a prévia de novo para produzir o documento completo.";

/**
 * Motivo para impedir PDF/revisão/assinatura — `null` quando pode sair.
 * Mesma regra na tela e no servidor: a tela explica, o servidor recusa.
 */
export function motivoBloqueioSaida(
  p: PreviaRegistro | null,
  parametroAlteradoEm: string | null | undefined,
): string | null {
  if (!p) return "Nenhuma prévia gerada para este contrato.";
  if (!temCorpoContratual(p)) return AVISO_PREVIA_SEM_CORPO;
  if (previaDefasada(p, parametroAlteradoEm)) return AVISO_PREVIA_DESATUALIZADA;
  return null;
}

/** Cabeçalho: versão do modelo e quando a prévia foi gerada. */
export function rotuloPrevia(
  p: PreviaRegistro | null,
  modeloVersao: string,
  totalClausulas: number,
): string {
  if (!p) return "Sem prévia gerada";
  const quando = geradaEm(p);
  const data = quando ? new Date(quando).toLocaleString("pt-BR") : "sem data";
  const estado = p.estado === "rascunho_editavel" ? "rascunho de trabalho" : `versão v${p.versao ?? "?"} (congelada)`;
  return `Modelo ${modeloVersao} · ${totalClausulas} cláusulas · ${estado} · gerada em ${data}`;
}
