/**
 * Camada de migração controlada: fontes legadas somente leitura, importação Placego,
 * deduplicação e relatório. Nada aqui grava em planilha, dispara webhook ou ação externa.
 */

export type FonteLegada = {
  codigo: string;
  nome: string;
  natureza: "planilha" | "api" | "documental" | "transacional";
  situacao: "legado_somente_leitura" | "canonica";
  usoPermitido: string;
  usoProibido: string;
};

/** Decisão de governança CA-DEC-2026-08-19-02: planilhas viram legado somente leitura. */
export const FONTES_LEGADAS: FonteLegada[] = [
  {
    codigo: "planilha_mestre_produtos",
    nome: "Planilha Mestre de Produtos",
    natureza: "planilha",
    situacao: "legado_somente_leitura",
    usoPermitido: "Inventário, deduplicação, migração controlada e auditoria histórica.",
    usoProibido: "Novo dado operacional, etapa de webhook ou fonte de preço vigente.",
  },
  {
    codigo: "crm_ops",
    nome: "CRM OPS (planilha)",
    natureza: "planilha",
    situacao: "legado_somente_leitura",
    usoPermitido: "Conferência histórica de casos e leads já existentes.",
    usoProibido: "Cadastro novo, atualização de estado operacional ou automação.",
  },
  {
    codigo: "crm_planilhas",
    nome: "Demais planilhas de CRM",
    natureza: "planilha",
    situacao: "legado_somente_leitura",
    usoPermitido: "Inventário e reconciliação de duplicidades.",
    usoProibido: "Qualquer inserção operacional nova.",
  },
  {
    codigo: "placego",
    nome: "Placego",
    natureza: "api",
    situacao: "legado_somente_leitura",
    usoPermitido: "Origem de migração de leads por CSV; API autenticada prevista.",
    usoProibido: "Fonte canônica de estado operacional após a importação.",
  },
  {
    codigo: "desk_supabase",
    nome: "Desk Intelligence",
    natureza: "api",
    situacao: "canonica",
    usoPermitido: "Fonte canônica de todo dado operacional novo.",
    usoProibido: "—",
  },
  {
    codigo: "asaas",
    nome: "Asaas",
    natureza: "transacional",
    situacao: "canonica",
    usoPermitido: "Fonte canônica de eventos financeiros e transacionais.",
    usoProibido: "Nenhuma cobrança criada por esta entrega.",
  },
  {
    codigo: "drive",
    nome: "Drive",
    natureza: "documental",
    situacao: "canonica",
    usoPermitido: "Fonte documental.",
    usoProibido: "Fonte de estado operacional.",
  },
];

export type CampoPlacego = {
  campo: string;
  rotulo: string;
  destino: string;
  obrigatorio: boolean;
};

/** Mapa Placego → Desk. Nenhum campo é inventado: só o que a origem declara. */
export const CAMPOS_PLACEGO: CampoPlacego[] = [
  { campo: "lead_id_placego", rotulo: "ID do lead no Placego", destino: "legacy_record_links.legacy_record_id", obrigatorio: true },
  { campo: "nome", rotulo: "Nome", destino: "leads.nome", obrigatorio: true },
  { campo: "email", rotulo: "E-mail", destino: "leads.email", obrigatorio: false },
  { campo: "telefone", rotulo: "Telefone", destino: "leads.telefone", obrigatorio: false },
  { campo: "data_entrada", rotulo: "Data de entrada", destino: "leads.created_at (referência)", obrigatorio: false },
  { campo: "origem", rotulo: "Origem", destino: "lead_sources.codigo", obrigatorio: false },
  { campo: "campanha", rotulo: "Campanha", destino: "marketing_campaigns.codigo", obrigatorio: false },
  { campo: "utm_source", rotulo: "UTM source", destino: "attribution_records.utm_source", obrigatorio: false },
  { campo: "utm_medium", rotulo: "UTM medium", destino: "attribution_records.utm_medium", obrigatorio: false },
  { campo: "utm_campaign", rotulo: "UTM campaign", destino: "attribution_records.utm_campaign", obrigatorio: false },
  { campo: "status", rotulo: "Status legado", destino: "leads.status (referência legada)", obrigatorio: false },
  { campo: "responsavel", rotulo: "Responsável", destino: "leads.responsavel", obrigatorio: false },
  { campo: "investimento", rotulo: "Investimento", destino: "marketing_investments.valor", obrigatorio: false },
  { campo: "data_investimento", rotulo: "Data do investimento", destino: "marketing_investments.competencia", obrigatorio: false },
  { campo: "evento_conversao", rotulo: "Evento de conversão", destino: "conversion_events.event_type", obrigatorio: false },
  { campo: "data_evento", rotulo: "Data do evento", destino: "conversion_events.occurred_at", obrigatorio: false },
  { campo: "observacao_legada", rotulo: "Observação legada", destino: "leads.observacao", obrigatorio: false },
];

/** Leitor de CSV tolerante a aspas e ponto e vírgula. */
export function lerCsv(texto: string): { cabecalho: string[]; linhas: string[][] } {
  const conteudo = texto.replace(/^\uFEFF/, "").trim();
  if (!conteudo) return { cabecalho: [], linhas: [] };
  const separador = (conteudo.split("\n")[0].match(/;/g)?.length ?? 0) > (conteudo.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const linhas: string[][] = [];
  let campo = "";
  let atual: string[] = [];
  let aspas = false;
  for (let i = 0; i < conteudo.length; i += 1) {
    const c = conteudo[i];
    if (aspas) {
      if (c === '"' && conteudo[i + 1] === '"') { campo += '"'; i += 1; }
      else if (c === '"') aspas = false;
      else campo += c;
      continue;
    }
    if (c === '"') aspas = true;
    else if (c === separador) { atual.push(campo); campo = ""; }
    else if (c === "\n") { atual.push(campo.replace(/\r$/, "")); linhas.push(atual); atual = []; campo = ""; }
    else campo += c;
  }
  atual.push(campo.replace(/\r$/, ""));
  linhas.push(atual);
  const cabecalho = (linhas.shift() ?? []).map((h) => h.trim());
  return { cabecalho, linhas: linhas.filter((l) => l.some((v) => v.trim() !== "")) };
}

const semAcento = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Sugere o mapeamento coluna do arquivo → campo Placego, sem adivinhar campos inexistentes. */
export function sugerirMapeamento(cabecalho: string[]): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const campo of CAMPOS_PLACEGO) {
    const alvo = semAcento(campo.campo).toLowerCase();
    const achado = cabecalho.find((h) => {
      const n = semAcento(h).toLowerCase().replace(/\s+/g, "_");
      return n === alvo || n.replace(/^lead_/, "") === alvo.replace(/^lead_/, "");
    });
    if (achado) mapa[campo.campo] = achado;
  }
  return mapa;
}

export type LinhaPlacego = Record<string, string>;

export function aplicarMapeamento(
  cabecalho: string[],
  linhas: string[][],
  mapeamento: Record<string, string>,
): LinhaPlacego[] {
  return linhas.map((linha) => {
    const registro: LinhaPlacego = {};
    for (const campo of CAMPOS_PLACEGO) {
      const coluna = mapeamento[campo.campo];
      if (!coluna) continue;
      const idx = cabecalho.indexOf(coluna);
      registro[campo.campo] = idx >= 0 ? (linha[idx] ?? "").trim() : "";
    }
    return registro;
  });
}

export const chaveEmail = (v?: string | null) => (v ?? "").trim().toLowerCase() || null;
export const chaveTelefone = (v?: string | null) => {
  const digitos = (v ?? "").replace(/\D/g, "");
  return digitos.length >= 8 ? digitos.slice(-11) : null;
};
export const chaveNome = (v?: string | null) =>
  semAcento((v ?? "").trim().toLowerCase()).replace(/\s+/g, " ") || null;

export type ExistenteLead = { id: string; nome?: string | null; email?: string | null; telefone?: string | null };

export type ResultadoLinha = {
  indice: number;
  registro: LinhaPlacego;
  acao: "criar" | "atualizar" | "duplicado" | "rejeitado";
  motivo?: string;
  alvoId?: string;
  chave?: "email" | "telefone" | "nome";
};

/** Planeja a importação: deduplica por e-mail, telefone e nome, preservando o ID Placego. */
export function planejarImportacao(
  registros: LinhaPlacego[],
  existentes: ExistenteLead[],
  vinculosLegados: { legacy_record_id: string; canonical_record_id: string | null }[],
): { linhas: ResultadoLinha[]; resumo: Record<string, number> } {
  const porEmail = new Map<string, ExistenteLead>();
  const porTelefone = new Map<string, ExistenteLead>();
  const porNome = new Map<string, ExistenteLead>();
  for (const e of existentes) {
    const em = chaveEmail(e.email); if (em) porEmail.set(em, e);
    const tel = chaveTelefone(e.telefone); if (tel) porTelefone.set(tel, e);
    const nm = chaveNome(e.nome); if (nm) porNome.set(nm, e);
  }
  const jaImportado = new Map(vinculosLegados.map((v) => [v.legacy_record_id, v.canonical_record_id]));
  const vistosNoArquivo = new Set<string>();

  const linhas: ResultadoLinha[] = registros.map((registro, indice) => {
    const idLegado = (registro.lead_id_placego ?? "").trim();
    const nome = (registro.nome ?? "").trim();
    if (!idLegado) return { indice, registro, acao: "rejeitado", motivo: "ID Placego ausente — sem chave de rastreio." };
    if (!nome) return { indice, registro, acao: "rejeitado", motivo: "Nome ausente — registro não identificável." };
    if (vistosNoArquivo.has(idLegado)) return { indice, registro, acao: "duplicado", motivo: "ID Placego repetido no próprio arquivo." };
    vistosNoArquivo.add(idLegado);
    if (jaImportado.has(idLegado)) {
      return {
        indice,
        registro,
        acao: "atualizar",
        motivo: "ID Placego já vinculado a registro canônico.",
        alvoId: jaImportado.get(idLegado) ?? undefined,
      };
    }
    const em = chaveEmail(registro.email);
    const tel = chaveTelefone(registro.telefone);
    const nm = chaveNome(nome);
    const achado = (em && porEmail.get(em)) || (tel && porTelefone.get(tel)) || (nm && porNome.get(nm)) || null;
    if (achado) {
      const chave: ResultadoLinha["chave"] = em && porEmail.get(em) ? "email" : tel && porTelefone.get(tel) ? "telefone" : "nome";
      return {
        indice,
        registro,
        acao: "duplicado",
        chave,
        alvoId: achado.id,
        motivo: `Correspondência por ${chave} com lead existente — vincular sem criar duplicata.`,
      };
    }
    return { indice, registro, acao: "criar" };
  });

  const resumo = {
    total: linhas.length,
    criar: linhas.filter((l) => l.acao === "criar").length,
    atualizar: linhas.filter((l) => l.acao === "atualizar").length,
    duplicado: linhas.filter((l) => l.acao === "duplicado").length,
    rejeitado: linhas.filter((l) => l.acao === "rejeitado").length,
  };
  return { linhas, resumo };
}

export const MAPPING_VERSION = "placego-v1";
