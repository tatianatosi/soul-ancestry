/**
 * De-para de duplicidade dos anexos contratuais — o que o próprio contrato já
 * cobre, o que a proposta já traz, e quais anexos realmente permanecem.
 *
 * Decisão da Proprietária (04/10/2026, literal): "o correto é anexo de I até
 * V; revise que os demais são cópias dos mesmos — ANX escopo, comercial,
 * individual, privacidade e representação. Revise os conteúdos porque
 * acredito que haja duplicidade, e veja também destes anexos o que já está
 * sendo coberto dentro do próprio contrato e de todo o escopo vindo da
 * proposta, e quais anexos realmente devem permanecer."
 *
 * ## O que a medição mostrou (04/10, lendo os dois dicionários e as 16 cláusulas)
 *
 * Ela está certa: existiam **duas famílias de anexos** no mesmo caso, e a
 * segunda repete conteúdo que já está na cláusula do contrato-base, no Anexo
 * I (Ordem de Serviço) ou no Anexo II (despesas).
 *
 * Também corrige um erro meu da rodada anterior: eu havia criado Anexos A–D
 * por parte contratante. Era duplicata de terceiro nível — `ANX-INDIVIDUAL`
 * **já gerava uma instância por titular** (`ANX-INDIVIDUAL::<pessoa>`, com o
 * dependente menor dentro da instância do seu titular). Não faltava anexo:
 * faltava a instância aparecer. Os A–D foram retirados.
 *
 * ## Conclusão
 *
 * Permanecem **Anexo I a Anexo V**, e só eles. A cobertura por requerente é
 * **instância do Anexo I** (a Ordem de Serviço é exatamente escopo,
 * entregáveis e condição por contratação), não um anexo novo — o escopo
 * individual de cada pessoa já vem da proposta aprovada.
 */

export type VeredictoAnexo = "PERMANECE" | "DUPLICATA_DE_CLAUSULA" | "DUPLICATA_DE_ANEXO" | "VIRA_INSTANCIA";

export type LinhaDeParaAnexo = {
  codigo: string;
  titulo: string;
  /** O que aquele anexo se propunha a cobrir. */
  conteudo: string;
  veredicto: VeredictoAnexo;
  /** Cláusulas do contrato-base v2 que já cobrem o conteúdo. */
  clausulasQueCobrem: { numero: number; titulo: string }[];
  /** Anexos da família I–V que já cobrem o conteúdo. */
  anexosQueCobrem: string[];
  /** Campo da proposta aprovada que alimenta o conteúdo. */
  fonteNaProposta: string | null;
  decisao: string;
};

/** A família canônica. Decisão da Proprietária: é esta, e só esta. */
export const ANEXOS_CANONICOS = [
  { codigo: "ANEXO_I_ORDEM_SERVICO", titulo: "Ordem de Serviço do caso", obrigatorio: true },
  { codigo: "ANEXO_II_DESPESAS_EXTERNAS", titulo: "Controle de despesas externas", obrigatorio: true },
  { codigo: "ANEXO_III_AUTORIZACAO_PESQUISA", titulo: "Autorização específica de pesquisa", obrigatorio: false },
  { codigo: "ANEXO_IV_PROCURACAO", titulo: "Procuração específica", obrigatorio: false },
  { codigo: "ANEXO_V_ALTERACAO_ESCOPO", titulo: "Termo de alteração de escopo", obrigatorio: false },
] as const;

export const DE_PARA_ANEXOS_DUPLICADOS: LinhaDeParaAnexo[] = [
  {
    codigo: "ANX-ESCOPO",
    titulo: "Escopo e entregas",
    conteudo: "escopo_resumo, servicos_incluidos, servicos_excluidos, fases_entregas, prazos_referencia",
    veredicto: "DUPLICATA_DE_CLAUSULA",
    clausulasQueCobrem: [
      { numero: 3, titulo: "Escopo, entregas e exclusões" },
      { numero: 10, titulo: "Prazo, dependências e ajustes" },
    ],
    anexosQueCobrem: ["ANEXO_I_ORDEM_SERVICO"],
    fonteNaProposta: "páginas 3 e 5 — serviços incluídos/excluídos e jornada em 5 etapas",
    decisao:
      "Retirado. O escopo é cláusula 3 do contrato e, no detalhe operacional, os campos 1, 1.1, 2 e 3 do Anexo I. " +
      "Três documentos para a mesma delimitação é como se cria divergência.",
  },
  {
    codigo: "ANX-COMERCIAL",
    titulo: "Condições comerciais",
    conteudo: "valor_total, forma_pagamento, parcelas, vencimentos, despesas_externas, excecoes_comerciais",
    veredicto: "DUPLICATA_DE_CLAUSULA",
    clausulasQueCobrem: [
      { numero: 8, titulo: "Valores, pagamento e início dos serviços" },
      { numero: 9, titulo: "Despesas de terceiros" },
    ],
    anexosQueCobrem: ["ANEXO_I_ORDEM_SERVICO", "ANEXO_II_DESPESAS_EXTERNAS"],
    fonteNaProposta: "página 6 — valor total, forma de pagamento, parcelas e responsáveis financeiros",
    decisao:
      "Retirado. Valor, forma, parcelas e vencimentos são os campos 4.1 a 4.5 do Anexo I; despesas de terceiros são a " +
      "cláusula 9 e o Anexo II. A condição versionada do caso é a fonte, e ela já alimenta os dois.",
  },
  {
    codigo: "ANX-INDIVIDUAL",
    titulo: "Processo individual por requerente",
    conteudo: "beneficiarios, dependentes, vinculo_familiar, ancestral_referencia, membros_excluidos",
    veredicto: "VIRA_INSTANCIA",
    clausulasQueCobrem: [{ numero: 1, titulo: "Partes, documentos e estrutura do instrumento" }],
    anexosQueCobrem: ["ANEXO_I_ORDEM_SERVICO"],
    fonteNaProposta: "página 4 — escopos individuais por pessoa (Ana R$ 4.800, pai R$ 2.400, irmã R$ 2.400)",
    decisao:
      "Retirado como código próprio e preservado como MECANISMO: a cobertura por requerente é instância do Anexo I " +
      "(uma Ordem de Serviço por titular, com o dependente menor dentro da instância do seu representante). O próprio " +
      "dicionário já gerava `ANX-INDIVIDUAL::<pessoa>` — não faltava anexo, faltava a instância aparecer.",
  },
  {
    codigo: "ANX-PRIVACIDADE",
    titulo: "Privacidade e tratamento de dados",
    conteudo: "base legal, finalidade, retenção e consentimento por titular",
    veredicto: "DUPLICATA_DE_CLAUSULA",
    clausulasQueCobrem: [{ numero: 7, titulo: "Documentos, privacidade, guarda e sigilo" }],
    anexosQueCobrem: [],
    fonteNaProposta: null,
    decisao:
      "Retirado como anexo. A regra é a cláusula 7 do contrato. O consentimento POR TITULAR não é texto de anexo e sim " +
      "dado do caso (`leads.consentimento_status` e o registro por pessoa) — continua pendência declarada, não some.",
  },
  {
    codigo: "ANX-REPRESENTACAO",
    titulo: "Representação legal",
    conteudo: "representação de menor e de terceiro no instrumento",
    veredicto: "DUPLICATA_DE_CLAUSULA",
    clausulasQueCobrem: [{ numero: 1, titulo: "Partes, documentos e estrutura do instrumento" }],
    anexosQueCobrem: ["ANEXO_IV_PROCURACAO"],
    fonteNaProposta: "página 2 — Felipe como dependente menor representado",
    decisao:
      "Retirado. A representação no instrumento é a cláusula 1 mais o dado do dependente " +
      "(`case_dependents.status_representacao` e `titular_responsavel_legal_nome`). Procuração para órgão é outra coisa, " +
      "e é o Anexo IV — não se confundem.",
  },
  {
    codigo: "ANEXO_A_ANA_LUIZA",
    titulo: "Anexo A — Ana Luiza (criado por mim em 04/10)",
    conteudo: "parte contratante, escopo e valor individuais",
    veredicto: "DUPLICATA_DE_ANEXO",
    clausulasQueCobrem: [{ numero: 1, titulo: "Partes, documentos e estrutura do instrumento" }],
    anexosQueCobrem: ["ANEXO_I_ORDEM_SERVICO"],
    fonteNaProposta: "página 4 — escopos individuais",
    decisao: "Retirado: era duplicata de terceiro nível. A cobertura por pessoa é instância do Anexo I.",
  },
  {
    codigo: "ANEXO_B_ADAIR",
    titulo: "Anexo B — Adair (criado por mim em 04/10)",
    conteudo: "parte contratante, escopo e valor individuais",
    veredicto: "DUPLICATA_DE_ANEXO",
    clausulasQueCobrem: [{ numero: 1, titulo: "Partes, documentos e estrutura do instrumento" }],
    anexosQueCobrem: ["ANEXO_I_ORDEM_SERVICO"],
    fonteNaProposta: "página 4 — escopos individuais",
    decisao: "Retirado: era duplicata de terceiro nível. A cobertura por pessoa é instância do Anexo I.",
  },
  {
    codigo: "ANEXO_C_ALICE",
    titulo: "Anexo C — Alice (criado por mim em 04/10)",
    conteudo: "parte contratante, escopo e valor individuais",
    veredicto: "DUPLICATA_DE_ANEXO",
    clausulasQueCobrem: [{ numero: 1, titulo: "Partes, documentos e estrutura do instrumento" }],
    anexosQueCobrem: ["ANEXO_I_ORDEM_SERVICO"],
    fonteNaProposta: "página 4 — escopos individuais",
    decisao: "Retirado: era duplicata de terceiro nível. A cobertura por pessoa é instância do Anexo I.",
  },
  {
    codigo: "ANEXO_D_FINANCEIRO",
    titulo: "Anexo D — Financeiro (criado por mim em 04/10)",
    conteudo: "total, parcelas, responsáveis e forma de pagamento",
    veredicto: "DUPLICATA_DE_ANEXO",
    clausulasQueCobrem: [
      { numero: 8, titulo: "Valores, pagamento e início dos serviços" },
      { numero: 9, titulo: "Despesas de terceiros" },
    ],
    anexosQueCobrem: ["ANEXO_I_ORDEM_SERVICO", "ANEXO_II_DESPESAS_EXTERNAS"],
    fonteNaProposta: "página 6 — forma de pagamento e responsáveis",
    decisao: "Retirado: mesma conta em dois lugares. Valor e parcelas são os campos 4.x do Anexo I.",
  },
];

/** Códigos que devem permanecer vivos no contrato. */
export function anexosQuePermanecem(): string[] {
  return ANEXOS_CANONICOS.map((a) => a.codigo);
}

/** Códigos a retirar, com o motivo pronto para o campo de arquivamento. */
export function anexosARetirar(): { codigo: string; motivo: string }[] {
  return DE_PARA_ANEXOS_DUPLICADOS.map((l) => ({
    codigo: l.codigo,
    motivo:
      `${l.veredicto} (04/10/2026): ${l.decisao} ` +
      (l.clausulasQueCobrem.length
        ? `Coberto pela(s) cláusula(s) ${l.clausulasQueCobrem.map((c) => `${c.numero} (${c.titulo})`).join(", ")}. `
        : "") +
      (l.anexosQueCobrem.length ? `Coberto pelo(s) anexo(s) ${l.anexosQueCobrem.join(", ")}. ` : "") +
      (l.fonteNaProposta ? `Conteúdo vem da proposta: ${l.fonteNaProposta}.` : ""),
  }));
}

/**
 * Onde a cobertura por requerente passa a viver. Não é anexo novo: é
 * instância do Anexo I, uma por titular, com o dependente dentro da instância
 * do seu representante.
 */
export function instanciasDoAnexoI(
  titulares: readonly string[],
  dependentes: readonly { nome: string; representadoPor: string | null }[],
): { chave: string; titulo: string; pessoa: string; dependentes: string[] }[] {
  return titulares.map((pessoa) => {
    const deps = dependentes.filter((d) => (d.representadoPor ?? "").trim() === pessoa).map((d) => d.nome);
    return {
      chave: `ANEXO_I_ORDEM_SERVICO::${pessoa}`,
      titulo: deps.length ? `${pessoa} + ${deps.join(", ")} (dependente representado)` : pessoa,
      pessoa,
      dependentes: deps,
    };
  });
}
