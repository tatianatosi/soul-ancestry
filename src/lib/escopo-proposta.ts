/**
 * Regra institucional — escopo proveniente da proposta Canva aprovada.
 *
 * Fonte mandatória: a proposta vigente aprovada no Canva, páginas 1 a 7.
 * CRM, Planejador, WhatsApp, transcrição e preenchimento livre NUNCA criam,
 * ampliam, reduzem ou substituem escopo contratual — divergência vira conflito
 * para revisão humana. O motor não infere nada ausente da proposta.
 */

export const PAGINAS_PROPOSTA = [1, 2, 3, 4, 5, 6, 7] as const;
export type PaginaProposta = (typeof PAGINAS_PROPOSTA)[number];

export type CampoEscopo = {
  campo: string;
  label: string;
  paginas: PaginaProposta[];
  obrigatorio: boolean;
  /** Campo só é exigido quando explicitamente declarado na proposta. */
  somenteSeDeclarado?: boolean;
};

/** Lista fechada dos campos que a proposta Canva alimenta. */
export const CAMPOS_ESCOPO_PROPOSTA: CampoEscopo[] = [
  { campo: "proposta_referencia", label: "Proposta, versão e referência", paginas: [1], obrigatorio: true },
  { campo: "caso_contexto", label: "Caso/núcleo e país/contexto", paginas: [1], obrigatorio: true },
  { campo: "processos_participantes", label: "Processos e participantes incluídos", paginas: [2], obrigatorio: true },
  { campo: "escopo_macro", label: "Escopo macro", paginas: [2, 3], obrigatorio: true },
  { campo: "escopos_individuais", label: "Escopos individuais", paginas: [4], obrigatorio: true },
  { campo: "servicos_incluidos", label: "Serviços incluídos", paginas: [3], obrigatorio: true },
  { campo: "servicos_excluidos", label: "Serviços excluídos", paginas: [3], obrigatorio: true },
  { campo: "entregas_jornada", label: "Entregas e etapas da jornada", paginas: [5], obrigatorio: true },
  { campo: "composicao_familiar", label: "Composição familiar e compartilhamento de dossiê", paginas: [4], obrigatorio: true },
  { campo: "responsabilidades", label: "Responsabilidades por processo", paginas: [4, 5], obrigatorio: true },
  { campo: "valor_total", label: "Valor", paginas: [6], obrigatorio: true },
  { campo: "forma_pagamento", label: "Forma de pagamento", paginas: [6], obrigatorio: true },
  { campo: "parcelas", label: "Parcelas", paginas: [6], obrigatorio: true },
  { campo: "responsaveis_financeiros", label: "Responsáveis financeiros", paginas: [6], obrigatorio: true },
  { campo: "despesas_externas", label: "Regra de despesas de terceiros", paginas: [7], obrigatorio: true },
  {
    campo: "prazo_validade",
    label: "Prazo/validade comercial",
    paginas: [7],
    obrigatorio: false,
    somenteSeDeclarado: true,
  },
  {
    campo: "proximos_passos",
    label: "Próximos passos",
    paginas: [7],
    obrigatorio: false,
    somenteSeDeclarado: true,
  },
];

/** Mapeamento normativo de páginas da proposta para anexos contratuais. */
export const MAPEAMENTO_ANEXOS_PAGINAS: {
  anexo: string;
  paginas: PaginaProposta[] | null;
  regra: string;
}[] = [
  { anexo: "ANX-ESCOPO", paginas: [2, 3, 4, 5], regra: "Recebe as páginas 2–5 da proposta aprovada." },
  { anexo: "ANX-COMERCIAL", paginas: [6, 7], regra: "Recebe as páginas 6–7 da proposta aprovada." },
  {
    anexo: "ANX-INDIVIDUAL",
    paginas: [4],
    regra: "Recebe o recorte da página 4 e demais referências específicas de processo/participante.",
  },
  {
    anexo: "ANX-PRIVACIDADE",
    paginas: null,
    regra: "Usa cláusula-base e regras de dados aplicáveis; não inventa escopo de pesquisa.",
  },
  {
    anexo: "ANX-REPRESENTACAO",
    paginas: null,
    regra: "Só é gerado se a proposta e os dados do caso indicarem menor/incapaz com representação aplicável.",
  },
];

export const PROTECOES_ESCOPO = [
  "CRM, Planejador, WhatsApp, transcrição e preenchimento livre não criam, ampliam, reduzem ou substituem escopo contratual.",
  "Divergência entre proposta e outros dados vira conflito para revisão humana.",
  "O motor não infere processos, serviços, parcelas, responsabilidades, despesas, prazos ou entregas ausentes da proposta.",
  "Dados comerciais podem ser importados como “importado — a confirmar”; a revisão humana é obrigatória antes da versão final.",
];

/**
 * Funde `proposal_canva_pages` (a extração real, feita em "Preparar contrato" /
 * CompletudeCanva) no formato que validarPropostaCanva/extrairEscopoDaProposta
 * esperam. `proposals.escopo_paginas`/`paginas_registradas` são colunas
 * legadas que nenhuma tela grava mais — usar o valor bruto delas (em vez desta
 * fusão) torna invisível o que já foi extraído de verdade, ou pior, mantém
 * visível um "registrado" antigo que não reflete o estado real da extração.
 * Achado real (06/09/2026): `cadeia-formalizacao.server.ts` já fazia esta
 * fusão; `contrato-preparar.functions.ts` (a tela que a proprietária de fato
 * usa) não fazia — a mesma proposta aparecia com escopo diferente em cada
 * tela. Centralizado aqui para as duas telas usarem a mesma fonte.
 */
export function propostaComPaginasCanva(
  proposta: PropostaCanva | null | undefined,
  paginasCanva: { page_number: number; extracao_status: string; page_content_structured: unknown }[],
): PropostaCanva | null | undefined {
  if (!proposta) return proposta;
  const escopo_paginas: Record<string, unknown> = {};
  for (const p of paginasCanva) {
    if (p?.page_content_structured && typeof p.page_content_structured === "object") {
      Object.assign(escopo_paginas, p.page_content_structured);
    }
  }
  const paginas_registradas = paginasCanva.filter((p) => p?.extracao_status === "extraida").map((p) => p.page_number);
  return { ...proposta, escopo_paginas, paginas_registradas };
}

export type PropostaCanva = {
  id: string;
  case_id: string | null;
  versao: number | null;
  status: string | null;
  archived_at: string | null;
  substituida_em?: string | null;
  substituida_por_id?: string | null;
  recusada_em?: string | null;
  validade?: string | null;
  origem?: string | null;
  origem_referencia?: string | null;
  paginas_registradas?: number[] | null;
  escopo_paginas?: Record<string, unknown> | null;
};

export type Validade = { valida: boolean; motivos: string[] };

/** Regras de validade da proposta como fonte de escopo. */
export function validarPropostaCanva(p: PropostaCanva | null | undefined, caseId: string, hoje = new Date()): Validade {
  const motivos: string[] = [];
  if (!p) return { valida: false, motivos: ["Nenhuma proposta vinculada ao caso."] };

  if (!p.case_id || p.case_id !== caseId) motivos.push("A proposta não está vinculada a este case_id.");
  if (!["aprovada", "aceita"].includes(String(p.status))) motivos.push(`Proposta com status “${p.status ?? "—"}”: exige aprovada ou aceita.`);
  if (p.archived_at) motivos.push("Proposta arquivada.");
  if (p.substituida_em || p.substituida_por_id) motivos.push("Proposta substituída por versão posterior.");
  if (p.recusada_em) motivos.push("Proposta recusada.");
  if (p.validade && new Date(p.validade) < hoje) motivos.push("Proposta expirada (validade comercial vencida).");
  if (!p.versao) motivos.push("Proposta sem número de versão.");
  if (p.origem !== "canva") motivos.push("Origem da proposta não registrada como Canva.");
  if (!p.origem_referencia) motivos.push("Referência do deck Canva não registrada.");

  const paginas = new Set((p.paginas_registradas ?? []).map(Number));
  const faltando = PAGINAS_PROPOSTA.filter((n) => !paginas.has(n));
  if (faltando.length) motivos.push(`Páginas 1–7 incompletas: faltam ${faltando.join(", ")}.`);

  return { valida: motivos.length === 0, motivos };
}

export type CampoExtraido = {
  campo: string;
  label: string;
  paginas: number[];
  valor: string | null;
  localizado: boolean;
  obrigatorio: boolean;
};

function textoDe(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) {
    const t = v.map((x) => textoDe(x)).filter(Boolean).join("; ");
    return t || null;
  }
  if (typeof v === "object") {
    const t = Object.values(v as Record<string, unknown>).map((x) => textoDe(x)).filter(Boolean).join("; ");
    return t || null;
  }
  const t = String(v).trim();
  return t.length ? t : null;
}

/**
 * Extrai apenas o que está declarado no conteúdo estruturado por página.
 * Formato aceito: { "2": { "escopo_macro": "..." }, ... } ou { "escopo_macro": "..." }.
 */
export function extrairEscopoDaProposta(p: PropostaCanva | null | undefined): CampoExtraido[] {
  const bruto = (p?.escopo_paginas ?? {}) as Record<string, unknown>;
  const plano: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(bruto)) {
    if (valor && typeof valor === "object" && !Array.isArray(valor) && /^\d+$/.test(chave)) {
      for (const [c, v] of Object.entries(valor as Record<string, unknown>)) plano[c] = v;
    } else {
      plano[chave] = valor;
    }
  }

  return CAMPOS_ESCOPO_PROPOSTA.map((c) => {
    const valor = textoDe(plano[c.campo]);
    return {
      campo: c.campo,
      label: c.label,
      paginas: [...c.paginas],
      valor,
      localizado: valor !== null,
      obrigatorio: c.obrigatorio && !c.somenteSeDeclarado,
    };
  });
}

export type ConflitoEscopo = { campo: string; label: string; proposta: string | null; outraFonte: string; valor: string };

/** Divergência entre a proposta e outra fonte é conflito para revisão humana. */
export function conflitosDeEscopo(
  extraidos: CampoExtraido[],
  outras: { campo: string; fonte: string; valor: string | null }[],
): ConflitoEscopo[] {
  const norm = (s: string | null) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const out: ConflitoEscopo[] = [];
  for (const o of outras) {
    if (!o.valor) continue;
    const alvo = extraidos.find((e) => e.campo === o.campo);
    if (!alvo) continue;
    if (!alvo.localizado) {
      out.push({ campo: o.campo, label: alvo.label, proposta: null, outraFonte: o.fonte, valor: o.valor });
      continue;
    }
    if (norm(alvo.valor) !== norm(o.valor)) {
      out.push({ campo: o.campo, label: alvo.label, proposta: alvo.valor, outraFonte: o.fonte, valor: o.valor });
    }
  }
  return out;
}

/** Gate: sem proposta Canva válida e aprovada, não há versão final, assinatura ou financeiro. */
export function bloqueiosDeEscopo(input: {
  validade: Validade;
  extraidos: CampoExtraido[];
  conflitos: ConflitoEscopo[];
}): { chave: string; motivo: string }[] {
  const bloqueios: { chave: string; motivo: string }[] = [];
  for (const m of input.validade.motivos) bloqueios.push({ chave: "escopo_proposta", motivo: `Proposta Canva: ${m}` });

  const faltantes = input.extraidos.filter((e) => e.obrigatorio && !e.localizado);
  if (faltantes.length) {
    bloqueios.push({
      chave: "escopo_proposta",
      motivo: `${faltantes.length} campo(s) de escopo não localizados na proposta: ${faltantes
        .map((f) => f.label)
        .join(", ")}.`,
    });
  }

  if (input.conflitos.length) {
    bloqueios.push({
      chave: "escopo_proposta",
      motivo: `${input.conflitos.length} divergência(s) entre a proposta e outras fontes aguardam revisão humana.`,
    });
  }

  return bloqueios;
}

/* ------------------------------------------------------------------ *
 * Mapa normativo: campo de escopo da proposta → parâmetro de destino
 * na ficha contratual → anexo que recebe o conteúdo.
 * Serve para verificação de cobertura, nunca para inferir conteúdo.
 * ------------------------------------------------------------------ */

export type DestinoEscopo = {
  campo: string;
  parametros: string[];
  anexos: string[];
};

export const MAPA_ESCOPO_DESTINO: DestinoEscopo[] = [
  { campo: "proposta_referencia", parametros: ["objeto_contrato"], anexos: ["ANX-ESCOPO"] },
  { campo: "caso_contexto", parametros: ["pais_rota", "objeto_contrato"], anexos: ["ANX-ESCOPO"] },
  { campo: "processos_participantes", parametros: ["beneficiarios", "partes_signatarias"], anexos: ["ANX-INDIVIDUAL"] },
  { campo: "escopo_macro", parametros: ["escopo_resumo", "produto_sku"], anexos: ["ANX-ESCOPO"] },
  { campo: "escopos_individuais", parametros: ["escopo_resumo"], anexos: ["ANX-INDIVIDUAL"] },
  { campo: "servicos_incluidos", parametros: ["servicos_incluidos"], anexos: ["ANX-ESCOPO"] },
  { campo: "servicos_excluidos", parametros: ["servicos_excluidos"], anexos: ["ANX-ESCOPO"] },
  { campo: "entregas_jornada", parametros: ["fases_entregas", "prazos_referencia"], anexos: ["ANX-ESCOPO"] },
  { campo: "composicao_familiar", parametros: ["vinculo_familiar", "beneficiarios"], anexos: ["ANX-INDIVIDUAL", "ANX-PRIVACIDADE"] },
  { campo: "responsabilidades", parametros: ["representacao_legal", "partes_signatarias"], anexos: ["ANX-INDIVIDUAL", "ANX-REPRESENTACAO"] },
  { campo: "valor_total", parametros: ["valor_total"], anexos: ["ANX-COMERCIAL"] },
  { campo: "forma_pagamento", parametros: ["forma_pagamento"], anexos: ["ANX-COMERCIAL"] },
  { campo: "parcelas", parametros: ["parcelas", "vencimentos"], anexos: ["ANX-COMERCIAL"] },
  { campo: "responsaveis_financeiros", parametros: ["contratante_nome", "partes_signatarias"], anexos: ["ANX-COMERCIAL"] },
  { campo: "despesas_externas", parametros: ["despesas_externas"], anexos: ["ANX-COMERCIAL"] },
  { campo: "prazo_validade", parametros: ["prazos_referencia"], anexos: ["ANX-COMERCIAL"] },
  { campo: "proximos_passos", parametros: ["fases_entregas"], anexos: ["ANX-ESCOPO"] },
];

export const ESTADOS_COBERTURA = [
  "coberto",
  "importado_a_confirmar",
  "parametro_vazio",
  "nao_localizado_na_proposta",
  "divergente",
  "opcional_nao_declarado",
] as const;
export type EstadoCobertura = (typeof ESTADOS_COBERTURA)[number];

export const ROTULO_COBERTURA: Record<EstadoCobertura, string> = {
  coberto: "Coberto e validado",
  importado_a_confirmar: "Importado — a confirmar",
  parametro_vazio: "Parâmetro de destino vazio",
  nao_localizado_na_proposta: "Não localizado na proposta",
  divergente: "Divergente da proposta",
  opcional_nao_declarado: "Opcional — não declarado",
};

export type ValorFicha = {
  campo: string;
  label?: string | null;
  valor: string | null;
  origem: string | null;
  status: string | null;
};

export type LinhaCobertura = {
  campo: string;
  label: string;
  paginas: number[];
  origem: string;
  obrigatorio: boolean;
  valorProposta: string | null;
  parametros: { campo: string; valor: string | null; origem: string | null; status: string | null }[];
  anexos: string[];
  estado: EstadoCobertura;
  divergencia: string | null;
};

/**
 * Cruza o que a proposta declara (por página) com os parâmetros da ficha,
 * apontando cobertura e divergência campo a campo. Não preenche nada.
 */
export function mapaCoberturaEscopo(input: {
  proposta: PropostaCanva | null | undefined;
  extraidos: CampoExtraido[];
  valores: ValorFicha[];
}): LinhaCobertura[] {
  const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const porCampo = new Map(input.valores.map((v) => [v.campo, v]));
  const versao = input.proposta?.versao ? `v${input.proposta.versao}` : "sem versão";
  const ref = input.proposta?.origem_referencia ? " · referência registrada" : " · referência ausente";

  return input.extraidos.map((e) => {
    const destino = MAPA_ESCOPO_DESTINO.find((d) => d.campo === e.campo);
    const parametros = (destino?.parametros ?? []).map((c) => {
      const v = porCampo.get(c);
      return { campo: c, valor: v?.valor ?? null, origem: v?.origem ?? null, status: v?.status ?? null };
    });

    const preenchidos = parametros.filter((p) => p.valor);
    let estado: EstadoCobertura;
    let divergencia: string | null = null;

    if (!e.localizado) {
      estado = e.obrigatorio ? "nao_localizado_na_proposta" : "opcional_nao_declarado";
      const conflitante = preenchidos[0];
      if (conflitante) {
        estado = "divergente";
        divergencia = `Parâmetro “${conflitante.campo}” preenchido por origem “${
          conflitante.origem ?? "não declarada"
        }” sem respaldo na proposta.`;
      }
    } else if (!preenchidos.length) {
      estado = "parametro_vazio";
    } else {
      const contradiz = preenchidos.find(
        (p) => norm(p.valor) !== norm(e.valor) && !norm(e.valor).includes(norm(p.valor)) && !norm(p.valor).includes(norm(e.valor)),
      );
      if (contradiz) {
        estado = "divergente";
        divergencia = `Proposta declara “${e.valor}”, mas o parâmetro “${contradiz.campo}” registra “${contradiz.valor}” (origem ${
          contradiz.origem ?? "não declarada"
        }).`;
      } else if (preenchidos.some((p) => p.status !== "validado")) {
        estado = "importado_a_confirmar";
      } else {
        estado = "coberto";
      }
    }

    return {
      campo: e.campo,
      label: e.label,
      paginas: e.paginas,
      origem: `Proposta Canva ${versao} · página(s) ${e.paginas.join(", ")}${ref}`,
      obrigatorio: e.obrigatorio,
      valorProposta: e.valor,
      parametros,
      anexos: destino?.anexos ?? [],
      estado,
      divergencia,
    };
  });
}
