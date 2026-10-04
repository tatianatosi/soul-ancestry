/**
 * Estado real de cada um dos 54 campos da Ficha Master.
 *
 * MODO EXECUÇÃO CONTROLADA, 04/10/2026 (Proprietária), item 2: "Para cada
 * campo ausente, exiba 'sem dados suficientes' ou 'pendente de validação';
 * não use placeholder nem fallback demo."
 *
 * Medição que motivou o módulo: `caseAdapter.ts#toFichaPiloto` resolve campo
 * vazio com as constantes de `FALLBACK` — "Em atualização documental",
 * "Aguardando confirmação", "Em validação documental", "Documento ainda não
 * vinculado". São frases institucionais que LEEM como conteúdo real e
 * escondem a ausência do dado. Este módulo não apaga o adaptador: ele diz,
 * por campo, em qual dos três estados a leitura está, para a tela mostrar a
 * verdade em vez da frase.
 *
 * Puro e somente-leitura: nenhuma consulta, nenhuma escrita, nenhuma quarta
 * ficha. Os donos continuam sendo Pessoa, Núcleo, Pesquisa, Planejador e
 * Contrato — aqui só se lê o que eles já devolveram.
 */

import { FALLBACK } from "@/lib/evidence";

export type EstadoCampoFicha = "preenchido" | "sem_dados_suficientes" | "pendente_de_validacao";

/** Texto literal exigido pela Proprietária para cada estado de ausência. */
export const TEXTO_ESTADO_CAMPO: Record<EstadoCampoFicha, string> = {
  preenchido: "",
  sem_dados_suficientes: "sem dados suficientes",
  pendente_de_validacao: "pendente de validação",
};

/**
 * As frases institucionais do adaptador. Qualquer uma delas no valor de um
 * campo significa ausência disfarçada, não conteúdo.
 */
export const FRASES_DE_PREENCHIMENTO_VAZIO: readonly string[] = Object.values(FALLBACK);

/** Dono proprietário de cada família de campos — nunca a Ficha Master. */
export type DonoCampo = "pessoa" | "nucleo" | "pesquisa" | "planejador" | "contrato";

export type CampoFichaMaster = {
  campo: string;
  rotulo: string;
  dono: DonoCampo;
  /**
   * Campo que depende de validação humana (pesquisa, evidência, vínculo):
   * vazio aqui é "pendente de validação", não "sem dados suficientes".
   */
  dependeDeValidacao?: boolean;
};

/**
 * Os 54 campos, com o dono de cada um. A lista espelha exatamente as chaves
 * devolvidas por `toFichaPiloto`; o teste que acompanha falha se divergirem.
 */
export const CAMPOS_FICHA_MASTER: CampoFichaMaster[] = [
  { campo: "case_id", rotulo: "Código do caso", dono: "planejador" },
  { campo: "case_nome", rotulo: "Nome do caso", dono: "planejador" },
  { campo: "cliente_nome", rotulo: "Cliente", dono: "pessoa" },
  { campo: "status_caso", rotulo: "Status do caso", dono: "planejador" },
  { campo: "rota_provavel", rotulo: "Rota provável", dono: "planejador" },
  { campo: "documento_foco", rotulo: "Documento em foco", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "etapa_atual", rotulo: "Etapa atual", dono: "planejador" },
  { campo: "contexto_resumo", rotulo: "Contexto do caso", dono: "planejador" },
  { campo: "hipotese_principal", rotulo: "Hipótese principal (interna)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "trilha_origem", rotulo: "Trilha — origem", dono: "planejador" },
  { campo: "trilha_cidadania", rotulo: "Trilha — cidadania", dono: "planejador" },
  { campo: "trilha_memoria", rotulo: "Trilha — memória", dono: "planejador" },
  { campo: "heatmap_pais_1", rotulo: "País 1 (heatmap)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "heatmap_pct_1", rotulo: "Aderência país 1 (%)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "heatmap_pais_2", rotulo: "País 2 (heatmap)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "heatmap_pct_2", rotulo: "Aderência país 2 (%)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "heatmap_pais_3", rotulo: "País 3 (heatmap)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "heatmap_pct_3", rotulo: "Aderência país 3 (%)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "genograma_pessoa_1", rotulo: "Genograma — pessoa 1", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "genograma_pessoa_2", rotulo: "Genograma — pessoa 2", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "genograma_pessoa_3", rotulo: "Genograma — pessoa 3", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "arvore_conexao_chave", rotulo: "Árvore — conexão-chave", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "arvore_territorio", rotulo: "Árvore — território", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "arvore_lacuna", rotulo: "Árvore — lacuna crítica", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "alerta_titulo", rotulo: "Alerta — título", dono: "planejador" },
  { campo: "alerta_texto", rotulo: "Alerta — texto", dono: "planejador" },
  { campo: "doc_principal", rotulo: "Documento principal", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "doc_pendencia", rotulo: "Pendência documental", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "doc_status", rotulo: "Status documental", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "origem_pessoas_conectadas", rotulo: "Pessoas conectadas", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "origem_geracoes_lidas", rotulo: "Gerações lidas", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "origem_base_1", rotulo: "Base genealógica 1", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "origem_base_2", rotulo: "Base genealógica 2", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "origem_base_3", rotulo: "Base genealógica 3", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "origem_radar_resumo", rotulo: "Resumo do radar", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "origem_arvore_ampliada", rotulo: "Árvore ampliada (colaterais)", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "jornada_ancestral_1", rotulo: "Jornada ancestral", dono: "planejador" },
  { campo: "jornada_cliente_1", rotulo: "Jornada do cliente", dono: "planejador" },
  { campo: "jornada_intersecao_1", rotulo: "Interseção 1", dono: "planejador" },
  { campo: "jornada_intersecao_2", rotulo: "Interseção 2", dono: "planejador" },
  { campo: "descoberta_1", rotulo: "Descoberta 1", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "descoberta_2", rotulo: "Descoberta 2", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "entregavel_1", rotulo: "Entregável 1", dono: "pesquisa", dependeDeValidacao: true },
  { campo: "conta_produto_atual", rotulo: "Produto atual", dono: "contrato" },
  { campo: "conta_status_jornada", rotulo: "Status da jornada", dono: "planejador" },
  { campo: "conta_ultima_atualizacao", rotulo: "Última atualização", dono: "planejador" },
  { campo: "conta_historico_1", rotulo: "Histórico 1", dono: "planejador" },
  { campo: "conta_historico_2", rotulo: "Histórico 2", dono: "planejador" },
  { campo: "conta_historico_3", rotulo: "Histórico 3", dono: "planejador" },
  { campo: "conta_upgrade", rotulo: "Próximo nível", dono: "contrato" },
  { campo: "link_pasta_docs", rotulo: "Pasta de documentos", dono: "pesquisa" },
  { campo: "link_imagens", rotulo: "Pasta de imagens", dono: "pesquisa" },
  { campo: "link_fontes_extra", rotulo: "Fontes extras", dono: "pesquisa" },
  { campo: "obs_input_output", rotulo: "Regra de input/output", dono: "nucleo" },
];

export type LeituraCampoFicha = {
  campo: string;
  rotulo: string;
  dono: DonoCampo;
  /** Valor real quando existe; null quando o campo está ausente. */
  valor: string | null;
  estado: EstadoCampoFicha;
  /** O que a tela deve mostrar: o valor, ou o texto do estado. */
  exibicao: string;
};

function vazioOuFrasePronta(bruto: unknown): boolean {
  if (bruto === null || bruto === undefined) return true;
  if (Array.isArray(bruto)) return bruto.length === 0;
  if (typeof bruto === "number") return false;
  const t = String(bruto).trim();
  if (!t) return true;
  // Frase institucional de preenchimento não conta como dado.
  return FRASES_DE_PREENCHIMENTO_VAZIO.includes(t);
}

function comoTexto(bruto: unknown): string {
  if (Array.isArray(bruto)) return bruto.join(" · ");
  if (typeof bruto === "number") return String(bruto);
  return String(bruto ?? "").trim();
}

/**
 * Lê os 54 campos do resultado do adaptador e devolve, para cada um, o estado
 * real. Nenhum valor é inventado e nenhuma frase institucional sobrevive como
 * se fosse conteúdo.
 */
export function lerCamposFichaMaster(ficha: Record<string, unknown>): LeituraCampoFicha[] {
  return CAMPOS_FICHA_MASTER.map((c) => {
    const bruto = ficha[c.campo];
    if (vazioOuFrasePronta(bruto)) {
      const estado: EstadoCampoFicha = c.dependeDeValidacao ? "pendente_de_validacao" : "sem_dados_suficientes";
      return { ...c, valor: null, estado, exibicao: TEXTO_ESTADO_CAMPO[estado] };
    }
    const valor = comoTexto(bruto);
    return { ...c, valor, estado: "preenchido" as const, exibicao: valor };
  });
}

export type ResumoFichaMaster = {
  total: number;
  preenchidos: number;
  pendentesDeValidacao: number;
  semDadosSuficientes: number;
  /** Quantos campos cada dono ainda deve. */
  porDono: Record<DonoCampo, number>;
};

export function resumoFichaMaster(leituras: LeituraCampoFicha[]): ResumoFichaMaster {
  const porDono: Record<DonoCampo, number> = { pessoa: 0, nucleo: 0, pesquisa: 0, planejador: 0, contrato: 0 };
  for (const l of leituras) if (l.estado !== "preenchido") porDono[l.dono] += 1;
  return {
    total: leituras.length,
    preenchidos: leituras.filter((l) => l.estado === "preenchido").length,
    pendentesDeValidacao: leituras.filter((l) => l.estado === "pendente_de_validacao").length,
    semDadosSuficientes: leituras.filter((l) => l.estado === "sem_dados_suficientes").length,
    porDono,
  };
}
