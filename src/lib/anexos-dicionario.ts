/**
 * Dicionário de anexos contratuais.
 *
 * Três coisas separadas de propósito:
 *  - modelo jurídico-base (versionado e restrito: MODELO-ESTUDO + BASE-GEN-V2);
 *  - regra de aplicabilidade (país, produto, escopo, familiar/individual);
 *  - instância parametrizada por caso (uma por pessoa, quando a regra pedir).
 *
 * Anexo nunca é escolhido à mão: entra por regra derivada dos parâmetros.
 */

export const ESTADOS_ANEXO = [
  "nao_aplicavel",
  "aplicavel",
  "obrigatorio",
  "opcional",
  "pendente",
  "em_revisao",
  "aprovado",
  "substituido",
  "arquivado",
] as const;
export type EstadoAnexo = (typeof ESTADOS_ANEXO)[number];

export const ROTULO_ESTADO_ANEXO: Record<EstadoAnexo, string> = {
  nao_aplicavel: "Não aplicável",
  aplicavel: "Aplicável",
  obrigatorio: "Obrigatório",
  opcional: "Opcional",
  pendente: "Pendente",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  substituido: "Substituído",
  arquivado: "Arquivado",
};

export type InstanciaAnexo = {
  chave: string;
  titulo: string;
  pessoa?: string;
  pendencias: string[];
};

export type RegraAnexo = {
  codigo: string;
  titulo: string;
  finalidade: string;
  regra: string;
  aplicabilidade: string;
  campos: string[];
  impactoAusencia: string;
  obrigatorio: boolean;
  aplicavel: boolean;
  motivo: string;
  estado: EstadoAnexo;
  pendencias: string[];
  instancias: InstanciaAnexo[];
};

type Entrada = {
  produto?: string | null;
  paisRota?: string | null;
  beneficiarios?: string | null;
  representacaoLegal?: string | null;
  dependentes?: string | null;
  valorTotal?: string | null;
  formaPagamento?: string | null;
  parcelas?: string | null;
  escopoResumo?: string | null;
  /** Estados já registrados por código de anexo (revisão/aprovação/arquivamento). */
  estados?: Record<string, EstadoAnexo>;
};

export function pessoasDeLista(texto?: string | null) {
  return String(texto ?? "")
    .split(/\|\||;|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Dependente escrito como "Felipe (Ana Luiza)" fica anexado ao titular indicado. */
function dependentesPorTitular(texto?: string | null) {
  const mapa = new Map<string, string[]>();
  for (const bruto of pessoasDeLista(texto)) {
    const m = bruto.match(/^(.+?)\s*\((.+?)\)\s*$/);
    if (m) {
      const titular = m[2].trim();
      mapa.set(titular, [...(mapa.get(titular) ?? []), m[1].trim()]);
    } else {
      mapa.set("", [...(mapa.get("") ?? []), bruto]);
    }
  }
  return mapa;
}

function estadoBase(input: {
  aplicavel: boolean;
  obrigatorio: boolean;
  pendencias: string[];
  registrado?: EstadoAnexo;
}): EstadoAnexo {
  if (input.registrado && ["em_revisao", "aprovado", "substituido", "arquivado"].includes(input.registrado)) {
    return input.registrado;
  }
  if (!input.aplicavel) return "nao_aplicavel";
  if (input.pendencias.length) return "pendente";
  return input.obrigatorio ? "obrigatorio" : "opcional";
}

export function dicionarioAnexos(entrada: Entrada): RegraAnexo[] {
  const estados = entrada.estados ?? {};
  const titulares = pessoasDeLista(entrada.beneficiarios);
  const dependentes = dependentesPorTitular(entrada.dependentes);
  const representacaoTexto = String(entrada.representacaoLegal ?? "");
  const temRepresentacao =
    /represent|menor|incapaz|tutel/i.test(representacaoTexto) &&
    !/não há representa|nao ha representa|todos .*maior/i.test(representacaoTexto);
  const temComercial = Boolean((entrada.valorTotal ?? "").trim() || (entrada.formaPagamento ?? "").trim());

  const regras: RegraAnexo[] = [];

  const escopoPend: string[] = [];
  if (!(entrada.escopoResumo ?? "").trim()) escopoPend.push("Resumo de escopo vazio (escopo_resumo).");
  if (!(entrada.produto ?? "").trim()) escopoPend.push("Produto/SKU não parametrizado (produto_sku).");
  regras.push({
    codigo: "ANX-ESCOPO",
    titulo: "Escopo e entregas",
    finalidade: "Descreve, em linguagem simples, o que está incluído, o que está fora, as fases e os prazos de referência.",
    regra: "Obrigatório em todo instrumento gerado pelo MODELO-ESTUDO + BASE-GEN-V2.",
    aplicabilidade: "Qualquer país, produto ou escopo — familiar ou individual.",
    campos: ["escopo_resumo", "servicos_incluidos", "servicos_excluidos", "fases_entregas", "prazos_referencia"],
    impactoAusencia: "Bloqueia a versão final: o contrato ficaria sem delimitação de escopo.",
    obrigatorio: true,
    aplicavel: true,
    motivo: "Regra fixa do modelo homologado.",
    estado: estadoBase({ aplicavel: true, obrigatorio: true, pendencias: escopoPend, registrado: estados["ANX-ESCOPO"] }),
    pendencias: escopoPend,
    instancias: [{ chave: "ANX-ESCOPO", titulo: "Instância única do caso", pendencias: escopoPend }],
  });

  const privPend: string[] = [];
  if (!titulares.length) privPend.push("Nenhum titular parametrizado (beneficiarios).");
  regras.push({
    codigo: "ANX-PRIVACIDADE",
    titulo: "Privacidade e tratamento de dados",
    finalidade: "Base legal, finalidade, retenção e consentimento por titular de dados.",
    regra: "Obrigatório sempre que houver tratamento de dados pessoais — ou seja, em todos os casos.",
    aplicabilidade: "Qualquer país e produto; alcança todos os titulares do núcleo familiar.",
    campos: ["beneficiarios", "partes_signatarias", "representacao_legal"],
    impactoAusencia: "Bloqueia a versão final e a ativação do caso (consentimento por titular).",
    obrigatorio: true,
    aplicavel: true,
    motivo: "Regra fixa do modelo homologado.",
    estado: estadoBase({ aplicavel: true, obrigatorio: true, pendencias: privPend, registrado: estados["ANX-PRIVACIDADE"] }),
    pendencias: privPend,
    instancias: [{ chave: "ANX-PRIVACIDADE", titulo: "Instância única do caso", pendencias: privPend }],
  });

  const comPend: string[] = [];
  if (temComercial && !(entrada.valorTotal ?? "").trim()) comPend.push("Valor total ausente (valor_total).");
  if (temComercial && !(entrada.formaPagamento ?? "").trim()) comPend.push("Forma de pagamento ausente (forma_pagamento).");
  if (temComercial && !(entrada.parcelas ?? "").trim()) comPend.push("Parcelas/vencimentos ausentes (parcelas).");
  regras.push({
    codigo: "ANX-COMERCIAL",
    titulo: "Condições comerciais",
    finalidade: "Valor total, parcelas, vencimentos, responsáveis pelo pagamento e despesas de terceiros.",
    regra: "Aplicável quando houver valor total ou forma de pagamento parametrizada, vinda de proposta aceita ou cálculo aprovado.",
    aplicabilidade: "Caso familiar: um único anexo comercial para o núcleo, com responsáveis identificados.",
    campos: ["valor_total", "forma_pagamento", "parcelas", "vencimentos", "despesas_externas", "excecoes_comerciais"],
    impactoAusencia: "Sem ele não há base contratual para cobrança: o financeiro permanece bloqueado.",
    obrigatorio: temComercial,
    aplicavel: temComercial,
    motivo: temComercial ? "Há condições comerciais parametrizadas." : "Nenhuma condição comercial parametrizada ainda.",
    estado: estadoBase({
      aplicavel: temComercial,
      obrigatorio: temComercial,
      pendencias: comPend,
      registrado: estados["ANX-COMERCIAL"],
    }),
    pendencias: comPend,
    instancias: temComercial ? [{ chave: "ANX-COMERCIAL", titulo: "Instância única do núcleo familiar", pendencias: comPend }] : [],
  });

  const instanciasIndividuais: InstanciaAnexo[] = titulares.map((pessoa) => {
    const dep = dependentes.get(pessoa) ?? [];
    const pend: string[] = [];
    if (!pessoa.trim()) pend.push("Nome civil do titular vazio.");
    return {
      chave: `ANX-INDIVIDUAL::${pessoa}`,
      titulo: dep.length ? `${pessoa} + ${dep.join(", ")} (dependente)` : pessoa,
      pessoa,
      pendencias: pend,
    };
  });
  const indPend = instanciasIndividuais.flatMap((i) => i.pendencias);
  if (!titulares.length) indPend.push("Nenhuma pessoa vinculada ao instrumento (beneficiarios).");
  regras.push({
    codigo: "ANX-INDIVIDUAL",
    titulo: "Processo individual por requerente",
    finalidade: "Uma ficha por pessoa: qualificação, documentos exigidos e etapa do processo individual.",
    regra: "Uma instância por titular adulto vinculado ao contrato-base; dependente menor entra na instância do seu titular.",
    aplicabilidade: "Casos familiares com mais de um requerente sob o mesmo contrato-base.",
    campos: ["beneficiarios", "dependentes", "vinculo_familiar", "ancestral_referencia", "membros_excluidos"],
    impactoAusencia: "Requerente sem anexo individual não é atendido pelo contrato assinado.",
    obrigatorio: titulares.length > 1,
    aplicavel: titulares.length > 0,
    motivo:
      titulares.length > 1
        ? `${titulares.length} requerentes adultos vinculados: ${titulares.length} instâncias individuais.`
        : titulares.length === 1
          ? "Apenas um requerente vinculado: anexo individual opcional."
          : "Nenhum requerente parametrizado.",
    estado: estadoBase({
      aplicavel: titulares.length > 0,
      obrigatorio: titulares.length > 1,
      pendencias: indPend,
      registrado: estados["ANX-INDIVIDUAL"],
    }),
    pendencias: indPend,
    instancias: instanciasIndividuais,
  });

  const repPend: string[] = [];
  if (temRepresentacao && !dependentes.size) repPend.push("Representação declarada sem dependente identificado (dependentes).");
  regras.push({
    codigo: "ANX-REPRESENTACAO",
    titulo: "Representação legal",
    finalidade: "Qualifica o representante e os poderes exercidos quando há menor ou incapaz no núcleo.",
    regra: "Aplicável somente quando os dados ou documentos de um menor/incapaz exigirem representação declarada.",
    aplicabilidade: "Núcleos com dependente menor cujo processo dependa de ato do representante.",
    campos: ["representacao_legal", "dependentes", "partes_signatarias"],
    impactoAusencia: "Sem ele, o ato praticado pelo representante fica sem lastro e a revisão humana é bloqueada.",
    obrigatorio: temRepresentacao,
    aplicavel: temRepresentacao,
    motivo: temRepresentacao
      ? "Representação legal declarada nos parâmetros."
      : "Nenhuma representação exigida: dependente menor não pratica ato próprio neste instrumento.",
    estado: estadoBase({
      aplicavel: temRepresentacao,
      obrigatorio: temRepresentacao,
      pendencias: repPend,
      registrado: estados["ANX-REPRESENTACAO"],
    }),
    pendencias: repPend,
    instancias: temRepresentacao
      ? [...dependentes.entries()].flatMap(([titular, deps]) =>
          deps.map((d) => ({
            chave: `ANX-REPRESENTACAO::${d}`,
            titulo: titular ? `${d} representado por ${titular}` : d,
            pessoa: d,
            pendencias: [],
          })),
        )
      : [],
  });

  return regras;
}
