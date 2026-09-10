/**
 * Tradução dos gates técnicos em bloqueios acionáveis: o que está bloqueado,
 * por quê, o que fazer e onde resolver.
 */

export type RegraBloqueio = {
  titulo: string;
  oQueBloqueia: string;
  comoResolver: string;
  impeditivo: boolean;
  /** Campos da ficha diretamente ligados ao bloqueio. */
  campos?: string[];
  /** Âncora alternativa na página. */
  ancora?: string;
};

export const REGRAS_BLOQUEIO: Record<string, RegraBloqueio> = {
  proposta: {
    titulo: "Proposta válida ausente",
    oQueBloqueia: "Versão final, revisão humana e assinatura.",
    comoResolver: "Vincule uma proposta ativa e aceita ao caso (proposta arquivada ou substituída não vale).",
    impeditivo: true,
    ancora: "entidades",
  },
  condicao_comercial: {
    titulo: "Condição comercial não aprovada",
    oQueBloqueia: "Versão final e anexo comercial.",
    comoResolver: "Aprove a proposta vigente ou crie uma versão para ajuste e conclua a negociação.",
    impeditivo: true,
    campos: ["valor_total", "forma_pagamento", "parcelas", "vencimentos"],
  },
  template: {
    titulo: "Modelo contratual indisponível",
    oQueBloqueia: "Qualquer geração de prévia final.",
    comoResolver: "Ative o MODELO-ESTUDO na biblioteca de modelos.",
    impeditivo: true,
  },
  anexo: {
    titulo: "Anexo obrigatório ausente",
    oQueBloqueia: "Versão final e assinatura.",
    comoResolver: "Preencha os campos que acionam o anexo na seção “Anexos aplicáveis e por quê”.",
    impeditivo: true,
    ancora: "anexos",
  },
  campo_obrigatorio: {
    titulo: "Campos obrigatórios vazios",
    oQueBloqueia: "Versão final, revisão humana e assinatura.",
    comoResolver: "Preencha cada campo obrigatório com dado real e origem declarada.",
    impeditivo: true,
  },
  revisao_campo: {
    titulo: "Campos obrigatórios a confirmar",
    oQueBloqueia: "Versão final e revisão humana.",
    comoResolver: "Confirme cada campo importado após conferir a fonte.",
    impeditivo: true,
  },
  placeholder: {
    titulo: "Placeholder remanescente",
    oQueBloqueia: "Versão final.",
    comoResolver: "Substitua o texto provisório por dado real ou deixe o campo vazio.",
    impeditivo: true,
  },
  conflito: {
    titulo: "Conflito entre origens",
    oQueBloqueia: "Versão final, revisão humana, assinatura e ativação.",
    comoResolver: "Escolha a origem prevalente e registre a justificativa da decisão.",
    impeditivo: true,
  },
  signatario: {
    titulo: "Qualificação de signatário incompleta",
    oQueBloqueia: "Assinatura.",
    comoResolver: "Complete e confirme os campos de partes e signatários.",
    impeditivo: true,
    campos: ["contratante_nome", "contratante_documento", "partes_signatarias"],
  },
  case_country_route_conflict: {
    titulo: "Conflito crítico entre código do caso e país/rota",
    oQueBloqueia: "Versão final, revisão humana, assinatura e ativação do caso.",
    comoResolver: "Corrija o país/rota com justificativa rastreável ou ajuste o código canônico do caso.",
    impeditivo: true,
    campos: ["pais_rota"],
    ancora: "coerencia",
  },
  revisao_humana: {
    titulo: "Revisão humana da versão final pendente",
    oQueBloqueia: "Somente o envio para assinatura.",
    comoResolver: "Gere a versão final e aprove a revisão humana.",
    impeditivo: false,
    ancora: "previas",
  },
  escopo_proposta: {
    titulo: "Escopo da proposta Canva incompleto",
    oQueBloqueia: "Versão final, revisão humana e assinatura.",
    comoResolver:
      "Na seção “Completude da proposta (Canva)”, confirme origem Canva, referência do deck e a extração das páginas 1–7. O motivo abaixo indica exatamente o que falta.",
    impeditivo: true,
    ancora: "canva",
  },
};

export type BloqueioResolutivo = {
  chave: string;
  motivo: string;
  titulo: string;
  oQueBloqueia: string;
  comoResolver: string;
  impeditivo: boolean;
  ancora: string;
  camposAfetados: { id: string; label: string }[];
};

/** Consolida os gates com os campos concretos que os originam. */
export function bloqueiosResolutivos(
  bloqueios: { chave: string; motivo: string }[],
  valores: { id: string; campo: string; label: string; obrigatorio: boolean; valor: string | null; status: string; conflito?: unknown[] }[],
): BloqueioResolutivo[] {
  // Deduplicação no mesmo evento: mesma chave + mesmo motivo aparece uma vez só.
  const unicos = [...new Map(bloqueios.map((b) => [`${b.chave}::${b.motivo}`, b])).values()];
  return unicos.map((b) => {

    const regra = REGRAS_BLOQUEIO[b.chave] ?? {
      titulo: b.chave,
      oQueBloqueia: "Geração final do instrumento.",
      comoResolver: "Resolva a pendência indicada.",
      impeditivo: true,
    };

    let alvos = valores.filter((v) => (regra.campos ?? []).includes(v.campo));
    if (b.chave === "campo_obrigatorio") alvos = valores.filter((v) => v.obrigatorio && !v.valor);
    if (b.chave === "revisao_campo") alvos = valores.filter((v) => v.obrigatorio && v.valor && v.status !== "validado");
    if (b.chave === "conflito") alvos = valores.filter((v) => (v.conflito ?? []).length > 0);
    if (b.chave === "signatario") {
      alvos = valores.filter((v) => (regra.campos ?? []).includes(v.campo) || (v.obrigatorio && v.campo.startsWith("contratante")));
    }

    return {
      chave: b.chave,
      motivo: b.motivo,
      titulo: regra.titulo,
      oQueBloqueia: regra.oQueBloqueia,
      comoResolver: regra.comoResolver,
      impeditivo: regra.impeditivo,
      ancora: regra.ancora ?? "ficha",
      camposAfetados: alvos.map((v) => ({ id: v.id, label: v.label })),
    };
  });
}

export function temBloqueioImpeditivo(lista: BloqueioResolutivo[]) {
  return lista.some((b) => b.impeditivo);
}

/** Agrupa eventos repetidos de auditoria em janelas de 30 minutos. */
export function agruparAuditoria<T extends { id: string; acao: string; created_at: string; metadados?: any }>(
  eventos: T[],
  janelaMinutos = 30,
): { id: string; acao: string; created_at: string; ultimo_em: string; ocorrencias: number; metadados?: any }[] {
  const janela = janelaMinutos * 60_000;
  const saida: { id: string; acao: string; created_at: string; ultimo_em: string; ocorrencias: number; metadados?: any }[] = [];
  for (const e of eventos) {
    const t = new Date(e.created_at).getTime();
    const grupo = saida.find((g) => g.acao === e.acao && Math.abs(new Date(g.created_at).getTime() - t) <= janela);
    if (grupo) {
      grupo.ocorrencias += 1;
      if (t < new Date(grupo.created_at).getTime()) grupo.created_at = e.created_at;
      if (t > new Date(grupo.ultimo_em).getTime()) grupo.ultimo_em = e.created_at;
      continue;
    }
    saida.push({ id: e.id, acao: e.acao, created_at: e.created_at, ultimo_em: e.created_at, ocorrencias: 1, metadados: e.metadados });
  }
  return saida;
}
