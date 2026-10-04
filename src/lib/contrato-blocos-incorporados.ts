/**
 * Blocos do caso incorporados ao corpo do contrato (04/10/2026).
 *
 * Proprietária: "contrato único da Ana, sem anexos iniciais redundantes...
 * incorporar ao corpo do contrato, preservando o texto institucional aprovado:
 * qualificação das partes, distinção contratante/signatário/beneficiário/
 * responsável financeiro, dependente e representação confirmada, escopo
 * individual por pessoa e familiar consolidado, serviços incluídos e excluídos,
 * entregas, fases e critérios de encerramento, valor total e distribuição,
 * forma de pagamento, parcelas e vencimentos, prazo e dependências, regra de
 * despesas de terceiros, referência e versão da proposta de origem".
 *
 * Por que isto precisava existir: medido em `contrato-corpo.server.ts`, o corpo
 * renderizado tinha cabeçalho, perfil institucional, preâmbulo, as 16 cláusulas
 * fixas, os anexos e a matriz de blocos — e **nenhum** dado do caso. Quem são as
 * partes, qual o escopo de cada pessoa, qual o valor e como se paga apareciam
 * **só dentro do Anexo I**. Daí a consequência que ela descreveu: sem Anexo I,
 * o motor concluía que não havia escopo contratado, quando o escopo está no
 * contrato.
 *
 * Regras desta camada:
 *  - nenhuma cláusula jurídica nova: cada bloco **se ancora** numa cláusula fixa
 *    já aprovada e traz o dado do caso que aquela cláusula pressupõe;
 *  - representação nunca é inferida: valor zero não comprova dependência, e
 *    posição na lista não cria vínculo. Vínculo ausente fica pendência nomeada;
 *  - campo sem fonte permanece pendente e diz o efeito — nunca "approved" nem
 *    "completed" para esconder ausência;
 *  - nada aqui envia, assina, cobra ou publica.
 */

import { formatarDinheiro } from "@/lib/orcamento-proposta";

/* ------------------------- papéis das pessoas ------------------------- */

export const PAPEIS_CONTRATUAIS = [
  "contratante",
  "signatario",
  "beneficiario",
  "responsavel_financeiro",
  "dependente_representado",
] as const;
export type PapelContratual = (typeof PAPEIS_CONTRATUAIS)[number];

export const ROTULO_PAPEL_CONTRATUAL: Record<PapelContratual, string> = {
  contratante: "Contratante",
  signatario: "Signatário",
  beneficiario: "Beneficiário do estudo",
  responsavel_financeiro: "Responsável financeiro",
  dependente_representado: "Dependente representado",
};

export type PessoaContratual = {
  nome: string;
  papeis: PapelContratual[];
  escopoIndividual: string | null;
  valorIndividual: number | null;
  /** Só quando há vínculo de representação **registrado**. Nunca inferido. */
  representadoPor: string | null;
  representacaoConfirmada: boolean;
  /** Pendências desta pessoa, nomeadas. */
  pendencias: string[];
};

export type EntradaPessoas = {
  /** Pessoas do caso, com o papel real já gravado (nunca derivado de ordem). */
  membros: { nome: string; papelNoCaso: string | null; dependente: boolean }[];
  /** Dependentes com o vínculo de representação como está registrado. */
  dependentes: { nome: string; representadoPor: string | null; statusRepresentacao: string | null }[];
  /** Itens da condição comercial aprovada: escopo e valor por pessoa. */
  itensCondicao: { parte: string; valor: number; escopo: string }[];
  /** Responsáveis financeiros declarados na condição. */
  responsaveisFinanceiros: string[];
};

function mesmoNome(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase("pt-BR") === b.trim().toLocaleLowerCase("pt-BR");
}

/**
 * Compõe as pessoas do contrato com papel, escopo e valor.
 *
 * Correção exigida em 04/10/2026: a versão anterior tratava item de valor zero
 * como dependente e, sem vínculo explícito, o atribuía ao primeiro titular.
 * Isso é proibido — "valor zero não comprova representação; vínculo ausente
 * deve permanecer como pendência identificada". Aqui, item sem valor que não
 * tem vínculo registrado entra como **beneficiário com pendência de vínculo**.
 */
export function montarPessoasContratuais(e: EntradaPessoas): PessoaContratual[] {
  const saida: PessoaContratual[] = [];

  const registrar = (nome: string): PessoaContratual => {
    const achada = saida.find((p) => mesmoNome(p.nome, nome));
    if (achada) return achada;
    const nova: PessoaContratual = {
      nome: nome.trim(),
      papeis: [],
      escopoIndividual: null,
      valorIndividual: null,
      representadoPor: null,
      representacaoConfirmada: false,
      pendencias: [],
    };
    saida.push(nova);
    return nova;
  };

  const addPapel = (p: PessoaContratual, papel: PapelContratual) => {
    if (!p.papeis.includes(papel)) p.papeis.push(papel);
  };

  for (const m of e.membros) {
    if (!m.nome?.trim()) continue;
    const p = registrar(m.nome);
    const papel = (m.papelNoCaso ?? "").trim();
    if (papel === "contratante") {
      addPapel(p, "contratante");
      addPapel(p, "signatario");
    } else if (papel === "titular") {
      addPapel(p, "signatario");
      addPapel(p, "beneficiario");
    } else if (papel === "dependente" || m.dependente) {
      addPapel(p, "dependente_representado");
    } else if (papel === "representante") {
      addPapel(p, "signatario");
    } else if (papel === "interlocutor_externo") {
      // Não é parte: não recebe papel contratual.
    } else {
      addPapel(p, "beneficiario");
      p.pendencias.push("Papel no caso não registrado — o papel contratual não pode ser presumido.");
    }
  }

  for (const d of e.dependentes) {
    if (!d.nome?.trim()) continue;
    const p = registrar(d.nome);
    addPapel(p, "dependente_representado");
    const vinculo = (d.representadoPor ?? "").trim();
    if (vinculo) {
      p.representadoPor = vinculo;
      p.representacaoConfirmada = d.statusRepresentacao === "documentada" || d.statusRepresentacao === "confirmada";
      if (!p.representacaoConfirmada) {
        p.pendencias.push(
          `Representação por ${vinculo} registrada, mas ainda não confirmada (status: ${d.statusRepresentacao ?? "não informado"}).`,
        );
      }
    } else {
      p.pendencias.push(
        "Dependente sem responsável legal registrado — a representação não é inferida por posição na lista nem por ausência de valor.",
      );
    }
  }

  for (const i of e.itensCondicao) {
    if (!i.parte?.trim()) continue;
    const p = registrar(i.parte);
    p.escopoIndividual = i.escopo?.trim() ? i.escopo.trim() : p.escopoIndividual;
    p.valorIndividual = Number(i.valor) || 0;
    if (!p.papeis.length) {
      addPapel(p, "beneficiario");
      p.pendencias.push(
        "Pessoa presente na condição comercial sem papel registrado no caso — vínculo e papel precisam de registro humano.",
      );
    }
    /*
     * Valor zero NÃO cria dependência. Só é dito como ausência de cobrança
     * própria; se nem papel de dependente registrado existe, fica pendência.
     */
    if (p.valorIndividual === 0 && !p.papeis.includes("dependente_representado") && !p.representadoPor) {
      p.pendencias.push(
        "Item sem valor próprio nesta condição: isso não comprova representação. Registre o papel e, se houver, o vínculo de representação.",
      );
    }
  }

  for (const r of e.responsaveisFinanceiros) {
    if (!r?.trim()) continue;
    addPapel(registrar(r), "responsavel_financeiro");
  }

  return saida;
}

/* ------------------------- blocos incorporados ------------------------- */

export type LinhaBloco = {
  rotulo: string;
  valor: string | null;
  fonte: string;
  /** Texto da pendência quando não há valor. Nunca preenchido por inferência. */
  pendencia: string | null;
};

export type BlocoIncorporado = {
  chave: string;
  titulo: string;
  /** Cláusula fixa já aprovada à qual este bloco se ancora. Nenhuma nova. */
  clausula: number;
  finalidade: string;
  linhas: LinhaBloco[];
  pendencias: string[];
  /** Pendência deste bloco impede a assinatura inicial? */
  bloqueiaAssinaturaInicial: boolean;
};

export type EntradaBlocos = {
  pessoas: PessoaContratual[];
  contratadaQualificacao: string | null;
  objeto: string | null;
  paisRota: string | null;
  escopoResumo: string | null;
  servicosIncluidos: string | null;
  servicosExcluidos: string | null;
  fasesEntregas: string | null;
  prazosReferencia: string | null;
  despesasExternas: string | null;
  /** Condição comercial aprovada do caso. */
  total: number | null;
  moeda: string;
  formaPagamento: string | null;
  parcelas: string | null;
  vencimentos: string | null;
  propostaReferencia: string | null;
  /** Texto institucional da regra de despesas (cláusula fixa, não reescrito). */
  regraDespesasInstitucional: string;
};

function linha(
  rotulo: string,
  valor: string | null | undefined,
  fonte: string,
  pendencia: string,
): LinhaBloco {
  const v = valor === null || valor === undefined ? null : String(valor).trim() || null;
  return { rotulo, valor: v, fonte, pendencia: v ? null : pendencia };
}

function bloco(
  chave: string,
  titulo: string,
  clausula: number,
  finalidade: string,
  linhas: LinhaBloco[],
  bloqueia: boolean,
): BlocoIncorporado {
  const pendencias = linhas.filter((l) => !l.valor).map((l) => `${l.rotulo}: ${l.pendencia}`);
  return { chave, titulo, clausula, finalidade, linhas, pendencias, bloqueiaAssinaturaInicial: bloqueia && pendencias.length > 0 };
}

function papeisTexto(p: PessoaContratual): string {
  return p.papeis.length ? p.papeis.map((x) => ROTULO_PAPEL_CONTRATUAL[x]).join(", ") : "papel não registrado";
}

/**
 * Os nove blocos do caso, cada um ancorado numa cláusula fixa já aprovada.
 * Nenhum texto jurídico novo: o bloco traz o dado que a cláusula pressupõe.
 */
export function montarBlocosIncorporados(e: EntradaBlocos): BlocoIncorporado[] {
  const partes = e.pessoas.map((p) => {
    const partesTexto: string[] = [papeisTexto(p)];
    if (p.representadoPor) {
      partesTexto.push(
        `representado por ${p.representadoPor}${p.representacaoConfirmada ? " (representação confirmada)" : " (representação a confirmar)"}`,
      );
    }
    return linha(p.nome, partesTexto.join(" · "), "composição do caso", "pessoa sem papel contratual registrado");
  });

  const escopoPorPessoa = e.pessoas
    .filter((p) => !p.papeis.includes("dependente_representado") || p.escopoIndividual)
    .map((p) =>
      linha(
        p.nome,
        p.escopoIndividual
          ? `${p.escopoIndividual}${p.valorIndividual !== null ? ` — ${p.valorIndividual > 0 ? formatarDinheiro(p.valorIndividual, e.moeda) : "sem cobrança própria"}` : ""}`
          : null,
        "condição comercial aprovada do caso",
        "escopo individual não registrado na condição comercial",
      ),
    );

  const distribuicao = e.pessoas
    .filter((p) => p.valorIndividual !== null && p.valorIndividual > 0)
    .map((p) => linha(p.nome, formatarDinheiro(p.valorIndividual!, e.moeda), "condição comercial aprovada do caso", "valor não distribuído"));

  const responsaveis = e.pessoas.filter((p) => p.papeis.includes("responsavel_financeiro")).map((p) => p.nome);

  return [
    bloco(
      "qualificacao",
      "Qualificação das partes",
      1,
      "Identifica a contratada e cada parte do contrato, com o papel que exerce.",
      [
        linha("Contratada", e.contratadaQualificacao, "perfil institucional versionado", "qualificação da contratada não registrada"),
        ...partes,
      ],
      true,
    ),
    bloco(
      "objeto_do_caso",
      "Objeto deste caso",
      2,
      "Delimita o objeto do estudo neste caso, dentro do objeto institucional da cláusula 2.",
      [
        linha("Objeto do caso", e.objeto, "CRM confirmado", "objeto do caso não registrado"),
        linha("País e rota", e.paisRota, "planejador homologado", "país/rota não confirmado"),
        linha("Resumo do escopo aprovado", e.escopoResumo, "proposta aprovada", "escopo não registrado a partir da proposta"),
      ],
      true,
    ),
    bloco(
      "escopo_individual",
      "Escopo individual por pessoa e escopo familiar consolidado",
      3,
      "Diz o que cada pessoa contratou e como os escopos compõem o estudo familiar.",
      escopoPorPessoa.length
        ? escopoPorPessoa
        : [linha("Escopo por pessoa", null, "condição comercial aprovada do caso", "nenhuma pessoa com escopo individual registrado")],
      true,
    ),
    bloco(
      "servicos",
      "Serviços incluídos e excluídos",
      3,
      "Fixa o que está dentro e o que está fora do escopo contratado.",
      [
        linha("Serviços incluídos", e.servicosIncluidos, "proposta aprovada", "serviços incluídos não registrados"),
        linha(
          "Serviços excluídos",
          e.servicosExcluidos,
          "proposta aprovada",
          "exclusões não especificadas na proposta — revisão humana necessária",
        ),
      ],
      true,
    ),
    bloco(
      "entregas",
      "Entregas, fases e critérios de encerramento",
      11,
      "Lista as fases e entregas previstas e o critério objetivo de encerramento.",
      [
        linha("Fases e entregas", e.fasesEntregas, "planejador homologado", "fases e entregas não registradas"),
      ],
      true,
    ),
    bloco(
      "valor",
      "Valor total, distribuição e responsabilidades financeiras",
      8,
      "Registra o valor aprovado do caso, como se distribui por pessoa e quem responde por ele.",
      [
        linha(
          "Valor total aprovado",
          e.total === null ? null : formatarDinheiro(e.total, e.moeda),
          "condição comercial aprovada do caso",
          "condição comercial do caso não registrada",
        ),
        ...distribuicao,
        linha(
          "Responsáveis financeiros",
          responsaveis.length ? responsaveis.join(" · ") : null,
          "condição comercial aprovada do caso",
          "responsáveis financeiros não declarados",
        ),
      ],
      true,
    ),
    bloco(
      "pagamento",
      "Forma de pagamento, parcelas e vencimentos",
      8,
      "Registra a condição de pagamento que condiciona o início do serviço.",
      [
        linha("Forma de pagamento", e.formaPagamento, "proposta aprovada", "forma de pagamento não registrada"),
        linha("Parcelas e recorrência", e.parcelas, "proposta aprovada", "parcelas não registradas"),
        linha(
          "Vencimentos",
          e.vencimentos,
          "preenchimento humano confirmado",
          "vencimento não formalizado — não inferido pelo número de parcelas",
        ),
      ],
      true,
    ),
    bloco(
      "prazo",
      "Prazo e dependências documentais",
      10,
      "Registra as janelas de prazo e as dependências que as condicionam.",
      [linha("Prazos e dependências", e.prazosReferencia, "ficha do caso + escopo aprovado", "prazos e dependências não registrados")],
      false,
    ),
    bloco(
      "despesas",
      "Despesas de terceiros deste caso",
      9,
      "Aplica ao caso a regra institucional de despesas de terceiros, sem reescrevê-la.",
      [
        linha("Regra institucional", e.regraDespesasInstitucional, "contrato-base", "regra institucional ausente"),
        linha(
          "Despesas previstas neste caso",
          e.despesasExternas,
          "ficha do caso",
          "nenhuma despesa concreta prevista nesta etapa — o Anexo II só se aplica quando houver despesa",
        ),
      ],
      false,
    ),
    bloco(
      "referencias",
      "Referência e versão da proposta de origem",
      14,
      "Amarra o contrato à proposta aprovada que originou escopo e preço.",
      [linha("Proposta de origem", e.propostaReferencia, "proposta aprovada", "proposta de origem não referenciada")],
      true,
    ),
  ];
}

/* ------------------------- cobertura material ------------------------- */

export type PendenciaCobertura = {
  pessoa: string | null;
  campo: string;
  texto: string;
  bloqueiaAssinaturaInicial: boolean;
};

export type CoberturaContratual = {
  completa: boolean;
  /** Pendências que de fato impedem a assinatura inicial. */
  impeditivas: PendenciaCobertura[];
  /** Pendências reais que não impedem contratar agora. */
  posteriores: PendenciaCobertura[];
  /** Blocos do corpo que carregam o conteúdo (o que torna o Anexo I redundante). */
  blocosCobertos: string[];
};

/**
 * Cobertura **material**: pessoa + papel + escopo + entregas + condição
 * comercial + representação quando necessária.
 *
 * Correção exigida: não se diz mais "sem Anexo I não há escopo contratado"
 * quando o escopo está no corpo. A pergunta passa a ser se o conteúdo existe,
 * não em qual documento ele está.
 */
export function coberturaContratual(
  pessoas: readonly PessoaContratual[],
  blocos: readonly BlocoIncorporado[],
): CoberturaContratual {
  const impeditivas: PendenciaCobertura[] = [];
  const posteriores: PendenciaCobertura[] = [];

  for (const b of blocos) {
    for (const l of b.linhas) {
      if (l.valor) continue;
      const p: PendenciaCobertura = {
        pessoa: null,
        campo: `${b.titulo} · ${l.rotulo}`,
        texto: l.pendencia ?? "campo sem fonte rastreável",
        bloqueiaAssinaturaInicial: b.bloqueiaAssinaturaInicial,
      };
      (p.bloqueiaAssinaturaInicial ? impeditivas : posteriores).push(p);
    }
  }

  for (const pessoa of pessoas) {
    for (const texto of pessoa.pendencias) {
      /*
       * Representação de dependente é impeditiva: menor não assina e não pode
       * ser incluído sem responsável registrado. As demais pendências de papel
       * também impedem, porque o contrato não pode nomear parte sem papel.
       */
      const impeditiva =
        pessoa.papeis.includes("dependente_representado") || texto.includes("papel");
      const p: PendenciaCobertura = {
        pessoa: pessoa.nome,
        campo: "Partes e representação",
        texto,
        bloqueiaAssinaturaInicial: impeditiva,
      };
      (impeditiva ? impeditivas : posteriores).push(p);
    }
  }

  return {
    completa: impeditivas.length === 0,
    impeditivas,
    posteriores,
    blocosCobertos: blocos.filter((b) => b.pendencias.length === 0).map((b) => b.chave),
  };
}

/**
 * O conteúdo do Anexo I está incorporado ao corpo? Quando sim, o Anexo I não é
 * documento separado obrigatório — é o mesmo conteúdo, no contrato.
 *
 * Exige os quatro blocos que o Anexo I traduzia: escopo individual, serviços,
 * entregas e condição comercial (valor + pagamento).
 */
export const BLOCOS_QUE_INCORPORAM_ANEXO_I = [
  "escopo_individual",
  "servicos",
  "entregas",
  "valor",
  "pagamento",
] as const;

export function anexoIIncorporadoNoCorpo(blocos: readonly BlocoIncorporado[]): boolean {
  const cobertos = new Set(blocos.filter((b) => b.pendencias.length === 0).map((b) => b.chave));
  return BLOCOS_QUE_INCORPORAM_ANEXO_I.every((c) => cobertos.has(c));
}

/** Motivo textual da não aplicabilidade do Anexo I como documento separado. */
export const MOTIVO_ANEXO_I_INCORPORADO =
  "Conteúdo do Anexo I (escopo por pessoa, serviços, entregas e condição comercial) incorporado ao corpo do contrato. " +
  "Não há documento separado a emitir, e a ausência dele não bloqueia a assinatura inicial.";

/* --------------- aplicabilidade de TODOS os anexos I–V --------------- */

/**
 * Instrução da Proprietária, 04/10/2026, em complemento: "execute também em
 * relação a todos os anexos, não somente ao anexo 1".
 *
 * A regra é a mesma para os cinco, e muda o que cada um significa quando não
 * existe: nenhum anexo é obrigação artificial. Anexo I é conteúdo incorporado
 * ao corpo; os outros quatro são **condicionados a um ato concreto** que pode
 * nunca acontecer. Nenhum deles, ausente por não aplicabilidade, bloqueia a
 * assinatura inicial — e cada um diz por quê, com estado que já existe no
 * dicionário (`nao_aplicavel`), nunca "aprovado" para esconder ausência.
 */
export const REGRAS_APLICABILIDADE_ANEXOS = [
  {
    codigo: "ANEXO_I_ORDEM_SERVICO",
    regra: "incorporado_ao_corpo",
    condicao: "O conteúdo (escopo por pessoa, serviços, entregas, condição comercial) está nos blocos do corpo.",
    clausulaQueCobre: 3,
    bloqueiaAssinaturaInicial: false,
    motivoNaoAplicavel: MOTIVO_ANEXO_I_INCORPORADO,
  },
  {
    codigo: "ANEXO_II_DESPESAS_EXTERNAS",
    regra: "condicionado_a_despesa_concreta",
    condicao: "Existe despesa de terceiro concreta prevista, estimada ou aprovada neste caso.",
    clausulaQueCobre: 9,
    bloqueiaAssinaturaInicial: false,
    motivoNaoAplicavel:
      "Nenhuma despesa de terceiro concreta nesta etapa. A regra institucional de despesas está no corpo do contrato " +
      "(cláusula 9) e no bloco de despesas do caso; o Anexo II é emitido quando houver despesa a aprovar.",
  },
  {
    codigo: "ANEXO_III_AUTORIZACAO_PESQUISA",
    regra: "condicionado_a_ato_externo",
    condicao: "Há ação externa específica a autorizar, com aceite rastreável.",
    clausulaQueCobre: 5,
    bloqueiaAssinaturaInicial: false,
    motivoNaoAplicavel:
      "Nenhuma pesquisa externa específica solicitada. A autorização é instrumento posterior: sua ausência bloqueia " +
      "pesquisa externa, nunca a contratação inicial.",
  },
  {
    codigo: "ANEXO_IV_PROCURACAO",
    regra: "condicionado_a_exigencia_de_orgao",
    condicao: "Um órgão ou país exige instrumento próprio, com poderes definidos.",
    clausulaQueCobre: 13,
    bloqueiaAssinaturaInicial: false,
    motivoNaoAplicavel:
      "Nenhum órgão exigiu instrumento próprio até aqui. A procuração é instrumento posterior, com país, órgão e " +
      "poderes confirmados — não é pendência de contratação inicial.",
  },
  {
    codigo: "ANEXO_V_ALTERACAO_ESCOPO",
    regra: "condicionado_a_alteracao_posterior",
    condicao: "Houve inclusão, exclusão ou alteração de escopo depois da contratação.",
    clausulaQueCobre: 10,
    bloqueiaAssinaturaInicial: false,
    motivoNaoAplicavel:
      "Nenhuma alteração de escopo formalizada. O termo de alteração só existe depois de uma mudança — exigi-lo antes " +
      "seria pendência artificial.",
  },
] as const;

export type CodigoAnexoGovernado = (typeof REGRAS_APLICABILIDADE_ANEXOS)[number]["codigo"];

export function regraDoAnexo(codigo: string) {
  return REGRAS_APLICABILIDADE_ANEXOS.find((r) => r.codigo === codigo) ?? null;
}

/**
 * Nenhum dos cinco anexos bloqueia a assinatura inicial por ausência: quando
 * aplicável e com pendência, ele bloqueia o **gate do próprio ato** (pesquisa
 * externa, financeiro, prévia), que é outra coisa.
 */
export function anexoBloqueiaAssinaturaInicial(): false {
  return false;
}

/**
 * Instrumentos condicionais ainda não aplicáveis — a lista separada que a
 * Proprietária pediu, para não se confundir com pendência de contratação.
 */
export function instrumentosPosteriores(
  anexos: readonly { codigo: string; aplicavel: boolean }[],
): { codigo: string; condicao: string; motivo: string }[] {
  return anexos
    .filter((a) => !a.aplicavel && a.codigo !== "ANEXO_I_ORDEM_SERVICO")
    .map((a) => {
      const r = regraDoAnexo(a.codigo);
      return {
        codigo: a.codigo,
        condicao: r?.condicao ?? "condição não registrada",
        motivo: r?.motivoNaoAplicavel ?? "não aplicável",
      };
    });
}
