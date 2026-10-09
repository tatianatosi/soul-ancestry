/**
 * Checker de linguagem proibida — Governança de Fontes, Evidências,
 * Visibilidade e Linguagem de Legado (adendo ao Bloco 5A, 11/08/2026).
 *
 * Seção 8 do adendo: "Todo conteúdo narrativo (Caderno, PDF, one-page,
 * Dashboard) passa por verificação automática de termos proibidos antes de
 * aprovação. Se um termo proibido for detectado, o conteúdo retorna para
 * revisão humana." — D-11 (glossário final) segue pendente; este módulo usa
 * a lista já aprovada no adendo, sem antecipar a versão final.
 *
 * Função pura: só classifica texto, nunca grava, nunca aprova sozinho. A
 * decisão de aprovar/reprovar continua humana — este módulo devolve "tem
 * termo proibido, aqui estão quais", nunca "pode publicar".
 */

export type TermoProibidoEncontrado = {
  termo: string;
  razao: string;
  trecho: string;
};

type TermoProibido = { termo: string; razao: string; padrao: RegExp };

/**
 * Lista exata da Seção 8 do adendo. Cada termo com a razão que o próprio
 * documento dá — nunca um motivo inventado aqui.
 */
const TERMOS_PROIBIDOS: readonly TermoProibido[] = [
  { termo: "constelação familiar", razao: "Terapia específica; não é conteúdo educativo genealógico.", padrao: /constela[çc][aã]o\s+familiar/i },
  { termo: "cura ancestral", razao: "Promessa terapêutica sem base documental.", padrao: /cura\s+ancestral/i },
  { termo: "trauma herdado", razao: "Afirmação psicológica sem validação clínica.", padrao: /trauma\s+herdado/i },
  { termo: "terapia sistêmica", razao: "Método terapêutico; não é produto genealógico.", padrao: /terapia\s+sist[eê]mica/i },
  { termo: "padrões psicológicos familiares", razao: "Diagnóstico psicológico sem base clínica.", padrao: /padr[õo]es?\s+psicol[oó]gicos?\s+familiares?/i },
  { termo: "comportamento por nacionalidade", razao: "Determinismo; nacionalidade não define comportamento.", padrao: /comportamento\s+(?:por|de|dos?|das?)\s+\w*\s*(?:nacionalidade|italianos?|portugueses?|alem[ãa]es?|espanh[óo]is|polon[eê]ses?|austr[ií]acos?)/i },
  { termo: "destino", razao: "Determinismo por origem.", padrao: /\bdestino\b/i },
  { termo: "personalidade herdada", razao: "Atribui traço a linhagem sem evidência.", padrao: /personalidade\s+herdada/i },
  { termo: "diagnóstico emocional", razao: "Diagnóstico sem base clínica.", padrao: /diagn[oó]stico\s+emocional/i },
  { termo: "fortalecimento terapêutico", razao: "Promessa terapêutica.", padrao: /fortalecimento\s+terap[eê]utico/i },
  { termo: "força emocional de povo/linhagem", razao: "Generalização sem base.", padrao: /for[çc]a\s+emocional\s+(?:de|do|da|dos?|das?)\s+(?:povo|linhagem)/i },
] as const;

/**
 * Varre um texto narrativo (Caderno de Encontros, PDF, one-page, Dashboard)
 * e devolve cada termo proibido encontrado, com o trecho onde apareceu.
 * Lista vazia = nenhum termo proibido encontrado — não significa "aprovado",
 * só que o checker não achou motivo de bloqueio automático.
 */
export function verificarTermosProibidos(texto: string): TermoProibidoEncontrado[] {
  if (!texto) return [];
  const achados: TermoProibidoEncontrado[] = [];
  for (const { termo, razao, padrao } of TERMOS_PROIBIDOS) {
    const m = texto.match(padrao);
    if (m) {
      const inicio = Math.max(0, (m.index ?? 0) - 20);
      const fim = Math.min(texto.length, (m.index ?? 0) + m[0].length + 20);
      achados.push({ termo, razao, trecho: texto.slice(inicio, fim).trim() });
    }
  }
  return achados;
}

/** true quando o texto deve voltar para revisão humana antes de aprovação. */
export function exigeRevisaoHumana(texto: string): boolean {
  return verificarTermosProibidos(texto).length > 0;
}

/**
 * Termos permitidos da Seção 8 — só para referência/teste; não é allowlist
 * que bloqueia o resto do texto (o checker é de termo proibido, não de
 * vocabulário fechado).
 */
export const TERMOS_PERMITIDOS_REFERENCIA = [
  "contextos históricos",
  "memórias familiares",
  "territórios migratórios",
  "encontros de linhagem",
  "práticas culturais documentadas",
  "narrativas de adaptação",
  "pertencimento",
  "repertórios familiares observados em relatos e documentos",
  "legado narrativo",
  "identidade",
] as const;
