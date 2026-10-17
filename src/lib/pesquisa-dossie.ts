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

export type DossiePesquisa = {
  acervosMapeados: number;
  hipotesesEmAberto: number;
  evidenciasValidadas: number;
  cartoriosAcionados: number;
  coberturaFontes: CoberturaFonte[];
  totalFontes: number;
  producaoEvidencias: ProducaoMensal[];
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

/**
 * Agrega os 4 KPIs do topo, a cobertura de fontes por tipo e a produção
 * mensal de evidências. Entradas já filtradas por organização e
 * `archived_at is null` por quem chama (ver `painelPesquisaModulo`).
 */
export function agregarDossiePesquisa(params: {
  acervosCatalogo: Registro[];
  hipoteses: Registro[];
  evidencias: Registro[];
  fontes: Registro[];
  pedidos: Registro[];
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

  return {
    acervosMapeados: params.acervosCatalogo.length,
    hipotesesEmAberto,
    evidenciasValidadas,
    cartoriosAcionados: instituicoesAcionadas.size,
    coberturaFontes: coberturaPorTipo(params.fontes),
    totalFontes: params.fontes.length,
    producaoEvidencias: producaoPorMes(params.evidencias),
  };
}
