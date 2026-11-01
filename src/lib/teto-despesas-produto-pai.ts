/**
 * Teto de despesas do produto-pai no plano de ação (Corte C, 31/10/2026).
 *
 * As planilhas de produtos-pai da Proprietária já estão no banco
 * (`price_catalog_rescued`). Elas trazem `despesas` e `taxas` como TETO por
 * país, não custo por item do checklist §58c. Este módulo só lê esse teto e o
 * confronta com o que o plano de ação do caso já registrou: nunca reparte o
 * teto entre os itens, porque isso seria inventar um número por item.
 *
 * Camada pura: sem banco, sem tela. O servidor entrega as linhas e as ações;
 * aqui só se calcula.
 */
import { despesaEsperadaDoItem } from "@/lib/dossie-58c";

/** Valor de `crm_casos.pais_linha_prioritaria` → código do catálogo de preços. */
export const ISO_POR_PAIS_LINHA: Record<string, string> = {
  italia: "IT",
  portugal: "PT",
  espanha: "ES",
  alemanha: "DE",
  austria: "AT",
  polonia: "PL",
  hungria: "HU",
  luxemburgo: "LU",
  croacia: "HR",
  romenia: "RO",
};

export type OrigemDoPais = "linha_prioritaria" | "pais" | "contexto_pesquisa";

function semAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

/**
 * País do caso, na ordem de confiança: linha prioritária do Planejador, o campo
 * `pais` do caso e, por último, o contexto da pesquisa ("Áustria — § 58c StbG").
 * `multipais` e `a_definir` não são países: seguem para a próxima fonte.
 */
export function paisIsoDoCaso(fontes: {
  linhaPrioritaria?: string | null;
  pais?: string | null;
  contextoPesquisa?: string | null;
}): { iso: string; origem: OrigemDoPais } | null {
  const tentativas: [OrigemDoPais, string][] = [
    ["linha_prioritaria", String(fontes.linhaPrioritaria ?? "")],
    ["pais", String(fontes.pais ?? "")],
    ["contexto_pesquisa", String(fontes.contextoPesquisa ?? "").split(/[—–]/)[0]],
  ];
  for (const [origem, bruto] of tentativas) {
    const iso = ISO_POR_PAIS_LINHA[semAcentos(bruto)];
    if (iso) return { iso, origem };
  }
  return null;
}

export type LinhaPrecoTeto = {
  country_code: string | null;
  price_component: string;
  amount: number | string | null;
  currency: string | null;
  price_status: string | null;
  archived_at?: string | null;
};

export type AcaoParaTeto = {
  /** Título gravado: `§58c <id> — <título>` (+ pessoa). */
  titulo: string;
  custo: number | null;
  moeda: string | null;
  aprovacaoDespesa: string;
};

export type ResultadoTeto =
  | { estado: "sem_pais" }
  | { estado: "sem_teto"; iso: string; origemPais: OrigemDoPais }
  | { estado: "ambiguo"; iso: string; origemPais: OrigemDoPais; motivo: string }
  | {
      estado: "ok";
      iso: string;
      origemPais: OrigemDoPais;
      moeda: string;
      tetoDespesas: number | null;
      tetoTaxas: number | null;
      tetoTotal: number;
      /** Soma das despesas APROVADAS com custo informado, na moeda do teto. */
      aprovadoComCusto: number;
      itensAprovadosComCusto: number;
      /** Aprovados sem custo informado: não entram na soma, e isso é dito. */
      aprovadosSemCusto: number;
      /** Aprovados com custo em moeda diferente da do teto (ou sem moeda). */
      aprovadosOutraMoeda: number;
      saldo: number;
      excedido: boolean;
      /** Itens que esperam despesa de terceiro e ainda não têm custo estimado. */
      esperamCusto: number;
    };

const COMPONENTES = ["despesas", "taxas"] as const;

function numero(valor: number | string | null): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/** Id do template (`2.1.heimatschein`) dentro do título da instância. */
export function idDoItemPeloTitulo(titulo: string): string | null {
  const m = /^§58c\s+(\S+)\s+—/.exec(titulo);
  return m ? m[1] : null;
}

export function calcularTetoDespesas(entrada: {
  pais: { iso: string; origem: OrigemDoPais } | null;
  linhasPreco: readonly LinhaPrecoTeto[];
  acoes: readonly AcaoParaTeto[];
}): ResultadoTeto {
  if (!entrada.pais) return { estado: "sem_pais" };
  const { iso, origem } = entrada.pais;

  const vigentes = entrada.linhasPreco.filter(
    (l) =>
      !l.archived_at &&
      l.price_status === "VIGENTE" &&
      l.country_code === iso &&
      (COMPONENTES as readonly string[]).includes(l.price_component) &&
      numero(l.amount) !== null,
  );
  if (vigentes.length === 0) return { estado: "sem_teto", iso, origemPais: origem };

  const porComponente: Partial<Record<(typeof COMPONENTES)[number], LinhaPrecoTeto>> = {};
  for (const comp of COMPONENTES) {
    const doComp = vigentes.filter((l) => l.price_component === comp);
    if (doComp.length > 1) {
      return {
        estado: "ambiguo",
        iso,
        origemPais: origem,
        motivo: `O catálogo tem ${doComp.length} valores vigentes de "${comp}" para ${iso}; confira o catálogo antes de usar um teto.`,
      };
    }
    if (doComp.length === 1) porComponente[comp] = doComp[0];
  }

  const moedas = new Set(
    Object.values(porComponente).map((l) => String(l?.currency ?? "").toUpperCase()),
  );
  if (moedas.size !== 1 || moedas.has("")) {
    return {
      estado: "ambiguo",
      iso,
      origemPais: origem,
      motivo: `Despesas e taxas de ${iso} estão em moedas diferentes ou sem moeda; não somo valores de moedas distintas.`,
    };
  }
  const moeda = [...moedas][0];

  const tetoDespesas = porComponente.despesas ? numero(porComponente.despesas.amount) : null;
  const tetoTaxas = porComponente.taxas ? numero(porComponente.taxas.amount) : null;
  const tetoTotal = (tetoDespesas ?? 0) + (tetoTaxas ?? 0);

  let aprovadoComCusto = 0;
  let itensAprovadosComCusto = 0;
  let aprovadosSemCusto = 0;
  let aprovadosOutraMoeda = 0;
  let esperamCusto = 0;
  for (const a of entrada.acoes) {
    if (a.aprovacaoDespesa === "aprovada") {
      if (a.custo === null) aprovadosSemCusto += 1;
      else if (String(a.moeda ?? "").toUpperCase() !== moeda) aprovadosOutraMoeda += 1;
      else {
        aprovadoComCusto += a.custo;
        itensAprovadosComCusto += 1;
      }
    }
    const id = idDoItemPeloTitulo(a.titulo);
    if (id && despesaEsperadaDoItem(id) === true && a.custo === null) esperamCusto += 1;
  }

  const saldo = tetoTotal - aprovadoComCusto;
  return {
    estado: "ok",
    iso,
    origemPais: origem,
    moeda,
    tetoDespesas,
    tetoTaxas,
    tetoTotal,
    aprovadoComCusto,
    itensAprovadosComCusto,
    aprovadosSemCusto,
    aprovadosOutraMoeda,
    saldo,
    excedido: saldo < 0,
    esperamCusto,
  };
}
