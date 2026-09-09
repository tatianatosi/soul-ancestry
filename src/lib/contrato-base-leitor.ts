/**
 * Leitor do Contrato-Base Consolidado v1.0.
 *
 * Monta, para leitura na aba Governança > Contrato-base, as 14 seções
 * publicadas com o texto fixo integral vindo da fonte canônica
 * (`contrato-base-consolidado`). Não gera texto, não resume, não infere e não
 * aceita texto de caso. Seção sem texto vira erro explícito, nunca fallback.
 */

import {
  CLAUSULAS_FIXAS,
  CONTRATO_BASE_DATA,
  CONTRATO_BASE_ID,
  CONTRATO_BASE_MODELO,
  CONTRATO_BASE_STATUS,
  CONTRATO_BASE_VERSAO,
  PERFIL_INSTITUCIONAL,
  PERFIL_INSTITUCIONAL_VERSAO,
  PREAMBULO_CONTRATO_BASE,
  SECOES_DOCUMENTO_PUBLICADO,
  contratoBaseAssinavel,
} from "@/lib/contrato-base-consolidado";
import { CLAUSULAS_MATRIZ } from "@/lib/matriz-clausulas";
import { rotuloEstadoPerfilInstitucional } from "@/lib/perfil-institucional";
import {
  QUALIFICACAO_INSTITUCIONAL_STATUS,
  QUALIFICACAO_INSTITUCIONAL_TITULO,
  QUALIFICACAO_INSTITUCIONAL_VERSAO,
  qualificacaoInstitucionalRenderizada,
} from "@/lib/qualificacao-institucional";

export const SELO_TEXTO_FIXO = "Texto fixo · não editável por caso";

export const AVISO_UNDER_LEGAL_REVIEW =
  "Fonte interna em revisão. Não habilita assinatura, cobrança, pesquisa externa ou automação.";

export const AVISO_VIGENTE =
  "Revisão jurídica concluída — 28/08/2026. Modelo vigente: habilita assinatura via aceite digital gov.br, dentro dos demais gates do caso (dados, SKU, Asaas).";

function avisoDoEstado(status: string): string {
  return status === "vigente" ? AVISO_VIGENTE : AVISO_UNDER_LEGAL_REVIEW;
}

export const CONTRATO_BASE_TITULO_CABECALHO = "Contrato-Base Consolidado v1.0";

/** Seção publicada -> cláusulas internas -> letras A–P. Mapa explícito e auditável. */
const EQUIVALENCIA_SECAO_MATRIZ: Record<number, string[]> = {
  1: ["A"],
  2: ["B"],
  3: ["C"],
  4: ["D"],
  5: ["E"],
  6: ["F"],
  7: ["G"],
  8: ["H"],
  9: ["I"],
  10: ["J"],
  11: ["K"],
  12: ["L"],
  13: ["M"],
  14: ["N", "O", "P"],
  15: ["Q"],
  16: ["R"],
};

/** Cláusulas internas exibidas em cada seção publicada (a 14 consolida 13 e 14). */
const CLAUSULAS_DA_SECAO: Record<number, number[]> = {
  1: [],
  2: [1],
  3: [2],
  4: [3],
  5: [4],
  6: [5],
  7: [6],
  8: [7],
  9: [8],
  10: [9],
  11: [10],
  12: [11],
  13: [12],
  14: [13, 14],
  15: [15],
  16: [16],
};

/**
 * Distribuição explícita da seção 14 entre cláusulas internas e letras A–P.
 * Documentada em tela para facilitar a revisão jurídica.
 */
export const NOTA_DISTRIBUICAO_SECAO_14 = [
  "Cláusula 13 (Assinatura, evidência e registros) corresponde à letra N — assinatura, evidência, versão e registros, com origem na configuração jurídica institucional.",
  "Cláusula 14 (Disposições finais e foro) corresponde à letra O — foro e disposições finais, também com origem na configuração jurídica institucional.",
  "A letra P — anexos aplicáveis — não tem cláusula redacional própria: deriva das regras de aplicabilidade dos anexos citados na cláusula 13.3 e é validada pelos gates de prévia final e assinatura.",
];

export type ParagrafoSecao = { clausula: number | null; titulo: string; itens: string[] };

export type SecaoContratoBase = {
  id: string;
  secao: number;
  titulo: string;
  paragrafos: ParagrafoSecao[];
  selo: string;
  versao: string;
  clausulasInternas: string[];
  equivalenciaMatriz: { id: string; titulo: string; tipo: string; fonte: string }[];
  fonte: string;
  estadoVigencia: string;
  /** Notas de distribuição entre cláusulas internas e letras A–P (hoje só a seção 14). */
  notasDistribuicao: string[];
};

export type ErroSecaoContratoBase = {
  secaoId: string;
  secao: number;
  titulo: string;
  motivo: string;
  versaoEsperada: string;
  fonte: string;
};

export type LeituraContratoBase = {
  titulo: string;
  contratoId: string;
  modelo: string;
  versao: string;
  status: string;
  data: string;
  aviso: string;
  perfilVersao: string;
  perfilRotuloEstado: string;
  perfil: typeof PERFIL_INSTITUCIONAL;
  qualificacao: ReturnType<typeof qualificacaoInstitucionalRenderizada>;
  preambulo: string;
  secoes: SecaoContratoBase[];
  erros: ErroSecaoContratoBase[];
};

export function idSecaoContratoBase(secao: number): string {
  return `contrato-base-secao-${secao}`;
}

/** Monta as 14 seções com texto integral. Seção sem texto entra em `erros`. */
export function lerContratoBase(): LeituraContratoBase {
  const porNumero = new Map(CLAUSULAS_FIXAS.map((c) => [c.numero, c]));
  const porLetra = new Map(CLAUSULAS_MATRIZ.map((c) => [c.id, c]));

  const secoes: SecaoContratoBase[] = [];
  const erros: ErroSecaoContratoBase[] = [];

  for (const sec of SECOES_DOCUMENTO_PUBLICADO) {
    const letras = EQUIVALENCIA_SECAO_MATRIZ[sec.secao] ?? [];
    const numeros = CLAUSULAS_DA_SECAO[sec.secao] ?? [];
    const paragrafos: ParagrafoSecao[] = [];
    const faltantes: string[] = [];

    if (sec.secao === 1) {
      const itens = PERFIL_INSTITUCIONAL.map((c) => `${c.rotulo}: ${c.valor}`);
      if (itens.length === 0) faltantes.push("perfil institucional sem campos versionados");
      paragrafos.push({ clausula: null, titulo: "Perfil institucional da contratada", itens });
      const qualificacao = qualificacaoInstitucionalRenderizada();
      if (qualificacao.paragrafos.length === 0) faltantes.push("qualificação institucional sem texto versionado");
      paragrafos.push({
        clausula: null,
        titulo: `${QUALIFICACAO_INSTITUCIONAL_TITULO} (${QUALIFICACAO_INSTITUCIONAL_VERSAO} · ${QUALIFICACAO_INSTITUCIONAL_STATUS})`,
        itens: qualificacao.paragrafos,
      });
      paragrafos.push({ clausula: null, titulo: "Preâmbulo", itens: [PREAMBULO_CONTRATO_BASE] });
    }

    for (const n of numeros) {
      const cl = porNumero.get(n);
      if (!cl || cl.itens.length === 0 || cl.itens.every((i) => !i.trim())) {
        faltantes.push(`cláusula interna ${n} sem texto versionado`);
        continue;
      }
      paragrafos.push({ clausula: cl.numero, titulo: cl.titulo, itens: cl.itens });
    }

    const semTexto = paragrafos.length === 0 || paragrafos.every((p) => p.itens.length === 0);
    if (faltantes.length > 0 || semTexto) {
      erros.push({
        secaoId: idSecaoContratoBase(sec.secao),
        secao: sec.secao,
        titulo: sec.titulo,
        motivo: faltantes.length > 0 ? faltantes.join("; ") : "seção publicada sem texto correspondente na fonte canônica",
        versaoEsperada: `${CONTRATO_BASE_VERSAO} · ${sec.fonte}`,
        fonte: CONTRATO_BASE_ID,
      });
      if (semTexto) continue;
    }

    secoes.push({
      id: idSecaoContratoBase(sec.secao),
      secao: sec.secao,
      titulo: sec.titulo,
      paragrafos,
      selo: SELO_TEXTO_FIXO,
      versao: CONTRATO_BASE_VERSAO,
      clausulasInternas: numeros.length > 0 ? numeros.map((n) => `Cláusula ${n}`) : [`Perfil institucional ${PERFIL_INSTITUCIONAL_VERSAO}`],
      equivalenciaMatriz: letras.map((l) => {
        const m = porLetra.get(l);
        return { id: l, titulo: m?.titulo ?? "—", tipo: m?.tipo ?? "—", fonte: m?.fonte ?? "—" };
      }),
      fonte: sec.fonte,
      estadoVigencia: CONTRATO_BASE_STATUS,
      notasDistribuicao: sec.secao === 14 ? [...NOTA_DISTRIBUICAO_SECAO_14] : [],
    });
  }

  return {
    titulo: CONTRATO_BASE_TITULO_CABECALHO,
    contratoId: CONTRATO_BASE_ID,
    modelo: CONTRATO_BASE_MODELO,
    versao: CONTRATO_BASE_VERSAO,
    status: CONTRATO_BASE_STATUS,
    data: CONTRATO_BASE_DATA,
    aviso: avisoDoEstado(CONTRATO_BASE_STATUS),
    perfilVersao: PERFIL_INSTITUCIONAL_VERSAO,
    perfilRotuloEstado: rotuloEstadoPerfilInstitucional(),
    perfil: PERFIL_INSTITUCIONAL,
    qualificacao: qualificacaoInstitucionalRenderizada(),
    preambulo: PREAMBULO_CONTRATO_BASE,
    secoes,
    erros,
  };
}

/** Ação externa (assinatura) só habilita quando o contrato-base está `vigente`. */
export function acoesExternasHabilitadas(): boolean {
  return contratoBaseAssinavel(CONTRATO_BASE_STATUS);
}

/** Letras A–P sem seção publicada correspondente (alerta de órfã). */
export function letrasSemSecaoPublicada(): string[] {
  const cobertas = new Set(Object.values(EQUIVALENCIA_SECAO_MATRIZ).flat());
  return CLAUSULAS_MATRIZ.filter((c) => !cobertas.has(c.id)).map((c) => c.id);
}

export function letrasDaSecao(secao: number): string[] {
  return EQUIVALENCIA_SECAO_MATRIZ[secao] ?? [];
}
