/**
 * Roteiro mestre da Discovery (documentos da Proprietária de 10–11/08/2026:
 * "Bloco Discovery", "Pente-Fino Final", "Auditoria Final do SPIN e Esquema
 * de Campos" e "Adendo — Ficha Piloto"), executado em 27/09/2026.
 *
 * Tronco comum — Abertura → Situação → Problema → Implicação → Necessidade →
 * Fechamento — com extensões curtas por país (2–4 perguntas, só na Situação).
 * As perguntas SPIN continuam em `discovery-roteiro.ts` (`PERGUNTAS_MESA`).
 *
 * Regras que atravessam tudo:
 *   - escuta e organização, nunca pressão: nada de urgência artificial, lei
 *     como argumento, promessa de cidadania, aprovação, prazo ou resultado;
 *   - toda referência jurídica é "a validar por responsável humano e fonte
 *     atualizada"; hipótese de rota nunca é conclusão;
 *   - catálogo/SKU/Planilha Mestre é legado: não entra na call;
 *   - nada disto vai ao App Cliente.
 */
import type { LeadDesk } from "@/lib/crm-desk";

export type Opcao = { valor: string; rotulo: string };

/* ------------------------------------------------------------------ */
/* Abertura                                                            */
/* ------------------------------------------------------------------ */

export const ABERTURA_ROTEIRO: readonly string[] = [
  "Cumprimente pelo nome e agradeça pelo tempo.",
  "Explique: é uma conversa para entender a história da família e ver se podemos ajudar — sem compromisso.",
  "Peça os consentimentos abaixo, um de cada vez (contato, dados, gravação e documentos).",
  "Deixe claro: hoje é escuta e levantamento — não há promessa de resultado, prazo ou aprovação.",
];

/** Os quatro consentimentos são separados — "consentimento lido" não é prova universal. */
export type TipoConsentimento = "contato" | "dados" | "gravacao" | "documentos";
export const CONSENTIMENTOS: readonly { tipo: TipoConsentimento; rotulo: string; cobre: string }[] = [
  { tipo: "contato", rotulo: "Contato", cobre: "Autorização para manter comunicação." },
  { tipo: "dados", rotulo: "Armazenamento e uso de dados", cobre: "Guardar e usar os dados desta conversa (LGPD)." },
  { tipo: "gravacao", rotulo: "Gravação e transcrição", cobre: "Gravar a call e transcrever/varrer a conversa." },
  {
    tipo: "documentos",
    rotulo: "Recebimento e compartilhamento de documentos",
    cobre: "Enviar e receber documentos da família.",
  },
];
export const RESPOSTAS_CONSENTIMENTO: Opcao[] = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "nao", rotulo: "Não" },
  { valor: "parcial", rotulo: "Parcial" },
];

/* ------------------------------------------------------------------ */
/* Extensões por país — 2 a 4 perguntas na Situação                    */
/* ------------------------------------------------------------------ */

export type ExtensaoPais = {
  pais: string;
  rotulo: string;
  perguntas: readonly { id: string; pergunta: string }[];
  /** Contexto interno, sempre "a validar"; nunca lido como regra conclusiva. */
  contexto: string;
  pendenteValidacao?: boolean;
};

const A_VALIDAR = "A validar por responsável humano e fonte atualizada.";

export const EXTENSOES_PAIS: readonly ExtensaoPais[] = [
  {
    pais: "italia",
    rotulo: "Itália",
    perguntas: [
      { id: "linha", pergunta: "A linha é paterna ou materna?" },
      { id: "emigracao", pergunta: "Sabe o ano em que o ancestral emigrou?" },
      { id: "naturalizacao", pergunta: "Ele se naturalizou brasileiro? Sabe quando?" },
      { id: "registro", pergunta: "Alguém já tem codice fiscale ou registro consular?" },
    ],
    contexto: `Descendência sem limite fixo de gerações em leitura histórica. ${A_VALIDAR}`,
  },
  {
    pais: "portugal",
    rotulo: "Portugal",
    perguntas: [
      { id: "via", pergunta: "A ligação é por descendência direta ou por outra via familiar?" },
      { id: "certidoes", pergunta: "Tem certidões portuguesas de algum ascendente?" },
      { id: "consular", pergunta: "Alguém da família já tem registro consular?" },
    ],
    contexto: A_VALIDAR,
  },
  {
    pais: "espanha",
    rotulo: "Espanha",
    perguntas: [
      { id: "via", pergunta: "O interesse vem de um ascendente espanhol direto? Sabe a geração?" },
      { id: "certidoes", pergunta: "Tem certidões espanholas de algum ascendente?" },
    ],
    contexto: `Janelas legais mudam. ${A_VALIDAR}`,
  },
  {
    pais: "alemanha",
    rotulo: "Alemanha",
    perguntas: [
      { id: "via", pergunta: "Há histórico de perseguição/expatriação na família ou é descendência comum?" },
      { id: "registros", pergunta: "Tem registros alemães ou documentos de naturalização?" },
    ],
    contexto: A_VALIDAR,
  },
  {
    pais: "austria",
    rotulo: "Áustria",
    perguntas: [
      { id: "via", pergunta: "O ascendente saiu da Áustria antes de 1955 em contexto de perseguição?" },
      { id: "casamentos", pergunta: "Tem certidões de casamento das gerações anteriores à sua?" },
    ],
    contexto: A_VALIDAR,
  },
  {
    pais: "polonia",
    rotulo: "Polônia",
    perguntas: [
      { id: "manteve", pergunta: "Sabe se o ascendente manteve a cidadania polonesa?" },
      { id: "documentos", pergunta: "Tem passaporte, registro militar ou certidão polonesa?" },
    ],
    contexto: A_VALIDAR,
  },
  {
    pais: "hungria",
    rotulo: "Hungria",
    perguntas: [
      { id: "geracao", pergunta: "Quem é o ascendente húngaro e em que geração ele está?" },
      { id: "paroquiais", pergunta: "Tem certidões paroquiais ou registros húngaros?" },
    ],
    contexto: A_VALIDAR,
  },
  {
    pais: "luxemburgo",
    rotulo: "Luxemburgo",
    perguntas: [
      { id: "emigracao", pergunta: "Sabe quando o ascendente emigrou de Luxemburgo?" },
      { id: "registros", pergunta: "Tem registros luxemburgueses da família?" },
    ],
    contexto: A_VALIDAR,
  },
  {
    pais: "croacia",
    rotulo: "Croácia",
    perguntas: [
      { id: "ascendente", pergunta: "Quem é o ascendente croata e onde nasceu?" },
      { id: "registros", pergunta: "Tem certidões croatas ou registro consular?" },
    ],
    contexto: `Sem escopo aprovado. ${A_VALIDAR}`,
    pendenteValidacao: true,
  },
  {
    pais: "romenia",
    rotulo: "Romênia",
    perguntas: [
      { id: "ascendente", pergunta: "Quem é o ascendente romeno e em que geração ele está?" },
      { id: "registros", pergunta: "Tem registros romenos da família?" },
    ],
    contexto: `Sem escopo aprovado. ${A_VALIDAR}`,
    pendenteValidacao: true,
  },
];

/** Nacionalidade de interesse (lead) → país da extensão. */
const PAIS_POR_NACIONALIDADE: Record<string, string> = {
  italiana: "italia",
  portuguesa: "portugal",
  espanhola: "espanha",
  alema: "alemanha",
  austriaca: "austria",
  polonesa: "polonia",
};

/** Extensões que se aplicam ao lead: país prioritário + países de interesse. Nunca infere país. */
export function extensoesDoLead(lead: Pick<LeadDesk, "pais_linha_prioritaria" | "nacionalidades_interesse"> | null): ExtensaoPais[] {
  if (!lead) return [];
  const paises = new Set<string>();
  if (lead.pais_linha_prioritaria) paises.add(String(lead.pais_linha_prioritaria));
  for (const n of (lead.nacionalidades_interesse ?? []) as string[]) {
    const p = PAIS_POR_NACIONALIDADE[n];
    if (p) paises.add(p);
  }
  return EXTENSOES_PAIS.filter((e) => paises.has(e.pais));
}

export const idPerguntaExtensao = (pais: string, id: string) => `ext:${pais}:${id}`;

/* ------------------------------------------------------------------ */
/* Resposta narrativa por pergunta                                     */
/* ------------------------------------------------------------------ */

/** De onde veio cada resposta — nunca misturar relato com prova. */
export const ORIGENS_RESPOSTA: Opcao[] = [
  { valor: "relato_call", rotulo: "Relato na call" },
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "documento_visto", rotulo: "Documento visto" },
  { valor: "documento_recebido", rotulo: "Documento recebido" },
  { valor: "a_confirmar", rotulo: "A confirmar" },
];

/* ------------------------------------------------------------------ */
/* Fechamento e pós-call                                               */
/* ------------------------------------------------------------------ */

export const FECHAMENTO_ROTEIRO: readonly string[] = [
  "Resuma o que entendeu, só fatos, sem conclusão jurídica.",
  "Confirme o próximo passo, quem faz e até quando.",
  "Pergunte se algo não ficou claro.",
  "Agradeça pela confiança de compartilhar a história da família.",
];

export const CANAIS_CALL: Opcao[] = [
  { valor: "whatsapp", rotulo: "WhatsApp" },
  { valor: "meet", rotulo: "Meet/vídeo" },
  { valor: "telefone", rotulo: "Telefone" },
  { valor: "presencial", rotulo: "Presencial" },
  { valor: "outro", rotulo: "Outro" },
];
export const MATURIDADES: Opcao[] = [
  { valor: "explorando", rotulo: "Explorando" },
  { valor: "comparando", rotulo: "Comparando" },
  { valor: "decidido", rotulo: "Decidido" },
];
export const URGENCIAS: Opcao[] = [
  { valor: "baixa", rotulo: "Baixa" },
  { valor: "media", rotulo: "Média" },
  { valor: "alta", rotulo: "Alta" },
];
export const PRECISA_PROPOSTA: Opcao[] = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "nao", rotulo: "Não" },
  { valor: "ainda_nao", rotulo: "Ainda não" },
];
export const SIM_NAO: Opcao[] = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "nao", rotulo: "Não" },
];
/** Substitui "Via jurídica identificada": sempre hipótese, nunca conclusão. */
export const HIPOTESES_ROTA: Opcao[] = [
  { valor: "nao_definida", rotulo: "Não definida" },
  { valor: "em_levantamento", rotulo: "Em levantamento" },
  { valor: "depende_de_evidencias", rotulo: "Depende de evidências" },
  { valor: "revisao_humana_necessaria", rotulo: "Revisão humana necessária" },
  { valor: "escopo_nao_aplicavel", rotulo: "Escopo não aplicável" },
];
export const DECISOES_POS_CALL: Opcao[] = [
  { valor: "qualificar", rotulo: "Qualificar" },
  { valor: "proposta", rotulo: "Preparar proposta" },
  { valor: "pausar", rotulo: "Pausar" },
  { valor: "descartar", rotulo: "Descartar" },
];

export type PosCall = {
  canal: string | null;
  participantes: string | null;
  linha_investigada: string | null;
  maturidade: string | null;
  urgencia: string | null;
  hipotese_rota: string | null;
  precisa_proposta: string | null;
  proposta_enviada: string | null;
  diagnostico_solicitado: string | null;
  diagnostico_entregue: string | null;
  diagnostico_entregue_em: string | null;
  decisao: string | null;
  lacunas: string | null;
  restricoes_app: string | null;
};

export const CAMPOS_POS_CALL: readonly (keyof PosCall)[] = [
  "canal",
  "participantes",
  "linha_investigada",
  "maturidade",
  "urgencia",
  "hipotese_rota",
  "precisa_proposta",
  "proposta_enviada",
  "diagnostico_solicitado",
  "diagnostico_entregue",
  "diagnostico_entregue_em",
  "decisao",
  "lacunas",
  "restricoes_app",
];

const VOCAB_POS_CALL: Partial<Record<keyof PosCall, Opcao[]>> = {
  canal: CANAIS_CALL,
  maturidade: MATURIDADES,
  urgencia: URGENCIAS,
  hipotese_rota: HIPOTESES_ROTA,
  precisa_proposta: PRECISA_PROPOSTA,
  proposta_enviada: SIM_NAO,
  diagnostico_solicitado: SIM_NAO,
  diagnostico_entregue: SIM_NAO,
  decisao: DECISOES_POS_CALL,
};

/** Valida o pós-call contra as listas fechadas; campo livre tem limite de tamanho. */
export function validarPosCall(entrada: Partial<Record<string, unknown>>): { ok: true; valor: Partial<PosCall> } | { ok: false; erro: string } {
  const saida: Partial<PosCall> = {};
  for (const [chave, bruto] of Object.entries(entrada)) {
    if (!(CAMPOS_POS_CALL as readonly string[]).includes(chave)) return { ok: false, erro: `Campo do pós-call desconhecido: ${chave}.` };
    const k = chave as keyof PosCall;
    const v = bruto == null ? "" : String(bruto).trim();
    if (!v) {
      saida[k] = null;
      continue;
    }
    const vocab = VOCAB_POS_CALL[k];
    if (vocab && !vocab.some((o) => o.valor === v)) return { ok: false, erro: `Valor fora da lista em ${chave}.` };
    if (k === "diagnostico_entregue_em" && !/^\d{4}-\d{2}-\d{2}/.test(v)) return { ok: false, erro: "Data de entrega do diagnóstico inválida." };
    saida[k] = v.slice(0, 1000);
  }
  return { ok: true, valor: saida };
}

export type PendenciaPosCall = { campo: string; rotulo: string };

/**
 * Pós-call em níveis: nível 1 vale para toda call; nível 2 só quando a call
 * qualificou (decisão "qualificar"/"proposta" ou resultado aderente). Nível 3
 * é do caso (depois do case_id) e não mora aqui. Pendência informa, não trava.
 */
export function pendenciasPosCall(
  lead: LeadDesk,
  pos: Partial<PosCall>,
  consentimentos: Partial<Record<TipoConsentimento, string | null>>,
): { nivel1: PendenciaPosCall[]; nivel2: PendenciaPosCall[]; qualificada: boolean } {
  const vazio = (v: unknown) => v == null || String(v).trim() === "" || (Array.isArray(v) && v.length === 0);
  const l = lead as unknown as Record<string, unknown>;
  const n1: [boolean, string, string][] = [
    [vazio(l.call_realizada_em), "call_realizada_em", "Data da call"],
    [vazio(pos.canal), "canal", "Canal"],
    [vazio(pos.participantes), "participantes", "Participantes"],
    [vazio(l.responsavel_nome), "responsavel_nome", "Responsável"],
    [vazio(l.resumo_call), "resumo_call", "Resumo factual"],
    [vazio(l.objetivo), "objetivo", "Objetivo declarado"],
    [vazio(l.proxima_acao), "proxima_acao", "Próximo passo"],
    [vazio(l.proxima_acao_em), "proxima_acao_em", "Prazo do próximo passo"],
    [vazio(l.eixo_comercial), "eixo_comercial", "Estágio no CRM"],
    [vazio(consentimentos.dados), "consentimento_dados", "Consentimento de uso de dados"],
  ];
  const qualificada = pos.decisao === "qualificar" || pos.decisao === "proposta" || l.discovery_resultado === "aderente";
  const n2: [boolean, string, string][] = [
    [vazio(l.pais_linha_prioritaria) && vazio(l.nacionalidades_interesse), "pais", "País/linha"],
    [vazio(pos.linha_investigada), "linha_investigada", "Linha investigada (sobrenome/ancestral)"],
    [vazio(l.documentos_chave) && vazio(l.estado_documental_inicial), "documentos", "Documentos disponíveis"],
    [vazio(pos.lacunas), "lacunas", "Lacunas, dúvidas e bloqueadores"],
    [vazio(pos.maturidade), "maturidade", "Maturidade"],
    [vazio(pos.urgencia), "urgencia", "Urgência declarada"],
    [vazio(pos.hipotese_rota), "hipotese_rota", "Hipótese de rota"],
    [vazio(pos.precisa_proposta), "precisa_proposta", "Precisa de proposta?"],
    [vazio(pos.decisao), "decisao", "Decisão pós-call"],
    [vazio(pos.restricoes_app), "restricoes_app", "Restrições de exposição ao App"],
  ];
  const faltando = (xs: [boolean, string, string][]) => xs.filter(([f]) => f).map(([, campo, rotulo]) => ({ campo, rotulo }));
  return { nivel1: faltando(n1), nivel2: qualificada ? faltando(n2) : [], qualificada };
}
