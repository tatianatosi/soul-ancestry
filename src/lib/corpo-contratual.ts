/**
 * Corpo textual do contrato: 14 temas de texto fixo versionado.
 *
 * Regra: o corpo do contrato NÃO é campo editável por caso. Ele vem do
 * contrato-base versionado (MODELO-ESTUDO + BASE-GEN-V2). A ficha contratual
 * apenas preenche partes, serviço/escopo, entrega, comercial, anexos, prazo e
 * referências — nunca reescreve cláusula.
 */

import {
  CLAUSULAS_FIXAS,
  CONTRATO_BASE_MODELO,
  CONTRATO_BASE_STATUS,
  CONTRATO_BASE_VERSAO,
  PREAMBULO_CONTRATO_BASE,
  type ClausulaFixa,
} from "@/lib/contrato-base-consolidado";
import { CLAUSULAS_MATRIZ, clausulaEditavelPorCaso } from "@/lib/matriz-clausulas";

export const CORPO_CONTRATUAL_VERSAO = "CORPO-CONTRATUAL-v1.0";

/** O que a ficha contratual pode preencher. Fora desta lista, nada é editável por caso. */
export const PREENCHIMENTO_FICHA = [
  { grupo: "Partes", descricao: "Contratante(s), signatários, beneficiários, dependentes e representação aplicável." },
  { grupo: "Serviço/escopo", descricao: "Modalidade, país/rota e escopo aprovado na proposta/OS do mesmo caso." },
  { grupo: "Entrega", descricao: "Fases, entregas e critérios de aceite previstos no ANX-ESCOPO." },
  { grupo: "Comercial", descricao: "SKU homologado, preço, parcelas, vencimentos e responsável financeiro." },
  { grupo: "Anexos", descricao: "Anexos derivados por produto, rota, escopo, estrutura familiar e representação." },
  { grupo: "Prazo", descricao: "Marco inicial, condição de início, prazos formais e regra de ajuste." },
  { grupo: "Referências", descricao: "Proposta/OS, política vigente, versões, evidências e referência externa de assinatura." },
] as const;

export type TemaTextoFixo = {
  id: string;
  tema: string;
  clausulas: number[]; // números no contrato-base
  matriz: string[]; // letras A–P
  preenchidoPelaFicha: string[]; // grupos da ficha, se houver
};

/** Os 14 temas de texto-base fixo exigidos, ancorados no contrato-base versionado. */
export const TEMAS_TEXTO_FIXO: TemaTextoFixo[] = [
  { id: "T01", tema: "Qualificação institucional da contratada", clausulas: [1], matriz: ["A"], preenchidoPelaFicha: [] },
  { id: "T02", tema: "Objeto do estudo/pesquisa genealógica", clausulas: [2], matriz: ["C"], preenchidoPelaFicha: ["Serviço/escopo"] },
  { id: "T03", tema: "Obrigações do contratante", clausulas: [4], matriz: ["E"], preenchidoPelaFicha: [] },
  { id: "T04", tema: "Obrigações da contratada", clausulas: [5], matriz: ["F"], preenchidoPelaFicha: [] },
  {
    id: "T05",
    tema: "Limitações: ausência de garantia de localização, linhagem, cidadania, documento, protocolo ou resultado",
    clausulas: [6],
    matriz: ["G"],
    preenchidoPelaFicha: [],
  },
  { id: "T06", tema: "Natureza intelectual do serviço", clausulas: [6], matriz: ["G"], preenchidoPelaFicha: [] },
  { id: "T07", tema: "Escopo de entregas e encerramento", clausulas: [3, 11], matriz: ["D", "L"], preenchidoPelaFicha: ["Serviço/escopo", "Entrega"] },
  {
    id: "T08",
    tema: "Dados, confidencialidade, LGPD, guarda e descarte — conforme política jurídica vigente",
    clausulas: [7],
    matriz: ["H"],
    preenchidoPelaFicha: ["Referências"],
  },
  { id: "T09", tema: "Preço, condição de pagamento e início do serviço", clausulas: [8], matriz: ["I"], preenchidoPelaFicha: ["Comercial"] },
  { id: "T10", tema: "Despesas de terceiros", clausulas: [9], matriz: ["J"], preenchidoPelaFicha: ["Comercial"] },
  { id: "T11", tema: "Prazos, dependências documentais e ajustes de prazo", clausulas: [10], matriz: ["K"], preenchidoPelaFicha: ["Prazo"] },
  { id: "T12", tema: "Propriedade intelectual", clausulas: [12], matriz: ["M"], preenchidoPelaFicha: [] },
  { id: "T13", tema: "Assinatura, registros e prova", clausulas: [13], matriz: ["N"], preenchidoPelaFicha: ["Referências"] },
  { id: "T14", tema: "Disposições finais e foro autorizado", clausulas: [14], matriz: ["O"], preenchidoPelaFicha: [] },
];

export type BlocoCorpoContratual = {
  tema: TemaTextoFixo;
  clausulas: ClausulaFixa[];
  textoFixo: true;
  editavelPorCaso: boolean;
  origem: string;
};

/** Monta o corpo do contrato a partir do texto versionado. Não aceita texto de caso. */
export function montarCorpoContratual(): {
  versao: string;
  modelo: string;
  status: string;
  preambulo: string;
  blocos: BlocoCorpoContratual[];
} {
  const porNumero = new Map(CLAUSULAS_FIXAS.map((c) => [c.numero, c]));
  const blocos = TEMAS_TEXTO_FIXO.map((tema) => ({
    tema,
    clausulas: tema.clausulas.map((n) => porNumero.get(n)).filter((c): c is ClausulaFixa => Boolean(c)),
    textoFixo: true as const,
    // Só é "editável" no sentido de parâmetro; o texto permanece fixo.
    editavelPorCaso: tema.matriz.some((id) => clausulaEditavelPorCaso(id)),
    origem: `Contrato-base ${CONTRATO_BASE_MODELO} ${CONTRATO_BASE_VERSAO}`,
  }));
  return {
    versao: CORPO_CONTRATUAL_VERSAO,
    modelo: CONTRATO_BASE_MODELO,
    status: CONTRATO_BASE_STATUS,
    preambulo: PREAMBULO_CONTRATO_BASE,
    blocos,
  };
}

/** Temas exigidos que não têm texto versionado correspondente. */
export function temasSemTextoVersionado(): string[] {
  const numeros = new Set(CLAUSULAS_FIXAS.map((c) => c.numero));
  const letras = new Set(CLAUSULAS_MATRIZ.map((c) => c.id));
  return TEMAS_TEXTO_FIXO.filter(
    (t) => t.clausulas.some((n) => !numeros.has(n)) || t.matriz.some((l) => !letras.has(l)),
  ).map((t) => t.tema);
}

/**
 * Guarda: qualquer tentativa de gravar corpo de cláusula como texto de caso.
 * A ficha só preenche parâmetros; corpo vem do contrato-base.
 */
export function violacoesCorpoPorCaso(entrada: { clausulaId: string; textoLivre?: string | null }): string[] {
  const achados: string[] = [];
  const texto = (entrada.textoLivre ?? "").trim();
  if (!texto) return achados;
  achados.push(
    `Cláusula ${entrada.clausulaId}: corpo do contrato não é editável por caso. Texto vem do contrato-base ${CONTRATO_BASE_MODELO} ${CONTRATO_BASE_VERSAO}; a ficha preenche apenas ${PREENCHIMENTO_FICHA.map((p) => p.grupo).join(", ")}.`,
  );
  return achados;
}
