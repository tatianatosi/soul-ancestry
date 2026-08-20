/**
 * Corte B — checklist cadastral registrável por pessoa.
 *
 * Regras normativas:
 * - Nada é inferido: campo sem fonte declarada permanece "pendente".
 * - Cada dado pertence a uma pessoa (titular, dependente ou contratada),
 *   nunca ao caso global.
 * - Todo item guarda status, fonte, data de verificação e acesso restrito.
 * - Nenhum formulário, mensagem, contrato ou documento externo é gerado aqui.
 */

export const STATUS_CADASTRO = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "informado", rotulo: "Informado (sem verificação)" },
  { valor: "verificado", rotulo: "Verificado" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
  { valor: "aguarda_fonte_societaria", rotulo: "Aguarda fonte societária" },
] as const;
export type StatusCadastro = (typeof STATUS_CADASTRO)[number]["valor"];

export const FONTES_CADASTRO = [
  { valor: "nao_declarada", rotulo: "Fonte não declarada" },
  { valor: "planejador", rotulo: "Planejador (homologado)" },
  { valor: "proposta_aprovada", rotulo: "Proposta aprovada" },
  { valor: "crm", rotulo: "CRM / Discovery" },
  { valor: "documento_recebido", rotulo: "Documento recebido" },
  { valor: "declaracao_titular", rotulo: "Declaração do titular" },
  { valor: "fonte_societaria", rotulo: "Fonte societária oficial" },
] as const;

export const PESSOA_TIPOS = [
  { valor: "titular", rotulo: "Titular / contratante" },
  { valor: "dependente", rotulo: "Dependente" },
  { valor: "contratada", rotulo: "Contratada (dados oficiais)" },
] as const;
export type PessoaTipo = (typeof PESSOA_TIPOS)[number]["valor"];

export type ItemChecklist = {
  id?: string;
  case_id: string;
  pessoa_tipo: PessoaTipo;
  pessoa_nome: string;
  /** Referência obrigatória à pessoa do caso (case_members / case_dependents). */
  pessoa_ref_id?: string | null;
  pessoa_ref_tabela?: string | null;
  /** Cliente canônico do CRM, quando a pessoa já existe no cadastro. */
  cliente_id?: string | null;
  pessoa_nome_historico?: string | null;
  reconciliado_em?: string | null;
  reconciliacao_motivo?: string | null;
  campo: string;
  campo_rotulo: string;
  obrigatorio: boolean;
  status: StatusCadastro;
  fonte?: string | null;
  data_verificacao?: string | null;
  acesso_restrito: boolean;
  observacao_interna?: string | null;
  ordem: number;
};

/**
 * Chave de agrupamento por pessoa: sempre o ID de referência quando existe.
 * O nome nunca é chave única — nomes divergentes do mesmo cadastro (caso Adair)
 * não podem produzir duas pessoas distintas.
 */
export function chavePessoa(i: ItemChecklist): string {
  return i.pessoa_ref_id ? `ref::${i.pessoa_ref_id}` : `${i.pessoa_tipo}::${i.pessoa_nome}`;
}

/**
 * Guard de criação: pessoa física do caso exige referência por ID.
 * Retorna o motivo do bloqueio, ou null quando a criação é permitida.
 */
export function bloqueioCriacaoPorNome(input: {
  pessoa_tipo: PessoaTipo;
  pessoa_nome: string;
  pessoa_ref_id?: string | null;
  pessoasExistentes?: { id: string; nome: string }[];
}): string | null {
  if (input.pessoa_tipo === "contratada") return null;
  if (input.pessoa_ref_id) return null;
  const homonimo = (input.pessoasExistentes ?? []).find(
    (p) => p.nome.trim().toLowerCase() === input.pessoa_nome.trim().toLowerCase(),
  );
  if (homonimo)
    return `Já existe pessoa registrada neste caso para "${input.pessoa_nome}": use a referência por ID, não o nome.`;
  return "Checklist cadastral exige referência obrigatória à pessoa (pessoa_ref_id).";
}


/** Campos cadastrais de pessoa física titular/contratante. */
export const CAMPOS_TITULAR = [
  { campo: "nome_completo", rotulo: "Nome completo confirmado" },
  { campo: "cpf", rotulo: "CPF" },
  { campo: "rg", rotulo: "RG / documento de identidade" },
  { campo: "profissao", rotulo: "Profissão" },
  { campo: "estado_civil", rotulo: "Estado civil" },
  { campo: "endereco", rotulo: "Endereço completo" },
  { campo: "cep", rotulo: "CEP" },
  { campo: "telefone", rotulo: "Telefone" },
  { campo: "email", rotulo: "E-mail" },
] as const;

/** Campos do dependente: vínculo, representação e necessidade formal. */
export const CAMPOS_DEPENDENTE = [
  { campo: "nome_completo", rotulo: "Nome completo confirmado" },
  { campo: "vinculo_com_titular", rotulo: "Vínculo com o titular responsável" },
  { campo: "status_representacao", rotulo: "Status de representação" },
  { campo: "necessidade_contrato", rotulo: "Necessidade de participação no contrato" },
  { campo: "necessidade_app", rotulo: "Necessidade de acesso ao App" },
  { campo: "necessidade_anexo", rotulo: "Necessidade de anexo individual" },
] as const;

/** Dados oficiais da contratada — só de fonte societária. */
export const CAMPOS_CONTRATADA = [
  { campo: "razao_social", rotulo: "Razão social" },
  { campo: "cnpj", rotulo: "CNPJ" },
  { campo: "endereco", rotulo: "Endereço da sede" },
  { campo: "email", rotulo: "E-mail institucional" },
  { campo: "representante_legal", rotulo: "Representante legal" },
] as const;

export function camposDoTipo(tipo: PessoaTipo): readonly { campo: string; rotulo: string }[] {
  if (tipo === "dependente") return CAMPOS_DEPENDENTE;
  if (tipo === "contratada") return CAMPOS_CONTRATADA;
  return CAMPOS_TITULAR;
}

export function rotuloStatus(v: string | null | undefined): string {
  return STATUS_CADASTRO.find((s) => s.valor === v)?.rotulo ?? "—";
}
export function rotuloFonte(v: string | null | undefined): string {
  return FONTES_CADASTRO.find((f) => f.valor === v)?.rotulo ?? "Fonte não declarada";
}

/** Item resolvido = verificado com fonte declarada e data, ou não aplicável. */
export function itemResolvido(i: ItemChecklist): boolean {
  if (i.status === "nao_aplicavel") return true;
  return i.status === "verificado" && Boolean(i.fonte) && i.fonte !== "nao_declarada" && Boolean(i.data_verificacao);
}

export type PendenciaCadastro = { pessoa: string; campo: string; rotulo: string; motivo: string };

export function pendenciasCadastro(itens: ItemChecklist[]): PendenciaCadastro[] {
  const out: PendenciaCadastro[] = [];
  for (const i of itens) {
    if (!i.obrigatorio || itemResolvido(i)) continue;
    const motivo =
      i.status === "aguarda_fonte_societaria"
        ? "aguarda fonte societária oficial"
        : i.status === "verificado"
          ? "verificado sem fonte declarada ou sem data de verificação"
          : i.status === "informado"
            ? "informado, ainda sem verificação"
            : "não informado";
    out.push({ pessoa: i.pessoa_nome, campo: i.campo, rotulo: i.campo_rotulo, motivo });
  }
  return out;
}

export type ResumoPessoa = {
  pessoa_nome: string;
  pessoa_tipo: PessoaTipo;
  total: number;
  resolvidos: number;
  pendentes: number;
  completo: boolean;
};

export function resumoPorPessoa(itens: ItemChecklist[]): ResumoPessoa[] {
  const mapa = new Map<string, ItemChecklist[]>();
  for (const i of itens) {
    const chave = `${i.pessoa_tipo}::${i.pessoa_nome}`;
    mapa.set(chave, [...(mapa.get(chave) ?? []), i]);
  }
  return [...mapa.entries()]
    .map(([chave, lista]) => {
      const resolvidos = lista.filter(itemResolvido).length;
      const pendentes = lista.filter((i) => i.obrigatorio && !itemResolvido(i)).length;
      return {
        pessoa_nome: chave.split("::")[1] ?? "",
        pessoa_tipo: (chave.split("::")[0] ?? "titular") as PessoaTipo,
        total: lista.length,
        resolvidos,
        pendentes,
        completo: pendentes === 0,
      };
    })
    .sort((a, b) => a.pessoa_tipo.localeCompare(b.pessoa_tipo) || a.pessoa_nome.localeCompare(b.pessoa_nome));
}

/** Bloqueio de cadastro para os gates de formalização. */
export function bloqueioCadastro(itens: ItemChecklist[]): { codigo: string; descricao: string } | null {
  const p = pendenciasCadastro(itens);
  if (!p.length) return null;
  return {
    codigo: "CADASTRO_PESSOA_INCOMPLETO",
    descricao: `${p.length} dado(s) cadastral(is) obrigatório(s) pendente(s): ${[...new Set(p.map((x) => x.pessoa))].join(", ")}.`,
  };
}

/**
 * Rascunho interno de comunicação para solicitar os dados faltantes.
 * Produz texto — nunca envia, nunca cria link, formulário ou documento externo.
 */
export function rascunhoSolicitacaoCadastro(input: {
  pessoa: string;
  pendencias: PendenciaCadastro[];
  prazo: string;
}): { assunto: string; corpo: string } {
  const lista = input.pendencias.map((p) => `- ${p.rotulo}`).join("\n");
  return {
    assunto: `Clube Ancestral — confirmação de dados cadastrais (${input.pessoa})`,
    corpo: [
      `Olá, ${input.pessoa}.`,
      "",
      "Para seguirmos com a preparação da formalização, precisamos confirmar os dados abaixo:",
      lista || "- (nenhum item pendente)",
      "",
      `Retorno desejado até ${input.prazo}.`,
      "",
      "Rascunho interno — revisar antes de qualquer envio. Não contém link, formulário nem anexo.",
    ].join("\n"),
  };
}
