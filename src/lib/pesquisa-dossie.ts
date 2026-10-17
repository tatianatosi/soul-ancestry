/*
 * 17/10/2026 — Dossiê de pesquisa (Tela 07, /pesquisa-modulo), adaptado do
 * mockup "Pesquisa — Dossiê de pesquisa" aprovado pela Proprietária
 * (15/10/2026). A especificação em texto pedia barra dupla "Ramo Paterno
 * vs. Ramo Materno"; nenhuma tabela real tem essa dimensão estruturada
 * (só existe como texto livre em `avo_paterno`/`bisavo_paterno`, campos de
 * uma ficha mestre legada — não uma coluna de banco) e criar uma exigiria
 * migration + vocabulário CHECK novo, que AGENTS.md proíbe sem autorização
 * explícita. O mockup aprovado por imagem na verdade usa "Cobertura das
 * fontes" por TIPO real de fonte (`research_sources.source_type`), não por
 * ramo — é essa leitura que este arquivo implementa. Cálculo puro, sem
 * I/O, para poder ser testado sem mock de Supabase.
 */

type Registro = Record<string, unknown>;

const ROTULO_TIPO_FONTE: Record<string, string> = {
  civil_record: "Registro civil",
  religious_record: "Paroquial",
  family_document: "Documento familiar",
  official_registry: "Registro oficial",
  archive_catalog: "Catálogo de arquivo",
  public_archive: "Arquivo público",
  familysearch_reference: "Referência FamilySearch",
  interview: "Entrevista",
  client_provided: "Fornecido pelo cliente",
  internal_note: "Nota interna",
  other: "Outra fonte",
};

export type CoberturaFonte = { tipo: string; rotulo: string; quantidade: number };
export type ProducaoMensal = { mes: string; quantidade: number };

/** `research_sources.source_status`, vocabulário real (migration 20260816231149). */
const ROTULO_STATUS_FONTE: Record<string, string> = {
  referenced: "Referenciada",
  located: "Localizada",
  reviewed: "Revisada",
  verified: "Verificada",
  inaccessible: "Inacessível",
  rejected: "Rejeitada",
};

export type FonteReferencia = { id: string; titulo: string; status: string; rotuloStatus: string; instituicao: string | null };

/** `research_case_hypotheses.confidence_level`/`status`, vocabulário real (mesma migration). */
const ROTULO_CONFIANCA_HIPOTESE: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta" };
const ROTULO_STATUS_HIPOTESE: Record<string, string> = {
  open: "Aberta",
  under_review: "Em revisão",
  supported: "Sustentada",
  not_supported: "Não sustentada",
  inconclusive: "Inconclusiva",
  closed: "Encerrada",
};

export type HipoteseResumo = { id: string; titulo: string; status: string; rotuloStatus: string; confianca: string; rotuloConfianca: string };

export type EtapaPesquisa = { id: string; titulo: string; ativa: boolean; semRastro?: boolean };

export type DossiePesquisa = {
  acervosMapeados: number;
  hipotesesEmAberto: number;
  evidenciasValidadas: number;
  cartoriosAcionados: number;
  coberturaFontes: CoberturaFonte[];
  totalFontes: number;
  producaoEvidencias: ProducaoMensal[];
  fontesRecentes: FonteReferencia[];
  hipotesesRecentes: HipoteseResumo[];
  /**
   * Confiança média das hipóteses ativas (status != 'closed'), em %.
   * Fórmula: confidence_level codificado em low=33 / medium=66 / high=100,
   * média aritmética arredondada. `null` sem hipótese ativa — nunca 0
   * fingido. Não é uma métrica do schema, é derivada de um campo ordinal
   * real; documentada aqui e no PR por não ter fonte de verdade própria.
   */
  confiancaCadeiaPct: number | null;
  etapas: EtapaPesquisa[];
};

const texto = (v: unknown): string => String(v ?? "").trim();

/** Conta fontes reais por `source_type`, maior quantidade primeiro. */
function coberturaPorTipo(fontes: Registro[]): CoberturaFonte[] {
  const contagem = new Map<string, number>();
  for (const f of fontes) {
    const tipo = texto(f["source_type"]);
    if (!tipo) continue;
    contagem.set(tipo, (contagem.get(tipo) ?? 0) + 1);
  }
  return Array.from(contagem.entries())
    .map(([tipo, quantidade]) => ({ tipo, rotulo: ROTULO_TIPO_FONTE[tipo] ?? tipo, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/** Produção de evidências por mês (AAAA-MM), últimos `meses` meses, cronológico. */
function producaoPorMes(evidencias: Registro[], meses = 6): ProducaoMensal[] {
  const hoje = new Date();
  const janelas: { chave: string; rotulo: string }[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const rotulo = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    janelas.push({ chave, rotulo });
  }
  const contagem = new Map(janelas.map((j) => [j.chave, 0]));
  for (const e of evidencias) {
    const criadoEm = texto(e["created_at"]);
    if (!criadoEm) continue;
    const chave = criadoEm.slice(0, 7);
    if (contagem.has(chave)) contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
  }
  return janelas.map((j) => ({ mes: j.rotulo, quantidade: contagem.get(j.chave) ?? 0 }));
}

/** Até `limite` fontes mais recentes, com status real — nunca rótulo inventado. */
function fontesMaisRecentes(fontes: Registro[], limite = 6): FonteReferencia[] {
  return [...fontes]
    .sort((a, b) => texto(b["created_at"]).localeCompare(texto(a["created_at"])))
    .slice(0, limite)
    .map((f) => {
      const status = texto(f["source_status"]);
      return {
        id: texto(f["id"]),
        titulo: texto(f["title"]) || "Fonte sem título registrado",
        status,
        rotuloStatus: ROTULO_STATUS_FONTE[status] ?? (status || "Sem status"),
        instituicao: texto(f["repository_or_institution"]) || null,
      };
    });
}

/** Até `limite` hipóteses mais recentes, status/confiança reais do CHECK. */
function hipotesesMaisRecentes(hipoteses: Registro[], limite = 6): HipoteseResumo[] {
  return [...hipoteses]
    .sort((a, b) => texto(b["created_at"]).localeCompare(texto(a["created_at"])))
    .slice(0, limite)
    .map((h) => {
      const status = texto(h["status"]);
      const confianca = texto(h["confidence_level"]);
      return {
        id: texto(h["id"]),
        titulo: texto(h["title"]) || "Hipótese sem título registrado",
        status,
        rotuloStatus: ROTULO_STATUS_HIPOTESE[status] ?? (status || "Sem status"),
        confianca,
        rotuloConfianca: ROTULO_CONFIANCA_HIPOTESE[confianca] ?? (confianca || "Sem avaliação"),
      };
    });
}

const PESO_CONFIANCA: Record<string, number> = { low: 33, medium: 66, high: 100 };

/** Ver DossiePesquisa.confiancaCadeiaPct para a fórmula e seus limites. */
function confiancaCadeia(hipoteses: Registro[]): number | null {
  const ativas = hipoteses.filter((h) => texto(h["status"]) !== "closed");
  const pesos = ativas.map((h) => PESO_CONFIANCA[texto(h["confidence_level"])]).filter((p): p is number => p !== undefined);
  if (pesos.length === 0) return null;
  return Math.round(pesos.reduce((s, p) => s + p, 0) / pesos.length);
}

/**
 * Régua "da pergunta à microentrega". Cada etapa marcada ativa (✔) só se
 * houver pelo menos 1 registro real na tabela correspondente, org-wide.
 * "Pergunta" não tem tabela própria no schema — nenhuma pergunta de
 * pesquisa é persistida como entidade separada — e "Pronta para revisão"
 * não tem status terminal próprio em nenhuma tabela consultada aqui;
 * ambas ficam `semRastro: true` (estado neutro), nunca marcadas como
 * concluídas sem base real.
 */
function montarEtapas(params: {
  temFonte: boolean;
  temEvidenciaValidada: boolean;
  temAchado: boolean;
  temMicroentrega: boolean;
}): EtapaPesquisa[] {
  return [
    { id: "pergunta", titulo: "Pergunta", ativa: false, semRastro: true },
    { id: "fonte", titulo: "Fonte", ativa: params.temFonte },
    { id: "evidencia", titulo: "Evidência", ativa: params.temEvidenciaValidada },
    { id: "achado", titulo: "Achado", ativa: params.temAchado },
    { id: "microentrega", titulo: "Microentrega", ativa: params.temMicroentrega },
    { id: "revisao", titulo: "Pronta para revisão", ativa: false, semRastro: true },
  ];
}

/**
 * Agrega os 4 KPIs do topo, a cobertura de fontes por tipo, a produção
 * mensal de evidências, as listas de "Fontes e referências" e "Hipóteses
 * e confiança", a confiança média da cadeia e a régua de etapas. Entradas
 * já filtradas por organização e `archived_at is null` por quem chama
 * (ver `painelPesquisaModulo`).
 */
export function agregarDossiePesquisa(params: {
  acervosCatalogo: Registro[];
  hipoteses: Registro[];
  evidencias: Registro[];
  fontes: Registro[];
  pedidos: Registro[];
  achados?: Registro[];
  microentregas?: Registro[];
}): DossiePesquisa {
  const hipotesesEmAberto = params.hipoteses.filter((h) =>
    ["open", "under_review"].includes(texto(h["status"])),
  ).length;
  const evidenciasValidadas = params.evidencias.filter((e) => texto(e["evidence_status"]) === "validated").length;

  const instituicoesAcionadas = new Set(
    params.pedidos
      .filter((p) => texto(p["status"]) !== "draft")
      .map((p) => texto(p["target_institution"]))
      .filter((inst) => inst.length > 0),
  );

  const achados = params.achados ?? [];
  const microentregas = params.microentregas ?? [];

  return {
    acervosMapeados: params.acervosCatalogo.length,
    hipotesesEmAberto,
    evidenciasValidadas,
    cartoriosAcionados: instituicoesAcionadas.size,
    coberturaFontes: coberturaPorTipo(params.fontes),
    totalFontes: params.fontes.length,
    producaoEvidencias: producaoPorMes(params.evidencias),
    fontesRecentes: fontesMaisRecentes(params.fontes),
    hipotesesRecentes: hipotesesMaisRecentes(params.hipoteses),
    confiancaCadeiaPct: confiancaCadeia(params.hipoteses),
    etapas: montarEtapas({
      temFonte: params.fontes.length > 0,
      temEvidenciaValidada: evidenciasValidadas > 0,
      temAchado: achados.length > 0,
      temMicroentrega: microentregas.length > 0,
    }),
  };
}
