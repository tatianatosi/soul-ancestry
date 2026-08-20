/**
 * G-08 — Bloco 5B-PRE: catálogo e governança de bases e fontes genealógicas.
 *
 * Módulo estritamente interno e documental. Nada aqui consulta fonte externa,
 * abre API, executa scraping, gera credencial ou publica algo no App Cliente.
 * O banco é a autoridade final das travas; esta camada apenas classifica,
 * ordena e explica o que já está persistido.
 */

export type Fonte = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const NIVEIS_FONTE = {
  primaria: "Primária",
  secundaria: "Secundária",
  colaborativa: "Colaborativa",
  indice: "Índice",
  institucional: "Institucional",
} as const;

export const ACESSOS = {
  publico: "Público",
  login: "Login",
  pago: "Pago",
  parceria: "Parceria",
  restrito: "Restrito",
} as const;

export const MODOS_USO = {
  manual: "Manual",
  metadados_linkout: "Metadados / linkout",
  api_validada: "API validada",
  parceria: "Parceria",
  restrito: "Restrito",
  nao_validado: "Não validado",
} as const;

export const SCRAPING_STATUS = {
  proibido_por_padrao: "Proibido por padrão",
  exige_validacao_juridica_tecnica: "Exige validação jurídica e técnica",
  nao_aplicavel: "Não aplicável",
} as const;

export const ESTAGIOS = {
  CATALOGADA: "Catalogada",
  DOCUMENTADA: "Documentada",
  TERMOS_A_CONFIRMAR: "Termos a confirmar",
  ELEGIVEL_PARA_PILOTO: "Elegível para piloto",
  PILOTO_INTERNO: "Piloto interno",
  HOMOLOGADA_MANUAL: "Homologada (manual)",
  HOMOLOGADA_API: "Homologada (API)",
  RESTRITA: "Restrita",
  DESCONTINUADA: "Descontinuada",
} as const;

export const STATUS_DOCUMENTACAO = {
  nao_documentada: "Não documentada",
  parcial: "Parcial",
  completa: "Completa",
  termos_a_confirmar: "Termos a confirmar",
} as const;

export const STATUS_INTEGRACAO = {
  sem_integracao: "Sem integração",
  uso_manual: "Uso manual",
  piloto_interno: "Piloto interno",
  homologada_manual: "Homologada manual",
  homologada_api: "Homologada API",
  bloqueada: "Bloqueada",
} as const;

export const CRITERIOS_MATRIZ = {
  juridico: "Jurídico",
  tecnico: "Técnico",
  risco: "Risco",
  custo: "Custo",
  valor_probatorio: "Valor probatório",
  cobertura: "Cobertura",
  estabilidade: "Estabilidade",
} as const;

export const STATUS_BACKLOG = {
  planejada: "Planejada",
  em_analise: "Em análise",
  aguardando_juridico: "Aguardando jurídico",
  aguardando_tecnico: "Aguardando técnico",
  bloqueada: "Bloqueada",
  concluida: "Concluída",
  cancelada: "Cancelada",
} as const;

export const PRIORIDADES = { critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa" } as const;

export const AVISO_CATALOGO =
  "Catálogo interno de governança. Fonte catalogada não é integração: nenhuma consulta, API, scraping, credencial ou comunicação externa é executada aqui.";

export function rotuloDe(dic: Record<string, string>, chave?: string | null) {
  if (!chave) return "—";
  return dic[chave] ?? chave;
}

const ESTAGIOS_HOMOLOGADOS = ["HOMOLOGADA_MANUAL", "HOMOLOGADA_API"];
const ESTAGIOS_BLOQUEADOS = ["RESTRITA", "DESCONTINUADA"];

/** Fonte restrita ou descontinuada nunca é recomendação operacional. */
export function fonteBloqueada(f: Fonte): boolean {
  return ESTAGIOS_BLOQUEADOS.includes(f.estagio_maturidade) || Boolean(f.archived_at);
}

/**
 * Teste 1 — fonte catalogada não permite consulta automática.
 * Consulta automática só existiria com API homologada; e mesmo homologada,
 * este corte não executa nenhuma chamada.
 */
export function permiteConsultaAutomatica(f: Fonte): { permitido: false; motivo: string } {
  if (fonteBloqueada(f)) return { permitido: false, motivo: "Fonte restrita ou descontinuada: uso operacional bloqueado." };
  if (f.estagio_maturidade !== "HOMOLOGADA_API" || f.modo_de_uso_permitido !== "api_validada")
    return {
      permitido: false,
      motivo: "Fonte não homologada por API: consulta automática indisponível. Fonte catalogada não é integração.",
    };
  return {
    permitido: false,
    motivo: "Consulta automática não implementada neste corte (5B-PRE): nenhuma API é conectada nem executada.",
  };
}

/** Teste 2 — fonte com termos a confirmar não pode ser homologada nem ir a piloto. */
export function podeAvancarMaturidade(f: Fonte, destino: string): { ok: boolean; motivo: string } {
  const avancos = ["ELEGIVEL_PARA_PILOTO", "PILOTO_INTERNO", "HOMOLOGADA_MANUAL", "HOMOLOGADA_API"];
  if (!avancos.includes(destino)) return { ok: true, motivo: "" };
  if (fonteBloqueada(f)) return { ok: false, motivo: "Fonte restrita ou descontinuada não avança de estágio." };
  if (f.estagio_maturidade === "TERMOS_A_CONFIRMAR" || f.status_documentacao === "termos_a_confirmar")
    return { ok: false, motivo: "Termos de uso a confirmar: sem parecer jurídico registrado a fonte não avança." };
  if (f.status_documentacao !== "completa")
    return { ok: false, motivo: "Documentação incompleta: avanço de maturidade exige documentação completa." };
  if (destino === "HOMOLOGADA_API" && f.modo_de_uso_permitido !== "api_validada")
    return { ok: false, motivo: "Fonte manual não equivale a API homologada." };
  return { ok: true, motivo: "" };
}

/**
 * Teste 3 — fonte manual pode ser vinculada a um item de pesquisa,
 * e o vínculo é apenas referencial: não consulta, não baixa e não acessa a fonte.
 */
export function vincularFonteAPesquisa(f: Fonte): {
  permitido: boolean;
  acessoExterno: false;
  consultaExecutada: false;
  motivo: string;
} {
  if (fonteBloqueada(f))
    return {
      permitido: false,
      acessoExterno: false,
      consultaExecutada: false,
      motivo: "Fonte restrita ou descontinuada não pode ser vinculada como referência operacional.",
    };
  if (f.modo_de_uso_permitido === "nao_validado")
    return {
      permitido: false,
      acessoExterno: false,
      consultaExecutada: false,
      motivo: "Modo de uso não validado: documente a fonte antes de vinculá-la.",
    };
  return {
    permitido: true,
    acessoExterno: false,
    consultaExecutada: false,
    motivo: "Vínculo documental interno. Vincular fonte a pesquisa não consulta a fonte.",
  };
}

/** Teste 4 — sugestões de pesquisa nunca incluem fonte restrita/descontinuada. */
export function fontesSugeridas(fontes: Fonte[], filtro?: { paisEixo?: string; trackId?: string }): Fonte[] {
  const ordem: Record<string, number> = { critica: 0, alta: 1, media: 2, baixa: 3 };
  return fontes
    .filter((f) => !fonteBloqueada(f))
    .filter((f) => f.modo_de_uso_permitido !== "restrito" && f.modo_de_uso_permitido !== "nao_validado")
    .filter((f) => ["DOCUMENTADA", "ELEGIVEL_PARA_PILOTO", "PILOTO_INTERNO", ...ESTAGIOS_HOMOLOGADOS].includes(f.estagio_maturidade))
    .filter((f) => (filtro?.paisEixo ? f.pais_eixo === filtro.paisEixo : true))
    .filter((f) => (filtro?.trackId ? !f.citizenship_track_id || f.citizenship_track_id === filtro.trackId : true))
    .sort((a, b) => (ordem[a.prioridade] ?? 9) - (ordem[b.prioridade] ?? 9) || String(a.nome).localeCompare(String(b.nome)));
}

const PADRAO_SEGREDO = /(token|bearer\s|api[_ -]?key|senha|password|secret|authorization|payload|access_token)/i;

/** Teste 5 — estrutura futura de logs nunca aceita token/credencial/payload bruto. */
export function validarRegistroAcessoFuturo(entrada: { resumo_interno?: string | null }): { ok: boolean; motivo: string } {
  const txt = entrada.resumo_interno ?? "";
  if (PADRAO_SEGREDO.test(txt))
    return { ok: false, motivo: "Registro de acesso não aceita token, credencial ou payload bruto." };
  if (txt.length > 500) return { ok: false, motivo: "Apenas resumo interno curto: nunca a resposta bruta da fonte." };
  return { ok: true, motivo: "" };
}

/** Painel: agrupamentos internos do catálogo. */
export function agruparCatalogo(fontes: Fonte[]) {
  const ativas = fontes.filter((f) => !f.archived_at);
  return {
    total: ativas.length,
    porEstagio: Object.keys(ESTAGIOS).map((e) => ({
      estagio: e,
      rotulo: ESTAGIOS[e as keyof typeof ESTAGIOS],
      fontes: ativas.filter((f) => f.estagio_maturidade === e),
    })),
    termosAConfirmar: ativas.filter(
      (f) => f.estagio_maturidade === "TERMOS_A_CONFIRMAR" || f.status_documentacao === "termos_a_confirmar",
    ),
    riscoAlto: ativas.filter((f) => ["alto", "critico"].includes(f.risco)),
    bloqueadas: ativas.filter(fonteBloqueada),
    recomendaveis: fontesSugeridas(ativas),
    semVerificacao: ativas.filter((f) => !f.ultima_verificacao),
  };
}

/** Pendências de governança por fonte (leitura; nenhuma ação é disparada). */
export function pendenciasGovernanca(f: Fonte): string[] {
  const p: string[] = [];
  if (!f.licenca_termos) p.push("Licença/termos não registrados.");
  if (f.status_documentacao !== "completa") p.push("Documentação incompleta.");
  if (!f.ultima_verificacao) p.push("Sem data de última verificação.");
  if (!f.responsavel_revisao) p.push("Sem responsável pela revisão.");
  if (f.risco === "nao_avaliado") p.push("Risco não avaliado.");
  if (f.trata_dados_pessoais && !f.observacao_risco) p.push("Trata dados pessoais sem observação de risco.");
  if (f.scraping_status === "exige_validacao_juridica_tecnica") p.push("Scraping pendente de validação jurídica e técnica.");
  return p;
}
