/**
 * Cadeia de formalização — proposta/OS aprovada até assinatura.
 *
 * Ordem institucional (elo só libera o seguinte):
 *  1. Proposta/OS aprovada
 *  2. Inclusões, exclusões e entregas derivadas
 *  3. Anexo I (Ordem de Serviço) preenchido
 *  4. Condição comercial formal
 *  5. Vencimentos definidos sem inferência
 *  6. Perfil institucional e política jurídica vigentes
 *  7. Anexos aplicáveis completos
 *  8. Revisão humana
 *  9. Assinatura
 *
 * Lógica pura. Nada aqui assina, cobra, comunica ou pesquisa: apenas avalia
 * estado a partir de dados já existentes e nunca infere valor ausente.
 */

import type { CampoExtraido, Validade } from "@/lib/escopo-proposta";

export const CADEIA_VERSAO = "CADEIA-FORMALIZACAO-v1.0";

export const ELOS_CADEIA = [
  { chave: "proposta_aprovada", ordem: 1, titulo: "Proposta/OS aprovada" },
  { chave: "itens_derivados", ordem: 2, titulo: "Inclusões, exclusões e entregas derivadas" },
  { chave: "anexo_i", ordem: 3, titulo: "Anexo I — Ordem de Serviço preenchido" },
  { chave: "condicao_comercial", ordem: 4, titulo: "Condição comercial formal" },
  { chave: "vencimentos", ordem: 5, titulo: "Vencimentos definidos sem inferência" },
  { chave: "perfil_politica", ordem: 6, titulo: "Perfil institucional e política jurídica vigentes" },
  { chave: "anexos_aplicaveis", ordem: 7, titulo: "Anexos aplicáveis completos" },
  { chave: "revisao_humana", ordem: 8, titulo: "Revisão humana" },
  { chave: "assinatura", ordem: 9, titulo: "Assinatura" },
] as const;

export type ChaveElo = (typeof ELOS_CADEIA)[number]["chave"];
export type EstadoElo = "ok" | "pendente" | "bloqueado";

export type Elo = {
  chave: ChaveElo;
  ordem: number;
  titulo: string;
  estado: EstadoElo;
  motivos: string[];
};

/* ------------------------------------------------------------------ */
/* Elo 2 — derivação estrita da proposta aprovada                      */
/* ------------------------------------------------------------------ */

export type TipoItemDerivado = "inclusao" | "exclusao" | "entrega";

export type ItemDerivado = {
  tipo: TipoItemDerivado;
  texto: string;
  campo: string;
  paginas: number[];
  origem: "proposta_os";
};

const MAPA_DERIVACAO: { campo: string; tipo: TipoItemDerivado }[] = [
  { campo: "servicos_incluidos", tipo: "inclusao" },
  { campo: "escopos_individuais", tipo: "inclusao" },
  { campo: "servicos_excluidos", tipo: "exclusao" },
  { campo: "despesas_externas", tipo: "exclusao" },
  { campo: "entregas_jornada", tipo: "entrega" },
];

/** Quebra o texto declarado em itens, sem completar, resumir ou inventar nada. */
export function quebrarEmItens(texto: string | null | undefined): string[] {
  return String(texto ?? "")
    .split(/\r?\n|(?<=[a-zà-ú0-9)])\s*;\s*/i)
    .map((t) => t.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter((t) => t.length > 2);
}

/**
 * Deriva inclusões, exclusões e entregas exclusivamente do que a proposta
 * aprovada declara. Campo não declarado vira falta, nunca item presumido.
 */
export function derivarItensDaProposta(input: {
  extraidos: CampoExtraido[];
  exclusoesTexto?: string | null;
}): { itens: ItemDerivado[]; faltantes: { campo: string; label: string }[] } {
  const itens: ItemDerivado[] = [];
  const faltantes: { campo: string; label: string }[] = [];

  for (const mapa of MAPA_DERIVACAO) {
    const campo = input.extraidos.find((e) => e.campo === mapa.campo);
    if (!campo) continue;
    const bruto =
      campo.valor ?? (mapa.campo === "servicos_excluidos" ? (input.exclusoesTexto ?? null) : null);
    const partes = quebrarEmItens(bruto);
    if (!partes.length) {
      if (campo.obrigatorio) faltantes.push({ campo: campo.campo, label: campo.label });
      continue;
    }
    for (const texto of partes) {
      itens.push({ tipo: mapa.tipo, texto, campo: campo.campo, paginas: campo.paginas, origem: "proposta_os" });
    }
  }

  return { itens, faltantes };
}

export function contarPorTipo(itens: ItemDerivado[]) {
  return {
    inclusao: itens.filter((i) => i.tipo === "inclusao").length,
    exclusao: itens.filter((i) => i.tipo === "exclusao").length,
    entrega: itens.filter((i) => i.tipo === "entrega").length,
  };
}

/* ------------------------------------------------------------------ */
/* Elo 3 — Anexo I persistido                                          */
/* ------------------------------------------------------------------ */

export type OrdemServicoRegistro = {
  id: string;
  case_id: string | null;
  status: string | null;
  scope_summary: string | null;
  deliverable_summary: string | null;
  archived_at?: string | null;
} | null;

export function anexoIPreenchido(
  os: OrdemServicoRegistro,
  itensPersistidos: number,
): { ok: boolean; motivos: string[] } {
  const motivos: string[] = [];
  if (!os) motivos.push("Anexo I (Ordem de Serviço) ainda não foi gerado a partir da proposta aprovada.");
  else {
    if (os.archived_at) motivos.push("Ordem de Serviço arquivada.");
    if (!os.case_id) motivos.push("Ordem de Serviço sem vínculo com o caso.");
    if (!String(os.scope_summary ?? "").trim()) motivos.push("Ordem de Serviço sem escopo derivado da proposta.");
    if (!String(os.deliverable_summary ?? "").trim()) motivos.push("Ordem de Serviço sem entregas derivadas da proposta.");
  }
  if (!itensPersistidos) motivos.push("Nenhum item de escopo derivado registrado no Anexo I.");
  return { ok: motivos.length === 0, motivos };
}

/* ------------------------------------------------------------------ */
/* Elos 4 e 5 — condição comercial e vencimentos                       */
/* ------------------------------------------------------------------ */

export type CondicaoComercialRegistro = {
  id: string;
  status: string | null;
  origem: string | null;
  forma_pagamento: string | null;
  parcelas: number | null;
  valor_parcela: number | null;
  valor_total_referencia: number | null;
  vencimento_dia: number | null;
  primeiro_vencimento: string | null;
  product_catalog_id: string | null;
  homologado_por: string | null;
  homologado_em: string | null;
  /**
   * true quando a condição vem de `case_commercial_condition` — a condição
   * particular versionada do caso, regida por produto-pai + trilha. Nesse
   * modelo o catálogo não é fonte comercial, então `product_catalog_id` não
   * existe e não pode ser exigido.
   */
  versionada?: boolean;
} | null;

/**
 * Linha de `case_commercial_condition` (condição particular versionada).
 * Só os campos que o gate usa — o restante fica com quem lê a tabela.
 */
export type CondicaoVersionadaRegistro = {
  id: string;
  approval_status: string | null;
  origem: string | null;
  payment_terms: string | null;
  parcelas: number | null;
  valor_parcela: number | string | null;
  fees: number | string | null;
  vencimento_dia?: number | null;
  primeiro_vencimento?: string | null;
  aprovado_por: string | null;
  aprovado_em: string | null;
  archived_at?: string | null;
} | null;

function numeroOuNulo(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/*
 * Correção de 09/10/2026 — o gate comercial lia a tabela superseded.
 *
 * `cadeia-formalizacao.server.ts` avaliava só `commercial_conditions`, mas a
 * condição particular aprovada da Ana vive em `case_commercial_condition`
 * desde 04/10 (produto-pai + trilha + condição do caso). Medido no banco, o
 * efeito era um bloqueio por porta lateral: a linha antiga está em
 * `rascunho`, com `parcelas`, `valor_parcela` e `product_catalog_id` nulos,
 * enquanto a versionada está `aprovada`, com 10 parcelas de R$ 320 e
 * responsáveis declarados. O gate acusava seis pendências, cinco delas
 * falsas — o dado existia, na outra tabela.
 *
 * De-para de vocabulário já existente, sem valor novo: `aprovada`
 * (`ccc_approval_status_chk`) é o estado terminal de aprovação equivalente a
 * `homologada` (`commercial_conditions_status_chk`).
 *
 * `product_catalog` não é apagado nem deixa de existir: continua inventário,
 * legado e reconciliação. O que ele deixa de ser é REQUISITO de formalização
 * quando o caso já tem condição particular versionada.
 */
export function condicaoVersionadaComoRegistro(
  cv: CondicaoVersionadaRegistro,
): CondicaoComercialRegistro {
  if (!cv || cv.archived_at) return null;
  return {
    id: cv.id,
    // `aprovada` é o terminal da condição versionada; o gate compara contra
    // `homologada`, o terminal equivalente do vocabulário antigo.
    status: cv.approval_status === "aprovada" ? "homologada" : cv.approval_status,
    origem: cv.origem,
    forma_pagamento: cv.payment_terms,
    parcelas: numeroOuNulo(cv.parcelas),
    valor_parcela: numeroOuNulo(cv.valor_parcela),
    valor_total_referencia: numeroOuNulo(cv.fees),
    vencimento_dia: cv.vencimento_dia ?? null,
    primeiro_vencimento: cv.primeiro_vencimento ?? null,
    product_catalog_id: null,
    homologado_por: cv.aprovado_por,
    homologado_em: cv.aprovado_em,
    versionada: true,
  };
}

/**
 * A condição que rege o caso: a particular versionada quando existe, senão a
 * do registro antigo. Nunca mistura as duas — a versionada vence inteira.
 */
export function condicaoVigenteDoCaso(input: {
  versionada: CondicaoVersionadaRegistro;
  legada: CondicaoComercialRegistro;
}): CondicaoComercialRegistro {
  return condicaoVersionadaComoRegistro(input.versionada) ?? input.legada;
}

export function condicaoComercialFormal(cc: CondicaoComercialRegistro): { ok: boolean; motivos: string[] } {
  const motivos: string[] = [];
  if (!cc) return { ok: false, motivos: ["Nenhuma condição comercial registrada para o caso."] };
  if (!String(cc.forma_pagamento ?? "").trim()) motivos.push("Forma de pagamento não declarada.");
  if (!cc.parcelas) motivos.push("Número de parcelas não declarado.");
  if (cc.valor_parcela === null || cc.valor_parcela === undefined) motivos.push("Valor da parcela não declarado.");
  if (cc.valor_total_referencia === null || cc.valor_total_referencia === undefined)
    motivos.push("Valor total de referência não declarado.");
  // Catálogo só é exigido no modelo antigo. Com condição particular
  // versionada, produto-pai + trilha regem e o SKU é apenas alimento.
  if (!cc.versionada && !cc.product_catalog_id) motivos.push("Condição sem produto homologado do catálogo.");
  if (cc.status !== "homologada") motivos.push(`Condição comercial em “${cc.status ?? "sem status"}”: exige homologação.`);
  if (!cc.homologado_por || !cc.homologado_em) motivos.push("Homologação sem responsável e data registrados.");
  return { ok: motivos.length === 0, motivos };
}

/** Vencimentos só existem quando primeiro vencimento, dia e parcelas são declarados. */
export function vencimentosDefinidos(cc: CondicaoComercialRegistro): {
  ok: boolean;
  motivos: string[];
  datas: string[];
} {
  const motivos: string[] = [];
  if (!cc) return { ok: false, motivos: ["Sem condição comercial: não há vencimento a definir."], datas: [] };
  if (!cc.primeiro_vencimento) motivos.push("Primeiro vencimento não declarado — o motor não infere data.");
  if (!cc.vencimento_dia) motivos.push("Dia de vencimento não declarado — o motor não infere dia.");
  if (!cc.parcelas) motivos.push("Parcelas não declaradas — o motor não infere quantidade.");
  if (motivos.length) return { ok: false, motivos, datas: [] };

  const datas = calendarioVencimentos({
    primeiro: cc.primeiro_vencimento as string,
    dia: cc.vencimento_dia as number,
    parcelas: cc.parcelas as number,
  });
  return { ok: true, motivos: [], datas };
}

/** Calendário aritmético a partir de campos declarados — nada é presumido. */
export function calendarioVencimentos(input: { primeiro: string; dia: number; parcelas: number }): string[] {
  const base = new Date(`${input.primeiro.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return [];
  const datas: string[] = [];
  for (let i = 0; i < input.parcelas; i += 1) {
    const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + i, input.dia));
    datas.push(d.toISOString().slice(0, 10));
  }
  return datas;
}

/* ------------------------------------------------------------------ */
/* Elo 6 — perfil institucional e política jurídica                    */
/* ------------------------------------------------------------------ */

export type RegraJuridicaVigente = {
  tema: string | null;
  versao: string | null;
  status: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  fonte_referencia: string | null;
  archived_at?: string | null;
};

export function perfilEPoliticaVigentes(input: {
  perfilVigente: boolean;
  perfilPendencias: string[];
  regras: RegraJuridicaVigente[];
  hoje?: Date;
}): { ok: boolean; motivos: string[]; regrasVigentes: RegraJuridicaVigente[] } {
  const hoje = input.hoje ?? new Date();
  const motivos: string[] = [];
  if (!input.perfilVigente) motivos.push(...(input.perfilPendencias.length ? input.perfilPendencias : ["Perfil institucional não vigente."]));

  const vigentes = input.regras.filter((r) => {
    if (r.archived_at) return false;
    if (r.status !== "vigente") return false;
    if (!r.vigencia_inicio) return false;
    if (new Date(r.vigencia_inicio) > hoje) return false;
    if (r.vigencia_fim && new Date(r.vigencia_fim) < hoje) return false;
    return Boolean(r.fonte_referencia);
  });

  if (!input.regras.length) motivos.push("Nenhuma regra jurídica versionada registrada para a trilha do caso.");
  else if (!vigentes.length)
    motivos.push("Nenhuma regra jurídica da trilha está vigente com fonte e vigência registradas (em revisão).");

  return { ok: motivos.length === 0, motivos, regrasVigentes: vigentes };
}

/* ------------------------------------------------------------------ */
/* Avaliação da cadeia                                                  */
/* ------------------------------------------------------------------ */

export type EntradaCadeia = {
  validadeProposta: Validade;
  extraidos: CampoExtraido[];
  exclusoesTexto?: string | null;
  ordemServico: OrdemServicoRegistro;
  itensPersistidos: number;
  condicao: CondicaoComercialRegistro;
  perfilVigente: boolean;
  perfilPendencias: string[];
  regras: RegraJuridicaVigente[];
  pendenciasAnexos: { titulo: string }[];
  gatesAnexos: { gate: string; motivo: string }[];
  revisaoHumanaAprovadaEm: string | null;
  assinaturaRegistradaEm: string | null;
  hoje?: Date;
};

export type ResultadoCadeia = {
  versao: string;
  elos: Elo[];
  derivacao: { itens: ItemDerivado[]; faltantes: { campo: string; label: string }[] };
  vencimentos: string[];
  proximoElo: ChaveElo | null;
  assinaturaLiberada: boolean;
};

export function avaliarCadeia(e: EntradaCadeia): ResultadoCadeia {
  const derivacao = derivarItensDaProposta({ extraidos: e.extraidos, exclusoesTexto: e.exclusoesTexto });
  const contagem = contarPorTipo(derivacao.itens);
  const anexoI = anexoIPreenchido(e.ordemServico, e.itensPersistidos);
  const comercial = condicaoComercialFormal(e.condicao);
  const venc = vencimentosDefinidos(e.condicao);
  const politica = perfilEPoliticaVigentes({
    perfilVigente: e.perfilVigente,
    perfilPendencias: e.perfilPendencias,
    regras: e.regras,
    hoje: e.hoje,
  });

  const motivosPorElo: Record<ChaveElo, string[]> = {
    proposta_aprovada: e.validadeProposta.valida ? [] : e.validadeProposta.motivos,
    itens_derivados: [
      ...derivacao.faltantes.map((f) => `Campo obrigatório não declarado na proposta: ${f.label}.`),
      ...(contagem.inclusao ? [] : ["Nenhuma inclusão derivada da proposta aprovada."]),
      ...(contagem.entrega ? [] : ["Nenhuma entrega derivada da proposta aprovada."]),
    ],
    anexo_i: anexoI.motivos,
    condicao_comercial: comercial.motivos,
    vencimentos: venc.motivos,
    perfil_politica: politica.motivos,
    anexos_aplicaveis: [
      ...e.pendenciasAnexos.map((p) => p.titulo),
      ...e.gatesAnexos.map((g) => `${g.gate}: ${g.motivo}`),
    ],
    revisao_humana: e.revisaoHumanaAprovadaEm ? [] : ["Revisão humana da versão final ainda não registrada."],
    assinatura: e.assinaturaRegistradaEm ? [] : ["Assinatura ainda não registrada."],
  };

  const elos: Elo[] = [];
  let anteriorPendente = false;
  for (const def of ELOS_CADEIA) {
    const motivos = motivosPorElo[def.chave];
    let estado: EstadoElo;
    if (anteriorPendente) estado = "bloqueado";
    else estado = motivos.length ? "pendente" : "ok";
    if (estado !== "ok") anteriorPendente = true;
    elos.push({ chave: def.chave, ordem: def.ordem, titulo: def.titulo, estado, motivos });
  }

  const proximo = elos.find((el) => el.estado === "pendente");
  const assinaturaLiberada = elos
    .filter((el) => el.chave !== "assinatura")
    .every((el) => el.estado === "ok");

  return {
    versao: CADEIA_VERSAO,
    elos,
    derivacao,
    vencimentos: venc.datas,
    proximoElo: proximo?.chave ?? null,
    assinaturaLiberada,
  };
}
