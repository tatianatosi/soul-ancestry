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
  updated_at?: string | null;
  aprovado_em?: string | null;
  corpo_contratual?: boolean | null;
  legado_sem_corpo?: boolean | null;
  /**
   * 09/10/2026 — o cabeçalho deste módulo sempre disse "prévia arquivada
   * nunca é vigente", mas o filtro só existia no leitor da tela: a função
   * pura aceitava uma linha arquivada e podia devolvê-la. A regra passa a
   * valer aqui também, onde ela está escrita.
   */
  archived_at?: string | null;
  /** Versão do renderizador que produziu o HTML (`RENDERIZADOR_VERSAO`). */
  renderizador_versao?: string | null;
};

const ts = (v: unknown): number => {
  const t = Date.parse(String(v ?? ""));
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Quando a prévia foi gerada de fato.
 *
 * 09/10/2026 — correção de um defeito meu, medido no contrato da Ana:
 * `gerarPrevia` ATUALIZA o rascunho editável no lugar (mesma linha, mesma
 * versão) e nunca mexe em `created_at`. A prévia vigente dela tem
 * `created_at = 21/08` e `updated_at = 08/10 11:02`, e o HTML guardado já
 * contém a seção "Ordem de Serviço (Anexo I)" criada em 07/10 — prova de
 * que foi regerada depois.
 *
 * Lendo `created_at`, a regra de defasagem marcaria o rascunho como velho
 * para sempre: a trava de PDF/revisão/assinatura NUNCA limparia, nem
 * segundos depois de regerar. Versão congelada continua valendo pelo
 * congelamento; rascunho vale pela última gravação.
 */
export function geradaEm(p: PreviaRegistro): string | null {
  if (p.estado === "rascunho_editavel") return p.updated_at ?? p.created_at ?? null;
  return p.congelado_em ?? p.updated_at ?? p.created_at ?? null;
}

/** A prévia que vale — rascunho editável, senão a congelada de maior versão. */
export function previaVigente(previas: readonly PreviaRegistro[]): PreviaRegistro | null {
  const vivas = previas.filter((p) => p?.id && !p.archived_at);
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

/**
 * Prévia produzida por um renderizador diferente do atual (09/10/2026).
 *
 * A defasagem por parâmetro não pega correção de texto: os dados não mudam,
 * o documento sim. Ausente = desconhecido = desatualizada — nunca presumida
 * atual. Quem não passa `atual` (chamada antiga) não é afetado.
 */
export function previaDeRenderizadorAntigo(p: PreviaRegistro | null, atual?: string | null): boolean {
  if (!p || !atual) return false;
  return (p.renderizador_versao ?? null) !== atual;
}

export const AVISO_PREVIA_MODELO_ATUALIZADO =
  "Prévia desatualizada: o texto do contrato foi corrigido depois que ela foi gerada. Gere a prévia de novo antes de baixar o PDF, pedir revisão ou preparar assinatura.";

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
  renderizadorAtual?: string | null,
): string | null {
  if (!p) return "Nenhuma prévia gerada para este contrato.";
  if (!temCorpoContratual(p)) return AVISO_PREVIA_SEM_CORPO;
  if (previaDefasada(p, parametroAlteradoEm)) return AVISO_PREVIA_DESATUALIZADA;
  if (previaDeRenderizadorAntigo(p, renderizadorAtual)) return AVISO_PREVIA_MODELO_ATUALIZADO;
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
