/**
 * Vínculo pessoa → cliente por nome: usado onde uma pessoa (núcleo,
 * checklist, contrato) precisa ser ligada ao cadastro canônico em
 * `clientes` sem que o operador precise escolher manualmente. Só liga
 * quando exatamente um cliente ativo da organização bate por igualdade ou
 * por um nome ser prefixo do outro seguido de espaço (cobre nome curto vs.
 * nome completo — ex.: "Ana Luiza" e "Ana Luiza Gomes Silveira Rodrigues",
 * causa raiz da fragmentação da Ana em nucleo_membros/contract_parties).
 * Ambíguo (mais de um candidato) devolve null — nunca escolhe ao acaso.
 * Mesma regra usada no backfill SQL (migration
 * 20260904140000_pessoa360_vinculo_case_members_e_backfill_cliente_id).
 */
export function clienteCorrespondentePorNome(nome: string, clientes: { id: string; nome: string }[]): string | null {
  const alvo = nome.trim().toLowerCase();
  const candidatos = clientes.filter((c) => {
    const cn = c.nome.trim().toLowerCase();
    return cn === alvo || alvo.startsWith(`${cn} `) || cn.startsWith(`${alvo} `);
  });
  return candidatos.length === 1 ? candidatos[0].id : null;
}

export type MembroNucleoBruto = {
  id: string;
  nome: string;
  papel: string | null;
  /** Coluna presente apenas quando a linha é lida por núcleo (ex.: `listarNucleos`). */
  nucleo_id?: string;
  /**
   * P32c (26/09/2026) — coluna real de `nucleo_membros`, já fechada por CHECK
   * de 5 valores canônicos (migration 20260821135341): contratante/titular/
   * dependente/representante/interlocutor_externo (mais "interlocutor" como
   * variante legada — ver `PAPEIS_PESSOA` em caso-ficha.ts). Quando gravada,
   * prevalece sobre o papel derivado de `papel` (que só distingue 3 valores).
   */
  papel_no_caso?: string | null;
  vinculo: string | null;
  processo: string | null;
  ordem: number | null;
  cliente_id: string | null;
};

/**
 * Pessoa do caso, no formato que os consumidores de `case_members` esperam.
 *
 * Causa: a migration `20260821152043` arquivou de propósito as linhas de
 * `case_members` de qualquer caso cujo núcleo em Núcleos já tem a mesma
 * composição — Núcleos vira a única fonte de pessoas do caso, por decisão
 * já tomada (ver `docs/relatorios/2026-09-05_execucao_pessoa_360_operacional.md`,
 * seção 3). O problema real: 4 funções continuaram lendo só `case_members`
 * (arquivado = vazio) e nunca foram redirecionadas para Núcleos.
 *
 * `nucleo_membros` não distingue "titular" de "contratante" com um booleano
 * próprio — só tem `papel` ('contratante_signatario'/'dependente') e `ordem`.
 * Contra o único caso real hoje fragmentado desta forma (Ana Luiza), a regra
 * observada é: o membro de `ordem` mais baixa com papel contratante_signatario
 * é quem assina como contratante; os demais do mesmo papel são titulares
 * (adultos do núcleo, sem ser quem contrata); dependente é dependente. Isto é
 * uma aproximação, não um campo capturado — nacionalidade, CPF, data de
 * nascimento, representante legal e status cadastral continuam sem fonte em
 * Núcleos (eram nulos em `case_members` também, então não há retrocesso).
 */
export function pessoaDoCasoAPartirDoNucleo(m: MembroNucleoBruto, ordemMinimaContratante: number) {
  const derivadoTitular = m.papel === "contratante_signatario";
  const derivadoDependente = m.papel === "dependente";
  const derivadoContratante = derivadoTitular && (m.ordem ?? Infinity) <= ordemMinimaContratante;
  // P32c (26/09/2026) — quando o papel real (papel_no_caso, CHECK de 5
  // valores: contratante/titular/dependente/representante/
  // interlocutor_externo) já foi gravado, ele prevalece sobre a aproximação
  // derivada de `papel`+`ordem` — nunca o contrário. representante e
  // interlocutor_externo não são titular/contratante/dependente de geração
  // familiar (são papéis de representação/contato externo), então os 3
  // booleanos ficam falsos para esses dois casos.
  const papelReal = m.papel_no_caso ?? null;
  const papel_no_caso = papelReal ?? (derivadoContratante ? "contratante" : derivadoTitular ? "titular" : "dependente");
  const titular = papelReal ? papelReal === "titular" || papelReal === "contratante" : derivadoTitular;
  const contratante = papelReal ? papelReal === "contratante" : derivadoContratante;
  const dependente = papelReal ? papelReal === "dependente" : derivadoDependente;
  return {
    origem: "nucleo" as const,
    id: m.id,
    nome: m.nome,
    cliente_id: m.cliente_id,
    papel_no_caso,
    titular,
    contratante,
    dependente,
    parentesco: m.vinculo,
    requerente: false,
    nacionalidade: null as string | null,
    cpf: null as string | null,
    telefone: null as string | null,
    cep: null as string | null,
    data_nascimento: null as string | null,
    representante_legal: null as string | null,
    status_cadastral: "pendente" as string,
    // nucleo_membros não grava parentesco por pai_id/mae_id — só case_members
    // grava (migration 20260816201830). Fallback nunca inventa o vínculo.
    pai_id: null as string | null,
    mae_id: null as string | null,
    data_verificacao_dado: null as string | null,
    // Idem para representação legal — só case_members grava
    // representacao_necessaria/representacao_documentada.
    representacao_necessaria: null as boolean | null,
    representacao_documentada: null as boolean | null,
  };
}

export type PessoaDoCaso = Omit<ReturnType<typeof pessoaDoCasoAPartirDoNucleo>, "origem"> & {
  origem: "nucleo" | "case_members";
};

/** Menor `ordem` entre os membros com papel contratante_signatario (o signatário principal). */
export function ordemDoContratantePrincipal(membros: MembroNucleoBruto[]): number {
  const ordens = membros
    .filter((m) => m.papel === "contratante_signatario")
    .map((m) => m.ordem ?? Infinity);
  return ordens.length > 0 ? Math.min(...ordens) : -1;
}

/**
 * Pessoas do caso: `case_members` ativo quando existir; senão, fallback para
 * Núcleos (ver `pessoaDoCasoAPartirDoNucleo`) via `nucleos_familiares.case_id`.
 * Nunca funde as duas fontes — usa uma ou outra, para não duplicar pessoa.
 */
export async function pessoasDoCasoComFallbackNucleo(
  supabase: { from: (t: string) => any },
  caseId: string,
): Promise<PessoaDoCaso[]> {
  const { data: membrosCaso } = await supabase
    .from("case_members")
    .select("id,nome,papel_no_caso,titular,contratante,dependente,cpf,telefone,cep,data_nascimento,representante_legal,status_cadastral,parentesco,requerente,nacionalidade,cliente_id,pai_id,mae_id,data_verificacao_dado,representacao_necessaria,representacao_documentada")
    .eq("case_id", caseId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (membrosCaso && membrosCaso.length > 0) {
    return membrosCaso.map((m: any) => ({ origem: "case_members" as const, ...m })) as PessoaDoCaso[];
  }

  const { data: nucleo } = await supabase
    .from("nucleos_familiares")
    .select("id")
    .eq("case_id", caseId)
    .is("archived_at", null)
    .maybeSingle();
  if (!nucleo?.id) return [];

  const { data: membrosNucleo } = await supabase
    .from("nucleo_membros")
    .select("id,nome,papel,vinculo,processo,ordem,cliente_id")
    .eq("nucleo_id", nucleo.id)
    .is("archived_at", null)
    .order("ordem", { ascending: true });

  const lista = (membrosNucleo ?? []) as MembroNucleoBruto[];
  const ordemMinima = ordemDoContratantePrincipal(lista);
  return lista.map((m) => pessoaDoCasoAPartirDoNucleo(m, ordemMinima));
}

/**
 * R2 — estado do CPF de um membro do caso já vinculado à Pessoa Canônica
 * (`clientes`). Regra única: o servidor (conferirDivergenciaCpfMembrosCaso)
 * e o sinal da Pessoa 360 usam esta mesma função, para nunca divergirem.
 * Nunca decide sozinho: "conflito" e "preencher" só viram escrita com
 * confirmação humana; dependente nunca herda documento do responsável.
 */
export type EstadoCpfMembro =
  | "preencher"
  | "conflito"
  | "ja_sincronizado"
  | "sem_dado_canonico"
  | "dependente_nao_sincronizado";

const soDigitosCpf = (s: string) => s.replace(/\D/g, "");

export function estadoCpfMembroCaso(
  membro: { cpf?: string | null; dependente?: boolean | null },
  cpfCanonico: string | null | undefined,
): EstadoCpfMembro {
  if (membro.dependente) return "dependente_nao_sincronizado";
  if (!cpfCanonico || !soDigitosCpf(cpfCanonico)) return "sem_dado_canonico";
  if (membro.cpf && soDigitosCpf(membro.cpf)) {
    return soDigitosCpf(membro.cpf) === soDigitosCpf(cpfCanonico) ? "ja_sincronizado" : "conflito";
  }
  return "preencher";
}

/**
 * Sinal da Pessoa 360: para cada caso, quantos registros desta pessoa em
 * `case_members` estão em conflito ou a preencher. Só leitura — a ação
 * ("Conferir") mora no Caso 360, com confirmação humana.
 */
export function sinalCpfDaPessoaPorCaso(
  membros: { case_id?: string | null; cliente_id?: string | null; cpf?: string | null; dependente?: boolean | null; origem?: string }[],
  clienteId: string,
  cpfCanonico: string | null | undefined,
): Record<string, { conflito: number; preencher: number }> {
  const saida: Record<string, { conflito: number; preencher: number }> = {};
  for (const m of membros) {
    // Só case_members guarda CPF; membro projetado de Núcleos não tem o campo.
    if (m.origem === "nucleo" || m.cliente_id !== clienteId || !m.case_id) continue;
    const estado = estadoCpfMembroCaso(m, cpfCanonico);
    if (estado !== "conflito" && estado !== "preencher") continue;
    const alvo = (saida[m.case_id] ??= { conflito: 0, preencher: 0 });
    alvo[estado] += 1;
  }
  return saida;
}

/**
 * P28 (26/09/2026) — "de-para e retire sobreposições entre ficha
 * operacional" (Proprietária). `mascaras-e-validadores.md` §3.2 já
 * apontava telefone com 5 grafias e "Ação futura: Consolidar em Pessoa" —
 * mesma classe de gap que o CPF (R2) já resolve. Mesmo padrão exato,
 * mesmas garantias: nunca funde automaticamente, nunca sobrescreve valor
 * já preenchido, dependente nunca herda do responsável.
 */
export type EstadoTelefoneMembro =
  | "preencher"
  | "conflito"
  | "ja_sincronizado"
  | "sem_dado_canonico"
  | "dependente_nao_sincronizado";

const soDigitosTelefone = (s: string) => s.replace(/\D/g, "");

export function estadoTelefoneMembroCaso(
  membro: { telefone?: string | null; dependente?: boolean | null },
  telefoneCanonico: string | null | undefined,
): EstadoTelefoneMembro {
  if (membro.dependente) return "dependente_nao_sincronizado";
  if (!telefoneCanonico || !soDigitosTelefone(telefoneCanonico)) return "sem_dado_canonico";
  if (membro.telefone && soDigitosTelefone(membro.telefone)) {
    return soDigitosTelefone(membro.telefone) === soDigitosTelefone(telefoneCanonico) ? "ja_sincronizado" : "conflito";
  }
  return "preencher";
}

/** Sinal da Pessoa 360 para telefone — mesmo formato do sinal de CPF. */
export function sinalTelefoneDaPessoaPorCaso(
  membros: {
    case_id?: string | null;
    cliente_id?: string | null;
    telefone?: string | null;
    dependente?: boolean | null;
    origem?: string;
  }[],
  clienteId: string,
  telefoneCanonico: string | null | undefined,
): Record<string, { conflito: number; preencher: number }> {
  const saida: Record<string, { conflito: number; preencher: number }> = {};
  for (const m of membros) {
    if (m.origem === "nucleo" || m.cliente_id !== clienteId || !m.case_id) continue;
    const estado = estadoTelefoneMembroCaso(m, telefoneCanonico);
    if (estado !== "conflito" && estado !== "preencher") continue;
    const alvo = (saida[m.case_id] ??= { conflito: 0, preencher: 0 });
    alvo[estado] += 1;
  }
  return saida;
}

/**
 * P31 (26/09/2026) — pedido direto da Proprietária: "cep conferência será
 * mesmo necessário verificar três vezes o mesmo dado?". Achado real: CEP
 * (e endereço) existem em 3 lugares sem nunca terem sido reconciliados —
 * `clientes.endereco_cep` (canônico), `case_members.cep` (por membro do
 * caso) e o próprio `case_members.endereco` (texto livre). Mesmo padrão
 * exato de `estadoCpfMembroCaso`/`estadoTelefoneMembroCaso`: nunca funde
 * automaticamente, nunca sobrescreve valor já gravado, dependente nunca
 * herda do responsável.
 */
export type EstadoCepMembro =
  | "preencher"
  | "conflito"
  | "ja_sincronizado"
  | "sem_dado_canonico"
  | "dependente_nao_sincronizado";

const soDigitosCep = (s: string) => s.replace(/\D/g, "");

export function estadoCepMembroCaso(
  membro: { cep?: string | null; dependente?: boolean | null },
  cepCanonico: string | null | undefined,
): EstadoCepMembro {
  if (membro.dependente) return "dependente_nao_sincronizado";
  if (!cepCanonico || !soDigitosCep(cepCanonico)) return "sem_dado_canonico";
  if (membro.cep && soDigitosCep(membro.cep)) {
    return soDigitosCep(membro.cep) === soDigitosCep(cepCanonico) ? "ja_sincronizado" : "conflito";
  }
  return "preencher";
}

/** Sinal da Pessoa 360 para CEP — mesmo formato do sinal de CPF/telefone. */
export function sinalCepDaPessoaPorCaso(
  membros: {
    case_id?: string | null;
    cliente_id?: string | null;
    cep?: string | null;
    dependente?: boolean | null;
    origem?: string;
  }[],
  clienteId: string,
  cepCanonico: string | null | undefined,
): Record<string, { conflito: number; preencher: number }> {
  const saida: Record<string, { conflito: number; preencher: number }> = {};
  for (const m of membros) {
    if (m.origem === "nucleo" || m.cliente_id !== clienteId || !m.case_id) continue;
    const estado = estadoCepMembroCaso(m, cepCanonico);
    if (estado !== "conflito" && estado !== "preencher") continue;
    const alvo = (saida[m.case_id] ??= { conflito: 0, preencher: 0 });
    alvo[estado] += 1;
  }
  return saida;
}

/**
 * P32 (26/09/2026) — pedido direto da Proprietária: "verifique quais deles
 * podem ser validados em todos os campos... o que se repete e o que é
 * redundante na pessoa canônica". Achado real (auditoria de código): CPF,
 * telefone e CEP já têm reconciliação `case_members` × `clientes`; email, RG,
 * nacionalidade, data de nascimento, profissão e estado civil NÃO têm —
 * mesmo conceito duplicado em duas tabelas, nunca comparado.
 *
 * Em vez de copiar o padrão `estadoCpfMembroCaso`/`estadoTelefoneMembroCaso`/
 * `estadoCepMembroCaso` mais 6 vezes (exatamente o problema de "forms
 * infinitos" que a Proprietária está apontando), esta é a versão genérica:
 * um único mecanismo, parametrizado pelo campo, usado pelos 6 casos restantes.
 * Os três primeiros (CPF/telefone/CEP) continuam como estão — já testados e
 * em produção; não foram reescritos para não arriscar regressão.
 */
export type CampoCivilReconciliavel =
  | "nome"
  | "email"
  | "rg"
  | "nacionalidade"
  | "data_nascimento"
  | "profissao"
  | "estado_civil"
  | "endereco";

export const CAMPOS_CIVIS_RECONCILIAVEIS: readonly CampoCivilReconciliavel[] = [
  "nome",
  "email",
  "rg",
  "nacionalidade",
  "data_nascimento",
  "profissao",
  "estado_civil",
  "endereco",
];

export const ROTULO_CAMPO_CIVIL: Record<CampoCivilReconciliavel, string> = {
  nome: "Nome",
  email: "E-mail",
  rg: "RG",
  nacionalidade: "Nacionalidade",
  data_nascimento: "Data de nascimento",
  profissao: "Profissão",
  estado_civil: "Estado civil",
  endereco: "Endereço",
};

/** Nome da coluna em `case_members` para cada campo (só "rg" difere do nome canônico). */
export const COLUNA_MEMBRO_CIVIL: Record<CampoCivilReconciliavel, string> = {
  nome: "nome",
  email: "email",
  rg: "rg",
  nacionalidade: "nacionalidade",
  data_nascimento: "data_nascimento",
  profissao: "profissao",
  estado_civil: "estado_civil",
  endereco: "endereco",
};

/**
 * Nome da coluna em `clientes` para cada campo (RG é `rg_numero`, os demais
 * mantêm o nome). "endereco" não tem coluna única — é composto a partir do
 * endereço estruturado (`montarEnderecoCanonico`, ver `caso-canonico.functions.ts`);
 * a entrada aqui é só um placeholder, nunca lida diretamente para esse campo.
 */
export const COLUNA_CLIENTE_CIVIL: Record<CampoCivilReconciliavel, string> = {
  nome: "nome",
  email: "email",
  rg: "rg_numero",
  nacionalidade: "nacionalidade",
  data_nascimento: "data_nascimento",
  profissao: "profissao",
  estado_civil: "estado_civil",
  endereco: "endereco_logradouro",
};

const NORMALIZADOR_CIVIL: Record<CampoCivilReconciliavel, (s: string) => string> = {
  nome: (s) => s.trim().toLowerCase(),
  email: (s) => s.trim().toLowerCase(),
  // RG não tem dígito nacional único (por isso não existe formatarRg); compara
  // por dígitos/letras, ignorando pontuação, espaço e caixa.
  rg: (s) => s.replace(/[^a-z0-9]/gi, "").toLowerCase(),
  nacionalidade: (s) => s.trim().toLowerCase(),
  // Datas vêm do Postgres como string ISO (YYYY-MM-DD ou com hora); os 10
  // primeiros caracteres bastam para comparar só a data, nunca a hora.
  data_nascimento: (s) => s.trim().slice(0, 10),
  profissao: (s) => s.trim().toLowerCase(),
  estado_civil: (s) => s.trim().toLowerCase(),
  endereco: (s) => s.trim().toLowerCase().replace(/\s+/g, " "),
};

export type EstadoCampoCivilMembro =
  | "preencher"
  | "conflito"
  | "ja_sincronizado"
  | "sem_dado_canonico"
  | "dependente_nao_sincronizado";

/** Mesmo mecanismo de estadoCpfMembroCaso/estadoTelefoneMembroCaso/estadoCepMembroCaso, genérico por campo. */
export function estadoCampoCivilMembroCaso(
  campo: CampoCivilReconciliavel,
  membro: { valor?: string | null; dependente?: boolean | null },
  valorCanonico: string | null | undefined,
): EstadoCampoCivilMembro {
  if (membro.dependente) return "dependente_nao_sincronizado";
  const normalizar = NORMALIZADOR_CIVIL[campo];
  const canonico = valorCanonico && String(valorCanonico).trim() ? normalizar(String(valorCanonico)) : "";
  if (!canonico) return "sem_dado_canonico";
  const atual = membro.valor && String(membro.valor).trim() ? normalizar(String(membro.valor)) : "";
  if (atual) return atual === canonico ? "ja_sincronizado" : "conflito";
  return "preencher";
}

/** Sinal da Pessoa 360 para qualquer um dos 6 campos civis — mesmo formato do sinal de CPF/telefone/CEP. */
export function sinalCampoCivilDaPessoaPorCaso(
  campo: CampoCivilReconciliavel,
  membros: {
    case_id?: string | null;
    cliente_id?: string | null;
    dependente?: boolean | null;
    origem?: string;
    [coluna: string]: unknown;
  }[],
  clienteId: string,
  valorCanonico: string | null | undefined,
): Record<string, { conflito: number; preencher: number }> {
  const coluna = COLUNA_MEMBRO_CIVIL[campo];
  const saida: Record<string, { conflito: number; preencher: number }> = {};
  for (const m of membros) {
    if (m.origem === "nucleo" || m.cliente_id !== clienteId || !m.case_id) continue;
    const estado = estadoCampoCivilMembroCaso(campo, { valor: m[coluna] as string | null, dependente: m.dependente }, valorCanonico);
    if (estado !== "conflito" && estado !== "preencher") continue;
    const alvo = (saida[m.case_id] ??= { conflito: 0, preencher: 0 });
    alvo[estado] += 1;
  }
  return saida;
}

/**
 * Perfil genealógico só se vincula a uma Pessoa Canônica que já faz parte
 * do caso (case_members ou núcleo com cliente_id). Nunca por nome.
 */
export function clienteElegivelParaPerfil(
  clienteId: string,
  pessoasDoCaso: { cliente_id?: string | null }[],
): boolean {
  return pessoasDoCaso.some((p) => p.cliente_id === clienteId);
}
