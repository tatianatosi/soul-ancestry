/**
 * Corte 3a (01/10/2026) — "Publicar plano no App".
 *
 * O cliente passa a ver, na aba Conta, o plano que a equipe publicou para o
 * caso dele: **nome comercial, situação e vigência**. Nada além disso.
 *
 * Regra inegociável desta publicação (A7 segue bloqueado): **nunca** SKU,
 * preço, parcela, desconto ou condição comercial. O escritor já existente
 * `publicarInstrumentoNoAppGoLive` publica contrato/proposta *com* parcelas e
 * continua intocado — é outro uso; este aqui é o plano da jornada.
 */
import { contemConteudoInterno } from "@/lib/onboarding-jornada";

/** Situações que a equipe pode publicar. Vocabulário fechado, sem texto livre. */
export const SITUACOES_PLANO = [
  { valor: "ativo", rotulo: "Em acompanhamento" },
  { valor: "em_preparacao", rotulo: "Em preparação" },
  { valor: "pausado", rotulo: "Pausado" },
  { valor: "encerrado", rotulo: "Encerrado" },
] as const;

export type SituacaoPlano = (typeof SITUACOES_PLANO)[number]["valor"];

export const SEPARADOR_PLANO = " · ";

const t = (v: unknown) => (v == null ? "" : String(v).trim());

export function rotuloSituacaoPlano(valor: string | null | undefined): string | null {
  return SITUACOES_PLANO.find((s) => s.valor === t(valor))?.rotulo ?? null;
}

/**
 * Qualquer coisa com cara de dinheiro, parcela ou código de SKU.
 *
 * O guard de conteúdo interno (`contemConteudoInterno`) já pega CPF e termos
 * internos; este acrescenta a camada comercial, que é o que a decisão A7
 * proíbe no App enquanto não houver autorização escrita.
 */
export function pareceComercial(texto: string | null | undefined): boolean {
  const bruto = t(texto);
  if (!bruto) return false;
  const minusculo = bruto.toLowerCase();
  const termos = [
    "r$",
    "reais",
    "parcela",
    "parcelas",
    "desconto",
    "preço",
    "preco",
    "valor",
    "pagamento",
    "mensalidade",
    "entrada de",
    "à vista",
    "a vista",
    "sku",
  ];
  if (termos.some((p) => minusculo.includes(p))) return true;
  // Código de catálogo (CA-CID-023, PP-01, PROD-DIAG-FAM-MULTI…).
  if (/\b(ca|pp|prod)[-_][a-z0-9]{2,}/i.test(bruto)) return true;
  // Qualquer número com separador de milhar/decimal monetário (9.600 / 9600,00).
  if (/\d{1,3}[.,]\d{3}\b|\d+,\d{2}\b/.test(bruto)) return true;
  return false;
}

export type EntradaPlano = {
  nomeComercial: string;
  situacao: string;
  vigencia?: string | null;
};

/** Erros legíveis; lista vazia significa "pode publicar". */
export function validarPublicacaoPlano(entrada: EntradaPlano): string[] {
  const erros: string[] = [];
  const nome = t(entrada.nomeComercial);
  const vigencia = t(entrada.vigencia);

  if (nome.length < 3) erros.push("Informe o nome do plano como o cliente deve ler.");
  if (!rotuloSituacaoPlano(entrada.situacao)) erros.push("Escolha a situação do plano.");

  for (const [campo, valor] of [
    ["nome", nome],
    ["vigência", vigencia],
  ] as const) {
    if (!valor) continue;
    if (pareceComercial(valor))
      erros.push(`O texto do ${campo} tem preço, parcela ou código de catálogo — isso nunca vai ao App.`);
    if (contemConteudoInterno(valor))
      erros.push(`O texto do ${campo} parece conter dado interno — ajuste antes de publicar.`);
  }
  return erros;
}

/** O que fica gravado em `app_projections.content_sanitized`. */
export function conteudoPlano(entrada: EntradaPlano): string {
  return [t(entrada.nomeComercial), rotuloSituacaoPlano(entrada.situacao), t(entrada.vigencia)]
    .filter(Boolean)
    .join(SEPARADOR_PLANO);
}

/* ------------------------------------------------------------- App (leitura) */

export type ProjecaoPlano = {
  id: string;
  projection_type?: string | null;
  content_sanitized?: string | null;
  effective_from?: string | null;
  updated_at?: string | null;
};

export type PlanoDoCliente = { nome: string; situacao: string | null; vigencia: string | null };

/**
 * O plano publicado mais recente. Sem publicação, devolve `null` — a Conta
 * mostra o estado vazio honesto, nunca um plano inventado.
 */
export function planoPublicado(projecoes: readonly ProjecaoPlano[]): PlanoDoCliente | null {
  const data = (p: ProjecaoPlano) => t(p.effective_from ?? p.updated_at);
  let atual: ProjecaoPlano | null = null;
  for (const p of projecoes) {
    if (t(p.projection_type).toLowerCase() !== "plano") continue;
    const conteudo = t(p.content_sanitized);
    if (!conteudo || contemConteudoInterno(conteudo) || pareceComercial(conteudo)) continue;
    if (!atual || data(p) > data(atual)) atual = p;
  }
  if (!atual) return null;
  const [nome, situacao, vigencia] = t(atual.content_sanitized).split(SEPARADOR_PLANO);
  return { nome: t(nome), situacao: t(situacao) || null, vigencia: t(vigencia) || null };
}
