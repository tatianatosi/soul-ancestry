/**
 * Clientes — classificação de pessoas e elegibilidade de perfil de cliente.
 *
 * Regras (espelho das travas do banco, `fn_cliente_classificacao_guard`):
 * - só é cliente ativo quem tem contrato assinado, pagamento inicial confirmado
 *   e decisão humana de ativação registrada;
 * - aceite verbal, confirmação formal e formalização permanecem pré-cliente;
 * - participante de núcleo familiar não vira cliente independente;
 * - demonstrações ficam fora das listas e métricas reais por padrão.
 */

export type Classificacao = "pre_cliente" | "cliente_ativo" | "participante_familiar";

export const CLASSIFICACOES: { valor: Classificacao; rotulo: string }[] = [
  { valor: "cliente_ativo", rotulo: "Cliente ativo" },
  { valor: "pre_cliente", rotulo: "Pré-cliente" },
  { valor: "participante_familiar", rotulo: "Participante familiar" },
];

export function rotuloClassificacao(valor: unknown): string {
  return CLASSIFICACOES.find((c) => c.valor === valor)?.rotulo ?? "—";
}

/** Países atendidos — valor controlado, sem duplicidade por grafia. */
export const PAISES = [
  "Áustria",
  "Itália",
  "Portugal",
  "Espanha",
  "Alemanha",
  "Polônia",
  "Hungria",
  "Romênia",
  "Lituânia",
];

/** Origem do relacionamento (nunca status comercial). */
export const ORIGENS = [
  { valor: "planejador", rotulo: "Planejador / parceiro" },
  { valor: "indicacao", rotulo: "Indicação" },
  { valor: "site", rotulo: "Site" },
  { valor: "evento", rotulo: "Evento" },
  { valor: "redes_sociais", rotulo: "Redes sociais" },
  { valor: "base_historica", rotulo: "Base histórica" },
];

/** Status comercial — eixo distinto da origem. */
export const STATUS_COMERCIAL = [
  { valor: "lead", rotulo: "Lead" },
  { valor: "oportunidade", rotulo: "Oportunidade" },
  { valor: "proposta_enviada", rotulo: "Proposta enviada" },
  { valor: "aceite_verbal", rotulo: "Aceite verbal" },
  { valor: "proposta_aprovada", rotulo: "Confirmação formal recebida" },
  { valor: "em_formalizacao", rotulo: "Em formalização" },
  { valor: "contratado", rotulo: "Contratado" },
];

export function rotuloDe(lista: { valor: string; rotulo: string }[], valor: unknown): string {
  const v = typeof valor === "string" ? valor : "";
  return lista.find((i) => i.valor === v)?.rotulo ?? (v || "—");
}

export type Participacao = { nucleo: string | null; papel: string | null };

export type PessoaLista = {
  id: string;
  nome: string;
  nome_social: string | null;
  email: string | null;
  telefone: string | null;
  origem: string | null;
  status_comercial: string | null;
  pais_interesse: string | null;
  status: string;
  classificacao: Classificacao;
  is_demo: boolean;
  archived_at: string | null;
  archive_motivo: string | null;
  ativacao_decidida_em: string | null;
  ativacao_justificativa: string | null;
  /** Condições objetivas verificadas no servidor. */
  contratoAssinado: boolean;
  pagamentoConfirmado: boolean;
  participacoes: Participacao[];
  /** Quantidade de casos em que a pessoa figura como titular do caso. */
  casosVinculados?: number;
};

/**
 * Camadas de registro — evitam tratar cadastro, perfil de cliente, participação
 * em caso e pertencimento a núcleo familiar como a mesma coisa.
 */
export type Camada = "pessoa" | "client_profile" | "case_member" | "family_nucleus";

export const CAMADAS: { valor: Camada; rotulo: string; descricao: string }[] = [
  {
    valor: "pessoa",
    rotulo: "Pessoa (cadastro)",
    descricao: "Cadastro de pessoa sem caso e sem núcleo familiar. Não é cliente.",
  },
  {
    valor: "client_profile",
    rotulo: "Perfil de cliente",
    descricao: "Perfil de cliente ativo, com contrato assinado, pagamento confirmado e decisão humana registrada.",
  },
  {
    valor: "case_member",
    rotulo: "Participante de caso",
    descricao: "Pessoa vinculada a um caso em andamento ou em formalização. Ainda não é cliente ativo.",
  },
  {
    valor: "family_nucleus",
    rotulo: "Membro de núcleo familiar",
    descricao: "Beneficiário ou membro do núcleo. Tratado em Núcleos e dossiês, nunca como cliente independente.",
  },
];

export function rotuloCamada(valor: Camada): string {
  return CAMADAS.find((c) => c.valor === valor)?.rotulo ?? "—";
}

export function descricaoCamada(valor: Camada): string {
  return CAMADAS.find((c) => c.valor === valor)?.descricao ?? "";
}

/** Deriva a camada do registro a partir da classificação e dos vínculos reais. */
export function camadaDoRegistro(p: PessoaLista): Camada {
  if (p.classificacao === "participante_familiar" || p.participacoes.length > 0) return "family_nucleus";
  if (p.classificacao === "cliente_ativo") return "client_profile";
  if ((p.casosVinculados ?? 0) > 0) return "case_member";
  return "pessoa";
}

/** Status comerciais que mantêm a pessoa como pré-cliente (promoção automática proibida). */
export const STATUS_PRE_CLIENTE = [
  "lead",
  "oportunidade",
  "proposta_enviada",
  "aceite_verbal",
  "proposta_aprovada",
  "em_formalizacao",
] as const;

export function emFormalizacaoOuPre(p: PessoaLista): boolean {
  const s = typeof p.status_comercial === "string" ? p.status_comercial : "";
  return (STATUS_PRE_CLIENTE as readonly string[]).includes(s) || s === "";
}

export type Filtros = {
  estado: "ativos" | "suspensos" | "encerrados" | "arquivados";
  incluirPreClientes: boolean;
  incluirParticipantes: boolean;
  incluirDemonstracoes: boolean;
};

export const FILTROS_PADRAO: Filtros = {
  estado: "ativos",
  incluirPreClientes: false,
  incluirParticipantes: false,
  incluirDemonstracoes: false,
};

/** Grafia canônica de país — evita alternância Austria/Áustria nas listas. */
const PAIS_CANONICO: Record<string, string> = {
  austria: "Áustria",
  italia: "Itália",
  polonia: "Polônia",
  romenia: "Romênia",
  lituania: "Lituânia",
  hungria: "Hungria",
  espanha: "Espanha",
  portugal: "Portugal",
  alemanha: "Alemanha",
};

export function normalizarPais(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.trim()) return null;
  const bruto = valor.trim();
  const chave = bruto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return PAIS_CANONICO[chave] ?? bruto;
}

/** Onde o registro deve ser tratado enquanto não for cliente ativo. */
export function destinoDoRegistro(p: PessoaLista): string {
  if (p.is_demo) return "Registro de demonstração — fora das listas e métricas reais.";
  if (p.classificacao === "participante_familiar")
    return "Beneficiário/membro do núcleo — tratar em Núcleos e dossiês.";
  if (p.classificacao === "pre_cliente")
    return "Lead + caso em formalização — ainda não é cliente ativo.";
  return "Cliente ativo.";
}


const ESTADO_ALVO: Record<Filtros["estado"], string> = {
  ativos: "ativo",
  suspensos: "suspenso",
  encerrados: "encerrado",
  arquivados: "arquivado",
};

/** Lista principal: apenas perfis elegíveis; pré-clientes e demos entram só por opção explícita. */
export function filtrarClientes(pessoas: PessoaLista[], filtros: Filtros): PessoaLista[] {
  return pessoas.filter((p) => {
    if (p.is_demo && !filtros.incluirDemonstracoes) return false;
    if (filtros.estado === "arquivados") return Boolean(p.archived_at);
    if (p.archived_at) return false;
    if (p.classificacao === "participante_familiar") return false;
    if (p.classificacao === "pre_cliente") {
      return filtros.incluirPreClientes && filtros.estado === "ativos";
    }
    return p.status === ESTADO_ALVO[filtros.estado];
  });
}

/** Participantes de núcleo — nunca aparecem como clientes independentes. */
export function participantesDeNucleo(pessoas: PessoaLista[], incluirDemos: boolean): PessoaLista[] {
  return pessoas.filter(
    (p) => !p.archived_at && p.classificacao === "participante_familiar" && (incluirDemos || !p.is_demo),
  );
}

export type Elegibilidade = { apto: boolean; pendencias: string[]; camada: Camada };

/**
 * Condições objetivas para promover a cliente ativo (decisão humana continua obrigatória).
 * Bloqueio automático: pessoa sem caso, membro de núcleo, e qualquer pessoa em
 * formalização ou em estágio de pré-cliente nunca podem ser promovidas aqui.
 */
export function elegibilidadeAtivacao(p: PessoaLista): Elegibilidade {
  const pendencias: string[] = [];
  const camada = camadaDoRegistro(p);

  if (camada === "family_nucleus")
    pendencias.push("Membro de núcleo familiar não vira cliente independente — tratar em Núcleos e dossiês.");
  if (camada === "pessoa") pendencias.push("Cadastro de pessoa sem caso vinculado — abra o caso antes de ativar.");
  if (emFormalizacaoOuPre(p))
    pendencias.push(
      `Registro em ${rotuloDe(STATUS_COMERCIAL, p.status_comercial) || "estágio de pré-cliente"} — promoção a cliente ativo bloqueada até a contratação.`,
    );
  if (!p.contratoAssinado) pendencias.push("Contrato assinado não registrado.");
  if (!p.pagamentoConfirmado) pendencias.push("Pagamento inicial não confirmado.");
  if (p.archived_at) pendencias.push("Cadastro arquivado.");
  return { apto: pendencias.length === 0, pendencias, camada };
}
