/**
 * De-para SKU → Produto-Pai como **alimento**, não tabela estática
 * (03/10/2026).
 *
 * Autorização literal: "aprovado de para sku-pp para todos os produtos ser
 * usado como alimento e não tela estática".
 *
 * ## O que estava errado
 *
 * `product_catalog.produto_pai_id` estava **vazio nos 118 SKUs ativos**
 * (medido no banco em 03/10) e a taxonomia PP-01–09
 * (`planejador-produtos-pai.ts`) só aparecia como `<select>` manual no
 * Planejador. O de-para existia em documento (`docs/arquitetura/
 * 2026-09-25_EQUIVALENCIA-PP01-08-PP01-09.md` e o quadro do Corte 2) e nunca
 * virou dado nem regra.
 *
 * ## Por que regra e não planilha
 *
 * "Alimento" é o oposto de uma lista digitada: a regra abaixo lê o **código e
 * o nome comercial reais** do SKU e devolve o Produto-Pai com o motivo. SKU
 * novo entra classificado sozinho; SKU que a regra não decide **não é
 * chutado** — vira `a_classificar`, declarado na tela, para a Proprietária
 * decidir. Classificação comercial não se inventa.
 *
 * A taxonomia é a vigente e não se reabre: PP-01–09, decisão de 07/09/2026.
 */
import { PRODUTOS_PAI_CANONICOS, type ProdutoPaiId } from "@/lib/planejador-produtos-pai";

export type ClassificacaoSku = {
  produtoPaiId: ProdutoPaiId;
  porque: string;
};

type Regra = {
  /** Identificador da regra, para o teste e para a tela. */
  id: string;
  quando: (code: string, nome: string) => boolean;
  produtoPaiId: ProdutoPaiId;
  porque: string;
};

const temCodigo = (...codes: string[]) => (code: string) => codes.includes(code);
const prefixo = (p: string) => (code: string) => code.startsWith(p);
const nomeTem = (...termos: string[]) => (nome: string) => termos.some((t) => nome.includes(t));

/**
 * Ordem importa: a primeira regra que bate decide. As regras por código
 * específico vêm antes das regras por família, porque dentro de `CA-CID-*`
 * convivem pasta documental (PP-04), execução (PP-06) e vida civil
 * pós-reconhecimento (PP-07).
 */
export const REGRAS_SKU_PP: readonly Regra[] = [
  // ---- Descoberta e diagnóstico -------------------------------------
  {
    id: "diagnostico-familiar-multipais",
    quando: (c, n) => temCodigo("PROD-DIAG-FAM-MULTI")(c) || nomeTem("diagnóstico familiar multipaís")(n),
    produtoPaiId: "PP-01",
    porque: "Diagnóstico familiar multipaís é o próprio PP-01 (mesmo nome do produto-pai canônico).",
  },
  {
    id: "diagnostico-e-consultoria-inicial",
    quando: (c, n) =>
      temCodigo("PROD-DIAG-INDIVIDUAL", "CA-DIAG-003")(c) ||
      nomeTem("consultoria de cidadania", "diagnóstico de pesquisa de origem", "diagnóstico individual")(n),
    produtoPaiId: "PP-02",
    porque: "Diagnóstico ou consultoria inicial de cidadania, por etapas — PP-02.",
  },

  // ---- Pesquisa genealógica ----------------------------------------
  {
    id: "pesquisa-genealogica",
    quando: (c, n) =>
      prefixo("CA-PESQ-")(c) ||
      temCodigo("CA-HIST-001", "CA-HIST-002", "CA-HIST-004", "CA-HIST-005", "CA-HIST-006")(c) ||
      nomeTem("pesquisa genealogica", "pesquisa genealógica", "pesquisa de base familiar", "estudo genealogico", "estudo genealógico", "sobrenome")(n),
    produtoPaiId: "PP-03",
    porque: "Pesquisa genealógica por ramo/sobrenome — PP-03.",
  },

  // ---- Prova e pasta documental ------------------------------------
  {
    id: "pasta-documental",
    quando: (c, n) =>
      prefixo("CA-CID-002")(c) ||
      prefixo("CA-DOC-")(c) ||
      temCodigo("PROD-COMPL-DOC")(c) ||
      nomeTem("pasta", "tradução", "traducao", "apostilamento", "obtenção documental", "obtencao documental", "retificação", "retificacao")(n),
    produtoPaiId: "PP-04",
    porque: "Preparação de prova e pasta documental, incluindo tradução/apostilamento — PP-04.",
  },

  // ---- Estratégia de via -------------------------------------------
  {
    id: "estrategia-de-via",
    quando: (c, n) => temCodigo("CA-PROT-002")(c) || nomeTem("estratégia de via", "estrategia de via", "via jurídica", "via juridica")(n),
    produtoPaiId: "PP-05",
    porque: "Estratégia de via e composição familiar, inclusive via jurídica com parceiro — PP-05.",
  },

  // ---- Execução e acompanhamento -----------------------------------
  {
    id: "execucao-e-acompanhamento",
    quando: (c, n) =>
      temCodigo("CA-CID-023", "CA-CID-025", "CA-PROT-001", "CA-PROT-003", "CA-PROT-004")(c) ||
      nomeTem("assessoria completa", "acompanhamento familiar", "protocolo", "entrevista consular", "reunião consular", "reuniao consular")(n),
    produtoPaiId: "PP-06",
    porque: "Acompanhamento familiar de nacionalidade e atos de protocolo — PP-06.",
  },

  // ---- Vida civil pós-reconhecimento -------------------------------
  {
    id: "vida-civil-pos-reconhecimento",
    quando: (c, n) =>
      temCodigo(
        "CA-CID-003",
        "CA-CID-006",
        "CA-CID-009",
        "CA-CID-016",
        "CA-CID-018",
        "CA-CID-019",
        "CA-CID-020",
        "CA-CID-021",
      )(c) ||
      prefixo("CA-POS-")(c) ||
      nomeTem("aire", "passaporte", "codice", "códice", "spid", "registro de", "transcricao", "transcrição", "declaracao de valor", "declaração de valor")(n),
    produtoPaiId: "PP-07",
    porque: "Registros, documentos e vida civil depois do reconhecimento — PP-07.",
  },

  // ---- Continuidade ------------------------------------------------
  {
    id: "continuidade-e-assinatura",
    quando: (c, n) => prefixo("CA-ASS-")(c) || nomeTem("assinatura", "continuidade", "plano anual")(n),
    produtoPaiId: "PP-09",
    porque:
      "Assinatura e continuidade do acervo familiar — PP-09. Vem antes da regra de memória de propósito: \"Plano Memórias\" é assinatura, não livro.",
  },
  // ---- Memória e legado --------------------------------------------
  {
    id: "acervo-familiar",
    quando: (c, n) => temCodigo("CA-MEM-006")(c) || nomeTem("acervo digital", "acervo familiar")(n),
    produtoPaiId: "PP-09",
    porque: "Acervo familiar é continuidade de guarda, não entrega de memória avulsa — PP-09.",
  },
  {
    id: "memoria-e-legado",
    quando: (c, n) =>
      prefixo("CA-MEM-")(c) ||
      prefixo("CA-IND-")(c) ||
      prefixo("CA-COMBO-")(c) ||
      nomeTem("livro", "entrevista guiada", "autobiografia", "legado em vídeo", "legado em video", "memória", "memorias", "memórias", "diário", "diario")(n),
    produtoPaiId: "PP-08",
    porque: "História de família, memória e legado — PP-08.",
  },

];

/**
 * Famílias que a regra **não** classifica de propósito: são canal de
 * atendimento ou nível de acesso de familiar, não etapa da jornada. Chutar
 * um produto-pai aqui seria decidir catálogo comercial no lugar da
 * Proprietária.
 */
export const FAMILIAS_A_CLASSIFICAR: readonly { prefixo: string; porque: string }[] = [
  {
    prefixo: "CA-FAM-",
    porque:
      '"Familiar Conectado" é nível de acesso de um familiar ao acompanhamento, não uma etapa da jornada. Pode ser PP-06 (acompanhamento) ou PP-09 (continuidade) — decisão de catálogo da Proprietária.',
  },
  {
    prefixo: "CA-WPP-",
    porque:
      "Pacote de WhatsApp é canal de atendimento, não etapa da jornada. Classificar como produto-pai exige decisão de catálogo da Proprietária.",
  },
];

export function produtoPaiDoSku(code: string | null | undefined, nome: string | null | undefined): ClassificacaoSku | null {
  const c = (code ?? "").trim().toUpperCase();
  const n = (nome ?? "").trim().toLowerCase();
  if (!c && !n) return null;
  if (FAMILIAS_A_CLASSIFICAR.some((f) => c.startsWith(f.prefixo))) return null;
  for (const r of REGRAS_SKU_PP) {
    if (r.quando(c, n)) return { produtoPaiId: r.produtoPaiId, porque: r.porque };
  }
  return null;
}

/** Por que um SKU ficou sem produto-pai — texto para a tela, nunca silêncio. */
export function motivoSemProdutoPai(code: string | null | undefined): string {
  const c = (code ?? "").trim().toUpperCase();
  const familia = FAMILIAS_A_CLASSIFICAR.find((f) => c.startsWith(f.prefixo));
  if (familia) return familia.porque;
  return "Nenhuma regra do de-para reconhece este código nem o nome comercial. Classificação pendente de decisão de catálogo.";
}

export type SkuDoCatalogo = { id: string; code: string | null; nome_comercial: string | null; produto_pai_id?: string | null };

export type AlimentoDeParaSku = {
  porProdutoPai: { produtoPaiId: ProdutoPaiId; nome: string; skus: { id: string; code: string; nome: string; porque: string }[] }[];
  aClassificar: { id: string; code: string; nome: string; porque: string }[];
  total: number;
  classificados: number;
};

/**
 * O alimento propriamente dito: dado o catálogo real, devolve os SKUs
 * agrupados por produto-pai (o que o Planejador consome) e a lista do que
 * ficou pendente (o que a tela declara).
 */
export function alimentoDeParaSku(skus: readonly SkuDoCatalogo[]): AlimentoDeParaSku {
  const porPp = new Map<ProdutoPaiId, { id: string; code: string; nome: string; porque: string }[]>();
  const aClassificar: AlimentoDeParaSku["aClassificar"] = [];

  for (const s of skus) {
    const code = (s.code ?? "").trim();
    const nome = (s.nome_comercial ?? "").trim();
    const classificacao = produtoPaiDoSku(code, nome);
    if (!classificacao) {
      aClassificar.push({ id: s.id, code: code || "—", nome: nome || "—", porque: motivoSemProdutoPai(code) });
      continue;
    }
    const lista = porPp.get(classificacao.produtoPaiId) ?? [];
    lista.push({ id: s.id, code: code || "—", nome: nome || "—", porque: classificacao.porque });
    porPp.set(classificacao.produtoPaiId, lista);
  }

  const porProdutoPai = PRODUTOS_PAI_CANONICOS.filter((p) => (porPp.get(p.id as ProdutoPaiId) ?? []).length > 0).map((p) => ({
    produtoPaiId: p.id as ProdutoPaiId,
    nome: p.nome,
    skus: (porPp.get(p.id as ProdutoPaiId) ?? []).sort((a, b) => a.code.localeCompare(b.code)),
  }));

  const classificados = porProdutoPai.reduce((s, g) => s + g.skus.length, 0);
  return { porProdutoPai, aClassificar, total: skus.length, classificados };
}
