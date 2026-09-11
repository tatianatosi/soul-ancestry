/**
 * Corte B — checklist cadastral registrável por pessoa.
 *
 * Regras normativas:
 * - Nada é inferido: campo sem fonte declarada permanece "pendente".
 * - Cada dado pertence a uma pessoa (titular ou dependente do cliente).
 *   A contratada não entra no checklist por caso: é o perfil institucional.
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
  /** Legado: não criar mais itens; perfil institucional cobre a contratada. */
  { valor: "contratada", rotulo: "Contratada (legado — não usar)" },
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


/**
 * Campos cadastrais de pessoa física titular/contratante.
 *
 * 08/09/2026 — antes, TODO campo nascia obrigatório, e cada pendente travava
 * `cadastroCompleto`, que por sua vez trava a conferência de escopo e o
 * fechamento do caso. Eram 9 travas por pessoa adulta. Por decisão da
 * proprietária ("excessivo para uma startup"), só seguem obrigatórios os campos
 * necessários para qualificar a parte e assinar: nome, CPF, RG, endereço e
 * e-mail. Profissão, estado civil, CEP e telefone continuam existindo e podem
 * ser preenchidos — apenas deixam de bloquear.
 */
export const CAMPOS_TITULAR = [
  { campo: "nome_completo", rotulo: "Nome completo confirmado", obrigatorio: true },
  { campo: "cpf", rotulo: "CPF", obrigatorio: true },
  { campo: "rg", rotulo: "RG / documento de identidade", obrigatorio: true },
  { campo: "profissao", rotulo: "Profissão", obrigatorio: false },
  { campo: "estado_civil", rotulo: "Estado civil", obrigatorio: false },
  { campo: "endereco", rotulo: "Endereço completo", obrigatorio: true },
  { campo: "cep", rotulo: "CEP", obrigatorio: false },
  { campo: "telefone", rotulo: "Telefone", obrigatorio: false },
  { campo: "email", rotulo: "E-mail", obrigatorio: true },
] as const;

/**
 * Campos do dependente: vínculo, representação e necessidade formal.
 *
 * Os três campos `necessidade_*` são decisões internas com padrão de política
 * (menor não assina, acesso ao App acompanha o titular, anexo de representação
 * existe quando há menor). Não são dado do cliente e deixaram de travar.
 */
export const CAMPOS_DEPENDENTE = [
  { campo: "nome_completo", rotulo: "Nome completo confirmado", obrigatorio: true },
  { campo: "vinculo_com_titular", rotulo: "Vínculo com o titular responsável", obrigatorio: true },
  { campo: "status_representacao", rotulo: "Status de representação", obrigatorio: true },
  { campo: "necessidade_contrato", rotulo: "Necessidade de participação no contrato", obrigatorio: false },
  { campo: "necessidade_app", rotulo: "Necessidade de acesso ao App", obrigatorio: false },
  { campo: "necessidade_anexo", rotulo: "Necessidade de anexo individual", obrigatorio: false },
] as const;

/**
 * Dados oficiais da contratada — só de fonte societária.
 *
 * 08/09/2026 — por decisão da proprietária, este bloco deixou de ser gerado no
 * checklist de cada caso. São constantes institucionais idênticas em todo caso,
 * mantidas em `PERFIL_INSTITUCIONAL` e sempre verificadas: repetir 5 itens
 * verificados por caso era ruído, não controle. A lista permanece exportada
 * porque descreve os campos exigidos do perfil institucional, agora lidos de lá.
 */
export const CAMPOS_CONTRATADA = [
  { campo: "razao_social", rotulo: "Razão social", obrigatorio: true },
  { campo: "cnpj", rotulo: "CNPJ", obrigatorio: true },
  { campo: "endereco", rotulo: "Endereço da sede", obrigatorio: true },
  { campo: "email", rotulo: "E-mail institucional", obrigatorio: true },
  { campo: "representante_legal", rotulo: "Representante legal", obrigatorio: true },
] as const;

export type CampoCadastral = { campo: string; rotulo: string; obrigatorio: boolean };

export function camposDoTipo(tipo: PessoaTipo): readonly CampoCadastral[] {
  if (tipo === "dependente") return CAMPOS_DEPENDENTE;
  // A contratada não gera mais itens de checklist por caso.
  if (tipo === "contratada") return [];
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
  pessoa_ref_id?: string | null;
  cliente_id?: string | null;
  pessoa_nome_historico?: string | null;
  total: number;
  resolvidos: number;
  pendentes: number;
  completo: boolean;
};

export function resumoPorPessoa(itens: ItemChecklist[]): ResumoPessoa[] {
  const mapa = new Map<string, ItemChecklist[]>();
  for (const i of itens) {
    const chave = chavePessoa(i);
    mapa.set(chave, [...(mapa.get(chave) ?? []), i]);
  }
  return [...mapa.values()]
    .map((lista) => {
      const primeiro = lista[0]!;
      const resolvidos = lista.filter(itemResolvido).length;
      const pendentes = lista.filter((i) => i.obrigatorio && !itemResolvido(i)).length;
      return {
        pessoa_nome: primeiro.pessoa_nome,
        pessoa_tipo: primeiro.pessoa_tipo,
        pessoa_ref_id: primeiro.pessoa_ref_id ?? null,
        cliente_id: primeiro.cliente_id ?? null,
        pessoa_nome_historico: lista.find((i) => i.pessoa_nome_historico)?.pessoa_nome_historico ?? null,
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
