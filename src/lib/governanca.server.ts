/**
 * Governança e Biblioteca — vocabulário e regras compartilhadas.
 *
 * Nada aqui faz IO: são rótulos, ordenações e validações puras usadas tanto
 * pelas funções de servidor quanto pela tela "Manifesto de Resgate".
 */

export const STATUS_RECUPERACAO = {
  LOCALIZADO_E_USAVEL: "Localizado e usável",
  LOCALIZADO_MAS_DOCUMENTAL: "Localizado, mas documental",
  LOCALIZADO_COM_CONFLITO: "Localizado com conflito",
  HISTORICO_OU_BACKUP: "Histórico ou backup",
  NAO_LOCALIZADO: "Não localizado",
} as const;

export type StatusRecuperacao = keyof typeof STATUS_RECUPERACAO;

export const ORDEM_STATUS_RECUPERACAO: StatusRecuperacao[] = [
  "NAO_LOCALIZADO",
  "LOCALIZADO_COM_CONFLITO",
  "LOCALIZADO_MAS_DOCUMENTAL",
  "HISTORICO_OU_BACKUP",
  "LOCALIZADO_E_USAVEL",
];

export const TOM_STATUS_RECUPERACAO: Record<StatusRecuperacao, string> = {
  LOCALIZADO_E_USAVEL: "border-emerald-600/30 bg-emerald-50 text-emerald-800",
  LOCALIZADO_MAS_DOCUMENTAL: "border-navy/20 bg-cream text-navy",
  LOCALIZADO_COM_CONFLITO: "border-amber-600/30 bg-amber-50 text-amber-800",
  HISTORICO_OU_BACKUP: "border-sky-600/30 bg-sky-50 text-sky-800",
  NAO_LOCALIZADO: "border-red-600/30 bg-red-50 text-red-800",
};

export const STATUS_CONHECIMENTO = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  publicado: "Publicado",
  obsoleto: "Obsoleto",
  arquivado: "Arquivado",
} as const;

export const TIPOS_CONHECIMENTO = {
  documento: "Documento",
  playbook: "Playbook",
  especificacao: "Especificação",
  relatorio: "Relatório",
  manual: "Manual",
  modelo: "Modelo",
  registro: "Registro",
  outro: "Outro",
} as const;

export const STATUS_DECISAO = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  publicada: "Publicada",
  substituida: "Substituída",
  revogada: "Revogada",
  arquivada: "Arquivada",
} as const;

export const NIVEIS_ACESSO = {
  interno_restrito: "Interno restrito",
  equipe: "Equipe",
  lideranca: "Liderança",
  cliente_quando_liberado: "Cliente quando liberado",
} as const;

export const DOMINIOS = [
  "governanca",
  "operacao",
  "comercial",
  "contratos",
  "financeiro",
  "pesquisa",
  "privacidade",
  "produto",
] as const;

/** Papéis autorizados a escrever na biblioteca. */
export const PAPEIS_ESCRITA_BIBLIOTECA = ["admin", "operacoes", "pesquisador", "comercial", "financeiro"];

export function podeEscreverBiblioteca(papel: string | null | undefined) {
  return !!papel && PAPEIS_ESCRITA_BIBLIOTECA.includes(papel);
}

/** Espelha a trava do banco: decisão publicada precisa estar completa. */
export function pendenciasDecisao(d: {
  contexto?: string | null;
  decisao?: string | null;
  impacto?: string | null;
  responsavel_nome?: string | null;
  responsavel_user_id?: string | null;
  data_decisao?: string | null;
}): string[] {
  const faltando: string[] = [];
  if (!d.contexto?.trim()) faltando.push("contexto");
  if (!d.decisao?.trim()) faltando.push("decisão tomada");
  if (!d.impacto?.trim()) faltando.push("impacto");
  if (!d.responsavel_nome?.trim() && !d.responsavel_user_id) faltando.push("responsável");
  if (!d.data_decisao) faltando.push("data da decisão");
  return faltando;
}

/** Espelha a trava do banco para arquivamento de artefatos. */
export function pendenciasArquivamentoArtefato(entrada: {
  status_recuperacao: string;
  sucessor_id?: string | null;
  motivo?: string | null;
  ehAdmin: boolean;
}): string[] {
  const faltando: string[] = [];
  const motivo = entrada.motivo?.trim() ?? "";
  if (!entrada.sucessor_id && !motivo) faltando.push("sucessor ou motivo");
  if (entrada.status_recuperacao === "NAO_LOCALIZADO") {
    if (!entrada.ehAdmin) faltando.push("aprovação de admin");
  }
  return faltando;
}

export type ResumoManifesto = {
  total: number;
  porStatus: Record<string, number>;
  lacunas: number;
  criticos: number;
};

export function resumirManifesto(itens: Array<{ status_recuperacao: string; lacuna?: string | null }>): ResumoManifesto {
  const porStatus: Record<string, number> = {};
  for (const s of ORDEM_STATUS_RECUPERACAO) porStatus[s] = 0;
  let lacunas = 0;
  for (const i of itens) {
    porStatus[i.status_recuperacao] = (porStatus[i.status_recuperacao] ?? 0) + 1;
    if (i.lacuna?.trim()) lacunas += 1;
  }
  return {
    total: itens.length,
    porStatus,
    lacunas,
    criticos: (porStatus["NAO_LOCALIZADO"] ?? 0) + (porStatus["LOCALIZADO_COM_CONFLITO"] ?? 0),
  };
}
