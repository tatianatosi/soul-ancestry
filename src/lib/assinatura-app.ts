/**
 * Assinatura e upsell no App Cliente, com preço — exceção A7 autorizada
 * (03/10/2026).
 *
 * ## A autorização, literal
 *
 * "o preço no app da Ana também verificar no mockup aprovado mas acredito que
 * somente devemos mostrar sua assinatura e possibilidade de upsell com preço
 * também precisa de um campo para editar se não tiver no app e no desk".
 *
 * Até hoje o App era **sem preço** por decisão (A7 bloqueado), e o guard
 * `pareceComercial` recusava qualquer texto com "R$", parcela ou valor. Foi o
 * que esvaziou a Conta da Ana: as três projeções publicadas dela eram
 * contrato e proposta com "3 assinaturas mensais de R$ 320".
 *
 * ## O escopo da exceção, estreito de propósito
 *
 * O preço entra **só como campo numérico estruturado** (`valorCentavos`), em
 * dois tipos novos: `assinatura` (a dela) e `upsell` (o próximo nível). O
 * texto livre continua passando por `contemConteudoInterno` **e**
 * `pareceComercial` — ou seja, ninguém escreve "parcelamos em 3x de R$ 320"
 * no nome do plano. Contrato e proposta seguem fora do App
 * (`TIPOS_FORA_DO_APP`), e parcela, desconto, forma de pagamento, SKU e
 * código de catálogo continuam recusados em qualquer lugar.
 *
 * O que o cliente vê: o nome do plano, o valor, a periodicidade, a situação —
 * e, no upsell, o nome e o valor do próximo nível. Nada de cobrança, link de
 * pagamento ou condição negociada.
 */
import { contemConteudoInterno } from "@/lib/onboarding-jornada";
import { pareceComercial } from "@/lib/plano-publicacao";

export const TIPO_ASSINATURA = "assinatura";
export const TIPO_UPSELL = "upsell";

/** Registro da autorização, para a tela citar e o teste travar. */
export const A7_AUTORIZACAO = {
  data: "2026-10-03",
  autor: "tati@pluggedresearch.com",
  texto:
    "somente devemos mostrar sua assinatura e possibilidade de upsell com preço, " +
    "com campo para editar no app e no desk",
  escopo: "Valor da assinatura do próprio cliente e valor do upsell. Nunca parcela, desconto, cobrança ou SKU.",
} as const;

const SEPARADOR = " ⋅ ";

export const PERIODICIDADES = [
  { valor: "mensal", rotulo: "por mês" },
  { valor: "trimestral", rotulo: "por trimestre" },
  { valor: "anual", rotulo: "por ano" },
  { valor: "unica", rotulo: "pagamento único" },
] as const;

export type Periodicidade = (typeof PERIODICIDADES)[number]["valor"];

export function rotuloPeriodicidade(p: string | null | undefined): string {
  return PERIODICIDADES.find((x) => x.valor === String(p ?? "").trim())?.rotulo ?? "";
}

export type EntradaAssinatura = {
  nome: string;
  valorCentavos: number;
  periodicidade: string;
  /** Situação curta: "ativa", "em renovação". Texto livre, validado. */
  situacao?: string;
};

export function formatarValor(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Lê "R$ 1.234,56", "1234,56" ou "1234.56" e devolve centavos. `null` quando
 * não é valor — a tela mostra o motivo em vez de gravar zero.
 */
export function valorEmCentavos(texto: string | null | undefined): number | null {
  const bruto = String(texto ?? "").trim();
  if (!bruto) return null;
  const limpo = bruto.replace(/[R$\s]/gi, "");
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  const centavos = Math.round(Number(normalizado) * 100);
  return Number.isFinite(centavos) ? centavos : null;
}

/**
 * Valida a entrada. O valor é número e não passa pelo filtro comercial — é a
 * exceção A7. Todo campo de TEXTO continua passando pelos dois filtros.
 */
export function validarAssinatura(entrada: EntradaAssinatura): string[] {
  const erros: string[] = [];
  const nome = String(entrada.nome ?? "").trim();
  if (!nome) erros.push("Informe o nome do plano como o cliente deve ler.");
  if (nome && pareceComercial(nome)) {
    erros.push(
      "O nome do plano tem preço, parcela ou código de catálogo. O valor vai no campo de valor; o nome é só o nome.",
    );
  }
  if (nome && contemConteudoInterno(nome)) erros.push("O nome do plano tem vocabulário interno — reescreva.");

  const situacao = String(entrada.situacao ?? "").trim();
  if (situacao && (pareceComercial(situacao) || contemConteudoInterno(situacao))) {
    erros.push("A situação tem preço ou vocabulário interno — escreva só a situação (ex.: ativa).");
  }

  if (!Number.isInteger(entrada.valorCentavos) || entrada.valorCentavos <= 0) {
    erros.push("Informe o valor da assinatura — um valor em reais, maior que zero.");
  }
  if (Number.isInteger(entrada.valorCentavos) && entrada.valorCentavos > 100_000_00) {
    erros.push("Valor acima do limite de segurança (R$ 100.000). Confira antes de publicar.");
  }
  if (!PERIODICIDADES.some((p) => p.valor === String(entrada.periodicidade ?? "").trim())) {
    erros.push("Informe a periodicidade (mês, trimestre, ano ou pagamento único).");
  }
  return erros;
}

/** Conteúdo gravado em `app_projections.content_sanitized`. */
export function conteudoAssinatura(entrada: EntradaAssinatura): string {
  return [
    String(entrada.nome).trim(),
    formatarValor(entrada.valorCentavos),
    String(entrada.periodicidade).trim(),
    String(entrada.situacao ?? "").trim(),
  ].join(SEPARADOR);
}

/* ---------------------------------------------------------- App (leitura) */

export type ProjecaoAssinatura = {
  id: string;
  projection_type?: string | null;
  content_sanitized?: string | null;
  effective_from?: string | null;
  updated_at?: string | null;
};

export type AssinaturaDoCliente = {
  id: string;
  nome: string;
  valor: string;
  periodicidadeRotulo: string;
  situacao: string | null;
};

function interpretar(p: ProjecaoAssinatura): AssinaturaDoCliente | null {
  const [nome, valor, periodicidade, situacao] = String(p.content_sanitized ?? "").split(SEPARADOR);
  if (!String(nome ?? "").trim() || !String(valor ?? "").trim()) return null;
  // O nome continua sob o filtro interno na leitura — mesma regra do App.
  if (contemConteudoInterno(String(nome))) return null;
  return {
    id: String(p.id),
    nome: String(nome).trim(),
    valor: String(valor).trim(),
    periodicidadeRotulo: rotuloPeriodicidade(periodicidade),
    situacao: String(situacao ?? "").trim() || null,
  };
}

const quando = (p: ProjecaoAssinatura) => String(p.effective_from ?? p.updated_at ?? "");

/** A assinatura publicada mais recente. `null` = estado vazio honesto. */
export function assinaturaPublicada(projecoes: readonly ProjecaoAssinatura[]): AssinaturaDoCliente | null {
  let atual: ProjecaoAssinatura | null = null;
  for (const p of projecoes) {
    if (String(p.projection_type ?? "").trim().toLowerCase() !== TIPO_ASSINATURA) continue;
    if (!atual || quando(p) > quando(atual)) atual = p;
  }
  return atual ? interpretar(atual) : null;
}

/** Os upsells publicados, do mais recente para o mais antigo. */
export function upsellsPublicados(projecoes: readonly ProjecaoAssinatura[]): AssinaturaDoCliente[] {
  return projecoes
    .filter((p) => String(p.projection_type ?? "").trim().toLowerCase() === TIPO_UPSELL)
    .sort((a, b) => quando(b).localeCompare(quando(a)))
    .map(interpretar)
    .filter((a): a is AssinaturaDoCliente => a !== null);
}
