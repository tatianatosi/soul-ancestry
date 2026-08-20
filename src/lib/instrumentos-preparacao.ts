/**
 * ANA-D-01 — Preparação interna de instrumentos.
 *
 * Regra pura que consolida os gates A–E. Não redige cláusula, não cria
 * contrato, OS, anexo, assinatura, cobrança, link, pasta ou comunicação.
 * Só diagnostica estado e indica a próxima ação humana recomendada.
 */

export type StatusPreparacao = "pronto_para_previa_interna" | "requer_revisao" | "bloqueado";

export const REQUISITOS = [
  { codigo: "A_proposta", rotulo: "A. Proposta Canva completa e válida" },
  { codigo: "B_cadastro", rotulo: "B. Cadastro por pessoa e núcleo familiar" },
  { codigo: "B_dependentes", rotulo: "B. Dependentes e representação" },
  { codigo: "C_case_service", rotulo: "C. Case service consolidado" },
  { codigo: "C_condicao", rotulo: "C. Condição comercial homologada" },
  { codigo: "C_criterios", rotulo: "C. Critérios de aceite decididos" },
  { codigo: "E_matriz", rotulo: "E. Matriz jurídica e temas bloqueantes" },
  { codigo: "D_despesas", rotulo: "D. Despesas de terceiros aplicáveis" },
] as const;

export type RequisitoCodigo = (typeof REQUISITOS)[number]["codigo"];

export type EstadoRequisito = "atendido" | "pendente" | "nao_aplicavel";

export type LinhaRequisito = {
  codigo: RequisitoCodigo;
  rotulo: string;
  estado: EstadoRequisito;
  bloqueante: boolean;
  detalhes: string[];
  campos_faltantes: string[];
};

export type EntradaPreparacao = {
  proposta: {
    existe: boolean;
    validade_estado: "vigente" | "vencida" | "substituida" | "sem_validade_registrada" | "sem_proposta";
    paginas_extraidas: number;
    campos_nao_localizados: string[];
  };
  cadastro: {
    itens_obrigatorios: number;
    itens_completos: number;
    pessoas_sem_referencia: string[];
    nucleo_criterios_pendentes: string[];
  };
  dependentes: {
    nome: string;
    participa_do_contrato: boolean;
    status_representacao: string | null;
    anexo_individual_aplicavel: boolean;
  }[];
  caseService: {
    existe: boolean;
    status: string | null;
    escopo_aprovado: boolean;
    preco_fonte_homologada: boolean;
  };
  condicao: {
    existe: boolean;
    status: string | null;
    homologado_por: string | null;
    homologado_em: string | null;
    campos_faltantes: string[];
  };
  criterios: { criterio_codigo: string; status: string | null; obrigatorio: boolean }[];
  matriz: { tema_codigo: string; tema: string; status: string; bloqueia_assinatura: boolean; versao_juridica_aplicavel: string | null }[];
  despesas: { descricao: string; estado: string | null; aplicavel: boolean }[];
  conflitos: { origem: string; detalhe: string }[];
};

export type ResultadoPreparacao = {
  status: StatusPreparacao;
  requisitos: LinhaRequisito[];
  codigos_bloqueio: string[];
  campos_faltantes: string[];
  conflitos: { origem: string; detalhe: string }[];
  anexos_condicionais: { codigo: string; motivo: string }[];
  versoes_juridicas_aplicaveis: { tema: string; versao: string }[];
  proxima_acao: string;
  nenhuma_acao_externa: true;
};

const linha = (
  codigo: RequisitoCodigo,
  estado: EstadoRequisito,
  detalhes: string[] = [],
  campos_faltantes: string[] = [],
  bloqueante = true,
): LinhaRequisito => ({
  codigo,
  rotulo: REQUISITOS.find((r) => r.codigo === codigo)!.rotulo,
  estado,
  bloqueante,
  detalhes,
  campos_faltantes,
});

/** Consolida os gates A–E e devolve diagnóstico sem produzir instrumento. */
export function avaliarPreparacaoInstrumentos(e: EntradaPreparacao): ResultadoPreparacao {
  const requisitos: LinhaRequisito[] = [];
  const codigos: string[] = [];
  const anexos: { codigo: string; motivo: string }[] = [];

  // A — proposta Canva
  if (!e.proposta.existe || e.proposta.validade_estado === "sem_proposta") {
    requisitos.push(linha("A_proposta", "pendente", ["Proposta Canva não registrada."]));
    codigos.push("PROPOSTA_AUSENTE");
  } else if (e.proposta.validade_estado !== "vigente") {
    requisitos.push(linha("A_proposta", "pendente", [`Validade da proposta: ${e.proposta.validade_estado}.`]));
    codigos.push("PROPOSTA_INVALIDA");
  } else if (e.proposta.paginas_extraidas < 7 || e.proposta.campos_nao_localizados.length) {
    requisitos.push(
      linha(
        "A_proposta",
        "pendente",
        [`${e.proposta.paginas_extraidas}/7 páginas extraídas.`],
        e.proposta.campos_nao_localizados,
      ),
    );
    codigos.push("PROPOSTA_INCOMPLETA");
  } else {
    requisitos.push(linha("A_proposta", "atendido", ["Proposta vigente com páginas 1–7 extraídas."]));
  }

  // B — cadastro por pessoa e núcleo
  {
    const faltam = Math.max(0, e.cadastro.itens_obrigatorios - e.cadastro.itens_completos);
    const detalhes: string[] = [];
    if (faltam) detalhes.push(`${faltam} item(ns) cadastrais obrigatórios pendentes.`);
    if (e.cadastro.pessoas_sem_referencia.length)
      detalhes.push(`Pessoas sem referência canônica: ${e.cadastro.pessoas_sem_referencia.join(", ")}.`);
    if (e.cadastro.nucleo_criterios_pendentes.length)
      detalhes.push(`Núcleo familiar pendente: ${e.cadastro.nucleo_criterios_pendentes.join(", ")}.`);
    if (detalhes.length) {
      requisitos.push(linha("B_cadastro", "pendente", detalhes, e.cadastro.nucleo_criterios_pendentes));
      codigos.push("CADASTRO_INCOMPLETO");
    } else {
      requisitos.push(linha("B_cadastro", "atendido", ["Cadastro por pessoa e núcleo completos."]));
    }
  }

  // B — dependentes e representação
  {
    const participantes = e.dependentes.filter((d) => d.participa_do_contrato);
    const semRepresentacao = participantes.filter((d) => d.status_representacao !== "documentada");
    for (const d of e.dependentes) {
      if (d.anexo_individual_aplicavel) anexos.push({ codigo: "ANX-INDIVIDUAL", motivo: `Dependente ${d.nome}.` });
      if (d.participa_do_contrato) anexos.push({ codigo: "ANX-REPRESENTACAO", motivo: `Representação de ${d.nome}.` });
    }
    if (!e.dependentes.length) {
      requisitos.push(linha("B_dependentes", "nao_aplicavel", ["Nenhum dependente registrado."], [], false));
    } else if (semRepresentacao.length) {
      requisitos.push(
        linha("B_dependentes", "pendente", semRepresentacao.map((d) => `Representação pendente: ${d.nome}.`)),
      );
      codigos.push("DEPENDENTE_SEM_REPRESENTACAO");
    } else {
      requisitos.push(linha("B_dependentes", "atendido", [`${participantes.length} dependente(s) com representação documentada.`]));
    }
  }

  // C — case service
  if (!e.caseService.existe) {
    requisitos.push(linha("C_case_service", "pendente", ["Case service não registrado."]));
    codigos.push("CASE_SERVICE_AUSENTE");
  } else if (!["approved", "contracted"].includes(String(e.caseService.status ?? ""))) {
    requisitos.push(linha("C_case_service", "pendente", [`Case service em “${e.caseService.status}”.`]));
    codigos.push("CASE_SERVICE_NAO_CONSOLIDADO");
  } else if (!e.caseService.escopo_aprovado || !e.caseService.preco_fonte_homologada) {
    requisitos.push(
      linha("C_case_service", "pendente", [
        !e.caseService.escopo_aprovado ? "Escopo do case service não aprovado." : "",
        !e.caseService.preco_fonte_homologada ? "Preço fora de catálogo homologado ou exceção aprovada." : "",
      ].filter(Boolean)),
    );
    codigos.push("PRECO_NAO_HOMOLOGADO");
  } else {
    requisitos.push(linha("C_case_service", "atendido", ["Case service consolidado com preço de fonte homologada."]));
  }

  // C — condição comercial
  if (!e.condicao.existe) {
    requisitos.push(linha("C_condicao", "pendente", ["Condição comercial não registrada."]));
    codigos.push("CONDICAO_AUSENTE");
  } else if (e.condicao.status !== "homologada" || !e.condicao.homologado_por || !e.condicao.homologado_em) {
    requisitos.push(linha("C_condicao", "pendente", ["Condição comercial sem homologação humana registrada."], e.condicao.campos_faltantes));
    codigos.push("CONDICAO_NAO_HOMOLOGADA");
  } else if (e.condicao.campos_faltantes.length) {
    requisitos.push(linha("C_condicao", "pendente", ["Condição homologada com campos estruturados faltantes."], e.condicao.campos_faltantes));
    codigos.push("CONDICAO_INCOMPLETA");
  } else {
    requisitos.push(linha("C_condicao", "atendido", ["Condição comercial homologada e estruturada."]));
  }

  // C — critérios de aceite
  {
    const pendentes = e.criterios.filter((c) => c.obrigatorio && String(c.status ?? "") !== "aceito");
    if (!e.criterios.length) {
      requisitos.push(linha("C_criterios", "pendente", ["Critérios de aceite não registrados."]));
      codigos.push("CRITERIOS_AUSENTES");
    } else if (pendentes.length) {
      requisitos.push(linha("C_criterios", "pendente", [`${pendentes.length} critério(s) obrigatórios sem decisão de aceite.`]));
      codigos.push("CRITERIO_PENDENTE");
    } else {
      requisitos.push(linha("C_criterios", "atendido", [`${e.criterios.length} critério(s) decididos.`]));
    }
  }

  // E — matriz jurídica
  const versoes: { tema: string; versao: string }[] = [];
  {
    const bloqueantes = e.matriz.filter((m) => m.bloqueia_assinatura);
    const pendentes = bloqueantes.filter(
      (m) => !["aprovado", "nao_aplicavel"].includes(m.status) || (m.status === "aprovado" && !m.versao_juridica_aplicavel),
    );
    for (const m of e.matriz) if (m.status === "aprovado" && m.versao_juridica_aplicavel) versoes.push({ tema: m.tema, versao: m.versao_juridica_aplicavel });
    if (!e.matriz.length) {
      requisitos.push(linha("E_matriz", "pendente", ["Matriz jurídica não carregada."]));
      codigos.push("MATRIZ_AUSENTE");
    } else if (pendentes.length) {
      requisitos.push(linha("E_matriz", "pendente", pendentes.map((m) => `${m.tema}: ${m.status}.`)));
      codigos.push("TEMA_JURIDICO_BLOQUEANTE_PENDENTE");
    } else {
      requisitos.push(linha("E_matriz", "atendido", [`${bloqueantes.length} tema(s) bloqueante(s) com decisão registrada.`]));
    }
  }

  // D — despesas de terceiros (não bloqueia assinatura; exige ciência registrada)
  {
    const aplicaveis = e.despesas.filter((d) => d.aplicavel);
    if (!aplicaveis.length) {
      requisitos.push(linha("D_despesas", "nao_aplicavel", ["Sem despesas de terceiros aplicáveis."], [], false));
    } else {
      const semEstado = aplicaveis.filter((d) => !d.estado || d.estado === "rascunho");
      if (semEstado.length) {
        requisitos.push(
          linha("D_despesas", "pendente", semEstado.map((d) => `Estimativa sem estado definido: ${d.descricao}.`), [], false),
        );
      } else {
        requisitos.push(linha("D_despesas", "atendido", [`${aplicaveis.length} estimativa(s) registradas como previsão interna.`], [], false));
      }
      anexos.push({ codigo: "ANX-DESPESAS-TERCEIROS", motivo: "Existem estimativas de despesas de terceiros aplicáveis." });
    }
  }

  const bloqueado = requisitos.some((r) => r.bloqueante && r.estado === "pendente");
  const requerRevisao = !bloqueado && (requisitos.some((r) => !r.bloqueante && r.estado === "pendente") || e.conflitos.length > 0);

  const status: StatusPreparacao = bloqueado ? "bloqueado" : requerRevisao ? "requer_revisao" : "pronto_para_previa_interna";

  const proxima_acao = bloqueado
    ? `Resolver bloqueio: ${requisitos.find((r) => r.bloqueante && r.estado === "pendente")!.rotulo}.`
    : requerRevisao
      ? "Revisar conflitos e itens não bloqueantes antes da prévia interna."
      : "Seguir para prévia interna do instrumento (nenhum artefato é gerado automaticamente).";

  return {
    status,
    requisitos,
    codigos_bloqueio: codigos,
    campos_faltantes: [...new Set(requisitos.flatMap((r) => r.campos_faltantes))],
    conflitos: e.conflitos,
    anexos_condicionais: anexos,
    versoes_juridicas_aplicaveis: versoes,
    proxima_acao,
    nenhuma_acao_externa: true,
  };
}
